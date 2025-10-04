/**
 * Core calculation functions for the AI Alignment Game simulation
 * 
 * This module provides backward compatibility by re-exporting functions
 * from specialized modules, plus core utilities that don't fit elsewhere.
 * 
 * Organization (Phase 2.5 refactor):
 * - capabilities.ts: Multi-dimensional AI capability system
 * - qualityOfLife.ts: QoL dimensions and calculations  
 * - balance.ts: Growth rates, alignment drift, regulations
 * - structuralEffects.ts: Policy consequences
 * - outcomes.ts: Outcome determination
 * - economics.ts: Economic stage transitions
 */

import { GameState } from '@/types/game';

// ============================================================================
// Re-exports from specialized modules (backward compatibility)
// ============================================================================

// Capabilities module
export {
  initializeCapabilityProfile,
  initializeResearchInvestments,
  calculateResearchTotal,
  calculateTotalCapabilityFromProfile,
  updateDerivedCapabilities,
  getIndustryImpact
} from './capabilities';

// Quality of Life module
export {
  calculateQualityOfLife,
  initializeQualityOfLifeSystems,
  updateQualityOfLifeSystems
} from './qualityOfLife';

// Balance mechanics module
export {
  calculateAICapabilityGrowthRate,
  calculateAlignmentDrift,
  calculateAlignmentResearchEffect,
  calculateCumulativeRegulationEffect,
  calculateComputeGovernanceEffect,
  calculateRacingDynamicsPressure
} from './balance';

// Structural effects module
export {
  calculateRegulationStructuralEffects,
  calculateUBIVariantEffects,
  calculateEmergentSurveillance
} from './structuralEffects';

// Outcomes module
export {
  calculateTotalAICapability,
  calculateAverageAlignment,
  calculateEffectiveControl,
  calculateOutcomeProbabilities,
  determineActualOutcome
} from './outcomes';

// ============================================================================
// Core utilities (remain in this file)
// ============================================================================

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
  const { aiAgents, society } = state;
  
  const totalBeneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalHarmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const recentActionRatio = totalBeneficialActions / Math.max(1, totalBeneficialActions + totalHarmfulActions);
  
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
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
  
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  
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
