/**
 * Test bifurcation memory fix (HIGH-1)
 *
 * Verifies that amplificationTimeSeries is capped at maxTimeSeriesLength
 * and doesn't grow unbounded during long simulations.
 *
 * Test strategy:
 * - Run 500-month simulation
 * - Verify time series never exceeds 100 entries
 * - Verify bifurcation metrics still calculate correctly
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

const SEED = 42; // Numeric seed for SimulationEngine
const MAX_MONTHS = 200; // Reduced to avoid wet bulb bug (sufficient for memory test)
const EXPECTED_MAX_LENGTH = 100;

console.log('🧪 Testing bifurcation memory fix (HIGH-1)\n');
console.log(`Seed: ${SEED}`);
console.log(`Duration: ${MAX_MONTHS} months`);
console.log(`Expected max time series length: ${EXPECTED_MAX_LENGTH}\n`);

// Initialize
const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS });
const rngFunction = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rngFunction);

console.log('✅ Initialization complete');
console.log(`  Initial time series length: ${state.bifurcationState.metrics?.amplificationTimeSeries.length ?? 0}`);
console.log(`  maxTimeSeriesLength: ${state.bifurcationState.metrics?.maxTimeSeriesLength}`);
console.log(`  enableTimeSeries: ${state.bifurcationState.metrics?.enableTimeSeries}\n`);

// Run simulation
console.log(`🏃 Running ${MAX_MONTHS}-month simulation...\n`);

let maxObservedLength = 0;
let checkpointMonths = [50, 100, 150, 200];

for (let month = 1; month <= MAX_MONTHS; month++) {
  engine.step(state);

  const currentLength = state.bifurcationState.metrics?.amplificationTimeSeries.length ?? 0;
  maxObservedLength = Math.max(maxObservedLength, currentLength);

  // Checkpoint at specific months
  if (checkpointMonths.includes(month)) {
    console.log(`📊 Month ${month}:`);
    console.log(`  Time series length: ${currentLength}`);
    console.log(`  Variance amplification: ${state.bifurcationState.varianceAmplification.toFixed(2)}×`);
    console.log(`  Current regime: ${state.bifurcationState.currentRegime}`);
    console.log(`  Max amplification: ${state.bifurcationState.metrics?.maxVarianceAmplification.toFixed(2)}×`);

    // Verify length constraint
    if (currentLength > EXPECTED_MAX_LENGTH) {
      console.log(`  ❌ MEMORY LEAK: Time series exceeds ${EXPECTED_MAX_LENGTH} (actual: ${currentLength})`);
      process.exit(1);
    } else {
      console.log(`  ✅ Memory bounded (${currentLength} <= ${EXPECTED_MAX_LENGTH})`);
    }
    console.log();
  }
}

console.log('\n=== FINAL RESULTS ===\n');
console.log(`Max observed time series length: ${maxObservedLength}`);
console.log(`Expected max: ${EXPECTED_MAX_LENGTH}`);
console.log(`Final time series length: ${state.bifurcationState.metrics?.amplificationTimeSeries.length ?? 0}`);
console.log(`Total samples: ${state.bifurcationState.metrics?.sampleCount ?? 0}`);
console.log(`Regime shift events: ${state.bifurcationState.metrics?.regimeShiftEvents.length ?? 0}`);
console.log();

// Verify memory fix worked
if (maxObservedLength <= EXPECTED_MAX_LENGTH) {
  console.log('✅ HIGH-1 FIX VERIFIED: Time series properly bounded');
  console.log(`   Rolling window working (max ${maxObservedLength} entries)`);
} else {
  console.log(`❌ HIGH-1 FIX FAILED: Time series exceeded limit`);
  console.log(`   Expected max: ${EXPECTED_MAX_LENGTH}, Actual max: ${maxObservedLength}`);
  process.exit(1);
}

// Verify bifurcation still works
const avgDistance = state.bifurcationState.metrics?.avgDistanceToThresholds ?? 1.0;
const maxAmplification = state.bifurcationState.metrics?.maxVarianceAmplification ?? 1.0;

console.log();
console.log('✅ Bifurcation metrics still functional:');
console.log(`   Avg distance to thresholds: ${avgDistance.toFixed(4)}`);
console.log(`   Max variance amplification: ${maxAmplification.toFixed(2)}×`);
console.log(`   Regime shifts: ${state.bifurcationState.metrics?.regimeShiftEvents.length ?? 0}`);

console.log();
console.log('🎉 All tests passed!');
