/**
import { createSeededRng } from '@/simulation/rng';
 * Integration Test: CRITICAL-3 RNG Regression Prevention
 *
 * Bug: Commit 9c6f25dde introduced Math.random fallback in RNG initialization
 * Impact: Broke Monte Carlo determinism - simulations no longer reproducible
 * Priority: CRITICAL (HIGH-4)
 *
 * Root Cause: Optional RNG parameters with Math.random fallback pattern:
 * ```typescript
 * // ❌ BAD - Silent non-determinism
 * function init(rng?: () => number) {
 *   const random = rng || Math.random;  // Silently breaks determinism!
 * }
 * ```
 *
 * Correct Pattern: Required RNG with fail-loudly assertion:
 * ```typescript
 * // ✅ GOOD - Fails immediately if missing
 * function init(rng: () => number) {
 *   if (!rng || typeof rng !== 'function') {
 *     throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
 *   }
 * }
 * ```
 *
 * This test ensures critical functions REQUIRE RNG and FAIL LOUDLY when missing.
 *
 * Research Context:
 * - Monte Carlo simulations require determinism for statistical validity
 * - Silent fallbacks to Math.random produce unreproducible results
 * - Research simulations MUST fail-fast when core assumptions violated
 *
 * @module tests/integration/regressions/critical-3-rng-regression
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { EnvironmentalSystem } from '@/simulation/systems/EnvironmentalSystem';
import { EnvironmentalFeedbackPhase } from '@/simulation/engine/phases/EnvironmentalFeedbackPhase';

describe('CRITICAL-3 RNG Regression Prevention', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  describe('Fail-Loudly: RNG Required (No Silent Fallbacks)', () => {
    test('createDefaultInitialState throws when RNG missing', () => {
      // Must throw, not fallback to Math.random
      assert.throws(
        () => createDefaultInitialState(undefined as any),
        /RNG.*required|CRITICAL/i,
        'createDefaultInitialState must reject missing RNG, not use Math.random fallback'
      );
    });

    test('createDefaultInitialState throws when RNG is null', () => {
      assert.throws(
        () => createDefaultInitialState(null as any),
        /RNG.*required|CRITICAL/i,
        'createDefaultInitialState must reject null RNG'
      );
    });

    test('createDefaultInitialState throws when RNG is not a function', () => {
      assert.throws(
        () => createDefaultInitialState(42 as any),
        /RNG.*required|function|CRITICAL/i,
        'createDefaultInitialState must reject non-function RNG'
      );
    });

    test('EnvironmentalSystem constructor throws when RNG missing', () => {
      assert.throws(
        () => new EnvironmentalSystem(undefined as any),
        /RNG.*required|CRITICAL/i,
        'EnvironmentalSystem must reject missing RNG'
      );
    });

    test('EnvironmentalSystem constructor throws when RNG is null', () => {
      assert.throws(
        () => new EnvironmentalSystem(null as any),
        /RNG.*required|CRITICAL/i,
        'EnvironmentalSystem must reject null RNG'
      );
    });

    test('EnvironmentalSystem constructor throws when RNG is not a function', () => {
      assert.throws(
        () => new EnvironmentalSystem("not a function" as any),
        /RNG.*required|function|CRITICAL/i,
        'EnvironmentalSystem must reject non-function RNG'
      );
    });
  });

  describe('Valid RNG: Deterministic Behavior', () => {
    test('createDefaultInitialState succeeds with valid RNG', () => {
      const rng = createTestRng(TEST_SEED);

      // Should not throw
      assert.doesNotThrow(() => {
        const state = createDefaultInitialState(rng);
        assert.ok(state, 'State should be created');
        assert.strictEqual(typeof state.currentMonth, 'number');
      }, 'createDefaultInitialState should accept valid RNG');
    });

    test('EnvironmentalSystem succeeds with valid RNG', () => {
      const rng = createTestRng(TEST_SEED);

      // Should not throw
      assert.doesNotThrow(() => {
        const system = new EnvironmentalSystem(rng);
        assert.ok(system, 'System should be created');
        assert.strictEqual(system.id, 'environmental');
      }, 'EnvironmentalSystem should accept valid RNG');
    });
  });

  describe('Determinism: Same Seed = Same State', () => {
    test('createDefaultInitialState produces identical states with same seed', () => {
      const state1 = createDefaultInitialState(createTestRng(TEST_SEED));
      const state2 = createDefaultInitialState(createTestRng(TEST_SEED));

      // Initial population should be identical (sampled during initialization)
      assert.strictEqual(
        state1.population,
        state2.population,
        'Population should be deterministic with same seed'
      );

      // Number of AI agents should be identical
      assert.strictEqual(
        state1.aiAgents.length,
        state2.aiAgents.length,
        'Number of AI agents should be deterministic'
      );

      // First AI agent alignment should be identical (RNG-sampled)
      if (state1.aiAgents.length > 0 && state2.aiAgents.length > 0) {
        assert.strictEqual(
          state1.aiAgents[0].alignment,
          state2.aiAgents[0].alignment,
          'AI agent alignment should be deterministic with same seed'
        );
      }
    });

    test('EnvironmentalSystem produces identical results with same seed', () => {
      const rng1 = createTestRng(TEST_SEED);
      const rng2 = createTestRng(TEST_SEED);

      const system1 = new EnvironmentalSystem(rng1);
      const system2 = new EnvironmentalSystem(rng2);

      const env1 = system1.initialize();
      const env2 = system2.initialize();

      // All environmental accumulation fields should be identical
      assert.deepStrictEqual(
        env1,
        env2,
        'EnvironmentalSystem.initialize() should be deterministic with same seed'
      );
    });
  });

  describe('Anti-Pattern Detection', () => {
    test('no Math.random fallback in initialization', () => {
      // This test verifies that the code does NOT contain patterns like:
      // const random = rng || Math.random;
      //
      // Verified by the fact that missing RNG throws errors (tested above)
      // rather than silently falling back to Math.random.

      let didThrow = false;
      try {
        createDefaultInitialState(undefined as any);
      } catch (e) {
        didThrow = true;
      }

      assert.ok(didThrow, 'Code must fail loudly, not use silent Math.random fallback');
    });

    test('no optional RNG parameters with defaults', () => {
      // The RNG parameter must be REQUIRED (not optional with fallback).
      // This is verified by TypeScript type system + runtime assertions.
      //
      // If RNG were optional (rng?: () => number), this would compile:
<<<<<<< Updated upstream
      // createDefaultInitialState(createTestRng(TEST_SEED));  // No RNG provided
=======
      // createDefaultInitialState(createSeededRng(12345), 'historical');  // No RNG provided
>>>>>>> Stashed changes
      //
      // But since RNG is required (rng: () => number), this won't compile.
      // The runtime assertion ensures it also fails at runtime.

      assert.throws(
        () => createDefaultInitialState(undefined as any),
        /RNG.*required/i,
        'RNG must be required parameter (not optional with fallback)'
      );
    });
  });
});
