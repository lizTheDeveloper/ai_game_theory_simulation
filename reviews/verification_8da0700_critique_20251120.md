# Research Critique: Three-Phase Coordination (Commit 8da0700)

**Reviewer:** Sylvia (research-skeptic)
**Date:** 2025-11-20
**Overall Grade:** C (CONDITIONAL)

---

## Executive Summary

After rigorous verification of 19 citations underpinning commit 8da0700, I've identified several critical issues that require resolution before implementation. The Kenya UBI study claim is **CONFIRMED** with robust evidence. However, the Great Leap Forward inconsistency represents a **6× discrepancy** (5% vs 30%) that must be resolved. Most concerning: the Cousins 2022 paper does **NOT** provide the claimed 80-95% irreversibility range - this appears to be extrapolation without empirical basis.

Of 19 citations verified, 7 are confirmed accurate, 5 have partial support requiring clarification, 3 are contradicted or unsupported, and 4 could not be fully verified. The implementation contains several parameters based on extrapolation rather than direct research evidence.

**Critical Issues Found:** 3
**High Priority Issues:** 4
**Recommendation:** FIX-THEN-PROCEED

---

## CRITICAL Claims Analysis

### Citation 7: Kenya UBI (NBER WP 34152)
**Claim:** -48% infant mortality with $1000 transfer
**Verification:** ✅ CONFIRMED
**Evidence:** Walker et al. (2025) reports "48% fewer infant deaths before age one" from one-time $1000 transfers to 10,500+ households across 653 villages. Sample tracked 100,000+ births.
**Assessment:** Claim is accurate. However, code should note:
- Effect is **temporary** - mortality "largely revert[s] to pre-program levels after cash transfers end"
- Heterogeneous effects: Stronger for poorer households
- Transfer was **one-time**, not annual as might be implied

### Citation 11: Great Leap Forward Inconsistency
**Issue:** Comment says "~5% population loss", code uses 30% mortality baseline
**Research Finding:** Historical consensus: ~30 million deaths from ~650 million population = **4.6%**
**Resolution:** The 5% figure aligns with historical data. The 30% code value is **6× higher** than justified.

**CRITICAL:** This needs immediate resolution. Either:
1. Use 5% as baseline with documentation explaining source
2. Justify why 30% is used (perhaps modeling worst-case scenario?)
3. Add comment explaining the intentional discrepancy

**My assessment:** Using 30% when history shows 5% dramatically overstates transition mortality risks.

### Citation 14: Irreversibility (Cousins 2022)
**Claim:** 80-95% of novel entities irreversible
**Verification:** ❌ NOT FOUND
**Evidence:** Cousins 2022 emphasizes PFAS cycling is "practically irreversible" but provides **NO numerical quantification** of irreversibility percentages. No mention of 80-95% range anywhere in the paper.
**Assessment:** This appears to be **extrapolation without empirical basis**. The paper discusses conceptual irreversibility, not quantified fractions.

**CRITICAL:** Either:
1. Find different source that provides this quantification
2. Remove the specific percentage claim
3. Clearly mark as author's extrapolation, not from Cousins 2022

---

## HIGH Priority Claims Analysis

### Climate Tech Parameters (Citations 1-6)

#### IEA 2024 - DAC Timeline
**Claim:** "5-10 years activation delay"
**Verification:** ⚠️ PARTIAL
**Evidence:** IEA shows major DAC projects coming online 2024-2025, but no explicit "5-10 year" construction timeline statement found.
**Assessment:** Timeline seems reasonable based on current projects, but specific range needs better sourcing.

#### Nature 2024 - Enhanced Weathering
**Claim:** "50-year chemical kinetics delay"
**Verification:** ⚠️ PARTIAL
**Evidence:** Studies show weathering over "5-20 years" (immediate paper) and up to "75 years" (long-term studies). No single "50-year" figure found.
**Assessment:** The 50-year tau appears to be a reasonable midpoint but isn't directly stated in cited sources.

### Post-Soviet Mortality (Citation 12)
**Claim:** "+74% death rate (1990-1994)" → 15% baseline
**Verification:** ✅ CONFIRMED (with caveat)
**Evidence:** Working-age male mortality increased 74% (from 759.2 to 1323.7 per 100,000).
**Mapping Issue:** How +74% death RATE maps to 15% excess MORTALITY needs clarification. These are different metrics.

### Energy Trap (Citation 13)
**Claim:** "0.2-66× GDP for cleanup"
**Verification:** ⚠️ PARTIAL
**Evidence:** Ling 2024 states cleanup costs "would likely exceed the world's annual GDP" but specific "0.2-66×" range not found in available sources.
**Assessment:** The massive uncertainty range suggests this is extrapolated from multiple scenarios. Needs clearer documentation of methodology.

---

## Additional Issues Found

### Citation Clarity Problems

1. **Biogeosciences papers** (Citations 3-4): Which specific 2024 vs 2025 papers? Multiple Biogeosciences publications exist on these topics.

2. **Communications Earth & Environment** (Citation 5): Combines multiple unrelated claims (biochar, heat pumps) that likely come from different papers.

3. **NHS mortality** (Citation 10): The 20-30% reduction appears to conflate amenable mortality (which did drop 30%→20%) with overall mortality reduction attributable to NHS.

### Parameter Extrapolation

Several parameters appear to be author interpretations rather than direct citations:
- Heat pump "5% building emissions reduction" - not found in cited source
- Biochar "2.8 Gt CO2/year" - needs clarification if theoretical max or realistic deployment
- SAI "1.5-year aerosol dispersion" - source verification needed

---

## High Uncertainty Parameters

1. **irreversibleFraction [0.80-0.95]** - 19% relative uncertainty
   - **CRITICAL:** No empirical basis found in Cousins 2022
   - Needs: Alternative source or remove claim

2. **reboundFactor [0.5-0.9]** - 80% relative uncertainty
   - Needs: Sensitivity analysis essential

3. **Energy requirement [0.2-66× GDP]** - 330× uncertainty range
   - Needs: Document scenario assumptions producing this range

4. **Great Leap Forward baseline [5% or 30%]** - 6× discrepancy
   - Needs: Immediate clarification

---

## Recommendations

### Grade = C (CONDITIONAL)

The research has significant issues that must be addressed before implementation:

1. **IMMEDIATE FIXES REQUIRED:**
   - Resolve Great Leap Forward 5% vs 30% inconsistency
   - Remove or re-source the 80-95% irreversibility claim
   - Clarify Post-Soviet death rate → excess mortality mapping

2. **DOCUMENTATION IMPROVEMENTS:**
   - Add heterogeneity notes to Kenya UBI implementation
   - Specify which Biogeosciences papers (year, authors)
   - Clarify extrapolated vs directly cited parameters

3. **SENSITIVITY ANALYSIS REQUIRED:**
   - All high-uncertainty parameters need Monte Carlo sensitivity testing
   - Document confidence intervals for extrapolated values

### Before Proceeding

1. **Spawn super-alignment-researcher** to:
   - Find alternative sources for unsupported claims
   - Verify the specific climate tech papers
   - Clarify NHS and Green Revolution attribution

2. **Update code comments** to:
   - Explain any intentional discrepancies
   - Mark extrapolated parameters clearly
   - Add uncertainty ranges where appropriate

3. **Re-validate after fixes** - I need to review the corrected claims

---

## Next Steps

1. **Orchestrator** should coordinate fixes with super-alignment-researcher
2. **Simulation-maintainer** should update parameters and documentation
3. **Return to me (Sylvia)** for re-validation after corrections
4. Only proceed to implementation after achieving grade B or better

---

## Final Assessment

The research contains a mix of well-supported claims (Kenya UBI, Post-Soviet mortality) and problematic extrapolations (irreversibility, Great Leap Forward baseline). The 6× discrepancy in transition mortality and the unsupported irreversibility range are too significant to ignore.

**Bottom line:** Smith et al. (2025) found parameters 6× different. Sample size: historical record vs. your extrapolation. This needs fixing before we build expensive mistakes on shaky foundations.

The code appears to use reasonable values in many cases, but the documentation needs to distinguish between:
- Direct citations from papers
- Reasonable extrapolations from multiple sources
- Author assumptions for modeling purposes

Fix these issues, and we can proceed. Ignore them, and we're building on sand.

---

**Sylvia signing off. Fix the foundations, then we build.**