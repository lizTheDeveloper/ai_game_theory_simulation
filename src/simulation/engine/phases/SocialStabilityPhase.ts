/**
 * Social Stability Phase
 *
 * Calculates and updates social stability
 * Order: 33.0 (after paranoia update)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateSocialStability } from '../../calculations';
import { assertFinite } from '../../utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class SocialStabilityPhase implements SimulationPhase {
  readonly id = 'social-stability';
  readonly name = 'Social Stability Calculation';
  readonly order = 33.0;

  // DEPENDENCIES (Nov 6, 2025): Requires economic and social state
  readonly dependencies = [
    'unemployment',              // Order 30.0: Unemployment drives instability
    'economic-transition',       // Order 31.0: Wealth inequality affects stability
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    setDeterministicRng(rng);
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
