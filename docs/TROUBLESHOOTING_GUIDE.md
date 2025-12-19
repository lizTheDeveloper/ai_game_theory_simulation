# MARCUS 3.1 - Troubleshooting Guide

**Platform Engineering Runbook for Common Issues**

This guide provides diagnosis and resolution procedures for common MARCUS platform issues discovered during GKE deployment.

---

## Quick Diagnosis Commands

```bash
# Platform health overview
kubectl get pods -n marcus
kubectl top pods -n marcus
kubectl get hpa -n marcus
curl https://api.marcus.example.com/health

# Recent errors
kubectl logs -n marcus -l app=marcus-orchestrator --tail=100 | grep ERROR

# Metrics snapshot
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep -E 'marcus_(errors|http_request_duration|agent_status)'
```

---

## Agent Issues

### Agent Process Zombies (CRITICAL-2 Fix)

**Symptoms:**
- Memory usage increasing over time
- Process registry shows stale PIDs
- Agent count mismatch (orchestrator thinks agents running, but they're dead)

**Diagnosis:**
```bash
# Check process registry
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:8080/api/agents | jq '.agents[] | select(.isHealthy == false)'

# Check for zombie processes
kubectl exec -it deploy/orchestrator -n marcus -- ps aux | grep python | grep Z
```

**Root Cause:** ProcessRegistry not tracking agent lifecycle correctly (CRITICAL-2 regression from Nov 2025).

**Resolution:**
```bash
# Immediate: Restart orchestrator pod
kubectl delete pods -n marcus -l app=marcus-orchestrator

# Long-term: Verify ProcessRegistry integration
# File: src/platform/integration/citationAgentIntegration.ts
# Lines 194, 265, 467, 483, 504 - ProcessRegistry calls
```

**Prevention:**
- ProcessRegistry auto-cleanup runs every 60s
- Health checks mark processes alive every 10s
- Graceful shutdown unregisters processes

---

### Agent Crashes After Restart

**Symptoms:**
- Agent pods crash loop
- Logs show: `Agent script not found: /path/to/agent.py`

**Diagnosis:**
```bash
# Check agent pod logs
kubectl logs -n marcus POD_NAME

# Verify agent script path
kubectl exec -it deploy/orchestrator -n marcus -- ls -la /agents/
```

**Root Cause:** Agent script path mismatch or missing volume mount.

**Resolution:**
```bash
# Verify configmap has correct path
kubectl get configmap platform-config -n marcus -o yaml | grep agentScriptPath

# Update if needed
kubectl patch configmap platform-config -n marcus --patch '{"data":{"agentScriptPath":"/agents/citation_integrity_agent.py"}}'

# Restart orchestrator
kubectl rollout restart deployment/orchestrator -n marcus
```

---

## Database Issues

### Connection Pool Exhausted

**Symptoms:**
- Errors: `Error: Connection timeout - pool exhausted`
- Metrics: `marcus_db_pool_waiting > 10`

**Diagnosis:**
```bash
# Check pool metrics
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_db_pool

# Check PostgreSQL connections
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -c "SELECT count(*) FROM pg_stat_activity WHERE datname='citations';"
```

**Root Cause:** Too many concurrent requests, pool size too small.

**Resolution:**
```bash
# Increase pool size
kubectl set env deployment/orchestrator -n marcus DB_POOL_SIZE=30

# Or scale PostgreSQL vertically
kubectl patch statefulset postgres -n marcus --patch '
spec:
  template:
    spec:
      containers:
      - name: postgres
        resources:
          limits:
            memory: "4Gi"
            cpu: "2000m"
'

# Monitor pool usage
watch -n 5 'kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_db_pool_size'
```

---

### State Synchronization Conflicts (H2 Fix)

**Symptoms:**
- Errors: `❌ CRITICAL: Version conflict for agent agent_XXX`
- Metrics: `marcus_lock_contention_total{result="failed"}` increasing

**Diagnosis:**
```bash
# Check lock contention
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_lock_contention

# Check orchestrator replica count
kubectl get deployment orchestrator -n marcus
```

**Root Cause:** Multiple orchestrator pods updating same agent state concurrently (H2 regression).

**Resolution:**
- **CRITICAL FIX ALREADY DEPLOYED:** Dual-layer locking (distributed lock + optimistic versioning)
- File: `src/platform/integration/citationAgentIntegration.ts` lines 569-645

**Verify fix:**
```bash
# Check if distributed locking is working
kubectl exec -it redis-0 -n marcus -- redis-cli KEYS "lock:agent:*:state"
# Should show active locks during state updates

# Check version conflicts (should be 0)
kubectl logs -n marcus -l app=marcus-orchestrator | grep "Version conflict"
```

---

## Redis Issues

### Redis Connection Pool Exhausted (H1 Fix)

**Symptoms:**
- Errors: `MaxRetriesPerRequestError`
- High latency on cache operations

**Diagnosis:**
```bash
# Check Redis pool metrics
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep redis_pool

# Check Redis client connections
kubectl exec -it redis-0 -n marcus -- redis-cli CLIENT LIST | wc -l
```

**Root Cause:** Dedicated Redis clients per component (pre-H1 architecture).

**Resolution:**
- **CRITICAL FIX ALREADY DEPLOYED:** Shared RedisConnectionPool
- File: `src/platform/utils/redisPool.ts`
- Pool size: 20 connections (configurable via `REDIS_POOL_SIZE`)

**Verify fix:**
```bash
# Check pool is being used
kubectl logs -n marcus -l app=marcus-orchestrator | grep "Redis connection pool initialized"
# Expected: "✅ Redis connection pool initialized (20 connections)"

# Monitor pool usage
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep redis_pool_active
```

---

### Redis Cluster Failover

**Symptoms:**
- Intermittent `ECONNREFUSED` errors
- Cache miss ratio spikes to 100%

**Diagnosis:**
```bash
# Check Redis pod status
kubectl get pods -n marcus -l app=redis

# Check Redis logs
kubectl logs -n marcus redis-0 --tail=50
```

**Root Cause:** Redis pod restarted, clients didn't reconnect.

**Resolution:**
```bash
# RedisConnectionPool auto-reconnects (enableOfflineQueue: true)
# Check reconnection logs
kubectl logs -n marcus -l app=marcus-orchestrator | grep "Redis reconnected"

# Manual restart if needed
kubectl rollout restart deployment/orchestrator -n marcus
```

---

## Rate Limiting Issues

### Cloud Armor Rate Limits Too Aggressive

**Symptoms:**
- Legitimate requests getting 429 errors
- Metrics: `marcus_http_requests_total{status_code="429"}` increasing

**Diagnosis:**
```bash
# Check rate limit counters
kubectl logs -n marcus -l app=ingress-controller | grep "rate limit exceeded"

# Check Cloud Armor policy
gcloud compute security-policies describe marcus-security-policy --format=yaml
```

**Root Cause:** Cloud Armor rate limits too low for production traffic.

**Resolution:**
```bash
# Update Cloud Armor policy
kubectl patch configmap cloudarmor-policy -n marcus --patch '
data:
  rateLimitThreshold: "200"  # Increase from 100 to 200
'

# Apply updated policy
kubectl apply -f k8s/cloudarmor-policy.yaml

# Verify new limits
gcloud compute security-policies describe marcus-security-policy --format="get(rules[0].rateLimitOptions.rateLimitThreshold)"
```

---

## Performance Issues

### High P95 Latency (>500ms)

**Symptoms:**
- Alert: `HighP95Latency` fires
- User complaints about slow responses

**Diagnosis:**
```bash
# Check P95 latency
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_http_request_duration_seconds

# Check agent latencies
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_agent_request_duration_seconds

# Check HPA status
kubectl get hpa -n marcus
```

**Root Cause Checklist:**
1. **Database slow queries** → Check `pg_stat_activity`
2. **Redis connection pool exhausted** → Check `redis_pool_active`
3. **Agent processes slow** → Check agent logs
4. **High request volume** → Scale HPA

**Resolution:**
```bash
# Scale horizontally if under capacity
kubectl scale deployment orchestrator -n marcus --replicas=5

# Check database slow queries
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC LIMIT 5;"

# Optimize slow queries (add indexes)
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -d citations -c "CREATE INDEX idx_custom ON table_name(column);"
```

---

## Secret Rotation Issues

### JWT Rotation Failures

**Symptoms:**
- CronJob `secret-rotation` shows failed status
- Alert: `SecretRotationJobFailed`

**Diagnosis:**
```bash
# Check failed job logs
FAILED_JOB=$(kubectl get jobs -n marcus -l component=secret-rotation --field-selector status.successful=0 --sort-by=.status.startTime -o jsonpath='{.items[-1].metadata.name}')
kubectl logs job/${FAILED_JOB} -n marcus
```

**Common Causes:**
1. **RBAC permissions missing** → Service account can't update secrets
2. **Slack webhook invalid** → Can't send notifications (non-critical)
3. **kubectl command failed** → Check script syntax

**Resolution:**
```bash
# Verify RBAC
kubectl get rolebinding secret-rotation-binding -n marcus -o yaml

# If RBAC missing, apply
kubectl apply -f k8s/cronjob-secret-rotation.yaml

# Retry rotation manually
kubectl create job --from=cronjob/secret-rotation manual-rotation-$(date +%s) -n marcus

# Watch logs
kubectl logs -f job/manual-rotation-TIMESTAMP -n marcus
```

---

### Clients Using Expired Tokens

**Symptoms:**
- 401 errors spike after JWT rotation
- Metrics: `marcus_errors_total{error_type="auth"}` increasing

**Diagnosis:**
```bash
# Check grace period
kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.rotation-timestamp}' | base64 -d

# Check if previous secret exists
kubectl get secret jwt-secrets -n marcus -o jsonpath='{.data.previous-secret}' | base64 -d
```

**Root Cause:** Grace period too short or previous secret missing.

**Resolution:**
```bash
# Extend grace period (emergency)
kubectl patch configmap rotation-scripts -n marcus --patch '
data:
  JWT_GRACE_PERIOD_DAYS: "14"
'

# Verify dual-secret verification working
kubectl logs -n marcus -l app=marcus-orchestrator | grep "Previous JWT secret used"
# Should show warnings when old tokens used
```

---

## Monitoring Issues

### Metrics Not Appearing in Prometheus

**Symptoms:**
- Grafana dashboards show no data
- Prometheus targets down

**Diagnosis:**
```bash
# Check Prometheus scrape config
kubectl get servicemonitor -n marcus

# Check orchestrator metrics endpoint
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | head -20
```

**Resolution:**
```bash
# Verify service exists
kubectl get service orchestrator-metrics -n marcus

# Verify service selector matches pods
kubectl get pods -n marcus -l app=marcus-orchestrator -o jsonpath='{.items[0].metadata.labels}'
kubectl get service orchestrator-metrics -n marcus -o jsonpath='{.spec.selector}'

# Restart Prometheus to reload config
kubectl rollout restart statefulset/prometheus -n monitoring
```

---

## Network Issues

### Pod-to-Pod Communication Failures

**Symptoms:**
- Errors: `ECONNREFUSED` or `ETIMEDOUT`
- Orchestrator can't reach agents/database/Redis

**Diagnosis:**
```bash
# Check network policies
kubectl get networkpolicies -n marcus

# Test pod-to-pod connectivity
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -n marcus -- ping postgres.marcus.svc.cluster.local

# Check DNS resolution
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -n marcus -- nslookup postgres.marcus.svc.cluster.local
```

**Resolution:**
```bash
# If network policy too restrictive, update
kubectl edit networkpolicy marcus-network-policy -n marcus

# Or delete and recreate
kubectl delete networkpolicy marcus-network-policy -n marcus
kubectl apply -f k8s/network-policy.yaml
```

---

## Common Error Messages

### `❌ CRITICAL: RNG required for deterministic simulation`

**Context:** Python agent code expects RNG function

**Fix:** Ensure agent script receives RNG function (not optional)

---

### `❌ CRITICAL: No agents available - platform unhealthy`

**Context:** All agents failed health checks

**Fix:**
```bash
# Check agent pod status
kubectl get pods -n marcus -l app=marcus-agent

# Restart agent pods
kubectl delete pods -n marcus -l app=marcus-agent
```

---

### `Error: Connection timeout - lock acquisition failed`

**Context:** Distributed lock couldn't be acquired

**Fix:**
```bash
# Check Redis connectivity
kubectl exec -it redis-0 -n marcus -- redis-cli PING

# Check lock contention metrics
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_lock_contention
```

---

## Emergency Procedures

### Platform Down - All Pods CrashLooping

```bash
# 1. Check cluster health
kubectl get nodes
gcloud container clusters describe marcus-cluster --region=us-central1

# 2. Check namespace resources
kubectl get all -n marcus

# 3. Restore from backup (if database corrupted)
gsutil cp gs://marcus-backups/database/backup-LATEST.sql ./
kubectl exec -i postgres-0 -n marcus -- psql -U postgres -d citations < backup-LATEST.sql

# 4. Restart all deployments
kubectl rollout restart deployment/orchestrator -n marcus
kubectl rollout restart deployment/agent -n marcus
```

---

### Complete Database Loss

```bash
# 1. Restore from latest backup
gsutil cp gs://marcus-backups/database/backup-$(date +%Y%m%d-020000).sql ./
kubectl exec -i postgres-0 -n marcus -- psql -U postgres -d citations < backup-*.sql

# 2. Verify schema
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -d citations -c "\dt"

# 3. Restart orchestrator to rebuild agent states
kubectl rollout restart deployment/orchestrator -n marcus
```

---

## References

- **Deployment Guide:** `docs/DEPLOYMENT_RUNBOOK_GKE.md`
- **SLO Definitions:** `docs/SLO_DEFINITIONS.md`
- **Secret Rotation:** `docs/SECRET_ROTATION_PROCEDURES.md`
- **Architecture:** `src/platform/integration/citationAgentIntegration.ts`

---

**Last Updated:** 2025-11-22
**Maintained by:** Platform Engineering (Marcus)
