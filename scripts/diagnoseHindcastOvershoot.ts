/**
 * Diagnostic: 1990-2020 Population Overshoot
 *
 * Purpose: Identify why the hindcast overshoots by 6-10% in 2010-2020.
 *
 * This script runs a 1990-2020 hindcast and outputs detailed diagnostics
 * at key checkpoints (2000, 2010, 2020) to understand where the model
 * is producing excess births or insufficient deaths.
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

console.log('=== DIAGNOSTIC: 1990-2020 Population Growth ===\n');

const state = initializeHistoricalSimulation(1990, rng, 'historical');
const engine = new SimulationEngine();

console.log(`Initial state (1990):`);
console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(2)}B`);
const regionalTotal = state.humanPopulationSystem.regionalPopulations.reduce((sum: number, r: any) => sum + r.population, 0) / 1000;
console.log(`  Regional total: ${regionalTotal.toFixed(2)}B`);

// Sample years: 2000, 2010, 2020
const checkpoints = [
  { year: 2000, month: 10 * 12, expected: 6.12 },
  { year: 2010, month: 20 * 12, expected: 6.92 },
  { year: 2020, month: 30 * 12, expected: 7.84 },
];

for (const checkpoint of checkpoints) {
  // Run to checkpoint
  const startMonth = state.currentMonth;
  for (let i = startMonth; i < checkpoint.month; i++) {
    engine.step(state, rng);
  }

  const simPop = state.humanPopulationSystem.population;
  const deviation = ((simPop - checkpoint.expected) / checkpoint.expected * 100).toFixed(2);

  console.log(`\n${checkpoint.year}:`);
  console.log(`  Simulated: ${simPop.toFixed(2)}B`);
  console.log(`  Expected:  ${checkpoint.expected.toFixed(2)}B`);
  console.log(`  Deviation: ${deviation}% ${parseFloat(deviation) > 0 ? '(OVERSHOOT)' : '(undershoot)'}`);

  // Show regional breakdown
  console.log(`  Regional populations:`);
  for (const region of state.humanPopulationSystem.regionalPopulations) {
    const popB = (region.population / 1000).toFixed(2);
    const birthRate = (region.adjustedBirthRate * 100).toFixed(2);
    const deathRate = (region.adjustedDeathRate * 100).toFixed(2);
    const netGrowth = (region.netGrowthRate * 100).toFixed(2);
    console.log(`    ${region.name}: ${popB}B (birth: ${birthRate}%, death: ${deathRate}%, net: ${netGrowth}%)`);
  }
}
