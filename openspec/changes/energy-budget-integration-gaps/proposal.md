# Energy Budget Integration Gaps

**Created:** December 9, 2025
**Author:** Architecture Skeptic (via autonomous worker)
**Priority:** HIGH
**Effort:** 2-3 days

---

## Rationale

Architecture integration review (Dec 9, 2025) identified two HIGH priority issues with the Energy Budget Constraints implementation:

**H-1: System Underutilization** - Only ClimateDeploymentPhase uses the new `energyBudget.allocations` system. Other energy-intensive systems (Novel Entities cleanup, AI Infrastructure) still use legacy `resourceEconomy.energy.renewableSurplus`, creating inconsistent energy modeling.

**H-2: Duplicate Energy Calculation** - ClimateDeploymentPhase runs BOTH legacy energy partitioning (lines 125-164) AND the new EnergyBudgetPhase checks (lines 412-450). This creates performance overhead and code complexity.

---

## Scope

1. **Migrate energy-consuming systems to EnergyBudgetPhase:**
   - `src/simulation/utils/energyConstrainedCleanup.ts` (Novel Entities)
   - `src/simulation/aiInfrastructureResources.ts`
   - `src/simulation/techTree/effectsEngine.ts`

2. **Remove or deprecate legacy energy partitioning:**
   - `ClimateDeploymentPhase.calculateRenewableSurplus()` (lines 125-164)
   - `ClimateDeploymentPhase.partitionEnergy()` (lines 177-218)
   - OR: Keep as fallback with config flag and clear documentation

3. **Add energy budget integration to radiation system:**
   - `determineMedicalCareLevel()` should check energy availability
   - Nuclear winter scenarios need energy-constrained medical response

---

## Success Criteria

1. **Consistency:** All energy-consuming systems use same allocation mechanism
2. **Performance:** Remove duplicate calculations in ClimateDeploymentPhase
3. **Documentation:** Clear migration path for legacy → new system
4. **Testing:** Monte Carlo N≥10 validates energy constraints work correctly across all systems

---

## Sources

- `reviews/architecture_integration_review_20251209.md` (H-1, H-2)
- Energy Budget Constraints implementation (5875451b)
