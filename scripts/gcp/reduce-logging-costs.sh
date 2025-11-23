#!/bin/bash
set -e

PROJECT_ID="project-6d921a00-c010-437c-990"
CLUSTER_NAME="marcus-platform"
REGION="us-central1"

echo "═══════════════════════════════════════════════════════════════"
echo "   GKE Logging Cost Reduction Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Create exclusion filter for health check logs
echo "📝 Creating exclusion filter for health check logs..."
gcloud logging sinks create exclude-health-checks \
    logging.googleapis.com/projects/${PROJECT_ID}/exclusions/health-checks \
    --log-filter='resource.type="k8s_container"
    AND resource.labels.cluster_name="'${CLUSTER_NAME}'"
    AND (
        jsonPayload.message=~"GET /health"
        OR jsonPayload.message=~"GET /ready"
        OR jsonPayload.message=~"GET /live"
        OR jsonPayload.message=~"GET /healthz"
        OR jsonPayload.message=~"GET /readyz"
        OR textPayload=~"GET /health"
        OR textPayload=~"GET /ready"
        OR textPayload=~"GET /live"
        OR textPayload=~"GET /healthz"
        OR textPayload=~"GET /readyz"
    )' \
    --description="Exclude Kubernetes health check logs to reduce costs" \
    2>/dev/null || echo "  ⚠️  Health check exclusion filter already exists or creation failed"

# 2. Create exclusion for Prometheus scrape logs
echo "📝 Creating exclusion filter for Prometheus scrape logs..."
gcloud logging sinks create exclude-prometheus-scrapes \
    logging.googleapis.com/projects/${PROJECT_ID}/exclusions/prometheus-scrapes \
    --log-filter='resource.type="k8s_container"
    AND resource.labels.cluster_name="'${CLUSTER_NAME}'"
    AND (
        jsonPayload.message=~"GET /metrics"
        OR textPayload=~"GET /metrics"
    )' \
    --description="Exclude Prometheus metrics scraping logs" \
    2>/dev/null || echo "  ⚠️  Prometheus exclusion filter already exists or creation failed"

# 3. Exclude verbose system component logs
echo "📝 Creating exclusion filter for verbose system logs..."
gcloud logging sinks create exclude-verbose-system \
    logging.googleapis.com/projects/${PROJECT_ID}/exclusions/verbose-system \
    --log-filter='resource.type="k8s_cluster"
    AND resource.labels.cluster_name="'${CLUSTER_NAME}'"
    AND severity<="INFO"
    AND (
        resource.labels.namespace_name="kube-system"
        OR resource.labels.namespace_name="gke-system"
        OR resource.labels.namespace_name="gmp-system"
        OR resource.labels.namespace_name="gmp-public"
    )' \
    --description="Exclude verbose INFO level system component logs" \
    2>/dev/null || echo "  ⚠️  System log exclusion filter already exists or creation failed"

# 4. Update cluster logging config to reduce verbosity
echo "🔧 Updating cluster logging configuration..."
echo "  Note: This will keep ERROR and WARNING logs but reduce INFO/DEBUG logs"

cat > /tmp/logging-config.yaml <<EOF
componentConfig:
  enableComponents:
  - SYSTEM_COMPONENTS
  - WORKLOADS
EOF

echo ""
echo "To apply reduced logging to the cluster, run:"
echo "  gcloud container clusters update ${CLUSTER_NAME} \\"
echo "    --logging=SYSTEM,WORKLOADS \\"
echo "    --zone ${REGION} \\"
echo "    --no-enable-cloud-logging"
echo ""

# 5. Show current retention policy
echo "📊 Current log retention settings:"
gcloud logging buckets describe _Default --location=global --format="table(retentionDays)" 2>/dev/null || echo "Unable to fetch retention settings"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   Additional Manual Steps Required:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Update application code to reduce logging verbosity:"
echo "   - Set LOG_LEVEL=warn or LOG_LEVEL=error in production"
echo "   - Remove health check endpoint logging from application code"
echo ""
echo "2. Configure log retention (reduce from 30 to 7 days):"
echo "   gcloud logging buckets update _Default --location=global --retention-days=7"
echo ""
echo "3. Consider using log sampling for non-critical logs:"
echo "   - Sample 10% of INFO logs"
echo "   - Keep 100% of WARNING and ERROR logs"
echo ""
echo "4. For extreme cost reduction, disable WORKLOADS logging entirely:"
echo "   gcloud container clusters update ${CLUSTER_NAME} \\"
echo "     --logging=SYSTEM \\"
echo "     --zone ${REGION}"
echo ""
echo "5. Monitor cost impact in GCP Console:"
echo "   https://console.cloud.google.com/logs/usage?project=${PROJECT_ID}"
echo ""