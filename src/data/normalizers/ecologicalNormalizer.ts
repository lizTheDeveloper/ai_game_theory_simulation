/**
 * Ecological Data Normalizer
 *
 * Normalizes planetary boundaries, ecological footprint, and air quality to 0-100 scale.
 *
 * **Ecological Harmony Paradigm Indicators:**
 * 1. Planetary Boundaries (9 boundaries, aggregated)
 * 2. Ecological Footprint (vs biocapacity, INVERTED)
 * 3. Air Quality (PM2.5, INVERTED)
 *
 * @module data/normalizers/ecologicalNormalizer
 */

import type { PlanetaryBoundariesData, BoundaryStatus, EcologicalFootprintData, AirQualityData } from '../loaders/ecologicalLoader';
import type { ParadigmIndicator } from '@/types/multiParadigmDUI';

/**
 * Normalized ecological scores (0-100 scale)
 */
export interface NormalizedEcologicalScores {
  /** Country code (or 'GLOBAL' for boundaries) */
  countryCode: string;

  /** Planetary boundaries score (0-100, lower = more boundaries transgressed) */
  boundariesScore: number;

  /** Ecological footprint score (0-100, INVERTED: lower footprint = higher score) */
  footprintScore: number;

  /** Air quality score (0-100, INVERTED: lower PM2.5 = higher score) */
  airQualityScore: number;

  /** Overall Ecological Harmony paradigm score (weighted arithmetic mean) */
  ecologicalScore: number;

  /** Indicators for paradigm aggregation */
  indicators: ParadigmIndicator[];
}

/**
 * Normalize single planetary boundary to 0-100 scale
 *
 * @param boundary - Boundary status
 * @returns Score (0-100)
 */
export function normalizeBoundary(boundary: BoundaryStatus): number {
  if (boundary.status === 'UNKNOWN') {
    return 50; // Neutral score for unknown boundaries
  }

  if (boundary.current <= boundary.safe) {
    return 100; // Fully safe
  } else if (boundary.current >= boundary.highrisk) {
    return 0; // High risk exceeded
  } else {
    // Linear interpolation between safe and high-risk
    const range = boundary.highrisk - boundary.safe;
    const excess = boundary.current - boundary.safe;
    return 100 * (1 - excess / range);
  }
}

/**
 * Normalize all planetary boundaries
 *
 * Aggregates 9 boundaries using geometric mean.
 *
 * @param boundaries - Planetary boundaries data
 * @returns Aggregate score (0-100)
 */
export function normalizePlanetaryBoundaries(boundaries: PlanetaryBoundariesData): number {
  const scores = [
    normalizeBoundary(boundaries.boundaries.climateChange),
    normalizeBoundary(boundaries.boundaries.biosphereIntegrity),
    normalizeBoundary(boundaries.boundaries.landSystemChange),
    normalizeBoundary(boundaries.boundaries.freshwaterUse),
    normalizeBoundary(boundaries.boundaries.nitrogenFlow),
    normalizeBoundary(boundaries.boundaries.phosphorusFlow),
    normalizeBoundary(boundaries.boundaries.oceanAcidification),
    normalizeBoundary(boundaries.boundaries.atmosphericAerosol),
    normalizeBoundary(boundaries.boundaries.novelEntities),
    normalizeBoundary(boundaries.boundaries.stratosphericOzone),
  ];

  return geometricMean(scores);
}

/**
 * Normalize ecological footprint to 0-100 scale (INVERTED)
 *
 * Footprint ≤1.5 gha = sustainable (100)
 * Footprint ≥10 gha = extreme overconsumption (0)
 *
 * @param footprint - Ecological footprint data
 * @returns Score (0-100)
 */
export function normalizeFootprint(footprint: EcologicalFootprintData): number {
  const target = 1.5; // Sustainable threshold (gha per capita)
  const dystopian = 10.0; // Extreme overconsumption

  if (footprint.totalFootprint <= target) return 100;
  if (footprint.totalFootprint >= dystopian) return 0;

  // Linear interpolation
  return 100 * (1 - (footprint.totalFootprint - target) / (dystopian - target));
}

/**
 * Normalize air quality to 0-100 scale (INVERTED)
 *
 * PM2.5 <5 μg/m³ = utopia (100)
 * PM2.5 ≥50 μg/m³ = dystopia (0)
 *
 * @param airQuality - Air quality data
 * @returns Score (0-100)
 */
export function normalizeAirQuality(airQuality: AirQualityData): number {
  const utopia = 5; // WHO guideline (μg/m³)
  const dystopia = 50; // WHO interim target 1

  if (airQuality.pm25 <= utopia) return 100;
  if (airQuality.pm25 >= dystopia) return 0;

  // Linear interpolation
  return 100 * (1 - (airQuality.pm25 - utopia) / (dystopia - utopia));
}

/**
 * Normalize ecological data for a country
 *
 * Combines planetary boundaries (global), footprint, and air quality.
 *
 * @param boundaries - Planetary boundaries (global)
 * @param footprintData - Country footprint data (optional)
 * @param airQualityData - Country air quality data (optional)
 * @returns Normalized scores
 */
export function normalizeEcological(
  boundaries: PlanetaryBoundariesData,
  footprintData?: EcologicalFootprintData,
  airQualityData?: AirQualityData
): NormalizedEcologicalScores {
  const boundariesScore = normalizePlanetaryBoundaries(boundaries);
  const footprintScore = footprintData ? normalizeFootprint(footprintData) : undefined;
  const airQualityScore = airQualityData ? normalizeAirQuality(airQualityData) : undefined;

  const indicators: ParadigmIndicator[] = [
    {
      id: 'planetary_boundaries',
      name: 'Planetary Boundaries (9 boundaries)',
      value: boundariesScore,
      weight: 0.4, // 40%
      confidence: 'MEDIUM', // ±50% uncertainty on some boundaries
      hasData: true,
    },
  ];

  // Add footprint if available
  if (footprintData && footprintScore !== undefined) {
    indicators.push({
      id: 'ecological_footprint',
      name: 'Ecological Footprint (inverted)',
      value: footprintScore,
      weight: 0.3, // 30%
      confidence: 'HIGH',
      hasData: true,
    });
  }

  // Add air quality if available
  if (airQualityData && airQualityScore !== undefined) {
    indicators.push({
      id: 'air_quality_pm25',
      name: 'Air Quality PM2.5 (inverted)',
      value: airQualityScore,
      weight: 0.3, // 30%
      confidence: 'HIGH',
      hasData: true,
    });
  }

  // Calculate overall score (weighted arithmetic mean)
  // FIX (Nov 2, 2025): Changed from geometric mean (over-penalized single bad scores)
  // to weighted arithmetic mean per planetary boundaries literature
  // (Rockström, Steffen, Richardson et al. 2009-2023)
  const weights = indicators.map(i => i.weight);
  const weightedSum = indicators.reduce((sum, ind) => sum + (ind.value * ind.weight), 0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const ecologicalScore = weightedSum / totalWeight;

  return {
    countryCode: footprintData?.countryCode || airQualityData?.countryCode || 'GLOBAL',
    boundariesScore,
    footprintScore: footprintScore || 0,
    airQualityScore: airQualityScore || 0,
    ecologicalScore,
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
 * Get Ecological paradigm classification
 *
 * @param score - Ecological score (0-100)
 * @returns Classification string
 */
export function getEcologicalClassification(score: number): string {
  if (score >= 80) return 'ECOLOGICAL UTOPIA (all boundaries safe)';
  if (score >= 60) return 'SUSTAINABLE (most boundaries safe)';
  if (score >= 40) return 'INCREASING RISK (some boundaries transgressed)';
  if (score >= 20) return 'HIGH RISK (multiple boundaries transgressed)';
  return 'ECOLOGICAL DYSTOPIA (catastrophic transgression)';
}

/**
 * Normalize batch of countries
 *
 * @param boundaries - Planetary boundaries (global)
 * @param footprintCountries - Footprint data array
 * @param airQualityCountries - Air quality data array
 * @returns Array of normalized scores
 */
export function normalizeEcologicalBatch(
  boundaries: PlanetaryBoundariesData,
  footprintCountries: EcologicalFootprintData[],
  airQualityCountries: AirQualityData[]
): NormalizedEcologicalScores[] {
  // Get unique country codes from both datasets
  const countryCodes = new Set<string>([
    ...footprintCountries.map(f => f.countryCode),
    ...airQualityCountries.map(a => a.countryCode),
  ]);

  return Array.from(countryCodes).map(code => {
    const footprint = footprintCountries.find(f => f.countryCode === code);
    const airQuality = airQualityCountries.find(a => a.countryCode === code);
    return normalizeEcological(boundaries, footprint, airQuality);
  });
}
