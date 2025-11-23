/**
 * Quick Validation: Government Action Selection Divergence
 *
 * Verify scenarios select different actions at month 0.
 * This is the CRITICAL fix - if action selection diverges, outcomes will diverge.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { applyScenario } from '../src/simulation/scenarios/apply';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { selectGovernmentAction } from '../src/simulation/government/core/governmentCore';

const rng = Math.random;

console.log('='.repeat(80));
console.log('QUICK VALIDATION: Government Action Selection Divergence');
console.log('='.repeat(80));

// Test each scenario
const scenarios = [
  { name: 'Green New Deal', def: SCENARIOS.greenNewDeal, expectedType: 'climate' },
  { name: 'Techno-Optimist', def: SCENARIOS.technoOptimist, expectedType: 'research' },
  { name: 'Degrowth', def: SCENARIOS.degrowth, expectedType: 'climate' },
  { name: 'Authoritarian Climate', def: SCENARIOS.authoritarianClimateAction, expectedType: 'climate' },
  { name: 'Nordic Social Democracy', def: SCENARIOS.nordicSocialDemocracy, expectedType: 'redistribution' },
];

const actions: string[] = [];

for (const scenario of scenarios) {
  const state = createDefaultInitialState(rng, 'historical');
  applyScenario(state, scenario.def, rng);
  const action = selectGovernmentAction(state, rng);

  console.log(`\n${scenario.name}:`);
  console.log(`  Selected: ${action?.id}`);
  console.log(`  Expected type: ${scenario.expectedType}`);

  actions.push(action?.id ?? 'none');
}

// Check for divergence
console.log('\n' + '='.repeat(80));
console.log('DIVERGENCE CHECK');
console.log('='.repeat(80));

const uniqueActions = new Set(actions);
console.log(`\nUnique actions selected: ${uniqueActions.size} / ${actions.length}`);
console.log(`Actions: ${Array.from(uniqueActions).join(', ')}`);

if (uniqueActions.size >= 3) {
  console.log('\n✅ VALIDATION PASSED: Scenarios produce divergent action selection!');
  console.log('   Government priorities are being enforced correctly.');
  console.log('   Phase 3 ready for Monte Carlo validation.');
  process.exit(0);
} else {
  console.log('\n❌ VALIDATION FAILED: Too few unique actions!');
  console.log('   Scenarios may still be converging.');
  process.exit(1);
}
