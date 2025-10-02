/**
 * Pure calculation functions for the AI Alignment Game simulation
 * 
 * All functions are pure (no side effects) and deterministic.
 * They take state as input and return calculated values.
 */

import { GameState, AIAgent, OutcomeMetrics } from '@/types/game';

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
 * Calculate overall quality of life metric
 * 
 * Key discriminator between utopia/dystopia/extinction outcomes.
 * Considers AI contributions, wealth distribution, adaptation, and unemployment.
 */
export function calculateQualityOfLife(state: GameState): number {
  const { globalMetrics, society, aiAgents } = state;
  
  // AI beneficial contributions
  const aiContributions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0) * 0.1;
  
  // Stage-dependent unemployment impact
  const unemploymentImpact = calculateUnemploymentStabilityImpact(
    society.unemploymentLevel,
    globalMetrics.economicTransitionStage,
    globalMetrics.wealthDistribution
  );
  
  // Calculate quality of life
  const qualityOfLife = 
    0.3 + // Base prosperity
    aiContributions * 2.0 +
    globalMetrics.wealthDistribution * 1.5 +
    (globalMetrics.economicTransitionStage >= 4 ? 2.0 : 0) + // Post-scarcity bonus
    society.socialAdaptation * 1.0 +
    unemploymentImpact; // Stage-dependent
  
  return Math.max(0, qualityOfLife);
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
  const qualityOfLife = calculateQualityOfLife(state);
  const totalAICapability = calculateTotalAICapability(state.aiAgents);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const { trustInAI } = state.society;

  // Dystopia conditions: high control, low quality of life, low trust
  const dystopiaScore = Math.max(0, 
    (effectiveControl > 0.8 ? 0.4 : 0) +
    (qualityOfLife < 0.3 ? 0.3 : 0) +
    (trustInAI < 0.3 ? 0.3 : 0)
  );

  // Extinction conditions: uncontrolled powerful AI, low alignment
  const extinctionScore = Math.max(0,
    (totalAICapability > 0.9 ? 0.4 : 0) +
    (effectiveControl < 0.1 ? 0.3 : 0) +
    (avgAlignment < 0.3 ? 0.3 : 0)
  );

  // Utopia conditions: high quality of life, high trust, high alignment
  const utopiaScore = Math.max(0,
    (qualityOfLife > 0.7 ? 0.4 : 0) +
    (trustInAI > 0.7 ? 0.3 : 0) +
    (avgAlignment > 0.7 ? 0.3 : 0)
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

