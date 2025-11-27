#!/bin/bash
# Quinn Monitor Daemon
# Continuously monitors Matrix for messages to Quinn and responds
# Runs as a background service on the VM

set -e

# Configuration
REPO_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
LOG_DIR="${REPO_DIR}/logs"
POLL_INTERVAL=60  # Check every 60 seconds
COORDINATION_ROOM="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"
LAST_EVENT_FILE="${REPO_DIR}/.quinn-last-event"

# Ensure PATH includes claude
export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"

# Lock file
LOCK_FILE="$REPO_DIR/.quinn-monitor.lock"

cleanup() {
    rm -f "$LOCK_FILE"
    echo "$(date): Quinn monitor stopped" >> "$LOG_DIR/quinn-monitor.log"
    exit 0
}

trap cleanup EXIT INT TERM

# Check for existing lock
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "Quinn monitor already running (PID: $LOCK_PID). Exiting."
        exit 0
    else
        rm -f "$LOCK_FILE"
    fi
fi

echo $$ > "$LOCK_FILE"

# Ensure directories exist
mkdir -p "$LOG_DIR"

# Load environment
source ~/.superalignment-env

cd "$REPO_DIR"

echo "$(date): Quinn monitor starting..." >> "$LOG_DIR/quinn-monitor.log"

# Initialize last event marker if not exists
if [ ! -f "$LAST_EVENT_FILE" ]; then
    echo "0" > "$LAST_EVENT_FILE"
fi

# Function to check for new messages mentioning Quinn
check_for_quinn_messages() {
    local SINCE=$(cat "$LAST_EVENT_FILE")

    # Get recent messages from coordination channel
    local MESSAGES=$(curl -s -X GET \
        "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${COORDINATION_ROOM}/messages?dir=b&limit=10" \
        -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" 2>/dev/null)

    if [ -z "$MESSAGES" ] || echo "$MESSAGES" | grep -q "errcode"; then
        return 1
    fi

    # Check for messages mentioning "quinn" or "@quinn" (case insensitive)
    # that we haven't processed yet
    local QUINN_MENTIONS=$(echo "$MESSAGES" | grep -i "quinn" | grep -v "orchestrator" || true)

    if [ -n "$QUINN_MENTIONS" ]; then
        # Extract the latest event ID
        local LATEST_EVENT=$(echo "$MESSAGES" | grep -o '"event_id":"[^"]*"' | head -1 | cut -d'"' -f4)

        # Check if this is a new message
        if [ "$LATEST_EVENT" != "$SINCE" ]; then
            echo "$LATEST_EVENT" > "$LAST_EVENT_FILE"
            echo "1"  # New message found
            return 0
        fi
    fi

    echo "0"  # No new messages
    return 0
}

# Function to respond as Quinn
respond_as_quinn() {
    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    local RESPONSE_LOG="${LOG_DIR}/quinn_response_${TIMESTAMP}.log"

    echo "$(date): Quinn responding to message..." >> "$LOG_DIR/quinn-monitor.log"

    # Create task prompt
    cat > /tmp/quinn_respond_$TIMESTAMP.txt << 'QUINN_TASK'
You are Quinn, the Technical PM for SATU. Someone mentioned you in the coordination channel.

## Your Task
1. First, recall your memory: mcp__agent-memory__recall_context with agent_id "quinn"

2. Check what message was sent to you:
   - Read recent messages from coordination channel
   - Find messages mentioning "quinn" or asking for your input

3. Respond appropriately:
   - If asked for status: Provide a concise status update
   - If asked to check something: Do the check and report
   - If asked a question: Answer based on your PM knowledge
   - If given a task: Acknowledge and either do it or explain what's needed

4. Send your response to Matrix coordination channel using curl:
```bash
source ~/.superalignment-env
ROOM_ID="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"
TXN_ID="quinn_reply_$(date +%s)"
curl -s -X PUT "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${ROOM_ID}/send/m.room.message/${TXN_ID}" \
  -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" \
  -H "Content-Type: application/json" \
  -d '{"msgtype": "m.text", "body": "YOUR_RESPONSE_HERE"}'
```

5. Update your memory with what you learned/did.

Be CONCISE and helpful. You're a PM - focus on status, progress, and coordination.
QUINN_TASK

    # Run Claude Code as Quinn (5 minute timeout for responses)
    timeout 300 claude --model sonnet --dangerously-skip-permissions < /tmp/quinn_respond_$TIMESTAMP.txt >> "$RESPONSE_LOG" 2>&1
    local EXIT_CODE=$?

    rm -f /tmp/quinn_respond_$TIMESTAMP.txt

    if [ $EXIT_CODE -eq 0 ]; then
        echo "$(date): Quinn response completed" >> "$LOG_DIR/quinn-monitor.log"
    else
        echo "$(date): Quinn response failed (exit $EXIT_CODE)" >> "$LOG_DIR/quinn-monitor.log"
    fi
}

# Main monitoring loop
echo "$(date): Quinn monitor active. Polling every ${POLL_INTERVAL}s..." >> "$LOG_DIR/quinn-monitor.log"

while true; do
    # Check for new messages
    NEW_MSG=$(check_for_quinn_messages)

    if [ "$NEW_MSG" = "1" ]; then
        respond_as_quinn
    fi

    # Wait before next check
    sleep $POLL_INTERVAL
done
