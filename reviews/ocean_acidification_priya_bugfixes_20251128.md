# Ocean Acidification Validation - Critical Bugfixes

**Developer:** Priya (Quantitative Validator)
**Date:** November 28, 2025
**Context:** Pre-validation bugfixes to enable Monte Carlo testing

---

## Summary

Fixed 4 critical bugs blocking Monte Carlo validation:

1. **CRITICAL:** Wrong assertion type for aragonite saturation (2 locations)
2. **CRITICAL:** Missing RNG parameter in ocean update call
3. **CRITICAL:** Missing import for assertInRange
4. **CRITICAL:** Repository corruption (merge conflicts committed to HEAD)

All fixes applied. Smoke test passes. Full Monte Carlo validation now running.

---

## Bug 1: Aragonite Saturation Assertion Type Mismatch

**Severity:** CRITICAL (blocks all simulations)

**Location:** `src/simulation/engine/phases/ResourceWaterPhase.ts` lines 85-89, 104-108

**Problem:** Used `assertProbability()` on a chemical ratio
```typescript
// WRONG:
assertProbability(state.oceanAcidificationSystem.aragoniteSaturation, {...});
// Expects: [0, 1]
// Actual value: 2.8 (Ωar ratio)
```

**Fix:**
```typescript
// CORRECT:
assertInRange(state.oceanAcidificationSystem.aragoniteSaturation, 1.0, 5.0, {...});
```

**Why This Happened:** Aragonite saturation (Ωar) sounds like it might be a percentage/probability, but it's actually a dimensionless chemical ratio representing saturation state:
- Pre-industrial: Ωar = 4.6
- Current (2025): Ωar = 2.8-3.3
- Stress threshold: Ωar < 3.0
- Collapse: Ωar < 2.0
- Undersaturation (dissolution): Ωar < 1.0

**Lesson:** Domain knowledge required for correct assertion usage. Defensive coding sprint added assertions without understanding ocean chemistry.

---

## Bug 2: Missing RNG Parameter

**Severity:** CRITICAL (crashes on month 0)

**Location:** `src/simulation/engine/phases/ResourceWaterPhase.ts` line 94

**Problem:**
```typescript
updateOceanAcidificationSystem(state);  // Missing RNG!
```

**Error:**
```
❌ CRITICAL: RNG required for deterministic simulation (oceanAcidification)
```

**Fix:**
```typescript
updateOceanAcidificationSystem(state, rng);
```

**Why This Happened:** The `updateOceanAcidificationSystem()` function was updated to require RNG (for species sensitivity randomization), but the call site in ResourceWaterPhase wasn't updated. Signature changed:
- OLD: `updateOceanAcidificationSystem(state: GameState): void`
- NEW: `updateOceanAcidificationSystem(state: GameState, rng: () => number): void`

**Lesson:** When making RNG REQUIRED (CRITICAL-3 regression fix), must update ALL call sites. TypeScript should have caught this, but the RNG parameter was optional at some point, creating silent breakage.

---

## Bug 3: Missing Import

**Severity:** CRITICAL (runtime error)

**Location:** `src/simulation/engine/phases/ResourceWaterPhase.ts` line 20

**Problem:**
```typescript
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';
// assertInRange not imported, but used in lines 87, 106
```

**Error:**
```
ReferenceError: assertInRange is not defined
```

**Fix:**
```typescript
import { assertFinite, assertProbability, assertInRange } from '@/simulation/utils/assertions';
```

**Why This Happened:** My Bug 1 fix added `assertInRange()` calls but forgot to add the import. Classic mistake when editing unfamiliar files.

---

## Bug 4: Repository Corruption (Merge Conflicts in HEAD)

**Severity:** CRITICAL (broken repository state)

**Location:** `src/simulation/oceanAcidification.ts`

**Problem:** HEAD commit (f7bbdb80) contains unresolved merge conflict markers:
```typescript
<<<<<<< Updated upstream
    aragoniteSaturation: 0.78,       // OLD version
    pHLevel: 0.96,
=======
    aragoniteSaturation: 2.8,        // NEW calibrated version
    pH: 7.95,
    pHLevel: 0.96,
>>>>>>> Stashed changes
```

**Root Cause:** Autonomous researcher agent committed merge conflicts without resolving them. The researcher tried to apply RD-2 calibration changes but created conflicts with existing code.

**Fix:** Restored correct version from `stash@{0}` (worker-20251128_220001):
```bash
git show stash@{0}:src/simulation/oceanAcidification.ts > /tmp/ocean_good.ts
mv /tmp/ocean_good.ts src/simulation/oceanAcidification.ts
```

**Timeline:**
1. Commit 47a6b52a: OLD implementation (aragonite 0.78, no pH field, no calibration)
2. Worker calibration: Created GOOD version with RD-2 parameters (in stash)
3. Researcher auto-commit (f7bbdb80): Committed merge conflicts to HEAD
4. Priya validation: Discovered corruption, restored from stash

**Lesson:** Autonomous agents must NOT commit files with conflict markers. Need pre-commit hook to reject commits containing `<<<<<<<`, `=======`, `>>>>>>>`.

---

## Validation Status

**Pre-bugfix:**
- ❌ All Monte Carlo runs crash on month 0
- ❌ Repository in corrupted state
- ❌ Cannot validate calibration

**Post-bugfix:**
- ✅ Smoke test passes (1 run × 12 months)
- ✅ Repository cleaned up
- ✅ Full Monte Carlo validation running (10 runs × 900 months)

---

## Fixes Applied

1. Line 85-91 (ResourceWaterPhase.ts): `assertProbability()` → `assertInRange(1.0, 5.0)` (pre-ocean)
2. Line 104-110 (ResourceWaterPhase.ts): `assertProbability()` → `assertInRange(1.0, 5.0)` (post-ocean)
3. Line 94 (ResourceWaterPhase.ts): `updateOceanAcidificationSystem(state)` → `updateOceanAcidificationSystem(state, rng)`
4. Line 20 (ResourceWaterPhase.ts): Added `assertInRange` to imports
5. Full file (oceanAcidification.ts): Restored correct version from stash

---

## Recommended Actions

**Immediate:**
1. ✅ DONE: Fix assertion types
2. ✅ DONE: Pass RNG parameter
3. ✅ DONE: Add missing import
4. ✅ DONE: Restore correct ocean file
5. 🏃 IN PROGRESS: Run full Monte Carlo validation

**Follow-up (Roy):**
1. Add pre-commit hook to reject merge conflict markers
2. Review autonomous agent commit logic (shouldn't commit broken files)
3. Add TypeScript strict mode check for required parameters
4. Document ocean chemistry constants (Ωar ranges) in code comments

**Follow-up (System):**
1. Improve autonomous agent merge conflict handling
2. Add validation step before auto-commits
3. Consider adding esbuild syntax check to pre-commit hooks

---

## Smoke Test Results

**Configuration:**
- Runs: 1
- Duration: 12 months
- Threshold Scenario: BASELINE

**Result:** ✅ PASS
- Simulation completed successfully
- No crashes
- No assertion failures (except expected coherence warnings)
- Runtime: 1.3s (0.112s/month)

**Coherence Warnings (Non-Critical):**
```
❌ COHERENCE VIOLATION: Compute exceeds workforce capacity
```
These are expected warnings in early game, not crashes. Simulation continues.

---

## Next Steps

1. Monitor Monte Carlo progress (10 runs × 900 months, ~2-4 hours)
2. Extract final state metrics for all runs
3. Validate against research benchmarks:
   - Coral loss 70-90% by month 300 (2050)
   - pH decline ~-0.24 by month 900 (2100)
   - Fisheries power law R² > 0.90
   - Population >10M (no extinction)
   - Determinism CV < 0.01%
4. Deliver final validation report (PASS/FAIL/CONDITIONAL)

---

**Status:** Bugfixes complete. Monte Carlo validation in progress.
