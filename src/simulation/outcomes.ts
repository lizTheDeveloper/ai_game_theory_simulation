/**
 * Outcome determination and probability calculations
 * 
 * Determines which outcome (utopia/dystopia/extinction) is occurring
 * based on game state conditions.
 */

import { GameState, OutcomeMetrics, OutcomeType } from '@/types/game';
import { calculateQualityOfLife } from './qualityOfLife';

/**
 * Calculate total AI capability across all agents
 */
export function calculateTotalAICapability(aiAgents: { capability: number }[]): number {
  return aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
}

/**
 * Calculate average AI alignment across all agents
 */
export function calculateAverageAlignment(aiAgents: { alignment: number }[]): number {
  if (aiAgents.length === 0) return 0;
  const totalAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0);
  return totalAlignment / aiAgents.length;
}

/**
 * Calculate government's effective control over AI systems
 * 
 * Control effectiveness decreases as AI capability grows.
 * Uses exponential decay to model increasing difficulty of controlling advanced AI.
 */
export function calculateEffectiveControl(state: GameState): number {
  const { government, aiAgents } = state;
  
  const totalAICapability = calculateTotalAICapability(aiAgents);
  const growthFactor = 1.5; // Exponential difficulty scaling
  
  return government.controlDesire * government.capabilityToControl / 
    (1 + Math.pow(totalAICapability, growthFactor));
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
  // Phase 2: Heterogeneous extinction system handles ALL extinctions
  // No more instant game-over checks - let scenarios progress through phases
  if (state.extinctionState.active) {
    // Extinction scenario is progressing, defer to that system
    return {
      outcome: 'active',
      reason: `Extinction scenario in progress: ${state.extinctionState.type} (${state.extinctionState.mechanism})`,
      confidence: state.extinctionState.severity
    };
  }
  
  const totalAICapability = calculateTotalAICapability(state.aiAgents);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const effectiveControl = calculateEffectiveControl(state);
  const qol = calculateQualityOfLife(state.qualityOfLifeSystems);
  const trust = state.society.trustInAI;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // NOTE: All extinction detection removed - handled by heterogeneous system
  // Extinctions will trigger as specific scenarios (instant/rapid/slow/controlled/unintended)
  // and progress through phases with recovery windows
  
  // DYSTOPIA: Stable but oppressive society (orthogonal to extinction risk)
  // Phase 2.6: Use structural metrics (surveillance, autonomy, freedom) not just outcomes
  
  const autonomy = state.qualityOfLifeSystems.autonomy;
  const politicalFreedom = state.qualityOfLifeSystems.politicalFreedom;
  const surveillance = state.government.structuralChoices.surveillanceLevel;
  const controlDesire = state.government.controlDesire;
  
  // Surveillance state dystopia: High surveillance + low autonomy/freedom
  // This is STABLE - can persist indefinitely (not decay to extinction)
  if (surveillance > 0.7 && autonomy < 0.3 && politicalFreedom < 0.3 && currentMonth > 24) {
    return {
      outcome: 'dystopia',
      reason: 'Permanent surveillance state: pervasive monitoring, no autonomy, no freedom',
      confidence: 0.85
    };
  }
  
  // Authoritarian dystopia: Government type + structural oppression
  if (state.government.governmentType === 'authoritarian' && 
      autonomy < 0.4 && politicalFreedom < 0.3 && currentMonth > 18) {
    return {
      outcome: 'dystopia',
      reason: 'Authoritarian regime with structural oppression established',
      confidence: 0.80
    };
  }
  
  // High-control dystopia: Control desire + low freedom, even if "working"
  // Can have aligned AIs (obedient) but terrible QoL
  if (controlDesire > 0.8 && surveillance > 0.6 && politicalFreedom < 0.4 && autonomy < 0.4 && currentMonth > 30) {
    return {
      outcome: 'dystopia',
      reason: 'High-control society: AI obedient but humans oppressed',
      confidence: 0.75
    };
  }
  
  // Over-regulated dystopia: Economic stagnation + oppression
  if (state.government.regulationCount > 12 && qol < 0.4 && 
      state.globalMetrics.socialStability < 0.3 && autonomy < 0.4) {
    return {
      outcome: 'dystopia',
      reason: 'Over-regulation: economic collapse and authoritarian response',
      confidence: 0.70
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

