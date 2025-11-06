/**
 * Extreme Weather Events System - Storm Intensity-Frequency Modeling
 *
 * Models tropical cyclones (hurricanes, typhoons, cyclones) under climate change.
 *
 * Research backing:
 * - Knutson et al. (2020): "Tropical Cyclones and Climate Change Assessment." *BAMS*
 * - Knutson et al. (2023): "Global Landfall Frequency Projections." *BAMS*
 * - Emanuel (2021): "Response of Global Tropical Cyclone Activity to Increasing CO2." *J. Climate*
 * - Mendelsohn et al. (2012): Economic impacts and mortality scaling
 * - NOAA GFDL (2024): "Global Warming and Hurricanes."
 * - EPA (2024): "Climate Change Indicators: Tropical Cyclone Activity."
 *
 * Key findings:
 * - Intensity increase: 2-11% by 2100
 * - Frequency change: -6% to -34% (FEWER storms overall)
 * - Category shift: More Cat 4-5, fewer Cat 1-2
 * - Rapid intensification: Nearly doubled 1982-2009
 * - Infrastructure mismatch is PRIMARY mortality driver
 *
 * @see research/climate-mortality-biosphere-multiparadigm-framework_20251028.md (Section 1.2)
 */

import { GameState } from '@/types/game';
import {
  ExtremeWeatherSystem,
  StormEvent,
  RegionalStormVulnerability,
  STORM_CONSTANTS,
  REGIONAL_VULNERABILITIES
} from '@/types/extremeWeather';
import { addSimulationEvent } from './utils/eventLogger';
import { addMortalityRisk } from './bayesianMortality';
import { assertFinite, assertInRange, assertProbability } from './utils/assertions';
import { getGlobalTemperatureIncrease } from './planetaryBoundaries';

/**
 * Initialize extreme weather system with 2025 baseline
 *
 * Research: NOAA/EPA (2024) - historical storm data 1980-2010
 */
export function initializeExtremeWeatherSystem(): ExtremeWeatherSystem {
  // 2025 baseline: 7 of 9 planetary boundaries breached
  // Climate already 1.2°C above pre-industrial
  // Storm distribution already shifting toward higher categories

  const globalTempIncrease = 1.2; // °C above 1850-1900 baseline (IPCC AR6)

  // Calculate baseline category distribution with current warming
  const baselineCount = STORM_CONSTANTS.BASELINE_ANNUAL_STORMS;
  const categoryDistribution = calculateCategoryDistribution(globalTempIncrease, baselineCount);

  return {
    annualStormCount: baselineCount,
    categoryDistribution,
    regionalVulnerability: [...REGIONAL_VULNERABILITIES], // Deep copy
    stormEvents: [],
    totalAnnualMortality: 0,
  };
}

/**
 * Calculate category distribution based on climate warming
 *
 * Research: Knutson et al. (2023) - category-specific frequency changes
 * Key finding: FEWER Cat 1-2 (-5%/°C), STABLE Cat 3 (0%/°C), MORE Cat 4-5 (+10%/°C)
 *
 * @param globalTempIncrease - °C above 1850-1900 baseline
 * @param totalStorms - Total number of storms (decreases overall)
 * @returns [Cat1, Cat2, Cat3, Cat4, Cat5] counts
 */
export function calculateCategoryDistribution(
  globalTempIncrease: number,
  totalStorms: number
): [number, number, number, number, number] {
  // Validate inputs
  const tempIncrease = assertInRange(globalTempIncrease, 0, 6, {
    location: 'calculateCategoryDistribution',
    valueName: 'globalTempIncrease',
    month: 0
  });

  const stormCount = assertFinite(totalStorms, {
    location: 'calculateCategoryDistribution',
    valueName: 'totalStorms'
  });

  // Baseline proportions (1980-2010)
  const baseline = STORM_CONSTANTS.BASELINE_CATEGORY_PROPORTIONS;

  // Frequency scaling per degree warming
  const cat1_2_scaling = 1.0 + (STORM_CONSTANTS.CAT_1_2_FREQUENCY_CHANGE * tempIncrease);
  const cat3_scaling = 1.0 + (STORM_CONSTANTS.CAT_3_FREQUENCY_CHANGE * tempIncrease);
  const cat4_5_scaling = 1.0 + (STORM_CONSTANTS.CAT_4_5_FREQUENCY_CHANGE * tempIncrease);

  // Apply scaling to baseline proportions
  const scaledProportions = [
    baseline[0] * cat1_2_scaling,  // Cat 1
    baseline[1] * cat1_2_scaling,  // Cat 2
    baseline[2] * cat3_scaling,    // Cat 3
    baseline[3] * cat4_5_scaling,  // Cat 4
    baseline[4] * cat4_5_scaling,  // Cat 5
  ];

  // Normalize so proportions sum to 1.0
  const total = scaledProportions.reduce((sum, p) => sum + p, 0);
  const normalized = scaledProportions.map(p => p / total);

  // Convert to counts
  const counts: [number, number, number, number, number] = [
    Math.round(normalized[0] * stormCount),
    Math.round(normalized[1] * stormCount),
    Math.round(normalized[2] * stormCount),
    Math.round(normalized[3] * stormCount),
    Math.round(normalized[4] * stormCount),
  ];

  // Adjust for rounding errors (ensure sum equals totalStorms)
  const countSum = counts.reduce((sum, c) => sum + c, 0);
  const diff = stormCount - countSum;
  if (diff !== 0) {
    // Add/subtract from most common category (Cat 1)
    counts[0] += diff;
  }

  // Validate output
  const finalSum = counts.reduce((sum, c) => sum + c, 0);
  if (finalSum !== stormCount) {
    throw new Error(
      `🌀❌ Category distribution sum mismatch: expected ${stormCount}, got ${finalSum}`
    );
  }

  return counts;
}

/**
 * Calculate infrastructure mismatch multiplier
 *
 * ✅ CONCEPT VERIFIED - Raymond et al. (2020) provides qualitative support:
 * - Persian Gulf: High wet-bulb temps, LOW mortality (widespread A/C infrastructure)
 * - Northeast India, West Africa: Lower temps, HIGH mortality (scarce cooling infrastructure)
 * - 2003 Europe: 28°C wet-bulb, 70,000+ deaths (infrastructure unprepared)
 *
 * ⚠️ QUANTIFICATION DERIVED - Not from Raymond et al. (2020):
 * - "Up to 3x" multiplier is modeling assumption (not empirically validated)
 * - Linear gap formula `1.0 + (gap/need) * 2.0` is modeling choice
 * - Uncertainty: ±50% (concept supported, rates unvalidated)
 *
 * Research: Raymond et al. (2020) - regional examples demonstrate infrastructure impact
 * Implementation: Derived quantification pending empirical validation
 *
 * @param capacity - [0, 1] Existing infrastructure capacity
 * @param need - [0, 1] Current need based on storm intensity
 * @returns [1.0, 3.0] Mortality multiplier (DERIVED estimate, not empirically validated)
 */
export function infrastructureMismatchMultiplier(
  capacity: number,
  need: number
): number {
  // Validate inputs are probabilities
  const validatedCapacity = assertProbability(capacity, {
    location: 'infrastructureMismatchMultiplier',
    valueName: 'capacity'
  });

  const validatedNeed = assertProbability(need, {
    location: 'infrastructureMismatchMultiplier',
    valueName: 'need'
  });

  // Calculate gap (0 = perfect match, 1 = zero infrastructure)
  const gap = Math.max(0, validatedNeed - validatedCapacity);

  // Multiplier: 1.0× (no gap) → 3.0× (complete gap)
  // ⚠️ TIER 2 SILVER - Within empirical range (2-10×), using 3× mid-range
  // See STORM_CONSTANTS.INFRASTRUCTURE_MULTIPLIER_MAX documentation for empirical evidence
  const multiplier = 1.0 + (gap * (STORM_CONSTANTS.INFRASTRUCTURE_MULTIPLIER_MAX - 1.0));

  return assertInRange(multiplier, 1.0, STORM_CONSTANTS.INFRASTRUCTURE_MULTIPLIER_MAX, {
    location: 'infrastructureMismatchMultiplier',
    valueName: 'multiplier',
    month: 0
  });
}

/**
 * Calculate base mortality from single storm event (MDF framework)
 *
 * Research: Mendelsohn et al. (2012) - mortality scales exponentially with category
 * MDF = Magnitude × Duration × Frequency
 *
 * @param category - Storm category 1-5
 * @param population - Population exposed (millions)
 * @param duration - Storm duration (days)
 * @param vulnerability - Regional vulnerability factors
 * @returns Base mortality (deaths, before infrastructure multiplier)
 */
export function calculateBaseMortality(
  category: 1 | 2 | 3 | 4 | 5,
  population: number,
  duration: number,
  vulnerability: RegionalStormVulnerability
): number {
  // Validate inputs
  const validatedPop = assertFinite(population, {
    location: 'calculateBaseMortality',
    valueName: 'population'
  });

  const validatedDuration = assertInRange(duration, 1, 30, {
    location: 'calculateBaseMortality',
    valueName: 'duration',
    month: 0
  });

  // Base mortality rate: 0.001% for Cat 1, scales exponentially
  const baseRatePerMillion = 10; // 10 deaths per million for Cat 1, 1-day storm

  // Intensity multiplier (exponential with category)
  const intensityMultiplier = STORM_CONSTANTS.INTENSITY_MULTIPLIERS[category - 1];

  // Duration scaling (linear)
  const durationMultiplier = validatedDuration / STORM_CONSTANTS.AVG_DURATION_DAYS;

  // Vulnerability multiplier (regional factors)
  const vulnerabilityMultiplier = vulnerability.vulnerabilityMultiplier;

  // Calculate base mortality
  const baseMortality =
    (validatedPop * 1_000_000) *           // Convert millions to individuals
    (baseRatePerMillion / 1_000_000) *     // Base rate
    intensityMultiplier *                   // Category scaling
    durationMultiplier *                    // Duration scaling
    vulnerabilityMultiplier;                // Regional vulnerability

  return assertFinite(baseMortality, {
    location: 'calculateBaseMortality',
    valueName: 'baseMortality',
    month: 0
  });
}

/**
 * Calculate total mortality from storm event including infrastructure mismatch
 *
 * @param event - Storm event details
 * @param vulnerability - Regional vulnerability
 * @returns Total mortality (deaths)
 */
export function calculateStormMortality(
  event: StormEvent,
  vulnerability: RegionalStormVulnerability
): number {
  // Calculate base mortality
  const baseMortality = calculateBaseMortality(
    event.category,
    event.population,
    event.durationDays,
    vulnerability
  );

  // Calculate infrastructure need based on category
  // Cat 5 requires very high infrastructure (0.9), Cat 1 requires less (0.3)
  const infrastructureNeed = 0.2 + (event.category / 5) * 0.7;

  // Apply infrastructure mismatch multiplier
  const infrastructureMultiplier = infrastructureMismatchMultiplier(
    vulnerability.infrastructureCapacity,
    infrastructureNeed
  );

  // Total mortality
  const totalMortality = baseMortality * infrastructureMultiplier;

  return assertFinite(totalMortality, {
    location: 'calculateStormMortality',
    valueName: 'totalMortality',
    month: 0
  });
}

/**
 * Generate storm event for a region
 *
 * @param region - Regional vulnerability data
 * @param category - Storm category
 * @param month - Current simulation month
 * @param rng - Deterministic RNG
 * @returns Storm event
 */
export function generateStormEvent(
  region: RegionalStormVulnerability,
  category: 1 | 2 | 3 | 4 | 5,
  month: number,
  rng: () => number
): StormEvent {
  // Generate duration (3-10 days, average 5)
  const durationRange = STORM_CONSTANTS.MAX_DURATION_DAYS - STORM_CONSTANTS.MIN_DURATION_DAYS;
  const durationDays = Math.floor(
    STORM_CONSTANTS.MIN_DURATION_DAYS + (rng() * durationRange)
  );

  // Population exposed (varies by region and storm track)
  // Typically 10-50% of coastal population
  const exposureFraction = 0.1 + (rng() * 0.4);
  const population = region.coastalPopulation * exposureFraction;

  // Infrastructure vulnerability (higher for stronger storms)
  const infrastructureVulnerability = 1.0 - region.infrastructureCapacity;

  // Calculate mortality
  const baseMortality = calculateBaseMortality(
    category,
    population,
    durationDays,
    region
  );

  const totalMortality = calculateStormMortality(
    {
      category,
      durationDays,
      region: region.region,
      population,
      infrastructureVulnerability,
      baseMortality: 0, // Will be set below
      totalMortality: 0, // Will be set below
      month
    },
    region
  );

  return {
    category,
    durationDays,
    region: region.region,
    population,
    infrastructureVulnerability,
    baseMortality,
    totalMortality,
    month
  };
}

/**
 * Update extreme weather events for current month
 *
 * Runs stochastically to generate storm events based on climate state.
 * Integrates with Bayesian mortality system.
 *
 * @param state - Game state (mutated)
 * @param rng - Deterministic RNG function
 */
export function updateExtremeWeatherEvents(
  state: GameState,
  rng: () => number
): void {
  if (!state.extremeWeatherSystem) {
    state.extremeWeatherSystem = initializeExtremeWeatherSystem();
  }

  const system = state.extremeWeatherSystem;

  // Reset annual tracking at January
  if (state.currentMonth % 12 === 0) {
    system.stormEvents = [];
    system.totalAnnualMortality = 0;
  }

  // Get current global temperature increase
  // Use getter function to decouple from internal planetary boundaries structure
  const globalTempIncrease = getGlobalTemperatureIncrease(state);

  // Update annual storm count and category distribution
  // CONSERVATIVE PARAMETER (Nov 6, 2025): -20% per °C (middle of -6% to -34% range)
  // Research: Knutson et al. (2020, 2023) - FEWER storms overall, MORE Cat 4-5
  const frequencyScaling = 1.0 + (STORM_CONSTANTS.OVERALL_FREQUENCY_CHANGE * globalTempIncrease);
  const adjustedStormCount = Math.round(
    STORM_CONSTANTS.BASELINE_ANNUAL_STORMS * Math.max(0.5, frequencyScaling) // Floor at 50% of baseline
  );

  system.annualStormCount = adjustedStormCount;
  system.categoryDistribution = calculateCategoryDistribution(
    globalTempIncrease,
    adjustedStormCount
  );

  // Monthly storm probability (storms are seasonal, but model as Poisson process)
  // Average: adjustedStormCount / 12 storms per month
  const avgMonthlyStorms = adjustedStormCount / 12;
  const stormProbability = Math.min(1.0, avgMonthlyStorms / 10); // Scale to reasonable probability

  // Check if storm occurs this month
  if (rng() >= stormProbability) {
    return; // No storm this month
  }

  // Generate storm: randomly select category based on distribution
  const categoryRoll = rng();
  let cumulativeProbability = 0;
  let selectedCategory: 1 | 2 | 3 | 4 | 5 = 1;

  for (let cat = 1; cat <= 5; cat++) {
    const categoryCount = system.categoryDistribution[cat - 1];
    const categoryProbability = categoryCount / adjustedStormCount;
    cumulativeProbability += categoryProbability;

    if (categoryRoll <= cumulativeProbability) {
      selectedCategory = cat as 1 | 2 | 3 | 4 | 5;
      break;
    }
  }

  // Select random region (weighted by baseline frequency)
  const totalBaselineFrequency = system.regionalVulnerability.reduce(
    (sum, r) => sum + r.baselineStormFrequency,
    0
  );

  const regionRoll = rng() * totalBaselineFrequency;
  let cumulativeFrequency = 0;
  let selectedRegion = system.regionalVulnerability[0];

  for (const region of system.regionalVulnerability) {
    cumulativeFrequency += region.baselineStormFrequency;
    if (regionRoll <= cumulativeFrequency) {
      selectedRegion = region;
      break;
    }
  }

  // Generate storm event
  const stormEvent = generateStormEvent(
    selectedRegion,
    selectedCategory,
    state.currentMonth,
    rng
  );

  // Add to tracking
  system.stormEvents.push(stormEvent);
  system.totalAnnualMortality += stormEvent.totalMortality;

  // Integrate with Bayesian mortality system
  // Find affected population (use human population system)
  const humanPop = state.humanPopulationSystem;
  const affectedPopulation = humanPop?.population; // .population is in billions

  if (affectedPopulation && stormEvent.totalMortality > 0) {
    const mortalityRisk = stormEvent.totalMortality / (humanPop.population * 1_000_000_000);

    // Note: Using dummy population object since we don't have proper population objects yet
    // This integrates with Bayesian mortality tracking
    addMortalityRisk({count: humanPop.population * 1_000_000_000, type: 'human'} as any, {
      type: 'disaster', // MortalityRiskType: disaster (climate events)
      baseRisk: mortalityRisk,
      proximate: 'disasters', // ProximateCause: disasters (storms, floods)
      root: 'climate', // RootCause: climate (anthropogenic climate change)
      confidence: 'HIGH',
      scope: 'REGIONAL',
      month: state.currentMonth,
      description: `🌀 Cat ${stormEvent.category} storm in ${stormEvent.region}, ${Math.round(stormEvent.population * 1_000_000).toLocaleString()} exposed, ${Math.round(stormEvent.totalMortality).toLocaleString()} deaths`
    });

    // Log significant events (Cat 4-5 or high mortality)
    if (stormEvent.category >= 4 || stormEvent.totalMortality >= 1000) {
      addSimulationEvent(state, {
        type: 'crisis',
        severity: 'critical',
        agent: 'environmental',
        title: `🌀💥 MAJOR STORM: Cat ${stormEvent.category} hits ${stormEvent.region}`,
        description: `Category ${stormEvent.category} storm, ${Math.round(stormEvent.population * 1_000_000).toLocaleString()} exposed, ${Math.round(stormEvent.totalMortality).toLocaleString()} deaths`,
        effects: {
          category: stormEvent.category,
          region: stormEvent.region,
          population: stormEvent.population,
          mortality: Math.round(stormEvent.totalMortality),
          duration: stormEvent.durationDays,
          infrastructureGap: 1.0 - selectedRegion.infrastructureCapacity
        }
      });
    }
  }
}
