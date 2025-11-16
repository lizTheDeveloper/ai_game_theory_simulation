# Kubernetes Deployment

Kubernetes manifests for Citation Integrity Platform using Kustomize.

## Directory Structure

```
k8s/
├── base/                    # Base configuration (shared across environments)
│   ├── deployment.yaml      # API deployment
│   ├── service.yaml         # Service
│   ├── hpa.yaml             # Horizontal Pod Autoscaler
│   ├── ingress.yaml         # Ingress with TLS
│   ├── configmap.yaml       # Configuration
│   ├── secret.yaml          # Secrets (template)
│   ├── serviceaccount.yaml  # RBAC
│   └── kustomization.yaml   # Base kustomization
│
├── overlays/                # Environment-specific overrides
│   ├── dev/                 # Development
│   ├── staging/             # Staging
│   └── prod/                # Production
│       ├── kustomization.yaml
│       ├── replica-patch.yaml
│       └── resource-patch.yaml
│
└── README.md
```

## Prerequisites

1. **Kubernetes cluster** (v1.24+)
2. **kubectl** (v1.24+)
3. **kustomize** (v4.5+) or `kubectl apply -k`
4. **cert-manager** (for TLS certificates)
5. **NGINX Ingress Controller**
6. **Metrics Server** (for HPA)

## Deployment

### 1. Create namespace

```bash
kubectl create namespace citation-prod
```

### 2. Create secrets

**Option A: Manual (development)**

```bash
kubectl create secret generic citation-platform-secrets \
  --from-literal=postgres-password=YOUR_PASSWORD \
  --from-literal=redis-password=YOUR_PASSWORD \
  --from-literal=api-key=YOUR_API_KEY \
  --from-literal=jwt-secret=YOUR_JWT_SECRET \
  -n citation-prod
```

**Option B: External Secrets Operator (production)**

See `k8s/base/secret.yaml` for example configuration.

### 3. Deploy using Kustomize

```bash
# Production
kubectl apply -k k8s/overlays/prod

# Development
kubectl apply -k k8s/base

# Verify deployment
kubectl get pods -n citation-prod
kubectl get svc -n citation-prod
kubectl get ingress -n citation-prod
```

### 4. Check status

```bash
# Pods
kubectl get pods -n citation-prod -l app=citation-platform

# Logs
kubectl logs -n citation-prod -l app=citation-platform --tail=100 -f

# Events
kubectl get events -n citation-prod --sort-by='.lastTimestamp'

# HPA status
kubectl get hpa -n citation-prod
```

## Configuration

### Environment Variables

Set via ConfigMap (`k8s/base/configmap.yaml`):
- `NODE_ENV` - Environment (production/development)
- `PORT` - API port (default: 4000)
- `PGPOOL_MAX` - Max PostgreSQL connections
- `ENABLE_METRICS` - Enable Prometheus metrics
- `LOG_LEVEL` - Logging level

### Secrets

Set via Secret (`k8s/base/secret.yaml`):
- `postgres-password` - PostgreSQL password
- `redis-password` - Redis password
- `api-key` - API authentication key
- `jwt-secret` - JWT signing secret (min 32 chars)

### Scaling

**Manual scaling:**

```bash
kubectl scale deployment citation-platform-api --replicas=5 -n citation-prod
```

**Autoscaling (HPA):**

- Min replicas: 3 (dev), 5 (prod)
- Max replicas: 10 (dev), 20 (prod)
- Target CPU: 70%
- Target Memory: 80%

### Resource Limits

**Development:**
- Requests: 250m CPU, 512Mi memory
- Limits: 1000m CPU, 1Gi memory

**Production:**
- Requests: 500m CPU, 1Gi memory
- Limits: 2000m CPU, 2Gi memory

## TLS/SSL

### Using cert-manager (Let's Encrypt)

1. Install cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create ClusterIssuer:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

3. Cert-manager will automatically provision TLS certificate for Ingress.

### Using manual certificates

```bash
kubectl create secret tls citation-platform-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n citation-prod
```

## Monitoring

### Prometheus Metrics

Metrics exposed at `/metrics` endpoint (port 4000).

Annotations added to Pod template:
```yaml
prometheus.io/scrape: "true"
prometheus.io/port: "4000"
prometheus.io/path: "/metrics"
```

### Health Checks

- **Liveness:** `GET /health` (30s initial delay, 10s interval)
- **Readiness:** `GET /health` (10s initial delay, 5s interval)

## Rollback

```bash
# View rollout history
kubectl rollout history deployment/citation-platform-api -n citation-prod

# Rollback to previous version
kubectl rollout undo deployment/citation-platform-api -n citation-prod

# Rollback to specific revision
kubectl rollout undo deployment/citation-platform-api --to-revision=2 -n citation-prod
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n citation-prod

# Check logs
kubectl logs <pod-name> -n citation-prod

# Check events
kubectl get events -n citation-prod --sort-by='.lastTimestamp'
```

### Database connection issues

```bash
# Test PostgreSQL connectivity
kubectl run -it --rm debug --image=postgres:16-alpine --restart=Never -n citation-prod -- \
  psql -h postgres-service -U citation_platform -d citation_platform

# Test Redis connectivity
kubectl run -it --rm debug --image=redis:7-alpine --restart=Never -n citation-prod -- \
  redis-cli -h redis-service -a <password> ping
```

### HPA not scaling

```bash
# Check metrics server
kubectl top nodes
kubectl top pods -n citation-prod

# Check HPA status
kubectl describe hpa citation-platform-api-hpa -n citation-prod
```

## Cleanup

```bash
# Delete deployment
kubectl delete -k k8s/overlays/prod

# Delete namespace (removes all resources)
kubectl delete namespace citation-prod
```

## Production Checklist

- [ ] Secrets stored in external secret manager (Vault/AWS Secrets Manager)
- [ ] TLS certificates configured (cert-manager or manual)
- [ ] Resource limits set appropriately
- [ ] HPA configured and tested
- [ ] Monitoring dashboards created (Grafana)
- [ ] Alert rules configured (Prometheus/PagerDuty)
- [ ] Backup strategy for PostgreSQL
- [ ] Disaster recovery plan documented
- [ ] Security scanning enabled (SAST/DAST)
- [ ] Network policies applied (if required)
- [ ] Pod Security Standards enforced
