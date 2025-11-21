/**
 * Quick Validation: Scenario Behavioral Divergence
 *
 * Run 3 scenarios for 12 months each, verify they produce different outcomes.
 * Expected: Green New Deal → climate, Techno-Optimist → research, Degrowth → climate
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { applyScenario } from '../src/simulation/scenarios/apply';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

const rng = Math.random;
const MAX_MONTHS = 12;

console.log('='.repeat(80));
console.log('SCENARIO DIVERGENCE VALIDATION (12 months each)');
console.log('='.repeat(80));

// Helper: Run scenario
function runScenario(scenarioName: string, scenario: any) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO: ${scenarioName}`);
  console.log('='.repeat(80));

  const state = createDefaultInitialState(rng, 'historical');
  applyScenario(state, scenario, rng);
  const orchestrator = new PhaseOrchestrator();

  // Track metrics
  const climateSpendings: number[] = [];
  const researchBudgets: number[] = [];
  const ginis: number[] = [];

  for (let month = 0; month < MAX_MONTHS; month++) {
    orchestrator.executeAll(state, rng);

    // Track key metrics
    climateSpendings.push(state.government.climateSpending ?? 0);
    researchBudgets.push(state.government.researchInvestment ?? 0);
    ginis.push(state.inequality.gini ?? 0);
  }

  // Report averages
  const avgClimateSpending = climateSpendings.reduce((a, b) => a + b, 0) / climateSpendings.length;
  const avgResearchBudget = researchBudgets.reduce((a, b) => a + b, 0) / researchBudgets.length;
  const finalGini = ginis[ginis.length - 1];

  console.log(`\n📊 Results (12 months):`);
  console.log(`  Avg Climate Spending: $${(avgClimateSpending / 1e9).toFixed(1)}B/year`);
  console.log(`  Avg Research Budget:  $${(avgResearchBudget / 1e9).toFixed(1)}B/year`);
  console.log(`  Final Inequality (Gini): ${finalGini.toFixed(3)}`);

  return { avgClimateSpending, avgResearchBudget, finalGini };
}

// Run 3 scenarios
const results = {
  greenNewDeal: runScenario('Green New Deal', SCENARIOS.greenNewDeal),
  technoOptimist: runScenario('Techno-Optimist', SCENARIOS.technoOptimist),
  degrowth: runScenario('Degrowth', SCENARIOS.degrowth),
};

// Validate divergence
console.log('\n' + '='.repeat(80));
console.log('DIVERGENCE CHECK');
console.log('='.repeat(80));

const climateSpendingDivergence =
  Math.abs(results.greenNewDeal.avgClimateSpending - results.technoOptimist.avgClimateSpending) > 5e9; // $5B difference
const researchBudgetDivergence =
  Math.abs(results.greenNewDeal.avgResearchBudget - results.technoOptimist.avgResearchBudget) > 5e9; // $5B difference

console.log(`\nClimate Spending diverges: ${climateSpendingDivergence ? '✅' : '❌'}`);
console.log(`Research Budget diverges:  ${researchBudgetDivergence ? '✅' : '❌'}`);

if (climateSpendingDivergence && researchBudgetDivergence) {
  console.log('\n✅ VALIDATION PASSED: Scenarios produce divergent behavior!');
  console.log('   Phase 3 ready for Monte Carlo validation.');
  process.exit(0);
} else {
  console.log('\n❌ VALIDATION FAILED: Scenarios still converge!');
  console.log('   Government priorities not being enforced correctly.');
  process.exit(1);
}
