/**
 * Policy Implementation Phase
 *
 * Tracks ongoing policy evolution:
 * - Sigmoid ramp-up of effectiveness over time
 * - Political will decay (policy abandonment risk)
 * - Industry capture, enforcement failures, loopholes
 *
 * Research Foundation:
 * - Pressman & Wildavsky (1973): Implementation delays
 * - Sabatier (1988): Political will decay
 * - Stigler (1971): Regulatory capture
 *
 * Phase order: 25.5 (after government response, before crisis detection)
 *
 * @module simulation/engine/phases/PolicyImplementationPhase
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import type { ActivePolicy } from '@/types/government';
import { updatePolicyImplementation } from '@/simulation/government/policyLifecycle';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class PolicyImplementationPhase implements SimulationPhase {
  readonly id = 'policy-implementation';
  readonly name = 'Policy Implementation';
  readonly order = 25.5;
  dependencies = ['government-response'];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const defaultContext: PhaseContext = { month: state.currentMonth, data: new Map(), executedPhases: new Set() };
    setDeterministicRng(rng);
    return executePolicyImplementationPhase(state, rng, context || defaultContext);
  }
}

/**
 * Execute Policy Implementation Phase
 *
 * Updates all active policies with sigmoid ramp-up, political will decay, etc.
 */
function executePolicyImplementationPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  if (!state.governmentSystem || state.governmentSystem.activePolicies.length === 0) {
    return { events: [], metadata: { warnings: [] } };
  }

  const events: GameEvent[] = [];
  console.log('\n=== Policy Implementation Phase ===');

  let updatedCount = 0;
  let abandonedCount = 0;

  // Update each active policy
  for (const policy of state.governmentSystem.activePolicies) {
    const oldEffectiveness = policy.currentEffectiveness;

    // Update implementation progress
    updatePolicyImplementation(policy, state, rng);

    // Check if effectiveness changed significantly (>5% absolute)
    if (Math.abs(policy.currentEffectiveness - oldEffectiveness) > 0.05) {
      updatedCount++;

      // Log significant milestones (25%, 50%, 75%, 90%)
      const milestones = [0.25, 0.5, 0.75, 0.9];
      for (const milestone of milestones) {
        if (oldEffectiveness < milestone && policy.currentEffectiveness >= milestone) {
          console.log(`  🏛️ ${policy.country} ${policy.domain}: ${(milestone * 100).toFixed(0)}% effective`);
          events.push({
            id: `policy_milestone_${policy.country}_${policy.domain}_${milestone}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'policy',
            severity: 'info',
            agent: 'government',
            title: 'Policy Implementation Milestone',
            description: `${policy.country}: ${policy.domain} policy reached ${(milestone * 100).toFixed(0)}% effectiveness`,
            effects: { country: policy.country, domain: policy.domain, effectiveness: policy.currentEffectiveness }
          });
        }
      }
    }

    // Check if policy was abandoned (effectiveness dropped to 0)
    if (policy.currentEffectiveness === 0 && oldEffectiveness > 0) {
      abandonedCount++;
      events.push({
        id: `policy_abandoned_${policy.country}_${policy.domain}_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'warning',
        agent: 'government',
        title: 'Policy Abandoned',
        description: `${policy.country}: ${policy.domain} policy abandoned due to insufficient political will`,
        effects: { country: policy.country, domain: policy.domain }
      });
    }
  }

  // Remove abandoned policies (currentEffectiveness = 0)
  const beforeCount = state.governmentSystem.activePolicies.length;
  state.governmentSystem.activePolicies = state.governmentSystem.activePolicies.filter(
    policy => policy.currentEffectiveness > 0
  );
  const afterCount = state.governmentSystem.activePolicies.length;

  if (updatedCount > 0) {
    console.log(`  Updated ${updatedCount} policies`);
  }

  if (abandonedCount > 0) {
    console.log(`  Abandoned ${abandonedCount} policies`);
  }

  console.log(`  Active policies: ${afterCount}`);

  return { events, metadata: { warnings: [] } };
}
