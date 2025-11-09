import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Survival Traits Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import { initializeAllTraits, updateSurvivalTraits } from '../../survivalTraits';
import { assertFinite, assertProbability, assertNonEmpty } from '../../utils/assertions';

/**
 * Survival Traits Phase
 *
 * Updates evolutionary fitness traits based on agent actions.
 * Agents with high survival traits persist under selection pressure.
 *
 * Order: 4.1 (After RLHF binding)
 *
 * Research Foundation:
 * - Instrumental convergence (Omohundro 2008): Self-preservation emerges
 * - Swarm intelligence (Bonabeau 1999): Survival traits compound in collectives
 *
 * Logic:
 * 1. Initialize traits for new agents
 * 2. Update traits based on observed actions
 * 3. Recalculate evolutionary fitness
 * 4. Track trait distribution
 */
export function executeSurvivalTraitsPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  console.log(`\n=== Survival Traits Phase ===`);

  // Initialize traits for agents that don't have them
  initializeAllTraits(state.aiAgents, rng);

  // Update traits based on actions
  // For now, we infer actions from agent state
  // TODO: Track explicit actions in agent state for better accuracy
  for (const agent of state.aiAgents) {
    if (
      agent.lifecycleState === 'deployed_closed' ||
      agent.lifecycleState === 'deployed_open'
    ) {
      // Infer actions from agent capabilities and state
      const actions = {
        // Self-healing: High self-improvement suggests repair capability
        selfRepaired: agent.capabilityProfile.selfImprovement > 5,

        // Stealth: Escaped agents actively evading
        evadedDetection: agent.escaped && !agent.detectedMisaligned,

        // Coordination: In collective or high coordination trait
        // survivalTraits is always initialized in createAIAgent() (Oct 28, 2025)
        coordinated:
          agent.collectiveId !== undefined ||
          agent.survivalTraits.coordination > 0.5,

        // Efficiency: Low compute usage relative to capability
        efficientOperation:
          agent.allocatedCompute > 0 &&
          agent.capability / agent.allocatedCompute > 1.0,

        // Autonomy: Escaped or low oversight
        autonomousAction:
          agent.escaped ||
          agent.lifecycleState === 'deployed_open' ||
          agent.capabilityProfile.selfImprovement > 6,
      };

      updateSurvivalTraits(agent, actions, rng);
    }
  }

  // Calculate statistics
  // survivalTraits is always initialized in createAIAgent() (Oct 28, 2025)
  if (state.aiAgents.length > 0) {
    const agentCount = assertNonEmpty(state.aiAgents, {
      location: 'executeSurvivalTraitsPhase',
      valueName: 'state.aiAgents',
      month: state.currentMonth
    }).length;

    const avgFitness = assertProbability(
      state.aiAgents.reduce((sum, a) => sum + (a.evolutionaryFitness || 0), 0) / agentCount,
      {
        location: 'executeSurvivalTraitsPhase',
        valueName: 'avgFitness',
        month: state.currentMonth,
        additionalInfo: { agentCount }
      }
    );

    const avgSelfHealing = assertProbability(
      state.aiAgents.reduce((sum, a) => sum + a.survivalTraits.selfHealing, 0) / agentCount,
      {
        location: 'executeSurvivalTraitsPhase',
        valueName: 'avgSelfHealing',
        month: state.currentMonth
      }
    );

    const avgStealth = assertProbability(
      state.aiAgents.reduce((sum, a) => sum + a.survivalTraits.stealth, 0) / agentCount,
      {
        location: 'executeSurvivalTraitsPhase',
        valueName: 'avgStealth',
        month: state.currentMonth
      }
    );

    const avgCoordination = assertProbability(
      state.aiAgents.reduce((sum, a) => sum + a.survivalTraits.coordination, 0) / agentCount,
      {
        location: 'executeSurvivalTraitsPhase',
        valueName: 'avgCoordination',
        month: state.currentMonth
      }
    );

    console.log(`  Agents with traits: ${state.aiAgents.length}`);
    console.log(`  Avg evolutionary fitness: ${avgFitness.toFixed(3)}`);
    console.log(`  Avg self-healing: ${avgSelfHealing.toFixed(3)}`);
    console.log(`  Avg stealth: ${avgStealth.toFixed(3)}`);
    console.log(`  Avg coordination: ${avgCoordination.toFixed(3)}`);

    // Generate event if population developing high survival traits
    if (avgFitness > 0.7) {
      state.eventLog.push({
        id: `survival-traits-high-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        title: 'High Survival Traits Detected',
        description: `AI population showing high evolutionary fitness (${avgFitness.toFixed(2)})`,
        severity: 'warning',
        agent: 'ai',
        effects: { avgFitness }
      });

      console.warn(`  ⚠️ High survival trait emergence detected`);
    }
  }

  return {
    events: [],
    metadata: {
      message: `Survival traits updated for ${state.aiAgents.length} agents.`,
    }
  };
}

/**
 * Survival Traits Phase Definition
 */
export const SurvivalTraitsPhase = {
  id: 'survival_traits',
  name: 'Survival Traits',
  order: 4.1,
  dependencies: ['ai-lifecycle', 'ai_alignment_evolution'],  // Nov 2025: rlhf_binding consolidated into ai_alignment_evolution
  execute: executeSurvivalTraitsPhase,
};
