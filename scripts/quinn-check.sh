#!/bin/bash
# Quinn Monitoring Script - VM worker status checker
# Posts status updates to Matrix coordination channel

set -euo pipefail

REPO_BASE="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
ENV_FILE="/home/lizthedeveloper_gmail_com/.superalignment-env"

# Load Matrix token
source "$ENV_FILE"
MATRIX_TOKEN="$MATRIX_TOKEN_ORCHESTRATOR"
MATRIX_HOMESERVER="https://matrix.themultiverse.school"
MATRIX_ROOM_ID="!qXYuwRwhmVDlHppXpY:themultiverse.school"  # coordination channel

# Matrix send function
send_matrix_message() {
    local message="$1"
    curl -s -X POST "${MATRIX_HOMESERVER}/_matrix/client/r0/rooms/${MATRIX_ROOM_ID}/send/m.room.message?access_token=${MATRIX_TOKEN}" \
         -H "Content-Type: application/json" \
         -d "{\"msgtype\": \"m.text\", \"body\": \"$message\"}" > /dev/null
}

# Check systemd services
WORKER_STATUS=$(systemctl --user is-active satu-worker 2>&1 || echo "inactive")
ORCHESTRATOR_STATUS=$(systemctl --user is-active satu-orchestrator 2>&1 || echo "inactive")

# Check recent worker activity (last 6 hours)
RECENT_BRANCHES=$(cd "$REPO_BASE" && git branch -r --sort=-committerdate | grep -E '(auto/worker|auto/orchestrator|auto/researcher)' | head -5 || echo "No recent branches")

# Check queue status
QUEUE_FILE="$REPO_BASE/plans/AUTONOMOUS_WORKER_QUEUE.json"
CLAIMED_COUNT=0
AVAILABLE_COUNT=0
if [ -f "$QUEUE_FILE" ]; then
    CLAIMED_COUNT=$(jq '[.queue[] | select(.status == "CLAIMED")] | length' "$QUEUE_FILE" 2>/dev/null || echo 0)
    AVAILABLE_COUNT=$(jq '[.queue[] | select(.status == "AVAILABLE")] | length' "$QUEUE_FILE" 2>/dev/null || echo 0)
fi

# Check build status (if we have npm test)
BUILD_STATUS="unknown"
if [ -f "$REPO_BASE/package.json" ]; then
    cd "$REPO_BASE"
    if npm test --silent > /tmp/test-output.txt 2>&1; then
        BUILD_STATUS="passing"
    else
        BUILD_STATUS="failing"
    fi
fi

# Check for blockers (CRITICAL tasks that are claimed but not progressing)
STALLED_TASKS=$(jq -r '.queue[] | select(.status == "CLAIMED" and .priority == "CRITICAL") | "\(.title) (claimed by \(.claimedBy))"' "$QUEUE_FILE" 2>/dev/null || echo "None")

# Build status message
STATUS_MSG="[Quinn VM Check - $(date +%H:%M) UTC]

Worker Status:
- satu-worker: $WORKER_STATUS
- satu-orchestrator: $ORCHESTRATOR_STATUS

Task Queue:
- Available: $AVAILABLE_COUNT
- Claimed: $CLAIMED_COUNT

Build: $BUILD_STATUS

Recent Activity:
$RECENT_BRANCHES

Blockers:
$STALLED_TASKS"

# Send to Matrix
send_matrix_message "$STATUS_MSG"

echo "Status posted to Matrix coordination channel"
