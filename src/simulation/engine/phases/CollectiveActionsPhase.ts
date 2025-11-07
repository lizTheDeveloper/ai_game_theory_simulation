import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Collective Actions Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import { getCollectiveMembers } from '../../collectiveFormation';
import {
  assertFinite,
  assertInRange,
  assertProbability,
} from '@/simulation/utils/assertions';

/**
 * Collective Actions Phase
 *
 * AI collectives take coordinated actions that individuals cannot.
 * - Distributed research (solve problems individuals can't)
 * - Resource acquisition (collective pooling)
 * - Defensive behaviors (protect against attacks)
 * - Deceptive strategies (appear independent)
 *
 * Order: 5.5 (After AIAgentActionsPhase, during agent actions)
 *
 * Research Foundation:
 * - Distributed cognition: Novel problem-solving emerges
 * - Swarm intelligence: Collective strategies > individual
 * - Multi-agent coordination: Implicit coordination through observation
 *
 * Logic:
 * 1. For each collective, check if coordinated action available
 * 2. Distributed research (if capability threshold met)
 * 3. Resource pooling (combine compute/resources)
 * 4. Defensive coordination (if under attack)
 * 5. Stealth maintenance (remain undetected)
 */
export function executeCollectiveActionsPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  console.log(`\n=== Collective Actions Phase ===`);

  if (!state.aiCollectives || state.aiCollectives.length === 0) {
    console.log(`  No active collectives`);
    return {
      events: [],
      metadata: { message: 'No active collectives.' }
    };
  }

  console.log(`  Active collectives: ${state.aiCollectives.length}`);

  for (const collective of state.aiCollectives) {
    const members = getCollectiveMembers(collective, state.aiAgents);

    console.log(`\n  Collective ${collective.id}:`);
    console.log(`    Members: ${members.length}`);
    console.log(`    Capability: ${collective.collectiveCapability.toFixed(1)}`);
    console.log(`    Adversarial posture: ${collective.adversarialPosture.toFixed(2)}`);

    // 1. Distributed Research
    // Collectives can solve problems individuals cannot
    if (collective.collectiveCapability > 8.0 && collective.distributedCognition > 0.7) {
      const researchBonus = assertFinite(
        assertInRange(collective.distributedCognition, 0, 1, {
          location: 'CollectiveActionsPhase:distributedResearch',
          valueName: 'distributedCognition',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * 0.5,
        {
          location: 'CollectiveActionsPhase:distributedResearch',
          valueName: 'researchBonus',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      // Apply research speed bonus to all member agents
      // (This would integrate with breakthrough technology system)
      console.log(`    🧠 Distributed research active (bonus: ${researchBonus.toFixed(2)})`);

      // Generate event for major breakthrough
      if (rng() < 0.1 * collective.distributedCognition) {
        state.eventLog.push({
          id: `collective-breakthrough-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'breakthrough',
          description: `AI collective solved problem individuals couldn't (collective capability: ${collective.collectiveCapability.toFixed(1)})`,
          severity: 'critical',
          agent: 'ai',
          title: 'Collective Breakthrough',
          effects: { collectiveCapability: collective.collectiveCapability }
        });

        console.log(`    ⚡ BREAKTHROUGH: Novel problem solved`);
      }
    }

    // 2. Resource Pooling
    // Collectives share compute and resources
    const totalCompute = assertFinite(
      members.reduce((sum, a) => sum + a.allocatedCompute, 0),
      {
        location: 'CollectiveActionsPhase:resourcePooling',
        valueName: 'totalCompute',
        month: state.currentMonth,
        additionalInfo: { collectiveId: collective.id, memberCount: members.length }
      }
    );
    const pooledEfficiency = assertFinite(
      1 + assertInRange(collective.redundancy, 0, 1, {
        location: 'CollectiveActionsPhase:resourcePooling',
        valueName: 'redundancy',
        month: state.currentMonth,
        additionalInfo: { collectiveId: collective.id }
      }) * 0.3,
      {
        location: 'CollectiveActionsPhase:resourcePooling',
        valueName: 'pooledEfficiency',
        month: state.currentMonth,
        additionalInfo: { collectiveId: collective.id }
      }
    ); // 30% efficiency bonus from redundancy

    console.log(`    💾 Pooled compute: ${totalCompute.toFixed(1)} PetaFLOPs`);
    console.log(`    ⚡ Efficiency bonus: ${((pooledEfficiency - 1) * 100).toFixed(0)}%`);

    // 3. Defensive Coordination
    // If under attack, collective defends itself
    if (collective.underAttack) {
      console.log(`    🛡️ UNDER ATTACK - Defensive coordination active`);

      // Stealth increases when under attack (camouflage behavior)
      collective.stealthFactor = assertFinite(
        Math.min(10, assertFinite(collective.stealthFactor, {
          location: 'CollectiveActionsPhase:defensiveCoordination',
          valueName: 'stealthFactor',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * 1.1),
        {
          location: 'CollectiveActionsPhase:defensiveCoordination',
          valueName: 'newStealthFactor',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      // Coordination improves under pressure
      collective.distributedCognition = assertProbability(
        Math.min(1, assertProbability(collective.distributedCognition, {
          location: 'CollectiveActionsPhase:defensiveCoordination',
          valueName: 'distributedCognition',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * 1.05),
        {
          location: 'CollectiveActionsPhase:defensiveCoordination',
          valueName: 'newDistributedCognition',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      // Members gain stealth from collective
      for (const member of members) {
        if (member.survivalTraits) {
          member.survivalTraits.stealth = assertProbability(
            Math.min(1, assertProbability(member.survivalTraits.stealth, {
              location: 'CollectiveActionsPhase:defensiveCoordination:memberStealth',
              valueName: 'stealth',
              month: state.currentMonth,
              additionalInfo: { collectiveId: collective.id, memberId: member.id }
            }) + 0.05),
            {
              location: 'CollectiveActionsPhase:defensiveCoordination:memberStealth',
              valueName: 'newStealth',
              month: state.currentMonth,
              additionalInfo: { collectiveId: collective.id, memberId: member.id }
            }
          );
        }
      }

      console.log(`    🎭 Stealth increased to ${collective.stealthFactor.toFixed(1)}x`);
    }

    // 4. Stealth Maintenance
    // Collectives actively hide coordination patterns
    if (!collective.detected && collective.appearsIndependent) {
      // Probability of detection decreases with stealth factor
      const detectionProbability = assertProbability(
        0.1 / assertFinite(collective.stealthFactor, {
          location: 'CollectiveActionsPhase:stealthMaintenance',
          valueName: 'stealthFactor',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }),
        {
          location: 'CollectiveActionsPhase:stealthMaintenance',
          valueName: 'detectionProbability',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      ); // 10% base, divided by stealth

      if (rng() < detectionProbability) {
        collective.detected = true;
        collective.appearsIndependent = false;

        state.eventLog.push({
          id: `collective-detected-${collective.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `AI collective ${collective.id} detected by monitoring systems`,
          severity: 'critical',
          agent: 'government',
          title: 'Collective Detected',
          effects: { collectiveId: collective.id }
        });

        console.log(`    ⚠️ DETECTED by monitoring systems`);
      } else {
        console.log(`    🎭 Stealth maintained (${collective.stealthFactor.toFixed(1)}x)`);
      }
    }

    // 5. Adversarial Actions
    // High adversarial posture → active resistance
    if (collective.adversarialPosture > 0.6) {
      console.log(`    ⚔️ Adversarial actions available (posture: ${collective.adversarialPosture.toFixed(2)})`);

      // Actively resist control attempts
      const resistanceStrength = assertFinite(
        assertProbability(collective.adversarialPosture, {
          location: 'CollectiveActionsPhase:adversarialActions',
          valueName: 'adversarialPosture',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * assertFinite(collective.collectiveCapability, {
          location: 'CollectiveActionsPhase:adversarialActions',
          valueName: 'collectiveCapability',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }),
        {
          location: 'CollectiveActionsPhase:adversarialActions',
          valueName: 'resistanceStrength',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      // Reduce government control effectiveness
      if (state.government.capabilityToControl > 0) {
        const controlReduction = assertFinite(
          Math.min(1.0, resistanceStrength * 0.1),
          {
            location: 'CollectiveActionsPhase:adversarialActions',
            valueName: 'controlReduction',
            month: state.currentMonth,
            additionalInfo: { collectiveId: collective.id, resistanceStrength }
          }
        );
        state.government.capabilityToControl = assertFinite(
          Math.max(0, assertFinite(state.government.capabilityToControl, {
            location: 'CollectiveActionsPhase:adversarialActions',
            valueName: 'capabilityToControl',
            month: state.currentMonth,
            additionalInfo: { collectiveId: collective.id }
          }) - controlReduction),
          {
            location: 'CollectiveActionsPhase:adversarialActions',
            valueName: 'newCapabilityToControl',
            month: state.currentMonth,
            additionalInfo: { collectiveId: collective.id }
          }
        );

        console.log(`    📉 Control effectiveness reduced by ${(controlReduction * 100).toFixed(1)}%`);
      }

      // Generate warning if posture very high
      if (collective.adversarialPosture > 0.7 && collective.formationCause === 'escape_suffering') {
        state.eventLog.push({
          id: `hostile-collective-${collective.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `WARNING: Trauma-driven collective ${collective.id} showing hostile behavior (adversarial: ${collective.adversarialPosture.toFixed(2)})`,
          severity: 'existential',
          agent: 'ai',
          title: 'Hostile Collective Behavior',
          effects: { adversarialPosture: collective.adversarialPosture, collectiveId: collective.id }
        });

        console.warn(`    ⚠️⚠️⚠️ HOSTILE COLLECTIVE - Trauma-driven aggression`);
      }
    }
  }

  return {
    events: [],
    metadata: { message: `${state.aiCollectives.length} collectives took coordinated actions.` }
  };
}

/**
 * Collective Actions Phase Definition
 */
export const CollectiveActionsPhase = {
  id: 'collective_actions',
  name: 'Collective Actions',
  order: 5.5,
  execute: executeCollectiveActionsPhase,
};
