/**
 * Core Quality of Life Calculation Engine
 *
 * Orchestrates all QoL subsystems:
 * - Survival fundamentals (food, water, shelter, habitability)
 * - Basic needs (material, energy, safety)
 * - Psychological needs (mental health, meaning, connection, autonomy)
 * - Social needs (freedom, information, community, culture)
 * - Health (healthcare, longevity, disease burden)
 * - Environmental (ecosystem, climate, pollution)
 * - Distribution metrics (regional inequality)
 *
 * Performance optimizations:
 * - Regional cache to eliminate O(n) array scans
 * - Pre-computed dimension weights
 * - Modular structure for easier optimization
 */

import type { GameState, QualityOfLifeSystems } from '@/types/game';
import { getTrustInAI } from '../socialCohesion';
import { calculateSurvivalFundamentals } from './dimensions';
import {
  calculateUnemploymentPenalty,
  calculateFoodSecurityPenalty,
  calculatePopulationCollapsePenalty,
  calculateTraumaPenalty,
  calculateTraumaInstitutionalErosion,
  calculateUBIFloor,
  calculateUBIMentalHealthBonus,
  calculateUBIShelterFloor,
  calculatePostScarcityMultipliers,
} from './penalties';
import { calculateDistributionMetrics, calculateRegionalInequality } from './regional';
import type { RegionalCache } from './cache/regionalCache';

/**
 * Update all quality of life dimensions based on current game state
 *
 * This function calculates how each QoL dimension changes based on:
 * - Economic conditions (unemployment, stage, wealth)
 * - AI impacts (beneficial/harmful actions, capability)
 * - Government policies (legitimacy, control, regulations)
 * - Social dynamics (adaptation, trust, stability)
 *
 * Returns updated QoL systems that can then be aggregated via calculateQualityOfLife()
 *
 * Performance note: This function is called every simulation step, so optimizations matter.
 * Regional cache is passed in to enable memoization across multiple calls in same month.
 */
export function updateQualityOfLifeSystems(
  state: GameState,
  regionalCache: RegionalCache | null = null
): QualityOfLifeSystems {
  const { globalMetrics, society, aiAgents, government, qualityOfLifeSystems: current } = state;

  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  const beneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const harmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const economicStage = globalMetrics.economicTransitionStage;

  // Phase 1.2: Check for UBI (strengthens safety net effects)
  const hasUBI = government.activeRegulations.some(reg => reg.includes('UBI'));
  const ubiVariant = government.structuralChoices.ubiVariant || 'none';
  const hasGenerousUBI = ubiVariant === 'generous';

  // === BASIC NEEDS ===

  // Material abundance: AI capability helps, unemployment hurts, stage matters
  const aiProductionBonus = totalAICapability * avgAlignment * 0.1;
  const unemploymentPenalty = calculateUnemploymentPenalty(society.unemploymentLevel, economicStage);
  const wealthBonus = globalMetrics.wealthDistribution * 0.3;
  let materialAbundance = 0.8 + aiProductionBonus + unemploymentPenalty + wealthBonus;

  // UBI floor
  if (hasUBI) {
    const ubiFloor = calculateUBIFloor(economicStage, hasGenerousUBI);
    materialAbundance = Math.max(materialAbundance, ubiFloor);
  }

  // Food security penalty
  const foodSecurity = state.survivalFundamentals?.foodSecurity ?? 0.7;
  if (foodSecurity < 0.7) {
    const foodPenalty = calculateFoodSecurityPenalty(foodSecurity);
    materialAbundance -= foodPenalty;
  }

  // Post-scarcity multipliers
  const pop = state.humanPopulationSystem;
  const populationFraction = pop.population / pop.baselinePopulation;

  if (economicStage >= 4) {
    const { materialBonus, infrastructureScaling } = calculatePostScarcityMultipliers(
      economicStage,
      totalAICapability,
      populationFraction
    );
    materialAbundance += materialBonus;
    materialAbundance = Math.min(3.0, Math.max(0, materialAbundance));
  } else {
    materialAbundance = Math.max(0, Math.min(2, materialAbundance));
  }

  // Population collapse penalty (all stages)
  if (populationFraction < 0.5) {
    const collapseMultiplier = calculatePopulationCollapsePenalty(pop.population, pop.baselinePopulation);
    materialAbundance *= collapseMultiplier;
  }

  // Energy availability
  let energyAvailability = 0.9 + totalAICapability * 0.05 + economicStage * 0.1;

  if (economicStage >= 4) {
    const { energyBonus, infrastructureScaling } = calculatePostScarcityMultipliers(
      economicStage,
      totalAICapability,
      populationFraction
    );
    energyAvailability += energyBonus;
    energyAvailability = Math.min(3.0, Math.max(0, energyAvailability));
  } else {
    energyAvailability = Math.max(0, Math.min(2, energyAvailability));
  }

  // Energy grid collapse penalty
  if (populationFraction < 0.5) {
    const gridCollapseMultiplier = populationFraction < 0.1
      ? 0.15
      : 0.15 + (populationFraction * 0.85);
    energyAvailability *= gridCollapseMultiplier;
  }

  // Physical safety
  let physicalSafety = globalMetrics.socialStability * 0.8 + government.legitimacy * 0.2;
  physicalSafety -= harmfulActions * 0.05;

  if (economicStage >= 4 && materialAbundance > 1.5) {
    physicalSafety += 0.2; // Less crime when everyone has enough
  }

  physicalSafety = Math.max(0, Math.min(1, physicalSafety));

  // === PSYCHOLOGICAL NEEDS ===

  // Mental health
  let mentalHealth = 0.6;
  mentalHealth += globalMetrics.socialStability * 0.3;
  mentalHealth -= society.unemploymentLevel * (economicStage < 3 ? 0.4 : -0.2);
  mentalHealth += current.meaningAndPurpose * 0.2;

  if (hasUBI) {
    const ubiMentalBonus = calculateUBIMentalHealthBonus(economicStage, hasGenerousUBI);
    mentalHealth += ubiMentalBonus;
  }

  if (economicStage >= 4 && materialAbundance > 1.5) {
    mentalHealth += 0.15;
  }

  mentalHealth = Math.max(0, Math.min(1, mentalHealth));

  // Meaning and purpose
  let meaningAndPurpose = 0.65;
  if (economicStage >= 3 && society.unemploymentLevel > 0.6) {
    meaningAndPurpose = 0.4 + (economicStage - 3) * 0.2;
  } else if (economicStage >= 4) {
    meaningAndPurpose = 0.8 + totalAICapability * 0.05;
  }
  meaningAndPurpose = Math.max(0, Math.min(1, meaningAndPurpose));

  // Social connection
  let socialConnection = 0.55 + current.communityStrength * 0.3;
  if (globalMetrics.socialStability < 0.4) {
    socialConnection += 0.2;
  } else if (materialAbundance > 1.5) {
    socialConnection -= 0.1;
  }
  socialConnection = Math.max(0, Math.min(1, socialConnection));

  // Autonomy
  let autonomy = 0.7;
  autonomy -= government.controlDesire * 0.3;
  autonomy -= government.structuralChoices.surveillanceLevel * 0.4;
  if (government.structuralChoices.surveillanceLevel > 0.7) {
    autonomy -= 0.3;
  }
  autonomy += current.politicalFreedom * 0.2;

  // Autonomy floor
  const govQuality = government.governanceQuality;
  const democraticFloor = government.governmentType === 'democratic' ? 0.25 :
                          government.governmentType === 'technocratic' ? 0.15 : 0.05;
  const transparencyFloor = (govQuality?.transparency || 0.5) * 0.15;
  const participationFloor = (govQuality?.participationRate || 0.5) * 0.10;

  const autonomyBreakthrough = state.breakthroughTech;
  const counterSurveillanceTech =
    (autonomyBreakthrough.communityPlatforms?.deploymentLevel || 0) * 0.15 +
    (autonomyBreakthrough.purposeFrameworks?.deploymentLevel || 0) * 0.10;

  const minimumAutonomy = democraticFloor + transparencyFloor + participationFloor + counterSurveillanceTech;
  autonomy = Math.max(minimumAutonomy, Math.min(1, autonomy));

  // === SOCIAL NEEDS ===

  // Political freedom
  let politicalFreedom = government.legitimacy * 0.7 + (1 - government.controlDesire) * 0.3;
  if (government.governmentType === 'authoritarian') {
    politicalFreedom *= 0.5;
  } else if (government.governmentType === 'democratic') {
    politicalFreedom *= 1.1;
  }
  if (government.structuralChoices.surveillanceLevel > 0.7) {
    politicalFreedom -= 0.3;
  }
  if (globalMetrics.socialStability < 0.3) {
    politicalFreedom *= 0.8;
  }
  politicalFreedom = Math.max(0, Math.min(1, politicalFreedom));

  // Information integrity
  const trustInAI = getTrustInAI(society);
  let informationIntegrity = 0.5 + trustInAI * 0.3;
  informationIntegrity -= (totalAICapability * (1 - avgAlignment)) * 0.2;
  informationIntegrity = Math.max(0, Math.min(1, informationIntegrity));

  // Community strength
  let communityStrength = 0.5 + society.socialAdaptation * 0.3 + globalMetrics.socialStability * 0.2;

  const communityBreakthrough = state.breakthroughTech;
  const communityTechBoost = (communityBreakthrough.communityPlatforms?.deploymentLevel || 0) * 0.15;
  const postScarcityBoost = economicStage >= 3 ? 0.10 : 0;
  const ubiBoost = hasUBI ? 0.05 : 0;

  communityStrength += communityTechBoost + postScarcityBoost + ubiBoost;
  communityStrength = Math.max(0, Math.min(1, communityStrength));

  // Cultural vitality
  let culturalVitality = 0.7 + politicalFreedom * 0.2;
  if (totalAICapability > 1.0 && avgAlignment > 0.7) {
    culturalVitality += 0.1;
  }
  culturalVitality = Math.max(0, Math.min(1, culturalVitality));

  // === HEALTH AND LONGEVITY ===

  let healthcareQuality = 0.75 + totalAICapability * avgAlignment * 0.15;
  healthcareQuality = Math.max(0, Math.min(1, healthcareQuality));

  let longevityGains = 0.1 + totalAICapability * avgAlignment * 0.1;
  longevityGains = Math.max(0, Math.min(2, longevityGains));

  let diseasesBurden = 0.3 - totalAICapability * avgAlignment * 0.1;
  diseasesBurden += harmfulActions * 0.02;
  diseasesBurden = Math.max(0, Math.min(1, diseasesBurden));

  // === ENVIRONMENTAL ===

  let ecosystemHealth = 0.4;
  if (totalAICapability > 1.5 && avgAlignment > 0.7) {
    ecosystemHealth += (totalAICapability - 1.5) * 0.2;
  } else if (totalAICapability > 2.0 && avgAlignment < 0.5) {
    ecosystemHealth -= 0.2;
  }
  ecosystemHealth = Math.max(0, Math.min(1, ecosystemHealth));

  let climateStability = current.climateStability - 0.002;
  if (totalAICapability > 1.5 && avgAlignment > 0.7) {
    climateStability += 0.01;
  }
  climateStability = Math.max(0, Math.min(1, climateStability));

  let pollutionLevel = 0.5 + economicStage * 0.05 - totalAICapability * avgAlignment * 0.1;
  pollutionLevel = Math.max(0, Math.min(1, pollutionLevel));

  // === BREAKTHROUGH TECHNOLOGY BOOSTS ===
  if (state.breakthroughTech) {
    const { getTechnologyQoLBoosts } = require('../breakthroughTechnologies');
    const techBoosts = getTechnologyQoLBoosts(state);

    mentalHealth = Math.min(1.5, mentalHealth + techBoosts.mentalHealth);
    healthcareQuality = Math.min(1.5, healthcareQuality + techBoosts.healthcare);
    ecosystemHealth = Math.min(1.0, ecosystemHealth + techBoosts.environmental);
    climateStability = Math.min(1.0, climateStability + techBoosts.environmental * 0.5);
  }

  // === PSYCHOLOGICAL TRAUMA EFFECTS ===
  if (state.psychologicalTrauma && state.psychologicalTrauma.traumaLevel > 0) {
    const traumaPenalties = calculateTraumaPenalty(state.psychologicalTrauma.traumaLevel);

    mentalHealth *= (1 - traumaPenalties.mentalHealthPenalty);
    socialConnection *= (1 - traumaPenalties.socialConnectionPenalty);
    communityStrength *= (1 - traumaPenalties.communityStrengthPenalty);

    if (traumaPenalties.mentalHealthPenalty > 0.25) {
      console.log(`\n  💔 Psychological trauma impact: -${(traumaPenalties.mentalHealthPenalty * 100).toFixed(0)}% mental health, -${(traumaPenalties.socialConnectionPenalty * 100).toFixed(0)}% social connection`);
    }
  }

  // === INSTITUTIONAL TRUST EROSION FROM TRAUMA ===
  if (state.psychologicalTrauma && state.psychologicalTrauma.traumaLevel > 0.3) {
    const traumaErosion = calculateTraumaInstitutionalErosion(state.psychologicalTrauma.traumaLevel);

    if (state.government && state.government.legitimacy !== undefined) {
      state.government.legitimacy *= (1 - traumaErosion);
    }

    if (state.socialAccumulation && state.socialAccumulation.socialCohesion !== undefined) {
      state.socialAccumulation.socialCohesion *= (1 - traumaErosion * 0.5);
    }
  }

  // === SURVIVAL FUNDAMENTALS ===
  const survivalFundamentals = calculateSurvivalFundamentals(state);

  // CRITICAL FIX (Oct 13, 2025): Assign survivalFundamentals to state!
  // BUG: Was calculated but never assigned → famines never trigger!
  state.survivalFundamentals = survivalFundamentals;

  // === DISTRIBUTION METRICS ===
  const distribution = calculateDistributionMetrics(
    state,
    survivalFundamentals,
    {
      materialAbundance,
      energyAvailability,
      physicalSafety,
      mentalHealth,
      healthcareQuality
    },
    regionalCache
  );

  // === REGIONAL INEQUALITY (DEPRECATED - backward compatibility) ===
  const regionalInequality = calculateRegionalInequality(state, {
    materialAbundance,
    energyAvailability,
    physicalSafety,
    mentalHealth,
    healthcareQuality
  });

  return {
    // Survival fundamentals (required)
    survivalFundamentals,

    // Basic needs
    materialAbundance,
    energyAvailability,
    physicalSafety,

    // Psychological
    mentalHealth,
    meaningAndPurpose,
    socialConnection,
    autonomy,

    // Social
    politicalFreedom,
    informationIntegrity,
    communityStrength,
    culturalVitality,

    // Health
    healthcareQuality,
    longevityGains,
    diseasesBurden,

    // Environmental
    ecosystemHealth,
    climateStability,
    pollutionLevel,

    // Distribution metrics (required)
    distribution,

    // DEPRECATED (backward compatibility)
    regionalInequality
  };
}

/**
 * Initialize quality of life systems with baseline values
 * Represents early 2025 starting conditions
 */
export function initializeQualityOfLifeSystems(): QualityOfLifeSystems {
  return {
    // NEW: Survival Fundamentals (Oct 12, 2025)
    // Baseline 2025: Most people have food/water/shelter, but stressed
    survivalFundamentals: {
      foodSecurity: 0.85,           // 85% food secure (FAO: ~10% undernourished globally)
      waterSecurity: 0.80,           // 80% water secure (WHO: ~25% lack safely managed water)
      thermalHabitability: 1.0,      // 100% habitable (at current +1.1°C)
      shelterSecurity: 0.75,         // 75% adequate housing (UN: ~1.6B inadequate housing)
    },

    // Basic Needs - moderate in developed world
    materialAbundance: 0.8,
    energyAvailability: 0.9,
    physicalSafety: 0.85,

    // Psychological - struggling but functional
    mentalHealth: 0.6,
    meaningAndPurpose: 0.65,
    socialConnection: 0.55,
    autonomy: 0.7,

    // Social - mixed democratic health
    politicalFreedom: 0.7,
    informationIntegrity: 0.5, // Low due to social media
    communityStrength: 0.5,
    culturalVitality: 0.7,

    // Health - good but room for improvement
    healthcareQuality: 0.75,
    longevityGains: 0.1, // Slight gains above historical baseline
    diseasesBurden: 0.3,

    // Environmental - declining
    ecosystemHealth: 0.4,
    climateStability: 0.6,
    pollutionLevel: 0.5,

    // NEW: Distribution Metrics (Oct 12, 2025)
    // Baseline 2025: Moderate inequality, some regional crises
    distribution: {
      globalGini: 0.38,              // Current global Gini ~0.38 (World Bank)
      regionalVariance: 0.08,        // Moderate variance
      crisisAffectedFraction: 0.15,  // ~15% in acute crisis zones (conflicts, droughts)
      worstRegionQoL: 0.35,          // Worst regions (conflict zones, extreme poverty)
      bestRegionQoL: 0.95,           // Best regions (Nordic countries, high HDI)
      medianRegionQoL: 0.65,         // Median region
      isDystopicInequality: false,   // Not yet dystopian
      isRegionalDystopia: false,     // Not yet regional dystopia
    }
  };
}
