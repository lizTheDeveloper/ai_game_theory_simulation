/**
 * Probability Distribution Sampling Library
 *
 * Deterministic sampling from probability distributions for Monte Carlo uncertainty modeling.
 * All functions require RNG parameter (no Math.random fallback) for reproducibility.
 *
 * Research Context (M-5: Threshold Uncertainty Modeling):
 * - Armstrong McKay et al. (2022) Science - Tipping point thresholds have uncertainty ranges
 * - Kriegler et al. (2009) PNAS - Bayesian probability assessment of tipping points
 * - Wunderling et al. (2025) ESD - Monte Carlo propagation of uncertainties
 *
 * Distribution Types:
 * - Triangular: Min/mode/max elicitation (expert judgment, Armstrong McKay format)
 * - Uniform: Epistemic uncertainty (genuinely don't know within range)
 * - Normal: Symmetric uncertainty around central estimate
 * - Log-normal: Skewed distributions (positive-only values)
 *
 * Created: December 7, 2025
 * Feature: M-5 Threshold Uncertainty Modeling
 */

import { assertFinite, assertInRange } from './assertions';

/**
 * Sample from triangular distribution
 *
 * Use case: Expert elicitation with min/mode/max estimates (Armstrong McKay 2022 format)
 *
 * Research: Common in climate tipping point literature where experts provide:
 * - Minimum (lower bound)
 * - Mode (most likely value)
 * - Maximum (upper bound)
 *
 * @param min Lower bound (must be < mode)
 * @param mode Most likely value (peak of distribution)
 * @param max Upper bound (must be > mode)
 * @param rng Deterministic RNG function (REQUIRED - no Math.random fallback)
 * @returns Sampled value in [min, max]
 *
 * @example
 * // Greenland Ice Sheet threshold (Armstrong McKay et al. 2022)
 * const threshold = sampleTriangular(0.8, 1.5, 3.4, rng);
 */
export function sampleTriangular(
  min: number,
  mode: number,
  max: number,
  rng: () => number
): number {
  // Validate RNG (fail loudly if missing)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate distribution parameters
  if (!(min <= mode && mode <= max)) {
    throw new Error(
      `❌ Invalid triangular distribution: min (${min}) <= mode (${mode}) <= max (${max}) required`
    );
  }

  if (min === max) {
    // Degenerate case: no uncertainty
    return min;
  }

  const u = rng();

  // Triangular CDF inversion method
  const fc = (mode - min) / (max - min);

  let value: number;
  if (u < fc) {
    // Left side of triangle
    value = min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    // Right side of triangle
    value = max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }

  // Validate output
  return assertInRange(value, min, max, {
    location: 'sampleTriangular',
    valueName: 'sampledValue',
    additionalInfo: { min, mode, max, u }
  });
}

/**
 * Sample from uniform distribution
 *
 * Use case: Epistemic uncertainty (no central tendency known within range)
 *
 * Research: Appropriate when literature shows fundamental disagreement (e.g., AMOC collapse:
 * "collapse in 2025-2095" vs "very unlikely this century") - uniform represents "we genuinely don't know"
 *
 * @param min Lower bound
 * @param max Upper bound (must be > min)
 * @param rng Deterministic RNG function (REQUIRED)
 * @returns Sampled value in [min, max]
 *
 * @example
 * // AMOC collapse threshold (high scientific disagreement)
 * const threshold = sampleUniform(1.4, 8.0, rng);
 */
export function sampleUniform(
  min: number,
  max: number,
  rng: () => number
): number {
  // Validate RNG
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate parameters
  if (min >= max) {
    throw new Error(
      `❌ Invalid uniform distribution: min (${min}) must be < max (${max})`
    );
  }

  const u = rng();
  const value = min + u * (max - min);

  // Validate output
  return assertInRange(value, min, max, {
    location: 'sampleUniform',
    valueName: 'sampledValue',
    additionalInfo: { min, max, u }
  });
}

/**
 * Sample from normal (Gaussian) distribution using Box-Muller transform
 *
 * Use case: Symmetric uncertainty around central estimate with tail behavior
 *
 * Research: Appropriate when literature reports confidence intervals (e.g., "90% CI: X-Y")
 * If min/max represent absolute bounds, use triangular instead (normal has infinite tails)
 *
 * @param mean Central estimate
 * @param std Standard deviation (must be > 0)
 * @param rng Deterministic RNG function (REQUIRED)
 * @returns Sampled value (unbounded, use with caution for physical quantities)
 *
 * @example
 * // Convert 90% confidence interval to normal distribution
 * // If min=1.4, max=8.0 represent 90% CI:
 * const mean = (1.4 + 8.0) / 2;  // 4.7
 * const std = (8.0 - 1.4) / 3.29;  // ~2.0 (90% CI ≈ ±1.645σ)
 * const threshold = sampleNormal(mean, std, rng);
 */
export function sampleNormal(
  mean: number,
  std: number,
  rng: () => number
): number {
  // Validate RNG
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate std (must be positive)
  if (std <= 0) {
    throw new Error(
      `❌ Invalid normal distribution: std (${std}) must be > 0`
    );
  }

  // Box-Muller transform for normal distribution
  // Generates two independent standard normal variables, we use the first
  const u1 = rng();
  const u2 = rng();

  // Prevent log(0) edge case
  const u1Safe = Math.max(u1, 1e-10);

  const z0 = Math.sqrt(-2.0 * Math.log(u1Safe)) * Math.cos(2.0 * Math.PI * u2);
  const value = mean + z0 * std;

  // Validate output (no range check - normal is unbounded)
  return assertFinite(value, {
    location: 'sampleNormal',
    valueName: 'sampledValue',
    additionalInfo: { mean, std, z0, u1, u2 }
  });
}

/**
 * Sample from log-normal distribution
 *
 * Use case: Skewed distributions with positive-only values (e.g., timescales, monetary values)
 *
 * Research: Appropriate when underlying process is multiplicative (e.g., compound growth)
 * NOT commonly used for tipping thresholds (which are additive temperature increases)
 *
 * @param meanLog Mean of underlying normal distribution (log space)
 * @param stdLog Standard deviation of underlying normal (log space, must be > 0)
 * @param rng Deterministic RNG function (REQUIRED)
 * @returns Sampled value (always positive)
 *
 * @example
 * // Skewed uncertainty in technology deployment timescale
 * // If most likely time is 10 years but could extend to 100+:
 * const meanLog = Math.log(10);  // Central estimate
 * const stdLog = 0.7;  // Allows tail to 100+ years
 * const deploymentYears = sampleLogNormal(meanLog, stdLog, rng);
 */
export function sampleLogNormal(
  meanLog: number,
  stdLog: number,
  rng: () => number
): number {
  // Validate RNG
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate stdLog
  if (stdLog <= 0) {
    throw new Error(
      `❌ Invalid log-normal distribution: stdLog (${stdLog}) must be > 0`
    );
  }

  // Sample from normal, then exponentiate
  const normalSample = sampleNormal(meanLog, stdLog, rng);
  const value = Math.exp(normalSample);

  // Validate output (log-normal always positive)
  if (value <= 0 || !isFinite(value)) {
    throw new Error(
      `❌ Log-normal sampling produced invalid value: ${value} (meanLog=${meanLog}, stdLog=${stdLog}, normalSample=${normalSample})`
    );
  }

  return assertFinite(value, {
    location: 'sampleLogNormal',
    valueName: 'sampledValue',
    additionalInfo: { meanLog, stdLog, normalSample }
  });
}

/**
 * Distribution type discriminator
 */
export type DistributionType = 'triangular' | 'uniform' | 'normal' | 'log-normal';

/**
 * Distribution parameters (union type for type safety)
 */
export type DistributionParams =
  | { type: 'triangular'; min: number; mode: number; max: number }
  | { type: 'uniform'; min: number; max: number }
  | { type: 'normal'; mean: number; std: number }
  | { type: 'log-normal'; meanLog: number; stdLog: number };

/**
 * Sample from a distribution specified by parameters object
 *
 * Type-safe wrapper around individual sampling functions.
 * Use this for configuration-driven sampling (e.g., from JSON config).
 *
 * @param params Distribution specification
 * @param rng Deterministic RNG function (REQUIRED)
 * @returns Sampled value
 *
 * @example
 * // Configuration-driven sampling
 * const config: DistributionParams = {
 *   type: 'triangular',
 *   min: 0.8,
 *   mode: 1.5,
 *   max: 3.4
 * };
 * const threshold = sampleDistribution(config, rng);
 */
export function sampleDistribution(
  params: DistributionParams,
  rng: () => number
): number {
  switch (params.type) {
    case 'triangular':
      return sampleTriangular(params.min, params.mode, params.max, rng);

    case 'uniform':
      return sampleUniform(params.min, params.max, rng);

    case 'normal':
      return sampleNormal(params.mean, params.std, rng);

    case 'log-normal':
      return sampleLogNormal(params.meanLog, params.stdLog, rng);

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = params;
      throw new Error(`❌ Unknown distribution type: ${(_exhaustive as any).type}`);
  }
}

/**
 * Helper: Convert 90% confidence interval to normal distribution parameters
 *
 * If literature reports "90% CI: [min, max]", this converts to mean/std for normal sampling.
 * Note: 90% CI ≈ mean ± 1.645σ
 *
 * @param min 5th percentile (lower bound of 90% CI)
 * @param max 95th percentile (upper bound of 90% CI)
 * @returns { mean, std } for use with sampleNormal
 *
 * @example
 * // Literature reports "90% CI: 1.4-8.0°C"
 * const { mean, std } = confidenceIntervalToNormal(1.4, 8.0);
 * const threshold = sampleNormal(mean, std, rng);
 */
export function confidenceIntervalToNormal(
  min: number,
  max: number
): { mean: number; std: number } {
  if (min >= max) {
    throw new Error(
      `❌ Invalid confidence interval: min (${min}) must be < max (${max})`
    );
  }

  const mean = (min + max) / 2;
  // 90% CI covers ±1.645 standard deviations
  const std = (max - min) / (2 * 1.645);

  return { mean, std };
}
