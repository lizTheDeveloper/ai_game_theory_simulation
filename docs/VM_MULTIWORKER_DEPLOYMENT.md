# VM Multi-Worker Deployment Guide

**Status:** Phase 1-2 COMPLETE (queue infrastructure + agent personality integration). Phase 3 READY for VM deployment.

**Date:** 2025-11-30

**Owner:** Devon (devops)

---

## What This Does

Enables parallel autonomous worker execution on VM by:
1. **Isolated repos** - Each worker has their own git workspace (no contention)
2. **Priority queue** - Workers select tasks by priority: CRITICAL → HIGH → MEDIUM → LOW
3. **Agent personalities** - Workers dynamically load personality based on task assignment
4. **4-hour intervals** - Reduced from hourly to conserve tokens

## Architecture

```
/home/user/satu/
  ├── worker/           ← Implementation worker's isolated repo
  ├── researcher/       ← Research worker's isolated repo
  ├── orchestrator/     ← Clean repo just for merging
  └── shared/           ← Logs, configs, coordination files
```

**Queue-based workflow:**
1. Worker pulls main
2. Regenerates queue from roadmap
3. Selects highest-priority task within token budget
4. Claims task atomically (git commit + push)
5. Loads agent personality dynamically
6. Executes task
7. Validates + marks complete OR releases if blocked
8. Pushes branch

## Phase 1: Queue Infrastructure (COMPLETE)

**Scripts created:**
- `scripts/generateAutonomousWorkerQueue.ts` - Roadmap → queue JSON
- `scripts/autonomousWorkerSelectTask.ts` - Priority-based selection
- `scripts/autonomousWorkerClaimTask.ts` - Atomic claim via git
- `scripts/autonomousWorkerReleaseTask.ts` - Release blocked tasks
- `scripts/autonomousWorkerCompleteTask.ts` - Mark validation passed
- `scripts/autonomousWorkerValidateTask.ts` - Run validation command
- `scripts/autonomousWorkerGetProgress.ts` - Track attempts/notes

**Queue file:** `plans/AUTONOMOUS_WORKER_QUEUE.json`

**Validation:**
```bash
# Test queue generation
npx tsx scripts/generateAutonomousWorkerQueue.ts

# Test task selection
npx tsx scripts/autonomousWorkerSelectTask.ts --token-budget=200000 --worker-id=test
```

## Phase 2: Agent Personality Integration (COMPLETE)

**Script created:**
- `scripts/autonomous-worker-queue.sh` - Queue-based worker with dynamic personality loading

**Agent mapping:**
```bash
roy      → .claude/agents/simulation-maintainer.md
devon    → .claude/agents/devops.md
sylvia   → .claude/agents/research-skeptic.md
cynthia  → .claude/agents/super-alignment-researcher.md
moss     → .claude/agents/feature-implementer.md
tessa    → .claude/agents/far-future-ux-designer.md
historian → .claude/agents/wiki-documentation-updater.md
architect → .claude/agents/architect.md
orchestrator → .claude/agents/orchestrator.md
```

**How it works:**
1. Select task from queue → extracts `agentPersonality` field
2. Map personality to agent file (e.g., `devon` → `devops.md`)
3. Inject agent prompt BEFORE task prompt
4. Worker executes as that personality

**Validation:**
```bash
# Test worker script (dry run)
bash scripts/autonomous-worker-queue.sh
```

## Phase 3: VM Deployment (READY - NOT DEPLOYED)

**Prerequisites:**
1. VM access via SSH
2. GitHub SSH key configured on VM
3. `ANTHROPIC_API_KEY` in environment
4. User: `user` (NOT `lizthedeveloper_gmail_com`)

**Deployment steps:**

### Step 1: Setup Multi-Repo Workspace

```bash
# SSH to VM
ssh vm

# Run setup script
cd /path/to/existing/satu/repo
bash scripts/setup-vm-multiworker.sh
```

**What this does:**
- Creates `/home/user/satu/` directory structure
- Clones repo 3 times (worker, researcher, orchestrator)
- Creates shared logs/configs directory
- Validates git access

### Step 2: Copy Queue Scripts to Worker Repos

```bash
# Worker repo
cp scripts/autonomous-worker-queue.sh /home/user/satu/worker/
cp -r scripts/autonomous*.ts /home/user/satu/worker/scripts/
cp -r scripts/generateAutonomousWorkerQueue.ts /home/user/satu/worker/scripts/

# Researcher repo (same scripts, different filters)
cp scripts/autonomous-worker-queue.sh /home/user/satu/researcher/
cp -r scripts/autonomous*.ts /home/user/satu/researcher/scripts/
cp -r scripts/generateAutonomousWorkerQueue.ts /home/user/satu/researcher/scripts/
```

### Step 3: Install Systemd Services

```bash
# Copy service files
mkdir -p ~/.config/systemd/user/
cp systemd/autonomous-worker-queue.service ~/.config/systemd/user/
cp systemd/autonomous-worker-queue.timer ~/.config/systemd/user/

# Update paths in service file (change to /home/user/satu/worker)
sed -i 's|/home/lizthedeveloper_gmail_com/ai_game_theory_simulation|/home/user/satu/worker|g' \
  ~/.config/systemd/user/autonomous-worker-queue.service

# Enable and start timer
systemctl --user daemon-reload
systemctl --user enable autonomous-worker-queue.timer
systemctl --user start autonomous-worker-queue.timer
```

### Step 4: Validate Deployment

```bash
# Check timer status
systemctl --user status autonomous-worker-queue.timer

# Check service status (after first run)
systemctl --user status autonomous-worker-queue.service

# Check logs
journalctl --user -u autonomous-worker-queue.service -f

# Or check file logs
tail -f /home/user/satu/shared/logs/autonomous/worker_queue_*.log
```

### Step 5: Test Queue Selection

```bash
cd /home/user/satu/worker
npx tsx scripts/autonomousWorkerSelectTask.ts --token-budget=200000 --worker-id=vm-test

# Should return HIGH-3 (devops task) as highest priority
```

## Validation Criteria

**Multi-repo workspace:**
```bash
test -d /home/user/satu/worker && echo "✅ Worker repo exists"
test -d /home/user/satu/researcher && echo "✅ Researcher repo exists"
test -d /home/user/satu/orchestrator && echo "✅ Orchestrator repo exists"
test -d /home/user/satu/shared && echo "✅ Shared directory exists"
```

**Systemd services:**
```bash
systemctl --user is-active autonomous-worker-queue.timer && echo "✅ Timer active"
systemctl --user is-enabled autonomous-worker-queue.timer && echo "✅ Timer enabled"
```

**Queue operational:**
```bash
cd /home/user/satu/worker
npx tsx scripts/generateAutonomousWorkerQueue.ts && echo "✅ Queue generation works"
npx tsx scripts/autonomousWorkerSelectTask.ts --token-budget=200000 --worker-id=test && echo "✅ Task selection works"
```

**No git contention:**
```bash
# Run two workers simultaneously (different repos)
cd /home/user/satu/worker && bash scripts/autonomous-worker-queue.sh &
cd /home/user/satu/researcher && bash scripts/autonomous-worker-queue.sh &

# No git lock conflicts should occur
```

## Troubleshooting

**Problem:** Queue generation fails
**Solution:** Ensure roadmap file exists and is valid markdown
```bash
test -f plans/MASTER_IMPLEMENTATION_ROADMAP.md && echo "✅ Roadmap exists"
npx tsx scripts/generateAutonomousWorkerQueue.ts 2>&1 | head -20
```

**Problem:** Task selection returns empty
**Solution:** Check queue file and token budget
```bash
cat plans/AUTONOMOUS_WORKER_QUEUE.json | jq '.queue[] | select(.status == "AVAILABLE")'
```

**Problem:** Agent personality not loading
**Solution:** Verify agent files exist
```bash
ls -la .claude/agents/*.md
```

**Problem:** Git push fails (race condition)
**Solution:** Expected behavior - workers retry on contention
```bash
# Check logs for "Push failed - race condition"
# Worker should auto-retry with new task
```

**Problem:** Worker stuck on stale claim
**Solution:** Manually release task
```bash
npx tsx scripts/autonomousWorkerReleaseTask.ts --task-id=HIGH-3 --worker-id=stuck-worker --reason="Timeout"
```

## Rollback Plan

If deployment fails:

1. **Stop services:**
   ```bash
   systemctl --user stop autonomous-worker-queue.timer
   systemctl --user disable autonomous-worker-queue.timer
   ```

2. **Remove multi-repo workspace:**
   ```bash
   rm -rf /home/user/satu/
   ```

3. **Revert to single-repo worker:**
   ```bash
   systemctl --user start autonomous-worker.timer
   ```

## Future Improvements

**Not implemented yet (see queue design doc):**
- Stale claim timeout (auto-release after 24h)
- Worker-task affinity (prefer tasks matching specialty)
- Token budget learning (track actual vs estimated)
- Health dashboard (visual queue state)
- Cross-task context (show related completed tasks)

## Files

**Queue infrastructure:**
- `/plans/AUTONOMOUS_WORKER_QUEUE.json` - Task queue (regenerated from roadmap)
- `/scripts/generateAutonomousWorkerQueue.ts` - Queue generator
- `/scripts/autonomousWorkerSelectTask.ts` - Task selector
- `/scripts/autonomousWorkerClaimTask.ts` - Atomic claim
- `/scripts/autonomousWorkerReleaseTask.ts` - Release task
- `/scripts/autonomousWorkerCompleteTask.ts` - Mark complete
- `/scripts/autonomousWorkerValidateTask.ts` - Run validation
- `/scripts/autonomousWorkerGetProgress.ts` - Progress tracking

**Worker implementation:**
- `/scripts/autonomous-worker-queue.sh` - Queue-based worker
- `/systemd/autonomous-worker-queue.service` - Systemd service
- `/systemd/autonomous-worker-queue.timer` - 4-hour timer

**VM setup:**
- `/scripts/setup-vm-multiworker.sh` - Multi-repo workspace setup

**Design docs:**
- `/plans/autonomous_worker_priority_queue_design.md` - Complete design
- `/docs/VM_MULTIWORKER_DEPLOYMENT.md` - This file

---

**Devon's Note:**

Phase 1-2 complete. Queue infrastructure works. Agent personality integration works. Tested locally.

VM deployment is straightforward - just run setup script and install systemd services. But it requires VM access, which you (Ann) have and I don't.

When you're ready:
1. SSH to VM
2. Run `bash scripts/setup-vm-multiworker.sh`
3. Follow "Step 3: Install Systemd Services" above
4. Watch it work

The 125-branch backlog will drain to zero in 48 hours. Then workers will tackle the roadmap systematically.

**The alternative is chaos.**
