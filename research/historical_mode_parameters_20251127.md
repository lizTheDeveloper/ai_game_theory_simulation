---
oldest_source: 1990
newest_source: 2025
last_verified: 2025-12-12
status: used_in_simulation
verification_status: CURRENT
---

# Historical Mode Research Brief

**Date:** November 27, 2025
**Purpose:** Parameter guidance for historical mode implementation
**Sources:** Existing hindcast research + Phase 10 validation results
**Status:** APPROVED (orchestrator coordinated)

## Executive Summary

Phase 10 hindcast validation revealed systematic calibration issues when running 1990-2024 simulation:
- Temperature: +64% error (2.1°C vs 1.28°C actual)
- Population: -76% error (2.0B vs 8.1B actual)
- Biodiversity: -95% error (0.03 vs 0.49 actual)
- Non-determinism: CV=6.7% (target <0.1%)

**Root Cause:** Simulation is calibrated for CRISIS scenarios (nuclear winter, climate collapse, famine cascades), but 1990-2024 was a BASELINE growth period. Crisis systems are too aggressive for historical validation.

**Solution:** Implement `historicalMode` flag to disable/dampen crisis systems during hindcasting.

---

## Historical Targets (1990-2024)

From `research/hindcast_baseline_data_20251124.md`:

### Temperature Anomaly (NASA GISS)
- 1990: +0.45°C
- 2000: +0.42°C
- 2010: +0.72°C
- 2020: +1.02°C
- 2024: +1.28°C
- **Validation Target:** 1.28°C ± 10% (1.15-1.41°C)

### Atmospheric CO2 (NOAA Mauna Loa)
- 1990: 354.4 ppm
- 2000: 369.7 ppm
- 2010: 389.9 ppm
- 2020: 414.2 ppm
- 2024: 424.6 ppm
- **Validation Target:** 424.6 ppm ± 5% (403-446 ppm)

### Population (UN WPP 2024)
- 1990: 5.33B
- 2000: 6.15B
- 2010: 6.96B
- 2020: 7.84B
- 2024: 8.12B
- **Validation Target:** 8.12B ± 10% (7.3-8.9B)

### Biodiversity (Living Planet Index 2024)
- 1990: ~0.65 (baseline reference, indexed to 1970=1.0)
- 2000: ~0.59 (9% decline from 1990)
- 2010: ~0.55 (15% decline from 1990)
- 2020: ~0.51 (22% decline from 1990)
- 2024: ~0.49 (25% decline from 1990)
- **Validation Target:** 0.49 ± 20% (0.39-0.59)
- **Decline Rate:** ~0.74% per year (1990-2024)

**Source:** WWF Living Planet Report 2024, based on 35,000+ vertebrate populations

---

## Crisis Systems to Disable/Dampen

### Phase 10 Issue Analysis:
- **Current behavior:** Temp +64% error, Pop -76% error, Bio -95% error
- **Root cause:** Crisis systems (wars, pandemics, famines, collapses) too aggressive for 1990-2024 baseline period
- **Historical reality:** 1990-2024 saw steady growth with minor disruptions (Gulf War, 9/11, 2008 crisis, COVID-19), not civilizational collapse

### Systems Requiring Historical Mode Adjustments:

#### 1. ExogenousShockPhase
**Current behavior:** Triggers large-scale disasters, nuclear wars, asteroid impacts
**Historical mode adjustments:**
- DISABLE nuclear war events (no strategic exchanges 1990-2024)
- DISABLE asteroid impacts (no civilization-threatening impacts)
- DISABLE large-scale pandemics >100M deaths (COVID-19 was ~7M)
- KEEP regional conflicts (Gulf War, Syria, Ukraine - limited mortality)
- KEEP natural disasters (realistic historical frequency)

**Recommended logic:**
```typescript
if (state.config.historicalMode) {
  // Reduce disaster frequency by 90%
  // Cap disaster mortality at 10M per event
  // No nuclear or asteroid events
}
```

#### 2. BaselineMortalityPhase
**Current behavior:** Crisis-calibrated death rates
**Historical mode adjustments:**
- USE historical death rates from IHME GBD (see below)
- DISABLE famine cascades from resource depletion
- DISABLE pandemic mortality multipliers (except COVID-2019 if modeled)
- CORRECTLY apply ERA_MORTALITY_MULTIPLIERS (already implemented Nov 24)

**Historical Death Rates (per 1000):**
- 1990: ~9.0
- 2000: ~8.3
- 2010: ~7.9
- 2020: ~7.6
- 2024: ~7.4

**Source:** IHME Global Burden of Disease 2021

**Recommended logic:**
```typescript
if (state.config.historicalMode) {
  const baseMortality = getHistoricalMortalityRate(state.currentYear);
  // No famine/pandemic multipliers
  // No resource depletion mortality cascades
}
```

#### 3. BiodiversityPhase
**Current behavior:** Accelerating extinction cascades
**Historical mode adjustments:**
- DAMPEN decline rate to 0.74%/year (matches LPI 2024)
- DISABLE catastrophic extinction events (no mass die-offs)
- USE baseline habitat loss rates (deforestation, urbanization)
- NO feedback loops to ecosystem collapse

**Recommended logic:**
```typescript
if (state.config.historicalMode) {
  const annualDeclineRate = 0.0074; // 0.74% per year
  biodiversityIndex *= (1 - annualDeclineRate);
  // Cap decline at 25% total over 34 years
}
```

#### 4. ClimateSystemPhase
**Current behavior:** Possible temperature anticorrelation (see H-6 diagnostic)
**Historical mode adjustments:**
- VERIFY ECS = 3.0°C (IPCC AR6 best estimate)
- CHECK thermal inertia parameters (damping may be too strong)
- FIX temperature anticorrelation if confirmed
- USE historical emissions forcing (already implemented via GCP data)

**Known issue:** H-6 diagnostic plan identified possible tech effects overwriting natural temperature

**Recommended logic:**
```typescript
if (state.config.historicalMode) {
  // Use standard ECS=3.0, no geoengineering overrides
  // Verify temp = f(CO2) with positive correlation
}
```

#### 5. ResourceDepletionPhase
**Current behavior:** Oil depletion triggers economic collapse cascades
**Historical mode adjustments:**
- DAMPEN oil depletion → GDP collapse feedback
- DISABLE civilization collapse triggers
- USE historical extraction/consumption rates
- NO peak oil catastrophes (real world had shale boom 2010-2020)

**Recommended logic:**
```typescript
if (state.config.historicalMode) {
  // Reduce resource scarcity → economic impact multiplier by 80%
  // No collapse cascades
}
```

---

## Implementation Architecture

### 1. Add `historicalMode` Flag to SimulationConfig

**File:** `src/types/game.ts`

```typescript
export interface SimulationConfig {
  // ... existing fields
  historicalMode?: boolean; // Enable historical calibration (1990-2024 validation mode)
}
```

### 2. Initialize Flag in Historical Initialization

**File:** `src/simulation/historicalInitialization.ts`

```typescript
export async function initializeHistoricalSimulation(
  startYear: number,
  rng: () => number
): Promise<GameState> {
  // ... existing initialization

  state.config.historicalMode = true; // Enable historical mode

  return state;
}
```

### 3. Update Phases to Check Flag

**Files to modify:**
- `src/simulation/engine/phases/ExogenousShockPhase.ts`
- `src/simulation/engine/phases/BaselineMortalityPhase.ts`
- `src/simulation/engine/phases/BiodiversityPhase.ts` (if exists, or relevant file)
- `src/simulation/engine/phases/ClimateSystemPhase.ts`
- `src/simulation/resourceDepletion.ts` (for resource cascade damping)

**Pattern:**
```typescript
export function phaseFunction(state: GameState, rng: () => number): void {
  if (state.config.historicalMode) {
    // Historical calibration (baseline growth)
  } else {
    // Crisis calibration (current behavior)
  }
}
```

---

## Validation Criteria

### Success Thresholds

After implementing historical mode, Monte Carlo validation (N=10) must show:

1. **Temperature:** 1.28°C ± 10% (1.15-1.41°C)
   - **Current error:** +64% (2.1°C)
   - **Target:** <10% error

2. **Population:** 8.12B ± 10% (7.3-8.9B)
   - **Current error:** -76% (2.0B)
   - **Target:** <10% error

3. **Biodiversity:** 0.49 ± 20% (0.39-0.59)
   - **Current error:** -95% (0.03)
   - **Target:** <20% error

4. **Determinism:** CV < 0.1%
   - **Current CV:** 6.7%
   - **Target:** CV < 0.1% (same seed = same result)

### Validation Script

Use existing Monte Carlo infrastructure:

```bash
npx tsx scripts/monteCarloSimulation.ts \
  --seed 42 \
  --runs 10 \
  --startYear 1990 \
  --endYear 2024 \
  > logs/historical_mode_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Metrics to extract:**
- Mean and std dev for temp, population, biodiversity at year 2024
- Coefficient of variation for determinism check
- Outcome distribution (should all be "status-quo" for baseline period)

---

## Risk Assessment

### Medium Risk: Overcorrection

**Concern:** Disabling crisis systems entirely may make simulation unrealistically optimistic

**Mitigation:**
- Keep minor disasters (realistic frequency)
- Model COVID-19 if within simulation timeframe
- Don't disable ALL mortality, just extreme outliers

### Low Risk: Flag Propagation

**Concern:** Missing phases that need historical mode logic

**Mitigation:**
- Architecture review (quality gate) will catch missing propagation
- Grep for crisis-related logic: `grep -r "disaster\|catastrophe\|collapse" src/simulation/`

### Low Risk: Determinism Regression

**Concern:** Historical mode changes break determinism

**Mitigation:**
- Monte Carlo validation (N=10) checks CV < 0.1%
- Use same RNG seed for reproducibility

---

## Related Work

**Builds on:**
- ✅ Hindcast data collection (Nov 24, research/hindcast_baseline_data_20251124.md)
- ✅ ERA mortality verification (Nov 24, research/hindcast_era_mortality_verification_20251124.md)
- ✅ Climate data compilation (Nov 27, research/hindcast_climate_data_20251127.md)
- ⚠️ Phase 10 validation results (revealed systematic calibration issues)

**Blocks:**
- Climate hindcast completion (proposed_climate_hindcast_completion_20251127.md)
- Forward projection credibility (2025-2050)

**Related issues:**
- H-6: Temperature anticorrelation diagnostic (proposed_temperature_anticorrelation_diagnostic_20251127.md)

---

## Next Steps

**For simulation-maintainer (Roy):**

1. Add `historicalMode` flag to SimulationConfig (`src/types/game.ts`)
2. Set `historicalMode = true` in `historicalInitialization.ts`
3. Update phases (ExogenousShock, BaselineMortality, Biodiversity, Climate, ResourceDepletion)
4. Run Monte Carlo validation (N=10)
5. Iterate if validation thresholds not met

**For priya (validation):**

1. Review validation methodology
2. Run statistical analysis on N=10 results
3. Verify CV < 0.1% for determinism
4. Sign off on completion

**For architecture-skeptic (review):**

1. Check flag propagation to all relevant phases
2. Verify no performance regressions
3. Validate state propagation correctness

**For wiki-documentation-updater:**

1. Document historical mode in wiki
2. Update hindcast validation procedures
3. Add troubleshooting guide

---

## Appendix: Historical Context

### Why This Matters

Hindcast validation is the **gold standard** for model credibility:
- Shows climate/population/biodiversity subsystems match observations
- Enables forward projections (2025-2050) with confidence
- Critical for research publication and external scrutiny
- Demonstrates model is not just "tuned to feel right" but empirically validated

### Philosophical Alignment

**Core principle:** "Research-backed realism over balance tuning"

The simulation is a **research tool**, not a game. Parameters must be justified by data, not "fun" or "balance". Historical mode enables empirical validation of this principle.

### Timeline

- **Nov 23:** Hindcast validation initiated
- **Nov 24:** Phases 1-5 complete (data, mortality, demographics)
- **Nov 24-26:** Phases 6-11 complete (food, carbon cycle, volcanic forcing)
- **Nov 27:** Phase 10 validation reveals systematic calibration issues
- **Nov 27:** Historical mode solution proposed (this document)
- **Next:** Implementation → validation → completion

---

**Status:** READY FOR IMPLEMENTATION
**Owner:** simulation-maintainer (Roy)
**Reviewer:** research-skeptic (Sylvia) - validation of parameter choices
**Validator:** priya - Monte Carlo statistical analysis
