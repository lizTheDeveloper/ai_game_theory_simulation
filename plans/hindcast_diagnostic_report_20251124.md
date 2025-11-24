# Hindcast Diagnostic Report - Phase 1 Complete

**Date:** November 24, 2025
**Author:** Roy (Simulation Maintainer)
**Status:** DIAGNOSTIC COMPLETE - Ready for Phase 2 (Calibration)

## Executive Summary

The hindcast diagnostic has identified **FIVE ROOT CAUSES** for the catastrophic pessimism in the 1990-2024 hindcast. Population collapses from 5.3B to under 1B by month 150 (year 2002) instead of growing to 8.12B by 2024.

**Primary Finding:** The mortality is NOT coming from the Bayesian mortality system (which shows 0 risks after Month 0), but from:
1. Incorrect initialization of climate state
2. Excessive baseline regional death rates
3. Food security decay that's too fast
4. Missing population growth mechanics
5. Climate stability miscalculation

## Diagnostic Evidence

### Timeline of Collapse

| Month | Year | Population | Deaths/Month | Key Observation |
|-------|------|------------|--------------|-----------------|
| 0 | 1990 | 5.30B | 9.22M | Temperature JUMPS to 1.31C (should be 0.45C) |
| 1 | 1990 | 5.25B | 67.71M | Climate stability = 0.0% (should be ~70%) |
| 12 | 1991 | 5.02B | 11.49M | Food security at 62.8% (too low) |
| 60 | 1995 | 4.69B | ~11M | Steady decline continues |
| 66 | 1995 | 4.51B | 129.89M | Peak death month (unknown cause spike) |
| 150 | 2002 | 0.97B | 28.06M | Population collapse threshold |

### Root Cause #1: Temperature Initialization Bug

**Severity:** CRITICAL

The historical temperature anomaly (0.45C for 1990) is correctly set in `createDefaultInitialState()`, but **something overwrites it during the first simulation step**.

**Evidence:**
```
Initial state: Temperature: 0.45C
Month 0 after step: Temperature: 1.31C
```

**Location to investigate:**
- `src/simulation/initialization.ts` - Historical overrides applied
- `src/simulation/engine/phases/ClimateSystemPhase.ts` - May be recalculating temperature
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - May reset climate state

**Recommended Fix:**
Add assertion that historical temperature is preserved during first N months, or add era-locking for historical mode.

### Root Cause #2: Climate Stability = 0.0%

**Severity:** CRITICAL

Climate stability should be ~60-70% for 1990 conditions (7 planetary boundaries NOT breached). Instead it's 0.0% from Month 0.

**Evidence:**
```
Month 0: Climate stability: 0.0%
Month 150: Climate stability: 0.0%
```

**Location to investigate:**
- `src/simulation/engine/phases/ClimateSystemPhase.ts` line 421: `climateStability` calculation
- The formula `1 - climateChangeBoundary.currentValue` produces wrong values

**Recommended Fix:**
Historical mode needs to set climate stability based on historical planetary boundary values, not the 2025 defaults.

### Root Cause #3: Baseline Regional Deaths Too High

**Severity:** HIGH

The diagnostic shows `Mortality risks: 0` but deaths of 10-12M per month still occur. These come from the baseline regional death calculations in `BaselineMortalityPhase.ts` or `populationDynamics.ts`.

**Evidence:**
```
Month 12: Mortality risks: 0, Deaths this month: 11.49M
Month 24: Mortality risks: 0, Deaths this month: 11.25M
```

**Historical reality:** Global deaths in 1990 were ~50M/year (4.2M/month), not 130M+/year.

**Location to investigate:**
- `src/simulation/populationDynamics.ts`
- `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts`
- Crisis multipliers being applied even in stable conditions

**Recommended Fix:**
1. Add historical baseline death rate (~0.9%/year global)
2. Reduce crisis multipliers for pre-2020 era
3. Add population GROWTH rate for historical mode (~1.5%/year)

### Root Cause #4: Food Security Decay Too Fast

**Severity:** HIGH

Food security drops from 67.6% to 50.3% in 4 years (months 0-48). Historical food security was stable/improving 1990-2010.

**Evidence:**
```
Month 0: Food security: 67.6%
Month 12: Food security: 62.8%
Month 48: Food security: 50.3%
```

**Location to investigate:**
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts`
- Degradation rates assume future AI-era stress, not historical conditions

**Recommended Fix:**
Add era-specific degradation rates. Historical mode should have ~0% degradation when boundaries aren't crossed.

### Root Cause #5: Missing Population Growth

**Severity:** HIGH

The model has NO mechanism for population GROWTH. It only models deaths. Historical population grew from 5.3B (1990) to 8.1B (2024) - a 53% increase.

**Evidence:**
- No birth rate calculations visible
- Population only decreases from baseline

**Location to investigate:**
- `src/simulation/populationDynamics.ts` - Add birth rate mechanics
- Historical birth rate: ~2.5%/year (1990), declining to ~1.8%/year (2024)

**Recommended Fix:**
Implement basic birth rate model:
- Historical baseline: 2.5%/year (1990) declining to 1.8%/year (2024)
- Net growth = birth rate - death rate (~1.5%/year historical average)

## Temperature vs Mortality Correlation

From diagnostic:
```
1-1.5C: avg 9.19M deaths/month (33 months)
1.5-2C: avg 36.35M deaths/month (118 months)
```

This shows a **4x mortality increase** when temperature crosses 1.5C threshold. This is far too aggressive for historical conditions where actual mortality was stable.

## Phase 2 Recommendations

### Priority 1: Fix Temperature Initialization (CRITICAL)

```typescript
// In historical mode, lock temperature to historical value for first 12 months
// to prevent immediate recalculation
if (state.config.scenarioMode === 'historical' && state.currentMonth < 12) {
  state.resourceEconomy.co2.temperatureAnomaly = historicalOverrides.temperatureAnomalyC;
}
```

### Priority 2: Add Era-Specific Mortality Multiplier

```typescript
// In src/types/config.ts
export const ERA_MORTALITY_MULTIPLIERS = {
  1990: 0.3,  // Historical resilience without AI
  2000: 0.4,
  2010: 0.6,
  2020: 0.8,
  2025: 1.0,  // Current calibration baseline
};
```

### Priority 3: Implement Birth Rate Model

```typescript
// In populationDynamics.ts
function calculateMonthlyBirths(state: GameState): number {
  const historicalBirthRate = 0.025; // 2.5%/year baseline
  const yearsSince1990 = state.currentYear - 1990;
  // Declining birth rate trend
  const adjustedRate = historicalBirthRate - (yearsSince1990 * 0.0002);
  return state.humanPopulationSystem.population * (adjustedRate / 12);
}
```

### Priority 4: Fix Climate Stability Calculation

```typescript
// In ClimateSystemPhase.ts
// Historical mode should use historical boundary values
if (state.config.scenarioMode === 'historical') {
  const historicalStability = 1 - (historicalOverrides.planetaryBoundaries?.climateChange || 0.35);
  state.environmentalAccumulation.climateStability = Math.max(0.05, historicalStability);
}
```

### Priority 5: Reduce Baseline Death Rates

Current baseline deaths: ~130M/year (2.4%/year)
Historical deaths: ~50M/year (0.9%/year)

Reduce baseline regional death rates by ~60% for historical mode.

## Validation Criteria for Phase 2

After calibration, the hindcast MUST achieve:

1. **Population trajectory:** 5.3B (1990) -> 6.14B (2000) -> 6.96B (2010) -> 8.12B (2024) within +/-20%
2. **Temperature trajectory:** 0.45C (1990) -> 0.85C (2010) -> 1.28C (2024) within +/-20%
3. **CO2 trajectory:** 354 ppm (1990) -> 390 ppm (2010) -> 424 ppm (2024) within +/-5%
4. **No extinction events** in historical baseline scenario
5. **Stable food security:** >70% throughout 1990-2024

## Files to Modify in Phase 2

1. `src/simulation/initialization.ts` - Historical state setup
2. `src/simulation/engine/phases/ClimateSystemPhase.ts` - Temperature/stability calculations
3. `src/simulation/populationDynamics.ts` - Add birth rates, reduce baseline deaths
4. `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts` - Era multipliers
5. `src/types/config.ts` - Add ERA_MORTALITY_MULTIPLIERS constant
6. `src/simulation/config/centralConfig.ts` - Historical baseline parameters

## Conclusion

The hindcast failure is NOT a fundamental model flaw but a **calibration gap**. The model was designed for AI-era scenarios (2025+) and hasn't been tuned for historical conditions where:

1. AI assistance wasn't available (but humanity survived anyway)
2. Climate stress was lower (0.45C vs 1.28C)
3. Population was GROWING, not collapsing
4. Food/water systems were stable

Phase 2 will implement the calibration fixes to make the model accurately reproduce known history before trusting its future predictions.

---

*"If it can't hindcast the past, don't trust it to forecast the future."* - Sylvia (Research Skeptic)
