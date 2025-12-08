# Proposed: Fix Conditional Climate Floor Defensive Coding

**Date:** 2025-12-08
**Priority:** MEDIUM
**Complexity:** Trivial (30 minutes)
**Source:** Architecture Integration Review (MEDIUM-3)

---

## Problem Statement

The conditional climate stability floor (HIGH-7) has a defensive fallback that could mask initialization errors:

```typescript
// Current code (ClimateSystemPhase.ts:857-879)
const currentTemperature = assertFinite(
  state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue ?? 0,  // ❌ Fallback
  ...
);
const parisSuccess = currentTemperature < 1.5;  // 0 < 1.5 = true (incorrect!)
```

**Problem:** If `planetaryBoundariesSystem` is not initialized, temperature defaults to 0, triggering false positive "Paris success" and incorrectly applying the climate floor.

**Impact:** Low probability (planetaryBoundariesSystem is always initialized in production), but violates "fail loudly" philosophy.

---

## Proposed Solution

Replace defensive fallback with fail-loudly assertion:

```typescript
// Proposed fix
const climateBoundary = state.planetaryBoundariesSystem?.boundaries?.climate_change;
if (!climateBoundary || climateBoundary.currentValue === undefined) {
  throw new Error('❌ CRITICAL: Climate boundary required for conditional floor calculation');
}
const currentTemperature = assertFinite(
  climateBoundary.currentValue,  // ✅ No fallback - fail loudly if missing
  {
    location: 'ClimateSystemPhase.applyConditionalStabilityFloor',
    valueName: 'currentTemperature',
    month: state.currentMonth
  }
);
const parisSuccess = currentTemperature < 1.5;
```

**Philosophy alignment:** "Research simulation rigor - fail loudly on invalid values, no silent fallbacks."

---

## Research Needed

None - this is a defensive coding fix with no behavioral changes in valid scenarios.

---

## Effort Estimate

**Total: 30 minutes**
- Implementation: 10 minutes (replace fallback with assertion)
- Testing: 10 minutes (verify error thrown if boundary missing)
- Monte Carlo validation: 10 minutes (determinism check with valid state)

---

## Success Criteria

1. ✅ Tests pass (valid scenarios unchanged)
2. ✅ Error thrown if climate boundary missing or undefined
3. ✅ Monte Carlo runs produce identical results (seed=42, N=3)
4. ✅ Error message includes full context (location, valueName, month)

---

## Next Steps

1. Implement fix (simulation-maintainer)
2. Add test case for missing climate boundary
3. Run Monte Carlo validation
4. Document in devlogs

**Trigger:** Can be addressed anytime - low priority, trivial effort.
