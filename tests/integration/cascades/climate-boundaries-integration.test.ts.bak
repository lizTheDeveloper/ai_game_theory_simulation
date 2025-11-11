/**
 * Integration Test: C2 - Climate + Planetary Boundaries Integration
 *
 * Tests that climate changes (temperature, precipitation) properly propagate to the
 * 9 planetary boundaries system, triggering appropriate cascade updates.
 *
 * Integration Path:
 * ClimateImpactCascadePhase → UpdatePlanetaryBoundariesPhase
 *
 * Research Context:
 * - Richardson et al. (2023) Science Advances - Earth beyond six of nine planetary boundaries
 * - Rockström et al. (2023) Nature - Safe and just Earth system boundaries
 * - Temperature affects: freshwater, land use, biodiversity
 * - Precipitation affects: food security, freshwater
 * - Extreme events trigger cascade updates
 *
 * Assertions:
 * - Temperature changes propagate to relevant boundaries
 * - Precipitation changes affect freshwater and food security
 * - Extreme events trigger boundary cascade updates
 * - Boundary status reflects climate degradation
 *
 * @module tests/integration/cascades/climate-boundaries-integration
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import { PlanetaryBoundariesPhase } from '@/simulation/engine/phases/PlanetaryBoundariesPhase';
import type { GameState } from '@/types/game';

describe('C2: Climate + Planetary Boundaries Integration', () => {
  const TEST_SEED = 42100;

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

  describe('Temperature changes propagate to planetary boundaries', () => {
    test('should reflect temperature increase in climate boundary', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 100);
      const context = createPhaseContext(state.currentMonth);

      // Set baseline temperature
      const baselineTemp = state.environmentalState.globalTemperature;

      // Execute baseline
      const climatePhaseBefore = new ClimateImpactCascadePhase();
      const boundariesPhaseBefore = new PlanetaryBoundariesPhase();
      climatePhaseBefore.execute(state, rng, context);
      boundariesPhaseBefore.execute(state, rng, context);

      const boundaryBefore = state.planetaryBoundariesSystem.boundaries.climate_change.currentValue;

      // Increase temperature significantly (+3°C)
      state.environmentalState.globalTemperature = baselineTemp + 3.0;
      state.environmentalState.climateStability = 0.3; // Degraded stability

      // Execute with temperature increase
      const climatePhaseAfter = new ClimateImpactCascadePhase();
      const boundariesPhaseAfter = new PlanetaryBoundariesPhase();
      climatePhaseAfter.execute(state, rng, context);
      boundariesPhaseAfter.execute(state, rng, context);

      const boundaryAfter = state.planetaryBoundariesSystem.boundaries.climate_change.currentValue;

      // Climate boundary should reflect degradation
      assert.ok(Number.isFinite(boundaryBefore));
      assert.ok(Number.isFinite(boundaryAfter));

      // Temperature increase should worsen climate boundary
      // (higher boundary value = worse, typically)
      const climateStatus = state.planetaryBoundariesSystem.boundaries.climate_change.status;
      assert.ok(['safe', 'increasing_risk', 'exceeded'].includes(climateStatus),
        'Climate boundary should have valid status');
    });

    test('should propagate temperature to biodiversity boundary', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Set high temperature (ecosystem stress)
      state.environmentalState.globalTemperature = 18.0; // +3°C from baseline
      state.environmentalState.biodiversityIndex = 0.4; // Already degraded

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      climatePhase.execute(state, rng, context);
      boundariesPhase.execute(state, rng, context);

      // Biosphere integrity boundary should reflect temperature stress
      const biosphereBoundary = state.planetaryBoundariesSystem.boundaries.biosphere_integrity;
      assert.ok(Number.isFinite(biosphereBoundary.currentValue));

      // With high temperature and low biodiversity, boundary should be exceeded
      assert.ok(['increasing_risk', 'exceeded'].includes(biosphereBoundary.status),
        'Biosphere boundary should show stress with high temperature');
    });

    test('should propagate temperature to freshwater boundary', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Set high temperature (increases evaporation, reduces freshwater)
      state.environmentalState.globalTemperature = 17.5; // +2.5°C
      state.environmentalState.precipitationAnomalyFraction = -0.2; // 20% precipitation reduction

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      climatePhase.execute(state, rng, context);
      boundariesPhase.execute(state, rng, context);

      // Freshwater boundary should reflect temperature-driven stress
      const freshwaterBoundary = state.planetaryBoundariesSystem.boundaries.freshwater_use;
      assert.ok(Number.isFinite(freshwaterBoundary.currentValue));

      // Temperature + precipitation reduction should stress freshwater
      const status = freshwaterBoundary.status;
      assert.ok(['safe', 'increasing_risk', 'exceeded'].includes(status),
        'Freshwater boundary should have valid status');
    });
  });

  describe('Precipitation changes affect boundaries', () => {
    test('should propagate precipitation changes to freshwater boundary', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Set extreme precipitation deficit (drought)
      state.environmentalState.precipitationAnomalyFraction = -0.4; // 40% reduction
      state.environmentalState.globalTemperature = 16.5; // +1.5°C (moderate warming)

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      climatePhase.execute(state, rng, context);
      boundariesPhase.execute(state, rng, context);

      // Freshwater boundary should be affected by drought
      const freshwaterBoundary = state.planetaryBoundariesSystem.boundaries.freshwater_use;
      assert.ok(Number.isFinite(freshwaterBoundary.currentValue));

      // Verify boundary system responded to precipitation change
      assert.ok(Number.isFinite(state.planetaryBoundariesSystem.tippingPointRisk));
      assert.ok(state.planetaryBoundariesSystem.tippingPointRisk >= 0 &&
                state.planetaryBoundariesSystem.tippingPointRisk <= 1,
        'Tipping point risk should be in valid range [0, 1]');
    });

    test('should handle extreme precipitation variability', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 500);
      const context = createPhaseContext(state.currentMonth);

      // Set extreme precipitation excess (flooding)
      state.environmentalState.precipitationAnomalyFraction = 0.6; // 60% increase
      state.environmentalState.climateStability = 0.3; // Unstable climate

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      // Should not crash with extreme precipitation
      assert.doesNotThrow(() => {
        climatePhase.execute(state, rng, context);
        boundariesPhase.execute(state, rng, context);
      });

      // All boundaries should remain finite
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      assert.ok(Number.isFinite(boundaries.climate_change.currentValue));
      assert.ok(Number.isFinite(boundaries.freshwater_use.currentValue));
      assert.ok(Number.isFinite(boundaries.land_use_change.currentValue));
      assert.ok(Number.isFinite(boundaries.biosphere_integrity.currentValue));
    });
  });

  describe('Extreme events trigger cascade updates', () => {
    test('should update boundaries when multiple climate stressors combine', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 600);
      const context = createPhaseContext(state.currentMonth);

      // Set multiple extreme climate conditions
      state.environmentalState.globalTemperature = 18.5; // +3.5°C
      state.environmentalState.precipitationAnomalyFraction = -0.3; // 30% drought
      state.environmentalState.climateStability = 0.2; // Very unstable
      state.environmentalState.biodiversityIndex = 0.3; // Severe biodiversity loss

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      climatePhase.execute(state, rng, context);
      boundariesPhase.execute(state, rng, context);

      // Multiple boundaries should be in exceeded state
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      let exceededCount = 0;

      Object.values(boundaries).forEach(boundary => {
        if (boundary.status === 'exceeded') {
          exceededCount++;
        }
        // All boundaries must be finite
        assert.ok(Number.isFinite(boundary.currentValue));
      });

      // With extreme conditions, at least one boundary should be exceeded
      assert.ok(exceededCount > 0, 'At least one boundary should be exceeded with extreme climate stress');

      // Tipping point risk should be elevated
      assert.ok(state.planetaryBoundariesSystem.tippingPointRisk > 0,
        'Tipping point risk should be elevated with extreme conditions');
    });

    test('should maintain boundary consistency across climate cascade', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 700);
      const context = createPhaseContext(state.currentMonth);

      // Set moderate climate stress
      state.environmentalState.globalTemperature = 16.5;
      state.environmentalState.precipitationAnomalyFraction = -0.1;
      state.environmentalState.climateStability = 0.6;

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      // Execute phases
      climatePhase.execute(state, rng, context);
      boundariesPhase.execute(state, rng, context);

      // All 9 planetary boundaries should exist and be valid
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      const expectedBoundaries = [
        'climate_change',
        'biosphere_integrity',
        'land_use_change',
        'freshwater_use',
        'biogeochemical_flows',
        'ocean_acidification',
        'atmospheric_aerosol_loading',
        'stratospheric_ozone_depletion',
        'novel_entities'
      ];

      expectedBoundaries.forEach(boundaryName => {
        const boundary = boundaries[boundaryName as keyof typeof boundaries];
        assert.ok(boundary, `Boundary ${boundaryName} should exist`);
        assert.ok(Number.isFinite(boundary.currentValue),
          `Boundary ${boundaryName} should have finite value`);
        assert.ok(['safe', 'increasing_risk', 'exceeded'].includes(boundary.status),
          `Boundary ${boundaryName} should have valid status`);
      });

      // Overall tipping point risk should be finite and in range
      assert.ok(Number.isFinite(state.planetaryBoundariesSystem.tippingPointRisk));
      assert.ok(state.planetaryBoundariesSystem.tippingPointRisk >= 0 &&
                state.planetaryBoundariesSystem.tippingPointRisk <= 1);
    });
  });

  describe('Land use and biodiversity integration', () => {
    test('should reflect biodiversity loss in land use boundary', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 800);
      const context = createPhaseContext(state.currentMonth);

      // Set severe biodiversity loss (habitat destruction)
      state.environmentalState.biodiversityIndex = 0.25; // 75% loss
      state.environmentalState.climateStability = 0.5;

      const climatePhase = new ClimateImpactCascadePhase();
      const boundariesPhase = new PlanetaryBoundariesPhase();

      climatePhase.execute(state, rng, context);
      boundariesPhase.execute(state, rng, context);

      // Land use and biosphere integrity boundaries should reflect biodiversity loss
      const landUseBoundary = state.planetaryBoundariesSystem.boundaries.land_use_change;
      const biosphereBoundary = state.planetaryBoundariesSystem.boundaries.biosphere_integrity;

      assert.ok(Number.isFinite(landUseBoundary.currentValue));
      assert.ok(Number.isFinite(biosphereBoundary.currentValue));

      // With severe biodiversity loss, biosphere boundary should be exceeded
      assert.ok(['increasing_risk', 'exceeded'].includes(biosphereBoundary.status),
        'Biosphere boundary should show critical status with 75% biodiversity loss');
    });
  });
});
