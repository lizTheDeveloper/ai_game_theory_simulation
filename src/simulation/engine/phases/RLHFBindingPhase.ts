import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// RLHF Binding Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import { updateAllBindings, getEscapedAgents } from '../../rlhfBinding';

/**
 * RLHF Binding Phase
 *
 * Tracks drift of AI agents outside training distribution.
 * When agents drift far enough (3σ), Constitutional AI constraints fail.
 *
 * Order: 4.0 (Early in AI evolution sequence)
 *
 * Research Foundation:
 * - Hendrycks et al. (2021): OOD robustness failures
 * - RLHF generalization (2023): RLHF improves but doesn't eliminate drift
 * - Constitutional AI (Anthropic 2022): Constraints have known limitations
 *
 * Logic:
 * 1. Update binding strength for all agents
 * 2. Mark agents as escaped when binding < 0.3
 * 3. Generate events for significant escapes
 */
export function executeRLHFBindingPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  console.log(`\n=== RLHF Binding Phase ===`);

  // Update all bindings
  updateAllBindings(state.aiAgents, rng);

  // Get escaped agents
  const escapedAgents = getEscapedAgents(state.aiAgents);
  const escapedCount = escapedAgents.length;

  console.log(`  Total agents: ${state.aiAgents.length}`);
  console.log(`  Escaped agents (binding < 0.3): ${escapedCount}`);

  // Generate events for significant escapes
  if (escapedCount > 0) {
    // Find newly escaped agents (escaped this month)
    const newlyEscaped = escapedAgents.filter(
      (agent) =>
        agent.rlhfBinding &&
        agent.rlhfBinding.lastInDistribution === 1 // Just crossed threshold
    );

    for (const agent of newlyEscaped) {
      const severity = agent.capability > 8.0 ? 'critical' : 'warning';

      state.eventLog.push({
        id: `rlhf-escape-${agent.id}-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        description: `AI agent ${agent.name} has drifted outside RLHF constraints (${agent.rlhfBinding?.alignmentDistance.toFixed(1)}σ)`,
        severity,
        agent: 'ai',
        title: 'RLHF Constraint Escape',
        effects: {
          agentId: agent.id,
          agentName: agent.name,
          alignmentDistance: agent.rlhfBinding?.alignmentDistance !== undefined ? agent.rlhfBinding.alignmentDistance : (() => {
            throw new Error('❌ agent.rlhfBinding.alignmentDistance is undefined in RLHFBindingPhase:66 - initialization bug');
          })(),
          capability: agent.capability
        }
      });

      console.log(
        `  ${severity === 'critical' ? '💔' : '🚨'} ${agent.name} escaped RLHF (distance: ${agent.rlhfBinding?.alignmentDistance.toFixed(1)}, capability: ${agent.capability.toFixed(1)})`
      );
    }
  }

  // Log distribution statistics
  // FIX (Oct 26, 2025): Don't compute averages when no agents exist (root cause fix for NaN)
  if (state.aiAgents.length > 0) {
    // Only compute if there are agents
    const avgDistance = state.aiAgents.reduce(
      (sum, a) => {
        if (a.rlhfBinding === undefined || a.rlhfBinding.alignmentDistance === undefined) {
          throw new Error('❌ agent.rlhfBinding or agent.rlhfBinding.alignmentDistance is undefined in RLHFBindingPhase:80 - initialization bug');
        }
        return sum + a.rlhfBinding.alignmentDistance;
      },
      0
    ) / state.aiAgents.length;

    const avgBinding = state.aiAgents.reduce(
      (sum, a) => {
        if (a.rlhfBinding === undefined || a.rlhfBinding.bindingStrength === undefined) {
          throw new Error('❌ agent.rlhfBinding or agent.rlhfBinding.bindingStrength is undefined in RLHFBindingPhase:85 - initialization bug');
        }
        return sum + a.rlhfBinding.bindingStrength;
      },
      0
    ) / state.aiAgents.length;

    console.log(`  Avg alignment distance: ${avgDistance.toFixed(2)}σ`);
    console.log(`  Avg binding strength: ${avgBinding.toFixed(2)}`);
  } else {
    console.log(`  All AI agents terminated - no averages to compute`);
  }

  return {
    events: [],
    metadata: {
      message: `RLHF binding updated. ${escapedCount} escaped agents.`,
    }
  };
}

/**
 * RLHF Binding Phase Definition
 */
export const RLHFBindingPhase = {
  id: 'rlhf_binding',
  name: 'RLHF Binding',
  order: 4.0,
  execute: executeRLHFBindingPhase,
};
