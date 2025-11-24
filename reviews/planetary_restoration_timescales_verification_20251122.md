# Planetary Restoration Timescales - Code Verification
**Date:** November 22, 2025
**Task:** Validation Action Item #6 (HIGH priority)
**Research Source:** Drüke et al. (2024), irreversibility_framework_20251116.md
**Reviewer:** Autonomous Worker

---

## Executive Summary

**Status:** ⚠️ **PARTIAL IMPLEMENTATION** - Some timescales present, others missing

**Finding:** The codebase implements recovery mechanisms for several planetary boundaries, but the specific long-term timescales from Drüke et al. (2024) and the irreversibility framework are only partially implemented.

**Grade:** C+ (Functional but incomplete)

---

## Required Parameters (from Research)

Per Drüke et al. (2024) and irreversibility_framework_20251116.md:

1. **Ice sheet recovery:** 100-800 years (centennial to millennial timescales)
2. **Permafrost recovery:** 200-500 years (irreversible on human timescales)
3. **Nitrogen cycling:** 50-200 years
4. **Amazon resilience:** 300-1,000 years (if collapse occurs)
5. **AMOC recovery:** 500-2,000 years (if collapse occurs)
6. **Coral reefs:** 20-100 years (regional variation)
7. **Soil degradation (severe):** 200-1,000 years

---

## Current Implementation Status

### ✅ IMPLEMENTED

#### 1. Novel Entities Recovery
**File:** `src/simulation/planetaryBoundaries.ts:243`
```typescript
recoveryHalfLife: 75 // 50-100 year range (Montreal Protocol analog)
```
**Status:** ✅ Correct (within research range)

#### 2. Biosphere Integrity Recovery
**File:** `src/simulation/planetaryBoundaries.ts:154`
```typescript
recoveryHalfLife: 200 // Century-scale ecosystem recovery
```
**Status:** ✅ Correct (within 100-800 year range, conservative estimate)

#### 3. Amazon Dieback Transition
**File:** `src/simulation/specificTippingPoints.ts:241`
```typescript
// 50-year transition to savanna begins
// Post-trigger: Transition to savanna over 50 years (600 months)
```
**Status:** ⚠️ PARTIAL - Models collapse (50 years) but NOT recovery (300-1,000 years)
**Gap:** Amazon recovery mechanics not implemented (marked as "IRREVERSIBLE on human timescales")

#### 4. Coral Reef Collapse/Recovery
**File:** `src/simulation/specificTippingPoints.ts:375`
```typescript
// 15-year mass die-off begins
```
**Status:** ⚠️ PARTIAL - Models collapse (15 years) but recovery timescale not explicit
**Note:** Code has recovery logic but timescale parameter not clearly set to 20-100 years

---

### ❌ MISSING IMPLEMENTATION

#### 1. Ice Sheet Recovery Timescales
**Required:** 100-800 years (non-linear, exponential recovery)
**Current Status:** NOT FOUND in code
**Files Searched:**
- `src/simulation/planetaryBoundaryRecovery.ts` - No ice sheet recovery function
- `src/simulation/specificTippingPoints.ts` - No ice sheet mechanics
- `src/simulation/irreversibilityInitialization.ts` - Has `antarcticWAISCollapsed: false` but no recovery mechanics

**Gap:** Ice sheet recovery mechanics not implemented

#### 2. Permafrost Recovery Timescales
**Required:** 200-500 years (irreversible on human timescales)
**Current Status:** NOT FOUND in code
**Files Searched:**
- `src/simulation/planetaryBoundaryRecovery.ts:181` - Mentions "Schuur et al. (2022): Permafrost carbon feedback" but no recovery timescale parameter
- `src/simulation/specificTippingPoints.ts` - Has permafrost thaw tracking but no recovery mechanics

**Gap:** Permafrost recovery mechanics not implemented (correctly marked as irreversible)

#### 3. Nitrogen Cycling Recovery Timescales
**Required:** 50-200 years
**Current Status:** ⚠️ UNCLEAR
**Files Searched:**
- `src/simulation/planetaryBoundaryRecovery.ts:48` - Has `updateNitrogenRecovery()` function
- `src/simulation/planetaryBoundaries.ts:195` - `timescaleYears: 30` (TOO SHORT vs research)

**Gap:** Nitrogen recovery timescale set to 30 years, should be 50-200 years per research

#### 4. AMOC Recovery Timescales
**Required:** 500-2,000 years (if collapse occurs)
**Current Status:** NOT FOUND in code
**Files Searched:**
- No AMOC-specific recovery mechanics found

**Gap:** AMOC recovery timescales not implemented

---

## Detailed Findings

### Finding 1: Recovery Mechanisms Exist But Timescales Inconsistent

**Evidence:**
```typescript
// src/simulation/planetaryBoundaries.ts
boundaries.nitrogen_phosphorus_flows = {
  timescaleYears: 30,  // ❌ TOO SHORT (research: 50-200 years)
  recoveryHalfLife: undefined
};

boundaries.land_system_change = {
  timescaleYears: 50,  // ✅ ACCEPTABLE (within range)
};

boundaries.biosphere_integrity = {
  timescaleYears: 100,  // ✅ GOOD
  recoveryHalfLife: 200,  // ✅ GOOD (within 100-800 year range)
};
```

**Analysis:** Some boundaries have correct timescales, others are too optimistic (30 years for nitrogen vs 50-200 year research range).

### Finding 2: Irreversibility Framework Uses Asymptotic Recovery

**Evidence:**
```typescript
// src/simulation/utils/irreversibility.ts
export function asymptoteRecovery(
  current: number,
  floor: number,
  halfLife: number,  // In years
  deltaMonths: number = 1
): number {
  const lambda = Math.log(2) / halfLife;  // Decay constant
  const monthlyLambda = lambda / 12;
  const decay = Math.exp(-monthlyLambda * deltaMonths);
  return floor + (current - floor) * decay;
}
```

**Analysis:** ✅ Uses exponential decay (non-linear, correct for long-term recovery)

### Finding 3: Post-2100 Commitment Not Modeled

**Required:** Drüke et al. (2024) - 30% of warming occurs post-2100 even with emissions stabilization
**Current Status:** NOT FOUND in climate recovery code

**Gap:** `post2100CommitmentFraction = 0.30` parameter not implemented

---

## Recommendations

### HIGH PRIORITY (Next 2 weeks)

1. **Fix Nitrogen Recovery Timescale**
   - Change: `timescaleYears: 30` → `timescaleYears: 75` (midpoint of 50-200)
   - File: `src/simulation/planetaryBoundaries.ts:195`
   - Effort: 5 minutes

2. **Add Ice Sheet Recovery Mechanics**
   - Implement: Greenland/WAIS recovery with 100-800 year half-lives
   - Use: Asymptotic recovery function (already exists)
   - Effort: 2-3 hours
   - Note: May be intentionally omitted (marked as irreversible on human timescales)

3. **Add Post-2100 Climate Commitment**
   - Implement: 30% of warming occurs after emissions stabilize (Drüke et al. 2024)
   - File: `src/simulation/planetaryBoundaryRecovery.ts` (climate recovery section)
   - Effort: 1-2 hours

### MEDIUM PRIORITY (Next month)

4. **Verify Amazon Recovery Timescale**
   - Current: Marked as "IRREVERSIBLE on human timescales"
   - Research: 300-1,000 years if recovery possible
   - Decision: Either implement 300-1,000 year recovery OR document why irreversible assumption is justified

5. **Add AMOC Recovery Mechanics**
   - Implement: 500-2,000 year recovery if collapse occurs
   - Requires: AMOC collapse detection mechanics (may not exist yet)

---

## Validation Checklist

| Parameter | Required | Current | Status | Action |
|-----------|----------|---------|--------|--------|
| Ice sheet recovery | 100-800 yr | NOT IMPL | ❌ MISSING | Implement or document irreversibility |
| Permafrost recovery | 200-500 yr | Marked irrev | ✅ ACCEPT | Correctly treated as irreversible |
| Nitrogen cycling | 50-200 yr | 30 yr | ❌ TOO SHORT | Fix to 75 yr |
| Amazon resilience | 300-1,000 yr | Marked irrev | ⚠️ PARTIAL | Implement recovery OR justify |
| Biosphere integrity | 100-800 yr | 200 yr | ✅ CORRECT | Within range |
| Novel entities | 50-100 yr | 75 yr | ✅ CORRECT | Within range |
| AMOC recovery | 500-2,000 yr | NOT IMPL | ❌ MISSING | Implement |
| Post-2100 commitment | 30% warming | NOT IMPL | ❌ MISSING | Implement |

---

## Code Locations Reference

**Recovery Functions:**
- `src/simulation/planetaryBoundaryRecovery.ts` - Main recovery logic
- `src/simulation/utils/irreversibility.ts` - Asymptotic recovery utilities
- `src/simulation/specificTippingPoints.ts` - Tipping point collapse/recovery

**Timescale Parameters:**
- `src/simulation/planetaryBoundaries.ts:118-296` - Boundary initialization
- Line 154: Biosphere recoveryHalfLife = 200 ✅
- Line 195: Nitrogen timescaleYears = 30 ❌ (should be 50-200)
- Line 243: Novel Entities recoveryHalfLife = 75 ✅

**Research Documents:**
- `research/irreversibility_framework_20251116.md` - Comprehensive timescale documentation
- `research/AUTONOMOUS_RESEARCHER_SESSION_20251120.md:190` - Drüke et al. 2024 parameters

---

## Conclusion

**Status:** ⚠️ PARTIAL COMPLIANCE

The codebase implements asymptotic recovery mechanics (✅ correct non-linear approach) and has some correct timescales (biosphere, novel entities), but several research-specified parameters are missing or too optimistic:

**Critical Gaps:**
1. Nitrogen recovery: 30 years vs 50-200 years (too optimistic)
2. Ice sheet recovery: Not implemented
3. AMOC recovery: Not implemented
4. Post-2100 climate commitment: Not implemented

**Next Steps:**
1. Fix nitrogen timescale (5 minutes)
2. Add post-2100 climate commitment (1-2 hours)
3. Decide on ice sheet/AMOC: implement or document irreversibility assumption

**Effort:** 2-4 hours total to address HIGH priority gaps

---

**Report Status:** ✅ READY FOR REVIEW
**Recommendation:** Address nitrogen timescale immediately (quick fix), defer ice sheet/AMOC to MEDIUM priority research discussion
