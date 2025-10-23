/**
 * Regional Cache System
 *
 * Performance optimization to eliminate O(n) array.find() operations
 * in regional QoL calculations. Converts array scans to O(1) Map lookups.
 *
 * Research: This is a hot path executed every simulation step.
 * Cache invalidation happens monthly (safe for current simulation design).
 *
 * Performance target: 20-30% reduction in QoL calculation time
 */

import type { GameState } from '@/types/game';

export interface RegionalData {
  name: string;
  population: number;
  freshwaterStress: number;
  droughtAffected: boolean;
  resourceVulnerability: number;
  refugeesHosted: number;
  conflictRisk: number;
  populationStress: number;
}

export interface RegionalCache {
  regionsByName: Map<string, RegionalData>;
  lastCachedMonth: number;
  totalPopulation: number;
}

/**
 * Build regional cache from current game state
 *
 * Converts regional population array to Map for O(1) lookups.
 * Called once per month, then all QoL calculations use cached data.
 */
export function buildRegionalCache(state: GameState): RegionalCache {
  const regionsByName = new Map<RegionalData['name'], RegionalData>();
  let totalPopulation = 0;

  // TODO: Regional population tracking not yet implemented
  // state.regionalPopulations doesn't exist in GameState
  // Return empty cache for now - regional QoL calculations will use fallbacks

  return {
    regionsByName,
    lastCachedMonth: state.currentMonth,
    totalPopulation,
  };
}

/**
 * Get regional data with O(1) lookup
 *
 * Replaces: regions.find(r => r.name === regionName)
 * With: cache.regionsByName.get(regionName)
 */
export function getRegionalData(
  cache: RegionalCache,
  regionName: string
): RegionalData | undefined {
  return cache.regionsByName.get(regionName);
}

/**
 * Check if cache needs refresh
 *
 * Cache is valid for one month. Invalidate when month changes.
 */
export function isCacheValid(cache: RegionalCache | null, currentMonth: number): boolean {
  if (!cache) return false;
  return cache.lastCachedMonth === currentMonth;
}

/**
 * Get or build cache (memoization pattern)
 *
 * Usage:
 * ```ts
 * const cache = getCachedRegions(state, existingCache);
 * const region = cache.regionsByName.get('Asia');
 * ```
 */
export function getCachedRegions(
  state: GameState,
  existingCache: RegionalCache | null
): RegionalCache {
  if (isCacheValid(existingCache, state.currentMonth)) {
    return existingCache;
  }
  return buildRegionalCache(state);
}
