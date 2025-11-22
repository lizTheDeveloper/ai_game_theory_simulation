#!/bin/bash
#
# MARCUS 3.0 Phase 5: Pre-Deployment Validation
# Validate all prerequisites before deploying to GKE
#
# Usage:
#   ./scripts/gcp/validate-prerequisites.sh
#

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FAILED_CHECKS=0

check_pass() { echo -e "${GREEN}✓${NC} $1"; }
check_fail() { echo -e "${RED}✗${NC} $1"; FAILED_CHECKS=$((FAILED_CHECKS + 1)); }
check_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
check_info() { echo -e "${BLUE}ℹ${NC} $1"; }

echo "=== MARCUS 3.0 GKE Deployment Prerequisites ==="
echo ""

# 1. Check gcloud CLI
echo "1. Checking gcloud CLI..."
if command -v gcloud &>/dev/null; then
  GCLOUD_VERSION=$(gcloud version --format="value(core)" 2>/dev/null || echo "unknown")
  check_pass "gcloud CLI installed (version: $GCLOUD_VERSION)"
else
  check_fail "gcloud CLI not installed - install from https://cloud.google.com/sdk/docs/install"
fi

# 2. Check kubectl
echo ""
echo "2. Checking kubectl..."
if command -v kubectl &>/dev/null; then
  KUBECTL_VERSION=$(kubectl version --client -o json 2>/dev/null | grep -o '"gitVersion":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
  check_pass "kubectl installed (version: $KUBECTL_VERSION)"
else
  check_fail "kubectl not installed - install from https://kubernetes.io/docs/tasks/tools/"
fi

# 3. Check Docker
echo ""
echo "3. Checking Docker..."
if command -v docker &>/dev/null; then
  DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "unknown")
  check_pass "Docker installed (version: $DOCKER_VERSION)"

  # Check if Docker daemon is running
  if docker ps &>/dev/null; then
    check_pass "Docker daemon is running"
  else
    check_fail "Docker daemon not running - start Docker Desktop or dockerd"
  fi
else
  check_fail "Docker not installed - install from https://docs.docker.com/get-docker/"
fi

# 4. Check GCP authentication
echo ""
echo "4. Checking GCP authentication..."
if ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1); then
  if [ -n "$ACTIVE_ACCOUNT" ]; then
    check_pass "Authenticated as: $ACTIVE_ACCOUNT"

    # Check if it's a service account (less preferred for deployment)
    if [[ $ACTIVE_ACCOUNT == *"@developer.gserviceaccount.com"* ]]; then
      check_warn "Using compute service account - may have limited permissions"
      check_info "For full deployment, authenticate with: gcloud auth login"
    fi
  else
    check_fail "Not authenticated to GCP - run: gcloud auth login"
  fi
else
  check_fail "Cannot check GCP authentication - gcloud may not be configured"
fi

# 5. Check GCP project
echo ""
echo "5. Checking GCP project configuration..."
if PROJECT_ID=$(gcloud config get-value project 2>/dev/null); then
  if [ -n "$PROJECT_ID" ]; then
    check_pass "GCP project configured: $PROJECT_ID"
  else
    check_fail "No GCP project configured - run: gcloud config set project YOUR_PROJECT_ID"
  fi
else
  check_fail "Cannot get GCP project - gcloud may not be configured"
fi

# 6. Check Docker images
echo ""
echo "6. Checking Docker images..."
if docker images | grep -q "marcus-orchestrator.*v3.0.0"; then
  SIZE=$(docker images marcus-orchestrator:v3.0.0 --format "{{.Size}}" | head -1)
  check_pass "marcus-orchestrator:v3.0.0 image exists ($SIZE)"
else
  check_fail "marcus-orchestrator:v3.0.0 image not found - build with: docker build -t marcus-orchestrator:v3.0.0 -f docker/orchestrator/Dockerfile ."
fi

if docker images | grep -q "marcus-citation-agent.*v3.0.0"; then
  SIZE=$(docker images marcus-citation-agent:v3.0.0 --format "{{.Size}}" | head -1)
  check_pass "marcus-citation-agent:v3.0.0 image exists ($SIZE)"
else
  check_fail "marcus-citation-agent:v3.0.0 image not found - build with: docker build -t marcus-citation-agent:v3.0.0 -f docker/agent/Dockerfile ."
fi

# 7. Check k8s manifests
echo ""
echo "7. Checking Kubernetes manifests..."
REQUIRED_MANIFESTS=(
  "k8s/namespace.yaml"
  "k8s/configmap.yaml"
  "k8s/orchestrator-deployment.yaml"
  "k8s/agent-deployment.yaml"
  "k8s/postgres-statefulset.yaml"
  "k8s/redis-statefulset.yaml"
)

for manifest in "${REQUIRED_MANIFESTS[@]}"; do
  if [ -f "$manifest" ]; then
    check_pass "$manifest exists"
  else
    check_fail "$manifest not found"
  fi
done

# 8. Check required permissions (if possible)
echo ""
echo "8. Checking GCP permissions (optional)..."
if gcloud projects get-iam-policy "$PROJECT_ID" &>/dev/null; then
  check_pass "Can access project IAM policy"

  # Try to check specific APIs
  if gcloud services list --enabled --filter="name:container.googleapis.com" 2>/dev/null | grep -q container; then
    check_pass "Kubernetes Engine API enabled"
  else
    check_warn "Kubernetes Engine API may not be enabled - will be enabled during deployment"
  fi

  if gcloud services list --enabled --filter="name:artifactregistry.googleapis.com" 2>/dev/null | grep -q artifactregistry; then
    check_pass "Artifact Registry API enabled"
  else
    check_warn "Artifact Registry API may not be enabled - will be enabled during deployment"
  fi
else
  check_warn "Cannot check project IAM - insufficient permissions (non-blocking)"
fi

# 9. Check available disk space
echo ""
echo "9. Checking disk space..."
AVAILABLE_GB=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_GB" -gt 10 ]; then
  check_pass "Sufficient disk space available (${AVAILABLE_GB}GB)"
else
  check_warn "Low disk space (${AVAILABLE_GB}GB) - recommend at least 10GB free"
fi

# 10. Check network connectivity
echo ""
echo "10. Checking network connectivity..."
if ping -c 1 google.com &>/dev/null; then
  check_pass "Internet connectivity available"
else
  check_fail "Cannot reach internet - check network connection"
fi

if curl -s https://gcr.io &>/dev/null; then
  check_pass "Can reach Google Container Registry"
else
  check_warn "Cannot reach gcr.io - may have issues pushing images"
fi

# Summary
echo ""
echo "=== Validation Summary ==="
if [ $FAILED_CHECKS -eq 0 ]; then
  check_pass "All critical checks passed - ready for deployment"
  echo ""
  echo "Run deployment with:"
  echo "  ./scripts/gcp/deploy-to-gke.sh"
  exit 0
else
  check_fail "$FAILED_CHECKS check(s) failed - fix issues before deployment"
  echo ""
  echo "Fix the issues above and re-run validation."
  exit 1
fi
