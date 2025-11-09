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
  dependencies = ['ai-agent-actions'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { applyTechnologyToResources, applyIndustryOppositionToTech } = require('../../resourceTechnology');
    setDeterministicRng(rng);
    applyTechnologyToResources(state);
    applyIndustryOppositionToTech(state);

    return { events: [] };
  }
}
