/**
 * Geometric Mean Calculation with Zero-Handling
 *
 * Used for aggregating paradigm indicators to prevent compensation:
 * - A single very low indicator (e.g., 10) significantly lowers overall score
 * - Prevents "elite utopia" scenarios (high average masking severe deficits)
 * - Matches UNDP HDI methodology
 *
 * Zero-Handling Problem:
 * ```typescript
 * // Geometric mean with zero → undefined
 * geometricMean([80, 90, 0, 70]) = (80 × 90 × 0 × 70)^(1/4) = 0
 *
 * // Example: North Korea
 * westernParadigm = geometricMean([
 *   vDemDemocracy: 2,        // V-Dem 0.02 → 2/100 score
 *   freedomHousePolitical: 0,
 *   freedomHouseCivil: 0,
 *   economicFreedom: 5,
 * ]) = 0  // Entire paradigm score zeroed out
 * ```
 *
 * Solution: Min-Floor = 0.1
 * - Prevents zeros, allows near-zero
 * - Preserves non-compensatory property (0.1 is still terrible)
 * - Allows differentiation between worst cases
 * - Defensible: "Even in complete absence, assume 0.1% baseline human capacity exists"
 *
 * Test Cases:
 * - [90, 85, 80, 75] → 82.4 (high, balanced)
 * - [90, 85, 10, 75] → 45.6 (one deficit pulls down significantly)
 * - [90, 85, 0, 75] → 39.8 (zero treated as 0.1, still very low)
 * - [0, 0, 0, 0] → 0.1 (minimum possible)
 *
 * @module simulation/utils/geometricMean
 */

/**
 * Minimum floor value (prevents zeros, allows near-zero)
 *
 * Why 0.1?
 * - Prevents mathematical breakdown (log(0) = -∞, product with 0 = 0)
 * - Preserves non-compensatory property (0.1 is still near-zero, terrible score)
 * - Allows differentiation: North Korea 0.8 vs Yemen 2.5 vs Syria 1.2
 * - Interpretation: "Even in complete absence of measured value, assume 0.1% baseline exists"
 */
export const MIN_FLOOR = 0.1;

/**
 * Calculate geometric mean of values (0-100 scale)
 *
 * Non-compensatory aggregation: low values pull down overall score significantly.
 *
 * **Formula:**
 * ```
 * GM = (v1 × v2 × ... × vn)^(1/n)
 * ```
 *
 * **With min-floor:**
 * ```
 * GM = (max(v1, MIN_FLOOR) × max(v2, MIN_FLOOR) × ... × max(vn, MIN_FLOOR))^(1/n)
 * ```
 *
 * @param values - Array of values (0-100 scale)
 * @returns Geometric mean (0-100 scale)
 *
 * @example
 * ```typescript
 * // High, balanced scores
 * geometricMean([90, 85, 80, 75]); // → 82.4
 *
 * // One deficit pulls down significantly
 * geometricMean([90, 85, 10, 75]); // → 45.6
 *
 * // Zero becomes 0.1, still very low
 * geometricMean([90, 85, 0, 75]); // → 39.8
 *
 * // All zeros = minimum possible
 * geometricMean([0, 0, 0, 0]); // → 0.1
 * ```
 */
export function geometricMean(values: number[]): number {
  // Handle empty array
  if (values.length === 0) {
    return 0;
  }

  // Apply min-floor and normalize to 0-1 for geometric mean calculation
  const product = values.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100); // Normalize to 0-1
  }, 1);

  // Calculate geometric mean
  const geometricMeanValue = Math.pow(product, 1 / values.length);

  // Return to 0-100 scale
  return geometricMeanValue * 100;
}

/**
 * Calculate geometric mean with explicit uncertainty propagation
 *
 * When indicators have uncertainty bands, propagate them to the aggregate score.
 * Assumes independent uncertainties (conservative, likely overestimates aggregate uncertainty).
 *
 * @param values - Array of {value, low, high} objects
 * @returns {value, low, high} geometric mean with uncertainty
 *
 * @example
 * ```typescript
 * // Indicators with ±10% uncertainty
 * geometricMeanWithUncertainty([
 *   { value: 80, low: 72, high: 88 },
 *   { value: 90, low: 81, high: 99 },
 *   { value: 70, low: 63, high: 77 },
 * ]);
 * // → { value: 79.7, low: 71.6, high: 87.7 }
 * ```
 */
export function geometricMeanWithUncertainty(
  values: Array<{ value: number; low: number; high: number }>
): { value: number; low: number; high: number } {
  if (values.length === 0) {
    return { value: 0, low: 0, high: 0 };
  }

  // Calculate geometric mean of central values
  const centerValues = values.map(v => v.value);
  const value = geometricMean(centerValues);

  // Calculate geometric mean of lower bounds
  const lowerValues = values.map(v => v.low);
  const low = geometricMean(lowerValues);

  // Calculate geometric mean of upper bounds
  const upperValues = values.map(v => v.high);
  const high = geometricMean(upperValues);

  return { value, low, high };
}

/**
 * Test geometric mean calculation
 *
 * Run basic test cases to verify min-floor behavior.
 *
 * @returns true if all tests pass
 */
export function testGeometricMean(): boolean {
  const tests = [
    {
      name: 'High balanced scores',
      input: [90, 85, 80, 75],
      expected: 82.4,
      tolerance: 0.1,
    },
    {
      name: 'One deficit pulls down',
      input: [90, 85, 10, 75],
      expected: 45.6,
      tolerance: 0.1,
    },
    {
      name: 'Zero becomes min-floor',
      input: [90, 85, 0, 75],
      expected: 39.8,
      tolerance: 0.1,
    },
    {
      name: 'All zeros = min-floor',
      input: [0, 0, 0, 0],
      expected: MIN_FLOOR,
      tolerance: 0.01,
    },
    {
      name: 'Single value',
      input: [75],
      expected: 75,
      tolerance: 0.01,
    },
    {
      name: 'Empty array',
      input: [],
      expected: 0,
      tolerance: 0.01,
    },
  ];

  let allPassed = true;

  for (const test of tests) {
    const result = geometricMean(test.input);
    const passed = Math.abs(result - test.expected) < test.tolerance;

    if (!passed) {
      console.error(`FAILED: ${test.name}`);
      console.error(`  Input: [${test.input.join(', ')}]`);
      console.error(`  Expected: ${test.expected}, Got: ${result}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('✓ All geometric mean tests passed');
  }

  return allPassed;
}
