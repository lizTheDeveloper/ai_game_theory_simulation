# MARCUS 3.1 - GKE Deployment Runbook

**Production Deployment Guide for Google Kubernetes Engine**

This runbook provides step-by-step procedures for deploying, scaling, and maintaining the MARCUS 3.1 platform on GKE.

---

## Prerequisites

**Required Tools:**
```bash
# Google Cloud SDK
gcloud --version  # >= 450.0.0

# kubectl
kubectl version --client  # >= 1.28.0

# Verify GKE cluster access
kubectl config current-context  # Should show: gke_PROJECT_ID_REGION_marcus-cluster
```

**Required Permissions:**
- `roles/container.admin` - GKE cluster management
- `roles/iam.serviceAccountAdmin` - Service account creation
- `roles/cloudsql.admin` - Cloud SQL management
- `roles/compute.loadBalancerAdmin` - Load balancer configuration

---

## Initial Cluster Setup

### 1. Create GKE Cluster

```bash
# Set environment variables
export PROJECT_ID="your-gcp-project"
export REGION="us-central1"
export CLUSTER_NAME="marcus-cluster"

# Create GKE cluster with recommended configuration
gcloud container clusters create ${CLUSTER_NAME} \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --machine-type=n2-standard-4 \
  --num-nodes=3 \
  --min-nodes=3 \
  --max-nodes=10 \
  --enable-autoscaling \
  --enable-vertical-pod-autoscaling \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-ip-alias \
  --network="default" \
  --subnetwork="default" \
  --enable-stackdriver-kubernetes \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
  --workload-pool=${PROJECT_ID}.svc.id.goog \
  --enable-shielded-nodes \
  --shielded-secure-boot \
  --release-channel=regular

# Get cluster credentials
gcloud container clusters get-credentials ${CLUSTER_NAME} \
  --region=${REGION} \
  --project=${PROJECT_ID}

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

**Expected Output:**
```
NAME                                    STATUS   ROLES    AGE   VERSION
gke-marcus-cluster-default-pool-xxxxx   Ready    <none>   1m    v1.28.x
gke-marcus-cluster-default-pool-yyyyy   Ready    <none>   1m    v1.28.x
gke-marcus-cluster-default-pool-zzzzz   Ready    <none>   1m    v1.28.x
```

---

### 2. Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace marcus
kubectl label namespace marcus environment=production

# Create JWT secrets (initial setup)
CURRENT_SECRET=$(openssl rand -base64 32)
ROTATION_TIMESTAMP=$(date -Iseconds)

kubectl create secret generic jwt-secrets \
  --namespace=marcus \
  --from-literal=current-secret="${CURRENT_SECRET}" \
  --from-literal=previous-secret="" \
  --from-literal=rotation-timestamp="${ROTATION_TIMESTAMP}"

# Create database credentials
DB_PASSWORD=$(openssl rand -base64 32)

kubectl create secret generic postgres-credentials \
  --namespace=marcus \
  --from-literal=username=postgres \
  --from-literal=password="${DB_PASSWORD}" \
  --from-literal=host=postgres.marcus.svc.cluster.local \
  --from-literal=port=5432 \
  --from-literal=database=citations

# Create Redis credentials
REDIS_PASSWORD=$(openssl rand -base64 32)

kubectl create secret generic redis-credentials \
  --namespace=marcus \
  --from-literal=password="${REDIS_PASSWORD}"

# Verify secrets
kubectl get secrets -n marcus
```

---

### 3. Deploy PostgreSQL StatefulSet

```bash
# Update postgres-statefulset.yaml with generated password
kubectl apply -f k8s/postgres-statefulset.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod/postgres-0 -n marcus --timeout=5m

# Initialize database schema
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -d citations <<EOF
-- Agent state persistence
CREATE TABLE IF NOT EXISTS agent_states (
    agent_id VARCHAR(50) PRIMARY KEY,
    reputation FLOAT NOT NULL DEFAULT 0.5,
    total_citations INTEGER NOT NULL DEFAULT 0,
    detected_violations INTEGER NOT NULL DEFAULT 0,
    current_behavior VARCHAR(50),
    memory_state JSONB NOT NULL,
    exploration_rate FLOAT NOT NULL DEFAULT 0.2,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT reputation_range CHECK (reputation >= 0 AND reputation <= 1),
    CONSTRAINT exploration_range CHECK (exploration_rate >= 0 AND exploration_rate <= 1)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_reputation ON agent_states(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_agent_timestamp ON agent_states(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memory_gin ON agent_states USING gin(memory_state);

-- Citation analysis results
CREATE TABLE IF NOT EXISTS citation_analyses (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    mean_integrity FLOAT NOT NULL,
    consensus FLOAT NOT NULL,
    behavior_distribution JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    num_agents INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT integrity_range CHECK (mean_integrity >= 0 AND mean_integrity <= 1),
    CONSTRAINT consensus_range CHECK (consensus >= 0 AND consensus <= 1)
);

-- Indexes for analysis queries
CREATE INDEX IF NOT EXISTS idx_analysis_timestamp ON citation_analyses(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_integrity ON citation_analyses(mean_integrity);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (agent_id) REFERENCES agent_states(agent_id)
);

CREATE INDEX IF NOT EXISTS idx_metrics_agent_time ON agent_metrics(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON agent_metrics(metric_name);
EOF

# Verify database initialized
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -d citations -c "\dt"
```

---

### 4. Deploy Redis StatefulSet

```bash
# Apply Redis configuration
kubectl apply -f k8s/redis-statefulset.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=ready pod/redis-0 -n marcus --timeout=5m

# Configure Redis password
REDIS_PASSWORD=$(kubectl get secret redis-credentials -n marcus -o jsonpath='{.data.password}' | base64 -d)
kubectl exec -it redis-0 -n marcus -- redis-cli CONFIG SET requirepass "${REDIS_PASSWORD}"

# Verify Redis connectivity
kubectl exec -it redis-0 -n marcus -- redis-cli -a "${REDIS_PASSWORD}" PING
# Expected: PONG
```

---

### 5. Deploy Orchestrator

```bash
# Create ConfigMap for platform configuration
kubectl apply -f k8s/configmap.yaml

# Deploy orchestrator
kubectl apply -f k8s/orchestrator-deployment.yaml

# Wait for orchestrator to be ready
kubectl wait --for=condition=ready pod -l app=marcus-orchestrator -n marcus --timeout=5m

# Verify orchestrator logs
kubectl logs -l app=marcus-orchestrator -n marcus --tail=50

# Expected log output:
# ✅ Redis connection pool initialized (20 connections)
# ✅ AgentStateManager initialized with Redis pool
# 🚀 Initializing orchestrator with 10 agents...
# ✅ Agent agent_000 started (PID: 123)
# ...
# ✅ Platform started successfully
```

---

### 6. Deploy Python Agent Workers

```bash
# Deploy agent workers (separate from orchestrator for horizontal scaling)
kubectl apply -f k8s/agent-deployment.yaml

# Wait for agents to be ready
kubectl wait --for=condition=ready pod -l app=marcus-agent -n marcus --timeout=5m

# Verify agent health
kubectl get pods -n marcus -l app=marcus-agent

# Check agent logs
kubectl logs -l app=marcus-agent -n marcus --tail=20
```

---

### 7. Configure HPA (Horizontal Pod Autoscaler)

```bash
# Apply HPA for orchestrator
kubectl apply -f k8s/hpa.yaml

# Apply HPA for citation workers
kubectl apply -f k8s/hpa-citation-workers.yaml

# Verify HPA status
kubectl get hpa -n marcus

# Expected output:
# NAME                        REFERENCE                          TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
# orchestrator-hpa            Deployment/orchestrator            15%/70%         3         10        3          1m
# citation-workers-hpa        Deployment/agent                   20%/80%         5         20        5          1m
```

---

### 8. Configure Ingress with Cloud Armor

```bash
# Apply Cloud Armor security policy
kubectl apply -f k8s/cloudarmor-policy.yaml

# Apply ingress with rate limiting
kubectl apply -f k8s/gke-ingress-with-cloudarmor.yaml

# Wait for load balancer to provision (5-10 minutes)
kubectl get ingress -n marcus -w

# Get load balancer IP
INGRESS_IP=$(kubectl get ingress marcus-ingress -n marcus -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Load Balancer IP: ${INGRESS_IP}"

# Configure DNS (example with Cloud DNS)
gcloud dns record-sets transaction start --zone=marcus-zone
gcloud dns record-sets transaction add ${INGRESS_IP} \
  --name=api.marcus.example.com. \
  --ttl=300 \
  --type=A \
  --zone=marcus-zone
gcloud dns record-sets transaction execute --zone=marcus-zone

# Verify ingress
curl -k https://${INGRESS_IP}/health
# Expected: {"status":"ok","agents":{"total":10,"healthy":10},...}
```

---

### 9. Deploy Secret Rotation CronJob

```bash
# Apply secret rotation CronJob
kubectl apply -f k8s/cronjob-secret-rotation.yaml

# Verify CronJob created
kubectl get cronjob -n marcus

# Manually trigger first rotation (optional)
kubectl create job --from=cronjob/secret-rotation manual-rotation-$(date +%s) -n marcus

# Watch rotation job
kubectl logs -f job/manual-rotation-TIMESTAMP -n marcus
```

---

### 10. Configure Monitoring and Alerting

```bash
# Apply Prometheus service monitors (if using Prometheus Operator)
kubectl apply -f k8s/prometheus-adapter.yaml

# Apply alert rules
kubectl apply -f k8s/cronjob-secret-rotation.yaml  # Contains Prometheus alert rules

# Verify Prometheus scraping
kubectl port-forward -n marcus deploy/orchestrator 9090:9090 &
curl http://localhost:9090/metrics | grep marcus_

# Expected: Prometheus metrics output
```

---

## Deployment Verification Checklist

Run these checks after initial deployment:

```bash
# 1. All pods running
kubectl get pods -n marcus
# Expected: All pods in Running state, 0 restarts

# 2. Health check passes
curl https://api.marcus.example.com/health
# Expected: {"status":"ok",...}

# 3. Metrics endpoint accessible
curl https://api.marcus.example.com/metrics
# Expected: Prometheus metrics output

# 4. Agent pool healthy
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:8080/api/agents | jq '.summary.healthyAgents'
# Expected: 10 (or configured agent count)

# 5. Database connectivity
kubectl exec -it postgres-0 -n marcus -- psql -U postgres -d citations -c "SELECT COUNT(*) FROM agent_states;"
# Expected: Row count

# 6. Redis connectivity
REDIS_PASSWORD=$(kubectl get secret redis-credentials -n marcus -o jsonpath='{.data.password}' | base64 -d)
kubectl exec -it redis-0 -n marcus -- redis-cli -a "${REDIS_PASSWORD}" PING
# Expected: PONG

# 7. HPA functioning
kubectl top pods -n marcus
# Expected: CPU/memory metrics visible

# 8. Ingress routing
curl -X POST https://api.marcus.example.com/api/citations/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test citation","claimedSource":"Test 2024"}'
# Expected: 200 OK with analysis result
```

---

## Rolling Updates

### Update Orchestrator Image

```bash
# Build and push new image
export VERSION="3.1.1"
docker build -t gcr.io/${PROJECT_ID}/marcus-orchestrator:${VERSION} .
docker push gcr.io/${PROJECT_ID}/marcus-orchestrator:${VERSION}

# Update deployment
kubectl set image deployment/orchestrator \
  orchestrator=gcr.io/${PROJECT_ID}/marcus-orchestrator:${VERSION} \
  -n marcus

# Watch rollout
kubectl rollout status deployment/orchestrator -n marcus

# Verify new version
kubectl get pods -n marcus -l app=marcus-orchestrator -o jsonpath='{.items[0].spec.containers[0].image}'
# Expected: gcr.io/PROJECT_ID/marcus-orchestrator:3.1.1

# Check for errors
kubectl logs -l app=marcus-orchestrator -n marcus --tail=50
```

### Rollback on Failure

```bash
# Rollback to previous version
kubectl rollout undo deployment/orchestrator -n marcus

# Or rollback to specific revision
kubectl rollout history deployment/orchestrator -n marcus
kubectl rollout undo deployment/orchestrator -n marcus --to-revision=2

# Verify rollback
kubectl rollout status deployment/orchestrator -n marcus
```

---

## Scaling Operations

### Manual Scaling

```bash
# Scale orchestrator horizontally
kubectl scale deployment orchestrator -n marcus --replicas=5

# Scale agent workers
kubectl scale deployment agent -n marcus --replicas=15

# Verify scaling
kubectl get pods -n marcus
```

### Vertical Scaling (Resource Limits)

```bash
# Update resource limits
kubectl patch deployment orchestrator -n marcus --patch '
spec:
  template:
    spec:
      containers:
      - name: orchestrator
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
'

# Trigger rolling restart with new limits
kubectl rollout restart deployment/orchestrator -n marcus
```

---

## Backup and Restore

### Backup PostgreSQL Database

```bash
# Create backup
kubectl exec -it postgres-0 -n marcus -- pg_dump -U postgres -d citations > backup-$(date +%Y%m%d-%H%M%S).sql

# Upload to Cloud Storage
gsutil cp backup-*.sql gs://marcus-backups/database/
```

### Restore from Backup

```bash
# Download backup
gsutil cp gs://marcus-backups/database/backup-YYYYMMDD-HHMMSS.sql ./

# Restore database
kubectl exec -i postgres-0 -n marcus -- psql -U postgres -d citations < backup-YYYYMMDD-HHMMSS.sql
```

---

## Troubleshooting Common Issues

### Pods CrashLooping

```bash
# Check pod logs
kubectl logs -n marcus POD_NAME --previous

# Describe pod for events
kubectl describe pod -n marcus POD_NAME

# Common causes:
# - Missing secrets → Verify: kubectl get secrets -n marcus
# - Database connection failed → Check postgres pod: kubectl logs postgres-0 -n marcus
# - Image pull errors → Verify GCR permissions
```

### High Latency

```bash
# Check Prometheus metrics
kubectl port-forward -n marcus deploy/orchestrator 9090:9090 &
curl http://localhost:9090/metrics | grep -E 'marcus_http_request_duration|marcus_agent_request_duration'

# Check HPA status
kubectl get hpa -n marcus

# Scale up if needed
kubectl scale deployment orchestrator -n marcus --replicas=10
```

### Database Connection Pool Exhausted

```bash
# Check pool metrics
kubectl exec -it deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep marcus_db_pool

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
'
```

---

## Maintenance Windows

### Scheduled Maintenance Procedure

```bash
# 1. Notify users (post to status page)
# 2. Scale down to minimum replicas
kubectl scale deployment orchestrator -n marcus --replicas=1
kubectl scale deployment agent -n marcus --replicas=1

# 3. Perform maintenance (e.g., database upgrade)
# ...

# 4. Scale back up
kubectl scale deployment orchestrator -n marcus --replicas=3
kubectl scale deployment agent -n marcus --replicas=5

# 5. Verify health
curl https://api.marcus.example.com/health
```

---

## References

- **Kubernetes YAML Files:** `/k8s/`
- **Monitoring Dashboards:** `src/platform/monitoring/grafanaDashboards/`
- **SLO Definitions:** `docs/SLO_DEFINITIONS.md`
- **Troubleshooting Guide:** `docs/TROUBLESHOOTING_GUIDE.md`
- **Secret Rotation:** `docs/SECRET_ROTATION_PROCEDURES.md`

---

**Last Updated:** 2025-11-22
**Maintained by:** Platform Engineering (Marcus)
