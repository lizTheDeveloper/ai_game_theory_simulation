#!/usr/bin/env npx tsx

/**
 * Validate Economic Bifurcation Fix (Nov 28, 2025)
 *
 * Confirms that Month 0 initialization produces economicStability > 0.25 (max threshold)
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { BifurcationLogicPhase } from '../src/simulation/engine/phases/BifurcationLogicPhase';

// Create seeded RNG for determinism
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

console.log('=== ECONOMIC BIFURCATION FIX VALIDATION ===\n');

// Test 10 different seeds to ensure ALL start above threshold
const seeds = [42000, 42001, 42002, 42003, 42004, 42005, 42006, 42007, 42008, 42009];
let allPassed = true;

seeds.forEach((seed, idx) => {
  const rng = createTestRng(seed);
  const state = createDefaultInitialState(rng);

  // Calculate economic stability using the FIXED formula
  const economicStage = state.globalMetrics.economicTransitionStage;
  const wealthDist = state.globalMetrics.wealthDistribution;
  const economicStability = ((economicStage + 2.0) / 6.0 + wealthDist) / 2.0;

  // Get the sampled threshold for this run
  const threshold = state.bifurcationState.economicCollapseThreshold.location;
  const thresholdMax = 0.25; // Upper bound of [0.15, 0.25] range

  // Check if crossed
  const crossed = economicStability < threshold;
  const safe = economicStability > thresholdMax;

  const status = crossed ? '❌ FAILED' : safe ? '✅ PASSED' : '⚠️  MARGINAL';

  console.log(`Run ${idx + 1} (Seed ${seed}):`);
  console.log(`  economicStage: ${economicStage.toFixed(2)}`);
  console.log(`  wealthDist: ${wealthDist.toFixed(3)}`);
  console.log(`  economicStability: ${economicStability.toFixed(3)}`);
  console.log(`  Threshold (sampled): ${threshold.toFixed(3)}`);
  console.log(`  Threshold (max): ${thresholdMax.toFixed(3)}`);
  console.log(`  ${status} (${crossed ? 'COLLAPSED AT MONTH 0' : safe ? 'Safe margin: ' + (economicStability - thresholdMax).toFixed(3) : 'Close to threshold'})`);
  console.log('');

  if (crossed || !safe) allPassed = false;
});

console.log('=== SUMMARY ===');
if (allPassed) {
  console.log('✅ ALL TESTS PASSED');
  console.log('   Economic stability > 0.25 (max threshold) in ALL runs');
  console.log('   No Month 0 collapses detected');
  console.log('');
  console.log('Expected values:');
  console.log('  - Stage 0, wealthDist=0.38: economicStability = 0.355');
  console.log('  - Always > 0.25 (max threshold)');
  console.log('  - Margin: ~0.10 buffer capacity');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('   Month 0 economic collapse still occurring');
  console.log('   Fix did not resolve the issue');
}

process.exit(allPassed ? 0 : 1);
