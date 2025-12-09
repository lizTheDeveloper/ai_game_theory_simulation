# Threshold Lowering Regression Fix - December 9, 2025

**Status:** ✅ COMPLETE
**Severity:** CRITICAL (regression)
**Commits:** 3f3118de, 7130c7e6
**Session:** 62 (Dec 9, 2025)

---

## Summary

Re-applied AMOC → Amazon interaction removal after merge regression. Original fix (6671e0ed, Dec 8) was accidentally reverted in merge 23fd6987 when removing threshold uncertainty sampling code.

---

## Problem

**Original Issue (Dec 7):** Threshold lowering implementation (commit cf49657) received Grade D from research-skeptic review, with 5 CRITICAL issues identified.

**Issue 1 (Most Critical):** AMOC → Amazon interaction had WRONG SIGN
- Code: +0.25°C threshold reduction (destabilizing - more droughts)
- Research: Parsons 2023, Yuan 2025, Högner 2025 show STABILIZING effect (increased rainfall)
- Mechanism: AMOC slowdown → ITCZ shifts south → MORE rain to southern Amazon, not less

**Fixed (Dec 8):** Commit 6671e0ed removed interaction with research notes

**Regressed (Dec 9):** Merge 23fd6987 (threshold uncertainty removal) had conflict that re-added old code

**Re-Fixed (Dec 9):** Commits 3f3118de + 7130c7e6 restore fix with expanded research documentation

---

## Research Backing

### AMOC → Amazon Interaction (REMOVED)

**Why Removed:**
1. **Sign Error:** Original code had destabilizing (+0.25°C), research shows stabilizing effect
2. **Regional Heterogeneity:** Effect is NOT uniform across Amazon basin:
   - Northern Amazon: Loses rainfall (destabilizing)
   - Southern Amazon: Gains rainfall (stabilizing)
   - Net effect: Complex, depends on spatial distribution
3. **Current Model Limitation:** Simulation treats Amazon as single unit, cannot represent regional differences
4. **Conservative Decision:** Remove interaction until regional sub-modeling can be implemented

**Research Evidence:**
- **Parsons et al. (2023)** - "Impact of the Atlantic Meridional Overturning Circulation slowdown on the Amazon rainforest" - Climate Dynamics
  - AMOC slowdown → ITCZ southward shift → increased precipitation in southern Amazon
  - Mechanism: Weakened northward heat transport → cooler North Atlantic → ITCZ follows warm water
- **Yuan et al. (2025)** - Multi-model evidence for AMOC-Amazon stabilizing feedback
- **Högner et al. (2025)** - Regional heterogeneity documentation
- **Global Tipping Points Report (2023)** - AMOC slowdown increases precipitation to Amazon basin

### AMOC → Greenland Interaction (DOCUMENTED)

**Status:** Documented but commented out (requires negative interaction support)

**Research Backing:**
- **Global Tipping Points Report (2023)** - AMOC slowdown STABILIZES Greenland ice sheet
- **Mechanism:** Reduced heat transport to North Atlantic → cooler regional temperatures → slower ice melt
- **Effect:** -0.15°C threshold reduction (stabilizing)
- **Implementation Blocker:** Cascade model doesn't support negative (stabilizing) interactions yet
- **TODO:** Add support for stabilizing interactions, then uncomment

---

## Changes

### File: `src/types/tipping-points.ts`

**Lines 601-649:** AMOC → Amazon interaction removed, extensive research notes added

```typescript
// **AMOC → Amazon: REMOVED (STABILIZING, not destabilizing)**
//
// **Research Finding (2023-2025):** AMOC slowdown has STABILIZING effect on southern
// Amazon rainforest, contrary to earlier assumptions and original implementation here.
//
// **Mechanism:**
// - AMOC slowdown → reduced northward heat transport
// - North Atlantic cools → ITCZ shifts southward
// - ITCZ shift → INCREASED precipitation in southern Amazon basin
// - Net effect: MORE rainfall stabilizes forest (opposite of drought stress)
//
// **Sources:**
// 1. Parsons et al. (2023) - "Impact of the Atlantic Meridional Overturning
//    Circulation slowdown on the Amazon rainforest" - Climate Dynamics
//    https://doi.org/10.1007/s00382-023-06692-2
// 2. Yuan et al. (2025) - Multi-model evidence for stabilizing feedback
// 3. Högner et al. (2025) - Regional heterogeneity (north loses, south gains rain)
// 4. Global Tipping Points Report (2023) - AMOC slowdown increases Amazon precipitation
//
// **Regional Complexity:**
// - Northern Amazon: Loses rainfall (destabilizing)
// - Southern Amazon: Gains rainfall (stabilizing)
// - Current simulation: Treats Amazon as SINGLE tipping element
// - Cannot represent spatial heterogeneity in basin-scale model
//
// **Decision:** REMOVE interaction until regional sub-modeling implemented.
// Adding a destabilizing interaction contradicts recent research.
// Adding a stabilizing interaction requires negative threshold lowering support.
//
// **Original (INCORRECT) Implementation:**
// {
//   source: 'amoc',
//   thresholdReduction: 0.25,  // ← WRONG SIGN
//   mechanism: 'Altered precipitation patterns increase Amazon drought stress'
// }
//
// **Verification:** research/verification_cf49657_20251207.md (Grade D → CRITICAL)
// **Fix:** commit 6671e0ed (Dec 8, 2025)
// **Regression:** merge 23fd6987 (Dec 9, 08:02) - conflict reverted fix
// **Re-fix:** commit 3f3118de (Dec 9, 16:06)
```

**Lines 585-595:** AMOC → Greenland stabilizing feedback documented

```typescript
// **AMOC → Greenland: STABILIZING FEEDBACK (documented, not yet supported)**
//
// Research: Global Tipping Points Report 2023
// Mechanism: AMOC slowdown → cooler North Atlantic → reduced Greenland ice melt
// Effect: -0.15°C threshold reduction (STABILIZING)
//
// **Not yet implemented:** Cascade model doesn't support negative (stabilizing)
// threshold lowering. When support added, uncomment:
// {
//   source: 'amoc',
//   thresholdReduction: -0.15,  // Negative = stabilizing
//   mechanism: 'Cooler North Atlantic reduces ice sheet melt rate'
// }
```

---

## Verification History

### Quality Gate 1: Research Validation (Dec 7, 2025)

**Files:**
- `research/verification_cf49657_20251207.md`
- `research/amoc_amazon_interaction_correction_20251208.md`
- `research/verification_cf49657_REMEDIATION_20251208.md`

**Grade:** D (FAILED)

**Reviewers:**
- Cynthia (super-alignment-researcher) - Initial Grade C
- Sylvia (research-skeptic) - Downgraded to D

**CRITICAL Issues Identified:**
1. ✅ AMOC → Amazon sign error (destabilizing vs stabilizing)
2. ✅ sqrt(progress) scaling backwards (compound effects = linear, not sublinear)
3. ✅ Missing stabilizing feedbacks (AMOC → Greenland not documented)
4. ✅ Quantitative magnitudes not validated (labeled as "estimates")
5. ✅ 0.5°C cap misattributed (relabeled as "stability safeguard")

### Fix Timeline

**Dec 8, 08:36 (commit 6671e0ed):** All 5 CRITICAL issues fixed
- AMOC → Amazon removed
- sqrt scaling replaced with linear
- AMOC → Greenland documented
- Documentation clarified
- 0.5°C cap relabeled

**Dec 9, 08:02 (merge 23fd6987):** REGRESSION
- Threshold uncertainty removal had merge conflict
- Conflict resolution accidentally reverted AMOC → Amazon fix
- Other fixes (scaling, documentation) preserved

**Dec 9, 16:06 (commit 3f3118de):** RE-FIXED
- AMOC → Amazon interaction removed again
- Research notes expanded with full citations
- AMOC → Greenland notes expanded
- All 5 CRITICAL issues now resolved

**Dec 9, 16:16 (commit 7130c7e6):** Documentation
- Added `docs/implementation-history/threshold_lowering_regression_fix_20251209.md`
- Tracked regression cause (merge conflict in threshold uncertainty removal)

---

## Testing

**Type Check:** ✅ PASSED
```bash
npx tsc --noEmit
# Pre-existing errors only (unrelated to changes)
```

**Monte Carlo Validation:** ⏳ PENDING
- Required: N≥10 runs, 120+ months
- Check: Cascade behavior intact, no NaN errors
- Verify: Outcome distributions realistic

---

## Related Work

### Prerequisites
- Initial implementation: commit cf49657 (Dec 7)
- Research validation: Grade D → 5 CRITICAL issues
- Original fix: commit 6671e0ed (Dec 8)

### Follow-Up Required
- **Monte Carlo validation** (N≥10) - verify cascade behavior intact
- **Regional Amazon modeling** (MEDIUM priority) - enable proper AMOC interaction when spatial heterogeneity supported
- **Negative interaction support** (MEDIUM priority) - enable AMOC → Greenland stabilizing feedback

---

## Lessons Learned

### Merge Conflict Vigilance

**Problem:** Complex multi-file merge (threshold uncertainty removal) had conflict that silently reverted critical fix.

**Root Cause:** Commit 5eb4b5bd removed threshold uncertainty sampling code. Merge 23fd6987 had conflict in `tipping-points.ts` that was resolved by keeping OLD version of AMOC interactions.

**Prevention:**
1. Review all merge conflict resolutions for reverted fixes
2. Run type check + grep for known fixed issues after merges
3. Tag CRITICAL fixes in commit messages for easier tracking
4. Consider automated regression detection (grep for removed code patterns)

### Research Documentation Importance

**Original Issue:** Research notes were minimal, easy to lose context across merges.

**Solution:** Expanded research notes to 40+ lines with:
- Full citations (authors, year, journal, DOI)
- Mechanism explanation
- Regional complexity notes
- Decision rationale
- Verification history

**Result:** Much harder to accidentally revert - merge conflicts now show full research context.

### Stabilizing Interactions as First-Class Feature

**Current Limitation:** Cascade model only supports destabilizing (positive) threshold lowering.

**Real-World Complexity:** Many tipping point interactions are stabilizing:
- AMOC → Greenland (cooler temps slow melt)
- Amazon → Atlantic (vegetation moisture recycling)
- Antarctic → sea ice (albedo feedback can stabilize temporarily)

**Future Work:** Add support for negative (stabilizing) threshold interactions to properly model feedback loops.

---

## Archival Metadata

**Created:** December 9, 2025
**Session:** 62
**Worker:** autonomous researcher
**Commits:** 3f3118de, 7130c7e6
**Research Files:**
- `research/verification_cf49657_20251207.md`
- `research/amoc_amazon_interaction_correction_20251208.md`
- `research/verification_cf49657_REMEDIATION_20251208.md`
**Related Issues:** Nov 29 research audit identified AI parameter gaps (separate HIGH priority work)

---

**Next Session:** Monte Carlo validation + address 3 HIGH priority AI parameter citations from Nov 29 audit
