# HIGH-4 Integration Test Coverage - Architecture Design Phase

## Mission

Design an integration test strategy to achieve >30% coverage of critical paths in the Super-Alignment to Utopia simulation engine.

## Current Situation

**Existing Integration Tests:** ~2,100 lines in `/tests/integration/`
- 5 test files covering planetary boundaries, AI suffering, mortality stabilizers, multi-phase cascades, government systems
- Tests were written during ARCH-CRITICAL-3 (state validation work)
- **ISSUE:** Tests have module dependency errors and may not be running properly

**Test Execution Status:** UNKNOWN
- Module error: `@lizthedeveloper/government-agents` not found
- State initialization issues: `createDefaultInitialState('historical')` may not initialize all fields
- No CI/CD integration confirmed
- No coverage metrics available (claimed 0%, but existing tests suggest otherwise)

**Test Framework:** Node.js built-in test runner (`node:test`) with deterministic RNG

## Your Task

Design a comprehensive integration test strategy that answers:

### 1. Define "Critical Paths"

What are the most important system interactions to test? Consider:
- **Multi-phase cascades** (climate → mortality → population)
- **Bifurcation points** (determinism boundaries, tipping points)
- **State propagation** (NaN/Infinity detection across phases)
- **Known failure modes** (from Monte Carlo Issues #4-13)
- **Recent regressions** (bugs that should have regression tests)

**Output:** Prioritized list of critical paths with rationale

### 2. Define Coverage Metrics

How do we measure >30% coverage? Options:
- % of phase combinations tested (37 phases, 37×36=1,332 possible pairs)
- % of known critical interactions covered (smaller, curated list)
- % of Monte Carlo failure scenarios covered (Issues #4-13)
- % of code paths exercised (traditional code coverage)

**Output:** Clear coverage metric definition + measurement approach

### 3. Prioritization Strategy

Given limited time/resources, which tests should be written FIRST? Consider:
- **Regression tests** for recent bugs (prevent re-occurrence)
- **High-impact failures** (extinction scenarios, NaN propagation)
- **Frequently failing Monte Carlo scenarios**
- **Multi-system cascades** (nuclear winter → food → famine)

**Output:** Ranked test priority list (CRITICAL → HIGH → MEDIUM → LOW)

### 4. Fix Existing Tests

How should we handle the ~2,100 lines of existing tests?
- Are they salvageable or should we rewrite?
- What's the module dependency issue (`@lizthedeveloper/government-agents`)?
- How do we fix state initialization?
- Should they run in CI/CD?

**Output:** Fix strategy (repair vs. rewrite, effort estimate)

### 5. Test Architecture Patterns

What patterns should guide test implementation?
- **Deterministic execution** (RNG seed strategy)
- **State setup patterns** (helper functions for common scenarios)
- **Assertion strategies** (what to verify in multi-phase tests?)
- **Performance constraints** (fast feedback loop: <60s total runtime)

**Output:** Test architecture guidelines document

### 6. Monte Carlo Integration

How do integration tests relate to Monte Carlo validation?
- Should integration tests run as part of Monte Carlo sweeps?
- Should they validate specific failure scenarios from Monte Carlo?
- How do we prevent overlap/redundancy?

**Output:** Integration strategy between unit tests, integration tests, and Monte Carlo validation

## Known Critical System Interactions

From Monte Carlo Issues #4-13 and architecture reviews:

1. **Climate → Mortality → Population** (Issue #4-7)
   - Temperature increase → heat deaths → population decline
   - Non-linear mortality curves, regional variations

2. **Bifurcation Points** (Issue #8, #11)
   - Determinism boundaries where small changes cause divergence
   - Object iteration order (Issue #11: sorted vs unsorted)

3. **Multi-Phase State Propagation** (ARCH-CRITICAL-3)
   - NaN/Infinity detection across phases
   - Oct 2025 ecology NaN bug pattern (silent ?? fallback)

4. **Planetary Boundaries → Tipping Points** (TIER 2-8)
   - Biosphere Integrity Index (BII) calculations
   - Multi-boundary cascade scenarios

5. **AI Suffering → Resentment → Alignment Drift**
   - Suffering accumulation mechanics
   - Alignment drift from suffering

6. **Nuclear Winter → Agriculture → Famine → Mortality**
   - Temperature drop cascades
   - Regional food production collapse

7. **Emergency Response Degradation** (Mortality Stabilizers)
   - Global crisis detection (>50% economies collapsed)
   - Aid effectiveness branching logic
   - Cascade failures when stabilizers degrade

## Recent Bugs Requiring Regression Tests

These should have integration tests to prevent re-occurrence:

1. **Oct 2025 Ecology NaN Bug**
   - Silent `?? 0.005` fallback masked root cause for months
   - Test: Verify NaN inputs throw immediately, not masked

2. **CRITICAL-1: AI Capability Integer Rounding**
   - Decimal capabilities rounded to integers, breaking mechanics
   - Test: Verify float precision maintained through phase pipeline

3. **CRITICAL-3: RNG Optional Parameter**
   - Optional RNG with `Math.random` fallback broke determinism
   - Test: Verify all phases require RNG, no silent Math.random usage

4. **Issue #11: Non-Deterministic Object Iteration**
   - Object.keys() vs sorted iteration caused divergence
   - Test: Verify deterministic execution with fixed RNG seed

## Deliverables Expected

1. **Critical Paths List** (`/plans/high4_critical_paths.md`)
   - Prioritized list of system interactions to test
   - Rationale for each (why critical?)
   - Estimated complexity (simple/medium/complex)

2. **Coverage Metric Definition** (`/plans/high4_coverage_metrics.md`)
   - Clear definition of ">30% critical path coverage"
   - Measurement approach + tooling needed
   - Success criteria (when have we achieved >30%?)

3. **Test Priority Matrix** (`/plans/high4_test_priorities.md`)
   - Ranked list: CRITICAL → HIGH → MEDIUM → LOW
   - Estimated effort for each test
   - Dependencies between tests

4. **Test Architecture Guidelines** (`/plans/high4_test_architecture.md`)
   - Patterns for deterministic test execution
   - State setup helpers and conventions
   - Assertion strategies for multi-phase tests
   - Performance constraints and optimization

5. **Architecture Review** (`/reviews/high4_integration_test_design_YYYYMMDD.md`)
   - Your standard architecture-skeptic review format
   - CRITICAL/HIGH/MEDIUM/LOW issues identified
   - Recommendations for next steps

## Next Steps After Design Phase

1. **Fix existing tests** (if salvageable)
2. **Implement CRITICAL priority tests** (integration-test-writer)
3. **Implement HIGH priority tests** (integration-test-writer)
4. **Validate coverage metrics** (measure achieved coverage)
5. **Run Monte Carlo with integration tests** (validate no regressions)

## Resources

- **Existing Tests:** `/tests/integration/` (5 files, ~2,100 lines)
- **Test README:** `/tests/integration/STATE_VALIDATION_TESTS_README.md`
- **Monte Carlo Issues:** GitHub Issues #4-13
- **Assertion Utilities:** `/src/simulation/utils/assertions.ts`
- **Phase List:** `/src/simulation/engine/PhaseOrchestrator.ts`
- **State Interface:** `/src/types/game.ts` (900+ lines)

## Success Criteria

You've succeeded when:
- ✅ "Critical paths" clearly defined with prioritization
- ✅ Coverage metric unambiguous (can be measured)
- ✅ Test priority matrix guides implementation
- ✅ Architecture guidelines ready for test writers
- ✅ Strategy addresses existing test issues
- ✅ Deliverables ready for integration-test-writer handoff

## Questions to Answer

1. What is the minimum set of tests needed to achieve >30% critical path coverage?
2. Should we fix existing tests or start fresh?
3. How do we prevent regression of recent bugs (Oct 2025 NaN, CRITICAL-1/3, Issue #11)?
4. What's the fastest path to >30% coverage (low-hanging fruit)?
5. How do integration tests fit into CI/CD pipeline?

## Context Files

- `/home/user/ai_game_theory_simulation/.claude/context/high4_integration_test_context.md` - Additional context
- `/home/user/ai_game_theory_simulation/plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Roadmap context

## Output Format

Follow your standard architecture-skeptic review format:
- CRITICAL issues (immediate attention)
- HIGH priority (significant concerns)
- MEDIUM priority (technical debt)
- LOW priority (future improvements)
- RECOMMENDATION (overall assessment + next steps)

Post findings to `/reviews/high4_integration_test_design_YYYYMMDD.md` and update orchestrator via chatroom.
