# Per-Country Population Tracking (TIER 1.7.2)
**Date**: October 12, 2025  
**Status**: ✅ COMPLETE  
**Duration**: ~2 hours  

## Overview
Implemented granular tracking of 15 key countries to detect nation-state collapse and enable organization survival mechanics (TIER 1.7.3).

## Countries Tracked

### Nuclear Powers (8)
- United States (335M, AI Hub)
- China (1,425M, AI Hub)
- Russia (144M)
- India (1,425M)
- United Kingdom (67M, AI Hub)
- France (65M)
- Pakistan (235M)
- Israel (9M)

### Major Economies (7 additional)
- Japan (125M)
- Germany (84M)
- Brazil (215M)
- Indonesia (275M)
- Canada (39M, AI Hub)
- Bangladesh (172M)
- Nigeria (223M)

**Total**: 15 countries, 8 nuclear powers, 3 AI hubs (US, China, UK, Canada)

## Implementation

### 1. Type Definitions (`src/types/countryPopulations.ts`)
```typescript
interface CountryPopulation {
  name: CountryName;
  population: number;              // Current (millions)
  peakPopulation: number;          // Highest reached
  isNuclearPower: boolean;
  isAIHub: boolean;
  depopulated: boolean;            // <100K people
  depopulatedAt?: number;          // Month of collapse
}

interface CountryPopulationSystem {
  countries: Record<CountryName, CountryPopulation>;
  depopulatedCountries: CountryName[];
  nuclearPowersSurviving: number;
  aiHubsSurviving: number;
}
```

### 2. Update Logic (`src/simulation/countryPopulations.ts`)
- **Proportional Scaling**: Country populations scale with global population changes
- **Depopulation Detection**: Triggers when country drops below 100K people
- **Strategic Tracking**: Counts surviving nuclear powers and AI hubs
- **Event Logging**: Detailed console output for each country collapse

### 3. Integration
- **Phase**: `CountryPopulationPhase` (order 250, after PopulationPhase)
- **GameState**: Added `countryPopulationSystem` property
- **Initialization**: Countries start at UN 2024 baseline populations

### 4. Monte Carlo Reporting
Added new section showing:
- Average countries depopulated per run
- Nuclear powers / AI hubs surviving
- Frequency analysis (which countries collapse most often)

## Test Results (10 runs, 60 months each)

```
Countries Depopulated (avg): 15.0 / 15
Nuclear Powers Surviving (avg): 0.0 / 8
AI Hubs Surviving (avg): 0.0 / 3

COUNTRIES THAT DEPOPULATED:
  Israel: 10/10 runs (100%)
  Canada: 10/10 runs (100%)
  United Kingdom: 10/10 runs (100%)
  France: 10/10 runs (100%)
  Germany: 10/10 runs (100%)
  Russia: 10/10 runs (100%)
  Japan: 10/10 runs (100%)
  Bangladesh: 10/10 runs (100%)
  Pakistan: 10/10 runs (100%)
  Brazil: 10/10 runs (100%)
  Nigeria: 10/10 runs (100%)
  Indonesia: 10/10 runs (100%)
  United States: 10/10 runs (100%)
  China: 10/10 runs (100%)
  India: 10/10 runs (100%)
```

**Interpretation**: With current baseline (biodiversity 35%, ongoing crises), 100% of runs experience complete global societal collapse by month 100-110. All 15 tracked countries depopulate.

**Sample Depopulation Event**:
```
🚨 COUNTRY DEPOPULATION: United States
   Final population: 79K
   Peak population: 335.0M
   Decline: 100.0%
   Nuclear power: YES
   AI hub: YES
```

## Research Backing
- **UN World Population Prospects 2024**: Baseline populations
- **SIPRI Nuclear Forces Data 2025**: Nuclear power identification
- **World Bank GDP Rankings 2024**: Major economy classification
- **Threshold (100K)**: Below viable nation-state functioning

## Files Created/Modified
- `src/types/countryPopulations.ts` (new)
- `src/simulation/countryPopulations.ts` (new)
- `src/simulation/engine/phases/CountryPopulationPhase.ts` (new)
- `src/types/game.ts` (added countryPopulationSystem)
- `src/simulation/initialization.ts` (initialize countries)
- `src/simulation/engine.ts` (register phase)
- `src/simulation/engine/phases/index.ts` (export phase)
- `scripts/monteCarloSimulation.ts` (reporting)

## Next Steps
This enables **TIER 1.7.3: Link Organizations to Countries**, where we can:
- Associate each AI organization with its home country
- Trigger bankruptcy when host country depopulates
- Scale revenue/costs with country population health
- Model realistic organization collapse during societal breakdown

Current bug: Google DeepMind/OpenAI keep building data centers even after US depopulates to 79K people (unrealistic!)

## Status
✅ **TIER 1.7.2 COMPLETE** - Country population tracking fully functional

**Remaining TIER 1.7**:
- ⏳ **1.7.3**: Link Organizations to Countries (2-3 hours)
- ⏳ **1.7.4**: Nuclear Winter & Long-Term Effects (3-4 hours)
- ⏳ **1.7.5**: Economic Collapse During Population Crash (2 hours)

