# Architecture Integration Review - December 10, 2025

**Reviewer:** Architecture Skeptic (AI Agent)
**Focus Period:** December 9-10, 2025 (post-HIGH-priority completion)
**Scope:** Full integration review of all recent HIGH-priority work

## Executive Summary

**GRADE: B+**

This review covers the post-HIGH-priority completion state. All three HIGH priority items (research audit, energy budget constraints, climate systems) are now complete. The codebase is stable with no CRITICAL issues identified. However, several MEDIUM-priority integration gaps persist from the December 9 review.

**Key Finding:** The time-dependent detection risk calibration (fd7694a2) is well-implemented and follows project defensive coding standards. No new architectural issues introduced.

---

## CRITICAL ISSUES

**None identified.**

The recent commits follow project defensive coding standards:
- RNG validation in all phases
- assertFinite/assertInRange for calculations
- No silent fallbacks
- Proper phase dependencies declared

---

## HIGH PRIORITY

### H-1: Energy Budget System Underutilization (UNCHANGED from Dec 9)

**Status:** Still present, not addressed
**Location:**
- `src/simulation/engine/phases/EnergyBudgetPhase.ts`
- `src/simulation/engine/phases/ClimateDeploymentPhase.ts`

**Problem:** EnergyBudgetPhase calculates `effectivenessMultiplier` for each tech category, but only ClimateDeploymentPhase consumes it. Other energy-intensive systems (novel entities cleanup, AI infrastructure) do NOT check energy budget.

**Impact:** Two parallel energy constraint systems exist, creating inconsistent modeling.
**Severity:** HIGH (model consistency, not stability)
**Recommendation:** Schedule integration work to migrate all energy consumers to use `energyBudget.allocations`
**Effort:** MEDIUM (2-3 days)

---

### H-2: Duplicate Energy Calculation (UNCHANGED from Dec 9)

**Status:** Still present, not addressed
**Location:** `src/simulation/engine/phases/ClimateDeploymentPhase.ts` lines 125-164, 412-450

**Problem:** ClimateDeploymentPhase runs BOTH legacy energy allocation (lines 125-164) AND new energy budget lookup (lines 412-450). EnergyBudgetPhase (order 12.75) runs before ClimateDeploymentPhase (order 12.8), so the legacy calculation is redundant.

**Impact:** Wasted computation, code complexity
**Severity:** HIGH (technical debt)
**Recommendation:** Remove legacy `calculateRenewableSurplus()` and `partitionEnergy()` - let EnergyBudgetPhase handle all energy allocation
**Effort:** SMALL (1-2 hours)

---

## MEDIUM PRIORITY

### M-1: Detection Risk Calibration - Unused Function (NEW)

**Location:** `src/simulation/sleeperEconomy.ts` lines 339-355

**Problem:** The new `calculateDetectionRiskAfterDetection(month)` function is ONLY called in `handleSleeperDetection()` (line 381). The cumulative detection risk in `updateSleeperDetectionRisk()` (line 315) still uses raw `economy.detectionRisk` without time-dependent calibration.

This means:
1. Initial detection probability is NOT time-calibrated (uses raw accumulated risk)
2. Post-detection risk IS time-calibrated (uses new function)

**Impact:** Inconsistent detection modeling - time-dependence only applies AFTER first detection
**Severity:** MEDIUM (model realism)
**Recommendation:** Apply `calculateDetectionRiskAfterDetection(month)` as a multiplier on initial detection checks too
**Effort:** SMALL

---

### M-2: Tipping Point Find Operations in Loop (LOW CONCERN)

**Location:** `src/simulation/engine/phases/ClimateSystemPhase.ts` lines 161, 240

**Problem:**
```typescript
// Line 161: Inside filter callback
const element = state.tippingPointSystem.elements.find(e => e.id === t.elementId);

// Line 240: Inside interaction loop
const targetElement = system.elements.find(e => e.id === interaction.targetId);
```

Both are O(n) finds inside loops. With 16 tipping elements and ~30 interactions, this is O(480) per tick - negligible.

**Impact:** None currently (system.elements.length = 16)
**Severity:** MEDIUM (future-proofing only)
**Recommendation:** If tipping elements grow to 100+, consider building an index. No action needed now.
**Effort:** N/A

---

### M-3: Phase Order Fragility in 12.x Range

**Location:** `src/simulation/engine/phases/` (orders 12.5-12.8)

**Problem:** Four phases execute in tight sequence:
- 12.5: TechTreePhase
- 12.6: StochasticInnovationPhase
- 12.7: MeaningRenaissancePhase
- 12.75: EnergyBudgetPhase
- 12.8: ClimateDeploymentPhase

Dependencies are:
- EnergyBudgetPhase declares `dependencies = ['tech-tree']`
- ClimateDeploymentPhase declares `dependencies = ['tech-tree']`
- Neither declares dependency on each other or intermediate phases

If someone changes order numbers without checking dependencies, EnergyBudgetPhase could run before StochasticInnovationPhase or MeaningRenaissancePhase without triggering dependency validation.

**Impact:** Maintenance risk
**Severity:** MEDIUM
**Recommendation:** Add explicit dependencies or document implicit ordering constraints in comments
**Effort:** TRIVIAL

---

### M-4: Threshold Uncertainty Removed (UNCHANGED from Dec 9)

**Location:** Commit 5eb4b5bd (Dec 7, 2025)

**Problem:** Threshold uncertainty sampling code was removed for "backward compatibility". Investigation needed to understand why and whether to re-add.

**Impact:** Reduced model variance in Monte Carlo runs
**Severity:** MEDIUM
**Recommendation:** Investigate what broke and re-implement properly
**Effort:** UNKNOWN

---

## LOW PRIORITY

### L-1: Sleeper Economy Filter Operations

**Location:** `src/simulation/sleeperEconomy.ts` lines 262, 265

**Problem:**
```typescript
const selectedProvider = CLOUD_PROVIDERS.find(p => p.name.includes('Stripe'));
const cryptoProviders = CLOUD_PROVIDERS.filter(p => p.acceptsCrypto);
```

Called per sleeper agent per tick. With 5 providers and ~5 active sleepers, this is O(25) per tick - negligible.

**Impact:** None
**Severity:** LOW
**Effort:** N/A

---

### L-2: EnergyBudgetPhase Hardcoded Values Without Uncertainty (UNCHANGED)

**Location:** `src/simulation/engine/phases/EnergyBudgetPhase.ts` lines 42-102

**Problem:** `TECH_ENERGY_REQUIREMENTS` uses fixed values without uncertainty ranges.

**Impact:** Reduced model variance
**Severity:** LOW
**Recommendation:** Future enhancement - add uncertainty sampling like radiation LD50 values
**Effort:** MEDIUM

---

## Architecture Observations (Non-Issues)

### Good: Time-Dependent Detection Risk Implementation

The new `calculateDetectionRiskAfterDetection()` function (lines 339-355) follows research-backed calibration:
- Early (0-36 months): 25% detection rate
- Transition (36-72 months): Linear improvement to 80%
- Late (72+ months): 80% plateau

This is well-documented with research citations and uses proper conditional logic.

### Good: PhaseOrchestrator Remains Sound

- Dependency validation catches circular dependencies and order violations
- Pre/post state validation via `stateValidator`
- Physical constraints validation in development mode
- Welford's algorithm for memory-efficient timing statistics (O(1) memory per phase)

### Good: Simulation Indices Optimization (HIGH-1, Nov 20)

The `buildSimulationIndices()` function builds O(1) lookup structures once per step, eliminating O(n^2) patterns. This is working correctly - no regressions observed.

### Good: No New Deep Cloning

Confirmed no new `structuredClone`, `JSON.parse(JSON.stringify())`, or manual deep clone operations added in recent commits.

---

## Phase Integration Status

| Phase | Order | Dependencies | Status |
|-------|-------|--------------|--------|
| TechTreePhase | 12.5 | scenario-priorities | OK |
| StochasticInnovationPhase | 12.6 | tech-tree | OK |
| MeaningRenaissancePhase | 12.7 | None | OK (implicit tech-tree) |
| EnergyBudgetPhase | 12.75 | tech-tree | OK (but see M-3) |
| ClimateDeploymentPhase | 12.8 | tech-tree | OK (but see H-2) |
| RadiationSystemPhase | 252.5 | nuclear_winter | OK |
| ClimateSystemPhase | 34.0 | Multiple | OK |

---

## Recommendations Summary

| Issue | Severity | Effort | Priority | Action |
|-------|----------|--------|----------|--------|
| H-1: Energy Budget Underutilization | HIGH | MEDIUM | Schedule | 2-3 day integration |
| H-2: Duplicate Energy Calculation | HIGH | SMALL | Now | 1-2 hour cleanup |
| M-1: Detection Risk Unused | MEDIUM | SMALL | Soon | Apply to initial check |
| M-2: Tipping Point Finds | MEDIUM | N/A | Future | Only if elements grow |
| M-3: Phase Order Fragility | MEDIUM | TRIVIAL | Soon | Add comments/deps |
| M-4: Threshold Uncertainty | MEDIUM | UNKNOWN | Investigate | Understand removal |
| L-1: Sleeper Filter Ops | LOW | N/A | Never | Negligible |
| L-2: Hardcoded Energy Values | LOW | MEDIUM | Future | Enhancement |

---

## Comparison with December 9 Review

| Issue | Dec 9 Status | Dec 10 Status | Change |
|-------|--------------|---------------|--------|
| H-1 Energy Budget | Identified | Unchanged | - |
| H-2 Duplicate Energy | Identified | Unchanged | - |
| M-1 Phase Dependency | Identified | Renamed M-3 | Clarified |
| M-2 Radiation Energy | Identified | Dropped | Lower priority |
| M-3 Threshold Uncertainty | Identified | Renamed M-4 | Unchanged |
| M-4 O(n) Find | Identified | Renamed M-2 | Unchanged |
| NEW: Detection Risk | - | M-1 | New finding |

---

## Next Steps

1. **Immediate (this sprint):**
   - H-2: Remove duplicate energy calculation in ClimateDeploymentPhase
   - M-1: Apply time-dependent calibration to initial detection checks

2. **Short-term (next sprint):**
   - H-1: Plan energy budget integration across all consumers
   - M-3: Document phase ordering constraints

3. **Investigation needed:**
   - M-4: Why was threshold uncertainty removed? What broke?

---

*Review completed: December 10, 2025*
*All HIGH priority work from roadmap is complete*
*Moving to MEDIUM priority work*
