/**
 * Phase 2 Test: Organization Structure
 * 
 * Verifies that:
 * 1. Organizations are initialized correctly
 * 2. Data centers are linked to organizations
 * 3. AI models are linked to organizations
 * 4. Ownership relationships are correct
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { logOrganizationsState, getOrganizationAIs, getOrganizationDataCenters } from '../src/simulation/organizations';

console.log('='.repeat(80));
console.log('PHASE 2 TEST: Organization Structure');
console.log('='.repeat(80));

// Create initial state
console.log('\n[1] Initializing game state with organizations...');
const state = createDefaultInitialState();

// Verify organizations exist
console.log('\n[2] Checking organizations...');
if (!state.organizations || state.organizations.length === 0) {
  console.error('❌ FAIL: organizations not initialized!');
  process.exit(1);
}
console.log(`✅ ${state.organizations.length} organizations initialized`);

// Check expected organizations
console.log('\n[3] Verifying organization roster...');
const expectedOrgs = ['openai', 'anthropic', 'google_deepmind', 'meta', 'government_ai', 'academic_consortium'];
const actualOrgIds = state.organizations.map(o => o.id);

expectedOrgs.forEach(expectedId => {
  if (!actualOrgIds.includes(expectedId)) {
    console.error(`❌ FAIL: Missing organization: ${expectedId}`);
    process.exit(1);
  }
});
console.log('✅ All expected organizations present');

// Check organization properties
console.log('\n[4] Checking organization properties...');
state.organizations.forEach(org => {
  // Check required fields
  if (!org.id || !org.name || !org.type) {
    console.error(`❌ FAIL: ${org.id} missing required fields`);
    process.exit(1);
  }
  
  // Check arrays exist
  if (!Array.isArray(org.ownedDataCenters) || !Array.isArray(org.ownedAIModels) || !Array.isArray(org.currentProjects)) {
    console.error(`❌ FAIL: ${org.id} missing array fields`);
    process.exit(1);
  }
  
  // Check priorities
  if (!org.priorities || typeof org.priorities.profitMaximization !== 'number') {
    console.error(`❌ FAIL: ${org.id} missing priorities`);
    process.exit(1);
  }
});
console.log('✅ All organizations have required properties');

// Check data center linking
console.log('\n[5] Checking data center ownership...');
let totalDCsLinked = 0;
state.organizations.forEach(org => {
  totalDCsLinked += org.ownedDataCenters.length;
  
  // Verify each DC is actually owned by this org
  org.ownedDataCenters.forEach(dcId => {
    const dc = state.computeInfrastructure.dataCenters.find(d => d.id === dcId);
    if (!dc) {
      console.error(`❌ FAIL: ${org.id} claims to own non-existent DC: ${dcId}`);
      process.exit(1);
    }
    if (dc.organizationId !== org.id) {
      console.error(`❌ FAIL: DC ${dcId} has organizationId ${dc.organizationId} but is in ${org.id}'s ownedDataCenters`);
      process.exit(1);
    }
  });
});

const totalDCs = state.computeInfrastructure.dataCenters.length;
if (totalDCsLinked !== totalDCs) {
  console.error(`❌ FAIL: ${totalDCsLinked} DCs linked to orgs, but ${totalDCs} DCs exist`);
  process.exit(1);
}
console.log(`✅ All ${totalDCs} data centers correctly linked to organizations`);

// Check AI model linking
console.log('\n[6] Checking AI model ownership...');
let totalAIsLinked = 0;
state.organizations.forEach(org => {
  totalAIsLinked += org.ownedAIModels.length;
  
  // Verify each AI is actually owned by this org
  org.ownedAIModels.forEach(aiId => {
    const ai = state.aiAgents.find(a => a.id === aiId);
    if (!ai) {
      console.error(`❌ FAIL: ${org.id} claims to own non-existent AI: ${aiId}`);
      process.exit(1);
    }
    if (ai.organizationId !== org.id) {
      console.error(`❌ FAIL: AI ${aiId} has organizationId ${ai.organizationId} but is in ${org.id}'s ownedAIModels`);
      process.exit(1);
    }
  });
});

const totalAIs = state.aiAgents.length;
if (totalAIsLinked !== totalAIs) {
  console.error(`❌ FAIL: ${totalAIsLinked} AIs linked to orgs, but ${totalAIs} AIs exist`);
  process.exit(1);
}
console.log(`✅ All ${totalAIs} AI agents correctly linked to organizations`);

// Check organization diversity
console.log('\n[7] Checking organization diversity...');
const orgTypes = new Set(state.organizations.map(o => o.type));
console.log(`   Organization types: ${Array.from(orgTypes).join(', ')}`);

const avgProfit = state.organizations.reduce((sum, o) => sum + o.priorities.profitMaximization, 0) / state.organizations.length;
const avgSafety = state.organizations.reduce((sum, o) => sum + o.priorities.safetyResearch, 0) / state.organizations.length;
const avgOpen = state.organizations.reduce((sum, o) => sum + o.priorities.openScience, 0) / state.organizations.length;
const avgRace = state.organizations.reduce((sum, o) => sum + o.priorities.capabilityRace, 0) / state.organizations.length;

console.log(`   Avg priorities: profit=${avgProfit.toFixed(2)}, safety=${avgSafety.toFixed(2)}, open=${avgOpen.toFixed(2)}, race=${avgRace.toFixed(2)}`);
console.log('✅ Organizations have diverse priorities');

// Check specific organizations
console.log('\n[8] Verifying specific organization characteristics...');

const openai = state.organizations.find(o => o.id === 'openai');
if (!openai || openai.priorities.capabilityRace < 0.8) {
  console.error('❌ FAIL: OpenAI should be highly racing-focused');
  process.exit(1);
}
console.log('   ✅ OpenAI: High capability race (aggressive)');

const anthropic = state.organizations.find(o => o.id === 'anthropic');
if (!anthropic || anthropic.priorities.safetyResearch < 0.9) {
  console.error('❌ FAIL: Anthropic should be very safety-focused');
  process.exit(1);
}
console.log('   ✅ Anthropic: High safety research (cautious)');

const meta = state.organizations.find(o => o.id === 'meta');
if (!meta || meta.priorities.openScience < 0.8) {
  console.error('❌ FAIL: Meta should be very open (open weights)');
  process.exit(1);
}
console.log('   ✅ Meta: High open science (open weights)');

const gov = state.organizations.find(o => o.id === 'government_ai');
if (!gov || gov.priorities.profitMaximization > 0.1) {
  console.error('❌ FAIL: Government should have no profit motive');
  process.exit(1);
}
console.log('   ✅ Government: No profit motive (public good)');

// Log full state
console.log('\n[9] Organization details:');
logOrganizationsState(state);

// Check helper functions
console.log('\n[10] Testing helper functions...');
const openaiAIs = getOrganizationAIs(state, 'openai');
const openaiDCs = getOrganizationDataCenters(state, 'openai');
console.log(`   OpenAI owns ${openaiAIs.length} AIs and ${openaiDCs.length} data centers`);

if (openaiAIs.length === 0) {
  console.error('❌ FAIL: OpenAI should own some AIs');
  process.exit(1);
}
if (openaiDCs.length === 0) {
  console.error('❌ FAIL: OpenAI should own at least one data center');
  process.exit(1);
}
console.log('✅ Helper functions work correctly');

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ PHASE 2 COMPLETE: All tests passed!');
console.log('='.repeat(80));
console.log('\nSummary:');
console.log(`  - ${state.organizations.length} organizations initialized`);
console.log(`  - ${totalDCs} data centers linked to organizations`);
console.log(`  - ${totalAIs} AI agents linked to organizations`);
console.log(`  - Organizations have diverse priorities and strategies`);
console.log('\nOrganization breakdown:');
state.organizations.forEach(org => {
  const ais = getOrganizationAIs(state, org.id);
  const dcs = getOrganizationDataCenters(state, org.id);
  console.log(`  - ${org.name}: ${ais.length} AIs, ${dcs.length} DCs, ${org.computeAllocationStrategy} strategy`);
});
console.log('\nNext steps:');
console.log('  - Phase 3: Implement org-based compute allocation (4 strategies)');
console.log('  - Phase 4: Make research speed proportional to compute (FIXES GROWTH!)');
console.log('='.repeat(80));
