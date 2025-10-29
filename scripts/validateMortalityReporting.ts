/**
 * Validation script to confirm mortality reporting fix
 *
 * Tests that reported deaths are always less than starting population
 * and that units are consistent (millions, not billions mislabeled as millions)
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { addMortalityRisk, resolveMortality } from '../src/simulation/bayesianMortality';
import { logDeathSummary } from '../src/simulation/populationDynamics';

console.log('\n=== Mortality Reporting Validation ===\n');

const state = createDefaultInitialState();
const rng = () => 0.5;

const initialPopulation = state.humanPopulationSystem.population;
const initialPopulationMillions = initialPopulation * 1000;

console.log(`Initial population: ${initialPopulation.toFixed(3)}B = ${initialPopulationMillions.toFixed(1)}M\n`);

// Test 1: Small mortality (0.5% x 10 months = ~5% total)
console.log('TEST 1: 10 months of 0.5% monthly mortality');
for (let month = 1; month <= 10; month++) {
  addMortalityRisk(state.humanPopulationSystem, {
    type: 'famine',
    baseRisk: 0.005,
    proximate: 'famine',
    root: 'ecosystem',
    description: `Month ${month} famine`,
    confidence: 'HIGH',
    scope: 'GLOBAL',
    month
  });
  resolveMortality(state, rng);
}

const deaths1 = state.humanPopulationSystem.cumulativeCrisisDeaths;
const finalPop1 = state.humanPopulationSystem.population;
const actualLoss1 = (initialPopulation - finalPop1) * 1000; // in millions

console.log(`  Cumulative deaths: ${deaths1.toFixed(1)}M`);
console.log(`  Actual population lost: ${actualLoss1.toFixed(1)}M`);
console.log(`  Final population: ${finalPop1.toFixed(3)}B\n`);

// Validation checks
let allPassed = true;

if (deaths1 > initialPopulationMillions) {
  console.log(`❌ FAIL: Reported deaths (${deaths1.toFixed(1)}M) > starting population (${initialPopulationMillions.toFixed(1)}M)`);
  console.log(`   This indicates the bug is NOT fixed - deaths are in billions mislabeled as millions!`);
  allPassed = false;
} else {
  console.log(`✅ PASS: Deaths (${deaths1.toFixed(1)}M) < starting population (${initialPopulationMillions.toFixed(1)}M)`);
}

if (Math.abs(deaths1 - actualLoss1) < 1.0) {
  console.log(`✅ PASS: Reported deaths match actual population loss`);
} else {
  console.log(`❌ FAIL: Mismatch between reported (${deaths1.toFixed(1)}M) and actual (${actualLoss1.toFixed(1)}M)`);
  allPassed = false;
}

const expectedDeathPct = 5.0; // ~5% over 10 months at 0.5% monthly
const actualDeathPct = (deaths1 / initialPopulationMillions) * 100;
if (actualDeathPct > 0.1 && actualDeathPct < 15) {
  console.log(`✅ PASS: Death percentage (${actualDeathPct.toFixed(1)}%) is reasonable`);
} else {
  console.log(`❌ FAIL: Death percentage (${actualDeathPct.toFixed(1)}%) seems wrong (expected ~${expectedDeathPct}%)`);
  allPassed = false;
}

// Test 2: Check logDeathSummary output
console.log(`\n--- Calling logDeathSummary() ---`);
const logOutputStart = '\n=== MULTI-DIMENSIONAL DEATH SUMMARY ===\n';
console.log('(Check that "Total crisis deaths" line shows millions, not billions)\n');

// Capture console output
const originalLog = console.log;
const loggedLines: string[] = [];
console.log = (...args: any[]) => {
  const line = args.join(' ');
  loggedLines.push(line);
  originalLog(...args);
};

logDeathSummary(state);

console.log = originalLog;

// Check if "Total crisis deaths" line is reasonable
const deathLine = loggedLines.find(l => l.includes('Total crisis deaths:'));
if (deathLine) {
  const match = deathLine.match(/(\d+(\.\d+)?)M/);
  if (match) {
    const reportedDeaths = parseFloat(match[1]);
    if (reportedDeaths < initialPopulationMillions) {
      console.log(`\n✅ PASS: logDeathSummary reports ${reportedDeaths}M (reasonable)`);
    } else {
      console.log(`\n❌ FAIL: logDeathSummary reports ${reportedDeaths}M (>= starting pop!)`);
      allPassed = false;
    }
  }
}

console.log(`\n${'='.repeat(60)}`);
if (allPassed) {
  console.log('✅ ALL TESTS PASSED - Mortality reporting fix is working!');
} else {
  console.log('❌ SOME TESTS FAILED - Bug may still exist');
}
console.log('='.repeat(60));
