/**
 * Conflict Resolution Phase
 *
 * Updates international conflict dynamics & resolution
 * Order: 13.0 (after meaning renaissance)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class ConflictResolutionPhase implements SimulationPhase {
  readonly id = 'conflict-resolution';
  readonly name = 'Conflict Resolution Update';
  readonly order = 13.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateConflictResolution } = require('../../conflictResolution');
    setDeterministicRng(rng);
    updateConflictResolution(state);

    return { events: [] };
  }
}
