/**
 * Unemployment Calculation Phase
 *
 * Updates unemployment based on AI capability
 * Order: 30.0 (after all AI/economic updates)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateUnemployment } from '../../calculations';

export class UnemploymentPhase implements SimulationPhase {
  readonly id = 'unemployment';
  readonly name = 'Unemployment Calculation';
  readonly order = 30.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const newUnemployment = calculateUnemployment(state);

    state.society = {
      ...state.society,
      unemploymentLevel: newUnemployment
    };

    return { events: [] };
  }
}
