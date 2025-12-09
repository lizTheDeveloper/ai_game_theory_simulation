#!/usr/bin/env tsx
/**
 * Hindcast Demographic Tuning Validation
 *
 * Validates the regional historical death rate implementation by running
 * hindcast simulations (1990-2020) and checking population accuracy.
 *
 * Success Criteria:
 * - Population deviation <5-7% for 2020 (target improvement from 10.3%)
 * - No regression in early years (1990-2005)
 * - CV < 0.01% (deterministic)
 *
 * Research: research/regional_death_rates_unwpp2024_20251209.md (Grade B)
 * Validation: reviews/hindcast_demographic_research_critique_20251209.md
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import seedrandom from 'seedrandom';

// Historical population benchmarks (UN data, billions)
const HISTORICAL_POPULATION = {
  1990: 5.327,
  1995: 5.744,
  2000: 6.143,
  2005: 6.542,
  2010: 6.957,
  2015: 7.380,
  2020: 7.795
};

interface ValidationResult {
  year: number;
  month: number;
  simulated: number;
  historical: number;
  deviation: number;
  deviationPercent: number;
}

function runHindcast(seed: number): ValidationResult[] {
  const rng = seedrandom(`hindcast-demographic-${seed}`);
  const state: GameState = createDefaultInitialState(rng);

  // Enable historical mode
  state.historicalMode = true;

  // Start at 1990
  state.currentMonth = 0;
  state.currentYear = 1990;

  const engine = new SimulationEngine();
  const results: ValidationResult[] = [];
  const checkpointYears = [1990, 1995, 2000, 2005, 2010, 2015, 2020];

  // Run hindcast 1990-2020 (360 months)
  for (let month = 0; month <= 360; month++) {
    engine.simulateStep(state, rng);

    const year = state.currentYear;

    // Check if we're at a checkpoint year (end of year)
    if (checkpointYears.includes(year) && state.currentMonth % 12 === 0) {
      const simPop = state.humanPopulationSystem.population;
      const histPop = HISTORICAL_POPULATION[year as keyof typeof HISTORICAL_POPULATION];

      if (histPop !== undefined) {
        const deviation = simPop - histPop;
        const deviationPercent = (deviation / histPop) * 100;

        results.push({
          year,
          month: state.currentMonth,
          simulated: simPop,
          historical: histPop,
          deviation,
          deviationPercent
        });
      }
    }
  }

  return results;
}

function calculateCV(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / mean) * 100;
}

async function main() {
  console.log('🔍 HINDCAST DEMOGRAPHIC TUNING VALIDATION\n');
  console.log('Testing regional historical death rate implementation');
  console.log('Target: Reduce 2020 overshoot from 10.3% to <5-7%\n');

  const N_RUNS = 10;
  const allResults: ValidationResult[][] = [];

  // Run Monte Carlo hindcasts
  console.log(`Running ${N_RUNS} hindcast simulations...\n`);

  for (let i = 1; i <= N_RUNS; i++) {
    const results = runHindcast(i);
    allResults.push(results);

    console.log(`Run ${i}/${N_RUNS}:`);
    results.forEach(r => {
      const status = Math.abs(r.deviationPercent) < 7 ? '✅' : '⚠️';
      console.log(`  ${status} ${r.year}: ${r.simulated.toFixed(3)}B vs ${r.historical}B (${r.deviationPercent > 0 ? '+' : ''}${r.deviationPercent.toFixed(2)}%)`);
    });
    console.log('');
  }

  // Calculate CV for determinism check
  console.log('\n📊 DETERMINISM CHECK (CV < 0.01% required)\n');

  const checkpointYears = [1990, 1995, 2000, 2005, 2010, 2015, 2020];
  checkpointYears.forEach((year, idx) => {
    const yearPopulations = allResults.map(results => results[idx].simulated);
    const cv = calculateCV(yearPopulations);
    const status = cv < 0.01 ? '✅' : '❌';
    console.log(`  ${status} ${year}: CV = ${cv.toFixed(6)}%`);
  });

  // Summary
  console.log('\n📈 VALIDATION SUMMARY\n');

  const avgResults = checkpointYears.map((year, idx) => {
    const yearResults = allResults.map(results => results[idx]);
    const avgDeviation = yearResults.reduce((sum, r) => sum + r.deviationPercent, 0) / N_RUNS;
    return { year, avgDeviation };
  });

  console.log('Average deviations by year:');
  avgResults.forEach(({ year, avgDeviation }) => {
    const status = Math.abs(avgDeviation) < 7 ? '✅' : '⚠️';
    const improvement = year === 2020 ? ` (was +10.3%)` : '';
    console.log(`  ${status} ${year}: ${avgDeviation > 0 ? '+' : ''}${avgDeviation.toFixed(2)}%${improvement}`);
  });

  // Success criteria check
  const deviation2020 = avgResults.find(r => r.year === 2020)?.avgDeviation ?? 0;
  const noRegression = avgResults.filter(r => r.year <= 2005).every(r => Math.abs(r.avgDeviation) < 7);
  const deterministic = checkpointYears.every((year, idx) => {
    const yearPopulations = allResults.map(results => results[idx].simulated);
    return calculateCV(yearPopulations) < 0.01;
  });

  console.log('\n🎯 SUCCESS CRITERIA\n');
  console.log(`  ${Math.abs(deviation2020) < 7 ? '✅' : '❌'} 2020 deviation <7%: ${deviation2020.toFixed(2)}%`);
  console.log(`  ${noRegression ? '✅' : '❌'} No regression in early years (1990-2005)`);
  console.log(`  ${deterministic ? '✅' : '❌'} CV < 0.01% (deterministic)`);

  const overallSuccess = Math.abs(deviation2020) < 7 && noRegression && deterministic;
  console.log(`\n${overallSuccess ? '✅' : '❌'} Overall: ${overallSuccess ? 'PASS' : 'FAIL'}\n`);

  if (overallSuccess) {
    console.log('✅ Regional death rate implementation successful!');
    console.log('   Population overshoot reduced as expected.');
    console.log('   Ready for architecture review (Quality Gate 2).\n');
  } else {
    console.log('❌ Validation failed. Further tuning required.');
    console.log('   Check research assumptions and parameter values.\n');
  }
}

main().catch(console.error);
