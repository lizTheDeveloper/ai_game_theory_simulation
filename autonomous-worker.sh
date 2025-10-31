#!/bin/bash
set -e

PROJECT_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"

# Source .env file to get API key
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

# Export API key explicitly
export ANTHROPIC_API_KEY

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
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        log_error "ANTHROPIC_API_KEY not set!"
        exit 1
    fi
    log_success "API key loaded (${ANTHROPIC_API_KEY:0:15}...)"

    # Check disk space
    DISK_AVAIL=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    log_metric "Disk available: $DISK_AVAIL"

    # Check memory
    MEM_AVAIL=$(free -h | awk 'NR==2 {print $7}')
    log_metric "Memory available: $MEM_AVAIL"

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
    if ! git pull origin main 2>&1; then
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

        source .venv/bin/activate
        claude --dangerously-skip-permissions < /tmp/conflict_resolution_$TIMESTAMP.txt 2>&1
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
    log_stage "ENVIRONMENT SETUP"

    # Activate Python environment
    log_info "Activating Python virtual environment..."
    source .venv/bin/activate
    log_success "Virtual environment activated"

    # Verify Claude Code installation
    CLAUDE_VERSION=$(claude --version 2>&1 || echo "unknown")
    log_metric "Claude Code version: $CLAUDE_VERSION"

    echo ""
    log_stage "CLAUDE CODE EXECUTION"

    # Create comprehensive task prompt
    log_info "Preparing orchestrator task..."
    cat > /tmp/claude_task_$TIMESTAMP.txt << "TASK_EOF"
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

If there are CRITICAL or HIGH priority items not yet complete:

Use the orchestrator agent to coordinate the full workflow:
1. Research & Validation (Quality Gate 1): super-alignment-researcher + research-skeptic review
2. Implementation & Testing: feature-implementer + test writers + Monte Carlo validation
3. Architecture Review (Quality Gate 2): architecture-skeptic review (MUST address CRITICAL/HIGH issues)
4. Documentation & Archival: wiki-documentation-updater + architect
5. Senior Dev Review: Run final quality check on completed work

Commit all completed work to the current branch.

## FALLBACK WORKFLOWS: If roadmap is complete or no CRITICAL/HIGH items

Execute these maintenance tasks in order:

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

Commit all improvements to the current branch with descriptive messages.
TASK_EOF

    log_success "Task prompt created"

    # Run Claude Code with timeout
    log_info "Starting Claude Code (25-minute timeout)..."
    CLAUDE_START=$(date +%s)

    # Run with timeout and capture exit code
    set +e
    timeout 1500 claude --dangerously-skip-permissions < /tmp/claude_task_$TIMESTAMP.txt 2>&1
    CLAUDE_EXIT=$?
    set -e

    CLAUDE_END=$(date +%s)
    CLAUDE_DURATION=$((CLAUDE_END - CLAUDE_START))

    if [ $CLAUDE_EXIT -eq 124 ]; then
        log_warning "Claude execution timed out after ${CLAUDE_DURATION}s"
    elif [ $CLAUDE_EXIT -eq 0 ]; then
        log_success "Claude execution completed (${CLAUDE_DURATION}s)"
    else
        log_error "Claude execution failed with exit code $CLAUDE_EXIT"
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
    if git push -u origin "$BRANCH_NAME" 2>&1; then
        PUSH_END=$(date +%s)
        log_success "Push successful ($(($PUSH_END - $PUSH_START))s)"
    else
        log_warning "Push failed or no changes to push"
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
