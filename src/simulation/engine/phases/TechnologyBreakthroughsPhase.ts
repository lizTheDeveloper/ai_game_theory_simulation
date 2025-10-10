/**
 * TechnologyBreakthroughsPhase (0.5)
 *
 * Detects AI capability breakthroughs after AI research actions.
 * Updates frontier capabilities and generates breakthrough events.
 *
 * **EXECUTION ORDER:** 0.5 (After AI actions, before government)
 * **DEPENDENCIES:** Requires AI agents with updated capabilities
 * **SIDE EFFECTS:**
 * - Updates state.frontierCapabilities
 * - Generates breakthrough events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class TechnologyBreakthroughsPhase implements SimulationPhase {
  readonly id = 'technology-breakthroughs';
  readonly name = 'Technology Breakthroughs Detection';
  readonly order = 8.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute technology breakthrough detection
    const { updateFrontierCapabilities } = require('../../technologyDiffusion');

    const events: GameEvent[] = [];

    // Check all active AIs for breakthroughs
    const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');

    for (const ai of activeAIs) {
      const breakthroughEvents = updateFrontierCapabilities(state, ai);
      events.push(...breakthroughEvents);
    }

    return { events };
  }
}
