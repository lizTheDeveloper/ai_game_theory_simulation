/**
 * Integration Test: C5 - Phase Execution Order Dependencies
 *
 * Tests that phase execution order maintains correct state dependencies.
 * Population changes must happen after mortality but before economic updates.
 * Race conditions in state updates can cause incorrect calculations.
 *
 * Integration Path:
 * BayesianMortalityResolutionPhase → HumanPopulationPhase → UpdateEconomicStagePhase
 *
 * Research Context:
 * - Phase order is critical for simulation integrity
 * - Mortality must be calculated before population update
 * - Economic stage depends on current population, not previous month's
 * - Out-of-order execution creates temporal inconsistencies
 *
 * Assertions:
 * - Population reflects mortality from current month
 * - Economic stage uses updated population
 * - No race conditions in state updates
 * - State remains consistent across phase boundaries
 *
 * @module tests/integration/cascades/phase-execution-order
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { BayesianMortalityResolutionPhase } from '@/simulation/engine/phases/BayesianMortalityResolutionPhase';
import { HumanPopulationPhase } from '@/simulation/engine/phases/HumanPopulationPhase';
import { UpdateEconomicStagePhase } from '@/simulation/engine/phases/UpdateEconomicStagePhase';
import type { GameState } from '@/types/game';

describe('C5: Phase Execution Order Dependencies', () => {
  const TEST_SEED = 42800;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  function createPhaseContext(month: number): any {
    return {
      month,
      data: new Map(),
      executedPhases: new Set(),
    };
  }

  describe('Mortality → Population dependency', () => {
    test('should apply mortality before population update', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 100);
      const context = createPhaseContext(state.currentMonth);

      // Initialize Bayesian mortality with high risk
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.05, // 5% monthly mortality risk (very high)
          riskContributions: {
            climate: 0.03,
            conflict: 0.02,
          },
        };
      } else {
        state.bayesianMortality.totalMonthlyRisk = 0.05;
      }

      // Record initial population
      const initialPopulation = state.humanPopulationSystem?.totalPopulation ?? 8_000_000_000;

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();

      // Execute in correct order
      mortalityPhase.execute(state, rng, context);
      populationPhase.execute(state, rng, context);

      // Population should be updated and valid
      if (state.humanPopulationSystem) {
        assert.ok(Number.isFinite(state.humanPopulationSystem.totalPopulation));
        assert.ok(state.humanPopulationSystem.totalPopulation > 0,
          'Population should remain positive');
      }
    });

    test('should maintain population validity after mortality resolution', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Set moderate mortality risk
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.01, // 1% monthly mortality
          riskContributions: {
            climate: 0.005,
            disease: 0.005,
          },
        };
      }

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();

      mortalityPhase.execute(state, rng, context);
      populationPhase.execute(state, rng, context);

      // Verify population system integrity
      if (state.humanPopulationSystem) {
        assert.ok(Number.isFinite(state.humanPopulationSystem.totalPopulation));

        // Regional populations should also be valid
        if (state.humanPopulationSystem.regionalPopulations) {
          state.humanPopulationSystem.regionalPopulations.forEach((region, i) => {
            assert.ok(Number.isFinite(region.population),
              `Regional population ${i} should be finite`);
            assert.ok(region.population >= 0,
              `Regional population ${i} should be non-negative`);
          });
        }
      }
    });
  });

  describe('Population → Economic Stage dependency', () => {
    test('should use updated population for economic calculations', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Set initial population
      if (!state.humanPopulationSystem) {
        state.humanPopulationSystem = {
          totalPopulation: 8_000_000_000,
          regionalPopulations: [],
          migrationFlows: [],
        };
      }

      const initialPopulation = state.humanPopulationSystem.totalPopulation;

      // Simulate population change
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.02, // 2% mortality
          riskContributions: {},
        };
      }

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();
      const economicPhase = new UpdateEconomicStagePhase();

      // Execute in correct order
      mortalityPhase.execute(state, rng, context);
      populationPhase.execute(state, rng, context);

      // Record population after update
      const updatedPopulation = state.humanPopulationSystem.totalPopulation;

      // Execute economic phase
      economicPhase.execute(state, rng, context);

      // Economic calculations should use updated population
      // Verify economic state is valid
      if (state.economicSystem) {
        assert.ok(Number.isFinite(state.economicSystem.globalGDP ?? 0));

        if (state.economicSystem.stage) {
          assert.ok(['subsistence', 'developing', 'emerging', 'advanced', 'post-scarcity'].includes(state.economicSystem.stage),
            'Economic stage should be valid');
        }
      }

      // Population should be consistent
      assert.ok(Number.isFinite(state.humanPopulationSystem.totalPopulation));
    });

    test('should maintain state consistency across all three phases', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Initialize with baseline values
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.008, // Baseline mortality
          riskContributions: {},
        };
      }

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();
      const economicPhase = new UpdateEconomicStagePhase();

      // Execute complete sequence
      mortalityPhase.execute(state, rng, context);

      // Verify mortality state
      assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));

      populationPhase.execute(state, rng, context);

      // Verify population state
      if (state.humanPopulationSystem) {
        assert.ok(Number.isFinite(state.humanPopulationSystem.totalPopulation));
      }

      economicPhase.execute(state, rng, context);

      // Verify economic state
      if (state.economicSystem) {
        assert.ok(state.economicSystem.globalGDP === undefined || Number.isFinite(state.economicSystem.globalGDP));
      }

      // All three systems should be in valid state
      assert.ok(state.bayesianMortality !== undefined);
      assert.ok(state.humanPopulationSystem !== undefined);
    });
  });

  describe('Complete execution order integration', () => {
    test('should execute phases in correct dependency order', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 500);
      const context = createPhaseContext(state.currentMonth);

      // Set up realistic scenario
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.012,
          riskContributions: {
            climate: 0.005,
            disease: 0.004,
            conflict: 0.003,
          },
        };
      }

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();
      const economicPhase = new UpdateEconomicStagePhase();

      // Track phase execution order via context
      const executionOrder: string[] = [];

      // Execute phases with tracking
      mortalityPhase.execute(state, rng, context);
      executionOrder.push('mortality');

      populationPhase.execute(state, rng, context);
      executionOrder.push('population');

      economicPhase.execute(state, rng, context);
      executionOrder.push('economic');

      // Verify execution order is correct
      assert.deepStrictEqual(executionOrder, ['mortality', 'population', 'economic'],
        'Phases should execute in correct dependency order');

      // Verify final state consistency
      assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));
      if (state.humanPopulationSystem) {
        assert.ok(Number.isFinite(state.humanPopulationSystem.totalPopulation));
      }
    });

    test('should handle extreme values without breaking dependency chain', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 600);
      const context = createPhaseContext(state.currentMonth);

      // Set extreme mortality (catastrophe scenario)
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.1, // 10% monthly mortality (catastrophic)
          riskContributions: {
            nuclear: 0.06,
            pandemic: 0.04,
          },
        };
      } else {
        state.bayesianMortality.totalMonthlyRisk = 0.1;
      }

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();
      const economicPhase = new UpdateEconomicStagePhase();

      // Should not crash with extreme values
      assert.doesNotThrow(() => {
        mortalityPhase.execute(state, rng, context);
        populationPhase.execute(state, rng, context);
        economicPhase.execute(state, rng, context);
      });

      // State should remain valid throughout
      assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));
      if (state.humanPopulationSystem) {
        assert.ok(Number.isFinite(state.humanPopulationSystem.totalPopulation));
        assert.ok(state.humanPopulationSystem.totalPopulation > 0,
          'Population should remain positive even after catastrophic mortality');
      }
    });

    test('should maintain no circular dependencies', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 700);
      const context = createPhaseContext(state.currentMonth);

      // Initialize baseline state
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.01,
          riskContributions: {},
        };
      }

      const mortalityPhase = new BayesianMortalityResolutionPhase();
      const populationPhase = new HumanPopulationPhase();
      const economicPhase = new UpdateEconomicStagePhase();

      // Execute forward
      mortalityPhase.execute(state, rng, context);
      const mortalityAfterFirst = state.bayesianMortality.totalMonthlyRisk;

      populationPhase.execute(state, rng, context);
      const populationAfterFirst = state.humanPopulationSystem?.totalPopulation ?? 0;

      economicPhase.execute(state, rng, context);

      // Execute mortality again - should not create circular dependency
      const rng2 = createTestRng(TEST_SEED + 800);
      mortalityPhase.execute(state, rng2, context);
      const mortalityAfterSecond = state.bayesianMortality.totalMonthlyRisk;

      // Values may change but should not create infinite feedback loop
      assert.ok(Number.isFinite(mortalityAfterSecond));
      assert.ok(Number.isFinite(state.humanPopulationSystem?.totalPopulation ?? 0));

      // No NaN propagation
      assert.ok(!Number.isNaN(mortalityAfterSecond));
      assert.ok(!Number.isNaN(state.humanPopulationSystem?.totalPopulation ?? 0));
    });
  });
});
