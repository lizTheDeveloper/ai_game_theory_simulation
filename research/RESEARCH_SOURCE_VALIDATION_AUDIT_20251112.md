# Research Source Validation Audit
**Date:** November 12, 2025
**Auditor:** Cynthia (Super-Alignment Researcher)
**Audit Scope:** Research backing for simulation parameters, focus on recent implementations
**Current Date Context:** November 2025 (cutoff: sources >1 year old = Nov 2024 or earlier)

---

## Executive Summary

**Overall Assessment:** 🟡 MIXED - Strong recent research activity (Nov 2025), but 38.2% of research files have sources >5 years old, and several critical parameters lack proper research backing.

### Key Findings

1. ✅ **Recent Research Quality High:** Oct-Nov 2025 research shows rigorous methodology, peer-reviewed sources
2. ⚠️ **Research Currency Issue:** 136 files (38.2%) have sources >5 years old, failing currency standard
3. ❌ **Parameter Citation Gaps:** Several critical parameters lack proper research backing or misinterpret sources
4. ✅ **Verification System Working:** Layer 2 verification (Nov 2025) catching misinterpretations and extrapolations
5. 🟢 **Strong Core Areas:** Climate mitigation, planetary boundaries, AI alignment well-researched

### Priority Actions Required

1. **CRITICAL:** Fix Cavalcanti et al. (2025) mortality stabilizer misinterpretation (confuses funding levels with donor availability)
2. **HIGH:** Update 136 research files with sources >5 years old
3. **HIGH:** Validate TIER 2 intervention parameters (recently fixed, need verification)
4. **MEDIUM:** Document bifurcation variance amplification (100×) research basis
5. **MEDIUM:** Validate scenario government priority parameters

---

## 1. Outdated Research Sources (UPDATE_QUEUE Analysis)

**Source:** `/research/UPDATE_QUEUE.md` (auto-generated scan of 356 files)

### Statistics

| Priority | Count | Percentage | Criteria |
|----------|-------|------------|----------|
| 🚨 CRITICAL | 0 | 0.0% | >10 years old & actively used |
| ⚠️ HIGH | 136 | 38.2% | >5 years old |
| 📋 MEDIUM | 19 | 5.3% | 3-5 years old |
| ✅ LOW | 201 | 56.5% | <3 years old |

**Average Source Age:** 8.5 years
**Oldest Source:** 1955 (70 years ago) - in `paradigm_2_development_needs_20251019.md`

### Target vs. Reality

- **Goal:** <5% sources >3 years old, 0% sources >5 years old
- **Current:** 38.2% critical (>5 years), 43.5% total outdated
- **Status:** 🚨 CRITICAL threshold exceeded

### Notable Outdated Files (Used in Simulation)

While most outdated files are verification/documentation, some may affect active parameters:

**Climate Research:**
- `climate_collapse_timelines_20251026.md` - Oldest: 2007 (18 years)
- `climate_mitigation_deployment_rates_20251021.md` - BUT this is comprehensive, 70-80% confidence with recent IPCC AR6

**AI Alignment:**
- `competitive_alignment_failure_modes_20251016.md` - Oldest: 1995 (30 years) - game theory foundations

**Social Systems:**
- `famine_distribution_mechanisms_20251030.md` - Oldest: 1981 (44 years) - Amartya Sen foundational work

**Assessment:** Many "old" sources are FOUNDATIONAL THEORY (Sen on famines, game theory) which remain valid. The issue is when OLD EMPIRICAL DATA is used (outdated statistics, deployment rates, costs).

---

## 2. TIER 2 Interventions (Recently Fixed)

**Source:** `src/simulation/thresholds/tier2Config.ts` (recently updated Nov 2025)
**Research:** `research/citations/tier2_config_acemoglu_restrepo_verification.md` (Nov 4, 2025)

### Status: ⚠️ PARTIALLY VERIFIED

### Parameters Audited

**5 Thresholds with Historical Range-Based Distributions:**

1. **Government Legitimacy Crisis:** Triangular(0.25, 0.30, 0.40)
   - ✅ Research: Weimar, USSR, Arab Spring cases (1930-2011)
   - ✅ Citation: Historical state collapse analysis
   - **Status:** WELL-SUPPORTED (historical empirical data)

2. **Surveillance Dystopia:** Uniform[0.65, 0.80]
   - ✅ Research: East Germany (Stasi), China, North Korea, USSR
   - ✅ Citation: Authoritarian surveillance states
   - **Status:** WELL-SUPPORTED (historical cases spanning 1950-present)

3. **Automation Displacement Crisis:** Triangular(0.40, 0.50, 0.60)
   - ✅ Research: Industrial Revolution, Great Depression, modern automation
   - ⚠️ Citation: Acemoglu & Restrepo (2022)
   - **Issue Found:** Year is WRONG - should be 2019, not 2022
   - **Status:** NEEDS CORRECTION (correct paper, wrong year)

4. **AI Recursive Improvement:** Uniform[1.2, 1.5]
   - ⚠️ Research: Analogs only (Moore's Law, AlphaGo, software bootstrapping)
   - ⚠️ Citation: "Technological improvement curve analogs"
   - **Issue:** NO DIRECT PRECEDENT - genuinely speculative
   - **Status:** CORRECTLY MARKED AS SPECULATIVE (acceptable for Tier 2 "semi-known")

5. **Resentment Revolt Trigger:** Triangular(0.60, 0.70, 0.80)
   - ✅ Research: French Revolution, Russian Revolution, Arab Spring, Occupy (1789-2019)
   - ✅ Citation: Historical revolutions with Gurr (1970), Acemoglu & Robinson (2006)
   - **Status:** WELL-SUPPORTED (historical empirical data)

### Acemoglu & Restrepo Citation Issue

**Finding:** Code cites "Acemoglu & Restrepo (2022)" but verification shows primary paper is 2019.

**Details:**
- ❌ Code says: "Acemoglu & Restrepo (2022)"
- ✅ Correct: "Acemoglu & Restrepo (2019) - *Automation and New Tasks*, Journal of Economic Perspectives"
- ⚠️ Additional issue: Code mentions "augmentation preserves autonomy" - NOT in paper
- ⚠️ Paper distinguishes "automation" vs "new tasks" vs "factor-augmenting," NOT "automation vs augmentation"

**Recommended Fix:**
```typescript
// BEFORE:
citation: 'Industrial Revolution, Great Depression, modern automation (Acemoglu & Restrepo 2022)'

// AFTER:
citation: 'Industrial Revolution, Great Depression, modern automation (Acemoglu & Restrepo 2019 JEP 33:2)'
```

**Research Quality:** High - Acemoglu & Restrepo is seminal labor economics, but code misinterprets framework slightly.

---

## 3. Mortality Stabilizers (Critical Issues Found)

**Source:** `src/simulation/mortalityStabilizersInit.ts`
**Verification:** `research/mortality_stabilizers_layer2_verification_20251106.md` (Nov 6, 2025)

### Status: 🚨 CRITICAL DISCREPANCIES FOUND

### Issues Identified

#### Issue 1: Ballester et al. (2024) - Heat Adaptation

**What Code Claims:** 80% total maximum mortality reduction from heat adaptation
**What Paper Says:** ~44% reduction (80% HIGHER mortality WITHOUT adaptation = 44.4% reduction WITH)

**Impact:** Simulation is MORE OPTIMISTIC than empirical data supports

**Assessment:**
- ✅ Paper verified: Nature Medicine, August 2024
- ❌ Total max value WRONG: Code claims 0.8, paper shows ~0.44
- ❌ Type-specific breakdown (20%, 30%, 50%, 40%) NOT in paper - extrapolations
- ❌ Monthly rates (5%, 10%, 2%, 3%) NOT in paper - modeling assumptions
- ✅ Timescale ("weeks to years") is correct

**Recommended Action:** Reduce `HEAT_ADAPTATION_TOTAL_MAX` from 0.8 to 0.45 OR find additional sources supporting 0.8

#### Issue 2: Cavalcanti et al. (2025) - Aid Effectiveness (MOST CRITICAL)

**What Code Claims:** Three tiers based on "donor availability thresholds" (80%, 50%, 20%)
**What Paper Measures:** USAID funding levels (low/intermediate/high)

**This is a FUNDAMENTAL MISINTERPRETATION:**

| What Paper Shows | What Code Assumes |
|------------------|-------------------|
| Funding level = dollars spent | Donor availability = fraction of donors able to help |
| Low: 6% mortality reduction (overall) | Low: 8% (20% donor availability) |
| Intermediate: 9% | Medium: 18.5% (50% donor availability) |
| High: 15% | High: 29.5% (80% donor availability) |
| Age-specific: 21%, 28%, 44% (preschool) | Used preschool values for all ages |

**The code is modeling donor fatigue/crisis overload, but citing a paper about funding levels. These are DIFFERENT CONCEPTS.**

**Additional Issue:** "Donor fatigue per crisis" (0.25) is UNSOURCED - not in Cavalcanti 2025, historical example (Pakistan 2010) needs peer-reviewed citation

**Recommended Actions:**
1. Rename variables to `AID_EFFECTIVENESS_HIGH_FUNDING` (not HIGH_AVAILABILITY)
2. Find actual research on donor fatigue during simultaneous crises
3. Use age-appropriate values (6%, 9%, 15% overall, not preschool 21%, 28%, 44%)
4. Mark donor availability thresholds as [MODELING ASSUMPTION]

#### Issue 3: IOM (2024) - Migration Parameters

**What Code Claims:** 11 specific parameters (85% success rate, 0.1% mortality, 85% return rate, etc.)
**What Report Contains:** Qualitative discussion, case studies - NOT quantitative parameters

**Assessment:**
- ✅ Report exists and is relevant
- ❌ 10 of 11 parameters NOT FOUND in report
- Report is qualitative/case-study based, not quantitative

**Recommended Actions:**
1. Search UNHCR, Migration Policy Institute for quantitative data
2. OR mark all as [MODELING ASSUMPTIONS - IOM 2024 QUALITATIVE SUPPORT ONLY]
3. OR use proxy data from refugee camp mortality statistics

#### Issue 4: GAO (2025) - Emergency Response

**Status:** ⚠️ WEAK EVIDENCE (correctly marked in code)

**Assessment:**
- ✅ 4% workforce availability verified (Nov 2024 hurricanes)
- ⚠️ GAO report is government audit, NOT peer-reviewed research
- ❌ 20-40% mortality reduction range NOT in report
- ❌ Effectiveness degradation curves are estimates

**Recommended Action:** Accept as modeling assumptions (already marked WEAK EVIDENCE) OR search for peer-reviewed disaster response effectiveness literature

### Mortality Stabilizer Summary

| Parameter Set | Papers Exist? | Values Verified? | Severity |
|---------------|--------------|------------------|----------|
| Heat Adaptation (Ballester 2024) | ✅ | ❌ Partial | 🔴 CRITICAL |
| Aid Effectiveness (Cavalcanti 2025) | ✅ | ❌ Misinterpreted | 🔴 CRITICAL |
| Emergency Response (GAO 2025) | ✅ | ⚠️ Weak | 🟡 MEDIUM |
| Migration (IOM 2024) | ✅ | ❌ Not found | 🔴 CRITICAL |

---

## 4. Bifurcation Variance Amplification (100×)

**Source:** `src/simulation/engine/phases/BifurcationLogicPhase.ts` (line 258)
**Parameter:** `varianceAmplification` ranges from 1× (far from thresholds) to 100× (at threshold)

### Status: ⚠️ NEEDS RESEARCH DOCUMENTATION

### What the Code Does

```typescript
// Distance = 1.0 (far): amplification = 1.0×
// Distance = 0.1: amplification = 10×
// Distance = 0.0 (at threshold): amplification = 100×
const amplificationCapped = Math.min(100.0, amplification);
```

**Mechanism:** Near critical thresholds, random variations are amplified 100× to create path-dependent trajectories. This is why Monte Carlo runs near tipping points show divergent outcomes.

### Research Citations in Code

- ✅ Scheffer et al. (2014) Phil. Trans. R. Soc. B 370: 20130263 - Critical slowing down, regime shifts
- ✅ Richardson et al. (2023) Science Advances - Planetary boundaries, tipping points
- ✅ Keller et al. (2024) Nat. Comm. Psych. - Resilience heterogeneity

**Assessment:**
- ✅ General mechanism (critical slowing down, variance amplification near tipping points) is well-established
- ❌ Specific 100× magnitude NOT JUSTIFIED in code comments
- ⚠️ 100× is likely a MODELING CHOICE for computational tractability, not empirically derived

### Questions for Research Validation

1. **What is the empirical variance amplification near planetary boundaries?**
   - Scheffer et al. discuss critical slowing down but don't quantify 100× specifically
   - Need to check if papers provide variance scaling curves

2. **Is 100× cap justified or arbitrary?**
   - Likely chosen to prevent numerical instability (amplification → infinity as distance → 0)
   - Could be 50×, could be 200× - needs sensitivity analysis

3. **What Monte Carlo outcomes does this produce?**
   - Code comment: "Expected impact: 20-70% coefficient of variation"
   - Need to verify this matches empirical tipping point variance

**Recommended Actions:**
1. Check Scheffer et al. (2014) for quantitative variance scaling near bifurcations
2. Check Richardson et al. (2023) for planetary boundary variance empirics
3. Run sensitivity analysis: 50×, 100×, 200× caps, measure outcome CV
4. Document that 100× is "modeling choice to match empirical CV of 20-70%"

---

## 5. Scenario Government Priorities

**Source:** Searched but not found in standard locations (`src/simulation/config/`)
**Note:** Scenario configurations may be embedded in scenario definitions or phase logic

### Parameters Needing Validation

Based on audit objectives, these parameters need research backing:

1. **Climate spending priorities** (by scenario type)
   - Conservative: 1-2% GDP?
   - Progressive: 3-5% GDP?
   - Research needed: Historical government climate investment by ideology

2. **Redistribution priorities** (by scenario type)
   - Neoliberal: 10-15% transfers?
   - Social democratic: 25-35% transfers?
   - Research needed: OECD redistribution rates by government type

3. **AI safety budgets** (by scenario type)
   - Regulation-light: 0.1-0.5% of AI industry?
   - Regulation-heavy: 5-10% of AI industry?
   - Research needed: Financial regulatory spending as % of sector GDP

**Assessment:** ⚠️ PARAMETERS NOT LOCATED - may be in scenario-specific files or embedded in phase logic

**Recommended Action:** Search scenario phase logic and configuration for these parameters, then validate against:
- IEA climate investment tracking
- OECD redistribution statistics
- Financial sector regulatory spending precedents

---

## 6. Parameters Without Proper Citations

### Identified Gaps

Based on Layer 2 verification findings:

1. **Heat Adaptation Type-Specific Breakdown**
   - ❌ 20% physiological, 30% behavioral, 50% infrastructural, 40% social
   - Source: Claimed from Ballester 2024, but NOT in paper
   - **Status:** EXTRAPOLATION WITHOUT ACKNOWLEDGMENT

2. **Donor Fatigue Per Crisis**
   - ❌ 0.25 reduction per simultaneous crisis
   - Source: Claimed "Pakistan 2010: 50% of Haiti's aid"
   - **Status:** HISTORICAL EXAMPLE, NEEDS PEER-REVIEWED SOURCE

3. **Migration Success Rates**
   - ❌ 85% baseline success rate
   - ❌ 0.1% baseline mortality
   - ❌ 85% annual return rate
   - Source: Claimed IOM 2024, but NOT in report
   - **Status:** UNSOURCED - 10 of 11 migration parameters

4. **Emergency Response Effectiveness**
   - ❌ 20-40% mortality reduction range
   - ❌ Effectiveness degradation curves
   - Source: GAO 2025 (government audit, not research)
   - **Status:** WEAK EVIDENCE (correctly marked)

5. **AI Recursive Improvement Monthly Multiplier**
   - ⚠️ 1.2-1.5× per month
   - Source: Analogs (Moore's Law, AlphaGo, software bootstrapping)
   - **Status:** NO DIRECT PRECEDENT - genuinely speculative (acceptable for Tier 2)

---

## 7. Contradictory Evidence Found

### None Identified

**Good News:** Layer 2 verification (Nov 2025) did NOT find research contradicting model assumptions. Issues are:
- Misinterpretations (Cavalcanti funding vs availability)
- Extrapolations (Ballester 44% → 80%)
- Missing sources (IOM migration parameters)

NOT:
- Research showing opposite effects
- Research disproving mechanisms

This suggests the model's MECHANISMS are sound, but PARAMETER MAGNITUDES need refinement.

---

## 8. Research Update Priorities

### TIER 1: CRITICAL (Fix Before Next Release)

1. **Fix Cavalcanti et al. Misinterpretation**
   - Action: Rename variables to reflect funding levels OR find donor fatigue research
   - Owner: UNASSIGNED
   - Deadline: Before next mortality stabilizer validation

2. **Reduce Ballester Heat Adaptation Max**
   - Action: Change 0.8 to 0.45 OR find supporting sources for 0.8
   - Owner: UNASSIGNED
   - Deadline: Before next climate mortality validation

3. **Source IOM Migration Parameters**
   - Action: Search UNHCR, Migration Policy Institute for quantitative data
   - Owner: UNASSIGNED
   - Deadline: Before next migration crisis validation

4. **Fix Acemoglu & Restrepo Citation Year**
   - Action: Change 2022 → 2019 in tier2Config.ts
   - Owner: TRIVIAL FIX (can be done immediately)
   - Deadline: Immediate

### TIER 2: HIGH (Address Within 1 Month)

5. **Document Bifurcation Variance 100× Justification**
   - Action: Verify Scheffer et al. (2014) variance scaling, run sensitivity analysis
   - Owner: UNASSIGNED
   - Deadline: Before claiming "research-backed Monte Carlo variance"

6. **Update 136 Outdated Research Files**
   - Action: Prioritize files ACTIVELY USED in simulation (not verification docs)
   - Owner: Research team coordination needed
   - Deadline: Systematic update sprint (1-2 weeks)

7. **Validate Scenario Government Priorities**
   - Action: Locate parameters, verify against OECD/IEA data
   - Owner: UNASSIGNED
   - Deadline: Before next scenario validation

### TIER 3: MEDIUM (Review Within Quarter)

8. **Heat Adaptation Type-Specific Research**
   - Action: Find sources for physiological/behavioral/infrastructural/social breakdown
   - Owner: UNASSIGNED
   - Deadline: Before next heat mortality validation

9. **Emergency Response Effectiveness Literature**
   - Action: Find peer-reviewed alternatives to GAO estimates
   - Owner: UNASSIGNED
   - Deadline: Non-blocking (already marked WEAK EVIDENCE)

10. **Donor Fatigue Quantification**
    - Action: Find peer-reviewed studies on aid effectiveness during simultaneous crises
    - Owner: UNASSIGNED
    - Deadline: Before next mortality stabilizer expansion

---

## 9. Positive Findings (Research Quality Strengths)

### High-Quality Recent Research (Oct-Nov 2025)

**Climate Mitigation Deployment Rates (Oct 21, 2025):**
- ✅ 1,277 lines, 70-80% research confidence
- ✅ 28 peer-reviewed sources, IPCC AR6, IEA reports
- ✅ Conservative timescales, deployment physics, energy requirements
- **Use as template for future research**

**Planetary Boundary Reversibility (Oct 20, 2025):**
- ✅ B+ grade (78% verified)
- ✅ Tiered reversibility framework (reversible/partial/irreversible)
- ✅ Empirical case studies (ozone, Lake Erie, Saiga antelope)
- Only issue: 1 journal misattribution (corrected)

**AI Infrastructure Resources (Oct 19, 2025):**
- ✅ Data center energy, water, chip constraints
- ✅ Well-sourced for AI scaling constraints

**Verification System Working:**
- ✅ Layer 2 verification catching misinterpretations
- ✅ `/check_citation` slash command catching fabrications
- ✅ Citation audit (Oct-Nov 2025) removed 200+ fabricated citations

### Research Roadmap Exists

**`research/RESEARCH_ROADMAP.md` (Nov 10, 2025):**
- ✅ 1,070 lines of systematic research priorities
- ✅ Integrates god mode gap analysis (Priya's diagnostics)
- ✅ TIER 1-11 priority matrix
- ✅ 26 missing technologies identified
- ✅ 9 modeling paradigm shifts documented

**This audit complements that roadmap by validating EXISTING research backing.**

---

## 10. Deliverables Summary

### 1. List of Research Files >1 Year Old

**From UPDATE_QUEUE.md:** 155 files (43.5%) have sources older than Nov 2024

**Breakdown:**
- 136 files (38.2%) have sources >5 years old (HIGH priority)
- 19 files (5.3%) have sources 3-5 years old (MEDIUM priority)

**Key Point:** Many "old" sources are FOUNDATIONAL THEORY (e.g., Sen 1981 on famines, Gurr 1970 on revolutions, game theory papers from 1990s). These remain valid. The issue is OLD EMPIRICAL DATA (outdated costs, deployment rates, statistics).

**Action Required:** Filter 136 HIGH priority files to identify those with outdated EMPIRICAL DATA vs. those with timeless THEORY.

### 2. Parameters in Code Without Proper Citations

**Identified in this audit:**

| Parameter | Current Source | Issue | Severity |
|-----------|---------------|-------|----------|
| Heat adaptation max (0.8) | Ballester 2024 | Paper shows 0.44, not 0.8 | 🔴 CRITICAL |
| Heat adaptation breakdown | Ballester 2024 | NOT in paper | 🔴 CRITICAL |
| Aid effectiveness tiers | Cavalcanti 2025 | Misinterpreted (funding ≠ availability) | 🔴 CRITICAL |
| Donor fatigue rate | Pakistan 2010 example | No peer-reviewed source | 🔴 CRITICAL |
| Migration success rate (0.85) | IOM 2024 | NOT in report | 🔴 CRITICAL |
| Migration mortality (0.001) | IOM 2024 | NOT in report | 🔴 CRITICAL |
| Migration return rate (0.85) | IOM 2024 | NOT in report | 🔴 CRITICAL |
| Emergency response (20-40%) | GAO 2025 | NOT in report (weak evidence) | 🟡 MEDIUM |
| Bifurcation variance (100×) | Scheffer 2014 | Mechanism yes, magnitude unverified | 🟡 MEDIUM |
| AI recursive improvement | Analogs | No direct precedent (speculative) | ⚠️ ACCEPTABLE |
| Acemoglu & Restrepo year | 2019 paper | Code says 2022 | 🟢 TRIVIAL FIX |

### 3. Contradictory Research Findings

**None found.** Issues are misinterpretations and missing sources, NOT contradictory evidence.

### 4. Priority List for Research Updates

**See Section 8 above for complete TIER 1-3 breakdown.**

**Top 3 Immediate Actions:**
1. Fix Cavalcanti mortality stabilizer misinterpretation
2. Reduce Ballester heat adaptation max or find supporting sources
3. Source IOM migration parameters from quantitative databases

---

## 11. Audit Methodology

### Sources Reviewed

1. ✅ `research/UPDATE_QUEUE.md` - Auto-generated scan of 356 files
2. ✅ `research/RESEARCH_ROADMAP.md` - Systematic priorities (1,070 lines)
3. ✅ `research/mortality_stabilizers_layer2_verification_20251106.md` - Nov 6 verification
4. ✅ `research/citations/tier2_config_acemoglu_restrepo_verification.md` - Nov 4 verification
5. ✅ `src/simulation/thresholds/tier2Config.ts` - TIER 2 threshold parameters
6. ✅ `src/simulation/mortalityStabilizersInit.ts` - Mortality stabilizer initialization
7. ✅ `src/simulation/engine/phases/BifurcationLogicPhase.ts` - Variance amplification logic

### Areas NOT Audited (Out of Scope)

- ❌ Scenario-specific parameters (government priorities) - files not located
- ❌ All 356 research files individually - relied on UPDATE_QUEUE summary
- ❌ Phase-by-phase parameter verification - focused on recent implementations
- ❌ Monte Carlo validation outcomes - focused on parameter sourcing

### Limitations

1. **Scope:** This audit focuses on PARAMETER BACKING, not model validation
2. **Coverage:** Spot-checked recent implementations, not exhaustive parameter-by-parameter review
3. **Expertise:** Research methodology audit, not domain expert validation (climate/AI/economics)

---

## 12. Recommendations

### For Research Team

1. **Immediate:** Fix 4 CRITICAL issues (Cavalcanti, Ballester, IOM, Acemoglu year)
2. **Short-term:** Document bifurcation variance 100× justification
3. **Medium-term:** Systematic update of 136 outdated files (filter for empirical vs. theory)
4. **Ongoing:** Continue Layer 2 verification process - catching issues effectively

### For Code Maintainers

1. **Enhanced Citation Standard:**

```typescript
/**
 * @research [Citation] - [What paper actually says]
 * @empirical [Verified value from paper]
 * @code [Value used in code]
 * @status [VERIFIED / EXTRAPOLATION / MODELING ASSUMPTION / NEEDS REVISION]
 */
```

2. **Parameter Classification:**
   - `[EMPIRICAL]` - Directly from research
   - `[EXTRAPOLATED]` - Derived from research findings
   - `[MODELING ASSUMPTION]` - Chosen for simulation design
   - `[WEAK EVIDENCE]` - Based on non-peer-reviewed sources

3. **Validation Gates:**
   - TIER 0-1 tech: EMPIRICAL required
   - TIER 2 tech: EXTRAPOLATED acceptable
   - TIER 3-4 tech: MODELING ASSUMPTION acceptable

### For Project Leadership

1. **Research Currency Goal:** Reduce >5yr sources from 38.2% to <5%
2. **Priority:** Fix CRITICAL issues before next major validation run
3. **Process:** Layer 2 verification is working - continue systematic audits

---

## 13. Files Created

- `research/RESEARCH_SOURCE_VALIDATION_AUDIT_20251112.md` (this file)

---

## 14. Next Steps

**Immediate (This Week):**
1. Create GitHub issues for 4 CRITICAL parameter fixes
2. Fix Acemoglu citation year (trivial)
3. Assign owners to TIER 1 research updates

**Short-Term (1 Month):**
4. Complete TIER 1 research updates (Cavalcanti, Ballester, IOM)
5. Document bifurcation variance 100× justification
6. Run sensitivity analysis on updated parameters

**Medium-Term (Quarter):**
7. Systematic update of 136 outdated files (prioritize empirical data)
8. Locate and validate scenario government priority parameters
9. Strengthen emergency response and heat adaptation type-specific research

---

**Audit Completed:** November 12, 2025
**Overall Grade:** 🟡 B- (MIXED - Strong mechanisms, parameter magnitudes need refinement)
**Confidence:** 80% (comprehensive recent implementations audited, but not exhaustive parameter-by-parameter review)
