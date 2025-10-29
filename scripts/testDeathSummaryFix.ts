/**
 * Test script to verify logDeathSummary() unit conversion fix
 *
 * Before fix: Reported "45009M" deaths (45B!) from ~200M actual deaths
 * After fix: Should report correct millions
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { addMortalityRisk, resolveMortality } from '../src/simulation/bayesianMortality';
import { logDeathSummary } from '../src/simulation/populationDynamics';

console.log('\n=== Death Summary Unit Conversion Test ===\n');

// Initialize game state
const state = createDefaultInitialState();
const rng = () => 0.5;

console.log(`Initial population: ${state.humanPopulationSystem.population.toFixed(3)}B\n`);

// Simulate 5 months with varying mortality
for (let month = 1; month <= 5; month++) {
  // Add escalating famine risk
  addMortalityRisk(state.humanPopulationSystem, {
    type: 'famine',
    baseRisk: 0.005 * month,  // 0.5%, 1%, 1.5%, 2%, 2.5%
    proximate: 'famine',
    root: 'ecosystem',
    description: `Month ${month} famine`,
    confidence: 'HIGH',
    scope: 'GLOBAL',
    month
  });

  resolveMortality(state, rng);
}

console.log(`\nFinal population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`Cumulative deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M\n`);

// Log death summary - this should now show correct units
logDeathSummary(state);

console.log('\n✅ Check the "Total crisis deaths" line above:');
console.log('   - Should be ~587M (not 587000M)');
console.log('   - Should match "Cumulative deaths" above');
console.log('   - Should be less than starting population (8.136B = 8136M)');
