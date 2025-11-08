/**
 * Diplomatic AI Phase
 *
 * Updates AI-mediated diplomacy & conflict prevention
 * Order: 14.0 (after conflict resolution)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class DiplomaticAIPhase implements SimulationPhase {
  readonly id = 'diplomatic-ai';
  readonly name = 'Diplomatic AI Update';
  readonly order = 14.0;
  dependencies = ['ai-agent-actions'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateDiplomaticAI } = require('../../diplomaticAI');
    setDeterministicRng(rng);
    updateDiplomaticAI(state);

    return { events: [] };
  }
}
