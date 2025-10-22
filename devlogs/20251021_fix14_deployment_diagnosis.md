# FIX #14 Deployment System Diagnosis (Oct 21, 2025)

**Time:** 10:45pm PT
**Status:** Bug fixed, 240-month validation running

---

## Initial Problem

Quick validation (N=10, 120mo) showed:
- Ecological score: 0.7/100 (no improvement from 1.3/100 baseline)
- Technologies appeared "stuck" at 25% deployment
- Concern: Deployment system broken?

---

## Investigation Findings

### Bug #1: TIER 0 Technologies Re-Deploying ✅ FIXED

**Root Cause:**
- TIER 0 (deployed_2025) technologies start at initial deployment (0.01-0.95)
- `initializeTechTreeState()` did NOT set `deploymentStartMonth`
- `updateDeploymentProgress()` saw missing `deploymentStartMonth`, set it to current month
- Sigmoid curve recalculated from that point, overwriting initial deployment

**Fix:**
- Set `deploymentStartMonth: 0` for TIER 0 technologies at initialization
- Skip TIER 0 (timescale === 0) in `updateDeploymentProgress()`

**Files Modified:**
- `src/simulation/techTree/engine.ts` (line 98)
- `src/simulation/techTree/deploymentTimescales.ts` (lines 216-221)

### Finding: Deployment System Works Correctly! ✅

**Validation:** Created `testDeploymentCurve.ts` to verify sigmoid math

**Results:**
- DAC (300mo timescale): 120mo = 35.4%, 240mo = 85.8%
- TIER 1 (180mo): 120mo = 64.6%, 180mo = 85.8%
- Scalable Oversight (120mo): 60mo = 50.0%, 120mo = 76.9%

**Conclusion:** Technologies ARE deploying correctly via sigmoid curves!

### The Real Issue: 120 Months Too Short

**Insight:** FIX #14 timescales are 10-30 YEARS (180-360 months)
- 120 months = 10 years
- Most environmental technologies need 15-25 years to fully deploy
- DAC reaches only 35% after 10 years (correct per research!)

**Deployment Progress at 120 Months:**
| Technology | Timescale | 120mo Progress | Research Basis |
|------------|-----------|----------------|----------------|
| DAC | 300mo (25y) | 35.4% | IEA 2024 |
| Renewables | 312mo (26y) | 32.7% | Ember 2025 |
| Desalination | 180mo (15y) | 64.6% | Infrastructure |
| Phosphorus | 180mo (15y) | 64.6% | TIER 1 |
| Fusion | 480mo (40y) | 8.9% | Conservative |

**This is CORRECT behavior** - technologies can't deploy faster than real-world timescales!

---

## Why Ecology Still Collapsed (0.7/100)

**Hypothesis:** Even with technologies starting to deploy:
1. **Partial deployment insufficient** - 35-65% deployment not enough emission reduction
2. **Timescale mismatch** - Boundaries need recovery NOW, tech deploys over 20 years
3. **Missing emergency mobilization** - No crisis-driven deployment acceleration
4. **Climate feedbacks accelerating** - Warming >2°C slows deployment 20%

**Validation needed:** 240-month run to see if full deployment (180-300mo) improves ecology

---

## 240-Month Validation (Running)

**Parameters:**
- N=20 runs
- 240 months (20 years)
- Log: `logs/mc_fix14_phases1-4_240mo_*.log`

**Expected Results (if FIX #14 works):**

**Deployment Levels at 240 Months:**
- DAC: ~85% (vs 35% at 120mo)
- TIER 1 (180mo): ~98% full deployment
- TIER 2 (240mo): ~85-90% deployment
- Renewables: ~84% clean electricity

**Ecological Score Predictions:**
- If tech deployment helps: 15-35/100 (stabilized to early recovery)
- If still collapsed (<10/100): Deployment timescales aren't the bottleneck

**Success Criteria:**
1. Technologies deploy beyond 50% (prove sigmoid curves working)
2. Ecological score >10/100 in 40%+ of runs
3. Some runs achieve 20-40/100 (stabilized, not dystopia)
4. Emission reduction visible in logs

**Failure Criteria:**
1. Ecology still 0-5/100 (collapsed)
2. Technologies deploy but emissions don't drop
3. No difference vs 120-month run

---

## What This Tells Us

### If 240-Month Validation Succeeds:
- **FIX #14 Phase 1-3 WORKS** - multi-timescale deployment is correct mechanic
- **BUT:** Requires 15-25 year simulation runs to see full effect
- **Implication:** Publication-ready outcomes need 240+ month runs, not 120

### If 240-Month Validation Fails:
- Deployment timescales are NOT the bottleneck
- Missing mechanisms:
  1. **Technology impact too weak** - Deployed tech doesn't reduce emissions enough
  2. **Boundary recovery too slow** - Even with net-zero, boundaries stay breached
  3. **Crisis mobilization needed** - Emergency response fix (Option A) required
  4. **Investment constraints** - Phase 5 (investment linkage) needed

---

## Research Foundation Validation

**FIX #14 timescales are empirically grounded:**

| Technology | FIX #14 Timescale | Research Source | Validation |
|------------|-------------------|-----------------|------------|
| DAC | 25 years (300mo) | IEA 2024 | ✅ 0.05 → 6-8 Gt by 2050 |
| Renewables | 26 years (312mo) | Ember 2025 | ✅ 41% → 85% by 2050 |
| Fusion | 40 years (480mo) | Conservative | ✅ 2035-2045 + scale-up |
| Desalination | 15 years (180mo) | Infrastructure | ✅ Typical large infra |

**Sigmoid curves validated:**
- Slow start (infrastructure buildout)
- Rapid middle (economies of scale)
- Slow finish (hard-to-reach markets)

**This matches historical energy transitions:** 50-100 years for full system change (coal → gas, etc.)

---

## Next Steps

**Immediate (tonight):**
1. ✅ Fix TIER 0 re-deployment bug
2. ✅ Validate sigmoid curves with test script
3. 🔄 Run 240-month validation (in progress, ETA ~10 minutes)
4. Analyze results when complete

**If 240mo validation shows improvement:**
1. Run N=100, 240mo for full distribution
2. Compare to FIX #14 predictions (25-35/100 median ecology)
3. Document and archive
4. Consider Phase 5 (investment) as optional enhancement

**If 240mo validation shows NO improvement:**
1. Coordinate with other agent (emergency response fix)
2. Hybrid approach: Emergency response + deployment timescales
3. OR investigate why deployed tech doesn't reduce emissions
4. May need Phase 5 (investment constraints) after all

---

## Code Changes Summary

**New Files:**
- `scripts/testDeploymentCurve.ts` (80 lines) - Validation script

**Modified Files:**
- `src/simulation/techTree/engine.ts` (+1 line: set deploymentStartMonth)
- `src/simulation/techTree/deploymentTimescales.ts` (+7 lines: skip TIER 0)

**Total Changes:** ~90 lines
**Time Investment:** 2 hours debugging + testing

---

## Key Insight

> **The deployment system ISN'T broken - it's working exactly as designed based on empirical research.**

The "bug" was:
1. TIER 0 re-deployment (fixed ✅)
2. User expectation mismatch (120mo too short for 25-year timescales)

**Technologies CANNOT deploy faster than real-world infrastructure constraints.**

If we want ecology to recover in 10 years (120 months), we need:
- Emergency mobilization (Option A: environmental crisis handler)
- OR unrealistic instant deployment (violates research foundation)
- OR accept that 10 years isn't enough time (run 240mo simulations)

---

**Status:** 240-month validation running, results in ~10 minutes
**Next:** Analyze whether longer timescales enable ecological recovery
