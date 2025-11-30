# Proposed: Parameter Sweep Monte Carlo for Uncertainty Quantification
**Date:** November 28, 2025
**Priority:** HIGH (from research debate action items)
**Assignee:** priya (Quantitative Validator)
**Effort:** 8-12 hours (4-6 hours setup, 4-6 hours execution + analysis)

## Problem Statement

**Current State:**
- Simulation reports 73% HIGH confidence, 27% MEDIUM confidence parameters
- Research debate (Sylvia vs Cynthia) revealed this may be overconfident
- Layer 2 Debate found "High-Impact Claim Support Rate: Only 20%"
- We report point estimates without uncertainty bands

**Impact:**
- Users may mistake exploration tool for prediction engine
- Cannot quantify how parameter uncertainty affects outcomes
- Unknown sensitivity to MEDIUM confidence parameters
- Violates best practices for research simulation reporting

## Proposed Solution

**Technique:** Latin Hypercube Sampling (LHS) Monte Carlo with parameter sweeps

**Approach:**
1. Identify 27% MEDIUM confidence parameters (from research audit)
2. Define uncertainty ranges for each (typically ±50% for MEDIUM confidence)
3. Use LHS to sample parameter space efficiently (N=100-500 runs)
4. Run hindcast validation (1990-2024) with each parameter set
5. Calculate 90% confidence intervals for:
   - Temperature (2024 endpoint)
   - Population (2024 endpoint)
   - Biodiversity (2024 endpoint)
   - Overall deviation metric
6. Identify which parameters drive most uncertainty (sensitivity analysis)

**Key Parameters to Vary (MEDIUM Confidence):**
- Climate sensitivity (λ): 0.8 ± 0.3 K/(W/m²)
- Carbon sink saturation rates: ±50%
- AI coordination stress weights: ±60-80% (per research audit)
- Technology adoption S-curve steepness: ±40%
- Regional demographic transition rates: ±30%
- Biodiversity recovery timescales: ±50%
- Ocean acidification feedback strength: ±40%

## Expected Results

**Confidence Intervals (Predicted):**
- Temperature 2024: 1.28°C ± 0.15°C (90% CI)
- Population 2024: 8.12B ± 0.8B (90% CI)
- Biodiversity 2024: 49% ± 8% (90% CI)
- Overall deviation: 29.3% ± 12% (90% CI)

**Sensitivity Analysis:**
- Rank parameters by impact on outcomes
- Identify which MEDIUM confidence parameters matter most
- Guide future research priorities (focus on high-impact uncertain params)

## Research Needed

**Sources:**
- Saltelli et al. (2008) - Global Sensitivity Analysis (standard reference)
- McKay et al. (1979) - Latin Hypercube Sampling (original paper)
- IPCC AR6 WG1 Chapter 7 - Climate sensitivity uncertainty quantification
- UN DESA demographic projections - Uncertainty methodology

**Best Practices:**
- LHS more efficient than pure Monte Carlo (fewer samples for same coverage)
- Sobol indices for sensitivity analysis (variance decomposition)
- Report median + 90% CI (not mean, due to skewed distributions)
- Document correlation assumptions (parameters not all independent)

## Implementation Scope

**New Script:** `scripts/parameterSweepMonteCarlo.ts`
- Input: Parameter ranges from config
- Sampling: LHS implementation or library (latin-hypercube-sampling npm package)
- Execution: N=100-500 hindcast runs (1990-2024)
- Analysis: Calculate quantiles, Sobol indices, correlation matrices
- Output: JSON results + markdown report

**Integration:**
- Extend existing hindcast validation infrastructure
- Reuse Monte Carlo runner from HIGH-10
- Add parameter sampling layer
- Report uncertainty in all future validation

## Expected Impact

**Immediate:**
- Honest uncertainty reporting (research integrity)
- Identify high-impact uncertain parameters (research priority guidance)
- Validate whether 73% HIGH confidence claim is justified

**Long-term:**
- Future scenario runs report 90% CI automatically
- Users understand "exploration tool not prediction engine" distinction
- Research priorities driven by sensitivity analysis

## Timeline

**Phase 1: Setup (4-6 hours)**
- Identify 27% MEDIUM confidence parameters
- Define uncertainty ranges (research-backed)
- Implement LHS sampling
- Test with N=10 runs

**Phase 2: Execution (4-6 hours)**
- Run N=100-500 parameter sweep
- Calculate confidence intervals
- Sobol sensitivity analysis
- Generate report

**Validation:**
- Check if 90% CI contains observed 2024 values
- Verify sensitivity rankings match intuition
- Compare to existing validation sprint results

## Complexity

**Level:** MODERATE (6/10)

**Dependencies:**
- Existing hindcast validation infrastructure ✅
- Monte Carlo runner (HIGH-10) ✅
- Parameter uncertainty ranges (research audit) ✅

**Risks:**
- Computational cost (N=500 runs × 35 years = 17,500 months simulated)
- Correlations between parameters (may need expert elicitation)
- Interpretation complexity (Sobol indices require statistical expertise)

## Priority Justification

**Why HIGH Priority:**
1. Research debate consensus (Sylvia + Cynthia both agree)
2. Addresses Layer 2 Debate finding (20% support vs 73% claim)
3. Required for honest reporting (research integrity)
4. Guides future research priorities (high-impact sensitivity)
5. Validates epistemic status ("exploration tool" framing)

**Why NOT CRITICAL:**
- Simulation already validated at point estimates (29.3% deviation)
- Does not block other work
- Uncertainty quantification is enhancement, not bug fix

## Success Criteria

1. ✅ 90% confidence intervals calculated for all 4 key metrics
2. ✅ Sensitivity analysis identifies top 5 high-impact parameters
3. ✅ Observed 2024 values fall within 90% CI
4. ✅ Report clearly documents uncertainty (not point estimates)
5. ✅ Future validation includes CI by default

## References

- Research debate synthesis: `reviews/research_debate_synthesis_20251128.md`
- Research validation audit: `reviews/research_source_validation_audit_20251128.md`
- Sylvia's critique: `reviews/SYLVIA_DEBATE_POSITION_20251128.md` (compound uncertainty analysis)
- Cynthia's response: `reviews/CYNTHIA_DEBATE_RESPONSE_20251128.md` (correlated parameters)
