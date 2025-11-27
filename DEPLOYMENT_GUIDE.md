# MARCUS 3.1 Deployment Guide
**Target Environment:** Existing GKE cluster `marcus-platform`
**Status:** Infrastructure verified and ready

---

## Quick Start (5 Minutes)

### Prerequisites
✅ GKE cluster running (marcus-platform)
✅ PostgreSQL with schema initialized (5 tables)
✅ Redis Cluster operational (6 nodes)
✅ Artifact Registry configured
✅ 9 agent states in database

### Step 1: Verify Infrastructure (30 seconds)
```bash
./scripts/verify-infrastructure.sh
```

Expected output: **✓ Infrastructure is HEALTHY**

### Step 2: Create Local Environment File (2 minutes)
```bash
# Copy template
cp .env.template .env

# Get database credentials
kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data.POSTGRES_USER}' | base64 -d
kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d

# Edit .env and fill in the credentials
nano .env
```

### Step 3: Deploy MARCUS 3.1 (2 minutes)

**Option A: Rolling Update (Zero Downtime)**
```bash
# Build and push new images
docker build -t us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:v3.1.0 -f docker/citation-agent.Dockerfile .
docker build -t us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/orchestrator:v3.1.0 -f docker/orchestrator.Dockerfile .

docker push us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:v3.1.0
docker push us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/orchestrator:v3.1.0

# Update deployments
kubectl set image deployment/citation-agent \
  citation-agent=us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:v3.1.0 \
  -n marcus-platform

kubectl set image deployment/orchestrator \
  orchestrator=us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/orchestrator:v3.1.0 \
  -n marcus-platform

# Watch rollout
kubectl rollout status deployment/citation-agent -n marcus-platform
kubectl rollout status deployment/orchestrator -n marcus-platform
```

**Option B: Port-Forward for Local Testing**
```bash
# Run orchestrator locally
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000

# Access at http://localhost:3000
curl http://localhost:3000/health
```

---

## Detailed Deployment Options

### Option 1: In-Place Upgrade (Recommended)
**Use when:** You want zero downtime and incremental rollout
**Downtime:** None
**Rollback:** `kubectl rollout undo deployment/citation-agent -n marcus-platform`

**Steps:**
1. Build new Docker images with v3.1.0 tag
2. Push to Artifact Registry
3. Update deployment image references
4. Kubernetes handles rolling update automatically
5. Monitor logs for any issues

**Benefits:**
- No infrastructure changes
- Automatic rollback on health check failures
- Gradual rollout (25% max surge, 25% max unavailable)

**Risks:**
- If v3.1.0 has breaking changes with v3.0.2 schema, agents may crash
- Database migrations need to be backward-compatible

### Option 2: Blue-Green Deployment
**Use when:** You want full testing before switching traffic
**Downtime:** ~1 minute (service selector change)
**Rollback:** Change service selector back to blue

**Steps:**
1. Create new namespace `marcus-platform-v31`
2. Deploy all v3.1.0 components to new namespace
3. Test thoroughly
4. Update service selectors to point to v3.1.0 pods
5. Decommission old namespace after verification

**Benefits:**
- Full isolation for testing
- Instant rollback capability
- No risk to production

**Risks:**
- Requires ~2x resources during transition
- Database state shared between versions (needs migration strategy)

### Option 3: Canary Deployment
**Use when:** You want gradual traffic shift
**Downtime:** None
**Rollback:** Scale down canary replicas

**Steps:**
1. Scale citation-agent to 10 replicas (from 5)
2. Deploy 5 replicas of v3.1.0 alongside 5 replicas of v3.0.2
3. Monitor metrics for 1 hour
4. If successful, scale v3.1.0 to 10, scale v3.0.2 to 0
5. Remove v3.0.2 deployment

**Benefits:**
- Gradual risk exposure
- Real production traffic testing
- Easy rollback by scaling

**Risks:**
- More complex to manage
- Both versions running simultaneously

---

## Pre-Deployment Checklist

### Code Readiness
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Docker images build successfully
- [ ] Database migrations tested
- [ ] Configuration changes documented

### Infrastructure Readiness
- [ ] Infrastructure verification script passes
- [ ] Database schema matches expected version
- [ ] Secrets are valid and not expired
- [ ] Sufficient cluster resources available
- [ ] Monitoring/alerting configured

### Rollback Plan
- [ ] Previous image tags documented (v3.0.2)
- [ ] Database backup created
- [ ] Rollback commands prepared
- [ ] Team notified of deployment window
- [ ] Health check thresholds configured

---

## Database Migration Strategy

### Current Schema (v3.0)
```sql
-- 5 tables:
agent_states (9 records)
agent_metrics (0 records)
citation_analyses (0 records)
citation_tasks (0 records)
learning_history (0 records)
```

### Migration Approach
**Recommended:** Backward-compatible migrations

```sql
-- Example: Add new column with default
ALTER TABLE agent_states
ADD COLUMN IF NOT EXISTS meta_learning_state JSONB DEFAULT '{}'::jsonb;

-- Create new index
CREATE INDEX IF NOT EXISTS idx_agent_meta_learning
ON agent_states USING gin(meta_learning_state);
```

**Apply migrations before deployment:**
```bash
# Copy migration script to pod
kubectl cp migrations/v3.1.0.sql marcus-platform/postgres-primary-0:/tmp/

# Execute migration
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -f /tmp/v3.1.0.sql
```

---

## Monitoring During Deployment

### Key Metrics to Watch

**Pod Health:**
```bash
watch kubectl get pods -n marcus-platform
```

**Logs (Citation Agents):**
```bash
kubectl logs -f deployment/citation-agent -n marcus-platform --tail=50
```

**Logs (Orchestrator):**
```bash
kubectl logs -f deployment/orchestrator -n marcus-platform --tail=50
```

**Health Endpoints:**
```bash
# Port-forward orchestrator
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000 &

# Check health
watch -n 5 'curl -s http://localhost:3000/health | jq .'
```

**Redis Operations:**
```bash
# Port-forward Redis
kubectl port-forward -n marcus-platform svc/redis 6379:6379 &

# Monitor Redis
redis-cli -h localhost -p 6379 -a $(kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data.REDIS_PASSWORD}' | base64 -d) INFO
```

**Database Connections:**
```bash
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'citation_integrity';"
```

### Prometheus Metrics (If Configured)
```bash
# Port-forward Prometheus (if deployed)
kubectl port-forward -n marcus-platform svc/prometheus 9090:9090 &

# View metrics at http://localhost:9090
```

---

## Troubleshooting

### Issue: Pods CrashLoopBackOff
**Symptoms:** Pod restarts repeatedly
**Check:**
```bash
kubectl describe pod <pod-name> -n marcus-platform
kubectl logs <pod-name> -n marcus-platform --previous
```
**Common Causes:**
- Database connection failed (check secrets)
- Redis connection failed (check cluster status)
- Application startup error (check logs)

**Fix:**
```bash
# Check secrets are valid
kubectl get secret marcus-secrets -n marcus-platform -o yaml

# Verify database connectivity
kubectl exec -n marcus-platform postgres-primary-0 -- pg_isready

# Verify Redis connectivity
kubectl exec -n marcus-platform redis-0 -- redis-cli PING
```

### Issue: Health Check Failures
**Symptoms:** Pods marked as not ready
**Check:**
```bash
kubectl get events -n marcus-platform --sort-by='.lastTimestamp'
```
**Common Causes:**
- Health check endpoint not responding (timeout)
- Application not fully initialized
- Database queries slow

**Fix:**
```bash
# Increase health check timeout
kubectl edit deployment citation-agent -n marcus-platform
# Change initialDelaySeconds to 60, timeoutSeconds to 10
```

### Issue: Database Migration Failed
**Symptoms:** Deployment succeeds but application errors on startup
**Check:**
```bash
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -c "\dt"
```
**Fix:**
```bash
# Rollback migration
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -f /tmp/rollback_v3.1.0.sql

# Re-run migration with fixes
```

### Issue: Image Pull Errors
**Symptoms:** ImagePullBackOff status
**Check:**
```bash
kubectl describe pod <pod-name> -n marcus-platform | grep -A 10 "Events:"
```
**Common Causes:**
- Image tag doesn't exist in registry
- GKE cluster lacks permission to pull from Artifact Registry

**Fix:**
```bash
# Verify image exists
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent

# Check GKE service account permissions
gcloud projects get-iam-policy project-6d921a00-c010-437c-990 \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/artifactregistry.reader"
```

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
```bash
# Rollback to previous version
kubectl rollout undo deployment/citation-agent -n marcus-platform
kubectl rollout undo deployment/orchestrator -n marcus-platform

# Verify rollback
kubectl rollout status deployment/citation-agent -n marcus-platform
kubectl rollout status deployment/orchestrator -n marcus-platform
```

### Rollback to Specific Version
```bash
# View deployment history
kubectl rollout history deployment/citation-agent -n marcus-platform

# Rollback to revision 2
kubectl rollout undo deployment/citation-agent -n marcus-platform --to-revision=2
```

### Database Rollback (If Needed)
```bash
# Restore from backup
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity < backup_pre_v3.1.0.sql

# Or apply rollback migration
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -f /tmp/rollback_v3.1.0.sql
```

---

## Post-Deployment Verification

### Health Check Script
```bash
#!/bin/bash
# Run this 15 minutes after deployment

echo "Checking deployment health..."

# 1. All pods running
PODS=$(kubectl get pods -n marcus-platform --no-headers | grep -c "Running")
echo "Running pods: $PODS"

# 2. No restarts in last 10 minutes
RECENT_RESTARTS=$(kubectl get pods -n marcus-platform -o json | \
  jq '[.items[] | select(.status.containerStatuses[]?.restartCount > 0)] | length')
echo "Pods with restarts: $RECENT_RESTARTS"

# 3. Database accessible
DB_CONN=$(kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -t -c "SELECT 1;" 2>/dev/null | tr -d ' ')
if [ "$DB_CONN" = "1" ]; then
    echo "Database: OK"
else
    echo "Database: FAILED"
fi

# 4. Redis operational
REDIS_PING=$(kubectl exec -n marcus-platform redis-0 -- redis-cli PING 2>/dev/null)
if [ "$REDIS_PING" = "PONG" ]; then
    echo "Redis: OK"
else
    echo "Redis: FAILED"
fi

# 5. Orchestrator health
ORCH_HEALTH=$(kubectl port-forward -n marcus-platform svc/orchestrator 13000:3000 &>/dev/null &
  sleep 2
  curl -s http://localhost:13000/health | jq -r '.status // "unhealthy"'
  pkill -f "port-forward.*orchestrator")
echo "Orchestrator health: $ORCH_HEALTH"
```

### Metrics to Monitor (First 24 Hours)
- **Error Rate:** Should be < 1% of requests
- **Response Time:** p95 latency should be < 500ms
- **Throughput:** Citations processed per minute
- **Database Connections:** Should not exceed pool max (50)
- **Redis Memory:** Should be < 80% of allocated
- **Pod Restarts:** Should be 0 (unless OOMKilled)

---

## Access Instructions Post-Deployment

### Internal Access (From Cluster)
```bash
# Services are accessible via internal DNS
postgres-primary.marcus-platform.svc.cluster.local:5432
redis.marcus-platform.svc.cluster.local:6379
orchestrator.marcus-platform.svc.cluster.local:3000
citation-agent.marcus-platform.svc.cluster.local:8000
```

### External Access (Port-Forward)
```bash
# Orchestrator API
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000

# PostgreSQL (for admin tasks)
kubectl port-forward -n marcus-platform svc/postgres-primary 5432:5432

# Redis (for debugging)
kubectl port-forward -n marcus-platform svc/redis 6379:6379
```

### External Access (Ingress - Future)
```yaml
# k8s/ingress.yaml (to be created)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: marcus-ingress
  namespace: marcus-platform
  annotations:
    kubernetes.io/ingress.class: "gce"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - marcus.example.com
    secretName: marcus-tls
  rules:
  - host: marcus.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: orchestrator
            port:
              number: 3000
```

---

## Success Criteria

Deployment is considered successful when:
- ✅ All pods are Running with 0 restarts
- ✅ Health checks passing for 15+ minutes
- ✅ Database queries returning valid data
- ✅ Redis cluster fully operational
- ✅ No errors in logs for 15+ minutes
- ✅ Metrics showing normal throughput
- ✅ Response times within acceptable range

---

## Support & Debugging

### Useful Commands
```bash
# Get all resources in namespace
kubectl get all -n marcus-platform

# Describe pod (shows events)
kubectl describe pod <pod-name> -n marcus-platform

# Get recent events
kubectl get events -n marcus-platform --sort-by='.lastTimestamp' | tail -20

# Check resource usage
kubectl top pods -n marcus-platform
kubectl top nodes

# Execute SQL in database
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -c "SELECT * FROM agent_states LIMIT 5;"

# Access Redis CLI
kubectl exec -it -n marcus-platform redis-0 -- redis-cli
```

### Log Collection
```bash
# Save all pod logs
for pod in $(kubectl get pods -n marcus-platform -o name); do
  kubectl logs -n marcus-platform $pod > logs/$(echo $pod | sed 's|pod/||').log
done
```

### Emergency Contacts
- Platform Engineer: marcus (this agent)
- Simulation Maintainer: roy
- Architecture Review: Priya (validation)

---

**Ready to deploy? Run `./scripts/verify-infrastructure.sh` and proceed with confidence.**
