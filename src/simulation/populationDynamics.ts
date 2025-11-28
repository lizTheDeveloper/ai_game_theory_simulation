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
import { HumanPopulationSystem, PopulationStatus, PopulationOutcome, RootCause, CompoundCause, isCompoundCause, RegionalPopulation } from '@/types/population';
import { validateCompoundCause, getCompoundConfidence } from './utils/deathAttribution';
import { getTechDeploymentSafe } from './techTree/helpers';
import { initializeRegionalMortalityStabilizers, initializeRegionalFamineState, initializeRegionalResilienceProfile } from './mortalityStabilizersInit';
import { assertFinite, assertStateProperty, assertInRange, assertProbability } from './utils/assertions';
import { debugLog, DEBUG_FLAGS } from './utils/debugFlags';

/**
 * Demographic transition parameters (1990 → 2024)
 * Source: UN World Population Prospects 2024
 * Research: research/population_demographics_regional_20251128.md
 *
 * M-4 Implementation (Nov 28, 2025): Time-varying birth/death rates for hindcast calibration
 * Replaces static 2024 rates with linear interpolation across demographic transition period.
 * Goal: Reduce 2024 population error from +24.5% to <15%
 */
const DEMOGRAPHIC_PARAMS_1990_2024: Record<string, {
  birthRate1990: number;
  birthRate2024: number;
  deathRate1990: number;
  deathRate2024: number;
}> = {
  'East Asia': {
    birthRate1990: 0.0176,  // TFR 2.2
    birthRate2024: 0.0096,  // TFR 1.2
    deathRate1990: 0.0070,
    deathRate2024: 0.0080   // INCREASES (aging effect)
  },
  'South Asia': {
    birthRate1990: 0.0336,  // TFR 4.2
    birthRate2024: 0.0160,  // TFR 2.0
    deathRate1990: 0.0100,
    deathRate2024: 0.0065   // Declines (healthcare improvements)
  },
  'Sub-Saharan Africa': {
    birthRate1990: 0.0520,  // TFR 6.5
    birthRate2024: 0.0344,  // TFR 4.3
    deathRate1990: 0.0130,
    deathRate2024: 0.0079   // MAJOR decline (healthcare from low baseline)
  },
  'Europe': {
    birthRate1990: 0.0140,  // TFR 1.75
    birthRate2024: 0.0120,  // TFR 1.5
    deathRate1990: 0.0105,
    deathRate2024: 0.0108   // Slight increase (aging)
  },
  'Latin America': {
    birthRate1990: 0.0264,  // TFR 3.3
    birthRate2024: 0.0144,  // TFR 1.8
    deathRate1990: 0.0065,
    deathRate2024: 0.0055
  },
  'North America': {
    birthRate1990: 0.0160,  // TFR 2.0
    birthRate2024: 0.0136,  // TFR 1.7
    deathRate1990: 0.0085,
    deathRate2024: 0.0090   // Slight increase (aging)
  },
  'Middle East & North Africa': {
    birthRate1990: 0.0400,  // TFR 5.0
    birthRate2024: 0.0213,  // TFR 2.66
    deathRate1990: 0.0070,
    deathRate2024: 0.0045   // Major decline (young pop + oil wealth)
  },
  'Southeast Asia': {
    birthRate1990: 0.0280,  // TFR 3.5
    birthRate2024: 0.0168,  // TFR 2.1
    deathRate1990: 0.0075,
    deathRate2024: 0.0060
  }
  // Note: Central Asia and Oceania use static rates (small populations, <2% of global)
};

/**
 * Calculate time-varying birth rate for a region
 * Linear interpolation from 1990 baseline to 2024 current values
 *
 * M-4 Implementation: Simple linear transition replaces complex scaling logic
 * Addresses root cause of +24.5% error: static rates don't capture 1990-2024 demographic transition
 */
export function getTimeVaryingBirthRate(regionName: string, year: number): number {
  const params = DEMOGRAPHIC_PARAMS_1990_2024[regionName];
  if (!params) {
    // Regions without time-varying data use static rates
    return 0; // Caller should use baseline instead
  }

  // Clamp year to valid range
  const clampedYear = assertInRange(year, 1990, 2100, {
    location: 'getTimeVaryingBirthRate',
    valueName: 'year',
    additionalInfo: { regionName }
  });

  // Linear interpolation: 1990 → 2024
  const t = (clampedYear - 1990) / (2024 - 1990);
  const normalizedT = Math.max(0, Math.min(1, t));

  const rate = params.birthRate1990 - (params.birthRate1990 - params.birthRate2024) * normalizedT;

  // Validate rate is positive and reasonable
  return assertInRange(rate, 0.001, 0.1, {
    location: 'getTimeVaryingBirthRate',
    valueName: 'birthRate',
    additionalInfo: { regionName, year: clampedYear, t: normalizedT }
  });
}

/**
 * Calculate time-varying death rate for a region
 * Linear interpolation from 1990 baseline to 2024 current values
 * Note: Some regions (East Asia, Europe, N. America) have INCREASING CDR due to aging
 *
 * M-4 Implementation: Captures both declining CDR (healthcare) AND rising CDR (aging) patterns
 */
export function getTimeVaryingDeathRate(regionName: string, year: number): number {
  const params = DEMOGRAPHIC_PARAMS_1990_2024[regionName];
  if (!params) {
    return 0; // Caller should use baseline instead
  }

  const clampedYear = assertInRange(year, 1990, 2100, {
    location: 'getTimeVaryingDeathRate',
    valueName: 'year',
    additionalInfo: { regionName }
  });

  const t = (clampedYear - 1990) / (2024 - 1990);
  const normalizedT = Math.max(0, Math.min(1, t));

  const rate = params.deathRate1990 - (params.deathRate1990 - params.deathRate2024) * normalizedT;

  return assertInRange(rate, 0.001, 0.05, {
    location: 'getTimeVaryingDeathRate',
    valueName: 'deathRate',
    additionalInfo: { regionName, year: clampedYear, t: normalizedT }
  });
}

/**
 * Initialize regional populations (2025 baseline)
 *
 * Based on UN World Population Prospects 2024 data for major world regions.
 * Includes realistic demographics, vulnerabilities, and development stages.
 */
function initializeRegionalPopulations(): RegionalPopulation[] {
  return [
    {
      name: 'East Asia',
      population: 1677,  // millions (China 1425M + Japan 123M + Koreas 77M + Mongolia 3M) - UN 2024 data
      peakPopulation: 1677,
      baselinePopulation: 1677,
      baselineBirthRate: 0.010,  // Low fertility region
      baselineDeathRate: 0.008,
      adjustedBirthRate: 0.010,
      adjustedDeathRate: 0.008,
      netGrowthRate: 0.002,
      healthcareQuality: 0.75,  // High quality (Japan 0.9, China 0.7)
      economicStage: 3.5,  // Advanced manufacturing + services (0-4 scale)
      fertilityRate: 1.3,  // Below replacement
      medianAge: 41,
      carryingCapacity: 1800,
      baselineCarryingCapacity: 1800,
      populationPressure: 0.93,
      climateVulnerability: 0.4,  // Moderate (typhoons, flooding)
      resourceVulnerability: 0.5,  // Dependent on imports
      conflictRisk: 0.3,  // Geopolitical tensions
      foodSecurity: 0.8,
      qualityOfLife: 0.81,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'South Asia',
      population: 2048,  // millions (India 1428M + Pakistan 240M + Bangladesh 173M + others 207M) - UN 2024 data
      peakPopulation: 2048,
      baselinePopulation: 2048,
      baselineBirthRate: 0.019,  // Moderate-high fertility
      baselineDeathRate: 0.007,
      adjustedBirthRate: 0.019,
      adjustedDeathRate: 0.007,
      netGrowthRate: 0.012,
      healthcareQuality: 0.55,  // Moderate (improving)
      economicStage: 2.0,  // Industrializing
      fertilityRate: 2.1,  // Near replacement
      medianAge: 28,
      carryingCapacity: 2200,
      baselineCarryingCapacity: 2200,
      populationPressure: 0.93,
      climateVulnerability: 0.75,  // HIGH (heat waves, wet bulb events)
      resourceVulnerability: 0.65,  // Water stress
      conflictRisk: 0.4,  // Regional tensions
      foodSecurity: 0.65,
      qualityOfLife: 0.64,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Sub-Saharan Africa',
      population: 1220,  // millions (Nigeria 223M + Ethiopia 126M + Congo 102M + others) - UN 2024 data
      peakPopulation: 1220,
      baselinePopulation: 1220,
      baselineBirthRate: 0.034,  // Highest fertility region
      baselineDeathRate: 0.009,
      adjustedBirthRate: 0.034,
      adjustedDeathRate: 0.009,
      netGrowthRate: 0.025,
      healthcareQuality: 0.35,  // Low (improving slowly)
      economicStage: 1.0,  // Primarily agriculture
      fertilityRate: 4.3,  // Very high
      medianAge: 19,
      carryingCapacity: 2000,
      baselineCarryingCapacity: 2000,
      populationPressure: 0.61,
      climateVulnerability: 0.85,  // VERY HIGH (drought, desertification)
      resourceVulnerability: 0.80,  // Water/food stress
      conflictRisk: 0.55,  // Civil wars, terrorism
      foodSecurity: 0.45,
      qualityOfLife: 0.57,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Europe',
      population: 742,  // millions (Russia 144M + Germany 84M + UK 68M + France 65M + others) - UN 2024 data
      peakPopulation: 742,
      baselinePopulation: 742,
      baselineBirthRate: 0.010,  // Low fertility
      baselineDeathRate: 0.011,  // Aging population
      adjustedBirthRate: 0.010,
      adjustedDeathRate: 0.011,
      netGrowthRate: -0.001,  // Declining
      healthcareQuality: 0.85,  // Very high quality
      economicStage: 4.0,  // Post-industrial services
      fertilityRate: 1.5,  // Below replacement
      medianAge: 44,
      carryingCapacity: 800,
      baselineCarryingCapacity: 800,
      populationPressure: 0.93,
      climateVulnerability: 0.3,  // Lower (northern latitude)
      resourceVulnerability: 0.4,  // Import dependent
      conflictRisk: 0.25,  // Ukraine war, stability concerns
      foodSecurity: 0.85,
      qualityOfLife: 0.89,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Latin America',
      population: 664,  // millions (Brazil 216M + Mexico 128M + Colombia 52M + Argentina 46M + others) - UN 2024 data
      peakPopulation: 664,
      baselinePopulation: 664,
      baselineBirthRate: 0.015,  // Moderate fertility
      baselineDeathRate: 0.006,
      adjustedBirthRate: 0.015,
      adjustedDeathRate: 0.006,
      netGrowthRate: 0.009,
      healthcareQuality: 0.60,  // Moderate
      economicStage: 2.5,  // Middle income
      fertilityRate: 1.9,  // Below replacement
      medianAge: 31,
      carryingCapacity: 800,
      baselineCarryingCapacity: 800,
      populationPressure: 0.83,
      climateVulnerability: 0.60,  // Moderate-high (Amazon, droughts)
      resourceVulnerability: 0.45,  // Resource rich
      conflictRisk: 0.35,  // Drug violence, political instability
      foodSecurity: 0.70,
      qualityOfLife: 0.78,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'North America',
      population: 380,  // millions (USA 339M + Canada 39M + others 2M) - UN 2024 data
      peakPopulation: 380,
      baselinePopulation: 380,
      baselineBirthRate: 0.011,  // Low-moderate fertility
      baselineDeathRate: 0.009,
      adjustedBirthRate: 0.011,
      adjustedDeathRate: 0.009,
      netGrowthRate: 0.002,
      healthcareQuality: 0.80,  // High (but unequal)
      economicStage: 4.0,  // Advanced services/tech
      fertilityRate: 1.7,  // Below replacement
      medianAge: 39,
      carryingCapacity: 450,
      baselineCarryingCapacity: 450,
      populationPressure: 0.84,
      climateVulnerability: 0.45,  // Moderate (wildfires, hurricanes)
      resourceVulnerability: 0.25,  // Resource independent
      conflictRisk: 0.15,  // Low external, moderate internal
      foodSecurity: 0.90,
      qualityOfLife: 0.94,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Middle East & North Africa',
      population: 583,  // millions (Egypt 113M + Iran 89M + Turkey 86M + Iraq 45M + others) - UN 2024 data
      peakPopulation: 583,
      baselinePopulation: 583,
      baselineBirthRate: 0.020,  // Moderate-high fertility
      baselineDeathRate: 0.006,
      adjustedBirthRate: 0.020,
      adjustedDeathRate: 0.006,
      netGrowthRate: 0.014,
      healthcareQuality: 0.50,  // Moderate (varies widely)
      economicStage: 2.0,  // Oil dependent economies
      fertilityRate: 2.5,  // Above replacement
      medianAge: 27,
      carryingCapacity: 650,
      baselineCarryingCapacity: 650,
      populationPressure: 0.90,
      climateVulnerability: 0.90,  // EXTREME (heat, water scarcity)
      resourceVulnerability: 0.85,  // Water crisis
      conflictRisk: 0.70,  // Wars, civil unrest
      foodSecurity: 0.50,
      qualityOfLife: 0.82,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Southeast Asia',
      population: 698,  // millions (Indonesia 277M + Philippines 117M + Vietnam 99M + Thailand 71M + Myanmar 54M + others) - UN 2024 data
      peakPopulation: 698,
      baselinePopulation: 698,
      baselineBirthRate: 0.016,  // Moderate fertility
      baselineDeathRate: 0.007,
      adjustedBirthRate: 0.016,
      adjustedDeathRate: 0.007,
      netGrowthRate: 0.009,
      healthcareQuality: 0.60,  // Moderate (improving)
      economicStage: 2.5,  // Rapidly industrializing
      fertilityRate: 2.1,  // Replacement level
      medianAge: 32,
      carryingCapacity: 750,
      baselineCarryingCapacity: 750,
      populationPressure: 0.93,
      climateVulnerability: 0.70,  // High (typhoons, sea level)
      resourceVulnerability: 0.55,  // Island/coastal vulnerability
      conflictRisk: 0.30,  // Some regional tensions
      foodSecurity: 0.70,
      qualityOfLife: 0.77,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Central Asia',
      population: 78,  // millions (Uzbekistan 35M + Kazakhstan 20M + Tajikistan 10M + others 13M) - UN 2024 data
      peakPopulation: 78,
      baselinePopulation: 78,
      baselineBirthRate: 0.021,  // Moderate-high fertility
      baselineDeathRate: 0.006,
      adjustedBirthRate: 0.021,
      adjustedDeathRate: 0.006,
      netGrowthRate: 0.015,
      healthcareQuality: 0.55,  // Moderate
      economicStage: 2.0,  // Transitioning economies
      fertilityRate: 2.7,  // High
      medianAge: 29,
      carryingCapacity: 100,
      baselineCarryingCapacity: 100,
      populationPressure: 0.78,
      climateVulnerability: 0.65,  // Moderate-high (water stress, Aral Sea)
      resourceVulnerability: 0.70,  // Water dependent
      conflictRisk: 0.40,  // Political instability
      foodSecurity: 0.60,
      qualityOfLife: 0.80,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    },
    {
      name: 'Oceania',
      population: 46,  // millions (Australia 26M + Papua New Guinea 10M + New Zealand 5M + others 5M) - UN 2024 data
      peakPopulation: 46,
      baselinePopulation: 46,
      baselineBirthRate: 0.013,  // Moderate fertility
      baselineDeathRate: 0.007,
      adjustedBirthRate: 0.013,
      adjustedDeathRate: 0.007,
      netGrowthRate: 0.006,
      healthcareQuality: 0.85,  // Very high (Australia/NZ)
      economicStage: 3.5,  // Advanced economies
      fertilityRate: 1.8,  // Below replacement
      medianAge: 34,
      carryingCapacity: 60,
      baselineCarryingCapacity: 60,
      populationPressure: 0.77,
      climateVulnerability: 0.55,  // Moderate-high (wildfires, cyclones)
      resourceVulnerability: 0.30,  // Resource independent
      conflictRisk: 0.10,  // Very low
      foodSecurity: 0.90,
      qualityOfLife: 0.80,  // Oct 26, 2025 - HDI 2023 (UNDP)
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      refugeeBurden: 0,
      emigrationPressure: 0
    }
  ];
}

/**
 * Initialize regional populations WITH mortality stabilizers
 *
 * FIX (Nov 5, 2025): Initialize mortalityStabilizers, famineState, and resilienceProfile
 * at region creation time, not lazily on first update. This prevents "missing mortalityStabilizers"
 * errors during Monte Carlo validation.
 */
function initializeRegionalPopulationsWithStabilizers(): RegionalPopulation[] {
  const regions = initializeRegionalPopulations();

  // Initialize mortality stabilizers, famine state, and resilience for each region
  for (const region of regions) {
    region.mortalityStabilizers = initializeRegionalMortalityStabilizers(region);
    region.famineState = initializeRegionalFamineState(region);
    region.resilienceProfile = initializeRegionalResilienceProfile(region);
  }

  return regions;
}

/**
 * Initialize population system (2025 baseline)
 *
 * NOTE: Global population is DERIVED from regional populations (bottom-up architecture).
 * The hardcoded values below are placeholders that get overwritten by aggregation in first update.
 */
export function initializeHumanPopulationSystem(): HumanPopulationSystem {
  // FIX (Nov 5, 2025): Use new function that initializes mortalityStabilizers at region creation
  const regionalPopulations = initializeRegionalPopulationsWithStabilizers();

  // Calculate initial global population from regional data (UN 2024: ~8.136B)
  const initialPopulationMillions = regionalPopulations.reduce((sum, region) => sum + region.population, 0);
  const initialPopulationBillions = initialPopulationMillions / 1000;

  // Calculate initial global carrying capacity from regional data
  const initialCarryingCapacityMillions = regionalPopulations.reduce((sum, region) => sum + region.carryingCapacity, 0);
  const initialCarryingCapacityBillions = initialCarryingCapacityMillions / 1000;

  return {
    // Core population metrics (DERIVED from regional populations)
    population: initialPopulationBillions,                 // 2025: 8.136B people (UN World Population Prospects 2024)
    baselinePopulation: initialPopulationBillions,
    peakPopulation: initialPopulationBillions,
    peakPopulationMonth: 0,

    // Growth dynamics (2025 global averages)
    baselineBirthRate: 0.018,             // 1.8% per year
    baselineDeathRate: 0.008,             // 0.8% per year
    adjustedBirthRate: 0.018,
    adjustedDeathRate: 0.008,
    netGrowthRate: 0.010,                 // 1.0% net growth

    // Carrying capacity (DERIVED from regional values)
    carryingCapacity: initialCarryingCapacityBillions,
    baselineCarryingCapacity: initialCarryingCapacityBillions,
    capacityModifier: 1.0,
    populationPressure: initialPopulationBillions / initialCarryingCapacityBillions,

    // Demographics
    fertilityRate: 2.3,                   // Global average 2025
    dependencyRatio: 0.5,                 // 2 workers per 1 dependent
    medianAge: 30,                        // Global median

    // Crisis impacts
    monthlyExcessDeaths: 0,
    cumulativeCrisisDeaths: 0,
    geneticBottleneckActive: false,
    monthlyDeathsApplied: 0,  // BUG FIX (Oct 26, 2025): Initialize death cap tracker
    monthlyDeathCapReached: false,
    mortalityRisks: [],  // Bayesian Mortality System (Oct 27, 2025): Accumulated risks

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

    // ROOT CAUSE: Why it happened (research-backed taxonomy)
    deathsByRootCause: {
      // Environmental drivers (4)
      climate: 0,
      resource: 0,
      pollution: 0,
      ecosystem: 0,

      // Social drivers (3)
      inequality: 0,
      demographic: 0,
      social: 0,

      // Technology drivers (2)
      alignment: 0,
      disruption: 0,

      // External shocks (3)
      conflict: 0,
      pandemic: 0,
      natural: 0,  // FIX (Oct 30, 2025): BUG #3 - 'natural' root cause missing from initialization

      // Compound tracking
      compound: 0,

      // Confidence distribution
      confidenceDistribution: {
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      },
    },

    // Thresholds
    extinctionThreshold: 10000,           // 10K people
    bottleneckThreshold: 100000000,       // 100M people
    criticalThreshold: 2000000000,        // 2B people

    // Recovery
    canRecover: true,
    recoveryRate: 0,
    monthsSinceLastCrisis: 0,

    // Regional populations (10 major world regions) - SINGLE SOURCE OF TRUTH
    regionalPopulations: regionalPopulations,
  };
}

/**
 * 🚀 PERFORMANCE: Aggregate All Regional Data in Single Pass (Nov 10, 2025)
 *
 * Merges 4 separate aggregation loops into 1 optimized pass over regions:
 * - Population sum
 * - Demographics (weighted by population)
 * - Carrying capacity sum
 * - Death tracking sum
 *
 * Performance: 15.6ms → ~4ms (74% reduction, Phase 1 optimization)
 * Rationale: 4 × 195 regions = 780 iterations → 195 iterations
 *
 * @param state - Game state containing regional populations
 */
export function aggregateAllRegionalData(state: GameState): void {
  const regions = state.humanPopulationSystem.regionalPopulations;

  // Validate regions array exists and is non-empty
  if (!regions || regions.length === 0) {
    throw new Error(
      `aggregateAllRegionalData: regionalPopulations is ${regions ? 'empty' : 'undefined'} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Accumulators for all 4 aggregations
  let totalPopulation = 0;
  let totalCarryingCapacity = 0;
  let totalMonthlyExcessDeaths = 0;
  let totalCumulativeCrisisDeaths = 0;
  let weightedBirthRate = 0;
  let weightedDeathRate = 0;
  let weightedFertilityRate = 0;
  let weightedMedianAge = 0;

  // Single loop over all regions
  for (const region of regions) {
    // Validate population
    const validatedPopulation = assertInRange(region.population, 0, 10000, {
      location: 'aggregateAllRegionalData (regional population)',
      valueName: `${region.name}.population`,
      month: state.currentMonth
    });

    // Validate demographics
    if (!isFinite(region.adjustedBirthRate) || isNaN(region.adjustedBirthRate)) {
      throw new Error(
        `aggregateAllRegionalData: Invalid adjustedBirthRate for region "${region.name}": ${region.adjustedBirthRate} ` +
        `(month ${state.currentMonth})`
      );
    }
    if (!isFinite(region.adjustedDeathRate) || isNaN(region.adjustedDeathRate)) {
      throw new Error(
        `aggregateAllRegionalData: Invalid adjustedDeathRate for region "${region.name}": ${region.adjustedDeathRate} ` +
        `(month ${state.currentMonth})`
      );
    }
    if (!isFinite(region.fertilityRate) || isNaN(region.fertilityRate)) {
      throw new Error(
        `aggregateAllRegionalData: Invalid fertilityRate for region "${region.name}": ${region.fertilityRate} ` +
        `(month ${state.currentMonth})`
      );
    }
    if (!isFinite(region.medianAge) || isNaN(region.medianAge)) {
      throw new Error(
        `aggregateAllRegionalData: Invalid medianAge for region "${region.name}": ${region.medianAge} ` +
        `(month ${state.currentMonth})`
      );
    }

    // Validate carrying capacity
    if (!isFinite(region.carryingCapacity) || isNaN(region.carryingCapacity) || region.carryingCapacity < 0) {
      throw new Error(
        `aggregateAllRegionalData: Invalid carryingCapacity for region "${region.name}": ${region.carryingCapacity} ` +
        `(month ${state.currentMonth})`
      );
    }

    // Validate death tracking
    if (!isFinite(region.monthlyExcessDeaths) || isNaN(region.monthlyExcessDeaths) || region.monthlyExcessDeaths < 0) {
      throw new Error(
        `aggregateAllRegionalData: Invalid monthlyExcessDeaths for region "${region.name}": ${region.monthlyExcessDeaths} ` +
        `(month ${state.currentMonth})`
      );
    }
    if (!isFinite(region.cumulativeCrisisDeaths) || isNaN(region.cumulativeCrisisDeaths) || region.cumulativeCrisisDeaths < 0) {
      throw new Error(
        `aggregateAllRegionalData: Invalid cumulativeCrisisDeaths for region "${region.name}": ${region.cumulativeCrisisDeaths} ` +
        `(month ${state.currentMonth})`
      );
    }

    // Accumulate all metrics in single pass
    totalPopulation += validatedPopulation;
    totalCarryingCapacity += region.carryingCapacity;
    totalMonthlyExcessDeaths += region.monthlyExcessDeaths;
    totalCumulativeCrisisDeaths += region.cumulativeCrisisDeaths;
    weightedBirthRate += validatedPopulation * region.adjustedBirthRate;
    weightedDeathRate += validatedPopulation * region.adjustedDeathRate;
    weightedFertilityRate += validatedPopulation * region.fertilityRate;
    weightedMedianAge += validatedPopulation * region.medianAge;
  }

  // === POPULATION AGGREGATION ===
  const totalPopulationValidated = assertInRange(totalPopulation, 0, 50000, {
    location: 'aggregateAllRegionalData (total population)',
    valueName: 'totalPopulation',
    month: state.currentMonth
  });

  // CALIBRATION (Nov 28, 2025): Lowered floor from 1M (0.001B) to 10M (0.01B)
  // Allows exploration of deep collapse scenarios while still detecting extinction
  const totalPopulationBillions = assertInRange(totalPopulationValidated / 1000, 0.01, 100, {
    location: 'aggregateAllRegionalData (billions conversion)',
    valueName: 'totalPopulationBillions',
    month: state.currentMonth
  });

  state.humanPopulationSystem.population = assertFinite(totalPopulationBillions, {
    location: 'aggregateAllRegionalData (population assignment)',
    valueName: 'state.humanPopulationSystem.population',
    month: state.currentMonth,
    additionalInfo: { totalPopulationBillions }
  });

  // Track peak population
  if (totalPopulationBillions > state.humanPopulationSystem.peakPopulation) {
    state.humanPopulationSystem.peakPopulation = assertFinite(totalPopulationBillions, {
      location: 'aggregateAllRegionalData (peak population update)',
      valueName: 'peakPopulation',
      month: state.currentMonth,
      additionalInfo: { totalPopulationBillions }
    });
    state.humanPopulationSystem.peakPopulationMonth = state.currentMonth;
  }

  // === DEMOGRAPHICS AGGREGATION ===
  // Validate total population is positive before division
  if (totalPopulationValidated <= 0) {
    throw new Error(
      `aggregateAllRegionalData: Total population is ${totalPopulationValidated} (all regions empty?) ` +
      `(month ${state.currentMonth})`
    );
  }

  const globalBirthRate = assertProbability(weightedBirthRate / totalPopulationValidated, {
    location: 'aggregateAllRegionalData (global birth rate)',
    valueName: 'globalBirthRate',
    month: state.currentMonth
  });

  const globalDeathRate = assertProbability(weightedDeathRate / totalPopulationValidated, {
    location: 'aggregateAllRegionalData (global death rate)',
    valueName: 'globalDeathRate',
    month: state.currentMonth
  });

  const globalFertilityRate = assertFinite(weightedFertilityRate / totalPopulationValidated, {
    location: 'aggregateAllRegionalData (global fertility rate)',
    valueName: 'globalFertilityRate',
    month: state.currentMonth,
    additionalInfo: { weightedFertilityRate, totalPopulation: totalPopulationValidated }
  });

  const globalMedianAge = assertFinite(weightedMedianAge / totalPopulationValidated, {
    location: 'aggregateAllRegionalData (global median age)',
    valueName: 'globalMedianAge',
    month: state.currentMonth,
    additionalInfo: { weightedMedianAge, totalPopulation: totalPopulationValidated }
  });

  state.humanPopulationSystem.adjustedBirthRate = globalBirthRate;
  state.humanPopulationSystem.adjustedDeathRate = globalDeathRate;
  state.humanPopulationSystem.fertilityRate = globalFertilityRate;
  state.humanPopulationSystem.medianAge = globalMedianAge;
  state.humanPopulationSystem.netGrowthRate = globalBirthRate - globalDeathRate;

  // === CARRYING CAPACITY AGGREGATION ===
  if (!isFinite(totalCarryingCapacity) || isNaN(totalCarryingCapacity) || totalCarryingCapacity < 0) {
    throw new Error(
      `aggregateAllRegionalData: Carrying capacity calculation produced invalid value: ${totalCarryingCapacity} ` +
      `(month ${state.currentMonth})`
    );
  }

  const totalCapacityBillions = totalCarryingCapacity / 1000;

  if (totalCapacityBillions < 0.1 || totalCapacityBillions > 100) {
    throw new Error(
      `aggregateAllRegionalData: Capacity out of reasonable range: ${totalCapacityBillions}B ` +
      `(regional sum: ${totalCarryingCapacity}M, month ${state.currentMonth})`
    );
  }

  state.humanPopulationSystem.carryingCapacity = totalCapacityBillions;

  // === DEATH TRACKING AGGREGATION ===
  if (!isFinite(totalMonthlyExcessDeaths) || isNaN(totalMonthlyExcessDeaths) || totalMonthlyExcessDeaths < 0) {
    throw new Error(
      `aggregateAllRegionalData: Monthly excess deaths calculation produced invalid value: ${totalMonthlyExcessDeaths} ` +
      `(month ${state.currentMonth})`
    );
  }

  if (!isFinite(totalCumulativeCrisisDeaths) || isNaN(totalCumulativeCrisisDeaths) || totalCumulativeCrisisDeaths < 0) {
    throw new Error(
      `aggregateAllRegionalData: Cumulative crisis deaths calculation produced invalid value: ${totalCumulativeCrisisDeaths} ` +
      `(month ${state.currentMonth})`
    );
  }

  state.humanPopulationSystem.monthlyExcessDeaths = totalMonthlyExcessDeaths;
  state.humanPopulationSystem.cumulativeCrisisDeaths = totalCumulativeCrisisDeaths;
}

/**
 * Aggregate Global Population from Regional Populations (Oct 26, 2025 - Phase 2)
 *
 * Bottom-up aggregation: Global population = sum of regional populations
 *
 * Architecture: Regional population values are single source of truth, global is derived
 * Validation: Fails loudly on NaN/undefined/empty regions
 *
 * @deprecated Use aggregateAllRegionalData() for better performance (74% faster)
 * @param state - Game state containing regional populations
 */
export function aggregateGlobalPopulation(state: GameState): void {
  const regions = state.humanPopulationSystem.regionalPopulations;

  // Validate regions array exists and is non-empty
  if (!regions || regions.length === 0) {
    throw new Error(
      `aggregateGlobalPopulation: regionalPopulations is ${regions ? 'empty' : 'undefined'} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Sum regional populations
  let totalPopulation = 0;

  for (const region of regions) {
    // FIX (Nov 6, 2025): Use assertion utilities
    const validatedPopulation = assertInRange(region.population, 0, 10000, {
      location: 'aggregateGlobalPopulation (regional population)',
      valueName: `${region.name}.population`,
      month: state.currentMonth
    });

    totalPopulation += validatedPopulation;
  }

  // Final validation
  totalPopulation = assertInRange(totalPopulation, 0, 50000, {
    location: 'aggregateGlobalPopulation (total population)',
    valueName: 'totalPopulation',
    month: state.currentMonth
  });

  // Convert from millions to billions for global population storage
  // Regional: millions (1677), Global: billions (8.137)
  // CALIBRATION (Nov 28, 2025): Lowered floor from 1M (0.001B) to 10M (0.01B)
  const totalPopulationBillions = assertInRange(totalPopulation / 1000, 0.01, 100, {
    location: 'aggregateGlobalPopulation (billions conversion)',
    valueName: 'totalPopulationBillions',
    month: state.currentMonth
  });

  // DEBUG: Log conversion (PERFORMANCE: Removed unconditional log from hot path - Nov 20, 2025)

  // Update global population
  state.humanPopulationSystem.population = assertFinite(totalPopulationBillions, {
    location: 'aggregateGlobalPopulation (population assignment)',
    valueName: 'state.humanPopulationSystem.population',
    month: state.currentMonth,
    additionalInfo: { totalPopulationBillions }
  });

  // Track peak population
  if (totalPopulationBillions > state.humanPopulationSystem.peakPopulation) {
    state.humanPopulationSystem.peakPopulation = assertFinite(totalPopulationBillions, {
      location: 'aggregateGlobalPopulation (peak population update)',
      valueName: 'peakPopulation',
      month: state.currentMonth,
      additionalInfo: { totalPopulationBillions }
    });
    state.humanPopulationSystem.peakPopulationMonth = state.currentMonth;
  }
}

/**
 * Aggregate Global Demographics from Regional Populations (Oct 26, 2025 - Phase 2)
 *
 * Bottom-up aggregation: Global demographics = population-weighted average of regional demographics
 *
 * Architecture: Regional demographic values are single source of truth, global is derived
 * Validation: Fails loudly on NaN/undefined/empty regions
 *
 * @param state - Game state containing regional populations
 */
export function aggregateGlobalDemographics(state: GameState): void {
  const regions = state.humanPopulationSystem.regionalPopulations;

  // Validate regions array exists and is non-empty
  if (!regions || regions.length === 0) {
    throw new Error(
      `aggregateGlobalDemographics: regionalPopulations is ${regions ? 'empty' : 'undefined'} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Calculate total population for weighting
  let totalPopulation = 0;
  let weightedBirthRate = 0;
  let weightedDeathRate = 0;
  let weightedFertilityRate = 0;
  let weightedMedianAge = 0;

  for (const region of regions) {
    // Validate regional data - fail loudly on invalid values
    if (!isFinite(region.population) || isNaN(region.population) || region.population < 0) {
      throw new Error(
        `aggregateGlobalDemographics: Invalid population for region "${region.name}": ${region.population} ` +
        `(month ${state.currentMonth})`
      );
    }

    if (!isFinite(region.adjustedBirthRate) || isNaN(region.adjustedBirthRate)) {
      throw new Error(
        `aggregateGlobalDemographics: Invalid adjustedBirthRate for region "${region.name}": ${region.adjustedBirthRate} ` +
        `(month ${state.currentMonth})`
      );
    }

    if (!isFinite(region.adjustedDeathRate) || isNaN(region.adjustedDeathRate)) {
      throw new Error(
        `aggregateGlobalDemographics: Invalid adjustedDeathRate for region "${region.name}": ${region.adjustedDeathRate} ` +
        `(month ${state.currentMonth})`
      );
    }

    if (!isFinite(region.fertilityRate) || isNaN(region.fertilityRate)) {
      throw new Error(
        `aggregateGlobalDemographics: Invalid fertilityRate for region "${region.name}": ${region.fertilityRate} ` +
        `(month ${state.currentMonth})`
      );
    }

    if (!isFinite(region.medianAge) || isNaN(region.medianAge)) {
      throw new Error(
        `aggregateGlobalDemographics: Invalid medianAge for region "${region.name}": ${region.medianAge} ` +
        `(month ${state.currentMonth})`
      );
    }

    // Accumulate weighted demographics
    totalPopulation += region.population;
    weightedBirthRate += region.population * region.adjustedBirthRate;
    weightedDeathRate += region.population * region.adjustedDeathRate;
    weightedFertilityRate += region.population * region.fertilityRate;
    weightedMedianAge += region.population * region.medianAge;
  }

  // Validate total population is positive
  if (totalPopulation <= 0) {
    throw new Error(
      `aggregateGlobalDemographics: Total population is ${totalPopulation} (all regions empty?) ` +
      `(month ${state.currentMonth})`
    );
  }

  // Calculate population-weighted averages
  const globalBirthRate = assertProbability(weightedBirthRate / totalPopulation, {
    location: 'aggregateGlobalDemographics (global birth rate)',
    valueName: 'globalBirthRate',
    month: state.currentMonth
  });

  const globalDeathRate = assertProbability(weightedDeathRate / totalPopulation, {
    location: 'aggregateGlobalDemographics (global death rate)',
    valueName: 'globalDeathRate',
    month: state.currentMonth
  });

  const globalFertilityRate = assertFinite(weightedFertilityRate / totalPopulation, {
    location: 'aggregateGlobalDemographics (global fertility rate)',
    valueName: 'globalFertilityRate',
    month: state.currentMonth,
    additionalInfo: { weightedFertilityRate, totalPopulation }
  });

  const globalMedianAge = assertFinite(weightedMedianAge / totalPopulation, {
    location: 'aggregateGlobalDemographics (global median age)',
    valueName: 'globalMedianAge',
    month: state.currentMonth,
    additionalInfo: { weightedMedianAge, totalPopulation }
  });

  // REMOVED: Manual NaN checks replaced by assertion utilities above
  if (false && (!isFinite(globalDeathRate) || isNaN(globalDeathRate))) {
    throw new Error(
      `aggregateGlobalDemographics: Death rate calculation produced NaN/Infinity ` +
      `(weightedDeathRate=${weightedDeathRate}, totalPopulation=${totalPopulation}, month=${state.currentMonth})`
    );
  }

  if (!isFinite(globalFertilityRate) || isNaN(globalFertilityRate)) {
    throw new Error(
      `aggregateGlobalDemographics: Fertility rate calculation produced NaN/Infinity ` +
      `(weightedFertilityRate=${weightedFertilityRate}, totalPopulation=${totalPopulation}, month=${state.currentMonth})`
    );
  }

  if (!isFinite(globalMedianAge) || isNaN(globalMedianAge)) {
    throw new Error(
      `aggregateGlobalDemographics: Median age calculation produced NaN/Infinity ` +
      `(weightedMedianAge=${weightedMedianAge}, totalPopulation=${totalPopulation}, month=${state.currentMonth})`
    );
  }

  // Update global population system with aggregated demographics
  state.humanPopulationSystem.adjustedBirthRate = globalBirthRate;
  state.humanPopulationSystem.adjustedDeathRate = globalDeathRate;
  state.humanPopulationSystem.fertilityRate = globalFertilityRate;
  state.humanPopulationSystem.medianAge = globalMedianAge;

  // Update net growth rate
  state.humanPopulationSystem.netGrowthRate = globalBirthRate - globalDeathRate;
}

/**
 * Aggregate Global Carrying Capacity from Regional Populations (Oct 26, 2025 - Phase 3)
 *
 * Bottom-up aggregation: Global carrying capacity = sum of regional capacities
 *
 * Architecture: Regional capacity values are single source of truth, global is derived
 * Validation: Fails loudly on NaN/undefined/empty regions
 *
 * @param state - Game state containing regional populations
 */
export function aggregateGlobalCarryingCapacity(state: GameState): void {
  const regions = state.humanPopulationSystem.regionalPopulations;

  // Validate regions array exists and is non-empty
  if (!regions || regions.length === 0) {
    throw new Error(
      `aggregateGlobalCarryingCapacity: regionalPopulations is ${regions ? 'empty' : 'undefined'} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Sum regional carrying capacities
  let totalCapacity = 0;

  for (const region of regions) {
    // Validate regional data - fail loudly on invalid values
    if (!isFinite(region.carryingCapacity) || isNaN(region.carryingCapacity) || region.carryingCapacity < 0) {
      throw new Error(
        `aggregateGlobalCarryingCapacity: Invalid carryingCapacity for region "${region.name}": ${region.carryingCapacity} ` +
        `(month ${state.currentMonth})`
      );
    }

    totalCapacity += region.carryingCapacity;
  }

  // Final validation - fail loudly on NaN
  if (!isFinite(totalCapacity) || isNaN(totalCapacity) || totalCapacity < 0) {
    throw new Error(
      `aggregateGlobalCarryingCapacity: Calculation produced invalid value: ${totalCapacity} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Convert from millions to billions for global storage
  // Regional: millions (100), Global: billions (1.0)
  const totalCapacityBillions = totalCapacity / 1000;

  // DEBUG: Log conversion (Oct 28, 2025 - troubleshooting unit mismatch)
  if (state.currentMonth === 0) {
    console.log(`\n🔍 aggregateGlobalCarryingCapacity (Month ${state.currentMonth}):`);
    console.log(`   Regional sum: ${totalCapacity.toFixed(1)}M`);
    console.log(`   Converted to: ${totalCapacityBillions.toFixed(3)}B`);
    console.log(`   Setting global carryingCapacity to: ${totalCapacityBillions.toFixed(3)}B`);
  }

  // Validate reasonable range (must be between 0.1B and 100B)
  if (totalCapacityBillions < 0.1 || totalCapacityBillions > 100) {
    throw new Error(
      `aggregateGlobalCarryingCapacity: Capacity out of reasonable range: ${totalCapacityBillions}B ` +
      `(regional sum: ${totalCapacity}M, month ${state.currentMonth})`
    );
  }

  // Update global carrying capacity
  state.humanPopulationSystem.carryingCapacity = totalCapacityBillions;
}

/**
 * Aggregate Global Deaths from Regional Populations (Oct 26, 2025 - Phase 4)
 *
 * Bottom-up aggregation: Global deaths = sum of regional deaths
 *
 * Architecture: Regional death values are single source of truth, global is derived
 * Validation: Fails loudly on NaN/undefined/empty regions
 *
 * @param state - Game state containing regional populations
 */
export function aggregateGlobalDeaths(state: GameState): void {
  const regions = state.humanPopulationSystem.regionalPopulations;

  // Validate regions array exists and is non-empty
  if (!regions || regions.length === 0) {
    throw new Error(
      `aggregateGlobalDeaths: regionalPopulations is ${regions ? 'empty' : 'undefined'} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Sum regional deaths
  let totalMonthlyExcessDeaths = 0;
  let totalCumulativeCrisisDeaths = 0;

  for (const region of regions) {
    // Validate regional data - fail loudly on invalid values
    if (!isFinite(region.monthlyExcessDeaths) || isNaN(region.monthlyExcessDeaths) || region.monthlyExcessDeaths < 0) {
      throw new Error(
        `aggregateGlobalDeaths: Invalid monthlyExcessDeaths for region "${region.name}": ${region.monthlyExcessDeaths} ` +
        `(month ${state.currentMonth})`
      );
    }

    if (!isFinite(region.cumulativeCrisisDeaths) || isNaN(region.cumulativeCrisisDeaths) || region.cumulativeCrisisDeaths < 0) {
      throw new Error(
        `aggregateGlobalDeaths: Invalid cumulativeCrisisDeaths for region "${region.name}": ${region.cumulativeCrisisDeaths} ` +
        `(month ${state.currentMonth})`
      );
    }

    totalMonthlyExcessDeaths += region.monthlyExcessDeaths;
    totalCumulativeCrisisDeaths += region.cumulativeCrisisDeaths;
  }

  // Final validation - fail loudly on NaN
  if (!isFinite(totalMonthlyExcessDeaths) || isNaN(totalMonthlyExcessDeaths) || totalMonthlyExcessDeaths < 0) {
    throw new Error(
      `aggregateGlobalDeaths: Monthly excess deaths calculation produced invalid value: ${totalMonthlyExcessDeaths} ` +
      `(month ${state.currentMonth})`
    );
  }

  if (!isFinite(totalCumulativeCrisisDeaths) || isNaN(totalCumulativeCrisisDeaths) || totalCumulativeCrisisDeaths < 0) {
    throw new Error(
      `aggregateGlobalDeaths: Cumulative crisis deaths calculation produced invalid value: ${totalCumulativeCrisisDeaths} ` +
      `(month ${state.currentMonth})`
    );
  }

  // Update global death tracking
  state.humanPopulationSystem.monthlyExcessDeaths = totalMonthlyExcessDeaths;
  state.humanPopulationSystem.cumulativeCrisisDeaths = totalCumulativeCrisisDeaths;
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
export function updateHumanPopulation(state: GameState, rng: () => number): void {
  const pop = state.humanPopulationSystem;

  // P2 BUG FIX (Oct 16, 2025): Reset monthly death cap counter at start of month
  pop.monthlyDeathsApplied = 0;
  pop.monthlyDeathCapReached = false;

  // === PHASE 5: AGGREGATE REGIONAL POPULATIONS TO GLOBAL ===
  // Global population is DERIVED from regional populations (bottom-up architecture)
  if (pop.regionalPopulations && pop.regionalPopulations.length > 0) {
    // FIX (Nov 6, 2025): Use assertion utilities instead of manual NaN checks
    for (const region of pop.regionalPopulations) {
      assertFinite(region.population, {
        location: 'updateHumanPopulation (regional population)',
        valueName: `${region.name}.population`,
        month: state.currentMonth,
        additionalInfo: { regionName: region.name }
      });
    }

    // Sum regional populations (already in millions)
    const totalPopulationMillions = assertFinite(
      pop.regionalPopulations.reduce((sum, region) => sum + region.population, 0),
      {
        location: 'updateHumanPopulation (regional sum)',
        valueName: 'totalPopulationMillions',
        month: state.currentMonth,
        additionalInfo: { regionCount: pop.regionalPopulations.length }
      }
    );

    // FIX (Oct 28, 2025): Convert to billions to match global population convention
    // Regional populations are in millions, global population is in billions
    const totalPopulationBillions = assertFinite(totalPopulationMillions / 1000, {
      location: 'updateHumanPopulation (billions conversion)',
      valueName: 'totalPopulationBillions',
      month: state.currentMonth,
      additionalInfo: { totalPopulationMillions }
    });

    pop.population = assertFinite(totalPopulationBillions, {
      location: 'updateHumanPopulation (population assignment)',
      valueName: 'pop.population',
      month: state.currentMonth,
      additionalInfo: { totalPopulationBillions }
    });

    // Update peak if current exceeds it
    if (pop.population > pop.peakPopulation) {
      pop.peakPopulation = pop.population;
      pop.peakPopulationMonth = state.currentMonth;
    }

    // Regional system handles all population dynamics, skip legacy global update
    updateDemographics(state); // Still update global demographics

    // FIX (Nov 6, 2025): Validate population after demographics update
    assertFinite(pop.population, {
      location: 'updateHumanPopulation (after updateDemographics)',
      valueName: 'pop.population',
      month: state.currentMonth,
      additionalInfo: { expectedValue: totalPopulationBillions }
    });

    return;
  }

  const qol = state.qualityOfLifeSystems;
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const resources = state.resourceEconomy;

  // === 1. CALCULATE CARRYING CAPACITY ===
  // Base capacity affected by: climate, resources, ecosystem, technology

  // Climate modifier: stable climate = high capacity
  const climateModifier = assertProbability(env.climateStability, {
    location: 'updateHumanPopulation (climate modifier)',
    valueName: 'climateStability',
    month: state.currentMonth
  });

  // Resource modifier: need food AND water
  const foodStock = assertFinite(resources.food.reserves, {
    location: 'updateHumanPopulation (food reserves)',
    valueName: 'food.reserves',
    month: state.currentMonth
  });
  const waterStock = assertFinite(resources.water.reserves, {
    location: 'updateHumanPopulation (water reserves)',
    valueName: 'water.reserves',
    month: state.currentMonth
  });
  const foodAvailability = Math.min(1.0, foodStock);
  const waterAvailability = Math.min(1.0, waterStock);
  const resourceModifier = Math.min(foodAvailability, waterAvailability);

  // Ecosystem modifier: ecosystem services support humans
  // FIX (Oct 16, 2025): Biodiversity loss affects LONG-TERM resilience (pollination, climate regulation)
  // NOT immediate carrying capacity. Industrial agriculture feeds 8B despite 65% biodiversity loss.
  // Research: No evidence that 35% biodiversity = 35% capacity in 2025.
  // Only catastrophic collapse (<20%) immediately constrains food production.
  const biodiversity = assertProbability(env.biodiversityIndex, {
    location: 'updateHumanPopulation (biodiversity)',
    valueName: 'biodiversityIndex',
    month: state.currentMonth
  });
  const ecosystemModifier = biodiversity < 0.20
    ? biodiversity * 2.5  // Catastrophic: 20% biodiv → 50% capacity, 10% → 25%, 0% → 0%
    : Math.max(0.8, 0.8 + (biodiversity - 0.2) * 0.5); // 20-100% biodiv → 80-120% capacity

  // Tech modifier: advancement increases capacity
  const economicStage = assertFinite(state.globalMetrics.economicTransitionStage, {
    location: 'updateHumanPopulation (economic stage)',
    valueName: 'economicTransitionStage',
    month: state.currentMonth
  });
  const techModifier = 1.0 +
    (economicStage * 0.2) + // Tech advancement
    (getTechDeploymentSafe(state, 'fusionPower')) * 1.0 + // Energy abundance
    (getTechDeploymentSafe(state, 'sustainableAgriculture')) * 0.5; // Food efficiency

  pop.capacityModifier = assertFinite(
    climateModifier * resourceModifier * ecosystemModifier * techModifier,
    {
      location: 'updateHumanPopulation (capacity modifier)',
      valueName: 'capacityModifier',
      month: state.currentMonth,
      additionalInfo: { climateModifier, resourceModifier, ecosystemModifier, techModifier }
    }
  );
  pop.carryingCapacity = assertFinite(
    Math.max(1.0, pop.baselineCarryingCapacity * pop.capacityModifier),
    {
      location: 'updateHumanPopulation (carrying capacity)',
      valueName: 'carryingCapacity',
      month: state.currentMonth,
      additionalInfo: { baselineCarryingCapacity: pop.baselineCarryingCapacity, capacityModifier: pop.capacityModifier }
    }
  );
  pop.populationPressure = assertFinite(pop.population / pop.carryingCapacity, {
    location: 'updateHumanPopulation (population pressure)',
    valueName: 'populationPressure',
    month: state.currentMonth,
    additionalInfo: { population: pop.population, carryingCapacity: pop.carryingCapacity }
  });

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
  const monthlyBirthNoise = 0.98 + rng() * 0.04; // ±2% monthly variation

  pop.adjustedBirthRate = assertProbability(
    pop.baselineBirthRate *
    meaningModifier *
    economicModifier *
    healthcareModifier *
    stabilityModifier *
    pressureModifier *
    seasonalBirthCycle *
    monthlyBirthNoise,
    {
      location: 'updateHumanPopulation (adjusted birth rate)',
      valueName: 'adjustedBirthRate',
      month: state.currentMonth
    }
  );

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
  // MIGRATION (Oct 28, 2025): Environmental mortality now via centralized Bayesian system
  // calculateEnvironmentalMortality() now ADDS mortality risks directly instead of returning rates
  // Side-effect function: Call it but don't use return value (always returns zeros)
  // Research: UNEP (2024), PNAS (2014), CDC mortality data

  const { calculateEnvironmentalMortality } = require('./qualityOfLife');
  calculateEnvironmentalMortality(state, state.currentMonth); // Side-effect: adds mortality risks

  // P0.6: Seasonal death rate pattern (research-backed)
  // Research: Death rates 10-30% higher in winter vs summer (respiratory/circulatory diseases)
  // - Elderly (70+): 10% seasonal amplitude
  // - Very old (90+): 15% seasonal amplitude
  // - Global average: 12% amplitude with winter peak
  const seasonalDeathCycle = 1 + 0.12 * Math.sin((2 * Math.PI * monthInYear / 12) + Math.PI); // 12% amplitude, winter peak (shifted by π)
  const monthlyDeathNoise = 0.98 + rng() * 0.04; // ±2% monthly variation

  // Healthcare reduction: good healthcare reduces deaths significantly
  // P0.6: Healthcare quality is structural (not temporally variable)
  const healthcareBase = Math.max(0.3, 1 - (qol.healthcareQuality * 0.7));

  // War multiplier: active conflicts dramatically increase deaths
  // FIX #1 (Oct 18, 2025): Cap multiplier to prevent 92% war death dominance
  // Research: ECFR (2024), CSET Georgetown (2024) - force multiplication plateaus, not unlimited
  // UN resolution 166-3: Flash war risk from speed, not simple lethality scaling
  if (state.conflictResolution?.activeConflicts === undefined) {
    throw new Error('❌ state.conflictResolution.activeConflicts is undefined in calculateWarDeaths - initialization bug');
  }
  const activeConflicts = state.conflictResolution.activeConflicts;
  const BASE_WAR_MULTIPLIER = 1.5;
  const WAR_MULTIPLIER_PER_CONFLICT = 0.15;  // Reduced from 0.2 (more realistic)
  const MAX_WAR_MULTIPLIER = 2.0;  // HARD CAP (force multiplication plateaus)

  const uncappedMultiplier = activeConflicts > 0
    ? BASE_WAR_MULTIPLIER + (activeConflicts * WAR_MULTIPLIER_PER_CONFLICT)
    : 1.0;
  const warMultiplier = Math.min(uncappedMultiplier, MAX_WAR_MULTIPLIER);

  // Base death rate applies seasonal pattern and monthly noise
  const baselineDeaths = assertProbability(
    pop.baselineDeathRate * healthcareBase * warMultiplier * seasonalDeathCycle * monthlyDeathNoise,
    {
      location: 'updateHumanPopulation (baseline deaths)',
      valueName: 'baselineDeaths',
      month: state.currentMonth
    }
  );

  // MIGRATION (Oct 28, 2025): Environmental mortality now handled by Bayesian system
  // calculateEnvironmentalMortality() adds risks directly via addMortalityRisk()
  // No longer need to add environmental death rate here - BayesianMortalityResolutionPhase handles it

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

  // MIGRATION (Oct 28, 2025): Environmental mortality removed from growth-rate system
  // All crisis mortality now handled by Bayesian system via BayesianMortalityResolutionPhase
  // This function now only handles baseline demographic changes (births/deaths from aging)
  //
  // Apply resilience floor to extinction scenarios only (if any)
  const proposedAdditionalMortality = extinctionDeathRate;
  const adjustedAdditionalMortality = proposedAdditionalMortality * resilienceFloor;

  // Combine baseline + resilience-adjusted extinction mortality
  // NOTE (Nov 24, 2025): adjustedDeathRate is calculated for REPORTING purposes only.
  // Actual deaths are applied by BayesianMortalityResolutionPhase (order 35.0).
  // This avoids double-counting deaths between demographic and Bayesian systems.
  pop.adjustedDeathRate = assertProbability(
    baselineDeaths + adjustedAdditionalMortality,
    {
      location: 'updateHumanPopulation (adjusted death rate)',
      valueName: 'adjustedDeathRate',
      month: state.currentMonth
    }
  );

  // Log resilience floor activation (when significant)
  if (resilienceFloor < 0.9 && state.currentMonth % 12 === 0 && adjustedAdditionalMortality > 0.01) {
    const reduction = ((1 - resilienceFloor) * 100).toFixed(1);
    console.log(`🛡️  RESILIENCE FLOOR ACTIVE: Reducing extinction mortality by ${reduction}% (cumulative mortality: ${(cumulativeMortalityRate * 100).toFixed(1)}%)`);
    console.log(`   Proposed: ${(proposedAdditionalMortality * 100).toFixed(2)}%/year → Actual: ${(adjustedAdditionalMortality * 100).toFixed(2)}%/year`);
  }

  // === 5. CALCULATE NET GROWTH ===
  // FIX (Nov 24, 2025): Only apply BIRTHS here - BayesianMortalityResolutionPhase handles deaths
  // Architecture: updateHumanPopulation adds births -> BayesianMortalityResolutionPhase subtracts deaths
  // This matches the fix already applied to regional populations (Oct 28, 2025)
  pop.netGrowthRate = assertFinite(pop.adjustedBirthRate, {
    location: 'updateHumanPopulation (net growth rate - births only)',
    valueName: 'netGrowthRate',
    month: state.currentMonth,
    additionalInfo: {
      adjustedBirthRate: pop.adjustedBirthRate,
      // adjustedDeathRate tracked for reporting but NOT subtracted
      adjustedDeathRateForReference: pop.adjustedDeathRate
    }
  });
  const monthlyGrowthRate = assertFinite(pop.netGrowthRate / 12, {
    location: 'updateHumanPopulation (monthly growth rate)',
    valueName: 'monthlyGrowthRate',
    month: state.currentMonth,
    additionalInfo: { netGrowthRate: pop.netGrowthRate }
  });

  // === 6. APPLY POPULATION CHANGE ===
  const previousPopulation = pop.population;
  const newPopulation = assertFinite(pop.population * (1 + monthlyGrowthRate), {
    location: 'updateHumanPopulation (new population)',
    valueName: 'newPopulation',
    month: state.currentMonth,
    additionalInfo: {
      previousPopulation: pop.population,
      monthlyGrowthRate
    }
  });

  pop.population = assertFinite(Math.max(0, newPopulation), {
    location: 'updateHumanPopulation (population after update)',
    valueName: 'pop.population',
    month: state.currentMonth,
    additionalInfo: { newPopulation, previousPopulation }
  });

  // === 7. CARRYING CAPACITY CONSTRAINT ===
  // FIX (Oct 26, 2025): REMOVED instant 5% per month overshoot death mechanic
  //
  // OLD BEHAVIOR (lines 414-467, removed):
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

  // === 8. TRACK CUMULATIVE DEATHS ===
  const naturalDeaths = previousPopulation * (pop.baselineDeathRate / 12);
  const actualDeaths = previousPopulation - pop.population;
  pop.monthlyExcessDeaths = Math.max(0, actualDeaths - naturalDeaths);
  pop.cumulativeCrisisDeaths += pop.monthlyExcessDeaths;

  // ROOT CAUSE FIX (Oct 27, 2025): Bug #19 - Environmental Death Double-Counting
  //
  // REMOVED lines 1037-1057 that explicitly added environmental deaths to deathsByCategory.
  //
  // PROBLEM: Environmental deaths were being counted TWICE:
  // 1. Implicitly via adjustedDeathRate (lines 975-1007) - affects natural demographic change
  // 2. Explicitly added to deathsByCategory (REMOVED) - added again as crisis deaths
  //
  // Result: totalProximateDeaths was 1.82× higher than cumulativeCrisisDeaths,
  // breaking all mortality breakdown percentages (showed 0.0% for everything).
  //
  // CORRECT BEHAVIOR:
  // - Environmental deaths (climate, ecosystem, pollution) affect demographic rates
  // - These are gradual effects, NOT acute crisis events
  // - Only ACUTE crisis deaths (wars, famines, disasters) should be in deathsByCategory
  // - Environmental mortality is already captured in adjustedDeathRate (line 985)
  //
  // Evidence: SO-100 Monte Carlo showed:
  // - cumulativeCrisisDeaths: 9,796.5M (correct total)
  // - totalProximateDeaths: 17,795.6M (1.82× - DOUBLE COUNTED)
  // - All percentages showing 0.0% due to wrong denominator

  // DEBUG (P1.1 - Death Accounting): Log death tracking mismatch
  // FIX (Oct 29, 2025): BUG #1 - deathsByCategory is now in MILLIONS, not billions
  if (state.currentMonth % 12 === 0 && actualDeaths > 0.1) { // Log annually when deaths >100M
    const trackedDeathsMillions = Object.values(pop.deathsByCategory).reduce((a, b) => a + b, 0); // In millions
    const trackedDeathsBillions = trackedDeathsMillions / 1000;
    const discrepancy = Math.abs(actualDeaths - trackedDeathsBillions);
    if (discrepancy > 0.5) { // >500M discrepancy
      console.warn(`⚠️  DEATH ACCOUNTING MISMATCH (Month ${state.currentMonth}):`);
      console.log(`   Actual population deaths: ${actualDeaths.toFixed(3)}B (${(actualDeaths * 1000).toFixed(0)}M)`);
      console.log(`   Tracked by category: ${trackedDeathsBillions.toFixed(3)}B (${trackedDeathsMillions.toFixed(0)}M)`);
      console.log(`   Discrepancy: ${discrepancy.toFixed(3)}B (${(discrepancy * 1000).toFixed(0)}M) - ${(discrepancy / actualDeaths * 100).toFixed(0)}%`);
      console.log(`   Categories: war=${pop.deathsByCategory.war.toFixed(0)}M, famine=${pop.deathsByCategory.famine.toFixed(0)}M, disasters=${pop.deathsByCategory.disasters.toFixed(0)}M`);
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
      console.warn(`⚠️ POPULATION DECLINE: ${pop.population.toFixed(2)}B (${decline.toFixed(0)}% from peak)`);
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
      narrative = `Humanity thrives at ${(pop.population / 1000).toFixed(2)}B people. Civilization flourishes.`;
      civilizationIntact = true;
      break;

    case PopulationStatus.STABLE:
      narrative = `Population stabilized at ${(pop.population / 1000).toFixed(2)}B (${decline.toFixed(0)}% decline from peak). Society adapts to new equilibrium.`;
      civilizationIntact = true;
      break;

    case PopulationStatus.DECLINING:
      narrative = `Severe population crash: ${(pop.population / 1000).toFixed(2)}B remaining (${decline.toFixed(0)}% loss). Civilization struggles but survives.`;
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
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'cascade' | 'other',
  rootCause: RootCause | CompoundCause,
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
): void {
  const pop = state.humanPopulationSystem;
  const segments = state.society.segments;

  if (!segments || segments.length === 0) {
    // Fallback to uniform mortality if segments not initialized
    return addUniformCrisisDeaths(state, baseMortalityRate, reason, exposedFraction, category, rootCause, confidence);
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
  if (pop.monthlyDeathsApplied === undefined) {
    throw new Error('❌ pop.monthlyDeathsApplied is undefined in applyDeathsWithCap - initialization bug');
  }
  const remainingCapacity = Math.max(0, monthlyDeathCap - pop.monthlyDeathsApplied);
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
  // FIX (Nov 9, 2025): Add assertion to catch NaN propagation
  const newPopulation = assertFinite(pop.population - totalDeathsApplied, {
    location: 'applyDeathsWithCap',
    valueName: 'newPopulation (after deaths)',
    month: state.currentMonth,
    additionalInfo: {
      previousPopulation: pop.population,
      totalDeathsApplied,
      category
    }
  });
  pop.population = Math.max(0, newPopulation);

  // FIX (Oct 29, 2025): BUG #1 - Death attribution mismatch
  // totalDeathsApplied is in BILLIONS, but monthlyExcessDeaths/cumulativeCrisisDeaths are in MILLIONS
  // Convert to millions for storage
  const totalDeathsAppliedMillions = totalDeathsApplied * 1000;
  pop.monthlyExcessDeaths += totalDeathsAppliedMillions;
  pop.cumulativeCrisisDeaths += totalDeathsAppliedMillions;
  if (pop.monthlyDeathsApplied === undefined) {
    throw new Error('❌ pop.monthlyDeathsApplied is undefined in applyDeathsWithCap line 844 - initialization bug');
  }
  pop.monthlyDeathsApplied = pop.monthlyDeathsApplied + totalDeathsApplied;

  // Track by category (stored in MILLIONS per types/population.ts line 74)
  pop.deathsByCategory[category] += totalDeathsAppliedMillions;

  // Track by root cause (TIER 1.8: Death Attribution System Redesign)
  if (isCompoundCause(rootCause)) {
    // Validate compound cause
    validateCompoundCause(rootCause);

    // Distribute deaths across root causes by weight (stored in MILLIONS)
    for (const causeAttr of rootCause.causes) {
      const weightedDeaths = totalDeathsAppliedMillions * causeAttr.weight;
      pop.deathsByRootCause[causeAttr.cause] += weightedDeaths;
    }

    // Track as compound (stored in MILLIONS)
    pop.deathsByRootCause.compound += totalDeathsAppliedMillions;

    // Use lowest confidence of components (stored in MILLIONS)
    const overallConfidence = getCompoundConfidence(rootCause);
    pop.deathsByRootCause.confidenceDistribution[overallConfidence] += totalDeathsAppliedMillions;
  } else {
    // Single root cause (stored in MILLIONS)
    pop.deathsByRootCause[rootCause] += totalDeathsAppliedMillions;
    pop.deathsByRootCause.confidenceDistribution[confidence] += totalDeathsAppliedMillions;
  }
  
  // Log significant events
  if (totalDeathsApplied > 0.001) {
    // PERFORMANCE (Nov 20, 2025): Conditionalize crisis logging (hot path during crises)
    if (DEBUG_FLAGS.ENABLED && DEBUG_FLAGS.CRISES) {
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
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'cascade' | 'other',
  rootCause: RootCause | CompoundCause,
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
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
  // FIX (Nov 9, 2025): Add assertion to catch NaN propagation
  const newPopulation = assertFinite(pop.population - deathsInBillions, {
    location: 'applyDeathsWithCapMonthly',
    valueName: 'newPopulation (after deaths)',
    month: state.currentMonth,
    additionalInfo: {
      previousPopulation: pop.population,
      deathsInBillions,
      exposedFraction,
      mortalityRate
    }
  });
  pop.population = Math.max(0, newPopulation);

  // FIX (Oct 29, 2025): BUG #1 - Death attribution mismatch
  // deathsInBillions is in BILLIONS, but monthlyExcessDeaths/cumulativeCrisisDeaths are in MILLIONS
  // Convert to millions for storage
  const deathsInMillions = deathsInBillions * 1000;
  pop.monthlyExcessDeaths += deathsInMillions;
  pop.cumulativeCrisisDeaths += deathsInMillions;
  if (pop.monthlyDeathsApplied === undefined) {
    throw new Error('❌ pop.monthlyDeathsApplied is undefined in applyImmediateDeaths line 952 - initialization bug');
  }
  pop.monthlyDeathsApplied = pop.monthlyDeathsApplied + deathsInBillions;

  // Track by category (stored in MILLIONS per types/population.ts line 74)
  pop.deathsByCategory[category] += deathsInMillions;

  // Track by root cause (TIER 1.8: Death Attribution System Redesign)
  if (isCompoundCause(rootCause)) {
    // Validate compound cause
    validateCompoundCause(rootCause);

    // Distribute deaths across root causes by weight (stored in MILLIONS)
    for (const causeAttr of rootCause.causes) {
      const weightedDeaths = deathsInMillions * causeAttr.weight;
      pop.deathsByRootCause[causeAttr.cause] += weightedDeaths;
    }

    // Track as compound (stored in MILLIONS)
    pop.deathsByRootCause.compound += deathsInMillions;

    // Use lowest confidence of components (stored in MILLIONS)
    const overallConfidence = getCompoundConfidence(rootCause);
    pop.deathsByRootCause.confidenceDistribution[overallConfidence] += deathsInMillions;
  } else {
    // Single root cause (stored in MILLIONS)
    pop.deathsByRootCause[rootCause] += deathsInMillions;
    pop.deathsByRootCause.confidenceDistribution[confidence] += deathsInMillions;
  }

  // Log significant events
  if (deathsInBillions > 0.001) { // > 1M deaths
    const deathsInMillionsFormatted = deathsInMillions.toFixed(1);
    const exposedPct = (exposedFraction * 100).toFixed(0);
    const scope = exposedFraction >= 0.9 ? 'GLOBAL' : exposedFraction >= 0.4 ? 'SEMI-GLOBAL' : 'REGIONAL';
    const cappedNote = actualDeaths < requestedDeaths ? ' [CAPPED]' : '';

    // Format root cause for logging
    let rootCauseStr: string;
    if (isCompoundCause(rootCause)) {
      const causes = rootCause.causes.map(c => `${c.cause}=${(c.weight * 100).toFixed(0)}%`).join('+');
      rootCauseStr = `compound(${causes})`;
    } else {
      rootCauseStr = rootCause;
    }

    // PERFORMANCE (Nov 20, 2025): Conditionalize crisis logging (hot path during crises)
    if (DEBUG_FLAGS.ENABLED && DEBUG_FLAGS.CRISES) {
      console.log(`💀 ${scope} CRISIS DEATHS: ${deathsInMillionsFormatted}M casualties (${reason}) [${category.toUpperCase()}]${cappedNote}`);
      console.log(`   Exposed: ${exposedPct}% of world, Mortality: ${(mortalityRate * 100).toFixed(1)}%`);
      console.log(`   Root cause: ${rootCauseStr}, Confidence: ${confidence}`);
      console.log(`   Population: ${pop.population.toFixed(3)}B remaining`);
    }
  }
}

/**
 * Add acute crisis deaths (public API)
 *
 * P2.3 UPDATE (Oct 16, 2025): Now supports segment-specific mortality
 * TIER 1.8 UPDATE (Oct 19, 2025): Required root cause attribution with research backing
 *
 * @param state - Game state to modify
 * @param mortalityRate - Mortality rate (0-1, fraction of exposed population)
 * @param reason - Human-readable description
 * @param exposedFraction - Fraction of total population exposed (0-1)
 * @param category - Proximate cause (HOW they died)
 * @param rootCause - Root cause (WHY it happened) - single or compound (REQUIRED)
 * @param confidence - Confidence level in attribution (default: MEDIUM)
 *
 * @example Single cause
 * addAcuteCrisisDeaths(
 *   state, 0.60, 'Nuclear war - blast/radiation', 0.30, 'war',
 *   RootCause.conflict, 'HIGH'
 * );
 *
 * @example Compound cause
 * addAcuteCrisisDeaths(
 *   state, 0.015, 'Climate catastrophe - famine', 0.30, 'climate',
 *   {
 *     causes: [
 *       { cause: RootCause.climate, weight: 0.50, confidence: 'MEDIUM' },
 *       { cause: RootCause.inequality, weight: 0.35, confidence: 'MEDIUM' },
 *       { cause: RootCause.ecosystem, weight: 0.15, confidence: 'MEDIUM' }
 *     ],
 *     evidence: 'Burke et al. (2020) + IPCC AR6',
 *     mechanism: 'Drought × poverty × degraded land → famine'
 *   },
 *   'MEDIUM'
 * );
 */
export function addAcuteCrisisDeaths(
  state: GameState,
  mortalityRate: number,
  reason: string,
  exposedFraction: number = 1.0,
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'cascade' | 'other' = 'other',
  rootCause: RootCause | CompoundCause,  // NOW REQUIRED (was optional)
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'  // NEW parameter
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

  // FIX (Nov 9, 2025): Fail loudly on NaN instead of silent fallback
  pop.population = assertFinite(pop.population, {
    location: 'addAcuteCrisisDeaths',
    valueName: 'pop.population (before applying deaths)',
    month: state.currentMonth,
    additionalInfo: {
      reason,
      mortalityRate,
      exposedFraction,
      category
    }
  });


  // P2.3 UPDATE (Oct 16, 2025): Route to segment-specific or uniform mortality
  // If heterogeneous population segments are active, apply differential mortality
  // Otherwise, fall back to uniform mortality (legacy behavior)

  if (state.society.segments && state.society.segments.length > 0) {
    addSegmentSpecificCrisisDeaths(state, mortalityRate, reason, exposedFraction, category, rootCause, confidence);
  } else {
    addUniformCrisisDeaths(state, mortalityRate, reason, exposedFraction, category, rootCause, confidence);
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
  // FIX (Oct 28, 2025): Ensure unit consistency - proximate is in millions, rootCause is in billions
  const totalProximateDeaths = Object.values(proximate).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0); // in MILLIONS
  const totalRootCauseDeaths = Object.entries(rootCause)
    .filter(([key]) => key !== 'confidenceDistribution') // Exclude nested object
    .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0); // in BILLIONS

  // Convert rootCause to millions for comparison
  const totalRootCauseDeathsMillions = totalRootCauseDeaths * 1000;

  // Use the larger total as denominator (all in millions now)
  const totalDeaths = Math.max(pop.cumulativeCrisisDeaths, totalProximateDeaths, totalRootCauseDeathsMillions);

  // Helper function to format percentage, avoiding NaN and Infinity
  const formatPercent = (value: number, total: number): string => {
    if (isNaN(value) || isNaN(total)) return '0.0'; // Guard against NaN
    if (total === 0) return '0.0'; // No deaths at all
    if (value === 0) return '0.0'; // This category has no deaths
    const percent = (value / total) * 100;
    if (isNaN(percent) || !isFinite(percent)) return '0.0'; // Guard against NaN/Infinity
    return percent.toFixed(1);
  };

  console.log('\n=== MULTI-DIMENSIONAL DEATH SUMMARY ===');
  // FIX (Oct 28, 2025): cumulativeCrisisDeaths is ALREADY in millions, don't multiply by 1000
  console.log(`Total crisis deaths: ${pop.cumulativeCrisisDeaths.toFixed(1)}M`);
  // FIX (Oct 28, 2025): Population is in billions, convert to millions for display
  console.log(`Population decline: ${((pop.peakPopulation - pop.population) * 1000).toFixed(1)}M (${(((pop.peakPopulation - pop.population) / pop.peakPopulation) * 100).toFixed(1)}%)`);

  // PROXIMATE CAUSES: What killed them (medical/physical cause)
  console.log('\n--- PROXIMATE CAUSES (What killed them) ---');
  console.log(`  War:        ${proximate.war.toFixed(1)}M (${formatPercent(proximate.war, totalDeaths)}%)`);
  console.log(`  Famine:     ${proximate.famine.toFixed(1)}M (${formatPercent(proximate.famine, totalDeaths)}%)`);
  console.log(`  Disasters:  ${proximate.disasters.toFixed(1)}M (${formatPercent(proximate.disasters, totalDeaths)}%)`);
  console.log(`  Disease:    ${proximate.disease.toFixed(1)}M (${formatPercent(proximate.disease, totalDeaths)}%)`);
  console.log(`  Ecosystem:  ${proximate.ecosystem.toFixed(1)}M (${formatPercent(proximate.ecosystem, totalDeaths)}%)`);
  console.log(`  Pollution:  ${proximate.pollution.toFixed(1)}M (${formatPercent(proximate.pollution, totalDeaths)}%)`);
  console.log(`  AI:         ${proximate.ai.toFixed(1)}M (${formatPercent(proximate.ai, totalDeaths)}%)`);
  console.log(`  Cascade:    ${proximate.cascade.toFixed(1)}M (${formatPercent(proximate.cascade, totalDeaths)}%)`);
  console.log(`  Other:      ${proximate.other.toFixed(1)}M (${formatPercent(proximate.other, totalDeaths)}%)`);

  // ROOT CAUSES: Why it happened (underlying systemic driver) - TIER 1.8 updated taxonomy
  // FIX (Oct 28, 2025): rootCause values are in BILLIONS, convert to MILLIONS for percentage calculation
  console.log('\n--- ROOT CAUSES (Why it happened) ---');
  console.log('  Environmental drivers:');
  console.log(`    Climate:     ${(rootCause.climate * 1000).toFixed(1)}M (${formatPercent(rootCause.climate * 1000, totalDeaths)}%)`);
  console.log(`    Resource:    ${(rootCause.resource * 1000).toFixed(1)}M (${formatPercent(rootCause.resource * 1000, totalDeaths)}%)`);
  console.log(`    Pollution:   ${(rootCause.pollution * 1000).toFixed(1)}M (${formatPercent(rootCause.pollution * 1000, totalDeaths)}%)`);
  console.log(`    Ecosystem:   ${(rootCause.ecosystem * 1000).toFixed(1)}M (${formatPercent(rootCause.ecosystem * 1000, totalDeaths)}%)`);
  console.log('  Social drivers:');
  console.log(`    Inequality:  ${(rootCause.inequality * 1000).toFixed(1)}M (${formatPercent(rootCause.inequality * 1000, totalDeaths)}%)`);
  console.log(`    Demographic: ${(rootCause.demographic * 1000).toFixed(1)}M (${formatPercent(rootCause.demographic * 1000, totalDeaths)}%)`);
  console.log(`    Social:      ${(rootCause.social * 1000).toFixed(1)}M (${formatPercent(rootCause.social * 1000, totalDeaths)}%)`);
  console.log('  Technology drivers:');
  console.log(`    Alignment:   ${(rootCause.alignment * 1000).toFixed(1)}M (${formatPercent(rootCause.alignment * 1000, totalDeaths)}%)`);
  console.log(`    Disruption:  ${(rootCause.disruption * 1000).toFixed(1)}M (${formatPercent(rootCause.disruption * 1000, totalDeaths)}%)`);
  console.log('  External shocks:');
  console.log(`    Conflict:    ${(rootCause.conflict * 1000).toFixed(1)}M (${formatPercent(rootCause.conflict * 1000, totalDeaths)}%)`);
  console.log(`    Pandemic:    ${(rootCause.pandemic * 1000).toFixed(1)}M (${formatPercent(rootCause.pandemic * 1000, totalDeaths)}%)`);
  console.log('  Compound attribution:');
  console.log(`    Compound:    ${(rootCause.compound * 1000).toFixed(1)}M (${formatPercent(rootCause.compound * 1000, totalDeaths)}%)`);
  console.log('  Confidence distribution:');
  console.log(`    HIGH:        ${(rootCause.confidenceDistribution.HIGH * 1000).toFixed(1)}M (${formatPercent(rootCause.confidenceDistribution.HIGH * 1000, totalDeaths)}%)`);
  console.log(`    MEDIUM:      ${(rootCause.confidenceDistribution.MEDIUM * 1000).toFixed(1)}M (${formatPercent(rootCause.confidenceDistribution.MEDIUM * 1000, totalDeaths)}%)`);
  console.log(`    LOW:         ${(rootCause.confidenceDistribution.LOW * 1000).toFixed(1)}M (${formatPercent(rootCause.confidenceDistribution.LOW * 1000, totalDeaths)}%)`);
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
