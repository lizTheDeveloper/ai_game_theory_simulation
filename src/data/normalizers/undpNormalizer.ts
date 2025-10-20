/**
 * UNDP Data Normalizer
 *
 * Normalizes UNDP HDI and MPI from 0-1 scale to 0-100 scale for geometric mean aggregation.
 *
 * **Development Needs Paradigm Indicators:**
 * 1. Human Development Index (HDI): 0-1 → 0-100 (higher = better)
 * 2. Multidimensional Poverty Index (MPI): 0-1 → 0-100 (INVERTED: lower MPI = higher score)
 *
 * @module data/normalizers/undpNormalizer
 */

import type { HDICountryData, MPICountryData } from '../loaders/undpLoader';
import type { ParadigmIndicator } from '@/types/multiParadigmDUI';

/**
 * Normalized UNDP scores (0-100 scale)
 */
export interface NormalizedUNDPScores {
  /** Country code */
  countryCode: string;

  /** HDI (0-100, higher = better) */
  hdi: number;

  /** MPI (0-100, INVERTED: lower poverty = higher score) */
  mpi: number;

  /** Overall Development Needs paradigm score (geometric mean) */
  developmentScore: number;

  /** Indicators for paradigm aggregation */
  indicators: ParadigmIndicator[];
}

/**
 * Normalize HDI to 0-100 scale
 *
 * HDI already on 0-1 scale, just multiply by 100.
 *
 * @param hdi - HDI value (0-1)
 * @returns HDI score (0-100)
 */
export function normalizeHDI(hdi: number): number {
  return hdi * 100;
}

/**
 * Normalize MPI to 0-100 scale (INVERTED)
 *
 * MPI: 0 = no poverty (good), 1 = maximum poverty (bad)
 * Score: 100 = no poverty, 0 = maximum poverty
 *
 * @param mpi - MPI value (0-1)
 * @returns Inverted MPI score (0-100)
 */
export function normalizeMPI(mpi: number): number {
  // Invert: low MPI = high score
  return (1 - mpi) * 100;
}

/**
 * Normalize UNDP data for a country
 *
 * Combines HDI and MPI (if available) into Development paradigm score.
 *
 * @param hdiData - HDI country data
 * @param mpiData - MPI country data (optional, only 112 countries have MPI)
 * @returns Normalized scores
 */
export function normalizeUNDP(
  hdiData: HDICountryData,
  mpiData?: MPICountryData
): NormalizedUNDPScores {
  const hdiScore = normalizeHDI(hdiData.hdi);
  const mpiScore = mpiData ? normalizeMPI(mpiData.mpi) : undefined;

  const indicators: ParadigmIndicator[] = [
    {
      id: 'undp_hdi',
      name: 'UNDP Human Development Index',
      value: hdiScore,
      weight: mpiData ? 0.5 : 1.0, // 50% if MPI available, 100% if not
      confidence: 'HIGH',
      hasData: true,
    },
  ];

  // Add MPI if available (only 112 countries)
  if (mpiData && mpiScore !== undefined) {
    indicators.push({
      id: 'ophi_mpi',
      name: 'OPHI Multidimensional Poverty Index (inverted)',
      value: mpiScore,
      weight: 0.5, // 50%
      confidence: 'HIGH',
      hasData: true,
    });
  }

  // Calculate overall score (geometric mean)
  const developmentScore = geometricMean(indicators.map(i => i.value));

  return {
    countryCode: hdiData.countryCode,
    hdi: hdiScore,
    mpi: mpiScore || 0, // 0 if no MPI data
    developmentScore,
    indicators,
  };
}

/**
 * Simple geometric mean (inline to avoid circular dependency)
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
 * Get Development paradigm classification
 *
 * @param score - Development score (0-100)
 * @returns Classification string
 */
export function getDevelopmentClassification(score: number): string {
  if (score >= 85) return 'VERY HIGH DEVELOPMENT (utopia)';
  if (score >= 70) return 'HIGH DEVELOPMENT';
  if (score >= 55) return 'MEDIUM DEVELOPMENT';
  if (score >= 40) return 'LOW DEVELOPMENT';
  return 'EXTREME DEPRIVATION (dystopia)';
}

/**
 * Get HDI category classification
 *
 * Official UNDP categories.
 *
 * @param hdi - HDI score (0-100)
 * @returns HDI category
 */
export function getHDICategory(hdi: number): string {
  if (hdi >= 80) return 'VERY HIGH HDI';
  if (hdi >= 70) return 'HIGH HDI';
  if (hdi >= 55) return 'MEDIUM HDI';
  return 'LOW HDI';
}

/**
 * Normalize batch of countries
 *
 * Joins HDI and MPI data by country code.
 *
 * @param hdiCountries - HDI data array
 * @param mpiCountries - MPI data array
 * @returns Array of normalized scores
 */
export function normalizeUNDPBatch(
  hdiCountries: HDICountryData[],
  mpiCountries: MPICountryData[]
): NormalizedUNDPScores[] {
  return hdiCountries.map(hdi => {
    const mpi = mpiCountries.find(m => m.countryCode === hdi.countryCode);
    return normalizeUNDP(hdi, mpi);
  });
}
