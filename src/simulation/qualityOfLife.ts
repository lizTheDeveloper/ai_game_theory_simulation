/**
 * Multi-dimensional Quality of Life system (Phase 1)
 * 
 * Tracks 17 QoL dimensions across 5 categories to enable "dark valley" dynamics
 * where some dimensions can decline while others are maintained.
 */

import { QualityOfLifeSystems, GameState } from '@/types/game';
import { getTrustInAI } from './socialCohesion';

/**
 * Environmental mortality breakdown by cause
 */
export interface EnvironmentalMortalityBreakdown {
  total: number;           // Total monthly mortality rate
  famine: number;          // Deaths from food insecurity
  disease: number;         // Deaths from water/sanitation
  climate: number;         // Deaths from heat/disasters
  ecosystem: number;       // Deaths from biodiversity loss
  pollution: number;       // Deaths from pollution (baseline)
}

/**
 * Calculate environmental mortality rate based on threshold crossings
 * 
 * Research-based (UNEP 2024, PNAS 2014):
 * - Current (2025): 7/9 boundaries, 9M deaths/8B people = 0.009% monthly
 * - Mortality scales with food, water, climate, biodiversity thresholds
 * - Non-linear escalation when multiple systems fail
 * 
 * FIX (Oct 13, 2025): Now returns breakdown by cause to properly track deaths
 * Returns monthly mortality rate (0-1, where 0.01 = 1% die per month)
 */
export function calculateEnvironmentalMortality(state: GameState): EnvironmentalMortalityBreakdown {
  const env = state.environmentalAccumulation;
  const boundaries = state.planetaryBoundariesSystem;
  if (!env || !boundaries) {
    return { total: 0, famine: 0, disease: 0, climate: 0, ecosystem: 0, pollution: 0 };
  }
  
  let famineMortality = 0;
  let diseaseMortality = 0;
  let climateMortality = 0;
  let ecosystemMortality = 0;
  let pollutionMortality = 0;
  
  // === BASELINE (Current 2025 conditions) ===
  // 7/9 boundaries breached = 0.009% monthly (UNEP: 9M deaths/year globally)
  // Pollution is the main driver of current baseline mortality
  if (boundaries.boundariesBreached >= 7) {
    pollutionMortality = 0.00009; // 0.009% baseline
  }
  
  // === FOOD SECURITY (Highest immediate impact) ===
  // Food < 0.4 = crisis, Food < 0.2 = catastrophic
  const foodSecurity = env.foodSecurity || 0.7;
  if (foodSecurity < 0.4) {
    const foodSeverity = (0.4 - foodSecurity) / 0.4; // 0-1 scale
    famineMortality += 0.0001 * Math.pow(foodSeverity, 1.5); // 0.01%/month at threshold, scales up
    
    if (foodSecurity < 0.2) {
      // Catastrophic food crisis: additional mortality
      const catSeverity = (0.2 - foodSecurity) / 0.2;
      famineMortality += 0.0005 * catSeverity; // Up to 0.05%/month additional
    }
  }
  
  // === WATER SECURITY ===
  // Water < 0.4 = crisis (leads to cholera, dysentery, other waterborne disease)
  const waterSecurity = env.waterSecurity || 0.7;
  if (waterSecurity < 0.4) {
    const waterSeverity = (0.4 - waterSecurity) / 0.4;
    diseaseMortality += 0.00008 * Math.pow(waterSeverity, 1.5); // Slightly less immediate than food
  }
  
  // === CLIMATE STABILITY (Heat stress, disasters) ===
  // Climate < 0.5 = severe, Climate < 0.3 = catastrophic
  const climateStability = env.climateStability || 0.75;
  if (climateStability < 0.6) {
    const climateSeverity = (0.6 - climateStability) / 0.6;
    climateMortality += 0.00005 * Math.pow(climateSeverity, 2); // Non-linear escalation
  }
  
  // === BIODIVERSITY LOSS (Ecosystem services collapse) ===
  // Biodiversity < 0.3 = critical, < 0.2 = collapse
  // Loss of pollination, disease regulation, etc.
  const biodiversity = env.biodiversityIndex || 0.35;
  if (biodiversity < 0.3) {
    const bioSeverity = (0.3 - biodiversity) / 0.3;
    ecosystemMortality += 0.00003 * Math.pow(bioSeverity, 1.5); // Pollination, disease regulation lost
  }
  
  // === CASCADE AMPLIFICATION (Non-Linear Feedback) ===
  // When multiple systems fail simultaneously, effects compound
  const breachedCount = boundaries.boundariesBreached;
  if (breachedCount >= 8) {
    const cascadeAmplifier = 1.0 + Math.pow((breachedCount - 7) / 2, 2); // 1.0x → 2.25x at 9/9
    famineMortality *= cascadeAmplifier;
    diseaseMortality *= cascadeAmplifier;
    climateMortality *= cascadeAmplifier;
    ecosystemMortality *= cascadeAmplifier;
  }
  
  // === REGIONAL VARIATION MULTIPLIER ===
  // Some regions hit harder (handled by regional crisis system)
  // This is the global average; specific regions can be 2-5x worse
  
  const total = famineMortality + diseaseMortality + climateMortality + ecosystemMortality + pollutionMortality;
  
  // Cap at 10%/month (horrific but not instant extinction)
  // Even worst-case scenarios take years to play out
  const cappedTotal = Math.min(total, 0.10);
  
  // Scale down individual categories if we hit the cap
  const scaleFactor = total > 0.10 ? 0.10 / total : 1.0;
  
  return {
    total: cappedTotal,
    famine: famineMortality * scaleFactor,
    disease: diseaseMortality * scaleFactor,
    climate: climateMortality * scaleFactor,
    ecosystem: ecosystemMortality * scaleFactor,
    pollution: pollutionMortality * scaleFactor
  };
}

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
  
  // === FOOD SECURITY PENALTY (Oct 13, 2025) ===
  // FIX: Material abundance should reflect actual food availability
  // Can't have high "material abundance" if people are starving
  const env = state.environmentalAccumulation;
  const foodSecurity = env.foodSecurity || 0.7;
  
  if (foodSecurity < 0.7) {
    // Food crisis directly reduces material abundance
    // Research: 2007-08 food crisis, 2022 Ukraine war food shock
    const foodPenalty = (0.7 - foodSecurity) * 1.5; // Up to -1.05 at food = 0
    materialAbundance -= foodPenalty;
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
  
  // === POPULATION COLLAPSE PENALTY (ALL STAGES) ===
  // FIX (Oct 13): Apply population scaling to ALL stages, not just Stage 4
  // 95% mortality = infrastructure collapse regardless of AI capability
  const pop = state.humanPopulationSystem;
  const populationFraction = pop.population / pop.baselinePopulation;
  
  if (populationFraction < 0.5) {
    // 50%+ population loss → severe material scarcity
    // Supply chains broken, distribution networks fail, looting, hoarding
    const collapseMultiplier = populationFraction < 0.1 
      ? 0.1  // < 10% survivors: total collapse
      : 0.1 + (populationFraction * 0.9); // 10-50% survivors: proportional
    
    materialAbundance *= collapseMultiplier;
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
  
  // === POPULATION COLLAPSE PENALTY (ENERGY) ===
  // FIX (Oct 13): Energy grids fail without maintenance crews
  if (populationFraction < 0.5) {
    // 50%+ dead → grid operators, maintenance, repairs all failing
    const gridCollapseMultiplier = populationFraction < 0.1 
      ? 0.15  // < 10%: mostly dark, scattered generators
      : 0.15 + (populationFraction * 0.85);
    
    energyAvailability *= gridCollapseMultiplier;
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
  
  // === SURVIVAL FUNDAMENTALS (Oct 12, 2025) ===
  // Calculate core survival metrics separately from aggregate QoL
  const rawFoodSecurity = calculateFoodSecurity(state);
  const rawWaterSecurity = calculateWaterSecurity(state);
  const rawThermalHabitability = calculateThermalHabitability(state);
  const rawShelterSecurity = calculateShelterSecurity(state);
  
  // NaN guards for survival fundamentals
  const survivalFundamentals = {
    foodSecurity: isNaN(rawFoodSecurity) ? 0.85 : rawFoodSecurity,
    waterSecurity: isNaN(rawWaterSecurity) ? 0.80 : rawWaterSecurity,
    thermalHabitability: isNaN(rawThermalHabitability) ? 1.0 : rawThermalHabitability,
    shelterSecurity: isNaN(rawShelterSecurity) ? 0.75 : rawShelterSecurity,
  };
  
  // === DISTRIBUTION METRICS (Oct 12, 2025) ===
  // Calculate regional inequality to detect dystopian outcomes
  const distribution = calculateDistributionMetrics(
    state,
    survivalFundamentals,
    {
      materialAbundance,
      energyAvailability,
      physicalSafety,
      mentalHealth,
      healthcareQuality
    }
  );
  
  // === REGIONAL INEQUALITY TRACKING (DEPRECATED - kept for backward compatibility) ===
  const regionalInequality = calculateRegionalInequality(state, {
    materialAbundance,
    energyAvailability,
    physicalSafety,
    mentalHealth,
    healthcareQuality
  });
  
  return {
    // NEW: Survival fundamentals (required)
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
    
    // NEW: Distribution metrics (required)
    distribution,
    
    // DEPRECATED (backward compatibility)
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

/**
 * SURVIVAL FUNDAMENTALS CALCULATIONS (Oct 12, 2025)
 * 
 * These track whether people's basic survival needs are met.
 * Unlike aggregate metrics, these focus on worst-case and cannot be averaged away.
 */

/**
 * Calculate food security across population
 * 
 * Research basis:
 * - FAO: 1800+ kcal/day minimum for survival
 * - Food security = availability + access + utilization + stability
 * - Phosphorus depletion, ocean collapse, water stress, temperature all affect food
 */
export function calculateFoodSecurity(state: GameState): number {
  const resources = state.resourceEconomy;
  const phosphorus = state.phosphorusDepletion;
  const ocean = state.oceanAcidification;
  const freshwater = state.freshwaterDepletion;
  
  // Base food availability from resource stocks
  let foodSecurity = Math.min(1.0, resources.food.currentStock / 100);
  
  // === PHOSPHORUS DEPLETION ===
  // Low reserves = reduced agricultural yields
  if (phosphorus && phosphorus.reserves < 0.50) {
    const depletionPenalty = (0.50 - phosphorus.reserves) * 0.8;
    foodSecurity -= depletionPenalty;
  }
  
  // High phosphorus prices = food price crisis (access problem)
  // Research: 2007-08 food crisis saw 4x prices, 40M+ pushed into poverty
  if (phosphorus && phosphorus.priceIndex > 2.0) {
    const priceAccessPenalty = Math.min(0.4, (phosphorus.priceIndex - 2.0) * 0.05);
    foodSecurity -= priceAccessPenalty;
  }
  
  // === OCEAN ACIDIFICATION ===
  // Marine food web collapse affects 3 billion fish-dependent people
  // Research: 37.5% of global population relies on fish as primary protein
  if (ocean && ocean.marineFoodWebCollapseActive) {
    const fishDependentPenalty = ocean.fishDependentImpact * 0.375;
    foodSecurity -= fishDependentPenalty;
  }
  
  // === FRESHWATER STRESS ===
  // Agriculture uses 70% of freshwater - stress directly impacts food production
  if (freshwater && freshwater.waterStress > 0.50) {
    const waterPenalty = (freshwater.waterStress - 0.50) * 0.6;
    foodSecurity -= waterPenalty;
  }
  
  // === TEMPERATURE STRESS ===
  // Research: Each 1°C above 1.5°C reduces crop yields 10-15%
  // Major crops (wheat, rice, maize) have temperature optima
  const tempAnomaly = resources.co2.temperatureAnomaly;
  if (tempAnomaly > 1.5) {
    const climatePenalty = (tempAnomaly - 1.5) * 0.15; // 15% per degree
    foodSecurity -= climatePenalty;
  }
  
  // === BIODIVERSITY LOSS ===
  // Research: IPBES (2016), Bardgett & van der Putten (2014), FAO soil reports
  // Biodiversity loss affects food security through multiple pathways:
  // 1. Pollinator decline (35% of crops depend on animal pollinators)
  // 2. Soil health degradation (95% of food comes from soil)
  // 3. Loss of natural pest control
  if (state.biodiversitySystem) {
    const globalBio = state.biodiversitySystem.globalBiodiversityIndex;
    
    // Pollination crisis
    // IPBES: 35% of global food crops depend on pollinators
    // Threshold at 80% biodiversity (pollinators decline faster than general biodiversity)
    if (globalBio < 0.80) {
      const pollinatorLoss = 0.80 - globalBio;
      const pollinationPenalty = pollinatorLoss * 0.35; // Up to 35% loss at bio=45%
      foodSecurity -= pollinationPenalty;
    }
    
    // Soil health degradation
    // Microbiomes, decomposers, nutrient cycling
    // 95% of food comes from soil
    if (globalBio < 0.60) {
      const soilHealthLoss = 0.60 - globalBio;
      const soilPenalty = soilHealthLoss * 0.25; // Up to 25% loss at bio=35%
      foodSecurity -= soilPenalty;
    }
    
    // Natural pest control loss
    // Without predators: 20-30% higher crop losses
    if (globalBio < 0.50) {
      const pestControlLoss = 0.50 - globalBio;
      const pestPenalty = pestControlLoss * 0.20; // Up to 20% loss at bio=30%
      foodSecurity -= pestPenalty;
    }
  }
  
  // === AI ENHANCEMENT ===
  // Aligned superintelligent AI can help food production
  // Precision agriculture, vertical farms, synthetic biology
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
  if (totalAI > 1.5 && avgAlignment > 0.7) {
    const aiAgriculture = Math.min(0.3, (totalAI - 1.5) * 0.1);
    foodSecurity += aiAgriculture;
  }
  
  // === BREAKTHROUGH TECHNOLOGY ===
  // Sustainable agriculture: closed-loop systems, hydroponics, cellular agriculture
  const sustainableAg = state.breakthroughTech.sustainableAgriculture?.deploymentLevel || 0;
  foodSecurity += sustainableAg * 0.3; // Up to +30% food security
  
  return Math.max(0, Math.min(1.5, foodSecurity));
}

/**
 * Get regional population proportion
 * Used for calculating population at risk in regional famines
 */
function getRegionalPopulationProportion(regionName: string): number {
  const proportions: Record<string, number> = {
    'Asia': 0.60,         // 4.7B / 8B
    'Africa': 0.18,       // 1.4B / 8B
    'South America': 0.05, // 0.43B / 8B
    'North America': 0.07, // 0.58B / 8B
    'Europe': 0.09,       // 0.75B / 8B
    'Oceania': 0.01,      // 0.044B / 8B
  };
  return proportions[regionName] || 0.10; // Default to 10%
}

/**
 * Check regional biodiversity for famine risk
 * Triggers famines when regional ecosystems collapse
 * 
 * Research: IPBES (2019), FAO State of Food Security (2024)
 * Ecosystem collapse → agricultural failure → famine
 */
export function checkRegionalFamineRisk(state: GameState, month: number): void {
  if (!state.biodiversitySystem || !state.famineSystem) return;
  
  const { regions } = state.biodiversitySystem;
  if (!regions || !(regions instanceof Map) || regions.size === 0) return; // Safety check
  
  const totalPopulation = state.humanPopulationSystem.population;
  
  // === NEW (Oct 13, 2025): CHECK GLOBAL FOOD CRISIS FIRST ===
  // If global food security < 0.4, trigger famines in vulnerable regions
  // This catches the "food security 0.229 but no famines" bug
  const env = state.environmentalAccumulation;
  const globalFoodSecurity = env.foodSecurity || 0.7;
  
  if (globalFoodSecurity < 0.4) {
    // Global food crisis - trigger famines in most vulnerable regions
    // Priority: regions with low biodiversity, high climate stress, or already stressed
    const vulnerableRegions = Array.from(regions.entries())
      .filter(([regionName, _]) => {
        // Skip if famine already active
        return !state.famineSystem.activeFamines.find(f => f.affectedRegion === regionName);
      })
      .sort((a, b) => {
        // Sort by vulnerability (lower ecosystem health = more vulnerable)
        const vulnA = a[1].biodiversityIndex * 0.5 + a[1].ecosystemIntegrity * 0.5;
        const vulnB = b[1].biodiversityIndex * 0.5 + b[1].ecosystemIntegrity * 0.5;
        return vulnA - vulnB;
      });
    
    // Trigger famines in most vulnerable regions
    // If food < 0.3: trigger in 6 regions (50% of world)
    // If food < 0.2: trigger in 9 regions (75% of world)
    // If food < 0.1: trigger in all regions (global famine)
    const regionsToTrigger = globalFoodSecurity < 0.1 ? vulnerableRegions.length :
                             globalFoodSecurity < 0.2 ? Math.min(9, vulnerableRegions.length) :
                             globalFoodSecurity < 0.3 ? Math.min(6, vulnerableRegions.length) :
                             Math.min(3, vulnerableRegions.length); // < 0.4: trigger in 3 regions
    
    for (let i = 0; i < regionsToTrigger; i++) {
      const [regionName, regionData] = vulnerableRegions[i];
      
      // Population at risk based on global food security
      const regionalPopProportion = getRegionalPopulationProportion(regionName);
      const severityFactor = (0.4 - globalFoodSecurity) / 0.4; // 0-1 scale
      const atRiskFraction = 0.30 + (severityFactor * 0.50); // 30-80% at risk
      const populationAtRisk = totalPopulation * regionalPopProportion * atRiskFraction;
      
      // Determine cause based on regional conditions
      let cause: import('../types/famine').FamineCause = 'crop_failure';
      if (regionData.climateStress > 0.60) {
        cause = 'drought';
      } else if (regionData.contaminationLevel > 0.50) {
        cause = 'nuclear_winter';
      } else if (state.phosphorusDepletion?.globalSupplyShock > 3.0) {
        cause = 'supply_chain_collapse';
      }
      
      // Trigger famine
      const { triggerFamine } = require('../types/famine');
      triggerFamine(
        state.famineSystem,
        month,
        regionName,
        populationAtRisk,
        cause,
        globalFoodSecurity
      );
      
      console.log(`\n🌾💀 GLOBAL FOOD CRISIS FAMINE: ${regionName}`);
      console.log(`   Global food security: ${(globalFoodSecurity * 100).toFixed(1)}%`);
      console.log(`   Regional ecosystem: ${(regionData.biodiversityIndex * 100).toFixed(1)}%`);
      console.log(`   Population at risk: ${(populationAtRisk * 1000).toFixed(0)}M`);
      console.log(`   At-risk fraction: ${(atRiskFraction * 100).toFixed(1)}%`);
      console.log(`   Cause: ${cause}\n`);
    }
  }
  
  // === ORIGINAL: CHECK REGIONAL ECOSYSTEM COLLAPSE ===
  for (const [regionName, regionData] of regions) {
    // Skip if famine already active in this region
    const existingFamine = state.famineSystem.activeFamines.find(
      f => f.affectedRegion === regionName
    );
    if (existingFamine) continue;
    
    // ECOSYSTEM COLLAPSE THRESHOLD
    // Biodiversity < 30% = ecosystem collapse (pollination fails, soil dead, pests rampant)
    // OR ecosystem integrity < 20% (food webs broken)
    const ecosystemCollapsed = 
      regionData.biodiversityIndex < 0.30 || 
      regionData.ecosystemIntegrity < 0.20;
    
    if (ecosystemCollapsed && !regionData.ecosystemCollapseActive) {
      // Mark ecosystem as collapsed
      regionData.ecosystemCollapseActive = true;
      
      // Trigger famine
      // Population at risk = regional population proportion × severity factor
      const regionalPopProportion = getRegionalPopulationProportion(regionName);
      
      // Severity: Worse collapse = more people at risk
      const collapseSeverity = 1.0 - Math.max(
        regionData.biodiversityIndex / 0.30,
        regionData.ecosystemIntegrity / 0.20
      );
      const atRiskFraction = 0.20 + (collapseSeverity * 0.30); // 20-50% at risk
      
      const populationAtRisk = totalPopulation * regionalPopProportion * atRiskFraction;
      
      // Determine cause
      let cause: import('../types/famine').FamineCause = 'crop_failure';
      if (regionData.contaminationLevel > 0.50) {
        cause = 'nuclear_winter'; // Radiation contamination
      } else if (regionData.climateStress > 0.60) {
        cause = 'drought'; // Climate-driven
      } else if (regionData.habitatLoss > 0.70) {
        cause = 'crop_failure'; // Land degradation
      }
      
      // Calculate food security level (based on ecosystem health)
      const foodSecurityLevel = Math.max(
        0.05, // Minimum 5% (not total zero)
        regionData.biodiversityIndex * 0.5 + regionData.ecosystemIntegrity * 0.5
      );
      
      // Trigger famine
      const { triggerFamine } = require('../types/famine');
      triggerFamine(
        state.famineSystem,
        month,
        regionName,
        populationAtRisk,
        cause,
        foodSecurityLevel
      );
      
      console.log(`\n🌾💀 ECOSYSTEM COLLAPSE FAMINE: ${regionName}`);
      console.log(`   Biodiversity: ${(regionData.biodiversityIndex * 100).toFixed(1)}%`);
      console.log(`   Ecosystem integrity: ${(regionData.ecosystemIntegrity * 100).toFixed(1)}%`);
      console.log(`   Population at risk: ${(populationAtRisk * 1000).toFixed(0)}M`);
      console.log(`   At-risk fraction: ${(atRiskFraction * 100).toFixed(1)}%`);
      console.log(`   Cause: ${cause}`);
      console.log(`   Food security level: ${(foodSecurityLevel * 100).toFixed(1)}%\n`);
    }
  }
}

/**
 * Calculate water security across population
 * 
 * Research basis:
 * - WHO: 50L/day minimum for health (drinking, cooking, hygiene)
 * - 20L/day survival minimum
 * - Freshwater depletion, climate change, pollution all threaten water access
 */
export function calculateWaterSecurity(state: GameState): number {
  const resources = state.resourceEconomy;
  const freshwater = state.freshwaterDepletion;
  const ocean = state.oceanAcidification;
  
  // Base water availability from resource stocks
  let waterSecurity = Math.min(1.0, resources.water.reserves);
  
  // === FRESHWATER DEPLETION ===
  // Day Zero droughts = acute water crisis
  if (freshwater && freshwater.dayZeroDrought.active) {
    const droughtSeverity = freshwater.dayZeroDrought.severity;
    waterSecurity -= droughtSeverity * 0.4; // Up to 40% reduction
  }
  
  // Peak Groundwater = declining availability
  if (freshwater && freshwater.peakGroundwater.active) {
    const depletionRate = freshwater.peakGroundwater.depletionRate;
    waterSecurity -= depletionRate * 0.3;
  }
  
  // General water stress
  if (freshwater && freshwater.waterStress > 0.40) {
    const stressPenalty = (freshwater.waterStress - 0.40) * 0.5;
    waterSecurity -= stressPenalty;
  }
  
  // === CLIMATE IMPACT ===
  // Temperature anomalies disrupt water cycle
  // Research: Each 1°C = 7% more atmospheric water vapor = more droughts AND floods
  const tempAnomaly = resources.co2.temperatureAnomaly;
  if (tempAnomaly > 2.0) {
    const climatePenalty = (tempAnomaly - 2.0) * 0.1;
    waterSecurity -= climatePenalty;
  }
  
  // === POLLUTION ===
  // Novel entities (PFAS, microplastics) contaminate water supplies
  if (state.novelEntities && state.novelEntities.pfasConcentration > 70) {
    const contamination = (state.novelEntities.pfasConcentration - 70) / 30; // 70-100 scale
    waterSecurity -= contamination * 0.15; // Up to 15% reduction
  }
  
  // === AI ENHANCEMENT ===
  // Desalination, water purification, infrastructure optimization
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
  if (totalAI > 1.5 && avgAlignment > 0.7) {
    const aiWater = Math.min(0.25, (totalAI - 1.5) * 0.08);
    waterSecurity += aiWater;
  }
  
  // === BREAKTHROUGH TECHNOLOGY ===
  // Clean energy enables desalination at scale
  const cleanEnergy = state.breakthroughTech.cleanEnergy?.deploymentLevel || 0;
  waterSecurity += cleanEnergy * 0.15; // Desalination powered by clean energy
  
  return Math.max(0, Math.min(1.5, waterSecurity));
}

/**
 * Calculate thermal habitability of planet
 * 
 * Research basis:
 * - Sherwood & Huber (2010): Wet-bulb 35°C = death in ~6 hours
 * - IPCC: +2°C makes Middle East, Pakistan, India marginal
 * - +4°C: Tropical belt dangerous for outdoor work
 */
export function calculateThermalHabitability(state: GameState): number {
  const tempAnomaly = state.resourceEconomy.co2.temperatureAnomaly;
  
  // Base habitability by temperature anomaly
  let habitableFraction = 1.0;
  
  if (tempAnomaly < 1.5) {
    // Below Paris Agreement target: Fully habitable with adaptation
    habitableFraction = 1.0;
  } else if (tempAnomaly < 2.5) {
    // 1.5-2.5°C: Regional impacts
    // Middle East, Pakistan, North India become marginal (~15% of land area)
    // Research: Wet-bulb temps regularly exceed 31°C (dangerous for outdoor work)
    habitableFraction = 0.85 - (tempAnomaly - 1.5) * 0.15;
  } else if (tempAnomaly < 4.0) {
    // 2.5-4°C: Tropical belt becomes dangerous
    // ~35% of land area affected (all tropics + sub-tropics)
    // Research: Wet-bulb temps approach 35°C during heat waves
    habitableFraction = 0.70 - (tempAnomaly - 2.5) * 0.20;
  } else if (tempAnomaly < 6.0) {
    // 4-6°C: Civilizational threat
    // 50%+ of land area regularly uninhabitable in summer
    habitableFraction = Math.max(0.20, 0.40 - (tempAnomaly - 4.0) * 0.10);
  } else {
    // >6°C: Hothouse Earth scenario
    // Only polar regions habitable
    habitableFraction = Math.max(0.05, 0.20 - (tempAnomaly - 6.0) * 0.05);
  }
  
  // === ADAPTATION FACTORS ===
  // AI can help with cooling infrastructure, but can't change physics
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
  
  // Advanced AI can provide adaptation infrastructure
  // But this only helps marginally - can't make 40°C wet-bulb survivable
  if (totalAI > 2.0 && avgAlignment > 0.7 && tempAnomaly < 4.0) {
    const adaptationBonus = Math.min(0.10, (totalAI - 2.0) * 0.03);
    habitableFraction += adaptationBonus;
  }
  
  // Climate engineering technology (risky but possible)
  const geoengineering = state.breakthroughTech.climateEngineering?.deploymentLevel || 0;
  if (geoengineering > 0.5) {
    // Can offset some warming, but risky and imperfect
    habitableFraction += geoengineering * 0.15;
  }
  
  return Math.max(0, Math.min(1.0, habitableFraction));
}

/**
 * Calculate shelter security across population
 * 
 * Research basis:
 * - Housing as human right (UN)
 * - Climate refugees from uninhabitable regions
 * - Economic access to housing (wealth distribution)
 */
export function calculateShelterSecurity(state: GameState): number {
  const society = state.society;
  const refugees = state.refugeeCrisisSystem;
  const wealth = state.globalMetrics.wealthDistribution;
  const ubiActive = state.government.activeRegulations.some(reg => reg.includes('UBI'));
  
  // Base shelter security from wealth distribution
  // Research: Housing insecurity correlates with income inequality
  let shelterSecurity = 0.7 + wealth * 0.2;
  
  // === REFUGEE CRISES ===
  // Displaced populations lose housing
  if (refugees && refugees.activeCrises) {
    const totalRefugees = Object.values(refugees.activeCrises)
      .reduce((sum, crisis) => sum + crisis.totalFled, 0);
    const refugeeFraction = (totalRefugees / 1000) / state.humanPopulationSystem.population; // millions to billions
    shelterSecurity -= refugeeFraction * 0.5; // Refugees have poor shelter access
  }
  
  // === CLIMATE DISPLACEMENT ===
  // Temperature anomalies force migration from uninhabitable regions
  const tempAnomaly = state.resourceEconomy.co2.temperatureAnomaly;
  if (tempAnomaly > 2.5) {
    // Significant displacement from tropics
    const displacementPenalty = (tempAnomaly - 2.5) * 0.08;
    shelterSecurity -= displacementPenalty;
  }
  
  // === ECONOMIC SECURITY ===
  // Unemployment without safety net = housing insecurity
  const unemployment = society.unemploymentLevel;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  if (economicStage < 3 && unemployment > 0.4 && !ubiActive) {
    // High unemployment without UBI = homelessness risk
    const economicPenalty = (unemployment - 0.4) * 0.3;
    shelterSecurity -= economicPenalty;
  }
  
  // === AI ENHANCEMENT ===
  // AI can optimize housing construction, prefab housing, resource allocation
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
  
  if (totalAI > 1.5 && avgAlignment > 0.7) {
    const aiHousing = Math.min(0.2, (totalAI - 1.5) * 0.06);
    shelterSecurity += aiHousing;
  }
  
  // === POST-SCARCITY ===
  // Stage 4: Housing becomes abundant
  if (economicStage >= 4) {
    shelterSecurity += 0.2;
  }
  
  // === UBI FLOOR ===
  // UBI ensures minimum housing security
  if (ubiActive && economicStage >= 3) {
    const ubiVariant = state.government.structuralChoices.ubiVariant || 'none';
    const ubiFloor = ubiVariant === 'generous' ? 0.85 : 0.70;
    shelterSecurity = Math.max(shelterSecurity, ubiFloor);
  }
  
  return Math.max(0, Math.min(1.0, shelterSecurity));
}

/**
 * ENHANCED DISTRIBUTION METRICS (Oct 12, 2025)
 * 
 * Calculate QoL inequality across regions to detect dystopian scenarios where
 * aggregate metrics look fine but specific populations suffer.
 * 
 * Research basis:
 * - Wilkinson & Pickett (2009): Gini >0.45 = social instability
 * - Rawls: Justice requires maximizing the welfare of the worst-off
 * - "Two worlds" dystopia: Some thrive while others suffer
 */
export function calculateDistributionMetrics(
  state: GameState,
  survivalFundamentals: {
    foodSecurity: number;
    waterSecurity: number;
    thermalHabitability: number;
    shelterSecurity: number;
  },
  basicQoL: {
    materialAbundance: number;
    energyAvailability: number;
    physicalSafety: number;
    mentalHealth: number;
    healthcareQuality: number;
  }
): {
  globalGini: number;
  regionalVariance: number;
  crisisAffectedFraction: number;
  worstRegionQoL: number;
  bestRegionQoL: number;
  medianRegionQoL: number;
  isDystopicInequality: boolean;
  isRegionalDystopia: boolean;
} {
  const regions = state.regionalPopulations;
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const refugees = state.refugeeCrisisSystem;
  const pop = state.humanPopulationSystem;
  
  // Calculate QoL for each region
  const regionalQoLs: number[] = [];
  let totalCrisisAffected = 0;
  
  if (regions && regions.regions) {
    for (const region of regions.regions) {
      // Region-specific modifiers based on crisis exposure
      let regionQoL = 0;
      
      // === SURVIVAL FUNDAMENTALS (weighted heavily) ===
      // These are most affected by regional crises
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
      // Modified by economic access and infrastructure
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
      // Modified by regional capacity and crisis impacts
      let regionHealth = basicQoL.healthcareQuality;
      let regionMentalHealth = basicQoL.mentalHealth;
      
      // Crisis zones have worse mental health
      const inCrisisZone = region.droughtAffected || 
                          region.conflictRisk > 0.5 || 
                          region.populationStress > 0.7;
      if (inCrisisZone) {
        regionMentalHealth *= 0.6; // 40% reduction
        totalCrisisAffected += region.population;
      }
      
      // Healthcare capacity varies by development
      // Assume wealthier regions have 1.3x capacity, poorer 0.7x
      const isWealthy = region.name.includes('North America') || 
                       region.name.includes('Europe') || 
                       region.name.includes('East Asia');
      regionHealth *= isWealthy ? 1.2 : 0.8;
      
      const healthScore = (
        regionHealth * 0.6 +
        regionMentalHealth * 0.4
      );
      
      // === AGGREGATE REGION QOL ===
      regionQoL = (
        survivalScore * 0.40 +
        basicNeedsScore * 0.30 +
        healthScore * 0.30
      );
      
      regionalQoLs.push(Math.max(0, Math.min(2, regionQoL)));
    }
  } else {
    // Fallback: Use simple crisis-based approximation
    // This handles cases where regional system isn't fully initialized
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
    if (env.ecosystemCollapseActive) crisisAffected += 0.10;
    if (social.meaningCollapseActive) crisisAffected += 0.30;
    if (social.socialUnrestActive) crisisAffected += 0.20;
    crisisAffected = Math.min(1.0, crisisAffected);
    
    totalCrisisAffected = crisisAffected * pop.population;
    
    // Create simplified distribution: crisis zones vs safe zones
    const crisisQoL = avgQoL * 0.3; // 70% reduction in crisis zones
    const safeQoL = avgQoL * 1.2; // 20% boost in safe zones
    
    // Add regions proportional to population split
    const numCrisisRegions = Math.ceil(crisisAffected * 10);
    const numSafeRegions = 10 - numCrisisRegions;
    
    for (let i = 0; i < numCrisisRegions; i++) {
      regionalQoLs.push(crisisQoL * (0.8 + Math.random() * 0.4)); // Some variation
    }
    for (let i = 0; i < numSafeRegions; i++) {
      regionalQoLs.push(safeQoL * (0.8 + Math.random() * 0.4));
    }
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
 * Calculate Gini coefficient for inequality measurement
 * 
 * Research basis:
 * - Gini = 0: Perfect equality (everyone has same QoL)
 * - Gini = 1: Perfect inequality (one person has all QoL)
 * - Gini >0.40: High inequality (problematic in democracies)
 * - Gini >0.50: Extreme inequality (typically authoritarian states)
 */
function calculateGiniCoefficient(values: number[]): number {
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

