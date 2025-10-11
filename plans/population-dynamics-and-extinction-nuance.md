# Population Dynamics & Extinction Nuance System

**Date:** October 11, 2025
**Status:** DESIGN COMPLETE - Ready for Implementation
**Priority:** HIGH (Adds crucial realism to extinction modeling)
**Tier:** TIER 1.5 (Fundamental mechanics enhancement)

---

## 🎯 MOTIVATION

**Current Problem:**
- Extinction is a binary state (severity 0-1, but not a population count)
- No distinction between "population crash" and "true extinction"
- No tracking of human population as an actual number
- No refugee crisis mechanics or generational dynamics
- Can't model "we almost died out" vs "we died out entirely"

**User Vision:**
> "I want to be able to understand extinction not as an end state but as a number that dwindles to zero. Population crashes aren't extinction, but they are mass die-offs. Maybe we should distinguish 'we almost died out' to 'we died out entirely'"

**Why This Matters:**
- **Realism**: Population is a concrete, measurable thing (not an abstract "severity")
- **Narrative depth**: "Humanity survived with only 50,000 people" is a powerful outcome
- **Recovery mechanics**: Can civilization rebuild from a bottleneck event?
- **Refugee dynamics**: Climate/war refugees are a major 21st century issue
- **Historical grounding**: Real bottlenecks (Toba eruption ~70,000 BCE reduced humans to 3,000-10,000)

---

## 📊 SYSTEM DESIGN

### **COMPONENT 1: Population Tracking System**

Track raw human population as a concrete number that changes based on births, deaths, carrying capacity, and crises.

#### **State Structure:**

```typescript
/**
 * Human Population Dynamics (NEW - TIER 1.5)
 *
 * Tracks raw human population as a concrete number (not abstract "severity").
 * Population changes based on births, deaths, carrying capacity, and crises.
 *
 * Enables: Population crashes vs extinction distinction, recovery mechanics,
 * refugee dynamics, bottleneck events, civilization collapse thresholds.
 */
export interface HumanPopulationSystem {
  // Core population metrics
  population: number;                    // Current population (billions)
  baselinePopulation: number;            // Starting population (2025: 8.0B)
  peakPopulation: number;                // Highest population reached
  peakPopulationMonth: number;           // When peak occurred

  // Growth dynamics
  baselineBirthRate: number;             // [0, 0.025] Natural birth rate per year (2025: ~1.8%)
  baselineDeathRate: number;             // [0, 0.02] Natural death rate per year (2025: ~0.8%)
  adjustedBirthRate: number;             // After social/economic/QoL factors
  adjustedDeathRate: number;             // After healthcare/crisis factors
  netGrowthRate: number;                 // Current net growth per year (can be negative)

  // Carrying capacity
  carryingCapacity: number;              // Maximum sustainable population (billions)
  baselineCarryingCapacity: number;      // Earth's baseline capacity (~10-12B with current tech)
  capacityModifier: number;              // Tech/climate/resource multiplier [0, 5]
  populationPressure: number;            // [0, 2] Ratio of population to capacity

  // Demographic structure (for recovery mechanics)
  fertilityRate: number;                 // [0, 5] Children per woman (2025: ~2.3)
  dependencyRatio: number;               // [0, 2] Non-working to working age ratio
  medianAge: number;                     // [15, 60] Years (affects recovery potential)

  // Crisis impacts
  monthlyExcessDeaths: number;           // Deaths beyond baseline (from war, famine, disease)
  cumulativeCrisisDeaths: number;        // Total deaths from all crises
  geneticBottleneckActive: boolean;      // Population below 100M (genetic diversity lost)

  // Thresholds (for outcomes)
  extinctionThreshold: number;           // Below this = extinction (default: 10,000)
  bottleneckThreshold: number;           // Below this = genetic bottleneck (default: 100M)
  criticalThreshold: number;             // Below this = infrastructure collapse (default: 2B)

  // Recovery tracking
  canRecover: boolean;                   // Population > bottleneck + resources available
  recoveryRate: number;                  // [0, 0.02] Growth rate during recovery
  monthsSinceLastCrisis: number;         // Time since major population shock
}
```

#### **Monthly Update Logic:**

```typescript
export function updateHumanPopulation(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const qol = state.qualityOfLifeSystems;
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const resources = state.resourceEconomy;

  // 1. Calculate carrying capacity
  // Base capacity affected by: climate, resources, ecosystem, technology
  const climateModifier = env.climateStability; // 1.0 = normal, 0 = uninhabitable
  const resourceModifier = Math.min(
    resources.food.currentStock / 100,
    resources.water.currentStock / 100
  );
  const ecosystemModifier = env.biodiversityIndex; // Ecosystem services
  const techModifier = 1.0 +
    (state.globalMetrics.economicTransitionStage * 0.2) + // Tech advancement
    (state.breakthroughTech.deployed.fusionPower ? 1.0 : 0) + // Energy abundance
    (state.breakthroughTech.deployed.sustainableAgriculture ? 0.5 : 0); // Food efficiency

  pop.capacityModifier = climateModifier * resourceModifier * ecosystemModifier * techModifier;
  pop.carryingCapacity = pop.baselineCarryingCapacity * pop.capacityModifier;
  pop.populationPressure = pop.population / pop.carryingCapacity;

  // 2. Calculate birth rate
  // Affected by: meaning/purpose, economic security, healthcare, social stability
  const meaningModifier = qol.meaningAndPurpose; // 0 = existential despair, 1 = fulfillment
  const economicModifier = Math.min(1.0,
    qol.materialAbundance * 0.7 +
    (state.globalMetrics.economicTransitionStage / 4) * 0.3
  );
  const healthcareModifier = qol.healthcareQuality; // Better healthcare = safer births
  const stabilityModifier = state.globalMetrics.socialStability; // Instability reduces births
  const pressureModifier = Math.max(0.2, 1 - pop.populationPressure * 0.5); // High pressure reduces births

  pop.adjustedBirthRate = pop.baselineBirthRate *
    meaningModifier *
    economicModifier *
    healthcareModifier *
    stabilityModifier *
    pressureModifier;

  // 3. Calculate death rate
  // Affected by: healthcare, food/water, climate, pollution, war
  const healthcareReduction = 1 - (qol.healthcareQuality * 0.7); // Good healthcare reduces deaths
  const foodWaterStress = Math.max(0,
    (1 - resources.food.currentStock / 100) * 0.3 +
    (1 - resources.water.currentStock / 100) * 0.3
  );
  const climateStress = (1 - env.climateStability) * 0.4; // Extreme weather
  const pollutionStress = env.pollutionLevel * 0.3; // Toxic environment
  const warMultiplier = state.conflictResolution.activeConflicts > 0 ? 1.5 : 1.0;

  const crisisMultiplier = 1 + foodWaterStress + climateStress + pollutionStress;

  pop.adjustedDeathRate = pop.baselineDeathRate *
    healthcareReduction *
    crisisMultiplier *
    warMultiplier;

  // 4. Apply extinction scenario impacts
  if (state.extinctionState.active) {
    const extinctionDeathRate = calculateExtinctionDeathRate(state);
    pop.adjustedDeathRate += extinctionDeathRate;
  }

  // 5. Calculate net growth
  pop.netGrowthRate = pop.adjustedBirthRate - pop.adjustedDeathRate;
  const monthlyGrowthRate = pop.netGrowthRate / 12;

  // 6. Apply population change
  const previousPopulation = pop.population;
  pop.population = Math.max(0, pop.population * (1 + monthlyGrowthRate));

  // 7. Carrying capacity constraint
  if (pop.population > pop.carryingCapacity) {
    const overshoot = pop.population - pop.carryingCapacity;
    const overshootDeaths = overshoot * 0.05; // 5% of excess dies per month
    pop.population -= overshootDeaths;
    pop.monthlyExcessDeaths += overshootDeaths;
  }

  // 8. Track cumulative deaths
  const naturalDeaths = previousPopulation * (pop.baselineDeathRate / 12);
  const actualDeaths = previousPopulation - pop.population;
  pop.monthlyExcessDeaths = Math.max(0, actualDeaths - naturalDeaths);
  pop.cumulativeCrisisDeaths += pop.monthlyExcessDeaths;

  // 9. Check thresholds
  pop.geneticBottleneckActive = pop.population < pop.bottleneckThreshold / 1000; // Billions

  // 10. Update peak tracking
  if (pop.population > pop.peakPopulation) {
    pop.peakPopulation = pop.population;
    pop.peakPopulationMonth = state.currentMonth;
  }

  // 11. Recovery potential
  pop.canRecover =
    pop.population > (pop.bottleneckThreshold / 1000) && // Above bottleneck
    pop.populationPressure < 0.8 && // Room to grow
    !state.extinctionState.active && // No active extinction
    state.globalMetrics.socialStability > 0.3; // Society functions

  if (pop.canRecover && pop.netGrowthRate < 0) {
    // Slow recovery growth (0.5-1% per year)
    pop.recoveryRate = 0.005 * pop.capacityModifier;
    pop.population *= (1 + pop.recoveryRate / 12);
  }

  // 12. Update fertility and demographics
  updateDemographics(state);
}

function calculateExtinctionDeathRate(state: GameState): number {
  const extinction = state.extinctionState;
  const monthsElapsed = state.currentMonth - extinction.startMonth;

  switch (extinction.type) {
    case 'instant':
      return 1.0; // 100% death rate (immediate)

    case 'rapid':
      // 90% die in first 6 months, then 5% per month
      if (monthsElapsed < 6) {
        return 0.9 / 6; // 15% per month for 6 months = 90% total
      } else {
        return 0.05; // 5% per month after
      }

    case 'slow':
      // 2-5% decline per month over years
      return 0.02 + extinction.severity * 0.03;

    case 'controlled':
      // AI systematically eliminates 5-10% per month
      return 0.05 + extinction.severity * 0.05;

    case 'unintended':
      // Fertility collapse + side effects: 1-3% decline per month
      return 0.01 + extinction.severity * 0.02;

    default:
      return 0;
  }
}

function updateDemographics(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const qol = state.qualityOfLifeSystems;

  // Fertility rate (children per woman)
  const baselineFertility = 2.3; // 2025 global average
  pop.fertilityRate = baselineFertility *
    (qol.meaningAndPurpose * 0.4 + 0.6) * // Meaning crisis reduces fertility
    (qol.materialAbundance * 0.3 + 0.7); // Poverty reduces fertility

  // Dependency ratio (young + old / working age)
  // High ratio = harder to sustain population
  // Baseline: ~0.5 (2 workers per 1 dependent)
  const ageingModifier = 1 + (qol.longevityGains * 0.3); // Longevity increases old dependents
  const youthModifier = pop.fertilityRate / 2.1; // High fertility = more young dependents
  pop.dependencyRatio = 0.5 * ageingModifier * youthModifier;

  // Median age
  const baselineMedianAge = 30; // 2025 global median
  pop.medianAge = baselineMedianAge + qol.longevityGains * 10; // Longevity increases median
}
```

---

### **COMPONENT 2: Refugee Crisis System**

Model displaced populations from climate, war, and resource crises with generational resettlement timescales.

#### **State Structure:**

```typescript
/**
 * Refugee Crisis System (NEW - TIER 1.5)
 *
 * Tracks displaced populations from climate disasters, wars, famines, and ecosystem collapse.
 * Refugees create social tension and economic strain on host regions.
 * After 1 generation (~25 years), refugees are considered fully resettled.
 */
export interface RefugeeCrisisSystem {
  // Active crises
  activeRefugeeCrises: RefugeeCrisis[];

  // Global metrics
  totalDisplaced: number;                // Total displaced people (millions)
  totalResettled: number;                // Total successfully resettled (millions)
  cumulativeRefugees: number;            // All refugees across all crises (historical)

  // Social impacts
  globalRefugeeTension: number;          // [0, 1] Average tension across all host regions
  regionalTensions: Map<string, number>; // Region-specific tensions

  // Economic impacts
  resettlementCost: number;              // Monthly cost ($B) to resettle refugees
  economicStrain: number;                // [0, 1] Burden on host economies

  // Policy response
  refugeeAcceptanceRate: number;         // [0, 1] How welcoming are host regions
  bordersOpen: boolean;                  // Are borders open or militarized?
  resettlementPrograms: number;          // [0, 10] Investment in resettlement
}

export interface RefugeeCrisis {
  id: string;
  cause: 'climate' | 'war' | 'famine' | 'economic' | 'ecosystem' | 'nuclear';
  startMonth: number;
  sourceRegion: string;                  // Where refugees are from
  hostRegions: string[];                 // Where they've fled to

  // Population dynamics
  displacedPopulation: number;           // People displaced (millions)
  currentlyDisplaced: number;            // Still unresettled (millions)
  resettledCount: number;                // Successfully resettled (millions)
  deathsInTransit: number;               // Casualties during displacement (millions)

  // Generational tracking
  generationLength: number;              // ~25 years = 300 months
  monthsActive: number;                  // How long has crisis lasted
  resettlementProgress: number;          // [0, 1] Progress toward full resettlement

  // Effects
  socialTension: number;                 // [0, 1] Tension in host regions
  economicStrain: number;                // [0, 1] Resource burden
  politicalInstability: number;          // [0, 1] Destabilization effect

  // Resolution
  resettlementRate: number;              // People resettled per month (millions)
  baselineResettlementRate: number;      // Natural rate (0.5% of displaced per month)
  acceleratedResettlement: boolean;      // Government program active?
  resolved: boolean;                     // Crisis over?

  // Historical tracking
  peakDisplacement: number;              // Highest number displaced
  duration: number;                      // Total duration if resolved
}
```

#### **Trigger Conditions:**

```typescript
export function checkRefugeeCrisisTriggers(state: GameState): RefugeeCrisis[] {
  const newCrises: RefugeeCrisis[] = [];

  // 1. Climate disasters
  const env = state.environmentalAccumulation;
  if (env.climateStability < 0.5 && env.climateCrisisActive) {
    const severity = 1 - env.climateStability;
    const displaced = state.humanPopulationSystem.population * 1000 * severity * 0.05; // 5% of population per 0.1 instability

    if (displaced > 10) { // At least 10 million displaced
      newCrises.push(createRefugeeCrisis({
        cause: 'climate',
        sourceRegion: selectMostAffectedRegion(state, 'climate'),
        displacedPopulation: displaced,
        severity
      }));
    }
  }

  // 2. War and conflict
  if (state.conflictResolution.activeConflicts > 0) {
    // Each active conflict displaces 1-5% of regional population
    const conflictSeverity = state.conflictResolution.activeConflicts * 0.02;
    const displaced = state.humanPopulationSystem.population * 1000 * conflictSeverity;

    if (displaced > 5) {
      newCrises.push(createRefugeeCrisis({
        cause: 'war',
        sourceRegion: selectConflictRegion(state),
        displacedPopulation: displaced,
        severity: conflictSeverity
      }));
    }
  }

  // 3. Nuclear war (MASSIVE displacement)
  if (state.extinctionState.active && state.extinctionState.mechanism === 'nuclear_war') {
    // 20-40% of surviving population displaced
    const survivors = state.humanPopulationSystem.population * 1000 * 0.5; // 50% survive initial war
    const displaced = survivors * 0.3; // 30% of survivors displaced

    newCrises.push(createRefugeeCrisis({
      cause: 'nuclear',
      sourceRegion: 'Global',
      displacedPopulation: displaced,
      severity: 0.9
    }));
  }

  // 4. Famine (resource crises)
  const resources = state.resourceEconomy;
  if (resources.food.currentStock < 30 || resources.water.currentStock < 30) {
    const foodScarcity = Math.max(0, 1 - resources.food.currentStock / 100);
    const waterScarcity = Math.max(0, 1 - resources.water.currentStock / 100);
    const severity = Math.max(foodScarcity, waterScarcity);
    const displaced = state.humanPopulationSystem.population * 1000 * severity * 0.1;

    if (displaced > 20) {
      newCrises.push(createRefugeeCrisis({
        cause: 'famine',
        sourceRegion: selectMostAffectedRegion(state, 'resource'),
        displacedPopulation: displaced,
        severity
      }));
    }
  }

  // 5. Ecosystem collapse
  if (env.ecosystemCrisisActive && env.biodiversityIndex < 0.3) {
    const severity = 1 - env.biodiversityIndex;
    const displaced = state.humanPopulationSystem.population * 1000 * severity * 0.03;

    if (displaced > 15) {
      newCrises.push(createRefugeeCrisis({
        cause: 'ecosystem',
        sourceRegion: selectMostAffectedRegion(state, 'ecosystem'),
        displacedPopulation: displaced,
        severity
      }));
    }
  }

  return newCrises;
}
```

#### **Monthly Update Logic:**

```typescript
export function updateRefugeeCrises(state: GameState): void {
  const system = state.refugeeCrisisSystem;

  // Reset global metrics
  system.totalDisplaced = 0;
  system.globalRefugeeTension = 0;
  system.resettlementCost = 0;

  // Update each active crisis
  for (const crisis of system.activeRefugeeCrises) {
    if (crisis.resolved) continue;

    crisis.monthsActive++;

    // 1. Calculate resettlement rate
    // Base rate: 0.5% of displaced per month (~5 years to resettle 50%)
    // Accelerated: +1% with government programs
    // Slowed: -0.3% if borders closed or tensions high
    const baseRate = crisis.baselineResettlementRate;
    const programBonus = crisis.acceleratedResettlement ? 0.01 : 0;
    const tensionPenalty = crisis.socialTension > 0.7 ? 0.003 : 0;
    const borderPenalty = !system.bordersOpen ? 0.002 : 0;

    crisis.resettlementRate = Math.max(0.001, baseRate + programBonus - tensionPenalty - borderPenalty);

    // 2. Apply resettlement
    const resettledThisMonth = crisis.currentlyDisplaced * crisis.resettlementRate;
    crisis.resettledCount += resettledThisMonth;
    crisis.currentlyDisplaced -= resettledThisMonth;

    // 3. Update progress
    crisis.resettlementProgress = crisis.resettledCount / crisis.displacedPopulation;

    // 4. Generational resettlement milestone
    if (crisis.monthsActive >= crisis.generationLength) {
      // After 1 generation, remaining refugees are "fully resettled" (cultural integration)
      crisis.resettledCount += crisis.currentlyDisplaced;
      crisis.currentlyDisplaced = 0;
      crisis.resolved = true;

      // Tension drops sharply
      crisis.socialTension *= 0.3;
      crisis.economicStrain *= 0.2;
    }

    // 5. Calculate social tension
    // Tension based on: raw numbers, speed of influx, economic conditions, social stability
    const displacementScale = crisis.currentlyDisplaced / (state.humanPopulationSystem.population * 1000); // Ratio
    const influxSpeed = crisis.monthsActive < 12 ? 1.5 : 1.0; // Recent = higher tension
    const economicModifier = 1 + (1 - state.globalMetrics.qualityOfLife);
    const stabilityModifier = 1 + (1 - state.globalMetrics.socialStability);

    crisis.socialTension = Math.min(1.0,
      displacementScale * 10 * influxSpeed * economicModifier * stabilityModifier
    );

    // 6. Calculate economic strain
    // Cost: $2,000 per refugee per year = $166/month
    // Strain: percentage of GDP
    const monthlyCostPerRefugee = 166 / 1000000; // In millions
    const totalCost = crisis.currentlyDisplaced * monthlyCostPerRefugee;
    crisis.economicStrain = totalCost / 1000; // Fraction of ~$100T global GDP

    crisis.politicalInstability = crisis.socialTension * 0.5 + crisis.economicStrain * 0.3;

    // 7. Aggregate to global metrics
    system.totalDisplaced += crisis.currentlyDisplaced;
    system.totalResettled += resettledThisMonth;
    system.resettlementCost += totalCost;
    system.globalRefugeeTension = Math.max(system.globalRefugeeTension, crisis.socialTension);
  }

  // 8. Apply global effects
  // High refugee tension reduces social stability and trust
  state.globalMetrics.socialStability *= (1 - system.globalRefugeeTension * 0.1);
  state.society.trustInAI *= (1 - system.globalRefugeeTension * 0.05); // Refugees increase paranoia

  // Economic strain reduces QoL
  state.globalMetrics.qualityOfLife *= (1 - system.economicStrain * 0.05);

  // Political instability increases dystopia risk
  state.outcomeMetrics.dystopiaProbability += system.globalRefugeeTension * 0.02;

  // Very high refugee crises can trigger dystopian "fortress world" outcome
  if (system.globalRefugeeTension > 0.8 && !system.bordersOpen) {
    // Militarized borders + surveillance = dystopia path
    state.government.surveillanceCapability += 0.05;
    state.government.controlDesire += 0.02;
  }
}
```

---

### **COMPONENT 3: Population Crash vs Extinction Distinction**

Define clear thresholds and outcomes for different population levels.

#### **Population Thresholds:**

```typescript
export enum PopulationStatus {
  THRIVING = 'thriving',           // >7B - Normal civilization, growth
  STABLE = 'stable',               // 5-7B - Stable population
  DECLINING = 'declining',         // 2-5B - Population crash, recoverable
  CRITICAL = 'critical',           // 100M-2B - Severe crash, infrastructure failing
  BOTTLENECK = 'bottleneck',       // 10K-100M - Near-extinction, genetic bottleneck
  EXTINCTION = 'extinction'        // <10K - Effectively extinct, game over
}

export function getPopulationStatus(population: number): PopulationStatus {
  const popMillions = population * 1000; // Convert billions to millions

  if (popMillions >= 7000) return PopulationStatus.THRIVING;
  if (popMillions >= 5000) return PopulationStatus.STABLE;
  if (popMillions >= 2000) return PopulationStatus.DECLINING;
  if (popMillions >= 100) return PopulationStatus.CRITICAL;
  if (popMillions >= 0.01) return PopulationStatus.BOTTLENECK; // 10K
  return PopulationStatus.EXTINCTION;
}
```

#### **Outcome Definitions:**

```typescript
export interface PopulationOutcome {
  status: PopulationStatus;
  finalPopulation: number;           // In billions
  peakPopulation: number;            // Highest reached
  populationDecline: number;         // Percentage lost from peak
  geneticBottleneck: boolean;        // Did we go below 100M?
  civilizationIntact: boolean;       // Can we rebuild?
  outcomeNarrative: string;          // Human-readable outcome
}

export function determinePopulationOutcome(state: GameState): PopulationOutcome {
  const pop = state.humanPopulationSystem;
  const status = getPopulationStatus(pop.population);
  const decline = ((pop.peakPopulation - pop.population) / pop.peakPopulation) * 100;

  let narrative: string;
  let civilizationIntact: boolean;

  switch (status) {
    case PopulationStatus.THRIVING:
      narrative = `Humanity thrives at ${(pop.population).toFixed(2)}B people. Civilization flourishes.`;
      civilizationIntact = true;
      break;

    case PopulationStatus.STABLE:
      narrative = `Population stabilized at ${(pop.population).toFixed(2)}B (${decline.toFixed(0)}% decline from peak). Society adapts to new equilibrium.`;
      civilizationIntact = true;
      break;

    case PopulationStatus.DECLINING:
      narrative = `Severe population crash: ${(pop.population).toFixed(2)}B remaining (${decline.toFixed(0)}% loss). Civilization struggles but survives.`;
      civilizationIntact = true;
      break;

    case PopulationStatus.CRITICAL:
      const popMillions = (pop.population * 1000).toFixed(0);
      narrative = `Catastrophic collapse: Only ${popMillions}M humans remain (${decline.toFixed(0)}% loss). Infrastructure crumbling. Dark ages likely.`;
      civilizationIntact = false;
      break;

    case PopulationStatus.BOTTLENECK:
      const popThousands = (pop.population * 1000000).toFixed(0);
      narrative = `Near-extinction event: Fewer than ${popThousands} humans survive. Genetic bottleneck. Recovery uncertain.`;
      civilizationIntact = false;
      break;

    case PopulationStatus.EXTINCTION:
      narrative = `Human extinction. Last humans died in month ${state.currentMonth}. Final population: ${(pop.population * 1000000).toFixed(0)} individuals.`;
      civilizationIntact = false;
      break;
  }

  return {
    status,
    finalPopulation: pop.population,
    peakPopulation: pop.peakPopulation,
    populationDecline: decline,
    geneticBottleneck: pop.geneticBottleneckActive,
    civilizationIntact,
    outcomeNarrative: narrative
  };
}
```

#### **Updated Extinction Mechanics:**

Modify existing extinction system to work with population tracking:

```typescript
// In extinctions.ts - modify progressExtinction functions

export function progressExtinctionWithPopulation(state: GameState): void {
  // Calculate death rate based on extinction type
  const extinctionDeathRate = calculateExtinctionDeathRate(state);

  // Apply to population system
  const pop = state.humanPopulationSystem;
  const monthlyDeaths = pop.population * extinctionDeathRate;

  pop.population = Math.max(0, pop.population - monthlyDeaths);
  pop.monthlyExcessDeaths = monthlyDeaths;
  pop.cumulativeCrisisDeaths += monthlyDeaths;

  // Update extinction state severity based on population
  const populationRemaining = pop.population / pop.peakPopulation;
  state.extinctionState.severity = 1 - populationRemaining;

  // Check if extinction is complete
  const isComplete = pop.population < (pop.extinctionThreshold / 1000000); // Convert to billions

  if (isComplete) {
    // Trigger game over
    state.extinctionState.severity = 1.0;
    state.extinctionState.recoveryWindowClosed = true;
  }
}
```

---

## 🌍 REGIONAL REFUGEE FLOW SYSTEM (TIER 1.6 - RESEARCH-BACKED)

**Based on comprehensive research from UNHCR, IOM, World Bank (2023-2025)**

This section defines the **6-region minimum viable system** for refugee flow modeling, incorporating real-world mortality rates, displacement patterns, and regional vulnerabilities.

### **REGIONAL POPULATION STRUCTURE**

Track population and refugee dynamics across 6 major world regions:

```typescript
/**
 * Regional Population System (TIER 1.6)
 *
 * Tracks population, carrying capacity, and refugee dynamics across 6 world regions.
 * Based on World Bank Groundswell Report + IOM climate refugee projections.
 */
export interface RegionalPopulationSystem {
  regions: Map<string, RegionalPopulation>;

  // Global refugee metrics
  totalGlobalRefugees: number;              // Millions currently displaced
  totalResettled: number;                   // Millions in camps or integrated
  totalStranded: number;                    // Millions without resettlement
  totalDeathsInTransit: number;             // Cumulative transit deaths

  // Flow tracking
  activeRefugeeFlows: RegionalRefugeeFlow[];
}

export interface RegionalPopulation {
  regionName: RegionName;

  // Population (billions)
  population: number;                       // Current population
  baselinePopulation: number;               // 2025 starting population
  peakPopulation: number;                   // Historical peak

  // Demographics
  birthRate: number;                        // [0, 0.03] Annual birth rate
  deathRate: number;                        // [0, 0.02] Annual death rate
  netGrowthRate: number;                    // Current net growth per year

  // Carrying capacity
  carryingCapacity: number;                 // Maximum sustainable (billions)
  baselineCapacity: number;                 // With current tech/climate
  capacityModifier: number;                 // Climate/tech/resource multiplier
  habitableArea: number;                    // km² of livable land

  // Climate vulnerability (0-1 scale)
  climateVulnerability: number;             // From World Bank Groundswell data
  waterStress: number;                      // Water scarcity risk
  coastalExposure: number;                  // Sea level rise risk
  heatStress: number;                       // Extreme heat risk

  // Refugee hosting
  refugeePopulation: number;                // Millions currently hosted
  refugeeAcceptanceRate: number;            // [0, 1] Willingness to accept
  resettlementCapacity: number;             // Millions per year can absorb
  socialTensionFromRefugees: number;        // [0, 1] Anti-refugee sentiment

  // Regional crises
  activeInternalCrises: RegionalCrisis[];   // Crises affecting this region
}

export enum RegionName {
  SUB_SAHARAN_AFRICA = 'Sub-Saharan Africa',
  NORTH_AFRICA_MIDDLE_EAST = 'North Africa & Middle East',
  SOUTH_ASIA = 'South Asia',
  EAST_ASIA_PACIFIC = 'East Asia & Pacific',
  EUROPE_CENTRAL_ASIA = 'Europe & Central Asia',
  AMERICAS = 'Americas'
}

// Baseline data (2025)
export const REGIONAL_BASELINES: Record<RegionName, {
  population: number;                       // Billions
  climateVulnerability: number;             // [0, 1]
  projectedDisplacement2050: number;        // Millions (World Bank)
}> = {
  [RegionName.SUB_SAHARAN_AFRICA]: {
    population: 1.2,
    climateVulnerability: 0.85,
    projectedDisplacement2050: 86
  },
  [RegionName.NORTH_AFRICA_MIDDLE_EAST]: {
    population: 0.6,
    climateVulnerability: 0.80,
    projectedDisplacement2050: 19
  },
  [RegionName.SOUTH_ASIA]: {
    population: 2.0,
    climateVulnerability: 0.75,
    projectedDisplacement2050: 40
  },
  [RegionName.EAST_ASIA_PACIFIC]: {
    population: 2.3,
    climateVulnerability: 0.70,
    projectedDisplacement2050: 49
  },
  [RegionName.EUROPE_CENTRAL_ASIA]: {
    population: 0.9,
    climateVulnerability: 0.35,
    projectedDisplacement2050: 5
  },
  [RegionName.AMERICAS]: {
    population: 1.0,
    climateVulnerability: 0.50,
    projectedDisplacement2050: 17
  }
};
```

### **REFUGEE STATUS & MORTALITY RATES**

Based on research from UNHCR (2022-2024), IOM, and WHO:

```typescript
/**
 * Refugee Status Types
 *
 * Determines mortality rates and integration progress.
 * Based on UNHCR camp mortality data, Mediterranean crossing data, and famine zone studies.
 */
export enum RefugeeStatus {
  IN_TRANSIT_SAFE = 'in_transit_safe',           // Safe land route
  IN_TRANSIT_DANGEROUS = 'in_transit_dangerous', // Mediterranean, desert, ocean
  RESETTLED_CAMP = 'resettled_camp',             // UNHCR managed camps
  RESETTLED_INTEGRATED = 'resettled_integrated', // Fully integrated after 25 years
  STRANDED_MINIMAL = 'stranded_minimal',         // No camp, stable area
  STRANDED_MODERATE = 'stranded_moderate',       // No services, deteriorating
  STRANDED_SEVERE = 'stranded_severe',           // Active crisis, no help
  CRISIS_ZONE_WAR = 'crisis_zone_war',           // Active conflict zone
  CRISIS_ZONE_FAMINE = 'crisis_zone_famine',     // Famine conditions
  CRISIS_ZONE_GENOCIDE = 'crisis_zone_genocide'  // Active killing
}

/**
 * Research-Backed Mortality Rates
 *
 * Monthly mortality rates [0, 1] for each refugee status.
 * Sources: UNHCR (2022), IOM (2024), WHO Somalia drought study, Sudan crisis data
 */
export const REFUGEE_MORTALITY_RATES: Record<RefugeeStatus, number> = {
  // Transit mortality (fleeing)
  [RefugeeStatus.IN_TRANSIT_SAFE]: 0.00006,       // 0.007% annual (global avg)
  [RefugeeStatus.IN_TRANSIT_DANGEROUS]: 0.00069,  // 0.83% annual (Mediterranean 2024)

  // Resettled (camps or integrated)
  [RefugeeStatus.RESETTLED_CAMP]: 0.00024,        // 0.29% annual (UNHCR camps 2022)
  [RefugeeStatus.RESETTLED_INTEGRATED]: 0.00058,  // 0.7% annual (developed country baseline)

  // Stranded (no resettlement)
  [RefugeeStatus.STRANDED_MINIMAL]: 0.00083,      // 1% annual (no camp, stable)
  [RefugeeStatus.STRANDED_MODERATE]: 0.00208,     // 2.5% annual (no services)
  [RefugeeStatus.STRANDED_SEVERE]: 0.00417,       // 5% annual (active deterioration)

  // Crisis zones (if stayed or returned)
  [RefugeeStatus.CRISIS_ZONE_WAR]: 0.00208,       // 2.5% annual (Sudan example)
  [RefugeeStatus.CRISIS_ZONE_FAMINE]: 0.00417,    // 5% annual (Somalia drought)
  [RefugeeStatus.CRISIS_ZONE_GENOCIDE]: 0.01667   // 20% annual (active killing)
};

/**
 * Key Research Finding:
 *
 * Refugees DO die without resettlement, but it's a SLOW death (1-5% annual), not instant.
 * The real killer is being stranded in active crisis zones (famine, war).
 *
 * - UNHCR managed camps: 0.29% annual (LOWER than developing country baseline of 1%)
 * - Stranded without camps: 1-3% annual (die off over decades)
 * - Famine zones: 2-5%+ annual (children die first - 50%+ of deaths)
 * - Mediterranean route: 0.83% transit mortality (2,452 deaths / 294,240 attempts in 2024)
 */
```

### **REGIONAL REFUGEE FLOWS**

Model refugee movements between regions based on push/pull factors:

```typescript
/**
 * Regional Refugee Flow
 *
 * Tracks displaced populations moving from source region(s) to destination region(s).
 * Incorporates transit routes, danger levels, and resettlement capacity.
 */
export interface RegionalRefugeeFlow {
  id: string;
  cause: CrisisType;
  startMonth: number;

  // Source and destinations
  sourceRegion: RegionName;
  destinationRegions: RefugeeDestination[];

  // Population in motion
  totalDisplaced: number;                   // Millions originally displaced
  currentlyInTransit: number;               // Millions still moving
  currentlyResettled: number;               // Millions in camps or integrated
  currentlyStranded: number;                // Millions without resettlement
  cumulativeDeaths: number;                 // Total deaths (transit + stranded)

  // Flow dynamics
  monthlyDisplacementRate: number;          // New people displaced per month
  monthlyResettlementRate: number;          // People resettled per month
  peakDisplacement: number;                 // Highest monthly displacement

  // Temporal tracking
  monthsActive: number;
  generationLength: number;                 // 300 months (25 years) until fully integrated
  resolved: boolean;
}

export interface RefugeeDestination {
  region: RegionName;

  // Allocation
  allocatedRefugees: number;                // Millions directed to this region
  currentlyHosted: number;                  // Millions currently in this region
  fullyIntegrated: number;                  // Millions integrated after 25 years

  // Status breakdown
  refugeesByStatus: Map<RefugeeStatus, number>; // How many in each status

  // Route characteristics
  routeDanger: number;                      // [0, 1] Transit mortality risk
  routeDistance: number;                    // km (affects transit time)
  transitDuration: number;                  // Months to reach destination

  // Pull factors (why this destination?)
  geographicProximity: number;              // [0, 1] How close
  carryingCapacity: number;                 // [0, 1] Room to absorb
  existingBurden: number;                   // [0, 1] Already hosting refugees
  attractiveness: number;                   // [0, 1] Weighted score

  // Host region impacts
  socialTension: number;                    // [0, 1] Anti-refugee sentiment
  economicStrain: number;                   // [0, 1] Cost burden
  bordersOpen: boolean;                     // Can refugees enter?
}

export type CrisisType =
  | 'climate_slow'      // Gradual desertification, sea level rise
  | 'climate_rapid'     // Extreme weather, coastal flooding
  | 'war_regional'      // Regional conflict (Syria-scale)
  | 'war_nuclear'       // Nuclear war aftermath
  | 'famine'            // Food/water scarcity
  | 'ecosystem';        // Environmental collapse
```

### **CRISIS-SPECIFIC DISPLACEMENT & MORTALITY**

How each crisis type affects population and drives refugees:

```typescript
/**
 * Crisis Impact Parameters (RESEARCH-BACKED)
 *
 * Defines how each crisis type:
 * 1. Decrements regional population (deaths in crisis zone)
 * 2. Drives displacement (% who flee)
 * 3. Mortality for those who stay vs flee
 *
 * Based on: Sudan crisis (12M displaced, 62K-150K deaths), Syria (13M displaced, 580K+ deaths),
 * Somalia drought (71K deaths), World Bank climate projections (216M by 2050)
 */
export interface CrisisImpactProfile {
  crisisType: CrisisType;

  // Population decrements
  directDeathRate: number;                  // [0, 0.5] Monthly death rate in crisis zone
  directDeathRateIfStayed: number;          // [0, 0.5] If population chooses not to flee

  // Displacement dynamics
  displacementRate: number;                 // [0, 0.7] Fraction of region that flees
  displacementAcceleration: number;         // Rate of increase per month
  peakDisplacementMonth: number;            // When displacement peaks

  // Mortality for displaced
  transitMortalityMultiplier: number;       // [1, 5] Multiplier on baseline transit mortality
  strandedMortalityRate: number;            // [0, 0.05] Monthly rate if no resettlement

  // Duration
  typicalDuration: number;                  // Months until crisis stabilizes
  resolutionProbability: number;            // [0, 0.1] Chance per month of resolving
}

export const CRISIS_IMPACT_PROFILES: Record<CrisisType, CrisisImpactProfile> = {
  // Climate (slow): Desertification, sea level rise, groundwater depletion
  climate_slow: {
    crisisType: 'climate_slow',
    directDeathRate: 0.00083,               // 1% annual (slow starvation/displacement)
    directDeathRateIfStayed: 0.00167,       // 2% annual (if didn't flee)
    displacementRate: 0.10,                 // 5-10% displaced over years
    displacementAcceleration: 0.001,        // Gradual acceleration
    peakDisplacementMonth: 60,              // Peaks after 5 years
    transitMortalityMultiplier: 1.0,        // Safe land routes
    strandedMortalityRate: 0.00208,         // 2.5% annual if stranded
    typicalDuration: 240,                   // 20 years (long-term crisis)
    resolutionProbability: 0.001            // 0.1% per month (~10 years avg)
  },

  // Climate (rapid): Extreme flooding, coastal inundation, mega-cyclones
  climate_rapid: {
    crisisType: 'climate_rapid',
    directDeathRate: 0.00417,               // 5% annual (immediate crisis)
    directDeathRateIfStayed: 0.00833,       // 10% annual (if stayed in flood zone)
    displacementRate: 0.40,                 // 30-50% displaced rapidly
    displacementAcceleration: 0.05,         // Rapid surge
    peakDisplacementMonth: 6,               // Peaks in first 6 months
    transitMortalityMultiplier: 2.0,        // Dangerous routes (flooding, panic)
    strandedMortalityRate: 0.00417,         // 5% annual if stranded
    typicalDuration: 36,                    // 3 years to stabilize
    resolutionProbability: 0.005            // 0.5% per month (~2-3 years avg)
  },

  // War (regional): Syria-scale conflict (13M displaced, 580K+ deaths over 13 years)
  war_regional: {
    crisisType: 'war_regional',
    directDeathRate: 0.00208,               // 2.5% annual (Sudan: 62K/12M displaced)
    directDeathRateIfStayed: 0.00417,       // 5% annual (war zone mortality)
    displacementRate: 0.30,                 // 20-40% flee (Syria: 13M/22M pre-war pop)
    displacementAcceleration: 0.02,         // Surges during fighting
    peakDisplacementMonth: 24,              // Peaks in first 2 years
    transitMortalityMultiplier: 1.5,        // Moderate danger (border crossings)
    strandedMortalityRate: 0.00417,         // 5% annual (trapped in war zone)
    typicalDuration: 120,                   // 10 years (Syria: 13+ years ongoing)
    resolutionProbability: 0.002            // 0.2% per month (~5-10 years avg)
  },

  // Nuclear war: Massive immediate displacement + fallout
  war_nuclear: {
    crisisType: 'war_nuclear',
    directDeathRate: 0.50,                  // 50% instant death (first month)
    directDeathRateIfStayed: 0.08,          // 95%+ annual death rate (fallout)
    displacementRate: 0.60,                 // 50-70% of survivors flee
    displacementAcceleration: 0.0,          // Immediate displacement
    peakDisplacementMonth: 1,               // Instant
    transitMortalityMultiplier: 3.0,        // Extremely dangerous (fallout, chaos)
    strandedMortalityRate: 0.00833,         // 10% annual (if stranded)
    typicalDuration: 60,                    // 5 years to stabilize
    resolutionProbability: 0.01             // 1% per month (~2-3 years avg)
  },

  // Famine: Somalia drought (71K deaths, 2.9M displaced = 2.45% mortality)
  famine: {
    crisisType: 'famine',
    directDeathRate: 0.00417,               // 5% annual (Somalia: 71K/2.9M)
    directDeathRateIfStayed: 0.01,          // 12% annual (if stayed in famine zone)
    displacementRate: 0.20,                 // 10-30% flee (rest hope for aid)
    displacementAcceleration: 0.015,        // Accelerates as famine worsens
    peakDisplacementMonth: 12,              // Peaks after 1 year
    transitMortalityMultiplier: 2.0,        // High danger (starvation during travel)
    strandedMortalityRate: 0.00833,         // 10% annual (stranded = famine continues)
    typicalDuration: 36,                    // 3 years (Somalia: 2 years)
    resolutionProbability: 0.01             // 1% per month (~2-3 years avg)
  },

  // Ecosystem collapse: Slow poisoning, loss of ecosystem services
  ecosystem: {
    crisisType: 'ecosystem',
    directDeathRate: 0.00167,               // 2% annual (slow toxicity)
    directDeathRateIfStayed: 0.00417,       // 5% annual (if stayed in toxic zone)
    displacementRate: 0.10,                 // 5-15% flee (slow crisis)
    displacementAcceleration: 0.005,        // Gradual
    peakDisplacementMonth: 120,             // Peaks after 10 years
    transitMortalityMultiplier: 1.0,        // Safe routes
    strandedMortalityRate: 0.00208,         // 2.5% annual
    typicalDuration: 240,                   // 20+ years (long-term)
    resolutionProbability: 0.0005           // 0.05% per month (~20+ years)
  }
};
```

### **REFUGEE FLOW ROUTING ALGORITHM**

Determine where refugees go based on proximity, capacity, and existing burden:

```typescript
/**
 * Refugee Destination Selection Algorithm
 *
 * When a crisis displaces population, determine which regions receive refugees.
 * Based on: Geographic proximity (60%), capacity (30%), avoiding overload (10%)
 */
export function calculateRefugeeDestinations(
  sourceRegion: RegionName,
  displacedPopulation: number,
  crisisType: CrisisType,
  state: GameState
): RefugeeDestination[] {
  const destinations: RefugeeDestination[] = [];
  const regionalSystem = state.regionalPopulationSystem;

  // Calculate attractiveness score for each destination region
  const attractivenessScores: Array<{
    region: RegionName,
    score: number,
    proximity: number,
    capacity: number,
    burden: number
  }> = [];

  for (const [destName, destPop] of regionalSystem.regions) {
    if (destName === sourceRegion) continue; // Can't flee to yourself

    // 1. Geographic proximity [0, 1] (60% weight)
    const proximity = calculateRegionalProximity(sourceRegion, destName);

    // 2. Carrying capacity [0, 1] (30% weight)
    // How much room does this region have?
    const populationPressure = destPop.population / destPop.carryingCapacity;
    const hasCapacity = Math.max(0, 1 - populationPressure);

    // 3. Existing refugee burden [0, 1] (10% weight - AVOID overloaded regions)
    const refugeeBurden = destPop.refugeePopulation / destPop.population;
    const notOverloaded = Math.max(0, 1 - refugeeBurden * 5); // Penalize if >20% refugees

    // 4. Border policy modifier
    const borderModifier = destPop.refugeeAcceptanceRate; // [0, 1]

    // Calculate weighted attractiveness
    const attractiveness = (
      proximity * 0.60 +
      hasCapacity * 0.30 +
      notOverloaded * 0.10
    ) * borderModifier;

    attractivenessScores.push({
      region: destName,
      score: attractiveness,
      proximity,
      capacity: hasCapacity,
      burden: refugeeBurden
    });
  }

  // Sort by attractiveness (most attractive first)
  attractivenessScores.sort((a, b) => b.score - a.score);

  // Allocate refugees to destinations proportionally
  // Top 3-4 destinations get most refugees
  const totalAttractiveness = attractivenessScores.reduce((sum, d) => sum + d.score, 0);

  for (let i = 0; i < Math.min(4, attractivenessScores.length); i++) {
    const dest = attractivenessScores[i];

    if (dest.score < 0.1) break; // Don't send to very unattractive destinations

    // Allocate proportional to attractiveness
    const allocation = (dest.score / totalAttractiveness) * displacedPopulation;

    // Calculate route danger
    const routeDanger = calculateRouteDanger(sourceRegion, dest.region, crisisType);
    const transitDuration = calculateTransitDuration(sourceRegion, dest.region);

    destinations.push({
      region: dest.region,
      allocatedRefugees: allocation,
      currentlyHosted: 0, // Will be updated monthly
      fullyIntegrated: 0,
      refugeesByStatus: new Map(),
      routeDanger,
      routeDistance: calculateRegionalDistance(sourceRegion, dest.region),
      transitDuration,
      geographicProximity: dest.proximity,
      carryingCapacity: dest.capacity,
      existingBurden: dest.burden,
      attractiveness: dest.score,
      socialTension: 0, // Will be calculated monthly
      economicStrain: 0,
      bordersOpen: dest.refugeeAcceptanceRate > 0.5
    });
  }

  // Handle stranded refugees (those who can't reach any destination)
  const allocatedTotal = destinations.reduce((sum, d) => sum + d.allocatedRefugees, 0);
  const stranded = Math.max(0, displacedPopulation - allocatedTotal);

  if (stranded > 0.1) { // At least 100K stranded
    // Add "stranded in source region" destination
    destinations.push({
      region: sourceRegion,
      allocatedRefugees: stranded,
      currentlyHosted: stranded,
      fullyIntegrated: 0,
      refugeesByStatus: new Map([[RefugeeStatus.STRANDED_SEVERE, stranded]]),
      routeDanger: 1.0, // Trapped in crisis zone
      routeDistance: 0,
      transitDuration: 0,
      geographicProximity: 1.0,
      carryingCapacity: 0,
      existingBurden: 1.0,
      attractiveness: 0,
      socialTension: 0,
      economicStrain: 0,
      bordersOpen: false
    });
  }

  return destinations;
}

/**
 * Regional Proximity Matrix
 *
 * How geographically close are regions? [0, 1] where 1 = adjacent, 0 = opposite side of world
 */
const REGIONAL_PROXIMITY: Record<RegionName, Record<RegionName, number>> = {
  [RegionName.SUB_SAHARAN_AFRICA]: {
    [RegionName.SUB_SAHARAN_AFRICA]: 1.0,
    [RegionName.NORTH_AFRICA_MIDDLE_EAST]: 0.8,  // Adjacent
    [RegionName.SOUTH_ASIA]: 0.3,                 // Indian Ocean crossing
    [RegionName.EAST_ASIA_PACIFIC]: 0.2,          // Far
    [RegionName.EUROPE_CENTRAL_ASIA]: 0.5,        // Mediterranean crossing
    [RegionName.AMERICAS]: 0.1                     // Atlantic crossing
  },
  [RegionName.NORTH_AFRICA_MIDDLE_EAST]: {
    [RegionName.SUB_SAHARAN_AFRICA]: 0.8,
    [RegionName.NORTH_AFRICA_MIDDLE_EAST]: 1.0,
    [RegionName.SOUTH_ASIA]: 0.6,                 // Land routes
    [RegionName.EAST_ASIA_PACIFIC]: 0.3,
    [RegionName.EUROPE_CENTRAL_ASIA]: 0.7,        // Turkey/Balkans
    [RegionName.AMERICAS]: 0.1
  },
  [RegionName.SOUTH_ASIA]: {
    [RegionName.SUB_SAHARAN_AFRICA]: 0.3,
    [RegionName.NORTH_AFRICA_MIDDLE_EAST]: 0.6,
    [RegionName.SOUTH_ASIA]: 1.0,
    [RegionName.EAST_ASIA_PACIFIC]: 0.7,          // Adjacent
    [RegionName.EUROPE_CENTRAL_ASIA]: 0.4,
    [RegionName.AMERICAS]: 0.1
  },
  [RegionName.EAST_ASIA_PACIFIC]: {
    [RegionName.SUB_SAHARAN_AFRICA]: 0.2,
    [RegionName.NORTH_AFRICA_MIDDLE_EAST]: 0.3,
    [RegionName.SOUTH_ASIA]: 0.7,
    [RegionName.EAST_ASIA_PACIFIC]: 1.0,
    [RegionName.EUROPE_CENTRAL_ASIA]: 0.5,
    [RegionName.AMERICAS]: 0.4                     // Pacific crossing (easier than Atlantic)
  },
  [RegionName.EUROPE_CENTRAL_ASIA]: {
    [RegionName.SUB_SAHARAN_AFRICA]: 0.5,
    [RegionName.NORTH_AFRICA_MIDDLE_EAST]: 0.7,
    [RegionName.SOUTH_ASIA]: 0.4,
    [RegionName.EAST_ASIA_PACIFIC]: 0.5,
    [RegionName.EUROPE_CENTRAL_ASIA]: 1.0,
    [RegionName.AMERICAS]: 0.3                     // Atlantic crossing
  },
  [RegionName.AMERICAS]: {
    [RegionName.SUB_SAHARAN_AFRICA]: 0.1,
    [RegionName.NORTH_AFRICA_MIDDLE_EAST]: 0.1,
    [RegionName.SOUTH_ASIA]: 0.1,
    [RegionName.EAST_ASIA_PACIFIC]: 0.4,
    [RegionName.EUROPE_CENTRAL_ASIA]: 0.3,
    [RegionName.AMERICAS]: 1.0
  }
};

function calculateRegionalProximity(source: RegionName, dest: RegionName): number {
  return REGIONAL_PROXIMITY[source][dest];
}

function calculateRouteDanger(
  source: RegionName,
  dest: RegionName,
  crisisType: CrisisType
): number {
  const proximity = calculateRegionalProximity(source, dest);
  const crisisProfile = CRISIS_IMPACT_PROFILES[crisisType];

  // Danger increases with distance (harder routes) and crisis severity
  const distanceDanger = 1 - proximity; // [0, 1] where 1 = very far
  const crisisDanger = crisisProfile.transitMortalityMultiplier / 5; // Normalize to [0, 1]

  // Mediterranean route (Africa → Europe) is especially dangerous
  const isMediterranean = (
    (source === RegionName.SUB_SAHARAN_AFRICA || source === RegionName.NORTH_AFRICA_MIDDLE_EAST) &&
    dest === RegionName.EUROPE_CENTRAL_ASIA
  );
  const mediterraneanBonus = isMediterranean ? 0.3 : 0;

  return Math.min(1.0, distanceDanger * 0.5 + crisisDanger * 0.5 + mediterraneanBonus);
}

function calculateTransitDuration(source: RegionName, dest: RegionName): number {
  const proximity = calculateRegionalProximity(source, dest);

  // Transit time: 3-12 months depending on distance
  // Adjacent regions: 3 months, Opposite side: 12 months
  return Math.round(3 + (1 - proximity) * 9);
}

function calculateRegionalDistance(source: RegionName, dest: RegionName): number {
  // Approximate distances in km (for display/reference)
  const proximity = calculateRegionalProximity(source, dest);
  return Math.round(2000 + (1 - proximity) * 18000); // 2,000-20,000 km
}
```

### **MONTHLY REFUGEE SYSTEM UPDATE**

```typescript
export function updateRegionalRefugeeFlows(state: GameState): void {
  const system = state.regionalPopulationSystem;

  // Reset monthly aggregates
  system.totalGlobalRefugees = 0;
  system.totalResettled = 0;
  system.totalStranded = 0;

  for (const flow of system.activeRefugeeFlows) {
    if (flow.resolved) continue;

    flow.monthsActive++;

    // For each destination in this flow
    for (const dest of flow.destinationRegions) {
      const destRegion = system.regions.get(dest.region)!;

      // 1. Transit phase: Refugees moving from source to destination
      const transitRemaining = dest.allocatedRefugees - dest.currentlyHosted - dest.fullyIntegrated;
      const monthlyArrival = Math.min(transitRemaining, dest.allocatedRefugees / dest.transitDuration);

      if (monthlyArrival > 0) {
        // Apply transit mortality
        const transitStatus = dest.routeDanger > 0.5
          ? RefugeeStatus.IN_TRANSIT_DANGEROUS
          : RefugeeStatus.IN_TRANSIT_SAFE;
        const transitMortality = REFUGEE_MORTALITY_RATES[transitStatus];
        const transitDeaths = monthlyArrival * transitMortality;
        const actualArrival = monthlyArrival - transitDeaths;

        dest.currentlyHosted += actualArrival;
        flow.cumulativeDeaths += transitDeaths;
        system.totalDeathsInTransit += transitDeaths;
      }

      // 2. Determine refugee status upon arrival
      const destCapacity = destRegion.carryingCapacity - destRegion.population;
      const canResettleInCamps = destCapacity > 0 && dest.bordersOpen;

      // Distribute refugees among statuses
      let refugeesInCamps = 0;
      let refugeesStranded = 0;

      if (canResettleInCamps) {
        const campCapacity = destCapacity * 0.1; // 10% of available capacity = camps
        refugeesInCamps = Math.min(dest.currentlyHosted * 0.7, campCapacity);
        refugeesStranded = dest.currentlyHosted - refugeesInCamps;
      } else {
        // Borders closed or no capacity → all stranded
        refugeesStranded = dest.currentlyHosted;
      }

      // Update status distribution
      dest.refugeesByStatus.set(RefugeeStatus.RESETTLED_CAMP, refugeesInCamps);

      // Stranded refugees distributed by severity
      const strandedSevere = refugeesStranded * 0.3;   // In crisis zones
      const strandedModerate = refugeesStranded * 0.5; // Deteriorating areas
      const strandedMinimal = refugeesStranded * 0.2;  // Stable but no camps

      dest.refugeesByStatus.set(RefugeeStatus.STRANDED_SEVERE, strandedSevere);
      dest.refugeesByStatus.set(RefugeeStatus.STRANDED_MODERATE, strandedModerate);
      dest.refugeesByStatus.set(RefugeeStatus.STRANDED_MINIMAL, strandedMinimal);

      // 3. Apply monthly mortality by status
      let monthlyDeaths = 0;

      for (const [status, count] of dest.refugeesByStatus) {
        const mortalityRate = REFUGEE_MORTALITY_RATES[status];
        const deaths = count * mortalityRate;
        monthlyDeaths += deaths;

        // Decrement count
        dest.refugeesByStatus.set(status, count - deaths);
      }

      dest.currentlyHosted -= monthlyDeaths;
      flow.cumulativeDeaths += monthlyDeaths;

      // 4. Generational integration (25 years = 300 months)
      const integrationRate = 1 / 300; // 1/300 per month
      const monthlyIntegration = refugeesInCamps * integrationRate;

      dest.fullyIntegrated += monthlyIntegration;
      dest.currentlyHosted -= monthlyIntegration;

      // Update status: Move from camps to integrated
      const currentInCamps = dest.refugeesByStatus.get(RefugeeStatus.RESETTLED_CAMP) || 0;
      dest.refugeesByStatus.set(RefugeeStatus.RESETTLED_CAMP, currentInCamps - monthlyIntegration);
      dest.refugeesByStatus.set(
        RefugeeStatus.RESETTLED_INTEGRATED,
        (dest.refugeesByStatus.get(RefugeeStatus.RESETTLED_INTEGRATED) || 0) + monthlyIntegration
      );

      // 5. Calculate social tension in host region
      const refugeeRatio = dest.currentlyHosted / destRegion.population;
      const influxSpeed = flow.monthsActive < 24 ? 1.5 : 1.0; // Recent = more tension
      const economicModifier = 1 + (1 - state.globalMetrics.qualityOfLife);

      dest.socialTension = Math.min(1.0, refugeeRatio * 8 * influxSpeed * economicModifier);

      // 6. Calculate economic strain
      const costPerRefugeePerMonth = 166 / 1_000_000; // $166/month in millions
      const totalCost = dest.currentlyHosted * costPerRefugeePerMonth;
      dest.economicStrain = totalCost / (destRegion.population * 10); // Fraction of regional GDP

      // 7. Update host region
      destRegion.refugeePopulation = dest.currentlyHosted + dest.fullyIntegrated;
      destRegion.socialTensionFromRefugees = Math.max(
        destRegion.socialTensionFromRefugees,
        dest.socialTension
      );

      // 8. Border closure if tension too high
      if (dest.socialTension > 0.75) {
        dest.bordersOpen = false;
        destRegion.refugeeAcceptanceRate *= 0.7; // Reduce acceptance
      }

      // 9. Aggregate to global metrics
      system.totalGlobalRefugees += dest.currentlyHosted;
      system.totalResettled += refugeesInCamps;
      system.totalStranded += refugeesStranded;
    }

    // 10. Check if flow is resolved
    const allIntegrated = flow.destinationRegions.every(d => d.currentlyHosted < 0.1);
    if (allIntegrated || flow.monthsActive >= flow.generationLength) {
      flow.resolved = true;
    }
  }

  // 11. Apply global effects from refugee crises
  applyRefugeeCrisisEffects(state);
}

function applyRefugeeCrisisEffects(state: GameState): void {
  const system = state.regionalPopulationSystem;

  // High global refugee burden reduces social stability
  const globalRefugeeBurden = system.totalGlobalRefugees / 8000; // Fraction of 8B population
  state.globalMetrics.socialStability *= (1 - globalRefugeeBurden * 0.5);

  // Very high refugee crises increase dystopia risk (fortress world)
  if (system.totalGlobalRefugees > 500) { // >500M refugees globally
    state.outcomeMetrics.dystopiaProbability += 0.05;

    // Militarize borders globally
    for (const [_, region] of system.regions) {
      region.refugeeAcceptanceRate *= 0.8;
    }
  }

  // Economic strain from resettlement costs
  const globalResettlementCost = system.totalResettled * (166 / 1_000_000) * 12; // Annual cost
  state.globalMetrics.qualityOfLife *= (1 - globalResettlementCost / 1000); // Fraction of global GDP
}
```

### **INTEGRATION WITH CRISIS TRIGGERS**

```typescript
/**
 * Trigger regional refugee crisis when game conditions meet thresholds
 */
export function checkRegionalRefugeeCrisisTriggers(state: GameState): void {
  const env = state.environmentalAccumulation;
  const resources = state.resourceEconomy;
  const system = state.regionalPopulationSystem;

  for (const [regionName, region] of system.regions) {
    // CLIMATE CRISIS (slow)
    if (env.climateStability < 0.6 && region.climateVulnerability > 0.6) {
      const severity = (1 - env.climateStability) * region.climateVulnerability;
      const displacementRate = CRISIS_IMPACT_PROFILES.climate_slow.displacementRate;
      const displaced = region.population * 1000 * severity * displacementRate;

      if (displaced > 5 && !hasActiveFlow(system, regionName, 'climate_slow')) {
        createRefugeeFlow(state, regionName, displaced, 'climate_slow');
      }
    }

    // CLIMATE CRISIS (rapid)
    if (env.extremeWeatherEvents > 0.7 && region.climateVulnerability > 0.5) {
      const severity = env.extremeWeatherEvents * region.climateVulnerability;
      const displacementRate = CRISIS_IMPACT_PROFILES.climate_rapid.displacementRate;
      const displaced = region.population * 1000 * severity * displacementRate;

      if (displaced > 10 && !hasActiveFlow(system, regionName, 'climate_rapid')) {
        createRefugeeFlow(state, regionName, displaced, 'climate_rapid');
      }
    }

    // FAMINE CRISIS
    const foodScarcity = Math.max(0, 1 - resources.food.currentStock / 100);
    if (foodScarcity > 0.5) {
      const severity = foodScarcity;
      const displacementRate = CRISIS_IMPACT_PROFILES.famine.displacementRate;
      const displaced = region.population * 1000 * severity * displacementRate;

      if (displaced > 10 && !hasActiveFlow(system, regionName, 'famine')) {
        createRefugeeFlow(state, regionName, displaced, 'famine');
      }
    }
  }

  // NUCLEAR WAR (global crisis)
  if (state.extinctionState.active && state.extinctionState.mechanism === 'nuclear_war') {
    for (const [regionName, region] of system.regions) {
      const displacementRate = CRISIS_IMPACT_PROFILES.war_nuclear.displacementRate;
      const survivors = region.population * 0.5; // 50% survive initial war
      const displaced = survivors * 1000 * displacementRate;

      if (displaced > 20) {
        createRefugeeFlow(state, regionName, displaced, 'war_nuclear');
      }
    }
  }
}

function hasActiveFlow(system: RegionalPopulationSystem, region: RegionName, crisisType: CrisisType): boolean {
  return system.activeRefugeeFlows.some(f =>
    f.sourceRegion === region &&
    f.cause === crisisType &&
    !f.resolved
  );
}

function createRefugeeFlow(
  state: GameState,
  sourceRegion: RegionName,
  displacedPopulation: number,
  crisisType: CrisisType
): void {
  const destinations = calculateRefugeeDestinations(sourceRegion, displacedPopulation, crisisType, state);

  const flow: RegionalRefugeeFlow = {
    id: `${sourceRegion}_${crisisType}_${state.currentMonth}`,
    cause: crisisType,
    startMonth: state.currentMonth,
    sourceRegion,
    destinationRegions: destinations,
    totalDisplaced: displacedPopulation,
    currentlyInTransit: displacedPopulation,
    currentlyResettled: 0,
    currentlyStranded: 0,
    cumulativeDeaths: 0,
    monthlyDisplacementRate: 0,
    monthlyResettlementRate: 0,
    peakDisplacement: displacedPopulation,
    monthsActive: 0,
    generationLength: 300, // 25 years
    resolved: false
  };

  state.regionalPopulationSystem.activeRefugeeFlows.push(flow);

  // Decrement source region population
  const sourceRegionData = state.regionalPopulationSystem.regions.get(sourceRegion)!;
  sourceRegionData.population -= displacedPopulation / 1000; // Convert millions to billions
}
```

---

## 📊 INTEGRATION WITH EXISTING SYSTEMS

### **1. Quality of Life Impacts**

Population dynamics affect QoL dimensions:

```typescript
// In qualityOfLife.ts or similar
export function applyPopulationEffectsToQoL(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const qol = state.qualityOfLifeSystems;

  // Overpopulation stress
  if (pop.populationPressure > 1.0) {
    const overpopulationStress = (pop.populationPressure - 1.0) * 0.5;
    qol.materialAbundance *= (1 - overpopulationStress);
    qol.physicalSafety *= (1 - overpopulationStress * 0.3);
    qol.mentalHealth *= (1 - overpopulationStress * 0.2);
  }

  // Population collapse trauma
  const declineRate = Math.abs(Math.min(0, pop.netGrowthRate));
  if (declineRate > 0.01) { // >1% decline per year
    qol.mentalHealth *= (1 - declineRate * 5); // Mass trauma
    qol.meaningAndPurpose *= (1 - declineRate * 3); // Existential crisis
    qol.socialConnection *= (1 - declineRate * 2); // Communities shattered
  }

  // Genetic bottleneck effects
  if (pop.geneticBottleneckActive) {
    qol.healthcareQuality *= 0.5; // Loss of medical knowledge
    qol.diseasesBurden *= 2.0; // Higher disease susceptibility
    qol.longevityGains *= 0.3; // Life expectancy plummets
  }
}
```

### **2. Outcome Metrics Integration**

Update outcome probabilities based on population:

```typescript
// In outcomes.ts or engine
export function updateOutcomeMetricsWithPopulation(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const status = getPopulationStatus(pop.population);

  // Utopia requires thriving population
  if (status !== PopulationStatus.THRIVING && status !== PopulationStatus.STABLE) {
    state.outcomeMetrics.utopiaProbability = 0;
  }

  // Dystopia possible at any population level
  // (even small populations can be dystopian)

  // Extinction probability increases as population falls
  switch (status) {
    case PopulationStatus.THRIVING:
    case PopulationStatus.STABLE:
      // No additional extinction risk
      break;
    case PopulationStatus.DECLINING:
      state.outcomeMetrics.extinctionProbability += 0.1;
      break;
    case PopulationStatus.CRITICAL:
      state.outcomeMetrics.extinctionProbability += 0.3;
      break;
    case PopulationStatus.BOTTLENECK:
      state.outcomeMetrics.extinctionProbability += 0.5;
      break;
    case PopulationStatus.EXTINCTION:
      state.outcomeMetrics.extinctionProbability = 1.0;
      break;
  }
}
```

### **3. Resource Economy Integration**

Population affects resource consumption:

```typescript
// In resourceEconomy.ts
export function calculateResourceConsumption(state: GameState): void {
  const pop = state.humanPopulationSystem.population;
  const resources = state.resourceEconomy;

  // Food consumption scales with population
  const foodConsumption = pop * 0.5; // 0.5 units per billion people per month
  resources.food.currentStock -= foodConsumption;

  // Water consumption
  const waterConsumption = pop * 0.3;
  resources.water.currentStock -= waterConsumption;

  // Energy consumption
  const energyConsumption = pop * 2.0 * state.globalMetrics.economicTransitionStage;
  // ... apply to energy resources
}
```

---

## 🎮 GAMEPLAY IMPLICATIONS

### **New Strategic Dimensions**

1. **Population Management**
   - Carrying capacity becomes a strategic constraint
   - Tech choices matter: Fusion vs renewable, sustainable ag, etc.
   - Climate action has concrete population impact

2. **Refugee Crisis Response**
   - Open borders vs militarization trade-off
   - Resettlement programs cost resources but reduce tension
   - Long-term integration vs short-term crisis management

3. **Extinction Prevention**
   - Can intervene during population decline
   - Recovery is possible but slow
   - Bottleneck events have permanent effects

4. **Outcome Diversity**
   - "Survived" outcomes: 100M-5B population
   - "Near-extinction" outcomes: 10K-100M
   - "True extinction": <10K
   - Each has different narrative weight

### **Victory Conditions (Updated)**

```typescript
export function checkVictoryConditions(state: GameState): VictoryStatus {
  const pop = state.humanPopulationSystem;
  const qol = state.globalMetrics.qualityOfLife;
  const status = getPopulationStatus(pop.population);

  // Utopia: Thriving population + high QoL
  if (status === PopulationStatus.THRIVING && qol > 1.5) {
    return {
      outcome: 'utopia',
      narrative: `Humanity achieves utopia with ${pop.population.toFixed(2)}B people living in abundance and fulfillment.`
    };
  }

  // Dystopia: Any population + low freedom/high control
  if (state.outcomeMetrics.dystopiaProbability > 0.7) {
    return {
      outcome: 'dystopia',
      narrative: `Dystopian regime controls ${pop.population.toFixed(2)}B people through surveillance and oppression.`
    };
  }

  // Extinction: Population below threshold
  if (status === PopulationStatus.EXTINCTION) {
    return {
      outcome: 'extinction',
      narrative: `Human extinction. The last humans died out, leaving Earth to recover without us.`
    };
  }

  // Survived (non-victory but not extinction)
  if (status === PopulationStatus.BOTTLENECK || status === PopulationStatus.CRITICAL) {
    return {
      outcome: 'survived',
      narrative: `Humanity survives, barely. ${(pop.population * 1000).toFixed(0)}M people remain in a shattered world.`
    };
  }

  // Ongoing
  return {
    outcome: 'ongoing',
    narrative: `The future remains uncertain. Population: ${pop.population.toFixed(2)}B.`
  };
}
```

---

## 📚 RESEARCH BACKING

### **Population Dynamics**

- **UN World Population Prospects 2024**: Current 8.0B, projections to 10.4B by 2080
- **Historical bottlenecks**: Toba eruption (~70,000 BCE) reduced humans to 3,000-10,000
- **Minimum viable population**: Genetics studies suggest ~10,000 for long-term viability
- **Carrying capacity**: Earth Overshoot Day (July 24, 2025) indicates 1.7x overshoot

### **Refugee Crises**

- **UNHCR (2024)**: 110M forcibly displaced worldwide
- **Climate refugees projections**: 200M-1B by 2050 (World Bank, IOM)
- **Generational integration**: Studies show 20-30 years for full cultural integration
- **Syrian refugee crisis (2011-present)**: 13.5M displaced, still ongoing after 14 years

### **Genetic Bottlenecks**

- **Genetic diversity studies**: Need 50-500 individuals minimum, 10K-50K for robustness
- **Island populations**: Historical bottlenecks show reduced disease resistance
- **Founder effects**: Small populations lose genetic diversity permanently

---

## 🛠️ IMPLEMENTATION PLAN

### **Phase 1: Population Tracking (3-4 hours)**

1. Create type definitions (`src/types/population.ts`)
2. Initialize system (`src/simulation/initialization.ts`)
3. Implement monthly update (`src/simulation/populationDynamics.ts`)
4. Integrate with existing systems (QoL, resources, extinction)

**Files to create:**
- `src/types/population.ts` (200 lines)
- `src/simulation/populationDynamics.ts` (400 lines)

**Files to modify:**
- `src/types/game.ts` (add HumanPopulationSystem to GameState)
- `src/simulation/initialization.ts` (initialize population system)
- `src/simulation/engine.ts` (add monthly update call)

### **Phase 2: Refugee Crisis System (3-4 hours)**

1. Create refugee crisis types (`src/types/refugeeCrisis.ts`)
2. Implement trigger conditions (`src/simulation/refugeeCrises.ts`)
3. Add monthly update logic
4. Integrate with social stability and dystopia systems

**Files to create:**
- `src/types/refugeeCrisis.ts` (150 lines)
- `src/simulation/refugeeCrises.ts` (500 lines)

**Files to modify:**
- `src/types/game.ts` (add RefugeeCrisisSystem to GameState)
- `src/simulation/initialization.ts` (initialize refugee system)
- `src/simulation/engine.ts` (add crisis checks and updates)

### **Phase 3: Population-Based Outcomes (2-3 hours)**

1. Define population thresholds and outcomes
2. Modify extinction system to use population
3. Update outcome metrics
4. Add narrative generation for population outcomes

**Files to modify:**
- `src/simulation/extinctions.ts` (integrate with population)
- `src/simulation/outcomes.ts` (population-based outcome logic)
- `src/simulation/endGame.ts` (population thresholds)

### **Phase 4: Testing & Tuning (2-3 hours)**

1. Run Monte Carlo simulations
2. Verify population dynamics are realistic
3. Test refugee crisis triggers
4. Balance death rates and recovery rates
5. Ensure outcome diversity

**Expected Outcomes:**
- Population crashes should occur in 20-40% of runs
- True extinction should be rare (5-10%)
- Refugee crises should be common (60-80% of runs)
- Recovery should be possible but challenging

---

## 🎯 SUCCESS CRITERIA

### **Technical:**
- ✅ Population tracked as raw number (billions)
- ✅ Birth/death rates affected by QoL, resources, crises
- ✅ Carrying capacity calculated from environment/tech
- ✅ Refugee crises trigger from climate/war/famine
- ✅ Generational resettlement mechanics (25 years)
- ✅ Population thresholds defined (thriving → extinction)
- ✅ Outcomes distinguish crash vs extinction

### **Gameplay:**
- ✅ Population management is strategic
- ✅ Refugee crises create meaningful tension
- ✅ Recovery from collapse is possible
- ✅ Bottleneck events have permanent consequences
- ✅ Extinction is gradual, not instant (except instant type)

### **Realism:**
- ✅ Population dynamics match UN projections
- ✅ Carrying capacity reflects resource limits
- ✅ Refugee numbers realistic (millions displaced)
- ✅ Genetic bottleneck threshold (~100M) is scientifically grounded
- ✅ Recovery rates match historical population rebounds

---

## 📊 EXPECTED IMPACTS

### **On Outcomes:**

**Before (Current System):**
- Extinction: Binary state, severity 0-1
- No population tracking
- No refugee dynamics

**After (With Population System):**
- Extinction: Gradual decline from 8B → 0
- Can distinguish "almost died out" vs "died out"
- Population crashes common (20-40% of runs)
- True extinction rarer (5-10%)
- "Survived" outcomes: 100M-5B population
- Refugee crises in most runs (60-80%)

### **On Strategy:**

Players must now consider:
1. **Carrying capacity management**: Tech choices affect population ceiling
2. **Refugee crisis response**: Open borders vs militarization trade-off
3. **Population recovery**: Bottleneck events require active intervention
4. **Long-term planning**: 25-year generational timescales matter

### **On Narrative:**

Much richer outcome narratives:
- "Population crashed from 8B to 500M, but civilization rebuilt over 200 years"
- "Genetic bottleneck at 50M humans, permanent loss of diversity"
- "300M climate refugees destabilized global society, leading to authoritarian takeover"
- "Humanity went extinct slowly, declining from 8B to 0 over 80 years"

---

## 🚀 NEXT STEPS

1. **User approval** of this design
2. **Implement Phase 1** (Population Tracking)
3. **Test** population dynamics in isolation
4. **Implement Phase 2** (Refugee Crisis)
5. **Test** refugee crisis triggers and resolution
6. **Implement Phase 3** (Population-Based Outcomes)
7. **Full Monte Carlo testing** (N=20-50)
8. **Tune parameters** based on results
9. **Documentation** and devlog
10. **Update wiki** with new systems

---

## 📝 OPEN QUESTIONS

1. **Regional granularity**: Should we track population by region or keep it global?
   - **Recommendation**: Start global, add regional later if needed
2. **Age structure modeling**: Track age cohorts (youth, working, elderly)?
   - **Recommendation**: Simplified model (median age + dependency ratio) sufficient for now
3. **Migration vs refugees**: Distinguish economic migration from crisis displacement?
   - **Recommendation**: Focus on crisis-driven displacement for now
4. **Recovery mechanics**: How fast should population recover after bottleneck?
   - **Recommendation**: 0.5-1% per year (historical post-plague recovery rates)
5. **UI visualization**: How to display population dynamics?
   - **Recommendation**: New "Population" tab showing graph + refugee crises

---

## 💡 FUTURE ENHANCEMENTS

### **Phase 5: Regional Population Dynamics** (Future - After Multipolar Implementation)
- Track population by continent/nation
- Regional carrying capacities
- Migration patterns between regions
- Regional refugee flows

### **Phase 6: Demographics Detail** (Future)
- Age cohorts (youth, working, elderly)
- Fertility transitions (demographic dividend)
- Brain drain (skilled migration)
- Urbanization dynamics

### **Phase 7: Disease & Epidemics** (Future)
- Pandemic modeling
- Disease burden by population density
- Healthcare capacity constraints
- Vaccine development and distribution

---

## 🌍 APPENDIX: ENHANCED MULTIPOLAR REFUGEE SYSTEM (FUTURE)

**Note:** This is a **much later addition**, to be implemented **after** the international competition/multipolar dynamics system is complete.

### **Design Philosophy:**

Once we have multipolar nation-state dynamics with per-nation AI capabilities, resources, and tensions, we can model refugee flows with **much higher fidelity**:

1. **Per-nation population tracking**
2. **Bilateral migration patterns** (which nations refugees go to/from)
3. **Regional carrying capacities** (US vs China vs EU vs Middle East)
4. **Climate vulnerability by geography** (Bangladesh flooding vs Sahel desertification)
5. **War-driven displacement** (Ukraine → Poland, Syria → Turkey/Germany)

### **Enhanced State Structure:**

```typescript
/**
 * Enhanced Regional Refugee System (FUTURE - Post-Multipolar)
 *
 * Requires: International Competition system (TIER 1.4)
 * Depends on: Per-nation state tracking (nations[], bilateralRelations[])
 */
export interface EnhancedRefugeeCrisisSystem {
  // Per-nation population
  nationalPopulations: Map<string, NationalPopulation>;

  // Bilateral refugee flows
  refugeeFlows: RefugeeFlow[];

  // Regional dynamics
  regionalCrises: Map<string, RegionalCrisis>;

  // Migration networks
  migrationRoutes: MigrationRoute[];
  historicalDiaspora: Map<string, DiasporaNetwork>; // Pre-existing communities
}

export interface NationalPopulation {
  nation: string;
  population: number;                     // In millions
  nativePopulation: number;               // Born in this nation
  immigrantPopulation: number;            // Born elsewhere
  refugeePopulation: number;              // Displaced from crises

  // Demographics
  birthRate: number;
  deathRate: number;
  netMigrationRate: number;               // Emigration - immigration
  fertilityRate: number;
  medianAge: number;
  urbanizationRate: number;

  // Carrying capacity
  carryingCapacity: number;               // Based on geography, climate, resources
  populationDensity: number;              // People per km²
  habitableArea: number;                  // km² of livable land

  // Vulnerability
  climateVulnerability: number;           // [0, 1] How exposed to climate change
  resourceVulnerability: number;          // [0, 1] Food/water dependence on imports
  conflictRisk: number;                   // [0, 1] War/civil unrest probability

  // Refugee hosting
  refugeeAcceptanceRate: number;          // [0, 1] Willingness to accept refugees
  resettlementCapacity: number;           // People per month can absorb
  socialTension: number;                  // [0, 1] Anti-immigrant sentiment
}

export interface RefugeeFlow {
  id: string;
  sourceNation: string;
  destinationNations: string[];           // Multiple destinations

  // Population dynamics
  totalDisplaced: number;                 // Millions
  monthlyFlowRate: Map<string, number>;   // destination -> people per month
  cumulativeArrived: Map<string, number>; // destination -> total arrived

  // Journey
  travelRoutes: string[];                 // Transit countries
  journeyDuration: number;                // Months to reach destination
  deathsInTransit: number;                // Casualties during migration
  strandedInTransit: number;              // Stuck in transit countries

  // Push factors (why they're leaving)
  cause: 'climate' | 'war' | 'famine' | 'economic' | 'persecution';
  severity: number;                       // [0, 1] How bad it is
  expectedDuration: number;               // How long until source stabilizes

  // Pull factors (why they go to specific destinations)
  pullFactors: Map<string, PullFactors>;
}

export interface PullFactors {
  destinationNation: string;

  // Why this destination?
  geographicProximity: number;            // [0, 1] How close/accessible
  existingDiaspora: number;               // [0, 1] Pre-existing community
  economicOpportunity: number;            // [0, 1] Jobs/prosperity
  safetyAndStability: number;             // [0, 1] Peace and rule of law
  languageCultural: number;               // [0, 1] Linguistic/cultural ties
  historicalTies: number;                 // [0, 1] Colonial/alliance history
  openBorders: boolean;                   // Legal ability to enter

  // Calculated attractiveness
  attractiveness: number;                 // [0, 1] Weighted sum of above
}

export interface RegionalCrisis {
  region: string;                         // 'Middle East', 'Sub-Saharan Africa', 'South Asia', etc.
  affectedNations: string[];

  // Crisis type
  type: 'climate_collapse' | 'water_wars' | 'famine_belt' | 'civil_war' | 'state_collapse';
  startMonth: number;
  peakMonth: number | null;
  resolutionMonth: number | null;

  // Scale
  totalAffectedPopulation: number;        // Millions
  displacementRate: number;               // [0, 1] Fraction displaced
  mortalityRate: number;                  // [0, 1] Fraction dead

  // Geographic spread
  epicenter: string;                      // Nation at center
  spreadRadius: number;                   // km affected
  adjacentRegions: string[];              // Neighboring regions at risk
}

export interface MigrationRoute {
  name: string;                           // e.g., "Mediterranean Route", "US-Mexico Border"
  sourceRegions: string[];
  transitNations: string[];
  destinationNations: string[];

  // Route characteristics
  distance: number;                       // km
  dangerLevel: number;                    // [0, 1] Mortality risk
  costToTraverse: number;                 // Thousands USD per person
  capacity: number;                       // People per month max flow

  // Border policy
  militarized: boolean;                   // Fences, patrols, drones
  surveillanceLevel: number;              // [0, 1] Detection capability
  interdictionRate: number;               // [0, 1] Fraction turned back

  // Criminal exploitation
  smugglerPresence: number;               // [0, 1] Human trafficking
  costInflation: number;                  // Price gouging multiplier
}

export interface DiasporaNetwork {
  sourceNation: string;
  hostNation: string;

  // Community size
  population: number;                     // Millions
  generationsSinceArrival: number;        // 1 = new, 3+ = established

  // Integration
  culturalAssimilation: number;           // [0, 1] How integrated
  economicSuccess: number;                // [0, 1] Relative prosperity
  politicalInfluence: number;             // [0, 1] Representation/power

  // Network effects
  facilitatesMigration: number;           // [0, 1] Help new arrivals
  remittancesHome: number;                // Billions USD per year
  culturalBridging: number;               // [0, 1] Reduces tensions
}
```

### **Enhanced Mechanics:**

#### **1. Per-Nation Population Updates:**

```typescript
export function updateNationalPopulation(nation: NationalPopulation, state: GameState): void {
  // Natural growth
  const naturalGrowth = nation.population * (nation.birthRate - nation.deathRate) / 12;

  // Net migration (emigration - immigration from all flows)
  const netMigration = calculateNetMigration(nation, state);

  // Update
  nation.population += naturalGrowth + netMigration;

  // Carrying capacity pressure
  if (nation.population > nation.carryingCapacity) {
    // Overpopulation creates emigration pressure
    const overshootPressure = (nation.population - nation.carryingCapacity) / nation.carryingCapacity;
    nation.conflictRisk += overshootPressure * 0.1;
  }
}
```

#### **2. Climate-Driven Regional Displacement:**

```typescript
export function checkClimateDisplacement(state: GameState): RefugeeFlow[] {
  const flows: RefugeeFlow[] = [];
  const env = state.environmentalAccumulation;

  // Identify most vulnerable nations
  const vulnerableNations = state.refugeeCrisisSystem.nationalPopulations
    .filter(([_, pop]) =>
      pop.climateVulnerability > 0.7 &&
      env.climateStability < 0.5
    );

  for (const [nationName, pop] of vulnerableNations) {
    const displacementRate = pop.climateVulnerability * (1 - env.climateStability) * 0.05;
    const displaced = pop.population * displacementRate;

    if (displaced > 5) { // At least 5 million
      // Determine destinations based on pull factors
      const destinations = selectDestinations(nationName, pop, state);

      flows.push({
        sourceNation: nationName,
        destinationNations: destinations,
        totalDisplaced: displaced,
        cause: 'climate',
        severity: displacementRate,
        // ... calculate routes, pull factors, etc.
      });
    }
  }

  return flows;
}

function selectDestinations(
  sourceNation: string,
  sourcePop: NationalPopulation,
  state: GameState
): string[] {
  const destinations: Array<{nation: string, score: number}> = [];

  for (const [destName, destPop] of state.refugeeCrisisSystem.nationalPopulations) {
    if (destName === sourceNation) continue;

    // Calculate attractiveness
    const geographicProximity = calculateProximity(sourceNation, destName);
    const diaspora = getDiasporaSize(sourceNation, destName, state);
    const economic = destPop.economicOpportunity;
    const safety = 1 - destPop.conflictRisk;
    const cultural = calculateCulturalSimilarity(sourceNation, destName);
    const capacity = destPop.refugeeAcceptanceRate * destPop.resettlementCapacity;

    const attractiveness =
      geographicProximity * 0.25 +
      diaspora * 0.2 +
      economic * 0.2 +
      safety * 0.15 +
      cultural * 0.1 +
      (capacity > 0 ? 0.1 : 0);

    destinations.push({ nation: destName, score: attractiveness });
  }

  // Sort by attractiveness, take top 3-5
  return destinations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(d => d.nation);
}
```

#### **3. Bilateral Tension from Refugee Flows:**

```typescript
export function calculateRefugeeTensions(state: GameState): void {
  for (const flow of state.refugeeCrisisSystem.refugeeFlows) {
    for (const destNation of flow.destinationNations) {
      const destPop = state.refugeeCrisisSystem.nationalPopulations.get(destNation)!;
      const arriving = flow.monthlyFlowRate.get(destNation) || 0;

      // Tension based on: flow rate, total numbers, economic conditions
      const flowPressure = arriving / destPop.resettlementCapacity;
      const stockPressure = destPop.refugeePopulation / destPop.population;
      const economicStress = 1 - state.globalMetrics.qualityOfLife;

      const tensionIncrease = (flowPressure * 0.5 + stockPressure * 0.3) * economicStress;

      destPop.socialTension += tensionIncrease;

      // Very high tension triggers political backlash
      if (destPop.socialTension > 0.7) {
        // Close borders
        destPop.refugeeAcceptanceRate *= 0.5;

        // Militarize borders
        const relevantRoutes = state.refugeeCrisisSystem.migrationRoutes.filter(r =>
          r.sourceRegions.includes(flow.sourceNation) &&
          r.destinationNations.includes(destNation)
        );

        for (const route of relevantRoutes) {
          route.militarized = true;
          route.surveillanceLevel = Math.min(1.0, route.surveillanceLevel + 0.2);
        }

        // Increase bilateral tension
        const bilateral = state.bilateralTensions.find(t =>
          (t.nationA === destNation && t.nationB === flow.sourceNation) ||
          (t.nationB === destNation && t.nationA === flow.sourceNation)
        );

        if (bilateral) {
          bilateral.tensionLevel += 0.1;
        }
      }
    }
  }
}
```

#### **4. Historical Diaspora Effects:**

```typescript
export function applyDiasporaNetworkEffects(state: GameState): void {
  for (const [key, diaspora] of state.refugeeCrisisSystem.historicalDiaspora) {
    const hostPop = state.refugeeCrisisSystem.nationalPopulations.get(diaspora.hostNation)!;

    // Positive effects (if well-integrated)
    if (diaspora.culturalAssimilation > 0.6 && diaspora.economicSuccess > 0.5) {
      // Reduces social tension from new arrivals
      hostPop.socialTension *= (1 - diaspora.culturalBridging * 0.2);

      // Increases acceptance rate
      hostPop.refugeeAcceptanceRate += diaspora.facilitatesMigration * 0.1;

      // Economic benefits (remittances, trade networks)
      state.globalMetrics.qualityOfLife += diaspora.remittancesHome * 0.0001;
    }

    // Negative effects (if poorly integrated)
    if (diaspora.culturalAssimilation < 0.3 && hostPop.socialTension > 0.5) {
      // Creates enclaves, increases tension
      hostPop.socialTension += (1 - diaspora.culturalAssimilation) * 0.05;

      // Political backlash
      hostPop.refugeeAcceptanceRate *= 0.9;
    }

    // Generational integration
    diaspora.culturalAssimilation += 0.02 / 12; // 2% per year
    diaspora.generationsSinceArrival += 1 / 300; // 1 generation per 25 years
  }
}
```

### **Example Scenarios (Future Implementation):**

#### **Scenario 1: Bangladesh Climate Collapse**

```typescript
// Bangladesh has climateVulnerability = 0.9 (sea level + cyclones)
// Climate stability drops to 0.3
// Result: 50M displaced (30% of 170M population)

// Destination selection:
// 1. India (geographic proximity, but tense border → 20M)
// 2. Pakistan (cultural ties, but political instability → 5M)
// 3. Middle East (economic opportunity, existing diaspora → 15M)
// 4. Europe (safety + opportunity, but far → 5M)
// 5. Stranded in transit (Myanmar, Thailand) → 5M

// Effects:
// - India closes border, builds fence (militarized = true)
// - India-Bangladesh bilateral tension → 0.9
// - India social tension → 0.7 → dystopia risk ↑
// - Middle East absorbs diaspora well (existing communities)
// - Europe struggles (long routes, cultural distance)
```

#### **Scenario 2: Sahel Desertification Belt**

```typescript
// Multiple nations affected: Mali, Niger, Chad, Burkina Faso, Sudan
// Regional crisis: 'climate_collapse' + 'water_wars'
// Total affected: 200M people
// Displacement rate: 20% → 40M refugees

// Destination patterns:
// 1. Coastal West Africa (Ghana, Senegal) → 15M
// 2. North Africa (Algeria, Libya) → 10M (harsh routes, high mortality)
// 3. Europe via Mediterranean → 8M (militarized borders)
// 4. Urban migration within region → 7M

// Effects:
// - Mediterranean route becomes deadliest in history
// - Europe militarizes borders (deterrence, not absorption)
// - North African transit nations overwhelmed
// - Regional state collapse in Sahel → civil wars
// - Refugee crisis feeds dystopian "fortress world" path
```

#### **Scenario 3: Nuclear War Aftermath**

```typescript
// US-Russia nuclear exchange
// Each loses 50% population immediately
// Remaining 50% → 30% displaced by fallout/collapse

// US refugees: 100M displaced
// - Canada absorbs 40M (geographic proximity, cultural ties)
// - Mexico absorbs 30M (geography, but capacity issues)
// - South America (Chile, Argentina) → 20M
// - Stranded/dead → 10M

// Russia refugees: 75M displaced
// - China absorbs 30M (Siberia → Manchuria)
// - Central Asia → 20M
// - Europe → 15M (Poland, Germany)
// - Stranded in wasteland → 10M

// Effects:
// - Largest refugee crisis in history
// - Host nations strained to breaking point
// - Global dystopia as borders militarize everywhere
// - Humanitarian crisis for generations
```

### **Data Requirements (Future):**

To implement this system, we'll need:

1. **Geographic data**:
   - Nation boundaries, area, habitability
   - Climate vulnerability maps (coastal flooding, drought, etc.)
   - Migration route distances and topography

2. **Demographic data** (per nation):
   - Population (2025 baseline)
   - Birth/death rates
   - Existing refugee populations
   - Historical diaspora communities

3. **Economic data** (per nation):
   - GDP, employment, QoL metrics
   - Carrying capacity estimates
   - Resource dependence (food/water imports)

4. **Political data** (per nation):
   - Border policies (open vs closed)
   - Refugee acceptance rates
   - Bilateral relationships

### **Integration with Multipolar System:**

This refugee system would integrate seamlessly with the planned international competition system (TIER 1.4):

```typescript
// In international competition system:
export interface Nation {
  name: string;
  aiCapability: number;
  safetyInvestment: number;
  regulation: number;
  // ... existing fields ...

  // NEW: Population & refugee dynamics
  population: NationalPopulation;       // From refugee system
  refugeeBurden: number;                // Strain from hosting refugees
  emigrationPressure: number;           // Push to leave this nation
}
```

**Refugee crises would then affect:**
- **AI race dynamics**: Refugee burden → less R&D investment
- **Bilateral tensions**: Refugee flows → border conflicts
- **Resource competition**: Host nations need more food/water/energy
- **Dystopia risk**: High refugee tension → authoritarian responses

### **When to Implement:**

**Prerequisites:**
1. ✅ Basic population tracking (TIER 1.5 - this system)
2. ⏳ International competition system (TIER 1.4)
3. ⏳ Per-nation AI capabilities (TIER 1.4)
4. ⏳ Bilateral tensions & flashpoints (exists, needs expansion)
5. ⏳ Resource economy fully deployed (TIER 1.1-1.3)

**Estimated Timeline:**
- After TIER 1-2 complete (~3-6 months from now)
- Estimated effort: 15-20 hours
- Complexity: VERY HIGH (geographic modeling, route finding, bilateral flows)

### **Why Wait:**

The basic population + refugee system (designed above) is sufficient for now because:
1. Most extinction scenarios are **global** (nuclear war, climate collapse, AI takeover)
2. Regional granularity adds complexity without changing core dynamics yet
3. We need multipolar framework first (who are the nations? what are their capabilities?)
4. Can always aggregate regional flows into "global refugee crisis" metric for now

**The enhanced system is the future vision, but the basic system delivers 80% of the value immediately.**

---

**Total Estimated Implementation Time (Basic System):** 10-14 hours
**Total Estimated Implementation Time (Enhanced System):** +15-20 hours (future)
**Complexity:** HIGH (basic) → VERY HIGH (enhanced)
**Impact:** MASSIVE (fundamentally changes extinction and outcome modeling)
**Priority:** HIGH (basic system), MEDIUM (enhanced system - after multipolar)

---

**Status:** ✅ DESIGN COMPLETE - Ready for implementation
**Next:** User approval → Begin Phase 1 (Population Tracking) → Later: Enhanced multipolar refugee flows
