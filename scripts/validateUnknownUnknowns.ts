/**
 * Validate Unknown Unknown Phase Implementation
 *
 * Quick smoke test to ensure the phase executes without crashing.
 */

import { SimulationEngine } from '../src/simulation/engine';

console.log('=== Unknown Unknown Phase Validation ===\n');

// Create engine with seed
const engine = new SimulationEngine({ seed: 12345, maxMonths: 100, logLevel: 'summary' });

console.log('✅ Engine created successfully');

// Run 10 simulation steps to test phase execution
console.log('\nRunning 10 simulation steps to test phase execution...');

for (let i = 0; i < 10; i++) {
  try {
    engine.step();
  } catch (error) {
    console.error(`\n❌ FATAL ERROR at step ${i + 1}:`, error);
    process.exit(1);
  }
}

const state = engine.getState();

console.log(`\n✅ All 10 steps completed successfully`);
console.log(`   Current month: ${state.currentMonth}`);
console.log(`   Unknown unknowns this run: ${state.unknownUnknownCount || 0}`);

// Note: With 0.1% base probability, we don't expect many events in 10 months
// This is just a smoke test to ensure no crashes

console.log('\n✅ VALIDATION PASSED - Phase executes without errors');
console.log('   (Note: No unknown unknown events expected in 10 months with 0.1% probability)');
