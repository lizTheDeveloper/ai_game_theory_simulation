/**
 * Meaning Renaissance Phase
 *
 * Cultural flourishing & purpose discovery (Phase 2E)
 * Order: 12.7 (after cooperative-systems) - Batch 5: moved from 12.0 due to dependency
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { updateMeaningRenaissance } from '../../meaningRenaissance';

export class MeaningRenaissancePhase implements SimulationPhase {
  readonly id = 'meaning-renaissance';
  readonly name = 'Meaning Renaissance Update';
  readonly order = 12.7;  // Batch 5: moved from 12.0 due to cooperative-systems (12.6) dependency
  readonly dependencies = ['cooperative-systems'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }setDeterministicRng(rng);
    updateMeaningRenaissance(state);

    return { events: [] };
  }
}
