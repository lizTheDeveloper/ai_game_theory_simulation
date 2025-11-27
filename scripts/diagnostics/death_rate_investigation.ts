/**
 * Death Rate Investigation (C-4 Population Hindcast Validation)
 *
 * Diagnose why overall growth rate is 0.11%/yr vs expected 1.5%/yr (13× too low)
 * despite birth rates being correct.
 *
 * Suspected root cause: Death rates using 2025 baselines instead of historical values.
 *
 * Created: Nov 27, 2025 (Roy)
 */

import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { getRegionalHistoricalDeathRate } from '@/simulation/engine/phases/BaselineMortalityPhase';
import { GameState } from '@/types/game';

// Simple RNG for deterministic testing
let seed = 12345;
const rng = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

console.log('=== DEATH RATE INVESTIGATION ===\n');
console.log('Hypothesis: Death rates calculated from 2025 baselines instead of historical values');
console.log('Expected: 1.5%/yr growth (1990-2000)');
console.log('Observed: 0.11%/yr growth\n');

// Initialize 1990 state
const state = initializeHistoricalSimulation(1990, rng);

console.log('\n=== REGIONAL DEATH RATE ANALYSIS ===\n');

if (!state.humanPopulationSystem?.regionalPopulations) {
  console.error('❌ No regional populations found');
  process.exit(1);
}

// Calculate expected vs actual death rates for each region
const regions = state.humanPopulationSystem.regionalPopulations;

console.log('Region | Pop (M) | Historical CDR | Baseline | Healthcare | Calc | Scale | Final | Expected');
console.log('-------|---------|----------------|----------|------------|------|-------|-------|----------');

let totalExpectedDeaths = 0;
let totalCalculatedDeaths = 0;

for (const region of regions) {
  const historicalCDR = getRegionalHistoricalDeathRate(region.name, 1990); // CDR per 1000
  const expectedDeathRate = historicalCDR / 1000; // Convert to annual rate

  const baselineDeathRate = region.baselineDeathRate;
  const healthcareQuality = region.healthcareQuality;
  const healthcareReduction = Math.max(0.3, 1 - (healthcareQuality * 0.7));

  // This is what the code currently does (before historical scaling)
  const calculatedBeforeScale = baselineDeathRate * healthcareReduction;

  // Historical scaling
  const baseline2025CDR = getRegionalHistoricalDeathRate(region.name, 2025);
  const regionalCDRScale = historicalCDR / baseline2025CDR;

  const calculatedAfterScale = calculatedBeforeScale * regionalCDRScale;

  // Calculate total deaths
  const expectedDeaths = region.population * expectedDeathRate / 12; // Monthly
  const calculatedDeaths = region.population * calculatedAfterScale / 12; // Monthly

  totalExpectedDeaths += expectedDeaths;
  totalCalculatedDeaths += calculatedDeaths;

  console.log(
    `${region.name.padEnd(30)} | ` +
    `${region.population.toFixed(0).padStart(7)} | ` +
    `${historicalCDR.toFixed(1).padStart(14)} | ` +
    `${(baselineDeathRate * 100).toFixed(2).padStart(8)} | ` +
    `${healthcareQuality.toFixed(2).padStart(10)} | ` +
    `${(calculatedBeforeScale * 100).toFixed(3).padStart(5)} | ` +
    `${regionalCDRScale.toFixed(3).padStart(5)} | ` +
    `${(calculatedAfterScale * 100).toFixed(3).padStart(5)} | ` +
    `${(expectedDeathRate * 100).toFixed(3).padStart(7)}`
  );
}

console.log('\n=== GLOBAL AGGREGATES ===\n');

const totalPopulation = regions.reduce((sum, r) => sum + r.population, 0);
const globalExpectedDeathRate = (totalExpectedDeaths / totalPopulation) * 12; // Annual
const globalCalculatedDeathRate = (totalCalculatedDeaths / totalPopulation) * 12; // Annual

console.log(`Total population: ${totalPopulation.toFixed(0)}M (${(totalPopulation/1000).toFixed(2)}B)`);
console.log(`Expected global death rate: ${(globalExpectedDeathRate * 100).toFixed(3)}% annual`);
console.log(`Calculated global death rate: ${(globalCalculatedDeathRate * 100).toFixed(3)}% annual`);
console.log(`\nExpected monthly deaths: ${totalExpectedDeaths.toFixed(1)}M`);
console.log(`Calculated monthly deaths: ${totalCalculatedDeaths.toFixed(1)}M`);
console.log(`\nRatio (calculated / expected): ${(totalCalculatedDeaths / totalExpectedDeaths).toFixed(2)}×`);

// Calculate birth rate for comparison
console.log('\n=== BIRTH VS DEATH COMPARISON ===\n');

const { getRegionalHistoricalBirthRate } = require('@/simulation/engine/phases/BaselineMortalityPhase');

let totalExpectedBirths = 0;

for (const region of regions) {
  const historicalCBR = getRegionalHistoricalBirthRate(region.name, 1990);
  const birthRate = historicalCBR / 1000;
  const monthlyBirths = region.population * birthRate / 12;
  totalExpectedBirths += monthlyBirths;
}

const globalBirthRate = (totalExpectedBirths / totalPopulation) * 12;
const globalNetGrowth = globalBirthRate - globalExpectedDeathRate;

console.log(`Global birth rate (historical): ${(globalBirthRate * 100).toFixed(2)}%/yr`);
console.log(`Global death rate (historical): ${(globalExpectedDeathRate * 100).toFixed(2)}%/yr`);
console.log(`Expected net growth: ${(globalNetGrowth * 100).toFixed(2)}%/yr`);
console.log(`\nTarget (1990-2000): 1.5%/yr`);
console.log(`Match: ${Math.abs(globalNetGrowth * 100 - 1.5) < 0.2 ? '✅' : '❌'}`);

console.log('\n=== DIAGNOSIS ===\n');

if (totalCalculatedDeaths / totalExpectedDeaths > 1.1) {
  console.log('❌ PROBLEM FOUND: Calculated death rate is TOO HIGH');
  console.log(`   Death rate multiplier: ${(totalCalculatedDeaths / totalExpectedDeaths).toFixed(2)}×`);
  console.log(`   This would reduce growth from ${(globalNetGrowth * 100).toFixed(2)}% to ${((globalBirthRate - globalCalculatedDeathRate) * 100).toFixed(2)}%`);
  console.log('\n🔧 RECOMMENDED FIX:');
  console.log('   In regionalPopulations.ts, add direct historical CDR mode (parallel to birth rate fix):');
  console.log('   if (state.config.scenarioMode === "historical" && skipScaling) {');
  console.log('     const historicalCDR = getRegionalHistoricalDeathRate(region.name, actualYear);');
  console.log('     region.adjustedDeathRate = historicalCDR / 1000;');
  console.log('   }');
} else if (totalCalculatedDeaths / totalExpectedDeaths < 0.9) {
  console.log('❌ PROBLEM FOUND: Calculated death rate is TOO LOW');
  console.log(`   Death rate multiplier: ${(totalCalculatedDeaths / totalExpectedDeaths).toFixed(2)}×`);
} else {
  console.log('✅ Death rates match historical expectations');
  console.log('   Problem must be elsewhere in the population dynamics chain');
}

console.log('\n=== END INVESTIGATION ===\n');
