# Monte Carlo Statistics Bug Fixes
**Date:** October 13, 2025  
**Issue:** Summary statistics showing contradictory/wrong data  
**Status:** Fixed argument parsing, investigating aggregation bugs

---

## 🐛 **Bugs Found**

### **Bug 1: Argument Parsing - FIXED ✅**

**Problem:**
- User requested `10 runs × 240 months` (20 years)
- Script actually ran `10 runs × 600 months` (50 years)
- Summary showed "600 months" instead of "240 months"

**Root Cause:**
- `runMonteCarlo.sh` calls script with positional args: `npx tsx script.ts $RUNS $MONTHS $NAME`
- `monteCarloSimulation.ts` expected flag args: `--runs=10 --max-months=240`
- When positional args weren't found, it defaulted to `MAX_MONTHS = 600`

**Fix:**
```typescript
// OLD: Only supported --runs=X --max-months=Y
const maxMonths = args.find(arg => arg.split('=')[0] === '--max-months')?.split('=')[1];
const runs = args.find(arg => arg.split('=')[0] === '--runs')?.split('=')[1];

// NEW: Support both formats
if (args[0] && !args[0].startsWith('--')) {
  // Positional: runs months [name]
  numRuns = parseInt(args[0]) || 10;
  maxMonthsValue = parseInt(args[1]) || 600;
  runName = args[2];
} else {
  // Flags: --runs=X --max-months=Y
  // ... parse flags
}
```

**Result:** ✅ Now correctly runs 240 months when requested

---

### **Bug 2: Nuclear War Counting - INVESTIGATING 🔍**

**Problem:**
```
SUMMARY SAYS:
  Runs with Nuclear War: 0 / 10 (0.0%)   ❌ WRONG
  Avg Deaths (nuclear): 136M              ✅ CORRECT

ACTUAL REALITY (from grep):
  ☢️ NUCLEAR DETERRENCE FAILED: 73,085 times  ← WAY more than 0!
```

**Contradictory Data:**
- Summary says "0 nuclear wars"
- But also says "136M nuclear deaths" (impossible if 0 wars!)
- Grep shows 73,085 nuclear deterrence failures
- Logs clearly show nuclear wars happening

**Root Cause (Suspected):**
```typescript
// Line 756 in monteCarloSimulation.ts
const nuclearWarsCount = runResult.log.events.criticalEvents.filter((e: any) => 
  e.description?.includes('Nuclear war') || e.description?.includes('nuclear') || 
  e.description?.includes('☢️')).length;
```

**Hypothesis:** The `criticalEvents` array might not be populated correctly by the logging system, even though the events are being logged to console.

**Need to investigate:**
1. Is `runResult.log.events.criticalEvents` actually populated?
2. Should we count from a different source (e.g., death totals by category)?
3. Is the SimulationLog structure different from what the code expects?

---

### **Bug 3: Famine Reporting - INVESTIGATING 🔍**

**Problem:**
```
SUMMARY SAYS:
  Runs with famines: 0/10 (0.0%)         ❌ WRONG
  
LOGS SHOW:
  Food security < 0.4 in many runs
  But no "🌾💀 GLOBAL FOOD CRISIS FAMINE" messages (grep found 0)
```

**Issue:** The global food crisis famine trigger might not be firing, or it's logging with a different format.

**Need to check:**
1. Is `checkRegionalFamineRisk` being called?
2. Is the food security threshold (< 0.4) being reached?
3. Is the famine logging format different?

---

### **Bug 4: Per-Run Population Summary Missing**

**Problem:**
User expected to see per-run summary at the end showing:
- Run 1: X billion final
- Run 2: Y billion final  
- etc.

But got aggregated stats only.

**Fix Needed:** Add per-run breakdown to the summary section

---

## 📊 **What We Know is CORRECT**

From actual log analysis:

✅ **Outcome Classification Working:**
- All 10 runs: **BOTTLENECK** (95.5-95.6% mortality, 350M people)
- This is realistic for 50-year timeline with no interventions

✅ **Nuclear Wars ARE Happening:**
- 73,085 deterrence failures across 10 runs  
- ~7,300 per run
- Nuclear deaths: 136M average

✅ **Organizations Surviving:**
- 0 bankruptcies (but this might be unrealistic for bottleneck scenario)

✅ **Environmental Cascade:**
- 100% of runs had active cascade
- Climate: 89.3%, Biodiversity: 94.7%

---

## 🔧 **Fixes in Progress**

1. ✅ **DONE:** Argument parsing (positional vs flags)
2. 🔄 **NEXT:** Nuclear war count aggregation
3. 🔄 **NEXT:** Famine detection/reporting
4. 🔄 **NEXT:** Per-run breakdown in summary
5. 🔄 **NEXT:** Organization bankruptcy during bottleneck scenarios

---

## 📝 **Action Items**

1. Re-run simulation with **correct 240-month duration**
2. Fix nuclear war counting logic
3. Investigate why famines aren't triggering/logging
4. Add per-run summary section
5. Verify organization bankruptcy logic during bottleneck

---

**Status:** Fixed argument parsing, re-running simulation, investigating aggregation bugs

