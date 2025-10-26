/**
 * Real-World Proxy Test
 *
 * Intentionally creates NaN values to verify proxy catches them.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🧪 Real-World Proxy Test\n');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log('Creating initial state...\n');

const state = createDefaultInitialState('historical');

console.log('✅ Initial state created');
console.log(`   QoL: ${state.globalMetrics.qualityOfLife}`);
console.log(`   Community Strength: ${state.society.communityStrength}`);

console.log('\n❌ TEST: Attempting to write NaN to qualityOfLife...');
try {
  // This should be caught by the proxy in dev mode
  state.globalMetrics.qualityOfLife = 0.5 / 0; // NaN
  console.log(`   ERROR: NaN was NOT caught! Value is now: ${state.globalMetrics.qualityOfLife}`);
  console.log('   ❌ PROXY IS NOT WORKING!');
  process.exit(1);
} catch (error) {
  console.log('   ✅ SUCCESS: NaN was caught by proxy!');
  console.log(`   Error: ${(error as Error).message.split('\n')[0]}`);
}

console.log('\n❌ TEST: Attempting to write Infinity to communityStrength...');
try {
  state.society.communityStrength = 1.0 / 0; // Infinity
  console.log(`   ERROR: Infinity was NOT caught! Value is now: ${state.society.communityStrength}`);
  console.log('   ❌ PROXY IS NOT WORKING!');
  process.exit(1);
} catch (error) {
  console.log('   ✅ SUCCESS: Infinity was caught by proxy!');
  console.log(`   Error: ${(error as Error).message.split('\n')[0]}`);
}

console.log('\n❌ TEST: Attempting to create NaN through calculation...');
try {
  const badValue = Math.sqrt(-1); // NaN
  state.society.meaningCrisis = badValue;
  console.log(`   ERROR: Calculation NaN was NOT caught! Value is now: ${state.society.meaningCrisis}`);
  console.log('   ❌ PROXY IS NOT WORKING!');
  process.exit(1);
} catch (error) {
  console.log('   ✅ SUCCESS: Calculation NaN was caught by proxy!');
  console.log(`   Error: ${(error as Error).message.split('\n')[0]}`);
}

console.log('\n✅ ALL TESTS PASSED!');
console.log('   The proxy is working correctly and catching all NaN/Infinity writes.');
console.log('   Run with NODE_ENV=production to disable proxy and see the difference.');
