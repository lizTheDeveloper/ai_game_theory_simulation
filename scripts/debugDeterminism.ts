/**
 * Minimal determinism debugging script
 * Runs 3 identical simulations and logs AI agent capabilities at each step
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const SEED = 12345;
const MAX_MONTHS = 2;
const RUNS = 3;

for (let run = 1; run <= RUNS; run++) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run}`);
  console.log('='.repeat(80));

  const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS, logLevel: 'silent' });
  const initialState = createDefaultInitialState('balanced', undefined, undefined, undefined, undefined, SEED);

  console.log(`\nInitial state (Month 0 start):`);
  console.log(`  AI count: ${initialState.aiAgents.length}`);
  console.log(`  Total capability: ${initialState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0).toFixed(6)}`);
  console.log(`  First 5 AI agents:`);
  initialState.aiAgents.slice(0, 5).forEach((ai, i) => {
    console.log(`    AI ${i}: cap=${ai.capability.toFixed(6)}, align=${ai.alignment.toFixed(6)}`);
  });

  // Run simulation with callback to log each month
  let monthCount = 0;
  engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    logLevel: 'silent',
    onMonthEnd: (state) => {
      console.log(`\n--- After Month ${monthCount} (Run ${run}) ---`);
      console.log(`  AI count: ${state.aiAgents.length}`);
      console.log(`  Total capability: ${state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0).toFixed(6)}`);
      console.log(`  First 5 AI agents:`);
      state.aiAgents.slice(0, 5).forEach((ai, i) => {
        console.log(`    AI ${i}: cap=${ai.capability.toFixed(6)}, align=${ai.alignment.toFixed(6)}`);
      });
      monthCount++;
    }
  });
}
