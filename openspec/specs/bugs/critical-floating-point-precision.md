# CRITICAL: Floating-Point Precision Bug in Social Cascade Dynamics

**Discovered:** December 12, 2025 (Session 77)
**Severity:** CRITICAL (crashes simulation)
**Priority:** HIGH
**Status:** ACTIVE

---

## Summary

Hindcast validation (1950-2024) discovered a floating-point precision bug causing simulation crashes. The `applySocialCascadeDynamics` function produces values that exceed 1.0 by ~1e-15 due to cumulative floating-point rounding errors, triggering the defensive assertion system.

---

## Bug Details

**Location:** `src/simulation/positiveTippingPoints.ts:931`

**Error:**
```
❌ Out-of-range value in applySocialCascadeDynamics
   adoptionLevel = 1.0000000000000007
   Valid range: [0, 1]
   Month: 424
```

**Stack Trace:**
```
Error: ❌ Out-of-range value in applySocialCascadeDynamics
   adoptionLevel = 1.0000000000000007
   Valid range: [0, 1]
   Month: 424
    at assertInRange (/src/simulation/utils/assertions.ts:97:11)
    at applySocialCascadeDynamics (/src/simulation/positiveTippingPoints.ts:931:31)
    at updatePositiveTippingPoints (/src/simulation/positiveTippingPoints.ts:260:3)
    at PositiveTippingPointsPhase.execute (/src/simulation/engine/phases/PositiveTippingPointsPhase.ts:59:5)
```

---

## Impact

**Severity:** CRITICAL
- **Reproducibility:** Deterministic (always crashes at month 424 with seed 42)
- **Scope:** Affects all long-term simulations (>35 years)
- **Consequence:** Simulation halts, preventing hindcast validation and long-term Monte Carlo runs

**Discovered by:** Hindcast validation framework attempting 1950-2024 run (888 months)
**Failed at:** Month 424 (year ~1985)
**Success rate:** 0% for runs exceeding 424 months

---

## Root Cause

**Floating-point arithmetic accumulation:**

When updating social cascade adoption levels via incremental calculations (e.g., `adoptionLevel += delta`), cumulative rounding errors cause values to slightly exceed the theoretical maximum of 1.0.

**Example:**
```typescript
// After 424 months of small incremental updates
adoptionLevel = 0.999999... + 0.000001... = 1.0000000000000007
```

**Why it fails:**
The defensive assertion `assertInRange(adoptionLevel, 0, 1, ...)` correctly identifies this as invalid, but the error is benign (should be clamped, not crash).

---

## Proposed Fix

**Option 1: Epsilon-Based Tolerance (Recommended)**

Modify `assertInRange` to accept tolerance for floating-point comparisons:

```typescript
export function assertInRange(
  value: number,
  min: number,
  max: number,
  context: AssertionContext,
  epsilon: number = 0
): number {
  if (epsilon > 0) {
    // Clamp to valid range if within epsilon
    if (value < min && value > min - epsilon) return min;
    if (value > max && value < max + epsilon) return max;
  }

  // Original strict check
  if (value < min || value > max || !Number.isFinite(value)) {
    throw new Error(...);
  }

  return value;
}

// Usage
const adoptionLevel = assertInRange(
  rawAdoptionLevel,
  0,
  1,
  context,
  1e-10  // Allow 1e-10 tolerance
);
```

**Option 2: Pre-Clamping**

Clamp values before assertion in `positiveTippingPoints.ts`:

```typescript
// Before assertion (line 931)
const clampedAdoptionLevel = Math.max(0, Math.min(1, rawAdoptionLevel));

assertInRange(
  clampedAdoptionLevel,
  0,
  1,
  {
    location: 'applySocialCascadeDynamics',
    valueName: 'adoptionLevel',
    month: state.currentMonth,
  }
);
```

**Option 3: Post-Update Clamping**

Add explicit clamping after all adoption level calculations:

```typescript
// After all updates
cascade.adoptionLevel = Math.max(0, Math.min(1, cascade.adoptionLevel));
```

---

## Recommendation

**Implement Option 1 + Option 3:**
1. Add epsilon tolerance to `assertInRange` for probability/fraction checks
2. Add explicit clamping in `positiveTippingPoints.ts` after updates
3. Document this pattern for all [0, 1] bounded values

**Rationale:**
- Defense in depth: Clamp at source + validate with tolerance
- Prevents future similar issues in other modules
- Maintains fail-loudly philosophy while accepting benign floating-point errors

---

## Testing Requirements

1. **Reproduction test:**
   - Run hindcast validation 1950-2024 with seed 42
   - Should crash at month 424 (before fix)
   - Should complete successfully (after fix)

2. **Edge case tests:**
   - Values exactly at 0.0 and 1.0
   - Values at 0.0 ± 1e-15 and 1.0 ± 1e-15
   - Monte Carlo runs with N≥10 different seeds

3. **Regression prevention:**
   - Add unit test for `assertInRange` with epsilon parameter
   - Add integration test for social cascade dynamics over 1000 months

---

## Related Issues

- **Assertion utilities migration (MEDIUM-6):** This bug validates the need for defensive assertions
- **Hindcast validation framework:** Discovered during 1950-2024 validation implementation
- **Monte Carlo determinism:** May affect other long-term runs

---

## Priority Justification

**Why CRITICAL:**
- Blocks hindcast validation (HIGH value research infrastructure)
- Blocks long-term Monte Carlo runs (>35 years)
- Affects core simulation functionality (social tipping points)

**Why HIGH (not blocking all work):**
- Workaround exists: Run shorter simulations (<35 years)
- Only affects specific phase (positive tipping points)
- Fix is straightforward (~10 lines of code)

---

## Action Items

1. [ ] Fix: Implement Option 1 (epsilon tolerance in assertInRange)
2. [ ] Fix: Implement Option 3 (clamping in positiveTippingPoints.ts)
3. [ ] Test: Add unit tests for epsilon tolerance
4. [ ] Test: Run hindcast validation 1950-2024 with fix
5. [ ] Test: Monte Carlo validation (N≥10)
6. [ ] Document: Add floating-point precision guidelines to CLAUDE.md
7. [ ] Review: Architecture skeptic review of fix

---

## Discovery Context

**Discovered by:** Autonomous worker (Session 77)
**Discovery method:** Hindcast validation framework (1950-2024)
**Validation run:** `logs/hindcast_validation/hindcast_1950_2024_2025-12-12T19-40-41.log`
**Months simulated:** 424/888 (47.7% complete before crash)

**Partial validation results:** Not available (crash too early for meaningful comparison)

---

## Resolution

**Status:** ACTIVE
**Assigned:** simulation-maintainer (Roy)
**Estimated effort:** 1-2 hours
**Target completion:** Session 78

---

**Created:** 2025-12-12T19:45:00Z
**Last updated:** 2025-12-12T19:45:00Z
