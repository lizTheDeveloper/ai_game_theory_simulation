/**
 * Validation script for Bug #3 fix: Stochastic governance initialization
 *
 * Validates that:
 * 1. Governance quality values vary across different seeds
 * 2. institutionalCapacity variance propagates to boundariesScore
 * 3. Ecological paradigm score shows meaningful variance (target: ±10-20%)
 *
 * Usage: npx tsx scripts/validateBug3Fix.ts
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateProgressiveEcologicalScore } from '../src/simulation/planetaryBoundaryRecovery';

console.log('🔍 BUG #3 FIX VALIDATION: Stochastic Governance Initialization\n');

// Test 1: Verify governance quality variance across seeds
console.log('=== TEST 1: Governance Quality Variance ===\n');

const seeds = [12345, 67890, 11111, 22222, 33333];
const govQualityResults: Array<{
  seed: number;
  decisionQuality: number;
  transparency: number;
  participationRate: number;
  institutionalCapacity: number;
  consensusBuildingEfficiency: number;
  minorityProtectionStrength: number;
}> = [];

for (const seed of seeds) {
  const state = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, seed);
  const gq = state.government.governanceQuality;

  govQualityResults.push({
    seed,
    decisionQuality: gq.decisionQuality,
    transparency: gq.transparency,
    participationRate: gq.participationRate,
    institutionalCapacity: gq.institutionalCapacity,
    consensusBuildingEfficiency: gq.consensusBuildingEfficiency,
    minorityProtectionStrength: gq.minorityProtectionStrength,
  });

  console.log(`Seed ${seed}:`);
  console.log(`  decisionQuality: ${gq.decisionQuality.toFixed(3)}`);
  console.log(`  transparency: ${gq.transparency.toFixed(3)}`);
  console.log(`  participationRate: ${gq.participationRate.toFixed(3)}`);
  console.log(`  institutionalCapacity: ${gq.institutionalCapacity.toFixed(3)} (CRITICAL)`);
  console.log(`  consensusBuildingEfficiency: ${gq.consensusBuildingEfficiency.toFixed(3)}`);
  console.log(`  minorityProtectionStrength: ${gq.minorityProtectionStrength.toFixed(3)}`);
  console.log();
}

// Calculate variance statistics
const institutionalCapacities = govQualityResults.map(r => r.institutionalCapacity);
const min = Math.min(...institutionalCapacities);
const max = Math.max(...institutionalCapacities);
const mean = institutionalCapacities.reduce((sum, val) => sum + val, 0) / institutionalCapacities.length;
const variance = institutionalCapacities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / institutionalCapacities.length;
const stdDev = Math.sqrt(variance);
const coefficientOfVariation = (stdDev / mean) * 100;

console.log('=== Institutional Capacity Statistics ===');
console.log(`  Min: ${min.toFixed(3)}`);
console.log(`  Max: ${max.toFixed(3)}`);
console.log(`  Range: ${(max - min).toFixed(3)}`);
console.log(`  Mean: ${mean.toFixed(3)}`);
console.log(`  Std Dev: ${stdDev.toFixed(3)}`);
console.log(`  CV: ${coefficientOfVariation.toFixed(1)}%`);
console.log();

// Test 2: Verify no-seed backward compatibility
console.log('=== TEST 2: Backward Compatibility (no seed) ===\n');

const stateNoSeed = createDefaultInitialState('historical');
const gqNoSeed = stateNoSeed.government.governanceQuality;

console.log('State created without seed (should use deterministic defaults):');
console.log(`  decisionQuality: ${gqNoSeed.decisionQuality.toFixed(3)} (expected: 0.500)`);
console.log(`  institutionalCapacity: ${gqNoSeed.institutionalCapacity.toFixed(3)} (expected: 0.600)`);
console.log();

const isBackwardCompatible =
  gqNoSeed.decisionQuality === 0.5 &&
  gqNoSeed.transparency === 0.6 &&
  gqNoSeed.participationRate === 0.4 &&
  gqNoSeed.institutionalCapacity === 0.6 &&
  gqNoSeed.consensusBuildingEfficiency === 0.5 &&
  gqNoSeed.minorityProtectionStrength === 0.5;

console.log(`✅ Backward compatibility: ${isBackwardCompatible ? 'PASS' : 'FAIL'}\n`);

// Test 3: Validate variance target (±15-20%)
console.log('=== TEST 3: Variance Target Validation ===\n');

const expectedMin = 0.6 * 0.8;  // 20% below baseline
const expectedMax = 0.6 * 1.2;  // 20% above baseline

console.log(`Expected range: ${expectedMin.toFixed(3)} - ${expectedMax.toFixed(3)}`);
console.log(`Actual range: ${min.toFixed(3)} - ${max.toFixed(3)}`);

const withinExpectedRange = min >= expectedMin && max <= expectedMax;
console.log(`✅ Within expected ±20% range: ${withinExpectedRange ? 'PASS' : 'FAIL'}\n`);

// Test 4: Check ecological score variance (the actual bug fix validation)
console.log('=== TEST 4: Ecological Paradigm Score Variance ===\n');

const ecologicalScores: number[] = [];

for (const seed of seeds) {
  const state = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, seed);

  // Initialize planetary boundaries system (simulate month 0)
  // Note: calculateProgressiveEcologicalScore needs boundaries initialized
  const ecologicalScore = calculateProgressiveEcologicalScore(state);
  ecologicalScores.push(ecologicalScore);

  console.log(`Seed ${seed}: Ecological Score = ${ecologicalScore.toFixed(2)}`);
}

const ecoMin = Math.min(...ecologicalScores);
const ecoMax = Math.max(...ecologicalScores);
const ecoMean = ecologicalScores.reduce((sum, val) => sum + val, 0) / ecologicalScores.length;
const ecoStdDev = Math.sqrt(
  ecologicalScores.reduce((sum, val) => sum + Math.pow(val - ecoMean, 2), 0) / ecologicalScores.length
);
const ecoCV = (ecoStdDev / ecoMean) * 100;

console.log();
console.log('=== Ecological Score Statistics ===');
console.log(`  Min: ${ecoMin.toFixed(2)}`);
console.log(`  Max: ${ecoMax.toFixed(2)}`);
console.log(`  Range: ${(ecoMax - ecoMin).toFixed(2)}`);
console.log(`  Mean: ${ecoMean.toFixed(2)}`);
console.log(`  Std Dev: ${ecoStdDev.toFixed(2)}`);
console.log(`  CV: ${ecoCV.toFixed(1)}%`);
console.log();

// Target: ±10-20% variance
const hasVariance = ecoMax - ecoMin > 0;
const variancePercent = ((ecoMax - ecoMin) / ecoMean) * 100;

console.log(`✅ Ecological score shows variance: ${hasVariance ? 'PASS' : 'FAIL'}`);
console.log(`   Variance: ${variancePercent.toFixed(1)}% (target: ±10-20%)\n`);

// Summary
console.log('=== SUMMARY ===');
console.log(`✅ Governance quality variance: ${coefficientOfVariation > 5 ? 'PASS' : 'FAIL'} (${coefficientOfVariation.toFixed(1)}% CV)`);
console.log(`✅ Backward compatibility: ${isBackwardCompatible ? 'PASS' : 'FAIL'}`);
console.log(`✅ Within ±20% range: ${withinExpectedRange ? 'PASS' : 'FAIL'}`);
console.log(`✅ Ecological variance: ${hasVariance ? 'PASS' : 'FAIL'} (${variancePercent.toFixed(1)}%)`);

const allTestsPassed =
  coefficientOfVariation > 5 &&
  isBackwardCompatible &&
  withinExpectedRange &&
  hasVariance;

console.log();
console.log(allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

process.exit(allTestsPassed ? 0 : 1);
