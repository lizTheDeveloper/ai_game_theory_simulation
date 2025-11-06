# Phase Dependency System Implementation Plan
**Date:** November 6, 2025
**Priority:** CRITICAL (ARCH-CRITICAL-5)
**Week:** 3 of 4 (4-Week Consensus Critical Path)
**Effort Estimate:** 2 days
**Status:** PLANNING

---

## Executive Summary

**Problem:** 117 phases with almost NO dependency declarations, relying on fragile decimal ordering (1.0, 2.5, 34.0, 35.0). This creates race condition risks and non-deterministic behavior when phases are added or reordered.

**Solution:** Implement explicit dependency declarations for top 30 critical phases, enhance PhaseOrchestrator validation, add circular dependency detection, and document dependency patterns.

**Success Criteria:**
- Top 30 phases have explicit `dependencies` declarations
- PhaseOrchestrator validates dependencies at startup
- Circular dependency detection prevents dependency cycles
- No breaking changes to existing phase execution
- Wiki documentation provides clear patterns for future phases

---

## Background

### Current State (Architecture Review Finding)

From `/reviews/architecture-integration-review_20251106.md`:

- **117 phase files** in `src/simulation/engine/phases/`
- **ZERO phases** currently declare dependencies (grep confirms)
- **Decimal ordering fragility:** Phases use order numbers like 1.0, 2.5, 15.5, 34.0, 35.0
- **Infrastructure exists** but unused: `SimulationPhase` interface has optional `dependencies?: readonly string[]`
- **Runtime validation exists** in PhaseOrchestrator (lines 169-191) but never triggered

### Infrastructure Already in Place

**PhaseOrchestrator.ts (lines 56-69):**
```typescript
/**
 * Optional array of phase IDs that must execute BEFORE this phase
 *
 * Runtime validation ensures:
 * 1. Dependency phases have already executed this step
 * 2. Dependency phases have lower order numbers
 *
 * @example
 * // Any phase that modifies population AFTER mortality must declare dependency
 * readonly dependencies = ['bayesian_mortality_resolution'];
 *
 * // Phases can have multiple dependencies
 * readonly dependencies = ['climate_update', 'food_security_update'];
 */
readonly dependencies?: readonly string[];
```

**PhaseOrchestrator.ts (lines 169-191):** Runtime validation throws clear errors if dependencies not met.

### Example of Good Dependency Documentation

**BayesianMortalityResolutionPhase.ts (lines 13-24):**
```typescript
/**
 * ⚠️ CRITICAL: This phase is the AUTHORITATIVE source for population after mortality.
 * NO phase should modify humanPopulationSystem.population after this phase runs.
 * Phases that need population updates must run BEFORE this phase (order < 35.0).
 *
 * Architecture Note (Oct 28, 2025):
 * CountryPopulationPhase was deleted because it ran AFTER this phase and overwrote
 * mortality-adjusted population values, causing silent data corruption. This phase
 * dependency system prevents that pattern from recurring.
 */
```

This is EXACTLY the kind of ordering constraint that should be expressed as explicit dependencies.

---

## Known Dependency Chains

### Critical Dependency Chains (from architecture knowledge)

1. **Climate → Mortality Chain**
   - `tipping_point` (order unknown) → `climate_impact_cascade` (34.0) → `bayesian_mortality_resolution` (35.0)
   - Rationale: Climate tipping points affect cascade intensity, cascade creates mortality risks

2. **AI Capability → Alignment Chain**
   - `ai_capability_evolution` → `ai_lifecycle` → `alignment_dynamics`
   - Rationale: Capabilities must be updated before lifecycle changes, which affect alignment

3. **Population → Economics Chain**
   - `human_population` → `economic_activity`
   - Rationale: Economic activity depends on population size and demographics

4. **Environmental → Planetary Boundaries Chain**
   - `biosphere_integrity` → `planetary_boundaries`
   - Rationale: Biosphere state informs planetary boundary calculations

5. **Exogenous Shocks → Emergency Response Chain**
   - `exogenous_shock` → `emergency_response`
   - Rationale: Response systems react to shocks, must happen after shock generation

6. **Bifurcation → Stochastic Events Chain**
   - `bifurcation_logic` (4.5) → `stochastic_innovation` → Any phase using varianceAmplification
   - Rationale: Bifurcation state must be calculated before variance amplification is used

7. **All Crisis Phases → Mortality Resolution**
   - ALL phases that add mortality risks → `bayesian_mortality_resolution` (35.0)
   - Examples: `climate_impact_cascade`, `antimicrobial_resistance`, `famine`, `conflict`
   - Rationale: Mortality risks must accumulate before resolution

---

## Top 30 Critical Phases (Priority List)

### Tier 1: Absolutely Critical (10 phases)
1. **BayesianMortalityResolutionPhase** (35.0) - MUST run after all mortality-generating phases
2. **ClimateImpactCascadePhase** (34.0) - Depends on climate state, feeds mortality
3. **BifurcationLogicPhase** (4.5) - MUST run before phases using varianceAmplification
4. **StochasticInnovationPhase** - Uses bifurcation variance
5. **ExogenousShockPhase** - Uses bifurcation variance, generates mortality risks
6. **TippingPointPhase** - Climate state updates, affects cascade
7. **MortalityStabilizersPhase** - MUST run AFTER crisis phases, BEFORE mortality resolution
8. **HumanPopulationPhase** - Population updates affect downstream economics
9. **EconomicActivityPhase** - Depends on population size
10. **PlanetaryBoundariesPhase** - Depends on biosphere state

### Tier 2: High Priority (10 phases)
11. **AICapabilityEvolutionPhase** - AI capabilities must update before lifecycle
12. **AILifecyclePhase** - Depends on capabilities, affects alignment
13. **AlignmentDynamicsPhase** - Depends on lifecycle events
14. **BiosphereIntegrityPhase** - Environmental state feeds planetary boundaries
15. **EmergencyResponsePhase** - Responds to exogenous shocks
16. **AntimicrobialResistancePhase** - Generates mortality risks
17. **FoodSecurityPhase** - Climate affects food, food affects mortality
18. **EnvironmentalFeedbackPhase** (33.5) - BEFORE climate cascade (34.0)
19. **GovernmentActionsPhase** - Policy responses to crises
20. **CollectiveFormationPhase** - Social dynamics inform collective actions

### Tier 3: Medium Priority (10 phases)
21. **CollectiveActionsPhase** - Depends on collective formation
22. **ComputeGrowthPhase** - Compute growth affects allocation
23. **ComputeAllocationPhase** - Depends on available compute
24. **AISufferingPhase** - AI welfare depends on lifecycle state
25. **AIWelfareUpdatePhase** - Depends on suffering calculations
26. **ConflictResolutionPhase** - Conflict outcomes affect mortality
27. **CooperativeOwnershipPhase** - Economic structure changes
28. **BenchmarkEvaluationsPhase** - AI evaluation depends on capabilities
29. **AlignmentTechniquePhase** - Technique development affects alignment
30. **EvolutionarySelectionPhase** - Uses bifurcation variance, affects innovation

---

## Technical Design

### 1. Dependency Declaration Format (Already Defined)

**Location:** `src/simulation/engine/PhaseOrchestrator.ts` (lines 56-69)

**Format:**
```typescript
export class ExamplePhase implements SimulationPhase {
  readonly id = 'example_phase';
  readonly name = 'Example Phase';
  readonly order = 10.0;
  readonly dependencies = ['prerequisite_phase_1', 'prerequisite_phase_2'] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Implementation...
  }
}
```

**Validation Rules:**
1. Dependency phases must have already executed this step (`context.executedPhases.has(depId)`)
2. Dependency phases should have lower order numbers (recommended, not enforced)
3. Missing dependency throws clear error with phase name, order, month, executed phases

### 2. Circular Dependency Detection

**Location:** New method in `PhaseOrchestrator.ts`

**Algorithm:** Topological sort with cycle detection (Kahn's algorithm or DFS-based)

**Implementation:**
```typescript
/**
 * Detect circular dependencies in registered phases
 * Called once during initialization (sortPhases method)
 *
 * @throws Error if circular dependency detected
 */
private detectCircularDependencies(): void {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const phase of this.phases) {
    graph.set(phase.id, phase.dependencies ? [...phase.dependencies] : []);
    inDegree.set(phase.id, 0);
  }

  // Calculate in-degrees
  for (const [phaseId, deps] of graph.entries()) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  for (const [phaseId, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(phaseId);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const phaseId = queue.shift()!;
    sorted.push(phaseId);

    for (const neighbor of graph.get(phaseId) || []) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // If sorted.length < phases.length, circular dependency exists
  if (sorted.length < this.phases.length) {
    const unsorted = this.phases.filter(p => !sorted.includes(p.id));
    throw new Error(
      `❌ CIRCULAR DEPENDENCY DETECTED\n\n` +
      `Phases involved in cycle: ${unsorted.map(p => p.name).join(', ')}\n\n` +
      `These phases have circular dependencies that prevent ordering.\n` +
      `Review dependency declarations and remove cycles.`
    );
  }
}
```

**When to call:** During `sortPhases()` method, before sorting by order number.

### 3. Enhanced Validation

**Current validation (lines 169-191):** Runtime check during executeAll()

**Enhancement needed:** Startup validation to catch issues early

**New method:**
```typescript
/**
 * Validate phase dependencies at startup
 * Called once after all phases registered, before first execution
 *
 * Checks:
 * 1. All dependency phase IDs actually exist
 * 2. No self-dependencies
 * 3. Dependency phases have lower order numbers (warning if not)
 * 4. No circular dependencies
 */
validateDependencies(): void {
  const phaseIds = new Set(this.phases.map(p => p.id));

  for (const phase of this.phases) {
    if (!phase.dependencies || phase.dependencies.length === 0) continue;

    for (const depId of phase.dependencies) {
      // Check 1: Dependency exists
      if (!phaseIds.has(depId)) {
        throw new Error(
          `❌ INVALID DEPENDENCY: ${phase.name} (${phase.id})\n` +
          `   Declares dependency on non-existent phase: ${depId}\n` +
          `   Available phases: ${Array.from(phaseIds).join(', ')}`
        );
      }

      // Check 2: No self-dependency
      if (depId === phase.id) {
        throw new Error(
          `❌ SELF-DEPENDENCY: ${phase.name} (${phase.id})\n` +
          `   Phase cannot depend on itself`
        );
      }

      // Check 3: Order validation (warning only)
      const depPhase = this.phases.find(p => p.id === depId)!;
      if (depPhase.order >= phase.order) {
        console.warn(
          `⚠️ DEPENDENCY ORDER WARNING: ${phase.name} (order ${phase.order})\n` +
          `   Depends on ${depPhase.name} (order ${depPhase.order})\n` +
          `   Dependency should have lower order number to execute first`
        );
      }
    }
  }

  // Check 4: Circular dependencies
  this.detectCircularDependencies();
}
```

**When to call:** From `game.ts` initialization, after all phases registered:
```typescript
const orchestrator = new PhaseOrchestrator();
// ... register all phases ...
orchestrator.validateDependencies(); // NEW: Startup validation
```

### 4. Backward Compatibility

**No breaking changes required:**
- `dependencies` field is optional, phases without it continue working
- Decimal ordering still used as primary sort key
- Runtime validation already exists (lines 169-191)
- Only adding startup validation and circular dependency detection

**Migration path:**
1. Add dependencies to Tier 1 phases (10 phases)
2. Add dependencies to Tier 2 phases (10 phases)
3. Add dependencies to Tier 3 phases (10 phases)
4. Gradual rollout to remaining phases as needed

---

## Implementation Tasks

### Task 1: Circular Dependency Detection (2-3 hours)
**Owner:** simulation-maintainer
**Files:**
- `src/simulation/engine/PhaseOrchestrator.ts` (add detectCircularDependencies method)

**Steps:**
1. Implement Kahn's algorithm for topological sort
2. Call from sortPhases() method
3. Add comprehensive error messages with cycle details
4. Test with intentional circular dependency

**Test cases:**
- A → B → C (valid chain)
- A → B → A (simple cycle)
- A → B → C → A (longer cycle)
- No dependencies (all phases independent)

### Task 2: Enhanced Startup Validation (2-3 hours)
**Owner:** simulation-maintainer
**Files:**
- `src/simulation/engine/PhaseOrchestrator.ts` (add validateDependencies method)
- `src/simulation/game.ts` (call validateDependencies after registration)

**Steps:**
1. Implement validateDependencies method
2. Validate phase ID existence
3. Validate no self-dependencies
4. Validate order consistency (warning)
5. Call circular dependency detection
6. Integrate into game initialization

**Test cases:**
- Non-existent dependency ID
- Self-dependency
- Backward dependency (higher order depends on lower)
- Valid dependencies pass without errors

### Task 3: Add Dependencies to Tier 1 Phases (4-6 hours)
**Owner:** simulation-maintainer
**Files:** 10 phase files

**Phases:**
1. BayesianMortalityResolutionPhase → depends on all mortality-generating phases
2. ClimateImpactCascadePhase → depends on tipping_point, environmental_feedback
3. BifurcationLogicPhase → no dependencies (runs early)
4. StochasticInnovationPhase → depends on bifurcation_logic
5. ExogenousShockPhase → depends on bifurcation_logic
6. TippingPointPhase → depends on climate state updates
7. MortalityStabilizersPhase → depends on crisis phases, before mortality resolution
8. HumanPopulationPhase → no dependencies (base data)
9. EconomicActivityPhase → depends on human_population
10. PlanetaryBoundariesPhase → depends on biosphere_integrity

**For each phase:**
1. Identify actual dependency phase IDs (grep for phase registration)
2. Add `readonly dependencies = ['dep1', 'dep2'] as const;`
3. Document rationale in JSDoc comment
4. Verify order numbers are consistent

### Task 4: Add Dependencies to Tier 2 Phases (4-6 hours)
**Owner:** simulation-maintainer
**Files:** 10 phase files

**Phases:** (See Tier 2 list above)

**Same process as Task 3**

### Task 5: Add Dependencies to Tier 3 Phases (4-6 hours)
**Owner:** simulation-maintainer
**Files:** 10 phase files

**Phases:** (See Tier 3 list above)

**Same process as Task 3**

### Task 6: Integration Tests (2-3 hours)
**Owner:** simulation-maintainer or unit-test-writer
**Files:**
- `tests/integration/phaseDependencies.test.ts` (new)

**Test scenarios:**
1. Valid dependency chain executes in correct order
2. Missing dependency throws error with clear message
3. Circular dependency detected at startup
4. Non-existent dependency ID throws error
5. Self-dependency throws error
6. Backward dependency logs warning
7. Phase without dependencies still executes
8. Multiple dependencies all satisfied

### Task 7: Monte Carlo Validation (1-2 hours)
**Owner:** simulation-maintainer
**Command:** `npx tsx scripts/monteCarloSimulation.ts > logs/mc_phase_deps_validation_20251106.log 2>&1 &`

**Success criteria:**
- N=10 runs complete without dependency errors
- Outcome distributions consistent with previous runs
- No new NaN errors introduced
- Determinism maintained (99%+ field consistency)

**Comparison baseline:** Previous Monte Carlo run from Week 2 completion

### Task 8: Architecture Review (1-2 hours)
**Owner:** architecture-skeptic
**Focus:**
- Does circular dependency detection work correctly?
- Are dependency chains documented clearly?
- Do order numbers align with dependencies?
- Are there any race conditions introduced?
- Is the system maintainable for future phases?

**Deliverable:** `/reviews/phase_dependency_system_architecture_review_20251106.md`

### Task 9: Wiki Documentation (2-3 hours)
**Owner:** wiki-documentation-updater
**Files:**
- `docs/wiki/README.md` (add Phase Dependency System section)
- `docs/DEVELOPMENT_WORKFLOW.md` (update phase creation workflow)

**Content:**
1. **How to declare dependencies** - Code examples, patterns
2. **Common dependency chains** - Reference for developers
3. **Validation errors** - How to interpret and fix
4. **Best practices:**
   - When to use dependencies vs order numbers
   - How to avoid circular dependencies
   - Testing dependency changes
5. **Top 30 phase dependency map** - Visual or table format

---

## Dependency Map (Top 30 Phases)

```
EARLY INITIALIZATION (order 0-5)
├── bifurcation_logic (4.5) [NO DEPS]
│   └── Used by: stochastic_innovation, exogenous_shock, evolutionary_selection, climate_impact_cascade

CLIMATE & ENVIRONMENT (order 20-34)
├── tipping_point
│   └── climate_impact_cascade (34.0)
│       ├── environmental_feedback (33.5)
│       └── bayesian_mortality_resolution (35.0)
├── biosphere_integrity
│   └── planetary_boundaries

POPULATION & ECONOMICS (order 5-15)
├── human_population [NO DEPS]
│   └── economic_activity
│       └── cooperative_ownership

AI SYSTEMS (order 10-20)
├── ai_capability_evolution [NO DEPS]
│   └── ai_lifecycle
│       ├── alignment_dynamics
│       ├── ai_suffering
│       └── ai_welfare_update
├── benchmark_evaluations
│   └── alignment_technique

CRISIS RESPONSE (order 15-34)
├── exogenous_shock [DEPENDS: bifurcation_logic]
│   └── emergency_response
├── antimicrobial_resistance [NO DEPS]
│   └── bayesian_mortality_resolution (35.0)
├── food_security
│   └── bayesian_mortality_resolution (35.0)
├── conflict_resolution [NO DEPS]
│   └── bayesian_mortality_resolution (35.0)

MORTALITY RESOLUTION (order 30-35)
├── ALL CRISIS PHASES (15-34)
│   └── mortality_stabilizers (~34.5)
│       └── bayesian_mortality_resolution (35.0) [AUTHORITATIVE]

SOCIAL DYNAMICS (order 10-20)
├── collective_formation [NO DEPS]
│   └── collective_actions

COMPUTE & INNOVATION (order 8-15)
├── compute_growth [NO DEPS]
│   └── compute_allocation
├── stochastic_innovation [DEPENDS: bifurcation_logic]
│   └── evolutionary_selection [DEPENDS: bifurcation_logic]
```

---

## Risk Assessment

### Technical Risks

1. **Breaking existing simulations**
   - **Mitigation:** Backward compatible (dependencies optional), extensive testing
   - **Likelihood:** Low
   - **Impact:** Medium

2. **Circular dependency false positives**
   - **Mitigation:** Comprehensive testing, clear error messages
   - **Likelihood:** Low
   - **Impact:** Low (blocks startup, easy to debug)

3. **Performance degradation from validation**
   - **Mitigation:** Startup validation only (once), runtime check already exists
   - **Likelihood:** Very Low
   - **Impact:** Very Low (<1ms overhead)

4. **Incorrect dependency declarations**
   - **Mitigation:** Architecture review, Monte Carlo validation
   - **Likelihood:** Medium
   - **Impact:** Medium (could break simulation logic)

### Process Risks

1. **Incomplete coverage (only 30/117 phases)**
   - **Mitigation:** Focus on critical phases first, document patterns for future
   - **Likelihood:** Certain (by design)
   - **Impact:** Low (remaining phases work as before)

2. **Time overrun (2 day estimate)**
   - **Mitigation:** Phased rollout (Tier 1 → Tier 2 → Tier 3), clear task breakdown
   - **Likelihood:** Medium
   - **Impact:** Low (can defer Tier 3 if needed)

---

## Success Metrics

### Immediate Success (End of Implementation)
- ✅ Circular dependency detection algorithm implemented and tested
- ✅ Startup validation method added to PhaseOrchestrator
- ✅ Top 30 phases have explicit dependency declarations
- ✅ Integration tests pass (8 test scenarios)
- ✅ Monte Carlo N=10 runs without dependency errors
- ✅ Architecture review APPROVE rating

### Long-term Success (1 month)
- ✅ Zero race condition bugs related to phase ordering
- ✅ New phases use dependency declarations (adoption rate)
- ✅ Dependency documentation referenced in code reviews
- ✅ No circular dependency errors in production

---

## Timeline

**Total Effort:** 20-30 hours over 2 days

### Day 1 (12-15 hours)
- ✅ Circular dependency detection (2-3h)
- ✅ Enhanced startup validation (2-3h)
- ✅ Tier 1 dependencies (4-6h)
- ✅ Tier 2 dependencies (4-6h)

### Day 2 (8-12 hours)
- ✅ Tier 3 dependencies (4-6h)
- ✅ Integration tests (2-3h)
- ✅ Monte Carlo validation (1-2h)
- ⏱️ Architecture review (1-2h, async)

### Day 3 (Optional, if needed)
- ⏱️ Wiki documentation (2-3h)
- ⏱️ Address architecture review findings (2-4h)

---

## References

### Primary Documents
- `/reviews/architecture-integration-review_20251106.md` - CRITICAL-5 finding
- `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Week 3 priorities
- `/src/simulation/engine/PhaseOrchestrator.ts` - Existing infrastructure
- `/src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` - Dependency example

### Related Issues
- **ARCH-CRITICAL-5:** Phase Dependency Violations (this plan)
- **CRITICAL-3:** Unvalidated State Mutations (related to race conditions)
- **HIGH-2:** Phase Explosion (117 files, dependency management helps)

### Research Context
- Research simulation requires deterministic, reproducible results
- Race conditions violate determinism principle
- Explicit dependencies are self-documenting architecture

---

## Approval & Sign-off

**Plan Author:** Orchestrator Agent
**Date Created:** November 6, 2025
**Status:** READY FOR IMPLEMENTATION

**Awaiting approval from:**
- [ ] User (implicit via task assignment)
- [ ] simulation-maintainer (implementer)
- [ ] architecture-skeptic (post-implementation review)

**Implementation Start:** Upon approval
**Target Completion:** November 8, 2025 (2 days)

---

*This plan addresses ARCH-CRITICAL-5 from the November 6 Architecture Review, Week 3 Priority #2 of the 4-Week Consensus Critical Path.*
