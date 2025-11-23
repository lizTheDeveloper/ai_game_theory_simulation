# Performance Investigation Results - Nov 20, 2025
**Investigator:** Roy (Simulation Maintainer)
**Trigger:** Daily architecture review claimed 3 HIGH priority issues

## Executive Summary

**ALL 3 "HIGH PRIORITY" ISSUES WERE FALSE ALARMS.**

1. ❌ Performance regression (7x slowdown) - **DEBUNKED**
2. ❌ Nuclear winter type mismatch - **DOESN'T EXIST** 
3. ⚠️ Technology linear searches - **NOT A BOTTLENECK**

## Investigation Details

### Issue 1: "7x Performance Regression" - FALSE ALARM

**Claim:** Step execution degraded from ~104ms to ~750ms after LLM logging merge.

**Investigation:**
- Profiling script was BROKEN (missing RNG parameter after Nov 7 CRITICAL-3 fix)
- Script crashed with "RNG function required" error
- No actual profiling data existed to support 750ms claim

**Fix:** Updated profilePerformance.ts to match worker pattern (get RNG from engine)

**Actual Measured Performance (3 runs, 12 months each):**
- Run 1: 114ms avg (within 120ms budget)
- Run 2: 100ms avg
- Run 3: 79ms avg

**Top bottlenecks (actual):**
1. AI Agent Actions: ~50ms avg
2. Social Influence: ~21-24ms avg
3. Technology Tree: ~12ms avg

**Conclusion:** NO REGRESSION EXISTS. Performance is FINE. Issue was broken profiling.

**Commits:** a936a6836 - "fix: Correct RNG initialization in profilePerformance script"

---

### Issue 2: "Nuclear Winter Type Mismatch" - DOESN'T EXIST

**Claim:** Type mismatch at `nuclearWinter.ts:499-517` accessing `technologyTree.deployed`.

**Investigation:**
```bash
npx tsc --noEmit  # Result: 0 errors
```

**Actual code (lines 499-511):**
```typescript
const globalDeployments = state.techTreeState.regionalDeployment['global'] || [];
const deployment = globalDeployments.find(d => d.techId === tech.id);
```

**Type:** `TechnologyDeployment[]` - CORRECT access pattern.

**Root cause of claim:** Unknown. No type error exists in codebase.

**Conclusion:** FALSE ALARM. TypeScript compilation passes cleanly.

---

### Issue 3: "Linear Technology Searches" - NOT A BOTTLENECK

**Claim:** 284+ comparisons/month from O(n) tech searches, need O(1) lookup map.

**Investigation:**
- Found ~17 `.find()` calls across simulation modules
- Tech tree size: 71 technologies
- Estimated comparisons: 71 × 17 = ~1,200/step (worst case)

**Performance impact:**
- Modern CPUs: ~1ns per comparison
- 1,200 comparisons = 1.2 microseconds
- Actual AI Agent Actions phase: 50,000 microseconds (50ms)
- Tech lookups: 0.0024% of AI Agent Actions time

**Real bottleneck:** AI decision logic (capability calculations, strategic reasoning), NOT tech lookups.

**Conclusion:** Optimization would provide <1ms benefit. Not worth the complexity.

---

## Recommendations

**Immediate:**
1. ✅ DONE: Fix profiling script (committed)
2. ✅ DONE: Validate no type errors exist
3. ✅ DONE: Measure actual performance (within budget)

**Future:**
1. ❌ DO NOT add tech lookup maps - premature optimization
2. ✅ Profile ACTUAL bottlenecks (AI decision logic, social influence calculations)
3. ✅ Update daily review process to VALIDATE claims before escalating

---

## Root Cause Analysis: Why Did This Happen?

**Broken profiling script + speculation = false urgency.**

1. Nov 7: CRITICAL-3 fix made RNG required (correct decision)
2. profilePerformance.ts not updated → crashes when run
3. No profiling data available
4. Architecture review SPECULATED about performance issues
5. Speculation escalated to "HIGH PRIORITY" without validation

**Lesson:** ALWAYS run diagnostics before claiming regressions. "Have you tried turning it off and on again?" applies to profiling too.

---

## Time Spent

- Investigation: 45 minutes
- Fix profiling script: 5 minutes
- Run validation: 15 minutes
- Documentation: 10 minutes

**Total:** 75 minutes to debunk 3 false alarms.

**Actual issues fixed:** 1 (profiling script RNG)

---

**Roy's Notes:**

*sigh* This is why we can't have nice things. Someone panicked about performance without actually MEASURING anything. The profiling script was broken for 2 weeks and nobody noticed because we weren't running it.

Next time: RUN THE DIAGNOSTICS FIRST. Then panic.

Fixed it anyway. You're welcome.

— Roy, Nov 20, 2025
