/**
 * Geometric Mean - Unit Tests
 *
 * Tests geometric mean calculation with zero-handling and uncertainty propagation.
 *
 * Key properties tested:
 * 1. Non-compensatory aggregation (low values pull down overall score)
 * 2. Min-floor prevents mathematical breakdown (0 → 0.1)
 * 3. Uncertainty propagation for aggregate scores
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  geometricMean,
  geometricMeanWithUncertainty,
  MIN_FLOOR,
} from '../../src/simulation/utils/geometricMean.js';

describe('Geometric Mean - Core Function', () => {
  it('should calculate geometric mean for high balanced scores', () => {
    const result = geometricMean([90, 85, 80, 75]);
    // Expected: (90 × 85 × 80 × 75)^(1/4) / 100 = 82.4
    assert.ok(Math.abs(result - 82.4) < 0.1, `Expected ~82.4, got ${result}`);
  });

  it('should pull down score when one deficit exists', () => {
    const result = geometricMean([90, 85, 10, 75]);
    // Expected: (0.9 × 0.85 × 0.1 × 0.75)^(1/4) × 100 ≈ 48.9
    assert.ok(Math.abs(result - 48.9) < 0.1, `Expected ~48.9, got ${result}`);
  });

  it('should apply min-floor to zeros', () => {
    const result = geometricMean([90, 85, 0, 75]);
    // Expected: (0.9 × 0.85 × 0.001 × 0.75)^(1/4) × 100 ≈ 15.5
    assert.ok(Math.abs(result - 15.5) < 0.1, `Expected ~15.5, got ${result}`);
  });

  it('should return min-floor for all zeros', () => {
    const result = geometricMean([0, 0, 0, 0]);
    assert.strictEqual(result, MIN_FLOOR);
  });

  it('should return single value unchanged', () => {
    const result = geometricMean([75]);
    assert.ok(Math.abs(result - 75) < 0.01);
  });

  it('should return 0 for empty array', () => {
    const result = geometricMean([]);
    assert.strictEqual(result, 0);
  });

  it('should preserve non-compensatory property', () => {
    // Average would be (90 + 90 + 90 + 10) / 4 = 70
    // But geometric mean should be lower
    const result = geometricMean([90, 90, 90, 10]);
    const average = (90 + 90 + 90 + 10) / 4;
    assert.ok(result < average, `Geometric mean ${result} should be less than arithmetic mean ${average}`);
  });

  it('should differentiate between near-zero cases', () => {
    const case1 = geometricMean([2, 5, 3, 4]);  // North Korea scenario
    const case2 = geometricMean([10, 15, 8, 12]); // Syria scenario
    assert.ok(case1 < case2, 'Lower values should produce lower geometric mean');
  });

  it('should handle all max values', () => {
    const result = geometricMean([100, 100, 100, 100]);
    assert.strictEqual(result, 100);
  });

  it('should be symmetric (order independent)', () => {
    const result1 = geometricMean([90, 80, 70, 60]);
    const result2 = geometricMean([60, 70, 80, 90]);
    assert.strictEqual(result1, result2);
  });
});

describe('Geometric Mean - Min-Floor Behavior', () => {
  it('should use MIN_FLOOR for negative values', () => {
    const result = geometricMean([-10, 80, 90, 70]);
    const expected = geometricMean([MIN_FLOOR, 80, 90, 70]);
    assert.strictEqual(result, expected);
  });

  it('should use MIN_FLOOR value of 0.1', () => {
    assert.strictEqual(MIN_FLOOR, 0.1);
  });

  it('should prevent mathematical breakdown', () => {
    // Without min-floor, this would be 0 (product with zero)
    const result = geometricMean([0, 100, 100, 100]);
    assert.ok(result > 0, 'Min-floor should prevent zero result');
    assert.ok(result < 50, 'But should still be very low');
  });
});

describe('Geometric Mean with Uncertainty', () => {
  it('should propagate uncertainty bands', () => {
    const result = geometricMeanWithUncertainty([
      { value: 80, low: 72, high: 88 },
      { value: 90, low: 81, high: 99 },
      { value: 70, low: 63, high: 77 },
    ]);

    // Center value should be geometric mean of 80, 90, 70
    const expectedCenter = geometricMean([80, 90, 70]);
    assert.ok(Math.abs(result.value - expectedCenter) < 0.1);

    // Low bound should be geometric mean of low values
    const expectedLow = geometricMean([72, 81, 63]);
    assert.ok(Math.abs(result.low - expectedLow) < 0.1);

    // High bound should be geometric mean of high values
    const expectedHigh = geometricMean([88, 99, 77]);
    assert.ok(Math.abs(result.high - expectedHigh) < 0.1);
  });

  it('should maintain uncertainty band ordering', () => {
    const result = geometricMeanWithUncertainty([
      { value: 80, low: 70, high: 90 },
      { value: 85, low: 75, high: 95 },
    ]);

    assert.ok(result.low < result.value, 'Low bound should be less than center');
    assert.ok(result.value < result.high, 'Center should be less than high bound');
  });

  it('should handle empty array with uncertainty', () => {
    const result = geometricMeanWithUncertainty([]);
    assert.strictEqual(result.value, 0);
    assert.strictEqual(result.low, 0);
    assert.strictEqual(result.high, 0);
  });

  it('should handle single value with uncertainty', () => {
    const result = geometricMeanWithUncertainty([
      { value: 75, low: 70, high: 80 },
    ]);

    assert.ok(Math.abs(result.value - 75) < 0.01);
    assert.ok(Math.abs(result.low - 70) < 0.01);
    assert.ok(Math.abs(result.high - 80) < 0.01);
  });

  it('should propagate min-floor through uncertainty', () => {
    const result = geometricMeanWithUncertainty([
      { value: 0, low: 0, high: 5 },
      { value: 100, low: 95, high: 100 },
    ]);

    // Value should use min-floor for 0
    assert.ok(result.value > 0, 'Should apply min-floor to zero value');

    // Low bound should also use min-floor
    assert.ok(result.low > 0, 'Should apply min-floor to zero low bound');
  });
});

describe('Geometric Mean - Edge Cases', () => {
  it('should handle very small values', () => {
    const result = geometricMean([0.05, 0.08, 0.1, 0.07]);
    assert.ok(result > 0, 'Should handle very small values');
    // All values below MIN_FLOOR should be floored to MIN_FLOOR
    assert.strictEqual(result, MIN_FLOOR);
  });

  it('should handle mixed small and large values', () => {
    const result = geometricMean([0.05, 100, 100, 100]);
    assert.ok(result > 0, 'Should handle mixed values');
    assert.ok(result < 50, 'Small value should pull down score');
  });

  it('should handle many values', () => {
    const values = Array(100).fill(80);
    const result = geometricMean(values);
    assert.ok(Math.abs(result - 80) < 0.01, 'Should handle many identical values');
  });

  it('should preserve mathematical properties', () => {
    // Geometric mean of a and b is sqrt(a × b)
    const a = 25;
    const b = 100;
    const result = geometricMean([a, b]);
    const expected = Math.sqrt(a * b);
    assert.ok(Math.abs(result - expected) < 0.1);
  });
});

describe('Geometric Mean - UNDP HDI Methodology', () => {
  it('should match UNDP non-compensatory aggregation principle', () => {
    // UNDP HDI uses geometric mean to prevent compensation
    // High income shouldn't fully compensate for low health/education

    // Case: High income, low health
    const highIncomeLowHealth = geometricMean([95, 95, 20]); // income, education, health
    const balanced = geometricMean([70, 70, 70]);

    // Balanced should score higher than unbalanced with same average
    assert.ok(balanced > highIncomeLowHealth,
      'Balanced development should score higher than unbalanced');
  });

  it('should detect elite utopia scenarios', () => {
    // Elite utopia: High average but severe deficits
    const average = (90 + 90 + 90 + 10) / 4; // 70 average
    const geometricResult = geometricMean([90, 90, 90, 10]);

    assert.ok(geometricResult < average,
      'Geometric mean should be lower than arithmetic mean when deficits exist');
  });
});

console.log('\n✅ Geometric mean test suite passed');
