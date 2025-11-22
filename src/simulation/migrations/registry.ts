/**
 * Migration Registry (Nov 21, 2025)
 *
 * Central registry of all state migrations.
 * Migrations are applied sequentially: v1→v2→v3 (not v1→v3 directly).
 *
 * CRITICAL: Each migration MUST be deterministic (pure function).
 */

import type { MigrationFunction } from './types';
import { migrateV1toV2 } from './v1_to_v2';

/**
 * Migration registry
 * Key: target version (2, 3, 4, ...)
 * Value: migration function that upgrades FROM (version-1) TO version
 *
 * Example: migrations[2] upgrades from v1 to v2
 */
export const MIGRATIONS: Record<number, MigrationFunction> = {
  2: migrateV1toV2,
  // Future migrations:
  // 3: migrateV2toV3,
  // 4: migrateV3toV4,
};

/**
 * Get all versions that have migrations defined
 */
export function getAvailableVersions(): number[] {
  return Object.keys(MIGRATIONS)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Check if migration path exists from version A to version B
 */
export function canMigrate(fromVersion: number, toVersion: number): boolean {
  // Can't downgrade
  if (fromVersion >= toVersion) return false;

  // Check that all intermediate migrations exist
  for (let v = fromVersion + 1; v <= toVersion; v++) {
    if (!MIGRATIONS[v]) return false;
  }

  return true;
}
