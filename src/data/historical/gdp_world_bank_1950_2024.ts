/**
 * Historical World GDP Data (1950-2024)
 *
 * Data Sources:
 * - 1950-1989: Maddison Project Database 2023
 *   Source: https://www.rug.nl/ggdc/historicaldevelopment/maddison/
 *   Reference: Bolt, J., & van Zanden, J. L. (2020). "Maddison style estimates
 *   of the evolution of the world economy." Journal of Economic Surveys.
 * - 1990-2024: World Bank World Development Indicators
 *   Source: https://data.worldbank.org/indicator/NY.GDP.MKTP.PP.CD
 *   Indicator: GDP, PPP (constant 2021 international $)
 *
 * Notes:
 * - All values expressed in constant 2021 international dollars (PPP)
 * - PPP (Purchasing Power Parity) adjusts for price level differences across countries
 * - "Golden period of growth" occurred during 1950s-1960s
 * - World GDP grew ~20x from 1950 to 2024
 *
 * References:
 * - Maddison, A. (2007). "Contours of the World Economy, 1–2030 AD."
 * - World Bank National Accounts Data and OECD National Accounts data files
 *
 * Last updated: December 2025
 * Units: Trillions of constant 2021 international dollars (PPP)
 */

export interface GDPDataPoint {
  year: number;
  gdp_trillions: number; // Constant 2021 international $ (PPP)
  source: 'MADDISON_PROJECT' | 'WORLD_BANK';
  growthRate?: number; // % per year
}

export const ANNUAL_GDP_1950_2024: GDPDataPoint[] = [
  // 1950-1989: Maddison Project Database (converted to 2021 int$)
  // Original Maddison data in 1990 int$ scaled to 2021 int$ (~1.73x multiplier)
  { year: 1950, gdp_trillions: 10.2, source: 'MADDISON_PROJECT' },
  { year: 1951, gdp_trillions: 10.8, source: 'MADDISON_PROJECT' },
  { year: 1952, gdp_trillions: 11.3, source: 'MADDISON_PROJECT' },
  { year: 1953, gdp_trillions: 11.9, source: 'MADDISON_PROJECT' },
  { year: 1954, gdp_trillions: 12.4, source: 'MADDISON_PROJECT' },
  { year: 1955, gdp_trillions: 13.1, source: 'MADDISON_PROJECT' },
  { year: 1956, gdp_trillions: 13.7, source: 'MADDISON_PROJECT' },
  { year: 1957, gdp_trillions: 14.3, source: 'MADDISON_PROJECT' },
  { year: 1958, gdp_trillions: 14.8, source: 'MADDISON_PROJECT' },
  { year: 1959, gdp_trillions: 15.5, source: 'MADDISON_PROJECT' },
  { year: 1960, gdp_trillions: 16.3, source: 'MADDISON_PROJECT' },
  { year: 1961, gdp_trillions: 17.0, source: 'MADDISON_PROJECT' },
  { year: 1962, gdp_trillions: 17.8, source: 'MADDISON_PROJECT' },
  { year: 1963, gdp_trillions: 18.6, source: 'MADDISON_PROJECT' },
  { year: 1964, gdp_trillions: 19.6, source: 'MADDISON_PROJECT' },
  { year: 1965, gdp_trillions: 20.6, source: 'MADDISON_PROJECT' },
  { year: 1966, gdp_trillions: 21.6, source: 'MADDISON_PROJECT' },
  { year: 1967, gdp_trillions: 22.4, source: 'MADDISON_PROJECT' },
  { year: 1968, gdp_trillions: 23.6, source: 'MADDISON_PROJECT' },
  { year: 1969, gdp_trillions: 24.8, source: 'MADDISON_PROJECT' },
  { year: 1970, gdp_trillions: 26.0, source: 'MADDISON_PROJECT' },
  { year: 1971, gdp_trillions: 27.0, source: 'MADDISON_PROJECT' },
  { year: 1972, gdp_trillions: 28.3, source: 'MADDISON_PROJECT' },
  { year: 1973, gdp_trillions: 29.9, source: 'MADDISON_PROJECT' },
  { year: 1974, gdp_trillions: 30.5, source: 'MADDISON_PROJECT' },
  { year: 1975, gdp_trillions: 31.0, source: 'MADDISON_PROJECT' },
  { year: 1976, gdp_trillions: 32.5, source: 'MADDISON_PROJECT' },
  { year: 1977, gdp_trillions: 33.8, source: 'MADDISON_PROJECT' },
  { year: 1978, gdp_trillions: 35.3, source: 'MADDISON_PROJECT' },
  { year: 1979, gdp_trillions: 36.7, source: 'MADDISON_PROJECT' },
  { year: 1980, gdp_trillions: 37.8, source: 'MADDISON_PROJECT' },
  { year: 1981, gdp_trillions: 38.7, source: 'MADDISON_PROJECT' },
  { year: 1982, gdp_trillions: 39.2, source: 'MADDISON_PROJECT' },
  { year: 1983, gdp_trillions: 40.3, source: 'MADDISON_PROJECT' },
  { year: 1984, gdp_trillions: 42.0, source: 'MADDISON_PROJECT' },
  { year: 1985, gdp_trillions: 43.5, source: 'MADDISON_PROJECT' },
  { year: 1986, gdp_trillions: 45.0, source: 'MADDISON_PROJECT' },
  { year: 1987, gdp_trillions: 46.7, source: 'MADDISON_PROJECT' },
  { year: 1988, gdp_trillions: 48.8, source: 'MADDISON_PROJECT' },
  { year: 1989, gdp_trillions: 50.7, source: 'MADDISON_PROJECT' },

  // 1990-2024: World Bank data (2021 int$ PPP)
  { year: 1990, gdp_trillions: 52.5, source: 'WORLD_BANK' },
  { year: 1991, gdp_trillions: 53.2, source: 'WORLD_BANK' },
  { year: 1992, gdp_trillions: 54.3, source: 'WORLD_BANK' },
  { year: 1993, gdp_trillions: 55.3, source: 'WORLD_BANK' },
  { year: 1994, gdp_trillions: 57.2, source: 'WORLD_BANK' },
  { year: 1995, gdp_trillions: 59.3, source: 'WORLD_BANK' },
  { year: 1996, gdp_trillions: 61.7, source: 'WORLD_BANK' },
  { year: 1997, gdp_trillions: 64.3, source: 'WORLD_BANK' },
  { year: 1998, gdp_trillions: 66.2, source: 'WORLD_BANK' },
  { year: 1999, gdp_trillions: 68.5, source: 'WORLD_BANK' },
  { year: 2000, gdp_trillions: 71.5, source: 'WORLD_BANK' },
  { year: 2001, gdp_trillions: 73.5, source: 'WORLD_BANK' },
  { year: 2002, gdp_trillions: 76.0, source: 'WORLD_BANK' },
  { year: 2003, gdp_trillions: 79.3, source: 'WORLD_BANK' },
  { year: 2004, gdp_trillions: 83.4, source: 'WORLD_BANK' },
  { year: 2005, gdp_trillions: 87.6, source: 'WORLD_BANK' },
  { year: 2006, gdp_trillions: 92.5, source: 'WORLD_BANK' },
  { year: 2007, gdp_trillions: 97.5, source: 'WORLD_BANK' },
  { year: 2008, gdp_trillions: 100.2, source: 'WORLD_BANK' },
  { year: 2009, gdp_trillions: 99.8, source: 'WORLD_BANK' }, // Financial crisis
  { year: 2010, gdp_trillions: 104.8, source: 'WORLD_BANK' },
  { year: 2011, gdp_trillions: 109.5, source: 'WORLD_BANK' },
  { year: 2012, gdp_trillions: 113.5, source: 'WORLD_BANK' },
  { year: 2013, gdp_trillions: 117.8, source: 'WORLD_BANK' },
  { year: 2014, gdp_trillions: 122.4, source: 'WORLD_BANK' },
  { year: 2015, gdp_trillions: 127.0, source: 'WORLD_BANK' },
  { year: 2016, gdp_trillions: 131.8, source: 'WORLD_BANK' },
  { year: 2017, gdp_trillions: 137.2, source: 'WORLD_BANK' },
  { year: 2018, gdp_trillions: 142.9, source: 'WORLD_BANK' },
  { year: 2019, gdp_trillions: 147.8, source: 'WORLD_BANK' },
  { year: 2020, gdp_trillions: 145.3, source: 'WORLD_BANK' }, // COVID-19 pandemic
  { year: 2021, gdp_trillions: 153.0, source: 'WORLD_BANK' },
  { year: 2022, gdp_trillions: 159.2, source: 'WORLD_BANK' },
  { year: 2023, gdp_trillions: 164.8, source: 'WORLD_BANK' },
  { year: 2024, gdp_trillions: 170.5, source: 'WORLD_BANK' }, // Estimated
];

/**
 * Get GDP for a specific year
 * @param year Year (1950-2024)
 * @returns GDP in trillions of 2021 international $, or undefined if year out of range
 */
export function getGDPForYear(year: number): number | undefined {
  const entry = ANNUAL_GDP_1950_2024.find(d => d.year === year);
  return entry?.gdp_trillions;
}

/**
 * Calculate GDP per capita for a specific year
 * Requires population data from population_un_wpp_1950_2024.ts
 * @param year Year
 * @param population_billions Population in billions
 * @returns GDP per capita in international $
 */
export function calculateGDPPerCapita(year: number, population_billions: number): number | undefined {
  const gdp = getGDPForYear(year);
  if (!gdp || population_billions <= 0) return undefined;

  return (gdp * 1_000_000_000_000) / (population_billions * 1_000_000_000);
}

/**
 * Calculate growth rate between two years
 * @param startYear Starting year
 * @param endYear Ending year
 * @returns Average annual GDP growth rate as percentage
 */
export function calculateGrowthRate(startYear: number, endYear: number): number | undefined {
  const start = getGDPForYear(startYear);
  const end = getGDPForYear(endYear);

  if (!start || !end) return undefined;

  const years = endYear - startYear;
  return ((Math.pow(end / start, 1 / years) - 1) * 100);
}

/**
 * Validation: GDP milestones
 * - 1950: $10.2 trillion (baseline, post-WWII)
 * - 1973: $29.9 trillion (end of "Golden Age")
 * - 2008: $100.2 trillion (financial crisis)
 * - 2020: $145.3 trillion (COVID-19 recession)
 * - 2024: $170.5 trillion (estimated)
 * - Total growth: 16.7x over 74 years
 * - Average growth rate 1950-2024: ~3.9% per year
 */
export const VALIDATION_METRICS = {
  startYear: 1950,
  endYear: 2024,
  gdp_1950_trillions: 10.2,
  gdp_2024_trillions: 170.5,
  totalGrowthMultiple: 170.5 / 10.2, // ~16.7x
  goldenAgeGrowth_1950_1973: ((29.9 / 10.2) ** (1 / 23) - 1) * 100, // ~4.8%/year
  modernGrowth_2000_2024: ((170.5 / 71.5) ** (1 / 24) - 1) * 100, // ~3.6%/year
  recessions: [
    { year: 2009, gdp_trillions: 99.8, cause: 'Global Financial Crisis' },
    { year: 2020, gdp_trillions: 145.3, cause: 'COVID-19 Pandemic' },
  ],
};
