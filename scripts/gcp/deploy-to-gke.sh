#!/bin/bash
#
# MARCUS 3.0 Phase 5: GKE Deployment Script
# Deploy citation integrity platform to Google Kubernetes Engine
#
# Prerequisites:
#   - gcloud CLI authenticated with proper permissions
#   - kubectl installed
#   - Docker images built locally (marcus-orchestrator:v3.0.0, marcus-citation-agent:v3.0.0)
#
# Usage:
#   ./scripts/gcp/deploy-to-gke.sh [--skip-cluster] [--skip-images] [--skip-deploy]
#

set -euo pipefail

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
REGION="us-central1"
ZONE="${REGION}-a"
CLUSTER_NAME="marcus-platform"
NAMESPACE="marcus-platform"
REGISTRY_LOCATION="${REGION}"
REGISTRY_NAME="marcus-images"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}INFO:${NC} $1"; }
log_success() { echo -e "${GREEN}SUCCESS:${NC} $1"; }
log_warning() { echo -e "${YELLOW}WARNING:${NC} $1"; }
log_error() { echo -e "${RED}ERROR:${NC} $1"; }

# Parse arguments
SKIP_CLUSTER=false
SKIP_IMAGES=false
SKIP_DEPLOY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-cluster) SKIP_CLUSTER=true; shift ;;
    --skip-images) SKIP_IMAGES=true; shift ;;
    --skip-deploy) SKIP_DEPLOY=true; shift ;;
    *) log_error "Unknown option: $1"; exit 1 ;;
  esac
done

# Validate prerequisites
log_info "Validating prerequisites..."

if [ -z "$PROJECT_ID" ]; then
  log_error "No GCP project configured. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

log_info "GCP Project: $PROJECT_ID"

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  log_error "Not authenticated to GCP. Run: gcloud auth login"
  exit 1
fi

log_success "Authenticated to GCP"

# Enable required APIs
log_info "Enabling required GCP APIs..."
gcloud services enable \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com \
  --quiet 2>&1 || log_warning "Some APIs may already be enabled"

log_success "GCP APIs enabled"

# Create GKE cluster
if [ "$SKIP_CLUSTER" = false ]; then
  log_info "Checking for existing GKE cluster: $CLUSTER_NAME..."

  if gcloud container clusters describe "$CLUSTER_NAME" --region="$REGION" &>/dev/null; then
    log_warning "Cluster $CLUSTER_NAME already exists in $REGION"
    read -p "Do you want to use the existing cluster? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_error "Deployment cancelled by user"
      exit 1
    fi
  else
    log_info "Creating GKE cluster: $CLUSTER_NAME in $REGION..."
    log_info "This may take 5-10 minutes..."

    gcloud container clusters create "$CLUSTER_NAME" \
      --region="$REGION" \
      --num-nodes=1 \
      --min-nodes=1 \
      --max-nodes=5 \
      --enable-autoscaling \
      --machine-type=e2-standard-4 \
      --disk-size=50GB \
      --enable-stackdriver-kubernetes \
      --enable-ip-alias \
      --network=default \
      --subnetwork=default \
      --scopes=cloud-platform \
      --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
      --enable-autorepair \
      --enable-autoupgrade \
      --quiet

    log_success "GKE cluster created successfully"
  fi

  # Get cluster credentials
  log_info "Getting cluster credentials..."
  gcloud container clusters get-credentials "$CLUSTER_NAME" --region="$REGION" --quiet
  log_success "kubectl configured for cluster"
else
  log_info "Skipping cluster creation (--skip-cluster)"
fi

# Verify kubectl access
log_info "Verifying kubectl access..."
if ! kubectl cluster-info &>/dev/null; then
  log_error "Cannot access Kubernetes cluster. Check kubectl configuration."
  exit 1
fi

kubectl get nodes
log_success "Cluster is accessible"

# Setup Artifact Registry
if [ "$SKIP_IMAGES" = false ]; then
  log_info "Setting up Artifact Registry..."

  # Create repository
  if gcloud artifacts repositories describe "$REGISTRY_NAME" --location="$REGISTRY_LOCATION" &>/dev/null; then
    log_warning "Artifact Registry repository already exists"
  else
    log_info "Creating Artifact Registry repository: $REGISTRY_NAME..."
    gcloud artifacts repositories create "$REGISTRY_NAME" \
      --repository-format=docker \
      --location="$REGISTRY_LOCATION" \
      --description="MARCUS platform Docker images" \
      --quiet

    log_success "Artifact Registry repository created"
  fi

  # Configure Docker authentication
  log_info "Configuring Docker authentication for Artifact Registry..."
  gcloud auth configure-docker "${REGISTRY_LOCATION}-docker.pkg.dev" --quiet
  log_success "Docker authentication configured"

  # Tag and push images
  REGISTRY_PREFIX="${REGISTRY_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REGISTRY_NAME}"

  log_info "Tagging and pushing Docker images..."
  log_info "This may take several minutes for large images..."

  # Orchestrator image
  if docker images | grep -q "marcus-orchestrator.*v3.0.0"; then
    log_info "Tagging orchestrator image..."
    docker tag marcus-orchestrator:v3.0.0 "${REGISTRY_PREFIX}/marcus-orchestrator:v3.0.0"
    docker tag marcus-orchestrator:v3.0.0 "${REGISTRY_PREFIX}/marcus-orchestrator:latest"

    log_info "Pushing orchestrator image (this will take a while for 3.5GB image)..."
    docker push "${REGISTRY_PREFIX}/marcus-orchestrator:v3.0.0"
    docker push "${REGISTRY_PREFIX}/marcus-orchestrator:latest"
    log_success "Orchestrator image pushed"
  else
    log_error "marcus-orchestrator:v3.0.0 image not found locally. Build it first."
    exit 1
  fi

  # Agent image
  if docker images | grep -q "marcus-citation-agent.*v3.0.0"; then
    log_info "Tagging agent image..."
    docker tag marcus-citation-agent:v3.0.0 "${REGISTRY_PREFIX}/marcus-citation-agent:v3.0.0"
    docker tag marcus-citation-agent:v3.0.0 "${REGISTRY_PREFIX}/marcus-citation-agent:latest"

    log_info "Pushing agent image..."
    docker push "${REGISTRY_PREFIX}/marcus-citation-agent:v3.0.0"
    docker push "${REGISTRY_PREFIX}/marcus-citation-agent:latest"
    log_success "Agent image pushed"
  else
    log_error "marcus-citation-agent:v3.0.0 image not found locally. Build it first."
    exit 1
  fi

  log_success "All images pushed to Artifact Registry"

  # Verify images
  log_info "Verifying images in registry..."
  gcloud artifacts docker images list "${REGISTRY_PREFIX}" --quiet
else
  log_info "Skipping image push (--skip-images)"
  REGISTRY_PREFIX="${REGISTRY_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REGISTRY_NAME}"
fi

# Deploy to Kubernetes
if [ "$SKIP_DEPLOY" = false ]; then
  log_info "Deploying to Kubernetes..."

  # Update image references in manifests (temporary files)
  TMP_DIR=$(mktemp -d)
  trap "rm -rf $TMP_DIR" EXIT

  log_info "Preparing k8s manifests with updated image references..."

  # Copy and update manifests
  cp -r k8s/* "$TMP_DIR/"

  # Update orchestrator deployment
  if [ -f "$TMP_DIR/orchestrator-deployment.yaml" ]; then
    sed -i "s|ghcr.io/404genenotfound/marcus-orchestrator:latest|${REGISTRY_PREFIX}/marcus-orchestrator:v3.0.0|g" \
      "$TMP_DIR/orchestrator-deployment.yaml"
  fi

  # Update agent deployment
  if [ -f "$TMP_DIR/agent-deployment.yaml" ]; then
    sed -i "s|ghcr.io/404genenotfound/marcus-agent:latest|${REGISTRY_PREFIX}/marcus-citation-agent:v3.0.0|g" \
      "$TMP_DIR/agent-deployment.yaml"
  fi

  log_success "Manifests updated"

  # Apply manifests in order
  log_info "Applying Kubernetes manifests..."

  # 1. Namespace
  kubectl apply -f "$TMP_DIR/namespace.yaml"

  # 2. ConfigMaps and Secrets
  log_info "Applying ConfigMaps and Secrets..."
  kubectl apply -f "$TMP_DIR/configmap.yaml"

  # Generate secrets if not exists
  if ! kubectl get secret marcus-secrets -n "$NAMESPACE" &>/dev/null; then
    log_warning "Secret marcus-secrets not found. Creating with default values..."
    log_warning "⚠️  IMPORTANT: Update these secrets for production!"

    kubectl create secret generic marcus-secrets \
      --namespace="$NAMESPACE" \
      --from-literal=POSTGRES_USER=marcus \
      --from-literal=POSTGRES_PASSWORD="$(openssl rand -base64 32)" \
      --from-literal=REDIS_PASSWORD="$(openssl rand -base64 32)" \
      --from-literal=JWT_SECRET="$(openssl rand -base64 64)" \
      --dry-run=client -o yaml | kubectl apply -f -

    log_success "Secrets created (randomly generated)"
  else
    log_info "Using existing secrets"
  fi

  # 3. PostgreSQL
  log_info "Deploying PostgreSQL StatefulSet..."
  kubectl apply -f "$TMP_DIR/postgres-statefulset.yaml"

  # 4. Redis
  log_info "Deploying Redis Cluster StatefulSet..."
  kubectl apply -f "$TMP_DIR/redis-statefulset.yaml"

  # Wait for databases to be ready
  log_info "Waiting for PostgreSQL to be ready..."
  kubectl wait --for=condition=ready pod -l app=postgres,role=primary \
    -n "$NAMESPACE" --timeout=300s || log_warning "PostgreSQL may not be fully ready"

  log_info "Waiting for Redis to be ready..."
  kubectl wait --for=condition=ready pod -l app=redis \
    -n "$NAMESPACE" --timeout=300s || log_warning "Redis may not be fully ready"

  # Initialize Redis cluster
  log_info "Initializing Redis cluster..."
  kubectl apply -f "$TMP_DIR/redis-statefulset.yaml" # Includes init job

  # 5. Deploy application components
  log_info "Deploying Orchestrator..."
  kubectl apply -f "$TMP_DIR/orchestrator-deployment.yaml"

  log_info "Deploying Citation Agents..."
  kubectl apply -f "$TMP_DIR/agent-deployment.yaml"

  # 6. Deploy ingress (optional)
  if [ -f "$TMP_DIR/ingress.yaml" ]; then
    log_info "Deploying Ingress..."
    kubectl apply -f "$TMP_DIR/ingress.yaml" || log_warning "Ingress deployment may have issues"
  fi

  # 7. Deploy HPA (optional)
  if [ -f "$TMP_DIR/hpa.yaml" ]; then
    log_info "Deploying Horizontal Pod Autoscaler..."
    kubectl apply -f "$TMP_DIR/hpa.yaml" || log_warning "HPA may require metrics-server"
  fi

  log_success "All Kubernetes resources deployed"

  # Wait for application pods
  log_info "Waiting for application pods to be ready..."
  kubectl wait --for=condition=ready pod -l app=orchestrator \
    -n "$NAMESPACE" --timeout=300s || log_warning "Orchestrator may not be fully ready"

  kubectl wait --for=condition=ready pod -l app=citation-agent \
    -n "$NAMESPACE" --timeout=300s || log_warning "Citation agents may not be fully ready"
else
  log_info "Skipping Kubernetes deployment (--skip-deploy)"
fi

# Display status
log_info "=== Deployment Status ==="
kubectl get pods -n "$NAMESPACE"
echo ""
kubectl get svc -n "$NAMESPACE"

# Display next steps
log_success "=== Deployment Complete ==="
log_info ""
log_info "Next steps:"
log_info "  1. Initialize database schema:"
log_info "     kubectl exec -n $NAMESPACE -it \$(kubectl get pod -n $NAMESPACE -l app=orchestrator -o name | head -1) -- npm run migrate"
log_info ""
log_info "  2. Port-forward to access orchestrator:"
log_info "     kubectl port-forward -n $NAMESPACE svc/orchestrator 3000:3000"
log_info ""
log_info "  3. Test health endpoint:"
log_info "     curl http://localhost:3000/health"
log_info ""
log_info "  4. View logs:"
log_info "     kubectl logs -n $NAMESPACE -l app=orchestrator --tail=100 -f"
log_info ""
log_info "  5. Update secrets for production:"
log_info "     kubectl edit secret marcus-secrets -n $NAMESPACE"
log_info ""
log_success "MARCUS 3.0 Platform deployed to GKE!"
