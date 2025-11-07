# Simulation Maintainer Handoff: CRITICAL Architecture Gaps

**Date:** November 7, 2025
**From:** Orchestrator
**To:** simulation-maintainer (Roy)
**Priority:** CRITICAL
**Timeline:** 5-8 days total

## Mission

Fix two CRITICAL architectural gaps identified in Nov 6 Architecture Review:

### CRITICAL-1: Incomplete Assertion Coverage (3-5 days)
**Current:** 19 of 117 phases (16.2%) use assertion utilities
**Target:** 111+ phases (95%+ coverage)
**Impact:** 86% of phases allow NaN/undefined propagation without detection

### CRITICAL-2: Phase Dependency Declaration Gap (2-3 days)
**Current:** 30 of 117 phases (25.6%) declare dependencies
**Target:** 94+ phases (80%+ coverage)
**Impact:** Race conditions in state updates, non-deterministic behavior

## Why You (simulation-maintainer)?

From CLAUDE.md:
> **simulation-maintainer**
> **When:** Any simulation code changes (src/simulation/, src/types/game.ts, phases)
> **Expertise:** Defensive coding, NaN handling, pictographic event language (emoji conventions), deterministic RNG, phase-based architecture, Monte Carlo validation
> **Deep context:** Assertion utilities, no silent fallbacks, fail-loudly philosophy, research simulation rigor

You have:
1. Deep knowledge of assertion utilities (`src/simulation/utils/assertions.ts`)
2. Understanding of fail-loudly philosophy vs defensive fallbacks
3. Experience with Monte Carlo validation
4. Knowledge of phase architecture and execution order
5. Context on Oct 2025 ecology NaN bug (the reason we need this)

## Background

### The Oct 2025 Ecology NaN Bug
A silent `?? 50` fallback in `planetaryBoundaries.ts:969` hid NaN for months. The bug only surfaced when multiple systems failed simultaneously. This is the pattern we're preventing.

### WEEK 1-4 Progress
- WEEK 2: Eliminated 15 CRITICAL/HIGH defensive fallbacks
- WEEK 3: Created state validation framework with research-backed bounds
- WEEK 3: Added phase dependency system with topological sort
- **Gap:** Framework exists but only 16% adoption for assertions, 26% for dependencies

### Architecture Health: 8.5/10
- Improved from 7.0/10 after WEEK 1-4
- Remaining gaps: Assertion coverage, dependency declarations
- **Goal:** Reach 9.0/10 after this work

## Your Deliverables

### Part 1: Assertion Coverage Expansion (3-5 days)

**Process:**
1. **Audit** all 98 unvalidated phases in `src/simulation/engine/phases/`
2. **Classify** by risk:
   - CRITICAL: Modifies population, mortality, AI capabilities, QoL
   - HIGH: Modifies climate, economy, planetary boundaries
   - MEDIUM: Modifies social systems, technology
   - LOW: Read-only analysis, logging
3. **Implement** in batches of 10-15 phases:
   - Add assertions using utilities from `src/simulation/utils/assertions.ts`
   - Focus on calculations (division, geometric means, aggregations)
   - Replace any remaining `?? fallback` patterns with `assertStateProperty()`
   - Use domain-specific validators (assertMortalityRate, assertTemperatureDelta, etc.)
4. **Validate** after each batch:
   - Monte Carlo N=3
   - Zero assertion errors during normal operation
   - Zero false positives
   - Type checks pass
   - Determinism maintained

**Available Assertion Utilities:**
See `/plans/assertion_coverage_expansion_plan_20251107.md` for full list of 18 utilities.

**Prioritization Heuristic:**
`risk_level × execution_frequency × mathematical_complexity`

**Examples of Critical Phases:**
- Population modification phases (high mortality impact)
- Climate calculation phases (temperature, CO2, tipping points)
- AI capability updates (discrete levels, must be integers)
- Economic calculations (GDP, spending, must be finite)
- Planetary boundary updates (research-validated ranges)

### Part 2: Phase Dependency Declarations (2-3 days)

**Process:**
1. **Audit** all 87 phases without dependencies
2. **Identify** implicit dependencies:
   - Reads state written by another phase
   - Expects another phase to run first
   - Would produce incorrect results if run out of order
3. **Add** explicit `readonly dependencies` arrays to phase definitions
4. **Validate**:
   - PhaseOrchestrator topological sort succeeds
   - Zero circular dependencies detected
   - Monte Carlo N=3 shows deterministic execution order

**Example Pattern:**
```typescript
class MortalityStabilizersPhase implements Phase {
  id = 'mortality_stabilizers';
  order = 50;
  readonly dependencies = ['climate_impact_cascade', 'food_security_update'];

  execute(state: GameState, context: PhaseContext): void {
    // This phase depends on climate impacts and food security being updated first
    assertPhaseDependency(context, 'climate_impact_cascade', {
      currentPhase: 'mortality_stabilizers',
      reason: 'Must calculate stabilizers after climate impacts known',
      month: state.currentMonth
    });

    // ... rest of implementation
  }
}
```

**Focus Areas:**
- Population update chains (mortality → stabilizers → population adjustment)
- Climate cascade chains (emissions → temperature → impacts → mortality)
- Economy chains (GDP → spending → technology → AI)
- AI lifecycle chains (spawning → capability → evaluation → lifecycle)

## Success Criteria

**Assertion Coverage:**
- [ ] 95%+ of critical-state-modifying phases use assertions
- [ ] Zero false positives during Monte Carlo N=10
- [ ] Zero NaN errors propagated to results
- [ ] Performance overhead <1%
- [ ] Monte Carlo outcome distribution unchanged (behavior preserved)

**Phase Dependencies:**
- [ ] 80%+ of phases declare explicit dependencies
- [ ] Zero circular dependencies detected
- [ ] Deterministic execution order (topological sort stable)
- [ ] Monte Carlo N=10 shows same results for same seed

**Quality Gates:**
- [ ] Architecture review (invoke architecture-skeptic after completion)
- [ ] Address CRITICAL/HIGH issues from review
- [ ] Wiki documentation updated

## Workflow

### Your Process
1. **Read** background materials:
   - `/reviews/architecture-integration-review_20251106.md`
   - `/plans/assertion_coverage_expansion_plan_20251107.md`
   - `src/simulation/utils/assertions.ts`
2. **Audit** phases (create prioritization list)
3. **Implement** CRITICAL-1 in batches:
   - Batch 1: 10-15 CRITICAL risk phases → Monte Carlo N=3
   - Batch 2: 10-15 HIGH risk phases → Monte Carlo N=3
   - Batch 3-6: Remaining phases in batches → Monte Carlo N=3 each
4. **Implement** CRITICAL-2:
   - Audit implicit dependencies
   - Add dependency declarations
   - Validate with topological sort
5. **Final validation**:
   - Monte Carlo N=10 full run
   - Performance profiling (before/after comparison)
   - Create completion report

### Orchestrator's Role
I will:
- Monitor your progress (check logs, chatroom posts)
- Invoke architecture-skeptic for final review
- Coordinate quality gates
- Handle wiki documentation updates (invoke wiki-documentation-updater)
- Archive completion report (invoke architect)

### Communication
Post to `/logs/simulation_maintainer_progress_20251107.log` with:
- Batch completion updates
- Monte Carlo validation results
- Issues/blockers encountered
- Phase dependency findings

## Resources

**Plans:**
- `/plans/assertion_coverage_expansion_plan_20251107.md` - Full implementation plan
- `/plans/phase_dependency_system_implementation_20251106.md` - Dependency system design

**Code:**
- `src/simulation/utils/assertions.ts` - Assertion utilities (1123 lines)
- `src/simulation/engine/PhaseOrchestrator.ts` - Phase execution + dependency resolution
- `src/simulation/engine/phases/` - 117 phase files

**Reviews:**
- `/reviews/architecture-integration-review_20251106.md` - Nov 6 Architecture Review (Grade: 8.5/10)
- `/plans/completed/week3_task7_state_validation_complete_20251106.md` - State validation framework
- `/plans/completed/week3_task8_phase_dependency_complete_20251106.md` - Dependency system

**Validation:**
- `scripts/monteCarloSimulation.ts` - Monte Carlo validation script
- `scripts/auditPhaseDependencies.ts` - Dependency audit tooling

## Expected Timeline

**Day 1-2:** Audit + Batch 1-2 (CRITICAL/HIGH phases, ~25 phases)
**Day 3-4:** Batch 3-4 (MEDIUM phases, ~30 phases)
**Day 5:** Batch 5-6 (remaining phases, ~43 phases)
**Day 6:** Phase dependency declarations (87 phases)
**Day 7:** Final Monte Carlo N=10 + performance profiling
**Day 8:** Buffer for issues/rework

## Questions?

If you encounter:
- **Research questions** (e.g., "What's the right bound for X?"): Check central config first, then research files
- **Architecture questions** (e.g., "Should this be a new utility?"): Use judgment, document rationale
- **Blockers** (e.g., "Assertions failing on legitimate states"): Log details, adjust bounds conservatively

You have deep domain knowledge. Trust your judgment. The orchestrator will coordinate quality gates, but you're the expert on simulation code.

## Ready?

You have everything you need:
- Clear mission (95%+ assertion coverage, 80%+ dependency coverage)
- Existing utilities (18 assertion functions ready to use)
- Validation process (Monte Carlo N=3 after each batch)
- Success criteria (zero false positives, <1% overhead, determinism maintained)

Begin with Phase 1: Audit and prioritization. Create `/logs/simulation_maintainer_progress_20251107.log` and start logging your work.

**Orchestrator standing by for quality gates and coordination.**

---

*From the Orchestrator: This is critical infrastructure work. The Oct 2025 ecology NaN bug showed what happens when we lack assertion coverage. You're preventing the next one. Take your time, validate thoroughly, and create the foundation for sustainable architecture health.*
