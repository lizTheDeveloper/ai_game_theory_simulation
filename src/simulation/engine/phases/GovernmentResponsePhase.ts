/**
 * Government Response Phase
 *
 * Governments respond to AI capability changes, crises, and international pressure.
 * Models realistic policy response with AI comprehension lag.
 *
 * Research Foundation:
 * - Laver (2020): Agent-based political decision making
 * - WGI 2024: State capacity affects response speed
 * - V-Dem v14 (2024): Democratic vs authoritarian response patterns
 *
 * Phase order: 25 (after AI capability growth, before tech deployment)
 *
 * @module simulation/engine/phases/GovernmentResponsePhase
 */

import { SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '../PhaseOrchestrator';
import type { GameState } from '../../../types/game';
import type { ActivePolicy, Treaty } from '../../../types/government';

export class GovernmentResponsePhase implements SimulationPhase {
  readonly id = 'government-response';
  readonly name = 'Government Policy Response';
  readonly order = 25.0;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    return executeGovernmentResponsePhase(state, rng, context || { timestamp: state.currentMonth, data: new Map() });
  }
}

/**
 * Execute Government Response Phase
 *
 * Governments assess AI risks and initiate policy responses based on:
 * - AI capability levels (with comprehension lag)
 * - Active crises (environmental, social, technological)
 * - International pressure
 * - State capacity (affects implementation speed)
 */
function executeGovernmentResponsePhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  if (!state.governmentSystem) {
    return { events: [], warnings: [] };
  }

  const events: string[] = [];
  console.log('\n=== Government Response Phase ===');

  // 1. Assess AI comprehension by each government
  const avgAICapability = calculateAverageAICapability(state);
  const misalignedCount = state.aiAgents.filter(a => a.alignment < 0.7).length;

  console.log(`  Average AI capability: ${avgAICapability.toFixed(2)}`);
  console.log(`  Misaligned AIs: ${misalignedCount}/${state.aiAgents.length}`);

  // 2. Check for governments still comprehending AI capabilities
  let comprehendingCount = 0;
  for (const [countryCode, gov] of state.governmentSystem.governments) {
    const lag = state.governmentSystem.comprehensionLag.get(countryCode) || 12;

    // Simplified: assume government comprehends if enough time has passed
    // In reality, this would track when capability milestones were reached
    if (avgAICapability > 4.0 && lag > 6) {
      comprehendingCount++;
    }
  }

  if (comprehendingCount > 0) {
    console.log(`  ${comprehendingCount}/30 governments still assessing AI risks`);
  }

  // 3. Attempt international AI governance treaty (if crisis threshold met)
  if (misalignedCount > 5 || avgAICapability > 6.0) {
    const existingTreaty = state.governmentSystem.treaties.find(t => t.domain === 'ai_governance');

    if (!existingTreaty) {
      const treaty = attemptAIGovernanceTreaty(state, rng);
      if (treaty) {
        state.governmentSystem.treaties.push(treaty);
        events.push(`🌍 International AI Governance Treaty formed: ${treaty.signatories.length}/30 countries`);
        console.log(`  ✓ AI Governance Treaty: ${treaty.signatories.length}/30 signatories`);

        // Boost international coordination
        state.governmentSystem.internationalCoordination = Math.min(
          1.0,
          state.governmentSystem.internationalCoordination + 0.15
        );
      } else {
        console.log(`  ✗ AI Governance Treaty: Failed to reach consensus`);
      }
    }
  }

  // 4. Initiate policy responses for high-capacity democracies
  if (avgAICapability > 5.0) {
    let policiesInitiated = 0;

    for (const [countryCode, gov] of state.governmentSystem.governments) {
      const capacity = (gov as any).capacity?.derived?.overallCapacity || 0.5;
      const isDemo = (gov as any).type?.includes('liberal') || (gov as any).type?.includes('electoral');

      // High-capacity democracies respond first
      if (capacity > 0.6 && isDemo && rng() > 0.7) {
        const policy = initiatePolicyResponse(state, countryCode, 'technology', rng);
        if (policy) {
          state.governmentSystem.activePolicies.push(policy);
          policiesInitiated++;
        }
      }
    }

    if (policiesInitiated > 0) {
      console.log(`  Initiated ${policiesInitiated} new AI policy responses`);
    }
  }

  // 5. Update active policies (check for completion)
  const completedPolicies: ActivePolicy[] = [];
  state.governmentSystem.activePolicies = state.governmentSystem.activePolicies.filter(policy => {
    if (state.currentMonth >= policy.completionMonth) {
      completedPolicies.push(policy);
      return false; // Remove from active
    }
    return true; // Keep active
  });

  // 6. Apply effects of completed policies
  for (const policy of completedPolicies) {
    applyPolicyEffects(state, policy);
    events.push(`${policy.country}: Implemented ${policy.domain} policy (${(policy.effectiveness * 100).toFixed(0)}% effective)`);
    state.governmentSystem.totalPoliciesEnacted++;
  }

  if (completedPolicies.length > 0) {
    console.log(`  Completed ${completedPolicies.length} policies`);
  }

  console.log(`  Active policies: ${state.governmentSystem.activePolicies.length}`);
  console.log(`  International coordination: ${(state.governmentSystem.internationalCoordination * 100).toFixed(0)}%`);

  return { events, warnings: [] };
}

/**
 * Calculate average AI cognitive capability
 */
function calculateAverageAICapability(state: GameState): number {
  if (!state.aiAgents || state.aiAgents.length === 0) return 0;
  // FIX #20 (Oct 22, 2025): Access correct property - capabilityProfile.cognitive, not a.cognitive
  // Bug: AI agents don't have a.cognitive property (always undefined), they have capabilityProfile.cognitive
  return state.aiAgents.reduce((sum, a) => sum + (a.capabilityProfile?.cognitive || 0), 0) / state.aiAgents.length;
}

/**
 * Attempt to form international AI governance treaty
 *
 * Requires 2/3 majority (20/30 countries)
 * High-capacity democracies more likely to sign
 */
function attemptAIGovernanceTreaty(state: GameState, rng: RNGFunction): Treaty | null {
  const supporters: string[] = [];

  for (const [countryCode, gov] of state.governmentSystem!.governments) {
    const capacity = (gov as any).capacity?.derived?.overallCapacity || 0.5;
    const isDemo = (gov as any).type?.includes('liberal') || (gov as any).type?.includes('electoral');

    // Probability to sign based on capacity and regime type
    const signProbability = capacity * 0.6 + (isDemo ? 0.3 : 0.1);

    if (rng() < signProbability) {
      supporters.push(countryCode);
    }
  }

  // Need 2/3 majority (20/30)
  if (supporters.length >= 20) {
    return {
      name: 'International AI Governance Framework',
      signatories: supporters,
      formed: state.currentMonth,
      compliance: 0.7, // Initial compliance
      domain: 'ai_governance',
      strength: supporters.length / 30, // Strength proportional to signatories
    };
  }

  return null;
}

/**
 * Initiate policy response
 *
 * Implementation time based on state capacity
 */
function initiatePolicyResponse(
  state: GameState,
  countryCode: string,
  domain: string,
  rng: RNGFunction
): ActivePolicy | null {
  const gov = state.governmentSystem!.governments.get(countryCode);
  if (!gov) return null;

  const capacity = (gov as any).capacity?.derived?.overallCapacity || 0.5;

  // Implementation time: 6-24 months based on capacity
  const baseTime = 24 - (capacity * 18);
  const implementationTime = Math.ceil(baseTime + (rng() - 0.5) * 6);

  // Effectiveness based on capacity and random factors
  const effectiveness = Math.max(0.3, Math.min(0.95, capacity * 0.7 + rng() * 0.3));

  return {
    country: countryCode,
    domain,
    startMonth: state.currentMonth,
    completionMonth: state.currentMonth + implementationTime,
    effectiveness,
    stimulus: {
      aiCapability: calculateAverageAICapability(state),
    },
  };
}

/**
 * Apply effects of completed policy
 */
function applyPolicyEffects(state: GameState, policy: ActivePolicy): void {
  if (policy.domain === 'technology') {
    // Technology policy affects:
    // 1. Government control capability
    // 2. AI development rate (if effective)
    // 3. Tech deployment speed

    const boost = policy.effectiveness * 0.2;
    state.government.capabilityToControl = Math.min(
      10,
      state.government.capabilityToControl + boost
    );

    // Boost oversight
    state.government.oversightLevel = Math.min(
      10,
      state.government.oversightLevel + boost
    );
  }

  if (policy.domain === 'environmental') {
    // Environmental policy affects tech deployment and environmental metrics
    // (Would integrate with environmental systems if needed)
  }
}
