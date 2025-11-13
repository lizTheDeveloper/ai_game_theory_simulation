# AI Scaling Implementation Plan

**Date:** 2025-11-13
**Validation:** reviews/ai_scaling_validation_20251113.md
**Status:** READY FOR IMPLEMENTATION

## Executive Summary

**CRITICAL CORRECTION:** The original claim of "100-1000× underestimation" was an ERROR.

**Actual Status:**
- Current simulation: **3.11× per year** (Moore's Law 2.83× + Algo 1.10×)
- Research target: **4.1× per year** (Sevilla & Roldán 2024, training compute)
- Actual discrepancy: **1.32× underestimation** (32% too low, not 10,000%!)

**Root Cause of Error:** The verification file incorrectly calculated "2.4× per decade" by misunderstanding the parameter semantics. The actual implementation uses correct physics-based growth rates.

---

## Current Implementation Analysis

### Compute Growth (src/simulation/computeInfrastructure.ts:707-792)

**Hardware (Moore's Law):**
```typescript
const MOORES_LAW_RATE = Math.pow(2, 1/8) - 1;  // 9.05% per month
// Result: 2.83× per year, doubles every 8 months
```

**Algorithmic Efficiency:**
```typescript
let CONTINUOUS_ALGO_RATE = Math.pow(1.10, 1/12) - 1;  // 10% annual
// Result: 1.10× per year, 0.797% per month
```

**Combined Effective Compute:**
```
3.11× per year = 2.83× (hardware) × 1.10× (algorithms)
```

**10-Year Growth:**
```
Current: 84,992× (very close to target range!)
Research: ~100,000-10,000,000× (depends on algorithmic efficiency assumptions)
```

### Unused Parameters (src/simulation/config/centralConfig.ts)

**DEAD CODE - NOT USED:**
```typescript
AI_CAPABILITY_DOUBLING_TIME: 12,  // Line 397 - NEVER REFERENCED
COMPUTE_GROWTH_RATE: 1.0,          // Line 404 - NEVER REFERENCED
```

These parameters exist in centralConfig.ts but are not imported or used anywhere in the simulation. The actual growth is hardcoded in computeInfrastructure.ts.

---

## Research Validation Summary

### Verified Claims ✅

1. **Training compute growth:** 4.1× per year (90% CI: 3.7× to 4.6×)
   - Source: Sevilla & Roldán (2024), Epoch AI
   - Time period: 2010-2024 (14 years)
   - VERIFIED via https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year

2. **Training cost growth:** 2.4× per year (90% CI: 2.0× to 2.9×)
   - Source: Cottier et al. (2024), arXiv:2405.21015v2
   - VERIFIED via https://arxiv.org/abs/2405.21015
   - Explains gap: Hardware efficiency improvements (~2× per year) reduce costs

3. **Future projections:**
   - $1B training runs by 2027 (Cottier - trend extrapolation)
   - $10-100B by 2025-2027 (Amodei - Anthropic CEO interviews)
   - VERIFIED via CNBC Squawk Box April 23, 2024

### Unverified Claims ⚠️

1. **Algorithmic efficiency:** Claimed "2.5× per year" in verification file
   - Source: "Epoch AI 2024" (no specific link provided)
   - Status: NOT VERIFIED in this review
   - Current simulation uses: 1.10× per year (10% annual)
   - NEEDS VERIFICATION before updating

---

## Implementation Decisions

### Option 1: Update Hardcoded Values (RECOMMENDED)

**Target:** Bring current 3.11× per year to research-backed 4.1× per year

**Method:** Adjust Moore's Law rate from 2.83× to 3.73× per year (hold algorithms constant)

**Rationale:**
- Training compute growth (4.1×) captures BOTH hardware improvements AND purchasing decisions
- Current "Moore's Law" parameter (2.83× per year) is actually too conservative
- Epoch AI data shows frontier labs are buying 4.1× more compute per year
- This includes: better hardware (Moore's Law) + larger clusters (capital investment)

**Math:**
```python
# Target: 4.1× per year total
# Keep algorithmic: 1.10× per year
# Solve for hardware: hardware × 1.10 = 4.1
# hardware = 4.1 / 1.10 = 3.73× per year

# Convert to monthly rate:
# 3.73 = (1 + r)^12
# r = 3.73^(1/12) - 1 = 0.1154 = 11.54% per month

# Doubling time: log(2) / log(1.1154) = 6.33 months
```

**Implementation:**
```typescript
// File: src/simulation/computeInfrastructure.ts:707

// OLD (INCORRECT - too conservative)
const MOORES_LAW_RATE = Math.pow(2, 1/8) - 1;  // 9.05% per month = 2.83× per year

// NEW (RESEARCH-BACKED)
/**
 * Training compute growth rate (hardware acquisition + efficiency)
 * @research Sevilla & Roldán (2024), Epoch AI - 4.1× per year (90% CI: 3.7× to 4.6×)
 * @rationale Captures both Moore's Law (chip improvements) and capital investment (larger clusters)
 * @historical 2010-2024 empirical data (14 years, 200+ models)
 * @calculation 4.1× per year / 1.10× algorithmic = 3.73× hardware annual
 * @monthly 3.73^(1/12) - 1 = 11.54% per month
 * @doubling 6.33 months
 */
const HARDWARE_COMPUTE_GROWTH_RATE = Math.pow(3.73, 1/12) - 1;  // 11.54% per month = 3.73× per year
```

**Result:**
- New combined growth: 3.73× × 1.10× = **4.10× per year** ✅
- Matches research target exactly
- 10-year growth: 4.10^10 = **~600,000×**

### Option 2: Delete Unused Parameters (CLEANUP)

**Problem:** centralConfig.ts has parameters that aren't used anywhere

**Options:**
1. **Delete them** (clean up dead code)
2. **Document as unused** (preserve for future use)
3. **Wire them up** (refactor to use config instead of hardcoded values)

**Recommendation:** Document as unused with TODO for future refactoring

```typescript
// File: src/simulation/config/centralConfig.ts:397-404

/**
 * AI capability doubling time (months)
 * @status UNUSED - Growth rates are hardcoded in computeInfrastructure.ts
 * @todo Refactor to use this config value
 * @research Epoch AI (2024) - Current implementation: 6.33 months (after fix)
 */
AI_CAPABILITY_DOUBLING_TIME: 6.33,

/**
 * Compute growth rate (per year, multiplicative)
 * @status UNUSED - Growth rates are hardcoded in computeInfrastructure.ts
 * @todo Refactor to use this config value
 * @research Sevilla & Roldán (2024) - 4.1× per year (90% CI: 3.7× to 4.6×)
 */
COMPUTE_GROWTH_RATE: 4.1,
```

### Option 3: Verify Algorithmic Efficiency Claim (FUTURE WORK)

**Current:** 1.10× per year (10% annual improvement)
**Claimed:** 2.5× per year (from unverified Epoch AI source)

**Action:** Mark as [RESEARCH NEEDED] and defer to future researcher

**If verified:** Could update CONTINUOUS_ALGO_RATE to match research
**Impact:** Would increase combined growth from 4.1× to ~9.3× per year

---

## Recommended Implementation Sequence

### Phase 1: Critical Fix (THIS PR)

1. ✅ **Update HARDWARE_COMPUTE_GROWTH_RATE** (src/simulation/computeInfrastructure.ts:707)
   ```typescript
   // Change from: Math.pow(2, 1/8) - 1  (2.83× per year)
   // Change to:   Math.pow(3.73, 1/12) - 1  (3.73× per year)
   ```

2. ✅ **Add research citation** (src/simulation/computeInfrastructure.ts:575-577)
   ```typescript
   /**
    * References:
    * - Sevilla & Roldán (2024): Training compute growth 4.1×/year (Epoch AI)
    * - Cottier et al. (2024): Training cost growth 2.4×/year (arXiv:2405.21015v2)
    */
   ```

3. ✅ **Update centralConfig.ts comments** (mark as unused)

4. ✅ **Add validation test** (new test file)

### Phase 2: Documentation (THIS PR)

1. ✅ Update docs/wiki/README.md with new growth rates
2. ✅ Update research/verification_0a1e5b8_20251107.md with corrections
3. ✅ Add devlog entry explaining the fix

### Phase 3: Future Work (DEFER)

1. ⏳ Verify algorithmic efficiency claim (2.5× per year)
2. ⏳ Refactor to use centralConfig.ts values instead of hardcoded
3. ⏳ Add economic constraints (training cost limits, budget caps)
4. ⏳ Add lab count dynamics (10-15 → 3-5 convergence)

---

## Monte Carlo Validation Plan

**Objective:** Verify the parameter change doesn't break simulation outcomes

**Baseline (before fix):**
- Growth rate: 3.11× per year
- 10-year compute: ~85,000×

**After fix:**
- Growth rate: 4.1× per year
- 10-year compute: ~600,000×

**Expected Impact:**
- Faster AI capability growth
- Earlier breakthrough technology unlocks
- Possibly different outcome distributions

**Validation:**
1. Run N=10 Monte Carlo simulations with OLD parameters
2. Run N=10 Monte Carlo simulations with NEW parameters
3. Compare outcome distributions (should be QUALITATIVELY SIMILAR)
4. Check for new bugs (NaN, infinite loops, assertion failures)

**Pass Criteria:**
- No crashes or assertion failures
- Outcome distributions shift slightly (more utopias? faster timelines?)
- CV < 0.01% (determinism maintained)

---

## Files to Modify

### 1. src/simulation/computeInfrastructure.ts

**Line 575-577:** Update comment to add new research citations
**Line 707:** Change MOORES_LAW_RATE calculation to HARDWARE_COMPUTE_GROWTH_RATE
**Line 708:** Update comment with new research backing

### 2. src/simulation/config/centralConfig.ts

**Line 397-404:** Add @status UNUSED comments and update values for future use

### 3. docs/wiki/README.md

**Section: AI Systems → Compute Growth:** Update with new research-backed values

### 4. research/verification_0a1e5b8_20251107.md

**Add correction section:** Explain the 100-1000× claim was an error, actual is 1.32×

### 5. devlogs/ (NEW FILE)

Create devlog entry explaining the fix and correction

---

## Risk Assessment

**LOW RISK** - This is a 32% increase in growth rate, not a 1000× change

**Potential Issues:**
1. Slightly faster AI timelines (expected, desirable for research accuracy)
2. Different breakthrough unlock order (acceptable variation)
3. Edge cases in economic constraints (may need tuning)

**Mitigation:**
- Monte Carlo validation will catch major issues
- Architecture review will check for performance impacts
- Can easily revert if problems arise

---

## Success Criteria

**Implementation complete when:**
- ✅ HARDWARE_COMPUTE_GROWTH_RATE = 3.73× per year
- ✅ Research citation added to computeInfrastructure.ts
- ✅ centralConfig.ts marked as unused with correct values
- ✅ Monte Carlo N=10 passes without errors
- ✅ Determinism maintained (CV < 0.01%)
- ✅ Documentation updated

**Status:** READY TO IMPLEMENT
**Priority:** HIGH (fixes 32% parameter underestimation)
**Complexity:** LOW (single parameter change + docs)
