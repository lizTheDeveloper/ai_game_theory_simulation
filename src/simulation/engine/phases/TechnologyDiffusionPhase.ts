/**
 * TechnologyDiffusionPhase (39.0)
 *
 * Handles the gradual spread of breakthrough technologies across society.
 * Technologies deployed by agents diffuse to general availability over time.
 *
 * **EXECUTION ORDER:** 39.0 (After extinction scenarios, before catastrophic checks)
 * **DEPENDENCIES:** Requires technology state
 * **SIDE EFFECTS:**
 * - Updates technology diffusion levels
 * - Modifies breakthrough technology availability
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertAICapability, assertAIAggregateCapability } from '@/simulation/utils/assertions';
import { diffuseCapabilities } from '../../technologyDiffusion';

export class TechnologyDiffusionPhase implements SimulationPhase {
  readonly id = 'technology-diffusion';
  readonly name = 'Technology Diffusion';
  readonly order = 39.0;

  // DEPENDENCIES (Nov 6, 2025): Must run after tech tree and extinction progress
  readonly dependencies = [
    'tech-tree',           // Order 12.5: Technology breakthroughs
    'extinction-system',   // Order 37.0: Extinction state before diffusion (Batch 4, Nov 2025: consolidated from extinction-progress)
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute technology diffusion
    setDeterministicRng(rng);diffuseCapabilities(state, rng);

    // Validate AI agent capabilities after diffusion
    for (const agent of state.aiAgents || []) {
      assertAIAggregateCapability(agent.capability, {
        location: 'TechnologyDiffusionPhase.execute',
        valueName: `agent[${agent.id}].capability`,
        agentId: agent.id
      });
    }

    return { events: [] };
  }
}
