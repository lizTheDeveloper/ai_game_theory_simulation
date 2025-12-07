# Architecture Review: M-5 Threshold Uncertainty Modeling

**Date:** December 7, 2025
**Reviewer:** Architecture Skeptic
**Feature:** M-5 - Threshold Uncertainty Modeling
**Grade:** B+

## Executive Summary

The M-5 implementation is architecturally sound with proper deterministic RNG handling, good fail-loudly patterns, and clean state propagation. However, there is a **HIGH priority issue**: the codebase has THREE separate distribution libraries with overlapping functionality, creating maintenance burden and risk of inconsistency.

---

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

None identified.

---

## HIGH PRIORITY (Significant maintenance/consistency concerns)

### H-1: Three Redundant Distribution Libraries (Consolidation Needed)

**Location:**
1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/distributionSampling.ts` (295 lines)
2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/distributions.ts` (334 lines)
3. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/thresholds/distributions.ts` (451 lines)

**Problem:** Three files implement nearly identical functions:
- `sampleTriangular()` - implemented in ALL THREE files
- `sampleUniform()` - implemented in ALL THREE files
- `sampleNormal()` - implemented in ALL THREE files
- `sampleLogNormal()` - implemented in ALL THREE files

**Usage pattern (from grep):**
- `distributionSampling.ts` - used by `tippingPoints.ts` (M-5 specific)
- `distributions.ts` (utils) - NOT imported anywhere currently
- `thresholds/distributions.ts` - used by `sampleUncertaintyParameters.ts`, tests

**Risk:** If a bug is found in one implementation, it may not be fixed in the others. The algorithms are identical (Box-Muller, inverse CDF) but subtle differences exist:
- Edge case handling varies (e.g., `min === max` degenerate case handled differently)
- Parameter naming inconsistent (`std` vs `stdDev` vs `sigma`)
- Different assertion patterns

**Recommendation:** Consolidate to ONE canonical library at `src/simulation/thresholds/distributions.ts` (most complete, has tests). Delete the other two files.

**Effort:** Small (2-3 hours)
**Risk of change:** Low (search-replace imports)

---

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### M-1: Inconsistent Type Safety for Distribution Parameters

**Location:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/distributionSampling.ts:238-250`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/tipping-points.ts:174-191`

**Problem:** Two different type patterns for distribution parameters:

In `distributionSampling.ts`:
```typescript
distribution: {
  type: 'triangular' | 'uniform' | 'normal' | 'log-normal';
  params: {
    min?: number;
    mode?: number;
    max?: number;
    mean?: number;
    std?: number;
    meanLog?: number;
    stdLog?: number;
  };
}
```

In `distributions.ts` (utils):
```typescript
type DistributionParams =
  | { type: 'triangular'; min: number; mode: number; max: number }
  | { type: 'uniform'; min: number; max: number }
  | { type: 'normal'; mean: number; std: number }
  | { type: 'log-normal'; meanLog: number; stdLog: number };
```

**Issue:** The discriminated union in `distributions.ts` is MORE type-safe (TypeScript ensures correct params for each type). The loose object with all optional fields in `distributionSampling.ts` allows invalid combinations at compile time.

**Recommendation:** Adopt the discriminated union pattern when consolidating libraries.

**Effort:** Small (included in H-1 consolidation)

### M-2: Missing `sampleUniform` in thresholds/distributions.ts

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/thresholds/distributions.ts`

**Problem:** The tests import from `thresholds/distributions.ts` but that file does NOT export `sampleUniform()`. The grep shows `sampleUncertaintyParameters.ts` imports `sampleUniform` from this file, but looking at the file contents, there's no `sampleUniform` export (lines 389-421 show it's actually there - my error, disregard this item).

**Status:** False alarm after re-checking. File does export `sampleUniform`.

---

## LOW PRIORITY (Future improvements, not urgent)

### L-1: Defensive Fallback in ClimateSystemPhase

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/ClimateSystemPhase.ts:366`

**Code:**
```typescript
const baseThreshold = element._sampledThresholdC ?? element.triggerTempC;
```

**Observation:** This is actually CORRECT behavior (backward compatibility fallback when no distribution defined). The `??` here is intentional for backward compatibility with elements that don't have `thresholdDistribution` defined, not a silent failure pattern.

**Status:** Not an issue - correct design.

### L-2: Test Coverage Discrepancy

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/thresholds/distributions.test.ts`

**Observation:** Tests import from `@/simulation/thresholds/distributions` but the M-5 feature primarily uses `utils/distributionSampling.ts`. This creates test coverage gap for the M-5 specific code path.

**Recommendation:** After consolidation (H-1), single test file will cover all usages.

**Effort:** None if H-1 completed.

---

## Positive Observations

1. **Determinism Handling: Excellent**
   - All three libraries properly require RNG parameter (no Math.random fallback)
   - Fail-loudly pattern with clear error messages
   - Box-Muller transform handles edge case (log(0)) correctly

2. **State Propagation: Correct**
   - Thresholds sampled ONCE at initialization in `initializeTippingPointSystem()`
   - Stored in `element._sampledThresholdC` (properly typed as optional)
   - Used correctly in phase execution with fallback to deterministic value

3. **Performance: Optimal**
   - Sampling happens at init time, not every step
   - No repeated allocations during simulation
   - Simple math operations (no expensive computations per step)

4. **Assertion Usage: Proper**
   - All sampling functions use `assertFinite()` and `assertInRange()`
   - Context objects include element IDs and distribution params for debugging

5. **Research Documentation: Thorough**
   - Each distribution type cites appropriate research
   - Parameter choices justified (triangular for expert elicitation, uniform for epistemic uncertainty)

---

## Recommendations Summary

| Priority | Issue | Action | Effort |
|----------|-------|--------|--------|
| HIGH | H-1: Three distribution libraries | Consolidate to one canonical library | Small (2-3h) |
| MEDIUM | M-1: Inconsistent type safety | Use discriminated union pattern | Small (with H-1) |

**Overall Assessment:** The M-5 implementation is well-designed and follows project conventions. The only significant concern is the library duplication which should be addressed to prevent divergence bugs. This can be done as a small cleanup task between features - not blocking for current work.

---

## Architecture Review Checklist

- [x] State propagation verified (sampled at init, stored in state, used in phases)
- [x] Performance verified (sampling at init only, not per-step)
- [x] Determinism verified (RNG required, no Math.random fallbacks)
- [x] Type safety reviewed (could be improved with discriminated unions)
- [x] Assertion patterns correct (fail-loudly, good context)
- [x] Tests reviewed (28/28 passing, good coverage of core library)
- [x] Research documentation adequate

**Grade Justification:** B+ rather than A because of the library duplication debt. The implementation itself is solid.
