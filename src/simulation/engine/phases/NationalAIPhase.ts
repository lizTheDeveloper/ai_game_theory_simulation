/**
 * National AI Phase
 *
 * Updates national AI development & race dynamics
 * Order: 15.0 (after diplomatic AI)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { updateNationalAI } from '../../nationalAI/index';

export class NationalAIPhase implements SimulationPhase {
  readonly id = 'national-ai';
  readonly name = 'National AI Update';
  readonly order = 15.00; // National AI development - first

  // DEPENDENCIES (Nov 15, 2025): Requires AI agents for national AI race dynamics
  readonly dependencies = [
    'ai-agent-actions',       // Order 7.0: AI agent capabilities affect national AI development
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }setDeterministicRng(rng);
    updateNationalAI(state);

    return { events: [] };
  }
}
