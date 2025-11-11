# Government Priority Weight Bug Fix

**Date:** November 11, 2025
**Context:** Phase 3 Scenario Analysis
**Severity:** CRITICAL
**Status:** FIXED

## Problem

Climate-first scenario (10% GDP climate spending) produced **byte-for-byte identical results** to baseline god-mode scenario.

### Evidence

From Monte Carlo N=10 analysis (reviews/scenario_phase3_spiral_analysis_20251111.md):
- QoL: 57.6% (identical)
- Population: 3.89B (identical)
- Temperature: 1.38°C (identical)
- CO2: Identical
- Mortality: 51.4% (identical)

**Expected:** Climate-first should show different climate investment patterns and environmental outcomes.
**Actual:** Zero divergence from baseline.

## Root Cause

**Two-system disconnect:** Government action selection and scenario priority overrides were using different state fields.

### Data Flow Trace

1. **Scenario Definition** (`src/types/scenarios.ts:377-387`):
   ```typescript
   'climate-first': {
     governmentPriorities: {
       climateSpending: 0.10,  // 10% of GDP
       researchInvestment: 50   // $50B/month
     }
   }
   ```

2. **ApplyScenarioPrioritiesPhase** (order 1.5):
   - Read: `state.scenario.governmentPriorities.climateSpending`
   - Write: `state.government.resources` (resource pool)
   - **Missing:** Never wrote to `state.config.climatePriority.weights`

3. **selectGovernmentAction** (`src/simulation/government/core/governmentCore.ts:521-524`):
   ```typescript
   // Oct 24, 2025: Apply climate priority configuration
   const climateWeight = climatePriority.weights?.climate || 0.10;
   priority *= (climateWeight * 10); // Scale to multiplier range
   ```
   - Read: `state.config.climatePriority.weights.climate`
   - **This field was never modified by scenario overrides!**

### The Bug

**ApplyScenarioPrioritiesPhase** increased resource POOLS (how much money government has):
- ✓ `government.resources` += climate spending
- ✓ `government.researchInvestments.totalBudget` = research budget

**But never changed action PRIORITIES** (how government chooses actions):
- ❌ `state.config.climatePriority.weights.climate` remained 0.10 (baseline)

**Result:** Government had more money but same priorities → no behavior change.

## Diagnostic Evidence

From `scripts/diagnosePriorityBug.ts`:

```
BEFORE ApplyScenarioPrioritiesPhase:
  state.config.climatePriority.weights.climate: 0.10 (10%)

AFTER ApplyScenarioPrioritiesPhase:
  government.resources: 10.05B (✓ increased)
  researchInvestments.totalBudget: 50.0B (✓ updated)
  state.config.climatePriority.weights.climate: 0.10 (❌ UNCHANGED)

[Government] Climate Priority: baseline
  Climate weight: 10%  ← WRONG! Should be 45% for climate-first
```

## Fix

**File:** `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts:114-147`

Added climate weight mapping when `climateSpending` is set:

```typescript
// FIX (Nov 11, 2025): ALSO update state.config.climatePriority.weights
// Map climate spending to priority weight:
// - 0.01-0.02 (1-2% GDP) → 0.10-0.20 weight (baseline/moderate)
// - 0.05-0.07 (5-7% GDP) → 0.30-0.35 weight (ambitious)
// - 0.10+ (10%+ GDP) → 0.45 weight (crisis mode)
let climateWeight: number;
if (value >= 0.10) {
  climateWeight = 0.45; // Crisis mode (opt-crisis level)
} else if (value >= 0.07) {
  climateWeight = 0.35; // Ambitious
} else if (value >= 0.05) {
  climateWeight = 0.30; // Moderate-ambitious
} else if (value >= 0.02) {
  climateWeight = 0.20; // Moderate
} else {
  climateWeight = 0.10 + (value / 0.02) * 0.10; // Linear scale
}

// Rebalance other weights proportionally (keep total ~1.0)
const oldClimateWeight = state.config.climatePriority.weights.climate;
const otherWeightsTotal = 1.0 - oldClimateWeight;
const otherWeightsNew = 1.0 - climateWeight;
const rebalanceFactor = otherWeightsNew / otherWeightsTotal;

state.config.climatePriority.weights.climate = climateWeight;
state.config.climatePriority.weights.economic *= rebalanceFactor;
state.config.climatePriority.weights.geopolitical *= rebalanceFactor;
state.config.climatePriority.weights.social *= rebalanceFactor;
state.config.climatePriority.weights.technological *= rebalanceFactor;
```

### Validation

After fix:

```
🎯 SCENARIO PRIORITIES (Month 0)
   Scenario: Climate First
   Overrides applied:
     - Climate: 10.0% GDP (+$0.1B to resources, weight 10% → 45%)

AFTER ApplyScenarioPrioritiesPhase:
  state.config.climatePriority.weights.climate: 0.45 (✓ UPDATED)

[Government] Climate Priority: baseline
  Climate weight: 45%  ← CORRECT!
```

## Impact

### Before Fix
- Scenario priorities were non-functional
- All Phase 3 scenario results were invalid
- Climate-first, equality-first, etc. were all identical to baseline
- **Cannot test governance hypotheses** (primary Phase 3 goal)

### After Fix
- Government action selection now respects scenario priorities
- Climate-first will prioritize environmental actions 4.5x more than baseline
- Other scenarios (equality-first, ai-alignment-first) will also work correctly
- **Phase 3 analysis can proceed**

## Next Steps

1. ✓ Fix implemented and validated (basic test)
2. **REQUIRED:** Re-run Phase 3 Monte Carlo N=10 for all scenarios
3. **REQUIRED:** Update `reviews/scenario_phase3_spiral_analysis_20251111.md` with corrected results
4. **RECOMMENDED:** Add integration test that verifies scenario priorities affect action selection

## Related Files

- `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts` (fix implemented)
- `src/simulation/government/core/governmentCore.ts` (action selection logic)
- `src/types/scenarios.ts` (scenario definitions)
- `src/types/climate-priority.ts` (climate priority weight system)
- `scripts/diagnosePriorityBug.ts` (diagnostic test)
- `reviews/scenario_phase3_spiral_analysis_20251111.md` (invalid results, needs re-run)

## Lessons Learned

1. **Always trace data flow end-to-end** when debugging identical results
2. **Watch for two-system disconnects** (resource pools vs action priorities)
3. **Add integration tests for cross-cutting features** (scenario system affects multiple phases)
4. **Fail-fast validation** could have caught this earlier (assert that climate-first ≠ baseline)
