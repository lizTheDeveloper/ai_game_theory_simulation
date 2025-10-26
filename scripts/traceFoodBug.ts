#!/usr/bin/env tsx
/**
 * Trace food security bug - see what happens in first 2 months
 */
import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n=== Tracing Food Security Bug ===\n');

const engine = new SimulationEngine({ seed: 42000, maxMonths: 3, logLevel: 'error' });
const initialState = createDefaultInitialState('unprecedented');

console.log('Month 0 (Initial):');
console.log(`  food.reserves: ${initialState.resourceEconomy.food.reserves.toFixed(3)}`);
console.log(`  foodSecurity: ${(initialState.qualityOfLifeSystems?.survivalFundamentals?.foodSecurity ?? 0).toFixed(3)}`);

try {
  const result = engine.run(initialState, {
    maxMonths: 3,
    checkActualOutcomes: false,  // Don't early stop
    onMonthEnd: (state) => {
      console.log(`\nMonth ${state.currentMonth}:`);
      console.log(`  food.reserves: ${state.resourceEconomy.food.reserves.toFixed(3)}`);
      console.log(`  foodSecurity: ${(state.qualityOfLifeSystems?.survivalFundamentals?.foodSecurity ?? 0).toFixed(3)}`);
      console.log(`  aggregate QoL: ${state.globalMetrics.qualityOfLife.toFixed(3)}`);
    }
  });

  console.log(`\n✅ Completed ${result.summary.totalMonths} months`);
} catch (err) {
  console.error(`\n❌ Error: ${(err as Error).message}`);
}
