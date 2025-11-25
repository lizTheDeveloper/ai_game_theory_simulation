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

## Diagnostic Findings (Nov 24, 2025)

**From hindcast_diagnostic_2025-11-24T02-15-29.log:**

### Timeline of Collapse
1. **Month 3 (early 1990):** First major population decline, pop 5.201B
2. **Month 11 (late 1990):** Conflict risk spikes to 40.4%, pop 4.973B
3. **Month 58-68 (1994-1995):** Climate risk increases to 9.8%, pop drops to 3.3B
4. **Month 285+ (2013+):** Climate risk dominates at 47-59%, accelerating collapse
5. **Final:** Population 0.01B (vs historical 7.2B for 2014)

### Root Cause Breakdown

**Cumulative Risk Contribution:**
- `climate`: 8692.1% - **PRIMARY CAUSE**
- `conflict`: 208.1% - Secondary factor

### Specific Parameter Issues

1. **Climate Mortality Too Aggressive:**
   - Historical 1990-2010 period had ~0.45-0.85°C warming
   - Model treats this as catastrophic
   - Climate risk reaches 47-59% at 2.1°C, but this is unrealistic for 1990s

2. **Conflict Mortality Too High:**
   - 40% conflict risk in 1990 when actual post-Cold War period was relatively peaceful
   - No AI agents → No AI-mediated conflict resolution → Higher baseline

3. **Missing Historical Resilience:**
   - Humanity survived 1990-2024 without AI
   - Model assumes AI is necessary for baseline survival
   - Need era-specific stabilizer coefficients

### Recommended Calibration Targets

| Parameter | Current | Suggested Historical (1990-2010) |
|-----------|---------|----------------------------------|
| Climate mortality activation | ~1.5°C | ~3.0°C (pre-adaptation) |
| Conflict baseline risk | High | Low (Cold War ended) |
| Era-specific stabilizer | N/A | Add 2x resilience for pre-AI era |

### Files to Modify

1. `src/simulation/engine/phases/ClimateMortalityPhase.ts` - Temperature thresholds
2. `src/simulation/engine/phases/ConflictPhase.ts` - Conflict baseline rates
3. `src/types/config.ts` - Add HISTORICAL_ERA_MULTIPLIER
4. `src/simulation/initialization.ts` - Apply era-specific params when historical mode
