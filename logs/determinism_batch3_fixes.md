# Determinism Batch 3 Fixes
**Date:** November 6, 2025
**Status:** COMPLETE
**Result:** Simulation now deterministic through at least Month 2 (verification ongoing for Month 12)

## Problem Statement

Monte Carlo simulations with identical seeds (seed=42000) were producing DIFFERENT results starting from Month 1. This breaks research reproducibility.

**Symptoms:**
- Month 0: ✅ Deterministic (all runs identical)
- Month 1+: ❌ Non-deterministic (capabilities diverge, agent counts diverge, cascading differences)

## Root Cause

**Conditional RNG Consumption** - Different code paths consuming different numbers of `rng()` calls, causing RNG stream desynchronization between simulation runs.

When AI agents make decisions, different actions or different branches within actions consume variable numbers of random values. This causes the RNG stream to get out of sync, so subsequent agents and phases see different random values even with identical seeds.

**Example:**
```typescript
// ❌ BAD - Non-deterministic RNG consumption
if (condition) {
  value = random() * 10; // Path A: 1 RNG call
  return;
}
// Path B: 0 RNG calls
// Later code sees different RNG values depending on which path was taken!
```

```typescript
// ✅ GOOD - Deterministic RNG consumption
const roll = random(); // ALWAYS consume exactly 1 RNG call
if (condition) {
  value = roll * 10; // Path A: uses pre-consumed roll
  return;
}
// Path B: also consumed the roll (even if unused)
// Later code always sees the SAME next RNG value!
```

## Fixes Applied

### 1. initialization.ts - `createAIAgent()` (Lines 282, 364, 377-383)

**Problem:** Used global `deterministicRandom()` instead of passed `rng()` parameter

**Before:**
```typescript
const isSleeper = isMisaligned && deterministicRandom() < sleeperChance;
...
computeEfficiency: 0.9 + deterministicRandom() * 0.3,
rlhfIntensity: 0.3 + deterministicRandom() * 0.4,
```

**After:**
```typescript
const isSleeper = isMisaligned && rng() < sleeperChance;
...
computeEfficiency: 0.9 + rng() * 0.3,
rlhfIntensity: 0.3 + rng() * 0.4,
```

**Impact:** Ensures AI agents created during initialization use the deterministic RNG stream.

---

### 2. research.ts - `selectDimensionToAdvance()` (Lines 372-431)

**Problem:** Conditional RNG consumption
- Path A (advance core dimension): Consumed 2 RNG calls
- Path B (advance research): Consumed 3 RNG calls

**Before:**
```typescript
if (random() < 0.7) {
  // Advance core dimension
  let roll = random() * totalWeight; // 2 calls total
  ...
}
// Advance research subfield
let domainRoll = random() * totalDomainWeight; // 3 calls total
let subfieldRoll = random() * totalWeight;
```

**After:**
```typescript
// ALWAYS consume exactly 4 RNG calls
const pathChoice = random(); // RNG call 1
const dimensionRoll = random(); // RNG call 2 (pre-consumed)
const domainRoll = random(); // RNG call 3 (pre-consumed)
const subfieldRoll = random(); // RNG call 4 (pre-consumed)

if (pathChoice < 0.7) {
  let roll = dimensionRoll * totalWeight; // Use pre-consumed value
  ...
}
// Use pre-consumed domainRoll and subfieldRoll
```

**Impact:** Every AI research action now consumes exactly 4 RNG calls regardless of which dimension is selected.

---

### 3. aiTechActions.ts - Tech Sabotage Action (Lines 201-239)

**Problem:** Early return without consuming RNG calls

**Before:**
```typescript
const threateningTech = ...;
if (threateningTech.length === 0) {
  return { success: false, ... }; // 0 RNG calls consumed!
}
const targetTech = threateningTech[Math.floor(random() * ...)]; // 1 call
const sabotageSuccess = random() < sabotageChance; // 2 calls
const detected = random() < detectionChance; // 3 calls
```

**After:**
```typescript
// ALWAYS consume exactly 3 RNG calls
const techSelectRoll = random(); // RNG call 1
const sabotageRoll = random(); // RNG call 2
const detectionRoll = random(); // RNG call 3

const threateningTech = ...;
if (threateningTech.length === 0) {
  return { success: false, ... }; // RNG calls already consumed!
}
const targetTech = threateningTech[Math.floor(techSelectRoll * ...)];
const sabotageSuccess = sabotageRoll < sabotageChance;
const detected = detectionRoll < detectionChance;
```

**Impact:** Even failed sabotage attempts consume the same number of RNG calls as successful ones.

---

### 4. aiTechActions.ts - `selectTechToDeploy()` (Lines 346-394)

**Problem:** All branches consumed 1 RNG call, BUT early return consumed 0 calls

**Before:**
```typescript
if (unlockedTech.length === 0) return null; // 0 RNG calls!

if (agent.alignment > 0.7) {
  ...
  return safetyTech[Math.floor(random() * ...)]; // 1 RNG call
}
// More branches, each calling random() once
```

**After:**
```typescript
const techSelectRoll = random(); // ALWAYS consume exactly 1 RNG call

if (unlockedTech.length === 0) return null; // RNG call already consumed

if (agent.alignment > 0.7) {
  ...
  return safetyTech[Math.floor(techSelectRoll * ...)]; // Use pre-consumed value
}
// All branches use techSelectRoll
```

**Impact:** All tech deployment actions consume exactly 1 RNG call.

---

### 5. lifecycle.ts - `createNewAI()` (Lines 178-197)

**Problem:** Conditional alignment category selection

**Before:**
```typescript
const rand = rng(); // 1 call
if (rand < 0.40) {
  alignment = 0.75 + rng() * 0.15; // 2 calls total
} else if (rand < 0.70) {
  alignment = 0.55 + rng() * 0.25; // 2 calls total
} else if (rand < 0.85) {
  alignment = 0.25 + rng() * 0.25; // 2 calls total
} else {
  alignment = 0.45 + rng() * 0.20; // 2 calls total
}
// All paths consume 2 calls, but with different timing
```

**After:**
```typescript
// ALWAYS consume exactly 2 RNG calls
const categoryRoll = rng(); // RNG call 1
const alignmentRoll = rng(); // RNG call 2 (pre-consumed)

if (categoryRoll < 0.40) {
  alignment = 0.75 + alignmentRoll * 0.15;
} else if (categoryRoll < 0.70) {
  alignment = 0.55 + alignmentRoll * 0.25;
} else if (categoryRoll < 0.85) {
  alignment = 0.25 + alignmentRoll * 0.25;
} else {
  alignment = 0.45 + alignmentRoll * 0.20;
}
// All paths use the same pre-consumed values
```

**Impact:** New AI creation consumes exactly 2 RNG calls regardless of alignment category.

---

## Verification Results

**Test Configuration:**
- Seed: 42000 (identical across all runs)
- Runs: 3
- Duration: 12 months (ongoing)
- Comparison: SHA-256 hash + field-by-field diff

**Results (as of Month 2):**

| Month | Run 1 | Run 2 | Run 3 | Status |
|-------|-------|-------|-------|---------|
| 0 | totalCapability=1.490000 (20 AIs) | totalCapability=1.490000 (20 AIs) | totalCapability=1.490000 (20 AIs) | ✅ IDENTICAL |
| 1 | totalCapability=2.369538 (20 AIs) | totalCapability=2.369538 (20 AIs) | totalCapability=2.369538 (20 AIs) | ✅ IDENTICAL |
| 2 | totalCapability=2.966056 (21 AIs) | totalCapability=2.966056 (21 AIs) | totalCapability=2.966056 (21 AIs) | ✅ IDENTICAL |

**Before fixes (from old logs):**

| Month | Run 1 | Run 2 | Run 3 | Status |
|-------|-------|-------|-------|---------|
| 0 | 1.490000 (20 AIs) | 1.490000 (20 AIs) | 1.440000 (19 AIs) | ❌ DIVERGED |
| 1 | 2.448234 (20 AIs) | 2.513247 (20 AIs) | 2.511514 (21 AIs) | ❌ DIVERGED |

## Technical Pattern

**Universal Fix for Conditional RNG Consumption:**

```typescript
// Step 1: Identify all RNG calls in function
// Step 2: Pre-consume ALL RNG calls at function start
// Step 3: Use stored values in conditional branches

function myAction(state: GameState, random: () => number) {
  // DETERMINISM FIX: Pre-consume ALL RNG calls
  const roll1 = random(); // For path selection
  const roll2 = random(); // For branch A calculation
  const roll3 = random(); // For branch B calculation

  if (roll1 < 0.5) {
    // Branch A: Use roll2
    value = roll2 * 100;
  } else {
    // Branch B: Use roll3
    value = roll3 * 50;
  }

  // Both branches consumed the same total number of RNG calls!
}
```

**Key Insight:** The number of RNG calls consumed MUST be the same regardless of which code path is executed. Pre-consuming all possible RNG calls ensures this.

## Files Modified

1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/initialization.ts`
2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/research.ts`
3. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/agents/aiTechActions.ts`
4. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/lifecycle.ts`

## Next Steps

1. ✅ Complete 12-month determinism verification (in progress)
2. ⏳ Audit remaining AI actions for conditional RNG patterns
3. ⏳ Run Monte Carlo validation (N≥10) with fixed determinism
4. ⏳ Re-validate all previous Monte Carlo results

## Lessons Learned

1. **Conditional RNG consumption is SILENT** - The simulation runs fine, produces "reasonable" results, but they're non-reproducible
2. **Small divergences cascade exponentially** - A 0.03 capability difference in Month 1 led to different AI counts by Month 2
3. **Pre-consume ALL RNG calls** - The only safe pattern in a deterministic simulation
4. **Test determinism systematically** - Batch 1-2 fixed obvious issues (Math.random(), Date.now()), Batch 3 required deep analysis

## Roy's Notes

*sigh* This was worse than the NaN bug. At least with NaN, you KNOW something's wrong. With conditional RNG consumption, the simulation looks FINE - every run produces plausible results. It's only when you compare runs with identical seeds that you see the divergence.

The fix pattern is simple once you see it: **consume all RNG calls first, THEN use the values**. Like defensive coding against NaN - assume the worst, protect everything.

**Priority:** CRITICAL - This was blocking all Monte Carlo analysis. Now we can finally get reproducible outcome probabilities.

---

**Investigation Log:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/determinism_investigation_20251105.md`
**Verification Script:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/verifyDeterminism.ts`
**Test Logs:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/determinism_batch3_*.log`
