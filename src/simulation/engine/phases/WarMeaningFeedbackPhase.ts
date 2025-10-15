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

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class WarMeaningFeedbackPhase implements SimulationPhase {
  readonly id = 'war_meaning_feedback';
  readonly name = 'War-Meaning Feedback';
  readonly order = 6.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateWarMeaningFeedback } = require('../../warMeaningFeedback');

    // Update war-meaning feedback for all countries
    updateWarMeaningFeedback(state);

    return { events: [] };
  }
}
