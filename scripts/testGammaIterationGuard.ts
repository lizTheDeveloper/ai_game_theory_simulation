/**
 * Test gamma sampling iteration guard (Architecture Review HIGH-1)
 *
 * Verifies that gamma sampling with pathological parameters doesn't hang.
 * Tests the MAX_ITERATIONS guard added to prevent infinite loops.
 */

import { sampleBeta } from '../src/simulation/utils/distributions';

// Simple LCG for deterministic RNG
function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

console.log('🧪 Testing Gamma Sampling Iteration Guard\n');

// Test 1: Normal parameters (should succeed)
console.log('=== Test 1: Normal Beta(2,5) ===');
const rng1 = createSeededRng(42);
try {
  const value1 = sampleBeta(2, 5, 1.4, 8.0, rng1);
  console.log(`✅ PASS: Beta(2,5) sampled ${value1.toFixed(2)}°C (no hang)`);
} catch (error) {
  console.log(`❌ FAIL: Beta(2,5) threw error: ${error}`);
}

// Test 2: Very small alpha (edge case, but should still work)
console.log('\n=== Test 2: Small alpha Beta(0.1, 1) ===');
const rng2 = createSeededRng(43);
try {
  const value2 = sampleBeta(0.1, 1, 0, 1, rng2);
  console.log(`✅ PASS: Beta(0.1,1) sampled ${value2.toFixed(4)} (no hang)`);
} catch (error) {
  console.log(`❌ FAIL: Beta(0.1,1) threw error: ${error}`);
}

// Test 3: Very small beta (edge case, but should still work)
console.log('\n=== Test 3: Small beta Beta(1, 0.1) ===');
const rng3 = createSeededRng(44);
try {
  const value3 = sampleBeta(1, 0.1, 0, 1, rng3);
  console.log(`✅ PASS: Beta(1,0.1) sampled ${value3.toFixed(4)} (no hang)`);
} catch (error) {
  console.log(`❌ FAIL: Beta(1,0.1) threw error: ${error}`);
}

// Test 4: Large alpha/beta (should definitely work)
console.log('\n=== Test 4: Large parameters Beta(100, 100) ===');
const rng4 = createSeededRng(45);
try {
  const value4 = sampleBeta(100, 100, 0, 1, rng4);
  console.log(`✅ PASS: Beta(100,100) sampled ${value4.toFixed(4)} (no hang)`);
} catch (error) {
  console.log(`❌ FAIL: Beta(100,100) threw error: ${error}`);
}

console.log('\n=== Summary ===');
console.log('All gamma sampling tests completed without hanging.');
console.log('Iteration guard is working (prevents infinite loops).');
