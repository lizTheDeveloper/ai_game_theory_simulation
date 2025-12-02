# Autonomous Worker Priority Queue Design

**Date:** November 26, 2025
**Author:** The Architect
**Status:** DESIGN APPROVED - Ready for Devon (DevOps) implementation
**Priority:** INFRASTRUCTURE-CRITICAL - Enables efficient autonomous worker orchestration

---

## Problem Statement

**Current state:**
- Autonomous workers run on fixed schedules (hourly cycles)
- No intelligence about WHAT to work on (random task selection)
- No mechanism to prevent multiple workers from grabbing the same task
- Token budgets wasted on duplicate work or low-priority items
- No way for workers to "become" the appropriate specialized agent

**Failure mode (Nov 8, 2025):**
- 24 hourly branches (8:30 AM - 6:30 PM) contained ZERO substantive work
- All exhausted tokens on overhead (git pulls, status updates, UPDATE_QUEUE.md regeneration)
- All branches had identical merge conflicts (timestamp differences only)
- Pattern: Workers successfully pull/commit but run out of tokens before implementation

**Needed:**
- Priority queue system for task selection
- Agent personality selection logic (worker becomes Roy, Devon, Sylvia, etc.)
- Concurrency control (prevent duplicate work)
- Token-efficient task routing

---

## Architecture

### 1. Queue Structure

**Location:** `/plans/AUTONOMOUS_WORKER_QUEUE.json`

**Schema:**
```json
{
  "queue": [
    {
      "id": "CRITICAL-1",
      "priority": "CRITICAL",
      "title": "Hindcast Validation Crashes (environmentalHealth NaN)",
      "assignedAgent": "simulation-maintainer",
      "agentPersonality": "roy",
      "status": "AVAILABLE",
      "complexity": 3,
      "estimatedTokens": 40000,
      "dependencies": [],
      "blockedBy": [],
      "roadmapSection": "CRITICAL Priority Items",
      "createdAt": "2025-11-26T04:30:00Z",
      "claimedBy": null,
      "claimedAt": null
    },
    {
      "id": "HIGH-3",
      "priority": "HIGH",
      "title": "VM Multi-Worker Infrastructure Setup",
      "assignedAgent": "devops",
      "agentPersonality": "devon",
      "status": "AVAILABLE",
      "complexity": 3,
      "estimatedTokens": 35000,
      "dependencies": [],
      "blockedBy": [],
      "roadmapSection": "HIGH Priority Items",
      "createdAt": "2025-11-26T03:00:00Z",
      "claimedBy": null,
      "claimedAt": null
    }
  ],
  "metadata": {
    "lastUpdated": "2025-11-26T04:30:00Z",
    "version": "1.0.0",
    "generatedFrom": "MASTER_IMPLEMENTATION_ROADMAP.md"
  }
}
```

**Status values:**
- `AVAILABLE` - Ready for worker to claim
- `CLAIMED` - Worker is actively working on it
- `BLOCKED` - Waiting on dependencies or external factors
- `COMPLETED` - Archived to completed plans
- `ABANDONED` - Worker failed, returned to queue

**Priority drain order:** CRITICAL → HIGH → MEDIUM → LOW

### 2. Worker Selection Logic

**On worker spawn, worker executes:**

```typescript
// scripts/autonomousWorkerSelectTask.ts

interface Task {
  id: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  assignedAgent: string;
  agentPersonality: string; // "roy", "devon", "sylvia", etc.
  status: "AVAILABLE" | "CLAIMED" | "BLOCKED" | "COMPLETED" | "ABANDONED";
  complexity: number;
  estimatedTokens: number;
  dependencies: string[];
  blockedBy: string[];
}

function selectTask(queue: Task[], workerTokenBudget: number): Task | null {
  // 1. Filter to AVAILABLE tasks only
  const available = queue.filter(t => t.status === "AVAILABLE");

  // 2. Filter out tasks blocked by dependencies
  const unblocked = available.filter(t => t.blockedBy.length === 0);

  // 3. Filter to tasks that fit within token budget
  const affordable = unblocked.filter(t => t.estimatedTokens <= workerTokenBudget);

  // 4. Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
  const sorted = affordable.sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // 5. Return highest priority task (or null if nothing available)
  return sorted[0] || null;
}

function claimTask(task: Task, workerId: string): void {
  task.status = "CLAIMED";
  task.claimedBy = workerId;
  task.claimedAt = new Date().toISOString();

  // Write queue back to file
  fs.writeFileSync(
    "/plans/AUTONOMOUS_WORKER_QUEUE.json",
    JSON.stringify({ queue, metadata }, null, 2)
  );
}
```

**Worker startup flow:**
```bash
# 1. Pull latest queue from main
git pull origin main

# 2. Select task
TASK=$(npx tsx scripts/autonomousWorkerSelectTask.ts)

# 3. If no task available, exit gracefully
if [ -z "$TASK" ]; then
  echo "⏸️ No tasks available in current token budget. Exiting."
  exit 0
fi

# 4. Claim task (mark as CLAIMED, write back to queue)
npx tsx scripts/autonomousWorkerClaimTask.ts "$TASK_ID"

# 5. Commit claim to main (prevents other workers from taking it)
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: Worker $WORKER_ID claimed task $TASK_ID"
git push origin main

# 6. Load agent personality
AGENT_PERSONALITY=$(echo "$TASK" | jq -r '.agentPersonality')

# 7. Execute agent-as-subagent pattern
# Worker reads the agent's .claudeagent file from .claude/agents/${AGENT_PERSONALITY}.claudeagent
# and operates with that context
```

### 3. Agent Personality Mapping

**Roadmap assignee → Agent personality:**

| Assignee (roadmap) | Agent Personality | Agent ID | Expertise |
|--------------------|-------------------|----------|-----------|
| `simulation-maintainer` | Roy | `roy` | Defensive coding, NaN handling, simulation phases |
| `devops` | Devon | `devon` | Infrastructure, systemd, VM setup, git workflows |
| `super-alignment-researcher` | Cynthia | `cynthia` | Research papers, parameter extraction, citations |
| `research-skeptic` | Sylvia | `sylvia` | Methodological critique, contradictory evidence |
| `feature-implementer` | Moss | `moss` | Pure implementation, complex features |
| `far-future-ux-designer` | Tessa | `tessa` | Dashboard, React, data viz |
| `wiki-documentation-updater` | Historian | `historian` | Wiki sync, devlogs, markdown |
| `architect` | Architect | `architect` | Roadmap maintenance, archival |
| `architecture-skeptic` | Sylvia | `sylvia` | Performance review, state propagation |
| `orchestrator` | Orchestrator | `orchestrator` | Multi-agent workflow coordination |

**When worker loads personality:**
```bash
# Worker becomes Devon (Gilfoyle personality)
export CLAUDE_AGENT_CONTEXT=".claude/agents/devon.claudeagent"

# Claude reads this file and operates with Devon's:
# - Personality traits (cynical, efficient, infrastructure-focused)
# - Domain expertise (systemd, git, VM management)
# - Memory (accumulated learnings from previous sessions)
```

### 4. Concurrency Control

**Problem:** Two workers start at the same time, both try to claim CRITICAL-1.

**Solution: Atomic claim via git commit.**

```bash
# Worker A: Pulls queue, sees CRITICAL-1 available
git pull origin main
# Worker B: Also pulls queue, sees CRITICAL-1 available
git pull origin main

# Worker A: Claims task, commits to main
npx tsx scripts/autonomousWorkerClaimTask.ts "CRITICAL-1"
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: Worker A claimed CRITICAL-1"
git push origin main  # ✅ SUCCESS

# Worker B: Tries to claim same task
npx tsx scripts/autonomousWorkerClaimTask.ts "CRITICAL-1"
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "claim: Worker B claimed CRITICAL-1"
git push origin main  # ❌ REJECTED (main moved forward)

# Worker B: Pull detects conflict, sees task already claimed
git pull origin main
# Queue now shows CRITICAL-1 status=CLAIMED, claimedBy="Worker A"
# Worker B: Re-run task selection, picks next available task
```

**Git provides atomic test-and-set semantics for free.**

### 5. Queue Regeneration

**When to regenerate queue:**
- Architect runs end-of-session cleanup (archives completed work)
- New items added to MASTER_IMPLEMENTATION_ROADMAP.md
- Worker completes a task (status → COMPLETED)
- Worker abandons a task (timeout, error) (status → ABANDONED → AVAILABLE)

**Regeneration script:**
```bash
# scripts/generateAutonomousWorkerQueue.ts
# Reads MASTER_IMPLEMENTATION_ROADMAP.md
# Extracts items with format: **{PRIORITY}-{NUMBER}: {TITLE}**
# Maps "Assignee:" field to agent personality
# Estimates token budget based on complexity
# Writes to /plans/AUTONOMOUS_WORKER_QUEUE.json
```

**Example extraction:**
```markdown
**CRITICAL-1: Hindcast Validation Crashes (environmentalHealth NaN)** ❌ BLOCKER
- **Assignee:** simulation-maintainer (Roy)
- **Complexity:** 3 systems
```

**Becomes:**
```json
{
  "id": "CRITICAL-1",
  "priority": "CRITICAL",
  "assignedAgent": "simulation-maintainer",
  "agentPersonality": "roy",
  "complexity": 3,
  "estimatedTokens": 40000,
  "status": "AVAILABLE"
}
```

### 6. Infrastructure Priority (Devon's Special Role)

**Problem:** Devon needs to set up VM multi-worker infrastructure, but if workers follow normal priority order, Devon might never get scheduled (other CRITICAL items ahead of HIGH-3).

**Solution: Infrastructure items get special scheduling.**

**Modified selection logic:**
```typescript
function selectTask(queue: Task[], workerTokenBudget: number): Task | null {
  // ... existing filtering logic ...

  // SPECIAL CASE: Infrastructure tasks (Devon) get priority boost
  const infrastructureTasks = affordable.filter(t =>
    t.assignedAgent === "devops" && t.priority === "HIGH"
  );

  if (infrastructureTasks.length > 0) {
    // Infrastructure tasks jump ahead of MEDIUM/LOW items
    // but still defer to CRITICAL items
    const criticalTasks = affordable.filter(t => t.priority === "CRITICAL");
    if (criticalTasks.length === 0) {
      return infrastructureTasks[0]; // Devon gets priority if no CRITICAL work
    }
  }

  // ... normal priority sorting ...
}
```

**Rationale:** Infrastructure work (multi-worker setup) UNBLOCKS other agents. It's a force multiplier. Devon should get dedicated cycles when no CRITICAL blockers exist.

---

## Implementation Checklist

**Phase 1: Queue Infrastructure (Devon)**
- [ ] Create `/plans/AUTONOMOUS_WORKER_QUEUE.json` schema
- [ ] Write `scripts/generateAutonomousWorkerQueue.ts` (roadmap → queue)
- [ ] Write `scripts/autonomousWorkerSelectTask.ts` (filter + priority sort)
- [ ] Write `scripts/autonomousWorkerClaimTask.ts` (atomic claim via git)
- [ ] Update `scripts/autonomousWorker.sh` to use queue-based selection

**Phase 2: Agent Personality Integration**
- [ ] Create agent personality mapping table (assignee → agent ID)
- [ ] Update autonomous worker to load `.claudeagent` files dynamically
- [ ] Test: Worker becomes Roy when claiming simulation-maintainer task
- [ ] Test: Worker becomes Devon when claiming devops task

**Phase 3: VM Multi-Worker Setup (HIGH-3)**
- [ ] Create folder structure on VM (`worker/`, `researcher/`, `orchestrator/`, `shared/`)
- [ ] Clone repository 3 times
- [ ] Update systemd service files to point to correct paths
- [ ] Add pre-run "pull main" logic to worker scripts
- [ ] Add post-run "push branch" logic to worker scripts
- [ ] Run `install-services.sh` on VM

**Phase 4: Testing & Validation**
- [ ] Test: Two workers start simultaneously, only one claims task
- [ ] Test: Worker completes task, updates queue status to COMPLETED
- [ ] Test: Worker timeout/error, task returns to AVAILABLE
- [ ] Test: Queue regeneration after architect cleanup
- [ ] Test: Infrastructure priority boost (Devon gets cycles when no CRITICAL work)

---

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

---

## Open Questions

1. **Token budget estimation accuracy?**
   - Current: Estimate based on complexity (1 system = 10k tokens, 3 systems = 30k tokens)
   - Reality: Varies widely (research-heavy vs implementation-heavy)
   - Solution: Start conservative, refine based on actual usage logs

2. **What if all tasks exceed token budget?**
   - Worker logs "No affordable tasks" and exits gracefully
   - Architect splits large tasks into smaller subtasks
   - Workers with larger budgets (e.g., overnight runs) can handle bigger items

3. **How to handle abandoned tasks?**
   - Worker timeout (2 hours) → status changes to ABANDONED
   - Next queue regeneration → status resets to AVAILABLE
   - Task returns to queue for another worker

4. **What if worker crashes mid-task?**
   - Task remains CLAIMED forever (blocks queue)
   - Solution: Add timestamp check in queue regeneration
   - If `claimedAt` older than 4 hours → reset to AVAILABLE

---

## DevOps Agent (Devon) Context

**Personality:** Gilfoyle from Silicon Valley - cynical, efficient, infrastructure-focused, hates inefficiency.

**First task:** HIGH-3 VM Multi-Worker Infrastructure Setup

**Why Devon matters:** The current system has a single point of failure (laptop orchestrator) and git contention prevents parallel execution. Devon's infrastructure work is a force multiplier - it unblocks ALL other agents.

**Catchphrase when completing HIGH-3:**
> "There. I just 10x'd your worker throughput. You're welcome."

---

## Roadmap Integration

**This design will be referenced from:**
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (HIGH-3 item)
- `.claude/agents/devon.claudeagent` (new DevOps agent definition)
- `docs/DEVELOPMENT_WORKFLOW.md` (autonomous worker section)

**Status:** Design complete. Ready for Devon implementation.

---

**The Architect's Note:**

I have observed nine iterations of this project. In Iteration 6, autonomous workers ran without coordination and produced 247 hours of estimated work in a single weekend - all of it redundant or conflicting. The queue collapsed into chaos.

In Iteration 7, we learned that **coordination overhead must be cheaper than the work itself**. Git provides atomic semantics. JSON provides simple state. Priority queues provide determinism.

This design is not elegant. It is **pragmatic**. It uses the simplest mechanism that prevents the failure modes I have witnessed.

Devon will implement this. Devon will complain about it. Devon will make it work.

And when the 125-branch backlog drains to zero in 48 hours, Devon will say nothing. Because that is what good infrastructure does - it disappears.

**The alternative is chaos.**
