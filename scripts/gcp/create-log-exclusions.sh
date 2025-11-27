#!/bin/bash
set -e

PROJECT_ID="project-6d921a00-c010-437c-990"
CLUSTER_NAME="marcus-platform"

echo "Creating log exclusion filters to reduce costs..."
echo ""

# Create exclusions using gcloud logging API
# Note: Exclusions are created at the project level

# 1. Exclude health check logs
echo "1. Creating exclusion for health check endpoints..."
cat > /tmp/health-check-exclusion.json <<EOF
{
  "name": "exclude-k8s-health-checks",
  "description": "Exclude Kubernetes health and readiness check logs",
  "filter": "resource.type=\"k8s_container\" AND resource.labels.cluster_name=\"${CLUSTER_NAME}\" AND (textPayload=~\"GET /health\" OR textPayload=~\"GET /ready\" OR textPayload=~\"GET /healthz\" OR textPayload=~\"GET /readyz\" OR textPayload=~\"GET /live\" OR jsonPayload.message=~\"GET /health\" OR jsonPayload.message=~\"GET /ready\")",
  "disabled": false
}
EOF

curl -X POST \
  "https://logging.googleapis.com/v2/projects/${PROJECT_ID}/exclusions" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d @/tmp/health-check-exclusion.json \
  2>/dev/null || echo "Health check exclusion may already exist"

echo ""

# 2. Exclude Prometheus metrics scraping
echo "2. Creating exclusion for Prometheus metrics endpoints..."
cat > /tmp/prometheus-exclusion.json <<EOF
{
  "name": "exclude-prometheus-metrics",
  "description": "Exclude Prometheus metrics scraping logs",
  "filter": "resource.type=\"k8s_container\" AND resource.labels.cluster_name=\"${CLUSTER_NAME}\" AND (textPayload=~\"GET /metrics\" OR jsonPayload.message=~\"GET /metrics\")",
  "disabled": false
}
EOF

curl -X POST \
  "https://logging.googleapis.com/v2/projects/${PROJECT_ID}/exclusions" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d @/tmp/prometheus-exclusion.json \
  2>/dev/null || echo "Prometheus exclusion may already exist"

echo ""

# 3. Exclude verbose INFO level logs from system namespaces
echo "3. Creating exclusion for verbose system component logs..."
cat > /tmp/system-info-exclusion.json <<EOF
{
  "name": "exclude-system-info-logs",
  "description": "Exclude INFO level logs from system namespaces",
  "filter": "resource.type=\"k8s_container\" AND resource.labels.cluster_name=\"${CLUSTER_NAME}\" AND severity<=\"INFO\" AND (resource.labels.namespace_name=\"kube-system\" OR resource.labels.namespace_name=\"gke-system\" OR resource.labels.namespace_name=\"gmp-system\")",
  "disabled": false
}
EOF

curl -X POST \
  "https://logging.googleapis.com/v2/projects/${PROJECT_ID}/exclusions" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d @/tmp/system-info-exclusion.json \
  2>/dev/null || echo "System INFO exclusion may already exist"

echo ""
echo "✅ Exclusion filters created!"
echo ""
echo "To verify exclusions are working:"
echo "  curl -H \"Authorization: Bearer \$(gcloud auth print-access-token)\" \\"
echo "    \"https://logging.googleapis.com/v2/projects/${PROJECT_ID}/exclusions\""
echo ""