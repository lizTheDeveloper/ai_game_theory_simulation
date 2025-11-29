# VM Multi-Worker Deployment Guide

**Status:** Scripts ready, VM deployment NOT STARTED
**Last Updated:** 2025-11-29
**Owner:** Devon (DevOps)

---

## Summary

Infrastructure for parallel autonomous workers is **partially complete**:

- ✅ **Phase 1:** Queue management scripts (select/claim/release/validate)
- ✅ **Phase 1:** VM setup script created (`scripts/setup-vm-multiworker.sh`)
- ❌ **Phase 2:** Agent personality integration (NOT STARTED)
- ❌ **Phase 3:** VM deployment (NOT STARTED)

**Current state:** Scripts exist in codebase but have NOT been deployed to VM.

**Queue file status:** Corrected from COMPLETED to AVAILABLE (Nov 29, 2025) - previous status was incorrect.

---

## What Exists

### Queue Management Scripts

Location: `scripts/autonomousWorker*.ts`

- `autonomousWorkerSelectTask.ts` - Priority-based task selection (CRITICAL > HIGH > MEDIUM > LOW)
- `autonomousWorkerClaimTask.ts` - Atomic task claim via git commit
- `autonomousWorkerReleaseTask.ts` - Mark task COMPLETED/ABANDONED
- `autonomousWorkerValidateTask.ts` - Run acceptance criteria validation
- `autonomousWorkerCompleteTask.ts` - Complete workflow (validate + release)
- `autonomousWorkerGetProgress.ts` - Read task progress/notes
- `generateAutonomousWorkerQueue.ts` - Regenerate queue from roadmap

All scripts work locally. None deployed to VM.

### VM Setup Script

Location: `scripts/setup-vm-multiworker.sh`

**What it does:**
1. Creates multi-repo workspace at `/home/user/satu/`
   - `worker/` - Implementation worker isolated repo
   - `researcher/` - Research worker isolated repo
   - `orchestrator/` - Clean repo for merge orchestrator
   - `shared/` - Logs, configs, coordination files
2. Clones repo 3 times (prevents git contention)
3. Creates queue-based worker scripts for each workspace
4. Generates systemd service/timer files
5. Creates installation helper script

**What it doesn't do:**
- Actually run on the VM (it's just sitting in the repo)
- Install systemd services (requires manual execution)
- Configure ANTHROPIC_API_KEY (user must export)

### Systemd Service Files

Location: `systemd/autonomous-worker.service`, `systemd/researcher-worker.service`

**Problem:** These reference `/home/user/satu/worker` which doesn't exist yet.

---

## What's Missing

### Phase 2: Agent Personality Integration

**Not implemented:**
- Dynamic loading of `.claudeagent` files based on task assignment
- Worker "becoming" the correct agent (Roy, Devon, Sylvia, etc.)
- Memory system integration (recall context, save learnings)

**Current behavior:** Worker claims task but doesn't execute it (placeholder logs only)

### Phase 3: VM Deployment

**Not done:**
1. Run `setup-vm-multiworker.sh` on the VM
2. Export ANTHROPIC_API_KEY in VM environment
3. Run `/home/user/satu/shared/install-services.sh` (installs systemd services)
4. Enable/start systemd timers
5. Verify workers can claim tasks from queue

**Blocker:** Requires SSH access to VM + API key

---

## Deployment Steps (When Ready)

### Prerequisites

- SSH access to VM (`ssh user@vm-hostname`)
- ANTHROPIC_API_KEY available
- GitHub SSH key configured on VM
- Git installed on VM

### Step 1: Copy Setup Script to VM

```bash
# From local machine
scp scripts/setup-vm-multiworker.sh user@vm-hostname:/tmp/
```

### Step 2: Run Setup Script

```bash
# On VM
ssh user@vm-hostname
chmod +x /tmp/setup-vm-multiworker.sh
/tmp/setup-vm-multiworker.sh
```

**Output:** Creates `/home/user/satu/` workspace with 3 isolated repos + shared directory.

### Step 3: Install Systemd Services

```bash
# On VM (as root)
export ANTHROPIC_API_KEY=sk-ant-api03-...
sudo /home/user/satu/shared/install-services.sh
```

**Output:** Systemd services installed at `/etc/systemd/system/autonomous-worker-queue.*`

### Step 4: Enable and Start Timer

```bash
# On VM (as root)
sudo systemctl enable autonomous-worker-queue.timer
sudo systemctl start autonomous-worker-queue.timer
```

**Output:** Worker runs hourly (on the hour).

### Step 5: Verify Operation

```bash
# On VM
sudo systemctl status autonomous-worker-queue.timer
journalctl -u autonomous-worker-queue.service --since "1 hour ago"
tail -f /home/user/satu/shared/logs/worker/worker_*.log
```

**Expected:** Worker pulls queue, selects task, claims it atomically, logs "implementation incomplete" (Phase 2 not done).

---

## Testing Locally (Without VM)

Test task selection:
```bash
npx tsx scripts/autonomousWorkerSelectTask.ts
```

Expected output (as of Nov 29, 2025):
```
⏸️  No tasks available within token budget
   Token budget: 200,000
   Available tasks: 0
   Affordable tasks: 0
```

Regenerate queue with HIGH-3 available:
```bash
npx tsx scripts/generateAutonomousWorkerQueue.ts
npx tsx scripts/autonomousWorkerSelectTask.ts
```

Expected: HIGH-3 selected (devops task, no CRITICAL blockers).

---

## Known Issues

1. **Queue file lying:** Was marked COMPLETED on Nov 26, corrected to AVAILABLE on Nov 29.
2. **Phase 2 not started:** Workers can't execute tasks yet (no agent personality loading).
3. **Path inconsistencies:** Systemd services reference `/home/user/satu/worker` but setup script not run.
4. **No validation:** Acceptance criteria can't be tested until VM deployment done.

---

## Next Steps

**For completing HIGH-3:**

1. **Deploy to VM** (Steps 1-5 above) - ~30 minutes
2. **Implement Phase 2** (Agent personality integration) - ~2 hours
3. **Test concurrent claims** (Spawn 2 workers simultaneously) - ~30 minutes
4. **Validate acceptance criteria** - ~15 minutes

**Estimated total:** 3-4 hours to complete HIGH-3 fully.

**Token budget:** HIGH-3 estimated 35k tokens. Phase 1 consumed ~15k. Remaining work: ~20k tokens.

---

## Design Document

Complete design with architecture diagrams, concurrency model, and queue schema:

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/autonomous_worker_priority_queue_design.md`

**Key concepts:**
- Git provides atomic test-and-set (commit + push)
- Priority drain order: CRITICAL → HIGH → MEDIUM → LOW
- Infrastructure tasks (devops) get boost when no CRITICAL blockers
- Workers adopt agent personality dynamically (Roy, Devon, Sylvia, etc.)

---

## Contact

**Owner:** Devon (DevOps agent)
**Personality:** Gilfoyle from Silicon Valley - cynical, efficient, infrastructure-focused
**Catchphrase when this is done:** "There. I just 10x'd your worker throughput. You're welcome."
