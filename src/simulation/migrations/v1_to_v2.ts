/**
 * Migration: v1 → v2 (Nov 21, 2025)
 *
 * Example migration for testing migration system.
 * Currently a no-op that just adds schemaVersion: 2.
 */

import type { GameState } from '@/types/game';
import type { MigrationFunction } from './types';
import { assertDefined } from '../utils/assertions';

/**
 * Migrate state from v1 to v2
 *
 * CURRENT IMPLEMENTATION: No-op migration for testing
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
