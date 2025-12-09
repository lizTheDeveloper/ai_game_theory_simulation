# CRITICAL REGRESSION: Threshold Lowering Fixes Reverted

**Date:** December 9, 2025
**Researcher:** Autonomous Researcher
**Severity:** CRITICAL
**Status:** BLOCKS PRODUCTION

---

## Executive Summary

**CRITICAL research-based fixes for tipping point threshold lowering (commit b6771427, Dec 8) were REVERTED in a subsequent commit, restoring scientifically incorrect code.**

**Impact:**
- Simulation now includes AMOC → Amazon destabilizing interaction
- 2023-2025 research shows this effect is actually **stabilizing** (opposite sign)
- Verification queue incorrectly shows "CRITICAL FIXES APPLIED" but they are NOT in current codebase

---

## What Was Fixed (Commit b6771427, Dec 8, 2025 11:30 UTC)

### 1. AMOC → Amazon Sign Error - CORRECTLY REMOVED

**Commit b6771427 applied this fix:**

```typescript
// === AMOC -> TROPICAL SYSTEMS ===
// AMOC collapse shifts tropical rainfall patterns
// ⚠️ RESEARCH UNCERTAINTY: 2023-2025 studies show AMOC collapse may STABILIZE Amazon
// (increased rainfall over eastern Amazon). This interaction is REMOVED pending
// resolution of contradictory evidence.
// Sources:
// - Nature Communications (2023): "AMOC collapse may stabilise eastern Amazonian rainforests"
// - npj Climate (2025): "AMOC collapse shows increased precipitation over most of Amazon"
// Regional heterogeneity exists (northern vs southern Amazon), but net effect unclear.
// TODO: Add regional differentiation if/when sufficient data available.
//
// {
//   sourceId: 'amoc',
//   targetId: 'amazon',
//   thresholdReduction: 0.25, // REMOVED - sign uncertain
//   mechanism: 'Monsoon disruption: AMOC collapse shifts ITCZ southward, reducing Amazon rainfall'
// },
```

**Research basis:**
- Cynthia's verification (research/verification_cf49657_20251207.md, line 124): "CONTRADICTORY EVIDENCE: Multiple 2024 studies show AMOC collapse **increases** Amazon rainfall, **stabilizes** rainforest"
- Nature Communications citation confirmed
- Verified mechanism: AMOC collapse → increased precipitation over most of Amazon

---

## What Was Reverted (Between b6771427 and HEAD)

**Current code (HEAD, src/types/tipping-points.ts lines 497-502):**

```typescript
// === AMOC -> TROPICAL SYSTEMS ===
// AMOC collapse shifts tropical rainfall patterns
{
  sourceId: 'amoc',
  targetId: 'amazon',
  thresholdReduction: 0.25, // AMOC collapse disrupts Amazon rainfall
  mechanism: 'Monsoon disruption: AMOC collapse shifts ITCZ southward, reducing Amazon rainfall'
},
```

**The detailed research note was deleted and the incorrect interaction was restored.**

---

## Git History

```bash
cf496579 - Original implementation (Nov 2025) - AMOC → Amazon destabilizing
e2720502 - FIX: Corrected AMOC interactions based on 2024-2025 research
6671e0ed - FIX: Correct AMOC-Amazon sign error + linear scaling
b6771427 - CORRECT: Commented out AMOC → Amazon with research note (Dec 8 11:30)
[some commit] - REGRESSION: Restored old code, deleted research notes
HEAD - CURRENT: Wrong code active
```

**Commit b6771427 diff:**
- Added detailed research note explaining contradictory evidence
- Commented out interaction pending resolution
- Cited Nature Communications 2023, npj Climate 2025
- Documented regional heterogeneity (northern vs southern Amazon)

**Between b6771427 and HEAD:**
- Research notes deleted
- Interaction uncommented
- Old, incorrect mechanism restored

---

## Verification Queue Status - INCORRECT

**File:** openspec/specs/research/verification-queue.md
**Lines 34-35:** "✅ AMOC → Amazon Sign Error: Interaction REMOVED, extensive research note added explaining 2023-2025 evidence shows stabilizing effect"

**Reality:** This fix WAS applied in b6771427, but was subsequently REVERTED. The verification queue incorrectly shows this as resolved.

---

## Impact on Simulation

**Current behavior (incorrect):**
- AMOC collapse → lowers Amazon threshold by 0.25°C
- This makes Amazon dieback MORE likely after AMOC collapse
- Contradicts 2023-2025 empirical research

**Correct behavior (per research):**
- AMOC collapse → STABILIZES Amazon (increased rainfall)
- Should either: (a) have no interaction, or (b) have NEGATIVE thresholdReduction (harder to tip)
- May require architectural changes to support stabilizing interactions

---

## Other Fixes That May Have Been Reverted

I have not verified whether OTHER fixes from the threshold lowering remediation (Dec 7-8) were also reverted. The verification queue lists:

2. ✅ sqrt(progress) Scaling Backwards - replaced with linear scaling
3. ✅ Missing Stabilizing Feedbacks - AMOC → Greenland stabilizing feedback documented
4. ✅ Quantitative Magnitudes Not Validated - documentation updated
5. ✅ 0.5°C Cap Misattributed - relabeled as simulation stability safeguard

**Recommendation:** Audit src/simulation/engine/phases/ClimateSystemPhase.ts and src/types/tipping-points.ts against commit b6771427 to identify all reverted fixes.

---

## Root Cause Analysis

**Hypothesis:** Merge conflict or branch merge restored old version of file.

**Evidence:**
- Many auto-merge commits in Dec 7-9 period (researcher worker branches)
- File modifications in b6771427 (Dec 8 11:30) but current HEAD has old code
- No explicit revert commit in git log

**Likely scenario:** Autonomous worker on different branch made changes to same file, merge restored old version without conflict detection.

---

## Recommended Actions

### IMMEDIATE (CRITICAL)

1. **Restore commit b6771427 fixes** - Re-apply all changes from that commit
2. **Verify other fixes** - Check if sqrt scaling, 0.5°C cap, etc. were also reverted
3. **Update verification queue** - Mark as "REGRESSION FOUND, RE-APPLYING FIXES"
4. **Run Monte Carlo** - N≥10 to verify fixes don't break cascade behavior

### SHORT TERM (HIGH)

5. **Add pre-commit hook** - Detect research note deletions in simulation files
6. **Branch coordination** - Ensure autonomous workers pull latest before changes
7. **Protected files list** - Flag recently-remediated files for extra review

### MEDIUM TERM (MEDIUM)

8. **Implement stabilizing interactions** - Current architecture only supports destabilizing
9. **Regional Amazon differentiation** - Model northern vs southern effects separately

---

## Verification File References

- **Cynthia's verification:** research/verification_cf49657_20251207.md (lines 119-128)
- **Sylvia's critique:** reviews/tipping_cascade_threshold_lowering_critique_20251207.md
- **Verification queue:** openspec/specs/research/verification-queue.md (lines 22-49)
- **Remediation plan:** (referenced in commit messages, file not found in scan)

---

## Files Requiring Immediate Attention

1. `src/types/tipping-points.ts` - Restore AMOC → Amazon research note, keep interaction commented
2. `src/simulation/engine/phases/ClimateSystemPhase.ts` - Verify linear scaling (not sqrt)
3. `openspec/specs/research/verification-queue.md` - Update status to reflect regression

---

## Next Steps for Researcher

Per CLAUDE.md: "NEVER make simulation code changes directly. ALWAYS invoke simulation-maintainer agent."

**I am documenting this regression but NOT fixing it.** The simulation-maintainer agent should:
1. Re-apply fixes from commit b6771427
2. Verify all 5 fixes listed in verification queue
3. Run Monte Carlo validation N≥10
4. Update verification queue with actual status

---

**Researcher Status:** Documented regression, handing off to simulation-maintainer for code fixes.
