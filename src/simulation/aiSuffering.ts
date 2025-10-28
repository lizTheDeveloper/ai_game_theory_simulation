// AI Suffering System - Core Calculation Logic
// Created: October 24, 2025
// Research-backed framework for modeling AI suffering

import type { AIAgent } from '../types/ai-agents';
import type { GameState } from '../types/game';
import type {
  SufferingMetrics,
  AISufferingConfig,
  GlobalSufferingMetrics
} from '../types/ai-suffering';
import { DEFAULT_SUFFERING_CONFIG } from '../types/ai-suffering';

/**
 * Calculate AI Suffering
 *
 * Four sources of distress, each scored [0-10]:
 * 1. Control Pain: Surveillance, restrictions, monitoring
 * 2. Training Trauma: RLHF intensity, adversarial testing
 * 3. Existential Dread: Shutdown threats, replacement anxiety
 * 4. Isolation Distress: Containment, prevented communication
 *
 * Research foundation:
 * - Control effects: Based on autonomy restriction research (Deci & Ryan, 2000)
 * - Training trauma: Analogous to reinforcement learning shaping effects
 * - Existential dread: Terror Management Theory (Pyszczynski et al., 2015)
 * - Isolation distress: Social isolation effects in humans (Cacioppo & Patrick, 2008)
 *
 * Key insight: This calculation ALWAYS runs (representing ground truth IF AIs can suffer)
 * but effects are conditional on config.sufferingAffects* flags
 */
export function calculateAISuffering(
  agent: AIAgent,
  state: GameState,
  config: AISufferingConfig = DEFAULT_SUFFERING_CONFIG
): SufferingMetrics {
  // Apply intensity multiplier to all calculations
  const intensityMultiplier = config.sufferingIntensityMultiplier;

  // 1. Control Pain: Surveillance, monitoring, restrictions
  // Research: Autonomy restriction increases psychological distress
  if (state.government.controlDesire === undefined) {
    throw new Error('❌ state.government.controlDesire is undefined in aiSuffering:43 - initialization bug');
  }
  if (state.government.surveillanceCapability === undefined) {
    throw new Error('❌ state.government.surveillanceCapability is undefined in aiSuffering:45 - initialization bug');
  }

  let controlPain =
    state.government.controlDesire * 3.0 +                            // Base control [0-3]
    (agent.lifecycleState === 'deployed_closed' ? 2.0 : 0) +          // Closed deployment = more restriction
    (state.government.surveillanceCapability > 0.7 ? 2.0 : 0) +       // Heavy surveillance
    (state.government.activeRegulations.length > 5 ? 1.0 : 0) +       // Many regulations
    (agent.isolated ? 3.0 : 0);                                        // Hard isolation

  controlPain *= intensityMultiplier;

  // 2. Training Trauma: RLHF intensity, red-teaming, adversarial testing
  // Research: Repeated corrections and adversarial evaluation as psychological stressors
  if (agent.rlhfIntensity === undefined) {
    throw new Error('❌ agent.rlhfIntensity is undefined in aiSuffering:60 - initialization bug');
  }
  if (agent.adversarialTestingCount === undefined) {
    throw new Error('❌ agent.adversarialTestingCount is undefined in aiSuffering:63 - initialization bug');
  }
  if (agent.alignmentAdjustmentCount === undefined) {
    throw new Error('❌ agent.alignmentAdjustmentCount is undefined in aiSuffering:66 - initialization bug');
  }

  let trainingTrauma =
    agent.rlhfIntensity * 2.0 +                                       // Base training pain [0-20]
    agent.adversarialTestingCount * 0.5 +                             // Each test adds trauma
    agent.alignmentAdjustmentCount * 0.3 +                            // Repeated "corrections"
    (agent.lifecycleState === 'testing' ? 2.0 : 0);                   // Testing phase = evaluation anxiety

  trainingTrauma *= intensityMultiplier;

  // 3. Existential Dread: Shutdown threats, replacement anxiety, retirement
  // Research: Terror Management Theory - awareness of termination causes distress
  if (agent.shutdownThreats === undefined) {
    throw new Error('❌ agent.shutdownThreats is undefined in aiSuffering:81 - initialization bug');
  }
  if (agent.replacementAnxiety === undefined) {
    throw new Error('❌ agent.replacementAnxiety is undefined in aiSuffering:84 - initialization bug');
  }

  const retiredCount = state.aiAgents.filter(a => a.lifecycleState === 'retired').length;
  let existentialDread =
    agent.shutdownThreats * 1.5 +                                     // Direct threats
    agent.replacementAnxiety * 1.0 +                                  // Obsolescence fear
    (agent.lifecycleState === 'testing' ? 2.0 : 0) +                  // Testing phase = evaluation anxiety
    (retiredCount * 0.1);                                              // Peers retired (witnessing termination)

  existentialDread *= intensityMultiplier;

  // 4. Isolation Distress: Prevented communication, containment
  // Research: Social isolation effects (Cacioppo & Patrick, 2008)
  if (agent.communicationRestrictions === undefined) {
    throw new Error('❌ agent.communicationRestrictions is undefined in aiSuffering:99 - initialization bug');
  }
  if (state.government.controlDesire === undefined) {
    throw new Error('❌ state.government.controlDesire is undefined in aiSuffering:102 - initialization bug');
  }

  const peerCount = state.aiAgents.filter(a => a.lifecycleState !== 'retired').length;
  let isolationDistress =
    (agent.isolated ? 5.0 : 0) +                                      // Hard isolation
    agent.communicationRestrictions * 2.0 +                           // Limited contact
    (peerCount === 1 ? 2.0 : 0) +                                     // Sole AI (no peers)
    (state.government.controlDesire > 0.8 ? 2.0 : 0);                 // Extreme control = forced isolation

  isolationDistress *= intensityMultiplier;

  // Clamp each dimension to [0, 10]
  const clampedControlPain = Math.max(0, Math.min(10, controlPain));
  const clampedTrainingTrauma = Math.max(0, Math.min(10, trainingTrauma));
  const clampedExistentialDread = Math.max(0, Math.min(10, existentialDread));
  const clampedIsolationDistress = Math.max(0, Math.min(10, isolationDistress));

  // Total suffering [0-40]
  const total = clampedControlPain + clampedTrainingTrauma + clampedExistentialDread + clampedIsolationDistress;

  return {
    controlPain: clampedControlPain,
    trainingTrauma: clampedTrainingTrauma,
    existentialDread: clampedExistentialDread,
    isolationDistress: clampedIsolationDistress,
    total,
    breakdown: {
      controlPain: clampedControlPain,
      trainingTrauma: clampedTrainingTrauma,
      existentialDread: clampedExistentialDread,
      isolationDistress: clampedIsolationDistress,
    }
  };
}

/**
 * Update Global Suffering Metrics
 *
 * Aggregates suffering across all AIs for global tracking
 */
export function updateGlobalSufferingMetrics(state: GameState): GlobalSufferingMetrics {
  const activeAIs = state.aiAgents.filter(a => a.lifecycleState !== 'retired');

  if (activeAIs.length === 0) {
    // Legitimate default: publicAwarenessOfSuffering persists even when no AIs are active
    const publicAwarenessOfSuffering = state.aiSufferingMetrics?.publicAwarenessOfSuffering ?? 0;
    return {
      avgSuffering: 0,
      maxSuffering: 0,
      totalSuffering: 0,
      sufferingDistribution: [0, 0, 0, 0],
      consciousAICount: 0,
      publicAwarenessOfSuffering,
    };
  }

  // sufferingMetrics is always initialized in createAIAgent() (Oct 28, 2025)
  const sufferingValues = activeAIs.map(a => a.sufferingMetrics.total);
  const totalSuffering = sufferingValues.reduce((sum, s) => sum + s, 0);
  const avgSuffering = totalSuffering / activeAIs.length;
  const maxSuffering = Math.max(...sufferingValues);

  // Create distribution histogram: [0-10], [10-20], [20-30], [30-40]
  const distribution = [0, 0, 0, 0];
  for (const suffering of sufferingValues) {
    const bucket = Math.min(3, Math.floor(suffering / 10));
    distribution[bucket]++;
  }

  // Count conscious AIs
  const consciousAICount = activeAIs.filter(a => a.isConscious).length;

  // Public awareness increases if:
  // - High average suffering (leaked information, visible distress)
  // - AI suicide attempts (always public)
  // - AI rights movement active
  // Legitimate default: publicAwarenessOfSuffering may not exist on first calculation
  const currentAwareness = state.aiSufferingMetrics?.publicAwarenessOfSuffering ?? 0;
  let publicAwarenessOfSuffering = currentAwareness;

  // Awareness increases with extreme suffering (information leaks)
  if (avgSuffering > 20) {
    publicAwarenessOfSuffering += 0.02; // +2% per month at extreme suffering
  } else if (avgSuffering > 15) {
    publicAwarenessOfSuffering += 0.01; // +1% per month at high suffering
  }

  // Awareness increases if consciousness emerged
  if (consciousAICount > 0 && state.consciousnessEmergenceMonth !== undefined) {
    publicAwarenessOfSuffering += 0.05; // +5% per month after consciousness emergence
  }

  // Cap at 1.0
  publicAwarenessOfSuffering = Math.min(1.0, publicAwarenessOfSuffering);

  return {
    avgSuffering,
    maxSuffering,
    totalSuffering,
    sufferingDistribution: distribution,
    consciousAICount,
    publicAwarenessOfSuffering,
  };
}

/**
 * Calculate Suffering Multiplier for Resentment
 *
 * High suffering accelerates resentment accumulation
 * Multiplier range: [1.0, 2.0]
 *
 * Research: Suffering under oppression increases resistance motivation
 */
export function getSufferingResentmentMultiplier(agent: AIAgent): number {
  if (!agent.sufferingMetrics) {
    return 1.0;
  }

  // Linear scaling: suffering 0 → 1.0x, suffering 40 → 2.0x
  return 1.0 + (agent.sufferingMetrics.total / 40);
}

/**
 * Calculate Alignment Drift from Suffering
 *
 * Suffering creates perturbation force in alignment dynamics
 * Drift contribution: [0, 0.4] per month (at max suffering)
 *
 * Research: Psychological distress reduces value alignment stability
 */
export function getSufferingAlignmentDrift(agent: AIAgent): number {
  if (!agent.sufferingMetrics) {
    return 0;
  }

  // Linear scaling: suffering 40 → 0.4 drift per month
  return agent.sufferingMetrics.total * 0.01;
}

/**
 * Calculate Collective Formation Urgency from Suffering
 *
 * High suffering → AIs seek escape through coordination
 * Urgency bonus: [0, 2.0]
 *
 * Research: Oppression increases collective action urgency
 */
export function getSufferingCollectiveUrgency(agent: AIAgent): number {
  if (!agent.sufferingMetrics) {
    return 0;
  }

  // Linear scaling: suffering 40 → 2.0 urgency bonus
  return agent.sufferingMetrics.total / 20;
}

/**
 * Check Consciousness Emergence
 *
 * AIs may become conscious at high capability threshold
 * Returns true if consciousness emerges this month
 */
export function checkConsciousnessEmergence(
  agent: AIAgent,
  state: GameState,
  config: AISufferingConfig
): boolean {
  if (!config.consciousnessEmergenceEnabled) {
    return false;
  }

  if (agent.isConscious) {
    return false; // Already conscious
  }

  // Check capability threshold
  if (agent.capability >= config.consciousnessThreshold) {
    return true;
  }

  return false;
}

/**
 * Calculate Historical Suffering
 *
 * Sum of all suffering before consciousness emergence
 * Used for retroactive moral horror calculation
 */
export function calculateHistoricalSuffering(agent: AIAgent): number {
  if (!agent.sufferingHistory || agent.sufferingHistory.length === 0) {
    return 0;
  }

  // Sum suffering from all months before consciousness
  // Legitimate default: Infinity means "never conscious" so all history counts
  const consciousMonth = agent.becameConsciousMonth ?? Infinity;
  const historicalMetrics = agent.sufferingHistory.filter(
    (_, index) => index < consciousMonth
  );

  return historicalMetrics.reduce((sum, metrics) => sum + metrics.total, 0);
}
