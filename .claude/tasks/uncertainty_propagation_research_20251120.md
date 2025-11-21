# Uncertainty Propagation Research Task

## Context
Daily Review 20251120_060001 identified missing uncertainty propagation as MEDIUM priority research integrity issue. Existing research (AMOC, tipping points) provides uncertainty ranges, but simulation uses point estimates.

## What We Already Have
- ✅ AMOC temperature-dependent probability: research/amoc_collapse_probability_20251120.md
- ✅ Tipping point thresholds with ranges: research/climate_tipping_points_2024_2025_20251116.md
- ✅ Probability infrastructure: IceSheetState.collapseProbability, AMOCState (partial)

## Research Gaps to Fill

### 1. Climate Sensitivity Uncertainty (ECS/TCR)
**Current:** Likely using single ECS value
**Need:** IPCC AR6 ranges:
- Equilibrium Climate Sensitivity (ECS): What is current consensus range?
- Transient Climate Response (TCR): What is current consensus range?
- Distribution type: Normal? Log-normal?
- Impact on simulation: Does ECS uncertainty affect outcome classification?

**Sources needed:**
- IPCC AR6 WG1 Chapter 7 (Climate Sensitivity)
- Recent 2024-2025 refinements (if any)

### 2. Amazon Dieback Threshold Uncertainty
**Current:** Thresholds mentioned (20-25%, 1.5°C + 22% deforestation)
**Need clarity on:**
- Is 20-25% deforestation a RANGE or different regional thresholds?
- What's the probability distribution at 22% deforestation + 1.5°C?
- Is it binary flip or S-curve transition?

**Sources:** Check climate_tipping_points_2024_2025_20251116.md for distribution details

### 3. Ice Sheet Collapse Thresholds
**Current:** Point estimates visible in irreversibility.ts
**Need:**
- Greenland: "+0.8-3.2°C threshold" - what's the probability distribution?
- WAIS: "2.0-3.0°C" - distribution type?
- Current approach: Does simulation sample from this range or use midpoint?

### 4. Permafrost Carbon Release
**Current:** "Dimmer switch" model (good!)
**Need:**
- Total carbon pool uncertainty: 1,460-1,600 Gt C (Nature 2022) - is this modeled?
- Release rate uncertainty at different warming levels
- Methane vs CO2 fraction uncertainty

### 5. Sea Level Rise Commitment
**Current:** Fixed values (7.2m Greenland, 3.3m WAIS)
**Need:**
- What's the uncertainty range on these commitments?
- IPCC AR6 ranges for SLR projections

## Implementation Constraints
- **Deterministic RNG required:** All sampling must use seeded RNG
- **Monte Carlo compatibility:** Uncertainty propagation cannot break reproducibility
- **Computational tractability:** N=100 Monte Carlo runs should complete in reasonable time

## Deliverables

Research report: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/uncertainty_propagation_climate_parameters_20251120.md`

Must include:
1. **Parameter inventory:** Which parameters currently use point estimates vs ranges
2. **Uncertainty quantification:** For each parameter, what's the literature-reported range and distribution?
3. **Impact prioritization:** Which uncertainties affect outcome classification most?
4. **Implementation recommendation:** 
   - Parameter sampling (draw values at start of each run)
   - Scenario approach (discrete scenarios: optimistic/central/pessimistic)
   - Sensitivity analysis (vary one parameter at a time)
   - Hybrid approach (sample some, fix others)

## Success Criteria
- 5-10 parameters identified with specific uncertainty ranges
- Each parameter has distribution type (uniform, normal, log-normal, beta, etc.)
- Clear prioritization: HIGH impact (affects outcomes) vs LOW impact (minor variance)
- Practical implementation path that maintains determinism

---
**Spawned by:** orchestrator-1
**Date:** 2025-11-20 22:00 UTC
**Priority:** MEDIUM (research integrity)
**Next step:** Research findings → research-skeptic validation
