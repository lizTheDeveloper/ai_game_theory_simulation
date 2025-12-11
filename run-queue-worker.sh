#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$SCRIPT_DIR/../shared/logs/worker"
LOG_FILE="$LOG_DIR/worker_${TIMESTAMP}.log"
WORKER_ID="vm-worker-$(hostname)"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date)] 🚀 Starting queue-based worker"
echo "   Worker ID: $WORKER_ID"

cd "$SCRIPT_DIR"

# Pull latest
git checkout main
git pull origin main

# Check if queue scripts exist
if [ ! -f "scripts/generateAutonomousWorkerQueue.ts" ]; then
  echo "[$(date)] ❌ Queue scripts not found in this repo"
  echo "   This repo may not have queue infrastructure yet"
  echo "   Falling back to standard autonomous worker"
  if [ -f "autonomous-worker.sh" ]; then
    exec bash autonomous-worker.sh
  else
    echo "   No worker script found - exiting"
    exit 1
  fi
fi

# Regenerate queue
echo "[$(date)] 📋 Regenerating queue..."
npx tsx scripts/generateAutonomousWorkerQueue.ts

# Select task
echo "[$(date)] 🎯 Selecting task..."
TASK_JSON=$(npx tsx scripts/autonomousWorkerSelectTask.ts --token-budget=200000 --worker-id="$WORKER_ID" 2>&1)

if [ $? -ne 0 ]; then
  echo "[$(date)] ⏸️  No tasks available"
  exit 0
fi

TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_TITLE=$(echo "$TASK_JSON" | jq -r '.title')
AGENT=$(echo "$TASK_JSON" | jq -r '.agentPersonality')

echo "[$(date)] ✅ Task: $TASK_ID ($TASK_TITLE)"
echo "   Agent: $AGENT"

# Claim task
echo "[$(date)] 🔒 Claiming..."
npx tsx scripts/autonomousWorkerClaimTask.ts "$TASK_ID" "$WORKER_ID"

git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: $WORKER_ID → $TASK_ID"

if ! git push origin main; then
  echo "[$(date)] ❌ Claim failed - race condition"
  git reset --hard origin/main
  echo "   Retrying..."
  exec "$0"
fi

echo "[$(date)] ✅ Claimed"

# Map agent personality
declare -A AGENT_MAP=(
  ["roy"]="simulation-maintainer"
  ["devon"]="devops"
  ["cynthia"]="super-alignment-researcher"
  ["sylvia"]="research-skeptic"
  ["moss"]="feature-implementer"
  ["tessa"]="far-future-ux-designer"
  ["historian"]="wiki-documentation-updater"
  ["architect"]="architect"
  ["orchestrator"]="orchestrator"
  ["priya"]="quantitative-validator"
)

AGENT_FILE="${AGENT_MAP[$AGENT]}"
if [ -z "$AGENT_FILE" ]; then
  echo "[$(date)] ❌ Unknown agent: $AGENT"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "$WORKER_ID" "ABANDONED" "Unknown agent"
  exit 1
fi

AGENT_PATH=".claude/agents/${AGENT_FILE}.md"
if [ ! -f "$AGENT_PATH" ]; then
  echo "[$(date)] ❌ Agent file missing: $AGENT_PATH"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "$WORKER_ID" "ABANDONED" "Agent file missing"
  exit 1
fi

# Create branch
BRANCH="auto/queue-${TASK_ID}-${TIMESTAMP}"
git checkout -b "$BRANCH"

# Build prompt
PROMPT="/tmp/prompt_${TIMESTAMP}.txt"
cat > "$PROMPT" << PROMPT_END
Task: $TASK_ID from autonomous worker queue.

You are **$AGENT** - adopt this agent's expertise/personality.

## Agent Identity
$(cat "$AGENT_PATH")

## Task
ID: $TASK_ID
Title: $TASK_TITLE

## Instructions
1. Recall: mcp__agent-memory__recall_context({agent_id: "$AGENT"})
2. Read task: plans/AUTONOMOUS_WORKER_QUEUE.json → find $TASK_ID
3. Complete per acceptance criteria
4. Progress: npx tsx scripts/autonomousWorkerGetProgress.ts "$TASK_ID" --add-note "note"
5. Commit changes
6. Token budget awareness

## Completion
- Complete → auto-validated → COMPLETED if pass
- Blocked → add diagnostic notes
- Failed → add failure reason

## Constraints
- Token conservation ACTIVE
- Grep before read
- No optional docs
- Exit when done

Work.
PROMPT_END

# Execute
set +e
timeout 2700 claude --model sonnet --dangerously-skip-permissions < "$PROMPT" >> "$LOG_FILE" 2>&1
EXIT=$?
set -e

rm -f "$PROMPT"

if [ $EXIT -eq 124 ]; then
  echo "[$(date)] ⏱️  Timeout"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "$WORKER_ID" "ABANDONED" "Timeout"
  exit 1
elif [ $EXIT -ne 0 ]; then
  echo "[$(date)] ❌ Claude error: $EXIT"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "$WORKER_ID" "ABANDONED" "Claude error"
  exit 1
fi

# Validate
echo "[$(date)] 🔍 Validating..."
if npx tsx scripts/autonomousWorkerValidateTask.ts "$TASK_ID"; then
  echo "[$(date)] ✅ Validated"
  npx tsx scripts/autonomousWorkerCompleteTask.ts "$TASK_ID" "$WORKER_ID"
else
  echo "[$(date)] ⚠️  Validation failed"
  npx tsx scripts/autonomousWorkerReleaseTask.ts "$TASK_ID" "$WORKER_ID" "AVAILABLE" "Validation failed"
fi

# Push
echo "[$(date)] ⬆️  Pushing..."
git push origin "$BRANCH"

echo "[$(date)] 🏁 Complete"
