/**
 * Quality of Life Penalty Calculations
 *
 * Applies penalties from:
 * - Crisis events (environmental, social, resource)
 * - Psychological trauma (mass death events)
 * - Unemployment (economic dislocation)
 * - Population collapse (infrastructure breakdown)
 *
 * Research: These are multiplicative penalties that reduce baseline QoL.
 * They compound when multiple crises occur simultaneously.
 */

import type { GameState } from '@/types/game';

/**
 * Calculate unemployment penalty on material abundance
 *
 * Research: COVID-19 at 14.7% unemployment caused:
 * - +40% food insecurity (USDA 2020: 10.5% → 21%)
 * - +12% homelessness (Eviction Lab 2020)
 * - +30% depression (Kessler et al. 2008)
 *
 * Suggests ~-0.5 multiplier for realistic impact
 * At 54% unemployment: -0.27 penalty → QoL drops from ~78% to ~50% (catastrophic without UBI)
 *
 * @see Kahneman & Deaton (2010) - Income-life satisfaction relationship
 */
export function calculateUnemploymentPenalty(
  unemploymentLevel: number,
  economicStage: number
): number {
  // Post-scarcity: Unemployment becomes freedom (positive)
  if (economicStage >= 3) {
    return unemploymentLevel * 0.1; // Positive contribution
  }

  // Pre-transition: Unemployment is catastrophic
  return unemploymentLevel * -0.5;
}

/**
 * Calculate food security penalty on material abundance
 *
 * Research: 2007-08 food crisis, 2022 Ukraine war food shock
 * Can't have high "material abundance" if people are starving
 */
export function calculateFoodSecurityPenalty(foodSecurity: number): number {
  if (foodSecurity >= 0.7) {
    return 0; // No penalty above threshold
  }

  // Food crisis directly reduces material abundance
  const foodPenalty = (0.7 - foodSecurity) * 1.5; // Up to -1.05 at food = 0
  return foodPenalty;
}

/**
 * Calculate population collapse penalty
 *
 * Research: 95% mortality = infrastructure collapse regardless of AI capability
 * Supply chains broken, distribution networks fail, looting, hoarding
 *
 * CRITICAL FIX: Apply population scaling to ALL stages, not just Stage 4
 */
export function calculatePopulationCollapsePenalty(
  population: number,
  baselinePopulation: number
): number {
  const populationFraction = population / baselinePopulation;

  if (populationFraction >= 0.5) {
    return 1.0; // No penalty above 50% survival
  }

  // 50%+ population loss → severe material scarcity
  const collapseMultiplier = populationFraction < 0.1
    ? 0.1  // < 10% survivors: total collapse
    : 0.1 + (populationFraction * 0.9); // 10-50% survivors: proportional

  return collapseMultiplier;
}

/**
 * Calculate psychological trauma penalty on mental health and social dimensions
 *
 * Research:
 * - Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma
 * - PTSD literature: 40-60% PTSD rates in survivors of mass casualty events
 * - Diamond (2005): >50% mortality leads to institutional breakdown lasting generations
 *
 * Phase 1B Refinement (Oct 17, 2025)
 */
export function calculateTraumaPenalty(traumaLevel: number): {
  mentalHealthPenalty: number;
  socialConnectionPenalty: number;
  communityStrengthPenalty: number;
} {
  if (traumaLevel === 0) {
    return {
      mentalHealthPenalty: 0,
      socialConnectionPenalty: 0,
      communityStrengthPenalty: 0,
    };
  }

  // Non-linear penalty (diminishing at low levels)
  const traumaPenalty = Math.pow(traumaLevel, 1.5);

  return {
    mentalHealthPenalty: traumaPenalty,
    socialConnectionPenalty: traumaPenalty * 0.5,
    communityStrengthPenalty: traumaPenalty * 0.4,
  };
}

/**
 * Calculate institutional trust erosion from trauma
 *
 * Research: Diamond (2005) - institutional breakdown after >50% mortality
 * Mass death events erode trust in institutions (government failed to protect)
 */
export function calculateTraumaInstitutionalErosion(traumaLevel: number): number {
  if (traumaLevel < 0.3) {
    return 0; // No erosion below threshold
  }

  return traumaLevel * 0.3;
}

/**
 * Calculate UBI floor for material abundance
 *
 * Research: Texas/Illinois 2024 pilots showed 6.4% well-being improvement (Kangas et al.)
 * UBI provides graduated floor at all stages, matching empirical evidence
 *
 * Stage-based UBI floors:
 * - Stage 0-2 (pre-transition): Modest safety net (0.55-0.65) - matches pilot data
 * - Stage 3+ (post-scarcity transition): Strong floor (0.75-0.90) - prevents unemployment collapse
 *
 * @see research/policy-interventions-systemic-inequality-validation_20251016.md
 * @see Kangas et al. (2024) - Texas/Illinois UBI pilots: 6.4% life satisfaction improvement
 */
export function calculateUBIFloor(
  economicStage: number,
  hasGenerousUBI: boolean
): number {
  if (economicStage >= 3) {
    // Post-scarcity transition: Strong UBI floor (prevents unemployment from destroying QoL)
    return hasGenerousUBI ? 0.90 : 0.75;
  } else {
    // Pre-transition: Modest UBI floor (matches pilot program evidence)
    // Research: Texas/Illinois pilots at $1000/month improved well-being ~6-8%
    // Starting from baseline material abundance ~0.50-0.60 → floor at 0.55-0.65
    return hasGenerousUBI ? 0.65 : 0.55;
  }
}

/**
 * Calculate UBI mental health benefit
 *
 * Research: Texas/Illinois 2024 pilots showed mental health improvements
 * UBI reduces stress from unemployment/economic insecurity
 */
export function calculateUBIMentalHealthBonus(
  economicStage: number,
  hasGenerousUBI: boolean
): number {
  if (economicStage >= 3) {
    // Post-scarcity transition: Larger mental health benefit
    return hasGenerousUBI ? 0.20 : 0.12;
  } else {
    // Pre-transition: Modest but meaningful mental health improvement
    // Research: UBI pilots reduce anxiety, improve well-being ~6-8%
    return hasGenerousUBI ? 0.10 : 0.06;
  }
}

/**
 * Calculate UBI shelter floor
 *
 * UBI ensures minimum housing security (rental assistance, housing vouchers)
 * Research: UBI pilots reduce homelessness risk ~30-40%
 */
export function calculateUBIShelterFloor(
  economicStage: number,
  hasGenerousUBI: boolean
): number {
  if (economicStage >= 3) {
    // Post-scarcity: Housing becomes much more accessible
    return hasGenerousUBI ? 0.85 : 0.70;
  } else {
    // Pre-transition: Modest shelter floor (rental assistance prevents homelessness)
    return hasGenerousUBI ? 0.68 : 0.60;
  }
}

/**
 * Calculate post-scarcity multipliers for advanced economic stages
 *
 * CRITICAL FIX: Scale abundance by population survival
 * If 95% of people dead, infrastructure collapses even with super-AI
 */
export function calculatePostScarcityMultipliers(
  economicStage: number,
  totalAICapability: number,
  populationFraction: number
): {
  materialBonus: number;
  energyBonus: number;
  infrastructureScaling: number;
} {
  if (economicStage < 4) {
    return {
      materialBonus: 0,
      energyBonus: 0,
      infrastructureScaling: 1.0,
    };
  }

  // Population scaling: 30% minimum (scattered survivors), 100% at full population
  // Below 50% population: Severe infrastructure decay
  // Below 10% population: Near-total collapse
  const infrastructureScaling = populationFraction < 0.5
    ? 0.3 + (populationFraction * 0.7)  // 30-65% scaling (< 4B people)
    : 0.65 + (populationFraction * 0.35); // 65-100% scaling (> 4B people)

  // Full automation → material abundance (scaled by who's alive to benefit)
  const baseBonus = 0.8 * infrastructureScaling;

  // AI capability accelerates abundance (but only if infrastructure intact)
  // Cap AI contribution to prevent infinite values
  const aiContribution = Math.min(1.2, totalAICapability * 0.15);
  const materialBonus = baseBonus + (aiContribution * infrastructureScaling);

  // Renewable/fusion breakthrough assumption at Stage 4
  const energyBaseBonus = 0.6 * infrastructureScaling;

  // AI optimization of energy systems (capped to prevent infinite)
  const aiEnergyBonus = Math.min(1.0, totalAICapability * 0.1);
  const energyBonus = energyBaseBonus + (aiEnergyBonus * infrastructureScaling);

  return {
    materialBonus,
    energyBonus,
    infrastructureScaling,
  };
}
