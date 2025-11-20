# HANDOFF: Nitrogen-Food Coupling Race Condition Fix

**From:** Orchestrator
**To:** simulation-maintainer (Roy)
**Date:** Nov 20, 2025
**Priority:** CRITICAL (blocks performance profiling workflow)

## Context

Performance profiling workflow (164% budget violation fix, 197ms→120ms target) is blocked by a CRITICAL race condition in the nitrogen-food coupling system.

## The Bug

**Error:**
```
❌ CRITICAL: updateNitrogenFoodCoupling called multiple times in month 0.
This creates read-modify-write race conditions. Check phase execution order.
```

**Root Cause:**
`updateNitrogenFoodCoupling()` is being called TWICE per simulation step:

1. **Correctly:** By `NitrogenFoodCouplingPhase` (registered phase)
2. **Incorrectly:** By `planetaryBoundaries.ts:912` calling the function directly

**Code Location:**
```typescript
// src/simulation/planetaryBoundaries.ts:912
globalFoodProductionIndex = updateNitrogenFoodCoupling(state, deployedTechEffectiveness);
```

**Stack Trace:**
```
at updateNitrogenFoodCoupling (nitrogenFoodCoupling.ts:387:11)
at updatePlanetaryBoundaries (planetaryBoundaries.ts:912:35)
at PlanetaryBoundariesPhase.execute (PlanetaryBoundariesPhase.ts:75:5)
at PhaseOrchestrator.executeAll (PhaseOrchestrator.ts:227:30)
```

## The Fix Required

### Phase Coordination Pattern

**Current (WRONG):**
- NitrogenFoodCouplingPhase writes to state
- PlanetaryBoundariesPhase calls updateNitrogenFoodCoupling() directly

**Correct:**
- NitrogenFoodCouplingPhase writes `globalFoodProductionIndex` to state
- PlanetaryBoundariesPhase READS from state (no function call)

### Implementation Steps

1. **Add field to GameState** (src/types/game.ts):
```typescript
export interface GameState {
  // ... existing fields
  planetaryBoundariesSystem: {
    // ... existing fields
    globalFoodProductionIndex?: number;  // 0-1 index from nitrogen coupling
  };
}
```

2. **NitrogenFoodCouplingPhase writes to state** (after calling updateNitrogenFoodCoupling):
```typescript
const foodIndex = updateNitrogenFoodCoupling(state, deployedTechEffectiveness);
state.planetaryBoundariesSystem.globalFoodProductionIndex = foodIndex;
```

3. **PlanetaryBoundariesPhase reads from state** (planetaryBoundaries.ts:912):
```typescript
// REMOVE THIS LINE:
// globalFoodProductionIndex = updateNitrogenFoodCoupling(state, deployedTechEffectiveness);

// REPLACE WITH:
const globalFoodProductionIndex = state.planetaryBoundariesSystem.globalFoodProductionIndex ?? 1.0;
```

4. **Add assertion for safety** (use assertion utilities):
```typescript
import { assertStateProperty } from '@/simulation/utils/assertions';

const globalFoodProductionIndex = assertStateProperty(
  state.planetaryBoundariesSystem,
  'globalFoodProductionIndex',
  {
    location: 'updatePlanetaryBoundaries:biogeochemical',
    month: state.currentMonth
  }
);
```

### Phase Dependency

Ensure PlanetaryBoundariesPhase declares dependency on NitrogenFoodCouplingPhase:
```typescript
// src/simulation/engine/phases/PlanetaryBoundariesPhase.ts
readonly dependencies = ['nitrogen_food_coupling'];  // Add if missing
```

## Testing

After fix, verify:
1. `npm test` passes
2. `npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=60` completes without error
3. No "multiple calls" error appears

## Why This Matters

- **Defensive coding:** The race condition check (line 387) correctly detected the bug
- **Phase coordination:** Phases should communicate via state, not direct function calls
- **Performance profiling:** This blocks the CRITICAL performance budget fix workflow

## Next Actions

1. simulation-maintainer fixes the race condition
2. orchestrator re-runs profiling baseline
3. Performance optimization workflow proceeds

## Files to Modify

- `src/types/game.ts` - Add globalFoodProductionIndex field
- `src/simulation/engine/phases/NitrogenFoodCouplingPhase.ts` - Write to state
- `src/simulation/planetaryBoundaries.ts` - Read from state (remove function call)
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Add dependency (if missing)

---
**Orchestrator Status:** Awaiting fix before proceeding with performance profiling workflow
