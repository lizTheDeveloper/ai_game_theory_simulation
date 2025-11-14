/**
 * Test: BifurcationLogicPhase amplificationTimeSeries memory cap
 * 
 * Verifies that the time series array doesn't grow unbounded in long simulations.
 */

import { BifurcationLogicPhase } from '../src/simulation/engine/phases/BifurcationLogicPhase';
import { createDefaultInitialState } from '../src/simulation/initialization';

const MAX_ENTRIES = 100;

console.log('🧪 Testing BifurcationLogicPhase memory cap...\n');

// RNG function (required for deterministic simulation)
const rng = () => 0.5;

// Create minimal state
const state = createDefaultInitialState(rng);

// Run for 200 months (should cap at 100 entries)
const phase = new BifurcationLogicPhase();
for (let i = 0; i < 200; i++) {
  state.currentMonth = i;
  phase.execute(state, rng, {});
}

const timeSeriesLength = state.bifurcationState.metrics.amplificationTimeSeries.length;

console.log(`📊 After 200 months:`);
console.log(`  Time series length: ${timeSeriesLength}`);
console.log(`  Expected cap: ${MAX_ENTRIES}`);

if (timeSeriesLength <= MAX_ENTRIES) {
  console.log(`\n✅ PASS: Memory cap working (${timeSeriesLength} <= ${MAX_ENTRIES})`);
  process.exit(0);
} else {
  console.log(`\n❌ FAIL: Memory leak detected (${timeSeriesLength} > ${MAX_ENTRIES})`);
  process.exit(1);
}
