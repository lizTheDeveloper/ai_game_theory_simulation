# SPAWN: simulation-maintainer

**Spawned by:** orchestrator-1
**Date:** 2025-11-20
**Task:** Defensive Fallback Migration (CRITICAL)

---

## Your Mission

Complete the migration from defensive fallback patterns to assertion utilities in simulation calculation paths. This addresses the split-brain error handling condition identified in the November 16 architecture review.

---

## Implementation Plan

**Location:** /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/defensive_fallback_migration_20251120.md

**Architecture Review:** /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/defensive_fallback_architecture_review_20251116.md

**Quality Gate 0:** ✅ PASSED (architecture review identifies split-brain condition as MEDIUM-HIGH risk)

---

## Scope

**Total violations:** 44 defensive fallback instances in src/simulation/

**Categories:**
- Category A: Configuration defaults (4) - KEEP AS-IS
- Category B: Map accumulation (2) - DOCUMENT AS INTENTIONAL
- Category C: State access in calculations (20) - **MUST FIX** (HIGH PRIORITY)
- Category D: UI display/logging (7) - DEFER (LOW PRIORITY)
- Category E: External/API boundaries (5) - DEFER (LOW PRIORITY)
- Category F: Documented initialization (2) - KEEP AS-IS

**Primary Focus:** Category C - 20 violations requiring migration to assertions

---

## Implementation Phases

### Phase 1: CRITICAL State Access Migrations (3 hours)

**Files to fix (20 violations):**

1. **IrreversibilityTrackingPhase.ts** (4 violations - lines 105, 212, 320, 671)
   - Pattern: `state.resourceEconomy?.co2?.temperatureAnomaly ?? 0`
   - Fix: Use `assertStateProperty` for nested access

2. **TransitionMortalityPhase.ts** (5 violations - lines 137, 145, 192, 511, 517)
   - Pattern: `state.governmentSystem?.internationalCoordination ?? 0.5`
   - Fix: Use `assertStateProperty` for state access

3. **organizationManagement.ts** (3 violations - lines 458, 885, 886)
   - Pattern: `org.workforceMultiplier ?? 1.0`
   - Fix: Use `assertStateProperty` for organization fields

4. **consciousnessGovernanceUtils.ts** (4 violations - lines 437, 468-470)
   - Pattern: `allRegions[targetRegion]?.preparedness ?? 0`
   - Fix: Use `assertDefined` + `assertStateProperty`

5. **ResourceSoilPhase.ts** (1 violation - line 59)
   - Pattern: `state.phosphorusSystem?.pollutionLevel ?? 0.25`
   - Fix: Use `assertStateProperty`

6. **PlanetaryBoundariesPhase.ts** (1 violation - line 63)
   - Pattern: `state.phosphorusSystem?.reserves ?? 1.0`
   - Fix: Use `assertStateProperty`

7. **CriticalJuncturePhase.ts** (1 violation - line 532)
   - Pattern: `escapeResult.metadata?.stateChanges ?? 0`
   - Fix: Use `assertStateProperty`

8. **techTree/effectsEngine.ts** (1 violation - line 914)
   - Pattern: `gameState.globalMetrics.nitrogenReductionTotal ?? 0`
   - Fix: Use `assertStateProperty`

**After each file:**
- Run `npx tsc --noEmit` to verify types
- Commit incrementally for easy revert

**After all files:**
- Run `npm test` to verify no regressions

### Phase 2: Documentation & Validation (2 hours)

1. Add inline documentation for Category B (map accumulation patterns)
   - Files: techTree/effectsEngine.ts lines 468, 476
   - Action: Ensure comments explain why `?? 0` is valid for Map.get()

2. Document other categories as intentional
   - Category D, E, F: Add inline comments or update plan document

3. Run Monte Carlo validation (N=10)
   ```bash
   npx tsx scripts/monteCarloSimulation.ts > logs/mc_defensive_fallback_$(date +%Y%m%d_%H%M%S).log 2>&1 &
   ```
   - Verify CV < 0.01% (determinism)
   - Verify no new NaN errors

4. Update CLAUDE.md
   - Add examples of acceptable vs. unacceptable fallback patterns
   - Document Category boundaries (where fallbacks are OK)

---

## Critical Requirements

**Assertion Utilities Available:**
- `assertFinite(value, context)` - Rejects NaN/Infinity
- `assertDefined(value, context)` - Rejects undefined/null
- `assertStateProperty(obj, 'path.to.prop', context)` - Replaces `?? fallback` patterns
- `assertInRange(value, min, max, context)` - Validates ranges
- `assertProbability(value, context)` - Validates [0, 1]
- `assertNonEmpty(array, context)` - Validates array has elements

**Context object format:**
```typescript
{
  location: 'PhaseName_functionName',
  valueName: 'propertyName',
  month: state.currentMonth,
  additionalInfo?: { ... }
}
```

**Defensive Coding Rules:**
- ❌ NEVER use `?? defaultValue` in calculation paths
- ✅ ALWAYS use assertion utilities for state access
- ✅ ACCEPTABLE: `?? fallback` for config defaults, UI display, Map.get()
- ✅ REQUIRED: Inline comments explaining why fallbacks are valid (Categories B, D, E, F)

**Testing Requirements:**
- Type check passes: `npx tsc --noEmit`
- Unit tests pass: `npm test`
- Monte Carlo validation: N=10, CV < 0.01%
- No new NaN errors in simulation runs

---

## Success Criteria

1. ✅ Zero defensive fallbacks in Category C (20 violations fixed)
2. ✅ All Category B patterns documented with inline comments
3. ✅ Type checker passes (`npx tsc --noEmit`)
4. ✅ Test suite passes (`npm test`)
5. ✅ Monte Carlo validation succeeds (N=10, CV < 0.01%)
6. ✅ CLAUDE.md updated with pattern boundaries

---

## Expected Deliverables

1. **Code changes:**
   - 8 files modified (Category C migrations)
   - 2 files documented (Category B comments)
   - 1 file updated (CLAUDE.md)

2. **Test results:**
   - `npm test` output (all passing)
   - Monte Carlo log file (N=10, CV validation)

3. **Documentation:**
   - Updated CLAUDE.md section on defensive patterns
   - Inline comments for intentional fallbacks

---

## Handoff to Architecture Review

When implementation complete:
1. Update todo list (mark completed)
2. Create handoff document summarizing changes
3. Orchestrator will review and potentially spawn architecture-skeptic for Quality Gate

---

## Notes

- Total estimated effort: 5 hours (3h implementation + 2h testing/docs)
- Incremental migration by file (easy revert if issues)
- Focus on Category C only (highest risk)
- Categories D, E, F deferred or documented as intentional
- Failure modes: Type errors, test regressions, NaN propagation
- Success criteria: Tests pass, Monte Carlo validates, no silent bugs

---

**BEGIN IMPLEMENTATION**
