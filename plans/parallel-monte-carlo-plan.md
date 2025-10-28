# Parallel Monte Carlo Simulation Implementation Plan

**Date**: October 28, 2025
**Author**: validator-agent
**Objective**: Parallelize Monte Carlo simulations with run-number-prefixed logging to reduce execution time from ~17 minutes to ~2-3 minutes

## Motivation

**Current Performance**: 100 runs × 10.3s = ~17 minutes (sequential)
**Target Performance**: 100 runs / 8 cores = ~2 minutes (parallel)

**Key Challenge**: When runs execute in parallel, console logs interleave and become unreadable.

**Solution**: Prefix all console output with `[Run X]` so logs can be distinguished.

## Design Approach

### Option 1: Console Intercept (Simplest)
Intercept `console.log()` globally and add run number prefix.

**Pros**:
- No changes to simulation code
- Works for all existing logs
- Easy to implement

**Cons**:
- Global state (needs async_hooks or similar)
- Harder to test
- May miss some logging

### Option 2: Logger Wrapper (Recommended)
Pass a logger object through the simulation that prefixes automatically.

**Pros**:
- Clean, testable
- No global state
- Can add colors, timestamps, log levels
- Already have logger utility in codebase!

**Cons**:
- Need to thread logger through code
- More refactoring

### Option 3: AsyncLocalStorage (Node.js)
Use Node.js AsyncLocalStorage to track run context.

**Pros**:
- Automatic context propagation
- No explicit passing needed
- Clean separation

**Cons**:
- Node.js specific
- Adds complexity
- May have performance overhead

**Decision**: **Option 2 (Logger Wrapper)** - Already have `logger` utility, just need to enhance it.

## Implementation Plan

### Phase 1: Enhance Logger Utility

**File**: `src/simulation/utils/asyncLogger.ts`

Current logger exists but doesn't support prefixing. Add:

```typescript
class Logger {
  private prefix: string = '';

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  log(message: string): void {
    console.log(`${this.prefix}${message}`);
  }

  warn(message: string): void {
    console.warn(`${this.prefix}${message}`);
  }

  error(message: string): void {
    console.error(`${this.prefix}${message}`);
  }
}
```

**OR** simpler approach: Override console methods temporarily

```typescript
export function wrapConsoleWithPrefix(prefix: string): () => void {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => originalLog(`${prefix}`, ...args);
  console.warn = (...args) => originalWarn(`${prefix}`, ...args);
  console.error = (...args) => originalError(`${prefix}`, ...args);

  // Return cleanup function
  return () => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  };
}
```

### Phase 2: Wrap Each Simulation Run

**File**: `scripts/monteCarloSimulation.ts`

Modify the run execution to wrap console:

```typescript
// BEFORE (line 1865):
const simulationResult = engine.run(initialState, {
  maxMonths: MAX_MONTHS,
  checkActualOutcomes: true
});

// AFTER:
const runPrefix = `[Run ${String(i + 1).padStart(3, ' ')}/${NUM_RUNS}] `;
const restoreConsole = wrapConsoleWithPrefix(runPrefix);

try {
  const simulationResult = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: true
  });
  // ... rest of processing
} finally {
  restoreConsole(); // Always restore even if error
}
```

### Phase 3: Parallel Execution

**File**: `scripts/monteCarloSimulation.ts`

Convert sequential loop to parallel execution:

```typescript
// BEFORE (line 1823):
for (let i = 0; i < NUM_RUNS; i++) {
  const runStartTime = Date.now();
  const seed = SEED_START + i;
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'summary' });
  // ... 100+ lines of sequential processing
}

// AFTER:
const PARALLEL_BATCH_SIZE = 8; // Number of parallel runs (adjust based on CPU cores)

// Create array of run configurations
const runConfigs = Array.from({ length: NUM_RUNS }, (_, i) => ({
  index: i,
  seed: SEED_START + i,
  scenarioMode: SCENARIO_MODE === 'dual'
    ? (i < Math.floor(NUM_RUNS / 2) ? 'historical' : 'unprecedented')
    : SCENARIO_MODE as ScenarioMode
}));

// Process in batches to avoid overwhelming system
for (let batchStart = 0; batchStart < NUM_RUNS; batchStart += PARALLEL_BATCH_SIZE) {
  const batchEnd = Math.min(batchStart + PARALLEL_BATCH_SIZE, NUM_RUNS);
  const batch = runConfigs.slice(batchStart, batchEnd);

  console.log(`\nExecuting batch ${Math.floor(batchStart / PARALLEL_BATCH_SIZE) + 1}/${Math.ceil(NUM_RUNS / PARALLEL_BATCH_SIZE)}`);
  console.log(`Runs ${batchStart + 1}-${batchEnd} in parallel (${batch.length} runs)...\n`);

  // Run batch in parallel
  const batchResults = await Promise.all(
    batch.map(config => runSingleSimulation(config))
  );

  // Collect results
  results.push(...batchResults);
}
```

### Phase 4: Extract Single Run Function

**File**: `scripts/monteCarloSimulation.ts`

Extract the 100+ lines of run logic into a separate function:

```typescript
async function runSingleSimulation(config: {
  index: number;
  seed: number;
  scenarioMode: ScenarioMode;
}): Promise<RunSummary> {
  const { index, seed, scenarioMode } = config;
  const runStartTime = Date.now();

  // Prefix all console output for this run
  const runPrefix = `[Run ${String(index + 1).padStart(3, ' ')}/${NUM_RUNS}] `;
  const restoreConsole = wrapConsoleWithPrefix(runPrefix);

  try {
    const engine = new SimulationEngine({
      seed,
      maxMonths: MAX_MONTHS,
      logLevel: 'summary'
    });

    const initialState = createDefaultInitialState(scenarioMode);
    initialState.config.runLabel = `Run ${index + 1}/${NUM_RUNS} [${scenarioMode}]`;

    // Sample thresholds
    const seededRng = engine.getRNG();
    const rng = seededRng.next.bind(seededRng);
    const sampledThresholds = importedConfig?.thresholds
      || sampleAllThresholds(rng, {
          scenario: THRESHOLD_SCENARIO,
          sliders: sliderOverrides,
          nested: false
        });
    initialState.thresholds = sampledThresholds;

    // Run simulation
    const simulationResult = engine.run(initialState, {
      maxMonths: MAX_MONTHS,
      checkActualOutcomes: true
    });

    const runElapsed = Date.now() - runStartTime;
    runTimings.push(runElapsed);

    const finalState = simulationResult.finalState;

    // Analyze recovery timeline
    const recoveryTimeline = analyzeRecoveryTimeline(simulationResult, finalState);
    const mechanismSummary = generateMechanismSummary(
      recoveryTimeline,
      finalState,
      simulationResult.summary.finalOutcome
    );

    // Extract paradigm trajectory
    const paradigmTrajectory = finalState.multiParadigmDUI?.history || [];

    // Save individual run event log
    const runLogFile = path.join(outputDir, `run_${seed}_${scenarioMode}_events.json`);
    const eventLogData = {
      seed,
      run: index + 1,
      scenarioMode,
      scenarioDescription: getScenarioDescription(scenarioMode),
      outcome: simulationResult.summary.finalOutcome,
      outcomeReason: simulationResult.summary.finalOutcomeReason,
      totalMonths: simulationResult.summary.totalMonths,
      events: simulationResult.log.events,
      criticalEvents: simulationResult.summary.criticalEvents,
      snapshots: {
        initial: simulationResult.log.snapshots[0],
        final: simulationResult.log.snapshots[simulationResult.log.snapshots.length - 1]
      },
      recoveryTimeline,
      mechanismSummary,
      paradigmTrajectory
    };
    fs.writeFileSync(runLogFile, JSON.stringify(eventLogData, null, 2), 'utf8');

    // Calculate all metrics and return RunSummary
    return calculateRunSummary(simulationResult, finalState, seed, scenarioMode, runElapsed);

  } finally {
    restoreConsole(); // Always restore console
  }
}
```

### Phase 5: Extract Metrics Calculation

Move the massive metrics calculation block into its own function:

```typescript
function calculateRunSummary(
  simulationResult: any,
  finalState: GameState,
  seed: number,
  scenarioMode: ScenarioMode,
  runElapsed: number
): RunSummary {
  // ... all the current metric calculation code (lines 1912-2100+)
  // This is currently ~200 lines, extract to separate function

  return {
    seed,
    scenarioMode,
    outcome: mappedOutcome,
    // ... all other fields
  };
}
```

## Configuration

Add command-line flag to control parallelization:

```typescript
const PARALLEL_ENABLED = args['--parallel'] !== undefined;
const PARALLEL_BATCH_SIZE = parseInt(args['--batch-size'] || '8', 10);

// If parallel disabled, run sequentially (original behavior)
if (!PARALLEL_ENABLED) {
  for (let i = 0; i < NUM_RUNS; i++) {
    const result = await runSingleSimulation({
      index: i,
      seed: SEED_START + i,
      scenarioMode: determineScenarioMode(i)
    });
    results.push(result);
  }
} else {
  // Parallel execution (batched)
  // ... as described above
}
```

## Log Prefix Format

**Current Output** (no prefix):
```
🔍 DEBUGGING AI CAPABILITY GROWTH
==================================
Initial AIs:
  Corporate-0: cap=2.985, align=0.89
```

**New Output** (with prefix):
```
[Run   1/100] 🔍 DEBUGGING AI CAPABILITY GROWTH
[Run   1/100] ==================================
[Run   1/100] Initial AIs:
[Run   1/100]   Corporate-0: cap=2.985, align=0.89
[Run   2/100] 🔍 DEBUGGING AI CAPABILITY GROWTH
[Run   2/100] ==================================
[Run   3/100] 🔍 DEBUGGING AI CAPABILITY GROWTH
```

**Format Details**:
- `[Run XXX/YYY]` with padding for alignment
- Space after bracket for readability
- Works for 1-999 runs

## Performance Expectations

**Current** (sequential):
- 100 runs × 10.3s = 1,030 seconds = **17.2 minutes**

**Target** (8 parallel, batched):
- 100 runs / 8 cores = 12.5 batches
- 12.5 batches × 10.3s = 129 seconds = **2.1 minutes**
- Speedup: **8.2x** (theoretical)

**Realistic** (with overhead):
- Batch overhead: ~5%
- Memory contention: ~10%
- Effective speedup: **~7x**
- Expected time: **~2.5 minutes**

**Memory Considerations**:
- Each run stores full state history (~10-100MB)
- 8 parallel runs = ~80-800MB peak memory
- Should be fine on modern machines (16GB+ RAM)

## Error Handling

If one run fails, don't kill entire batch:

```typescript
const batchResults = await Promise.allSettled(
  batch.map(config => runSingleSimulation(config))
);

// Separate successful and failed runs
const succeeded = batchResults
  .filter(r => r.status === 'fulfilled')
  .map(r => (r as PromiseFulfilledResult<RunSummary>).value);

const failed = batchResults
  .filter(r => r.status === 'rejected')
  .map((r, i) => ({
    config: batch[i],
    error: (r as PromiseRejectedResult).reason
  }));

if (failed.length > 0) {
  console.error(`\n❌ ${failed.length} runs failed in this batch:`);
  failed.forEach(({ config, error }) => {
    console.error(`   Run ${config.index + 1}: ${error.message}`);
  });
}

results.push(...succeeded);
```

## Testing Plan

### 1. Test Console Prefixing (Unit)
```bash
npx tsx --eval "
import { wrapConsoleWithPrefix } from './src/simulation/utils/consoleWrapper';

const restore = wrapConsoleWithPrefix('[Test] ');
console.log('This should be prefixed');
console.warn('Warning with prefix');
restore();
console.log('This should NOT be prefixed');
"
```

### 2. Test Single Run Extraction
```bash
# Run one simulation with prefix
npx tsx scripts/monteCarloSimulation.ts --runs=1 --parallel

# Expected: All logs prefixed with [Run   1/1]
```

### 3. Test Small Parallel Batch
```bash
# Run 4 simulations, batch size 2
npx tsx scripts/monteCarloSimulation.ts --runs=4 --parallel --batch-size=2

# Expected: 2 batches of 2 runs each, logs interleaved but prefixed
```

### 4. Test Full Parallel Run
```bash
# Run 100 simulations, batch size 8
time npx tsx scripts/monteCarloSimulation.ts --runs=100 --parallel --batch-size=8

# Expected: ~2-3 minutes total, all logs prefixed correctly
```

### 5. Compare Outputs
```bash
# Sequential
time npx tsx scripts/monteCarloSimulation.ts --runs=10

# Parallel
time npx tsx scripts/monteCarloSimulation.ts --runs=10 --parallel

# Compare JSON outputs - should be identical (modulo timing)
diff monteCarloOutputs/mc_sequential.json monteCarloOutputs/mc_parallel.json
```

## File Changes Summary

1. **NEW**: `src/simulation/utils/consoleWrapper.ts` - Console prefixing utility
2. **MODIFIED**: `scripts/monteCarloSimulation.ts` - Main refactoring
   - Extract `runSingleSimulation()` function
   - Extract `calculateRunSummary()` function
   - Add parallel execution with batching
   - Add command-line flags

**Estimated LOC**:
- New utility: ~30 lines
- Refactored Monte Carlo: +150 lines (extraction), -0 lines (logic unchanged)
- Total: ~180 new lines

## Rollback Plan

1. Keep `--parallel` flag disabled by default
2. Sequential execution is default (no breaking changes)
3. Users opt-in with `--parallel` flag
4. If issues found, simply don't use the flag

## Future Enhancements

1. **Progress Bar**: Show real-time progress across all parallel runs
2. **Color Coding**: Different color per run (terminal colors)
3. **Log Buffering**: Buffer logs per run, output sequentially at end
4. **Worker Threads**: Use actual worker threads instead of Promises (even more parallelism)
5. **Adaptive Batching**: Auto-detect CPU cores, adjust batch size
6. **Resume Failed Runs**: Save progress, resume from failures

## Success Criteria

✅ Single run produces identical output (sequential vs parallel)
✅ Console logs are prefixed with run numbers
✅ Parallel execution reduces time by >5x
✅ No memory issues with 8 parallel runs
✅ All 100 runs complete successfully
✅ Final summary statistics match sequential mode
✅ Command-line flags work correctly

## References

- **Current Performance**: 10.3s per run (measured Oct 28, 2025)
- **Async Logger**: `src/simulation/utils/asyncLogger.ts`
- **Monte Carlo Script**: `scripts/monteCarloSimulation.ts`
