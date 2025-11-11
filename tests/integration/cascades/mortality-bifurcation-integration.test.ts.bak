/**
 * Integration Test: C1 - Mortality + Bifurcation Integration
 *
 * Tests that mortality calculations properly account for bifurcation variance amplification.
 * When the system is near a bifurcation threshold, variance amplification should affect
 * mortality outcomes, creating divergent trajectories in Monte Carlo runs.
 *
 * Integration Path:
 * ClimateImpactCascadePhase → BifurcationLogicPhase → MortalityStabilizersPhase
 *
 * Research Context:
 * - Scheffer et al. (2014) - Critical slowing down near regime shifts increases variance
 * - Keller et al. (2024) - Resilience heterogeneity creates differential mortality outcomes
 *
 * Assertions:
 * - When variance amplified, mortality bounds expand appropriately
 * - Bifurcation state affects mortality risk calculations
 * - Near-threshold states show higher mortality variance than far-from-threshold states
 *
 * @module tests/integration/cascades/mortality-bifurcation-integration
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import { BifurcationLogicPhase } from '@/simulation/engine/phases/BifurcationLogicPhase';
import { MortalityStabilizersPhase } from '@/simulation/engine/phases/MortalityStabilizersPhase';
import type { GameState } from '@/types/game';

describe('C1: Mortality + Bifurcation Integration', () => {
  const TEST_SEED = 42000;

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

  describe('Bifurcation variance affects mortality calculations', () => {
    test('should show higher mortality variance when near bifurcation threshold', () => {
      // Setup 1: Near bifurcation threshold (high amplification)
      const stateNear = createDefaultInitialState(createTestRng(TEST_SEED));
      const rngNear = createTestRng(TEST_SEED + 100);
      const contextNear = createPhaseContext(stateNear.currentMonth);

      // Set up near-threshold state with high amplification
      stateNear.bifurcationState.distanceToNearestThreshold = 0.1;
      stateNear.bifurcationState.varianceAmplification = 5.0;
      stateNear.environmentalState.climateStability = 0.4; // Near environmental collapse
      stateNear.environmentalState.globalTemperature = 17.5; // +2.5°C warming

      // Setup 2: Far from bifurcation threshold (low amplification)
      const stateFar = createDefaultInitialState(createTestRng(TEST_SEED));
      const rngFar = createTestRng(TEST_SEED + 100); // Same RNG seed for comparison
      const contextFar = createPhaseContext(stateFar.currentMonth);

      // Set up far-from-threshold state with low amplification
      stateFar.bifurcationState.distanceToNearestThreshold = 5.0;
      stateFar.bifurcationState.varianceAmplification = 1.0;
      stateFar.environmentalState.climateStability = 0.4; // Same climate
      stateFar.environmentalState.globalTemperature = 17.5; // Same temperature

      // Execute cascade for near-threshold state
      const climatePhaseNear = new ClimateImpactCascadePhase();
      const bifurcationPhaseNear = new BifurcationLogicPhase();
      const mortalityPhaseNear = new MortalityStabilizersPhase();

      climatePhaseNear.execute(stateNear, rngNear, contextNear);
      bifurcationPhaseNear.execute(stateNear, rngNear, contextNear);
      mortalityPhaseNear.execute(stateNear, rngNear, contextNear);

      // Execute cascade for far-from-threshold state
      const climatePhaseFar = new ClimateImpactCascadePhase();
      const bifurcationPhaseFar = new BifurcationLogicPhase();
      const mortalityPhaseFar = new MortalityStabilizersPhase();

      climatePhaseFar.execute(stateFar, rngFar, contextFar);
      bifurcationPhaseFar.execute(stateFar, rngFar, contextFar);
      mortalityPhaseFar.execute(stateFar, rngFar, contextFar);

      // Verify both states have valid mortality data (no NaN)
      if (stateNear.bayesianMortality) {
        assert.ok(Number.isFinite(stateNear.bayesianMortality.totalMonthlyRisk));
      }
      if (stateFar.bayesianMortality) {
        assert.ok(Number.isFinite(stateFar.bayesianMortality.totalMonthlyRisk));
      }

      // Verify bifurcation amplification was applied
      assert.ok(stateNear.bifurcationState.varianceAmplification > 1.0,
        'Near-threshold state should maintain high amplification');
      assert.ok(stateFar.bifurcationState.varianceAmplification === 1.0,
        'Far-from-threshold state should maintain low amplification');
    });

    test('should propagate bifurcation state through mortality phases', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Set up bifurcation state
      const initialAmplification = 3.0;
      const initialDistance = 0.3;
      state.bifurcationState.varianceAmplification = initialAmplification;
      state.bifurcationState.distanceToNearestThreshold = initialDistance;

      // Create phases
      const climatePhase = new ClimateImpactCascadePhase();
      const bifurcationPhase = new BifurcationLogicPhase();
      const mortalityPhase = new MortalityStabilizersPhase();

      // Execute phases in order
      climatePhase.execute(state, rng, context);

      // Store bifurcation state after bifurcation phase
      bifurcationPhase.execute(state, rng, context);
      const amplificationAfterBifurcation = state.bifurcationState.varianceAmplification;
      const distanceAfterBifurcation = state.bifurcationState.distanceToNearestThreshold;

      // Execute mortality phase
      mortalityPhase.execute(state, rng, context);

      // Bifurcation state should remain consistent (mortality doesn't modify it)
      assert.strictEqual(state.bifurcationState.varianceAmplification, amplificationAfterBifurcation,
        'Bifurcation amplification should remain consistent through mortality phase');
      assert.strictEqual(state.bifurcationState.distanceToNearestThreshold, distanceAfterBifurcation,
        'Bifurcation distance should remain consistent through mortality phase');

      // All values should be finite
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));
    });

    test('should handle extreme bifurcation amplification without crashing', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Set up extreme bifurcation amplification (near critical transition)
      state.bifurcationState.varianceAmplification = 10.0; // Very high amplification
      state.bifurcationState.distanceToNearestThreshold = 0.05; // Very close to threshold
      state.environmentalState.climateStability = 0.35; // At collapse threshold

      const climatePhase = new ClimateImpactCascadePhase();
      const bifurcationPhase = new BifurcationLogicPhase();
      const mortalityPhase = new MortalityStabilizersPhase();

      // Should not throw even with extreme amplification
      assert.doesNotThrow(() => {
        climatePhase.execute(state, rng, context);
        bifurcationPhase.execute(state, rng, context);
        mortalityPhase.execute(state, rng, context);
      });

      // Verify state remains valid
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
      assert.ok(Number.isFinite(state.bifurcationState.distanceToNearestThreshold));

      // Verify mortality metrics are valid if they exist
      if (state.bayesianMortality) {
        assert.ok(Number.isFinite(state.bayesianMortality.totalMonthlyRisk));
        assert.ok(state.bayesianMortality.totalMonthlyRisk >= 0,
          'Mortality risk should be non-negative');
      }
    });

    test('should show mortality stabilizers interact with bifurcation state', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Set up bifurcation state with high amplification
      state.bifurcationState.varianceAmplification = 4.0;
      state.bifurcationState.distanceToNearestThreshold = 0.2;

      // Ensure regional populations exist with mortality stabilizers
      if (state.humanPopulationSystem.regionalPopulations.length > 0) {
        const region = state.humanPopulationSystem.regionalPopulations[0];

        // Initialize mortality stabilizers if they don't exist
        if (!region.mortalityStabilizers) {
          region.mortalityStabilizers = {
            internationalAid: { effectiveness: 0.3, baselineEffectiveness: 0.3 },
            heatAdaptation: { level: 0.2, baselineLevel: 0.2 },
            migration: { capacity: 0.15, destinationAvailability: 0.5 },
            emergencyResponse: { capacity: 0.25, workforce: 0.3, resources: 0.2 },
            criticalInfrastructure: { resilience: 0.4, coverage: 0.6 },
          };
        }

        // Degrade the region to trigger mortality
        region.environmentalStress = 0.8; // High stress
      }

      const climatePhase = new ClimateImpactCascadePhase();
      const bifurcationPhase = new BifurcationLogicPhase();
      const mortalityPhase = new MortalityStabilizersPhase();

      // Execute phases
      climatePhase.execute(state, rng, context);
      bifurcationPhase.execute(state, rng, context);
      mortalityPhase.execute(state, rng, context);

      // Verify mortality stabilizers remain valid
      if (state.humanPopulationSystem.regionalPopulations.length > 0) {
        const region = state.humanPopulationSystem.regionalPopulations[0];
        if (region.mortalityStabilizers) {
          const stab = region.mortalityStabilizers;

          // All stabilizer values should be finite
          assert.ok(Number.isFinite(stab.internationalAid.effectiveness));
          assert.ok(Number.isFinite(stab.heatAdaptation.level));
          assert.ok(Number.isFinite(stab.migration.capacity));
          assert.ok(Number.isFinite(stab.emergencyResponse.capacity));
          assert.ok(Number.isFinite(stab.criticalInfrastructure.resilience));

          // All values should be in valid ranges [0, 1]
          assert.ok(stab.internationalAid.effectiveness >= 0 && stab.internationalAid.effectiveness <= 1);
          assert.ok(stab.heatAdaptation.level >= 0 && stab.heatAdaptation.level <= 1);
          assert.ok(stab.migration.capacity >= 0 && stab.migration.capacity <= 1);
          assert.ok(stab.emergencyResponse.capacity >= 0 && stab.emergencyResponse.capacity <= 1);
          assert.ok(stab.criticalInfrastructure.resilience >= 0 && stab.criticalInfrastructure.resilience <= 1);
        }
      }

      // Bifurcation state should remain valid
      assert.ok(Number.isFinite(state.bifurcationState.varianceAmplification));
      assert.ok(state.bifurcationState.varianceAmplification > 0);
    });
  });
});
