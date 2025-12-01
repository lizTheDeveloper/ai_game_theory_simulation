#!/usr/bin/env tsx
/**
 * M-4: Carbon Sink Multiplier Fix Verification
 *
 * Tests that injected carbonSinkMultiplier is used as base instead of overwritten.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

// Simple seeded RNG for testing
function simpleRNG(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

async function testCarbonSinkFix() {
  console.log('🔬 Testing carbonSinkMultiplier fix...\n');

  const configs = [
    { name: 'Baseline', carbonSinkMultiplier: 1.0 },
    { name: 'Weak sink', carbonSinkMultiplier: 0.8 },
    { name: 'Strong sink', carbonSinkMultiplier: 1.2 }
  ];

  for (const config of configs) {
    console.log(`\n=== Testing ${config.name} (carbonSinkMultiplier=${config.carbonSinkMultiplier}) ===`);

    const rng = simpleRNG(42);
    const state = createDefaultInitialState(
      rng,
      'historical',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { carbonSinkMultiplier: config.carbonSinkMultiplier }
    );

    const engine = new SimulationEngine();

    // Run 12 steps
    for (let i = 0; i < 12; i++) {
      try {
        const result = engine.step(state);
        // State is mutated in place
      } catch (err) {
        console.error(`❌ Step ${i} failed:`, err);
        process.exit(1);
      }
    }

    const multiplier = state.planetaryBoundaries.landUse.carbonSinkLossMultiplier;
    console.log(`  Month ${state.currentMonth}: carbonSinkLossMultiplier = ${multiplier.toFixed(4)}`);
    console.log(`  Expected base: ${config.carbonSinkMultiplier.toFixed(4)}`);

    // The multiplier should be >= base (base * (1 + deforestation feedback))
    if (multiplier < config.carbonSinkMultiplier - 0.01) {
      console.error(`❌ FAIL: Multiplier ${multiplier.toFixed(4)} < base ${config.carbonSinkMultiplier.toFixed(4)}`);
      process.exit(1);
    }

    console.log(`  ✅ Base multiplier preserved`);
  }

  console.log('\n✅ All tests passed - carbonSinkMultiplier fix verified');
}

testCarbonSinkFix().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
