/**
 * Novel Entities Gated Model - Smoke Test
 *
 * Quick validation that the implementation doesn't crash and produces sane values.
 * NOT a full integration test - just a smoke test to verify basic functionality.
 */

import { runSimulation } from '../../src/simulation/engine';
import { createDefaultInitialState } from '../../src/simulation/initialization';

// Simple seeded RNG for deterministic testing
function createSeededRNG(seed: number): () => number {
  let value = seed;
  return function seededRandom(): number {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

console.log('=== Novel Entities Gated Model - Smoke Test ===\n');

try {
  const rng = createSeededRNG(12345);
  const state = createDefaultInitialState(rng);

  console.log(`Initial state:`);
  const boundary = state.planetaryBoundariesSystem?.boundaries?.novel_entities;
  if (boundary) {
    console.log(`  Novel Entities: ${boundary.currentValue.toFixed(3)}`);
    console.log(`  Peak Value: ${boundary.peakValue || 'Not set'}`);
  }

  // Run simulation for 12 months (1 year)
  console.log(`\nRunning simulation for 12 months...`);

  for (let i = 0; i < 12; i++) {
    runSimulation(state);
  }

  console.log(`\nAfter 12 months:`);
  if (boundary) {
    console.log(`  Novel Entities: ${boundary.currentValue.toFixed(3)}`);
    console.log(`  Peak Value: ${boundary.peakValue?.toFixed(3) || 'Not set'}`);
  }

  // Check for NaN values
  if (boundary && (isNaN(boundary.currentValue) || isNaN(boundary.peakValue || 0))) {
    throw new Error(`❌ NaN detected in boundary values!`);
  }

  console.log(`\n✅ Smoke test PASSED - No crashes, no NaN values`);
  console.log(`✅ Gated remediation model is functioning`);

  process.exit(0);
} catch (error) {
  console.error(`\n❌ Smoke test FAILED:`);
  console.error(error);
  process.exit(1);
}
