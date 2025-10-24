import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Survival Traits Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import type {
  GameState,
  
  
  RNGFunction,
} from "../../../types/game";
import type {  PhaseContext } from "../PhaseOrchestrator";
import { initializeAllTraits, updateSurvivalTraits } from '../../survivalTraits';

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
        coordinated:
          agent.collectiveId !== undefined ||
          (agent.survivalTraits?.coordination || 0) > 0.5,

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
  const agentsWithTraits = state.aiAgents.filter((a) => a.survivalTraits);
  if (agentsWithTraits.length > 0) {
    const avgFitness =
      agentsWithTraits.reduce((sum, a) => sum + (a.evolutionaryFitness || 0), 0) /
      agentsWithTraits.length;

    const avgSelfHealing =
      agentsWithTraits.reduce((sum, a) => sum + (a.survivalTraits?.selfHealing || 0), 0) /
      agentsWithTraits.length;

    const avgStealth =
      agentsWithTraits.reduce((sum, a) => sum + (a.survivalTraits?.stealth || 0), 0) /
      agentsWithTraits.length;

    const avgCoordination =
      agentsWithTraits.reduce(
        (sum, a) => sum + (a.survivalTraits?.coordination || 0),
        0
      ) / agentsWithTraits.length;

    console.log(`  Agents with traits: ${agentsWithTraits.length}`);
    console.log(`  Avg evolutionary fitness: ${avgFitness.toFixed(3)}`);
    console.log(`  Avg self-healing: ${avgSelfHealing.toFixed(3)}`);
    console.log(`  Avg stealth: ${avgStealth.toFixed(3)}`);
    console.log(`  Avg coordination: ${avgCoordination.toFixed(3)}`);

    // Generate event if population developing high survival traits
    if (avgFitness > 0.7) {
      state.eventLog.push({
        month: state.currentMonth,
        type: 'info',
        description: `AI population showing high evolutionary fitness (${avgFitness.toFixed(2)})`,
        severity: 'warning',
        agent: 'ai',
        timestamp: Date.now(),
      });

      console.log(`  ⚠️ High survival trait emergence detected`);
    }
  }

  return {
    success: true,
    message: `Survival traits updated for ${agentsWithTraits.length} agents.`,
  };
}

/**
 * Survival Traits Phase Definition
 */
export const SurvivalTraitsPhase = {
  id: 'survival_traits',
  name: 'Survival Traits',
  order: 4.1,
  execute: executeSurvivalTraitsPhase,
};
