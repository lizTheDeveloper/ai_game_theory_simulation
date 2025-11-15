# Phase Dependency System

**Added:** October 28, 2025
**Purpose:** Prevent race conditions where phases read/write state in wrong order
**Critical Fix:** BayesianMortality → CountryPopulation race condition (Oct 28, 2025)

## Overview

The simulation uses a phase-based architecture where 37+ phases execute in strict numeric order each simulation step. However, numeric ordering alone is fragile - it's easy to accidentally add a phase that overwrites another phase's results, causing silent data corruption.

The **Phase Dependency System** adds explicit dependency declarations and runtime validation to prevent these bugs.

## The Problem: Race Conditions

### Historical Bug (Oct 28, 2025)

**What happened:**
1. `BayesianMortalityResolutionPhase` (order 35.0) resolved all mortality risks and updated `state.humanPopulationSystem.population`
2. `CountryPopulationPhase` (order 36.0) recalculated country populations from scratch
3. Country phase **overwrote** the mortality-adjusted population with stale values
4. Mortality results were silently discarded - bug was hard to trace

**Why this is dangerous:**
- Silent data corruption (worst kind of bug)
- Bayesian mortality results completely lost
- Months of simulation data invalidated
- Hard to detect (no error messages, simulation kept running)

### Root Cause

Phase execution order is implicit (numeric `order` field). No enforcement that Phase B depends on Phase A's results.

## The Solution: Explicit Dependencies

### 1. Dependency Declarations

Phases can now declare dependencies on other phases:

```typescript
export class MyPhase implements SimulationPhase {
  readonly id = 'my_phase';
  readonly name = 'My Phase';
  readonly order = 36.0;

  // ✅ Declare explicit dependency
  readonly dependencies = ['bayesian_mortality_resolution'] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // This phase MUST run after bayesian_mortality_resolution
    // Runtime validation enforces this
    // ...
  }
}
```

### 2. Runtime Validation

`PhaseOrchestrator.executeAll()` validates dependencies before executing each phase:

```typescript
// Before executing phase
if (phase.dependencies && phase.dependencies.length > 0) {
  for (const depId of phase.dependencies) {
    if (!context.executedPhases.has(depId)) {
      throw new Error(
        `❌ PHASE DEPENDENCY VIOLATION: ${phase.name}\n` +
        `   Requires phase: ${depId} but it hasn't executed yet`
      );
    }
  }
}
```

**Result:** Simulation crashes immediately with clear error message instead of silently corrupting state.

### 3. Phase Execution Tracking

`PhaseContext` now tracks which phases have executed:

```typescript
export interface PhaseContext {
  month: number;
  data: Map<string, any>;
  executedPhases: Set<string>;  // ✅ New: tracks executed phases
}
```

After each phase executes, its ID is added to `context.executedPhases`.

## Assertion Utilities

Three new assertion utilities prevent ordering bugs:

### `assertPhaseDependency()`

Validates that a required phase has already executed:

```typescript
import { assertPhaseDependency } from '@/simulation/utils/assertions';

execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
  // Ensure mortality has been resolved
  assertPhaseDependency(context, 'bayesian_mortality_resolution', {
    currentPhase: this.id,
    reason: 'Must not read population before mortality adjustment',
    month: state.currentMonth
  });

  // Safe to read mortality-adjusted population
  const pop = state.humanPopulationSystem.population;
  // ...
}
```

### `assertPhaseNotExecuted()`

Validates that a potentially conflicting phase has NOT executed yet:

```typescript
import { assertPhaseNotExecuted } from '@/simulation/utils/assertions';

execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
  // Ensure no population-modifying phases ran before us
  const prohibitedPhases = ['country_population_update', 'regional_population_reconciliation'];

  for (const phaseId of prohibitedPhases) {
    assertPhaseNotExecuted(context, phaseId, {
      currentPhase: this.id,
      reason: 'Population modifications must happen AFTER mortality resolution',
      month: state.currentMonth
    });
  }

  // Safe to modify population
  state.humanPopulationSystem.population *= 0.99;
  // ...
}
```

### `assertStateFieldNotModified()`

Detects silent overwrites after authoritative phase has set a value:

```typescript
import { assertStateFieldNotModified } from '@/simulation/utils/assertions';

execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
  // Get expected value set by mortality phase
  const expectedPop = context.data.get('mortality_adjusted_population') as number;
  const currentPop = state.humanPopulationSystem.population;

  // Validate no phase silently overwrote it
  assertStateFieldNotModified(currentPop, expectedPop, {
    fieldPath: 'humanPopulationSystem.population',
    lastModifiedBy: 'bayesian_mortality_resolution',
    suspectedCulprit: 'unknown_phase',
    month: state.currentMonth
  });

  // ...
}
```

## Best Practices

### When to Declare Dependencies

**Declare a dependency when:**
1. Your phase READS state modified by another phase
2. Your phase must run AFTER another phase completes
3. Execution order matters for correctness (not just performance)

**Example:** Any phase that reads population AFTER mortality resolution should declare:
```typescript
readonly dependencies = ['bayesian_mortality_resolution'];
```

### When to Use Assertions

**Use `assertPhaseDependency()`:**
- At the start of phase execution
- When reading state that must be set by earlier phase
- When order is critical for correctness

**Use `assertPhaseNotExecuted()`:**
- In authoritative phases (like BayesianMortalityResolutionPhase)
- To prevent future phases from running before you
- When you're the source of truth for a state field

**Use `assertStateFieldNotModified()`:**
- At the end of a simulation step
- To validate critical state fields weren't overwritten
- In validation/integrity check phases

### Naming Conventions

Phase IDs should be:
- `snake_case` (not camelCase)
- Descriptive and unique
- Stable (don't change after release)

**Good:**
```typescript
readonly id = 'bayesian_mortality_resolution';
readonly id = 'climate_tipping_points';
readonly id = 'ai_capability_growth';
```

**Bad:**
```typescript
readonly id = 'phase1';           // Not descriptive
readonly id = 'BayesianMortality'; // Wrong case
readonly id = 'mortality';         // Too generic
```

## Example: BayesianMortalityResolutionPhase

Full implementation showing safeguards:

```typescript
/**
 * Bayesian Mortality Resolution Phase
 *
 * ⚠️ CRITICAL: This phase is the AUTHORITATIVE source for population after mortality.
 * NO phase should modify humanPopulationSystem.population after this phase runs.
 */
export class BayesianMortalityResolutionPhase implements SimulationPhase {
  readonly id = 'bayesian_mortality_resolution';
  readonly name = 'Bayesian Mortality Resolution';
  readonly order = 35.0;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events = [];

    // SAFEGUARD 1: Check no population-modifying phases ran before us
    const prohibitedPhases = [
      'country_population_update',  // Deleted Oct 28, 2025
      'regional_population_reconciliation',
      'population_correction'
    ];

    for (const phaseId of prohibitedPhases) {
      assertPhaseNotExecuted(context, phaseId, {
        currentPhase: this.id,
        reason: 'Population modifications must happen BEFORE mortality resolution',
        month: state.currentMonth
      });
    }

    // Resolve mortality risks
    const result = resolveMortality(state, rng);

    // SAFEGUARD 2: Store authoritative population value
    const mortalityAdjustedPopulation = state.humanPopulationSystem.population;
    context.data.set('mortality_adjusted_population', mortalityAdjustedPopulation);
    context.data.set('bayesian_mortality_resolved', true);

    return { events };
  }
}
```

## Testing

### Unit Tests

Run comprehensive tests:

```bash
npx tsx scripts/testPhaseDependencies.ts
```

**Tests validate:**
1. Basic dependency execution order
2. Dependency violation detection (wrong order)
3. Context tracks executed phases correctly
4. `assertPhaseNotExecuted()` utility works
5. `assertPhaseDependency()` utility works
6. Mortality → Population race condition detection (THE BUG)
7. Successful mortality → validation (no overwrite)

### Monte Carlo Validation

After adding dependencies, validate with Monte Carlo runs:

```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

Check logs for dependency violations:
```bash
grep "DEPENDENCY VIOLATION\|ORDERING VIOLATION\|OVERWRITE DETECTED" logs/mc_*.log
```

## Migration Guide

### Adding Dependencies to Existing Phases

1. **Identify dependencies:** What phases must run before yours?
2. **Declare dependencies:** Add `readonly dependencies` array
3. **Add assertions:** Use assertion utilities to validate
4. **Test:** Run unit tests and Monte Carlo validation
5. **Document:** Add comments explaining why dependency exists

**Example migration:**

```typescript
// BEFORE (implicit dependency)
export class RegionalPopulationPhase implements SimulationPhase {
  readonly id = 'regional_population_update';
  readonly order = 36.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Implicitly depends on mortality resolution
    // Bug risk: might run before mortality if order changes
    // ...
  }
}

// AFTER (explicit dependency)
export class RegionalPopulationPhase implements SimulationPhase {
  readonly id = 'regional_population_update';
  readonly order = 36.0;
  readonly dependencies = ['bayesian_mortality_resolution'] as const; // ✅ Explicit

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Runtime validation ensures mortality has resolved
    assertPhaseDependency(context, 'bayesian_mortality_resolution', {
      currentPhase: this.id,
      reason: 'Must read mortality-adjusted population',
      month: state.currentMonth
    });
    // ...
  }
}
```

## Implementation Details

### Files Modified (Oct 28, 2025)

**Core system:**
- `src/simulation/engine/PhaseOrchestrator.ts` - Added dependency validation
- `src/simulation/utils/assertions.ts` - Added 3 phase assertion utilities
- `src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` - Added safeguards

**Testing:**
- `scripts/testPhaseDependencies.ts` - Comprehensive test suite (7 tests)

**Documentation:**
- `docs/wiki/mechanics/phase-dependencies.md` - This document
- `devlogs/phase-dependency-race-condition-fix_20251028.md` - Implementation log

### Type Definitions

```typescript
export interface SimulationPhase {
  readonly id: string;
  readonly name: string;
  readonly order: number;

  // ✅ New: Optional dependency declarations
  readonly dependencies?: readonly string[];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult;
}

export interface PhaseContext {
  month: number;
  data: Map<string, any>;

  // ✅ New: Tracks which phases have executed this step
  executedPhases: Set<string>;
}
```

## Critical Constraint: No Backwards Dependencies

**Added:** November 15, 2025 (commit afbffc0)

**CRITICAL RULE:** A phase at order X **CANNOT** depend on a phase at order Y where Y > X.

### Why Backwards Dependencies Are Invalid

Phase dependencies represent **read-after-write** relationships. If Phase A (order 10.0) declares a dependency on Phase B (order 20.0), this creates a logical impossibility:

- Phase A needs Phase B's output
- But Phase A executes BEFORE Phase B (10.0 < 20.0)
- Phase B's data doesn't exist when Phase A runs

**Result:** Runtime dependency violation error, simulation crashes.

### Historical Bug (November 15, 2025)

**Context:** Commit eda20e125 added readonly dependencies to 26 phases without validating order constraints, introducing 10+ backwards dependencies that blocked Monte Carlo validation.

**Examples of invalid backwards dependencies:**
- `GovernmentActionsPhase` (9.0) → `economic-system` (31.0) ❌
- `ExtremeWeatherEventsPhase` (15.2) → `climate_system` (34.0) ❌
- `TechTreePhase` (12.5) → `economic-system` (31.0) ❌
- `CrisisPointsPhase` (23.0) → `crisis-detection` (36.0) ❌

**Why these occurred:** Phases were analyzing which state they *read* and declaring dependencies without considering execution order. Reading state from "previous step" is valid; declaring dependency on future phase is not.

### Valid vs Invalid Dependency Patterns

**✅ VALID - Forward dependency (reads from earlier phase):**
```typescript
export class MyPhase implements SimulationPhase {
  readonly order = 36.0;
  readonly dependencies = ['bayesian_mortality_resolution']; // Order 35.0 - OK!

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Can safely read mortality-adjusted population
    const pop = state.humanPopulationSystem.population;
    // ...
  }
}
```

**❌ INVALID - Backwards dependency (reads from later phase):**
```typescript
export class MyPhase implements SimulationPhase {
  readonly order = 15.2;
  readonly dependencies = ['climate_system']; // Order 34.0 - VIOLATES ORDER!

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // climate_system hasn't run yet - this will crash!
    // ...
  }
}
```

**✅ CORRECT - Read from previous step (no dependency):**
```typescript
export class MyPhase implements SimulationPhase {
  readonly order = 15.2;
  readonly dependencies: string[] = []; // No dependencies - reads previous step

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Read climate state from PREVIOUS simulation step
    // climate_system (34.0) wrote this last step - it's already in state
    const temp = state.resourceEconomy.co2.temperatureAnomaly;
    // ...
  }
}
```

### Phase ID Naming Conventions

**CRITICAL:** Phase IDs must use **underscores**, not hyphens, to match phase class naming.

**Mismatch Bug (Nov 15, 2025):** `climate_system` phase was referenced as `climate-system` in dependencies, causing runtime errors.

**✅ CORRECT:**
```typescript
readonly id = 'climate_system';        // Matches ClimateSystemPhase
readonly dependencies = ['ai_lifecycle']; // Matches AILifecyclePhase
```

**❌ WRONG:**
```typescript
readonly id = 'climate-system';        // Doesn't match class name
readonly dependencies = ['climate-system']; // Won't find phase at runtime
```

### Validation Checklist

When declaring dependencies:

1. ✅ **Order constraint:** Is dependency phase's order < current phase's order?
2. ✅ **ID accuracy:** Does dependency phase ID actually exist? (Check phase files)
3. ✅ **Underscore convention:** Using `snake_case` not `kebab-case`?
4. ✅ **Real dependency:** Does phase actually *write* the state you're reading?
5. ✅ **Same-step read:** Or are you reading from previous step's state? (No dependency needed)

### Non-Existent Phase IDs

**Also invalid:** Declaring dependencies on phases that don't exist.

**Bug (Nov 15, 2025):** Two phases declared dependency on `technology-deployment`, which doesn't exist in the codebase.

**Fix:**
```typescript
// ❌ WRONG - Phase doesn't exist
readonly dependencies = ['technology-deployment'];

// ✅ CORRECT - Remove invalid dependency
readonly dependencies: string[] = [];
```

**Validation:** Grep for phase ID before declaring dependency:
```bash
grep -r "readonly id = 'technology-deployment'" src/simulation/engine/phases/
```

If no results, the phase doesn't exist.

## Future Work

### Potential Enhancements

1. **Dependency graph visualization:** Generate diagrams showing phase dependencies
2. **Circular dependency detection:** Validate at registration time (not just runtime)
3. **Performance optimization:** Cache dependency validation results
4. **Automatic ordering:** Topological sort based on dependencies (replace manual order numbers)
5. **Backwards dependency detection:** Fail at phase registration if dependency.order > phase.order (Nov 15, 2025)
6. **Phase ID existence check:** Validate dependency IDs exist before execution (Nov 15, 2025)

### Known Limitations

- Dependencies only validated at runtime (not compile-time)
- No detection of indirect circular dependencies (A → B → C → A)
- Manual order numbers still required (dependencies don't auto-order phases)
- No way to declare "this phase must NOT run after X" (only "must run after X")
- **No backwards dependency detection at registration time** (Nov 15, 2025 - causes runtime crashes)
- **No validation that dependency phase IDs exist** (Nov 15, 2025 - typos cause crashes)

## Related Documentation

- [Simulation Loop](./simulation-loop.md) - Phase-based execution overview
- [Engine Architecture](../technical/engine.md) - Core simulation design
- [Refactoring Status](../technical/refactoring-status.md) - Phase migration progress
- [Assertion Utilities](../../src/simulation/utils/assertions.ts) - Full API reference

## References

- **Architecture Review:** `reviews/integration-architecture-review_20251028.md`
- **Historical Bug:** CountryPopulationPhase deletion (Oct 28, 2025)
- **Test Suite:** `scripts/testPhaseDependencies.ts`
- **DevLog:** `devlogs/phase-dependency-race-condition-fix_20251028.md`
