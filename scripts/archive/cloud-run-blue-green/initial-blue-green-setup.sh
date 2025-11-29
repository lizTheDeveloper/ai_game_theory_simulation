#!/bin/bash
#
# Initial blue-green deployment setup
#
# Creates satu-blue and satu-green services, deploys current code to both,
# and tags satu-blue as LIVE.
#
# Only run this once during initial setup.
#
# Devon - "Blue-green without initial state is just two broken services."

set -e

PROJECT_ID="${GCP_PROJECT_ID:-multiverseschool}"
REGION="${GCP_REGION:-europe-west1}"
BLUE_SERVICE="satu-blue"
GREEN_SERVICE="satu-green"

echo "========================================="
echo "🔵🟢 Initial Blue-Green Setup"
echo "========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Deploy blue service
echo "🔵 Deploying BLUE service (initial)..."
gcloud run deploy "$BLUE_SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3333 \
  --timeout 300 \
  --project="$PROJECT_ID"

# Tag blue as LIVE (100% traffic)
echo "🏷️  Tagging BLUE as LIVE..."
gcloud run services update-traffic "$BLUE_SERVICE" \
  --region "$REGION" \
  --to-latest \
  --tag LIVE \
  --project="$PROJECT_ID"

# Deploy green service (same code, but no traffic)
echo ""
echo "🟢 Deploying GREEN service (standby)..."
gcloud run deploy "$GREEN_SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3333 \
  --timeout 300 \
  --no-traffic \
  --tag staging \
  --project="$PROJECT_ID"

# Get URLs
BLUE_URL=$(gcloud run services describe "$BLUE_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

GREEN_URL=$(gcloud run services describe "$GREEN_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo ""
echo "========================================="
echo "✅ BLUE-GREEN SETUP COMPLETE"
echo "========================================="
echo "LIVE (BLUE): $BLUE_URL"
echo "STANDBY (GREEN): $GREEN_URL"
echo ""
echo "📋 Traffic routing:"
echo "  - BLUE: LIVE tag (100% traffic)"
echo "  - GREEN: staging tag (no traffic)"
echo ""
echo "📋 Next deployment will:"
echo "  1. Deploy to GREEN (standby)"
echo "  2. Health check GREEN"
echo "  3. Switch LIVE tag to GREEN"
echo "  4. BLUE becomes new standby"
echo ""
echo "📋 To trigger deployment:"
echo "  git push origin production"
echo "========================================="
