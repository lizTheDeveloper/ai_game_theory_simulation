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
    'social-stability-system', // Order 26.1: Social state (Batch 5: consolidated from social-stability)
    'climate_system',          // Order 34.0: Environmental state (Batch 3: consolidated from environmental_feedback)
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    setDeterministicRng(rng);
    const outcomeProbs = calculateOutcomeProbabilities(state);

    // Validate outcomeProbs exists
    assertDefined(outcomeProbs, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'outcomeProbs',
      month: state.currentMonth,
    });

    // Validate all outcome probabilities are valid [0, 1] ranges
    // NOTE: These ARE probabilities (unlike QoL which is a wellbeing score)
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
      assertProbability(outcomeProbs.utopiaProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'utopiaProbability',
        month: state.currentMonth
      }) +
      assertProbability(outcomeProbs.dystopiaProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'dystopiaProbability',
        month: state.currentMonth
      }) +
      assertProbability(outcomeProbs.extinctionProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'extinctionProbability',
        month: state.currentMonth
      });

    if (Math.abs(totalProb - 1.0) > 0.01) {
      console.warn(
        `⚠️ Outcome probabilities do not sum to 1.0\n` +
        `   Total: ${totalProb.toFixed(3)}\n` +
        // Display only - already validated above with assertions
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
