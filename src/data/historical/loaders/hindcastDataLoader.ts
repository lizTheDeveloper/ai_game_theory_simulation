/**
 * Unified Hindcast Data Loader
 *
 * Single interface to query historical data (1950-2024) for hindcast validation.
 * Provides unified access to 5 historical datasets:
 * - Temperature (NASA GISS)
 * - CO2 concentration (Keeling Curve)
 * - Sea level (NOAA)
 * - GDP (World Bank)
 * - Population (UN WPP)
 *
 * **Usage Pattern:**
 * ```typescript
 * // Get single value
 * const temp2020 = getHindcastValue('temperature', 2020);
 *
 * // Get full dataset
 * const tempData = getHindcastDataset('temperature');
 *
 * // Get time slice for validation
 * const validationData = getHindcastSlice('temperature', 2000, 2024);
 *
 * // Multi-metric validation
 * const metrics2020 = getAllMetricsForYear(2020);
 *
 * // Calculate growth rates
 * const tempGrowth = calculateGrowthRate('temperature', 2000, 2024);
 * ```
 *
 * @module data/historical/loaders/hindcastDataLoader
 */

import {
  ANNUAL_TEMPERATURE_1950_2024,
  getTemperatureForYear,
} from '../temperature_nasa_giss_1950_2024';
import {
  ANNUAL_CO2_1950_2024,
  getCO2ForYear,
} from '../co2_keeling_curve_1950_2024';
import {
  ANNUAL_SEA_LEVEL_1950_2024,
  getSeaLevelForYear,
} from '../sea_level_noaa_1950_2024';
import {
  ANNUAL_GDP_1950_2024,
  getGDPForYear,
} from '../gdp_world_bank_1950_2024';
import {
  ANNUAL_POPULATION_1950_2024,
  getPopulationForYear,
} from '../population_un_wpp_1950_2024';

/**
 * Supported hindcast metrics
 */
export type HindcastMetric = 'temperature' | 'co2' | 'sea_level' | 'gdp' | 'population';

/**
 * Single data point in a hindcast time series
 */
export interface HindcastDataPoint {
  /** Calendar year */
  year: number;
  /** Metric value */
  value: number;
  /** Uncertainty (if available) */
  uncertainty?: number;
  /** Data source identifier */
  source: string;
}

/**
 * Complete hindcast dataset for a metric
 */
export interface HindcastDataset {
  /** Metric identifier */
  metric: HindcastMetric;
  /** First year of data coverage */
  startYear: number;
  /** Last year of data coverage */
  endYear: number;
  /** Annual data points */
  data: HindcastDataPoint[];
  /** Units of measurement */
  units: string;
  /** Primary data source */
  source: string;
  /** Human-readable description */
  description: string;
}

/**
 * Validation thresholds from research
 *
 * RMSE, R², and bias thresholds for 2000-2024 validation period.
 * These are derived from literature review of climate/economic model validation.
 *
 * Sources:
 * - Climate metrics: IPCC AR6 WG1 Chapter 3 (model evaluation standards)
 * - Economic metrics: World Bank/IMF forecasting accuracy benchmarks
 */
export const VALIDATION_THRESHOLDS: Record<
  HindcastMetric,
  {
    /** Root Mean Square Error threshold */
    rmse: number;
    /** R-squared threshold (minimum acceptable) */
    r_squared: number;
    /** Maximum acceptable bias */
    bias: number;
    /** Units for threshold values */
    units: string;
  }
> = {
  temperature: {
    rmse: 0.15, // ±0.15°C acceptable error
    r_squared: 0.90, // Strong correlation required
    bias: 0.05, // Max ±0.05°C systematic bias
    units: '°C',
  },
  co2: {
    rmse: 5, // ±5 ppm acceptable error
    r_squared: 0.98, // Very strong correlation (Keeling Curve is smooth)
    bias: 2, // Max ±2 ppm systematic bias
    units: 'ppm',
  },
  sea_level: {
    rmse: 10, // ±10 mm acceptable error
    r_squared: 0.95, // Strong correlation required
    bias: 5, // Max ±5 mm systematic bias
    units: 'mm',
  },
  gdp: {
    rmse: 5, // ±5% acceptable error
    r_squared: 0.95, // Strong correlation required
    bias: 2, // Max ±2% systematic bias
    units: '%',
  },
  population: {
    rmse: 50, // ±50 million acceptable error
    r_squared: 0.99, // Very strong correlation (demographics are smooth)
    bias: 1, // Max ±1% systematic bias
    units: 'million',
  },
};

/**
 * Get full dataset for a metric
 *
 * Returns complete time series (1950-2024) with metadata.
 *
 * @param metric - Metric identifier
 * @returns Complete hindcast dataset
 * @throws Error if metric is invalid
 *
 * @example
 * ```typescript
 * const tempData = getHindcastDataset('temperature');
 * console.log(`Coverage: ${tempData.startYear}-${tempData.endYear}`);
 * console.log(`Data points: ${tempData.data.length}`);
 * ```
 */
export function getHindcastDataset(metric: HindcastMetric): HindcastDataset {
  switch (metric) {
    case 'temperature':
      return {
        metric: 'temperature',
        startYear: 1950,
        endYear: 2024,
        data: ANNUAL_TEMPERATURE_1950_2024.map((d) => ({
          year: d.year,
          value: d.tempAnomaly,
          uncertainty: d.uncertainty,
          source: d.source,
        })),
        units: '°C (anomaly vs 1951-1980 baseline)',
        source: 'NASA GISS GISTEMP v4',
        description: 'Global surface temperature anomaly relative to 1951-1980 baseline',
      };

    case 'co2':
      return {
        metric: 'co2',
        startYear: 1950,
        endYear: 2024,
        data: ANNUAL_CO2_1950_2024.map((d) => ({
          year: d.year,
          value: d.co2Concentration,
          uncertainty: d.uncertainty,
          source: d.source,
        })),
        units: 'ppm',
        source: 'NOAA Mauna Loa Observatory (Keeling Curve)',
        description: 'Atmospheric CO2 concentration from ice cores (1950-1957) and direct measurements (1958-2024)',
      };

    case 'sea_level':
      return {
        metric: 'sea_level',
        startYear: 1950,
        endYear: 2024,
        data: ANNUAL_SEA_LEVEL_1950_2024.map((d) => ({
          year: d.year,
          value: d.seaLevel_mm,
          uncertainty: d.uncertainty,
          source: d.source,
        })),
        units: 'mm (above 1990.5 baseline)',
        source: 'CSIRO tide gauges (1950-2013) + NOAA satellite altimetry (2014-2024)',
        description: 'Global mean sea level rise relative to 1990.5 baseline',
      };

    case 'gdp':
      return {
        metric: 'gdp',
        startYear: 1950,
        endYear: 2024,
        data: ANNUAL_GDP_1950_2024.map((d) => ({
          year: d.year,
          value: d.gdp_trillions,
          source: d.source,
        })),
        units: 'trillion 2021 int$ (PPP)',
        source: 'Maddison Project (1950-1989) + World Bank (1990-2024)',
        description: 'World GDP in constant 2021 international dollars (PPP-adjusted)',
      };

    case 'population':
      return {
        metric: 'population',
        startYear: 1950,
        endYear: 2024,
        data: ANNUAL_POPULATION_1950_2024.map((d) => ({
          year: d.year,
          value: d.population,
          source: d.source,
        })),
        units: 'billions',
        source: 'UN World Population Prospects 2024',
        description: 'World population mid-year estimates',
      };

    default:
      throw new Error(
        `Invalid hindcast metric: "${metric}". Valid options: temperature, co2, sea_level, gdp, population`
      );
  }
}

/**
 * Get value for specific year/metric
 *
 * Returns undefined if year not found (avoids throwing for range checks).
 *
 * @param metric - Metric identifier
 * @param year - Calendar year (1950-2024)
 * @returns Metric value, or undefined if year not in dataset
 * @throws Error if metric is invalid
 *
 * @example
 * ```typescript
 * const temp2020 = getHindcastValue('temperature', 2020);
 * if (temp2020 !== undefined) {
 *   console.log(`Temperature in 2020: ${temp2020}°C`);
 * }
 * ```
 */
export function getHindcastValue(metric: HindcastMetric, year: number): number | undefined {
  // Validate year range
  if (year < 1950 || year > 2024) {
    return undefined;
  }

  switch (metric) {
    case 'temperature':
      return getTemperatureForYear(year);
    case 'co2':
      return getCO2ForYear(year);
    case 'sea_level':
      return getSeaLevelForYear(year);
    case 'gdp':
      return getGDPForYear(year);
    case 'population':
      return getPopulationForYear(year);
    default:
      throw new Error(
        `Invalid hindcast metric: "${metric}". Valid options: temperature, co2, sea_level, gdp, population`
      );
  }
}

/**
 * Get time series slice for calibration/validation
 *
 * Returns data points within [startYear, endYear] inclusive.
 * Typical usage: 1950-1999 for calibration, 2000-2024 for validation.
 *
 * @param metric - Metric identifier
 * @param startYear - First year (inclusive)
 * @param endYear - Last year (inclusive)
 * @returns Array of data points in range
 * @throws Error if metric is invalid or year range is invalid
 *
 * @example
 * ```typescript
 * // Get validation period data
 * const validationData = getHindcastSlice('temperature', 2000, 2024);
 * console.log(`Validation points: ${validationData.length}`);
 * ```
 */
export function getHindcastSlice(
  metric: HindcastMetric,
  startYear: number,
  endYear: number
): HindcastDataPoint[] {
  // Validate year range
  if (startYear < 1950 || startYear > 2024) {
    throw new Error(`startYear ${startYear} out of range [1950, 2024]`);
  }
  if (endYear < 1950 || endYear > 2024) {
    throw new Error(`endYear ${endYear} out of range [1950, 2024]`);
  }
  if (startYear > endYear) {
    throw new Error(`startYear ${startYear} cannot be greater than endYear ${endYear}`);
  }

  const dataset = getHindcastDataset(metric);
  return dataset.data.filter((d) => d.year >= startYear && d.year <= endYear);
}

/**
 * Get all metrics for a specific year (for multi-metric validation)
 *
 * Returns a record with all 5 metrics. Values may be undefined if data unavailable.
 * Useful for cross-metric correlation analysis.
 *
 * @param year - Calendar year (1950-2024)
 * @returns Record of all metric values
 *
 * @example
 * ```typescript
 * const metrics2020 = getAllMetricsForYear(2020);
 * console.log(`Temperature: ${metrics2020.temperature}°C`);
 * console.log(`CO2: ${metrics2020.co2} ppm`);
 * console.log(`Population: ${metrics2020.population}B`);
 * ```
 */
export function getAllMetricsForYear(year: number): Record<HindcastMetric, number | undefined> {
  return {
    temperature: getHindcastValue('temperature', year),
    co2: getHindcastValue('co2', year),
    sea_level: getHindcastValue('sea_level', year),
    gdp: getHindcastValue('gdp', year),
    population: getHindcastValue('population', year),
  };
}

/**
 * Calculate growth rate between two years
 *
 * Returns compound annual growth rate (CAGR) as percentage.
 * For additive metrics (temperature, sea level), returns absolute change per year.
 *
 * @param metric - Metric identifier
 * @param startYear - Starting year
 * @param endYear - Ending year
 * @returns Growth rate (% per year for gdp/population, absolute change per year for others)
 * @throws Error if metric is invalid or years are out of range
 *
 * @example
 * ```typescript
 * // Population CAGR 2000-2024
 * const popGrowth = calculateGrowthRate('population', 2000, 2024);
 * console.log(`Population grew ${popGrowth.toFixed(2)}% per year`);
 *
 * // Temperature change per year
 * const tempGrowth = calculateGrowthRate('temperature', 2000, 2024);
 * console.log(`Temperature increased ${tempGrowth.toFixed(3)}°C per year`);
 * ```
 */
export function calculateGrowthRate(
  metric: HindcastMetric,
  startYear: number,
  endYear: number
): number | undefined {
  const startValue = getHindcastValue(metric, startYear);
  const endValue = getHindcastValue(metric, endYear);

  if (startValue === undefined || endValue === undefined) {
    return undefined;
  }

  const years = endYear - startYear;
  if (years <= 0) {
    throw new Error(`endYear ${endYear} must be greater than startYear ${startYear}`);
  }

  // For GDP and population, calculate CAGR (compound annual growth rate)
  if (metric === 'gdp' || metric === 'population') {
    if (startValue <= 0) {
      throw new Error(`Cannot calculate growth rate: startValue ${startValue} must be positive`);
    }
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  // For temperature, CO2, sea level, calculate average annual change
  return (endValue - startValue) / years;
}

/**
 * Validate year is in dataset range
 *
 * @param year - Year to validate
 * @returns True if year is in [1950, 2024] range
 */
export function isValidYear(year: number): boolean {
  return year >= 1950 && year <= 2024;
}

/**
 * Get available year range for all datasets
 *
 * @returns Object with startYear and endYear
 */
export function getYearRange(): { startYear: number; endYear: number } {
  return { startYear: 1950, endYear: 2024 };
}
