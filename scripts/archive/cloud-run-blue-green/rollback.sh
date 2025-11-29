#!/bin/bash
#
# Instant rollback - switch LIVE tag to specified service
#
# Usage:
#   ./scripts/rollback.sh satu-blue
#   ./scripts/rollback.sh satu-green
#
# Devon - "Rollback should be faster than your manager can say 'what happened?'"

set -e

TARGET_SERVICE="$1"
PROJECT_ID="${GCP_PROJECT_ID:-multiverseschool}"
REGION="${GCP_REGION:-europe-west1}"
BLUE_SERVICE="satu-blue"
GREEN_SERVICE="satu-green"

if [ -z "$TARGET_SERVICE" ]; then
  echo "❌ Usage: $0 <service-name>"
  echo ""
  echo "Example:"
  echo "  $0 satu-blue"
  echo "  $0 satu-green"
  exit 1
fi

if [ "$TARGET_SERVICE" != "$BLUE_SERVICE" ] && [ "$TARGET_SERVICE" != "$GREEN_SERVICE" ]; then
  echo "❌ Invalid service: $TARGET_SERVICE"
  echo "Must be either $BLUE_SERVICE or $GREEN_SERVICE"
  exit 1
fi

OTHER_SERVICE="$BLUE_SERVICE"
if [ "$TARGET_SERVICE" = "$BLUE_SERVICE" ]; then
  OTHER_SERVICE="$GREEN_SERVICE"
fi

echo "========================================="
echo "⏪ ROLLING BACK"
echo "========================================="
echo "Target: $TARGET_SERVICE (will become LIVE)"
echo "Previous: $OTHER_SERVICE (will become standby)"
echo ""

read -p "Continue with rollback? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

# Remove LIVE tag from other service
echo "🔄 Removing LIVE tag from $OTHER_SERVICE..."
gcloud run services update-traffic "$OTHER_SERVICE" \
  --region "$REGION" \
  --remove-tags LIVE \
  --project="$PROJECT_ID" 2>/dev/null || true

# Add LIVE tag to target service (100% traffic)
echo "🔄 Adding LIVE tag to $TARGET_SERVICE..."
gcloud run services update-traffic "$TARGET_SERVICE" \
  --region "$REGION" \
  --to-latest \
  --tag LIVE \
  --project="$PROJECT_ID"

# Get new LIVE URL
LIVE_URL=$(gcloud run services describe "$TARGET_SERVICE" \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo ""
echo "========================================="
echo "✅ ROLLBACK COMPLETE"
echo "========================================="
echo "LIVE service: $TARGET_SERVICE"
echo "LIVE URL: $LIVE_URL"
echo "Standby service: $OTHER_SERVICE"
echo ""
echo "💡 Service should be accessible immediately"
echo "========================================="
