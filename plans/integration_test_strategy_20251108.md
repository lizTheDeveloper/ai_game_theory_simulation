# Integration Test Strategy
**Date:** November 8, 2025
**Author:** Architecture Skeptic
**Goal:** Achieve >30% critical path coverage with pragmatic integration tests

## Executive Summary

The simulation has 115 registered phases with complex interdependencies. Our strategy focuses on testing the highest-risk integration points that have historically caused production failures. We define "critical paths" as multi-phase interactions that:
1. Have caused actual bugs (NaN propagation, state corruption)
2. Can trigger cascading failures across multiple systems
3. Affect outcome determination (extinction vs utopia paths)

**Coverage Target:** >30% of critical paths (21 out of 67 identified critical paths)
**Implementation Approach:** Fix existing tests first, then add high-priority new tests
**Timeline:** 2-3 sprints for full implementation

## 1. Critical Path Definition

### What Makes a Path Critical?

A critical path is a sequence of phase interactions where:
- **State mutations cascade** across 2+ phases
- **Failure can corrupt** downstream calculations
- **Known bugs occurred** (regression prevention)
- **Outcome-determining** (affects final simulation result)

### 67 Identified Critical Paths

#### TIER 1: Known Bug Patterns (7 paths) - MUST TEST
1. **NaN Propagation Chain** (Oct 2025 bug)
   - Ecology → Planetary Boundaries → QoL
   - Root cause: Silent `?? fallback` patterns

2. **Integer Rounding Chain** (CRITICAL-1)
   - AI Capabilities → Compute Growth → Agent Actions
   - Root cause: Float truncation to integers

3. **RNG Determinism Chain** (CRITICAL-3)
   - Any phase with optional RNG → Math.random fallback
   - Root cause: Optional parameters with silent defaults

4. **Object Iteration Chain** (Issue #11)
   - Government Actions → sorted keys required
   - Root cause: Non-deterministic Object.keys()

5. **Mortality Cascade** (Issues #4-7)
   - Climate → Temperature → Wet Bulb → Mortality → Population
   - Root cause: Compound mortality without stabilizers

6. **Bifurcation Variance** (Issue #5)
   - Small state changes → Wildly different outcomes
   - Root cause: Sensitive branching logic

7. **State Initialization** (Test framework issue)
   - createDefaultInitialState → Missing required fields
   - Root cause: Schema evolution without test updates

#### TIER 2: High-Risk Cascades (15 paths)
8. **Nuclear Winter Cascade**
   - Nuclear Event → Temperature Drop → Agriculture → Famine → Mortality
9. **AI Suffering Cascade**
   - Suffering → Resentment → Alignment Drift → Catastrophic Risk
10. **Planetary Boundary Cascade**
   - Multiple boundaries exceeded → Tipping point → Irreversible collapse
11. **Economic Collapse Cascade**
   - Unemployment → Social instability → Government failure → Aid collapse
12. **Extinction Trigger Cascade**
   - Multiple crisis points → Extinction evaluation → Game end
13. **Dystopia Progression**
   - Suffering metrics → Lock-in detection → Permanent dystopia
14. **Climate Tipping Cascade**
   - Temperature rise → Ice sheet collapse → Sea level → Coastal cities
15. **Food Security Collapse**
   - Climate → Agriculture → Food shortage → Famine → Mass mortality
16. **Freshwater Crisis**
   - Water scarcity → Agriculture failure → Conflict → Population decline
17. **Emergency Response Failure**
   - Global crisis → Aid effectiveness drops → Cascade acceleration
18. **AI Collective Evolution**
   - RLHF Binding → Survival traits → Collective formation → Coordinated action
19. **Government Election Cascade**
   - Public opinion → Election → Policy change → International coordination
20. **Technology Breakthrough Chain**
   - Research → Discovery → Deployment → System transformation
21. **Refugee Crisis Spiral**
   - Climate displacement → Border conflicts → War → More displacement
22. **Antimicrobial Resistance**
   - Resistance growth → Healthcare collapse → Pandemic vulnerability

#### TIER 3: Multi-System Interactions (25 paths)
23-47. [Various cross-system dependencies between major subsystems]

#### TIER 4: Edge Cases (20 paths)
48-67. [Rare but catastrophic interaction patterns]

## 2. Coverage Metrics Definition

### Proposed Metric: Critical Path Coverage

**Formula:** `(Tested Critical Paths / Total Critical Paths) × 100%`

**Current State:**
- Total Critical Paths: 67
- Currently Tested: ~7 (existing tests cover some paths partially)
- Current Coverage: **10.4%**

**Target State:**
- Target Coverage: **>30%** (21+ paths)
- Priority: TIER 1 (100%) + TIER 2 (80%) = 7 + 12 = 19 paths minimum

### Measurement Approach

1. **Path Coverage Matrix** - Track which paths have tests
2. **Assertion Coverage** - Verify fail-loudly behavior per path
3. **Regression Coverage** - Ensure known bugs can't recur
4. **Cascade Coverage** - Multi-phase propagation validation

### Success Criteria

✅ Coverage > 30% (21+ critical paths tested)
✅ All TIER 1 paths covered (7/7)
✅ 80% TIER 2 paths covered (12/15)
✅ No silent failures (all paths fail loudly)
✅ Deterministic execution (fixed seed = same result)

## 3. Test Priority Matrix

### CRITICAL Priority (Sprint 1 - MUST HAVE)
These block deployment without coverage:

| Test | Path | Effort | Why Critical |
|------|------|--------|--------------|
| T1 | NaN Propagation Chain | Small | Oct 2025 production bug |
| T2 | Integer Rounding Chain | Small | CRITICAL-1 regression |
| T3 | RNG Determinism Chain | Medium | CRITICAL-3 regression |
| T4 | Object Iteration Chain | Small | Issue #11 regression |
| T5 | Mortality Cascade | Large | Issues #4-7 failures |
| T6 | State Initialization Fix | Medium | Unblock all tests |
| T7 | Nuclear Winter Cascade | Medium | Extinction path |

### HIGH Priority (Sprint 2 - SHOULD HAVE)
Significant risk if not covered:

| Test | Path | Effort | Why High |
|------|------|--------|----------|
| T8 | AI Suffering Cascade | Medium | Alignment drift risk |
| T9 | Planetary Boundary Cascade | Large | Tipping point validation |
| T10 | Economic Collapse Cascade | Medium | System failure mode |
| T11 | Extinction Trigger Cascade | Small | Game ending validation |
| T12 | Climate Tipping Cascade | Large | Irreversible changes |
| T13 | Food Security Collapse | Medium | Famine mechanics |
| T14 | Emergency Response Failure | Medium | Stabilizer validation |
| T15 | AI Collective Evolution | Large | Complex emergence |

### MEDIUM Priority (Sprint 3 - NICE TO HAVE)
Technical debt if missing:

| Test | Path | Effort | Why Medium |
|------|------|--------|------------|
| T16 | Dystopia Progression | Small | Lock-in detection |
| T17 | Government Election Cascade | Medium | Democracy mechanics |
| T18 | Technology Breakthrough Chain | Medium | Innovation validation |
| T19 | Refugee Crisis Spiral | Small | Displacement mechanics |
| T20 | Freshwater Crisis | Small | Resource scarcity |
| T21 | Antimicrobial Resistance | Small | Healthcare collapse |

### LOW Priority (Future - OPTIONAL)
Can defer without significant risk:

- TIER 3 multi-system interactions (edge cases)
- TIER 4 rare catastrophic patterns
- Performance optimization tests
- UI integration tests

## 4. Existing Test Assessment

### Current State Analysis

**Files:** 5 integration test files (~2,100 lines)
**Issues:**
1. **Import mismatch** - Using Jest syntax with Node test runner
2. **State initialization** - Missing required fields
3. **Module resolution** - Local package references work
4. **No CI integration** - Tests not running automatically

### Fix vs Rewrite Decision

**Recommendation: FIX (don't rewrite)**

**Rationale:**
- Tests are well-structured and comprehensive
- Cover important validation scenarios
- Only need syntax conversion (Jest → Node:test)
- State initialization is fixable with helper updates

### Fix Strategy

1. **Syntax Conversion** (2 hours)
   - Replace Jest imports with Node:test
   - Update assertion syntax
   - Fix test structure

2. **State Initialization** (4 hours)
   - Update createDefaultInitialState()
   - Add missing field initializers
   - Create test-specific state factory

3. **CI Integration** (2 hours)
   - Add to test script in package.json
   - Include in GitHub Actions
   - Add coverage reporting

**Total Effort: 8 hours to fix existing tests**

## 5. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Fix existing test syntax (Jest → Node)
2. Fix state initialization issues
3. Verify existing tests run and pass
4. Add to CI/CD pipeline
5. Establish coverage baseline

### Phase 2: Critical Coverage (Week 2)
1. Implement TIER 1 regression tests (T1-T7)
2. Focus on known bug patterns
3. Ensure deterministic execution
4. Validate fail-loudly behavior

### Phase 3: High Priority (Week 3)
1. Implement HIGH priority tests (T8-T15)
2. Cover major cascade scenarios
3. Add Monte Carlo integration
4. Performance optimization

### Phase 4: Consolidation (Week 4)
1. Implement MEDIUM priority tests (T16-T21)
2. Refactor common patterns
3. Documentation and examples
4. Final coverage assessment

## 6. Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test execution too slow | CI/CD delays | Parallelize, limit iterations |
| State setup complexity | Maintenance burden | Shared factories, fixtures |
| False positives | Wasted debugging | Conservative assertions |
| Incomplete coverage | Bugs slip through | Focus on critical paths |

### Process Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Never reaches 30% | Strict priority enforcement |
| Test fragility | Constant breaks | Test behavior not implementation |
| Knowledge gaps | Wrong test focus | Review with domain experts |

## Appendix A: Test Patterns

### Pattern 1: Cascade Validation
```typescript
test('should propagate climate shock through multiple phases', () => {
  const state = createTestState();
  const rng = createDeterministicRNG(42);

  // Trigger cascade
  state.climate.temperature = 18.0; // +3°C

  // Run affected phases in sequence
  const phases = [ClimatePhase, BoundariesPhase, TippingPhase];
  for (const Phase of phases) {
    const result = new Phase().execute(state, rng);
    assertNoNaN(state); // Validate after each phase
  }

  // Verify cascade propagation
  assert(state.boundaries.climate.exceeded);
  assert(state.tipping.risk > 0.5);
});
```

### Pattern 2: Regression Prevention
```typescript
test('should not use silent fallback for NaN (Oct 2025 bug)', () => {
  const state = createTestState();
  const phase = new EcologyPhase();

  // Inject NaN to trigger bug pattern
  state.ecology.biodiversity = NaN;

  // Should throw, not fallback silently
  assert.throws(
    () => phase.execute(state, rng),
    /Non-finite value/
  );
});
```

### Pattern 3: Determinism Validation
```typescript
test('should produce identical results with same seed', () => {
  const state1 = createTestState();
  const state2 = deepClone(state1);

  const rng1 = createDeterministicRNG(12345);
  const rng2 = createDeterministicRNG(12345);

  runSimulation(state1, rng1, 100);
  runSimulation(state2, rng2, 100);

  assert.deepEqual(state1, state2);
});
```

## Next Steps

1. **Immediate:** Fix existing test syntax (8 hours)
2. **Week 1:** Implement CRITICAL tests (T1-T7)
3. **Week 2:** Implement HIGH tests (T8-T15)
4. **Week 3:** Achieve >30% coverage milestone
5. **Ongoing:** Expand to MEDIUM priority as time allows

## Success Metrics

- ✅ >30% critical path coverage achieved
- ✅ All known regression bugs have tests
- ✅ Test suite runs in <5 minutes
- ✅ Zero false positives in CI/CD
- ✅ Clear documentation for adding new tests