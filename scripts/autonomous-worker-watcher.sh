#!/bin/bash
# Autonomous Worker Watcher: Health check for autonomous workers
# Created: 2025-11-04
#
# Runs at :15 past each hour to verify workers from the previous hour executed successfully.
# Alerts if workers are stuck, erroring, or not running.

set -e

# ============================================
# Configuration
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs/worker_watcher"
LOG_FILE="$LOG_DIR/watcher_${TIMESTAMP}.log"

# Check window: last 90 minutes (to catch hourly runs even if delayed)
CHECK_WINDOW_MINUTES=90

# Environment detection
IS_VM="${IS_VM:-false}"
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
  PROJECT_ROOT="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
fi

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

# ============================================
# Main Logic
# ============================================

log_section "🔍 Autonomous Worker Health Check - $TIMESTAMP"
log "ℹ️  Environment: $([ "$IS_VM" = "true" ] && echo "VM" || echo "Mac")"
log "ℹ️  Check window: last ${CHECK_WINDOW_MINUTES} minutes"

cd "$PROJECT_ROOT"

# Check if autonomous worker script exists
if [ ! -f "$PROJECT_ROOT/autonomous-worker.sh" ]; then
  log "❌ ERROR: autonomous-worker.sh not found at $PROJECT_ROOT"
  exit 1
fi

# Find recent worker logs
WORKER_LOG_DIR="$PROJECT_ROOT/logs/autonomous"
if [ ! -d "$WORKER_LOG_DIR" ]; then
  log "❌ ERROR: Worker log directory not found: $WORKER_LOG_DIR"
  exit 1
fi

log_section "📋 Recent Worker Activity"

# Get current UTC hour (workers run 08:00-22:00 UTC, off 23:00-07:00 UTC)
CURRENT_HOUR_UTC=$(date -u +%H | sed 's/^0//')
OVERNIGHT_WINDOW=false

if [ "$CURRENT_HOUR_UTC" -ge 23 ] || [ "$CURRENT_HOUR_UTC" -lt 8 ]; then
  OVERNIGHT_WINDOW=true
  log "ℹ️  Currently in overnight window (23:00-07:00 UTC) - workers scheduled off"
fi

# Find logs from the last CHECK_WINDOW_MINUTES
RECENT_LOGS=$(find "$WORKER_LOG_DIR" -name "worker_*.log" -mmin -${CHECK_WINDOW_MINUTES} -type f 2>/dev/null | sort -r)
RECENT_COUNT=$(echo "$RECENT_LOGS" | grep "worker_" | wc -l)
RECENT_COUNT=${RECENT_COUNT:-0}

log "ℹ️  Found $RECENT_COUNT worker log(s) in last ${CHECK_WINDOW_MINUTES} minutes"

if [ "$RECENT_COUNT" -eq 0 ]; then
  # During overnight window, this is expected
  if [ "$OVERNIGHT_WINDOW" = "true" ]; then
    log "✅ No recent worker runs (expected during overnight window)"

    # Check last worker log to ensure it's not TOO old (should be from 22:00 run)
    LAST_LOG=$(ls -t "$WORKER_LOG_DIR"/worker_*.log 2>/dev/null | head -1)
    if [ -n "$LAST_LOG" ]; then
      LAST_RUN=$(stat -c %Y "$LAST_LOG" 2>/dev/null || stat -f %m "$LAST_LOG" 2>/dev/null)
      NOW=$(date +%s)
      AGE_MINUTES=$(( (NOW - LAST_RUN) / 60 ))
      log "ℹ️  Last worker run: $(basename "$LAST_LOG") (${AGE_MINUTES} minutes ago)"

      # Max expected age: from 22:00 previous day to 07:59 next day = ~10 hours = 600 minutes
      if [ "$AGE_MINUTES" -gt 720 ]; then
        log "🚨 CRITICAL: Workers haven't run in over 12 hours (expected max: 10 hours)"
        ISSUE_DETECTED=true
      fi
    fi
  else
    # During work hours (08:00-22:00 UTC), missing runs are a problem
    log "⚠️  WARNING: No worker runs detected in last ${CHECK_WINDOW_MINUTES} minutes"
    log "ℹ️  Expected: At least 1 hourly run during work hours (08:00-22:00 UTC)"

    # Check if cron is running (VM only)
    if [ "$IS_VM" = "true" ]; then
      log "ℹ️  Checking cron status..."
      if pgrep cron > /dev/null 2>&1; then
        log "✅ Cron service is running"
        log "⚠️  Check crontab with: crontab -l"
      else
        log "❌ ERROR: Cron service is NOT running!"
        log "💡 Start with: sudo service cron start"
      fi
    fi

    # Check last worker log (sort by modification time, not alphabetically)
    LAST_LOG=$(ls -t "$WORKER_LOG_DIR"/worker_*.log 2>/dev/null | head -1)
    if [ -n "$LAST_LOG" ]; then
      LAST_RUN=$(stat -c %Y "$LAST_LOG" 2>/dev/null || stat -f %m "$LAST_LOG" 2>/dev/null)
      NOW=$(date +%s)
      AGE_MINUTES=$(( (NOW - LAST_RUN) / 60 ))
      log "ℹ️  Last worker run: $(basename "$LAST_LOG") (${AGE_MINUTES} minutes ago)"

      if [ "$AGE_MINUTES" -gt 120 ]; then
        log "🚨 CRITICAL: Workers haven't run in over 2 hours during work hours!"
      fi
    fi

    ISSUE_DETECTED=true
  fi
else
  log "✅ Workers are running"

  # Analyze recent logs for errors
  log_section "🔍 Analyzing Recent Logs"

  ERRORS_FOUND=false
  TIMEOUTS_FOUND=false

  for logfile in $RECENT_LOGS; do
    log "📄 Analyzing: $(basename "$logfile")"

    # Check for Claude execution failures
    if grep -q "❌ ERROR: Claude execution failed" "$logfile" 2>/dev/null; then
      EXIT_CODE=$(grep "Exit Code:" "$logfile" | head -1 | awk '{print $NF}')
      log "  ❌ Claude execution failed (exit code: ${EXIT_CODE:-unknown})"
      ERRORS_FOUND=true
    fi

    # Check for timeouts
    if grep -q "⚠️ WARNING: Claude execution timed out" "$logfile" 2>/dev/null; then
      log "  ⏱️  Claude execution timed out (25 minute limit)"
      TIMEOUTS_FOUND=true
    fi

    # Check for successful completion
    if grep -q "✅ WORKER CYCLE COMPLETE" "$logfile" 2>/dev/null; then
      COMMITS=$(grep "Commits made:" "$logfile" | tail -1 | awk '{print $NF}')
      DURATION=$(grep "Total runtime:" "$logfile" | tail -1 | awk '{print $3}')
      log "  ✅ Completed successfully (${COMMITS:-0} commits, ${DURATION:-unknown})"
    fi

    # Check for merge conflicts
    if grep -q "❌ ERROR: Pull failed - likely merge conflict" "$logfile" 2>/dev/null; then
      log "  🔀 Merge conflict detected (should be auto-resolved)"
    fi
  done

  if [ "$ERRORS_FOUND" = "true" ]; then
    log ""
    log "⚠️  WARNING: Recent worker runs encountered errors"
    ISSUE_DETECTED=true
  fi

  if [ "$TIMEOUTS_FOUND" = "true" ]; then
    log ""
    log "⚠️  WARNING: Recent worker runs hit timeout limits"
    ISSUE_DETECTED=true
  fi
fi

# Check worker branches
log_section "🌿 Worker Branch Status"

# Count remote worker branches
WORKER_BRANCHES=$(git branch -r 2>/dev/null | grep "auto/worker-" | wc -l)
WORKER_BRANCHES=${WORKER_BRANCHES:-0}  # Default to 0 if empty
log "ℹ️  Remote worker branches: $WORKER_BRANCHES"

if [ "$WORKER_BRANCHES" -gt 50 ]; then
  log "⚠️  WARNING: Large number of worker branches ($WORKER_BRANCHES)"
  log "💡 Consider running merge orchestrator to clean up"
fi

# Check for open PRs (if gh CLI available)
if command -v gh >/dev/null 2>&1; then
  OPEN_PRS=$(gh pr list --state open --json headRefName 2>/dev/null | grep "auto/worker-" | wc -l | tr -d ' ')
  OPEN_PRS=${OPEN_PRS:-0}  # Default to 0 if empty
  log "ℹ️  Open worker PRs: $OPEN_PRS"

  if [ "$OPEN_PRS" -gt 10 ]; then
    log "⚠️  WARNING: Large number of open worker PRs ($OPEN_PRS)"
    log "💡 Review and merge pending work"
  fi
fi

# Check if merge orchestrator ran recently
log_section "🔄 Merge Orchestrator Status"

MERGE_LOG_DIR="$PROJECT_ROOT/logs/merge_orchestrator"
if [ -d "$MERGE_LOG_DIR" ]; then
  RECENT_MERGE=$(find "$MERGE_LOG_DIR" -name "merge_*.log" -mmin -${CHECK_WINDOW_MINUTES} -type f 2>/dev/null | wc -l)
  if [ "$RECENT_MERGE" -gt 0 ]; then
    log "✅ Merge orchestrator ran in last ${CHECK_WINDOW_MINUTES} minutes"
  else
    LAST_MERGE=$(ls -t "$MERGE_LOG_DIR"/merge_*.log 2>/dev/null | head -1)
    if [ -n "$LAST_MERGE" ]; then
      LAST_MERGE_TIME=$(stat -c %Y "$LAST_MERGE" 2>/dev/null || stat -f %m "$LAST_MERGE" 2>/dev/null)
      NOW=$(date +%s)
      AGE_MINUTES=$(( (NOW - LAST_MERGE_TIME) / 60 ))
      log "ℹ️  Last merge orchestrator run: ${AGE_MINUTES} minutes ago"
    else
      log "⚠️  WARNING: No merge orchestrator logs found"
    fi
  fi
else
  log "⚠️  WARNING: Merge orchestrator log directory not found"
fi

# Check if autonomous researcher ran recently
log_section "🔬 Autonomous Researcher Status"

RESEARCHER_LOG_DIR="$PROJECT_ROOT/logs/autonomous/researcher"
if [ -d "$RESEARCHER_LOG_DIR" ]; then
  RECENT_RESEARCHER=$(find "$RESEARCHER_LOG_DIR" -name "*.log" -mmin -${CHECK_WINDOW_MINUTES} -type f 2>/dev/null | wc -l | tr -d ' ')
  RECENT_RESEARCHER=${RECENT_RESEARCHER:-0}

  if [ "$RECENT_RESEARCHER" -gt 0 ]; then
    log "✅ Researcher ran in last ${CHECK_WINDOW_MINUTES} minutes"

    # Analyze recent researcher logs for errors
    RECENT_RESEARCHER_LOGS=$(find "$RESEARCHER_LOG_DIR" -name "*.log" -mmin -${CHECK_WINDOW_MINUTES} -type f 2>/dev/null | sort -r)

    RESEARCHER_ERRORS=false
    for logfile in $RECENT_RESEARCHER_LOGS; do
      log "📄 Analyzing: $(basename "$logfile")"

      # Check for critical script not found errors (ignore benign dependency checks)
      if grep -q "not found" "$logfile" 2>/dev/null && ! grep -q "claude not found" "$logfile" 2>/dev/null; then
        log "  ❌ Script execution failed (script not found)"
        RESEARCHER_ERRORS=true
      fi

      # Check for timeout/errors
      if grep -q "ERROR\|FAILED\|timed out" "$logfile" 2>/dev/null; then
        log "  ❌ Researcher encountered errors"
        RESEARCHER_ERRORS=true
      fi

      # Check for successful completion
      if grep -q "COMPLETE\|SUCCESS" "$logfile" 2>/dev/null; then
        log "  ✅ Completed successfully"
      fi
    done

    if [ "$RESEARCHER_ERRORS" = "true" ]; then
      log ""
      log "⚠️  WARNING: Researcher runs encountered errors"
      ISSUE_DETECTED=true
    fi
  else
    # During overnight window, missing researcher runs are expected
    if [ "$OVERNIGHT_WINDOW" = "true" ]; then
      log "✅ No recent researcher runs (expected during overnight window)"

      # Check last researcher log to ensure it's not TOO old
      LAST_RESEARCHER=$(ls -t "$RESEARCHER_LOG_DIR"/*.log 2>/dev/null | head -1)
      if [ -n "$LAST_RESEARCHER" ]; then
        LAST_RESEARCHER_TIME=$(stat -c %Y "$LAST_RESEARCHER" 2>/dev/null || stat -f %m "$LAST_RESEARCHER" 2>/dev/null)
        NOW=$(date +%s)
        AGE_MINUTES=$(( (NOW - LAST_RESEARCHER_TIME) / 60 ))
        log "ℹ️  Last researcher run: ${AGE_MINUTES} minutes ago"

        # Researcher runs hourly 8am-10pm at :30, so max overnight gap is ~10 hours
        if [ "$AGE_MINUTES" -gt 720 ]; then
          log "🚨 CRITICAL: Researcher hasn't run in over 12 hours (expected max: 10 hours)"
          ISSUE_DETECTED=true
        fi
      fi
    else
      # During work hours, missing researcher runs are a problem
      LAST_RESEARCHER=$(ls -t "$RESEARCHER_LOG_DIR"/*.log 2>/dev/null | head -1)
      if [ -n "$LAST_RESEARCHER" ]; then
        LAST_RESEARCHER_TIME=$(stat -c %Y "$LAST_RESEARCHER" 2>/dev/null || stat -f %m "$LAST_RESEARCHER" 2>/dev/null)
        NOW=$(date +%s)
        AGE_MINUTES=$(( (NOW - LAST_RESEARCHER_TIME) / 60 ))
        log "⚠️  WARNING: No recent researcher runs during work hours (last: ${AGE_MINUTES} minutes ago)"

        # During work hours, max gap should be ~90 minutes (hourly + wiggle room)
        if [ "$AGE_MINUTES" -gt 120 ]; then
          log "🚨 CRITICAL: Researcher hasn't run in over 2 hours during work hours!"
          ISSUE_DETECTED=true
        fi
      else
        log "⚠️  WARNING: No researcher logs found"
        ISSUE_DETECTED=true
      fi
    fi
  fi
else
  log "⚠️  WARNING: Researcher log directory not found"
  log "ℹ️  Expected: $RESEARCHER_LOG_DIR"
  ISSUE_DETECTED=true
fi

# Final summary
log_section "📊 Summary"

if [ "${ISSUE_DETECTED:-false}" = "true" ]; then
  log "⚠️  ISSUES DETECTED - Attempting auto-remediation..."
  log ""

  # Create remediation task for Claude Code
  REMEDIATION_TASK="/tmp/worker_remediation_${TIMESTAMP}.txt"
  cat > "$REMEDIATION_TASK" << 'REMEDIATION_EOF'
## Autonomous Worker Health Check Failed

The autonomous-worker-watcher detected issues with the autonomous worker system.

**Your task:** Diagnose and fix the issues preventing autonomous workers from running properly.

### Investigation Steps

1. **Check recent worker logs:**
   ```bash
   ls -lth logs/autonomous/ | head -20
   tail -50 logs/autonomous/worker_*.log | head -100
   ```

2. **Check researcher logs:**
   ```bash
   ls -lth logs/autonomous/researcher/ | head -20
   cat logs/autonomous/researcher/cron_*.log | tail -50
   ```

3. **Check merge orchestrator logs:**
   ```bash
   ls -lth logs/merge_orchestrator/ | head -20
   tail -50 logs/merge_orchestrator/merge_*.log | head -100
   ```

4. **Check cron configuration (VM only):**
   ```bash
   # Is cron running?
   pgrep cron || ps aux | grep cron

   # What's scheduled?
   crontab -l
   ```

3. **Check for blocking processes:**
   ```bash
   # Any hung worker processes?
   ps aux | grep autonomous-worker

   # Any lock files?
   ls -la /tmp/*.lock
   ```

4. **Check API key availability:**
   ```bash
   # Is API key set? (don't print it, just check length)
   echo $ANTHROPIC_API_KEY | wc -c
   ```

5. **Review error patterns:**
   ```bash
   # What errors are workers hitting?
   grep -r "ERROR\|CRITICAL\|FAILED" logs/autonomous/worker_*.log | tail -50
   ```

### Common Issues & Fixes

**Issue: Cron not running**
```bash
sudo service cron start
sudo service cron status
```

**Issue: Workers timing out**
- Check if tasks are too complex
- Review roadmap for overly ambitious items
- Consider breaking tasks into smaller chunks

**Issue: API key not set**
- Check .env file exists and has ANTHROPIC_API_KEY
- Verify autonomous-worker.sh sources .env correctly

**Issue: Hung processes**
```bash
# Kill any hung workers
pkill -f autonomous-worker.sh
rm -f /tmp/autonomous-worker.lock
```

**Issue: Merge conflicts blocking workers**
- Workers should auto-resolve, but check if git is in weird state
- Reset to clean state if needed

**Issue: Researcher script not found**
```bash
# Check if researcher script exists
ls -la scripts/researcher-worker.sh

# If missing, check what researcher infrastructure exists
find . -name "*researcher*" -type f

# May need to create or fix researcher worker script
```

**Issue: Merge orchestrator failing**
- Check logs/merge_orchestrator/ for recent runs
- Verify it spawns Claude Code on conflicts (post-Nov 6 fix)
- Check for accumulated worker branches: git branch -r | grep auto/worker

### After Fixing

1. Test the worker manually:
   ```bash
   ./autonomous-worker.sh
   ```

2. Verify it completes successfully

3. Check that cron will run it properly

4. Document what you fixed in a commit message

### DO NOT

- Don't change the watcher script itself (that's working fine)
- Don't modify roadmap priorities without reason
- Don't disable workers - fix the underlying issue
REMEDIATION_EOF

  log "🤖 Spawning Claude Code for auto-remediation..."
  log "ℹ️  Task file: $REMEDIATION_TASK"

  # Check if claude command exists
  if command -v claude >/dev/null 2>&1; then
    # Run Claude Code with timeout (10 minutes for diagnosis/fix)
    set +e
    timeout 600 claude --dangerously-skip-permissions < "$REMEDIATION_TASK" >> "$LOG_FILE" 2>&1
    CLAUDE_EXIT=$?
    set -e

    if [ $CLAUDE_EXIT -eq 0 ]; then
      log "✅ Auto-remediation completed successfully"
      log "ℹ️  Review changes and test: ./autonomous-worker.sh"
    elif [ $CLAUDE_EXIT -eq 124 ]; then
      log "⏱️  Auto-remediation timed out (10 minute limit)"
      log "💡 Manual intervention may be required"
    else
      log "❌ Auto-remediation failed (exit code: $CLAUDE_EXIT)"
      log "💡 Manual intervention required"
    fi

    # Clean up
    rm -f "$REMEDIATION_TASK"
  else
    log "⚠️  Claude Code not available - cannot auto-remediate"
    log "💡 Manual troubleshooting steps:"
    log "   1. Check cron status: sudo service cron status"
    log "   2. View crontab: crontab -l"
    log "   3. Check worker logs: ls -lth $WORKER_LOG_DIR | head -10"
    log "   4. Test worker manually: ./autonomous-worker.sh"
    log "   5. Check API key: echo \$ANTHROPIC_API_KEY | wc -c"
  fi

  exit 1
else
  log "✅ All systems operational"
  log "ℹ️  Workers are running normally"
  log "ℹ️  Next check: $(date -d '+1 hour' '+%Y-%m-%d %H:15:00' 2>/dev/null || date -v +1H '+%Y-%m-%d %H:15:00' 2>/dev/null || echo 'in 1 hour at :15')"

  exit 0
fi
