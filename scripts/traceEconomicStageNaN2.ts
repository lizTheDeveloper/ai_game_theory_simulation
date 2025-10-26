#!/usr/bin/env tsx
/**
 * Trace where economicTransitionStage becomes NaN - detailed version
 */
import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n=== Tracing economicTransitionStage NaN Bug (Detailed) ===\n');

const engine = new SimulationEngine({ seed: 42000, maxMonths: 165, logLevel: 'error' });
const initialState = createDefaultInitialState('unprecedented');

let lastKnownGoodStage = 0;

try {
  const result = engine.run(initialState, {
    maxMonths: 165,
    checkActualOutcomes: false,
    onMonthEnd: (state) => {
      const stage = state.globalMetrics.economicTransitionStage;

      // Check for NaN
      if (isNaN(stage)) {
        console.log(`\n❌ NaN DETECTED AT MONTH ${state.currentMonth}!`);
        console.log(`   Last known good value (month ${state.currentMonth - 1}): ${lastKnownGoodStage}`);
        console.log(`   Current value: ${stage}`);
        console.log('\n   All globalMetrics values:');
        for (const [key, value] of Object.entries(state.globalMetrics)) {
          if (typeof value === 'number' && isNaN(value)) {
            console.log(`   ❌ ${key}: NaN`);
          } else if (typeof value === 'number') {
            console.log(`   ${key}: ${value}`);
          }
        }
        throw new Error('NaN detected');
      }

      lastKnownGoodStage = stage;

      // Log around the critical months
      if (state.currentMonth >= 158 && state.currentMonth <= 162) {
        console.log(`Month ${state.currentMonth}: economicTransitionStage = ${stage}`);
      }
    }
  });

  console.log(`\n✅ Completed ${result.summary.totalMonths} months without NaN`);
} catch (err) {
  console.error(`\n❌ Error: ${(err as Error).message}`);
  console.error((err as Error).stack);
}
