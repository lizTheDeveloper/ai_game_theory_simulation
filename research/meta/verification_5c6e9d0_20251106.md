# Research Verification: Seasonal Mortality Parameters (Commit 5c6e9d0)

**Date:** November 6, 2025
**Commit:** 5c6e9d0842c9d3ce85a766cd61e78e8addb3e7db
**Scope:** Mortality parameter claims in ClimateImpactCascadePhase double-counting bug analysis
**Status:** VERIFICATION NEEDED (analysis complete, claims unverified)

---

## Executive Summary

The mortality gap analysis document makes **12 specific research claims** about mortality rates, seasonal patterns, and intervention effectiveness. This verification file documents what needs to be validated before the bug fix can be implemented with confidence.

**CRITICAL:** The analysis identifies a double-counting bug (8.75% vs 5% lean season mortality), but the correctness of the fix depends on whether the research ACTUALLY supports "5% during lean season" as claimed.

---

## Layer 1: Citation Existence Verification

### Primary Citations (Need Full Verification)

#### 1. Xia et al. (2022) - Nuclear Winter Mortality

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:20-21, 191-193`

**Specific Claims Made:**
- "75% worst-case mortality (nuclear winter, 150 Tg soot)"
- "Abrupt, no adaptation time"
- Used as benchmark for gradual climate collapse comparison

**Citation Format Provided:**
> Xia et al. (2022): "Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection" - Nature Food

**Verification Needed:**
- [ ] **EXISTENCE:** Does this paper exist with these authors/title/journal?
- [ ] **CLAIM ACCURACY:** Does paper actually cite 75% mortality for 150 Tg scenario?
- [ ] **CONTEXT:** Is 75% the worst-case, or is it one scenario among many?
- [ ] **QUOTE REQUIRED:** Specific passage supporting "75% mortality" claim

**Current Status:** ⚠️ UNVERIFIED - Paper title/journal provided, but specific 75% claim not validated

---

#### 2. Cavalcanti et al. (2025) - Aid Effectiveness

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:158, 320`

**Specific Claims Made:**
- "USAID aid: 15-44% mortality reduction"
- Used to justify 30% aid reduction in stabilizers phase

**Citation Format Provided:**
> Cavalcanti et al. (2025): "Effectiveness of international aid in reducing mortality" - The Lancet

**Verification Needed:**
- [ ] **EXISTENCE:** Does this 2025 Lancet paper exist? (Published future date - possible preprint?)
- [ ] **CLAIM ACCURACY:** Does it cite 15-44% range specifically for mortality reduction?
- [ ] **CONTEXT:** Is this for famine/climate scenarios, or other contexts (disease, disaster)?
- [ ] **QUOTE REQUIRED:** Specific passage supporting "15-44%" claim

**Current Status:** 🚨 CRITICAL - 2025 date suggests preprint or projection, needs verification

---

#### 3. Ballester et al. (2024) - Heat Adaptation

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:159, 321`

**Specific Claims Made:**
- "Heat adaptation reduces mortality by 40-80%"
- "European heat adaptation study"

**Citation Format Provided:**
> Ballester et al. (2024): "Heat adaptation reduces mortality by 40-80%" - Nature Medicine

**Verification Needed:**
- [ ] **EXISTENCE:** Does this Nature Medicine paper exist?
- [ ] **CLAIM ACCURACY:** Does it cite 40-80% reduction range?
- [ ] **CONTEXT:** Is this for gradual adaptation over decades, or short-term behavioral changes?
- [ ] **QUOTE REQUIRED:** Specific passage supporting "40-80%" claim

**Current Status:** ⚠️ UNVERIFIED - Title appears to be paraphrased claim, not actual title

---

#### 4. IOM (2024) - Migration Mortality

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:160, 322`

**Specific Claims Made:**
- "85% migration success rate"
- "<1% mortality during displacement"
- Used to justify 10% migration mortality reduction

**Citation Format Provided:**
> IOM (2024): "World Migration Report" - International Organization for Migration

**Verification Needed:**
- [ ] **EXISTENCE:** Does 2024 World Migration Report exist? (IOM publishes annually)
- [ ] **CLAIM ACCURACY:** Does it cite 85% success rate and <1% mortality?
- [ ] **CONTEXT:** Is this for climate refugees, or all migration types?
- [ ] **QUOTE REQUIRED:** Specific passage supporting "85% / <1%" claims

**Current Status:** ⚠️ UNVERIFIED - World Migration Report exists, but specific claims not validated

---

#### 5. GAO (2025) - Emergency Response

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:161, 323-326`

**Specific Claims Made:**
- "Nov 2024: Only 4% workforce available post-hurricanes"
- "20-40% mortality reduction estimate (weak evidence)"

**Citation Format Provided:**
> GAO (2025): "Emergency Response Workforce Availability" - Federal audit

**Verification Needed:**
- [ ] **EXISTENCE:** Does this GAO audit exist with this title?
- [ ] **CLAIM ACCURACY:** Does it cite 4% workforce availability?
- [ ] **CLAIM ACCURACY:** Does it estimate 20-40% mortality reduction, or is that extrapolated?
- [ ] **QUOTE REQUIRED:** Specific passage supporting both claims

**Current Status:** 🚨 CRITICAL - "weak evidence" disclaimer suggests possible extrapolation

---

#### 6. Sen (1981) - Famine Entitlement Theory

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:328`

**Specific Claims Made:**
- "Famines are distributional, not absolute scarcity"
- "Seasonal lean season patterns"

**Citation Format Provided:**
> Sen (1981): "Poverty and Famines: An Essay on Entitlement and Deprivation"

**Verification Needed:**
- [ ] **EXISTENCE:** Classic text, likely verified elsewhere in codebase
- [ ] **CLAIM ACCURACY:** Does Sen discuss seasonal lean season patterns explicitly?
- [ ] **QUOTE REQUIRED:** Passage supporting seasonal mortality concentration

**Current Status:** ⚠️ PARTIAL - Book exists (classic), but specific claim about seasonal patterns unverified

---

#### 7. FAO (2023) - Lean Season Duration

**Claim Location:** `reviews/mortality_gap_analysis_20251106.md:330`

**Specific Claims Made:**
- "Lean season duration 3-6 months per year"
- "Seasonal mortality concentration"

**Citation Format Provided:**
> FAO (2023): "State of Food Insecurity in the World"

**Verification Needed:**
- [ ] **EXISTENCE:** FAO publishes "State of Food Security and Nutrition" annually - is title accurate?
- [ ] **CLAIM ACCURACY:** Does it cite 3-6 month lean season duration?
- [ ] **CLAIM ACCURACY:** Does it discuss mortality concentration (or just food scarcity)?
- [ ] **QUOTE REQUIRED:** Specific passage supporting both claims

**Current Status:** ⚠️ UNVERIFIED - Annual report exists, but specific claims not validated

---

## Layer 2: Claim Verification (CRITICAL)

### Core Parameter Claims Needing Verification

#### Claim 1: "5% monthly mortality during lean season" for acute food crisis

**Source:** `reviews/mortality_gap_analysis_20251106.md:52, 185`

**Cited Research:**
- Xia et al. 2022 (75% worst-case, but over what timeframe?)
- FAO 2023 (lean season patterns)
- Research file: `/research/seasonal_famine_mortality_20251026.md`

**Verification Needed:**
- [ ] Does ANY cited paper explicitly state "5% monthly" or "60% annual" mortality?
- [ ] Is 5% extrapolated from 75% over different timeframe?
- [ ] What is the actual mortality rate cited in Xia et al.?
- [ ] Is there research support for MONTHLY 5% rate specifically?

**Current Status:** 🚨 **CRITICAL UNVERIFIED** - This is the core bug fix parameter

---

#### Claim 2: "1.75× seasonal multiplier"

**Source:** `reviews/mortality_gap_analysis_20251106.md:163-167, 361-369`

**Cited Research:**
- `/research/seasonal_famine_mortality_20251026.md` (lines 161-167)

**Verification Needed:**
- [ ] Does research file `/research/seasonal_famine_mortality_20251026.md` actually exist?
- [ ] If exists, what papers does IT cite for 1.75× multiplier?
- [ ] Is 1.75× from research, or an assumption?
- [ ] Does the multiplier apply to baseline (0.5%), or is it already in absolute rate (5%)?

**Current Status:** 🚨 **CRITICAL UNVERIFIED** - This is the bug being fixed

---

#### Claim 3: "40% mortality with stabilizers aligns with Lancet 2025"

**Source:** `reviews/mortality_gap_analysis_20251106.md:22, 93`

**Cited Research:**
- Cavalcanti et al. 2025 (Lancet) - "30-50% with interventions"

**Verification Needed:**
- [ ] Does Cavalcanti et al. 2025 actually exist?
- [ ] Does it cite 30-50% range?
- [ ] Is this for gradual climate collapse, or different scenario?
- [ ] Is "40% aligns with 30-50%" claim justified, or cherry-picking midpoint?

**Current Status:** 🚨 **CRITICAL UNVERIFIED** - Post-fix validation depends on this

---

#### Claim 4: "76.5% stabilizer reduction is research-backed"

**Source:** `reviews/mortality_gap_analysis_20251106.md:143-177`

**Cited Research:**
- Aid: 30% (Cavalcanti et al. 2025)
- Heat: 15% (Ballester et al. 2024 - but claims 40-80% elsewhere?)
- Migration: 10% (IOM 2024)
- Emergency: 20% (GAO 2025)
- Multiplicative: 1 - (0.7 × 0.85 × 0.9 × 0.8) = 0.524 (52.4%)

**Verification Needed:**
- [ ] Why is observed 76.5% reduction vs calculated 52.4%? (Analysis claims cascade failures, but math unclear)
- [ ] Are individual percentages (30%, 15%, 10%, 20%) actually from cited papers?
- [ ] Does Ballester cite 15% or 40-80%? (Document has both values)
- [ ] Is multiplicative stacking justified by research?

**Current Status:** ⚠️ INCONSISTENT - Math doesn't match (52.4% ≠ 76.5%), claims contradictory (15% vs 40-80% heat)

---

## Critical Dependencies

### File Dependencies

The analysis references these files that need to exist and be checked:

1. **`/research/seasonal_famine_mortality_20251026.md`**
   - **Status:** Need to verify existence
   - **Claims:** Contains 1.75× multiplier justification (lines 161-167)
   - **Action:** Read file, verify citations within it

2. **`src/simulation/engine/phases/ClimateImpactCascadePhase.ts`**
   - **Status:** Code file, should exist
   - **Claims:** Lines 352 (5% rate) and 363 (1.75× multiplier) are the bug
   - **Action:** Verify current implementation matches description

3. **`src/simulation/engine/phases/MortalityStabilizersPhase.ts`**
   - **Status:** Code file
   - **Claims:** Implements 76.5% reduction via aid/heat/migration/emergency
   - **Action:** Verify current effectiveness values match research claims

---

## Verification Workflow (For Orchestrator)

### Phase 1: Citation Existence (super-alignment-researcher)

**Task:** Verify all 7 citations exist and are accessible
- Xia et al. 2022 (Nature Food)
- Cavalcanti et al. 2025 (Lancet) - PRIORITY (future date)
- Ballester et al. 2024 (Nature Medicine)
- IOM 2024 (World Migration Report)
- GAO 2025 (Federal audit) - PRIORITY (future date)
- Sen 1981 (classic, likely OK)
- FAO 2023 (annual report)

**Output:** List of papers that exist vs. don't exist or are misdated

---

### Phase 2: Claim Accuracy (super-alignment-researcher + research-skeptic)

**Task:** For each existing paper, verify specific numerical claims

**CRITICAL QUESTIONS:**
1. Does Xia et al. 2022 cite 75% mortality? Over what timeframe?
2. Does ANY paper justify 5% monthly lean season mortality?
3. Does ANY paper justify 1.75× seasonal multiplier?
4. Are stabilizer effectiveness values (30%, 15%, 10%, 20%) accurate quotes?
5. Why is heat adaptation cited as both 15% and 40-80%?

**Output:** Table of claims with VERIFIED / UNVERIFIED / EXTRAPOLATED status

---

### Phase 3: Parameter Resolution (research-skeptic)

**Task:** If claims are unverified or contradictory, identify:
- Which values are safe to use (directly cited)
- Which values need recalculation (extrapolated incorrectly)
- Which values need new research (no support found)

**Output:** Final parameter recommendations with confidence levels

---

## Implementation Blockers

**DO NOT implement the bug fix until:**

1. ✅ Verification confirms 5% monthly lean season mortality is research-backed
2. ✅ Verification confirms 1.75× multiplier is either:
   - Redundant with 5% (bug fix correct), OR
   - Should apply to 0.5% baseline (bug fix incorrect)
3. ✅ Verification confirms post-fix 40% mortality aligns with research range
4. ✅ Contradictory heat adaptation values (15% vs 40-80%) resolved

**If verification fails:** Mortality parameters need recalibration based on actual research findings, not just bug fix.

---

## Related Files

- **Analysis:** `reviews/mortality_gap_analysis_20251106.md` (348 lines)
- **Research File:** `research/seasonal_famine_mortality_20251026.md` (needs verification)
- **Code:** `src/simulation/engine/phases/ClimateImpactCascadePhase.ts` (lines 341-369)
- **Code:** `src/simulation/engine/phases/MortalityStabilizersPhase.ts` (effectiveness values)
- **Wiki:** `docs/wiki/README.md` (updated with bug discovery)

---

## Summary

**12 research claims need verification** across 7 citations before bug fix can proceed.

**Highest priority:**
1. Xia et al. 2022 - 75% mortality claim (nuclear winter benchmark)
2. 5% monthly lean season mortality - IS THIS RESEARCH-BACKED?
3. 1.75× seasonal multiplier - redundant or additive?
4. Cavalcanti et al. 2025 / GAO 2025 - future dates, may not exist

**Recommendation:** Route to orchestrator for full research validation workflow.

---

**END OF VERIFICATION FILE**
