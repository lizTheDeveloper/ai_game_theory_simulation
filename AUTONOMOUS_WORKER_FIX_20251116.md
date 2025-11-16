# Autonomous Worker Health Check Fix - Nov 16, 2025

## Issue
Health check detected concurrent Claude Code instances causing merge conflicts.

## Root Cause
**Duplicate scheduling:** merge-orchestrator was running twice per hour

- **Systemd timer:** `OnCalendar=hourly` (every :00)
- **Cron job:** `45 23,0-5,7-22 * * *` (every :45)

This caused:
- 04:00 - systemd triggers merge-orchestrator
- 04:00 - cron triggers autonomous-worker
- 04:00 - Both spawn Claude Code instances → conflict

## Solution
Disabled the systemd timer:
```bash
sudo systemctl disable merge-orchestrator.timer
sudo systemctl stop merge-orchestrator.timer
```

## Why This Fixes It
- **Cron-only scheduling:** merge-orchestrator now only runs at :45
- **Proper separation:** Workers (:00) finish before merge orchestrator (:45)
- **No overlap:** 45-minute worker timeout ends before merge orchestrator starts

## Verification
```bash
$ systemctl status merge-orchestrator.timer
○ merge-orchestrator.timer
     Loaded: loaded (disabled)
     Active: inactive (dead)
```

## Lock Files Already Working
Both scripts already have lock file mechanisms:
- `autonomous-worker.sh`: `.autonomous-worker.lock`
- `merge-orchestrator.sh`: `/tmp/merge-orchestrator.lock`

Issue was duplicate scheduling, not missing locks.

## Actions Taken
1. ✅ Disabled systemd timer
2. ✅ Resolved merge conflict in `docs/wiki/README.md`
3. ✅ Merged researcher branch → `merge/auto/researcher-20251114_213001_20251116_040000`
4. ✅ Pushed merge branch to GitHub

## Monitoring
- Next merge orchestrator should run at 04:45 (not 05:00)
- Watch for any :00 executions (should not occur)

## Status
🟢 **HEALTHY** - Duplicate scheduling eliminated, proper isolation restored

**Detailed diagnosis:** `logs/autonomous_worker_diagnosis_20251116.md`
