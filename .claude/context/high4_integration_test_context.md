# HIGH-4: Integration Test Coverage Context

## Current State

**Existing Integration Tests:** ~2,100 lines in `/tests/integration/`
- `state-validation-planetary-boundaries.test.ts` (327 lines)
- `state-validation-ai-suffering.test.ts` (555 lines) 
- `state-validation-mortality-stabilizers.test.ts` (613 lines)
- `state-validation-multi-phase-cascades.test.ts` (641 lines)
- `government-system.test.ts` (89 lines)

**Issues:**
1. Tests have module dependency errors (`@lizthedeveloper/government-agents` missing)
2. State initialization mismatches (`createDefaultInitialState('historical')` doesn't init all fields)
3. Unknown if tests are running in CI/CD
4. No coverage metrics available (current: 0%, target: >30%)

**Test Framework:** Node.js built-in test runner (`node:test`) with deterministic RNG

## Goal

Design integration test strategy to achieve >30% coverage of **critical paths**.

## Key Questions for Architecture-Skeptic

1. **What are "critical paths"?** - Which system interactions matter most?
2. **How to measure coverage?** - % of what? (phases? interactions? edge cases?)
3. **Prioritization strategy** - Which tests to write first?
4. **Module dependency fixes** - How to resolve import issues?
5. **Deterministic execution** - RNG seed strategy for reproducibility
6. **Monte Carlo integration** - How do integration tests relate to Monte Carlo validation?

## Known Critical System Interactions

From Monte Carlo Issues #4-13 and architecture reviews:
- Climate → Mortality → Population cascades
- Bifurcation points (determinism boundaries)
- Multi-phase state propagation (NaN, Infinity detection)
- Planetary boundaries → Tipping points
- AI suffering → Resentment → Alignment drift
- Nuclear winter → Agriculture → Famine → Mortality
- Emergency response degradation under global crisis

## Recent Bugs to Cover

These should have regression tests:
- Oct 2025 ecology NaN bug (silent ?? fallback)
- CRITICAL-1: AI capability integer rounding
- CRITICAL-3: RNG optional parameter (Math.random fallback)
- Issue #11: Non-deterministic object iteration

## Success Criteria

- >30% critical path coverage
- Tests catch real regressions (validate against known bugs)
- Deterministic test execution (reproducible with RNG seeds)
- Tests run in <60 seconds (fast feedback loop)
