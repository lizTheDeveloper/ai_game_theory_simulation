# Spiral Threshold Validation Analysis
**Date:** November 25, 2025
**Analyst:** Roy (Simulation Maintainer)
**Context:** Investigating why 0/160 Monte Carlo runs showed ANY spiral activations

---

## Executive Summary

**FINDING: Spiral thresholds appear extremely difficult to activate under current model dynamics.**

From code analysis, all 6 spirals have strict multi-condition requirements that must ALL be met simultaneously. The roadmap claims "need mortality < 50% to reach spiral windows (years 15-30)" but this is only ONE barrier - there are many other stringent thresholds that may block activation even with low mortality.

**Status:** Diagnostic script running (30-year simulation to validate). Preliminary analysis from code review below.

---

## The 6 Upward Spirals (from `upwardSpirals.ts`)

### 1. Abundance Spiral

**Activation Conditions (ALL required):**
- Material abundance > 1.5 (baseline = 1.0)
- Energy availability > 1.5 (baseline = 1.0)
- Unemployment > 60% AND economic transition stage >= 3 (post-work economy)

**Analysis:**
The unemployment + economic stage requirement is VERY strict. Requires 60% of population NOT working AND UBI/post-work systems operational. This is a far-future scenario that may not activate in typical 30-year runs.

---

### 2. Cognitive Spiral

**Activation Conditions (ALL required):**
- Mental health: disease burden < 30% AND healthcare quality > 80%
- Purposeful: meaning crisis level < 30%
- Cognitive enhancement:
  - Demonstrated benefits (QoL > 0.5)
  - Comprehensive trust in AI > TRUST_THRESHOLD_ACCEPTANCE (need to check this value)

**Analysis:**
The comprehensive trust requirement depends on multiple factors (benefits + alignment + safety + performance). Disease burden <30% is also strict - baseline is likely higher in crisis scenarios.

---

### 3. Democratic Spiral

**Activation Conditions (ALL required):**
- Quality governance: decision quality > 70% AND institutional capacity > 70%
- Democratic engagement: participation rate > 60% AND transparency > 70%
- NOT authoritarian government

**Analysis:**
Institutional capacity > 70% during mortality cascades may be very difficult. Crises typically degrade institutions.

---

### 4. Scientific Spiral

**Activation Conditions (ALL required):**
- Deployed breakthroughs >= threshold (3-4 depending on AI capability)
- Research investment > $50B/month
- AI acceleration: average AI capability > 1.2
- Workflow adaptation >= 25%

**Analysis:**
This is the most complex spiral with 4 separate requirements. The "deployed breakthroughs" threshold means technologies must be >50% deployed, not just researched. The Nov 25 findings show 119 sequenced techs failed to prevent 99% mortality - if tech deployment is ineffective, this spiral cannot activate.

---

### 5. Meaning Spiral

**Activation Conditions (ALL required):**
- Meaning fulfilled: meaning crisis level < 20%
- Strong community: social cohesion > 70% (average of trust + community bonds + civil liberties)
- Culturally adapted: cultural adaptation > 70%
- Autonomous: autonomy > 70% AND cultural vitality > 70%

**Analysis:**
The 20% meaning crisis threshold is very strict. During economic disruption from AI, meaning crisis likely rises significantly. Requires 4 separate QoL/social metrics all above 70%.

---

### 6. Ecological Spiral

**Activation Conditions (ALL required):**
- Ecosystem health > 70%
- Climate stability > 70%
- Biodiversity index > 70%
- Pollution level < 30%
- Resource reserves > 70%

**Analysis:**
FIVE environmental metrics must ALL be healthy simultaneously. This is the strictest spiral - requires comprehensive environmental restoration. In scenarios with mortality cascades, environmental metrics are likely degrading, not improving.

---

## Utopia Declaration Requirements

Even if spirals activate, Utopia declaration requires:

1. **3+ spirals sustained for 12+ months** (not just active, but stable)
2. **ALL survival fundamentals met globally:**
   - Food security >= 70%
   - Water security >= 70%
   - Thermal habitability >= 70%
   - Shelter security >= 70%
3. **Distribution metrics:**
   - Global Gini <= 0.40 (moderate inequality)
   - Worst region QoL >= 0.50 (Rawlsian minimum)
   - NOT dystopic inequality (some regions thriving while others suffer)
   - NOT regional dystopia (>30% in crisis)
4. **No active crises** (10 crisis types checked)

---

## Key Blockers Identified (Pre-Diagnostic)

### BLOCKER 1: Cumulative Mortality

**Roadmap claim:** "Need mortality < 50% to reach spiral windows (years 15-30)"

**Code evidence:** This affects multiple spirals indirectly:
- Population decline → economic disruption → meaning crisis rises → Meaning spiral blocked
- Deaths → healthcare system strain → disease burden up → Cognitive spiral blocked
- Deaths → institutional stress → governance quality drops → Democratic spiral blocked
- Deaths → resource crises → environmental degradation → Ecological spiral blocked

**Validation needed:** Diagnostic script will show actual mortality trajectory.

---

### BLOCKER 2: Tech Deployment Ineffectiveness (Nov 25 Finding)

**From governance scenario analysis:**
- 119 sequenced breakthrough techs deployed
- Mortality still reached 99%
- Conclusion: Tech effects overwhelmed by cascades OR not applied correctly

**Impact on Scientific Spiral:**
- Requires 3-4 deployed breakthroughs
- But "deployed" means >50% adoption AND providing actual benefits
- If tech deployment is ineffective, Scientific spiral CANNOT activate

**CRITICAL DEPENDENCY:** Must resolve "Tech Ineffectiveness Investigation" (roadmap CRITICAL-2) before spiral thresholds can be validated.

---

### BLOCKER 3: GDP Collapse → Research Spending Impossible

**From governance scenario analysis:**
- Fixed $50-200B/month research spending
- GDP collapses during mortality cascades
- Spending becomes "physically impossible"

**Impact on Scientific Spiral:**
- Requires >$50B/month research investment
- If GDP < spending requirement, threshold CANNOT be met
- This is a hard dependency on GDP-adaptive spending fix (roadmap CRITICAL-1)

---

### BLOCKER 4: Multi-Condition AND Logic

**Pattern across all spirals:**
- Every spiral has 3-5 conditions
- ALL must be met simultaneously
- If ANY single condition fails, spiral = INACTIVE

**Example failure mode (Ecological Spiral):**
- Ecosystem health: 75% ✅
- Climate stability: 72% ✅
- Biodiversity index: 68% ❌ (need 70%)
- Pollution level: 25% ✅
- Resource reserves: 71% ✅
- **RESULT: INACTIVE** (even though 4/5 met)

**Statistical implication:**
- If each condition has 50% independent probability
- Spiral with 5 conditions: 0.5^5 = 3.125% activation probability
- 6 spirals with varying conditions: vanishingly small joint probability

---

## Spiral Windows (Years 15-30)

**From upwardSpirals.ts comments:**
> "The 6 Upward Spirals:"
> "Utopia condition: 3+ spirals sustained for 12+ months"

**No explicit window mentioned in code**, but logic suggests:
- Early game (years 0-10): Building foundations, unlikely to have 3+ spirals
- Mid-game (years 10-20): Spiral activation window IF conditions met
- Late game (years 20-30): Sustained spiral maintenance for Utopia

**Mortality impact:**
- High early mortality → never reach mid-game with healthy conditions
- Cascading failures → degrade conditions that were improving

---

## Open Questions (Diagnostic Will Answer)

1. **What is actual mortality trajectory in baseline run?**
   - Does it exceed 50% by year 15?
   - If yes, are spirals even reachable?

2. **Which spiral is "easiest" to activate?**
   - Which one gets closest to activation?
   - What are the specific blockers?

3. **Do spirals ever activate TEMPORARILY?**
   - Or do thresholds never even come close?

4. **What would it take to activate 3+ spirals?**
   - Aggressive tech deployment?
   - Reduced mortality dynamics?
   - Lowered thresholds?

---

## Preliminary Recommendations (Pre-Diagnostic Results)

### If Diagnostic Shows Mortality > 50% at Year 15:

**OPTION A: Reduce Model Mortality**
- Calibrate baseline death rates lower
- Reduce cascade amplification factors
- Allow tech deployment to be more effective

**OPTION B: Lower Spiral Thresholds**
- Material/Energy abundance: 1.5 → 1.3
- Governance quality: 70% → 60%
- Environmental metrics: 70% → 60%
- (Requires research justification for each change)

**OPTION C: Enable Aggressive Scenario Mode**
- Create "optimistic tech deployment" scenario
- Deploy all breakthrough techs immediately
- Test if BEST CASE can activate spirals
- If not, thresholds are fundamentally unrealistic

### If Diagnostic Shows Mortality < 50% BUT Zero Activations:

**OPTION D: Identify Specific Blockers**
- Which conditions are closest to thresholds?
- Which are impossibly far?
- Target fixes to worst blockers first

**OPTION E: Redesign Spiral Logic**
- Change from AND to "majority vote" (3/5 conditions)
- Add "partial activation" states (weak/moderate/strong)
- Allow spirals to build gradually instead of binary on/off

---

## Next Steps

1. ✅ **RUNNING:** Diagnostic script (30-year simulation)
   - Will complete in ~5-10 minutes
   - Outputs detailed spiral diagnostics every 12 months
   - Focuses on years 15-30 window

2. **PENDING:** Analyze diagnostic results
   - Confirm/refute "50% mortality" claim
   - Identify which spiral gets closest
   - Document specific threshold gaps

3. **DECISION POINT:** Based on diagnostic findings
   - If mortality is the blocker → Depends on CRITICAL-1 & CRITICAL-2 fixes
   - If thresholds are unrealistic → Need research-backed recalibration
   - If logic is too strict → Need spiral mechanism redesign

---

## Research Notes

**FROM CODE (`upwardSpirals.ts` header):**

> "Key insight: Utopia isn't just 'no crises + high QoL'
> It's about multiple self-reinforcing positive feedback loops (spirals)"

**This is philosophically sound** - research shows complex systems need multiple mutually-reinforcing dynamics for stable positive outcomes.

**BUT:** The implementation may be TOO strict for a 30-year simulation window. Real-world transitions (e.g., demographic transition, industrial revolution) took 50-100 years to stabilize.

**RESEARCH QUESTION:** What is the empirical timeline for "virtuous cascades" in historical human development?
- Industrial Revolution: ~100 years (1760-1860)
- Post-WW2 Golden Age: ~30 years (1945-1975)
- Digital Revolution: ~20 years (1990-2010)?

If historical "upward spirals" take decades to emerge and stabilize, expecting 3+ spirals in a 15-30 year window during an AI transition may be unrealistic.

---

**END OF PRELIMINARY ANALYSIS**

*Diagnostic results will be appended when script completes.*
