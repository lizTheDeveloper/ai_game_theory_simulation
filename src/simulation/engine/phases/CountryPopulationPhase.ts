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
    // Country population updates run once per simulation step (once per month)
    // Each engine.step() represents one month advancing
    updateCountryPopulations(state);
    return { events: [] };
  }
}

