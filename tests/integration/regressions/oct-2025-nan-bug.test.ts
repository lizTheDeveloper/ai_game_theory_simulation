/**
 * Integration Test: Oct 2025 NaN Bug Regression Prevention
 *
 * Path: Ecology → Planetary Boundaries → QoL
 * Priority: CRITICAL
 *
 * Root Cause: Silent `?? fallback` pattern masked NaN propagation for months.
 * Example: `const value = state.ecology.biodiversity ?? 0.005;`
 *
 * This test ensures phases FAIL LOUDLY when encountering NaN instead of
 * silently using fallback values that hide bugs.
 *
 * Research Context:
 * - Ecology metrics must fail-fast to prevent cascade corruption
 * - Silent fallbacks violate research simulation rigor
 * - NaN detection is critical for Monte Carlo validity
 *
 * @module tests/integration/regressions/oct-2025-nan-bug
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDeterministicRng } from '@/simulation/utils/deterministicRng';
import { PlanetaryBoundariesPhase } from '@/simulation/engine/phases/PlanetaryBoundariesPhase';
import type { GameState } from '@/types/game';

describe('Oct 2025 NaN Bug Regression', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Create minimal valid state for testing planetary boundaries
   */
  function createMinimalState(): GameState {
    return {
      currentMonth: 0,
      currentYear: 0,
      initialPopulation: 8.0,
      population: 8.0,
      environmentalState: {
        climateStability: 0.7,
        biodiversityIndex: 0.65,
        globalTemperature: 15.0,
        atmosphericCO2: 420,
        renewableEnergyPercentage: 0.15,
        deforestationRate: 0.01,
        oceanAcidification: 0.2
      },
      planetaryBoundariesSystem: {
        boundaries: {
          climate_change: {
            name: 'Climate Change',
            currentValue: 0.7,
            threshold: 1.0,
            status: 'safe',
            severity: 0
          },
          biosphere_integrity: {
            name: 'Biosphere Integrity',
            currentValue: 0.65,
            threshold: 0.9,
            status: 'safe',
            severity: 0
          },
          freshwater_use: {
            name: 'Freshwater Use',
            currentValue: 0.5,
            threshold: 0.8,
            status: 'safe',
            severity: 0
          },
          biogeochemical_flows: {
            name: 'Biogeochemical Flows',
            currentValue: 0.6,
            threshold: 0.8,
            status: 'safe',
            severity: 0
          },
          ocean_acidification: {
            name: 'Ocean Acidification',
            currentValue: 0.2,
            threshold: 0.5,
            status: 'safe',
            severity: 0
          },
          land_use_change: {
            name: 'Land System Change',
            currentValue: 0.4,
            threshold: 0.75,
            status: 'safe',
            severity: 0
          },
          novel_entities: {
            name: 'Novel Entities',
            currentValue: 0.3,
            threshold: 0.7,
            status: 'safe',
            severity: 0
          }
        },
        overallRisk: 0.3,
        tippingPointRisk: 0.1,
        boundariesExceeded: 0
      }
    } as GameState;
  }

  describe('Fail-Loudly: NaN Detection', () => {
    test('should throw on NaN biodiversity input', () => {
      const state = createMinimalState();
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Inject NaN into ecology state
      state.environmentalState.biodiversityIndex = NaN;

      // Must throw, not fallback to 0.005 or any other default
      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|biodiversity/i,
        'Phase must reject NaN biodiversity, not use silent fallback'
      );
    });

    test('should throw on NaN climate stability input', () => {
      const state = createMinimalState();
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Inject NaN into climate state
      state.environmentalState.climateStability = NaN;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|climate/i,
        'Phase must reject NaN climate stability, not use silent fallback'
      );
    });

    test('should throw on Infinity temperature input', () => {
      const state = createMinimalState();
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Inject Infinity
      state.environmentalState.globalTemperature = Infinity;

      assert.throws(
        () => phase.execute(state, rng, { executedPhases: new Set() }),
        /Non-finite|temperature/i,
        'Phase must reject Infinity temperature'
      );
    });
  });

  describe('Valid Input Processing', () => {
    test('should process valid state without errors', () => {
      const state = createMinimalState();
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // Should not throw
      assert.doesNotThrow(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }, 'Phase should handle valid state without errors');

      // Verify outputs are finite
      assert.ok(Number.isFinite(state.planetaryBoundariesSystem.overallRisk));
      assert.ok(Number.isFinite(state.planetaryBoundariesSystem.tippingPointRisk));
    });

    test('should maintain all boundary values as finite', () => {
      const state = createMinimalState();
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      phase.execute(state, rng, { executedPhases: new Set() });

      const boundaries = state.planetaryBoundariesSystem.boundaries;

      // All boundaries must remain finite (no NaN propagation)
      assert.ok(Number.isFinite(boundaries.climate_change.currentValue));
      assert.ok(Number.isFinite(boundaries.biosphere_integrity.currentValue));
      assert.ok(Number.isFinite(boundaries.freshwater_use.currentValue));
      assert.ok(Number.isFinite(boundaries.biogeochemical_flows.currentValue));
      assert.ok(Number.isFinite(boundaries.ocean_acidification.currentValue));
      assert.ok(Number.isFinite(boundaries.land_use_change.currentValue));
      assert.ok(Number.isFinite(boundaries.novel_entities.currentValue));
    });
  });

  describe('Anti-Pattern Detection', () => {
    test('should not use defensive fallbacks in calculations', () => {
      // This test verifies that the code does NOT contain patterns like:
      // const value = state.ecology.biodiversity ?? 0.005;
      //
      // Instead, it should use assertion utilities:
      // const value = assertFinite(state.ecology.biodiversity, {...});
      //
      // This is verified by the fact that NaN inputs throw errors (tested above)
      // rather than being silently replaced with fallback values.

      const state = createMinimalState();
      const rng = createTestRng(TEST_SEED);
      const phase = new PlanetaryBoundariesPhase();

      // If defensive fallbacks existed, this would pass silently
      state.environmentalState.biodiversityIndex = NaN;

      // But we expect it to throw
      let didThrow = false;
      try {
        phase.execute(state, rng, { executedPhases: new Set() });
      } catch (e) {
        didThrow = true;
      }

      assert.ok(didThrow, 'Code must fail loudly, not use silent fallbacks');
    });
  });
});
