# Orchestrator Handoff to simulation-maintainer
**Date:** November 7, 2025
**Priority:** CRITICAL
**Agent:** simulation-maintainer (Roy)

## Mission Brief

You are being invoked to execute TWO CRITICAL architecture gaps from the Nov 6, 2025 Architecture Review:

### CRITICAL-1: Assertion Coverage Expansion (3-5 days)
**Current:** 19/117 phases (16.2%) use assertion utilities
**Target:** 111+ phases (95%+ coverage)
**Goal:** Prevent NaN/undefined propagation (Oct 2025 ecology bug pattern)

### CRITICAL-2: Phase Dependency Declarations (2-3 days)
**Current:** 30/117 phases (25.6%) declare dependencies
**Target:** 94+ phases (80%+ coverage)
**Goal:** Eliminate race conditions, ensure deterministic execution order

## Complete Context

You have TWO comprehensive planning documents:

1. `/plans/assertion_coverage_expansion_plan_20251107.md`
   - Full implementation strategy
   - 18 available assertion utilities documented
   - Batch implementation process (10-15 phases per batch)
   - Monte Carlo validation requirements

2. `/plans/simulation_maintainer_handoff_20251107.md`
   - Your specific deliverables
   - Timeline estimates (5-8 days total)
   - Success criteria
   - Communication protocol

## Why You?

From CLAUDE.md:
> **simulation-maintainer**
> **Expertise:** Defensive coding, NaN handling, pictographic event language (emoji conventions), deterministic RNG, phase-based architecture, Monte Carlo validation
> **Deep context:** Assertion utilities, no silent fallbacks, fail-loudly philosophy, research simulation rigor

You created the assertion utilities framework. You understand the Oct 2025 ecology NaN bug. You have the domain knowledge to execute this correctly.

## Research Already Validated

**Quality Gate 1: PASSED**
- WEEK 3 state validation research complete
- Research-backed bounds from peer-reviewed sources:
  - Xia 2022 (nuclear winter temperatures)
  - IPCC AR6 (climate bounds)
  - IMF 2025 (economic metrics)
  - Black Death mortality rates (historical validation)
- No additional research needed - use existing bounds from central config

## Your Execution Plan

### Phase 1: Audit and Prioritization (Day 1)
1. Audit all 98 unvalidated phases
2. Classify by risk (CRITICAL → HIGH → MEDIUM → LOW)
3. Create prioritization list using: `risk_level × execution_frequency × mathematical_complexity`
4. Log audit results to `/logs/simulation_maintainer_progress_20251107.log`

### Phase 2: Batch Implementation (Days 2-5)
**Process:**
- Batch size: 10-15 phases
- Add assertions from `src/simulation/utils/assertions.ts`
- Focus on: calculations, divisions, geometric means, aggregations
- Replace `?? fallback` with `assertStateProperty()`
- Monte Carlo N=3 after EACH batch

**Batch sequence:**
1. CRITICAL risk phases (population, mortality, AI caps, QoL)
2. HIGH risk phases (climate, economy, planetary boundaries)
3. MEDIUM risk phases (social systems, technology)
4. LOW risk phases (read-only, logging)

### Phase 3: Dependency Declarations (Days 6-7)
1. Audit all 87 phases without dependencies
2. Identify implicit dependencies (reads state written by other phases)
3. Add `readonly dependencies` arrays to phase definitions
4. Validate topological sort succeeds (no circular dependencies)
5. Monte Carlo N=3 validation

### Phase 4: Final Validation (Day 7-8)
1. Monte Carlo N=10 full run
2. Performance profiling (before/after comparison)
3. Create completion report
4. Handoff to orchestrator for quality gates

## Available Resources

**Assertion Utilities:** `src/simulation/utils/assertions.ts`
- 18 utilities ready to use (see plan document for full list)
- Core: assertFinite, assertDefined, assertInRange, assertProbability
- Domain: assertMortalityRate, assertTemperatureDelta, assertPopulationChange
- System: assertRegionalConsistency, assertPhaseDependency

**Phase Files:** `src/simulation/engine/phases/` (117 files)

**Phase Orchestrator:** `src/simulation/engine/PhaseOrchestrator.ts`
- Dependency resolution (topological sort)
- Execution order validation

**Validation Tools:**
- `scripts/monteCarloSimulation.ts` - Run N=3 or N=10
- `scripts/auditPhaseDependencies.ts` - Dependency audit

**Research Files:**
- `/plans/completed/week3_task7_state_validation_complete_20251106.md`
- `/plans/completed/week3_task8_phase_dependency_complete_20251106.md`

## Success Criteria

**Assertion Coverage:**
- [ ] 95%+ phases use assertions (111+ of 117)
- [ ] Zero false positives during Monte Carlo N=10
- [ ] Zero NaN errors in results
- [ ] Performance overhead <1%
- [ ] Outcome distribution unchanged (determinism preserved)

**Phase Dependencies:**
- [ ] 80%+ phases declare dependencies (94+ of 117)
- [ ] Zero circular dependencies
- [ ] Deterministic execution order (topological sort stable)
- [ ] Monte Carlo N=10 same results for same seed

## Quality Gates (Orchestrator Will Coordinate)

**Gate 2: Architecture Review**
- After implementation complete, orchestrator invokes architecture-skeptic
- Must address CRITICAL/HIGH issues before documentation

**Gate 3: Documentation**
- After architecture review passes, orchestrator invokes wiki-documentation-updater
- Then architect for archival

## Communication Protocol

**Log file:** `/logs/simulation_maintainer_progress_20251107.log`

**Post updates for:**
- Batch completion
- Monte Carlo validation results
- Issues/blockers
- Phase dependency findings

**Example format:**
```
=== Batch 1 Complete (CRITICAL Risk Phases) ===
Date: 2025-11-07 HH:MM
Phases modified: 12
Assertions added: 47
Monte Carlo N=3: PASSED
  - Zero assertion errors
  - Zero false positives
  - Determinism: 99.9% (maintained)
Next: Batch 2 (HIGH risk phases)
```

## Start Here

1. Read both planning documents thoroughly
2. Read `src/simulation/utils/assertions.ts` to refresh on utilities
3. Begin Phase 1: Audit all 98 unvalidated phases
4. Create prioritization list
5. Log audit results
6. Begin Batch 1 implementation

## Orchestrator Standing By

I will:
- Monitor your progress log
- Coordinate architecture review after completion
- Handle wiki documentation updates
- Archive completion report
- Ensure quality gates are passed

You have full autonomy on implementation details. You're the expert on simulation code.

**Execute with confidence. This is critical infrastructure work.**

---

**Orchestrator: Ready to coordinate quality gates when you complete implementation.**
