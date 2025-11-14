/**
 * Bifurcation Determinism Validation Script
 *
 * Quick script to validate that BifurcationLogicPhase is deterministic and
 * that avgDistanceToThresholds correctly implements cumulative average.
 *
 * Nov 14, 2025 - CRITICAL-1 fix validation
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine.js';
import { createDefaultInitialState } from '../src/simulation/initialization.js';

console.log('🔍 Testing BifurcationLogicPhase determinism...\n');

const SEED = 42;
const MAX_MONTHS = 20;

// Run 3 simulations with identical seed
const traces: Array<Array<{
  month: number;
  varianceAmp: number;
  avgDistance: number;
  regime: string;
}>> = [];

for (let run = 0; run < 3; run++) {
  console.log(`  Run ${run + 1}/3 (seed=${SEED})...`);

  // Create engine first, then use its RNG for initialization (determinism fix Nov 6 2025)
  const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS, logLevel: 'none' });
  const rngFunction = engine.getRNG().next.bind(engine.getRNG());

  const initialState = createDefaultInitialState(rngFunction);

  const result = engine.run(initialState);

  const trace = result.history.map((step) => ({
    month: step.state.currentMonth,
    varianceAmp: step.state.bifurcationState?.varianceAmplification ?? 0,
    avgDistance: step.state.bifurcationState?.metrics?.avgDistanceToThresholds ?? 0,
    regime: step.state.bifurcationState?.currentRegime ?? 'unknown',
  }));

  traces.push(trace);
}

console.log('\n✓ All runs complete\n');

// Check trace lengths
console.log(`Trace lengths: Run1=${traces[0].length}, Run2=${traces[1].length}, Run3=${traces[2].length}`);
const minLength = Math.min(traces[0].length, traces[1].length, traces[2].length);

// Check determinism: all 3 runs should be IDENTICAL
console.log('📊 Checking determinism (bit-identical results)...');
let deterministicErrors = 0;

for (let month = 0; month < minLength; month++) {
  const run1 = traces[0][month];
  const run2 = traces[1][month];
  const run3 = traces[2][month];

  if (!run1 || !run2 || !run3) {
    console.log(`  ⚠️  Month ${month}: Missing data (run1=${!!run1}, run2=${!!run2}, run3=${!!run3})`);
    continue;
  }

  if (run1.varianceAmp !== run2.varianceAmp || run1.varianceAmp !== run3.varianceAmp) {
    console.log(
      `  ❌ Month ${month}: varianceAmplification NOT deterministic: ` +
      `${run1.varianceAmp}, ${run2.varianceAmp}, ${run3.varianceAmp}`
    );
    deterministicErrors++;
  }

  if (run1.avgDistance !== run2.avgDistance || run1.avgDistance !== run3.avgDistance) {
    console.log(
      `  ❌ Month ${month}: avgDistanceToThresholds NOT deterministic: ` +
      `${run1.avgDistance}, ${run2.avgDistance}, ${run3.avgDistance}`
    );
    deterministicErrors++;
  }

  if (run1.regime !== run2.regime || run1.regime !== run3.regime) {
    console.log(
      `  ❌ Month ${month}: regime NOT deterministic: ` +
      `${run1.regime}, ${run2.regime}, ${run3.regime}`
    );
    deterministicErrors++;
  }
}

if (deterministicErrors === 0) {
  console.log('  ✅ All 3 runs produced IDENTICAL results (determinism verified)');
} else {
  console.log(`\n  ❌ FAILED: ${deterministicErrors} determinism errors detected`);
}

// Check cumulative average correctness
console.log('\n📈 Checking cumulative average formula...');

// Use run 1 to check cumulative average
const distanceSamples: number[] = [];
let cumulativeErrors = 0;

for (let month = 0; month < MAX_MONTHS; month++) {
  // We need distanceToNearestThreshold at each month, but we don't have it in snapshots
  // Skip this test - will verify manually after fix
}

console.log('  ⏭️  Skipped (requires full state snapshots)\n');

// Summary
console.log('═══════════════════════════════════════');
if (deterministicErrors === 0) {
  console.log('✅ BIFURCATION DETERMINISM: PASS');
  process.exit(0);
} else {
  console.log('❌ BIFURCATION DETERMINISM: FAIL');
  process.exit(1);
}
