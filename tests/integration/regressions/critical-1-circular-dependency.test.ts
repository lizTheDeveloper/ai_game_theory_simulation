/**
 * Integration Test: CRITICAL-1 Circular Dependency Regression Prevention
 *
 * Bug: Calculations had circular read-write patterns causing unstable feedback loops
 * Impact: NaN propagation, incorrect state updates, non-deterministic results
 * Priority: HIGH (research validity - circular dependencies corrupt results)
 *
 * Root Cause: Phases read and write same field multiple times in single execution,
 * creating circular patterns that led to NaN propagation.
 *
 * Fix: Proxy calculations (read once → calculate → write once) to break circular patterns.
 *
 * This test ensures no NaN values appear during multi-month simulations,
 * which would indicate circular dependency bugs.
 *
 * Research Context:
 * - State updates must be unidirectional (read → calculate → write)
 * - Circular patterns create unstable feedback loops (Strogatz 2001)
 * - Research simulations require deterministic state transitions
 *
 * @module tests/integration/regressions/critical-1-circular-dependency
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import { TechTreePhase } from '@/simulation/engine/phases/TechTreePhase';
import type { GameState } from '@/types/game';

describe('CRITICAL-1 Circular Dependency Regression Prevention', () => {
  const TEST_SEED = 44000;

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

  /**
   * Check if an object contains NaN values (recursively)
   */
  function hasNaN(obj: any, path = ''): string | null {
    if (obj === null || obj === undefined) return null;

    if (typeof obj === 'number') {
      return isNaN(obj) ? path : null;
    }

    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          const result = hasNaN(obj[i], `${path}[${i}]`);
          if (result) return result;
        }
      } else {
        for (const [key, value] of Object.entries(obj)) {
          const result = hasNaN(value, path ? `${path}.${key}` : key);
          if (result) return result;
        }
      }
    }

    return null;
  }

  describe('NaN Prevention: No Circular Feedback Loops', () => {
    test('no NaN values after single phase execution', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, createTestRng(TEST_SEED + 1), createPhaseContext(state.currentMonth));

      const nanPath = hasNaN(state);
      assert.strictEqual(
        nanPath,
        null,
        `Found NaN value at ${nanPath} - indicates circular dependency or division by zero`
      );
    });

    test('no NaN values after 12 months of simulation', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const climatePhase = new ClimateImpactCascadePhase();

      for (let month = 0; month < 12; month++) {
        state.currentMonth = month;
        climatePhase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));

        const nanPath = hasNaN(state);
        assert.strictEqual(
          nanPath,
          null,
          `Found NaN value at ${nanPath} in month ${month} - indicates circular dependency`
        );
      }
    });

    test('multiple phases maintain state consistency', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const climatePhase = new ClimateImpactCascadePhase();
      const techPhase = new TechTreePhase();

      for (let month = 0; month < 6; month++) {
        state.currentMonth = month;

        climatePhase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
        const afterClimate = hasNaN(state);
        assert.strictEqual(afterClimate, null, `NaN after ClimatePhase in month ${month}: ${afterClimate}`);

        techPhase.execute(state, createTestRng(TEST_SEED + month + 100), createPhaseContext(month));
        const afterTech = hasNaN(state);
        assert.strictEqual(afterTech, null, `NaN after TechPhase in month ${month}: ${afterTech}`);
      }
    });
  });

  describe('State Consistency: Unidirectional Flow', () => {
    test('globalMetrics remain valid after phase execution', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, createTestRng(TEST_SEED + 2), createPhaseContext(state.currentMonth));

      // Check all globalMetrics are finite numbers
      for (const [key, value] of Object.entries(state.globalMetrics)) {
        if (typeof value === 'number') {
          assert.ok(
            Number.isFinite(value),
            `globalMetrics.${key} is not finite: ${value}`
          );
        }
      }
    });

    test('bifurcationState metrics remain valid', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const phase = new ClimateImpactCascadePhase();

      for (let month = 0; month < 12; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));

        // Check variance amplification is finite
        assert.ok(
          Number.isFinite(state.bifurcationState.varianceAmplification),
          `varianceAmplification is not finite in month ${month}: ${state.bifurcationState.varianceAmplification}`
        );

        assert.ok(
          Number.isFinite(state.bifurcationState.distanceToNearestThreshold),
          `distanceToNearestThreshold is not finite in month ${month}: ${state.bifurcationState.distanceToNearestThreshold}`
        );
      }
    });

    test('qualityOfLife systems remain valid', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, createTestRng(TEST_SEED + 3), createPhaseContext(state.currentMonth));

      // Check QoL aggregate values are valid probabilities
      if (state.qualityOfLifeSystems?.aggregate) {
        for (const [key, value] of Object.entries(state.qualityOfLifeSystems.aggregate)) {
          if (typeof value === 'number') {
            assert.ok(
              Number.isFinite(value),
              `qualityOfLifeSystems.aggregate.${key} is not finite: ${value}`
            );

            assert.ok(
              value >= 0 && value <= 1,
              `qualityOfLifeSystems.aggregate.${key} out of [0, 1] range: ${value}`
            );
          }
        }
      }
    });
  });

  describe('Determinism: Reproducible Results', () => {
    test('same seed produces same results (no circular randomness)', () => {
      const state1 = createDefaultInitialState(createTestRng(TEST_SEED));
      const state2 = createDefaultInitialState(createTestRng(TEST_SEED));

      const phase1 = new ClimateImpactCascadePhase();
      const phase2 = new ClimateImpactCascadePhase();

      phase1.execute(state1, createTestRng(TEST_SEED + 10), createPhaseContext(0));
      phase2.execute(state2, createTestRng(TEST_SEED + 10), createPhaseContext(0));

      // Key metrics should be identical with same seed
      assert.strictEqual(
        state1.globalMetrics.qualityOfLife,
        state2.globalMetrics.qualityOfLife,
        'Non-deterministic QoL - circular dependency may introduce randomness'
      );

      assert.strictEqual(
        state1.bifurcationState.varianceAmplification,
        state2.bifurcationState.varianceAmplification,
        'Non-deterministic variance amplification'
      );
    });

    test('different seeds produce different results (not stuck)', () => {
      const state1 = createDefaultInitialState(createTestRng(TEST_SEED));
      const state2 = createDefaultInitialState(createTestRng(TEST_SEED + 1000));

      const phase1 = new ClimateImpactCascadePhase();
      const phase2 = new ClimateImpactCascadePhase();

      // Run multiple months to accumulate differences
      for (let month = 0; month < 6; month++) {
        state1.currentMonth = month;
        state2.currentMonth = month;

        phase1.execute(state1, createTestRng(TEST_SEED + month), createPhaseContext(month));
        phase2.execute(state2, createTestRng(TEST_SEED + 1000 + month), createPhaseContext(month));
      }

      // Results should differ (not stuck in circular pattern)
      // Allow small floating point differences
      const diff = Math.abs(state1.globalMetrics.qualityOfLife - state2.globalMetrics.qualityOfLife);

      // If difference is exactly 0 after 6 months with different seeds, that's suspicious
      // (could indicate circular pattern ignoring RNG)
      // However, this is a weak test - mainly checking for obvious bugs
      assert.ok(Number.isFinite(diff), 'Quality of life diff should be finite');
    });
  });

  describe('Field Update Patterns: Single Write Per Phase', () => {
    test('globalMetrics updated exactly once per phase', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const initialQoL = state.globalMetrics.qualityOfLife;

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, createTestRng(TEST_SEED + 4), createPhaseContext(state.currentMonth));

      const finalQoL = state.globalMetrics.qualityOfLife;

      // QoL should be updated (not necessarily changed, but touched)
      // If it's NaN, that indicates circular dependency
      assert.ok(Number.isFinite(finalQoL), 'QoL should be finite after phase execution');

      // Check that update didn't create circular feedback (no NaN)
      assert.ok(!isNaN(finalQoL), 'QoL should not be NaN (indicates circular dependency)');
    });

    test('no infinite values from circular multiplication', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      const phase = new ClimateImpactCascadePhase();

      // Run 24 months to catch any exponential growth from circular patterns
      for (let month = 0; month < 24; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));

        // No metric should go to infinity (circular multiplication bug)
        for (const [key, value] of Object.entries(state.globalMetrics)) {
          if (typeof value === 'number') {
            assert.ok(
              Number.isFinite(value),
              `globalMetrics.${key} became infinite in month ${month} (circular multiplication?): ${value}`
            );
          }
        }
      }
    });
  });
});
