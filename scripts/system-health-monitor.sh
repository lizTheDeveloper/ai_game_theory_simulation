#!/bin/bash
# System Health Monitor: Master watchdog for autonomous infrastructure
# Runs every 5 minutes to ensure all autonomous components are healthy.
# Performs active recovery when issues are detected.

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs/health_monitor"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/health_${TIMESTAMP}.log"

# Health check thresholds (minutes)
WORKER_MAX_AGE=90       # Worker runs every 60 min
RESEARCHER_MAX_AGE=90   # Researcher runs every 60 min
MERGE_MAX_AGE=90        # Merge orch runs every 60 min
DISK_WARN_PERCENT=85
DISK_CRIT_PERCENT=95

# Recovery attempt tracking
MAX_RECOVERY_ATTEMPTS=3  # Max recovery attempts per hour
RECOVERY_TRACKING_FILE="$LOG_DIR/recovery_attempts_$(date +%Y%m%d_%H).txt"

mkdir -p "$LOG_DIR"

# Logging functions
log() {
  echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_section() {
  echo "" | tee -a "$LOG_FILE"
  echo "━━━ $* ━━━" | tee -a "$LOG_FILE"
}

# Track recovery attempts (prevent infinite loops)
track_recovery() {
  local component=$1
  echo "$(date +%H:%M:%S) $component" >> "$RECOVERY_TRACKING_FILE"

  # Count attempts in last hour
  local count=0
  if [ -f "$RECOVERY_TRACKING_FILE" ]; then
    count=$(grep -c "$component" "$RECOVERY_TRACKING_FILE" || echo "0")
  fi

  if [ "$count" -ge "$MAX_RECOVERY_ATTEMPTS" ]; then
    log "🚨 CRITICAL: $component has failed $count times in the last hour"
    log "Stopping recovery attempts to prevent infinite loop"
    return 1
  fi

  return 0
}

# Check if a log file is recent enough
check_log_age() {
  local log_path=$1
  local max_age_minutes=$2
  local component_name=$3

  if [ ! -f "$log_path" ]; then
    log "⚠️  $component_name: Log file not found ($log_path)"
    return 1
  fi

  local file_age_seconds=$(( $(date +%s) - $(stat -f %m "$log_path" 2>/dev/null || stat -c %Y "$log_path" 2>/dev/null || echo "0") ))
  local file_age_minutes=$(( file_age_seconds / 60 ))

  if [ "$file_age_minutes" -gt "$max_age_minutes" ]; then
    log "⚠️  $component_name: Last run was $file_age_minutes minutes ago (max: $max_age_minutes)"
    return 1
  fi

  log "✅ $component_name: Last run $file_age_minutes minutes ago"
  return 0
}

# Force clean git state
force_clean_git() {
  log "🔧 Force cleaning git state..."
  cd "$PROJECT_ROOT"

  # Abort any in-progress operations
  git merge --abort 2>&1 | tee -a "$LOG_FILE" || true
  git rebase --abort 2>&1 | tee -a "$LOG_FILE" || true

  # Reset to HEAD
  git reset --hard HEAD 2>&1 | tee -a "$LOG_FILE" || true

  # Clean untracked files
  git clean -fd 2>&1 | tee -a "$LOG_FILE" || true

  # Remove stale locks
  rm -f .git/index.lock 2>&1 | tee -a "$LOG_FILE" || true

  log "✅ Git state cleaned"
}

# Check git health
check_git_health() {
  cd "$PROJECT_ROOT"

  # Check for stale locks
  if [ -f ".git/index.lock" ]; then
    local lock_age_seconds=$(( $(date +%s) - $(stat -f %m ".git/index.lock" 2>/dev/null || stat -c %Y ".git/index.lock" 2>/dev/null || echo "0") ))
    local lock_age_minutes=$(( lock_age_seconds / 60 ))

    if [ "$lock_age_minutes" -gt 10 ]; then
      log "⚠️  Stale git lock detected (age: $lock_age_minutes minutes)"
      rm -f .git/index.lock
      log "✅ Removed stale lock"
    fi
  fi

  # Check for dirty working tree
  if ! git diff --quiet || ! git diff --cached --quiet || git ls-files -u | grep -q .; then
    log "⚠️  Working tree is dirty"

    if track_recovery "git-clean"; then
      force_clean_git
    fi
  fi
}

# Check disk space
check_disk_space() {
  local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')

  if [ "$disk_usage" -ge "$DISK_CRIT_PERCENT" ]; then
    log "🚨 CRITICAL: Disk usage at ${disk_usage}% (threshold: ${DISK_CRIT_PERCENT}%)"
    log "Consider cleaning up logs/"
  elif [ "$disk_usage" -ge "$DISK_WARN_PERCENT" ]; then
    log "⚠️  WARNING: Disk usage at ${disk_usage}% (threshold: ${DISK_WARN_PERCENT}%)"
  else
    log "✅ Disk usage: ${disk_usage}%"
  fi
}

# Main health check
log_section "System Health Monitor Started"
log "Timestamp: $(date)"

# Component health checks
log_section "Component Health Checks"

WORKER_LOG="$PROJECT_ROOT/logs/cron_worker.log"
RESEARCHER_LOG="$PROJECT_ROOT/logs/cron_research.log"
MERGE_LOG="$PROJECT_ROOT/logs/cron_merge.log"

ISSUES_DETECTED=0

if ! check_log_age "$WORKER_LOG" "$WORKER_MAX_AGE" "Autonomous Worker"; then
  ISSUES_DETECTED=1
fi

if ! check_log_age "$RESEARCHER_LOG" "$RESEARCHER_MAX_AGE" "Research Agent"; then
  ISSUES_DETECTED=1
fi

if ! check_log_age "$MERGE_LOG" "$MERGE_MAX_AGE" "Merge Orchestrator"; then
  ISSUES_DETECTED=1
fi

# Git health
log_section "Git Health Check"
check_git_health

# Disk space
log_section "Disk Space Check"
check_disk_space

# Summary
log_section "Health Check Complete"
if [ "$ISSUES_DETECTED" -eq 0 ]; then
  log "✅ All systems healthy"
else
  log "⚠️  $ISSUES_DETECTED component(s) may need attention"
  log "📋 Check component logs for details"
fi

# Cleanup old recovery tracking files (keep only last 24 hours)
find "$LOG_DIR" -name "recovery_attempts_*.txt" -mtime +1 -delete 2>/dev/null || true

# Cleanup old health logs (keep only last 7 days)
find "$LOG_DIR" -name "health_*.log" -mtime +7 -delete 2>/dev/null || true

log "Health check complete"
