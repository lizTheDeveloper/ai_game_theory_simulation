/**
 * Mathematical utility functions
 *
 * Common math operations used across the simulation engine.
 * Extracted from duplicated implementations in Phase 1 refactoring.
 */

/**
 * Clamp a value between min and max bounds
 *
 * @param value - The value to clamp
 * @param min - Minimum bound (inclusive)
 * @param max - Maximum bound (inclusive)
 * @returns Value constrained to [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate linear interpolation between two values
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1, automatically clamped)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Calculate inverse lerp (where x falls in range [a, b])
 *
 * @param a - Start of range
 * @param b - End of range
 * @param x - Value to find position of
 * @returns Position in range as 0-1 value
 */
export function inverseLerp(a: number, b: number, x: number): number {
  return clamp((x - a) / (b - a), 0, 1);
}

/**
 * Map value from one range to another
 *
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value in output range
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/**
 * Calculate weighted average
 *
 * @param values - Array of [value, weight] tuples
 * @returns Weighted average
 */
export function weightedAverage(values: [number, number][]): number {
  const totalWeight = values.reduce((sum, [_, weight]) => sum + weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, [value, weight]) => sum + value * weight, 0);
  return weightedSum / totalWeight;
}
