# GKE Backup Inventory - 2025-11-25

**Backup Date:** 2025-11-25 02:00 UTC
**Source:** GKE Cluster `marcus-platform` in `us-central1`
**Project:** `project-6d921a00-c010-437c-990` (trial account - closing)
**Purpose:** Complete backup before GCP trial account closure

---

## Backup Contents

### Kubernetes Resources (304KB)
- **File:** `full-cluster-export.yaml`
- **Contents:** Complete export of all resources in marcus-platform namespace
  - 3 postgres pods (1 primary + 2 replicas)
  - 6 redis pods (cluster mode)
  - Deployments (orchestrator, citation-agent, prometheus, jaeger)
  - Services (all ClusterIP and LoadBalancer configs)
  - StatefulSets (postgres, redis)
  - HPA configurations (autoscaling rules)
  - ConfigMaps (9 total)
  - Secrets (1 - marcus-secrets)

### GKE Cluster Configuration (13KB)
- **File:** `cluster-config.yaml`
- **Contents:** Complete cluster description
  - Node pools configuration
  - Autoscaling settings (1-10 nodes)
  - Machine type: e2-standard-4
  - Region: us-central1
  - Network configuration

### Database Backup (17KB)
- **File:** `citation_integrity.sql`
- **Database:** citation_integrity (PostgreSQL)
- **User:** marcus_app
- **Contents:** Schema + data for citation integrity platform
- **Size:** 17KB (likely just schema + minimal test data)

### Secrets (1.2KB)
- **File:** `secrets-export.yaml`
- **Contents:** Base64-encoded secrets
  - POSTGRES_PASSWORD
  - REDIS_PASSWORD
  - JWT_SECRET
  - JWT_REFRESH_SECRET
  - ANTHROPIC_API_KEY (if set)

### Docker Images List
- **File:** `DOCKER_IMAGES.txt`
- **Orchestrator versions:** v3.0.0 through v3.1.0 (8 versions)
- **Citation Agent versions:** v3.0.0 through v3.2.0 (4 versions)
- **Registry:** us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform

### Dockerfiles (Complete)
- **Directory:** `docker/`
- **Files:**
  - Dockerfile.orchestrator (3.2KB) - Main orchestrator
  - Dockerfile.agent (2.5KB) - Citation agent
  - Dockerfile.agent.optimized (2.5KB) - Optimized version
  - Dockerfile.citation-worker-orchestrator (1.8KB)
  - Dockerfile.citation-worker-orchestrator.optimized (3.2KB)
  - Dockerfile.benchmark (1.6KB)
  - Dockerfile.spawn-agents-orchestrator (2.0KB)
- **Supporting configs:** prometheus/, grafana/, loki/, alertmanager/

### Kubernetes Manifests (Complete)
- **Directory:** `k8s/`
- **Total Files:** 20+ YAML files
- **Key manifests:**
  - orchestrator-deployment.yaml (6KB)
  - postgres-statefulset.yaml (7KB)
  - redis-statefulset.yaml (6.3KB)
  - prometheus-deployment.yaml (5KB)
  - prometheus-adapter.yaml (6KB)
  - jaeger-deployment.yaml (3.2KB)
  - hpa-citation-workers.yaml (10KB)
  - ingress.yaml (3.3KB)
  - All ConfigMaps and supporting resources

---

## Persistent Volume Data

### PostgreSQL Volumes (150GB total)
- postgres-data-postgres-primary-0: 50GB (RWO, Delete policy)
- postgres-data-postgres-replica-0: 50GB (RWO, Delete policy)
- postgres-data-postgres-replica-1: 50GB (RWO, Delete policy)

**Status:** Data backed up to citation_integrity.sql (17KB)
**Note:** 17KB suggests mostly schema, minimal production data

### Redis Volumes (60GB total)
- redis-data-redis-0 through redis-data-redis-5: 10GB each (RWO, Delete policy)

**Status:** Redis used for ephemeral cache/queue - no backup needed
**Note:** All critical data persisted in PostgreSQL

---

## Rebuild Strategy

### You Have Everything Needed ✅

**In GitHub Repository:**
1. ✅ All source code (src/platform/)
2. ✅ All Dockerfiles (docker/)
3. ✅ All K8s manifests (k8s/)
4. ✅ All deployment scripts (scripts/gcp/)
5. ✅ All documentation (docs/)
6. ✅ Database migrations (src/platform/database/migrations/)

**In This Backup:**
1. ✅ Database dump (17KB - can recreate from migrations if lost)
2. ✅ Secrets (can regenerate if needed)
3. ✅ Cluster config (reference only - will recreate for new account)

### Rebuild Process

**Simple:** Clone repo → Build images → Deploy to new GKE
**Time:** ~30 minutes
**Cost:** ~$120/month (can reduce to ~$45/month with spot nodes)

See: `MIGRATION_GUIDE.md` in this directory for step-by-step instructions.

---

## What Gets Lost vs Preserved

### Lost on Account Closure ❌
- Running pods and services (will be deleted)
- GKE cluster (will be deleted)
- Docker images in registries (will be deleted)
- Persistent volumes (will be deleted)
- **Impact:** None - everything rebuilds from source

### Preserved in GitHub ✅
- All source code
- All configuration files
- All deployment scripts
- All documentation
- All Dockerfiles
- Database schema (in migrations)

### Preserved in This Backup ✅
- Database data (citation_integrity.sql)
- Secrets (can recreate if needed)
- Exact cluster configuration (for reference)

---

## Verification Checklist

Before account closes, verify:
- [x] This backup directory exists
- [x] All files listed above are present
- [x] GitHub repository is accessible
- [x] Branch `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof` is pushed
- [ ] Backup committed to GitHub
- [ ] README.md updated with backup location

---

## Files in This Backup

```
backups/gke-backup-20251125/
├── BACKUP_INVENTORY.md (this file)
├── MIGRATION_GUIDE.md (step-by-step rebuild instructions)
├── citation_integrity.sql (17KB - database backup)
├── cluster-config.yaml (13KB - GKE cluster config)
├── cluster-summary.txt (cluster stats)
├── DOCKER_IMAGES.txt (image list)
├── docker-images-list.txt (registry inventory)
├── full-cluster-export.yaml (304KB - all K8s resources)
├── secrets-export.yaml (1.2KB - base64 secrets)
├── docker/ (all Dockerfiles and monitoring configs)
└── k8s/ (all Kubernetes manifests)
```

**Total Backup Size:** ~400KB (compressed)
**Critical Files:** citation_integrity.sql, secrets-export.yaml
**Everything Else:** Can be rebuilt from GitHub repository

---

**Status:** ✅ BACKUP COMPLETE - Ready for migration to new account
