# WEEK 3: State Validation & Phase Dependency System

**Date:** November 6, 2025
**Status:** IN PROGRESS
**Priority:** MEDIUM (ARCH-CRITICAL-3, ARCH-CRITICAL-5)
**Estimated Duration:** 5 days

## Context

From WEEK 2 completion (Nov 6, 2025):
- Central config: DELIVERED
- Defensive fallback audit: DELIVERED
- Research updates: DELIVERED
- Performance: 200% target metrics
- Architecture health: 8.0/10
- Research quality: A/A+

## Problems to Solve

### Task 7: State Validation Framework (3 days) - ARCH-CRITICAL-3

**Current State:**
- 590 direct state mutations identified
- Only 410 assertions in place
- 180 unvalidated mutations (30% gap)
- Risk: Silent bugs, NaN propagation, data corruption

**Critical Paths Requiring 100% Coverage:**
1. Mortality calculation phases (BayesianMortalityResolutionPhase, etc.)
2. Climate impact phases (ClimateImpactCascadePhase, ExtremeWeatherEventsPhase, etc.)
3. AI capabilities phases (AIAgentActionsPhase, AlignmentDynamicsPhase, etc.)
4. Planetary boundaries phases (OceanAcidificationPhase, NovelEntitiesPhase, etc.)

**Solution Requirements:**
1. Audit all state mutations in critical paths
2. Add assertions before EVERY mutation
3. Expand assertion utilities for domain-specific validation
4. Create integration tests for regression prevention

**Target Metrics:**
- Before: 410/590 assertions (69%)
- After: 590/590 assertions (100% in critical paths)

### Task 8: Phase Dependency System (2 days) - ARCH-CRITICAL-5

**Current State:**
- 116 phase files identified
- Almost NONE declare dependencies
- Fragile decimal ordering (1.0, 2.5, 34.0, 35.0)
- Risk: Race conditions, silent overwrites, execution order bugs

**Known Dependency Relationships:**
1. Climate phases MUST run before mortality phases
2. AI capability phases MUST run before alignment phases
3. Environmental impact phases MUST run before cascade phases
4. Bayesian mortality MUST run before population update phases

**Solution Requirements:**
1. Design dependency declaration format/schema
2. Enhance PhaseOrchestrator validation (check dependencies at runtime)
3. Declare dependencies for top 30 critical phases
4. Add circular dependency detection

**Target Metrics:**
- Before: 0 phases with explicit dependencies
- After: 30 critical phases with explicit dependencies
- Circular dependency detection: Operational

## Research Questions

### State Validation Best Practices
1. What are best practices for assertive programming in simulation systems?
2. How do production simulations (climate models, economic models) validate state mutations?
3. What domain-specific validators are needed for:
   - Population dynamics (mortality, migration, demographics)
   - Climate systems (temperature, CO2, ocean pH)
   - AI capabilities (discrete levels, capability dimensions)
   - Economic metrics (GDP, spending, growth rates)
4. What are effective strategies for preventing NaN propagation in large state machines?

### Phase Dependency Systems
1. What are best practices for declaring phase dependencies in simulation engines?
2. How do game engines (Unity, Unreal) handle system execution ordering?
3. What are effective schemas for dependency declaration?
4. What algorithms detect circular dependencies efficiently?
5. How should PhaseOrchestrator validate dependencies at runtime?

## Success Criteria

**Task 7 Complete When:**
- All 180 unvalidated state mutations identified (audit report)
- Assertion utilities expanded (domain-specific validators)
- Top 20 critical phases have 100% assertion coverage
- Integration tests prevent future regressions
- No NaN propagation bugs in Monte Carlo runs

**Task 8 Complete When:**
- Dependency declaration format/schema documented
- PhaseOrchestrator validates dependencies at runtime
- Top 30 critical phases have explicit dependencies
- Circular dependency detection operational
- Phase ordering bugs prevented by runtime checks

**WEEK 3 Complete When:**
- Architecture health: Maintain 8.0/10 or improve
- State mutations: 410/590 → 590/590 assertions (100% critical paths)
- Phase dependencies: 0 → 30 phases with explicit declarations
- Integration tests: Regression coverage for both systems
- Quality gates passed: Research validation, architecture review
- Documentation: Wiki updated with new patterns

## Workflow

1. **Research & Validation (Quality Gate 1)**
   - super-alignment-researcher: Gather research on validation/dependency patterns
   - research-skeptic: Validate findings (MANDATORY gate)

2. **Implementation & Testing**
   - feature-implementer: Implement Task 7 (state validation)
   - feature-implementer: Implement Task 8 (phase dependencies)
   - unit-test-writer: Create regression tests
   - integration-test-writer: Create system tests

3. **Architecture Review (Quality Gate 2)**
   - architecture-skeptic: Review (MANDATORY gate, address CRITICAL/HIGH issues)

4. **Documentation & Archival**
   - wiki-documentation-updater: Update wiki
   - project-plan-manager: Archive to /plans/completed/

## Deliverables

### Task 7 Deliverables
1. State mutation audit report (`/reports/state_mutation_audit_20251106.md`)
2. Expanded assertion utilities (`src/simulation/utils/assertions.ts`)
3. Critical phase assertion coverage (top 20 phases updated)
4. Integration test suite (`tests/integration/state-validation.test.ts`)

### Task 8 Deliverables
1. Dependency declaration schema (`docs/phase-dependency-system.md`)
2. PhaseOrchestrator enhancement (`src/simulation/engine/PhaseOrchestrator.ts`)
3. Critical phase dependencies (top 30 phases updated)
4. Circular dependency detection (`src/simulation/utils/dependencyGraph.ts`)

## Timeline

**Day 1:** Research & validation (Quality Gate 1)
**Day 2-3:** Task 7 implementation (state validation)
**Day 4-5:** Task 8 implementation (phase dependencies)
**Day 5:** Architecture review (Quality Gate 2), documentation, archival

## Notes

- This builds on WEEK 2's central config and defensive fallback elimination
- Assertion coverage MUST reach 100% in critical paths (no exceptions)
- Phase dependencies enable future parallelization opportunities
- Both systems are foundational for long-term maintainability
