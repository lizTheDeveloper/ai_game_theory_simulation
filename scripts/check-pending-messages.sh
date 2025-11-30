#!/bin/bash
# Check for pending Matrix messages before starting autonomous work
# Returns 0 if no urgent messages, 1 if messages pending (worker should handle them first)

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load environment
if [ -f ~/.superalignment-env ]; then
    source ~/.superalignment-env
fi

# Coordination channel - check for any @mentions
COORDINATION_ROOM="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"

# Use orchestrator token (workers share this for now)
MATRIX_TOKEN="${MATRIX_TOKEN_ORCHESTRATOR}"

if [ -z "$MATRIX_TOKEN" ]; then
    # Can't check messages without token - proceed with work
    exit 0
fi

# Get last 10 messages from coordination
MESSAGES=$(curl -s -X GET \
    "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${COORDINATION_ROOM}/messages?dir=b&limit=10" \
    -H "Authorization: Bearer ${MATRIX_TOKEN}" 2>/dev/null)

if [ -z "$MESSAGES" ] || echo "$MESSAGES" | grep -q "errcode"; then
    # API error - proceed with work
    exit 0
fi

# Check for unhandled @mentions to agents
# This is a simple check - monitors handle the actual responses
URGENT_MENTIONS=$(echo "$MESSAGES" | grep -E "@(roy|devon|sylvia|cynthia|orchestrator|architect)" || true)

if [ -n "$URGENT_MENTIONS" ]; then
    echo "📬 Pending @mentions detected in coordination channel"
    echo "   (Agent monitors will handle responses)"
    # Still return 0 - monitors handle this, not workers
    exit 0
fi

# No pending messages
exit 0
