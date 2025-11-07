#!/bin/bash
#
# Merge Orchestrator - Automated Branch Merging with Quality Gates
# Runs hourly via cron to process pending feature branches
#
# Usage: ./scripts/merge-orchestrator.sh [--dry-run] [--max-branches N]
#

set -eo pipefail  # Removed -u to allow unset variables with defaults

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs/merge_orchestrator"
LOCK_FILE="/tmp/merge-orchestrator.lock"

# Parse arguments
DRY_RUN=false
MAX_BRANCHES=10
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --max-branches)
      MAX_BRANCHES="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Environment detection
IS_VM=false
if [ -f "/etc/cloud/cloud.cfg" ] || [ -f "/.dockerenv" ]; then
  IS_VM=true
fi

# Configuration (can be overridden via environment variables)
SKIP_FRONTEND="${MERGE_ORCHESTRATOR_SKIP_FRONTEND:-$IS_VM}"
ENABLE_AGENT_REVIEWS="${MERGE_ORCHESTRATOR_ENABLE_AGENT_REVIEWS:-true}"  # Phase 2: Architecture-skeptic + Sylvia reviews
ENABLE_AUTO_REMEDIATION="${MERGE_ORCHESTRATOR_ENABLE_AUTO_REMEDIATION:-true}"  # Phase 2.5: Auto-fix CRITICAL issues
AGENT_REVIEW_HOUR="${MERGE_ORCHESTRATOR_AGENT_REVIEW_HOUR:-6}"  # Hour (UTC) to run Opus reviews (cost optimization)

# Time-based agent review gating (cost optimization)
# Only run expensive Opus reviews once per day at specified hour
CURRENT_HOUR=$(date +%H | sed 's/^0//')  # Remove leading zero
if [ "$ENABLE_AGENT_REVIEWS" = "true" ]; then
  if [ "$CURRENT_HOUR" -ne "$AGENT_REVIEW_HOUR" ]; then
    ENABLE_AGENT_REVIEWS="false"
    AGENT_REVIEWS_SKIPPED_REASON="outside daily review window (runs at ${AGENT_REVIEW_HOUR}:00 UTC)"
  else
    AGENT_REVIEWS_SKIPPED_REASON="in daily review window (${AGENT_REVIEW_HOUR}:00 UTC)"
  fi
fi

# ============================================
# Logging Setup
# ============================================

# Create log directory
mkdir -p "$LOG_DIR"

# Log file for this run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/merge_${TIMESTAMP}.log"

# Logging functions
log() {
  echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE"
}

log_section() {
  echo "" | tee -a "$LOG_FILE"
  echo "=== $* ===" | tee -a "$LOG_FILE"
}

# Check for concurrent runs
if [ -f "$LOCK_FILE" ]; then
  log "⚠️  Merge orchestrator already running (lock file exists)"
  exit 0
fi

# Create lock file
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# Change to project root
cd "$PROJECT_ROOT"

# Check for git index lock (indicates another git process is running)
if [ -f ".git/index.lock" ]; then
  log "⚠️  Git index locked - another git process is running"
  log "ℹ️  Skipping this run to avoid conflicts"
  exit 0
fi

log_section "Merge Orchestrator Started"
log "Timestamp: $(date)"
log "Dry run: $DRY_RUN"
log "Max branches: $MAX_BRANCHES"
log "Environment: $([ "$IS_VM" = "true" ] && echo "VM (backend only)" || echo "Local (all branches)")"

# Update from remote
log_section "Fetching Latest Changes"
git fetch origin 2>&1 | tee -a "$LOG_FILE" || {
  log "❌ Failed to fetch from origin"
  exit 1
}

# Clean working tree before processing branches
log_section "Ensuring Clean Working Tree"
if ! git diff --quiet || ! git diff --cached --quiet; then
  log "⚠️  Working tree has uncommitted changes"
  log "📦 Stashing changes to prevent checkout conflicts..."

  # Create a timestamped stash
  STASH_NAME="merge-orchestrator-autostash-${TIMESTAMP}"
  if git stash push -u -m "$STASH_NAME" 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Changes stashed as: $STASH_NAME"
    log "ℹ️  To recover: git stash list | grep '$STASH_NAME'"
  else
    log "❌ Failed to stash changes"
    log "⚠️  Manual cleanup required before merge orchestrator can run"
    exit 1
  fi
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  log "⚠️  Not on main branch (currently on: $CURRENT_BRANCH)"
  log "📍 Switching to main..."
  if git checkout main 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Switched to main"
  else
    log "❌ Failed to switch to main - manual intervention required"
    exit 1
  fi
fi

log "✅ Working tree clean and on main branch"

# Get list of remote branches (exclude main, HEAD)
log_section "Discovering Branches"
BRANCHES=$(git branch -r | grep -v "HEAD" | grep -v "/main$" | sed 's/origin\///' | sed 's/^[[:space:]]*//')
BRANCH_COUNT=$(echo "$BRANCHES" | wc -l | tr -d ' ')
log "Found $BRANCH_COUNT branches to process"

# Counters
PROCESSED=0
MERGED=0
SKIPPED=0
FAILED=0

# Process branches
for BRANCH in $BRANCHES; do
  # Limit number of branches processed per run
  if [ $PROCESSED -ge $MAX_BRANCHES ]; then
    log "⏸️  Reached max branches limit ($MAX_BRANCHES), stopping"
    break
  fi

  PROCESSED=$((PROCESSED + 1))

  log_section "Branch $PROCESSED/$BRANCH_COUNT: $BRANCH"

  # Check if branch exists
  if ! git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
    log "⚠️  Branch origin/$BRANCH not found, skipping"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Check if branch is frontend (skip on VM)
  if [ "$IS_VM" = "true" ]; then
    FRONTEND_CHANGES=$(git diff main...origin/$BRANCH --name-only 2>/dev/null | grep -E '^src/(lib|app|components)/|\.tsx$|\.css$' | wc -l | tr -d ' \n' || echo "0")
    if [ "${FRONTEND_CHANGES:-0}" -gt 0 ] 2>/dev/null; then
      log "⏭️  SKIPPING frontend branch on VM (has $FRONTEND_CHANGES frontend files)"
      log "   Handle this branch locally on Mac with Playwright"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
  fi

  # Create merge branch name
  MERGE_BRANCH="merge/${BRANCH}_${TIMESTAMP}"

  log "📝 Creating merge branch: $MERGE_BRANCH"

  if [ "$DRY_RUN" = "false" ]; then
    # Create and checkout merge branch
    git checkout -b "$MERGE_BRANCH" origin/main 2>&1 | tee -a "$LOG_FILE" || {
      log "❌ Failed to create merge branch"
      FAILED=$((FAILED + 1))
      continue
    }

    # Attempt merge
    log "🔀 Attempting merge from origin/$BRANCH"
    if git merge "origin/$BRANCH" --no-edit 2>&1 | tee -a "$LOG_FILE"; then
      log "✅ Merge successful (no conflicts)"

      # Run quality gates
      log "🚦 Running quality gates..."

      # Gate 1: TypeScript compilation
      log "  Gate 1/2: TypeScript compilation"
      if npx tsc --noEmit 2>&1 | tee -a "$LOG_FILE"; then
        log "    ✅ TypeScript passed"

        # Gate 2: Tests (skip frontend tests on VM)
        log "  Gate 2/2: Test suite"
        TEST_CMD="npm test"
        if [ "$IS_VM" = "true" ]; then
          TEST_CMD="npm run test:backend 2>/dev/null || npm test"
          log "    (Running backend tests only on VM)"
        fi

        if $TEST_CMD 2>&1 | tee -a "$LOG_FILE"; then
          log "    ✅ Tests passed"

          # All gates passed - merge to main
          log "🎉 All quality gates passed!"
          log "🔀 Merging to main..."

          git checkout main 2>&1 | tee -a "$LOG_FILE"
          git merge "$MERGE_BRANCH" --no-edit 2>&1 | tee -a "$LOG_FILE"
          git push origin main 2>&1 | tee -a "$LOG_FILE"

          log "✅ Successfully merged to main"

          # Clean up branches
          log "🗑️  Cleaning up branches..."
          git branch -D "$MERGE_BRANCH" 2>&1 | tee -a "$LOG_FILE"
          git push origin --delete "$BRANCH" 2>&1 | tee -a "$LOG_FILE" || log "⚠️  Could not delete remote branch (may be protected)"

          MERGED=$((MERGED + 1))
        else
          log "    ❌ Tests failed"
          log "🔧 AUTO-REMEDIATION: Spawning Claude Code to fix test failures..."

          git checkout main 2>&1 >> "$LOG_FILE"

          # Create remediation task file (sanitize branch name for filesystem)
          SAFE_BRANCH=$(echo "$BRANCH" | sed "s|[+ /]|_|g")
          REMEDIATION_TASK="$LOG_DIR/remediation_tests_${SAFE_BRANCH}_${TIMESTAMP}.md"
          cat > "$REMEDIATION_TASK" <<EOFT
# Test Failure Remediation Task

**Branch:** $BRANCH
**Merge Branch:** $MERGE_BRANCH
**Timestamp:** $(date)

## Problem
Merge succeeded but tests are failing. Branch cannot be merged to main until tests pass.

## Your Task
1. Checkout the merge branch: \`git checkout $MERGE_BRANCH\`
2. Run tests to identify failures: \`npm test\` (or \`npm run test:backend\` on VM)
3. Fix all test failures:
   - Review test output
   - Fix broken code or update tests if behavior intentionally changed
   - Ensure simulation logic is correct
4. Verify all tests pass
5. Commit fixes: \`git add . && git commit -m "fix: Resolve test failures"\`
6. If all tests pass:
   - Merge to main: \`git checkout main && git merge $MERGE_BRANCH --no-edit\`
   - Push: \`git push origin main\`
   - Delete worker branch: \`git push origin --delete $BRANCH\`
7. Document resolution in logs/merge_orchestrator/

## Context
- Tests must pass before merging to main
- Ensure no regressions introduced
- Log your decision-making process

**Timeout:** 15 minutes
EOFT

          log "📝 Remediation task created: $REMEDIATION_TASK"
          log "🤖 Launching Claude Code..."

          # Spawn Claude Code (timeout 15 minutes)
          timeout 900 claude-code --task-file "$REMEDIATION_TASK" >> "$LOG_FILE" 2>&1 || {
            SPAWN_EXIT=$?
            if [ $SPAWN_EXIT -eq 124 ]; then
              log "⏱️  Claude Code timed out (15 min)"
            else
              log "❌ Claude Code failed (exit code: $SPAWN_EXIT)"
            fi
          }

          log "📋 Merge branch preserved: $MERGE_BRANCH"
          FAILED=$((FAILED + 1))
        fi
      else
        log "    ❌ TypeScript compilation failed"
        log "🚫 Merge BLOCKED: TypeScript errors"
        log "📋 Merge branch preserved: $MERGE_BRANCH"
        FAILED=$((FAILED + 1))
        git checkout main 2>&1 >> "$LOG_FILE"
      fi
    else
      log "❌ Merge conflicts detected"
      log "🔧 AUTO-REMEDIATION: Spawning Claude Code to resolve conflicts..."

      # Don't abort yet - keep conflict state for Claude Code
      git checkout main 2>&1 >> "$LOG_FILE"

      # Create remediation task file (sanitize branch name for filesystem)
      SAFE_BRANCH=$(echo "$BRANCH" | sed "s|[+ /]|_|g")
      REMEDIATION_TASK="$LOG_DIR/remediation_${SAFE_BRANCH}_${TIMESTAMP}.md"
      cat > "$REMEDIATION_TASK" <<EOF
# Merge Conflict Remediation Task

**Branch:** $BRANCH
**Merge Branch:** $MERGE_BRANCH
**Timestamp:** $(date)

## Problem
Automatic merge from origin/$BRANCH into main resulted in conflicts.

## Your Task
1. Checkout the merge branch: \`git checkout $MERGE_BRANCH\`
2. Retry the merge: \`git merge origin/$BRANCH\`
3. Resolve all conflicts intelligently:
   - Review conflict markers
   - Preserve valuable changes from both sides where possible
   - Ensure simulation logic integrity
   - Test the resolution
4. Complete the merge: \`git add . && git commit\`
5. Run quality gates:
   - TypeScript: \`npx tsc --noEmit\`
   - Tests: \`npm test\` (or \`npm run test:backend\` on VM)
6. If all gates pass:
   - Merge to main: \`git checkout main && git merge $MERGE_BRANCH --no-edit\`
   - Push: \`git push origin main\`
   - Delete worker branch: \`git push origin --delete $BRANCH\`
7. Document resolution in logs/merge_orchestrator/

## Context
- Original branch may be stale (check commit date)
- Ensure no valuable work is discarded
- Log your decision-making process

**Timeout:** 15 minutes
EOF

      log "📝 Remediation task created: $REMEDIATION_TASK"
      log "🤖 Launching Claude Code..."

      # Spawn Claude Code (timeout 15 minutes)
      timeout 900 claude-code --task-file "$REMEDIATION_TASK" >> "$LOG_FILE" 2>&1 || {
        SPAWN_EXIT=$?
        if [ $SPAWN_EXIT -eq 124 ]; then
          log "⏱️  Claude Code timed out (15 min)"
        else
          log "❌ Claude Code failed (exit code: $SPAWN_EXIT)"
        fi
      }

      log "📋 Merge branch preserved: $MERGE_BRANCH"
      FAILED=$((FAILED + 1))
    fi
  else
    log "   (Dry run - skipping actual merge)"
  fi
done

# Summary
log_section "Summary"
log "Total branches found: $BRANCH_COUNT"
log "Branches processed: $PROCESSED"
log "✅ Successfully merged: $MERGED"
log "⏭️  Skipped (frontend on VM): $SKIPPED"
log "❌ Failed (conflicts/gates): $FAILED"
log ""
log "📊 Remaining branches: $((BRANCH_COUNT - PROCESSED))"
if [ $((BRANCH_COUNT - PROCESSED)) -gt 0 ]; then
  log "   (Will be processed in next run)"
fi

log_section "Merge Orchestrator Complete"
log "Full log: $LOG_FILE"

<<<<<<< HEAD
# Return success if at least one branch was merged
if [ $MERGED -gt 0 ]; then
  exit 0
else
  exit 0  # Still exit 0 so cron doesn't spam errors
fi
=======
  return 0
}

# ============================================
# Main Orchestrator
# ============================================

main() {
  log_section "🤖 Merge Orchestrator - ${TIMESTAMP}"
  log_info "Environment: $([ "$IS_VM" = "true" ] && echo "VM (backend only)" || echo "Mac (frontend + backend)")"
  log_info "Dry run: $DRY_RUN"
  log_info "Skip frontend: $SKIP_FRONTEND"
  log_info "Max branches: $MAX_BRANCHES"
  log_info "Current hour (UTC): ${CURRENT_HOUR}:00"
  if [ "$ENABLE_AGENT_REVIEWS" = "true" ]; then
    log_info "Agent reviews (Opus): ENABLED - $AGENT_REVIEWS_SKIPPED_REASON"
  else
    log_info "Agent reviews (Opus): DISABLED - $AGENT_REVIEWS_SKIPPED_REASON"
  fi
  log_info "Auto-remediation (Phase 2.5): $ENABLE_AUTO_REMEDIATION"

  # Acquire lock
  acquire_lock

  # Change to project root
  cd "$PROJECT_ROOT"

  # Discover branches
  log_info "Discovering feature branches..."
  BRANCHES=$(discover_branches)
  if [ $? -ne 0 ]; then
    log_info "No feature branches found - no work to do"
    exit 0
  fi

  # Count branches
  BRANCH_COUNT=$(echo "$BRANCHES" | wc -l)
  log_info "Found $BRANCH_COUNT feature branches"

  if [ "$BRANCH_COUNT" -gt "$MAX_BRANCHES" ]; then
    log_warning "Branch count ($BRANCH_COUNT) exceeds max ($MAX_BRANCHES), processing first $MAX_BRANCHES"
    BRANCHES=$(echo "$BRANCHES" | head -n "$MAX_BRANCHES")
  fi

  # Process each branch
  MERGED_COUNT=0
  BLOCKED_COUNT=0
  SKIPPED_COUNT=0
  CONFLICT_COUNT=0

  while IFS= read -r branch; do
    # Skip empty lines
    [ -z "$branch" ] && continue

    attempt_merge "$branch"
    RESULT=$?

    if [ $RESULT -eq 0 ]; then
      MERGED_COUNT=$((MERGED_COUNT + 1))
    elif [ $RESULT -eq 2 ]; then
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    elif git branch --list "*${branch}*CONFLICT" | grep -q "CONFLICT"; then
      CONFLICT_COUNT=$((CONFLICT_COUNT + 1))
    else
      BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
    fi

    # Return to main branch after each attempt
    git checkout main 2>&1 | tee -a "$LOG_FILE"
  done <<< "$BRANCHES"

  # Summary
  log_section "Summary"
  log_info "Total branches processed: $BRANCH_COUNT"
  log_success "Merged to main: $MERGED_COUNT"
  log_warning "Blocked (failed gates): $BLOCKED_COUNT"
  log_warning "Conflicts (manual intervention): $CONFLICT_COUNT"
  log_skip "Skipped (frontend on VM): $SKIPPED_COUNT"

  # Notification (if enabled)
  if [ "$NOTIFY" = "true" ] && [ "$DRY_RUN" = "false" ]; then
    # TODO: Post to coordination channel via chatroom MCP (Phase 3)
    log_info "Notification: Would post summary to coordination channel (not implemented yet)"
  fi

  log_section "✅ Merge Orchestrator Complete"
  log_info "Log file: $LOG_FILE"
}

# Run main
main "$@"
>>>>>>> origin/auto/worker-20251102_050015
