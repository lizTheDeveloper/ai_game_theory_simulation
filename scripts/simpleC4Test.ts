/**
 * Simple C-4 Birth Rate Test
 *
 * Runs ONE year of simulation to verify birth rates are correct.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';

// Create RNG
let seed = 54321;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Initialize 1990 state
console.log('Initializing 1990 state...');
const state = initializeHistoricalSimulation(1990, rng, 'historical');

const startPop = state.humanPopulationSystem.population;
console.log(`\nStarting population (1990): ${startPop.toFixed(3)}B`);

// Create engine
const engine = new SimulationEngine(rng);

// Run just 12 months
console.log('\nRunning 12 months...\n');
for (let month = 0; month < 12; month++) {
  engine.step(state);
}

const endPop = state.humanPopulationSystem.population;
const growthRate = ((endPop / startPop) - 1) * 100;

console.log(`\nEnding population (1991): ${endPop.toFixed(3)}B`);
console.log(`Annual growth: ${growthRate.toFixed(2)}%`);
console.log(`Expected growth: ~1.5% (CBR 24.3 - CDR 9.3 = 1.5%)`);

const deviation = Math.abs(growthRate - 1.5);
if (deviation < 0.5) {
  console.log(`✅ PASS: Growth rate within 0.5% of expected`);
} else {
  console.log(`❌ FAIL: Growth rate ${growthRate.toFixed(2)}% vs expected 1.5% (deviation: ${deviation.toFixed(2)}%)`);
}
