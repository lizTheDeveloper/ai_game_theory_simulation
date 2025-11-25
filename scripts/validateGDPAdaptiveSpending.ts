/**
 * Validate GDP-Adaptive Spending Implementation (Nov 25, 2025)
 *
 * Quick validation script to verify that:
 * 1. Research/AI safety budgets scale correctly with GDP
 * 2. Scenarios don't crash on GDP collapse
 * 3. Both absolute and rate modes work correctly
 */

import { ApplyScenarioPrioritiesPhase } from '../src/simulation/engine/phases/ApplyScenarioPrioritiesPhase';
import { SCENARIO_CATALOG } from '../src/types/scenarios';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getGDPProxy } from '../src/simulation/utils/recoveryCalculations';

console.log('\n=== GDP-Adaptive Spending Validation ===\n');

const rng = () => 0.5; // Deterministic RNG for testing

// Test 1: Verify rate-based scenarios scale correctly
console.log('TEST 1: Rate-based scaling\n');
const scenario1 = SCENARIO_CATALOG['climate-first'];
const state1 = createDefaultInitialState(rng);
state1.scenario = scenario1;
const phase1 = new ApplyScenarioPrioritiesPhase();

const initialGDP = getGDPProxy(state1);
console.log(`  Initial GDP: $${initialGDP.toFixed(1)}T`);

phase1.execute(state1, rng);
const initialResearch = state1.government.researchInvestments.totalBudget;
console.log(`  Initial research: $${initialResearch.toFixed(1)}B/month (rate: 0.5% GDP/year)`);

// Simulate GDP collapse
state1.humanPopulationSystem.population = 1.5;
state1.globalMetrics.gdpPerCapita = 13.33;
const collapsedGDP = getGDPProxy(state1);
console.log(`  Collapsed GDP: $${collapsedGDP.toFixed(1)}T (${((collapsedGDP / initialGDP) * 100).toFixed(1)}% of initial)`);

phase1.execute(state1, rng);
const collapsedResearch = state1.government.researchInvestments.totalBudget;
console.log(`  Collapsed research: $${collapsedResearch.toFixed(1)}B/month (${((collapsedResearch / initialResearch) * 100).toFixed(1)}% of initial)`);

const gdpRatio = collapsedGDP / initialGDP;
const budgetRatio = collapsedResearch / initialResearch;
const ratioDiff = Math.abs(budgetRatio - gdpRatio);
console.log(`  GDP ratio: ${(gdpRatio * 100).toFixed(1)}%`);
console.log(`  Budget ratio: ${(budgetRatio * 100).toFixed(1)}%`);
console.log(`  Difference: ${(ratioDiff * 100).toFixed(2)}% ${ratioDiff < 0.01 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Verify scientific-acceleration doesn't crash at $1.2T GDP
console.log('TEST 2: GDP-collapse safety (scientific-acceleration)\n');
const scenario2 = SCENARIO_CATALOG['scientific-acceleration'];
const state2 = createDefaultInitialState(rng);
state2.scenario = scenario2;
const phase2 = new ApplyScenarioPrioritiesPhase();

// Simulate severe GDP collapse (similar to actual crash conditions)
state2.humanPopulationSystem.population = 0.1; // 100M
state2.globalMetrics.gdpPerCapita = 12.0; // $1.2T total

const severeGDP = getGDPProxy(state2);
console.log(`  Collapsed GDP: $${severeGDP.toFixed(1)}T`);

let crashed = false;
try {
  phase2.execute(state2, rng);
  const research = state2.government.researchInvestments.totalBudget;
  const gdpInBillions = severeGDP * 1000;
  const maxSpending = (gdpInBillions * 0.5) / 12; // 50% annual GDP limit

  console.log(`  Research rate: 2.0% GDP/year`);
  console.log(`  Research spending: $${research.toFixed(1)}B/month`);
  console.log(`  Max allowed (50% GDP/year): $${maxSpending.toFixed(1)}B/month`);
  console.log(`  Within limits: ${research < maxSpending ? '✅ PASS' : '❌ FAIL'}\n`);
} catch (err) {
  crashed = true;
  console.log(`  ❌ CRASHED: ${err}\n`);
}

if (!crashed) {
  console.log(`  ✅ No crash at severe GDP collapse\n`);
}

// Test 3: Verify AI safety budget rate works
console.log('TEST 3: AI safety budget rate\n');
const state3 = createDefaultInitialState(rng);
state3.scenario = {
  id: 'test-ai-safety',
  name: 'Test',
  description: 'Test',
  hypothesis: 'Test',
  techDeployment: { mode: 'immediate' },
  governmentPriorities: {
    aiSafetyBudgetRate: 0.01, // 1% GDP/year
  },
};

const phase3 = new ApplyScenarioPrioritiesPhase();
const gdp3 = getGDPProxy(state3);
phase3.execute(state3, rng);

const aiSafety = state3.government.alignmentResearchInvestment;
const expectedAiSafety = (gdp3 * 1000 * 0.01) / 12; // 1% annual GDP, monthly
const aiSafetyDiff = Math.abs(aiSafety - expectedAiSafety);

console.log(`  GDP: $${gdp3.toFixed(1)}T`);
console.log(`  AI safety rate: 1.0% GDP/year`);
console.log(`  AI safety level: ${aiSafety.toFixed(1)} ($${aiSafety.toFixed(1)}B/month equiv)`);
console.log(`  Expected: ${expectedAiSafety.toFixed(1)}B/month`);
console.log(`  Match: ${aiSafetyDiff < 1.0 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Verify error on BOTH absolute and rate
console.log('TEST 4: Reject both absolute AND rate\n');
const state4 = createDefaultInitialState(rng);
state4.scenario = {
  id: 'invalid',
  name: 'Test',
  description: 'Test',
  hypothesis: 'Test',
  techDeployment: { mode: 'immediate' },
  governmentPriorities: {
    researchInvestment: 50, // Absolute
    researchInvestmentRate: 0.005, // ALSO rate
  },
};

const phase4 = new ApplyScenarioPrioritiesPhase();
let threwError = false;
try {
  phase4.execute(state4, rng);
} catch (err: any) {
  threwError = true;
  const hasCorrectMessage = err.message.includes('Cannot specify BOTH');
  console.log(`  Error thrown: ${threwError ? '✅' : '❌'}`);
  console.log(`  Correct message: ${hasCorrectMessage ? '✅ PASS' : '❌ FAIL'}`);
}

if (!threwError) {
  console.log(`  ❌ FAIL: Should have thrown error\n`);
}

console.log('\n=== Validation Complete ===\n');
