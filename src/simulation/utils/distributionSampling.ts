/**
 * Distribution Sampling Utilities (M-5: Threshold Uncertainty Modeling)
 *
 * Implements probability distribution sampling for tipping point thresholds.
 *
 * Research: Armstrong McKay et al. (2022) Science - Tipping thresholds have factor 2-10x uncertainty
 * Research: Kriegler et al. (2009) PNAS - Expert elicitation uses Bayesian subjective probabilities
 *
 * CRITICAL: All sampling MUST use the RNG function parameter (no Math.random fallbacks)
 * This ensures deterministic reproducibility for Monte Carlo validation.
 *
 * Created: Dec 7, 2025
 */

import { assertFinite, assertInRange } from './assertions';

/**
 * 🎲 Sample from triangular distribution
 *
 * Research: Triangular distribution matches min/mode/max format from expert elicitation
 * Most common in climate tipping point literature (Armstrong McKay et al. 2022)
 *
 * Algorithm: Inverse transform sampling
 * - F^-1(u) for u ~ Uniform(0,1)
 * - Split at mode into lower and upper regions
 *
 * @param min - Minimum value (lower bound)
 * @param mode - Most likely value (peak of distribution)
 * @param max - Maximum value (upper bound)
 * @param rng - REQUIRED RNG function (must be deterministic with seed)
 * @returns Sampled value from triangular distribution
 */
export function sampleTriangular(
  min: number,
  mode: number,
  max: number,
  rng: () => number
): number {
  // ❌ Fail loudly if RNG missing (CRITICAL-3 regression fix pattern)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate parameters
  assertFinite(min, {
    location: 'sampleTriangular',
    valueName: 'min',
    additionalInfo: { min, mode, max }
  });
  assertFinite(mode, {
    location: 'sampleTriangular',
    valueName: 'mode',
    additionalInfo: { min, mode, max }
  });
  assertFinite(max, {
    location: 'sampleTriangular',
    valueName: 'max',
    additionalInfo: { min, mode, max }
  });

  if (min > mode || mode > max) {
    throw new Error(`❌ Invalid triangular distribution: min=${min} mode=${mode} max=${max} (must satisfy min <= mode <= max)`);
  }

  // Inverse transform sampling
  const u = rng(); // Sample from Uniform(0,1)

  // Calculate cumulative probability at mode
  const F_mode = (mode - min) / (max - min);

  let sample: number;

  if (u < F_mode) {
    // Lower region: [min, mode]
    sample = min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    // Upper region: [mode, max]
    sample = max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }

  // Validate output
  return assertInRange(sample, min, max, {
    location: 'sampleTriangular',
    valueName: 'sampledValue',
    additionalInfo: { min, mode, max, u }
  });
}

/**
 * 🎲 Sample from uniform distribution
 *
 * Research: Uniform distribution represents epistemic uncertainty with no central tendency
 * Used when scientific disagreement prevents identifying a "most likely" value (e.g., AMOC threshold)
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @param rng - REQUIRED RNG function (must be deterministic with seed)
 * @returns Sampled value from uniform distribution
 */
export function sampleUniform(
  min: number,
  max: number,
  rng: () => number
): number {
  // ❌ Fail loudly if RNG missing
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate parameters
  assertFinite(min, {
    location: 'sampleUniform',
    valueName: 'min',
    additionalInfo: { min, max }
  });
  assertFinite(max, {
    location: 'sampleUniform',
    valueName: 'max',
    additionalInfo: { min, max }
  });

  if (min > max) {
    throw new Error(`❌ Invalid uniform distribution: min=${min} max=${max} (must satisfy min <= max)`);
  }

  const sample = min + rng() * (max - min);

  // Validate output
  return assertInRange(sample, min, max, {
    location: 'sampleUniform',
    valueName: 'sampledValue',
    additionalInfo: { min, max }
  });
}

/**
 * 🎲 Sample from normal (Gaussian) distribution
 *
 * Research: Normal distribution for symmetric uncertainty with confidence intervals
 * Uses Box-Muller transform for standard normal, then scales/shifts
 *
 * Note: Normal has infinite tails - may produce values outside physical bounds.
 * Consider truncating or using triangular/uniform for bounded quantities.
 *
 * @param mean - Mean (center) of distribution
 * @param std - Standard deviation (spread)
 * @param rng - REQUIRED RNG function (must be deterministic with seed)
 * @returns Sampled value from normal distribution
 */
export function sampleNormal(
  mean: number,
  std: number,
  rng: () => number
): number {
  // ❌ Fail loudly if RNG missing
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Validate parameters
  assertFinite(mean, {
    location: 'sampleNormal',
    valueName: 'mean',
    additionalInfo: { mean, std }
  });
  assertFinite(std, {
    location: 'sampleNormal',
    valueName: 'std',
    additionalInfo: { mean, std }
  });

  if (std <= 0) {
    throw new Error(`❌ Invalid normal distribution: std=${std} (must be positive)`);
  }

  // Box-Muller transform
  const u1 = rng();
  const u2 = rng();

  // Guard against log(0)
  const u1_safe = Math.max(u1, 1e-10);

  const z0 = Math.sqrt(-2.0 * Math.log(u1_safe)) * Math.cos(2.0 * Math.PI * u2);

  const sample = mean + z0 * std;

  // Validate output (allow wide range for normal)
  return assertFinite(sample, {
    location: 'sampleNormal',
    valueName: 'sampledValue',
    additionalInfo: { mean, std, u1, u2, z0 }
  });
}

/**
 * 🎲 Sample from log-normal distribution
 *
 * Research: Log-normal for right-skewed distributions (rare in tipping thresholds)
 * X ~ LogNormal(μ, σ) if log(X) ~ Normal(μ, σ)
 *
 * @param meanLog - Mean of underlying normal (μ)
 * @param stdLog - Standard deviation of underlying normal (σ)
 * @param rng - REQUIRED RNG function (must be deterministic with seed)
 * @returns Sampled value from log-normal distribution
 */
export function sampleLogNormal(
  meanLog: number,
  stdLog: number,
  rng: () => number
): number {
  // ❌ Fail loudly if RNG missing
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic distribution sampling');
  }

  // Sample from normal, then exponentiate
  const normalSample = sampleNormal(meanLog, stdLog, rng);

  const sample = Math.exp(normalSample);

  // Validate output (must be positive)
  return assertFinite(sample, {
    location: 'sampleLogNormal',
    valueName: 'sampledValue',
    additionalInfo: { meanLog, stdLog, normalSample }
  });
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
  rng: () => number
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
