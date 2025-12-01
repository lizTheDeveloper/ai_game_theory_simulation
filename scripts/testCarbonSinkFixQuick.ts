#!/usr/bin/env tsx
/**
 * M-4: Carbon Sink Multiplier Fix Verification (QUICK VERSION)
 *
 * Tests that injected carbonSinkMultiplier is stored in simulationConfig.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';

// Simple seeded RNG for testing
function simpleRNG(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function testCarbonSinkFix() {
  console.log('🔬 Testing carbonSinkMultiplier injection...\n');

  const configs = [
    { name: 'Baseline', value: 1.0 },
    { name: 'Weak sink', value: 0.8 },
    { name: 'Strong sink', value: 1.2 }
  ];

  for (const config of configs) {
    console.log(`=== Testing ${config.name} (carbonSinkMultiplier=${config.value}) ===`);

    const rng = simpleRNG(42);
    const state = createDefaultInitialState(
      rng,
      'historical',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { carbonSinkMultiplier: config.value }
    );

    const injected = state.simulationConfig?.carbonSinkMultiplier;

    if (injected === undefined) {
      console.error(`❌ FAIL: carbonSinkMultiplier not injected into simulationConfig`);
      process.exit(1);
    }

    if (Math.abs(injected - config.value) > 0.001) {
      console.error(`❌ FAIL: Expected ${config.value}, got ${injected}`);
      process.exit(1);
    }

    console.log(`  ✅ simulationConfig.carbonSinkMultiplier = ${injected}`);
    console.log(`  ✅ Value preserved correctly\n`);
  }

  console.log('✅ All tests passed - carbonSinkMultiplier injection verified');
  console.log('\n📝 Note: Runtime fix (planetaryBoundaries.ts) uses this value as base multiplier.');
  console.log('   Full validation requires parameter sweep (see M-4 plan).');
}

testCarbonSinkFix();
