/**
 * Regional QoL Variation & Distribution Metrics
 *
 * Tracks regional inequality to detect dystopian scenarios where
 * aggregate metrics look fine but specific populations suffer.
 *
 * Performance optimization: Uses regional cache to eliminate O(n) array scans.
 *
 * Research basis:
 * - Wilkinson & Pickett (2009): Gini >0.45 = social instability
 * - Rawls: Justice requires maximizing the welfare of the worst-off
 * - "Two worlds" dystopia: Some thrive while others suffer
 */

import type { GameState, QualityOfLifeSystems } from '@/types/game';
import type { RegionalCache } from './cache/regionalCache';
import { getCachedRegions } from './cache/regionalCache';

/**
 * Calculate QoL inequality across regions
 *
 * Global averages hide massive suffering - some regions in famine while others abundant.
 * This tracks the variance in QoL across crisis-affected vs. non-affected regions.
 */
export function calculateDistributionMetrics(
  state: GameState,
  survivalFundamentals: QualityOfLifeSystems['survivalFundamentals'],
  basicQoL: {
    materialAbundance: number;
    energyAvailability: number;
    physicalSafety: number;
    mentalHealth: number;
    healthcareQuality: number;
  },
  cache: RegionalCache | null
): QualityOfLifeSystems['distribution'] {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const pop = state.humanPopulationSystem;

  // Get or build regional cache (performance optimization)
  const regionalCache = getCachedRegions(state, cache);

  // Calculate QoL for each region
  const regionalQoLs: number[] = [];
  let totalCrisisAffected = 0;

  if (regionalCache.regionsByName.size > 0) {
    // Use cached regional data (O(1) lookups)
    for (const [regionName, region] of regionalCache.regionsByName) {
      const regionQoL = calculateRegionalQoL(
        state,
        region,
        survivalFundamentals,
        basicQoL
      );

      regionalQoLs.push(Math.max(0, Math.min(2, regionQoL.qol)));

      if (regionQoL.inCrisisZone) {
        totalCrisisAffected += region.population;
      }
    }
  } else {
    // Fallback: Use simple crisis-based approximation
    const fallbackData = calculateFallbackDistribution(
      state,
      survivalFundamentals,
      basicQoL
    );
    regionalQoLs.push(...fallbackData.regionalQoLs);
    totalCrisisAffected = fallbackData.crisisAffectedPopulation;
  }

  // === STATISTICAL ANALYSIS ===
  regionalQoLs.sort((a, b) => a - b);

  const worstRegion = regionalQoLs[0] || 0;
  const bestRegion = regionalQoLs[regionalQoLs.length - 1] || 0;
  const medianRegion = regionalQoLs[Math.floor(regionalQoLs.length / 2)] || 0;

  // Calculate Gini coefficient (measure of inequality)
  const gini = calculateGiniCoefficient(regionalQoLs);

  // Calculate variance (guard against empty arrays)
  const mean = regionalQoLs.length > 0
    ? regionalQoLs.reduce((a, b) => a + b, 0) / regionalQoLs.length
    : 0;
  const variance = regionalQoLs.length > 0
    ? regionalQoLs.reduce((sum, qol) => sum + Math.pow(qol - mean, 2), 0) / regionalQoLs.length
    : 0;

  // Crisis-affected fraction (guard against division by zero in extinction scenarios)
  const crisisAffectedFraction = pop.population > 0
    ? Math.min(1.0, totalCrisisAffected / pop.population)
    : 0;

  // === DYSTOPIA FLAGS ===

  // Inequality dystopia: Top regions thriving while bottom suffering
  // Research: This is "Elysium" scenario - rich paradise + poor hell
  const isDystopicInequality = (
    gini > 0.45 &&                    // High inequality (Wilkinson threshold)
    bestRegion > 0.7 &&               // Top regions doing great
    worstRegion < 0.3 &&              // Bottom regions suffering
    bestRegion - worstRegion > 0.5    // Large gap
  );

  // Regional dystopia: Significant population in crisis while others fine
  // Research: >30% in crisis = systemic failure even if averages OK
  const isRegionalDystopia = (
    crisisAffectedFraction > 0.30 &&  // >30% in crisis
    bestRegion - worstRegion > 0.4 &&  // Significant gap
    bestRegion > 0.6                   // Some regions doing well
  );

  // Final NaN guards (safety check)
  const safeGini = isNaN(gini) ? 0.38 : gini;
  const safeVariance = isNaN(variance) ? 0.08 : variance;
  const safeCrisisAffected = isNaN(crisisAffectedFraction) ? 0 : crisisAffectedFraction;
  const safeWorstRegion = isNaN(worstRegion) ? 0.35 : worstRegion;
  const safeBestRegion = isNaN(bestRegion) ? 0.95 : bestRegion;
  const safeMedianRegion = isNaN(medianRegion) ? 0.65 : medianRegion;

  return {
    globalGini: safeGini,
    regionalVariance: safeVariance,
    crisisAffectedFraction: safeCrisisAffected,
    worstRegionQoL: safeWorstRegion,
    bestRegionQoL: safeBestRegion,
    medianRegionQoL: safeMedianRegion,
    isDystopicInequality,
    isRegionalDystopia
  };
}

/**
 * Calculate QoL for a specific region
 *
 * Applies region-specific modifiers based on crisis exposure
 */
function calculateRegionalQoL(
  state: GameState,
  region: {
    name: string;
    population: number;
    freshwaterStress: number;
    droughtAffected: boolean;
    resourceVulnerability: number;
    refugeesHosted: number;
    conflictRisk: number;
    populationStress: number;
  },
  survivalFundamentals: QualityOfLifeSystems['survivalFundamentals'],
  basicQoL: {
    materialAbundance: number;
    energyAvailability: number;
    physicalSafety: number;
    mentalHealth: number;
    healthcareQuality: number;
  }
): { qol: number; inCrisisZone: boolean } {
  // === SURVIVAL FUNDAMENTALS (weighted heavily) ===
  let regionFoodSecurity = survivalFundamentals.foodSecurity;
  let regionWaterSecurity = survivalFundamentals.waterSecurity;
  let regionShelter = survivalFundamentals.shelterSecurity;

  // Water stress affects specific regions more
  if (region.freshwaterStress > 0.7) {
    regionWaterSecurity *= (1 - region.freshwaterStress * 0.5);
    regionFoodSecurity *= (1 - region.freshwaterStress * 0.3); // Agriculture needs water
  }

  // Drought-affected regions
  if (region.droughtAffected) {
    regionWaterSecurity *= 0.4; // 60% reduction in drought zones
    regionFoodSecurity *= 0.5; // 50% reduction
  }

  // Resource vulnerability (food import dependency)
  if (region.resourceVulnerability > 0.7) {
    regionFoodSecurity *= (1 - region.resourceVulnerability * 0.4);
  }

  // Refugee hosting strains infrastructure
  if (region.refugeesHosted > 0) {
    const refugeeStrain = Math.min(0.4, region.refugeesHosted / region.population);
    regionShelter -= refugeeStrain;
  }

  // Thermal habitability varies by latitude
  // Tropical regions hit harder by temperature rise
  const isTropical = region.name.includes('Africa') ||
                     region.name.includes('South Asia') ||
                     region.name.includes('Southeast Asia') ||
                     region.name.includes('Middle East');
  let regionHabitability = survivalFundamentals.thermalHabitability;
  if (isTropical) {
    const tempAnomaly = state.resourceEconomy.co2.temperatureAnomaly;
    if (tempAnomaly > 1.5) {
      // Tropical regions become uninhabitable faster
      regionHabitability *= Math.max(0.3, 1 - (tempAnomaly - 1.5) * 0.25);
    }
  }

  // Survival fundamentals contribution (40% weight)
  const survivalScore = (
    regionFoodSecurity * 0.30 +
    regionWaterSecurity * 0.30 +
    regionHabitability * 0.25 +
    regionShelter * 0.15
  );

  // === BASIC NEEDS (30% weight) ===
  let regionMaterial = basicQoL.materialAbundance;
  let regionEnergy = basicQoL.energyAvailability;
  let regionSafety = basicQoL.physicalSafety;

  // Conflict-affected regions have low safety
  if (region.conflictRisk > 0.5) {
    regionSafety *= (1 - region.conflictRisk * 0.6);
  }

  // Population stress reduces material abundance
  if (region.populationStress > 0.7) {
    regionMaterial *= (1 - region.populationStress * 0.3);
    regionEnergy *= (1 - region.populationStress * 0.2);
  }

  const basicNeedsScore = (
    regionMaterial * 0.4 +
    regionEnergy * 0.3 +
    regionSafety * 0.3
  );

  // === HEALTH & WELLBEING (30% weight) ===
  let regionHealth = basicQoL.healthcareQuality;
  let regionMentalHealth = basicQoL.mentalHealth;

  // Crisis zones have worse mental health
  const inCrisisZone = region.droughtAffected ||
                       region.conflictRisk > 0.5 ||
                       region.populationStress > 0.7;
  if (inCrisisZone) {
    regionMentalHealth *= 0.6; // 40% reduction
  }

  // Healthcare capacity varies by development
  // Assume wealthier regions have 1.2x capacity, poorer 0.8x
  const isWealthy = region.name.includes('North America') ||
                   region.name.includes('Europe') ||
                   region.name.includes('East Asia');
  regionHealth *= isWealthy ? 1.2 : 0.8;

  const healthScore = (
    regionHealth * 0.6 +
    regionMentalHealth * 0.4
  );

  // === AGGREGATE REGION QOL ===
  const regionQoL = (
    survivalScore * 0.40 +
    basicNeedsScore * 0.30 +
    healthScore * 0.30
  );

  return {
    qol: regionQoL,
    inCrisisZone
  };
}

/**
 * Fallback distribution calculation when regional data unavailable
 *
 * Creates simplified distribution: crisis zones vs safe zones
 */
function calculateFallbackDistribution(
  state: GameState,
  survivalFundamentals: QualityOfLifeSystems['survivalFundamentals'],
  basicQoL: {
    materialAbundance: number;
    energyAvailability: number;
    physicalSafety: number;
    mentalHealth: number;
    healthcareQuality: number;
  }
): { regionalQoLs: number[]; crisisAffectedPopulation: number } {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const pop = state.humanPopulationSystem;

  const avgQoL = (
    survivalFundamentals.foodSecurity * 0.15 +
    survivalFundamentals.waterSecurity * 0.15 +
    survivalFundamentals.thermalHabitability * 0.10 +
    basicQoL.materialAbundance * 0.15 +
    basicQoL.energyAvailability * 0.10 +
    basicQoL.physicalSafety * 0.10 +
    basicQoL.mentalHealth * 0.10 +
    basicQoL.healthcareQuality * 0.15
  );

  // Estimate crisis-affected vs non-affected populations
  let crisisAffected = 0;
  if (env.resourceCrisisActive) crisisAffected += 0.25;
  if (env.climateCatastropheActive) crisisAffected += 0.15;
  if (env.ecosystemCrisisActive) crisisAffected += 0.10;
  if (social.meaningCollapseActive) crisisAffected += 0.30;
  if (social.socialUnrestActive) crisisAffected += 0.20;
  crisisAffected = Math.min(1.0, crisisAffected);

  const crisisAffectedPopulation = crisisAffected * pop.population;

  // Create simplified distribution: crisis zones vs safe zones
  const crisisQoL = avgQoL * 0.3; // 70% reduction in crisis zones
  const safeQoL = avgQoL * 1.2; // 20% boost in safe zones

  // Add regions proportional to population split
  const regionalQoLs: number[] = [];
  const numCrisisRegions = Math.ceil(crisisAffected * 10);
  const numSafeRegions = 10 - numCrisisRegions;

  for (let i = 0; i < numCrisisRegions; i++) {
    regionalQoLs.push(crisisQoL * (0.8 + Math.random() * 0.4)); // Some variation
  }
  for (let i = 0; i < numSafeRegions; i++) {
    regionalQoLs.push(safeQoL * (0.8 + Math.random() * 0.4));
  }

  return { regionalQoLs, crisisAffectedPopulation };
}

/**
 * Calculate Gini coefficient for inequality measurement
 *
 * Research basis:
 * - Gini = 0: Perfect equality (everyone has same QoL)
 * - Gini = 1: Perfect inequality (one person has all QoL)
 * - Gini >0.40: High inequality (problematic in democracies)
 * - Gini >0.50: Extreme inequality (typically authoritarian states)
 */
export function calculateGiniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const n = sortedValues.length;
  const mean = sortedValues.reduce((a, b) => a + b, 0) / n;

  if (mean === 0) return 0; // Avoid division by zero

  let sumOfDifferences = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumOfDifferences += Math.abs(sortedValues[i] - sortedValues[j]);
    }
  }

  const gini = sumOfDifferences / (2 * n * n * mean);
  return Math.min(1.0, Math.max(0, gini));
}

/**
 * DEPRECATED: Legacy regional inequality calculation
 *
 * Kept for backward compatibility. Use calculateDistributionMetrics instead.
 */
export function calculateRegionalInequality(
  state: GameState,
  avgQoL: {
    materialAbundance: number;
    energyAvailability: number;
    physicalSafety: number;
    mentalHealth: number;
    healthcareQuality: number;
  }
): {
  giniCoefficient: number;
  topRegionQoL: number;
  bottomRegionQoL: number;
  qolGap: number;
  crisisAffectedPopulation: number;
} {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const pop = state.humanPopulationSystem;
  const refugees = state.refugeeCrisisSystem;

  // Estimate crisis-affected population
  let crisisAffectedPopulation = 0;

  // Environmental crises affect specific regions
  if (env.resourceCrisisActive) crisisAffectedPopulation += 0.25;
  if (env.climateCatastropheActive) crisisAffectedPopulation += 0.15;
  if (env.ecosystemCrisisActive) crisisAffectedPopulation += 0.10;

  // Social crises affect specific demographics
  if (social.meaningCollapseActive) crisisAffectedPopulation += 0.30;
  if (social.socialUnrestActive) crisisAffectedPopulation += 0.20;

  // Refugees are definitely crisis-affected
  if (refugees && refugees.activeCrises) {
    const refugeePopulation = Object.values(refugees.activeCrises)
      .reduce((sum, crisis) => sum + crisis.totalFled, 0);
    crisisAffectedPopulation += (refugeePopulation / 1000) / pop.population; // millions to billions
  }

  // Cap at 100%
  crisisAffectedPopulation = Math.min(1.0, crisisAffectedPopulation);

  // Calculate bottom region QoL (crisis-affected)
  const crisisMultiplier = 0.3; // 70% reduction in crisis zones
  const bottomRegionQoL = (
    avgQoL.materialAbundance * crisisMultiplier * 0.3 +
    avgQoL.energyAvailability * crisisMultiplier * 0.3 +
    avgQoL.physicalSafety * crisisMultiplier * 0.2 +
    avgQoL.mentalHealth * crisisMultiplier * 0.1 +
    avgQoL.healthcareQuality * crisisMultiplier * 0.1
  );

  // Calculate top region QoL (non-affected or benefiting)
  const benefitMultiplier = crisisAffectedPopulation > 0.3 ? 1.3 : 1.1;
  const topRegionQoL = (
    avgQoL.materialAbundance * benefitMultiplier * 0.3 +
    avgQoL.energyAvailability * benefitMultiplier * 0.3 +
    avgQoL.physicalSafety * Math.min(1, avgQoL.physicalSafety * 1.2) * 0.2 +
    avgQoL.mentalHealth * Math.min(1, avgQoL.mentalHealth * 1.1) * 0.1 +
    avgQoL.healthcareQuality * Math.min(1, avgQoL.healthcareQuality * 1.2) * 0.1
  );

  const qolGap = topRegionQoL - bottomRegionQoL;

  // Calculate Gini coefficient
  const giniCoefficient = Math.min(1.0,
    qolGap * 0.5 + // Gap contribution
    crisisAffectedPopulation * 0.3 // Population affected contribution
  );

  return {
    giniCoefficient,
    topRegionQoL,
    bottomRegionQoL,
    qolGap,
    crisisAffectedPopulation
  };
}
