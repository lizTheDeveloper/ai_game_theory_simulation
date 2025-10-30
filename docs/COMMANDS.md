# Command Reference

Complete command reference for running simulations, tests, and diagnostic scripts.

## Table of Contents
- [Running Simulations](#running-simulations)
- [Testing](#testing)
- [Building & Development](#building--development)
- [Research Question Extraction](#research-question-extraction)
- [Profiling & Performance](#profiling--performance)

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

## Logging Best Practices

**IMPORTANT: Always save logs to `/logs/` directory, NEVER `/tmp/`**

```bash
# ✅ GOOD - Logs persist and are tracked
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# ❌ BAD - /tmp gets cleared, logs lost
npx tsx scripts/monteCarloSimulation.ts > /tmp/output.log 2>&1 &
```

## Additional Resources

- **Wiki:** `docs/wiki/README.md` - Comprehensive system documentation
- **Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Active priorities
- **DevLogs:** `devlogs/` - Implementation notes
- **Research:** `research/` - Peer-reviewed findings
- **Emoji Reference:** `docs/EMOJI_QUICK_REFERENCE.md` - One-page cheat sheet
