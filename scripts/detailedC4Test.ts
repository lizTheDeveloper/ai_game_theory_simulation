/**
 * Detailed C-4 Test
 *
 * Runs 12 months with monthly population tracking.
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
console.log(`\nMonthly population tracking:\n`);

// Create engine
const engine = new SimulationEngine(rng);

// Run 12 months with tracking
for (let month = 0; month < 12; month++) {
  engine.step(state);
  const pop = state.humanPopulationSystem.population;
  const growthFromStart = ((pop / startPop) - 1) * 100;
  console.log(`Month ${String(month + 1).padStart(2)}: ${pop.toFixed(3)}B (${growthFromStart >= 0 ? '+' : ''}${growthFromStart.toFixed(2)}%)`);
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
