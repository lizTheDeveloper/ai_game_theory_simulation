# Critical Path Integration Tests

**Purpose:** Prevent regressions in critical simulation paths fixed during WEEK 1-3 of the roadmap.

**Coverage:** 5 critical paths, 40+ integration test cases, targeting >30% coverage of critical simulation logic.

## Test Files

### 1. Mortality Path (`mortality-path.test.ts`)

**What it tests:**
- Full simulation with nuclear winter trigger
- Mortality stabilizers (international aid, heat adaptation, migration)
- Mortality stays within research-backed range (40-60%)
- No double-counting bugs (seasonal multiplier applied once)

**Why it matters:**
- Prevents regression of WEEK 1 mortality fix (98% → 43-58% mortality)
- Validates Xia et al. (2022) nuclear winter mortality bounds
- Ensures stabilizers activate correctly during crisis

**Test cases:** 7
- Nuclear winter activates mortality stabilizers
- Mortality stays within research-backed bounds
- Population remains finite (no NaN/Infinity)
- Excess deaths tracked correctly
- Temperature drop propagates to agricultural collapse
- Determinism (same seed → same results)
- Stochasticity (different seeds → different results)

### 2. Bifurcation Path (`bifurcation-path.test.ts`)

**What it tests:**
- Bifurcation detection → emergency response escalation
- Variance amplification triggers crisis cascade prevention
- `capWithBifurcationAwareness` prevents assertion errors
- State stabilization after bifurcation detected

**Why it matters:**
- Prevents regression of WEEK 1 bifurcation detection integration
- Validates Lenton et al. (2023) tipping point early warning signals
- Ensures high-variance scenarios don't crash simulation

**Test cases:** 8
- `capWithBifurcationAwareness` prevents assertion errors
- Preserves valid values
- High variance scenario completes without errors
- Near-tipping-point conditions trigger responses
- Multiple variance sources don't compound to NaN
- Bifurcation capping is logged (not silent)
- Variance amplification preserves population stability
- Determinism under high variance conditions

### 3. Scenario Override Path (`scenario-override-path.test.ts`)

**What it tests:**
- Government priority overrides applied correctly
- climate-first produces different results than equality-first
- Scenario parameters persist through simulation lifecycle
- Tech deployment strategies execute as configured

**Why it matters:**
- Validates Phase 3 infrastructure (scenario parameter persistence)
- Ensures policy priorities affect outcomes measurably
- Prevents silent reversion to default behavior

**Test cases:** 8
- Scenario priorities persist through simulation
- Different scenario priorities produce different outcomes
- Government priorities affect tech deployment
- Scenario configuration accessible throughout simulation
- Default scenario (no overrides) runs correctly
- Extreme priority settings don't crash simulation
- Priorities remain in valid range [0, 1]
- Scenario determinism (same scenario + seed = same outcome)

### 4. Technology Deployment Path (`technology-deployment-path.test.ts`)

**What it tests:**
- Single tech deployment (minimal test)
- Multiple tech deployment (10 technologies)
- Large-scale deployment (all 73 technologies)
- Tech effects accumulate correctly
- No NaN propagation from tech interactions

**Why it matters:**
- Validates technology system integration
- Ensures tech effects don't cause NaN cascades
- Verifies tech tree structure preservation

**Test cases:** 8
- Single technology deployment completes successfully
- Multiple technology deployment remains stable
- All technologies deployed simultaneously remains stable
- Technology deployment produces measurable effects
- Tech tree structure is preserved
- Technology deployment tracking is accurate
- Technology effects remain numerically stable
- Tech deployment is deterministic

### 5. AI Capability Path (`ai-capability-path.test.ts`)

**What it tests:**
- AI capability growth through 17 dimensions
- No integer rounding bugs (CRITICAL bug from Nov 7, 2025)
- All capabilities remain finite (no NaN/Infinity)
- MAD deterrence overflow prevented (HIGH bug from Nov 7, 2025)
- Capability levels stay in valid range [0, 5]

**Why it matters:**
- Prevents regression of CRITICAL-1 assertion coverage fixes
- Validates AI capability numeric type handling
- Ensures multi-agent AI systems don't interfere

**Test cases:** 9
- AI capabilities stay within valid range [0, 5]
- AI capabilities remain finite (no NaN/Infinity)
- No integer rounding bugs
- Aggregate capabilities calculated correctly
- AI alignment stays within valid probability range [0, 1]
- AI capability growth is gradual (no sudden jumps)
- Multiple AI agents maintain independent capabilities
- assertAICapability catches out-of-range values
- AI capability evolution is deterministic

## Running the Tests

```bash
# Run all integration tests
npm test tests/integration/critical-paths/

# Run specific critical path
npm test tests/integration/critical-paths/mortality-path.test.ts

# Run with coverage
npm run test -- --experimental-test-coverage tests/integration/critical-paths/
```

## Test Design Principles

### 1. Test Real Integration, Not Mocks
- Use actual system implementations
- Execute full simulation steps
- No mocked internal systems

### 2. Verify Complete State Changes
- Establish clear initial state
- Execute integration (full simulation steps)
- Assert on complete final state
- Check for unintended side effects

### 3. Test Meaningful Scenarios
- Focus on realistic use cases
- Cover critical paths where failures have significant impact
- Include edge cases
- Test failure modes and error propagation

### 4. Determinism and Reproducibility
- All tests use fixed seeds for determinism
- Same seed → same results (reproducibility)
- Different seeds → different results (stochasticity)

## Coverage Goals

**Target:** >30% coverage of critical simulation logic

**Priority areas:**
1. Mortality calculation and stabilizers (WEEK 1 fixes)
2. Bifurcation detection and emergency response (WEEK 1 integration)
3. Scenario parameter persistence (Phase 3 infrastructure)
4. Technology deployment and effects accumulation
5. AI capability growth and validation (CRITICAL-1 fixes)

## Research Standards

Every test is grounded in peer-reviewed research:

- **Mortality:** Xia et al. (2022), Cavalcanti et al. (2025), Ballester et al. (2024), IOM (2024)
- **Bifurcation:** Lenton et al. (2023), Scheffer et al. (2009), Dakos et al. (2012)
- **Scenarios:** Levin et al. (2024), IPCC AR6, Rockström et al. (2023)
- **Technology:** Rogers (2003), Ord (2020), Arthur (1989)
- **AI Capabilities:** Hendrycks et al. (2024), Cotra (2022), Bostrom (2014)

## Defensive Coding Standards

All tests follow defensive coding principles:

- **No silent fallbacks:** Use assertion utilities for state validation
- **Fail loudly:** Clear error messages with full context
- **Test both success and failure paths**
- **Comprehensive NaN/Infinity checks**

## Regression Prevention

These tests prevent specific regressions:

1. **WEEK 1 Mortality Fix:** 98% → 43-58% mortality (mortality-path.test.ts)
2. **WEEK 1 Bifurcation:** Variance amplification detection (bifurcation-path.test.ts)
3. **Phase 3 Infrastructure:** Scenario parameter persistence (scenario-override-path.test.ts)
4. **Nov 7 CRITICAL Bug:** Integer rounding in AI capabilities (ai-capability-path.test.ts)
5. **Nov 7 HIGH Bug:** MAD deterrence overflow (ai-capability-path.test.ts)

## Test Execution Time

**Target:** <100ms per test (fast feedback loop)

**Actual:**
- Mortality path: ~200-300ms per test (mini-simulations 12-60 months)
- Bifurcation path: ~150-250ms per test
- Scenario override: ~200-300ms per test
- Technology deployment: ~150-250ms per test
- AI capability: ~150-250ms per test

**Total suite:** ~10-15 seconds for all 40+ tests

## Future Expansion

Additional critical paths to add:

- **Climate cascades:** Temperature → sea level → coastal flooding → migration
- **Economic collapse:** GDP crash → unemployment → social instability → collapse
- **Extinction paths:** Multiple extinction mechanisms (nuclear, pandemic, climate)
- **Positive spirals:** Tech deployment → QoL improvement → stability
- **Multi-paradigm DUI:** Different paradigms produce different outcomes

## Maintenance

**When to update tests:**
1. After fixing critical bugs (add regression test)
2. After implementing new critical paths (add integration test)
3. When research parameters change (update bounds/expectations)
4. When assertion utilities change (update validation calls)

**What to avoid:**
- Don't test implementation details (test behavior, not internals)
- Don't mock the systems being integrated (defeats purpose)
- Don't use arbitrary magic numbers (ground in research)
- Don't skip determinism tests (essential for Monte Carlo validation)
