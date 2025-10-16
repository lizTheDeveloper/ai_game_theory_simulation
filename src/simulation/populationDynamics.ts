/**
 * Population Dynamics System (TIER 1.5)
 *
 * Tracks concrete human population (not abstract severity) with:
 * - Birth/death rates affected by QoL, resources, crises
 * - Carrying capacity from environment/tech
 * - Population crash vs extinction distinction
 * - Recovery mechanics after bottleneck events
 *
 * Research backing:
 * - UN World Population Prospects 2024: 8.0B → 10.4B by 2080
 * - Historical bottlenecks: Toba ~70K BCE (3K-10K survivors)
 * - Minimum viable population: 10K-50K for genetic diversity
 * - Carrying capacity: Earth Overshoot Day 2025 (1.7x overshoot)
 *
 * @see plans/population-dynamics-and-extinction-nuance.md
 */

import { GameState } from '@/types/game';
import { HumanPopulationSystem, PopulationStatus, PopulationOutcome } from '@/types/population';

/**
 * Initialize population system (2025 baseline)
 */
export function initializeHumanPopulationSystem(): HumanPopulationSystem {
  return {
    // Core population metrics
    population: 8.0,                      // 2025: 8.0B people
    baselinePopulation: 8.0,
    peakPopulation: 8.0,
    peakPopulationMonth: 0,

    // Growth dynamics (2025 global averages)
    baselineBirthRate: 0.018,             // 1.8% per year
    baselineDeathRate: 0.008,             // 0.8% per year
    adjustedBirthRate: 0.018,
    adjustedDeathRate: 0.008,
    netGrowthRate: 0.010,                 // 1.0% net growth

    // Carrying capacity (UN estimates)
    carryingCapacity: 10.0,               // 10B with current tech
    baselineCarryingCapacity: 10.0,
    capacityModifier: 1.0,
    populationPressure: 0.80,             // 8B / 10B = 80% pressure

    // Demographics
    fertilityRate: 2.3,                   // Global average 2025
    dependencyRatio: 0.5,                 // 2 workers per 1 dependent
    medianAge: 30,                        // Global median

    // Crisis impacts
    monthlyExcessDeaths: 0,
    cumulativeCrisisDeaths: 0,
    geneticBottleneckActive: false,

    // Death tracking by category
    deathsByCategory: {
      war: 0,
      famine: 0,
      climate: 0,
      disease: 0,
      ecosystem: 0,
      pollution: 0,
      ai: 0,
      other: 0,
    },

    // Thresholds
    extinctionThreshold: 10000,           // 10K people
    bottleneckThreshold: 100000000,       // 100M people
    criticalThreshold: 2000000000,        // 2B people

    // Recovery
    canRecover: true,
    recoveryRate: 0,
    monthsSinceLastCrisis: 0,
  };
}

/**
 * Update human population each month
 *
 * Algorithm:
 * 1. Calculate carrying capacity (climate, resources, tech)
 * 2. Calculate birth rate (meaning, economy, healthcare, stability)
 * 3. Calculate death rate (healthcare, food/water, climate, pollution, war)
 * 4. Apply extinction scenario death rates
 * 5. Calculate net growth
 * 6. Apply carrying capacity constraints
 * 7. Track cumulative deaths and thresholds
 * 8. Check recovery potential
 * 9. Update demographics
 */
export function updateHumanPopulation(state: GameState): void {
  const pop = state.humanPopulationSystem;

  // === PHASE 5: SKIP GLOBAL UPDATE IF REGIONAL POPULATIONS ARE ACTIVE ===
  // Regional populations handle all population dynamics and aggregate to global
  if (pop.regionalPopulations && pop.regionalPopulations.length > 0) {
    // Regional system is active, skip global update
    updateDemographics(state); // Still update global demographics
    return;
  }

  const qol = state.qualityOfLifeSystems;
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const resources = state.resourceEconomy;

  // === 1. CALCULATE CARRYING CAPACITY ===
  // Base capacity affected by: climate, resources, ecosystem, technology

  // Climate modifier: stable climate = high capacity
  const climateModifier = isNaN(env.climateStability) ? 0.5 : env.climateStability; // 1.0 = normal, 0 = uninhabitable

  // Resource modifier: need food AND water
  const foodStock = isNaN(resources.food.currentStock) ? 100 : resources.food.currentStock;
  const waterStock = isNaN(resources.water.currentStock) ? 100 : resources.water.currentStock;
  const foodAvailability = Math.min(1.0, foodStock / 100);
  const waterAvailability = Math.min(1.0, waterStock / 100);
  const resourceModifier = Math.min(foodAvailability, waterAvailability);

  // Ecosystem modifier: ecosystem services support humans
  const ecosystemModifier = isNaN(env.biodiversityIndex) ? 0.5 : env.biodiversityIndex; // 0 = ecosystem collapse

  // Tech modifier: advancement increases capacity
  const economicStage = isNaN(state.globalMetrics.economicTransitionStage) ? 0 : state.globalMetrics.economicTransitionStage;
  const techModifier = 1.0 +
    (economicStage * 0.2) + // Tech advancement
    (state.breakthroughTech.fusionPower?.deploymentLevel || 0) * 1.0 + // Energy abundance
    (state.breakthroughTech.sustainableAgriculture?.deploymentLevel || 0) * 0.5; // Food efficiency

  pop.capacityModifier = climateModifier * resourceModifier * ecosystemModifier * techModifier;
  pop.carryingCapacity = Math.max(1.0, pop.baselineCarryingCapacity * pop.capacityModifier); // Ensure non-zero
  pop.populationPressure = pop.population / pop.carryingCapacity;

  // === 2. CALCULATE BIRTH RATE ===
  // Affected by: meaning/purpose, economic security, healthcare, social stability

  // Meaning modifier: existential despair reduces births
  const meaningModifier = Math.max(0.2, qol.meaningAndPurpose);

  // Economic modifier: poverty + insecurity reduce births
  const economicModifier = Math.min(1.0,
    qol.materialAbundance * 0.7 +
    (state.globalMetrics.economicTransitionStage / 4) * 0.3
  );

  // Healthcare modifier: better healthcare = safer births, more confidence
  const healthcareModifier = Math.max(0.5, qol.healthcareQuality);

  // Stability modifier: instability reduces family formation
  const stabilityModifier = Math.max(0.3, state.globalMetrics.socialStability);

  // Pressure modifier: high population pressure reduces births
  const pressureModifier = Math.max(0.2, 1 - pop.populationPressure * 0.5);

  pop.adjustedBirthRate = pop.baselineBirthRate *
    meaningModifier *
    economicModifier *
    healthcareModifier *
    stabilityModifier *
    pressureModifier;

  // P1.5: POST-CRISIS BABY BOOM EFFECT
  // Historical evidence: Population rebounds after EVERY major crisis
  // - Post-WWII baby boom: +30-50% birth rates (1946-1964)
  // - Post-Black Death: +50-80% fertility recovery (1350-1400)
  // - Post-1918 flu: +20-40% birth spike (1919-1925)
  // Research: Demographic transition theory shows recovery within 1-5 years
  const activeCrises = [
    state.environmentalAccumulation.resourceCrisisActive,
    state.environmentalAccumulation.pollutionCrisisActive,
    state.environmentalAccumulation.climateCrisisActive,
    state.environmentalAccumulation.ecosystemCrisisActive,
    state.socialAccumulation.meaningCollapseActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    state.technologicalRisk.controlLossActive,
    state.technologicalRisk.corporateDystopiaActive,
    state.technologicalRisk.complacencyCrisisActive
  ].filter(Boolean).length;

  // Initialize crisis tracking if not present
  if (!pop.previousActiveCrises) {
    pop.previousActiveCrises = activeCrises;
  }

  // Detect crisis resolution (crisis count dropped)
  if (pop.previousActiveCrises > 0 && activeCrises < pop.previousActiveCrises) {
    pop.monthsSinceLastCrisis = 0; // Reset timer
    if (state.currentMonth % 12 === 0) {
      console.log(`🕊️  CRISIS RESOLUTION: ${pop.previousActiveCrises - activeCrises} crisis(es) resolved`);
    }
  }

  // Apply baby boom effect (decays over 60 months)
  if (pop.monthsSinceLastCrisis < 60 && pop.monthsSinceLastCrisis >= 0) {
    // Recovery boost: 30% → 80% over first 60 months, then decays
    // Formula: 1.3 + (progress * 0.5) = 1.3x to 1.8x boost
    const recoveryProgress = Math.min(1.0, pop.monthsSinceLastCrisis / 60);
    const recoveryBoost = 1.3 + (recoveryProgress * 0.5);
    const finalBoost = Math.min(1.8, recoveryBoost);

    pop.adjustedBirthRate *= finalBoost;

    if (state.currentMonth % 24 === 0 && finalBoost > 1.35) { // Log every 2 years
      console.log(`👶 BABY BOOM: Birth rate +${((finalBoost - 1.0) * 100).toFixed(0)}% (${pop.monthsSinceLastCrisis} months post-crisis)`);
    }
  }

  // Update crisis tracking
  pop.previousActiveCrises = activeCrises;
  pop.monthsSinceLastCrisis++;

  // === 3. CALCULATE DEATH RATE (NEW: Research-Based) ===
  // NEW (Oct 13, 2025): Environmental mortality now calculated from actual thresholds
  // FIX (Oct 13, 2025): Now tracks deaths by category to fix missing 90% in reports
  // Uses calculateEnvironmentalMortality() from qualityOfLife.ts
  // Research: UNEP (2024), PNAS (2014)
  
  const { calculateEnvironmentalMortality } = require('./qualityOfLife');
  const envMortality = calculateEnvironmentalMortality(state); // Returns breakdown by cause
  
  // Healthcare reduction: good healthcare reduces deaths significantly
  const healthcareReduction = Math.max(0.3, 1 - (qol.healthcareQuality * 0.7));

  // War multiplier: active conflicts dramatically increase deaths
  const activeConflicts = state.conflictResolution?.activeConflicts || 0;
  const warMultiplier = activeConflicts > 0 ? 1.5 + (activeConflicts * 0.2) : 1.0;

  // Base death rate (old baseline) - still applies for non-environmental factors
  const baselineDeaths = pop.baselineDeathRate * healthcareReduction * warMultiplier;
  
  // NEW: Environmental mortality ADDS to baseline (not multiplies)
  // This is because environmental deaths are additional excess mortality
  pop.adjustedDeathRate = baselineDeaths + (envMortality.total * 12); // Convert monthly to annual
  
  // === 4. APPLY EXTINCTION SCENARIO IMPACTS (Non-Environmental) ===
  // Nuclear war, AI takeover, etc. - still use old extinction logic
  if (state.extinctionState.active && state.extinctionState.mechanism !== 'climate_tipping_point') {
    const extinctionDeathRate = calculateExtinctionDeathRate(state);
    pop.adjustedDeathRate += extinctionDeathRate;
  }
  // Note: Environmental extinction is now handled by calculateEnvironmentalMortality()

  // === 5. CALCULATE NET GROWTH ===
  pop.netGrowthRate = pop.adjustedBirthRate - pop.adjustedDeathRate;
  const monthlyGrowthRate = pop.netGrowthRate / 12;

  // === 6. APPLY POPULATION CHANGE ===
  const previousPopulation = pop.population;
  const newPopulation = pop.population * (1 + monthlyGrowthRate);

  // Guard against NaN
  if (isNaN(newPopulation) || newPopulation < 0) {
    console.warn(`⚠️  Population calculation produced ${newPopulation}, using previous value`);
    pop.population = Math.max(0, previousPopulation * 0.99); // Small decline as fallback
  } else {
    pop.population = Math.max(0, newPopulation);
  }

  // === 7. CARRYING CAPACITY CONSTRAINT ===
  // Overshoot → die-off (Malthusian collapse)
  if (pop.population > pop.carryingCapacity) {
    const overshoot = pop.population - pop.carryingCapacity;
    const overshootDeaths = overshoot * 0.05; // 5% of excess dies per month
    pop.population -= overshootDeaths;
    pop.monthlyExcessDeaths += overshootDeaths;
    // FIX P1.1: Convert overshoot deaths from billions to millions for consistency
    pop.deathsByCategory.famine += overshootDeaths * 1000; // Track overshoot deaths as famine (in millions)
  }

  // === 8. TRACK CUMULATIVE DEATHS ===
  const naturalDeaths = previousPopulation * (pop.baselineDeathRate / 12);
  const actualDeaths = previousPopulation - pop.population;
  pop.monthlyExcessDeaths = Math.max(0, actualDeaths - naturalDeaths);
  pop.cumulativeCrisisDeaths += pop.monthlyExcessDeaths;

  // FIX (Oct 13, 2025): Track environmental deaths by category
  // This fixes the "90% of deaths missing" bug in Monte Carlo reports
  // Environmental mortality is a rate (0-0.10), applied to current population
  const currentPopBillions = previousPopulation; // Use pop at START of month
  pop.deathsByCategory.famine += (envMortality.famine * currentPopBillions * 1000); // Convert to millions
  pop.deathsByCategory.disease += (envMortality.disease * currentPopBillions * 1000);
  pop.deathsByCategory.climate += (envMortality.climate * currentPopBillions * 1000);
  pop.deathsByCategory.ecosystem += (envMortality.ecosystem * currentPopBillions * 1000);
  pop.deathsByCategory.pollution += (envMortality.pollution * currentPopBillions * 1000);

  // DEBUG (P1.1 - Death Accounting): Log death tracking mismatch
  if (state.currentMonth % 12 === 0 && actualDeaths > 0.1) { // Log annually when deaths >100M
    const trackedDeaths = Object.values(pop.deathsByCategory).reduce((a, b) => a + b, 0) / 1000; // Convert millions to billions
    const discrepancy = Math.abs(actualDeaths - trackedDeaths);
    if (discrepancy > 0.5) { // >500M discrepancy
      console.log(`⚠️  DEATH ACCOUNTING MISMATCH (Month ${state.currentMonth}):`);
      console.log(`   Actual population deaths: ${actualDeaths.toFixed(3)}B (${(actualDeaths * 1000).toFixed(0)}M)`);
      console.log(`   Tracked by category: ${trackedDeaths.toFixed(3)}B (${(trackedDeaths * 1000).toFixed(0)}M)`);
      console.log(`   Discrepancy: ${discrepancy.toFixed(3)}B (${(discrepancy * 1000).toFixed(0)}M) - ${(discrepancy / actualDeaths * 100).toFixed(0)}%`);
      console.log(`   Categories: war=${(pop.deathsByCategory.war).toFixed(0)}M, famine=${(pop.deathsByCategory.famine).toFixed(0)}M, climate=${(pop.deathsByCategory.climate).toFixed(0)}M`);
    }
  }

  // === 9. CHECK THRESHOLDS ===
  pop.geneticBottleneckActive = pop.population < (pop.bottleneckThreshold / 1000000000); // Convert to billions

  // === 10. UPDATE PEAK TRACKING ===
  if (pop.population > pop.peakPopulation) {
    pop.peakPopulation = pop.population;
    pop.peakPopulationMonth = state.currentMonth;
  }

  // === 11. RECOVERY POTENTIAL ===
  pop.canRecover =
    pop.population > (pop.bottleneckThreshold / 1000000000) && // Above bottleneck
    pop.populationPressure < 0.8 && // Room to grow
    !state.extinctionState.active && // No active extinction
    state.globalMetrics.socialStability > 0.3; // Society functions

  if (pop.canRecover && pop.netGrowthRate < 0) {
    // Slow recovery growth (0.5-1% per year)
    pop.recoveryRate = 0.005 * pop.capacityModifier;
    pop.population *= (1 + pop.recoveryRate / 12);
  } else {
    pop.recoveryRate = 0;
  }

  // === 12. UPDATE DEMOGRAPHICS ===
  updateDemographics(state);

  // === 13. DETECT CRITICAL EVENTS ===
  detectPopulationEvents(state);
}

/**
 * Calculate extinction-specific death rates
 * Different extinction types have different timescales
 */
function calculateExtinctionDeathRate(state: GameState): number {
  const extinction = state.extinctionState;
  const monthsElapsed = state.currentMonth - extinction.startMonth;

  switch (extinction.type) {
    case 'instant':
      // Mirror life, grey goo (immediate)
      return 1.0; // 100% death rate

    case 'rapid':
      // Bioweapons, nuclear war (3-12 month cascade)
      // 90% die in first 6 months, then 5% per month
      if (monthsElapsed < 6) {
        return 0.15; // 15% per month for 6 months = 90% total
      } else {
        return 0.05; // 5% per month after
      }

    case 'slow':
      // Economic collapse, fertility crisis (2-10 year decline)
      // 2-5% decline per month over years
      return 0.02 + extinction.severity * 0.03;

    case 'controlled':
      // AI systematically eliminates humanity
      // 5-10% per month (calculated, efficient)
      return 0.05 + extinction.severity * 0.05;

    case 'unintended':
      // Optimization side effects, fertility collapse
      // 1-3% decline per month (slower, inadvertent)
      return 0.01 + extinction.severity * 0.02;

    default:
      return 0;
  }
}

/**
 * Update demographic structure (fertility, dependency, age)
 *
 * Research-backed differential fertility:
 * - Sub-Saharan Africa (low healthcare): 4-5 children/woman
 * - East Asia (high healthcare + advanced economy): 1.0-1.3 children/woman
 * - South Korea 2025: 0.72 children/woman (population crash)
 * - Global average: 2.3 children/woman
 */
function updateDemographics(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const qol = state.qualityOfLifeSystems;
  const economicStage = state.globalMetrics.economicTransitionStage;

  // Fertility rate (children per woman)
  const baselineFertility = 2.3; // 2025 global average

  // === HEALTHCARE EFFECT (INVERSE RELATIONSHIP) ===
  // Low healthcare → MORE children (compensate for high child mortality)
  // High healthcare → FEWER children (family planning, career focus)
  const healthcareQuality = Math.min(1.0, Math.max(0, qol.healthcareQuality));
  let healthcareModifier: number;

  if (healthcareQuality < 0.3) {
    // Poor healthcare (Sub-Saharan Africa): 1.7-2.0x
    healthcareModifier = 2.0 - (healthcareQuality / 0.3) * 0.3; // 2.0 → 1.7
  } else if (healthcareQuality < 0.7) {
    // Medium healthcare: 1.0-1.7x
    healthcareModifier = 1.7 - ((healthcareQuality - 0.3) / 0.4) * 0.7; // 1.7 → 1.0
  } else {
    // High healthcare (developed nations): 0.4-1.0x
    healthcareModifier = 1.0 - ((healthcareQuality - 0.7) / 0.3) * 0.6; // 1.0 → 0.4
  }

  // === ECONOMIC DEVELOPMENT EFFECT ===
  // Advanced economies → fewer children (urbanization, career focus, cost of living)
  let developmentModifier = 1.0;
  if (economicStage >= 2.0) {
    // Stage 2-3: -20% (industrialization, urbanization)
    // Stage 4: -50% (post-industrial, South Korea effect)
    developmentModifier = Math.max(0.3, 1.0 - (economicStage - 2.0) * 0.15);
  }

  // === SOCIAL FACTORS ===
  // Meaning crisis: existential despair reduces desire for children
  const meaningModifier = Math.max(0.5, qol.meaningAndPurpose * 0.5 + 0.5);

  // Material abundance: poverty reduces fertility (can't afford children)
  // But this is less pronounced than healthcare/development
  const abundanceModifier = Math.max(0.7, qol.materialAbundance * 0.3 + 0.7);

  // === COMBINED FERTILITY RATE ===
  pop.fertilityRate = baselineFertility *
    healthcareModifier *      // 0.4-2.0x (dominant factor)
    developmentModifier *      // 0.3-1.0x (secondary factor)
    meaningModifier *          // 0.5-1.0x (existential)
    abundanceModifier;         // 0.7-1.0x (economic)

  // Clamp to realistic bounds
  pop.fertilityRate = Math.max(0.5, Math.min(6.0, pop.fertilityRate));

  // Dependency ratio (young + old / working age)
  // High ratio = harder to sustain population
  const ageingModifier = 1 + (qol.longevityGains * 0.3); // Longevity increases old dependents
  const youthModifier = pop.fertilityRate / 2.1; // High fertility = more young dependents
  pop.dependencyRatio = 0.5 * ageingModifier * youthModifier;

  // Median age
  const baselineMedianAge = 30; // 2025 global median
  pop.medianAge = Math.min(60, baselineMedianAge + qol.longevityGains * 10); // Longevity increases median
}

/**
 * Detect and log critical population events
 */
function detectPopulationEvents(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const status = getPopulationStatus(pop.population);
  const decline = ((pop.peakPopulation - pop.population) / pop.peakPopulation) * 100;

  // Log major thresholds crossed
  if (status === PopulationStatus.DECLINING && decline > 10) {
    if (state.currentMonth % 12 === 0) { // Log once per year
      console.log(`⚠️ POPULATION DECLINE: ${pop.population.toFixed(2)}B (${decline.toFixed(0)}% from peak)`);
    }
  }

  if (status === PopulationStatus.CRITICAL && !pop.geneticBottleneckActive) {
    console.log(`🚨 CRITICAL POPULATION CRASH: ${(pop.population * 1000).toFixed(0)}M remaining`);
    console.log(`   Infrastructure collapse imminent`);
  }

  if (status === PopulationStatus.BOTTLENECK && !pop.geneticBottleneckActive) {
    pop.geneticBottleneckActive = true;
    console.log(`☠️ GENETIC BOTTLENECK: ${(pop.population * 1000000).toFixed(0)} humans survive`);
    console.log(`   Permanent loss of genetic diversity`);
    console.log(`   Recovery uncertain`);
  }

  if (status === PopulationStatus.EXTINCTION) {
    console.log(`💀 HUMAN EXTINCTION: Population fell below ${pop.extinctionThreshold.toLocaleString()}`);
    console.log(`   Last humans died in month ${state.currentMonth}`);
  }

  // Log recovery events
  if (pop.canRecover && pop.netGrowthRate > 0 && decline > 20) {
    if (state.currentMonth % 24 === 0) { // Log every 2 years
      console.log(`📈 POPULATION RECOVERY: +${(pop.netGrowthRate * 100).toFixed(2)}% per year`);
      console.log(`   Current: ${pop.population.toFixed(2)}B, Peak: ${pop.peakPopulation.toFixed(2)}B`);
    }
  }
}

/**
 * Get population status based on current population
 */
export function getPopulationStatus(population: number): PopulationStatus {
  const popMillions = population * 1000; // Convert billions to millions

  if (popMillions >= 7000) return PopulationStatus.THRIVING;
  if (popMillions >= 5000) return PopulationStatus.STABLE;
  if (popMillions >= 2000) return PopulationStatus.DECLINING;
  if (popMillions >= 100) return PopulationStatus.CRITICAL;
  if (popMillions >= 0.01) return PopulationStatus.BOTTLENECK; // 10K
  return PopulationStatus.EXTINCTION;
}

/**
 * Determine final population outcome for end-game reporting
 */
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

/**
 * Add acute crisis deaths from specific events
 * (Nuclear war, major disasters, famine, etc.)
 *
 * REGIONAL VS GLOBAL DISTINCTION:
 * - Regional crises: Affect only exposed fraction of world (state collapse, local famine, riots)
 * - Global crises: Affect entire world population (ocean acidification, microplastics, nuclear winter)
 *
 * @param state Game state
 * @param mortalityRate Death rate within exposed population (e.g., 0.60 = 60% die)
 * @param reason Short description for logging
 * @param exposedFraction Fraction of world population exposed [0-1] (default 1.0 = global)
 * @param category Death category for tracking (default 'other')
 */
export function addAcuteCrisisDeaths(
  state: GameState,
  mortalityRate: number,
  reason: string,
  exposedFraction: number = 1.0,
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'other' = 'other'
): void {
  const pop = state.humanPopulationSystem;

  // Guard against NaN/invalid inputs
  if (isNaN(mortalityRate) || mortalityRate < 0 || mortalityRate > 1) {
    console.warn(`⚠️  Invalid mortality rate: ${mortalityRate} for ${reason}`);
    return;
  }

  if (isNaN(exposedFraction) || exposedFraction < 0 || exposedFraction > 1) {
    console.warn(`⚠️  Invalid exposure fraction: ${exposedFraction} for ${reason}`);
    return;
  }

  if (isNaN(pop.population)) {
    console.warn(`⚠️  Population is NaN before crisis deaths (${reason}), resetting to 0.1B`);
    pop.population = 0.1; // Small survival population as fallback
  }

  // Calculate deaths: Only exposed population × mortality rate
  const exposedPopulation = pop.population * exposedFraction;
  const deathsInBillions = exposedPopulation * mortalityRate;

  // Apply immediate deaths
  pop.population = Math.max(0, pop.population - deathsInBillions);
  pop.monthlyExcessDeaths += deathsInBillions;
  pop.cumulativeCrisisDeaths += deathsInBillions;

  // Track by category (FIX P1.1: Convert to millions for consistency with environmental deaths)
  pop.deathsByCategory[category] += deathsInBillions * 1000; // Convert billions to millions

  // Log significant events
  if (deathsInBillions > 0.001) { // > 1M deaths
    const deathsInMillions = (deathsInBillions * 1000).toFixed(1);
    const exposedPct = (exposedFraction * 100).toFixed(0);
    const scope = exposedFraction >= 0.9 ? 'GLOBAL' : exposedFraction >= 0.4 ? 'SEMI-GLOBAL' : 'REGIONAL';
    console.log(`💀 ${scope} CRISIS DEATHS: ${deathsInMillions}M casualties (${reason}) [${category.toUpperCase()}]`);
    console.log(`   Exposed: ${exposedPct}% of world, Mortality: ${(mortalityRate * 100).toFixed(1)}%`);
    console.log(`   Population: ${pop.population.toFixed(3)}B remaining`);
  }
}

/**
 * Log summary statistics for deaths by category
 * Called at end of simulation run
 */
export function logDeathSummary(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const deaths = pop.deathsByCategory;

  console.log('\n=== DEATH SUMMARY BY CATEGORY ===');
  console.log(`Total crisis deaths: ${(pop.cumulativeCrisisDeaths * 1000).toFixed(1)}M`);
  console.log(`Population decline: ${((pop.peakPopulation - pop.population) * 1000).toFixed(1)}M (${(((pop.peakPopulation - pop.population) / pop.peakPopulation) * 100).toFixed(1)}%)`);
  console.log('\nDeaths by Category:');
  console.log(`  War:        ${(deaths.war * 1000).toFixed(1)}M (${((deaths.war / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  Famine:     ${(deaths.famine * 1000).toFixed(1)}M (${((deaths.famine / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  Climate:    ${(deaths.climate * 1000).toFixed(1)}M (${((deaths.climate / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  Disease:    ${(deaths.disease * 1000).toFixed(1)}M (${((deaths.disease / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  Ecosystem:  ${(deaths.ecosystem * 1000).toFixed(1)}M (${((deaths.ecosystem / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  Pollution:  ${(deaths.pollution * 1000).toFixed(1)}M (${((deaths.pollution / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  AI:         ${(deaths.ai * 1000).toFixed(1)}M (${((deaths.ai / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log(`  Other:      ${(deaths.other * 1000).toFixed(1)}M (${((deaths.other / pop.cumulativeCrisisDeaths) * 100).toFixed(1)}%)`);
  console.log('================================\n');
}

/**
 * Apply population effects to Quality of Life systems
 * Population dynamics create feedback loops on QoL
 */
export function applyPopulationEffectsToQoL(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const qol = state.qualityOfLifeSystems;

  // Overpopulation stress
  if (pop.populationPressure > 1.0) {
    const overpopulationStress = (pop.populationPressure - 1.0) * 0.5;
    qol.materialAbundance *= (1 - overpopulationStress * 0.3);
    qol.physicalSafety *= (1 - overpopulationStress * 0.2);
    qol.mentalHealth *= (1 - overpopulationStress * 0.1);
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

/**
 * Update outcome metrics based on population
 * Population status affects outcome probabilities
 */
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
