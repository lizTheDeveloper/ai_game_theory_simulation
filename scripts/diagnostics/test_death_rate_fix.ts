/**
 * Test Death Rate Fix (C-4)
 *
 * Quick test to verify that baseline mortality is now at correct historical levels
 * after removing ERA compensation.
 *
 * Created: Nov 27, 2025 (Roy)
 */

import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { PhaseOrchestrator } from '@/simulation/engine/PhaseOrchestrator';
import { GameState } from '@/types/game';

// Simple RNG for deterministic testing
let seed = 12345;
const rng = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

console.log('=== DEATH RATE FIX TEST ===\n');

// Initialize 1990 state
const state = initializeHistoricalSimulation(1990, rng);

console.log('Initial state:');
console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`  Expected CDR (1990): 9.3/1000 = 0.93%/year`);
console.log(`  Expected monthly deaths: ${(5.32 * 0.0093 / 12).toFixed(3)}M\n`);

// Run one simulation step
console.log('Running Month 0...\n');
const orchestrator = new PhaseOrchestrator();
orchestrator.executeAll(state, rng);

const finalPopulation = state.humanPopulationSystem.population;
const populationChange = finalPopulation - 5.32;
const monthlyGrowthRate = populationChange / 5.32;
const annualGrowthRate = monthlyGrowthRate * 12;

console.log('\nResults after Month 0:');
console.log(`  Final population: ${finalPopulation.toFixed(3)}B`);
console.log(`  Population change: ${(populationChange * 1000).toFixed(2)}M`);
console.log(`  Monthly growth rate: ${(monthlyGrowthRate * 100).toFixed(3)}%`);
console.log(`  Annual growth rate: ${(annualGrowthRate * 100).toFixed(2)}%`);

// Expected: ~1.5%/yr growth (birth 2.7%/yr - death 0.93%/yr = 1.77%/yr)
const expectedGrowth = 1.5;
const error = Math.abs(annualGrowthRate * 100 - expectedGrowth);

console.log(`\nValidation:`);
console.log(`  Expected growth: ${expectedGrowth}%/yr`);
console.log(`  Actual growth: ${(annualGrowthRate * 100).toFixed(2)}%/yr`);
console.log(`  Error: ${error.toFixed(2)} percentage points`);

if (error < 0.5) {
  console.log(`  ✅ PASS: Growth rate within expected range`);
} else {
  console.log(`  ❌ FAIL: Growth rate outside expected range`);
}

// Check if mortality risks were added
if (state.humanPopulationSystem.mortalityRisks) {
  console.log(`\nMortality risks this month: ${state.humanPopulationSystem.mortalityRisks.length}`);
}

console.log('\n=== END TEST ===\n');
