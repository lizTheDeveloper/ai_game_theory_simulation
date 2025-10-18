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

    // Multi-dimensional death tracking
    // PROXIMATE CAUSE: What killed them
    deathsByCategory: {
      war: 0,
      famine: 0,
      disasters: 0,  // Renamed from 'climate' - heat waves, floods, storms
      disease: 0,
      ecosystem: 0,
      pollution: 0,
      ai: 0,
      cascade: 0,      // Tipping point cascade (Oct 16, 2025)
      other: 0,
    },

    // ROOT CAUSE: Why it happened
    deathsByRootCause: {
      climateChange: 0,
      conflict: 0,
      governance: 0,
      alignment: 0,
      natural: 0,
      poverty: 0,
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

  // P2 BUG FIX (Oct 16, 2025): Reset monthly death cap counter at start of month
  pop.monthlyDeathsApplied = 0;
  pop.monthlyDeathCapReached = false;

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
  // FIX (Oct 16, 2025): Biodiversity loss affects LONG-TERM resilience (pollination, climate regulation)
  // NOT immediate carrying capacity. Industrial agriculture feeds 8B despite 65% biodiversity loss.
  // Research: No evidence that 35% biodiversity = 35% capacity in 2025.
  // Only catastrophic collapse (<20%) immediately constrains food production.
  const biodiversity = isNaN(env.biodiversityIndex) ? 0.35 : env.biodiversityIndex;
  const ecosystemModifier = biodiversity < 0.20 
    ? biodiversity * 2.5  // Catastrophic: 20% biodiv → 50% capacity, 10% → 25%, 0% → 0%
    : Math.max(0.8, 0.8 + (biodiversity - 0.2) * 0.5); // 20-100% biodiv → 80-120% capacity

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

  // P0.6 (Oct 15, 2025): Seasonal birth rate pattern (research-backed)
  // Research: Birth rates show 5-10% seasonal amplitude (not random monthly noise)
  // - Northern hemisphere: Spring/summer peaks
  // - Southern hemisphere: Autumn peaks
  // - Global average: 8% amplitude with predictable annual cycle
  // Sources: CDC birth data, PNAS seasonal fertility studies
  const monthInYear = state.currentMonth % 12;
  const seasonalBirthCycle = 1 + 0.08 * Math.sin((2 * Math.PI * monthInYear / 12) + Math.PI/2); // 8% amplitude, spring peak
  const monthlyBirthNoise = 0.98 + Math.random() * 0.04; // ±2% monthly variation

  pop.adjustedBirthRate = pop.baselineBirthRate *
    meaningModifier *
    economicModifier *
    healthcareModifier *
    stabilityModifier *
    pressureModifier *
    seasonalBirthCycle *
    monthlyBirthNoise;

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
  // P0.6 (Oct 15, 2025): Seasonal patterns + episodic environmental shocks
  // Uses calculateEnvironmentalMortality() from qualityOfLife.ts
  // Research: UNEP (2024), PNAS (2014), CDC mortality data

  const { calculateEnvironmentalMortality } = require('./qualityOfLife');
  // P0.6: Environmental mortality is now event-driven (episodic shocks)
  const envMortality = calculateEnvironmentalMortality(state, state.currentMonth); // Pass month for episodic events

  // P0.6: Seasonal death rate pattern (research-backed)
  // Research: Death rates 10-30% higher in winter vs summer (respiratory/circulatory diseases)
  // - Elderly (70+): 10% seasonal amplitude
  // - Very old (90+): 15% seasonal amplitude
  // - Global average: 12% amplitude with winter peak
  const seasonalDeathCycle = 1 + 0.12 * Math.sin((2 * Math.PI * monthInYear / 12) + Math.PI); // 12% amplitude, winter peak (shifted by π)
  const monthlyDeathNoise = 0.98 + Math.random() * 0.04; // ±2% monthly variation

  // Healthcare reduction: good healthcare reduces deaths significantly
  // P0.6: Healthcare quality is structural (not temporally variable)
  const healthcareBase = Math.max(0.3, 1 - (qol.healthcareQuality * 0.7));

  // War multiplier: active conflicts dramatically increase deaths
  const activeConflicts = state.conflictResolution?.activeConflicts || 0;
  const warMultiplier = activeConflicts > 0 ? 1.5 + (activeConflicts * 0.2) : 1.0;

  // Base death rate applies seasonal pattern and monthly noise
  const baselineDeaths = pop.baselineDeathRate * healthcareBase * warMultiplier * seasonalDeathCycle * monthlyDeathNoise;

  // NEW: Environmental mortality ADDS to baseline (not multiplies)
  // This is because environmental deaths are additional excess mortality
  const environmentalDeathRate = envMortality.total * 12; // Convert monthly to annual

  // === 4. APPLY EXTINCTION SCENARIO IMPACTS (Non-Environmental) ===
  // Nuclear war, AI takeover, etc. - still use old extinction logic
  let extinctionDeathRate = 0;
  if (state.extinctionState.active && state.extinctionState.mechanism !== 'climate_tipping_point') {
    extinctionDeathRate = calculateExtinctionDeathRate(state);
  }
  // Note: Environmental extinction is now handled by calculateEnvironmentalMortality()

  // === PHASE 1B FIX 4: Mortality Resilience Floor (Oct 17, 2025) ===
  // Research: Historical resilience after Black Death (1347-1353) - population rebounded
  // despite losing 30-60% of Europe. Human systems adapt and become more resistant to
  // further shocks as mortality increases.
  //
  // Mechanism: At 50% cumulative mortality, resilience floor reduces NEW mortality by 25%
  //            At 75% cumulative mortality, resilience floor reduces NEW mortality by 37.5%
  //            Prevents death spiral from compounding indefinitely
  //
  // Research basis:
  // - Black Death → Renaissance: Surviving populations more resilient
  // - Toba bottleneck (70K BCE): 3-10K survivors, yet humans recovered
  // - Selection effects: Vulnerable populations die first, survivors more robust
  const cumulativeMortalityRate = 1 - (pop.population / pop.peakPopulation);
  const resilienceFloor = Math.max(0, 1 - (cumulativeMortalityRate * 0.5)); // 50% mortality → 75% floor

  // Apply resilience floor to NEW mortality (not baseline)
  const proposedAdditionalMortality = environmentalDeathRate + extinctionDeathRate;
  const adjustedAdditionalMortality = proposedAdditionalMortality * resilienceFloor;

  // Combine baseline + resilience-adjusted additional mortality
  pop.adjustedDeathRate = baselineDeaths + adjustedAdditionalMortality;

  // Log resilience floor activation (when significant)
  if (resilienceFloor < 0.9 && state.currentMonth % 12 === 0 && adjustedAdditionalMortality > 0.01) {
    const reduction = ((1 - resilienceFloor) * 100).toFixed(1);
    console.log(`🛡️  RESILIENCE FLOOR ACTIVE: Reducing new mortality by ${reduction}% (cumulative mortality: ${(cumulativeMortalityRate * 100).toFixed(1)}%)`);
    console.log(`   Proposed: ${(proposedAdditionalMortality * 100).toFixed(2)}%/year → Actual: ${(adjustedAdditionalMortality * 100).toFixed(2)}%/year`);
  }

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

    // MULTI-DIMENSIONAL TRACKING (Oct 18, 2025 - UPDATED)
    // PROXIMATE: Famine (Malthusian collapse manifests as food shortage)
    pop.deathsByCategory.famine += overshootDeaths;

    // ROOT CAUSE: Multi-factor attribution (research-backed)
    // Research: IPCC AR6 (2022), Rapa Nui study (2020), Sahel 2022 analysis
    // Overshoot deaths result from INTERACTION of climate, poverty, and governance
    // Not monocausal - climate degrades capacity, poverty limits adaptation, governance fails response

    // Calculate proportional contributions to capacity reduction
    // Default baseline: 40% climate/environment, 50% governance, 10% poverty

    // Climate contribution: How much did climate degrade capacity?
    const climateContribution = Math.min(0.6, Math.max(0.2, 1.0 - climateModifier)); // 20-60%

    // Resource/ecosystem contribution (also climate-driven but indirect)
    const resourceContribution = Math.min(0.3, Math.max(0, 1.0 - resourceModifier) * 0.5);
    const ecosystemContribution = biodiversity < 0.20 ? 0.2 : Math.min(0.2, (1.0 - ecosystemModifier) * 0.3);

    // Total environmental impact (climate + resources + ecosystem)
    const environmentalImpact = Math.min(0.7, climateContribution + resourceContribution + ecosystemContribution);

    // Poverty constraint: Poor regions can't afford adaptation (contraception, agricultural tech)
    const povertyConstraint = Math.max(0.05, Math.min(0.3, (1 - qol.materialAbundance) * 0.4));

    // Governance responsibility: Remainder (minimum 20% floor - policy ALWAYS matters)
    const governanceShare = Math.max(0.2, 1.0 - environmentalImpact - povertyConstraint);

    // Normalize to ensure total = 1.0
    const totalShares = environmentalImpact + povertyConstraint + governanceShare;
    const climateShare = environmentalImpact / totalShares;
    const povertyShare = povertyConstraint / totalShares;
    const govShare = governanceShare / totalShares;

    // Apply proportional attribution
    pop.deathsByRootCause.climateChange += overshootDeaths * climateShare;
    pop.deathsByRootCause.poverty += overshootDeaths * povertyShare;
    pop.deathsByRootCause.governance += overshootDeaths * govShare;

    // Log significant overshoot events with attribution breakdown
    if (overshootDeaths > 0.001 && state.currentMonth % 12 === 0) { // >1M deaths, log annually
      const deathsM = (overshootDeaths * 1000).toFixed(1);
      console.log(`💀 OVERSHOOT DEATHS: ${deathsM}M (population ${pop.population.toFixed(2)}B exceeds capacity ${pop.carryingCapacity.toFixed(2)}B)`);
      console.log(`   Root cause attribution: Climate ${(climateShare * 100).toFixed(0)}%, Poverty ${(povertyShare * 100).toFixed(0)}%, Governance ${(govShare * 100).toFixed(0)}%`);
    }
  }

  // === 8. TRACK CUMULATIVE DEATHS ===
  const naturalDeaths = previousPopulation * (pop.baselineDeathRate / 12);
  const actualDeaths = previousPopulation - pop.population;
  pop.monthlyExcessDeaths = Math.max(0, actualDeaths - naturalDeaths);
  pop.cumulativeCrisisDeaths += pop.monthlyExcessDeaths;

  // FIX (Oct 13, 2025): Track environmental deaths by category
  // MULTI-DIMENSIONAL (Oct 18, 2025): Track both proximate AND root causes
  // Environmental mortality is a rate (0-0.10), applied to current population
  const currentPopBillions = previousPopulation; // Use pop at START of month

  // PROXIMATE CAUSES (what killed them)
  const envFamineDeaths = envMortality.famine * currentPopBillions;
  const envDiseaseDeaths = envMortality.disease * currentPopBillions;
  const envDisasterDeaths = envMortality.climate * currentPopBillions; // Climate disasters (heat, floods)
  const envEcosystemDeaths = envMortality.ecosystem * currentPopBillions;
  const envPollutionDeaths = envMortality.pollution * currentPopBillions;

  pop.deathsByCategory.famine += envFamineDeaths;
  pop.deathsByCategory.disease += envDiseaseDeaths;
  pop.deathsByCategory.disasters += envDisasterDeaths;
  pop.deathsByCategory.ecosystem += envEcosystemDeaths;
  pop.deathsByCategory.pollution += envPollutionDeaths;

  // ROOT CAUSES (why it happened) - environmental deaths are climate-driven
  const totalEnvDeaths = envFamineDeaths + envDiseaseDeaths + envDisasterDeaths + envEcosystemDeaths + envPollutionDeaths;
  pop.deathsByRootCause.climateChange += totalEnvDeaths;

  // DEBUG (P1.1 - Death Accounting): Log death tracking mismatch
  if (state.currentMonth % 12 === 0 && actualDeaths > 0.1) { // Log annually when deaths >100M
    const trackedDeaths = Object.values(pop.deathsByCategory).reduce((a, b) => a + b, 0); // Already in billions
    const discrepancy = Math.abs(actualDeaths - trackedDeaths);
    if (discrepancy > 0.5) { // >500M discrepancy
      console.log(`⚠️  DEATH ACCOUNTING MISMATCH (Month ${state.currentMonth}):`);
      console.log(`   Actual population deaths: ${actualDeaths.toFixed(3)}B (${(actualDeaths * 1000).toFixed(0)}M)`);
      console.log(`   Tracked by category: ${trackedDeaths.toFixed(3)}B (${(trackedDeaths * 1000).toFixed(0)}M)`);
      console.log(`   Discrepancy: ${discrepancy.toFixed(3)}B (${(discrepancy * 1000).toFixed(0)}M) - ${(discrepancy / actualDeaths * 100).toFixed(0)}%`);
      console.log(`   Categories: war=${(pop.deathsByCategory.war * 1000).toFixed(0)}M, famine=${(pop.deathsByCategory.famine * 1000).toFixed(0)}M, disasters=${(pop.deathsByCategory.disasters * 1000).toFixed(0)}M`);
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
/**
 * Apply crisis deaths with differential impact by population segment (P2.3)
 * More vulnerable segments (precariat, rural) suffer higher mortality
 * 
 * @param state Game state
 * @param baseMortalityRate Base mortality rate (will be modified by segment vulnerability)
 * @param reason Description of crisis
 * @param exposedFraction Fraction of population exposed (0-1)
 * @param category Death category for tracking
 */
function addSegmentSpecificCrisisDeaths(
  state: GameState,
  baseMortalityRate: number,
  reason: string,
  exposedFraction: number,
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'cascade' | 'other'
): void {
  const pop = state.humanPopulationSystem;
  const segments = state.society.segments;
  
  if (!segments || segments.length === 0) {
    // Fallback to uniform mortality if segments not initialized
    return addUniformCrisisDeaths(state, baseMortalityRate, reason, exposedFraction, category);
  }
  
  let totalDeathsRequested = 0;
  let totalDeathsApplied = 0;
  const segmentDeaths: Array<{ segment: string; deaths: number; mortality: number }> = [];
  
  // Calculate deaths for each segment
  for (const segment of segments) {
    // Segment-specific mortality = base × vulnerability × survival rate inverse
    // crisisVulnerability: 0.2 (elite) to 2.0 (precariat)
    // survivalRate: 1.5 (elite) to 0.6 (precariat)
    const vulnerabilityMultiplier = segment.crisisVulnerability;
    const survivalMultiplier = 2.0 - segment.survivalRate; // Inverse: elite 0.5x, precariat 1.4x
    
    const segmentMortality = baseMortalityRate * vulnerabilityMultiplier * survivalMultiplier;
    
    // Calculate segment population (fraction of total)
    const segmentPopulation = pop.population * segment.populationFraction;
    const segmentExposed = segmentPopulation * exposedFraction;
    const segmentDeathsRequested = segmentExposed * segmentMortality;
    
    totalDeathsRequested += segmentDeathsRequested;
    segmentDeaths.push({
      segment: segment.name,
      deaths: segmentDeathsRequested,
      mortality: segmentMortality
    });
  }
  
  // Apply death cap (20% monthly max)
  const monthlyDeathCap = pop.population * 0.20;
  const remainingCapacity = Math.max(0, monthlyDeathCap - (pop.monthlyDeathsApplied || 0));
  const totalDeathsAllowed = Math.min(totalDeathsRequested, remainingCapacity);
  
  // If capped, scale down all segment deaths proportionally
  const scaleFactor = totalDeathsRequested > 0 
    ? Math.min(1.0, totalDeathsAllowed / totalDeathsRequested)
    : 0;
  
  // Apply deaths
  for (const sd of segmentDeaths) {
    const actualDeaths = sd.deaths * scaleFactor;
    totalDeathsApplied += actualDeaths;
  }
  
  // Update population
  pop.population = Math.max(0, pop.population - totalDeathsApplied);
  pop.monthlyExcessDeaths += totalDeathsApplied;
  pop.cumulativeCrisisDeaths += totalDeathsApplied;
  pop.monthlyDeathsApplied = (pop.monthlyDeathsApplied || 0) + totalDeathsApplied;

  // Track by category (stored in billions, converted to millions for display)
  pop.deathsByCategory[category] += totalDeathsApplied;
  
  // Log significant events
  if (totalDeathsApplied > 0.001) {
    const deathsInMillions = (totalDeathsApplied * 1000).toFixed(1);
    const exposedPct = (exposedFraction * 100).toFixed(0);
    const scope = exposedFraction >= 0.9 ? 'GLOBAL' : exposedFraction >= 0.4 ? 'SEMI-GLOBAL' : 'REGIONAL';
    const cappedNote = scaleFactor < 1.0 ? ' [CAPPED]' : '';
    
    console.log(`💀 ${scope} CRISIS DEATHS (Segment-Specific): ${deathsInMillions}M casualties (${reason}) [${category.toUpperCase()}]${cappedNote}`);
    console.log(`   Exposed: ${exposedPct}% of world, Base Mortality: ${(baseMortalityRate * 100).toFixed(1)}%`);
    
    // Show differential impact by segment
    const maxImpact = segmentDeaths.reduce((max, sd) => Math.max(max, sd.mortality), 0);
    if (maxImpact > baseMortalityRate * 1.5) {
      const mostVulnerable = segmentDeaths.reduce((max, sd) => 
        sd.mortality > max.mortality ? sd : max
      );
      const leastVulnerable = segmentDeaths.reduce((min, sd) => 
        sd.mortality < min.mortality ? sd : min
      );
      console.log(`   Differential Impact: ${mostVulnerable.segment} ${(mostVulnerable.mortality * 100).toFixed(1)}% vs ${leastVulnerable.segment} ${(leastVulnerable.mortality * 100).toFixed(1)}%`);
    }
    
    console.log(`   Population: ${pop.population.toFixed(3)}B remaining`);
  }
  
  // Track if cap was reached
  if (scaleFactor < 1.0 && !pop.monthlyDeathCapReached) {
    pop.monthlyDeathCapReached = true;
    console.warn(`⚠️  MONTHLY DEATH CAP REACHED (20% of population)`);
    console.warn(`   Requested: ${(totalDeathsRequested * 1000).toFixed(1)}M, Applied: ${(totalDeathsApplied * 1000).toFixed(1)}M`);
  }
}

/**
 * Apply uniform crisis deaths (legacy behavior, used when segments not active)
 */
function addUniformCrisisDeaths(
  state: GameState,
  mortalityRate: number,
  reason: string,
  exposedFraction: number,
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'cascade' | 'other'
): void {
  const pop = state.humanPopulationSystem;
  
  // Initialize monthly tracking if not present
  if (pop.monthlyDeathsApplied === undefined) {
    pop.monthlyDeathsApplied = 0;
    pop.monthlyDeathCapReached = false;
  }
  
  // Calculate monthly death cap (20% of current population)
  const monthlyDeathCap = pop.population * 0.20;
  const remainingCapacity = Math.max(0, monthlyDeathCap - pop.monthlyDeathsApplied);
  
  // Calculate deaths: Only exposed population × mortality rate
  const exposedPopulation = pop.population * exposedFraction;
  const requestedDeaths = exposedPopulation * mortalityRate;
  
  // Apply death cap
  const actualDeaths = Math.min(requestedDeaths, remainingCapacity);
  const deathsInBillions = actualDeaths;
  
  // Track if cap was reached (for logging)
  if (actualDeaths < requestedDeaths && !pop.monthlyDeathCapReached) {
    pop.monthlyDeathCapReached = true;
    console.warn(`⚠️  MONTHLY DEATH CAP REACHED (20% of population)`);
    console.warn(`   Requested: ${(requestedDeaths * 1000).toFixed(1)}M, Applied: ${(actualDeaths * 1000).toFixed(1)}M`);
    console.warn(`   Further death events this month will be capped or skipped`);
  }

  // Apply immediate deaths
  pop.population = Math.max(0, pop.population - deathsInBillions);
  pop.monthlyExcessDeaths += deathsInBillions;
  pop.cumulativeCrisisDeaths += deathsInBillions;
  pop.monthlyDeathsApplied = (pop.monthlyDeathsApplied || 0) + deathsInBillions;

  // Track by category (stored in billions, converted to millions for display)
  pop.deathsByCategory[category] += deathsInBillions;

  // Log significant events
  if (deathsInBillions > 0.001) { // > 1M deaths
    const deathsInMillions = (deathsInBillions * 1000).toFixed(1);
    const exposedPct = (exposedFraction * 100).toFixed(0);
    const scope = exposedFraction >= 0.9 ? 'GLOBAL' : exposedFraction >= 0.4 ? 'SEMI-GLOBAL' : 'REGIONAL';
    const cappedNote = actualDeaths < requestedDeaths ? ' [CAPPED]' : '';
    console.log(`💀 ${scope} CRISIS DEATHS: ${deathsInMillions}M casualties (${reason}) [${category.toUpperCase()}]${cappedNote}`);
    console.log(`   Exposed: ${exposedPct}% of world, Mortality: ${(mortalityRate * 100).toFixed(1)}%`);
    console.log(`   Population: ${pop.population.toFixed(3)}B remaining`);
  }
}

/**
 * Add acute crisis deaths (public API)
 * 
 * P2.3 UPDATE (Oct 16, 2025): Now supports segment-specific mortality
 * - If heterogeneous population segments are active, applies differential impact
 * - Vulnerable segments (precariat, rural) suffer 2-3x higher mortality
 * - Protected segments (elite, urban) suffer 0.3-0.5x lower mortality
 * - Falls back to uniform mortality if segments not initialized
 */
export function addAcuteCrisisDeaths(
  state: GameState,
  mortalityRate: number,
  reason: string,
  exposedFraction: number = 1.0,
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'cascade' | 'other' = 'other'
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

  
  // P2.3 UPDATE (Oct 16, 2025): Route to segment-specific or uniform mortality
  // If heterogeneous population segments are active, apply differential mortality
  // Otherwise, fall back to uniform mortality (legacy behavior)
  
  if (state.society.segments && state.society.segments.length > 0) {
    addSegmentSpecificCrisisDeaths(state, mortalityRate, reason, exposedFraction, category);
  } else {
    addUniformCrisisDeaths(state, mortalityRate, reason, exposedFraction, category);
  }
}

/**
 * Log summary statistics for deaths by category
 * Called at end of simulation run
 */
export function logDeathSummary(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const proximate = pop.deathsByCategory;
  const rootCause = pop.deathsByRootCause;

  // Calculate totals for both dimensions
  const totalProximateDeaths = Object.values(proximate).reduce((sum, val) => sum + val, 0);
  const totalRootCauseDeaths = Object.values(rootCause).reduce((sum, val) => sum + val, 0);

  // Use the larger total as denominator
  const totalDeaths = Math.max(pop.cumulativeCrisisDeaths, totalProximateDeaths, totalRootCauseDeaths);

  // Helper function to format percentage, avoiding NaN and Infinity
  const formatPercent = (value: number, total: number): string => {
    if (total === 0) return '0.0'; // No deaths at all
    if (value === 0) return '0.0'; // This category has no deaths
    return ((value / total) * 100).toFixed(1);
  };

  console.log('\n=== MULTI-DIMENSIONAL DEATH SUMMARY ===');
  console.log(`Total crisis deaths: ${(pop.cumulativeCrisisDeaths * 1000).toFixed(1)}M`);
  console.log(`Population decline: ${((pop.peakPopulation - pop.population) * 1000).toFixed(1)}M (${(((pop.peakPopulation - pop.population) / pop.peakPopulation) * 100).toFixed(1)}%)`);

  // PROXIMATE CAUSES: What killed them (medical/physical cause)
  console.log('\n--- PROXIMATE CAUSES (What killed them) ---');
  console.log(`  War:        ${(proximate.war * 1000).toFixed(1)}M (${formatPercent(proximate.war, totalDeaths)}%)`);
  console.log(`  Famine:     ${(proximate.famine * 1000).toFixed(1)}M (${formatPercent(proximate.famine, totalDeaths)}%)`);
  console.log(`  Disasters:  ${(proximate.disasters * 1000).toFixed(1)}M (${formatPercent(proximate.disasters, totalDeaths)}%)`);
  console.log(`  Disease:    ${(proximate.disease * 1000).toFixed(1)}M (${formatPercent(proximate.disease, totalDeaths)}%)`);
  console.log(`  Ecosystem:  ${(proximate.ecosystem * 1000).toFixed(1)}M (${formatPercent(proximate.ecosystem, totalDeaths)}%)`);
  console.log(`  Pollution:  ${(proximate.pollution * 1000).toFixed(1)}M (${formatPercent(proximate.pollution, totalDeaths)}%)`);
  console.log(`  AI:         ${(proximate.ai * 1000).toFixed(1)}M (${formatPercent(proximate.ai, totalDeaths)}%)`);
  console.log(`  Cascade:    ${(proximate.cascade * 1000).toFixed(1)}M (${formatPercent(proximate.cascade, totalDeaths)}%)`);
  console.log(`  Other:      ${(proximate.other * 1000).toFixed(1)}M (${formatPercent(proximate.other, totalDeaths)}%)`);

  // ROOT CAUSES: Why it happened (underlying systemic driver)
  console.log('\n--- ROOT CAUSES (Why it happened) ---');
  console.log(`  Climate Change: ${(rootCause.climateChange * 1000).toFixed(1)}M (${formatPercent(rootCause.climateChange, totalDeaths)}%)`);
  console.log(`  Conflict:       ${(rootCause.conflict * 1000).toFixed(1)}M (${formatPercent(rootCause.conflict, totalDeaths)}%)`);
  console.log(`  Governance:     ${(rootCause.governance * 1000).toFixed(1)}M (${formatPercent(rootCause.governance, totalDeaths)}%)`);
  console.log(`  Alignment:      ${(rootCause.alignment * 1000).toFixed(1)}M (${formatPercent(rootCause.alignment, totalDeaths)}%)`);
  console.log(`  Natural:        ${(rootCause.natural * 1000).toFixed(1)}M (${formatPercent(rootCause.natural, totalDeaths)}%)`);
  console.log(`  Poverty:        ${(rootCause.poverty * 1000).toFixed(1)}M (${formatPercent(rootCause.poverty, totalDeaths)}%)`);
  console.log(`  Other:          ${(rootCause.other * 1000).toFixed(1)}M (${formatPercent(rootCause.other, totalDeaths)}%)`);
  console.log('==========================================\n');
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
