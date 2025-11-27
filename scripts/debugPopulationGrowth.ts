/**
 * Debug Population Growth
 *
 * Calculates expected vs actual population growth in 1990.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { updateRegionalPopulations } from '../src/simulation/regionalPopulations';

// Create RNG
let seed = 12345;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Initialize 1990 state
console.log('Initializing 1990 state...\n');
const state = initializeHistoricalSimulation(1990, rng, 'historical');

// Run ONE update
updateRegionalPopulations(state);

console.log('POPULATION GROWTH ANALYSIS (1990):\n');
console.log('='.repeat(80));

let totalPop = 0;
let totalBirths = 0;
let totalDeaths = 0;

for (const region of state.humanPopulationSystem.regionalPopulations) {
  const births = region.population * region.adjustedBirthRate;
  const deaths = region.population * region.adjustedDeathRate;
  const netGrowth = births - deaths;

  totalPop += region.population;
  totalBirths += births;
  totalDeaths += deaths;

  console.log(`${region.name}:`);
  console.log(`  Population: ${region.population.toFixed(1)}M`);
  console.log(`  Birth rate: ${(region.adjustedBirthRate * 100).toFixed(2)}% (${(region.adjustedBirthRate * 1000).toFixed(1)}/1000)`);
  console.log(`  Death rate: ${(region.adjustedDeathRate * 100).toFixed(2)}% (${(region.adjustedDeathRate * 1000).toFixed(1)}/1000)`);
  console.log(`  Net growth: ${((netGrowth / region.population) * 100).toFixed(2)}%`);
  console.log(`  Births/yr: ${births.toFixed(1)}M`);
  console.log(`  Deaths/yr: ${deaths.toFixed(1)}M`);
  console.log();
}

console.log('='.repeat(80));
console.log('GLOBAL TOTALS:\n');
console.log(`Total population: ${(totalPop / 1000).toFixed(3)}B`);
console.log(`Total births/yr: ${totalBirths.toFixed(1)}M`);
console.log(`Total deaths/yr: ${totalDeaths.toFixed(1)}M`);
console.log(`Net growth/yr: ${(totalBirths - totalDeaths).toFixed(1)}M`);
console.log();
console.log(`Global birth rate: ${((totalBirths / totalPop) * 100).toFixed(2)}% (${(totalBirths / totalPop * 1000).toFixed(1)}/1000)`);
console.log(`Global death rate: ${((totalDeaths / totalPop) * 100).toFixed(2)}% (${(totalDeaths / totalPop * 1000).toFixed(1)}/1000)`);
console.log(`Global growth rate: ${(((totalBirths - totalDeaths) / totalPop) * 100).toFixed(2)}%`);
console.log();
console.log('EXPECTED (UN WPP 2024):');
console.log(`  CBR (1990): 24.3/1000 (2.43%)`);
console.log(`  CDR (1990): 9.3/1000 (0.93%)`);
console.log(`  Growth (1990-2000): 1.31%/yr`);
console.log();
console.log('ERROR:');
console.log(`  Birth rate error: ${(((totalBirths / totalPop * 1000) / 24.3 - 1) * 100).toFixed(1)}%`);
console.log(`  Death rate error: ${(((totalDeaths / totalPop * 1000) / 9.3 - 1) * 100).toFixed(1)}%`);
console.log(`  Growth rate error: ${((((totalBirths - totalDeaths) / totalPop * 100) / 1.31 - 1) * 100).toFixed(1)}%`);
console.log('='.repeat(80));
