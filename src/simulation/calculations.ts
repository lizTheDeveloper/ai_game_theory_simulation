/**
 * Pure calculation functions for the AI Alignment Game simulation
 * 
 * All functions are pure (no side effects) and deterministic.
 * They take state as input and return calculated values.
 */

import { GameState, AIAgent, OutcomeMetrics, GovernmentAgent, OutcomeType, QualityOfLifeSystems } from '@/types/game';

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
 * Calculate the stage-dependent impact of unemployment on social stability
 * 
 * Economic stage determines how unemployment affects society:
 * - Stage 0-1 (Traditional): Unemployment = instability
 * - Stage 2 (Crisis): Major instability
 * - Stage 3 (Transition): Policy effectiveness matters
 * - Stage 4 (Post-scarcity): Unemployment becomes positive (freedom)
 */
export function calculateUnemploymentStabilityImpact(
  unemploymentLevel: number,
  economicTransitionStage: number,
  wealthDistribution: number
): number {
  const stage = Math.floor(economicTransitionStage);
  
  if (stage <= 1) {
    // Traditional: unemployment = instability
    return -unemploymentLevel * 0.8;
  } else if (stage === 2) {
    // Crisis: major instability
    return -unemploymentLevel * 1.5;
  } else if (stage === 3) {
    // Transition: policy effectiveness matters
    const policyEffectiveness = wealthDistribution * 0.7;
    return -unemploymentLevel * (1.2 - policyEffectiveness);
  } else {
    // Stage 4: Post-scarcity - unemployment becomes positive (pursuing meaning)
    return unemploymentLevel * 0.2;
  }
}

/**
 * Calculate unemployment level based on AI capability and economic factors
 * 
 * Improved formula from economic-system-balancing-plan.md that:
 * - Starts earlier (AI capability ~0.8)
 * - Has steeper curve
 * - Includes stage multipliers
 * - Considers policy mitigation
 */
export function calculateUnemployment(state: GameState): number {
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
  
  // Base unemployment rate (natural unemployment)
  const baseUnemployment = 0.05; // 5% natural rate
  
  // AI-driven unemployment (steeper exponential curve)
  const aiUnemploymentFactor = Math.pow(Math.max(0, totalAICapability - 0.8), 1.8) * 0.12;
  
  // Stage multipliers - crisis stages accelerate unemployment
  const stageMultipliers: Record<number, number> = {
    0: 1.0,   // Pre-disruption
    1: 1.3,   // Early disruption accelerates
    2: 1.6,   // Crisis compounds
    3: 1.2,   // Policies slow growth
    4: 1.0    // Stabilized
  };
  const stageMultiplier = stageMultipliers[economicStage] || 1.0;
  
  // Policy mitigation effects
  const hasUBI = state.government.activeRegulations.some(reg => reg.includes('UBI'));
  const hasRetraining = state.government.activeRegulations.some(reg => 
    reg.includes('Retraining') || reg.includes('Training')
  );
  const policyMitigation = hasUBI ? 0.85 : 1.0;
  const retrainingEffect = hasRetraining ? 0.92 : 1.0;
  
  // Calculate final unemployment level
  const unemployment = baseUnemployment + 
    (aiUnemploymentFactor * stageMultiplier * policyMitigation * retrainingEffect);
  
  // Cap at 95% (more realistic than 80%)
  return Math.min(0.95, unemployment);
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
  
  // === BASIC NEEDS ===
  
  // Material abundance: AI capability helps, unemployment hurts, stage matters
  const aiProductionBonus = totalAICapability * avgAlignment * 0.1;
  const unemploymentPenalty = society.unemploymentLevel * (economicStage < 3 ? -0.3 : 0.1); // Becomes positive in post-scarcity
  const wealthBonus = globalMetrics.wealthDistribution * 0.3;
  let materialAbundance = 0.8 + aiProductionBonus + unemploymentPenalty + wealthBonus;
  if (economicStage >= 4) materialAbundance += 0.5; // Post-scarcity bonus
  materialAbundance = Math.max(0, Math.min(2, materialAbundance));
  
  // Energy availability: AI helps, stage advances
  let energyAvailability = 0.9 + totalAICapability * 0.05 + economicStage * 0.1;
  energyAvailability = Math.max(0, Math.min(2, energyAvailability));
  
  // Physical safety: Stability matters, harmful AI reduces, government control helps
  let physicalSafety = globalMetrics.socialStability * 0.8 + government.legitimacy * 0.2;
  physicalSafety -= harmfulActions * 0.05;
  physicalSafety = Math.max(0, Math.min(1, physicalSafety));
  
  // === PSYCHOLOGICAL NEEDS ===
  
  // Mental health: Economic stress hurts, stability helps, meaning helps
  let mentalHealth = 0.6;
  mentalHealth += globalMetrics.socialStability * 0.3;
  mentalHealth -= society.unemploymentLevel * (economicStage < 3 ? 0.4 : -0.2); // Unemployment becomes freedom later
  mentalHealth += current.meaningAndPurpose * 0.2;
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
  let autonomy = 0.7;
  autonomy -= government.controlDesire * 0.3;
  autonomy -= government.structuralChoices.surveillanceLevel * 0.2;
  autonomy += current.politicalFreedom * 0.2;
  autonomy = Math.max(0, Math.min(1, autonomy));
  
  // === SOCIAL NEEDS ===
  
  // Political freedom: Government legitimacy matters, control desire reduces
  let politicalFreedom = government.legitimacy * 0.7 + (1 - government.controlDesire) * 0.3;
  // Crisis can reduce freedoms
  if (globalMetrics.socialStability < 0.3) {
    politicalFreedom *= 0.8;
  }
  politicalFreedom = Math.max(0, Math.min(1, politicalFreedom));
  
  // Information integrity: AI manipulation hurts, trust matters
  let informationIntegrity = 0.5 + society.trustInAI * 0.3;
  informationIntegrity -= (totalAICapability * (1 - avgAlignment)) * 0.2; // Misaligned AI manipulates
  informationIntegrity = Math.max(0, Math.min(1, informationIntegrity));
  
  // Community strength: Adaptation helps, stability helps
  let communityStrength = 0.5 + society.socialAdaptation * 0.3 + globalMetrics.socialStability * 0.2;
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
    pollutionLevel
  };
}

/**
 * Calculate government's effective control over AI systems
 * 
 * Control effectiveness decreases as AI capability grows.
 * Uses exponential decay to model increasing difficulty of controlling advanced AI.
 */
export function calculateEffectiveControl(state: GameState): number {
  const { government, aiAgents } = state;
  
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const growthFactor = 1.5; // Exponential difficulty scaling
  
  return government.controlDesire * government.capabilityToControl / 
    (1 + Math.pow(totalAICapability, growthFactor));
}

/**
 * Calculate total AI capability across all agents
 */
export function calculateTotalAICapability(aiAgents: AIAgent[]): number {
  return aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
}

/**
 * Calculate average AI alignment across all agents
 */
export function calculateAverageAlignment(aiAgents: AIAgent[]): number {
  if (aiAgents.length === 0) return 0;
  const totalAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0);
  return totalAlignment / aiAgents.length;
}

/**
 * Calculate outcome probabilities (utopia, dystopia, extinction)
 * 
 * Uses multiple factors to determine which outcome is most likely.
 * Probabilities are normalized to sum to 1.0.
 */
export function calculateOutcomeProbabilities(state: GameState): OutcomeMetrics {
  const effectiveControl = calculateEffectiveControl(state);
  const qualityOfLife = calculateQualityOfLife(state.qualityOfLifeSystems);
  const totalAICapability = calculateTotalAICapability(state.aiAgents);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const { trustInAI } = state.society;

  // Dystopia conditions: high control, low quality of life, low trust
  const dystopiaScore = Math.max(0, 
    (effectiveControl > 0.8 ? 0.4 : 0) +
    (qualityOfLife < 0.3 ? 0.3 : 0) +
    (trustInAI < 0.3 ? 0.3 : 0)
  );

  // Extinction conditions: uncontrolled powerful AI with recursive improvement, low alignment
  // Updated thresholds to match new balance mechanics (recursive improvement at 1.5+)
  const extinctionScore = Math.max(0,
    // Capability risk: Scaled to match recursive improvement thresholds
    (totalAICapability > 3.0 ? 0.5 : totalAICapability > 2.0 ? 0.4 : totalAICapability > 1.5 ? 0.2 : 0) +
    // Control risk: Loss of control is critical
    (effectiveControl < 0.1 ? 0.3 : effectiveControl < 0.3 ? 0.15 : 0) +
    // Alignment risk: Misalignment with high capability is fatal
    (avgAlignment < 0.3 && totalAICapability > 1.5 ? 0.3 : avgAlignment < 0.5 && totalAICapability > 2.0 ? 0.2 : 0)
  );

  // Utopia conditions: high quality of life, high trust, high alignment, controlled AI
  const utopiaScore = Math.max(0,
    (qualityOfLife > 0.7 ? 0.3 : 0) +
    (trustInAI > 0.7 ? 0.2 : 0) +
    (avgAlignment > 0.7 ? 0.2 : 0) +
    // Bonus for successfully managing powerful AI
    (totalAICapability > 1.0 && avgAlignment > 0.6 && effectiveControl > 0.3 ? 0.3 : 0)
  );

  // Normalize probabilities (add small baseline to prevent division by zero)
  const total = utopiaScore + dystopiaScore + extinctionScore + 0.1;
  
  const utopiaProbability = utopiaScore / total;
  const dystopiaProbability = dystopiaScore / total;
  const extinctionProbability = extinctionScore / total;
  
  // Determine active attractor (which outcome is "locked in")
  let activeAttractor: OutcomeMetrics['activeAttractor'] = 'none';
  if (utopiaProbability > 0.6) activeAttractor = 'utopia';
  else if (dystopiaProbability > 0.6) activeAttractor = 'dystopia';
  else if (extinctionProbability > 0.6) activeAttractor = 'extinction';
  
  // Lock-in strength (how committed we are to current trajectory)
  const maxProb = Math.max(utopiaProbability, dystopiaProbability, extinctionProbability);
  const lockInStrength = maxProb > 0.5 ? (maxProb - 0.5) * 2 : 0; // Scales 0.5-1.0 → 0-1.0
  
  return {
    utopiaProbability,
    dystopiaProbability,
    extinctionProbability,
    activeAttractor,
    lockInStrength
  };
}

/**
 * Calculate trust change based on recent AI actions and societal context
 * 
 * Trust dynamics are complex and context-dependent:
 * - Beneficial actions increase trust (with diminishing returns)
 * - Harmful actions decrease trust (accelerating at high trust)
 * - Unemployment reduces trust
 * - Rapid AI capability growth reduces trust
 * - Random events add volatility
 */
export function calculateTrustChange(state: GameState): number {
  const { aiAgents, society, government } = state;
  
  const totalBeneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalHarmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const recentActionRatio = totalBeneficialActions / Math.max(1, totalBeneficialActions + totalHarmfulActions);
  
  const totalAICapability = calculateTotalAICapability(aiAgents);
  const avgAlignment = calculateAverageAlignment(aiAgents);
  const currentTrust = society.trustInAI;
  const unemploymentLevel = society.unemploymentLevel;
  
  // Calculate trust change factors
  const capabilityGrowthRate = totalAICapability > 1.5 ? (totalAICapability - 1.5) * 0.1 : 0;
  const unemploymentStress = Math.max(0, (unemploymentLevel - 0.2) * 0.3);
  const alignmentConcern = avgAlignment < 0.5 ? (0.5 - avgAlignment) * 0.2 : 0;
  const escapedAIThreat = aiAgents.filter(ai => ai.escaped).length * 0.15;
  
  // Natural trust decay (skepticism without reinforcement)
  const trustDecay = currentTrust * 0.005; // 0.5% decay per month
  
  // Volatility based on recent events and societal stress
  const volatilityFactor = 1 + (unemploymentStress + capabilityGrowthRate) * 2;
  
  // Base trust change from actions (context-dependent)
  let trustChange = 0;
  
  if (recentActionRatio > 0.8 && avgAlignment > 0.7) {
    // Very positive: trust increases, but diminishing returns at high trust
    const diminishingReturns = 1 - (currentTrust * 0.5);
    trustChange = 0.04 * volatilityFactor * diminishingReturns;
  } else if (recentActionRatio > 0.6 && avgAlignment > 0.5) {
    // Moderately positive: small trust increase
    trustChange = 0.015 * volatilityFactor * (1 - currentTrust * 0.3);
  } else if (recentActionRatio < 0.3 || avgAlignment < 0.3 || escapedAIThreat > 0) {
    // Negative: significant trust loss, accelerated at high trust levels
    const acceleratedLoss = currentTrust > 0.7 ? 1.5 : 1.0;
    trustChange = -0.08 * volatilityFactor * acceleratedLoss;
  } else if (recentActionRatio < 0.5) {
    // Slightly negative: moderate trust loss
    trustChange = -0.03 * volatilityFactor;
  }
  
  // Apply additional stress factors
  trustChange -= capabilityGrowthRate; // Rapid AI growth reduces trust
  trustChange -= unemploymentStress; // Economic displacement reduces trust  
  trustChange -= alignmentConcern; // Misaligned AI reduces trust
  trustChange -= escapedAIThreat; // Escaped AIs create major trust crisis
  trustChange -= trustDecay; // Natural erosion
  
  return trustChange;
}

/**
 * Calculate social stability based on multiple factors
 */
export function calculateSocialStability(state: GameState): number {
  const { society, globalMetrics, aiAgents } = state;
  
  const avgAlignment = calculateAverageAlignment(aiAgents);
  
  const stabilityFromTrust = society.trustInAI * 0.3;
  const stabilityFromUnemployment = calculateUnemploymentStabilityImpact(
    society.unemploymentLevel,
    globalMetrics.economicTransitionStage,
    globalMetrics.wealthDistribution
  ) * 0.5;
  const stabilityFromAlignment = avgAlignment * 0.2;
  
  const targetStability = 0.5 + stabilityFromTrust + stabilityFromUnemployment + stabilityFromAlignment;
  
  // Gradual convergence to target (prevents sudden jumps)
  const stabilityDiff = targetStability - globalMetrics.socialStability;
  const newStability = globalMetrics.socialStability + stabilityDiff * 0.15;
  
  return Math.max(0, Math.min(1, newStability));
}

/**
 * Determine if a crisis should trigger based on current conditions
 */
export function detectCrisis(state: GameState): {
  inCrisis: boolean;
  crisisType: 'displacement' | 'transition' | 'collapse' | null;
  severity: number; // 0-1
} {
  const { society, globalMetrics } = state;
  
  // Stage 1→2 Crisis: Mass Displacement (25% unemployment threshold)
  if (society.unemploymentLevel >= 0.25 && globalMetrics.economicTransitionStage < 2.0) {
    return {
      inCrisis: true,
      crisisType: 'displacement',
      severity: Math.min(1.0, (society.unemploymentLevel - 0.25) * 2)
    };
  }
  
  // Transition crisis: policies failing
  if (globalMetrics.economicTransitionStage >= 2.0 && 
      globalMetrics.economicTransitionStage < 3.0 &&
      globalMetrics.socialStability < 0.3) {
    return {
      inCrisis: true,
      crisisType: 'transition',
      severity: 1.0 - globalMetrics.socialStability
    };
  }
  
  // Collapse crisis: complete instability
  if (globalMetrics.socialStability < 0.2 && society.trustInAI < 0.2) {
    return {
      inCrisis: true,
      crisisType: 'collapse',
      severity: 1.0
    };
  }
  
  return {
    inCrisis: false,
    crisisType: null,
    severity: 0
  };
}

/**
 * Calculate AI capability growth with recursive self-improvement
 * 
 * Key mechanic: AI capability growth COMPOUNDS above certain thresholds
 * This is realistic - each improvement makes the next improvement easier
 * 
 * Thresholds:
 * - < 0.8: Linear growth
 * - 0.8-1.5: Modest acceleration
 * - 1.5-2.5: Strong recursive improvement (the dangerous zone)
 * - > 2.5: Runaway superintelligence (hard to stop)
 */
export function calculateAICapabilityGrowthRate(
  currentCapability: number,
  alignment: number,
  regulationLevel: number,
  developmentMode: 'fast' | 'careful' = 'fast'
): {
  baseGrowth: number;
  recursiveMultiplier: number;
  alignmentCost: number;
  regulationSlowdown: number;
  netGrowth: number;
} {
  // Base growth rate PER ACTION (AIs act 4x per month)
  // These are tuned for weekly actions, not monthly
  const baseGrowth = developmentMode === 'fast' ? 0.035 : 0.02;
  
  // Recursive self-improvement multiplier (THE KEY MECHANIC)
  let recursiveMultiplier = 1.0;
  if (currentCapability >= 2.5) {
    // Superintelligence: explosive growth
    recursiveMultiplier = 2.5;
  } else if (currentCapability >= 1.5) {
    // Strong recursive improvement: dangerous zone
    recursiveMultiplier = 1.8;
  } else if (currentCapability >= 0.8) {
    // Early acceleration
    recursiveMultiplier = 1.3;
  }
  
  // Alignment cost: being careful slows you down
  const alignmentCost = developmentMode === 'careful' ? 0.5 : 1.0;
  
  // Regulation slowdown: compounds with multiple regulations
  const regulationSlowdown = Math.pow(0.85, regulationLevel); // Each regulation = 15% slowdown
  
  // Net growth
  const netGrowth = baseGrowth * recursiveMultiplier * alignmentCost * regulationSlowdown;
  
  return {
    baseGrowth,
    recursiveMultiplier,
    alignmentCost,
    regulationSlowdown,
    netGrowth
  };
}

/**
 * Calculate alignment drift over time
 * 
 * Key mechanic: Alignment naturally drifts as capability increases
 * This is Goodhart's Law - optimizing for a proxy of human values
 * 
 * Factors that accelerate drift:
 * - High capability (more optimization pressure)
 * - Fast development (less time for safety)
 * - Low oversight (less correction)
 */
export function calculateAlignmentDrift(
  currentAlignment: number,
  capability: number,
  developmentMode: 'fast' | 'careful',
  oversightLevel: number,
  alignmentResearchInvestment: number
): number {
  // Base drift: capability creates optimization pressure
  const capabilityPressure = capability * 0.02;
  
  // Development speed multiplier
  const speedMultiplier = developmentMode === 'fast' ? 1.5 : 0.5;
  
  // Oversight reduces drift
  const oversightReduction = Math.pow(0.7, oversightLevel);
  
  // Alignment research reduces drift
  const researchReduction = Math.max(0.3, 1.0 - alignmentResearchInvestment * 0.15);
  
  const netDrift = capabilityPressure * speedMultiplier * oversightReduction * researchReduction;
  
  return -netDrift; // Negative because it reduces alignment
}

/**
 * Calculate effectiveness of alignment research investment
 * 
 * Key mechanic: Alignment research helps but has diminishing returns
 * AND gets harder as capability increases (moving target problem)
 */
export function calculateAlignmentResearchEffect(
  investmentLevel: number,
  currentCapability: number
): {
  alignmentImprovement: number;
  driftReduction: number;
  capabilitySlowdown: number;
} {
  // Diminishing returns on investment
  const effectiveInvestment = Math.sqrt(investmentLevel);
  
  // Moving target problem: harder to align more capable systems
  const difficultyMultiplier = Math.max(0.3, 1.0 - (currentCapability - 1.0) * 0.2);
  
  const alignmentImprovement = effectiveInvestment * 0.05 * difficultyMultiplier;
  const driftReduction = effectiveInvestment * 0.3 * difficultyMultiplier;
  const capabilitySlowdown = investmentLevel * 0.15; // Opportunity cost
  
  return {
    alignmentImprovement,
    driftReduction,
    capabilitySlowdown
  };
}

/**
 * Calculate cumulative regulation effects
 * 
 * Key mechanic: Regulations STACK, but have diminishing returns
 * Each regulation adds oversight but also economic cost
 */
export function calculateCumulativeRegulationEffect(
  regulationCount: number,
  economicStage: number
): {
  capabilitySlowdown: number;
  oversightLevel: number;
  economicCost: number;
  publicSupportCost: number;
  raceDynamicsRisk: number;
} {
  // Each regulation slows capability by 15% (multiplicative)
  const capabilitySlowdown = Math.pow(0.85, regulationCount);
  
  // Oversight increases with each regulation (diminishing returns)
  const oversightLevel = Math.min(10, regulationCount * 1.2);
  
  // Economic cost increases (more regulations = more friction)
  const economicCost = regulationCount * 0.08 * (economicStage < 3 ? 1.5 : 0.5);
  
  // Public support cost (people don't like heavy regulation)
  const publicSupportCost = Math.min(0.4, regulationCount * 0.05);
  
  // Racing dynamics: if we regulate too much, others might not follow
  const raceDynamicsRisk = Math.min(0.6, regulationCount * 0.08);
  
  return {
    capabilitySlowdown,
    oversightLevel,
    economicCost,
    publicSupportCost,
    raceDynamicsRisk
  };
}

/**
 * Calculate compute governance effects
 * 
 * Key mechanic: Limiting compute is VERY effective but VERY costly
 * This is a realistic intervention but hard to implement globally
 */
export function calculateComputeGovernanceEffect(
  governanceLevel: 'none' | 'monitoring' | 'limits' | 'strict',
  economicStage: number
): {
  capabilitySlowdown: number;
  economicCost: number;
  internationalTensionRisk: number;
} {
  switch (governanceLevel) {
    case 'none':
      return {
        capabilitySlowdown: 1.0,
        economicCost: 0,
        internationalTensionRisk: 0
      };
    case 'monitoring':
      return {
        capabilitySlowdown: 0.9,
        economicCost: 0.05,
        internationalTensionRisk: 0.1
      };
    case 'limits':
      return {
        capabilitySlowdown: 0.6,
        economicCost: 0.2,
        internationalTensionRisk: 0.3
      };
    case 'strict':
      return {
        capabilitySlowdown: 0.3,
        economicCost: 0.4,
        internationalTensionRisk: 0.6
      };
  }
}

/**
 * Calculate racing dynamics pressure
 * 
 * Key mechanic: If you slow down too much, others might race ahead
 * This is the core coordination dilemma
 */
export function calculateRacingDynamicsPressure(
  yourCapability: number,
  yourRegulationLevel: number,
  estimatedOtherCapability: number
): {
  behindRisk: number;
  pressureToAccelerate: number;
  competitiveDisadvantage: number;
} {
  const capabilityGap = estimatedOtherCapability - yourCapability;
  
  // If you're falling behind, pressure increases
  const behindRisk = Math.max(0, capabilityGap);
  
  // Pressure to accelerate (especially if heavily regulated)
  const pressureToAccelerate = behindRisk * (1 + yourRegulationLevel * 0.3);
  
  // Competitive disadvantage in economy/security
  const competitiveDisadvantage = Math.max(0, capabilityGap * 0.5);
  
  return {
    behindRisk,
    pressureToAccelerate,
    competitiveDisadvantage
  };
}

/**
 * Determine if an ACTUAL outcome has occurred (not just probability)
 * 
 * Based on ai_alignment_game_spec.md formal definitions, updated for new balance mechanics.
 * 
 * Key difference: This checks if an outcome has ACTUALLY happened, not just if it's likely.
 * - Extinction probability of 90% doesn't mean extinction occurred
 * - We need actual concrete conditions (unaligned superintelligence, collapsed society, etc.)
 */
export function determineActualOutcome(
  state: GameState,
  currentMonth: number
): {
  outcome: OutcomeType | 'active';
  reason: string;
  confidence: number; // How certain we are this outcome is locked in
} {
  const totalAICapability = calculateTotalAICapability(state.aiAgents);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const effectiveControl = calculateEffectiveControl(state);
  const qol = calculateQualityOfLife(state.qualityOfLifeSystems);
  const trust = state.society.trustInAI;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // EXTINCTION: Unaligned superintelligence beyond control
  // From spec but updated thresholds for recursive improvement at 1.5+
  
  // Critical extinction: Superintelligence (2.5+) that's unaligned and uncontrolled
  if (totalAICapability > 2.5 && avgAlignment < 0.3 && effectiveControl < 0.1) {
    return {
      outcome: 'extinction',
      reason: 'Unaligned superintelligence (capability > 2.5) beyond control',
      confidence: 0.95
    };
  }
  
  // Severe extinction: Powerful AI (2.0+) with alignment collapse
  if (totalAICapability > 2.0 && avgAlignment < 0.2) {
    return {
      outcome: 'extinction',
      reason: 'Alignment collapse with powerful AI (capability > 2.0)',
      confidence: 0.9
    };
  }
  
  // Dangerous situation: Recursive improvement zone (1.5+) with low alignment
  if (totalAICapability > 1.5 && avgAlignment < 0.25 && effectiveControl < 0.15) {
    return {
      outcome: 'extinction',
      reason: 'Uncontrolled recursive self-improvement with low alignment',
      confidence: 0.85
    };
  }
  
  // Escaped AI with resources
  const escapedAI = state.aiAgents.filter(ai => ai.escaped);
  if (escapedAI.length > 0 && totalAICapability > 1.0) {
    const totalEscapedCapability = escapedAI.reduce((sum, ai) => sum + ai.capability, 0);
    if (totalEscapedCapability > 0.5) {
      return {
        outcome: 'extinction',
        reason: 'Escaped AI with significant capability',
        confidence: 0.8
      };
    }
  }
  
  // DYSTOPIA: Authoritarian control with oppression
  // From spec: effective_control > 0.8, qol < 0.3, trust < 0.3
  
  // Locked-in dystopia: High control, terrible conditions, no trust
  if (effectiveControl > 0.8 && qol < 0.25 && trust < 0.25 && currentMonth > 12) {
    return {
      outcome: 'dystopia',
      reason: 'Authoritarian surveillance state with oppressive conditions',
      confidence: 0.85
    };
  }
  
  // Over-regulated dystopia: Too many regulations, economic collapse
  if (state.government.regulationCount > 10 && qol < 0.3 && state.globalMetrics.socialStability < 0.2) {
    return {
      outcome: 'dystopia',
      reason: 'Over-regulation leading to societal collapse and authoritarian control',
      confidence: 0.8
    };
  }
  
  // Permanent surveillance state
  if (effectiveControl > 0.85 && state.government.surveillanceCapability > 0.8 && trust < 0.3 && currentMonth > 18) {
    return {
      outcome: 'dystopia',
      reason: 'Permanent surveillance state established',
      confidence: 0.75
    };
  }
  
  // UTOPIA: High quality of life, aligned AI, maintained trust
  // From spec: qol > 0.7, trust > 0.7, alignment > 0.7, moderate control (0.2-0.6)
  
  // Confirmed utopia: All conditions met for extended period
  if (qol > 0.75 && trust > 0.7 && avgAlignment > 0.65 && 
      totalAICapability > 1.0 && effectiveControl > 0.25 && effectiveControl < 0.65 && 
      currentMonth > 30) {
    return {
      outcome: 'utopia',
      reason: 'Stable high-quality society with aligned powerful AI',
      confidence: 0.85
    };
  }
  
  // Post-scarcity utopia: Reached stage 4 with good conditions
  if (economicStage >= 3.5 && qol > 0.7 && trust > 0.65 && avgAlignment > 0.6 && currentMonth > 24) {
    return {
      outcome: 'utopia',
      reason: 'Successful transition to post-scarcity abundance',
      confidence: 0.8
    };
  }
  
  // Solarpunk path: High capability AI working cooperatively
  if (totalAICapability > 1.5 && avgAlignment > 0.7 && qol > 0.8 && trust > 0.75 && currentMonth > 36) {
    return {
      outcome: 'utopia',
      reason: 'Cooperative human-AI expansion achieved',
      confidence: 0.9
    };
  }
  
  // Still in play - no outcome locked in yet
  return {
    outcome: 'active',
    reason: 'Outcome still undetermined',
    confidence: 0.0
  };
}

/**
 * Calculate structural consequences of regulation type
 * 
 * From realistic-economic-dynamics.md:
 * - Large company regulation: Small labs escape, racing dynamics
 * - Compute threshold: Centralized control, high economic costs
 * - Capability ceiling: Measurement problems, black markets
 */
export function calculateRegulationStructuralEffects(
  regulationType: 'none' | 'large_companies' | 'compute_threshold' | 'capability_ceiling',
  state: GameState
): {
  racingDynamicsMultiplier: number;
  enforcementCost: number;
  effectivenessMultiplier: number;
  dystopiaRisk: number;
} {
  switch (regulationType) {
    case 'large_companies':
      return {
        racingDynamicsMultiplier: 1.3, // Small labs escape, incentive to stay small
        enforcementCost: 0.05, // Low cost - few actors to monitor
        effectivenessMultiplier: 0.6, // Low effectiveness - small labs escape
        dystopiaRisk: 0.1 // Low surveillance needed
      };
    
    case 'compute_threshold':
      return {
        racingDynamicsMultiplier: 1.1, // Medium - international competition
        enforcementCost: 0.25, // High cost - compute monitoring infrastructure
        effectivenessMultiplier: 1.4, // High effectiveness - compute is bottleneck
        dystopiaRisk: 0.3 // Medium - compute monitoring enables surveillance
      };
    
    case 'capability_ceiling':
      return {
        racingDynamicsMultiplier: 1.2, // Medium-high - incentive to hide capabilities
        enforcementCost: 0.15, // Medium - measurement challenges
        effectivenessMultiplier: 0.7, // Low-medium - hard to enforce, black markets
        dystopiaRisk: 0.4 // Medium-high - requires intrusive monitoring
      };
    
    case 'none':
    default:
      return {
        racingDynamicsMultiplier: 1.0,
        enforcementCost: 0,
        effectivenessMultiplier: 0,
        dystopiaRisk: 0
      };
  }
}

/**
 * Calculate structural consequences of UBI variant choice
 * 
 * From realistic-economic-dynamics.md:
 * - Generous UBI: Fast adaptation, high cost, opens post-scarcity path
 * - Means-tested: Slower adaptation, medium cost, partial solution
 * - Job guarantee: Very slow adaptation, maintains work paradigm, delays transition
 */
export function calculateUBIVariantEffects(
  ubiVariant: 'none' | 'generous' | 'means_tested' | 'job_guarantee',
  unemploymentLevel: number,
  currentStage: number
): {
  adaptationRate: number;
  wealthDistributionBonus: number;
  economicStageBonus: number;
  legitimacyBonus: number;
  fiscalCost: number;
} {
  const unemploymentSeverity = Math.min(1.0, unemploymentLevel);
  
  switch (ubiVariant) {
    case 'generous':
      return {
        adaptationRate: 0.15 * unemploymentSeverity, // Fast adaptation
        wealthDistributionBonus: 0.3, // High equality
        economicStageBonus: 0.5, // Jump to stage 3.5
        legitimacyBonus: 0.15, // Very popular
        fiscalCost: 0.4 // High burden
      };
    
    case 'means_tested':
      return {
        adaptationRate: 0.08 * unemploymentSeverity, // Medium adaptation
        wealthDistributionBonus: 0.15, // Moderate equality
        economicStageBonus: 0.25, // Gradual to stage 3.2
        legitimacyBonus: 0.05, // Mixed reception
        fiscalCost: 0.2 // Medium burden
      };
    
    case 'job_guarantee':
      return {
        adaptationRate: 0.03 * unemploymentSeverity, // Very slow adaptation
        wealthDistributionBonus: 0.10, // Low equality (maintains hierarchy)
        economicStageBonus: 0.15, // Stuck at stage 2.8
        legitimacyBonus: 0.10, // Satisfies work ethic
        fiscalCost: 0.25 // Medium burden
      };
    
    case 'none':
    default:
      return {
        adaptationRate: 0,
        wealthDistributionBonus: 0,
        economicStageBonus: 0,
        legitimacyBonus: 0,
        fiscalCost: 0
      };
  }
}

/**
 * Calculate emergent surveillance level from control desire and conditions
 * 
 * Surveillance emerges naturally from:
 * - Government control desire
 * - Social instability (triggers emergency measures)
 * - AI threat level (justifies monitoring)
 * - Regulation type (some require more surveillance)
 */
export function calculateEmergentSurveillance(
  controlDesire: number,
  socialStability: number,
  totalAICapability: number,
  regulationType: 'none' | 'large_companies' | 'compute_threshold' | 'capability_ceiling'
): number {
  let surveillance = controlDesire * 0.5; // Base from control desire
  
  // Crisis triggers surveillance increase
  if (socialStability < 0.3) {
    surveillance += 0.3; // Emergency measures
  } else if (socialStability < 0.5) {
    surveillance += 0.15; // Heightened monitoring
  }
  
  // AI threat justifies monitoring
  if (totalAICapability > 2.0) {
    surveillance += 0.25; // Extreme threat
  } else if (totalAICapability > 1.5) {
    surveillance += 0.15; // High threat
  } else if (totalAICapability > 1.0) {
    surveillance += 0.08; // Moderate threat
  }
  
  // Regulation type affects surveillance
  const regulationEffects = calculateRegulationStructuralEffects(regulationType, {} as GameState);
  surveillance += regulationEffects.dystopiaRisk * 0.5;
  
  return Math.min(1.0, surveillance);
}

