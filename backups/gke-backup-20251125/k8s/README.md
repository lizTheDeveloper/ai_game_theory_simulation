# MARCUS 3.0 Kubernetes Deployment

Production-ready Kubernetes manifests for deploying the MARCUS Citation Integrity Platform.

## Architecture Overview

### Components

**Application Layer:**
- **Orchestrator** (3-20 replicas): TypeScript orchestration service with HPA
- **Citation Agent** (5-50 replicas): Python citation integrity agents with HPA

**Data Layer:**
- **PostgreSQL Primary** (1 replica): Primary database with streaming replication
- **PostgreSQL Replicas** (2 replicas): Read replicas for high availability
- **Redis Cluster** (6 nodes): 3 primary + 3 replica distributed cache

**Service Mesh:**
- **Istio**: Traffic management, mTLS, observability
- **Prometheus Adapter**: Custom metrics for HPA
- **Cert Manager**: Automatic TLS certificate management

## Prerequisites

1. **Kubernetes Cluster** (v1.24+)
   - Minimum 5 nodes (3 for app, 2 for data)
   - Node sizes: 4 CPU / 16GB RAM

2. **Installed Components:**
   ```bash
   # Istio service mesh
   istioctl install --set profile=production

   # Prometheus operator
   kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

   # Cert Manager
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

   # Metrics Server (for HPA)
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

   # Vertical Pod Autoscaler (optional)
   git clone https://github.com/kubernetes/autoscaler.git
   cd autoscaler/vertical-pod-autoscaler
   ./hack/vpa-up.sh
   ```

3. **Storage Classes:**
   - `standard-rwo`: ReadWriteOnce storage for StatefulSets

4. **Ingress Controller:**
   - NGINX Ingress Controller or equivalent

## Quick Start

### 1. Create Secrets

```bash
# Generate secure secrets
kubectl create secret generic marcus-secrets \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=JWT_REFRESH_SECRET=$(openssl rand -base64 32) \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=POSTGRES_USER=marcus_app \
  --from-literal=REDIS_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=ENCRYPTION_KEY=$(openssl rand -base64 32) \
  --namespace marcus-platform
```

### 2. Deploy with Kustomize

```bash
# Apply all manifests
kubectl apply -k .

# Watch deployment progress
kubectl get pods -n marcus-platform -w
```

### 3. Initialize Redis Cluster

```bash
# Wait for Redis pods to be ready
kubectl wait --for=condition=ready pod -l app=redis -n marcus-platform --timeout=300s

# Run cluster initialization job
kubectl apply -f redis-cluster-init.yaml

# Verify cluster status
kubectl exec -it redis-0 -n marcus-platform -- redis-cli --auth $REDIS_PASSWORD cluster info
```

### 4. Initialize PostgreSQL Replication

```bash
# Create replication user on primary
kubectl exec -it postgres-primary-0 -n marcus-platform -- psql -U marcus_app -d citation_integrity -c "CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'REPLICATOR_PASSWORD';"

# Update replica recovery.conf with replicator password
# Then restart replicas to begin streaming replication
kubectl rollout restart statefulset/postgres-replica -n marcus-platform
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n marcus-platform

# Check services
kubectl get svc -n marcus-platform

# Check HPA status
kubectl get hpa -n marcus-platform

# Check Istio virtual services
kubectl get virtualservice -n marcus-platform
```

## Configuration

### Scaling

**Manual scaling:**
```bash
# Scale orchestrator
kubectl scale deployment orchestrator --replicas=5 -n marcus-platform

# Scale citation agents
kubectl scale deployment citation-agent --replicas=10 -n marcus-platform
```

**HPA configuration:**
- Orchestrator: 3-20 replicas (70% CPU, 80% memory, 100 req/s, 50 active citations)
- Citation Agent: 5-50 replicas (60% CPU, 70% memory, queue depth, response time)

### Resource Limits

**Orchestrator:**
- Requests: 250m CPU / 512Mi memory
- Limits: 1000m CPU / 1Gi memory

**Citation Agent:**
- Requests: 100m CPU / 256Mi memory
- Limits: 500m CPU / 512Mi memory

**PostgreSQL:**
- Requests: 500m CPU / 1Gi memory
- Limits: 1000m CPU / 2Gi memory

**Redis:**
- Requests: 250m CPU / 512Mi memory
- Limits: 500m CPU / 1Gi memory

## Monitoring

### Prometheus Metrics

Access Prometheus at:
```bash
kubectl port-forward -n marcus-platform svc/prometheus 9090:9090
```

**Custom metrics for HPA:**
- `http_requests_per_second`: Request rate per pod
- `active_citations_count`: Active citations being processed
- `agent_queue_depth`: Agent work queue depth
- `agent_response_time_p95_seconds`: Agent response time (P95)

### Grafana Dashboards

6 production dashboards available (from Phase 4):
- Citation Analysis
- Agent Performance
- Infrastructure
- Security
- Business Metrics
- Baseline Monitoring

### Distributed Tracing

Access Jaeger UI:
```bash
kubectl port-forward -n marcus-platform svc/jaeger-query 16686:16686
```

## Istio Service Mesh

### Features Enabled

**Traffic Management:**
- Canary deployments (95% stable, 5% canary)
- Circuit breakers (3 consecutive errors → 30s ejection)
- Retry policies (3 attempts, exponential backoff)
- Load balancing (LEAST_REQUEST for orchestrator, consistent hash for agents)

**Security:**
- mTLS (STRICT mode between all services)
- JWT authentication (required for /api/* endpoints)
- RBAC (admin, operator, viewer roles)
- Rate limiting (100 req/min via Envoy)

**Observability:**
- 100% trace sampling (reduce in production)
- Access logging (errors only)
- Custom metrics (citation_id, user_id, response_code)

### Chaos Engineering

Test failure scenarios:
```bash
# 10% of requests delayed by 5s
kubectl apply -f istio/traffic-management.yaml
curl -H "x-chaos-test: delay" https://api.marcus.example.com/api/citations/analyze

# 5% of requests abort with 503
curl -H "x-chaos-test: abort" https://api.marcus.example.com/api/citations/analyze
```

## High Availability

### PostgreSQL Replication

**Architecture:**
- 1 primary (read-write)
- 2 replicas (read-only)
- Streaming replication with WAL shipping

**Failover:**
```bash
# Manual failover (promote replica to primary)
kubectl exec -it postgres-replica-0 -n marcus-platform -- pg_ctlcluster 15 main promote

# Update primary service to point to new primary
kubectl patch svc postgres-primary -n marcus-platform -p '{"spec":{"selector":{"statefulset.kubernetes.io/pod-name":"postgres-replica-0"}}}'
```

### Redis Cluster

**Architecture:**
- 6 nodes (3 primary + 3 replica)
- Hash slots: 16384 divided across primaries
- Automatic failover

**Cluster operations:**
```bash
# Check cluster status
kubectl exec -it redis-0 -n marcus-platform -- redis-cli --auth $REDIS_PASSWORD cluster info

# Rebalance cluster
kubectl exec -it redis-0 -n marcus-platform -- redis-cli --auth $REDIS_PASSWORD --cluster rebalance redis-0.redis-headless.marcus-platform.svc.cluster.local:6379
```

## Security

### Secrets Management

**Production secrets:**
1. Use external secrets operator (AWS Secrets Manager, HashiCorp Vault)
2. Never commit secrets to version control
3. Rotate secrets every 90 days

**Integration example:**
```bash
# AWS Secrets Manager
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets
  namespace: marcus-platform
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
EOF
```

### Network Policies

Apply strict network policies (not included, add as needed):
```bash
# Deny all by default
kubectl apply -f network-policies/deny-all.yaml

# Allow orchestrator → agents
kubectl apply -f network-policies/allow-orchestrator-agents.yaml

# Allow orchestrator → databases
kubectl apply -f network-policies/allow-orchestrator-databases.yaml
```

## Troubleshooting

### Pod not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n marcus-platform

# Check logs
kubectl logs <pod-name> -n marcus-platform --previous

# Check resource constraints
kubectl top pods -n marcus-platform
```

### HPA not scaling

```bash
# Check metrics server
kubectl get apiservices | grep metrics

# Check custom metrics
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1 | jq .

# Check HPA status
kubectl describe hpa orchestrator-hpa -n marcus-platform
```

### Database connection failures

```bash
# Check PostgreSQL logs
kubectl logs postgres-primary-0 -n marcus-platform

# Test connection from orchestrator
kubectl exec -it <orchestrator-pod> -n marcus-platform -- psql -h postgres-primary -U marcus_app -d citation_integrity

# Check connection pool
kubectl exec -it <orchestrator-pod> -n marcus-platform -- curl localhost:9090/metrics | grep db_pool
```

### Istio issues

```bash
# Check proxy status
istioctl proxy-status -n marcus-platform

# Check configuration
istioctl analyze -n marcus-platform

# Check mTLS status
istioctl authn tls-check <pod-name> -n marcus-platform
```

## Maintenance

### Backup & Restore

**PostgreSQL:**
```bash
# Backup
kubectl exec postgres-primary-0 -n marcus-platform -- pg_dump -U marcus_app citation_integrity > backup.sql

# Restore
kubectl exec -i postgres-primary-0 -n marcus-platform -- psql -U marcus_app citation_integrity < backup.sql
```

**Redis (cluster backup):**
```bash
# Trigger RDB snapshot on all nodes
for i in 0 1 2 3 4 5; do
  kubectl exec redis-$i -n marcus-platform -- redis-cli --auth $REDIS_PASSWORD BGSAVE
done

# Copy RDB files
kubectl cp marcus-platform/redis-0:/data/dump.rdb ./redis-backup/dump-0.rdb
```

### Upgrading

**Rolling update:**
```bash
# Update image tag in kustomization.yaml
# Then apply
kubectl apply -k .

# Monitor rollout
kubectl rollout status deployment/orchestrator -n marcus-platform
kubectl rollout status deployment/citation-agent -n marcus-platform
```

**Rollback:**
```bash
kubectl rollout undo deployment/orchestrator -n marcus-platform
```

## Cost Optimization

**Recommendations:**
1. Use preemptible/spot instances for agent pools
2. Enable cluster autoscaler
3. Use VPA recommendations for right-sizing
4. Reduce trace sampling (10% for production)
5. Use Redis persistence (AOF disabled for ephemeral caches)

## Performance Tuning

**Database:**
- Tune `shared_buffers`, `effective_cache_size` in postgres-config
- Monitor slow queries, add indexes
- Use read replicas for analytics queries

**Redis:**
- Adjust `maxmemory-policy` based on workload
- Monitor eviction rate
- Use pipelining for bulk operations

**Application:**
- Tune connection pool sizes
- Enable HTTP/2 multiplexing
- Use compression for large payloads

## Support

**Documentation:**
- Phase 4 Monitoring Runbook: `docs/MARCUS_MONITORING_RUNBOOK.md`
- Deployment Checklist: `docs/MARCUS_DEPLOYMENT_CHECKLIST.md`
- Production Roadmap: `docs/MARCUS_2.0_PRODUCTION_ROADMAP.md`

**Monitoring Dashboards:**
- Grafana: http://localhost:3000 (after port-forward)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686

**Alerts:**
- 30 Prometheus alert rules configured
- PagerDuty/Slack integration via AlertManager
