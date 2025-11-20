# Handoff to Roy (simulation-maintainer) - CRITICAL Architecture Fixes

**Date:** November 20, 2025
**From:** Orchestrator
**To:** Roy (simulation-maintainer)
**Priority:** CRITICAL - BLOCKING all new features
**Context:** Architecture review Nov 19, 2025 identified production-blocking issues

## Mission

Fix THREE CRITICAL issues preventing production readiness:

1. **Performance budget violation** (197ms vs 120ms target)
2. **Split-brain error handling** (54 instances of `?? fallback`)
3. **Test determinism failure** (RNG leak)

## Task 1: Performance Profiling (Day 1-2)

**Objective:** Identify performance bottlenecks in PhaseOrchestrator

**Steps:**
1. Enable timing in PhaseOrchestrator (add --timing flag support)
2. Run N=5 Monte Carlo simulation with timing enabled
3. Identify top 10 slowest phases
4. Analyze phase consolidation opportunities
5. Document findings in `reviews/performance_profiling_20251120.md`

**Expected Output:**
- Timing breakdown per phase
- Top 10 bottlenecks
- Phase grouping recommendations
- Target: Identify path to <120ms average

**Current State:**
- 87 registered phases (confirmed: `grep registerPhase src/simulation/engine.ts | wc -l`)
- Each phase adds ~2.3ms overhead (O(n) orchestration)
- Average step time: 197ms (164% over budget)

## Task 2: Split-Brain Error Handling Audit (Day 2-4)

**Objective:** Complete migration to assertion utilities (zero silent fallbacks)

**Current State:**
- 54 instances of `?? fallback` in simulation code (20 files)
- Mixed defensive patterns: some assertions, some silent fallbacks
- Creates unpredictable failure modes

**Steps:**
1. Audit all 54 instances in these files:
   - organizationManagement.ts (3)
   - behavioralDetection.ts (1)
   - nitrogenFoodCoupling.ts (1)
   - techTree/effectsEngine.ts (4)
   - updateNovelEntitiesBoundary.ts (3)
   - llm/client.ts (1)
   - engine.ts (7)
   - techTree/engine.ts (1)
   - CriticalJuncturePhase.ts (1)
   - endGame.ts (3)
   - scenarios/apply.ts (1)
   - PlanetaryBoundariesPhase.ts (1)
   - IrreversibilityTrackingPhase.ts (7)
   - TransitionMortalityPhase.ts (5)
   - ResourceSoilPhase.ts (1)
   - consciousnessGovernanceUtils.ts (4)
   - energyConstrainedCleanup.ts (2)
   - assertions.ts (2)
   - stateValidation.ts (4)
   - qualityOfLife/mortality.ts (2)

2. For each instance:
   - Is this a calculation path? → Replace with assertion
   - Is this UI/display? → Document as intentional, move to UI layer if possible
   - Is this initialization? → Document as intentional
   - Is this compatibility layer? → Document as intentional

3. Replace calculation fallbacks with:
   - `assertFinite(value, context)` for NaN/Infinity
   - `assertDefined(value, context)` for undefined/null
   - `assertStateProperty(obj, 'path', context)` for `?? fallback` patterns
   - `assertInRange(value, min, max, context)` for bounds
   - `assertProbability(value, context)` for [0, 1] values

4. Document findings in `reviews/split_brain_audit_20251120.md`

**Expected Output:**
- Zero `?? fallback` in calculation paths
- All intentional fallbacks documented with rationale
- Report of changes with before/after examples

**Reference:**
- Assertion utilities: `src/simulation/utils/assertions.ts`
- Previous audit: `reviews/defensive_fallback_architecture_review_20251116.md`

## Task 3: Test Determinism Fix (Day 3-4)

**Objective:** Fix RNG leak causing test failures

**Current Issue:**
- File: `tests/integration/novel-entities-irreversibility.test.ts:630`
- Problem: Different seeds producing same results
- Root cause: Math.random() usage somewhere (RNG not threaded)

**Steps:**
1. Debug failing test - why are different seeds producing same results?
2. Audit for Math.random() usage: `grep -r "Math.random" src/simulation/`
3. Ensure RNG properly threaded through all phases
4. Verify fix with test run
5. Document findings in `reviews/test_determinism_fix_20251120.md`

**Expected Output:**
- Zero Math.random() calls in simulation code
- Test passing with different results for different seeds
- RNG threading verification

**Defensive Pattern:**
```typescript
// ❌ WRONG - Optional RNG with Math.random fallback
function simulate(rng?: () => number) {
  const random = rng || Math.random;
}

// ✅ CORRECT - Required RNG with assertion
function simulate(rng: () => number) {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }
  const random = rng;
}
```

## Coordination

**After Task 1:** Priya will run baseline Monte Carlo (N=10) for comparison
**After Task 2:** Architecture-Skeptic will review error handling changes
**After Task 3:** Full Monte Carlo validation (N=10) to confirm determinism

**Next Steps After Completion:**
1. Architecture re-review (Architecture-Skeptic)
2. Monte Carlo validation (Priya)
3. Week 2: Phase consolidation (87 → <50)

## Success Criteria

**Performance:** <150ms average (interim target)
**Error Handling:** Zero `?? fallback` in simulation calculations
**Determinism:** Test passes, different seeds → different results

**Timeline:** 3-4 days for all three tasks

---

**Plan:** `/plans/CRITICAL_ARCHITECTURE_FIXES_20251120.md`
**Branch:** `auto/worker-20251120_040003`
**Report Issues To:** Orchestrator via plan updates

Begin with Task 1 (performance profiling). Good luck, Roy.
