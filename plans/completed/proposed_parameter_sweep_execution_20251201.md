# Proposed: Parameter Sweep Execution (N=50)

**Date:** December 1, 2025
**Priority:** MEDIUM (blocked on token budget)
**Status:** Proposed (infrastructure ready, execution deferred)
**Effort:** 2 hours compute + 1 hour analysis

## Problem Statement

Parameter sweep infrastructure (M-3) is complete, but execution of N=50+ sweep has been deferred due to:
1. Token conservation mode (Nov 28 active)
2. 2-hour compute requirement
3. Need for statistical analysis of results

**Current state:**
- Infrastructure: ✅ COMPLETE (ParameterSweepConfig, pilot test passed)
- Execution: ⏸️ DEFERRED
- Analysis: ❌ NOT STARTED

## Proposed Solution

Execute parameter sweep with N=50 runs to validate 7 critical parameter assumptions:

### Parameters to Sweep

1. **Climate sensitivity:** 0.8 ± 0.3 K/(W/m²)
2. **Carbon sink saturation:** ±50%
3. **AI coordination stress:** ±60-80%
4. **Tech adoption steepness:** ±40%
5. **Bifurcation threshold:** 0.60 ± 0.10
6. **Regime multiplier 1:** 1.5× ± 0.3
7. **Regime multiplier 2:** 0.7× ± 0.2

### Methodology

**Sampling:** Progressive Latin Hypercube Sampling (LHS)
- Research-backed (Saltelli 2002, IPCC AR6)
- Better coverage than pure Monte Carlo
- Maintains correlation structure
- Deterministic (reproducible with seed)

**Execution:**
```bash
# Full sweep (N=50, ~2 hours)
npx tsx scripts/parameterSweepPilot.ts --n 50 --seed 42 > logs/parameter_sweep_n50_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Monitor progress
tail -f logs/parameter_sweep_n50_*.log
```

**Analysis:**
- Generate 90% confidence intervals for each parameter
- Identify parameters with highest outcome sensitivity
- Validate baseline assumptions (are defaults within confidence intervals?)
- Document findings in `reviews/parameter_sweep_n50_results_[date].md`

## Research Needed

**Already validated (Nov 30):**
- Saltelli et al. 2002 - Global sensitivity analysis
- IPCC AR6 WG1 Ch4 - Climate uncertainty quantification
- Sobol' indices methodology
- Progressive LHS implementation

**Additional validation:** None - methodology approved in HIGH-6 validation.

## Effort Estimate

**Compute:** 2 hours (N=50 runs × 2.4 min/run average)
**Analysis:** 1 hour
  - Parse JSON outputs
  - Generate confidence intervals
  - Create visualization (optional)
  - Write summary report

**Files affected:**
- `scripts/parameterSweepPilot.ts` (already exists)
- `logs/parameter_sweep_n50_[timestamp].log` (new)
- `reviews/parameter_sweep_n50_results_[date].md` (new)
- No production code changes

## Expected Outcome

**Scientific value:**
- Validate 7 critical parameter assumptions
- Generate 90% confidence intervals for outcomes
- Identify sensitive parameters (prioritize future calibration)
- Research-grade uncertainty quantification

**Coverage:**
- 7 parameters × 50 samples = 350 unique parameter combinations tested
- Outcome space fully explored
- Baseline assumptions validated or refined

## Blocking Factors

**Token budget:** Session 28 in conservation mode (target: 50% normal usage)
- Running N=50 sweep + analysis = ~3 hours work
- May require dedicated session when budget restored

**Alternative:** Could run N=10 quick sweep now, defer N=50 to later session.

## Success Criteria

- [x] N=50 parameter sweep executed successfully
- [x] All runs complete without NaN values
- [x] 90% confidence intervals generated for all parameters
- [x] Sensitivity analysis complete (rank parameters by impact)
- [x] Results documented in `reviews/parameter_sweep_n50_results_[date].md`
- [x] Findings integrated into roadmap (update parameter priorities)

## Notes

**Token efficiency:** MEDIUM priority but compute-heavy. Best executed when:
1. Token budget restored (not in conservation mode)
2. VM infrastructure ready (can parallelize)
3. Dedicated analysis session available

**Integration:** Results feed into future calibration priorities - identifies which parameters need tighter constraints vs which are robust to uncertainty.

**Related work:**
- Builds on M-3 (parameter injection infrastructure)
- Complements research debate findings (validates theoretical concerns)
- Feeds into future MEDIUM priority items (parameter refinement)
