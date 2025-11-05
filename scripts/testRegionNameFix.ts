/**
 * Test Region Name Fix (Nov 5, 2025)
 *
 * Verify that the region name standardization fix resolves the Monte Carlo error:
 * "❌ Region Eastern Asia missing mortalityStabilizers at Month 4"
 *
 * This test validates:
 * 1. Old UN names ("Eastern Asia", "Southern Asia", "Northern America") are gone
 * 2. Canonical names ("East Asia", "South Asia", "North America") are used
 * 3. mortalityStabilizers are initialized for all regions at creation
 */

import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🧪 Testing region name fix...\n');

// Create initial state
const state = createDefaultInitialState();

// Get regions
const regions = state.humanPopulationSystem.regionalPopulations!;

console.log(`📍 Found ${regions.length} regions\n`);

// Test 1: Check for old UN names
console.log('=== Test 1: No old UN names ===');
const oldNames = ['Eastern Asia', 'Southern Asia', 'Northern America'];
let oldNamesFound = false;

for (const oldName of oldNames) {
  const found = regions.some(r => r.name === oldName);
  if (found) {
    console.log(`❌ FAIL: Found old name "${oldName}"`);
    oldNamesFound = true;
  }
}

if (!oldNamesFound) {
  console.log('✅ PASS: No old UN names found');
}

// Test 2: Check canonical names exist
console.log('\n=== Test 2: Canonical names present ===');
const canonicalNames = ['East Asia', 'South Asia', 'North America'];
let canonicalMissing = false;

for (const canonical of canonicalNames) {
  const found = regions.some(r => r.name === canonical);
  if (found) {
    console.log(`✅ "${canonical}" found`);
  } else {
    console.log(`❌ FAIL: "${canonical}" missing`);
    canonicalMissing = true;
  }
}

// Test 3: Check mortalityStabilizers initialized
console.log('\n=== Test 3: mortalityStabilizers initialized ===');
let missingStabilizers = false;

for (const region of regions) {
  if (region.mortalityStabilizers) {
    console.log(`✅ ${region.name}: mortalityStabilizers present`);
  } else {
    console.log(`❌ FAIL: ${region.name}: mortalityStabilizers MISSING`);
    missingStabilizers = true;
  }
}

// Summary
console.log('\n=== Summary ===');
const allPassed = !oldNamesFound && !canonicalMissing && !missingStabilizers;

if (allPassed) {
  console.log('✅ ALL TESTS PASSED');
  console.log('\nThe fix resolves the Monte Carlo error:');
  console.log('  "❌ Region Eastern Asia missing mortalityStabilizers"');
  console.log('\nRegions now use canonical names and have mortalityStabilizers at initialization.');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  process.exit(1);
}
