/**
 * Energy category mapping utilities
 *
 * Maps technology IDs to energy budget categories for power consumption tracking.
 *
 * Categories:
 * - Climate: dac, green-hydrogen, sai, carbon-mineralization
 * - AI/Compute: ai-datacenter, advanced-compute
 * - Infrastructure: industrial-electrification, transport-electrification
 */

/**
 * Maps a technology ID to its corresponding energy budget category.
 *
 * @param techId - Technology identifier (e.g., 'dac_tier_1', 'ai-alignment')
 * @returns Energy category string, or null if technology has no energy requirements
 *
 * @example
 * mapTechToEnergyCategory('dac_tier_1') // returns 'dac'
 * mapTechToEnergyCategory('hydrogen_production') // returns 'green-hydrogen'
 * mapTechToEnergyCategory('social_tech') // returns null
 */
export function mapTechToEnergyCategory(techId: string): string | null {
  // Defensive: Handle invalid inputs
  if (typeof techId !== 'string' || techId.length === 0) {
    return null;
  }

  // Normalize for case-insensitive matching
  const normalized = techId.toLowerCase();

  // Climate technologies
  if (normalized.includes('dac') ||
      normalized.includes('air-capture') ||
      normalized.includes('direct_air_capture')) {
    return 'dac';
  }

  if (normalized.includes('hydrogen')) {
    return 'green-hydrogen';
  }

  if (normalized.includes('sai') || normalized.includes('geoengineering')) {
    return 'sai';
  }

  if (normalized.includes('mineralization') || normalized.includes('weathering')) {
    return 'carbon-mineralization';
  }

  // AI/compute technologies
  if (normalized.includes('ai-') || normalized.includes('datacenter')) {
    return 'ai-datacenter';
  }

  if (normalized.includes('compute') || normalized.includes('simulation')) {
    return 'advanced-compute';
  }

  // Infrastructure technologies
  if (normalized.includes('industrial') || normalized.includes('manufacturing')) {
    return 'industrial-electrification';
  }

  if (normalized.includes('transport') ||
      normalized.includes('ev') ||
      normalized.includes('clean_energy_package')) {
    return 'transport-electrification';
  }

  // Technology doesn't have energy requirements
  return null;
}

/**
 * Get all known energy category identifiers.
 * Useful for validation and testing.
 */
export const ENERGY_CATEGORIES = [
  'dac',
  'green-hydrogen',
  'sai',
  'carbon-mineralization',
  'ai-datacenter',
  'advanced-compute',
  'industrial-electrification',
  'transport-electrification',
] as const;

export type EnergyCategory = typeof ENERGY_CATEGORIES[number];
