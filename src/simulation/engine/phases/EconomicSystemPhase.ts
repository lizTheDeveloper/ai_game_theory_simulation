/**
 * Economic System Phase
 *
 * Consolidated phase combining:
 * 1. Economic Transition: Updates economic development stage (0-4) and wealth distribution
 * 2. Economic Stage Tracking: Tracks business cycle stages using NBER methodology
 *
 * Order: 31.0 (after unemployment updates)
 *
 * Consolidation: Batch 7 (Nov 9, 2025)
 * - Merged EconomicTransitionPhase + UpdateEconomicStagePhase
 * - Both ran at order 31, no execution order conflicts
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateEconomicTransitionProgress } from '../../economics';
import {
  detectEconomicStage,
  updateRecoveryBaseline,
  getGDPProxy,
} from '../../utils/recoveryCalculations';
import { assertFinite, assertStateProperty } from '../../utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class EconomicSystemPhase implements SimulationPhase {
  readonly id = 'economic-system';
  readonly name = 'Economic System';
  readonly order = 31.0;

  // DEPENDENCIES (Nov 6, 2025): Requires unemployment for transition progress
  readonly dependencies = [
    'unemployment',              // Order 30.0: Unemployment affects wealth distribution
  ];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    setDeterministicRng(rng);

    // ========================================================================
    // PART 1: Economic Transition (Development Stage & Wealth Distribution)
    // ========================================================================

    const economicProgress = calculateEconomicTransitionProgress(state, rng);

    // FIX #4 (Oct 29, 2025): Validate stageChange to prevent NaN propagation
    // Bug: If stageChange is NaN, it propagates to economicTransitionStage,
    // which then cascades to all economic calculations → Monte Carlo output shows NaN
    const validatedStageChange = assertFinite(economicProgress.stageChange, {
      location: 'EconomicSystemPhase (stageChange)',
      valueName: 'stageChange',
      month: state.currentMonth,
      additionalInfo: { currentStage: state.globalMetrics.economicTransitionStage }
    });

    // FIX (Oct 28, 2025): Use assertFinite to validate inputs and outputs
    const validatedChange = assertFinite(economicProgress.wealthDistributionChange, {
      location: 'EconomicSystemPhase (wealthDistributionChange)',
      valueName: 'wealthDistributionChange',
      month: state.currentMonth
    });

    const currentWealth = assertFinite(state.globalMetrics.wealthDistribution, {
      location: 'EconomicSystemPhase (current wealthDistribution)',
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
        location: 'EconomicSystemPhase (new wealthDistribution)',
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
        location: 'EconomicSystemPhase (new economicTransitionStage)',
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

    // ========================================================================
    // PART 2: Economic Stage Tracking (Business Cycle Detection)
    // ========================================================================
    // P2.4 Feature 3: NBER-based business cycle methodology
    // Enables measuring recovery times from historical crises

    // Detect current economic stage using NBER methodology
    const newEconomicStage = detectEconomicStage(state);
    const previousStage = state.currentEconomicStage || 'expansion';

    // Update current stage
    state.currentEconomicStage = newEconomicStage;

    // Record in history
    if (!state.economicStageHistory) {
      state.economicStageHistory = [];
    }

    const gdp = assertFinite(getGDPProxy(state), {
      location: 'EconomicSystemPhase.execute (GDP)',
      valueName: 'gdp',
      month: state.currentMonth,
      additionalInfo: {
        population: state.humanPopulationSystem.population,
        qol: state.globalMetrics.qualityOfLife,
        economicStage: state.globalMetrics.economicTransitionStage,
      }
    });

    const qol = assertStateProperty(state.globalMetrics, 'qualityOfLife', {
      location: 'EconomicSystemPhase.execute (QoL)',
      month: state.currentMonth,
    });

    const baseline = state.recoveryBaseline;

    // Validate baseline values if they exist
    const baselineGDP = baseline?.gdp
      ? assertFinite(baseline.gdp, {
          location: 'EconomicSystemPhase.execute (baseline GDP)',
          valueName: 'baseline.gdp',
          month: state.currentMonth,
        })
      : gdp;

    const baselineQoL = baseline?.qol
      ? assertFinite(baseline.qol, {
          location: 'EconomicSystemPhase.execute (baseline QoL)',
          valueName: 'baseline.qol',
          month: state.currentMonth,
        })
      : qol;

    state.economicStageHistory.push({
      month: state.currentMonth,
      stage: newEconomicStage,
      gdpLevel: gdp,
      qolLevel: qol,
      baselineGDP,
      baselineQoL,
    });

    // Update recovery baseline if entering contraction (crisis begins)
    updateRecoveryBaseline(state);

    // ========================================================================
    // LOGGING: Report economic transitions
    // ========================================================================

    // Log stage transitions
    if (newEconomicStage !== previousStage) {
      console.log(`\n📊 ECONOMIC STAGE TRANSITION (Month ${state.currentMonth})`);
      console.log(`   ${previousStage} → ${newEconomicStage}`);
      console.log(`   GDP Proxy: ${gdp.toExponential(2)}`);
      console.log(`   QoL: ${qol.toFixed(2)}`);

      if (newEconomicStage === 'contraction' && baseline) {
        console.warn(`   ⚠️ CRISIS BEGINS - Baseline set for recovery tracking`);
      }

      if (newEconomicStage === 'recovery' && baseline) {
        console.log(`   ✅ RECOVERY BEGINS - Returning toward baseline`);
      }

      if (newEconomicStage === 'expansion' && previousStage === 'recovery') {
        console.log(`   🎉 FULL RECOVERY - Returned to pre-crisis levels`);
      }

      console.log('');
    }

    return {
      events: [],
      metadata: {
        economicStage: newEconomicStage,
        stageChanged: newEconomicStage !== previousStage,
      },
    };
  }
}
