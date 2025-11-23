/**
 * Quick validation script for defensive fallback fixes
 * Runs a short simulation (24 months) to check for assertion errors
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('=== DEFENSIVE FALLBACK VALIDATION ===\n');
console.log('Running 24-month simulation to check for assertion errors...\n');

try {
  const engine = new SimulationEngine({
    maxMonths: 24,
    seed: 12345,
    snapshotInterval: 12
  });

  // CRITICAL: Pass RNG function to initialization (Nov 7, 2025 fix)
  const rngFunction = engine.getRNG().next.bind(engine.getRNG());
  const initialState = createDefaultInitialState(rngFunction);
  const result = engine.run(initialState);

  if (result.finalState.currentMonth >= 24) {
    console.log('\n✅ SUCCESS: Simulation completed 24 months without assertion errors');
    console.log(`   Final month: ${result.finalState.currentMonth}`);
    console.log(`   Population: ${result.finalState.humanPopulationSystem.population.toFixed(2)}B`);
    console.log(`   AI agents: ${result.finalState.aiAgents.length}`);
    process.exit(0);
  } else {
    console.log('\n⚠️  WARNING: Simulation stopped early');
    console.log(`   Final month: ${result.finalState.currentMonth}`);
    process.exit(1);
  }
} catch (error) {
  console.log('\n❌ FAILED: Assertion error detected');
  console.error(error);
  process.exit(1);
}
