# CRITICAL Bug: Monte Carlo Temperature Assertion Failure

**Date Filed:** 2025-11-23
**Priority:** CRITICAL (Blocks Monte Carlo validation)
**Status:** NEW

---

## Summary

Monte Carlo simulation crashes at month 0 with assertion failure:
```
Error: Out-of-range value in calculateCategoryDistribution
   globalTempIncrease = 35
   Valid range: [0, 6]
   Month: 0
```

---

## Root Cause Analysis

### Symptoms

1. `globalTempIncrease = 35` at month 0 (should be ~1.2C)
2. `biosphere_integrity.currentValue = 36.93` (suspiciously similar)
3. Occurs in parallel execution (batch 1/2, runs 1-8)

### Source Code Path

```
calculateCategoryDistribution (extremeWeatherEvents.ts:77)
  <- updateExtremeWeatherEvents (extremeWeatherEvents.ts:384)
  <- ExtremeWeatherEventsPhase.execute (ExtremeWeatherEventsPhase.ts:40)
  <- PhaseOrchestrator.executeAll (PhaseOrchestrator.ts:249)
```

### `getGlobalTemperatureIncrease` Function

```typescript
// planetaryBoundaries.ts:651
export function getGlobalTemperatureIncrease(state: GameState): number {
  // Returns state.planetaryBoundariesSystem.boundaries.climate_change.currentValue
}
```

### Hypotheses

1. **Boundary Mixing:** `climate_change.currentValue` is being set to `biosphere_integrity.currentValue`
2. **Parallel Race Condition:** Multiple runs sharing state in parallel execution
3. **Initialization Bug:** Something setting climate_change incorrectly during init

### Initial Values (Correct)

From `initializePlanetaryBoundariesSystem`:
```typescript
boundaries.climate_change = {
  currentValue: 1.21,  // 21% beyond boundary - CORRECT
  ...
}
```

So the bug is happening AFTER initialization.

---

## Reproduction

```bash
npx tsx scripts/monteCarloSimulation.ts --runs 10 --months 60
```

Expected: All runs complete
Actual: Crash at month 0 with temperature = 35

---

## Impact

- **BLOCKS** Monte Carlo validation
- **BLOCKS** CV analysis for uncertainty propagation
- **BLOCKS** any statistical analysis of simulation

---

## Recommended Investigation

1. Add logging in `updatePlanetaryBoundaries` phase to track climate_change.currentValue
2. Check for state sharing between parallel runs
3. Verify biosphere_integrity is not corrupting climate_change
4. Run single-threaded to isolate parallel vs logic bug

---

## Workaround

None currently. Monte Carlo cannot run.

---

## Files to Investigate

- `src/simulation/planetaryBoundaries.ts` (initialization + updates)
- `src/simulation/extremeWeatherEvents.ts` (where crash occurs)
- `scripts/monteCarloSimulation.ts` (parallel execution setup)
- `src/simulation/engine/PhaseOrchestrator.ts` (phase execution order)

---

## Related Issues

- This is NOT related to uncertainty propagation (parameters sampled correctly)
- May be related to parallel execution in Monte Carlo

---

**END OF BUG REPORT**
