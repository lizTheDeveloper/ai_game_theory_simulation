# FIX #14: Proper Solution - Tech Tree State Persistence

**Date:** October 22, 2025
**Status:** ✅ COMPLETE
**Validation:** In progress (N=10, 240mo)

## Problem Summary

Technology deployment levels were resetting to 0% between monthly update cycles, preventing multi-timescale deployment (FIX #14 Phases 1-4) from working correctly.

**Symptoms:**
- TIER 0 technologies (95% deployed) dropped to 0%
- New technologies started deployment but reset each month
- Ecology remained collapsed despite mitigation tech deployment

## Root Causes Identified

### 1. Optional techTreeState Property
`techTreeState` was defined as optional (`techTreeState?:`) in GameState, causing it to potentially become undefined and lose all deployment progress.

### 2. Critical JavaScript Bug
```typescript
// BUG: Falsy value treated as missing
const timescale = tierTimescales[tech.status] || DEFAULT_TIMESCALES.tier2;
// For TIER 0: tierTimescales['deployed_2025'] = 0
// Result: 0 || 240 = 240 (because 0 is falsy!)

// FIX: Use nullish coalescing
const timescale = tierTimescales[tech.status] ?? DEFAULT_TIMESCALES.tier2;
// Result: 0 ?? 240 = 0 (0 is not null/undefined)
```

This caused TIER 0 technologies (timescale = 0 months, already deployed) to be treated as TIER 2 technologies (240 months deployment), recalculating from 0% each month.

## Solution Implemented

### Changes Made:

1. **Made techTreeState Required** (`src/types/game.ts:183`)
   ```typescript
   // Before:
   techTreeState?: import('../simulation/techTree/engine').TechTreeState;

   // After:
   techTreeState: import('../simulation/techTree/engine').TechTreeState; // REQUIRED
   ```

2. **Initialize in createInitialState** (`src/simulation/initialization.ts:715`)
   ```typescript
   techTreeState: initializeTechTreeState(),
   ```

3. **Removed Type Casting** (15 files affected)
   ```typescript
   // Before:
   const techTreeState = (state as any).techTreeState;
   if (!techTreeState) return;

   // After:
   const techTreeState = state.techTreeState; // Always present
   ```

4. **Fixed Nullish Coalescing Bug** (`src/simulation/techTree/deploymentTimescales.ts:105`)
   ```typescript
   const result = tierTimescales[tech.status] ?? DEFAULT_TIMESCALES.tier2;
   ```

5. **Removed Workaround Code**
   - Deleted `deploymentLevels?: Map<string, number>` from GameState
   - Removed read/write logic from `updateDeploymentProgress()`
   - Removed 50+ lines of debug/workaround code

### Files Modified:

**Core Types:**
- `src/types/game.ts` - Made techTreeState required

**Initialization:**
- `src/simulation/initialization.ts` - Initialize techTreeState

**Tech Tree System:**
- `src/simulation/techTree/deploymentTimescales.ts` - Fixed nullish coalescing, removed workaround
- `src/simulation/techTree/engine.ts` - Removed debug code
- `src/simulation/techTree/helpers.ts` - Removed type casts

**Phases:**
- `src/simulation/engine/phases/TechTreePhase.ts` - Simplified, removed checks
- `src/simulation/engine.ts` - Removed debug code

**Agent Actions:**
- `src/simulation/agents/aiTechActions.ts` - Removed type casts
- `src/simulation/agents/governmentTechActions.ts` - Removed type casts

**Other Systems:**
- `src/simulation/planetaryBoundaryRecovery.ts` - Updated tech checks
- `src/simulation/warMeaningFeedback.ts` - Removed type casts

## Verification

### Test 1: Single Run (120 months)
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=120
```
**Result:** ✅ SUCCESS
- Simulation completed (exit code 0)
- Deployment milestones logged for multiple technologies
- No crashes or errors

### Test 2: Final Validation (N=10, 240 months)
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=240
```
**Status:** 🔄 IN PROGRESS
- Technologies deploying properly (confirmed in logs)
- Deployment progress milestones appearing
- Expected completion: ~15-20 minutes

**Technologies Confirmed Deploying:**
- Advanced Purpose Networks
- Personalized Education
- Smart Grids
- AI Mental Health Support
- Precision Conservation
- Advanced Grid Batteries
- Defensive AI Systems
- Marine Cloud Brightening
- Basic Longevity Extension

## Architecture Review

**Architecture-Skeptic Rating:** HIGH priority fix (proper solution)

**Key Insight:** The workaround (GameState.deploymentLevels Map) was masking an architectural anti-pattern. The proper fix addresses the root cause:
1. techTreeState should always be a required, properly-typed GameState property
2. Using `(state as any)` for core game state is an anti-pattern
3. JavaScript's falsy value behavior requires careful use of `??` vs `||`

**Impact:**
- Eliminates data duplication risk (split-brain scenarios)
- Prevents similar bugs in other optional state properties
- Maintains single source of truth for all game state

## Next Steps

1. ✅ Proper fix implemented and tested
2. 🔄 Waiting for final validation results (N=10, 240mo)
3. ⏳ Analyze ecological DUI scores to confirm recovery
4. ⏳ Compare to FIX #14 predictions (20-40/100 stabilized ecology)

## Lessons Learned

1. **Always use `??` for numeric fallbacks** - `0 || default` fails silently
2. **Optional properties for core state are dangerous** - Makes persistence fragile
3. **Type assertions hide real problems** - `(state as any)` bypasses type safety
4. **Workarounds mask root causes** - Proper architectural fixes prevent future bugs

## References

- **Architecture Review:** `reviews/tech-tree-deployment-architecture-review.md`
- **Original Implementation:** `devlogs/20251021_fix14_deployment_diagnosis.md`
- **Research Foundation:** `research/climate_mitigation_deployment_rates_20251021.md`
