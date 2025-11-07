# Assertion Coverage Expansion Plan
**Date:** November 7, 2025
**Priority:** CRITICAL-1 from Architecture Review
**Timeline:** 3-5 days implementation + validation

## Problem Statement

**Current State:**
- 117 total phase files in `src/simulation/engine/phases/`
- 19 phases use assertion utilities (16.2% coverage)
- 98 phases lack assertions (83.8% unvalidated)

**Risk:**
- Silent NaN/undefined propagation without detection
- Oct 2025 ecology NaN bug pattern could repeat
- Research invalidity from data corruption

**Goal:**
- Achieve 95%+ assertion coverage (target: 111+ phases)
- Zero false positives (assertions only fail on real bugs)
- Monte Carlo N=10 passes with zero NaN errors

## Existing Assertion Utilities

Located in `src/simulation/utils/assertions.ts`:

### Core Validators
1. **assertFinite(value, context)** - Rejects NaN/Infinity
2. **assertDefined(value, context)** - Rejects undefined/null
3. **assertInRange(value, min, max, context)** - Validates numeric ranges
4. **assertProbability(value, context)** - Validates [0, 1] range
5. **assertNonEmpty(array, context)** - Validates array has elements

### Domain-Specific Validators
6. **assertStateProperty(obj, 'path', context)** - Replaces `?? fallback` patterns
7. **assertMortalityRate(rate, context)** - Max 50% monthly (Black Death reference)
8. **assertTemperatureDelta(delta, context)** - Range [-20, +10]°C per month
9. **assertPopulationChange(new, old, context)** - Max ±50% per month
10. **assertAICapability(cap, context)** - Integer in [0, 5]
11. **assertPlanetaryBoundary(value, type, context)** - Research-validated bounds
12. **assertEconomicMetric(value, type, context)** - GDP, spending, taxation ranges
13. **assertShockMagnitude(delta, context)** - Range [-1.0, 0.5]
14. **assertResourceAllocation(fraction, context)** - Range [0, 1]

### System Validators
15. **assertRegionalConsistency(state)** - Population/capacity/deaths sum validation
16. **assertPhaseDependency(context, requiredPhaseId, info)** - Race condition prevention
17. **assertPhaseNotExecuted(context, prohibitedPhaseId, info)** - Ordering validation
18. **capWithBifurcationAwareness(value, bound, context)** - Caps without failing during regime shifts

## Research Questions for super-alignment-researcher

### 1. Best Practices for Assertion-Based Validation in Research Simulations

**Context:** We need to expand assertion coverage from 16% to 95% without introducing false positives.

**Questions:**
- What are peer-reviewed best practices for validation in deterministic research simulations?
- How do climate models (CESM, GFDL) validate intermediate calculations?
- What patterns do economics simulations use to detect NaN propagation early?
- Are there established heuristics for "which calculations need assertions most"?

**Sources to explore:**
- Climate model validation frameworks (CMIP6, CESM documentation)
- Economics simulation validation (DSGE model testing)
- Software engineering research on fail-fast assertions vs defensive programming
- Monte Carlo simulation quality assurance literature

### 2. False Positive Risk in Assertion-Based Validation

**Context:** We need assertions that catch real bugs without failing on legitimate edge cases.

**Questions:**
- What tolerance levels are used for floating-point assertions in research code?
- How do established simulations handle legitimate regime shifts vs calculation errors?
- What patterns minimize false positives while maximizing bug detection?
- Are there established "assertion density" guidelines (e.g., 1 assertion per N calculations)?

**Sources to explore:**
- Numerical stability research in climate models
- IEEE 754 floating-point best practices for scientific computing
- Software testing literature on assertion coverage vs false positive rates

### 3. Performance Impact of Assertion-Based Validation

**Context:** We need assertions in hot paths without degrading performance.

**Constraints:**
- Target: <1% performance overhead
- 117 phases execute 37 times per simulation step
- Monte Carlo runs: N=10 to N=20 (10-20 simulation runs)

**Questions:**
- What is the typical performance overhead of assertion checks in production simulations?
- Do climate models disable assertions in production runs? (Or keep them always-on?)
- Are there established patterns for "lightweight" vs "heavyweight" assertions?
- Should we use compilation flags to enable/disable assertions? (TypeScript limitations)

**Sources to explore:**
- Performance profiling studies of scientific simulations
- Compiler optimization literature for assertion checks
- Production monitoring vs debugging trade-offs in research code

### 4. Phase Dependency Declaration Patterns

**Context:** Only 30 of 117 phases declare dependencies (25.6% coverage).

**Questions:**
- What are established patterns for dependency declaration in phase-based architectures?
- How do game engines handle phase dependencies (Unity, Unreal)?
- What about scientific workflow systems (Taverna, Pegasus)?
- Are there heuristics for identifying implicit dependencies from code analysis?

**Sources to explore:**
- Game engine architecture (Unity execution order, Unreal tick dependencies)
- Scientific workflow dependency graphs (Taverna, Kepler)
- Build system dependency resolution (Bazel, Buck)
- Static analysis tools for dependency extraction

## Implementation Strategy

### Phase 1: Prioritization (4-6 hours)
1. Audit all 98 unvalidated phases
2. Classify by risk:
   - **CRITICAL**: Modifies population, mortality, AI capabilities, QoL
   - **HIGH**: Modifies climate, economy, planetary boundaries
   - **MEDIUM**: Modifies social systems, technology
   - **LOW**: Read-only analysis, logging
3. Prioritize by: `risk_level × execution_frequency × mathematical_complexity`

### Phase 2: Batch Implementation (3-5 days)
1. **Batch size**: 10-15 phases per batch
2. **Validation gate**: Monte Carlo N=3 after each batch
3. **Success criteria per batch**:
   - Zero assertion errors during normal operation
   - Zero false positives (assertions don't fail on legitimate states)
   - Type checks pass
   - Determinism maintained (same seed → same results)

### Phase 3: Integration Testing (1 day)
1. Monte Carlo N=10 with full assertion coverage
2. Validate:
   - Zero NaN errors
   - No assertion failures during legitimate operations
   - Performance overhead <1% (profile hot paths)
   - Outcome distribution unchanged (behavior preserved)

### Phase 4: Documentation (4 hours)
1. Update wiki with assertion patterns
2. Document when to use each assertion type
3. Add examples for common patterns
4. Create pre-commit hook for assertion coverage (future enhancement)

## Acceptance Criteria

- [ ] 95%+ of critical-state-modifying phases use assertions (target: 111+ phases)
- [ ] Zero false positives during Monte Carlo N=10
- [ ] Zero NaN errors propagated to results
- [ ] Performance overhead <1% (measured via profiling)
- [ ] Determinism maintained (99.9% from Issue #11 fix)
- [ ] Monte Carlo N=10 passes with same outcome distribution
- [ ] Wiki documentation updated
- [ ] Architecture review grade: A- or better

## Dependencies

**Research Phase:**
- super-alignment-researcher: Best practices research
- research-skeptic: Validate patterns for false positive risk

**Implementation Phase:**
- simulation-maintainer: Batch implementation with validation
- Monte Carlo validation after each batch

**Quality Gates:**
- architecture-skeptic: Performance impact review
- senior-dev-reviewer: Code quality review (if needed)

## Risk Mitigation

**Risk 1: False Positives Block Legitimate States**
- Mitigation: Start with conservative bounds, tighten based on Monte Carlo results
- Validation: N=3 after each batch catches false positives early

**Risk 2: Performance Degradation**
- Mitigation: Profile hot paths, use lightweight assertions
- Validation: Performance profiling before/after each batch

**Risk 3: Behavior Change from Assertions**
- Mitigation: Assertions only validate, never modify values
- Validation: Monte Carlo outcome distribution comparison

**Risk 4: Implementation Velocity Too Slow**
- Mitigation: Batch size 10-15 phases, clear patterns from research phase
- Validation: Complete 20-30 phases in first 2 days to validate velocity

## Next Steps

1. ✅ Create implementation plan (this document)
2. ⏳ Invoke super-alignment-researcher for best practices research
3. ⏳ Invoke research-skeptic for critique of proposed patterns
4. **Quality Gate 1:** Pass research validation OR pivot approach
5. ⏳ Invoke simulation-maintainer for batch implementation
6. ⏳ Monte Carlo N=3 after each batch (10-15 phases)
7. ⏳ Invoke architecture-skeptic for performance review
8. **Quality Gate 2:** Address CRITICAL/HIGH issues from review
9. ⏳ Update wiki documentation
10. ⏳ Archive completion report

## References

- Architecture Review: `/reviews/architecture-integration-review_20251106.md`
- Existing Assertions: `src/simulation/utils/assertions.ts`
- Oct 2025 NaN Bug: `/logs/ecology_nan_bug_postmortem_20251026.md` (if exists)
- WEEK 3 State Validation: `/plans/completed/week3_task7_state_validation_complete_20251106.md`
