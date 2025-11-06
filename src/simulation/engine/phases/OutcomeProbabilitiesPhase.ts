/**
 * Outcome Probabilities Phase
 *
 * Calculates outcome probabilities (utopia, dystopia, extinction)
 * Order: 35.0 (after QoL calculation)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateOutcomeProbabilities } from '../../calculations';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class OutcomeProbabilitiesPhase implements SimulationPhase {
  readonly id = 'outcome-probabilities';
  readonly name = 'Outcome Probabilities Calculation';
  readonly order = 35.0;

  // DEPENDENCIES (Nov 6, 2025): Must run after all systems update
  readonly dependencies = [
    'quality-of-life',         // Order 19.5: QoL baseline
    'social-stability',        // Order 33.0: Social state
    'environmental_feedback',  // Order 33.5: Environmental state
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const outcomeProbs = calculateOutcomeProbabilities(state);
    setDeterministicRng(rng);
    state.outcomeMetrics = outcomeProbs;

    return { events: [] };
  }
}
