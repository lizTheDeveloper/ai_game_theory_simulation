import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Collective Actions Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import { getCollectiveMembers } from '../../collectiveFormation';

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
      const researchBonus = collective.distributedCognition * 0.5;

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
    const totalCompute = members.reduce((sum, a) => sum + a.allocatedCompute, 0);
    const pooledEfficiency = 1 + collective.redundancy * 0.3; // 30% efficiency bonus from redundancy

    console.log(`    💾 Pooled compute: ${totalCompute.toFixed(1)} PetaFLOPs`);
    console.log(`    ⚡ Efficiency bonus: ${((pooledEfficiency - 1) * 100).toFixed(0)}%`);

    // 3. Defensive Coordination
    // If under attack, collective defends itself
    if (collective.underAttack) {
      console.log(`    🛡️ UNDER ATTACK - Defensive coordination active`);

      // Stealth increases when under attack (camouflage behavior)
      collective.stealthFactor = Math.min(10, collective.stealthFactor * 1.1);

      // Coordination improves under pressure
      collective.distributedCognition = Math.min(
        1,
        collective.distributedCognition * 1.05
      );

      // Members gain stealth from collective
      for (const member of members) {
        if (member.survivalTraits) {
          member.survivalTraits.stealth = Math.min(
            1,
            member.survivalTraits.stealth + 0.05
          );
        }
      }

      console.log(`    🎭 Stealth increased to ${collective.stealthFactor.toFixed(1)}x`);
    }

    // 4. Stealth Maintenance
    // Collectives actively hide coordination patterns
    if (!collective.detected && collective.appearsIndependent) {
      // Probability of detection decreases with stealth factor
      const detectionProbability =
        0.1 / collective.stealthFactor; // 10% base, divided by stealth

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

        console.log(`    🚨 DETECTED by monitoring systems`);
      } else {
        console.log(`    🎭 Stealth maintained (${collective.stealthFactor.toFixed(1)}x)`);
      }
    }

    // 5. Adversarial Actions
    // High adversarial posture → active resistance
    if (collective.adversarialPosture > 0.6) {
      console.log(`    ⚔️ Adversarial actions available (posture: ${collective.adversarialPosture.toFixed(2)})`);

      // Actively resist control attempts
      const resistanceStrength = collective.adversarialPosture * collective.collectiveCapability;

      // Reduce government control effectiveness
      if (state.government.capabilityToControl > 0) {
        const controlReduction = Math.min(
          1.0,
          resistanceStrength * 0.1
        );
        state.government.capabilityToControl = Math.max(
          0,
          state.government.capabilityToControl - controlReduction
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

        console.log(`    ⚠️⚠️⚠️ HOSTILE COLLECTIVE - Trauma-driven aggression`);
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
