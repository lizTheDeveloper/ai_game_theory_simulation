# Proposed Plan: Monte Carlo Outcome Stability Analysis

**Created:** December 8, 2025
**Priority:** MEDIUM
**Type:** Analysis/Validation
**Estimated Complexity:** 2 systems (Monte Carlo + Analytics)

## Problem Statement

Recent maintenance sessions revealed completed features (M-5, M-6, M-7, HIGH-7) but no systematic Monte Carlo validation of their combined effects on outcome distributions. The simulation has undergone significant changes:

- **M-5:** Threshold uncertainty (probabilistic vs deterministic tipping)
- **M-6:** Enhanced radiation modeling (dual-track ARS + cancer)
- **M-7:** Population assertions lowered (near-extinction scenarios now possible)
- **HIGH-7:** Conditional climate floor (5% → 0% in tail scenarios)

**Gap:** We don't know if these changes created emergent instabilities, outcome convergence, or distribution shifts.

## Proposed Solution

### Phase 1: Baseline Re-Establishment (N=50 runs)

Run comprehensive Monte Carlo sweep with recent codebase:
- Seeds: 1-50 (deterministic)
- Duration: 360 months (30 years)
- Capture: Outcome distributions, coefficient of variation, boundary transgression frequency
- Compare to: Historical baseline (if exists from pre-M5/M6/M7 era)

**Outputs:**
- Distribution histograms (7 outcome tiers)
- CV metrics by outcome type
- Boundary transgression patterns
- Population survival curves

### Phase 2: Stability Fingerprinting

Identify statistical signatures of each major system:
- **M-5 signature:** Increased variance in climate-related outcomes (threshold uncertainty propagates)
- **M-6 signature:** Nuclear winter scenarios should show radiation deaths (vs just temperature/famine)
- **M-7 signature:** Near-extinction scenarios (< 100M population) should now be possible
- **HIGH-7 signature:** Reduced "miraculous recovery" frequency in multi-tipping scenarios

**Outputs:**
- Signature detection tests
- Cross-correlation matrix (which features affect which outcomes)

### Phase 3: Anomaly Detection

Flag unexpected patterns:
- Convergence (all runs → same outcome despite different seeds)
- Bimodality (distribution splitting into two clusters)
- Long tail events (< 1% frequency but high severity)
- Missing outcomes (expected scenarios that never occur)

**Outputs:**
- Anomaly report with severity classification
- Investigation recommendations for CRITICAL anomalies

## Research Needed

**Statistical Methods:**
- Kolmogorov-Smirnov test for distribution comparison
- Anderson-Darling test for tail behavior
- Bootstrap confidence intervals for outcome probabilities

**Domain-Specific:**
- Expected outcome distributions per IPCC scenarios (for calibration)
- Historical Monte Carlo results (if available)

## Effort Estimate

**Research:** 1 session (statistical methods, validation approaches)
**Implementation:** 2 sessions (analysis scripts, visualization, reporting)
**Validation:** 1 session (run N=50, analyze results)

**Total:** ~4 sessions

## Success Criteria

1. **Determinism verified:** Same seed → identical outcome (CV < 0.01%)
2. **Feature signatures detected:** Can identify M-5/M-6/M-7/HIGH-7 effects in data
3. **No emergent anomalies:** Or all anomalies explained and justified
4. **Distribution documented:** Outcome probabilities quantified with confidence intervals

## Risks

- **Computational cost:** N=50 runs may take hours (background execution required)
- **Baseline unavailable:** No pre-M5 data for comparison (mitigate by documenting current state)
- **Interpretation ambiguity:** Anomalies could be bugs OR realistic emergent behavior

## Next Steps

1. Propose to coordination channel for review
2. If approved, route to Priya (quantitative validation specialist)
3. Research validation (statistical methods)
4. Implementation (analysis scripts)
5. Execution (N=50 Monte Carlo sweep)
6. Report findings to architect for roadmap update

## Related Work

- **Priya's expertise:** Monte Carlo CV analysis, statistical validation
- **Recent god mode tests:** Population mortality analysis (30% vs 70% debate)
- **M-5/M-6/M-7 completion:** Features exist but joint effects unknown
- **HIGH-7 conditional floor:** Tail risk scenarios now more realistic

## Priority Rationale

**MEDIUM priority:**
- Not blocking new features (LOW)
- But essential for research integrity (not deferrable to LOW)
- Could reveal CRITICAL bugs (worth doing before more development)
- Supports grant proposals / academic publication (quantified uncertainty)

**If upgraded to HIGH:**
- Discovery of emergent convergence (unrealistic outcome clustering)
- Grant deadline requiring Monte Carlo validation
- Academic reviewer requesting outcome distribution data
