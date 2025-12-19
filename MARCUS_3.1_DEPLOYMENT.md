# MARCUS 3.1 Production Deployment

**Date:** 2025-11-22  
**Cluster:** marcus-platform (us-central1)  
**Status:** ✅ Deployed Successfully

---

## Deployed Components

### L6 Cost Optimization
- **KEDA v2.10.0** installed
- **ScaledObject** configured for scale-to-zero
- **Spot node pool** created (0-10 nodes, e2-medium)
- **Right-sized resources** (100m CPU / 256Mi memory)

**Current State:**
- Workers scaled to 0 (queue empty)
- Scale-to-zero active and working
- Estimated savings: ~$15/month

### L3 Async Python Agent
- **Image:** citation-agent:v3.2.0
- **Status:** Deployed, ready for canary rollout
- **Config:** ENABLE_ASYNC_AGENT=true, ASYNC_AGENT_ROLLOUT_PERCENT=0%

**Canary Rollout:**
```bash
./scripts/canary-rollout-async.sh auto
```

### L5 Distributed Tracing
- **Jaeger:** Running (1/1 pods)
- **UI:** http://34.123.164.214
- **Sampling:** 10% in production
- **Status:** Active and tracing orchestrator

### L4 GraphQL API
- **Port:** 4000
- **Endpoint:** http://orchestrator:4000/graphql
- **Status:** Infrastructure deployed, ready for activation

---

## Quick Access

### Services
```bash
# Jaeger UI
http://34.123.164.214

# GraphQL (port-forward)
kubectl port-forward -n marcus-platform svc/orchestrator 4000:4000
# Then: http://localhost:4000/graphql

# Orchestrator
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000
```

### Monitoring
```bash
# Check KEDA scaling
kubectl get scaledobject -n marcus-platform -w

# Check worker pods
kubectl get pods -n marcus-platform -l app=citation-agent -w

# Check Jaeger
kubectl get pods -n marcus-platform -l app=jaeger

# Node resource usage
kubectl top nodes
```

---

## Configuration

All optimizations are controlled via `marcus-config` ConfigMap:

```bash
# View current config
kubectl get configmap marcus-config -n marcus-platform -o yaml

# Key settings
ENABLE_ASYNC_AGENT=true
ASYNC_AGENT_ROLLOUT_PERCENT=0
ENABLE_GRAPHQL=true
ENABLE_DISTRIBUTED_TRACING=true
JAEGER_ENDPOINT=http://jaeger.marcus-platform.svc.cluster.local:14268/api/traces
OTEL_SAMPLING_RATE=0.1
```

---

## Next Steps

1. **Test scale-up** by adding items to Redis queue
2. **Run async canary** when production traffic available
3. **Validate GraphQL** endpoint when code initializes
4. **Monitor Jaeger** traces in UI
5. **Observe cost savings** from scale-to-zero

---

## Rollback

All changes are reversible:

```bash
# L6: Disable KEDA
kubectl delete scaledobject citation-worker-scaler -n marcus-platform
kubectl scale deployment citation-agent --replicas=5 -n marcus-platform

# L3: Rollback async agent
kubectl set image deployment/citation-agent agent=...citation-agent:v3.1.0 -n marcus-platform

# L5: Remove Jaeger
kubectl delete deployment jaeger -n marcus-platform
kubectl delete svc jaeger jaeger-ui -n marcus-platform

# L4: Disable GraphQL
kubectl patch configmap marcus-config -n marcus-platform \
  --type merge -p '{"data":{"ENABLE_GRAPHQL":"false"}}'
```

---

**Deployment completed successfully ✅**

Full deployment log: `logs/marcus_3.1_deployment_*.log`
