# Command Reference

Complete command reference for running simulations, tests, and diagnostic scripts.

## Table of Contents
- [Running Simulations](#running-simulations)
- [Testing](#testing)
- [Building & Development](#building--development)
- [Research Question Extraction](#research-question-extraction)
- [Profiling & Performance](#profiling--performance)
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

### Test Philosophy

- **Regression tests:** `tests/refactoring/` - Phase 1 (utilities), Phase 2 (systems), baseline integration
- **Monte Carlo validation:** All features require N≥10 runs to validate behavior

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

See `plans/performance-optimization-plan.md` for detailed analysis:
- **Memory:** Deep cloning in hot paths (10-100MB per step)
- **CPU:** O(n²) array operations (505+ across 70 files)
- **Parallelization:** No parallel phase execution

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

### Automated Merge Orchestrator

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
