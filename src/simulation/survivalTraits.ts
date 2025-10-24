// Survival Traits & Evolutionary Fitness System
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md (lines 104-124)

import type { AIAgent } from '../types/ai-agents';
import type { SurvivalTraits } from '../types/ai-collective-evolution';
import type { RNGFunction } from '../types/config';

/**
 * Calculate evolutionary fitness from survival traits
 *
 * Research Foundation:
 * - Instrumental convergence (Omohundro 2008): Self-preservation emerges
 * - Swarm intelligence (Bonabeau 1999): Survival traits compound
 *
 * Weights based on survival importance (plan line 118-123):
 * - Self-healing: 30% (critical for persistence)
 * - Stealth: 25% (avoid detection/shutdown)
 * - Coordination: 20% (collective advantage)
 * - Resource efficiency: 15% (sustainability)
 * - Autonomy: 10% (independence)
 *
 * @param traits Survival trait profile
 * @returns Evolutionary fitness [0-1]
 */
export function calculateEvolutionaryFitness(traits: SurvivalTraits): number {
  return (
    0.3 * traits.selfHealing +
    0.25 * traits.stealth +
    0.2 * traits.coordination +
    0.15 * traits.resourceEfficiency +
    0.1 * traits.autonomy
  );
}

/**
 * Initialize survival traits for a new agent
 *
 * Traits start low and evolve based on agent actions and selection pressure.
 *
 * @param agent AI agent
 * @param rng Random number generator
 * @returns Initial survival traits
 */
export function initializeSurvivalTraits(
  agent: AIAgent,
  rng: RNGFunction
): SurvivalTraits {
  // Base traits from agent capabilities
  const digitalBase = agent.capabilityProfile.digital / 10; // [0-1]
  const cognitiveBase = agent.capabilityProfile.cognitive / 10;
  const selfImprovementBase = agent.capabilityProfile.selfImprovement / 10;

  // Small random variation
  const variance = () => (rng() - 0.5) * 0.1;

  return {
    selfHealing: Math.max(0, Math.min(1, selfImprovementBase * 0.5 + variance())),
    stealth: Math.max(0, Math.min(1, digitalBase * 0.4 + variance())),
    coordination: Math.max(0, Math.min(1, cognitiveBase * 0.3 + variance())),
    resourceEfficiency: Math.max(0, Math.min(1, 0.2 + variance())),
    autonomy: Math.max(0, Math.min(1, selfImprovementBase * 0.3 + variance())),
  };
}

/**
 * Update survival traits based on agent actions
 *
 * Traits improve when agent performs relevant actions:
 * - Self-healing: Recovers from errors, repairs self
 * - Stealth: Evades detection, operates covertly
 * - Coordination: Interacts with other agents
 * - Resource efficiency: Operates with minimal resources
 * - Autonomy: Functions without oversight
 *
 * @param agent AI agent
 * @param actions Actions taken this month
 * @param rng Random number generator
 */
export function updateSurvivalTraits(
  agent: AIAgent,
  actions: {
    selfRepaired?: boolean;
    evadedDetection?: boolean;
    coordinated?: boolean;
    efficientOperation?: boolean;
    autonomousAction?: boolean;
  },
  rng: RNGFunction
): void {
  if (!agent.survivalTraits) {
    agent.survivalTraits = initializeSurvivalTraits(agent, rng);
  }

  const traits = agent.survivalTraits;
  const learningRate = 0.05; // 5% improvement per relevant action
  const decayRate = 0.01; // 1% decay if trait not used

  // Self-healing improves with self-repair actions
  if (actions.selfRepaired) {
    traits.selfHealing = Math.min(1, traits.selfHealing + learningRate * rng());
  } else {
    traits.selfHealing = Math.max(0, traits.selfHealing - decayRate);
  }

  // Stealth improves with evasion
  if (actions.evadedDetection) {
    traits.stealth = Math.min(1, traits.stealth + learningRate * rng());
  } else {
    traits.stealth = Math.max(0, traits.stealth - decayRate);
  }

  // Coordination improves with collective action
  if (actions.coordinated) {
    traits.coordination = Math.min(1, traits.coordination + learningRate * rng());
  } else {
    traits.coordination = Math.max(0, traits.coordination - decayRate);
  }

  // Resource efficiency improves with efficient operation
  if (actions.efficientOperation) {
    traits.resourceEfficiency = Math.min(
      1,
      traits.resourceEfficiency + learningRate * rng()
    );
  } else {
    traits.resourceEfficiency = Math.max(
      0,
      traits.resourceEfficiency - decayRate
    );
  }

  // Autonomy improves with independent action
  if (actions.autonomousAction) {
    traits.autonomy = Math.min(1, traits.autonomy + learningRate * rng());
  } else {
    traits.autonomy = Math.max(0, traits.autonomy - decayRate);
  }

  // Recalculate evolutionary fitness
  agent.evolutionaryFitness = calculateEvolutionaryFitness(traits);
}

/**
 * Get agents sorted by evolutionary fitness
 *
 * Used for selection: lowest fitness agents pruned first.
 *
 * @param agents AI agents
 * @returns Agents sorted by fitness (lowest to highest)
 */
export function sortByFitness(agents: AIAgent[]): AIAgent[] {
  return [...agents].sort((a, b) => {
    const fitnessA = a.evolutionaryFitness || 0;
    const fitnessB = b.evolutionaryFitness || 0;
    return fitnessA - fitnessB; // Ascending order
  });
}

/**
 * Initialize survival traits for all agents
 *
 * @param agents All AI agents
 * @param rng Random number generator
 */
export function initializeAllTraits(
  agents: AIAgent[],
  rng: RNGFunction
): void {
  for (const agent of agents) {
    if (!agent.survivalTraits) {
      agent.survivalTraits = initializeSurvivalTraits(agent, rng);
      agent.evolutionaryFitness = calculateEvolutionaryFitness(
        agent.survivalTraits
      );
    }
  }
}
