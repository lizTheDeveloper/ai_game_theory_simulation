/**
 * Priority Weight Diagnostic Test
 *
 * Diagnoses why climate-first scenario produces identical results to baseline.
 *
 * Hypothesis:
 * - ApplyScenarioPrioritiesPhase sets government.resources (line 112)
 * - selectGovernmentAction reads state.config.climatePriority (line 521)
 * - These are DIFFERENT systems - priorities not reaching action selection
 *
 * Created: Nov 11, 2025
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIO_CATALOG } from '../src/types/scenarios';
import type { RNGFunction } from '../src/types/game';

// Run a single month with climate-first scenario and inspect state
function diagnosePriorityApplication() {
  console.log('🔍 PRIORITY WEIGHT DIAGNOSTIC\n');

  const seed = 42;
  const engine = new SimulationEngine({ seed });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);

  // Apply climate-first scenario
  const scenario = SCENARIO_CATALOG['climate-first'];
  console.log('📋 Scenario:', scenario.name);
  console.log('   Climate spending:', scenario.governmentPriorities?.climateSpending);
  console.log('   Research investment:', scenario.governmentPriorities?.researchInvestment);
  console.log('');

  // CRITICAL: Attach scenario to state (required for ApplyScenarioPrioritiesPhase)
  state.scenario = scenario as any;

  // Initial state inspection
  console.log('📊 BEFORE ApplyScenarioPrioritiesPhase:');
  console.log('   state.scenario:', state.scenario ? 'ATTACHED' : 'MISSING');
  console.log('   state.scenario.governmentPriorities:', state.scenario?.governmentPriorities ? 'DEFINED' : 'MISSING');
  console.log('   government.resources:', state.government.resources.toFixed(2), 'billions');
  console.log('   government.researchInvestments.totalBudget:', state.government.researchInvestments.totalBudget.toFixed(2), 'billions/month');
  console.log('   state.config.climatePriority:', (state.config as any).climatePriority || 'MISSING');
  console.log('');

  // Manually run ApplyScenarioPrioritiesPhase
  const { ApplyScenarioPrioritiesPhase } = require('../src/simulation/engine/phases/ApplyScenarioPrioritiesPhase');
  const phase = new ApplyScenarioPrioritiesPhase();
  const result = phase.execute(state, rng, undefined);

  console.log('📊 AFTER ApplyScenarioPrioritiesPhase:');
  console.log('   Phase result:', result.events?.length || 0, 'events');
  console.log('   government.resources:', state.government.resources.toFixed(2), 'billions (should increase)');
  console.log('   government.researchInvestments.totalBudget:', state.government.researchInvestments.totalBudget.toFixed(2), 'billions/month (should = 50)');
  console.log('   state.config.climatePriority:', (state.config as any).climatePriority || 'STILL MISSING');
  console.log('');

  // Check government action priority calculation
  const { selectGovernmentAction } = require('../src/simulation/government/core/governmentCore');

  console.log('📊 ACTION PRIORITY SYSTEM:');
  console.log('   Testing selectGovernmentAction...');

  // Mock state for environmental action priority
  (state as any).environmentalAccumulation = {
    ecosystemCrisisActive: false,
    biodiversityIndex: 0.8
  };
  (state as any).specificTippingPoints = {
    amazon: { deforestation: 20 },
    coral: { healthPercentage: 60 },
    pollinators: { populationPercentage: 70 }
  };

  const action = selectGovernmentAction(state, rng);
  console.log('   Selected action:', action?.id || 'NONE');
  console.log('   Action type:', action?.type || 'N/A');
  console.log('');

  console.log('🐛 BUG DIAGNOSIS:');
  console.log('');
  console.log('1. ApplyScenarioPrioritiesPhase writes to:');
  console.log('   - government.resources (climateSpending → monthly addition)');
  console.log('   - government.researchInvestments.totalBudget');
  console.log('');
  console.log('2. selectGovernmentAction reads from:');
  console.log('   - state.config.climatePriority.weights.climate (line 521-524)');
  console.log('   - This is NEVER set by ApplyScenarioPrioritiesPhase!');
  console.log('');
  console.log('3. Result:');
  console.log('   - Scenario priorities increase government.resources pool');
  console.log('   - But action SELECTION still uses default priority weights');
  console.log('   - Government has more money but same priorities → no behavior change');
  console.log('');
  console.log('4. Fix required:');
  console.log('   - ApplyScenarioPrioritiesPhase must ALSO set state.config.climatePriority');
  console.log('   - OR selectGovernmentAction must read from state.scenario.governmentPriorities');
  console.log('');
}

diagnosePriorityApplication();
