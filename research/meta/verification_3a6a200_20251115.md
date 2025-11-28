# Research Verification Spec: Climate Tipping Cascades 2024-2025

**Commit:** 3a6a200063e848396f3a6a8d017396cf7175c00c
**Date:** November 15, 2025
**Verifier:** (To be assigned by orchestrator)
**Status:** PENDING VALIDATION

---

## Purpose

This document specifies what needs verification for the climate tipping cascades research update (commit 3a6a200). The research file `climate_tipping_cascades_2024_2025_update.md` introduces NEW parameters and REFINED timescales that require two-layer verification:

1. **Layer 1 - Citation Existence:** Do the papers actually exist? Are citations accurate?
2. **Layer 2 - Claim Verification:** Do the papers ACTUALLY support the claims made?

---

## Citations to Verify (Layer 1)

### Primary Sources (2024-2025)

**Citation 1: Ritchie et al. 2025**
- **Full Citation:** Ritchie, P. D. L., Huntingford, C., & Cox, P. M. (2025). "ESD Ideas: Climate tipping is not instantaneous – the duration of an overshoot matters." *Earth System Dynamics*, 16, 1523–1526. DOI: 10.5194/esd-16-1523-2025
- **Claimed Access:** Open Access, Copernicus Publications
- **Verification Status:** ❓ PENDING
- **Action Required:** Verify paper exists, authors are correct, DOI resolves

**Citation 2: Armstrong McKay 2024**
- **Full Citation:** Armstrong McKay, D. I. (2024). "Two decades of climate tipping points research: Progress and outlook." *Dialogues on Climate Change*. SAGE Publications. DOI: 10.1177/29768659241293272
- **Claimed Access:** Open Access
- **Verification Status:** ❓ PENDING
- **Action Required:** Verify paper exists, author is lead author of 2022 Science paper, DOI resolves

**Citation 3: Matthews et al. 2024**
- **Full Citation:** Matthews, T. K. R., et al. (2024). "Mortality impacts of the most extreme heat events." *Nature Reviews Earth & Environment*. DOI: 10.1038/s43017-024-00635-w
- **Claimed Journal:** Nature Reviews (top-tier)
- **Verification Status:** ❓ PENDING
- **Action Required:** Verify paper exists, journal is correct, DOI resolves

### Supporting Sources

**Citation 4: Global Tipping Points Report 2023**
- **Claimed Source:** University of Exeter, released at COP28
- **Claimed URL:** https://global-tipping-points.org/
- **Verification Status:** ❓ PENDING
- **Action Required:** Verify report exists, 50+ scientists contributed, released at COP28

**Citation 5: Armstrong McKay et al. 2022 (Foundational)**
- **Full Citation:** Armstrong McKay, D. I., et al. (2022). "Exceeding 1.5°C global warming could trigger multiple climate tipping points." *Science*, 377(6611), eabn7950.
- **Claimed Citations:** 3,500+ (as of document creation)
- **Verification Status:** ❓ PENDING (high confidence - widely cited)
- **Action Required:** Quick verification only (well-known paper)

---

## Claims to Verify (Layer 2 - CRITICAL)

### Claim Set A: Overshoot Tolerance (Ritchie et al. 2025)

**Location:** research/climate_tipping_cascades_2024_2025_update.md, lines 26-72

**Claim A1: 30-year overshoot tolerance**
- **Stated Claim:** "Restricting time over 1.5°C to <30 years considerably reduces tipping point risks"
- **Parameter Used:** `commitmentTime_months = 360` (30 years)
- **Verification Required:**
  - Does Ritchie et al. 2025 ACTUALLY state 30 years as a threshold?
  - Quote the specific passage from the paper
  - Is this for ALL tipping elements or specific ones?
  - Are there conditions (e.g., peak warming limit)?
- **Status:** ❓ PENDING

**Claim A2: 2.5°C peak warming limit**
- **Stated Claim:** "All tipping elements avoided if global warming over 1.5°C is restricted to 30 years AND peak warming is kept below 2.5°C"
- **Parameter Used:** `catastrophicThreshold_C = 2.5`
- **Verification Required:**
  - Does the paper specify 2.5°C as a hard limit?
  - Quote the specific passage
  - Is this derived or directly stated?
  - Are there confidence intervals?
- **Status:** ❓ PENDING

**Claim A3: Element-specific commitment times**
- **Stated Claims:**
  - "Greenland Ice Sheet: 50-100 years above 1.5°C before irreversible commitment"
  - "Amazon: 10-30 years above 3.5°C (fast-tipping)"
- **Parameters Used:**
  - `commitmentTimescale_months: 600` (ice sheets)
  - `commitmentTimescale_months: 120` (Amazon)
- **Verification Required:**
  - Does Ritchie 2025 provide element-specific timescales?
  - Are these values stated in the paper or extrapolated?
  - If extrapolated, from what data/models?
  - Quote supporting passages
- **Status:** ❓ PENDING

### Claim Set B: Cascade Timescales (Armstrong McKay 2024)

**Location:** research/climate_tipping_cascades_2024_2025_update.md, lines 98-171

**Claim B1: Threshold temperature ranges**
- **Stated Claims:**
  - "Greenland: 0.8-3.0°C above preindustrial (best estimate 1.5°C)"
  - "AMOC: 1.4-8.0°C (high uncertainty, best estimate 4.0°C)"
  - "Amazon: 2.0-6.0°C (best estimate 3.5°C)"
- **Verification Required:**
  - Does Armstrong McKay 2024 provide these ranges?
  - Are these updates to Armstrong McKay 2022 values?
  - Quote the specific table/section
  - How were "best estimates" derived?
- **Status:** ❓ PENDING

**Claim B2: Transition timescales**
- **Stated Claims:**
  - "Amazon dieback: 30-80 years (gradual)"
  - "Ice sheet collapse: 200-2,000 years for major impacts, 10,000+ for complete deglaciation"
- **Parameters Used:**
  - `transitionTimescale_months: [360, 960]` (Amazon)
  - `transitionTimescale_months: [2400, 24000]` (ice sheets)
- **Verification Required:**
  - Does the 2024 review refine these timescales from 2022?
  - Quote the specific passages
  - Are these observational, model-based, or expert judgment?
- **Status:** ❓ PENDING

**Claim B3: Cascade interaction timescales**
- **Stated Claims:**
  - "Greenland melt → AMOC weakening: 100-500 year cascade"
  - "AMOC weakening → Amazon drying: 50-200 year cascade"
- **Parameters Used:**
  - `cascadeDelay_months: [1200, 6000]` (Greenland→AMOC)
  - `cascadeDelay_months: [600, 2400]` (AMOC→Amazon)
- **Verification Required:**
  - Does Armstrong McKay 2024 provide cascade timescales?
  - Or are these from Wunderling et al. 2024 (cited in same section)?
  - Quote supporting passages
  - What is the confidence level?
- **Status:** ❓ PENDING

### Claim Set C: Heat Mortality Thresholds (Matthews et al. 2024)

**Location:** research/climate_tipping_cascades_2024_2025_update.md, lines 173-236

**Claim C1: Uncompensable wet-bulb thresholds**
- **Stated Claims:**
  - "Older adults (65+ years): 19-28°C wet-bulb"
  - "Middle age (40-65 years): 28°C wet-bulb"
  - "Younger adults (20-40 years): 32°C wet-bulb"
- **Parameters Used:**
  - `uncompensable_wetbulb_C: { older_adults: 19, young_adults: 32 }`
- **Verification Required:**
  - Does Matthews 2024 provide these age-specific thresholds?
  - Quote the specific table/figure
  - What is "uncompensable" - inability to thermoregulate?
  - Are these empirical or model-based?
- **Status:** ❓ PENDING

**Claim C2: Unsurvivable thresholds**
- **Stated Claims:**
  - "Older adults: 20-34°C wet-bulb (1.8% land area exceeded 1994-2023)"
  - "Younger adults: 34°C wet-bulb (never exceeded historically)"
- **Parameters Used:**
  - `unsurvivable_wetbulb_C: { older_adults: 20, young_adults: 34 }`
- **Verification Required:**
  - Does the paper distinguish "uncompensable" vs "unsurvivable"?
  - Quote the definitions
  - What is the survival time at these thresholds? (claimed: "lethal within 6 hours")
- **Status:** ❓ PENDING

**Claim C3: Historical mortality**
- **Stated Claim:** "Over 260,000 heat-related fatalities in deadliest events since 2000"
- **Verification Required:**
  - Does Matthews 2024 state this number?
  - Quote the passage
  - Is this global or specific regions?
  - What time period exactly? (claimed: "since 2000")
- **Status:** ❓ PENDING

**Claim C4: Future projections at 2°C warming**
- **Stated Claims:**
  - "Tripling of uncompensable land area for young adults (2.2% → 6.6%)"
  - "Near-doubling for older adults (21% → 35-40%)"
- **Verification Required:**
  - Does the paper provide these specific projections?
  - Quote the table/figure
  - What climate model/scenario? (RCP, SSP?)
  - What baseline period for current %?
- **Status:** ❓ PENDING

---

## Parameters Requiring Validation (If Claims Verified)

### Tipping Point Commitment Logic

**Current Simulation Approach:**
- Instant commitment upon threshold crossing
- No overshoot tolerance

**Proposed Updates (if Ritchie 2025 verified):**
```typescript
// Track cumulative overshoot duration
if (globalTemp > element.threshold) {
  element.monthsAboveThreshold += 1;
  element.peakOvershoot = Math.max(element.peakOvershoot, globalTemp);

  // Check commitment criteria (Ritchie et al. 2025)
  if (element.monthsAboveThreshold > element.commitmentTimescale_months ||
      element.peakOvershoot > element.catastrophicThreshold_C) {
    element.committed = true;
  }
}
```

**Parameters to Add:**
- `commitmentTimescale_months`: 120 (fast-tipping), 600 (slow-tipping)
- `catastrophicThreshold_C`: 2.5°C (no overshoot tolerance above this)

**Files to Modify:**
- `src/simulation/engine/phases/TippingPointPhase.ts` (or equivalent)
- `src/types/game.ts` (add new fields to state)

### Heat Mortality Age-Specific Thresholds

**Current Simulation Approach:**
- Vecellio et al. 2022: 30.5°C SEVERE, 31.2°C EXTREME (young adults, laboratory)

**Proposed Updates (if Matthews 2024 verified):**
```typescript
interface HeatMortalityThresholds {
  uncompensable_wetbulb_C: {
    young_adults: 32,
    middle_age: 28,
    older_adults: 19
  };
  unsurvivable_wetbulb_C: {
    young_adults: 34,
    middle_age: 30,
    older_adults: 20
  };
}

// Age-specific mortality calculation
function calculateHeatMortality(
  wetbulb_C: number,
  populationByAge: AgeDistribution
): number {
  // Apply age-specific thresholds and mortality rates
}
```

**Parameters to Add:**
- Age distribution tracking in population system
- Age-specific mortality curves

**Files to Modify:**
- `src/simulation/wetBulbEvents.ts`
- `src/types/wetBulbTemperature.ts`
- `src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` (or equivalent)

### Cascade Timescales

**Current Simulation:**
- "Centennial to millennial timescales" (Wunderling et al. 2024, per docs/wiki/README.md:5354)

**Proposed Refinement (if Armstrong McKay 2024 verified):**
- Element-specific transition times: 30-80yr (Amazon), 200-2000yr (ice sheets)
- Cascade delays: 100-500yr (Greenland→AMOC), 50-200yr (AMOC→Amazon)

**No implementation changes required** - current understanding already captured.

---

## Verification Methodology

### Layer 1: Citation Existence (Quick Check)

For each citation:
1. Search DOI in CrossRef or journal website
2. Verify author names, title, journal, year
3. Confirm open access status (if claimed)
4. Download PDF if accessible

### Layer 2: Claim Verification (Deep Check - CRITICAL)

For each claim:
1. **Locate passage:** Find exact quote in paper supporting claim
2. **Context check:** Does surrounding text support interpretation?
3. **Quantitative match:** Do numbers in claim match paper exactly?
4. **Derivation check:** If claim derived, is derivation valid?
5. **Confidence check:** Does paper express uncertainty? How much?

**Grading:**
- ✅ **VERIFIED:** Claim directly supported by quoted passage
- ⚠️ **PARTIALLY VERIFIED:** Claim supported but with caveats (e.g., different units, confidence intervals wide)
- ❌ **UNVERIFIED:** Claim NOT supported by paper (misinterpretation, extrapolation beyond scope, phantom claim)

---

## Expected Outcomes

### If All Claims Verified (✅)

- **Action:** Proceed to implementation phase
- **Next Steps:**
  1. Update `TippingPointPhase.ts` with overshoot tolerance logic
  2. Add heat mortality age-specific thresholds
  3. Run Monte Carlo validation (N≥10)
  4. Architecture review (performance check for new tracking)
  5. Update wiki with implementation details

### If Some Claims Unverified (⚠️)

- **Action:** Revise parameters to match verified claims only
- **Next Steps:**
  1. Document discrepancies in research file
  2. Implement only verified parameters
  3. Flag unverified claims for future research
  4. Monte Carlo validation with revised parameters

### If Major Claims Unverified (❌)

- **Action:** Do NOT implement, return to research phase
- **Next Steps:**
  1. Identify alternative sources for parameters
  2. Document why claims were not supported
  3. Create new research task for parameter extraction
  4. Do NOT merge into main codebase

---

## Validation Checklist

**Layer 1 - Citation Existence:**
- [ ] Ritchie et al. 2025 - DOI resolves, paper exists
- [ ] Armstrong McKay 2024 - DOI resolves, paper exists
- [ ] Matthews et al. 2024 - DOI resolves, paper exists
- [ ] Global Tipping Points Report 2023 - URL accessible, report exists
- [ ] Armstrong McKay et al. 2022 - Confirm foundational paper

**Layer 2A - Overshoot Tolerance Claims:**
- [ ] 30-year overshoot window (quote passage)
- [ ] 2.5°C peak warming limit (quote passage)
- [ ] Element-specific commitment times (quote table/section)

**Layer 2B - Cascade Timescale Claims:**
- [ ] Threshold temperature ranges (quote table)
- [ ] Transition timescales (quote passage)
- [ ] Cascade interaction delays (quote or identify source if Wunderling 2024)

**Layer 2C - Heat Mortality Claims:**
- [ ] Uncompensable thresholds by age (quote table/figure)
- [ ] Unsurvivable thresholds (quote definition)
- [ ] 260,000+ historical deaths (quote passage)
- [ ] 2°C warming projections (quote table/figure)

**Final Assessment:**
- [ ] Overall verification grade: A (all verified) / B (most verified) / C (some verified) / F (major unverified)
- [ ] Ready for implementation: YES / NO / PARTIAL
- [ ] Orchestrator decision: PROCEED / REVISE / RETURN_TO_RESEARCH

---

## Notes for Verifier

**Common Issues to Watch For:**

1. **Units mismatch:** Paper uses °C vs °F, months vs years - convert carefully
2. **Scope creep:** Claim extrapolates beyond paper's scope (e.g., all elements vs specific ones)
3. **Confidence intervals:** Paper gives range, claim uses best estimate - is this justified?
4. **Temporal misalignment:** Paper studies 2000-2020, claim applies to 2025-2100
5. **Model vs empirical:** Claim treats model output as empirical fact

**If you find discrepancies:**
- Document in verification report (reviews/verification_3a6a200_YYYYMMDD.md)
- Flag severity: CRITICAL (parameter wrong by >50%), HIGH (wrong by 20-50%), MEDIUM (minor mismatch), LOW (interpretation difference)
- Recommend action: BLOCK_IMPLEMENTATION (critical), REVISE_PARAMETERS (high/medium), PROCEED_WITH_NOTE (low)

---

## References

**Primary Research File:**
- research/climate_tipping_cascades_2024_2025_update.md (515 lines)

**Documentation:**
- docs/wiki/README.md (updated sections 160-173, 1344-1380, 5357-5390)

**Code Locations (if implementation proceeds):**
- src/simulation/engine/phases/TippingPointPhase.ts
- src/simulation/wetBulbEvents.ts
- src/types/game.ts
- src/types/wetBulbTemperature.ts

---

**Verification Assignment:** To be determined by orchestrator
**Target Completion:** Within 7 days of orchestrator assignment
**Blocker Status:** Implementation BLOCKED until verification complete
