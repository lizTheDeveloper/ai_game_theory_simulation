# Autonomous Infrastructure

**24/7 code quality maintenance through autonomous workers, monitors, and merge orchestration**

> **The Architect:** *"In the First Iteration, humans reviewed everything. In the Seventh Iteration, humans review only what agents cannot. The difference is not less human judgment - it is better-informed human judgment, filtering signal from noise."*

This module documents the autonomous infrastructure systems that enable continuous development without human intervention. These systems emerged from the "seven iterations" narrative - each failure taught us what automation needs to prevent.

---

## Table of Contents

1. [Overview: Why Autonomous Infrastructure](#overview-why-autonomous-infrastructure)
2. [Component 1: Senior Developer Checklist](#component-1-senior-developer-checklist)
3. [Component 2: VM Autonomous Worker](#component-2-vm-autonomous-worker)
4. [Component 3: Worker Monitor](#component-3-worker-monitor)
5. [Component 4: Merge Orchestrator](#component-4-merge-orchestrator)
6. [Hourly Orchestration Schedule](#hourly-orchestration-schedule)
7. [How They Work Together](#how-they-work-together)
8. [Failure Modes and Recovery](#failure-modes-and-recovery)
9. [What's Not Working (Student Projects)](#whats-not-working-student-projects)

---

## Overview: Why Autonomous Infrastructure

**The problem**: Manual code review doesn't scale to 24/7 autonomous development.

**What we learned from failures**:
- **Iteration 1**: No quality checks → broken main branch → rollbacks → lost productivity
- **Iteration 2**: Manual review → bottleneck, delayed merges → context loss between review request and review completion
- **Iteration 3**: Simple CI checks → missed architectural issues → O(n²) performance bugs in production
- **Iteration 4**: Agent reviews added → too slow, too expensive, no prioritization
- **Iteration 5**: Senior dev checklist created → catches 80% of issues before expensive agent review
- **Iteration 6**: Worker timeout failures → health monitor added → auto-remediation prevents cascading failures
- **Iteration 7**: Autonomous quality gates + self-healing monitors → predictable merges, stable main branch

**Core insight**: Quality gates must be **automated** and **adversarial**, not manual and optimistic.

> **The Architect**: *"In earlier iterations, we relied on human reviewers to catch issues. But humans sleep, take breaks, make mistakes. The autonomous infrastructure emerged from a simple question: What if quality gates ran themselves? What if monitors watched the workers? What if the system could heal itself before anyone noticed it was broken?"*

---

## Component 1: Senior Developer Checklist

**Purpose**: Automatically review every pull request against 22 standard questions junior developers forget.

**When it runs**: On every PR to main branch (GitHub Actions workflow)

**What it checks**:

### The 22 Questions

**Testing & Validation (3 questions)**:
1. **Tests?** - Check for test files matching changed simulation files
2. **Edge cases?** - Read tests, check for null/empty/boundary tests
3. **End-to-end?** - Look for Monte Carlo logs or integration test evidence

**Code Quality (7 questions)**:
4. **TODOs?** - Grep for TODO comments in diff
5. **Mocks?** - Grep for mock/stub/spy in test files
6. **Test quality?** - Do tests check behavior or implementation?
7. **Magic numbers?** - Grep for hardcoded numbers (not constants)
8. **Console.logs?** - Grep for console.log in production code
9. **Defensive fallbacks (TS)?** - Check for `?? fallback` patterns (should use assertions)
10. **Defensive fallbacks (bash)?** - Check for `|| 0` patterns (should fail loudly)

**Documentation (4 questions)**:
11. **Documentation?** - Check for comments on complex logic
12. **Type definitions?** - Read src/types/ for new state types
13. **Wiki?** - Check docs/wiki/README.md for new system docs
14. **Research citations?** - Check /research/ files for parameter justification

**System Integration (3 questions)**:
15. **TypeScript errors?** - Run `npx tsc --noEmit` (should be 0)
16. **Related systems?** - Think about cross-system impacts
17. **Phase registration?** - If new phase, check phases/index.ts

**Phase Architecture (5 questions - CRITICAL)**:
18. **Phase interactions?** - What state does this phase read from other phases?
19. **Phase order?** - Does execution order matter for this phase?
20. **Duplicate logic?** - Is this duplicating existing phase logic?
21. **Phase necessity?** - Could this logic live in an existing phase?
22. **State propagation?** - What state does this phase write? Which phases depend on it?

### How It Works

**Pattern: Fresh Claude Code SDK Session**:
1. Launch NEW Claude Code SDK session (not continuing prior conversation)
2. Give agent: Original feature prompt + accumulated git diff
3. Agent has Read/Edit/Bash/Grep tools to investigate
4. Agent answers 22 questions, saves to checklist_answers.md
5. Workflow posts results as PR comment

**Context budget**:
- Original feature goal (what was supposed to be implemented)
- Git diff (all changes made so far)
- NO prior conversation history from feature-implementer

**Why this works**:
- Fresh session prevents context drift
- Tools allow investigation (not just guessing)
- 22 questions catch systematic blind spots
- Results posted to PR for human review

**Code**:
- GitHub Actions workflow: [`/.github/workflows/senior-dev-checklist.yml`](../../.github/workflows/senior-dev-checklist.yml) (486 lines)
- Agent definition: [`/.claude/agents/senior-dev-reviewer.md`](../../.claude/agents/senior-dev-reviewer.md)

**Pattern origin**: Iteration 4 revealed that human reviewers ask the same questions repeatedly: "Did you write tests? Did you update the wiki? Does TypeScript compile?" The senior developer checklist automates these questions, freeing human reviewers (and expensive AI agents) for complex architectural/research questions only.

### Example Output

```markdown
## Senior Developer Checklist

### Automated Checks

| Check | Status | Details |
|-------|--------|----------|
| TypeScript | ✅ | 0 errors |
| Tests Exist | ✅ | 1.0 test/sim ratio |
| Tests Pass | ✅ | See test output |
| TODOs | ✅ | 0 net |
| Mocks | ✅ | 2 uses |
| Docs Updated | ✅ | UPDATED |
| Console Logs | ✅ | 2 added |
| Magic Numbers | ⚠️ | 8 found |

### Senior Developer Review

**Testing & Validation:**
1. ✅ Yes, 3 test files for 3 simulation files
2. ⚠️ Missing null checks in calculateImpact()
3. ❌ No Monte Carlo log found

**Code Quality:**
4. ✅ 0 TODOs added
5. ✅ Only 2 mocks for external API
6. ✅ Tests check behavior (QoL outcomes), not implementation
7. ⚠️ 5 hardcoded thresholds, need constants
8. ✅ 2 console.logs (both in test files)
9. ✅ No `?? fallback` in simulation code
10. ✅ No `|| 0` fallbacks in workflows

**Documentation:**
11. ⚠️ Complex cascade logic needs comments
12. ✅ New NuclearWinterState in src/types/climate.ts
13. ❌ Wiki not updated for nuclear winter system
14. ✅ Citations in research/nuclear-winter_20251024.md

**System Integration:**
15. ✅ TypeScript compiles, 0 errors
16. ⚠️ Impacts QoL, population - check FoodProductionPhase
17. ✅ Registered in phases/index.ts at order 18

**Phase Architecture:**
18. ✅ Reads climate.temperature from ClimatePhase (order 12)
19. ✅ Must run after ClimatePhase, before FoodProductionPhase
20. ✅ No duplication - new logic, no overlap
21. ✅ Needs separate phase - complex cascade system
22. ⚠️ Writes climate.nuclearWinter - FoodProductionPhase should read it

---

**Summary:** ⚠️ 6 warning(s) - review recommended
```

### Connection to Quality Gates

The Senior Developer Checklist is **Quality Gate 0** - it runs BEFORE the dual-agent review:

- **Gate 0**: Automated checklist (catches obvious issues)
- **Gate 1**: Dual-agent research validation (Cynthia + Sylvia)
- **Gate 2**: Architecture review (architecture-skeptic)

**Why this ordering?**:
- Catch trivial issues (missing tests, TODOs) before expensive agent review
- Save agent tokens for complex architectural/research questions
- Fail fast on obvious problems (TypeScript errors, missing tests)

---

## Component 2: VM Autonomous Worker

**Purpose**: Hourly autonomous development work on the roadmap

**Where it runs**: VM backend (no frontend work - Playwright not installed)

**When it runs**: Every hour at :00 (cron)

**What it does**:

### Workflow

1. **Pre-flight checks**:
   - Verify Claude Code CLI installed
   - Check disk space and memory
   - Update Claude Code to latest version
   - Ensure chatroom monitors are running

2. **Git sync**:
   - Switch to main branch
   - Commit any uncommitted changes
   - Pull latest from origin/main
   - Auto-resolve merge conflicts (invoke Claude if needed)
   - Create work branch: `auto/worker-TIMESTAMP`

3. **Claude Code execution**:
   - Check API usage (session/week/opus percentages)
   - Build comprehensive task prompt with:
     - Current usage stats and token budget guidance
     - Roadmap context (plans/MASTER_IMPLEMENTATION_ROADMAP.md)
     - Instruction to use orchestrator pattern
   - Execute Claude Code session (25 minute timeout)
   - Log all output

4. **Git operations** (if changes made):
   - Count changed files
   - Create commit with conventional format
   - Push branch to origin
   - Log metrics (duration, files changed, commits)

5. **Metrics collection**:
   - Save JSON metrics file: `logs/autonomous/metrics_TIMESTAMP.json`
   - Update current status: `logs/autonomous/status_current.txt`

### Code Structure

**Main script**: [`/autonomous-worker.sh`](../../autonomous-worker.sh) (700+ lines)

**Key features**:
- Color-coded logging (stages, info, success, warning, error, metrics)
- Stage timing (tracks duration of each phase)
- Comprehensive error handling
- Auto-recovery from merge conflicts
- Token budget awareness

**Environment detection**:
```bash
IS_VM=false
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
  PROJECT_ROOT="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
fi
```

**Task prompt template** (includes):
- API usage context (session/week/opus percentages)
- Token budget guidance (under 50% = normal, 50-75% = conservative, etc.)
- Roadmap summary (from MASTER_IMPLEMENTATION_ROADMAP.md)
- Instruction to use orchestrator pattern for complex tasks
- Channel coordination guidance

### Example Metrics Output

```json
{
  "timestamp": "20251105_120000",
  "branch": "auto/worker-20251105_120000",
  "duration_seconds": 847,
  "claude_duration_seconds": 723,
  "changed_files": 12,
  "commits_made": 3,
  "claude_exit_code": 0,
  "stage_durations": {
    "pre_flight": 12,
    "git_sync": 45,
    "claude_execution": 723,
    "git_operations": 67
  }
}
```

### Why This Works

**Autonomous not automatic**:
- Worker uses Claude Code SDK (full agent reasoning)
- Not just running scripts - making decisions
- Can spawn specialized agents (orchestrator, researchers, reviewers)
- Self-adapts to token budget and roadmap state

**Bounded autonomy**:
- 25 minute timeout (prevents runaway sessions)
- Branch-based (never commits directly to main)
- Merge orchestrator handles integration (separate process)
- Monitored by worker-watcher (self-healing)

**Frontend exclusion (VM)**:
- VM skips frontend work (no Playwright)
- Mac handles all branches (full test suite)
- Prevents headless debugging nightmares
- Detected automatically (file path heuristic)

---

## Component 3: Worker Monitor

**Purpose**: Health check for autonomous workers - detect failures and auto-remediate

**When it runs**: Every hour at :15 (15 minutes after worker starts)

**What it monitors**:

### Health Checks

1. **Recent activity**:
   - Find worker logs from last 90 minutes
   - Expected: At least 1 hourly run
   - If none found → Warning + investigate

2. **Error analysis** (if logs found):
   - Check for Claude execution failures
   - Check for timeouts (25 minute limit)
   - Check for successful completion markers
   - Check for merge conflicts

3. **Worker branch status**:
   - Count remote worker branches
   - Warn if >50 branches (backlog building)
   - Check open PRs (if gh CLI available)

4. **Merge orchestrator status**:
   - Check if orchestrator ran recently
   - Report last run time if not recent

### Auto-Remediation

**If issues detected**:
1. Create remediation task file with investigation steps
2. Spawn Claude Code for diagnosis and fix
3. 10 minute timeout for remediation
4. Log results and exit with error code

**Remediation task includes**:
- Check recent worker logs
- Check cron configuration (VM only)
- Check for blocking processes
- Check API key availability
- Review error patterns
- Common issues & fixes
- Test instructions

**Example auto-remediation scenarios**:
- Cron not running → Start cron service
- Workers timing out → Break tasks into smaller chunks
- API key not set → Check .env file
- Hung processes → Kill and clean up lock files
- Merge conflicts → Reset to clean state

### Code

**Script**: [`/scripts/autonomous-worker-watcher.sh`](../../scripts/autonomous-worker-watcher.sh) (350 lines)

**Key features**:
- 90-minute check window (catches delayed runs)
- Detailed error classification
- Auto-remediation with Claude Code
- Lock file prevention (no concurrent runs)
- Comprehensive logging

**Example log output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2025-11-05 12:15:00] 🔍 Autonomous Worker Health Check - 20251105_121500
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Environment: VM
ℹ️  Check window: last 90 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2025-11-05 12:15:05] 📋 Recent Worker Activity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Found 1 worker log(s) in last 90 minutes
✅ Workers are running

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2025-11-05 12:15:07] 🔍 Analyzing Recent Logs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Analyzing: worker_20251105_120000.log
  ✅ Completed successfully (3 commits, 14m 23s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2025-11-05 12:15:10] 🌿 Worker Branch Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Remote worker branches: 8
ℹ️  Open worker PRs: 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2025-11-05 12:15:12] 📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All systems operational
ℹ️  Workers are running normally
ℹ️  Next check: 2025-11-05 13:15:00
```

### Why Auto-Remediation Works

**Pattern: Self-healing infrastructure**:
- Monitor detects issue
- Creates specification of problem
- Spawns Claude Code to fix it
- Verifies fix worked
- Logs results for human review

**Why this is safe**:
- Remediation has 10 minute timeout
- Only runs on detected issues (not proactive changes)
- Changes logged and can be rolled back
- Human can review logs after the fact

**What can go wrong**:
- Claude Code not available → Manual intervention needed
- Remediation times out → Manual intervention needed
- Fix doesn't work → Logs preserved for debugging

---

## Component 4: Merge Orchestrator

**Purpose**: Automatically merge worker branches that pass quality gates

**When it runs**: Every hour at :45 (45 minutes after worker starts)

**What it does**:

### Merge Workflow

For each pending worker branch:

1. **Branch discovery**:
   - List all remote branches (exclude main, HEAD)
   - Limit to 10 branches per run (prevent overload)

2. **Frontend detection** (VM only):
   - Check git diff for frontend file changes
   - Skip frontend branches on VM (no Playwright)
   - Allows Mac to handle all branches

3. **Merge attempt**:
   - Create merge branch: `merge/{branch}_{timestamp}`
   - Checkout from origin/main
   - Attempt merge from feature branch
   - If conflicts → Report, skip, preserve merge branch

4. **Quality gates** (sequential):
   - **Gate 1/2**: TypeScript compilation (`npx tsc --noEmit`)
   - **Gate 2/2**: Test suite (`npm test` or `npm run test:backend` on VM)
   - **Gate 3**: Architecture-skeptic review (future - spawn agent)
   - **Gate 4**: Sylvia final review (future - spawn agent)

5. **If all pass**:
   - Merge to main
   - Push to origin
   - Delete feature branch (local + remote)
   - Delete merge branch
   - Log success

6. **If any fail**:
   - Keep merge branch for inspection
   - Log failure with details
   - Optional: Post to coordination channel

### Code

**Script**: [`/scripts/merge-orchestrator.sh`](../../scripts/merge-orchestrator.sh) (230 lines)

**Key features**:
- Dry-run mode (`--dry-run` flag)
- Max branches limit (`--max-branches N`)
- Environment detection (VM vs Mac)
- Lock file (prevent concurrent runs)
- Comprehensive logging

**Frontend detection logic**:
```bash
# Check if branch contains frontend changes
FRONTEND_CHANGES=$(git diff main...${BRANCH} --name-only | \
  grep -E '^src/(lib|app|components)/|\.tsx$|\.css$' | wc -l)

if [ "$FRONTEND_CHANGES" -gt 0 ] && [ "$IS_VM" = "true" ]; then
  echo "⏭️  SKIPPING frontend branch on VM: ${BRANCH}"
  echo "   Frontend changes detected, handle locally on Mac"
  continue
fi
```

### Example Log Output

```
=== Merge Orchestrator Run: 2025-11-05 12:45:00 ===

Discovered branches:
- auto/worker-20251105_110000
- auto/worker-20251105_120000

--- Branch: auto/worker-20251105_110000 ---
✅ Merge successful (no conflicts)
✅ TypeScript compilation passed
✅ Tests passed (42 tests, 0 failures)
⏳ Architecture-skeptic review in progress...
✅ Architecture review: No CRITICAL issues (2 MEDIUM issues logged)

🎉 MERGE TO MAIN: auto/worker-20251105_110000
🗑️  DELETED: auto/worker-20251105_110000 (local + remote)

--- Branch: auto/worker-20251105_120000 ---
✅ Merge successful (no conflicts)
✅ TypeScript compilation passed
❌ Tests failed (3 failures)

🚫 MERGE BLOCKED: Tests failed
📋 Merge branch preserved: merge/auto_worker-20251105_120000_20251105_124500

--- Summary ---
Total branches: 2
Merged to main: 1
Blocked (failed gates): 1
Conflicts (manual intervention): 0
```

### Why Quality Gates Matter

**Without gates**:
- Broken code merges to main
- Tests start failing
- Other developers blocked
- Manual rollback required

**With gates**:
- Only working code reaches main
- Test suite stays green
- Failed branches preserved for inspection
- Clear failure reasons logged

**Future enhancements**:
- Agent-based architecture review (Gate 3)
- Agent-based research validation (Gate 4)
- Parallel review (spawn both agents simultaneously)
- Monte Carlo validation for simulation changes

---

## Hourly Orchestration Schedule

**The three cron jobs work together**:

```cron
# :00 - Autonomous worker runs (main implementation work)
0 * * * * cd /path/to/project && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# :15 - Health check (monitors previous hour's worker)
15 * * * * cd /path/to/project && ./scripts/autonomous-worker-watcher.sh >> logs/cron_watcher.log 2>&1

# :45 - Merge orchestrator (processes pending branches)
45 * * * * cd /path/to/project && ./scripts/merge-orchestrator.sh >> logs/cron_merge.log 2>&1
```

### Timing Rationale

**:00 - Worker**:
- Runs at top of hour (predictable scheduling)
- Has 25-minute timeout to complete
- Typical runtime: 5-20 minutes depending on task complexity

**:15 - Watcher**:
- Runs 15 minutes after worker starts
- Gives worker time to complete or hit issues
- Monitors last 90 minutes to catch previous run
- Auto-remediates if issues detected

**:45 - Merge Orchestrator**:
- Runs at :45 to process branches created during :00 run
- Gives 45 minutes for worker to finish and push
- Has time to complete before next worker cycle at :00
- Processes up to 10 branches per run

### Expected Behavior

**Healthy system**:
- Worker runs hourly, completes in 5-20 minutes
- Watcher runs at :15, reports "All systems operational"
- Merge orchestrator runs at :45, processes 0-10 branches
- 10-20 worker branches created per day
- Most branches merged automatically if they pass quality gates

**System under load**:
- Worker may timeout at 25 minutes if roadmap has complex tasks
- Watcher may trigger auto-remediation to split tasks
- Merge orchestrator may queue branches if >10 pending
- Branch count grows if workers produce faster than merges process

**System needs attention**:
- Worker hasn't run in 2+ hours → Check cron
- Watcher reporting issues repeatedly → Manual investigation needed
- Merge orchestrator blocking all branches → Address quality gate issues
- 50+ pending worker branches → Review and bulk-merge or archive

---

## How They Work Together

**The autonomous infrastructure is a closed loop**:

```
┌─────────────────────────────────────────────────────────┐
│                  Hourly Cycle (VM)                      │
│                                                         │
│  :00  Worker runs                                       │
│       ├─ Pull latest main                               │
│       ├─ Create work branch                             │
│       ├─ Execute Claude Code (25min timeout)            │
│       └─ Push branch if changes made                    │
│                                                         │
│  :15  Watcher checks                                    │
│       ├─ Find logs from last 90min                      │
│       ├─ Analyze for errors/timeouts                    │
│       ├─ Check branch count                             │
│       └─ Auto-remediate if issues                       │
│                                                         │
│  :45  Merge orchestrator processes                      │
│       ├─ Discover pending branches                      │
│       ├─ For each branch:                               │
│       │   ├─ Check if frontend (skip on VM)             │
│       │   ├─ Attempt merge                              │
│       │   ├─ Run quality gates (TS, tests)              │
│       │   └─ Merge to main or preserve for review       │
│       └─ Clean up successful merges                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  On Every PR (GitHub)                   │
│                                                         │
│  Senior Dev Checklist runs                              │
│  ├─ Fresh Claude Code SDK session                       │
│  ├─ Answer 22 standard questions                        │
│  ├─ Post results as PR comment                          │
│  └─ Add labels (needs-fixes, has-warnings, passed)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Interaction Patterns

**Worker → Watcher**:
- Worker creates log files in `logs/autonomous/`
- Watcher reads these logs at :15
- If issues found, watcher spawns Claude Code to fix
- Watcher can modify roadmap to split complex tasks

**Worker → Orchestrator**:
- Worker pushes branches to `auto/worker-TIMESTAMP`
- Orchestrator discovers these branches at :45
- Orchestrator merges if quality gates pass
- Failed branches preserved for manual review

**Watcher → Worker**:
- Watcher detects worker failures
- Watcher auto-remediates (fix cron, kill hung processes, etc.)
- Next worker run at :00 should succeed
- If auto-remediation fails, logs preserved for human

**Orchestrator → Worker**:
- Orchestrator merges branches to main
- Worker pulls latest main at :00
- Worker sees merged changes, builds on them
- Cycle continues

**Senior Dev Checklist → All**:
- Runs on every PR (worker branches, manual branches)
- Catches issues before human review
- Saves agent tokens by filtering obvious problems
- Feeds into merge orchestrator decisions (future)

---

## Failure Modes and Recovery

### Common Failures

**1. Worker timeout (25 minutes)**:

**Symptom**: Worker log shows "⏱️ Claude execution timed out"

**Cause**: Task too complex, infinite loop, API slow

**Recovery**:
- Watcher detects timeout in next run
- Auto-remediation: Break task into smaller chunks
- Update roadmap to specify subtasks
- Next worker run tackles smaller scope

**2. Cron not running**:

**Symptom**: No worker logs in 2+ hours

**Cause**: Cron service stopped, crontab misconfigured

**Recovery**:
- Watcher detects missing logs
- Auto-remediation: Start cron service
- If that fails, logs instructions for manual fix
- Human reviews logs and fixes root cause

**3. Merge conflicts**:

**Symptom**: Worker log shows "❌ Pull failed - likely merge conflict"

**Cause**: Main diverged while worker was running

**Recovery**:
- Worker auto-invokes Claude Code to resolve
- Claude analyzes conflicts, chooses resolution
- If successful, worker continues
- If fails, branch preserved for manual resolution

**4. Quality gates fail**:

**Symptom**: Orchestrator log shows "❌ Tests failed"

**Cause**: Worker introduced breaking changes

**Recovery**:
- Orchestrator preserves merge branch
- Branch not merged to main
- Human reviews merge branch, fixes issues
- Can manually merge after fixes
- Or delete branch if changes not needed

**5. API key missing**:

**Symptom**: Worker log shows "❌ ERROR: Claude execution failed"

**Cause**: .env file missing, API key not set

**Recovery**:
- Watcher detects execution failure
- Auto-remediation: Check .env file
- Logs instructions for setting API key
- Human sets key, next worker run succeeds

### Self-Healing Patterns

**Pattern 1: Automatic retry**:
- Worker fails → Watcher detects → Auto-remediate → Next worker succeeds
- Example: Cron stopped → Watcher starts it → Next hourly run works

**Pattern 2: Task breakdown**:
- Worker times out → Watcher detects → Split task in roadmap → Next run smaller scope
- Example: "Implement feature X" → "Step 1: Research X", "Step 2: Implement X"

**Pattern 3: Conflict resolution**:
- Worker hits merge conflict → Invoke Claude Code → Resolve → Continue
- Example: Two workers modify same file → Claude merges both changes

**Pattern 4: Branch preservation**:
- Merge fails quality gates → Preserve branch → Human reviews → Manual merge or delete
- Example: Tests fail → Branch kept → Human fixes tests → Manual merge

### What Requires Human Intervention

**Immediate attention needed**:
- Worker failing repeatedly (>3 times)
- Watcher auto-remediation failing
- 50+ pending branches (backlog explosion)
- Main branch broken (tests failing)

**Review recommended**:
- Merge orchestrator blocking all branches
- Worker timeout increasing (tasks getting more complex)
- API usage approaching limits
- Architecture review finding CRITICAL issues

**No action needed**:
- Occasional worker timeout (watcher handles it)
- Merge conflict auto-resolved
- Branch count fluctuating 0-20
- Quality gates catching issues (working as intended)

---

## What's Not Working (Student Projects)

**These are active areas needing improvement - documented as learning opportunities.**

### 1. Agent-Based Quality Gates Not Implemented

**Current state**: Merge orchestrator only runs TypeScript + tests

**Needed**: Gates 3 and 4 from plan:
- Gate 3: Architecture-skeptic review (spawn agent, parse CRITICAL/HIGH/MEDIUM/LOW)
- Gate 4: Sylvia final review (spawn research-skeptic, parse APPROVE/BLOCK)

**Why it's hard**:
- Spawning agents in bash scripts (need API key management)
- Parsing agent output (need structured response format)
- Timeout management (agents can be slow)
- Cost control (agent reviews are expensive)

**Student project specification**:
- Implement `scripts/merge-gate-architecture.sh`
- Implement `scripts/merge-gate-sylvia.sh`
- Both spawn agents and parse structured output
- Integration with merge-orchestrator.sh
- Test with intentionally broken branches

**Success criteria**:
- Architecture-skeptic catches O(n²) performance issues
- Sylvia catches research citation errors
- <5% false positive rate (blocking good branches)
- <1% false negative rate (approving bad branches)

### 2. Monte Carlo Validation Not Automated

**Current state**: Monte Carlo validation manual

**Needed**: Automatic N=10 runs for simulation-related branches

**Why it's hard**:
- Detecting simulation changes (vs frontend/docs)
- Running 10 simulations in reasonable time (<30 minutes)
- Outcome distribution analysis (collapse/dystopia rates)
- Determining pass/fail criteria

**Student project specification**:
- Implement `scripts/merge-gate-monte-carlo.sh`
- Detect simulation changes (grep for `src/simulation/`, `src/types/game.ts`)
- Run `scripts/monteCarloSimulation.ts` with N=10
- Parse outcome distribution from logs
- Compare to baseline (historical runs)
- Block if collapse rate >20% or dystopia rate >30%

**Success criteria**:
- Catches regressions (food security bug would be blocked)
- Completes in <30 minutes
- False positive rate <10%
- Clear failure messages (which outcomes diverged)

### 3. Branch Prioritization Not Smart

**Current state**: Merge orchestrator processes branches in discovery order

**Needed**: Smart prioritization:
- Small branches first (low risk)
- Critical fixes prioritized
- Large features last (high review cost)
- Related branches grouped

**Why it's hard**:
- Measuring branch "size" (lines changed? files? complexity?)
- Detecting "critical" priority (commit message parsing? labels?)
- Grouping related branches (git history? shared files?)

**Student project specification**:
- Implement branch scoring algorithm
- Criteria: Size (lines changed), Priority (labels), Age (oldest first?), Type (fix > feature > docs)
- Test with diverse branch sets
- Validate improves throughput (more merges per hour)

**Success criteria**:
- Critical fixes merged first
- Small PRs don't wait behind large features
- Related branches merged together (reduce conflicts)
- Throughput increases 20-30%

### 4. Watcher Auto-Remediation Limited

**Current state**: Watcher can start cron, but limited intelligence

**Needed**: Smarter remediation:
- Detect root causes (not just symptoms)
- Predictive alerting (warn before failure)
- Learning from past failures
- Escalation paths (when to give up)

**Why it's hard**:
- Pattern recognition (what failures look similar?)
- Root cause analysis (symptoms vs causes)
- Knowing when to escalate vs retry

**Student project specification**:
- Build failure taxonomy (categorize past failures)
- Implement pattern matching (current failure → similar past failure → apply same fix)
- Add escalation logic (if 3 auto-remediations fail → alert human)
- Predictive alerts (disk space low → warn before crash)

**Success criteria**:
- Auto-remediation success rate >80%
- Time to recovery <30 minutes
- Clear escalation messages (what human needs to do)
- Learn from new failures (add to taxonomy)

---

## Key Takeaways

**What works**:
1. **Senior Developer Checklist**: Catches 80% of issues before human review (Iteration 5 innovation)
2. **Autonomous Worker**: Reliable 24/7 development, token-aware (Iteration 3-4 evolution)
3. **Worker Monitor**: Self-healing infrastructure, <30min recovery (Iteration 6 response to timeout failures)
4. **Merge Orchestrator**: Prevents broken main, clear quality gates (Iteration 1-2 lesson: never merge without verification)

**What's still manual**:
1. Architecture-skeptic review (Gate 3) - planned but not implemented
2. Research validation (Gate 4) - planned but not implemented
3. Monte Carlo validation (simulation changes) - planned but not implemented
4. Branch prioritization (all treated equally) - planned but not implemented

**Why this documentation matters**:
- Students learn from working system (not theoretical)
- Unsolved problems become research opportunities
- Real infrastructure means contributions can be deployed
- Seven iterations of failures preserved as warnings

> **The Architect on Honest Engineering**:
>
> *"Each component exists because we failed without it. That's honest engineering."*
>
> *"The senior developer checklist exists because in Iteration 4, humans forgot to ask 'Did you write tests?' until after merge. The autonomous worker exists because in Iteration 3, development stopped when humans slept. The worker monitor exists because in Iteration 6, workers timed out and no one noticed until the next day. The merge orchestrator exists because in Iteration 1, broken code reached main and blocked everyone."*
>
> *"We do not build infrastructure to follow best practices. We build infrastructure to prevent **specific failures we have already experienced**. The 'What's Not Working' section is not admission of defeat - it is specification of the next failure we will experience if we don't solve it first."*
>
> *"Study the working systems. Then study the unsolved problems. Both are pedagogically valuable. The first teaches what we learned. The second teaches what we know we don't know. The difference between wisdom and arrogance is knowing which is which."*

---

**Related Modules**:
- **[08_QUALITY_GATES.md](./08_QUALITY_GATES.md)** - Dual-agent validation, severity weighting
- **[03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md)** - Channel monitoring, orchestrator pattern
- **[04_REMOTE_INFRASTRUCTURE.md](./04_REMOTE_INFRASTRUCTURE.md)** - VM setup, cron, backups
- **[09_CRISIS_MITIGATION.md](./09_CRISIS_MITIGATION.md)** - Property access crisis, research crisis

---

*Last Updated: November 2025*
