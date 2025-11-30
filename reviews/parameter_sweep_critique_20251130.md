# Parameter Sweep Methodology Critique
**Date:** November 30, 2025
**Reviewer:** Sylvia (research-skeptic)
**Verdict:** PASS with CAUTIONS ⚠️

## CRITICAL Issues: None ✅

Methodology is sound. Cynthia found appropriate sources. Proceed to implementation.

## HIGH Priority Cautions

### 1. Parameter Correlation Assumption
**Claim:** "Treat parameters as independent"
**Reality:** Climate parameters are physically coupled

**Risk:** Sobol indices assume independence. Correlated parameters inflate total-effect indices.

**Evidence:**
- Climate sensitivity ↔ carbon cycle feedbacks (Friedlingstein et al., 2023)
- Demographic transitions ↔ emissions trajectories (obvious coupling)

**Mitigation:** Document as limitation. Phase 2: Vine copulas if needed.

### 2. Sample Size vs Dimensionality
**Claim:** N=200 sufficient for 7 parameters
**Caution:** LHS efficiency degrades in high dimensions

**Cynthia found:** "When total uncertainty explored using full parameter space, LHS stratified sampling performed poorly, likely due to increase in dimensionality" [4]

**Counter:** 7 parameters is NOT high-dimensional. Concern applies at k>20.

**Verdict:** N=200 is fine. Watch for poor space-filling in diagnostics.

### 3. Outcome Distribution May Be Multimodal
**Assumption:** Report median + 90% CI
**Risk:** If outcomes bimodal (utopia vs collapse), median may not represent typical path

**Recommendation:**
- Plot full distribution
- Check for multimodality
- Report modes separately if found

### 4. Hindcast vs Forecast Uncertainty
**What you're testing:** Parameter uncertainty in hindcast (1990-2024)
**What users care about:** Parameter uncertainty in forecast (2025-2100)

**Gap:** Hindcast uncertainty ≠ forecast uncertainty (bifurcations amplify later)

**Mitigation:** Explicitly state "this quantifies hindcast robustness, not forecast prediction"

## MEDIUM Priority Notes

### Computational Cost
1,800 runs × 420 months = 756k simulations

**Cynthia says:** "feasible on current hardware"
**Sylvia says:** Define "feasible" - how many hours? Days?

**Recommendation:** Run N=10 pilot to estimate wall-clock time before N=200 commitment.

## Quality Gate: PASS ✅

**Proceed to implementation. Address HIGH cautions in methodology section.**

## What I'd Do Differently

1. Start with N=50 to validate LHS space-filling
2. Check for parameter correlations in pilot data
3. Plot outcome distribution before reporting quantiles
4. Time-box execution (if >24 hours, reduce N or parallelize)

## Approval

Methodology is research-backed and appropriate. Cynthia's sources are solid.

**CRITICAL issues:** None
**HIGH cautions:** Documented above
**Blocker:** No

**Status:** PROCEED to Priya for implementation

---

**Sylvia's Note:** This is exactly the kind of honest uncertainty quantification we should have done from the start. Good call prioritizing this to HIGH.
