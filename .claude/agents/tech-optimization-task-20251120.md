# Task: HIGH Priority Performance & Type Safety Fixes

**Date:** 2025-11-20
**Priority:** HIGH (from Daily Review 20251120_060001)
**Estimated Effort:** 2-3 hours
**Assigned To:** simulation-maintainer (Roy)

## Context

Profiling complete (logs/profile_20251120_worker.log, aggregate_report.json):
- Current avg step time: 91.9ms (good, within budget)
- Key bottlenecks: AI Agent Actions (52.8ms/step), Technology Tree Update (11.6ms/step)
- Technology lookups: 284+ linear searches per month across 19 files
- Type safety issue: nuclearWinter.ts accessing state.technologyTree.deployed (doesn't exist)

## Tasks

### 1. Technology Lookup Optimization (HIGH PRIORITY)

**Problem:** Linear searches through technology arrays cause O(n) lookups repeated 284+ times/month.

**Files affected (31 occurrences across 19 files):**
- src/simulation/nuclearWinter.ts
- src/simulation/environmental.ts
- src/simulation/techTree/engine.ts
- src/simulation/agents/aiTechActions.ts
- src/simulation/agents/governmentTechActions.ts
- And 14 more files (see grep results)

**Solution:**
Add O(1) lookup maps to TechTreeState:

```typescript
// In src/simulation/techTree/engine.ts
export interface TechTreeState {
  // ... existing fields ...

  // NEW: O(1) lookup maps (update on unlock/deployment changes)
  unlockedTechMap: Record<string, boolean>;  // techId -> is unlocked
  deploymentByTechId: Record<string, RegionalTechDeployment[]>;  // techId -> all regional deployments
  deploymentByRegion: Record<string, Record<string, RegionalTechDeployment>>;  // region -> techId -> deployment
}
```

**Migration pattern:**
```typescript
// ❌ OLD: O(n) linear search
const deployment = state.techTreeState.regionalDeployment['global'].find(d => d.techId === 'cold_tolerant_crops');

// ✅ NEW: O(1) map lookup
const deployment = state.techTreeState.deploymentByRegion['global']?.['cold_tolerant_crops'];
```

**Implementation checklist:**
- [ ] Add maps to TechTreeState interface
- [ ] Initialize maps in initializeTechTreeState()
- [ ] Update maps in unlockTech(), deployTech() functions
- [ ] Create helper functions: getTechDeployment(state, techId, region), isTechUnlocked(state, techId)
- [ ] Migrate all 31 .find() usages to helper functions
- [ ] Run tests: npm test
- [ ] Profile again to verify improvement (should reduce Technology Tree Update phase)

**Expected impact:** Reduce Technology Tree Update from 11.6ms → <5ms per step (~50% reduction)

### 2. Nuclear Winter Type Safety (HIGH PRIORITY)

**Problem:** src/simulation/nuclearWinter.ts:499-517 accesses state.technologyTree.deployed which doesn't exist.

**Actual type:** GameState has:
- `technologyTree: TechnologyNode[]` (legacy tree, not deployment tracking)
- `techTreeState: TechTreeState` (modular system with regionalDeployment)

**Current code (line 499):**
```typescript
const globalDeployments = state.techTreeState.regionalDeployment['global'] || [];
```

**Issue:** Type mismatch - should be accessing techTreeState not technologyTree, but line numbers suggest there may be other type issues.

**Fix:**
1. Read nuclearWinter.ts lines 495-525 fully
2. Verify all tech tree access uses `state.techTreeState.regionalDeployment`
3. Add type guards where needed
4. Use new helper functions from Task #1 (getTechDeployment)
5. Add assertions for null-safety

**Example:**
```typescript
// ✅ CORRECT: Use helper + assertion
const deployment = getTechDeployment(state, 'strategic_grain_reserves', 'global');
const deploymentLevel = deployment?.deploymentLevel ?? 0;

// Better: Assert deployment exists if required
const deployment = assertDefined(
  getTechDeployment(state, 'strategic_grain_reserves', 'global'),
  {
    location: 'calculateResilientFoodMultiplier',
    valueName: 'strategic_grain_reserves deployment',
    month: state.currentMonth
  }
);
```

## Validation

After implementation:
1. ✅ TypeScript compiles without errors: `npx tsc --noEmit`
2. ✅ All tests pass: `npm test`
3. ✅ Profile shows improvement: Run scripts/profileSimulation.ts (compare to baseline 11.6ms)
4. ✅ Monte Carlo N=10 runs successfully with determinism (CV < 0.01%)

## Notes

- Don't break existing functionality - this is OPTIMIZATION + TYPE SAFETY, not behavior changes
- Preserve all defensive coding patterns (assertions, no silent fallbacks)
- Update any affected test files
- If you find additional type issues during implementation, fix them too

## Files to Create/Modify

**Modify:**
- src/simulation/techTree/engine.ts (add maps, helper functions)
- src/simulation/nuclearWinter.ts (type safety)
- All 19 files with .find() tech lookups (migrate to helpers)

**Create:**
- src/simulation/techTree/helpers.ts (if helper functions need separate file)

**Test:**
- Run existing test suite
- Profile again to verify improvements
