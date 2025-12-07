/**
 * Unit Tests: Distribution Sampling Library (M-5, Dec 7, 2025)
 *
 * Tests for probabilistic threshold sampling functions.
 *
 * Focus: Beta distribution (M-5 Quality Gate 1 critical addition)
 *
 * Research: Armstrong McKay et al. (2022) Science - Tipping threshold uncertainty
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sampleBeta,
  sampleTriangular,
  sampleUniform,
  sampleNormal,
  sampleDistribution,
  DistributionParams
} from '../../src/simulation/utils/distributions';

/**
 * Helper: Create deterministic RNG from seed
 * Simple LCG (Linear Congruential Generator) for deterministic testing
 */
function createSeededRNG(seed: number | string): () => number {
  let state = typeof seed === 'number' ? seed : 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      state = ((state << 5) - state + seed.charCodeAt(i)) | 0;
    }
  }
  state = Math.abs(state);

  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

describe('Distribution Sampling Library (M-5)', () => {
  describe('sampleBeta', () => {
    test('samples within [min, max] range', () => {
      const rng = createSeededRNG(42);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const value = sampleBeta(2, 5, 1.4, 8.0, rng);
        samples.push(value);
      }

      // All samples should be in [1.4, 8.0]
      const min = Math.min(...samples);
      const max = Math.max(...samples);
      assert.ok(min >= 1.4, `Min ${min} should be >= 1.4`);
      assert.ok(max <= 8.0, `Max ${max} should be <= 8.0`);
    });

    test('deterministic with same seed', () => {
      const rng1 = createSeededRNG(999);
      const rng2 = createSeededRNG(999);

      const samples1: number[] = [];
      const samples2: number[] = [];

      for (let i = 0; i < 10; i++) {
        samples1.push(sampleBeta(2, 5, 1.4, 8.0, rng1));
        samples2.push(sampleBeta(2, 5, 1.4, 8.0, rng2));
      }

      // Same seed should produce identical sequences
      assert.deepEqual(samples1, samples2);
    });

    test('throws error if RNG missing', () => {
      assert.throws(() => {
        sampleBeta(2, 5, 1.4, 8.0, null as any);
      }, /RNG required/);
    });

    test('throws error if alpha <= 0', () => {
      const rng = createSeededRNG(1);
      assert.throws(() => {
        sampleBeta(0, 5, 1.4, 8.0, rng);
      }, /alpha/);
    });

    test('throws error if beta <= 0', () => {
      const rng = createSeededRNG(1);
      assert.throws(() => {
        sampleBeta(2, 0, 1.4, 8.0, rng);
      }, /beta/);
    });

    test('throws error if min >= max', () => {
      const rng = createSeededRNG(1);
      assert.throws(() => {
        sampleBeta(2, 5, 8.0, 1.4, rng);
      }, /min/);
    });

    test('Beta(1,1) equivalent to uniform', () => {
      const rng1 = createSeededRNG(777);
      const rng2 = createSeededRNG(777);

      const betaSamples: number[] = [];
      const uniformSamples: number[] = [];

      for (let i = 0; i < 10; i++) {
        betaSamples.push(sampleBeta(1, 1, 0, 10, rng1));
        uniformSamples.push(sampleUniform(0, 10, rng2));
      }

      // Beta(1,1) should produce same samples as uniform
      assert.deepEqual(betaSamples, uniformSamples);
    });
  });

  describe('sampleTriangular', () => {
    test('samples within [min, max] range', () => {
      const rng = createSeededRNG(42);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const value = sampleTriangular(0.8, 1.5, 3.4, rng);
        samples.push(value);
      }

      const min = Math.min(...samples);
      const max = Math.max(...samples);
      assert.ok(min >= 0.8, `Min ${min} should be >= 0.8`);
      assert.ok(max <= 3.4, `Max ${max} should be <= 3.4`);
    });

    test('deterministic with same seed', () => {
      const rng1 = createSeededRNG(999);
      const rng2 = createSeededRNG(999);

      const samples1: number[] = [];
      const samples2: number[] = [];

      for (let i = 0; i < 10; i++) {
        samples1.push(sampleTriangular(2.0, 3.5, 6.0, rng1));
        samples2.push(sampleTriangular(2.0, 3.5, 6.0, rng2));
      }

      assert.deepEqual(samples1, samples2);
    });

    test('throws error if RNG missing', () => {
      assert.throws(() => {
        sampleTriangular(2.0, 3.5, 6.0, null as any);
      }, /RNG required/);
    });
  });

  describe('sampleUniform', () => {
    test('samples within [min, max] range', () => {
      const rng = createSeededRNG(42);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const value = sampleUniform(1.4, 8.0, rng);
        samples.push(value);
      }

      const min = Math.min(...samples);
      const max = Math.max(...samples);
      assert.ok(min >= 1.4, `Min ${min} should be >= 1.4`);
      assert.ok(max <= 8.0, `Max ${max} should be <= 8.0`);
    });

    test('deterministic with same seed', () => {
      const rng1 = createSeededRNG(999);
      const rng2 = createSeededRNG(999);

      const samples1: number[] = [];
      const samples2: number[] = [];

      for (let i = 0; i < 10; i++) {
        samples1.push(sampleUniform(1.4, 8.0, rng1));
        samples2.push(sampleUniform(1.4, 8.0, rng2));
      }

      assert.deepEqual(samples1, samples2);
    });

    test('throws error if RNG missing', () => {
      assert.throws(() => {
        sampleUniform(1.4, 8.0, null as any);
      }, /RNG required/);
    });
  });

  describe('sampleDistribution (type-safe wrapper)', () => {
    test('dispatches to beta correctly', () => {
      const rng = createSeededRNG(42);
      const params: DistributionParams = {
        type: 'beta',
        alpha: 2,
        beta: 5,
        min: 1.4,
        max: 8.0
      };

      const value = sampleDistribution(params, rng);
      assert.ok(value >= 1.4 && value <= 8.0);
    });

    test('dispatches to triangular correctly', () => {
      const rng = createSeededRNG(42);
      const params: DistributionParams = {
        type: 'triangular',
        min: 0.8,
        mode: 1.5,
        max: 3.4
      };

      const value = sampleDistribution(params, rng);
      assert.ok(value >= 0.8 && value <= 3.4);
    });

    test('dispatches to uniform correctly', () => {
      const rng = createSeededRNG(42);
      const params: DistributionParams = {
        type: 'uniform',
        min: 1.4,
        max: 8.0
      };

      const value = sampleDistribution(params, rng);
      assert.ok(value >= 1.4 && value <= 8.0);
    });
  });

  describe('Monte Carlo Reproducibility (M-5 critical requirement)', () => {
    test('identical seed produces identical N=10 sequence', () => {
      const seed = 12345;

      // Simulation 1
      const rng1 = createSeededRNG(seed);
      const run1_amoc: number[] = [];
      const run1_greenland: number[] = [];
      const run1_amazon: number[] = [];

      for (let i = 0; i < 10; i++) {
        run1_amoc.push(sampleBeta(2, 5, 1.4, 8.0, rng1));
        run1_greenland.push(sampleTriangular(0.8, 1.5, 3.4, rng1));
        run1_amazon.push(sampleTriangular(2.0, 3.5, 6.0, rng1));
      }

      // Simulation 2 (same seed)
      const rng2 = createSeededRNG(seed);
      const run2_amoc: number[] = [];
      const run2_greenland: number[] = [];
      const run2_amazon: number[] = [];

      for (let i = 0; i < 10; i++) {
        run2_amoc.push(sampleBeta(2, 5, 1.4, 8.0, rng2));
        run2_greenland.push(sampleTriangular(0.8, 1.5, 3.4, rng2));
        run2_amazon.push(sampleTriangular(2.0, 3.5, 6.0, rng2));
      }

      // Perfect reproducibility required
      assert.deepEqual(run1_amoc, run2_amoc);
      assert.deepEqual(run1_greenland, run2_greenland);
      assert.deepEqual(run1_amazon, run2_amazon);
    });

    test('different seeds produce different sequences', () => {
      const rng1 = createSeededRNG(111);
      const rng2 = createSeededRNG(222);

      const samples1: number[] = [];
      const samples2: number[] = [];

      for (let i = 0; i < 10; i++) {
        samples1.push(sampleBeta(2, 5, 1.4, 8.0, rng1));
        samples2.push(sampleBeta(2, 5, 1.4, 8.0, rng2));
      }

      // Different seeds should produce different values
      assert.notDeepEqual(samples1, samples2);
    });
  });
});
