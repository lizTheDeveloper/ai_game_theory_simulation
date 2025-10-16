/**
 * Update Economic Stage Phase (P2.4 Feature 3)
 *
 * Tracks economic stage transitions using NBER business cycle methodology.
 * Enables measuring recovery times from historical crises.
 *
 * Runs: Late in execution (after all economic updates complete)
 * Order: 31 (after outcome probability, before final metrics)
 */

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '../../../types/game';
import {
  detectEconomicStage,
  updateRecoveryBaseline,
  getGDPProxy,
} from '../../utils/recoveryCalculations';

export class UpdateEconomicStagePhase implements SimulationPhase {
  readonly id = 'update-economic-stage';
  readonly name = 'Update Economic Stage';
  readonly order = 31; // After outcome probability (30), before dystopia progression (32)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Detect current economic stage using NBER methodology
    const newStage = detectEconomicStage(state);
    const previousStage = state.currentEconomicStage || 'expansion';

    // Update current stage
    state.currentEconomicStage = newStage;

    // Record in history
    if (!state.economicStageHistory) {
      state.economicStageHistory = [];
    }

    const gdp = getGDPProxy(state);
    const qol = state.globalMetrics.qualityOfLife;
    const baseline = state.recoveryBaseline;

    state.economicStageHistory.push({
      month: state.currentMonth,
      stage: newStage,
      gdpLevel: gdp,
      qolLevel: qol,
      baselineGDP: baseline?.gdp || gdp,
      baselineQoL: baseline?.qol || qol,
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
        console.log(`   ⚠️ CRISIS BEGINS - Baseline set for recovery tracking`);
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
