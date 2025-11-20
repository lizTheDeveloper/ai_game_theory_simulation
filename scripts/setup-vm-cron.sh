#!/bin/bash
# VM Cron Setup Script
# Sets up autonomous worker, watcher, and merge orchestrator cron jobs on VM

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Autonomous System Cron Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect if we're on VM
IS_VM=false
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
  PROJECT_ROOT="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
elif [ -d "/home/user/ai_game_theory_simulation" ]; then
  IS_VM=true  # Claude Code environment
  PROJECT_ROOT="/home/user/ai_game_theory_simulation"
else
  PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

echo "Environment: $([ "$IS_VM" = "true" ] && echo "VM" || echo "Mac")"
echo "Project root: $PROJECT_ROOT"
echo ""

# Check if cron is installed and running
if ! command -v crontab >/dev/null 2>&1; then
  echo "❌ ERROR: cron is not installed"
  echo "Install with: sudo apt-get install cron"
  exit 1
fi

echo "✅ Cron is installed"

# Check if cron service is running (Linux only)
if [ "$IS_VM" = "true" ]; then
  if pgrep cron > /dev/null 2>&1; then
    echo "✅ Cron service is running"
  else
    echo "⚠️  Cron service is NOT running"
    echo "Would you like to start it? (y/n)"
    read -r START_CRON
    if [ "$START_CRON" = "y" ]; then
      sudo service cron start
      echo "✅ Cron service started"
    else
      echo "❌ Cannot proceed without cron running"
      exit 1
    fi
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Current Crontab"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if crontab -l 2>/dev/null | grep -q "autonomous-worker\|merge-orchestrator\|worker-watcher\|research-agent"; then
  echo "Found existing autonomous system cron jobs:"
  echo ""
  crontab -l | grep -E "autonomous-worker|merge-orchestrator|worker-watcher|research-agent" || echo "None"
  echo ""
  echo "⚠️  WARNING: Existing cron jobs found!"
  echo "Would you like to REPLACE them? (y/n)"
  read -r REPLACE
  if [ "$REPLACE" != "y" ]; then
    echo "❌ Cancelled - no changes made"
    exit 0
  fi
else
  echo "No existing autonomous system cron jobs found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Installing Cron Jobs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create new crontab with autonomous system jobs
TEMP_CRON=$(mktemp)

# Preserve existing cron jobs (except autonomous system ones)
crontab -l 2>/dev/null | grep -v -E "autonomous-worker|merge-orchestrator|worker-watcher|research-agent" > "$TEMP_CRON" || true

# Add autonomous system jobs
cat >> "$TEMP_CRON" << CRON_JOBS

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Autonomous Worker System - Hourly Orchestration
# Installed: $(date '+%Y-%m-%d %H:%M:%S')
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# :00 - Autonomous worker runs (main implementation work)
0 * * * * cd $PROJECT_ROOT && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# :15 - Health check (monitors previous hour's worker)
15 * * * * cd $PROJECT_ROOT && ./scripts/autonomous-worker-watcher.sh >> logs/cron_watcher.log 2>&1

# :30 - Research agent runs (systematic research roadmap execution)
30 * * * * cd $PROJECT_ROOT && ./scripts/research-agent.sh >> logs/cron_research.log 2>&1

# :45 - Merge orchestrator (processes pending branches)
45 * * * * cd $PROJECT_ROOT && ./scripts/merge-orchestrator.sh >> logs/cron_merge.log 2>&1

# */5 - System health monitor (master watchdog, runs every 5 minutes)
*/5 * * * * cd $PROJECT_ROOT && ./scripts/system-health-monitor.sh >> logs/cron_health.log 2>&1

CRON_JOBS

# Install new crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo "✅ Cron jobs installed successfully!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 New Crontab"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
crontab -l | grep -E "autonomous-worker|merge-orchestrator|worker-watcher|research-agent"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ Schedule Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  :00  Autonomous Worker      (implementation work)"
echo "  :15  Worker Watcher         (health check & auto-fix)"
echo "  :30  Research Agent         (research roadmap execution)"
echo "  :45  Merge Orchestrator     (process branches)"
echo "  */5  System Health Monitor  (master watchdog - every 5 min)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Would you like to test the watcher now? (y/n)"
read -r TEST_WATCHER
if [ "$TEST_WATCHER" = "y" ]; then
  echo ""
  echo "Running watcher test..."
  cd "$PROJECT_ROOT"
  ./scripts/autonomous-worker-watcher.sh
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next scheduled runs:"
NEXT_HOUR=$(date -d '+1 hour' '+%H:00' 2>/dev/null || date -v +1H '+%H:00' 2>/dev/null || echo "next :00")
NEXT_FIFTEEN=$(date -d '+1 hour' '+%H:15' 2>/dev/null || date -v +1H '+%H:15' 2>/dev/null || echo "next :15")
NEXT_FORTYFIVE=$(date -d '+1 hour' '+%H:45' 2>/dev/null || date -v +1H '+%H:45' 2>/dev/null || echo "next :45")
echo "  Worker:         $NEXT_HOUR"
echo "  Watcher:        $NEXT_FIFTEEN"
echo "  Merge:          $NEXT_FORTYFIVE"
echo ""
echo "Monitor with:"
echo "  tail -f logs/cron_worker.log"
echo "  tail -f logs/cron_watcher.log"
echo "  tail -f logs/cron_research.log"
echo "  tail -f logs/cron_merge.log"
echo "  tail -f logs/cron_health.log     # Health monitor (every 5 min)"
echo ""
