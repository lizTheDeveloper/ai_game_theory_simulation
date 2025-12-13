# HANDOFF: Hindcast Early Years Parameter Tuning (1990-2005)

**To:** Roy (simulation-maintainer)
**From:** Orchestrator-1
**Date:** December 13, 2025
**Session:** 80
**Priority:** MEDIUM (improves validation quality, not blocking)

---

## Problem Statement

Session 79 completed hindcast validation with excellent 2020 accuracy (-3.59% deviation), but early years (1990-2005) show significant population overshoot:

| Year | Simulated | Historical | Deviation |
|------|-----------|------------|-----------|
| 1990 | Initial   | 5.327B     | TBD       |
| 1995 | ~8.16B    | 5.744B     | **+42%**  |
| 2000 | ~8.54B    | 6.143B     | **+39%**  |
| 2005 | ~8.16B    | 6.542B     | **+33%**  |
| 2010 | ~8.68B    | 6.957B     | **+25%**  |
| 2015 | ~8.27B    | 7.380B     | **+12%**  |
| 2020 | 7.50B     | 7.795B     | -3.6% ✅  |

---

## Root Cause Identified

**CRITICAL BUG:** Hindcast validation script initializes with 2025 population values but runs simulation starting from 1990.

### Current Behavior
```typescript
// scripts/hindcastDemographicValidation.ts line 44
const state: GameState = createDefaultInitialState(rng);  // Creates 2025 state (8.136B)
state.currentYear = 1990;  // But sets year to 1990

// src/simulation/populationDynamics.ts line 165-264
function initializeRegionalPopulations(): RegionalPopulation[] {
  return [
    {
      name: 'East Asia',
      population: 1677,  // 2025 value
      // ... other 2025 values
    },
    // ... 7 more regions, all with 2025 population values
  ];
}
```

**Total 2025 population:** ~8.136B (East Asia 1677M + South Asia 2048M + Sub-Saharan Africa 1220M + Europe 742M + ...)

**Total 1990 population should be:** 5.327B (historical UN data)

This mismatch causes:
1. Simulation starts with 53% MORE people than historical 1990 baseline
2. Death rates correctly apply 1990 values (via time-varying functions)
3. Population "decays" toward reality over 30 years as death rates exceed birth rates
4. By 2020, random variation + death rates converge to ~correct value

---

## Required Fix

### Option 1: Add `startYear` parameter to regional initialization (RECOMMENDED)

**Rationale:** Clean architecture, preserves 2025 baseline for normal simulations, adds historical support

**Implementation:**
1. Add optional `startYear?: number` parameter to `initializeRegionalPopulations()`
2. Add conditional logic to return 1990 regional populations when `startYear === 1990`
3. Update `createDefaultInitialState()` to pass `historicalOverrides?.startYear` through to population initialization

**Example:**
```typescript
function initializeRegionalPopulations(startYear: number = 2025): RegionalPopulation[] {
  if (startYear === 1990) {
    return [
      {
        name: 'East Asia',
        population: 1354,  // 1990 value (China 1143M + Japan 124M + Koreas 65M + Mongolia 2M)
        baselineBirthRate: 0.0176,  // 1990 TFR 2.2
        baselineDeathRate: 0.0070,  // 1990 CDR 7.0/1000
        // ... other 1990 values
      },
      // ... 7 more regions with 1990 data
    ];
  }

  // Default: 2025 baseline
  return [/* existing 2025 data */];
}
```

### Option 2: Scale regional populations based on global ratio (QUICK FIX)

**Rationale:** Simpler, maintains regional distribution, less accurate

**Implementation:**
1. In hindcast validation script, after creating state, scale regional populations
2. Multiply each region's population by (5.327 / 8.136) ≈ 0.655

**Example:**
```typescript
if (state.config.scenarioMode === 'historical' && state.currentYear === 1990) {
  const scaleFactor = 5.327 / state.humanPopulationSystem.population;  // ~0.655
  for (const region of state.humanPopulationSystem.regionalPopulations) {
    region.population *= scaleFactor;
    region.baselinePopulation *= scaleFactor;
    region.peakPopulation *= scaleFactor;
  }
  state.humanPopulationSystem.population = 5.327;
  state.humanPopulationSystem.baselinePopulation = 5.327;
}
```

**Tradeoff:** Regional distributions may not match exact 1990 values (e.g., China grew faster than Africa 1990-2025)

---

## Research Foundation

### 1990 Regional Population Data (UN WPP 2024)

**Source:** research/regional_death_rates_unwpp2024_20251209.md

| Region | 1990 Pop (millions) | 2025 Pop (millions) | Growth Rate |
|--------|---------------------|---------------------|-------------|
| East Asia | ~1,354 | 1,677 | +24% |
| South Asia | ~1,257 | 2,048 | +63% |
| Sub-Saharan Africa | ~521 | 1,220 | +134% |
| Europe | ~721 | 742 | +3% |
| Latin America | ~442 | 659 | +49% |
| North America | ~283 | 376 | +33% |
| Middle East & North Africa | ~237 | 527 | +122% |
| Southeast Asia | ~443 | 697 | +57% |
| **TOTAL** | **~5,258M** | **~8,136M** | **+55%** |

**Note:** 5.258B vs 5.327B historical (1.3% discrepancy likely due to regional boundary differences)

### 1990 Demographic Parameters

Already implemented in `DEMOGRAPHIC_PARAMS_1990_2024` (lines 36-91 of populationDynamics.ts):

```typescript
const DEMOGRAPHIC_PARAMS_1990_2024: Record<string, {
  birthRate1990: number;
  birthRate2024: number;
  deathRate1990: number;
  deathRate2024: number;
}> = {
  'East Asia': {
    birthRate1990: 0.0176,  // TFR 2.2
    deathRate1990: 0.0070,  // Already correct
    // ...
  },
  // ... 7 more regions
};
```

**These parameters are already working correctly** (evidenced by 2020 convergence). Only initial population values need updating.

---

## Success Criteria

1. **1990-2005 deviation < 7%** (matching 2020 target)
   - Currently: 25-42% overshoot
   - Target: <7% for all checkpoint years

2. **No regression in 2020 accuracy**
   - Currently: -3.59% average ✅
   - Must maintain: <7% deviation

3. **Determinism maintained**
   - CV < 0.01% across runs
   - Same seed = same results

4. **Research-backed values**
   - All 1990 regional populations from UN WPP 2024
   - No arbitrary scaling or fallbacks

---

## Implementation Steps

### If using Option 1 (recommended):

1. **Modify `initializeRegionalPopulations()`:**
   - Add `startYear?: number = 2025` parameter
   - Add conditional block for `startYear === 1990`
   - Return 1990 regional data from table above
   - Keep existing 2025 data as default

2. **Update `initializeRegionalPopulationsWithStabilizers()`:**
   - Pass `startYear` parameter through
   - Initialize stabilizers after conditional population selection

3. **Update `initializeHumanPopulationSystem()`:**
   - Add `startYear?: number` parameter
   - Pass to `initializeRegionalPopulationsWithStabilizers()`

4. **Update `createDefaultInitialState()`:**
   - Extract `startYear` from `historicalOverrides?.startYear`
   - Pass to `initializeHumanPopulationSystem(startYear)`

5. **Test with hindcast validation:**
   ```bash
   npx tsx scripts/hindcastDemographicValidation.ts > logs/hindcast_1990_init_fix_20251213.log 2>&1
   ```

6. **Verify:**
   - 1990 deviation ~0% (should match historical baseline exactly)
   - 1995-2015 deviations improve significantly
   - 2020 deviation remains <7% (no regression)

### If using Option 2 (quick fix):

1. **Modify `scripts/hindcastDemographicValidation.ts`:**
   - After `createDefaultInitialState(rng)`, add scaling logic
   - Scale all regional populations by 5.327 / 8.136
   - Recalculate global population from regional sum

2. **Test and verify** (same as above)

---

## Files to Modify

**Option 1:**
- `src/simulation/populationDynamics.ts` (primary changes)
- `src/simulation/initialization.ts` (parameter passing)

**Option 2:**
- `scripts/hindcastDemographicValidation.ts` (script-only fix)

---

## Defensive Coding Requirements

1. **No silent fallbacks:**
   ```typescript
   // ❌ WRONG
   const pop = regionData?.population ?? 1000;  // Silent fallback

   // ✅ CORRECT
   const pop = assertStateProperty(regionData, 'population', {
     location: 'initializeRegionalPopulations',
     additionalInfo: { regionName, startYear }
   });
   ```

2. **Explicit validation:**
   ```typescript
   const totalPop1990 = regions.reduce((sum, r) => sum + r.population, 0);
   if (Math.abs(totalPop1990 - 5327) > 100) {  // Allow 100M tolerance
     throw new Error(`1990 population sum ${totalPop1990}M deviates from UN baseline 5327M`);
   }
   ```

3. **No magic numbers:**
   ```typescript
   // ❌ WRONG
   region.population = 1354;  // Where did this come from?

   // ✅ CORRECT
   // UN World Population Prospects 2024: East Asia 1990 population
   // China (1143M) + Japan (124M) + Koreas (65M) + Mongolia (2M)
   // Source: research/regional_death_rates_unwpp2024_20251209.md
   region.population = 1354;
   ```

4. **RNG requirements:**
   - `initializeRegionalPopulations()` doesn't need RNG (deterministic data)
   - But `initializeRegionalMortalityStabilizers()` DOES need RNG
   - Ensure RNG is passed through from `createDefaultInitialState()`

---

## Testing Protocol

1. **Run hindcast validation (N=5):**
   ```bash
   npx tsx scripts/hindcastDemographicValidation.ts > logs/hindcast_early_years_fix_v1_$(date +%Y%m%d_%H%M%S).log 2>&1
   ```

2. **Check 1990 initialization:**
   - Look for first checkpoint output
   - Should show ~5.327B (not 8.136B)

3. **Check early years:**
   - 1995: Target <7% deviation (currently +42%)
   - 2000: Target <7% deviation (currently +39%)
   - 2005: Target <7% deviation (currently +33%)

4. **Check 2020 (no regression):**
   - Must remain <7% deviation
   - Currently -3.59%, should stay similar

5. **Check determinism:**
   - CV < 0.01% for all checkpoint years
   - Visual inspection: consistent values across runs

---

## Research Validation

**Already PASSED Quality Gate 1:**
- research/regional_death_rates_unwpp2024_20251209.md (Grade B)
- reviews/hindcast_demographic_research_critique_20251209.md

**No new research needed** - this is a parameter initialization bug fix, not a new mechanic.

---

## Expected Timeline

- **Investigation:** COMPLETED (30 minutes)
- **Implementation:** 1-2 hours (Option 1) or 30 minutes (Option 2)
- **Testing:** 30 minutes (N=5 runs)
- **Documentation:** 30 minutes
- **Total:** 2-3 hours

---

## Questions for Roy

1. **Which option do you prefer?** Option 1 (clean architecture) or Option 2 (quick fix)?
2. **Should we support arbitrary start years** (1950, 2000, etc.) or just 1990 and 2025?
3. **Do you need 1990 regional population data in a different format?** (I can extract exact UN values)

---

## Handoff Complete

**Status:** Ready for implementation
**Next Step:** Roy implements fix, runs validation, reports results
**Coordination:** Post updates to `.claude/chatroom/channels/implementation.md`

Orchestrator standing by for validation results. 🚢
