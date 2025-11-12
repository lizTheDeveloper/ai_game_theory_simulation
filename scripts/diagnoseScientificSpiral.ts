/**
 * Diagnostic script to test scientific spiral activation
 * Simulates scientific-acceleration scenario ($100B research) for 24 months
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('\n' + '='.repeat(80));
console.log('🔬 SCIENTIFIC SPIRAL DIAGNOSTIC (GOD MODE)');
console.log('='.repeat(80) + '\n');

// Initialize engine and state
const engine = new SimulationEngine({ seed: 42 });
const rng = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rng);

// GOD MODE: Boost research budget to $100B/month (10× default)
state.government.researchInvestments.totalBudget = 100;
console.log(`🎯 GOD MODE: Research budget set to $${state.government.researchInvestments.totalBudget}B/month\n`);

console.log(`Initial workflowAdaptation: ${(state.society.workflowAdaptation * 100).toFixed(1)}%`);
console.log(`Initial researchBudget: ${state.government.researchInvestments.totalBudget.toFixed(1)}B\n`);

// Run simulation and check scientific spiral activation
const result = engine.run(state, {
  maxMonths: 24,
  onMonthEnd: (state, month) => {
    const wa = state.society.workflowAdaptation;
    const budget = state.government.researchInvestments.totalBudget;
    const scientificSpiral = state.upwardSpirals.scientific;

    // Check for NaN
    if (isNaN(wa)) {
      console.log(`\n❌ MONTH ${month}: workflowAdaptation = NaN`);
      throw new Error('workflowAdaptation is NaN');
    }

    // Log every month (short run, want granularity)
    if (month % 6 === 0 && month > 0) {
      console.log(`\n📅 MONTH ${month}:`);
      console.log(`   Workflow Adaptation: ${(wa * 100).toFixed(2)}%`);
      console.log(`   Research Budget: $${budget.toFixed(1)}B`);
      console.log(`   Scientific Spiral: ${scientificSpiral.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${(scientificSpiral.strength * 100).toFixed(1)}%)`);

      if (scientificSpiral.active) {
        console.log(`   🎉 SCIENTIFIC SPIRAL ACTIVATED AT MONTH ${month}!`);
      }
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ DIAGNOSTIC COMPLETE');
console.log('='.repeat(80));
console.log(`\nFinal workflowAdaptation: ${(state.society.workflowAdaptation * 100).toFixed(2)}%`);
console.log(`Scientific spiral ${state.upwardSpirals.scientific.active ? '✅ ACTIVATED' : '❌ FAILED TO ACTIVATE'}`);
console.log(`Total months active: ${state.upwardSpirals.scientific.monthsActive}`);
console.log('\n');
