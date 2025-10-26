#!/usr/bin/env tsx
/**
 * Trace where economicTransitionStage becomes NaN
 */
import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n=== Tracing economicTransitionStage NaN Bug ===\n');

const engine = new SimulationEngine({ seed: 42000, maxMonths: 200, logLevel: 'error' });
const initialState = createDefaultInitialState('unprecedented');

console.log('Month 0:', initialState.globalMetrics.economicTransitionStage);

try {
  const result = engine.run(initialState, {
    maxMonths: 200,
    checkActualOutcomes: false,  // Don't early stop
    onMonthEnd: (state) => {
      const stage = state.globalMetrics.economicTransitionStage;

      // Log every 10 months or when NaN
      if (state.currentMonth % 10 === 0 || isNaN(stage)) {
        console.log(`Month ${state.currentMonth}: economicTransitionStage = ${stage}`);

        // If NaN detected, dump related metrics
        if (isNaN(stage)) {
          console.log('\n❌ NaN DETECTED! Related metrics:');
          console.log(`   qualityOfLife: ${state.globalMetrics.qualityOfLife}`);
          console.log(`   wealthDistribution: ${state.globalMetrics.wealthDistribution}`);
          console.log(`   socialStability: ${state.globalMetrics.socialStability}`);
          console.log(`   manufacturingCapability: ${state.globalMetrics.manufacturingCapability}`);
          console.log(`   Total AI count: ${state.aiAgents.length}`);
          console.log(`   Total AI capability: ${state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0)}`);
          throw new Error('NaN detected in economicTransitionStage');
        }
      }
    }
  });

  console.log(`\n✅ Completed ${result.summary.totalMonths} months without NaN`);
} catch (err) {
  console.error(`\n❌ Error: ${(err as Error).message}`);
}
