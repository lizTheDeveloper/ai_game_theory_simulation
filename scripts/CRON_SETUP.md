# Autonomous System Cron Setup

This document provides the recommended cron schedule for running autonomous workers and monitoring systems on the VM.

## Recommended Schedule

```cron
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Autonomous Worker System - Hourly Orchestration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# :00 - Autonomous worker runs (main implementation work)
0 * * * * cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# :15 - Health check (monitors previous hour's worker)
15 * * * * cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation && ./scripts/autonomous-worker-watcher.sh >> logs/cron_watcher.log 2>&1

# :45 - Merge orchestrator (processes pending branches)
45 * * * * cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation && ./scripts/merge-orchestrator.sh >> logs/cron_merge.log 2>&1
```

## Timing Rationale

**:00 - Autonomous Worker**
- Runs at top of hour for predictable scheduling
- Has 25-minute timeout to complete work
- Typical runtime: 5-20 minutes depending on task complexity

**:15 - Worker Watcher**
- Runs 15 minutes after worker starts
- Gives worker time to complete or hit issues
- Monitors last 90 minutes to catch previous run
- Auto-remediates if issues detected

**:45 - Merge Orchestrator**
- Runs at :45 to process branches created during :00 run
- Gives 45 minutes for worker to finish and push
- Has time to complete before next worker cycle at :00
- Processes up to 10 branches per run

## Installation on VM

```bash
# Edit crontab
crontab -e

# Add the three lines above (adjust paths if needed)

# Verify crontab
crontab -l

# Check cron is running
sudo service cron status

# If not running, start it
sudo service cron start

# Enable on boot
sudo systemctl enable cron
```

## Monitoring

### Check Recent Activity

```bash
# Worker runs
ls -lth logs/autonomous/worker_*.log | head -10

# Watcher runs
ls -lth logs/worker_watcher/watcher_*.log | head -10

# Merge orchestrator runs
ls -lth logs/merge_orchestrator/merge_orchestrator_*.log | head -10

# Cron logs (combined)
tail -100 logs/cron_worker.log
tail -100 logs/cron_watcher.log
tail -100 logs/cron_merge.log
```

### Check System Status

```bash
# Are processes running?
ps aux | grep -E "autonomous-worker|merge-orchestrator|worker-watcher"

# Any hung processes?
ps aux | grep autonomous | grep -v grep

# Check lock files
ls -la /tmp/*.lock
```

### Manual Testing

```bash
# Test worker manually
./autonomous-worker.sh

# Test watcher manually
./scripts/autonomous-worker-watcher.sh

# Test merge orchestrator manually
./scripts/merge-orchestrator.sh

# Dry run merge orchestrator (no actual merges)
MERGE_ORCHESTRATOR_DRY_RUN=true ./scripts/merge-orchestrator.sh
```

## Troubleshooting

### Workers Not Running

1. **Check cron is running:**
   ```bash
   sudo service cron status
   sudo service cron start
   ```

2. **Check crontab is configured:**
   ```bash
   crontab -l
   ```

3. **Check for errors in cron logs:**
   ```bash
   grep -i error logs/cron_*.log
   ```

4. **Test worker manually:**
   ```bash
   ./autonomous-worker.sh
   ```

### Watcher Detecting Issues

The watcher will automatically invoke Claude Code to diagnose and fix issues. Check:

```bash
# View watcher logs
tail -100 logs/worker_watcher/watcher_$(ls -t logs/worker_watcher/ | head -1)

# If auto-remediation failed, check what it tried
grep "🤖 Spawning Claude" logs/worker_watcher/*.log
```

### Merge Orchestrator Failing

1. **Check recent merge logs:**
   ```bash
   tail -100 logs/merge_orchestrator/merge_orchestrator_$(ls -t logs/merge_orchestrator/ | grep merge_orchestrator | head -1)
   ```

2. **Look for quality gate failures:**
   ```bash
   grep "ERROR\|FAILED" logs/merge_orchestrator/*.log | tail -20
   ```

3. **Check architecture review logs:**
   ```bash
   ls -lth logs/merge_orchestrator/architecture_review_*.txt | head -5
   cat logs/merge_orchestrator/architecture_review_$(ls -t logs/merge_orchestrator/ | grep architecture_review | head -1)
   ```

## Environment Variables

You can override behavior with environment variables:

```bash
# Worker timeout (default: 1500s = 25 minutes)
export AUTONOMOUS_WORKER_TIMEOUT=1800

# Merge orchestrator - dry run mode
export MERGE_ORCHESTRATOR_DRY_RUN=true

# Merge orchestrator - max branches to process
export MERGE_ORCHESTRATOR_MAX_BRANCHES=20

# Merge orchestrator - skip frontend branches (auto-detected on VM)
export MERGE_ORCHESTRATOR_SKIP_FRONTEND=true

# Watcher - check window in minutes (default: 90)
export WORKER_WATCHER_CHECK_WINDOW=120
```

## Expected Behavior

### Healthy System

- Worker runs hourly at :00, completes in 5-20 minutes
- Watcher runs at :15, reports "All systems operational"
- Merge orchestrator runs at :45, processes 0-10 branches
- 10-20 worker branches created per day
- Most branches merged automatically if they pass quality gates

### System Under Load

- Worker may timeout at 25 minutes if roadmap has complex tasks
- Watcher may trigger auto-remediation to split tasks
- Merge orchestrator may queue branches if >10 pending
- Branch count grows if workers produce faster than merges process

### System Needs Attention

- Worker hasn't run in 2+ hours → Check cron
- Watcher reporting issues repeatedly → Manual investigation needed
- Merge orchestrator blocking all branches → Address quality gate issues
- 50+ pending worker branches → Review and bulk-merge or archive

## Update History

- 2025-11-04: Initial version with :00/:15/:45 schedule
- 2025-11-04: Added auto-remediation to watcher
