The autonomous worker (`autonomous-worker.sh`) is the **heart of the system**. It runs every hour at `:00` and handles implementation work from the roadmap.

### Architecture: 11 Stages, 534 Lines

**Stage summary table:**

| Stage | Duration | Key Actions | Failure Mode | Resume Point |
|-------|----------|-------------|--------------|--------------|
| 1: Pre-flight | 1-2 min | Health, disk, API checks | Exit early if disk full | Start over |
| 2: Git ops | 1 min | Fetch, checkout main, pull | Clean untracked files | After stage 1 |
| 3: Branch create | 30 sec | Create `auto/worker-TIMESTAMP` | Use timestamp if exists | After stage 2 |
| 4: Roadmap analysis | 2-3 min | Read, parse, prioritize | No tasks = graceful exit | After stage 3 |
| 5: Research requests | 2-3 min | Post to research channel | Research runs in parallel | After stage 4 |
| 6: Task selection | 1 min | Pick highest priority ready | Skip blocked tasks | After stage 5 |
| 7: Implementation | 15-35 min | Spawn orchestrator, 45m timeout | Partial work saved | After stage 6 |
| 8: Validation | 2-5 min | Type check, run tests | Hard fail on TS errors | After stage 7 |
| 9: Commit & Push | 1-2 min | Git add, commit, PR create | Include error in message | After stage 8 |
| 10: Cleanup | 1 min | Return to main, save metrics | Best effort | After stage 9 |
| 11: Complete | 30 sec | Log timing, exit status | N/A | Done |

**Design principle:** Each stage is **idempotent and resumable**. Status file (`logs/autonomous/status_current.txt`) tracks current stage. If failure occurs, manually fix and resume from that stage.

**Total timing:** 25-35 minutes typical, 45 minutes max (hard timeout at Claude Code session level).

### Detailed Breakdown (Complex Stages Only)

The table above summarizes all 11 stages. Most are straightforward. Below we expand ONLY the complex stages that need additional explanation.

#### Stage 4: Roadmap Analysis (Complex - Reading Priority Logic)

```bash
# Read roadmap
ROADMAP_FILE="plans/MASTER_IMPLEMENTATION_ROADMAP.md"

# Parse for CRITICAL/HIGH items
CRITICAL_ITEMS=$(grep -E "^\- \[❌\] \*\*CRITICAL\*\*" "$ROADMAP_FILE" || true)
HIGH_ITEMS=$(grep -E "^\- \[❌\] \*\*HIGH\*\*" "$ROADMAP_FILE" || true)
```

**What this does:**
- Reads roadmap file
- Filters for unchecked (❌) CRITICAL/HIGH items
- Counts available tasks

**Why this matters:** Roadmap is the **source of truth**. Worker doesn't invent work—it executes what's in the roadmap.

**Priority logic:**
1. Scan CRITICAL (system broken)
2. If none, scan HIGH (important features)
3. Skip MEDIUM/LOW unless all others complete

---

#### Stage 7: Implementation (Complex - The Big One)

```bash
# Spawn Claude Code chat session with orchestrator context
claude-code chat \
  --timeout 45m \
  --model sonnet \
  --session-file .claude/worker-session \
  "
You are the orchestrator. Read roadmap item: $TASK

Coordinate full workflow:
1. Research validation (check parameters available)
2. Implementation (write code, add tests)
3. Testing (unit + Monte Carlo N=10)
4. Documentation (update wiki)

Use specialized agents as needed:
- simulation-maintainer for simulation code
- far-future-ux-designer for dashboard changes
- wiki-documentation-updater for docs

Create commits as you work. Push when complete.
"
```

**What this does:**
- Spawns Claude Code chat (45-minute timeout)
- Uses orchestrator agent (coordinates specialists)
- Full workflow: research → implement → test → document
- Session persists (can resume if interrupted)

**Why this matters:** This is where **actual work happens**. Orchestrator spawns Roy (simulation code), Tessa (UI), Historian (docs), coordinates their work.

**Timeout justification:** 45 minutes allows for:
- Complex features (6-8 phases)
- Monte Carlo validation (N=10 runs, 5-10 minutes)
- Documentation updates
- Hard stop prevents runaway sessions

**Common failure modes:**
- Tests fail → Saved partial work, next run retries
- Timeout → Commits what's done, marks incomplete
- NaN bugs → Caught by Monte Carlo, session logs error

---

### Timing Budget

**Target:** 25-35 minutes per run (fits within :00 to :15 window before watcher checks)

**Breakdown:**
- Stages 1-3 (setup): ~3 min
- Stage 4 (roadmap): 2-3 min
- Stage 5 (research): 2-3 min
- **Stage 7 (implementation): 15-35 min** ← Most time here
- Stages 8-11 (validate/cleanup): ~5 min

**Hard timeout:** 45 minutes at Claude Code session level (stage 7)

**Why this timing:** Leaves 15-30 min buffer before next :00 cycle. If run goes long, next run simply skips (no pile-up).

---

**What you learned:**
- 11 stages summarized in table (scan quickly)
- Stages 4 and 7 are complex (roadmap parsing, orchestrator spawning)
- Timing budget prevents pile-up (25-35 min typical, 45 min max)
- Each stage is resumable (status file tracks progress)

**Next:** [Section 02: Worker Watcher](#section-02-worker-watcher---health-monitoring) - Health monitoring and auto-remediation

---
