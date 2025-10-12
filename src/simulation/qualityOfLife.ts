/**
 * Multi-dimensional Quality of Life system (Phase 1)
 * 
 * Tracks 17 QoL dimensions across 5 categories to enable "dark valley" dynamics
 * where some dimensions can decline while others are maintained.
 */

import { QualityOfLifeSystems, GameState } from '@/types/game';
import { getTrustInAI } from './socialCohesion';

/**
 * Calculate multi-dimensional quality of life from all component systems
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
 * Initialize quality of life systems with baseline values
 * Represents early 2025 starting conditions
 */
export function initializeQualityOfLifeSystems(): QualityOfLifeSystems {
  return {
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
    pollutionLevel: 0.5
  };
}

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
 */
export function updateQualityOfLifeSystems(state: GameState): QualityOfLifeSystems {
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
  const unemploymentPenalty = society.unemploymentLevel * (economicStage < 3 ? -0.3 : 0.1); // Becomes positive in post-scarcity
  const wealthBonus = globalMetrics.wealthDistribution * 0.3;
  let materialAbundance = 0.8 + aiProductionBonus + unemploymentPenalty + wealthBonus;
  
  // Phase 1.2: UBI at Stage 3 guarantees basic material needs
  if (economicStage >= 3 && hasUBI) {
    // UBI ensures material needs are met even with high unemployment
    const ubiFloor = hasGenerousUBI ? 0.9 : 0.75; // Generous UBI = very high floor
    materialAbundance = Math.max(materialAbundance, ubiFloor);
  }
  
  // Phase 1.1: Post-scarcity QoL multipliers (FIXED: Scale with population)
  if (economicStage >= 4) {
    // CRITICAL FIX: Scale abundance by population survival
    // If 95% of people dead, infrastructure collapses even with super-AI
    const pop = state.humanPopulationSystem;
    const populationFraction = pop.population / pop.baselinePopulation;
    
    // Population scaling: 30% minimum (scattered survivors), 100% at full population
    // Below 50% population: Severe infrastructure decay
    // Below 10% population: Near-total collapse
    const infrastructureScaling = populationFraction < 0.5 
      ? 0.3 + (populationFraction * 0.7)  // 30-65% scaling (< 4B people)
      : 0.65 + (populationFraction * 0.35); // 65-100% scaling (> 4B people)
    
    // Full automation → material abundance (scaled by who's alive to benefit)
    materialAbundance += 0.8 * infrastructureScaling;
    
    // AI capability accelerates abundance (but only if infrastructure intact)
    // Cap AI contribution to prevent infinite values
    const aiContribution = Math.min(1.2, totalAICapability * 0.15);
    materialAbundance += aiContribution * infrastructureScaling;
    
    // Cap at reasonable post-scarcity levels (no infinite abundance)
    materialAbundance = Math.min(3.0, Math.max(0, materialAbundance));
  } else {
    materialAbundance = Math.max(0, Math.min(2, materialAbundance));
  }
  
  // Energy availability: AI helps, stage advances
  let energyAvailability = 0.9 + totalAICapability * 0.05 + economicStage * 0.1;
  
  // Phase 1.1: Post-scarcity energy abundance (FIXED: Scale with population)
  if (economicStage >= 4) {
    const pop = state.humanPopulationSystem;
    const populationFraction = pop.population / pop.baselinePopulation;
    
    // Energy infrastructure requires maintenance crews
    const gridScaling = populationFraction < 0.5 
      ? 0.3 + (populationFraction * 0.7)
      : 0.65 + (populationFraction * 0.35);
    
    // Renewable/fusion breakthrough assumption at Stage 4
    energyAvailability += 0.6 * gridScaling;
    
    // AI optimization of energy systems (capped to prevent infinite)
    const aiEnergyBonus = Math.min(1.0, totalAICapability * 0.1);
    energyAvailability += aiEnergyBonus * gridScaling;
    
    // Cap at reasonable post-scarcity levels
    energyAvailability = Math.min(3.0, Math.max(0, energyAvailability));
  } else {
    energyAvailability = Math.max(0, Math.min(2, energyAvailability));
  }
  
  // Physical safety: Stability matters, harmful AI reduces, government control helps
  let physicalSafety = globalMetrics.socialStability * 0.8 + government.legitimacy * 0.2;
  physicalSafety -= harmfulActions * 0.05;
  
  // Phase 1.1: Post-scarcity reduces scarcity-driven crime/conflict
  if (economicStage >= 4 && materialAbundance > 1.5) {
    physicalSafety += 0.2; // Less crime when everyone has enough
  }
  
  physicalSafety = Math.max(0, Math.min(1, physicalSafety));
  
  // === PSYCHOLOGICAL NEEDS ===
  
  // Mental health: Economic stress hurts, stability helps, meaning helps
  let mentalHealth = 0.6;
  mentalHealth += globalMetrics.socialStability * 0.3;
  mentalHealth -= society.unemploymentLevel * (economicStage < 3 ? 0.4 : -0.2); // Unemployment becomes freedom later
  mentalHealth += current.meaningAndPurpose * 0.2;
  
  // Phase 1.2: UBI at Stage 3 reduces economic anxiety
  if (economicStage >= 3 && hasUBI) {
    // UBI reduces stress from unemployment
    const stressReduction = hasGenerousUBI ? 0.2 : 0.12;
    mentalHealth += stressReduction;
  }
  
  // Phase 1.1: Post-scarcity reduces economic anxiety
  if (economicStage >= 4 && materialAbundance > 1.5) {
    mentalHealth += 0.15; // Less stress when material needs are effortlessly met
  }
  
  mentalHealth = Math.max(0, Math.min(1, mentalHealth));
  
  // Meaning and purpose: Post-work transition matters
  let meaningAndPurpose = 0.65;
  if (economicStage >= 3 && society.unemploymentLevel > 0.6) {
    // Transition crisis: meaning drops then recovers
    meaningAndPurpose = 0.4 + (economicStage - 3) * 0.2;
  } else if (economicStage >= 4) {
    // Post-scarcity: high meaning from freedom
    meaningAndPurpose = 0.8 + totalAICapability * 0.05;
  }
  meaningAndPurpose = Math.max(0, Math.min(1, meaningAndPurpose));
  
  // Social connection: Community strength during crisis, atomization risk with abundance
  let socialConnection = 0.55 + current.communityStrength * 0.3;
  if (globalMetrics.socialStability < 0.4) {
    // Crisis brings people together
    socialConnection += 0.2;
  } else if (materialAbundance > 1.5) {
    // Abundance can isolate
    socialConnection -= 0.1;
  }
  socialConnection = Math.max(0, Math.min(1, socialConnection));
  
  // Autonomy: Government control reduces, AI surveillance reduces, freedom helps
  // Phase 2.6: STRONGER penalties for high surveillance
  let autonomy = 0.7;
  autonomy -= government.controlDesire * 0.3;
  autonomy -= government.structuralChoices.surveillanceLevel * 0.4; // Increased from 0.2
  if (government.structuralChoices.surveillanceLevel > 0.7) {
    // Pervasive surveillance: feels like living in 1984
    autonomy -= 0.3;
  }
  autonomy += current.politicalFreedom * 0.2;
  
  // Phase 2.7: AUTONOMY FLOOR - Tech & governance can counter surveillance
  // Research basis: Zuboff (2019), Lessig (2006) - "Code is law, but code can be rewritten"
  const govQuality = government.governanceQuality;
  const democraticFloor = government.governmentType === 'democratic' ? 0.25 : 
                          government.governmentType === 'technocratic' ? 0.15 : 0.05;
  const transparencyFloor = (govQuality?.transparency || 0.5) * 0.15;
  const participationFloor = (govQuality?.participationRate || 0.5) * 0.10;
  
  // Breakthrough tech can provide counter-surveillance tools
  const autonomyBreakthrough = state.breakthroughTech;
  const counterSurveillanceTech = 
    (autonomyBreakthrough.communityPlatforms?.deploymentLevel || 0) * 0.15 + // Decentralized communication
    (autonomyBreakthrough.purposeFrameworks?.deploymentLevel || 0) * 0.10;    // Self-actualization pathways
  
  const minimumAutonomy = democraticFloor + transparencyFloor + participationFloor + counterSurveillanceTech;
  
  autonomy = Math.max(minimumAutonomy, Math.min(1, autonomy));
  
  // === SOCIAL NEEDS ===
  
  // Political freedom: Government legitimacy matters, control desire reduces
  // Phase 2.6: Authoritarian governments reduce freedom more
  let politicalFreedom = government.legitimacy * 0.7 + (1 - government.controlDesire) * 0.3;
  if (government.governmentType === 'authoritarian') {
    politicalFreedom *= 0.5; // Authoritarian = low freedom
  } else if (government.governmentType === 'democratic') {
    politicalFreedom *= 1.1; // Democratic bonus
  }
  // High surveillance reduces freedom
  if (government.structuralChoices.surveillanceLevel > 0.7) {
    politicalFreedom -= 0.3;
  }
  // Crisis can reduce freedoms
  if (globalMetrics.socialStability < 0.3) {
    politicalFreedom *= 0.8;
  }
  politicalFreedom = Math.max(0, Math.min(1, politicalFreedom));
  
  // Information integrity: AI manipulation hurts, trust matters
  const trustInAI = getTrustInAI(society); // Phase 2: Use paranoia-derived trust
  let informationIntegrity = 0.5 + trustInAI * 0.3;
  informationIntegrity -= (totalAICapability * (1 - avgAlignment)) * 0.2; // Misaligned AI manipulates
  informationIntegrity = Math.max(0, Math.min(1, informationIntegrity));
  
  // Community strength: Adaptation helps, stability helps
  let communityStrength = 0.5 + society.socialAdaptation * 0.3 + globalMetrics.socialStability * 0.2;
  
  // Phase 2.7: Tech & economic stage boost community
  const communityBreakthrough = state.breakthroughTech;
  const communityTechBoost = (communityBreakthrough.communityPlatforms?.deploymentLevel || 0) * 0.15; // Digital community tools
  const postScarcityBoost = economicStage >= 3 ? 0.10 : 0; // Time freedom enables community
  const ubiBoost = hasUBI ? 0.05 : 0; // Reduces economic stress
  
  communityStrength += communityTechBoost + postScarcityBoost + ubiBoost;
  communityStrength = Math.max(0, Math.min(1, communityStrength));
  
  // Cultural vitality: Freedom helps, AI can enhance or suppress
  let culturalVitality = 0.7 + politicalFreedom * 0.2;
  if (totalAICapability > 1.0 && avgAlignment > 0.7) {
    // Aligned AI enhances culture
    culturalVitality += 0.1;
  }
  culturalVitality = Math.max(0, Math.min(1, culturalVitality));
  
  // === HEALTH AND LONGEVITY ===
  
  // Healthcare quality: AI capability helps significantly
  let healthcareQuality = 0.75 + totalAICapability * avgAlignment * 0.15;
  healthcareQuality = Math.max(0, Math.min(1, healthcareQuality));
  
  // Longevity gains: AI medical breakthroughs
  let longevityGains = 0.1 + totalAICapability * avgAlignment * 0.1;
  longevityGains = Math.max(0, Math.min(2, longevityGains));
  
  // Diseases burden: AI helps reduce, but new risks from misaligned AI
  let diseasesBurden = 0.3 - totalAICapability * avgAlignment * 0.1;
  diseasesBurden += harmfulActions * 0.02; // Bioweapon risk
  diseasesBurden = Math.max(0, Math.min(1, diseasesBurden));
  
  // === ENVIRONMENTAL ===
  
  // Ecosystem health: AI can help or hurt
  let ecosystemHealth = 0.4;
  if (totalAICapability > 1.5 && avgAlignment > 0.7) {
    // Advanced aligned AI can restore ecosystems
    ecosystemHealth += (totalAICapability - 1.5) * 0.2;
  } else if (totalAICapability > 2.0 && avgAlignment < 0.5) {
    // Misaligned AI may damage ecosystems for resources
    ecosystemHealth -= 0.2;
  }
  ecosystemHealth = Math.max(0, Math.min(1, ecosystemHealth));
  
  // Climate stability: Slow degradation unless AI intervenes
  let climateStability = current.climateStability - 0.002; // Slow decline
  if (totalAICapability > 1.5 && avgAlignment > 0.7) {
    // Advanced aligned AI can stabilize climate
    climateStability += 0.01;
  }
  climateStability = Math.max(0, Math.min(1, climateStability));
  
  // Pollution level: Economic activity matters, AI can help
  let pollutionLevel = 0.5 + economicStage * 0.05 - totalAICapability * avgAlignment * 0.1;
  pollutionLevel = Math.max(0, Math.min(1, pollutionLevel));
  
  // === BREAKTHROUGH TECHNOLOGY BOOSTS (Phase 2A) ===
  if (state.breakthroughTech) {
    const { getTechnologyQoLBoosts } = require('./breakthroughTechnologies');
    const techBoosts = getTechnologyQoLBoosts(state);
    
    // Apply mental health boosts from mental health tech + purpose frameworks
    mentalHealth = Math.min(1.5, mentalHealth + techBoosts.mentalHealth);
    
    // Apply healthcare boosts from medical breakthroughs
    healthcareQuality = Math.min(1.5, healthcareQuality + techBoosts.healthcare);
    
    // Apply environmental boosts from clean energy + ecosystem management
    ecosystemHealth = Math.min(1.0, ecosystemHealth + techBoosts.environmental);
    climateStability = Math.min(1.0, climateStability + techBoosts.environmental * 0.5);
  }
  
  // === REGIONAL INEQUALITY TRACKING (Oct 12, 2025) ===
  // Calculate QoL variance across crisis-affected vs. abundant regions
  const regionalInequality = calculateRegionalInequality(state, {
    materialAbundance,
    energyAvailability,
    physicalSafety,
    mentalHealth,
    healthcareQuality
  });
  
  return {
    materialAbundance,
    energyAvailability,
    physicalSafety,
    mentalHealth,
    meaningAndPurpose,
    socialConnection,
    autonomy,
    politicalFreedom,
    informationIntegrity,
    communityStrength,
    culturalVitality,
    healthcareQuality,
    longevityGains,
    diseasesBurden,
    ecosystemHealth,
    climateStability,
    pollutionLevel,
    regionalInequality
  };
}

/**
 * Calculate regional QoL inequality (Oct 12, 2025)
 * 
 * Global averages hide massive suffering - some regions in famine while others abundant.
 * This tracks the variance in QoL across crisis-affected vs. non-affected regions.
 */
function calculateRegionalInequality(
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
  // Based on active crises, refugee counts, and population decline
  let crisisAffectedPopulation = 0;
  
  // Environmental crises affect specific regions
  if (env.resourceCrisisActive) crisisAffectedPopulation += 0.25; // Food/water insecure regions
  if (env.climateCatastropheActive) crisisAffectedPopulation += 0.15; // Coastal & vulnerable
  if (env.ecosystemCollapseActive) crisisAffectedPopulation += 0.10; // Ecosystem-dependent
  
  // Social crises affect specific demographics
  if (social.meaningCollapseActive) crisisAffectedPopulation += 0.30; // Wealthy automated nations
  if (social.socialUnrestActive) crisisAffectedPopulation += 0.20; // Urban centers
  
  // Refugees are definitely crisis-affected
  if (refugees && refugees.activeCrises) {
    const refugeePopulation = Object.values(refugees.activeCrises)
      .reduce((sum, crisis) => sum + crisis.totalFled, 0);
    crisisAffectedPopulation += (refugeePopulation / 1000) / pop.population; // millions to billions
  }
  
  // Cap at 100%
  crisisAffectedPopulation = Math.min(1.0, crisisAffectedPopulation);
  
  // Calculate bottom region QoL (crisis-affected)
  // These regions experience the full brunt of crises
  const crisisMultiplier = 0.3; // 70% reduction in crisis zones
  const bottomRegionQoL = (
    avgQoL.materialAbundance * crisisMultiplier * 0.3 +
    avgQoL.energyAvailability * crisisMultiplier * 0.3 +
    avgQoL.physicalSafety * crisisMultiplier * 0.2 +
    avgQoL.mentalHealth * crisisMultiplier * 0.1 +
    avgQoL.healthcareQuality * crisisMultiplier * 0.1
  );
  
  // Calculate top region QoL (non-affected or benefiting)
  // These regions may even benefit from AI abundance
  const benefitMultiplier = crisisAffectedPopulation > 0.3 ? 1.3 : 1.1;
  const topRegionQoL = (
    avgQoL.materialAbundance * benefitMultiplier * 0.3 +
    avgQoL.energyAvailability * benefitMultiplier * 0.3 +
    avgQoL.physicalSafety * Math.min(1, avgQoL.physicalSafety * 1.2) * 0.2 +
    avgQoL.mentalHealth * Math.min(1, avgQoL.mentalHealth * 1.1) * 0.1 +
    avgQoL.healthcareQuality * Math.min(1, avgQoL.healthcareQuality * 1.2) * 0.1
  );
  
  const qolGap = topRegionQoL - bottomRegionQoL;
  
  // Calculate Gini coefficient (0 = perfect equality, 1 = extreme inequality)
  // Simple approximation: If crisis affects 30% at 0.3x QoL and 70% at 1.3x QoL
  // Gini increases with both the gap and the population affected
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

