/**
 * Quick Priority Validation Test
 *
 * Verifies that climate-first scenario now produces different results from baseline.
 *
 * Expected:
 * - climate-first should show divergence in climate metrics (temp, CO2)
 * - climate-first should show different government action patterns
 *
 * Created: Nov 11, 2025
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import { SCENARIO_CATALOG } from '../src/types/scenarios';
import type { RNGFunction, GameState } from '../src/types/game';

function applyGodMode(state: GameState) {
  const allTech = getAllTech();
  console.log(`  Deploying ${allTech.length} technologies...`);

  // Unlock all tech
  for (const tech of allTech) {
    if (!state.techTreeState.unlockedTech.includes(tech.id)) {
      state.techTreeState.unlockedTech.push(tech.id);
      state.techTreeState.techUnlockedCount++;
    }
  }

  // Deploy all tech at 100% in global region
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  for (const tech of allTech) {
    const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);
    if (!existing) {
      state.techTreeState.regionalDeployment['global'].push({
        techId: tech.id,
        region: 'global',
        deploymentLevel: 1.0,
        monthlyInvestment: 0,
        totalInvested: tech.deploymentCost,
        deployedBy: ['scenario'],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
    }
  }

  console.log(`  ✅ ${state.techTreeState.techDeployedCount} technologies deployed\n`);
}

function runScenario(scenarioId: string, seed: number, maxMonths: number = 24) {
  const engine = new SimulationEngine({ seed });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);

  // Apply god mode
  applyGodMode(state);

  // Apply scenario if not baseline
  if (scenarioId !== 'baseline') {
    const scenario = SCENARIO_CATALOG[scenarioId as keyof typeof SCENARIO_CATALOG];
    state.scenario = scenario as any;
    console.log(`📋 Scenario: ${scenario.name}`);
    console.log(`   Climate spending: ${scenario.governmentPriorities?.climateSpending || 'N/A'}`);
    console.log(`   Research: ${scenario.governmentPriorities?.researchInvestment || 'N/A'}B/month\n`);
  } else {
    console.log(`📋 Scenario: Baseline (no priorities)\n`);
  }

  // Run simulation
  const result = engine.run(state, { maxMonths, checkActualOutcomes: false });
  const finalState = result.finalState;

  if (!finalState) {
    return {
      scenarioId,
      seed,
      outcome: 'EXTINCTION',
      temp: 0,
      co2: 0,
      pop: 0,
      qol: 0
    };
  }

  return {
    scenarioId,
    seed,
    outcome: finalState.outcome || 'UNKNOWN',
    temp: finalState.resourceEconomy.co2.temperatureAnomaly,
    co2: finalState.resourceEconomy.co2.atmosphericCO2,
    pop: finalState.humanPopulationSystem.population,
    qol: (
      finalState.qualityOfLifeSystems.survivalFundamentals.foodSecurity +
      finalState.qualityOfLifeSystems.materialAbundance +
      finalState.qualityOfLifeSystems.physicalSafety
    ) / 3
  };
}

function main() {
  console.log('🔍 QUICK PRIORITY VALIDATION TEST\n');
  console.log('Running climate-first vs baseline with N=3 seeds...\n');

  const seeds = [42, 123, 456];
  const results: any[] = [];

  for (const seed of seeds) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`SEED: ${seed}`);
    console.log('='.repeat(80) + '\n');

    console.log('--- Baseline (god mode, no priorities) ---');
    const baseline = runScenario('baseline', seed, 24);
    results.push(baseline);

    console.log('\n--- Climate First (god mode + climate priorities) ---');
    const climateFist = runScenario('climate-first', seed, 24);
    results.push(climateFist);

    console.log('\n📊 COMPARISON (Seed ' + seed + '):');
    console.log(`  Baseline:      Temp ${baseline.temp.toFixed(2)}°C, CO2 ${baseline.co2.toFixed(0)}ppm, Pop ${baseline.pop.toFixed(2)}B, QoL ${(baseline.qol * 100).toFixed(1)}%`);
    console.log(`  Climate-first: Temp ${climateFist.temp.toFixed(2)}°C, CO2 ${climateFist.co2.toFixed(0)}ppm, Pop ${climateFist.pop.toFixed(2)}B, QoL ${(climateFist.qol * 100).toFixed(1)}%`);
    console.log(`  Delta:         Temp ${(climateFist.temp - baseline.temp).toFixed(2)}°C, CO2 ${(climateFist.co2 - baseline.co2).toFixed(0)}ppm, Pop ${(climateFist.pop - baseline.pop).toFixed(2)}B, QoL ${((climateFist.qol - baseline.qol) * 100).toFixed(1)}%`);
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('AGGREGATED RESULTS (N=3)');
  console.log('='.repeat(80));

  const baselineResults = results.filter(r => r.scenarioId === 'baseline');
  const climateResults = results.filter(r => r.scenarioId === 'climate-first');

  const avgBaseline = {
    temp: baselineResults.reduce((sum, r) => sum + r.temp, 0) / baselineResults.length,
    co2: baselineResults.reduce((sum, r) => sum + r.co2, 0) / baselineResults.length,
    pop: baselineResults.reduce((sum, r) => sum + r.pop, 0) / baselineResults.length,
    qol: baselineResults.reduce((sum, r) => sum + r.qol, 0) / baselineResults.length
  };

  const avgClimate = {
    temp: climateResults.reduce((sum, r) => sum + r.temp, 0) / climateResults.length,
    co2: climateResults.reduce((sum, r) => sum + r.co2, 0) / climateResults.length,
    pop: climateResults.reduce((sum, r) => sum + r.pop, 0) / climateResults.length,
    qol: climateResults.reduce((sum, r) => sum + r.qol, 0) / climateResults.length
  };

  console.log(`\nBaseline Average:      Temp ${avgBaseline.temp.toFixed(2)}°C, CO2 ${avgBaseline.co2.toFixed(0)}ppm, Pop ${avgBaseline.pop.toFixed(2)}B, QoL ${(avgBaseline.qol * 100).toFixed(1)}%`);
  console.log(`Climate-first Average: Temp ${avgClimate.temp.toFixed(2)}°C, CO2 ${avgClimate.co2.toFixed(0)}ppm, Pop ${avgClimate.pop.toFixed(2)}B, QoL ${(avgClimate.qol * 100).toFixed(1)}%`);
  console.log(`Delta:                 Temp ${(avgClimate.temp - avgBaseline.temp).toFixed(2)}°C, CO2 ${(avgClimate.co2 - avgBaseline.co2).toFixed(0)}ppm, Pop ${(avgClimate.pop - avgBaseline.pop).toFixed(2)}B, QoL ${((avgClimate.qol - avgBaseline.qol) * 100).toFixed(1)}%`);

  console.log('\n✅ VALIDATION:');
  const tempDelta = Math.abs(avgClimate.temp - avgBaseline.temp);
  const co2Delta = Math.abs(avgClimate.co2 - avgBaseline.co2);
  const anyDivergence = tempDelta > 0.01 || co2Delta > 1.0;

  if (anyDivergence) {
    console.log('✅ PASS: Climate-first scenario produces different results from baseline');
    console.log(`   Temperature divergence: ${tempDelta.toFixed(3)}°C`);
    console.log(`   CO2 divergence: ${co2Delta.toFixed(1)}ppm`);
  } else {
    console.log('❌ FAIL: Climate-first scenario still produces identical results');
    console.log('   Government priority weights may still not be affecting action selection');
  }
}

main();
