# Food Security Calculation Bug - October 25, 2025

## Executive Summary

**Root Cause Found:** Food security was being calculated **3 TIMES per month** due to inefficient code in `updateQualityOfLifeSystems`, and the degradation logic is not properly integrated with the infrastructure penalty calculation.

**Status:** Partially fixed (3x calculation eliminated), but fundamental integration issue remains
**Impact:** Still producing 100% dystopia outcomes with 87.3% mortality

---

## Bug #1: 3x Redundant Calculation (FIXED)

### Problem
In `/src/simulation/qualityOfLife/core.ts` lines 341-344:

```typescript
waterSecurity: calculateSurvivalFundamentals(state).waterSecurity,
thermalHabitability: calculateSurvivalFundamentals(state).thermalHabitability,
shelterSecurity: calculateSurvivalFundamentals(state).shelterSecurity,
```

Each call to `calculateSurvivalFundamentals(state)` triggered a full recalculation of ALL survival fundamentals, including food security. This meant food security was being calculated 3 times per month unnecessarily.

### Fix Applied
Changed to call `calculateSurvivalFundamentals` ONCE and destructure the result:

```typescript
const calculated = calculateSurvivalFundamentals(state);
return {
  foodSecurity: state.qualityOfLifeSystems.survivalFundamentals.foodSecurity, // Preserved
  waterSecurity: calculated.waterSecurity,
  thermalHabitability: calculated.thermalHabitability,
  shelterSecurity: calculated.shelterSecurity,
};
```

### Result
✅ Food security now calculated 1x per month (not 3x)
❌ Still 100% dystopia with 87.3% mortality

---

## Bug #2: Infrastructure Penalty Integration Issue (ONGOING)

### Problem
The logging reveals a disconnect between what `calculateFoodSecurity` computes and what Phase 19.5 uses:

**Month 12 example:**
- `[QoL Phase] Food Security Calc`: 19.6-27.6% (with infrastructure penalty applied)
- `[Phase 19.5] Food sec AFTER calc`: 71.3% (preserved from previous month)

**This shows:**
1. `calculateFoodSecurity()` is computing low values (19.6%) due to infrastructure penalty
2. But Phase 19.5 is **preserving** the previous month's degraded value (71.3%)
3. The fresh calculation (19.6%) is being **discarded**

### Root Cause
The preservation logic in `updateQualityOfLifeSystems` assumes that:
- FoodSecurityDegradationPhase applies incremental degradation
- QoL Phase should preserve that degraded value
- Other calculations (water, thermal, shelter) should be recalculated

**BUT:** This breaks the infrastructure penalty logic! The infrastructure penalty is calculated INSIDE `calculateFoodSecurity()` based on current population, but that fresh calculation is being thrown away.

### The Dilemma
- **Option A:** Recalculate food security every month → wipes out FoodSecurityDegradationPhase's work
- **Option B:** Preserve food security from degradation → discards infrastructure penalty updates

**Current implementation:** Option B (preserve), which means infrastructure penalty changes are ignored.

---

## Debug Trace Evidence

From `logs/final_fix_validation_20251025_203615.log`:

```
[QoL Phase] Food Security Calc (Month 0): 83.2% | Infra: 100%, Tech: vf=0% cf=0%
[Phase 19.5] Quality of Life Systems: Food sec AFTER calc = 85.0%, QoL = 97.6%
[Phase 19.7] Food Security Degradation: Food sec BEFORE degrade = 85.0%, AFTER degrade = 84.2% | Crises: 0, Rate: 1.00%/month

  [QoL Phase] Food Security Calc (Month 12): 19.6% | Infra: 55%, Tech: vf=0% cf=0%
[Phase 19.5] Quality of Life Systems: Food sec AFTER calc = 71.3%, QoL = 90.1%
[Phase 19.7] Food Security Degradation: Food sec BEFORE degrade = 71.3%, AFTER degrade = 70.2% | Crises: 1, Rate: 1.50%/month

  [QoL Phase] Food Security Calc (Month 24): 0.0% | Infra: 34%, Tech: vf=0% cf=0%
[Phase 19.5] Quality of Life Systems: Food sec AFTER calc = 59.4%, QoL = 64.0%
[Phase 19.7] Food Security Degradation: Food sec BEFORE degrade = 59.4%, AFTER degrade = 58.5% | Crises: 1, Rate: 1.50%/month
```

**Analysis:**
- Month 12: Infrastructure penalty is 55% → food calc shows 19.6%, but Phase 19.5 uses 71.3%
- Month 24: Infrastructure penalty is 34% → food calc shows 0.0%, but Phase 19.5 uses 59.4%

The infrastructure penalty is being calculated but **not applied**.

---

## Proposed Solution

The issue is that we're trying to preserve incremental degradation while also applying structural changes (infrastructure penalty). These are fundamentally incompatible approaches.

**Recommended fix:**
1. Move infrastructure penalty OUT of `calculateFoodSecurity()`
2. Apply infrastructure penalty as a MULTIPLIER in FoodSecurityDegradationPhase
3. This way:
   - QoL Phase calculates base food security (resources, tech, climate)
   - FoodSecurityDegradationPhase applies BOTH degradation AND infrastructure penalty
   - No conflict between preservation and recalculation

**Example:**
```typescript
// In FoodSecurityDegradationPhase.ts
const infrastructurePenalty = Math.min(1.0, Math.max(0.3, populationRatio));
const crisisDegradation = 1 - degradationRate; // e.g., 0.985 for 1.5% degradation

// Apply both simultaneously
const newFoodSec = currentFoodSec * crisisDegradation * infrastructurePenalty;
```

This would ensure both crisis degradation AND infrastructure capacity are applied correctly.

---

## Files Modified

### Fixed:
1. `/src/simulation/qualityOfLife/core.ts` (lines 336-349) - Eliminated 3x calculation

### Still Broken:
1. `/src/simulation/qualityOfLife/dimensions.ts` (lines 59-67) - Infrastructure penalty calculated but discarded
2. `/src/simulation/qualityOfLife/core.ts` (lines 338-342) - Preservation logic conflicts with infrastructure updates

---

## Next Steps

1. ❌ **Current approach doesn't work** - preservation conflicts with infrastructure penalty
2. ✅ **Proposed solution** - move infrastructure penalty to FoodSecurityDegradationPhase
3. ⏳ **Testing needed** - validate that combined degradation + penalty works correctly

**Review Date:** October 25, 2025
**Status:** Bug identified, partial fix applied, fundamental issue remains
