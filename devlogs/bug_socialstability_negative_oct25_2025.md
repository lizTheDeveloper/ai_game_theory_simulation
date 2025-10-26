# BUG: socialStability Going Negative - Investigation

**Date:** October 25, 2025, 6:45 PM
**Status:** 🔍 Root Cause Investigation In Progress
**Severity:** HIGH - Assertion correctly catching invalid state

## Symptom

Monte Carlo validation fails at Month 0 with:

```
❌ ERROR in phase "Workflow Adaptation Update" (workflow-adaptation):
Error: ❌ Out-of-range value in updateWorkflowAdaptation
   globalMetrics.socialStability (probability) = -0.026200000000000015
   Valid range: [0, 1]
   Month: 0
```

## Good News

✅ **The assertion system is working exactly as designed!**

The `assertProbability()` call in `workflowAdaptation.ts:99` correctly caught an invalid value that would have silently propagated through the simulation before the defensive coding elimination work.

## Investigation

### Sequence of Events (Month 0)

```
1. refugeeCrises phase:     socialStability = 0.075 → 0.075 ✅
2. trappedPopulations phase: socialStability = 0.075 → 0.074 ✅
3. ??? (20x BEHAVIORAL DETECTION logs)
4. workflowAdaptation phase: socialStability = -0.0262 ❌
```

### What We Know

1. **Both refugee phases use proper clamping:**
   - `refugeeCrises.ts:276`: `Math.max(0, rawResult)`
   - `trappedPopulations.ts:143`: `Math.max(0, rawResult2)`

2. **Behavioral detection doesn't modify socialStability:**
   - Checked `behavioralDetection.ts` - no global metrics modification
   - Checked `benchmark.ts` - no socialStability references
   - Checked `ensembleDetection.ts` - no socialStability references

3. **The value goes negative BETWEEN trapped populations and workflow adaptation**
   - Value after trappedPopulations: `0.074`
   - Value in workflowAdaptation: `-0.026`
   - **Delta: -0.100** (suspiciously round number!)

### Hypotheses

**Hypothesis 1: Hidden phase between trapped and workflow**
- The 20 BEHAVIORAL DETECTION logs suggest something running 20 times (once per AI)
- But we can't find where socialStability is being modified

**Hypothesis 2: Multiplicative bug in behavioral detection**
- Maybe it's multiplying by a factor that makes it go negative?
- But we checked the code - no socialStability access

**Hypothesis 3: Phase ordering issue**
- Maybe a phase runs that we're not seeing in logs?
- Need to check PhaseOrchestrator execution order

**Hypothesis 4: Parallel/async issue**
- Could multiple phases be racing?
- Unlikely since simulation is single-threaded

**Hypothesis 5: Something in month 0 initialization**
- Maybe initial value is wrong?
- But logs show it starts at 0.075 (correct)

### Next Steps

1. ✅ Add debug logging in all phases between trapped and workflow
2. ⏳ Check PhaseOrchestrator phase order
3. ⏳ Add debug log BEFORE and AFTER behavioral detection runs
4. ⏳ Check if there's a "trust dynamics" or other phase modifying it
5. ⏳ Search for ALL modifications to socialStability in entire codebase

### Files Involved

- `src/simulation/workflowAdaptation.ts:99` - Where error is detected
- `src/simulation/refugeeCrises.ts:273-278` - Sets to 0.075
- `src/simulation/trappedPopulations.ts:140-145` - Sets to 0.074
- `src/simulation/behavioralDetection.ts` - Runs 20 times between
- `src/simulation/engine/PhaseOrchestrator.ts` - Phase execution order

## Impact

**POSITIVE:** This bug would have been INVISIBLE before the defensive coding elimination work. Now it's caught immediately with:
- Exact value that failed (-0.0262)
- Exact location (workflowAdaptation)
- Exact month (0)
- Full stack trace

This is exactly what fail-fast assertions are designed to do!

**NEXT:** Find the root cause and fix the initialization/calculation bug.

---

**Related:**
- Defensive Coding Roadmap: `plans/defensive-coding-elimination-roadmap.md`
- Batch 2 Complete: `devlogs/defensive_fallbacks_batch2_oct25_2025.md`
- Original FIX #25: `devlogs/fix_25_tech_tree_ai_capability_oct25_2025.md`
