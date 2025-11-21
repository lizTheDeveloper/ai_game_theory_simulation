/**
 * Migration Validator (Nov 21, 2025)
 *
 * Post-migration validation to ensure migrated state is valid.
 */

import type { GameState } from '@/types/game';
import { assertDefined, assertFinite, assertInRange } from '../utils/assertions';

/**
 * Validate migrated state has required fields and valid values
 */
export function validateMigratedState(state: any, targetVersion: number): void {
  const context = {
    location: 'validateMigratedState',
    targetVersion,
    additionalInfo: { stateKeys: Object.keys(state) }
  };

  // Validate schemaVersion field
  const schemaVersion = assertDefined(state.schemaVersion, {
    ...context,
    valueName: 'schemaVersion'
  });

  assertFinite(schemaVersion, {
    ...context,
    valueName: 'schemaVersion'
  });

  if (schemaVersion !== targetVersion) {
    throw new Error(
      `❌ Migration validation failed: schemaVersion mismatch\n` +
      `  Expected: ${targetVersion}\n` +
      `  Got: ${schemaVersion}`
    );
  }

  // Validate critical fields
  assertDefined(state.currentMonth, { ...context, valueName: 'currentMonth' });
  assertFinite(state.currentMonth, { ...context, valueName: 'currentMonth' });
  assertInRange(state.currentMonth, 0, 10000, { ...context, valueName: 'currentMonth' });

  assertDefined(state.eventIdCounter, { ...context, valueName: 'eventIdCounter' });
  assertFinite(state.eventIdCounter, { ...context, valueName: 'eventIdCounter' });

  assertDefined(state.aiAgents, { ...context, valueName: 'aiAgents' });
  if (!Array.isArray(state.aiAgents)) {
    throw new Error(`❌ Migration validation failed: aiAgents must be an array`);
  }

  assertDefined(state.government, { ...context, valueName: 'government' });
  assertDefined(state.society, { ...context, valueName: 'society' });
  assertDefined(state.globalMetrics, { ...context, valueName: 'globalMetrics' });

  console.log(`✅ Migration validation passed: v${targetVersion}`);
}

/**
 * Detect schema version from state
 */
export function detectSchemaVersion(state: any): number {
  if (!state || typeof state !== 'object' || !('schemaVersion' in state)) {
    console.log('⚠️ State has no schemaVersion field (pre-versioning save)');
    return 0;
  }
  return state.schemaVersion;
}
