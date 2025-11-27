# HIGH-7: Population Mortality Calibration - Diagnostic Report

**Date:** November 27, 2025
**Issue:** Population mortality system calibrated for CRISIS scenarios, not BASELINE historical
**Severity:** HIGH-7 (-76% error, most severe calibration error)

## Problem Statement

Simulated population in historical mode (1990-2024) is 1.22B-3.44B instead of actual 8.12B.
- **Absolute error:** -6.1B (-76.2%)
- **Expected 1990-2024:** +52.8% growth (5.32B → 8.12B)
- **Actual simulated:** -75% to -58% decline

## Diagnostic Findings

### ✅ Correctly Disabled Systems

1. **BaselineMortalityPhase** (order 34.8): Correctly disabled for historical mode <= 2024
2. **BayesianMortalityResolutionPhase** (order 35.0): Correctly disabled for historical mode <= 2024
3. **FamineSystemPhase** (order 21.6): Correctly disabled for historical mode <= 2024
4. **HumanSurvivalSystemPhase** (order 21.51): Correctly disabled for historical mode < 2020

### ⚠️ Regional vs Global Population Discrepancy

**Monthly population dynamics (1990-01):**

**Regional calculations (from diagnostic):**
- Total births: 12.0M/month
- Total deaths: 4.6M/month
- Net growth: +7.4M/month (+1.67% annual)

**Actual population change:**
- 5.320B → 5.318B = -2.0M/month (-0.45% annual)

**DISCREPANCY:** +7.4M (expected) vs -2.0M (actual) = **9.4M missing per month**

### Sub-Saharan Africa Detailed Analysis

**Historical parameters (1990):**
- TFR: 6.35 (initialized correctly)
- CBR: 47.3/1000 = 4.73% annual (correct from UN WPP 2024)
- CDR: 15.6/1000 = 1.56% annual (expected from UN WPP 2024)
- **Diagnostic shows:** 1.75% death rate (WRONG - too high)

**Net growth (expected):**
- 4.73% - 1.56% = 3.17% annual = 0.26% monthly = **GROWTH**

**Net growth (observed):**
- Population declining globally at -0.03% monthly

## Root Cause Hypotheses

### Hypothesis 1: Regional Aggregation Bug
**Evidence:** Regional system calculates +7.4M net, but global population decreases -2.0M
**Suspect code:** `src/simulation/regionalPopulations.ts` lines 800-826
**Test:** Verify that `totalPopulation` sum matches sum of `region.population` values

### Hypothesis 2: Hidden Population-Modifying Phase
**Evidence:** Something between HumanPopulationPhase (20.52) and end of step is modifying population
**Suspect phases (order 20.53-35.0):**
- InternationalMigrationPhase (20.53)
- RefugeeCrisisPhase (20.6)
- MortalityStabilizersPhase (20.8)
- CoordinatedDeploymentPhase (10.5) - runs BEFORE, writes to population but shouldn't affect historical mode

**Test:** Add logging to each phase that reads/writes `humanPopulationSystem.population`

### Hypothesis 3: Death Rate Calibration Error
**Evidence:** Diagnostic shows 1.75% death rate vs expected 1.56% for SSA
**Suspect code:** Historical CDR scaling in `regionalPopulations.ts` lines 622-661
**Test:** Verify `getRegionalHistoricalDeathRate('Sub-Saharan Africa', 1990)` returns 15.6

### Hypothesis 4: Birth Rate Calibration Error
**Evidence:** Diagnostic shows 4.73% birth rate (correct), but calculation may be wrong
**Suspect code:** Direct historical CBR mode in `regionalPopulations.ts` lines 458-492
**Test:** Verify actual births applied match expected from CBR

## Next Steps

1. **Add detailed phase-by-phase logging** to track population changes:
   ```typescript
   console.log(`[Phase ${this.id}] Pop before: ${state.humanPopulationSystem.population.toFixed(3)}B`);
   // ... phase logic ...
   console.log(`[Phase ${this.id}] Pop after: ${state.humanPopulationSystem.population.toFixed(3)}B`);
   ```

2. **Verify regional aggregation** is correct:
   - Check that `totalPopulation` sum equals individual regional populations
   - Verify millions → billions conversion (line 808: `/ 1000`)

3. **Test historical CDR/CBR functions** in isolation:
   - `getRegionalHistoricalBirthRate('Sub-Saharan Africa', 1990)` should return 47.3
   - `getRegionalHistoricalDeathRate('Sub-Saharan Africa', 1990)` should return 15.6

4. **Add assertions** to catch population decreases in historical mode:
   ```typescript
   if (state.config.scenarioMode === 'historical' && state.currentYear <= 2024) {
     if (popAfter < popBefore) {
       console.warn(`⚠️ Population decreased in historical mode: ${popBefore.toFixed(3)}B → ${popAfter.toFixed(3)}B`);
     }
   }
   ```

5. **Run Monte Carlo with detailed logging** to verify fix effectiveness

## Diagnostic Tools Created

- **`scripts/diagnosticHistoricalMortality.ts`**: Month-by-month population trace for 1990-1995
  - Logs births, deaths, net growth per month
  - Checks Bayesian mortality status
  - Validates expected vs actual population changes
  - Currently saves to `/logs/diagnostic_high7.log`

## Research References

- **UN World Population Prospects 2024:** Verified historical CDR/CBR data
  - SSA 1990 CBR: 47.3/1000 (births)
  - SSA 1990 CDR: 15.6/1000 (deaths)
  - Net growth: 3.17% annual
- **`research/hindcast_calibration_parameters_20251127.md`** lines 107-226: Demographic parameters
- **`reviews/climate_hindcast_validation_phase10_20251127.md`** lines 70-97, 187-198: Validation results

## Files Involved

**Core mortality system:**
- `src/simulation/engine/phases/BaselineMortalityPhase.ts` - Historical CDR/CBR functions
- `src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` - Mortality resolution
- `src/simulation/regionalPopulations.ts` - Regional demographics

**Config:**
- `src/types/config.ts` - ERA_MORTALITY_MULTIPLIERS (line 337-346)

**Phase execution:**
- `src/simulation/engine/PhaseOrchestrator.ts` - Orchestrates 37 phases per step

## Status

🔍 **IN PROGRESS** - Diagnostic complete, root cause identified (9.4M population discrepancy), fix in progress.

**Effort estimate:** 6-8 hours (4 hours spent on diagnosis, 2-4 hours remaining for fix + validation)
