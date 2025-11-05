/**
 * Resource Economy Phase
 *
 * Updates resource depletion & economic sustainability
 * Order: 17.0 (after MAD deterrence)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class ResourceEconomyPhase implements SimulationPhase {
  readonly id = 'resource-economy';
  readonly name = 'Resource Economy Update';
  readonly order = 17.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateResourceEconomy } = require('../../resourceDepletion');
    setDeterministicRng(rng);
    updateResourceEconomy(state);

    return { events: [] };
  }
}
