# M-1: Implementation Tasks

**Feature:** Dual Energy Constraint Systems Consolidation
**Priority:** MEDIUM
**Effort:** 1-2 hours

---

## Phase 1: Analysis (15 minutes)

### 1.1 Document Current State
- [ ] List all consumers of `getEnergyConstraintMultiplier()`
- [ ] List all consumers of `state.energyBudget.allocations`
- [ ] Document expected behavior of each system
- [ ] Identify test coverage for both systems

### 1.2 Design Unified System
- [ ] Define new `globalConstraint` field in `state.energyBudget`
- [ ] Design calculation logic (merge PowerGeneration + EnergyBudget logic)
- [ ] Map old API to new API (compatibility layer if needed)

---

## Phase 2: Implementation (30 minutes)

### 2.1 Extend EnergyBudgetPhase
- [ ] Add `globalConstraint` calculation to EnergyBudgetPhase
- [ ] Use same thresholds as PowerGeneration (20% soft, 30% hard)
- [ ] Calculate from `totalDemand / totalCapacity` instead of `dataCenterPower / totalElectricityGeneration`
- [ ] Emit logging similar to PowerGeneration (warning/crisis messages)

### 2.2 Update Consumers
- [ ] Update `research.ts` to read from `state.energyBudget.globalConstraint.multiplier`
- [ ] Remove import of `getEnergyConstraintMultiplier` from powerGeneration
- [ ] Verify ClimateDeploymentPhase still uses per-tech allocations (no change needed)

### 2.3 Deprecate PowerGeneration Constraints
- [ ] Remove `energyConstraintActive`, `constraintSeverity`, `monthsConstrained` from PowerGenerationSystem
- [ ] Remove `calculateEnergyConstraints()` function
- [ ] Remove `getEnergyConstraintMultiplier()` export (or mark deprecated)
- [ ] Update initialization to not set deprecated fields

---

## Phase 3: Testing (30 minutes)

### 3.1 Unit Tests
- [ ] Test EnergyBudgetPhase calculates global constraint correctly
- [ ] Test threshold behavior (soft at 20%, hard at 30%)
- [ ] Test severity calculation matches PowerGeneration behavior
- [ ] Test research.ts receives correct multiplier

### 3.2 Integration Tests
- [ ] Test full simulation step with energy constraints
- [ ] Verify AI capability growth is constrained when energy scarce
- [ ] Verify climate tech deployment is constrained when energy scarce
- [ ] Check logging output is equivalent to old behavior

### 3.3 Monte Carlo Validation
- [ ] Run N≥10 simulations with same seed
- [ ] Verify deterministic behavior (CV < 0.01%)
- [ ] Check outcome distributions are equivalent to old system
- [ ] Verify no NaN/assertions triggered

---

## Phase 4: Documentation (15 minutes)

### 4.1 Code Documentation
- [ ] Add JSDoc comments to new `globalConstraint` calculation
- [ ] Document migration from PowerGeneration constraints
- [ ] Add deprecation notices to old functions

### 4.2 Wiki Updates
- [ ] Update `docs/wiki/README.md` section on energy constraints
- [ ] Document single source of truth pattern
- [ ] Add migration notes for future reference

---

## Phase 5: Quality Gate 2 (Architecture Review)

### 5.1 Submit for Review
- [ ] Request architecture-skeptic review
- [ ] Provide before/after comparison
- [ ] Document design rationale

### 5.2 Address Feedback
- [ ] Fix any CRITICAL/HIGH issues identified
- [ ] Consider MEDIUM issues
- [ ] Update implementation based on feedback

---

## Definition of Done

- [ ] Single source of truth for energy constraints established
- [ ] All consumers migrated to unified system
- [ ] PowerGeneration constraints deprecated (code removed)
- [ ] Monte Carlo validation passes (N≥10, deterministic)
- [ ] Architecture review passes (Grade B+ or higher)
- [ ] Documentation updated (code comments + wiki)
- [ ] Tests passing (unit + integration + Monte Carlo)

---

## Estimated Timeline

- **Total:** 1.5-2 hours
- **Phase 1 (Analysis):** 15 min
- **Phase 2 (Implementation):** 30 min
- **Phase 3 (Testing):** 30 min
- **Phase 4 (Documentation):** 15 min
- **Phase 5 (Review):** 15-30 min

---

## Dependencies

None - This is self-contained architecture cleanup.

---

## Rollback Plan

If issues arise:
1. Revert commit
2. Re-enable PowerGeneration constraints
3. Restore old imports in research.ts
4. Investigation needed before retry
