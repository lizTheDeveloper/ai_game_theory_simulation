/**
 * Distribution Sampling Library for Threshold Uncertainty
 *
 * Implements research-backed probability distributions for modeling
 * uncertain thresholds in planetary boundaries and crisis triggers.
 *
 * ALL functions are deterministic given the same RNG seed.
 *
 * Research foundations:
 * - Box-Muller transform: Knuth (1997) - The Art of Computer Programming Vol 2
 * - Beta sampling: Cheng (1978) - Generating beta variates with nonintegral shape parameters
 * - Log-normal: Johnson et al. (1994) - Continuous Univariate Distributions Vol 1
 * - Triangular: Law & Kelton (2000) - Simulation Modeling and Analysis
 */

import type { RNGFunction } from '@/types/config';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * Sample from Normal distribution N(μ, σ²)
 *
 * Uses Box-Muller transform to convert uniform random variables to normal.
 *
 * Algorithm:
 * 1. Generate two independent uniform [0,1] variables U1, U2
 * 2. Z0 = sqrt(-2 ln(U1)) * cos(2π U2)
 * 3. Z0 ~ N(0, 1)
 * 4. Return μ + σ * Z0
 *
 * @param mean - Mean (μ) of distribution
 * @param stdDev - Standard deviation (σ) of distribution, must be > 0
 * @param rng - Deterministic RNG function
 * @returns Sample from N(μ, σ²)
 *
 * @throws Error if stdDev ≤ 0 or parameters are NaN/Infinity
 *
 * @example
 * const rng = seedrandom('test-seed');
 * const sample = sampleNormal(100, 15, rng); // IQ-like distribution
 */
export function sampleNormal(
  mean: number,
  stdDev: number,
  rng: RNGFunction
): number {
  // Validate parameters
  assertFinite(mean, {
    location: 'sampleNormal',
    valueName: 'mean',
    additionalInfo: { stdDev }
  });

  assertFinite(stdDev, {
    location: 'sampleNormal',
    valueName: 'stdDev',
    additionalInfo: { mean }
  });

  if (stdDev <= 0) {
    throw new Error([
      '❌ Invalid stdDev in sampleNormal',
      `   stdDev = ${stdDev}`,
      '   stdDev must be > 0',
    ].join('\n'));
  }

  // Box-Muller transform
  const u1 = rng();
  const u2 = rng();

  // CRITICAL: Validate RNG outputs are finite (CRITICAL-3 regression protection)
  if (typeof u1 !== 'number' || !isFinite(u1)) {
    throw new Error([
      '❌ CRITICAL: RNG produced non-finite u1',
      `   u1 = ${u1}`,
      '   RNG function must be provided and return finite numbers [0,1]',
      '   This indicates RNG was not passed correctly to initialization.'
    ].join('\n'));
  }
  if (typeof u2 !== 'number' || !isFinite(u2)) {
    throw new Error([
      '❌ CRITICAL: RNG produced non-finite u2',
      `   u2 = ${u2}`,
      '   RNG function must be provided and return finite numbers [0,1]',
      '   This indicates RNG was not passed correctly to initialization.'
    ].join('\n'));
  }

  // Avoid log(0) - if u1 is exactly 0, use tiny epsilon
  const u1Safe = u1 === 0 ? 1e-10 : u1;

  const z0 = Math.sqrt(-2.0 * Math.log(u1Safe)) * Math.cos(2.0 * Math.PI * u2);

  const result = mean + stdDev * z0;

  return assertFinite(result, {
    location: 'sampleNormal',
    valueName: 'result',
    additionalInfo: { mean, stdDev, z0 }
  });
}

/**
 * Sample from Beta distribution Beta(α, β)
 *
 * Beta distribution models probabilities and proportions on [0, 1].
 * - α, β = 1: Uniform [0,1]
 * - α = β > 1: Symmetric, bell-shaped
 * - α < β: Left-skewed (mode near 0)
 * - α > β: Right-skewed (mode near 1)
 *
 * Uses gamma ratio method: Beta(α, β) = Gamma(α) / (Gamma(α) + Gamma(β))
 *
 * @param alpha - Shape parameter α, must be > 0
 * @param beta - Shape parameter β, must be > 0
 * @param rng - Deterministic RNG function
 * @returns Sample from Beta(α, β) in [0, 1]
 *
 * @throws Error if alpha ≤ 0, beta ≤ 0, or parameters are NaN/Infinity
 *
 * @example
 * const rng = seedrandom('test-seed');
 * const sample = sampleBeta(2, 5, rng); // Left-skewed, mode near 0.2
 */
export function sampleBeta(
  alpha: number,
  beta: number,
  rng: RNGFunction
): number {
  // Validate parameters
  assertFinite(alpha, {
    location: 'sampleBeta',
    valueName: 'alpha',
    additionalInfo: { beta }
  });

  assertFinite(beta, {
    location: 'sampleBeta',
    valueName: 'beta',
    additionalInfo: { alpha }
  });

  if (alpha <= 0) {
    throw new Error([
      '❌ Invalid alpha in sampleBeta',
      `   alpha = ${alpha}`,
      '   alpha must be > 0',
    ].join('\n'));
  }

  if (beta <= 0) {
    throw new Error([
      '❌ Invalid beta in sampleBeta',
      `   beta = ${beta}`,
      '   beta must be > 0',
    ].join('\n'));
  }

  // Sample two gamma variates and take ratio
  const gammaAlpha = sampleGamma(alpha, 1, rng);
  const gammaBeta = sampleGamma(beta, 1, rng);

  const result = gammaAlpha / (gammaAlpha + gammaBeta);

  return assertInRange(result, 0, 1, {
    location: 'sampleBeta',
    valueName: 'result',
  });
}

/**
 * Sample from Gamma distribution Gamma(k, θ)
 *
 * Internal helper for Beta distribution.
 * Uses Marsaglia & Tsang (2000) method for k ≥ 1.
 *
 * @param shape - Shape parameter k (α in some notations), must be > 0
 * @param scale - Scale parameter θ, must be > 0
 * @param rng - Deterministic RNG function
 * @returns Sample from Gamma(k, θ)
 */
function sampleGamma(
  shape: number,
  scale: number,
  rng: RNGFunction
): number {
  // For shape < 1, use transformation Gamma(k) = Gamma(k+1) * U^(1/k)
  if (shape < 1) {
    const gammaShapePlus1 = sampleGamma(shape + 1, scale, rng);
    const u = rng();
    return gammaShapePlus1 * Math.pow(u, 1 / shape);
  }

  // Marsaglia & Tsang (2000) method for shape ≥ 1
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  // Rejection sampling loop
  let maxIterations = 1000;
  while (maxIterations-- > 0) {
    // Sample Z ~ N(0,1)
    const z = sampleNormal(0, 1, rng);
    const v = Math.pow(1 + c * z, 3);

    if (v <= 0) continue;

    const u = rng();
    const z2 = z * z;

    // Accept/reject conditions from Marsaglia & Tsang
    if (u < 1 - 0.0331 * z2 * z2) {
      return d * v * scale;
    }

    if (Math.log(u) < 0.5 * z2 + d * (1 - v + Math.log(v))) {
      return d * v * scale;
    }
  }

  // Fallback - should rarely happen with good RNG
  throw new Error('sampleGamma: Failed to converge after 1000 iterations');
}

/**
 * Sample from Log-Normal distribution LogNormal(μ, σ²)
 *
 * Log-normal models positive-only values where log(X) ~ N(μ, σ²).
 * Common in modeling multiplicative processes (e.g., economic growth).
 *
 * If Y ~ N(μ, σ²), then X = exp(Y) ~ LogNormal(μ, σ²)
 *
 * Mean of X = exp(μ + σ²/2)
 * Median of X = exp(μ)
 *
 * @param mu - Mean of underlying normal distribution (NOT mean of log-normal)
 * @param sigma - Std dev of underlying normal distribution, must be > 0
 * @param rng - Deterministic RNG function
 * @returns Sample from LogNormal(μ, σ²), always > 0
 *
 * @throws Error if sigma ≤ 0 or parameters are NaN/Infinity
 *
 * @example
 * const rng = seedrandom('test-seed');
 * // Threshold with median = 1.5°C, high variance
 * const threshold = sampleLogNormal(Math.log(1.5), 0.3, rng);
 */
export function sampleLogNormal(
  mu: number,
  sigma: number,
  rng: RNGFunction
): number {
  // Validate parameters
  assertFinite(mu, {
    location: 'sampleLogNormal',
    valueName: 'mu',
    additionalInfo: { sigma }
  });

  assertFinite(sigma, {
    location: 'sampleLogNormal',
    valueName: 'sigma',
    additionalInfo: { mu }
  });

  if (sigma <= 0) {
    throw new Error([
      '❌ Invalid sigma in sampleLogNormal',
      `   sigma = ${sigma}`,
      '   sigma must be > 0',
    ].join('\n'));
  }

  // Sample from normal, then exponentiate
  const normalSample = sampleNormal(mu, sigma, rng);
  const result = Math.exp(normalSample);

  return assertFinite(result, {
    location: 'sampleLogNormal',
    valueName: 'result',
    additionalInfo: { mu, sigma, normalSample }
  });
}

/**
 * Sample from Triangular distribution Tri(min, mode, max)
 *
 * Triangular distribution models expert estimates with:
 * - Minimum plausible value
 * - Most likely value (mode)
 * - Maximum plausible value
 *
 * Uses inverse CDF method:
 * - F(x) = (x-a)²/((b-a)(c-a)) for x ∈ [a, c]
 * - F(x) = 1 - (b-x)²/((b-a)(b-c)) for x ∈ [c, b]
 *
 * @param min - Minimum value, must be < mode
 * @param mode - Most likely value (peak), must be in (min, max)
 * @param max - Maximum value, must be > mode
 * @param rng - Deterministic RNG function
 * @returns Sample from Tri(min, mode, max) in [min, max]
 *
 * @throws Error if min ≥ mode, mode ≥ max, or parameters are NaN/Infinity
 *
 * @example
 * const rng = seedrandom('test-seed');
 * // Ocean pH crisis threshold: early warning 7.8, range [7.6, 8.0] (critical collapse at 7.5)
 * const threshold = sampleTriangular(7.6, 7.8, 8.0, rng);
 */
export function sampleTriangular(
  min: number,
  mode: number,
  max: number,
  rng: RNGFunction
): number {
  // Validate parameters
  assertFinite(min, {
    location: 'sampleTriangular',
    valueName: 'min',
    additionalInfo: { mode, max }
  });

  assertFinite(mode, {
    location: 'sampleTriangular',
    valueName: 'mode',
    additionalInfo: { min, max }
  });

  assertFinite(max, {
    location: 'sampleTriangular',
    valueName: 'max',
    additionalInfo: { min, mode }
  });

  if (min >= mode) {
    throw new Error([
      '❌ Invalid parameters in sampleTriangular',
      `   min = ${min}, mode = ${mode}`,
      '   min must be < mode',
    ].join('\n'));
  }

  if (mode >= max) {
    throw new Error([
      '❌ Invalid parameters in sampleTriangular',
      `   mode = ${mode}, max = ${max}`,
      '   mode must be < max',
    ].join('\n'));
  }

  // Inverse CDF method
  const u = rng();
  const range = max - min;
  const modeCDF = (mode - min) / range; // CDF value at mode

  let result: number;

  if (u < modeCDF) {
    // Left side of triangle: [min, mode]
    result = min + Math.sqrt(u * range * (mode - min));
  } else {
    // Right side of triangle: [mode, max]
    result = max - Math.sqrt((1 - u) * range * (max - mode));
  }

  return assertInRange(result, min, max, {
    location: 'sampleTriangular',
    valueName: 'result',
  });
}

/**
 * Sample from Uniform distribution U(min, max)
 *
 * Uniform distribution models complete uncertainty within a known range.
 * All values in [min, max] are equally likely.
 *
 * @param min - Minimum value
 * @param max - Maximum value, must be > min
 * @param rng - Deterministic RNG function
 * @returns Sample from U(min, max) in [min, max]
 *
 * @throws Error if min ≥ max or parameters are NaN/Infinity
 *
 * @example
 * const rng = seedrandom('test-seed');
 * // Complete uncertainty about effect size
 * const effect = sampleUniform(0.15, 0.45, rng);
 */
export function sampleUniform(
  min: number,
  max: number,
  rng: RNGFunction
): number {
  // Validate parameters
  assertFinite(min, {
    location: 'sampleUniform',
    valueName: 'min',
    additionalInfo: { max }
  });

  assertFinite(max, {
    location: 'sampleUniform',
    valueName: 'max',
    additionalInfo: { min }
  });

  if (min >= max) {
    throw new Error([
      '❌ Invalid parameters in sampleUniform',
      `   min = ${min}, max = ${max}`,
      '   min must be < max',
    ].join('\n'));
  }

  const result = min + rng() * (max - min);

  return assertInRange(result, min, max, {
    location: 'sampleUniform',
    valueName: 'result',
  });
}

/**
 * Helper: Convert distribution parameters to descriptive stats
 *
 * Useful for logging and debugging threshold configurations.
 *
 * @example
 * const stats = getDistributionStats('normal', { mean: 1.5, stdDev: 0.3 });
 * console.log(stats); // "Normal(μ=1.50, σ=0.30)"
 */
export function getDistributionStats(
  type: 'normal' | 'beta' | 'lognormal' | 'triangular' | 'uniform',
  params: Record<string, number>
): string {
  switch (type) {
    case 'normal':
      return `Normal(μ=${params.mean?.toFixed(2)}, σ=${params.stdDev?.toFixed(2)})`;
    case 'beta':
      return `Beta(α=${params.alpha?.toFixed(2)}, β=${params.beta?.toFixed(2)})`;
    case 'lognormal':
      return `LogNormal(μ=${params.mu?.toFixed(2)}, σ=${params.sigma?.toFixed(2)})`;
    case 'triangular':
      return `Triangular(min=${params.min?.toFixed(2)}, mode=${params.mode?.toFixed(2)}, max=${params.max?.toFixed(2)})`;
    case 'uniform':
      return `Uniform(min=${params.min?.toFixed(2)}, max=${params.max?.toFixed(2)})`;
    default:
      return 'Unknown distribution';
  }
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
  rng: RNGFunction
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
 * 🎲 Sample from threshold distribution (dispatcher)
 *
 * Selects appropriate sampling function based on distribution type.
 *
 * @param distribution - Distribution specification from TippingElement
 * @param rng - REQUIRED RNG function (must be deterministic with seed)
 * @returns Sampled threshold value (°C)
 */
export function sampleThresholdDistribution(
  distribution: {
    type: 'triangular' | 'uniform' | 'normal' | 'log-normal';
    params: {
      min?: number;
      mode?: number;
      max?: number;
      mean?: number;
      std?: number;
      meanLog?: number;
      stdLog?: number;
    };
  },
  rng: RNGFunction
): number {
  // ❌ Fail loudly if RNG missing
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  switch (distribution.type) {
    case 'triangular': {
      const { min, mode, max } = distribution.params;
      if (min === undefined || mode === undefined || max === undefined) {
        throw new Error(`❌ Triangular distribution missing parameters: min=${min} mode=${mode} max=${max}`);
      }
      return sampleTriangular(min, mode, max, rng);
    }

    case 'uniform': {
      const { min, max } = distribution.params;
      if (min === undefined || max === undefined) {
        throw new Error(`❌ Uniform distribution missing parameters: min=${min} max=${max}`);
      }
      return sampleUniform(min, max, rng);
    }

    case 'normal': {
      const { mean, std } = distribution.params;
      if (mean === undefined || std === undefined) {
        throw new Error(`❌ Normal distribution missing parameters: mean=${mean} std=${std}`);
      }
      return sampleNormal(mean, std, rng);
    }

    case 'log-normal': {
      const { meanLog, stdLog } = distribution.params;
      if (meanLog === undefined || stdLog === undefined) {
        throw new Error(`❌ Log-normal distribution missing parameters: meanLog=${meanLog} stdLog=${stdLog}`);
      }
      return sampleLogNormal(meanLog, stdLog, rng);
    }

    default:
      throw new Error(`❌ Unknown distribution type: ${(distribution as any).type}`);
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
