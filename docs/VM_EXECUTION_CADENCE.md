# VM Execution Cadence - claude-workspace

**Applied**: 2025-11-14
**Pattern**: Time-based scheduling to prevent git conflicts

## Daily Schedule (UTC)

| Time | Autonomous Worker | Researcher Worker | Merge Orchestrator | Senior Dev Review | Notes |
|------|-------------------|-------------------|-------------------|-------------------|-------|
| 00:00-05:59 | 🌙 Sleeping | 🌙 Sleeping | ✅ Active @ :45 | - | **Overnight merge window** |
| 06:00 | - | - | - | 🔍 **Daily Review** | Architecture + Research Skeptic |
| 06:15-06:44 | - | - | ⏸️ Paused | - | Waiting for reviews to complete |
| 07:00-07:59 | - | - | ✅ Resumes @ :45 | - | Merge orchestrator back online |
| 08:00-22:00 | ✅ Active @ :00 | ✅ Active @ :30 | ✅ Active @ :45 | - | **Work hours** (15 hours) |
| 23:00-23:59 | 🌙 Stopped | 🌙 Stopped | ✅ Active @ :45 | - | **Overnight begins** |

## Execution Pattern

### Overnight (23:00-05:59 UTC)
- **Merge Orchestrator**: Runs every hour at :45
  - 23:45, 00:45, 01:45, 02:45, 03:45, 04:45, 05:45
  - **No worker conflicts** - exclusive git access
  - Processes remaining branches without interruption
- **Cleanup**: Runs at 02:00 (daily backup and maintenance)

### Morning (06:00-07:59 UTC)
- **06:00**: Senior Developer Reviews
  - Architecture review + Research skeptic analysis
  - Reviews changes from last 24 hours
  - Runs daily with Opus model (high quality)
- **06:15-06:44**: Merge orchestrator paused
  - Gives reviews time to complete
  - Prevents conflicts with review process
- **07:45**: Merge orchestrator resumes
  - First run after reviews
  - Can merge branches approved by reviews

### Work Hours (08:00-22:00 UTC)
- **Autonomous Worker**: Runs at :00 (15 runs daily)
  - Implementation tasks
  - Creates new feature branches
- **Researcher Worker**: Runs at :30 (15 runs daily)
  - Research tasks
  - Documentation and analysis
- **Merge Orchestrator**: Runs at :45 (16 runs daily)
  - Merges completed branches
  - Runs TypeScript checks and tests
  - 15-minute offset from workers prevents conflicts
- **Watcher**: Runs at :15 (every hour, 24/7)
  - Health checks
  - Monitors worker status
  - Logs system health

### Continuous
- **Chatroom Auto-sync**: Every 5 minutes (24/7)
  - Syncs superalignment chatroom
  - 288 runs per day

## Conflict Prevention Strategy

1. **Time separation**: Workers and merge orchestrator never run simultaneously
2. **Overnight merge window**: 7 hours of exclusive merge time
3. **Review integration**: Reviews run before workers start, orchestrator resumes after
4. **15-minute offsets**: Workers at :00/:30, orchestrator at :45, watcher at :15

## Statistics

- **Autonomous Worker**: 15 runs/day (8am-10pm)
- **Researcher Worker**: 15 runs/day (8am-10pm)
- **Merge Orchestrator**: 23 runs/day (7 overnight + 16 during work hours)
- **Watcher**: 24 runs/day (every hour)
- **Senior Dev Reviews**: 1 run/day (6am)
- **Cleanup**: 1 run/day (2am)
- **Chatroom Sync**: 288 runs/day (every 5 min)

## Benefits

1. **No more git conflicts**: Workers don't run when orchestrator is active overnight
2. **Optimal merge time**: 7 uninterrupted hours (23:00-06:00) for merging
3. **Quality gates**: Reviews run before work starts
4. **Predictable schedule**: Same pattern every day
5. **Cost-effective**: Reviews run once daily (2 Opus calls) instead of per-branch

## Logs

- **Autonomous Worker**: `~/ai_game_theory_simulation/logs/cron_worker.log`
- **Researcher Worker**: `~/ai_game_theory_simulation/logs/cron_researcher.log`
- **Merge Orchestrator**: `~/ai_game_theory_simulation/logs/cron_merge.log`
- **Senior Dev Review**: `~/ai_game_theory_simulation/logs/cron_review.log`
- **Watcher**: `~/ai_game_theory_simulation/logs/cron_watcher.log`
- **Cleanup**: `~/ai_game_theory_simulation/logs/cron_cleanup.log`
- **Chatroom Sync**: `~/superalignment-chatroom/logs/auto-sync.log`

## Monitoring

Check execution status with:
```bash
# View recent logs
gcloud compute ssh claude-workspace --zone=europe-west10-a --command="tail -50 ~/ai_game_theory_simulation/logs/cron_merge.log"

# Check merge orchestrator status
gcloud compute ssh claude-workspace --zone=europe-west10-a --command="cd ~/ai_game_theory_simulation && git status"

# View dashboard
python ~/src/abstract_agent_team/vm_dashboard.py
```

## Emergency Procedures

**If merge orchestrator gets stuck:**
```bash
# SSH to VM
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Clean working tree
cd ~/ai_game_theory_simulation
git reset --hard origin/main
git clean -fd

# Verify recovery
git status
```

**To adjust schedule:**
```bash
# Edit crontab
gcloud compute ssh claude-workspace --zone=europe-west10-a
crontab -e

# Backup first
crontab -l > ~/crontab_backup_$(date +%Y%m%d_%H%M%S).txt
```

## Notes

- All times are **UTC**
- Workers run for 15 hours (8am-10pm), sleep for 9 hours
- Merge orchestrator runs 23 hours/day (only paused 06:00-06:44 for reviews)
- Schedule optimizes for:
  - Developer working hours (8am-10pm UTC)
  - Overnight processing (merge branches while humans sleep)
  - Morning quality checks (reviews before work starts)
