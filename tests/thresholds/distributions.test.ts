/**
 * Unit Tests for Distribution Sampling Library
 *
 * Tests Phase 1A: Pure distribution functions with no threshold integration.
 *
 * Test categories:
 * 1. Determinism (same seed → same output)
 * 2. Range validation (output in expected range)
 * 3. Parameter validation (reject invalid inputs)
 * 4. Statistical properties (mean, variance, support)
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  sampleNormal,
  sampleBeta,
  sampleLogNormal,
  sampleTriangular,
  getDistributionStats,
} from '@/simulation/utils/distributions';
import type { RNGFunction } from '@/types/config';

/**
 * Simple LCG-based RNG for testing (same as SeededRandom in engine.ts)
 * Ensures deterministic tests without external dependencies
 */
class TestRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // Simple LCG (Linear Congruential Generator) - matches engine.ts
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
  }

  getFunction(): RNGFunction {
    return () => this.next();
  }
}

/**
 * Create deterministic RNG function for tests
 */
function createTestRNG(seedString: string): RNGFunction {
  // Convert string to number seed
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const rng = new TestRNG(Math.abs(hash));
  return rng.getFunction();
}

/**
 * Helper: Calculate sample mean
 */
function calculateMean(samples: number[]): number {
  return samples.reduce((sum, x) => sum + x, 0) / samples.length;
}

/**
 * Helper: Calculate sample standard deviation
 */
function calculateStdDev(samples: number[]): number {
  const mean = calculateMean(samples);
  const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;
  return Math.sqrt(variance);
}

/**
 * Helper: Calculate sample min and max
 */
function calculateRange(samples: number[]): { min: number; max: number } {
  return {
    min: Math.min(...samples),
    max: Math.max(...samples),
  };
}

describe('sampleNormal', () => {
  test('determinism: same seed produces same output', () => {
    const rng1 = createTestRNG('test-seed-1');
    const rng2 = createTestRNG('test-seed-1');

    const sample1 = sampleNormal(0, 1, rng1);
    const sample2 = sampleNormal(0, 1, rng2);

    assert.strictEqual(sample1, sample2, 'Same seed should produce identical samples');
  });

  test('produces finite numbers', () => {
    const rng = createTestRNG('test-seed-2');

    for (let i = 0; i < 100; i++) {
      const sample = sampleNormal(100, 15, rng);
      assert.ok(isFinite(sample), `Sample ${i} should be finite, got ${sample}`);
      assert.ok(!isNaN(sample), `Sample ${i} should not be NaN`);
    }
  });

  test('statistical properties: mean ≈ μ, stdDev ≈ σ (N=10,000)', () => {
    const rng = createTestRNG('test-seed-3');
    const mu = 100;
    const sigma = 15;
    const samples: number[] = [];

    for (let i = 0; i < 10000; i++) {
      samples.push(sampleNormal(mu, sigma, rng));
    }

    const sampleMean = calculateMean(samples);
    const sampleStdDev = calculateStdDev(samples);

    // Allow 5% error for statistical sampling
    assert.ok(
      Math.abs(sampleMean - mu) / mu < 0.05,
      `Mean should be ≈${mu}, got ${sampleMean.toFixed(2)}`
    );
    assert.ok(
      Math.abs(sampleStdDev - sigma) / sigma < 0.05,
      `StdDev should be ≈${sigma}, got ${sampleStdDev.toFixed(2)}`
    );
  });

  test('parameter validation: rejects stdDev ≤ 0', () => {
    const rng = createTestRNG('test-seed-4');

    assert.throws(
      () => sampleNormal(0, 0, rng),
      /std.*must be > 0/,
      'Should reject stdDev = 0'
    );

    assert.throws(
      () => sampleNormal(0, -1, rng),
      /std.*must be > 0/,
      'Should reject negative stdDev'
    );
  });

  test('parameter validation: rejects NaN', () => {
    const rng = createTestRNG('test-seed-5');

    assert.throws(
      () => sampleNormal(NaN, 1, rng),
      /Non-finite value/,
      'Should reject NaN mean'
    );

    assert.throws(
      () => sampleNormal(0, Infinity, rng),
      /Non-finite value/,
      'Should reject Infinity stdDev'
    );
  });
});

describe('sampleBeta', () => {
  test('determinism: same seed produces same output', () => {
    const rng1 = createTestRNG('test-seed-beta-1');
    const rng2 = createTestRNG('test-seed-beta-1');

    const sample1 = sampleBeta(2, 5, 0, 1, rng1);
    const sample2 = sampleBeta(2, 5, 0, 1, rng2);

    assert.strictEqual(sample1, sample2, 'Same seed should produce identical samples');
  });

  test('produces values in [0, 1]', () => {
    const rng = createTestRNG('test-seed-beta-2');

    for (let i = 0; i < 1000; i++) {
      const sample = sampleBeta(2, 5, 0, 1, rng);
      assert.ok(sample >= 0 && sample <= 1, `Sample ${i} should be in [0,1], got ${sample}`);
      assert.ok(isFinite(sample), `Sample ${i} should be finite`);
    }
  });

  test('statistical properties: uniform when α=β=1', () => {
    const rng = createTestRNG('test-seed-beta-3');
    const samples: number[] = [];

    // Beta(1, 1) is uniform [0, 1]
    for (let i = 0; i < 10000; i++) {
      samples.push(sampleBeta(1, 1, 0, 1, rng));
    }

    const mean = calculateMean(samples);
    const range = calculateRange(samples);

    // Uniform [0,1] has mean = 0.5
    assert.ok(
      Math.abs(mean - 0.5) < 0.05,
      `Beta(1,1) mean should be ≈0.5, got ${mean.toFixed(3)}`
    );

    // Should cover full range
    assert.ok(range.min < 0.1, 'Should sample near 0');
    assert.ok(range.max > 0.9, 'Should sample near 1');
  });

  test('statistical properties: left-skewed when α < β', () => {
    const rng = createTestRNG('test-seed-beta-4');
    const samples: number[] = [];

    // Beta(2, 5) is left-skewed, mode = (2-1)/(2+5-2) = 1/5 = 0.2
    for (let i = 0; i < 10000; i++) {
      samples.push(sampleBeta(2, 5, 0, 1, rng));
    }

    const mean = calculateMean(samples);

    // Beta(α, β) has mean = α/(α+β) = 2/7 ≈ 0.286
    const expectedMean = 2 / 7;
    assert.ok(
      Math.abs(mean - expectedMean) < 0.05,
      `Beta(2,5) mean should be ≈${expectedMean.toFixed(3)}, got ${mean.toFixed(3)}`
    );
  });

  test('parameter validation: rejects alpha ≤ 0', () => {
    const rng = createTestRNG('test-seed-beta-5');

    assert.throws(
      () => sampleBeta(0, 1, 0, 1, rng),
      /Non-finite value|alpha.*must be|beta.*must be/,
      'Should reject alpha = 0'
    );

    assert.throws(
      () => sampleBeta(-1, 1, 0, 1, rng),
      /Non-finite value|alpha.*must be|beta.*must be/,
      'Should reject negative alpha'
    );
  });

  test('parameter validation: rejects beta ≤ 0', () => {
    const rng = createTestRNG('test-seed-beta-6');

    assert.throws(
      () => sampleBeta(1, 0, 0, 1, rng),
      /Non-finite value|alpha.*must be|beta.*must be/,
      'Should reject beta = 0'
    );

    assert.throws(
      () => sampleBeta(1, -1, 0, 1, rng),
      /Non-finite value|alpha.*must be|beta.*must be/,
      'Should reject negative beta'
    );
  });

  test('parameter validation: rejects NaN/Infinity', () => {
    const rng = createTestRNG('test-seed-beta-7');

    assert.throws(
      () => sampleBeta(NaN, 1, 0, 1, rng),
      /Non-finite value|alpha.*must be|beta.*must be/,
      'Should reject NaN alpha'
    );

    // Note: Infinity is mathematically valid for beta distribution
    // Beta(1, Infinity) returns 0 (degenerate distribution at lower bound)
    // So we only test NaN rejection here
  });
});

describe('sampleLogNormal', () => {
  test('determinism: same seed produces same output', () => {
    const rng1 = createTestRNG('test-seed-ln-1');
    const rng2 = createTestRNG('test-seed-ln-1');

    const sample1 = sampleLogNormal(0, 1, rng1);
    const sample2 = sampleLogNormal(0, 1, rng2);

    assert.strictEqual(sample1, sample2, 'Same seed should produce identical samples');
  });

  test('produces positive values only', () => {
    const rng = createTestRNG('test-seed-ln-2');

    for (let i = 0; i < 1000; i++) {
      const sample = sampleLogNormal(0, 1, rng);
      assert.ok(sample > 0, `Sample ${i} should be positive, got ${sample}`);
      assert.ok(isFinite(sample), `Sample ${i} should be finite`);
    }
  });

  test('statistical properties: median = exp(μ)', () => {
    const rng = createTestRNG('test-seed-ln-3');
    const mu = Math.log(1.5); // Median = 1.5
    const sigma = 0.3;
    const samples: number[] = [];

    for (let i = 0; i < 10000; i++) {
      samples.push(sampleLogNormal(mu, sigma, rng));
    }

    // Calculate median
    const sortedSamples = samples.slice().sort((a, b) => a - b);
    const median = sortedSamples[Math.floor(sortedSamples.length / 2)];

    const expectedMedian = Math.exp(mu); // 1.5
    assert.ok(
      Math.abs(median - expectedMedian) / expectedMedian < 0.05,
      `Median should be ≈${expectedMedian.toFixed(3)}, got ${median.toFixed(3)}`
    );
  });

  test('parameter validation: rejects sigma ≤ 0', () => {
    const rng = createTestRNG('test-seed-ln-4');

    assert.throws(
      () => sampleLogNormal(0, 0, rng),
      /stdLog.*must be > 0/,
      'Should reject sigma = 0'
    );

    assert.throws(
      () => sampleLogNormal(0, -1, rng),
      /stdLog.*must be > 0/,
      'Should reject negative sigma'
    );
  });

  test('parameter validation: rejects NaN/Infinity', () => {
    const rng = createTestRNG('test-seed-ln-5');

    assert.throws(
      () => sampleLogNormal(NaN, 1, rng),
      /Non-finite value/,
      'Should reject NaN mu'
    );

    assert.throws(
      () => sampleLogNormal(0, Infinity, rng),
      /Non-finite value/,
      'Should reject Infinity sigma'
    );
  });
});

describe('sampleTriangular', () => {
  test('determinism: same seed produces same output', () => {
    const rng1 = createTestRNG('test-seed-tri-1');
    const rng2 = createTestRNG('test-seed-tri-1');

    const sample1 = sampleTriangular(7.6, 7.8, 8.0, rng1);
    const sample2 = sampleTriangular(7.6, 7.8, 8.0, rng2);

    assert.strictEqual(sample1, sample2, 'Same seed should produce identical samples');
  });

  test('produces values in [min, max]', () => {
    const rng = createTestRNG('test-seed-tri-2');
    const min = 7.6;
    const mode = 7.8;
    const max = 8.0;

    for (let i = 0; i < 1000; i++) {
      const sample = sampleTriangular(min, mode, max, rng);
      assert.ok(
        sample >= min && sample <= max,
        `Sample ${i} should be in [${min}, ${max}], got ${sample}`
      );
      assert.ok(isFinite(sample), `Sample ${i} should be finite`);
    }
  });

  test('statistical properties: mode is most common value region', () => {
    const rng = createTestRNG('test-seed-tri-3');
    const min = 0;
    const mode = 0.7;
    const max = 1;
    const samples: number[] = [];

    for (let i = 0; i < 10000; i++) {
      samples.push(sampleTriangular(min, mode, max, rng));
    }

    // Count samples in bins around mode
    const binSize = 0.1;
    const bins: number[] = new Array(10).fill(0);

    for (const sample of samples) {
      const binIndex = Math.min(9, Math.floor(sample / binSize));
      bins[binIndex]++;
    }

    // Mode at 0.7 means bin 7 [0.7, 0.8) should have highest count
    const modeBinIndex = Math.floor(mode / binSize);
    const modeBinCount = bins[modeBinIndex];

    // Check that mode bin has highest or second-highest count
    const sortedBins = bins.slice().sort((a, b) => b - a);
    assert.ok(
      modeBinCount >= sortedBins[1],
      `Mode bin should be in top 2, got counts: ${bins.join(', ')}`
    );
  });

  test('statistical properties: mean ≈ (min + mode + max)/3', () => {
    const rng = createTestRNG('test-seed-tri-4');
    const min = 0;
    const mode = 0.7;
    const max = 1;
    const samples: number[] = [];

    for (let i = 0; i < 10000; i++) {
      samples.push(sampleTriangular(min, mode, max, rng));
    }

    const mean = calculateMean(samples);
    const expectedMean = (min + mode + max) / 3;

    assert.ok(
      Math.abs(mean - expectedMean) < 0.05,
      `Mean should be ≈${expectedMean.toFixed(3)}, got ${mean.toFixed(3)}`
    );
  });

  test('parameter validation: rejects min ≥ mode', () => {
    const rng = createTestRNG('test-seed-tri-5');

    assert.throws(
      () => sampleTriangular(0.6, 0.5, 1, rng),
      /Invalid triangular|min.*<=.*mode/,
      'Should reject min > mode'
    );

    assert.throws(
      () => sampleTriangular(0.8, 0.7, 1, rng),
      /Invalid triangular|min.*<=.*mode/,
      'Should reject min > mode'
    );
  });

  test('parameter validation: rejects mode ≥ max', () => {
    const rng = createTestRNG('test-seed-tri-6');

    assert.throws(
      () => sampleTriangular(0, 1.1, 1, rng),
      /Invalid triangular|mode.*<=.*max/,
      'Should reject mode > max'
    );

    assert.throws(
      () => sampleTriangular(0, 1.1, 1, rng),
      /Invalid triangular|mode.*<=.*max/,
      'Should reject mode > max'
    );
  });

  test('parameter validation: rejects NaN/Infinity', () => {
    const rng = createTestRNG('test-seed-tri-7');

    assert.throws(
      () => sampleTriangular(NaN, 0.5, 1, rng),
      /Non-finite value/,
      'Should reject NaN min'
    );

    assert.throws(
      () => sampleTriangular(0, Infinity, 1, rng),
      /Non-finite value/,
      'Should reject Infinity mode'
    );
  });
});

describe('getDistributionStats', () => {
  test('formats normal distribution stats', () => {
    const stats = getDistributionStats('normal', { mean: 1.5, stdDev: 0.3 });
    assert.strictEqual(stats, 'Normal(μ=1.50, σ=0.30)');
  });

  test('formats beta distribution stats', () => {
    const stats = getDistributionStats('beta', { alpha: 2, beta: 5 });
    assert.strictEqual(stats, 'Beta(α=2.00, β=5.00)');
  });

  test('formats log-normal distribution stats', () => {
    const stats = getDistributionStats('lognormal', { mu: 0.4, sigma: 0.2 });
    assert.strictEqual(stats, 'LogNormal(μ=0.40, σ=0.20)');
  });

  test('formats triangular distribution stats', () => {
    const stats = getDistributionStats('triangular', { min: 7.6, mode: 7.8, max: 8.0 });
    assert.strictEqual(stats, 'Triangular(min=7.60, mode=7.80, max=8.00)');
  });
});
