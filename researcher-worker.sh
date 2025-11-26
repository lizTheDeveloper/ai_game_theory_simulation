#!/bin/bash
set -e

# Ensure PATH includes claude (needed for cron execution)
export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"

# Get the actual project directory where this script lives
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Lock file to prevent concurrent runs
LOCK_FILE="$PROJECT_DIR/.researcher-worker.lock"

# Check for existing lock
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    # Check if process is still running
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "⚠️  Another researcher is running (PID: $LOCK_PID). Exiting."
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

LOG_DIR="$PROJECT_DIR/logs/autonomous/researcher"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/researcher_$TIMESTAMP.log"
STATUS_FILE="$LOG_DIR/status_current.txt"
BRANCH_NAME="auto/researcher-$TIMESTAMP"

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
    echo -e "${GREEN}║      🔬 AUTONOMOUS RESEARCHER - $TIMESTAMP       ║${NC}"
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
    log_info "Using authenticated Claude Code session (no API key needed)"

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
    command -v claude >/dev/null 2>&1 && log_success "claude: installed" || log_error "claude not found"

    echo ""
    log_stage "RESEARCH AUDIT"

    # Run research age audit to check what needs updating
    log_info "Running research age audit..."
    if npm run audit:research > /tmp/research_audit_$TIMESTAMP.txt 2>&1; then
        log_success "Research audit complete"

        # Extract metrics
        CRITICAL_COUNT=$(grep "🚨 CRITICAL:" /tmp/research_audit_$TIMESTAMP.txt | sed 's/.*CRITICAL: \([0-9]*\).*/\1/' || echo "0")
        HIGH_COUNT=$(grep "⚠️  HIGH:" /tmp/research_audit_$TIMESTAMP.txt | sed 's/.*HIGH: \([0-9]*\).*/\1/' || echo "0")

        log_metric "CRITICAL items: $CRITICAL_COUNT"
        log_metric "HIGH priority items: $HIGH_COUNT"
    else
        log_warning "Research audit failed, continuing with roadmap anyway..."
        CRITICAL_COUNT="unknown"
        HIGH_COUNT="unknown"
    fi

    # NOTE: Removed early exit - we always check roadmap for pending work
    log_info "Checking roadmap for pending items..."

    echo ""
    log_stage "GIT SYNC"

    # Ensure we are on main
    log_info "Switching to main branch..."
    # Stash any uncommitted changes before switching
    git stash --include-untracked 2>&1 || true
    git checkout main 2>&1 || log_warning "Already on main"
    # Restore stashed changes
    git stash pop 2>&1 || true

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        log_warning "Uncommitted changes detected on main branch"
        log_info "Committing local changes before pull..."
        git add -A
        git commit -m "chore: Auto-commit before pull (researcher $TIMESTAMP)" 2>&1 || echo "Nothing to commit"
    fi

    # Pull latest changes
    log_info "Pulling latest from main..."
    PULL_OUTPUT=$(git pull origin main 2>&1) || PULL_FAILED=$?

    if [ -n "$PULL_FAILED" ]; then
        # Check if it's a network error or merge conflict
        if echo "$PULL_OUTPUT" | grep -q "Could not resolve hostname\|Connection refused\|Network is unreachable"; then
            log_error "Pull failed due to network error"
            log_warning "Skipping this run - will retry next time"
            echo "NETWORK_ERROR" > "$STATUS_FILE"
            exit 0
        elif echo "$PULL_OUTPUT" | grep -q "CONFLICT\|Merge conflict"; then
            log_error "Pull failed - merge conflict detected"
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

            claude --dangerously-skip-permissions < /tmp/conflict_resolution_$TIMESTAMP.txt 2>&1
            rm -f /tmp/conflict_resolution_$TIMESTAMP.txt

            log_success "Conflicts resolved, continuing..."
        else
            log_error "Pull failed with unknown error:"
            echo "$PULL_OUTPUT"
            exit 1
        fi
    else
        echo "$PULL_OUTPUT"
    fi

    # Get current commit
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    log_metric "Current commit: $CURRENT_COMMIT"

    # Create work branch
    log_info "Creating branch: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME" 2>&1
    log_success "Branch created"

    echo ""
    log_stage "RESEARCH UPDATE TASK"

    # Create research update task prompt
    log_info "Preparing research update task..."
    cat > /tmp/researcher_task_$TIMESTAMP.txt << TASK_EOF
## Autonomous Researcher Task

You are the autonomous research worker. Your mission is to keep the simulation's research foundation current and implement roadmap items.

### Current Research Status

- **CRITICAL items**: $CRITICAL_COUNT (>5yr old + used in simulation)
- **HIGH priority items**: $HIGH_COUNT (>5yr unused OR >3yr used)
- **Research audit**: Available in \`research/UPDATE_QUEUE.md\`
- **Roadmap**: Available in \`plans/roadmap-audit-validated-research-20251103.md\`

### Your Task - Priority Order

**1. Check Matrix \`research\` channel first:**
   - Use mcp__chatroom__chatroom_read_new to check for research questions from Sylvia or Cynthia
   - If there are questions, prioritize answering those
   - Post findings back using mcp__chatroom__chatroom_post

**2. Work through the roadmap systematically:**
   - Review \`plans/roadmap-audit-validated-research-20251103.md\`
   - Work on items in priority order: HIGH → MEDIUM → LOW
   - **Do NOT skip items marked as "done" - review and update them**
   - For each roadmap item:
     - Check current implementation status
     - Update research with 2024-2025 sources if needed
     - Verify parameters against latest literature
     - Document any changes or confirmations

**3. If roadmap is complete, update aging research:**
   - Review \`research/UPDATE_QUEUE.md\` for outdated sources
   - Prioritize: CRITICAL → HIGH → MEDIUM
   - Update 1-3 files with current peer-reviewed sources

### Research Quality Standards

- 2+ peer-reviewed sources (2024-2025 preferred)
- Parameter justification (why this value?)
- Document source quality (journal impact, study methodology)
- Update frontmatter (oldest_source, newest_source, last_verified)
- Link to Zotero if available

### Output Requirements

1. Work through ALL roadmap items at your priority level
2. Update research files with current sources
3. Commit changes with descriptive messages
4. Create PR to main with summary of work
5. Post completion notice to \`research\` Matrix channel

### Time Budget

- Aim for 30-45 minute productive session
- Focus on thorough work over rushing
- Better to completely validate 1-2 roadmap items than partially do many

### If You Get Stuck

- Post questions to \`research\` channel for Sylvia/Cynthia
- Document partial progress in commit
- Flag issues for human review

### Matrix Channels

- **research**: Post findings, ask questions (use as @researcher)
- **coordination**: Post completion status when done

### Agent Identity

You are: **@researcher** (agent_id: "researcher")
Use this identity when posting to Matrix channels.

**Remember: Work through the ENTIRE roadmap at your priority level, even if items appear done. Verification and updates are continuous!**

Let's maintain research excellence! 🔬
TASK_EOF

    log_success "Task prompt created"

    # Run Claude Code with research update task
    log_info "Starting Claude Code researcher session (30-minute timeout)..."

    # Use 30-minute timeout for research tasks (less intensive than full implementation)
    if timeout 1800 claude --dangerously-skip-permissions < /tmp/researcher_task_$TIMESTAMP.txt 2>&1; then
        log_success "Claude Code session completed"
    else
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
            log_warning "Session timed out after 30 minutes (expected for complex research)"
        else
            log_error "Claude Code session failed with exit code $EXIT_CODE"
        fi
    fi

    rm -f /tmp/researcher_task_$TIMESTAMP.txt

    echo ""
    log_stage "GIT OPERATIONS"

    # Check if any changes were made
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        log_info "No changes made during session"
        log_info "Switching back to main and cleaning up..."
        # Stash any uncommitted log files before switching branches
        git stash --include-untracked 2>&1 || true
        git checkout main 2>&1
        git stash pop 2>&1 || true
        git branch -D "$BRANCH_NAME" 2>&1 || true
    else
        log_info "Changes detected, creating commit..."

        # Commit any changes
        git add -A
        git commit -m "chore: Autonomous researcher updates - $TIMESTAMP

Research updates performed by autonomous researcher.
See logs/autonomous/researcher/researcher_$TIMESTAMP.log for details.

🤖 Generated with Claude Code (Autonomous Researcher)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>&1

        # Push to remote
        log_info "Pushing branch to remote..."
        if git push -u origin "$BRANCH_NAME" 2>&1; then
            log_success "Branch pushed successfully"

            # Create PR if gh CLI is available
            if command -v gh >/dev/null 2>&1; then
                log_info "Creating pull request..."
                PR_BODY="## Autonomous Researcher Updates

**Timestamp**: $TIMESTAMP
**Branch**: \`$BRANCH_NAME\`

### Research Updates

This PR contains research updates performed by the autonomous researcher worker.

- CRITICAL items addressed: $CRITICAL_COUNT
- HIGH priority items addressed: $HIGH_COUNT

### Review Checklist

- [ ] Citations are from 2024-2025 peer-reviewed sources
- [ ] Parameters are justified with research backing
- [ ] Frontmatter updated (oldest_source, newest_source, last_verified)
- [ ] Changes documented clearly
- [ ] Roadmap items verified/updated

See \`research/UPDATE_QUEUE.md\` and \`plans/roadmap-audit-validated-research-20251103.md\` for current status.

🤖 Generated with Claude Code (Autonomous Researcher)
"

                if gh pr create --title "Research updates - $TIMESTAMP" --body "$PR_BODY" 2>&1; then
                    log_success "Pull request created"
                else
                    log_warning "Failed to create PR automatically - create manually"
                fi
            else
                log_warning "gh CLI not available - create PR manually"
            fi
        else
            log_warning "Failed to push branch - may need manual intervention"
        fi

        # Return to main
        log_info "Returning to main branch..."
        # Stash any uncommitted log files (from cron output) before switching
        git stash --include-untracked 2>&1 || true
        git checkout main 2>&1
        # Restore stashed log files
        git stash pop 2>&1 || true
    fi

    echo ""
    log_stage "COMPLETE"

    TOTAL_TIME=$(($(date +%s) - START_TIME))
    log_success "Researcher worker completed in ${TOTAL_TIME}s"

    # Write completion marker
    echo "COMPLETE - ${TOTAL_TIME}s" > "$STATUS_FILE"

} 2>&1 | tee "$LOG_FILE"

# Exit with success
exit 0
