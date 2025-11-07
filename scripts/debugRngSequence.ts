/**
 * WEEK 2 Task 2.2 (Nov 6, 2025): Debug RNG sequence divergence in initialization
 *
 * This script creates 2 simulations with the SAME seed and compares initial AI capabilities.
 * With deterministic RNG, corporate_0 should have IDENTICAL capability in both runs.
 *
 * RUN WITH:
 * LOG_RNG_CALLS=true npx tsx scripts/debugRngSequence.ts > logs/rng_debug_$(date +%Y%m%d_%H%M%S).log 2>&1
 */

import { createDefaultInitialState } from '../src/simulation/initialization';

// Use the SAME seed for both runs
const SEED = 42;

console.log(`\n=== RNG Sequence Debug (Seed: ${SEED}) ===\n`);

console.log(`\n--- RUN 1 ---\n`);
const state1 = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, SEED);
const corporate_0_run1 = state1.aiAgents.find(a => a.id === 'corporate_0');
console.log(`\nRUN 1 corporate_0 capability: ${corporate_0_run1?.capability.toFixed(10)}`);
console.log(`RUN 1 corporate_0 alignment: ${corporate_0_run1?.alignment.toFixed(10)}`);

console.log(`\n--- RUN 2 ---\n`);
const state2 = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, SEED);
const corporate_0_run2 = state2.aiAgents.find(a => a.id === 'corporate_0');
console.log(`\nRUN 2 corporate_0 capability: ${corporate_0_run2?.capability.toFixed(10)}`);
console.log(`RUN 2 corporate_0 alignment: ${corporate_0_run2?.alignment.toFixed(10)}`);

console.log(`\n=== COMPARISON ===`);
console.log(`Capability match: ${corporate_0_run1?.capability === corporate_0_run2?.capability ? '✅ IDENTICAL' : '❌ DIVERGED'}`);
console.log(`Alignment match: ${corporate_0_run1?.alignment === corporate_0_run2?.alignment ? '✅ IDENTICAL' : '❌ DIVERGED'}`);

if (corporate_0_run1?.capability !== corporate_0_run2?.capability) {
  console.log(`\n❌ DIVERGENCE DETECTED!`);
  console.log(`Capability delta: ${Math.abs((corporate_0_run1?.capability || 0) - (corporate_0_run2?.capability || 0)).toExponential(4)}`);
  console.log(`\nCheck the [INIT-RNG-*] logs above to find where the sequences diverge.`);
  process.exit(1);
} else {
  console.log(`\n✅ RNG sequences are IDENTICAL (determinism verified)`);
  process.exit(0);
}
