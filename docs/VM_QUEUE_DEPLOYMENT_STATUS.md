# VM Queue-Based Worker Deployment Status

**Date:** 2025-11-30
**Devon (DevOps)**

---

## Implementation Status

### Phase 1: Queue Infrastructure ✅ COMPLETE
- ✅ Queue file created: `plans/AUTONOMOUS_WORKER_QUEUE.json`
- ✅ Task selection script: `scripts/autonomousWorkerSelectTask.ts`
- ✅ Task claim script: `scripts/autonomousWorkerClaimTask.ts`
- ✅ Task release script: `scripts/autonomousWorkerReleaseTask.ts`
- ✅ Task validation script: `scripts/autonomousWorkerValidateTask.ts`
- ✅ Task completion script: `scripts/autonomousWorkerCompleteTask.ts`
- ✅ Queue generation script: `scripts/generateAutonomousWorkerQueue.ts`

**Tested locally:** Task selection returns highest-priority available task (HIGH-3). Priority ordering works.

### Phase 2: Agent Personality Integration ✅ COMPLETE
- ✅ Agent personality mapping created (roy→simulation-maintainer, devon→devops, etc.)
- ✅ Worker script loads agent .md file and injects into Claude Code prompt
- ✅ Agent context included via `$(cat "$AGENT_PATH")` in prompt
- ✅ Memory recall instruction added: `mcp__agent-memory__recall_context({agent_id: "$AGENT_PERSONALITY"})`

**Tested locally:** Mapping works. `agentPersonality: "devon"` correctly maps to `.claude/agents/devops.md` (209 lines).

**Implementation location:** `scripts/setup-vm-multiworker.sh` lines 226-327

### Phase 3: VM Deployment ❌ NOT STARTED
**Setup script exists:** `scripts/setup-vm-multiworker.sh` (ready to execute)

**Blockers:**
1. **SSH access to VM** - Need credentials/key for `user@vm-hostname`
2. **GitHub SSH key on VM** - VM needs SSH key added to GitHub (annhoward/superalignmenttoutopia)
3. **ANTHROPIC_API_KEY on VM** - Need to set environment variable (systemd service uses `%ANTHROPIC_API_KEY%` placeholder)
4. **VM hostname/IP** - Script hardcoded to `/home/user/satu` path, assumes VM has `/home/user` directory

**What setup script will do when run:**
1. Create `/home/user/satu/` directory structure
2. Clone repo 3x (worker, researcher, orchestrator)
3. Create `autonomous-worker-queue.sh` script in each repo
4. Generate systemd service/timer files
5. Install services with `systemctl --user enable/start`

### Phase 4: Testing ❌ NOT STARTED
**Validation tests needed:**
- Concurrent worker claims (simulate race condition)
- Task status transitions (AVAILABLE → CLAIMED → COMPLETED)
- Validation command execution
- Queue regeneration after architect cleanup
- Infrastructure priority boost logic

**Manual validation command (from queue):**
```bash
ssh vm 'test -d /home/user/satu/worker && systemctl --user status autonomous-worker-queue.timer'
```

---

## Deployment Instructions (For Ann or VM Admin)

### Prerequisites
1. **SSH access to VM:**
   ```bash
   ssh user@vm-hostname
   ```

2. **GitHub SSH key configured:**
   ```bash
   ssh-keygen -t ed25519 -C "autonomous-worker@themultiverse.school"
   cat ~/.ssh/id_ed25519.pub
   # Add to GitHub: Settings → SSH Keys → New SSH key
   ```

3. **Test GitHub access:**
   ```bash
   ssh -T git@github.com
   # Should see: "Hi annhoward! You've successfully authenticated..."
   ```

4. **Set ANTHROPIC_API_KEY:**
   ```bash
   echo "export ANTHROPIC_API_KEY=sk-ant-..." >> ~/.bashrc
   source ~/.bashrc
   ```

### Deployment Steps

1. **Clone repo to VM:**
   ```bash
   cd /tmp
   git clone git@github.com:annhoward/superalignmenttoutopia.git
   cd superalignmenttoutopia
   ```

2. **Run setup script:**
   ```bash
   ./scripts/setup-vm-multiworker.sh
   ```

   This will:
   - Create `/home/user/satu/` structure
   - Clone repo 3x
   - Generate worker scripts
   - Create systemd services

3. **Install systemd services:**
   ```bash
   # Copy service files to systemd user directory
   cp /home/user/satu/shared/configs/*.service ~/.config/systemd/user/
   cp /home/user/satu/shared/configs/*.timer ~/.config/systemd/user/

   # Reload systemd
   systemctl --user daemon-reload

   # Enable and start timer
   systemctl --user enable autonomous-worker-queue.timer
   systemctl --user start autonomous-worker-queue.timer
   ```

4. **Verify deployment:**
   ```bash
   # Check timer status
   systemctl --user status autonomous-worker-queue.timer

   # Check service status
   systemctl --user status autonomous-worker-queue.service

   # View logs
   journalctl --user -u autonomous-worker-queue.service -f
   ```

### Troubleshooting

**If setup script fails with "GitHub SSH key not configured":**
```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub  # Add to GitHub
ssh -T git@github.com  # Test
```

**If worker fails with "ANTHROPIC_API_KEY not set":**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
# OR update systemd service file to use explicit key
```

**If systemd timer doesn't trigger:**
```bash
systemctl --user list-timers  # Check timer schedule
journalctl --user -u autonomous-worker-queue.timer  # Check timer logs
```

---

## Architecture Overview

### Multi-Repo Structure
```
/home/user/satu/
  ├── worker/              ← Implementation worker (isolated git repo)
  │   ├── autonomous-worker-queue.sh
  │   └── [full repo clone]
  ├── researcher/          ← Research worker (isolated git repo)
  │   ├── researcher-worker-queue.sh
  │   └── [full repo clone]
  ├── orchestrator/        ← Merge coordinator (isolated git repo)
  │   └── [full repo clone]
  └── shared/              ← Coordination layer
      ├── logs/            ← Worker execution logs
      │   ├── worker/
      │   └── researcher/
      ├── configs/         ← Systemd service definitions
      └── coordination/    ← Lock files, status flags
```

### Worker Execution Flow
1. **Timer triggers** (every 4 hours): `autonomous-worker-queue.timer`
2. **Worker starts**: `autonomous-worker-queue.sh`
3. **Pull latest queue**: `git pull origin main`
4. **Select task**: `npx tsx scripts/autonomousWorkerSelectTask.ts`
5. **Atomic claim**: Modify queue file, commit, push (race condition handled by git)
6. **Load agent**: Map `agentPersonality` to `.claude/agents/{agent}.md`
7. **Execute**: Claude Code with injected agent context
8. **Validate**: Run acceptance criteria validation
9. **Complete/Release**: Update queue status, push work branch
10. **Push branch**: Worker's isolated repo pushes to origin

### Concurrency Control (Atomic Claim)

**Problem:** Two workers start simultaneously, both see HIGH-3 available.

**Solution:** Git provides atomic test-and-set via push rejection.

```bash
# Worker A
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: worker-A claimed HIGH-3"
git push origin main  # ✅ SUCCESS

# Worker B (simultaneously)
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: worker-B claimed HIGH-3"
git push origin main  # ❌ REJECTED - main moved forward

# Worker B recovers
git pull origin main  # Sees HIGH-3 already claimed
# Re-runs task selection, picks next available task
```

No coordination server needed. Git IS the coordination server.

---

## Expected Outcomes

**Before (Nov 8 failure mode):**
- 24 hourly branches, zero substantive work
- All tokens wasted on overhead (git pulls, queue regen)
- No task coordination

**After (queue-based system):**
- Workers select highest-priority task in token budget
- Workers adopt correct agent personality
- No duplicate work (atomic git claim)
- Infrastructure work gets priority when no CRITICAL blockers
- 80%+ sessions complete substantive work

---

## Next Steps

1. **Ann/VM admin:** Execute deployment steps above
2. **Devon:** Monitor first worker run, validate queue claim mechanism
3. **Devon:** Implement Phase 4 testing (concurrent claims, status transitions)
4. **Architect:** Update roadmap to mark Phase 3 complete when deployed

---

**The infrastructure exists. It just needs deployment credentials.**

When this is live, workers will drain the 125-branch backlog in 48 hours. Then they'll work through the roadmap systematically. Then they'll do maintenance. Then they'll create new plans.

**They will never stop. That's the point.**

---

*Devon's assessment: This is the simplest distributed coordination system that could possibly work. It uses git as the database, JSON as the schema, and bash as the glue. No databases. No message queues. No coordination servers. Just files, commits, and atomic pushes.*

*It's not elegant. It's pragmatic. It will work.*
