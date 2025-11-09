/**
 * Resource Economy Phase
 *
 * Updates resource depletion & economic sustainability
 * Order: 17.0 (after MAD deterrence)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions

export class ResourceEconomyPhase implements SimulationPhase {
  readonly id = 'resource-economy';
  readonly name = 'Resource Economy Update';
  readonly order = 17.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateResourceEconomy } = require('../../resourceDepletion');
    setDeterministicRng(rng);
    updateResourceEconomy(state);

    return { events: [] };
  }
}
