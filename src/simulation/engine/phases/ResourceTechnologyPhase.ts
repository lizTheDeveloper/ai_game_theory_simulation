/**
 * Resource Technology Phase
 *
 * Updates resource extraction & technology efficiency
 * Order: 18.0 (after resource economy)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class ResourceTechnologyPhase implements SimulationPhase {
  readonly id = 'resource-technology';
  readonly name = 'Resource Technology Update';
  readonly order = 18.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateResourceTechnology } = require('../../resourceTechnology');
    updateResourceTechnology(state);

    return { events: [] };
  }
}
