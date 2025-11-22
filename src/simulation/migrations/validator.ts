/**
 * Migration Validator (Nov 21, 2025)
 *
 * Post-migration validation to ensure migrated state is valid.
 * Uses assertion utilities to fail loudly if migration corrupted state.
 */

import type { GameState } from '@/types/game';
import { assertDefined, assertFinite, assertInRange } from '../utils/assertions';

/**
 * Validate migrated state has required fields and valid values
 *
 * CRITICAL: This is NOT comprehensive validation (that would require 900+ checks).
 * This validates CRITICAL invariants that MUST hold for simulation to function.
 *
 * @throws Error with full context if validation fails
 */
export function validateMigratedState(state: any, targetVersion: number): void {
  const context = {
    location: 'validateMigratedState',
    targetVersion,
    additionalInfo: { stateKeys: Object.keys(state) }
  };

  // Validate schemaVersion field exists and matches target
  const schemaVersion = assertDefined(state.schemaVersion, {
    ...context,
    valueName: 'schemaVersion',
    additionalInfo: { ...context.additionalInfo, message: 'Migration must set schemaVersion' }
  });

  assertFinite(schemaVersion, {
    ...context,
    valueName: 'schemaVersion',
    additionalInfo: { ...context.additionalInfo, value: schemaVersion }
  });

  if (schemaVersion !== targetVersion) {
    throw new Error(
      `❌ Migration validation failed: schemaVersion mismatch\n` +
      `  Expected: ${targetVersion}\n` +
      `  Got: ${schemaVersion}\n` +
      `  Location: validateMigratedState\n` +
      `  This indicates migration function didn't update schemaVersion correctly.`
    );
  }

  // Validate critical temporal fields
  assertDefined(state.currentMonth, {
    ...context,
    valueName: 'currentMonth'
  });

  assertFinite(state.currentMonth, {
    ...context,
    valueName: 'currentMonth',
    additionalInfo: { ...context.additionalInfo, value: state.currentMonth }
  });

  assertInRange(state.currentMonth, 0, 10000, {
    ...context,
    valueName: 'currentMonth',
    additionalInfo: { ...context.additionalInfo, value: state.currentMonth }
  });

  // Validate eventIdCounter (determinism)
  assertDefined(state.eventIdCounter, {
    ...context,
    valueName: 'eventIdCounter'
  });

  assertFinite(state.eventIdCounter, {
    ...context,
    valueName: 'eventIdCounter',
    additionalInfo: { ...context.additionalInfo, value: state.eventIdCounter }
  });

  // Validate critical arrays exist
  assertDefined(state.aiAgents, {
    ...context,
    valueName: 'aiAgents'
  });

  if (!Array.isArray(state.aiAgents)) {
    throw new Error(
      `❌ Migration validation failed: aiAgents must be an array\n` +
      `  Type: ${typeof state.aiAgents}\n` +
      `  Location: validateMigratedState\n` +
      `  Migration corrupted agent data structure.`
    );
  }

  // Validate critical objects exist
  assertDefined(state.government, {
    ...context,
    valueName: 'government'
  });

  assertDefined(state.society, {
    ...context,
    valueName: 'society'
  });

  assertDefined(state.globalMetrics, {
    ...context,
    valueName: 'globalMetrics'
  });

  console.log(`✅ Migration validation passed: v${targetVersion}`);
}

/**
 * Validate that state has a schemaVersion field
 * Used before migration to detect old saves without versioning
 */
export function hasSchemaVersion(state: any): boolean {
  return (
    state &&
    typeof state === 'object' &&
    'schemaVersion' in state &&
    typeof state.schemaVersion === 'number'
  );
}

/**
 * Detect schema version from state
 * Returns 0 if state has no schemaVersion field (pre-versioning saves)
 */
export function detectSchemaVersion(state: any): number {
  if (!hasSchemaVersion(state)) {
    console.log('⚠️ State has no schemaVersion field (pre-versioning save)');
    return 0;
  }

  return state.schemaVersion;
}
