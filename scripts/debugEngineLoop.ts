/**
 * Debug Engine Loop - Trace execution to find month 49 termination
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n='.repeat(80));
console.log('DEBUG: Engine Loop Tracing');
console.log('='.repeat(80));

// Create engine
const seed = 1000;
const engine = new SimulationEngine({ seed });

// Create state
const rng = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rng);

console.log(`\nInitial state created`);
console.log(`  currentMonth: ${state.currentMonth}`);

// Run simulation with logging
console.log(`\nRunning simulation with maxMonths=60...\n`);

const result = engine.run(state, {
  maxMonths: 60,
  checkActualOutcomes: true,
  onMonthEnd: (state) => {
    // Log every 10 months
    if (state.currentMonth % 10 === 0) {
      console.log(`  [CALLBACK] Month ${state.currentMonth} completed`);
    }
  }
});

console.log(`\n='.repeat(80)`);
console.log('RESULT:');
console.log(`  Final month: ${result.finalState.currentMonth}`);
console.log(`  Outcome: ${result.outcome}`);
console.log('='.repeat(80));
