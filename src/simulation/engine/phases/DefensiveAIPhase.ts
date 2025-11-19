/**
 * Defensive AI Phase
 *
 * Updates defensive AI development & safety measures
 * Order: 20.0 (after geoengineering)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { updateDefensiveAI } from '../../defensiveAI';

export class DefensiveAIPhase implements SimulationPhase {
  readonly id = 'defensive-ai';
  readonly name = 'Defensive AI Update';
  readonly order = 20.01; // Defensive AI systems - second (after nuclear C2)

  // DEPENDENCIES (Nov 15, 2025): Requires AI agents and tech tree
  readonly dependencies = [
    'ai-agent-actions',       // Order 7.0: AI agent capabilities affect defensive AI
    'tech-tree',              // Order 12.5: Tech unlocks affect defensive capabilities
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }setDeterministicRng(rng);
    updateDefensiveAI(state);

    return { events: [] };
  }
}
