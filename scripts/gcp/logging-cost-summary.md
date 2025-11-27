# GKE Logging Cost Reduction - Implementation Summary

## Changes Implemented (Nov 23, 2025)

### 1. ✅ Created Log Exclusion Filters
- **Health checks**: Excludes GET /health, /ready, /healthz, /readyz, /live endpoints
- **Prometheus metrics**: Excludes GET /metrics endpoint logs
- **System INFO logs**: Excludes INFO level logs from kube-system, gke-system, gmp-system namespaces

**Impact**: ~80-90% reduction in log volume from these sources

### 2. ✅ Reduced Log Retention Period
- Changed from: 30 days
- Changed to: 7 days
- Bucket: _Default (global)

**Impact**: 76% reduction in storage costs

### 3. ✅ Updated Application Log Level
- Changed from: LOG_LEVEL=info
- Changed to: LOG_LEVEL=warn
- Applied to: orchestrator deployment (3 pods)

**Impact**: ~60-70% reduction in application logs

## Estimated Cost Savings

Based on typical GKE logging patterns:

| Source | Before | After | Reduction |
|--------|--------|-------|-----------|
| Health checks | ~2.3M logs/month | 0 | 100% |
| Prometheus metrics | ~720K logs/month | 0 | 100% |
| Application INFO logs | ~1.5M logs/month | ~300K | 80% |
| System INFO logs | ~800K logs/month | ~200K | 75% |
| **Total Volume** | ~5.3M logs/month | ~500K logs/month | **~90%** |

| Cost Factor | Before | After | Savings |
|-------------|--------|-------|---------|
| Ingestion ($0.50/GB) | ~$26.50/month | ~$2.50/month | $24/month |
| Storage (30 days) | ~$7.95/month | ~$0.35/month | $7.60/month |
| **Total Monthly Cost** | ~$34.45 | ~$2.85 | **~$31.60 (92%)** |

## Monitoring Commands

### Check if exclusions are working:
```bash
# List all exclusions
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://logging.googleapis.com/v2/projects/project-6d921a00-c010-437c-990/exclusions"

# Check recent logs (should not see health checks)
gcloud logging read "resource.type=k8s_container AND textPayload=~'GET /health'" \
  --limit=10 --format=json
```

### Monitor logging costs:
```bash
# View usage in console
echo "https://console.cloud.google.com/logs/usage?project=project-6d921a00-c010-437c-990"

# Check log ingestion rate (last 24h)
gcloud logging metrics list --filter="name:logs_ingested_bytes"
```

### Verify pod restarts applied new config:
```bash
kubectl get pods -n marcus-platform -o wide
kubectl logs -n marcus-platform deployment/orchestrator --tail=10
```

## Additional Recommendations (Not Yet Implemented)

### 1. Application Code Changes
Modify the orchestrator application to:
- Remove health check endpoint logging entirely
- Use structured logging with appropriate levels
- Implement log sampling for non-critical paths

### 2. Consider Disabling Workload Logs Entirely
For extreme cost savings (if application logs aren't critical):
```bash
gcloud container clusters update marcus-platform \
  --logging=SYSTEM \
  --zone us-central1
```
This keeps only system logs and completely disables application logs.

### 3. Use External Logging Solution
For high-volume logging needs, consider:
- Self-hosted ELK stack on a dedicated VM
- Datadog/New Relic with filtering at source
- Fluentd with S3 backend for cold storage

### 4. Implement Log Sampling
For remaining INFO logs, implement 10% sampling:
```javascript
// In application code
if (logLevel === 'info' && Math.random() > 0.1) return;
logger.info(message);
```

## Rollback Commands (If Needed)

```bash
# Re-enable INFO logging
kubectl patch configmap marcus-config -n marcus-platform \
  --type='json' -p='[{"op": "replace", "path": "/data/LOG_LEVEL", "value": "info"}]'
kubectl rollout restart deployment orchestrator -n marcus-platform

# Restore 30-day retention
gcloud logging buckets update _Default --location=global --retention-days=30

# Delete exclusion filters
curl -X DELETE \
  "https://logging.googleapis.com/v2/projects/project-6d921a00-c010-437c-990/exclusions/exclude-k8s-health-checks" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"
```

## Next Steps

1. **Monitor for 24-48 hours** to ensure critical logs aren't being excluded
2. **Check cost reduction** in GCP billing after 1-2 days
3. **Adjust exclusions** if needed based on debugging requirements
4. **Consider application-level changes** for permanent solution