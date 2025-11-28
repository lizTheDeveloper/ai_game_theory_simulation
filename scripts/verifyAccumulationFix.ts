/**
 * Verify HIGH-11 Double Accumulation Fix (Nov 28, 2025)
 *
 * Tests that updateEnvironmentalAccumulation is called exactly ONCE per step:
 * - PlanetaryBoundariesPhase calls it (order 21.0)
 * - engine.ts no longer calls it (removed duplicate)
 */

import { createInitialState } from '../src/simulation/initialization';
import { GameEngine } from '../src/simulation/engine';

console.log('=== DOUBLE ACCUMULATION FIX VERIFICATION ===\n');

// Instrument updateEnvironmentalAccumulation to count calls
let callCount = 0;
const originalModule = require('../src/simulation/environmental');
const originalFn = originalModule.updateEnvironmentalAccumulation;

// Wrap the function to count calls
originalModule.updateEnvironmentalAccumulation = function(...args: any[]) {
  callCount++;
  console.log(`  📊 updateEnvironmentalAccumulation called (count: ${callCount})`);
  return originalFn.apply(this, args);
};

// Run simulation
const seed = 'accumulation-test';
const rng = () => 0.5; // Simple RNG
const engine = new GameEngine(seed);
const state = createInitialState({ mode: 'god-mode', rng });

console.log('Initial biodiversity:', state.environment.biodiversityIndex);
console.log('Initial pollution:', state.environment.pollutionLevel);
console.log('\nRunning 1 simulation step...\n');

callCount = 0;
engine.step(state);

console.log('\n=== RESULTS ===');
console.log(`Calls to updateEnvironmentalAccumulation: ${callCount}`);
console.log(`Expected: 1 (PlanetaryBoundariesPhase only)`);
console.log(`Status: ${callCount === 1 ? '✅ PASS' : `❌ FAIL (${callCount} calls)`}`);

console.log('\nFinal biodiversity:', state.environment.biodiversityIndex);
console.log('Final pollution:', state.environment.pollutionLevel);

if (callCount !== 1) {
  console.log('\n❌ CRITICAL: Double accumulation still present!');
  process.exit(1);
} else {
  console.log('\n✅ Fix verified: Environmental accumulation called exactly once');
  process.exit(0);
}
