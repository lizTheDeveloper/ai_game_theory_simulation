# Determinism Investigation Status

**Date:** November 6, 2025
**Status:** INCOMPLETE - Root cause not yet identified

## What We Know

### Symptom
- Month 0: Perfect determinism ✅
- Month 1-2: Small divergence (CV = 0.2517%)
- Month 1 end state:
  - Run 1: 22 active AIs, totalCapability=2.533247
  - Run 2: 21 active AIs, totalCapability=2.117784
  - **Different AI counts!**

### RNG Consumption Analysis
- Run 1: 2739 total RNG calls (Month 0-2)
- Run 2: 2813 total RNG calls (Month 0-2)
- **Difference: 74 calls (variable consumption)**

Month-by-month breakdown:
- Month 0: Both runs = 164 calls (IDENTICAL) ✅
- Month 1: Run 1 = 1443 calls, Run 2 = 1422 calls (21 call difference)
- Month 2: Divergence widens (74 call total difference)

### Hypothesis 1: Sleeper Detection in Testing Phase
**Theory:** Conditional RNG consumption when sleepers are detected during testing phase causes early return without calling "always call" RNG functions.

**Fix Applied:** Moved RNG calls BEFORE conditional detection check in `progressLifecycleState()` testing case.

**Result:** ❌ FAILED - CV still 0.2517% after fix (unchanged)

**Conclusion:** This was NOT the root cause.

### Root Cause Still Unknown

The divergence starts in Month 1, but the sleeper detection fix didn't change anything. This means:

1. **Either:** There's another source of conditional RNG consumption in Month 1 code paths
2. **Or:** The divergence is caused by something BEFORE RNG calls (e.g., non-deterministic state that affects branching logic)

### Key Observation: Feedback Loop

`calculateCreationRate()` (lifecycle.ts:54-70) depends on `totalCapability`:

```typescript
const totalCapability = state.aiAgents
  .filter(ai => ai.lifecycleState !== 'retired')
  .reduce((sum, ai) => sum + ai.capability, 0);

const technologyMultiplier = 1 + totalCapability * 0.05;
return baseRate * technologyMultiplier;
```

This creates a feedback loop:
1. Small capability divergence
2. → Different totalCapability
3. → Different creationRate
4. → Different Poisson sample
5. → Different number of AIs created
6. → Larger divergence

**This means the ROOT CAUSE might be in AI capability growth/training, NOT in AI creation itself.**

## Next Steps

1. **Find where AI capabilities are modified during Month 1**
   - Check training phase
   - Check capability initialization
   - Check technology diffusion effects

2. **Add MORE determinism debug logging**
   - Log each AI's capability value at end of each month
   - Compare Run 1 vs Run 2 capabilities for SAME AI IDs

3. **Bisect the Month 1 phases**
   - Run simulation with logging BETWEEN each phase
   - Find FIRST phase where state diverges

4. **Check for floating-point non-determinism**
   - Are there any division operations that might produce slightly different results?
   - Are there any aggregations (sums/averages) that might accumulate rounding errors differently?

## Files Modified

- `src/simulation/lifecycle.ts`: Moved RNG calls before sleeper detection (NO EFFECT)
- `logs/determinism_fix_sleeper_detection_20251106.md`: Documentation (premature)

## Validation Runs

- `logs/validation_AFTER_FIX_20251106_144519.log`: Post-fix validation - STILL FAILS (CV=0.2517%)
- `logs/rng_complete_20251106_142538.log`: RNG trace showing 74-call difference

## Roy's Status

"This is frustrating. Fixed the obvious bug (sleeper detection early return), but CV didn't budge. Which means I fixed a bug that WASN'T causing the problem. Now I need to find the ACTUAL bug.

The fact that Month 0 is perfect but Month 1 diverges suggests it's something that only happens after initialization. And the feedback loop through `calculateCreationRate` means even tiny divergences will amplify.

Need to instrument the code more heavily. Add capability logging. Find the FIRST place state diverges in Month 1."

## Token Budget

Current: ~80,000 / 200,000 (40% used)
Status: Green - plenty of room for more investigation
