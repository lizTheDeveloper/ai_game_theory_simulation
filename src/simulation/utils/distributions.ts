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
  // Validate parameters
  assertFinite(mean, {
    location: 'sampleNormal',
    valueName: 'mean',
    additionalInfo: { std }
  });

  assertFinite(std, {
    location: 'sampleNormal',
    valueName: 'stdDev',
    additionalInfo: { mean }
  });

  if (std <= 0) {
    throw new Error([
      '❌ Invalid stdDev in sampleNormal',
      `   stdDev = ${std}`,
      '   stdDev must be > 0',
    ].join('\n'));
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
  // Validate parameters
  assertFinite(meanLog, {
    location: 'sampleLogNormal',
    valueName: 'mu',
    additionalInfo: { stdLog }
  });

  assertFinite(stdLog, {
    location: 'sampleLogNormal',
    valueName: 'sigma',
    additionalInfo: { meanLog }
  });

  if (stdLog <= 0) {
    throw new Error([
      '❌ Invalid sigma in sampleLogNormal',
      `   sigma = ${stdLog}`,
      '   sigma must be > 0',
    ].join('\n'));
  }

  // Sample from normal, then exponentiate
  const normalSample = sampleNormal(meanLog, stdLog, rng);
  const result = Math.exp(normalSample);

  return assertFinite(result, {
    location: 'sampleLogNormal',
    valueName: 'result',
    additionalInfo: { mu: meanLog, sigma: stdLog, normalSample }
  });
}

/**
 * Sample from Beta distribution (function overloads)
 *
 * Two signatures:
 * 1. sampleBeta(alpha, beta, min, max, rng) - Scaled to [min, max] range
 * 2. sampleBeta(alpha, beta, rng) - Unscaled in [0, 1] range
 *
 * Use case: Bounded distributions with flexible shape (M-5, AMOC uncertainty)
 *
 * Research: Beta(2,5) for AMOC uncertainty (Quality Gate 1, Dec 7, 2025)
 * - Skews toward lower thresholds (mode ~2.4°C) while preserving wide uncertainty
 * - Avoids physically implausible uniform assumption (endpoints equally likely)
 * - Paleoclimate evidence suggests AMOC sensitivity to moderate warming
 */

// Overload 1: Scaled to [min, max]
export function sampleBeta(
  alpha: number,
  beta: number,
  min: number,
  max: number,
  rng: () => number
): number;

// Overload 2: Unscaled [0, 1]
export function sampleBeta(
  alpha: number,
  beta: number,
  rng: () => number
): number;

// Implementation (handles both signatures)
export function sampleBeta(
  alpha: number,
  beta: number,
  minOrRng: number | (() => number),
  maxOrUndefined?: number,
  rngOrUndefined?: () => number
): number {
  // Detect which overload was called
  let min: number;
  let max: number;
  let rng: () => number;

  if (typeof minOrRng === 'function') {
    // Overload 2: sampleBeta(alpha, beta, rng)
    min = 0;
    max = 1;
    rng = minOrRng;
  } else {
    // Overload 1: sampleBeta(alpha, beta, min, max, rng)
    min = minOrRng;
    max = maxOrUndefined!;
    rng = rngOrUndefined!;
  }

  // Validate RNG
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate shape parameters
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

  // Validate range
  if (min >= max) {
    throw new Error(
      `❌ Invalid beta distribution: min (${min}) must be < max (${max})`
    );
  }

  // Special case: Beta(1,1) is uniform
  if (alpha === 1 && beta === 1) {
    return sampleUniform(min, max, rng);
  }

  // Sample two gamma variates and take ratio
  const gammaAlpha = sampleGamma(alpha, 1, rng);
  const gammaBeta = sampleGamma(beta, 1, rng);

  // Beta sample in [0, 1]
  const betaSample = gammaAlpha / (gammaAlpha + gammaBeta);

  // Ensure in [0, 1] (numerical stability)
  const clampedBeta = Math.max(0, Math.min(1, betaSample));

  // Scale to [min, max]
  const value = min + clampedBeta * (max - min);

  return assertInRange(value, min, max, {
    location: 'sampleBeta',
    valueName: 'sampledValue',
    additionalInfo: { alpha, beta, min, max, betaSample: clampedBeta }
  });
}

/**
 * Sample from Gamma distribution (internal helper)
 *
 * Research: Marsaglia & Tsang (2000) - Efficient rejection sampling algorithm
 *
 * Used internally by sampleBeta for gamma ratio method.
 * Not exported (beta is the only use case in M-5).
 *
 * Performance: Rejection sampling with iteration guard to prevent pathological hangs.
 * Typical acceptance rate >90% for reasonable parameters (alpha >= 1, beta >= 1).
 *
 * @param shape Shape parameter (alpha, must be > 0)
 * @param scale Scale parameter (must be > 0)
 * @param rng Deterministic RNG function
 * @returns Sampled value from Gamma(shape, scale)
 * @throws Error if sampling exceeds max iterations (suggests pathological parameters)
 */
function sampleGamma(shape: number, scale: number, rng: () => number): number {
  if (shape < 1) {
    // For shape < 1, use Ahrens-Dieter acceptance-rejection method
    // Gamma(a) = Gamma(1+a) * U^(1/a) where U ~ Uniform(0,1)
    const u = rng();
    return sampleGamma(1 + shape, scale, rng) * Math.pow(u, 1 / shape);
  }

  // Marsaglia & Tsang's Method (2000) for shape >= 1
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  // Rejection sampling loop with iteration guard (Architecture Review HIGH-1)
  // Typical acceptance rate >90%, max iterations prevents pathological hangs
  const MAX_ITERATIONS = 1000;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    let x: number;
    let v: number;

    // Sample from normal until we get v > 0
    do {
      x = sampleNormal(0, 1, rng);
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = rng();

    // Quick acceptance test
    if (u < 1 - 0.0331 * x * x * x * x) {
      return d * v * scale;
    }

    // Slower acceptance test
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v * scale;
    }

    iterations++;
  }

  // If we get here, parameters are pathological (should never happen with Beta(2,5) etc)
  throw new Error(
    `❌ Gamma sampling failed after ${MAX_ITERATIONS} iterations for shape=${shape}, scale=${scale}. ` +
    `This suggests pathological parameters. Please verify distribution configuration.`
  );
}

/**
 * Distribution type discriminator
 */
export type DistributionType = 'triangular' | 'uniform' | 'normal' | 'log-normal' | 'beta';

/**
 * Distribution parameters (union type for type safety)
 */
export type DistributionParams =
  | { type: 'triangular'; min: number; mode: number; max: number }
  | { type: 'uniform'; min: number; max: number }
  | { type: 'normal'; mean: number; std: number }
  | { type: 'log-normal'; meanLog: number; stdLog: number }
  | { type: 'beta'; alpha: number; beta: number; min: number; max: number };

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

    case 'beta':
      return sampleBeta(params.alpha, params.beta, params.min, params.max, rng);

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

/**
 * Sample from threshold distribution (dispatcher)
 *
 * Type-safe dispatcher for threshold uncertainty modeling.
 * Accepts distribution specification object and routes to appropriate sampler.
 *
 * @param distribution Distribution specification with type and params
 * @param rng Deterministic RNG function (REQUIRED)
 * @returns Sampled threshold value
 *
 * @example
 * const dist = {
 *   type: 'triangular' as const,
 *   params: { min: 0.8, mode: 1.5, max: 3.4 }
 * };
 * const threshold = sampleThresholdDistribution(dist, rng);
 */
export function sampleThresholdDistribution(
  distribution: {
    type: 'triangular' | 'uniform' | 'normal' | 'log-normal' | 'beta';
    params: {
      min?: number;
      mode?: number;
      max?: number;
      mean?: number;
      std?: number;
      meanLog?: number;
      stdLog?: number;
      alpha?: number;
      beta?: number;
    };
  },
  rng: () => number
): number {
  // Validate RNG
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

    case 'beta': {
      const { alpha, beta, min, max } = distribution.params;
      if (alpha === undefined || beta === undefined) {
        throw new Error(`❌ Beta distribution missing parameters: alpha=${alpha} beta=${beta}`);
      }
      // Beta can be scaled or unscaled - if min/max provided, use scaled version
      if (min !== undefined && max !== undefined) {
        return sampleBeta(alpha, beta, min, max, rng);
      } else {
        // Unscaled [0, 1] version
        return sampleBeta(alpha, beta, rng);
      }
    }

    default:
      throw new Error(`❌ Unknown distribution type: ${(distribution as any).type}`);
  }
}

/**
 * Helper: Convert distribution parameters to descriptive stats
 *
 * Useful for logging and debugging threshold configurations.
 *
 * @example
 * const stats = getDistributionStats('normal', { mean: 1.5, std: 0.3 });
 * console.log(stats); // "Normal(μ=1.50, σ=0.30)"
 */
export function getDistributionStats(
  type: 'normal' | 'beta' | 'lognormal' | 'triangular' | 'uniform',
  params: Record<string, number>
): string {
  switch (type) {
    case 'normal':
      return `Normal(μ=${params.mean?.toFixed(2)}, σ=${(params.stdDev ?? params.std)?.toFixed(2)})`;
    case 'beta':
      return `Beta(α=${params.alpha?.toFixed(2)}, β=${params.beta?.toFixed(2)})`;
    case 'lognormal':
      return `LogNormal(μ=${(params.mu ?? params.meanLog)?.toFixed(2)}, σ=${(params.sigma ?? params.stdLog)?.toFixed(2)})`;
    case 'triangular':
      return `Triangular(min=${params.min?.toFixed(2)}, mode=${params.mode?.toFixed(2)}, max=${params.max?.toFixed(2)})`;
    case 'uniform':
      return `Uniform(min=${params.min?.toFixed(2)}, max=${params.max?.toFixed(2)})`;
    default:
      return 'Unknown distribution';
  }
}
