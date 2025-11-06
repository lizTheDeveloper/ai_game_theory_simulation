/**
 * Population Mapping Utilities
 *
 * Maps between country-level and region-level population names.
 * Needed because countries use granular region names (Western Europe, Eastern Europe)
 * while regional populations use broader names (Europe).
 *
 * **Architecture: Countries → Regions Aggregation**
 *
 * The simulation tracks populations at two granularities:
 * - **18 Countries**: United States, China, Russia, etc. (granular)
 * - **7 Regions**: North America, Europe, East Asia, etc. (broad)
 *
 * Countries have a `region` field with granular names like:
 * - "Western Europe", "Eastern Europe" → maps to "Europe"
 * - "Southeast Asia" → maps to "South Asia"
 * - "West Africa", "East Africa" → maps to "Sub-Saharan Africa"
 *
 * **Mapping Logic:**
 * ```
 * Country.region (string) → mapCountryRegionToStandardRegion() → RegionName (type)
 * ```
 *
 * **Why Two Granularities:**
 * - Some data only available at regional level (climate projections, food security)
 * - Some systems need country precision (military interventions, reparations)
 * - Solution: Countries inherit regional dynamics, then add country-specific events
 *
 * **Usage:**
 * ```typescript
 * // Map a country's region string to standardized RegionName
 * const region = mapCountryRegionToStandardRegion(country.region);
 *
 * // Get all countries in a region
 * const naCountries = getCountriesInRegion('North America', countries);
 *
 * // Create bidirectional maps for O(1) lookups
 * const { regionToCountries, countryToRegion } = createRegionCountryMaps(countries);
 * ```
 *
 * @see src/simulation/populationProvider.ts for unified API
 * @see src/simulation/countryPopulations.ts for aggregation logic
 */

import { RegionName } from '@/types/populationProvider';
import { CountryName } from '@/types/countryPopulations';

/**
 * Map country region string to standardized RegionName
 *
 * Countries are assigned to sub-regions (Western Europe, Eastern Europe, Southeast Asia, etc.)
 * but regional populations use broader categories (Europe, East Asia, etc.)
 *
 * This mapping enables countries → regions aggregation
 */
export function mapCountryRegionToStandardRegion(countryRegion: string): RegionName {
  const normalized = countryRegion.toLowerCase().trim();

  // Europe (combines Western Europe + Eastern Europe)
  if (normalized.includes('europe')) {
    return 'Europe';
  }

  // East Asia (standardized name)
  // Match both "East Asia" (common) and "Eastern Asia" (UN statistical)
  if (normalized.includes('eastern asia') || normalized.includes('east asia') || normalized === 'east asia') {
    return 'East Asia';
  }

  // South Asia (standardized name)
  // Match both "South Asia" (common) and "Southern Asia" (UN statistical)
  // Also includes Southeast Asia mapping
  if (normalized.includes('southern asia') || normalized.includes('south asia') || normalized === 'south asia' || normalized.includes('southeast asia') || normalized.includes('south-east asia')) {
    return 'South Asia';
  }

  // North America (standardized name)
  // Match both "North America" (common) and "Northern America" (UN statistical)
  if (normalized.includes('northern america') || normalized.includes('north america') || normalized === 'north america') {
    return 'North America';
  }

  // Latin America (South America, Central America)
  if (normalized.includes('south america') || normalized.includes('latin america') || normalized.includes('central america')) {
    return 'Latin America';
  }

  // Middle East & North Africa
  if (normalized.includes('middle east') || normalized.includes('north africa') || normalized === 'mena') {
    return 'Middle East & North Africa';
  }

  // Sub-Saharan Africa (West Africa, East Africa, Southern Africa)
  if (normalized.includes('africa') && !normalized.includes('north africa')) {
    return 'Sub-Saharan Africa';
  }

  // Oceania and Central Asia map to closest regional match
  // (these regions are not tracked separately in our 7-region system)
  if (normalized.includes('oceania') || normalized.includes('pacific')) {
    return 'East Asia';  // Geographic/economic proximity
  }

  if (normalized.includes('central asia')) {
    return 'Middle East & North Africa';  // Geographic proximity
  }

  // Default to North America (most common case)
  console.warn(`⚠️  Unknown country region "${countryRegion}", defaulting to North America`);
  return 'North America';
}

/**
 * Get all countries belonging to a region
 *
 * @param regionName - Standardized region name
 * @param countries - Country population system
 * @returns Array of country names in that region
 */
export function getCountriesInRegion(
  regionName: RegionName,
  countries: Record<CountryName, { region: string }>
): CountryName[] {
  const result: CountryName[] = [];

  // FIX: Sort countries for deterministic iteration order
  const sortedCountries = Object.entries(countries).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [countryName, country] of sortedCountries) {
    const mappedRegion = mapCountryRegionToStandardRegion(country.region);
    if (mappedRegion === regionName) {
      result.push(countryName as CountryName);
    }
  }

  return result;
}

/**
 * Create bidirectional mapping between regions and countries
 *
 * @param countries - Country population system
 * @returns Maps for O(1) lookups
 */
export function createRegionCountryMaps(countries: Record<CountryName, { region: string }>) {
  const regionToCountries = new Map<RegionName, Set<CountryName>>();
  const countryToRegion = new Map<CountryName, RegionName>();

  // Initialize region sets (standardized 7-region system)
  const regions: RegionName[] = [
    'North America',
    'Europe',
    'East Asia',
    'South Asia',
    'Sub-Saharan Africa',
    'Latin America',
    'Middle East & North Africa'
  ];

  for (const region of regions) {
    regionToCountries.set(region, new Set());
  }

  // Populate mappings
  // FIX: Sort countries for deterministic iteration order
  const sortedCountries = Object.entries(countries).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [countryName, country] of sortedCountries) {
    const regionName = mapCountryRegionToStandardRegion(country.region);
    const cn = countryName as CountryName;

    regionToCountries.get(regionName)?.add(cn);
    countryToRegion.set(cn, regionName);
  }

  return { regionToCountries, countryToRegion };
}
