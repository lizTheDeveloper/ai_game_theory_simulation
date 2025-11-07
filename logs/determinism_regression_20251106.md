# Determinism Regression Investigation
**Date:** November 6, 2025, 8:17 PM PST
**Status:** REGRESSION DETECTED - CV increased 2.61% → 5.16%

---

## Executive Summary

**CRITICAL:** After merging upstream changes (Week 5 + autonomous sessions), determinism REGRESSED significantly.

**Evidence:**
- **Before merge:** CV = 2.61% (9/10 runs identical, "Run 1 only" divergence)
- **After merge:** CV = 5.16% at Month 2 (ALL runs diverging)
- **Divergence point:** Month 2 (consistent with previous observations)
- **Capability range:** 2.4566 - 2.9567 (20% spread)
- **Alignment range:** 13.2567 - 13.2813 (minimal spread)

---

## What Changed

**Merge commit:** `ff79f5db` (Nov 6, 2025, 8:14 PM)
**Upstream commits merged:** 135 commits from origin/main
**Conflicts resolved:**
- `docs/function-doc-patches.json` (accepted remote)
- `docs/underdocumented.json` (accepted remote)
- `docs/wiki/RECENT_CHANGES.md` (accepted remote)
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (accepted remote)
- `src/simulation/research.ts` (accepted remote - determinism fixes PRESENT)

**Major upstream work:**
- Week 5: Variance Amplification Implementation
- Autonomous sessions (20251107_010001)
- Wet bulb temperature fixes
- Assertion coverage expansion
- QoL assertion fixes
- Dashboard state divergence work

---

## Verification

**Roy's fixes still present in research.ts:**
```typescript
// Line 396: ✅ PRESENT
const sortedDimensions = Object.entries(dimensionWeights).sort((a, b) => a[0].localeCompare(b[0]));

// Line 426: ✅ PRESENT
const sortedDomains = Object.entries(domainWeights).sort((a, b) => a[0].localeCompare(b[0]));
```

**This means:** The regression is NOT from losing our fixes. It's from NEW non-deterministic code introduced upstream.

---

## Hypothesis

**Most likely sources** (based on upstream work):
1. **Dashboard/frontend state changes** - User mentioned "the other agent working on the front-end"
2. **Variance amplification implementation** - Could have unsorted object iterations
3. **QoL assertion fixes** - Might have order-dependent logic
4. **Wet bulb temperature fixes** - Might iterate over objects

**Pattern to look for:**
- Unsorted `Object.entries()` / `Object.keys()` / `Object.values()`
- Unsorted array iterations where order matters
- Conditional RNG calls (call inside if-block instead of before)
- for...in loops without sorting

---

## Investigation Plan

1. **Identify changed simulation files** in the merge (135 commits)
2. **Audit for unsorted object iterations** using grep
3. **Run phase-by-phase tracking** to find exact divergence point
4. **Apply fixes** using established defensive pattern
5. **Validate** with N=10 Monte Carlo run

---

## Current State

**Validation log:** `logs/determinism_current_state_20251106_201708.log`
**Regression detected:** Month 2, CV = 5.16%
**Investigation:** IN PROGRESS (Roy launched)
**Priority:** CRITICAL - blocks all Monte Carlo validation

---

## Next Steps

1. [IN PROGRESS] Roy investigates new non-determinism sources
2. [PENDING] Identify exact files/lines causing regression
3. [PENDING] Apply determinism fixes
4. [PENDING] Validate CV returns to ≤ 0.01%
5. [PENDING] Update pre-commit hook to catch this pattern

---

## Timeline

- **8:14 PM:** Merge completed, pushed to main
- **8:17 PM:** Fresh validation run started
- **8:21 PM:** REGRESSION DETECTED (CV = 5.16%)
- **8:22 PM:** Roy investigation launched
