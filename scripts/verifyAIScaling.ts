/**
 * AI Scaling Parameter Verification Script
 *
 * Validates that AI compute growth matches research-backed values.
 * Run: npx tsx scripts/verifyAIScaling.ts
 */

import { createSeedState } from '@/simulation/index';
import { applyComputeGrowth } from '@/simulation/computeInfrastructure';
import { seedRandom } from '@/simulation/utils/deterministicRng';

console.log('=== AI Scaling Parameter Verification ===\n');
console.log('Research: Sevilla & Roldán (2024) - 4.1× per year training compute growth');
console.log('Target: 3.73× hardware × 1.10× algorithmic = 4.10× per year\n');

// Test 1: 1-year growth
console.log('Test 1: Annual Growth Rate');
console.log('---------------------------');
const state1 = createSeedState(42);
const rng1 = seedRandom(42);

const initialHardware1 = state1.computeInfrastructure.hardwareEfficiency;
const initialAlgorithmic1 = state1.computeInfrastructure.algorithmsEfficiency;

for (let month = 0; month < 12; month++) {
  applyComputeGrowth(state1, rng1);
}

const hardwareGrowth1 = state1.computeInfrastructure.hardwareEfficiency / initialHardware1;
const algorithmicGrowth1 = state1.computeInfrastructure.algorithmsEfficiency / initialAlgorithmic1;
const combinedGrowth1 = hardwareGrowth1 * algorithmicGrowth1;

console.log(`Hardware growth (1 year): ${hardwareGrowth1.toFixed(2)}× (target: 3.73×)`);
console.log(`Algorithmic growth (1 year): ${algorithmicGrowth1.toFixed(2)}× (target: 1.10×)`);
console.log(`Combined growth (1 year): ${combinedGrowth1.toFixed(2)}× (target: 4.10×)`);

const hardwareError = Math.abs(hardwareGrowth1 - 3.73) / 3.73 * 100;
const algoError = Math.abs(algorithmicGrowth1 - 1.10) / 1.10 * 100;
const combinedError = Math.abs(combinedGrowth1 - 4.10) / 4.10 * 100;

console.log(`\nError margins:`);
console.log(`  Hardware: ${hardwareError.toFixed(1)}% (pass if < 5%)`);
console.log(`  Algorithmic: ${algoError.toFixed(1)}% (pass if < 5%)`);
console.log(`  Combined: ${combinedError.toFixed(1)}% (pass if < 5%)`);

const test1Pass = hardwareError < 5 && algoError < 5 && combinedError < 5;
console.log(`\nTest 1: ${test1Pass ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: 10-year growth
console.log('Test 2: 10-Year Growth');
console.log('----------------------');
const state2 = createSeedState(43);
const rng2 = seedRandom(43);

const initialHardware2 = state2.computeInfrastructure.hardwareEfficiency;
const initialAlgorithmic2 = state2.computeInfrastructure.algorithmsEfficiency;

for (let month = 0; month < 120; month++) {
  applyComputeGrowth(state2, rng2);
}

const hardwareGrowth10 = state2.computeInfrastructure.hardwareEfficiency / initialHardware2;
const algorithmicGrowth10 = state2.computeInfrastructure.algorithmsEfficiency / initialAlgorithmic2;
const combinedGrowth10 = hardwareGrowth10 * algorithmicGrowth10;

console.log(`Hardware: ${hardwareGrowth10.toFixed(0)}×`);
console.log(`Algorithmic: ${algorithmicGrowth10.toFixed(0)}×`);
console.log(`Combined: ${combinedGrowth10.toFixed(0)}× (target: ~600,000×)`);

const test2Pass = combinedGrowth10 > 400_000 && combinedGrowth10 < 1_000_000;
console.log(`\nTest 2: ${test2Pass ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Determinism
console.log('Test 3: Determinism');
console.log('-------------------');
const state3a = createSeedState(100);
const state3b = createSeedState(100);
const rng3a = seedRandom(100);
const rng3b = seedRandom(100);

for (let month = 0; month < 12; month++) {
  applyComputeGrowth(state3a, rng3a);
  applyComputeGrowth(state3b, rng3b);
}

const hardwareDiff = Math.abs(state3a.computeInfrastructure.hardwareEfficiency - state3b.computeInfrastructure.hardwareEfficiency);
const algoDiff = Math.abs(state3a.computeInfrastructure.algorithmsEfficiency - state3b.computeInfrastructure.algorithmsEfficiency);

console.log(`Hardware A: ${state3a.computeInfrastructure.hardwareEfficiency.toFixed(10)}`);
console.log(`Hardware B: ${state3b.computeInfrastructure.hardwareEfficiency.toFixed(10)}`);
console.log(`Difference: ${hardwareDiff.toExponential(2)}`);

const test3Pass = hardwareDiff < 1e-10 && algoDiff < 1e-10;
console.log(`\nTest 3: ${test3Pass ? '✅ PASS' : '❌ FAIL'}\n`);

// Summary
console.log('=== Summary ===');
const allPass = test1Pass && test2Pass && test3Pass;
console.log(`Overall: ${allPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);
console.log('\nResearch backing verified:');
console.log('  - Sevilla & Roldán (2024): https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year');
console.log('  - Cottier et al. (2024): https://arxiv.org/abs/2405.21015');

process.exit(allPass ? 0 : 1);
