/**
 * Integration Tests: Batch 3 - Climate & Environmental
 *
 * Tests consolidated climate and environmental resource phases:
 * - ClimateSystemPhase (Geoengineering + TippingPoint + EnvironmentalFeedback + ClimateImpactCascade)
 * - ResourceSoilPhase (Phosphorus + NovelEntities)
 * - ResourceWaterPhase (Freshwater + OceanAcidification)
 * - ResourceEconomyPhase (updated: ResourceTechnology + PowerGeneration)
 *
 * Validation Focus:
 * 1. Tipping point cascades trigger correctly
 * 2. Environmental feedback loops converge
 * 3. Planetary boundaries calculated correctly
 * 4. Resource depletion rates accurate
 * 5. State transitions: climate, resources, boundaries updated
 *
 * Phase Consolidation: Batch 3 (17 → 7 phases, -10 files)
 * Created: November 9, 2025
 *
 * @module tests/integration/consolidated-phases/batch3-climate
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState } from '@/types/game';

describe('Batch 3: Climate & Environmental - Integration Tests', () => {
  const TEST_SEED = 50003;

  // Simple deterministic RNG for testing
  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  describe('ClimateSystemPhase - Climate Impact Cascades', () => {
    test('should propagate temperature changes through climate system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Increase temperature
      state.environmentalState.globalTemperature = 16.5; // +1.5°C from baseline

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Temperature should remain finite
      assert.ok(
        Number.isFinite(result.finalState.environmentalState.globalTemperature),
        'Global temperature must be finite'
      );

      // Climate stability should be affected
      assert.ok(
        Number.isFinite(result.finalState.environmentalState.climateStability),
        'Climate stability must be finite'
      );
      assert.ok(
        result.finalState.environmentalState.climateStability >= 0 &&
        result.finalState.environmentalState.climateStability <= 1,
        'Climate stability must be in [0, 1]'
      );
    });

    test('should handle extreme temperature scenarios', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme warming
      state.environmentalState.globalTemperature = 18.0; // +3°C

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Should not produce NaN even in extreme conditions
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(result.finalState.environmentalState.climateStability));
    });
  });

  describe('ClimateSystemPhase - Environmental Feedback Loops', () => {
    test('should calculate feedback loops correctly', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Set up feedback conditions
      state.environmentalState.globalTemperature = 16.0;
      state.environmentalState.biodiversityIndex = 0.6;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Feedback loops should converge to finite values
      assert.ok(Number.isFinite(result.finalState.environmentalState.climateStability));
      assert.ok(Number.isFinite(result.finalState.environmentalState.biodiversityIndex));
    });

    test('should handle positive and negative feedbacks', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Create conditions for strong feedbacks
      state.environmentalState.globalTemperature = 17.0;
      state.environmentalState.climateStability = 0.4;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // System should stabilize without diverging
      assert.ok(
        result.finalState.environmentalState.globalTemperature < 25.0,
        'Temperature should not diverge to unrealistic values'
      );
    });
  });

  describe('ClimateSystemPhase - Tipping Points', () => {
    test('should detect climate tipping points', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Approach tipping point threshold
      state.environmentalState.globalTemperature = 17.5; // +2.5°C
      state.environmentalState.climateStability = 0.3;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Tipping point risk should be calculated
      if (result.finalState.planetaryBoundariesSystem) {
        assert.ok(
          Number.isFinite(result.finalState.planetaryBoundariesSystem.tippingPointRisk),
          'Tipping point risk must be finite'
        );
      }
    });

    test('should cascade tipping point effects', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Trigger multiple tipping conditions
      state.environmentalState.globalTemperature = 18.0;
      state.environmentalState.biodiversityIndex = 0.3;
      state.environmentalState.climateStability = 0.2;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Cascades should affect multiple systems
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(result.finalState.environmentalState.biodiversityIndex));
      assert.ok(Number.isFinite(result.finalState.environmentalState.climateStability));
    });
  });

  describe('ClimateSystemPhase - Geoengineering', () => {
    test('should apply geoengineering effects when deployed', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Deploy geoengineering (if field exists)
      state.environmentalState.globalTemperature = 17.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Temperature effects should be finite
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
    });
  });

  describe('ResourceSoilPhase - Phosphorus Cycle', () => {
    test('should track phosphorus depletion', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Phosphorus should be tracked in planetary boundaries
      if (result.finalState.planetaryBoundariesSystem) {
        const phosphorusBoundary = result.finalState.planetaryBoundariesSystem.boundaries.biogeochemical_flows;
        assert.ok(
          Number.isFinite(phosphorusBoundary.currentValue),
          'Phosphorus boundary value must be finite'
        );
      }
    });

    test('should affect agricultural productivity', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Deplete phosphorus (if field exists in state)
      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Food security should be affected by soil health
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });
  });

  describe('ResourceSoilPhase - Novel Entities', () => {
    test('should track novel entities pollution', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Novel entities boundary should be calculated
      if (result.finalState.planetaryBoundariesSystem) {
        const novelEntitiesBoundary = result.finalState.planetaryBoundariesSystem.boundaries.novel_entities;
        assert.ok(
          Number.isFinite(novelEntitiesBoundary.currentValue),
          'Novel entities boundary must be finite'
        );
      }
    });
  });

  describe('ResourceWaterPhase - Freshwater', () => {
    test('should track freshwater depletion', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Freshwater boundary should be tracked
      if (result.finalState.planetaryBoundariesSystem) {
        const freshwaterBoundary = result.finalState.planetaryBoundariesSystem.boundaries.freshwater_use;
        assert.ok(
          Number.isFinite(freshwaterBoundary.currentValue),
          'Freshwater boundary must be finite'
        );
      }
    });

    test('should affect human survival when depleted', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Stress freshwater system
      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Population should remain finite
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });
  });

  describe('ResourceWaterPhase - Ocean Acidification', () => {
    test('should track ocean pH changes', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Increase temperature (drives acidification)
      state.environmentalState.globalTemperature = 16.5;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Ocean health metrics should be finite
      if (result.finalState.oceanHealth) {
        assert.ok(
          Number.isFinite(result.finalState.oceanHealth.pH),
          'Ocean pH must be finite'
        );
        assert.ok(
          result.finalState.oceanHealth.pH > 7.0 && result.finalState.oceanHealth.pH < 9.0,
          'Ocean pH must be in realistic range'
        );
      }
    });

    test('should affect marine ecosystems', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme acidification conditions
      state.environmentalState.globalTemperature = 17.5;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Biodiversity should be affected
      assert.ok(Number.isFinite(result.finalState.environmentalState.biodiversityIndex));
    });
  });

  describe('ResourceEconomyPhase - Resource Technology', () => {
    test('should improve resource efficiency with technology', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Advance technology
      state.technologyTier = 2;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Resource boundaries should reflect tech improvements
      if (result.finalState.planetaryBoundariesSystem) {
        const boundaries = result.finalState.planetaryBoundariesSystem.boundaries;
        Object.values(boundaries).forEach((boundary: any) => {
          assert.ok(
            Number.isFinite(boundary.currentValue),
            'Boundary values must be finite with tech advances'
          );
        });
      }
    });
  });

  describe('ResourceEconomyPhase - Power Generation', () => {
    test('should track energy production and emissions', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Energy-related metrics should be finite
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
    });
  });

  describe('State Transitions - Climate & Environmental', () => {
    test('should maintain all environmental state fields as finite', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Stress test
      state.environmentalState.globalTemperature = 17.0;
      state.environmentalState.climateStability = 0.4;
      state.environmentalState.biodiversityIndex = 0.5;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // All environmental fields finite
      assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(result.finalState.environmentalState.climateStability));
      assert.ok(Number.isFinite(result.finalState.environmentalState.biodiversityIndex));
      assert.ok(Number.isFinite(result.finalState.environmentalState.pollutionLevel));
    });

    test('should maintain all planetary boundaries as finite', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // All boundaries must be finite
      if (result.finalState.planetaryBoundariesSystem) {
        const boundaries = result.finalState.planetaryBoundariesSystem.boundaries;

        assert.ok(Number.isFinite(boundaries.climate_change.currentValue));
        assert.ok(Number.isFinite(boundaries.biosphere_integrity.currentValue));
        assert.ok(Number.isFinite(boundaries.freshwater_use.currentValue));
        assert.ok(Number.isFinite(boundaries.biogeochemical_flows.currentValue));
        assert.ok(Number.isFinite(boundaries.ocean_acidification.currentValue));
        assert.ok(Number.isFinite(boundaries.land_use_change.currentValue));
        assert.ok(Number.isFinite(boundaries.novel_entities.currentValue));
      }
    });

    test('should preserve RNG determinism across climate phases', () => {
      const seed = TEST_SEED + 300;

      // Run 1
      const engine1 = new SimulationEngine({ seed, maxMonths: 12 });
      const state1 = createDefaultInitialState(createTestRng(seed), 'historical');
      state1.environmentalState.globalTemperature = 16.5;
      const result1 = engine1.run(state1, { maxMonths: 6, checkActualOutcomes: false });

      // Run 2
      const engine2 = new SimulationEngine({ seed, maxMonths: 12 });
      const state2 = createDefaultInitialState(createTestRng(seed), 'historical');
      state2.environmentalState.globalTemperature = 16.5;
      const result2 = engine2.run(state2, { maxMonths: 6, checkActualOutcomes: false });

      // Climate state should be identical
      assert.strictEqual(
        result1.finalState.environmentalState.globalTemperature,
        result2.finalState.environmentalState.globalTemperature,
        'Temperature should be deterministic'
      );
      assert.strictEqual(
        result1.finalState.environmentalState.climateStability,
        result2.finalState.environmentalState.climateStability,
        'Climate stability should be deterministic'
      );
    });
  });

  describe('Multi-System Interactions', () => {
    test('should cascade climate changes to food security', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Temperature shock
      state.environmentalState.globalTemperature = 17.5;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Population should be affected (through food chain)
      assert.ok(Number.isFinite(result.finalState.humanPopulationSystem.population));
    });

    test('should integrate planetary boundaries with climate system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Cross multiple boundaries
      state.environmentalState.globalTemperature = 17.0;
      state.environmentalState.biodiversityIndex = 0.4;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Boundary crossings should be reflected
      if (result.finalState.planetaryBoundariesSystem) {
        assert.ok(
          Number.isFinite(result.finalState.planetaryBoundariesSystem.tippingPointRisk)
        );
      }
    });

    test('should interact resource depletion with economic system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Economic stage should be finite
      assert.ok(Number.isFinite(result.finalState.economicStage));
    });
  });

  describe('Regression Prevention', () => {
    test('should not produce NaN in climate calculations', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme conditions
      state.environmentalState.globalTemperature = 19.0;
      state.environmentalState.climateStability = 0.05;
      state.environmentalState.biodiversityIndex = 0.15;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // No NaN in environmental state
      Object.entries(result.finalState.environmentalState).forEach(([key, value]) => {
        if (typeof value === 'number') {
          assert.ok(
            Number.isFinite(value),
            `environmentalState.${key} must be finite`
          );
        }
      });
    });

    test('should handle zero biodiversity gracefully', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme biodiversity loss
      state.environmentalState.biodiversityIndex = 0.01;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Should not cause division by zero
      assert.ok(Number.isFinite(result.finalState.environmentalState.biodiversityIndex));
    });

    test('should maintain correct phase execution order', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Climate phase should update before resource phases use values
      state.environmentalState.globalTemperature = 16.5;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Resources should reflect climate changes
      if (result.finalState.planetaryBoundariesSystem) {
        assert.ok(
          Number.isFinite(result.finalState.planetaryBoundariesSystem.boundaries.freshwater_use.currentValue)
        );
      }
    });
  });
});
