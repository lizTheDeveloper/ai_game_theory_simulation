# Economic Bifurcation Initialization Bug - Nov 28, 2025

## CRITICAL: Economic Collapse at Month 0

**Priority:** CRITICAL (blocks ALL TIER 2 continuation)

**Status:** ROOT CAUSE IDENTIFIED

---

## Problem Statement

Monte Carlo validation (N=10) shows **100% dystopia rate** across all runs. Investigation reveals:

### Symptoms
- "Distance to thresholds = 0.000005" (effectively zero)
- Regime shifts occurring at Month 0 (initialization)
- 100% of runs trigger economic-collapse regime immediately

### Root Cause
```
🔀 BIFURCATION: economic threshold crossed at Month 0
   (value: 0.190, threshold: 0.228, regime: economic-collapse)
```

The economic stability calculation at initialization produces values **below the economic collapse threshold range [0.15, 0.25]**.

---

## Technical Analysis

### Current Formula (BifurcationLogicPhase.ts:242)
```typescript
const economicStability = (economicStage / 4.0 + wealthDistribution) / 2.0;
```

### Initialization Values (initialization.ts:768-772)
```typescript
economicTransitionStage: 0,        // Pre-AI economy
wealthDistribution: 0.38,          // Inverted Gini (1 - 0.62)
```

### Calculation
```
economicStability = (0/4.0 + 0.38) / 2.0 = 0.19
```

### Threshold Sampling
```typescript
// bifurcation.ts:298-305
economicCollapseThreshold: {
  base: 0.20,
  variance: 0.05,
  location: sampleThreshold(0.20, 0.05),  // Uniform[0.15, 0.25]
  direction: 'below'
}
```

### Result
- **50% of runs**: threshold > 0.19 → **IMMEDIATE COLLAPSE AT MONTH 0**
- **All runs with threshold > 0.19**: Start in economic-collapse regime
- **Cascade effect**: Economic collapse → governance failure → social breakdown → 100% dystopia

---

## Why This Is Wrong

### Conceptual Error
The formula mixes two incompatible concepts:

1. **`economicTransitionStage`** (0-4 scale)
   - 0: Pre-AI (2025 baseline)
   - 1: AI displacement begins
   - 2: Mass unemployment crisis
   - 3: UBI/transition policies
   - 4: Post-scarcity

2. **Economic COLLAPSE threshold**
   - Should represent: GDP crash, mass unemployment, financial system failure
   - Currently represents: "Not yet reached post-scarcity"

**Being at Stage 0 (2025 functioning economy) should NOT trigger economic collapse!**

---

## Proposed Solutions

### Option 1: Fix the Formula (RECOMMENDED)
**Use actual economic distress metrics instead of progression stage:**

```typescript
// BEFORE (conceptually wrong):
const economicStability = (economicStage / 4.0 + wealthDistribution) / 2.0;

// AFTER (measures actual collapse risk):
const economicStability = (1 - unemploymentLevel) * (1 - povertyRate) * wealthDistribution;
```

**Pros:**
- Conceptually correct (measures distress, not progression)
- Uses empirical metrics (unemployment, poverty, inequality)
- 2025 baseline: `(1-0.05) * (1-0.10) * 0.38 = 0.32` ✅ Above threshold
- True collapse: `(1-0.50) * (1-0.40) * 0.20 = 0.06` ✅ Below threshold

**Cons:**
- Requires checking if `unemploymentLevel` and `povertyRate` exist in state
- May need to add poverty metric if missing

### Option 2: Add Baseline Offset
**Keep formula, but offset to ensure 2025 starts above threshold:**

```typescript
// BEFORE:
const economicStability = (economicStage / 4.0 + wealthDistribution) / 2.0;

// AFTER:
const economicStability = ((economicStage + 2.0) / 6.0 + wealthDistribution) / 2.0;
```

**Result:**
- Stage 0: `((0+2)/6 + 0.38)/2 = 0.355` ✅ Above max threshold (0.25)
- Stage 4: `((4+2)/6 + 0.38)/2 = 0.69` ✅ Still increases

**Pros:**
- Minimal code change
- No new dependencies

**Cons:**
- Still conceptually wrong (progression ≠ stability)
- Magic numbers (why 2.0? why 6.0?)

### Option 3: Lower the Threshold
**Keep formula, but adjust threshold to match 2025 baseline:**

```typescript
// BEFORE:
base: 0.20, variance: 0.05  // [0.15, 0.25]

// AFTER:
base: 0.10, variance: 0.05  // [0.05, 0.15]
```

**Pros:**
- Minimal code change

**Cons:**
- Still conceptually wrong
- Threshold now represents "haven't started AI transition yet" (not collapse)

---

## Recommended Fix

**Option 1** (use actual distress metrics) is the correct long-term solution, but requires checking state structure.

**SHORT-TERM FIX** (to unblock TIER 2): Option 2 (baseline offset)
**LONG-TERM FIX** (for research validity): Option 1 (distress metrics)

---

## Implementation

### File: `src/simulation/engine/phases/BifurcationLogicPhase.ts`

**Location:** Lines 230-256 (economic collapse threshold calculation)

**SHORT-TERM PATCH:**
```typescript
// Economic collapse threshold
// HOTFIX (Nov 28, 2025): Add baseline offset to prevent Month 0 collapse
// TODO (TIER 2 cleanup): Replace with actual distress metrics (unemployment, poverty)
// Research: 2025 baseline should be "functioning economy", not "collapsed"
const economicStage = assertStateProperty(state.globalMetrics, 'economicTransitionStage', {
  location: 'BifurcationLogicPhase.calculateProximities',
  month: state.currentMonth,
});
const wealthDist = assertStateProperty(state.globalMetrics, 'wealthDistribution', {
  location: 'BifurcationLogicPhase.calculateProximities',
  month: state.currentMonth,
});

// HOTFIX: Offset to ensure 2025 baseline (stage=0) starts above max threshold (0.25)
// Formula: ((stage + 2) / 6 + wealthDist) / 2
// - Stage 0, wealthDist=0.38: ((0+2)/6 + 0.38)/2 = 0.355 ✅ Above 0.25
// - Stage 4, wealthDist=0.38: ((4+2)/6 + 0.38)/2 = 0.69 ✅ Still increases
const economicStability = ((economicStage + 2.0) / 6.0 + wealthDist) / 2.0;
```

---

## Validation

### Test Cases
1. **Month 0 initialization**: economicStability > 0.25 (max threshold)
2. **True collapse scenario**: economicStability < 0.15 (min threshold) when GDP crashes
3. **Monte Carlo N=10**: NOT 100% dystopia (expect variance in outcomes)

### Expected Outcome Distribution
After fix:
- **5-15% utopia**: Positive pathways viable
- **30-50% sustainable**: Technologies + governance succeed
- **30-50% dystopia**: Crises overwhelm response
- **5-15% collapse**: Cascading failures

Current (broken): **100% dystopia** ❌

---

## Related Issues

- **BUG:** Distance to thresholds reporting (may be correct, just showing collapsed state)
- **BUG:** Environmental Month 1 bifurcation claim (may be conflated with economic Month 0 collapse)

After fixing economic threshold, re-run Monte Carlo to verify:
1. No Month 0 regime shifts
2. Outcome variance restored
3. Distance metrics show realistic buffer capacity

---

## Research Justification

**2025 Economic Baseline (NOT COLLAPSED):**
- Global GDP: $114T (World Bank 2025)
- Unemployment: 5-6% (ILO 2025, normal levels)
- Gini coefficient: 0.62 (high inequality, but functional)
- Financial system: Operating normally

**Economic Collapse Definition:**
- Great Depression: 25% unemployment, 30% GDP drop
- 2008 Crisis: 10% unemployment, 5% GDP drop (severe but not collapse)
- Actual collapse: >40% unemployment, >50% GDP drop, currency failure

**Conclusion:** 2025 baseline should initialize WELL ABOVE collapse threshold (margin: 0.10-0.15), not AT OR BELOW it.

---

## Next Steps

1. ✅ **Identify root cause** - DONE (economic threshold at Month 0)
2. ⏳ **Apply SHORT-TERM FIX** - Implement baseline offset
3. ⏳ **Validate fix** - Run Monte Carlo N=10, verify outcome variance
4. ⏳ **Long-term refactor** - Replace with distress metrics (TIER 2 cleanup)
5. ⏳ **Documentation** - Update bifurcation system docs with correct formula

---

**Author:** Roy (Simulation Maintainer)
**Date:** Nov 28, 2025
**Status:** Root cause identified, fix ready for implementation
