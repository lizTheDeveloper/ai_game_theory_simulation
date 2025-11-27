# MARCUS 3.1 Quick Reference Card

**Infrastructure:** GKE cluster `marcus-platform` in `us-central1`
**Status:** ✅ READY FOR DEPLOYMENT

---

## 🚀 Deploy MARCUS 3.1 (One Command)

```bash
# Build, push, and deploy
docker build -t us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:v3.1.0 . && \
docker push us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:v3.1.0 && \
kubectl set image deployment/citation-agent citation-agent=us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:v3.1.0 -n marcus-platform && \
kubectl rollout status deployment/citation-agent -n marcus-platform
```

---

## 🔍 Verify Infrastructure

```bash
./scripts/verify-infrastructure.sh
```

Expected: ✓ Infrastructure is HEALTHY

---

## 📊 Current Deployment

| Component | Replicas | Status |
|-----------|----------|--------|
| PostgreSQL (primary) | 1/1 | ✅ Running |
| PostgreSQL (replicas) | 2/2 | ✅ Running |
| Redis Cluster | 6/6 | ✅ Running |
| Citation Agents | 5/5 | ✅ Ready |
| Orchestrator | 3/3 | ✅ Ready |

**Database:** 5 tables, 9 agent states initialized
**Storage:** 210 Gi persistent volumes (all bound)
**Configuration:** 27 config keys, 8 secrets

---

## 🔐 Get Secrets

```bash
# PostgreSQL username
kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data.POSTGRES_USER}' | base64 -d

# PostgreSQL password
kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d

# Redis password
kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data.REDIS_PASSWORD}' | base64 -d

# All secrets (JSON)
kubectl get secret marcus-secrets -n marcus-platform -o jsonpath='{.data}' | jq -r 'to_entries[] | "\(.key)=\(.value | @base64d)"'
```

---

## 🔌 Port-Forward Services

```bash
# Orchestrator (API)
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000

# PostgreSQL (admin)
kubectl port-forward -n marcus-platform svc/postgres-primary 5432:5432

# Redis (debugging)
kubectl port-forward -n marcus-platform svc/redis 6379:6379
```

---

## 📝 View Logs

```bash
# Citation agents
kubectl logs -f deployment/citation-agent -n marcus-platform --tail=50

# Orchestrator
kubectl logs -f deployment/orchestrator -n marcus-platform --tail=50

# Specific pod
kubectl logs -f <pod-name> -n marcus-platform
```

---

## 🗄️ Database Access

```bash
# Connect to PostgreSQL
kubectl exec -it -n marcus-platform postgres-primary-0 -- psql -U marcus_app -d citation_integrity

# Quick query
kubectl exec -n marcus-platform postgres-primary-0 -- psql -U marcus_app -d citation_integrity -c "SELECT * FROM agent_states;"

# Table list
kubectl exec -n marcus-platform postgres-primary-0 -- psql -U marcus_app -d citation_integrity -c "\dt"
```

**Database:** citation_integrity
**User:** marcus_app
**Tables:** agent_states, citation_analyses, citation_tasks, agent_metrics, learning_history

---

## 🔄 Rollback

```bash
# Immediate rollback to previous version
kubectl rollout undo deployment/citation-agent -n marcus-platform

# Rollback to specific revision
kubectl rollout history deployment/citation-agent -n marcus-platform
kubectl rollout undo deployment/citation-agent -n marcus-platform --to-revision=2
```

---

## 🏥 Health Checks

```bash
# All pods
kubectl get pods -n marcus-platform

# Pod health
kubectl describe pod <pod-name> -n marcus-platform

# Orchestrator health endpoint (after port-forward)
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

---

## 📈 Monitoring

```bash
# Resource usage
kubectl top pods -n marcus-platform
kubectl top nodes

# Events
kubectl get events -n marcus-platform --sort-by='.lastTimestamp' | tail -20

# Deployment status
kubectl rollout status deployment/citation-agent -n marcus-platform
```

---

## 🛠️ Common Operations

### Scale Deployment
```bash
kubectl scale deployment/citation-agent --replicas=10 -n marcus-platform
```

### Update Image
```bash
kubectl set image deployment/citation-agent citation-agent=<new-image>:tag -n marcus-platform
```

### Restart Deployment
```bash
kubectl rollout restart deployment/citation-agent -n marcus-platform
```

### Execute Command in Pod
```bash
kubectl exec -it <pod-name> -n marcus-platform -- /bin/bash
```

### Copy File to Pod
```bash
kubectl cp local-file.txt marcus-platform/<pod-name>:/tmp/file.txt
```

---

## 🌐 Service Endpoints (Internal)

```
PostgreSQL Primary: postgres-primary.marcus-platform.svc.cluster.local:5432
PostgreSQL Replica: postgres-replica.marcus-platform.svc.cluster.local:5432
Redis: redis.marcus-platform.svc.cluster.local:6379
Redis Headless: redis-headless.marcus-platform.svc.cluster.local:6379
Orchestrator: orchestrator.marcus-platform.svc.cluster.local:3000
Citation Agent: citation-agent.marcus-platform.svc.cluster.local:8000
```

---

## 💰 Cost Summary

| Resource | Monthly Cost |
|----------|--------------|
| GKE Cluster (3x e2-standard-4) | ~$219 |
| Persistent Storage (210 Gi) | ~$36 |
| Artifact Registry | ~$0.26 |
| **Total** | **~$255** |

*Testing VM (marcus-test-vm-e2): ~$370/month if running 24/7 - stop when not in use*

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| INFRASTRUCTURE_READY.md | This summary |
| INFRASTRUCTURE_ASSESSMENT.md | Detailed inventory (15+ pages) |
| DEPLOYMENT_GUIDE.md | Step-by-step procedures |
| .env.template | Configuration template |
| scripts/verify-infrastructure.sh | Automated health check |

---

## 🆘 Emergency Commands

### Cluster Issues
```bash
# Get cluster info
gcloud container clusters describe marcus-platform --region=us-central1

# Resize cluster
gcloud container clusters resize marcus-platform --num-nodes=5 --region=us-central1
```

### Database Emergency
```bash
# Check connections
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'citation_integrity';"

# Kill long-running queries
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus_app -d citation_integrity -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';"
```

### Redis Emergency
```bash
# Check cluster status
kubectl exec -n marcus-platform redis-0 -- redis-cli CLUSTER INFO

# Flush all data (DANGEROUS)
kubectl exec -n marcus-platform redis-0 -- redis-cli FLUSHALL
```

---

## ⚡ Quick Status Check (Copy-Paste)

```bash
echo "=== MARCUS Platform Status ===" && \
echo "GKE Cluster:" && gcloud container clusters describe marcus-platform --region=us-central1 --format="value(status)" && \
echo "PostgreSQL:" && kubectl get statefulset postgres-primary postgres-replica -n marcus-platform && \
echo "Redis:" && kubectl get statefulset redis -n marcus-platform && \
echo "Citation Agents:" && kubectl get deployment citation-agent -n marcus-platform && \
echo "Orchestrator:" && kubectl get deployment orchestrator -n marcus-platform && \
echo "Storage:" && kubectl get pvc -n marcus-platform | grep Bound | wc -l && echo "/9 volumes bound"
```

---

## 🎯 Deployment Checklist

**Before Deployment:**
- [ ] Run `./scripts/verify-infrastructure.sh` → All checks pass
- [ ] Review `DEPLOYMENT_GUIDE.md` → Strategy chosen
- [ ] Create `.env` file → Secrets extracted
- [ ] Build Docker images → Images pushed to registry
- [ ] Document current versions → Rollback target known

**During Deployment:**
- [ ] Update deployment image → Rolling update started
- [ ] Monitor logs → No errors observed
- [ ] Check health endpoints → All returning 200
- [ ] Verify database → Migrations applied successfully
- [ ] Watch rollout → All pods running

**After Deployment:**
- [ ] Run verification script → All checks pass
- [ ] Monitor metrics → No anomalies for 1 hour
- [ ] Test API endpoints → All functional
- [ ] Document changes → Wiki updated
- [ ] Clean up old images → Free up registry space

---

**Quick Links:**
- Full Assessment: `cat INFRASTRUCTURE_ASSESSMENT.md`
- Deployment Guide: `cat DEPLOYMENT_GUIDE.md`
- Verify Health: `./scripts/verify-infrastructure.sh`
- View Logs: `kubectl logs -f deployment/citation-agent -n marcus-platform`

**Status: Infrastructure READY. Deploy when ready.**
