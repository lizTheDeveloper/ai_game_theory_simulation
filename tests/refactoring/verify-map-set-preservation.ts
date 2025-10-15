/**
 * Verify that Map and Set objects are preserved correctly after refactoring
 *
 * Tests that:
 * 1. Map objects remain Map instances (not converted to {})
 * 2. Set objects remain Set instances (not converted to {})
 * 3. Data in Maps/Sets is accessible after simulation steps
 */

import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import { GameState } from '@/types/game';

console.log('🧪 Map/Set Preservation Verification\n');
console.log('================================================================================\n');

// Run a short simulation
const engine = new SimulationEngine({
  seed: 42000,
  maxMonths: 6,
  governmentActionFrequency: 0.5
});

const initialState = createDefaultInitialState();
const result = engine.run(initialState);
const finalState = result.history[result.history.length - 1].state;

// Test 1: computeAllocations should be a Map
console.log('📋 Test 1: computeAllocations is a Map');
const allocations = finalState.computeInfrastructure.computeAllocations;
const isMap = allocations instanceof Map;
console.log(`   Type: ${allocations.constructor.name}`);
console.log(`   Is Map: ${isMap ? '✅ YES' : '❌ NO'}`);
if (isMap) {
  console.log(`   Size: ${allocations.size} entries`);
  const entries = Array.from(allocations.entries()).slice(0, 3);
  console.log(`   Sample entries:`, entries);
}

// Test 2: contaminatedRegions should be a Set
console.log('\n📋 Test 2: contaminatedRegions is a Set');
const contaminated = finalState.radiationSystem.contaminatedRegions;
const isSet = contaminated instanceof Set;
console.log(`   Type: ${contaminated.constructor.name}`);
console.log(`   Is Set: ${isSet ? '✅ YES' : '❌ NO'}`);
if (isSet) {
  console.log(`   Size: ${contaminated.size} entries`);
}

// Test 3: biodiversitySystem.regions should be a Map
console.log('\n📋 Test 3: biodiversitySystem.regions is a Map');
const biodiversityRegions = finalState.biodiversitySystem.regions;
const isBioMap = biodiversityRegions instanceof Map;
console.log(`   Type: ${biodiversityRegions.constructor.name}`);
console.log(`   Is Map: ${isBioMap ? '✅ YES' : '❌ NO'}`);
if (isBioMap) {
  console.log(`   Size: ${biodiversityRegions.size} regions`);
  const sampleRegion = Array.from(biodiversityRegions.entries())[0];
  if (sampleRegion) {
    console.log(`   Sample region: ${sampleRegion[0]}`);
    console.log(`   Sample data keys:`, Object.keys(sampleRegion[1]));
  }
}

// Test 4: Check history snapshots preserve Maps/Sets
console.log('\n📋 Test 4: History snapshots preserve Maps/Sets');
if (result.history.length > 2) {
  const midpoint = Math.floor(result.history.length / 2);
  const midState = result.history[midpoint].state;

  const midAllocations = midState.computeInfrastructure.computeAllocations;
  const midIsMap = midAllocations instanceof Map;
  console.log(`   Snapshot at month ${midpoint}: computeAllocations is Map: ${midIsMap ? '✅ YES' : '❌ NO'}`);

  const midContaminated = midState.radiationSystem.contaminatedRegions;
  const midIsSet = midContaminated instanceof Set;
  console.log(`   Snapshot at month ${midpoint}: contaminatedRegions is Set: ${midIsSet ? '✅ YES' : '❌ NO'}`);
}

// Summary
console.log('\n================================================================================');
const allPassed = isMap && isSet && isBioMap;
if (allPassed) {
  console.log('✅ ALL TESTS PASSED - Map/Set objects are properly preserved!');
  console.log('\n✅ Success: structuredClone() correctly preserves Map and Set objects');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Map/Set objects were converted to plain objects');
  console.log('\n❌ Failure: JSON.parse(JSON.stringify()) is still being used somewhere');
  process.exit(1);
}
