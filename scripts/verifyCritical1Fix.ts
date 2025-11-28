#!/usr/bin/env tsx
/**
 * Verify CRITICAL-1 fix: environmentalHealth NaN crash
 *
 * Tests the two seeds that crashed before fix (28183, 36102)
 * plus 3 additional random seeds to verify stability.
 *
 * Expected: All runs complete without NaN crashes
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const PROBLEM_SEEDS = [28183, 36102];  // Seeds that crashed before fix
const RANDOM_SEEDS = [42, 12345, 99999];  // Additional validation
const ALL_SEEDS = [...PROBLEM_SEEDS, ...RANDOM_SEEDS];

console.log(`\n=== CRITICAL-1 Fix Verification ===`);
console.log(`Testing ${ALL_SEEDS.length} seeds (including 2 that crashed before fix)`);
console.log(`Expected: All runs complete without NaN crashes\n`);

let crashes = 0;
let successes = 0;

for (const seed of ALL_SEEDS) {
  const wasProblemSeed = PROBLEM_SEEDS.includes(seed);
  const label = wasProblemSeed ? '🔴 PROBLEM SEED' : '🟢 RANDOM SEED';

  console.log(`\n[${label}] Testing seed ${seed}...`);

  try {
    const engine = new SimulationEngine({ seed, maxMonths: 150 });
    const seededRandom = new SeededRandom(seed);
    const rng = () => seededRandom.next();
    let state = createDefaultInitialState(rng);

    // Run simulation with NaN check callback
    let nanDetected = false;

    state = engine.run(state, {
      maxMonths: 150,
      logLevel: 'error',  // Suppress normal logs
      onMonthEnd: (monthState) => {
        // Check for NaN in environmentalHealth calculation inputs
        const reserves = monthState.environmentalAccumulation?.resourceReserves;
        if (reserves !== undefined && isNaN(reserves)) {
          nanDetected = true;
        }
      }
    });

    // Check final state
    const reserves = state.environmentalAccumulation?.resourceReserves;

    if (nanDetected || (reserves !== undefined && isNaN(reserves))) {
      console.log(`  ❌ FAILED: resourceReserves = NaN at Month ${state.currentMonth}`);
      crashes++;
    } else {
      console.log(`  ✅ PASSED: Completed ${state.currentMonth} months, resourceReserves = ${reserves?.toFixed(4) ?? 'N/A'}`);
      successes++;
    }
  } catch (error: any) {
    const message = error.message || error.toString();

    if (message.includes('NaN') || message.includes('environmentalHealth')) {
      console.log(`  ❌ FAILED: ${message.split('\n')[0]}`);
      crashes++;
    } else {
      // Different error - re-throw
      throw error;
    }
  }
}

console.log(`\n=== Results ===`);
console.log(`✅ Successes: ${successes}/${ALL_SEEDS.length}`);
console.log(`❌ Crashes:   ${crashes}/${ALL_SEEDS.length}`);

if (crashes === 0) {
  console.log(`\n🎉 CRITICAL-1 FIX VERIFIED: All seeds complete successfully!`);
  console.log(`   Before fix: 2/2 problem seeds crashed (100%)`);
  console.log(`   After fix:  0/2 problem seeds crashed (0%)`);
  process.exit(0);
} else {
  console.log(`\n💥 REGRESSION: ${crashes} seeds still crashing!`);
  process.exit(1);
}
