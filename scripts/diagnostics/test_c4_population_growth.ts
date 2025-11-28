/**
 * Test C-4 Population Growth Fix
 *
 * Run 1990-2000 (120 months) and check if population growth matches historical 1.5%/yr
 *
 * Created: Nov 27, 2025 (Roy)
 */

import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { SimulationEngine } from '@/simulation/engine';

// Simple RNG for deterministic testing
let seed = 42424242;
const rng = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

console.log('=== C-4 POPULATION GROWTH FIX TEST ===\n');
console.log('Target: 1.5%/yr growth (1990-2000)');
console.log('Expected 2000 population: ~6.1B\n');

// Initialize 1990 state
const state = initializeHistoricalSimulation(1990, rng);

const initialPopulation = state.humanPopulationSystem.population;
console.log(`Initial population (1990): ${initialPopulation.toFixed(3)}B\n`);

// Run 120 months (10 years)
console.log('Running 120 months (1990-2000)...\n');

const engine = new SimulationEngine(state);
for (let month = 0; month < 120; month++) {
  engine.step(rng);
  if (month % 12 === 0 && month > 0) {
    const year = 1990 + month / 12;
    const pop = state.humanPopulationSystem.population;
    console.log(`  Year ${year}: ${pop.toFixed(3)}B`);
  }
}

const finalPopulation = state.humanPopulationSystem.population;
const populationChange = finalPopulation - initialPopulation;
const totalGrowth = (finalPopulation - initialPopulation) / initialPopulation;
const annualGrowthRate = (Math.pow(finalPopulation / initialPopulation, 1/10) - 1);

console.log('\n=== RESULTS ===\n');
console.log(`Final population (2000): ${finalPopulation.toFixed(3)}B`);
console.log(`Population change: ${(populationChange * 1000).toFixed(0)}M`);
console.log(`Total growth: ${(totalGrowth * 100).toFixed(1)}%`);
console.log(`Annual growth rate: ${(annualGrowthRate * 100).toFixed(2)}%/yr`);

// Validation
const targetGrowth = 1.5; // %/yr
const targetFinal = 6.1; // B
const growthError = Math.abs(annualGrowthRate * 100 - targetGrowth);
const popError = Math.abs((finalPopulation - targetFinal) / targetFinal * 100);

console.log(`\n=== VALIDATION ===\n`);
console.log(`Growth rate error: ${growthError.toFixed(2)} pp (target: ${targetGrowth}%/yr)`);
console.log(`Population error: ${popError.toFixed(1)}% (target: ${targetFinal}B)`);

if (growthError < 0.3 && popError < 5) {
  console.log(`\n✅ PASS: Population growth matches historical expectations`);
} else {
  console.log(`\n❌ FAIL: Population growth outside expected range`);
  if (growthError >= 0.3) {
    console.log(`  Growth rate: ${(annualGrowthRate * 100).toFixed(2)}%/yr vs ${targetGrowth}%/yr (${growthError.toFixed(2)} pp off)`);
  }
  if (popError >= 5) {
    console.log(`  Final population: ${finalPopulation.toFixed(3)}B vs ${targetFinal}B (${popError.toFixed(1)}% off)`);
  }
}

console.log('\n=== END TEST ===\n');
