# Novel Entities Test Calibration Fix

**Status:** PROPOSED (Nov 30, 2025)
**Priority:** MEDIUM
**Estimated Effort:** 1-2 hours
**Rationale:** 6 test failures blocking CI, root cause identified (test setup, not implementation)

## Problem Statement

6 tests failing in `tests/integration/novel-entities-irreversibility.test.ts`:
1. should apply PFAS cleanup with energy/concentration constraints
2. should limit cleanup effectiveness when energy is scarce
3. should apply microplastic capture with concentration constraints
4. should return 99% of cleanup to atmosphere
5. should show layered strategy (prevention + cleanup) is best
6. should demonstrate effectiveness improvement (0% → 20-40%)

**Root Cause (Architecture Review Finding):**
- Production rate reduced 10× in commit (updateNovelEntitiesBoundary.ts:61)
- Tests still expect pre-reduction thresholds (>50% effectiveness)
- Tests measure cleanup WITH production running (numerator tiny, denominator huge)

## Proposed Solution

**Phase 1: Test Setup Fix** (30min)
- Disable production in cleanup effectiveness tests
- Set `state.resourceEconomy.gdpPerCapita = 0` to stop production
- OR set boundary thresholds to current-value (no new contamination)

**Phase 2: Threshold Recalibration** (30min)
- Update test assertions to match current production rates
- Change `assert.ok(change < 0.01)` to `assert.ok(change < 0.001)` where appropriate
- Document expected effectiveness ranges in test comments

**Phase 3: Validation** (30min)
- Run full novel-entities test suite
- Verify all 6 tests pass
- Run N=3 Monte Carlo to ensure no NaN regressions

## Implementation Example

**Before (WRONG):**
```typescript
it('should apply PFAS cleanup with energy/concentration constraints', () => {
  deployTechnology('pfas_remediation', 1.0);
  const initialValue = boundary.currentValue;
  updateNovelEntitiesBoundary(state, rng);  // Production still running!
  const change = boundary.currentValue - initialValue;
  assert.ok(change < 0.01);  // Threshold too strict
});
```

**After (CORRECT):**
```typescript
it('should apply PFAS cleanup with energy/concentration constraints', () => {
  deployTechnology('pfas_remediation', 1.0);

  // DISABLE PRODUCTION to isolate cleanup effectiveness
  state.resourceEconomy.gdpPerCapita = 0;

  const initialValue = boundary.currentValue;
  updateNovelEntitiesBoundary(state, rng);
  const change = boundary.currentValue - initialValue;

  // Cleanup reduces contamination (negative change)
  assert.ok(change < 0);
  // But effectiveness constrained by energy/concentration
  assert.ok(Math.abs(change) < 0.005);  // Updated threshold
});
```

## Expected Outcomes

1. **CI unblocked:** All tests pass
2. **Test accuracy:** Tests measure cleanup effectiveness in isolation
3. **Regression prevention:** Future production changes won't break tests
4. **Documentation:** Test comments explain setup rationale

## Research Foundation

Research debate finding: "Tests are wrong, not implementation."
- Implementation correctly models energy-constrained cleanup
- Tests incorrectly expect effectiveness with production running

## Success Criteria

- [ ] All 6 novel-entities tests passing
- [ ] Production disabled in cleanup tests (documented)
- [ ] Thresholds calibrated to current model
- [ ] N=3 Monte Carlo validation clean

## Dependencies

- None (standalone test fix)

## Risks

- **Overcorrection:** Might hide real bugs if thresholds too loose
- **Test specificity:** Need to validate effectiveness ranges against research

## Mitigation

- Document expected ranges in test comments
- Cross-check against research (`research/novel_entities_zero_effectiveness_20251113.md`)
- Run sensitivity analysis after fix to ensure model still behaves correctly
