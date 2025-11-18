/**
 * Debug Script: Test Scenario Priority Enforcement
 *
 * Compare government action selection between scenarios with different priorities.
 * Expected: Green New Deal → climate actions, Techno-Optimist → research actions
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { applyScenario } from '../src/simulation/scenarios/apply';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { selectGovernmentAction } from '../src/simulation/government/core/governmentCore';

// Simple RNG for debugging (determinism not critical here)
const rng = Math.random;

console.log('='.repeat(80));
console.log('SCENARIO PRIORITY DEBUG TEST');
console.log('='.repeat(80));

// Test 1: Green New Deal (climate 0.8, research 0.6)
console.log('\n' + '='.repeat(80));
console.log('TEST 1: Green New Deal (climate: 0.8, research: 0.6, redistribution: 0.7)');
console.log('='.repeat(80));

const state1 = createDefaultInitialState(rng, 'historical');
applyScenario(state1, SCENARIOS.greenNewDeal, rng);

console.log('\n--- Month 0 Action Selection ---');
const action1 = selectGovernmentAction(state1, rng);
console.log(`\nFINAL SELECTION: ${action1?.id}`);

// Test 2: Techno-Optimist (research 0.9, climate 0.4)
console.log('\n' + '='.repeat(80));
console.log('TEST 2: Techno-Optimist (research: 0.9, climate: 0.4, redistribution: 0.2)');
console.log('='.repeat(80));

const state2 = createDefaultInitialState(rng, 'historical');
applyScenario(state2, SCENARIOS.technoOptimist, rng);

console.log('\n--- Month 0 Action Selection ---');
const action2 = selectGovernmentAction(state2, rng);
console.log(`\nFINAL SELECTION: ${action2?.id}`);

// Test 3: Degrowth (climate 0.9, redistribution 0.8)
console.log('\n' + '='.repeat(80));
console.log('TEST 3: Degrowth (climate: 0.9, redistribution: 0.8)');
console.log('='.repeat(80));

const state3 = createDefaultInitialState(rng, 'historical');
applyScenario(state3, SCENARIOS.degrowth, rng);

console.log('\n--- Month 0 Action Selection ---');
const action3 = selectGovernmentAction(state3, rng);
console.log(`\nFINAL SELECTION: ${action3?.id}`);

// Summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Green New Deal selected:   ${action1?.id}`);
console.log(`Techno-Optimist selected:  ${action2?.id}`);
console.log(`Degrowth selected:         ${action3?.id}`);

if (action1?.id === action2?.id && action2?.id === action3?.id) {
  console.log('\n❌ BUG CONFIRMED: All scenarios select IDENTICAL actions despite different priorities!');
  process.exit(1);
} else {
  console.log('\n✅ SCENARIOS DIVERGE: Different priorities produce different actions');
  process.exit(0);
}
