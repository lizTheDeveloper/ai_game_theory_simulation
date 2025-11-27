#!/bin/bash
#
# MARCUS 3.0 Phase 5: Monitoring Setup
# Deploy Prometheus and Grafana to GKE cluster
#
# Usage:
#   ./scripts/gcp/setup-monitoring.sh [--namespace marcus-platform]
#

set -euo pipefail

# Configuration
NAMESPACE="${1:-marcus-platform}"
MONITORING_NAMESPACE="monitoring"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}INFO:${NC} $1"; }
log_success() { echo -e "${GREEN}SUCCESS:${NC} $1"; }
log_warning() { echo -e "${YELLOW}WARNING:${NC} $1"; }
log_error() { echo -e "${RED}ERROR:${NC} $1"; }

log_info "=== MARCUS 3.0 Monitoring Setup ==="
log_info "Application namespace: $NAMESPACE"
log_info "Monitoring namespace: $MONITORING_NAMESPACE"
echo ""

# Check if Helm is installed
log_info "Checking for Helm..."
if ! command -v helm &>/dev/null; then
  log_error "Helm is not installed"
  log_info "Install Helm from: https://helm.sh/docs/intro/install/"
  exit 1
fi

HELM_VERSION=$(helm version --short 2>/dev/null || echo "unknown")
log_success "Helm installed: $HELM_VERSION"

# Create monitoring namespace
log_info "Creating monitoring namespace..."
kubectl create namespace "$MONITORING_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
log_success "Monitoring namespace ready"

# Add Prometheus Helm repository
log_info "Adding Prometheus community Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
helm repo update
log_success "Helm repositories updated"

# Generate Grafana admin password
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Install kube-prometheus-stack (Prometheus + Grafana + Alertmanager)
log_info "Installing kube-prometheus-stack..."
log_info "This may take a few minutes..."

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace "$MONITORING_NAMESPACE" \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.retention=7d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.accessModes[0]=ReadWriteOnce \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=20Gi \
  --set grafana.adminPassword="$GRAFANA_PASSWORD" \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size=5Gi \
  --set grafana.service.type=ClusterIP \
  --set alertmanager.enabled=true \
  --wait \
  --timeout=600s

log_success "kube-prometheus-stack installed"

# Create ServiceMonitor for MARCUS orchestrator
log_info "Creating ServiceMonitor for orchestrator..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: orchestrator-metrics
  namespace: $NAMESPACE
  labels:
    app: orchestrator
spec:
  selector:
    app: orchestrator
  ports:
  - port: 9090
    targetPort: 9090
    name: metrics
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: orchestrator-metrics
  namespace: $NAMESPACE
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: orchestrator
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
EOF

log_success "Orchestrator ServiceMonitor created"

# Create ServiceMonitor for citation agents
log_info "Creating ServiceMonitor for citation agents..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: citation-agent-metrics
  namespace: $NAMESPACE
  labels:
    app: citation-agent
spec:
  selector:
    app: citation-agent
  ports:
  - port: 9091
    targetPort: 9091
    name: metrics
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: citation-agent-metrics
  namespace: $NAMESPACE
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: citation-agent
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
EOF

log_success "Citation agent ServiceMonitor created"

# Wait for Prometheus and Grafana to be ready
log_info "Waiting for Prometheus to be ready..."
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=prometheus \
  -n "$MONITORING_NAMESPACE" \
  --timeout=300s

log_info "Waiting for Grafana to be ready..."
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=grafana \
  -n "$MONITORING_NAMESPACE" \
  --timeout=300s

log_success "Monitoring stack is ready"

# Get service URLs
log_info ""
log_info "=== Monitoring Access ==="
echo ""

log_info "Grafana Admin Password: $GRAFANA_PASSWORD"
log_warning "⚠️  Save this password! It won't be shown again."
echo ""

log_info "To access Grafana:"
log_info "  kubectl port-forward -n $MONITORING_NAMESPACE svc/prometheus-grafana 3001:80"
log_info "  Then visit: http://localhost:3001"
log_info "  Login: admin / $GRAFANA_PASSWORD"
echo ""

log_info "To access Prometheus:"
log_info "  kubectl port-forward -n $MONITORING_NAMESPACE svc/prometheus-kube-prometheus-prometheus 9090:9090"
log_info "  Then visit: http://localhost:9090"
echo ""

log_info "To access Alertmanager:"
log_info "  kubectl port-forward -n $MONITORING_NAMESPACE svc/prometheus-kube-prometheus-alertmanager 9093:9093"
log_info "  Then visit: http://localhost:9093"
echo ""

# Import Grafana dashboards
log_info "To import MARCUS dashboards to Grafana:"
log_info "  1. Port-forward to Grafana (see above)"
log_info "  2. Login to Grafana"
log_info "  3. Go to Dashboards → Import"
log_info "  4. Import dashboard JSON files from: docker/grafana/dashboards/"
echo ""

# Create PrometheusRule for MARCUS-specific alerts
log_info "Creating MARCUS-specific alert rules..."
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: marcus-alerts
  namespace: $NAMESPACE
  labels:
    release: prometheus
spec:
  groups:
  - name: marcus-platform
    interval: 30s
    rules:
    # High latency alert
    - alert: HighCitationLatency
      expr: histogram_quantile(0.95, rate(citation_latency_ms_bucket[5m])) > 5000
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High citation analysis latency"
        description: "P95 latency is {{ \$value }}ms (threshold: 5000ms)"

    # Low consensus alert
    - alert: LowAgentConsensus
      expr: citation_consensus < 0.5
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Low agent consensus detected"
        description: "Consensus is {{ \$value }} (threshold: 0.5)"

    # Agent failures
    - alert: HighAgentFailureRate
      expr: rate(citation_agent_failures_total[5m]) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High agent failure rate"
        description: "{{ \$value }} failures per second"

    # Database connection issues
    - alert: DatabaseConnectionFailures
      expr: rate(database_connection_errors_total[5m]) > 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Database connection failures"
        description: "Cannot connect to PostgreSQL"

    # Redis connection issues
    - alert: RedisConnectionFailures
      expr: rate(redis_connection_errors_total[5m]) > 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Redis connection failures"
        description: "Cannot connect to Redis cluster"

    # Pod restart alerts
    - alert: FrequentPodRestarts
      expr: rate(kube_pod_container_status_restarts_total{namespace="$NAMESPACE"}[15m]) > 0.1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Frequent pod restarts in $NAMESPACE"
        description: "Pod {{ \$labels.pod }} is restarting frequently"
EOF

log_success "Alert rules created"

# Display monitoring status
log_info ""
log_info "=== Monitoring Stack Status ==="
kubectl get pods -n "$MONITORING_NAMESPACE"

log_success ""
log_success "=== Monitoring Setup Complete ==="
log_info ""
log_info "Next steps:"
log_info "  1. Port-forward to Grafana and login"
log_info "  2. Import MARCUS dashboards from docker/grafana/dashboards/"
log_info "  3. Configure alert notifications in Alertmanager"
log_info "  4. Review metrics at /metrics endpoints"
log_info ""
log_warning "Save Grafana password: $GRAFANA_PASSWORD"
