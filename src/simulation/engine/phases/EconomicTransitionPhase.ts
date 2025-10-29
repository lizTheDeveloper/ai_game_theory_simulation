/**
 * Economic Transition Phase
 *
 * Updates economic transition stage and wealth distribution
 * Order: 31.0 (after unemployment)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateEconomicTransitionProgress } from '../../economics';
import { assertFinite } from '../../utils/assertions';

export class EconomicTransitionPhase implements SimulationPhase {
  readonly id = 'economic-transition';
  readonly name = 'Economic Transition';
  readonly order = 31.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const economicProgress = calculateEconomicTransitionProgress(state);

    // FIX (Oct 28, 2025): Use assertFinite to validate inputs and outputs
    const validatedChange = assertFinite(economicProgress.wealthDistributionChange, {
      location: 'EconomicTransitionPhase (wealthDistributionChange)',
      valueName: 'wealthDistributionChange',
      month: state.currentMonth
    });

    const currentWealth = assertFinite(state.globalMetrics.wealthDistribution, {
      location: 'EconomicTransitionPhase (current wealthDistribution)',
      valueName: 'wealthDistribution',
      month: state.currentMonth
    });

    // FIX #22 (Oct 22, 2025): Allow economicTransitionStage to decrease during crises
    // Bug: Math.max(old, old + change) creates a ratchet that prevents any decrease
    // - This made GDP appear to increase monotonically even during nuclear wars
    // - GDP = population × QoL × (1 + stage × 0.2), so stage 4 adds 80% multiplier
    // - During 90% mortality, this made GDP appear ~80% higher than it should be
    // Fix: Allow bidirectional changes while keeping bounds [0, 4]
    const newWealthDist = assertFinite(
      Math.max(0.1, Math.min(1.0, currentWealth + validatedChange)),
      {
        location: 'EconomicTransitionPhase (new wealthDistribution)',
        valueName: 'newWealthDistribution',
        month: state.currentMonth,
        additionalInfo: {
          currentWealth,
          change: validatedChange,
          sum: currentWealth + validatedChange
        }
      }
    );

    state.globalMetrics = {
      ...state.globalMetrics,
      economicTransitionStage: Math.max(0, Math.min(4,
        state.globalMetrics.economicTransitionStage + economicProgress.stageChange
      )),
      wealthDistribution: newWealthDist
    };

    return { events: [] };
  }
}
