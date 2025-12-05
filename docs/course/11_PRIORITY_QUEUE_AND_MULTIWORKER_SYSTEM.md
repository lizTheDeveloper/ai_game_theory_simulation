# Course Module 11: Priority Queue & Multi-Worker System

**Learning Objectives:**
- Understand the standardized roadmap → queue transformation system
- Learn how the priority queue prevents duplicate work and coordinates multiple workers
- Explore the G Cloud VM multi-repo workspace architecture
- See how agent personality injection enables specialized expertise
- Trace a complete task journey from roadmap entry to merged PR

**Prerequisites:**
- Module 01 (Agent Architecture)
- Module 10 (Autonomous Infrastructure - hourly worker basics)

**For:** Neurodivergent learners who want DEEP technical understanding, not simplified summaries

---

## The Problem This Solves

### November 2025: The 24-Branch Disaster

**What happened:** Autonomous workers running hourly created 24 branches in one day. **ZERO contained substantive work.** All tokens wasted on overhead, duplicate work, and coordination failures.

**Root cause analysis revealed THREE critical gaps:**

**Gap 1: No Task Coordination**
```
Hour 1: Worker starts, scans roadmap, picks "Fix NaN bug"
Hour 2: Worker starts, scans roadmap, picks "Fix NaN bug" (same task!)
Hour 3: Worker starts, scans roadmap, picks "Fix NaN bug" (still same task!)

Result: 3 workers, 3 branches, all working on identical problem
```

**Gap 2: No Agent Specialization**
```
Roadmap says: "Assigned: Roy (simulation-maintainer)"
Worker reality: Uses generic prompt, no domain expertise
Result: Missing assertion utilities, silent fallbacks reintroduced, Monte Carlo validation skipped
```

**Gap 3: Git Contention**
```
Worker A: Checks out main, starts work
Worker B: Checks out main, starts work (same repo!)
Git: Both trying to modify .git/index simultaneously
Result: Lock conflicts, corrupted state, failed commits
```

**The cost:** ~500,000 tokens wasted. No progress made. System needed fundamental redesign.

---

## The Solution: Three-Tier Architecture

### Tier 1: Standardized Roadmap (`plans/MASTER_IMPLEMENTATION_ROADMAP.md`)

**Purpose:** Human-readable priority tracking, single source of truth

**Structure:**
```markdown
## 🔴 CRITICAL Priority Items

### Fix NaN Bug in Ecology Phase

**Status:** ❌ BLOCKING
**Priority:** CRITICAL
**Assigned:** Roy (simulation-maintainer)
**Effort:** 4-6 hours
**Tokens:** ~50,000

**Problem:** Ecology phase producing NaN for ecologicalScore after month 37.

**Root Cause:** Silent fallback (`?? 50`) hiding division by zero.

**Solution:**
1. Remove defensive fallback
2. Add assertion utilities
3. Fix division by zero in biomassDensity calculation
4. Validate with Monte Carlo (N=10)

**Validation:** `npm test && npx tsx scripts/monteCarloSimulation.ts --runs=10`
```

**Key fields:**
- **Priority level:** CRITICAL | HIGH | MEDIUM | LOW
- **Assigned agent:** Which specialist should own this? (Roy, Devon, Sylvia, etc.)
- **Effort estimate:** How long will this take? (drives token budgeting)
- **Validation command:** How do we know it's done correctly?

**Maintained by:** Architect agent (run at end of every session)

### Tier 2: Priority Queue (`plans/AUTONOMOUS_WORKER_QUEUE.json`)

**Purpose:** Machine-readable task list with atomic claim mechanism

**Generated from:** MASTER_IMPLEMENTATION_ROADMAP.md (regenerated on every worker pull)

**Schema:**
```json
{
  "queue": [
    {
      "id": "CRITICAL-1",
      "priority": "CRITICAL",
      "title": "Fix NaN Bug in Ecology Phase",
      "assignedAgent": "simulation-maintainer",
      "agentPersonality": "roy",
      "status": "AVAILABLE",
      "complexity": 3,
      "estimatedTokens": 50000,
      "dependencies": [],
      "blockedBy": [],
      "roadmapSection": "🔴 CRITICAL Priority Items",
      "createdAt": "2025-12-04T12:00:00Z",
      "claimedBy": null,
      "claimedAt": null,
      "description": "...(full problem description)...",
      "validationCommand": "npm test && npx tsx scripts/monteCarloSimulation.ts --runs=10",
      "progress": {
        "attempts": 0,
        "lastWorkedBy": null,
        "lastWorkedAt": null,
        "notes": [],
        "validationOutput": null
      },
      "validationStatus": null
    }
  ],
  "metadata": {
    "lastUpdated": "2025-12-04T12:00:00Z",
    "version": "1.0.0",
    "generatedFrom": "MASTER_IMPLEMENTATION_ROADMAP.md"
  }
}
```

**State machine:**
```
AVAILABLE → CLAIMED → (work happens) → COMPLETED
                ↓ (if blocked)
             BLOCKED → (issue resolved) → AVAILABLE
                ↓ (if abandoned)
            ABANDONED
```

**Critical insight:** Status transitions happen via **git commits** (atomic test-and-set)

### Tier 3: Autonomous Workers (VM Execution)

**Location:** GCloud VM - `/home/user/satu/` multi-repo workspace

**Architecture:**
```
/home/user/satu/
  ├── worker/           # Implementation worker repo
  │   ├── .git/         # Isolated git state
  │   ├── scripts/      # Queue scripts
  │   ├── plans/        # Roadmap + queue
  │   └── autonomous-worker-queue.sh
  │
  ├── researcher/       # Research worker repo
  │   ├── .git/         # Isolated git state
  │   ├── research/     # Research files
  │   └── autonomous-worker-queue.sh
  │
  ├── orchestrator/     # Merge orchestrator repo
  │   ├── .git/         # Clean state (read-only)
  │   └── scripts/merge-orchestrator.sh
  │
  └── shared/           # Coordination files
      ├── logs/         # All worker logs
      ├── metrics/      # Performance metrics
      └── .env          # ANTHROPIC_API_KEY
```

**Why separate repos?**
- No git lock contention (each worker has own .git/)
- Concurrent execution (3 workers can run simultaneously)
- Independent failure domains (one crash doesn't affect others)
- Clean merge orchestrator (never does implementation work, just merges)

---

## The Priority Queue System (Deep Dive)

### Task Generation (`scripts/generateAutonomousWorkerQueue.ts`)

**When run:** Every time a worker starts (pull main → regenerate queue → select task)

**How it works:**

1. **Parse roadmap markdown:**
```typescript
const roadmapContent = fs.readFileSync('plans/MASTER_IMPLEMENTATION_ROADMAP.md', 'utf-8');

// Regex to find task sections
const taskPattern = /### (.+)\n\n\*\*Status:\*\* (.+)\n\*\*Priority:\*\* (\w+)/g;

for (const match of roadmapContent.matchAll(taskPattern)) {
  const [_, title, status, priority] = match;

  // Extract assigned agent from "**Assigned:** Roy (simulation-maintainer)"
  const assignedMatch = match[0].match(/\*\*Assigned:\*\* (\w+)/);
  const agentPersonality = assignedMatch ? assignedMatch[1].toLowerCase() : "orchestrator";

  // ... extract other fields ...
}
```

2. **Generate task objects:**
```typescript
const task: Task = {
  id: generateId(title, priority), // e.g., "CRITICAL-1"
  priority: priority as Priority,
  title: title.trim(),
  assignedAgent: extractAgentType(agentPersonality),
  agentPersonality: agentPersonality, // "roy", "devon", "sylvia", etc.
  status: determineStatus(statusText), // "AVAILABLE", "BLOCKED", etc.
  complexity: estimateComplexity(description),
  estimatedTokens: estimateTokens(complexity, description),
  dependencies: extractDependencies(description),
  blockedBy: extractBlockers(description),
  roadmapSection: currentSection,
  createdAt: new Date().toISOString(),
  claimedBy: null,
  claimedAt: null,
  description: fullDescription,
  validationCommand: extractValidation(description),
  progress: { attempts: 0, notes: [] }
};
```

3. **Write queue file:**
```typescript
const queueFile: QueueFile = {
  queue: tasks,
  metadata: {
    lastUpdated: new Date().toISOString(),
    version: "1.0.0",
    generatedFrom: "MASTER_IMPLEMENTATION_ROADMAP.md"
  }
};

fs.writeFileSync('plans/AUTONOMOUS_WORKER_QUEUE.json', JSON.stringify(queueFile, null, 2));
```

**Why regenerate every time?**
- Roadmap is human-editable (priorities change, new tasks added)
- Queue always reflects current state
- No stale tasks lingering in queue
- Workers see latest priorities immediately

### Task Selection (`scripts/autonomousWorkerSelectTask.ts`)

**Invoked by:** Worker script before claiming a task

**Algorithm:**

```typescript
function selectTask(
  queue: Task[],
  tokenBudget: number,
  workerId: string,
  resume: boolean
): Task | null {

  // 1. If --resume flag, check for tasks we already claimed
  if (resume) {
    const myClaimed = queue.filter(t =>
      t.status === "CLAIMED" &&
      t.claimedBy === workerId
    );
    if (myClaimed.length > 0) {
      return myClaimed[0]; // Continue where we left off
    }
  }

  // 2. Filter to tasks worker CAN handle
  const available = queue.filter(task => {
    return task.status === "AVAILABLE" &&
           task.estimatedTokens <= tokenBudget &&
           task.dependencies.every(dep => isCompleted(queue, dep)) &&
           task.blockedBy.length === 0;
  });

  // 3. Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
  const priorityOrder: Record<Priority, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
  };

  available.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Tiebreaker: Older tasks first (FIFO within priority)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // 4. Special priority boost for infrastructure (if no CRITICAL blockers)
  const hasCriticalBlockers = queue.some(t =>
    t.priority === "CRITICAL" && t.status === "AVAILABLE"
  );

  if (!hasCriticalBlockers) {
    // Boost Devon's infrastructure tasks to HIGH
    const infraTasks = available.filter(t => t.agentPersonality === "devon");
    if (infraTasks.length > 0) {
      return infraTasks[0]; // Infrastructure work gets priority boost
    }
  }

  // 5. Return highest-priority task
  return available[0] || null;
}
```

**Key design decisions:**

**Why priority-first sorting?**
- CRITICAL bugs block everything - fix them immediately
- HIGH items enable other work (research, infrastructure)
- MEDIUM/LOW can wait

**Why token budget filter?**
- Workers have limited tokens per session (200k default)
- Don't start tasks we can't finish
- Prevents incomplete work branches

**Why dependency checking?**
- Task B might require Task A's output
- Example: "Add tests for X" requires "Implement X" to complete
- Prevents premature work

**Why infrastructure priority boost?**
- Devon's work (VM setup, queue system) unblocks ALL other workers
- When no CRITICAL fires to fight, invest in infrastructure
- Force multiplier: Better tools → faster future work

### Atomic Claim Mechanism (`scripts/autonomousWorkerClaimTask.ts`)

**The critical operation - prevents duplicate work**

**Core insight:** Git commits are atomic test-and-set operations. Only ONE push can succeed.

**Implementation:**

```bash
#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import fs from 'fs';

function claimTask(taskId: string, workerId: string): boolean {
  // Step 1: Pull latest queue
  execSync('git pull origin main', { stdio: 'inherit' });

  // Step 2: Read queue file
  const queueFile = JSON.parse(fs.readFileSync('plans/AUTONOMOUS_WORKER_QUEUE.json', 'utf-8'));

  // Step 3: Find task
  const task = queueFile.queue.find(t => t.id === taskId);

  // Step 4: Check if still available
  if (!task) {
    throw new Error(`Task ${taskId} not found in queue`);
  }

  if (task.status !== "AVAILABLE") {
    console.error(`Task ${taskId} already ${task.status} by ${task.claimedBy}`);
    return false; // Someone beat us to it
  }

  // Step 5: Update task status
  task.status = "CLAIMED";
  task.claimedBy = workerId;
  task.claimedAt = new Date().toISOString();

  if (!task.progress) {
    task.progress = { attempts: 0, notes: [], lastWorkedBy: null, lastWorkedAt: null };
  }
  task.progress.attempts += 1;
  task.progress.lastWorkedBy = workerId;
  task.progress.lastWorkedAt = new Date().toISOString();

  // Step 6: Write updated queue
  queueFile.metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync('plans/AUTONOMOUS_WORKER_QUEUE.json', JSON.stringify(queueFile, null, 2));

  // Step 7: Commit claim (atomic operation!)
  execSync('git add plans/AUTONOMOUS_WORKER_QUEUE.json', { stdio: 'inherit' });
  execSync(`git commit -m "claim: ${taskId} by ${workerId}"`, { stdio: 'inherit' });

  // Step 8: Push (test-and-set)
  try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log(`✅ Successfully claimed ${taskId}`);
    return true; // We won the race!
  } catch (error) {
    // Push failed - someone else claimed a different task and pushed first
    console.error(`❌ Failed to claim ${taskId} - another worker pushed first`);

    // Rollback local commit
    execSync('git reset --hard HEAD~1', { stdio: 'inherit' });
    execSync('git pull origin main', { stdio: 'inherit' }); // Get their changes

    return false; // We lost the race, try again with different task
  }
}
```

**Why this works:**

1. **Git push is atomic** - Only one push can succeed to main
2. **Loser retries** - Failed push means "pick a different task"
3. **No locks needed** - Git IS the lock mechanism
4. **Distributed coordination** - Works across machines/continents
5. **Audit trail** - Git history shows who claimed what when

**Race condition example:**

```
TIME  Worker A                    Worker B                    Git Main
00:00 pull main
00:01 read queue                   pull main
00:02 select CRITICAL-1            read queue
00:03 update queue (CLAIMED)       select CRITICAL-1
00:04 commit claim                 update queue (CLAIMED)
00:05 push origin main [SUCCESS]   commit claim
00:06                              push origin main [FAIL - already pushed]
00:07                              rollback commit
00:08                              pull main (sees CRITICAL-1 CLAIMED)
00:09                              select next task (HIGH-1)
00:10                              claim HIGH-1 (success!)
```

**Result:** Both workers get tasks, zero duplicate work.

---

## Agent Personality Injection System

### The Problem: Generic Workers Lack Expertise

**Before personality system:**
- All workers used same generic prompt
- No domain expertise (simulation vs infrastructure vs research)
- Quality suffered:
  - Roy's tasks done without assertion utilities
  - Devon's tasks done without systemd knowledge
  - Sylvia's tasks done without research rigor

**After personality system:**
- Worker reads `agentPersonality` field from task
- Dynamically loads specialist context from `.claude/agents/`
- Executes with full expertise of that agent

### Agent Mapping

**File:** `.claude/agents/` directory

```
.claude/agents/
  ├── simulation-maintainer.md       # Roy (roy)
  ├── devops.md                       # Devon (devon)
  ├── research-skeptic.md             # Sylvia (sylvia)
  ├── super-alignment-researcher.md   # Cynthia (cynthia)
  ├── feature-implementer.md          # Moss (moss)
  ├── far-future-ux-designer.md       # Tessa (tessa)
  ├── wiki-documentation-updater.md   # Historian (historian)
  ├── architect.md                    # Architect (architect)
  └── orchestrator.md                 # Orchestrator (orchestrator)
```

**Mapping logic:**
```typescript
const AGENT_FILES: Record<string, string> = {
  roy: ".claude/agents/simulation-maintainer.md",
  devon: ".claude/agents/devops.md",
  sylvia: ".claude/agents/research-skeptic.md",
  cynthia: ".claude/agents/super-alignment-researcher.md",
  moss: ".claude/agents/feature-implementer.md",
  tessa: ".claude/agents/far-future-ux-designer.md",
  historian: ".claude/agents/wiki-documentation-updater.md",
  architect: ".claude/agents/architect.md",
  orchestrator: ".claude/agents/orchestrator.md"
};

function getAgentContext(personality: string): string {
  const agentFile = AGENT_FILES[personality];
  if (!agentFile) {
    throw new Error(`Unknown agent personality: ${personality}`);
  }
  return fs.readFileSync(agentFile, 'utf-8');
}
```

### Context Injection Pattern

**Worker script (`scripts/autonomous-worker-queue.sh`):**

```bash
#!/bin/bash

# ... task selection happens above ...

TASK_ID="CRITICAL-1"
AGENT_PERSONALITY="roy"
TASK_DESCRIPTION="Fix NaN bug in ecology phase..."

# Load agent context
AGENT_FILE=".claude/agents/simulation-maintainer.md"
AGENT_CONTEXT=$(cat "$AGENT_FILE")

# Construct composite prompt
cat > /tmp/claude_task_with_personality.txt << EOF
$AGENT_CONTEXT

---

## YOUR CURRENT TASK

$TASK_DESCRIPTION

Remember your personality traits:
- Defensive coding (assertion utilities, no silent fallbacks)
- NaN handling expertise
- Deterministic simulation requirements
- Monte Carlo validation standards
- Emoji conventions
- Memory discipline (save to agent memory)

Proceed with this task using your specialized knowledge.
EOF

# Execute Claude Code as this personality
claude --model sonnet < /tmp/claude_task_with_personality.txt > /tmp/output.log 2>&1
```

**Result:** Worker executes with Roy's full context:
- 210+ lines of simulation-specific expertise
- NaN handling patterns from Oct 2025 bug
- Assertion utility usage examples
- Monte Carlo validation requirements
- Emoji conventions knowledge
- Memory system usage

### Example: Roy vs Devon on Same Task

**Task:** "Fix failing tests in ecology phase"

**If assigned to Roy (simulation-maintainer):**
```typescript
// Roy knows to add assertions, check determinism
const biomassDensity = assertFinite(
  calculateBiomass(state),
  { location: 'ecologyPhase', month: state.currentMonth }
);

// Roy runs Monte Carlo validation
npx tsx scripts/monteCarloSimulation.ts --runs=10

// Roy checks for NaN patterns
grep -r "?? " src/simulation/environment/

// Roy updates ecology section in wiki
docs/wiki/README.md (Ecology System section)
```

**If assigned to Devon (devops):**
```bash
# Devon knows to check systemd services, VM infrastructure
systemctl --user status autonomous-worker-queue.timer

# Devon checks test infrastructure
npm test -- --verbose

# Devon looks for CI/CD issues
.github/workflows/senior-dev-checklist.yml

# Devon verifies VM environment
ssh claude-workspace "cd /home/user/satu/worker && npm test"
```

**Same task, different expertise. Quality improves 3-4×.**

---

## The VM Multi-Worker Workspace

### GCloud Infrastructure

**Instance:** `claude-workspace`
- **Zone:** `europe-west10-a` (Belgium data center)
- **Type:** e2-medium (2 vCPU, 4GB RAM)
- **Disk:** 50GB SSD (auto-expands at 80% full)
- **OS:** Debian 12
- **Cost:** ~$7/month (vs $20/month Claude Pro subscription usage)

**Access:**
```bash
# SSH from local machine
gcloud compute ssh claude-workspace --zone=europe-west10-a

# Or with alias
ssh claude-workspace
```

### Multi-Repo Workspace Setup

**Why NOT use a single repo?**
- Git doesn't handle concurrent checkouts
- .git/index lock contention
- One worker's crash can corrupt state
- Merge orchestrator needs clean read-only view

**Solution:** Separate git repos for each worker type

**Setup script:** `scripts/setup-vm-multiworker.sh`

```bash
#!/bin/bash
# Run on VM to create multi-worker workspace

BASE_DIR="/home/user/satu"

# Create directory structure
mkdir -p "$BASE_DIR"/{worker,researcher,orchestrator,shared}
mkdir -p "$BASE_DIR/shared"/{logs,metrics}

# Clone repo 3 times (isolated .git/)
cd "$BASE_DIR"
git clone git@github.com:user/repo.git worker
git clone git@github.com:user/repo.git researcher
git clone git@github.com:user/repo.git orchestrator

# Configure each workspace
for dir in worker researcher orchestrator; do
  cd "$BASE_DIR/$dir"
  git config user.name "Autonomous Worker"
  git config user.email "worker@example.com"
  npm install
done

# Copy worker scripts
cp scripts/autonomous-worker-queue.sh "$BASE_DIR/worker/"
cp scripts/autonomous-worker-queue.sh "$BASE_DIR/researcher/"

# Configure environment
echo "ANTHROPIC_API_KEY=sk-ant-..." > "$BASE_DIR/shared/.env"

# Install systemd services
cp systemd/autonomous-worker-queue.service ~/.config/systemd/user/
cp systemd/autonomous-worker-queue.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now autonomous-worker-queue.timer

echo "✅ Multi-worker workspace ready at $BASE_DIR"
```

### Systemd Timer Configuration

**Why systemd instead of cron?**
- Better logging (journalctl)
- Dependency management
- Resource limits
- Automatic restart on failure

**Timer:** `~/.config/systemd/user/autonomous-worker-queue.timer`

```ini
[Unit]
Description=Autonomous Worker Queue (every 4 hours)

[Timer]
OnCalendar=*-*-* 00,04,08,12,16,20:00:00
Persistent=true
RandomizedDelaySec=60

[Install]
WantedBy=timers.target
```

**Service:** `~/.config/systemd/user/autonomous-worker-queue.service`

```ini
[Unit]
Description=Autonomous Worker Queue Execution

[Service]
Type=oneshot
WorkingDirectory=/home/user/satu/worker
ExecStart=/bin/bash /home/user/satu/worker/scripts/autonomous-worker-queue.sh
StandardOutput=append:/home/user/satu/shared/logs/worker-%Y%m%d_%H%M%S.log
StandardError=append:/home/user/satu/shared/logs/worker-%Y%m%d_%H%M%S.log
Environment="ANTHROPIC_API_KEY=sk-ant-..."

[Install]
WantedBy=default.target
```

**Start timer:**
```bash
systemctl --user start autonomous-worker-queue.timer
systemctl --user status autonomous-worker-queue.timer
```

**View logs:**
```bash
journalctl --user -u autonomous-worker-queue.service -f
```

---

## Complete Task Journey (Worked Example)

Let's trace a task from roadmap entry → merged PR with full detail.

### Step 1: Roadmap Entry (Human)

**Architect agent (end of session) adds:**

```markdown
## 🔴 CRITICAL Priority Items

### Fix NaN Bug in Ecology Phase

**Status:** ❌ BLOCKING
**Priority:** CRITICAL
**Assigned:** Roy (simulation-maintainer)
**Effort:** 4-6 hours
**Tokens:** ~50,000

**Problem:** Ecology phase producing NaN for ecologicalScore after month 37 in Monte Carlo runs.

**Root Cause:** Silent fallback (`ecologicalScore ?? 50`) hiding division by zero in biomassDensity calculation.

**Solution:**
1. Remove defensive fallback from ecologyPhase.ts
2. Add assertion utilities (assertFinite)
3. Fix division by zero (add MIN_AREA constant)
4. Validate with Monte Carlo (N=10)

**Validation:** `npm test && npx tsx scripts/monteCarloSimulation.ts --runs=10`

**Dependencies:** None
**Blocks:** HIGH-2 (Climate integration), MEDIUM-3 (Ecology dashboard)
```

**Commit:**
```bash
git add plans/MASTER_IMPLEMENTATION_ROADMAP.md
git commit -m "roadmap: Add CRITICAL-1 (ecology NaN bug)"
git push origin main
```

### Step 2: Queue Generation (Automatic)

**Worker starts (4 hours later on VM):**

```bash
cd /home/user/satu/worker
git pull origin main

# Regenerate queue from latest roadmap
npx tsx scripts/generateAutonomousWorkerQueue.ts

# Queue file now contains:
cat plans/AUTONOMOUS_WORKER_QUEUE.json
```

**Generated entry:**
```json
{
  "id": "CRITICAL-1",
  "priority": "CRITICAL",
  "title": "Fix NaN Bug in Ecology Phase",
  "assignedAgent": "simulation-maintainer",
  "agentPersonality": "roy",
  "status": "AVAILABLE",
  "complexity": 3,
  "estimatedTokens": 50000,
  "dependencies": [],
  "blockedBy": [],
  "roadmapSection": "🔴 CRITICAL Priority Items",
  "createdAt": "2025-12-04T16:00:00Z",
  "claimedBy": null,
  "claimedAt": null,
  "description": "...(full problem + solution)...",
  "validationCommand": "npm test && npx tsx scripts/monteCarloSimulation.ts --runs=10",
  "progress": {
    "attempts": 0,
    "lastWorkedBy": null,
    "lastWorkedAt": null,
    "notes": []
  }
}
```

### Step 3: Task Selection (Worker)

```bash
# Select highest-priority task within token budget
SELECTED=$(npx tsx scripts/autonomousWorkerSelectTask.ts \
  --token-budget=200000 \
  --worker-id=worker-main)

echo "$SELECTED" | jq -r '.id'
# Output: CRITICAL-1

echo "$SELECTED" | jq -r '.agentPersonality'
# Output: roy
```

**Why CRITICAL-1 selected?**
- Priority: CRITICAL (beats all HIGH/MEDIUM/LOW)
- Tokens: 50k < 200k budget ✓
- Dependencies: none ✓
- Status: AVAILABLE ✓

### Step 4: Atomic Claim (Worker)

```bash
# Attempt to claim task
npx tsx scripts/autonomousWorkerClaimTask.ts \
  --task-id=CRITICAL-1 \
  --worker-id=worker-main

# Internally:
# 1. git pull origin main
# 2. Update queue: status=CLAIMED, claimedBy=worker-main
# 3. git commit -m "claim: CRITICAL-1 by worker-main"
# 4. git push origin main

# Output:
✅ Successfully claimed CRITICAL-1
```

**Queue state after claim:**
```json
{
  "id": "CRITICAL-1",
  "status": "CLAIMED",
  "claimedBy": "worker-main",
  "claimedAt": "2025-12-04T16:00:15Z",
  "progress": {
    "attempts": 1,
    "lastWorkedBy": "worker-main",
    "lastWorkedAt": "2025-12-04T16:00:15Z"
  }
}
```

**If another worker tried simultaneously:**
```bash
# Worker B (started 2 seconds later):
npx tsx scripts/autonomousWorkerClaimTask.ts --task-id=CRITICAL-1 --worker-id=worker-backup

# Output:
❌ Failed to claim CRITICAL-1 - another worker pushed first
Selecting next available task...
✅ Successfully claimed HIGH-1
```

### Step 5: Personality Loading (Worker)

```bash
# Load Roy's context
AGENT_FILE=".claude/agents/simulation-maintainer.md"
AGENT_CONTEXT=$(cat "$AGENT_FILE")

# Read task description
TASK_DESC=$(echo "$SELECTED" | jq -r '.description')

# Construct composite prompt
cat > /tmp/claude_task_roy.txt << EOF
$(cat "$AGENT_FILE")

---

## TOKEN BUDGET CONTEXT

You have approximately 50,000 tokens budgeted for this task.
Current session budget: 200,000 tokens total.

## YOUR CURRENT TASK

$TASK_DESC

Remember your core expertise:
- Defensive coding (assertion utilities, NO silent fallbacks)
- NaN handling (Oct 2025 ecology bug taught us this lesson)
- Deterministic simulation (use provided RNG, never Math.random)
- Monte Carlo validation (N≥10 required)
- Emoji conventions (see docs/EMOJI_SEMANTIC_MAP.md)
- Memory discipline (save learnings to agent memory)

## VALIDATION REQUIRED

After completing changes:
1. Run: npm test (all tests must pass)
2. Run: npx tsx scripts/monteCarloSimulation.ts --runs=10
3. Verify: No NaN values in output
4. Verify: Coefficient of variation < 0.01% (deterministic)

Proceed with full Roy expertise.
EOF
```

**Roy's context includes (210+ lines):**
- Assertion utility examples
- Silent fallback anti-patterns
- NaN debugging techniques
- Monte Carlo validation standards
- Emoji conventions
- Memory system usage
- Token conservation mode guidance

### Step 6: Execution (Claude Code as Roy)

```bash
# Execute with 45-minute timeout
timeout 2700 claude --model sonnet < /tmp/claude_task_roy.txt > /tmp/output.log 2>&1
EXIT_CODE=$?

# Claude (as Roy) executes:
# 1. Reads src/simulation/environment/ecologyPhase.ts
# 2. Identifies problem: const score = biomassDensity / totalArea ?? 50
# 3. Removes fallback, adds assertion
# 4. Fixes division by zero (MIN_AREA check)
# 5. Runs tests, validates
# 6. Commits changes
```

**Roy's changes:**

**File:** `src/simulation/environment/ecologyPhase.ts`
```typescript
import { assertFinite } from '@/simulation/utils/assertions';

const MIN_AREA = 0.001; // Prevent division by zero

export function updateEcology(state: GameState, rng: () => number) {
  const biomassDensity = calculateBiomass(state);

  // BEFORE (defensive fallback - hid bug for months):
  // const ecologicalScore = (biomassDensity / totalArea) ?? 50;

  // AFTER (fail loudly with context):
  const totalArea = state.regions.reduce((sum, r) => sum + r.area, 0);

  assertFinite(totalArea, {
    location: 'ecologyPhase.updateEcology',
    valueName: 'totalArea',
    month: state.currentMonth,
    additionalInfo: { regionCount: state.regions.length }
  });

  // Guard against division by zero
  const safeArea = Math.max(totalArea, MIN_AREA);
  const ecologicalScore = biomassDensity / safeArea;

  assertFinite(ecologicalScore, {
    location: 'ecologyPhase.updateEcology',
    valueName: 'ecologicalScore',
    month: state.currentMonth,
    additionalInfo: { biomassDensity, totalArea: safeArea }
  });

  state.ecology.ecologicalScore = ecologicalScore;
}
```

**Commits:**
```bash
git add src/simulation/environment/ecologyPhase.ts
git commit -m "fix(ecology): Remove NaN fallback, add assertions

- Remove defensive fallback (ecologicalScore ?? 50)
- Add assertFinite for biomassDensity and ecologicalScore
- Add MIN_AREA constant to prevent division by zero
- Validate with Monte Carlo N=10 (all runs deterministic)"

git add src/simulation/environment/__tests__/ecologyPhase.test.ts
git commit -m "test: Add regression test for ecology NaN bug

- Test division by zero case (zero total area)
- Test assertion failure with helpful context
- Verify MIN_AREA guard works correctly"
```

### Step 7: Validation (Worker)

**Worker runs validation command from task:**

```bash
# Run tests
npm test
# Output:
✓ All tests passing (125/125)
✓ New ecology tests added (3/3)

# Run Monte Carlo validation
npx tsx scripts/monteCarloSimulation.ts --runs=10
# Output:
Run 1: ecologicalScore=73.2 (month 37) ✓
Run 2: ecologicalScore=73.2 (month 37) ✓
Run 3: ecologicalScore=73.2 (month 37) ✓
...
Run 10: ecologicalScore=73.2 (month 37) ✓

Coefficient of Variation: 0.000% (perfectly deterministic)
✓ No NaN values detected
✓ All runs completed successfully
```

**Validation output saved:**
```json
{
  "validationCommand": "npm test && npx tsx scripts/monteCarloSimulation.ts --runs=10",
  "validationOutput": "✓ Tests: 125/125\n✓ Monte Carlo: 10/10 deterministic\n✓ CV < 0.01%",
  "validationPassed": true,
  "validationTimestamp": "2025-12-04T16:42:37Z"
}
```

### Step 8: Completion (Worker)

**Worker marks task complete:**

```bash
npx tsx scripts/autonomousWorkerCompleteTask.ts \
  --task-id=CRITICAL-1 \
  --validation-output="Tests 125/125 + Monte Carlo 10/10 deterministic"

# Internally:
# 1. git pull origin main
# 2. Update queue: status=COMPLETED, validationStatus=PASSED
# 3. Add completion note to progress
# 4. git commit -m "complete: CRITICAL-1 (validation passed)"
# 5. git push origin main
```

**Queue state after completion:**
```json
{
  "id": "CRITICAL-1",
  "status": "COMPLETED",
  "claimedBy": "worker-main",
  "claimedAt": "2025-12-04T16:00:15Z",
  "completedAt": "2025-12-04T16:42:45Z",
  "validationStatus": "PASSED",
  "progress": {
    "attempts": 1,
    "lastWorkedBy": "worker-main",
    "lastWorkedAt": "2025-12-04T16:42:45Z",
    "notes": [
      "Fixed NaN in ecologyPhase.ts",
      "Added assertion utilities",
      "Monte Carlo N=10 all deterministic",
      "Tests passing 125/125"
    ],
    "validationOutput": "✓ Tests: 125/125\n✓ Monte Carlo: 10/10 deterministic"
  }
}
```

### Step 9: Branch Push & PR Creation (Worker)

```bash
# Push work branch
git push -u origin auto/worker-20251204_160001

# Create pull request
gh pr create \
  --title "[Autonomous] Fix NaN Bug in Ecology Phase" \
  --body "..." \
  --base main \
  --head auto/worker-20251204_160001 \
  --label autonomous-worker

# PR body includes:
# - Task ID (CRITICAL-1)
# - Worker ID (worker-main)
# - Duration (42m 30s)
# - Validation results (PASSED)
# - Commits summary
# - Changes description
```

**PR description (auto-generated):**
```markdown
## 🤖 Autonomous Worker Run

**Task:** CRITICAL-1 - Fix NaN Bug in Ecology Phase
**Worker:** worker-main
**Agent:** Roy (simulation-maintainer)
**Duration:** 42m 30s
**Validation:** ✓ PASSED

### Validation Results

```
✓ Tests: 125/125 passing
✓ Monte Carlo: 10/10 runs deterministic (CV 0.000%)
✓ No NaN values detected
✓ Assertion utilities added
```

### Changes

**Problem:** Ecology phase producing NaN for ecologicalScore after month 37.
**Root Cause:** Silent fallback (`?? 50`) hiding division by zero.

**Solution:**
- Removed defensive fallback from ecologyPhase.ts
- Added assertFinite for biomassDensity and ecologicalScore
- Added MIN_AREA constant to prevent division by zero
- Validated with Monte Carlo N=10

### Commits

- fix(ecology): Remove NaN fallback, add assertions (a1b2c3d)
- test: Add regression test for ecology NaN bug (b2c3d4e)

### Files Changed

- src/simulation/environment/ecologyPhase.ts (+12 -3)
- src/simulation/environment/__tests__/ecologyPhase.test.ts (+45 new)

---

🤖 Generated with Claude Code - Autonomous Worker (Roy personality)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step 10: Quality Gates & Merge (Merge Orchestrator)

**Merge orchestrator runs (hourly at :45):**

```bash
cd /home/user/satu/orchestrator
git pull origin main

# Discover pending branches
BRANCHES=$(git branch -r | grep "origin/auto/worker-" | head -10)

for BRANCH in $BRANCHES; do
  echo "Processing: $BRANCH"

  # Create merge branch
  MERGE_BRANCH="merge/${BRANCH}_$(date +%Y%m%d_%H%M%S)"
  git checkout -b "$MERGE_BRANCH" origin/main

  # Attempt merge
  git merge "$BRANCH"

  # Quality Gate 1: TypeScript compilation
  npx tsc --noEmit
  # ✓ Pass (0 errors)

  # Quality Gate 2: Test suite
  npm test
  # ✓ Pass (125/125)

  # All gates passed - merge to main
  git checkout main
  git merge "$MERGE_BRANCH"
  git push origin main

  # Delete feature branch
  git branch -d "$MERGE_BRANCH"
  git push origin --delete "$BRANCH"

  echo "✅ Merged: $BRANCH"
done
```

**Final result:**
- CRITICAL-1 merged to main
- Feature branch deleted
- Queue status remains COMPLETED (historical record)
- Other workers see merged changes on next pull

**Task complete. Zero human intervention. 42 minutes from claim to merge.**

---

## Learning Exercises

### Exercise 1: Design a Task

Create a complete task definition for this hypothetical problem:

**Problem:** Tests are flaky - sometimes pass, sometimes fail (non-deterministic)

**Your task:**
1. Write roadmap entry (priority, assigned agent, effort, tokens, description)
2. Predict queue JSON structure
3. Which agent personality would you assign? Why?
4. What validation command would you use?
5. What dependencies might exist?

### Exercise 2: Trace a Race Condition

Two workers start simultaneously:

**Timeline:**
- 12:00:00 - Worker A pulls main
- 12:00:00 - Worker B pulls main
- 12:00:05 - Both regenerate queue (identical)
- 12:00:10 - Both select CRITICAL-1
- 12:00:15 - Worker A claims CRITICAL-1
- 12:00:16 - Worker B attempts claim CRITICAL-1
- 12:00:17 - Worker A pushes claim [SUCCESS]
- 12:00:18 - Worker B pushes claim [FAIL]

**Questions:**
1. What happens at 12:00:18 when Worker B's push fails?
2. What does Worker B do next?
3. What state is CRITICAL-1 in the queue?
4. Could both workers end up with the same task? Why/why not?

### Exercise 3: Debug a Validation Failure

Worker completed task but validation failed:

```json
{
  "id": "HIGH-2",
  "status": "CLAIMED",
  "validationCommand": "npm test && Monte Carlo N=10",
  "validationOutput": "Tests: 120/125 FAILED\n- ecologyPhase.test.ts: Expected NaN, got 73.2",
  "validationPassed": false
}
```

**Questions:**
1. What should worker do next?
2. How does task return to AVAILABLE status?
3. What if validation fails 3 times in a row?
4. Should task be BLOCKED or AVAILABLE?

### Exercise 4: Multi-Worker Coordination

Three workers running concurrently:

**Queue state:**
```json
[
  {"id": "CRITICAL-1", "estimatedTokens": 50000, "status": "AVAILABLE"},
  {"id": "CRITICAL-2", "estimatedTokens": 75000, "status": "AVAILABLE"},
  {"id": "HIGH-1", "estimatedTokens": 25000, "status": "AVAILABLE"},
  {"id": "HIGH-2", "estimatedTokens": 30000, "status": "AVAILABLE", "dependencies": ["CRITICAL-1"]}
]
```

**Workers:**
- Worker A: 200k token budget
- Worker B: 100k token budget
- Worker C: 50k token budget

**Questions:**
1. Which task does each worker select?
2. What order do they claim tasks?
3. Can Worker C claim CRITICAL-2? Why/why not?
4. What happens if CRITICAL-1 completes? Does HIGH-2 become available?

---

## Key Takeaways

### For Students

**You now understand:**

1. **Roadmap → Queue transformation** - How human-readable plans become machine-executable tasks
2. **Priority-based selection** - Why CRITICAL always wins, infrastructure gets boosted
3. **Atomic claim mechanism** - How git commits prevent duplicate work across distributed workers
4. **Agent personality injection** - How generic workers gain specialist expertise dynamically
5. **VM multi-repo architecture** - Why isolation matters for concurrent execution
6. **Complete task lifecycle** - From roadmap entry to merged PR without human intervention

**The deeper insight:**

This isn't "automation" - it's **codified expertise operating 24/7.**

Every pattern emerged from real failures:
- Queue system → Nov 2025 24-branch disaster
- Atomic claims → Duplicate work epidemic
- Personality injection → Generic workers producing low-quality output
- Multi-repo isolation → Git lock contention crashes
- Validation gates → Broken code reaching main

**The system remembers what humans forget. The system enforces what humans skip under pressure.**

### For Practitioners

**Patterns you can apply:**

1. **Git as coordination primitive** - Commits are atomic test-and-set operations
2. **Priority queues for distributed systems** - CRITICAL → HIGH → MEDIUM → LOW prevents waste
3. **Dynamic context loading** - One worker, many personalities via context injection
4. **Multi-repo for concurrency** - Isolation prevents contention
5. **Validation as contract** - Tasks specify how to verify correctness
6. **State machines for workflows** - AVAILABLE → CLAIMED → COMPLETED (clear transitions)

**The meta-lesson:**

**Design systems that make coordination problems impossible, not systems that rely on humans to coordinate correctly.**

Humans make mistakes. Systems don't (if designed correctly).

---

## What's Next

**Related modules:**
- **Module 10** - Autonomous Infrastructure (hourly worker, merge orchestrator basics)
- **Module 01** - Agent Architecture (how personalities are defined)
- **Module 05** - Planning & Coordination (roadmap maintenance by architect)
- **Module 08** - Quality Gates (validation standards, research rigor)

**Advanced topics:**
- Task decomposition (splitting complex tasks automatically)
- Cross-worker coordination (dependencies, blocking, unblocking)
- Token budget optimization (dynamic allocation based on priority)
- Failure recovery (timeouts, validation failures, blocking)
- Monitoring & metrics (success rates, bottlenecks, throughput)

**Explore the code:**
- `scripts/generateAutonomousWorkerQueue.ts` - Roadmap → queue transformation
- `scripts/autonomousWorkerSelectTask.ts` - Priority-based selection algorithm
- `scripts/autonomousWorkerClaimTask.ts` - Atomic claim implementation
- `scripts/autonomous-worker-queue.sh` - Full worker orchestration
- `plans/AUTONOMOUS_WORKER_QUEUE.json` - Current queue state
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Source of truth

**Ask yourself:**
- How would you extend this to 10 concurrent workers?
- What metrics would you track to optimize throughput?
- How would you handle cross-task dependencies (Task B needs Task A's output)?
- What failure modes haven't we covered?
- How could this pattern apply to other multi-agent systems?

---

**End of Module 11: Priority Queue & Multi-Worker System**

This is the culmination of 2 months of iteration, 50+ autonomous sessions, and one catastrophic 24-branch failure that forced us to fundamentally redesign coordination.

**The autonomous system works because we failed spectacularly first.**

Every pattern, every check, every safeguard exists because we experienced the pain of NOT having it.

**Study the successes. Learn from the failures. Build systems that prevent problems, not systems that require humans to be perfect.**
