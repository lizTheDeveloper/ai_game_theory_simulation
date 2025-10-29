/**
 * Social Stability Phase
 *
 * Calculates and updates social stability
 * Order: 33.0 (after paranoia update)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateSocialStability } from '../../calculations';
import { assertFinite } from '../../utils/assertions';

export class SocialStabilityPhase implements SimulationPhase {
  readonly id = 'social-stability';
  readonly name = 'Social Stability Calculation';
  readonly order = 33.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const newStability = assertFinite(
      calculateSocialStability(state),
      {
        location: 'SocialStabilityPhase.execute',
        valueName: 'newStability',
        month: state.currentMonth,
        additionalInfo: {
          currentStability: state.globalMetrics.socialStability,
          unemploymentLevel: state.society.unemploymentLevel,
          trustInAI: state.society.trustInAI
        }
      }
    );

    state.globalMetrics = {
      ...state.globalMetrics,
      socialStability: newStability
    };

    return { events: [] };
  }
}
