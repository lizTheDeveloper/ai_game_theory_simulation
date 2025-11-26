#!/usr/bin/env tsx
/**
 * Test CRITICAL-1: environmentalHealth NaN crash with specific seeds
 *
 * Runs the 3 failing seeds identified by Priya: 28183, 36102, 75696
 * Expected crash at Month 142-146
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const FAILING_SEEDS = [28183, 36102, 75696];
const MAX_MONTHS = 150;

console.log(`\n=== CRITICAL-1 Validation: environmentalHealth NaN ===`);
console.log(`Testing ${FAILING_SEEDS.length} seeds that crashed in Priya's validation`);
console.log(`Expected crash point: Month 142-146\n`);

let crashCount = 0;
let successCount = 0;

for (const seed of FAILING_SEEDS) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing seed ${seed}...`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    const engine = new SimulationEngine({
      seed,
      maxMonths: MAX_MONTHS,
      logLevel: 'error' // Only show errors to reduce noise
    });

    const initialState = createDefaultInitialState(seed);
    const finalState = engine.runSimulation(initialState);

    console.log(`✅ Seed ${seed}: Completed successfully (${finalState.currentMonth} months)`);
    successCount++;

  } catch (error: any) {
    console.log(`\n❌ Seed ${seed}: CRASHED`);
    console.log(`Error: ${error.message}`);
    if (error.stack) {
      console.log(`Stack trace:\n${error.stack}`);
    }
    crashCount++;
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`SUMMARY:`);
console.log(`  Total seeds tested: ${FAILING_SEEDS.length}`);
console.log(`  Crashes: ${crashCount}`);
console.log(`  Successes: ${successCount}`);

if (crashCount === 0) {
  console.log(`\n✅ All seeds completed successfully - bug may already be fixed!`);
  console.log(`Enhanced assertions in BifurcationLogicPhase may have caught the issue.`);
} else {
  console.log(`\n💥 Crashes detected - review errors above for root cause`);
}
