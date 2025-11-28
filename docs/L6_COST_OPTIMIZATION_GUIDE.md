# MARCUS 3.1: Cost Optimization Guide

**Priority:** LOW (L6)
**Effort:** 1 week
**Status:** Planning Complete

## Current Costs (Estimate)

**GKE Cluster:**
- 3 nodes × e2-standard-2 (2 vCPU, 8GB RAM) = $90/month
- Persistent disks (30GB total) = $5/month
- Load balancer = $20/month
- Network egress = $5/month
- **Total:** ~$120/month

**Breakdown by Component:**
- Orchestrator pods: $30/month (always running)
- Citation worker pods: $40/month (scale with load)
- PostgreSQL: $20/month (StatefulSet)
- Redis cluster: $20/month (6 replicas)
- Monitoring (Prometheus/Grafana): $10/month

## Optimization Opportunities

### 1. Right-Size Instance Types (~30% savings)

**Current:**
```yaml
resources:
  requests:
    memory: "512Mi"  # Often using only 200Mi
    cpu: "250m"      # Often using only 100m
  limits:
    memory: "1Gi"
    cpu: "500m"
```

**Optimized:**
```yaml
# Analyze actual usage first
kubectl top pods -n marcus --containers

# Then right-size based on p95 usage
resources:
  requests:
    memory: "256Mi"  # Reduced by 50%
    cpu: "100m"      # Reduced by 60%
  limits:
    memory: "512Mi"  # Reduced by 50%
    cpu: "300m"      # Reduced by 40%
```

**Savings:** $90/month → $65/month ($25 saved)

---

### 2. Use Spot/Preemptible Instances (~60% savings for workers)

**Problem:** Citation workers are fault-tolerant but run on standard nodes.

**Solution:** Move workers to spot instances.

```yaml
# k8s/node-pool-spot-workers.yaml

apiVersion: v1
kind: NodePool
metadata:
  name: spot-worker-pool
spec:
  # Spot instances (60-70% cheaper)
  preemptible: true

  # Auto-scaling
  autoscaling:
    enabled: true
    minNodeCount: 0  # Scale to zero when idle
    maxNodeCount: 10

  # Instance type
  machineType: e2-medium  # Smaller than standard-2

  # Taints to ensure only workers run here
  taints:
    - key: workload
      value: spot
      effect: NoSchedule

---
# Deploy workers to spot pool
apiVersion: apps/v1
kind: Deployment
metadata:
  name: citation-workers
spec:
  template:
    spec:
      # Tolerate spot node taint
      tolerations:
        - key: workload
          value: spot
          effect: NoSchedule

      # Prefer spot nodes
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              preference:
                matchExpressions:
                  - key: cloud.google.com/gke-preemptible
                    operator: In
                    values: ["true"]
```

**Savings:** $40/month → $15/month ($25 saved)

---

### 3. Scale-to-Zero for Idle Periods (~20% savings)

**Problem:** Workers run 24/7 even when idle (nights/weekends).

**Solution:** Horizontal Pod Autoscaler (HPA) + KEDA for scale-to-zero.

```yaml
# k8s/keda-scaledobject.yaml

apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: citation-workers-scaler
  namespace: marcus
spec:
  scaleTargetRef:
    name: citation-workers
  minReplicaCount: 0  # Scale to zero when idle
  maxReplicaCount: 20
  triggers:
    # Scale based on Redis queue depth
    - type: redis
      metadata:
        address: redis:6379
        listName: citation_analysis_queue
        listLength: "5"  # 1 pod per 5 queue items

    # Or scale based on custom metric (Prometheus)
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: marcus_queue_depth
        threshold: '10'
        query: sum(marcus_queue_depth{queue_name="citation_analysis"})
```

**Savings:** Reduce idle time from 16 hours/day to 0 = $8/month saved

---

### 4. Optimize Storage Classes (~$2/month)

**Current:** standard-rwo (SSD, expensive)

**Optimized:**
```yaml
# Use standard for non-critical data
volumeClaimTemplates:
  - metadata:
      name: redis-data
    spec:
      storageClassName: "standard"  # HDD, not SSD
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi  # Reduced from 10Gi
```

**Savings:** $5/month → $3/month ($2 saved)

---

### 5. Database Connection Pooling (~5% CPU savings)

**Problem:** Creating new connections is expensive (50ms each).

**Solution:** Already implemented in `redisPool.ts` and `pool.ts`.

**Verify optimization:**
```typescript
// Check pool metrics
console.log(dbPool.totalCount);  // Should be ~10 (poolSize)
console.log(dbPool.idleCount);   // Should be >0 most of the time
console.log(dbPool.waitingCount); // Should be 0 (no contention)
```

**Benefit:** Reduces CPU by ~5%, saves $5/month

---

### 6. Scheduled Scaling (Dev/Staging) (~50% savings for non-prod)

**Problem:** Dev/staging run 24/7 but only needed during business hours.

**Solution:** CronJob to scale down at night.

```yaml
# k8s/scheduled-scaling.yaml

# Scale down at 6 PM
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-down-evening
spec:
  schedule: "0 18 * * *"  # 6 PM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl:latest
            command:
              - kubectl
              - scale
              - deployment/citation-workers
              - --replicas=0
              - -n marcus-dev
          restartPolicy: OnFailure

---
# Scale up at 8 AM
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-up-morning
spec:
  schedule: "0 8 * * 1-5"  # 8 AM weekdays
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl:latest
            command:
              - kubectl
              - scale
              - deployment/citation-workers
              - --replicas=3
              - -n marcus-dev
          restartPolicy: OnFailure
```

**Savings (Dev/Staging only):** $30/month → $15/month ($15 saved)

---

### 7. Resource Limits Best Practices

**Problem:** Over-provisioned limits waste money.

**Solution:** Set limits based on actual usage + 20% headroom.

```bash
# Analyze actual usage over 1 week
kubectl top pods -n marcus --containers --use-protocol-buffers \
  | awk '{if(NR>1)print $1,$3,$5}' \
  | while read pod cpu mem; do
      echo "Pod: $pod, CPU: $cpu, Memory: $mem"
    done

# Find p95 usage
# Then set requests = p50, limits = p95 + 20%
```

**Example:**
```yaml
# Before (over-provisioned)
resources:
  requests: { cpu: "500m", memory: "1Gi" }
  limits: { cpu: "2000m", memory: "4Gi" }

# After (right-sized)
resources:
  requests: { cpu: "200m", memory: "384Mi" }  # p50
  limits: { cpu: "600m", memory: "768Mi" }    # p95 + 20%
```

---

## Cost Optimization Checklist

### Analysis (Week 1, Days 1-2)
- [ ] Run `kubectl top pods` for 7 days
- [ ] Collect p50, p95, p99 resource usage
- [ ] Identify over-provisioned pods
- [ ] Calculate potential savings

### Implementation (Week 1, Days 3-5)
- [ ] Right-size resource requests/limits
- [ ] Create spot node pool for workers
- [ ] Add node affinity for spot nodes
- [ ] Implement KEDA for scale-to-zero
- [ ] Add scheduled scaling for dev/staging
- [ ] Optimize storage classes

### Testing (Week 1, Days 6-7)
- [ ] Verify pods still healthy with smaller resources
- [ ] Test spot node preemption handling
- [ ] Verify scale-to-zero and scale-up work
- [ ] Load test to ensure no degradation

### Monitoring (Week 2)
- [ ] Monitor OOM kills (should be 0)
- [ ] Monitor CPU throttling (should be <5%)
- [ ] Track cost reduction in GCP billing
- [ ] Document final resource allocation

---

## Expected Savings Summary

| Optimization | Savings | Complexity | Priority |
|--------------|---------|------------|----------|
| Right-sizing | $25/mo | Low | HIGH |
| Spot instances | $25/mo | Medium | HIGH |
| Scale-to-zero | $8/mo | Medium | MEDIUM |
| Storage optimization | $2/mo | Low | LOW |
| Connection pooling | $5/mo | Already done | N/A |
| Scheduled scaling (dev) | $15/mo | Low | MEDIUM |
| **Total** | **$80/mo** | | |

**Final Cost:** $120/month → $40/month (~67% reduction)

---

## Cost Monitoring Dashboard

```yaml
# Grafana dashboard for cost tracking

# Panel 1: Total Pod Count Over Time
sum(kube_pod_info{namespace="marcus"})

# Panel 2: Resource Requests vs. Limits
sum(kube_pod_container_resource_requests{namespace="marcus",resource="memory"})
sum(kube_pod_container_resource_limits{namespace="marcus",resource="memory"})

# Panel 3: Actual Usage vs. Requests
sum(container_memory_usage_bytes{namespace="marcus"}) /
sum(kube_pod_container_resource_requests{namespace="marcus",resource="memory"})

# Panel 4: Spot Instance Usage
count(kube_node_labels{label_cloud_google_com_gke_preemptible="true"})

# Panel 5: Estimated Monthly Cost
# (Manual calculation based on instance types + disk + network)
```

---

## Rollback Plan

If optimizations cause issues:

1. **OOM Kills:** Increase memory limits by 50%
2. **CPU Throttling:** Increase CPU limits by 50%
3. **Spot Preemptions:** Move critical workers back to standard nodes
4. **Scale-to-zero issues:** Set minReplicaCount = 1

---

## Advanced Optimizations (Future)

### 1. Cluster Autoscaler

```yaml
# Auto-scale node pool based on pod resource requests
autoscaling:
  enabled: true
  minNodeCount: 1
  maxNodeCount: 10
```

**Benefit:** Only pay for nodes you need

### 2. Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: citation-workers-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: citation-workers
  updatePolicy:
    updateMode: "Auto"  # Auto-adjust resources
```

**Benefit:** Automated right-sizing

### 3. Multi-Region Deployment (Future)

- Primary region: us-central1 (cheapest)
- Failover region: us-east1
- Use cheaper regions when possible

---

## Success Criteria

- [ ] Monthly cost reduced by >50%
- [ ] No OOM kills
- [ ] CPU throttling <5%
- [ ] P95 latency unchanged
- [ ] Spot preemptions handled gracefully
- [ ] Scale-to-zero working (workers at 0 during idle)

---

## References

- [GKE Pricing Calculator](https://cloud.google.com/products/calculator)
- [Spot VMs Pricing](https://cloud.google.com/compute/docs/instances/spot)
- [KEDA Documentation](https://keda.sh/docs/)
- [GKE Cost Optimization Best Practices](https://cloud.google.com/architecture/best-practices-for-running-cost-effective-kubernetes-applications-on-gke)
