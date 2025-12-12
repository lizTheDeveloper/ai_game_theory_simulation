# Plan: Energy Constraint System Consolidation

**Created:** December 10, 2025 (Session 65)
**Priority:** MEDIUM (M-1 from architecture review)
**Effort Estimate:** SMALL (1-2 hours)
**Related:** reviews/architecture_integration_review_20251210.md (M-1)

---

## Problem Statement

**Current State:**
Two parallel energy constraint systems exist without cross-communication:

### System 1: PowerGenerationSystem Constraints
**Location:** `powerGeneration.ts:590-656` (calculateEnergyConstraints)
**State:** `energyConstraintActive`, `constraintSeverity`, `monthsConstrained`
**Logic:** Uses `dataCenterPower / totalElectricityGeneration` ratio
**Thresholds:** 20% soft warning, 30% hard constraint
**Applied via:** `getEnergyConstraintMultiplier()` → AI capability growth, crypto mining

### System 2: EnergyBudgetPhase Constraints
**Location:** `EnergyBudgetPhase.ts:113-190`
**State:** Per-tech `effectivenessMultiplier` in `state.energyBudget.allocations`
**Logic:** 4-tier priority allocation (essential > high > climate > elective)
**Applied via:** `state.energyBudget.allocations[category].effectivenessMultiplier` → ClimateDeploymentPhase

**Integration Gap:**
- PowerGenerationSystem doesn't read from `state.energyBudget`
- EnergyBudgetPhase doesn't read from `state.powerGenerationSystem`
- Both calculate their own utilization metrics independently
- Downstream consumers get inconsistent signals

**Impact:**
- Currently: LOW (both systems reach similar conclusions through different paths)
- Potential: If one system is constrained but the other isn't, consumers receive conflicting multipliers
- The `research.ts` file uses `getEnergyConstraintMultiplier()` (powerGeneration) while `ClimateDeploymentPhase` uses `energyBudget.allocations`

---

## Proposed Solution

**Option A: Consolidate to EnergyBudgetPhase (RECOMMENDED)**

Make EnergyBudgetPhase the single source of truth for ALL energy constraints.

**Rationale:**
- EnergyBudgetPhase is newer, more sophisticated (4-tier priority system)
- Already integrated with ClimateDeploymentPhase (H-1 complete Dec 10)
- Fine-grained per-tech control vs global multiplier
- Better research foundation (Goldman Sachs, IEA reports)

**Changes Required:**

1. **Deprecate PowerGenerationSystem constraints:**
   - Remove `calculateEnergyConstraints()` function (lines 590-656)
   - Remove state fields: `energyConstraintActive`, `constraintSeverity`, `monthsConstrained`
   - Keep `getEnergyConstraintMultiplier()` as FACADE

2. **Create facade in powerGeneration.ts:**
   ```typescript
   /**
    * Get energy constraint multiplier (FACADE to EnergyBudgetPhase)
    *
    * DEPRECATED: This function now reads from state.energyBudget for consistency.
    * Direct consumers should migrate to reading state.energyBudget.allocations.
    *
    * @param state Game state
    * @param category Energy category ('ai-compute', 'essential', 'climate', etc.)
    * @returns Constraint multiplier [0, 1]
    */
   export function getEnergyConstraintMultiplier(
     state: GameState,
     category: EnergyCategory = 'ai-compute'
   ): number {
     // Delegate to EnergyBudgetPhase single source of truth
     if (!state.energyBudget?.allocations[category]) {
       return 1.0; // Unconstrained if category not tracked
     }
     return state.energyBudget.allocations[category].effectivenessMultiplier;
   }
   ```

3. **Update consumers:**
   - `research.ts`: Change `getEnergyConstraintMultiplier()` to accept category parameter
   - Map AI research to 'ai-compute' category
   - Pass category explicitly instead of using default

4. **Remove obsolete state:**
   - Update `GameState` interface (remove constraint fields)
   - Update initialization (remove constraint initialization)
   - Update tests (remove constraint-specific tests)

**Effort:** 1-2 hours

---

## Option B: Cross-Link Systems (Alternative)

Have EnergyBudgetPhase read from powerGenerationSystem for global utilization context.

**Rationale:**
- Preserves both systems (less breaking change)
- PowerGenerationSystem provides global view (total electricity generation)
- EnergyBudgetPhase provides granular view (per-tech allocations)
- Cross-linking gives each system context from the other

**Changes Required:**

1. **Enhance EnergyBudgetPhase with global context:**
   ```typescript
   // In EnergyBudgetPhase.execute()
   const globalUtilization = state.powerGenerationSystem.dataCenterPower /
                             state.powerGenerationSystem.totalElectricityGeneration;

   // Apply global constraint on top of priority allocation
   if (globalUtilization > 0.30) {
     // Hard constraint: reduce ALL allocations proportionally
     for (const category of Object.keys(allocations)) {
       allocations[category].effectivenessMultiplier *= 0.5;
     }
   } else if (globalUtilization > 0.20) {
     // Soft constraint: reduce non-essential allocations
     for (const category of ['elective', 'climate']) {
       allocations[category].effectivenessMultiplier *= 0.8;
     }
   }
   ```

2. **Update PowerGenerationSystem to read energy budget:**
   ```typescript
   // In calculateEnergyConstraints()
   // Check if EnergyBudgetPhase already applied constraints
   if (state.energyBudget?.enabled) {
     // Defer to EnergyBudgetPhase for fine-grained control
     // PowerGenerationSystem only triggers if budget system disabled
     return;
   }
   ```

**Effort:** 1-2 hours

**Downside:** More complex system with two constraint layers. Harder to understand and debug.

---

## Recommended Approach: Option A (Consolidation)

**Why:**
1. **Simplicity:** Single source of truth reduces cognitive load
2. **Consistency:** All consumers use same constraint logic
3. **Maintainability:** One system to update when research changes
4. **Already integrated:** H-1/H-2 work established EnergyBudgetPhase as primary
5. **Research-backed:** EnergyBudgetPhase has better citations (Goldman Sachs, IEA)

**Migration Path:**
1. Create facade in powerGeneration.ts (backward compatibility)
2. Update direct consumers to read from state.energyBudget
3. Deprecate PowerGenerationSystem constraints
4. Remove obsolete state in future major version

---

## Implementation Steps

### Phase 1: Create Facade (Backward Compatibility)
1. **Add category parameter** to `getEnergyConstraintMultiplier()`
2. **Delegate to EnergyBudgetPhase** for constraint lookup
3. **Default to 'ai-compute'** for legacy callers
4. **Add deprecation comment** guiding migration

### Phase 2: Update Consumers
1. **research.ts:**
   - Pass 'ai-compute' category explicitly
   - Test AI capability growth with new constraints
2. **crypto mining:**
   - Already uses direct multiplier (no change needed)
3. **Any other consumers:**
   - Grep for `getEnergyConstraintMultiplier()` calls
   - Update to read from state.energyBudget directly

### Phase 3: Remove Obsolete Code
1. **powerGeneration.ts:**
   - Remove `calculateEnergyConstraints()` function
   - Keep facade for backward compatibility
2. **GameState interface:**
   - Mark constraint fields as deprecated (don't remove yet)
   - Remove in future major version
3. **Initialization:**
   - Stop initializing constraint fields
4. **Tests:**
   - Remove constraint-specific tests
   - Update to test via EnergyBudgetPhase

### Phase 4: Testing
1. **Unit tests:**
   - Test facade delegates correctly
   - Test category mapping
2. **Integration tests:**
   - Run simulation with AI research + climate deployment
   - Verify both use consistent constraints
3. **Monte Carlo (N≥10):**
   - Compare vs baseline (ensure no regression)
   - Check outcome distributions

### Phase 5: Documentation
1. **Update docs/wiki/README.md:**
   - Document consolidation decision
   - Link to architecture review M-1
   - Note migration path
2. **Code comments:**
   - Add JSDoc to facade explaining deprecation
   - Update EnergyBudgetPhase comments (now authoritative)

---

## Expected Outcomes

**Before (Current):**
- Two parallel constraint systems
- Inconsistent signals (research.ts vs ClimateDeploymentPhase)
- Cognitive overhead (which system is authoritative?)
- Maintenance burden (update both systems for research changes)

**After (Consolidation):**
- Single source of truth (EnergyBudgetPhase)
- Consistent constraints across all consumers
- Clear ownership (EnergyBudgetPhase owns energy allocation)
- Easier maintenance (one system to update)

**Performance:**
- Negligible impact (facade is O(1) lookup)
- Actually improves (one less constraint calculation per step)

---

## Interaction Map

**Affected Files:**
1. **powerGeneration.ts:** Add facade, remove calculateEnergyConstraints
2. **research.ts:** Update getEnergyConstraintMultiplier call
3. **GameState interface:** Mark constraint fields deprecated
4. **initialization.ts:** Stop initializing constraint fields
5. **EnergyBudgetPhase.ts:** Document as authoritative (no code change)

**Affected Systems:**
- AI capability growth (research.ts) → uses facade
- Crypto mining → uses direct multiplier (unchanged)
- Climate deployment → already uses EnergyBudgetPhase (unchanged)

---

## Failure Modes

1. **Breaking change:** Existing consumers fail
   - Mitigation: Facade provides backward compatibility
2. **Constraint logic differs:** EnergyBudgetPhase less strict than PowerGenerationSystem
   - Mitigation: Compare thresholds (20%/30% vs priority allocation), tune if needed
3. **Category mapping unclear:** Which tech maps to which category?
   - Mitigation: Use existing `mapTechToEnergyCategory()` utility (already extracted, L-1 complete)

---

## Research Citations

**Energy Infrastructure Constraints:**
- Goldman Sachs (2024): $720B grid investment needed through 2030
- IEA (2024): 134 GW data center demand by 2030
- Data Center Frontier (2025): $64B in blocked projects

**Current Implementation:**
- EnergyBudgetPhase (Phase 1 complete, H-1 Dec 10)
- PowerGenerationSystem (legacy, pre-dates energy budget)

---

## Success Criteria

1. **Single source of truth:** EnergyBudgetPhase authoritative
2. **Backward compatibility:** Facade supports existing callers
3. **Consistency:** All consumers use same constraint logic
4. **Tests pass:** Unit + integration + Monte Carlo N≥10
5. **Documentation:** Migration path clear, decision rationale documented
6. **Quality Gate 2:** Architecture review Grade B+ (no new issues)

---

## Next Steps

1. **Decision:** Approve consolidation approach (Option A recommended)
2. **Assign:** simulation-maintainer (Roy) for implementation
3. **Review:** architecture-skeptic post-implementation (verify no regressions)
4. **Validate:** priya (Monte Carlo comparison vs baseline)

---

**Status:** PROPOSED (awaiting approval for implementation)
**Priority:** MEDIUM (M-1 - both systems functional, minor integration gap)
**Estimated Effort:** 1-2 hours (small cleanup, well-scoped)
