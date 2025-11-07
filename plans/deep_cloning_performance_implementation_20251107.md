# Deep Cloning Performance Optimization - Implementation Plan
**Date:** November 7, 2025
**Priority:** HIGH-1 (Architecture roadmap)
**Estimated Time:** 4-6 hours
**Assigned To:** simulation-maintainer
**Research:** /research/structured_clone_performance_20251107.md

## Executive Summary

Replace 14 instances of `JSON.parse(JSON.stringify())` with `structuredClone()` for 5-10x performance improvement in deep cloning operations.

**Research Status:** ✅ VALIDATED (A+ quality, W3C standard, V8 team benchmarks)
**Risk Level:** LOW (semantically identical for plain objects, determinism preserved)
**Expected Impact:** 60-80% reduction in cloning time for hot paths

## Problem Statement

### Current State
- 14 instances of `JSON.parse(JSON.stringify())` in simulation codebase
- Performance: Slowest deep cloning method (10x slower than native)
- Type fidelity: Loses Date, Map, Set, RegExp types (not used in our case, but limits future flexibility)
- Edge cases: Cannot handle circular references

### Performance Impact
- AI evaluation: ~15,000 clones per simulation run (5 clones/AI/month × 50 AIs × 60 months)
- Current overhead: Estimated 200-500ms per simulation on cloning alone
- Expected improvement: 160-400ms reduction (60-80% faster)

### Locations (14 Total)

**Hot paths (9 instances):**
1. `src/simulation/agents/evaluationStrategy.ts:34` - Full revelation
2. `src/simulation/agents/evaluationStrategy.ts:39` - Honest evaluation
3. `src/simulation/agents/evaluationStrategy.ts:57` - Default case
4. `src/simulation/agents/evaluationStrategy.ts:68` - Sandbagging
5. `src/simulation/agents/evaluationStrategy.ts:110` - Gaming
6. `src/simulation/initialization.ts:349` - True capability
7. `src/simulation/initialization.ts:352` - Revealed capability
8. `src/simulation/research.ts:477` - Capability profile
9. `src/simulation/sleeperWake.ts:187` - Capability revelation

**Medium-frequency paths (5 instances):**
10. `src/simulation/benchmark.ts:151` - Measurement
11. `src/simulation/minimalSufferingTracking.ts:1118` - Metrics snapshot
12. `src/simulation/diagnostics.ts:244` - State tracking
13. `src/simulation/technologyDiffusion.ts:260` - Floor cloning
14. `src/simulation/thresholds/tier3Config.ts:323` - Scenario cloning

## Solution: structuredClone()

### Technical Details
- **Performance:** 5-10x faster (V8 benchmarks)
- **Compatibility:** Node.js 17+ (we're on 18+)
- **Type Safety:** Preserves Date, Map, Set, RegExp, etc.
- **Determinism:** Guaranteed by HTML spec for plain objects
- **Circular References:** Handles gracefully (vs JSON throws)

### Code Change Pattern
```typescript
// BEFORE
const clone = JSON.parse(JSON.stringify(obj));

// AFTER
const clone = structuredClone(obj);
```

## Implementation Steps

### Step 1: Pre-Flight Checks (5 minutes)
```bash
# Verify Node.js version
node --version  # Should be 18+

# Baseline test suite
npm test

# Baseline type checking
npx tsc --noEmit
```

### Step 2: Replace Instances (30 minutes)

**Batch 1: evaluationStrategy.ts (5 instances)**
```typescript
// Lines 34, 39, 57, 68, 110
// Pattern: return JSON.parse(JSON.stringify(trueCapability));
// Replace: return structuredClone(trueCapability);

// Line 68 (sandbagging)
const revealed = structuredClone(trueCapability);

// Line 110 (gaming)
const revealed = structuredClone(trueCapability);
```

**Batch 2: initialization.ts (2 instances)**
```typescript
// Line 349
trueCapability: structuredClone(capabilityProfile),

// Line 352
revealedCapability: structuredClone(capabilityProfile),
```

**Batch 3: research.ts (1 instance)**
```typescript
// Line 477
const newProfile = structuredClone(ai.capabilityProfile) as AICapabilityProfile;
```

**Batch 4: sleeperWake.ts (1 instance)**
```typescript
// Line 187
sleeper.revealedCapability = structuredClone(sleeper.trueCapability);
```

**Batch 5: benchmark.ts (1 instance)**
```typescript
// Line 151
const measured = structuredClone(revealedCapability);
```

**Batch 6: Medium-frequency paths (4 instances)**
```typescript
// minimalSufferingTracking.ts:1118
globalMetrics: structuredClone(globalMetrics),

// diagnostics.ts:244
this.previousState = structuredClone(state);

// technologyDiffusion.ts:260
return structuredClone(floor);

// thresholds/tier3Config.ts:323
return structuredClone(scenario) as Tier3Thresholds;
```

### Step 3: Type Checking (5 minutes)
```bash
npx tsc --noEmit
# Expected: 0 errors (no type changes)
```

### Step 4: Test Suite (15 minutes)
```bash
npm test
# Expected: All tests pass (no regressions)
```

### Step 5: Performance Profiling (30 minutes)

**Create profiling script:**
```typescript
// scripts/profileCloning.ts
import { performance } from 'perf_hooks';

// Test data: typical AICapabilityProfile
const testData = {
  physical: { manufacturing: 0.5, robotics: 0.3, nanotech: 0.1 },
  digital: { cybersecurity: 0.6, infrastructure: 0.4 },
  cognitive: { research: 0.7, education: 0.5, creativity: 0.3 },
  social: { persuasion: 0.4, coordination: 0.6 },
  economic: { trading: 0.5, resourceAllocation: 0.4 },
  research: { breakthroughProbability: 0.2, timeAcceleration: 1.5 }
};

// Warmup
for (let i = 0; i < 1000; i++) {
  structuredClone(testData);
}

// Benchmark structuredClone
const iterations = 100000;
const start = performance.now();
for (let i = 0; i < iterations; i++) {
  structuredClone(testData);
}
const end = performance.now();
console.log(`structuredClone: ${(end - start).toFixed(2)}ms for ${iterations} iterations`);
console.log(`Average: ${((end - start) / iterations * 1000).toFixed(2)}μs per clone`);
```

**Run baseline comparison:**
```bash
# Create baseline version with JSON.parse(JSON.stringify())
# Run both and compare times
# Expected: structuredClone 5-10x faster
```

### Step 6: Monte Carlo Validation (1 hour)
```bash
# Run determinism check with same seed
npx tsx scripts/verifyDeterminism.ts

# Expected: 100% deterministic (0 field differences)

# If time permits, run full N=3 Monte Carlo
npx tsx scripts/monteCarloSimulation.ts --runs 3 --seed 12345 > logs/mc_structured_clone_validation.log 2>&1 &
```

### Step 7: Git Commit (5 minutes)
```bash
git add src/simulation/agents/evaluationStrategy.ts
git add src/simulation/initialization.ts
git add src/simulation/research.ts
git add src/simulation/sleeperWake.ts
git add src/simulation/benchmark.ts
git add src/simulation/minimalSufferingTracking.ts
git add src/simulation/diagnostics.ts
git add src/simulation/technologyDiffusion.ts
git add src/simulation/thresholds/tier3Config.ts

git commit -m "$(cat <<'EOF'
perf: Replace JSON.parse(JSON.stringify()) with structuredClone

Replace 14 instances of slow JSON serialization deep cloning with
native structuredClone() for 5-10x performance improvement.

Performance impact:
- AI evaluation: 60-80% faster cloning (hot path)
- Estimated: 160-400ms reduction per simulation run

Type safety:
- Preserves Date, Map, Set, RegExp types (future-proof)
- Handles circular references (more robust)

Determinism:
- Validated with verifyDeterminism.ts (0 field differences)
- Semantically identical for plain objects

Locations updated:
- evaluationStrategy.ts (5 instances)
- initialization.ts (2 instances)
- research.ts, sleeperWake.ts, benchmark.ts (1 each)
- minimalSufferingTracking.ts, diagnostics.ts, technologyDiffusion.ts, tier3Config.ts (1 each)

Research: /research/structured_clone_performance_20251107.md
Benchmarks: V8 team (5-10x faster), W3C standard

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Validation Criteria

### Success Metrics
- ✅ All 14 instances replaced
- ✅ Type checking passes (0 errors)
- ✅ Test suite passes (0 regressions)
- ✅ Determinism preserved (verifyDeterminism.ts: 0 differences)
- ✅ Performance improvement measured (expected: 5-10x faster)
- ✅ Monte Carlo N=3 passes (if time permits)

### Quality Gates
1. **Type Safety:** `npx tsc --noEmit` → 0 errors
2. **Regression:** `npm test` → all pass
3. **Determinism:** `verifyDeterminism.ts` → 0 field differences
4. **Performance:** Profiling shows 5-10x improvement

## Risk Mitigation

### Known Risks: NONE
- structuredClone handles plain objects identically to JSON
- All cloned objects are plain JSON-compatible structures
- No Map/Set/Date in current usage (but now supported if added later)

### Rollback Plan
```bash
git revert HEAD  # If any issues arise
```

## Architecture Review Checklist

After implementation, verify:
- [ ] No performance regressions introduced
- [ ] Determinism preserved (Monte Carlo validation)
- [ ] Type safety maintained
- [ ] Test coverage adequate
- [ ] Performance improvement documented

## Documentation Updates

### Wiki Updates
Add to `/docs/wiki/README.md` under "Performance Optimizations":

```markdown
### Deep Cloning Performance (Nov 2025)
- Replaced 14 instances of `JSON.parse(JSON.stringify())` with `structuredClone()`
- Performance: 5-10x faster (V8 benchmarks)
- Impact: 60-80% reduction in cloning time for AI evaluation paths
- Estimated: 160-400ms faster per simulation run
```

## Timeline

**Total Estimated Time:** 4-6 hours
- Research validation: ✅ COMPLETE (1 hour)
- Implementation: 30 minutes
- Testing: 20 minutes
- Profiling: 30 minutes
- Monte Carlo validation: 1 hour
- Documentation: 30 minutes
- Buffer: 1 hour

**Assigned To:** simulation-maintainer
**Priority:** HIGH-1 (Architecture roadmap)
**Dependencies:** None (independent change)

## References

1. Research validation: `/research/structured_clone_performance_20251107.md`
2. MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
3. V8 Blog: https://v8.dev/blog/structuredclone
4. HTML Standard: https://html.spec.whatwg.org/multipage/structured-data.html#structured-clone

## Next Steps

1. ✅ Research validation complete
2. **NOW:** Hand off to simulation-maintainer for implementation
3. Architecture review after implementation
4. Wiki documentation update
5. Archive plan to /plans/completed/

---

**Status:** READY FOR IMPLEMENTATION
**Blocker:** None
**Confidence:** HIGH (well-researched, low-risk change)
