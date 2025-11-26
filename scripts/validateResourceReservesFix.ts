/**
 * Validate Resource Reserves Fix
 *
 * Quick verification that the CRITICAL-1 fix (Nov 26, 2025) prevents
 * resource reserves from going negative during hindcast validation.
 *
 * Tests the seeds that previously crashed:
 * - Seed 28183: Crashed at Month 146 with resourceReserves = -0.000226
 * - Seed 36102: Crashed at Month 142 with resourceReserves = -0.000748
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const CRASHED_SEEDS = [28183, 36102];
const PASSED_SEEDS = [12345, 20264, 44021];
const ALL_TEST_SEEDS = [...CRASHED_SEEDS, ...PASSED_SEEDS];

console.log('='.repeat(80));
console.log('RESOURCE RESERVES FIX VALIDATION');
console.log('='.repeat(80));
console.log();
console.log('Testing seeds that previously crashed (28183, 36102)');
console.log('Plus seeds that passed (12345, 20264, 44021)');
console.log();

let totalRuns = 0;
let successfulRuns = 0;
let failedRuns = 0;

for (const seed of ALL_TEST_SEEDS) {
  totalRuns++;
  const wasPreviouslyCrashed = CRASHED_SEEDS.includes(seed);

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`Seed ${seed} ${wasPreviouslyCrashed ? '(PREVIOUSLY CRASHED)' : '(previously passed)'}`);
  console.log(`${'─'.repeat(80)}`);

  try {
    const state = createDefaultInitialState();

    // Set hindcast mode (1990-2010)
    state.currentYear = 1990;
    state.currentMonth = 0;

    const engine = new SimulationEngine(state, seed);

    // Run 150 months (12.5 years) to get past the crash points (142-146)
    const maxMonths = 150;
    let crashed = false;
    let crashMonth = -1;
    let crashError = '';

    for (let month = 0; month < maxMonths; month++) {
      try {
        engine.step();

        // Check resourceReserves after each step
        const resourceReserves = state.environmentalAccumulation?.resourceReserves;

        if (resourceReserves !== undefined && resourceReserves < 0) {
          console.log(`❌ FAIL: resourceReserves went negative at Month ${month}: ${resourceReserves.toFixed(6)}`);
          crashed = true;
          crashMonth = month;
          crashError = `resourceReserves = ${resourceReserves.toFixed(6)} (NEGATIVE)`;
          break;
        }

        // Warn if getting close to 0
        if (resourceReserves !== undefined && resourceReserves < 0.01 && month % 12 === 0) {
          console.log(`   ⚠️ Month ${month}: resourceReserves low (${(resourceReserves * 100).toFixed(2)}%)`);
        }

      } catch (error: any) {
        crashed = true;
        crashMonth = month;
        crashError = error.message || String(error);
        console.log(`❌ CRASH at Month ${month}: ${crashError}`);
        break;
      }
    }

    if (crashed) {
      failedRuns++;
      console.log();
      console.log(`❌ FAILED: Seed ${seed} crashed at Month ${crashMonth}`);
      console.log(`   Error: ${crashError}`);

      if (wasPreviouslyCrashed) {
        console.log(`   ⚠️ This seed STILL crashes (fix didn't work for this case)`);
      } else {
        console.log(`   🚨 REGRESSION: This seed used to PASS but now CRASHES!`);
      }
    } else {
      successfulRuns++;
      const finalResourceReserves = state.environmentalAccumulation?.resourceReserves ?? -1;
      console.log();
      console.log(`✅ SUCCESS: Seed ${seed} completed ${maxMonths} months without crash`);
      console.log(`   Final resourceReserves: ${(finalResourceReserves * 100).toFixed(2)}%`);

      if (wasPreviouslyCrashed) {
        console.log(`   🎉 FIX CONFIRMED: This seed no longer crashes!`);
      }
    }

  } catch (error: any) {
    failedRuns++;
    console.log(`❌ FAILED: Seed ${seed} failed during initialization`);
    console.log(`   Error: ${error.message || String(error)}`);
  }
}

console.log();
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total runs: ${totalRuns}`);
console.log(`Successful: ${successfulRuns} (${((successfulRuns / totalRuns) * 100).toFixed(1)}%)`);
console.log(`Failed: ${failedRuns} (${((failedRuns / totalRuns) * 100).toFixed(1)}%)`);
console.log();

if (failedRuns === 0) {
  console.log('✅ ALL TESTS PASSED - Fix appears to work!');
  console.log('   Next: Run full Monte Carlo (N=10) for statistical validation');
  process.exit(0);
} else if (successfulRuns > 0 && failedRuns < CRASHED_SEEDS.length) {
  console.log('⚠️ PARTIAL FIX - Some seeds still fail');
  console.log('   Investigation needed for remaining failures');
  process.exit(1);
} else {
  console.log('❌ FIX DID NOT WORK - All previously crashed seeds still crash');
  console.log('   Root cause analysis needs revision');
  process.exit(1);
}
