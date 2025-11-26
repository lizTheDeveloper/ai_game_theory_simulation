# Research Verification: Tech Effectiveness Gating Multipliers

**Commit:** 73f6a7c2621d800d2e3a87ef5f96ad205eaa8fb8
**Date:** November 25, 2025
**Type:** Parameter Adjustment
**Priority:** HIGH (affects tech effectiveness by 100-1000x)
**Status:** VERIFICATION PENDING

## Summary

This commit adjusts two key parameters in the novel entities remediation effectiveness model. The changes increase tech effectiveness by 100-1000x, which is necessary for techs to have any measurable impact but requires research validation.

## Claims Requiring Verification

### CLAIM 1: Strategic Deployment Concentration Multiplier (0.001 → 0.1)

**Location:**
- `src/simulation/techTree/effectsEngine.ts:203-206`
- `src/simulation/utils/novelEntitiesEffectiveness.ts:116-118`

**Code Comment Claims:**
> "⚠️ REVISED: Changed from 0.001 to 0.1 (Nov 2025) - tech is deployed strategically at high-concentration zones, not randomly"
> "Research justification: Targeted deployment (industrial runoff, river mouths) achieves 10-30% of point-source effectiveness"

**Verification Needed:**
1. **EXISTENCE CHECK:** Are there peer-reviewed studies on targeted remediation deployment at pollution point sources?
2. **CLAIM CHECK:** Does research support that targeted deployment achieves 10-30% of point-source effectiveness?
   - The original 0.001 (0.1%) was based on concentration ratios (pg/L to mg/L = 10^6-10^9 dilution)
   - The new 0.1 (10%) assumes deployment at high-concentration zones bypasses this dilution
   - **KEY QUESTION:** Is 10% effectiveness at "strategic deployment sites" research-backed or modeling assumption?

**Previous Research Cited (for context):**
- Fennell 2024 - Cost scales 12-47× for dilute streams
- Li et al. 2024 - 12-47× cost scaling for dilute streams
- Newell et al. 2025 - "sub-nanogram per litre cost-effectiveness hinders up-scalability"

**Specific Questions:**
- What is the effectiveness ratio of remediation at point sources (industrial outfalls, river mouths) vs. distributed environmental cleanup?
- Is 10% a reasonable intermediate value between point-source (100%) and distributed (0.1%)?

---

### CLAIM 2: Time Lag Factor (0% → 25% at deployment, 240mo → 60mo to full scale)

**Location:**
- `src/simulation/techTree/effectsEngine.ts:209-220`
- `src/simulation/techTree/effectsEngine.ts:1639-1651`
- `src/simulation/utils/novelEntitiesEffectiveness.ts:127-133`

**Code Comment Claims:**
> "⚠️ REVISED: Changed from 0-240mo to 25%-60mo (Nov 2025) - tech has already been R&D'd before deployment"
> "Research justification: Deployment starts at 25% effectiveness (pilot plants operational, supply chains starting)"
> "Reaches full effectiveness at 60 months (5 years) - manufacturing scale-up complete"
> "Montreal Protocol analog: 5 years from treaty to first compliance checkpoints"

**Verification Needed:**
1. **EXISTENCE CHECK:** Montreal Protocol timeline - was first compliance checkpoint at 5 years?
2. **CLAIM CHECK:** Does 5 years represent a realistic manufacturing scale-up timeline for remediation tech?
3. **CLAIM CHECK:** Is 25% initial effectiveness a reasonable starting point for "pilot plants operational"?
   - Previous model assumed 0% at deployment (linear ramp from 0)
   - New model assumes 25% immediate effectiveness
   - **KEY QUESTION:** What does research say about typical pilot-to-scale timelines?

**Previous Research Cited (for context):**
- Montreal Protocol took 12 years to full compliance
- Plastic phase-out estimated 20-30 years

**Specific Questions:**
- What is the typical timeline from technology deployment to full manufacturing scale?
- What percentage of final capacity does a pilot/demonstration plant typically achieve?
- Is the Montreal Protocol comparison appropriate for remediation tech (vs. production ban)?

---

## Implementation Files Changed

| File | Lines | Change |
|------|-------|--------|
| `src/simulation/techTree/effectsEngine.ts` | 203-206 | concentrationMultiplier 0.001 → 0.1 |
| `src/simulation/techTree/effectsEngine.ts` | 209-227 | timeLagFactor ramp 0-240mo → 25%-60mo |
| `src/simulation/techTree/effectsEngine.ts` | 1623-1651 | applyRegionalEffects concentration + timelag |
| `src/simulation/utils/novelEntitiesEffectiveness.ts` | 116-118 | concentrationMultiplier 0.001 → 0.1 |
| `src/simulation/utils/novelEntitiesEffectiveness.ts` | 127-138 | timeLagMonths 360 → 60, factor starts at 25% |
| `src/simulation/utils/novelEntitiesEffectiveness.ts` | 248-251 | prevention timeLagFactor starts at 25% |

## Validation Checklist

### Layer 1: Citation Existence
- [ ] Montreal Protocol 5-year compliance checkpoint claim
- [ ] Manufacturing scale-up timeline research
- [ ] Point-source vs. distributed remediation effectiveness research

### Layer 2: Claim Verification
- [ ] Does Montreal Protocol research support 5-year scale-up timeline?
- [ ] Does 25% initial effectiveness have empirical backing?
- [ ] Does 10% strategic deployment effectiveness have empirical backing?
- [ ] Are the new parameter values within reasonable research-backed ranges?

## Outcome Classification

**If Claims Are Verified:**
- Parameters become validated modeling assumptions
- Document research sources in code comments

**If Claims Are NOT Verified:**
- Mark as "modeling assumptions" (not research-backed)
- Document uncertainty range for sensitivity analysis
- Consider Monte Carlo sweep across parameter space

## Notes

The original parameters (0.001 concentration, 0-240mo timelag) were based on:
1. Concentration ratios (pg/L to mg/L = 10^6-10^9 dilution factor)
2. Montreal Protocol full rollout timeline (12 years + additional for infrastructure)

The new parameters assume:
1. Tech is deployed strategically at point sources, not randomly distributed
2. Tech has completed R&D before "deployment" milestone, so starts at 25% capacity
3. Manufacturing scale-up is faster than full policy rollout

These assumptions may be reasonable but need research validation to distinguish from "balance tuning for gameplay."

---

**Next Action:** Route to research-skeptic (Sylvia) for two-layer verification
