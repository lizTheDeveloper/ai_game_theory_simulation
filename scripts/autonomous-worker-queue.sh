#!/bin/bash
set -e

# Queue-based autonomous worker
# Selects tasks from AUTONOMOUS_WORKER_QUEUE.json by priority
# Loads agent personality dynamically based on task assignment

export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
LOCK_FILE="$PROJECT_DIR/.autonomous-worker-queue.lock"

if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "⚠️  Another worker is running (PID: $LOCK_PID). Exiting."
        exit 0
    fi
    rm -f "$LOCK_FILE"
fi

echo $$ > "$LOCK_FILE"
trap "rm -f '$LOCK_FILE'" EXIT INT TERM

if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/worker_queue_$TIMESTAMP.log"
BRANCH_NAME="auto/worker-$TIMESTAMP"
WORKER_ID="worker-$TIMESTAMP"

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

exec 2>&1 | tee "$LOG_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Queue-Based Autonomous Worker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Worker ID: $WORKER_ID"
echo "Timestamp: $TIMESTAMP"
echo ""

# Sync with main
echo "━━━ GIT SYNC ━━━"
git checkout main 2>&1 || true

if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠️  Uncommitted changes - committing before pull"
    git add -A
    git commit -m "chore: Auto-commit before pull (worker queue $TIMESTAMP)" 2>&1 || true
fi

echo "📥 Pulling latest from main..."
git pull origin main 2>&1 || {
    echo "❌ Pull failed - merge conflict"
    exit 1
}

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "✅ Synced to commit: $CURRENT_COMMIT"
echo ""

# Regenerate queue from roadmap
echo "━━━ QUEUE REGENERATION ━━━"
echo "🔄 Regenerating queue from roadmap..."
if npx tsx scripts/generateAutonomousWorkerQueue.ts --preserve-claims 2>&1; then
    echo "✅ Queue regenerated"
else
    echo "❌ Queue generation failed"
    exit 1
fi
echo ""

# Select task
echo "━━━ TASK SELECTION ━━━"
echo "🔍 Selecting highest-priority available task..."

TASK_JSON=$(npx tsx scripts/autonomousWorkerSelectTask.ts \
    --token-budget=200000 \
    --worker-id="$WORKER_ID" \
    --resume 2>&1)

if [ -z "$TASK_JSON" ] || echo "$TASK_JSON" | grep -q "No tasks available"; then
    echo "⏸️  No tasks available within budget - exiting gracefully"
    exit 0
fi

TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_TITLE=$(echo "$TASK_JSON" | jq -r '.title')
TASK_PRIORITY=$(echo "$TASK_JSON" | jq -r '.priority')
AGENT_PERSONALITY=$(echo "$TASK_JSON" | jq -r '.agentPersonality')
ESTIMATED_TOKENS=$(echo "$TASK_JSON" | jq -r '.estimatedTokens')

echo "✅ Selected task: $TASK_ID"
echo "   Title: $TASK_TITLE"
echo "   Priority: $TASK_PRIORITY"
echo "   Agent: $AGENT_PERSONALITY"
echo "   Estimated tokens: $ESTIMATED_TOKENS"
echo ""

# Claim task
echo "━━━ TASK CLAIM ━━━"
echo "🔒 Claiming task atomically via git..."

if npx tsx scripts/autonomousWorkerClaimTask.ts \
    --task-id="$TASK_ID" \
    --worker-id="$WORKER_ID" 2>&1; then
    echo "✅ Task claimed successfully"
else
    echo "❌ Claim failed (race condition or task unavailable)"
    exit 0
fi
echo ""

# Create branch
echo "━━━ BRANCH CREATION ━━━"
echo "🌿 Creating work branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME" 2>&1
echo ""

# Load agent personality
echo "━━━ AGENT PERSONALITY LOADING ━━━"
echo "🎭 Loading agent personality: $AGENT_PERSONALITY"

AGENT_PROMPT_FILE=""
AGENT_NAME="$AGENT_PERSONALITY"

case "$AGENT_PERSONALITY" in
    roy)
        AGENT_PROMPT_FILE=".claude/agents/simulation-maintainer.md"
        AGENT_NAME="Roy (simulation-maintainer)"
        ;;
    devon)
        AGENT_PROMPT_FILE=".claude/agents/devops.md"
        AGENT_NAME="Devon (devops)"
        ;;
    sylvia)
        AGENT_PROMPT_FILE=".claude/agents/research-skeptic.md"
        AGENT_NAME="Sylvia (research-skeptic)"
        ;;
    cynthia)
        AGENT_PROMPT_FILE=".claude/agents/super-alignment-researcher.md"
        AGENT_NAME="Cynthia (super-alignment-researcher)"
        ;;
    moss)
        AGENT_PROMPT_FILE=".claude/agents/feature-implementer.md"
        AGENT_NAME="Moss (feature-implementer)"
        ;;
    tessa)
        AGENT_PROMPT_FILE=".claude/agents/far-future-ux-designer.md"
        AGENT_NAME="Tessa (far-future-ux-designer)"
        ;;
    historian)
        AGENT_PROMPT_FILE=".claude/agents/wiki-documentation-updater.md"
        AGENT_NAME="Historian (wiki-documentation-updater)"
        ;;
    architect)
        AGENT_PROMPT_FILE=".claude/agents/architect.md"
        AGENT_NAME="Architect"
        ;;
    orchestrator)
        AGENT_PROMPT_FILE=".claude/agents/orchestrator.md"
        AGENT_NAME="Orchestrator"
        ;;
    *)
        echo "⚠️  Unknown personality: $AGENT_PERSONALITY (using orchestrator)"
        AGENT_PROMPT_FILE=".claude/agents/orchestrator.md"
        AGENT_NAME="Orchestrator"
        ;;
esac

if [ ! -f "$PROJECT_DIR/$AGENT_PROMPT_FILE" ]; then
    echo "❌ Agent prompt file not found: $AGENT_PROMPT_FILE"
    echo "⚠️  Falling back to orchestrator"
    AGENT_PROMPT_FILE=".claude/agents/orchestrator.md"
fi

echo "✅ Agent loaded: $AGENT_NAME"
echo "   Prompt file: $AGENT_PROMPT_FILE"
echo ""

# Create task prompt
echo "━━━ TASK PROMPT GENERATION ━━━"
TASK_PROMPT_FILE="/tmp/task_prompt_$TIMESTAMP.txt"

cat > "$TASK_PROMPT_FILE" << TASK_EOF
# AUTONOMOUS WORKER QUEUE TASK

You are $AGENT_NAME, working on a task from the autonomous worker queue.

## Task Details

**ID:** $TASK_ID
**Title:** $TASK_TITLE
**Priority:** $TASK_PRIORITY
**Estimated Tokens:** $ESTIMATED_TOKENS
**Worker ID:** $WORKER_ID

## Task Description

$(echo "$TASK_JSON" | jq -r '.description // "No description provided"')

## Acceptance Criteria

$(echo "$TASK_JSON" | jq -r '.acceptanceCriteria[]? // "No acceptance criteria provided"' | sed 's/^/- /')

## Validation Command

$(echo "$TASK_JSON" | jq -r '.validationCommand // "No validation command provided"')

## Instructions

1. **Read task context:** Understand what needs to be done
2. **Load agent personality:** You ARE $AGENT_NAME - operate with that personality and domain expertise
3. **Recall agent memory:** Use MCP agent-memory to load your accumulated context
4. **Execute work:** Complete the task to satisfaction of acceptance criteria
5. **Validate:** Run validation command if provided
6. **Update progress:** Use autonomousWorkerGetProgress.ts to track attempts and notes
7. **Complete or release:** Mark complete if validation passes, release if blocked

## Token Conservation

- Grep before reading files
- Batch tool calls
- Skip optional documentation
- Exit early when task complete
- Commit partial work if necessary

## Completion

When done, you MUST run:
\`\`\`bash
npx tsx scripts/autonomousWorkerCompleteTask.ts --task-id="$TASK_ID" --worker-id="$WORKER_ID"
\`\`\`

If blocked or unable to complete:
\`\`\`bash
npx tsx scripts/autonomousWorkerReleaseTask.ts --task-id="$TASK_ID" --worker-id="$WORKER_ID" --reason="<reason>"
\`\`\`

Begin work now.
TASK_EOF

echo "✅ Task prompt generated: $TASK_PROMPT_FILE"
echo ""

# Execute via Claude Code
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EXECUTING TASK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Inject agent personality into session
if [ -f "$PROJECT_DIR/$AGENT_PROMPT_FILE" ]; then
    cat "$PROJECT_DIR/$AGENT_PROMPT_FILE" "$TASK_PROMPT_FILE" > /tmp/full_prompt_$TIMESTAMP.txt
    EXECUTION_PROMPT="/tmp/full_prompt_$TIMESTAMP.txt"
else
    EXECUTION_PROMPT="$TASK_PROMPT_FILE"
fi

claude --model sonnet --dangerously-skip-permissions < "$EXECUTION_PROMPT" 2>&1

EXECUTION_EXIT=$?
echo ""
echo "━━━ EXECUTION COMPLETE ━━━"
echo "Exit code: $EXECUTION_EXIT"
echo ""

# Cleanup temp files
rm -f "$TASK_PROMPT_FILE" /tmp/full_prompt_$TIMESTAMP.txt

# Push branch
echo "━━━ GIT PUSH ━━━"
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "📤 Pushing branch: $BRANCH_NAME"
    git push -u origin "$BRANCH_NAME" 2>&1 || {
        echo "⚠️  Push failed - branch may already exist or network issue"
    }
else
    echo "⏸️  No changes to push"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ WORKER SESSION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Task: $TASK_ID"
echo "Branch: $BRANCH_NAME"
echo "Log: $LOG_FILE"
echo ""
