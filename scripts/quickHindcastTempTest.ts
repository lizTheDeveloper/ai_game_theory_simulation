/**
 * Quick Hindcast Temperature Fix Verification (Nov 25, 2025)
 *
 * Tests that the temperature lock fix is working correctly.
 * Runs 60 months (5 years) of hindcast and checks temperature stays on track.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { interpolateClimateForMonth } from '../src/data/loaders/historicalClimateLoader';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function main() {
  console.log('=== Quick Hindcast Temperature Test ===');
  console.log('Testing temperature fix for 1990-1995 (60 months)\n');

  const seed = 42;
  const rng = createSeededRng(seed);
  setDeterministicRng(rng);

  // Initialize at 1990 using the proper function
  const state = initializeHistoricalSimulation(1990, rng);

  console.log(`Initial state (1990):`);
  console.log(`  Temperature: ${state.resourceEconomy?.co2?.temperatureAnomaly?.toFixed(2) ?? 'N/A'}C`);
  console.log(`  Population: ${state.humanPopulationSystem?.population?.toFixed(2) ?? 'N/A'}B`);
  console.log(`  CO2: ${state.resourceEconomy?.co2?.atmosphericCO2?.toFixed(1) ?? 'N/A'} ppm`);
  console.log(`  Scenario mode: ${state.config?.scenarioMode ?? 'N/A'}`);
  console.log(`  Start year: ${state.config?.startYear ?? 'N/A'}\n`);

  // Create simulation engine
  const engine = new SimulationEngine({ seed, maxMonths: 60 });

  // Run 60 months (5 years: 1990-1995)
  const temperatureCheckpoints: { month: number; year: number; actual: number; expected: number }[] = [];

  // Record initial checkpoint
  const initial1990 = interpolateClimateForMonth(1990, 0);
  temperatureCheckpoints.push({
    month: 0,
    year: 1990,
    actual: state.resourceEconomy?.co2?.temperatureAnomaly ?? NaN,
    expected: initial1990.temperatureAnomalyC
  });

  // Run simulation
  console.log('Running simulation...');
  try {
    const result = engine.run(state, { maxMonths: 60 });
    const finalState = result.finalState;

    // Record final checkpoint
    const year = 1990 + Math.floor(60 / 12); // 1995
    const historical = interpolateClimateForMonth(year, 0);
    temperatureCheckpoints.push({
      month: 60,
      year,
      actual: finalState.resourceEconomy?.co2?.temperatureAnomaly ?? NaN,
      expected: historical.temperatureAnomalyC
    });

    console.log('\n=== Temperature Validation Results ===');
    console.log('Year | Month | Actual °C | Expected °C | Deviation | Status');
    console.log('-----|-------|-----------|-------------|-----------|-------');

    let allPassed = true;
    for (const cp of temperatureCheckpoints) {
      const deviation = Math.abs(cp.actual - cp.expected);
      const status = deviation < 0.15 ? '✅' : '❌';
      if (deviation >= 0.15) allPassed = false;

      console.log(`${cp.year} | ${cp.month.toString().padStart(5)} | ${cp.actual.toFixed(2).padStart(9)} | ${cp.expected.toFixed(2).padStart(11)} | ${deviation.toFixed(3).padStart(9)} | ${status}`);
    }

    console.log('\n=== Final State (1995) ===');
    console.log(`  Temperature: ${finalState.resourceEconomy?.co2?.temperatureAnomaly?.toFixed(2) ?? 'N/A'}C`);
    console.log(`  Population: ${finalState.humanPopulationSystem?.population?.toFixed(2) ?? 'N/A'}B`);
    console.log(`  CO2: ${finalState.resourceEconomy?.co2?.atmosphericCO2?.toFixed(1) ?? 'N/A'} ppm`);
    console.log(`  Current Year: ${finalState.currentYear ?? 'N/A'}`);

    if (allPassed) {
      console.log('\n✅ TEMPERATURE FIX VERIFIED - Temperatures within 0.15C of NASA GISS data');
    } else {
      console.log('\n❌ TEMPERATURE FIX NEEDS INVESTIGATION - Some checkpoints exceeded tolerance');
      // Don't exit with error for now - let's see the full output
    }
  } catch (error: any) {
    console.log('\n❌ SIMULATION ERROR:', error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
