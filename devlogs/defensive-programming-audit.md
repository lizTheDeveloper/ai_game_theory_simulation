# Defensive Programming Audit (Oct 25, 2025)

## Status: Priorities 1-4 COMPLETE ✅

All critical defensive programming patterns have been replaced with assertive error handling.
Simulation now fails fast with descriptive errors when invalid values appear.

---

## Critical Issues: Silent Bug Masking

These patterns hide bugs instead of fixing root causes. They should throw errors when values are invalid.

### Priority 1: Survival Fundamentals (CRITICAL) ✅ COMPLETE

**File**: `src/simulation/qualityOfLife/dimensions.ts:34-37`

```typescript
// ❌ BAD: Silently replaces NaN with arbitrary defaults
return {
  foodSecurity: isNaN(rawFoodSecurity) ? 0.85 : rawFoodSecurity,
  waterSecurity: isNaN(rawWaterSecurity) ? 0.80 : rawWaterSecurity,
  thermalHabitability: isNaN(rawThermalHabitability) ? 1.0 : rawThermalHabitability,
  shelterSecurity: isNaN(rawShelterSecurity) ? 0.75 : rawShelterSecurity,
};
```

**Why this is bad**:
- If `calculateFoodSecurity()` returns NaN, there's a math bug (division by zero, invalid operation)
- Replacing with 0.85 (85% food security) hides the bug and gives false data
- Same for water, thermal, shelter

**Fix**: Throw error instead
```typescript
if (isNaN(rawFoodSecurity)) {
  throw new Error(`NaN in foodSecurity calculation at month ${state.currentMonth}`);
}
return { foodSecurity: rawFoodSecurity, ... };
```

**Status**: ✅ Fixed - replaced with `assertProbability()` calls
- `dimensions.ts:27-43` now validates all 4 survival fundamentals
- Simulation throws descriptive errors if any calculation produces NaN

---

### Priority 2: Regional Inequality Metrics ✅ COMPLETE

**File**: `src/simulation/qualityOfLife/regional.ts:118-123`

```typescript
// ❌ BAD: Six silent NaN replacements
const safeGini = isNaN(gini) ? 0.38 : gini;
const safeVariance = isNaN(variance) ? 0.08 : variance;
const safeCrisisAffected = isNaN(crisisAffectedFraction) ? 0 : crisisAffectedFraction;
const safeWorstRegion = isNaN(worstRegion) ? 0.35 : worstRegion;
const safeBestRegion = isNaN(bestRegion) ? 0.95 : bestRegion;
const safeMedianRegion = isNaN(medianRegion) ? 0.65 : medianRegion;
```

**Why this is bad**:
- These metrics come from population calculations that should never produce NaN
- If NaN appears, it means population distribution or QoL aggregation has a bug
- Silently using fallbacks masks the real issue

**Fix**: Validate and throw
```typescript
if (isNaN(gini) || isNaN(variance)) {
  console.error(`NaN in regional inequality: gini=${gini}, variance=${variance}`);
  throw new Error('Invalid regional inequality calculation');
}
```

**Status**: ✅ Fixed - replaced with assertions
- `regional.ts:123-161` now validates 6 inequality metrics
- Gini, variance, crisis-affected, worst/best/median all validated
- Throws errors if population/QoL aggregation produces NaN

---

### Priority 3: AI Capability Corruption ✅ COMPLETE

**File**: `src/simulation/techTree/effectsEngine.ts:210`

```typescript
// ❌ BAD: Silently zeros out AI if capability calculation fails
ai.capability = isNaN(newCapability) ? 0 : newCapability;
```

**Why this is bad**:
- If capability calculation produces NaN, the AI effectively disappears (0 capability = no impact)
- This can cascade: if one AI corrupts, it affects total AI capability, which affects economic stage, etc.
- Silent failure makes debugging impossible

**Fix**: Fail loudly
```typescript
if (isNaN(newCapability)) {
  throw new Error(`NaN capability for AI ${ai.id}: check tech boost calculation`);
}
ai.capability = newCapability;
```

**Status**: ✅ Fixed - replaced with `assertFinite()`
- `effectsEngine.ts:213-218` now validates AI capability calculation
- Includes AI ID and alignment in error context for debugging
- Prevents silent capability corruption (0 capability = AI effectively deleted)

---

### Priority 4: economicTransitionStage Fallbacks ✅ COMPLETE

**Files**: Multiple (11 instances)
- `src/simulation/techTree/engine.ts:131,250,685`
- `src/simulation/resourceDepletion.ts:66,143,257,288,534`
- `src/simulation/nuclearStates.ts:549`
- etc.

```typescript
// ❌ BAD: Inconsistent fallbacks (sometimes 0, sometimes 1)
const economicStage = state.globalMetrics.economicTransitionStage || 0;
const economicStage = state.globalMetrics.economicTransitionStage || 1;
```

**Why this is bad**:
- `economicTransitionStage` is ALWAYS initialized (see `initialization.ts:559`)
- If it's undefined, initialization is broken
- Using fallbacks masks initialization bugs
- Inconsistent fallbacks (0 vs 1) cause non-determinism

**Fix**: Assert it exists
```typescript
if (state.globalMetrics.economicTransitionStage === undefined) {
  throw new Error('economicTransitionStage not initialized - check createDefaultInitialState');
}
const economicStage = state.globalMetrics.economicTransitionStage;
```

**Status**: ✅ Fixed - all 11 instances replaced with `assertEconomicStage()`
- Created convenience function for common pattern
- Eliminated inconsistent fallbacks (some `|| 0`, some `|| 1`)
- Now throws error if economicTransitionStage is undefined (initialization bug)
- Validates range [0, 4] as expected

**Files fixed**:
- ✅ `techTree/engine.ts`: 3 instances
- ✅ `resourceDepletion.ts`: 5 instances
- ✅ `nuclearStates.ts`: 1 instance
- ✅ `diagnostics.ts`: 1 instance
- ✅ `engine/phases/GovernmentElectionPhase.ts`: 1 instance

---

## Pattern Summary

**Total instances of defensive `|| 0`**: 7,506 (!)

**Categories**:
1. **NaN guards on calculations** (~50 instances)
   - Should throw errors, not replace
2. **Undefined guards on initialized state** (~100 instances)
   - Should assert existence, not fallback
3. **Optional chaining with fallbacks** (`?.` with `||`)
   - Often hides missing initialization

## Recommendation

Replace defensive programming with **assertive programming**:

```typescript
// ❌ Defensive (hides bugs)
const value = calculation() || 0;

// ✅ Assertive (exposes bugs)
const value = calculation();
if (!isFinite(value)) {
  throw new Error(`Invalid calculation: ${value} at month ${state.currentMonth}`);
}
```

This approach:
- Fails fast when bugs occur
- Makes debugging trivial (stack trace points to root cause)
- Prevents cascading failures from corrupted state
- Forces fixing root causes instead of masking symptoms
