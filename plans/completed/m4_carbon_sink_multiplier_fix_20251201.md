# M-4: Fix carbonSinkMultiplier Runtime Overwrite

**Date Created:** December 1, 2025
**Priority:** MEDIUM (blocks M-3 parameter sweep execution)
**Assignee:** simulation-maintainer (Roy)
**Effort Estimate:** 1-2 hours
**Status:** PLANNED

---

## Problem Statement

The M-3 parameter injection system sets `carbonSinkMultiplier` at initialization, but `planetaryBoundaries.ts` recalculates it every simulation step, overwriting the injected value. This defeats the purpose of parameter sweep sensitivity analysis for this variable.

**Discovered By:** architecture-skeptic (Session 24 Architecture Integration Review)
**Severity:** MEDIUM - Does not break simulation, but renders parameter sweep ineffective for this variable
**Blocker:** Blocks M-3 parameter sweep execution and Sobol sensitivity analysis

---

## Current Behavior

**Initialization (src/simulation/initialization.ts:1788-1790):**
```typescript
if (parameterSweepConfig.carbonSinkMultiplier !== undefined) {
  state.planetaryBoundariesSystem.landUse.carbonSinkLossMultiplier = parameterSweepConfig.carbonSinkMultiplier;
  console.log(`  carbonSinkLossMultiplier: ${parameterSweepConfig.carbonSinkMultiplier.toFixed(3)}`);
}
```

**Runtime Overwrite (src/simulation/planetaryBoundaries.ts:1638):**
```typescript
// This runs EVERY step and overwrites the injected value
landUse.carbonSinkLossMultiplier = 1.0 + Math.max(0, weightedDeficit * 2.0);
```

**Result:** The parameter sweep will show ZERO variance for `carbonSinkMultiplier` because the value is reset to a calculated value every step.

---

## Root Cause Analysis

The current implementation has **two competing mental models**:

1. **Static configuration:** Parameter injection treats `carbonSinkLossMultiplier` as a tunable constant
2. **Dynamic calculation:** Planetary boundaries phase calculates it from habitat loss every step

These models are incompatible. The runtime calculation assumes `carbonSinkLossMultiplier` represents current deforestation feedback (1.0 = no loss, higher = more carbon sink loss from deforestation).

---

## Solution Design

**Option 1: Use injected value as base multiplier (RECOMMENDED)**

Modify `planetaryBoundaries.ts:1638` to treat injected value as the baseline sensitivity:

```typescript
// Before (overwrites injected value):
landUse.carbonSinkLossMultiplier = 1.0 + Math.max(0, weightedDeficit * 2.0);

// After (preserves injected value as base):
const baseMultiplier = state.simulationConfig?.carbonSinkMultiplier ?? 1.0;
const deforestationFeedback = Math.max(0, weightedDeficit * 2.0);
landUse.carbonSinkLossMultiplier = baseMultiplier * (1.0 + deforestationFeedback);
```

**Rationale:**
- Preserves dynamic behavior (deforestation still affects carbon sinks)
- Allows parameter sweep to test sensitivity (higher base = stronger feedback)
- Minimal code change (1 line → 3 lines)
- Semantically correct (base sensitivity × dynamic feedback)

**Option 2: Conditional calculation (skip if injected)**

Only calculate if not injected:

```typescript
if (state.simulationConfig?.carbonSinkMultiplier === undefined) {
  landUse.carbonSinkLossMultiplier = 1.0 + Math.max(0, weightedDeficit * 2.0);
}
```

**Rationale:**
- Simpler change
- Preserves exact injected value
- **Downside:** Disables dynamic deforestation feedback during parameter sweeps (BAD)

**Recommendation:** Use Option 1 - preserves both parameter sweep AND dynamic behavior.

---

## Implementation Steps

1. **Modify planetaryBoundaries.ts (lines 1635-1642):**
   - Extract base multiplier from `simulationConfig` (default 1.0 if not injected)
   - Change formula to multiply base × dynamic feedback
   - Update climate acceleration calculation accordingly
   - Add assertion to ensure base multiplier is positive

2. **Update parameter sweep test:**
   - Run N=3 pilot with three carbonSinkMultiplier values (0.5, 1.0, 1.5)
   - Verify output files show variance in carbon sink losses
   - Verify deforestation feedback still operates correctly

3. **Update documentation:**
   - Add comment explaining base multiplier × dynamic feedback model
   - Update M-3 parameter description to clarify semantics

---

## Testing Strategy

**Unit Test:**
- Mock state with different `carbonSinkMultiplier` values (0.5, 1.0, 1.5)
- Run planetary boundaries phase with fixed habitat loss
- Assert `carbonSinkLossMultiplier` reflects both base and dynamic components

**Integration Test:**
- Run 3-run parameter sweep with carbonSinkMultiplier variation
- Parse output files and extract final carbon sink loss values
- Assert variance exists (CV > 1% across runs)

**Regression Test:**
- Run full determinism test (N=3, same seed)
- Assert CV < 0.01% (determinism preserved)

---

## Success Criteria

1. ✅ `carbonSinkMultiplier` injection preserved during simulation
2. ✅ Dynamic deforestation feedback still operates
3. ✅ Parameter sweep shows variance for this parameter
4. ✅ All existing tests pass
5. ✅ Type checking clean (no new errors)
6. ✅ Determinism maintained (CV < 0.01%)

---

## Risks & Mitigations

**Risk 1: Breaking existing calibration**
- **Likelihood:** Medium
- **Impact:** High (carbon cycle validation)
- **Mitigation:** Run hindcast validation after fix (N=3 mini sweep)

**Risk 2: Non-determinism from floating point**
- **Likelihood:** Low (simple multiplication)
- **Impact:** Critical (breaks Monte Carlo)
- **Mitigation:** Determinism stress test (N=100, same seed)

**Risk 3: Semantic confusion (what does the parameter mean?)**
- **Likelihood:** Medium
- **Impact:** Low (documentation fixes it)
- **Mitigation:** Add clear comments + update parameter description

---

## Related Work

- **M-3:** Parameter injection infrastructure (complete, Session 23)
- **HIGH-6:** Parameter sweep methodology (validated, Session 18)
- **Architecture Review Session 24:** Identified this issue (Grade A-)
- **Research Debate Session 24:** Flagged as CRITICAL FIX REQUIRED

---

## Files to Modify

1. `src/simulation/planetaryBoundaries.ts` - Fix runtime calculation (3 lines)
2. `scripts/parameterSweepPilot.ts` - Add validation test (optional)
3. `src/simulation/initialization.ts` - Update comment (optional)

---

## Estimated Timeline

- **Investigation:** 15 minutes (already complete)
- **Implementation:** 30 minutes (code change + comments)
- **Testing:** 45 minutes (unit test + 3-run pilot sweep)
- **Total:** 1-2 hours

---

## Dependencies

**Blocked By:** None (all information available)
**Blocks:**
- M-3 parameter sweep execution (N=200 full sweep)
- Sobol sensitivity analysis
- 90% confidence interval report

---

## Notes

- This is NOT a bug in current simulation (runs fine with hardcoded values)
- This IS a blocker for parameter sweep (defeats sensitivity analysis)
- Fix is straightforward (multiplicative composition of base × dynamic)
- No research needed (implementation detail, not mechanism)

---

## Archive Criteria

Mark complete when:
1. Fix implemented and committed
2. Tests passing (unit + integration + determinism)
3. Parameter sweep pilot shows variance (N=3)
4. Roadmap updated (M-4 → completed)
