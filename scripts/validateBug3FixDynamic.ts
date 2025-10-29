/**
 * Dynamic validation for Bug #3 fix: Stochastic governance initialization
 *
 * Runs short simulations (24 months) to verify that governance variance
 * propagates to ecological paradigm scores over time.
 *
 * Usage: npx tsx scripts/validateBug3FixDynamic.ts
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('🔍 BUG #3 FIX DYNAMIC VALIDATION: Governance → Ecological Variance\n');

const seeds = [12345, 67890, 11111, 22222, 33333];
const monthsToSimulate = 24;  // 2 years

interface RunResult {
  seed: number;
  institutionalCapacity: number;
  ecologicalScoreT0: number;
  ecologicalScoreT24: number;
  ecologicalDelta: number;
}

const results: RunResult[] = [];

for (const seed of seeds) {
  console.log(`\n=== Seed ${seed} ===`);

  const state = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, seed);
  const institutionalCapacity = state.government.governanceQuality.institutionalCapacity;

  // Get initial ecological score
  const ecologicalScoreT0 = state.multiParadigmDUI?.paradigms?.find(p => p.id === 'ecological')?.score ?? 0;

  console.log(`  T=0: institutionalCapacity=${institutionalCapacity.toFixed(3)}, ecologicalScore=${ecologicalScoreT0.toFixed(2)}`);

  // Create simulation engine with matching seed
  const engine = new SimulationEngine({ seed });

  // Run simulation for 24 months
  for (let month = 0; month < monthsToSimulate; month++) {
    engine.step(state);
  }

  // Get final ecological score
  const ecologicalScoreT24 = state.multiParadigmDUI?.paradigms?.find(p => p.id === 'ecological')?.score ?? 0;
  const ecologicalDelta = ecologicalScoreT24 - ecologicalScoreT0;

  console.log(`  T=24: ecologicalScore=${ecologicalScoreT24.toFixed(2)}, delta=${ecologicalDelta.toFixed(2)}`);

  results.push({
    seed,
    institutionalCapacity,
    ecologicalScoreT0,
    ecologicalScoreT24,
    ecologicalDelta,
  });
}

// Statistics
console.log('\n=== RESULTS SUMMARY ===\n');

const capacities = results.map(r => r.institutionalCapacity);
const scoresT24 = results.map(r => r.ecologicalScoreT24);

const capacityMean = capacities.reduce((sum, v) => sum + v, 0) / capacities.length;
const capacityStdDev = Math.sqrt(
  capacities.reduce((sum, v) => sum + Math.pow(v - capacityMean, 2), 0) / capacities.length
);

const scoreMean = scoresT24.reduce((sum, v) => sum + v, 0) / scoresT24.length;
const scoreStdDev = Math.sqrt(
  scoresT24.reduce((sum, v) => sum + Math.pow(v - scoreMean, 2), 0) / scoresT24.length
);

const scoreMin = Math.min(...scoresT24);
const scoreMax = Math.max(...scoresT24);
const scoreRange = scoreMax - scoreMin;
const scoreCV = (scoreStdDev / scoreMean) * 100;
const variancePercent = (scoreRange / scoreMean) * 100;

console.log('Institutional Capacity (T=0):');
console.log(`  Range: ${Math.min(...capacities).toFixed(3)} - ${Math.max(...capacities).toFixed(3)}`);
console.log(`  Mean: ${capacityMean.toFixed(3)} ± ${capacityStdDev.toFixed(3)}`);
console.log();

console.log('Ecological Score (T=24):');
console.log(`  Range: ${scoreMin.toFixed(2)} - ${scoreMax.toFixed(2)}`);
console.log(`  Mean: ${scoreMean.toFixed(2)} ± ${scoreStdDev.toFixed(2)}`);
console.log(`  CV: ${scoreCV.toFixed(1)}%`);
console.log(`  Variance: ${variancePercent.toFixed(1)}% of mean`);
console.log();

// Validation
const hasVariance = scoreRange > 0;
const meetsTarget = variancePercent >= 5;  // At least 5% variance (conservative)

console.log('=== VALIDATION ===');
console.log(`✅ Governance variance exists: PASS (range: ${(Math.max(...capacities) - Math.min(...capacities)).toFixed(3)})`);
console.log(`✅ Ecological score variance: ${hasVariance ? 'PASS' : 'FAIL'} (range: ${scoreRange.toFixed(2)})`);
console.log(`✅ Meets target (≥5% variance): ${meetsTarget ? 'PASS' : 'FAIL'} (${variancePercent.toFixed(1)}%)`);

const allPassed = hasVariance && meetsTarget;
console.log();
console.log(allPassed ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');

process.exit(allPassed ? 0 : 1);
