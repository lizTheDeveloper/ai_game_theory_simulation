# MARCUS 3.0 - GCP Deployment Scripts

Automated deployment scripts for deploying MARCUS citation integrity platform to Google Kubernetes Engine (GKE).

## Quick Start

```bash
# 1. Authenticate to GCP
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Validate prerequisites
./validate-prerequisites.sh

# 3. Deploy everything
./deploy-to-gke.sh

# 4. Initialize database
./init-database.sh

# 5. Setup monitoring
./setup-monitoring.sh
```

**Total time:** 25-40 minutes (mostly waiting for GCP provisioning)

---

## Scripts

### validate-prerequisites.sh

Pre-flight validation before deployment.

**What it checks:**
- gcloud CLI installed and authenticated
- kubectl installed
- Docker installed and daemon running
- GCP project configured
- Docker images built locally
- k8s manifest files exist
- Disk space available
- Network connectivity

**Usage:**
```bash
./validate-prerequisites.sh
```

**Exit codes:**
- `0` - All checks passed, ready to deploy
- `1` - One or more checks failed, fix issues before deploying

---

### deploy-to-gke.sh

Main deployment script - creates cluster, pushes images, deploys k8s resources.

**What it does:**
1. Validates GCP authentication and project
2. Enables required GCP APIs (Container, Artifact Registry, Compute)
3. Creates regional GKE cluster in us-central1 (1-5 nodes, e2-standard-4)
4. Creates Artifact Registry repository
5. Tags and pushes Docker images
6. Updates k8s manifests with registry paths
7. Deploys all resources (namespace, secrets, databases, apps)
8. Waits for pods to be ready

**Usage:**
```bash
# Full deployment
./deploy-to-gke.sh

# Skip cluster creation (use existing)
./deploy-to-gke.sh --skip-cluster

# Skip image push (use already-pushed images)
./deploy-to-gke.sh --skip-images

# Skip k8s deployment (only create cluster and push images)
./deploy-to-gke.sh --skip-deploy
```

**Duration:** 20-30 minutes

---

### init-database.sh

Initialize PostgreSQL schema and default data.

**What it does:**
1. Connects to PostgreSQL primary pod
2. Creates tables (agent_states, citation_analyses, agent_metrics, etc.)
3. Creates indexes for performance
4. Inserts default agent states (9 agents)
5. Creates read-only user for reporting
6. Validates schema creation

**Usage:**
```bash
# Use default namespace (marcus-platform)
./init-database.sh

# Specify custom namespace
./init-database.sh my-namespace
```

**Duration:** < 1 minute

**Prerequisites:**
- PostgreSQL pod running in cluster
- marcus-secrets and marcus-config ConfigMap exist

---

### setup-monitoring.sh

Deploy Prometheus and Grafana monitoring stack.

**What it does:**
1. Installs kube-prometheus-stack via Helm
2. Configures Prometheus with 7-day retention, 20GB storage
3. Deploys Grafana with auto-generated password
4. Creates ServiceMonitors for orchestrator and agents
5. Configures MARCUS-specific alert rules
6. Provides access instructions

**Usage:**
```bash
# Use default namespace (marcus-platform)
./setup-monitoring.sh

# Specify custom namespace
./setup-monitoring.sh my-namespace
```

**Duration:** 3-5 minutes

**Prerequisites:**
- Helm installed
- GKE cluster running
- Orchestrator and agent deployments exist

**Access:**
```bash
# Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
# Visit: http://localhost:3001
# Login: admin / <generated-password>

# Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit: http://localhost:9090
```

---

## Troubleshooting

### Authentication Error

```
ERROR: Request had insufficient authentication scopes
```

**Solution:**
```bash
gcloud auth login
gcloud config set account your-email@example.com
```

### Docker Images Not Found

```
ERROR: marcus-orchestrator:v3.0.0 image not found locally
```

**Solution:**
```bash
# Build images from Phase 4
docker build -t marcus-orchestrator:v3.0.0 -f docker/orchestrator/Dockerfile .
docker build -t marcus-citation-agent:v3.0.0 -f docker/agent/Dockerfile .
```

### Cluster Already Exists

```
ERROR: Cluster marcus-platform already exists
```

**Solution:**
```bash
# Use existing cluster
./deploy-to-gke.sh --skip-cluster

# Or delete and recreate
gcloud container clusters delete marcus-platform --region=us-central1
./deploy-to-gke.sh
```

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n marcus-platform

# View pod events
kubectl describe pod <pod-name> -n marcus-platform

# Check logs
kubectl logs <pod-name> -n marcus-platform --tail=100
```

**Common issues:**
- `ImagePullBackOff`: Image not in registry or wrong reference
- `CrashLoopBackOff`: Application error, check logs
- `Pending`: Insufficient resources, scale up nodes

---

## Documentation

- **Deployment Guide:** `docs/GCP_DEPLOYMENT_GUIDE.md` (450+ lines)
- **Production Runbook:** `docs/PRODUCTION_RUNBOOK.md` (600+ lines)
- **Phase 5 Report:** `plans/completed/MARCUS_3.0_PHASE_5_GKE_DEPLOYMENT_READY_20251122.md`

---

## Cost

**Estimated monthly cost (us-central1):**
- Minimal (1 node): ~$173/month
- Production (3 nodes): ~$473/month
- With preemptible VMs: ~$293/month

**Cost optimization:**
- Use GKE Autopilot (pay-per-pod)
- Downsize to e2-medium for dev/test
- Stop cluster when not in use

---

**Created by:** Marcus, Platform Engineer
**Date:** November 22, 2025
**Session:** MARCUS 3.0 Phase 5
