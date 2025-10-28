# Monte Carlo Data Flow Bug - Custom Parameters Lost

**Date:** 2025-10-28
**Status:** 🚨 CRITICAL BUG IDENTIFIED
**Files:** `src/lib/MonteCarloManager.ts`

## Bug Analysis (Revised)

**Initial assessment was incorrect.** The parameter generation code IS fixed and works correctly. The bug is in **data flow and storage**.

## Data Flow Trace

### Step 1: Parameter Sweep Creation (✅ WORKS)

**Function:** `createParameterSweep()` (lines 357-416)

```typescript
// Generate all parameter combinations
const configurations = this.generateSweepConfigurations(config);
// configurations = [
//   { seed: 42000, scenario: 'historical', maxMonths: 120, parameters: { seed: 42000, customParam: 10 } },
//   { seed: 42000, scenario: 'historical', maxMonths: 120, parameters: { seed: 42000, customParam: 20 } },
//   { seed: 42001, scenario: 'historical', maxMonths: 120, parameters: { seed: 42001, customParam: 10 } },
//   ...
// ]
```

✅ This step works correctly - all parameter combinations are generated.

### Step 2: Storage (❌ DATA LOSS HERE)

**Problem:** Only `statusArray` is stored, which doesn't include sweep parameters:

```typescript
// Create batch configs for each combination
const batchConfig: MonteCarloBatchConfig = {
  startSeed: config.seeds.start,
  numRuns: configurations.length,
  scenario: config.fixedParameters.scenario || 'historical',
  // ... ONLY FIXED PARAMETERS, NO SWEEP PARAMS
};

// Store batch configuration
this.batches.set(batchId, batchConfig);  // ❌ No sweep params

// Initialize batch status with parameter metadata
const statusArray: SimulationRunStatus[] = [];
for (let i = 0; i < configurations.length; i++) {
  const sweepConfig = configurations[i];
  const simulationId = `${batchId}_run${i.toString().padStart(3, '0')}`;

  statusArray.push({
    simulationId,
    batchId,
    seed: sweepConfig.seed,
    status: 'queued',
    currentMonth: 0,
    maxMonths: sweepConfig.maxMonths
    // ❌ NO parameters FIELD - custom params are lost!
  });
}
this.batchStatus.set(batchId, statusArray);  // ❌ Missing sweep params
```

**The `configurations` array is generated but NEVER stored.** It goes out of scope after `createParameterSweep()` returns.

### Step 3: Simulation Execution (❌ MISSING DATA)

**Function:** `startBatch()` (lines 574-608)

```typescript
async startBatch(batchId: string): Promise<void> {
  const config = this.batches.get(batchId);        // ❌ Only has fixed params
  const statusArray = this.batchStatus.get(batchId); // ❌ Missing sweep params

  // Queue all simulations
  for (const status of statusArray) {
    const runConfig: SimulationRunConfig = {
      simulationId: status.simulationId,
      seed: status.seed,
      scenario: config.scenario,                    // ❌ Fixed param only
      speculativeScenario: config.speculativeScenario, // ❌ Fixed param only
      thresholdSliders: config.thresholdSliders,    // ❌ Fixed param only
      maxMonths: status.maxMonths,
      updateInterval: config.updateInterval || 1000,
      batchId,
      runIndex: statusArray.indexOf(status)
      // ❌ MISSING: custom sweep parameters from configurations[i]
    };

    this.runQueue.push(runConfig);
  }
}
```

**Result:** All simulations get identical parameters (the fixed params), custom sweep parameters are lost.

## Root Cause

**The generated configurations are never persisted.** The code flow is:

1. Generate `configurations` array with full parameter sets ✅
2. Store only `batchConfig` (fixed params) and `statusArray` (minimal metadata) ❌
3. `configurations` goes out of scope and is garbage collected ❌
4. `startBatch()` has no access to sweep parameters ❌

## Required Fix

### Solution: Store configurations array

We need to persist the full configurations array so `startBatch()` can access sweep parameters.

**Option 1: Add to MonteCarloManager state**

```typescript
// Add new field to class
private batchConfigurations: Map<string, Array<{
  seed: number;
  scenario: ScenarioMode;
  maxMonths: number;
  parameters: Record<string, any>;
}>> = new Map();

// In createParameterSweep(), after generating configurations:
this.batchConfigurations.set(batchId, configurations);

// In startBatch(), use stored configurations:
const configurations = this.batchConfigurations.get(batchId);
if (configurations) {
  for (let i = 0; i < statusArray.length; i++) {
    const status = statusArray[i];
    const sweepConfig = configurations[i];

    const runConfig: SimulationRunConfig = {
      simulationId: status.simulationId,
      seed: sweepConfig.seed,
      scenario: sweepConfig.scenario,
      speculativeScenario: sweepConfig.speculativeScenario,
      maxMonths: sweepConfig.maxMonths,
      // ADD: custom parameters from sweep config
      ...sweepConfig.parameters,  // Spread custom params
      updateInterval: config.updateInterval || 1000,
      batchId,
      runIndex: i
    };

    this.runQueue.push(runConfig);
  }
}
```

**Option 2: Extend SimulationRunStatus to include parameters**

```typescript
interface SimulationRunStatus {
  simulationId: string;
  batchId: string;
  seed: number;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  currentMonth: number;
  maxMonths: number;
  parameters?: Record<string, any>;  // ADD THIS
  // ... rest of fields
}

// In createParameterSweep():
statusArray.push({
  simulationId,
  batchId,
  seed: sweepConfig.seed,
  status: 'queued',
  currentMonth: 0,
  maxMonths: sweepConfig.maxMonths,
  parameters: sweepConfig.parameters  // STORE PARAMS HERE
});

// In startBatch():
const runConfig: SimulationRunConfig = {
  simulationId: status.simulationId,
  seed: status.seed,
  scenario: status.parameters?.scenario || config.scenario,
  maxMonths: status.maxMonths,
  ...status.parameters,  // Spread all sweep params
  updateInterval: config.updateInterval || 1000,
  batchId,
  runIndex: statusArray.indexOf(status)
};
```

### Recommendation

**Option 2 is better** because:
1. ✅ Fewer changes required
2. ✅ Already have `statusArray` persisted to IndexedDB
3. ✅ Parameters travel with status objects
4. ✅ No additional Map to maintain

## Implementation Steps

1. Add `parameters?: Record<string, any>` to `SimulationRunStatus` interface
2. Store `sweepConfig.parameters` in statusArray during `createParameterSweep()`
3. Update `startBatch()` to use `status.parameters` when creating `SimulationRunConfig`
4. Ensure `SimulationRunConfig` interface can accept custom params (may need `[key: string]: any`)
5. Verify IndexedDB persistence includes parameters field
6. Test with custom parameter sweep

## Testing Requirements

**Test case:**
```typescript
const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 2 },
  sweepParameters: {
    governmentActionFrequency: [0.1, 0.2]
  },
  fixedParameters: {
    scenario: 'historical',
    maxMonths: 120
  }
});

await manager.startBatch(batchId);

// Verify: Each simulation gets correct governmentActionFrequency
// - run 0: seed 42000, frequency 0.1
// - run 1: seed 42000, frequency 0.2
// - run 2: seed 42001, frequency 0.1
// - run 3: seed 42001, frequency 0.2
```

## Related Files

- `src/lib/MonteCarloManager.ts` - Main fix location
- `src/lib/simulationWorkerClient.ts` - May need to pass custom params to worker
- `src/simulation/initialization.ts` - May need to accept custom params

## Next Steps

Route to `simulation-maintainer` agent for implementation with:
- Defensive coding (assertions)
- Type safety (extend interfaces correctly)
- IndexedDB persistence verification
- Monte Carlo validation tests
