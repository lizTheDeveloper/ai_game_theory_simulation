/**
 * Test Nuclear Winter Effects
 *
 * Validates that nuclear winter implementation matches research parameters:
 * - Robock et al. (2019): 100 warheads → 2B deaths over 5-10 years
 * - Coupe et al. (2019): Soot injection scaling
 * - Xia et al. (2022): Agricultural collapse timescales
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { triggerNuclearWinter, updateNuclearWinter } from '../src/simulation/nuclearWinter';

console.log('\n=== NUCLEAR WINTER TEST ===\n');

// Test 1: 100-warhead scenario (India-Pakistan scale)
console.log('TEST 1: 100-Warhead Scenario (Robock et al. 2019)');
console.log('Expected: ~2B deaths from famine over 5-10 years\n');

const state = createDefaultInitialState('historical');

// Trigger 100-warhead nuclear exchange
const warScale = 100;
const targetCountries = ['India', 'Pakistan'];

console.log(`Triggering nuclear winter: ${warScale} warheads`);
console.log(`Initial population: ${(state.humanPopulationSystem.population * 1000).toFixed(1)}M`);

triggerNuclearWinter(state, warScale, targetCountries);

const winter = state.nuclearWinterState;
console.log(`\nNuclear Winter State:`);
console.log(`  Soot injected: ${winter.sootInStratosphere.toFixed(2)} Tg (expected: 5 Tg)`);
console.log(`  Temperature drop: ${winter.temperatureAnomaly.toFixed(2)}°C (expected: -1.5°C to -3°C)`);
console.log(`  Crop yield: ${(winter.cropYieldMultiplier * 100).toFixed(1)}% (expected: 80-90%)`);
console.log(`  Initial starvation rate: ${(winter.monthlyStarvationRate * 100).toFixed(2)}%/month`);

// Simulate 10 years (120 months)
console.log(`\n=== Simulating 10 years (120 months) ===\n`);

const checkpoints = [6, 12, 24, 36, 48, 60, 84, 120];
let checkpointIndex = 0;

for (let month = 1; month <= 120; month++) {
  state.currentMonth = month;
  updateNuclearWinter(state);

  // Log at checkpoints
  if (checkpointIndex < checkpoints.length && month === checkpoints[checkpointIndex]) {
    const population = state.humanPopulationSystem.population;
    const deaths = state.humanPopulationSystem.totalDeaths;
    const winterDeaths = winter.totalWinterDeaths;

    console.log(`\nMonth ${month} (${(month / 12).toFixed(1)} years):`);
    console.log(`  Population: ${(population * 1000).toFixed(1)}M (deaths: ${(deaths * 1000).toFixed(1)}M)`);
    console.log(`  Nuclear winter deaths: ${(winterDeaths * 1000).toFixed(1)}M`);
    console.log(`  Soot remaining: ${winter.currentSoot.toFixed(2)} Tg`);
    console.log(`  Temperature: ${winter.temperatureAnomaly.toFixed(2)}°C`);
    console.log(`  Crop yield: ${(winter.cropYieldMultiplier * 100).toFixed(1)}%`);
    console.log(`  Starvation rate: ${(winter.monthlyStarvationRate * 100).toFixed(2)}%/month`);
    console.log(`  Active: ${winter.active ? 'YES' : 'NO'}`);

    checkpointIndex++;
  }
}

// Final summary
console.log(`\n=== FINAL RESULTS ===\n`);
const totalDeaths = winter.totalWinterDeaths + winter.totalRadiationDeaths;
console.log(`Total nuclear winter deaths: ${(totalDeaths * 1000).toFixed(1)}M`);
console.log(`  - Starvation: ${(winter.totalWinterDeaths * 1000).toFixed(1)}M`);
console.log(`  - Radiation: ${(winter.totalRadiationDeaths * 1000).toFixed(1)}M`);
console.log(`\nExpected (Robock 2019): ~2000M deaths`);
console.log(`Actual: ${(totalDeaths * 1000).toFixed(1)}M`);
console.log(`Difference: ${((totalDeaths * 1000 - 2000) / 2000 * 100).toFixed(1)}%`);

// Validation
const deathsInBillions = totalDeaths;
const expectedDeaths = 2.0; // 2 billion
const tolerance = 0.5; // ±500M (25% tolerance)

if (Math.abs(deathsInBillions - expectedDeaths) <= tolerance) {
  console.log(`\n✅ PASS: Deaths within expected range (${expectedDeaths - tolerance}B - ${expectedDeaths + tolerance}B)`);
} else {
  console.log(`\n❌ FAIL: Deaths outside expected range (${expectedDeaths - tolerance}B - ${expectedDeaths + tolerance}B)`);
}

// Test 2: 1000-warhead scenario (regional nuclear war)
console.log(`\n\n=== TEST 2: 1000-Warhead Scenario ===`);
console.log('Expected: ~5B+ deaths, near-extinction event\n');

const state2 = createDefaultInitialState('historical');
triggerNuclearWinter(state2, 1000, ['United States', 'Russia', 'China', 'Europe']);

const winter2 = state2.nuclearWinterState;
console.log(`Soot injected: ${winter2.sootInStratosphere.toFixed(1)} Tg (expected: ~50 Tg)`);
console.log(`Temperature drop: ${winter2.temperatureAnomaly.toFixed(1)}°C (expected: -7°C)`);
console.log(`Crop yield: ${(winter2.cropYieldMultiplier * 100).toFixed(1)}% (expected: 30-50%)`);
console.log(`Initial starvation rate: ${(winter2.monthlyStarvationRate * 100).toFixed(2)}%/month (expected: >3%)`);

if (winter2.sootInStratosphere >= 45 && winter2.sootInStratosphere <= 55) {
  console.log(`✅ PASS: Soot injection within expected range`);
} else {
  console.log(`❌ FAIL: Soot injection outside expected range`);
}

if (winter2.temperatureAnomaly <= -6 && winter2.temperatureAnomaly >= -8) {
  console.log(`✅ PASS: Temperature drop within expected range`);
} else {
  console.log(`❌ FAIL: Temperature drop outside expected range`);
}

console.log(`\n=== TEST COMPLETE ===\n`);
