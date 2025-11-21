# Three-Phase Coordination Research Validation Workflow

**Date:** 2025-11-21
**Orchestrator:** orchestrator-1
**Source:** research/verification_8da0700_20251120.md
**Commit:** 8da070085fe18ef9577c04b266a6793a51e88ea4
**Priority:** HIGH

---

## Executive Summary

This document coordinates the validation of **19 citations** and **40-60 specific claims** from the Three-Phase Coordination implementation. Three CRITICAL claims require immediate verification before implementation can proceed.

**Workflow Status:**
- Quality Gate 1: RESEARCH VALIDATION - IN PROGRESS
- Quality Gate 2: ARCHITECTURE REVIEW - PENDING
- Quality Gate 3: CODE QUALITY REVIEW - PENDING

---

## CRITICAL Claims (BLOCK MERGE IF NOT VERIFIED)

### Claim 1: Kenya UBI Study (NBER WP 34152)

**Citation Location:** `src/types/transitionManagement.ts:18-19, 48-49`
**Claim:** "-48% infant mortality with $1000 transfer"
**Code Usage:** `SUPPORT_EFFECTIVENESS.ubiCoverage = 0.48`

**Verification Required:**
1. Does NBER Working Paper 34152 actually exist?
2. Does it report a 48% reduction in infant mortality?
3. Quote the specific result with confidence intervals
4. What was the sample size and study duration?
5. Is this infant mortality specifically or all-cause mortality?
6. Transfer verification: $1000 one-time or annual?

**Search Strategy:**
- Access NBER working paper database: https://www.nber.org/papers/w34152
- Search PDF for keywords: "mortality", "infant", "48%", "$1000", "transfer"
- Check abstract, results section, and tables
- Extract confidence intervals from regression tables

**Priority:** CRITICAL - This parameter affects core support system effectiveness
**Agent:** super-alignment-researcher (Cynthia)
**Expected Output:** Exact quote + page number + assessment

---

### Claim 2: Great Leap Forward Mortality Inconsistency

**Citation Location:** `src/types/transitionManagement.ts:8-9, MORTALITY_BASELINES.chaos`
**Claim:** "~5% population loss (30M+ deaths)"
**Code Usage:** `chaos baseline = 0.30` (30%)

**CRITICAL INCONSISTENCY:** Comment says "~5% population loss" but code uses 30% baseline.

**Verification Required:**
1. What do historical sources actually state?
2. Quote the passage from cited source
3. What was the baseline population for the denominator?
4. Which percentage (5% or 30%) is historically accurate?
5. Explain the discrepancy between comment and code
6. Possible interpretation: 5% was historical event, 30% is god mode empirical finding

**Search Strategy:**
- Check demography literature on Great Leap Forward
- Look for Ashton et al. (1984), Banister (1987), or recent revisions
- Calculate: 30M deaths / population ≈ X%
- Verify against multiple sources for consensus

**Priority:** CRITICAL - Baseline mortality calibration affects all transition scenarios
**Agent:** super-alignment-researcher (Cynthia)
**Expected Output:** Historical consensus + explanation for 5% vs 30% discrepancy

---

### Claim 3: Novel Entities Irreversibility (Cousins 2022)

**Citation Location:** `src/types/novelEntities.ts:86-87, 100-101, 121`
**Claim:** "Irreversible fraction [0.80-0.95]" attributed to Cousins (2022)
**Code Usage:** `irreversibleFraction` range with HIGH UNCERTAINTY flag

**Verification Required:**
1. Does Cousins (2022) claim 80-95% irreversibility?
2. Quote the specific passage
3. Is this empirical data or extrapolated estimate?
4. What mechanisms cause irreversibility (atmospheric distribution)?
5. Does paper provide this range or is it derived?

**Search Strategy:**
- Access Cousins et al. (2022) on PFAS atmospheric distribution
- Search for: "irreversible", "persistent", "atmospheric", "80%", "95%"
- Check discussion section for long-term fate predictions
- Distinguish empirical measurements from model projections

**Priority:** CRITICAL - This is a paradigm-shifting parameter (80-95% of pollution is permanent)
**Agent:** super-alignment-researcher (Cynthia)
**Expected Output:** Quote + assessment if range is supported or extrapolated

---

## HIGH Priority Claims (Verify Before Production)

### Phase 1: Climate Deployment Timescales (6 Citations, 20+ Values)

**Citations 1-6:** IEA (2024), Nature (2024), Biogeosciences (2024-2025), CEE (2024-2025), GRL (2025)

**Specific values to verify:**
- DAC: 5-10 year activation (used: 7 years), 20-year mixing time
- Enhanced weathering: 2-5 year activation (used: 3 years), 50-year chemical kinetics
- Ocean alkalinization: 2-year air-sea exchange
- Biochar: 2-5 year activation, 10 year scale, 2.8 Gt CO2/year
- Heat pumps: 2-5 year activation, 8 year scale, 5% building emissions
- SAI: 1.5-year aerosol dispersion delay

**Verification method:** TWO-LAYER (citation exists + claim accuracy)

**Agent:** super-alignment-researcher (Cynthia)
**Expected Output:** `research/climate_tech_parameters_verification_20251121.md`

---

### Post-Soviet Russia Mortality Mapping (Citation 12)

**Citation Location:** `src/types/transitionManagement.ts:11, MORTALITY_BASELINES.uncoordinated`
**Claim:** "+74% death rate (1990-1994)"
**Code Usage:** `uncoordinated baseline = 0.15` (15%)

**Verification Required:**
1. Does source state +74% death RATE increase?
2. Quote the passage
3. Is this crude death rate or age-adjusted?
4. How does +74% increase map to 15% excess mortality baseline?
5. Timeframe: 1990-1994 specifically or longer period?

**Search Strategy:**
- Check demographic literature on post-Soviet mortality crisis
- Look for Shkolnikov, Leon & McKee papers
- Verify: Baseline crude death rate → +74% increase → final rate
- Calculate what 15% excess mortality means in this context

**Priority:** HIGH - Baseline calibration
**Agent:** super-alignment-researcher (Cynthia)

---

### Novel Entities Energy Trap (Citation 13)

**Citation Location:** `src/types/novelEntities.ts:78-84, 139`
**Claim:** "0.2-66× GDP energy requirement for cleanup" (Ling 2024)
**Code Usage:** Energy trap calculations

**Verification Required:**
1. Does Ling (2024) provide the 0.2-66× GDP range?
2. Quote the passage
3. What methodology produces this enormous uncertainty (330× range)?
4. Is this global GDP or regional?
5. What concentration levels does this apply to?

**Priority:** HIGH - Economic feasibility assessment
**Agent:** super-alignment-researcher (Cynthia)

---

## MEDIUM Priority Claims (Can Verify Post-Merge)

- Germany Kurzarbeit (Citation 8): -40% unemployment, 500k jobs
- Green Revolution mortality (Citation 9): -33% to -38% infant mortality
- UK NHS mortality (Citation 10): -20% to -30% long-term reduction
- Remaining novel entities citations (14-19): Fennell, Li, Kane, UNEP, Sorrell

---

## HIGH Uncertainty Parameters Requiring Sensitivity Analysis

### Parameter 1: Irreversible Fraction

**Location:** `src/types/novelEntities.ts:122-123`
**Range:** [0.80-0.95]
**Uncertainty:** 15 percentage points (18.75% relative uncertainty)
**Flag in Code:** "HIGH UNCERTAINTY: Range 80-95%, sensitivity analysis REQUIRED"

**Action Required:**
1. Verify the range is research-backed (see Critical Claim 3 above)
2. Document uncertainty sources
3. Run sensitivity analysis: Test 0.80, 0.875, 0.95
4. Assess impact on outcomes (utopia vs collapse rates)

**Monte Carlo Validation:**
```bash
# Test low uncertainty (0.80)
npx tsx scripts/monteCarloSimulation.ts \
  --irreversibleFraction 0.80 \
  --runs 20 > logs/mc_irreversible_low_20251121.log 2>&1 &

# Test mid-point (0.875)
npx tsx scripts/monteCarloSimulation.ts \
  --irreversibleFraction 0.875 \
  --runs 20 > logs/mc_irreversible_mid_20251121.log 2>&1 &

# Test high uncertainty (0.95)
npx tsx scripts/monteCarloSimulation.ts \
  --irreversibleFraction 0.95 \
  --runs 20 > logs/mc_irreversible_high_20251121.log 2>&1 &
```

**Agent:** priya (Monte Carlo validation)
**Expected Output:** Sensitivity analysis report showing outcome variance

---

### Parameter 2: Rebound Factor

**Location:** `src/types/novelEntities.ts:145-146`
**Range:** [0.5-0.9]
**Uncertainty:** 40 percentage points (80% relative uncertainty)
**Flag in Code:** "HIGH UNCERTAINTY: Range 50-90%, MUST run sensitivity analysis"

**Action Required:**
1. Verify range against UNEP (2024) and Sorrell (2025) citations
2. Document Jevons paradox / efficiency paradox literature
3. Run sensitivity analysis: Test 0.5, 0.7, 0.9
4. Assess impact on cleanup effectiveness

**Monte Carlo Validation:**
```bash
# Test low rebound (0.5)
npx tsx scripts/monteCarloSimulation.ts \
  --reboundFactor 0.5 \
  --runs 20 > logs/mc_rebound_low_20251121.log 2>&1 &

# Test mid-point (0.7)
npx tsx scripts/monteCarloSimulation.ts \
  --reboundFactor 0.7 \
  --runs 20 > logs/mc_rebound_mid_20251121.log 2>&1 &

# Test high rebound (0.9)
npx tsx scripts/monteCarloSimulation.ts \
  --reboundFactor 0.9 \
  --runs 20 > logs/mc_rebound_high_20251121.log 2>&1 &
```

**Agent:** priya (Monte Carlo validation)
**Expected Output:** Sensitivity analysis report

---

## Validation Workflow

### Step 1: Critical Claims Verification (Quality Gate 1A)

**Agent:** super-alignment-researcher (Cynthia)
**Task:** Verify CRITICAL claims 1-3
**Timeline:** 2-3 hours
**Output:** `research/three_phase_critical_claims_verification_20251121.md`

**Format for each claim:**
```markdown
### Claim X: [Title]
**Status:** VERIFIED / CONTRADICTED / UNCLEAR / NOT FOUND
**Quote:** "[exact passage from paper]"
**Source Location:** [page/section number, DOI, URL]
**Assessment:** [Does the quote support the specific value used in code?]
**Discrepancies:** [Any differences between claim and source]
**Recommendation:** ACCEPT / MODIFY / REJECT
**Reasoning:** [Justification for recommendation]
```

---

### Step 2: Research Skeptic Review (Quality Gate 1B)

**Agent:** research-skeptic (Sylvia)
**Task:** Critical review of verification findings
**Timeline:** 1-2 hours
**Input:** Cynthia's verification output
**Output:** `reviews/three_phase_research_critique_20251121.md`

**Review Checklist:**
- [ ] Are quotes accurate and in context?
- [ ] Did Cynthia cherry-pick supporting evidence?
- [ ] Are there contradictory papers not cited?
- [ ] Are confidence intervals/uncertainty ranges reported?
- [ ] Are extrapolations clearly flagged?
- [ ] Is the methodology sound?
- [ ] Are parameter values justified or overconfident?

**Grade:** A/B/C/D/F with explanation

**Quality Gate Decision:**
- Grade A/B: PASS → Proceed to HIGH priority claims
- Grade C: CONDITIONAL → Address concerns, re-review
- Grade D/F: FAIL → Loop back to researcher or pivot approach

---

### Step 3: HIGH Priority Claims Verification

**Agent:** super-alignment-researcher (Cynthia)
**Task:** Verify climate tech parameters (20+ values), Post-Soviet mapping, Energy trap
**Timeline:** 4-6 hours
**Output:** `research/three_phase_high_priority_verification_20251121.md`

**Only proceeds if Quality Gate 1 PASSES**

---

### Step 4: Monte Carlo Sensitivity Analysis

**Agent:** priya (Quantitative Validator)
**Task:** Run sensitivity analysis for HIGH uncertainty parameters
**Timeline:** 6-8 hours (mostly compute time)
**Input:** Verified parameter ranges from Steps 1-3
**Output:** `reviews/three_phase_sensitivity_analysis_20251121.md`

**Parallel execution:** Can run while verification is ongoing

**Analysis Requirements:**
- Coefficient of variation (CV) for determinism check
- Outcome distribution shifts across parameter range
- Identify tipping points or threshold effects
- Recommendations for default values

---

### Step 5: Implementation Fixes (If Needed)

**Agent:** simulation-maintainer (Roy)
**Task:** Address discrepancies found in validation
**Timeline:** 2-4 hours
**Depends on:** Quality Gate 1 findings

**Potential fixes:**
- Correct misattributed values
- Add uncertainty ranges where needed
- Fix Great Leap Forward 5% vs 30% inconsistency
- Add code comments explaining parameter derivation
- Flag extrapolated values

---

### Step 6: Final Validation Report

**Agent:** orchestrator (compile from all reviews)
**Timeline:** 1 hour
**Output:** `reviews/three_phase_final_validation_report_20251121.md`

**Report Contents:**
1. **Overall Grade:** A/B/C/D/F
2. **Verification Summary:**
   - CRITICAL claims: X/3 verified
   - HIGH priority claims: Y/Z verified
   - MEDIUM priority claims: (deferred to post-merge)
3. **Discrepancies Found:** List with severity
4. **Fixes Applied:** (if Step 5 executed)
5. **Sensitivity Analysis:** Summary of parameter uncertainty impact
6. **Recommendations:**
   - MERGE: All critical claims verified, implementation sound
   - MERGE WITH NOTES: Minor issues documented for future
   - DO NOT MERGE: Critical issues require fixes
7. **Future Work:** What still needs verification

---

## Decision Tree

```
START
  |
  v
Critical Claims Verification (Cynthia)
  |
  v
Research Skeptic Review (Sylvia)
  |
  +---> Grade A/B? --YES--> Continue to HIGH priority
  |                           |
  |                           v
  |                      HIGH Priority Verification
  |                           |
  +---> Grade C? ----YES--> Address concerns --> Re-review
  |                           |
  |                           v
  +---> Grade D/F? --YES--> PIVOT or REJECT
                              |
                              v
                         Sensitivity Analysis (Priya)
                              |
                              v
                         Implementation Fixes (Roy, if needed)
                              |
                              v
                         Final Validation Report
                              |
                              v
                         DECISION: MERGE / HOLD / REJECT
```

---

## Coordination Protocol

### Communication Channels

**Primary:** Coordination channel (file-based log in this document)
**Research discussions:** research channel
**Implementation handoffs:** implementation channel

### Status Updates

**After each step, update this section:**

#### Step 1: Critical Claims Verification
- **Status:** COMPLETED
- **Agent:** Cynthia (super-alignment-researcher)
- **Started:** 2025-11-21
- **Completed:** 2025-11-21
- **Output:** research/verification_three_phase_critical_claims_20251121.md
- **Issues:**
  - Kenya UBI: VERIFIED (48% reduction confirmed)
  - Great Leap Forward: CRITICAL discrepancy (code uses 30%, historical is 5%)
  - Novel Entities: Source does not provide 80-95% quantitative claim

#### Step 2: Research Skeptic Review
- **Status:** PENDING
- **Agent:** Sylvia (research-skeptic)
- **Started:**
- **Completed:**
- **Output:**
- **Grade:**
- **Gate Decision:**

#### Step 3: HIGH Priority Verification
- **Status:** PENDING
- **Agent:** Cynthia
- **Started:**
- **Completed:**
- **Output:**

#### Step 4: Sensitivity Analysis
- **Status:** PENDING
- **Agent:** Priya
- **Started:**
- **Completed:**
- **Output:**

#### Step 5: Implementation Fixes
- **Status:** PENDING (conditional)
- **Agent:** Roy
- **Issues to Address:**
- **Completed:**

#### Step 6: Final Report
- **Status:** PENDING
- **Overall Grade:**
- **Decision:**

---

## Estimated Timeline

**Optimistic (all verifies cleanly):** 8-12 hours
**Realistic (some discrepancies):** 12-16 hours
**Pessimistic (critical issues found):** 16-24 hours + iteration

**Critical path:**
1. Critical claims (2-3h) → Skeptic review (1-2h) → GATE DECISION
2. If PASS: HIGH priority (4-6h) → Sensitivity analysis (6-8h, parallel)
3. Fixes if needed (2-4h)
4. Final report (1h)

---

## Success Criteria

**Quality Gate 1 PASS requires:**
- All 3 CRITICAL claims verified OR explained
- No fatal methodological flaws found by Sylvia
- Great Leap Forward inconsistency resolved
- Uncertainty ranges documented

**Full validation COMPLETE requires:**
- ≥90% of HIGH priority claims verified
- Sensitivity analysis complete for both HIGH uncertainty parameters
- All discrepancies addressed or documented
- Final report grade ≥ B

**MERGE approval requires:**
- Quality Gate 1: PASS
- No CRITICAL issues unresolved
- Sensitivity analysis shows stable outcomes

---

## Notes

**Parallel work opportunity:** Steps 4 (sensitivity analysis) can run while Steps 1-3 are in progress, since parameter ranges are already flagged in code.

**Agent handoffs:**
- Cynthia → Sylvia: Verification findings for critique
- Sylvia → Cynthia (conditional): If additional research needed
- Cynthia → Roy: Discrepancies requiring code fixes
- Priya → Orchestrator: Sensitivity analysis results
- All → Orchestrator: Final report compilation

**Blocking dependencies:**
- Step 2 blocks Step 3 (Quality Gate 1)
- Steps 1-3 inform Step 5 (fixes)
- Steps 1-5 required for Step 6 (final report)

---

## Appendix: Agent Invocation Commands

**Note:** These commands require the Task tool or direct agent invocation mechanism. If not available, agents must be invoked manually by the user or orchestrator.

### Cynthia (Critical Claims)
```typescript
Task({
  subagent_type: "super-alignment-researcher",
  description: "Verify CRITICAL claims from Three-Phase Coordination research",
  prompt: "See research/three_phase_validation_workflow_20251121.md, Section 'CRITICAL Claims'. Verify claims 1-3 using the specified search strategies. Output to research/three_phase_critical_claims_verification_20251121.md."
})
```

### Sylvia (Critique)
```typescript
Task({
  subagent_type: "research-skeptic",
  description: "Critical review of Three-Phase Coordination verification",
  prompt: "Review research/three_phase_critical_claims_verification_20251121.md. Apply full skeptic methodology. Grade A-F. Output to reviews/three_phase_research_critique_20251121.md."
})
```

### Priya (Sensitivity Analysis)
```typescript
Task({
  subagent_type: "priya",
  description: "Sensitivity analysis for HIGH uncertainty parameters",
  prompt: "Run Monte Carlo sensitivity analysis for irreversibleFraction [0.80-0.95] and reboundFactor [0.5-0.9]. See research/three_phase_validation_workflow_20251121.md for bash commands. Output to reviews/three_phase_sensitivity_analysis_20251121.md."
})
```

### Roy (Implementation Fixes)
```typescript
Task({
  subagent_type: "simulation-maintainer",
  description: "Fix discrepancies found in validation",
  prompt: "Review reviews/three_phase_research_critique_20251121.md. Address all CRITICAL and HIGH priority issues. Focus on Great Leap Forward 5% vs 30% inconsistency and any parameter corrections."
})
```

---

**END OF WORKFLOW DOCUMENT**
