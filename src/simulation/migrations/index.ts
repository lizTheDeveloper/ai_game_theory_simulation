/**
 * State Migration System (Nov 21, 2025)
 *
 * Provides backward compatibility for saved games when GameState schema changes.
 */

import type { GameState } from '@/types/game';
import type { MigrationResult } from './types';
import { CURRENT_SCHEMA_VERSION } from './types';
import { MIGRATIONS, canMigrate } from './registry';
import { validateMigratedState, detectSchemaVersion } from './validator';

/**
 * Migrate state from old version to target version
 */
export function migrateState(
  oldState: any,
  targetVersion: number = CURRENT_SCHEMA_VERSION
): MigrationResult {
  try {
    const currentVersion = detectSchemaVersion(oldState);

    console.log(`\n=== State Migration ===`);
    console.log(`  Current version: ${currentVersion}`);
    console.log(`  Target version: ${targetVersion}`);

    // No migration needed (but still validate)
    if (currentVersion === targetVersion) {
      console.log(`✅ State already at target version (no migration needed)`);

      // Validate state even if no migration (catch corrupted saves)
      validateMigratedState(oldState, targetVersion);

      return {
        success: true,
        state: oldState as GameState,
        migrationsApplied: []
      };
    }

    // Handle pre-versioning saves
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
 * Handle saves from before schema versioning
 */
function handlePreVersioningSave(
  oldState: any,
  targetVersion: number
): MigrationResult {
  console.log(`  ⚠️ Pre-versioning save detected (adding schemaVersion: 1)`);

  const stateWithVersion = {
    ...oldState,
    schemaVersion: 1
  };

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

  if (targetVersion === 1) {
    console.log(`✅ Pre-versioning save upgraded to v1`);
    return {
      success: true,
      state: stateWithVersion as GameState,
      migrationsApplied: ['v0→v1 (added schemaVersion)']
    };
  }

  console.log(`  Continuing migration: v1→v${targetVersion}`);
  const result = migrateState(stateWithVersion, targetVersion);

  if (result.success) {
    result.migrationsApplied.unshift('v0→v1 (added schemaVersion)');
  }

  return result;
}

export { CURRENT_SCHEMA_VERSION } from './types';
export type { MigrationResult } from './types';
