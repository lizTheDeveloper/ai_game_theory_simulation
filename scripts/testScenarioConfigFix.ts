/**
 * Quick diagnostic test for scenario config fix
 *
 * Tests that:
 * 1. Scenario config is stored in state
 * 2. Government action selection reads the config
 * 3. Priorities are enforced
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';
import { selectGovernmentAction } from '../src/simulation/government';
import { SimulationEngine } from '../src/simulation/engine';

const seed = 42;

// Create engine for RNG
const tempEngine = new SimulationEngine(undefined as any, seed);
const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());

// Create initial state
console.log('\n=== Creating initial state ===');
const state = createDefaultInitialState(rng);

// Apply Scientific Acceleration scenario
console.log('\n=== Applying Scientific Acceleration scenario ===');
applyScenario(state, SCENARIOS.scientificAcceleration, rng);

// Check if scenario config is stored
console.log('\n=== Checking scenario config storage ===');
console.log(`state.scenarioConfig exists: ${!!state.scenarioConfig}`);
console.log(`state.scenarioConfig.name: ${state.scenarioConfig?.name}`);
console.log(`state.scenarioConfig.governmentPriorities:`, state.scenarioConfig?.governmentPriorities);

// Manually call selectGovernmentAction a few times to see what actions are selected
console.log('\n=== Testing government action selection ===');
for (let i = 0; i < 10; i++) {
  const selectedAction = selectGovernmentAction(state, rng);
  if (selectedAction) {
    console.log(`[${i}] Selected action: ${selectedAction.id}`);
  } else {
    console.log(`[${i}] No action selected`);
  }
  // Advance month to avoid first-month logging spam
  if (i === 0) state.currentMonth = 1;
}

console.log('\n✅ Test complete');
