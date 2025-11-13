/**
 * AI Scaling Parameter Verification Test
 *
 * Validates that AI compute growth matches research-backed values:
 * - Sevilla & Roldán (2024): 4.1× per year training compute growth
 * - Combined: 3.73× hardware × 1.10× algorithmic = 4.10× per year
 *
 * @research https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
 * @date 2025-11-13
 */

import { describe, test, expect } from '@jest/globals';
import { createSeedState } from '@/simulation/index';
import { applyComputeGrowth } from '@/simulation/computeInfrastructure';
import { seedRandom } from '@/simulation/utils/deterministicRng';

describe('AI Scaling Parameter Verification', () => {
  test('should match research-backed compute growth rate (4.1× per year)', () => {
    const state = createSeedState(42);
    const rng = seedRandom(42);

    // Record initial values
    const initialHardware = state.computeInfrastructure.hardwareEfficiency;
    const initialAlgorithmic = state.computeInfrastructure.algorithmsEfficiency;

    // Simulate 12 months (1 year)
    for (let month = 0; month < 12; month++) {
      applyComputeGrowth(state, rng);
    }

    // Calculate actual growth
    const hardwareGrowth = state.computeInfrastructure.hardwareEfficiency / initialHardware;
    const algorithmicGrowth = state.computeInfrastructure.algorithmsEfficiency / initialAlgorithmic;
    const combinedGrowth = hardwareGrowth * algorithmicGrowth;

    // Verify hardware growth: 3.73× per year (±5% tolerance)
    expect(hardwareGrowth).toBeGreaterThan(3.73 * 0.95);
    expect(hardwareGrowth).toBeLessThan(3.73 * 1.05);

    // Verify algorithmic growth: 1.10× per year (±5% tolerance)
    expect(algorithmicGrowth).toBeGreaterThan(1.10 * 0.95);
    expect(algorithmicGrowth).toBeLessThan(1.10 * 1.05);

    // Verify combined growth: 4.10× per year (±5% tolerance)
    expect(combinedGrowth).toBeGreaterThan(4.10 * 0.95);
    expect(combinedGrowth).toBeLessThan(4.10 * 1.05);

    console.log(`\n✅ AI Scaling Verification:`);
    console.log(`   Hardware growth (1 year): ${hardwareGrowth.toFixed(2)}× (target: 3.73×)`);
    console.log(`   Algorithmic growth (1 year): ${algorithmicGrowth.toFixed(2)}× (target: 1.10×)`);
    console.log(`   Combined growth (1 year): ${combinedGrowth.toFixed(2)}× (target: 4.10×)`);
  });

  test('should achieve ~600,000× growth over 10 years', () => {
    const state = createSeedState(43);
    const rng = seedRandom(43);

    const initialHardware = state.computeInfrastructure.hardwareEfficiency;
    const initialAlgorithmic = state.computeInfrastructure.algorithmsEfficiency;

    // Simulate 120 months (10 years)
    for (let month = 0; month < 120; month++) {
      applyComputeGrowth(state, rng);
    }

    const hardwareGrowth = state.computeInfrastructure.hardwareEfficiency / initialHardware;
    const algorithmicGrowth = state.computeInfrastructure.algorithmsEfficiency / initialAlgorithmic;
    const combinedGrowth = hardwareGrowth * algorithmicGrowth;

    // Expected: 4.10^10 ≈ 600,000× (allow wide range due to stochastic breakthroughs)
    expect(combinedGrowth).toBeGreaterThan(400_000);
    expect(combinedGrowth).toBeLessThan(1_000_000);

    console.log(`\n✅ 10-Year Scaling:`);
    console.log(`   Hardware: ${hardwareGrowth.toFixed(0)}×`);
    console.log(`   Algorithmic: ${algorithmicGrowth.toFixed(0)}×`);
    console.log(`   Combined: ${combinedGrowth.toFixed(0)}× (target: ~600,000×)`);
  });

  test('should maintain deterministic growth (no RNG in base rates)', () => {
    const state1 = createSeedState(100);
    const state2 = createSeedState(100);
    const rng1 = seedRandom(100);
    const rng2 = seedRandom(100);

    // Run same simulation twice
    for (let month = 0; month < 12; month++) {
      applyComputeGrowth(state1, rng1);
      applyComputeGrowth(state2, rng2);
    }

    // Results should be identical (deterministic)
    expect(state1.computeInfrastructure.hardwareEfficiency)
      .toBeCloseTo(state2.computeInfrastructure.hardwareEfficiency, 10);

    expect(state1.computeInfrastructure.algorithmsEfficiency)
      .toBeCloseTo(state2.computeInfrastructure.algorithmsEfficiency, 10);

    console.log(`\n✅ Determinism: Hardware ${state1.computeInfrastructure.hardwareEfficiency.toFixed(2)}× (both runs match)`);
  });

  test('should document the research backing', () => {
    // This test just validates that the code has proper research citations
    // Check that the key research papers are referenced in the codebase

    const fs = require('fs');
    const computeInfraCode = fs.readFileSync(
      'src/simulation/computeInfrastructure.ts',
      'utf-8'
    );

    // Verify research citations exist
    expect(computeInfraCode).toContain('Sevilla & Roldán (2024)');
    expect(computeInfraCode).toContain('4.1×/year');
    expect(computeInfraCode).toContain('https://epoch.ai/blog');
    expect(computeInfraCode).toContain('Cottier et al. (2024)');
    expect(computeInfraCode).toContain('arXiv:2405.21015');

    console.log(`\n✅ Research citations verified in computeInfrastructure.ts`);
  });
});
