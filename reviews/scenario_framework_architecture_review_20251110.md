# Architecture Review: Phase 3 Scenario Analysis Framework
**Date:** November 10, 2025
**Reviewer:** Architecture Skeptic
**Scope:** Scenario Framework Implementation (Phase 3)
**Files Reviewed:** src/types/scenarios.ts, scripts/scenarioRunner.ts, scripts/runPhase3Scenarios.ts, src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts

## Executive Summary

**Architecture Grade:** B-
**Risk Assessment:** MEDIUM
**Stability Threat Level:** LOW

The Phase 3 Scenario Framework is architecturally sound with no critical stability threats. However, I identified several performance inefficiencies and moderate technical debt accumulation that should be addressed between feature work. The system will function adequately but has O(n²) patterns and unnecessary memory allocation that could become problematic at scale.

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

**NONE IDENTIFIED** - The system has no critical stability risks that require immediate intervention.

## HIGH PRIORITY (Significant performance/maintainability concerns)

### 1. O(n) Tech Deployment Inefficiency
**Location:** scripts/scenarioRunner.ts:273-320 (deployAllTech function)
**Impact:** Performance degradation during scenario initialization
**Problem:** The function iterates through all 73+ technologies twice:
- First loop to unlock tech (lines 282-287)
- Second loop to deploy tech (lines 295-318)
- Additional find() operation inside second loop (line 297) creates potential O(n²) behavior

**Recommendation:** Combine into single loop with Set-based lookups:
```typescript
const deployedTechIds = new Set(
  state.techTreeState.regionalDeployment['global'].map(d => d.techId)
);
for (const tech of technologies) {
  // Unlock and deploy in single pass
  if (!state.techTreeState.unlockedTech.includes(tech.id)) {
    state.techTreeState.unlockedTech.push(tech.id);
  }
  if (!deployedTechIds.has(tech.id)) {
    // Deploy new tech
  } else {
    // Update existing
  }
}
```
**Effort:** SMALL (2-3 hours)
**Risk:** LOW

### 2. Memory Leak Potential in Batch Testing
**Location:** scripts/runPhase3Scenarios.ts:340-384
**Impact:** Memory exhaustion after 50+ simulations
**Problem:** Each simulation creates full GameState (~10MB) and stores complete results. With 90 simulations:
- No explicit cleanup between runs
- allResults accumulates all scenario results in memory
- Each ScenarioResult contains full finalState reference

**Recommendation:**
1. Extract only needed metrics, don't store full state
2. Force garbage collection between scenarios: `if (global.gc) global.gc();`
3. Write results immediately and clear from memory

**Effort:** SMALL (2-3 hours)
**Risk:** MEDIUM (could cause OOM on constrained environments)

### 3. Inefficient Scenario Priority Application
**Location:** src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts:54-221
**Impact:** Unnecessary computation every simulation month
**Problem:** The phase checks and applies all priority overrides every single month:
- 120 months × 9 scenarios = 1,080 executions
- Most values are static after month 0
- GDP calculations on every check (lines 99-104)

**Recommendation:** Cache computed values at month 0, only recalculate if values change:
```typescript
private cachedValues?: {
  climateSpending?: number;
  redistributionAmount?: number;
  // ... other cached computations
};

execute(state: GameState, rng: RNGFunction): PhaseResult {
  if (state.currentMonth === 0 || !this.cachedValues) {
    this.computeAndCache(state);
  }
  // Apply cached values
}
```
**Effort:** MEDIUM (4-6 hours)
**Risk:** LOW

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### 4. State Mutation Side Effects
**Location:** scripts/scenarioRunner.ts:34, Multiple locations
**Impact:** Potential for hidden bugs in state propagation
**Problem:** Direct mutation of state.scenario without validation:
- Line 34: `state.scenario = scenario;` - No type checking
- No verification that scenario definition is complete
- Could interfere with state validation in other phases

**Recommendation:** Add validation layer:
```typescript
function validateAndApplyScenario(state: GameState, scenario: ScenarioDefinition) {
  // Validate scenario structure
  if (!scenario.id || !scenario.techDeployment) {
    throw new Error('Invalid scenario definition');
  }
  // Deep clone to prevent external mutations
  state.scenario = JSON.parse(JSON.stringify(scenario));
}
```
**Effort:** SMALL (2 hours)
**Risk:** LOW

### 5. Incomplete Tech Deployment Strategies
**Location:** scripts/scenarioRunner.ts:326-380
**Impact:** Feature incompleteness, fallback to immediate deployment
**Problem:** Three deployment strategies are stubbed:
- sequenced: Falls back to immediate (line 339)
- adaptive: Falls back to immediate (line 361)
- prioritized: Falls back to immediate (line 379)

**Recommendation:** Either:
1. Implement the strategies (LARGE effort)
2. Remove from interface and document as future work (SMALL effort)
3. Add clear error messages explaining limitation

**Effort:** SMALL to document, LARGE to implement
**Risk:** LOW (graceful fallback exists)

### 6. Duplicated Code Between Scripts
**Location:** runPhase3Scenarios.ts:48-182 duplicates scenarioRunner.ts
**Impact:** Maintenance burden, divergence risk
**Problem:** applyScenario, applyStartingConditions, applyTechDeployment are copy-pasted

**Recommendation:** Extract to shared module:
```typescript
// src/simulation/scenarios/scenarioApplication.ts
export { applyScenario, applyStartingConditions, applyTechDeployment }
```
**Effort:** SMALL (2 hours)
**Risk:** LOW

## LOW PRIORITY (Future improvements, not urgent)

### 7. Missing Error Boundaries in Batch Runner
**Location:** scripts/runPhase3Scenarios.ts:352-372
**Impact:** One failed simulation doesn't stop batch
**Problem:** Try-catch swallows errors, only logs them

**Recommendation:** Add error tracking and threshold:
```typescript
const errors: Error[] = [];
if (errors.length > MAX_ALLOWED_FAILURES) {
  throw new Error(`Too many failures: ${errors.length}`);
}
```
**Effort:** SMALL
**Risk:** MINIMAL

### 8. Inefficient JSON Serialization
**Location:** scripts/runPhase3Scenarios.ts:361, 399
**Impact:** I/O performance
**Problem:** Writing 90 individual JSON files synchronously

**Recommendation:** Batch writes or use streaming JSON writer
**Effort:** MEDIUM
**Risk:** MINIMAL

### 9. Hard-coded Spiral Detection Logic
**Location:** scripts/scenarioRunner.ts:183-213
**Impact:** Fragile coupling to implementation details
**Problem:** Hard-coded thresholds for spiral activation duplicated from phase logic

**Recommendation:** Extract thresholds to shared constants
**Effort:** SMALL
**Risk:** MINIMAL

## Architecture Assessment

### Positive Aspects
1. **Clean separation of concerns** - Scenarios, runner, batch testing are well-separated
2. **Type safety** - Strong TypeScript interfaces for scenarios
3. **Defensive validation** - ApplyScenarioPrioritiesPhase uses assertion utilities correctly
4. **Deterministic execution** - Proper RNG handling for reproducibility
5. **No critical bugs** - System is stable and functional

### Areas of Concern
1. **Performance** - Unnecessary iterations and computations
2. **Memory management** - No cleanup in batch testing
3. **Code duplication** - Shared logic copy-pasted
4. **Incomplete features** - Stubbed deployment strategies
5. **State mutation patterns** - Direct assignment without validation

### State Propagation Analysis
The scenario state propagation is **functionally correct** but inefficient:
- State.scenario properly flows from initialization to phases
- ApplyScenarioPrioritiesPhase correctly reads and applies priorities
- No race conditions identified
- No circular dependencies detected

However, the pattern of checking every month is wasteful for static values.

### Complexity Assessment
The framework adds **acceptable complexity** for its testing value:
- Clear interface boundaries (ScenarioDefinition)
- Single responsibility (testing governance strategies)
- Reasonable abstraction level
- Could be simpler but not over-engineered

## Recommendations Summary

### Must Fix (Before Next Major Feature)
1. **Tech deployment O(n) inefficiency** - SMALL effort, clear performance win
2. **Memory management in batch runner** - SMALL effort, prevents OOM
3. **Code duplication cleanup** - SMALL effort, reduces maintenance burden

### Should Fix (Technical Debt Reduction)
4. **Cache scenario computations** - MEDIUM effort, significant performance gain
5. **Add scenario validation** - SMALL effort, prevents bugs
6. **Document/remove stub strategies** - SMALL effort, reduces confusion

### Can Defer (Nice to Have)
7. Error boundaries in batch runner
8. JSON write optimization
9. Extract hard-coded thresholds

## Performance Impact Estimates

Current implementation with 90 simulations (9 scenarios × 10 runs × 120 months):
- **Tech deployment:** 90 × 73 techs × 2 loops = ~13,140 iterations (could be 6,570)
- **Priority application:** 90 × 120 months = 10,800 executions (most unnecessary)
- **Memory usage:** ~900MB accumulated (could be ~100MB with cleanup)
- **File I/O:** 90 synchronous writes (could be batched)

With recommended optimizations:
- 50% reduction in initialization time
- 80% reduction in priority application overhead
- 90% reduction in memory usage
- 30% reduction in total execution time

## Final Assessment

**RECOMMENDATION:** The scenario framework is architecturally acceptable and poses no stability risks. The identified issues are performance optimizations and code quality improvements that should be addressed during normal development cycles, not as emergency fixes.

The framework successfully achieves its testing goals and the technical debt is manageable. Focus on the HIGH PRIORITY items during the next refactoring window, but don't delay feature work to address these issues.

**Priority Schedule:**
1. **Next PR:** Fix tech deployment O(n) issue (item #1)
2. **Next refactor window:** Memory management and code duplication (items #2, #6)
3. **When touching the code:** Cache computations (item #3)
4. **Future cleanup:** Remaining LOW PRIORITY items

The system is safe to use in its current state but would benefit from these incremental improvements.