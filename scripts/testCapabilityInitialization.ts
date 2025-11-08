/**
 * Test AI Capability Initialization Bug Fix (Nov 8, 2025)
 *
 * Verifies that all AI capabilities are initialized as discrete integers [0-5],
 * not continuous values (0.165, 4.3, etc.)
 */

import { initializeCapabilityProfile, scaleCapabilityProfile } from '../src/simulation/capabilities';
import { createInitialGameState } from '../src/simulation/initialization';

console.log('🧪 Testing AI Capability Initialization Fix\n');

// Test 1: initializeCapabilityProfile returns integers
console.log('Test 1: initializeCapabilityProfile() produces discrete integers');
const profile = initializeCapabilityProfile(12345);

const coreDimensions = ['physical', 'digital', 'cognitive', 'social', 'economic', 'selfImprovement'] as const;
let allInteger = true;
let allInRange = true;

for (const dim of coreDimensions) {
  const value = profile[dim] as number;
  const isInteger = Number.isInteger(value);
  const inRange = value >= 0 && value <= 5;

  console.log(`  ${dim}: ${value} - ${isInteger ? '✅ Integer' : '❌ NOT INTEGER'} ${inRange ? '✅ In [0,5]' : '❌ OUT OF RANGE'}`);

  if (!isInteger) allInteger = false;
  if (!inRange) allInRange = false;
}

// Test research dimensions
console.log('\n  Research dimensions:');
const researchCategories = ['biotech', 'materials', 'climate', 'computerScience'] as const;
for (const category of researchCategories) {
  const subfields = profile.research[category];
  for (const [subfield, value] of Object.entries(subfields)) {
    const isInteger = Number.isInteger(value);
    const inRange = value >= 0 && value <= 5;

    console.log(`    ${category}.${subfield}: ${value} - ${isInteger ? '✅' : '❌'} ${inRange ? '✅' : '❌'}`);

    if (!isInteger) allInteger = false;
    if (!inRange) allInRange = false;
  }
}

console.log(`\n  Result: ${allInteger && allInRange ? '✅ PASS - All capabilities are discrete integers [0-5]' : '❌ FAIL - Some capabilities are continuous or out of range'}\n`);

// Test 2: scaleCapabilityProfile returns integers
console.log('Test 2: scaleCapabilityProfile() produces discrete integers');
const scaledProfile = scaleCapabilityProfile(profile, 1.15);

allInteger = true;
allInRange = true;

for (const dim of coreDimensions) {
  const value = scaledProfile[dim] as number;
  const isInteger = Number.isInteger(value);
  const inRange = value >= 0 && value <= 5;

  if (!isInteger) {
    console.log(`  ❌ ${dim}: ${value} is not an integer`);
    allInteger = false;
  }
  if (!inRange) {
    console.log(`  ❌ ${dim}: ${value} is out of range [0,5]`);
    allInRange = false;
  }
}

console.log(`  Result: ${allInteger && allInRange ? '✅ PASS - Scaled capabilities are discrete integers [0-5]' : '❌ FAIL - Some scaled capabilities are continuous or out of range'}\n`);

// Test 3: Full game state initialization
console.log('Test 3: Full game state initialization');
const state = createInitialGameState('baseline', 42);

allInteger = true;
allInRange = true;
let errorCount = 0;

for (const agent of state.aiAgents) {
  for (const dim of coreDimensions) {
    const value = agent.capabilityProfile[dim] as number;
    if (!Number.isInteger(value) || value < 0 || value > 5) {
      if (errorCount < 5) {
        console.log(`  ❌ Agent ${agent.id} ${dim}: ${value}`);
      }
      errorCount++;
      allInteger = false;
      allInRange = false;
    }
  }
}

console.log(`  Checked ${state.aiAgents.length} agents × ${coreDimensions.length} dimensions = ${state.aiAgents.length * coreDimensions.length} values`);
console.log(`  Result: ${allInteger && allInRange ? '✅ PASS - All agent capabilities are discrete integers [0-5]' : `❌ FAIL - ${errorCount} capabilities are continuous or out of range`}\n`);

// Final summary
const allTestsPass = allInteger && allInRange;
console.log(`\n${'='.repeat(80)}`);
console.log(allTestsPass ? '✅ ALL TESTS PASSED - Capability initialization fix verified' : '❌ TESTS FAILED - Capabilities still have continuous values');
console.log('='.repeat(80));

process.exit(allTestsPass ? 0 : 1);
