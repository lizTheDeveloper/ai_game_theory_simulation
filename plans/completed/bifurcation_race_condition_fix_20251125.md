# CRITICAL-1: Bifurcation Race Condition Fix

**Date Created:** 2025-11-14
**Priority:** CRITICAL
**Estimated Effort:** 2-3 days
**Status:** PHASE 1 - Research (in progress)

## Problem Statement

The bifurcation metrics update in `src/simulation/engine/phases/BifurcationLogicPhase.ts:308-309` uses a weighted moving average that depends on execution order, breaking Monte Carlo determinism.

```typescript
// LINE 308-309: ORDER-DEPENDENT CALCULATION
bifState.metrics.avgDistanceToThresholds =
  bifState.metrics.avgDistanceToThresholds * 0.95 + minDistanceValidated * 0.05;
```

### Root Cause

**Moving average without synchronization:** The 0.95/0.05 weighted average depends on:
1. When BifurcationLogicPhase executes relative to other phases
2. Order of phase execution in PhaseOrchestrator
3. Timing of reads by dependent phases

**Reader phases identified:**
- `StochasticInnovationPhase:245` - reads `varianceAmplification`
- `ClimateSystemPhase:511` - reads `varianceAmplification`
- `ExogenousShockPhase:1237` - reads `varianceAmplification`

### Impact

- ❌ **Monte Carlo non-deterministic** - Same seed → different results
- ❌ **Research reproducibility broken** - Cannot validate findings
- ❌ **Coefficient of variation invalid** - Statistical analysis unreliable
- ⚠️ **Blocks all validation work** - Cannot proceed with god mode analysis, scenario testing

## Success Criteria

1. ✅ Monte Carlo N≥3 runs with same seed produce **identical** results
2. ✅ Coefficient of variation < 0.01% for determinism validation
3. ✅ All phases reading bifurcation state have proper dependency declarations
4. ✅ No change to bifurcation amplification behavior (preserve research validity)
5. ✅ Tests verify determinism across different phase execution orders

## Workflow Phases

### Phase 1: Research & Validation (Quality Gate 1)
**Status:** IN PROGRESS
**Agent:** super-alignment-researcher (Cynthia)
**Duration:** 4-6 hours

**Research questions:**
1. Deterministic state aggregation patterns in discrete-event simulations
2. Moving average implementations in deterministic systems
3. Phase dependency declaration best practices (DAG scheduling, topological sort)
4. Batch accumulation pattern examples (reduce-scatter-gather, event batching)

**Deliverable:** `research/deterministic_state_aggregation_20251114.md`

**Quality Gate 1:** research-skeptic (Sylvia) validation
- [ ] Methodology sound?
- [ ] Contradictory evidence addressed?
- [ ] Recommended pattern appropriate for phase-based architecture?
- [ ] Risk to research validity assessed?

### Phase 2: Implementation
**Status:** PENDING (blocked on Quality Gate 1)
**Agent:** simulation-maintainer (Roy)
**Duration:** 8-12 hours

**Implementation tasks:**
1. Add explicit phase dependency declarations
   - StochasticInnovationPhase depends on BifurcationLogicPhase
   - ClimateSystemPhase depends on BifurcationLogicPhase
   - ExogenousShockPhase depends on BifurcationLogicPhase
   - EmergencyResponsePhase (check if it reads bifurcation state)

2. Implement batch accumulation pattern (if recommended by research)
   - Option A: Accumulate changes during step, apply at phase boundary
   - Option B: Make metric calculation pure (no state mutation)
   - Option C: Explicit synchronization points in PhaseOrchestrator

3. Preserve numeric behavior
   - Weighted average MUST produce identical results
   - Bifurcation amplification behavior unchanged
   - No regression in variance amplification patterns

### Phase 3: Testing & Validation
**Status:** PENDING
**Agent:** simulation-maintainer (Roy) + priya (Monte Carlo)
**Duration:** 4-6 hours

**Test requirements:**
1. Determinism tests
   - Run same simulation with different phase orders
   - Verify identical bifurcation metrics
   - CV < 0.01% for all state fields

2. Regression tests
   - Monte Carlo N=10 with known seeds
   - Compare outcome distributions (before/after)
   - Variance amplification patterns match

3. Edge case tests
   - Simultaneous threshold crossings
   - Extreme variance amplification
   - Phase execution order permutations

### Phase 4: Architecture Review (Quality Gate 2)
**Status:** PENDING
**Agent:** architecture-skeptic
**Duration:** 2-3 hours

**Review criteria:**
- [ ] No performance regressions (O(1) batch accumulation)
- [ ] State propagation correct (no circular dependencies)
- [ ] Dependency graph acyclic (no deadlocks)
- [ ] CRITICAL/HIGH issues addressed before merge

### Phase 5: Monte Carlo Validation
**Status:** PENDING
**Agent:** priya
**Duration:** 2-4 hours

**Validation requirements:**
- N≥3 runs, same seed, 120-240 months
- CV < 0.01% for determinism
- Outcome distributions match pre-fix baseline
- Bifurcation amplification patterns preserved

### Phase 6: Documentation & Archival
**Status:** PENDING
**Agent:** wiki-documentation-updater + architect
**Duration:** 1-2 hours

**Documentation tasks:**
- Update wiki: Bifurcation system section
- Create devlog entry
- Archive plan to `plans/completed/`
- Update roadmap Progress Summary

## Research Standards

Every solution must have:
1. ✅ 2+ peer-reviewed sources for recommended pattern
2. ✅ Code examples from established simulation frameworks
3. ✅ Risk assessment for research validity preservation
4. ✅ Migration path preserving numeric behavior

## Risks & Mitigation

### Risk 1: Changing aggregation breaks research validity
**Likelihood:** MEDIUM
**Impact:** HIGH
**Mitigation:** Validate that new pattern produces identical numeric results for known seeds

### Risk 2: Batch accumulation introduces new race conditions
**Likelihood:** LOW
**Impact:** HIGH
**Mitigation:** Comprehensive determinism tests with phase order permutations

### Risk 3: Performance regression from dependency checking
**Likelihood:** LOW
**Impact:** MEDIUM
**Mitigation:** Dependency declarations are compile-time only, zero runtime overhead

## Timeline

**Total Estimated:** 2-3 days
**Started:** 2025-11-14 06:00 UTC
**Target Completion:** 2025-11-16 EOD

## Communication

**Coordination channel:** Primary coordination surface
**Research channel:** Cynthia + Sylvia for research validation
**Implementation channel:** Roy + Architect for implementation tracking

## Current Status

**Phase 1 (Research):** IN PROGRESS
- [x] Problem analysis complete
- [x] Reader phases identified (3 phases)
- [x] Research task created
- [ ] Research document (`research/deterministic_state_aggregation_20251114.md`)
- [ ] Quality Gate 1 (research-skeptic validation)

**Next Actions:**
1. Await Cynthia research completion
2. Sylvia validation (Quality Gate 1)
3. If PASS → spawn Roy for implementation
4. If FAIL → iterate research or pivot approach

---

**Orchestrator:** Beginning CRITICAL-1 bifurcation race condition fix
**Timeline:** 2-3 days (research → validation → implementation → review → documentation)
**Blocking:** All Monte Carlo validation work
