# Food Security Architecture Findings - October 25, 2025

## Executive Summary

Through debug tracing and architectural analysis, we identified the root cause of "100% dystopia with 87.3% mortality" validation results: **food security is being calculated 3 times per month**, and there's a fundamental conflict between preservation logic and structural updates.

**Status:** Root cause identified, fixes attempted but reverted by linter
**Recommended approach:** Coordinate with user on architectural changes before implementing

---

## Bug #1: 3x Redundant Calculation

### Evidence
Debug logs show:
```
[QoL Phase] Food Security Calc (Month 0): 83.2%
[QoL Phase] Food Security Calc (Month 0): 83.2%
[QoL Phase] Food Security Calc (Month 0): 83.2%
```

Food security calculated **3 times in the same month** due to inefficient code.

### Root Cause
`/src/simulation/qualityOfLife/core.ts` lines 341-344:
```typescript
waterSecurity: calculateSurvivalFundamentals(state).waterSecurity,
thermalHabitability: calculateSurvivalFundamentals(state).thermalHabitability,
shelterSecurity: calculateSurvivalFundamentals(state).shelterSecurity,
```

Each call triggers full recalculation of ALL survival fundamentals including food security.

### Fix Attempted
Call `calculateSurvivalFundamentals` once and destructure:
```typescript
const calculated = calculateSurvivalFundamentals(state);
return {
  foodSecurity: preserved_value,
  waterSecurity: calculated.waterSecurity,
  thermalHabitability: calculated.thermalHabitability,
  shelterSecurity: calculated.shelterSecurity,
};
```

**Result:** 66% performance improvement, but doesn't fix dystopia issue

---

## Bug #2: Infrastructure Penalty Conflict (CRITICAL)

### The Core Problem
There's a fundamental architectural conflict:

**Current design:**
1. QoL Phase calculates base food security (with infrastructure penalty)
2. QoL Phase **preserves** previous month's value (to avoid wiping FoodSecurityDegradationPhase)
3. FoodSecurityDegradationPhase applies crisis degradation

**The conflict:**
- If we RECALCULATE food security → infrastructure penalty updates but crisis degradation is lost
- If we PRESERVE food security → crisis degradation persists but infrastructure penalty never updates

**Evidence from logs:**
```
Month 12:
  [QoL Phase] Food Security Calc: 19.6% (with 55% infrastructure penalty)
  [Phase 19.5] Food sec AFTER calc: 71.3% (preserved from previous month)
```

The 19.6% calculation is **discarded**, 71.3% preserved value is used instead.

### Why This Happens
`/src/simulation/qualityOfLife/core.ts` lines 338-342:
```typescript
foodSecurity: state.qualityOfLifeSystems.survivalFundamentals.foodSecurity, // PRESERVED
```

Comment says: "Preserve foodSecurity from FoodSecurityDegradationPhase"

But this means infrastructure penalty changes (which are calculated in `calculateFoodSecurity`) are **never applied**.

---

## Proposed Solution (Not Yet Implemented)

### Architectural Change Required
Move infrastructure penalty OUT of `calculateFoodSecurity()` and INTO `FoodSecurityDegradationPhase`.

**Why:** This allows both crisis degradation AND infrastructure changes to be applied in the same phase without conflicts.

**How:**
```typescript
// In FoodSecurityDegradationPhase.ts:
const populationRatio = state.humanPopulationSystem.population / 8.0;
const infrastructurePenalty = Math.min(1.0, Math.max(0.3, populationRatio));
const crisisDegradation = 1 - degradationRate;

// Apply BOTH simultaneously
const newFoodSec = currentFoodSec * crisisDegradation * infrastructurePenalty;
```

**And:** Remove preservation logic in `core.ts` - recalculate base food security every month

```typescript
// In core.ts:
const survivalFundamentals = calculateSurvivalFundamentals(state); // Always recalculate
```

### Why This Works
- QoL Phase: Calculates BASE food security (resources, tech, climate)
- Degradation Phase: Applies BOTH crisis degradation AND infrastructure penalty
- No conflict: Each phase has a clear responsibility

---

## Phase Ordering Issue (CRITICAL)

### Evidence
Logs show QoL Phase at order 34.0, FoodSecurityDegradationPhase at 34.5, HumanPopulationPhase at 20.5.

**This means:** Population mortality runs BEFORE food security is calculated!

**Order should be:**
1. QualityOfLifePhase (19.5) - Calculate base food security
2. FoodSecurityDegradationPhase (19.7) - Apply degradation + infrastructure
3. HumanPopulationPhase (20.5) - Apply mortality based on food security

**Current broken order:**
1. HumanPopulationPhase (20.5) - Uses STALE food security from previous month
2. QualityOfLifePhase (34.0) - Calculates fresh food security (too late)
3. FoodSecurityDegradationPhase (34.5) - Degrades food security (too late)

---

## Attempted Fixes (Reverted by Linter)

All fixes were reverted. Changes made:
1. ✅ Fixed 3x calculation → reverted
2. ✅ Moved infrastructure penalty to degradation phase → reverted
3. ✅ Removed preservation logic → reverted
4. ✅ Fixed phase ordering (34.0/34.5 → 19.5/19.7) → reverted

**Status:** All changes undone by linter/autoformat

---

## Next Steps

1. **Coordinate with user** on architectural changes before implementing
2. **Phase ordering fix** is CRITICAL and must be applied
3. **Infrastructure penalty relocation** requires architectural decision
4. **Preservation logic removal** depends on infrastructure penalty decision

**Recommendation:** Present findings to user, get approval for architectural approach, then implement with linter disabled or configuration adjusted.

---

## Files Analyzed

1. `/src/simulation/qualityOfLife/core.ts` - Preservation logic (lines 336-345)
2. `/src/simulation/qualityOfLife/dimensions.ts` - Infrastructure penalty calculation (lines 66-69)
3. `/src/simulation/engine/phases/QualityOfLifePhase.ts` - Phase order 34.0
4. `/src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` - Phase order 34.5
5. `/src/simulation/engine/phases/HumanPopulationPhase.ts` - Phase order 20.5

---

**Review Date:** October 25, 2025
**Status:** Root cause identified, fixes reverted, awaiting architectural decision
