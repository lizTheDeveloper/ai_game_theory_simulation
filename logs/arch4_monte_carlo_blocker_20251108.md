# ARCH-4 Monte Carlo Validation - BLOCKED

**Date:** November 8, 2025
**Phase:** 4 (Monte Carlo Validation)
**Status:** ❌ BLOCKED by pre-existing bug (not ARCH-4 related)

---

## Issue Summary

**Error:**
```
❌ AI capability must be integer in AILifecyclePhase.execute
   capabilityProfile.physical = 0.008108587879542122
   Expected: Integer in [0, 5]
```

**Root Cause:** `scaleCapabilityProfile()` in `src/simulation/capabilities.ts` multiplies capabilities by continuous values without rounding to integers.

**Location:** `src/simulation/capabilities.ts:347-385`

```typescript
export function scaleCapabilityProfile(
  profile: AICapabilityProfile,
  multiplier: number
): AICapabilityProfile {
  return {
    physical: profile.physical * multiplier,  // ❌ Continuous result
    digital: profile.digital * multiplier,    // ❌ Continuous result
    // ... etc
  };
}
```

**Impact:** All AI capability scaling operations (crisis points, initialization) create invalid non-integer capabilities, caught by assertions added Nov 7, 2025.

---

## Why This Blocks ARCH-4

ARCH-4 validation requires N≥10 Monte Carlo runs to validate:
- Determinism (same seed → same results)
- No NaN propagation from new climate→boundaries integration
- Integration effects visibility
- Performance benchmarks

**Cannot proceed** until simulation can run without crashing on AI capability assertions.

---

## Fix Required

**Minimal Fix:** Round all multiplied capabilities to integers

```typescript
export function scaleCapabilityProfile(
  profile: AICapabilityProfile,
  multiplier: number
): AICapabilityProfile {
  return {
    physical: Math.round(profile.physical * multiplier),
    digital: Math.round(profile.digital * multiplier),
    cognitive: Math.round(profile.cognitive * multiplier),
    // ... etc (apply to all 17 dimensions + research subdimensions)
  };
}
```

**Scope:** ~30 capability dimensions need rounding (top-level + research subdimensions)

**Risk:** LOW (rounding is semantically correct - capabilities are discrete levels [0-5])

---

## Recommended Action

**Option A: Quick Fix (Recommended)**
1. Apply rounding fix to `scaleCapabilityProfile()`
2. Commit as `fix(ai): Round scaled capabilities to integers`
3. Resume ARCH-4 Monte Carlo validation

**Option B: Route to Agent**
1. Spawn `simulation-maintainer` to fix capability scaling
2. Wait for fix completion
3. Resume ARCH-4 validation

**Option C: Workaround**
1. Temporarily disable AI capability assertions
2. Run Monte Carlo for ARCH-4 validation
3. File bug for separate fix

---

## ARCH-4 Status

**Completed Phases:**
- ✅ Phase 1: Research & Validation (Quality Gate 1 PASSED, grade A-)
- ✅ Phase 2: Implementation (climate→boundaries integrated)
- ✅ Phase 3: Architecture Review (Quality Gate 2 PASSED, grade A-)
- ❌ Phase 4: Monte Carlo Validation (BLOCKED by unrelated bug)

**Pending Phases:**
- ⏳ Phase 5: Documentation (wiki update)
- ⏳ Phase 6: Archival (roadmap cleanup)

**Estimated Time to Unblock:** 5-10 minutes (apply fix + rerun Monte Carlo)

---

## Decision Point

**User:** Should I:
1. Apply the minimal fix directly and resume validation?
2. Spawn simulation-maintainer to handle this properly?
3. Skip Monte Carlo for now and proceed to documentation?

**Recommendation:** Option 1 (quick fix) - this is a straightforward correctness issue that blocks critical validation.
