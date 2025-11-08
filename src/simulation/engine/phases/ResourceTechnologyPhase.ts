/**
 * Resource Technology Phase
 *
 * Updates resource extraction & technology efficiency
 * Order: 18.0 (after resource economy)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions

export class ResourceTechnologyPhase implements SimulationPhase {
  readonly id = 'resource-technology';
  readonly name = 'Resource Technology Update';
  readonly order = 18.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { applyTechnologyToResources, applyIndustryOppositionToTech } = require('../../resourceTechnology');
    setDeterministicRng(rng);
    applyTechnologyToResources(state);
    applyIndustryOppositionToTech(state);

    return { events: [] };
  }
}
