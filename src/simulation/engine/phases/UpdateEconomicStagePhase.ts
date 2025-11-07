import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
/**
 * Update Economic Stage Phase (P2.4 Feature 3)
 *
 * Tracks economic stage transitions using NBER business cycle methodology.
 * Enables measuring recovery times from historical crises.
 *
 * Runs: Late in execution (after all economic updates complete)
 * Order: 31 (after outcome probability, before final metrics)
 */

import {
  detectEconomicStage,
  updateRecoveryBaseline,
  getGDPProxy,
} from '../../utils/recoveryCalculations';
import { assertFinite, assertStateProperty } from '../../utils/assertions';

export class UpdateEconomicStagePhase implements SimulationPhase {
  readonly id = 'update-economic-stage';
  readonly name = 'Update Economic Stage';
  readonly order = 31; // After outcome probability (30), before dystopia progression (32)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Detect current economic stage using NBER methodology
    setDeterministicRng(rng);
    const newStage = detectEconomicStage(state);
    const previousStage = state.currentEconomicStage || 'expansion';

    // Update current stage
    state.currentEconomicStage = newStage;

    // Record in history
    if (!state.economicStageHistory) {
      state.economicStageHistory = [];
    }

    const gdp = assertFinite(getGDPProxy(state), {
      location: 'UpdateEconomicStagePhase.execute',
      valueName: 'gdp',
      month: state.currentMonth,
    });

    const qol = assertStateProperty(state.globalMetrics, 'qualityOfLife', {
      location: 'UpdateEconomicStagePhase.execute',
      month: state.currentMonth,
    });

    const baseline = state.recoveryBaseline;

    // Validate baseline values if they exist
    const baselineGDP = baseline?.gdp
      ? assertFinite(baseline.gdp, {
          location: 'UpdateEconomicStagePhase.execute',
          valueName: 'baseline.gdp',
          month: state.currentMonth,
        })
      : gdp;

    const baselineQoL = baseline?.qol
      ? assertFinite(baseline.qol, {
          location: 'UpdateEconomicStagePhase.execute',
          valueName: 'baseline.qol',
          month: state.currentMonth,
        })
      : qol;

    state.economicStageHistory.push({
      month: state.currentMonth,
      stage: newStage,
      gdpLevel: gdp,
      qolLevel: qol,
      baselineGDP,
      baselineQoL,
    });

    // Update recovery baseline if entering contraction (crisis begins)
    updateRecoveryBaseline(state);

    // Log stage transitions
    if (newStage !== previousStage) {
      console.log(`\n📊 ECONOMIC STAGE TRANSITION (Month ${state.currentMonth})`);
      console.log(`   ${previousStage} → ${newStage}`);
      console.log(`   GDP Proxy: ${gdp.toExponential(2)}`);
      console.log(`   QoL: ${qol.toFixed(2)}`);

      if (newStage === 'contraction' && baseline) {
        console.warn(`   ⚠️ CRISIS BEGINS - Baseline set for recovery tracking`);
      }

      if (newStage === 'recovery' && baseline) {
        console.log(`   ✅ RECOVERY BEGINS - Returning toward baseline`);
      }

      if (newStage === 'expansion' && previousStage === 'recovery') {
        console.log(`   🎉 FULL RECOVERY - Returned to pre-crisis levels`);
      }

      console.log('');
    }

    return {
      events: [],
      metadata: {
        stage: newStage,
        stageChanged: newStage !== previousStage,
      },
    };
  }
}
