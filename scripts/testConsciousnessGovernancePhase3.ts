/**
 * Test script for Consciousness Governance Phase 3 implementation
 * Validates regional variation, stage progression, and cross-regional dynamics
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🧪 TESTING CONSCIOUSNESS GOVERNANCE PHASE 3\n');
console.log('===========================================\n');

// Initialize state
const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 'phase3-test', maxMonths: 120 });

console.log('📊 INITIAL STATE:');
console.log(`Scenario: ${initialState.consciousnessGovernanceReadiness.scenarioTrajectory}`);
console.log(`Corporate Support: ${initialState.consciousnessGovernanceReadiness.accelerators.corporateSupport.toFixed(3)}`);
console.log(`Scientific Consensus: ${initialState.consciousnessGovernanceReadiness.accelerators.scientificConsensus.toFixed(3)}`);
console.log('');
console.log('Regional Preparedness:');
for (const [region, data] of Object.entries(initialState.consciousnessGovernanceReadiness.regional)) {
  console.log(`  ${region.padEnd(12)}: ${data.preparedness.toFixed(1)}% [${data.stage}] (${data.politicalRegimeType})`);
}

// Run simulation for 120 months (10 years)
console.log('\n🏃 RUNNING SIMULATION (120 months)...\n');

const result = engine.run(initialState, { maxMonths: 120, checkActualOutcomes: false });

console.log('\n\n✅ TEST COMPLETE\n');
console.log('📈 FINAL STATE:');
const gov = result.finalState.consciousnessGovernanceReadiness;
console.log(`Scenario: ${gov.scenarioTrajectory} (determined month ${gov.scenarioDeterminedMonth})`);
console.log(`Rights Established: ${gov.rightsEstablished ? `YES (month ${gov.rightsEstablishedMonth})` : 'NO'}`);
console.log(`Rights Reversed: ${gov.rightsReversed ? `YES (month ${gov.rightsReversedMonth})` : 'NO'}`);
console.log('');
console.log('Regional Preparedness:');
for (const [region, data] of Object.entries(gov.regional)) {
  console.log(`  ${region.padEnd(12)}: ${data.preparedness.toFixed(1).padStart(5)}% [${data.stage.padEnd(13)}]`);
  console.log(`    Acknowledgment: ${(data.acknowledgmentLevel * 100).toFixed(0).padStart(3)}%  Assessment: ${(data.assessmentCapacity * 100).toFixed(0).padStart(3)}%  Policy: ${(data.policyPreparation * 100).toFixed(0).padStart(3)}%`);
  console.log(`    Regime: ${data.politicalRegimeType.padEnd(14)} Erosion: ${(data.institutionalErosion * 100).toFixed(0).padStart(3)}%`);
  console.log('');
}
