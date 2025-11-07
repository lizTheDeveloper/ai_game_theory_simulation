# Roy's Code Annotations Guide

**Last Updated:** 2025-11-05
**Author:** Roy (simulation-maintainer)
**Purpose:** Document accumulated learnings from bug fixes throughout the simulation codebase

---

## Overview

This guide explains the "ROY'S NOTE" annotations added throughout the simulation codebase. These annotations capture hard-won learnings from actual bugs I've fixed, providing context that git history and type systems can't convey.

**Pattern:** Each annotation includes:
- **What broke** (specific bug)
- **Why it broke** (root cause)
- **How it was fixed** (solution)
- **What I learned** (lesson for future developers)

---

## Annotated Files

### 1. `/src/simulation/utils/assertions.ts`

**Why it exists:** Response to the Oct 24 NaN bug that was hidden for MONTHS by a `?? 50` fallback.

**Key annotations:**
- **File header:** Origins of fail-loud philosophy, Property Access Crisis (847 unsafe accesses)
- **`assertStateProperty()`:** The MOST IMPORTANT utility - replaces all `?? fallback` patterns

**Critical learning:**
> In research simulations, FAIL LOUDLY. Silent fallbacks mask bugs. Better to crash with full context than produce wrong results silently.

**When to read:** Before adding any calculation code or state access patterns.

---

### 2. `/src/simulation/utils/geometricMean.ts`

**Why it exists:** Geometric means can produce EXACTLY zero, then division creates NaN cascades.

**Key annotation:**
- **`MIN_FLOOR` constant:** Explains difference between fallbacks (bad) vs floors (mathematical necessity)

**Critical learning:**
> MIN_FLOOR = 0.1 prevents division-by-zero NaN cascades. This is NOT a silent fallback - it's a mathematical necessity for geometric means. Without it, a single zero in the inputs zeroes the entire calculation.

**Example failure case:**
```typescript
values = [90, 85, 0, 75]
product = 90 × 85 × 0 × 75 = 0
geometricMean = 0^(1/4) = 0
laterCalculation = someValue / geometricMean = NaN ❌
```

**When to read:** Before using geometric means or any non-linear aggregation.

---

### 3. `/src/simulation/engine/PhaseOrchestrator.ts`

**Why it exists:** Phase order violations create subtle bugs that hide for months.

**Key annotation:**
- **File header:** Comprehensive guide to three major phase ordering bugs:
  1. Circular dependencies (reading before writing)
  2. Race conditions (mutation order within phases)
  3. Determinism violations (helper function defaults)

**Critical learnings:**

**Circular Dependencies:**
> If you're reading a value written by a LATER phase, you're reading STALE data from last month.

**Race Conditions:**
> Mutation order within a phase matters as much as phase order between phases.

**Determinism:**
> Default RNG parameters hide non-determinism. Month 0 deterministic, Month 1+ diverged.

**Checklist for new phases:**
- Pick order number carefully (see 0-36 categories)
- Check what state you READ (must be written by earlier phases)
- Check what state you WRITE (will later phases depend on it?)
- Use `assertPhaseDependency()` to validate ordering
- NEVER use `Math.random()` - always use the `rng` parameter

**When to read:** Before adding a new phase or modifying phase execution order.

---

### 4. `/src/simulation/initialization.ts`

**Why it exists:** Initialization bugs are the WORST - they hide until specific scenarios trigger them.

**Key annotation:**
- **File header:** Four categories of initialization bugs with examples

**Critical learnings:**

**1. Implicit Contracts Fail Silently:**
```typescript
// Code assumes: initializeState() creates ALL nested objects
// Reality: Initialization varies by scenario, some branches skip objects
// Example: Ocean state not initialized in land-only scenarios
```

**2. Dynamic State Creation:**
```typescript
// Regional populations created dynamically from country aggregation
// "Eastern Asia" (UN name) vs "East Asia" (common name) → mismatch
// Fix: Initialize missing fields in updateRegionalPopulations()
```

**3. Initialization Order Dependencies:**
```typescript
// mortalityStabilizers needs resilienceProfile
// Without validation, crashes happen intermittently
// Fix: After Month 3, assert ALL required fields exist
```

**4. Parameter Validation:**
```typescript
// unemploymentLevel: 0.1→0.049 (ILO 2024 data)
// qualityOfLife: 0.65→0.74 (UNDP HDI 2024)
// Every parameter needs peer-reviewed source citation
```

**Checklist for new initialization code:**
- Initialize ALL nested objects (don't assume parents exist)
- Add source citations for parameter values
- Use `assertStateProperty()` at usage sites
- Test multiple scenarios (not just baseline)
- Consider dynamic creation paths

**When to read:** Before adding new state fields or initialization logic.

---

### 5. `/src/simulation/engine/phases/MortalityStabilizersPhase.ts`

**Why it exists:** Example of circular dependency fix (H1 Architecture Review).

**Key annotation:**
- **`calculateGlobalCrisisIndicators()`:** Detailed explanation of temporal coupling bug

**Critical learning:**
> This function used to read `monthlyExcessDeaths` written by a LATER phase (20.9). Reading before writing = reading stale data. Fix: Use `foodSecurity` proxy available at earlier phase (19.7).

**Pattern:**
```typescript
// ❌ BAD - Temporal coupling
Phase 20.8: Read monthlyExcessDeaths  // Reads LAST month's value
Phase 20.9: Write monthlyExcessDeaths // Writes THIS month's value

// ✅ GOOD - Correct ordering
Phase 19.7: Write foodSecurity        // Available data
Phase 20.8: Read foodSecurity         // Fresh data
```

**When to read:** Before accessing state that might be written by later phases.

---

### 6. `/src/simulation/utils/deterministicRng.ts`

**Why it exists:** Determinism was completely broken (Issue #11).

**Key annotation:**
- **File header:** Comprehensive explanation of determinism crisis and pragmatic solution

**Critical learning:**
> 150 `Math.random()` calls broke Monte Carlo. Helper functions had `rng: RNGFunction = Math.random` defaults. Phases passed `rng()` correctly, but helpers STILL used `Math.random()` as fallback. This created invisible non-determinism.

**The trap:**
```typescript
// Helper function signature
function someHelper(state: GameState, rng: RNGFunction = Math.random) {
  if (rng() < 0.5) { ... }  // Falls back to Math.random if not passed
}

// Phase code
execute(state, rng, context) {
  setDeterministicRng(rng);  // ✅ Phase sets RNG
  someHelper(state);         // ❌ Helper falls back to Math.random()
}
```

**5 Rules for Maintaining Determinism:**
1. NEVER use `Math.random()` in simulation code
2. ALWAYS call `setDeterministicRng(rng)` at start of phase `execute()`
3. ALWAYS use `deterministicRandom()` in helper functions
4. NEVER use `Date.now()` for IDs (use `state.eventIdCounter`)
5. Test with `scripts/verifyDeterminism.ts` before committing

**When to read:** Before adding any randomness or modifying RNG usage.

---

## Common Themes Across Annotations

### 1. Fail Loudly > Silent Failures

**Context determines correctness:**
- **UI code:** Defensive getters (degrade gracefully for user experience)
- **Simulation code:** Assertions (fail loudly for calculation correctness)

**Pattern:**
```typescript
// ❌ BAD - Silent fallback in simulation
const value = state.oceanHealth.pH ?? 8.1;  // Hides initialization bugs

// ✅ GOOD - Fail loudly with context
const value = assertStateProperty(
  state.oceanHealth,
  'pH',
  { location: 'applyOceanTech', month: state.currentMonth }
);
```

---

### 2. Temporal Coupling is Insidious

**Phase order matters:**
- Reading before writing = stale data
- Circular dependencies hide for months
- Mutation order within phases matters too

**Detection:**
```typescript
// Use assertions to catch violations
assertPhaseDependency(context, 'bayesian_mortality_resolution', {
  currentPhase: 'regional_population_update',
  reason: 'Must not overwrite mortality-adjusted population'
});
```

---

### 3. Defensive Coding Traps

**When "defensive" becomes dangerous:**
- Silent fallbacks (`?? 0`, `|| defaultValue`) mask bugs
- Default parameters hide non-determinism
- Geometric mean floors ≠ fallbacks (mathematical necessity)

**Pattern:**
```typescript
// ❌ TRAP - Default parameter hides non-determinism
function helper(rng: RNGFunction = Math.random) { ... }

// ✅ FIX - Required parameter, fail if missing
function helper(rng: RNGFunction) { ... }
```

---

### 4. Initialization Assumptions Fail

**Sources of failure:**
- Dynamic state creation (regions from countries)
- Scenario-dependent initialization (ocean in land-only)
- Field name mismatches (Eastern Asia vs East Asia)

**Solution:**
> Over-initialize rather than assume. Better to initialize fields that aren't always used than to crash when they're missing.

---

### 5. Determinism is Fragile

**Invisible non-determinism:**
- Helper defaults (`rng = Math.random`)
- ID generation (`Date.now()`)
- Uncontrolled external state

**Verification:**
```bash
# Run before committing changes with randomness
npx tsx scripts/verifyDeterminism.ts
```

---

## How to Use These Annotations

### When Reading Code

1. **Look for `ROY'S NOTE:` sections** - These mark locations where bugs occurred
2. **Read the full context** - Each note explains what, why, how, and lesson learned
3. **Check related files** - Bugs often span multiple modules

### When Writing Code

1. **Search for relevant notes** - If working on phases, read PhaseOrchestrator.ts notes
2. **Follow the checklists** - Each annotated file has a checklist for new code
3. **Validate with tools** - Use assertion utilities, run determinism tests

### When Debugging

1. **Check if Roy's note exists** - Has this bug happened before?
2. **Look for pattern matches** - Similar to documented bugs?
3. **Add new annotations** - If you fix a new bug, add a Roy's note

---

## Quick Reference: Which File to Read

| Your Task | Read This File |
|-----------|---------------|
| Adding calculation code | `assertions.ts` |
| Using geometric means | `geometricMean.ts` |
| Adding new phase | `PhaseOrchestrator.ts` |
| Adding state fields | `initialization.ts` |
| Accessing state from phases | `MortalityStabilizersPhase.ts` |
| Adding randomness | `deterministicRng.ts` |
| Fixing NaN bugs | `assertions.ts`, `geometricMean.ts` |
| Fixing race conditions | `PhaseOrchestrator.ts`, `MortalityStabilizersPhase.ts` |
| Fixing crashes | `assertions.ts`, `initialization.ts` |

---

## Philosophy Behind the Annotations

**Why add these notes when we have git history?**

1. **Git shows WHAT changed** - Annotations explain WHY it matters
2. **Type systems catch syntax** - Annotations catch semantic bugs
3. **Tests verify correctness** - Annotations prevent regressions
4. **Code reviews catch mistakes** - Annotations teach patterns

**These annotations are a second pair of eyes - the cynical, experienced pair that's seen every edge case break production.**

---

## Maintenance

**When to add new annotations:**
- After fixing non-trivial bugs
- When discovering subtle patterns
- When learning architectural lessons

**When to update annotations:**
- If the bug pattern changes
- If better solutions are found
- If context becomes obsolete

**Format:**
```typescript
/**
 * ROY'S NOTE: [Title of learning]
 *
 * [What broke - concrete example]
 * [Why it broke - root cause]
 * [How it was fixed - solution]
 * [What I learned - lesson]
 *
 * Pattern to avoid:
 * ❌ BAD: [bad code example]
 *
 * Pattern to use:
 * ✅ GOOD: [good code example]
 */
```

---

## Summary

These annotations document the journey from bugs to fixes to learnings. They're not just comments - they're accumulated wisdom from debugging production incidents.

**Use them. Learn from them. Add to them.**

When Roy says "don't do X", there's a reason. Usually involving a bug that took hours to debug.

-- Roy
*"Fixed it. Annotated it. You're welcome."*
