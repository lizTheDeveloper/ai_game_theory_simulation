/**
 * Test Bug 2 Fix: Readonly property violation in ApplyScenarioPrioritiesPhase
 *
 * Before fix: Crash with "Cannot set property democracy of #<Object> which has only a getter"
 * After fix: Should run without error
 */

import { createDefaultInitialState } from '../src/simulation/initialization.js';
import { SimulationEngine } from '../src/simulation/engine.js';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree.js';

const seed = 42;
const engine = new SimulationEngine(undefined as any, seed);
const rng = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rng);

console.log('🧪 Testing Bug 2 Fix: Readonly property violation');
console.log('================================================================================\n');

// Deploy all tech (god mode)
const allTech = getAllTech();
if (!state.techTreeState.deploymentLevels) {
  state.techTreeState.deploymentLevels = {};
}
for (const tech of allTech) {
  if (!state.techTreeState.unlockedTech.includes(tech.id)) {
    state.techTreeState.unlockedTech.push(tech.id);
  }
  state.techTreeState.deploymentLevels[tech.id] = 1.0;
}

// Apply democratic scenario priorities (this is what was crashing)
state.scenario = {
  id: 'democratic-participation',
  name: 'Democratic Participation Test',
  description: 'Tests if democracy level can be set without crashing',
  godMode: true,
  initialConditions: {},
  governmentPriorities: {
    democracyLevel: 0.8,
    researchInvestment: 25
  }
};

console.log('Before scenario application:');
console.log(`  Democracy (computed getter): ${state.government.democracy?.toFixed(2)}`);
console.log(`  Participation rate: ${state.government.governanceQuality.participationRate.toFixed(2)}`);
console.log(`  Transparency: ${state.government.governanceQuality.transparency.toFixed(2)}\n`);

// Create engine with state and step (this will apply scenario priorities)
const testEngine = new SimulationEngine(state, seed);

try {
  console.log('Applying scenario priorities (running 1 simulation step)...');
  testEngine.step();

  console.log('\n✅ SUCCESS: No readonly property error!');
  console.log('\nAfter scenario application:');
  console.log(`  Democracy (computed getter): ${state.government.democracy?.toFixed(2)} (should be ~0.80)`);
  console.log(`  Participation rate: ${state.government.governanceQuality.participationRate.toFixed(2)} (should be 0.80)`);
  console.log(`  Transparency: ${state.government.governanceQuality.transparency.toFixed(2)} (should be 0.80)`);
  console.log(`  Research budget: $${state.government.researchInvestments.totalBudget}B (should be $25B)`);

  // Verify values were actually set
  if (state.government.governanceQuality.participationRate === 0.8 &&
      state.government.governanceQuality.transparency === 0.8) {
    console.log('\n✅ BUG 2 FIX VERIFIED: Democracy level set correctly without crashing');
  } else {
    console.log('\n⚠️ Values not set as expected - check scenario application logic');
  }

} catch (error) {
  console.error('\n❌ FAILURE: Readonly property error still present!');
  console.error(error);
  process.exit(1);
}
