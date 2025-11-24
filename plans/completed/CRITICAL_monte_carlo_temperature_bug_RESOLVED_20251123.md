# CRITICAL Bug: Monte Carlo Temperature Assertion Failure

**Date Filed:** 2025-11-23
**Priority:** CRITICAL (Blocks Monte Carlo validation)
**Status:** RESOLVED (2025-11-23)

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

## Root Cause (FOUND)

### The Bug

The `asymptoteRecovery` function in `src/simulation/utils/irreversibility.ts` had WRONG auto-scale detection:

```typescript
// OLD (BUGGY) CODE:
const scale = currentValue > 2 ? 100 : 2;
```

This assumed:
- If `currentValue > 2`, use 0-100 scale (percentage)
- Otherwise use 0-2 scale (normalized)

**BUG:** `climate_change.currentValue` can be 2.0+ degrees Celsius, but it's NOT a percentage!

When `climate_change.currentValue = 2.02`:
1. `scale = 100` (because 2.02 > 2)
2. `effectiveTarget = max(1.0, 0.35 * 100) = 35`
3. Function returns `35` instead of correct value!

### Why It's Seed-Dependent

The bug only triggered when `climate_change.currentValue` crossed the 2.0C threshold, which happened in certain simulation trajectories (seeds 42005+ in our tests).

---

## Fix Applied

### 1. Added optional `maxBoundaryValue` parameter

```typescript
// src/simulation/utils/irreversibility.ts
export function asymptoteRecovery(
  currentValue: number,
  targetValue: number,
  halfLife: number,
  minimumAsymptoticValue: number,
  deltaYears: number = 1/12,
  maxBoundaryValue?: number  // NEW: explicit scale
): number {
  // ...
  // BUG FIX (Nov 23, 2025): Use explicit scale, fallback to > 10 threshold
  const scale = maxBoundaryValue !== undefined ? maxBoundaryValue : (currentValue > 10 ? 100 : 2);
  // ...
}
```

### 2. Updated caller to pass explicit scale

```typescript
// src/simulation/planetaryBoundaryRecovery.ts - updateClimateRecovery()
boundary.currentValue = asymptoteRecovery(
  oldValue,
  boundary.boundaryThreshold,
  effectiveHalfLife,
  minimumAsymptoticValue,
  1/12,  // deltaYears (monthly step)
  6      // maxBoundaryValue: climate uses 0-6 Celsius scale
);
```

---

## Validation

Tested 10 seeds (42000-42009), 5 steps each:
```
Seed 42000: climate_change=2.1000 OK
Seed 42001: climate_change=2.1000 OK
Seed 42002: climate_change=2.1000 OK
Seed 42003: climate_change=2.1000 OK
Seed 42004: climate_change=2.1000 OK
Seed 42005: climate_change=2.1000 OK  <-- Previously crashed with 35!
Seed 42006: climate_change=2.3051 OK
Seed 42007: climate_change=2.1000 OK
Seed 42008: climate_change=2.1000 OK
Seed 42009: climate_change=2.6075 OK

SUMMARY: 10 OK, 0 FAIL
```

---

## Files Changed

1. `src/simulation/utils/irreversibility.ts` - Added `maxBoundaryValue` parameter, fixed auto-scale threshold
2. `src/simulation/planetaryBoundaryRecovery.ts` - Pass explicit `maxBoundaryValue=6` for climate boundary

---

## Lessons Learned

1. **Auto-detection is fragile:** The `currentValue > 2` heuristic failed for climate values that legitimately exceed 2.0
2. **Explicit is better than implicit:** New code passes explicit scale parameter
3. **Seed-dependent bugs are hard to find:** Only certain RNG trajectories triggered this

---

## Related

- This was NOT a parallel execution bug (sequential runs also failed)
- This was NOT an initialization bug (initialization was correct)
- This was NOT boundary mixing (values were separate objects)

---

**END OF BUG REPORT - RESOLVED**
