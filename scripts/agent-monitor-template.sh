#!/bin/bash
# Generic Agent Monitor Template
# Continuously monitors Matrix for messages to a specific agent and responds
# Runs as a background service on the VM
#
# Configuration via environment variables:
#   AGENT_NAME        - Agent name (e.g., "Roy", "Sylvia", "Devon")
#   AGENT_ID          - Agent ID for memory (e.g., "roy", "sylvia", "devon")
#   MATRIX_TOKEN_VAR  - Environment variable name for Matrix token (e.g., "MATRIX_TOKEN_ROY")
#   POLL_INTERVAL     - Check interval in seconds (default: 60)
#   WATCH_CHANNELS    - Comma-separated room IDs to monitor (default: coordination only)
#
# Usage:
#   AGENT_NAME="Roy" AGENT_ID="roy" MATRIX_TOKEN_VAR="MATRIX_TOKEN_ROY" ./agent-monitor-template.sh

set -e

# Validate required environment variables
if [ -z "$AGENT_NAME" ]; then
    echo "ERROR: AGENT_NAME environment variable required"
    exit 1
fi

if [ -z "$AGENT_ID" ]; then
    echo "ERROR: AGENT_ID environment variable required"
    exit 1
fi

if [ -z "$MATRIX_TOKEN_VAR" ]; then
    echo "ERROR: MATRIX_TOKEN_VAR environment variable required"
    exit 1
fi

# Configuration
REPO_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
LOG_DIR="${REPO_DIR}/logs/agent-monitors"
POLL_INTERVAL=${POLL_INTERVAL:-60}
AGENT_NAME_LOWER=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]')
LAST_EVENT_FILE="${REPO_DIR}/.${AGENT_NAME_LOWER}-last-event"

# Default to coordination channel if not specified
COORDINATION_ROOM="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"
IMPLEMENTATION_ROOM="!rnTkKCinvpZLUQlywzVtMdKLH9EuElxLu0EGFJ1LZGA"
RESEARCH_ROOM="!YdS1AvY5d7d6TfqEJC6klIdE6q3pqD1A1lFVMZ0dJ4I"

# Parse watch channels (comma-separated)
if [ -z "$WATCH_CHANNELS" ]; then
    WATCH_CHANNELS="$COORDINATION_ROOM"
fi

# Ensure PATH includes claude
export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"

# Lock file
LOCK_FILE="$REPO_DIR/.${AGENT_NAME_LOWER}-monitor.lock"

cleanup() {
    rm -f "$LOCK_FILE"
    echo "$(date): ${AGENT_NAME} monitor stopped" >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"
    exit 0
}

trap cleanup EXIT INT TERM

# Check for existing lock
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "${AGENT_NAME} monitor already running (PID: $LOCK_PID). Exiting."
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

# Get the Matrix token value from the environment variable name
MATRIX_TOKEN="${!MATRIX_TOKEN_VAR}"
if [ -z "$MATRIX_TOKEN" ]; then
    echo "ERROR: Matrix token not found in environment variable $MATRIX_TOKEN_VAR"
    exit 1
fi

cd "$REPO_DIR"

echo "$(date): ${AGENT_NAME} monitor starting..." >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"
echo "$(date): Agent ID: ${AGENT_ID}, Token var: ${MATRIX_TOKEN_VAR}" >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"

# Initialize last event marker if not exist
if [ ! -f "$LAST_EVENT_FILE" ]; then
    echo "0" > "$LAST_EVENT_FILE"
fi

# Function to check for new messages mentioning the agent
check_for_mentions() {
    local ROOM_ID="$1"
    local SINCE=$(cat "$LAST_EVENT_FILE")

    # Get recent messages from room
    local MESSAGES=$(curl -s -X GET \
        "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${ROOM_ID}/messages?dir=b&limit=10" \
        -H "Authorization: Bearer ${MATRIX_TOKEN}" 2>/dev/null)

    if [ -z "$MESSAGES" ] || echo "$MESSAGES" | grep -q "errcode"; then
        return 1
    fi

    # Check for messages mentioning the agent (case insensitive)
    # Look for: agent name, @agent, or agent-specific keywords
    local AGENT_MENTIONS=$(echo "$MESSAGES" | grep -i "${AGENT_NAME_LOWER}" || true)

    # Filter out messages from the agent itself
    AGENT_MENTIONS=$(echo "$AGENT_MENTIONS" | grep -v "\"@agent-${AGENT_NAME_LOWER}:" || true)

    if [ -n "$AGENT_MENTIONS" ]; then
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

# Function to respond as the agent
respond_as_agent() {
    local ROOM_ID="$1"
    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    local RESPONSE_LOG="${LOG_DIR}/${AGENT_NAME_LOWER}_response_${TIMESTAMP}.log"

    echo "$(date): ${AGENT_NAME} responding to message in room ${ROOM_ID}..." >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"

    # Determine room name for context
    local ROOM_NAME="unknown channel"
    if [ "$ROOM_ID" = "$COORDINATION_ROOM" ]; then
        ROOM_NAME="coordination channel"
    elif [ "$ROOM_ID" = "$IMPLEMENTATION_ROOM" ]; then
        ROOM_NAME="implementation channel"
    elif [ "$ROOM_ID" = "$RESEARCH_ROOM" ]; then
        ROOM_NAME="research channel"
    fi

    # Create task prompt
    cat > /tmp/${AGENT_NAME_LOWER}_respond_$TIMESTAMP.txt << AGENT_TASK
You are ${AGENT_NAME}, an agent in the SATU multi-agent system. Someone mentioned you in the ${ROOM_NAME}.

## Your Task
1. First, recall your memory: mcp__agent-memory__recall_context with agent_id "${AGENT_ID}"

2. Check what message was sent to you in room ${ROOM_ID}:
\`\`\`bash
source ~/.superalignment-env
curl -s -X GET "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${ROOM_ID}/messages?dir=b&limit=10" \\
  -H "Authorization: Bearer \${${MATRIX_TOKEN_VAR}}" | grep -o '"body":"[^"]*"' | head -5
\`\`\`

3. Respond appropriately based on your role:
   - If asked for status: Provide a concise status update
   - If asked to check something: Do the check and report
   - If asked a question: Answer based on your domain expertise
   - If given a task: Acknowledge and either do it or explain what's needed

4. Send your response to Matrix using curl:
\`\`\`bash
source ~/.superalignment-env
ROOM_ID="${ROOM_ID}"
TXN_ID="${AGENT_NAME_LOWER}_reply_\$(date +%s)"
curl -s -X PUT "https://matrix.themultiverse.school/_matrix/client/v3/rooms/\${ROOM_ID}/send/m.room.message/\${TXN_ID}" \\
  -H "Authorization: Bearer \${${MATRIX_TOKEN_VAR}}" \\
  -H "Content-Type: application/json" \\
  -d '{"msgtype": "m.text", "body": "YOUR_RESPONSE_HERE"}'
\`\`\`

5. Update your memory with what you learned/did:
   mcp__agent-memory__add_recent_task with agent_id "${AGENT_ID}"

Be CONCISE and helpful. Focus on your domain of expertise.
AGENT_TASK

    # Run Claude Code as the agent (5 minute timeout for responses)
    timeout 300 claude --model sonnet --dangerously-skip-permissions < /tmp/${AGENT_NAME_LOWER}_respond_$TIMESTAMP.txt >> "$RESPONSE_LOG" 2>&1
    local EXIT_CODE=$?

    rm -f /tmp/${AGENT_NAME_LOWER}_respond_$TIMESTAMP.txt

    if [ $EXIT_CODE -eq 0 ]; then
        echo "$(date): ${AGENT_NAME} response completed" >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"
    else
        echo "$(date): ${AGENT_NAME} response failed (exit $EXIT_CODE)" >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"
    fi
}

# Main monitoring loop
echo "$(date): ${AGENT_NAME} monitor active. Polling every ${POLL_INTERVAL}s..." >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"
echo "$(date): Watching channels: ${WATCH_CHANNELS}" >> "$LOG_DIR/${AGENT_NAME_LOWER}-monitor.log"

# Convert comma-separated list to array
IFS=',' read -ra ROOMS <<< "$WATCH_CHANNELS"

while true; do
    # Check each monitored room
    for ROOM in "${ROOMS[@]}"; do
        ROOM=$(echo "$ROOM" | xargs)  # Trim whitespace

        NEW_MSG=$(check_for_mentions "$ROOM")
        if [ "$NEW_MSG" = "1" ]; then
            respond_as_agent "$ROOM"
        fi
    done

    # Wait before next check
    sleep $POLL_INTERVAL
done
