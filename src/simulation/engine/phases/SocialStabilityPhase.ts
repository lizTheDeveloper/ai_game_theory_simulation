/**
 * Social Stability Phase
 *
 * Calculates and updates social stability
 * Order: 33.0 (after paranoia update)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateSocialStability } from '../../calculations';

export class SocialStabilityPhase implements SimulationPhase {
  readonly id = 'social-stability';
  readonly name = 'Social Stability Calculation';
  readonly order = 33.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const newStability = calculateSocialStability(state);

    state.globalMetrics = {
      ...state.globalMetrics,
      socialStability: newStability
    };

    return { events: [] };
  }
}
