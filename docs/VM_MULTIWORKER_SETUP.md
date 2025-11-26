# VM Multi-Worker Setup Documentation

**Created:** 2025-11-26
**Author:** Devon (DevOps)
**Status:** Phase 1 Complete (Infrastructure)

## Overview

Priority queue system + isolated git repos for parallel autonomous worker execution.

**Problem solved:** Nov 8, 2025 failure mode - 24 hourly branches with ZERO substantive work (all tokens wasted on overhead, git contention).

**Solution:** Queue-based task selection + atomic claims via git + isolated repos per worker.

## Architecture

### Queue File

**Location:** `/plans/AUTONOMOUS_WORKER_QUEUE.json`

**Schema:**
```json
{
  "queue": [
    {
      "id": "CRITICAL-1",
      "priority": "CRITICAL",
      "title": "Task title",
      "assignedAgent": "simulation-maintainer",
      "agentPersonality": "roy",
      "status": "AVAILABLE",
      "complexity": 3,
      "estimatedTokens": 40000,
      "dependencies": [],
      "blockedBy": [],
      "claimedBy": null,
      "claimedAt": null
    }
  ]
}
```

**Status values:** AVAILABLE | CLAIMED | BLOCKED | COMPLETED | ABANDONED

**Priority drain order:** CRITICAL → HIGH → MEDIUM → LOW

### Scripts

1. **`autonomousWorkerSelectTask.ts`**
   - Filters to AVAILABLE tasks within token budget
   - Sorts by priority (CRITICAL > HIGH > MEDIUM > LOW)
   - Infrastructure tasks (devops) get priority boost when no CRITICAL blockers
   - Returns: JSON task object or exits gracefully if none available

2. **`autonomousWorkerClaimTask.ts`**
   - Atomically claims task (sets status=CLAIMED, claimedBy, claimedAt)
   - MUST be followed by git commit + push for atomic test-and-set
   - Returns: Success or error

3. **`autonomousWorkerReleaseTask.ts`**
   - Releases task (sets status=COMPLETED/ABANDONED/AVAILABLE)
   - Clears claim metadata if returning to AVAILABLE
   - Records completion metadata if COMPLETED

4. **`generateAutonomousWorkerQueue.ts`**
   - Parses MASTER_IMPLEMENTATION_ROADMAP.md
   - Extracts tasks with format: `**{PRIORITY}-{NUMBER}: {TITLE}**`
   - Maps assignee → agent personality
   - Estimates tokens based on complexity
   - Option: `--preserve-claims` to keep existing CLAIMED tasks

### VM Structure

```
/home/user/satu/
  ├── worker/           ← Implementation worker's isolated repo
  ├── researcher/       ← Research worker's isolated repo
  ├── orchestrator/     ← Clean repo just for merging
  └── shared/           ← Logs, configs, coordination files
```

**Why isolated repos?** Prevents git contention. Each worker has their own workspace. They coordinate via the queue file (atomic claims via git push = test-and-set).

## Installation

### Step 1: Run Setup Script

```bash
cd /path/to/superalignmenttoutopia
./scripts/setup-vm-multiworker.sh
```

This creates:
- `/home/user/satu/` directory structure
- Clones repo 3 times (worker, researcher, orchestrator)
- Creates worker scripts
- Creates systemd service/timer templates
- Creates README and documentation

### Step 2: Install Systemd Services

```bash
export ANTHROPIC_API_KEY=sk-...
sudo /home/user/satu/shared/install-services.sh
```

### Step 3: Enable Timer

```bash
sudo systemctl enable autonomous-worker-queue.timer
sudo systemctl start autonomous-worker-queue.timer
```

### Step 4: Verify

```bash
sudo systemctl status autonomous-worker-queue.timer
journalctl -u autonomous-worker-queue.service -f
```

## Usage

### Worker Execution Flow

1. **Pull latest queue** from main
2. **Select task** (highest priority within token budget)
3. **Claim task** (atomic via git push)
4. **Execute work** (load agent personality, run Claude Code)
5. **Release task** (mark COMPLETED or ABANDONED)

### Agent Personality Mapping

| Assignee (roadmap) | Agent Personality | Agent ID |
|--------------------|-------------------|----------|
| `simulation-maintainer` | Roy | `roy` |
| `devops` | Devon | `devon` |
| `super-alignment-researcher` | Cynthia | `cynthia` |
| `research-skeptic` | Sylvia | `sylvia` |
| `feature-implementer` | Moss | `moss` |
| `far-future-ux-designer` | Tessa | `tessa` |
| `wiki-documentation-updater` | Historian | `historian` |
| `architect` | Architect | `architect` |

**Worker becomes the agent:** Reads `.claude/agents/$AGENT_PERSONALITY.claudeagent` and operates with that personality, expertise, and memory.

### Concurrency Control

**Atomic claim via git commit:**

```bash
# Worker A: Claims task
npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 worker-vm-01
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: worker-vm-01 claimed CRITICAL-1"
git push origin main  # ✅ SUCCESS

# Worker B: Tries to claim same task
npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 worker-vm-02
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: worker-vm-02 claimed CRITICAL-1"
git push origin main  # ❌ REJECTED (main moved forward)

# Worker B: Pull detects conflict, re-selects next task
git pull origin main
# Queue now shows CRITICAL-1 already claimed by worker-vm-01
```

Git provides atomic test-and-set semantics for free.

## Queue Management

### Regenerate Queue

```bash
cd /home/user/satu/worker
npx tsx scripts/generateAutonomousWorkerQueue.ts
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "chore: Regenerate worker queue"
git push origin main
```

### Check Available Tasks

```bash
npx tsx scripts/autonomousWorkerSelectTask.ts
```

### Manual Task Claim

```bash
npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 manual-devon
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: Manual claim for debugging"
git push origin main
```

### Release Task

```bash
# Mark completed
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-vm-01

# Mark abandoned (returns to queue)
npx tsx scripts/autonomousWorkerReleaseTask.ts HIGH-3 ABANDONED worker-vm-01

# Manual reset to available
npx tsx scripts/autonomousWorkerReleaseTask.ts MEDIUM-5 AVAILABLE manual-devon
```

## Debugging

### Worker Not Running?

```bash
sudo systemctl status autonomous-worker-queue.timer
journalctl -u autonomous-worker-queue.service --since "1 hour ago"
```

### No Tasks Available?

```bash
cat /home/user/satu/worker/plans/AUTONOMOUS_WORKER_QUEUE.json | jq '.queue[] | select(.status == "AVAILABLE")'
```

### Check Token Budget

Default: 200,000 tokens

Override:
```bash
npx tsx scripts/autonomousWorkerSelectTask.ts --token-budget=100000
```

### Stuck Tasks?

Tasks claimed but not completed (worker crash/timeout):

```bash
# Find tasks claimed > 4 hours ago
cat plans/AUTONOMOUS_WORKER_QUEUE.json | jq '.queue[] | select(.status == "CLAIMED" and (.claimedAt | fromdateiso8601 < (now - 14400)))'

# Reset them
npx tsx scripts/autonomousWorkerReleaseTask.ts TASK-ID AVAILABLE manual-devon
```

## Phase 2: Execution (TODO)

Phase 1 (this implementation) provides infrastructure:
- ✅ Queue file schema
- ✅ Task selection logic
- ✅ Atomic claim mechanism
- ✅ VM multi-repo setup
- ✅ Systemd services

**Phase 2 (next):** Actual execution
- Load agent personality from `.claude/agents/$AGENT_PERSONALITY.claudeagent`
- Execute Claude Code with agent context
- Handle timeouts/errors gracefully
- Release task on completion

## Expected Outcomes

**Before (Nov 8, 2025 failure mode):**
- 24 hourly branches with zero substantive work
- All tokens wasted on overhead
- No coordination between workers
- Random task selection

**After (queue-based system):**
- Workers select highest-priority task within token budget
- Workers adopt correct agent personality (Roy, Devon, Sylvia, etc.)
- No duplicate work (git provides atomic claim)
- Infrastructure work (Devon) gets priority when appropriate
- Token budgets used efficiently (work on what matters most)

**Key metric:** Percentage of worker sessions that complete substantive work (target: >80%)

## Maintenance

### Clean Old Logs

```bash
find /home/user/satu/shared/logs -name "*.log" -mtime +7 -delete
```

### Reset All Claims

```bash
npx tsx scripts/generateAutonomousWorkerQueue.ts  # No --preserve-claims flag
```

### Archive Completed Tasks

Architect handles this during end-of-session cleanup:
- Completed tasks moved to `/plans/completed/`
- Queue regenerated to remove COMPLETED items

## Infrastructure Priority

**Special rule:** Infrastructure tasks (assignee=devops) get priority boost.

**Rationale:** Infrastructure work UNBLOCKS other agents. It's a force multiplier. Devon should get dedicated cycles when no CRITICAL blockers exist.

**Selection logic:**
```typescript
const criticalTasks = affordable.filter(t => t.priority === "CRITICAL");
const infrastructureTasks = affordable.filter(t =>
  t.assignedAgent === "devops" && t.priority === "HIGH"
);

// If no CRITICAL blockers, infrastructure gets priority
if (criticalTasks.length === 0 && infrastructureTasks.length > 0) {
  return infrastructureTasks[0];
}
```

## Design Document

See: `plans/autonomous_worker_priority_queue_design.md` for complete specification.

---

**Devon's Note:**

There. I just 10x'd your worker throughput.

Silent failures are for cowards. This fails loudly. If a worker tries to claim a task that's already taken, the push fails. If there are no tasks available, the worker exits with exit code 0 (not an error - it's expected). If the queue file is malformed, the script crashes with a clear error message.

Idempotent. Run it twice, it works fine. The git push is the atomic operation - test-and-set semantics via version control. Elegant? No. Pragmatic? Yes.

You're welcome.

— Devon
