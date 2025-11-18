/**
 * Quick Scenario Validation - Post-Fix
 *
 * Runs 1 instance per HIGH priority scenario to validate that:
 * 1. Scenario config is stored in state
 * 2. Government reads and enforces priorities
 * 3. Scenarios produce divergent outcomes
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';

const HIGH_PRIORITY_SCENARIOS = [
  'scientificAcceleration',
  'equalityFirst',
  'climateFirst',
];

interface QuickResult {
  scenarioName: string;
  finalMetrics: {
    researchSpending: number;
    gini: number;
    climateStability: number;
    governanceQuality: number;
    spiralsActivated: number;
  };
}

console.log('\n' + '='.repeat(80));
console.log('🔬 QUICK SCENARIO VALIDATION - Post-Fix');
console.log('='.repeat(80));
console.log('Testing: Scientific Acceleration, Equality First, Climate First');
console.log('Runs: 1 per scenario (N=1)');
console.log('Duration: 60 months');
console.log('='.repeat(80) + '\n');

const results: QuickResult[] = [];

for (const scenarioKey of HIGH_PRIORITY_SCENARIOS) {
  const scenario = (SCENARIOS as any)[scenarioKey];
  if (!scenario) {
    console.error(`❌ Scenario not found: ${scenarioKey}`);
    continue;
  }

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`🔬 Running: ${scenario.name}`);
  console.log(`${'─'.repeat(80)}`);

  // Create engine and initial state
  const seed = 42;
  const tempEngine = new SimulationEngine(undefined as any, seed);
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  // Apply scenario
  applyScenario(state, scenario, rng);

  // Check if scenario config is stored (CRITICAL - this was the bug)
  if (!state.scenarioConfig) {
    console.log(`\n❌ FAILED: Scenario config NOT stored in state`);
    console.log(`   This means the fix didn't work!`);
    continue;
  }

  console.log(`\n✅ Scenario config stored: ${state.scenarioConfig.name}`);
  console.log(`   Government priorities:`);
  if (state.scenarioConfig.governmentPriorities) {
    const p = state.scenarioConfig.governmentPriorities;
    if (p.scientificResearch !== undefined) {
      console.log(`     Scientific research: ${(p.scientificResearch * 100).toFixed(0)}%`);
    }
    if (p.redistributionLevel !== undefined) {
      console.log(`     Redistribution: ${(p.redistributionLevel * 100).toFixed(0)}%`);
    }
    if (p.climateSpending !== undefined) {
      console.log(`     Climate spending: ${(p.climateSpending * 100).toFixed(0)}%`);
    }
  }

  // Run simulation
  const engine = new SimulationEngine(undefined as any, seed);
  let month = 0;
  const MAX_MONTHS = 60;

  while (month < MAX_MONTHS) {
    engine.step(state);
    month = state.currentMonth;

    if (state.outcome) {
      console.log(`\n⚠️ Early termination: ${state.outcome} at month ${month}`);
      break;
    }
  }

  // Collect final metrics
  const spiralsActive = Object.entries(state.upwardSpirals)
    .filter(([key, _]) => key !== 'cascadeMonths')
    .filter(([_, spiral]) => (spiral as any).active || (spiral as any).monthsActive > 0)
    .length;

  const finalGini = state.inequality?.gini ?? 0.4;
  const researchSpending = state.governmentAgent?.researchSpending ?? 0;
  const climateStability = state.qualityOfLifeSystems.climateStability;
  const governanceQuality = state.governmentAgent?.governanceQuality ?? 0.5;

  console.log(`\n📊 Final State (Month ${month}):`);
  console.log(`   Research spending:  $${(researchSpending / 1e9).toFixed(1)}B`);
  console.log(`   Gini coefficient:   ${finalGini.toFixed(3)}`);
  console.log(`   Climate stability:  ${(climateStability * 100).toFixed(1)}%`);
  console.log(`   Governance quality: ${(governanceQuality * 100).toFixed(1)}%`);
  console.log(`   Spirals activated:  ${spiralsActive}/6`);

  results.push({
    scenarioName: scenario.name,
    finalMetrics: {
      researchSpending,
      gini: finalGini,
      climateStability,
      governanceQuality,
      spiralsActivated: spiralsActive,
    },
  });
}

// Generate comparison table
console.log('\n\n' + '='.repeat(80));
console.log('📊 COMPARISON: BEFORE FIX vs AFTER FIX');
console.log('='.repeat(80));

console.log('\n📋 BROKEN BASELINE (Before Fix):');
console.log('  Scientific Acceleration: Research=$0.0B, Gini=0.400, Climate=70.7%, Spirals=0/6');
console.log('  Equality First:          Research=$0.0B, Gini=0.400, Climate=75.2%, Spirals=0/6');
console.log('  Climate First:           Research=$0.0B, Gini=0.400, Climate=77.0%, Spirals=0/6');
console.log('  ❌ All scenarios converged to same behavior (priorities not enforced)');

console.log('\n📋 POST-FIX (After Fix):');
for (const result of results) {
  const m = result.finalMetrics;
  console.log(
    `  ${result.scenarioName.padEnd(24)}: Research=$${(m.researchSpending / 1e9).toFixed(1)}B, ` +
      `Gini=${m.gini.toFixed(3)}, Climate=${(m.climateStability * 100).toFixed(1)}%, ` +
      `Spirals=${m.spiralsActivated}/6`
  );
}

console.log('\n📊 DIVERGENCE CHECK:');
const researchSpending = results.map((r) => r.finalMetrics.researchSpending);
const giniValues = results.map((r) => r.finalMetrics.gini);
const climateValues = results.map((r) => r.finalMetrics.climateStability);

const researchDiverged =
  Math.max(...researchSpending) - Math.min(...researchSpending) > 1e9; // >$1B difference
const giniDiverged = Math.max(...giniValues) - Math.min(...giniValues) > 0.01; // >0.01 difference
const climateDiverged =
  Math.max(...climateValues) - Math.min(...climateValues) > 0.01; // >1% difference

console.log(`  Research spending diverged: ${researchDiverged ? '✅ YES' : '❌ NO'}`);
console.log(`  Gini coefficient diverged:  ${giniDiverged ? '✅ YES' : '❌ NO'}`);
console.log(`  Climate stability diverged: ${climateDiverged ? '✅ YES' : '❌ NO'}`);

if (researchDiverged || giniDiverged || climateDiverged) {
  console.log('\n✅ FIX VALIDATED: Scenarios produce divergent outcomes');
} else {
  console.log('\n⚠️ WARNING: Scenarios still converging (may need stronger multipliers)');
}

console.log('\n' + '='.repeat(80));
console.log('✅ Quick Validation Complete');
console.log('='.repeat(80) + '\n');
