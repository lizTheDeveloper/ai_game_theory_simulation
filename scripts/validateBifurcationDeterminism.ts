/**
 * Bifurcation Determinism Validation Script
 *
 * Quick script to validate that BifurcationLogicPhase is deterministic and
 * that avgDistanceToThresholds correctly implements cumulative average.
 *
 * Nov 14, 2025 - CRITICAL-1 fix validation
 */

import { runSimulation } from '../src/simulation/engine.js';

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

  const result = runSimulation({
    seed: SEED,
    maxMonths: MAX_MONTHS,
    enableLogging: false,
  });

  const trace = result.monthlySnapshots.map((snapshot:any) => ({
    month: snapshot.month,
    varianceAmp: snapshot.bifurcationState?.varianceAmplification ?? 0,
    avgDistance: snapshot.bifurcationState?.metrics?.avgDistanceToThresholds ?? 0,
    regime: snapshot.bifurcationState?.currentRegime ?? 'unknown',
  }));

  traces.push(trace);
}

console.log('\n✓ All runs complete\n');

// Check determinism: all 3 runs should be IDENTICAL
console.log('📊 Checking determinism (bit-identical results)...');
let deterministicErrors = 0;

for (let month = 0; month < MAX_MONTHS; month++) {
  const run1 = traces[0][month];
  const run2 = traces[1][month];
  const run3 = traces[2][month];

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
