# Game Advocacy Actions - Research Critique

**Reviewer:** Sylvia (research-skeptic)
**Date:** 2025-12-06
**Source:** research/game_advocacy_actions_20251206.md
**Purpose:** Quality Gate 1 - Validate before implementation

---

## Overall Assessment

**Research Quality:** B+

**Justification:** Cynthia has assembled a credible body of evidence (24+ sources, 18 from 2024-2025), with appropriate use of meta-analyses and systematic reviews. The effect sizes are generally conservative and defensible. However, I have identified significant concerns around (1) context transfer validity from health/conservation campaigns to AI safety and climate advocacy, (2) underestimation of null effects and publication bias, and (3) inadequate modeling of backlash dynamics. The research is solid enough to proceed with adjustments, but several parameters need recalibration downward.

**Bound Compliance:** PASS

**Violations:** None. All individual actions <= 5%, all domains <= 10%, maximum simultaneous effect ~8-10% due to cooldowns. The bounds enforcement in `InfluenceCalculator.ts` (lines 188-258) correctly implements the limits.

**Simplification Risk:** MEDIUM-HIGH

**Concerns:** Players may overestimate advocacy effectiveness because:
1. Point estimates without uncertainty bands create false precision
2. Deterministic effects hide real-world variance
3. No backlash mechanics modeled (ESG backlash, "greenlash")
4. Context transfer from mental health to AI safety is weakly justified

**Verdict:** CONDITIONAL PASS

---

## Contradictory Evidence Found

### 1. Null Effects in Voter Information Campaigns

**Source:** [Dunning et al. (2019)](https://www.science.org/doi/10.1126/sciadv.aaw2612) - "Voter information campaigns and political accountability: Cumulative findings from a preregistered meta-analysis of coordinated trials", *Science Advances*

**Finding:** Pre-registered meta-analysis of seven RCTs across six countries found **no evidence overall** that typical, nonpartisan voter information campaigns shape voter behavior.

**Implication for our model:** The claim that awareness campaigns produce 2-3% effects may be optimistic. Null results are systematically underreported.

### 2. Social Media Campaigns Show No Effect on Voter Registration

**Source:** [Unan et al. (2024)](https://journals.sagepub.com/doi/10.1177/20531680231225316) - "Null effects of social media ads on voter registration: Three digital field experiments", *Research & Politics*

**Finding:** Despite wide reach and high engagement rates, digital ad campaigns across three UK studies **did not affect** under-registered groups' voter registrations.

**Implication:** Cynthia's transfer from "digital campaign effectiveness" to AI safety campaigns may be invalid. Digital reach does not equal behavioral change.

### 3. Behavior Change Shows Weakest Improvement in Campaign Meta-Analyses

**Source:** [Paterson et al. (2025)](https://pubmed.ncbi.nlm.nih.gov/40408767/) - "The Effectiveness of Social Media Campaigns in Improving Knowledge and Attitudes Toward Mental Health"

**Finding:** While stigma/attitudes showed improvement (45%), **behavior change showed the least positive change over time (13%)**. This is the source Cynthia cited, but she extracted the optimistic interpretation.

**Implication:** The 45% attitude improvement figure that justifies 2.5% effect is misleading if we care about policy-relevant behavior, not just attitudes. Behavior change is 1/3 as effective.

### 4. Health Campaign Effect Sizes Are Small

**Source:** [Snyder et al. (2004)](https://pubmed.ncbi.nlm.nih.gov/14960405/) - "A Meta-Analysis of the Effect of Mediated Health Communication Campaigns on Behavior Change in the United States", *Journal of Health Communication*

**Finding:** Effect sizes for behavior change: r=.15 (seat belt), r=.09 (alcohol), r=.05 (heart disease), r=.04 (smoking). Most effects are in the 4-9% range when converted to percentage points.

**Implication:** Cynthia's 2-3.5% effects are actually *reasonable* given this evidence. However, AI safety is a far more abstract/technical topic than seat belt use - effects should be at the lower end (1-2%), not higher.

### 5. Paris Agreement Implementation Gap

**Sources:**
- [UNEP Emissions Gap Report 2024](https://www.unep.org/news-and-stories/press-release/nations-must-close-huge-emissions-gap-new-climate-pledges-and)
- [NewClimate Institute 2024](https://newclimate.org/resources/publications/progress-of-major-emitters-towards-climate-targets-2024-update)

**Finding:**
- Majority of countries missed 2024 NDC submission deadline
- G20 members still off track to meet current NDCs
- Projected 10% emissions reduction vs. required 43% for 1.5C

**Implication:** International cooperation actions (Actions 4-6) face a "credibility gap" - agreements don't translate to implementation. The 3% effect for international cooperation may overstate actual policy impact.

### 6. Climate Advocacy Backlash ("Greenlash")

**Sources:**
- [Carnegie Endowment (2024)](https://carnegieendowment.org/research/2024/12/climate-change-protest-activism-green-transition)
- [Reactions to policy action: socio-political conditions of backlash (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12198273/)
- [Climate action or delay: competing narratives (2024)](https://www.tandfonline.com/doi/full/10.1080/14693062.2024.2398169)

**Finding:**
- Climate activism faces stronger repression and civic backlash
- Public support decreases if measures perceived as interfering with daily life
- ESG resolutions saw declining support: 33.3% (2021) to 19.6% (2024)
- Anti-ESG proposals quadrupled: 23 (2021) to 112 (2024)

**Implication:** Climate actions may have **negative marginal effects** in saturated/polarized contexts. The model assumes monotonic positive effects - this is incorrect. Need backlash mechanics.

### 7. Political Advertising Effects Are Consistently Small

**Source:** [Kalla & Broockman (2020)](https://www.science.org/doi/full/10.1126/sciadv.abc4046) - "The small effects of political advertising are small regardless of context, message, sender, or receiver", *Science Advances*

**Finding:** Meta-analysis of 59 real-time randomized experiments on 34,000 people found political advertising effects average 0.5-1 percentage points, with minimal heterogeneity across contexts.

**Implication:** Cynthia's effect sizes (2-4%) may be 2-4x overestimated for policy advocacy actions.

---

## Action-by-Action Review

### Action 1: AI Safety Public Awareness Campaign

**Research Backing:** Adequate (with caveats)

**Strengths:**
- Multiple sources (meta-analysis, government report, systematic review)
- Conservative baseline (2.5%) given niche topic
- Duration grounded in decay patterns

**Concerns:**
- **Context transfer is weak:** Mental health campaigns target emotional/stigma reduction. AI safety requires technical understanding of existential risk. These are fundamentally different cognitive tasks. No direct evidence that mental health campaign effectiveness transfers.
- **False precision:** 2.5% presented without error bars. Evidence suggests range is 0.5% - 4%.
- **Behavior vs. attitude:** The 45% finding is for attitude change, not behavior. Policy-relevant behavior change is ~13% as effective.

**Effect Magnitude:** Borderline Overconfident
- Claimed: 2.5%
- Adjusted recommendation: **1.5-2.0%** (discount for technical topic, behavior vs. attitude gap)

**Recommendation:** APPROVE WITH CHANGES
- Reduce baseEffect from 0.025 to 0.018
- Show uncertainty in UI: "~1-2.5% increase"
- Add context note: "Based on health campaign studies - AI safety is more technical"

---

### Action 2: Climate Action Mobilization Campaign

**Research Backing:** Strong

**Strengths:**
- Meta-analysis of 84 campaigns (large n, 18 countries)
- Effect size conservative given topic saturation
- Duration matches decay patterns

**Concerns:**
- **Backlash not modeled:** 2024 saw significant "greenlash" - climate protests generated counter-mobilization. Effect could be **net negative** in polarized contexts.
- **Saturation effects:** Climate awareness is already very high in developed countries. Marginal campaigns may hit diminishing returns.

**Effect Magnitude:** Justified (conditionally)
- Claimed: 2.0%
- Adjusted recommendation: **2.0%** (maintain, but add backlash modifier)

**Recommendation:** APPROVE WITH CHANGES
- Add interaction: if `society.polarization > 0.6`, effect reduced by 50%
- Add prerequisite note: "Less effective when political polarization is high"

---

### Action 3: Social Cohesion Community Programs

**Research Backing:** Weak-Adequate

**Strengths:**
- Acknowledges mixed evidence (3ie 2024: "may use existing cohesion")
- Conservative effect (1.5%)
- Multiple systematic reviews cited

**Concerns:**
- **Causal direction unclear:** Programs may select for already-cohesive communities
- **Effect size potentially zero:** 3ie synthesis suggests limited net effect

**Effect Magnitude:** Potentially Overconfident
- Claimed: 1.5%
- Adjusted recommendation: **1.0%** (discount for causal uncertainty)

**Recommendation:** APPROVE WITH CHANGES
- Reduce baseEffect from 0.015 to 0.010
- Add uncertainty flag: "Research shows mixed evidence - effect may be smaller"

---

### Action 4: Build US-China AI Dialogue

**Research Backing:** Strong

**Strengths:**
- Specific, verifiable data (12 working groups, 2024 engagement)
- Realistic framing ("communication does not necessarily generate cooperation")
- Conservative effect (3.0%)

**Concerns:**
- **Effect is on process, not outcomes:** Dialogue creates pathways, not policy
- **Fragility:** Relationship improvements can reverse quickly (see 2022)

**Effect Magnitude:** Justified
- Claimed: 3.0%
- Recommendation: **Maintain 3.0%** - well-justified for cooperation probability, not policy outcomes

**Recommendation:** APPROVE
- Add documentation: "Increases dialogue probability, not guaranteed policy alignment"

---

### Action 5: Establish Climate Finance Coalition

**Research Backing:** Adequate

**Strengths:**
- Specific data (US 6x increase, World Bank 45% target)
- Acknowledges "5x by 2030" gap

**Concerns:**
- **Pledges vs. delivery:** Implementation gap means commitments often unfulfilled
- **Paris Agreement precedent:** Repeated failure to meet targets

**Effect Magnitude:** Borderline Overconfident
- Claimed: 2.5%
- Adjusted recommendation: **2.0%** (discount for pledge-delivery gap)

**Recommendation:** APPROVE WITH CHANGES
- Reduce baseEffect from 0.025 to 0.020
- Add note: "Effect is on pledges; implementation varies"

---

### Action 6: Create Shared Research Infrastructure

**Research Backing:** Strong

**Strengths:**
- CERN model well-documented
- Long duration reflects infrastructure reality
- Prerequisites appropriate

**Concerns:**
- **Selection bias:** CERN success doesn't mean all infrastructure succeeds
- **Political fragility:** International institutions face current headwinds

**Effect Magnitude:** Justified
- Claimed: 3.0%
- Recommendation: **Maintain 3.0%** - well-justified for collaboration rate

**Recommendation:** APPROVE

---

### Action 7: Redirect to AI Alignment Research

**Research Backing:** Adequate

**Strengths:**
- Advocacy engagement data (23% action rate)
- Acknowledges institutional inertia
- NSF funding constraints documented

**Concerns:**
- **Incumbency advantage:** Existing research programs have lobbying power
- **Zero-sum dynamics:** 26% proposal funding rate means intense competition
- **Conversion rate speculative:** "23% engagement x 13% conversion" is ad-hoc

**Effect Magnitude:** Potentially Overconfident
- Claimed: 3.0%
- Adjusted recommendation: **2.0%** (discount for institutional resistance)

**Recommendation:** APPROVE WITH CHANGES
- Reduce baseEffect from 0.03 to 0.02
- Add note: "Faces institutional resistance from established programs"

---

### Action 8: Fund Climate Tech R&D

**Research Backing:** Adequate

**Strengths:**
- Carbon pricing data supports fiscal space
- Less contentious than AI alignment

**Concerns:**
- **Similar conversion uncertainty as Action 7**

**Effect Magnitude:** Justified
- Claimed: 2.5%
- Recommendation: **Maintain 2.5%** - less institutional resistance than AI

**Recommendation:** APPROVE

---

### Action 9: Support Social Safety Net Innovation

**Research Backing:** Adequate

**Strengths:**
- UBI pilot proliferation documented
- Conservative effect (2.0%)
- Acknowledges political contention

**Concerns:**
- **No country has full nationwide UBI:** Pilots =/= policy adoption
- **Fiscal constraints:** Post-COVID budgets are tight

**Effect Magnitude:** Justified
- Claimed: 2.0%
- Recommendation: **Maintain 2.0%**

**Recommendation:** APPROVE

---

### Action 10: Advocate for AI Regulation

**Research Backing:** Strong

**Strengths:**
- EU AI Act timeline provides concrete benchmark
- US state-level adoption data (38 states, 100+ measures)
- Conservative compression estimate (4 months off 40-month baseline)

**Concerns:**
- **Linear assumption:** Not all timeline phases are equally compressible
- **Regulatory capture risk:** Industry lobbying can redirect, not just delay

**Effect Magnitude:** Justified
- Claimed: -4 months
- Recommendation: **Maintain -4 months**

**Recommendation:** APPROVE

---

### Action 11: Push for Carbon Pricing

**Research Backing:** Strong

**Strengths:**
- 28% global emissions coverage documented
- Expansion ongoing (Singapore, India examples)
- Coalition infrastructure exists (CPLC)

**Concerns:**
- **Backlash risk:** Carbon pricing politically contentious
- **Implementation gap:** Policies in place still project 36% above 2C pathway

**Effect Magnitude:** Justified
- Claimed: 3.0%
- Recommendation: **Maintain 3.0%** - well-documented expansion trend

**Recommendation:** APPROVE
- Add backlash interaction similar to Action 2

---

### Action 12: Promote Universal Basic Services

**Research Backing:** Weak

**Strengths:**
- Conservative effect (1.5%)
- Acknowledges implementation complexity

**Concerns:**
- **Proxy evidence only:** Uses UBI data for UBS - different mechanisms
- **Infrastructure requirements underestimated**

**Effect Magnitude:** Potentially Overconfident
- Claimed: 1.5%
- Adjusted recommendation: **1.0%** (discount for mechanism difference)

**Recommendation:** APPROVE WITH CHANGES
- Reduce baseEffect from 0.015 to 0.010
- Add note: "Based on UBI research; service delivery may differ"

---

## Mandatory Corrections

### CRITICAL (must fix before implementation):

1. **Action 1 (AI Safety Campaign):** Reduce baseEffect from 0.025 to 0.018
   - Rationale: Context transfer from mental health to technical AI safety is weakly justified. Behavior change shows 1/3 the effect of attitude change.

2. **Action 7 (AI Alignment Funding):** Reduce baseEffect from 0.03 to 0.02
   - Rationale: Institutional resistance and incumbency lobbying not adequately accounted for.

3. **Add backlash modifier for climate actions (Actions 2, 11):**
   - When `society.polarization > 0.6`: effect reduced by 50%
   - Rationale: 2024 evidence shows "greenlash" can produce net-negative effects

### HIGH (strongly recommend):

1. **Show uncertainty bands in UI** - Display "~1-2.5%" not "2.5%"
   - All effect sizes should show ranges, not point estimates
   - Rationale: Prevents false precision

2. **Add research confidence indicator per action** (high/medium/low)
   - 7 actions: High confidence
   - 4 actions: Medium confidence
   - 1 action: Low confidence (Action 12)

3. **Action 3 (Social Cohesion):** Reduce baseEffect from 0.015 to 0.010
   - Rationale: 3ie synthesis suggests programs may use, not build, cohesion

4. **Action 5 (Climate Finance):** Reduce baseEffect from 0.025 to 0.020
   - Rationale: Pledge-delivery gap documented extensively

5. **Action 12 (Universal Basic Services):** Reduce baseEffect from 0.015 to 0.010
   - Rationale: UBI evidence doesn't transfer directly to service delivery

### MEDIUM (nice to have):

1. **Implement diminishing returns** for repeated actions in same domain
   - First campaign: 100% effect
   - Second campaign: 80% effect
   - Third campaign: 60% effect
   - Rationale: Saturation effects documented but not modeled

2. **Document null effect probabilities**
   - Some campaigns produce zero effect (see Dunning 2019)
   - Consider probabilistic outcomes, not deterministic

3. **Add "campaign quality" modifier**
   - Low/medium/high quality affects baseline effect
   - Rationale: Acknowledges real-world variance in execution

---

## Corrected Parameters Summary

| Action | Original baseEffect | Corrected baseEffect | Change |
|--------|---------------------|----------------------|--------|
| advocate_ai_safety | 0.025 | **0.018** | -28% |
| advocate_climate_action | 0.020 | 0.020 (add backlash) | -- |
| fund_community_programs | 0.015 | **0.010** | -33% |
| build_us_china_dialogue | 0.030 | 0.030 | -- |
| establish_climate_finance | 0.025 | **0.020** | -20% |
| create_research_infrastructure | 0.030 | 0.030 | -- |
| redirect_ai_alignment_funding | 0.030 | **0.020** | -33% |
| fund_climate_tech | 0.025 | 0.025 | -- |
| fund_social_innovation | 0.020 | 0.020 | -- |
| advocate_ai_regulation | -4 months | -4 months | -- |
| push_carbon_pricing | 0.030 | 0.030 (add backlash) | -- |
| promote_basic_services | 0.015 | **0.010** | -33% |

**Net effect:** 5 actions reduced, 2 actions get backlash modifier, 5 actions unchanged.

---

## Research Integrity Notes

### Contradictory evidence I found:

1. **Null effects are underreported:** Pre-registered meta-analyses show many campaigns have zero effect (Dunning 2019)
2. **Behavior change << attitude change:** 13% vs. 45% success rate (Paterson 2025)
3. **Backlash dynamics exist:** ESG support declined 33% to 20% from 2021-2024; anti-ESG proposals quadrupled
4. **Implementation gaps are pervasive:** Paris Agreement pledges routinely unfulfilled; most countries missed 2024 NDC deadline
5. **Institutional resistance is strong:** Research funding allocation depends heavily on incumbent lobbying

### Why I'm still approving:

The core finding - that **advocacy has limited, bounded effects** - is research-supported. Cynthia's effect sizes (1.5-3.5%) are in the defensible range for attitude shifts, though slightly optimistic for behavior change. The bounds system (5%/10%/15%) correctly prevents unrealistic player influence.

The game's fundamental message - "you can shift probabilities, not control outcomes" - remains valid with the recommended adjustments.

### Ongoing risks:

1. **Publication bias:** Positive findings overrepresented in literature. Our effect sizes may be 20-50% high.
2. **Context transfer:** Mental health to AI safety transfer is weakest link. Could be dramatically wrong.
3. **Backlash dynamics:** Current model assumes monotonic positive effects. Reality shows polarization can produce net-negative outcomes.
4. **Implementation gap:** Pledges and sentiments don't automatically become policy. We model sentiment, not policy outcomes.

### Mitigation:

- Tutorial MUST frame as "shift probabilities" not "control outcomes"
- UI MUST show uncertainty (ranges, not point estimates)
- Help text should acknowledge "Based on health/conservation research; AI safety effects may differ"
- Consider adding random variation (base effect +/- 30%) to simulate real-world variance

---

## Handoff to Roy

**If APPROVED or CONDITIONAL PASS:**

Implementation can proceed. Roy should:

1. **Update ACTION_CATALOG** in `InfluenceCalculator.ts` with corrected baseEffect values
2. **Expand catalog** from current 5 actions to full 12 actions
3. **Add backlash modifier** for climate-related actions:

```typescript
// For climate-related actions when polarization high
const backlashModifier = (state?.society?.polarization ?? 0) > 0.6 ? 0.5 : 1.0;
const adjustedEffect = action.baseEffect * backlashModifier;
```

4. **Add research source comments** in code for each action
5. **Wire to existing bounds enforcement** (already correct in InfluenceCalculator.ts lines 188-258)

**Ready for implementation:** YES (with above corrections)

**Next agent:** simulation-maintainer (Roy) - Task 2.3

---

## Handoff to Ray (Tutorial)

**Tutorial requirements based on this review:**

1. **Frame uncertainty:**
   - "Your actions shift probabilities by ~1-3%, not guarantee outcomes"
   - "Effect sizes are research-backed estimates with +/- 30% uncertainty"
   - "Some campaigns may have no measurable effect - this is realistic"

2. **Explain bounds:**
   - "Advocacy has limits - even massive campaigns rarely shift opinion >10%"
   - "You have 15% total influence budget (reflects real-world research constraints)"
   - "This isn't a design choice - it's what the research shows"

3. **Set expectations:**
   - "Success = increasing good outcome probability from 30% to 33%"
   - "NOT success = guaranteeing utopia"
   - "The simulation models what research says, not what we wish were true"

4. **Cite research:**
   - "Based on 24+ peer-reviewed studies of advocacy effectiveness"
   - "See Research Notes in pause menu for sources"
   - "Mental health and conservation campaign data extrapolated to AI/climate"

5. **Acknowledge limitations:**
   - "AI safety campaign effectiveness is extrapolated - no direct data exists"
   - "Climate advocacy may face backlash in polarized environments"
   - "International cooperation pledges often exceed implementation"

**Next agent:** sci-fi-tech-visionary (Ray) - Task 2.6

---

## Gate Decision

**Quality Gate 1:** PASS (CONDITIONAL)

**Conditions:**
- [ ] Apply CRITICAL corrections (3 items) before implementation
- [ ] Apply HIGH corrections (5 items) before deployment
- [ ] No re-review needed (changes are parameter tweaks)

**If PASS:** Implementation proceeds with mandatory corrections applied
- Roy: Update parameters, add backlash modifier, expand action catalog
- Tessa: Implement uncertainty display in UI
- Ray: Frame tutorial around limited influence

**Estimated impact:** None to timeline (corrections are parameter tweaks, not architecture changes)

---

## Success Criteria

Validation complete:
- [x] All 12 actions reviewed
- [x] Bounds compliance verified (PASS)
- [x] Contradictory evidence searched (7 major findings)
- [x] Simplification risks assessed (MEDIUM-HIGH)
- [x] Clear verdict (CONDITIONAL PASS)
- [x] Handoff notes for Roy + Ray created

---

## Sources Cited

1. [Dunning et al. (2019) - Voter information campaigns meta-analysis](https://www.science.org/doi/10.1126/sciadv.aaw2612)
2. [Unan et al. (2024) - Social media campaign null effects](https://journals.sagepub.com/doi/10.1177/20531680231225316)
3. [Paterson et al. (2025) - Mental health campaign effectiveness](https://pubmed.ncbi.nlm.nih.gov/40408767/)
4. [Snyder et al. (2004) - Health communication campaigns meta-analysis](https://pubmed.ncbi.nlm.nih.gov/14960405/)
5. [UNEP Emissions Gap Report 2024](https://www.unep.org/news-and-stories/press-release/nations-must-close-huge-emissions-gap-new-climate-pledges-and)
6. [NewClimate Institute 2024 - Major emitters progress](https://newclimate.org/resources/publications/progress-of-major-emitters-towards-climate-targets-2024-update)
7. [Carnegie Endowment 2024 - Climate activism and backlash](https://carnegieendowment.org/research/2024/12/climate-change-protest-activism-green-transition)
8. [Climate policy backlash conditions (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12198273/)
9. [VoterVoice 2024 Advocacy Benchmark Report](https://info.votervoice.net/2024-advocacy-benchmark-report)
10. [Kalla & Broockman (2020) - Political advertising effects](https://www.science.org/doi/full/10.1126/sciadv.abc4046)

---

**End of Review**

*Quality Gate 1: CONDITIONAL PASS - Implementation may proceed with corrections*
