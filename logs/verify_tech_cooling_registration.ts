#!/usr/bin/env tsx
/**
 * Verify TechCoolingPhase is properly registered and applying cooling
 * CRITICAL FIX (Nov 27, 2025): Phase was missing from engine.ts registration
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine.js';
import { createDefaultInitialState } from '../src/simulation/initialization.js';

console.log('\n=== TechCoolingPhase Registration Verification ===\n');

// Initialize engine
const seed = 12345;
const engine = new SimulationEngine({ seed });
const rng = new SeededRandom(seed);

// Create initial state
const initialState = createDefaultInitialState(() => rng.next(), 'historical');

// Set up a scenario where cooling should be applied
initialState.technologyEffects.coolingFromGeoengineering = 0.5; // 0.5°C cooling
initialState.resourceEconomy.co2.temperatureAnomaly = 1.5;      // 1.5°C warming

console.log('📊 Initial State:');
console.log(`  CO2 Temperature Anomaly: ${initialState.resourceEconomy.co2.temperatureAnomaly.toFixed(3)}°C`);
console.log(`  Geoengineering Cooling: ${initialState.technologyEffects.coolingFromGeoengineering.toFixed(3)}°C`);

// Run one step
const result = engine.step(initialState);

console.log('\n📊 After Step:');
console.log(`  CO2 Temperature Anomaly: ${result.state.resourceEconomy.co2.temperatureAnomaly.toFixed(3)}°C`);
console.log(`  Geoengineering Cooling: ${result.state.technologyEffects.coolingFromGeoengineering.toFixed(3)}°C`);

// Calculate expected vs actual
const expectedTemp = Math.max(0, 1.5 - 0.5); // Should be ~1.0°C (clamped to 0)
const actualTemp = result.state.resourceEconomy.co2.temperatureAnomaly;
const delta = Math.abs(actualTemp - expectedTemp);

console.log('\n✅ Verification:');
console.log(`  Expected Temperature: ~${expectedTemp.toFixed(3)}°C`);
console.log(`  Actual Temperature: ${actualTemp.toFixed(3)}°C`);
console.log(`  Delta: ${delta.toFixed(3)}°C`);

if (delta > 0.1) {
  console.log('\n❌ FAILURE: Cooling not applied correctly');
  console.log('   TechCoolingPhase may not be executing properly');
  process.exit(1);
} else {
  console.log('\n✅ SUCCESS: TechCoolingPhase is registered and applying cooling');
  process.exit(0);
}
