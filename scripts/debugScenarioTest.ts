/**
 * Debug Scenario Test - Single scenario, 3 months, verbose logging
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';

console.log('='.repeat(80));
console.log('DEBUG: Testing Techno-Optimist Scenario');
console.log('='.repeat(80));

const scenario = SCENARIOS.technoOptimist;
const seed = 42;

// Create engine and state
const tempEngine = new SimulationEngine(undefined as any, seed);
const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
const state = createDefaultInitialState(rng);

console.log(`\nBEFORE applyScenario:`);
console.log(`  state.scenarioConfig = ${state.scenarioConfig}`);

// Apply scenario
applyScenario(state, scenario, rng);

console.log(`\nAFTER applyScenario:`);
console.log(`  state.scenarioConfig = ${!!state.scenarioConfig}`);
console.log(`  state.scenarioConfig.name = ${state.scenarioConfig?.name}`);
console.log(`  scientificResearch priority = ${state.scenarioConfig?.governmentPriorities?.scientificResearch}`);

// Create engine and run
const engine = new SimulationEngine(undefined as any, seed);

console.log(`\n${'='.repeat(80)}`);
console.log('RUNNING SIMULATION (3 months)');
console.log('='.repeat(80));

for (let month = 0; month < 3; month++) {
  console.log(`\n--- MONTH ${month} START ---`);
  console.log(`state.currentMonth = ${state.currentMonth}`);
  console.log(`state.scenarioConfig = ${!!state.scenarioConfig}`);

  engine.step(state);

  console.log(`--- MONTH ${month} END ---`);
  console.log(`state.currentMonth = ${state.currentMonth}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log('FINAL STATE');
console.log('='.repeat(80));
console.log(`Research spending: $${(state.government.researchSpending / 1e9).toFixed(2)}B`);
console.log(`Gini: ${state.inequality?.gini ?? 0.4}`);
