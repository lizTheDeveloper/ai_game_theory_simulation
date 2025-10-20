/**
 * WVS Data Normalizer
 *
 * Normalizes World Values Survey data (social trust, community importance, civic participation)
 * to 0-100 scale for Indigenous/Communitarian paradigm measurement.
 *
 * **Indigenous Paradigm Indicators:**
 * 1. Social Trust (Q57): "Most people can be trusted" (0-100)
 * 2. Community Importance (Q6): "How important is community in your life?" (0-100)
 * 3. Civic Participation (Q98-Q108): Active membership in voluntary organizations (0-100)
 *
 * **Aggregation:** Geometric mean (non-compensatory)
 *
 * @module data/normalizers/wvsNormalizer
 */

import type { WVSCountryData } from '../loaders/wvsLoader';
import type { ParadigmIndicator } from '@/types/multiParadigmDUI';

/**
 * Normalized WVS scores (0-100 scale)
 */
export interface NormalizedWVSScores {
  /** Country code */
  countryCode: string;

  /** Social trust score (0-100) */
  socialTrust: number;

  /** Community importance score (0-100) */
  communityImportance: number;

  /** Civic participation score (0-100) */
  civicParticipation: number;

  /** Overall Indigenous paradigm score (geometric mean) */
  indigenousScore: number;

  /** Indicators for paradigm aggregation */
  indicators: ParadigmIndicator[];
}

/**
 * Normalize WVS data to 0-100 scale
 *
 * WVS data is already in percentage format (0-100), so normalization is pass-through.
 * The key work is aggregation via geometric mean.
 *
 * @param wvs - WVS country data
 * @returns Normalized scores
 */
export function normalizeWVS(wvs: WVSCountryData): NormalizedWVSScores {
  // WVS data already in 0-100 range, no transformation needed
  const socialTrust = wvs.socialTrust;
  const communityImportance = wvs.communityImportance;
  const civicParticipation = wvs.civicParticipation;

  // Build indicators array
  const indicators: ParadigmIndicator[] = [
    {
      id: 'social_trust',
      name: 'Social Trust (Q57)',
      value: socialTrust,
      weight: 0.35, // 35%
      confidence: 'HIGH',
      hasData: true,
    },
    {
      id: 'community_importance',
      name: 'Community Importance (Q6)',
      value: communityImportance,
      weight: 0.35, // 35%
      confidence: 'HIGH',
      hasData: true,
    },
    {
      id: 'civic_participation',
      name: 'Civic Participation (Q98-Q108)',
      value: civicParticipation,
      weight: 0.30, // 30%
      confidence: 'HIGH',
      hasData: true,
    },
  ];

  // Calculate overall Indigenous score (geometric mean)
  const indigenousScore = geometricMean(indicators.map(i => i.value));

  return {
    countryCode: wvs.countryCode,
    socialTrust,
    communityImportance,
    civicParticipation,
    indigenousScore,
    indicators,
  };
}

/**
 * Simple geometric mean (inline to avoid circular dependency)
 *
 * Uses MIN_FLOOR = 0.1 to prevent zero breakdown (inherited from Phase 3).
 */
function geometricMean(values: number[]): number {
  const MIN_FLOOR = 0.1;
  const product = values.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);
  return Math.pow(product, 1 / values.length) * 100;
}

/**
 * Get Indigenous paradigm classification
 *
 * @param score - Indigenous score (0-100)
 * @returns Classification string
 */
export function getIndigenousClassification(score: number): string {
  if (score >= 80) return 'STRONG COMMUNITARIAN (high trust, high community, high participation)';
  if (score >= 60) return 'COMMUNITARIAN (strong community bonds)';
  if (score >= 40) return 'HYBRID (some communitarian elements)';
  if (score >= 20) return 'INDIVIDUALIST (weak community bonds)';
  return 'FRAGMENTED (very low trust and community)';
}

/**
 * Normalize batch of countries
 *
 * @param wvsCountries - WVS data array
 * @returns Array of normalized scores
 */
export function normalizeWVSBatch(wvsCountries: WVSCountryData[]): NormalizedWVSScores[] {
  return wvsCountries.map(wvs => normalizeWVS(wvs));
}
