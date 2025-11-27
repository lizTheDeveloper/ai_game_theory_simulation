#!/bin/bash
set -euo pipefail

# MARCUS 3.0 Kubernetes Deployment Script
# Automates deployment of the MARCUS Citation Integrity Platform to Kubernetes

NAMESPACE="marcus-platform"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/../k8s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    # Check kustomize
    if ! command -v kustomize &> /dev/null; then
        log_warn "kustomize not found. Using kubectl apply -k instead."
    fi

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Check your kubeconfig."
        exit 1
    fi

    # Check Istio
    if ! kubectl get namespace istio-system &> /dev/null; then
        log_warn "Istio namespace not found. You may need to install Istio first."
        log_warn "Run: istioctl install --set profile=production"
    fi

    # Check metrics server
    if ! kubectl get deployment metrics-server -n kube-system &> /dev/null; then
        log_warn "Metrics server not found. HPA may not work."
        log_warn "Run: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
    fi

    log_info "✅ Prerequisites check complete"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    kubectl apply -f "$K8S_DIR/namespace.yaml"

    # Enable Istio sidecar injection
    kubectl label namespace "$NAMESPACE" istio-injection=enabled --overwrite

    log_info "✅ Namespace created and labeled for Istio injection"
}

# Generate secrets
generate_secrets() {
    log_info "Generating secrets..."

    # Check if secrets already exist
    if kubectl get secret marcus-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warn "Secrets already exist. Skipping generation."
        read -p "Do you want to regenerate secrets? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi

    # Generate secure random values
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)

    # Create secret
    kubectl create secret generic marcus-secrets \
        --from-literal=JWT_SECRET="$JWT_SECRET" \
        --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
        --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        --from-literal=POSTGRES_USER=marcus_app \
        --from-literal=REDIS_PASSWORD="$REDIS_PASSWORD" \
        --from-literal=ENCRYPTION_KEY="$ENCRYPTION_KEY" \
        --namespace "$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -

    log_info "✅ Secrets generated and created"

    # Save secrets to secure location (PRODUCTION: use vault/AWS Secrets Manager)
    SECRETS_FILE="$HOME/.marcus-secrets-$(date +%Y%m%d-%H%M%S).env"
    cat > "$SECRETS_FILE" <<EOF
# MARCUS Platform Secrets - Generated $(date)
# ⚠️ KEEP THIS FILE SECURE - DO NOT COMMIT TO VERSION CONTROL
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_USER=marcus_app
REDIS_PASSWORD=$REDIS_PASSWORD
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

    chmod 600 "$SECRETS_FILE"
    log_warn "⚠️  Secrets saved to: $SECRETS_FILE"
    log_warn "⚠️  KEEP THIS FILE SECURE"
}

# Deploy infrastructure (databases)
deploy_infrastructure() {
    log_info "Deploying infrastructure (PostgreSQL, Redis)..."

    # ConfigMaps
    kubectl apply -f "$K8S_DIR/configmap.yaml"

    # PostgreSQL
    kubectl apply -f "$K8S_DIR/postgres-statefulset.yaml"

    # Redis
    kubectl apply -f "$K8S_DIR/redis-statefulset.yaml"

    log_info "⏳ Waiting for databases to be ready (this may take 2-3 minutes)..."

    # Wait for PostgreSQL primary
    kubectl wait --for=condition=ready pod/postgres-primary-0 -n "$NAMESPACE" --timeout=300s

    # Wait for Redis cluster
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s

    log_info "✅ Infrastructure deployed and ready"
}

# Initialize Redis cluster
initialize_redis_cluster() {
    log_info "Initializing Redis cluster..."

    # Run cluster initialization job
    kubectl apply -f "$K8S_DIR/redis-statefulset.yaml"

    # Wait for job to complete
    kubectl wait --for=condition=complete job/redis-cluster-init -n "$NAMESPACE" --timeout=120s || {
        log_error "Redis cluster initialization failed. Check logs:"
        kubectl logs job/redis-cluster-init -n "$NAMESPACE"
        exit 1
    }

    log_info "✅ Redis cluster initialized"
}

# Deploy application
deploy_application() {
    log_info "Deploying application (Orchestrator, Agents)..."

    # Orchestrator
    kubectl apply -f "$K8S_DIR/orchestrator-deployment.yaml"

    # Citation Agent
    kubectl apply -f "$K8S_DIR/agent-deployment.yaml"

    log_info "⏳ Waiting for application pods to be ready..."

    # Wait for orchestrator
    kubectl wait --for=condition=ready pod -l app=orchestrator -n "$NAMESPACE" --timeout=300s

    # Wait for agents
    kubectl wait --for=condition=ready pod -l app=citation-agent -n "$NAMESPACE" --timeout=300s

    log_info "✅ Application deployed and ready"
}

# Deploy autoscaling
deploy_autoscaling() {
    log_info "Deploying autoscaling (HPA, Prometheus Adapter)..."

    # Prometheus adapter for custom metrics
    kubectl apply -f "$K8S_DIR/prometheus-adapter.yaml"

    # HPA
    kubectl apply -f "$K8S_DIR/hpa.yaml"

    log_info "✅ Autoscaling configured"
}

# Deploy Istio configuration
deploy_istio() {
    log_info "Deploying Istio service mesh configuration..."

    # Gateway & VirtualService
    kubectl apply -f "$K8S_DIR/istio/gateway.yaml"

    # Authorization policies
    kubectl apply -f "$K8S_DIR/istio/authorization.yaml"

    # Telemetry
    kubectl apply -f "$K8S_DIR/istio/telemetry.yaml"

    # Traffic management
    kubectl apply -f "$K8S_DIR/istio/traffic-management.yaml"

    log_info "✅ Istio configuration deployed"
}

# Deploy ingress
deploy_ingress() {
    log_info "Deploying ingress..."

    kubectl apply -f "$K8S_DIR/ingress.yaml"

    log_info "✅ Ingress deployed"
    log_warn "⚠️  Update DNS records to point to your ingress IP:"
    kubectl get ingress -n "$NAMESPACE"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    echo ""
    echo "=== Pods ==="
    kubectl get pods -n "$NAMESPACE"

    echo ""
    echo "=== Services ==="
    kubectl get svc -n "$NAMESPACE"

    echo ""
    echo "=== HPA ==="
    kubectl get hpa -n "$NAMESPACE"

    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n "$NAMESPACE"

    echo ""
    echo "=== Istio VirtualServices ==="
    kubectl get virtualservice -n "$NAMESPACE"

    echo ""
    log_info "✅ Deployment verification complete"
}

# Health check
health_check() {
    log_info "Running health checks..."

    # Get orchestrator pod
    ORCHESTRATOR_POD=$(kubectl get pod -l app=orchestrator -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}')

    # Health check
    if kubectl exec "$ORCHESTRATOR_POD" -n "$NAMESPACE" -- curl -sf http://localhost:3000/health > /dev/null; then
        log_info "✅ Orchestrator health check: PASSED"
    else
        log_error "❌ Orchestrator health check: FAILED"
    fi

    # Get agent pod
    AGENT_POD=$(kubectl get pod -l app=citation-agent -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}')

    # Agent health check
    if kubectl exec "$AGENT_POD" -n "$NAMESPACE" -- curl -sf http://localhost:8000/health > /dev/null; then
        log_info "✅ Citation agent health check: PASSED"
    else
        log_error "❌ Citation agent health check: FAILED"
    fi
}

# Main deployment flow
main() {
    log_info "🚀 Starting MARCUS 3.0 Kubernetes Deployment"
    echo ""

    # Step 1: Prerequisites
    check_prerequisites
    echo ""

    # Step 2: Namespace
    create_namespace
    echo ""

    # Step 3: Secrets
    generate_secrets
    echo ""

    # Step 4: Infrastructure
    deploy_infrastructure
    echo ""

    # Step 5: Initialize Redis
    initialize_redis_cluster
    echo ""

    # Step 6: Application
    deploy_application
    echo ""

    # Step 7: Autoscaling
    deploy_autoscaling
    echo ""

    # Step 8: Istio
    deploy_istio
    echo ""

    # Step 9: Ingress
    deploy_ingress
    echo ""

    # Step 10: Verify
    verify_deployment
    echo ""

    # Step 11: Health checks
    health_check
    echo ""

    log_info "🎉 MARCUS 3.0 Deployment Complete!"
    echo ""
    log_info "Next steps:"
    echo "  1. Update DNS records to point to ingress IP"
    echo "  2. Configure TLS certificates (cert-manager will auto-provision)"
    echo "  3. Update domain in k8s/ingress.yaml (currently: marcus.example.com)"
    echo "  4. Review monitoring dashboards (Grafana)"
    echo "  5. Test API endpoints"
    echo ""
    log_info "Access application:"
    echo "  - Health: https://marcus.example.com/health"
    echo "  - API: https://api.marcus.example.com/api/citations"
    echo "  - Metrics: http://localhost:9090 (port-forward prometheus)"
    echo ""
}

# Run main function
main "$@"
