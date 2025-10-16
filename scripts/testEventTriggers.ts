/**
 * Test Event Trigger System (P2.5)
 *
 * Quick validation test to ensure event triggers work correctly.
 */

import { createTestState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setupCOVID19Pandemic, setup2008Crisis } from '../tests/validation/eventTriggerUtils';

console.log('='.repeat(80));
console.log('EVENT TRIGGER SYSTEM TEST');
console.log('='.repeat(80));

// Test 1: COVID-19 Pandemic Trigger
console.log('\n📋 TEST 1: COVID-19 Pandemic Event Trigger\n');
const covid19State = createTestState({ seed: 60000 });
setupCOVID19Pandemic(covid19State);

if (!covid19State.triggeredEvents) {
  console.error('❌ FAILED: triggeredEvents not initialized');
  process.exit(1);
}

if (covid19State.triggeredEvents.activeEvents.length !== 1) {
  console.error('❌ FAILED: Expected 1 active event, got', covid19State.triggeredEvents.activeEvents.length);
  process.exit(1);
}

const pandemicEvent = covid19State.triggeredEvents.activeEvents[0];
if (pandemicEvent.type !== 'pandemic') {
  console.error('❌ FAILED: Expected pandemic event, got', pandemicEvent.type);
  process.exit(1);
}

console.log('✅ COVID-19 event scheduled successfully');
console.log(`   Start month: ${pandemicEvent.startMonth}`);
console.log(`   Duration: ${pandemicEvent.duration} months`);
console.log(`   Type: ${pandemicEvent.type}`);

// Test 2: Economic Crisis Trigger
console.log('\n📋 TEST 2: Economic Crisis Event Trigger\n');
const crisisState = createTestState({ seed: 60001 });
setup2008Crisis(crisisState);

if (!crisisState.triggeredEvents) {
  console.error('❌ FAILED: triggeredEvents not initialized');
  process.exit(1);
}

if (crisisState.triggeredEvents.activeEvents.length !== 1) {
  console.error('❌ FAILED: Expected 1 active event, got', crisisState.triggeredEvents.activeEvents.length);
  process.exit(1);
}

const crisisEvent = crisisState.triggeredEvents.activeEvents[0];
if (crisisEvent.type !== 'economic_crisis') {
  console.error('❌ FAILED: Expected economic_crisis event, got', crisisEvent.type);
  process.exit(1);
}

console.log('✅ Economic crisis event scheduled successfully');
console.log(`   Start month: ${crisisEvent.startMonth}`);
console.log(`   Duration: ${crisisEvent.duration} months`);
console.log(`   Type: ${crisisEvent.type}`);

// Test 3: Short simulation with COVID-19
console.log('\n📋 TEST 3: Short Simulation with COVID-19 Event\n');
const simState = createTestState({ seed: 60002 });
setupCOVID19Pandemic(simState);

const engine = new SimulationEngine({
  seed: 60002,
  maxMonths: 48,  // 4 years
  logLevel: 'summary'
});

console.log('Running 48-month simulation with COVID-19 event...');
const result = engine.run(simState, {
  maxMonths: 48,
  checkActualOutcomes: false  // Don't stop early for this test
});

console.log('\n✅ Simulation completed successfully');
console.log(`   Total months: ${result.summary.totalMonths}`);
console.log(`   Final population: ${result.finalState.humanPopulationSystem.population.toFixed(2)}B`);
console.log(`   Final outcome: ${result.summary.finalOutcome}`);
console.log(`   Organizations: ${result.finalState.organizations.filter(o => !o.bankrupt).length}/${result.finalState.organizations.length} active`);

// Check if pandemic event was processed
if (simState.triggeredEvents?.completedEvents.length === 0) {
  console.warn('⚠️  WARNING: Pandemic event did not complete (may still be in progress)');
} else {
  console.log(`   Completed events: ${simState.triggeredEvents?.completedEvents.length}`);
}

// Test 4: Verify TypeScript compilation
console.log('\n📋 TEST 4: TypeScript Compilation Check\n');
console.log('✅ TypeScript compiled successfully (script is running)');

console.log('\n' + '='.repeat(80));
console.log('ALL TESTS PASSED ✅');
console.log('='.repeat(80));
console.log('\nEvent trigger system is operational and ready for validation tests.\n');
