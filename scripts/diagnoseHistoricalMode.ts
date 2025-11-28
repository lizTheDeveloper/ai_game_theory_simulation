#!/usr/bin/env tsx
/**
 * Diagnostic script to check why historical temperature interpolation isn't working
 *
 * HIGH-6: Temperature overestimation (+64% error) - diagnose root cause
 *
 * Expected: Historical mode should lock temperature to NASA GISS interpolated values
 * Observed: Temperature shows 2.10°C at 2024 instead of 1.28°C (all 10 runs identical)
 *
 * This script initializes a hindcast and checks config state at Month 0
 */

import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import type { RNGFunction } from '../src/types/config';

async function main() {
  console.log('=== HIGH-6 Diagnostic: Historical Mode Temperature Bug ===\n');

  const seed = 19900102;
  const startYear = 1990;

  // Create engine with seed
  const engine = new SimulationEngine({ seed });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

  // Initialize historical state
  console.log(`Initializing historical state for year ${startYear}...`);
  const state = await createHistoricalInitialState({
    year: startYear,
    rng,
  });

  // Check config values
  console.log('\n=== Config State (Month 0) ===');
  console.log(`  config.scenarioMode: ${state.config.scenarioMode}`);
  console.log(`  config.startYear: ${state.config.startYear}`);
  console.log(`  config.historicalMode: ${state.config.historicalMode}`);
  console.log(`  config.historicalEmissionsMode: ${state.config.historicalEmissionsMode}`);

  // Check CO2 system
  console.log('\n=== CO2 System State (Month 0) ===');
  console.log(`  atmosphericCO2: ${state.resourceEconomy.co2.atmosphericCO2} ppm`);
  console.log(`  temperatureAnomaly: ${state.resourceEconomy.co2.temperatureAnomaly}°C`);
  console.log(`  climateSensitivity (ECS): ${state.resourceEconomy.co2.climateSensitivity}°C`);
  if (state.uncertaintyParameters?.equilibriumClimateSensitivity !== undefined) {
    console.log(`  uncertaintyParameters.ECS: ${state.uncertaintyParameters.equilibriumClimateSensitivity}°C`);
  }
  console.log(`  historicalTemperatureTarget: ${state.resourceEconomy.co2.historicalTemperatureTarget ?? 'undefined'}`);

  // Calculate expected equilibrium
  const co2Ratio = state.resourceEconomy.co2.atmosphericCO2 / 280;
  const co2Doublings = Math.log2(co2Ratio);
  const effectiveECS = state.uncertaintyParameters?.equilibriumClimateSensitivity ?? state.resourceEconomy.co2.climateSensitivity;
  const equilibriumTemp = co2Doublings * effectiveECS;

  console.log('\n=== Equilibrium Calculation ===');
  console.log(`  CO2 ratio: ${co2Ratio.toFixed(3)} (${state.resourceEconomy.co2.atmosphericCO2} / 280)`);
  console.log(`  CO2 doublings: ${co2Doublings.toFixed(3)}`);
  console.log(`  Effective ECS: ${effectiveECS.toFixed(2)}°C`);
  console.log(`  Equilibrium temp: ${equilibriumTemp.toFixed(3)}°C`);

  console.log('\n=== Expected Historical Values (1990) ===');
  console.log(`  NASA GISS 1990: 0.45°C (actual observation)`);
  console.log(`  Simulated Month 0: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
  console.log(`  Error: ${((state.resourceEconomy.co2.temperatureAnomaly - 0.45) * 100 / 0.45).toFixed(1)}%`);

  // Run one step to see what happens
  console.log('\n=== Stepping to Month 1 ===');
  engine.initialize(state);
  engine.step();
  const state1 = engine.getState();

  console.log(`  Month 1 temperature: ${state1.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}°C`);
  console.log(`  Current year: ${state1.currentYear}`);
  console.log(`  Current month counter: ${state1.currentMonth}`);

  // Check the condition that should trigger historical interpolation
  const currentYear = state1.config.startYear! + Math.floor(state1.currentMonth / 12);
  const HISTORICAL_DATA_END_YEAR = 2024;

  console.log('\n=== Historical Interpolation Condition Check ===');
  console.log(`  config.scenarioMode === 'historical': ${state1.config.scenarioMode === 'historical'}`);
  console.log(`  config.startYear: ${state1.config.startYear}`);
  console.log(`  currentMonth: ${state1.currentMonth}`);
  console.log(`  Calculated currentYear: ${currentYear}`);
  console.log(`  currentYear <= 2024: ${currentYear <= HISTORICAL_DATA_END_YEAR}`);
  console.log(`  SHOULD use historical interpolation: ${state1.config.scenarioMode === 'historical' && state1.config.startYear !== undefined && currentYear <= HISTORICAL_DATA_END_YEAR}`);

  console.log('\n=== Diagnosis Complete ===');
}

main().catch((err) => {
  console.error('❌ Diagnostic failed:', err);
  process.exit(1);
});
