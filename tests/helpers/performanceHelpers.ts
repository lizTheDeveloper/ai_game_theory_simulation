/**
 * Performance Test Helpers
 *
 * Utilities for writing performance regression tests that verify O(n) complexity
 * and catch O(n²) regressions.
 */

/**
 * Execute a function and measure its execution time
 * @returns Execution time in milliseconds
 */
export function measureExecutionTime(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

/**
 * Assert execution time is under threshold
 */
export function assertExecutionTimeUnder(
  executionTime: number,
  threshold: number,
  description: string
): void {
  console.log(`    ⏱️  ${description}: ${executionTime.toFixed(2)}ms (threshold: ${threshold}ms)`);

  if (executionTime >= threshold) {
    throw new Error(
      `Performance regression: ${description} took ${executionTime.toFixed(2)}ms, expected <${threshold}ms`
    );
  }
}

/**
 * Verify O(n) complexity by comparing execution times at different scales
 *
 * @param smallN - Small input size
 * @param largeN - Large input size (should be 10x smallN)
 * @param smallFn - Function with small input
 * @param largeFn - Function with large input
 * @param maxRatio - Maximum allowed time ratio (default 15 = allows some overhead)
 *
 * Example: If smallN=100 and largeN=1000 (10x), O(n) should take ~10x longer.
 * O(n²) would take ~100x longer. We allow up to 15x for overhead/caching.
 */
export function assertLinearComplexity(
  smallN: number,
  largeN: number,
  smallFn: () => void,
  largeFn: () => void,
  maxRatio: number = 15
): void {
  const smallTime = measureExecutionTime(smallFn);
  const largeTime = measureExecutionTime(largeFn);

  const ratio = largeTime / smallTime;
  const expectedRatio = largeN / smallN;

  console.log(`    📊 Complexity check:`);
  console.log(`       Small (n=${smallN}): ${smallTime.toFixed(2)}ms`);
  console.log(`       Large (n=${largeN}): ${largeTime.toFixed(2)}ms`);
  console.log(`       Ratio: ${ratio.toFixed(2)}x (expected ~${expectedRatio}x for O(n))`);

  // O(n²) would be ~100x for 10x input increase
  // O(n) should be ~10x
  // Allow up to maxRatio for overhead
  if (ratio >= maxRatio) {
    throw new Error(
      `Performance regression: Complexity appears to be O(n²) not O(n). ` +
      `Ratio: ${ratio.toFixed(2)}x, expected <${maxRatio}x for O(n)`
    );
  }
}
