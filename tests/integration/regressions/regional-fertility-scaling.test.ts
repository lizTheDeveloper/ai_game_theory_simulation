/**
 * Regression Test: Regional Fertility Scaling (Nov 25, 2025)
 *
 * Purpose: Prevent population jump bug from incorrect historical initialization
 * Priority: HIGH (roadmap section 5.3)
 *
 * Root Cause:
 * - Bug (Nov 25, 2025): Used createDefaultInitialState() + hacky modify1990State()
 * - modify1990State set global pop to 5.32B but left regional pops at 2025 values (8.1B total)
 * - HumanPopulationPhase aggregated regional → global, overwriting correct 5.32B with 8.1B
 * - Result: Month 0 showed "5.32B" but Month 1+ jumped to 8.1B
 *
 * Fix (commit c4ac98029):
 * - Created proper initializeHistoricalSimulation() function
 * - Scales ALL regional populations by historical factor (0.654x for 1990)
 * - Deleted hacky modify1990State() function
 *
 * Test Strategy:
 * 1. Initialize state for 1990 using proper function
 * 2. Verify global population matches historical data (5.32B)
 * 3. Verify regional populations sum to global (no mismatch)
 * 4. Run simulation for 1 month
 * 5. Verify population remains stable (within 1% - natural growth only)
 *
 * @module tests/integration/regressions/regional-fertility-scaling
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { SimulationEngine } from '@/simulation/engine';
import type { GameState } from '@/types/game';

describe('Regional Fertility Scaling Regression Test', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  describe('Historical Initialization Correctness', () => {
    test('should initialize 1990 state with correct global population', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await initializeHistoricalSimulation(1990, rng);

      const globalPop = state.humanPopulationSystem.population;

      // 1990 population: 5.32B (UN World Population Prospects 2024)
      // Population is stored in billions in humanPopulationSystem.population
      // Allow ±1% tolerance for initialization variance
      const expectedPop = 5.32; // billions
      const tolerance = expectedPop * 0.01; // 1%

      assert.ok(
        Math.abs(globalPop - expectedPop) < tolerance,
        `1990 global population should be ~5.32B, got ${globalPop.toFixed(2)}B (expected ${expectedPop.toFixed(2)}B ± ${tolerance.toFixed(2)}B)`
      );
    });

    test('should initialize 1990 state with regional populations summing to global', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await initializeHistoricalSimulation(1990, rng);

      const globalPop = state.humanPopulationSystem.population; // billions
      const regionalSum = state.humanPopulationSystem.regionalPopulations.reduce(
        (sum, region) => sum + region.population, // millions
        0
      );

      // Regional populations are in millions, global is in billions
      // Convert regional sum to billions for comparison
      const regionalSumB = regionalSum / 1000;

      // Regional sum should match global within rounding error (0.1%)
      const tolerance = globalPop * 0.001;

      assert.ok(
        Math.abs(regionalSumB - globalPop) < tolerance,
        `Regional populations (${regionalSumB.toFixed(2)}B) should sum to global (${globalPop.toFixed(2)}B), diff: ${(regionalSumB - globalPop).toFixed(3)}B`
      );
    });

    test('should scale ALL regional populations by historical factor', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await initializeHistoricalSimulation(1990, rng);

      // All regions should be scaled down from 2025 baseline
      // 1990 pop (5.32B) / 2025 pop (8.1B) ≈ 0.654 scaling factor
      const expectedScalingFactor = 5.32 / 8.1; // ~0.657

      // Expected unscaled total for 2025 (from default initialization)
      // East Asia: 1677M, South Asia: 2048M, etc. → ~8136M total
      const expected2025Total = 8136; // millions (from code output)

      const actualTotalM = state.humanPopulationSystem.regionalPopulations.reduce(
        (sum, region) => sum + region.population,
        0
      );

      // Verify total was scaled correctly
      const expectedScaledTotal = expected2025Total * expectedScalingFactor; // ~5321M
      const tolerance = expectedScaledTotal * 0.01; // 1% tolerance

      assert.ok(
        Math.abs(actualTotalM - expectedScaledTotal) < tolerance,
        `Regional total should be scaled: got ${actualTotalM.toFixed(0)}M, expected ${expectedScaledTotal.toFixed(0)}M ± ${tolerance.toFixed(0)}M`
      );

      // Verify each region's population and baseline were both scaled
      for (const region of state.humanPopulationSystem.regionalPopulations) {
        // Both population and baselinePopulation should be scaled by same factor
        // So population should equal baselinePopulation for 1990 initialization
        assert.ok(
          Math.abs(region.population - region.baselinePopulation) < 1, // Within 1M tolerance
          `Region ${region.name}: population (${region.population.toFixed(0)}M) should equal baselinePopulation (${region.baselinePopulation.toFixed(0)}M) after scaling`
        );

        // Verify population is reasonable (scaled down from 2025)
        assert.ok(
          region.population > 0,
          `Region ${region.name} population should be positive: ${region.population}M`
        );
      }
    });
  });

  describe('Population Stability After Initialization', () => {
    test('should NOT jump population immediately after Month 0', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await initializeHistoricalSimulation(1990, rng);

      const month0Pop = state.humanPopulationSystem.population; // billions

      // Run simulation for 1 month
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 1 });
      const result = engine.run(state, { maxMonths: 1, checkActualOutcomes: false });

      const month1Pop = result.finalState.humanPopulationSystem.population; // billions

      // Population should remain stable within 1% (natural growth only)
      // 1990 growth rate: ~1.6% annual = ~0.13% monthly
      const tolerance = month0Pop * 0.01; // 1% tolerance

      assert.ok(
        Math.abs(month1Pop - month0Pop) < tolerance,
        `Population should remain stable after Month 0: Month 0 = ${month0Pop.toFixed(2)}B, Month 1 = ${month1Pop.toFixed(2)}B, diff = ${(month1Pop - month0Pop).toFixed(3)}B (tolerance: ${tolerance.toFixed(3)}B)`
      );

      // Also verify no sudden jump to 2025 values
      assert.ok(
        month1Pop < 6, // Should stay well below 6B in 1990 (billions)
        `Population should NOT jump to 2025 values (8.1B). Got ${month1Pop.toFixed(2)}B`
      );
    });

    test('should maintain regional-global consistency after simulation', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await initializeHistoricalSimulation(1990, rng);

      // Run simulation for 6 months
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 6 });
      const result = engine.run(state, { maxMonths: 6, checkActualOutcomes: false });

      const globalPop = result.finalState.humanPopulationSystem.population; // billions
      const regionalSum = result.finalState.humanPopulationSystem.regionalPopulations.reduce(
        (sum, region) => sum + region.population, // millions
        0
      );

      // Regional populations are in millions, global is in billions
      const regionalSumB = regionalSum / 1000;

      // Regional sum should still match global within rounding error
      const tolerance = globalPop * 0.001;

      assert.ok(
        Math.abs(regionalSumB - globalPop) < tolerance,
        `After 6 months: Regional sum (${regionalSumB.toFixed(2)}B) should match global (${globalPop.toFixed(2)}B), diff: ${(regionalSumB - globalPop).toFixed(3)}B`
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle different historical years correctly', async () => {
      const years = [1990, 2000, 2010, 2020];
      const expectedPops = [5.32, 6.14, 6.96, 7.84]; // UN data (billions)

      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const expectedPop = expectedPops[i];

        const rng = createTestRng(TEST_SEED + i);
        const state = await initializeHistoricalSimulation(year, rng);

        const actualPop = state.humanPopulationSystem.population;

        // Allow ±5% tolerance (historical data reconstruction has variance)
        const tolerance = expectedPop * 0.05;

        assert.ok(
          Math.abs(actualPop - expectedPop) < tolerance,
          `${year} population: expected ${expectedPop.toFixed(2)}B, got ${actualPop.toFixed(2)}B (tolerance: ${tolerance.toFixed(2)}B)`
        );
      }
    });

    test('should verify initializeHistoricalSimulation exists and is callable', async () => {
      // Regression: ensure proper function exists (not deleted)
      assert.ok(
        typeof initializeHistoricalSimulation === 'function',
        'initializeHistoricalSimulation function should exist'
      );

      const rng = createTestRng(TEST_SEED);
      const state = await initializeHistoricalSimulation(1990, rng);

      assert.ok(
        state.humanPopulationSystem?.population > 0,
        'Should return valid state with population'
      );
    });
  });
});
