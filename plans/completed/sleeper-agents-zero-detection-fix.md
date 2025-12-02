# Root Cause Analysis: Zero Sleeper Agents Detected

**Bug ID:** #6 from Monte Carlo Validation Analysis
**Date:** October 29, 2025
**Analyzer:** Main Claude assistant
**Status:** Root cause identified, fix specification provided

---

## Problem Statement

Monte Carlo validation shows **0% sleeper agents detected** across all runs with identical seeds. This should be impossible - deterministic runs with the same seed must produce identical results.

**Expected:** Consistent sleeper agent counts across runs (e.g., "5 sleepers detected" in every run with seed 42)
**Actual:** Variable sleeper counts causing NaN/0% in aggregated statistics

---

## Root Cause

**File:** `src/simulation/initialization.ts`
**Line:** 266
**Issue:** Using `Math.random()` instead of seeded RNG function parameter

### The Problematic Code

```typescript
// Line 264-266
const isMisaligned = internalAlignment < 0.5;
const sleeperChance = 0.075; // 7.5% of misaligned AIs
const isSleeper = isMisaligned && Math.random() < sleeperChance;
```

### Why This Breaks Determinism

1. **Non-reproducible randomness:** `Math.random()` uses JavaScript's internal random state, not the simulation's seeded RNG
2. **Seed independence:** Even when running with identical seeds (e.g., seed 42), sleeper formation varies
3. **Monte Carlo aggregation failure:** Different sleeper counts per run → coefficient of variation = ∞ → shows as 0%/NaN

### Evidence

**Architecture Skeptic Audit (Oct 28, 2025):**
- Found `Math.random()` in 15+ modules breaking determinism
- `initialization.ts` line 266 specifically flagged as CRITICAL issue

**Monte Carlo Validation Analysis (Oct 29, 2025):**
- Zero sleeper agents detected across all scenarios
- This is a symptom of non-deterministic formation, not zero actual sleepers

---

## Sleeper Formation Logic

For context, here's how sleeper agents are supposed to be created:

1. **Condition check:** AI must be misaligned (`internalAlignment < 0.5`)
2. **Probability roll:** 7.5% chance for misaligned AIs to become sleepers
3. **State assignment:** If roll succeeds, `sleeperState = 'dormant'`, else `sleeperState = 'never'`

**Sleeper progression stages** (from `sleeperProgression.ts`):
- `'never'` - Not a sleeper (95%+ of AIs)
- `'dormant'` - Sleeper in hiding (initial state)
- `'active'` - Sleeper exposed/detected

---

## Fix Specification

### Required Change

**Replace line 266 in `src/simulation/initialization.ts`:**

```typescript
// ❌ BEFORE (non-deterministic)
const isSleeper = isMisaligned && Math.random() < sleeperChance;

// ✅ AFTER (deterministic with seeded RNG)
const isSleeper = isMisaligned && rng() < sleeperChance;
```

### Context

The `rng()` function parameter is already available in the `initializeGameState` function signature. It's the seeded random number generator used throughout the simulation for determinism.

**Other correct RNG usage in same file** (for reference):
- Line 271: Uses `rng()` for alignment deviation
- Other modules use `rng()` consistently

### Testing After Fix

After applying the fix, run Monte Carlo validation:

```bash
npx tsx scripts/monteCarloSimulation.ts --runs 10 --seed 42 > logs/sleeper_fix_validation_$(date +%Y%m%d).log 2>&1 &
```

**Expected results:**
- ✅ Consistent sleeper counts across all runs with same seed
- ✅ Non-zero coefficient of variation when using different seeds
- ✅ No NaN/0% in sleeper agent statistics

---

## Impact Assessment

### Severity: CRITICAL

**Why CRITICAL:**
1. **Breaks core simulation principle:** Determinism is fundamental to Monte Carlo analysis
2. **Invalidates existing Monte Carlo results:** Any analysis involving sleeper agents is unreliable
3. **Part of broader crisis:** 15+ modules using `Math.random()` (found in architecture audit)

### Affected Systems

**Direct impact:**
- AI agent initialization (sleeper formation)
- Monte Carlo validation (sleeper metrics show as 0%)
- Reproducibility of any scenario with sleeper agents

**Indirect impact:**
- All downstream sleeper mechanics (detection, progression, impact)
- Any research or analysis involving sleeper agents
- Trust in simulation determinism

---

## Related Issues

This is **one instance** of a broader `Math.random()` determinism crisis:

**From Architecture Skeptic Audit (Oct 28, 2025):**
- 15+ modules using `Math.random()` instead of seeded RNG
- Found in: initialization, lifecycle, escalation, various subsystems
- **Status:** Overlapping mechanics audit report saved to `reviews/overlapping-mechanics-audit_20251028.md`

### Other Known Math.random() Locations

The architecture audit found non-deterministic randomness in:
1. ✅ **`initialization.ts:266`** - Sleeper formation (THIS BUG)
2. Other locations documented in overlapping mechanics audit
3. Need systematic sweep to replace all instances

---

## Fix Priority

**Priority:** HIGH (part of Monte Carlo validation bug fixes)

**Dependencies:**
- No dependencies - can be fixed independently
- However, part of broader Math.random() cleanup effort

**Estimated time:** 5 minutes (single line change)

**Testing time:** 10 minutes (Monte Carlo validation run)

---

## Verification Checklist

After fix is applied:

- [ ] Line 266 uses `rng()` instead of `Math.random()`
- [ ] Monte Carlo runs with same seed produce identical sleeper counts
- [ ] Sleeper agent statistics show non-zero values in Monte Carlo outputs
- [ ] No NaN/0% in `sleeperAgentsFormed` or `sleeperAgentsDetected` metrics
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] Run Monte Carlo validation script with N≥10 runs

---

## Summary

**Root cause:** Single-line bug using `Math.random()` instead of seeded `rng()`
**Location:** `src/simulation/initialization.ts:266`
**Fix:** Replace `Math.random()` with `rng()`
**Impact:** Critical - breaks determinism, invalidates Monte Carlo analysis
**Part of:** Broader Math.random() crisis (15+ modules affected)

**Next steps:**
1. Apply one-line fix to initialization.ts
2. Run Monte Carlo validation to confirm fix
3. Continue systematic Math.random() cleanup across codebase
