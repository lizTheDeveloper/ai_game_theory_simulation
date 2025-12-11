# CRITICAL Regression Fix - AMOC-Amazon Interaction (Dec 9, 2025)

## Problem

Commit b6771427 (Dec 8, 11:30) correctly removed AMOC → Amazon destabilizing interaction based on 2023-2025 peer-reviewed research showing STABILIZING effect. This fix was accidentally **reverted** in merge commit 23fd6987 (Dec 9, 08:02) when removing threshold uncertainty sampling code.

## Root Cause

Merge conflict resolution in 23fd6987 brought back old tipping-points.ts code that had:
- Active AMOC → Amazon interaction (thresholdReduction: +0.25, destabilizing)
- Missing AMOC → Greenland stabilizing feedback documentation

The merge was focused on removing M-5 threshold uncertainty sampling but inadvertently reverted unrelated critical research fixes.

## Research Evidence (Grade D → Identified Sign Error)

**Verification:** research/verification_cf49657_20251207.md

**Evidence that AMOC collapse STABILIZES Amazon (not destabilizes):**
1. Parsons et al. (2023) Nature Communications: "AMOC collapse may stabilise eastern Amazonian rainforests"
2. Yuan et al. (2025) npj Climate: "AMOC collapse shows increased precipitation over most of Amazon"
3. Högner et al. (2025) ERL: +4.8% rainfall per 1 Sv AMOC weakening (observational data)

**Mechanism:** ITCZ southward shift brings MORE rain to southern Amazon, not less. Original assumption (reducing rainfall) was based on simplified ITCZ shift model without regional heterogeneity.

## Fix Applied (Commit 3f3118de)

### 1. AMOC → Amazon: REMOVED (lines 506-537)
```typescript
// ⚠️ RESEARCH CORRECTION (Dec 8-9, 2025): AMOC → Amazon interaction REMOVED
// Original implementation assumed AMOC collapse destabilizes Amazon.
// This is CONTRADICTED by 2023-2025 peer-reviewed research showing STABILIZING effect.
// {
//   sourceId: 'amoc',
//   targetId: 'amazon',
//   thresholdReduction: 0.25, // SCIENTIFICALLY INCORRECT - SIGN ERROR
//   mechanism: 'Monsoon disruption: AMOC collapse shifts ITCZ southward, reducing Amazon rainfall'
// },
```

### 2. AMOC → Greenland: DOCUMENTED (lines 479-489)
```typescript
// AMOC collapse reduces heat transport to North Atlantic, potentially slowing Greenland melt
// Research: Global Tipping Points Report (2023) - stabilizing feedback documented
// ⚠️ NOTE: This is a STABILIZING interaction (reduces likelihood of Greenland tip)
// Implementation note: Negative interaction (stabilizing) not yet supported in cascade model
// {
//   sourceId: 'amoc',
//   targetId: 'greenland',
//   thresholdReduction: -0.15, // NEGATIVE = stabilizing
//   mechanism: 'Heat transport reduction: AMOC collapse cools North Atlantic, slowing Greenland melt'
// },
```

## Verification of All 5 QG1 Issues

Original Grade: **D (FAILED)** - verification cf49657_20251207

After fix:

1. ✅ **AMOC → Amazon sign error:** REMOVED with research documentation
2. ✅ **sqrt(progress) scaling:** Already linear in HEAD (line 233: `sourceElement.progress`)
3. ✅ **AMOC → Greenland stabilizing feedback:** DOCUMENTED (pending feature support)
4. ✅ **Magnitude documentation:** Already labeled as engineering estimates
5. ✅ **0.5°C cap attribution:** Already corrected (lines 274-276: "simulation stability safeguard")

Expected Grade: **B (PASS with documented limitations)**

## Files Modified

- `src/types/tipping-points.ts`: AMOC interaction removals/documentation
- `src/simulation/engine/phases/ClimateSystemPhase.ts`: Already correct (no changes needed)

## Testing Status

- ✅ Type check: PASSED (npx tsc --noEmit shows pre-existing errors only)
- ⏳ Monte Carlo validation: REQUIRED (N≥10)
- ⏳ God mode analysis: REQUIRED (determinism check)

## Timeline of Fixes/Regressions

1. **Dec 7:** Original verification cf49657 identifies 5 CRITICAL issues (Grade D)
2. **Dec 8 (multiple commits):** Various attempts to fix issues
   - e2720502 (07:11): Changed AMOC → Amazon to negative (stabilizing)
   - 6671e0ed (08:36): Removed AMOC → Amazon entirely (more conservative)
   - b6771427 (11:30): Auto-commit preserving 6671e0ed fixes
3. **Dec 9:**
   - 23fd6987 (08:02): **REGRESSION** - merge reverted AMOC fixes while removing threshold sampling
   - 3f3118de (current): **FIX** - re-applied AMOC-Amazon removal with documentation

## Lesson Learned

When resolving merge conflicts, verify ALL changes in the merge, not just the feature being removed. The threshold uncertainty sampling removal inadvertently touched cascade interaction code.

**Prevention:** Pre-commit hook for merge conflict detection added (commit e81a415a), but need manual review of large diffs.

## Next Steps

1. Monte Carlo validation (N≥10) to verify cascade behavior without AMOC-Amazon
2. God mode analysis (CV < 0.01%) to verify determinism still intact
3. Consider implementing stabilizing interaction support (negative thresholdReduction)
4. Update verification queue status to PASS

---

**Fix Commit:** 3f3118de
**Regression Commit:** 23fd6987
**Original Fix:** 6671e0ed, b6771427
**Research Verification:** research/verification_cf49657_20251207.md
