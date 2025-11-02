# Climate Mortality Phase 2: Storm Systems + BII Framework
## Implementation Specification

**Date:** 2025-10-28
**Orchestrator:** orchestrator-1
**Status:** Implementation Phase
**Research:** research/climate-mortality-biosphere-multiparadigm-framework_20251028.md (15,000+ words, 40+ sources)

---

## Implementation Scope

**Phase 2 of Climate Mortality Implementation (50% → 100% complete)**

✅ **Complete:**
- Heat mortality systems (wetBulbEvents.ts)
- Multi-paradigm framework (indigenousParadigm.ts)

❌ **Missing (this implementation):**
- Storm intensity-frequency modeling
- BII framework (54,000 species baseline)

---

## 1. Storm Intensity-Frequency System

### File: `src/simulation/extremeWeatherEvents.ts`

**Research Basis:**
- Knutson et al. (2020, 2023) - Tropical cyclone projections
- Emanuel (2021) - Rapid intensification trends
- Mendelsohn et al. (2012) - Economic impacts
- NOAA GFDL (2024) - Hurricane-warming relationships

**Key Parameters:**
- Intensity increase: 2-11% by 2100
- Precipitation increase: 10-15% near-storm rainfall
- Frequency change: -6% to -34% (FEWER storms total)
- Category shift: More Cat 4-5, fewer Cat 1-2
- Rapid intensification: Nearly doubled 1982-2009

**Type Definitions Needed:**

```typescript
// src/types/extremeWeather.ts

export interface StormEvent {
  category: 1 | 2 | 3 | 4 | 5;
  durationDays: number;
  region: string;
  population: number;
  infrastructureVulnerability: number;  // [0, 1]
  baseMortality: number;                // Deaths without multipliers
  totalMortality: number;               // After all multipliers
  month: number;
}

export interface RegionalStormVulnerability {
  region: string;
  coastalPopulation: number;            // Millions
  infrastructureCapacity: number;       // [0, 1] seawalls, drainage, early warning
  baselineStormFrequency: number;       // Annual events (1980-2010 baseline)
  vulnerabilityMultiplier: number;      // Poverty, density, building quality
}

export interface ExtremeWeatherSystem {
  annualStormCount: number;
  categoryDistribution: [number, number, number, number, number];  // Cat 1-5
  regionalVulnerability: RegionalStormVulnerability[];
  stormEvents: StormEvent[];
  totalAnnualMortality: number;
}

export const STORM_CONSTANTS = {
  // Intensity multipliers (exponential with category)
  INTENSITY_MULTIPLIERS: [1, 2, 4, 8, 16] as const,  // Cat 1=1x, Cat 5=16x

  // Climate-driven frequency scaling per 1°C warming
  CAT_1_2_FREQUENCY_CHANGE: -0.05,     // -5% per degree
  CAT_3_FREQUENCY_CHANGE: 0.0,         // Stable
  CAT_4_5_FREQUENCY_CHANGE: 0.10,      // +10% per degree

  // Precipitation increase per 1°C warming
  PRECIPITATION_SCALING: 0.10,         // +10% per degree

  // Infrastructure mismatch multiplier
  INFRASTRUCTURE_MULTIPLIER_MAX: 3.0,  // Up to 3x mortality with zero infrastructure

  // Baseline global storm count (1980-2010 average)
  BASELINE_ANNUAL_STORMS: 90,          // Approximately 90 tropical cyclones/year globally
} as const;
```

**Core Functions:**

```typescript
/**
 * Generate storm category distribution based on climate state
 *
 * Research: Knutson et al. (2023), NOAA GFDL (2024)
 * Key finding: FEWER storms overall, but higher proportion Cat 4-5
 *
 * @param globalTempIncrease - °C above 1850-1900 baseline
 * @param baselineCount - Historical annual storm count
 * @param rng - Deterministic RNG function
 */
export function generateStormDistribution(
  globalTempIncrease: number,
  baselineCount: number,
  rng: () => number
): [number, number, number, number, number]

/**
 * Calculate mortality from single storm event (MDF framework)
 *
 * Research: Mendelsohn et al. (2012) - economic/mortality impacts
 * MDF = Magnitude × Duration × Frequency
 *
 * @param event - Storm event details
 * @param vulnerability - Regional vulnerability factors
 */
export function calculateStormMortality(
  event: StormEvent,
  vulnerability: RegionalStormVulnerability
): number

/**
 * Infrastructure mismatch multiplier
 *
 * Research: Section 1.3 of research doc - infrastructure gap is PRIMARY driver
 *
 * @param infrastructureCapacity - [0, 1] existing capacity
 * @param need - [0, 1] current need based on storm intensity
 */
export function infrastructureMismatchMultiplier(
  infrastructureCapacity: number,
  need: number
): number

/**
 * Initialize extreme weather system with regional baselines
 */
export function initializeExtremeWeatherSystem(): ExtremeWeatherSystem

/**
 * Update storm system for current month
 * Integrates with Bayesian mortality via addMortalityRisk()
 *
 * @param state - Game state (mutated)
 * @param rng - Deterministic RNG
 */
export function updateExtremeWeatherEvents(
  state: GameState,
  rng: () => number
): void
```

**Defensive Coding Requirements:**
- Use `assertFinite()` for all calculated mortality values
- Use `assertInRange()` for probabilities and multipliers
- Use `assertProbability()` for category distributions
- NO silent fallbacks (`?? 0` patterns)
- Validate `globalTempIncrease` is non-negative
- Ensure category distribution sums to total storm count

**Emoji Conventions:**
- 🌀 Tropical cyclones/storms
- 🌊 Storm surge
- 🌧️ Extreme precipitation
- 🏚️ Infrastructure damage
- ⚠️ Warnings/vulnerability

---

## 2. BII Framework Extension

### File: `src/simulation/planetaryBoundaries.ts` (extend existing)

**Research Basis:**
- IPBES (2024) - 54,000 species baseline
- Yoder et al. (2024) - Joshua Tree climate tracking
- U.S. National Park Service (2024) - Climate velocity impacts
- Richardson et al. (2024) - Planetary boundaries update

**New Type Definitions:**

```typescript
// Add to src/types/planetaryBoundaries.ts

export interface SpeciesGroup {
  name: string;
  count: number;                        // Number of species in group
  extinctionRate: number;               // E/MSY (extinctions per million species-years)
  isMigratory: boolean;                 // Can track climate velocity?
  dispersalCapacity: number;            // m/year (if not migratory)
  isKeystone: boolean;                  // Affects other species?
  habitatFragmentation: number;         // [0, 1] barrier to movement
}

export interface BiosphereIntegrityIndex {
  // IPBES 2024 baseline
  totalSpeciesBaseline: 54000;          // Comprehensive species count
  currentSpeciesCount: number;

  // Extinction rates
  backgroundExtinctionRate: 0.1;        // E/MSY (natural rate)
  currentExtinctionRate: number;        // E/MSY (10-100× background in 2025)

  // Species groups
  migratorySpecies: SpeciesGroup;
  nonMigratorySpecies: SpeciesGroup;
  keystoneSpecies: SpeciesGroup;

  // Climate tracking
  avgClimateVelocity: number;           // °C/year (how fast climate zones move)
  trackingFailureRate: number;          // [0, 1] proportion unable to track

  // Planetary boundary integration
  boundaryValue: number;                // [0, 2] normalized to boundary threshold
  tippingPointRisk: number;             // [0, 1]
}

export const BII_CONSTANTS = {
  // IPBES 2024 baseline
  TOTAL_SPECIES_2024: 54000,

  // Extinction rates (E/MSY)
  BACKGROUND_RATE: 0.1,
  CURRENT_RATE_2025: 10,                // 100x background

  // Non-migratory species climate tracking
  JOSHUA_TREE_CLIMATE_VELOCITY: 1.5,    // °C/year (example)
  JOSHUA_TREE_DISPERSAL: 0.4,           // m/year (too slow!)

  // Keystone species cascade multiplier
  KEYSTONE_CASCADE: 2.5,                // Affects 2.5× other species

  // Habitat fragmentation barrier
  FRAGMENTATION_BARRIER_MAX: 1.5,       // Up to 1.5× mortality increase
} as const;
```

**Core Functions to Add:**

```typescript
/**
 * Calculate non-migratory species mortality from climate velocity mismatch
 *
 * Research: Yoder et al. (2024) - Joshua Tree example
 * Key finding: Species with dispersal < climate velocity cannot track → extinction
 *
 * @param species - Species group with dispersal capacity
 * @param climateVelocity - °C/year climate zone movement
 * @param habitatFragmentation - [0, 1] barrier to movement
 */
export function calculateNonMigratoryMortality(
  species: SpeciesGroup,
  climateVelocity: number,
  habitatFragmentation: number
): number

/**
 * Update BII based on current climate state
 *
 * @param state - Game state (mutated)
 * @param rng - Deterministic RNG
 */
export function updateBiosphereIntegrityIndex(
  state: GameState,
  rng: () => number
): void

/**
 * Initialize BII system with 2025 baseline
 */
export function initializeBiosphereIntegrityIndex(): BiosphereIntegrityIndex
```

**Integration with Existing Boundary:**
Extend the existing `biosphere_integrity` boundary in `planetaryBoundaries.ts`:
- Update `currentValue` based on BII calculations
- Link `extinctionRate` to mortality risk
- Add species group tracking to boundary metadata

**Defensive Coding:**
- Use `assertFinite()` for extinction rates
- Use `assertInRange()` for boundary values [0, 2]
- Use `assertProbability()` for tracking failure rates
- Validate dispersal capacity > 0 for non-migratory species
- Ensure climate velocity calculations never produce NaN

**Emoji Conventions:**
- 🦋 Species extinction events
- 🌿 Ecosystem collapse
- 🏔️ Alpine species (trapped)
- 🏝️ Island endemics (isolated)
- 🌳 Keystone species

---

## 3. Phase Integration

### File: `src/simulation/engine/phases/ExtremeWeatherEventsPhase.ts`

**Phase Ordering:**
- Order: 15.5 (after WetBulbTemperaturePhase, before other environmental phases)
- Runs monthly (checks for storm events stochastically)

**Implementation Pattern:**

```typescript
import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateExtremeWeatherEvents } from '@/simulation/extremeWeatherEvents';

export class ExtremeWeatherEventsPhase implements SimulationPhase {
  readonly id = 'extreme-weather-events';
  readonly name = 'Extreme Weather Events';
  readonly order = 15.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    updateExtremeWeatherEvents(state, rng);
    return { events: [] };  // Events logged internally via addSimulationEvent
  }
}
```

### File: `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` (extend existing)

**Add BII updates to existing phase:**
- Import `updateBiosphereIntegrityIndex()`
- Call after other boundary updates
- Integrate extinction rate with `biosphere_integrity` boundary

---

## 4. GameState Extensions

### File: `src/types/game.ts`

**Add to GameState interface:**

```typescript
export interface GameState {
  // ... existing fields ...

  extremeWeatherSystem?: ExtremeWeatherSystem;
  biosphereIntegrityIndex?: BiosphereIntegrityIndex;
}
```

---

## 5. Initialization

### Update: `src/simulation/engine.ts`

Add initialization calls:

```typescript
import { initializeExtremeWeatherSystem } from './extremeWeatherEvents';
import { initializeBiosphereIntegrityIndex } from './planetaryBoundaries';

// In initializeSimulation() or similar:
state.extremeWeatherSystem = initializeExtremeWeatherSystem();
state.biosphereIntegrityIndex = initializeBiosphereIntegrityIndex();
```

---

## 6. Bayesian Mortality Integration

**Pattern (already used in wetBulbEvents.ts):**

```typescript
import { addMortalityRisk } from './bayesianMortality';

// For storm mortality:
addMortalityRisk(population, {
  type: 'environmental',
  baseRisk: calculatedMortality / population.count,
  proximate: 'extreme_weather',
  root: 'climate_change',
  confidence: 'HIGH',
  scope: 'REGIONAL',
  month: state.currentMonth,
  description: `Cat ${category} storm in ${region}, ${population.count} exposed`
});

// For species extinction mortality (indirect human impact):
addMortalityRisk(population, {
  type: 'environmental',
  baseRisk: ecosystemCollapseMortality,
  proximate: 'ecosystem_collapse',
  root: 'biosphere_degradation',
  confidence: 'MEDIUM',
  scope: 'GLOBAL',
  month: state.currentMonth,
  description: `${extinctionRate} E/MSY, ${trackingFailureRate}% species unable to track climate`
});
```

---

## 7. Testing & Validation

### TypeScript Compilation
```bash
npx tsc --noEmit
```

### Monte Carlo Validation (N≥10)
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_climate_phase2_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Check for:**
- No NaN errors in storm mortality calculations
- No NaN errors in BII calculations
- Storm category distribution sums correctly
- Extinction rates stay within reasonable bounds [0.1, 1000] E/MSY
- Outcome distributions make sense (storms increase mortality in climate scenarios)

### Unit Tests (if time permits)
```bash
npm test -- extremeWeatherEvents
npm test -- planetaryBoundaries
```

---

## 8. Success Criteria

✅ **Storm System:**
- Models category distribution shift (fewer total, more Cat 4-5)
- Exponential intensity multipliers (Cat 5 = 16× Cat 1)
- Infrastructure mismatch as primary mortality driver
- Regional vulnerability varies realistically
- Integrates with Bayesian mortality

✅ **BII Framework:**
- Tracks 54,000 species baseline (IPBES 2024)
- Non-migratory species show climate tracking failure
- Joshua Tree example works (1.5°C/year velocity, 0.4m/year dispersal)
- Keystone species cascade multipliers apply
- Updates `biosphere_integrity` planetary boundary

✅ **Quality:**
- TypeScript compiles without errors
- Monte Carlo runs complete without NaN
- Assertion utilities used throughout
- Research citations in JSDoc
- Emoji conventions followed

✅ **Integration:**
- ExtremeWeatherEventsPhase registered in orchestrator
- PlanetaryBoundariesPhase updated with BII
- GameState interface extended
- Engine initialization includes new systems

---

## 9. Research Citations (Required in Code)

**Storm Systems:**
- Knutson, T. R., et al. (2020). "Tropical Cyclones and Climate Change Assessment." *Bulletin of the American Meteorological Society*
- Knutson, T. R., et al. (2023). "Global Landfall Frequency Projections." *Bulletin of the American Meteorological Society*
- Emanuel, K. (2021). "Response of Global Tropical Cyclone Activity to Increasing CO2." *Journal of Climate*
- NOAA GFDL. (2024). "Global Warming and Hurricanes."
- EPA. (2024). "Climate Change Indicators: Tropical Cyclone Activity."

**BII Framework:**
- IPBES. (2024). "Global Assessment Report on Biodiversity and Ecosystem Services."
- Yoder, J. B., et al. (2024). "Reconstructing 120 years of climate change impacts on Joshua tree flowering." *Ecology Letters*
- U.S. National Park Service. (2024). "Climate Change in Joshua Tree."
- Richardson, K., et al. (2024). "Earth beyond six of nine planetary boundaries." *Science Advances*

---

## 10. Timeline

**Estimated:** 4-6 hours total
- Storm system implementation: 1.5-2 hours
- BII framework extension: 1.5-2 hours
- Phase integration: 0.5-1 hour
- Testing & validation: 0.5-1 hour

**Next Steps After Implementation:**
1. Architecture review (architecture-skeptic) - Quality Gate 2
2. Address CRITICAL/HIGH issues
3. Documentation (devlog + wiki update)
4. Archive plan (project-plan-manager)

---

## Notes

**Why This Implementation Matters:**
- Replaces random exogenous shocks with predictable climate models
- Research-backed parameters (no "tuning for fun")
- Captures key insight: FEWER but STRONGER storms
- Models species extinction via climate tracking failure
- Infrastructure mismatch as primary mortality driver (not just temperature)

**Defensive Philosophy:**
- Research simulation, not production app
- Invalid values = bugs to fix, not hide
- Fail loudly with full context
- No silent fallbacks in calculations
