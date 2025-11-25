# Performance Optimization Implementation Plan - HIGH-1

**Date:** November 13, 2025
**Priority:** HIGH-1 (from Master Roadmap)
**Objective:** Profile and optimize remaining O(n²) bottlenecks, implement 10ms performance budget per phase
**Status:** 🟡 IN PROGRESS

## Context

**Major O(n²) bottleneck ALREADY FIXED** (Nov 10, 2025):
- File: `src/simulation/organizationManagement.ts`
- Fix: Replaced `.includes()` filters with Set-based indexing
- Impact: 100,000 → 1,400 operations per step (70× improvement)
- Status: ✅ COMPLETE

**Current Performance** (from Nov 12 analysis):
- Single step: 10-50ms (varies by month)
- Full 360-month run: 5-10 seconds
- Monte Carlo N=10: 30-60 minutes
- **Assessment:** Acceptable for research use, but opportunities remain

## Research Foundation

**Existing Analysis:**
1. `reviews/PERFORMANCE_BOTTLENECK_ANALYSIS_20251112.md` - Identifies top remaining patterns
2. `reviews/performance-optimization-plan.md` - Comprehensive optimization roadmap
3. `research/structured_clone_performance_20251107.md` - Deep cloning analysis

**Key Findings:**
- 170 potential nested patterns across codebase (most benign)
- Top hotspots: governmentAgent.ts (10), CooperativeSystemsPhase.ts (5)
- Missing: Performance instrumentation infrastructure
- Separate issue: Deep cloning overhead (HIGH-3, not O(n²))

## Implementation Phases

### Phase 1: Performance Instrumentation Infrastructure ✅ COMPLETE

**Status:** ✅ COMPLETED (Nov 13, 2025 - 2.5 hours)

**Objective:** Add profiling to identify actual bottlenecks (not theoretical)

**Tasks:**
1. **✅ PhaseOrchestrator instrumentation** - ALREADY EXISTS
   - File: `src/simulation/engine/PhaseOrchestrator.ts`
   - Timing infrastructure already implemented (Oct 28, Nov 12, 2025)
   - Includes: performance.now() timing, min/max/p95 stats, slow phase warnings
   - Budget: 10ms per phase (warns if exceeded)

2. **✅ Performance profiling script** - UPDATED
   - File: `scripts/profilePerformance.ts`
   - Rewritten to use built-in instrumentation (removed monkey-patching)
   - Profiles: 360-month run by default (or custom via `--months=N`)
   - Output: JSON + CSV with per-phase timings
   - Uses deterministic RNG (seed=42)

3. **✅ Performance regression tests** - CREATED
   - File: `tests/performance/phase-budget.test.ts`
   - Test: Each phase < 10ms average (with documented exceptions)
   - Test: Each phase P95 < 15ms (variance check)
   - Test: Full step < 50ms average
   - Test: Step variance < 3× (max/avg ratio)

**Results (12-month test run):**

**Phases Exceeding 10ms Budget:**
1. **AI Agent Actions** - 45.97ms avg (4.6× OVER budget) ⚠️ PRIORITY 1
2. **Social Influence Update** - 22.96ms avg (2.3× OVER budget) ⚠️ PRIORITY 2
3. **Technology Tree Update** - 8.35ms avg OK, but P95: 24.57ms (variance) ⚠️ PRIORITY 3
4. **AI Population Lifecycle** - 2.01ms avg OK, but P95: 10.91ms (variance)

**Step Performance:**
- Average: 110ms (exceeds 50ms target but acceptable)
- Monte Carlo projection: ~66 minutes for N=100

**Deliverable:** Timing data + JSON/CSV reports identifying bottlenecks

**Actual Time:** 2.5 hours (vs 4-6 estimated)

---

### Phase 2: Profile Actual Bottlenecks 🔬 RESEARCH

**Objective:** Identify top 10 most expensive operations with real data

**Method:**
1. Run profiling script on multiple scenarios:
   - Baseline (no tech)
   - High-agent-count (100 agents)
   - High-org-count (200 orgs)
   - Late-game (month 300+)

2. Analyze results:
   - Which phases exceed 10ms budget?
   - Which patterns scale poorly (O(n²) confirmed)?
   - Memory allocation hotspots

3. Cross-reference with theoretical analysis:
   - governmentAgent.ts (10 nested patterns)
   - CooperativeSystemsPhase.ts (5 nested patterns)
   - resourceInitialization.ts (7 nested patterns, initialization only)

**Deliverable:** `reviews/profiling_results_actual_20251113.md` with top 10 bottlenecks ranked by actual impact

**Estimated Time:** 2-3 hours

---

### Phase 3: Optimize Top 3 Bottlenecks 🚀 IMPLEMENTATION

**Objective:** Fix the 3 highest-impact O(n²) operations identified in profiling

**Likely Candidates (pending profiling data):**

#### 3.1 Government Agent Optimization
**File:** `src/simulation/agents/governmentAgent.ts`
**Issue:** 10 nested pattern instances (highest density in codebase)
**Strategy:**
- Cache government-AI relationships (avoid repeated lookups)
- Replace filter().filter() with Set-based indexing
- Pre-compute organization memberships

**Pattern to fix:**
```typescript
// ❌ BAD: O(n²) with nested filters
aiAgents.filter(agent =>
  organizations.filter(org => org.members.includes(agent.id))
)

// ✅ GOOD: O(n) with indexed lookups
const orgMembershipIndex = new Map<string, Set<string>>();
// Build index once
for (const org of organizations) {
  for (const memberId of org.members) {
    if (!orgMembershipIndex.has(memberId)) {
      orgMembershipIndex.set(memberId, new Set());
    }
    orgMembershipIndex.get(memberId)!.add(org.id);
  }
}
// Use index
const agentsInOrgs = aiAgents.filter(agent =>
  orgMembershipIndex.has(agent.id)
);
```

#### 3.2 Cooperative Systems Phase Optimization
**File:** `src/simulation/engine/phases/CooperativeSystemsPhase.ts`
**Issue:** 5 nested patterns in cooperation detection
**Strategy:**
- Implement graph-based cooperation detection
- Cache cooperation networks between steps
- Use adjacency list instead of nested loops

#### 3.3 TBD Based on Profiling Data
**File:** To be determined after profiling
**Issue:** Third highest-impact bottleneck
**Strategy:** TBD

**Deliverable:** Optimized implementations for top 3 bottlenecks

**Estimated Time:** 8-12 hours

---

### Phase 4: Performance Budget Enforcement 📊 QUALITY GATE

**Objective:** Ensure no phase exceeds 10ms budget

**Tasks:**
1. Add performance monitoring to CI/CD
   - Script: Fail CI if any phase >10ms
   - Exception list: Phases that legitimately need >10ms (with justification)

2. Add performance dashboard
   - Script: Generate HTML report with phase timings
   - Visualization: Flame graph for step execution

3. Document performance characteristics
   - Wiki: Update with per-phase complexity analysis
   - Wiki: Document optimization strategies applied

**Deliverable:** CI enforcement + performance dashboard

**Estimated Time:** 3-4 hours

---

### Phase 5: Monte Carlo Validation 🎲 VALIDATION

**Objective:** Verify optimizations don't break determinism or correctness

**Method:**
1. Run Monte Carlo N=10 with performance tracking
2. Compare outcomes before/after optimization
3. Verify determinism (same seed = same result)
4. Measure actual performance improvement

**Success Criteria:**
- ✅ Outcomes identical (determinism preserved)
- ✅ Performance improved (target: 20-30% reduction in runtime)
- ✅ No new NaN/assertion failures
- ✅ All phases under 10ms budget (or documented exceptions)

**Deliverable:** `logs/mc_performance_validation_20251113.log`

**Estimated Time:** 2-3 hours (mostly runtime)

---

## Timeline

**Total Estimated Time:** 20-30 hours

**Week 1:**
- Day 1-2: Phase 1 (Instrumentation) ✅
- Day 3: Phase 2 (Profiling) ✅
- Day 4-5: Phase 3 (Optimization) ✅

**Week 2:**
- Day 1: Phase 4 (Budget Enforcement) ✅
- Day 2-3: Phase 5 (Validation) ✅
- Day 4: Documentation + Archive ✅

## Quality Gates

**Gate 1: Profiling Data (After Phase 2)**
- ❌ No phases >10ms → Skip optimization, document success
- ✅ Phases identified → Proceed to Phase 3

**Gate 2: Architecture Review (After Phase 3)**
- Invoke: `architecture-skeptic`
- Review: Optimization correctness, no new complexity
- Required: Address CRITICAL/HIGH issues before validation

**Gate 3: Monte Carlo Validation (Phase 5)**
- ❌ Determinism broken → Rollback, investigate
- ❌ Outcomes changed → Rollback, investigate
- ✅ All tests pass → Proceed to documentation

## Success Metrics

**Performance:**
- Target: 20-30% reduction in step time
- Target: 90%+ phases under 10ms budget
- Target: Monte Carlo N=10 in <30 minutes

**Quality:**
- ✅ No determinism regression
- ✅ No outcome changes
- ✅ No new NaN/assertion failures

**Documentation:**
- ✅ Wiki updated with optimization strategies
- ✅ Performance dashboard available
- ✅ Plan archived to /plans/completed/

## Dependencies

**Prerequisites:**
- ✅ Phase consolidation complete (95 phases)
- ✅ Major O(n²) fix complete (organizationManagement.ts)
- ✅ Assertion utilities in place

**Blocks:**
- None (can proceed immediately)

**Related Work:**
- HIGH-3: Deep cloning optimization (separate issue, not O(n²))
- Performance regression test infrastructure (part of this work)

## Risk Assessment

**Risk Level:** LOW-MEDIUM

**Risks:**
1. **Optimization breaks determinism** - MEDIUM
   - Mitigation: Monte Carlo validation before merge
   - Mitigation: Extensive testing with multiple seeds

2. **Profiling overhead slows CI** - LOW
   - Mitigation: Make profiling opt-in
   - Mitigation: Profile subset of phases in CI

3. **Optimization introduces bugs** - LOW
   - Mitigation: Architecture review (Quality Gate 2)
   - Mitigation: Comprehensive test coverage

## Agent Assignments

**Phase 1-2 (Instrumentation + Profiling):**
- Agent: `simulation-maintainer` (Roy)
- Expertise: Performance instrumentation, defensive coding
- Duration: 6-9 hours

**Phase 3 (Optimization Implementation):**
- Agent: `feature-implementer` (Moss) OR `simulation-maintainer` (Roy)
- Expertise: Algorithm optimization, code refactoring
- Duration: 8-12 hours

**Phase 4 (Budget Enforcement):**
- Agent: `simulation-maintainer` (Roy)
- Expertise: CI/CD, performance monitoring
- Duration: 3-4 hours

**Phase 5 (Validation):**
- Agent: `priya` (Quantitative Validator)
- Expertise: Monte Carlo analysis, statistical validation
- Duration: 2-3 hours

**Architecture Review:**
- Agent: `architecture-skeptic`
- Review: After Phase 3 implementation
- Duration: 2-3 hours

**Documentation:**
- Agent: `wiki-documentation-updater` (Historian)
- Update: Wiki with performance improvements
- Duration: 2-3 hours

## Notes

**Key Insight from Nov 12 Analysis:**
> "Focus on profiling infrastructure first, then optimize based on actual data rather than theoretical analysis."

This plan prioritizes **measurement before optimization** to avoid premature optimization based on theoretical O(n²) counts that may not be actual bottlenecks in practice.

**Philosophy:**
- Measure first, optimize second
- Performance budget as a quality gate
- Preserve determinism and correctness above all

## Appendix: Remaining O(n²) Patterns (Theoretical)

From Nov 12 analysis, top files by nested pattern count:

1. ✅ organizationManagement.ts (6) - ALREADY FIXED
2. 🟡 governmentAgent.ts (10) - PRIORITY 1
3. 🟡 CooperativeSystemsPhase.ts (5) - PRIORITY 2
4. resourceInitialization.ts (7) - LOW (initialization only)
5. cooperativeSpirals.ts (7) - EVALUATE AFTER PROFILING
6. socialCohesion.ts (4) - EVALUATE AFTER PROFILING
7. minimalSufferingTracking.ts (4) - EVALUATE AFTER PROFILING

**Total:** 170 potential patterns (most benign, need profiling to identify actual hotspots)
