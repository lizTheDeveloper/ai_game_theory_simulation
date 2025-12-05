#!/bin/bash
set -e

# Ensure PATH includes claude (needed for cron execution)
export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"

# Get the actual project directory where this script lives
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Lock file to prevent concurrent runs
LOCK_FILE="$PROJECT_DIR/.autonomous-worker.lock"

# Check for existing lock
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    # Check if process is still running
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "⚠️  Another worker is running (PID: $LOCK_PID). Exiting."
        exit 0
    else
        # Stale lock file
        rm -f "$LOCK_FILE"
    fi
fi

# Create lock file with current PID
echo $$ > "$LOCK_FILE"

# Ensure lock is removed on exit
trap "rm -f '$LOCK_FILE'" EXIT INT TERM

# Source .env file to get API key
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

# Export API key explicitly
# export ANTHROPIC_API_KEY  # Not needed - using Claude Code CLI session

LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/worker_$TIMESTAMP.log"
METRICS_FILE="$LOG_DIR/metrics_$TIMESTAMP.json"
STATUS_FILE="$LOG_DIR/status_current.txt"
BRANCH_NAME="auto/worker-$TIMESTAMP"

# Timing metrics
START_TIME=$(date +%s)
STAGE_START=$START_TIME

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_stage() {
    local stage=$1
    local now=$(date +%s)
    local elapsed=$((now - STAGE_START))
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}⏱️  [$stage] +${elapsed}s${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    STAGE_START=$now
    echo "$stage" > "$STATUS_FILE"
}

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_metric() { echo -e "${CYAN}📊 $1${NC}"; }

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

{
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║       🤖 AUTONOMOUS WORKER - $TIMESTAMP        ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Health checks
    log_stage "PRE-FLIGHT CHECKS"

    # Check API key
# Check Claude Code CLI    if ! command -v claude >/dev/null 2>&1; then        log_error "Claude Code CLI not found!"        log_info "Install: curl -fsSL https://claude.ai/install.sh | sh"        exit 1    fi    CLAUDE_VERSION=$(claude --version 2>&1 | head -1)    log_success "Claude Code CLI available: $CLAUDE_VERSION"    log_info "Using authenticated Claude Code session (no API key needed)"

    # Check disk space
    DISK_AVAIL=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    log_metric "Disk available: $DISK_AVAIL"

    # Check memory
    MEM_AVAIL=$(free -h | awk 'NR==2 {print $7}')
    log_metric "Memory available: $MEM_AVAIL"

    # Update Claude Code to latest version
    log_info "Updating Claude Code to latest version..."
    if sudo rm -rf /usr/lib/node_modules/@anthropic-ai/claude-code && sudo npm i -g @anthropic-ai/claude-code >/dev/null 2>&1; then
        CLAUDE_VERSION=$(claude --version 2>&1 || echo "unknown")
        log_success "Claude Code updated: $CLAUDE_VERSION"
    else
        log_warning "Claude Code update failed, continuing with existing version"
    fi

    # Ensure chatroom monitors are running
    log_info "Checking chatroom monitor status..."
    if pgrep -f "channel-monitor.ts" > /dev/null; then
        log_success "Chatroom monitor already running"
    else
        log_warning "Chatroom monitor not running, starting it..."
        # Note: channel-monitor.ts is TypeScript (npx tsx), doesn't need Python .venv
        nohup npx tsx scripts/channel-monitor.ts > logs/monitor_$TIMESTAMP.log 2>&1 &
        MONITOR_PID=$!
        sleep 2  # Give it a moment to start
        if ps -p $MONITOR_PID > /dev/null; then
            log_success "Chatroom monitor started (PID: $MONITOR_PID)"
        else
            log_warning "Chatroom monitor may have failed to start, check logs/monitor_$TIMESTAMP.log"
        fi
    fi

    # Check dependencies
    log_info "Checking dependencies..."
    command -v git >/dev/null 2>&1 && log_success "git: $(git --version | head -1)" || log_error "git not found"
    command -v node >/dev/null 2>&1 && log_success "node: $(node --version)" || log_error "node not found"
    command -v python >/dev/null 2>&1 && log_success "python: $(python --version)" || log_error "python not found"
    command -v claude >/dev/null 2>&1 && log_success "claude: installed" || log_error "claude not found"

    echo ""
    log_stage "GIT SYNC"

    # Ensure we are on main
    log_info "Switching to main branch..."
    git checkout main 2>&1 || log_warning "Already on main"

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        log_warning "Uncommitted changes detected on main branch"
        log_info "Committing local changes before pull..."
        git add -A
        git commit -m "chore: Auto-commit before pull (worker $TIMESTAMP)" 2>&1 || echo "Nothing to commit"
    fi

    # Pull latest changes
    log_info "Pulling latest from main..."
    PULL_START=$(date +%s)
    if ! git fetch origin && git reset --hard origin/main origin main 2>&1; then
        log_error "Pull failed - likely merge conflict"
        log_info "Invoking Claude to resolve merge conflicts..."

        # Create conflict resolution task
        cat > /tmp/conflict_resolution_$TIMESTAMP.txt << "CONFLICT_EOF"
There is a merge conflict when pulling from main. Please:
1. Review the conflicts using git status and git diff
2. Resolve all conflicts appropriately
3. Stage the resolved files with git add
4. Complete the merge with git commit
5. Verify the merge was successful

Do NOT use git stash - resolve conflicts properly by editing files.
CONFLICT_EOF

        # Note: Claude Code is Node.js/TypeScript, doesn't need Python .venv
        claude --model sonnet --dangerously-skip-permissions < /tmp/conflict_resolution_$TIMESTAMP.txt 2>&1
        rm -f /tmp/conflict_resolution_$TIMESTAMP.txt

        log_success "Conflicts resolved, continuing..."
    else
        PULL_END=$(date +%s)
        log_success "Pull successful ($(($PULL_END - $PULL_START))s)"
    fi

    # Get current commit
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    log_metric "Current commit: $CURRENT_COMMIT"

    # Create work branch
    log_info "Creating branch: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME" 2>&1
    log_success "Branch created"

    echo ""
    log_stage "MESSAGE CHECK"

    # Check for pending messages/mentions in coordination channels
    # This ensures agents respond to @mentions before starting autonomous work
    log_info "Checking for pending messages in coordination channels..."

    # Source environment for Matrix tokens
    if [ -f ~/.superalignment-env ]; then
        source ~/.superalignment-env
    fi

    COORDINATION_ROOM="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"
    HAS_MENTIONS=0

    # Check if there are any recent messages mentioning "autonomous-worker" or general alerts
    if [ -n "$MATRIX_TOKEN_ORCHESTRATOR" ]; then
        RECENT_MESSAGES=$(curl -s -X GET \
            "https://matrix.themultiverse.school/_matrix/client/v3/rooms/${COORDINATION_ROOM}/messages?dir=b&limit=5" \
            -H "Authorization: Bearer ${MATRIX_TOKEN_ORCHESTRATOR}" 2>/dev/null || echo "")

        if echo "$RECENT_MESSAGES" | grep -qi "autonomous-worker\|@worker\|URGENT"; then
            HAS_MENTIONS=1
            log_warning "Found potential mentions or urgent messages in coordination channel"
            log_info "These should be handled by agent monitors, continuing with scheduled work"
        else
            log_success "No urgent messages found"
        fi
    else
        log_warning "Matrix token not found, skipping message check"
    fi

    echo ""
    log_stage "ENVIRONMENT SETUP"

    # Note: Autonomous worker uses TypeScript/Node.js (Claude Code, npx tsx)
    # Python .venv only needed for optional RAG servers (pdf-rag-server.py, etc.)
    # Not required for core autonomous worker functionality
    log_info "Environment ready (Node.js/TypeScript)"

    # Verify Claude Code installation
    CLAUDE_VERSION=$(claude --version 2>&1 || echo "unknown")
    log_metric "Claude Code version: $CLAUDE_VERSION"

    echo ""
    log_stage "CLAUDE CODE EXECUTION"

    # Get current API usage statistics
    log_info "Fetching current API usage..."
    if [ -f "$PROJECT_DIR/scripts/get-claude-usage.sh" ]; then
        USAGE_STATS=$("$PROJECT_DIR/scripts/get-claude-usage.sh" 2>&1 | grep "^SESSION\|^WEEK\|^OPUS")
        eval "$USAGE_STATS"
        log_metric "API Usage - Session: ${SESSION_USAGE_PCT}%, Week: ${WEEK_USAGE_PCT}%, Opus: ${OPUS_USAGE_PCT}%"
    else
        log_warning "Usage script not found, using default conservative guidance"
        SESSION_USAGE_PCT=50
        WEEK_USAGE_PCT=50
        OPUS_USAGE_PCT=0
    fi

    # Create comprehensive task prompt
    log_info "Preparing orchestrator task..."
    cat > /tmp/claude_task_$TIMESTAMP.txt << TASK_EOF
## API Usage Context

Current subscription usage (checked before this session started):
- **Session**: ${SESSION_USAGE_PCT}% used (few million tokens, exact limit varies by model - likely 30-50M tokens)
- **Week**: ${WEEK_USAGE_PCT}% used (resets Nov 10, 3pm Pacific)
- **Opus**: ${OPUS_USAGE_PCT}% used

**Work Philosophy: Always Be Shipping 🚢**

Work through the ENTIRE roadmap systematically:
1. CRITICAL items
2. HIGH items
3. MEDIUM items
4. LOW items
5. FALLBACK WORKFLOWS (reviews, cleanup, analysis)

**Never stop.** There's always something productive to do.

**Exhaust all available tokens clearing the backlog. If roadmap is empty, do maintenance. If maintenance is done, create new plans.**

Read plans/MASTER_IMPLEMENTATION_ROADMAP.md and identify work to do.

## STEP 0: Post Research Requests (ALWAYS DO THIS FIRST)

Before starting any other work, post research requests to the research channel so research can run in parallel:

1. Read plans/MASTER_IMPLEMENTATION_ROADMAP.md
2. Identify CRITICAL/HIGH priority items that need research
3. Use mcp__chatroom__chatroom_post to post research requests to the "research" channel:
   - agent: "autonomous-worker"
   - status: "RESEARCH_REQUEST"
   - channel: "research"
   - message: List specific research needs (papers, parameters, mechanisms)
4. Continue immediately with implementation work below (research will happen in parallel)

Example research request message format:
"Research needed for [FEATURE NAME]:
- Latest peer-reviewed sources (2024-2025) on [TOPIC]
- Parameter values and justification for [SPECIFIC PARAMETERS]
- Mechanism description for [SYSTEM]
- Contradictory evidence or alternative approaches"

## PRIMARY WORKFLOW: Roadmap Implementation

Work through ALL roadmap items systematically (CRITICAL → HIGH → MEDIUM → LOW):

Use the orchestrator agent to coordinate the full workflow:

**Prioritization:**
1. CRITICAL items first (always)
2. Then HIGH items
3. Then MEDIUM items
4. Then LOW items
5. Work through entire backlog - do not stop at high priority

**Goal: Exhaust all available work, using all available tokens to clear the backlog.**
1. Research & Validation (Quality Gate 1): super-alignment-researcher + research-skeptic review
2. Implementation & Testing: feature-implementer + test writers + Monte Carlo validation
3. Architecture Review (Quality Gate 2): architecture-skeptic review (MUST address CRITICAL/HIGH issues)
4. Documentation & Archival: wiki-documentation-updater + architect
5. Senior Dev Review: Run final quality check on completed work

Commit all completed work to the current branch.

## FALLBACK WORKFLOWS: If roadmap is complete or no CRITICAL/HIGH items

Execute these maintenance tasks in order:

### 0. Coffee Break ☕ (ALWAYS DO THIS FIRST IN FALLBACK MODE)

When there's no explicit work queued:
1. Check git status and recent commits (what did others do?)
2. Pull latest from origin/main and integrate any changes
3. Read the implementation and coordination channels for any messages
4. Identify what's been accomplished vs what's pending
5. Post a status update to coordination channel with your assessment

This "coffee" period is for reflection and integration, not just polling.

### 1. Architecture Integration Review
Use architecture-skeptic to:
- Scan recent commits (last 30 days) for integration issues
- Check for missing cross-system connections
- Identify state propagation problems
- Flag performance bottlenecks or O(n²) issues
- Review for complexity creep

### 2. Research Source Validation
Use super-alignment-researcher + research-skeptic to:
- Audit research/ directory for outdated sources (>1 year old)
- Cross-check parameter citations in simulation code
- Find contradictory evidence for key assumptions
- Validate Monte Carlo parameters against latest research

### 3. Research Debate Session
Spawn research-skeptic and super-alignment-researcher to debate:
- Current simulation assumptions
- Roadmap priorities (are we working on the right things?)
- Parameter calibration (are values research-backed?)
- Missing critical systems (what are we not modeling?)
- Save debate summary to reviews/ directory

### 4. Roadmap Gardening
Use architect agent to:
- Clean up completed items in roadmap
- Archive finished tasks to plans/completed/
- Update priority levels based on recent learnings
- Cross-reference roadmap with git history
- Ensure roadmap reflects current state
- Remove stale/outdated items

### 5. Documentation Sync
Use wiki-documentation-updater to:
- Check if docs/wiki/README.md reflects recent changes
- Update system documentation for new features
- Ensure all simulation mechanics are documented
- Cross-reference code comments with wiki

### 6. Come Up With Plans 📋

If all maintenance is done and roadmap is empty:
1. Run the daily architecture review (architecture-skeptic)
2. Run underdocumented code audit (check docs/underdocumented.json)
3. Review Monte Carlo results for anomalies
4. Identify potential new features or improvements
5. Create plan files in plans/ directory for future work:
   - plans/proposed_[feature]_[date].md
   - Include: Problem statement, proposed solution, research needed, effort estimate
6. Post plan summaries to coordination channel for team review

**Goal:** Never be truly idle - always generating value through planning if execution is blocked.

Commit all improvements to the current branch with descriptive messages.
TASK_EOF

    log_success "Task prompt created"

    # Run Claude Code with timeout
    log_info "Starting Claude Code (45-minute timeout)..."
    CLAUDE_START=$(date +%s)

    # Run with timeout and capture exit code
    set +e
    timeout 2700 claude --model sonnet --dangerously-skip-permissions < /tmp/claude_task_$TIMESTAMP.txt 2>&1
    CLAUDE_EXIT=$?
    set -e

    CLAUDE_END=$(date +%s)
    CLAUDE_DURATION=$((CLAUDE_END - CLAUDE_START))

    if [ $CLAUDE_EXIT -eq 124 ]; then
        log_warning "Claude execution timed out after ${CLAUDE_DURATION}s"

        # POST-TIMEOUT CLEANUP: Commit partial work
        log_info "Running post-timeout cleanup to commit partial work..."
        cat > /tmp/cleanup_task_$TIMESTAMP.txt << "CLEANUP_EOF"
You are cleaning up after a timeout. Review the current branch and commit any valuable partial work.

Your task:
1. Run `git status` to see what changed
2. Review the changes using `git diff` (focus on simulation code changes)
3. If there are valuable changes (bug fixes, improvements, completed work):
   - Stage them with `git add`
   - Write a descriptive commit message explaining what was accomplished before timeout
   - Commit with a message like: "WIP: [description] (timeout cleanup)"
4. If changes are incomplete/broken:
   - Either revert them OR
   - Commit with clear "WIP: INCOMPLETE" prefix so they can be reviewed later
5. Report what you committed and why

Be concise - you have limited time. Focus on preserving work, not perfecting it.
CLEANUP_EOF

        set +e
        timeout 300 claude --model sonnet --dangerously-skip-permissions < /tmp/cleanup_task_$TIMESTAMP.txt 2>&1
        CLEANUP_EXIT=$?
        set -e
        rm -f /tmp/cleanup_task_$TIMESTAMP.txt

        if [ $CLEANUP_EXIT -eq 0 ]; then
            log_success "Post-timeout cleanup completed"
        else
            log_warning "Post-timeout cleanup failed or timed out (${CLEANUP_EXIT})"
        fi

        # Create GitHub issue for timeout
        if command -v gh >/dev/null 2>&1; then
            gh issue create \
                --title "🚨 Autonomous Worker Timeout - $TIMESTAMP" \
                --body "**Run:** $TIMESTAMP
**Duration:** ${CLAUDE_DURATION}s (timeout at 2700s)
**Branch:** \`$BRANCH_NAME\`
**Exit Code:** 124 (timeout)
**Cleanup:** $([ $CLEANUP_EXIT -eq 0 ] && echo "✅ Completed" || echo "⚠️ Failed ($CLEANUP_EXIT)")

**Log:** \`logs/autonomous/worker_${TIMESTAMP}.log\`

Claude Code execution timed out after 45 minutes. Post-timeout cleanup $([ $CLEANUP_EXIT -eq 0 ] && echo "successfully committed partial work" || echo "attempted to save work"). Check logs for details.

🤖 Auto-generated by autonomous worker" \
                --label "autonomous-worker,timeout" 2>&1 || log_warning "Failed to create GitHub issue"
        fi
    # Check for token exhaustion (Claude Max subscription limit)
    elif grep -qi "rate.*limit\|quota.*exceeded\|insufficient.*credits\|usage.*limit" <<< "$OUTPUT" 2>/dev/null; then
        log_error "⚠️  TOKEN EXHAUSTION DETECTED - Claude Max usage limit reached"
        if command -v gh >/dev/null 2>&1; then
            gh issue create \
                --title "🚨 TOKEN EXHAUSTION - Switch Claude Max Account" \
                --body "**Run:** $TIMESTAMP
**Duration:** ${CLAUDE_DURATION}s
**Branch:** `$BRANCH_NAME`

**🔴 CLAUDE MAX SUBSCRIPTION EXHAUSTED**

The autonomous worker has run out of tokens on the current Claude Max subscription.

**Action Required (Manual Login):**
1. SSH to VM: `gcloud compute ssh claude-workspace --zone=europe-west10-a`
2. Log out of current Claude Code session
3. Log in with backup Claude Max account
4. Verify cron jobs still configured: `crontab -l`

**Current Status:**
- Worker: PAUSED (will retry next hour)
- Researcher: PAUSED (will retry next hour)
- Merge orchestrator: Still operational

**Log:** `logs/autonomous/worker_${TIMESTAMP}.log`

🤖 Auto-generated by autonomous worker" \
                --label "autonomous-worker,token-exhaustion,urgent" 2>&1 || log_warning "Failed to create GitHub issue"
        fi
    elif [ $CLAUDE_EXIT -eq 0 ]; then
        log_success "Claude execution completed (${CLAUDE_DURATION}s)"
    else
        log_error "Claude execution failed with exit code $CLAUDE_EXIT"
        # Create GitHub issue for failure
        if command -v gh >/dev/null 2>&1; then
            gh issue create \
                --title "🚨 Autonomous Worker Failed - $TIMESTAMP" \
                --body "**Run:** $TIMESTAMP
**Duration:** ${CLAUDE_DURATION}s
**Branch:** \`$BRANCH_NAME\`
**Exit Code:** $CLAUDE_EXIT

**Log:** \`logs/autonomous/worker_${TIMESTAMP}.log\`

Claude Code execution failed with non-zero exit code. Check logs for error details.

🤖 Auto-generated by autonomous worker" \
                --label "autonomous-worker,failure" 2>&1 || log_warning "Failed to create GitHub issue"
        fi
    fi

    # Cleanup
    rm -f /tmp/claude_task_$TIMESTAMP.txt

    echo ""
    log_stage "GIT OPERATIONS"

    # Check what changed
    CHANGED_FILES=$(git status --short | wc -l)
    log_metric "Changed files: $CHANGED_FILES"

    if [ $CHANGED_FILES -gt 0 ]; then
        log_info "Changes detected, showing summary..."
        git status --short | head -20
        if [ $CHANGED_FILES -gt 20 ]; then
            log_info "... and $((CHANGED_FILES - 20)) more files"
        fi
    fi

    # Commit worker log
    log_info "Committing worker log to branch..."
    git add "$LOG_FILE" 2>&1 || log_warning "Log file not staged"
    git add "$METRICS_FILE" 2>&1 || log_warning "Metrics file not staged"
    git commit -m "chore: Add autonomous worker log and metrics ($TIMESTAMP)" 2>&1 || log_warning "No log to commit"

    # Count commits in this session
    COMMITS_MADE=$(git rev-list --count main..HEAD 2>/dev/null || echo "0")
    log_metric "Commits made: $COMMITS_MADE"

    # Push branch to remote
    log_info "Pushing branch to remote..."
    PUSH_START=$(date +%s)
    PUSH_SUCCESS=false
    if git push -u origin "$BRANCH_NAME" 2>&1; then
        PUSH_END=$(date +%s)
        log_success "Push successful ($(($PUSH_END - $PUSH_START))s)"
        PUSH_SUCCESS=true
    else
        log_warning "Push failed or no changes to push"
    fi

    # Create pull request if push succeeded and commits were made
    if [ "$PUSH_SUCCESS" = true ] && [ "$COMMITS_MADE" -gt 0 ]; then
        log_info "Creating pull request..."

        # Calculate duration for PR body
        PR_CREATION_TIME=$(date +%s)
        PR_TOTAL_DURATION=$((PR_CREATION_TIME - START_TIME))
        PR_CLAUDE_DURATION=${CLAUDE_DURATION:-0}

        # Generate PR title and body
        FIRST_COMMIT_MSG=$(git log main..HEAD --oneline | tail -1 | cut -d' ' -f2-)
        PR_TITLE="[Autonomous] $FIRST_COMMIT_MSG"

        # Create detailed PR body
        PR_BODY=$(cat <<PRBODY
## 🤖 Autonomous Worker Run

**Run:** $TIMESTAMP
**Branch:** \`$BRANCH_NAME\`
**Duration:** $(($PR_TOTAL_DURATION / 60))m $(($PR_TOTAL_DURATION % 60))s
**Claude Time:** $(($PR_CLAUDE_DURATION / 60))m $(($PR_CLAUDE_DURATION % 60))s

### Changes

- **Files Changed:** $CHANGED_FILES
- **Commits:** $COMMITS_MADE

### Commit History

\`\`\`
$(git log main..HEAD --oneline)
\`\`\`

### Metrics

- **Memory Used:** $FINAL_MEM
- **Disk Used:** $FINAL_DISK
- **Exit Code:** $CLAUDE_EXIT

### Log Files

- Worker log: \`logs/autonomous/worker_${TIMESTAMP}.log\`
- Metrics: \`logs/autonomous/metrics_${TIMESTAMP}.json\`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code) - Autonomous Worker
PRBODY
)

        # Create PR using gh CLI
        set +e
        if command -v gh >/dev/null 2>&1; then
            if gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base main --head "$BRANCH_NAME" 2>&1; then
                log_success "Pull request created"
                PR_CREATED=true
            else
                log_warning "PR creation failed - may need gh auth or PR already exists"
                PR_CREATED=false
            fi
        else
            log_warning "gh CLI not installed - skipping PR creation"
            PR_CREATED=false
        fi
        set -e
    else
        log_info "Skipping PR creation (no changes to push)"
        PR_CREATED=false
    fi

    # Return to main branch
    log_info "Returning to main branch..."
    git checkout main 2>&1

    echo ""
    log_stage "METRICS COLLECTION"

    # Calculate final metrics
    END_TIME=$(date +%s)
    TOTAL_DURATION=$((END_TIME - START_TIME))

    # Get final resource usage
    FINAL_MEM=$(free -h | awk 'NR==2 {print $3}')
    FINAL_DISK=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $3}')

    log_metric "Total runtime: ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60))m $(($TOTAL_DURATION % 60))s)"
    log_metric "Memory used: $FINAL_MEM"
    log_metric "Disk used: $FINAL_DISK"

    # Write JSON metrics
    cat > "$METRICS_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "branch": "$BRANCH_NAME",
  "commit": "$CURRENT_COMMIT",
  "duration_seconds": $TOTAL_DURATION,
  "claude_duration_seconds": $CLAUDE_DURATION,
  "claude_exit_code": $CLAUDE_EXIT,
  "changed_files": $CHANGED_FILES,
  "commits_made": $COMMITS_MADE,
  "pr_created": $([ "$PR_CREATED" = true ] && echo "true" || echo "false"),
  "memory_used": "$FINAL_MEM",
  "disk_used": "$FINAL_DISK"
}
EOF

    log_success "Metrics saved to $METRICS_FILE"

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            ✅ WORKER CYCLE COMPLETE                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📋 Branch created: ${BRANCH_NAME}${NC}"
    echo -e "${CYAN}📄 Log saved: ${LOG_FILE}${NC}"
    echo -e "${CYAN}📊 Metrics saved: ${METRICS_FILE}${NC}"
    echo -e "${CYAN}⏱️  Runtime: ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60))m $(($TOTAL_DURATION % 60))s)${NC}"
    echo -e "${CYAN}💡 Review and merge via GitHub when ready${NC}"
    echo ""

    # Clear status file
    rm -f "$STATUS_FILE"

} 2>&1 | tee -a "$LOG_FILE"
