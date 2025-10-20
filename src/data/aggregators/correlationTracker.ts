/**
 * Paradigm Correlation Tracker
 *
 * Calculates Pearson correlations across countries to validate research claims.
 *
 * **Expected Correlations (from Phase 2 research):**
 * - Western ↔ Development: ~0.7-0.9 (wealth enables democracy)
 * - Development ↔ Ecological: ~-0.6 (consumption-sustainability tradeoff)
 * - Western ↔ Ecological: ~-0.4 (democracies consume more)
 * - Ecological ↔ Indigenous: ~0.5-0.7 (harmony alignment)
 * - Western ↔ Indigenous: ~0.4-0.6 (civic participation overlap)
 * - Development ↔ Indigenous: ~0.2-0.4 (weak link)
 *
 * @module data/aggregators/correlationTracker
 */

import type { ParadigmCorrelations, CountryParadigmScores } from '@/types/multiParadigmDUI';

/**
 * Calculate paradigm correlations across countries
 *
 * @param countries - Array of country paradigm scores
 * @returns 6 pairwise correlations
 */
export function calculateCorrelations(
  countries: CountryParadigmScores[]
): ParadigmCorrelations {
  // Extract score arrays
  const western = countries.map(c => c.scores.western);
  const development = countries.map(c => c.scores.development);
  const ecological = countries.map(c => c.scores.ecological);
  const indigenous = countries.map(c => c.scores.indigenous);

  return {
    western_development: pearsonCorrelation(western, development),
    western_ecological: pearsonCorrelation(western, ecological),
    western_indigenous: pearsonCorrelation(western, indigenous),
    development_ecological: pearsonCorrelation(development, ecological),
    development_indigenous: pearsonCorrelation(development, indigenous),
    ecological_indigenous: pearsonCorrelation(ecological, indigenous),
  };
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 *
 * r = Σ((x - x̄)(y - ȳ)) / √(Σ(x - x̄)² * Σ(y - ȳ)²)
 *
 * @param x - First variable
 * @param y - Second variable
 * @returns Correlation coefficient (-1 to 1)
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate deviations
  const deviationsX = x.map(val => val - meanX);
  const deviationsY = y.map(val => val - meanY);

  // Calculate covariance
  const covariance = deviationsX.reduce(
    (sum, dx, i) => sum + dx * (deviationsY[i] ?? 0),
    0
  );

  // Calculate standard deviations
  const varianceX = deviationsX.reduce((sum, dx) => sum + dx * dx, 0);
  const varianceY = deviationsY.reduce((sum, dy) => sum + dy * dy, 0);

  const stdDevX = Math.sqrt(varianceX);
  const stdDevY = Math.sqrt(varianceY);

  // Calculate Pearson correlation
  if (stdDevX === 0 || stdDevY === 0) {
    return 0; // No variance, no correlation
  }

  return covariance / (stdDevX * stdDevY);
}

/**
 * Validate correlations against research claims
 *
 * @param correlations - Calculated correlations
 * @returns Validation results
 */
export function validateCorrelations(correlations: ParadigmCorrelations): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Western-Development should be positive ~0.7-0.9
  if (correlations.western_development < 0.5) {
    warnings.push(
      `Western-Development correlation too low: ${correlations.western_development.toFixed(2)} (expected ~0.7-0.9)`
    );
  }

  // Development-Ecological should be negative ~-0.6
  if (correlations.development_ecological > -0.3) {
    warnings.push(
      `Development-Ecological correlation not negative enough: ${correlations.development_ecological.toFixed(2)} (expected ~-0.6)`
    );
  }

  // Western-Ecological should be negative ~-0.4
  if (correlations.western_ecological > -0.1) {
    warnings.push(
      `Western-Ecological correlation not negative enough: ${correlations.western_ecological.toFixed(2)} (expected ~-0.4)`
    );
  }

  // Ecological-Indigenous should be positive ~0.5-0.7
  if (correlations.ecological_indigenous < 0.3) {
    warnings.push(
      `Ecological-Indigenous correlation too low: ${correlations.ecological_indigenous.toFixed(2)} (expected ~0.5-0.7)`
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Get strongest correlation
 *
 * @param correlations - Paradigm correlations
 * @returns Strongest correlation (by absolute value)
 */
export function getStrongestCorrelation(correlations: ParadigmCorrelations): {
  pair: string;
  value: number;
} {
  const pairs = [
    { pair: 'western_development', value: correlations.western_development },
    { pair: 'western_ecological', value: correlations.western_ecological },
    { pair: 'western_indigenous', value: correlations.western_indigenous },
    { pair: 'development_ecological', value: correlations.development_ecological },
    { pair: 'development_indigenous', value: correlations.development_indigenous },
    { pair: 'ecological_indigenous', value: correlations.ecological_indigenous },
  ];

  return pairs.reduce((max, p) =>
    Math.abs(p.value) > Math.abs(max.value) ? p : max
  );
}
