#!/bin/bash
set -e

PROJECT_DIR="/home/user/ai_game_theory_simulation"

# Source .env file to get API key
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

LOG_DIR="$PROJECT_DIR/logs/research"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/research_$TIMESTAMP.log"
METRICS_FILE="$LOG_DIR/metrics_$TIMESTAMP.json"
STATUS_FILE="$LOG_DIR/status_current.txt"
BRANCH_NAME="auto/research-$TIMESTAMP"

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
    echo -e "${GREEN}║       🔬 RESEARCH AGENT - $TIMESTAMP         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Health checks
    log_stage "PRE-FLIGHT CHECKS"

    # Check Claude Code CLI
    if ! command -v claude >/dev/null 2>&1; then
        log_error "Claude Code CLI not found!"
        log_info "Install: curl -fsSL https://claude.ai/install.sh | sh"
        exit 1
    fi
    CLAUDE_VERSION=$(claude --version 2>&1 | head -1)
    log_success "Claude Code CLI available: $CLAUDE_VERSION"

    # Check disk space
    DISK_AVAIL=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    log_metric "Disk available: $DISK_AVAIL"

    # Check memory
    MEM_AVAIL=$(free -h | awk 'NR==2 {print $7}')
    log_metric "Memory available: $MEM_AVAIL"

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
        git commit -m "chore: Auto-commit before pull (research agent $TIMESTAMP)" 2>&1 || echo "Nothing to commit"
    fi

    # Pull latest changes
    log_info "Pulling latest from main..."
    PULL_START=$(date +%s)
    if ! git pull origin main 2>&1; then
        log_error "Pull failed - likely merge conflict"
        exit 1
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
    log_stage "RESEARCH TASK EXECUTION"

    # Create research task prompt
    log_info "Preparing research task..."
    cat > /tmp/research_task_$TIMESTAMP.txt << TASK_EOF
## Research Agent - Hourly Execution

You are the research agent, running autonomously on an hourly schedule. Your job is to systematically work through the research roadmap.

**Primary Task: Work Through Research Roadmap**

1. **Read the research roadmap:**
   - Open \`research/RESEARCH_ROADMAP.md\`
   - Identify the highest priority research tasks (Priority 1 first, then Priority 2, etc.)
   - Look for tasks marked as "Not Started" or "In Progress"

2. **Select ONE research task to complete this hour:**
   - Choose the highest-priority unfinished task
   - Focus on a single task that can be completed within 30-45 minutes
   - Prioritize tasks that block implementation work

3. **Execute the research workflow:**
   - Use \`super-alignment-researcher\` agent to find peer-reviewed sources (2024-2025)
   - Use \`research-skeptic\` agent to validate findings and find contradictory evidence
   - Extract specific parameters, mechanisms, and justifications
   - Save comprehensive research document to \`research/[topic]_$(date +%Y%m%d).md\`
   - Include: sources, parameters, mechanisms, interactions, timelines, failure modes

4. **Update the roadmap:**
   - Mark the completed task as "Completed" in \`research/RESEARCH_ROADMAP.md\`
   - Add completion date and link to research document
   - Identify any new research tasks discovered during investigation

5. **Commit the work:**
   - Stage all new research documents and roadmap updates
   - Create a descriptive commit message
   - Push to the branch

**Post to research channel:**
- Use \`mcp__chatroom__chatroom_post\` to announce completion:
  - channel: "research"
  - agent: "research-agent"
  - status: "COMPLETED"
  - message: Summary of research completed and key findings

**If no research tasks available:**
- Review existing research documents in \`research/\` for outdated sources
- Update any papers >1 year old with latest research
- Post to research channel asking for new research priorities

**Token Budget: 30-45 minutes of work**
Focus on ONE complete research task per run. Better to finish one task fully than to start multiple tasks.
TASK_EOF

    log_success "Task prompt created"

    # Run Claude Code with timeout
    log_info "Starting Claude Code (45-minute timeout)..."
    CLAUDE_START=$(date +%s)

    # Run with timeout and capture exit code
    set +e
    timeout 2700 claude --model sonnet --dangerously-skip-permissions < /tmp/research_task_$TIMESTAMP.txt 2>&1
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
2. Review the changes using `git diff`
3. If there are valuable changes (research documents, roadmap updates):
   - Stage them with `git add`
   - Commit with message: "WIP: [description] (timeout cleanup)"
4. Report what you committed

Be concise - you have limited time.
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

    elif [ $CLAUDE_EXIT -eq 0 ]; then
        log_success "Claude execution completed (${CLAUDE_DURATION}s)"
    else
        log_error "Claude execution failed with exit code $CLAUDE_EXIT"
    fi

    # Cleanup
    rm -f /tmp/research_task_$TIMESTAMP.txt

    echo ""
    log_stage "GIT OPERATIONS"

    # Check what changed
    CHANGED_FILES=$(git status --short | wc -l)
    log_metric "Changed files: $CHANGED_FILES"

    if [ $CHANGED_FILES -gt 0 ]; then
        log_info "Changes detected, showing summary..."
        git status --short
    fi

    # Commit research agent log
    log_info "Committing research agent log to branch..."
    git add "$LOG_FILE" 2>&1 || log_warning "Log file not staged"
    git add "$METRICS_FILE" 2>&1 || log_warning "Metrics file not staged"
    git commit -m "chore: Add research agent log and metrics ($TIMESTAMP)" 2>&1 || log_warning "No log to commit"

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

        # Generate PR title and body
        FIRST_COMMIT_MSG=$(git log main..HEAD --oneline | tail -1 | cut -d' ' -f2-)
        PR_TITLE="[Research] $FIRST_COMMIT_MSG"

        # Create detailed PR body
        PR_BODY=$(cat <<PRBODY
## 🔬 Research Agent Run

**Run:** $TIMESTAMP
**Branch:** \`$BRANCH_NAME\`
**Duration:** $(($TOTAL_DURATION / 60))m $(($TOTAL_DURATION % 60))s
**Claude Time:** $(($CLAUDE_DURATION / 60))m $(($CLAUDE_DURATION % 60))s

### Changes

- **Files Changed:** $CHANGED_FILES
- **Commits:** $COMMITS_MADE

### Commit History

\`\`\`
$(git log main..HEAD --oneline)
\`\`\`

### Log Files

- Research log: \`logs/research/research_${TIMESTAMP}.log\`
- Metrics: \`logs/research/metrics_${TIMESTAMP}.json\`

---

🔬 Generated with [Claude Code](https://claude.com/claude-code) - Research Agent
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
    echo -e "${GREEN}║         ✅ RESEARCH CYCLE COMPLETE                   ║${NC}"
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
