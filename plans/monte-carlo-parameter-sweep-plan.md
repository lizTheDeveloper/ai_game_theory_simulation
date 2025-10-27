# Monte Carlo Parameter Sweep Implementation Plan

**Date:** October 27, 2025
**Status:** Phase 1 (Backend) Complete
**Purpose:** Enable parameter exploration and sensitivity analysis for Monte Carlo simulations

---

## Overview

**Current Problem:** The Monte Carlo system runs multiple simulations with the SAME settings (e.g., 100 runs with threshold scenario "baseline"). Users cannot easily test different COMBINATIONS of settings to explore parameter space.

**Solution:** Parameter sweep functionality that generates cartesian products of parameter values, enabling sensitivity analysis and robustness testing.

---

## Use Cases

### Use Case 1: Threshold Scenario Sensitivity
```typescript
// Test how threshold assumptions affect outcomes
const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 10 },
  sweepParameters: {
    thresholdScenarios: ['doom', 'baseline', 'utopia']
  },
  fixedParameters: {
    scenario: 'historical',
    maxMonths: 120
  }
});
// Result: 10 × 3 = 30 simulations
// Groups: doom (n=10), baseline (n=10), utopia (n=10)
```

### Use Case 2: Time Horizon Comparison
```typescript
// Compare short-term vs long-term dynamics
const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 20 },
  sweepParameters: {
    maxMonths: [60, 120, 360, 600]
  },
  fixedParameters: {
    scenario: 'historical',
    speculativeScenario: 'baseline'
  }
});
// Result: 20 × 4 = 80 simulations
// Groups: 60mo (n=20), 120mo (n=20), 360mo (n=20), 600mo (n=20)
```

### Use Case 3: Nested MC Parameter Exploration
```typescript
// Test sensitivity to aleatory sample count
const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 5 },
  sweepParameters: {
    nestedMC: [true, false],
    aleatoryCounts: [5, 10, 20]
  },
  fixedParameters: {
    scenario: 'historical',
    maxMonths: 120
  }
});
// Result: 5 × 2 × 3 = 30 epistemic samples (150 total aleatory runs)
```

### Use Case 4: Full Factorial Design
```typescript
// Comprehensive parameter space exploration
const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 10 },
  sweepParameters: {
    scenarioModes: ['historical', 'unprecedented'],
    thresholdScenarios: ['doom', 'baseline', 'utopia']
  },
  fixedParameters: {
    maxMonths: 120
  }
});
// Result: 10 × 2 × 3 = 60 simulations
```

---

## Implementation Phases

### Phase 1: Backend (COMPLETED Oct 27, 2025)

**Status:** ✅ Complete

**Deliverables:**
- ✅ `ParameterSweepConfig` interface
- ✅ `ParameterSweepGroup` interface (grouping simulations by parameter value)
- ✅ `MonteCarloBatchProgress` updated with sweep metadata
- ✅ `createParameterSweep()` method
- ✅ `generateSweepConfigurations()` - Cartesian product generator
- ✅ `buildSweepGroups()` - Group simulations by parameter values
- ✅ `validateParameterSweepConfig()` - Validation logic
- ✅ `startParameterSweep()` - Execute sweep batch
- ✅ `getParameterSweepStats()` - Grouped aggregate statistics (stub)
- ✅ `saveSweepToIndexedDB()` - Persistence (stub)

**Files Modified:**
- `/src/lib/MonteCarloManager.ts` - 250+ lines added

**Key Features:**
- Generates all parameter combinations automatically
- Validates total simulation count (max 1000)
- Groups simulations by parameter values for later analysis
- Batch ID prefix `sweep-` distinguishes from regular batches
- Reuses existing worker pool and execution logic

---

### Phase 2: Frontend UI (COMPLETED Oct 27, 2025)

**Status:** ✅ Complete

**Deliverables:**
- ✅ Parameter sweep configuration panel
- ✅ Multi-select checkboxes for sweep parameters
- ✅ Total simulation count calculator (live update)
- ✅ Estimated time calculator
- ✅ Parameter sweep start button
- ✅ Progress display with sweep groups

**UI Design:**

```
┌─────────────────────────────────────────────────┐
│ Monte Carlo Parameter Sweep                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ 🔢 Seed Range                                   │
│   Start: [42000]  Count: [10]                   │
│   → Generates: 42000, 42001, ..., 42009         │
│                                                  │
│ 🎲 Sweep Parameters (select which to vary):    │
│                                                  │
│   ☑️ Threshold Scenario                         │
│      ☑️ doom   ☑️ cautious   ☑️ baseline         │
│      ☑️ progressive   ☑️ utopia                  │
│      (Selected: 5)                               │
│                                                  │
│   ☐ Scenario Mode                               │
│      ☐ historical   ☐ unprecedented             │
│                                                  │
│   ☐ Max Months                                  │
│      ☐ 60   ☐ 120   ☐ 360   ☐ 600               │
│                                                  │
│   ☐ Nested Monte Carlo                          │
│      ☐ Enabled (aleatory: 10)                   │
│      ☐ Disabled                                  │
│                                                  │
│ 📊 Total Simulations: 10 × 5 = 50               │
│    Estimated time: ~25 minutes (5 concurrent)   │
│                                                  │
│ [Start Parameter Sweep]                         │
└─────────────────────────────────────────────────┘
```

**Component Structure:**
- `MonteCarloContext.tsx` - State management (React context)
- `MonteCarloConfigPanel.tsx` - Main configuration UI
- `BatchProgressTracker.tsx` - Progress display
- `/monte-carlo/page.tsx` - Main page layout

**Files Created:**
- ✅ `/src/lib/contexts/MonteCarloContext.tsx` - 330 lines
- ✅ `/src/components/monte-carlo/MonteCarloConfigPanel.tsx` - 240 lines
- ✅ `/src/components/monte-carlo/BatchProgressTracker.tsx` - 150 lines
- ✅ `/src/app/monte-carlo/page.tsx` - 50 lines

**Features Implemented:**
- ✅ Seed range configuration (start + count)
- ✅ 4 sweep parameter types (threshold scenarios, scenario modes, max months, nested MC)
- ✅ Multi-select checkboxes with live count updates
- ✅ Cartesian product calculation (automatic)
- ✅ Real-time total simulation count (e.g., 10 × 3 × 2 = 60)
- ✅ Estimated time calculation (~30s per sim, 5 concurrent)
- ✅ Validation: max 1000 simulations, button disabled when exceeded
- ✅ Progress bar (overall completion percentage)
- ✅ Worker status display (running/queued/failed counts)
- ✅ Elapsed/remaining time estimates
- ✅ Parameter group progress (for sweep batches)
- ✅ Cancel/pause controls (UI ready, backend TODO)

**Testing:**
- ✅ UI loads correctly at `/monte-carlo`
- ✅ Parameter selection updates total count correctly
- ✅ Cartesian product calculation verified (10 × 3 × 2 = 60)
- ✅ Validation prevents >1000 simulations (button disabled)
- ✅ Responsive layout (left sidebar config, right main area)
- ✅ No TypeScript errors
- ✅ Screenshots captured in `/logs/monte-carlo-*.png`

---

### Phase 3: Grouped Aggregate Statistics

**Status:** 🔜 Planned

**Deliverables:**
- [ ] Implement `getParameterSweepStats()` fully
- [ ] Group results by sweep parameter
- [ ] Calculate statistics per group (outcome distribution, QoL, etc.)
- [ ] Display grouped results in UI

**Example Output:**
```
Threshold Scenario Sweep Results (10 seeds each):

DOOM (n=10):
  Utopia: 0%
  Dystopia: 40%
  Extinction: 60%
  Avg QoL: 0.32
  Avg Duration: 45 months

BASELINE (n=10):
  Utopia: 10%
  Dystopia: 30%
  Extinction: 40%
  Status Quo: 20%
  Avg QoL: 0.55
  Avg Duration: 72 months

UTOPIA (n=10):
  Utopia: 30%
  Dystopia: 10%
  Extinction: 20%
  Status Quo: 40%
  Avg QoL: 0.72
  Avg Duration: 98 months
```

**UI Components:**
- `ParameterSweepResultsPanel.tsx` - Grouped results display
- `ParameterGroupCard.tsx` - Statistics for single parameter value

---

### Phase 4: Parameter Sensitivity Visualizations

**Status:** 🔜 Planned

**Deliverables:**
- [ ] Stacked bar chart: Outcome distribution per parameter value
- [ ] Box plot: QoL distribution per parameter value
- [ ] Heatmap: Outcome probability vs parameter combinations
- [ ] Trend lines: Duration vs parameter value

**Visualization Types:**

1. **Stacked Bar Chart (Outcome Distribution)**
```
Doom:        [🟥 Extinction 60%][🟨 Dystopia 40%]
Baseline:    [🟥 Ext 40%][🟨 Dys 30%][⬜ Status Quo 20%][🟩 Utopia 10%]
Utopia:      [🟩 Utopia 30%][⬜ Status Quo 40%][🟥 Ext 20%][🟨 Dys 10%]
```

2. **Box Plot (QoL Distribution)**
```
Doom:        |----[====]----| (median: 0.32, IQR: 0.25-0.40)
Baseline:    |------[======]------| (median: 0.55, IQR: 0.48-0.62)
Utopia:      |--------[========]--------| (median: 0.72, IQR: 0.65-0.80)
```

3. **Heatmap (Parameter Combinations)**
```
              Historical    Unprecedented
Doom          60% Ext       70% Ext
Baseline      40% Ext       50% Ext
Utopia        20% Ext       30% Ext
```

**UI Components:**
- `ParameterSensitivityCharts.tsx` - Chart container
- Uses `recharts` library for visualizations

---

### Phase 5: IndexedDB Persistence

**Status:** 🔜 Planned

**Deliverables:**
- [ ] Implement `saveSweepToIndexedDB()`
- [ ] Store sweep metadata (parameter groups)
- [ ] Link simulations to parameter values
- [ ] Enable querying by parameter value

**Database Schema:**

```typescript
// Object Store: 'sweeps'
interface SweepMetadata {
  batchId: string;
  sweepConfig: ParameterSweepConfig;
  sweepGroups: ParameterSweepGroup[];
  timestamp: number;
}

// Object Store: 'sweep_simulations'
interface SweepSimulation {
  simulationId: string;
  batchId: string;
  parameters: Record<string, string | number | boolean>;
  // Links to simulation_results
}
```

---

### Phase 6: Testing & Documentation

**Status:** 🔜 Planned

**Deliverables:**
- [ ] Unit tests for `generateSweepConfigurations()`
- [ ] Integration test for full sweep workflow
- [ ] Performance test (1000 simulation sweep)
- [ ] Update wiki documentation
- [ ] Add example sweeps to test suite

**Test Coverage:**
- Cartesian product generation correctness
- Parameter grouping accuracy
- Validation edge cases (too many combinations)
- UI interaction flows
- Statistics calculation accuracy

---

## Research Justification

**Why Parameter Sweeps?**

Parameter sweeps are standard practice in computational simulation research:

1. **Sensitivity Analysis:** Identify which parameters most affect outcomes (Saltelli et al., 2008, "Global Sensitivity Analysis")
2. **Robustness Testing:** Verify model behavior across parameter space (Cariboni et al., 2007)
3. **Uncertainty Quantification:** Characterize epistemic uncertainty (Kennedy & O'Hagan, 2001)
4. **Model Validation:** Compare simulation behavior to expected patterns

**Implementation Strategy:**

The cartesian product approach is computationally efficient for moderate parameter spaces (< 1000 combinations). For larger spaces, consider:
- **Latin Hypercube Sampling** (McKay et al., 1979)
- **Sobol Sequences** (Sobol, 1967) - Low-discrepancy sampling
- **Adaptive Sampling** (Gramacy & Lee, 2009) - Focus on interesting regions

Current implementation handles typical research use cases (10-100 combinations) efficiently.

---

## Current Status Summary

**Completed:**
- ✅ Backend infrastructure (250+ lines)
- ✅ Cartesian product generator
- ✅ Parameter grouping logic
- ✅ Validation and safety checks

**In Progress:**
- 🚧 Frontend UI configuration panel

**Next Steps:**
1. Complete Phase 2 (Frontend UI)
2. Test with real simulation runs
3. Implement grouped aggregate statistics (Phase 3)
4. Add sensitivity visualizations (Phase 4)

**Estimated Remaining Time:**
- Phase 2 (Frontend): 4-6 hours
- Phase 3 (Statistics): 3-4 hours
- Phase 4 (Visualizations): 4-6 hours
- Phase 5 (Persistence): 2-3 hours
- Phase 6 (Testing): 3-4 hours
- **Total:** 16-23 hours

---

## Usage Examples

### Example 1: Simple Threshold Sweep
```typescript
import { MonteCarloManager } from '@/lib/MonteCarloManager';

const manager = new MonteCarloManager();

const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 10 },
  sweepParameters: {
    thresholdScenarios: ['doom', 'baseline', 'utopia']
  },
  fixedParameters: {
    scenario: 'historical',
    maxMonths: 120
  },
  name: 'Threshold Sensitivity Analysis'
});

await manager.startParameterSweep(batchId);

// Monitor progress
manager.on('batchProgress', (progress) => {
  console.log(`Progress: ${progress.completedRuns}/${progress.totalRuns}`);
});

// Get grouped results
manager.on('batchCompleted', async () => {
  const stats = await manager.getParameterSweepStats(batchId, 'thresholdScenario');
  console.log('Grouped results:', stats);
});
```

### Example 2: Multi-Parameter Sweep
```typescript
const batchId = await manager.createParameterSweep({
  seeds: { start: 42000, count: 5 },
  sweepParameters: {
    scenarioModes: ['historical', 'unprecedented'],
    thresholdScenarios: ['doom', 'baseline', 'utopia'],
    maxMonths: [120, 360]
  },
  fixedParameters: {},
  name: 'Full Factorial Design'
});
// Result: 5 × 2 × 3 × 2 = 60 simulations
```

---

## Migration Notes

**Backward Compatibility:**
- Existing `createBatch()` and `startBatch()` methods unchanged
- Regular batches still work identically
- Sweep batches use `sweep-` prefix in batch ID
- UI can detect sweep batches and show grouped results

**Breaking Changes:**
- None (additive changes only)

---

## Future Enhancements

**Phase 7+ (Future):**
- [ ] Advanced sampling strategies (Latin Hypercube, Sobol)
- [ ] Adaptive parameter refinement (focus on interesting regions)
- [ ] Multi-objective optimization (Pareto frontiers)
- [ ] Surrogate models (Gaussian Process emulators)
- [ ] Interactive sensitivity analysis (drag sliders, see impact)

---

## References

- McKay, M. D., Beckman, R. J., & Conover, W. J. (1979). Comparison of three methods for selecting values of input variables in the analysis of output from a computer code. *Technometrics*, 21(2), 239-245.
- Saltelli, A., Ratto, M., Andres, T., Campolongo, F., Cariboni, J., Gatelli, D., ... & Tarantola, S. (2008). *Global sensitivity analysis: the primer*. John Wiley & Sons.
- Kennedy, M. C., & O'Hagan, A. (2001). Bayesian calibration of computer models. *Journal of the Royal Statistical Society: Series B*, 63(3), 425-464.

---

## Project Links

- **Master Roadmap:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`
- **Frontend Roadmap:** `/plans/FRONTEND_ROADMAP.md`
- **Monte Carlo Manager:** `/src/lib/MonteCarloManager.ts`
- **Research Documentation:** `/research/multi_worker_orchestration_20251027.md`
