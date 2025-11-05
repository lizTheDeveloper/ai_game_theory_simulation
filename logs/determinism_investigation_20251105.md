# Determinism Investigation Log
**Date:** November 5, 2025
**Investigator:** Roy (simulation-maintainer)
**Status:** IN PROGRESS - Root cause not yet identified

## Problem Statement

Monte Carlo simulations with identical seeds produce DIFFERENT results. This breaks research reproducibility and makes validation impossible.

**Symptoms:**
- Month 0: ✅ Deterministic (all runs identical)
- Month 1-12: ❌ Non-deterministic (capabilities diverge → agent count diverges → cascading differences)

## Root Cause Analysis

### Confirmed Issue
AI agent capabilities are diverging in Month 1, causing:
```
Month 1 Run 1: totalCapability=2.428283 from 20 active AIs
Month 1 Run 2: totalCapability=2.413176 from 20 active AIs
Month 1 Run 3: totalCapability=2.448324 from 20 active AIs
```

This ~0.03 difference in total capability cascades:
1. Different `calculateCreationRate()` values
2. Different Poisson samples for new AI creation
3. Different AI agent counts (21 vs 20 vs 22)
4. Growing divergence over time

### Fixes Applied

#### Fix 1: Object.keys() Iteration (lifecycle.ts lines 239-242)
**Problem:** Object.keys() returns keys in non-deterministic order in V8
```typescript
// ❌ BEFORE (non-deterministic)
const subDimKeys = Object.keys(agentCat) as Array<keyof typeof agentCat>;
for (const key of subDimKeys) {
  (agentCat[key] as number) = Math.max(agentCat[key] as number, floorCat[key] as number);
}

// ✅ AFTER (deterministic)
const researchSubdimensions = {
  biotech: ['drugDiscovery', 'geneEditing', 'syntheticBiology', 'neuroscience'] as const,
  materials: ['nanotechnology', 'quantumComputing', 'energySystems'] as const,
  climate: ['modeling', 'intervention', 'mitigation'] as const,
  computerScience: ['algorithms', 'security', 'architectures'] as const
};

for (const category of ['biotech', 'materials', 'climate', 'computerScience'] as const) {
  const agentCat = agent.capabilityProfile.research[category];
  const floorCat = capabilityFloor.research[category];

  for (const key of researchSubdimensions[category]) {
    (agentCat[key] as number) = Math.max(agentCat[key] as number, floorCat[key] as number);
  }
}
```

**Result:** ❌ Did NOT fix the issue - divergence persists

### Investigation Results

#### Ruled Out
- ✅ **Math.random() usage:** No instances found in src/simulation/
- ✅ **RNG determinism:** SeededRandom uses LCG, is deterministic
- ✅ **Array.sort() without comparator:** None found
- ✅ **Object iteration in research.ts:** No Object.keys/entries/values
- ✅ **Object iteration in capabilities.ts:** No Object.keys/entries/values

#### Potential Remaining Causes

1. **Hidden Object iteration** (171 instances found total)
   - Most are in phases that run AFTER Month 1 divergence
   - Need to audit phases with order < 10.0

2. **Map/Set iteration**
   - Found in several phases (CollectiveFormationPhase, ClimateImpactCascadePhase, etc.)
   - Most run late (order > 10), shouldn't affect Month 1

3. **Conditional RNG consumption**
   - Code that calls `rng()` different numbers of times based on state
   - Could cause RNG stream desync between runs

4. **Floating point non-associativity**
   - If operations happen in different orders, rounding could differ
   - Unlikely with identical code paths

## Next Steps

### Immediate Actions Needed

1. **Add phase-level determinism tracking**
   - Log AI capability sum BEFORE and AFTER each phase
   - Identify which phase first introduces divergence

2. **Audit early phases for Object iteration**
   - Focus on phases with order 0-10 that run before/during Month 1
   - Check for Object.keys/entries/values, Map/Set iteration

3. **Check conditional RNG consumption**
   - Look for if/switch statements that conditionally call rng()
   - Ensure all code paths consume same number of RNG calls

4. **Consider float ordering**
   - Check if Array.reduce() operations could differ in order
   - Verify no parallel execution (Promise.all, etc.)

### Test Strategy

```bash
# Run with heavy logging to find divergence point
npx tsx scripts/verifyDeterminism.ts --max-months=1 --runs=3 > logs/debug.log 2>&1

# Check for phase-level differences
grep "PHASE:" logs/debug.log | diff <(grep "RUN 1" logs/debug.log) <(grep "RUN 2" logs/debug.log)
```

## Technical Notes

### Determinism Requirements
1. **No Math.random()** - Use `rng()` parameter everywhere
2. **No Date.now()** - Use `state.currentMonth` for time
3. **Deterministic iteration** - Explicit key order, no Object.keys()
4. **Consistent RNG consumption** - All code paths use same number of rng() calls
5. **No external I/O** - No file reads, API calls, etc.

### Debug Logging Added
- `lifecycle.ts:64-65` - Log totalCapability for creationRate calculation
- `lifecycle.ts:616-618` - Log Poisson sampling (creationRate, potentialNew, newAIsToCreate)

### Files Modified
- `src/simulation/lifecycle.ts` - Fixed Object.keys() iteration (lines 231-247)
- `src/simulation/lifecycle.ts` - Added debug logging (lines 63-65, 616-618)

## Roy's Notes

*sigh* This is worse than the NaN bug. At least with NaN, you KNOW something's wrong when you see it. Non-determinism is SILENT - the simulation runs fine, produces "reasonable" results, but they're UNREPRODUCIBLE.

The Oct 24 ecology NaN bug was hidden for months by a `?? 50` fallback. This determinism bug could have been hiding even longer - we only found it because we started systematic Monte Carlo validation.

The fix for Object.keys() was the right idea, but it's clearly not the ONLY source of non-determinism. There's something else lurking in the codebase.

**Priority:** CRITICAL - blocks all Monte Carlo analysis and invalidates research claims about outcome probabilities.

**Estimated time:** Unknown - need to systematically audit 171 Object iteration sites

**Lessons:**
1. Defensive coding applies to determinism too - use explicit key orders everywhere
2. Debug logging is ESSENTIAL for finding these issues
3. Small divergences (0.03 capability difference) cascade exponentially
4. Research simulations need STRICT determinism discipline

---
*Investigation continues...*
