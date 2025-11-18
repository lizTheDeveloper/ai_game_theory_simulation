/**
 * CRITICAL-2 Effectiveness Test: Novel Entities Mortality Impact
 *
 * Compares baseline vs severe pollution to measure actual mortality impact.
 * This is the proper way to measure "effectiveness" - does it change outcomes?
 *
 * Nov 14, 2025 - Roy fixing methodology
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import type { GameState } from '../src/types/game';

function runScenario(scenarioName: string, injectPollution: boolean, seed: number, months: number = 120): {
  initialPop: number;
  finalPop: number;
  totalDeaths: number;
  crisisTriggered: boolean;
} {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO: ${scenarioName.toUpperCase()}`);
  console.log(`${'='.repeat(80)}\n`);

  const engine = new SimulationEngine({ seed });
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);

  const initialPop = state.humanPopulationSystem.population;

  if (injectPollution) {
    console.log('🧪 INJECTING SEVERE POLLUTION...');
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
    state.novelEntitiesSystem.microplasticConcentration = 0.65;
    state.novelEntitiesSystem.pfasPrevalence = 0.75;
    state.novelEntitiesSystem.endocrineDisruption = 0.60;
    state.novelEntitiesSystem.chronicDiseasePrevalence = 0.45; // Above epidemic threshold
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55; // Above crisis threshold
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65; // Above collapse threshold
    console.log('  Reproductive decline: 55% (crisis threshold: 50%)');
    console.log('  Chronic disease: 45% (epidemic threshold: 40%)');
    console.log('  Bioaccumulation: 65% (collapse threshold: 60%)\n');
  }

  let currentState = state;
  let crisisTriggered = false;

  for (let month = 0; month < months; month++) {
    const result = engine.step(currentState);
    currentState = result.state;

    if (currentState.novelEntitiesSystem.reproductiveCrisisActive ||
        currentState.novelEntitiesSystem.bioaccumulationCollapseActive ||
        currentState.novelEntitiesSystem.chronicDiseaseEpidemicActive) {
      crisisTriggered = true;
    }

    if (month % 12 === 0) {
      console.log(`Year ${month / 12}: Pop=${(currentState.humanPopulationSystem.population).toFixed(3)}B`);
    }
  }

  const finalPop = currentState.humanPopulationSystem.population;
  const totalDeaths = initialPop - finalPop;

  console.log(`\nFINAL RESULTS:`);
  console.log(`  Initial pop: ${initialPop.toFixed(3)}B`);
  console.log(`  Final pop: ${finalPop.toFixed(3)}B`);
  console.log(`  Net change: ${(totalDeaths * 1000).toFixed(1)}M`);
  console.log(`  Crisis triggered: ${crisisTriggered ? 'YES' : 'NO'}`);
  console.log(`  Cumulative crisis deaths: ${currentState.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);

  return {
    initialPop,
    finalPop,
    totalDeaths,
    crisisTriggered
  };
}

// RUN BOTH SCENARIOS
const SEED = 42;
const MONTHS = 120;

const baseline = runScenario('Baseline (No Pollution Injection)', false, SEED, MONTHS);
const polluted = runScenario('Severe Pollution (Crisis Triggered)', true, SEED + 1, MONTHS); // Different seed

// COMPARE
console.log(`\n${'#'.repeat(80)}`);
console.log(`EFFECTIVENESS ANALYSIS`);
console.log(`${'#'.repeat(80)}\n`);

console.log(`Population Change:`);
console.log(`  Baseline: ${(baseline.totalDeaths * 1000).toFixed(1)}M (${((baseline.totalDeaths / baseline.initialPop) * 100).toFixed(2)}%)`);
console.log(`  Polluted: ${(polluted.totalDeaths * 1000).toFixed(1)}M (${((polluted.totalDeaths / polluted.initialPop) * 100).toFixed(2)}%)`);
console.log(`  Difference: ${((polluted.totalDeaths - baseline.totalDeaths) * 1000).toFixed(1)}M additional deaths\n`);

console.log(`Crisis Activation:`);
console.log(`  Baseline: ${baseline.crisisTriggered ? 'YES' : 'NO'}`);
console.log(`  Polluted: ${polluted.crisisTriggered ? 'YES' : 'NO'}\n`);

// VERDICT
const effectiveDelta = Math.abs((polluted.totalDeaths - baseline.totalDeaths) * 1000);

console.log(`${'='.repeat(80)}`);
console.log(`VERDICT`);
console.log(`${'='.repeat(80)}\n`);

if (!polluted.crisisTriggered) {
  console.log(`❌ TEST FAILED: Pollution injection did not trigger crisis`);
  console.log(`   Novel entities system threshold may be misconfigured\n`);
} else if (effectiveDelta < 10) {
  console.log(`🚨 BUG CONFIRMED: Crisis triggers but mortality delta < 10M`);
  console.log(`   Expected: 50-200M additional deaths from chemical pollution crises`);
  console.log(`   Observed: ${effectiveDelta.toFixed(1)}M additional deaths`);
  console.log(`   Effectiveness: ~0%\n`);
} else {
  console.log(`✅ SYSTEM FUNCTIONAL: Novel entities mortality pipeline working`);
  console.log(`   Crisis triggered: YES`);
  console.log(`   Additional deaths: ${effectiveDelta.toFixed(1)}M`);
  console.log(`   Effectiveness: Measurable impact on outcomes\n`);
}

console.log(`${'#'.repeat(80)}\n`);
