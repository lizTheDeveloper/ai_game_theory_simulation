/**
 * Quality of Life Helper Functions
 *
 * Calculate aggregate tier scores from multi-dimensional QoL system
 * for backward compatibility with scripts and logging
 */

import { QualityOfLifeSystems } from '../types/quality-of-life';

/**
 * Calculate Survival Tier (Tier 0) aggregate
 * Average of survival fundamentals
 */
export function calculateSurvivalTier(qol: QualityOfLifeSystems): number {
  const { foodSecurity, waterSecurity, thermalHabitability, shelterSecurity } = qol.survivalFundamentals;
  return (foodSecurity + waterSecurity + thermalHabitability + shelterSecurity) / 4;
}

/**
 * Calculate Material Tier (Tier 1) aggregate
 * Average of material needs
 */
export function calculateMaterialTier(qol: QualityOfLifeSystems): number {
  return (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3;
}

/**
 * Calculate Psychological Tier (Tier 2) aggregate
 * Average of psychological needs
 */
export function calculatePsychologicalTier(qol: QualityOfLifeSystems): number {
  return (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4;
}

/**
 * Calculate Social Tier (Tier 3) aggregate
 * Average of social needs
 */
export function calculateSocialTier(qol: QualityOfLifeSystems): number {
  return (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4;
}

/**
 * Calculate Health Tier (Tier 4) aggregate
 * Average of health and longevity
 */
export function calculateHealthTier(qol: QualityOfLifeSystems): number {
  return (qol.healthcareQuality + qol.longevityGains + (1 - qol.diseasesBurden)) / 3;
}

/**
 * Calculate Environmental Tier (Tier 5) aggregate
 * Average of environmental quality (pollution inverted)
 */
export function calculateEnvironmentalTier(qol: QualityOfLifeSystems): number {
  return (qol.ecosystemHealth + qol.climateStability + (1 - qol.pollutionLevel)) / 3;
}

/**
 * Calculate all tier aggregates
 */
export function calculateAllTiers(qol: QualityOfLifeSystems) {
  return {
    survivalTier: calculateSurvivalTier(qol),
    materialTier: calculateMaterialTier(qol),
    psychologicalTier: calculatePsychologicalTier(qol),
    socialTier: calculateSocialTier(qol),
    healthTier: calculateHealthTier(qol),
    environmentalTier: calculateEnvironmentalTier(qol),
  };
}
