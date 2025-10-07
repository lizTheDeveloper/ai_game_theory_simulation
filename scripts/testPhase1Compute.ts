/**
 * Phase 1 Test: Data Center Infrastructure
 * 
 * Verifies that:
 * 1. Data centers are initialized correctly
 * 2. Total compute is calculated properly
 * 3. AI agents have compute fields
 * 4. Equal allocation works
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { 
  getTotalCompute, 
  getTotalCapacity, 
  allocateComputeEqually,
  logComputeState
} from '../src/simulation/computeInfrastructure';

console.log('='.repeat(80));
console.log('PHASE 1 TEST: Data Center Infrastructure');
console.log('='.repeat(80));

// Create initial state
console.log('\n[1] Initializing game state...');
const state = createDefaultInitialState();

// Verify compute infrastructure exists
console.log('\n[2] Checking compute infrastructure...');
if (!state.computeInfrastructure) {
  console.error('❌ FAIL: computeInfrastructure not initialized!');
  process.exit(1);
}
console.log('✅ computeInfrastructure exists');

// Check data centers
console.log('\n[3] Checking data centers...');
const { dataCenters } = state.computeInfrastructure;
console.log(`   Total data centers: ${dataCenters.length}`);

dataCenters.forEach(dc => {
  console.log(`   - ${dc.name}:`);
  console.log(`       Owner: ${dc.organizationId}`);
  console.log(`       Capacity: ${dc.capacity} PF`);
  console.log(`       Efficiency: ${dc.efficiency}x`);
  console.log(`       Effective: ${(dc.capacity * dc.efficiency).toFixed(1)} PF`);
  console.log(`       Operational: ${dc.operational ? 'Yes' : 'No'}`);
  console.log(`       Restricted: ${dc.restrictedAccess ? 'Yes' : 'No'}`);
});

// Calculate totals
console.log('\n[4] Computing totals...');
const totalCapacity = getTotalCapacity(state.computeInfrastructure);
const totalCompute = getTotalCompute(state.computeInfrastructure);

console.log(`   Total Capacity: ${totalCapacity.toFixed(1)} PF`);
console.log(`   Total Effective Compute: ${totalCompute.toFixed(1)} PF`);

// Verify expected total (should be ~630 PF)
const expectedMin = 600;
const expectedMax = 650;
if (totalCompute < expectedMin || totalCompute > expectedMax) {
  console.error(`❌ FAIL: Total compute ${totalCompute.toFixed(1)} PF is outside expected range [${expectedMin}, ${expectedMax}]`);
  process.exit(1);
}
console.log(`✅ Total compute is within expected range [${expectedMin}, ${expectedMax}] PF`);

// Check AI agents have compute fields
console.log('\n[5] Checking AI agent compute fields...');
const aiWithoutCompute = state.aiAgents.filter(ai => 
  ai.allocatedCompute === undefined || 
  ai.computeEfficiency === undefined
);

if (aiWithoutCompute.length > 0) {
  console.error(`❌ FAIL: ${aiWithoutCompute.length} AI agents missing compute fields`);
  aiWithoutCompute.forEach(ai => console.error(`   - ${ai.id}`));
  process.exit(1);
}
console.log(`✅ All ${state.aiAgents.length} AI agents have compute fields`);

// Sample AI compute fields
const sampleAI = state.aiAgents[0];
console.log(`   Sample (${sampleAI.id}):`);
console.log(`     allocatedCompute: ${sampleAI.allocatedCompute}`);
console.log(`     computeEfficiency: ${sampleAI.computeEfficiency.toFixed(3)}`);
console.log(`     organizationId: ${sampleAI.organizationId || 'undefined (Phase 2)'}`);

// Test equal allocation
console.log('\n[6] Testing equal compute allocation...');
allocateComputeEqually(state);

const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
const expectedPerAI = totalCompute / activeAIs.length;

console.log(`   Active AIs: ${activeAIs.length}`);
console.log(`   Expected per AI: ${expectedPerAI.toFixed(2)} PF`);

let allocationCorrect = true;
activeAIs.forEach(ai => {
  if (Math.abs(ai.allocatedCompute - expectedPerAI) > 0.01) {
    console.error(`   ❌ ${ai.id}: ${ai.allocatedCompute.toFixed(2)} PF (expected ${expectedPerAI.toFixed(2)})`);
    allocationCorrect = false;
  }
});

if (!allocationCorrect) {
  console.error('❌ FAIL: Compute allocation incorrect');
  process.exit(1);
}
console.log(`✅ All active AIs allocated ${expectedPerAI.toFixed(2)} PF`);

// Verify allocation map
console.log('\n[7] Checking allocation map...');
const allocationMapSize = state.computeInfrastructure.computeAllocations.size;
if (allocationMapSize !== activeAIs.length) {
  console.error(`❌ FAIL: Allocation map size ${allocationMapSize} doesn't match active AIs ${activeAIs.length}`);
  process.exit(1);
}
console.log(`✅ Allocation map tracks all ${allocationMapSize} active AIs`);

// Log final state
console.log('\n[8] Compute infrastructure state:');
logComputeState(state.computeInfrastructure);

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ PHASE 1 COMPLETE: All tests passed!');
console.log('='.repeat(80));
console.log('\nSummary:');
console.log(`  - ${dataCenters.length} data centers initialized`);
console.log(`  - ${totalCompute.toFixed(1)} PF total effective compute`);
console.log(`  - ${state.aiAgents.length} AI agents with compute fields`);
console.log(`  - ${activeAIs.length} active AIs allocated ${expectedPerAI.toFixed(2)} PF each`);
console.log('\nNext steps:');
console.log('  - Phase 2: Add Organization structure and link DCs/AIs to orgs');
console.log('  - Phase 3: Implement org-based compute allocation strategies');
console.log('  - Phase 4: Make research speed proportional to compute (FIXES GROWTH!)');
console.log('='.repeat(80));
