/**
 * Country Population Phase
 * Updates per-country population tracking
 */

import { GameState } from '../../../types/game';
import { updateCountryPopulations } from '../../countryPopulations';

export class CountryPopulationPhase {
  name = 'CountryPopulation';
  order = 250; // After population dynamics (200)

  async execute(state: GameState): Promise<void> {
    updateCountryPopulations(state);
  }
}

