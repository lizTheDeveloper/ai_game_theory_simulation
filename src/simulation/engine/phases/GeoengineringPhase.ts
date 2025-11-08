/**
 * Geoengineering Phase
 *
 * Updates climate intervention & environmental restoration
 * Order: 19.0 (after resource technology)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions

export class GeoengineringPhase implements SimulationPhase {
  readonly id = 'geoengineering';
  readonly name = 'Geoengineering Update';
  readonly order = 19.0;
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateGeoengineering } = require('../../geoengineering');
    setDeterministicRng(rng);
    updateGeoengineering(state);

    return { events: [] };
  }
}
