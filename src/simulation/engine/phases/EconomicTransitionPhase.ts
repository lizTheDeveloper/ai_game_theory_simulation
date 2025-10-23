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

    // FIX #22 (Oct 22, 2025): Allow economicTransitionStage to decrease during crises
    // Bug: Math.max(old, old + change) creates a ratchet that prevents any decrease
    // - This made GDP appear to increase monotonically even during nuclear wars
    // - GDP = population × QoL × (1 + stage × 0.2), so stage 4 adds 80% multiplier
    // - During 90% mortality, this made GDP appear ~80% higher than it should be
    // Fix: Allow bidirectional changes while keeping bounds [0, 4]
    state.globalMetrics = {
      ...state.globalMetrics,
      economicTransitionStage: Math.max(0, Math.min(4,
        state.globalMetrics.economicTransitionStage + economicProgress.stageChange
      )),
      wealthDistribution: Math.max(0.1, Math.min(1.0,
        state.globalMetrics.wealthDistribution + economicProgress.wealthDistributionChange
      ))
    };

    return { events: [] };
  }
}
