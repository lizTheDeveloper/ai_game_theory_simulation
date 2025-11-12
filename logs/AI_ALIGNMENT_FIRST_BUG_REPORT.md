# ai-alignment-first Parameter Bug Report
**Date:** 2025-11-12
**Severity:** CRITICAL
**Status:** IDENTIFIED - Fix required

---

## Bug Summary

The ai-alignment-first scenario fails 100% of runs at Month 0 due to an out-of-range probability value.

**Error:**
```
governmentInvestment (probability) = 10
Valid range: [0, 1]
```

---

## Root Cause Analysis

### Parameter Flow

1. **Scenario definition** (`src/types/scenarios.ts` line 410):
   ```typescript
   governmentPriorities: {
     aiSafetyBudget: 100, // $100B/month on alignment research
   }
   ```

2. **Storage in state:**
   - `aiSafetyBudget: 100` → `state.government.alignmentResearchInvestment`

3. **Probability calculation** (`src/simulation/engine/phases/Tier2AIGovernancePhase.ts` line 105):
   ```typescript
   const governmentInvestment = state.government.alignmentResearchInvestment / 10;
   ```

4. **Validation** (line 107):
   ```typescript
   assertProbability(governmentInvestment, {...}); // FAILS: 100/10 = 10, not in [0, 1]
   ```

### The Bug

**Scale mismatch:** Budget is in billions ($100B), but probability conversion assumes value is in 0-10 range.

**Calculation:** 100 / 10 = 10 (OUT OF RANGE)
**Expected:** Probability in [0, 1] range

---

## Fix Options

### Option 1: Divide by 100 (Recommended)

**Assumption:** Budget in billions, want linear scaling to probability

```typescript
// src/simulation/engine/phases/Tier2AIGovernancePhase.ts line 105
const governmentInvestment = state.government.alignmentResearchInvestment / 100;
```

**Result:** 100 / 100 = 1.0 (valid probability, 100% investment)

**Pros:**
- Simple fix
- Maintains linear scaling ($100B → 1.0, $50B → 0.5)
- Consistent with scenario intent (max investment)

**Cons:**
- May allow values > 100 to break again
- No protection against future parameter changes

### Option 2: Clamp to [0, 1] Range (Defensive)

```typescript
// src/simulation/engine/phases/Tier2AIGovernancePhase.ts line 105
const governmentInvestment = Math.min(1.0, Math.max(0.0,
  state.government.alignmentResearchInvestment / 100
));
```

**Result:** 100 / 100 = 1.0, clamped to max 1.0

**Pros:**
- Prevents future out-of-range errors
- Self-documenting (clear max = 1.0)
- Defensive coding (fails gracefully)

**Cons:**
- Hides parameter bugs (silent clamping)
- Not fail-loudly philosophy

### Option 3: Normalize by Budget Scale Constant

```typescript
// Add to constants
const MAX_AI_SAFETY_BUDGET = 100; // $100B

// src/simulation/engine/phases/Tier2AIGovernancePhase.ts line 105
const governmentInvestment = state.government.alignmentResearchInvestment / MAX_AI_SAFETY_BUDGET;
```

**Result:** 100 / 100 = 1.0, semantically clear

**Pros:**
- Self-documenting (constant name explains scale)
- Easy to adjust if budget scale changes
- Fails loudly if budget exceeds constant

**Cons:**
- Adds dependency on constant
- More code changes

---

## Recommended Fix

**Use Option 1 (divide by 100) with assertion before division:**

```typescript
// src/simulation/engine/phases/Tier2AIGovernancePhase.ts line 105
assertInRange(state.government.alignmentResearchInvestment, 0, 100, {
  location: 'Tier2AIGovernancePhase.executeCrisisAnticipation',
  valueName: 'alignmentResearchInvestment',
  month: state.currentMonth
});

const governmentInvestment = state.government.alignmentResearchInvestment / 100;

assertProbability(governmentInvestment, {
  location: 'Tier2AIGovernancePhase.executeCrisisAnticipation',
  valueName: 'governmentInvestment',
  month: state.currentMonth
});
```

**Rationale:**
- Pre-assertion validates budget is in expected range (0-100)
- Post-assertion validates probability conversion worked correctly
- Fail-loudly at both stages (no silent bugs)
- Maintains research simulation rigor

---

## Impact Assessment

### Current Impact

- **Scenarios affected:** 1/6 (ai-alignment-first only)
- **Runs failed:** 10/10 (100% failure rate)
- **Phase 3 completion:** 5/6 scenarios (83%)
- **Phase 4 blockers:** HIGH (cannot compare alignment-focused governance)

### Post-Fix Expected Results

- **Expected outcome:** ai-alignment-first completes successfully
- **Expected spiral activation:** UNKNOWN (other scenarios showed 0%)
- **Expected population:** Likely 0.00B (extinct, like other scenarios)
- **Value:** Enables comparative analysis (does alignment focus differ from other priorities?)

---

## Testing Plan

### Pre-Fix Validation

1. **Reproduce bug:** Run ai-alignment-first single scenario (should fail at Month 0)
2. **Verify error:** Confirm governmentInvestment = 10
3. **Check scope:** Verify other scenarios unaffected

### Post-Fix Validation

1. **Unit test:** Create test case for probability conversion
2. **Single run:** Test ai-alignment-first (seed: 1000, 360 months)
3. **Expected:** No assertion failures, completes to Month 360
4. **Monte Carlo:** Re-run N=10 for ai-alignment-first
5. **Compare:** Check if outcomes differ from other governance priorities

### Regression Prevention

1. **Add unit test:**
   ```typescript
   test('Tier2AIGovernancePhase converts budget to probability correctly', () => {
     const budget = 100; // $100B
     const probability = budget / 100;
     expect(probability).toBe(1.0);
     expect(probability).toBeGreaterThanOrEqual(0);
     expect(probability).toBeLessThanOrEqual(1);
   });
   ```

2. **Add scenario validation:** Check all governmentPriorities parameters are in expected ranges before simulation starts

---

## Related Issues

### Similar Patterns in Codebase

Search for other `/10` divisions that may have same bug:

```bash
grep -rn "/ 10" src/simulation/engine/phases/
```

**Found:** Line 239 in same file (executeSafetyInfrastructure)
```typescript
const governmentInvestment = state.government.alignmentResearchInvestment / 10;
```

**Status:** SAME BUG - Needs same fix

### Other Scenarios Check

**Verify budget parameters in other scenarios:**
- climate-first: `climateActionBudget: 100` - May have similar issue elsewhere
- equality-first: `redistributionBudget: 100` - Check conversion to probability
- scientific-acceleration: `researchInvestment: 200` - Check if divided correctly

**Action:** Audit all budget→probability conversions in codebase

---

## Files Affected

**Bug locations:**
1. `src/simulation/engine/phases/Tier2AIGovernancePhase.ts` line 105
2. `src/simulation/engine/phases/Tier2AIGovernancePhase.ts` line 239 (same pattern)

**Scenario definition:**
- `src/types/scenarios.ts` line 410 (ai-alignment-first)

**Test files to create:**
- `src/simulation/engine/phases/__tests__/Tier2AIGovernancePhase.test.ts`

---

## Estimated Fix Time

- **Code fix:** 10 minutes (change 2 lines, add assertions)
- **Testing:** 30 minutes (unit test + single run validation)
- **Monte Carlo re-run:** 1-2 hours (N=10 for ai-alignment-first)
- **Total:** ~2 hours

---

## Priority Justification

**CRITICAL because:**
1. Blocks 1/6 of Phase 3 analysis (16.7% of scenarios)
2. Prevents comparative analysis of alignment-focused governance
3. Easy fix (2 line change) with high value (completes Phase 3)
4. May reveal similar bugs in other budget conversions

**Should be fixed BEFORE Phase 4** to enable complete scenario comparison.

---

## Next Steps

1. **Immediate:** Apply fix to Tier2AIGovernancePhase.ts (lines 105, 239)
2. **Validate:** Run single ai-alignment-first scenario (seed: 1000)
3. **Monte Carlo:** Re-run N=10 for ai-alignment-first
4. **Audit:** Search for similar /10 divisions in other budget→probability conversions
5. **Regression:** Add unit tests for probability conversions
6. **Document:** Update Phase 3 analysis with ai-alignment-first results

---

**Report author:** Priya (Quantitative Validator)
**Date:** 2025-11-12
**Status:** Ready for simulation-maintainer to implement fix
