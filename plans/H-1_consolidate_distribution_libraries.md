# H-1: Consolidate Distribution Libraries

**Created:** December 8, 2025
**Priority:** HIGH (blocking M-6 implementation)
**Effort:** 2-3 hours
**Source:** Architecture Integration Review (Dec 8, 2025)

---

## Problem

Three redundant distribution libraries exist (1,077 total lines):
1. `src/simulation/thresholds/distributions.ts` (450 lines) - **CANONICAL** (actively used)
2. `src/simulation/utils/distributionSampling.ts` (294 lines) - Used only by `tippingPoints.ts`
3. `src/simulation/utils/distributions.ts` (333 lines) - **DEAD CODE** (not imported anywhere)

**Risk:** Bug fixes in one library won't propagate to others. Parameter naming inconsistent (`std` vs `stdDev` vs `sigma`).

---

## Solution

### Step 1: Delete Dead Code
**File:** `src/simulation/utils/distributions.ts`
**Action:** Delete entirely (not imported anywhere)
**Risk:** None (verified unused by grep)

### Step 2: Migrate Wrapper Function
**From:** `src/simulation/utils/distributionSampling.ts:238-294`
**To:** `src/simulation/thresholds/distributions.ts`
**Function:** `sampleThresholdDistribution(distribution, rng)`

**Migration steps:**
1. Copy `sampleThresholdDistribution` function to `thresholds/distributions.ts`
2. Update internal calls from local functions to canonical ones
3. Export the function
4. Verify types match

### Step 3: Update Import
**File:** `src/simulation/tippingPoints.ts:17`
**Old:** `import { sampleThresholdDistribution } from './utils/distributionSampling';`
**New:** `import { sampleThresholdDistribution } from './thresholds/distributions';`

### Step 4: Delete Migrated File
**File:** `src/simulation/utils/distributionSampling.ts`
**Action:** Delete after migration complete

### Step 5: Validation
1. Run type check: `npx tsc --noEmit`
2. Run distribution tests: `npm test -- tests/thresholds/distributions.test.ts`
3. Run full test suite: `npm test`
4. Run Monte Carlo validation: `npx tsx scripts/monteCarloSimulation.ts` (N=3, quick check)

---

## Expected Outcome

**Before:**
- 3 files, 1,077 lines
- Inconsistent parameter naming
- Bug fix propagation risk

**After:**
- 1 file, ~500 lines (canonical library + wrapper)
- Single source of truth
- Easier maintenance

---

## Blocking Dependencies

**M-6 Enhanced Radiation Modeling** should use the consolidated library, not create a fourth one.

---

## Implementation Notes

**CRITICAL:** All distribution functions MUST:
1. Require RNG parameter (no `Math.random()` fallbacks)
2. Use assertion utilities (`assertFinite`, `assertInRange`)
3. Fail loudly on invalid parameters
4. Support deterministic Monte Carlo reproducibility

**Preserved from distributionSampling.ts:**
- Defensive coding (fail-loudly assertions)
- Research citations in JSDoc comments
- RNG requirement enforcement
- Parameter validation

---

## Success Criteria

- [ ] `utils/distributions.ts` deleted
- [ ] `utils/distributionSampling.ts` deleted
- [ ] `sampleThresholdDistribution` in `thresholds/distributions.ts`
- [ ] `tippingPoints.ts` imports from canonical location
- [ ] All tests pass
- [ ] Type check passes
- [ ] Monte Carlo N=3 deterministic

---

## Files Changed

**Deleted:**
- `src/simulation/utils/distributions.ts` (333 lines)
- `src/simulation/utils/distributionSampling.ts` (294 lines)

**Modified:**
- `src/simulation/thresholds/distributions.ts` (+50 lines for wrapper function)
- `src/simulation/tippingPoints.ts` (1 line import change)

**Net:** -577 lines of duplicate code

---

## Next Steps

1. Implement consolidation (use simulation-maintainer agent for defensive coding)
2. Run validation suite
3. Commit with clear message documenting consolidation
4. Update architecture review status (H-1 → RESOLVED)
5. Proceed with M-6 implementation
