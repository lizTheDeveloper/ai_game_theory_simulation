/**
 * V-Dem Data Normalizer
 *
 * Normalizes V-Dem indicators from 0-1 scale to 0-100 scale for geometric mean aggregation.
 *
 * **Western Liberal Paradigm Indicators:**
 * 1. Electoral Democracy Index (v2x_polyarchy): 0-1 → 0-100
 * 2. Liberal Component Index (v2x_liberal): 0-1 → 0-100
 * 3. OPTIONAL: Egalitarian Component (v2x_egalitarian): 0-1 → 0-100
 *
 * @module data/normalizers/vdemNormalizer
 */

import type { VDemCountryData } from '../loaders/vdemLoader';
import type { ParadigmIndicator } from '@/types/multiParadigmDUI';

/**
 * Normalized V-Dem scores (0-100 scale)
 */
export interface NormalizedVDemScores {
  /** Country code */
  countryCode: string;

  /** Electoral democracy (0-100) */
  electoralDemocracy: number;

  /** Liberal component (0-100) */
  liberalComponent: number;

  /** Egalitarian component (0-100, optional) */
  egalitarianComponent?: number;

  /** Overall Western Liberal paradigm score (geometric mean of indicators) */
  westernLiberalScore: number;

  /** Indicators for paradigm aggregation */
  indicators: ParadigmIndicator[];
}

/**
 * Normalize V-Dem data to 0-100 scale
 *
 * V-Dem already on 0-1 scale, just multiply by 100.
 *
 * @param vdem - V-Dem country data
 * @param includeEgalitarian - Include egalitarian component (default: false)
 * @returns Normalized scores
 */
export function normalizeVDem(
  vdem: VDemCountryData,
  includeEgalitarian: boolean = false
): NormalizedVDemScores {
  // Normalize to 0-100 scale
  const electoralDemocracy = vdem.electoralDemocracy * 100;
  const liberalComponent = vdem.liberalComponent * 100;
  const egalitarianComponent = vdem.egalitarianComponent ? vdem.egalitarianComponent * 100 : undefined;

  // Build indicators array
  const indicators: ParadigmIndicator[] = [
    {
      id: 'vdem_electoral_democracy',
      name: 'V-Dem Electoral Democracy Index',
      value: electoralDemocracy,
      weight: includeEgalitarian ? 0.4 : 0.5, // 40% if 3 indicators, 50% if 2
      confidence: 'HIGH',
      hasData: true,
      uncertaintyBand: vdem.uncertainty
        ? {
            low: vdem.uncertainty.electoralDemocracy.low * 100,
            high: vdem.uncertainty.electoralDemocracy.high * 100,
            source: 'V-Dem measurement uncertainty',
          }
        : undefined,
    },
    {
      id: 'vdem_liberal_component',
      name: 'V-Dem Liberal Component Index',
      value: liberalComponent,
      weight: includeEgalitarian ? 0.4 : 0.5, // 40% if 3 indicators, 50% if 2
      confidence: 'HIGH',
      hasData: true,
      uncertaintyBand: vdem.uncertainty
        ? {
            low: vdem.uncertainty.liberalComponent.low * 100,
            high: vdem.uncertainty.liberalComponent.high * 100,
            source: 'V-Dem measurement uncertainty',
          }
        : undefined,
    },
  ];

  // Add egalitarian if requested
  if (includeEgalitarian && egalitarianComponent !== undefined) {
    indicators.push({
      id: 'vdem_egalitarian_component',
      name: 'V-Dem Egalitarian Component Index',
      value: egalitarianComponent,
      weight: 0.2, // 20% (3 indicators total)
      confidence: 'HIGH',
      hasData: true,
      uncertaintyBand: vdem.uncertainty?.egalitarianComponent
        ? {
            low: vdem.uncertainty.egalitarianComponent.low * 100,
            high: vdem.uncertainty.egalitarianComponent.high * 100,
            source: 'V-Dem measurement uncertainty',
          }
        : undefined,
    });
  }

  // Calculate overall score (geometric mean)
  const westernLiberalScore = geometricMean(indicators.map(i => i.value));

  return {
    countryCode: vdem.countryCode,
    electoralDemocracy,
    liberalComponent,
    egalitarianComponent,
    westernLiberalScore,
    indicators,
  };
}

/**
 * Simple geometric mean (inline to avoid circular dependency)
 *
 * @param values - Values to average
 * @returns Geometric mean
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
 * Get Western Liberal paradigm classification
 *
 * @param score - Western Liberal score (0-100)
 * @returns Classification string
 */
export function getWesternLiberalClassification(score: number): string {
  if (score >= 85) return 'LIBERAL DEMOCRACY (utopia)';
  if (score >= 70) return 'ELECTORAL DEMOCRACY';
  if (score >= 50) return 'HYBRID REGIME';
  if (score >= 30) return 'ELECTORAL AUTOCRACY';
  return 'CLOSED AUTOCRACY (dystopia)';
}

/**
 * Normalize batch of V-Dem countries
 *
 * @param countries - V-Dem country data array
 * @param includeEgalitarian - Include egalitarian component
 * @returns Array of normalized scores
 */
export function normalizeVDemBatch(
  countries: VDemCountryData[],
  includeEgalitarian: boolean = false
): NormalizedVDemScores[] {
  return countries.map(country => normalizeVDem(country, includeEgalitarian));
}
