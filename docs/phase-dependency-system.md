# Phase Dependency System

**Date:** November 6, 2025
**Status:** Partially Implemented
**Related Tasks:** WEEK 3 Task 8 (ARCH-CRITICAL-5)

## Overview

The Phase Dependency System allows phases to declare explicit execution dependencies, preventing race conditions and silent data corruption. The system validates dependencies at runtime and provides clear error messages when violations occur.

## Current Implementation Status

### ✅ Implemented Features

1. **Dependency Declaration Schema** (PhaseOrchestrator.ts:69)
   ```typescript
   interface SimulationPhase {
     readonly dependencies?: readonly string[];
   }
   ```

2. **Runtime Dependency Validation** (PhaseOrchestrator.ts:169-191)
   - Validates that dependency phases have executed before dependent phase
   - Throws descriptive error on violation
   - Includes phase IDs, order numbers, and executed phases list

3. **Phase Execution Tracking** (PhaseOrchestrator.ts:225)
   - `PhaseContext.executedPhases: Set<string>` tracks executed phases
   - Updated after each phase completes

### ⚠️ Missing Features (TODO)

1. **Topological Sort**
   - Current: Simple numeric sort by `order` field
   - Needed: Topological sort respecting dependency graph
   - Benefit: Automatic ordering, no manual decimal numbers

2. **Circular Dependency Detection**
   - Current: None (will hang or throw at runtime)
   - Needed: Detect cycles at initialization
   - Benefit: Fail-fast with clear cycle path

3. **Dependency Coverage**
   - Current: ~0 phases declare dependencies
   - Target: 30 critical phases with dependencies
   - Benefit: Prevent race conditions like CountryPopulation → BayesianMortality bug

## Usage Guide

### Declaring Dependencies

```typescript
export class MyPhase implements SimulationPhase {
  readonly id = 'my_phase';
  readonly name = 'My Phase';
  readonly order = 20.0;

  // Declare dependencies: these phases MUST run before this phase
  readonly dependencies = [
    'bayesian_mortality_resolution',
    'climate_impact_cascade'
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Safe to read state modified by dependency phases
    const populationAfterMortality = state.humanPopulationSystem.population;

    // Your phase logic here...

    return { events: [] };
  }
}
```

### Dependency Patterns

#### Pattern 1: Sequential Data Flow
```typescript
// Phase A produces data, Phase B consumes it
PhaseA: { id: 'phase_a', order: 10.0, dependencies: [] }
PhaseB: { id: 'phase_b', order: 20.0, dependencies: ['phase_a'] }
```

#### Pattern 2: Multiple Dependencies
```typescript
// Phase C needs both A and B to complete first
PhaseC: {
  id: 'phase_c',
  order: 30.0,
  dependencies: ['phase_a', 'phase_b']
}
```

#### Pattern 3: Authoritative Data Source
```typescript
// BayesianMortality is authoritative for population after mortality
// Any phase modifying population MUST run before OR depend on it
PopulationUpdatePhase: {
  dependencies: ['bayesian_mortality_resolution'],
  // This ensures we read mortality-adjusted population, not overwrite it
}
```

## Critical Phase Dependencies (Target: 30 phases)

### Dependency Group 1: Climate → Mortality
**Rationale:** Mortality depends on climate state (temperature, food security)

```typescript
// Climate phases produce temperature, CO2, food security
ClimateImpactCascadePhase: { id: 'climate_impact_cascade', dependencies: [] }
ExtremeWeatherEventsPhase: { id: 'extreme_weather', dependencies: ['climate_impact_cascade'] }
FoodSecurityDegradationPhase: { id: 'food_security', dependencies: ['climate_impact_cascade'] }

// Mortality phases consume climate state
MortalityStabilizersPhase: {
  id: 'mortality_stabilizers',
  dependencies: ['climate_impact_cascade', 'food_security']
}
BayesianMortalityResolutionPhase: {
  id: 'bayesian_mortality_resolution',
  dependencies: ['mortality_stabilizers', 'food_security']
}
```

### Dependency Group 2: AI Capabilities → Alignment
**Rationale:** Alignment phases need to know current AI capabilities

```typescript
// Capability phases update AI agent capability levels
AIAgentActionsPhase: { id: 'ai_agent_actions', dependencies: [] }
ComputeGrowthPhase: { id: 'compute_growth', dependencies: [] }

// Alignment phases consume capability state
AlignmentDynamicsPhase: {
  id: 'alignment_dynamics',
  dependencies: ['ai_agent_actions', 'compute_growth']
}
GamingDetectionPhase: {
  id: 'gaming_detection',
  dependencies: ['alignment_dynamics']
}
```

### Dependency Group 3: Environmental → Cascades
**Rationale:** Cascade phases compound environmental effects

```typescript
// Base environmental phases
OceanAcidificationPhase: { id: 'ocean_acidification', dependencies: [] }
NovelEntitiesPhase: { id: 'novel_entities', dependencies: [] }

// Cascade phases compound effects
EnvironmentalFeedbackPhase: {
  id: 'environmental_feedback',
  dependencies: ['ocean_acidification', 'novel_entities']
}
```

### Dependency Group 4: Mortality → Population
**Rationale:** Population updates must read mortality-adjusted values

```typescript
// Mortality resolution is authoritative for population
BayesianMortalityResolutionPhase: {
  id: 'bayesian_mortality_resolution',
  order: 35.0,
  dependencies: ['mortality_stabilizers', 'food_security']
}

// Population phases MUST depend on mortality
HumanPopulationPhase: {
  id: 'human_population',
  order: 36.0,  // Must be AFTER mortality
  dependencies: ['bayesian_mortality_resolution']
}

// Regional updates also depend on mortality
RegionalPopulationUpdatePhase: {
  id: 'regional_population_update',
  order: 37.0,
  dependencies: ['bayesian_mortality_resolution', 'human_population']
}
```

### Dependency Group 5: Economic → Social Stability
**Rationale:** Social stability depends on economic conditions

```typescript
// Economic phases update GDP, unemployment
EconomicTransitionPhase: { id: 'economic_transition', dependencies: [] }
UnemploymentPhase: { id: 'unemployment', dependencies: ['economic_transition'] }

// Social stability consumes economic state
SocialStabilityPhase: {
  id: 'social_stability',
  dependencies: ['economic_transition', 'unemployment']
}
```

## Runtime Behavior

### Successful Execution
```
[Phase 1.0] Climate Impact Cascade (climate_impact_cascade)
  → Executes, adds to executedPhases set
[Phase 2.0] Food Security Degradation (food_security)
  → Checks: climate_impact_cascade in executedPhases? ✅ Yes
  → Executes successfully
[Phase 3.0] Mortality Stabilizers (mortality_stabilizers)
  → Checks: climate_impact_cascade, food_security in executedPhases? ✅ Yes
  → Executes successfully
```

### Dependency Violation
```
[Phase 1.0] Food Security Degradation (food_security)
  → Checks: climate_impact_cascade in executedPhases? ❌ No
  → ❌ PHASE DEPENDENCY VIOLATION: Food Security Degradation (food_security)
     Requires phase: climate_impact_cascade (order: 0.5)
     Current phase order: 1.0
     Month: 12

     This phase declares a dependency on 'climate_impact_cascade' but that phase
     has not executed yet this step. Check phase order numbers or remove dependency.

     Executed phases so far: []
```

## Future Enhancements

### Enhancement 1: Topological Sort (Priority: HIGH)

**Current Problem:**
- Phases use manual decimal ordering (1.0, 2.5, 34.0, 35.0)
- Fragile: Must manually ensure dependency order matches numeric order
- Error-prone: Easy to add phase with wrong order number

**Solution:**
Implement topological sort using Kahn's algorithm:

```typescript
private topologicalSort(phases: SimulationPhase[]): SimulationPhase[] {
  // Build adjacency list and in-degree map
  const graph = new Map<string, string[]>(); // phase ID → dependent phase IDs
  const inDegree = new Map<string, number>(); // phase ID → count of dependencies

  for (const phase of phases) {
    inDegree.set(phase.id, phase.dependencies?.length ?? 0);

    // Build reverse edges (phase → dependents)
    for (const dep of phase.dependencies ?? []) {
      if (!graph.has(dep)) graph.set(dep, []);
      graph.get(dep)!.push(phase.id);
    }
  }

  // Kahn's algorithm
  const queue: SimulationPhase[] = [];
  const sorted: SimulationPhase[] = [];

  // Start with phases that have no dependencies
  for (const phase of phases) {
    if (inDegree.get(phase.id) === 0) {
      queue.push(phase);
    }
  }

  while (queue.length > 0) {
    const phase = queue.shift()!;
    sorted.push(phase);

    // Reduce in-degree for dependents
    for (const dependentId of graph.get(phase.id) ?? []) {
      const dependent = phases.find(p => p.id === dependentId)!;
      const newDegree = inDegree.get(dependentId)! - 1;
      inDegree.set(dependentId, newDegree);

      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // Check for cycles
  if (sorted.length < phases.length) {
    // Cycle detected! Find cycle path for error message
    const cycle = this.findCycle(phases, graph);
    throw new Error(
      `❌ CIRCULAR DEPENDENCY DETECTED\n` +
      `   Cycle path: ${cycle.join(' → ')}\n` +
      `\n` +
      `   Remove one dependency to break the cycle.`
    );
  }

  return sorted;
}
```

**Benefits:**
- Automatic ordering (no manual decimal numbers)
- Cycle detection at initialization (fail-fast)
- Clear error messages with cycle path
- Complexity: O(V + E) where V=phases, E=dependencies (very fast)

### Enhancement 2: Dependency Graph Visualization

**Benefit:** Help developers understand phase interactions

```bash
# Command to visualize dependencies
npm run phase-deps

# Output (ASCII art):
climate_impact_cascade (0.5)
├─→ food_security (1.0)
│   └─→ mortality_stabilizers (2.0)
│       └─→ bayesian_mortality_resolution (35.0)
│           ├─→ human_population (36.0)
│           └─→ regional_population_update (37.0)
└─→ extreme_weather (1.5)
```

### Enhancement 3: Dependency Linting

**Benefit:** Catch common mistakes at compile time

```typescript
// Lint rule: Dependency phase must have lower order number
if (phase.dependencies) {
  for (const depId of phase.dependencies) {
    const depPhase = phases.find(p => p.id === depId);
    if (depPhase && depPhase.order >= phase.order) {
      console.warn(
        `⚠️ WARNING: ${phase.id} (order ${phase.order}) depends on ` +
        `${depId} (order ${depPhase.order}) but has same or lower order number.`
      );
    }
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('Phase Dependency System', () => {
  test('validates dependencies exist', () => {
    const orchestrator = new PhaseOrchestrator();
    orchestrator.registerPhase({
      id: 'phase_a',
      dependencies: ['nonexistent_phase'], // Should fail
      execute: () => ({ events: [] })
    });

    expect(() => orchestrator.executeAll(state, rng)).toThrow('PHASE DEPENDENCY VIOLATION');
  });

  test('detects circular dependencies', () => {
    // Phase A depends on B, B depends on C, C depends on A
    orchestrator.registerPhases([
      { id: 'phase_a', dependencies: ['phase_b'] },
      { id: 'phase_b', dependencies: ['phase_c'] },
      { id: 'phase_c', dependencies: ['phase_a'] }
    ]);

    expect(() => orchestrator.topologicalSort()).toThrow('CIRCULAR DEPENDENCY');
  });

  test('topological sort respects dependencies', () => {
    orchestrator.registerPhases([
      { id: 'phase_c', order: 1.0, dependencies: ['phase_a', 'phase_b'] },
      { id: 'phase_b', order: 2.0, dependencies: ['phase_a'] },
      { id: 'phase_a', order: 3.0, dependencies: [] }
    ]);

    const sorted = orchestrator.topologicalSort();
    expect(sorted.map(p => p.id)).toEqual(['phase_a', 'phase_b', 'phase_c']);
  });
});
```

### Integration Tests

```typescript
describe('Phase Dependency Integration', () => {
  test('Monte Carlo runs complete with dependencies', () => {
    // Run 10 Monte Carlo simulations with all dependencies declared
    for (let i = 0; i < 10; i++) {
      const result = runSimulation({ seed: i, monthsToSimulate: 120 });
      expect(result.outcome).toBeDefined();
      // Should complete without dependency violations
    }
  });
});
```

## Migration Guide

### Step 1: Audit Phase Interactions
For each phase, identify:
1. What state does it READ?
2. What state does it WRITE?
3. Which phases produce the state it reads?

### Step 2: Declare Dependencies
Add `readonly dependencies` field to phase definition:

```typescript
// Before
export class MyPhase implements SimulationPhase {
  readonly id = 'my_phase';
  readonly order = 20.0;
}

// After
export class MyPhase implements SimulationPhase {
  readonly id = 'my_phase';
  readonly order = 20.0;
  readonly dependencies = ['dependency_phase_1', 'dependency_phase_2'];
}
```

### Step 3: Test
Run Monte Carlo simulation:
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_deps_test.log 2>&1 &
```

If dependency violations occur, either:
- Adjust order numbers to match dependencies
- Remove incorrect dependencies
- Add missing dependencies

### Step 4: Remove Manual Ordering (Future)
Once topological sort is implemented:
1. Remove `order` field (or make it optional)
2. Let topological sort determine execution order
3. Only use `order` for tie-breaking within same dependency level

## Known Issues

### Issue 1: No Circular Dependency Detection
**Impact:** Phases can declare circular dependencies, causing infinite loop or runtime error
**Workaround:** Manually verify dependency graph is acyclic
**Fix:** Implement topological sort with cycle detection (Enhancement 1)

### Issue 2: Manual Order Synchronization
**Impact:** Easy to add phase with wrong order number relative to dependencies
**Workaround:** Use phase dependency linting (Enhancement 3)
**Fix:** Implement topological sort (Enhancement 1)

### Issue 3: Limited Coverage
**Impact:** Only ~0 phases declare dependencies, leaving race conditions undetected
**Workaround:** None
**Fix:** Declare dependencies for 30 critical phases (WEEK 3 Task 8 goal)

## Research References

1. **Topological Sort:** Kahn's Algorithm (1962), O(V + E) complexity
2. **Unity ECS:** System Update Order (Entities Package documentation)
3. **Game Engine Patterns:** Entity Component System architectures
4. **Cycle Detection:** DFS-based or Kahn's algorithm (equivalent)

## Changelog

**November 6, 2025:**
- Initial documentation
- Dependency schema already implemented (Oct 28, 2025)
- Runtime validation already implemented (Oct 28, 2025)
- Identified 30 critical phases for dependency declarations
- Topological sort and circular detection marked as TODO

**October 28, 2025:**
- Dependency schema added to `SimulationPhase` interface
- Runtime validation implemented in `PhaseOrchestrator.executeAll()`
- Fixed CountryPopulation → BayesianMortality race condition bug

---

**Status:** System partially complete, ready for phase 2 (declaring dependencies for 30 critical phases)
**Next Steps:** Implement topological sort, declare dependencies, add integration tests
