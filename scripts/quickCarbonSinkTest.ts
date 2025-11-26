/**
 * Quick Carbon Sink Test (Nov 26, 2025)
 *
 * Tests carbon sink parameter fix for 1990-2010 hindcast.
 * Runs a single simulation from 1990 to 2010 (240 months) and reports CO2.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function runQuickTest() {
  console.log('\n=== QUICK CARBON SINK TEST ===\n');
  console.log('Testing 1990 carbon sink parameters:');
  console.log('  Ocean: 8.1 GtCO2/yr (vs 10 GtCO2/yr 2025 default)');
  console.log('  Land: 5.1 GtCO2/yr (vs 11 GtCO2/yr 2025 default)');
  console.log('  Saturation: 0.12 (vs 0.30 2025 default)');
  console.log('');
  console.log('Target: CO2 at 2010 should be ~390 ppm (was 549 ppm with bug)\n');

  const seed = 12345;
  const rng = createSeededRng(seed);
  setDeterministicRng(rng);

  console.log('Initializing 1990 state...');
  const state = initializeHistoricalSimulation(1990, rng);

  console.log(`Initial CO2: ${state.resourceEconomy?.co2?.atmosphericCO2?.toFixed(1)} ppm`);
  console.log(`Initial sink capacity: ${(state.resourceEconomy?.co2?.oceanAbsorption ?? 0) + (state.resourceEconomy?.co2?.landAbsorption ?? 0)} GtCO2/yr\n`);

  console.log('Running simulation to 2010 (240 months)...');
  const engine = new SimulationEngine({ seed, maxMonths: 240 });
  const result = engine.run(state, { maxMonths: 240 });
  const finalState = result.finalState;

  console.log('\n=== RESULTS ===\n');
  console.log(`Final Year: ${finalState.currentYear}`);
  console.log(`Final Month: ${finalState.currentMonth}`);
  console.log(`Final CO2: ${finalState.resourceEconomy?.co2?.atmosphericCO2?.toFixed(1)} ppm`);
  console.log(`Final Population: ${finalState.humanPopulationSystem?.population?.toFixed(2)}B`);
  console.log(`Final QoL: ${finalState.globalMetrics?.qualityOfLife?.toFixed(3)}`);

  const finalCO2 = finalState.resourceEconomy?.co2?.atmosphericCO2 ?? 0;
  const targetCO2 = 390;
  const error = Math.abs(finalCO2 - targetCO2);
  const relError = (error / targetCO2) * 100;

  console.log(`\nValidation:`);
  console.log(`  Target CO2 (2010): ${targetCO2} ppm`);
  console.log(`  Simulated CO2: ${finalCO2.toFixed(1)} ppm`);
  console.log(`  Absolute Error: ${error.toFixed(1)} ppm`);
  console.log(`  Relative Error: ${relError.toFixed(1)}%`);

  if (relError < 15) {
    console.log(`  ✅ PASS: Within 15% tolerance`);
  } else {
    console.log(`  ❌ FAIL: Exceeds 15% tolerance`);
  }
}

runQuickTest().catch(console.error);
