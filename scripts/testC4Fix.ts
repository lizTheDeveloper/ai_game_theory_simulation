/**
 * Test C-4 ERA Exemption Fix
 *
 * Verifies that baseline demographic mortality is exempt from ERA scaling
 */

import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { SimulationEngine } from '@/simulation/engine';

// Create RNG
let seed = 12345;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

console.log('================================================================================');
console.log('C-4 ERA EXEMPTION FIX TEST');
console.log('================================================================================');

// Initialize 1990 state
console.log('\nInitializing 1990 state...');
const state = initializeHistoricalSimulation(1990, rng, 'historical');
const engine = new SimulationEngine();

// BUG: state.humanPopulationSystem.population is in BILLIONS but regionalPopulations are in MILLIONS
// Use regional total as source of truth
const regionalTotal = state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.population, 0);
const initialPop = regionalTotal; // Millions

console.log(`\nInitial population (global): ${state.humanPopulationSystem.population.toFixed(2)}B (WRONG UNITS)`);
console.log(`Initial population (regional total): ${initialPop.toFixed(0)}M = ${(initialPop / 1000).toFixed(2)}B`);
console.log(`Current year: ${state.currentYear}`);
console.log(`Current month: ${state.currentMonth}`);

// Run one simulation step
console.log('\nRunning simulation step (this will generate phase output)...\n');
engine.step(state, rng);

// Get deaths from deathsByCategory (more reliable than population arithmetic)
const monthlyDeaths = Object.values(state.humanPopulationSystem.deathsByCategory).reduce((sum, val) => sum + val, 0);
const annualDeathRate = (monthlyDeaths / initialPop) * 100 * 12; // Annual percentage
const annualDeaths = monthlyDeaths * 12; // Annual total

console.log(`\n${'='.repeat(80)}`);
console.log('RESULTS');
console.log('='.repeat(80));
console.log(`Monthly deaths: ${monthlyDeaths.toFixed(2)}M`);
console.log(`Annual deaths: ${annualDeaths.toFixed(1)}M/yr`);
console.log(`Annual death rate: ${annualDeathRate.toFixed(3)}%/yr (${(annualDeathRate * 10).toFixed(1)}/1000)`);
console.log(`\nExpected (1990):`);
console.log(`  Population: 5,320M = 5.32B`);
console.log(`  CDR: 9.3/1000`);
console.log(`  Deaths: 49.5M/yr`);
console.log(`  Deaths/month: 4.125M`);

// Check if death rate is within reasonable range
const expectedCDR = 9.3; // per 1000
const expectedRate = expectedCDR / 10; // convert to percentage
const tolerance = 0.20; // ±20%
const error = ((annualDeathRate - expectedRate) / expectedRate);
const withinRange = Math.abs(error) <= tolerance;

console.log(`\n${withinRange ? '✅' : '❌'} Death rate ${withinRange ? 'within' : 'outside'} expected range`);
console.log(`   Expected: ${expectedRate.toFixed(3)}% ± ${(expectedRate * tolerance).toFixed(3)}% (CDR ${expectedCDR}/1000)`);
console.log(`   Actual: ${annualDeathRate.toFixed(3)}% (CDR ${(annualDeathRate * 10).toFixed(1)}/1000)`);
console.log(`   Error: ${(error * 100).toFixed(1)}%`);

if (!withinRange) {
  console.log(`\n⚠️ OUTSIDE RANGE - Investigating...`);
  console.log(`   If death rate is TOO LOW: ERA multiplier still being applied to baseline`);
  console.log(`   If death rate is TOO HIGH: Different issue (crisis modifiers, etc.)`);
}
