# CRITICAL Architecture Fixes - November 20, 2025

**Status:** IN PROGRESS
**Priority:** BLOCKING - No new features until complete
**Deadline:** Week 1 (CRITICAL issues), Week 2 (HIGH issues)
**Source:** Architecture Review Nov 19, 2025 (`reviews/architecture_review_nov19_2025.md`)

## Executive Summary

Architecture Skeptic review identified CRITICAL issues blocking production readiness:
- Performance: 197ms average vs 120ms budget (164% over)
- Split-brain error handling: Mixed assertions/fallbacks
- Test determinism: RNG leak

**Verdict:** NOT READY for production - STOP new features

## CRITICAL Issues (Week 1)

### Issue 1: Performance Budget Violation
**Current:** 197ms average step time
**Target:** 120ms (164% over budget)
**Root Cause:** 87 registered phases with O(n) orchestration overhead
**Evidence:** Each phase adds ~2.3ms overhead

**Fix Plan:**
1. Profile PhaseOrchestrator hot paths (enable timing)
2. Identify top 10 slowest phases
3. Implement phase batching/grouping
4. Target: <50 total phases

**Effort:** Medium (2-3 days)
**Assigned:** simulation-maintainer + priya (Monte Carlo validation)

### Issue 2: Split-Brain Error Handling
**Current:** 54 instances of `?? fallback` in simulation code
**Problem:** Mixed defensive patterns (assertions + silent fallbacks)
**Impact:** Unpredictable failure modes - some paths fail loud, others silent

**Fix Plan:**
1. Audit all `?? fallback` patterns in src/simulation/
2. Complete migration to assertion utilities
3. Document intentional fallbacks (UI layer only)
4. Zero silent fallbacks in calculation paths

**Effort:** Medium (2-3 days)
**Assigned:** simulation-maintainer

**Files with fallbacks (20 files, 54 instances):**
- src/simulation/organizationManagement.ts (3)
- src/simulation/behavioralDetection.ts (1)
- src/simulation/nitrogenFoodCoupling.ts (1)
- src/simulation/techTree/effectsEngine.ts (4)
- src/simulation/updateNovelEntitiesBoundary.ts (3)
- src/simulation/llm/client.ts (1)
- src/simulation/engine.ts (7)
- src/simulation/techTree/engine.ts (1)
- src/simulation/engine/phases/CriticalJuncturePhase.ts (1)
- src/simulation/endGame.ts (3)
- src/simulation/scenarios/apply.ts (1)
- src/simulation/engine/phases/PlanetaryBoundariesPhase.ts (1)
- src/simulation/engine/phases/IrreversibilityTrackingPhase.ts (7)
- src/simulation/engine/phases/TransitionMortalityPhase.ts (5)
- src/simulation/engine/phases/ResourceSoilPhase.ts (1)
- src/simulation/utils/consciousnessGovernanceUtils.ts (4)
- src/simulation/utils/energyConstrainedCleanup.ts (2)
- src/simulation/utils/assertions.ts (2)
- src/simulation/utils/stateValidation.ts (4)
- src/simulation/qualityOfLife/mortality.ts (2)

### Issue 3: Test Determinism Failure (HIGH)
**File:** tests/integration/novel-entities-irreversibility.test.ts:630
**Problem:** Different seeds producing same results
**Root Cause:** RNG leak (Math.random somewhere)
**Impact:** Monte Carlo validation unreliable

**Fix Plan:**
1. Debug failing test
2. Audit for Math.random usage (should be zero)
3. Ensure RNG threading through all phases

**Effort:** Small (1 day)
**Assigned:** simulation-maintainer

## HIGH Priority (Week 2)

### Issue 4: Phase Explosion
**Current:** 87 phases
**Target:** <50 phases
**Impact:** Each phase adds ~2.3ms overhead
**Root Cause:** O(n) coordination overhead

**Fix Plan:**
1. Consolidate related phases into composite phases
2. Implement phase groups with shared context
3. Reduce orchestration calls

**Effort:** Large (5-7 days)
**Assigned:** simulation-maintainer + architecture-skeptic (review)

### Issue 5: Deep Clone Performance
**Impact:** 5-10ms per structuredClone of GameState
**Locations:** 18+ files

**Fix Plan:**
1. Implement copy-on-write for history
2. Use selective cloning (only changed properties)
3. Consider immutable data structures for hot paths

**Effort:** Medium (3-4 days)

## Workflow Coordination

**Phase 1: Performance Analysis (Day 1-2)**
- Roy: Profile PhaseOrchestrator
- Priya: Baseline Monte Carlo metrics (N=10)
- Output: Performance report identifying bottlenecks

**Phase 2: Split-Brain Audit (Day 2-4)**
- Roy: Scan and fix all `?? fallback` patterns
- Roy: Complete assertion utility migration
- Output: Zero silent fallbacks in simulation code

**Phase 3: Test Determinism (Day 3-4)**
- Roy: Debug RNG leak
- Roy: Audit Math.random usage
- Output: All tests deterministic

**Phase 4: Validation (Day 5-6)**
- Architecture-Skeptic: Re-review fixes
- Priya: Monte Carlo validation (performance + determinism)
- Output: Grade improvement + CV < 0.01%

**Phase 5: Phase Consolidation (Week 2)**
- Roy: Consolidate phases (87 → <50)
- Architecture-Skeptic: Review consolidation plan
- Priya: Validate no regressions

## Success Criteria

**CRITICAL fixes complete when:**
- Performance: <150ms average (interim), <120ms (final)
- Error handling: Zero `?? fallback` in simulation calculations
- Determinism: CV < 0.01% across N=10 runs
- Architecture grade: B- → B+ (minimum)

**High priority complete when:**
- Phases: 87 → <50
- Deep cloning: <3ms per clone
- Architecture grade: B+ → A-

## Reference Documents

- Architecture Review: `reviews/architecture_review_nov19_2025.md`
- Defensive Fallback Analysis: `reviews/defensive_fallback_architecture_review_20251116.md`
- Roadmap Status: `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (line 14: NEW FEATURES BLOCKED)

## Timeline

**Week 1 (Nov 20-26):**
- Day 1-2: Performance profiling + baseline metrics
- Day 2-4: Split-brain error handling audit
- Day 3-4: Test determinism fix
- Day 5-6: Architecture re-review + Monte Carlo validation

**Week 2 (Nov 27-Dec 3):**
- Day 7-13: Phase consolidation (87 → <50)
- Day 10-11: Deep clone optimization
- Day 12-13: Final validation + architecture re-review

**Week 3 (Dec 4-10):**
- Testing and regression validation
- Documentation updates
- Roadmap unblocking (NEW FEATURES permission)

---

**Filed by:** Orchestrator
**Date:** November 20, 2025
**Next:** Spawn simulation-maintainer for performance profiling
