# Architecture Review - November 13, 2025

**Review Type:** Integration & Performance Analysis
**Scope:** Last 30 days of commits with focus on recent major features
**Reviewer:** Architecture Skeptic Agent

## Executive Summary

Reviewed recent major changes including bifurcation validation, scenario framework, phase consolidation, and novel entities implementation. Identified 2 CRITICAL issues requiring immediate attention, 3 HIGH priority performance concerns, and 5 MEDIUM priority technical debt items. The system shows signs of growing complexity with 95 phases (down from 116 but still significant) and emerging state propagation gaps.

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### CRITICAL-1: Race Condition in Bifurcation State Tracking

**Location:** `src/simulation/engine/phases/BifurcationLogicPhase.ts:305`
**Severity:** CRITICAL
**Impact:** Non-deterministic simulation results, breaks Monte Carlo reproducibility

**Problem:** The bifurcation metrics update uses a weighted average with decay (0.95/0.05 split) that depends on execution order. If phases run out of order or multiple phases update bifurcation state in same step, the averaging becomes non-deterministic.

```typescript
// Current implementation has order-dependency
bifState.metrics.avgDistanceToThresholds =
  bifState.metrics.avgDistanceToThresholds * 0.95 + minDistanceValidated * 0.05;
```

**Root Cause:** Moving average calculation without proper synchronization or phase dependency enforcement.

**Recommendation:**
1. Add explicit phase dependency declarations for all phases that read bifurcation state
2. Consider accumulating changes and applying once at end of step
3. Add determinism tests that verify identical results with different phase orders

**Estimated Effort:** MEDIUM (2-3 days)
**Risk if Ignored:** Research results become unreproducible, Monte Carlo analysis invalid

### CRITICAL-2: Missing State Propagation in Novel Entities → Mortality Pipeline

**Location:** `src/simulation/novelEntities.ts` → Bayesian mortality integration
**Severity:** CRITICAL
**Impact:** Novel entities effects not properly contributing to mortality calculations

**Problem:** Novel entities system tracks accumulation (line 79: `ne.accumulatedStock += (monthlyEmissions - monthlyDecay)`) but the mortality integration appears incomplete. The system calls `addMortalityRisk` but doesn't verify the risk actually propagates through the Bayesian network.

**Root Cause:** Incomplete integration between new novel entities system and existing mortality pipeline. The stock tracking was added (Nov 11) but mortality propagation wasn't fully verified.

**Recommendation:**
1. Add integration tests verifying novel entities → mortality propagation
2. Instrument mortality pipeline to log which risks contributed to deaths
3. Verify Bayesian network properly weights chemical exposure risks

**Estimated Effort:** MEDIUM (2-3 days)
**Risk if Ignored:** Major game mechanic (chemical pollution) has no real effect on outcomes

## HIGH PRIORITY (Significant performance/maintainability concerns)

### HIGH-1: O(n) Phase Execution Without Parallelization Opportunities

**Location:** `src/simulation/engine/PhaseOrchestrator.ts` and 95 phase files
**Severity:** HIGH
**Impact:** 95 phases × sequential execution = significant performance bottleneck

**Problem:** Despite phase consolidation (116→95), we still have 95 phases executing sequentially every simulation step. Many phases have artificial dependencies that prevent parallelization even when they don't share state.

**Analysis:**
- Many phases declare dependencies for ordering but don't actually share state
- No phase batching or parallel execution for independent phases
- Each phase has overhead (function calls, context passing, event collection)

**Recommendation:**
1. Identify truly independent phases that can run in parallel
2. Implement phase batching system (run independent phases concurrently)
3. Consider further consolidation - target 50-60 phases maximum

**Estimated Effort:** LARGE (1-2 weeks)
**Risk if Ignored:** Simulation performance degrades as features added, impacts Monte Carlo feasibility

### HIGH-2: Scenario Override System Lacks Validation Boundaries

**Location:** `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts`
**Severity:** HIGH
**Impact:** Scenario overrides can create impossible states

**Problem:** The scenario system directly mutates government state without validating the changes maintain consistency. For example, line 84 sets `totalBudget` without checking if government has the resources, and line 112 adds to `resources` without upper bounds.

```typescript
// Unchecked mutation could create impossible states
state.government.researchInvestments.totalBudget = value; // No validation!
state.government.resources += monthlyClimateSpending; // Can go infinite!
```

**Recommendation:**
1. Add validation layer ensuring overrides respect system constraints
2. Implement maximum bounds based on GDP/population
3. Add warnings when overrides create unrealistic states

**Estimated Effort:** MEDIUM (3-4 days)
**Risk if Ignored:** Scenario testing produces invalid results, undermines research validity

### HIGH-3: Memory Accumulation in Bifurcation Time Series

**Location:** `src/simulation/engine/phases/BifurcationLogicPhase.ts:305-310`
**Severity:** HIGH
**Impact:** Unbounded array growth causes memory exhaustion in long simulations

**Problem:** New instrumentation pushes to `amplificationTimeSeries` array every month without bounds:

```typescript
bifState.metrics.amplificationTimeSeries.push({
  month: state.currentMonth,
  amplification: amplificationValidated,
  distanceToNearest: minDistanceValidated,
  nearestSystem: nearestThresholdName,
});
```

After 1000 months, this is 1000+ objects. Monte Carlo with 100 runs = 100,000+ objects in memory.

**Recommendation:**
1. Implement rolling window (keep last 100 data points)
2. Add periodic aggregation (compute statistics, discard raw data)
3. Make time series optional (only when debugging bifurcation)

**Estimated Effort:** SMALL (1 day)
**Risk if Ignored:** Long simulations and Monte Carlo runs exhaust memory

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### MEDIUM-1: Phase Dependency Graph Complexity

**Location:** Throughout `src/simulation/engine/phases/**/*.ts`
**Severity:** MEDIUM
**Impact:** Hard to reason about execution order, easy to introduce dependency cycles

**Problem:** 50+ phases declare dependencies, creating complex execution graph. Examples:
- `BifurcationLogicPhase` depends on `ai-lifecycle`
- `ResourceWaterPhase` depends on `resource-soil`
- `RadiationSystemPhase` depends on `nuclear_winter`

The dependency graph is implicit and hard to visualize. No validation for cycles.

**Recommendation:**
1. Generate visual dependency graph
2. Add cycle detection at startup
3. Document why each dependency exists
4. Consider reducing coupling between phases

**Estimated Effort:** MEDIUM (3-4 days)

### MEDIUM-2: Inconsistent State Access Patterns

**Location:** Various phases
**Severity:** MEDIUM
**Impact:** Maintenance burden, potential for accessing wrong state

**Problem:** Different phases access state differently:
- Some use assertion utilities (good)
- Some use optional chaining with fallbacks (bad for simulation)
- Some access deeply nested properties without validation

**Recommendation:**
1. Standardize on assertion utilities for all state access
2. Create typed accessors for common patterns
3. Lint rule to flag `?.` and `??` in simulation code

**Estimated Effort:** MEDIUM (4-5 days)

### MEDIUM-3: Missing Cross-System Integration Touchpoints

**Location:** System boundaries
**Severity:** MEDIUM
**Impact:** Systems evolve independently without proper feedback loops

**Identified Gaps:**
1. Nuclear winter → Novel entities (radiation should worsen chemical pollution)
2. AI welfare → Government priorities (happy AIs should influence policy)
3. Climate system → Compute infrastructure (data centers need cooling)
4. Bifurcation state → Technology deployment (chaos should affect tech adoption)

**Recommendation:**
1. Map all system interactions in design doc
2. Add integration points for identified gaps
3. Create integration tests for cross-system effects

**Estimated Effort:** LARGE (1-2 weeks)

### MEDIUM-4: Event System Performance

**Location:** Event generation and collection
**Severity:** MEDIUM
**Impact:** Excessive memory allocation, GC pressure

**Problem:** Each phase generates events that are collected into arrays. With 95 phases, this creates many temporary arrays and objects per step. No event pooling or reuse.

**Recommendation:**
1. Implement event object pooling
2. Use single pre-allocated event buffer
3. Consider event compression for similar events

**Estimated Effort:** MEDIUM (3-4 days)

### MEDIUM-5: Configuration Complexity

**Location:** `state.config` and scenario overrides
**Severity:** MEDIUM
**Impact:** Configuration conflicts, hard to reason about final state

**Problem:** Multiple configuration sources:
- Base configuration in `state.config`
- Scenario overrides in `state.scenario`
- Runtime mutations in phases
- Priority weights that rebalance dynamically

No clear precedence rules or validation of final configuration state.

**Recommendation:**
1. Define clear configuration precedence
2. Add configuration validation phase
3. Log final configuration after all overrides
4. Consider immutable configuration pattern

**Estimated Effort:** MEDIUM (3-4 days)

## LOW PRIORITY (Future improvements, not urgent)

### LOW-1: Test Coverage for Integration Points

Missing integration tests between:
- Bifurcation ↔ Government decisions
- Novel entities ↔ Quality of life
- Scenario system ↔ Phase execution

### LOW-2: Performance Profiling Infrastructure

No built-in performance profiling to identify slow phases. Consider adding timing instrumentation.

### LOW-3: State History Memory Usage

State history tracking for debugging could use compression or sampling for long runs.

### LOW-4: Documentation Debt

Many phases missing documentation about their dependencies and side effects.

### LOW-5: Magic Numbers in Bifurcation Multipliers

Multipliers (1.05×, 1.75×, etc.) should be configurable or at least constantized with research citations.

## RECOMMENDATION

**For the Project Manager:**

I've completed an architectural review and identified 2 critical issues that threaten simulation determinism, 3 high-priority performance concerns, and 5 medium-priority technical debt items.

**Immediate Actions Required:**
1. **Fix CRITICAL-1** (bifurcation race condition) - This breaks Monte Carlo reproducibility
2. **Fix CRITICAL-2** (novel entities integration) - Major feature not properly connected
3. **Address HIGH-3** (memory leak) - Quick fix that prevents memory exhaustion

**Schedule Between Features:**
- HIGH-1 (phase parallelization) - Major performance improvement
- HIGH-2 (scenario validation) - Ensures research validity
- MEDIUM items as time permits

**Risk Assessment:**
The system is functional but showing signs of architectural stress. The phase count (95) and complex dependency graph make the system fragile. Each new feature increases integration complexity. Without addressing the critical issues, research results may be invalid.

**Suggested Approach:**
1. Fix critical issues before ANY new features
2. Implement phase parallelization before next major system
3. Add integration tests for all cross-system touchpoints
4. Consider architectural refactoring if phase count exceeds 100

The codebase is still manageable but approaching a complexity threshold where development velocity will decline without architectural improvements.

---

*Review Complete: November 13, 2025*
*Next Review Recommended: After critical issues addressed*