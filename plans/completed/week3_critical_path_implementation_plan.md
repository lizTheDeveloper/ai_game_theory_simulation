# WEEK 3 Critical Path Implementation Plan

**Date:** November 6, 2025
**Orchestrator:** Workflow Orchestrator
**Status:** IN PROGRESS

## Executive Summary

Implementing WEEK 3 of the 4-week consensus plan:
1. **State Validation Framework** (3 days, CRITICAL-3)
2. **Phase Dependency System** (2 days, CRITICAL-5)

**Total Effort:** 5 days
**Target Completion:** November 13, 2025

## Context: Architecture Crisis

**Source:** `/reviews/architecture-integration-review_20251106.md` (510 lines)
**Architecture Health:** 8.0/10 (improved from 7.5/10 after WEEK 2)

**WEEK 2 Achievements:**
- Central Configuration: 100+ params centralized (932 lines)
- Defensive Fallbacks: 15 CRITICAL/HIGH eliminated
- Research Parameters: 36% → 0% >5yr old
- Architecture Grade: 7.5/10 → 8.0/10

**Remaining CRITICAL Issues (WEEK 3):**
- **CRITICAL-3:** 180 unvalidated state mutations (590 mutations, only 410 assertions)
- **CRITICAL-5:** 117 phases with no dependency declarations

## Task 1: State Validation Framework (3 days)

### Problem Statement

**CRITICAL-3: Unvalidated State Mutations**
- 590 instances of direct state mutation
- Only 410 assertion calls
- Gap of 180 unvalidated mutations
- Risk: State corruption without validation

**Quote from Architecture Review:**
> "Every state mutation should have a preceding assertion. State corruption risk is highest in critical paths: mortality calculations, climate impacts, AI capabilities, planetary boundaries."

### Success Metrics

- **Assertion Coverage:** 69% → 100% (critical paths)
- **State Mutation Audit:** 180 unvalidated sites identified and documented
- **Domain Validators:** Mortality, climate, AI, boundaries
- **Integration Tests:** Regression prevention for state validation

### Deliverables

#### 1.1 State Mutation Audit Report

**File:** `/reviews/state_mutation_audit_20251106.md`

**Contents:**
- Complete inventory of 590 state mutations
- Identification of 180 unvalidated sites
- Classification by system:
  - Mortality calculation phases
  - Climate impact phases
  - AI capability phases
  - Planetary boundary phases
- Risk assessment per unvalidated site
- Prioritization: CRITICAL → HIGH → MEDIUM

**Method:**
```bash
# Find all state mutations
grep -r "state\.[a-zA-Z]*\.[a-zA-Z]* =" src/simulation --include="*.ts" > /tmp/mutations.txt

# Find all assertions
grep -r "assert" src/simulation --include="*.ts" > /tmp/assertions.txt

# Cross-reference to identify gaps
```

#### 1.2 Expanded Assertion Utilities

**File:** `src/simulation/utils/assertions.ts` (expand from 766 lines)

**New Validators to Add:**

1. **assertMortalityRate(rate, context)**
   - Range: [0, 1] (probability)
   - Physical plausibility check: max 50% per month
   - Used in: All mortality calculation phases

2. **assertTemperatureDelta(delta, context)**
   - Range: [-20, 10] degrees Celsius per month
   - Physical plausibility: Reject >10°C/month changes
   - Used in: Climate impact phases

3. **assertAICapability(capability, context)**
   - Range: [0, 5] (capability levels)
   - Integer check for discrete levels
   - Used in: AI capability mutation phases

4. **assertPlanetaryBoundary(value, boundaryType, context)**
   - Range varies by boundary type:
     - CO2: [280, 600] ppm
     - Temperature: [-2, 10] degrees above baseline
     - Ocean pH: [7.5, 8.5]
   - Used in: Planetary boundary phases

5. **assertPopulationMillion(value, context)**
   - Range: [0, 1000] million per region
   - Non-negative check
   - Regional sum consistency check

**Implementation Pattern:**
```typescript
export function assertMortalityRate(
  rate: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    population?: number;
  }
): number {
  // First: Check it's a valid probability
  assertProbability(rate, context);

  // Second: Check physical plausibility
  if (rate > 0.5) {
    throw new Error(
      `❌ Implausible monthly mortality rate in ${context.location}\n` +
      `   ${context.valueName} = ${(rate * 100).toFixed(2)}%\n` +
      `   Maximum plausible: 50% per month (catastrophic)\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      (context.population !== undefined ? `   Population: ${context.population}M\n` : '') +
      `\n` +
      `   Historical worst cases:\n` +
      `   - Black Death: ~40% over 7 years\n` +
      `   - Xia et al. 2022 nuclear winter: 75% over decades\n` +
      `   A single-month rate >50% indicates a calculation bug.`
    );
  }

  return rate;
}
```

#### 1.3 Critical Path Assertion Coverage (100%)

**Target Systems:**
1. **Mortality Calculation Phases** (100% coverage)
   - MortalityStabilizersPhase
   - BayesianMortalityResolutionPhase
   - RegionalMortalityTrackingPhase
   - All phases that modify `monthlyExcessDeaths`, `cumulativeCrisisDeaths`

2. **Climate Impact Phases** (100% coverage)
   - ClimateImpactCascadePhase
   - TippingPointPhase
   - NuclearWinterPhase
   - All phases that modify `temperature`, `precipitation`, `extremeWeatherFrequency`

3. **AI Capability Phases** (100% coverage)
   - AICapabilityGrowthPhase
   - AIAlignmentDriftPhase
   - All phases that modify `aiAgents[].capabilities`

4. **Planetary Boundaries Phases** (100% coverage)
   - PlanetaryBoundariesPhase
   - All phases that modify `planetaryBoundaries.*`

**Implementation Strategy:**
- Add assertions BEFORE every state mutation
- Use domain-specific validators where applicable
- Include full context (location, month, population, etc.)
- No silent fallbacks (`?? 0` patterns)

#### 1.4 Integration Tests

**File:** `tests/integration/state-validation.test.ts`

**Test Cases:**
1. **Mortality Validation Test**
   - Verify all mortality phases use `assertMortalityRate`
   - Test rejection of >50% monthly rates
   - Test rejection of negative rates

2. **Climate Validation Test**
   - Verify all climate phases use `assertTemperatureDelta`
   - Test rejection of >10°C/month changes
   - Test rejection of non-finite values

3. **AI Capability Validation Test**
   - Verify all AI phases use `assertAICapability`
   - Test rejection of negative capabilities
   - Test rejection of >5 capability values

4. **Planetary Boundary Validation Test**
   - Verify all boundary phases use `assertPlanetaryBoundary`
   - Test rejection of out-of-range values
   - Test boundary-specific ranges

5. **Regression Test: Oct 2025 NaN Bug**
   - Simulate ecology calculation with missing input
   - Verify assertion fires (no silent `?? 50` fallback)
   - Confirm fail-loudly behavior

## Task 2: Phase Dependency System (2 days)

### Problem Statement

**CRITICAL-5: Phase Dependency Violations**
- 117 phases with almost NO dependency declarations
- Fragile decimal ordering (1.0, 2.5, 34.0, 35.0)
- Race condition risk
- Non-deterministic result risk

**Quote from Architecture Review:**
> "BayesianMortalityResolutionPhase (order 35.0) has no declared dependencies but MUST run after all mortality-generating phases. Current 'solution' relies on fragile decimal ordering."

### Success Metrics

- **Dependency Declarations:** 0 → 30 critical phases
- **Circular Dependency Detection:** Operational
- **Runtime Validation:** PhaseOrchestrator enforces dependencies
- **Documentation:** Top 30 phase dependency map

### Deliverables

#### 2.1 Phase Dependency Declaration Format

**Design Decision: Extend Existing Phase Interface**

**File:** `src/types/game.ts` (add to Phase interface)

```typescript
export interface Phase {
  id: string;
  name: string;
  order: number;

  // NEW: Dependency declarations
  dependencies?: {
    // Phases that MUST execute before this phase
    requires?: string[];  // Phase IDs

    // Phases that MUST NOT execute before this phase
    // (this phase should run first)
    runsBefore?: string[];  // Phase IDs

    // Optional: Explain why dependencies exist
    // (for documentation and debugging)
    reason?: string;
  };

  execute(state: GameState, context: PhaseContext): void;
}
```

**Example Usage:**
```typescript
// BayesianMortalityResolutionPhase.ts
export const BayesianMortalityResolutionPhase: Phase = {
  id: 'bayesian_mortality_resolution',
  name: 'Bayesian Mortality Resolution',
  order: 35.0,

  dependencies: {
    requires: [
      'mortality_stabilizers',
      'climate_mortality',
      'famine_mortality',
      'conflict_mortality',
      'disease_mortality'
    ],
    runsBefore: [
      'regional_population_update'
    ],
    reason: 'Must aggregate all mortality sources before population update'
  },

  execute(state, context) {
    // Runtime validation (already exists)
    assertPhaseDependency(context, 'mortality_stabilizers', {
      currentPhase: 'bayesian_mortality_resolution',
      reason: 'Requires mortality stabilizers',
      month: state.currentMonth
    });

    // ... rest of implementation
  }
};
```

#### 2.2 PhaseOrchestrator Dependency Validation

**File:** `src/simulation/engine/PhaseOrchestrator.ts`

**Enhancement 1: Validate Dependencies on Registration**
```typescript
export class PhaseOrchestrator {
  private phases: Phase[] = [];
  private phaseMap: Map<string, Phase> = new Map();

  registerPhase(phase: Phase): void {
    // Existing validation
    if (this.phaseMap.has(phase.id)) {
      throw new Error(`Duplicate phase ID: ${phase.id}`);
    }

    // NEW: Validate dependencies exist
    if (phase.dependencies?.requires) {
      for (const depId of phase.dependencies.requires) {
        if (!this.phaseMap.has(depId)) {
          console.warn(
            `⚠️ Phase '${phase.id}' declares dependency on '${depId}' ` +
            `which is not registered yet. Will validate at execution.`
          );
        }
      }
    }

    this.phases.push(phase);
    this.phaseMap.set(phase.id, phase);
  }

  // NEW: Validate all dependencies after all phases registered
  validateDependencies(): void {
    for (const phase of this.phases) {
      if (!phase.dependencies) continue;

      // Check 'requires' dependencies exist
      if (phase.dependencies.requires) {
        for (const depId of phase.dependencies.requires) {
          if (!this.phaseMap.has(depId)) {
            throw new Error(
              `❌ MISSING DEPENDENCY: Phase '${phase.id}' ` +
              `requires '${depId}' which is not registered.`
            );
          }
        }
      }

      // Check 'runsBefore' dependencies exist
      if (phase.dependencies.runsBefore) {
        for (const depId of phase.dependencies.runsBefore) {
          if (!this.phaseMap.has(depId)) {
            throw new Error(
              `❌ MISSING DEPENDENCY: Phase '${phase.id}' ` +
              `must run before '${depId}' which is not registered.`
            );
          }
        }
      }
    }
  }
}
```

**Enhancement 2: Runtime Dependency Enforcement**
```typescript
executeAll(state: GameState, rng: () => number): void {
  // NEW: Validate dependencies before starting
  this.validateDependencies();

  // Sort phases by order (existing behavior)
  const sortedPhases = [...this.phases].sort((a, b) => a.order - b.order);

  const context: PhaseContext = {
    executedPhases: new Set<string>(),
    monthlyLog: [],
    rng
  };

  for (const phase of sortedPhases) {
    // NEW: Check dependencies before execution
    if (phase.dependencies?.requires) {
      for (const depId of phase.dependencies.requires) {
        if (!context.executedPhases.has(depId)) {
          throw new Error(
            `❌ DEPENDENCY VIOLATION: Phase '${phase.id}' ` +
            `requires '${depId}' to execute first, but it hasn't run yet.\n` +
            `Executed so far: ${Array.from(context.executedPhases).join(', ')}\n` +
            `Reason: ${phase.dependencies.reason || 'Not specified'}`
          );
        }
      }
    }

    // NEW: Check 'runsBefore' constraints
    if (phase.dependencies?.runsBefore) {
      for (const depId of phase.dependencies.runsBefore) {
        if (context.executedPhases.has(depId)) {
          throw new Error(
            `❌ ORDERING VIOLATION: Phase '${phase.id}' ` +
            `must run before '${depId}', but '${depId}' already executed.\n` +
            `Reason: ${phase.dependencies.reason || 'Not specified'}`
          );
        }
      }
    }

    // Execute phase
    phase.execute(state, context);
    context.executedPhases.add(phase.id);
  }
}
```

#### 2.3 Top 30 Critical Phase Dependencies

**File:** `/docs/PHASE_DEPENDENCY_MAP.md`

**Critical Phases to Document:**

1. **BifurcationLogicPhase (4.5)**
   - Requires: None (runs early)
   - Reason: Calculates variance amplification used by stochastic phases

2. **MortalityStabilizersPhase (order TBD)**
   - Requires: Climate phases, famine phases
   - Runs before: BayesianMortalityResolutionPhase
   - Reason: Applies stabilizing mechanisms before mortality aggregation

3. **BayesianMortalityResolutionPhase (35.0)**
   - Requires: All mortality-generating phases
   - Runs before: RegionalPopulationUpdatePhase
   - Reason: Must aggregate all mortality before population update

4. **ClimateImpactCascadePhase**
   - Requires: TippingPointPhase, NuclearWinterPhase
   - Runs before: Mortality phases
   - Reason: Climate impacts must be calculated before mortality

5. **TippingPointPhase**
   - Requires: None (reads state only)
   - Runs before: ClimateImpactCascadePhase
   - Reason: Tipping points drive climate cascades

... (continue for top 30)

**Dependency Categories:**
- **Environmental Chain:** Tipping → Climate → Mortality
- **Population Chain:** Mortality → Bayesian Resolution → Population Update
- **AI Chain:** Capability Growth → Alignment Drift → Agent Actions
- **Economic Chain:** Crisis → Policy Response → Resource Allocation

#### 2.4 Circular Dependency Detection

**File:** `src/simulation/engine/dependencyAnalysis.ts`

**Algorithm: Depth-First Search (DFS)**

```typescript
export function detectCircularDependencies(
  phases: Phase[]
): { hasCircular: boolean; cycles: string[][] } {
  const phaseMap = new Map<string, Phase>();
  for (const phase of phases) {
    phaseMap.set(phase.id, phase);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(phaseId: string, path: string[]): boolean {
    if (recursionStack.has(phaseId)) {
      // Circular dependency detected
      const cycleStart = path.indexOf(phaseId);
      const cycle = path.slice(cycleStart).concat(phaseId);
      cycles.push(cycle);
      return true;
    }

    if (visited.has(phaseId)) {
      return false;  // Already processed
    }

    visited.add(phaseId);
    recursionStack.add(phaseId);
    path.push(phaseId);

    const phase = phaseMap.get(phaseId);
    if (phase?.dependencies?.requires) {
      for (const depId of phase.dependencies.requires) {
        dfs(depId, [...path]);
      }
    }

    recursionStack.delete(phaseId);
    return false;
  }

  // Check all phases
  for (const phase of phases) {
    if (!visited.has(phase.id)) {
      dfs(phase.id, []);
    }
  }

  return {
    hasCircular: cycles.length > 0,
    cycles
  };
}

export function validateNoCycles(phases: Phase[]): void {
  const result = detectCircularDependencies(phases);

  if (result.hasCircular) {
    const cycleDescriptions = result.cycles.map(cycle =>
      cycle.join(' → ')
    ).join('\n   ');

    throw new Error(
      `❌ CIRCULAR DEPENDENCIES DETECTED\n\n` +
      `   ${cycleDescriptions}\n\n` +
      `   Phases cannot have circular dependencies. Fix the dependency ` +
      `declarations to create a valid execution order.`
    );
  }
}
```

**Integration:**
```typescript
// In PhaseOrchestrator.validateDependencies()
validateDependencies(): void {
  // Existing validation...

  // NEW: Check for circular dependencies
  validateNoCycles(this.phases);
}
```

## Implementation Workflow

### Phase 1: State Validation (Days 1-3)

**Day 1: Audit & Design**
- Run state mutation audit (grep analysis)
- Identify 180 unvalidated sites
- Design domain-specific validators
- Create audit report

**Day 2: Implementation**
- Add 5 new assertion utilities
- Apply assertions to critical paths:
  - Mortality phases (100% coverage)
  - Climate phases (100% coverage)
- Write integration tests

**Day 3: Coverage Completion**
- Apply assertions to remaining critical paths:
  - AI capability phases (100% coverage)
  - Planetary boundary phases (100% coverage)
- Run Monte Carlo N=3 validation
- Fix any issues found

### Phase 2: Phase Dependencies (Days 4-5)

**Day 4: Design & Core Implementation**
- Extend Phase interface with dependencies field
- Implement PhaseOrchestrator validation
- Implement circular dependency detection
- Add top 10 critical phase dependencies

**Day 5: Documentation & Remaining Dependencies**
- Document top 30 phase dependencies
- Add remaining 20 dependency declarations
- Run Monte Carlo N=3 validation
- Fix any ordering issues found

### Phase 3: Validation (Day 5-6)

**Monte Carlo N=10 Run**
- Verify no regressions
- Verify determinism preserved
- Verify no performance degradation
- Verify all assertions operational
- Verify phase ordering stable

### Phase 4: Architecture Review (Day 6)

**Spawn architecture-skeptic**
- Review for performance impact
- Review for complexity creep
- Review for state propagation issues
- Must address CRITICAL/HIGH issues

### Phase 5: Documentation & Archival (Day 7)

**Wiki Update**
- Document state validation framework
- Document phase dependency system
- Update architecture documentation

**Archival**
- Create `/plans/completed/week3_critical_path_complete_YYYYMMDD.md`
- Update MASTER_IMPLEMENTATION_ROADMAP.md
- Post completion to coordination channel

## Success Criteria

**State Validation:**
- ✅ 180 unvalidated mutations → 0 unvalidated (critical paths)
- ✅ Assertion coverage: 69% → 100% (critical paths)
- ✅ 5 new domain-specific validators operational
- ✅ Integration tests passing

**Phase Dependencies:**
- ✅ 0 → 30 critical phases with dependency declarations
- ✅ Circular dependency detection operational
- ✅ PhaseOrchestrator enforces dependencies at runtime
- ✅ Documentation complete

**Validation:**
- ✅ Monte Carlo N=10: No regressions
- ✅ Determinism: 100% reproducible
- ✅ Performance: No degradation (assertions efficient)
- ✅ Architecture grade: Maintain 8.0/10

## Risk Mitigation

**Risk 1: Assertion Overhead**
- Mitigation: Profile assertion performance
- Threshold: <5% execution time overhead
- Fallback: Conditional assertions (debug mode only)

**Risk 2: Circular Dependencies Found**
- Mitigation: Manual ordering adjustment
- Document why circular dependency exists
- Refactor phases if necessary

**Risk 3: Monte Carlo Regressions**
- Mitigation: Git revert capability
- Incremental rollout (10 phases at a time)
- Extensive logging for debugging

## Approval & Sign-off

**Orchestrator:** Workflow Orchestrator
**Assigned To:** simulation-maintainer (Roy)
**Review By:** architecture-skeptic
**Timeline:** November 6-13, 2025 (7 days)
**Status:** READY TO BEGIN

---

**Next Steps:**
1. Spawn simulation-maintainer with this plan
2. Monitor progress via chatroom channels
3. Coordinate architecture review after implementation
4. Run Monte Carlo validation
5. Update wiki and archive completion
