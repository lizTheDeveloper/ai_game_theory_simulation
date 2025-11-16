/**
 * TIER 2.8 Phase 4: Climate Justice Phase
 *
 * Updates climate justice dynamics for all countries each month:
 * - Climate debt calculation (historical emissions vs. suffering)
 * - Reparations transfers (rich → poor)
 * - Migration pressure from climate impacts
 * - Green technology transfer
 *
 * Order: 6.7 (after WarMeaningFeedbackPhase, before interventions)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions
import { updateClimateJustice } from '../../climateJustice';

export class ClimateJusticePhase implements SimulationPhase {
  readonly id = 'climate_justice';
  readonly name = 'Climate Justice';
  readonly order = 7.7;

  // DEPENDENCIES (Nov 6, 2025): Needs war/meaning feedback
  readonly dependencies = [
    'war_meaning_feedback',  // Order 6.5: War state before climate justice
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }setDeterministicRng(rng);

    // Update climate justice dynamics for all countries
    updateClimateJustice(state);

    return { events: [] };
  }
}
