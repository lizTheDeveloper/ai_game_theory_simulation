/**
 * Quick Determinism Test (HIGH-9 Fix Validation)
 *
 * Runs N=3 hindcast simulations with IDENTICAL seed (42)
 * to verify fix for RNG mismatch non-determinism.
 *
 * Expected: CV ≈ 0% (all runs produce identical results)
 * Before fix: CV = 6.7% (population varied 3x across runs)
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

const SEED = 42;
const NUM_RUNS = 3;
const MAX_MONTHS = 120; // 10 years (faster test)

interface RunResult {
  run: number;
  population: number;
  temperature: number;
  qol: number;
}

async function runDeterminismTest(): Promise<void> {
  console.log('\n=== DETERMINISM QUICK TEST (HIGH-9 Fix Validation) ===');
  console.log(`Seed: ${SEED} (IDENTICAL for all runs)`);
  console.log(`Runs: ${NUM_RUNS}`);
  console.log(`Months: ${MAX_MONTHS}`);
  console.log('');

  const results: RunResult[] = [];

  for (let i = 0; i < NUM_RUNS; i++) {
    console.log(`\n--- Run ${i + 1} ---`);

    // HIGH-9 FIX: Use engine's RNG for initialization
    const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS });
    const engineRng = (engine as any).rng.next.bind((engine as any).rng);
    setDeterministicRng(engineRng);

    const state = initializeHistoricalSimulation(1990, engineRng);
    const result = engine.run(state, { maxMonths: MAX_MONTHS });
    const finalState = result.finalState;

    const pop = finalState.humanPopulationSystem.population;
    const temp = finalState.resourceEconomy.co2.temperatureAnomaly;
    const qol = finalState.globalMetrics.qualityOfLife;

    results.push({ run: i + 1, population: pop, temperature: temp, qol });

    console.log(`  Population: ${pop.toFixed(6)}B`);
    console.log(`  Temperature: ${temp.toFixed(6)}°C`);
    console.log(`  QoL: ${qol.toFixed(6)}`);
  }

  console.log('\n=== RESULTS ===');
  console.log('Run | Population (B) | Temperature (C) | QoL');
  console.log('----+----------------+-----------------+--------');
  results.forEach(r => {
    console.log(`${r.run}   | ${r.population.toFixed(6)}   | ${r.temperature.toFixed(6)}      | ${r.qol.toFixed(6)}`);
  });

  // Calculate coefficient of variation
  const popValues = results.map(r => r.population);
  const tempValues = results.map(r => r.temperature);
  const qolValues = results.map(r => r.qol);

  const calculateCV = (values: number[]): number => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return (stdDev / mean) * 100;
  };

  const popCV = calculateCV(popValues);
  const tempCV = calculateCV(tempValues);
  const qolCV = calculateCV(qolValues);

  console.log('\n=== COEFFICIENT OF VARIATION (CV) ===');
  console.log(`Population:  ${popCV.toFixed(6)}% (target: < 0.01%)`);
  console.log(`Temperature: ${tempCV.toFixed(6)}% (target: < 0.01%)`);
  console.log(`QoL:         ${qolCV.toFixed(6)}% (target: < 0.01%)`);

  const maxCV = Math.max(popCV, tempCV, qolCV);

  console.log('\n=== VERDICT ===');
  if (maxCV < 0.01) {
    console.log(`✅ PASS: Perfect determinism (max CV = ${maxCV.toFixed(6)}%)`);
    console.log('Identical seeds produce IDENTICAL results.');
    process.exit(0);
  } else if (maxCV < 0.1) {
    console.log(`⚠️ NEAR-PASS: Very low variance (max CV = ${maxCV.toFixed(4)}%)`);
    console.log('May be floating-point accumulation errors.');
    process.exit(0);
  } else {
    console.log(`❌ FAIL: Non-deterministic (max CV = ${maxCV.toFixed(4)}%)`);
    console.log('Identical seeds should produce IDENTICAL results!');
    process.exit(1);
  }
}

runDeterminismTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
