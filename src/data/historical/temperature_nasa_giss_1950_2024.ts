/**
 * Historical Global Surface Temperature Anomalies (1950-2024)
 *
 * Data Sources:
 * - NASA GISS Surface Temperature Analysis (GISTEMP v4)
 *   Source: https://data.giss.nasa.gov/gistemp/
 *   GitHub mirror: https://github.com/datasets/global-temp
 *
 * Notes:
 * - Temperature anomalies are deviations from the 1951-1980 baseline mean
 * - Data combines NOAA GHCN v4 (meteorological stations) and ERSST v5 (ocean areas)
 * - Updated monthly through the most recent complete month
 * - 2024 was the warmest year on record
 *
 * References:
 * - GISTEMP Team (2025). GISS Surface Temperature Analysis (GISTEMP), version 4.
 *   NASA Goddard Institute for Space Studies.
 * - Lenssen et al. (2019). "Improvements in the GISTEMP uncertainty model."
 *   Journal of Geophysical Research: Atmospheres, 124(12), 6307-6326.
 *
 * Last updated: December 2025
 * Baseline: 1951-1980 mean temperature
 * Units: Degrees Celsius (°C) above/below baseline
 */

export interface TemperatureDataPoint {
  year: number;
  tempAnomaly: number; // °C above 1951-1980 baseline
  source: 'NASA_GISS';
  uncertainty?: number; // ± °C (if available)
}

export const ANNUAL_TEMPERATURE_1950_2024: TemperatureDataPoint[] = [
  { year: 1950, tempAnomaly: -0.17, source: 'NASA_GISS' },
  { year: 1951, tempAnomaly: -0.07, source: 'NASA_GISS' },
  { year: 1952, tempAnomaly: 0.01, source: 'NASA_GISS' },
  { year: 1953, tempAnomaly: 0.08, source: 'NASA_GISS' },
  { year: 1954, tempAnomaly: -0.13, source: 'NASA_GISS' },
  { year: 1955, tempAnomaly: -0.14, source: 'NASA_GISS' },
  { year: 1956, tempAnomaly: -0.19, source: 'NASA_GISS' },
  { year: 1957, tempAnomaly: 0.05, source: 'NASA_GISS' },
  { year: 1958, tempAnomaly: 0.06, source: 'NASA_GISS' },
  { year: 1959, tempAnomaly: 0.03, source: 'NASA_GISS' },
  { year: 1960, tempAnomaly: -0.03, source: 'NASA_GISS' },
  { year: 1961, tempAnomaly: 0.06, source: 'NASA_GISS' },
  { year: 1962, tempAnomaly: 0.03, source: 'NASA_GISS' },
  { year: 1963, tempAnomaly: 0.05, source: 'NASA_GISS' },
  { year: 1964, tempAnomaly: -0.20, source: 'NASA_GISS' },
  { year: 1965, tempAnomaly: -0.11, source: 'NASA_GISS' },
  { year: 1966, tempAnomaly: -0.06, source: 'NASA_GISS' },
  { year: 1967, tempAnomaly: -0.02, source: 'NASA_GISS' },
  { year: 1968, tempAnomaly: -0.08, source: 'NASA_GISS' },
  { year: 1969, tempAnomaly: 0.05, source: 'NASA_GISS' },
  { year: 1970, tempAnomaly: 0.03, source: 'NASA_GISS' },
  { year: 1971, tempAnomaly: -0.08, source: 'NASA_GISS' },
  { year: 1972, tempAnomaly: 0.01, source: 'NASA_GISS' },
  { year: 1973, tempAnomaly: 0.16, source: 'NASA_GISS' },
  { year: 1974, tempAnomaly: -0.07, source: 'NASA_GISS' },
  { year: 1975, tempAnomaly: -0.01, source: 'NASA_GISS' },
  { year: 1976, tempAnomaly: -0.10, source: 'NASA_GISS' },
  { year: 1977, tempAnomaly: 0.18, source: 'NASA_GISS' },
  { year: 1978, tempAnomaly: 0.07, source: 'NASA_GISS' },
  { year: 1979, tempAnomaly: 0.17, source: 'NASA_GISS' },
  { year: 1980, tempAnomaly: 0.26, source: 'NASA_GISS' },
  { year: 1981, tempAnomaly: 0.32, source: 'NASA_GISS' },
  { year: 1982, tempAnomaly: 0.14, source: 'NASA_GISS' },
  { year: 1983, tempAnomaly: 0.31, source: 'NASA_GISS' },
  { year: 1984, tempAnomaly: 0.16, source: 'NASA_GISS' },
  { year: 1985, tempAnomaly: 0.12, source: 'NASA_GISS' },
  { year: 1986, tempAnomaly: 0.18, source: 'NASA_GISS' },
  { year: 1987, tempAnomaly: 0.32, source: 'NASA_GISS' },
  { year: 1988, tempAnomaly: 0.39, source: 'NASA_GISS' },
  { year: 1989, tempAnomaly: 0.27, source: 'NASA_GISS' },
  { year: 1990, tempAnomaly: 0.45, source: 'NASA_GISS' },
  { year: 1991, tempAnomaly: 0.40, source: 'NASA_GISS' },
  { year: 1992, tempAnomaly: 0.22, source: 'NASA_GISS' },
  { year: 1993, tempAnomaly: 0.23, source: 'NASA_GISS' },
  { year: 1994, tempAnomaly: 0.31, source: 'NASA_GISS' },
  { year: 1995, tempAnomaly: 0.44, source: 'NASA_GISS' },
  { year: 1996, tempAnomaly: 0.33, source: 'NASA_GISS' },
  { year: 1997, tempAnomaly: 0.46, source: 'NASA_GISS' },
  { year: 1998, tempAnomaly: 0.61, source: 'NASA_GISS' },
  { year: 1999, tempAnomaly: 0.38, source: 'NASA_GISS' },
  { year: 2000, tempAnomaly: 0.39, source: 'NASA_GISS' },
  { year: 2001, tempAnomaly: 0.53, source: 'NASA_GISS' },
  { year: 2002, tempAnomaly: 0.63, source: 'NASA_GISS' },
  { year: 2003, tempAnomaly: 0.62, source: 'NASA_GISS' },
  { year: 2004, tempAnomaly: 0.53, source: 'NASA_GISS' },
  { year: 2005, tempAnomaly: 0.68, source: 'NASA_GISS' },
  { year: 2006, tempAnomaly: 0.64, source: 'NASA_GISS' },
  { year: 2007, tempAnomaly: 0.66, source: 'NASA_GISS' },
  { year: 2008, tempAnomaly: 0.54, source: 'NASA_GISS' },
  { year: 2009, tempAnomaly: 0.66, source: 'NASA_GISS' },
  { year: 2010, tempAnomaly: 0.72, source: 'NASA_GISS' },
  { year: 2011, tempAnomaly: 0.61, source: 'NASA_GISS' },
  { year: 2012, tempAnomaly: 0.64, source: 'NASA_GISS' },
  { year: 2013, tempAnomaly: 0.67, source: 'NASA_GISS' },
  { year: 2014, tempAnomaly: 0.75, source: 'NASA_GISS' },
  { year: 2015, tempAnomaly: 0.90, source: 'NASA_GISS' },
  { year: 2016, tempAnomaly: 1.01, source: 'NASA_GISS' },
  { year: 2017, tempAnomaly: 0.92, source: 'NASA_GISS' },
  { year: 2018, tempAnomaly: 0.85, source: 'NASA_GISS' },
  { year: 2019, tempAnomaly: 0.98, source: 'NASA_GISS' },
  { year: 2020, tempAnomaly: 1.01, source: 'NASA_GISS' },
  { year: 2021, tempAnomaly: 0.85, source: 'NASA_GISS' },
  { year: 2022, tempAnomaly: 0.89, source: 'NASA_GISS' },
  { year: 2023, tempAnomaly: 1.17, source: 'NASA_GISS' },
  { year: 2024, tempAnomaly: 1.28, source: 'NASA_GISS' }, // Warmest year on record
];

/**
 * Get temperature anomaly for a specific year
 * @param year Year (1950-2024)
 * @returns Temperature anomaly in °C, or undefined if year out of range
 */
export function getTemperatureForYear(year: number): number | undefined {
  const entry = ANNUAL_TEMPERATURE_1950_2024.find(d => d.year === year);
  return entry?.tempAnomaly;
}

/**
 * Convert to pre-industrial baseline (1850-1900)
 * NASA estimates ~0.19°C warming from 1850-1900 to 1951-1980 baseline
 * @param year Year
 * @returns Temperature anomaly relative to 1850-1900 baseline
 */
export function getTemperatureAbovePreIndustrial(year: number): number | undefined {
  const anomaly = getTemperatureForYear(year);
  if (anomaly === undefined) return undefined;

  // Adjust from 1951-1980 baseline to 1850-1900 baseline
  // 1951-1980 baseline was ~0.19°C warmer than 1850-1900
  return anomaly + 0.19;
}

/**
 * Validation: Temperature milestones
 * - 1950: -0.17°C (cooler than baseline)
 * - 1998: 0.61°C (first major El Niño peak)
 * - 2016: 1.01°C (previous record)
 * - 2023: 1.17°C (previous record)
 * - 2024: 1.28°C (warmest year on record)
 * - Total warming 1950-2024: ~1.45°C
 * - Above pre-industrial (1850-1900): ~1.47°C in 2024
 */
export const VALIDATION_METRICS = {
  startYear: 1950,
  endYear: 2024,
  baselinePeriod: '1951-1980',
  preIndustrialPeriod: '1850-1900',
  temp_1950_C: -0.17,
  temp_2024_C: 1.28,
  totalWarming_1950_2024_C: 1.28 - (-0.17), // 1.45°C
  warmingAbovePreIndustrial_2024_C: 1.47, // NASA estimate
  recordHeatStreak: 'June 2023 - August 2024', // 15 consecutive months
  parisAgreementThreshold_C: 1.5, // For context
};
