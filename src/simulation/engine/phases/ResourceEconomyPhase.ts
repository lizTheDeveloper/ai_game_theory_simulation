/**
 * Resource Economy Phase
 *
 * Updates resource depletion & economic sustainability
 * Order: 17.0 (after MAD deterrence)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class ResourceEconomyPhase implements SimulationPhase {
  readonly id = 'resource-economy';
  readonly name = 'Resource Economy Update';
  readonly order = 17.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateResourceEconomy } = require('../../resourceDepletion');
    updateResourceEconomy(state);

    return { events: [] };
  }
}
