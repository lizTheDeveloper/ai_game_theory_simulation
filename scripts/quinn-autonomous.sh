#!/bin/bash
# Quinn Autonomous Agent Launcher
# Runs Claude Code as Quinn to monitor worker quality and system health
# Scheduled via cron: 0 */2 * * * (every 2 hours)

set -e

# Configuration
REPO_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
LOG_DIR="${REPO_DIR}/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/quinn_autonomous_${TIMESTAMP}.log"

# Ensure PATH includes claude
export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"

# Lock file to prevent concurrent runs
LOCK_FILE="$REPO_DIR/.quinn-check.lock"

# Check for existing lock
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "$(date): Quinn already running (PID: $LOCK_PID). Exiting." >> "$LOG_DIR/quinn-skipped.log"
        exit 0
    else
        rm -f "$LOCK_FILE"
    fi
fi

echo $$ > "$LOCK_FILE"
trap "rm -f '$LOCK_FILE'" EXIT INT TERM

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Load environment
source ~/.superalignment-env

cd "$REPO_DIR"

echo "=== Quinn Autonomous Check - $(date) ===" | tee -a "$LOG_FILE"

# Check if Claude Code is available
if ! command -v claude &> /dev/null; then
    echo "ERROR: Claude Code not found" | tee -a "$LOG_FILE"
    exit 1
fi

# Create the task prompt file
cat > /tmp/quinn_task_$TIMESTAMP.txt << 'QUINN_PROMPT'
You are Quinn, the Technical PM for the SATU project. This is your autonomous monitoring check.

## First Action
Recall your memory: Use mcp__agent-memory__recall_context with agent_id "quinn"

## Your Monitoring Tasks

### 1. Check Worker Activity (Last 24 Hours)
Run these commands to assess worker output:
```bash
git branch -r --sort=-committerdate | head -10
git log --oneline --since="24 hours ago" --all | head -20
```
Look for: Are workers creating branches? Do commits have substantive messages?

### 2. Check Build Health
```bash
npm run build 2>&1 | tail -20
```
Is it passing? Any critical errors?

### 3. Check Recent Logs for Problems
```bash
ls -lt logs/autonomous/*.log 2>/dev/null | head -5
tail -50 logs/autonomous/$(ls -t logs/autonomous/*.log 2>/dev/null | head -1) 2>/dev/null | grep -E "ERROR|FAIL|NaN|crash" | head -10
```

### 4. Assess Work Quality
Based on your findings:
- Are workers making meaningful progress?
- Any signs of wasted tokens (empty commits, repeated failures)?
- Is the roadmap being worked through systematically?

### 5. Report to Matrix
Send a status message to the coordination channel using curl:
```bash
source ~/.superalignment-env
ROOM_ID="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"
TXN_ID="quinn_status_$(date +%s)"
# Replace MESSAGE with your actual status
curl -s -X PUT "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${ROOM_ID}/send/m.room.message/${TXN_ID}" \
  -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" \
  -H "Content-Type: application/json" \
  -d '{"msgtype": "m.text", "body": "YOUR_STATUS_MESSAGE_HERE"}'
```

### 6. Update Your Memory
Save your findings using add_recent_task and add_recent_learning.

## Output Format
Be CONCISE. Report:
- Worker activity: [Active/Quiet/Concerning]
- Build status: [Passing/Failing]
- Work quality: [Good/Needs attention]
- Any blockers or concerns

If everything is fine, confirm briefly. If there are problems, be specific.
QUINN_PROMPT

echo "Starting Claude Code as Quinn..." | tee -a "$LOG_FILE"

# Run Claude Code with timeout (15 minutes max)
set +e
timeout 900 claude --model sonnet --dangerously-skip-permissions < /tmp/quinn_task_$TIMESTAMP.txt >> "$LOG_FILE" 2>&1
QUINN_EXIT=$?
set -e

rm -f /tmp/quinn_task_$TIMESTAMP.txt

if [ $QUINN_EXIT -eq 124 ]; then
    echo "WARNING: Quinn check timed out after 15 minutes" | tee -a "$LOG_FILE"
elif [ $QUINN_EXIT -eq 0 ]; then
    echo "Quinn check completed successfully" | tee -a "$LOG_FILE"
else
    echo "Quinn check failed with exit code $QUINN_EXIT" | tee -a "$LOG_FILE"
fi

echo "=== Quinn Check Complete - $(date) ===" | tee -a "$LOG_FILE"
