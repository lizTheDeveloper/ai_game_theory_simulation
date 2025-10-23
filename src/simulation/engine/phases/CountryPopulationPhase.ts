/**
 * Country Population Phase
 * Updates per-country population tracking
 */

import { GameState } from '../../../types/game';
import { updateCountryPopulations } from '../../countryPopulations';
import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';

export class CountryPopulationPhase implements SimulationPhase {
  readonly id = 'country_population';
  readonly name = 'CountryPopulation';
  readonly order = 250; // After population dynamics (200)

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // CRITICAL FIX: Only update population at end of month (day 30)
    // Country population tracking follows same monthly update pattern as global population
    // Running 30x per month causes compounding errors in population changes
    if (state.currentDay !== 30) {
      return { events: [] }; // Skip population updates on non-month-end days
    }

    updateCountryPopulations(state);
    return { events: [] };
  }
}

