# M-1: Dual Energy Constraint Systems Consolidation

**Created:** 2025-12-10
**Priority:** MEDIUM
**Effort:** Small (1-2 hours)
**Impact:** LOW (both systems functional, minor integration gap)
**Proposed by:** Architecture Integration Review (Dec 10, 2025)

---

## Problem Statement

Two parallel energy constraint systems exist without cross-communication:

1. **PowerGeneration constraints** (`powerGeneration.ts:590-656`):
   - Tracks `energyConstraintActive`, `constraintSeverity`, `monthsConstrained`
   - Uses `dataCenterPower / totalElectricityGeneration` ratio (20% soft, 30% hard thresholds)
   - Applied via `getEnergyConstraintMultiplier()` to AI capability growth and crypto mining

2. **EnergyBudget allocations** (`EnergyBudgetPhase.ts:113-190`):
   - Tracks per-tech `effectivenessMultiplier` based on allocation vs demand
   - Uses 4-tier priority allocation (essential > high > climate > elective)
   - Applied via `state.energyBudget.allocations[category].effectivenessMultiplier`

**Integration Gap:**
- PowerGenerationSystem doesn't read from `state.energyBudget`
- EnergyBudgetPhase doesn't read from `state.powerGenerationSystem`
- Both calculate their own utilization metrics independently

**Impact:** Currently both systems reach similar conclusions through different paths. If one system is constrained but the other isn't, downstream consumers will get inconsistent signals.

**Usage:**
- `research.ts` uses `getEnergyConstraintMultiplier()` (powerGeneration)
- `ClimateDeploymentPhase` uses `energyBudget.allocations` (EnergyBudgetPhase)

---

## Proposed Solution

**Option 1: Consolidate to Single Source of Truth (RECOMMENDED)**

Make EnergyBudgetPhase the single source of truth, deprecate powerGeneration constraints:

1. Move `getEnergyConstraintMultiplier()` logic into EnergyBudgetPhase
2. Add a global constraint level to `state.energyBudget` based on total utilization
3. Update `research.ts` to read from `state.energyBudget.globalConstraint.multiplier`
4. Deprecate `PowerGenerationSystem.energyConstraintActive` and related fields

**Benefits:**
- Single source of truth for all energy constraints
- More granular (per-tech) constraints available for all consumers
- Simpler mental model
- Better integration with priority allocation system

**Tradeoffs:**
- Requires updating consumers of `getEnergyConstraintMultiplier()`
- PowerGenerationSystem loses some autonomy

---

**Option 2: Cross-Link Systems**

Have EnergyBudgetPhase read from powerGenerationSystem for global utilization context:

1. Keep both systems as-is
2. Add cross-reference: EnergyBudgetPhase reads `state.powerGenerationSystem.constraintSeverity`
3. Use global constraint as additional multiplier on per-tech allocations
4. Document the two-tier constraint model (global + per-tech)

**Benefits:**
- Preserves existing behavior
- Minimal code changes
- Both systems remain independent

**Tradeoffs:**
- Maintains dual ownership
- More complex mental model
- Potential for future divergence

---

## Recommendation

**Option 1 (Consolidate)** is recommended because:
- Aligns with "single source of truth" principle
- EnergyBudgetPhase is more recent and comprehensive
- Reduces long-term maintenance burden
- More flexible (priority-based allocation > simple threshold)

---

## Implementation Tasks

See `tasks.md` for detailed implementation steps.

---

## Research Validation

**Not required** - This is an architecture cleanup, not a new mechanic.

Both existing systems are research-backed:
- PowerGeneration thresholds: 20-30% data center utilization (historical 2024 data)
- EnergyBudget priorities: Priority allocation framework (economics literature)

The consolidation maintains research validity while improving code organization.

---

## Quality Gates

**Quality Gate 1 (Research Validation):** SKIP (architecture cleanup)
**Quality Gate 2 (Architecture Review):** REQUIRED after implementation

---

## Success Criteria

1. Single source of truth for energy constraints
2. All consumers (research.ts, ClimateDeploymentPhase) use unified system
3. Monte Carlo validation (N≥10) shows deterministic behavior
4. No regression in constraint behavior (old vs new should be equivalent)
5. Architecture review passes (Grade B+ or higher)

---

## Related Work

- Architecture Integration Review (Dec 10, 2025) - Identified issue
- H-1: Energy Budget Integration (Dec 9-10, 2025) - Created EnergyBudgetPhase
- H-2: Duplicate Energy Calculation (Dec 10, 2025) - Cleaned up ClimateDeploymentPhase
