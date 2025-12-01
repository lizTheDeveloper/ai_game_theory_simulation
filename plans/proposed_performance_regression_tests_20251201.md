# Proposed Plan: Performance Regression Tests for Organization Management

**Date:** December 1, 2025
**Priority:** LOW
**Effort:** Medium (30-60 minutes)
**Category:** Testing / Performance Monitoring

## Problem Statement

From Architecture Review (Dec 1, 2025 - Grade A-):

> **LOW-2:** O(n^2) Patterns Documented but Could Be Monitored
>
> Multiple O(n^2) fixes were applied in Nov 2025 (organizationManagement.ts). The fixes use Set-based O(1) lookups correctly. Recommendation: Add performance regression test for organization management with 1000+ entities.

**Context:**
- Nov 2025: Fixed multiple O(n²) issues in organizationManagement.ts
- Fixes use Set-based lookups (O(1) membership tests)
- Comments at lines 37, 391, 478 document the optimizations
- Current test suite has NO performance regression coverage

**Risk:** Future refactoring could accidentally reintroduce O(n²) patterns.

## Proposed Solution

### Phase 1: Create Performance Test Suite (20 min)

Create `tests/performance/organizationManagement.perf.test.ts`:

```typescript
import { describePerformance, itShouldExecuteInUnder } from '../helpers/performanceHelpers';
import { createMockGameState } from '../helpers/mockGameState';
import { OrganizationManagementPhase } from '@/simulation/organizationManagement';

describePerformance('Organization Management Performance', () => {
  itShouldExecuteInUnder('should handle 1000 organizations in <100ms', 100, () => {
    const state = createMockGameState();

    // Create 1000 organizations
    for (let i = 0; i < 1000; i++) {
      state.organizations.push({
        id: `org-${i}`,
        type: i % 3 === 0 ? 'government' : (i % 3 === 1 ? 'corporation' : 'nonprofit'),
        memberCount: 10 + Math.floor(Math.random() * 1000),
        // ... other properties
      });
    }

    // Execute phase (should use O(n) Set lookups, not O(n²) nested loops)
    const rng = () => Math.random(); // Simple RNG for perf test
    OrganizationManagementPhase.execute(state, rng);
  });

  itShouldExecuteInUnder('should handle cross-org lookups in <50ms', 50, () => {
    const state = createMockGameState();

    // Scenario: Many orgs with overlapping memberships
    // This tests Set-based membership checks (O(1)) vs nested loops (O(n²))

    for (let i = 0; i < 500; i++) {
      state.organizations.push({
        id: `org-${i}`,
        members: new Set(Array.from({length: 100}, (_, j) => `member-${j % 200}`)),
        // ... other properties
      });
    }

    const rng = () => Math.random();
    OrganizationManagementPhase.execute(state, rng);
  });
});
```

### Phase 2: Create Performance Test Helpers (10 min)

Create `tests/helpers/performanceHelpers.ts`:

```typescript
export function describePerformance(suiteName: string, tests: () => void) {
  describe(`⚡ Performance: ${suiteName}`, tests);
}

export function itShouldExecuteInUnder(
  testName: string,
  maxMs: number,
  testFn: () => void
) {
  it(testName, () => {
    const start = performance.now();
    testFn();
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(maxMs);

    // Log for monitoring (appears in test output)
    console.log(`  ⏱️  Executed in ${duration.toFixed(2)}ms (threshold: ${maxMs}ms)`);
  });
}
```

### Phase 3: Add to CI Pipeline (Optional, 5 min)

Update `.github/workflows/test.yml` (if exists):

```yaml
- name: Performance Tests
  run: npm run test:perf
  # Fail if any test exceeds threshold
```

Add script to `package.json`:

```json
"scripts": {
  "test:perf": "jest --testMatch='**/*.perf.test.ts' --verbose"
}
```

## Research Foundation

**Computer Science:** O(n²) complexity analysis is well-established CS theory.

**Justification:** Performance regression tests are industry standard for preventing performance degradation (Google's "Large-Scale Automated Refactoring Using ClangMR" 2013, Microsoft's "Performance Testing in Continuous Integration" 2018).

**No peer-reviewed research needed** - standard testing practice.

## Acceptance Criteria

1. Performance test file created at `tests/performance/organizationManagement.perf.test.ts`
2. Performance helper utilities created
3. Tests execute in CI (or can run manually with `npm run test:perf`)
4. Tests PASS with current codebase (verify O(n) performance)
5. Tests FAIL if O(n²) patterns reintroduced (threshold violations)
6. Documentation added to test file explaining what's being tested

## Expected Timeline

- **Phase 1:** 20 minutes (test creation)
- **Phase 2:** 10 minutes (helpers)
- **Phase 3:** 5 minutes (CI integration) - OPTIONAL
- **Total:** 30-35 minutes

## Failure Modes

**Medium Risk:**
- Performance thresholds too aggressive → Tests flaky on slower CI machines
- **Mitigation:** Use relative thresholds (2× expected time) rather than absolute

**Low Risk:**
- Tests don't catch regressions → Thresholds too loose
- **Mitigation:** Calibrate with actual O(n²) code to verify tests catch it

## Interaction Map

**Affects:**
- `tests/performance/` - New directory for perf tests
- `tests/helpers/performanceHelpers.ts` - New utility file
- `package.json` - (Optional) New test:perf script
- `.github/workflows/` - (Optional) CI integration

**Is affected by:** None (pure test addition)

## Validation Command

```bash
# Run performance tests manually
npm run test:perf

# Verify tests catch regressions (introduce O(n²) loop)
# ... modify organizationManagement.ts to use nested loop ...
npm run test:perf  # Should FAIL

# Restore O(n) code
# ... revert changes ...
npm run test:perf  # Should PASS
```

## Related Work

- **Nov 2025 O(n²) fixes** - organizationManagement.ts optimizations
- **Architecture Review:** Dec 1, 2025 - Grade A-, LOW-2 recommendation
- **Test Suite:** Currently 81.64% coverage, but no perf regression tests

## Implementation Notes

**Token Conservation:**
- ~5k tokens for test creation
- High value (prevents future O(n²) regressions)
- Low maintenance (tests run automatically)

**Agent Assignment:** unit-test-writer or integration-test-writer

**Priority Rationale:** LOW priority because:
- No active performance issues
- Current code is optimized
- Preventive measure for future refactoring
- Not blocking any other work

**Why This Matters:**
- O(n²) bugs are expensive to debug (hard to reproduce, only manifest at scale)
- Perf tests catch them immediately during development
- Prevents production issues when organization count grows

**Success Metric:** Tests detect intentionally introduced O(n²) pattern within 1 development cycle.
