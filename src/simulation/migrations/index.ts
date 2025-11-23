/**
 * State Migration System (Nov 21, 2025)
 *
 * Provides backward compatibility for saved games when GameState schema changes.
 *
 * USAGE:
 * ```typescript
 * const loadedState = JSON.parse(localStorage.getItem('savedGame'));
 * const migrationResult = migrateState(loadedState, CURRENT_SCHEMA_VERSION);
 *
 * if (migrationResult.success) {
 *   // Use migrationResult.state
 *   console.log(`Applied migrations: ${migrationResult.migrationsApplied.join(', ')}`);
 * } else {
 *   // Handle error
 *   console.error(`Migration failed: ${migrationResult.error}`);
 * }
 * ```
 *
 * PHILOSOPHY:
 * - Backward compatibility: old saves MUST load (with migration)
 * - Forward compatibility: NOT required (old code can't load new saves)
 * - Fail loudly: corrupted migrations crash with detailed error
 * - Deterministic: same input → same output (pure functions)
 */

import type { GameState } from '@/types/game';
import type { MigrationResult } from './types';
import { CURRENT_SCHEMA_VERSION } from './types';
import { MIGRATIONS, canMigrate } from './registry';
import { validateMigratedState, detectSchemaVersion } from './validator';

/**
 * Migrate state from old version to target version
 *
 * Applies migrations sequentially: v1→v2→v3 (not v1→v3 directly)
 *
 * @param oldState - State loaded from save (any version)
 * @param targetVersion - Target schema version (usually CURRENT_SCHEMA_VERSION)
 * @returns MigrationResult with success/error and migrated state
 */
export function migrateState(
  oldState: any,
  targetVersion: number = CURRENT_SCHEMA_VERSION
): MigrationResult {
  try {
    // Detect current schema version
    const currentVersion = detectSchemaVersion(oldState);

    console.log(`\n=== State Migration ===`);
    console.log(`  Current version: ${currentVersion}`);
    console.log(`  Target version: ${targetVersion}`);

    // No migration needed
    if (currentVersion === targetVersion) {
      console.log(`✅ State already at target version (no migration needed)`);
      return {
        success: true,
        state: oldState as GameState,
        migrationsApplied: []
      };
    }

    // Handle pre-versioning saves (version 0)
    if (currentVersion === 0) {
      return handlePreVersioningSave(oldState, targetVersion);
    }

    // Check if migration path exists
    if (!canMigrate(currentVersion, targetVersion)) {
      const error = `No migration path from v${currentVersion} to v${targetVersion}`;
      console.log(`❌ ${error}`);
      return {
        success: false,
        error,
        migrationsApplied: []
      };
    }

    // Apply migrations sequentially
    let state = oldState;
    const migrationsApplied: string[] = [];

    for (let version = currentVersion + 1; version <= targetVersion; version++) {
      const migration = MIGRATIONS[version];

      if (!migration) {
        const error = `Missing migration for v${version - 1}→v${version}`;
        console.log(`❌ ${error}`);
        return {
          success: false,
          error,
          migrationsApplied
        };
      }

      console.log(`  Applying migration: v${version - 1}→v${version}`);
      state = migration(state);
      migrationsApplied.push(`v${version - 1}→v${version}`);

      // Validate after each migration
      validateMigratedState(state, version);
    }

    console.log(`✅ Migration complete: ${migrationsApplied.join(', ')}`);

    return {
      success: true,
      state: state as GameState,
      migrationsApplied
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Migration failed: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
      migrationsApplied: []
    };
  }
}

/**
 * Handle saves from before schema versioning was implemented
 *
 * These saves have no schemaVersion field.
 * We treat them as "version 0" and add schemaVersion: 1, then migrate to target.
 */
function handlePreVersioningSave(
  oldState: any,
  targetVersion: number
): MigrationResult {
  console.log(`  ⚠️ Pre-versioning save detected (adding schemaVersion: 1)`);

  // Add schemaVersion: 1 to old save
  const stateWithVersion = {
    ...oldState,
    schemaVersion: 1
  };

  // Validate it looks like valid v1 state
  try {
    validateMigratedState(stateWithVersion, 1);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Pre-versioning save validation failed: ${errorMessage}`);

    return {
      success: false,
      error: `Pre-versioning save invalid: ${errorMessage}`,
      migrationsApplied: []
    };
  }

  // If target is v1, we're done
  if (targetVersion === 1) {
    console.log(`✅ Pre-versioning save upgraded to v1`);
    return {
      success: true,
      state: stateWithVersion as GameState,
      migrationsApplied: ['v0→v1 (added schemaVersion)']
    };
  }

  // Otherwise, continue migrating from v1 to target
  console.log(`  Continuing migration: v1→v${targetVersion}`);
  const result = migrateState(stateWithVersion, targetVersion);

  // Prepend v0→v1 to migrations applied
  if (result.success) {
    result.migrationsApplied.unshift('v0→v1 (added schemaVersion)');
  }

  return result;
}

/**
 * Re-export types and constants for convenience
 */
export { CURRENT_SCHEMA_VERSION } from './types';
export type { MigrationResult } from './types';
