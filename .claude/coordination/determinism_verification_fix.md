## Issue: verifyDeterminism.ts Script Bug

**Status:** BLOCKER for Issue #11 verification

**Problem:**
The verifyDeterminism.ts script is calling `createDefaultInitialState()` with the OLD signature (before Nov 7, 2025 refactor):
```typescript
// Line 189 (WRONG - old signature)
const initialState = createDefaultInitialState('balanced', undefined, undefined, undefined, undefined, SEED);
```

But the CURRENT signature (Nov 7, 2025) moved RNG to FIRST parameter and made it REQUIRED:
```typescript
export function createDefaultInitialState(
  rng: () => number,  // CRITICAL: RNG REQUIRED (first param)
  scenarioMode: ScenarioMode = 'historical',
  ...
)
```

**Fix Required:**
Update line 189 in scripts/verifyDeterminism.ts:
```typescript
// CORRECT - new signature
const rngInstance = createRNG(SEED);
const initialState = createDefaultInitialState(
  rngInstance,
  'balanced',
  undefined,
  undefined,
  undefined
);
```

**Context:**
- debugDeterminismPhases.ts works perfectly (100% deterministic)
- Only verifyDeterminism.ts has this script bug
- Not a simulation bug, just a script parameter order issue

**Priority:** CRITICAL BLOCKER (prevents Issue #11 archival)
