/**
 * Test hindcast birth rate fix (Nov 24, 2025)
 *
 * Verifies that population grows correctly from 1990 baseline using
 * UN WPP 2024 crude birth rates and crude death rates.
 *
 * Success criteria:
 * - Month 0 (1990): 5.30B
 * - Month 12 (1991): ~5.38B (+1.5% growth)
 * - Month 120 (2000): ~6.1B
 * - Month 240 (2010): ~6.9B
 * - Month 408 (2024): ~8.1B
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const seed = 42;

console.log('\n' + '='.repeat(80));
console.log('📊 HINDCAST BIRTH RATE TEST (1990-2000)');
console.log('='.repeat(80));
console.log(`Seed: ${seed}\n`);

// Create initial state with 1990 baseline
const tempEngine = new SimulationEngine(undefined as any, seed);
const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());

const historicalOverrides = {
  currentYear: 1990,
  currentMonth: 0,
  population: 5.33,  // 1990 UN WPP 2024 value
  co2Concentration: 354.4,
  temperatureAnomaly: 0.45,
};

const state = createDefaultInitialState(
  rng,
  'historical',
  undefined,
  undefined,
  undefined,
  undefined,
  historicalOverrides
);

console.log(`Initial state:`);
console.log(`  Year: ${state.currentYear}`);
console.log(`  Month: ${state.currentMonth}`);
console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(2)}B`);
console.log(`  CO2: ${state.globalMetrics.co2Concentration.toFixed(1)} ppm`);
console.log(`  Temp anomaly: ${state.globalMetrics.temperatureAnomaly.toFixed(2)}°C\n`);

// Run simulation for 120 months (10 years: 1990-2000)
const engine = new SimulationEngine(state, seed);
const maxMonths = 120;

console.log('Running hindcast simulation (1990-2000)...\n');

for (let month = 1; month <= maxMonths; month++) {
  engine.stepSimulation();

  // Log yearly milestones
  if (month % 12 === 0) {
    const year = 1990 + Math.floor(month / 12);
    const pop = engine.getState().humanPopulationSystem.population;
    console.log(`Year ${year} (Month ${month}): Population = ${pop.toFixed(2)}B`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('📊 HINDCAST RESULTS');
console.log('='.repeat(80));

const finalState = engine.getState();
const finalPop = finalState.humanPopulationSystem.population;

console.log(`\nFinal population (2000): ${finalPop.toFixed(2)}B`);
console.log(`Expected: ~6.15B (UN WPP 2024)`);
console.log(`Deviation: ${((finalPop - 6.15) / 6.15 * 100).toFixed(1)}%\n`);

const growth = ((finalPop - 5.33) / 5.33 * 100);
console.log(`Total growth (1990-2000): ${growth.toFixed(1)}%`);
console.log(`Expected: ~15.4% (UN WPP 2024)\n`);

if (Math.abs(finalPop - 6.15) < 0.1) {
  console.log('✅ SUCCESS: Population trajectory matches historical data!');
} else if (finalPop < 5.33) {
  console.log('❌ FAILURE: Population declined (births not working)');
} else if (finalPop < 6.05) {
  console.log('⚠️  WARNING: Population below expected (births too low or deaths too high)');
} else if (finalPop > 6.25) {
  console.log('⚠️  WARNING: Population above expected (births too high or deaths too low)');
} else {
  console.log('✅ ACCEPTABLE: Population within 2% of historical data');
}

console.log('='.repeat(80) + '\n');
