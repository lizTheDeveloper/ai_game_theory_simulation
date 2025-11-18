import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
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

import type { ActivePolicy, Treaty, GovernmentCapacity } from '../../../types/government';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
} from '@/simulation/utils/assertions';
import {
  calculateDeploymentTime,
  calculateTargetEffectiveness,
  isCaptureProbable,
  isEnforcementInsufficient,
  hasLoopholes,
  initializeGovernmentCapacity,
} from '@/simulation/government/policyLifecycle';

export class GovernmentResponsePhase implements SimulationPhase {
  readonly id = 'government-response';
  readonly name = 'Government Policy Response';
  readonly order = 25.0;
  readonly dependencies = ['ai-agent-actions']; // Reads AI capability, responds to AI risks

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const defaultContext: PhaseContext = { month: state.currentMonth, data: new Map(), executedPhases: new Set() };
    setDeterministicRng(rng);
    return executeGovernmentResponsePhase(state, rng, context || defaultContext);
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
    return { events: [], metadata: { warnings: [] } };
  }

  const events: GameEvent[] = [];
  console.log('\n=== Government Response Phase ===');

  // 1. Assess AI comprehension by each government
  const avgAICapability = calculateAverageAICapability(state);
  const misalignedCount = state.aiAgents.filter(a => a.alignment < 0.7).length;

  console.log(`  Average AI capability: ${avgAICapability.toFixed(2)}`);
  console.log(`  Misaligned AIs: ${misalignedCount}/${state.aiAgents.length}`);

  // 2. Check for governments still comprehending AI capabilities
  let comprehendingCount = 0;
  for (const [countryCode, gov] of state.governmentSystem.governments) {
    // KEEP LEGITIMATE DEFAULT - Map.get() returns undefined for new keys
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
        events.push({
          id: `ai_governance_treaty_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'transformative',
          agent: 'government',
          title: 'International AI Governance Treaty',
          description: `International AI Governance Treaty formed: ${treaty.signatories.length}/30 countries`,
          effects: { signatories: treaty.signatories.length, compliance: treaty.compliance }
        });
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

    // PERF FIX (Nov 10, 2025): Calculate avgAICapability once before loop (Phase 3 optimization)
    // Before: initiatePolicyResponse called avgAICapability N times (same result)
    // After: Pre-calculate and pass in (20-30% faster)
    const avgCapabilityForStimulus = avgAICapability;

    for (const [countryCode, gov] of state.governmentSystem.governments) {
      // KEEP LEGITIMATE DEFAULT - government capacity may not be initialized yet
      const capacity = (gov as any).capacity?.derived?.overallCapacity || 0.5;
      const isDemo = (gov as any).type?.includes('liberal') || (gov as any).type?.includes('electoral');

      // High-capacity democracies respond first
      if (capacity > 0.6 && isDemo && rng() > 0.7) {
        const policy = initiatePolicyResponse(state, countryCode, 'technology', rng, avgCapabilityForStimulus);
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
    events.push({
      id: `policy_completed_${policy.country}_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'policy',
      severity: 'info',
      agent: 'government',
      title: 'Policy Implementation Complete',
      description: `${policy.country}: Implemented ${policy.domain} policy (${(policy.currentEffectiveness * 100).toFixed(0)}% effective)`,
      effects: { country: policy.country, domain: policy.domain, effectiveness: policy.currentEffectiveness }
    });
    state.governmentSystem.totalPoliciesEnacted++;
  }

  if (completedPolicies.length > 0) {
    console.log(`  Completed ${completedPolicies.length} policies`);
  }

  console.log(`  Active policies: ${state.governmentSystem.activePolicies.length}`);
  console.log(`  International coordination: ${(state.governmentSystem.internationalCoordination * 100).toFixed(0)}%`);

  return { events, metadata: { warnings: [] } };
}

/**
 * Calculate average AI cognitive capability
 */
function calculateAverageAICapability(state: GameState): number {
  if (!state.aiAgents || state.aiAgents.length === 0) return 0;
  // FIX #20 (Oct 22, 2025): Access correct property - capabilityProfile.cognitive, not a.cognitive
  // Bug: AI agents don't have a.cognitive property (always undefined), they have capabilityProfile.cognitive
  // KEEP LEGITIMATE DEFAULT - capabilityProfile may not exist for agents in training
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
    // KEEP LEGITIMATE DEFAULT - government capacity may not be initialized yet
    const capacity = (gov as any).capacity?.derived?.overallCapacity || 0.5;
    const isDemo = (gov as any).type?.includes('liberal') || (gov as any).type?.includes('electoral');

    // Probability to sign based on capacity and regime type
    const signProbability = assertProbability(
      assertFinite(capacity, {
        location: 'attemptAIGovernanceTreaty',
        valueName: 'capacity',
        month: state.currentMonth,
        additionalInfo: { countryCode }
      }) * 0.6 + (isDemo ? 0.3 : 0.1),
      {
        location: 'attemptAIGovernanceTreaty',
        valueName: 'signProbability',
        month: state.currentMonth,
        additionalInfo: { countryCode, capacity, isDemo }
      }
    );

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
 * Implementation time based on state capacity, funding, institutional factors.
 * Uses realistic implementation lifecycle (24-72 months, 30-80% effectiveness).
 */
function initiatePolicyResponse(
  state: GameState,
  countryCode: string,
  domain: string,
  rng: RNGFunction,
  avgAICapability?: number // PERF FIX (Nov 10, 2025): Optional pre-calculated value to avoid repeated calls
): ActivePolicy | null {
  const gov = state.governmentSystem!.governments.get(countryCode);
  if (!gov) return null;

  // Initialize government capacity if not present
  const govCapacity: GovernmentCapacity = initializeGovernmentCapacity(countryCode, gov, rng);

  // KEEP LEGITIMATE DEFAULT - government capacity may not be initialized yet
  const stateCapacity = (gov as any).capacity?.derived?.overallCapacity || 0.5;

  // Policy implementation factors
  // Funding level: based on state capacity and economic conditions
  const fundingLevel = Math.max(0.3, Math.min(1.0, stateCapacity * 0.8 + rng() * 0.2));

  // Bureaucratic capacity: based on state capacity and regulatory expertise
  const bureaucraticCapacity = Math.max(0.3, Math.min(0.9,
    stateCapacity * 0.6 + govCapacity.regulatoryExpertise * 0.4
  ));

  // Political will: initially high (policy just passed), but can decay
  const politicalWill = Math.max(0.6, Math.min(0.95, 0.8 + rng() * 0.15));

  // Public support: varies by domain and current conditions
  const publicSupport = Math.max(0.4, Math.min(0.9, 0.65 + (rng() - 0.5) * 0.5));

  // Calculate deployment time and target effectiveness
  const deploymentTime = calculateDeploymentTime(fundingLevel, govCapacity, rng);
  const targetEffectiveness = calculateTargetEffectiveness(
    bureaucraticCapacity,
    politicalWill,
    publicSupport,
    rng
  );

  // Determine failure modes
  const capturedByIndustry = isCaptureProbable(domain, govCapacity, rng);
  const insufficientEnforcement = isEnforcementInsufficient(fundingLevel, bureaucraticCapacity, rng);
  const loopholes = hasLoopholes(govCapacity, rng);

  console.log(`  🏛️ ${countryCode} initiating ${domain} policy:`);
  console.log(`     Deployment: ${deploymentTime} months`);
  console.log(`     Target effectiveness: ${(targetEffectiveness * 100).toFixed(0)}%`);
  if (capturedByIndustry) console.log(`     ⚠️ Industry capture risk`);
  if (insufficientEnforcement) console.log(`     ⚠️ Enforcement concerns`);
  if (loopholes) console.log(`     ⚠️ Legislative loopholes`);

  return {
    country: countryCode,
    domain,
    startMonth: state.currentMonth,
    completionMonth: state.currentMonth + deploymentTime,
    currentEffectiveness: 0, // Starts at 0, ramps up via sigmoid
    targetEffectiveness,
    fundingLevel,
    bureaucraticCapacity,
    politicalWill,
    publicSupport,
    capturedByIndustry,
    insufficientEnforcement,
    loopholes,
    stimulus: {
      // PERF FIX (Nov 10, 2025): Use pre-calculated value if provided, else calculate (Phase 3 optimization)
      aiCapability: avgAICapability !== undefined ? avgAICapability : calculateAverageAICapability(state),
    },
    // Legacy field for backward compatibility
    effectiveness: 0,
  };
}

/**
 * Apply effects of completed policy
 *
 * Uses currentEffectiveness (not the legacy effectiveness field).
 * Policy effects scale with current implementation progress.
 */
function applyPolicyEffects(state: GameState, policy: ActivePolicy): void {
  // Use currentEffectiveness for all calculations
  const effectiveness = policy.currentEffectiveness;

  if (policy.domain === 'technology') {
    // Technology policy affects:
    // 1. Government control capability
    // 2. AI development rate (if effective)
    // 3. Tech deployment speed

    const boost = effectiveness * 0.2;
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
