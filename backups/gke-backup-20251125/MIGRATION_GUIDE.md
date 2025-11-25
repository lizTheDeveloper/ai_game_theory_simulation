# MARCUS 3.0 GKE Migration Guide
**Created:** 2025-11-25
**Purpose:** Migrate MARCUS 3.0 from trial GCP account to new account
**Backup Date:** 2025-11-25

---

## Overview

This guide provides step-by-step instructions to rebuild the entire MARCUS 3.0 platform on a new GCP account using the backups and source code from GitHub.

**Everything you need is in this repository** - you don't need access to the old GCP account.

---

## What's Included in This Backup

```
backups/gke-backup-20251125/
├── full-cluster-export.yaml          # Complete K8s resources (304KB)
├── cluster-config.yaml               # GKE cluster configuration
├── secrets-export.yaml               # Secrets (base64 encoded)
├── citation_integrity.sql            # PostgreSQL database backup
├── docker/                           # All Dockerfiles
│   ├── Dockerfile.orchestrator       # Main orchestrator
│   ├── Dockerfile.agent              # Citation agent
│   └── ...                           # Other variants
├── k8s/                              # Kubernetes manifests
│   ├── orchestrator-deployment.yaml
│   ├── postgres-statefulset.yaml
│   ├── redis-statefulset.yaml
│   └── ...                           # All K8s configs
├── DOCKER_IMAGES.txt                 # List of all images
└── MIGRATION_GUIDE.md               # This file
```

---

## Prerequisites for New Account

### 1. Create New GCP Account

1. Go to https://cloud.google.com/
2. Sign up for new account (free trial or paid)
3. Create a new project (e.g., "marcus-platform-prod")
4. Enable billing

### 2. Install Required Tools Locally

```bash
# Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# kubectl
gcloud components install kubectl

# Docker (if not installed)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 3. Authenticate to GCP

```bash
gcloud auth login
gcloud config set project YOUR_NEW_PROJECT_ID
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## Migration Steps

### Step 1: Clone Repository (All Source Code)

```bash
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation
git checkout claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof
```

**Important:** All Dockerfiles, K8s manifests, and source code are in the repository. You don't need the backup files to rebuild - they're just for reference.

### Step 2: Enable GCP APIs

```bash
gcloud services enable \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com \
  cloudbuild.googleapis.com
```

### Step 3: Create Artifact Registry

```bash
gcloud artifacts repositories create marcus-platform \
  --repository-format=docker \
  --location=us-central1 \
  --description="MARCUS 3.0 Docker images"
```

### Step 4: Build Docker Images

**Option A: Build from Source (Recommended)**

```bash
# Set your new project ID
export PROJECT_ID=$(gcloud config get-value project)
export REGISTRY="us-central1-docker.pkg.dev/${PROJECT_ID}/marcus-platform"

# Build orchestrator
docker build -f docker/Dockerfile.orchestrator \
  -t ${REGISTRY}/orchestrator:v3.2.1 .

# Build citation agent
docker build -f docker/Dockerfile.agent \
  -t ${REGISTRY}/citation-agent:v3.2.0 .

# Push to your new registry
docker push ${REGISTRY}/orchestrator:v3.2.1
docker push ${REGISTRY}/citation-agent:v3.2.0
```

**Option B: Pull from Old Registry (If Still Accessible)**

```bash
# Only works if old account still accessible
# Pull from old registry
gcloud auth activate-service-account --key-file=old-account-key.json
docker pull us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/orchestrator:latest
docker pull us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:latest

# Tag for new registry
docker tag OLD_IMAGE ${REGISTRY}/orchestrator:v3.2.1
docker tag OLD_IMAGE ${REGISTRY}/citation-agent:v3.2.0

# Push to new registry
docker push ${REGISTRY}/orchestrator:v3.2.1
docker push ${REGISTRY}/citation-agent:v3.2.0
```

### Step 5: Create GKE Cluster

```bash
gcloud container clusters create marcus-platform \
  --region=us-central1 \
  --num-nodes=1 \
  --min-nodes=1 \
  --max-nodes=10 \
  --enable-autoscaling \
  --machine-type=e2-standard-4 \
  --disk-size=50 \
  --disk-type=pd-standard \
  --enable-autorepair \
  --enable-autoupgrade \
  --maintenance-window-start=2025-01-01T00:00:00Z \
  --maintenance-window-duration=4h

# Get credentials
gcloud container clusters get-credentials marcus-platform --region=us-central1
```

### Step 6: Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace marcus-platform

# Decode secrets from backup
kubectl apply -f backups/gke-backup-20251125/secrets-export.yaml

# OR create new secrets
kubectl create secret generic marcus-secrets \
  -n marcus-platform \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=REDIS_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=JWT_SECRET=$(openssl rand -base64 64) \
  --from-literal=JWT_REFRESH_SECRET=$(openssl rand -base64 64) \
  --from-literal=ANTHROPIC_API_KEY=your-api-key-here
```

### Step 7: Update K8s Manifests with New Image Paths

```bash
# Update image references in manifests
export NEW_PROJECT_ID=$(gcloud config get-value project)

# Replace old project ID with new one
cd k8s
sed -i "s|project-6d921a00-c010-437c-990|${NEW_PROJECT_ID}|g" *.yaml
sed -i "s|gcr.io/project-6d921a00-c010-437c-990|us-central1-docker.pkg.dev/${NEW_PROJECT_ID}/marcus-platform|g" *.yaml
```

### Step 8: Deploy to GKE

```bash
# Deploy in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/redis-statefulset.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n marcus-platform --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n marcus-platform --timeout=300s

# Deploy application
kubectl apply -f k8s/orchestrator-deployment.yaml
kubectl apply -f k8s/citation-worker-deployment-v3.1.yaml

# Deploy monitoring
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-adapter.yaml
kubectl apply -f k8s/jaeger-deployment.yaml

# Deploy scaling and ingress
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

### Step 9: Restore Database (If Needed)

```bash
# Copy SQL backup to postgres pod
kubectl cp backups/gke-backup-20251125/citation_integrity.sql \
  marcus-platform/postgres-primary-0:/tmp/restore.sql

# Restore database
kubectl exec -n marcus-platform postgres-primary-0 -- \
  bash -c "PGPASSWORD=\$POSTGRES_PASSWORD psql -U marcus_app citation_integrity < /tmp/restore.sql"
```

### Step 10: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n marcus-platform

# Check services
kubectl get svc -n marcus-platform

# Test health endpoint
kubectl exec -n marcus-platform deployment/orchestrator -- \
  curl -s http://localhost:3000/health

# Check logs
kubectl logs -n marcus-platform deployment/orchestrator --tail=50
```

---

## Alternative: Local/VM Deployment

If you don't want to use GKE, you can deploy locally or on a VM:

### Using Docker Compose

```bash
# Create docker-compose.yml (not included, needs to be created)
# Or use the existing deployment scripts

# Local deployment
./scripts/provision_marcus_vm.sh
```

### Using Systemd Services

See: `docs/MARCUS_SETUP_GUIDE.md` for complete local setup instructions.

---

## Important Files Already in Repository

**All of these are already committed to GitHub - you just need to clone the repo:**

### Source Code
- `src/platform/` - All TypeScript platform code
- `src/platform/agents/` - Python agents
- `src/platform/api/` - API server
- `src/platform/database/` - Database schemas and migrations

### Deployment Configuration
- `k8s/` - All Kubernetes manifests
- `docker/` - All Dockerfiles
- `scripts/gcp/` - GCP deployment scripts
- `scripts/` - All provisioning and setup scripts

### Documentation
- `docs/MARCUS_MASTER_TABLE_OF_CONTENTS.md` - Complete doc index
- `docs/MARCUS_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `docs/MARCUS_SETUP_GUIDE.md` - Setup instructions
- `src/platform/README.md` - Platform architecture

### Database Migrations
- `src/platform/database/migrations/` - All SQL migrations (003-007)

---

## Rebuild Checklist

Use this checklist when migrating to new account:

- [ ] Create new GCP project
- [ ] Enable required APIs
- [ ] Install gcloud/kubectl locally
- [ ] Clone GitHub repository
- [ ] Create Artifact Registry
- [ ] Build Docker images from source
- [ ] Push images to new registry
- [ ] Update K8s manifests with new project ID
- [ ] Create GKE cluster
- [ ] Create namespace and secrets
- [ ] Deploy databases (PostgreSQL, Redis)
- [ ] Deploy application (orchestrator, workers)
- [ ] Deploy monitoring (Prometheus, Grafana, Jaeger)
- [ ] Restore database backup (if needed)
- [ ] Verify all pods running
- [ ] Test health endpoints
- [ ] Test citation analysis workflow

---

## Cost Optimization for New Account

**To minimize costs on new account:**

1. **Use Spot Nodes** (already configured in `k8s/spot-node-pool.yaml`)
2. **Enable Cluster Autoscaler** (scales to 0 when idle)
3. **Use Scheduled Scaling** (shutdown at night if not needed)
4. **Smaller Node Types** (e2-medium instead of e2-standard-4 for testing)

**Cluster Power Management:**
```bash
# Shutdown cluster when not in use
./scripts/gcp/cluster-power.sh shutdown marcus-platform us-central1

# Start cluster when needed
./scripts/gcp/cluster-power.sh start marcus-platform us-central1
```

See: `scripts/gcp/cluster-power.sh` for automated cost management.

---

## Emergency: Account Closing Soon

If your account is closing immediately:

### Priority 1: Save Docker Images (Optional - can rebuild from source)

```bash
# Pull latest images
docker pull us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/orchestrator:latest
docker pull us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:latest

# Save to tar files
docker save us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/orchestrator:latest \
  > orchestrator-latest.tar

docker save us-central1-docker.pkg.dev/project-6d921a00-c010-437c-990/marcus-platform/citation-agent:latest \
  > citation-agent-latest.tar

# Upload tar files to GitHub releases or external storage
```

### Priority 2: Verify GitHub Has Everything

```bash
# Push any uncommitted changes
git add .
git commit -m "Final backup before account closure"
git push

# Verify on GitHub
# All files should be visible at:
# https://github.com/404GeneNotFound/ai_game_theory_simulation/tree/claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof
```

### Priority 3: Document Current Configuration

This backup already includes:
- ✅ Full cluster export (all K8s resources)
- ✅ Cluster configuration
- ✅ Database backup (citation_integrity.sql)
- ✅ Secrets (base64 encoded)
- ✅ All Dockerfiles
- ✅ All K8s manifests

**You have everything needed to rebuild.**

---

## What You DON'T Need from Old Account

You **do not** need:
- ❌ Docker images (can rebuild from Dockerfiles)
- ❌ GKE cluster configuration (can recreate)
- ❌ GCP-specific resources (just cost money)

You **only** need:
- ✅ This GitHub repository
- ✅ Database backup (17KB - minimal data)
- ✅ Secrets (if you want same passwords/keys)

---

## Quick Start on New Account

**Fastest path to running MARCUS 3.0:**

```bash
# 1. Setup new project
gcloud config set project YOUR_NEW_PROJECT_ID

# 2. Clone repo
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation

# 3. Run automated deployment
./scripts/gcp/deploy-to-gke.sh

# This script will:
# - Enable APIs
# - Create GKE cluster
# - Build Docker images
# - Deploy everything
# - Setup monitoring
```

See: `docs/MARCUS_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Troubleshooting

### Docker Build Fails

**Solution:** Check you're in the repository root and docker/ directory exists:
```bash
pwd  # Should be: .../ai_game_theory_simulation
ls docker/  # Should show Dockerfile.orchestrator, etc.
```

### K8s Deployment Fails

**Solution:** Check image references are updated with new project ID:
```bash
grep "image:" k8s/*.yaml | grep "project-6d921a00"
# Should return nothing after sed replacement
```

### Database Connection Fails

**Solution:** Check secrets were created:
```bash
kubectl get secret marcus-secrets -n marcus-platform -o yaml
```

---

## Support Resources

- **Main Docs:** `docs/MARCUS_MASTER_TABLE_OF_CONTENTS.md`
- **Setup Guide:** `docs/MARCUS_SETUP_GUIDE.md`
- **Deployment Guide:** `docs/MARCUS_DEPLOYMENT_GUIDE.md`
- **Architecture:** `src/platform/README.md`

---

## Summary

**You can rebuild everything from the GitHub repository alone.**

The Docker images can be rebuilt from the Dockerfiles in the `docker/` directory. The K8s manifests are in the `k8s/` directory. All deployment scripts are in `scripts/gcp/`.

**Just clone the repo and run `./scripts/gcp/deploy-to-gke.sh`**

---

**Last Updated:** 2025-11-25
**Backup Valid Until:** Account closure (safe to migrate anytime)
