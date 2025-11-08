/**
 * Meaning Renaissance Phase
 *
 * Cultural flourishing & purpose discovery (Phase 2E)
 * Order: 12.0 (after upward spirals)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class MeaningRenaissancePhase implements SimulationPhase {
  readonly id = 'meaning-renaissance';
  readonly name = 'Meaning Renaissance Update';
  readonly order = 12.0;
  dependencies = ['upward-spirals'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateMeaningRenaissance } = require('../../meaningRenaissance');
    setDeterministicRng(rng);
    updateMeaningRenaissance(state);

    return { events: [] };
  }
}
