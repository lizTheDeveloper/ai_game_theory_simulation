# Refugee Crisis System (TIER 1.5)

**Status**: ✅ Implemented and Merged to Main (October 2025)

## Overview

The Refugee Crisis System models gradual population displacement from war, climate disasters, famine, and ecosystem collapse. Unlike instant displacement, refugees flee over 3-5 years with 10% of the remaining population leaving each month, creating realistic cascading humanitarian crises.

## Core Features

### 1. Gradual Displacement Mechanics

**Key Innovation**: Displacement happens over time, not instantly.

**Displacement Rates**:
- **Nuclear war**: 12 months (rapid, 1 year)
- **Conventional war**: 48 months (medium, 4 years)
- **Climate disasters**: 60 months (slow, 5 years)
- **Famine**: 60 months (slow, 5 years)
- **Ecosystem collapse**: 60 months (slow, 5 years)

**Monthly Dynamics**:
```typescript
// Each month, 10% of remaining population flees
fleeingThisMonth = remainingInSource * 0.10;
remainingInSource -= fleeingThisMonth;
displacedPopulation += fleeingThisMonth;
currentlyDisplaced += fleeingThisMonth;

// 2% die in transit (UNHCR data)
transitDeaths = fleeingThisMonth * 0.02;
deathsInTransit += transitDeaths;
currentlyDisplaced -= transitDeaths;
```

**Example Timeline** (200M at risk):
- **Month 0**: 200M remaining, 0M displaced
- **Month 1**: 180M remaining, 20M flee (0.4M die in transit)
- **Month 2**: 162M remaining, 18M flee (0.36M die)
- **Month 3**: 145.8M remaining, 16.2M flee (0.32M die)
- **Month 12**: 56.3M remaining, 143.7M displaced (2.9M dead)
- **Month 24**: 15.9M remaining, 184.1M displaced (3.7M dead)
- **Month 48**: 0.8M remaining, 199.2M displaced (4.0M dead)

### 2. Crisis Types and Triggers

**War-Driven Displacement**:
- **Trigger**: Nuclear war, major conventional conflict
- **Duration**: 12-48 months
- **Mortality**: 2% transit + war casualties
- **Source regions**: Conflict zones
- **Category**: War deaths

**Climate-Driven Displacement**:
- **Trigger**: Extreme weather, sea level rise, compound climate extremes
- **Duration**: 60 months
- **Mortality**: 2% transit + ongoing climate deaths
- **Source regions**: Climate-vulnerable areas (MENA, South Asia, coastal)
- **Category**: Climate deaths

**Famine-Driven Displacement**:
- **Trigger**: Food system collapse, agricultural failure
- **Duration**: 60 months
- **Mortality**: 2% transit + starvation
- **Source regions**: Food-insecure regions
- **Category**: Famine deaths

**Ecosystem-Driven Displacement**:
- **Trigger**: Ecosystem collapse, biodiversity loss
- **Duration**: 60 months
- **Mortality**: 2% transit + ecosystem-related deaths
- **Source regions**: Ecosystem-dependent regions
- **Category**: Ecosystem deaths

### 3. Refugee Crisis State

**Data Structure**:
```typescript
interface RefugeeCrisis {
  // Identity
  id: string;
  cause: 'war' | 'climate' | 'famine' | 'ecosystem' | 'nuclear';
  sourceRegion: string;
  destRegion: string;

  // Population tracking (gradual displacement)
  potentialDisplaced: number;           // Total at risk (millions)
  remainingInSource: number;            // Still in source region
  displacedPopulation: number;          // Total that have fled
  currentlyDisplaced: number;           // In transit or camps

  // Gradual displacement mechanics
  displacementRate: number;             // 0.10 = 10% per month
  displacementDuration: number;         // Months to complete (12-60)
  displacementComplete: boolean;        // Has everyone fled?

  // Mortality tracking
  deathsInTransit: number;              // 2% of fleeing die
  deathsInSource: number;               // Deaths before fleeing

  // Timeline
  startMonth: number;
  monthsActive: number;
  resettlementStartMonth: number | null;
  monthsInResettlement: number;

  // Impact
  severity: number;                     // [0, 1] Crisis severity
  active: boolean;
  resolved: boolean;
}
```

### 4. Three-Phase Crisis Lifecycle

**Phase 1: Gradual Displacement** (Months 1-60)
```typescript
if (!crisis.displacementComplete && crisis.monthsActive <= crisis.displacementDuration) {
  // 10% of remaining population flees each month
  const fleeingThisMonth = crisis.remainingInSource * 0.10;
  crisis.remainingInSource -= fleeingThisMonth;
  crisis.displacedPopulation += fleeingThisMonth;
  crisis.currentlyDisplaced += fleeingThisMonth;

  // 2% die in transit (UNHCR: Libya crossing, Mediterranean, etc.)
  const transitDeaths = fleeingThisMonth * 0.02;
  crisis.deathsInTransit += transitDeaths;
  crisis.currentlyDisplaced -= transitDeaths;

  // Track transit deaths by category
  state.humanPopulationSystem.deathsByCategory[category] += transitDeaths / 1000;
}
```

**Phase 2: Camp Period** (Months 61-360)
```typescript
// Displacement complete, refugees in camps/transit
crisis.displacementComplete = true;
crisis.currentlyDisplaced = crisis.displacedPopulation - crisis.deathsInTransit;

// Waiting for resettlement (avg 5-10 years)
if (crisis.monthsActive >= 60 && crisis.resettlementStartMonth === null) {
  crisis.resettlementStartMonth = state.currentMonth;
}
```

**Phase 3: Resettlement** (Months 361+)
```typescript
// Generational integration (25 years = 300 months)
const resettlementProgress = crisis.monthsInResettlement / 300;
const settled = crisis.currentlyDisplaced * resettlementProgress;
crisis.currentlyDisplaced -= settled;

if (resettlementProgress >= 1.0) {
  crisis.resolved = true;
  crisis.active = false;
}
```

### 5. Regional Burden Distribution

**Refugee Burden** (receiving regions):
```typescript
// Refugees increase regional population pressure
region.refugeeBurden += inflowThisMonth;

// Strain on resources and infrastructure
resourceStrain = refugeeBurden / region.carryingCapacity;
socialTension = refugeeBurden / region.population;
```

**Emigration Pressure** (source regions):
```typescript
// Population loss from source region
region.emigrationPressure = fleeingPopulation / region.population;

// Economic and social disruption
economicCollapse = emigrationPressure > 0.3; // 30% population loss
brainDrain = emigrationPressure > 0.1; // 10% loss (educated flee first)
```

### 6. Transit Mortality

**UNHCR Data Basis**:
- Mediterranean crossing: 1-2% mortality
- Libya route: 2-3% mortality
- Saharan crossing: 5-10% mortality
- **Model uses 2%** as global average

**Mortality Factors**:
- Distance traveled
- Route danger (desert, sea, mountains)
- Smuggler exploitation
- Border violence
- Exposure and starvation

**Regional Variation** (not yet implemented):
- Safe corridors: 0.5% mortality
- Dangerous routes: 5% mortality
- War zones: 10% mortality

### 7. Cascading Crisis Dynamics

**Crisis Compounding**:
Multiple crises can affect same region:
```typescript
// Example: Middle East
crisis1: Climate disaster (drought) → 50M displaced
crisis2: War breaks out → 30M displaced
crisis3: Famine from agricultural collapse → 80M displaced

// Total: 160M displaced from 530M population (30% loss)
```

**Regional Collapse Threshold**:
- 10% displacement: Manageable with aid
- 20% displacement: Economic disruption
- 30% displacement: Regional instability
- 50% displacement: Complete collapse

**Destination Saturation**:
- Europe: 100M capacity (current: 750M)
- North America: 200M capacity (current: 580M)
- Overflow creates secondary crises

### 8. Integration with Population System

**Population Deduction**:
```typescript
// Source region loses population gradually
sourceRegion.population -= fleeingThisMonth;

// Global population decreases by transit deaths
state.humanPopulationSystem.population -= (transitDeaths / 1000); // Convert to billions
```

**Death Category Tracking**:
- Transit deaths counted in appropriate category (war, climate, famine, ecosystem)
- Separate from other crisis deaths
- Contributes to overall death toll

**Outcome Impact**:
- Large displacements reduce civilization viability
- Refugee burden strains receiving regions
- Social cohesion affected in both source and destination

## Research Sources

### 1. UNHCR Refugee Statistics (2023)
- **108.4M forcibly displaced** worldwide
- **35.3M refugees** under UNHCR mandate
- **5.4M asylum seekers**
- **62.5M internally displaced**

**Key Displacement Durations**:
- Syrian refugees: 12+ years (2011-2023)
- Afghan refugees: 40+ years (1979-2023)
- Palestinian refugees: 75+ years (1948-2023)
- **Model uses 25 years** (300 months) for full resettlement

### 2. Historical Displacement Rates

**Climate-Driven** (slow, 5 years):
- Dust Bowl (1930s): 2.5M over 10 years
- Pacific Island nations: Gradual migration over decades
- Sahel desertification: Ongoing over 30+ years

**War-Driven** (medium, 4 years):
- Syrian Civil War: 5M fled over 5 years (2011-2016)
- Ukraine War: 8M fled over 1 year (2022) [rapid conflict]
- WWII: 60M displaced over 6 years (1939-1945)

**Famine-Driven** (slow, 5 years):
- Somalia (2011): 1M displaced over 3 years
- Horn of Africa: Recurring crises, slow migration
- Sahel hunger crisis: Ongoing, gradual displacement

**Nuclear-Driven** (rapid, 1 year):
- Fukushima: 154K evacuated in 1 week
- Chernobyl: 116K evacuated in 2 weeks
- **Modeled as 12 months** for nuclear war scenario

### 3. Transit Mortality Research

**Mediterranean Route**:
- 2014-2023: 28,000 deaths, ~1.5M crossings = 1.9% mortality
- Libya route: Higher danger (smugglers, desert, no rescue)
- Eastern Mediterranean: Lower (shorter distance, more rescue)

**Land Routes**:
- Sahara crossing: 5-10% mortality (exposure, bandits)
- Balkan route: <1% mortality (land route, aid stations)
- US-Mexico border: 1-2% mortality (desert, exposure)

**Model Uses 2%**:
- Global average across all routes
- Includes sea, land, desert, mountain crossings
- Conservative estimate (some routes much higher)

## Crisis Creation Examples

### Climate Refugee Crisis
```typescript
{
  id: 'climate_crisis_2035_mena',
  cause: 'climate',
  sourceRegion: 'Middle East & North Africa',
  destRegion: 'Europe',
  potentialDisplaced: 120,              // 120M at risk
  remainingInSource: 120,               // All still in region initially
  displacedPopulation: 0,               // None have fled yet
  currentlyDisplaced: 0,
  displacementRate: 0.10,               // 10% per month
  displacementDuration: 60,             // 5 years
  displacementComplete: false,
  deathsInTransit: 0,
  deathsInSource: 0,
  startMonth: 120,                      // Year 2035
  severity: 0.85,                       // High severity
  active: true,
  resolved: false,
}
```

### War Refugee Crisis
```typescript
{
  id: 'nuclear_war_2038_east_asia',
  cause: 'nuclear',
  sourceRegion: 'East Asia',
  destRegion: 'Multiple',
  potentialDisplaced: 300,              // 300M at risk
  remainingInSource: 300,
  displacedPopulation: 0,
  currentlyDisplaced: 0,
  displacementRate: 0.10,
  displacementDuration: 12,             // 1 year (rapid)
  displacementComplete: false,
  deathsInTransit: 0,
  deathsInSource: 0,
  startMonth: 156,                      // Year 2038
  severity: 0.95,                       // Extreme
  active: true,
  resolved: false,
}
```

## Known Behaviors

**Gradual Build-Up**:
- Crises start small (10M/month) and build over time
- Total displaced population grows exponentially
- Transit deaths accumulate (2% × displaced)

**Cascading Effects**:
- One crisis can trigger another (famine → migration → conflict)
- Destination saturation creates secondary crises
- Regional collapse from 30%+ population loss

**Long-Term Burden**:
- Refugees remain displaced for 25+ years (generational)
- Camp populations persist for decades
- Resettlement is slow and incomplete

**Death Toll**:
- Transit deaths (2%) add to crisis mortality
- Source region deaths continue during displacement
- Total death toll = transit + source + destination strain

## Integration with Other Systems

### Population Dynamics
- Source regions lose population gradually
- Transit deaths reduce global population
- Regional demographics affected by loss of working-age adults

### Social Stability
- Refugee burden reduces social cohesion
- Anti-immigrant sentiment rises with saturation
- Receiving regions experience cultural tension

### Economic Systems
- Labor loss in source regions
- Resource strain in destination regions
- Economic disruption from mass displacement

### Quality of Life
- Overcrowding reduces QoL in destination regions
- Source region collapse reduces QoL
- Refugee camps are low QoL environments

## Configuration

**Displacement Rates**:
```typescript
{
  nuclear: 0.10,      // 10% per month over 12 months
  war: 0.10,          // 10% per month over 48 months
  climate: 0.10,      // 10% per month over 60 months
  famine: 0.10,       // 10% per month over 60 months
  ecosystem: 0.10,    // 10% per month over 60 months
}
```

**Transit Mortality**: 2% (UNHCR global average)

**Resettlement Duration**: 300 months (25 years, generational)

**Regional Capacity**:
- Determined by carrying capacity and existing population
- Saturation creates overflow crises

## Future Enhancements

**Potential Additions**:
- Route-specific mortality rates (Mediterranean vs Sahara)
- Destination choice modeling (language, proximity, aid)
- Camp conditions tracking (disease, malnutrition)
- Push/pull factors (economic opportunity, safety)
- Refugee return dynamics (post-conflict rebuilding)
- Climate refugee amplification (feedback loops)

**Not Yet Implemented**:
- Sub-regional displacement (within countries)
- Voluntary vs forced migration distinction
- Refugee integration success rates
- Second-generation refugee outcomes
- Internal displacement (IDPs) separate from refugees

## Files

**Core Implementation**:
- `src/simulation/refugeeCrises.ts` - Refugee crisis system
- `src/simulation/populationDynamics.ts` - Population integration

**Type Definitions**:
- `src/types/population.ts` - RefugeeCrisisSystem types

**Phase Orchestration**:
- `src/simulation/engine/phases/RefugeeCrisisPhase.ts` - Crisis update phase

**Testing**:
- `scripts/populationDynamicsMC.ts` - Includes refugee crisis testing

## See Also

- [Population Dynamics](population-dynamics.md) - Core population system
- [Regional Populations](population-dynamics.md#3-regional-population-system-phase-5) - Regional breakdown
- [Environmental System](environmental.md) - Climate triggers
- [Nuclear Deterrence](nuclear-deterrence.md) - War triggers
