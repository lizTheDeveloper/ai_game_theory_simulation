/**
 * Manual test: Verify bifurcation time series rolling window (HIGH-1)
 *
 * Tests:
 * 1. Default config enforces maxLength=200
 * 2. Custom maxLength works
 * 3. Disabled diagnostics stops collection
 * 4. Rolling window preserves determinism
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('\n=== Bifurcation Rolling Window Test (HIGH-1) ===\n');

// Test 1: Default rolling window (maxLength=200)
console.log('Test 1: Default rolling window (maxLength=200)');
{
  const engine = new SimulationEngine({ seed: 12345, maxMonths: 1 });
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);

  // Run 300 steps (exceeds default window)
  for (let i = 0; i < 300; i++) {
    engine.step(state);
  }

  const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];
  const firstMonth = timeSeries[0]?.month || 0;
  const lastMonth = timeSeries[timeSeries.length - 1]?.month || 0;

  console.log(`  ✅ Time series length: ${timeSeries.length} (should be ≤200)`);
  console.log(`  ✅ Month range: ${firstMonth}-${lastMonth} (should be recent, not 0-299)`);

  if (timeSeries.length > 200) {
    console.log(`  ❌ FAILED: Time series exceeded 200 entries!`);
  } else if (firstMonth < 50) {
    console.log(`  ❌ FAILED: Oldest entry too old (should be trimmed)!`);
  } else {
    console.log(`  ✅ PASSED: Rolling window working correctly\n`);
  }
}

// Test 2: Custom maxLength
console.log('Test 2: Custom maxLength=50');
{
  const engine = new SimulationEngine({ seed: 12345, maxMonths: 1 });
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);
  state.config.bifurcationDiagnostics = {
    enabled: true,
    maxTimeSeriesLength: 50,
  };

  // Run 100 steps
  for (let i = 0; i < 100; i++) {
    engine.step(state);
  }

  const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];

  console.log(`  ✅ Time series length: ${timeSeries.length} (should be ≤50)`);

  if (timeSeries.length > 50) {
    console.log(`  ❌ FAILED: Time series exceeded custom maxLength!`);
  } else {
    console.log(`  ✅ PASSED: Custom maxLength working\n`);
  }
}

// Test 3: Disabled diagnostics
console.log('Test 3: Disabled diagnostics');
{
  const engine = new SimulationEngine({ seed: 12345, maxMonths: 1 });
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);
  state.config.bifurcationDiagnostics = {
    enabled: false,
    maxTimeSeriesLength: 200,
  };

  // Run 100 steps
  for (let i = 0; i < 100; i++) {
    engine.step(state);
  }

  const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];

  console.log(`  ✅ Time series length: ${timeSeries.length} (should be 0)`);

  if (timeSeries.length > 0) {
    console.log(`  ❌ FAILED: Time series should be empty when disabled!`);
  } else {
    console.log(`  ✅ PASSED: Diagnostics disabled correctly\n`);
  }
}

// Test 4: Determinism preserved
console.log('Test 4: Determinism with different window sizes');
{
  const seed = 99999;

  // Run 1: Small window
  const engine1 = new SimulationEngine({ seed, maxMonths: 1 });
  const rng1 = engine1.getRNG().next.bind(engine1.getRNG());
  const state1 = createDefaultInitialState(rng1);
  state1.config.bifurcationDiagnostics = {
    enabled: true,
    maxTimeSeriesLength: 50,
  };
  for (let i = 0; i < 100; i++) {
    engine1.step(state1);
  }

  // Run 2: Large window
  const engine2 = new SimulationEngine({ seed, maxMonths: 1 });
  const rng2 = engine2.getRNG().next.bind(engine2.getRNG());
  const state2 = createDefaultInitialState(rng2);
  state2.config.bifurcationDiagnostics = {
    enabled: true,
    maxTimeSeriesLength: 200,
  };
  for (let i = 0; i < 100; i++) {
    engine2.step(state2);
  }

  const match = state1.bifurcationState.varianceAmplification === state2.bifurcationState.varianceAmplification
    && state1.bifurcationState.distanceToNearestThreshold === state2.bifurcationState.distanceToNearestThreshold
    && state1.bifurcationState.currentRegime === state2.bifurcationState.currentRegime;

  console.log(`  ✅ Amplification: ${state1.bifurcationState.varianceAmplification.toFixed(3)} (both runs)`);
  console.log(`  ✅ Distance: ${state1.bifurcationState.distanceToNearestThreshold.toFixed(3)} (both runs)`);
  console.log(`  ✅ Regime: ${state1.bifurcationState.currentRegime} (both runs)`);

  if (!match) {
    console.log(`  ❌ FAILED: Determinism broken by rolling window!`);
  } else {
    console.log(`  ✅ PASSED: Determinism preserved\n`);
  }
}

console.log('=== All Tests Complete ===\n');
