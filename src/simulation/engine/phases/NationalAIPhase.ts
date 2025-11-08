/**
 * National AI Phase
 *
 * Updates national AI development & race dynamics
 * Order: 15.0 (after diplomatic AI)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class NationalAIPhase implements SimulationPhase {
  readonly id = 'national-ai';
  readonly name = 'National AI Update';
  readonly order = 15.0;
  dependencies = ['ai-agent-actions'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateNationalAI } = require('../../nationalAI/index');
    setDeterministicRng(rng);
    updateNationalAI(state);

    return { events: [] };
  }
}
