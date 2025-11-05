/**
 * Validate Region Name Consistency
 *
 * FIX (Nov 5, 2025): Ensure all regions use canonical RegionName type
 * Root cause: Old UN statistical names ("Eastern Asia", "Southern Asia", "Northern America")
 * were causing mortalityStabilizers initialization to fail because regions couldn't be found.
 *
 * This script validates that:
 * 1. All regional populations use canonical names from RegionName type
 * 2. All countries map to valid regions
 * 3. mortalityStabilizers are properly initialized for all regions
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import type { RegionName } from '../src/types/populationProvider';

console.log('🔍 Validating region name consistency...\n');

// Create initial state
const state = createDefaultInitialState();

// Expected canonical region names
const EXPECTED_REGIONS: RegionName[] = [
  'North America',
  'Europe',
  'East Asia',
  'South Asia',
  'Sub-Saharan Africa',
  'Latin America',
  'Middle East & North Africa'
];

let passed = 0;
let failed = 0;

// Validate regional populations use canonical names
console.log('=== Regional Populations ===');
const regionalPops = state.humanPopulationSystem.regionalPopulations || [];

if (regionalPops.length === 0) {
  console.log('❌ No regional populations found (will be initialized on first update)');
  console.log('   Triggering initialization...\n');

  // Initialize by calling update
  const { updateRegionalPopulations } = require('../src/simulation/regionalPopulations');
  updateRegionalPopulations(state);
}

const actualRegions = state.humanPopulationSystem.regionalPopulations!.map(r => r.name);

for (const region of EXPECTED_REGIONS) {
  const found = actualRegions.includes(region);
  if (found) {
    console.log(`✅ ${region}`);
    passed++;
  } else {
    console.log(`❌ ${region} - NOT FOUND`);
    failed++;
  }
}

// Check for unexpected old names
const OLD_NAMES = ['Eastern Asia', 'Southern Asia', 'Northern America', 'South-East Asia'];
for (const oldName of OLD_NAMES) {
  const found = actualRegions.includes(oldName);
  if (found) {
    console.log(`❌ Found old name: ${oldName}`);
    failed++;
  }
}

// Validate mortalityStabilizers are initialized
console.log('\n=== Mortality Stabilizers ===');
for (const region of state.humanPopulationSystem.regionalPopulations!) {
  if (region.mortalityStabilizers) {
    console.log(`✅ ${region.name}: mortalityStabilizers initialized`);
    passed++;
  } else {
    console.log(`❌ ${region.name}: mortalityStabilizers MISSING`);
    failed++;
  }
}

// Validate countries map to valid regions
console.log('\n=== Country-Region Mapping ===');
const countrySystem = state.countryPopulationSystem;
const countries = countrySystem.countries;

for (const [countryName, country] of Object.entries(countries)) {
  // Check if region is valid
  const isValid = EXPECTED_REGIONS.includes(country.region as RegionName);
  if (isValid) {
    console.log(`✅ ${countryName} → ${country.region}`);
    passed++;
  } else {
    console.log(`❌ ${countryName} → ${country.region} (INVALID REGION)`);
    failed++;
  }
}

// Summary
console.log('\n=== Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All region names are consistent!');
  process.exit(0);
} else {
  console.log('\n💥 Region name inconsistencies found!');
  process.exit(1);
}
