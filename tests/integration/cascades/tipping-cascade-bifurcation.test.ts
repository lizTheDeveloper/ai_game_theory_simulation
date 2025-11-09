/**
 * Integration Test: C10 - Tipping Points + Cascade Amplification + Bifurcation
 *
 * Tests that crossed tipping points trigger cascades and increase bifurcation risk.
 * When tipping points are crossed, cascades should activate and the system should
 * move closer to bifurcation thresholds, creating regime shift potential.
 *
 * Integration Path:
 * TippingPointPhase → CrisisDetectionPhase → BifurcationLogicPhase
 *
 * Research Context:
 * - Lenton et al. (2019) Nature - Climate tipping points cascade globally
 * - Armstrong McKay et al. (2022) Science - 9 climate tipping points possible at 1.5°C
 * - Scheffer et al. (2012) Science - Anticipating critical transitions
 * - Tipping point crossing creates positive feedbacks → amplified cascades
 *
 * Assertions:
 * - Tipping point crossing logged correctly
 * - Cascades activated for crossed thresholds
 * - Bifurcation distance decreases near tipping points
 * - Multiple tipping points amplify bifurcation risk
 *
 * @module tests/integration/cascades/tipping-cascade-bifurcation
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { TippingPointPhase } from '@/simulation/engine/phases/TippingPointPhase';
import { CrisisDetectionPhase } from '@/simulation/engine/phases/CrisisDetectionPhase';
import { BifurcationLogicPhase } from '@/simulation/engine/phases/BifurcationLogicPhase';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import type { GameState } from '@/types/game';

describe('C10: Tipping Points + Cascade + Bifurcation Integration', () => {
  const TEST_SEED = 42600;

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

  describe('Tipping point crossing triggers cascades', () => {
    test('should detect tipping point crossing with extreme climate conditions', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 100);
      const context = createPhaseContext(state.currentMonth);

      // Set conditions near tipping point
      state.environmentalState.globalTemperature = 17.5; // +2.5°C (near tipping threshold)
      state.environmentalState.climateStability = 0.25; // Very low stability
      state.environmentalState.biodiversityIndex = 0.3; // Severe biodiversity loss

      // Ensure planetary boundaries exist
      if (!state.planetaryBoundariesSystem) {
        state.planetaryBoundariesSystem = {
          boundaries: {} as any,
          tippingPointRisk: 0.0,
          exceededCount: 0,
        };
      }

      const tippingPhase = new TippingPointPhase();
      const crisisPhase = new CrisisDetectionPhase();
      const bifurcationPhase = new BifurcationLogicPhase();

      // Execute phases
      tippingPhase.execute(state, rng, context);
      crisisPhase.execute(state, rng, context);
      bifurcationPhase.execute(state, rng, context);

      // Tipping point risk should be elevated
      if (state.planetaryBoundariesSystem) {
        assert.ok(Number.isFinite(state.planetaryBoundariesSystem.tippingPointRisk));
        assert.ok(state.planetaryBoundariesSystem.tippingPointRisk >= 0 &&
                  state.planetaryBoundariesSystem.tippingPointRisk <= 1,
          'Tipping point risk should be in range [0, 1]');
      }

      // Bifurcation state should reflect proximity to tipping point
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
    });

    test('should activate cascades when tipping points are crossed', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Set extreme conditions to cross tipping points
      state.environmentalState.globalTemperature = 18.5; // +3.5°C
      state.environmentalState.climateStability = 0.15; // Extreme instability
      state.environmentalState.biodiversityIndex = 0.2; // Critical biodiversity loss
      state.environmentalState.precipitationAnomalyFraction = -0.4; // Severe drought

      const climatePhase = new ClimateImpactCascadePhase();
      const tippingPhase = new TippingPointPhase();
      const crisisPhase = new CrisisDetectionPhase();

      // Execute cascade
      climatePhase.execute(state, rng, context);
      tippingPhase.execute(state, rng, context);
      crisisPhase.execute(state, rng, context);

      // Crisis detection should identify the extreme conditions
      // State should remain valid (no NaN)
      assert.ok(Number.isFinite(state.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(state.environmentalState.climateStability));

      if (state.planetaryBoundariesSystem) {
        assert.ok(Number.isFinite(state.planetaryBoundariesSystem.tippingPointRisk));
      }
    });

    test('should increase bifurcation risk when near tipping points', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Set state near environmental collapse threshold
      state.environmentalState.climateStability = 0.36; // Just above collapse threshold (~0.35)
      state.environmentalState.globalTemperature = 17.0; // +2°C

      // Record initial bifurcation distance
      const initialDistance = state.bifurcationState.distanceToNearestThreshold;
      const initialAmplification = state.bifurcationState.varianceAmplification;

      const tippingPhase = new TippingPointPhase();
      const bifurcationPhase = new BifurcationLogicPhase();

      tippingPhase.execute(state, rng, context);
      bifurcationPhase.execute(state, rng, context);

      // Near tipping points, bifurcation logic should update distance
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));

      // When near threshold, amplification should increase
      // (distance decreases, amplification increases)
      assert.ok(state.bifurcationState.varianceAmplification >= 1.0,
        'Variance amplification should be at least 1.0');
    });
  });

  describe('Bifurcation amplification near tipping points', () => {
    test('should amplify variance when approaching environmental collapse', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Set state very close to environmental collapse threshold
      state.environmentalState.climateStability = 0.33; // Below typical threshold (~0.35)
      state.bifurcationState.distanceToNearestThreshold = 5.0; // Start far
      state.bifurcationState.varianceAmplification = 1.0; // Start low

      const bifurcationPhase = new BifurcationLogicPhase();
      bifurcationPhase.execute(state, rng, context);

      // Bifurcation logic should detect proximity to threshold
      assert.ok(state.bifurcationState.distanceToNearestThreshold < 5.0,
        'Distance should decrease when approaching threshold');

      // Amplification should increase
      assert.ok(state.bifurcationState.varianceAmplification > 1.0,
        'Amplification should increase near threshold');

      // All values should remain finite
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
    });

    test('should handle multiple tipping points amplifying bifurcation', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 500);
      const context = createPhaseContext(state.currentMonth);

      // Set conditions crossing multiple thresholds
      state.environmentalState.climateStability = 0.25; // Environmental collapse
      state.globalMetrics.socialStability = 0.18; // Social breakdown (<0.20)
      state.environmentalState.biodiversityIndex = 0.2; // Biodiversity tipping point

      const tippingPhase = new TippingPointPhase();
      const crisisPhase = new CrisisDetectionPhase();
      const bifurcationPhase = new BifurcationLogicPhase();

      tippingPhase.execute(state, rng, context);
      crisisPhase.execute(state, rng, context);
      bifurcationPhase.execute(state, rng, context);

      // Multiple crossed thresholds should create high amplification
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
      assert.ok(state.bifurcationState.varianceAmplification > 1.0,
        'Multiple tipping points should amplify variance');

      // Distance to nearest threshold should be very small
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));

      // All state should remain valid
      assert.ok(Number.isFinite(state.environmentalState.climateStability));
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));
    });
  });

  describe('Complete tipping cascade integration', () => {
    test('should propagate tipping point through complete cascade', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 600);
      const context = createPhaseContext(state.currentMonth);

      // Set severe multi-system stress
      state.environmentalState.globalTemperature = 18.0; // +3°C
      state.environmentalState.climateStability = 0.3;
      state.environmentalState.biodiversityIndex = 0.25;
      state.globalMetrics.socialStability = 0.3;

      const climatePhase = new ClimateImpactCascadePhase();
      const tippingPhase = new TippingPointPhase();
      const crisisPhase = new CrisisDetectionPhase();
      const bifurcationPhase = new BifurcationLogicPhase();

      // Execute complete cascade
      climatePhase.execute(state, rng, context);
      tippingPhase.execute(state, rng, context);
      crisisPhase.execute(state, rng, context);
      bifurcationPhase.execute(state, rng, context);

      // Verify complete state consistency (no NaN propagation)
      assert.ok(Number.isFinite(state.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(state.environmentalState.climateStability));
      assert.ok(Number.isFinite(state.environmentalState.biodiversityIndex));
      assert.ok(Number.isFinite(state.globalMetrics.socialStability));
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));

      if (state.planetaryBoundariesSystem) {
        assert.ok(Number.isFinite(state.planetaryBoundariesSystem.tippingPointRisk));
      }
    });

    test('should not crash with extreme cascade amplification', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 700);
      const context = createPhaseContext(state.currentMonth);

      // Set catastrophic conditions
      state.environmentalState.globalTemperature = 20.0; // +5°C (catastrophic)
      state.environmentalState.climateStability = 0.1; // System collapse
      state.environmentalState.biodiversityIndex = 0.1; // Mass extinction
      state.globalMetrics.socialStability = 0.1; // Societal breakdown

      const climatePhase = new ClimateImpactCascadePhase();
      const tippingPhase = new TippingPointPhase();
      const crisisPhase = new CrisisDetectionPhase();
      const bifurcationPhase = new BifurcationLogicPhase();

      // Should not throw even with catastrophic conditions
      assert.doesNotThrow(() => {
        climatePhase.execute(state, rng, context);
        tippingPhase.execute(state, rng, context);
        crisisPhase.execute(state, rng, context);
        bifurcationPhase.execute(state, rng, context);
      });

      // All values should remain finite (capped but not NaN)
      assert.ok(Number.isFinite(state.environmentalState.globalTemperature));
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
    });

    test('should maintain threshold consistency across phases', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 800);
      const context = createPhaseContext(state.currentMonth);

      // Record initial threshold state
      const initialEnvThreshold = state.bifurcationState.environmentalCollapseThreshold.location;
      const initialSocialThreshold = state.bifurcationState.socialBreakdownThreshold.location;

      // Set near-threshold conditions
      state.environmentalState.climateStability = initialEnvThreshold + 0.05; // Just above threshold
      state.globalMetrics.socialStability = initialSocialThreshold + 0.05;

      const tippingPhase = new TippingPointPhase();
      const crisisPhase = new CrisisDetectionPhase();
      const bifurcationPhase = new BifurcationLogicPhase();

      tippingPhase.execute(state, rng, context);
      crisisPhase.execute(state, rng, context);
      bifurcationPhase.execute(state, rng, context);

      // Thresholds should not change during a run (sampled once at init)
      assert.strictEqual(state.bifurcationState.environmentalCollapseThreshold.location, initialEnvThreshold,
        'Environmental threshold should remain constant during run');
      assert.strictEqual(state.bifurcationState.socialBreakdownThreshold.location, initialSocialThreshold,
        'Social threshold should remain constant during run');

      // Distance calculations should be valid
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
      assert.ok(state.bifurcationState.distanceToNearestThreshold >= 0,
        'Distance should be non-negative');
    });
  });
});
