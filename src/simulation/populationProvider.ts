/**
 * Cached Population Provider Implementation
 *
 * FIX (Oct 26, 2025): O(1) cached lookups instead of O(n) array scans
 * Architecture review: reviews/dual-population-architecture-review-2025-10-26.md
 *
 * Performance:
 * - Before: O(n) array.find() on every lookup
 * - After: O(1) Map.get() after initialization
 * - Expected savings: ~20% CPU in hot paths (organization management, military, QoL)
 *
 * **Architecture: Dual Population Tracking**
 *
 * The simulation tracks populations at TWO granularities:
 * 1. **Regional (7 regions)**: Primary dynamics from climate, food, environment
 * 2. **Country (18 countries)**: Inherit regional dynamics + country-specific events
 *
 * **Data Flow:**
 * ```
 * Environmental/Climate Systems → Regional Populations
 *                                       ↓
 *                            Countries inherit dynamics
 *                                       ↓
 *                           Country-specific events (wars, etc.)
 *                                       ↓
 *                            Countries aggregate back UP
 *                                       ↓
 *                              Regional totals updated
 * ```
 *
 * **Usage:**
 * ```typescript
 * const provider = createPopulationProvider(state);
 *
 * // O(1) cached lookup by location name
 * const naPopulation = provider.getPopulation('North America');
 * const usPopulation = provider.getPopulation('United States');
 * const globalPopulation = provider.getPopulation('Global');
 *
 * // Get all regions or countries
 * const allRegions = provider.getAllRegions();
 * const allCountries = provider.getAllCountries();
 *
 * // Invalidate cache after population updates
 * provider.invalidateCache();
 * ```
 *
 * **When to Use:**
 * - Reading population data for display, calculations, or decisions
 * - NOT for accessing full Country objects with game logic properties
 * - NOT for modifying populations (use direct state access for writes)
 *
 * @see src/simulation/populationMapping.ts for country→region mapping
 * @see src/simulation/countryPopulations.ts for aggregation logic
 */

import { GameState } from '@/types/game';
import {
  PopulationProvider,
  PopulationData,
  LocationSpecifier,
  RegionName
} from '@/types/populationProvider';

/**
 * Cached population provider with O(1) lookups
 */
export class CachedPopulationProvider implements PopulationProvider {
  private state: GameState;
  private cache: Map<string, PopulationData> | null = null;

  constructor(state: GameState) {
    this.state = state;
  }

  /**
   * Get population data for a location
   * Lazy-initializes cache on first call
   */
  getPopulation(location: LocationSpecifier): PopulationData | undefined {
    if (!this.cache) {
      this.buildCache();
    }

    return this.cache!.get(location);
  }

  /**
   * Get all regions
   */
  getAllRegions(): PopulationData[] {
    if (!this.cache) {
      this.buildCache();
    }

    const regions: PopulationData[] = [];
    for (const [key, data] of this.cache!.entries()) {
      if (data.locationType === 'region') {
        regions.push(data);
      }
    }

    return regions;
  }

  /**
   * Get all countries
   */
  getAllCountries(): PopulationData[] {
    if (!this.cache) {
      this.buildCache();
    }

    const countries: PopulationData[] = [];
    for (const [key, data] of this.cache!.entries()) {
      if (data.locationType === 'country') {
        countries.push(data);
      }
    }

    return countries;
  }

  /**
   * Invalidate cache (call after population phases run)
   */
  invalidateCache(): void {
    this.cache = null;
  }

  /**
   * Build cache from game state
   * O(n) but only called once per query batch
   */
  private buildCache(): void {
    const cache = new Map<string, PopulationData>();

    // Add regional populations
    if (this.state.humanPopulationSystem.regionalPopulations) {
      for (const region of this.state.humanPopulationSystem.regionalPopulations) {
        const decline = 1 - (region.population / region.baselinePopulation);

        cache.set(region.name, {
          current: region.population,
          baseline: region.baselinePopulation,
          decline,
          locationType: 'region',
          location: region.name
        });
      }
    } else {
      // DEBUG: Log when regionalPopulations is not available
      console.warn(`⚠️  PopulationProvider: regionalPopulations not initialized (array is ${this.state.humanPopulationSystem.regionalPopulations})`);
    }

    // Add country populations
    if (this.state.countryPopulationSystem) {
      // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
      const countries = Object.values(this.state.countryPopulationSystem.countries)
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const country of countries) {
        const decline = 1 - (country.population / country.baselinePopulation);

        cache.set(country.name, {
          current: country.population,
          baseline: country.baselinePopulation,
          decline,
          locationType: 'country',
          location: country.name,
          parentRegion: country.region as RegionName
        });
      }
    }

    // Add global (weighted average of all regions)
    const globalData = this.calculateGlobalData();
    cache.set('Global', globalData);

    this.cache = cache;
  }

  /**
   * Calculate global population data (weighted average)
   */
  private calculateGlobalData(): PopulationData {
    const current = this.state.humanPopulationSystem.population;
    const baseline = 8.0; // Billion (hardcoded initial value)
    const decline = 1 - (current / baseline);

    return {
      current: current * 1000, // Convert B to M for consistency
      baseline: baseline * 1000,
      decline,
      locationType: 'global',
      location: 'Global'
    };
  }
}

/**
 * Create a population provider for the given game state
 *
 * @param state - Current game state
 * @returns Cached population provider
 */
export function createPopulationProvider(state: GameState): PopulationProvider {
  return new CachedPopulationProvider(state);
}
