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
import { assertFinite } from './utils/assertions';
import { calculateQualityOfLife } from './qualityOfLife';
import { getTrustInAI } from './socialCohesion';
import {
  getTotalAICapability as utilGetTotalAICapability,
  calculateAverageAlignment as utilCalculateAverageAlignment
} from './utils';

/**
 * Calculate total AI capability across all agents
 * @deprecated Use getTotalAICapability from utils instead
 */
export function calculateTotalAICapability(aiAgents: { capability: number }[]): number {
  return aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
}

/**
 * Calculate average AI alignment across all agents
 * @deprecated Use calculateAverageAlignment from utils instead
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
  const trustInAI = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust

  // BIFURCATION INTEGRATION (Nov 8, 2025): Regime influences outcome trajectories
  // Research: Scheffer et al. (2014) - regime shifts lock in outcomes
  const bifState = state.bifurcationState;
  const currentRegime = bifState?.currentRegime || 'status-quo';

  // Dystopia conditions: high control, low quality of life, low trust
  let dystopiaScore = Math.max(0,
    (effectiveControl > 0.8 ? 0.4 : 0) +
    (qualityOfLife < 0.3 ? 0.3 : 0) +
    (trustInAI < 0.3 ? 0.3 : 0)
  );

  // Extinction conditions: uncontrolled powerful AI with recursive improvement, low alignment
  // Updated thresholds to match new balance mechanics (recursive improvement at 1.5+)
  let extinctionScore = Math.max(0,
    // Capability risk: Scaled to match recursive improvement thresholds
    (totalAICapability > 3.0 ? 0.5 : totalAICapability > 2.0 ? 0.4 : totalAICapability > 1.5 ? 0.2 : 0) +
    // Control risk: Loss of control is critical
    (effectiveControl < 0.1 ? 0.3 : effectiveControl < 0.3 ? 0.15 : 0) +
    // Alignment risk: Misalignment with high capability is fatal
    (avgAlignment < 0.3 && totalAICapability > 1.5 ? 0.3 : avgAlignment < 0.5 && totalAICapability > 2.0 ? 0.2 : 0)
  );

  // Utopia conditions: high quality of life, high trust, high alignment, controlled AI
  let utopiaScore = Math.max(0,
    (qualityOfLife > 0.7 ? 0.3 : 0) +
    (trustInAI > 0.7 ? 0.2 : 0) +
    (avgAlignment > 0.7 ? 0.2 : 0) +
    // Bonus for successfully managing powerful AI
    (totalAICapability > 1.0 && avgAlignment > 0.6 && effectiveControl > 0.3 ? 0.3 : 0)
  );

  // BIFURCATION REGIME ADJUSTMENTS
  // Regime shifts lock in trajectories (research: Scheffer et al. 2014)
  switch (currentRegime) {
    case 'ecological-collapse':
      // Ecological collapse → increased extinction risk (ecosystem failure)
      extinctionScore += 0.3;
      dystopiaScore += 0.2;
      utopiaScore *= 0.5; // Hard to achieve utopia during environmental collapse
      break;

    case 'social-breakdown':
      // Social breakdown → increased dystopia risk (authoritarianism, conflict)
      dystopiaScore += 0.4;
      utopiaScore *= 0.6; // Social cohesion required for utopia
      break;

    case 'economic-collapse':
      // Economic collapse → increased dystopia risk (inequality, instability)
      dystopiaScore += 0.3;
      extinctionScore += 0.1; // Resource wars possible
      utopiaScore *= 0.7;
      break;

    case 'state-failure':
      // State failure → increased dystopia risk (no coordination)
      dystopiaScore += 0.35;
      extinctionScore += 0.15; // Can't coordinate AI safety
      utopiaScore *= 0.5;
      break;

    case 'flourishing':
      // Flourishing regime → increased utopia probability
      utopiaScore += 0.4;
      dystopiaScore *= 0.5;
      extinctionScore *= 0.3;
      break;

    case 'sustainable':
      // Sustainable regime → balanced outcomes, slight utopia boost
      utopiaScore += 0.2;
      extinctionScore *= 0.7;
      break;

    case 'status-quo':
    default:
      // No regime adjustment
      break;
  }

  // Normalize probabilities to sum to 1.0
  const total = utopiaScore + dystopiaScore + extinctionScore;

  // Handle zero case: if all scores are zero, default to equal probabilities
  let utopiaProbability: number;
  let dystopiaProbability: number;
  let extinctionProbability: number;

  if (total < 0.001) {
    // All scores near zero - default to equal distribution
    // (Legitimate in early game before conditions develop)
    utopiaProbability = 1/3;
    dystopiaProbability = 1/3;
    extinctionProbability = 1/3;
  } else {
    // Normal case: normalize to sum to 1.0
    utopiaProbability = utopiaScore / total;
    dystopiaProbability = dystopiaScore / total;
    extinctionProbability = extinctionScore / total;
  }
  
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
  const trust = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
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
    
    console.log(`\n✅ GOLDEN AGE BEGINS (Month ${currentMonth})`);
    console.log(`   Reason: ${conditions.reason}`);
    console.log(`   Note: This is immediate prosperity - sustainability not yet proven\n`);
  } else if (!conditions.met && state.goldenAgeState.active) {
    // Exit Golden Age (conditions no longer met)
    const duration = currentMonth - (state.goldenAgeState.entryMonth || 0);
    console.warn(`\n⚠️  GOLDEN AGE ENDED (Month ${currentMonth})`);
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
  const trust = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // NOTE: All extinction detection removed - handled by heterogeneous system
  // Extinctions will trigger as specific scenarios (instant/rapid/slow/controlled/unintended)
  // and progress through phases with recovery windows
  
  // DYSTOPIA: Stable but oppressive society (orthogonal to extinction risk)
  // Phase 2.6: Use structural metrics (surveillance, autonomy, freedom) not just outcomes
  // IMPORTANT: Dystopia does NOT stop simulation - it's a persistent state, not an end condition
  // Only extinction stops the simulation. Dystopias continue running to see if they recover or collapse.

  const autonomy = state.qualityOfLifeSystems.autonomy;
  const politicalFreedom = state.qualityOfLifeSystems.politicalFreedom;
  const surveillance = state.government.structuralChoices.surveillanceLevel;
  const controlDesire = state.government.controlDesire;

  // Surveillance state dystopia: High surveillance + low autonomy/freedom
  // This is STABLE - can persist indefinitely (not decay to extinction)
  if (surveillance > 0.7 && autonomy < 0.3 && politicalFreedom < 0.3 && currentMonth > 24) {
    // Dystopia detected but simulation continues (no outcomeState tracking currently)
    // Continue simulation - return 'active'
    return {
      outcome: 'active',
      reason: 'Dystopia detected but simulation continues (surveillance state)',
      confidence: 0.85
    };
  }

  // Authoritarian dystopia: Government type + structural oppression
  if (state.government.governmentType === 'authoritarian' &&
      autonomy < 0.4 && politicalFreedom < 0.3 && currentMonth > 18) {
    // Dystopia detected but simulation continues (no outcomeState tracking currently)
    // Continue simulation - return 'active'
    return {
      outcome: 'active',
      reason: 'Dystopia detected but simulation continues (authoritarian)',
      confidence: 0.80
    };
  }

  // High-control dystopia: Control desire + low freedom, even if "working"
  // Can have aligned AIs (obedient) but terrible QoL
  if (controlDesire > 0.8 && surveillance > 0.6 && politicalFreedom < 0.4 && autonomy < 0.4 && currentMonth > 30) {
    // Dystopia detected but simulation continues (no outcomeState tracking currently)
    // Continue simulation - return 'active'
    return {
      outcome: 'active',
      reason: 'Dystopia detected but simulation continues (high-control)',
      confidence: 0.75
    };
  }
  
  // Over-regulated dystopia: Economic stagnation + oppression
  if (state.government.regulationCount > 12 && qol < 0.4 &&
      state.globalMetrics.socialStability < 0.3 && autonomy < 0.4) {
    // Dystopia detected but simulation continues (no outcomeState tracking currently)
    // Continue simulation - return 'active'
    return {
      outcome: 'active',
      reason: 'Dystopia detected but simulation continues (over-regulated)',
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
  
  // Phase 6: Collapse Pathways from Golden Age
  // Check if Golden Age has collapsed due to accumulation crises
  // This happens BEFORE Utopia check - a failed Golden Age blocks Utopia
  
  if (state.goldenAgeState.active) {
    // Import crisis checkers
    const { hasEnvironmentalCrisis } = require('./environmental');
    const { hasSocialCrisis } = require('./socialCohesion');
    const { hasTechnologicalCrisis } = require('./technologicalRisk');
    
    const envCrisis = hasEnvironmentalCrisis(state.environmentalAccumulation);
    const socCrisis = hasSocialCrisis(state.socialAccumulation);
    const techCrisis = hasTechnologicalCrisis(state.technologicalRisk);
    
    // MULTIPLE CRISES → Collapse (potential extinction pathway)
    const crisisCount = [envCrisis, socCrisis, techCrisis].filter(Boolean).length;
    if (crisisCount >= 2 && qol < 0.4) {
      return {
        outcome: 'active', // Let extinction system handle it
        reason: `Golden Age collapsed: Multiple crises (environmental:${envCrisis}, social:${socCrisis}, tech:${techCrisis}) + QoL crashed`,
        confidence: 0.0
      };
    }
    
    // SOCIAL CRISIS + INSTITUTIONAL FAILURE → Dystopia
    if (state.socialAccumulation.institutionalFailureActive && 
        (state.socialAccumulation.socialUnrestActive || state.socialAccumulation.meaningCollapseActive)) {
      return {
        outcome: 'dystopia',
        reason: 'Golden Age collapsed into dystopia: Institutional failure + social breakdown led to authoritarian takeover',
        confidence: 0.80
      };
    }
    
    // CORPORATE DYSTOPIA PATH
    if (state.technologicalRisk.corporateDystopiaActive && state.globalMetrics.wealthDistribution < 0.3) {
      return {
        outcome: 'dystopia',
        reason: 'Golden Age transformed into corporate dystopia: AI-powered feudalism with extreme inequality',
        confidence: 0.75
      };
    }
  }
  
  // Phase 5: Utopia Sustainability Check
  // Golden Age + low accumulation across all systems = Utopia
  // This requires sustained prosperity WITHOUT hidden problems accumulating
  
  if (state.goldenAgeState.active && state.goldenAgeState.duration >= 12) {
    // Require at least 12 months of sustained Golden Age
    
    // Import sustainability functions (already exported from calculations.ts)
    const { getEnvironmentalSustainability, hasEnvironmentalCrisis } = require('./environmental');
    const { getSocialSustainability, hasSocialCrisis } = require('./socialCohesion');
    const { getTechnologicalSafety, hasTechnologicalCrisis } = require('./technologicalRisk');
    
    const envSustainability = getEnvironmentalSustainability(state.environmentalAccumulation);
    const socialSustainability = getSocialSustainability(state.socialAccumulation);
    const techSafety = getTechnologicalSafety(state.technologicalRisk);
    
    const hasEnvCrisis = hasEnvironmentalCrisis(state.environmentalAccumulation);
    const hasSocCrisis = hasSocialCrisis(state.socialAccumulation);
    const hasTechCrisis = hasTechnologicalCrisis(state.technologicalRisk);
    
    // Overall sustainability (weighted average)
    const overallSustainability = (
      envSustainability * 0.35 +
      socialSustainability * 0.35 +
      techSafety * 0.30
    );
    
    // Utopia requires high sustainability AND no active crises
    const isUtopia = overallSustainability > 0.65 && !hasEnvCrisis && !hasSocCrisis && !hasTechCrisis;
    
    if (isUtopia) {
      return {
        outcome: 'utopia',
        reason: `Sustained Golden Age with environmental, social, and technological sustainability (${state.goldenAgeState.duration} months)`,
        confidence: 0.85 + Math.min(0.1, overallSustainability - 0.65)
      };
    } else {
      // Golden Age continues, but not yet Utopia
      const blockingFactors: string[] = [];
      if (envSustainability < 0.65 || hasEnvCrisis) blockingFactors.push('environmental');
      if (socialSustainability < 0.65 || hasSocCrisis) blockingFactors.push('social');
      if (techSafety < 0.65 || hasTechCrisis) blockingFactors.push('technological');
      
      return {
        outcome: 'active',
        reason: `Golden Age ongoing (${state.goldenAgeState.duration} months) - sustainability issues: ${blockingFactors.join(', ')}`,
        confidence: 0.0
      };
    }
  }
  
  // Still in play - no outcome locked in yet
  return {
    outcome: 'active',
    reason: 'Outcome still undetermined',
    confidence: 0.0
  };
}

