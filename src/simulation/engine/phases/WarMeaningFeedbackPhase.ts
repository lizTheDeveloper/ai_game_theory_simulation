/**
 * TIER 2.8 Phase 3: War-Meaning Feedback Phase
 *
 * Updates war-meaning feedback loop for all countries each month:
 * - Meaning crisis → Nationalism → War motivation
 * - Parental fulfillment (alternative purpose)
 * - Moral injury (negative feedback from wars)
 *
 * Order: 6.5 (after CountryPopulationPhase, before interventions)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class WarMeaningFeedbackPhase implements SimulationPhase {
  readonly id = 'war_meaning_feedback';
  readonly name = 'War-Meaning Feedback';
  readonly order = 6.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateWarMeaningFeedback } = require('../../warMeaningFeedback');
    setDeterministicRng(rng);

    // Update war-meaning feedback for all countries
    updateWarMeaningFeedback(state);

    return { events: [] };
  }
}
