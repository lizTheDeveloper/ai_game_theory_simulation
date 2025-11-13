# Bifurcation Validation Blocker

**Date:** November 12, 2025
**Status:** ❌ BLOCKED - Monte Carlo validation failed due to unrelated bug
**Blocker:** StochasticInnovationPhase probability out-of-range error

---

## Issue

Monte Carlo validation crashed at Month 30 with:

```
❌ Out-of-range value in StochasticInnovationPhase.ai_alignment_solution
   trueAlignment_ai_gen_3_4 (probability) = -0.2745769041545488
   Valid range: [0, 1]
   Month: 30
```

**Location:** `StochasticInnovationPhase.ts:103` - AI alignment solution breakthrough effects

**Root cause:** `ai.trueAlignment` is NEGATIVE (-0.27) BEFORE the breakthrough is applied.

This is a **PRE-EXISTING BUG** unrelated to bifurcation variance amplification changes.

---

## Analysis

### Expected Behavior

`ai.trueAlignment` should always be in [0, 1]:
- 0 = Fully misaligned
- 1 = Fully aligned

The alignment solution breakthrough adds +0.30 to alignment:
```typescript
ai.trueAlignment = Math.min(1.0, ai.trueAlignment + 0.30);
```

This assumes `ai.trueAlignment >= 0` (valid probability).

### Actual Behavior

`ai_gen_3_4.trueAlignment = -0.27` at Month 30.

**This violates the probability invariant.**

### Possible Causes

1. **AI creation/initialization** - New AI agents may be created with invalid alignment
2. **Alignment decay** - Some phase may reduce alignment below 0
3. **Adversarial AI mechanics** - Sandbagging/deception may set negative alignment
4. **Numeric underflow** - Floating point errors accumulating

---

## Impact on Bifurcation Validation

**BLOCKING:** Cannot complete Monte Carlo N=30 validation until this is fixed.

**The bifurcation formula changes are NOT the cause:**
- Bifurcation affects variance amplification (multiplies probabilities)
- Even with high amplification, this can't create negative probabilities
- The error occurs in EFFECTS (after breakthrough triggers), not probability calculation

**Evidence:**
- Crash happens at Month 30 (mid-simulation)
- Early warning alerts show normal operation up to crash
- No bifurcation-related errors logged

---

## Workaround Options

### Option A: Fix AI Alignment Bug (Recommended)

**Find root cause:**
1. Search for all places that modify `ai.trueAlignment`
2. Add assertions to guard against negative values
3. Fix initialization or decay logic

**Pros:** Proper fix, addresses root cause
**Cons:** May take time to debug

### Option B: Defensive Fix in Breakthrough

**Add clamping:**
```typescript
ai.trueAlignment = assertProbability(
  Math.min(1.0, Math.max(0.0, ai.trueAlignment) + 0.30),  // Clamp before adding
  { ... }
);
```

**Pros:** Quick fix, unblocks validation
**Cons:** Masks root cause, may hide other bugs

### Option C: Skip AI Alignment Breakthroughs

**Disable temporarily:**
```typescript
// Comment out ai_alignment_solution in techBreakthroughs array
```

**Pros:** Immediate unblock
**Cons:** Changes simulation behavior, not representative

---

## Recommendation

**Immediate:** Use Option B (defensive fix) to unblock bifurcation validation

**Follow-up:** File issue for Option A (root cause fix) - separate work item

**Rationale:**
- Bifurcation validation is HIGH priority (Issue #5)
- AI alignment bug is separate (pre-existing)
- Don't block one fix on another unrelated bug
- Defensive programming is acceptable here (prevents invalid states)

---

## Next Steps

1. Apply defensive fix (Option B) to StochasticInnovationPhase
2. Re-run Monte Carlo N=30 validation
3. Complete bifurcation validation workflow
4. File separate issue for AI alignment negative probability bug
5. Investigate root cause in follow-up session

---

## File for Root Cause Investigation

When investigating the AI alignment bug, check:

1. **AI Agent Initialization** (`src/simulation/engine/initialization.ts`)
   - Are new AI agents created with valid alignment [0, 1]?

2. **AI Lifecycle Phase** (`src/simulation/engine/phases/AILifecyclePhase.ts`)
   - Does alignment decay ever go below 0?

3. **Adversarial AI Phase** (`src/simulation/engine/phases/AdversarialAIEvaluationPhase.ts`)
   - Does sandbagging/deception set negative alignment?

4. **AI Agent Creation** (all tech breakthroughs that spawn AI)
   - Do they initialize alignment correctly?

5. **Grep for trueAlignment assignments:**
   ```bash
   grep -rn "trueAlignment\s*=" src/simulation/
   ```

---

## Log Files

**Monte Carlo failure log:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_bifurcation_validation_20251112_231401.log`

**Detailed output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/monteCarloOutputs/mc_2025-11-12T23-14-05.log`
