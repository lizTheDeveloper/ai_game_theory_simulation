/**
 * Test initialization with RNG to isolate the NaN issue
 */

import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';

console.log('Testing initialization with RNG...\n');

const engine = new SimulationEngine({ seed: 42, maxMonths: 100 });
const seededRng = engine.getRNG();
const rng = seededRng.next.bind(seededRng);

console.log('RNG function test before init:');
console.log('  rng():', rng());
console.log('  rng():', rng());
console.log('  typeof rng:', typeof rng);

console.log('\nCalling createDefaultInitialState(rng)...');
try {
  const state = createDefaultInitialState(rng);
  console.log('✅ Initialization successful!');
  console.log('  Population:', state.humanPopulationSystem.population);
  console.log('  Month:', state.currentMonth);
} catch (error) {
  console.log('❌ Initialization failed:', error);
}
