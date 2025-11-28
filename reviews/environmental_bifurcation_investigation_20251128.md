# Environmental Month 1 Bifurcation Investigation

**Date:** 2025-11-28
**Investigator:** Roy (Simulation Maintainer)
**Issue:** 100% dystopia rate, environmental bifurcation at Month 1 in all Monte Carlo runs

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** Biodiversity initialization is 40% too low (0.35 vs research-backed 0.49), causing environmental health to start AT the collapse threshold. This creates immediate bifurcation in ~50% of runs.

**FIX:** Update `biodiversityIndex` initialization from 0.35 → 0.49 (WWF LPI 2024 baseline).

**IMPACT:** Expected to shift Month 1 bifurcation from 100% → ~0-10%, restoring proper outcome distribution.

---

## Investigation Findings

### 1. Bifurcation Threshold Analysis

**Environmental collapse threshold** (from `src/types/bifurcation.ts:269-277`):
- Base: 0.35
- Variance: ±0.05
- Range: 0.30 - 0.40
- Direction: `below` (triggers when environmentalHealth < threshold)

### 2. Environmental Health Calculation

**Formula** (from `BifurcationLogicPhase.ts:162`):
```typescript
envHealth = (climateStability × biodiversityIndex × resourceReserves × (1 - pollutionLevel))^0.25
```

**Initial values** (Month 0, 2025):
- `climateStability`: 0.70-0.80 (midpoint 0.75) ✅ CORRECT
- `biodiversityIndex`: **0.35** ❌ TOO LOW (should be 0.49)
- `resourceReserves`: 0.55-0.75 (midpoint 0.65) ✅ CORRECT
- `pollutionLevel`: 0.20-0.40 (midpoint 0.30) ✅ CORRECT

**Current environmental health at Month 0:**
```
envHealth = (0.75 × 0.35 × 0.65 × 0.70)^0.25
          = (0.11960)^0.25
          = 0.3307
```

**PROBLEM:** Environmental health (0.33) is BELOW the threshold base (0.35).

- In 50% of runs, random threshold will be 0.35-0.40 → immediate collapse
- In 50% of runs, random threshold will be 0.30-0.35 → teetering on edge, collapses within 1-2 months

### 3. Biodiversity Research Validation

**WWF Living Planet Index 2024:**
- 1970 baseline: 1.00 (100%)
- 2024 value: 0.49 (49% of 1970 baseline)
- Source: `research/verification_b15e5a5_20251127.md:185`

**Current code** (`src/simulation/environmental.ts:74`):
```typescript
biodiversityIndex: 0.35,  // ❌ WRONG - 40% too low
```

**Should be:**
```typescript
biodiversityIndex: 0.49,  // ✅ WWF LPI 2024
```

### 4. Corrected Environmental Health

**With biodiversity fix (0.49):**
```
envHealth = (0.75 × 0.49 × 0.65 × 0.70)^0.25
          = (0.1675)^0.25
          = 0.3595
```

**New distance to threshold:**
- Threshold base: 0.35
- New envHealth: 0.3595
- Distance: +0.0095 (buffer restored!)

**Expected behavior:**
- In ~90% of runs, threshold will be 0.30-0.35 → safe zone at Month 0
- In ~10% of runs, threshold will be 0.36-0.40 → still at risk, but not immediate collapse
- Environmental degradation over months 1-12 will determine actual collapse timing

---

## Root Cause

**File:** `src/simulation/environmental.ts:74`

**Erroneous value:**
```typescript
biodiversityIndex: 0.35,  // Keep deterministic - biodiversity tracked via boundary system
```

**Why this happened:**
- Comment says "keep deterministic" - suggests value was intentionally fixed
- But the FIXED value was incorrect (0.35 vs 0.49 from WWF LPI 2024)
- This 40% underestimation creates a phantom crisis state at initialization

**Research basis for fix:**
- WWF Living Planet Report 2024: 49% of 1970 baseline
- Verified in: `research/verification_b15e5a5_20251127.md`
- Annual decline rate: 1.24%/year (1990-2024)
- Extrapolation: 0.75 (1990) → 0.49 (2024)

---

## Proposed Fix

### Code Change

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/environmental.ts`

**Line 74:**
```typescript
// BEFORE (WRONG):
biodiversityIndex: 0.35,      // Keep deterministic - biodiversity tracked via boundary system

// AFTER (CORRECT):
biodiversityIndex: 0.49,      // WWF Living Planet Index 2024 (49% of 1970 baseline)
                              // Research: research/verification_b15e5a5_20251127.md
                              // Keep deterministic - biodiversity tracked via boundary system
```

### Validation Plan

1. **Unit test:** Verify `initializeEnvironmentalAccumulation()` returns 0.49
2. **Integration test:** Verify environmental health at Month 0 is 0.36 ± 0.02
3. **Monte Carlo (N=10):** Verify outcome distribution is NOT 100% dystopia
4. **Expected distribution:**
   - Utopia: 5-15%
   - Sustainable: 30-50%
   - Dystopia: 30-50%
   - Collapse/Extinction: 5-15%

---

## Impact Analysis

### Before Fix
- Environmental health: 0.33 (AT collapse threshold)
- Month 1 bifurcation: 100% of runs
- Outcome distribution: 100% dystopia

### After Fix
- Environmental health: 0.36 (buffer restored)
- Month 1 bifurcation: 0-10% of runs (only if extreme threshold + degradation)
- Outcome distribution: Expected research-backed variance

### Side Effects
**None.** This is a pure initialization fix. The biodiversity decline mechanics in `environmental.ts` remain unchanged. The value simply starts at the correct 2025 baseline instead of a phantom crisis state.

---

## Files Changed

1. **src/simulation/environmental.ts** (line 74)
   - Change: `biodiversityIndex: 0.35` → `0.49`
   - Justification: WWF LPI 2024 baseline
   - Research: `research/verification_b15e5a5_20251127.md`

---

## Monte Carlo Validation Requirements

After implementing fix, run:
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/mc_biodiversity_fix_20251128.log 2>&1 &
```

**Success criteria:**
- ✅ Outcome distribution is NOT 100% dystopia
- ✅ Environmental health at Month 0 is 0.36 ± 0.02
- ✅ Month 1 bifurcation rate < 20%
- ✅ No NaN errors in logs

**If validation fails:**
- Check if threshold base (0.35) should be adjusted
- Consider if other initialization values need recalibration
- Review planetary boundaries starting values

---

## UPDATED FINDINGS (After Fix Attempt)

### Biodiversity Fix Applied ✅
- Changed `biodiversityIndex: 0.35 → 0.49` (WWF LPI 2024 baseline)
- Verification: Debug logs confirm `biodiversityIndex: 0.4910` at Month 1 ✅

### NEW ROOT CAUSE IDENTIFIED ❌

**The biodiversity fix did NOT resolve the 100% dystopia rate.**

**Actual problem:** `climateStability` is being ZEROED between initialization and bifurcation check.

**Evidence:**
```
Month 0 initialization: climate=0.769 ✅
Month 0 degradation: currentClimateStability=0.768546 ✅
Month 1 bifurcation: climateStability=0.0000 ❌ ZERO!
Month 1 degradation: currentClimateStability=0.100000
```

**Sequence:**
1. Initialization sets climateStability to 0.769
2. Month 0 environmental update applies minimal degradation (→ 0.768)
3. **SOMETHING zeros climateStability between Month 0 end and Month 1 bifurcation check**
4. Bifurcation reads 0.000 → triggers immediate collapse
5. Later in Month 1, environmental update reads 0.100 (floor applied)

**Environmental health calculation at Month 1:**
```
envHealth = (0.0000 × 0.4910 × 0.7819 × 0.6883)^0.25
          = 0.0000
```

**Result:** Still 100% dystopia (10/10 runs)

---

## Next Steps

### CRITICAL-1: Find climateStability Zero Bug

**Investigation required:**
1. Identify which phase runs between Month 0 end and Month 1 bifurcation (order < 4.5)
2. Search for ALL writes to `climateStability` in that phase range
3. Add assertions to catch the write that zeros it
4. Check for:
   - Overwrites from historical mode initialization
   - Phase execution order bugs
   - Circular dependencies between phases
   - Incorrect use of `Math.max(FLOORS.GEOMETRIC_MEAN_FLOOR, ...)` that might clamp to 0.001 then get multiplied/divided incorrectly

**Debugging approach:**
- Add `console.log` at START and END of every phase with order < 4.5
- Log climateStability value at each point
- Binary search to find which phase zeros it

**Files to check:**
- All phases with `order < 4.5`
- `src/simulation/environmental.ts` (updateEnvironmentalAccumulation)
- `src/simulation/engine/phases/BifurcationLogicPhase.ts`
- Any historical mode overrides

### Temporary Workarounds (NOT RECOMMENDED)

1. Increase bifurcation threshold from 0.35 to 0.50 (masks root cause)
2. Add defensive check in bifurcation to reject envHealth < 0.01 as invalid (hides bug)
3. Initialize climateStability to 0.95 instead of 0.75 (buys time before zero bug triggers)

**None of these are acceptable.** Fix the root cause, don't mask it.

---

## Attribution

Investigation conducted by Roy (Simulation Maintainer)
Research validation: WWF Living Planet Report 2024
Monte Carlo analysis: Session 11 autonomous worker (10/10 dystopia runs)
Debug analysis: Session 11 (Nov 28, 2025)

*sigh* Another day, another bug. Biodiversity was the wrong value (fixed). But now there's a SECOND bug zeroing climateStability. The simulation is a hydra - fix one bug, two more appear.

**Status:** Escalate to next session. climateStability zeroing bug requires deeper phase execution analysis.
