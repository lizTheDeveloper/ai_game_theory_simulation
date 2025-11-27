/**
 * Test AerosolForcingPhase behavior in hindcast vs projection mode
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

async function test() {
  console.log('\n=== AEROSOL PHASE TEST ===\n');

  // Test 1: Hindcast mode (1990-2024)
  console.log('Test 1: Hindcast Mode (1990)');
  const rng1 = createSeededRng(19900101);
  setDeterministicRng(rng1);
  const state1 = initializeHistoricalSimulation(1990, rng1);

  console.log(`  config.scenarioMode: ${state1.config.scenarioMode}`);
  console.log(`  config.startYear: ${state1.config.startYear}`);
  console.log(`  Initial temp (resourceEconomy): ${state1.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
  console.log(`  Initial temp (boundary): ${state1.planetaryBoundariesSystem.boundaries.climate_change.currentValue.toFixed(2)}`);

  // Run 12 months
  const engine1 = new SimulationEngine(state1, rng1);
  for (let i = 0; i < 12; i++) {
    engine1.step();
  }

  console.log(`  After 12 months:`);
  console.log(`    Temp (resourceEconomy): ${state1.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
  console.log(`    Temp (boundary): ${state1.planetaryBoundariesSystem.boundaries.climate_change.currentValue.toFixed(2)}`);
  console.log(`    Current year: ${state1.currentYear}`);

  // Test 2: Run to 2024
  console.log(`\nTest 2: Hindcast to 2024`);
  const rng2 = createSeededRng(19900102);
  setDeterministicRng(rng2);
  const state2 = initializeHistoricalSimulation(1990, rng2);

  const engine2 = new SimulationEngine(state2, rng2);
  const monthsTo2024 = (2024 - 1990) * 12;  // 408 months

  for (let i = 0; i < monthsTo2024; i++) {
    engine2.step();
    if (i % 120 === 0) {
      const year = 1990 + Math.floor(i / 12);
      console.log(`    Year ${year}: ${state2.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
    }
  }

  console.log(`  Final (2024):`);
  console.log(`    Temp (resourceEconomy): ${state2.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
  console.log(`    Temp (boundary): ${state2.planetaryBoundariesSystem.boundaries.climate_change.currentValue.toFixed(2)}`);
  console.log(`    Expected: 1.28°C (NASA GISS 2024)`);
  console.log(`    Error: ${((state2.resourceEconomy.co2.temperatureAnomaly - 1.28) / 1.28 * 100).toFixed(1)}%`);

  console.log('\n=== TEST COMPLETE ===\n');
}

test().catch(console.error);
