# Research Verification: Nuclear Winter Agricultural Impacts (Shi et al. 2025)

**Commit:** 85bcf6e3530d0d112faa335279b92cb10ca81925
**Date:** 2025-11-11
**Status:** PENDING VERIFICATION
**Priority:** MEDIUM (parameter refinement, not new mechanics)

---

## Summary

New research document added: research/nuclear_winter_agricultural_impacts_2025_update.md

This document provides 2025 updates to nuclear winter agricultural impact parameters:
1. Shi et al. (2025) - Crop-specific yield modeling with UV-B radiation effects
2. ANFOS Project (2024-2027) - Ongoing multi-model ensemble (results pending)

Current code uses: Robock & Toon (2012), Coupe et al. (2019), Xia et al. (2022)

---

## Layer 1: Citation Existence Verification

### 1. Shi, Y., & Kemanian, A. (2025)
**Citation:** Shi, Y., & Kemanian, A. (2025). Adapting agriculture to climate catastrophes: the nuclear winter scenario. Environmental Research Letters, 20(6), 064006. https://doi.org/10.1088/1748-9326/adcfb5

**Verification Needed:**
- [ ] Confirm paper exists at DOI
- [ ] Verify Penn State affiliation
- [ ] Confirm peer-reviewed publication
- [ ] Verify 2025 publication date

### 2. Xia et al. (2022) - Direct Access
**Citation:** Xia, L., Robock, A., et al. (2022). Nature Food, 3(8), 586-596. https://doi.org/10.1038/s43016-022-00573-0

**Verification Needed:**
- [ ] Obtain full text (currently paywalled)
- [ ] Verify mortality timeline (2-5 years?)
- [ ] Verify 90% mortality upper bound claim

### 3. IIASA ANFOS Project
**Verification Needed:**
- [ ] Confirm project on IIASA website
- [ ] Verify 2024-2027 timeline

---

## Layer 2: Claim Verification

### Claim 1: Crop Yield Reductions
**From research doc:** -7% (5.5 Tg) to -87% (165 Tg including UV-B)

**Verification Required:**
1. Extract exact quotes from Shi et al. 2025
2. Confirm UV-B is additive vs. multiplicative
3. Check if these are global averages vs. regional

### Claim 2: UV-B Timeline
**From research doc:** "Peak 6-8 years after global war"

**Verification Required:**
1. Find exact quote from paper
2. Confirm mechanism: soot → ozone depletion → UV-B
3. Verify duration and onset timing

### Claim 3: Mortality Estimates
**From code:** "90% Northern Hemisphere dies"
**From research doc:** 2B (regional) to 5B (global) deaths

**Verification Required:**
1. Obtain Xia et al. 2022 full text
2. Verify exact mortality projections
3. Check adaptation assumptions

---

## Code Locations Requiring Updates

### src/simulation/nuclearWinter.ts
**Lines 7-17:** Add Shi et al. (2025) citation
**Lines 200+:** Add UV-B second-order effect (if verified)

### Recommended Parameter Updates (if verified)
```typescript
const FOOD_PRODUCTION_MULTIPLIER = {
  regional_war_5tg: 0.93,     // -7% (Shi et al. 2025)
  large_war_165tg: 0.13       // -87% incl. UV-B
};

const UV_B_DAMAGE = {
  peak_months: 72-96,         // 6-8 years
  peak_reduction: 0.07        // +7% at peak
};
```

---

## Priority Assessment

**Priority:** MEDIUM

**Rationale:**
- Parameter refinement (not new mechanics)
- Nuclear winter already implemented
- Adds scientific rigor (2025 vs 2012-2019 sources)
- UV-B effect is secondary (0-7%)

---

## Verification Workflow

1. **Citation Access** (super-alignment-researcher)
   - Access Shi et al. 2025 via DOI
   - Obtain Xia et al. 2022 full text
   - Verify ANFOS project

2. **Claim Validation** (research-skeptic)
   - Extract exact quotes
   - Check for contradictions
   - Assess extrapolations

3. **Parameter Integration** (simulation-maintainer)
   - Update nuclearWinter.ts if verified
   - Add UV-B mechanics if justified

4. **Testing** (priya)
   - Monte Carlo validation
   - Compare old vs new parameters

5. **Documentation** (wiki-documentation-updater)
   - Update wiki with findings
