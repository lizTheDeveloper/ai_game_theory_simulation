/**
 * Test Script: State Migration System (Nov 21, 2025)
 *
 * Verifies that:
 * 1. Pre-versioning saves (no schemaVersion field) are upgraded to v1
 * 2. v1 saves migrate to v2 successfully
 * 3. Migration validation catches corrupted state
 * 4. Current schema saves load without migration
 *
 * Usage: npx tsx scripts/testStateMigration.ts
 */

import { migrateState, CURRENT_SCHEMA_VERSION } from '../src/simulation/migrations/index';
import type { GameState } from '../src/types/game';

console.log('\n=== State Migration System Test ===\n');

// Test 1: Pre-versioning save (no schemaVersion field)
console.log('Test 1: Pre-versioning save (no schemaVersion)');
const preVersioningSave = {
  currentMonth: 24,
  currentDay: 15,
  currentYear: 2027,
  daysInCurrentMonth: 30,
  speed: 'normal',
  gameStarted: true,
  eventIdCounter: 1234,
  aiAgents: [],
  government: {} as any,
  society: {} as any,
  globalMetrics: {} as any,
  // ... other required fields (minimal mock)
};

const result1 = migrateState(preVersioningSave, 1);
if (result1.success) {
  console.log(`✅ Pre-versioning save migrated successfully`);
  console.log(`  Migrations: ${result1.migrationsApplied.join(', ')}`);
  console.log(`  Schema version: ${result1.state!.schemaVersion}`);

  if (result1.state!.schemaVersion !== 1) {
    console.log(`❌ FAIL: Expected schemaVersion=1, got ${result1.state!.schemaVersion}`);
    process.exit(1);
  }

  if (result1.migrationsApplied.length === 0) {
    console.log(`❌ FAIL: Expected migrations to be applied, got none`);
    process.exit(1);
  }
} else {
  console.log(`❌ FAIL: ${result1.error}`);
  process.exit(1);
}

// Test 2: v1 save (with schemaVersion: 1)
console.log('\nTest 2: v1 save (schemaVersion: 1)');
const v1Save = {
  ...preVersioningSave,
  schemaVersion: 1
};

const result2 = migrateState(v1Save, 1);
if (result2.success) {
  console.log(`✅ v1 save loaded successfully (no migration needed)`);
  console.log(`  Migrations: ${result2.migrationsApplied.length === 0 ? 'none' : result2.migrationsApplied.join(', ')}`);
  console.log(`  Schema version: ${result2.state!.schemaVersion}`);

  if (result2.migrationsApplied.length !== 0) {
    console.log(`❌ FAIL: Expected no migrations, got ${result2.migrationsApplied.length}`);
    process.exit(1);
  }
} else {
  console.log(`❌ FAIL: ${result2.error}`);
  process.exit(1);
}

// Test 3: v1 → v2 migration
console.log('\nTest 3: v1 → v2 migration');
const result3 = migrateState(v1Save, 2);
if (result3.success) {
  console.log(`✅ v1 → v2 migration successful`);
  console.log(`  Migrations: ${result3.migrationsApplied.join(', ')}`);
  console.log(`  Schema version: ${result3.state!.schemaVersion}`);

  if (result3.state!.schemaVersion !== 2) {
    console.log(`❌ FAIL: Expected schemaVersion=2, got ${result3.state!.schemaVersion}`);
    process.exit(1);
  }

  if (result3.migrationsApplied.length !== 1) {
    console.log(`❌ FAIL: Expected 1 migration, got ${result3.migrationsApplied.length}`);
    process.exit(1);
  }
} else {
  console.log(`❌ FAIL: ${result3.error}`);
  process.exit(1);
}

// Test 4: Corrupted save (missing required fields)
console.log('\nTest 4: Corrupted save (missing required fields)');
const corruptedSave = {
  schemaVersion: 1,
  currentMonth: 24
  // Missing aiAgents, government, society, etc.
};

const result4 = migrateState(corruptedSave, 1);
if (!result4.success) {
  console.log(`✅ Corrupted save rejected as expected`);
  console.log(`  Error: ${result4.error?.substring(0, 100)}...`);
} else {
  console.log(`❌ FAIL: Corrupted save should have been rejected`);
  process.exit(1);
}

// Test 5: Current schema version
console.log(`\nTest 5: Current schema version (v${CURRENT_SCHEMA_VERSION})`);
const currentSave = {
  ...v1Save,
  schemaVersion: CURRENT_SCHEMA_VERSION
};

const result5 = migrateState(currentSave, CURRENT_SCHEMA_VERSION);
if (result5.success) {
  console.log(`✅ Current schema save loaded successfully`);
  console.log(`  Migrations: ${result5.migrationsApplied.length === 0 ? 'none' : result5.migrationsApplied.join(', ')}`);
  console.log(`  Schema version: ${result5.state!.schemaVersion}`);

  if (result5.migrationsApplied.length !== 0) {
    console.log(`❌ FAIL: Expected no migrations, got ${result5.migrationsApplied.length}`);
    process.exit(1);
  }
} else {
  console.log(`❌ FAIL: ${result5.error}`);
  process.exit(1);
}

console.log('\n=== All Tests Passed ✅ ===\n');
console.log(`State migration system is working correctly.`);
console.log(`Ready for deployment.`);
