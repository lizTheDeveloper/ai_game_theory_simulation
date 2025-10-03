/**
 * Pure calculation functions for the AI Alignment Game simulation
 * 
 * All functions are pure (no side effects) and deterministic.
 * They take state as input and return calculated values.
 */

import { GameState, AIAgent, OutcomeMetrics, GovernmentAgent, OutcomeType } from '@/types/game';

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
  const qol = calculateQualityOfLife(state);
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

