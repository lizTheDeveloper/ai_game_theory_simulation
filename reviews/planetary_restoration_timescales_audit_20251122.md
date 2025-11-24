# Planetary Restoration Timescales Code Audit
**Date:** November 22, 2025
**Auditor:** Autonomous Worker
**Priority:** HIGH (from VALIDATION_ACTION_ITEMS_20251121.md item #6)
**Status:** PRELIMINARY AUDIT COMPLETE - Full implementation review needed

---

## Executive Summary

**Finding:** Drüke et al. (2024) parameters are DOCUMENTED in research but NOT fully implemented in simulation code.

**Recommendation:** Implement missing recovery timescales and post-2100 commitment parameters.

---

## Research Parameters (Drüke et al. 2024)

**Citation:** Drüke, M., Lucht, W., von Bloh, W., et al. (2024). "The long-term impact of transgressing planetary boundaries on biophysical atmosphere–land interactions." *Earth System Dynamics*, 15, 467-493. DOI: 10.5194/esd-15-467-2024

**Key Parameters:**
1. **Ice Sheet Recovery:** 100-800 years (should NOT be linear)
2. **Permafrost Recovery:** 200-500 years
3. **Nitrogen Cycling:** 50-200 years
4. **Amazon Resilience:** 300-1,000 years
5. **Post-2100 Commitment:** 30-50% for ice sheets (warming continues after emissions stabilize)
6. **Recovery Curves:** Exponential/non-linear (not linear)

**Source:** research/AUTONOMOUS_RESEARCHER_SESSION_20251120.md lines 72-191

---

## Current Implementation Status

### ✅ IMPLEMENTED: General Tier Structure

**File:** `src/simulation/planetaryBoundaryRecovery.ts`

**3-Tier System:**
- Tier 1 (Reversible): Ozone, freshwater, aerosols - 10-50 years ✅
- Tier 2 (Partial): Climate, P/N, land system - 30-100+ years ✅
- Tier 3 (Irreversible): Extinction, deep ocean acidification, PFAS - permanent ✅

**Lines 16-19:** Tier system correctly documented

### ⚠️ MISSING: Specific Timescale Parameters

**Climate Recovery (lines 164-269):**
- **Current:** Generic "50-100 years" reference in comments
- **Missing:** Ice sheet 100-800 year timescale
- **Missing:** Post-2100 commitment (30-50% additional warming)
- **Missing:** Explicit non-linear recovery curve implementation

**Permafrost:**
- **Status:** No dedicated recovery function found
- **Missing:** 200-500 year recovery timescale
- **Missing:** Carbon release/reabsorption dynamics

**Amazon/Forest Systems:**
- **Current:** Generic "land system recovery" function (line 49)
- **Missing:** 300-1,000 year Amazon-specific timescale
- **Missing:** Deforestation threshold-dependent recovery rates

**Nitrogen Cycling:**
- **Current:** Generic nitrogen recovery function (line 48)
- **Missing:** 50-200 year timescale verification needed
- **Location:** May be in nitrogenFoodCoupling.ts or legacyNutrientStocks.ts

### ⚠️ UNCLEAR: Recovery Curve Shape

**Question:** Are recovery curves linear or exponential/non-linear?

**Current Code Pattern (lines 90-120):**
```typescript
boundary.recoveryMonths = boundary.recoveryMonths + governanceAdjustment;
const recoveryRate = 0.002 * governanceAdjustment; // 0.2%/month
```

**Drüke Requirement:** Exponential/non-linear curves (not linear 0.2%/month)

**Utilities Available:** `asymptoteRecovery()` function exists (line 33) but unclear if used for all boundaries

---

## Action Items

### For simulation-maintainer Agent:

1. **Verify Recovery Curve Implementation:**
   - Check if `asymptoteRecovery()` is used for ice sheets, permafrost, Amazon
   - If linear rates used, replace with exponential/asymptotic curves
   - Drüke: "Recovery is NOT linear - slower at extremes, faster mid-range"

2. **Add Missing Timescales:**
   - Ice sheets: 100-800 year parameter (currently generic "50-100")
   - Permafrost: 200-500 year recovery function (may not exist)
   - Amazon: 300-1,000 year timescale (verify land system function)
   - Nitrogen: Verify 50-200 year in legacy nutrient stocks module

3. **Implement Post-2100 Commitment:**
   - Add parameter: `post2100CommitmentFraction = 0.30` (30% warming after stabilization)
   - Location: Climate recovery or climate degradation functions
   - Mechanism: Even after emissions=0, temperature continues rising for decades

4. **Cross-Reference with Legacy Nutrient Stocks:**
   - File: `src/simulation/legacyNutrientStocks.ts`
   - Check: Does nitrogen recovery use 50-200 year half-life?
   - Check: Sediment P half-life 50-500 years (matches Drüke indirectly)

---

## Files Requiring Detailed Review

1. `src/simulation/planetaryBoundaryRecovery.ts` (primary)
2. `src/simulation/specificTippingPoints.ts` (ice/permafrost)
3. `src/simulation/legacyNutrientStocks.ts` (nitrogen/phosphorus)
4. `src/simulation/utils/irreversibility.ts` (asymptote utilities)

---

## Estimated Effort

- **Code audit:** 1-2 hours (simulation-maintainer deep dive)
- **Implementation:** 2-3 hours if missing parameters need adding
- **Testing:** 1 hour Monte Carlo validation

**Total:** 4-6 hours

---

## Validation Criteria

✅ **PASS if:**
- Ice sheet recovery uses exponential curve with 100-800 year timescale
- Permafrost recovery function exists with 200-500 year timescale
- Amazon/forest recovery uses 300-1,000 year timescale
- Post-2100 commitment (30%) implemented in climate dynamics
- Nitrogen recovery verified at 50-200 year half-life

❌ **FAIL if:**
- Recovery curves are linear (constant %/month)
- Generic "30-100 years" used instead of system-specific timescales
- Post-2100 commitment missing (emissions stop → temperature immediately stabilizes)

---

## References

- **Research:** research/AUTONOMOUS_RESEARCHER_SESSION_20251120.md lines 72-191
- **Action Item:** reviews/VALIDATION_ACTION_ITEMS_20251121.md item #6
- **Implementation:** src/simulation/planetaryBoundaryRecovery.ts
- **Original Paper:** DOI: 10.5194/esd-15-467-2024

---

**Next Step:** Assign to simulation-maintainer agent for detailed implementation review and fixes.
