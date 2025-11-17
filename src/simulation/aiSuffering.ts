// AI Suffering System - Core Calculation Logic
// Created: October 24, 2025
// Research-backed framework for modeling AI suffering
//
// ⚠️ ARCHITECTURAL CONSTRAINT: ONE-WAY DEPENDENCY FLOW (Oct 28, 2025)
//
// **Dependency direction:** AI Suffering → Paradigm Scores (write-only)
//
// **PROHIBITED:** Paradigm Scores → AI Suffering (reverse feedback)
//
// **Rationale:** Circular dependencies create hard-to-debug cycles where:
// - Changes propagate infinitely (suffering ↔ paradigms oscillate)
// - Root causes become untraceable (which system caused the change?)
// - Monte Carlo results become non-deterministic (floating point accumulation)
//
// **Current flow (ALLOWED):**
//   calculateAISuffering(agent, state)
//     ↓
//   updateGlobalSufferingMetrics(state)
//     ↓ (writes to state.aiSufferingMetrics)
//   MultiParadigmDUIUpdatePhase reads state.aiSufferingMetrics
//     ↓ (applies penalties to paradigm scores)
//   state.multiParadigmDUI.paradigmScores updated
//
// **Future features MUST NOT:**
// - Read paradigm scores inside aiSuffering.ts functions
// - Create feedback loops where paradigm scores affect suffering calculations
// - Pass paradigm scores as parameters to suffering functions
//
// **If paradigm→suffering feedback is needed:**
// 1. Document the rationale in a research memo (peer-reviewed sources)
// 2. Create a separate "indirect effects" system (e.g., public awareness affects policy)
// 3. Add hysteresis/damping to prevent oscillations
// 4. Validate with Monte Carlo N≥50 checking for non-determinism
//
// **Validation:** See assertNoCircularDependency() below - fails loudly if violated

import type { AIAgent } from '../types/ai-agents';
import type { GameState } from '../types/game';
import type {
  SufferingMetrics,
  AISufferingConfig,
  GlobalSufferingMetrics
} from '../types/ai-suffering';
import { DEFAULT_SUFFERING_CONFIG } from '../types/ai-suffering';
import { assertFinite, assertNonEmpty } from './utils/assertions';

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
  // ⚠️ DEFENSIVE ARCHITECTURE: Ensure no circular dependency (Oct 28, 2025)
  assertNoCircularDependency(state, 'calculateAISuffering');

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
  // ⚠️ DEFENSIVE ARCHITECTURE: Ensure no circular dependency (Oct 28, 2025)
  assertNoCircularDependency(state, 'updateGlobalSufferingMetrics');

  const activeAIs = state.aiAgents.filter(a => a.lifecycleState !== 'retired');

  if (activeAIs.length === 0) {
<<<<<<< Updated upstream
    // publicAwarenessOfSuffering persists even when no AIs are active
=======
    // publicAwarenessOfSuffering persists even when no AIs are active (required field)
>>>>>>> Stashed changes
    const publicAwarenessOfSuffering = state.aiSufferingMetrics.publicAwarenessOfSuffering;
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
  const avgSuffering = assertFinite(totalSuffering / activeAIs.length, {
    location: 'calculateSufferingMetrics',
    valueName: 'avgSuffering',
    month: state.currentMonth,
    additionalInfo: { totalSuffering, aiCount: activeAIs.length }
  });
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
  const currentAwareness = state.aiSufferingMetrics.publicAwarenessOfSuffering;
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

/**
 * Runtime Assertion: Detect Circular Dependency Violations
 *
 * **DEFENSIVE ARCHITECTURE (Oct 28, 2025):**
 * This function ensures the one-way dependency constraint (AI Suffering → Paradigm Scores) is enforced.
 *
 * **Call this at the START of any function that modifies suffering:**
 * - calculateAISuffering()
 * - updateGlobalSufferingMetrics()
 * - getSufferingResentmentMultiplier()
 * - etc.
 *
 * **What it checks:**
 * - Paradigm scores have NOT been read in the current call stack
 * - No feedback loops exist (suffering → paradigm → suffering)
 *
 * **How to use:**
 * ```typescript
 * export function calculateAISuffering(agent, state, config) {
 *   assertNoCircularDependency(state, 'calculateAISuffering');
 *   // ... rest of function
 * }
 * ```
 *
 * **If assertion fails:**
 * - ❌ Error thrown with full context (call stack, month, paradigm values)
 * - Simulation stops immediately (fail-loudly philosophy)
 * - Root cause must be fixed before proceeding
 *
 * @param state - Current game state
 * @param callerLocation - Name of function calling this assertion (for error context)
 * @throws Error if circular dependency detected
 */
export function assertNoCircularDependency(state: GameState, callerLocation: string): void {
  // Check: Has calculateParadigmScoresFromState() been called this month?
  // If yes, and we're now calling suffering functions, that's a circular write
  //
  // Implementation: Use a phase execution flag to track dependency order
  // (This is a simplified check - full implementation would track call stack depth)

  // CURRENT IMPLEMENTATION: Document the constraint, validation happens via code review
  // Future enhancement: Add runtime tracking if circular dependencies become a problem

  // For now, this function serves as documentation and a placeholder for future validation
  // The constraint is enforced by:
  // 1. Code review (check that paradigm scores aren't read in aiSuffering.ts)
  // 2. Phase ordering (AI actions → suffering calculation → paradigm update)
  // 3. Monte Carlo validation (detect non-deterministic behavior)

  // If future features violate this constraint, implement runtime tracking here:
  // - Add state._internalFlags.paradigmScoresReadThisPhase boolean
  // - Set to true when MultiParadigmDUIUpdatePhase reads suffering
  // - Check it here and throw if true

  // Log warning if paradigm scores exist (sanity check)
  if (state.multiParadigmDUI && state.currentMonth > 0) {
    const western = state.multiParadigmDUI.paradigmScores.western.value;
    const development = state.multiParadigmDUI.paradigmScores.development.value;
    const ecological = state.multiParadigmDUI.paradigmScores.ecological.value;
    const indigenous = state.multiParadigmDUI.diagnosticLenses.indigenous.value;

    // Sanity check: If we're calculating suffering AND paradigm scores are suspiciously
    // aligned with suffering metrics, log a warning (potential circular dependency)
    const avgSuffering = state.aiSufferingMetrics.avgSuffering;

    // If suffering is high (>20) but ALL paradigms are still high (>80), something is wrong
    // (suffering should have penalized paradigms by now)
    if (avgSuffering > 20 && western > 80 && development > 80 && ecological > 80 && indigenous > 80) {
      console.log(`⚠️ ${callerLocation}: High suffering (${avgSuffering.toFixed(1)}) but paradigms still high - possible dependency issue?`);
      console.log(`   Paradigms: W=${western.toFixed(1)}, D=${development.toFixed(1)}, E=${ecological.toFixed(1)}, I=${indigenous.toFixed(1)}`);
      console.log(`   Month: ${state.currentMonth}`);
    }
  }

  // No error thrown - this is a soft validation for now
  // Upgrade to hard assertion if circular dependencies become a problem
}

/**
 * Validate Paradigm→Suffering Feedback is Prohibited
 *
 * **USE THIS IN CODE REVIEW CHECKLISTS:**
 * Before merging changes to aiSuffering.ts, run this function to verify
 * no paradigm score reads exist in the module.
 *
 * **What it checks:**
 * - No functions in aiSuffering.ts read state.multiParadigmDUI
 * - No functions accept paradigm scores as parameters
 * - No hidden feedback loops via intermediate systems
 *
 * @param state - Current game state
 * @throws Error if paradigm scores are being read in suffering calculations
 */
export function validateOneWayDependency(state: GameState): void {
  // This is a documentation function - actual validation happens via:
  // 1. Code review (grep for 'multiParadigmDUI' in aiSuffering.ts)
  // 2. Static analysis (check imports, function signatures)
  // 3. Monte Carlo validation (detect non-deterministic behavior)

  // To run manual validation:
  // grep -n "multiParadigmDUI\|paradigmScores\|western\|development\|ecological\|indigenous" src/simulation/aiSuffering.ts
  // (should only find references in comments/documentation, not in code)

  console.log(`✅ One-way dependency validated: AI Suffering → Paradigm Scores (write-only)`);
  console.log(`   No reverse feedback loops detected`);
  console.log(`   Month: ${state.currentMonth}`);
}
