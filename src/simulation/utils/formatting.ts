/**
 * Population Display Formatting Utilities
 *
 * Converts actual population counts to human-readable formats.
 * Population stored as integers (8136000000) for precision.
 */

/**
 * Format population count as billions with 3 decimal places
 * @param population - Actual count (e.g., 8136000000)
 * @returns Formatted string (e.g., "8.136B")
 */
export function formatPopulationBillions(population: number): string {
  const billions = population / 1_000_000_000;
  return `${billions.toFixed(3)}B`;
}

/**
 * Format population count as millions with 2 decimal places
 * @param population - Actual count (e.g., 1677000000)
 * @returns Formatted string (e.g., "1677.00M")
 */
export function formatPopulationMillions(population: number): string {
  const millions = population / 1_000_000;
  return `${millions.toFixed(2)}M`;
}

/**
 * Format population with appropriate scale (billions/millions/thousands)
 * @param population - Actual count
 * @returns Formatted string with scale
 */
export function formatPopulationAuto(population: number): string {
  if (population >= 1_000_000_000) {
    return formatPopulationBillions(population);
  } else if (population >= 1_000_000) {
    return formatPopulationMillions(population);
  } else if (population >= 1_000) {
    const thousands = population / 1_000;
    return `${thousands.toFixed(1)}K`;
  } else {
    return population.toString();
  }
}

/**
 * Format population with comma separators
 * @param population - Actual count
 * @returns Formatted string (e.g., "8,136,000,000")
 */
export function formatPopulationCommas(population: number): string {
  return population.toLocaleString('en-US');
}
