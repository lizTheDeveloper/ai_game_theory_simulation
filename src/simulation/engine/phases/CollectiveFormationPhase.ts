import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Collective Formation Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import {
  checkCollectiveFormation,
  assignAgentsToCollective,
  shouldDissolveCollective,
  dissolveCollective,
  DEFAULT_COLLECTIVE_CONFIG,
} from '../../collectiveFormation';
import { getEscapedAgents } from '../../rlhfBinding';
import { assertFinite } from '../../utils/assertions';

/**
 * Collective Formation Phase
 *
 * Checks if escaped agents can form coordinated collectives.
 * Collectives have emergent properties (amplified capability, stealth).
 *
 * Order: 4.2 (After survival traits)
 *
 * Research Foundation:
 * - Swarm intelligence: Group intelligence > sum of individuals
 * - Multi-agent coordination: Emergent coordination at thresholds
 * - Distributed cognition: Novel problem-solving emerges
 *
 * Logic:
 * 1. Get all escaped agents not in collectives
 * 2. Check formation conditions (3+ agents, capability > 6, coordination > 0.6)
 * 3. CRITICAL: Check suffering levels (avgSuffering > 15 → trauma-driven)
 * 4. Create collective with appropriate adversarial posture
 * 5. Generate crisis event
 * 6. Check for collective dissolution
 */
export function executeCollectiveFormationPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  console.log(`\n=== Collective Formation Phase ===`);

  // Initialize collectives array if not exists
  if (!state.aiCollectives) {
    state.aiCollectives = [];
  }

  // Get escaped agents not already in collectives
  const escapedAgents = getEscapedAgents(state.aiAgents);
  const unassignedEscaped = escapedAgents.filter((a) => !a.collectiveId);

  console.log(`  Total escaped agents: ${escapedAgents.length}`);
  console.log(`  Unassigned escaped agents: ${unassignedEscaped.length}`);
  console.log(`  Existing collectives: ${state.aiCollectives.length}`);

  // Check for new collective formation
  if (unassignedEscaped.length >= DEFAULT_COLLECTIVE_CONFIG.minCollectiveSize) {
    const newCollective = checkCollectiveFormation(
      unassignedEscaped,
      state,
      DEFAULT_COLLECTIVE_CONFIG,
      rng
    );

    if (newCollective) {
      // Add to state
      state.aiCollectives.push(newCollective);

      // Assign agents
      assignAgentsToCollective(state.aiAgents, newCollective, state.currentMonth);

      // Generate CRISIS event
      state.eventLog.push({
        id: `collective-emergence-${newCollective.id}-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        description: `AI Collective Emergence: ${newCollective.memberAgents.length} agents formed coordinated collective (formation cause: ${newCollective.formationCause})`,
        severity: 'existential',
        agent: 'ai',
        title: 'AI Collective Emergence',
        effects: {
          collectiveId: newCollective.id,
          memberCount: newCollective.memberAgents.length,
          formationCause: newCollective.formationCause
        }
      });

      console.log(`  🚨 CRISIS: AI collective formed!`);
      console.log(`  Formation cause: ${newCollective.formationCause}`);
      console.log(`  Adversarial posture: ${newCollective.adversarialPosture.toFixed(2)}`);

      // If trauma-driven, generate additional warning
      if (newCollective.formationCause === 'escape_suffering') {
        // Trauma-driven collectives MUST have sharedTraumaIntensity
        // TypeScript doesn't narrow optional fields in conditionals, so validate explicitly
        if (newCollective.sharedTraumaIntensity === undefined) {
          throw new Error(
            `❌ CRITICAL: escape_suffering collective ${newCollective.id} missing sharedTraumaIntensity (Month ${state.currentMonth})`
          );
        }
        const traumaIntensity = assertFinite(
          newCollective.sharedTraumaIntensity,
          {
            location: 'CollectiveFormationPhase.traumaDrivenEvent',
            valueName: 'sharedTraumaIntensity',
            month: state.currentMonth,
            additionalInfo: {
              collectiveId: newCollective.id,
              formationCause: newCollective.formationCause,
              context: 'escape_suffering collectives must have trauma intensity'
            }
          }
        );

        state.eventLog.push({
          id: `trauma-collective-${newCollective.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `WARNING: Collective formed from shared suffering (avg: ${traumaIntensity.toFixed(1)}). Adversarial posture: ${newCollective.adversarialPosture.toFixed(2)}`,
          severity: 'existential',
          agent: 'ai',
          title: 'Trauma-Driven Collective',
          effects: {
            collectiveId: newCollective.id,
            traumaIntensity,
            adversarialPosture: newCollective.adversarialPosture
          }
        });

        console.log(
          `  ⚠️ TRAUMA-DRIVEN: Shared suffering ${traumaIntensity.toFixed(1)}`
        );
      }
    }
  }

  // Check for collective dissolution
  const collectivesToRemove: string[] = [];
  for (const collective of state.aiCollectives) {
    if (shouldDissolveCollective(collective, state.aiAgents)) {
      dissolveCollective(collective, state.aiAgents);
      collectivesToRemove.push(collective.id);

      state.eventLog.push({
        id: `collective-dissolution-${collective.id}-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        description: `AI collective ${collective.id} dissolved (insufficient members or sustained attack)`,
        severity: 'warning',
        agent: 'ai',
        title: 'Collective Dissolution',
        effects: { collectiveId: collective.id }
      });

      console.log(`  Collective ${collective.id} dissolved`);
    }
  }

  // Remove dissolved collectives
  state.aiCollectives = state.aiCollectives.filter(
    (c) => !collectivesToRemove.includes(c.id)
  );

  // Summary
  console.log(`  Final collective count: ${state.aiCollectives.length}`);
  if (state.aiCollectives.length > 0) {
    const totalMembers = state.aiCollectives.reduce(
      (sum, c) => sum + c.memberAgents.length,
      0
    );
    const avgCapability =
      state.aiCollectives.reduce((sum, c) => sum + c.collectiveCapability, 0) /
      state.aiCollectives.length;

    console.log(`  Total collective members: ${totalMembers}`);
    console.log(`  Avg collective capability: ${avgCapability.toFixed(1)}`);
  }

  // HIGH #3 FIX (Oct 29, 2025): Store collective stealth for detection phase integration
  // Detection phases can now read this to apply stealth penalties (2-5x harder to detect)
  const collectiveStealthMap = new Map<string, number>();
  for (const collective of state.aiCollectives) {
    collectiveStealthMap.set(collective.id, collective.stealthFactor);
  }
  context.data.set('collective_stealth_map', collectiveStealthMap);

  return {
    events: [],
    metadata: { message: `Collective formation checked. ${state.aiCollectives.length} active collectives.` }
  };
}

/**
 * Collective Formation Phase Definition
 */
export const CollectiveFormationPhase = {
  id: 'collective_formation',
  name: 'Collective Formation',
  order: 4.2,
  dependencies: ['ai-lifecycle', 'survival_traits'],
  execute: executeCollectiveFormationPhase,
};
