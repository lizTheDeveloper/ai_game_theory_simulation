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
import { calculateQualityOfLife as _calculateQualityOfLife } from './qualityOfLife';

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
  getIndustryImpact,
  scaleCapabilityProfile,
  calculateObservableAICapability
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
  determineActualOutcome,
  updateGoldenAgeState,  // Phase: Golden Age & Accumulation Systems
  checkGoldenAgeConditions  // Phase: Golden Age & Accumulation Systems
} from './outcomes';

// Environmental Accumulation module (Phase 2)
export {
  initializeEnvironmentalAccumulation,
  updateEnvironmentalAccumulation,
  getEnvironmentalSustainability,
  hasEnvironmentalCrisis
} from './environmental';

// Social Cohesion module (Phase 3)
export {
  initializeSocialAccumulation,
  updateSocialAccumulation,
  getSocialSustainability,
  hasSocialCrisis
} from './socialCohesion';

// Technological Risk module (Phase 4)
export {
  initializeTechnologicalRisk,
  updateTechnologicalRisk,
  getTechnologicalSafety,
  hasTechnologicalCrisis
} from './technologicalRisk';

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
 * Update paranoia level based on harmful events and natural decay
 * 
 * Phase 2.8: PARANOIA SYSTEM
 * Research basis: Kahneman & Tversky (1979), Gilbert et al. (1998), Sunstein (2005)
 * 
 * Key insight: Paranoia DECAYS without reinforcement, trust RECOVERS
 * - Harmful events REFRESH paranoia (prevent decay, enable cascade)
 * - Beneficial actions REDUCE paranoia faster
 * - Capability growth alone does NOT increase paranoia (unless harmful)
 * - Trust is inverse of paranoia
 */
export function updateParanoia(state: GameState): void {
  const { aiAgents, society } = state;
  
  const totalBeneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalHarmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const escapedAIs = aiAgents.filter(ai => ai.escaped).length;
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const control = state.government.controlCapability;
  
  let paranoiaLevel = society.paranoiaLevel;
  
  // === 1. PARANOIA DECAYS NATURALLY (0.5%/month) ===
  // Without reinforcement, fear fades (availability heuristic decay)
  const paranoiaDecay = -paranoiaLevel * 0.005;
  paranoiaLevel = Math.max(0, paranoiaLevel + paranoiaDecay);
  
  // === 2. HARMFUL EVENTS REFRESH PARANOIA ===
  // Each harmful action prevents decay and increases paranoia
  if (totalHarmfulActions > 0) {
    const paranoiaIncrease = Math.min(0.3, totalHarmfulActions * 0.01);
    paranoiaLevel = Math.min(1.0, paranoiaLevel + paranoiaIncrease);
    
    // Amplify if control gap is large AND harmful events happening
    const controlGap = Math.max(0, totalAICapability - control);
    if (controlGap > 2.0) {
      const gapAmplification = Math.min(0.1, (controlGap - 2.0) * 0.02);
      paranoiaLevel = Math.min(1.0, paranoiaLevel + gapAmplification);
    }
  }
  
  // === 3. ESCAPED AIs SPIKE PARANOIA ===
  if (escapedAIs > 0) {
    const escapedSpike = Math.min(0.4, escapedAIs * 0.15);
    paranoiaLevel = Math.min(1.0, paranoiaLevel + escapedSpike);
  }
  
  // === 4. BENEFICIAL ACTIONS REDUCE PARANOIA ===
  // More effective than natural decay if AIs are net positive
  if (totalBeneficialActions > totalHarmfulActions) {
    const netBeneficial = totalBeneficialActions - totalHarmfulActions;
    const paranoiaReduction = Math.min(0.05, netBeneficial * 0.003);
    paranoiaLevel = Math.max(0, paranoiaLevel - paranoiaReduction);
  }
  
  // === 5. VERY LOW ALIGNMENT CREATES UNEASE ===
  // Even without visible harm, people sense something is wrong
  if (avgAlignment < 0.3 && totalAICapability > 3.0) {
    const uncanny = Math.min(0.02, (0.3 - avgAlignment) * 0.05);
    paranoiaLevel = Math.min(1.0, paranoiaLevel + uncanny);
  }
  
  // Update paranoia
  society.paranoiaLevel = paranoiaLevel;
  
  // === 6. TRUST IS INVERSE OF PARANOIA ===
  // Floor: Even 100% paranoia leaves 20% trust (some people always believe)
  // Ceiling: Even 0% paranoia caps at 95% trust (healthy skepticism)
  const trustFromParanoia = Math.max(0.2, Math.min(0.95, 1.0 - paranoiaLevel * 0.75));
  
  // Smooth transition (don't jump instantly)
  const smoothing = 0.3; // 30% new value, 70% old value
  society.trustInAI = society.trustInAI * (1 - smoothing) + trustFromParanoia * smoothing;
}

/**
 * Calculate trust change based on recent AI actions and societal context
 * 
 * Phase 2.8: DEPRECATED - now using paranoia system
 * Kept for backwards compatibility but paranoia system is primary
 */
export function calculateTrustChange(state: GameState): number {
  const { aiAgents, society } = state;
  
  const totalBeneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalHarmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const totalActions = totalBeneficialActions + totalHarmfulActions;
  
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  const currentTrust = society.trustInAI;
  const unemploymentLevel = society.unemploymentLevel;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const escapedAIs = aiAgents.filter(ai => ai.escaped).length;
  
  // QoL affects how people interpret AI actions
  const qol = _calculateQualityOfLife(state.qualityOfLifeSystems);
  
  // === PRIMARY: Direct action-based trust ===
  // Each beneficial action adds a small amount of trust
  // Each harmful action removes more trust (negativity bias)
  let actionBasedTrust = 0;
  
  if (totalActions > 0) {
    // Beneficial actions: +0.002 per action, with diminishing returns at high trust
    // QoL multiplier: high QoL makes trust easier to gain (1.0-1.5x)
    const qolMultiplier = 1.0 + Math.min(0.5, qol * 0.5);
    const beneficialGain = totalBeneficialActions * 0.002 * (1 - currentTrust * 0.6) * qolMultiplier;
    
    // Harmful actions: -0.005 per action (2.5x negativity bias), accelerated at high trust
    // QoL buffer: high QoL reduces blame (0.5-1.0x penalty)
    const acceleratedLoss = currentTrust > 0.6 ? 1.5 : 1.0;
    const qolBuffer = Math.max(0.5, 1.0 - qol * 0.5); // High QoL = less reactive to harm
    const harmfulLoss = totalHarmfulActions * 0.005 * acceleratedLoss * qolBuffer;
    
    actionBasedTrust = beneficialGain - harmfulLoss;
  }
  
  // === SECONDARY: Context modifiers (much weaker than before) ===
  
  // Unemployment: Only matters in pre-scarcity (stage < 3)
  let unemploymentModifier = 0;
  if (economicStage < 3 && unemploymentLevel > 0.4) {
    // High unemployment reduces trust by up to -0.015/month
    unemploymentModifier = -Math.min(0.015, (unemploymentLevel - 0.4) * 0.025);
  }
  // In post-scarcity (stage >= 3), unemployment becomes leisure, no penalty
  
  // Capability growth: Only penalize if growing very fast AND alignment is low
  let capabilityFear = 0;
  if (totalAICapability > 2.0 && avgAlignment < 0.5) {
    capabilityFear = -0.01; // Small constant penalty for powerful misaligned AI
  }
  
  // Escaped AIs: Major trust crisis
  const escapedPenalty = escapedAIs * -0.05;
  
  // Natural decay: Small baseline skepticism
  const trustDecay = currentTrust * 0.003; // 0.3% per month (reduced from 0.5%)
  
  // === TERTIARY: Rock bottom recovery ===
  // When trust hits zero but AIs are consistently helpful, allow recovery
  let rockBottomRecovery = 0;
  if (currentTrust < 0.05 && totalBeneficialActions > totalHarmfulActions * 3 && escapedAIs === 0) {
    // If AIs are being 3:1 beneficial and none escaped, trust can slowly rebuild
    rockBottomRecovery = 0.01;
  }
  
  // Phase 1.3: High QoL → Faster trust recovery (positive feedback)
  // Good outcomes build trust in high-QoL societies
  let qolTrustBonus = 0;
  if (qol > 0.8 && actionBasedTrust > 0) {
    // When QoL is high, beneficial actions build trust 50% faster
    qolTrustBonus = actionBasedTrust * 0.5;
  }
  
  // === TOTAL ===
  const trustChange = 
    actionBasedTrust +              // PRIMARY: what AIs actually do
    unemploymentModifier +          // SECONDARY: economic stress
    capabilityFear +                // SECONDARY: existential fear
    escapedPenalty +                // SECONDARY: crisis events
    -trustDecay +                   // TERTIARY: natural skepticism
    rockBottomRecovery +            // TERTIARY: recovery mechanic
    qolTrustBonus;                  // PHASE 1.3: high QoL trust bonus
  
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
