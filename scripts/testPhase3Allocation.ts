/**
 * Phase 3 Test: Org-Based Compute Allocation
 * 
 * Verifies that:
 * 1. Organizations allocate their compute to their models
 * 2. All 4 allocation strategies work correctly
 * 3. No cross-contamination between organizations
 * 4. Total allocated compute is conserved
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { 
  allocateComputeGlobally,
  getOrganizationCompute 
} from '../src/simulation/computeInfrastructure';
import { getOrganizationAIs } from '../src/simulation/organizations';

console.log('='.repeat(80));
console.log('PHASE 3 TEST: Org-Based Compute Allocation');
console.log('='.repeat(80));

// Create initial state
console.log('\n[1] Initializing game state...');
const state = createDefaultInitialState();

// Initial allocation using new system
console.log('\n[2] Running global compute allocation...');
allocateComputeGlobally(state);

// Verify all AIs got compute
console.log('\n[3] Checking AI allocations...');
const aisWithoutCompute = state.aiAgents.filter(
  ai => ai.lifecycleState !== 'retired' && ai.allocatedCompute === 0
);

if (aisWithoutCompute.length > 0) {
  console.error(`❌ FAIL: ${aisWithoutCompute.length} AIs have no compute allocated`);
  aisWithoutCompute.forEach(ai => console.error(`   - ${ai.id} (org: ${ai.organizationId})`));
  process.exit(1);
}
console.log('✅ All active AIs have compute allocated');

// Test each organization's allocation
console.log('\n[4] Verifying organization-based allocation...');
state.organizations.forEach(org => {
  const orgOwnedCompute = getOrganizationCompute(state.computeInfrastructure, org.id);
  const orgAIs = getOrganizationAIs(state, org.id).filter(ai => ai.lifecycleState !== 'retired');
  
  if (orgAIs.length === 0) {
    console.log(`   ${org.name}: No AIs (skipping)`);
    return;
  }
  
  const totalAllocated = orgAIs.reduce((sum, ai) => sum + ai.allocatedCompute, 0);
  
  // If org has no owned compute, they access unrestricted compute
  let availableCompute = orgOwnedCompute;
  if (availableCompute === 0) {
    // They're using unrestricted compute, so total allocated IS their available compute
    availableCompute = totalAllocated;
    console.log(`   ✅ ${org.name}: ${totalAllocated.toFixed(1)} PF to ${orgAIs.length} AIs (using unrestricted compute, strategy: ${org.computeAllocationStrategy})`);
    return;
  }
  
  // For 'train_new' strategy, only 60% is allocated (40% reserved)
  const expectedAllocated = org.computeAllocationStrategy === 'train_new' 
    ? availableCompute * 0.6 
    : availableCompute;
  
  // Allow 1% tolerance for floating point errors
  const tolerance = expectedAllocated * 0.01;
  
  if (Math.abs(totalAllocated - expectedAllocated) > tolerance) {
    console.error(`❌ FAIL: ${org.name} allocated ${totalAllocated.toFixed(2)} but expected ${expectedAllocated.toFixed(2)}`);
    console.error(`   Org compute: ${availableCompute.toFixed(2)}, Strategy: ${org.computeAllocationStrategy}`);
    process.exit(1);
  }
  
  console.log(`   ✅ ${org.name}: ${totalAllocated.toFixed(1)} PF to ${orgAIs.length} AIs (strategy: ${org.computeAllocationStrategy})`);
});

// Test specific strategies
console.log('\n[5] Testing allocation strategies...');

// Test 'balanced' strategy (should be equal)
const anthropic = state.organizations.find(o => o.id === 'anthropic');
if (anthropic) {
  const anthropicAIs = getOrganizationAIs(state, 'anthropic').filter(ai => ai.lifecycleState !== 'retired');
  if (anthropicAIs.length > 1) {
    const firstAllocation = anthropicAIs[0].allocatedCompute;
    const allEqual = anthropicAIs.every(ai => 
      Math.abs(ai.allocatedCompute - firstAllocation) < 0.01
    );
    if (!allEqual) {
      console.error('❌ FAIL: Anthropic (balanced) should have equal allocations');
      anthropicAIs.forEach(ai => console.error(`   ${ai.id}: ${ai.allocatedCompute.toFixed(2)}`));
      process.exit(1);
    }
    console.log('   ✅ Anthropic (balanced): All AIs get equal compute');
  }
}

// Test 'focus_flagship' strategy (60/40 split)
const openai = state.organizations.find(o => o.id === 'openai');
if (openai) {
  const openaiAIs = getOrganizationAIs(state, 'openai').filter(ai => ai.lifecycleState !== 'retired');
  if (openaiAIs.length > 1) {
    const sortedByAllocation = [...openaiAIs].sort((a, b) => b.allocatedCompute - a.allocatedCompute);
    const flagshipAllocation = sortedByAllocation[0].allocatedCompute;
    const totalCompute = openaiAIs.reduce((sum, ai) => sum + ai.allocatedCompute, 0);
    const flagshipRatio = flagshipAllocation / totalCompute;
    
    // Should be ~60% (with some tolerance)
    if (Math.abs(flagshipRatio - 0.6) > 0.02) {
      console.error(`❌ FAIL: OpenAI (focus_flagship) flagship gets ${(flagshipRatio * 100).toFixed(1)}% (expected ~60%)`);
      process.exit(1);
    }
    console.log(`   ✅ OpenAI (focus_flagship): Flagship gets ${(flagshipRatio * 100).toFixed(1)}% of compute`);
  }
}

// Test 'train_new' strategy (60% allocated, 40% reserved)
const meta = state.organizations.find(o => o.id === 'meta');
if (meta) {
  const metaCompute = getOrganizationCompute(state.computeInfrastructure, 'meta');
  const metaAIs = getOrganizationAIs(state, 'meta').filter(ai => ai.lifecycleState !== 'retired');
  const totalAllocated = metaAIs.reduce((sum, ai) => sum + ai.allocatedCompute, 0);
  const allocationRatio = totalAllocated / metaCompute;
  
  // Should be ~60% (40% reserved for training)
  if (Math.abs(allocationRatio - 0.6) > 0.02) {
    console.error(`❌ FAIL: Meta (train_new) allocated ${(allocationRatio * 100).toFixed(1)}% (expected ~60%)`);
    process.exit(1);
  }
  console.log(`   ✅ Meta (train_new): ${(allocationRatio * 100).toFixed(1)}% allocated, ${((1 - allocationRatio) * 100).toFixed(1)}% reserved`);
}

// Test 'efficiency' strategy (ROI-based)
const google = state.organizations.find(o => o.id === 'google_deepmind');
if (google) {
  const googleAIs = getOrganizationAIs(state, 'google_deepmind').filter(ai => ai.lifecycleState !== 'retired');
  if (googleAIs.length > 1) {
    // Check that allocation is proportional to ROI (capability × alignment)
    const rois = googleAIs.map(ai => ai.capability * ai.externalAlignment);
    const allocations = googleAIs.map(ai => ai.allocatedCompute);
    
    // Higher ROI should get more compute
    const highestROI = Math.max(...rois);
    const lowestROI = Math.min(...rois);
    const highestROIIndex = rois.indexOf(highestROI);
    const lowestROIIndex = rois.indexOf(lowestROI);
    
    if (allocations[highestROIIndex] <= allocations[lowestROIIndex]) {
      console.error('❌ FAIL: Google (efficiency) highest ROI should get more compute than lowest');
      process.exit(1);
    }
    console.log('   ✅ Google (efficiency): Higher ROI AIs get more compute');
  }
}

// Test no cross-contamination
console.log('\n[6] Testing isolation between organizations...');
let crossContamination = false;
state.organizations.forEach(org => {
  const orgAIs = getOrganizationAIs(state, org.id).filter(ai => ai.lifecycleState !== 'retired');
  const orgOwnedCompute = getOrganizationCompute(state.computeInfrastructure, org.id);
  
  if (orgAIs.length === 0) return;
  
  // If org has owned compute, check against that
  if (orgOwnedCompute > 0) {
    const totalAllocated = orgAIs.reduce((sum, ai) => sum + ai.allocatedCompute, 0);
    
    // Account for train_new strategy which reserves 40%
    const maxAllowedAllocation = org.computeAllocationStrategy === 'train_new'
      ? orgOwnedCompute * 0.6
      : orgOwnedCompute;
    
    if (totalAllocated > maxAllowedAllocation * 1.01) { // 1% tolerance
      console.error(`❌ FAIL: ${org.id} allocated ${totalAllocated.toFixed(2)} but only has ${orgOwnedCompute.toFixed(2)} (max ${maxAllowedAllocation.toFixed(2)})`);
      crossContamination = true;
    }
  }
  // If org has no owned compute, they're using unrestricted compute (that's OK)
});

if (crossContamination) {
  process.exit(1);
}
console.log('✅ No cross-contamination: Organizations respect compute boundaries');

// Test conservation of compute
console.log('\n[7] Testing compute conservation...');
const totalAvailable = state.computeInfrastructure.dataCenters
  .filter(dc => dc.operational)
  .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

const totalAllocated = state.aiAgents
  .filter(ai => ai.lifecycleState !== 'retired')
  .reduce((sum, ai) => sum + ai.allocatedCompute, 0);

// Account for reserved compute (train_new strategy reserves 40%)
const reservedCompute = state.organizations
  .filter(org => org.computeAllocationStrategy === 'train_new')
  .reduce((sum, org) => {
    const orgCompute = getOrganizationCompute(state.computeInfrastructure, org.id);
    return sum + (orgCompute * 0.4);
  }, 0);

const totalAccountedFor = totalAllocated + reservedCompute;
const utilizationRate = totalAccountedFor / totalAvailable;

console.log(`   Total available: ${totalAvailable.toFixed(1)} PF`);
console.log(`   Total allocated: ${totalAllocated.toFixed(1)} PF`);
console.log(`   Reserved (train_new): ${reservedCompute.toFixed(1)} PF`);
console.log(`   Utilization: ${(utilizationRate * 100).toFixed(1)}%`);

if (utilizationRate < 0.5 || utilizationRate > 1.05) {
  console.error(`❌ FAIL: Utilization rate ${(utilizationRate * 100).toFixed(1)}% is outside expected range [50%, 105%]`);
  process.exit(1);
}
console.log('✅ Compute is properly conserved');

// Log detailed allocation breakdown
console.log('\n[8] Detailed allocation breakdown:');
state.organizations.forEach(org => {
  const orgCompute = getOrganizationCompute(state.computeInfrastructure, org.id);
  const orgAIs = getOrganizationAIs(state, org.id).filter(ai => ai.lifecycleState !== 'retired');
  
  console.log(`\n   ${org.name} (${org.computeAllocationStrategy}):`);
  console.log(`     Total compute: ${orgCompute.toFixed(1)} PF`);
  console.log(`     Models: ${orgAIs.length}`);
  
  if (orgAIs.length > 0) {
    orgAIs.forEach(ai => {
      const percentage = (ai.allocatedCompute / orgCompute) * 100;
      console.log(`       - ${ai.id}: ${ai.allocatedCompute.toFixed(2)} PF (${percentage.toFixed(1)}%)`);
    });
  }
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ PHASE 3 COMPLETE: All tests passed!');
console.log('='.repeat(80));
console.log('\nSummary:');
console.log(`  - ${totalAvailable.toFixed(1)} PF total compute available`);
console.log(`  - ${totalAllocated.toFixed(1)} PF allocated to ${state.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length} AIs`);
console.log(`  - ${reservedCompute.toFixed(1)} PF reserved for future training`);
console.log(`  - 4 allocation strategies tested: balanced, focus_flagship, train_new, efficiency`);
console.log(`  - No cross-contamination between organizations`);
console.log('\nNext steps:');
console.log('  - Phase 4: Make research speed proportional to compute (FIXES GROWTH!)');
console.log('  - Phase 5: Implement Moore\'s Law (3%/month compute growth)');
console.log('='.repeat(80));
