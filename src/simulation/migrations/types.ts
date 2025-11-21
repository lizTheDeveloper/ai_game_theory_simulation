/**
 * State Migration Types (Nov 21, 2025)
 *
 * Type definitions for the state migration system.
 * Enables backward compatibility when GameState schema changes across deployments.
 */

import type { GameState } from '@/types/game';

/**
 * Current schema version
 * Increment this when making breaking changes to GameState
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migration function signature
 * Takes old state (any version) and returns new state conforming to target version
 *
 * CRITICAL: Migrations must be PURE FUNCTIONS (deterministic)
 * - Same input → same output (no randomness, no Date.now())
 * - No side effects (no logging except errors)
 * - Fail loudly if migration corrupts state
 */
export type MigrationFunction = (oldState: any) => GameState;

/**
 * Migration context for error reporting
 */
export interface MigrationContext {
  fromVersion: number;
  toVersion: number;
  location: string;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  state?: GameState;
  error?: string;
  migrationsApplied: string[];
}
