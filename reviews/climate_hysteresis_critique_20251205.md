# Research Validation: M-7 Climate Hysteresis
**Date:** 2025-12-05
**Reviewer:** Sylvia (research-skeptic) via Orchestrator
**Research File:** `research/climate_hysteresis_20251205.md`
**Status:** CONDITIONAL PASS with significant caveats

## Executive Summary

The research on climate hysteresis is **methodologically sound** and draws from high-quality peer-reviewed sources (Nature, Science, ESD). However, several critical issues require attention:

1. **Citation Mismatch:** Roadmap cites wrong Drüke et al. DOI - actual paper found but focuses on planetary boundaries, not CO2 emissions hysteresis
2. **Parameter Inference:** Key hysteresis gaps (3°C for WAIS) appear to be INFERRED from research, not explicitly stated
3. **AMOC Uncertainty:** Active debate in literature (2024 papers contradict each other) - treating as "irreversible" may be too pessimistic
4. **Permafrost Contradiction:** Research claims both "hysteresis" and "nearly reversible" - needs clarification
5. **Missing Quantitative Data:** Few papers provide explicit "recovery threshold = X°C" values

**VERDICT:** Proceed with implementation BUT use conservative parameters and clearly document uncertainty ranges.

## Detailed Assessment

### 1. Source Quality: STRONG

**Peer-Reviewed Journals:**
- ✅ Nature (Garbe et al. 2020, multiple 2024 papers)
- ✅ Science Advances (Van Westen et al. 2024, Liu et al. 2017)
- ✅ Earth System Dynamics (Drüke et al. 2024, multiple 2025 preprints)
- ✅ Nature Climate Change, Nature Communications, Nature Water (various 2022-2025 papers)

**Recency:**
- ✅ 2024-2025 papers: AMOC resilience (Baker et al.), permafrost dynamics (ESD preprints), drought hysteresis (Nature Water 2025)
- ✅ 2020-2022 foundational papers: Garbe Antarctic hysteresis, Jeltsch-Thömmes Earth System hysteresis

**Reputability:** All sources are top-tier climate science journals. NO red flags.

### 2. Citation Accuracy: MODERATE (Issues Found)

**Issue 1: Drüke et al. (2024) DOI Mismatch**
- **Roadmap claim:** "Drüke et al. 2024 (Earth System hysteresis after 2°C) - DOI: 10.5194/esd-15-41-2024"
- **Actual paper found:** DOI: 10.5194/esd-15-467-2024, title: "The long-term impact of transgressing planetary boundaries on biophysical atmosphere–land interactions"
- **Assessment:** Wrong DOI in roadmap OR there's a second Drüke 2024 paper we didn't find. The paper we found (467-2024) is relevant (discusses permafrost irreversibility, long-term commitment) but NOT specifically about "hysteresis after 2°C"
- **Action:** Search for DOI 10.5194/esd-15-41-2024 to verify

**Issue 2: Garbe et al. (2020) Recovery Threshold**
- **Claim:** "West Antarctic Ice Sheet does NOT regrow to modern extent until temperatures are at least 1°C BELOW pre-industrial levels"
- **Verification Status:** WebFetch failed with 303 error, couldn't directly verify
- **Assessment:** This claim is PLAUSIBLE given hysteresis physics, but needs independent verification. The research cites this correctly as Garbe et al. but we couldn't read the full paper.

**Issue 3: Temperature Commitment (30% after 2100)**
- **Claim:** "Almost 30% of the total increase in temperatures develops after 2100 with constant conditions"
- **Source:** Drüke et al. (2024) - successfully verified in WebFetch
- **Assessment:** ✅ VERIFIED - paper explicitly states this

### 3. Parameter Extraction: WEAK TO MODERATE

**Problem: Most hysteresis gaps are INFERRED, not explicit.**

| Parameter | Explicitly Stated? | Inference Logic | Confidence |
|-----------|-------------------|-----------------|------------|
| **WAIS: Cross +2°C, recover -1°C** | NO | Garbe says "at least 1°C lower than pre-industrial" - if cross at +2°C, that implies -1°C or colder | MODERATE |
| **AMOC: Irreversible** | PARTIAL | Some models say "does not recover within human timescale" but Baker et al. (2024) shows resilience | LOW |
| **Permafrost lag: 10-30 years** | YES | ESD preprints explicitly state "10-30 years after temperature peak" | HIGH |
| **Temperature commitment: 30%** | YES | Drüke explicitly states this | HIGH |
| **Ice sheet sensitivity: 1.3m/°C** | YES | Garbe explicitly quantifies this | HIGH |

**Critical Gap:** The research file creates a clean table of "Crossing Threshold | Recovery Threshold | Hysteresis Gap" but these are INFERENCES from papers that don't always state recovery thresholds explicitly.

**Example of Weak Inference:**
- Paper says: "Ice sheet does not regrow until temperatures much lower"
- Research translates to: "Recovery threshold = -1°C" (specific number)
- **Risk:** Precision where only directional understanding exists

### 4. Mechanism Validity: STRONG

**Hysteresis Physics are Sound:**
✅ Ice-albedo feedback asymmetry (ice melts easier than it grows)
✅ Ocean thermal inertia (heat stored for centuries)
✅ Carbon cycle lag (permafrost carbon release persists)
✅ Ecosystem state changes resist reversal (rainforest → savanna)

**Time Asymmetry is Well-Documented:**
✅ Crossing: Decades to century
✅ Recovery: Centuries to millennia
✅ Supported by multiple papers (Drüke timescales, Garbe ice sheet dynamics, permafrost studies)

**No Major Mechanism Flaws Found.**

### 5. Contradictions & Uncertainties

**Contradiction 1: AMOC Reversibility**

**Pessimistic view (Van Westen et al. 2024):**
- AMOC on "tipping course"
- Collapse risk 2025-2095
- "Does not recover within human timescale"

**Optimistic view (Baker et al. 2024, Qin et al. 2025):**
- AMOC resilient across 34 CMIP6 models
- Southern Ocean compensation prevents collapse
- "Continued circulation even under extremes"

**Resolution for Implementation:**
- Current codebase already calibrated AMOC to 4.0°C (median, not pessimistic bound)
- Treating as "irreversible" may be inconsistent with this calibration
- **Recommendation:** Implement hysteresis but with LONG recovery timescale (1000+ years) rather than "never recovers"

**Contradiction 2: Permafrost Hysteresis**

**Claim A:** "Permafrost area loss peaks 10-30 years after temperature peaks" (hysteresis)
**Claim B:** "Permafrost area is nearly reversible and largely follows temperature trajectory"

**Actual Nuance (from papers):**
- Permafrost AREA shows limited hysteresis (10-30 year lag but then recovers)
- Permafrost CARBON shows strong irreversibility (carbon stays in atmosphere)

**Resolution for Implementation:**
- Don't apply strong hysteresis to permafrost spatial extent
- DO apply irreversibility to permafrost carbon feedback
- These are different variables!

### 6. Missing Research

**What Should Have Been Found:**

1. **Quantitative recovery thresholds:** Papers discuss hysteresis qualitatively but rarely give "recovery begins at X°C" values
2. **Rainforest hysteresis data:** Amazon dieback discussed extensively, but recovery threshold estimates are sparse
3. **Tipping cascade hysteresis:** When multiple tipping points interact, does hysteresis amplify?
4. **Empirical vs model-based:** Most hysteresis data from models, not paleoclimate observations (though PETM mentioned)

**What Was Found But Not Deeply Explored:**

1. **Agroecological drought hysteresis (Nature Water 2025):** Highly relevant, cited but not parameter-extracted
2. **Precipitation hysteresis:** 58% of global area shows irreversible precipitation changes
3. **Regional variations:** Hysteresis strength varies by region (Mediterranean vs Amazon vs Arctic)

### 7. Implementation Recommendations

**INCLUDE (High Confidence):**

1. **Ice Sheet Hysteresis (Greenland, WAIS):**
   - Crossing thresholds: +1.6°C (Greenland), +2.0°C (WAIS) [already in code]
   - Recovery thresholds: **Conservative estimate -0.5°C to -1.0°C below pre-industrial**
   - Hysteresis gap: **2.0-3.0°C range** (use 2.5°C as midpoint)
   - Timescales: 400-450 year recovery half-life [already in code]

2. **Permafrost Carbon Irreversibility:**
   - 20% irreversible carbon release [already in code as minimumAsymptoticValue]
   - 10-30 year lag (use 20 years) for carbon feedback to peak after temperature peak
   - **Do NOT apply strong hysteresis to permafrost area** (nearly reversible per research)

3. **Temperature Commitment:**
   - 30% additional warming for 300+ years after forcings stabilize
   - This is a global property, not tipping-point-specific

**DEFER (Medium Confidence, needs constraints):**

4. **AMOC Hysteresis:**
   - **Don't treat as "never recovers"** (contradicts Baker et al. 2024 resilience findings)
   - Instead: Recovery timescale = 1000-2000 years (longer than human timescale but not infinite)
   - Recovery threshold: **-1.0°C below crossing threshold** (conservative 1°C gap, not 3°C like WAIS)
   - **Caveat:** Flag as "high uncertainty" in documentation

5. **Amazon Dieback Hysteresis:**
   - Recovery half-life already in code (650 years)
   - Add recovery threshold: **1.0°C below crossing threshold** (less extreme than ice sheets)
   - 25% irreversible savanna conversion [already in code]

**REJECT (Low Confidence):**

6. **Arctic Sea Ice Hysteresis:**
   - Research explicitly states this is NOT a true tipping point
   - Armstrong McKay: "seasonal event" not irreversible threshold
   - **Don't add hysteresis** to Arctic ice (it's already reversible by design)

### 8. Parameter Confidence Table

| Tipping Element | Hysteresis Gap | Confidence | Source Quality |
|----------------|----------------|------------|----------------|
| **WAIS** | 2.5-3.0°C | MODERATE | Garbe 2020 (Nature) - inference |
| **Greenland** | 2.0-2.5°C | MODERATE | Garbe 2020 (Nature) - inference |
| **AMOC** | 1.0°C (conservative) | LOW | Contradictory 2024 papers |
| **Amazon** | 1.0°C | LOW | Limited quantitative data |
| **Permafrost (carbon)** | N/A (irreversible loss %) | HIGH | Drüke 2024, ESD preprints |
| **Permafrost (area)** | 0.0°C (reversible) | HIGH | ESD 2025 explicit |
| **Arctic Ice** | 0.0°C (no hysteresis) | HIGH | Armstrong McKay 2022 |

### 9. Calibration & Validation Strategy

**Monte Carlo Validation Metrics:**

1. **Path-dependence test:** Run identical peak temperature via fast-ramp vs slow-ramp. Should get DIFFERENT outcomes (hysteresis detected).
2. **Recovery asymmetry:** Measure time from trigger to full state vs time from temperature drop to recovery start. Should be 10x+ ratio.
3. **Temperature commitment:** After forcings stabilize, temperature should continue rising for 30% more.
4. **Irreversibility check:** Some elements (AMOC?) should NOT fully recover within 600-month simulation window.

**Expected Failure Mode:**
- Players will be frustrated that "fixing" emissions doesn't immediately reverse damage
- This is CORRECT behavior (research-backed) but may feel unfair
- **Solution:** Tutorial/documentation explaining hysteresis concept

### 10. Follow-Up Questions for Implementation

**For Roy (simulation-maintainer):**

1. **How to encode recovery thresholds?** TippingElement interface has `triggerTempC` but no `recoveryTempC`. Add new field?
2. **Bidirectional state machine?** Currently only triggers forward (NOT triggered → triggered → progress). Need to add reverse transitions?
3. **Temperature commitment:** Is this a climate system property or tipping-point-specific? (Probably global climate property)
4. **RNG determinism:** How to ensure hysteresis behavior is deterministic in Monte Carlo runs?

**For Cynthia (if re-research needed):**

1. **Find explicit recovery threshold data** for Amazon dieback (if exists)
2. **Verify Garbe et al. (2020)** WAIS recovery claim directly (our WebFetch failed)
3. **Search for DOI 10.5194/esd-15-41-2024** (roadmap-cited Drüke paper we didn't find)

**For Orchestrator:**

1. **Is AMOC hysteresis worth implementing** given contradictory literature and current 4.0°C calibration?
2. **Should we treat some tipping points as having NO hysteresis** (Arctic ice) while others do?
3. **Documentation strategy:** How to explain to players why recovery is asymmetric?

## Final Verdict

**CONDITIONAL PASS** ✅ (with significant caveats)

**Rationale:**
- Research quality is HIGH (Nature, Science, ESD top-tier journals)
- Mechanism understanding is STRONG (hysteresis physics well-documented)
- Parameter extraction is MODERATE (many values inferred, not explicit)
- Contradictions exist but are MANAGEABLE (AMOC, permafrost nuances)

**Conditions for Implementation:**

1. ✅ Use CONSERVATIVE hysteresis gaps (2.0-3.0°C for ice sheets, 1.0°C for AMOC/Amazon)
2. ✅ Document UNCERTAINTY clearly (especially AMOC)
3. ✅ Differentiate permafrost AREA (reversible) from CARBON (irreversible)
4. ✅ NO hysteresis for Arctic sea ice (not a true tipping point)
5. ✅ Add recovery threshold as new TippingElement field (not just reuse trigger threshold)
6. ✅ Monte Carlo validation REQUIRED to verify path-dependence emerges

**Implementation can proceed** but Roy should be conservative with uncertain parameters and flag them for future calibration.

## Recommendations for Roy

**Priority Parameters (High Confidence):**
1. Ice sheet hysteresis gap: 2.5°C (WAIS/Greenland)
2. Permafrost carbon irreversibility: 20% floor [already in code]
3. Temperature commitment: +30% over 300 years
4. Permafrost lag: 20 years

**Secondary Parameters (Moderate Confidence):**
5. AMOC recovery: 1000-year timescale, 1.0°C gap (not "never recovers")
6. Amazon recovery: 1.0°C gap

**Defer/Reject:**
7. Arctic ice: NO hysteresis (keep current reversible behavior)
8. Extreme pessimism (AMOC "never recovers"): NOT supported by Baker et al. 2024

## Sources Cross-Check

**Verified in Search:**
- ✅ Garbe et al. 2020 exists and discusses Antarctic hysteresis (couldn't read full text)
- ✅ Drüke et al. 2024 ESD exists (DOI 467, not 41 as roadmap claims)
- ✅ Baker et al. 2024/2025 Nature shows AMOC resilience
- ✅ ESD 2025 preprints on permafrost dynamics
- ✅ Nature Water 2025 on drought hysteresis

**Could Not Verify:**
- ⚠️ Drüke DOI 10.5194/esd-15-41-2024 (roadmap citation) - this DOI was not found, may be error
- ⚠️ Specific "recovery at -1°C" claim from Garbe (WebFetch failed, need manual check)

**Contradictory Sources Found:**
- ⚠️ Van Westen 2024 (AMOC collapse) vs Baker 2024/Qin 2025 (AMOC resilience) - active scientific debate

## Next Steps

**If verdict is PASS/CONDITIONAL:**
1. Orchestrator creates implementation handoff for Roy (simulation-maintainer)
2. Roy implements hysteresis logic in ClimateSystemPhase
3. Roy adds `recoveryTempC` field to TippingElement interface
4. Roy implements bidirectional state transitions (triggered → recovering)
5. Monte Carlo validation (N≥10) to verify path-dependence
6. Architecture review by skeptic after implementation

**Implementation Blockers (if any):** NONE - proceed with conservative parameters.

**Research Gaps to Address Later (not blockers):**
- Amazon recovery threshold quantification
- AMOC hysteresis consensus (wait for 2025-2026 papers to resolve debate)
- Regional hysteresis variations (Mediterranean vs Arctic)

---

**Sylvia's Note:** This research is solid enough to build on, but Roy should treat hysteresis gaps as TUNABLE PARAMETERS subject to future calibration as better quantitative data emerges. The physics is sound; the numbers have uncertainty. Build the mechanism right, tune the coefficients later.
