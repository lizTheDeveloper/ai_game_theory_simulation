#!/bin/bash
# Merge Orchestrator: Hourly Branch Cleanup & Quality Gates
# Created: 2025-11-02
#
# Automatically discovers feature branches, runs quality gates, and merges to main if all checks pass.
# CRITICAL: On VM, skips frontend branches (handle those locally on Mac with Playwright)

set -e

# ============================================
# Configuration
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs/merge_orchestrator"
LOG_FILE="$LOG_DIR/merge_orchestrator_${TIMESTAMP}.log"
LOCK_FILE="/tmp/merge-orchestrator.lock"

# Environment detection
IS_VM="${IS_VM:-false}"
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
fi

# Configuration (can be overridden via environment variables)
DRY_RUN="${MERGE_ORCHESTRATOR_DRY_RUN:-false}"
NOTIFY="${MERGE_ORCHESTRATOR_NOTIFY:-true}"
MAX_BRANCHES="${MERGE_ORCHESTRATOR_MAX_BRANCHES:-10}"
SKIP_FRONTEND="${MERGE_ORCHESTRATOR_SKIP_FRONTEND:-$IS_VM}"
ENABLE_AGENT_REVIEWS="${MERGE_ORCHESTRATOR_ENABLE_AGENT_REVIEWS:-true}"  # Phase 2: Architecture-skeptic + Sylvia reviews
ENABLE_AUTO_REMEDIATION="${MERGE_ORCHESTRATOR_ENABLE_AUTO_REMEDIATION:-true}"  # Phase 2.5: Auto-fix CRITICAL issues

# ============================================
# Logging Setup
# ============================================

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_section() {
  echo "" | tee -a "$LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
  log "$1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
}

log_error() {
  log "❌ ERROR: $*"
}

log_success() {
  log "✅ $*"
}

log_info() {
  log "ℹ️  $*"
}

log_warning() {
  log "⚠️  WARNING: $*"
}

log_skip() {
  log "⏭️  SKIP: $*"
}

# ============================================
# Lock File Management
# ============================================

acquire_lock() {
  if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE")
    if ps -p "$LOCK_PID" > /dev/null 2>&1; then
      log_error "Merge orchestrator already running (PID: $LOCK_PID)"
      exit 1
    else
      log_warning "Stale lock file found, removing"
      rm -f "$LOCK_FILE"
    fi
  fi

  echo $$ > "$LOCK_FILE"
  trap "rm -f $LOCK_FILE" EXIT
}

# ============================================
# Branch Discovery & Classification
# ============================================

discover_branches() {
  # Get all remote branches excluding main (don't log during branch discovery)
  git fetch --all --prune >> "$LOG_FILE" 2>&1

  # List all branches (local + remote), exclude main, exclude auto/ worker branches, exclude merge/ branches
  # Note: git branch -a can prefix branches with *, +, or space
  BRANCHES=$(git branch -a | grep -v 'HEAD' | grep -v 'auto/worker-' | grep -v 'merge/' | sed 's/^[*+ ] //' | sed 's/remotes\/origin\///' | grep -v '^main$' | sort -u)

  if [ -z "$BRANCHES" ]; then
    return 1
  fi

  # Return branches only (no log output)
  echo "$BRANCHES"
}

is_frontend_branch() {
  local branch=$1

  # Check if branch contains frontend changes
  FRONTEND_CHANGES=$(git diff main...${branch} --name-only 2>/dev/null | grep -E '^src/(lib|app|components)/|\.tsx$|\.css$' | wc -l || echo "0")

  if [ "$FRONTEND_CHANGES" -gt 0 ]; then
    return 0  # Is frontend
  else
    return 1  # Not frontend
  fi
}

# ============================================
# Merge Operations
# ============================================

attempt_merge() {
  local feature_branch=$1
  local merge_branch="merge/${feature_branch}_${TIMESTAMP}"

  log_section "Processing: $feature_branch"

  # Check if frontend branch on VM
  if [ "$SKIP_FRONTEND" = "true" ]; then
    if is_frontend_branch "$feature_branch"; then
      log_skip "Frontend branch on VM: $feature_branch"
      log_info "   Frontend changes detected, handle locally on Mac"
      return 2  # Special return code for skipped
    fi
  fi

  # Create merge branch
  log_info "Creating merge branch: $merge_branch"
  git checkout -b "$merge_branch" main 2>&1 | tee -a "$LOG_FILE"

  # Pull latest main
  log_info "Pulling latest main..."
  git pull origin main 2>&1 | tee -a "$LOG_FILE"

  # Attempt merge
  log_info "Attempting merge from $feature_branch..."
  if ! git merge "origin/$feature_branch" --no-edit 2>&1 | tee -a "$LOG_FILE"; then
    log_error "Merge conflict detected"
    log_info "Preserving merge branch for manual resolution: ${merge_branch}_CONFLICT"
    git merge --abort 2>&1 | tee -a "$LOG_FILE"
    git checkout main 2>&1 | tee -a "$LOG_FILE"
    git branch -m "$merge_branch" "${merge_branch}_CONFLICT" 2>&1 | tee -a "$LOG_FILE"
    return 1  # Failure
  fi

  log_success "Merge successful (no conflicts)"

  # Run quality gates
  if ! run_quality_gates "$feature_branch" "$merge_branch"; then
    log_error "Quality gates failed"
    log_info "Preserving merge branch for inspection: ${merge_branch}_FAILED"
    git checkout main 2>&1 | tee -a "$LOG_FILE"
    git branch -m "$merge_branch" "${merge_branch}_FAILED" 2>&1 | tee -a "$LOG_FILE"
    return 1  # Failure
  fi

  # All gates passed - merge to main
  if [ "$DRY_RUN" = "true" ]; then
    log_info "[DRY RUN] Would merge $merge_branch to main"
    log_info "[DRY RUN] Would delete $feature_branch"
    git checkout main 2>&1 | tee -a "$LOG_FILE"
    git branch -D "$merge_branch" 2>&1 | tee -a "$LOG_FILE"
  else
    log_success "All quality gates passed - merging to main"
    git checkout main 2>&1 | tee -a "$LOG_FILE"
    git merge "$merge_branch" --no-edit 2>&1 | tee -a "$LOG_FILE"
    git push origin main 2>&1 | tee -a "$LOG_FILE"

    # Clean up branches
    log_success "Cleaning up branches"
    git branch -d "$merge_branch" 2>&1 | tee -a "$LOG_FILE"
    git push origin --delete "$feature_branch" 2>&1 | tee -a "$LOG_FILE" || log_warning "Failed to delete remote branch (may not exist)"
    git branch -D "$feature_branch" 2>&1 | tee -a "$LOG_FILE" || log_warning "Failed to delete local branch (may not exist)"

    log_success "🎉 MERGED TO MAIN: $feature_branch"
  fi

  return 0  # Success
}

# ============================================
# Quality Gates
# ============================================

run_quality_gates() {
  local feature_branch=$1
  local merge_branch=$2

  log_section "Quality Gates: $feature_branch"

  # Gate 1: TypeScript Compilation
  log_info "Gate 1: TypeScript compilation..."
  if ! npx tsc --noEmit 2>&1 | tee -a "$LOG_FILE"; then
    log_error "TypeScript compilation failed"
    return 1
  fi
  log_success "TypeScript compilation passed"

  # Gate 2: Test Suite
  log_info "Gate 2: Test suite..."

  # Check if test script exists
  if npm run 2>&1 | grep -q "test:backend\|test"; then
    if [ "$IS_VM" = "true" ]; then
      # On VM: Only run backend tests (skip Playwright)
      if npm run 2>&1 | grep -q "test:backend"; then
        log_info "Running backend tests only (VM mode)..."
        if ! npm run test:backend 2>&1 | tee -a "$LOG_FILE"; then
          log_error "Backend tests failed"
          return 1
        fi
      else
        log_warning "test:backend script not found, skipping tests"
      fi
    else
      # On Mac: Run all tests
      if npm run 2>&1 | grep -q "test"; then
        if ! npm test 2>&1 | tee -a "$LOG_FILE"; then
          log_error "Tests failed"
          return 1
        fi
      else
        log_warning "test script not found, skipping tests"
      fi
    fi
    log_success "Tests passed (or skipped)"
  else
    log_warning "No test scripts found, skipping test gate"
  fi

  # Gate 3: Architecture Skeptic Review
  if [ "$ENABLE_AGENT_REVIEWS" = "true" ]; then
    log_info "Gate 3: Architecture review..."
    if ! "$SCRIPT_DIR/merge-gate-architecture.sh" "$feature_branch" "$TIMESTAMP" "$LOG_FILE"; then
      log_error "Architecture review blocked merge"
      return 1
    fi
    log_success "Architecture review passed"
  else
    log_info "Gate 3: Architecture review (skipped - agent reviews disabled)"
  fi

  # Gate 4: Sylvia Final Review
  if [ "$ENABLE_AGENT_REVIEWS" = "true" ]; then
    log_info "Gate 4: Sylvia final review..."
    if ! "$SCRIPT_DIR/merge-gate-sylvia.sh" "$feature_branch" "$TIMESTAMP" "$LOG_FILE"; then
      log_error "Sylvia review blocked merge"
      return 1
    fi
    log_success "Sylvia review passed"
  else
    log_info "Gate 4: Sylvia review (skipped - agent reviews disabled)"
  fi

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
  log_info "Agent reviews (Phase 2): $ENABLE_AGENT_REVIEWS"
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

    # Disable errexit temporarily to capture non-zero return codes
    # (attempt_merge returns 0=success, 1=failure, 2=skipped)
    set +e
    attempt_merge "$branch"
    RESULT=$?
    set -e

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
