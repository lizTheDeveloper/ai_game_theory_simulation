/**
 * Deterministic ID Generation (Oct 30, 2025)
 *
 * Replaces deterministicRandom() and Date.now() with counter-based approach.
 * Ensures reproducible IDs across simulation runs with same seed.
 */

import type { GameState } from '@/types/game';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';

/**
 * Generate deterministic ID using state counter
 *
 * @param state - Game state containing eventIdCounter
 * @param prefix - ID prefix (e.g., 'policy', 'crisis', 'event')
 * @returns Deterministic ID string
 */
export function generateDeterministicId(state: GameState, prefix: string): string {
  const id = `${prefix}_${state.currentMonth}_${state.eventIdCounter}`;
  state.eventIdCounter++; // Increment counter for next ID
  return id;
}

/**
 * Generate short deterministic ID (6-character base36)
 * Mimics deterministicRandom().toString(36).substr(2, 9) pattern
 *
 * @param state - Game state containing eventIdCounter
 * @returns 6-character base36 string
 */
export function generateShortId(state: GameState): string {
  const shortId = state.eventIdCounter.toString(36).padStart(6, '0').substr(0, 6);
  state.eventIdCounter++;
  return shortId;
}

/**
 * Deterministic hash of a string to a number
 *
 * CRITICAL: Used for seeding SeededRandom instances with ID strings.
 * Must be deterministic (same string always produces same hash).
 *
 * Uses simple DJB2 hash algorithm (fast, good distribution, deterministic).
 *
 * @param str - String to hash (e.g., org.id, ai.id)
 * @returns Deterministic integer hash
 *
 * @example
 * ```typescript
 * // ❌ NON-DETERMINISTIC (string length varies across runs)
 * const seed = state.currentMonth + org.id.length;
 *
 * // ✅ DETERMINISTIC (hash is consistent for same string)
 * const seed = state.currentMonth + hashString(org.id);
 * ```
 */
export function hashString(str: string): number {
  let hash = 5381; // DJB2 initial value
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  // Ensure positive integer
  return Math.abs(hash);
}
