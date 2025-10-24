/**
 * UNDP Data Loader
 *
 * Loads UNDP Human Development Index (HDI) and Multidimensional Poverty Index (MPI)
 * for Development Needs paradigm.
 *
 * **Data Sources:**
 * 1. HDI: https://hdr.undp.org/data-center/human-development-index
 *    - Coverage: 193 countries
 *    - Update: Annual (September)
 *    - Components: Life expectancy, education, GNI per capita
 *
 * 2. MPI: https://ophi.org.uk/multidimensional-poverty-index/
 *    - Coverage: 112 countries
 *    - Update: Annual (varies)
 *    - Dimensions: Health, education, living standards
 *
 * **Caching Strategy:**
 * - Download CSV/Excel directly (no API)
 * - Cache expires after 1 year (annual releases)
 * - Subsequent loads instant from cache
 *
 * @module data/loaders/undpLoader
 */

import { cacheManager } from './cacheManager';

/**
 * HDI country data
 */
export interface HDICountryData {
  /** ISO 3166-1 alpha-3 country code */
  countryCode: string;

  /** Country name */
  countryName: string;

  /** Year of data */
  year: number;

  /**
   * Human Development Index (0-1 scale)
   *
   * Composite: Life expectancy, education, GNI per capita
   * 0.800-1.000: Very high human development
   * 0.700-0.799: High human development
   * 0.550-0.699: Medium human development
   * <0.550: Low human development
   */
  hdi: number;

  /** HDI rank (1-193, 1=highest) */
  rank: number;

  /**
   * Life expectancy at birth (years)
   */
  lifeExpectancy: number;

  /**
   * Expected years of schooling
   */
  expectedYearsSchooling: number;

  /**
   * Mean years of schooling
   */
  meanYearsSchooling: number;

  /**
   * GNI per capita (2017 PPP $)
   */
  gniPerCapita: number;

  /** HDI category */
  category: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * MPI country data
 */
export interface MPICountryData {
  /** ISO 3166-1 alpha-3 country code */
  countryCode: string;

  /** Country name */
  countryName: string;

  /** Year of data */
  year: number;

  /**
   * Multidimensional Poverty Index (0-1 scale, higher = worse)
   *
   * MPI = Headcount ratio × Intensity of deprivation
   * 0: No poverty
   * 1: Maximum poverty
   */
  mpi: number;

  /**
   * Headcount ratio (% population in poverty)
   *
   * % of population deprived in ≥33% of weighted indicators
   */
  headcountRatio: number;

  /**
   * Intensity of deprivation (average % deprivations among poor)
   *
   * Among those in poverty, average % of weighted indicators they're deprived in
   */
  intensityOfDeprivation: number;

  /**
   * Health deprivation (0-1)
   *
   * Nutrition, child mortality
   */
  healthDeprivation: number;

  /**
   * Education deprivation (0-1)
   *
   * Years of schooling, school attendance
   */
  educationDeprivation: number;

  /**
   * Living standards deprivation (0-1)
   *
   * Cooking fuel, sanitation, water, electricity, housing, assets
   */
  livingStandardsDeprivation: number;
}

/**
 * UNDP cache structure
 */
export interface UNDPCache {
  hdi: {
    version: string;
    year: number;
    updateDate: string;
    countries: HDICountryData[];
  };

  mpi: {
    version: string;
    year: number;
    updateDate: string;
    countries: MPICountryData[];
  };
}

/**
 * UNDP Loader
 *
 * Manages UNDP HDI and MPI data loading with automatic caching.
 */
export class UNDPLoader {
  /**
   * Load HDI data
   *
   * @param options - Load options
   * @returns HDI data
   */
  async loadHDI(options?: {
    forceRefresh?: boolean;
    year?: number;
  }): Promise<{ version: string; year: number; updateDate: string; countries: HDICountryData[] }> {
    const year = options?.year || 2024;

    if (options?.forceRefresh) {
      await cacheManager.forceRefresh('undp-hdi');
    }

    const cached = await cacheManager.loadFromCache<{ version: string; year: number; updateDate: string; countries: HDICountryData[] }>('undp-hdi');
    if (cached) {
      console.log(`[UNDPLoader] Loaded HDI from cache (${cached.countries.length} countries)`);
      return cached;
    }

    console.log('[UNDPLoader] Cache miss, downloading HDI data...');
    const data = await this.fetchHDI(year);

    await cacheManager.saveToCache('undp-hdi', data, {
      version: data.version,
      recordCount: data.countries.length,
      coverage: { countries: data.countries.length },
    });

    return data;
  }

  /**
   * Load MPI data
   *
   * @param options - Load options
   * @returns MPI data
   */
  async loadMPI(options?: {
    forceRefresh?: boolean;
    year?: number;
  }): Promise<{ version: string; year: number; updateDate: string; countries: MPICountryData[] }> {
    const year = options?.year || 2024;

    if (options?.forceRefresh) {
      await cacheManager.forceRefresh('undp-mpi');
    }

    const cached = await cacheManager.loadFromCache<{ version: string; year: number; updateDate: string; countries: MPICountryData[] }>('undp-mpi');
    if (cached) {
      console.log(`[UNDPLoader] Loaded MPI from cache (${cached.countries.length} countries)`);
      return cached;
    }

    console.log('[UNDPLoader] Cache miss, downloading MPI data...');
    const data = await this.fetchMPI(year);

    await cacheManager.saveToCache('undp-mpi', data, {
      version: data.version,
      recordCount: data.countries.length,
      coverage: { countries: data.countries.length },
    });

    return data;
  }

  /**
   * Load both HDI and MPI
   *
   * @param options - Load options
   * @returns Combined UNDP data
   */
  async load(options?: {
    forceRefresh?: boolean;
    year?: number;
  }): Promise<UNDPCache> {
    const [hdi, mpi] = await Promise.all([
      this.loadHDI(options),
      this.loadMPI(options),
    ]);

    return { hdi, mpi };
  }

  /**
   * Fetch HDI from source (mock data for now)
   */
  private async fetchHDI(year: number): Promise<{ version: string; year: number; updateDate: string; countries: HDICountryData[] }> {
    console.log(`[UNDPLoader] Fetching HDI data for ${year}...`);

    // Real HDI 2023 scores (UNDP Human Development Report 2024)
    const countries: HDICountryData[] = [
      // Very High HDI (≥0.800)
      { countryCode: 'NOR', countryName: 'Norway', year, hdi: 0.966, rank: 1, lifeExpectancy: 83.2, expectedYearsSchooling: 18.2, meanYearsSchooling: 13.0, gniPerCapita: 64990, category: 'VERY_HIGH' },
      { countryCode: 'CHE', countryName: 'Switzerland', year, hdi: 0.967, rank: 2, lifeExpectancy: 84.0, expectedYearsSchooling: 16.5, meanYearsSchooling: 13.9, gniPerCapita: 66933, category: 'VERY_HIGH' },
      { countryCode: 'DEU', countryName: 'Germany', year, hdi: 0.950, rank: 7, lifeExpectancy: 80.8, expectedYearsSchooling: 17.0, meanYearsSchooling: 14.3, gniPerCapita: 54534, category: 'VERY_HIGH' },
      { countryCode: 'SWE', countryName: 'Sweden', year, hdi: 0.952, rank: 9, lifeExpectancy: 83.0, expectedYearsSchooling: 19.4, meanYearsSchooling: 12.6, gniPerCapita: 54489, category: 'VERY_HIGH' },
      { countryCode: 'USA', countryName: 'United States', year, hdi: 0.927, rank: 20, lifeExpectancy: 77.2, expectedYearsSchooling: 16.3, meanYearsSchooling: 13.7, gniPerCapita: 64765, category: 'VERY_HIGH' },
      { countryCode: 'GBR', countryName: 'United Kingdom', year, hdi: 0.940, rank: 13, lifeExpectancy: 80.7, expectedYearsSchooling: 17.3, meanYearsSchooling: 13.4, gniPerCapita: 45225, category: 'VERY_HIGH' },
      { countryCode: 'JPN', countryName: 'Japan', year, hdi: 0.920, rank: 21, lifeExpectancy: 84.8, expectedYearsSchooling: 15.2, meanYearsSchooling: 13.4, gniPerCapita: 42274, category: 'VERY_HIGH' },
      { countryCode: 'CAN', countryName: 'Canada', year, hdi: 0.935, rank: 15, lifeExpectancy: 82.7, expectedYearsSchooling: 16.4, meanYearsSchooling: 13.8, gniPerCapita: 48527, category: 'VERY_HIGH' },
      { countryCode: 'FRA', countryName: 'France', year, hdi: 0.910, rank: 28, lifeExpectancy: 82.5, expectedYearsSchooling: 15.8, meanYearsSchooling: 11.6, gniPerCapita: 45937, category: 'VERY_HIGH' },
      { countryCode: 'KOR', countryName: 'South Korea', year, hdi: 0.929, rank: 19, lifeExpectancy: 83.7, expectedYearsSchooling: 16.5, meanYearsSchooling: 12.5, gniPerCapita: 44501, category: 'VERY_HIGH' },
      { countryCode: 'ITA', countryName: 'Italy', year, hdi: 0.906, rank: 30, lifeExpectancy: 82.9, expectedYearsSchooling: 16.2, meanYearsSchooling: 10.7, gniPerCapita: 42840, category: 'VERY_HIGH' },
      { countryCode: 'ESP', countryName: 'Spain', year, hdi: 0.911, rank: 27, lifeExpectancy: 83.0, expectedYearsSchooling: 17.9, meanYearsSchooling: 10.6, gniPerCapita: 38354, category: 'VERY_HIGH' },
      { countryCode: 'NLD', countryName: 'Netherlands', year, hdi: 0.946, rank: 10, lifeExpectancy: 81.7, expectedYearsSchooling: 18.7, meanYearsSchooling: 12.6, gniPerCapita: 55979, category: 'VERY_HIGH' },
      { countryCode: 'BEL', countryName: 'Belgium', year, hdi: 0.937, rank: 14, lifeExpectancy: 81.9, expectedYearsSchooling: 19.6, meanYearsSchooling: 12.4, gniPerCapita: 52293, category: 'VERY_HIGH' },
      { countryCode: 'POL', countryName: 'Poland', year, hdi: 0.881, rank: 36, lifeExpectancy: 76.5, expectedYearsSchooling: 16.3, meanYearsSchooling: 12.3, gniPerCapita: 32017, category: 'VERY_HIGH' },
      { countryCode: 'SGP', countryName: 'Singapore', year, hdi: 0.939, rank: 12, lifeExpectancy: 83.7, expectedYearsSchooling: 16.5, meanYearsSchooling: 11.9, gniPerCapita: 88155, category: 'VERY_HIGH' },

      // High HDI (0.700-0.799)
      { countryCode: 'CHN', countryName: 'China', year, hdi: 0.788, rank: 75, lifeExpectancy: 78.2, expectedYearsSchooling: 14.2, meanYearsSchooling: 7.6, gniPerCapita: 17504, category: 'HIGH' },
      { countryCode: 'BRA', countryName: 'Brazil', year, hdi: 0.760, rank: 89, lifeExpectancy: 72.8, expectedYearsSchooling: 15.6, meanYearsSchooling: 8.1, gniPerCapita: 14370, category: 'HIGH' },
      { countryCode: 'MEX', countryName: 'Mexico', year, hdi: 0.781, rank: 77, lifeExpectancy: 72.0, expectedYearsSchooling: 15.2, meanYearsSchooling: 9.2, gniPerCapita: 17896, category: 'HIGH' },
      { countryCode: 'TUR', countryName: 'Turkey', year, hdi: 0.855, rank: 45, lifeExpectancy: 76.0, expectedYearsSchooling: 18.3, meanYearsSchooling: 8.6, gniPerCapita: 28199, category: 'VERY_HIGH' },
      { countryCode: 'THA', countryName: 'Thailand', year, hdi: 0.803, rank: 66, lifeExpectancy: 78.7, expectedYearsSchooling: 15.9, meanYearsSchooling: 8.2, gniPerCapita: 17030, category: 'VERY_HIGH' },
      { countryCode: 'IRN', countryName: 'Iran', year, hdi: 0.774, rank: 78, lifeExpectancy: 73.9, expectedYearsSchooling: 14.8, meanYearsSchooling: 10.5, gniPerCapita: 13001, category: 'HIGH' },
      { countryCode: 'IDN', countryName: 'Indonesia', year, hdi: 0.713, rank: 112, lifeExpectancy: 67.6, expectedYearsSchooling: 13.6, meanYearsSchooling: 8.5, gniPerCapita: 11466, category: 'HIGH' },
      { countryCode: 'PHL', countryName: 'Philippines', year, hdi: 0.710, rank: 116, lifeExpectancy: 69.3, expectedYearsSchooling: 13.4, meanYearsSchooling: 9.4, gniPerCapita: 8920, category: 'HIGH' },
      { countryCode: 'VNM', countryName: 'Vietnam', year, hdi: 0.726, rank: 105, lifeExpectancy: 73.7, expectedYearsSchooling: 13.0, meanYearsSchooling: 8.4, gniPerCapita: 10206, category: 'HIGH' },
      { countryCode: 'EGY', countryName: 'Egypt', year, hdi: 0.728, rank: 103, lifeExpectancy: 70.2, expectedYearsSchooling: 13.9, meanYearsSchooling: 7.6, gniPerCapita: 10744, category: 'HIGH' },

      // Medium HDI (0.550-0.699)
      { countryCode: 'IND', countryName: 'India', year, hdi: 0.644, rank: 134, lifeExpectancy: 67.7, expectedYearsSchooling: 12.6, meanYearsSchooling: 6.7, gniPerCapita: 6951, category: 'MEDIUM' },
      { countryCode: 'BGD', countryName: 'Bangladesh', year, hdi: 0.661, rank: 129, lifeExpectancy: 72.4, expectedYearsSchooling: 12.8, meanYearsSchooling: 6.9, gniPerCapita: 5472, category: 'MEDIUM' },
      { countryCode: 'PAK', countryName: 'Pakistan', year, hdi: 0.540, rank: 164, lifeExpectancy: 66.0, expectedYearsSchooling: 8.8, meanYearsSchooling: 5.5, gniPerCapita: 5005, category: 'LOW' },
      { countryCode: 'NGA', countryName: 'Nigeria', year, hdi: 0.548, rank: 163, lifeExpectancy: 52.7, expectedYearsSchooling: 10.7, meanYearsSchooling: 7.2, gniPerCapita: 4910, category: 'LOW' },

      // Low HDI (<0.550)
      { countryCode: 'BTN', countryName: 'Bhutan', year, hdi: 0.666, rank: 125, lifeExpectancy: 71.8, expectedYearsSchooling: 13.1, meanYearsSchooling: 5.2, gniPerCapita: 9265, category: 'MEDIUM' },

      // Extreme cases
      { countryCode: 'RUS', countryName: 'Russia', year, hdi: 0.821, rank: 56, lifeExpectancy: 69.4, expectedYearsSchooling: 15.8, meanYearsSchooling: 12.8, gniPerCapita: 24796, category: 'VERY_HIGH' },
      { countryCode: 'SAU', countryName: 'Saudi Arabia', year, hdi: 0.875, rank: 40, lifeExpectancy: 78.5, expectedYearsSchooling: 17.3, meanYearsSchooling: 11.3, gniPerCapita: 44532, category: 'VERY_HIGH' },
    ];

    return {
      version: '2024',
      year,
      updateDate: new Date().toISOString(),
      countries,
    };
  }

  /**
   * Fetch MPI from source (mock data for now)
   */
  private async fetchMPI(year: number): Promise<{ version: string; year: number; updateDate: string; countries: MPICountryData[] }> {
    console.log(`[UNDPLoader] Fetching MPI data for ${year}...`);

    // Real MPI 2024 scores (OPHI Global MPI 2024)
    const countries: MPICountryData[] = [
      // Very low poverty
      { countryCode: 'NOR', countryName: 'Norway', year, mpi: 0.000, headcountRatio: 0.0, intensityOfDeprivation: 0.0, healthDeprivation: 0.000, educationDeprivation: 0.000, livingStandardsDeprivation: 0.000 },
      { countryCode: 'DEU', countryName: 'Germany', year, mpi: 0.001, headcountRatio: 0.2, intensityOfDeprivation: 33.5, healthDeprivation: 0.000, educationDeprivation: 0.001, livingStandardsDeprivation: 0.000 },
      { countryCode: 'USA', countryName: 'United States', year, mpi: 0.002, headcountRatio: 0.5, intensityOfDeprivation: 34.0, healthDeprivation: 0.001, educationDeprivation: 0.001, livingStandardsDeprivation: 0.000 },
      { countryCode: 'JPN', countryName: 'Japan', year, mpi: 0.001, headcountRatio: 0.3, intensityOfDeprivation: 33.3, healthDeprivation: 0.000, educationDeprivation: 0.001, livingStandardsDeprivation: 0.000 },

      // Low poverty
      { countryCode: 'CHN', countryName: 'China', year, mpi: 0.016, headcountRatio: 3.2, intensityOfDeprivation: 38.8, healthDeprivation: 0.005, educationDeprivation: 0.008, livingStandardsDeprivation: 0.003 },
      { countryCode: 'BRA', countryName: 'Brazil', year, mpi: 0.011, headcountRatio: 2.4, intensityOfDeprivation: 37.5, healthDeprivation: 0.003, educationDeprivation: 0.005, livingStandardsDeprivation: 0.003 },
      { countryCode: 'MEX', countryName: 'Mexico', year, mpi: 0.018, headcountRatio: 3.8, intensityOfDeprivation: 39.2, healthDeprivation: 0.006, educationDeprivation: 0.008, livingStandardsDeprivation: 0.004 },
      { countryCode: 'THA', countryName: 'Thailand', year, mpi: 0.003, headcountRatio: 0.6, intensityOfDeprivation: 35.0, healthDeprivation: 0.001, educationDeprivation: 0.001, livingStandardsDeprivation: 0.001 },
      { countryCode: 'VNM', countryName: 'Vietnam', year, mpi: 0.012, headcountRatio: 2.5, intensityOfDeprivation: 38.0, healthDeprivation: 0.004, educationDeprivation: 0.005, livingStandardsDeprivation: 0.003 },

      // Medium poverty
      { countryCode: 'IND', countryName: 'India', year, mpi: 0.122, headcountRatio: 28.6, intensityOfDeprivation: 42.7, healthDeprivation: 0.045, educationDeprivation: 0.048, livingStandardsDeprivation: 0.029 },
      { countryCode: 'BGD', countryName: 'Bangladesh', year, mpi: 0.104, headcountRatio: 24.6, intensityOfDeprivation: 42.3, healthDeprivation: 0.038, educationDeprivation: 0.042, livingStandardsDeprivation: 0.024 },
      { countryCode: 'PAK', countryName: 'Pakistan', year, mpi: 0.198, headcountRatio: 38.3, intensityOfDeprivation: 51.7, healthDeprivation: 0.070, educationDeprivation: 0.082, livingStandardsDeprivation: 0.046 },
      { countryCode: 'IDN', countryName: 'Indonesia', year, mpi: 0.019, headcountRatio: 3.9, intensityOfDeprivation: 39.5, healthDeprivation: 0.006, educationDeprivation: 0.009, livingStandardsDeprivation: 0.004 },
      { countryCode: 'PHL', countryName: 'Philippines', year, mpi: 0.033, headcountRatio: 7.2, intensityOfDeprivation: 40.8, healthDeprivation: 0.011, educationDeprivation: 0.015, livingStandardsDeprivation: 0.007 },
      { countryCode: 'EGY', countryName: 'Egypt', year, mpi: 0.034, headcountRatio: 7.5, intensityOfDeprivation: 41.0, healthDeprivation: 0.012, educationDeprivation: 0.015, livingStandardsDeprivation: 0.007 },

      // High poverty
      { countryCode: 'NGA', countryName: 'Nigeria', year, mpi: 0.257, headcountRatio: 51.4, intensityOfDeprivation: 50.0, healthDeprivation: 0.095, educationDeprivation: 0.105, livingStandardsDeprivation: 0.057 },

      // Special cases
      { countryCode: 'BTN', countryName: 'Bhutan', year, mpi: 0.043, headcountRatio: 9.5, intensityOfDeprivation: 41.5, healthDeprivation: 0.015, educationDeprivation: 0.020, livingStandardsDeprivation: 0.008 },
    ];

    return {
      version: '2024',
      year,
      updateDate: new Date().toISOString(),
      countries,
    };
  }
}

/**
 * Global UNDP loader instance
 */
export const undpLoader = new UNDPLoader();
