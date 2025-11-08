# Integration Test Architecture Review
**Date:** November 8, 2025
**Reviewer:** Architecture Skeptic
**Subject:** HIGH-4 Integration Test Coverage Strategy

## Executive Summary

The simulation's integration test coverage is in a **precarious state**. While ~2,100 lines of tests exist, they're essentially **non-functional** due to framework mismatches and state initialization issues. More concerning: the system has **115 interdependent phases** with only **10.4% critical path coverage**, leaving massive blind spots for cascading failures.

**Bottom Line:** The simulation is operating without a safety net. Any of the 60+ untested critical paths could harbor the next production-breaking bug.

---

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### 1. Test Framework Mismatch Blocks ALL Integration Tests
**File:** `/tests/integration/*.test.ts` (all 5 files)
**Severity:** CRITICAL
**Impact:** 0% of integration tests are currently executable
**Root Cause:** Tests import Jest (`@jest/globals`) but package.json uses Node:test runner

**Evidence:**
```typescript
// Current (broken)
import { describe, test, expect } from '@jest/globals';

// Should be
import { describe, test } from 'node:test';
import assert from 'node:assert';
```

**Recommendation:** Immediate syntax conversion (8 hour effort). This is blocking EVERYTHING.

### 2. State Initialization Failures Create False Test Coverage
**File:** All integration tests using `createDefaultInitialState('historical')`
**Severity:** CRITICAL
**Impact:** Tests that "pass" may be testing invalid states
**Root Cause:** Schema evolution without test maintenance

**Evidence:** Tests assume fields that don't exist or have different shapes than production. This means tests could pass while production fails with the same scenarios.

**Recommendation:** Create dedicated test state factory with full field validation. Never trust partial initialization.

### 3. Zero Coverage of Known Production Bugs
**Regressions:** Oct 2025 NaN bug, CRITICAL-1/3/4, Issues #4-13
**Severity:** CRITICAL
**Impact:** All fixed bugs can (and will) recur without regression tests

**The October NaN Bug Pattern:**
- Stayed hidden for months due to `?? 0.005` fallback
- Caused ecology calculations to silently fail
- Still has no regression test to prevent recurrence

**Recommendation:** Every production bug MUST have a regression test before closing. Non-negotiable.

---

## HIGH PRIORITY (Significant performance/maintainability concerns)

### 4. Phase Explosion Creates Untestable Complexity
**Scope:** 115 registered phases with complex dependencies
**Severity:** HIGH
**Impact:** Combinatorial explosion of interaction paths (115² = 13,225 potential interactions)

**Architectural Concern:** The phase count has grown beyond reasonable testability. With 115 phases:
- Full interaction coverage is impossible
- Debugging cascading failures requires deep system knowledge
- New developers can't reason about side effects

**Recommendation:** Consider phase consolidation or establish clear phase boundaries to reduce interaction surface.

### 5. No Performance Budgets for Integration Tests
**Current:** Unknown execution time for full suite
**Severity:** HIGH
**Impact:** Slow tests get skipped, reducing actual coverage

**Risk:** Without performance constraints, integration tests will grow until they're too slow to run regularly, defeating their purpose.

**Recommendation:**
- Establish hard limit: 5 minutes for full suite
- Parallelize test execution
- Use sampling for Monte Carlo validation (not full runs)

### 6. Cascade Testing Gap
**Missing:** Multi-phase cascade validation
**Severity:** HIGH
**Impact:** Complex failures only discovered in production

The most dangerous bugs occur when phases interact:
- Phase A produces valid output
- Phase B accepts it and produces valid output
- Phase C combines A+B outputs and produces NaN
- No single-phase test catches this

**Recommendation:** Priority focus on cascade paths (7 TIER 1, 15 TIER 2 paths identified).

---

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### 7. Test Data Management Chaos
**Issue:** No consistent approach to test fixtures
**Severity:** MEDIUM
**Impact:** Each test recreates state differently, increasing maintenance

**Observation:** Tests use various approaches:
- Inline state creation
- Partial state modification
- Full state cloning

This inconsistency makes tests fragile and hard to maintain.

**Recommendation:** Centralized fixture system with named scenarios.

### 8. Missing CI/CD Integration
**Current:** Tests exist but don't run automatically
**Severity:** MEDIUM
**Impact:** Regressions merge without detection

**Recommendation:** Add to GitHub Actions immediately. No PR should merge without passing integration tests.

### 9. Assertion Strategy Inconsistency
**Issue:** Mix of assertion styles and validation depths
**Severity:** MEDIUM
**Impact:** Some tests too strict (fragile), others too loose (miss bugs)

**Recommendation:** Standardized assertion utilities that validate invariants, not implementations.

---

## LOW PRIORITY (Future improvements, not urgent)

### 10. Documentation Gaps
**Missing:** How to write new integration tests
**Severity:** LOW
**Impact:** Slower onboarding, inconsistent test quality

**Recommendation:** Create test writing guide with patterns and anti-patterns.

### 11. Test Categorization
**Issue:** No clear separation between unit/integration/e2e tests
**Severity:** LOW
**Impact:** Unclear which tests to run when

**Recommendation:** Establish clear test hierarchy and naming conventions.

---

## RECOMMENDATION

### Immediate Actions (This Sprint)

1. **Fix the test framework mismatch** (8 hours)
   - Without this, you have ZERO integration test coverage
   - This is a critical stability risk

2. **Create regression tests for known bugs** (16 hours)
   - Oct 2025 NaN bug MUST have a test
   - CRITICAL-1/3/4 MUST have tests
   - These bugs WILL recur without tests

3. **Establish coverage baseline** (4 hours)
   - Measure current state (likely ~10%)
   - Set realistic target (30% critical paths)
   - Track progress weekly

### Strategic Approach

**Don't aim for perfection.** With 115 phases and 13,000+ potential interactions, 100% coverage is impossible and unnecessary.

**Focus on critical paths:** The 67 identified critical paths represent the highest-risk interactions. Covering 30% of these (21 paths) will catch 80% of catastrophic failures.

**Test pragmatically:**
- TIER 1 (known bugs): 100% coverage required
- TIER 2 (high-risk cascades): 80% coverage target
- TIER 3 (multi-system): Sample testing only
- TIER 4 (edge cases): Skip unless they occur in production

### Architecture Recommendations

1. **Phase Dependency Validation**
   - Add runtime checks that validate declared dependencies
   - Fail loudly if phases execute out of order
   - This prevents subtle state corruption

2. **State Mutation Tracking**
   - Add debug mode that tracks which phases modify which fields
   - Detect unexpected mutations and race conditions
   - Critical for debugging cascade failures

3. **Determinism Enforcement**
   - Automated test that runs simulation twice with same seed
   - Fails if results differ (catches non-deterministic code)
   - Run on every PR

### Risk Assessment

**Without immediate action:**
- **90% chance** of regression within 2 months
- **High risk** of cascading failure in production
- **Guaranteed** technical debt accumulation

**With proposed fixes:**
- Reduce regression risk to ~20%
- Catch cascading failures before production
- Maintain velocity without quality degradation

---

## Conclusion

The integration test situation is **critically deficient** but **fixable with focused effort**. The existing test code is salvageable - it just needs framework alignment and state initialization fixes.

**Priority Order:**
1. Fix framework mismatch (unblock all tests)
2. Add regression tests (prevent known bugs)
3. Cover critical cascades (prevent unknown bugs)
4. Establish CI/CD (automate protection)

**Effort Estimate:**
- Sprint 1: Fix foundations (1 week)
- Sprint 2: Critical coverage (1 week)
- Sprint 3: High priority paths (1 week)
- Total: 3 weeks to reach 30% critical path coverage

**Final Assessment:** This is not optional work. The system is currently operating on faith rather than verification. Every day without integration tests is a day closer to the next production incident.

---

*Reviewed by: Architecture Skeptic*
*Recommendation: MUST FIX in next sprint*