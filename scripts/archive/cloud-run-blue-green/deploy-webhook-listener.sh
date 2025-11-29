#!/bin/bash
#
# Deploy webhook listener to Cloud Run
#
# This service receives GitHub webhooks and orchestrates blue-green deployments.
# It needs elevated permissions to deploy other services.
#
# Devon - "A webhook listener that can't deploy services is just a very expensive logger."

set -e

PROJECT_ID="${GCP_PROJECT_ID:-multiverseschool}"
REGION="${GCP_REGION:-europe-west1}"
SERVICE_NAME="satu-webhook"
WEBHOOK_SECRET="${GITHUB_WEBHOOK_SECRET}"

echo "========================================="
echo "🎯 Deploying Webhook Listener"
echo "========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Validate webhook secret is set
if [ -z "$WEBHOOK_SECRET" ]; then
  echo "❌ ERROR: GITHUB_WEBHOOK_SECRET environment variable not set"
  echo ""
  echo "Set it with:"
  echo "  export GITHUB_WEBHOOK_SECRET='your-secret-here'"
  echo ""
  echo "Generate a secret with:"
  echo "  openssl rand -hex 32"
  exit 1
fi

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --project="$PROJECT_ID"

# Create service account for webhook listener
SA_NAME="satu-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "🔐 Setting up service account..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name "SATU Blue-Green Deployer" \
  --project="$PROJECT_ID" 2>/dev/null || echo "Service account already exists"

# Grant permissions to deploy Cloud Run services
echo "🔑 Granting Cloud Run Admin permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin" \
  --condition=None

# Grant Cloud Build permissions (for building images)
echo "🔑 Granting Cloud Build permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor" \
  --condition=None

# Grant service account user role (required to deploy as another SA)
echo "🔑 Granting Service Account User permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

# Deploy webhook listener
echo ""
echo "🚀 Deploying webhook listener service..."
cd webhook-listener

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 3 \
  --min-instances 0 \
  --timeout 600 \
  --service-account="$SA_EMAIL" \
  --set-env-vars "GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET,GCP_PROJECT_ID=$PROJECT_ID,GCP_REGION=$REGION" \
  --project="$PROJECT_ID"

cd ..

# Get webhook URL
WEBHOOK_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo ""
echo "========================================="
echo "✅ WEBHOOK LISTENER DEPLOYED"
echo "========================================="
echo "Service URL: $WEBHOOK_URL"
echo "Webhook endpoint: ${WEBHOOK_URL}/webhook"
echo "Health check: ${WEBHOOK_URL}/health"
echo ""
echo "📋 Next steps:"
echo "1. Configure GitHub webhook:"
echo "   - URL: ${WEBHOOK_URL}/webhook"
echo "   - Secret: <your GITHUB_WEBHOOK_SECRET>"
echo "   - Content type: application/json"
echo "   - Events: Just the push event"
echo ""
echo "2. Test health check:"
echo "   curl ${WEBHOOK_URL}/health"
echo ""
echo "3. Initial blue-green setup:"
echo "   ./scripts/initial-blue-green-setup.sh"
echo "========================================="
