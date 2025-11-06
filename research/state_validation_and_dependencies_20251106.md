# State Validation & Phase Dependency Systems Research

**Date:** November 6, 2025
**Researcher:** Orchestrator (Initial Research Phase)
**Status:** READY FOR VALIDATION
**Target:** WEEK 3 Implementation (Tasks 7 & 8)

## Executive Summary

This research document synthesizes best practices from scientific computing, climate modeling, and game engine architectures to inform the design of:
1. **State Validation Framework**: Assertion-based validation preventing NaN propagation and silent failures
2. **Phase Dependency System**: Explicit dependency declarations with topological ordering

### Key Findings

**State Validation:**
- Modern scientific simulations use comprehensive V&V (Verification & Validation) frameworks
- Model Input Verification (MIV) is critical for preventing invalid data propagation
- NaN propagation can be exploited for sparsity detection (novel 2024-2025 research)
- Assertion patterns should validate at mutation points, not periodically

**Phase Dependencies:**
- ECS (Entity Component System) architectures use explicit dependency graphs
- Topological sort provides O(V+E) ordering for DAGs (Directed Acyclic Graphs)
- Unity/CESM use system groups and update ordering
- Runtime validation at startup prevents circular dependencies

### Implementation Recommendations

**For Our 116-Phase System:**
1. Add assertions at ALL 590 mutation points (100% coverage in critical paths)
2. Use topological sort for phase ordering (O(116 + edges) complexity)
3. Declare dependencies using simple schema: `dependencies: string[]`
4. Validate dependency graph at game initialization (fail-fast on cycles)
5. Domain-specific validators for mortality, climate, AI, economic metrics

---

## Part 1: State Validation in Scientific Simulations

### 1.1 Verification & Validation Framework (2024-2025)

**Source:** NAFEMS 2024, Cambridge Core, Emerald Insight

**Core Principle:**
Modern scientific simulations require comprehensive frameworks covering:
1. Identification of all uncertainty sources
2. Characterization of model input uncertainties
3. Elimination/estimation of code and solution verification errors
4. Propagation of input uncertainties through model
5. Quantification of model form uncertainty
6. Estimation of uncertainty from extrapolation

**Application to Our System:**
- Our 590 state mutations are uncertainty injection points
- Each mutation must validate inputs BEFORE modification
- Assertions act as "verification barriers" preventing invalid propagation

### 1.2 Model Input Verification (2024-2025)

**Source:** Taylor & Francis Online, "Model input verification of large scale simulations" (2025)

**Problem Statement:**
"Invalid values, missing data, and format inconsistencies can cause crashes or result distortions, compromising the findings."

**MIV Methodology:**
1. **Pre-execution validation**: Check all inputs before simulation start
2. **Runtime validation**: Validate at each state mutation point
3. **Fail-fast principle**: Crash immediately on invalid data (don't continue with corrupted state)

**Application to Our System:**
- Our current 410 assertions follow MIV principles
- Need 180 additional assertions to reach 100% coverage
- Each assertion should include:
  - Location context (phase name, function)
  - Expected valid range (domain-specific)
  - Current month/step (for debugging)
  - Input values that led to invalid state

### 1.3 NaN Propagation Characteristics (2024-2025)

**Source:** arXiv 2507.23186 "NaN-Propagation: A Novel Method for Sparsity Detection" (2024)

**Key Insight:**
"Not-a-Number (NaN) values are universally propagated through floating-point numerical computations; colloquially, they tend to 'contaminate' any calculation that is given a NaN input."

**IEEE 754 Behavior:**
- `NaN + x = NaN`
- `NaN * x = NaN`
- `NaN < x = false` (comparison returns false!)
- Conditional logic breaks: `if (value > threshold)` silently fails

**Detection Strategies:**
1. **Immediate detection**: Assert at mutation point (our current approach)
2. **Backward tracing**: Add asserts along code paths to find origin
3. **Exception-based**: Some environments throw on NaN generation (not JavaScript)

**Application to Our System:**
- JavaScript doesn't throw on NaN, so assertions are CRITICAL
- Our `assertFinite()` catches NaN at source, not after propagation
- Domain validators (mortality, temperature) catch physically implausible NaN sources

### 1.4 Climate Model Validation Patterns (CESM, E3SM)

**Source:** Journal of Climate (2024), ALCF, Climate Modeling Science

**CESM Validation Approach:**
"Scientific validation of CESM consists of a multi-decadal model run of the given component set at the target resolution, followed by scientific review of the model output diagnostics."

**E3SM Reproducibility Framework:**
"A short simulation ensemble-based statistical testing framework indicates that a frozen model configuration of E3SM was reproducible after many months of improvements to its support software infrastructure."

**Key Practices:**
1. **Ensemble-based validation**: Run multiple simulations with same config
2. **Statistical testing**: Compare output distributions (not individual values)
3. **Reproducibility checks**: Verify deterministic behavior with fixed seeds
4. **Base state fidelity**: Validate underlying physics before complex interactions

**Application to Our System:**
- Our Monte Carlo runs (N=10+) follow ensemble validation pattern
- Deterministic RNG seeds enable reproducibility checks
- Assertions validate "base state fidelity" (fundamental physics constraints)
- Statistical outcome distributions detect validation failures

### 1.5 Domain-Specific Validation Ranges

Based on climate model literature and physical constraints:

#### Population Dynamics
**Mortality Rates:**
- Valid range: [0, 0.5] per month (0-50%)
- Rationale: Historical worst case ~40% over 7 years (Black Death)
- Nuclear winter (Xia et al. 2022): 75% over decades (~2-3% monthly)
- Single-month >50%: Physically implausible, indicates calculation bug

**Population Changes:**
- Max decrease: -50% per month (catastrophic mortality threshold)
- Max increase: +10% per month (generous upper bound)
- Typical: ~1.1% per year globally (~0.09% monthly)

#### Climate Systems
**Temperature Deltas:**
- Valid range: [-20, +10] °C per month
- Max warming: ~5°C over decades (PETM historical record)
- Max cooling: ~15°C (nuclear winter, Xia 2022)
- Values outside [-20, +10]: Calculation errors

**CO2 Levels:**
- Valid range: [280, 600] ppm
- Pre-industrial: 280 ppm
- Current (2025): ~420 ppm
- Extreme scenarios: <600 ppm (RCP8.5 equivalent)

**Ocean pH:**
- Valid range: [7.5, 8.5]
- Pre-industrial: ~8.2
- Current: ~8.1
- Acidification limit: ~7.8 (ecosystem collapse threshold)

#### AI Capabilities
**Capability Levels:**
- Valid range: [0, 5] (discrete integers)
- Levels: 0=None, 1=Basic, 2=Intermediate, 3=Advanced, 4=Superhuman, 5=Transformative
- Must be integers (capabilities are discrete, not continuous)

#### Economic Metrics
**GDP:**
- Valid range: [0, 200] trillion USD
- Current global: ~$100 trillion
- 2× current: Plausible upper bound

**Growth Rates:**
- Valid range: [-0.5, +0.5] monthly change (±50%)
- Typical: ±0.2% monthly (~2-3% annual)
- Great Depression: ~-30% over 4 years (~-0.7% monthly)

---

## Part 2: Phase Dependency Systems

### 2.1 Entity Component System (ECS) Architectures

**Source:** Game Development Stack Exchange, Unity Documentation, Medium

**ECS System Ordering Approaches:**

1. **Simple Sequential Ordering**
   - Definition: Vector/array of systems updated in consistent order
   - Determined at program start by natural dependencies
   - Example: Physics → Animation → Rendering

2. **Directed Acyclic Graph (DAG)**
   - Systems register dependencies explicitly
   - Systems run based on dependency distance in graph
   - Allows parallel execution of independent systems

3. **Unity System Groups**
   - Default groups update systems in correct phase
   - Nested groups for fine-grained ordering
   - Attributes: `[UpdateBefore(typeof(OtherSystem))]`, `[UpdateAfter(typeof(OtherSystem))]`

**Application to Our System:**
- Our 116 phases currently use decimal ordering (fragile)
- Should transition to explicit dependency declarations
- DAG + topological sort provides robust ordering

### 2.2 Topological Sort for Dependency Resolution

**Source:** Medium (Amit Kumar, 2024), Game Dev Stack Exchange

**Algorithm:**
```
TopologicalSort(Graph G):
  1. Compute in-degree for each vertex
  2. Add all vertices with in-degree=0 to queue
  3. While queue not empty:
     a. Dequeue vertex v
     b. Add v to sorted list
     c. For each neighbor u of v:
        - Decrement in-degree of u
        - If in-degree(u) = 0, enqueue u
  4. If sorted list has fewer vertices than G, cycle exists
  5. Return sorted list
```

**Complexity:** O(V + E) where V=vertices, E=edges
- For our system: O(116 + dependencies)
- Very efficient even with many dependencies

**Cycle Detection:**
- If topological sort fails (sorted list < total vertices), cycle exists
- Kahn's algorithm detects cycles naturally
- Can also use DFS with recursion stack (alternative approach)

**Application to Our System:**
- Run topological sort at game initialization
- Cache sorted phase order for runtime
- Fail-fast if circular dependencies detected

### 2.3 Unity ECS Execution Order Details

**Source:** Unity Entities Package Documentation, Medium (@5argon)

**Unity's Approach:**
```csharp
[UpdateInGroup(typeof(SimulationSystemGroup))]
[UpdateBefore(typeof(TransformSystemGroup))]
public class MySystem : SystemBase { }
```

**System Groups:**
- `InitializationSystemGroup` (frame start)
- `SimulationSystemGroup` (main logic)
- `PresentationSystemGroup` (rendering)

**Ordering Rules:**
1. Systems in same group run in deterministic order
2. Dependencies declared via attributes
3. Circular dependencies caught at world creation
4. Runtime validation ensures order respected

**Application to Our System:**
- Phase interface could add `dependencies: string[]` field
- PhaseOrchestrator validates at initialization
- Runtime: sorted phases execute in topological order

### 2.4 Dependency Declaration Schema

**Proposed Schema:**
```typescript
interface Phase {
  id: string;                    // Unique identifier (e.g., "bayesian_mortality_resolution")
  name: string;                  // Human-readable name
  order: number;                 // Legacy decimal order (deprecated)
  dependencies?: string[];       // Phase IDs that must run before this phase
  modifies?: string[];           // State paths modified (documentation)
  reads?: string[];              // State paths read (documentation)
  execute(state, context): void;
}
```

**Example:**
```typescript
{
  id: "regional_population_update",
  name: "Regional Population Update",
  order: 35.0,  // Legacy
  dependencies: [
    "bayesian_mortality_resolution",  // Must run AFTER mortality
    "human_population_phase"          // Must run AFTER base population update
  ],
  modifies: [
    "humanPopulationSystem.regionalPopulations[].population",
    "humanPopulationSystem.regionalPopulations[].monthlyExcessDeaths"
  ],
  reads: [
    "humanPopulationSystem.regionalPopulations[].mortalityRate"
  ]
}
```

**Validation:**
1. All dependency IDs must reference existing phases
2. No circular dependencies (topological sort succeeds)
3. Optional: Check that `reads` values are in `modifies` of dependencies

---

## Part 3: Implementation Roadmap

### 3.1 State Validation Framework (Task 7)

**Step 1: Audit State Mutations (Day 1)**
- Use grep/ripgrep to find all `state.` assignments in phases
- Categorize by domain: mortality, climate, AI, economic
- Identify 180 unvalidated mutations
- Prioritize critical paths: mortality, climate, AI capabilities, planetary boundaries

**Step 2: Expand Assertion Utilities (Day 2)**
- Add domain-specific validators:
  - `assertMortalityRate(rate, context)` - validates [0, 0.5] range
  - `assertTemperatureDelta(delta, context)` - validates [-20, +10] range
  - `assertPopulationChange(newPop, oldPop, context)` - validates plausible deltas
  - `assertAICapability(capability, context)` - validates [0, 5] integers
  - `assertEconomicMetric(value, metricType, context)` - validates GDP/spending/growth
  - `assertPlanetaryBoundary(value, boundaryType, context)` - validates CO2/pH/etc

**Step 3: Add Assertions to Top 20 Phases (Day 2-3)**
Priority phases:
1. BayesianMortalityResolutionPhase
2. ClimateImpactCascadePhase
3. ExtremeWeatherEventsPhase
4. AIAgentActionsPhase
5. AlignmentDynamicsPhase
6. OceanAcidificationPhase
7. NovelEntitiesPhase (nitrogen/phosphorus)
8. FamineSystemPhase
9. WetBulbTemperaturePhase
10. HumanPopulationPhase
11. RefugeeCrisisPhase
12. EconomicTransitionPhase
13. QualityOfLifePhase
14. NuclearWinterPhase
15. FoodSecurityDegradationPhase
16. SocialStabilityPhase
17. GovernmentActionsPhase
18. TechTreePhase
19. ResourceEconomyPhase
20. MultiParadigmDUIUpdatePhase

**Step 4: Create Integration Tests (Day 3)**
- Test: Assertions catch NaN propagation
- Test: Assertions catch physically implausible values
- Test: Monte Carlo runs don't trigger false positives
- Test: Error messages include full context

### 3.2 Phase Dependency System (Task 8)

**Step 1: Design Dependency Schema (Day 4)**
- Add `dependencies?: string[]` to Phase interface
- Document schema in `docs/phase-dependency-system.md`
- Include examples for common patterns

**Step 2: Enhance PhaseOrchestrator (Day 4)**
- Implement topological sort (Kahn's algorithm)
- Add circular dependency detection
- Validate at game initialization
- Fail-fast with descriptive error on cycles

**Step 3: Declare Dependencies for Top 30 Phases (Day 4-5)**
Priority dependency declarations:
1. Climate phases → Mortality phases
2. AI capability phases → Alignment phases
3. Environmental phases → Cascade phases
4. Mortality phases → Population phases
5. Economic phases → Social stability phases

**Step 4: Add Circular Dependency Detection (Day 5)**
- Topological sort failure indicates cycle
- Error message shows cycle path: A → B → C → A
- Suggest dependency removal to break cycle

### 3.3 Testing & Validation Strategy

**Unit Tests:**
- `assertMortalityRate()` validates ranges
- `assertTemperatureDelta()` validates ranges
- Topological sort handles valid DAGs
- Circular dependency detection catches cycles

**Integration Tests:**
- Monte Carlo run with all assertions enabled
- No false positives on valid simulation runs
- Assertions catch injected invalid values
- Phase ordering respects declared dependencies

**Regression Tests:**
- Oct 2025 ecology NaN bug: Would have been caught by assertions
- Population overwrite bug: Would have been caught by phase dependencies

---

## Part 4: Expected Outcomes

### 4.1 Success Metrics

**State Validation:**
- Before: 410/590 assertions (69%)
- After: 590/590 assertions (100% in critical paths)
- NaN propagation: Caught at source, not after contamination
- Error messages: Full context (location, month, values)

**Phase Dependencies:**
- Before: 0 phases with explicit dependencies
- After: 30 critical phases with explicit dependencies
- Circular dependencies: Detected at initialization
- Phase ordering bugs: Prevented by runtime validation

### 4.2 Architectural Benefits

**Immediate Benefits:**
1. Bugs fail loudly at source (not after propagation)
2. Error messages include full debugging context
3. Phase ordering bugs caught at initialization
4. Reduced debugging time (assertions point to root cause)

**Long-Term Benefits:**
1. Parallelization opportunities (independent phases can run in parallel)
2. Easier onboarding (dependencies self-document system interactions)
3. Refactoring safety (dependency violations caught immediately)
4. Research credibility (validated state prevents invalid results)

---

## Citations & References

### State Validation
1. NAFEMS (2024). "Verification, Validation and Uncertainty Quantification in Scientific Computing"
2. Emerald Insight (2024). "A comprehensive validation framework for numerical simulation based on uncertainty quantification"
3. Taylor & Francis (2025). "Model input verification of large scale simulations"
4. arXiv (2024). "NaN-Propagation: A Novel Method for Sparsity Detection in Black-Box Computational Functions" (arXiv:2507.23186)
5. Journal of Climate (2024). "Modes of Variability in E3SM and CESM Large Ensembles"
6. Climate Modeling Science. "Ensuring Climate Simulation Reproducibility in the Exascale Era"

### Phase Dependencies
7. Game Development Stack Exchange. "How do we coordinate which order the systems get processed within an ECS?"
8. Unity Documentation. "System Update Order" (Entities Package)
9. Medium (@5argon). "Details of the execution order of ECS in conjunction with normal scripts"
10. Medium (Amit Kumar, 2024). "Topological Sorting Explained: A Step-by-Step Guide for Dependency Resolution"
11. Wikipedia. "Entity component system"

### Climate Model Parameters
12. Xia et al. (2022). Nuclear winter mortality rates (referenced in existing codebase)
13. Rockström et al. (2009), Steffen et al. (2015). Planetary boundaries framework (referenced in existing assertion utilities)

---

## Appendix: Implementation Code Snippets

### A.1 Domain-Specific Assertion Utilities

```typescript
// Already implemented in assertions.ts:
export function assertMortalityRate(rate: number, context: {...}): number;
export function assertTemperatureDelta(delta: number, context: {...}): number;
export function assertPopulationChange(newValue: number, oldValue: number, context: {...}): number;
export function assertAICapability(capability: number, context: {...}): number;
export function assertEconomicMetric(value: number, metricType: string, context: {...}): number;
export function assertPlanetaryBoundary(value: number, boundaryType: string, context: {...}): number;
```

### A.2 Phase Dependency Declaration

```typescript
// In phase definition:
export const RegionalPopulationUpdatePhase: Phase = {
  id: "regional_population_update",
  name: "Regional Population Update",
  order: 35.0,
  dependencies: [
    "bayesian_mortality_resolution",
    "human_population_phase"
  ],
  execute(state: GameState, context: PhaseContext): void {
    // Phase implementation
  }
};
```

### A.3 Topological Sort in PhaseOrchestrator

```typescript
function topologicalSort(phases: Phase[]): Phase[] {
  const graph = buildDependencyGraph(phases);
  const inDegree = new Map<string, number>();
  const queue: Phase[] = [];

  // Initialize in-degrees
  for (const phase of phases) {
    inDegree.set(phase.id, graph.get(phase.id)?.dependencies.length ?? 0);
  }

  // Add phases with no dependencies
  for (const phase of phases) {
    if (inDegree.get(phase.id) === 0) {
      queue.push(phase);
    }
  }

  const sorted: Phase[] = [];
  while (queue.length > 0) {
    const phase = queue.shift()!;
    sorted.push(phase);

    // Reduce in-degree for dependents
    for (const dependent of getDependents(phase, phases)) {
      const newDegree = inDegree.get(dependent.id)! - 1;
      inDegree.set(dependent.id, newDegree);
      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // Check for cycles
  if (sorted.length < phases.length) {
    throw new Error("Circular dependency detected in phase graph");
  }

  return sorted;
}
```

---

## Research Quality Assessment

**Strengths:**
- Recent sources (2024-2025) for validation frameworks
- Production system examples (CESM, E3SM, Unity ECS)
- Formal algorithmic foundations (topological sort O(V+E))
- Physical plausibility bounds from peer-reviewed climate research

**Limitations:**
- Some domain-specific bounds estimated from existing codebase (Xia 2022 references)
- Game engine ECS patterns may not directly translate to simulation phases
- Statistical validation approach (CESM ensembles) not fully applicable to our deterministic Monte Carlo

**Confidence Level:**
- State validation framework: HIGH (strong academic/industry precedent)
- Phase dependency system: HIGH (well-established CS algorithms, game engine precedent)
- Domain-specific bounds: MEDIUM (some from peer-reviewed sources, some from existing codebase)

**Ready for Research Skeptic Validation:** YES
