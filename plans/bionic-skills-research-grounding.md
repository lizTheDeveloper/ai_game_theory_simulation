# Bionic Skills Research Grounding & Enhancement

**Created:** October 16, 2025
**Status:** Active - Based on super-alignment researcher findings
**Priority:** Medium (P2-level)
**Estimated Effort:** 78 hours over 3 months
**Research Foundation:** 22 peer-reviewed studies (Science, Nature, ACM, OECD)

---

## Executive Summary

The current `bionicSkills.ts` implementation is **fundamentally correct** - it models AI-assisted cognition via digital tools (GitHub Copilot, ChatGPT, AI tutors), not science fiction BCIs. This is **TRL 8-9 technology** with robust peer-reviewed evidence.

However, the research skeptic correctly identified that the model is missing critical countervailing forces documented in the literature:
1. **Phase transition** (complementarity → substitution after 5-10 years)
2. **Performance vs competence gap** (AI-assisted output ≠ skill retention)
3. **Productivity-wage decoupling** (capital captures gains without policy intervention)

This plan addresses those gaps while maintaining the model's research-backed foundation.

---

## Research Validation Summary

### What's Currently Correct (Keep As-Is):

**✅ AI Amplification Effect** (TRL 9)
- 55.8% faster programming (Peng et al. 2023, Microsoft Research, n=95 RCT)
- 40% faster writing with 18% quality improvement (Noy & Zhang 2023, Science, n=453)
- Large learning effect size g=0.867 (Meta-analysis 2025, Nature portfolio, 51 studies)

**✅ Differential Benefits by Skill Level** (TRL 9)
- Novices benefit MORE than experts (multiple RCTs confirm)
- "Inequality between workers DECREASED" (Noy & Zhang 2023, Science)
- Model's 60% novice / 20% expert amplification is empirically validated

**✅ Digital Divide & Access Inequality** (TRL 9)
- Access gaps by income, education, geography (Microsoft Research 2024, OECD 2024)
- Elite +30% / Precariat -30% access modifiers align with research
- Urban 32% vs rural 21% exposure documented

**✅ Task Specificity** (TRL 9)
- Model focuses on programming, writing, communication
- Nature Human Behaviour meta-analysis confirms these are domains where AI helps

### What's Missing (Critical Gaps):

**❌ Phase Transition Employment Effects** (TRL 9 - Historical Pattern)
- Research: Acemoglu & Restrepo (2022, Econometrica) - 50-70% of wage inequality from automation
- Historical: ATMs, Excel, self-checkout all show 5-10 year complementarity → substitution
- Current Model: Assumes permanent amplification, ignores displacement phase
- **Impact:** Model is overly optimistic about long-term employment effects

**❌ Performance vs Competence Tracking** (TRL 8)
- Research: Cognitive Research (2024) - Students with AI scored 48-127% higher initially, but "scores plummeted" on retention tests
- Research: MDPI (2023) - AI inhibits on-the-job learning, "illusion of understanding"
- Current Model: Treats AI-assisted performance as true skill
- **Impact:** Model doesn't capture skill erosion from over-reliance

**❌ Productivity-Wage Decoupling** (TRL 9 - Historical Pattern)
- Research: Brookings (2024), labor economics (productivity +77%, wages +12% since 1973)
- Research: Capital captures gains without policy intervention
- Current Model: Assumes productivity → wages (linear relationship)
- **Impact:** Model is overly optimistic about worker benefit from AI

---

## Implementation Plan (78 hours, 3 months)

### Phase 1: Terminology & Documentation (Week 1, 8 hours)

**Objective:** Remove science fiction framing, add research citations

**Tasks:**
1. **Rename terminology** (2h)
   - Change "bionic skills" → "AI-assisted skills" or "augmented cognition"
   - Remove any BCI/implant references
   - Update all documentation, comments, variable names

2. **Add research citations** (3h)
   - Add JSDoc comments with study citations to key functions
   - Reference TRL levels for each mechanic
   - Link to `/reviews/bionic-skills-hopeful-research-foundation-20251016.md`

3. **Add TRL assessments** (2h)
   - Document which mechanics are TRL 8-9 (validated)
   - Document which are TRL 4-6 (emerging)
   - Add confidence levels

4. **Update plan files** (1h)
   - Update TIER 4.6 plan to remove BCI language
   - Cross-reference with research validation

**Deliverables:**
- Updated `bionicSkills.ts` with research-backed terminology
- Research citation comments in code
- Updated TIER 4.6 plan document

---

### Phase 2: Phase Transition Mechanics (Weeks 2-4, 12 hours)

**Objective:** Model the transition from complementarity to substitution

**Research Foundation:**
- Acemoglu & Restrepo (2022): Automation-induced wage inequality
- Historical: ATMs (1970s → 1990s), Excel (1985 → 2000s), Self-checkout (2000s → 2010s)
- Timeline: 5-10 years complementarity, then substitution begins

**Implementation:**

1. **Add phase detection system** (4h)
   ```typescript
   interface PhaseTransitionState {
     phase: 'complementarity' | 'transition' | 'substitution';
     yearsInPhase: number;
     taskComplexityThreshold: number;
     displacementRate: number;
   }
   ```

2. **Implement displacement tracking** (4h)
   - When AI capability > task complexity threshold, begin displacement
   - Displacement rate increases with capability gap
   - Track "at-risk jobs" by segment and skill level
   - Model unemployment increase from displacement

3. **Add policy intervention points** (2h)
   - Retraining programs can slow displacement
   - UBI can mitigate unemployment impact
   - Job guarantee programs as alternative

4. **Test against historical data** (2h)
   - Validate timeline matches ATM/Excel patterns
   - Check displacement rates are realistic (5-15% over 5 years)
   - Compare to Bureau of Labor Statistics automation impact data

**Parameters to Add:**
```typescript
phaseTransition: {
  complementarityPeriod: 60, // months (5 years)
  transitionPeriod: 60,       // months (5 years)
  displacementRate: 0.002,    // 0.2% per month in substitution phase
  taskComplexityThreshold: 1.5 // When AI exceeds this, substitution begins
}
```

**Deliverables:**
- Phase transition system in `bionicSkills.ts`
- Displacement tracking integrated with unemployment calculations
- Tests validating against historical automation patterns

---

### Phase 3: Performance vs Competence (Weeks 5-6, 8 hours)

**Objective:** Track the gap between AI-assisted performance and actual skill retention

**Research Foundation:**
- Cognitive Research (2024): "Illusion of understanding" - performance ≠ retention
- MDPI (2023): AI inhibits on-the-job learning
- Frontiers Psychology (2024): AI + human scaffolding > AI alone

**Implementation:**

1. **Add competence tracking** (3h)
   ```typescript
   interface SkillCompetence {
     performance: number;      // With AI assistance
     competence: number;       // Without AI (true skill)
     retentionRate: number;    // How quickly competence decays
     scaffoldingQuality: number; // Human teaching support
   }
   ```

2. **Model retention mechanics** (3h)
   - Performance improves with AI use (current model)
   - Competence grows slower than performance (new mechanic)
   - Retention rate depends on scaffolding quality (teaching support)
   - Over-reliance creates performance-competence gap

3. **Add segment-specific scaffolding** (2h)
   - Elite: High scaffolding (education, mentorship) → good retention
   - Precariat: Low scaffolding → poor retention, large gap
   - Model inequality in skill development quality

**Parameters to Add:**
```typescript
skillRetention: {
  baseRetentionRate: 0.7,        // 70% of gains stick without scaffolding
  scaffoldingMultiplier: 1.5,    // With good teaching, 1.5x retention
  overReliancePenalty: 0.5,      // Heavy AI use without scaffolding → 50% retention
  gapGrowthRate: 0.01            // Performance-competence gap grows 1% per month
}
```

**Deliverables:**
- Competence tracking system
- Retention mechanics with scaffolding modifiers
- Segment-specific teaching support parameters

---

### Phase 4: Economic Distribution (Weeks 7-8, 6 hours)

**Objective:** Model productivity-wage decoupling and capital capture

**Research Foundation:**
- Brookings (2024): Labor economics (productivity +77%, wages +12% since 1973)
- Acemoglu & Restrepo (2018): Automation and new tasks
- Without policy intervention, capital captures productivity gains

**Implementation:**

1. **Add labor share tracking** (2h)
   ```typescript
   interface LaborCapitalDistribution {
     laborShare: number;         // 0-1, currently ~0.62 (down from 0.67 in 1970s)
     capitalShare: number;        // 1 - laborShare
     productivityGrowth: number;  // From AI amplification
     wageGrowth: number;         // Actual wage increases (typically < productivity)
   }
   ```

2. **Model capital vs labor capture** (2h)
   - Default: 70% of productivity gains → capital, 30% → labor
   - With strong labor policy: 50/50 split
   - With weak labor policy: 90/10 split
   - Track wealth inequality growth from AI productivity

3. **Add policy intervention effects** (2h)
   - UBI: Redistributes capital gains to all
   - Worker ownership: Increases labor's share of gains
   - Retraining: Helps workers capture value in new roles
   - Without intervention: Inequality grows with AI capability

**Parameters to Add:**
```typescript
economicDistribution: {
  baselineLaborShare: 0.62,      // US labor share 2024
  productivityToCapitalRate: 0.7, // 70% to capital without policy
  ubiRedistributionRate: 0.3,     // UBI returns 30% to labor
  workerOwnershipBonus: 0.4       // Worker co-ops increase labor share
}
```

**Deliverables:**
- Labor share tracking system
- Capital capture mechanics
- Policy intervention effects on distribution

---

### Phase 5: Validation & Testing (Month 2, 16 hours)

**Objective:** Validate all mechanics against historical data and research

**Tasks:**

1. **Historical comparison testing** (6h)
   - Compare phase transition to ATM adoption (1970s-1990s)
   - Compare wage decoupling to BLS data (1973-2024)
   - Compare skill retention to educational research
   - Validate displacement rates against automation studies

2. **Sensitivity analysis** (4h)
   - Test parameter ranges (e.g., displacement rate 0.1%-0.5%)
   - Verify model doesn't produce absurd outcomes
   - Check that policy interventions have realistic effects
   - Ensure segments behave differently (elite vs precariat)

3. **Literature comparison** (4h)
   - Run scenarios matching research conditions
   - Compare outcomes to published results
   - Document where model aligns with research
   - Document where model diverges and why

4. **Edge case testing** (2h)
   - Test extreme AI capability (10x human)
   - Test zero policy intervention
   - Test maximum policy intervention
   - Verify all transitions are smooth

**Deliverables:**
- Test suite for all new mechanics
- Validation report comparing to research
- Sensitivity analysis documentation
- Edge case test results

---

### Phase 6: Policy Testing (Month 3, 16 hours)

**Objective:** Test policy interventions and document effectiveness

**Tasks:**

1. **Implement policy levers** (6h)
   - Retraining programs (reduce displacement rate)
   - UBI (redistribute productivity gains)
   - Worker ownership (increase labor share)
   - Teaching support (improve retention)
   - Job guarantees (floor on unemployment)

2. **Run policy scenario comparisons** (6h)
   - Baseline: No intervention
   - UBI only
   - Retraining only
   - Combined interventions
   - Compare outcomes across scenarios

3. **Document effectiveness** (4h)
   - Which policies most effective at reducing inequality?
   - Which policies best for employment?
   - Which policies best for skill development?
   - What's the cost-benefit tradeoff?

**Deliverables:**
- Policy intervention mechanics
- Scenario comparison results
- Policy effectiveness documentation
- Recommendations for model users

---

## File Structure

```
plans/
  bionic-skills-research-grounding.md           (this file)
  bionic-skills-phase-transition.md            (detailed Phase 2 plan)
  bionic-skills-competence-tracking.md         (detailed Phase 3 plan)
  bionic-skills-economic-distribution.md       (detailed Phase 4 plan)

reviews/
  bionic-skills-hopeful-research-foundation-20251016.md  (22 studies, full citations)
  bionic-skills-research-summary-20251016.md             (executive summary)
  bionic-skills-action-plan-20251016.md                  (detailed timeline)

src/simulation/
  bionicSkills.ts                              (existing implementation)
  phaseTransition.ts                           (new - Phase 2)
  skillRetention.ts                            (new - Phase 3)
  economicDistribution.ts                      (new - Phase 4)
```

---

## Integration with Existing Systems

### Connects To:
- **unemployment calculations** (Phase 2 displacement)
- **heterogeneous population segments** (Phase 3 scaffolding, Phase 4 distribution)
- **policy system** (Phase 2-4 interventions)
- **quality of life calculations** (all phases affect QoL)
- **inequality tracking** (Phase 4 wealth distribution)

### Does NOT Change:
- Current AI amplification mechanics (validated by research)
- Differential benefits by skill level (validated by research)
- Access inequality modeling (validated by research)
- Task-specific effects (validated by research)

---

## Success Criteria

**Phase 2 (Phase Transition):**
- ✅ Displacement timeline matches historical automation (5-10 years)
- ✅ Unemployment effects are realistic (5-15% over substitution phase)
- ✅ Policy interventions can slow/prevent displacement

**Phase 3 (Competence Tracking):**
- ✅ Performance-competence gap emerges over time
- ✅ Scaffolding quality affects retention rates
- ✅ Elite segments retain skills better than precariat

**Phase 4 (Economic Distribution):**
- ✅ Productivity-wage gap matches historical data (1973-2024)
- ✅ Without policy, capital captures 70%+ of gains
- ✅ Policy interventions can redistribute to labor

**Overall:**
- ✅ Model produces both optimistic AND pessimistic outcomes (depends on policy)
- ✅ All mechanics backed by peer-reviewed research
- ✅ No science fiction elements (no BCIs, no "merger")
- ✅ TRL 8-9 for all core mechanics

---

## Research Citations (Key Studies)

**Programming Productivity:**
- Peng et al. (2023). "The Impact of AI on Developer Productivity: Evidence from GitHub Copilot." Microsoft Research. n=95, RCT. Result: 55.8% faster coding.

**Writing Productivity:**
- Noy, S., & Zhang, W. (2023). "Experimental evidence on the productivity effects of generative artificial intelligence." Science, 381(6654), 187-192. n=453, RCT. Result: 40% time reduction, inequality DECREASED.

**Learning Enhancement:**
- Meta-analysis (2025). Nature portfolio. 51 studies. Effect size g=0.867 (large).

**Phase Transition:**
- Acemoglu, D., & Restrepo, P. (2022). "Tasks, Automation, and the Rise in U.S. Wage Inequality." Econometrica, 90(5), 1973-2016. Result: 50-70% of wage inequality from automation.

**Skill Retention:**
- Cognitive Research (2024). "Students with AI scored 48-127% better initially, scores plummeted on retention tests."
- MDPI (2023). "AI inhibits on-the-job learning" - illusion of understanding.

**Economic Distribution:**
- Brookings (2024). Labor economics: Productivity +77%, wages +12% (1973-2024).

**Full citations:** See `/reviews/bionic-skills-hopeful-research-foundation-20251016.md`

---

## Timeline Summary

**Month 1 (Weeks 1-4):** 20 hours
- Week 1: Terminology & documentation (8h)
- Weeks 2-4: Phase transition mechanics (12h)

**Month 2 (Weeks 5-8):** 30 hours
- Weeks 5-6: Competence tracking (8h)
- Weeks 7-8: Economic distribution (6h)
- Validation & testing (16h)

**Month 3:** 16 hours
- Policy testing & documentation (16h)

**Total:** 78 hours over 3 months

---

**Status:** Ready for implementation after P0/P1/P2 baseline fixes
**Next Steps:** Create detailed phase plans, integrate with master roadmap
**Priority:** Medium (after critical bugs and empirical validation)
