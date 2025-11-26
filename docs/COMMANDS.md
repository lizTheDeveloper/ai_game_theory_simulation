# Command Reference

Complete command reference for running simulations, tests, and diagnostic scripts.

## Table of Contents
- [Running Simulations](#running-simulations)
- [Testing](#testing)
- [Building & Development](#building--development)
- [Research Question Extraction](#research-question-extraction)
- [Profiling & Performance](#profiling--performance)
- [Maintenance & Cleanup](#maintenance--cleanup)
- [Autonomous Worker Monitoring](#autonomous-worker-monitoring)

## Running Simulations

### Background Execution (Critical)

**ALWAYS run long-running scripts in background** to continue working while they execute:

```bash
# ✅ GOOD - Run in background, continue working
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# ❌ BAD - Blocks terminal, wastes time
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120
```

### Single Simulation Run

**Headless simulation (no UI):**
```bash
npx tsx scripts/debugCapabilityGrowth.ts
```

### Monte Carlo Simulations

**Basic Runs:**
```bash
# Quick test (10 runs × 120 months, ~5 minutes)
npx tsx scripts/monteCarloSimulation.ts

# Custom parameters
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=60

# Deep analysis (ALWAYS RUN ASYNC)
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Check background job
jobs
tail -f logs/mc_*.log
```

**Parameter Sweep (Added Oct 30, 2025):**

Comprehensive validation across full parameter space:
```bash
# CLI approach (1,000 runs: 2 scenarios × 5 thresholds × N=100)
# Sequential execution for stability (~3-5 hours)
./scripts/runParameterSweepCLI.sh > logs/sweep_master_$(date +%Y%m%d).log 2>&1 &

# Browser-based approach (requires UI runtime)
npx tsx scripts/runParameterSweep.ts

# Configuration:
#   • Scenario modes: historical, unprecedented
#   • Threshold scenarios: doom, cautious, baseline, progressive, utopia
#   • Seeds: 50000-50099 (N=100 per configuration)
#   • Output: monteCarloOutputs/sweep_YYYYMMDD_HHMMSS/
```

### Multi-Paradigm DUI Visualizations

Added October 20, 2025 - visualize 4 simultaneous paradigm perspectives:

```bash
# Visualize single run trajectory (sparklines, heatmap, divergence timeline)
npx tsx scripts/visualizeParadigmTrajectories.ts monteCarloOutputs/run_42000_historical_events.json

# Compare multiple runs (side-by-side trajectories, aggregate statistics)
npx tsx scripts/compareParadigmRuns.ts monteCarloOutputs/
```

### Climate Hindcast Validation

Added November 24, 2025 - validate simulation CO2 trajectory against historical Keeling curve data.

```bash
# Run hindcast validation (1990-2010 CO2 trajectory)
npx tsx scripts/hindcastValidation.ts --runs=5 --max-months=240

# Quick test (fewer runs)
npx tsx scripts/hindcastValidation.ts --runs=3 --max-months=120

# Full validation (recommended, run in background)
npx tsx scripts/hindcastValidation.ts --runs=10 --max-months=240 > logs/hindcast_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Checkpoints validated:**
- CO2 (Scripps/NOAA Keeling curve): 1990=354ppm, 1995=361ppm, 2000=369ppm, 2005=380ppm, 2010=390ppm
- Temperature (HadCRUT5): 1990=0.45°C → 2010=0.85°C

**Pass criteria:** CO2 error ≤5% at each checkpoint
**Output:** `logs/hindcast/hindcast_TIMESTAMP.log`

### Monte Carlo Analysis Scripts

**Bifurcation Metrics Analysis (Added Nov 13, 2025):**

Analyze variance amplification patterns from Monte Carlo runs:

```bash
# Analyze bifurcation time series from Monte Carlo outputs
npx tsx scripts/analyzeBifurcationMetrics.ts monteCarloOutputs/

# Output includes:
#   • System-specific amplification statistics (environmental, social, economic, etc.)
#   • Distribution analysis (P50, P75, P90, P95, P99)
#   • Threshold proximity patterns
#   • System multiplier calibration recommendations
#   • Saved to: monteCarloOutputs/bifurcation_analysis_results.json
```

**Usage Notes:**
- Run after Monte Carlo simulations complete
- Requires bifurcation time series data (available in runs from Nov 13, 2025+)
- Helps validate and calibrate variance amplification parameters

### Other Diagnostic Scripts

```bash
# Adversarial AI evaluation (sleeper agents, benchmarks)
npx tsx scripts/diagnosticAdversarialEval.ts

# Extinction analysis
npx tsx scripts/investigateExtinction.ts

# Control-dystopia mechanics
npx tsx scripts/testControlDystopia.ts

# Technology effects validation
npx tsx scripts/validateTechEffects.ts

# Population conversion validation (Phase 2)
npx tsx scripts/validatePhase2PopulationConversion.ts

# Aggregate statistics validation (Phase 3)
npx tsx scripts/validatePhase3.ts

# Emoji consistency check
npx tsx scripts/validateEmojiConsistency.ts

# Codebase validation (property access, type safety)
npx tsx scripts/validateCodebase.ts

# Circular dependency check (phase execution graph)
npx tsx logs/validate_no_cycles.ts

# NaN/RNG debugging utilities
npx tsx scripts/testRNG.ts                    # Minimal RNG binding test
npx tsx scripts/testInitialization.ts         # Isolate init with RNG
npx tsx scripts/diagnosticSpiralThresholds.ts # Spiral activation window analysis
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npx tsx --test tests/refactoring/phase1-utilities.test.ts

# Run regression tests (standalone)
npx tsx tests/refactoring/runRegressionTests.ts
```

### Test Framework

**This project uses Node's native test runner** (`node --test` via tsx), not vitest or jest.

- Test command: `npx tsx --test tests/**/*.test.ts`
- Assertion style: Node's `assert` module (not vitest's `expect` API)
- Coverage: `--experimental-test-coverage` flag available

**All tests converted to Node native test framework (Nov 19, 2025):**
- ✅ `tests/integration/novel-entities-irreversibility.test.ts` (667 lines converted)
- ✅ `tests/unit/irreversibility.test.ts` (744 lines converted)

Full test suite now runs with native Node test runner. 4 test failures are pre-existing simulation logic issues (non-determinism, deployment bugs), not conversion issues.

### Test Philosophy

- **Regression tests:** `tests/refactoring/` - Phase 1 (utilities), Phase 2 (systems), baseline integration
- **Monte Carlo validation:** All features require N≥10 runs to validate behavior

### Determinism Validation (Added Nov 6, 2025)

**Purpose:** Verify simulation produces identical outcomes for identical seeds (critical for Monte Carlo analysis).

```bash
# Comprehensive validation (10 runs × 36 months, statistical analysis)
npx tsx scripts/comprehensiveDeterminismValidation.ts

# Quick sanity check (5 runs × 2 months, 5-10 seconds)
npx tsx scripts/quickDeterminismTest.ts

# RNG sequence comparison (debug tool)
LOG_RNG_CALLS=true npx tsx scripts/compareRngSequences.ts

# Divergence debugging
npx tsx scripts/debugDivergence.ts

# Phase-level tracking (binary search for divergence)
npx tsx scripts/findDivergentPhase.ts
```

**Pass Criteria:** 9-10/10 runs identical (CV ≤ 0.01%), 90%+ success rate acceptable

**Infrastructure:**
- Pre-commit hook: Blocks unsorted Object.entries/keys iterations
- CI workflow: `.github/workflows/determinism-validation.yml.disabled` (⚠️ TEMPORARILY DISABLED Nov 6, 2025 - conserving Claude API tokens)
- Investigation logs: `/logs/determinism_*.md` (2,758 lines of debugging artifacts)

**Current Status:** 90% determinism achieved (9/10 runs identical), 10% regression under investigation
**Note:** Run manual validation until CI workflow re-enabled: `npx tsx scripts/comprehensiveDeterminismValidation.ts`

### Deployment Smoke Tests (Added Nov 26, 2025)

**Purpose:** Quick health checks verifying a deployed version isn't broken. Target: <60s execution.

```bash
# Run all deployment smoke tests
npx tsx scripts/deploymentSmokeTest.ts
```

**Tests (7 total, ~7s execution):**
1. **Initialization** - Simulation creates valid initial state
2. **12-month run** - Simulation completes without crashes
3. **No NaN/Infinity** - All critical state fields have finite values
4. **Phase execution** - Phases run and advance time correctly
5. **State serialization** - JSON roundtrip works (save/load compatibility)
6. **Determinism** - Same seed produces identical results
7. **Game layer compatibility** - Required fields exist for UI consumption

**Exit Codes:**
- `0` = All checks passed
- `1` = One or more checks failed (details printed)

**Use Cases:**
- Post-deployment verification (CI/CD)
- Quick local sanity check before committing
- Detecting broken builds after refactoring

## Building & Development

### Next.js Frontend

```bash
# Development server (port 3333)
npm run dev

# Build production
npm run build

# Start production server
npm start
```

### Type Checking & Linting

```bash
# Type checking (no emit)
npx tsc --noEmit

# Linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Research Question Extraction

### Manual Extraction

```bash
# Backup conversations first
bash claude-conversations/backup-conversations.sh

# Extract questions to wiki
npx tsx scripts/extractResearchQuestions.ts > docs/wiki/RESEARCH_QUESTIONS.md
```

### Automated Extraction (macOS)

```bash
# Install daily scheduler (runs at 2:00 AM)
bash scripts/install-research-questions-scheduler.sh install

# Check status
bash scripts/install-research-questions-scheduler.sh status

# Run immediately
bash scripts/install-research-questions-scheduler.sh run-now

# Uninstall
bash scripts/install-research-questions-scheduler.sh uninstall
```

The scheduler automatically:
1. Backs up conversations from `~/.claude/projects/`
2. Extracts research questions using pattern matching
3. Updates `docs/wiki/RESEARCH_QUESTIONS.md`
4. Logs to `logs/research-questions-update.log`

### Pattern Matching

Questions must contain `?` and match research-oriented patterns (14 patterns):
- `what if`, `what would`, `what happens`, `what are the`, `what is the`, `what does`
- `how do`, `how does`, `how can`, `how would`, `how might`
- `why do`, `why does`, `why is`, `why are`, `why would`
- `can we model`, `can we simulate`, `can we test`, `can we measure`
- `is it possible`, `would it`, `could we`, `could it`, `should we`
- `do you think`
- `what's the relationship`, `what's the effect`, `what's the impact`
- `how much`, `how often`, `how fast`, `how quickly`
- `what determines`, `what drives`, `what causes`

### Topic Categorization

13 automatic topics via keyword matching:
- alignment, capabilities, collective, control, deception, detection, economic, environmental, evolutionary, social, suffering, technology, general

**Current status:** 256 research questions cataloged in `docs/wiki/RESEARCH_QUESTIONS.md`

## Profiling & Performance

### Built-in Performance Instrumentation (Added Nov 12, 2025)

**Comprehensive phase-level timing built into PhaseOrchestrator:**

```bash
# Enable profiling via config flag
npx tsx scripts/testPerformanceProfiling.ts

# Or in your simulation code:
const state = createTestState({
  config: {
    enablePerformanceProfiling: true,
    slowPhaseThresholdMs: 10  // warn if phase >10ms (default)
  }
});

# Export timing data
orchestrator.exportPhaseTimingsCSV('logs/phase_timings.csv');
orchestrator.exportPhaseTimingsJSON('logs/phase_timings.json');
```

**API Methods:**
- `orchestrator.getPhaseTimings()` - Returns Map with min/max/p95/samples per phase
- `orchestrator.getStepTimings()` - Returns per-month total step times
- `orchestrator.setSlowPhaseThreshold(ms)` - Configure slow phase warnings

**Output Format:**
- **CSV:** Phase,Avg_ms,P95_ms,Max_ms,Min_ms,Total_ms,Calls
- **JSON:** Nested structure with summary stats (total phases, avg/p95/max step times)

**Performance:** Profiling overhead <1% (negligible impact on simulation)

**Files:**
- `src/simulation/engine/PhaseOrchestrator.ts` - Timing collection
- `src/simulation/engine.ts` - Config flag integration
- `src/types/config.ts` - enablePerformanceProfiling flag
- `scripts/testPerformanceProfiling.ts` - Validation test

### Node.js Built-in Profiler

```bash
# Run with profiler
node --prof $(which tsx) scripts/monteCarloSimulation.ts --runs=10

# Process isolate file
node --prof-process isolate-*.log > profile.txt

# View profile
less profile.txt
```

### Memory Analysis

```bash
# Heap snapshot
node --heapsnapshot-signal=SIGUSR2 $(which tsx) scripts/monteCarloSimulation.ts

# Send signal to capture snapshot (from another terminal)
kill -SIGUSR2 <pid>
```

### Performance Considerations

See `reviews/PERFORMANCE_BOTTLENECK_ANALYSIS_20251112.md` for detailed O(n²) analysis:
- **Current Performance:** ~144ms avg/step, 5-10s for 360-month run (ACCEPTABLE)
- **Major Fix:** O(n²) organizationManagement.ts bottleneck resolved (Nov 10, 70× improvement)
- **Remaining Work:** Government agent patterns (10 potential nested loops), profiling infrastructure
- **Memory:** Deep cloning addressed (HIGH-3 complete)
- **Target:** <20ms/step for interactive, <5s for 360-month run

## Git Operations

### Worktrees for Parallel Work

```bash
# Create worktree for parallel feature work
git worktree add ../superalignment-feature-x feature-x

# Agent works in isolation
cd ../superalignment-feature-x
# ... implement feature ...

# Merge back when done
cd ../superalignmenttoutopia
git merge feature-x
git worktree remove ../superalignment-feature-x
```

### Commit & PR Creation

See CLAUDE.md "Git Safety Protocol" section for detailed commit/PR guidelines.

### Merge Utilities

#### Manual Merge with Log Cleanup

**Purpose:** Merge branches with automatic log file conflict resolution (keeps logs deleted, preventing log accumulation).

```bash
# Merge a branch with auto-resolved log conflicts
./scripts/merge-with-log-cleanup.sh <branch-name>

# Example
./scripts/merge-with-log-cleanup.sh auto/worker-20251105_230001
```

**What it resolves automatically:**
- Deleted log files (`*.log`) - keeps them deleted (status: DU)
- Log file conflicts - prefers current branch (ours)
- `research/UPDATE_QUEUE.md` - keeps current version (auto-generated)

**Use when:** Merging autonomous worker branches or any branches with log conflicts.

#### Automated Merge Orchestrator

**Purpose:** Hourly automated branch merging with quality gates (reduces manual merge overhead).

```bash
# Run orchestrator (discovers branches, runs quality gates, auto-merges)
./scripts/merge-orchestrator.sh

# Test mode (no actual merges)
./scripts/merge-orchestrator.sh --dry-run

# Limit branches processed per run
./scripts/merge-orchestrator.sh --max-branches 5

# Combined flags
./scripts/merge-orchestrator.sh --dry-run --max-branches 3
```

**Environment Variables:**
- `IS_VM="true"` - Skip frontend branches on VM (set automatically on VM environment)
- `MERGE_ORCHESTRATOR_DRY_RUN="true"` - Test mode (alternative to --dry-run flag)
- `MERGE_ORCHESTRATOR_MAX_BRANCHES=10` - Max branches per run (default: 10)

**Workflow:**
1. Discovers all feature branches (excludes main, HEAD, existing merge branches)
2. [VM only] Detects frontend changes → skips frontend branches
3. Creates timestamped merge branch: `merge/{branch}_{timestamp}`
4. Attempts merge from feature branch
5. If conflicts → aborts, reports, skips branch
6. If clean → runs quality gates:
   - Gate 1: TypeScript compilation (`npx tsc --noEmit`)
   - Gate 2: Test suite (`npm test` or `npm run test:backend` on VM)
   - Gate 3: Architecture-skeptic review (agent integration pending)
   - Gate 4: Sylvia final review (agent integration pending)
7. If all gates pass → merges to main, deletes feature branch
8. If any gate fails → preserves merge branch with `_FAILED` suffix

**Platform Compatibility (Nov 12, 2025):**
- Claude spawning no longer uses `timeout` command (GNU coreutils not available on macOS)
- Auto-remediation now works on both macOS and Linux
- Claude processes run without artificial time limits (orchestrator manages overall runtime)

**Safety Features:**
- Lock file prevents concurrent runs (`/tmp/merge-orchestrator.lock`)
- Protected branches (never deletes main)
- Failed merge branches preserved for inspection
- Dry-run mode for testing
- Comprehensive logging with color output

**Logs:** `logs/merge_orchestrator_YYYYMMDD_HHMMSS.log`

**Next Steps:** Set up hourly cron job (Mac) and systemd timer (VM)

## Logging Best Practices

**IMPORTANT: Always save logs to `/logs/` directory, NEVER `/tmp/`**

```bash
# ✅ GOOD - Logs persist and are tracked
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# ❌ BAD - /tmp gets cleared, logs lost
npx tsx scripts/monteCarloSimulation.ts > /tmp/output.log 2>&1 &
```

### Log Retention by Type

**Standard logs** (`logs/*.log`):
- Monte Carlo runs, validation tests, debugging output
- **Git-ignored** (not tracked in version control)
- Local only, can be cleaned up manually

**Autonomous worker logs** (`logs/autonomous/*.log`):
- **Git-tracked** (preserved in version control forever)
- Complete audit trail of all autonomous work
- Each run commits its log file to feature branch
- See `AUTONOMOUS_SETUP.md` for details

## Maintenance & Cleanup

Added November 5, 2025 - unified log backup and disk space management.

### GCS Log Backup & Cleanup

**Purpose:** Archive logs to Google Cloud Storage, compress/delete old logs, prune merged git branches, and free disk space.

```bash
# Run cleanup and backup (works on both Mac and VM)
./scripts/cleanup-and-backup.sh
```

**What It Does:**

1. **Archives logs to GCS** (`gs://multiverseschool-logs/archives/`)
   - Uploads all logs to timestamped GCS archive
   - Compresses logs >7 days old (gzip)
   - Deletes logs >30 days old (only after GCS backup)
   - Safe: No destructive operations without successful GCS backup

2. **Prunes merged git branches**
   - Deletes local branches already merged to main
   - Removes stale remote tracking branches
   - Preserves main/master and current branch

3. **Git garbage collection**
   - Runs `git gc --aggressive --prune=now`
   - Removes unreachable objects
   - Can free ~1GB on VM environments

**Environment Detection:**
- Auto-detects Mac vs VM environment
- VM: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation`
- Mac: Relative to script location

**GCS Setup:**
- Bucket: `gs://multiverseschool-logs` (europe-west10)
- VM service account has `objectAdmin` role
- Requires `gsutil` CLI (part of Google Cloud SDK)

**Disk Space Freed:**
- Logs: ~1.3GB archived and optionally deleted
- Git objects: ~1GB from aggressive gc
- Old branches: Varies by repository state

**Safety Features:**
- ✅ Logs only deleted after successful GCS upload
- ✅ Preserves logs <30 days locally
- ✅ Never deletes protected branches (main, master)
- ✅ Comprehensive logging with color output

**When to Run:**
- Weekly on VM (or add to cron)
- Before low disk space warnings
- After major development cycles with many branches

## Channel Monitoring

Added October 31, 2025 - autonomous channel monitor for orchestrator coordination.

### Running the Monitor

```bash
# Run in background (recommended)
npx tsx scripts/channel-monitor.ts > logs/monitor_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Store PID for later cleanup
echo $! > .monitor.pid

# Stop monitor
kill $(cat .monitor.pid)
```

### How It Works

The monitor polls channels every 30 seconds and processes messages **one-at-a-time like an MQTT queue**:

1. Reads oldest unread message from monitored channels
2. Analyzes if attention needed (trigger keywords/statuses)
3. Checks if orchestrator already active (thundering-herd protection)
4. If orchestrator available: Spawns orchestrator + marks message as processed
5. If orchestrator busy: Message stays in queue, retried next poll
6. Next poll processes next oldest message

**Guarantees:**
- Each message gets exactly one orchestrator spawn
- Messages wait in queue if orchestrator busy
- No lost messages, no duplicate spawns
- Ordered processing (FIFO)

### Monitored Channels

- `implementation.md` - Feature work, blockers, questions
- `research.md` - Research findings needing validation
- `coordination.md` - General coordination requests

### Trigger Conditions

**Statuses:** `QUESTION`, `ALERT`, `STARTED`, `BLOCKED`
**Keywords:** "can someone", "need help", "orchestrator"

### Silent Mode

Monitor respects `.claude/silent-mode`:
- `enabled` - Voice notifications off (default)
- `disabled` - Voice notifications on

### Thundering-Herd Protection

Monitor checks if orchestrator is already active before spawning to prevent multiple concurrent orchestrators fighting over the same work. Messages wait in queue until the orchestrator is available, ensuring each message eventually gets processed.

## Autonomous Worker Monitoring

Added October 30, 2025 - comprehensive instrumentation for autonomous worker runs.

### View Run History

```bash
# View chronological summary of all autonomous runs
./scripts/viewAutonomousRuns.sh
```

Shows for each run:
- Status (success/timeout/error)
- Duration (total and Claude execution time)
- Files changed and commits made
- Branch name and log file location
- Summary statistics (total runtime, average per run)

### Monitor Current Run

```bash
# View current stage
cat logs/autonomous/status_current.txt

# Follow worker log in real-time
tail -f logs/autonomous/worker_*.log

# View specific run metrics (JSON)
cat logs/autonomous/metrics_20251030_223350.json
```

### Metrics Structure

Each run exports structured metrics to `logs/autonomous/metrics_TIMESTAMP.json`:
- `timestamp`: Run start time
- `branch`: Feature branch created
- `commit`: Starting commit hash
- `duration_seconds`: Total runtime
- `claude_duration_seconds`: Claude execution time
- `claude_exit_code`: Exit status (0=success, 124=timeout)
- `changed_files`: Number of files modified
- `commits_made`: Number of commits in session
- `pr_created`: Boolean - whether PR was successfully created (added Oct 30, 2025)
- `memory_used`: Peak memory usage
- `disk_used`: Disk space used

### Worker Stages

The autonomous worker executes in 7 stages:
1. **PRE-FLIGHT CHECKS** - Health (disk, memory), dependencies (git, node, python, claude), chatroom monitors (auto-starts if not running)
2. **GIT SYNC** - Pull latest, resolve conflicts, create branch
3. **ENVIRONMENT SETUP** - Activate venv, verify Claude version
4. **CLAUDE CODE EXECUTION** - Run orchestrator workflow (25-minute timeout)
   - **Exhaustive backlog processing** (updated Nov 7, 2025): Works through entire roadmap (CRITICAL → HIGH → MEDIUM → LOW)
   - **Token budget guidance:** Under 75% = aggressive mode (full backlog), 75-90% = normal (CRITICAL/HIGH/MEDIUM), over 90% = conservative (CRITICAL/HIGH only)
5. **GIT OPERATIONS** - Commit changes, push branch
6. **PR CREATION** - Automatically create pull request with metrics (added Oct 30, 2025)
7. **METRICS COLLECTION** - Export JSON metrics, update status

### Health Monitoring & Auto-Remediation

Added November 5, 2025 - proactive health checking with self-healing capabilities.

**Run health check manually:**
```bash
# Check worker health (analyzes last 90 minutes)
./scripts/autonomous-worker-watcher.sh

# View watcher logs
tail -100 logs/worker_watcher/watcher_*.log
```

**Automated cron schedule (recommended):**
```bash
# :00 - Autonomous worker runs
0 * * * * cd ~/ai_game_theory_simulation && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# :15 - Health check & auto-fix
15 * * * * cd ~/ai_game_theory_simulation && ./scripts/autonomous-worker-watcher.sh >> logs/cron_watcher.log 2>&1

# :45 - Merge orchestrator
45 * * * * cd ~/ai_game_theory_simulation && ./scripts/merge-orchestrator.sh >> logs/cron_merge.log 2>&1
```

**What it monitors:**
- Worker execution frequency (detects workers not running)
- Error patterns in recent logs (Claude failures, timeouts)
- Worker branch accumulation (merge backlog)
- Merge orchestrator health
- Cron service status (VM only)

**Auto-remediation capabilities:**
- Spawns Claude Code to diagnose and fix issues (10-minute timeout)
- Restarts cron if stopped
- Kills hung worker processes
- Cleans up lock files
- Diagnoses API key issues

**Watcher logs** (`logs/worker_watcher/watcher_*.log`):
- Complete health check report
- Issue detection and diagnosis
- Auto-remediation attempts
- Manual troubleshooting steps (if auto-fix unavailable)

See: `scripts/CRON_SETUP.md` for complete setup guide and troubleshooting.

### Log Files

**Worker logs** (`logs/autonomous/worker_*.log`):
- Complete session transcript with colored, stage-based output
- Timing for each stage
- Git operations summary
- Error tracking and exit codes
- **Git-tracked** (preserved forever in feature branches)

**Metrics files** (`logs/autonomous/metrics_*.json`):
- Structured data for aggregation/analysis
- Machine-readable format
- **Git-tracked** (preserved with worker logs)

**Status file** (`logs/autonomous/status_current.txt`):
- Real-time stage indicator
- Updated as worker progresses
- Deleted when run completes
- **Git-ignored** (transient state only)

## Additional Resources

- **Wiki:** `docs/wiki/README.md` - Comprehensive system documentation
- **Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active priorities
- **DevLogs:** `devlogs/` - Implementation notes
- **Research:** `research/` - Peer-reviewed findings
- **Emoji Reference:** `docs/EMOJI_QUICK_REFERENCE.md` - One-page cheat sheet
- **Autonomous Worker Setup:** `AUTONOMOUS_SETUP.md` - Autonomous worker configuration
