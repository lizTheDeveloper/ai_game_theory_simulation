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
import { getTechDeploymentSafe } from './techTree/helpers';
import {
  initializeRegionalMortalityStabilizers,
  initializeRegionalFamineState,
  initializeRegionalResilienceProfile
} from './mortalityStabilizersInit';
import { assertFinite } from './utils/assertions';

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
      baselinePopulation: 1200,            // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.70,                  // Below global average due to vulnerability

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      // Source: https://en.wikipedia.org/wiki/List_of_countries_by_Human_Development_Index
      qualityOfLife: 0.57,  // Sub-Saharan Africa regional HDI average

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
      baselinePopulation: 1700,            // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.90,                  // Above average (advanced economy, imports)

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      qualityOfLife: 0.81,  // East Asia regional HDI average

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
      baselinePopulation: 2000,            // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.75,                  // Below average (water stress, high population pressure)

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      qualityOfLife: 0.64,  // South Asia regional HDI average

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
      baselinePopulation: 750,             // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.92,                  // High (advanced economy, CAP subsidies, imports)

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      qualityOfLife: 0.89,  // Europe regional HDI average

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
      baselinePopulation: 580,             // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.95,                  // Very high (resource-rich, breadbasket)

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      qualityOfLife: 0.94,  // North America regional HDI average

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
      baselinePopulation: 660,             // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.85,                  // Average (self-sufficient, some distribution issues)

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      qualityOfLife: 0.78,  // Latin America regional HDI average

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
      baselinePopulation: 530,             // 2025 baseline for infrastructure scaling

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

      // Regional food security (Oct 25, 2025 - regionalized)
      foodSecurity: 0.65,                  // Low (import-dependent, water scarcity, conflict)

      // Quality of Life (Oct 26, 2025 - UNDP HDI 2023)
      qualityOfLife: 0.82,  // Middle East & North Africa regional HDI average

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

    // Initialize new fields for mortality stabilizers, famine distribution, resilience (Oct 30, 2025)
    for (const region of pop.regionalPopulations) {
      if (!region.mortalityStabilizers) {
        region.mortalityStabilizers = initializeRegionalMortalityStabilizers(region);
      }
      if (!region.famineState) {
        region.famineState = initializeRegionalFamineState(region);
      }
      if (!region.resilienceProfile) {
        region.resilienceProfile = initializeRegionalResilienceProfile(region);
      }
    }
  }

  let totalPopulation = 0;
  let totalCrisisDeaths = 0;

  for (const region of pop.regionalPopulations) {
    // === 1. CALCULATE BIRTH RATE ===
    // CRITICAL FIX (Nov 26, 2025 - Phase 6): Skip fertility recalculation in historical mode
    // In historical mode, fertility is initialized to historical values and then scaled
    // by historical CBR curves (see lines 393-419 below). We don't want to overwrite
    // the historical initialization with 2025 modifiers.
    if (state.config.scenarioMode !== 'historical') {
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
    }

    // Birth rate from fertility
    region.adjustedBirthRate = region.baselineBirthRate *
      (region.fertilityRate / 2.3); // Scale by fertility vs baseline

    // HISTORICAL BIRTH RATE SCALING (Nov 24-25, 2025)
    // CRITICAL FIX (Nov 25, 2025): Use region-specific CBR curves instead of global average
    // Root cause of 2010-2020 overshoot: Global CBR scaling applied uniformly across regions,
    // but fertility declines varied by 7x (Europe -2.6% vs North America -19.6% in 2010-2020).
    // Using single multiplier overestimated births in East/South Asia (50% of population).
    // Research: UN World Population Prospects 2024, regional TFR → CBR using ratio of 7.5
    //
    // CRITICAL FIX (Nov 26, 2025 - Phase 6): Skip scaling if fertility already initialized historically
    // When _skipHistoricalBirthRateScaling flag is set, fertilityRate is already 1990 values
    // and applying the historical CBR scaling would double-count the higher fertility
    const skipScaling = (state as any)._skipHistoricalBirthRateScaling;
    if (state.config.scenarioMode === 'historical' && !skipScaling) {
      const { getRegionalHistoricalBirthRate, getHistoricalCrudeBirthRate } = require('./engine/phases/BaselineMortalityPhase');
      const actualYear = state.currentYear;

      // Get REGION-SPECIFIC historical CBR (not global average)
      const regionalCBR = getRegionalHistoricalBirthRate(region.name, actualYear);
      const baseline2025CBR = getRegionalHistoricalBirthRate(region.name, 2025);
      const regionalScale = regionalCBR / baseline2025CBR;

      // For comparison/validation: global scale factor
      const globalCBR = getHistoricalCrudeBirthRate(actualYear);
      const globalBaseline = 16.8;
      const globalScale = globalCBR / globalBaseline;

      region.adjustedBirthRate *= regionalScale;

      // DIAGNOSTIC: Log occasionally (once per year) showing regional vs global scaling
      if (state.currentMonth % 12 === 0 && region.name === 'Sub-Saharan Africa') {
        console.log(`  Historical birth rate scaling (${actualYear}):`);
        console.log(`    Regional CBR (${region.name}): ${regionalCBR.toFixed(1)}/1000`);
        console.log(`    Regional baseline (2025): ${baseline2025CBR.toFixed(1)}/1000`);
        console.log(`    Regional scale: ${regionalScale.toFixed(3)}×`);
        console.log(`    Global CBR: ${globalCBR.toFixed(1)}/1000 (scale: ${globalScale.toFixed(3)}×)`);
        console.log(`    Difference: ${((regionalScale - globalScale) / globalScale * 100).toFixed(1)}% ${regionalScale > globalScale ? 'HIGHER' : 'lower'}`);
        console.log(`    Final birth rate: ${region.adjustedBirthRate.toFixed(4)}`);
      }
    }

    // === 2. CALCULATE DEATH RATE ===
    const healthcareReduction = Math.max(0.3, 1 - (region.healthcareQuality * 0.7));

    // Detect NaN in resource reserves - fail loudly
    if (isNaN(state.resourceEconomy.food.reserves)) {
      console.error(`❌ NaN in food.reserves at month ${state.currentMonth}`);
      throw new Error(`NaN in food.reserves - trace source`);
    }
    if (isNaN(state.resourceEconomy.water.reserves)) {
      console.error(`❌ NaN in water.reserves at month ${state.currentMonth}`);
      throw new Error(`NaN in water.reserves - trace source`);
    }

    const foodStock = state.resourceEconomy.food.reserves;
    const waterStock = state.resourceEconomy.water.reserves;
    const foodWaterStress = Math.max(0,
      (1 - foodStock) * 0.3 +
      (1 - waterStock) * 0.3
    );

    // Detect NaN in environmental metrics - fail loudly
    if (isNaN(state.environmentalAccumulation.climateStability)) {
      console.error(`❌ NaN in climateStability at month ${state.currentMonth}`);
      throw new Error(`NaN in climateStability - trace source`);
    }
    if (isNaN(state.environmentalAccumulation.pollutionLevel)) {
      console.error(`❌ NaN in pollutionLevel at month ${state.currentMonth}`);
      throw new Error(`NaN in pollutionLevel - trace source`);
    }

    const climateStability = state.environmentalAccumulation.climateStability;

    // Base climate stress from general climate degradation
    let climateStress = (1 - climateStability) * 0.4 * region.climateVulnerability;

    // Add tipping point impacts (if any active)
    // TippingPointPhase (order 21.6) stores impacts in state for regional variation
    const tippingImpacts = (state as any)._tippingPointImpacts;
    if (tippingImpacts) {
      // Each tipping element has regional multipliers (e.g., AMOC hits Europe 1.4x harder)
      const tippingStress = tippingImpacts.habitability * 0.5 * region.climateVulnerability;
      climateStress += tippingStress;
    }
    const pollutionLevel = state.environmentalAccumulation.pollutionLevel;
    const pollutionStress = pollutionLevel * 0.3;
    const warMultiplier = region.conflictRisk > 0.5 ? 1.5 : 1.0;

    const crisisMultiplier = 1 + foodWaterStress + climateStress + pollutionStress;

    region.adjustedDeathRate = region.baselineDeathRate *
      healthcareReduction *
      crisisMultiplier *
      warMultiplier;

    // CRITICAL FIX (Nov 25, 2025): Regional death rate scaling for historical mode
    // Parallel to birth rate scaling (lines 393-419) - must account for regional CDR variation
    // Root cause: Global CDR misses dramatic regional differences (SSA: 15.6/1000 vs MENA: 8.5/1000 in 1990)
    // Without scaling: Population grows too fast in high-mortality regions → 500M overshoot by 2020
    // Research: /research/regional_cdr_un_wpp_2024_20251125.md
    if (state.config.scenarioMode === 'historical') {
      const { getRegionalHistoricalDeathRate } = require('./engine/phases/BaselineMortalityPhase');
      const actualYear = state.currentYear;

      // Get REGION-SPECIFIC historical CDR (not global average)
      const regionalCDR = getRegionalHistoricalDeathRate(region.name, actualYear);
      const baseline2025CDR = getRegionalHistoricalDeathRate(region.name, 2025);
      const regionalCDRScale = regionalCDR / baseline2025CDR;

      // Apply scaling (higher historical CDR = more deaths)
      region.adjustedDeathRate *= regionalCDRScale;

      // DIAGNOSTIC: Log occasionally (once per year) showing regional CDR scaling
      if (state.currentMonth % 12 === 0 && (region.name === 'Sub-Saharan Africa' || region.name === 'Europe')) {
        console.log(`  🌍 Historical death rate scaling (${actualYear}):`);
        console.log(`    Region: ${region.name}`);
        console.log(`    Regional CDR: ${regionalCDR.toFixed(1)}/1000 (baseline 2025: ${baseline2025CDR.toFixed(1)}/1000)`);
        console.log(`    Regional CDR scale: ${regionalCDRScale.toFixed(3)}×`);
        console.log(`    Final death rate: ${(region.adjustedDeathRate * 100).toFixed(3)}% annual`);
      }
    }

    // Guard against NaN
    if (isNaN(region.adjustedDeathRate)) {
      region.adjustedDeathRate = region.baselineDeathRate;
    }

    // DEBUG (Oct 26, 2025): Track what's causing massive death rates
    // Log ALL regions in first 2 months to establish baseline
    const isBaseline = state.currentMonth <= 1;
    const isHighDeathRate = region.adjustedDeathRate > 0.02; // 2% annual

    if (isBaseline || isHighDeathRate) {
      const monthlyDeathsM = (region.adjustedDeathRate / 12 * region.population).toFixed(1);
      const monthlyDeathRate = (region.adjustedDeathRate / 12 * 100).toFixed(3);

      console.warn(`\n${isHighDeathRate ? '⚠️  HIGH DEATH RATE' : '📊 BASELINE'}: ${region.name} (Month ${state.currentMonth})`);
      console.log(`   Adjusted death rate: ${(region.adjustedDeathRate * 100).toFixed(2)}% annual (${monthlyDeathRate}% monthly)`);
      console.log(`   Baseline death rate: ${(region.baselineDeathRate * 100).toFixed(2)}%`);
      console.log(`   Healthcare reduction: ${healthcareReduction.toFixed(2)}x`);
      console.log(`   Crisis multiplier: ${crisisMultiplier.toFixed(2)}x`);
      console.log(`     Food/water stress: ${foodWaterStress.toFixed(3)}`);
      console.log(`     Climate stress: ${climateStress.toFixed(3)}`);
      console.log(`     Pollution stress: ${pollutionStress.toFixed(3)}`);
      console.log(`   War multiplier: ${warMultiplier.toFixed(2)}x`);
      console.log(`   Monthly deaths: ${monthlyDeathsM}M (population: ${region.population.toFixed(0)}M)`);
    }

    // === 3. CALCULATE NET GROWTH ===
    // FIX (Oct 28, 2025): Only apply BIRTHS here - BayesianMortalityResolutionPhase handles deaths
    // Architecture: updateRegionalPopulations adds births → BayesianMortalityResolutionPhase subtracts deaths → HumanPopulationPhase aggregates
    region.netGrowthRate = region.adjustedBirthRate; // Only births, no death subtraction
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

    // FIX (Oct 25, 2025): Regional food security is PERSISTENT STATE
    // Initialized to realistic regional values (65-95%)
    // Modified by FoodSecurityDegradationPhase (crisis degradation)
    // Modified by tech deployment (vertical farming, etc.)
    // NOT recalculated from global food stock (preserves regional variation)

    // Reuse waterStock already calculated above (now validated)
    // Detect NaN in environmental metrics - fail loudly
    if (isNaN(env.climateStability)) {
      console.error(`❌ NaN in env.climateStability at month ${state.currentMonth}`);
      throw new Error(`NaN in env.climateStability - trace source`);
    }
    if (isNaN(env.biodiversityIndex)) {
      console.error(`❌ NaN in env.biodiversityIndex at month ${state.currentMonth}`);
      throw new Error(`NaN in env.biodiversityIndex - trace source`);
    }
    if (isNaN(state.globalMetrics.economicTransitionStage)) {
      console.error(`❌ NaN in economicTransitionStage at month ${state.currentMonth}`);
      throw new Error(`NaN in economicTransitionStage - trace source`);
    }

    const climateModifier = env.climateStability;
    const foodAvailability = region.foodSecurity; // Use REGIONAL food security, not global foodStock
    const waterAvailability = Math.min(1.0, waterStock / 100);
    const resourceModifier = Math.min(foodAvailability, waterAvailability);
    // FIX (Oct 16, 2025): Same biodiversity decoupling as global population
    const biodiversity = env.biodiversityIndex;
    const ecosystemModifier = biodiversity < 0.20
      ? biodiversity * 2.5
      : Math.max(0.8, 0.8 + (biodiversity - 0.2) * 0.5);
    const economicStage = state.globalMetrics.economicTransitionStage;
    const techModifier = 1.0 +
      (economicStage * 0.2) +
      (getTechDeploymentSafe(state, 'fusionPower')) * 1.0 +
      (getTechDeploymentSafe(state, 'sustainableAgriculture')) * 0.5;

    const capacityModifier = climateModifier * resourceModifier * ecosystemModifier * techModifier;
    region.carryingCapacity = Math.max(100, region.baselineCarryingCapacity * capacityModifier);

    // Population pressure calculation (protected with assertFinite)
    // carryingCapacity is always >= 100 from Math.max above, so division is safe
    // but we validate the result to catch NaN propagation from inputs
    region.populationPressure = assertFinite(
      region.population / region.carryingCapacity,
      {
        location: 'updateRegionalPopulation',
        valueName: 'populationPressure',
        month: state.currentMonth,
        additionalInfo: {
          region: region.name,
          population: region.population,
          carryingCapacity: region.carryingCapacity
        }
      }
    );

    // FIX (Oct 26, 2025): REMOVED instant 5% per month overshoot death mechanic
    //
    // OLD BEHAVIOR (lines 486-534, removed):
    // - if (population > carryingCapacity) → kill 5% of overshoot per month
    // - Result: 87% population loss in 5 years (8B → 1B) - PHYSICALLY IMPOSSIBLE
    // - No research backing for 5% per month mortality rate
    //
    // ACTUAL HISTORICAL FAMINE MORTALITY:
    // - Great Irish Famine: 0.15% per month
    // - Bengal Famine: 0.4% per month
    // - Ethiopian Famine: 0.1% per month
    // - Simulation rate: 10-50× too high
    //
    // NEW BEHAVIOR:
    // - Famine system (FamineSystemPhase) handles food-related mortality with research backing
    // - Carrying capacity still tracked for pressure metric
    // - No instant death from capacity overshoot
    //
    // Research: research/seasonal_famine_mortality_20251026.md

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
  // FIX (Nov 9, 2025): Convert millions → billions for global population
  // Regional populations are in millions, global population is in billions
  pop.population = assertFinite(totalPopulation / 1000, {
    location: 'updateRegionalPopulations',
    valueName: 'pop.population (global)',
    month: state.currentMonth,
    additionalInfo: {
      totalPopulationMillions: totalPopulation,
      totalPopulationBillions: totalPopulation / 1000,
      regionCount: pop.regionalPopulations.length
    }
  });

  // Monthly excess deaths remain in millions for aggregation
  pop.monthlyExcessDeaths = assertFinite(totalCrisisDeaths, {
    location: 'updateRegionalPopulations',
    valueName: 'pop.monthlyExcessDeaths',
    month: state.currentMonth,
    additionalInfo: { totalCrisisDeaths }
  });
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

    // Detect NaN in regional metrics - fail loudly (even in logging)
    if (isNaN(region.netGrowthRate)) {
      console.error(`❌ NaN in netGrowthRate for ${region.name} at month ${state.currentMonth}`);
      throw new Error(`NaN in netGrowthRate for ${region.name} - trace source`);
    }
    if (isNaN(region.fertilityRate)) {
      console.error(`❌ NaN in fertilityRate for ${region.name} at month ${state.currentMonth}`);
      throw new Error(`NaN in fertilityRate for ${region.name} - trace source`);
    }

    const growthRate = region.netGrowthRate;
    const growth = (growthRate * 100).toFixed(1);
    const fertility = region.fertilityRate;
    const fertilityStr = fertility.toFixed(1);

    console.log(`  ${region.name}: ${popBillions}B (${growthRate >= 0 ? '+' : ''}${growth}% growth, ${fertilityStr} fertility)`);
  }

  console.log('===================================\n');
}
