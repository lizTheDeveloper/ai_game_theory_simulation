/**
 * Test Phase 6 fertility fix
 * Validates that 1990 scenarios initialize with correct historical fertility rates
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';

// Simple seeded RNG for testing
function createSeededRNG(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const rng = createSeededRNG(12345);
const state = initializeHistoricalSimulation(1990, rng, 'historical');

console.log('\n=== PHASE 6 FERTILITY FIX VALIDATION ===\n');

// Test 1: Check regional fertility rates
console.log('TEST 1: Regional Fertility Rates (1990)');
console.log('Expected values from research/demographics_1990_hindcast_20251126.md');
console.log('');

const expectedTFR: Record<string, number> = {
  'Sub-Saharan Africa': 6.4,
  'Middle East & North Africa': 4.7,
  'South Asia': 4.4,
  'East Asia': 2.3,
  'Southeast Asia': 3.6,
  'Latin America': 3.4,
  'Europe': 1.8,
  'North America': 2.0,
  'Oceania': 2.6,
  'Central Asia': 2.7,
};

let allMatch = true;
for (const region of state.humanPopulationSystem.regionalPopulations) {
  const expected = expectedTFR[region.name];
  const actual = region.fertilityRate;
  const match = Math.abs(actual - expected) < 0.1;

  console.log(`  ${region.name}:`);
  console.log(`    Expected TFR: ${expected.toFixed(1)}`);
  console.log(`    Actual TFR:   ${actual.toFixed(1)}`);
  console.log(`    Status: ${match ? '✅ PASS' : '❌ FAIL'}`);

  if (!match) allMatch = false;
}

console.log('');
console.log(`TEST 1 Result: ${allMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 2: Check AI agents
console.log('TEST 2: AI Agents (should be empty for 1990)');
console.log(`  Expected count: 0`);
console.log(`  Actual count: ${state.aiAgents.length}`);
console.log(`  Status: ${state.aiAgents.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 3: Check _skipHistoricalBirthRateScaling flag
console.log('TEST 3: Historical Birth Rate Scaling Flag');
const skipFlag = (state as any)._skipHistoricalBirthRateScaling;
console.log(`  Expected: true`);
console.log(`  Actual: ${skipFlag}`);
console.log(`  Status: ${skipFlag === true ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 4: Check population
console.log('TEST 4: Initial Population');
console.log(`  Expected: 5.3B (UN 1990 data)`);
console.log(`  Actual: ${state.humanPopulationSystem.population.toFixed(2)}B`);
const popMatch = Math.abs(state.humanPopulationSystem.population - 5.3) < 0.1;
console.log(`  Status: ${popMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

console.log('=== VALIDATION COMPLETE ===');
