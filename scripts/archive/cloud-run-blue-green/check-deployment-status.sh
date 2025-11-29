#!/bin/bash
#
# Check current blue-green deployment status
#
# Shows which service is LIVE, revision info, and recent logs.
#
# Devon - "If you can't tell which service is live, you're already losing."

set -e

PROJECT_ID="${GCP_PROJECT_ID:-multiverseschool}"
REGION="${GCP_REGION:-europe-west1}"
BLUE_SERVICE="satu-blue"
GREEN_SERVICE="satu-green"
WEBHOOK_SERVICE="satu-webhook"

echo "========================================="
echo "📊 Blue-Green Deployment Status"
echo "========================================="
echo ""

# Check blue service
echo "🔵 BLUE Service:"
BLUE_TAG=$(gcloud run services describe "$BLUE_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.traffic[0].tag)" 2>/dev/null || echo "N/A")

BLUE_REVISION=$(gcloud run services describe "$BLUE_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.latestReadyRevisionName)" 2>/dev/null || echo "N/A")

BLUE_URL=$(gcloud run services describe "$BLUE_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)" 2>/dev/null || echo "N/A")

echo "  Tag: $BLUE_TAG"
echo "  Revision: $BLUE_REVISION"
echo "  URL: $BLUE_URL"
echo ""

# Check green service
echo "🟢 GREEN Service:"
GREEN_TAG=$(gcloud run services describe "$GREEN_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.traffic[0].tag)" 2>/dev/null || echo "N/A")

GREEN_REVISION=$(gcloud run services describe "$GREEN_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.latestReadyRevisionName)" 2>/dev/null || echo "N/A")

GREEN_URL=$(gcloud run services describe "$GREEN_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)" 2>/dev/null || echo "N/A")

echo "  Tag: $GREEN_TAG"
echo "  Revision: $GREEN_REVISION"
echo "  URL: $GREEN_URL"
echo ""

# Determine which is LIVE
LIVE_SERVICE="UNKNOWN"
STANDBY_SERVICE="UNKNOWN"
LIVE_URL="N/A"

if [ "$BLUE_TAG" = "LIVE" ]; then
  LIVE_SERVICE="$BLUE_SERVICE"
  STANDBY_SERVICE="$GREEN_SERVICE"
  LIVE_URL="$BLUE_URL"
elif [ "$GREEN_TAG" = "LIVE" ]; then
  LIVE_SERVICE="$GREEN_SERVICE"
  STANDBY_SERVICE="$BLUE_SERVICE"
  LIVE_URL="$GREEN_URL"
fi

echo "========================================="
echo "📍 Current State:"
echo "========================================="
echo "LIVE: $LIVE_SERVICE"
echo "STANDBY: $STANDBY_SERVICE"
echo "Public URL: $LIVE_URL"
echo ""

# Check webhook listener
echo "========================================="
echo "🎯 Webhook Listener:"
echo "========================================="
WEBHOOK_URL=$(gcloud run services describe "$WEBHOOK_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)" 2>/dev/null || echo "N/A")

if [ "$WEBHOOK_URL" != "N/A" ]; then
  echo "Status: ✅ Running"
  echo "URL: $WEBHOOK_URL"
  echo "Health: ${WEBHOOK_URL}/health"
  echo "Webhook: ${WEBHOOK_URL}/webhook"
else
  echo "Status: ❌ Not deployed"
  echo "Run: ./scripts/deploy-webhook-listener.sh"
fi
echo ""

# Recent webhook logs (if exists)
if [ "$WEBHOOK_URL" != "N/A" ]; then
  echo "========================================="
  echo "📋 Recent Webhook Activity (last 10 lines):"
  echo "========================================="
  gcloud run services logs read "$WEBHOOK_SERVICE" \
    --region "$REGION" \
    --project="$PROJECT_ID" \
    --limit 10 2>/dev/null || echo "No logs available"
fi

echo ""
echo "========================================="
echo "💡 Quick Actions:"
echo "========================================="
echo "Manual rollback:"
echo "  ./scripts/rollback.sh $STANDBY_SERVICE"
echo ""
echo "View blue logs:"
echo "  gcloud run services logs tail $BLUE_SERVICE --region $REGION"
echo ""
echo "View green logs:"
echo "  gcloud run services logs tail $GREEN_SERVICE --region $REGION"
echo ""
echo "View webhook logs:"
echo "  gcloud run services logs tail $WEBHOOK_SERVICE --region $REGION"
echo "========================================="
