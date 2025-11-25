# GDP-Adaptive Spending Implementation

**Date:** November 25, 2025
**Implementer:** Roy (Simulation Maintainer)
**Context:** Phase 3 governance scenarios crashed (60/60 runs) due to fixed spending exceeding 50% GDP limit as economy collapsed

---

## Problem Statement

Phase 3 governance scenario Monte Carlo runs (sequenced deployment, N=60) experienced 100% crash rate at months 149-223 due to:

1. **Fixed spending amounts** ($50-200B/month) became physically impossible as GDP collapsed
2. **GDP collapse trajectory:** $114T → $1.2T (98.9% decline) over ~200 months
3. **Validation failure:** Research spending $50B/month > 50% of $1.2T annual GDP

**Source:** `reviews/governance_scenario_sequenced_analysis_20251125.md` (Priya's analysis)

**Critical quotes:**
```
At crash (month ~208):
- GDP: $1.2T/year
- Research spending: $50B/month
- That's $600B/year spending vs $1.2T GDP = 50% (hits validation limit exactly)
```

## Solution: GDP-Adaptive Rate Fields

Added **GDP-adaptive rate alternatives** to scenario government priorities:

### Interface Changes

**File:** `src/types/scenarios.ts`

```typescript
export interface ScenarioGovernmentPriorities {
  // === RESEARCH INVESTMENT ===
  /** Research investment (billions/month) - ABSOLUTE amount */
  researchInvestment?: number;

  /** Research investment (fraction of annual GDP) - GDP-ADAPTIVE rate
   * Example: 0.01 = 1% of annual GDP = ~$95B/month at $114T GDP
   * Scales automatically with GDP changes */
  researchInvestmentRate?: number;

  // === AI SAFETY BUDGET ===
  /** AI safety budget (billions/month) - ABSOLUTE amount */
  aiSafetyBudget?: number;

  /** AI safety budget (fraction of annual GDP) - GDP-ADAPTIVE rate
   * Example: 0.005 = 0.5% of annual GDP = ~$47.5B/month at $114T GDP
   * Scales automatically with GDP changes */
  aiSafetyBudgetRate?: number;

  // (climateSpending and redistributionRate already were GDP fractions)
}
```

**Design principle:** Use EITHER absolute OR rate, not both (enforced by validation).

### Phase Logic Changes

**File:** `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts`

**Validation (lines 127-225, 299-392):**
- Check for conflicting specifications (both absolute AND rate)
- Convert rates to absolute values: `(GDP_trillions × 1000 × rate) / 12`
- Validate both absolute and rate modes respect physical limits
- Fail loudly if physically impossible

**Application (lines 450-481, 605-636):**
- Calculate absolute spending from rate each month (GDP-adaptive)
- Apply to government budget fields
- Log with clear display mode: `"0.50% GDP/year = $48.3B/month"`

**Calculation formula:**
```typescript
const gdpInBillions = gdp * 1000; // Convert trillions to billions
const monthlySpending = (gdpInBillions * rate) / 12; // Annual rate → monthly
```

### Scenario Updates

**All 11 Phase 2-3 scenarios converted to GDP-adaptive rates:**

| Scenario | Old (Absolute) | New (Rate) | Equivalent at $114T |
|----------|---------------|------------|---------------------|
| climate-first | $50B/mo | 0.5% GDP/yr | ~$47.5B/mo |
| equality-first | $50B/mo | 0.5% GDP/yr | ~$47.5B/mo |
| ai-alignment-first | $100B/mo (AI) | 1.0% GDP/yr | ~$95B/mo |
| democratic-participation | $50B/mo | 0.5% GDP/yr | ~$47.5B/mo |
| scientific-acceleration | $200B/mo | 2.0% GDP/yr | ~$190B/mo |
| authoritarian-efficiency | $50B/mo | 0.5% GDP/yr | ~$47.5B/mo |
| green-new-deal | $100B/mo | 1.0% GDP/yr | ~$95B/mo |
| techno-optimist | $50B/mo | 0.5% GDP/yr | ~$47.5B/mo |
| degrowth | $10B/mo | 0.1% GDP/yr | ~$9.5B/mo |
| authoritarian-climate | $50B/mo | 0.5% GDP/yr | ~$47.5B/mo |
| nordic-social-democracy | $150B/mo | 1.5% GDP/yr | ~$142B/mo |

**NOTE:** `climateSpending` and `redistributionRate` were ALREADY GDP fractions (no change needed).

---

## Validation Results

**Script:** `scripts/validateGDPAdaptiveSpending.ts`

### Test 1: Rate-Based Scaling
```
Initial GDP: $115.9T
  Initial research: $48.3B/month (rate: 0.5% GDP/year)

Collapsed GDP: $21.4T (18.4% of initial)
  Collapsed research: $8.9B/month (18.4% of initial)

GDP ratio: 18.4%
Budget ratio: 18.4%
Difference: 0.00% ✅ PASS
```

**Result:** Spending scales EXACTLY with GDP changes.

### Test 2: GDP-Collapse Safety
```
Collapsed GDP: $1.4T (scientific-acceleration scenario)
  Research rate: 2.0% GDP/year
  Research spending: $2.4B/month
  Max allowed (50% GDP/year): $59.4B/month

Within limits: ✅ PASS
✅ No crash at severe GDP collapse
```

**Result:** Previously-crashing scenario now survives GDP collapse.

### Test 3: AI Safety Budget Rate
```
GDP: $115.9T
  AI safety rate: 1.0% GDP/year
  AI safety level: 96.6 ($96.6B/month equiv)
  Expected: 96.6B/month

Match: ✅ PASS
```

**Result:** AI safety budget rates work correctly.

### Test 4: Reject Both Absolute AND Rate
```
Error thrown: ✅
Correct message: ✅ PASS (Cannot specify BOTH researchInvestment AND researchInvestmentRate)
```

**Result:** Conflicting specifications rejected with clear error.

---

## Technical Details

### Defensive Coding Patterns

**All calculations use assertion utilities:**
```typescript
const gdp = assertFinite(getGDPProxy(state), {
  location: 'validateScenarioOverrides',
  valueName: 'gdp',
  month: state.currentMonth
});

assertProbability(rate, {
  location: 'validateScenarioOverrides',
  valueName: 'researchInvestmentRate',
  month: state.currentMonth
});
```

**No silent fallbacks:**
- Fails loudly if GDP is NaN/Infinity
- Fails loudly if rate is outside [0, 1]
- Fails loudly if spending exceeds physical limits
- Provides full context in error messages

### Deterministic RNG

All tests use deterministic RNG:
```typescript
const rng = () => 0.5; // Deterministic for reproducibility
const state = createDefaultInitialState(rng);
```

**CRITICAL-3 compliance:** RNG is REQUIRED (never optional with Math.random fallback).

### Emoji Conventions

**Logging uses canonical emojis:**
- `🎯` - Scenario priority overrides
- `⚠️` - Warnings (unrealistic but possible values)
- `❌` - Errors (physically impossible values)
- `✅` - Success

---

## Files Modified

### Core Implementation
1. **`src/types/scenarios.ts`** (lines 69-108)
   - Added `researchInvestmentRate?: number`
   - Added `aiSafetyBudgetRate?: number`
   - Documentation with examples

2. **`src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts`** (lines 127-636)
   - Validation for both absolute and rate modes
   - Application logic calculates monthly spending from rates
   - Clear error messages for conflicting specifications

3. **`src/types/scenarios.ts`** (SCENARIO_CATALOG, lines 398-710)
   - Converted 11 scenarios from absolute to rate
   - Updated descriptions to reflect GDP percentages

### Validation
4. **`scripts/validateGDPAdaptiveSpending.ts`** (NEW)
   - 4 test cases covering scaling, safety, AI budget, error handling
   - All tests pass

### Documentation
5. **`reviews/gdp_adaptive_spending_implementation_20251125.md`** (THIS FILE)

---

## Expected Impact

### Before (Fixed Spending)
```
Month 0: GDP $114T → Research $50B/mo (0.5% GDP/yr)
Month 208: GDP $1.2T → Research $50B/mo (50% GDP/yr) → ❌ CRASH
```

### After (GDP-Adaptive)
```
Month 0: GDP $114T → Research $50B/mo (0.5% GDP/yr)
Month 208: GDP $1.2T → Research $0.5B/mo (0.5% GDP/yr) → ✅ CONTINUES
```

**Key difference:** Spending scales down with GDP collapse, preventing validation crashes.

---

## Next Steps

**IMMEDIATE:**
1. Re-run Phase 3 governance scenarios (N=10-60) with updated definitions
2. Verify 0% crash rate from GDP-collapse
3. Check if scenarios now survive long enough for spiral activation testing

**FUTURE:**
1. Consider GDP-adaptive rates for other economic interventions
2. Monitor if adaptive spending creates new failure modes
3. Add GDP-trajectory tracking to scenario results

---

## Research Context

**Hypothesis:** Fixed government spending amounts reflect unrealistic policy rigidity. Real governments adapt spending to economic capacity.

**Historical precedent:**
- US R&D: ~3% GDP (scales with economy)
- Nordic social spending: ~30% GDP (scales with economy)
- WWII mobilization: ~40% GDP/year (but only ~3 years)

**Adaptive rates align with:**
- Economic realism (spending capacity)
- Policy flexibility (governments adjust to conditions)
- Simulation robustness (prevents impossible states)

---

## Defensive Coding Checklist

- [x] All calculations use `assertFinite`
- [x] No `??` fallback operators in calculation code
- [x] No `||` fallback operators in calculation code
- [x] Only `rng()` used for randomness (no `Math.random()`)
- [x] Emoji logging is consistent
- [x] State mutation is direct (not immutable)
- [x] Module boundaries respected (no UI imports)
- [x] Validation passed (type checking, tests)

---

**Implementation complete. Ready for Monte Carlo validation.**

*"Fixed. Added GDP-adaptive rates. Spending scales with economy now. You're welcome."*
— Roy
