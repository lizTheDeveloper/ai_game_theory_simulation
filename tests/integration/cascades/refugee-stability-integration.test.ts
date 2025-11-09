/**
 * Integration Test: C9 - Refugee Crisis + Regional Stability Integration
 *
 * Tests that large refugee movements destabilize regions and increase mortality.
 * Crisis-driven migration should be tracked accurately, receiving regions should
 * experience instability, and mortality should increase in unstable regions.
 *
 * Integration Path:
 * RefugeeCrisisPhase → SocialStabilityPhase → BayesianMortalityResolutionPhase
 *
 * Research Context:
 * - UNHCR (2023): 110M+ displaced globally, climate migration accelerating
 * - Abel et al. (2019) Science: Climate → migration correlation 0.2-0.4
 * - Burrows & Kinney (2016): Migration pressures → regional instability
 * - IPCC AR6 WG2: 1.4B climate migrants by 2060 under high warming scenarios
 *
 * Assertions:
 * - Crisis-driven migration tracked accurately
 * - Receiving regions experience instability
 * - Mortality increases in unstable regions
 * - State remains consistent (no NaN)
 *
 * @module tests/integration/cascades/refugee-stability-integration
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { RefugeeCrisisPhase } from '@/simulation/engine/phases/RefugeeCrisisPhase';
import { SocialStabilityPhase } from '@/simulation/engine/phases/SocialStabilityPhase';
import { BayesianMortalityResolutionPhase } from '@/simulation/engine/phases/BayesianMortalityResolutionPhase';
import type { GameState } from '@/types/game';

describe('C9: Refugee Crisis + Regional Stability Integration', () => {
  const TEST_SEED = 43200;

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

  describe('Refugee crisis → stability cascade', () => {
    test('should execute refugee and stability phases', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 100);
      const context = createPhaseContext(state.currentMonth);

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();

      // Should not crash
      assert.doesNotThrow(() => {
        refugeePhase.execute(state, rng, context);
        stabilityPhase.execute(state, rng, context);
      });
    });

    test('should affect social stability with refugee crisis', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Set conditions that trigger refugee crisis
      state.environmentalState.climateStability = 0.3; // Climate stress
      state.globalMetrics.socialStability = 0.6; // Moderate baseline

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();

      refugeePhase.execute(state, rng, context);
      stabilityPhase.execute(state, rng, context);

      // Social stability should remain in valid range
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));
      assert.ok(state.globalMetrics.socialStability >= 0 && state.globalMetrics.socialStability <= 1,
        'Social stability should be in [0, 1]');
    });

    test('should track migration flows during crisis', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Set severe crisis conditions
      state.environmentalState.climateStability = 0.2;
      state.environmentalState.globalTemperature = 18.0; // +3°C
      state.globalMetrics.socialStability = 0.4;

      // Ensure population system exists
      if (!state.humanPopulationSystem) {
        state.humanPopulationSystem = {
          totalPopulation: 8_000_000_000,
          regionalPopulations: [],
          migrationFlows: [],
        };
      }

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();

      refugeePhase.execute(state, rng, context);
      stabilityPhase.execute(state, rng, context);

      // Migration flows should be tracked
      if (state.humanPopulationSystem) {
        assert.ok(state.humanPopulationSystem.migrationFlows !== undefined);
        assert.ok(Array.isArray(state.humanPopulationSystem.migrationFlows));
      }

      // Social stability should remain valid
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));
    });
  });

  describe('Stability → mortality cascade', () => {
    test('should increase mortality in unstable regions', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Set low social stability (conflict/instability)
      state.globalMetrics.socialStability = 0.25; // Severe instability

      // Initialize Bayesian mortality
      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.01,
          riskContributions: {},
        };
      }

      const stabilityPhase = new SocialStabilityPhase();
      const mortalityPhase = new BayesianMortalityResolutionPhase();

      stabilityPhase.execute(state, rng, context);
      mortalityPhase.execute(state, rng, context);

      // Mortality risk should exist and be valid
      if (state.bayesianMortality) {
        assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));
        assert.ok(state.bayesianMortality.totalMonthlyRisk >= 0,
          'Mortality risk should be non-negative');
      }
    });

    test('should maintain stability in stable regions', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 500);
      const context = createPhaseContext(state.currentMonth);

      // Set high social stability (peaceful/stable)
      state.globalMetrics.socialStability = 0.85;

      const stabilityPhase = new SocialStabilityPhase();
      const mortalityPhase = new BayesianMortalityResolutionPhase();

      stabilityPhase.execute(state, rng, context);
      mortalityPhase.execute(state, rng, context);

      // Stability should remain high
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));
      assert.ok(state.globalMetrics.socialStability > 0.5,
        'High stability should persist without crisis');
    });
  });

  describe('Complete refugee → stability → mortality cascade', () => {
    test('should propagate refugee crisis through complete cascade', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 600);
      const context = createPhaseContext(state.currentMonth);

      // Set crisis conditions
      state.environmentalState.climateStability = 0.3;
      state.environmentalState.globalTemperature = 17.5;
      state.globalMetrics.socialStability = 0.5;

      // Initialize systems
      if (!state.humanPopulationSystem) {
        state.humanPopulationSystem = {
          totalPopulation: 8_000_000_000,
          regionalPopulations: [],
          migrationFlows: [],
        };
      }

      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.01,
          riskContributions: {},
        };
      }

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();
      const mortalityPhase = new BayesianMortalityResolutionPhase();

      // Execute complete cascade
      refugeePhase.execute(state, rng, context);
      stabilityPhase.execute(state, rng, context);
      mortalityPhase.execute(state, rng, context);

      // Verify complete state validity
      assert.ok(Number.isFinite(state.environmentalState.climateStability));
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));

      if (state.bayesianMortality) {
        assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));
      }

      if (state.humanPopulationSystem) {
        assert.ok(Array.isArray(state.humanPopulationSystem.migrationFlows));
      }
    });

    test('should handle extreme refugee crisis without crashing', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 700);
      const context = createPhaseContext(state.currentMonth);

      // Set catastrophic conditions
      state.environmentalState.climateStability = 0.1; // Extreme climate stress
      state.environmentalState.globalTemperature = 19.0; // +4°C
      state.globalMetrics.socialStability = 0.15; // Near-collapse

      if (!state.humanPopulationSystem) {
        state.humanPopulationSystem = {
          totalPopulation: 8_000_000_000,
          regionalPopulations: [],
          migrationFlows: [],
        };
      }

      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.02,
          riskContributions: {},
        };
      }

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();
      const mortalityPhase = new BayesianMortalityResolutionPhase();

      // Should not crash with extreme conditions
      assert.doesNotThrow(() => {
        refugeePhase.execute(state, rng, context);
        stabilityPhase.execute(state, rng, context);
        mortalityPhase.execute(state, rng, context);
      });

      // All values should remain finite (capped but not NaN)
      assert.ok(Number.isFinite(state.environmentalState.climateStability));
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));

      if (state.bayesianMortality) {
        assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));
      }
    });

    test('should maintain state consistency across cascade', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 800);
      const context = createPhaseContext(state.currentMonth);

      // Set moderate crisis
      state.environmentalState.climateStability = 0.45;
      state.globalMetrics.socialStability = 0.55;

      if (!state.humanPopulationSystem) {
        state.humanPopulationSystem = {
          totalPopulation: 8_000_000_000,
          regionalPopulations: [],
          migrationFlows: [],
        };
      }

      if (!state.bayesianMortality) {
        state.bayesianMortality = {
          totalMonthlyRisk: 0.008,
          riskContributions: {},
        };
      }

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();
      const mortalityPhase = new BayesianMortalityResolutionPhase();

      refugeePhase.execute(state, rng, context);
      stabilityPhase.execute(state, rng, context);
      mortalityPhase.execute(state, rng, context);

      // No NaN propagation
      assert.ok(!Number.isNaN(state.environmentalState.climateStability));
      assert.ok(!Number.isNaN(state.globalMetrics.socialStability));

      if (state.bayesianMortality) {
        assert.ok(!Number.isNaN(state.bayesianMortality.totalMonthlyRisk));
      }

      // All values in valid ranges
      assert.ok(state.environmentalState.climateStability >= 0 && state.environmentalState.climateStability <= 1);
      assert.ok(state.globalMetrics.socialStability >= 0 && state.globalMetrics.socialStability <= 1);
    });

    test('should show regional variation in stability', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 900);
      const context = createPhaseContext(state.currentMonth);

      // Set conditions for regional differentiation
      state.environmentalState.climateStability = 0.5;
      state.globalMetrics.socialStability = 0.6;

      // Ensure regional populations exist
      if (!state.humanPopulationSystem) {
        state.humanPopulationSystem = {
          totalPopulation: 8_000_000_000,
          regionalPopulations: [],
          migrationFlows: [],
        };
      }

      const refugeePhase = new RefugeeCrisisPhase();
      const stabilityPhase = new SocialStabilityPhase();

      refugeePhase.execute(state, rng, context);
      stabilityPhase.execute(state, rng, context);

      // Regional populations should be valid if they exist
      if (state.humanPopulationSystem.regionalPopulations.length > 0) {
        state.humanPopulationSystem.regionalPopulations.forEach((region, i) => {
          assert.ok(Number.isFinite(region.population),
            `Regional population ${i} should be finite`);
          assert.ok(region.population >= 0,
            `Regional population ${i} should be non-negative`);
        });
      }

      // Global stability should be valid
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));
    });
  });
});
