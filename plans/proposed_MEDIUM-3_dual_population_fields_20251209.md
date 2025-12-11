# MEDIUM-3: Dual Population Fields Cleanup

**Created:** December 9, 2025
**Priority:** MEDIUM
**Effort:** SMALL (1-2 hours)
**Status:** Proposed
**Origin:** Architecture Integration Review Dec 9, 2025

---

## Problem Statement

The GameState interface has TWO population fields:
1. **`state.globalMetrics.population`** - Legacy field, initialized to 8.0B, **never synced after initialization**
2. **`state.humanPopulationSystem.population`** - **Source of truth**, updated every month

This creates a footgun where developers might accidentally read from the wrong field and get stale data.

**Historical Impact:**
- **Nov 2025 God Mode NaN bug:** Test script read from `state.population` (undefined) → `undefined / 1e9 = NaN`
- **Documentation confusion:** Multiple fixes needed to clarify which field to use
- **Code review overhead:** Every population access needs scrutiny

**Current Mitigation:**
- Documentation in `CLAUDE.md` warns about this
- Assertion utilities catch some cases
- BUT: The footgun still exists and will bite future developers

---

## Current State

### Population Fields in GameState

**Field 1: `globalMetrics.population`**
- **Location:** `src/types/metrics.ts` (GlobalMetrics interface)
- **Initialized:** `initializeGameState()` → 8.0 billion
- **Updated:** NEVER (frozen at 8.0B)
- **Purpose:** Legacy artifact from pre-regional population system
- **Status:** MISLEADING STALE DATA

**Field 2: `humanPopulationSystem.population`**
- **Location:** `src/types/population.ts` (HumanPopulationSystem interface)
- **Initialized:** `initializeGameState()` → calculated from regional data
- **Updated:** Every month by `HumanPopulationPhase.ts`
- **Purpose:** Actual current population
- **Status:** SOURCE OF TRUTH ✅

### Usage Pattern Analysis

**Grep Results:**
```bash
# Correct usage (humanPopulationSystem.population)
src/simulation/engine/phases/*.ts: 40+ instances

# Defensive fallback (for test scripts)
scripts/*.ts: state.humanPopulationSystem?.population ?? 8.0

# WRONG usage (state.population - doesn't exist)
# BLOCKED: Would cause TypeScript error

# MISLEADING usage (globalMetrics.population - stale)
# Currently ~5 instances, all need review
```

---

## Proposed Solution

### Option A: Remove Legacy Field (RECOMMENDED)

**Rationale:** Clean break, forces all code to use correct field

**Changes:**
1. Remove `population: number` from `GlobalMetrics` interface
2. Find all references to `globalMetrics.population` (grep)
3. Replace with `humanPopulationSystem.population`
4. Update initialization code (remove assignment)
5. Update tests (use correct field)

**Pros:**
- Eliminates footgun entirely
- Type system prevents wrong usage
- Clear migration path

**Cons:**
- Breaking change (but internal only, no public API)
- Requires finding all references (~5-10 locations)

---

### Option B: Sync Legacy Field (NOT RECOMMENDED)

**Rationale:** Keep backward compatibility, sync on every update

**Changes:**
1. Add sync logic to `HumanPopulationPhase.ts`
2. After updating `humanPopulationSystem.population`, sync to `globalMetrics.population`
3. Add assertion: both fields must match

**Pros:**
- Backward compatible
- Both fields work

**Cons:**
- **Maintains the footgun** - future developers still don't know which is canonical
- **Complexity overhead** - two fields for one value
- **Cognitive load** - "Why do we have two population fields?"
- **Maintenance burden** - sync logic in every population update

---

### Recommended: Option A (Remove Legacy Field)

**Implementation Plan:**

#### Phase 1: Grep Analysis
```bash
# Find all usages of globalMetrics.population
grep -r "globalMetrics.population" src/
grep -r "globalMetrics.population" scripts/
grep -r "globalMetrics.population" tests/
```

#### Phase 2: Code Migration
For each instance:
1. Check if it's a read or write
2. Replace with `state.humanPopulationSystem.population`
3. Add defensive fallback ONLY in test scripts: `state.humanPopulationSystem?.population ?? 8.0`
4. For simulation code: Use assertion utilities (no fallbacks)

#### Phase 3: Type Definition Update
**File:** `src/types/metrics.ts`
```typescript
export interface GlobalMetrics {
  // Remove this field entirely:
  // population: number;

  // Keep all other fields:
  gdpPerCapita: number;
  globalGini: number;
  unemploymentRate: number;
  ...
}
```

#### Phase 4: Initialization Cleanup
**File:** `src/simulation/initialState.ts` (or wherever `initializeGameState` is)
```typescript
// Remove this assignment:
// globalMetrics: {
//   population: 8.0,  // DELETE THIS LINE
//   ...
// }
```

#### Phase 5: Test Updates
**Files:** All test files using population
```typescript
// OLD (will now error):
const pop = state.globalMetrics.population;

// NEW:
const pop = state.humanPopulationSystem.population;
```

---

## Risk Assessment

**LOW RISK - Type system prevents most errors**

**Risks:**
1. **Breaking existing code** - Mitigated by TypeScript (compilation errors guide migration)
2. **Missing references** - Mitigated by grep + type checking
3. **Test failures** - Expected, easy to fix (just update field path)

**Mitigation:**
- Run full test suite after migration
- Run `npx tsc --noEmit` to catch type errors
- Grep for all references before removing field
- Keep legacy field commented out for one commit (safety net)

---

## Testing Strategy

### Pre-Migration Verification
1. Grep all instances of `globalMetrics.population`
2. Document each usage location
3. Create test case: verify `humanPopulationSystem.population` updates correctly

### Post-Migration Verification
1. `npx tsc --noEmit` - Must pass (no type errors)
2. `npm test` - All tests must pass
3. Run god mode test - Population must update correctly
4. Verify no `globalMetrics.population` references remain (grep)

### Regression Tests
**File:** `tests/population/populationFieldMigration.test.ts` (NEW)

**Test Cases:**
1. `humanPopulationSystem.population` updates every month
2. Reading population from correct field works
3. TypeScript error if trying to read `globalMetrics.population`
4. Test scripts use defensive fallback pattern

---

## Implementation Checklist

- [ ] Phase 1: Grep analysis (find all `globalMetrics.population` references)
- [ ] Phase 2: Document each usage (create migration list)
- [ ] Phase 3: Replace references with `humanPopulationSystem.population`
- [ ] Phase 4: Remove `population` field from `GlobalMetrics` interface
- [ ] Phase 5: Update initialization code (remove assignment)
- [ ] Phase 6: Run type checking (`npx tsc --noEmit`)
- [ ] Phase 7: Fix all type errors
- [ ] Phase 8: Run test suite (`npm test`)
- [ ] Phase 9: Fix test failures
- [ ] Phase 10: Manual god mode test
- [ ] Phase 11: Update documentation (`CLAUDE.md`, remove warning)
- [ ] Phase 12: Update `openspec/specs/simulation/spec.md` (mark MEDIUM-3 complete)

---

## Expected Locations to Update

**Based on grep analysis (estimated):**

1. **`src/types/metrics.ts`** - Remove field definition
2. **`src/simulation/initialState.ts`** - Remove initialization
3. **`src/simulation/engine/phases/*.ts`** - 2-5 instances (review each)
4. **`scripts/*.ts`** - Add defensive fallback for test scripts
5. **`tests/**/*.test.ts`** - Update test assertions

**Total Estimated Changes:** 10-20 locations

---

## Success Criteria

1. ✅ `GlobalMetrics.population` field removed from type definition
2. ✅ All code uses `humanPopulationSystem.population`
3. ✅ Type checking passes (`npx tsc --noEmit`)
4. ✅ All tests pass (`npm test`)
5. ✅ God mode test shows correct population updates
6. ✅ Grep confirms zero references to `globalMetrics.population`
7. ✅ Documentation updated (remove warning from `CLAUDE.md`)
8. ✅ No regression in population calculations

---

## Effort Estimate

**SMALL: 1-2 hours**

**Breakdown:**
- Grep analysis: 15 minutes
- Code migration: 30 minutes
- Type definition update: 5 minutes
- Test updates: 30 minutes
- Verification: 15 minutes
- Documentation: 15 minutes

**Agent:** `simulation-maintainer` (knows population system intimately)

**Blocked By:** None
**Blocks:** Future population-related bugs

---

## Follow-Up Work (Future)

**After MEDIUM-3 completion:**
- Review other `GlobalMetrics` fields for staleness
- Consider deprecating `GlobalMetrics` entirely (most fields moved to domain-specific systems)
- Document canonical field locations in `CLAUDE.md`

---

## Historical Context

**Nov 2025 God Mode NaN Bug:**
> Test script accessed `state.population` (doesn't exist) → `undefined / 1e9 = NaN` → Monte Carlo validation blocked

**Nov 2025 Fix:**
> Updated test scripts to use `state.humanPopulationSystem?.population ?? 0`

**Dec 2025 Architecture Review:**
> "MEDIUM-3: Dual Population Fields - Legacy globalMetrics.population footgun (caused Nov 2025 NaN bug)"

**CLAUDE.md Documentation (current):**
```markdown
**Accessing Population (Nov 2025 fix):**
// ❌ WRONG - This field doesn't exist on GameState
const pop = state.population;

// ✅ CORRECT - Access from humanPopulationSystem
const pop = state.humanPopulationSystem.population;
```

---

## Related Work

**Completed:**
- M-7: Fix Population Assertions for Near-Extinction (Dec 7, 2025)
- Population system refactor (moved to regional model)
- NaN handling improvements (assertion utilities)

**Pending:**
- HIGH-2: Dashboard Missing Radiation Metrics
- HIGH-1: Radiation Integration with Regional Systems
- MEDIUM-1: Silent Fallback Migration (large effort, deferred)

---

## Notes

- **Type safety is our friend** - Removing the field forces correct usage
- **Breaking change is GOOD** - Prevents silent bugs from stale data
- **Test scripts need defensive fallback** - They don't have full state guarantees
- **Simulation code should NEVER use fallback** - Use assertions instead
- This cleanup prevents the same bug class from recurring
