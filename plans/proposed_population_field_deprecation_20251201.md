# Proposed Plan: Deprecate globalMetrics.population Field

**Date:** December 1, 2025
**Priority:** LOW
**Effort:** Trivial (5 minutes)
**Category:** Technical Debt / Documentation

## Problem Statement

From Architecture Review (Dec 1, 2025 - Grade A-):

> **HIGH-1:** globalMetrics.population Write Without Sync (MEDIUM risk)
>
> Population is written to `globalMetrics.population` during historical overrides, but the source of truth is `humanPopulationSystem.population`. This creates potential for desynchronization if code reads from the wrong location.

**Root Cause Context (Nov 2025 god mode NaN bug):**

The god mode test was reading from `state.population` (which doesn't exist on GameState), falling back to `undefined`, causing `undefined / 1e9 = NaN`. The fix was to always read from `humanPopulationSystem.population`.

**Current State:**
- **Source of truth:** `state.humanPopulationSystem.population` ✅ CORRECT
- **Legacy field:** `state.globalMetrics.population` ⚠️ EXISTS but may not sync after init
- **Historical initialization:** Writes to BOTH fields (initialization.ts:1517-1526)

**Risk:** Future developers might read from wrong location, causing subtle bugs.

## Proposed Solution

### Phase 1: Add Deprecation Warning Comment (5 min)

Update `src/simulation/initialization.ts:1526`:

```typescript
// Write population to humanPopulationSystem (source of truth)
state.humanPopulationSystem.population = targetPop;
state.humanPopulationSystem.demographics.forEach((demo, regionId) => {
  const regionPop = targetPop * demo.fraction;
  demo.population = regionPop;
  demo.births = demo.fertility * regionPop;
  demo.deaths = demo.mortality * regionPop;
});

// DEPRECATED: globalMetrics.population is NOT synced after initialization.
// ALWAYS read from humanPopulationSystem.population instead.
// This write is for legacy compatibility only and may be removed in future.
state.globalMetrics.population = targetPop;
```

### Phase 2: Add Note to GameState Interface (Optional)

If we want to be extra clear, add JSDoc comment in `src/types/game.ts`:

```typescript
export interface GlobalMetrics {
  // ... other fields

  /**
   * @deprecated Legacy field. NOT synced after initialization.
   * ALWAYS use humanPopulationSystem.population instead.
   */
  population: number;

  // ... rest of fields
}
```

## Research Foundation

**Justification:** Defensive coding pattern - fail-loudly philosophy (see CLAUDE.md: "Never use silent fallback values for NaN/undefined").

**Historical Bug:** Nov 2025 god mode NaN - reading from wrong population field caused silent failure.

**No peer-reviewed research needed** - pure code quality improvement.

## Acceptance Criteria

1. Deprecation comment added to initialization.ts:1526
2. (Optional) JSDoc deprecation added to GlobalMetrics interface
3. No code changes to runtime behavior
4. All 460 tests continue passing
5. `npx tsc --noEmit` passes

## Expected Timeline

- **Implementation:** 5 minutes (comment only)
- **Testing:** Not needed (no code changes)
- **Total:** 5 minutes

## Failure Modes

**None** - This is documentation only, no runtime changes.

## Interaction Map

**Affects:**
- `src/simulation/initialization.ts` - Documentation update
- `src/types/game.ts` - (Optional) Interface documentation

**Is affected by:** None

## Validation Command

```bash
# No runtime validation needed (docs only)
# Optional: Check comment formatting
git diff src/simulation/initialization.ts
```

## Related Work

- **Nov 2025 god mode NaN bug** - Root cause: reading from wrong population field
- **Architecture Review:** Dec 1, 2025 - Grade A-, HIGH-1 issue (MEDIUM risk)
- **Defensive Programming:** See CLAUDE.md section on NaN and invalid value handling

## Implementation Notes

**Token Conservation:** Trivial documentation change, ~1k tokens.

**Agent Assignment:** simulation-maintainer (Roy) - Defensive coding expertise.

**Priority Rationale:** LOW priority because:
- No active bugs (all code uses correct field now)
- Documentation improvement only
- LOW-risk technical debt cleanup
- Not blocking any other work

**Why Not Just Remove It?**
- Historical initialization writes to it (backward compat during hindcast mode)
- May be consumed by UI/visualization code
- Safer to deprecate with warning first, remove in Phase 2 if unused
