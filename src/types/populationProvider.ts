/**
 * Unified Population Provider Interface
 *
 * FIX (Oct 26, 2025): Unifies dual tracking systems (regions + countries)
 * Architecture review: reviews/dual-population-architecture-review-2025-10-26.md
 *
 * Benefits:
 * - Single API for all population queries
 * - O(1) cached lookups instead of O(n) array scans
 * - Type-safe location specification
 * - Can evolve implementation without breaking consumers
 */

import { CountryName } from './countryPopulations';

/**
 * Location specifier - can be region name or country name
 */
export type LocationSpecifier =
  | RegionName
  | CountryName
  | 'Global'; // Special: weighted average of all regions

/**
 * Regional population names (7 regions)
 */
export type RegionName =
  | 'North America'
  | 'Europe'
  | 'East Asia'
  | 'South Asia'
  | 'Sub-Saharan Africa'
  | 'Latin America'
  | 'Middle East & North Africa';

/**
 * Population data returned by provider
 */
export interface PopulationData {
  /**
   * Current population (millions)
   */
  current: number;

  /**
   * Baseline population at game start (millions)
   */
  baseline: number;

  /**
   * Population decline ratio [0, 1]
   * 0 = no decline, 0.5 = 50% decline, 1 = 100% decline
   */
  decline: number;

  /**
   * Location type (region or country)
   */
  locationType: 'region' | 'country' | 'global';

  /**
   * Location name
   */
  location: string;

  /**
   * If country, which region does it belong to?
   */
  parentRegion?: RegionName;
}

/**
 * Unified population provider interface
 *
 * Implementations:
 * - CachedPopulationProvider: O(1) map lookups with lazy initialization
 * - DirectPopulationProvider: Direct array scans (for testing/debugging)
 */
export interface PopulationProvider {
  /**
   * Get population data for a location (region or country)
   *
   * @param location - Region name, country name, or 'Global'
   * @returns Population data, or undefined if location not found
   *
   * @example
   * const usaData = provider.getPopulation('United States');
   * if (usaData) {
   *   console.log(`US decline: ${(usaData.decline * 100).toFixed(1)}%`);
   * }
   */
  getPopulation(location: LocationSpecifier): PopulationData | undefined;

  /**
   * Get all regions
   */
  getAllRegions(): PopulationData[];

  /**
   * Get all countries
   */
  getAllCountries(): PopulationData[];

  /**
   * Update cache (call after population phases run)
   * No-op for direct provider
   */
  invalidateCache(): void;
}
