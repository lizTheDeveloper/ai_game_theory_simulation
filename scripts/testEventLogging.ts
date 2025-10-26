/**
 * Test Event Logging Implementation
 * Verifies that events are being added to state.eventLog
 */

import { createInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

const state = createInitialState();
const orchestrator = new PhaseOrchestrator(state);

console.log('\n=== Event Logging Test ===\n');
console.log('Initial eventLog length:', state.eventLog.length);

// Run 12 months
for (let i = 0; i < 12; i++) {
  orchestrator.executeAll(state, () => Math.random());
}

console.log('\n=== After 12 months ===');
console.log('Total events logged:', state.eventLog.length);

// Group by type
const eventsByType: Record<string, number> = {};
for (const event of state.eventLog) {
  eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
}

console.log('\nEvents by type:');
for (const [type, count] of Object.entries(eventsByType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}

console.log('\nSample events (first 10):');
state.eventLog.slice(0, 10).forEach((e, i) => {
  console.log(`  ${i + 1}. [${e.type}/${e.severity}] ${e.title}`);
});

console.log('\n✅ Test complete!\n');
