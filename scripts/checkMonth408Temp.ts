#!/usr/bin/env tsx
/**
 * Quick diagnostic: Check temperature at Month 408 (2024) in hindcast
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

async function main() {
  const seed = 19900102;
  const rng = createSeededRng(seed);

  // Initialize 1990 state
  const state = await initializeHistoricalSimulation(1990, rng);

  // Create engine
  const engine = new SimulationEngine({ seed });
  setDeterministicRng(rng);

  // Set state (use internal method - engine doesn't have public initialize)
  (engine as any).state = state;

  console.log('Running 408 months (1990 → 2024)...');

  // Run to month 408
  for (let i = 0; i < 408; i++) {
    engine.step();

    // Log temperature every 12 months
    if (i % 12 === 11) {
      const currentState = engine.getState();
      const year = 1990 + Math.floor((i + 1) / 12);
      const temp = currentState.resourceEconomy.co2.temperatureAnomaly;
      const co2 = currentState.resourceEconomy.co2.atmosphericCO2;
      console.log(`  Year ${year}: Temp ${temp.toFixed(2)}°C, CO2 ${co2.toFixed(1)} ppm`);
    }
  }

  const finalState = engine.getState();
  console.log('\n=== Final State (2024, Month 408) ===');
  console.log(`  config.scenarioMode: ${finalState.config.scenarioMode}`);
  console.log(`  config.startYear: ${finalState.config.startYear}`);
  console.log(`  currentMonth: ${finalState.currentMonth}`);
  console.log(`  currentYear (calculated): ${finalState.config.startYear! + Math.floor(finalState.currentMonth / 12)}`);
  console.log(`  resourceEconomy.co2.temperatureAnomaly: ${finalState.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
  console.log(`  resourceEconomy.co2.atmosphericCO2: ${finalState.resourceEconomy.co2.atmosphericCO2.toFixed(1)} ppm`);
  console.log(`\n=== Expected (NASA GISS 2024) ===`);
  console.log(`  Temperature: 1.28°C`);
  console.log(`  CO2: 424.6 ppm`);
  console.log(`\n=== Error ===`);
  const error = ((finalState.resourceEconomy.co2.temperatureAnomaly - 1.28) / 1.28 * 100).toFixed(1);
  console.log(`  Temperature error: ${error}%`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
