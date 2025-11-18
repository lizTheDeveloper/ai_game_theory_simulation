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
    // All fields must be defined - missing probabilities indicate calculation bugs
    const utopiaProbability = assertDefined(outcomeProbs.utopiaProbability, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'outcomeProbs.utopiaProbability',
      month: state.currentMonth,
      expectedSource: 'calculateOutcomeProbabilities',
    });
    assertProbability(utopiaProbability, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'utopiaProbability',
      month: state.currentMonth,
    });

    const dystopiaProbability = assertDefined(outcomeProbs.dystopiaProbability, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'outcomeProbs.dystopiaProbability',
      month: state.currentMonth,
      expectedSource: 'calculateOutcomeProbabilities',
    });
    assertProbability(dystopiaProbability, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'dystopiaProbability',
      month: state.currentMonth,
    });

    const extinctionProbability = assertDefined(outcomeProbs.extinctionProbability, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'outcomeProbs.extinctionProbability',
      month: state.currentMonth,
      expectedSource: 'calculateOutcomeProbabilities',
    });
    assertProbability(extinctionProbability, {
      location: 'OutcomeProbabilitiesPhase.execute',
      valueName: 'extinctionProbability',
      month: state.currentMonth,
    });

    // Validate probabilities sum to approximately 1.0 (within tolerance)

    const totalProb = utopiaProbability + dystopiaProbability + extinctionProbability;

    // Probabilities must sum to 1.0 within tight tolerance - deviation indicates calculation bug
    if (Math.abs(totalProb - 1.0) > 0.01) {
      throw new Error(
        `❌ Outcome probabilities do not sum to 1.0 in OutcomeProbabilitiesPhase.execute\n` +
        `   Total: ${totalProb.toFixed(3)}\n` +
        `   Utopia: ${utopiaProbability.toFixed(3)}\n` +
        `   Dystopia: ${dystopiaProbability.toFixed(3)}\n` +
        `   Extinction: ${extinctionProbability.toFixed(3)}\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   Outcome probabilities must sum to 1.0 (mutually exclusive, collectively exhaustive).\n` +
        `   Deviation >0.01 indicates a bug in calculateOutcomeProbabilities.\n` +
        `   Fix: Check probability calculation and normalization logic.`
        `   Month: ${state.currentMonth}`
      );
    }

    state.outcomeMetrics = outcomeProbs;

    return { events: [] };
  }
}
