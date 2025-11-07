/**
 * Outcome Probabilities Phase
 *
 * Calculates outcome probabilities (utopia, dystopia, extinction)
 * Order: 35.0 (after QoL calculation)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateOutcomeProbabilities } from '../../calculations';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability, assertDefined } from '@/simulation/utils/assertions';

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

    // Validate outcomeProbs exists
    assertDefined(outcomeProbs, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'outcomeProbs',
      month: state.currentMonth,
    });

    // Validate all outcome probabilities are valid [0, 1] ranges
    if (outcomeProbs.utopiaProbability !== undefined) {
      assertProbability(outcomeProbs.utopiaProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'outcomeProbs.utopiaProbability',
        month: state.currentMonth,
      });
    }

    if (outcomeProbs.dystopiaProbability !== undefined) {
      assertProbability(outcomeProbs.dystopiaProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'outcomeProbs.dystopiaProbability',
        month: state.currentMonth,
      });
    }

    if (outcomeProbs.extinctionProbability !== undefined) {
      assertProbability(outcomeProbs.extinctionProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'outcomeProbs.extinctionProbability',
        month: state.currentMonth,
      });
    }

    // Validate probabilities sum to approximately 1.0 (within tolerance)
    const totalProb =
      (outcomeProbs.utopiaProbability ?? 0) +
      (outcomeProbs.dystopiaProbability ?? 0) +
      (outcomeProbs.extinctionProbability ?? 0);

    if (Math.abs(totalProb - 1.0) > 0.01) {
      console.warn(
        `⚠️ Outcome probabilities do not sum to 1.0\n` +
        `   Total: ${totalProb.toFixed(3)}\n` +
        `   Utopia: ${(outcomeProbs.utopiaProbability ?? 0).toFixed(3)}\n` +
        `   Dystopia: ${(outcomeProbs.dystopiaProbability ?? 0).toFixed(3)}\n` +
        `   Extinction: ${(outcomeProbs.extinctionProbability ?? 0).toFixed(3)}\n` +
        `   Month: ${state.currentMonth}`
      );
    }

    state.outcomeMetrics = outcomeProbs;

    return { events: [] };
  }
}
