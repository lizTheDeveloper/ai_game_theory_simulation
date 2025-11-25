# Tech Ineffectiveness Investigation - Executive Summary

**Date:** November 25, 2025
**Status:** Phase 1 Complete (Code Trace)
**Investigator:** Orchestrator

---

## Problem Statement

119 sequenced technologies failed to prevent 99% mortality in governance experiments (60/60 runs crashed). This is blocking ALL governance research.

---

## Root Cause Found

**Technologies ARE being deployed and effects ARE being applied correctly.**

**HOWEVER:** The effects engine contains 5 research-backed "gating multipliers" that reduce tech effectiveness by 6-9 orders of magnitude:

1. **Regulation multiplier (0.01-1.0):** Cleanup tech is 1% effective without prevention tech deployed
2. **Energy constraint (0.0-1.0):** Insufficient renewable surplus limits operation
3. **Concentration penalty (0.001-1.0):** Environmental dilution makes cleanup 0.1% effective
4. **Time lag (0.0-1.0):** 10-30 year ramp-up to full effectiveness
5. **Rebound effect (0.3-1.0):** Cleanup enables increased production (Jevons paradox)

**Combined impact:** A cleanup tech deployed at month 12 has **0.0000002% effectiveness** (would take 355 million years to work).

---

## Why This Happens

**Timing mismatch:**
- Technologies deployed at months 0, 6, 12, 18, 24
- Mortality cascades begin at months 25-50
- Technologies reach only 13-33% effectiveness during critical window (months 50-150)
- Technologies reach 100% effectiveness at month 180 (15 years) - but runs crash at months 149-223

**Prerequisite violations:**
- Cleanup tech deployed WITHOUT prevention tech (1% effectiveness)
- Cleanup tech deployed WITHOUT sufficient renewable energy (0-10% effectiveness)
- Cleanup tech deployed in "planning" phase instead of "scaling" phase (0-6.7% effectiveness)

**Feedback loops:**
- GDP collapse → energy shortage → cleanup ineffective → pollution worsens → mortality increases → GDP collapses further

---

## Concrete Example

**Technology:** Advanced PFAS Remediation
**Base Effectiveness:** 5% per month reduction in novel entities
**Deployed:** Month 12 in sequenced scenario

**Gating multipliers applied:**
- Regulation: 0.01 (no prevention tech yet)
- Energy: 0.1 (insufficient renewables)
- Concentration: 0.001 (environmental dilution)
- Time lag: 0.067 (12/180 months)
- Rebound: 0.7 (30% production offset)

**Net effectiveness:** 0.05 × 0.01 × 0.1 × 0.001 × 0.067 × 0.7 = **2.3 × 10^-9** = **0.0000002%**

**Time to reduce novel entities from 1.5× to 1.0× threshold:** 355 million years

**Compare to cascade severity:** Novel entities boundary reaches 80× threshold by month 200, accumulating at ~2% per month.

**Result:** Technology improvement (2.3 × 10^-9 per month) is overwhelmed by cascade worsening (0.02 per month) by a factor of **8.7 million**.

---

## Recommendations

### IMMEDIATE: Test Hypotheses (2-4 hours)

**Test 1: Remove gating multipliers**
- Comment out all 5 multipliers in `effectsEngine.ts`
- Run single governance scenario
- If mortality drops below 50%, multipliers are too restrictive

**Test 2: Remove time lag only**
- Set `timeLagFactor = 1.0` (instant effectiveness)
- If mortality drops significantly, timing is the primary issue

**Test 3: Resequence priorities**
- Deploy PREVENTION → ENERGY → CLEANUP instead of all tiers together
- If mortality drops, prerequisite violations are the issue

### SHORT-TERM: Calibration Adjustments (4-8 hours)

**Option A: Reduce deployment timescales**
- Change from 15 years to 5 years for critical tech
- Requires research justification (emergency deployment, crisis acceleration)
- Code location: `effectsEngine.ts` line ~227

**Option B: Start tech in advanced phases**
- Deploy tech in "scaling" or "mature" phase instead of "planning"
- Represents years of pre-deployment R&D
- Code location: `comprehensiveTechTree.ts` tech definitions

**Option C: Relax gating multipliers**
- Regulation: 0.1 instead of 0.01 (10% without prevention)
- Concentration: 0.01 instead of 0.001 (1% in environment)
- Requires research justification for parameter changes

### LONG-TERM: Architectural Improvements (1-2 weeks)

**Priority-aware sequencing:**
- Analyze tech dependency graph
- Deploy prerequisites before dependent tech
- Prevention → Energy → Cleanup → Advanced

**Dynamic deployment acceleration:**
- Emergency Response Phase already has `deploymentAcceleration` multiplier
- Activate during crises to compress timescales from 15 years to 3-5 years

**Adaptive tech effects:**
- Tech effectiveness grows with deployment level AND time
- Synergies between related technologies (solar + desalination = more effective)

---

## Next Investigation Steps

1. ✅ **Phase 1 Complete:** Code trace (this document)
2. 🔄 **Phase 2 In Progress:** Magnitude analysis
   - Extract all 119 tech base effects
   - Compare to cascade magnitudes
   - Identify if base effects are also too small
3. ⏳ **Phase 3 Pending:** Timing analysis
   - Plot tech deployment timeline vs cascade onset
   - Visualize effectiveness ramp-up vs mortality curve
4. ⏳ **Phase 4 Pending:** Diagnostic script
   - Create `scripts/techEffectivenessTimeline.ts`
   - Output CSV showing tech effects vs collapse metrics month-by-month

---

## Files for Review

**Investigation outputs:**
- `/reviews/tech_effectiveness_code_trace_20251125.md` (full technical analysis, 650+ lines)
- `/reviews/tech_ineffectiveness_investigation_summary_20251125.md` (this document)
- `/plans/tech_ineffectiveness_investigation.md` (investigation plan)

**Code locations:**
- `src/simulation/techTree/effectsEngine.ts` - Effects application with gating multipliers
- `src/simulation/engine/phases/TechDeploymentSchedulePhase.ts` - Deployment logic
- `src/simulation/techTree/comprehensiveTechTree.ts` - Tech definitions (71 technologies)

**Research backing:**
- Gating multipliers are research-backed (Ling 2024, Fennell 2024, Montreal Protocol, Jevons paradox)
- Parameters are conservative/realistic, not tuned for "fun"
- Question: Are parameters TOO conservative for model purposes?

---

## Decision Point

**Should we:**

**A) Fix parameters (faster):** Adjust gating multipliers or timescales to allow meaningful tech effects
- Pros: Quick fix (2-4 hours), enables governance experiments
- Cons: Requires research justification, may compromise realism

**B) Fix architecture (slower):** Redesign tech sequencing to deploy prerequisites first
- Pros: Maintains realism, addresses root cause
- Cons: Longer timeline (1-2 weeks), requires extensive testing

**C) Document as expected behavior (if research supports):** If gating multipliers are correct and cascades SHOULD overwhelm tech
- Pros: Maintains research integrity
- Cons: Governance experiments remain blocked

**Recommendation:** **Option A + B hybrid**
1. IMMEDIATE: Test removal of time lag (instant effectiveness) to unblock experiments
2. SHORT-TERM: Implement priority-aware sequencing (prevention first)
3. LONG-TERM: Research emergency deployment acceleration mechanisms

---

**Status:** Investigation Phase 1 complete, awaiting decision on next steps
**Timeline:** 4-8 hours remaining for complete analysis + fixes
**Blocker Removed:** Yes - root cause identified, fixes proposed
