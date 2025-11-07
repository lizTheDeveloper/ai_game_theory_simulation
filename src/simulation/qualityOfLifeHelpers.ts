/**
 * Quality of Life Helper Functions
 *
 * Calculate aggregate tier scores from multi-dimensional QoL system
 * for backward compatibility with scripts and logging
 */

import { QualityOfLifeSystems } from '../types/quality-of-life';
import { assertFinite } from './utils/assertions';

/**
 * Calculate Survival Tier (Tier 0) aggregate
 * Average of survival fundamentals
 */
export function calculateSurvivalTier(qol: QualityOfLifeSystems): number {
  const { foodSecurity, waterSecurity, thermalHabitability, shelterSecurity } = qol.survivalFundamentals;
  return assertFinite(
    (foodSecurity + waterSecurity + thermalHabitability + shelterSecurity) / 4,
    {
      location: 'calculateSurvivalTier',
      valueName: 'survivalTier',
      additionalInfo: { foodSecurity, waterSecurity, thermalHabitability, shelterSecurity }
    }
  );
}

/**
 * Calculate Material Tier (Tier 1) aggregate
 * Average of material needs
 */
export function calculateMaterialTier(qol: QualityOfLifeSystems): number {
  return assertFinite(
    (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3,
    {
      location: 'calculateMaterialTier',
      valueName: 'materialTier',
      additionalInfo: { materialAbundance: qol.materialAbundance, energyAvailability: qol.energyAvailability, physicalSafety: qol.physicalSafety }
    }
  );
}

/**
 * Calculate Psychological Tier (Tier 2) aggregate
 * Average of psychological needs
 */
export function calculatePsychologicalTier(qol: QualityOfLifeSystems): number {
  return assertFinite(
    (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4,
    {
      location: 'calculatePsychologicalTier',
      valueName: 'psychologicalTier',
      additionalInfo: { mentalHealth: qol.mentalHealth, meaningAndPurpose: qol.meaningAndPurpose, socialConnection: qol.socialConnection, autonomy: qol.autonomy }
    }
  );
}

/**
 * Calculate Social Tier (Tier 3) aggregate
 * Average of social needs
 */
export function calculateSocialTier(qol: QualityOfLifeSystems): number {
  return assertFinite(
    (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4,
    {
      location: 'calculateSocialTier',
      valueName: 'socialTier',
      additionalInfo: { politicalFreedom: qol.politicalFreedom, informationIntegrity: qol.informationIntegrity, communityStrength: qol.communityStrength, culturalVitality: qol.culturalVitality }
    }
  );
}

/**
 * Calculate Health Tier (Tier 4) aggregate
 * Average of health and longevity
 */
export function calculateHealthTier(qol: QualityOfLifeSystems): number {
  const inverseDisease = 1 - qol.diseasesBurden;
  return assertFinite(
    (qol.healthcareQuality + qol.longevityGains + inverseDisease) / 3,
    {
      location: 'calculateHealthTier',
      valueName: 'healthTier',
      additionalInfo: { healthcareQuality: qol.healthcareQuality, longevityGains: qol.longevityGains, inverseDisease }
    }
  );
}

/**
 * Calculate Environmental Tier (Tier 5) aggregate
 * Average of environmental quality (pollution inverted)
 */
export function calculateEnvironmentalTier(qol: QualityOfLifeSystems): number {
  const inversePollution = 1 - qol.pollutionLevel;
  return assertFinite(
    (qol.ecosystemHealth + qol.climateStability + inversePollution) / 3,
    {
      location: 'calculateEnvironmentalTier',
      valueName: 'environmentalTier',
      additionalInfo: { ecosystemHealth: qol.ecosystemHealth, climateStability: qol.climateStability, inversePollution }
    }
  );
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
