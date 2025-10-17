/**
 * National AI Interaction Cache
 *
 * Performance optimization for country-country interactions
 * Converts O(n²) nested loops to O(n) with cached lookups
 *
 * Key optimizations:
 * - Map-based O(1) lookups instead of O(n) array.find()
 * - Pre-computed cooperation potentials
 * - Cached bilateral relationships
 */

import { GameState, NationName } from '@/types/game';
import { NationalAICapability } from '@/types/nationalAI';

export interface CountryInteractionCache {
  // O(1) nation lookups
  nationMap: Map<NationName, NationalAICapability>;

  // Pre-computed values
  globalLeader: NationName | null;
  globalFrontier: number;
  usNation: NationalAICapability | null;
  chinaNation: NationalAICapability | null;

  // Bilateral relationships (sparse matrix as map)
  cooperationPotential: Map<string, number>; // key: "US-China"
  tensionLevels: Map<string, number>;
}

/**
 * Create interaction cache from current state
 * Call this once per simulation step
 */
export function createInteractionCache(state: GameState): CountryInteractionCache {
  const natAI = state.nationalAI;

  // Build nation map for O(1) lookups
  const nationMap = new Map<NationName, NationalAICapability>();
  for (const nation of natAI.nations) {
    nationMap.set(nation.nation, nation);
  }

  // Cache commonly accessed nations
  const usNation = nationMap.get('United States') || null;
  const chinaNation = nationMap.get('China') || null;

  // Find global leader
  let maxCapability = 0;
  let leaderNation: NationName | null = null;

  for (const nation of natAI.nations) {
    if (nation.effectiveCapability > maxCapability) {
      maxCapability = nation.effectiveCapability;
      leaderNation = nation.nation;
    }
  }

  // Pre-compute bilateral cooperation potentials
  const cooperationPotential = new Map<string, number>();
  const tensionLevels = new Map<string, number>();

  // Build cooperation potential matrix (sparse - only store non-zero)
  for (let i = 0; i < natAI.nations.length; i++) {
    for (let j = i + 1; j < natAI.nations.length; j++) {
      const nationA = natAI.nations[i];
      const nationB = natAI.nations[j];

      // Create symmetric key (alphabetical order)
      const key = getBilateralKey(nationA.nation, nationB.nation);

      // Calculate cooperation potential based on:
      // - Capability similarity (less racing if equal)
      // - Bilateral tension
      const capabilityGap = Math.abs(nationA.effectiveCapability - nationB.effectiveCapability);
      const similarityFactor = 1 - Math.min(1, capabilityGap);

      // Get bilateral tension
      const tension = state.bilateralTensions.find(t =>
        (t.nationA === nationA.nation && t.nationB === nationB.nation) ||
        (t.nationA === nationB.nation && t.nationB === nationA.nation)
      );

      const tensionLevel = tension?.tensionLevel || 0.5;
      const tensionFactor = 1 - tensionLevel;

      // Cooperation potential (0-1)
      const potential = similarityFactor * 0.6 + tensionFactor * 0.4;

      cooperationPotential.set(key, potential);
      tensionLevels.set(key, tensionLevel);
    }
  }

  return {
    nationMap,
    globalLeader: leaderNation,
    globalFrontier: maxCapability,
    usNation,
    chinaNation,
    cooperationPotential,
    tensionLevels,
  };
}

/**
 * Get bilateral key for cache lookup (alphabetical order for symmetry)
 */
export function getBilateralKey(nationA: NationName, nationB: NationName): string {
  return nationA < nationB ? `${nationA}-${nationB}` : `${nationB}-${nationA}`;
}

/**
 * Get nation from cache (O(1) instead of O(n))
 */
export function getNation(cache: CountryInteractionCache, nation: NationName): NationalAICapability | undefined {
  return cache.nationMap.get(nation);
}

/**
 * Get cooperation potential between two nations
 */
export function getCooperationPotential(
  cache: CountryInteractionCache,
  nationA: NationName,
  nationB: NationName
): number {
  const key = getBilateralKey(nationA, nationB);
  return cache.cooperationPotential.get(key) || 0;
}

/**
 * Get bilateral tension
 */
export function getBilateralTension(
  cache: CountryInteractionCache,
  nationA: NationName,
  nationB: NationName
): number {
  const key = getBilateralKey(nationA, nationB);
  return cache.tensionLevels.get(key) || 0.5;
}
