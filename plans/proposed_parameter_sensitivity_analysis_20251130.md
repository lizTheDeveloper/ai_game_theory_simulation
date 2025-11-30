# Proposed: Parameter Sensitivity Analysis Framework

**Date:** November 30, 2025
**Author:** Autonomous Worker (Fallback Planning)
**Status:** PROPOSED
**Priority:** HIGH (research integrity)
**Effort:** 12-16 hours (design + implementation + validation)

## Problem Statement

The simulation has 71 technologies, 17-dimensional AI capabilities, 17-dimensional QoL metrics, planetary boundaries, and hundreds of tunable parameters. We don't systematically understand which parameters drive outcomes.

**Current State:**
- Parameters set from research papers (good!)
- No systematic sensitivity analysis (bad!)
- Don't know which parameters matter most
- Can't quantify uncertainty ranges
- Parameter interactions unexplored

**Impact:**
- Unknown robustness of findings
- Can't prioritize research validation efforts
- Risk of conclusions driven by arbitrary parameter choices
- Missing opportunity for meta-analysis

## Proposed Solution

**Phase 1: Parameter Identification & Classification**
1. Audit all tunable parameters in simulation
2. Classify by domain (climate, AI, social, economic, tech)
3. Document current values + research sources
4. Identify parameters with weak/no citations

**Phase 2: Sensitivity Analysis Infrastructure**
1. Create parameter sweep script (Latin Hypercube Sampling)
2. Define outcome metrics (mortality, QoL, tech deployment, extinction risk)
3. Run N=100 Monte Carlo for each parameter variation
4. Output: Parameter → Outcome correlation matrix

**Phase 3: Meta-Analysis**
1. Identify high-leverage parameters (top 10% by outcome variance)
2. Test parameter interactions (2-way correlations)
3. Generate parameter uncertainty bounds
4. Produce research validation priority list

**Phase 4: Documentation & Integration**
1. Document findings in research/parameter_sensitivity_analysis_[date].md
2. Flag high-leverage parameters in code comments
3. Update roadmap with research validation tasks
4. Create reproducible analysis pipeline

## Expected Outputs

1. **Parameter Registry** - Complete list of tunable parameters with metadata
2. **Sensitivity Matrix** - Which parameters affect which outcomes
3. **High-Leverage List** - Top 20 parameters needing research validation
4. **Uncertainty Bounds** - Confidence intervals for key parameters
5. **Research Priorities** - Where to focus validation efforts next

## Research Needs

**Methods:**
- Saltelli et al. (2019) - Global sensitivity analysis methods
- Sobol indices for variance decomposition
- Morris screening for parameter prioritization
- Latin Hypercube vs Sobol sequences (efficiency)

**Domain-Specific:**
- Climate parameter uncertainty (IPCC AR6 WG1)
- AI capability forecasting uncertainty (Metaculus, forecasting research)
- Social dynamics parameter ranges (empirical sociology)

## Dependencies

- Monte Carlo infrastructure (✅ exists)
- Parallel worker setup (⏳ HIGH-3 prerequisite)
- Research validation pipeline (✅ exists)

## Benefits

1. **Research Integrity** - Know which parameters need strongest validation
2. **Robustness** - Understand if conclusions hold across parameter ranges
3. **Transparency** - Document uncertainty explicitly
4. **Efficiency** - Focus research efforts on high-leverage parameters
5. **Meta-Analysis** - Enable systematic parameter review

## Risks

- **Computational Cost** - N=100 × 50 parameters = 5,000 Monte Carlo runs (mitigate: parallel workers)
- **Interpretation Complexity** - Interaction effects hard to visualize (mitigate: start with 1-way sensitivity)
- **Scope Creep** - Could become endless parameter exploration (mitigate: focus on outcome metrics)

## Next Steps

1. Create `scripts/parameterSensitivityAnalysis.ts`
2. Document parameter registry in `docs/PARAMETER_REGISTRY.md`
3. Run initial 1-way sensitivity sweep (climate parameters first)
4. Review findings with Cynthia + Sylvia
5. Expand to AI/social/economic parameters

## Assignee Recommendation

- **Primary:** Priya (quantitative validation specialist)
- **Support:** Cynthia (research validation), Roy (parameter implementation)
- **Review:** Sylvia (sensitivity to hidden assumptions)

---

**Why This Matters:**

The Nov 26-29 validation sprint showed that small parameter changes (carbon sink values, regime multipliers) had major impacts on outcomes. We need systematic parameter sensitivity analysis to understand what drives the model and where research validation is most critical.

**This is the difference between a research tool and a black box.**
