# Phase 3 Scenario Runner Fix

**Date:** November 10, 2025
**Fixed by:** Roy (simulation-maintainer)

## Problem

Phase 3 scenario batch runner (`scripts/runPhase3Scenarios.ts`) was crashing immediately after initialization with:

```
Cannot read properties of undefined (reading 'set')
```

**Error location:** Line 157 in `applyTechDeployment()` function
**All 9 scenarios failed identically**

## Root Cause

The `applyTechDeployment()` function was using an **obsolete tech tree API**:

```typescript
// ❌ OLD API (doesn't exist)
state.techTreeState.deployedTech.set(tech.id, {...})
```

The current `TechTreeState` interface (in `src/simulation/techTree/engine.ts`) does **not** have a `deployedTech` Map. Instead, it uses:

```typescript
// ✅ CURRENT API
regionalDeployment: Record<string, RegionalTechDeployment[]>
```

## Fixes

### Fix 1: Tech Tree API (Line 146-182)

Updated `applyTechDeployment()` in `scripts/runPhase3Scenarios.ts` to use the correct tech tree API:

```typescript
function applyTechDeployment(state: GameState, strategy, rng) {
  const technologies = getAllTech();

  if (strategy.mode === 'immediate') {
    const deploymentLevel = strategy.deploymentLevel ?? 1.0;

    // Initialize global deployment array if needed
    if (!state.techTreeState.regionalDeployment['global']) {
      state.techTreeState.regionalDeployment['global'] = [];
    }

    for (const tech of technologies) {
      // Unlock tech if not already unlocked
      if (!state.techTreeState.unlockedTech.includes(tech.id)) {
        state.techTreeState.unlockedTech.push(tech.id);
        state.techTreeState.techUnlockedCount++;
      }

      // Add to regional deployment (global region)
      state.techTreeState.regionalDeployment['global'].push({
        techId: tech.id,
        region: 'global',
        deploymentLevel,
        monthlyInvestment: 0,
        totalInvested: tech.deploymentCost * deploymentLevel,
        deployedBy: ['scenario'],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
    }
  }
}
```

### Fix 2: Result Extraction (Line 219-220)

The `SimulationEngine.run()` return type changed. It now returns an object with a `summary` field:

```typescript
// ❌ OLD (doesn't exist)
result.outcome
result.monthsSimulated

// ✅ CURRENT
result.summary.finalOutcome
result.summary.totalMonths
```

Updated `runScenario()` function:

```typescript
return {
  scenarioId,
  seed,
  outcome: result.summary.finalOutcome,      // Was: result.outcome
  monthsSimulated: result.summary.totalMonths,  // Was: result.monthsSimulated
  spiralActivation: { ...activeSpirals },
  finalQoL: extractQoLMetrics(result.finalState),
  finalEnvironment: extractEnvironmentMetrics(result.finalState),
  finalPopulation: result.finalState.humanPopulationSystem.population,
  boundariesBreached: [],
};
```

## Validation

**Test script:** `scripts/testPhase3Fix.ts`
- Single scenario: `climate-first`
- Seed: 42
- Duration: 12 months

**Result:** ✅ PASSED
- No crashes
- Simulation completed successfully
- Outcome: dystopia (population-based classification)
- Months: 2 (ended early due to dystopia conditions)
- Final population: 7.32B
- Type checking passes

## Files Modified

1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/runPhase3Scenarios.ts`
   - **Fix 1:** `applyTechDeployment()` function (lines 146-182) - Use regionalDeployment API
   - **Fix 2:** `runScenario()` return statement (lines 219-220) - Use result.summary fields
   - **Debug:** Added error logging for missing summary (line 217-219)

2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/testPhase3Fix.ts`
   - Created standalone test script for validation

## Next Steps

- ✅ Single scenario test passed (climate-first, seed 42, 12 months)
- ✅ TypeScript type checking passes
- ⏳ Run full batch: 9 scenarios × 10 Monte Carlo runs = 90 simulations
- ⏳ Validate spiral activation distributions
- ⏳ Analyze which government priorities activate which spirals

## Technical Notes

**Why this happened:** Two independent API changes were not synchronized:

1. Tech tree system refactored from Maps to regional deployment records (Oct 2025)
2. SimulationEngine.run() return type restructured to include summary object (date unknown)

**Defensive coding:**
- ❌ No assertions needed for Fix 1 (initialization code constructs valid state)
- ✅ Added debug logging for Fix 2 (helps catch future API changes)

**API consistency:** This highlights the importance of:
1. Single source of truth for tech deployment (use `src/simulation/techTree/engine.ts`)
2. TypeScript return type documentation for SimulationEngine.run()
3. Not duplicating initialization logic in test scripts (consider shared utilities)

**Performance note:** Full batch (90 simulations @ 120 months each) may take 30-60 minutes depending on hardware. Consider running overnight or with reduced maxMonths for initial validation.
