/**
 * Paranoia & Trust Phase
 *
 * Updates paranoia decay and trust recovery
 * Order: 32.0 (after economic updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateParanoia } from '../../calculations';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class ParanoiaPhase implements SimulationPhase {
  readonly id = 'paranoia';
  readonly name = 'Paranoia & Trust Update';
  readonly order = 32.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Paranoia decays, trust recovers, harmful events refresh paranoia
    setDeterministicRng(rng);
    // Trust is now calculated inside updateParanoia as inverse of paranoia
    updateParanoia(state);

    return { events: [] };
  }
}
