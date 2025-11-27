/**
 * Quick validation script for Phase 10 carbon sink calibration fix
 *
 * Tests 1990-2010 hindcast with strengthened sink values (ocean: 8.1→12.2, land: 5.1→13.1)
 * Target: CO2 error <5% at checkpoints, airborne fraction ~45%
 *
 * Run: npx tsx scripts/testCarbonSinkCalibration.ts
 */

import { createInitialState } from '../src/simulation/historicalInitialization';
import { runSimulation } from '../src/simulation/runSimulation';

console.log('\n=== Phase 10 Carbon Sink Calibration Test ===');
console.log('Testing: 1990-2010 hindcast with empirically calibrated sinks');
console.log('Target: CO2 <5% error, airborne fraction ~45%\n');

// Initialize at 1990 with historical emissions mode
const state = createInitialState(1990, {
  historicalEmissionsMode: true,
  startYear: 1990,
  seed: 12345
});

console.log(`Initial state: Year 1990, CO2 ${state.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm\n`);

// Run simulation for 20 years (1990-2010)
const finalState = runSimulation(state, 240, () => 0.5);  // 240 months = 20 years

console.log(`\n=== Final Results ===`);
console.log(`Year: ${1990 + Math.floor(finalState.currentMonth / 12)}`);
console.log(`CO2: ${finalState.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm`);
console.log(`Target: 390 ppm`);
console.log(`Error: ${((finalState.resourceEconomy.co2.atmosphericCO2 - 390) / 390 * 100).toFixed(2)}%`);
console.log(`Status: ${Math.abs((finalState.resourceEconomy.co2.atmosphericCO2 - 390) / 390) < 0.05 ? '✅ PASS' : '❌ FAIL'}`);

// Validation checkpoints
const checkpoints = [
  { year: 1990, target: 354 },
  { year: 1995, target: 361 },
  { year: 2000, target: 369 },
  { year: 2005, target: 380 },
  { year: 2010, target: 390 }
];

console.log('\n=== Checkpoint Analysis ===');
console.log('Note: Check logs above for actual values at each checkpoint');
console.log('Expected airborne fraction: ~45% (will be logged during simulation)');
