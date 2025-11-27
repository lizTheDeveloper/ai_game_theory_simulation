#!/usr/bin/env npx tsx
/**
 * Determinism Stress Test
 *
 * HIGH-9 Investigation: Run N identical simulations to measure CV
 * Target: CV < 0.1% for research simulation
 * Observed: CV = 6.7% (67x target)
 *
 * Usage: npx tsx scripts/determinismStressTest.ts [--runs N]
 */

import { SimulationEngine } from '../src/simulation/engine';
import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';
import { SimulationConfig } from '../src/types/config';

const RUNS = parseInt(process.argv.find(arg => arg.startsWith('--runs='))?.split('=')[1] || '3');
const SEED = 19900101; // Fixed seed for all runs
const MAX_STEPS = 408; // 34 years (1990-2024)

// Simple LCG RNG (same as hindcastingValidation.ts)
function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface RunResult {
  run: number;
  seed: number;
  finalPopulation: number;
  finalTemperature: number;
  finalQoL: number;
  finalBiodiversity: number;
  outcome: string;
}

console.log(`\n🔬 DETERMINISM STRESS TEST`);
console.log(`=========================`);
console.log(`Runs: ${RUNS}`);
console.log(`Seed: ${SEED} (IDENTICAL for all runs)`);
console.log(`Steps: ${MAX_STEPS} (1990-2024 hindcast)`);
console.log(`Target: CV < 0.1%`);
console.log();

const results: RunResult[] = [];

for (let i = 1; i <= RUNS; i++) {
  console.log(`\n📊 Run ${i}/${RUNS} (seed=${SEED})...`);

  const rng = createSeededRng(SEED);
  setDeterministicRng(rng);

  const config: SimulationConfig = {
    startYear: 1990,
    maxSteps: MAX_STEPS,
    targetYear: 2024,
    scenario: 'minimal' as any,
    enableAI: false,
    enableAdaptation: false,
  };

  const state = initializeHistoricalSimulation(1990, rng);

  try {
    const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_STEPS });
    const simResult = engine.run(state, { maxMonths: MAX_STEPS });
    const finalState = simResult.finalState;

    const result: RunResult = {
      run: i,
      seed: SEED,
      finalPopulation: finalState.humanPopulationSystem?.population || 0,
      finalTemperature: finalState.resourceEconomy?.co2?.temperatureAnomaly || 0,
      finalQoL: finalState.globalMetrics?.qualityOfLife || 0,
      finalBiodiversity: finalState.environmentalAccumulation?.biodiversityIndex || 0,
      outcome: finalState.unifiedOutcome?.label || 'unknown',
    };

    results.push(result);

    console.log(`   Population: ${(result.finalPopulation / 1e9).toFixed(2)}B`);
    console.log(`   Temperature: ${result.finalTemperature.toFixed(2)}°C`);
    console.log(`   QoL: ${result.finalQoL.toFixed(3)}`);
    console.log(`   Biodiversity: ${result.finalBiodiversity.toFixed(3)}`);
    console.log(`   Outcome: ${result.outcome}`);

  } catch (err: any) {
    console.error(`   ❌ CRASH: ${err.message}`);
    results.push({
      run: i,
      seed: SEED,
      finalPopulation: NaN,
      finalTemperature: NaN,
      finalQoL: NaN,
      finalBiodiversity: NaN,
      outcome: 'CRASHED',
    });
  }
}

// Calculate statistics
console.log(`\n\n📈 STATISTICAL ANALYSIS`);
console.log(`========================`);

function calculateStats(values: number[], label: string) {
  const validValues = values.filter(v => !isNaN(v));
  if (validValues.length === 0) {
    console.log(`\n${label}: ALL CRASHED`);
    return;
  }

  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const variance = validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validValues.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100;
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const range = max - min;
  const rangePercent = (range / mean) * 100;

  console.log(`\n${label}:`);
  console.log(`  Mean: ${mean.toFixed(3)}`);
  console.log(`  StdDev: ${stdDev.toFixed(3)}`);
  console.log(`  CV: ${cv.toFixed(3)}%`);
  console.log(`  Range: ${min.toFixed(3)} - ${max.toFixed(3)} (${rangePercent.toFixed(1)}% of mean)`);

  if (cv < 0.01) {
    console.log(`  ✅ EXCELLENT - Nearly perfect determinism`);
  } else if (cv < 0.1) {
    console.log(`  ✅ PASS - Acceptable for research simulation`);
  } else if (cv < 1.0) {
    console.log(`  ⚠️  WARNING - High variance, investigate`);
  } else {
    console.log(`  ❌ FAIL - Non-deterministic, CRITICAL BUG`);
  }

  return { mean, stdDev, cv, min, max };
}

const popStats = calculateStats(
  results.map(r => r.finalPopulation / 1e9),
  'Population (billions)'
);

const tempStats = calculateStats(
  results.map(r => r.finalTemperature),
  'Temperature (°C)'
);

const qolStats = calculateStats(
  results.map(r => r.finalQoL),
  'Quality of Life'
);

const bioStats = calculateStats(
  results.map(r => r.finalBiodiversity),
  'Biodiversity Index'
);

// Overall verdict
console.log(`\n\n🎯 OVERALL VERDICT`);
console.log(`==================`);

const allCVs = [popStats, tempStats, qolStats, bioStats]
  .filter(s => s !== undefined)
  .map(s => s!.cv);

const maxCV = Math.max(...allCVs);
const avgCV = allCVs.reduce((a, b) => a + b, 0) / allCVs.length;

console.log(`Max CV: ${maxCV.toFixed(3)}%`);
console.log(`Avg CV: ${avgCV.toFixed(3)}%`);
console.log(`Target: < 0.1%`);

if (maxCV < 0.1) {
  console.log(`\n✅ PASS - Simulation is deterministic`);
  process.exit(0);
} else {
  console.log(`\n❌ FAIL - Non-determinism detected (${(maxCV / 0.1).toFixed(0)}x threshold)`);
  console.log(`\nMost likely causes:`);
  console.log(`1. Optional RNG parameters with Math.random() fallback`);
  console.log(`2. Object.entries() iteration order issues`);
  console.log(`3. Async operations completing in different order`);
  console.log(`4. Date.now() or other system calls in calculation paths`);
  process.exit(1);
}
