/**
 * Diagnostic script to trace workflowAdaptation calculation
 * Runs 24 months and logs workflowAdaptation value each month
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('\n' + '='.repeat(80));
console.log('🔍 WORKFLOW ADAPTATION DIAGNOSTIC');
console.log('='.repeat(80) + '\n');

// Initialize engine and RNG
const engine = new SimulationEngine({ seed: 42 });
const rng = engine.getRNG().next.bind(engine.getRNG());

// Initialize state
const state = createDefaultInitialState(rng);

console.log(`Initial workflowAdaptation: ${state.society.workflowAdaptation}`);
console.log(`Initial researchBudget: ${state.government.researchInvestments.totalBudget.toFixed(1)}B\n`);

// Run simulation and log workflowAdaptation each month
const result = engine.run(state, {
  maxMonths: 24,
  onMonthEnd: (state, month) => {
    const wa = state.society.workflowAdaptation;
    const budget = state.government.researchInvestments.totalBudget;

    // Check for NaN
    if (isNaN(wa)) {
      console.log(`\n❌ MONTH ${month}: workflowAdaptation = NaN`);
      console.log(`   Research budget: ${budget}`);
      console.log(`   Social stability: ${state.globalMetrics.socialStability}`);
      console.log(`   Unemployment: ${state.society.unemploymentLevel}`);

      // Check AI agents
      if (state.aiAgents.length > 0) {
        const avgCap = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
        console.log(`   Avg AI capability: ${avgCap}`);
      }

      throw new Error('workflowAdaptation is NaN');
    }

    // Log every 6 months
    if (month % 6 === 0 && month > 0) {
      console.log(`Month ${month}: workflowAdaptation = ${(wa * 100).toFixed(2)}%, research = $${budget.toFixed(1)}B`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ DIAGNOSTIC COMPLETE');
console.log('='.repeat(80) + '\n');
