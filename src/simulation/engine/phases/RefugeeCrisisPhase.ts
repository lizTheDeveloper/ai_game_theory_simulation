/**
 * Refugee Crisis Phase (TIER 1.5)
 *
 * Models displaced populations from climate, war, famine, ecosystem collapse
 * - Triggers new refugee crises based on conditions
 * - Updates active crises (resettlement, tension, economic strain)
 * - Generational resettlement (25 years = 300 months)
 * - Social and political impacts
 *
 * Order: 20.6 (after population dynamics)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions';
import { updateRefugeeCrises } from '../../refugeeCrises';

export class RefugeeCrisisPhase implements SimulationPhase {
  readonly id = 'refugee_crisis';
  readonly name = 'Refugee Crisis System';
  readonly order = 20.6;

  // DEPENDENCIES (Nov 6, 2025): Requires population state for displacement calculations
  readonly dependencies = [
    'human_population',          // Order 20.5: Population baseline for displacement
    'wet_bulb_temperature',      // Order 20.45: Heat events trigger displacement
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {setDeterministicRng(rng);

    // Update all refugee crises (triggers new ones, updates existing)
    updateRefugeeCrises(state);

    // ASSERTION (Nov 7, 2025): Validate refugee crisis didn't corrupt population
    assertFinite(state.humanPopulationSystem.population, {
      location: 'RefugeeCrisisPhase.execute',
      valueName: 'population after refugee crisis update',
      month: state.currentMonth
    });

    return { events: [] };
  }
}
