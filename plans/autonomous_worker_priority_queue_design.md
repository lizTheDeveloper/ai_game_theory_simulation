# Autonomous Worker Priority Queue Design

**Date:** 2025-11-28
**Status:** DESIGN COMPLETE - Ready for Implementation
**Assignee:** devops (Devon)
**Priority:** HIGH-3

## Problem Statement

**Problem 1 - Git Contention:** Workers cannot run in parallel
- Current: Single repo on VM (`/home/user/satu/`)
- Workers cannot run concurrently (git lock conflicts)
- Orchestrator running on Ann's laptop (125 branch backlog)
- Scalability blocked

**Problem 2 - No Task Coordination:** Workers don't know what to work on
- Nov 8, 2025: 24 hourly branches with ZERO substantive work
- All tokens wasted on overhead (git pulls, status updates)
- No mechanism to prevent duplicate work
- No way for workers to "become" the right agent personality

## Solution Architecture

### 1. Multi-Repo Workspace (Solution for Git Contention)

```
/home/user/satu/
  ├── worker/           ← Implementation worker's isolated repo
  ├── researcher/       ← Research worker's isolated repo
  ├── orchestrator/     ← Clean repo just for merging
  └── shared/           ← Logs, configs, coordination files
```

**Benefits:**
- No git lock contention (each worker has its own clone)
- Workers can run truly in parallel
- Clean separation of concerns
- Orchestrator has pristine repo for conflict resolution

**Alternative Considered: git worktree**
- Pros: Shared .git/ folder, less disk space
- Cons: Still has locking issues on index, more complexity
- Verdict: Multi-repo simpler and more robust

### 2. Priority Queue System (Solution for Task Coordination)

**Queue File:** `/plans/AUTONOMOUS_WORKER_QUEUE.json`

**Schema:**
```json
{
  "version": "1.0",
  "generated": "2025-11-28T07:00:00Z",
  "tasks": [
    {
      "id": "CRITICAL-1",
      "priority": "CRITICAL",
      "title": "Fix NaN bug in ecology phase",
      "assignee": "simulation-maintainer",
      "agentId": "roy",
      "effort": "2-4 hours",
      "dependencies": [],
      "status": "available",
      "claimedBy": null,
      "claimedAt": null,
      "description": "Full task description from roadmap",
      "location": "plans/MASTER_IMPLEMENTATION_ROADMAP.md:215-230"
    }
  ]
}
```

**Task States:**
- `available` - Ready to be claimed
- `claimed` - Worker is working on it
- `completed` - Archived, moved to roadmap
- `blocked` - Dependencies not met

**Atomic Claim Mechanism:**
Uses git as a distributed lock:
1. Worker pulls latest queue
2. Updates task: `status: "claimed"`, `claimedBy: "worker-123"`, `claimedAt: timestamp`
3. Commits and pushes
4. If push fails (race condition), retry with updated queue
5. If push succeeds, worker owns the task

**Priority Boost for Infrastructure:**
When no CRITICAL blockers exist, infrastructure tasks get priority boost to prevent them being starved by endless MEDIUM work.

```typescript
function calculateEffectivePriority(task: QueueTask, queue: Queue): number {
  const priorities = { CRITICAL: 1000, HIGH: 500, MEDIUM: 100, LOW: 10 };
  let score = priorities[task.priority];

  // Infrastructure boost when no CRITICAL blockers
  const hasCriticalBlockers = queue.tasks.some(t =>
    t.priority === 'CRITICAL' && t.status === 'available'
  );

  if (!hasCriticalBlockers && task.assignee === 'devops') {
    score += 200; // Boosts HIGH infrastructure above MEDIUM work
  }

  return score;
}
```

### 3. Agent Personality Mapping

**Mapping Table:**
```typescript
const AGENT_PERSONALITY_MAP: Record<string, string> = {
  'simulation-maintainer': 'roy',
  'far-future-ux-designer': 'tessa',
  'super-alignment-researcher': 'cynthia',
  'research-skeptic': 'sylvia',
  'architect': 'historian',
  'devops': 'devon',
  'priya': 'priya',
  'orchestrator': 'orchestrator',
  // ... etc
};
```

**Dynamic Personality Loading:**
When worker claims a task, it loads the corresponding `.claudeagent` file to adopt the right personality.

```bash
# In autonomous-worker.sh
TASK=$(node scripts/autonomousWorkerClaimTask.ts)
AGENT_ID=$(echo "$TASK" | jq -r '.agentId')

# Load agent personality
if [ -f ".claude/agents/$AGENT_ID/.claudeagent" ]; then
  export CLAUDE_AGENT_CONTEXT="$AGENT_ID"
  # Claude Code reads this and loads agent context
fi
```

## Implementation Plan

### Phase 1: Queue Infrastructure Scripts

**Script 1: `scripts/generateAutonomousWorkerQueue.ts`**
- Reads `plans/MASTER_IMPLEMENTATION_ROADMAP.md`
- Extracts all CRITICAL/HIGH/MEDIUM/LOW items
- Generates `/plans/AUTONOMOUS_WORKER_QUEUE.json`
- Filters out completed items
- Maps assignees to agent IDs

**Script 2: `scripts/autonomousWorkerSelectTask.ts`**
- Reads queue JSON
- Filters by worker token budget (exclude >6hr tasks if low tokens)
- Sorts by effective priority
- Returns top available task

**Script 3: `scripts/autonomousWorkerClaimTask.ts`**
- Takes task ID as input
- Atomically claims task via git commit
- Handles race conditions (retry up to 3 times)
- Returns claimed task details

**Script 4: `scripts/autonomousWorkerCompleteTask.ts`**
- Takes task ID as input
- Marks task as completed
- Commits and pushes
- Triggers queue regeneration

**Script 5: `scripts/autonomousWorkerReleaseTask.ts`**
- Takes task ID as input
- Releases a claimed task (if worker crashes)
- Only allows release if claim is >2 hours old (prevent stealing)

### Phase 2: Autonomous Worker Integration

**Update `autonomous-worker.sh`:**
```bash
#!/bin/bash
# (existing header)

# NEW: Select task from queue
TASK=$(node scripts/autonomousWorkerSelectTask.ts --budget "$REMAINING_TOKENS")

if [ "$TASK" = "null" ]; then
  echo "ℹ️  No tasks available in queue"
  exit 0
fi

TASK_ID=$(echo "$TASK" | jq -r '.id')
AGENT_ID=$(echo "$TASK" | jq -r '.agentId')

# NEW: Claim task atomically
if ! node scripts/autonomousWorkerClaimTask.ts --id "$TASK_ID"; then
  echo "⚠️  Failed to claim task (race condition?)"
  exit 1
fi

# NEW: Load agent personality
if [ -f ".claude/agents/$AGENT_ID/.claudeagent" ]; then
  export CLAUDE_AGENT_CONTEXT="$AGENT_ID"
  echo "🤖 Loaded agent personality: $AGENT_ID"
fi

# (existing Claude Code execution)

# NEW: Mark task complete
node scripts/autonomousWorkerCompleteTask.ts --id "$TASK_ID"
```

### Phase 3: VM Multi-Repo Setup

**Directory Structure:**
```bash
cd /home/user/satu

# Clone 3 times
git clone git@github.com:user/repo.git worker
git clone git@github.com:user/repo.git researcher
git clone git@github.com:user/repo.git orchestrator

# Create shared folder
mkdir -p shared/logs
mkdir -p shared/queue
```

**Update systemd services:**
```ini
[Unit]
Description=Autonomous Implementation Worker
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/satu/worker
ExecStartPre=/usr/bin/git pull origin main --rebase
ExecStart=/home/user/satu/worker/scripts/autonomous-worker.sh
ExecStartPost=/usr/bin/git push origin HEAD
Restart=on-failure
RestartSec=3600

[Install]
WantedBy=multi-user.target
```

### Phase 4: Testing & Validation

**Test Cases:**
1. Two workers claim same task simultaneously → One succeeds, one retries
2. Worker crashes mid-task → Task remains claimed, release script can free it
3. Infrastructure priority boost → Infrastructure tasks run when no CRITICAL work
4. Queue regeneration → Completed tasks removed, new roadmap items added
5. Agent personality loading → Worker adopts correct agent context

**Acceptance Criteria:**
- ✅ 0 git lock conflicts
- ✅ <5% duplicate work (race conditions)
- ✅ >80% substantive work (vs overhead)
- ✅ Infrastructure tasks complete within 48 hours when no CRITICAL blockers

## Migration Path

**Week 1: Queue System Only (No VM Changes)**
- Generate queue from roadmap
- Workers select tasks but still work in single repo
- Learn queue patterns, identify issues
- 0 regression risk (existing system unchanged)

**Week 2: Multi-Repo on VM**
- Set up 3 clones on VM
- Update systemd services
- Run workers in parallel
- Monitor for git issues

**Week 3: Agent Personality Integration**
- Map all roadmap assignees to agent IDs
- Load `.claudeagent` files dynamically
- Workers adopt correct personalities
- Validate agent context switching

## Risks & Mitigations

**Risk 1: Queue drift (roadmap updates not reflected in queue)**
- Mitigation: Regenerate queue after every architect session
- Mitigation: Queue includes `location` pointer to roadmap for manual verification

**Risk 2: Orphaned tasks (worker crashes, task stuck as claimed)**
- Mitigation: Release script can free tasks >2 hours old
- Mitigation: Watcher script monitors claim durations

**Risk 3: Priority gaming (workers cherry-pick easy tasks)**
- Mitigation: Effort estimates inform selection (prefer high-value tasks)
- Mitigation: Infrastructure boost prevents starvation

**Risk 4: Disk space (3 repo clones)**
- Mitigation: .git/ folders are ~200MB, 3× = 600MB (acceptable)
- Mitigation: Periodic git gc in orchestrator repo

## Benefits Summary

**Before:**
- ❌ Serial execution (1 worker at a time)
- ❌ No task coordination (24 no-work branches Nov 8)
- ❌ 125 branch backlog (orchestrator on laptop)
- ❌ Workers adopt wrong personality (generic vs specialist)

**After:**
- ✅ Parallel execution (3 workers simultaneously)
- ✅ Smart task selection (priority queue)
- ✅ 0 duplicate work (atomic claims)
- ✅ Workers adopt correct agent personality (Roy, Devon, Sylvia, etc.)
- ✅ Force multiplier (3× throughput)
- ✅ Reduced Ann's operational overhead

## Dependencies

- Git installed on VM
- Node.js/TypeScript for queue scripts
- jq for JSON parsing in bash
- systemd for service management (VM)
- `.claudeagent` files for all agents

## Effort Estimate

- Phase 1 (Scripts): 2-3 hours
- Phase 2 (Integration): 1-2 hours
- Phase 3 (VM Setup): 1-2 hours (Devon, VM access required)
- Phase 4 (Testing): 1 hour
- **Total:** 5-8 hours (2-3 sessions)

## Success Metrics

**Week 1 (Queue System):**
- Queue generates successfully from roadmap
- Workers select tasks correctly
- 0 schema errors

**Week 2 (Parallel Execution):**
- 3 workers run concurrently without git conflicts
- >80% substantive work (vs overhead)
- <5% duplicate work

**Week 3 (Agent Personalities):**
- Workers adopt correct context (Roy for simulation, Devon for infra)
- Agent memory system integration working
- Quality of work improves (specialists vs generalists)

## Next Steps

1. ✅ Create this design document
2. ⏳ Implement Phase 1 scripts (this session)
3. ⏳ Test queue generation locally
4. ⏳ Update autonomous-worker.sh for queue integration
5. ⏳ Hand off to Devon for VM deployment
