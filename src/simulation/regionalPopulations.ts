/**
 * Regional Population System (TIER 1.5 - Phase 5)
 *
 * Tracks population dynamics by major world regions with differential growth/decline rates.
 *
 * Research backing:
 * - UN World Population Prospects 2024
 * - Sub-Saharan Africa: 4.5 children/woman, growing fast
 * - East Asia: 1.0-1.3 children/woman, declining (South Korea 0.72)
 * - Europe: 1.5 children/woman, aging + declining
 * - North America: 1.7 children/woman, stable via immigration
 *
 * @see plans/population-dynamics-and-extinction-nuance.md (Phase 5)
 */

import { GameState } from '@/types/game';
import { RegionalPopulation } from '@/types/population';

/**
 * Initialize regional populations with 2025 baseline data
 *
 * Total: ~8.0B distributed across 7 major world regions
 */
export function initializeRegionalPopulations(): RegionalPopulation[] {
  return [
    // 1. SUB-SAHARAN AFRICA (1.2B people, HIGH GROWTH)
    {
      name: 'Sub-Saharan Africa',
      population: 1200,                    // 1.2B
      peakPopulation: 1200,

      // Demographics (high fertility, improving healthcare)
      baselineBirthRate: 0.034,            // 3.4% per year (high)
      baselineDeathRate: 0.011,            // 1.1% per year (declining)
      adjustedBirthRate: 0.034,
      adjustedDeathRate: 0.011,
      netGrowthRate: 0.023,                // 2.3% growth

      // Regional characteristics
      healthcareQuality: 0.3,              // Poor healthcare → high fertility
      economicStage: 1.0,                  // Early industrialization
      fertilityRate: 4.5,                  // 4-5 children/woman
      medianAge: 19,                       // Very young population

      // Carrying capacity
      carryingCapacity: 2500,              // Can support 2.5B with development
      baselineCarryingCapacity: 2500,
      populationPressure: 0.48,            // 48% of capacity

      // Vulnerabilities
      climateVulnerability: 0.7,           // Sahel desertification, droughts
      resourceVulnerability: 0.6,          // Food insecurity
      conflictRisk: 0.5,                   // Civil wars, instability

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },

    // 2. EAST ASIA (1.7B people, DECLINING)
    {
      name: 'East Asia',
      population: 1700,                    // 1.7B (China 1.4B, Japan 125M, Korea 52M, etc.)
      peakPopulation: 1700,

      // Demographics (low fertility, excellent healthcare)
      baselineBirthRate: 0.010,            // 1.0% per year (very low)
      baselineDeathRate: 0.008,            // 0.8% per year
      adjustedBirthRate: 0.010,
      adjustedDeathRate: 0.008,
      netGrowthRate: 0.002,                // 0.2% growth (nearly zero)

      // Regional characteristics
      healthcareQuality: 0.85,             // Excellent healthcare → low fertility
      economicStage: 3.5,                  // Advanced economy
      fertilityRate: 1.2,                  // 1.0-1.3 children/woman (South Korea 0.72)
      medianAge: 39,                       // Aging population

      // Carrying capacity
      carryingCapacity: 2000,              // High density, tech advanced
      baselineCarryingCapacity: 2000,
      populationPressure: 0.85,            // 85% of capacity

      // Vulnerabilities
      climateVulnerability: 0.5,           // Typhoons, sea level rise
      resourceVulnerability: 0.7,          // Heavy resource imports
      conflictRisk: 0.3,                   // Regional tensions (Taiwan)

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },

    // 3. SOUTH ASIA (2.0B people, MODERATE GROWTH)
    {
      name: 'South Asia',
      population: 2000,                    // 2.0B (India 1.4B, Pakistan 240M, Bangladesh 170M)
      peakPopulation: 2000,

      // Demographics (transitioning fertility)
      baselineBirthRate: 0.018,            // 1.8% per year
      baselineDeathRate: 0.007,            // 0.7% per year
      adjustedBirthRate: 0.018,
      adjustedDeathRate: 0.007,
      netGrowthRate: 0.011,                // 1.1% growth

      // Regional characteristics
      healthcareQuality: 0.5,              // Improving but uneven
      economicStage: 2.0,                  // Middle income
      fertilityRate: 2.2,                  // 2.0-2.5 children/woman
      medianAge: 28,                       // Young-ish population

      // Carrying capacity
      carryingCapacity: 2200,              // Near capacity
      baselineCarryingCapacity: 2200,
      populationPressure: 0.91,            // 91% of capacity (strained)

      // Vulnerabilities
      climateVulnerability: 0.8,           // Monsoons, flooding, heatwaves
      resourceVulnerability: 0.7,          // Water stress (Indus, Ganges)
      conflictRisk: 0.6,                   // India-Pakistan tensions

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },

    // 4. EUROPE (750M people, DECLINING)
    {
      name: 'Europe',
      population: 750,                     // 750M (EU 450M, Russia 145M, UK 68M, etc.)
      peakPopulation: 750,

      // Demographics (low fertility, aging)
      baselineBirthRate: 0.010,            // 1.0% per year
      baselineDeathRate: 0.011,            // 1.1% per year (aging)
      adjustedBirthRate: 0.010,
      adjustedDeathRate: 0.011,
      netGrowthRate: -0.001,               // -0.1% (slight decline)

      // Regional characteristics
      healthcareQuality: 0.9,              // Excellent healthcare
      economicStage: 3.8,                  // Advanced economy
      fertilityRate: 1.5,                  // 1.4-1.6 children/woman
      medianAge: 43,                       // Very old population

      // Carrying capacity
      carryingCapacity: 800,               // High capacity (tech, resources)
      baselineCarryingCapacity: 800,
      populationPressure: 0.94,            // 94% of capacity

      // Vulnerabilities
      climateVulnerability: 0.4,           // Moderate (Mediterranean droughts)
      resourceVulnerability: 0.5,          // Energy dependence
      conflictRisk: 0.2,                   // Low (Ukraine war exception)

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },

    // 5. NORTH AMERICA (380M people, STABLE)
    {
      name: 'North America',
      population: 580,                     // 580M (US 335M, Mexico 130M, Canada 40M)
      peakPopulation: 580,

      // Demographics (low fertility, immigration compensates)
      baselineBirthRate: 0.012,            // 1.2% per year
      baselineDeathRate: 0.009,            // 0.9% per year
      adjustedBirthRate: 0.012,
      adjustedDeathRate: 0.009,
      netGrowthRate: 0.003,                // 0.3% growth (immigration helps)

      // Regional characteristics
      healthcareQuality: 0.8,              // Good but uneven (US vs Mexico)
      economicStage: 3.5,                  // Advanced
      fertilityRate: 1.7,                  // 1.6-1.8 children/woman
      medianAge: 38,                       // Aging

      // Carrying capacity
      carryingCapacity: 800,               // High capacity (vast land)
      baselineCarryingCapacity: 800,
      populationPressure: 0.73,            // 73% of capacity

      // Vulnerabilities
      climateVulnerability: 0.5,           // Hurricanes, wildfires, droughts
      resourceVulnerability: 0.3,          // Resource-rich
      conflictRisk: 0.1,                   // Low (domestic polarization)

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },

    // 6. LATIN AMERICA (660M people, SLOW GROWTH)
    {
      name: 'Latin America',
      population: 660,                     // 660M (Brazil 215M, Mexico in NA, Colombia, Argentina, etc.)
      peakPopulation: 660,

      // Demographics (transitioning)
      baselineBirthRate: 0.015,            // 1.5% per year
      baselineDeathRate: 0.007,            // 0.7% per year
      adjustedBirthRate: 0.015,
      adjustedDeathRate: 0.007,
      netGrowthRate: 0.008,                // 0.8% growth

      // Regional characteristics
      healthcareQuality: 0.6,              // Moderate
      economicStage: 2.5,                  // Middle income
      fertilityRate: 2.0,                  // 1.9-2.1 children/woman
      medianAge: 31,                       // Young-middle

      // Carrying capacity
      carryingCapacity: 1000,              // Amazon basin, vast resources
      baselineCarryingCapacity: 1000,
      populationPressure: 0.66,            // 66% of capacity

      // Vulnerabilities
      climateVulnerability: 0.6,           // Amazon dieback, droughts
      resourceVulnerability: 0.4,          // Mostly self-sufficient
      conflictRisk: 0.4,                   // Drug wars, instability

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },

    // 7. MIDDLE EAST & NORTH AFRICA (530M people, MODERATE GROWTH)
    {
      name: 'Middle East & North Africa',
      population: 530,                     // 530M (Egypt 110M, Iran 88M, Turkey 85M, etc.)
      peakPopulation: 530,

      // Demographics (youth bulge, transitioning)
      baselineBirthRate: 0.022,            // 2.2% per year
      baselineDeathRate: 0.006,            // 0.6% per year
      adjustedBirthRate: 0.022,
      adjustedDeathRate: 0.006,
      netGrowthRate: 0.016,                // 1.6% growth

      // Regional characteristics
      healthcareQuality: 0.55,             // Variable (UAE vs Yemen)
      economicStage: 2.2,                  // Oil economies vs poor
      fertilityRate: 2.8,                  // 2.5-3.0 children/woman
      medianAge: 27,                       // Young (youth bulge)

      // Carrying capacity
      carryingCapacity: 600,               // Limited by water
      baselineCarryingCapacity: 600,
      populationPressure: 0.88,            // 88% of capacity (water stress)

      // Vulnerabilities
      climateVulnerability: 0.9,           // Extreme heat, water scarcity
      resourceVulnerability: 0.8,          // Heavy food imports
      conflictRisk: 0.7,                   // Wars, civil conflicts

      // Crisis impacts
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0,
    },
  ];
}

/**
 * Update all regional populations each month
 *
 * Applies differential dynamics based on healthcare, economic development, and crises.
 */
export function updateRegionalPopulations(state: GameState): void {
  const pop = state.humanPopulationSystem;

  if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
    // Initialize if not present
    pop.regionalPopulations = initializeRegionalPopulations();
  }

  let totalPopulation = 0;
  let totalCrisisDeaths = 0;

  for (const region of pop.regionalPopulations) {
    // === 1. CALCULATE BIRTH RATE ===
    // Use inverse healthcare-fertility relationship (implemented in populationDynamics.ts)
    const healthcareFertilityModifier = calculateHealthcareFertilityModifier(region.healthcareQuality);
    const developmentModifier = calculateDevelopmentModifier(region.economicStage);
    const meaningModifier = Math.max(0.5, state.qualityOfLifeSystems.meaningAndPurpose * 0.5 + 0.5);
    const abundanceModifier = Math.max(0.7, state.qualityOfLifeSystems.materialAbundance * 0.3 + 0.7);

    region.fertilityRate = 2.3 * // Global baseline
      healthcareFertilityModifier *
      developmentModifier *
      meaningModifier *
      abundanceModifier;

    // Clamp to realistic bounds
    region.fertilityRate = Math.max(0.5, Math.min(6.0, region.fertilityRate));

    // Birth rate from fertility
    region.adjustedBirthRate = region.baselineBirthRate *
      (region.fertilityRate / 2.3); // Scale by fertility vs baseline

    // === 2. CALCULATE DEATH RATE ===
    const healthcareReduction = Math.max(0.3, 1 - (region.healthcareQuality * 0.7));
    const foodStock = isNaN(state.resourceEconomy.food.currentStock) ? 100 : state.resourceEconomy.food.currentStock;
    const waterStock = isNaN(state.resourceEconomy.water.currentStock) ? 100 : state.resourceEconomy.water.currentStock;
    const foodWaterStress = Math.max(0,
      (1 - foodStock / 100) * 0.3 +
      (1 - waterStock / 100) * 0.3
    );
    const climateStability = isNaN(state.environmentalAccumulation.climateStability) ? 0.5 : state.environmentalAccumulation.climateStability;
    const climateStress = (1 - climateStability) * 0.4 * region.climateVulnerability;
    const pollutionLevel = isNaN(state.environmentalAccumulation.pollutionLevel) ? 0 : state.environmentalAccumulation.pollutionLevel;
    const pollutionStress = pollutionLevel * 0.3;
    const warMultiplier = region.conflictRisk > 0.5 ? 1.5 : 1.0;

    const crisisMultiplier = 1 + foodWaterStress + climateStress + pollutionStress;

    region.adjustedDeathRate = region.baselineDeathRate *
      healthcareReduction *
      crisisMultiplier *
      warMultiplier;

    // Guard against NaN
    if (isNaN(region.adjustedDeathRate)) {
      region.adjustedDeathRate = region.baselineDeathRate;
    }

    // === 3. CALCULATE NET GROWTH ===
    region.netGrowthRate = region.adjustedBirthRate - region.adjustedDeathRate;
    const monthlyGrowthRate = region.netGrowthRate / 12;

    // === 4. APPLY POPULATION CHANGE ===
    const previousPopulation = region.population;
    const newPopulation = region.population * (1 + monthlyGrowthRate);

    // Guard against NaN
    if (isNaN(newPopulation) || newPopulation < 0) {
      console.warn(`⚠️  Regional population calculation produced ${newPopulation} for ${region.name}, using previous value`);
      region.population = Math.max(0, previousPopulation * 0.99); // Small decline as fallback
    } else {
      region.population = Math.max(0, newPopulation);
    }

    // === 5. CARRYING CAPACITY CONSTRAINT ===
    // Calculate capacity modifier independently (don't rely on global)
    const env = state.environmentalAccumulation;

    // Reuse foodStock and waterStock already calculated above (lines 319-320)
    const climateModifier = isNaN(env.climateStability) ? 0.5 : env.climateStability;
    const foodAvailability = Math.min(1.0, foodStock / 100);
    const waterAvailability = Math.min(1.0, waterStock / 100);
    const resourceModifier = Math.min(foodAvailability, waterAvailability);
    // FIX (Oct 16, 2025): Same biodiversity decoupling as global population
    const biodiversity = isNaN(env.biodiversityIndex) ? 0.35 : env.biodiversityIndex;
    const ecosystemModifier = biodiversity < 0.20 
      ? biodiversity * 2.5 
      : Math.max(0.8, 0.8 + (biodiversity - 0.2) * 0.5);
    const economicStage = isNaN(state.globalMetrics.economicTransitionStage) ? 0 : state.globalMetrics.economicTransitionStage;
    const techModifier = 1.0 +
      (economicStage * 0.2) +
      (state.breakthroughTech.fusionPower?.deploymentLevel || 0) * 1.0 +
      (state.breakthroughTech.sustainableAgriculture?.deploymentLevel || 0) * 0.5;

    const capacityModifier = climateModifier * resourceModifier * ecosystemModifier * techModifier;
    region.carryingCapacity = Math.max(100, region.baselineCarryingCapacity * capacityModifier);
    region.populationPressure = region.population / region.carryingCapacity;

    if (region.population > region.carryingCapacity) {
      const overshoot = region.population - region.carryingCapacity;
      const overshootDeaths = overshoot * 0.05; // 5% of excess dies per month
      region.population -= overshootDeaths;
      region.monthlyExcessDeaths += overshootDeaths;
      // Track overshoot deaths as famine in global categories (convert from millions to billions)
      pop.deathsByCategory.famine += overshootDeaths / 1000;
    }

    // === 6. TRACK CRISIS DEATHS ===
    const naturalDeaths = previousPopulation * (region.baselineDeathRate / 12);
    const actualDeaths = Math.max(0, previousPopulation - region.population);
    region.monthlyExcessDeaths = Math.max(0, actualDeaths - naturalDeaths);
    region.cumulativeCrisisDeaths += region.monthlyExcessDeaths;

    // === 7. UPDATE PEAK ===
    if (region.population > region.peakPopulation) {
      region.peakPopulation = region.population;
    }

    // Aggregate to global
    totalPopulation += region.population;
    totalCrisisDeaths += region.monthlyExcessDeaths;
  }

  // === 8. UPDATE GLOBAL POPULATION ===
  pop.population = totalPopulation / 1000; // Convert millions to billions
  pop.monthlyExcessDeaths = totalCrisisDeaths / 1000; // Convert to billions
}

/**
 * Calculate healthcare-fertility modifier (INVERSE RELATIONSHIP)
 *
 * Low healthcare → MORE children (compensate for high child mortality)
 * High healthcare → FEWER children (family planning, career focus)
 */
function calculateHealthcareFertilityModifier(healthcareQuality: number): number {
  if (healthcareQuality < 0.3) {
    // Poor healthcare (Sub-Saharan Africa): 1.7-2.0x
    return 2.0 - (healthcareQuality / 0.3) * 0.3; // 2.0 → 1.7
  } else if (healthcareQuality < 0.7) {
    // Medium healthcare: 1.0-1.7x
    return 1.7 - ((healthcareQuality - 0.3) / 0.4) * 0.7; // 1.7 → 1.0
  } else {
    // High healthcare (developed nations): 0.4-1.0x
    return 1.0 - ((healthcareQuality - 0.7) / 0.3) * 0.6; // 1.0 → 0.4
  }
}

/**
 * Calculate economic development modifier
 *
 * Advanced economies → fewer children (urbanization, career focus, cost of living)
 */
function calculateDevelopmentModifier(economicStage: number): number {
  if (economicStage >= 2.0) {
    // Stage 2-3: -20% (industrialization, urbanization)
    // Stage 4: -50% (post-industrial, South Korea effect)
    return Math.max(0.3, 1.0 - (economicStage - 2.0) * 0.15);
  }
  return 1.0;
}

/**
 * Log regional population summary
 */
export function logRegionalPopulationSummary(state: GameState): void {
  const pop = state.humanPopulationSystem;

  if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
    return;
  }

  console.log('\n=== REGIONAL POPULATION SUMMARY ===');
  console.log(`Global Total: ${pop.population.toFixed(2)}B`);
  console.log('\nBy Region:');

  for (const region of pop.regionalPopulations) {
    const popBillions = (region.population / 1000).toFixed(2);
    const growthRate = isNaN(region.netGrowthRate) ? 0 : region.netGrowthRate;
    const growth = (growthRate * 100).toFixed(1);
    const fertility = isNaN(region.fertilityRate) ? 0 : region.fertilityRate;
    const fertilityStr = fertility.toFixed(1);

    console.log(`  ${region.name}: ${popBillions}B (${growthRate >= 0 ? '+' : ''}${growth}% growth, ${fertilityStr} fertility)`);
  }

  console.log('===================================\n');
}
