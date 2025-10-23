/**
 * Test script to verify population fix
 *
 * Bug: Population phases were running 30x per month (daily) instead of 1x per month
 * Expected: Population should change by ~0.08% per month (annual growth ~1%)
 * Before fix: Population lost 640M-1.1B per month (14% monthly loss)
 * After fix: Population should be stable or grow slowly
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createInitialState } from '../src/simulation/initialization';

console.log('\n=== Testing Population Stability Fix ===\n');

// Create engine and initial state
const engine = new SimulationEngine({ seed: 42 });
const state = createInitialState();

console.log(`Initial population: ${(state.humanPopulation.population / 1e9).toFixed(3)}B people`);
console.log(`Starting month: ${state.currentMonth}, day: ${state.currentDay}`);

// Run simulation for 3 months (90 days)
const monthlyPopulations: number[] = [state.humanPopulation.population];

for (let i = 0; i < 90; i++) {
  engine.step(state);

  // Record population at end of each month
  if (state.currentDay === 30) {
    monthlyPopulations.push(state.humanPopulation.population);
    const popBillions = state.humanPopulation.population / 1e9;
    const prevPopBillions = monthlyPopulations[monthlyPopulations.length - 2] / 1e9;
    const changePercent = ((popBillions - prevPopBillions) / prevPopBillions) * 100;

    console.log(`\nMonth ${state.currentMonth}: ${popBillions.toFixed(3)}B people (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
  }
}

// Calculate total change
const initialPop = monthlyPopulations[0] / 1e9;
const finalPop = monthlyPopulations[monthlyPopulations.length - 1] / 1e9;
const totalChange = finalPop - initialPop;
const totalChangePercent = (totalChange / initialPop) * 100;

console.log('\n=== Results ===');
console.log(`Initial population: ${initialPop.toFixed(3)}B`);
console.log(`Final population:   ${finalPop.toFixed(3)}B`);
console.log(`Total change:       ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(3)}B (${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(2)}%)`);

// Validation
console.log('\n=== Validation ===');
if (Math.abs(totalChangePercent) < 1.0) {
  console.log('✅ PASS: Population change is reasonable (<1% over 3 months)');
} else if (totalChangePercent < -5) {
  console.log('❌ FAIL: Population loss too high (>5% over 3 months)');
  console.log('   This indicates monthly phases are still running daily!');
} else {
  console.log('⚠️  WARNING: Population change is high but not catastrophic');
  console.log('   Expected: ~0.25% over 3 months (1% annual growth)');
  console.log(`   Actual: ${totalChangePercent.toFixed(2)}% over 3 months`);
}

console.log('\nExpected behavior:');
console.log('  - Normal growth: ~1% annual = ~0.08% monthly');
console.log('  - With environmental stress: -0.5% to +0.5% monthly');
console.log('  - Bug behavior (fixed): -14% monthly = -640M people per month');
console.log('');
