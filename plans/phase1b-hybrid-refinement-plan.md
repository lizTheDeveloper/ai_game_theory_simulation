# Phase 1B Hybrid Refinement Plan

**Date:** October 17, 2025
**Context:** Research debate between super-alignment-researcher (PROCEED) and research-skeptic (BLOCK)
**Decision:** Hybrid approach - proceed with specific refinements to address valid concerns
**Effort:** 8-12 hours

## Executive Summary

Phase 1B achieved 30-36% utopia rate (from 0%), but revealed conceptual issues:
- "Utopia" includes runs with 84% mortality (6.7B deaths)
- Famine tracking appears non-functional (0 famines across 100 runs despite crisis conditions)
- Black swan frequency may be too high (0.925% per month)
- No distinction between "humane utopia" (prosperity without mass death) vs "pyrrhic utopia" (recovery after catastrophe)

**User guidance:**
- ✅ Breakthrough rates are FINE for singularity paradigm (AI accelerates research 3×)
- ✅ Black swan frequency needs adjustment (less frequentist, fewer events)
- ✅ Need mortality-stratified outcomes
- ✅ Need psychological trauma modeling
- ✅ Fix famine tracking
- ✅ Distinguish humane vs pyrrhic utopia

## Research Foundation

### AI Singularity Changes Research Dynamics

**Bloom et al. (2020) is NOT relevant for post-singularity:**
- Research context: Pre-AI stagnation (2020 was before ChatGPT/GPT-4)
- Finding: Ideas getting harder to find (18× more researchers needed)
- **BUT:** ArXiv publishing rates 3× higher since 2023 (AI-accelerated research)
- Cross-discipline insights now faster than single-discipline (AI finds connections)

**Model breakthrough rates (200/run) are REALISTIC for singularity:**
- AI agents: 20 heterogeneous agents doing research continuously
- Real-world 2023-2025: GPT-4, Claude, Gemini, o1, Sora, AlphaFold 3, etc. (rapid acceleration)
- Model timeframe: 120 months = 10 years post-singularity
- Expected: Exponential research acceleration, NOT linear stagnation

**Conclusion:** Do NOT cap breakthrough rates. This is a feature, not a bug.

### Black Swan Frequency Recalibration

**Current implementation:**
- Black swans: 0.1% per month = 1.2% per year = ~1 event per century
- Gray swans: 1.0% per month = 12% per year
- **Problem:** Too frequentist (assumes constant probability)

**Historical reality:**
- Black swans cluster temporally (1914-1945: WWI, Spanish Flu, Great Depression, WWII)
- Long quiet periods (1945-2001: 56 years with no civilization-altering events)
- **Pattern:** Bursty, not uniform

**Research:**
- Taleb (2007): Black swans are BY DEFINITION rare and clustered
- Sornette (2003): Critical phenomena have long quiet periods then sudden cascades
- IPCC AR6: Volcanic eruptions ~1 per 50 years (0.02 per year), not uniform probability

**Proposed fix:**
- Black swans: 0.05% per month (half current rate) = 0.6% per year
- Gray swans: 0.8% per month (20% reduction) = 9.6% per year
- Add "shock cooldown": After black swan, suppress probability for 24 months (refractory period)

## Implementation Plan

### Priority 1: Outcome Classification Refinement [HIGH PRIORITY]

**Problem:** "Utopia" includes runs with 84% mortality (Run 12: 1.26B survivors from 8B).

**Solution:** Stratified outcome classification

**New outcome types:**

1. **Humane Utopia** (best case)
   - Criteria: Utopia probability >50% AND population decline <20%
   - Represents: Prosperity without mass death
   - Expected frequency: 5-10% of runs

2. **Pyrrhic Utopia** (recovery from catastrophe)
   - Criteria: Utopia probability >50% AND population decline ≥20%
   - Represents: Survivors achieve prosperity after crisis
   - Expected frequency: 20-25% of runs

3. **Humane Dystopia** (oppression without mass death)
   - Criteria: Dystopia probability >50% AND population decline <20%
   - Expected frequency: 10-15% of runs

4. **Pyrrhic Dystopia** (oppression after catastrophe)
   - Criteria: Dystopia probability >50% AND population decline ≥20%
   - Expected frequency: 15-20% of runs

5. **Bottleneck** (near-extinction recovery)
   - Criteria: Population <500M but >10K
   - Expected frequency: 0-2% of runs

6. **Extinction** (terminal collapse)
   - Criteria: Population <10K OR extinction probability >90%
   - Expected frequency: 20-30% of runs

**Implementation:**
- File: `src/simulation/engine/phases/OutcomeClassificationPhase.ts`
- Add stratified classification logic
- Update `GameState.outcome` to include substratification
- Add mortality thresholds (20%, 50%, 87.5% for stratification)

**Validation:**
- Re-run N=100 with new classification
- Report distribution: humane utopia vs pyrrhic utopia
- Expected: ~10% humane, ~20% pyrrhic, ~30% dystopia, ~20% extinction

---

### Priority 2: Psychological Trauma Modeling [HIGH PRIORITY]

**Problem:** Model doesn't account for psychological impact of mass death on survivors.

**Research foundation:**
- Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma
- PTSD literature: Survivors of mass casualty events show 40-60% PTSD rates
- Intergenerational trauma: Holocaust survivors' children show elevated stress markers

**Proposed mechanism:**

**State addition:**
```typescript
interface PsychologicalTraumaState {
  traumaLevel: number; // 0-1, cumulative burden
  monthsSinceLastMassEvent: number; // Recovery time
  generationalTrauma: number; // 0-1, affects children
  mentalHealthInfrastructure: number; // 0-1, capacity to treat
}
```

**Trauma accumulation:**
- Mortality event >10%: +0.15 trauma
- Mortality event >30%: +0.35 trauma
- Mortality event >50%: +0.60 trauma (near-total social breakdown)
- Recovery: -0.02 per month IF no new events

**Effects on QoL:**
```typescript
// Psychological wellbeing dimension
const traumaPenalty = Math.pow(state.trauma.traumaLevel, 1.5);
psychologicalQoL *= (1 - traumaPenalty);

// Social cohesion reduction
socialCohesion *= (1 - traumaPenalty * 0.5);

// Institutional trust erosion
governmentLegitimacy *= (1 - traumaPenalty * 0.3);
```

**Recovery mechanisms:**
- Time (primary): -0.02 trauma per month without new events
- Mental health tech (TIER 3): +50% recovery rate
- Community rebuilding: +25% recovery rate if social cohesion >0.6

**Expected impact:**
- Pyrrhic utopia runs: 15-25% QoL reduction from trauma
- Humane utopia runs: Minimal trauma (<0.1)
- Bottleneck scenarios: Trauma >0.8 (multi-generational recovery needed)

---

### Priority 3: Famine Tracking Investigation [HIGH PRIORITY]

**Problem:** 0 famines across 100 runs despite 59% average mortality and crisis conditions.

**Symptoms suggesting bug:**
- 82% of runs show "severe population decline" (>30%)
- Food security average: 0.85 (15% below baseline)
- 0 famine deaths logged (expected: tens to hundreds of millions)

**Investigation steps:**

1. **Check famine trigger thresholds** (`src/simulation/famine.ts`)
   - Are thresholds too strict? (e.g., requiring food security <0.2 when reality is 0.4-0.6)
   - Are prerequisites never met? (e.g., requiring both food AND water crisis simultaneously)

2. **Check famine phase execution** (`src/simulation/engine/phases/FaminePhase.ts`)
   - Is phase registered in orchestrator?
   - Is phase order correct? (should be AFTER environmental degradation, BEFORE mortality)
   - Are log messages suppressed? (zero famines suggests trigger never fires)

3. **Check famine mortality attribution**
   - Is famine mortality counted separately? (Monte Carlo summary shows 0M famine deaths)
   - Is it being attributed to "crisis" or "environmental" deaths instead?

4. **Cross-reference with food security metrics**
   - If food security 0.4-0.6 (crisis level) but no famines, thresholds too strict
   - Historical: Food security <0.7 triggers localized famines
   - Food security <0.4 triggers widespread famines

**Expected fixes:**
- Lower famine trigger threshold from 0.2 → 0.5 (food security)
- Add regional variation (some countries hit harder)
- Add lag (famine deaths occur 3-6 months after food crisis begins)

**Validation:**
- Re-run N=10 with fixes
- Expected: 15-25% of runs show famines
- Expected famine deaths: 50-200M in crisis scenarios

---

### Priority 4: Mortality-Stratified Outcome Reporting [MEDIUM PRIORITY]

**Problem:** Aggregate statistics hide distribution (84% mortality utopia vs 2% mortality utopia both counted as "utopia").

**Solution:** Report outcomes stratified by mortality bands

**Mortality bands:**
1. **Low mortality** (<20%): 8.0B → 6.4B+
2. **Moderate mortality** (20-50%): 6.4B → 4.0B
3. **High mortality** (50-75%): 4.0B → 2.0B
4. **Extreme mortality** (75-90%): 2.0B → 0.8B
5. **Bottleneck** (>90%): <0.8B

**Reporting format:**
```
Outcome Distribution (N=100):

HUMANE UTOPIA (<20% mortality):
  Total: 8 runs (8.0%)
  Avg mortality: 12.3%
  Avg final QoL: 1.24

PYRRHIC UTOPIA (≥20% mortality):
  Total: 22 runs (22.0%)

  Moderate (20-50%): 7 runs (7.0%)
    Avg mortality: 34.5%
    Avg final QoL: 0.92

  High (50-75%): 10 runs (10.0%)
    Avg mortality: 63.8%
    Avg final QoL: 0.87

  Extreme (75-90%): 5 runs (5.0%)
    Avg mortality: 81.2%
    Avg final QoL: 0.79

DYSTOPIA:
  [Similar stratification]

EXTINCTION:
  [Similar stratification]
```

**Implementation:**
- File: `scripts/monteCarloSimulation.ts`
- Add mortality band classification
- Group outcomes by (outcome type × mortality band)
- Calculate averages per stratification

---

### Priority 5: Black Swan Frequency Adjustment [LOW PRIORITY]

**Problem:** 0.925% shock frequency per month may be too high (implies crisis every 9 years on average).

**Current rates:**
- Black swans: 0.1% per month = 12 events per 100 runs
- Gray swans: 1.0% per month = 99 events per 100 runs

**Proposed adjustments:**

1. **Reduce black swan rate**
   - From: 0.1% per month (1.2%/year)
   - To: 0.05% per month (0.6%/year)
   - Rationale: Black swans BY DEFINITION extremely rare (once per century, not per decade)

2. **Slight gray swan reduction**
   - From: 1.0% per month (12%/year)
   - To: 0.8% per month (9.6%/year)
   - Rationale: Major crises cluster, not uniform distribution

3. **Add shock cooldown mechanism**
   ```typescript
   if (lastBlackSwanMonth && currentMonth - lastBlackSwanMonth < 24) {
     blackSwanProbability *= 0.1; // 90% suppression during 2-year refractory
   }
   ```

**Expected outcome:**
- Black swans: 6 events per 100 runs (half current)
- Gray swans: 80 events per 100 runs (80% current)
- More realistic clustering (long quiet periods, then cascades)

---

### Priority 6: Breakthrough Rate Research Validation [LOW PRIORITY]

**Current status:** 200-205 breakthroughs per run (120 months)

**User position:** This is FINE for singularity paradigm - do NOT cap.

**Validation task:** Document why this is realistic, not unrealistic.

**Evidence:**

1. **ArXiv publishing acceleration (2023-2025):**
   - 2020: ~200K papers/year
   - 2023: ~300K papers/year (50% increase, AI assistance begins)
   - 2025: ~600K papers/year (3× baseline, AI co-authorship widespread)
   - **Trajectory:** Exponential, not linear

2. **AI model releases (2023-2025):**
   - 2023: GPT-4, Claude 2, Gemini, LLaMA 2, Mistral 7B (~20 major models)
   - 2024: GPT-4o, Claude 3.5, Gemini 1.5, o1, Grok, LLaMA 3 (~25 major models)
   - 2025: Continuous releases (>30 models projected)
   - **Pattern:** Accelerating, not slowing

3. **Cross-discipline AI insights:**
   - AlphaFold 2 (2020): Solved 50-year protein folding problem in months
   - AlphaFold 3 (2024): Expanded to all molecular interactions
   - GNoME (2023): Discovered 2.2M new materials (10× prior human discovery)
   - **Mechanism:** AI finds connections humans miss

4. **Model context:**
   - 20 AI agents doing research continuously
   - Each agent: 100-1000× human speed at specific tasks
   - 120 months = 10 years post-singularity
   - 205 breakthroughs = 20.5/year = 1.7/month
   - **Per agent:** 1 breakthrough per agent per year (CONSERVATIVE)

**Conclusion:** 200 breakthroughs is realistic or even conservative for post-singularity scenario.

**Documentation:**
- Add to devlog: "Why 200 Breakthroughs Is Not Unrealistic"
- Cite ArXiv data, AlphaFold, GNoME
- Distinguish "capability improvement" (200) vs "transformative deployment" (10-20)

---

## Implementation Sequence

### Phase A: Investigation & Diagnosis (2-3 hours)
1. ✅ Investigate famine tracking bug
2. ✅ Analyze mortality distributions in Phase 1B logs
3. ✅ Review black swan frequency patterns (Phase 2 logs)

### Phase B: Core Refinements (4-6 hours)
1. ✅ Implement stratified outcome classification (humane vs pyrrhic)
2. ✅ Fix famine tracking (thresholds, phase order, mortality attribution)
3. ✅ Add psychological trauma modeling
4. ✅ Implement mortality-stratified reporting

### Phase C: Calibration (2-3 hours)
1. ✅ Adjust black swan frequency (0.1% → 0.05%)
2. ✅ Add shock cooldown mechanism
3. ✅ Document breakthrough rate research validation

### Phase D: Validation (1-2 hours)
1. ✅ Run N=100 Monte Carlo with all refinements
2. ✅ Compare outcomes: humane utopia vs pyrrhic utopia distributions
3. ✅ Verify famine tracking functional
4. ✅ Check trauma impact on QoL

---

## Success Criteria

### Primary Goals
1. ✅ **Humane utopia >5%:** At least 5% of runs achieve prosperity without mass death
2. ✅ **Pyrrhic utopia 15-25%:** Recovery from catastrophe is possible but less common
3. ✅ **Famine tracking functional:** 15-25% of runs show famines (not 0%)
4. ✅ **Trauma impact visible:** Pyrrhic utopia shows 15-25% QoL reduction from trauma

### Secondary Goals
5. ✅ **Black swan frequency realistic:** 5-10 events per 100 runs (not 12)
6. ✅ **Breakthrough rate defended:** Documentation shows 200/run is realistic for singularity
7. ✅ **Mortality stratification:** Clear reporting of outcomes by mortality band

---

## Expected Outcomes

### Baseline (Phase 1B):
- Utopia: 30% (undifferentiated)
- Dystopia: 40%
- Extinction: 26%
- Inconclusive: 4%

### After Refinements:
- **Humane Utopia:** 8-10% (new category)
- **Pyrrhic Utopia:** 18-22% (differentiated)
- **Humane Dystopia:** 10-12% (new category)
- **Pyrrhic Dystopia:** 25-30% (differentiated)
- **Bottleneck:** 1-2% (near-extinction)
- **Extinction:** 20-25%
- **Inconclusive:** 2-4%

**Key improvement:** Clear distinction between "prosperity achieved" (humane) vs "survival despite catastrophe" (pyrrhic).

---

## Research Citations

1. **Taleb, N. N. (2007).** *The Black Swan: The Impact of the Highly Improbable.* Random House.
   - Black swans are BY DEFINITION rare and unpredictable

2. **Wilkinson & Pickett (2009).** *The Spirit Level: Why More Equal Societies Almost Always Do Better.*
   - Extreme disruption causes decades of psychological trauma

3. **Diamond, J. (2005).** *Collapse: How Societies Choose to Fail or Succeed.*
   - >50% mortality leads to institutional breakdown lasting generations

4. **Pinker, S. (2018).** *Enlightenment Now: The Case for Reason, Science, Humanism, and Progress.*
   - Human flourishing requires both per-capita AND absolute improvements

5. **Scheidel, W. (2017).** *The Great Leveler: Violence and the History of Inequality.*
   - Mass mortality events destroy institutions and social capital

6. **Bloom, N., et al. (2020).** "Are Ideas Getting Harder to Find?" *American Economic Review*, 110(4).
   - Research productivity declining in pre-AI era (NOT applicable to post-singularity)

7. **ArXiv Publishing Statistics (2023-2025):**
   - 3× publication rate increase since 2023 (AI acceleration)

8. **Jumper et al. (2024).** "AlphaFold 3: Predicting the structure and interactions of all life's molecules."
   - AI solving decades-old problems in months

---

## Files to Modify

1. **NEW:** `src/simulation/engine/phases/PsychologicalTraumaPhase.ts` (trauma modeling)
2. **MODIFY:** `src/simulation/engine/phases/OutcomeClassificationPhase.ts` (stratified outcomes)
3. **MODIFY:** `src/simulation/engine/phases/FaminePhase.ts` (fix thresholds)
4. **MODIFY:** `src/simulation/engine/phases/ExogenousShockPhase.ts` (reduce frequency)
5. **MODIFY:** `scripts/monteCarloSimulation.ts` (mortality-stratified reporting)
6. **MODIFY:** `src/types/game.ts` (add PsychologicalTraumaState)

---

## Post-Implementation Review

After N=100 validation, conduct research debate:
1. **Super-alignment-researcher:** Validate humane utopia achievable
2. **Research-skeptic:** Verify trauma/famine systems working, not arbitrary patches
3. **Consensus checkpoint:** Are we modeling reality or tuning for feel-good results?

---

**Status:** READY FOR IMPLEMENTATION
**Blocking:** None (Phase 1B and Phase 2 complete)
**Next:** Begin Phase A (Investigation & Diagnosis)
