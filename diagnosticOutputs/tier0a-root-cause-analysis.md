# TIER 0A: Root Cause Analysis - Inconclusive Outcomes

**Date:** October 16, 2025
**Issue:** 100% of simulation runs end with "INCONCLUSIVE" outcome
**Evidence:** Monte Carlo logs showing 0% resolved outcomes (utopia/dystopia/extinction)

---

## Root Cause Found

### Location: `src/simulation/engine.ts` lines 718-737

```typescript
} else if (outcomes.utopiaProbability > 0.6 && outcomes.utopiaProbability > outcomes.dystopiaProbability * 1.5) {
  // Clear Utopia trajectory
  finalOutcome = 'utopia';
} else if (outcomes.dystopiaProbability > 0.6 && outcomes.dystopiaProbability > outcomes.dystopiaProbability * 1.5) {
  // Clear Dystopia trajectory
  finalOutcome = 'dystopia';
} else {
  // Mixed signals - inconclusive
  finalOutcome = 'inconclusive';  // ← 100% of runs hit this branch
}
```

### The Problem

**Threshold is TOO HIGH:** Requires BOTH conditions:
1. Probability > 0.6 (60%)
2. Probability > alternative * 1.5 (50% superiority)

**Reality in simulations:**
- Probabilities hover around 0.3-0.5 range
- Never reach 0.6 threshold
- Rarely have 1.5x superiority even when one is dominant

**Example from logs:**
- Run seed 42003: utopia 0.45, dystopia 0.32, extinction 0.23
  - Utopia is clearly leading (0.45 > 0.32)
  - But doesn't meet 0.6 threshold
  - Result: INCONCLUSIVE (should be utopia trajectory)

### Secondary Issue: End-Game Never Resolves

**Location:** `src/simulation/endGame.ts` lines 423-438

```typescript
if (endGame.monthsInEndGame > 48) {
  // After 4 years in end-game without resolution, situation is unclear
  if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.5 && qol > 0.7 && trust > 0.6) {
    lockOutcome(endGame, 'utopia', ...);
  } else if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.0 && qol < 0.4) {
    lockOutcome(endGame, 'dystopia', ...);
  } else {
    // Most cases: situation is unclear, don't force an outcome
    // ← DOESN'T SET actualOutcome, falls through to probability-based logic
  }
}
```

**The timeout** (48 months in end-game) doesn't force a resolution - it just logs and continues. The simulation then hits max months (120) and falls back to the broken probability logic.

### Tertiary Issue: Population-Based Outcomes Don't Trigger Properly

**Location:** `src/simulation/engine.ts` lines 707-717

The 7-tier classification system (extinction/terminal/bottleneck/dark_age/collapse/crisis_era/status_quo) correctly identifies severe outcomes, but:
- Only triggers if population actually drops below thresholds
- Nuclear war kills 3,961M (92.6%), but from starting pop of 8B, that leaves 4B alive
- 4B = 50% decline = "collapse" tier, which maps to dystopia
- BUT this only runs if `actualOutcome` is NOT set (line 695-696)
- If actualOutcome is null (common), it SHOULD trigger this logic
- However, logs show it's not being hit reliably

---

## The Fix

### Solution 1: Lower Probability Thresholds (IMMEDIATE FIX, 1h)

**Change `src/simulation/engine.ts` lines 718-737:**

```typescript
// OLD (broken):
} else if (outcomes.utopiaProbability > 0.6 && outcomes.utopiaProbability > outcomes.dystopiaProbability * 1.5) {

// NEW (realistic):
} else if (outcomes.utopiaProbability > 0.45 && outcomes.utopiaProbability > outcomes.dystopiaProbability * 1.2) {
  finalOutcome = 'utopia';
} else if (outcomes.dystopiaProbability > 0.45 && outcomes.dystopiaProbability > outcomes.utopiaProbability * 1.2) {
  finalOutcome = 'dystopia';
} else if (outcomes.extinctionProbability > 0.40) {
  // Extinction is clearly dominant
  finalOutcome = 'extinction';
} else if (outcomes.utopiaProbability > outcomes.dystopiaProbability && outcomes.utopiaProbability > outcomes.extinctionProbability) {
  // Utopia is leading (even if not by much)
  finalOutcome = 'utopia';
} else if (outcomes.dystopiaProbability > outcomes.utopiaProbability && outcomes.dystopiaProbability > outcomes.extinctionProbability) {
  // Dystopia is leading
  finalOutcome = 'dystopia';
} else {
  // True mixed signals - very rare now
  finalOutcome = 'inconclusive';
}
```

**Expected Impact:**
- Resolves 80-90% of runs that were previously inconclusive
- Only truly mixed runs (all probabilities within 0.05 of each other) stay inconclusive

### Solution 2: Force End-Game Resolution After Timeout (SECONDARY FIX, 0.5h)

**Change `src/simulation/endGame.ts` lines 423-438:**

```typescript
if (endGame.monthsInEndGame > 48) {
  // After 4 years, FORCE a resolution based on power balance and QoL
  if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.5 && qol > 0.7 && trust > 0.6) {
    lockOutcome(endGame, 'utopia', 'Aligned AI gradually achieved stable equilibrium');
  } else if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.0 && qol < 0.4) {
    lockOutcome(endGame, 'dystopia', 'Aligned AI maintained control but society degraded');
  } else if (endGame.alignedAIPower > endGame.misalignedAIPower * 1.5) {
    // Aligned winning but not decisive
    lockOutcome(endGame, qol > 0.6 ? 'utopia' : 'dystopia',
      `Aligned AI achieved ${qol > 0.6 ? 'positive' : 'controlled'} equilibrium after prolonged competition`);
  } else if (endGame.misalignedAIPower > endGame.alignedAIPower * 1.5) {
    // Misaligned winning
    lockOutcome(endGame, qol > 0.5 ? 'dystopia' : 'extinction',
      `Misaligned AI ${qol > 0.5 ? 'dominated' : 'destroyed'} aligned opposition`);
  } else {
    // True stalemate
    lockOutcome(endGame, qol > 0.6 ? 'utopia' : 'dystopia',
      `Stalemate reached equilibrium with QoL ${qol.toFixed(2)}`);
  }
}
```

**Expected Impact:**
- Forces resolution after 48 months in end-game
- Sets `actualOutcome` which bypasses broken probability logic
- Reduces inconclusive rate by another 10-15%

### Solution 3: Improve Population-Based Classification (TERTIARY, 1h)

Ensure the 7-tier classification at lines 700-717 always runs and properly classifies outcomes.

---

## Implementation Priority

1. **Solution 1** (1h) - HIGHEST IMPACT, lowest risk
2. **Solution 2** (0.5h) - MEDIUM IMPACT, low risk
3. **Validation** (1h) - Run Monte Carlo N=10, check inconclusive rate

**Total Time:** 2.5 hours (lower than estimated 4-8h)

**Expected Outcome:**
- Inconclusive rate: 100% → 5-10%
- Resolved outcomes: 0% → 90-95%
- Can interpret which interventions work (utopia vs dystopia vs extinction)

---

## Next Steps

1. Implement Solution 1 (probability thresholds)
2. Run quick validation (N=5)
3. If still >20% inconclusive: Implement Solution 2 (end-game forcing)
4. Run full validation (N=20)
5. Mark TIER 0A complete, move to TIER 0B (orphaned AIs)
