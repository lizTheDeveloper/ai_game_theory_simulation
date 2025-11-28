# M-4: Time-Varying Demographics Implementation
## Population Growth Rate Calibration

**Date:** 2025-11-28
**Priority:** MEDIUM (24.5% error within 30% threshold but improvable)
**Assignee:** Roy (simulation-maintainer)
**Coordinator:** Orchestrator

---

## Problem Statement

Current simulation overshoots 2024 global population by +24.5% (~10.1B vs 8.12B target). Root cause analysis shows:
- Baseline populations CORRECT (8.136B across 10 regions)
- Issue is DYNAMICS: static birth/death rates don't capture 1990-2024 demographic transition
- Example declines: East Asia TFR 2.2 → 1.2 (-45%), S. Asia TFR 4.2 → 2.0 (-52%)

**Quality Gate 1:** Research validated (CONDITIONAL PASS)
- Research: `research/population_demographics_regional_20251128.md`
- Critique: `reviews/m4_demographics_research_critique_20251128.md`

---

## Objective

Implement time-varying birth/death rates that interpolate from 1990 historical highs to 2024 current values, reducing population error from +24.5% to <15%.

---

## Implementation Specification

### 1. Add Time-Varying Rate Functions

Location: `src/simulation/populationDynamics.ts`

```typescript
/**
 * Demographic transition parameters (1990 → 2024)
 * Source: UN World Population Prospects 2024
 * Research: research/population_demographics_regional_20251128.md
 */
const DEMOGRAPHIC_PARAMS_1990_2024: Record<string, {
  birthRate1990: number;
  birthRate2024: number;
  deathRate1990: number;
  deathRate2024: number;
}> = {
  'East Asia': {
    birthRate1990: 0.0176,  // TFR 2.2
    birthRate2024: 0.0096,  // TFR 1.2
    deathRate1990: 0.0070,
    deathRate2024: 0.0080   // INCREASES (aging effect)
  },
  'South Asia': {
    birthRate1990: 0.0336,  // TFR 4.2
    birthRate2024: 0.0160,  // TFR 2.0
    deathRate1990: 0.0100,
    deathRate2024: 0.0065   // Declines (healthcare improvements)
  },
  'Sub-Saharan Africa': {
    birthRate1990: 0.0520,  // TFR 6.5
    birthRate2024: 0.0344,  // TFR 4.3
    deathRate1990: 0.0130,
    deathRate2024: 0.0079   // MAJOR decline (healthcare from low baseline)
  },
  'Europe': {
    birthRate1990: 0.0140,  // TFR 1.75
    birthRate2024: 0.0120,  // TFR 1.5
    deathRate1990: 0.0105,
    deathRate2024: 0.0108   // Slight increase (aging)
  },
  'Latin America': {
    birthRate1990: 0.0264,  // TFR 3.3
    birthRate2024: 0.0144,  // TFR 1.8
    deathRate1990: 0.0065,
    deathRate2024: 0.0055
  },
  'North America': {
    birthRate1990: 0.0160,  // TFR 2.0
    birthRate2024: 0.0136,  // TFR 1.7
    deathRate1990: 0.0085,
    deathRate2024: 0.0090   // Slight increase (aging)
  },
  'Middle East & North Africa': {
    birthRate1990: 0.0400,  // TFR 5.0
    birthRate2024: 0.0213,  // TFR 2.66
    deathRate1990: 0.0070,
    deathRate2024: 0.0045   // Major decline (young pop + oil wealth)
  },
  'Southeast Asia': {
    birthRate1990: 0.0280,  // TFR 3.5
    birthRate2024: 0.0168,  // TFR 2.1
    deathRate1990: 0.0075,
    deathRate2024: 0.0060
  }
  // Note: Central Asia and Oceania use static rates (small populations, <2% of global)
};

/**
 * Calculate time-varying birth rate for a region
 * Linear interpolation from 1990 baseline to 2024 current values
 */
function getTimeVaryingBirthRate(regionName: string, year: number): number {
  const params = DEMOGRAPHIC_PARAMS_1990_2024[regionName];
  if (!params) {
    // Regions without time-varying data use static rates
    return 0; // Caller should use baseline instead
  }

  // Clamp year to valid range
  const clampedYear = assertInRange(year, 1990, 2100, {
    location: 'getTimeVaryingBirthRate',
    valueName: 'year',
    additionalInfo: { regionName }
  });

  // Linear interpolation: 1990 → 2024
  const t = (clampedYear - 1990) / (2024 - 1990);
  const normalizedT = Math.max(0, Math.min(1, t));

  const rate = params.birthRate1990 - (params.birthRate1990 - params.birthRate2024) * normalizedT;

  // Validate rate is positive and reasonable
  return assertInRange(rate, 0.001, 0.1, {
    location: 'getTimeVaryingBirthRate',
    valueName: 'birthRate',
    additionalInfo: { regionName, year: clampedYear, t: normalizedT }
  });
}

/**
 * Calculate time-varying death rate for a region
 * Linear interpolation from 1990 baseline to 2024 current values
 * Note: Some regions (East Asia, Europe, N. America) have INCREASING CDR due to aging
 */
function getTimeVaryingDeathRate(regionName: string, year: number): number {
  const params = DEMOGRAPHIC_PARAMS_1990_2024[regionName];
  if (!params) {
    return 0; // Caller should use baseline instead
  }

  const clampedYear = assertInRange(year, 1990, 2100, {
    location: 'getTimeVaryingDeathRate',
    valueName: 'year',
    additionalInfo: { regionName }
  });

  const t = (clampedYear - 1990) / (2024 - 1990);
  const normalizedT = Math.max(0, Math.min(1, t));

  const rate = params.deathRate1990 - (params.deathRate1990 - params.deathRate2024) * normalizedT;

  return assertInRange(rate, 0.001, 0.05, {
    location: 'getTimeVaryingDeathRate',
    valueName: 'deathRate',
    additionalInfo: { regionName, year: clampedYear, t: normalizedT }
  });
}
```

### 2. Modify updatePopulation() Function

Update the population update logic to use time-varying rates during historical mode:

```typescript
export function updatePopulation(state: GameState, rng: () => number): void {
  // ... existing code ...

  const currentYear = 1990 + Math.floor(state.currentMonth / 12);
  const isHistorical = isHistoricalModeActive(state);

  for (const region of state.humanPopulationSystem.regionalPopulations) {
    // Apply time-varying rates if in historical mode and data available
    if (isHistorical) {
      const birthRate = getTimeVaryingBirthRate(region.name, currentYear);
      const deathRate = getTimeVaryingDeathRate(region.name, currentYear);

      if (birthRate > 0) {
        region.baselineBirthRate = birthRate;
        region.adjustedBirthRate = birthRate; // Will be modified by crisis/tech effects
      }
      if (deathRate > 0) {
        region.baselineDeathRate = deathRate;
        region.adjustedDeathRate = deathRate; // Will be modified by crisis/tech effects
      }
    }

    // ... rest of existing population update logic ...
  }
}
```

### 3. Validation Targets

**Hindcast accuracy (1990 → 2024):**
- Global 2024 population: 8.12B ± 10% (7.31B - 8.93B)
- No single region >15% error
- Determinism: CV < 0.01% across N=10 runs

**Expected improvement:**
- From: +24.5% error (10.1B vs 8.12B)
- To: <15% error (target <9.4B)

Note: Sylvia's critique suggests <15% is realistic (not <5% since baseline already correct).

---

## Implementation Checklist

- [ ] Add DEMOGRAPHIC_PARAMS_1990_2024 constant with 8 regions
- [ ] Implement getTimeVaryingBirthRate() with assertions
- [ ] Implement getTimeVaryingDeathRate() with assertions
- [ ] Modify updatePopulation() to apply time-varying rates in historical mode
- [ ] Add documentation comments explaining demographic transition
- [ ] Type check: `npx tsc --noEmit`
- [ ] Run god mode test: `npx tsx scripts/runGodMode.ts`
- [ ] Run hindcast N=10: `npx tsx scripts/monteCarloSimulation.ts > logs/M4_hindcast_N10.log 2>&1 &`
- [ ] Measure 2024 population error vs 8.12B target
- [ ] Verify determinism (CV < 0.01%)
- [ ] Document results in devlog or review file

---

## Critical Notes

**DO NOT:**
- Add Southeast Asia region (already exists!)
- Adjust baseline populations (already at 8.136B)
- Skip assertions on calculated rates (fail loudly if NaN)

**UNIQUE PATTERNS:**
- East Asia CDR INCREASES (0.007 → 0.008) due to rapid aging
- Sub-Saharan Africa has largest CDR decline (0.013 → 0.0079) from healthcare improvements
- Europe, North America also have slight CDR increases (aging populations)

**DEFENSIVE CODING:**
- Use assertInRange() to validate year is 1990-2100
- Use assertInRange() to validate rates are positive and <0.1
- Fail loudly if calculation produces NaN/Infinity
- Document the demographic transition pattern in comments

---

## Success Criteria

1. Type check passes
2. God mode test passes (no regressions)
3. N=10 Monte Carlo shows:
   - 2024 global population 7.31B - 8.93B (within ±10%)
   - CV < 0.01% (deterministic)
   - Population error reduced from +24.5% to <15%
4. Code uses assertion utilities (no silent fallbacks)
5. Documentation updated

---

## Research References

- **Primary research:** `research/population_demographics_regional_20251128.md`
- **Critique validation:** `reviews/m4_demographics_research_critique_20251128.md`
- **Source authority:** UN World Population Prospects 2024, World Bank Open Data

---

**Estimated Effort:** 2-3 hours (implementation + validation)
**Priority:** MEDIUM (refinement, not blocker)
**Complexity:** LOW (straightforward interpolation, well-specified parameters)
