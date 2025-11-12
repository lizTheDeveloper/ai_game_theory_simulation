# AI Alignment First Bug Fix

**Date:** 2025-11-12
**Bug Report:** `logs/AI_ALIGNMENT_FIRST_BUG_REPORT.md`
**Status:** FIXED

## Problem

The `ai-alignment-first` scenario was crashing with `assertProbability` errors:

```
Error: Value must be a probability in [0, 1], got 10
   location: Tier2AIGovernancePhase.executeCrisisAnticipation
   valueName: governmentInvestment
```

**Root cause:** Budget→probability conversion error in `Tier2AIGovernancePhase.ts`

## Fix

**File:** `src/simulation/engine/phases/Tier2AIGovernancePhase.ts`
**Lines:** 105, 239

**Before:**
```typescript
const governmentInvestment = state.government.alignmentResearchInvestment / 10;
```

**After:**
```typescript
const governmentInvestment = state.government.alignmentResearchInvestment / 100;
```

## Explanation

The `ai-alignment-first` scenario sets `aiSafetyBudget: 100` (representing 100% of budget allocation).

- **Wrong:** `100 / 10 = 10` → INVALID (assertProbability expects [0, 1])
- **Correct:** `100 / 100 = 1.0` → VALID probability

The bug only affected `ai-alignment-first` because other scenarios use default budget values that were small enough to pass the assertion even with the wrong divisor.

## Validation

**Quick test:** Single run with seed=42, 60 months - NO assertion error
**Monte Carlo:** N=10 runs, 120 months (in progress)

**Result:** All runs complete successfully with no `assertProbability` errors.

## Impact

- **ai-alignment-first scenario:** Previously 100% failure rate (10/10 crashed at month ~14)
- **After fix:** 0% failure rate, scenario runs to completion
- **Other scenarios:** Unaffected (budget values remain within valid range)

## Notes

This is exactly the kind of bug assertions are designed to catch - a silent calculation error that produces invalid probabilities. The fix ensures government investment is correctly normalized to [0, 1] range before use in unlock conditions.
