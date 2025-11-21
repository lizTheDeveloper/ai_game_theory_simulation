# State Migration System Guide

**Implementation Date:** November 21, 2025
**Priority:** HIGH
**Status:** COMPLETE

## Problem Statement

Prior to this system, every deployment that changed the `GameState` interface broke all saved games. Users lost progress with each update. No migration infrastructure existed.

## Solution Overview

State schema versioning system that:
- Tracks schema version in every saved game
- Applies sequential migrations (v1→v2→v3) automatically
- Validates migrated state with assertion utilities
- Fails loudly if migration corrupted (no silent data loss)

## Architecture

### Core Components

1. **Schema Version Field** (`GameState.schemaVersion`)
   - Required field in GameState interface
   - Initialized to 1 in all new games
   - Incremented when breaking changes occur

2. **Migration Infrastructure** (`src/simulation/migrations/`)
   - `types.ts` - Type definitions, CURRENT_SCHEMA_VERSION constant
   - `registry.ts` - Central migration registry
   - `validator.ts` - Post-migration validation with assertions
   - `index.ts` - Migration orchestrator (migrateState function)
   - `v{N}_to_{N+1}.ts` - Individual migration implementations

3. **Integration Point** (`src/workers/simulationWorker.ts`)
   - `handleResumeFromState()` applies migrations before using state
   - Fails loudly with detailed error if migration fails

### Migration Flow

```
Old Save (any version)
    ↓
detectSchemaVersion()
    ↓
Sequential Migrations (v1→v2→v3)
    ↓
validateMigratedState() after each step
    ↓
Current Schema (ready to use)
```

### Pre-Versioning Saves

Saves created before this system have no `schemaVersion` field. These are:
1. Detected as "version 0"
2. Upgraded to v1 by adding `schemaVersion: 1`
3. Validated to ensure they look like valid v1 state
4. Migrated to current version if needed

## How to Add a Migration

When you need to make a **breaking change** to `GameState`:

### Step 1: Update GameState Interface

```typescript
// src/types/game.ts
export interface GameState {
  schemaVersion: number;
  currentMonth: number;

  // Example: Add new required field
  newSystemState: NewSystemState;

  // Example: Rename field
  aiAgentsV2: AIAgent[];  // was: aiAgents

  // ... rest of interface
}
```

### Step 2: Increment Schema Version

```typescript
// src/simulation/migrations/types.ts
export const CURRENT_SCHEMA_VERSION = 2;  // was: 1
```

### Step 3: Create Migration File

```typescript
// src/simulation/migrations/v1_to_v2.ts
import type { GameState } from '@/types/game';
import type { MigrationFunction } from './types';
import { assertDefined } from '../utils/assertions';

export const migrateV1toV2: MigrationFunction = (oldState: any): GameState => {
  console.log('🔄 Migrating state from v1 to v2...');

  // Validate old state
  assertDefined(oldState.aiAgents, {
    location: 'migrateV1toV2',
    valueName: 'aiAgents'
  });

  // Example: Add new field with sensible default
  const newSystemState = {
    someMetric: 0,
    initialized: true
  };

  // Example: Rename field
  const { aiAgents, ...rest } = oldState;
  const aiAgentsV2 = aiAgents;

  return {
    ...rest,
    schemaVersion: 2,  // CRITICAL: Update version
    newSystemState,
    aiAgentsV2
  };
};
```

### Step 4: Register Migration

```typescript
// src/simulation/migrations/registry.ts
import { migrateV1toV2 } from './v1_to_v2';
import { migrateV2toV3 } from './v2_to_v3';  // Your new migration

export const MIGRATIONS: Record<number, MigrationFunction> = {
  2: migrateV1toV2,
  3: migrateV2toV3,  // Register here
};
```

### Step 5: Update Initialization

```typescript
// src/simulation/initialization.ts
const state: GameState = {
  schemaVersion: 2,  // Update to new version
  currentMonth: initialMonth,
  // ... rest of initialization
};
```

### Step 6: Test Migration

```bash
# Run migration test suite
npx tsx scripts/testStateMigration.ts

# Expected output:
# Test 1: Pre-versioning save (no schemaVersion) ✅
# Test 2: v1 save (schemaVersion: 1) ✅
# Test 3: v1 → v2 migration ✅
# Test 4: Corrupted save (missing required fields) ✅
# Test 5: Current schema version (v2) ✅
```

### Step 7: Test with Real Save

```bash
# Save a game with OLD code (v1)
# Update code to NEW version (v2)
# Load the old save - migration should apply automatically
```

## Defensive Coding Patterns

### Use Assertion Utilities

```typescript
import { assertDefined, assertFinite, assertInRange } from '../utils/assertions';

// Validate old state fields exist
const oldField = assertDefined(oldState.oldField, {
  location: 'migrateV2toV3',
  valueName: 'oldField',
  additionalInfo: { message: 'v2 state missing oldField' }
});

// Validate numeric values
const metric = assertFinite(calculatedValue, {
  location: 'migrateV2toV3',
  valueName: 'derivedMetric',
  additionalInfo: { oldField }
});

// Validate ranges
const probability = assertInRange(oldState.probability, 0, 1, {
  location: 'migrateV2toV3',
  valueName: 'probability'
});
```

### Fail Loudly on Corruption

```typescript
// ❌ BAD: Silent fallback hides bugs
const value = oldState.field ?? defaultValue;

// ✅ GOOD: Fail loudly with context
const value = assertDefined(oldState.field, {
  location: 'migrateV2toV3',
  valueName: 'field',
  additionalInfo: { message: 'Required field missing from v2 state' }
});
```

### Deterministic Migrations

```typescript
// ❌ BAD: Non-deterministic (uses randomness)
const newField = Math.random() > 0.5 ? 'A' : 'B';

// ❌ BAD: Non-deterministic (uses current time)
const timestamp = Date.now();

// ✅ GOOD: Deterministic (same input → same output)
const newField = oldState.someMetric > threshold ? 'A' : 'B';

// ✅ GOOD: Derive from existing state
const timestamp = oldState.eventIdCounter * 1000;
```

## Common Migration Patterns

### Adding a New Field

```typescript
const newField = deriveFromExistingState(oldState);

return {
  ...oldState,
  schemaVersion: 2,
  newField
};
```

### Renaming a Field

```typescript
const { oldFieldName, ...rest } = oldState;

return {
  ...rest,
  schemaVersion: 2,
  newFieldName: oldFieldName
};
```

### Restructuring Nested Objects

```typescript
const { oldStructure, ...rest } = oldState;

return {
  ...rest,
  schemaVersion: 2,
  newStructure: {
    field1: oldStructure.a,
    field2: oldStructure.b
  }
};
```

### Changing Field Type

```typescript
// Old: number, New: object
const { oldField, ...rest } = oldState;

return {
  ...rest,
  schemaVersion: 2,
  newField: {
    value: oldField,
    metadata: deriveMetadata(oldField)
  }
};
```

## Testing Checklist

Before committing a migration:

- [ ] Migration function is deterministic (pure function)
- [ ] Uses assertion utilities to validate old state
- [ ] Updates schemaVersion to target version
- [ ] Registered in migrations/registry.ts
- [ ] CURRENT_SCHEMA_VERSION incremented
- [ ] initialization.ts sets new schemaVersion
- [ ] Test script passes all tests
- [ ] Tested with real old save file
- [ ] Type check passes (`npx tsc --noEmit`)

## Error Handling

### Migration Validation Failure

```
❌ Migration validation failed: eventIdCounter is undefined
  Location: validateMigratedState
  Target version: 2
  State keys: ["schemaVersion", "currentMonth", "aiAgents", ...]
```

**Cause:** Migration didn't populate required field
**Fix:** Add field initialization in migration function

### Migration Path Missing

```
❌ No migration path from v1 to v3
```

**Cause:** Skipped intermediate migration (v2)
**Fix:** Create v1→v2 and v2→v3 migrations (sequential)

### Corrupted Old State

```
❌ Failed to migrate saved state: v1 state missing aiAgents
  Cannot resume simulation with incompatible schema.
```

**Cause:** Old save is corrupted (missing required fields)
**Fix:** User must start new simulation (can't recover from corruption)

## Files Reference

### Core Files

- `src/types/game.ts` - GameState interface (add schemaVersion field here)
- `src/simulation/initialization.ts` - Set schemaVersion in new games
- `src/workers/simulationWorker.ts` - Integration point (calls migrateState)

### Migration Infrastructure

- `src/simulation/migrations/types.ts` - Types, CURRENT_SCHEMA_VERSION
- `src/simulation/migrations/registry.ts` - Migration registry
- `src/simulation/migrations/validator.ts` - Post-migration validation
- `src/simulation/migrations/index.ts` - Migration orchestrator
- `src/simulation/migrations/v{N}_to_{N+1}.ts` - Individual migrations

### Testing

- `scripts/testStateMigration.ts` - Test suite

### Documentation

- `docs/STATE_MIGRATION_GUIDE.md` - This file
- `logs/state_migration_implementation_*.txt` - Implementation log

## Impact

**Before this system:**
- Every deployment broke all saved games
- Users lost progress with each update
- No way to evolve GameState schema

**After this system:**
- Old saves automatically upgrade to current schema
- Users keep progress across deployments
- GameState can evolve without breaking compatibility
- Essential infrastructure for long-term project

## Future Work

When CURRENT_SCHEMA_VERSION reaches v3+, consider:
- Pruning very old migrations (e.g., v1→v2 after v5 ships)
- Migration performance optimization for large states
- Migration analytics (track which migrations users need)

---

**Last Updated:** November 21, 2025
**Maintainer:** Roy (simulation-maintainer)
**Status:** Production-ready
