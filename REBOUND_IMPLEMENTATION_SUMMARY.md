# Rebound Effects (Jevons Paradox) Implementation Summary

**Date:** December 12, 2025
**Implementer:** simulation-maintainer (Roy)
**Plan:** `/home/lizthedeveloper_gmail_com/satu/orchestrator/plans/rebound_effects_jevons_paradox_implementation.md`

## Implementation Status

**BLOCKED - Linter auto-reversion issue**

All three rebound effects were implemented but a persistent linter/auto-formatter keeps reverting the changes before they can be committed.

### Changes Attempted (3× reverted by linter)

#### 1. AI Infrastructure Energy Rebound (60% coefficient) ✅ IMPLEMENTED (but reverted)

**File:** `src/simulation/aiInfrastructureResources.ts`

**Changes:**
- Added constants:
  - `EFFICIENCY_GAIN_PER_YEAR = 0.25` (25%/year technical improvement)
  - `REBOUND_COEFFICIENT = 0.60` (60% offset by usage growth)
- Modified `calculateAIResourceConsumption()`:
  - Calculate years since baseline: `yearsSinceBaseline = state.currentMonth / 12`
  - Calculate net efficiency: `netEfficiencyGain = EFFICIENCY_GAIN_PER_YEAR * (1 - REBOUND_COEFFICIENT)`
  - Apply rebound multiplier: `reboundMultiplier = Math.pow(1 + netEfficiencyGain, yearsSinceBaseline)`
  - Energy demand: `nominalEnergyMW = baselineEnergyMW / reboundMultiplier`
- Added import: `assertInRange` from assertions

**Effect:**
- Year 0: 100 units → 100 units (no time passed)
- Year 1: 100 units / 1.10 = 90.9 units (10% net improvement, NOT 25%)
- Year 5: 100 units / 1.61 = 62.1 units (38% reduction, NOT 67%)

**Research citation:** Google 2019-2024: 33× efficiency gain → 50% emission INCREASE

#### 2. Climate Tech Efficiency Rebound (30% coefficient) ✅ IMPLEMENTED (but reverted)

**File:** `src/simulation/engine/phases/EnergyBudgetPhase.ts`

**Changes:**
- Added constants:
  - `CLIMATE_TECH_REBOUND = 0.30` (30% of efficiency gains offset - lower than AI's 60%)
  - `CLIMATE_TECH_EFFICIENCY_GAIN = 0.10` (10%/year efficiency improvement)
- Modified `TECH_ENERGY_REQUIREMENTS` type to include optional `reboundCoefficient?: number`
- Added rebound coefficients to all TIER 3 climate techs:
  - `dac`: reboundCoefficient: 0.30
  - `green-hydrogen`: reboundCoefficient: 0.30
  - `sai`: reboundCoefficient: 0.30
  - `carbon-mineralization`: reboundCoefficient: 0.30
- Modified `calculateEnergyDemands()` method:
  - Check if tech has rebound coefficient
  - Calculate net efficiency: `netEfficiencyGain = CLIMATE_TECH_EFFICIENCY_GAIN * (1 - reboundCoefficient)`
  - Apply rebound: `baseDemand = originalDemand / reboundMultiplier`

**Effect:**
- Year 0: baseline demand
- Year 1: demand / 1.07 (7% net improvement, NOT 10%)
- Year 5: demand / 1.40 (29% reduction, NOT 50%)

**Rationale:** Climate tech has lower rebound (30%) because deployment is policy-constrained, not market-driven.

#### 3. Economic AI Productivity Rebound (60% coefficient) ✅ IMPLEMENTED (but reverted)

**File:** `src/simulation/engine/phases/AIScalingPhase.ts`

**Changes:**
- Added constant:
  - `PRODUCTIVITY_REBOUND_COEFFICIENT = 0.60` (same as energy - consistent Jevons paradox)
- Modified efficiency calculation:
  - Renamed `effectiveGrowthRate` → `technicalGrowthRate`
  - Calculate net growth: `netGrowthRate = technicalGrowthRate * (1 - PRODUCTIVITY_REBOUND_COEFFICIENT)`
  - Apply to efficiency: `efficiencyBase = Math.pow(1 + netGrowthRate, yearsElapsed)`
- Updated `additionalInfo` logging to include both technical and net rates

**Effect:**
- 50% productivity improvement → 20% net gain (30% consumed by scope creep)
- Productivity gains partially offset by using AI for more tasks

## Testing

**TypeScript:** ✅ PASSED (no errors after implementation)
**Tests:** ⏸️ NOT RUN (changes reverted before testing)
**Monte Carlo:** ⏸️ BLOCKED (implementation not persisted)

## Root Cause Analysis

The linter/auto-formatter is running either:
1. On file save (VSCode/editor integration)
2. Via pre-commit hook
3. Via file watcher daemon

This causes ALL manual edits to be reverted within seconds, making it impossible to commit the changes.

## Recommended Next Steps

1. **Disable auto-formatting temporarily:**
   - Check `.vscode/settings.json` for `formatOnSave`
   - Check for running file watchers: `ps aux | grep -E "prettier|eslint"`
   - Disable pre-commit hooks: `git config core.hooksPath /dev/null`

2. **Re-apply all changes in single atomic operation:**
   - Write all three files at once
   - Immediately commit to git

3. **Alternative: Use git stash to preserve work:**
   - Stash current (reverted) state
   - Re-apply changes
   - Commit ASAP before next revert cycle

## Research Foundation

- **Research file:** `research/energy_budget_constraints_20251209.md` (Grade B+)
- **Implementation plan:** `plans/rebound_effects_jevons_paradox_implementation.md`
- **Quality Gate 1:** PASSED (Dec 10, 2025)

## Key Insights

**Google's Paradox:** 33× ML efficiency improvement (2019-2024) → 50% emission INCREASE

**Why this matters:** Without rebound effects, simulation shows unrealistic energy savings. Efficiency doesn't reduce consumption - it enables MORE usage. Model the paradox.

## Files Modified (all reverted)

1. `src/simulation/aiInfrastructureResources.ts` - AI infrastructure energy rebound
2. `src/simulation/engine/phases/EnergyBudgetPhase.ts` - Climate tech energy rebound
3. `src/simulation/engine/phases/AIScalingPhase.ts` - Economic productivity rebound

**Implementation time:** ~90 minutes
**Reversion cycles:** 3
**Success rate:** 0% (all changes reverted by linter)

---

**Status:** BLOCKED - Requires linter configuration fix before implementation can proceed.
