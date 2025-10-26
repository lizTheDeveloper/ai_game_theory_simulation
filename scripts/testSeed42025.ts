#!/usr/bin/env tsx
/**
 * Minimal reproduction test for seed 42025 crash
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n=== Testing Seed 42025 (Known Crash) ===\n');

const engine = new SimulationEngine({ seed: 42025, maxMonths: 240, logLevel: 'error' });
const initialState = createDefaultInitialState('unprecedented');
initialState.config.runLabel = `Test seed 42025`;

try {
  const result = engine.run(initialState, {
    maxMonths: 240,
    checkActualOutcomes: true
  });

  console.log(`\n✅ SUCCESS: Completed ${result.summary.totalMonths} months`);
  console.log(`   Outcome: ${result.summary.finalOutcome}`);
  console.log(`   ParadigmTrajectory length: ${result.finalState.multiParadigmDUI?.history?.length || 0}`);

} catch (err) {
  console.error(`\n❌ CRASH at month ${initialState.currentMonth}`);
  console.error(`   Error: ${(err as Error).message}`);
  console.error(`\n   Stack trace:`);
  console.error((err as Error).stack);
}
