/**
 * Manual Test: Marine Ice Sheet Instability (MICI) Scenarios
 *
 * Tests AbruptSeaLevelRisePhase behavior in:
 * 1. Cool scenario (< 1.5°C) - should NOT trigger
 * 2. Hot scenario (> 3.0°C) - should trigger in tail scenarios
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { runSimulation } from '../src/simulation/engine';
import { createLCG } from '../src/simulation/utils/levyDistributions';

console.log('🧪 MICI Manual Validation Test\n');

// Helper to create seeded RNG
function createSeededRNG(seed: number): () => number {
  const lcg = createLCG(seed);
  return () => lcg.random();
}

// Test 1: Cool Scenario (< 1.5°C warming)
console.log('=== Test 1: Cool Scenario (< 1.5°C) ===');
console.log('Expected: MICI should NOT trigger (probability ~0.0001/year)\n');

const coolState = createDefaultInitialState(createSeededRNG(12345));
coolState.climate.globalTemperature = 14.5; // ~0.5°C above pre-industrial
coolState.currentMonth = 1200; // 100 years in (year 2125)

const coolResult = runSimulation(coolState, { months: 600, seed: 12345 });

if (coolResult.marineIceSheetInstability?.triggered) {
  console.log('❌ FAIL: MICI triggered in cool scenario');
  console.log(`   Triggered at month: ${coolResult.marineIceSheetInstability.triggerMonth}`);
  console.log(`   Sea level rise: ${coolResult.marineIceSheetInstability.cumulativeSeaLevelRise.toFixed(2)}m`);
} else {
  console.log('✅ PASS: MICI did not trigger in cool scenario');
  console.log(`   Final temperature: ${coolResult.climate.globalTemperature.toFixed(2)}°C`);
}

console.log('\n=== Test 2: Hot Scenario (> 3.0°C) ===');
console.log('Expected: MICI should trigger in some runs (probability ~0.03/year × time modifier)\n');

let triggered = 0;
const totalRuns = 10;

for (let i = 0; i < totalRuns; i++) {
  const hotState = createDefaultInitialState(createSeededRNG(50000 + i));
  hotState.climate.globalTemperature = 17.0; // ~3.0°C above pre-industrial
  hotState.currentMonth = 1200; // 100 years in (year 2125)

  const hotResult = runSimulation(hotState, { months: 1200, seed: 50000 + i });

  if (hotResult.marineIceSheetInstability?.triggered) {
    triggered++;
    console.log(`Run ${i + 1}: ✅ TRIGGERED at month ${hotResult.marineIceSheetInstability.triggerMonth}, rise: ${hotResult.marineIceSheetInstability.cumulativeSeaLevelRise.toFixed(2)}m`);
  } else {
    console.log(`Run ${i + 1}: ⚪ Not triggered`);
  }
}

const triggerRate = triggered / totalRuns;
console.log(`\n📊 Results: ${triggered}/${totalRuns} runs triggered (${(triggerRate * 100).toFixed(0)}%)`);
console.log(`Expected rate: ~30-60% for 100-year hot scenario (3.0°C, post-2100)`);

if (triggerRate > 0 && triggerRate < 0.8) {
  console.log('✅ PASS: Trigger rate in reasonable range (stochastic tail risk)');
} else if (triggerRate === 0) {
  console.log('⚠️  WARNING: No triggers observed (may need more runs or probability adjustment)');
} else {
  console.log('⚠️  WARNING: Trigger rate very high (may be too aggressive)');
}

console.log('\n=== Test 3: Irreversibility Check ===');
console.log('Expected: Once triggered, collapse continues even if temperature drops\n');

const irrevState = createDefaultInitialState(createSeededRNG(77777));
irrevState.climate.globalTemperature = 17.5; // Hot start
irrevState.currentMonth = 1200;

// Run until trigger
let irrevResult = runSimulation(irrevState, { months: 600, seed: 77777 });

if (irrevResult.marineIceSheetInstability?.triggered) {
  console.log(`✅ Triggered at month ${irrevResult.marineIceSheetInstability.triggerMonth}`);
  const riseAtTrigger = irrevResult.marineIceSheetInstability.cumulativeSeaLevelRise;

  // Cool down temperature drastically
  irrevResult.climate.globalTemperature = 14.0; // Drop to pre-industrial

  // Continue simulation
  const continuedResult = runSimulation(irrevResult, { months: 600, seed: 77778 });
  const riseAfterCooldown = continuedResult.marineIceSheetInstability!.cumulativeSeaLevelRise;

  if (riseAfterCooldown > riseAtTrigger) {
    console.log(`✅ PASS: Sea level continued rising after temperature drop`);
    console.log(`   Rise at trigger: ${riseAtTrigger.toFixed(3)}m`);
    console.log(`   Rise after cooldown: ${riseAfterCooldown.toFixed(3)}m`);
    console.log(`   Additional rise: ${(riseAfterCooldown - riseAtTrigger).toFixed(3)}m`);
  } else {
    console.log(`❌ FAIL: Sea level did not continue rising (irreversibility broken)`);
  }
} else {
  console.log('⚠️  Could not test irreversibility (MICI did not trigger)');
  console.log('   Try running with different seed or more months');
}

console.log('\n✅ Manual validation complete');
