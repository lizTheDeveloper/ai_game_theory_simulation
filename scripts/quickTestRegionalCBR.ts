/**
 * Quick Test: Regional CBR Scaling
 *
 * Validates that region-specific birth rate curves reduce 2010-2020 overshoot.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization.js';
import { SimulationEngine } from '../src/simulation/engine.js';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng.js';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rng = createSeededRng(19900101);
setDeterministicRng(rng);

console.log('=== TEST: Regional CBR Scaling (2010) ===\n');

const state = initializeHistoricalSimulation(1990, rng, 'historical');
const engine = new SimulationEngine();

// Run to 2010 (20 years * 12 months = 240 months)
for (let i = 0; i < 240; i++) {
  engine.step(state, rng);
}

console.log('\n2010 Population Check:');
console.log(`  Simulated: ${state.humanPopulationSystem.population.toFixed(2)}B`);
console.log(`  Expected: 6.92B`);
const deviation2010 = ((state.humanPopulationSystem.population - 6.92) / 6.92 * 100);
console.log(`  Deviation: ${deviation2010.toFixed(2)}%`);

// Run to 2020 (10 more years * 12 months = 120 months)
for (let i = 0; i < 120; i++) {
  engine.step(state, rng);
}

console.log('\n2020 Population Check:');
console.log(`  Simulated: ${state.humanPopulationSystem.population.toFixed(2)}B`);
console.log(`  Expected: 7.84B`);
const deviation2020 = ((state.humanPopulationSystem.population - 7.84) / 7.84 * 100);
console.log(`  Deviation: ${deviation2020.toFixed(2)}%`);

console.log('\nRegional Breakdown (2020):');
for (const region of state.humanPopulationSystem.regionalPopulations.slice(0, 7)) {
  const popB = (region.population / 1000).toFixed(2);
  const birth = (region.adjustedBirthRate * 100).toFixed(2);
  console.log(`  ${region.name}: ${popB}B (birth: ${birth}%)`);
}

console.log('\n✅ Test complete - no crashes!');
console.log(`\nSummary: 2010 deviation ${deviation2010.toFixed(1)}%, 2020 deviation ${deviation2020.toFixed(1)}%`);
