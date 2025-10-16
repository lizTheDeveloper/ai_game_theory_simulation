# Monte Carlo Reporting System Bug Report

**Date:** October 16, 2025
**Reviewer:** System Architecture Skeptic
**Severity Assessment:** CRITICAL - Multiple data corruption and reporting issues identified

## Executive Summary

The Monte Carlo reporting system contains **7 critical bugs**, **5 significant bugs**, and **3 minor issues** that compromise the integrity of simulation results. Most critically, the system is accessing undefined properties that will cause runtime crashes, has incorrect variable references, and contains data type mismatches that corrupt death statistics. These issues affect both data accuracy and system stability.

## Critical Bugs (Data Corruption / Crashes / Invalid Results)

### 1. Undefined Property Access - `deathsByCategory.cascade`
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 774

```typescript
const deathsCascade = deathsByCategory.cascade; // Tipping point cascade only
```

**Problem:** The `cascade` property does not exist in the `deathsByCategory` type definition. This will return `undefined` and corrupt all cascade death statistics.

**Expected:** Property should exist in type definition
**Actual:** Property is undefined, causing NaN/undefined propagation
**Severity:** CRITICAL - Corrupts death statistics
**Fix:** Add `cascade: number` to the `HumanPopulationSystem.deathsByCategory` type definition in `/src/types/population.ts`

---

### 2. Undefined Variable Reference - `runIndex`
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 515

```typescript
logWarn(`⚠️ Run ${runIndex}: Missing qualityOfLifeSystems, using defaults`);
```

**Problem:** Variable `runIndex` is undefined. The correct variable is `i` from the for loop.

**Expected:** Use loop variable `i`
**Actual:** References undefined `runIndex`
**Severity:** CRITICAL - Will crash when warning triggers
**Fix:** Change to `Run ${i + 1}` to match other logging

---

### 3. EventAggregator May Be Undefined
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 790-793

```typescript
const aggregator = (finalState as any).eventAggregator;
const nuclearWarsCount = aggregator ?
  (aggregator.stats.nuclearWarsTriggered || 0) + (aggregator.stats.nuclearDeterrenceFailed || 0) :
  0;
```

**Problem:** EventAggregator is attached to state during simulation but may not exist in finalState if simulation ends early or crashes.

**Expected:** Aggregator always available
**Actual:** May be undefined causing stats to be 0
**Severity:** CRITICAL - Silent data loss
**Fix:** Ensure aggregator is always initialized or provide better fallback logic

---

### 4. Missing Import for `initializeEndGameState`
**File:** `/Users/annhoward/src/superalignmenttoutopia/src/simulation/engine.ts`
**Line:** 39

```typescript
initializeEndGameState
```

**Problem:** `initializeEndGameState` is imported twice (lines 36 and 39), causing potential naming conflicts.

**Expected:** Single import
**Actual:** Duplicate import
**Severity:** CRITICAL - May cause compilation errors
**Fix:** Remove duplicate import on line 39

---

### 5. Death Count Arithmetic Error
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 763

```typescript
const totalDeaths = (initialPopulation - finalPopulation) * 1000; // billions to millions
```

**Problem:** Population is in billions, deaths should be in millions. The conversion factor should be 1000, but the logic doesn't account for negative population changes (if population grows).

**Expected:** Proper handling of population growth
**Actual:** Negative death counts when population grows
**Severity:** CRITICAL - Invalid death statistics
**Fix:** Use `Math.max(0, (initialPopulation - finalPopulation) * 1000)`

---

### 6. Event File Parsing Race Condition
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Lines:** 1409-1435

```typescript
const eventFile = path.join(outputDir, `run_${r.seed}_events.json`);
try {
  const eventData = JSON.parse(fs.readFileSync(eventFile, 'utf8'));
```

**Problem:** The script writes event files asynchronously with `fs.writeFileSync` but then immediately tries to read them back. If the file system is slow, this creates a race condition.

**Expected:** File fully written before reading
**Actual:** May read incomplete JSON
**Severity:** CRITICAL - JSON parse errors
**Fix:** Add file existence check and retry logic, or store data in memory

---

### 7. Organization Bankruptcy Double Counting
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 123 & 209

```typescript
organizationBankruptcies: number;  // Number of org bankruptcies during run
// ... later ...
orgBankruptcies: number;          // Count of bankruptcies
```

**Problem:** Same metric tracked twice with different names, leading to confusion and potential double counting.

**Expected:** Single consistent metric
**Actual:** Two separate fields for same data
**Severity:** CRITICAL - Data integrity issue
**Fix:** Use single field name consistently

---

## Significant Bugs (Incorrect Statistics / Misleading Reports)

### 1. Scenario Mode File Naming Bug
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 383

```typescript
const runLogDir = path.join(outputDir, `run_${seed}_${runScenarioMode}_events.json`);
```

**Problem:** Variable is named `runLogDir` but contains a file path, not a directory path.

**Expected:** Variable named `runLogFile`
**Actual:** Misleading variable name
**Severity:** SIGNIFICANT - Confusing for maintenance
**Fix:** Rename to `runLogFile`

---

### 2. Invalid Division Protection Too Permissive
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Lines:** 1548-1549

```typescript
(avgDetected/Math.max(0.01, avgSleepers)*100)
```

**Problem:** Using 0.01 as minimum divisor when avgSleepers could legitimately be 0. This shows 0 sleepers as having detection rates.

**Expected:** Don't calculate rate when no sleepers
**Actual:** Shows misleading percentages
**Severity:** SIGNIFICANT - Misleading statistics
**Fix:** Check `if (avgSleepers > 0)` before calculating rates

---

### 3. Natural Death Rate Calculation
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 768

```typescript
const deathsNatural = (avgPopulation * pop.baselineDeathRate * (monthsElapsed / 12)) * 1000;
```

**Problem:** Uses average of initial and final population, which underestimates deaths if population declined significantly.

**Expected:** Integrate death rate over time
**Actual:** Underestimates natural deaths
**Severity:** SIGNIFICANT - Incorrect mortality attribution
**Fix:** Track natural deaths month-by-month in simulation

---

### 4. Missing Cascade Death Category Handling
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Lines:** 1220-1222

```typescript
log(`    Cascade: ${(results.reduce((sum, r) => sum + r.deathsCascade, 0) / results.length).toFixed(0)}M (tipping point cascades)`);
```

**Problem:** Since `deathsCascade` is undefined (bug #1), this will always show 0 or NaN.

**Expected:** Actual cascade deaths
**Actual:** Always 0 or NaN
**Severity:** SIGNIFICANT - Missing critical data
**Fix:** Fix bug #1 first, then verify calculation

---

### 5. Scenario Mode Assignment for Dual Mode
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Line:** 364

```typescript
runScenarioMode = i < NUM_RUNS / 2 ? 'historical' : 'unprecedented';
```

**Problem:** For odd number of runs, this creates uneven split (e.g., 5 runs = 2 historical, 3 unprecedented).

**Expected:** Even split or clear documentation
**Actual:** Uneven split for odd run counts
**Severity:** SIGNIFICANT - Biased results
**Fix:** Use `Math.floor(NUM_RUNS / 2)` or document the bias

---

## Minor Issues (Performance / UX / Formatting)

### 1. Synchronous File Writes in Loop
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Lines:** 382-399

```typescript
fs.writeFileSync(runLogDir, JSON.stringify(eventLogData, null, 2), 'utf8');
```

**Problem:** Synchronous file writes in main simulation loop slow down execution significantly.

**Expected:** Async writes or batch writing
**Actual:** Blocks on each iteration
**Severity:** MINOR - Performance issue
**Fix:** Collect all data and write once at end, or use async writes

---

### 2. Memory Leak - History Array Growth
**File:** `/Users/annhoward/src/superalignmenttoutopia/src/simulation/engine.ts`
**Lines:** 517-528

```typescript
if (month % snapshotInterval === 0 || month === maxMonths - 1) {
  history.push({
    ...stepResult,
    state: this.snapshotState(state)
  });
}
```

**Problem:** For long simulations (1000+ months), the history array can consume gigabytes of RAM.

**Expected:** Configurable history retention
**Actual:** Unbounded memory growth
**Severity:** MINOR - Only affects very long runs
**Fix:** Add max history size option or write to disk periodically

---

### 3. Inefficient Outcome Classification
**File:** `/Users/annhoward/src/superalignmenttoutopia/scripts/monteCarloSimulation.ts`
**Lines:** 1225-1231

```typescript
const popOutcomes = {
  growth: results.filter(r => r.populationOutcome === 'growth').length,
  stable: results.filter(r => r.populationOutcome === 'stable').length,
  // ... etc
};
```

**Problem:** Iterates through results array 5 times when once would suffice.

**Expected:** Single pass classification
**Actual:** Multiple array iterations
**Severity:** MINOR - Performance issue
**Fix:** Use single reduce to count all categories

---

## Recommendations (Prioritized)

### Immediate Actions (Fix Today)
1. **Fix Critical Bug #1** - Add `cascade` property to type definition
2. **Fix Critical Bug #2** - Correct undefined variable reference
3. **Fix Critical Bug #5** - Prevent negative death counts
4. **Fix Critical Bug #4** - Remove duplicate import

### High Priority (Fix This Week)
1. **Fix Critical Bug #3** - Ensure EventAggregator initialization
2. **Fix Critical Bug #6** - Add file existence checks
3. **Fix Critical Bug #7** - Consolidate bankruptcy tracking
4. **Fix Significant Bugs #1-5** - Improve statistical accuracy

### Medium Priority (Fix This Sprint)
1. **Add comprehensive error handling** for file operations
2. **Add data validation** for all statistical calculations
3. **Implement proper logging** for debugging Monte Carlo runs
4. **Add unit tests** for statistical aggregation functions

### Low Priority (Future Improvements)
1. **Performance optimizations** (Minor Issues #1-3)
2. **Memory management** for long-running simulations
3. **Add progress bars** for better UX during long runs

## Impact Assessment

**Without fixes:**
- Monte Carlo results are **completely unreliable** for cascade death statistics
- System will **crash** when certain edge cases occur
- Death counts are **systematically underestimated**
- Nuclear war statistics may be **missing entirely**
- Organization bankruptcy data is **inconsistent**

**With fixes:**
- All statistics will be accurate and verifiable
- System will be stable for all edge cases
- Death attribution will be correct
- All Monte Carlo aggregations will be trustworthy

## Testing Requirements

After implementing fixes:
1. Run Monte Carlo with 1 run to verify no crashes
2. Run with 10 runs to verify aggregation logic
3. Verify cascade deaths are non-zero when cascades occur
4. Verify no negative death counts
5. Verify event files are properly written and read
6. Check memory usage for 1000+ month simulations
7. Validate all statistical calculations against manual checks

## Conclusion

The Monte Carlo reporting system has serious data integrity issues that must be addressed immediately. The most critical issues are the undefined property accesses and data type mismatches that corrupt core statistics. These bugs likely explain why certain outcomes appear deterministic - the data being analyzed is incomplete or incorrect.

Priority should be given to fixing the critical bugs that cause crashes and data corruption. The significant bugs affecting statistical accuracy should be addressed next, as they undermine the credibility of the Monte Carlo analysis. Performance optimizations can wait until core functionality is stable.

**Estimated effort to fix all critical issues: 4-6 hours**
**Estimated effort to fix all issues: 2-3 days**

---

*Generated by System Architecture Skeptic*
*Focus: Bug identification and data integrity in Monte Carlo reporting*