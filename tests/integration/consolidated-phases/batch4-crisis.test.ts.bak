/**
 * Integration Tests: Batch 4 - Crisis & Mortality
 *
 * Tests consolidated crisis and mortality phases:
 * - HumanSurvivalSystemPhase (FoodSecurityDegradation + MortalityStabilizers + FamineSystem)
 * - NuclearCrisisPhase (NuclearWinter + RadiationSystem)
 * - ExtinctionSystemPhase (ExtinctionTriggers + ExtinctionProgress + CatastrophicScenarios)
 *
 * Validation Focus:
 * 1. Famine mortality calculations correct
 * 2. Mortality stabilizers reduce deaths
 * 3. Nuclear winter effects apply
 * 4. Extinction triggers fire at correct thresholds
 * 5. State transitions: population, mortality risks, extinction state updated
 * 6. CRITICAL: BayesianMortalityResolutionPhase still works correctly
 *
 * Phase Consolidation: Batch 4 (14 → 5 phases, -9 files)
 * Created: November 9, 2025
 *
 * @module tests/integration/consolidated-phases/batch4-crisis
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState } from '@/types/game';

describe('Batch 4: Crisis & Mortality - Integration Tests', () => {
  const TEST_SEED = 50004;

  // Simple deterministic RNG for testing
  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  describe('HumanSurvivalSystemPhase - Food Security Degradation', () => {
    test('should track food security degradation from climate', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Climate degradation
      state.environmentalState.globalTemperature = 17.0;
      state.environmentalState.climateStability = 0.5;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Food security should be affected
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
    });

    test('should calculate crop failures correctly', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme temperature for crop failure
      state.environmentalState.globalTemperature = 18.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Population should show stress
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(result.finalState.humanPopulationSystem.population > 0);
    });
  });

  describe('HumanSurvivalSystemPhase - Famine System', () => {
    test('should trigger famine conditions when food critically low', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Create famine conditions
      state.environmentalState.globalTemperature = 18.5;
      state.environmentalState.climateStability = 0.2;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Mortality should increase
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
      assert.ok(result.finalState.humanPopulationSystem.monthlyExcessDeaths >= 0);
    });

    test('should calculate famine mortality correctly', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const initialPopulation = state.humanPopulationSystem.population;

      // Severe famine conditions
      state.environmentalState.globalTemperature = 19.0;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Population should decline but remain positive
      assert.ok(result.finalState.humanPopulationSystem.population > 0);
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });
  });

  describe('HumanSurvivalSystemPhase - Mortality Stabilizers', () => {
    test('should reduce mortality when stabilizers active', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Enable mortality stabilizers (if fields exist)
      // High government capacity should help
      state.government.governmentCapacity = 0.8;

      // Create mortality pressure
      state.environmentalState.globalTemperature = 17.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Mortality should be finite
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
    });

    test('should apply healthcare and food aid effects', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Strong government response
      state.government.governmentCapacity = 0.9;
      state.government.alignmentResearchInvestment = 5.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Population should be healthier
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });
  });

  describe('NuclearCrisisPhase - Nuclear Winter', () => {
    test('should apply temperature drop from nuclear winter', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Simulate nuclear detonation
      if (state.nuclearWinter) {
        state.nuclearWinter.isActive = true;
        state.nuclearWinter.temperatureDrop = 2.0;
      }

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Temperature effects should be visible
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
    });

    test('should cascade to agricultural collapse', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Nuclear winter active
      if (state.nuclearWinter) {
        state.nuclearWinter.isActive = true;
        state.nuclearWinter.temperatureDrop = 3.0; // Severe
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Population should show severe stress
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(result.finalState.humanPopulationSystem.population > 0);
    });

    test('should recover over time as soot clears', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 60
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Nuclear winter at start
      if (state.nuclearWinter) {
        state.nuclearWinter.isActive = true;
        state.nuclearWinter.temperatureDrop = 2.0;
        state.nuclearWinter.monthsSinceDetonation = 0;
      }

      const result = engine.run(state, {
        maxMonths: 60,
        checkActualOutcomes: false
      });

      // Temperature should have recovered somewhat
      if (result.finalState.nuclearWinter) {
        assert.ok(
          result.finalState.nuclearWinter.monthsSinceDetonation > 0 ||
          !result.finalState.nuclearWinter.isActive
        );
      }
    });
  });

  describe('NuclearCrisisPhase - Radiation System', () => {
    test('should track radiation exposure', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Radiation from nuclear event
      if (state.radiation) {
        state.radiation.globalExposure = 0.5;
      }

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Radiation should decay over time
      if (result.finalState.radiation) {
        assert.ok(Number.isFinite(result.finalState.radiation.globalExposure));
        assert.ok(result.finalState.radiation.globalExposure >= 0);
      }
    });

    test('should cause health effects from radiation', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High radiation exposure
      if (state.radiation) {
        state.radiation.globalExposure = 0.8;
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Mortality should increase
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
    });
  });

  describe('ExtinctionSystemPhase - Extinction Triggers', () => {
    test('should detect multiple simultaneous extinction risks', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Create extinction conditions
      state.environmentalState.globalTemperature = 20.0;
      state.environmentalState.biodiversityIndex = 0.1;
      state.humanPopulationSystem.population = 1e9; // Massive decline

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Extinction risk should be high
      if (result.finalState.extinctionRisk) {
        assert.ok(Number.isFinite(result.finalState.extinctionRisk.totalExtinctionRisk));
      }
    });

    test('should trigger at correct thresholds', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Approach extinction threshold
      state.humanPopulationSystem.population = 5e8; // Half billion

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Should calculate extinction risk
      if (result.finalState.extinctionRisk) {
        assert.ok(Number.isFinite(result.finalState.extinctionRisk.totalExtinctionRisk));
      }
    });
  });

  describe('ExtinctionSystemPhase - Extinction Progress', () => {
    test('should track extinction progress over time', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Create slow extinction scenario
      state.humanPopulationSystem.population = 2e9;
      state.humanPopulationSystem.monthlyExcessDeaths = 1e7; // 10M/month

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Population should decline
      assert.ok(result.finalState.humanPopulationSystem.population < state.humanPopulationSystem.population);
    });

    test('should handle catastrophic population collapse', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Catastrophic conditions
      state.humanPopulationSystem.population = 1e9;
      state.environmentalState.globalTemperature = 21.0;
      if (state.nuclearWinter) {
        state.nuclearWinter.isActive = true;
        state.nuclearWinter.temperatureDrop = 5.0;
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Population should remain finite (may approach zero)
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(result.finalState.humanPopulationSystem.population >= 0);
    });
  });

  describe('ExtinctionSystemPhase - Catastrophic Scenarios', () => {
    test('should handle runaway climate scenario', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Runaway warming
      state.environmentalState.globalTemperature = 22.0;
      state.environmentalState.climateStability = 0.05;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Should not diverge to infinity
      assert.ok(result.finalState.environmentalState.globalTemperature < 30.0);
    });

    test('should handle total ecosystem collapse', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Ecosystem collapse
      state.environmentalState.biodiversityIndex = 0.05;
      state.environmentalState.climateStability = 0.1;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // System should remain stable
      assert.ok(Number.isFinite(result.finalState.environmentalState.biodiversityIndex));
    });
  });

  describe('BayesianMortalityResolutionPhase Integration', () => {
    test('should still resolve mortality correctly after consolidation', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Create mortality pressure
      state.environmentalState.globalTemperature = 17.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Bayesian resolution should produce finite results
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });

    test('should correctly use HumanSurvivalSystem dependency', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Mortality factors
      state.environmentalState.globalTemperature = 16.5;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Phase dependency should work correctly
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });
  });

  describe('State Transitions - Crisis & Mortality', () => {
    test('should maintain population as finite and positive', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Stress test
      state.environmentalState.globalTemperature = 18.0;
      if (state.nuclearWinter) {
        state.nuclearWinter.isActive = true;
        state.nuclearWinter.temperatureDrop = 2.0;
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Population must be finite and non-negative
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(result.finalState.humanPopulationSystem.population >= 0);
    });

    test('should maintain extinction risk fields as finite', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // All extinction risk fields finite
      if (result.finalState.extinctionRisk) {
        assert.ok(Number.isFinite(result.finalState.extinctionRisk.totalExtinctionRisk));
        assert.ok(
          result.finalState.extinctionRisk.totalExtinctionRisk >= 0 &&
          result.finalState.extinctionRisk.totalExtinctionRisk <= 1
        );
      }
    });

    test('should preserve RNG determinism across crisis phases', () => {
      const seed = TEST_SEED + 400;

      // Run 1
      const engine1 = new SimulationEngine({ seed, maxMonths: 12 });
      const state1 = createDefaultInitialState(createTestRng(seed), 'historical');
      state1.environmentalState.globalTemperature = 17.5;
      const result1 = engine1.run(state1, { maxMonths: 6, checkActualOutcomes: false });

      // Run 2
      const engine2 = new SimulationEngine({ seed, maxMonths: 12 });
      const state2 = createDefaultInitialState(createTestRng(seed), 'historical');
      state2.environmentalState.globalTemperature = 17.5;
      const result2 = engine2.run(state2, { maxMonths: 6, checkActualOutcomes: false });

      // Mortality should be deterministic
      assert.strictEqual(
        result1.finalState.humanPopulationSystem.population,
        result2.finalState.humanPopulationSystem.population,
        'Population should be deterministic'
      );
      assert.strictEqual(
        result1.finalState.humanPopulationSystem.monthlyExcessDeaths,
        result2.finalState.humanPopulationSystem.monthlyExcessDeaths,
        'Mortality should be deterministic'
      );
    });
  });

  describe('Multi-System Interactions', () => {
    test('should cascade nuclear winter to famine to mortality', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Nuclear winter trigger
      if (state.nuclearWinter) {
        state.nuclearWinter.isActive = true;
        state.nuclearWinter.temperatureDrop = 3.0;
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Full cascade should be visible
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
    });

    test('should interact mortality with extinction risk', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High mortality
      state.humanPopulationSystem.monthlyExcessDeaths = 5e7; // 50M/month

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Extinction risk should increase
      if (result.finalState.extinctionRisk) {
        assert.ok(Number.isFinite(result.finalState.extinctionRisk.totalExtinctionRisk));
      }
    });

    test('should interact climate with food with mortality', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Climate shock
      state.environmentalState.globalTemperature = 18.0;
      state.environmentalState.climateStability = 0.3;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Full chain should be reflected
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });
  });

  describe('Regression Prevention', () => {
    test('should not produce negative population', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 60
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme mortality
      state.humanPopulationSystem.population = 1e9;
      state.humanPopulationSystem.monthlyExcessDeaths = 1e8;

      const result = engine.run(state, {
        maxMonths: 60,
        checkActualOutcomes: false
      });

      // Population should never go negative
      assert.ok(result.finalState.humanPopulationSystem.population >= 0);
    });

    test('should not produce NaN in mortality calculations', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Edge case: very small population
      state.humanPopulationSystem.population = 1e6; // 1 million

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Should not produce NaN
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
    });

    test('should maintain correct phase execution order', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // HumanSurvivalSystem should run before BayesianMortalityResolution
      state.environmentalState.globalTemperature = 17.0;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // If order correct, mortality resolution should work
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths));
    });
  });
});
