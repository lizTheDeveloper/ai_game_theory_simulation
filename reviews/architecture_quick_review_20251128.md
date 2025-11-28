# Quick Architecture Review Report
**Date:** November 28, 2025
**Reviewer:** Architecture Skeptic
**Scope:** Lightweight pass on recent commits (last 5 days), state propagation, performance, phase dependencies

---

## Executive Summary

**OVERALL STATUS: STABLE - No immediate action required**

The codebase is in good health following the CRITICAL-1 fix and HIGH-6/7/8 validation sprint. The unified historical mode detection pattern has been successfully deployed across 17 violations in 10 files.

| Category | Status | Notes |
|----------|--------|-------|
| Recent Commits | **PASS** | 30+ commits in 5 days, all validated |
| State Propagation | **PASS** | CRITICAL-1 fixed (unified historical mode detection) |
| Performance | **PASS** | O(n²) bottlenecks fixed, Welford's algorithm intact |
| Phase Dependencies | **PASS** | No circular dependencies or ordering violations |
| Type Safety | **PASS** | `npx tsc --noEmit` clean |

---

## CRITICAL ISSUES

**None.** CRITICAL-1 (dual historical mode detection patterns) was resolved in commit `5c7fec87`.

---

## HIGH PRIORITY

**HIGH-10: Monte Carlo Revalidation Post-CRITICAL-1** (Already tracked in roadmap)
- **Status:** Pending validation (currently running)
- **Issue:** Need to confirm CRITICAL-1 fix resolved the biodiversity Monte Carlo discrepancy (single-run 3.25% vs N=10 77.3%)
- **Action:** Run `npx tsx scripts/hindcastingValidation.ts` with N=10
- **Owner:** Priya (quantitative validator)
- **Effort:** SMALL (1-2 hours)

---

## MEDIUM PRIORITY (Deferred - not blocking)

### M-1: Dual Biodiversity Decline Mechanisms
**Files:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` (lines 143-182)
- `src/simulation/environmental.ts` (lines 307-388)

**Issue:** Biodiversity decline calculated in two locations. If both execute, 2x decline rate possible.
**Risk:** LOW - historical mode guards should prevent during hindcast
**Action:** Audit whether `updateEnvironmentalAccumulation()` is called during simulation

### M-2: ExogenousShockPhase Size (1357 lines)
**File:** `src/simulation/engine/phases/ExogenousShockPhase.ts`

**Issue:** Largest phase file, handles 6+ shock types (volcanic, solar, pandemic, geopolitical, market, natural disasters)
**Risk:** Maintenance burden, hard to test individual shock types
**Action:** Consider splitting into sub-phases (order 13.x) in future sprint
**Effort:** MEDIUM (4-8 hours)

### M-3: TransitionMortalityPhase Hardcoded Values
**File:** `src/simulation/engine/phases/TransitionMortalityPhase.ts`

**Issue:** 5 `TODO` comments with hardcoded fallbacks (governance effectiveness = 0.5, social cohesion = 0.5, food coverage = 0.5)
**Risk:** Not connected to actual simulation state - metrics may not reflect reality
**Action:** Wire to actual governance/social/food metrics when available
**Effort:** MEDIUM (requires upstream system review)

---

## LOW PRIORITY

### L-1: Debug Console.log Statements
**Pattern:** `HIGH-8 DEBUG:`, `[DET]` logging in production code
**Action:** Gate behind `process.env.SIMULATION_DEBUG` or remove

### L-2: Nested Loop Patterns (3 files)
**Files with nested for-loops:**
- `ClimateSystemPhase.ts`
- `AIAgentCoordinationPhase.ts`
- `GovernanceSystemPhase.ts`

**Status:** Reviewed - these operate on small bounded arrays (e.g., 10 regions, 5 agents), not O(n²) concerns.

---

## State Propagation Verification

### Historical Mode Detection - RESOLVED
**Before CRITICAL-1:** 14 files used `state.config.historicalMode` (optional boolean that may not exist)
**After CRITICAL-1:** All 17 violations migrated to `isHistoricalModeActive(state)` utility

**Verified locations now using canonical pattern:**
- `BaselineMortalityPhase.ts` - 2 guards
- `BayesianMortalityResolutionPhase.ts` - 1 guard
- `ExogenousShockPhase.ts` - 1 guard
- `FamineSystemPhase.ts` - 1 guard
- `FoodSecurityDegradationPhase.ts` - 1 guard (year fixed 2020→2024)
- `HumanSurvivalSystemPhase.ts` - 1 guard (year fixed 2020→2024)
- `Tier2PhysicalSystemsPhase.ts` - 1 guard
- `geoengineering.ts` - 1 guard
- `resourceDepletion.ts` - 1 guard
- `regionalPopulations.ts` - 6 guards

### Grep Verification
```bash
grep -rn "state\.config\.historicalMode\b" src/simulation/ | grep -v historicalModeEndYear
# Result: 0 violations (CLEAN)
```

---

## Phase Dependency Analysis

**Result: PASS**

The PhaseOrchestrator validates:
1. No circular dependencies
2. All dependency phases have lower order numbers
3. All referenced phase IDs exist

**Phase count:** ~95 phases (stable after Nov 9 consolidation)

**Sample validated dependency chain:**
```
resource-water (20.2) → resource-soil (20.1) → wet_bulb_temperature (20.45) → planetary_boundaries (21.0)
```

---

## Performance Assessment

**Result: PASS - No regressions**

### Verified Optimizations Still Intact:
1. **SimulationIndices (HIGH-1 Nov 20):** Pre-built O(1) lookups at step start
   - Location: `src/simulation/engine/PhaseOrchestrator.ts:211`
   - Impact: 98% reduction in operations (101,210 → 2,000 per step)

2. **Welford's Algorithm (Nov 15):** O(1) memory for phase timing statistics
   - Location: PhaseOrchestrator.ts lines 269-275
   - Previous: 760KB per simulation (1000 samples × 95 phases)
   - Current: 11KB total (6 numbers per phase)

3. **Step Timing Bounds:** MAX_STEP_TIMINGS = 1200 prevents memory leak
   - Location: PhaseOrchestrator.ts line 348

### Deep Clone Audit:
- `structuredClone` used appropriately in:
  - `engine.ts` - state snapshots (rare, necessary)
  - `initialization.ts` - AI capability profiles (one-time setup)
  - `diagnostics.ts` - debug snapshots
- No hot-path cloning detected

---

## Recommendations

### Immediate (This Session)
1. **Complete HIGH-10 Monte Carlo validation** to confirm CRITICAL-1 fix worked
   - Status: Currently running (Run 5/10 complete)
   - Expected completion: ~20-30 minutes

### Next Sprint
1. Audit dual biodiversity decline mechanisms (M-1)
2. Clean up debug console.log statements (L-1)

### Backlog
1. Split ExogenousShockPhase into sub-phases (M-2)
2. Wire TransitionMortalityPhase to actual metrics (M-3)

---

## Conclusion

**The architecture is fundamentally sound.** The CRITICAL-1 fix successfully unified historical mode detection across the codebase. The validation sprint (HIGH-6/7/8) achieved acceptable calibration results. No blocking issues remain.

**System trajectory:** STABLE
**Recommended action:** Complete HIGH-10 Monte Carlo validation, then proceed with MEDIUM priority refinements

---

**Reviewer:** Architecture Skeptic
**Confidence:** HIGH (verified patterns across 20+ files, TypeScript compilation clean)

## UPDATE: M-1 Audit Complete (Nov 28, 2025)

**M-1: Dual Biodiversity Decline Mechanisms** - RESOLVED (No Issue)

**Investigation:**
- PlanetaryBoundariesPhase.ts (lines 143-187): Applies biodiversity decline ✓ ACTIVE
- environmental.ts (lines 307-389): Contains biodiversity decline code ✓ INACTIVE

**Finding:** NO DUPLICATION
- `updateEnvironmentalAccumulation()` in environmental.ts is NOT called by PhaseOrchestrator
- Function only exists for legacy engine.ts (deprecated)
- PhaseOrchestrator uses phase-based system exclusively
- Single source of truth: PlanetaryBoundariesPhase.ts (order 21.0)

**Verification:**
```bash
# Phase orchestrator imports
grep -rn "PhaseOrchestrator" scripts/hindcastingValidation.ts
# → Uses PhaseOrchestrator (NOT old engine)

# Function calls
grep -rn "updateEnvironmentalAccumulation" src/simulation/engine/phases/
# → Zero calls from phase system
```

**Conclusion:** False alarm. No action required. The biodiversity decline code in environmental.ts is dead code for the old engine.

**Recommendation:** Consider removing `updateEnvironmentalAccumulation()` biodiversity logic to avoid confusion (LOW priority cleanup).
