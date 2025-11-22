# MARCUS 3.0 - GCP Deployment Guide

**Last Updated:** November 22, 2025
**Platform Engineer:** Marcus (marcus-platform-001)
**Target Environment:** Google Kubernetes Engine (GKE)

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Deployment Steps](#detailed-deployment-steps)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Accessing Services](#accessing-services)
7. [Troubleshooting](#troubleshooting)
8. [Cost Management](#cost-management)
9. [Production Checklist](#production-checklist)

---

## Overview

This guide covers deploying the MARCUS 3.0 citation integrity platform to Google Cloud Platform using Google Kubernetes Engine (GKE). The deployment includes:

- **GKE Cluster:** Regional cluster with autoscaling (1-5 nodes)
- **PostgreSQL:** Self-hosted StatefulSet with primary + 2 replicas
- **Redis Cluster:** 6-node cluster (3 primary + 3 replica)
- **Orchestrator API:** 3 replicas for high availability
- **Citation Agents:** 5 worker replicas (scalable)
- **Monitoring:** Prometheus + Grafana stack
- **Ingress:** Google Cloud Load Balancer with TLS

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│              Google Cloud Platform               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         GKE Cluster (us-central1)          │ │
│  │                                            │ │
│  │  ┌──────────────┐    ┌─────────────────┐ │ │
│  │  │ Orchestrator │◄───┤ Cloud Load      │ │ │
│  │  │ (3 replicas) │    │ Balancer + TLS  │ │ │
│  │  └──────┬───────┘    └─────────────────┘ │ │
│  │         │                                 │ │
│  │  ┌──────▼─────────┐   ┌────────────────┐ │ │
│  │  │ Citation Agents│   │ PostgreSQL     │ │ │
│  │  │ (5 replicas)   │◄──┤ StatefulSet    │ │ │
│  │  └──────┬─────────┘   │ (1P + 2R)      │ │ │
│  │         │              └────────────────┘ │ │
│  │         │              ┌────────────────┐ │ │
│  │         └─────────────►│ Redis Cluster  │ │ │
│  │                        │ (6 nodes)      │ │ │
│  │                        └────────────────┘ │ │
│  │                                            │ │
│  │  ┌──────────────────────────────────────┐ │ │
│  │  │ Monitoring (Prometheus + Grafana)    │ │ │
│  │  └──────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Tools

- **gcloud CLI** (v400+) - [Install Guide](https://cloud.google.com/sdk/docs/install)
- **kubectl** (v1.25+) - [Install Guide](https://kubernetes.io/docs/tasks/tools/)
- **Docker** (v20+) - [Install Guide](https://docs.docker.com/get-docker/)
- **Helm** (v3.10+) - [Install Guide](https://helm.sh/docs/intro/install/)

### GCP Requirements

- **GCP Account** with billing enabled
- **Project ID** configured
- **Permissions:**
  - `roles/container.admin` (create GKE clusters)
  - `roles/artifactregistry.admin` (push Docker images)
  - `roles/compute.admin` (create load balancers)
  - `roles/iam.serviceAccountUser` (service account binding)

### Local Requirements

- **Docker Images Built:**
  - `marcus-orchestrator:v3.0.0` (3.5GB)
  - `marcus-citation-agent:v3.0.0` (629MB)
- **Disk Space:** At least 10GB free
- **Network:** Internet connectivity to GCP

### Validation

Run the validation script to check all prerequisites:

```bash
./scripts/gcp/validate-prerequisites.sh
```

Expected output:
```
=== MARCUS 3.0 GKE Deployment Prerequisites ===

1. Checking gcloud CLI...
✓ gcloud CLI installed (version: 546.0.0)

2. Checking kubectl...
✓ kubectl installed (version: v1.34.2)

...

✓ All critical checks passed - ready for deployment
```

---

## Quick Start

For users who want to deploy immediately (all prerequisites met):

```bash
# 1. Authenticate to GCP (if not already authenticated)
gcloud auth login

# 2. Set your project ID
gcloud config set project YOUR_PROJECT_ID

# 3. Validate prerequisites
./scripts/gcp/validate-prerequisites.sh

# 4. Deploy everything (cluster + images + k8s resources)
./scripts/gcp/deploy-to-gke.sh

# 5. Initialize database schema
./scripts/gcp/init-database.sh

# 6. Setup monitoring
./scripts/gcp/setup-monitoring.sh

# 7. Verify deployment
kubectl get pods -n marcus-platform
```

**Estimated time:** 20-30 minutes (mostly cluster creation)

---

## Detailed Deployment Steps

### Step 1: Authenticate to GCP

If running on a local machine or non-GCP environment:

```bash
# Login with your Google account
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config list
```

If running on a GCE VM with insufficient scopes:

```bash
# Option 1: Authenticate with your personal account
gcloud auth login
gcloud config set account your-email@example.com

# Option 2: Update VM service account scopes (requires VM restart)
# See: https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances#changeserviceaccountandscopes
```

### Step 2: Create GKE Cluster

The deployment script will create a regional GKE cluster:

```bash
./scripts/gcp/deploy-to-gke.sh
```

**What it does:**
1. Enables required GCP APIs (Container, Artifact Registry, Compute)
2. Creates regional GKE cluster in `us-central1` (3 zones)
3. Configures autoscaling (1-5 nodes, e2-standard-4 instances)
4. Sets up `kubectl` credentials

**Manual creation (alternative):**

```bash
gcloud container clusters create marcus-platform \
  --region=us-central1 \
  --num-nodes=1 \
  --min-nodes=1 \
  --max-nodes=5 \
  --enable-autoscaling \
  --machine-type=e2-standard-4 \
  --disk-size=50GB \
  --enable-stackdriver-kubernetes \
  --enable-ip-alias \
  --scopes=cloud-platform \
  --quiet

# Get credentials
gcloud container clusters get-credentials marcus-platform --region=us-central1
```

### Step 3: Push Docker Images to Artifact Registry

The deployment script handles this automatically, but manual steps:

```bash
# Create Artifact Registry repository
gcloud artifacts repositories create marcus-images \
  --repository-format=docker \
  --location=us-central1 \
  --description="MARCUS platform images"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# Tag images
PROJECT_ID=$(gcloud config get-value project)
REGISTRY="us-central1-docker.pkg.dev/${PROJECT_ID}/marcus-images"

docker tag marcus-orchestrator:v3.0.0 ${REGISTRY}/marcus-orchestrator:v3.0.0
docker tag marcus-citation-agent:v3.0.0 ${REGISTRY}/marcus-citation-agent:v3.0.0

# Push images (this takes time for 3.5GB orchestrator image)
docker push ${REGISTRY}/marcus-orchestrator:v3.0.0
docker push ${REGISTRY}/marcus-citation-agent:v3.0.0

# Verify
gcloud artifacts docker images list ${REGISTRY}
```

### Step 4: Deploy Kubernetes Resources

The deployment script applies all manifests with updated image references:

```bash
# Automatic deployment
./scripts/gcp/deploy-to-gke.sh

# Manual deployment
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml  # Auto-generated if missing
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/redis-statefulset.yaml
kubectl apply -f k8s/orchestrator-deployment.yaml
kubectl apply -f k8s/agent-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

**Wait for pods to be ready:**

```bash
kubectl get pods -n marcus-platform --watch
```

Expected output:
```
NAME                               READY   STATUS    RESTARTS   AGE
postgres-primary-0                 1/1     Running   0          5m
postgres-replica-0                 1/1     Running   0          4m
postgres-replica-1                 1/1     Running   0          4m
redis-0                            1/1     Running   0          4m
redis-1                            1/1     Running   0          4m
redis-2                            1/1     Running   0          4m
redis-3                            1/1     Running   0          3m
redis-4                            1/1     Running   0          3m
redis-5                            1/1     Running   0          3m
orchestrator-xxxxx-xxxxx           1/1     Running   0          2m
orchestrator-xxxxx-yyyyy           1/1     Running   0          2m
orchestrator-xxxxx-zzzzz           1/1     Running   0          2m
citation-agent-xxxxx-xxxxx         1/1     Running   0          1m
citation-agent-xxxxx-yyyyy         1/1     Running   0          1m
citation-agent-xxxxx-zzzzz         1/1     Running   0          1m
citation-agent-xxxxx-aaaaa         1/1     Running   0          1m
citation-agent-xxxxx-bbbbb         1/1     Running   0          1m
```

### Step 5: Initialize Database Schema

```bash
./scripts/gcp/init-database.sh
```

**What it does:**
1. Connects to PostgreSQL primary pod
2. Creates tables: `agent_states`, `citation_analyses`, `agent_metrics`, `citation_tasks`, `learning_history`
3. Creates indexes for performance
4. Inserts default agent states (9 agents)
5. Creates read-only user for reporting

**Verify schema:**

```bash
POSTGRES_POD=$(kubectl get pod -n marcus-platform -l app=postgres,role=primary -o name | head -1)
kubectl exec -n marcus-platform $POSTGRES_POD -- psql -U marcus -d citation_integrity -c "\dt"
```

### Step 6: Setup Monitoring

```bash
./scripts/gcp/setup-monitoring.sh
```

**What it does:**
1. Installs Prometheus + Grafana via Helm (kube-prometheus-stack)
2. Creates ServiceMonitors for orchestrator and agents
3. Configures alert rules for MARCUS-specific metrics
4. Generates Grafana admin password

**Access Grafana:**

```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
```

Visit: http://localhost:3001
Login: `admin` / `<generated-password>`

---

## Post-Deployment Configuration

### Update Secrets for Production

The deployment script generates random secrets. For production:

```bash
kubectl edit secret marcus-secrets -n marcus-platform
```

Update:
- `POSTGRES_PASSWORD` - Strong password for database
- `REDIS_PASSWORD` - Strong password for Redis
- `JWT_SECRET` - 256-bit secret for API tokens

After updating secrets, restart pods:

```bash
kubectl rollout restart deployment orchestrator -n marcus-platform
kubectl rollout restart deployment citation-agent -n marcus-platform
kubectl rollout restart statefulset postgres-primary -n marcus-platform
kubectl rollout restart statefulset redis -n marcus-platform
```

### Configure TLS/Domain

Update `k8s/ingress.yaml` with your domain:

```yaml
spec:
  rules:
  - host: marcus.yourdomain.com  # <-- Replace
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

Reserve static IP:

```bash
gcloud compute addresses create marcus-ip --global
gcloud compute addresses describe marcus-ip --global --format="value(address)"
```

Update DNS A record: `marcus.yourdomain.com` → `<static-ip>`

Apply ingress:

```bash
kubectl apply -f k8s/ingress.yaml
```

Google-managed certificate will provision automatically (takes 15-30 minutes).

### Enable Horizontal Pod Autoscaling

```bash
# Autoscale citation agents based on CPU
kubectl autoscale deployment citation-agent -n marcus-platform \
  --min=3 --max=20 --cpu-percent=70

# Autoscale orchestrator based on requests
kubectl autoscale deployment orchestrator -n marcus-platform \
  --min=2 --max=10 --cpu-percent=60
```

---

## Accessing Services

### Local Development (Port-Forward)

```bash
# Orchestrator API
kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000

# Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80

# Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# PostgreSQL (read-only)
kubectl port-forward -n marcus-platform svc/postgres-primary 5432:5432

# Redis
kubectl port-forward -n marcus-platform svc/redis 6379:6379
```

### Production (Ingress)

After configuring domain and TLS:

```bash
# API endpoint
https://marcus.yourdomain.com/health

# Metrics endpoint
https://marcus.yourdomain.com/metrics

# Analysis endpoint
https://marcus.yourdomain.com/api/citations/analyze
```

### API Usage Examples

**Health check:**

```bash
curl https://marcus.yourdomain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "agents": {"total": 5, "healthy": 5},
  "database": true,
  "redis": true,
  "timestamp": "2025-11-22T04:30:00.000Z"
}
```

**Citation analysis:**

```bash
curl -X POST https://marcus.yourdomain.com/api/citations/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "document": {
      "text": "According to Smith et al. (2024), climate models predict 2-3°C warming.",
      "citations": [{
        "text": "Smith et al. (2024)",
        "expected_content": "Climate projections show warming under current scenarios."
      }]
    }
  }'
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n marcus-platform

# Describe pod for events
kubectl describe pod <pod-name> -n marcus-platform

# Check logs
kubectl logs <pod-name> -n marcus-platform --tail=100

# Common issues:
# - ImagePullBackOff: Image not in registry or wrong reference
# - CrashLoopBackOff: Application error, check logs
# - Pending: Insufficient resources, scale up nodes
```

### Database Connection Errors

```bash
# Check PostgreSQL pod
kubectl logs -n marcus-platform postgres-primary-0

# Verify secret
kubectl get secret marcus-secrets -n marcus-platform -o yaml

# Test connection
kubectl exec -n marcus-platform postgres-primary-0 -- psql -U marcus -d citation_integrity -c "SELECT 1"
```

### Redis Cluster Not Forming

```bash
# Check Redis pods
kubectl get pods -n marcus-platform -l app=redis

# Check cluster status
kubectl exec -n marcus-platform redis-0 -- redis-cli cluster info

# Re-run cluster init
kubectl delete job redis-cluster-init -n marcus-platform
kubectl apply -f k8s/redis-statefulset.yaml
```

### High Latency / Performance Issues

```bash
# Check resource usage
kubectl top pods -n marcus-platform

# Check HPA status
kubectl get hpa -n marcus-platform

# Scale manually if needed
kubectl scale deployment citation-agent -n marcus-platform --replicas=10
```

### Monitoring Not Working

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit: http://localhost:9090/targets

# Check ServiceMonitors
kubectl get servicemonitor -n marcus-platform

# Verify metrics endpoints
kubectl exec -n marcus-platform <orchestrator-pod> -- curl localhost:9090/metrics
```

---

## Cost Management

### Estimated Monthly Costs (us-central1)

| Resource | Configuration | Monthly Cost (USD) |
|----------|---------------|-------------------|
| GKE Cluster Management | Free | $0 |
| Compute (1 e2-standard-4 node) | 4 vCPU, 16GB RAM | ~$120 |
| Persistent Disks | 150GB SSD | ~$25 |
| Load Balancer | 1 forwarding rule | ~$18 |
| Network Egress | <1TB | ~$10 |
| **Total (single node)** | | **~$173/month** |
| **Total (3 nodes at scale)** | | **~$460/month** |

### Cost Optimization Strategies

1. **Use Preemptible VMs:**
   ```bash
   gcloud container node-pools create preemptible-pool \
     --cluster=marcus-platform \
     --region=us-central1 \
     --preemptible \
     --num-nodes=2 \
     --machine-type=e2-standard-4
   ```
   Saves ~60% on compute costs

2. **Downsize for dev/test:**
   ```bash
   # Use smaller machine types
   --machine-type=e2-medium  # 2 vCPU, 4GB RAM (~$24/month)
   ```

3. **Use GKE Autopilot:**
   ```bash
   gcloud container clusters create-auto marcus-platform-autopilot \
     --region=us-central1
   ```
   Pay only for running pods, not nodes (~$100-150/month)

4. **Stop cluster when not in use:**
   ```bash
   # Scale to zero
   kubectl scale deployment --all --replicas=0 -n marcus-platform

   # Or delete cluster entirely
   gcloud container clusters delete marcus-platform --region=us-central1
   ```

---

## Production Checklist

Before going to production:

### Security

- [ ] Update all secrets (PostgreSQL, Redis, JWT)
- [ ] Enable Network Policies (restrict pod-to-pod traffic)
- [ ] Enable Workload Identity (GCP service account binding)
- [ ] Configure Pod Security Standards
- [ ] Enable Binary Authorization (image signing)
- [ ] Set up VPC firewall rules
- [ ] Use private GKE cluster (no public IPs)

### Reliability

- [ ] Configure Pod Disruption Budgets (PDB)
- [ ] Set resource requests/limits on all pods
- [ ] Enable pod autoscaling (HPA)
- [ ] Configure liveness/readiness probes
- [ ] Set up persistent volume backups
- [ ] Test disaster recovery procedures
- [ ] Configure high availability for databases

### Monitoring

- [ ] Import Grafana dashboards
- [ ] Configure Alertmanager notifications (Slack, PagerDuty)
- [ ] Set up log aggregation (Cloud Logging)
- [ ] Enable distributed tracing (Jaeger/Zipkin)
- [ ] Create SLO dashboards (uptime, latency, errors)
- [ ] Set up synthetic monitoring (uptime checks)

### Operations

- [ ] Document runbook procedures
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure automated backups
- [ ] Test rollback procedures
- [ ] Set up staging environment
- [ ] Document on-call procedures
- [ ] Create incident response playbook

---

## Next Steps

1. **Production Hardening:** Follow production checklist above
2. **CI/CD Setup:** Automate deployments with GitHub Actions
3. **Performance Tuning:** Benchmark and optimize based on real traffic
4. **Feature Development:** Add new capabilities to platform
5. **Scale Testing:** Validate performance at 100+ agents

---

## Support & Resources

- **Documentation:** `docs/` directory
- **Runbook:** `docs/PRODUCTION_RUNBOOK.md`
- **Architecture:** `plans/MARCUS_3.0_PHASE_5_CLOUD_DEPLOYMENT.md`
- **Phase 4 Report:** `plans/completed/MARCUS_3.0_PHASE_4_DOCKER_COMPLETE_20251122.md`

---

**Deployment completed by:** Marcus, Platform Engineer
**Date:** November 22, 2025
**Session:** MARCUS 3.0 Phase 5 - Cloud Deployment
