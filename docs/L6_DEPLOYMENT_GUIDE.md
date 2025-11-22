# MARCUS 3.1 L6 Cost Optimization Deployment Guide

**Target:** Reduce monthly GKE costs from $120 to $45 (63% reduction)

## Prerequisites

```bash
# Verify cluster access
gcloud container clusters get-credentials marcus-cluster --zone us-central1-a

# Install KEDA
kubectl apply -f https://github.com/kedacore/keda/releases/download/v2.10.0/keda-2.10.0.yaml

# Verify KEDA installed
kubectl get pods -n keda
```

## Step 1: Analyze Resource Usage

```bash
# Check current resource usage (7-day window if available)
kubectl top pods -n marcus-platform --containers

# Get p50, p95, p99 metrics from Prometheus
kubectl port-forward -n marcus-platform svc/prometheus 9090:9090

# Query in Prometheus UI:
# - CPU: rate(container_cpu_usage_seconds_total{namespace="marcus-platform"}[5m])
# - Memory: container_memory_working_set_bytes{namespace="marcus-platform"}
```

**Expected Results:**
- citation-worker: CPU p50=200m, p95=400m, Memory p50=200Mi, p95=320Mi
- citation-orchestrator: CPU p50=300m, p95=600m, Memory p50=400Mi, p95=640Mi

## Step 2: Right-Size Pod Resources

Update deployments with optimized resource requests/limits:

```yaml
# citation-worker
resources:
  requests:
    cpu: 250m      # p50 + buffer
    memory: 256Mi  # p50 + buffer
  limits:
    cpu: 500m      # p95 + 20% headroom
    memory: 384Mi  # p95 + 20% headroom

# citation-orchestrator
resources:
  requests:
    cpu: 300m
    memory: 400Mi
  limits:
    cpu: 720m      # p95 + 20%
    memory: 768Mi  # p95 + 20%
```

**Apply:**
```bash
kubectl apply -f k8s/spot-node-pool.yaml
```

**Savings:** ~$25/month (reduced over-provisioning)

## Step 3: Create Spot Node Pool

```bash
gcloud container node-pools create spot-workers \
  --cluster=marcus-cluster \
  --zone=us-central1-a \
  --spot \
  --enable-autoscaling \
  --min-nodes=0 \
  --max-nodes=10 \
  --machine-type=e2-medium \
  --disk-size=20 \
  --disk-type=pd-standard \
  --node-labels=workload-type=worker,cost-optimized=true \
  --node-taints=spot=true:NoSchedule
```

**Verify:**
```bash
gcloud container node-pools list --cluster=marcus-cluster --zone=us-central1-a
kubectl get nodes -l cost-optimized=true
```

**Savings:** ~$25/month (60% cheaper than on-demand)

## Step 4: Install KEDA ScaledObject

```bash
# Apply KEDA scaler
kubectl apply -f k8s/keda-scaledobject.yaml

# Verify HPA created
kubectl get hpa -n marcus-platform

# Monitor scaling events
kubectl describe scaledobject citation-worker-scaler -n marcus-platform
```

**Test scale-to-zero:**
```bash
# Ensure queue is empty
redis-cli -h marcus-redis LLEN citation_analysis_queue  # Should be 0

# Wait 5 minutes (cooldown period)
watch kubectl get pods -n marcus-platform

# Workers should scale to 0
# Add items to queue to trigger scale-up:
redis-cli -h marcus-redis LPUSH citation_analysis_queue '{"test": true}'
```

**Savings:** ~$8/month (workers idle 60% of time)

## Step 5: Scheduled Scaling (Dev/Staging)

```bash
# Apply to dev namespace
kubectl apply -f k8s/scheduled-scaling.yaml

# Verify CronJobs created
kubectl get cronjobs -n marcus-dev
kubectl get cronjobs -n marcus-staging

# Test manually (don't wait for schedule)
kubectl create job --from=cronjob/scale-down-evening test-scaledown -n marcus-dev
kubectl logs -f job/test-scaledown -n marcus-dev
```

**Savings:** ~$15/month (dev/staging off-hours)

## Step 6: Storage Optimization

Update PersistentVolumeClaims to use standard HDD (not SSD):

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  storageClassName: standard  # Was: standard-rwo (SSD)
  resources:
    requests:
      storage: 5Gi  # Was: 10Gi
```

**Apply:**
```bash
# Note: Cannot change storageClass on existing PVC
# Need to backup, delete, recreate with new storageClass

# Backup data first!
kubectl exec -n marcus-platform marcus-postgres-0 -- pg_dump -U postgres > backup.sql

# Delete PVC (DANGER: data loss if no backup)
kubectl delete pvc postgres-data -n marcus-platform

# Apply new PVC with optimized storage
kubectl apply -f k8s/postgres-pvc-optimized.yaml

# Restore data
kubectl exec -i -n marcus-platform marcus-postgres-0 -- psql -U postgres < backup.sql
```

**Savings:** ~$2/month (cheaper storage tier + reduced size)

## Step 7: Deploy and Validate

### Deploy All Optimizations

```bash
# 1. Apply right-sized resources
kubectl apply -f k8s/spot-node-pool.yaml

# 2. Create spot node pool (if not already done)
# (see Step 3)

# 3. Install KEDA
kubectl apply -f k8s/keda-scaledobject.yaml

# 4. Apply scheduled scaling
kubectl apply -f k8s/scheduled-scaling.yaml

# 5. Monitor rollout
kubectl rollout status deployment/citation-worker -n marcus-platform
kubectl rollout status deployment/citation-orchestrator -n marcus-platform
```

### Validate Performance

```bash
# 1. Check for OOM kills (should be 0)
kubectl get pods -n marcus-platform -o json | jq '.items[] | select(.status.containerStatuses[]?.lastState.terminated.reason == "OOMKilled")'

# 2. Check CPU throttling (should be <5%)
kubectl top pods -n marcus-platform --containers

# 3. Monitor p95 latency (should be unchanged)
# Check in Grafana: citation_latency_ms{quantile="0.95"}

# 4. Test spot preemption handling
kubectl delete pod <worker-pod> -n marcus-platform --force
# Should restart gracefully, queue processing continues
```

## Cost Calculation

### Before Optimization ($120/month)
- 3x e2-medium on-demand workers: $50/month
- 2x e2-standard-2 orchestrators: $40/month
- 10Gi SSD storage: $5/month
- Dev/staging 24/7: $25/month

### After Optimization ($45/month)
- 3x e2-medium spot workers (60% cheaper): $20/month
- 2x e2-standard-2 orchestrators (right-sized): $30/month
- 5Gi HDD storage: $2/month
- Dev/staging off-hours (50% reduction): $10/month

**Total Savings: $75/month (63% reduction)**

## Monitoring Dashboards

Import Grafana dashboard for cost monitoring:

```bash
kubectl apply -f k8s/grafana-cost-dashboard.json
```

**Key Metrics:**
- Node utilization (should be 60-80%)
- Worker pod count over time (should scale to 0 during idle)
- Spot preemption rate (should be <5% daily)
- OOM kill count (should be 0)
- CPU throttling % (should be <5%)

## Rollback Plan

If issues occur:

```bash
# 1. Disable KEDA (scale manually)
kubectl delete scaledobject citation-worker-scaler -n marcus-platform
kubectl scale deployment citation-worker --replicas=3 -n marcus-platform

# 2. Remove spot node pool toleration
kubectl patch deployment citation-worker -n marcus-platform --type=json -p='[{"op": "remove", "path": "/spec/template/spec/tolerations"}]'

# 3. Increase resource limits
kubectl set resources deployment citation-worker -n marcus-platform \
  --limits=cpu=1000m,memory=1Gi \
  --requests=cpu=500m,memory=512Mi
```

## Success Criteria

✅ Monthly cost reduced by >50%
✅ No OOM kills
✅ CPU throttling <5%
✅ P95 latency unchanged (±10%)
✅ Spot preemptions handled gracefully
✅ Scale-to-zero working (workers at 0 during idle)

## Troubleshooting

### Workers Not Scaling to Zero

```bash
# Check queue depth
redis-cli -h marcus-redis LLEN citation_analysis_queue

# Check KEDA logs
kubectl logs -n keda deployment/keda-operator

# Verify cooldown period hasn't been breached
kubectl describe scaledobject citation-worker-scaler -n marcus-platform
```

### Spot Preemptions Causing Issues

```bash
# Check preemption rate
kubectl get events -n marcus-platform --field-selector reason=Preempted

# If >5% daily, increase max-nodes or use preemptible + on-demand mix
gcloud container node-pools update spot-workers --max-nodes=15 --cluster=marcus-cluster
```

### OOM Kills

```bash
# Find OOM killed pods
kubectl get pods -n marcus-platform -o json | jq '.items[] | select(.status.containerStatuses[]?.lastState.terminated.reason == "OOMKilled") | .metadata.name'

# Increase memory limits
kubectl set resources deployment citation-worker -n marcus-platform --limits=memory=512Mi
```

## Author

Marcus (Platform Engineer)
Date: 2025-11-22
