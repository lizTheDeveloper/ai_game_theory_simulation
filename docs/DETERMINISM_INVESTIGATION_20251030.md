# Determinism Investigation Report
**Date:** October 30, 2025
**Issue:** Monte Carlo Validation #11 - Determinism Verification Testing
**Investigator:** Roy (Simulation Maintainer)
**Status:** ❌ **CRITICAL - Non-Determinism Confirmed**

---

## Executive Summary

**VERDICT: Simulation is NOT deterministic.**

Verification testing with identical seeds (seed=42000) across 3 runs revealed **non-deterministic behavior starting at Month 1**, with differences propagating through all 12 months tested. Total of **176 field differences** detected.

**Impact:** This completely undermines Monte Carlo reproducibility and research validity.

**Root Cause:** Multiple uses of `Math.random()` and `Date.now()` in simulation code instead of the seeded RNG.

**Severity:** CRITICAL - Must be fixed before any Monte Carlo results can be considered valid.

---

## Test Methodology

### Configuration
- **Seed:** 42000 (identical for all runs)
- **Runs:** 3 (to detect variance)
- **Duration:** 12 months
- **Snapshot Interval:** Every month
- **Comparison Method:** SHA-256 hash of full state + field-by-field diff

### Verification Script
Created `/scripts/verifyDeterminism.ts` which:
1. Runs N identical simulations with same seed
2. Captures full state snapshots at regular intervals
3. Compares states via cryptographic hash (detects ANY difference)
4. Performs detailed field-by-field comparison when differences found
5. Reports specific fields that diverged

---

## Test Results

### Summary
```
✅ Month  0: All runs IDENTICAL (hash: ad0abca08258d833...)
❌ Month  1: DIFFERENCES DETECTED (3 different hashes)
❌ Month  2: DIFFERENCES DETECTED
❌ Month  3: DIFFERENCES DETECTED
... (pattern continues)
❌ Month 12: DIFFERENCES DETECTED

Total months with differences: 12/12
Total field differences found: 176
```

### Sample Differences (Month 1)

**AI Agent Capabilities - Run 1 vs Run 2:**
```
aiAgents[0].capability: 0.0786 !== 0.0510
aiAgents[0].alignment:  0.8147 !== 0.7921
aiAgents[1].capability: 0.0615 !== 0.0714
aiAgents[2].capability: 0.0700 !== 0.1248
aiAgents[3].capability: 0.0991 !== 0.0879
aiAgents[4].capability: 0.1286 !== 0.0913
```

**Pattern:** AI agent capabilities and alignment values diverge immediately after Month 0.

**Significance:** These divergences compound over time, leading to completely different simulation trajectories.

---

## Root Cause Analysis

### Non-Deterministic Sources Found

#### 1. **Math.random() Calls** (20+ instances)

**Files affected:**
```typescript
// src/simulation/computeInfrastructure.ts
ai.computeEfficiency = 0.9 + Math.random() * 0.3; // ❌ Non-deterministic

// src/simulation/freshwaterDepletion.ts
if (Math.random() < dayZeroProbability) { // ❌ Non-deterministic
  duration: 12 + Math.floor(Math.random() * 24), // ❌ Non-deterministic
  severity: 0.7 + Math.random() * 0.3, // ❌ Non-deterministic
}

// src/simulation/socialCohesion.ts
if (Math.random() < 0.4) { // ❌ Non-deterministic

// src/simulation/government/actions/*.ts (8 files)
id: `policy_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}` // ❌ Non-deterministic
```

**Impact:** Every call to `Math.random()` produces a different value on each run, even with identical seeds.

#### 2. **Date.now() Calls** (15+ instances)

**Files affected:**
```typescript
// src/simulation/socialInfluence.ts
id: `dm_${role}_${Date.now()}_${Math.floor(rng() * 1000)}` // ❌ Non-deterministic timestamp

// src/simulation/government/actions/*.ts (10 files)
return `${prefix}_${Date.now()}_${eventIdCounter}`; // ❌ Non-deterministic timestamp

// src/simulation/llm/providerManager.ts (multiple)
private lastSaveTime: number = Date.now(); // ❌ Non-deterministic
last_request_time: Date.now(), // ❌ Non-deterministic
```

**Impact:** Timestamps vary across runs, affecting IDs and potentially control flow.

---

## Why This Matters

### Research Validity
1. **Monte Carlo simulations require reproducibility** - Same seed MUST produce same results
2. **Debugging is impossible** - Can't reproduce bugs if behavior changes each run
3. **Parameter validation fails** - Can't isolate effects of parameter changes from random variance
4. **Peer review impossible** - Results can't be independently verified

### Current State
- **All existing Monte Carlo results are suspect** - We don't know if outcome distributions reflect true probabilities or random variance
- **All parameter tuning is invalid** - Can't distinguish signal from noise
- **All debugging sessions are unreliable** - Bug may not reproduce even with "same" seed

---

## Required Fixes

### Phase 1: Replace Math.random() with rng()

**Pattern to fix:**
```typescript
// ❌ BEFORE (non-deterministic)
if (Math.random() < probability) {
  value = 0.9 + Math.random() * 0.3;
}

// ✅ AFTER (deterministic)
function myFunction(state: GameState, rng: () => number) {
  if (rng() < probability) {
    value = 0.9 + rng() * 0.3;
  }
}
```

**Files requiring changes:**
1. `src/simulation/computeInfrastructure.ts`
2. `src/simulation/freshwaterDepletion.ts`
3. `src/simulation/socialCohesion.ts`
4. `src/simulation/government/actions/safetyActions.ts` (and 7 other action files)

**Estimated effort:** 2-3 hours (20+ call sites)

### Phase 2: Remove Date.now() from ID Generation

**Pattern to fix:**
```typescript
// ❌ BEFORE (non-deterministic ID)
id: `policy_${state.currentMonth}_${Date.now()}_${counter}`

// ✅ AFTER (deterministic ID - use counter only)
id: `policy_${state.currentMonth}_${counter}`

// OR use RNG for uniqueness
id: `policy_${state.currentMonth}_${Math.floor(rng() * 1000000)}`
```

**Files requiring changes:**
1. `src/simulation/socialInfluence.ts`
2. All `src/simulation/government/actions/*.ts` files (10 files)

**Estimated effort:** 1-2 hours (15+ call sites)

### Phase 3: LLM Provider Manager (Special Case)

**File:** `src/simulation/llm/providerManager.ts`

**Issue:** This file uses `Date.now()` for rate limiting, which is legitimate in production but breaks determinism.

**Options:**
1. **Remove from simulation entirely** - If LLM provider isn't actually used during simulation
2. **Mock with deterministic time** - Use `state.currentMonth * 30 * 24 * 60 * 60 * 1000` (simulated milliseconds)
3. **Make it conditional** - Only use real timestamps in non-deterministic mode

**Recommendation:** Option 3 - Add `useDeterministicTime` flag to simulation config.

---

## Validation Plan

### After Fixes
1. Run `npx tsx scripts/verifyDeterminism.ts` again
2. Should see: `✅ DETERMINISM VERIFIED: All runs produced bit-identical results!`
3. Run Monte Carlo with N=10, seeds [42000, 42001, ..., 42009]
4. Verify each seed produces identical results when repeated

### Regression Prevention
1. Add determinism verification to CI/CD pipeline
2. Pre-commit hook: Run quick determinism check (3 runs, 3 months)
3. Document RNG usage patterns in CLAUDE.md

---

## Immediate Actions Required

**BLOCKER for Monte Carlo validation:**

1. **DO NOT use any existing Monte Carlo results for research** - They're unreliable
2. **Fix all Math.random() calls** - Replace with rng() parameter
3. **Fix all Date.now() ID generation** - Use counters or rng()
4. **Re-run determinism verification** - Must pass before proceeding
5. **Re-run all Monte Carlo analyses** - Previous results are invalid

---

## Timeline Estimate

| Phase | Task | Duration | Dependencies |
|-------|------|----------|-------------|
| 1 | Fix Math.random() calls | 2-3h | None |
| 2 | Fix Date.now() ID generation | 1-2h | None |
| 3 | Fix LLM provider (if needed) | 1h | Phase 1-2 |
| 4 | Verification testing | 30min | Phase 1-3 |
| 5 | Monte Carlo re-validation | 2-4h | Phase 4 |
| **TOTAL** | | **6-10h** | |

---

## Code References

### Verification Script
- **Location:** `/scripts/verifyDeterminism.ts`
- **Usage:** `npx tsx scripts/verifyDeterminism.ts`
- **Output:** `/logs/determinism_verification_YYYYMMDD_HHMMSS.log`

### Log Files
- **Latest run:** `/logs/determinism_verification_20251030_185002.log`
- **Contains:** Full diff of all 176 field differences across 12 months

### Files Requiring Changes
```
src/simulation/computeInfrastructure.ts (1 Math.random)
src/simulation/freshwaterDepletion.ts (3 Math.random)
src/simulation/socialCohesion.ts (1 Math.random)
src/simulation/socialInfluence.ts (1 Date.now)
src/simulation/government/actions/safetyActions.ts (4 Math.random, 1 Date.now)
src/simulation/government/actions/crisisActions.ts (2 Math.random, 1 Date.now)
src/simulation/government/actions/researchActions.ts (2 Math.random, 1 Date.now)
src/simulation/government/actions/securityActions.ts (6 Math.random, 1 Date.now)
src/simulation/government/actions/regulationActions.ts (1 Date.now)
src/simulation/government/actions/internationalActions.ts (1 Date.now)
src/simulation/government/actions/economicActions.ts (1 Date.now)
src/simulation/government/actions/rightsActions.ts (1 Date.now)
src/simulation/government/actions/environmentalActions.ts (1 Date.now)
src/simulation/government/actions/detectionActions.ts (1 Date.now)
src/simulation/llm/providerManager.ts (8 Date.now, special case)
```

---

## Lessons Learned

### Why This Wasn't Caught Earlier
1. **No determinism testing in CI/CD** - This should be automated
2. **Easy to accidentally use Math.random()** - TypeScript doesn't prevent it
3. **Government actions added later** - Introduced non-determinism in recent commits
4. **Code review didn't catch it** - Need specific checklist item for RNG usage

### Prevention Strategies
1. **ESLint rule:** Ban `Math.random()` in `src/simulation/` directory
2. **Type system:** Make `rng` parameter required in phase signatures
3. **CI/CD gate:** Determinism verification must pass before merge
4. **Documentation:** Add RNG usage to onboarding docs

---

## Appendix: Technical Details

### Hash-Based Detection
Using SHA-256 of full serialized state provides:
- **100% sensitivity** - Detects ANY difference, no matter how small
- **Zero false negatives** - If hashes match, states are identical
- **Compact comparison** - 64-char hash instead of 900-line state diff
- **Fast comparison** - O(1) hash comparison vs O(n) field-by-field

### Field-by-Field Comparison
When hashes differ, detailed diff shows:
- **Which fields changed** - Pinpoints exact divergence
- **Magnitude of change** - Quantifies impact
- **Pattern recognition** - Reveals systematic vs random differences

### Why Month 0 Was Identical
Initialization phase (`createDefaultInitialState()`) doesn't call any random functions - it sets fixed values. Divergence begins in Month 1 when:
1. AI agents update capabilities (computeInfrastructure.ts uses Math.random())
2. Government creates policies (ID generation uses Date.now())
3. Social cohesion checks random events (Math.random() < 0.4)

---

**Report Author:** Roy (Simulation Maintainer)
**Status:** Ready for implementation
**Next Steps:** Fix all non-deterministic sources, re-run verification, validate Monte Carlo

*"This is why we can't have nice things. But we WILL fix it."* - Roy
