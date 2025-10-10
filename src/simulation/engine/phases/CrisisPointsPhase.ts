/**
 * Crisis Points Phase
 *
 * Checks for critical decision moments and crisis triggers
 * Order: 23.0 (after benchmark evaluations)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class CrisisPointsPhase implements SimulationPhase {
  readonly id = 'crisis-points';
  readonly name = 'Crisis Points Check';
  readonly order = 23.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { processCrisisPoints } = require('../../crisisPoints');
    const crisisResult = processCrisisPoints(state, rng);

    // If crisis triggered, update state
    if (crisisResult.crisisTriggered) {
      Object.assign(state, crisisResult.newState);
    }

    return { events: crisisResult.events || [] };
  }
}
