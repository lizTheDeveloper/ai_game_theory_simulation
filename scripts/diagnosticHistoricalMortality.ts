#!/usr/bin/env tsx
/**
 * Diagnostic script for HIGH-7: Population mortality calibration
 *
 * Traces population dynamics in historical mode (1990-2024) to identify
 * why simulated population (1.22B-3.44B) is 76% lower than actual (8.12B).
 *
 * HYPOTHESIS: Death rates calibrated for crisis scenarios being applied to
 * historical baseline, causing population collapse instead of growth.
 *
 * Run: npx tsx scripts/diagnosticHistoricalMortality.ts
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import type { RNGFunction } from '../src/types/config';

console.log('=== HIGH-7 DIAGNOSTIC: Historical Mortality Calibration ===\n');

async function runDiagnostic() {
  // Create simulation engine with deterministic seed
  const engine = new SimulationEngine({ seed: 99999 });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

  // Create historical mode state (1990 start year)
  const state = await createHistoricalInitialState({
    year: 1990,
    rng,
    includeAIAgents: false,
    scenarioMode: 'historical'
  });

  console.log('📊 Initial state (1990-01):');
  console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  console.log(`  Scenario mode: ${state.config.scenarioMode}`);
  console.log(`  Current year: ${state.currentYear}`);
  console.log(`  Regional populations: ${state.humanPopulationSystem.regionalPopulations?.length ?? 0} regions\n`);

  // Track detailed population trajectory for first 12 months
  console.log('=== MONTH-BY-MONTH TRACE (First Year 1990) ===\n');

  for (let month = 0; month < 12; month++) {
    const popBefore = state.humanPopulationSystem.population;
    const regions = state.humanPopulationSystem.regionalPopulations || [];

    // Get regional details BEFORE step
    const regionalDetailsBefore = regions.map(r => ({
      name: r.name,
      population: r.population,
      birthRate: r.adjustedBirthRate,
      deathRate: r.adjustedDeathRate,
      netGrowth: r.netGrowthRate,
    }));

    // Step simulation
    engine.step(state);

    const popAfter = state.humanPopulationSystem.population;
    const popChange = popAfter - popBefore;
    const popChangePercent = (popChange / popBefore) * 100;

    console.log(`\n--- MONTH ${state.currentMonth} (${state.currentYear}-${String(state.currentMonth % 12 || 12).padStart(2, '0')}) ---`);
    console.log(`Population: ${popBefore.toFixed(3)}B → ${popAfter.toFixed(3)}B (${popChange >= 0 ? '+' : ''}${popChange.toFixed(3)}B, ${popChange >= 0 ? '+' : ''}${popChangePercent.toFixed(2)}%)`);

    // Calculate total births and deaths from regional changes
    let totalBirths = 0;
    let totalDeaths = 0;

    for (let i = 0; i < regions.length; i++) {
      const before = regionalDetailsBefore[i];
      const after = regions[i];

      // Calculate monthly changes (regional populations in millions)
      const monthlyBirthRate = after.adjustedBirthRate / 12;
      const monthlyDeathRate = after.adjustedDeathRate / 12;

      const births = before.population * monthlyBirthRate; // millions
      const deaths = before.population * monthlyDeathRate; // millions

      totalBirths += births;
      totalDeaths += deaths;

      // Log detail for Sub-Saharan Africa (highest growth region)
      if (after.name === 'Sub-Saharan Africa') {
        console.log(`\n  ${after.name}:`);
        console.log(`    Population: ${before.population.toFixed(0)}M → ${after.population.toFixed(0)}M (${after.population - before.population >= 0 ? '+' : ''}${(after.population - before.population).toFixed(1)}M)`);
        console.log(`    Birth rate: ${(before.birthRate * 100).toFixed(2)}% annual`);
        console.log(`    Death rate: ${(before.deathRate * 100).toFixed(2)}% annual`);
        console.log(`    Net growth: ${(before.netGrowth * 100).toFixed(2)}% annual`);
        console.log(`    Births this month: ${births.toFixed(2)}M`);
        console.log(`    Deaths this month: ${deaths.toFixed(2)}M`);
        console.log(`    Net: ${(births - deaths >= 0 ? '+' : '')}${(births - deaths).toFixed(2)}M`);
      }
    }

    console.log(`\n  GLOBAL TOTALS:`);
    console.log(`    Births: ${totalBirths.toFixed(1)}M`);
    console.log(`    Deaths: ${totalDeaths.toFixed(1)}M`);
    console.log(`    Net: ${(totalBirths - totalDeaths >= 0 ? '+' : '')}${(totalBirths - totalDeaths).toFixed(1)}M`);
    console.log(`    Expected from pop change: ${(popChange * 1000).toFixed(1)}M`);

    // Check if Bayesian mortality system is active
    const bayesianActive = state.humanPopulationSystem.mortalityRisks && state.humanPopulationSystem.mortalityRisks.length > 0;
    console.log(`    Bayesian mortality active: ${bayesianActive ? 'YES ⚠️' : 'NO ✅'}`);
    if (bayesianActive) {
      console.log(`    Bayesian risks accumulated: ${state.humanPopulationSystem.mortalityRisks?.length ?? 0}`);
    }

    // Check for excess deaths
    const excessDeaths = state.humanPopulationSystem.monthlyExcessDeaths ?? 0;
    if (excessDeaths > 0.01) {
      console.log(`    ⚠️ EXCESS DEATHS: ${excessDeaths.toFixed(2)}M`);
    }
  }

  console.log('\n\n=== ANNUAL SUMMARY (1990-1995) ===\n');

  // Run for 5 years to see annual trends
  for (let year = 1991; year <= 1995; year++) {
    const popStart = state.humanPopulationSystem.population;

    // Run 12 months
    for (let month = 0; month < 12; month++) {
      engine.step(state);
    }

    const popEnd = state.humanPopulationSystem.population;
    const popGrowth = popEnd - popStart;
    const popGrowthPercent = (popGrowth / popStart) * 100;

    console.log(`${year}: ${popStart.toFixed(3)}B → ${popEnd.toFixed(3)}B (${popGrowth >= 0 ? '+' : ''}${popGrowth.toFixed(3)}B, ${popGrowth >= 0 ? '+' : ''}${popGrowthPercent.toFixed(2)}%)`);

    // Expected growth from UN data: 1990-1995 = +1.45% per year average
    const expectedGrowth = 0.0145 * popStart;
    const deviation = popGrowth - expectedGrowth;
    const deviationPercent = (deviation / expectedGrowth) * 100;

    console.log(`  Expected (UN): +${expectedGrowth.toFixed(3)}B (+1.45%)`);
    console.log(`  Deviation: ${deviation >= 0 ? '+' : ''}${deviation.toFixed(3)}B (${deviation >= 0 ? '+' : ''}${deviationPercent.toFixed(1)}%)`);
  }

  console.log('\n=== DIAGNOSTIC COMPLETE ===');
  console.log('\nNext steps:');
  console.log('1. If Bayesian mortality is active in historical mode → BUG (should be disabled)');
  console.log('2. If death rates > birth rates → check historical CDR/CBR calibration');
  console.log('3. If excess deaths > 0 → crisis mortality leaking into historical mode');
  console.log('4. Compare regional birth/death rates to UN WPP 2024 data');
}

runDiagnostic().catch(err => {
  console.error('❌ DIAGNOSTIC FAILED:', err);
  process.exit(1);
});
