/**
 * Test Threshold Uncertainty Sampling (M-5)
 *
 * Verifies that:
 * 1. Threshold distributions sample correctly
 * 2. Determinism works (same seed = same thresholds)
 * 3. Variance across runs is reasonable
 */

import { initializeTippingPointSystem } from '../src/simulation/tippingPoints';
import { createSeededRng } from '../src/simulation/rng';

console.log('🌡️🎲 Testing Threshold Uncertainty Sampling (M-5)\n');

// Test 1: Determinism (same seed = same thresholds)
console.log('=== Test 1: Determinism ===');
const seed = 42;
const rng1 = createSeededRng(seed);
const rng2 = createSeededRng(seed);

const system1 = initializeTippingPointSystem(rng1);
const system2 = initializeTippingPointSystem(rng2);

let deterministicPass = true;
for (let i = 0; i < system1.elements.length; i++) {
  const elem1 = system1.elements[i];
  const elem2 = system2.elements[i];

  if (elem1._sampledThresholdC !== elem2._sampledThresholdC) {
    console.log(`❌ FAIL: ${elem1.id} - run1=${elem1._sampledThresholdC}, run2=${elem2._sampledThresholdC}`);
    deterministicPass = false;
  }
}

if (deterministicPass) {
  console.log('✅ PASS: All thresholds deterministic (same seed = same values)\n');
} else {
  console.log('❌ FAIL: Determinism broken\n');
}

// Test 2: Variance across runs (different seeds = different thresholds)
console.log('=== Test 2: Variance Across Runs ===');
const runs = 10;
const thresholds: Record<string, number[]> = {};

for (let run = 0; run < runs; run++) {
  const rng = createSeededRng(1000 + run);
  const system = initializeTippingPointSystem(rng);

  for (const elem of system.elements) {
    if (elem._sampledThresholdC !== undefined) {
      if (!thresholds[elem.id]) thresholds[elem.id] = [];
      thresholds[elem.id].push(elem._sampledThresholdC);
    }
  }
}

for (const [id, values] of Object.entries(thresholds)) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  console.log(`${id}:`);
  console.log(`  Range: [${min.toFixed(2)}, ${max.toFixed(2)}]°C`);
  console.log(`  Mean: ${mean.toFixed(2)}°C, Std: ${std.toFixed(2)}°C`);
}

console.log('\n=== Test 3: Distribution Bounds ===');
// Verify sampled values respect distribution bounds
const testRng = createSeededRng(999);
const testSystem = initializeTippingPointSystem(testRng);

let boundsPass = true;
for (const elem of testSystem.elements) {
  if (elem.thresholdDistribution && elem._sampledThresholdC !== undefined) {
    const { params } = elem.thresholdDistribution;
    const sampled = elem._sampledThresholdC;

    // Check bounds
    const min = params.min ?? -Infinity;
    const max = params.max ?? Infinity;

    if (sampled < min || sampled > max) {
      console.log(`❌ FAIL: ${elem.id} sampled ${sampled.toFixed(2)}°C outside bounds [${min}, ${max}]`);
      boundsPass = false;
    }
  }
}

if (boundsPass) {
  console.log('✅ PASS: All sampled thresholds within distribution bounds\n');
} else {
  console.log('❌ FAIL: Some thresholds outside bounds\n');
}

console.log('=== Summary ===');
console.log(`Determinism: ${deterministicPass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Bounds check: ${boundsPass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`\nThreshold uncertainty sampling ${deterministicPass && boundsPass ? 'WORKING' : 'FAILED'}`);
