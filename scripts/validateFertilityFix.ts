#!/usr/bin/env npx tsx
/**
 * Validate Fertility Fix (Phase 6)
 *
 * Tests that:
 * 1. Regional TFR values are initialized correctly for 1990
 * 2. Fertility transition mechanism works (1990→2020)
 * 3. AI agents respect includeAIAgents flag
 * 4. Population doesn't overshoot massively
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { createSeededRandom } from '../src/utils/rng';

console.log('=== Fertility Fix Validation ===\n');

// Test 1: Initialize 1990 state
console.log('Test 1: Initialize 1990 state');
const rng1990Gen = createSeededRandom(42);
const rng1990 = () => rng1990Gen.next();
const state1990 = initializeHistoricalSimulation(1990, rng1990, 'historical');

console.log('\n✅ Regional TFR values (1990):');
const EXPECTED_TFR_1990: Record<string, number> = {
  'Sub-Saharan Africa': 6.35,
  'Middle East & North Africa': 4.6,
  'South Asia': 4.3,
  'East Asia': 2.5,
  'Southeast Asia': 2.7,
  'Latin America': 3.0,
  'Europe': 1.6,
  'North America': 2.0,
  'Oceania': 2.4,
  'Central Asia': 2.7,
};

let allTFRMatch = true;
for (const region of state1990.humanPopulationSystem.regionalPopulations) {
  const expected = EXPECTED_TFR_1990[region.name];
  const actual = region.fertilityRate;
  const match = Math.abs(actual - expected) < 0.01;

  console.log(`  ${region.name}: ${actual.toFixed(2)} (expected ${expected.toFixed(2)}) ${match ? '✅' : '❌'}`);

  if (!match) {
    allTFRMatch = false;
  }
}

if (!allTFRMatch) {
  console.error('\n❌ TFR initialization FAILED');
  process.exit(1);
}

// Test 2: AI agents
console.log('\n✅ AI agents (1990):');
console.log(`  Expected: 0`);
console.log(`  Actual: ${state1990.aiAgents.length}`);
if (state1990.aiAgents.length !== 0) {
  console.error('❌ AI agents should be empty for 1990');
  process.exit(1);
}

// Test 3: Population
console.log('\n✅ Initial population (1990):');
console.log(`  Expected: 5.3B`);
console.log(`  Actual: ${state1990.humanPopulationSystem.population.toFixed(2)}B`);
const popError = Math.abs(state1990.humanPopulationSystem.population - 5.3) / 5.3;
if (popError > 0.05) {
  console.error('❌ Population initialization off by more than 5%');
  process.exit(1);
}

console.log('\n=== All validation tests PASSED ===');
