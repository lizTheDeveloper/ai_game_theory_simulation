/**
 * Migration: v1 → v2 (Nov 21, 2025)
 *
 * Example migration for testing migration system.
 * Currently a no-op that just adds schemaVersion: 2.
 *
 * WHEN TO UPDATE THIS:
 * When you make your first breaking change to GameState, replace this no-op
 * with actual migration logic.
 *
 * Example breaking changes that need migration:
 * - Renaming a field (oldField → newField)
 * - Changing field type (number → object)
 * - Adding required field without default
 * - Restructuring nested objects
 */

import type { GameState } from '@/types/game';
import type { MigrationFunction } from './types';
import { assertDefined } from '../utils/assertions';

/**
 * Migrate state from v1 to v2
 *
 * CURRENT IMPLEMENTATION: No-op migration for testing
 *
 * FUTURE: Replace with actual migration logic when v2 schema is defined
 */
export const migrateV1toV2: MigrationFunction = (oldState: any): GameState => {
  console.log('🔄 Migrating state from v1 to v2...');

  // Validate old state has required fields
  assertDefined(oldState.currentMonth, {
    location: 'migrateV1toV2',
    valueName: 'currentMonth',
    additionalInfo: { message: 'v1 state missing currentMonth' }
  });

  assertDefined(oldState.aiAgents, {
    location: 'migrateV1toV2',
    valueName: 'aiAgents',
    additionalInfo: { message: 'v1 state missing aiAgents' }
  });

  // NO-OP: v2 schema is identical to v1 (this is example migration)
  // Just update schemaVersion field
  const newState: GameState = {
    ...oldState,
    schemaVersion: 2
  };

  console.log(`✅ Migration v1→v2 complete (no-op)`);

  return newState;
};

/**
 * EXAMPLE: How to write a real migration
 *
 * When you need to make breaking changes to GameState:
 *
 * 1. Update GameState interface in src/types/game.ts
 * 2. Increment CURRENT_SCHEMA_VERSION in migrations/types.ts
 * 3. Create new migration file (e.g., v2_to_v3.ts)
 * 4. Implement migration logic:
 *
 * ```typescript
 * export const migrateV2toV3: MigrationFunction = (oldState: any): GameState => {
 *   console.log('🔄 Migrating state from v2 to v3...');
 *
 *   // Example: Add new required field with sensible default
 *   const newField = calculateDefaultValue(oldState);
 *
 *   // Example: Rename field
 *   const { oldFieldName, ...rest } = oldState;
 *   const newFieldName = oldFieldName;
 *
 *   // Example: Restructure nested object
 *   const restructured = {
 *     newStructure: {
 *       field1: oldState.oldStructure.a,
 *       field2: oldState.oldStructure.b
 *     }
 *   };
 *
 *   return {
 *     ...rest,
 *     schemaVersion: 3,
 *     newField,
 *     newFieldName,
 *     ...restructured
 *   };
 * };
 * ```
 *
 * 5. Register migration in migrations/registry.ts
 * 6. Update initialization.ts to use new schemaVersion
 * 7. Test migration with old save
 */
