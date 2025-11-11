/**
 * Integration Tests: State Validation - Planetary Boundaries Phase
 *
 * Tests comprehensive state mutation assertions added in ARCH-CRITICAL-3 (WEEK 3 Priority #1).
 * Validates that PlanetaryBoundariesPhase fails loudly on invalid inputs and processes valid inputs correctly.
 *
 * CRITICAL: Regression test for Oct 2025 NaN bug (planetary boundaries NaN → silent fallback → hidden bugs)
 *
 * Test Categories:
 * 1. Fail-loudly behavior: NaN, Infinity, undefined inputs trigger assertion errors
 * 2. Valid input processing: Correct calculations with valid state
 * 3. Multi-phase integration: Climate → Planetary Boundaries → State consistency
 * 4. Oct 2025 NaN bug regression: Verify ?? 0.005 fallback pattern eliminated
 *
 * @module tests/integration/state-validation-planetary-boundaries
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import { PlanetaryBoundariesPhase } from '@/simulation/engine/phases/PlanetaryBoundariesPhase';
import type { GameState } from '@/types/game';

describe('PlanetaryBoundariesPhase: State Validation Integration', () => {
  const TEST_SEED = 42000;

  // Simple deterministic RNG for testing
  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  describe('Fail-Loudly Behavior: Invalid Inputs', () => {
    test('should throw on NaN climate stability input', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt state with NaN climate stability
      state.environmentalState.climateStability = NaN;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|climateStability/i
      );
    });

    test('should throw on Infinity biodiversity index', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt state with Infinity biodiversity
      state.environmentalState.biodiversityIndex = Infinity;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|biodiversityIndex/i
      );
    });

    test('should throw on undefined planetary boundaries system', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt state - remove planetary boundaries system
      (state as any).planetaryBoundariesSystem = undefined;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Undefined|planetaryBoundariesSystem/i
      );
    });

    test('should throw on out-of-range probability (climateStability > 1)', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt state with invalid probability
      state.environmentalState.climateStability = 1.5;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Out-of-range|probability/i
      );
    });

    test('should throw on negative biodiversity index', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt state with negative probability
      state.environmentalState.biodiversityIndex = -0.1;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Out-of-range|probability/i
      );
    });
  });

  describe('Valid Input Processing', () => {
    test('should successfully process valid initial state', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Should not throw
      const result = phase.execute(state, rng, { executedPhases: new Set() });

      assert.ok(result);
      assert.ok(result.events);
      assert.ok(Array.isArray(result.events));
    });

    test('should maintain all boundary values as finite numbers', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      phase.execute(state, rng, { executedPhases: new Set() });

      const boundaries = state.planetaryBoundariesSystem.boundaries;

      // All boundary values must be finite
      assert.strictEqual(Number.isFinite(boundaries.climate_change.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.biosphere_integrity.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.freshwater_use.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.biogeochemical_flows.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.ocean_acidification.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.land_use_change.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.novel_entities.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.atmospheric_aerosol.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.stratospheric_ozone.currentValue), true);
    });

    test('should process multiple consecutive steps without errors', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Run 12 consecutive steps (1 year)
      for (let i = 0; i < 12; i++) {
        assert.doesNotThrow(() => {
          phase.execute(state, rng, { executedPhases: new Set() });
        });
        state.currentMonth++;
      }

      // All boundaries should still have finite values
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      assert.strictEqual(Number.isFinite(boundaries.climate_change.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.biosphere_integrity.currentValue), true);
    });
  });

  describe('Oct 2025 NaN Bug Regression Test (CRITICAL)', () => {
    test('should NOT use silent fallback for NaN biosphere integrity', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt biodiversity index (feeds into biosphere integrity calculation)
      state.environmentalState.biodiversityIndex = NaN;

      // CRITICAL: This should THROW, not silently use ?? 0.005 fallback
      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|NaN/i
      );
    });

    test('should NOT use silent fallback for undefined climate data', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Remove climate stability (feeds into climate boundary calculation)
      (state.environmentalState as any).climateStability = undefined;

      // CRITICAL: This should THROW, not silently use fallback value
      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Undefined|climateStability/i
      );
    });

    test('should NOT mask calculation errors with defensive fallbacks', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Create conditions that would produce NaN in old code:
      // Division by zero in extinction rate calculations
      if (state.planetaryBoundariesSystem.landUse) {
        state.planetaryBoundariesSystem.landUse.globalExtinctionRate = NaN;
      }

      // Should throw instead of hiding the bug
      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite/i
      );
    });

    test('should validate all intermediate calculations, not just final outputs', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt water stress (intermediate calculation)
      state.freshwaterSystem.waterStress = NaN;

      // Should catch NaN in intermediate calculation, not just final boundary value
      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|waterStress/i
      );
    });

    test('should fail on aragonite saturation NaN (ocean acidification)', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Corrupt ocean acidification data
      state.oceanAcidificationSystem.aragoniteSaturation = NaN;

      // Should throw on NaN input
      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|aragoniteSaturation/i
      );
    });
  });

  describe('Multi-Phase Integration: Climate → Planetary Boundaries', () => {
    test('should maintain state consistency across climate and boundary updates', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Run full simulation for 1 year
      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Verify no NaN values in final state
      const boundaries = result.finalState.planetaryBoundariesSystem.boundaries;
      assert.strictEqual(Number.isFinite(boundaries.climate_change.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.biosphere_integrity.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.freshwater_use.currentValue), true);

      // Verify climate state is also valid
      assert.strictEqual(Number.isFinite(result.finalState.environmentalState.climateStability), true);
      assert.strictEqual(Number.isFinite(result.finalState.environmentalState.globalTemperature), true);

      console.log('✓ Climate → Planetary Boundaries integration validated');
    });

    test('should propagate climate changes to boundary values', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Record initial climate boundary
      const initialClimateBoundary = state.planetaryBoundariesSystem.boundaries.climate_change.currentValue;

      // Degrade climate stability
      state.environmentalState.climateStability = 0.3; // Significant degradation

      phase.execute(state, rng, { executedPhases: new Set() });

      // Climate boundary should reflect degradation
      const newClimateBoundary = state.planetaryBoundariesSystem.boundaries.climate_change.currentValue;
      assert.strictEqual(Number.isFinite(newClimateBoundary), true);
      assert.ok(newClimateBoundary >= initialClimateBoundary); // Higher value = worse (exceeded threshold)

      console.log('✓ Climate degradation propagated to boundaries');
    });

    test('should handle boundary cascades without NaN propagation', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Degrade multiple systems simultaneously
      state.environmentalState.climateStability = 0.2;
      state.environmentalState.biodiversityIndex = 0.3;
      state.freshwaterSystem.waterStress = 0.8;

      // Should handle multiple boundary exceedances without NaN
      assert.doesNotThrow(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      });

      // All boundaries should remain finite
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      assert.strictEqual(Number.isFinite(boundaries.climate_change.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.biosphere_integrity.currentValue), true);
      assert.strictEqual(Number.isFinite(boundaries.freshwater_use.currentValue), true);

      console.log('✓ Boundary cascades handled without NaN');
    });
  });

  describe('Tipping Point Risk Calculation Validation', () => {
    test('should calculate tipping point risk as probability [0,1]', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      phase.execute(state, rng, { executedPhases: new Set() });

      // Tipping point risk should be valid probability
      const risk = state.planetaryBoundariesSystem.tippingPointRisk;
      assert.strictEqual(Number.isFinite(risk), true);
      assert.ok(risk >= 0);
      assert.ok(risk <= 1);

      console.log('✓ Tipping point risk validation complete');
    });
  });
});
