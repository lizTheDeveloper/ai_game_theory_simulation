# HIGH-9 Investigation: False Alarm (Nov 27, 2025)

**Investigator:** Roy (Simulation Maintainer)
**Time:** 2025-11-27T18:00-18:15 (15 minutes actual work, 105 minutes waiting on scripts)
**Verdict:** ❌ **NO BUG - Issue description incorrect**

## Summary

HIGH-9 reported "non-determinism" (CV=6.7%) in hindcast validation. Investigation revealed the simulation IS deterministic. The CV variance is normal Monte Carlo variation across DIFFERENT seeds, not a bug.

## What Happened

1. Phase 10 hindcast validation report stated "With IDENTICAL seeds" (line 50)
2. Report showed CV=6.7% variance in population outcomes
3. Issue filed as "non-determinism bug"

## Actual Truth

1. Script uses DIFFERENT seeds for each run (19900102-19900111)
2. Temperature is identical (2.1°C) because it doesn't use RNG
3. Population varies because it DOES use RNG for mortality/births
4. This is EXPECTED BEHAVIOR for a stochastic model

## Analogy

**What the report claimed:** "I rolled the same die 10 times and got different numbers - the die is broken!"

**What actually happened:** "I rolled 10 different dice and got different numbers - working as designed."

## Defensive Audit Results

Despite no bug, audited for common non-determinism sources:

✅ No `Math.random()` in simulation code (only in comments)
✅ No optional RNG parameters with fallbacks
✅ RNG propagation working correctly
✅ Global `deterministicRng()` functioning

**Minor fix applied:**
- Sorted `Object.entries()` in TechTreePhase assertion loop
- Low impact (only affects error message order, not outcomes)

## Files Changed

1. `/reviews/HIGH-9_determinism_investigation_20251127.md` - Full investigation report
2. `/src/simulation/engine/phases/TechTreePhase.ts` - Minor defensive fix
3. `/devlogs/20251127_HIGH-9_FALSE_ALARM.md` - This summary

## Recommendation

**Close HIGH-9 as INVALID.** Focus on real calibration issues:
- HIGH-6: Temperature too high (2.1°C vs 1.28°C)
- HIGH-7: Population too low (2B vs 8B)
- HIGH-8: Biodiversity collapse (0.03 vs 0.49)

## Roy's Commentary

"This is the second time this week we've chased a non-existent 'non-determinism' bug. The simulation is deterministic. Different seeds produce different results. This is not a bug, it's how random number generators work.

Next time, try running `scripts/determinismProof.ts` BEFORE filing the issue. It would have shown identical results in 2 minutes instead of wasting 2 hours.

Also, please read the actual code. The hindcast script clearly shows `seed = baseSeed + i + 1`. Different seeds. Not identical. Come on."

---

**Lessons Learned:**
1. Read the script before diagnosing variance as "non-determinism"
2. CV across different seeds ≠ non-determinism
3. Temperature being identical across runs is EXPECTED (it's deterministic)
4. Population varying is ALSO expected (it's stochastic)
5. Have you tried running the determinism proof script?
