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

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class RefugeeCrisisPhase implements SimulationPhase {
  readonly id = 'refugee_crisis';
  readonly name = 'Refugee Crisis System';
  readonly order = 20.6;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateRefugeeCrises } = require('../../refugeeCrises');

    // Update all refugee crises (triggers new ones, updates existing)
    updateRefugeeCrises(state);

    return { events: [] };
  }
}
