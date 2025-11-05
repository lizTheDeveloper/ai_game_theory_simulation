/**
 * Economic Transition Phase
 *
 * Updates economic transition stage and wealth distribution
 * Order: 31.0 (after unemployment)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateEconomicTransitionProgress } from '../../economics';
import { assertFinite } from '../../utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class EconomicTransitionPhase implements SimulationPhase {
  readonly id = 'economic-transition';
  readonly name = 'Economic Transition';
  readonly order = 31.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const economicProgress = calculateEconomicTransitionProgress(state, rng);
    setDeterministicRng(rng);

    // FIX #4 (Oct 29, 2025): Validate stageChange to prevent NaN propagation
    // Bug: If stageChange is NaN, it propagates to economicTransitionStage,
    // which then cascades to all economic calculations → Monte Carlo output shows NaN
    const validatedStageChange = assertFinite(economicProgress.stageChange, {
      location: 'EconomicTransitionPhase (stageChange)',
      valueName: 'stageChange',
      month: state.currentMonth,
      additionalInfo: { currentStage: state.globalMetrics.economicTransitionStage }
    });

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

    // FIX #4 (Oct 29, 2025): Validate final economicTransitionStage value
    const newStage = assertFinite(
      Math.max(0, Math.min(4, state.globalMetrics.economicTransitionStage + validatedStageChange)),
      {
        location: 'EconomicTransitionPhase (new economicTransitionStage)',
        valueName: 'economicTransitionStage',
        month: state.currentMonth,
        additionalInfo: {
          currentStage: state.globalMetrics.economicTransitionStage,
          stageChange: validatedStageChange
        }
      }
    );

    state.globalMetrics = {
      ...state.globalMetrics,
      economicTransitionStage: newStage,
      wealthDistribution: newWealthDist
    };

    return { events: [] };
  }
}
