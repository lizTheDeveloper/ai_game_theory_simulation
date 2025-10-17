/**
 * Lévy Flight Distributions - Fat-Tailed Randomness
 *
 * Replaces Gaussian/uniform randomness with power-law distributions
 * to model real-world systems where extreme events are more common
 * than normal distributions predict.
 *
 * Research Foundation:
 * - Clauset et al. (2009): Power laws in empirical data
 * - Bak et al. (1987): Self-organized criticality
 * - Mantegna & Stanley (1994): Lévy flights in finance
 * - Brockmann et al. (2006): Human mobility patterns
 *
 * Date: October 17, 2025
 */

export type RNGFunction = () => number;

/**
 * Alpha parameter guidelines:
 * - 1.5: Very fat tails (financial crashes, mega-disasters)
 * - 1.8: Fat tails (environmental cascades, social movements)
 * - 2.0: Moderate fat tails (AI breakthroughs, tech adoption)
 * - 2.5: Less extreme tails (gradual with rare bursts)
 * - 3.0+: Converges to Gaussian (defeats purpose)
 */
export const ALPHA_PRESETS = {
  FINANCIAL_CRASH: 1.5,
  ENVIRONMENTAL_CASCADE: 1.8,
  SOCIAL_MOVEMENT: 1.8,
  AI_BREAKTHROUGH: 2.0,
  TECH_ADOPTION: 2.5,
} as const;

/**
 * Generates a Lévy flight random value with power-law tail distribution.
 *
 * Lévy flights produce fat-tailed distributions where extreme events
 * occur more frequently than in Gaussian distributions.
 *
 * @param alpha - Tail exponent (1.5-3.0)
 *   - alpha = 1.5: Very fat tails (extreme events common) - financial crashes
 *   - alpha = 2.0: Moderate fat tails (occasional breakthroughs) - AI capabilities
 *   - alpha = 2.5: Less extreme (rare rapid adoption) - technology diffusion
 *   - alpha > 3.0: Converges to Gaussian (not what we want)
 * @param rng - Random number generator function (for deterministic seeding)
 * @returns Random value from Lévy distribution
 *
 * Research: Mantegna & Stanley (1994), Clauset et al. (2009)
 */
export function levyFlight(alpha: number, rng: RNGFunction): number {
  // Validate alpha range
  if (alpha < 1.0 || alpha > 3.0) {
    console.warn(`levyFlight: alpha=${alpha} outside recommended range [1.0, 3.0]`);
  }

  // Pareto distribution: P(x) ~ x^(-alpha)
  // Inverse transform sampling: x = u^(-1/alpha)
  const u = rng();

  // Ensure u > 0 to avoid division by zero
  const safeU = Math.max(u, 1e-10);

  return Math.pow(safeU, -1 / alpha);
}

/**
 * Bounded Lévy flight for use in probabilities/multipliers.
 * Maps Lévy output to [min, max] range.
 *
 * @param alpha - Tail exponent (1.5-3.0)
 * @param rng - Random number generator function
 * @param min - Minimum output value
 * @param max - Maximum output value
 * @returns Bounded value in [min, max] range
 */
export function boundedLevyFlight(
  alpha: number,
  rng: RNGFunction,
  min: number,
  max: number
): number {
  const levy = levyFlight(alpha, rng);

  // Normalize to [0, 1] range using sigmoid-like transformation
  const normalized = 1 - Math.exp(-levy / 10);

  // Scale to [min, max]
  return min + normalized * (max - min);
}

/**
 * Power-law sampler for discrete events (e.g., breakthrough detection).
 * Returns true with probability proportional to power-law tail.
 *
 * @param alpha - Tail exponent (1.5-3.0)
 * @param threshold - Event occurs when levy > threshold
 * @param rng - Random number generator function
 * @returns True if extreme event occurs
 */
export function powerLawEvent(
  alpha: number,
  threshold: number,
  rng: RNGFunction
): boolean {
  const levy = levyFlight(alpha, rng);
  return levy > threshold;
}

/**
 * Lévy-modified S-curve for technology adoption.
 * Combines deterministic S-curve with stochastic fat-tail variation.
 *
 * @param baseAdoption - Deterministic adoption rate (0-1)
 * @param alpha - Tail exponent (typically 2.5 for tech adoption)
 * @param rng - Random number generator function
 * @returns Modified adoption rate (0-1)
 */
export function levyAdoptionCurve(
  baseAdoption: number,
  alpha: number,
  rng: RNGFunction
): number {
  const levyModifier = boundedLevyFlight(alpha, rng, 0.8, 1.5);
  return Math.min(baseAdoption * levyModifier, 1.0);
}
