# Research Validation Task: Three-Phase Coordination (Commit 8da0700)

**Agent:** research-skeptic (Sylvia)
**Date:** November 21, 2025
**Priority:** HIGH (from roadmap)
**Workflow Phase:** Quality Gate 1 - Research Validation

---

## Task Overview

Validate research claims from commit 8da0700 implementing three major systems:
1. **ClimateDeploymentDelayPhase** - Climate tech deployment timescales
2. **TransitionManagementSystem** - AI coordination & transition mortality
3. **Novel Entities enhancements** - Energy constraints & irreversibility

**Primary Verification File:** `research/verification_8da0700_20251120.md` (347 lines)
**Total Claims:** 40-60 specific parameter values
**Total Citations:** 19 academic sources

**Supporting Research Files:**
- `research/climate_tech_deployment_timescales_20251112.md` (Phase 1 original research)
- `research/ai_coordination_transition_mortality_20251118.md` (Phase 2 original research)
- `research/novel_entities_zero_effectiveness_20251113.md` (Phase 3 original research)

---

## CRITICAL Priority Claims (Must Verify First)

### 1. Kenya UBI Mortality Reduction
**Citation:** NBER WP 34152 (2025)
**Claim:** "-48% infant mortality with $1000 transfer"
**Code Location:** `transitionManagement.ts:18-19, 48-49`
**Code Value:** `SUPPORT_EFFECTIVENESS.ubiCoverage = 0.48`

**Verification Checklist:**
- [ ] Does NBER WP 34152 report 48% reduction?
- [ ] Quote specific passage with confidence intervals
- [ ] Sample size and study duration?
- [ ] Infant mortality specifically or all-cause?
- [ ] Transfer amount: $1000 one-time or annual?

### 2. Great Leap Forward Inconsistency
**Citation:** Historical mortality data
**Claim:** "~5% population loss (30M+ deaths)"
**Code Location:** `transitionManagement.ts:8-9, MORTALITY_BASELINES.chaos`
**Code Value:** `chaos baseline = 0.30` (30%)

**CRITICAL INCONSISTENCY:** Comment says "5%" but code uses "30%"

**Verification Checklist:**
- [ ] What is the correct percentage?
- [ ] Population denominator (what baseline population)?
- [ ] Is this 5% of China's population or global?
- [ ] How does 5% vs 30% reconcile?
- [ ] Possible interpretation: 5% historical, 30% god mode empirical?

### 3. Irreversibility Range (80-95%)
**Citation:** Cousins (2022) - Atmospheric PFAS
**Claim:** "Atmospheric distribution makes local cleanup futile" + "Irreversible fraction [0.80-0.95]"
**Code Location:** `novelEntities.ts:86-87, 100-101, 121-123`
**Code Value:** `irreversibleFraction: [0.80-0.95]` (HIGH UNCERTAINTY flagged)

**Verification Checklist:**
- [ ] Does Cousins 2022 state local cleanup is futile?
- [ ] Quote the passage
- [ ] Does paper claim 80-95% irreversibility or is this extrapolated?
- [ ] What is the mechanism for irreversibility?
- [ ] Atmospheric redeposition rate provided?

---

## HIGH Priority Claims (Climate Tech Parameters)

### Citations 1-6: Climate Deployment Timescales
**Sources:** IEA (2024), Nature (2024), Biogeosciences (2024-2025), CEE (2024-2025), GRL (2025)
**Claims:** 20+ parameter values (activation delays, scaling timescales, effectiveness rates)

**Key Parameters to Verify:**
- [ ] DAC: 7-year activation (IEA 2024)
- [ ] Enhanced weathering: 3-year activation, 50-year tau (Nature 2024)
- [ ] Ocean alkalinization: 2-year air-sea exchange (Biogeosciences)
- [ ] DAC atmospheric mixing: 20-year tau (Biogeosciences 2025)
- [ ] Biochar: 2.8 Gt CO2/year capacity (CEE)
- [ ] Heat pumps: 8-year scaling, 5% emissions reduction (CEE)
- [ ] SAI: 1.5-year aerosol dispersion (GRL 2025)

### Citation 12: Post-Soviet Mortality Mapping
**Citation:** Post-Soviet Russia death rate data
**Claim:** "+74% death rate (1990-1994)"
**Code Location:** `transitionManagement.ts:11, MORTALITY_BASELINES.uncoordinated`
**Code Value:** `uncoordinated baseline = 0.15` (15%)

**Verification Checklist:**
- [ ] Does source state +74% death RATE increase?
- [ ] Quote the passage
- [ ] How does +74% rate increase map to 15% excess mortality?
- [ ] Crude death rate or age-adjusted?

---

## MEDIUM Priority Claims

- [ ] Germany Kurzarbeit: -40% unemployment, 500k jobs (OECD 2008)
- [ ] Green Revolution: -33% to -38% infant mortality, 3M lives/year (PMC/NIH)
- [ ] UK NHS: -20% to -30% long-term mortality (Post-War)
- [ ] Energy trap: 0.2-66× GDP range (Ling 2024)
- [ ] Rebound factors: 81% waste increase (UNEP 2024), AI efficiency paradox (Sorrell 2025)

---

## High Uncertainty Parameters (Sensitivity Analysis Required)

**Location:** `novelEntities.ts:122-123, 143-146`

1. **irreversibleFraction:** [0.80-0.95] (40-50% uncertainty range)
   - Comment: "HIGH UNCERTAINTY: Range 80-95%, sensitivity analysis REQUIRED"
   - Action: Document which end of range is more defensible

2. **reboundFactor:** [0.5-0.9] (40-50% uncertainty range)
   - Comment: "HIGH UNCERTAINTY: Range 50-90%, MUST run sensitivity analysis"
   - Action: Document baseline vs pessimistic values

---

## Validation Methodology

**Layer 1: Citation Existence** (Assumed ✅)
- All papers appear to be real publications

**Layer 2: Claim Verification** (Your task)
For each citation:
1. Verify paper actually makes the stated claim
2. Quote specific passages
3. Check if parameter values are directly stated or extrapolated
4. Flag contradictory evidence
5. Note methodological concerns
6. Grade confidence level (A/B/C/FAIL)

---

## Expected Output

**File:** `reviews/three_phase_coordination_critique_20251121.md`

**Structure:**
1. Executive Summary (grade + major concerns)
2. CRITICAL Claims Assessment (3 claims)
3. HIGH Priority Claims Assessment (climate tech + mortality mapping)
4. MEDIUM Priority Claims Assessment
5. High Uncertainty Parameter Recommendations
6. Overall Research Quality Grade
7. Decision: PASS (proceed to implementation) or FAIL (loop back/reject)

---

## Context for Research-Skeptic

**Your Role:** Find flaws, contradictory evidence, overconfidence, extrapolation beyond data

**Philosophy:** Adversarial review - assume researcher is cherry-picking unless proven otherwise

**Standards:**
- Direct quote required for each claim
- Distinguish stated vs inferred values
- Check for contradictory literature
- Flag "weasel ranges" (uncertainty masking lack of evidence)
- Note when single paper is sole source for critical parameter

---

## Next Steps After Your Review

**If PASS:**
- Orchestrator proceeds to Phase 2 (Implementation Planning)
- Simulation-maintainer addresses any flagged concerns

**If FAIL:**
- Orchestrator loops back to super-alignment-researcher for better sources
- OR rejects feature if fundamentally flawed

---

**Priority Order:** CRITICAL (3 claims) → HIGH (climate tech + mortality) → MEDIUM (if time permits)

**Expected Duration:** 4-8 hours for full validation
**Start with:** Kenya UBI claim (most quantitatively specific)
