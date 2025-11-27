/**
 * Death Rate Diagnosis Script
 *
 * Identifies why East Asia is losing 1M/month when it should be growing.
 * Compares actual death rates to historical values.
 */

import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { getRegionalHistoricalDeathRate } from '@/simulation/engine/phases/BaselineMortalityPhase';

console.log('='.repeat(80));
console.log('DEATH RATE DIAGNOSIS - 1990 HINDCAST');
console.log('='.repeat(80));

// Create RNG
let seed = 12345;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Initialize 1990 state
console.log('\nInitializing 1990 state...');
const state = initializeHistoricalSimulation(1990, rng, 'historical');

console.log('\n' + '='.repeat(80));
console.log('DEATH RATE COMPARISON (Historical vs Simulated)');
console.log('='.repeat(80));

for (const region of state.humanPopulationSystem.regionalPopulations) {
  const historicalCDR = getRegionalHistoricalDeathRate(region.name, 1990);
  const expectedDeathRate = historicalCDR / 1000; // Convert per 1000 to decimal
  const actualDeathRate = region.adjustedDeathRate;

  const error = ((actualDeathRate / expectedDeathRate) - 1) * 100;
  const monthlyDeathsExpected = region.population * (expectedDeathRate / 12);
  const monthlyDeathsActual = region.population * (actualDeathRate / 12);

  console.log(`\n${region.name}:`);
  console.log(`  Historical CDR (1990): ${historicalCDR.toFixed(1)}/1000`);
  console.log(`  Expected death rate: ${(expectedDeathRate * 100).toFixed(3)}%`);
  console.log(`  Actual death rate: ${(actualDeathRate * 100).toFixed(3)}%`);
  console.log(`  Error: ${error >= 0 ? '+' : ''}${error.toFixed(1)}%`);
  console.log(`  Monthly deaths (expected): ${monthlyDeathsExpected.toFixed(2)}M`);
  console.log(`  Monthly deaths (actual): ${monthlyDeathsActual.toFixed(2)}M`);
  console.log(`  Excess deaths per month: ${(monthlyDeathsActual - monthlyDeathsExpected).toFixed(2)}M`);
}

console.log('\n' + '='.repeat(80));
console.log('REGIONAL BIRTH VS DEATH RATES (Net Growth)');
console.log('='.repeat(80));

let totalPopM = 0;
let totalBirthsM = 0;
let totalDeathsExpectedM = 0;
let totalDeathsActualM = 0;

for (const region of state.humanPopulationSystem.regionalPopulations) {
  const historicalCDR = getRegionalHistoricalDeathRate(region.name, 1990);
  const expectedDeathRate = historicalCDR / 1000;
  const actualDeathRate = region.adjustedDeathRate;
  const birthRate = region.adjustedBirthRate;

  const monthlyBirths = region.population * (birthRate / 12);
  const monthlyDeathsExpected = region.population * (expectedDeathRate / 12);
  const monthlyDeathsActual = region.population * (actualDeathRate / 12);

  const netGrowthExpected = ((birthRate - expectedDeathRate) * 100);
  const netGrowthActual = ((birthRate - actualDeathRate) * 100);

  totalPopM += region.population;
  totalBirthsM += monthlyBirths;
  totalDeathsExpectedM += monthlyDeathsExpected;
  totalDeathsActualM += monthlyDeathsActual;

  console.log(`\n${region.name} (${region.population.toFixed(0)}M):`);
  console.log(`  Birth rate: ${(birthRate * 100).toFixed(2)}%`);
  console.log(`  Death rate (expected): ${(expectedDeathRate * 100).toFixed(2)}%`);
  console.log(`  Death rate (actual): ${(actualDeathRate * 100).toFixed(2)}%`);
  console.log(`  Net growth (expected): ${netGrowthExpected >= 0 ? '+' : ''}${netGrowthExpected.toFixed(2)}%/yr`);
  console.log(`  Net growth (actual): ${netGrowthActual >= 0 ? '+' : ''}${netGrowthActual.toFixed(2)}%/yr`);
}

const globalBirthRate = (totalBirthsM * 12) / totalPopM * 100;
const globalDeathRateExpected = (totalDeathsExpectedM * 12) / totalPopM * 100;
const globalDeathRateActual = (totalDeathsActualM * 12) / totalPopM * 100;
const globalNetExpected = globalBirthRate - globalDeathRateExpected;
const globalNetActual = globalBirthRate - globalDeathRateActual;

console.log('\n' + '='.repeat(80));
console.log('GLOBAL SUMMARY');
console.log('='.repeat(80));
console.log(`Total population: ${(totalPopM / 1000).toFixed(2)}B`);
console.log(`Global birth rate: ${globalBirthRate.toFixed(2)}%/yr`);
console.log(`Global death rate (expected): ${globalDeathRateExpected.toFixed(2)}%/yr`);
console.log(`Global death rate (actual): ${globalDeathRateActual.toFixed(2)}%/yr`);
console.log(`Global net growth (expected): ${globalNetExpected >= 0 ? '+' : ''}${globalNetExpected.toFixed(2)}%/yr`);
console.log(`Global net growth (actual): ${globalNetActual >= 0 ? '+' : ''}${globalNetActual.toFixed(2)}%/yr`);
console.log(`\nHistorical 1990-2000 growth: +1.31%/yr (UN WPP 2024)`);
console.log(`Expected (CBR 24.3 - CDR 9.3): +1.50%/yr`);

console.log('\n' + '='.repeat(80));
console.log('ROOT CAUSE ANALYSIS');
console.log('='.repeat(80));
console.log(`\nDeath rate error: Actual is ${((globalDeathRateActual / globalDeathRateExpected - 1) * 100).toFixed(1)}% too high`);
console.log(`This reduces net growth from ${globalNetExpected.toFixed(2)}% to ${globalNetActual.toFixed(2)}%`);
console.log(`\nHypothesis: Crisis modifiers (food/water/climate stress) are being applied`);
console.log(`in historical mode BEFORE historical CDR scaling, inflating death rates.`);
console.log(`\nFix: In historical mode with _skipHistoricalBirthRateScaling flag,`);
console.log(`use historical CDR directly (like birth rates) instead of applying`);
console.log(`crisis modifiers to 2025 baseline values.`);
