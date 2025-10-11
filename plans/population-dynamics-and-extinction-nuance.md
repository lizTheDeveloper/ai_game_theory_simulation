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

### **Phase 5: Regional Population Dynamics** (Future)
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

**Total Estimated Implementation Time:** 10-14 hours
**Complexity:** HIGH
**Impact:** MASSIVE (fundamentally changes extinction and outcome modeling)
**Priority:** HIGH (enables much richer narrative outcomes)

---

**Status:** ✅ DESIGN COMPLETE - Ready for implementation
**Next:** User approval → Begin Phase 1 (Population Tracking)
