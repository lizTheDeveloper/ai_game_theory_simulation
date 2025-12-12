# Dual Energy System Unification - Plan Proposal

**Created:** December 10, 2025
**Status:** PROPOSED
**Priority:** MEDIUM (M-1 from architecture review)
**Effort Estimate:** 1-2 hours (simple refactoring)

---

## Problem Statement

Architecture review identified **two parallel energy constraint systems** without cross-communication:

1. **PowerGenerationSystem** (`powerGeneration.ts:590-656`):
   - Tracks `energyConstraintActive`, `constraintSeverity`, `monthsConstrained`
   - Calculates constraints from demand vs capacity gap
   - Used by crypto mining, AI infrastructure growth

2. **EnergyBudgetPhase** (`EnergyBudgetPhase.ts:113-190`):
   - Calculates `effectivenessMultiplier` for climate tech allocations
   - Prioritizes by tier (0-4)
   - Consumed by ClimateDeploymentPhase

**Impact:** MEDIUM
- Both systems are functional
- No simulation-breaking bugs
- Minor integration gap - constraint signals not shared

---

## Proposed Solution

**Option A: Lightweight Bridge (Recommended)**
- EnergyBudgetPhase reads `powerGenerationSystem.energyConstraintActive`
- If constraint active, reduce all tier multipliers proportionally
- 30-line change, minimal disruption

**Option B: Full Unification**
- Merge both constraint systems into single phase
- Higher risk, larger refactoring
- Not worth effort for MEDIUM priority issue

**Recommendation:** Option A (lightweight bridge)

---

## Implementation Plan

**Step 1:** EnergyBudgetPhase.ts reads constraint state
```typescript
const constraint = state.powerGenerationSystem.energyConstraintActive
  ? state.powerGenerationSystem.constraintSeverity
  : 0;

// Reduce all tier multipliers during energy constraints
const constraintPenalty = 1 - (constraint * 0.3); // 30% reduction at full severity
```

**Step 2:** Update phase dependencies
- Add `PowerGenerationPhase` as dependency of `EnergyBudgetPhase`
- Ensure correct execution order

**Step 3:** Test integration
- Monte Carlo validation (N=10)
- Verify constraints propagate correctly
- Check no regression in existing behavior

---

## Research Needed

None - pure architectural refactoring.

---

## Testing Strategy

**Unit Tests:**
- Test EnergyBudgetPhase with/without active constraints
- Verify multiplier reduction logic

**Integration Tests:**
- Full simulation with energy constraints triggered
- Check climate tech effectiveness reduced appropriately

**Monte Carlo Validation:**
- N=10 runs with same seed
- Coefficient of variation < 0.01%

---

## Expected Benefits

1. **Single source of truth** for energy constraints
2. **Improved realism** - climate tech affected by energy shortages
3. **Better system coupling** - constraints propagate correctly
4. **Minimal risk** - lightweight change, existing systems untouched

---

## Effort Estimate

**Implementation:** 1 hour (30 lines of code)
**Testing:** 30 minutes (unit + integration tests)
**Monte Carlo validation:** 30 minutes (N=10 background run)

**Total:** 1-2 hours

---

## Priority Justification

**Why MEDIUM (not LOW):**
- Identified in architecture review (systematic audit)
- Affects system coupling (integration quality)
- Quick fix (high value/effort ratio)

**Why not HIGH:**
- Both systems functional independently
- No simulation-breaking bugs
- Can defer if research updates higher priority

---

## Related Work

- Architecture Integration Review (Dec 10, 2025) - Grade B+
- H-1: Energy Budget Integration - COMPLETE
- H-2: Duplicate Energy Calculation - COMPLETE
- L-1: Tech category mapping cleanup - COMPLETE

---

## Next Steps

1. Review this proposal
2. Create OpenSpec change proposal if approved
3. Spawn simulation-maintainer for implementation
4. Run architecture-skeptic post-implementation review
