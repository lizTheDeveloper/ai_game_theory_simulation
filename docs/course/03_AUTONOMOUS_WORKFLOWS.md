# Module 03: Autonomous Workflows

*Module 3 of 9 | Prerequisites: [Module 01](./01_AGENT_ARCHITECTURE.md), [Module 02](./02_COMMUNICATION_SYSTEMS.md)*

**Worker scripts, channel monitoring, orchestrator patterns**

---

## Learning Objectives

By the end of this module, you will understand:

1. **4-job cron architecture:** Worker (:00), Watcher (:15), Researcher (:30), Merge Orchestrator (:45)
2. **Autonomous worker script:** Hourly implementation work from roadmap (534 lines)
3. **Channel monitor:** Continuous polling, orchestrator spawning, FIFO queue processing
4. **Worker watcher:** Health monitoring and auto-remediation (443 lines)
5. **Merge orchestrator:** Auto-merge PRs, branch cleanup (396 lines)
6. **Timing rationale:** Why these specific minute offsets prevent conflicts
7. **End-to-end autonomous cycle:** From roadmap → implementation → validation → merge

**Prerequisites:**
- [Module 01: Agent Architecture](./01_AGENT_ARCHITECTURE.md) - Understanding agents
- [Module 02: Communication Systems](./02_COMMUNICATION_SYSTEMS.md) - Chatroom + Matrix

**Time to complete:** 2-2.5 hours (with exercises)

---

## Section 00: The Big Picture - Fully Autonomous Development

### The Vision: Zero-Touch Operation

Imagine a development system that:
- **Reads the roadmap** every hour
- **Picks the highest-priority task** that's ready to implement
- **Does the research** (finds papers, extracts parameters)
- **Implements the feature** (writes code, adds tests)
- **Validates the implementation** (runs Monte Carlo simulations)
- **Creates a pull request** and merges it
- **Updates documentation** to reflect changes
- **Repeats** every hour, 8am-8pm UTC, every day

**And all of this happens without any human intervention.**

This is not theoretical. This is the actual autonomous system running on the project's GCP VM right now.

### The 4-Job Architecture

The autonomous system consists of **4 cron jobs** that run at specific offsets within each hour:

```
:00 ━━━━━━━━━━━━ Autonomous Worker ━━━━━━━━━━━━
     ↓ (Reads roadmap, picks task, implements, creates PR)
     ↓ [15 minutes]
     ↓
:15 ━━━━━━━━━━━━ Worker Watcher ━━━━━━━━━━━━━━
     ↓ (Monitors worker health, auto-remediates issues)
     ↓ [15 minutes]
     ↓
:30 ━━━━━━━━━━━━ Research Worker ━━━━━━━━━━━━━━
     ↓ (Monitors research channel, updates papers, verifies sources)
     ↓ [15 minutes]
     ↓
:45 ━━━━━━━━━━━━ Merge Orchestrator ━━━━━━━━━━━
     ↓ (Processes PRs from worker/researcher, merges, cleans up branches)
     ↓ [15 minutes]
     ↓
:00 ━━━━━━━━━━━━ Cycle repeats ━━━━━━━━━━━━━━━━
```

**Mental model:** Think of this as a **factory assembly line**:
- Worker: Builds the product (implementation)
- Watcher: Quality control (health monitoring)
- Researcher: Materials procurement (research updates)
- Merge Orchestrator: Shipping (integration to main)

### Architecture Principle: Time-Based Orchestration

**Key insight:** Instead of complex inter-process communication, the system uses **predictable timing** to coordinate work.

**Why this works:**
1. **Worker at :00** - Top of hour, predictable start time
2. **Watcher at :15** - Gives worker 15 minutes to complete or hit issues
3. **Researcher at :30** - Mid-hour, parallel to worker (different concerns)
4. **Merge at :45** - Near end of hour, processes both worker + researcher branches

**Result:** No race conditions, no message passing complexity, just **predictable scheduling**.

---

## Section 01: Autonomous Worker - Hourly Implementation
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
- Stages 4 and 7 are complex ([roadmap parsing](./05_PLANNING_COORDINATION.md#roadmap-as-living-document), [orchestrator spawning](./01_AGENT_ARCHITECTURE.md#orchestrator-agent))
- Timing budget prevents pile-up (25-35 min typical, 45 min max)
- Each stage is resumable (status file tracks progress)
- [Quality gates](./08_QUALITY_GATES.md) enforce validation before merge

**Next:** [Section 02: Worker Watcher](#section-02-worker-watcher---health-monitoring) - Health monitoring and auto-remediation

---
## Section 02: Worker Watcher - Health Monitoring

The worker watcher (`scripts/autonomous-worker-watcher.sh`) monitors autonomous system health and auto-remediates issues.

### Architecture: 3 Responsibilities, 443 Lines

**Monitors:**
1. **Autonomous worker** (implementation)
2. **Research worker** (research updates)
3. **Merge orchestrator** (PR processing)

**Checks:**
- Are they running when expected?
- Are logs being written?
- Are there errors in logs?
- Are processes hung (no progress in 90 minutes)?

**Remediates:**
- Kills hung processes
- Restarts failed workers
- Sends alerts to coordination channel
- Logs remediation actions for debugging

### Health Check Logic

```bash
# Check last worker run
LAST_WORKER_LOG=$(ls -t logs/autonomous/worker_*.log 2>/dev/null | head -1)

if [ -z "$LAST_WORKER_LOG" ]; then
    log_warning "No worker logs found in last 90 minutes"
    # Post alert to coordination channel
    post_alert "Worker hasn't run in 90+ minutes"
    exit 1
fi

# Check for errors
ERROR_COUNT=$(grep -c "❌" "$LAST_WORKER_LOG" || true)

if [ "$ERROR_COUNT" -gt 5 ]; then
    log_error "Worker has $ERROR_COUNT errors"
    # Extract last 50 lines for context
    CONTEXT=$(tail -50 "$LAST_WORKER_LOG")
    post_alert "Worker errors detected: $CONTEXT"
fi
```

**What this does:**
- Finds most recent worker log
- Counts error markers (❌ emoji)
- If >5 errors, posts alert with context

**Why this matters:** **Autonomous systems must self-monitor**. If worker starts failing silently, watcher catches it and alerts the team.

### Auto-Remediation Examples

**Scenario 1: Hung process**
```bash
# Find worker PID
WORKER_PID=$(pgrep -f "claude-code chat.*worker-session")

if [ -n "$WORKER_PID" ]; then
    # Check if process is hung (no disk I/O in 10 minutes)
    LAST_IO=$(stat -c %Y /proc/$WORKER_PID/io 2>/dev/null || echo 0)
    NOW=$(date +%s)
    IDLE_TIME=$((NOW - LAST_IO))

    if [ "$IDLE_TIME" -gt 600 ]; then
        log_warning "Worker process hung (${IDLE_TIME}s idle), killing..."
        kill -9 "$WORKER_PID"
        post_alert "Killed hung worker process (PID: $WORKER_PID)"
    fi
fi
```

**Scenario 2: Disk space low**
```bash
# Check disk space
DISK_PERCENT=$(df "$PROJECT_DIR" | awk 'NR==2 {print $5}' | tr -d '%')

if [ "$DISK_PERCENT" -gt 90 ]; then
    log_error "Disk usage critical: ${DISK_PERCENT}%"

    # Auto-cleanup: Remove old logs (>30 days)
    find logs/autonomous -name "*.log" -mtime +30 -delete
    find logs/ -name "mc_*.log" -mtime +7 -delete

    # Re-check
    DISK_PERCENT=$(df "$PROJECT_DIR" | awk 'NR==2 {print $5}' | tr -d '%')
    log_info "After cleanup: ${DISK_PERCENT}%"

    if [ "$DISK_PERCENT" -gt 90 ]; then
        post_alert "Disk space critical even after cleanup: ${DISK_PERCENT}%"
    fi
fi
```

**Scenario 3: Channel monitor crashed**
```bash
# Check if channel monitor is running
if ! pgrep -f "channel-monitor.ts" > /dev/null; then
    log_warning "Channel monitor not running, restarting..."

    # Start in background
    nohup npx tsx scripts/channel-monitor.ts > logs/monitor_$(date +%Y%m%d_%H%M%S).log 2>&1 &

    sleep 2  # Give it a moment to start

    if pgrep -f "channel-monitor.ts" > /dev/null; then
        log_success "Channel monitor restarted"
        post_alert "Auto-remediated: Channel monitor was down, restarted successfully"
    else
        log_error "Failed to restart channel monitor"
        post_alert "CRITICAL: Cannot restart channel monitor, manual intervention needed"
    fi
fi
```

### Why :15 Timing?

**The watcher runs at :15** - exactly 15 minutes after the worker starts at :00.

**Rationale:**
- **Gives worker time:** 15 minutes is enough for worker to complete simple tasks
- **Catches issues:** If worker hangs/crashes, 15 minutes is early enough to remediate before next cycle
- **Monitors last 90 minutes:** Catches issues from previous hour (in case watcher itself missed a cycle)

---

**What you learned:**
- Watcher monitors 3 workers: autonomous, researcher, merge orchestrator
- Auto-remediation for hung processes, disk space, crashed services
- Runs at :15 (15 min after worker starts)
- Coordination via [chatroom alerts](./02_COMMUNICATION_SYSTEMS.md)

**Next:** [Section 03: Research Worker](#section-03-research-worker---parallel-research-updates) - Parallel research updates without blocking implementation

---

## Section 03: Research Worker - Parallel Research Updates

The research worker (`researcher-worker.sh`) monitors the research channel and updates research files with current sources.

### Architecture: Research-Parallel Workflow

**Traditional workflow (broken):**
```
1. Start implementation
2. Realize you need parameter
3. Stop, find research
4. Resume implementation
```
**Problem:** Implementation blocks on research.

**Research-parallel workflow (correct):**
```
1. Worker posts research needs to channel (:00)
2. Researcher monitors channel, updates papers (:30)
3. Implementation continues with updated research
```
**Result:** Research and implementation happen in parallel, no blocking.

### What It Does

```bash
# Monitor research channel for questions
MESSAGES=$(chatroom_read_new channel="research" agent="researcher")

# Look for questions from Sylvia or Cynthia
QUESTIONS=$(echo "$MESSAGES" | grep -E "\\[QUESTION\\]|need.*research|missing.*parameter")

if [ -n "$QUESTIONS" ]; then
    # Spawn Cynthia (super-alignment-researcher)
    claude-code chat \\
      --timeout 30m \\
      --session-file .claude/researcher-session \\
      "
    You are Cynthia (super-alignment-researcher).

    Read research channel questions: $QUESTIONS

    For each question:
    1. Find peer-reviewed sources (2024-2025 preferred)
    2. Extract parameters
    3. Save to research/[topic]_YYYYMMDD.md
    4. Post findings to research channel with [COMPLETED] status
    "
fi
```

**What this does:**
- Reads research channel for questions
- Spawns Cynthia to answer them
- Updates research files with current sources
- Posts findings back to channel

**Why :30 timing?** Mid-hour, 30 minutes after worker posts research needs. Gives researcher time to work before merge orchestrator runs at :45.

### Research Age Audit

**Every research worker run includes an audit:**
```bash
# Find research files older than 6 months
OLD_RESEARCH=$(find research/ -name "*.md" -mtime +180)

if [ -n "$OLD_RESEARCH" ]; then
    log_warning "Found research files >6 months old:"
    echo "$OLD_RESEARCH"

    # Prioritize updating CRITICAL/HIGH items
    for file in $OLD_RESEARCH; do
        TOPIC=$(basename "$file" .md)
        ROADMAP_ITEM=$(grep -r "$TOPIC" plans/MASTER_IMPLEMENTATION_ROADMAP.md | grep -E "CRITICAL|HIGH")

        if [ -n "$ROADMAP_ITEM" ]; then
            log_info "Prioritizing update: $file (used in CRITICAL/HIGH item)"
            # Add to update queue
        fi
    done
fi
```

**Why this matters:** Research ages. Parameters from 2023 papers may be superseded by 2024 studies. The audit ensures research stays current.

---

**What you learned:**
- Research-parallel workflow: implementation doesn't block on research
- Researcher monitors [research channel](./02_COMMUNICATION_SYSTEMS.md) for questions
- Research age audit (>6 months triggers update)
- Runs at :30 (mid-hour, parallel to worker)

**Next:** [Section 04: Merge Orchestrator](#section-04-merge-orchestrator---auto-integration) - Auto-merge PRs and branch cleanup

---

## Section 04: Merge Orchestrator - Auto-Integration

The merge orchestrator (`scripts/merge-orchestrator.sh`) processes branches from autonomous workers and integrates them to main.

### Architecture: Up to 15 Branches Per Run, 396 Lines

**What it does:**
```
1. Find all auto/* branches (from worker/researcher)
2. For each branch (up to 15):
   a. Check if PR exists
   b. Check if CI passed (if configured)
   c. Check for merge conflicts
   d. If all checks pass → merge
   e. Delete branch
3. Log results
```

**Why up to 15?** Prevents pile-up if workers create many branches. Process oldest 15, leave rest for next cycle.

### Merge Logic

```bash
# Find auto/* branches
AUTO_BRANCHES=$(git branch -r | grep "origin/auto/" | sed 's/origin\\///')

MERGE_COUNT=0
MAX_MERGES=15

for branch in $AUTO_BRANCHES; do
    if [ "$MERGE_COUNT" -ge "$MAX_MERGES" ]; then
        log_info "Reached max merges ($MAX_MERGES), stopping"
        break
    fi

    log_info "Processing branch: $branch"

    # Get PR number
    PR_NUMBER=$(gh pr list --head "$branch" --json number -q '.[0].number')

    if [ -z "$PR_NUMBER" ]; then
        log_warning "No PR found for $branch, skipping"
        continue
    fi

    # Check CI status
    CI_STATUS=$(gh pr view "$PR_NUMBER" --json statusCheckRollup -q '.statusCheckRollup[0].conclusion')

    if [ "$CI_STATUS" != "SUCCESS" ] && [ "$CI_STATUS" != "null" ]; then
        log_warning "CI checks not passed for PR #$PR_NUMBER (status: $CI_STATUS), skipping"
        continue
    fi

    # Check for conflicts
    if gh pr view "$PR_NUMBER" --json mergeable -q '.mergeable' | grep -q "CONFLICTING"; then
        log_error "PR #$PR_NUMBER has conflicts, skipping"
        continue
    fi

    # Merge!
    log_info "Merging PR #$PR_NUMBER"
    gh pr merge "$PR_NUMBER" --squash --auto --delete-branch

    MERGE_COUNT=$((MERGE_COUNT + 1))
    log_success "Merged PR #$PR_NUMBER (branch: $branch)"
done

log_metric "Merged $MERGE_COUNT branches this cycle"
```

**What this does:**
- Finds auto/* branches
- For each branch: checks PR, checks CI, checks conflicts
- If all pass: squash merge, delete branch
- Stops at 15 merges

**Why squash merge?** Keeps main history clean. Each PR becomes one commit, not dozens.

### Why :45 Timing?

**The merge orchestrator runs at :45** - near the end of the hour.

**Rationale:**
- **After worker:** Worker finishes by :25-:35, creates PR by :35
- **After researcher:** Researcher finishes by :50-:55, creates PR by :55
- **Before next cycle:** Merges complete before next worker at :00

**Buffer:** 15 minutes before next cycle (:45 + max 10 min runtime = :55, next cycle :00)

---

**What you learned:**
- Merge orchestrator processes up to 15 PRs per hour
- Checks CI status, conflicts before merging
- Runs at :45 (after worker + researcher create PRs)
- Uses [GitHub CLI](./04_REMOTE_INFRASTRUCTURE.md) for PR operations

**Next:** [Section 05: End-to-End Autonomous Cycle](#section-05-end-to-end-autonomous-cycle) - Complete hourly workflow trace

---

## Section 05: End-to-End Autonomous Cycle

Let's trace a complete hour-long cycle to see how all pieces fit together.

### Hour 1: 14:00-14:59

#### 14:00:00 - Worker Starts

```
Worker: Reading roadmap...
Worker: Found CRITICAL task: "Implement nuclear winter cascades"
Worker: Posting research requests to research channel...
  └─> [QUESTION] Need temperature drop parameters from Richardson et al. 2024

Worker: Spawning orchestrator...
  └─> Orchestrator: Reading task description...
  └─> Orchestrator: Spawning simulation-maintainer (Roy)...
      └─> Roy: Creating NuclearWinterPhase.ts...
      └─> Roy: Adding temperature drop mechanics...
      └─> Roy: Running Monte Carlo N=10... [takes 8 minutes]
  └─> Orchestrator: Tests passed! Spawning wiki-documentation-updater...
      └─> Historian: Updating docs/wiki/README.md...

Worker: Implementation complete!
Worker: Creating commit...
Worker: Pushing branch: auto/worker-20251107_140000
Worker: Creating PR #127
Worker: Done! (34 minutes elapsed)
```

**Status at 14:34:**
- Branch `auto/worker-20251107_140000` created
- PR #127 open
- Worker session saved to `.claude/worker-session`

---

#### 14:15:00 - Watcher Checks Health

```
Watcher: Checking last worker run...
Watcher: Found: logs/autonomous/worker_20251107_140000.log
Watcher: Status: COMPLETE (34 minutes)
Watcher: Errors: 0
Watcher: ✅ Worker healthy

Watcher: Checking channel monitor...
Watcher: PID 12345 found, running
Watcher: ✅ Channel monitor healthy

Watcher: Checking disk space...
Watcher: 45% used, 55% free
Watcher: ✅ Disk space healthy

Watcher: Checking research worker...
Watcher: Last run: logs/autonomous/researcher_20251107_133000.log (1 hour ago)
Watcher: ✅ Research worker healthy

Watcher: All systems nominal. Done! (2 minutes elapsed)
```

**Status at 14:17:**
- All health checks passed
- No remediation needed

---

#### 14:30:00 - Researcher Starts

```
Researcher: Reading research channel...
Researcher: Found 1 unread question from worker (14:00)
  └─> [QUESTION] Need temperature drop parameters from Richardson et al. 2024

Researcher: Spawning Cynthia...
  └─> Cynthia: Searching for Richardson et al. 2024...
  └─> Cynthia: Found paper! Downloading PDF...
  └─> Cynthia: Extracting parameters from Table S3...
      • Temperature drop rate: 0.8-1.2°C/month
      • Nadir: Month 6-9 (15-20°C below baseline)
      • Recovery: 18-24 months
  └─> Cynthia: Saving to research/nuclear_winter_parameters_20251107.md
  └─> Cynthia: Posting findings to research channel with [COMPLETED]

Researcher: Research age audit...
Researcher: Found 3 files >6 months old, 1 is CRITICAL priority
Researcher: Updating: research/climate_tipping_points_20250401.md
  └─> Cynthia: Finding 2024-2025 updates for climate tipping points...
  └─> Cynthia: Updated with Armstrong McKay 2024 study
  └─> Cynthia: Saved to research/climate_tipping_points_20251107.md

Researcher: Done! (18 minutes elapsed)
```

**Status at 14:48:**
- Research parameters provided (but worker already finished - parameters for next time)
- 1 CRITICAL research file updated
- No branch created (researcher doesn't always commit)

---

#### 14:45:00 - Merge Orchestrator Starts

```
Merge Orchestrator: Finding auto/* branches...
Merge Orchestrator: Found 2 branches:
  • auto/worker-20251107_140000 (PR #127)
  • auto/worker-20251107_130000 (PR #126, from previous hour)

Merge Orchestrator: Processing PR #126...
  └─> CI status: SUCCESS
  └─> Mergeable: MERGEABLE
  └─> Merging with squash...
  └─> ✅ Merged PR #126, deleted branch

Merge Orchestrator: Processing PR #127...
  └─> CI status: null (no CI configured)
  └─> Mergeable: MERGEABLE
  └─> Merging with squash...
  └─> ✅ Merged PR #127, deleted branch

Merge Orchestrator: Done! Merged 2 branches (5 minutes elapsed)
```

**Status at 14:50:**
- PR #126 merged (from previous hour)
- PR #127 merged (from current hour)
- Both branches deleted
- Main branch now includes both features

---

#### 14:59:59 - Cycle Complete

**Summary of Hour 1:**
- Worker implemented nuclear winter cascades (34 minutes)
- Watcher verified health (2 minutes)
- Researcher updated 2 research files (18 minutes)
- Merge orchestrator merged 2 PRs (5 minutes)

**Total work time:** 59 minutes
**Autonomous operations:** 4 cron jobs
**Human intervention:** 0

**Main branch now contains:**
- Nuclear winter cascade feature (implemented this hour)
- Whatever PR #126 was (implemented previous hour)
- Updated research (climate tipping points with 2024 sources)

---

### Hour 2: 15:00-15:59

The cycle repeats. Worker reads roadmap, finds next CRITICAL task, implements it, creates PR. Researcher monitors channel. Merge orchestrator processes yesterday's backlog. And so on, every hour, 8am-8pm UTC, every day.

---

## Section 06: Timing Rationale Deep Dive

### Why These Specific Offsets?

The :00 / :15 / :30 / :45 schedule is **not arbitrary**. It's carefully designed to prevent conflicts and maximize throughput.

#### Alternative 1: All at :00 (Fails)

```
:00 - Worker + Watcher + Researcher + Merge ALL run simultaneously

Problems:
• Git conflicts (all trying to checkout/commit)
• Disk I/O saturation (4 processes writing logs)
• Memory pressure (4 Claude Code sessions)
• No health monitoring (watcher can't check worker while worker is running)
```

**Result:** System thrashes, nothing completes.

---

#### Alternative 2: Sequential (:00, :15, :30, :45 same job)

```
:00 - Job 1 of 4
:15 - Job 2 of 4
:30 - Job 3 of 4
:45 - Job 4 of 4

:00 - Job 1 again (but Job 4 from previous cycle not done yet!)
```

**Problem:** If any job takes >15 minutes, the queue backs up. By evening, jobs are hours behind.

---

#### Alternative 3: Random offsets (Fails)

```
Worker: runs at random time in [0, 59]
Watcher: runs at random time in [0, 59]
Merge: runs at random time in [0, 59]
```

**Problem:** No predictability. Merge might run before worker creates PR. Watcher might check before worker starts. Chaos.

---

#### Our Solution: Time-Based Orchestration (Works)

```
:00 - Worker (25-35 min typical)
:15 - Watcher (2-5 min typical) ← checks PREVIOUS worker run
:30 - Researcher (15-25 min typical)
:45 - Merge (5-10 min typical) ← processes branches from current + previous cycles
```

**Why this works:**
1. **Worker has 15-min buffer** - Finishes by :25-:35, watcher checks at :15 (previous run)
2. **Researcher runs in parallel** - Different concern (research updates), doesn't conflict with worker
3. **Merge has visibility** - By :45, worker (current) and researcher (current) have created branches if needed
4. **15-min cycles** - Small enough for responsiveness, large enough to complete work

**Key insight:** Watcher at :15 checks **last hour's worker**, not current hour's. This gives worker 15 minutes to complete before health check.

---

### Failure Modes & Recovery

**Scenario 1: Worker runs long (>55 minutes)**

```
14:00 - Worker starts
14:55 - Worker still running (hit timeout)
15:00 - Next worker run triggers

What happens:
• Claude Code enforces 45-min timeout → worker stops at 14:45
• Worker saves partial progress (commits what's done)
• 15:00 worker sees incomplete task, may resume or pick different task
• Watcher at 15:15 logs warning: "Previous worker timed out"
```

**Result:** Graceful degradation. Partial work saved, next cycle continues.

---

**Scenario 2: Researcher crashes**

```
14:30 - Researcher starts
14:32 - Researcher crashes (out of memory)

What happens:
• Watcher at 14:45 sees no researcher log in last 15 minutes
• Watcher posts alert to coordination channel: "Researcher crashed"
• Human investigates (checks logs/autonomous/researcher_*.log)
• Next researcher run at 15:30 continues (each run is independent)
```

**Result:** Self-healing. Watcher detects, alerts, next run continues.

---

**Scenario 3: Merge orchestrator backlog**

```
14:45 - Merge orchestrator runs, finds 20 auto/* branches

What happens:
• Merge orchestrator processes oldest 15 (hard limit)
• Remaining 5 wait for next cycle
• 15:45 - Merge runs again, processes remaining 5
```

**Result:** Throughput limit. System processes at most 15 merges/hour. If work piles up faster, backlog grows (human intervention needed to scale up).

---

## Section 07: Hands-On Exercises

### Exercise 1: Trace an Autonomous Cycle

**Objective:** Understand the full workflow by tracing a cycle.

**Scenario:** It's 16:00 UTC. The roadmap has these tasks:

- [ ] **CRITICAL**: Add carbon capture phase (research complete)
- [ ] **HIGH**: Implement famine cascades (missing parameters)
- [ ] **MEDIUM**: Refactor government module (ready)

The research channel has 1 unread message from Cynthia (posted at 15:30):
> [COMPLETED] Carbon capture research done. Parameters in research/carbon_capture_20251107.md

**Task:** Simulate what happens from 16:00 to 17:00.

**Questions:**
1. At 16:00, which task does the worker pick? Why?
2. At 16:15, what does the watcher check?
3. At 16:30, what does the researcher do?
4. At 16:45, what does the merge orchestrator process?
5. At 17:00, what's the state of main branch?

**Self-check answers:**
1. Carbon capture (CRITICAL + research complete). Famine cascades is blocked (missing parameters).
2. Checks 15:00 worker run (from previous hour), not current 16:00 run.
3. Reads research channel, sees no new questions (Cynthia already answered at 15:30), runs research age audit.
4. Processes auto/worker-16:00 branch (carbon capture) + any backlog from earlier hours.
5. Main includes carbon capture feature (merged at 16:45).

---

### Exercise 2: Failure Mode Analysis

**Objective:** Understand how the system handles failures.

**Scenario:** At 14:07, the worker crashes (disk full). At 14:15, the watcher runs.

**Task:** Trace what happens from 14:15 to 15:00.

**Questions:**
1. What does the watcher detect at 14:15?
2. What remediation does it attempt?
3. Does the worker run again at 15:00?
4. What happens if disk is still full at 15:00?

**Self-check answers:**
1. Finds worker log from 14:00, sees errors (❌ emoji), detects disk full message.
2. Runs cleanup (removes logs >30 days, MC logs >7 days), posts alert to coordination channel.
3. Yes - each worker run is independent. If cleanup freed space, 15:00 run succeeds.
4. Worker pre-flight checks fail (disk full), exits early, logs error. Watcher at 15:15 posts another alert.

---

### Exercise 3: Timing Optimization

**Objective:** Understand why timing offsets matter.

**Scenario:** You're proposing to change the schedule to:
```
:00 - Worker
:10 - Watcher (change from :15)
:20 - Researcher (change from :30)
:40 - Merge (change from :45)
```

**Task:** Identify 3 problems with this new schedule.

**Questions:**
1. What happens if worker takes 15 minutes?
2. What happens if researcher takes 25 minutes?
3. What happens if merge takes 15 minutes?

**Self-check answers:**
1. Worker finishes at :15, but watcher runs at :10 (checks previous run, not current - OK). But this reduces buffer - if worker runs long, less time before researcher at :20.
2. Researcher starts :20, finishes :45. Merge runs :40 - **CONFLICT**. Merge tries to process branches while researcher is still creating them.
3. Merge starts :40, finishes :55. Next worker at :00 (5-min buffer). If merge runs long, it overlaps next worker - **CONFLICT**.

**Conclusion:** 15-min offsets provide better buffering than 10-min offsets. (:15/:30/:45 schedule has 15-min minimum buffer between jobs.)

---

### Exercise 4: Roadmap Priority Simulation

**Objective:** Understand task selection logic.

**Scenario:** The roadmap has:

- [ ] **CRITICAL**: Nuclear safeguards (research in progress)
- [ ] **CRITICAL**: Carbon capture (research complete)
- [ ] **HIGH**: Famine model (research complete)
- [ ] **HIGH**: Government refactor (no research needed, ready)
- [ ] **MEDIUM**: Dashboard polish (ready)

**Task:** For each autonomous run, predict which task is selected.

**Run 1 (10:00):** All tasks as above.
**Run 2 (11:00):** Nuclear safeguards research completed at 10:30.
**Run 3 (12:00):** Carbon capture and nuclear safeguards both merged.

**Questions:**
1. Which task at 10:00?
2. Which task at 11:00?
3. Which task at 12:00?

**Self-check answers:**
1. Carbon capture (CRITICAL + ready). Nuclear safeguards is blocked (research not done).
2. Nuclear safeguards (CRITICAL + now ready, after research completed).
3. Famine model (highest priority remaining - HIGH).

**Pattern:** Priority order: CRITICAL > HIGH > MEDIUM, but blocked tasks (no research) are skipped regardless of priority.

---

## Key Takeaways

By now you should understand:

1. **4-job architecture:** Worker (:00), Watcher (:15), Researcher (:30), Merge (:45) coordinate via timing
2. **Autonomous worker:** 11-stage workflow from roadmap analysis → implementation → PR creation (534 lines)
3. **Worker watcher:** Health monitoring with auto-remediation (443 lines)
4. **Research worker:** Parallel research updates, age audits
5. **Merge orchestrator:** Auto-merge up to 15 PRs/hour (396 lines)
6. **Timing rationale:** 15-min offsets prevent conflicts, provide buffers
7. **End-to-end cycle:** Roadmap → research → implement → test → merge, fully autonomous

**Most important insight:** Autonomous systems aren't magic. They're **boring, predictable scheduling** combined with **careful error handling** and **explicit health monitoring**. The genius is in the **timing design** that makes 4 independent jobs coordinate without messaging.

---

## Related Modules

- **[02_COMMUNICATION_SYSTEMS.md](./02_COMMUNICATION_SYSTEMS.md)** - Chatroom + Matrix (what workers post to)
- **[04_REMOTE_INFRASTRUCTURE.md](./04_REMOTE_INFRASTRUCTURE.md)** - GCP VM setup (where this runs)
- **[05_PLANNING_COORDINATION.md](./05_PLANNING_COORDINATION.md)** - Roadmap structure (what worker reads)
- **[08_QUALITY_GATES.md](./08_QUALITY_GATES.md)** - Validation workflows (what worker runs)

---

## Key Files for Reference

- **`autonomous-worker.sh`** - Main worker script (534 lines)
- **`scripts/autonomous-worker-watcher.sh`** - Health monitoring (443 lines)
- **`scripts/merge-orchestrator.sh`** - Auto-merge PRs (396 lines)
- **`researcher-worker.sh`** - Research updates
- **`scripts/CRON_SETUP.md`** - Cron configuration (234 lines)
- **`docs/AUTONOMOUS_SETUP.md`** - Complete setup guide (200+ lines)

---

## Self-Check Questions

Before moving to the next module, you should be able to answer:

1. **Why 4 separate jobs instead of 1 big job?** (Hint: separation of concerns, independent failures)
2. **Why does watcher run at :15, not :00?** (Hint: checks previous hour's run, gives worker buffer)
3. **What happens if worker times out?** (Hint: 45-min hard timeout, partial work saved, next run continues)
4. **Why does researcher run at :30?** (Hint: parallel to worker, different concern, mid-hour timing)
5. **What's the merge orchestrator's rate limit?** (Hint: 15 branches/hour, prevents pile-up)

If you can answer these confidently, you're ready for Module 04: Remote Infrastructure.

---

**Next:** [Module 04: Remote Infrastructure](./04_REMOTE_INFRASTRUCTURE.md) - Learn how to deploy this autonomous system on a GCP VM with proper monitoring, backup, and disaster recovery.
