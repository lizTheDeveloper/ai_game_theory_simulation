# Determinism Bug Investigation - Nov 24, 2025

## Problem Statement
Non-determinism detected at Month 2 in comprehensive determinism validation:
- **Capability:** DETERMINISTIC (CV=0.0000%, identical across runs)
- **Alignment:** NON-DETERMINISTIC (varies from 12.89 to 14.08 across runs with same seed)
- **Agent count:** Varies (22 in Run 1, 23 in Runs 2+)

## Key Observation
**Separate processes produce IDENTICAL results:**
```
Process 1: 22 agents, alignment 12.8955
Process 2: 22 agents, alignment 12.8955
Process 3: 22 agents, alignment 12.8955
Process 4: 22 agents, alignment 12.8955
```

**Same process, multiple runs produce DIFFERENT results:**
```
Run 1: 22 agents, alignment 12.8955
Run 2: 23 agents, alignment 14.0806  <- Different!
Run 3: 23 agents, alignment 14.0806  <- Same as Run 2
```

This pattern indicates module-level state persisting between runs within the same Node.js process.

## Fixes Applied

### 1. Async Function Not Awaited (CRITICAL)
**File:** `src/simulation/llm/integration.ts`
**Issue:** `checkAndUpdateAgentWeights` was an async function called without `await`, causing promise resolution at indeterminate times.
**Fix:** Made function synchronous, using fallback weights for deterministic simulation.

### 2. Global WUE Variable
**File:** `src/simulation/aiInfrastructureResources.ts`
**Issue:** `let globalWUE = 1.8` was mutated during simulation and persisted between runs.
**Fix:** Added `resetGlobalWUE()` function.

### 3. Module State Reset Helper
**File:** `src/simulation/utils/resetModuleState.ts`
**New file:** Centralizes all module-level state resets for Monte Carlo runs.

## Remaining Issue
Despite fixing the above, Run 1 still differs from Runs 2+. This suggests:
1. Additional module-level state not yet identified
2. Something in the module import/initialization sequence
3. Possible interaction with Node.js module caching

### Investigated and Ruled Out
- `deterministicRng` singleton (cleared)
- `governmentActionRegistry` singleton (cleared)
- `validationContext` (cleared)
- Phase instance variables (new instances created per engine)
- Event ID counters (don't affect simulation logic)
- Population provider cache (created per use, not singleton)

### Areas Needing Investigation
1. **Tech Tree State:** Check for persistent state in `techTree/engine.ts`
2. **Defensive AI:** Multiple `deterministicRandom()` calls - verify proper RNG handling
3. **Government Actions:** Check module-level state in action files
4. **Node.js Module Cache:** Consider if full module cache reset is needed

## Workaround
For Monte Carlo runs requiring determinism within a single process:
1. Call `resetModuleState()` before each run
2. If issue persists, run each simulation in a separate process

## Test Commands
```bash
# Quick test (same process)
npx tsx scripts/quick_determinism_test.ts

# Single run test (separate processes - deterministic)
for i in 1 2 3 4; do npx tsx scripts/single_run_test.ts; done

# Full validation
npx tsx scripts/comprehensiveDeterminismValidation.ts
```

## Priority
**CRITICAL** - Blocks Monte Carlo validity for runs in same process.
**Workaround available** - Separate processes are deterministic.
