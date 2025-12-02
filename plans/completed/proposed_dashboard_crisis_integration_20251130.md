# Dashboard Crisis System Integration - Proposal

**Date:** November 30, 2025
**Status:** PROPOSED
**Priority:** LOW (UI polish, not simulation correctness)
**Effort:** ~1-2 hours
**Source:** Architecture Integration Review (Nov 30, 2025) - HIGH-2

## Problem Statement

Dashboard crisis aggregation code uses `(state as any)` to access crisis state:

```typescript
// src/lib/dashboard/aggregation/crises.ts:34-56
if ((state as any).phosphorusCrisis?.active) { ... }
if ((state as any).freshwaterCrisis?.active) { ... }
```

**Issues:**
1. Type bypass hides cross-module contract
2. Unclear which crisis systems are implemented vs planned
3. Could silently break if crisis state structure changes
4. Makes it hard to discover which crises exist

## Current State Investigation Needed

**Before implementing, investigate:**
1. Which crisis systems are actually implemented?
   - `grep -r "phosphorusCrisis" src/simulation/`
   - `grep -r "freshwaterCrisis" src/simulation/`
   - Check phase files for crisis state writes

2. What's the crisis state structure?
   - Find where crises are initialized
   - Document expected shape: `{ active: boolean, severity: number, ... }`

3. Are there other crisis types being accessed via type bypasses?
   - Audit all `(state as any)` patterns in dashboard code

## Proposed Solutions

### Option A: Explicit Crisis Registry (Preferred)

**Add to GameState:**
```typescript
// src/types/game.ts

export interface CrisisState {
  active: boolean;
  severity: number;
  month: number;        // When crisis started
  peakSeverity?: number;
  mitigationEffort?: number;
}

export interface GameState {
  // ... existing fields ...

  /** Active planetary boundary crises (if implemented) */
  crises?: {
    phosphorus?: CrisisState;
    freshwater?: CrisisState;
    // Add others as they're implemented:
    // nitrogen?: CrisisState;
    // biodiversity?: CrisisState;
    // etc.
  };
}
```

**Benefits:**
- Explicit contract for all crisis types
- Easy to discover which crises exist
- Type-safe access in dashboard
- Optional (backward compatible if no crisis phases exist)

**Changes needed:**
- Update GameState interface (1 file)
- Remove `(state as any)` in dashboard code (1 file)
- Update crisis phases to write to `state.crises.*` instead of `state.*Crisis` (TBD - depends on investigation)

### Option B: Dashboard-Only Type Extension (Simpler)

**If crisis phases are optional/experimental:**
```typescript
// src/lib/dashboard/aggregation/crises.ts

type StateWithCrises = GameState & {
  phosphorusCrisis?: { active: boolean; severity: number };
  freshwaterCrisis?: { active: boolean; severity: number };
};

export function aggregateCrises(state: StateWithCrises) {
  // Now type-safe without modifying GameState
  if (state.phosphorusCrisis?.active) { ... }
  if (state.freshwaterCrisis?.active) { ... }
}
```

**Benefits:**
- Minimal changes (1 file)
- Documents expected structure
- No GameState modifications (if crises are experimental)

**Drawbacks:**
- Doesn't enforce contract for crisis phases
- Duplicate type definitions if multiple dashboard files need this

### Option C: Crisis Phase Refactor (Most Comprehensive)

**If investigation reveals inconsistent crisis state:**
1. Create standardized crisis state structure
2. Migrate all crisis phases to use common pattern
3. Add crisis registry to GameState
4. Update dashboard to use registry

**Effort:** 3-4 hours (depends on how many crisis phases exist)

## Investigation Phase (30 min)

**Before choosing solution, answer:**
1. How many crisis types exist? (grep results)
2. Where are they initialized? (find phase files)
3. What's the state structure? (consistent or varied?)
4. Are crises optional features or core systems?

**Then:** Choose Option A (if crises are core) or Option B (if experimental)

## Research Needed

None - pure TypeScript/architecture refactoring.

## Expected Timeline

**Investigation:** 30 min
**Implementation:**
- Option A: 1 hour (GameState update + dashboard fix)
- Option B: 30 min (dashboard-only type extension)
- Option C: 3-4 hours (full crisis phase refactor)

**Validation:** 30 min (dashboard still works)

**Total: 1-2 hours (Option A or B), 4-5 hours (Option C)**

## Success Criteria

- ✅ Zero `(state as any)` in dashboard crisis code
- ✅ TypeScript compilation passes
- ✅ Dashboard crisis display functional (if crises exist)
- ✅ Crisis state structure documented
- ✅ All existing tests pass

## Risks

**Low risk:**
- Investigation may reveal crises aren't implemented yet
- In that case: Option B (dashboard-only typing) is sufficient
- Type-only changes, no logic modifications

## Dependencies

None - can be done independently.

## Future Work

After this cleanup:
- **Crisis phase audit:** Standardize all crisis implementations
- **Planetary boundary crises:** Implement remaining boundaries as crises
  - Nitrogen cycle
  - Biodiversity loss
  - Land use change
  - Aerosol loading
  - Novel entities
- **Crisis interaction modeling:** Multiple crises compounding
- **Dashboard crisis visualization:** Improved UI for crisis state

## Notes

- This is HIGH-2 from architecture review but LOW overall priority
- Affects UI display, not simulation correctness
- Good "between features" cleanup task
- May uncover incomplete crisis system implementation

## Investigation Script

```bash
# Find crisis state usage
grep -r "phosphorusCrisis" src/simulation/ --include="*.ts"
grep -r "freshwaterCrisis" src/simulation/ --include="*.ts"
grep -r "Crisis\.active" src/simulation/ --include="*.ts"

# Find crisis phases
find src/simulation/engine/phases -name "*Crisis*.ts" -o -name "*Boundary*.ts"

# Check GameState for crisis fields
grep -A 50 "export interface GameState" src/types/game.ts | grep -i crisis
```

## Expected Findings

**Hypothesis 1:** Crises are partially implemented
- Some planetary boundary phases exist
- They write to ad-hoc `state.*Crisis` fields
- Dashboard reads them via type bypass

**Hypothesis 2:** Crises are not implemented
- Dashboard code is optimistic/future-proofing
- Type bypass accesses undefined fields (gracefully fails)
- Should use Option B (dashboard-only typing) until crises implemented

**Hypothesis 3:** Crises are fully implemented but undocumented
- Multiple crisis phases exist
- Consistent state structure
- Should use Option A (add to GameState) to formalize
