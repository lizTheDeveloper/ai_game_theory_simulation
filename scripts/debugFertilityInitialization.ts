/**
 * Debug Fertility Initialization Script
 *
 * Investigates why Phase 6 fertility fixes didn't work.
 * Checks:
 * 1. Are fertility rates initialized correctly in historicalInitialization.ts?
 * 2. Are they being overwritten by regionalPopulations.ts?
 * 3. What's the actual birth rate calculation chain?
 */

import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { updateRegionalPopulations } from '@/simulation/regionalPopulations';
import { getRegionalHistoricalBirthRate } from '@/simulation/engine/phases/BaselineMortalityPhase';

console.log('='.repeat(80));
console.log('FERTILITY INITIALIZATION DEBUG');
console.log('='.repeat(80));

// Create simple RNG (deterministic but sufficient for debugging)
let seed = 12345;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Initialize 1990 state
console.log('\n1. Initializing 1990 state...');
const state = initializeHistoricalSimulation(1990, rng, 'historical');

// Check fertility rates IMMEDIATELY after initialization
console.log('\n2. Fertility rates IMMEDIATELY after initialization:');
console.log('-'.repeat(80));
for (const region of state.humanPopulationSystem.regionalPopulations) {
  const historicalCBR = getRegionalHistoricalBirthRate(region.name, 1990);
  console.log(`${region.name}:`);
  console.log(`  Fertility Rate (TFR): ${region.fertilityRate.toFixed(2)}`);
  console.log(`  Baseline Birth Rate: ${(region.baselineBirthRate * 100).toFixed(2)}%`);
  console.log(`  Adjusted Birth Rate: ${(region.adjustedBirthRate * 100).toFixed(2)}%`);
  console.log(`  Historical CBR (1990): ${historicalCBR.toFixed(1)}/1000`);
  console.log(`  Expected birth rate from CBR: ${(historicalCBR / 10).toFixed(2)}%`);
  console.log();
}

// Check if _skipHistoricalBirthRateScaling flag is set
const skipScaling = (state as any)._skipHistoricalBirthRateScaling;
console.log(`3. _skipHistoricalBirthRateScaling flag: ${skipScaling ?? 'NOT SET'}`);

// Run ONE update to see what happens
console.log('\n4. Running updateRegionalPopulations() ONCE...');
console.log('-'.repeat(80));
updateRegionalPopulations(state);

// Check fertility rates AFTER first update
console.log('\n5. Fertility rates AFTER first update:');
console.log('-'.repeat(80));
for (const region of state.humanPopulationSystem.regionalPopulations) {
  const historicalCBR = getRegionalHistoricalBirthRate(region.name, 1990);
  console.log(`${region.name}:`);
  console.log(`  Fertility Rate (TFR): ${region.fertilityRate.toFixed(2)}`);
  console.log(`  Baseline Birth Rate: ${(region.baselineBirthRate * 100).toFixed(2)}%`);
  console.log(`  Adjusted Birth Rate: ${(region.adjustedBirthRate * 100).toFixed(2)}%`);
  console.log(`  Historical CBR (1990): ${historicalCBR.toFixed(1)}/1000`);
  console.log(`  Expected birth rate from CBR: ${(historicalCBR / 10).toFixed(2)}%`);
  console.log(`  Population: ${region.population.toFixed(1)}M`);
  console.log();
}

// Calculate expected vs actual global birth rate
console.log('\n6. Global birth rate analysis:');
console.log('-'.repeat(80));
let totalPop = 0;
let weightedBirthRate = 0;
for (const region of state.humanPopulationSystem.regionalPopulations) {
  totalPop += region.population;
  weightedBirthRate += region.adjustedBirthRate * region.population;
}
const globalBirthRate = weightedBirthRate / totalPop;
const globalBirthRatePer1000 = globalBirthRate * 1000;

console.log(`Total population: ${(totalPop / 1000).toFixed(2)}B`);
console.log(`Weighted global birth rate: ${(globalBirthRate * 100).toFixed(2)}% annual`);
console.log(`Equivalent CBR: ${globalBirthRatePer1000.toFixed(1)}/1000`);
console.log(`Expected CBR (1990): 24.3/1000`);
console.log(`Error: ${((globalBirthRatePer1000 / 24.3 - 1) * 100).toFixed(1)}%`);

// Calculate expected births per month
const monthlyBirths = totalPop * (globalBirthRate / 12);
const annualBirths = monthlyBirths * 12;
console.log(`\nExpected births per month: ${monthlyBirths.toFixed(1)}M`);
console.log(`Expected births per year: ${annualBirths.toFixed(1)}M`);
console.log(`Expected annual growth (births only): ${((annualBirths / totalPop) * 100).toFixed(2)}%`);

// Historical 1990-2000 growth rate: 1.31% per year
// With CDR ~9.3/1000 (0.93%) and CBR ~24.3/1000 (2.43%), net growth should be 1.5%
console.log(`\nHistorical 1990-2000 growth: 1.31%/yr`);
console.log(`Expected net growth (CBR 24.3 - CDR 9.3): 1.50%/yr`);

console.log('\n' + '='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
