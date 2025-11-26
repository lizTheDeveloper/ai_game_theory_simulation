# Research Verification: Tech Ineffectiveness Investigation (a1f873d)

**Commit:** a1f873d8d274fc0697929c78558b688ab0558f58
**Date:** Nov 25, 2025
**Investigator:** Roy (Simulation Maintainer)
**Historian:** Auto-generated research verification file

---

## Summary

This commit adds an investigation report explaining why 119 sequenced technologies fail to prevent 99% mortality in governance scenarios. The key finding is that tech ineffectiveness is scientifically accurate, not a bug.

**NO IMMEDIATE PARAMETER CHANGES** - This is an investigation report proposing future changes that require research validation.

---

## Citations Requiring Verification

### Citation 1: IPCC AR6 - Phased Deployment Timescales

**Location:** `reviews/tech_ineffectiveness_investigation_20251125.md:84-85`

**Claim in code:** "Research backing: IPCC AR6, IEA 2024" for phased deployment effectiveness multipliers:
- Planning: 0% (24 months)
- Pilot: 0-5% (36 months)
- Early Deploy: 5-15% (60 months)
- Scaling: 15-40% (120 months)
- Mature: 40-80% (180 months)

**Verification needed:**
- [ ] Layer 1: Does IPCC AR6 discuss climate technology deployment timescales?
- [ ] Layer 2: Does IPCC AR6 provide specific phase durations or effectiveness multipliers?
- [ ] Layer 2: Are the specific values (24mo planning, 36mo pilot, etc.) directly from IPCC or extrapolated?

**Risk level:** MEDIUM - These values are already in ClimateDeploymentPhase (existing code), not new parameters.

---

### Citation 2: IEA 2024 - Deployment Constraints

**Location:** `reviews/tech_ineffectiveness_investigation_20251125.md:85`

**Claim in code:** "Research backing: IPCC AR6, IEA 2024" (same as above)

**Verification needed:**
- [ ] Layer 1: Which IEA 2024 report is being referenced? (Net Zero Roadmap? World Energy Outlook?)
- [ ] Layer 2: Does IEA 2024 provide deployment timeline data for gigatonne-scale climate tech?
- [ ] Layer 2: Do IEA projections support the 100+ month timeline to meaningful effectiveness?

**Risk level:** MEDIUM - Supporting citation for existing parameters.

---

### Citation 3: Manhattan Project / Apollo Program Precedents

**Location:** `reviews/tech_ineffectiveness_investigation_20251125.md:287-290`

**Claim in code:** "Wartime mobilization precedents" could reduce phase durations by 50-75%

**Verification needed:**
- [ ] Layer 1: What is the historical evidence for accelerated deployment under wartime mobilization?
- [ ] Layer 2: Did Manhattan Project achieve 50-75% timeline reduction vs. peacetime projections?
- [ ] Layer 2: Is this precedent applicable to climate tech deployment at planetary scale?

**Risk level:** LOW - Proposed future enhancement, not current parameter.

---

### Citation 4: Montreal Protocol

**Location:** `reviews/tech_ineffectiveness_investigation_20251125.md:344`

**Claim in code:** "Montreal Protocol - international coordination slowed ozone depletion by ~60%"

**Verification needed:**
- [ ] Layer 1: Does peer-reviewed literature quantify Montreal Protocol effectiveness?
- [ ] Layer 2: Is "~60% slowdown" accurate and what is the source?
- [ ] Layer 2: Is this applicable to governance-dependent cascade deceleration?

**Risk level:** LOW - Proposed future enhancement, not current parameter.

---

## Proposed Parameter Changes (NOT YET IMPLEMENTED)

The investigation recommends future parameter changes that REQUIRE research validation BEFORE implementation:

### Recommendation 1: Scale Up Tech Effect Magnitudes

**Current values (from comprehensiveTechTree.ts):**
- DAC: carbonRemoval: 0.01
- Ocean alkalinity: oceanPHBonus: 0.001
- Fusion power: cleanEnergyPercentage: 0.2

**Proposed changes:**
- DAC: carbonRemoval: 0.1 (10x increase)
- Ocean alkalinity: oceanPHBonus: 0.01 (10x increase)
- Fusion power: cleanEnergyPercentage: 0.5 (2.5x increase)

**Verification needed:** 2+ peer-reviewed sources per tech (2024-2025 literature)

**Risk level:** HIGH - These would be significant parameter changes affecting simulation outcomes.

---

### Recommendation 2: Accelerated Phase Transitions

**Proposed governedDeployment mode:**
- pilot: 12 months (was 36)
- early_deploy: 24 months (was 60)
- scaling: 48 months (was 120)
- mature: 72 months (was 180)

**Verification needed:** Research backing for wartime-scale mobilization timelines.

**Risk level:** MEDIUM - New scenario mode, wouldn't affect existing parameters.

---

## GDP-Adaptive Spending (Code Change - No Research Impact)

The commit also adds GDP-adaptive spending fields to scenarios:
- `researchInvestmentRate` - fraction of annual GDP for research
- `aiSafetyBudgetRate` - fraction of annual GDP for AI safety

**Research verification:** NOT NEEDED - This is a mechanical improvement (percentage vs. absolute) that doesn't introduce new research-backed parameters. The actual spending levels remain conceptually the same.

---

## Action Items

1. **NO IMMEDIATE ACTION** - This commit documents existing behavior and proposes future changes
2. **When implementing tech magnitude changes:** Create full research file with 2+ peer-reviewed sources per tech
3. **When implementing accelerated deployment:** Validate wartime mobilization precedents

---

## Files Referenced

- `reviews/tech_ineffectiveness_investigation_20251125.md` (main investigation report)
- `src/simulation/engine/phases/ClimateDeploymentPhase.ts` (existing phased gating)
- `src/simulation/techTree/comprehensiveTechTree.ts` (existing tech magnitudes)
- `src/simulation/techTree/effectsEngine.ts` (effect application)
- `src/types/scenarios.ts` (GDP-adaptive fields)
- `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts` (GDP-adaptive validation)

---

*Generated by historian agent, Nov 25, 2025*
