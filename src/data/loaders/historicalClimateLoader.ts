/**
 * Historical Climate Data Loader
 *
 * Loads historical climate data for hindcasting validation (1990-2024).
 *
 * **Data Sources:**
 * - CO2 Concentration: NOAA Global Monitoring Laboratory (Mauna Loa)
 *   - URL: https://gml.noaa.gov/ccgg/trends/
 *   - Coverage: 1958-present (annual averages)
 *
 * - Temperature Anomaly: NASA GISS Surface Temperature Analysis (GISTEMP v4)
 *   - URL: https://data.giss.nasa.gov/gistemp/
 *   - Coverage: 1880-present
 *   - Baseline: 1951-1980 mean
 *
 * **Usage:**
 * ```typescript
 * const climate = historicalClimateLoader.load();
 * const data1990 = climate.getYear(1990);
 * console.log(data1990.co2Ppm); // 354.4
 * console.log(data1990.tempAnomaly); // 0.45
 * ```
 *
 * @module data/loaders/historicalClimateLoader
 */

import { cacheManager } from './cacheManager';

/**
 * Historical climate data for a single year
 */
export interface HistoricalClimateYear {
  /** Year */
  year: number;

  /**
   * Atmospheric CO2 concentration (ppm)
   *
   * Source: NOAA Mauna Loa Observatory
   * Measure: Dry air mole fraction, annual average
   */
  co2Ppm: number;

  /**
   * Global temperature anomaly (C)
   *
   * Source: NASA GISS GISTEMP v4
   * Baseline: 1951-1980 mean
   */
  tempAnomaly: number;

  /**
   * Temperature anomaly vs pre-industrial (C)
   *
   * Baseline: 1850-1900 average
   * Calculated: tempAnomaly + 0.40 (offset from GISS baseline to pre-industrial)
   */
  tempVsPreindustrial: number;

  /**
   * Annual CO2 increase (ppm/year)
   *
   * Year-over-year change in CO2 concentration
   */
  co2AnnualIncrease: number;

  /**
   * Uncertainty bounds
   */
  uncertainty?: {
    tempAnomaly: { low: number; high: number };
    co2Ppm: { low: number; high: number };
  };

  /**
   * Data quality flag
   *
   * 'observed' = direct measurement
   * 'interpolated' = gap-filled
   */
  dataQuality: 'observed' | 'interpolated';
}

/**
 * Historical climate timeseries
 */
export interface HistoricalClimateTimeseries {
  /** Start year of timeseries */
  startYear: number;

  /** End year of timeseries */
  endYear: number;

  /** Data source versions */
  sources: {
    co2: string;
    temperature: string;
  };

  /** Last update date */
  updateDate: string;

  /** Annual data points */
  data: HistoricalClimateYear[];
}

/**
 * Historical Climate Data Loader
 *
 * Provides historical climate data for hindcasting validation.
 */
export class HistoricalClimateLoader {
  private timeseries: HistoricalClimateTimeseries | null = null;

  /**
   * Load historical climate data
   *
   * @param options - Load options
   * @returns Historical climate timeseries
   */
  async load(options?: {
    /** Force refresh (ignore cache) */
    forceRefresh?: boolean;
  }): Promise<HistoricalClimateTimeseries> {
    // Return cached if available
    if (this.timeseries && !options?.forceRefresh) {
      return this.timeseries;
    }

    // Try loading from file cache
    const cached = await cacheManager.loadFromCache<HistoricalClimateTimeseries>('historical-climate');
    if (cached && !options?.forceRefresh) {
      this.timeseries = cached;
      console.log(`[HistoricalClimateLoader] Loaded from cache (${cached.data.length} years)`);
      return cached;
    }

    // Build from embedded data
    console.log('[HistoricalClimateLoader] Building historical climate timeseries...');
    this.timeseries = this.buildTimeseries();

    // Save to cache
    await cacheManager.saveToCache('historical-climate', this.timeseries, {
      version: '1.0',
      recordCount: this.timeseries.data.length,
      coverage: {
        countries: 1, // Global aggregate
        startYear: this.timeseries.startYear,
        endYear: this.timeseries.endYear,
      },
    });

    return this.timeseries;
  }

  /**
   * Get data for a specific year
   *
   * @param year - Year to retrieve
   * @returns Climate data for that year, or null if not available
   */
  getYear(year: number): HistoricalClimateYear | null {
    if (!this.timeseries) {
      throw new Error('HistoricalClimateLoader: Must call load() before getYear()');
    }
    return this.timeseries.data.find(d => d.year === year) ?? null;
  }

  /**
   * Get data range
   *
   * @param startYear - Start year (inclusive)
   * @param endYear - End year (inclusive)
   * @returns Array of climate data for the range
   */
  getRange(startYear: number, endYear: number): HistoricalClimateYear[] {
    if (!this.timeseries) {
      throw new Error('HistoricalClimateLoader: Must call load() before getRange()');
    }
    return this.timeseries.data.filter(d => d.year >= startYear && d.year <= endYear);
  }

  /**
   * Build timeseries from embedded data
   *
   * **REAL DATA** - Transcribed from NOAA and NASA GISS official datasets.
   *
   * CO2 Source: https://gml.noaa.gov/ccgg/trends/data.html
   * Temperature Source: https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv
   */
  private buildTimeseries(): HistoricalClimateTimeseries {
    // Real observed data from NOAA Mauna Loa and NASA GISS
    // CO2: Annual mean (ppm), Temperature: Annual anomaly vs 1951-1980 (C)
    const rawData: Array<[number, number, number]> = [
      // [year, CO2 ppm, temp anomaly C]
      [1990, 354.39, 0.45],
      [1991, 355.61, 0.42],
      [1992, 356.45, 0.23],
      [1993, 357.10, 0.24],
      [1994, 358.83, 0.31],
      [1995, 360.82, 0.45],
      [1996, 362.61, 0.35],
      [1997, 363.73, 0.47],
      [1998, 366.70, 0.63],
      [1999, 368.38, 0.44],
      [2000, 369.55, 0.42],
      [2001, 371.14, 0.54],
      [2002, 373.28, 0.63],
      [2003, 375.80, 0.62],
      [2004, 377.52, 0.54],
      [2005, 379.80, 0.69],
      [2006, 381.90, 0.64],
      [2007, 383.79, 0.66],
      [2008, 385.60, 0.54],
      [2009, 387.43, 0.64],
      [2010, 389.90, 0.72],
      [2011, 391.65, 0.61],
      [2012, 393.85, 0.65],
      [2013, 396.52, 0.68],
      [2014, 398.65, 0.74],
      [2015, 400.83, 0.90],
      [2016, 404.24, 1.02],
      [2017, 406.55, 0.93],
      [2018, 408.52, 0.85],
      [2019, 411.44, 0.98],
      [2020, 414.24, 1.02],
      [2021, 416.45, 0.85],
      [2022, 418.56, 0.89],
      [2023, 421.08, 1.17],
      [2024, 424.61, 1.28],
    ];

    const data: HistoricalClimateYear[] = rawData.map(([year, co2, temp], index) => {
      const prevCo2 = index > 0 ? rawData[index - 1][1] : co2 - 1.5;
      const co2Increase = co2 - prevCo2;

      return {
        year,
        co2Ppm: co2,
        tempAnomaly: temp,
        tempVsPreindustrial: temp + 0.40, // Offset from GISS 1951-1980 baseline to 1850-1900
        co2AnnualIncrease: Math.round(co2Increase * 100) / 100,
        dataQuality: 'observed' as const,
        uncertainty: {
          tempAnomaly: { low: temp - 0.05, high: temp + 0.05 },
          co2Ppm: { low: co2 - 0.1, high: co2 + 0.1 },
        },
      };
    });

    return {
      startYear: 1990,
      endYear: 2024,
      sources: {
        co2: 'NOAA Global Monitoring Laboratory (Mauna Loa Observatory)',
        temperature: 'NASA GISS GISTEMP v4',
      },
      updateDate: new Date().toISOString(),
      data,
    };
  }
}

/**
 * Global historical climate loader instance
 */
export const historicalClimateLoader = new HistoricalClimateLoader();
