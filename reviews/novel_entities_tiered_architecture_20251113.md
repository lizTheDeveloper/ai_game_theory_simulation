# Architecture Review: Novel Entities Tiered Effectiveness Model

**Date:** November 13, 2025
**Reviewer:** Architecture Skeptic (automated)
**Commit:** b6ec2b926
**File:** src/simulation/techTree/effectsEngine.ts
**Function:** `calculateNovelEntitiesRemediationEffectiveness()`

---

## Executive Summary

**VERDICT: ✅ APPROVED (with LOW priority recommendations)**

The tiered effectiveness model is architecturally sound. No CRITICAL or HIGH issues identified. Implementation is performant, maintains determinism, and integrates cleanly with existing multiplier chain pattern.

**Recommendations:** 3 LOW priority documentation improvements (non-blocking).

---

## Review Criteria

### 1. Performance Analysis ✅

**Phase Budget Impact:** Negligible
- **Before:** 1 Math.max() operation
- **After:** 3 conditionals + 5 arithmetic operations
- **Complexity:** O(1) - no loops, no recursion
- **Memory:** No allocations (primitive operations only)
- **Estimated overhead:** <0.01ms per invocation

**Verdict:** No phase budget concerns. Within 10ms average budget tolerance.

---

### 2. State Propagation ✅

**State Access Pattern:**
- **Reads:** `techTreeState.regionalDeployment['global']` (via `isTechDeployed()`)
- **Writes:** None (pure calculation)
- **Side Effects:** None

**Determinism:**
- No RNG in this section (RNG only used downstream in other multipliers)
- Same inputs → same outputs (guaranteed)

**Verdict:** Clean read-only pattern. No state propagation issues.

---

### 3. Code Complexity ✅

**Cyclomatic Complexity:**
- **Before:** 2 (single if-else)
- **After:** 4 (3-tier conditional)
- **Increase:** +2 (acceptable for 3-tier model)

**Lines of Code:**
- **Before:** ~20 lines
- **After:** ~60 lines (~40 lines are comments/documentation)
- **Actual logic:** ~20 lines

**Maintainability:**
- Clear tier boundaries (0.2, 0.6)
- Linear interpolation formula transparent
- Research citations in comments

**Verdict:** Complexity increase justified by research requirements. Well-documented.

---

### 4. Defensive Programming ✅

**Existing Protections:**
- ✅ `assertFinite()` validates final result (no NaN/Infinity)
- ✅ Hard 30% ceiling (`Math.min(0.30, ...)`)
- ✅ RNG validation at function entry (lines 127-129)

**Potential Gap (LOW priority):**
- Regulatory strength not validated to be in [0, 1]
- Current implementation: Sum of 3 booleans × weights = always in [0, 1.0]
- **Risk:** LOW (math guarantees bounds)
- **Recommendation:** Add assertion for defensive programming consistency

```typescript
const regulatoryStrength = assertInRange(
  (pfasBanDeployed ? 0.5 : 0.0) +
  (plasticPhaseoutDeployed ? 0.3 : 0.0) +
  (substitutionDeployed ? 0.2 : 0.0),
  0.0, 1.0,
  { location: 'calculateNovelEntitiesRemediationEffectiveness:regulatoryStrength', ... }
);
```

**Verdict:** Adequate defensive checks. Optional assertion recommended.

---

### 5. Research Justification ⚠️

**Research Citations:**
- ✅ Ling 2024 (cleanup costs)
- ✅ Cousins 2022 (30% ceiling)
- ✅ Singh 2024 (2-5% tech-only)
- ✅ Research-skeptic Grade B- review cited

**Undocumented Assumptions (LOW priority):**

1. **Tier boundaries (0.2, 0.6):**
   - Not from papers (DERIVED values)
   - Likely expert judgment
   - **Recommendation:** Add code comment explaining rationale

2. **Weighting scheme (50%/30%/20%):**
   - PFAS ban: 50% weight
   - Plastic phaseout: 30% weight
   - Substitution: 20% weight
   - **Source:** Not cited (likely expert judgment)
   - **Recommendation:** Document rationale in code comment

3. **Linear interpolation:**
   - Papers don't specify interpolation function
   - Could be step function, S-curve, exponential
   - **Chosen:** Linear (simplest defensible choice)
   - **Recommendation:** Add comment acknowledging assumption

**Example documentation improvement:**
```typescript
// Tier boundaries (0.2, 0.6): DERIVED from research findings
// - Below 20%: Minimal regulation = tech-only tier
// - 20-60%: Partial regulation = mixed tier
// - Above 60%: Strong regulation = full prevention tier
// Rationale: Matches qualitative categories in Ling 2024, Cousins 2022

// Weighting: PFAS 50%, Plastic 30%, Substitution 20% (expert judgment)
// Rationale: PFAS addresses flow (highest impact), plastic addresses stock,
// substitution enables alternatives (lowest direct impact)
```

**Verdict:** Research-backed, but assumptions should be documented for future maintainability.

---

## Issue Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 0 | None |
| HIGH | 0 | None |
| MEDIUM | 0 | None |
| **LOW** | **3** | Documentation gaps (non-blocking) |

**LOW Priority Recommendations:**

1. **Add regulatory strength assertion** (defensive programming consistency)
   - Location: Line 141-145
   - Impact: Code quality improvement
   - Blocking: No

2. **Document tier boundary rationale** (0.2, 0.6)
   - Location: Lines 147-150
   - Impact: Future maintainability
   - Blocking: No

3. **Document weighting scheme rationale** (50%/30%/20%)
   - Location: Lines 139-145
   - Impact: Future maintainability
   - Blocking: No

---

## Gate 2 Decision

**✅ APPROVED FOR MONTE CARLO VALIDATION (Gate 3)**

**Justification:**
- Zero CRITICAL/HIGH issues
- Performance impact negligible
- State propagation clean
- Determinism maintained
- Research-backed implementation

**Next Steps:**
1. Proceed to Monte Carlo validation (Gate 3)
2. Verify 2-30% effectiveness range in N=10 runs
3. Address LOW priority documentation improvements (optional, non-blocking)

---

**Reviewer:** architecture-skeptic (automated review)
**Review Methodology:** Performance analysis, state propagation check, complexity audit, defensive programming assessment, research citation verification
**Confidence:** HIGH (straightforward calculation, no architectural complexity)
