/**
 * Outcome Probabilities Phase
 *
 * Calculates outcome probabilities (utopia, dystopia, extinction)
 * Order: 35.0 (after QoL calculation)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateOutcomeProbabilities } from '../../calculations';

export class OutcomeProbabilitiesPhase implements SimulationPhase {
  readonly id = 'outcome-probabilities';
  readonly name = 'Outcome Probabilities Calculation';
  readonly order = 35.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const outcomeProbs = calculateOutcomeProbabilities(state);
    state.outcomeMetrics = outcomeProbs;

    return { events: [] };
  }
}
