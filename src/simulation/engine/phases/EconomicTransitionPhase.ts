/**
 * Economic Transition Phase
 *
 * Updates economic transition stage and wealth distribution
 * Order: 31.0 (after unemployment)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateEconomicTransitionProgress } from '../../economics';

export class EconomicTransitionPhase implements SimulationPhase {
  readonly id = 'economic-transition';
  readonly name = 'Economic Transition';
  readonly order = 31.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const economicProgress = calculateEconomicTransitionProgress(state);

    state.globalMetrics = {
      ...state.globalMetrics,
      economicTransitionStage: Math.max(
        state.globalMetrics.economicTransitionStage,
        state.globalMetrics.economicTransitionStage + economicProgress.stageChange
      ),
      wealthDistribution: Math.max(0.1, Math.min(1.0,
        state.globalMetrics.wealthDistribution + economicProgress.wealthDistributionChange
      ))
    };

    return { events: [] };
  }
}
