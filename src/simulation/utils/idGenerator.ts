/**
 * Deterministic ID Generation (Oct 30, 2025)
 *
 * Replaces Math.random() and Date.now() with counter-based approach.
 * Ensures reproducible IDs across simulation runs with same seed.
 */

import type { GameState } from '@/types/game';

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
 * Mimics Math.random().toString(36).substr(2, 9) pattern
 *
 * @param state - Game state containing eventIdCounter
 * @returns 6-character base36 string
 */
export function generateShortId(state: GameState): string {
  const shortId = state.eventIdCounter.toString(36).padStart(6, '0').substr(0, 6);
  state.eventIdCounter++;
  return shortId;
}
