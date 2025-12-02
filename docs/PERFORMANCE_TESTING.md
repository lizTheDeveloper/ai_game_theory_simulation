# Performance Regression Testing

## Overview

Performance regression tests verify that critical code paths maintain O(n) complexity and prevent O(n²) regressions.

## Running Performance Tests

```bash
# Run all performance tests
npm run test:perf

# Performance tests are skipped in CI by default
# To enable in CI, set: ENABLE_PERF_TESTS=1
```

## organizationManagement.ts Performance Tests

**Location:** `tests/performance/organizationManagement.perf.test.ts`

**Purpose:** Prevent O(n²) regressions in organization management functions.

**Background:**
- Nov 2025: Fixed multiple O(n²) issues in `calculateComputeUtilization`
- Root cause: `.filter(x => array.includes(x.id))` created nested loops
- Fix: Set-based O(1) lookups (documented at lines 37, 391, 478 in organizationManagement.ts)
- Impact: 70× reduction in operations (100,000 → 1,400)

**Tests:**

1. **calculateComputeUtilization with 1000 organizations** (<500ms)
   - Verifies baseline performance for realistic workload
   - 1000 orgs × 5 datacenters × 10 AI models each

2. **Cross-org datacenter lookups** (<250ms)
   - Verifies Set-based ownership pattern
   - O(n) scan with O(1) membership test

3. **Cross-org AI model lookups** (<400ms)
   - Verifies Set-based ownership pattern
   - O(n) scan with O(1) membership test

**How to Verify Tests Catch Regressions:**

1. Replace Set-based lookups with array.includes() in `src/simulation/organizationManagement.ts` line 47-48:
   ```diff
   - const ownedDCSet = new Set(org.ownedDataCenters);
   - const ownedAISet = new Set(org.ownedAIModels);
   + const ownedDCSet = org.ownedDataCenters;  // Array instead of Set
   + const ownedAISet = org.ownedAIModels;
   - .filter(dc => ownedDCSet.has(dc.id))
   + .filter(dc => ownedDCSet.includes(dc.id))  // O(n) lookup instead of O(1)
   ```

2. Run: `npm run test:perf`

3. Tests should FAIL with execution time >5000ms (10x+ slower)

4. Revert changes to restore O(n) performance

**Example Output:**

```
⏱️  1000 organizations: 395.52ms (threshold: 500ms)
⏱️  datacenter ownership lookups: 165.77ms (threshold: 250ms)
⏱️  AI model ownership lookups: 271.15ms (threshold: 400ms)
✔ [PERF] organizationManagement.ts O(n) performance (913.099605ms)
```

## Writing New Performance Tests

Use the helpers in `tests/helpers/performanceHelpers.ts`:

```typescript
import { measureExecutionTime, assertExecutionTimeUnder } from '../helpers/performanceHelpers';

it('should execute efficiently', () => {
  const executionTime = measureExecutionTime(() => {
    // Code to test
  });

  assertExecutionTimeUnder(executionTime, 100, 'operation description');
});
```

**Key Principles:**

1. **Test realistic workloads** - Use scales that match production usage
2. **Set generous thresholds** - Allow 2-3x headroom for CI variance
3. **Log execution times** - Monitor trends over time
4. **Document context** - Explain why this test matters and what regression it prevents

## Performance Helper Functions

**`measureExecutionTime(fn: () => void): number`**
- Executes function and returns execution time in milliseconds
- Uses `performance.now()` for high-resolution timing

**`assertExecutionTimeUnder(time: number, threshold: number, description: string)`**
- Logs execution time with emoji indicator
- Throws error if time exceeds threshold
- Use for absolute time baselines

## Notes

- Performance tests are NOT unit tests - they verify absence of algorithmic regressions
- Thresholds should be 2-3x typical execution time to account for CI variance
- Tests log execution time for monitoring trends
- Focus on baseline performance, not micro-benchmarks
