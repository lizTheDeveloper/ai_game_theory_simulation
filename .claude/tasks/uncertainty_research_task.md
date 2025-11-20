# Task: Uncertainty Propagation Research

## Context
Daily Review 20251120_060001 identified missing uncertainty propagation as a MEDIUM priority research integrity issue. The simulation currently uses point estimates for parameters where the literature reports ranges with significant uncertainty.

## Objective
Research uncertainty ranges for critical climate parameters in the simulation, focusing on those that affect outcome classification (utopia vs collapse vs extinction).

## Specific Research Questions

1. **AMOC Threshold Uncertainty**
   - Current model uses point estimate for AMOC collapse threshold
   - What is the literature-reported uncertainty range?
   - Key sources to check: Jackson et al. 2023, Boulton et al. 2014

2. **Climate Tipping Point Uncertainties**
   - What are the reported uncertainty ranges for major tipping points?
   - Ice sheet collapse thresholds (Greenland, West Antarctic)
   - Permafrost methane release
   - Amazon dieback
   - Focus on 2024-2025 literature (IPCC AR6 WG1 if recent)

3. **Climate Sensitivity (ECS/TCR)**
   - Current IPCC AR6 ranges for equilibrium climate sensitivity
   - Transient climate response ranges
   - Impact of using point estimates vs ranges on long-term projections

4. **Critical Parameter Identification**
   - Which parameters have the widest uncertainty ranges relative to their impact?
   - Where does parameter uncertainty matter most for simulation outcomes?
   - Prioritize parameters that affect outcome bifurcation points

## Required Outputs

For each identified parameter:
1. **Literature-reported uncertainty range** (with 2+ peer-reviewed sources from 2024-2025)
2. **Point estimate currently used** in simulation (if applicable)
3. **Justification** for why uncertainty range matters for this parameter
4. **Distribution type** (normal, uniform, log-normal, etc.) if reported in literature
5. **Correlation** with other uncertain parameters (if known)
6. **Impact on outcomes:** Does uncertainty range affect outcome classification?

## Implementation Constraints

- Must maintain **deterministic RNG usage** (no breaking Monte Carlo reproducibility)
- Focus on climate/environmental parameters (social/economic have separate modeling)
- Parameters should affect outcome classification (utopia vs collapse vs extinction)
- Uncertainty propagation approach should be computationally tractable

## Deliverable

Research report saved to: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/uncertainty_propagation_YYYYMMDD.md`

Including:
- 5-10 key parameters with uncertainty ranges
- Each parameter with 2+ peer-reviewed sources (2024-2025 preferred)
- Impact assessment: which uncertainties matter most?
- Recommendations for implementation approach (parameter sampling, scenarios, sensitivity analysis)

## Success Criteria

- All parameters have peer-reviewed source citations (2024-2025 preferred)
- Clear prioritization: which uncertainties are critical vs nice-to-have
- Implementation recommendations are practical and maintain determinism
- Research quality passes research-skeptic validation

---

**Spawned by:** orchestrator
**Date:** 2025-11-20
**Priority:** MEDIUM (research integrity)
**Next:** Research findings → research-skeptic validation → implementation design
