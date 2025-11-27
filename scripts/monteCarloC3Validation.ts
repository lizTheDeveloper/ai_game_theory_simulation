#!/usr/bin/env tsx
/**
 * C-3 Monte Carlo Validation (N=10)
 *
 * Validates Phase 10 carbon sink strengthening effectiveness.
 * Expected: CO2 deviation < 5% at 2010 (390 ppm baseline)
 *
 * Before fix (Phase 9): 446 ppm (14.4% error)
 * After fix (Phase 10): +15% ocean/land absorption
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface RunResult {
  seed: number;
  finalCO2: number;
  finalPopulation: number;
  co2Error: number;
  co2ErrorPercent: number;
}

async function runMonteCarlo() {
  console.log('\n' + '='.repeat(80));
  console.log('C-3 MONTE CARLO VALIDATION (N=10)');
  console.log('='.repeat(80));
  console.log();
  console.log('Target: CO2 = 390 ppm at 2010 (Keeling curve baseline)');
  console.log('Threshold: < 5% deviation (410 ppm max)');
  console.log('Determinism: CV < 0.1%');
  console.log();

  const N_RUNS = 10;
  const BASE_SEED = 42100; // Fresh seed set
  const TARGET_CO2 = 390;
  const results: RunResult[] = [];

  for (let i = 0; i < N_RUNS; i++) {
    const seed = BASE_SEED + i;
    console.log(`\n--- Run ${i + 1}/${N_RUNS} (seed=${seed}) ---`);

    const rng = createSeededRng(seed);
    setDeterministicRng(rng);

    const state = initializeHistoricalSimulation(1990, rng);
    console.log(`  Initial CO2: ${state.resourceEconomy?.co2?.atmosphericCO2?.toFixed(1)} ppm`);

    const engine = new SimulationEngine({ seed, maxMonths: 240 });
    const result = engine.run(state, { maxMonths: 240 });
    const finalState = result.finalState;

    const finalCO2 = finalState.resourceEconomy?.co2?.atmosphericCO2 ?? 0;
    const finalPopulation = finalState.humanPopulationSystem?.population ?? 0;
    const co2Error = finalCO2 - TARGET_CO2;
    const co2ErrorPercent = Math.abs(co2Error) / TARGET_CO2 * 100;

    results.push({
      seed,
      finalCO2,
      finalPopulation,
      co2Error,
      co2ErrorPercent
    });

    console.log(`  Final CO2: ${finalCO2.toFixed(1)} ppm`);
    console.log(`  Error: ${co2Error.toFixed(1)} ppm (${co2ErrorPercent.toFixed(1)}%)`);
    console.log(`  Population: ${(finalPopulation / 1e9).toFixed(2)}B`);
  }

  // Calculate statistics
  const meanCO2 = results.reduce((sum, r) => sum + r.finalCO2, 0) / N_RUNS;
  const meanError = results.reduce((sum, r) => sum + r.co2Error, 0) / N_RUNS;
  const meanErrorPercent = results.reduce((sum, r) => sum + r.co2ErrorPercent, 0) / N_RUNS;

  const sdCO2 = Math.sqrt(results.reduce((sum, r) => sum + Math.pow(r.finalCO2 - meanCO2, 2), 0) / N_RUNS);
  const cv = sdCO2 / meanCO2 * 100;

  const minCO2 = Math.min(...results.map(r => r.finalCO2));
  const maxCO2 = Math.max(...results.map(r => r.finalCO2));

  console.log('\n' + '='.repeat(80));
  console.log('STATISTICAL SUMMARY');
  console.log('='.repeat(80));
  console.log();
  console.log('CO2 at 2010:');
  console.log(`  Target:      ${TARGET_CO2} ppm`);
  console.log(`  Mean:        ${meanCO2.toFixed(1)} ppm (±${sdCO2.toFixed(2)} std)`);
  console.log(`  Range:       ${minCO2.toFixed(1)} - ${maxCO2.toFixed(1)} ppm`);
  console.log(`  Error:       ${meanError.toFixed(1)} ppm (${meanErrorPercent.toFixed(1)}%)`);
  console.log();
  console.log('Determinism:');
  console.log(`  CV:          ${cv.toFixed(4)}% (threshold: <0.1%)`);
  console.log(`  Determinism: ${cv < 0.1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log();

  // Effectiveness analysis
  const beforeErrorPercent = 14.4; // Phase 9 baseline
  const reduction = beforeErrorPercent - meanErrorPercent;
  const effectiveness = reduction / beforeErrorPercent * 100;

  console.log('Effectiveness Analysis:');
  console.log(`  Before (Phase 9):  14.4% error (446 ppm)`);
  console.log(`  After (Phase 10):  ${meanErrorPercent.toFixed(1)}% error (${meanCO2.toFixed(1)} ppm)`);
  console.log(`  Reduction:         ${reduction.toFixed(1)} percentage points`);
  console.log(`  Effectiveness:     ${effectiveness.toFixed(1)}%`);
  console.log();

  // Verdict
  const pass = meanErrorPercent < 5;
  const deterministic = cv < 0.1;

  console.log('='.repeat(80));
  console.log('VERDICT');
  console.log('='.repeat(80));
  console.log(`  CO2 Accuracy:    ${pass ? '✅ PASS' : '❌ FAIL'} (${meanErrorPercent.toFixed(1)}% < 5%)`);
  console.log(`  Determinism:     ${deterministic ? '✅ PASS' : '❌ FAIL'} (CV=${cv.toFixed(4)}%)`);
  console.log();
  console.log(`  Overall:         ${pass && deterministic ? '✅ C-3 VALIDATION PASSED' : '❌ C-3 VALIDATION FAILED'}`);
  console.log('='.repeat(80));

  if (!pass) {
    console.log();
    console.log('RECOMMENDATIONS:');
    const additionalStrengthening = (meanCO2 - TARGET_CO2) / TARGET_CO2 * 100;
    console.log(`  Additional sink strengthening needed: ~${additionalStrengthening.toFixed(1)}%`);
    console.log(`  Consider Phase 10b: Increase ocean/land absorption by another ${Math.ceil(additionalStrengthening)}%`);
  }

  // Detailed table
  console.log();
  console.log('DETAILED RUN BREAKDOWN:');
  console.log('─'.repeat(60));
  console.log('Seed   | CO2 (ppm) | Error (ppm) | Error (%) | Pop (B)');
  console.log('─'.repeat(60));
  for (const r of results) {
    console.log(
      `${r.seed} | ` +
      `${r.finalCO2.toFixed(1).padStart(9)} | ` +
      `${r.co2Error.toFixed(1).padStart(11)} | ` +
      `${r.co2ErrorPercent.toFixed(1).padStart(9)} | ` +
      `${(r.finalPopulation / 1e9).toFixed(2).padStart(7)}`
    );
  }
  console.log('─'.repeat(60));

  process.exit(pass && deterministic ? 0 : 1);
}

runMonteCarlo().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
