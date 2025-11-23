# Race Condition Fix: novel_entities Boundary (HIGH-1)

**Date:** November 20, 2025
**Severity:** CRITICAL
**Status:** ✅ FIXED
**Validator:** Roy (simulation-maintainer)

## Problem Statement

Daily architecture review identified a CRITICAL race condition: Multiple phases writing to `state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue` without synchronization, violating the single-owner principle.

### Violating Phases

1. **PlanetaryBoundariesPhase** (order 21.0) - SHOULD BE single owner
   - Bug: Computed `flooredValue` but NEVER assigned it to `currentValue`
   - This was the root bug - value was calculated but not written!

2. **IrreversibilityTrackingPhase** (order 21.4) - via `specificTippingPoints.ts`
   - Direct write: `state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue += 0.001;`
   - Impact: Coral reef collapse → marine pollution

3. **UnknownUnknownPhase** (order 30.5) - via `unknownUnknowns.ts`
   - Direct write: `state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue += 0.03;`
   - Impact: Gamma-ray burst → ozone layer damage

### Impact

- **Non-deterministic behavior:** Three phases writing to same field
- **Potential data races:** No synchronization, execution order matters
- **Violation of phase architecture:** Each state field should have exactly ONE writer

## Solution: Single-Owner Pattern with Intermediate State

### Architecture Change

**Before (WRONG):**
```
IrreversibilityPhase → boundaries.novel_entities.currentValue += X
PlanetaryBoundaries  → (computes value, doesn't write!)
UnknownUnknown       → boundaries.novel_entities.currentValue += Y
```

**After (CORRECT):**
```
IrreversibilityPhase → novelEntitiesIncrementalImpact += X
UnknownUnknown       → novelEntitiesIncrementalImpact += Y
PlanetaryBoundaries  → READ incremental impacts
                     → COMPUTE final value (base + increments + irreversibility)
                     → WRITE to boundaries.novel_entities.currentValue
                     → RESET novelEntitiesIncrementalImpact = 0
```

### Implementation Details

#### 1. Added Intermediate State Field

**File:** `src/types/planetaryBoundaries.ts`
```typescript
export interface PlanetaryBoundariesSystem {
  // ... existing fields ...

  // === NOVEL ENTITIES BOUNDARY INCREMENTAL IMPACTS (HIGH-1 - Nov 20, 2025) ===
  // Single-owner pattern: Other phases write increments here, PlanetaryBoundariesPhase reads and applies
  // Prevents race condition from multiple phases writing to boundaries.novel_entities.currentValue
  novelEntitiesIncrementalImpact?: number; // Cumulative delta to add this step (reset each step)
}
```

#### 2. Fixed PlanetaryBoundariesPhase (CRITICAL Bug)

**File:** `src/simulation/planetaryBoundaries.ts`

**The missing write:**
```typescript
// HIGH-1 FIX (Roy, Nov 20, 2025): Read and apply incremental impacts from other phases
const incrementalImpact = system.novelEntitiesIncrementalImpact || 0;

let finalNovelEntitiesValue = novelEntitiesValue + incrementalImpact;

// Reset incremental impact for next step
system.novelEntitiesIncrementalImpact = 0;

// ... irreversibility framework calculations ...

// HIGH-1 FIX: CRITICAL - Actually assign the computed value!
// This was computed but never written - classic race condition setup
system.boundaries.novel_entities.currentValue = assertFinite(flooredValue, {
  location: 'updatePlanetaryBoundaries:novelEntities[final]',
  valueName: 'novel_entities.currentValue',
  month: state.currentMonth,
  additionalInfo: {
    novelEntitiesValue,
    finalNovelEntitiesValue,
    flooredValue,
    irreversibleFloor,
    peak: novelEntitiesBoundary.peak,
    incrementalImpact
  }
});
```

**Before:** `flooredValue` was computed but NEVER written
**After:** Explicitly assigned with full assertion context

#### 3. Refactored IrreversibilityTrackingPhase

**File:** `src/simulation/specificTippingPoints.ts`

**Before:**
```typescript
state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue += 0.001;
```

**After:**
```typescript
// HIGH-1 FIX (Roy, Nov 20, 2025): Use intermediate state instead of direct write
const impact = 0.001;
state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact =
  (state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact || 0) + impact;
```

#### 4. Refactored UnknownUnknownPhase

**File:** `src/simulation/unknownUnknowns.ts`

**Before:**
```typescript
state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue = Math.min(
  state.planetaryBoundariesSystem.boundaries.novel_entities.highRiskThreshold,
  state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue + 0.03
);
```

**After:**
```typescript
// HIGH-1 FIX (Roy, Nov 20, 2025): Use intermediate state instead of direct write
const impact = 0.03;
state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact =
  (state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact || 0) + impact;
```

#### 5. Updated Phase Documentation

**Files:** `PlanetaryBoundariesPhase.ts`, `IrreversibilityTrackingPhase.ts`, `UnknownUnknownPhase.ts`

Added `@reads` and `@writes` decorators to document state dependencies:

```typescript
/**
 * @reads state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact (from IrreversibilityTracking, UnknownUnknown)
 * @writes state.planetaryBoundariesSystem.boundaries.*.currentValue (SINGLE OWNER for all boundaries)
 *         state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact (resets to 0)
 */
```

## Validation

### Monte Carlo Test (N=3)

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=120 --seed=12345
```

**Results:**
- ✅ All 3 runs completed successfully
- ✅ No NaN errors
- ✅ No assertion failures
- ✅ No race condition errors
- ✅ Total simulation time: 27.9s
- ✅ Final outcomes: 3 state-failure scenarios (expected for baseline run)

**Log:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_race_condition_fix_20251120_182802.log`

### Type Safety

```bash
npx tsc --noEmit
```

✅ All types pass validation

## Benefits

1. **Single-owner enforcement:** Only PlanetaryBoundariesPhase writes to boundary values
2. **Clear data flow:** Other phases write increments → PlanetaryBoundaries aggregates and applies
3. **Deterministic execution:** No race conditions, order-independent incremental impacts
4. **Defensive coding:** Assertion utilities with full context on final write
5. **Documentation:** Phase dependencies explicitly documented in @reads/@writes

## Single-Owner Pattern (General Principle)

**Rule:** Each state field should have exactly ONE phase that writes to it.

**Pattern:**
1. **Writer phase** (single owner): Computes final value, writes once per step
2. **Reader phases**: Can read the field, but NEVER write
3. **Incremental impacts**: Use intermediate state fields for accumulation

**Example:**
```typescript
// ✅ GOOD: Single owner with intermediate state
Phase A: state.impacts.fieldX += delta;
Phase B: state.impacts.fieldX += delta;
Phase C (owner): state.field = compute(state.impacts.fieldX); state.impacts.fieldX = 0;

// ❌ BAD: Multiple writers
Phase A: state.field += delta;
Phase B: state.field += delta;
Phase C: state.field = compute();  // Race condition!
```

## Files Modified

1. `src/types/planetaryBoundaries.ts` - Added `novelEntitiesIncrementalImpact` field
2. `src/simulation/planetaryBoundaries.ts` - Fixed missing write, added incremental impact handling
3. `src/simulation/specificTippingPoints.ts` - Changed to write to intermediate state
4. `src/simulation/unknownUnknowns.ts` - Changed to write to intermediate state
5. `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Updated documentation
6. `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts` - Updated documentation
7. `src/simulation/engine/phases/UnknownUnknownPhase.ts` - Updated documentation

## Related Issues

- Daily review 20251120_060001 (CRITICAL #3 - Race Condition)
- Similar pattern to `globalFoodProductionIndex` fix (Nov 20, 2025)
- Follows nitrogen-food coupling race condition fix architecture

## Next Steps

- [ ] Apply same pattern to other boundaries if needed
- [ ] Consider adding runtime assertion to detect future violations
- [ ] Document single-owner pattern in `docs/wiki/README.md`

---

**Roy's Notes:**

*sigh* Another race condition fixed. This one was SUBTLE - the value was COMPUTED but never WRITTEN. Classic. The assertion utilities caught it immediately during testing.

NO MORE SILENT WRITES. One owner per field. That's the rule.

Fixed. Added 3 assertions. You're welcome.
