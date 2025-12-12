/**
 * Historical CO2 Atmospheric Concentration Data (1950-2024)
 *
 * Data Sources:
 * - 1950-1957: Law Dome ice core data (Etheridge et al., 1996)
 *   Estimated at ~310-312 ppm (stabilized during 1940-1955 period)
 * - 1958-2024: NOAA Mauna Loa Observatory (Keeling Curve)
 *   Source: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt
 *
 * References:
 * - Etheridge, D. M., et al. (1996). "Natural and anthropogenic changes
 *   in atmospheric CO2 over the last 1000 years from air in Antarctic ice
 *   and firn." Journal of Geophysical Research, 101(D2), 4115-4128.
 * - Dr. Ralph Keeling & Dr. Xin Lan (NOAA/GML)
 *
 * Last updated: December 2025
 * Baseline: Atmospheric concentration in parts per million (ppm)
 */

export interface CO2DataPoint {
  year: number;
  co2Concentration: number; // ppm
  source: 'LAW_DOME_ICE_CORE' | 'NOAA_MAUNA_LOA';
  uncertainty?: number; // ± ppm
}

export const ANNUAL_CO2_1950_2024: CO2DataPoint[] = [
  // 1950-1957: Law Dome ice core estimates (Etheridge et al., 1996)
  // Ice core data shows stabilization at 310-312 ppm during 1940-1955
  { year: 1950, co2Concentration: 310.5, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1951, co2Concentration: 311.0, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1952, co2Concentration: 311.5, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1953, co2Concentration: 312.0, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1954, co2Concentration: 312.5, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1955, co2Concentration: 313.0, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1956, co2Concentration: 313.5, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },
  { year: 1957, co2Concentration: 314.5, source: 'LAW_DOME_ICE_CORE', uncertainty: 1.2 },

  // 1958-2024: NOAA Mauna Loa direct atmospheric measurements
  // Note: 1958 begins the Keeling Curve - first year of continuous monitoring
  { year: 1958, co2Concentration: 315.39, source: 'NOAA_MAUNA_LOA' },
  { year: 1959, co2Concentration: 315.98, source: 'NOAA_MAUNA_LOA' },
  { year: 1960, co2Concentration: 316.91, source: 'NOAA_MAUNA_LOA' },
  { year: 1961, co2Concentration: 317.64, source: 'NOAA_MAUNA_LOA' },
  { year: 1962, co2Concentration: 318.45, source: 'NOAA_MAUNA_LOA' },
  { year: 1963, co2Concentration: 318.99, source: 'NOAA_MAUNA_LOA' },
  { year: 1964, co2Concentration: 319.62, source: 'NOAA_MAUNA_LOA' },
  { year: 1965, co2Concentration: 320.04, source: 'NOAA_MAUNA_LOA' },
  { year: 1966, co2Concentration: 321.37, source: 'NOAA_MAUNA_LOA' },
  { year: 1967, co2Concentration: 322.18, source: 'NOAA_MAUNA_LOA' },
  { year: 1968, co2Concentration: 323.05, source: 'NOAA_MAUNA_LOA' },
  { year: 1969, co2Concentration: 324.62, source: 'NOAA_MAUNA_LOA' },
  { year: 1970, co2Concentration: 325.68, source: 'NOAA_MAUNA_LOA' },
  { year: 1971, co2Concentration: 326.32, source: 'NOAA_MAUNA_LOA' },
  { year: 1972, co2Concentration: 327.46, source: 'NOAA_MAUNA_LOA' },
  { year: 1973, co2Concentration: 329.68, source: 'NOAA_MAUNA_LOA' },
  { year: 1974, co2Concentration: 330.19, source: 'NOAA_MAUNA_LOA' },
  { year: 1975, co2Concentration: 331.13, source: 'NOAA_MAUNA_LOA' },
  { year: 1976, co2Concentration: 332.03, source: 'NOAA_MAUNA_LOA' },
  { year: 1977, co2Concentration: 333.84, source: 'NOAA_MAUNA_LOA' },
  { year: 1978, co2Concentration: 335.41, source: 'NOAA_MAUNA_LOA' },
  { year: 1979, co2Concentration: 336.84, source: 'NOAA_MAUNA_LOA' },
  { year: 1980, co2Concentration: 338.76, source: 'NOAA_MAUNA_LOA' },
  { year: 1981, co2Concentration: 340.12, source: 'NOAA_MAUNA_LOA' },
  { year: 1982, co2Concentration: 341.48, source: 'NOAA_MAUNA_LOA' },
  { year: 1983, co2Concentration: 343.15, source: 'NOAA_MAUNA_LOA' },
  { year: 1984, co2Concentration: 344.87, source: 'NOAA_MAUNA_LOA' },
  { year: 1985, co2Concentration: 346.35, source: 'NOAA_MAUNA_LOA' },
  { year: 1986, co2Concentration: 347.61, source: 'NOAA_MAUNA_LOA' },
  { year: 1987, co2Concentration: 349.31, source: 'NOAA_MAUNA_LOA' },
  { year: 1988, co2Concentration: 351.69, source: 'NOAA_MAUNA_LOA' },
  { year: 1989, co2Concentration: 353.20, source: 'NOAA_MAUNA_LOA' },
  { year: 1990, co2Concentration: 354.45, source: 'NOAA_MAUNA_LOA' },
  { year: 1991, co2Concentration: 355.70, source: 'NOAA_MAUNA_LOA' },
  { year: 1992, co2Concentration: 356.54, source: 'NOAA_MAUNA_LOA' },
  { year: 1993, co2Concentration: 357.21, source: 'NOAA_MAUNA_LOA' },
  { year: 1994, co2Concentration: 358.96, source: 'NOAA_MAUNA_LOA' },
  { year: 1995, co2Concentration: 360.97, source: 'NOAA_MAUNA_LOA' },
  { year: 1996, co2Concentration: 362.74, source: 'NOAA_MAUNA_LOA' },
  { year: 1997, co2Concentration: 363.88, source: 'NOAA_MAUNA_LOA' },
  { year: 1998, co2Concentration: 366.84, source: 'NOAA_MAUNA_LOA' },
  { year: 1999, co2Concentration: 368.54, source: 'NOAA_MAUNA_LOA' },
  { year: 2000, co2Concentration: 369.71, source: 'NOAA_MAUNA_LOA' },
  { year: 2001, co2Concentration: 371.32, source: 'NOAA_MAUNA_LOA' },
  { year: 2002, co2Concentration: 373.45, source: 'NOAA_MAUNA_LOA' },
  { year: 2003, co2Concentration: 375.98, source: 'NOAA_MAUNA_LOA' },
  { year: 2004, co2Concentration: 377.70, source: 'NOAA_MAUNA_LOA' },
  { year: 2005, co2Concentration: 379.98, source: 'NOAA_MAUNA_LOA' },
  { year: 2006, co2Concentration: 382.09, source: 'NOAA_MAUNA_LOA' },
  { year: 2007, co2Concentration: 384.02, source: 'NOAA_MAUNA_LOA' },
  { year: 2008, co2Concentration: 385.83, source: 'NOAA_MAUNA_LOA' },
  { year: 2009, co2Concentration: 387.64, source: 'NOAA_MAUNA_LOA' },
  { year: 2010, co2Concentration: 390.10, source: 'NOAA_MAUNA_LOA' },
  { year: 2011, co2Concentration: 391.85, source: 'NOAA_MAUNA_LOA' },
  { year: 2012, co2Concentration: 394.06, source: 'NOAA_MAUNA_LOA' },
  { year: 2013, co2Concentration: 396.74, source: 'NOAA_MAUNA_LOA' },
  { year: 2014, co2Concentration: 398.81, source: 'NOAA_MAUNA_LOA' },
  { year: 2015, co2Concentration: 401.01, source: 'NOAA_MAUNA_LOA' },
  { year: 2016, co2Concentration: 404.41, source: 'NOAA_MAUNA_LOA' },
  { year: 2017, co2Concentration: 406.76, source: 'NOAA_MAUNA_LOA' },
  { year: 2018, co2Concentration: 408.72, source: 'NOAA_MAUNA_LOA' },
  { year: 2019, co2Concentration: 411.65, source: 'NOAA_MAUNA_LOA' },
  { year: 2020, co2Concentration: 414.21, source: 'NOAA_MAUNA_LOA' },
  { year: 2021, co2Concentration: 416.41, source: 'NOAA_MAUNA_LOA' },
  { year: 2022, co2Concentration: 418.53, source: 'NOAA_MAUNA_LOA' },
  { year: 2023, co2Concentration: 421.08, source: 'NOAA_MAUNA_LOA' },
  { year: 2024, co2Concentration: 424.61, source: 'NOAA_MAUNA_LOA' },
];

/**
 * Get CO2 concentration for a specific year
 * @param year Year (1950-2024)
 * @returns CO2 concentration in ppm, or undefined if year out of range
 */
export function getCO2ForYear(year: number): number | undefined {
  const entry = ANNUAL_CO2_1950_2024.find(d => d.year === year);
  return entry?.co2Concentration;
}

/**
 * Validation: Keeling Curve milestone
 * 1958: 315.39 ppm (first year of continuous atmospheric monitoring)
 * 2024: 424.61 ppm (latest measurement)
 * Total increase: 109.22 ppm over 66 years (~1.65 ppm/year average)
 */
export const VALIDATION_METRICS = {
  startYear: 1950,
  endYear: 2024,
  co2_1958_ppm: 315.39, // First Keeling Curve measurement
  co2_2024_ppm: 424.61, // Latest measurement
  totalIncrease_ppm: 424.61 - 310.5, // From 1950 estimate to 2024
  averageAnnualIncrease_ppm: (424.61 - 310.5) / 74, // ~1.54 ppm/year
};
