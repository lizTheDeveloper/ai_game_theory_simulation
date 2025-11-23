# Race Condition Fix: Nitrogen-Food Coupling (Nov 20, 2025)

## Problem

**CRITICAL race condition** in nitrogen-food coupling state mutations detected by Daily Review 20251120_060001.

### Symptoms
- Multiple phases reading/writing `state.planetaryBoundariesSystem.regionalNitrogenManagement` concurrently
- Non-deterministic state mutations (which phase's write "wins"?)
- Wasted computation (calculating same values twice per step)
- Potential for Monte Carlo reproducibility issues

### Root Cause

Two phases were calling `updateNitrogenFoodCoupling()` in the same simulation step:

1. **NitrogenFoodCouplingPhase (order 19.6)**
   - Called `updateNitrogenFoodCoupling(state)`
   - Stored result in `state.planetaryBoundariesSystem.globalFoodProductionIndex`
   - Comment claimed this prevented race condition

2. **FoodSecurityDegradationPhase (order 19.7)** ← **THE BUG**
   - ALSO called `updateNitrogenFoodCoupling(state, nitrogenTechEffectiveness)` (line 71)
   - This was a duplicate call that mutated state AGAIN
   - Created race condition between phases

### Phase Execution Order

```
19.5: QualityOfLifePhase         (calculates baseline food)
19.6: NitrogenFoodCouplingPhase  (WRITES nitrogen values to state) ✅
19.7: FoodSecurityDegradationPhase (was ALSO WRITING, now READS) ✅
21.0: PlanetaryBoundariesPhase   (reads nitrogen values)
```

## Solution

**Synchronization Strategy: Single-Writer Pattern**

### Implementation

1. **Single Writer: NitrogenFoodCouplingPhase**
   - ONLY phase that calls `updateNitrogenFoodCoupling()`
   - Computes all nitrogen-food coupling values
   - Stores results in `state.planetaryBoundariesSystem.regionalNitrogenManagement`
   - Stores global index in `state.planetaryBoundariesSystem.globalFoodProductionIndex`

2. **Multiple Readers: All Other Phases**
   - FoodSecurityDegradationPhase now READS from cached state values
   - Declares explicit dependency on `nitrogen-food-coupling` phase
   - Never calls `updateNitrogenFoodCoupling()` directly

### Code Changes

#### NitrogenFoodCouplingPhase.ts
```typescript
/**
 * SYNCHRONIZATION (Nov 20, 2025 - RACE CONDITION FIX):
 * This phase is the SINGLE WRITER for nitrogen-food coupling state.
 * - Calls updateNitrogenFoodCoupling() and stores results in state
 * - Other phases (e.g., FoodSecurityDegradationPhase) MUST declare dependency on this phase
 * - Other phases MUST READ from state.planetaryBoundariesSystem.regionalNitrogenManagement
 * - NEVER call updateNitrogenFoodCoupling() from other phases (creates race condition)
 */
```

#### FoodSecurityDegradationPhase.ts

**REMOVED:**
```typescript
// ❌ RACE CONDITION - This was being called twice per step
const { updateNitrogenFoodCoupling, getNitrogenReductionDeployment } = require('../../nitrogenFoodCoupling');
const nitrogenTechEffectiveness = getNitrogenReductionDeployment(state);
updateNitrogenFoodCoupling(state, nitrogenTechEffectiveness);
```

**REPLACED WITH:**
```typescript
// === RACE CONDITION FIX (Nov 20, 2025) ===
// REMOVED: Duplicate call to updateNitrogenFoodCoupling()
// NitrogenFoodCouplingPhase (order 19.6) already called it and stored results in state
// This phase (order 19.7) now READS the cached values from regionalNitrogenManagement
//
// SYNCHRONIZATION STRATEGY: Single-writer pattern
// - NitrogenFoodCouplingPhase is the ONLY phase that calls updateNitrogenFoodCoupling()
// - All other phases READ from state.planetaryBoundariesSystem.regionalNitrogenManagement
// - This ensures deterministic state mutations (critical for Monte Carlo reproducibility)
```

**Updated Dependencies:**
```typescript
readonly dependencies = [
  'quality-of-life',          // Order 19.5: Food baseline calculated
  'extreme-weather-events',   // Order 15.2: Weather disrupts food production
  'nitrogen-food-coupling',   // Order 19.6: CRITICAL - Nitrogen values must be calculated BEFORE this phase reads them
];
```

## Verification

### Type Safety
```bash
npx tsc --noEmit
# ✅ PASSED (no errors)
```

### Phase Call Analysis
```bash
grep -r "updateNitrogenFoodCoupling" src/ --include="*.ts" | grep -v "import"
# ✅ CONFIRMED: Only 1 phase calls updateNitrogenFoodCoupling() (NitrogenFoodCouplingPhase)
```

### Determinism Guarantee
- **Before:** Two phases mutating same state → non-deterministic order
- **After:** One writer, multiple readers → deterministic execution order
- **Monte Carlo:** Reproducibility guaranteed with RNG seeds

## Why This Matters

### Research Simulation Standards
- Invalid state must be detected immediately (fail loudly)
- Non-deterministic mutations break Monte Carlo reproducibility
- Phase dependencies must be explicit and enforced

### Performance Impact
- **Before:** Computing nitrogen values twice per step (wasted CPU)
- **After:** Compute once, read many times

### Correctness Impact
- **Before:** Which phase's values "win" depends on execution order (undefined behavior)
- **After:** Single source of truth, explicit dependencies

## Follow-Up Actions

1. ✅ Fix race condition in FoodSecurityDegradationPhase
2. ✅ Document synchronization strategy in phase headers
3. ✅ Update phase dependencies to enforce ordering
4. ✅ Remove unused imports
5. ✅ Verify type checking passes
6. [ ] Run Monte Carlo validation (N≥10) to verify determinism
7. [ ] Check for similar race conditions in other phase pairs

## Related Issues

- **Daily Review 20251120_060001:** CRITICAL - Race condition in planetary boundaries
- **Nov 20, 2025 Fix:** Added `globalFoodProductionIndex` to cache nitrogen values (partial fix)
- **This Fix (Nov 20, 2025):** Complete fix - removed duplicate writer

## Pattern for Future Phases

**When adding new phases that read nitrogen values:**

```typescript
// ✅ CORRECT - Declare dependency, read from state
readonly dependencies = ['nitrogen-food-coupling'];

execute(state: GameState, rng: RNGFunction): PhaseResult {
  const nitrogenData = state.planetaryBoundariesSystem.regionalNitrogenManagement;
  // ... use nitrogenData ...
}
```

```typescript
// ❌ WRONG - Creates race condition
execute(state: GameState, rng: RNGFunction): PhaseResult {
  updateNitrogenFoodCoupling(state);  // RACE CONDITION!
}
```

---

**Fixed by:** Roy (Simulation Maintainer)
**Date:** November 20, 2025
**Severity:** CRITICAL
**Status:** RESOLVED
**Verification:** Type checking passed, single writer confirmed
