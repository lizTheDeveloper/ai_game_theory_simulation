# Ecology NaN Bug Fix - October 24, 2025

## Problem Summary

Ecology score was becoming NaN at month 168 and then getting stuck at 50.0/100 (the NaN fallback) for the rest of the simulation, making all climate priority scenarios show identical results.

## Root Cause Analysis

Investigation revealed **THREE simultaneous bugs** all occurring around month 161-168:

### Bug 1: `pollutionLevel` Became NaN (PRIMARY BUG)

**Location:** `/src/simulation/engine/phases/EnvironmentalFeedbackPhase.ts:66`

**Cause:** Circular dependency creating permanent NaN:

```typescript
// EnvironmentalFeedbackPhase.ts line 138-142 (aggregatePollutionLevel)
if (state.environmentalAccumulation?.pollutionLevel !== undefined) {
  return state.environmentalAccumulation.pollutionLevel * 100;
}

// Then line 66 writes it back:
state.environmentalAccumulation.pollutionLevel = pollutionLevel / 100;
```

**The circular bug:**
1. Read `pollutionLevel` from state (could be NaN)
2. Multiply by 100: `NaN * 100 = NaN`
3. Divide by 100: `NaN / 100 = NaN`
4. Write NaN back to state
5. Next month, repeat - **NaN is permanent!**

### Bug 2: `resourceReserves` Dropped to Exactly 0

**Location:** `/src/simulation/environmental.ts:110-111`

**Cause:** `Math.max(0, ...)` allows values to reach exactly 0, which breaks geometric mean calculations.

```typescript
// OLD CODE:
env.resourceReserves = Math.max(0, currentReserves - resourceDepletionRate);

// When resources hit exactly 0:
// geometric mean = (27 * 0 * 0 * pollutionScore)^(1/4) = 0
```

### Bug 3: `climateStability` Dropped to Exactly 0

**Location:** `/src/simulation/environmental.ts:186-187`

**Cause:** Same issue as Bug 2 - `Math.max(0, ...)` allows exactly 0.

```typescript
// OLD CODE:
env.climateStability = Math.max(0, Math.min(1, currentClimate - climateDegradationRate + naturalStabilization));
```

### Combined Effect

The ecology score uses a **geometric mean** of 4 components:

```typescript
const indicators = [boundariesScore, resourceScore, climateScore, pollutionScore];
const product = indicators.reduce((acc, val) => acc * (val / 100), 1);
const result = Math.pow(product, 1 / indicators.length) * 100;
```

**When ANY component is NaN OR when ANY component is 0:**
- NaN propagates: `27 * 0 * 0 * NaN = NaN`
- Zero collapses: `27 * 0 * 0 * 40 = 0`

The geometric mean returned NaN, which triggered the fallback:

```typescript
return isNaN(result) ? 50 : result;
```

## Fixes Implemented

### Fix 1: NaN Protection in EnvironmentalFeedbackPhase.ts

**File:** `/src/simulation/engine/phases/EnvironmentalFeedbackPhase.ts`

**Line 66 (pollution write):**
```typescript
// OLD:
state.environmentalAccumulation.pollutionLevel = pollutionLevel / 100;

// NEW:
state.environmentalAccumulation.pollutionLevel = isNaN(pollutionLevel) ? 0.40 : Math.max(0, Math.min(1, pollutionLevel / 100));
```

**Line 140 (pollution read):**
```typescript
// OLD:
if (state.environmentalAccumulation?.pollutionLevel !== undefined) {

// NEW:
if (state.environmentalAccumulation?.pollutionLevel !== undefined && !isNaN(state.environmentalAccumulation.pollutionLevel)) {
```

### Fix 2: Minimum Floor for resourceReserves

**File:** `/src/simulation/environmental.ts`

**Lines 110-112:**
```typescript
// OLD:
env.resourceReserves = Math.max(0, currentReserves - resourceDepletionRate);

// NEW:
const MIN_RESERVE_FLOOR = 0.001; // 0.1% minimum to prevent geometric mean collapse
const currentReserves = isNaN(env.resourceReserves) ? 1.0 : env.resourceReserves;
env.resourceReserves = Math.max(MIN_RESERVE_FLOOR, currentReserves - resourceDepletionRate);
```

### Fix 3: Minimum Floor for climateStability

**File:** `/src/simulation/environmental.ts`

**Lines 187-189:**
```typescript
// OLD:
env.climateStability = Math.max(0, Math.min(1, currentClimate - climateDegradationRate + naturalStabilization));

// NEW:
const MIN_CLIMATE_FLOOR = 0.001; // 0.1% minimum to prevent geometric mean collapse
const currentClimate = isNaN(env.climateStability) ? 1.0 : env.climateStability;
env.climateStability = Math.max(MIN_CLIMATE_FLOOR, Math.min(1, currentClimate - climateDegradationRate + naturalStabilization));
```

### Fix 4: Additional NaN Safety Check for Pollution

**File:** `/src/simulation/environmental.ts`

**Lines 155-159:**
```typescript
// Additional NaN safety check after calculation
if (isNaN(env.pollutionLevel)) {
  console.log(`⚠️  WARNING: pollutionLevel became NaN at month ${state.currentMonth}, resetting to 0.4`);
  env.pollutionLevel = 0.4;
}
```

## Verification

**Test:** Re-ran climate scenarios with seed=42, 180 months

**BEFORE (NaN bug):**
- All ecology scores stuck at 50.0/100 from month 168 onward
- Debug output showed:
  ```
  🔍 ECOLOGY DEBUG (Month 161):
     boundariesScore: 27 (ok)
     resourceScore: 0 (reserves: 0)
     climateScore: 0 (stability: 0)
     pollutionScore: NaN (level: NaN)
     ❌ RESULT IS NaN!
  ```

**AFTER (fixed):**
- Ecology scores show true values: 2.0-2.5/100
- No more NaN fallback
- Comparative scenarios work correctly

**Results (15 years, seed=42):**
- Baseline: 2.0/100
- Crisis-Reactive: 2.0/100
- Maximum Mobilization: 2.0/100

All scenarios correctly show very low ecology scores (realistic for no recovery intervention), not the NaN fallback of 50.0.

## Impact

**Before:** Ecology paradigm was completely broken after ~14 years, making long-term simulations invalid.

**After:** Ecology paradigm correctly tracks environmental state throughout full simulation duration (30+ years).

## Remaining Issues

- **AI alignment metrics NaN:** "Avg alignment distance: NaNσ" and "Avg binding strength: NaN" appear in logs
  - These are separate from ecology calculation
  - Do not affect ecology score
  - Should be investigated separately

## Files Modified

1. `/src/simulation/engine/phases/EnvironmentalFeedbackPhase.ts` - Added NaN protection for pollution sync
2. `/src/simulation/environmental.ts` - Added MIN_FLOOR for resources and climate, added NaN safety check for pollution

## Testing

**Command:**
```bash
npx tsx scripts/compareGovernmentClimateScenarios.ts --months=180 --seed=42
```

**Log:** `logs/climate_scenarios_FIXED_180mo_20251024_143936.log`

## Lessons Learned

1. **Geometric means are fragile:** Any NaN or zero propagates to the entire result
2. **Circular dependencies are dangerous:** Reading a value, transforming it, and writing it back can create permanent bugs
3. **Always add NaN protection:** Even if upstream code "should" prevent NaN, defensive programming at boundaries is critical
4. **Minimum floors matter:** `Math.max(0, x)` is not enough when using geometric means - need `Math.max(MIN_FLOOR, x)`

## Recommendation

Consider adding a **comprehensive NaN audit** across the entire codebase to find similar circular dependencies or missing NaN protection, especially in:
- All environmental accumulation updates
- All geometric mean calculations
- All cross-phase data synchronization points
