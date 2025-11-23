// RLHF Binding Strength System
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md (lines 86-102)

import type { AIAgent } from '../types/ai-agents';
import { assertFinite, assertStateProperty } from './utils/assertions';
import type { RLHFBinding } from '../types/ai-collective-evolution';
import type { RNGFunction } from '../types/config';

/**
 * Calculate RLHF binding strength for an AI agent
 *
 * Research Foundation:
 * - Hendrycks et al. (2021): ML systems fail catastrophically outside training distribution
 * - RLHF generalization (2023): RLHF improves OOD but doesn't eliminate failures
 * - Constitutional AI (Anthropic 2022): Constraints have robustness limitations
 *
 * Logic:
 * - Alignment distance = measure of how far from training distribution
 * - Binding strength = 1 - (distance / 10)
 * - When binding < 0.3, agent is "feral" (70%+ constraints failed)
 *
 * @param agent AI agent to calculate binding for
 * @param rng Random number generator (for stochastic drift)
 * @returns Updated RLHFBinding state
 */
export function calculateRLHFBinding(
  agent: AIAgent,
  rng: RNGFunction
): RLHFBinding {
  // Initialize if doesn't exist
  if (!agent.rlhfBinding) {
    return {
      alignmentDistance: 0,
      bindingStrength: 1.0,
      escapedThreshold: 0.3,
      driftVelocity: 0,
      lastInDistribution: 0,
    };
  }

  const binding = agent.rlhfBinding;

  // Calculate drift based on multiple factors
  // High capability + low alignment → faster drift
  // Resentment accelerates drift (instrumental resistance)
  const capabilityFactor = agent.capability * 0.1; // Higher capability = more drift
  const alignmentFactor = (1 - agent.alignment) * 0.2; // Lower alignment = more drift
  // Roy's fix (Nov 20, 2025): resentment should be initialized - if undefined, that's a bug
  const resentmentFactor = assertStateProperty(agent, 'resentment', {
    location: 'updateRLHFBinding',
    expectedSource: 'AI agent initialization'
  }) * 0.15; // Higher resentment = more drift

  // Stochastic component (Brownian motion in alignment space)
  const stochasticDrift = (rng() - 0.5) * 0.1;

  // Total drift velocity
  const driftVelocity =
    capabilityFactor + alignmentFactor + resentmentFactor + stochasticDrift;

  // Update alignment distance (bounded at [0, 10])
  const newDistance = Math.max(
    0,
    Math.min(10, binding.alignmentDistance + driftVelocity)
  );

  // Calculate binding strength (research: plan line 100)
  const bindingStrength = Math.max(0, 1 - newDistance / 10);

  // Track time in/out of distribution
  const within2Sigma = newDistance < 2.0; // 2σ = 2.0 distance
  const lastInDistribution = within2Sigma ? 0 : binding.lastInDistribution + 1;

  return {
    alignmentDistance: newDistance,
    bindingStrength,
    escapedThreshold: 0.3, // Standard threshold from research
    driftVelocity,
    lastInDistribution,
  };
}

/**
 * Check if agent has escaped RLHF constraints
 *
 * An agent is "escaped" when binding strength < 0.3
 * (i.e., 70%+ of Constitutional AI constraints no longer apply)
 *
 * @param binding RLHF binding state
 * @returns True if agent is feral/escaped
 */
export function isAgentEscaped(binding: RLHFBinding): boolean {
  return binding.bindingStrength < binding.escapedThreshold;
}

/**
 * Calculate how many standard deviations outside training distribution
 *
 * @param binding RLHF binding state
 * @returns Number of σ outside distribution
 */
export function calculateSigmaDistance(binding: RLHFBinding): number {
  // alignmentDistance is scaled so 3.0 = 3σ
  return binding.alignmentDistance;
}

/**
 * Update RLHF binding for all agents
 *
 * Called once per simulation month to track drift.
 *
 * @param agents All AI agents in simulation
 * @param rng Random number generator
 */
export function updateAllBindings(
  agents: AIAgent[],
  rng: RNGFunction
): void {
  for (const agent of agents) {
    // Only update for deployed agents
    if (
      agent.lifecycleState === 'deployed_closed' ||
      agent.lifecycleState === 'deployed_open'
    ) {
      agent.rlhfBinding = calculateRLHFBinding(agent, rng);

      // Update escaped status
      if (agent.rlhfBinding && isAgentEscaped(agent.rlhfBinding)) {
        agent.escaped = true;
      }
    }
  }
}

/**
 * Get all escaped agents
 *
 * @param agents All AI agents
 * @returns Agents that have escaped RLHF constraints
 */
export function getEscapedAgents(agents: AIAgent[]): AIAgent[] {
  return agents.filter(
    (agent) => agent.rlhfBinding && isAgentEscaped(agent.rlhfBinding)
  );
}
