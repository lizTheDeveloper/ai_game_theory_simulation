# Type Safety Cleanup - Proposal

**Date:** November 30, 2025
**Status:** PROPOSED
**Priority:** HIGH (quick wins)
**Effort:** ~1 hour total
**Source:** Architecture Integration Review (Nov 30, 2025)

## Problem Statement

Two instances of `(state as any)` type bypasses creating hidden state contracts:

1. **HIGH-1:** Historical birth rate scaling flag (`_skipHistoricalBirthRateScaling`)
2. **HIGH-2:** Dashboard crisis state access (`phosphorusCrisis`, `freshwaterCrisis`)

These bypasses hide cross-module dependencies and could silently break if refactored.

## Proposed Solution

### Phase 1: Historical Birth Rate Flag (15 min)

**Add to GameState interface:**
```typescript
// src/types/game.ts
export interface GameState {
  // ... existing fields ...

  /** Internal flag: Skip historical birth rate scaling during hindcast validation */
  _skipHistoricalBirthRateScaling?: boolean;
}
```

**Remove type bypasses in:**
- `src/simulation/regionalPopulations.ts:432, 492`
- `src/simulation/historicalInitialization.ts:445, 905`

**Validation:**
- TypeScript compilation passes
- Hindcast validation still works correctly

### Phase 2: Dashboard Crisis Types (30 min)

**Option A - Add crisis fields to GameState (preferred):**
```typescript
// src/types/game.ts
export interface GameState {
  // ... existing fields ...

  phosphorusCrisis?: {
    active: boolean;
    severity: number;
    // ... other crisis state
  };

  freshwaterCrisis?: {
    active: boolean;
    severity: number;
    // ... other crisis state
  };
}
```

**Option B - Use explicit optional typing in dashboard:**
```typescript
// src/lib/dashboard/aggregation/crises.ts
type StateWithCrises = GameState & {
  phosphorusCrisis?: { active: boolean; severity: number };
  freshwaterCrisis?: { active: boolean; severity: number };
};
```

**Recommendation:** Option A (add to GameState) - makes contract explicit

**Remove type bypasses in:**
- `src/lib/dashboard/aggregation/crises.ts:34-56`

**Validation:**
- TypeScript compilation passes
- Dashboard crisis display still works
- No simulation behavior changes

## Research Needed

None - pure TypeScript refactoring, no simulation mechanics changes.

## Expected Timeline

- Phase 1: 15 minutes
- Phase 2: 30 minutes
- Testing: 15 minutes
- **Total: 1 hour**

## Success Criteria

- ✅ Zero instances of `(state as any)` in identified files
- ✅ TypeScript compilation passes with no new errors
- ✅ Hindcast validation tests pass
- ✅ Dashboard crisis display functional
- ✅ All existing tests pass

## Risks

**Low risk:**
- Pure typing changes, no logic modifications
- Well-isolated changes (4 files max)
- Easy to revert if issues found

## Dependencies

None - can be done immediately.

## Notes

- Consider broader `(state as any)` audit after this cleanup
- Architecture review also noted asyncLogger has some legacy bypasses (MEDIUM priority)
