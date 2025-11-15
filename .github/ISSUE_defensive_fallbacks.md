# Defensive Fallback Violations - Systematic Cleanup Required

**Priority:** HIGH
**Category:** Code Quality / Defensive Programming
**Identified:** November 13, 2025 (Architecture Review)
**Owner:** @simulation-maintainer (Roy)

## Problem

Architecture review identified **20+ defensive fallback patterns** (`??` and `||`) that violate project standards for research simulation code quality.

**Example violation:**
```typescript
// ❌ WRONG - Masks undefined state
const climateStability = state.environmentalAccumulation?.climateStability ?? 0.5;

// ✅ CORRECT - Fails loudly with context
const climateStability = assertStateProperty(
  state.environmentalAccumulation,
  'climateStability',
  { location: 'FunctionName', month: state.currentMonth }
);
```

**Why this matters:**
- Silent fallbacks mask state initialization bugs
- Create non-deterministic behavior when fallbacks differ across calls
- Violate research simulation principle: invalid values are bugs to fix, not hide
- Made the Oct 2025 ecology NaN bug undetectable for months

## Affected Files

**CRITICAL (Hot Paths):**
- `src/simulation/engine/phases/EmergencyResponsePhase.ts` (4 fallbacks)

**HIGH:**
- `src/simulation/engine/phases/OutcomeProbabilitiesPhase.ts` (6 fallbacks)
- `src/simulation/aiSuffering.ts` (3 fallbacks)
- `src/simulation/dystopiaProgression.ts` (2 fallbacks)
- `src/simulation/alignmentDynamics.ts` (1 fallback)

**MEDIUM:**
- `src/simulation/earlyWarningSystems.ts` (1 fallback)
- `src/simulation/workflowAdaptation.ts` (1 fallback)

**LOW (Acceptable - config defaults):**
- `src/simulation/engine.ts` (configuration initialization - OK)
- `src/simulation/organizationManagement.ts` (optional fields - check types)

## Solution

Replace calculation fallbacks with assertion utilities from `src/simulation/utils/assertions.ts`:

- `assertStateProperty(obj, 'field', context)` - For required state fields
- `assertFinite(value, context)` - Wrap calculations
- `assertProbability(value, context)` - For [0, 1] ranges

**Acceptable fallback locations:**
- Configuration defaults (e.g., `config.maxMonths ?? 1000`)
- Display-only code (UI/logging, not calculations)
- Optional fields in type definitions (document why)

## Implementation Plan

1. **Audit phase (DONE):** Document all violations - see `logs/defensive_fallback_audit_20251113.md`
2. **Fix CRITICAL/HIGH:** Replace fallbacks in hot paths (phases, core calculations)
3. **Type check:** `npx tsc --noEmit`
4. **Validation:** Run quick simulation + Monte Carlo N=10
5. **Document:** Update defensive coding guide with examples
6. **Fix MEDIUM:** Address remaining violations when touching those files

## Validation Criteria

- [ ] All CRITICAL violations fixed (EmergencyResponsePhase.ts)
- [ ] All HIGH violations fixed (5 files, ~12 fallbacks)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Quick simulation completes without assertion errors
- [ ] Monte Carlo N=10 shows no new errors
- [ ] Defensive coding guide updated with examples

## Related

- **Architecture Review:** `reviews/architecture_review_nov13_20251113.md` (Issue #3)
- **Audit Log:** `logs/defensive_fallback_audit_20251113.md`
- **Original Bug:** Oct 2025 ecology NaN hidden by `?? 50` fallback
- **Standards:** `CLAUDE.md` - "NaN and Invalid Value Handling" section

## References

- Assertion utilities: `src/simulation/utils/assertions.ts`
- Project standards: `docs/DEVELOPMENT_WORKFLOW.md`
- Similar cleanup: Nov 2025 god mode NaN fix (wrong population source)

---

**Status:** 📋 DOCUMENTED - Ready for implementation
**Next Step:** Apply fixes to CRITICAL + HIGH files, then validate
