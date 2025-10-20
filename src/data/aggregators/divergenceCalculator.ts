/**
 * Paradigm Divergence Calculator
 *
 * Calculates divergence metrics across 4 paradigms to quantify
 * paradigm conflicts (the diagnostic value!).
 *
 * **Key Metrics:**
 * - Overall divergence: Std dev across 4 scores (0=consensus, 50=extreme conflict)
 * - Max range: Max - min (Singapore: 72 points, Norway: 73 points)
 * - Pairwise differences: 6 pairs (Western-Development, etc.)
 * - Trend: CONVERGING/DIVERGING/STABLE (based on historical data)
 *
 * @module data/aggregators/divergenceCalculator
 */

import type { ParadigmDivergence } from '@/types/multiParadigmDUI';

/**
 * Calculate paradigm divergence metrics
 *
 * @param scores - 4 paradigm scores (0-100)
 * @param history - Historical paradigm scores (for trend detection, empty array if no history)
 * @returns Divergence metrics
 */
export function calculateDivergence(
  scores: {
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
  },
  history: Array<{
    month: number;
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
  }>
): ParadigmDivergence {
  const { western, development, ecological, indigenous } = scores;

  // Calculate mean
  const mean = (western + development + ecological + indigenous) / 4;

  // Calculate standard deviation (overall divergence)
  const variance =
    (Math.pow(western - mean, 2) +
      Math.pow(development - mean, 2) +
      Math.pow(ecological - mean, 2) +
      Math.pow(indigenous - mean, 2)) /
    4;

  const overall = Math.sqrt(variance);

  // Calculate max range
  const max = Math.max(western, development, ecological, indigenous);
  const min = Math.min(western, development, ecological, indigenous);
  const maxRange = max - min;

  // Calculate pairwise differences
  const pairwise = {
    western_development: Math.abs(western - development),
    western_ecological: Math.abs(western - ecological),
    western_indigenous: Math.abs(western - indigenous),
    development_ecological: Math.abs(development - ecological),
    development_indigenous: Math.abs(development - indigenous),
    ecological_indigenous: Math.abs(ecological - indigenous),
  };

  // Detect trend (requires at least 6 months of history)
  let trend: 'CONVERGING' | 'DIVERGING' | 'STABLE' = 'STABLE';

  if (history.length >= 6) {
    // Calculate divergence for last 6 months
    const recentDivergences = history.slice(-6).map(h => {
      const m = (h.western + h.development + h.ecological + h.indigenous) / 4;
      const v =
        (Math.pow(h.western - m, 2) +
          Math.pow(h.development - m, 2) +
          Math.pow(h.ecological - m, 2) +
          Math.pow(h.indigenous - m, 2)) /
        4;
      return Math.sqrt(v);
    });

    // Compare first 3 months vs last 3 months
    const earlyAvg =
      recentDivergences.slice(0, 3).reduce((sum, d) => sum + d, 0) / 3;
    const lateAvg =
      recentDivergences.slice(3, 6).reduce((sum, d) => sum + d, 0) / 3;

    const change = lateAvg - earlyAvg;

    // Threshold: 2 points is meaningful change (not 5)
    if (change > 2) {
      trend = 'DIVERGING';
    } else if (change < -2) {
      trend = 'CONVERGING';
    } else {
      trend = 'STABLE';
    }
  }

  return {
    overall,
    maxRange,
    pairwise,
    trend,
  };
}

/**
 * Classify divergence level
 *
 * @param divergence - Divergence metrics
 * @returns Human-readable classification
 */
export function classifyDivergence(divergence: ParadigmDivergence): string {
  if (divergence.maxRange >= 60) {
    return 'EXTREME CONFLICT (60+ point range)';
  } else if (divergence.maxRange >= 40) {
    return 'HIGH CONFLICT (40-60 point range)';
  } else if (divergence.maxRange >= 20) {
    return 'MODERATE CONFLICT (20-40 point range)';
  } else if (divergence.maxRange >= 10) {
    return 'LOW CONFLICT (10-20 point range)';
  } else {
    return 'CONSENSUS (<10 point range)';
  }
}

/**
 * Get most conflicting paradigm pair
 *
 * @param divergence - Divergence metrics
 * @returns Pair name and difference
 */
export function getMostConflictingPair(divergence: ParadigmDivergence): {
  pair: string;
  difference: number;
} {
  const pairs = [
    { pair: 'western_development', difference: divergence.pairwise.western_development },
    { pair: 'western_ecological', difference: divergence.pairwise.western_ecological },
    { pair: 'western_indigenous', difference: divergence.pairwise.western_indigenous },
    { pair: 'development_ecological', difference: divergence.pairwise.development_ecological },
    { pair: 'development_indigenous', difference: divergence.pairwise.development_indigenous },
    { pair: 'ecological_indigenous', difference: divergence.pairwise.ecological_indigenous },
  ];

  return pairs.reduce((max, p) => (p.difference > max.difference ? p : max));
}
