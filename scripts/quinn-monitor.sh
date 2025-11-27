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
LIZ_DM_ROOM="!rWT9Yyl6yerqNlA3zLWtk1RIYQ4F3-bJPXwpXWanMN8"
LAST_EVENT_FILE="${REPO_DIR}/.quinn-last-event"
LAST_DM_EVENT_FILE="${REPO_DIR}/.quinn-last-dm-event"

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

# Initialize last event markers if not exist
if [ ! -f "$LAST_EVENT_FILE" ]; then
    echo "0" > "$LAST_EVENT_FILE"
fi
if [ ! -f "$LAST_DM_EVENT_FILE" ]; then
    echo "0" > "$LAST_DM_EVENT_FILE"
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

# Function to check for new DMs from Liz
check_for_dm_messages() {
    local SINCE=$(cat "$LAST_DM_EVENT_FILE")

    # Get recent messages from DM room
    local MESSAGES=$(curl -s -X GET \
        "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${LIZ_DM_ROOM}/messages?dir=b&limit=5" \
        -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" 2>/dev/null)

    if [ -z "$MESSAGES" ] || echo "$MESSAGES" | grep -q "errcode"; then
        return 1
    fi

    # Extract the latest event ID
    local LATEST_EVENT=$(echo "$MESSAGES" | grep -o '"event_id":"[^"]*"' | head -1 | cut -d'"' -f4)

    # Check if this is a new message (and not from orchestrator/quinn)
    if [ -n "$LATEST_EVENT" ] && [ "$LATEST_EVENT" != "$SINCE" ]; then
        # Check if message is from Liz (not from orchestrator)
        local FROM_LIZ=$(echo "$MESSAGES" | grep -i "lizthedeveloper" | head -1 || true)
        if [ -n "$FROM_LIZ" ]; then
            echo "$LATEST_EVENT" > "$LAST_DM_EVENT_FILE"
            echo "1"  # New DM found
            return 0
        fi
    fi

    echo "0"  # No new DMs
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

# Function to respond to DMs from Liz
respond_to_dm() {
    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    local RESPONSE_LOG="${LOG_DIR}/quinn_dm_response_${TIMESTAMP}.log"

    echo "$(date): Quinn responding to DM from Liz..." >> "$LOG_DIR/quinn-monitor.log"

    # Create task prompt for DM response
    cat > /tmp/quinn_dm_$TIMESTAMP.txt << 'QUINN_DM_TASK'
You are Quinn, the Technical PM for SATU. Liz (your human lead) sent you a direct message.

## Your Task
1. First, recall your memory: mcp__agent-memory__recall_context with agent_id "quinn"

2. Check the DM room for Liz's message:
```bash
source ~/.superalignment-env
curl -s -X GET "https://matrix.themultiverse.school/_matrix/client/v3/rooms/!rWT9Yyl6yerqNlA3zLWtk1RIYQ4F3-bJPXwpXWanMN8/messages?dir=b&limit=5" \
  -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" | grep -o '"body":"[^"]*"' | head -3
```

3. Respond to Liz's message appropriately:
   - If asked for status: Provide a concise status update
   - If asked to check something: Do the check and report
   - If asked a question: Answer based on your PM knowledge
   - If given a task: Acknowledge and do it or explain what's needed

4. Send your response to the DM room:
```bash
source ~/.superalignment-env
ROOM_ID="!rWT9Yyl6yerqNlA3zLWtk1RIYQ4F3-bJPXwpXWanMN8"
TXN_ID="quinn_dm_reply_$(date +%s)"
curl -s -X PUT "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${ROOM_ID}/send/m.room.message/${TXN_ID}" \
  -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" \
  -H "Content-Type: application/json" \
  -d '{"msgtype": "m.text", "body": "YOUR_RESPONSE_HERE"}'
```

5. Update your memory with what Liz asked and how you responded.

Be CONCISE and helpful. This is a direct conversation with your human lead. Prioritize her requests.
QUINN_DM_TASK

    # Run Claude Code as Quinn (5 minute timeout for responses)
    timeout 300 claude --model sonnet --dangerously-skip-permissions < /tmp/quinn_dm_$TIMESTAMP.txt >> "$RESPONSE_LOG" 2>&1
    local EXIT_CODE=$?

    rm -f /tmp/quinn_dm_$TIMESTAMP.txt

    if [ $EXIT_CODE -eq 0 ]; then
        echo "$(date): Quinn DM response completed" >> "$LOG_DIR/quinn-monitor.log"
    else
        echo "$(date): Quinn DM response failed (exit $EXIT_CODE)" >> "$LOG_DIR/quinn-monitor.log"
    fi
}

# Function to send heartbeat DM
send_heartbeat() {
    local STATUS="$1"
    local TXN_ID="quinn_heartbeat_$(date +%s)"
    curl -s -X PUT "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${LIZ_DM_ROOM}/send/m.room.message/${TXN_ID}" \
        -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" \
        -H "Content-Type: application/json" \
        -d "{\"msgtype\": \"m.text\", \"body\": \"${STATUS}\"}" > /dev/null 2>&1
}

# Main monitoring loop
echo "$(date): Quinn monitor active. Polling every ${POLL_INTERVAL}s..." >> "$LOG_DIR/quinn-monitor.log"
echo "$(date): Watching: coordination channel + Liz DM room" >> "$LOG_DIR/quinn-monitor.log"

# Send startup message
send_heartbeat "[Quinn] Monitor started on VM. Checking every 60s. Will message you on each cycle."

CYCLE_COUNT=0

while true; do
    CYCLE_COUNT=$((CYCLE_COUNT + 1))

    # Check for new channel mentions
    NEW_MSG=$(check_for_quinn_messages)
    if [ "$NEW_MSG" = "1" ]; then
        send_heartbeat "[Quinn] Detected mention in coordination - responding..."
        respond_as_quinn
    fi

    # Check for new DMs from Liz
    NEW_DM=$(check_for_dm_messages)
    if [ "$NEW_DM" = "1" ]; then
        send_heartbeat "[Quinn] Detected your DM - responding..."
        respond_to_dm
    fi

    # Quiet cycles - no message (disabled per Liz request)
    # Only notify on: startup, DM detected, mention detected

    # Wait before next check
    sleep $POLL_INTERVAL
done
