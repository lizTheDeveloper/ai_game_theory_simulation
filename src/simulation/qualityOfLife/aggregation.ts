/**
 * Quality of Life Aggregation
 *
 * Aggregates multi-dimensional QoL metrics into weighted overall score.
 *
 * Research basis: Multi-dimensional wellbeing frameworks (Sen, Nussbaum)
 * Weights reflect relative importance from empirical studies.
 *
 * Tier weights:
 * - Basic Needs: 30% (material, energy, safety)
 * - Psychological: 25% (mental health, meaning, connection, autonomy)
 * - Social: 20% (freedom, information, community, culture)
 * - Health: 15% (healthcare, longevity, disease burden)
 * - Environmental: 10% (ecosystem, climate, pollution)
 */

import type { QualityOfLifeSystems } from '@/types/game';

/**
 * Calculate weighted quality of life from all component systems
 *
 * This replaces the simple QoL calculation with a nuanced system that tracks:
 * - Basic needs (30%): material, energy, safety
 * - Psychological (25%): mental health, meaning, connection, autonomy
 * - Social (20%): freedom, information, community, culture
 * - Health (15%): healthcare, longevity, disease burden
 * - Environmental (10%): ecosystem, climate, pollution
 *
 * Enables "dark valley" dynamics where some dimensions can drop
 * while others are maintained, allowing recovery trajectories
 *
 * @param systems - The quality of life dimensions to aggregate
 * @returns Weighted quality of life score [0, ~1.5] where 1.0 is "good"
 */
export function calculateQualityOfLife(systems: QualityOfLifeSystems): number {
  // Basic Needs (30% weight)
  const basicNeeds = (
    systems.materialAbundance * 0.4 +    // Food, shelter, goods
    systems.energyAvailability * 0.3 +   // Energy access
    systems.physicalSafety * 0.3          // Safety from violence
  ) * 0.3;

  // Psychological Needs (25% weight)
  const psychological = (
    systems.mentalHealth * 0.3 +         // Mental wellness
    systems.meaningAndPurpose * 0.3 +    // Life satisfaction
    systems.socialConnection * 0.2 +      // Relationships
    systems.autonomy * 0.2                // Self-determination
  ) * 0.25;

  // Social Needs (20% weight)
  const social = (
    systems.politicalFreedom * 0.3 +     // Democracy, rights
    systems.informationIntegrity * 0.3 +  // Truth vs propaganda
    systems.communityStrength * 0.2 +     // Local cohesion
    systems.culturalVitality * 0.2        // Art, creativity
  ) * 0.2;

  // Health and Longevity (15% weight)
  const health = (
    systems.healthcareQuality * 0.4 +    // Medical outcomes
    systems.longevityGains * 0.3 +        // Lifespan increases
    (1 - systems.diseasesBurden) * 0.3    // Low disease burden
  ) * 0.15;

  // Environmental (10% weight)
  const environmental = (
    systems.ecosystemHealth * 0.4 +      // Nature, biodiversity
    systems.climateStability * 0.3 +      // Stable weather
    (1 - systems.pollutionLevel) * 0.3    // Clean air/water
  ) * 0.1;

  return basicNeeds + psychological + social + health + environmental;
}

/**
 * Pre-compute dimension weights (performance optimization)
 *
 * These weights are constants, so we can compute them once
 * instead of recalculating every simulation step.
 */
export const DIMENSION_WEIGHTS = {
  // Basic Needs (30% tier weight)
  materialAbundance: 0.3 * 0.4,     // 12% total
  energyAvailability: 0.3 * 0.3,    // 9% total
  physicalSafety: 0.3 * 0.3,        // 9% total

  // Psychological (25% tier weight)
  mentalHealth: 0.25 * 0.3,         // 7.5% total
  meaningAndPurpose: 0.25 * 0.3,    // 7.5% total
  socialConnection: 0.25 * 0.2,     // 5% total
  autonomy: 0.25 * 0.2,             // 5% total

  // Social (20% tier weight)
  politicalFreedom: 0.2 * 0.3,      // 6% total
  informationIntegrity: 0.2 * 0.3,  // 6% total
  communityStrength: 0.2 * 0.2,     // 4% total
  culturalVitality: 0.2 * 0.2,      // 4% total

  // Health (15% tier weight)
  healthcareQuality: 0.15 * 0.4,    // 6% total
  longevityGains: 0.15 * 0.3,       // 4.5% total
  diseasesBurden: 0.15 * 0.3,       // 4.5% total (inverted)

  // Environmental (10% tier weight)
  ecosystemHealth: 0.1 * 0.4,       // 4% total
  climateStability: 0.1 * 0.3,      // 3% total
  pollutionLevel: 0.1 * 0.3,        // 3% total (inverted)
} as const;

/**
 * Optimized QoL calculation using pre-computed weights
 *
 * Performance optimization: Uses constant weights to avoid repeated multiplication
 */
export function calculateQualityOfLifeOptimized(systems: QualityOfLifeSystems): number {
  return (
    systems.materialAbundance * DIMENSION_WEIGHTS.materialAbundance +
    systems.energyAvailability * DIMENSION_WEIGHTS.energyAvailability +
    systems.physicalSafety * DIMENSION_WEIGHTS.physicalSafety +
    systems.mentalHealth * DIMENSION_WEIGHTS.mentalHealth +
    systems.meaningAndPurpose * DIMENSION_WEIGHTS.meaningAndPurpose +
    systems.socialConnection * DIMENSION_WEIGHTS.socialConnection +
    systems.autonomy * DIMENSION_WEIGHTS.autonomy +
    systems.politicalFreedom * DIMENSION_WEIGHTS.politicalFreedom +
    systems.informationIntegrity * DIMENSION_WEIGHTS.informationIntegrity +
    systems.communityStrength * DIMENSION_WEIGHTS.communityStrength +
    systems.culturalVitality * DIMENSION_WEIGHTS.culturalVitality +
    systems.healthcareQuality * DIMENSION_WEIGHTS.healthcareQuality +
    systems.longevityGains * DIMENSION_WEIGHTS.longevityGains +
    (1 - systems.diseasesBurden) * DIMENSION_WEIGHTS.diseasesBurden +
    systems.ecosystemHealth * DIMENSION_WEIGHTS.ecosystemHealth +
    systems.climateStability * DIMENSION_WEIGHTS.climateStability +
    (1 - systems.pollutionLevel) * DIMENSION_WEIGHTS.pollutionLevel
  );
}

/**
 * Validate QoL systems for NaN/infinity
 *
 * Guards against numerical errors in calculations
 */
export function validateQoLSystems(systems: QualityOfLifeSystems): boolean {
  const values = [
    systems.materialAbundance,
    systems.energyAvailability,
    systems.physicalSafety,
    systems.mentalHealth,
    systems.meaningAndPurpose,
    systems.socialConnection,
    systems.autonomy,
    systems.politicalFreedom,
    systems.informationIntegrity,
    systems.communityStrength,
    systems.culturalVitality,
    systems.healthcareQuality,
    systems.longevityGains,
    systems.diseasesBurden,
    systems.ecosystemHealth,
    systems.climateStability,
    systems.pollutionLevel,
  ];

  return values.every(v => isFinite(v) && !isNaN(v));
}
