/**
 * Historical World Population Data (1950-2024)
 *
 * Data Sources:
 * - United Nations World Population Prospects 2024 Revision
 *   Source: https://population.un.org/wpp/
 * - Worldometer (UN data aggregation)
 *   Source: https://www.worldometers.info/world-population/world-population-by-year/
 * - Historical Estimates of World Population (U.S. Census Bureau)
 *   Source: https://www.census.gov/data/tables/time-series/demo/international-programs/historical-est-worldpop.html
 *
 * Notes:
 * - Population estimates from 1950 to present for 237 countries/areas
 * - Annual mid-year population estimates
 * - Highest growth rates (>1.8%/year) occurred between 1955-1975
 * - Peak growth rate of 2.1% occurred between 1965-1970
 *
 * Last updated: December 2025
 * Units: Billions of people
 */

export interface PopulationDataPoint {
  year: number;
  population: number; // billions
  source: 'UN_WPP';
  growthRate?: number; // % per year
}

export const ANNUAL_POPULATION_1950_2024: PopulationDataPoint[] = [
  { year: 1950, population: 2.536, source: 'UN_WPP' },
  { year: 1951, population: 2.594, source: 'UN_WPP' },
  { year: 1952, population: 2.636, source: 'UN_WPP' },
  { year: 1953, population: 2.682, source: 'UN_WPP' },
  { year: 1954, population: 2.730, source: 'UN_WPP' },
  { year: 1955, population: 2.780, source: 'UN_WPP' },
  { year: 1956, population: 2.830, source: 'UN_WPP' },
  { year: 1957, population: 2.891, source: 'UN_WPP' },
  { year: 1958, population: 2.948, source: 'UN_WPP' },
  { year: 1959, population: 3.000, source: 'UN_WPP' }, // Reached 3 billion in July 1959
  { year: 1960, population: 3.042, source: 'UN_WPP' },
  { year: 1961, population: 3.083, source: 'UN_WPP' },
  { year: 1962, population: 3.140, source: 'UN_WPP' },
  { year: 1963, population: 3.209, source: 'UN_WPP' },
  { year: 1964, population: 3.281, source: 'UN_WPP' },
  { year: 1965, population: 3.350, source: 'UN_WPP' }, // Peak growth period begins
  { year: 1966, population: 3.420, source: 'UN_WPP' },
  { year: 1967, population: 3.490, source: 'UN_WPP' },
  { year: 1968, population: 3.562, source: 'UN_WPP' },
  { year: 1969, population: 3.637, source: 'UN_WPP' },
  { year: 1970, population: 3.710, source: 'UN_WPP' }, // Peak growth period ends
  { year: 1971, population: 3.784, source: 'UN_WPP' },
  { year: 1972, population: 3.857, source: 'UN_WPP' },
  { year: 1973, population: 3.937, source: 'UN_WPP' },
  { year: 1974, population: 4.012, source: 'UN_WPP' }, // Reached 4 billion in 1974
  { year: 1975, population: 4.088, source: 'UN_WPP' },
  { year: 1976, population: 4.163, source: 'UN_WPP' },
  { year: 1977, population: 4.232, source: 'UN_WPP' },
  { year: 1978, population: 4.304, source: 'UN_WPP' },
  { year: 1979, population: 4.380, source: 'UN_WPP' },
  { year: 1980, population: 4.451, source: 'UN_WPP' },
  { year: 1981, population: 4.534, source: 'UN_WPP' },
  { year: 1982, population: 4.610, source: 'UN_WPP' },
  { year: 1983, population: 4.687, source: 'UN_WPP' },
  { year: 1984, population: 4.765, source: 'UN_WPP' },
  { year: 1985, population: 4.852, source: 'UN_WPP' },
  { year: 1986, population: 4.933, source: 'UN_WPP' },
  { year: 1987, population: 5.018, source: 'UN_WPP' }, // Reached 5 billion in 1987
  { year: 1988, population: 5.104, source: 'UN_WPP' },
  { year: 1989, population: 5.190, source: 'UN_WPP' },
  { year: 1990, population: 5.284, source: 'UN_WPP' },
  { year: 1991, population: 5.361, source: 'UN_WPP' },
  { year: 1992, population: 5.441, source: 'UN_WPP' },
  { year: 1993, population: 5.526, source: 'UN_WPP' },
  { year: 1994, population: 5.607, source: 'UN_WPP' },
  { year: 1995, population: 5.691, source: 'UN_WPP' },
  { year: 1996, population: 5.773, source: 'UN_WPP' },
  { year: 1997, population: 5.852, source: 'UN_WPP' },
  { year: 1998, population: 5.930, source: 'UN_WPP' },
  { year: 1999, population: 6.003, source: 'UN_WPP' }, // Reached 6 billion in 1999
  { year: 2000, population: 6.170, source: 'UN_WPP' },
  { year: 2001, population: 6.254, source: 'UN_WPP' },
  { year: 2002, population: 6.338, source: 'UN_WPP' },
  { year: 2003, population: 6.422, source: 'UN_WPP' },
  { year: 2004, population: 6.504, source: 'UN_WPP' },
  { year: 2005, population: 6.589, source: 'UN_WPP' },
  { year: 2006, population: 6.674, source: 'UN_WPP' },
  { year: 2007, population: 6.760, source: 'UN_WPP' },
  { year: 2008, population: 6.843, source: 'UN_WPP' },
  { year: 2009, population: 6.933, source: 'UN_WPP' },
  { year: 2010, population: 7.023, source: 'UN_WPP' },
  { year: 2011, population: 7.113, source: 'UN_WPP' }, // Reached 7 billion in 2011
  { year: 2012, population: 7.203, source: 'UN_WPP' },
  { year: 2013, population: 7.295, source: 'UN_WPP' },
  { year: 2014, population: 7.381, source: 'UN_WPP' },
  { year: 2015, population: 7.470, source: 'UN_WPP' },
  { year: 2016, population: 7.562, source: 'UN_WPP' },
  { year: 2017, population: 7.651, source: 'UN_WPP' },
  { year: 2018, population: 7.732, source: 'UN_WPP' },
  { year: 2019, population: 7.814, source: 'UN_WPP' },
  { year: 2020, population: 7.888, source: 'UN_WPP' },
  { year: 2021, population: 7.949, source: 'UN_WPP' },
  { year: 2022, population: 8.019, source: 'UN_WPP' }, // Reached 8 billion in Nov 2022
  { year: 2023, population: 8.089, source: 'UN_WPP' },
  { year: 2024, population: 8.123, source: 'UN_WPP' },
];

/**
 * Get population for a specific year
 * @param year Year (1950-2024)
 * @returns Population in billions, or undefined if year out of range
 */
export function getPopulationForYear(year: number): number | undefined {
  const entry = ANNUAL_POPULATION_1950_2024.find(d => d.year === year);
  return entry?.population;
}

/**
 * Calculate growth rate between two years
 * @param startYear Starting year
 * @param endYear Ending year
 * @returns Average annual growth rate as percentage
 */
export function calculateGrowthRate(startYear: number, endYear: number): number | undefined {
  const start = getPopulationForYear(startYear);
  const end = getPopulationForYear(endYear);

  if (!start || !end) return undefined;

  const years = endYear - startYear;
  return ((Math.pow(end / start, 1 / years) - 1) * 100);
}

/**
 * Validation: Population milestones
 * - 1950: 2.536 billion (baseline)
 * - 1974: 4 billion (doubled in 24 years)
 * - 1987: 5 billion
 * - 1999: 6 billion
 * - 2011: 7 billion
 * - 2022: 8 billion (exceeded in mid-November)
 * - 2024: 8.123 billion
 * - Total growth: 3.2x over 74 years
 */
export const VALIDATION_METRICS = {
  startYear: 1950,
  endYear: 2024,
  population_1950_billions: 2.536,
  population_2024_billions: 8.123,
  totalGrowthMultiple: 8.123 / 2.536, // ~3.2x
  peakGrowthPeriod: '1965-1970',
  peakGrowthRate_percent: 2.1,
  currentGrowthRate_percent: 1.1, // 2015-2020 average
};
