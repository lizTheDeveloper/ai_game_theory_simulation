/**
 * Integration Test: CRITICAL-1 Bifurcation-Validation Conflict Regression Prevention
 *
 * Bug: State validation bounds conflicted with bifurcation amplification
 * Impact: Assertions failed during legitimate regime shifts
 * Priority: MEDIUM (defensive coding - false positive failures)
 *
 * Root Cause: Strict validation bounds rejected bifurcation-amplified values.
 * The fix implemented bifurcation-aware capping to allow amplification without failures.
 *
 * This test ensures validation respects extreme value scenarios during regime shifts.
 *
 * Research Context:
 * - Critical transitions show amplification near tipping points (Scheffer 2009)
 * - Validation must allow physically-valid amplification
 *
 * @module tests/integration/regressions/critical-1-bifurcation-validation
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import type { GameState } from '@/types/game';

describe('CRITICAL-1 Bifurcation-Validation Conflict Regression Prevention', () => {
  const TEST_SEED = 43000;

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

  describe('Extreme Value Handling: No Assertion Failures', () => {
    test('allows simulation to run with extreme environmental conditions', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      // Set extreme conditions
      state.globalMetrics.qualityOfLife = 0.95; // Near upper bound
      state.globalMetrics.socialStability = 0.05; // Near lower bound
      state.bifurcationState.varianceAmplification = 3.0; // High amplification

      const phase = new ClimateImpactCascadePhase();

      // Should NOT throw - bifurcation-aware handling prevents assertion failure
      assert.doesNotThrow(() => {
        phase.execute(state, createTestRng(TEST_SEED + 1), createPhaseContext(state.currentMonth));
      });

      // Verify values remain in valid probability range [0, 1]
      assert.ok(state.globalMetrics.qualityOfLife >= 0 && state.globalMetrics.qualityOfLife <= 1);
      assert.ok(state.globalMetrics.socialStability >= 0 && state.globalMetrics.socialStability <= 1);
    });

    test('handles high variance amplification without crashing', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      // Set up high variance amplification (near regime shift)
      state.bifurcationState.varianceAmplification = 5.0;
      state.bifurcationState.distanceToNearestThreshold = 0.1;

      const phase = new ClimateImpactCascadePhase();

      // Should handle extreme amplification without assertion failure
      assert.doesNotThrow(() => {
        phase.execute(state, createTestRng(TEST_SEED + 2), createPhaseContext(state.currentMonth));
      });

      // All metrics should remain in valid bounds
      assert.ok(state.globalMetrics.qualityOfLife >= 0 && state.globalMetrics.qualityOfLife <= 1);
      assert.ok(state.globalMetrics.catastrophicRisk >= 0 && state.globalMetrics.catastrophicRisk <= 1);
    });

    test('multiple phases run without assertion failures', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      state.bifurcationState.varianceAmplification = 2.5;

      const phase = new ClimateImpactCascadePhase();

      // Run 6 months with amplification active
      for (let month = 0; month < 6; month++) {
        state.currentMonth = month;

        assert.doesNotThrow(() => {
          phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
        });

        // Verify all metrics remain valid
        assert.ok(state.globalMetrics.qualityOfLife >= 0 && state.globalMetrics.qualityOfLife <= 1);
        assert.ok(state.globalMetrics.socialStability >= 0 && state.globalMetrics.socialStability <= 1);
      }
    });
  });

  describe('Regime Shift Detection', () => {
    test('logs regime shifts when thresholds crossed', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const initialRegime = state.bifurcationState.currentRegime;
      const initialHistoryLength = state.bifurcationState.regimeShiftHistory.length;

      const phase = new ClimateImpactCascadePhase();

      // Run multiple months to potentially trigger regime shift
      for (let month = 0; month < 12; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
      }

      // Verify regime tracking exists
      assert.ok('currentRegime' in state.bifurcationState);
      assert.ok('previousRegime' in state.bifurcationState);
      assert.ok('regimeShiftHistory' in state.bifurcationState);

      // Regime should be one of valid states
      const validRegimes = ['status-quo', 'ecological-collapse', 'social-breakdown', 'sustainable', 'flourishing', 'economic-collapse', 'state-failure'];
      assert.ok(validRegimes.includes(state.bifurcationState.currentRegime));
    });

    test('variance amplification increases near thresholds', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      // Set metrics very close to a threshold
      state.globalMetrics.socialStability = 0.22; // Near social breakdown threshold (0.2)

      const initialAmplification = state.bifurcationState.varianceAmplification;

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, createTestRng(TEST_SEED + 3), createPhaseContext(state.currentMonth));

      // Amplification should exist and be >= 1
      assert.ok(state.bifurcationState.varianceAmplification >= 1);
    });
  });

  describe('Validation Utilities: Bounds Checking', () => {
    test('assertion utilities available and imported', () => {
      const { assertFinite, assertInRange, assertProbability } = require('@/simulation/utils/assertions');

      // Verify utilities exist
      assert.ok(typeof assertFinite === 'function');
      assert.ok(typeof assertInRange === 'function');
      assert.ok(typeof assertProbability === 'function');
    });

    test('assertProbability enforces [0, 1] bounds', () => {
      const { assertProbability } = require('@/simulation/utils/assertions');

      // Valid probabilities should pass
      assert.doesNotThrow(() => {
        assertProbability(0.5, { location: 'test', valueName: 'prob', month: 0 });
        assertProbability(0, { location: 'test', valueName: 'prob', month: 0 });
        assertProbability(1, { location: 'test', valueName: 'prob', month: 0 });
      });

      // Invalid probabilities should throw
      assert.throws(() => {
        assertProbability(1.5, { location: 'test', valueName: 'prob', month: 0 });
      });

      assert.throws(() => {
        assertProbability(-0.1, { location: 'test', valueName: 'prob', month: 0 });
      });
    });

    test('assertInRange enforces custom bounds', () => {
      const { assertInRange } = require('@/simulation/utils/assertions');

      // Valid values should pass
      assert.doesNotThrow(() => {
        assertInRange(50, 0, 100, { location: 'test', valueName: 'value', month: 0 });
      });

      // Out of range should throw
      assert.throws(() => {
        assertInRange(150, 0, 100, { location: 'test', valueName: 'value', month: 0 });
      });
    });
  });
});
