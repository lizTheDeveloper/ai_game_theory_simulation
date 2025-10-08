/**
 * Outcome determination and probability calculations
 * 
 * Determines which outcome (utopia/dystopia/extinction) is occurring
 * based on game state conditions.
 * 
 * Phase: Golden Age & Accumulation Systems
 * - Golden Age detection: Immediate prosperity (fragile)
 * - Utopia detection: Sustained Golden Age + low accumulation (stable)
 */

import { GameState, OutcomeMetrics, OutcomeType, GoldenAgeState } from '@/types/game';
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
 * Check if Golden Age conditions are met
 * 
 * Golden Age = immediate prosperity that looks great now but may be masking problems.
 * 
 * Entry conditions:
 * - High QoL across multiple dimensions (≥ 0.7)
 * - Material abundance (Stage 3+)
 * - High trust (≥ 0.65)
 * - Low active conflict
 * - Economic stability
 */
export function checkGoldenAgeConditions(state: GameState): {
  met: boolean;
  reason: string;
} {
  const qol = calculateQualityOfLife(state.qualityOfLifeSystems);
  const trust = state.society.trustInAI;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const socialStability = state.globalMetrics.socialStability;
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  
  // High QoL threshold
  if (qol < 0.7) {
    return { met: false, reason: 'QoL below Golden Age threshold' };
  }
  
  // Material abundance (Stage 3+)
  if (economicStage < 3.0) {
    return { met: false, reason: 'Economic stage below 3 (not yet abundant)' };
  }
  
  // High trust requirement
  if (trust < 0.65) {
    return { met: false, reason: 'Trust below Golden Age threshold' };
  }
  
  // Social stability (not in active crisis)
  if (socialStability < 0.4) {
    return { met: false, reason: 'Social instability too high' };
  }
  
  // Not in active extinction
  if (state.extinctionState.active) {
    return { met: false, reason: 'Active extinction scenario in progress' };
  }
  
  // Determine entry reason based on conditions
  let reason = 'High prosperity achieved: ';
  if (economicStage >= 3.5) {
    reason += 'post-scarcity abundance';
  } else {
    reason += 'high QoL + material abundance';
  }
  
  if (avgAlignment > 0.7) {
    reason += ' + aligned AI';
  }
  
  return { met: true, reason };
}

/**
 * Update Golden Age state based on current conditions
 * 
 * Called each month to:
 * 1. Check if we should enter Golden Age
 * 2. Update duration if already in Golden Age
 * 3. Exit Golden Age if conditions no longer met
 */
export function updateGoldenAgeState(
  state: GameState,
  currentMonth: number
): void {
  const conditions = checkGoldenAgeConditions(state);
  
  if (conditions.met && !state.goldenAgeState.active) {
    // Enter Golden Age
    state.goldenAgeState.active = true;
    state.goldenAgeState.entryMonth = currentMonth;
    state.goldenAgeState.duration = 0;
    state.goldenAgeState.entryReason = conditions.reason;
    
    console.log(`\n🌟 GOLDEN AGE BEGINS (Month ${currentMonth})`);
    console.log(`   Reason: ${conditions.reason}`);
    console.log(`   Note: This is immediate prosperity - sustainability not yet proven\n`);
  } else if (!conditions.met && state.goldenAgeState.active) {
    // Exit Golden Age (conditions no longer met)
    const duration = currentMonth - (state.goldenAgeState.entryMonth || 0);
    console.log(`\n⚠️  GOLDEN AGE ENDED (Month ${currentMonth})`);
    console.log(`   Duration: ${duration} months`);
    console.log(`   Reason: ${conditions.reason}\n`);
    
    state.goldenAgeState.active = false;
    state.goldenAgeState.duration = duration;
  } else if (conditions.met && state.goldenAgeState.active) {
    // Continue Golden Age - update duration
    state.goldenAgeState.duration = currentMonth - (state.goldenAgeState.entryMonth || 0);
  }
}

/**
 * Determine if an ACTUAL outcome has occurred (not just probability)
 * 
 * Based on ai_alignment_game_spec.md formal definitions, updated for new balance mechanics.
 * 
 * Key difference: This checks if an outcome has ACTUALLY happened, not just if it's likely.
 * - Extinction probability of 90% doesn't mean extinction occurred
 * - We need actual concrete conditions (unaligned superintelligence, collapsed society, etc.)
 * 
 * Phase: Golden Age & Accumulation Systems
 * - Check for Golden Age first (immediate prosperity)
 * - Only declare Utopia if Golden Age + sustainability verified
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
  // Phase: Golden Age & Accumulation Systems
  // 
  // NEW LOGIC: Check for Golden Age conditions first
  // - If conditions met but not yet in Golden Age → enter Golden Age, continue sim
  // - If in Golden Age → continue sim to verify sustainability
  // - Only declare Utopia once accumulation systems verify sustainability
  // 
  // For now (Phase 1), we detect Golden Age but DON'T declare Utopia
  // This prevents the 100% Utopia outcome by continuing the simulation
  
  // Check 1: Confirmed high-prosperity conditions
  // (Previously declared immediate Utopia)
  if (qol > 0.75 && trust > 0.7 && avgAlignment > 0.65 && 
      totalAICapability > 1.0 && effectiveControl > 0.25 && effectiveControl < 0.65 && 
      currentMonth > 30) {
    // This is Golden Age territory - but need to verify sustainability
    // Return 'active' to continue simulation
    return {
      outcome: 'active',
      reason: state.goldenAgeState.active 
        ? `Golden Age ongoing (${state.goldenAgeState.duration} months) - verifying sustainability`
        : 'High-quality conditions met - checking for Golden Age entry',
      confidence: 0.0
    };
  }
  
  // Check 2: Post-scarcity conditions
  // (Previously declared immediate Utopia - this was causing 100% Utopia)
  if (economicStage >= 3.5 && qol > 0.7 && trust > 0.65 && avgAlignment > 0.6 && currentMonth > 24) {
    // This is Golden Age territory - but need to verify sustainability
    // Return 'active' to continue simulation
    return {
      outcome: 'active',
      reason: state.goldenAgeState.active
        ? `Golden Age (post-scarcity) ongoing (${state.goldenAgeState.duration} months) - verifying sustainability`
        : 'Post-scarcity conditions met - checking for Golden Age entry',
      confidence: 0.0
    };
  }
  
  // Check 3: Solarpunk cooperative path
  // (Previously declared immediate Utopia)
  if (totalAICapability > 1.5 && avgAlignment > 0.7 && qol > 0.8 && trust > 0.75 && currentMonth > 36) {
    // This is Golden Age territory - but need to verify sustainability
    // Return 'active' to continue simulation
    return {
      outcome: 'active',
      reason: state.goldenAgeState.active
        ? `Golden Age (cooperative AI) ongoing (${state.goldenAgeState.duration} months) - verifying sustainability`
        : 'Cooperative AI conditions met - checking for Golden Age entry',
      confidence: 0.0
    };
  }
  
  // TODO (Phase 5): Add Utopia declaration once accumulation systems implemented
  // Requirements: Golden Age + low environmental debt + low social fragmentation + low tech risk
  // For now, Golden Age continues indefinitely (will see what emerges)
  
  // Still in play - no outcome locked in yet
  return {
    outcome: 'active',
    reason: 'Outcome still undetermined',
    confidence: 0.0
  };
}

