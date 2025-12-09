# Architecture Integration Review - December 9, 2025

**Reviewer:** Architecture Skeptic (AI Agent)
**Focus Period:** December 5-9, 2025 (7 days of commits)
**Scope:** Energy Budget Constraints, Radiation Modeling, Cross-System Integration

## Executive Summary

This review examines recent major feature merges for architectural soundness, state propagation issues, and integration concerns. The Energy Budget Constraints system (2,218 lines) is well-implemented with proper defensive coding. However, several integration gaps and one potential performance concern are identified.

**Overall Assessment:** MEDIUM risk. The new systems are well-isolated but underutilized. No critical stability issues found.

---

## CRITICAL ISSUES

**None identified.**

The recent merges follow project defensive coding standards (assertion utilities, fail-loudly patterns, no silent fallbacks). No immediate stability risks detected.

---

## HIGH PRIORITY

### H-1: Energy Budget System Underutilization (Integration Gap)

**Location:**
- `src/simulation/engine/phases/EnergyBudgetPhase.ts`
- `src/simulation/utils/energyConstrainedCleanup.ts`
- `src/simulation/novelEntities.ts`

**Problem:** The new Energy Budget Constraints system calculates energy allocations and effectiveness multipliers, but only ClimateDeploymentPhase consumes them. Other energy-intensive systems do NOT check the energy budget:

1. **Novel Entities cleanup** (`src/simulation/utils/energyConstrainedCleanup.ts`) - Uses `resourceEconomy.energy.renewableCapacity` instead of `energyBudget.allocations`
2. **AI Infrastructure Resources** (`src/simulation/aiInfrastructureResources.ts`) - Not integrated
3. **Tech Effects Engine** (`src/simulation/techTree/effectsEngine.ts`) - Not integrated

**Impact:** Two parallel energy constraint systems exist:
- OLD: `resourceEconomy.energy.renewableSurplus` (used by cleanup utilities)
- NEW: `energyBudget.allocations[category].effectivenessMultiplier` (used only by ClimateDeploymentPhase)

This creates inconsistent energy modeling - climate tech is constrained by one system, cleanup tech by another.

**Severity:** HIGH - Model inconsistency, not instability
**Recommendation:** Either:
1. Migrate all energy-consuming systems to use `energyBudget.allocations`, OR
2. Have EnergyBudgetPhase write its results BACK to `resourceEconomy.energy` for backward compatibility
**Effort:** MEDIUM (2-3 day refactor)

---

### H-2: Duplicate Energy Calculation in ClimateDeploymentPhase

**Location:** `src/simulation/engine/phases/ClimateDeploymentPhase.ts` lines 125-164, 412-450

**Problem:** ClimateDeploymentPhase has TWO energy allocation systems:

1. **Legacy system** (lines 125-164): `calculateRenewableSurplus()` + `partitionEnergy()` - allocates from `resourceEconomy.energy`
2. **New system** (lines 412-450): `getEnergyMultiplier()` checks `state.energyBudget.allocations`

The phase runs BOTH systems every tick. Lines 414-430 check for new system first, then fall back to legacy (lines 433-450). This is correct behavior but wasteful.

**Impact:** Performance overhead (runs both systems), code complexity
**Severity:** HIGH (architectural debt, not instability)
**Recommendation:** Remove legacy energy allocation in ClimateDeploymentPhase now that EnergyBudgetPhase handles it (order 12.75 runs before 12.8)
**Effort:** SMALL (1-2 hours)

---

## MEDIUM PRIORITY

### M-1: Phase Order Dependency Not Enforced

**Location:** `src/simulation/engine/phases/EnergyBudgetPhase.ts` line 116

**Problem:** EnergyBudgetPhase declares `dependencies = ['tech-tree']` but:
1. It reads from `state.techTreeState.deployedTechMap` which is populated by TechTreePhase (12.5)
2. It does NOT declare dependency on MeaningRenaissancePhase (12.7) despite running at 12.75

The dependency system only enforces declared dependencies. If phase ordering changes, EnergyBudgetPhase could silently run before MeaningRenaissancePhase updates tech-related state.

**Impact:** Future maintenance risk
**Severity:** MEDIUM
**Recommendation:** Add comment documenting implicit ordering requirement, or add MeaningRenaissancePhase to dependencies array
**Effort:** TRIVIAL

---

### M-2: Radiation System Missing Energy Budget Integration

**Location:** `src/simulation/radiationModeling.ts`, `src/simulation/engine/phases/RadiationSystemPhase.ts`

**Problem:** The enhanced radiation modeling system (M-6) does not integrate with energy budget constraints. In a nuclear winter scenario:
1. Energy infrastructure would be heavily damaged
2. Medical care levels depend on healthcare infrastructure, which depends on energy
3. `determineMedicalCareLevel()` checks `nuclearWinterState.active` but not energy availability

**Impact:** Model realism gap - nuclear war scenarios should show energy-constrained medical response
**Severity:** MEDIUM (realism, not stability)
**Recommendation:** Have RadiationSystemPhase check energy budget surplus before determining medical care level
**Effort:** SMALL

---

### M-3: Threshold Uncertainty Reverted (Dec 7)

**Location:** `src/simulation/tippingPoints.ts` (commit 5eb4b5bd)

**Problem:** Threshold uncertainty sampling code was REMOVED for "backward compatibility". The commit message says:
> "Fix: Remove threshold uncertainty sampling code for backward compatibility"

This suggests a regression or breaking change that forced code removal rather than proper migration.

**Impact:** Reduced model fidelity (uncertainty not propagated)
**Severity:** MEDIUM
**Recommendation:** Investigate why uncertainty code was incompatible and re-add properly
**Effort:** UNKNOWN (needs investigation)

---

### M-4: O(n) Find in ClimateDeploymentPhase Per-Tech Loop

**Location:** `src/simulation/engine/phases/ClimateDeploymentPhase.ts` line 550

**Problem:**
```typescript
const deployment = globalDeployments.find(d => d.techId === techId);
```

This is called inside `updateTechDeploymentLevel()` for each climate tech. While the comment at line 549 says "No index - domain-specific search", this could be O(n*m) where n = climate techs, m = global deployments.

**Current scale:** 10 climate techs, ~100 deployments = 1000 iterations/tick (acceptable)
**Future risk:** If deployments grow to 1000+, this becomes noticeable

**Impact:** Future performance risk
**Severity:** MEDIUM (not immediate)
**Recommendation:** Consider adding `deployedTechMap` index lookup (already used at line 570)
**Effort:** SMALL

---

## LOW PRIORITY

### L-1: EnergyBudgetPhase Filter Operations

**Location:** `src/simulation/engine/phases/EnergyBudgetPhase.ts` lines 178, 303

**Problem:** Two `.filter()` operations per tick:
1. Line 178: `filter(([_, alloc]) => alloc.allocatedTWh < alloc.demandTWh)` - O(n) where n = allocations
2. Line 303: `filter(([_, d]) => d.priorityTier === tier)` - O(n*4) for 4 priority tiers

**Current scale:** ~10 tech categories (negligible)
**Impact:** None currently
**Severity:** LOW
**Recommendation:** No action needed unless tech categories grow significantly
**Effort:** N/A

---

### L-2: Hardcoded Energy Values Without Uncertainty

**Location:** `src/simulation/engine/phases/EnergyBudgetPhase.ts` lines 42-102

**Problem:** TECH_ENERGY_REQUIREMENTS uses fixed values (e.g., `tWhPerUnit: 15_000` for DAC). The research mentions uncertainty ranges (1,200-2,500 kWh/tCO2) but these aren't sampled.

**Impact:** Reduced model variance in Monte Carlo runs
**Severity:** LOW (model completeness)
**Recommendation:** Future enhancement - add uncertainty ranges similar to LD50 values in radiation modeling
**Effort:** MEDIUM

---

### L-3: Two Mapping Functions for Tech-to-Energy Category

**Location:**
- `src/simulation/engine/phases/EnergyBudgetPhase.ts` lines 344-360 (`mapTechToEnergyCategory`)
- `src/simulation/engine/phases/ClimateDeploymentPhase.ts` lines 456-472 (`mapTechToEnergyCategory`)

**Problem:** Duplicate string-matching logic in two places. Both use similar `techId.includes()` patterns but slightly different (ClimateDeploymentPhase has `direct_air_capture` vs `dac`).

**Impact:** Maintenance burden, potential divergence
**Severity:** LOW
**Recommendation:** Extract to shared utility in `src/simulation/utils/`
**Effort:** SMALL

---

## Architecture Observations (Non-Issues)

### Good: No Deep Cloning in Hot Path

Confirmed no `structuredClone`, `JSON.parse(JSON.stringify())`, or `deepClone` in engine phases. State mutation is direct per project guidelines.

### Good: Defensive Coding in New Systems

EnergyBudgetPhase and RadiationSystemPhase both use:
- `assertFinite()` for all calculations
- `assertInRange()` for bounded values
- `assertStateProperty()` for state access
- No silent fallbacks (`?? defaultValue` patterns)

### Good: Feature Flag for Energy Budget

`state.energyBudget.enabled` allows gradual rollout and A/B testing.

---

## Recommendations Summary

| Issue | Severity | Effort | Action |
|-------|----------|--------|--------|
| H-1: Energy Budget Underutilization | HIGH | MEDIUM | Schedule between features |
| H-2: Duplicate Energy Calculation | HIGH | SMALL | Address in next sprint |
| M-1: Phase Dependency | MEDIUM | TRIVIAL | Quick fix |
| M-2: Radiation Energy Integration | MEDIUM | SMALL | Future enhancement |
| M-3: Threshold Uncertainty Revert | MEDIUM | UNKNOWN | Investigate |
| M-4: O(n) Find in Loop | MEDIUM | SMALL | When scaling |
| L-1: Filter Operations | LOW | N/A | No action |
| L-2: Hardcoded Energy Values | LOW | MEDIUM | Future |
| L-3: Duplicate Mapping | LOW | SMALL | Opportunistic |

---

## Next Steps

1. **Immediate (this week):** Address H-2 (duplicate energy calculation) - clear technical debt
2. **Short-term (next sprint):** Plan H-1 (energy budget integration) - affects model accuracy
3. **Investigation needed:** M-3 (threshold uncertainty) - understand why code was reverted

---

*Review completed: December 9, 2025*
*Total simulation phase files: 30,166 lines across 96 phase files*
*Energy Budget system: 363 lines (EnergyBudgetPhase.ts)*
