# Parameter Sweep Monte Carlo Analysis

**Status:** PROPOSED (Nov 30, 2025)
**Priority:** HIGH
**Estimated Effort:** 8-12 hours (compute-bound)
**Rationale:** Research integrity - validate MEDIUM-confidence parameters identified in Session 18 debate

## Problem Statement

First utopia achieved (22.4% mortality, run 42007) but we cannot explain WHY. Research debate identified ±37.5% uncertainty in core parameters:
- ECS (climate sensitivity): 2.5-4.5°C
- AMOC threshold: 2.5-5.5°C
- WAIS threshold: 2.0-3.0°C
- Amazon tipping: 20-25% deforestation
- Aid effectiveness: 0.8-1.2× baseline

Current Monte Carlo runs use single point estimates from these ranges. We don't know if results are robust across parameter space.

## Proposed Solution

**Phase 1: Parameter Space Definition** (1-2h)
- Document all MEDIUM/HIGH uncertainty parameters
- Define sampling strategy (Latin Hypercube vs Sobol sequences)
- Identify correlations (e.g., ECS-TCR coupling)

**Phase 2: Sweep Infrastructure** (2-3h)
- Create `scripts/parameterSweepMonteCarlo.ts`
- Extend uncertainty sampling to support parameter space exploration
- Output format: JSON with full parameter vector + outcomes

**Phase 3: Execution** (4-6h compute time)
- N=100 runs across parameter space
- Stratified sampling to ensure coverage
- Log parameter-outcome pairs for regression analysis

**Phase 4: Analysis** (2-3h)
- Identify parameter sensitivities (Sobol indices)
- Find critical parameters driving bifurcation
- Document robust vs fragile outcomes
- Save to `reviews/parameter_sensitivity_analysis_YYYYMMDD.md`

## Expected Outcomes

1. **Robustness validation:** Are current results artifact of parameter choice?
2. **Critical path identification:** Which parameters matter most?
3. **Uncertainty quantification:** What's the outcome distribution across parameter space?
4. **Research priorities:** Which parameters need better empirical grounding?

## Research Foundation

- Saltelli et al. (2008): Global Sensitivity Analysis
- Herman & Usher (2017): SALib Python library patterns
- IPCC AR6 uncertainty guidance (2021)

## Success Criteria

- [ ] N≥100 runs across parameter space
- [ ] Sobol sensitivity indices calculated
- [ ] Critical parameters identified (S1 > 0.1)
- [ ] Bifurcation robustness quantified
- [ ] Report: `reviews/parameter_sensitivity_analysis_YYYYMMDD.md`

## Dependencies

- Deterministic RNG (✅ operational)
- Uncertainty parameter sampling (✅ operational)
- Monte Carlo infrastructure (✅ operational)

## Risks

- **Compute time:** 100 runs × 5min = 8.3h runtime
- **Storage:** 100 × 50MB logs = 5GB
- **Analysis complexity:** Multivariate sensitivity analysis requires statistical expertise

## Mitigation

- Run overnight/weekend
- Stream logs to disk, aggregate after
- Spawn Priya (quantitative validator) for analysis
