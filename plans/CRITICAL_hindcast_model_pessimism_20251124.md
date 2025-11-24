# CRITICAL: Hindcast Model Pessimism

**Date:** November 24, 2025
**Priority:** CRITICAL
**Status:** OPEN - Requires calibration work

## Problem Statement

The hindcasting validation framework reveals that the simulation model is **catastrophically pessimistic** for historical conditions. When initialized to 1990 values, the model predicts population collapse to ~1 million people by 2022, when actual 2024 population is 8.12 billion.

## Evidence

**Hindcast Results (Nov 24, 2025):**
- **Starting year:** 1990
- **Starting population:** 5.33B (historical)
- **Failure point:** Months 384-395 (year 2022-2023)
- **Population at failure:** ~0.001B (1 million people)
- **Expected 2024 population:** 8.12B

**All 10 Monte Carlo runs fail** with the same pattern:
- Population collapse begins around month 300-350 (~2015-2019)
- Accelerates to near-extinction by month 385-395 (~2022-2023)

## Root Cause Analysis

The model's mortality/crisis mechanisms are calibrated for **future AI-era catastrophic scenarios**, not historical baseline conditions. Specifically:

1. **No AI technology available** - Historical mode disables AI agents (correct for pre-2018)
2. **Crisis mechanisms too aggressive** - Climate, economic, social crises compound without AI-assisted solutions
3. **Mortality rates too high** - Baseline mortality doesn't match historical demographic data
4. **Missing stabilization mechanisms** - Historical humanity survived without AI; model doesn't capture pre-AI resilience

## Affected Systems

1. `src/simulation/populationDynamics.ts` - Mortality calculations
2. `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts` - Survival mechanics
3. `src/simulation/engine/phases/MortalityStabilizersPhase.ts` - Stabilizer coefficients
4. Regional population systems - Death rate calculations

## Required Actions

### Phase 1: Diagnostic (1-2 days)
- [ ] Add detailed per-month logging to identify when/why deaths spike
- [ ] Identify which crisis type (climate, economic, social, nuclear) causes collapse
- [ ] Check mortality multipliers against historical data

### Phase 2: Calibration (2-3 days)
- [ ] Research historical mortality rates 1990-2024
- [ ] Adjust crisis thresholds for pre-AI era
- [ ] Add era-specific parameter scaling (1990 values vs 2025 values)
- [ ] Validate stabilizer coefficients against Xia/Shi papers

### Phase 3: Validation (1-2 days)
- [ ] Run hindcast with calibrated parameters
- [ ] Verify population trajectory matches historical data within ±20%
- [ ] Run Monte Carlo to ensure stability

## Acceptance Criteria

1. Hindcast starting from 1990 should reach 2024 with population 6-10B
2. Key metrics (CO2, temperature, population) should be within 20% of observed values
3. No mass extinction events in historical baseline scenario

## References

- `scripts/hindcastValidation.ts` - Hindcast runner
- `src/simulation/historicalInitialization.ts` - Historical state setup
- `research/hindcast_baseline_data_20251124.md` - Historical data sources
- `reviews/hindcast_methodology_critique_20251124.md` - Methodology review

## Technical Notes

**This is not a bug but a calibration issue.** The model is designed for AI-era scenarios and hasn't been calibrated for historical (pre-AI) conditions. The hindcast reveals this gap.

**Implication:** If the model can't reproduce known history, predictions about the future are suspect (per research-skeptic's Quality Gate 2 criteria).
