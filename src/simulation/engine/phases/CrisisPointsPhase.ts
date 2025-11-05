/**
 * Crisis Points Phase
 *
 * Checks for critical decision moments and crisis triggers
 * Order: 23.0 (after benchmark evaluations)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class CrisisPointsPhase implements SimulationPhase {
  readonly id = 'crisis-points';
  readonly name = 'Crisis Points Check';
  readonly order = 23.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { processCrisisPoints } = require('../../crisisPoints');
    setDeterministicRng(rng);
    const crisisResult = processCrisisPoints(state, rng);

    // If crisis triggered, update state
    if (crisisResult.crisisTriggered) {
      Object.assign(state, crisisResult.newState);
    }

    return { events: crisisResult.events || [] };
  }
}
