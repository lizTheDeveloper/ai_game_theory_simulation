/**
 * Debug climate-first scenario to find month 49 termination cause
 */

import { runScenario } from './scenarioRunner';
import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIO_CATALOG } from '../src/types/scenarios';

console.log('\n='.repeat(80));
console.log('DEBUG: climate-first Scenario');
console.log('='.repeat(80));

// Manually replicate what runScenario does with extra logging
const scenarioId = 'climate-first';
const seed = 1000;
const maxMonths = 60;

const scenario = SCENARIO_CATALOG[scenarioId];
console.log(`\nScenario: ${scenario.name}`);
console.log(`Max months: ${maxMonths}\n`);

// Create engine
const tempEngine = new SimulationEngine({ seed });
const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());

// Create initial state
const state = createDefaultInitialState(rng);
console.log(`Initial state created - currentMonth: ${state.currentMonth}`);

// Apply scenario (THIS is where the bug might be)
console.log('\nApplying scenario...');
state.scenario = scenario as any;

// Check starting conditions
if (scenario.startingConditions) {
  console.log('  Has startingConditions - checking techDeploymentStartMonth...');
  console.log(`    techDeploymentStartMonth: ${scenario.startingConditions.techDeploymentStartMonth}`);
} else {
  console.log('  NO startingConditions - should not modify currentMonth');
}

// Actually run the scenario normally
console.log('\nRunning via runScenario...\n');
const result = runScenario(scenarioId, seed, maxMonths);

console.log('\n='.repeat(80));
console.log('RESULT:');
console.log(`  Months simulated: ${result.monthsSimulated}`);
console.log(`  Expected: ${maxMonths}`);
console.log(`  Outcome: ${result.outcome}`);
console.log('='.repeat(80));

if (result.monthsSimulated < maxMonths) {
  console.error(`\n❌ EARLY TERMINATION at month ${result.monthsSimulated}`);
  process.exit(1);
} else {
  console.log(`\n✅ Completed full duration`);
}
