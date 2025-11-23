/**
 * Quick test to verify performance fix doesn't break functionality
 * Tests in-place splice patterns for array cleanup
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🧪 Testing performance fix: filter() → splice()');
console.log('');

// Create engine with seeded RNG
const seed = 12345;
const engine = new SimulationEngine({ seed, maxMonths: 12, logLevel: 'summary' });
const rngFunction = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rngFunction);

console.log('✅ Initial state created');

// Run simulation for 12 months to test hot paths
console.log(`📊 Running simulation for 12 months (seed: ${seed})...`);

let hasErrors = false;
for (let i = 0; i < 12; i++) {
  try {
    engine.step(state);

    // Verify state integrity
    if (state.currentMonth !== i + 1) {
      console.log(`❌ Month mismatch: expected ${i + 1}, got ${state.currentMonth}`);
      hasErrors = true;
      break;
    }

    // Check for NaN in key metrics
    if (isNaN(state.resourceEconomy.co2.temperatureAnomaly)) {
      console.log(`❌ NaN detected in temperature at month ${state.currentMonth}`);
      hasErrors = true;
      break;
    }

    if (i % 3 === 0) {
      console.log(`   Month ${state.currentMonth}: ✅ OK`);
    }
  } catch (error: any) {
    console.log(`❌ ERROR at month ${i + 1}: ${error.message}`);
    hasErrors = true;
    break;
  }
}

if (!hasErrors) {
  console.log('');
  console.log('✅ All tests passed!');
  console.log('');
  console.log('📊 Final state:');
  console.log(`   Month: ${state.currentMonth}`);
  console.log(`   Temperature: +${state.resourceEconomy.co2.temperatureAnomaly.toFixed(3)}°C`);
  console.log(`   Organizations: ${state.organizations.length}`);
  if (state.nuclearWinter) {
    console.log(`   Nuclear winter radiation zones: ${state.nuclearWinter.radiationZones?.length ?? 0}`);
  }
  console.log('');
  console.log('🎯 Performance fix verified: splice() patterns work correctly');
} else {
  console.log('');
  console.log('❌ Tests failed - fix broke functionality');
  process.exit(1);
}
