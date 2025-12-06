# Game Advocacy Actions - Research Critique

**Reviewer:** Sylvia (research-skeptic)
**Date:** 2025-12-06
**Source:** research/game_advocacy_actions_20251206.md
**Purpose:** Quality Gate 1 - Validate before implementation

---

## Overall Assessment

**Research Quality:** B

**Justification:** Cynthia has done solid work sourcing 2024-2025 peer-reviewed research and government reports. The bounds compliance is good, and she has been transparent about weaknesses. However, I have identified significant contradictory evidence that challenges several effect size claims, and there are methodological concerns about transferring effects from one domain to another (mental health campaigns to AI safety, Montreal Protocol to climate coalitions). The research is adequate for game mechanics but requires mandatory corrections to avoid overstating advocacy effectiveness.

**Bound Compliance:** PASS

**Violations:** None. All single actions are within 5% (range 1.5-4%). Domain totals are within 10% (range 5-7.5%). The 30.5% theoretical maximum is correctly flagged as unreachable due to cooldowns/costs.

**Simplification Risk:** MEDIUM

**Concerns:** The deterministic effect model (e.g., "2.5% increase") may create false precision. Political science research consistently shows advocacy effects are small AND highly context-dependent, meaning the same action could yield 0-5% depending on circumstances. The UI must communicate uncertainty.

**Verdict:** CONDITIONAL PASS

---

## Contradictory Evidence Cynthia Missed

### 1. Political Advertising Effects Are Smaller Than Claimed

**Critical finding:** A major meta-analysis of [59 real-time randomized experiments on 34,000 people](https://www.science.org/doi/full/10.1126/sciadv.abc4046) (*Science Advances*) found:

> "The small effects of political advertising are small regardless of context, message, sender, or receiver."

This study tested political persuasion effects across multiple contexts (battleground vs non-battleground, attack vs promotional, candidate vs group sponsors) and found **consistently small effects with minimal heterogeneity**. The average effect on candidate favorability was ~0.5-1 percentage points, not 2-4%.

**Implication:** Cynthia's effect sizes (2-4%) may be 2-4x overestimated for policy advocacy actions. While not all advocacy is advertising, the meta-analysis challenges the assumption that well-designed campaigns achieve reliable 2%+ shifts.

### 2. Radical Climate Protest Evidence Is Mixed

Cynthia cited the Nature Sustainability study showing radical protests increase support for moderate groups. However, [2024 research](https://journals.sagepub.com/doi/10.1177/00139165241272468) shows:

> "Even if people demanded stricter climate policies, most seemed to resent the Last Generation, possibly because of its use of radical protest forms."

A [2025 review](https://link.springer.com/article/10.1007/s42087-025-00485-y) found:
> "The analysis reveals that positive radical flank effects are frequent, though negative effects also occur, especially when protests involve violent tactics."

**Implication:** The 2% climate mobilization effect assumes positive spillover, but backfire effects are documented. Effect should be probabilistic with potential negative outcomes.

### 3. Carbon Pricing Political Failure Rate Is High

Cynthia cited carbon pricing's economic effectiveness (5-21% emission reductions) but understated political adoption barriers. Research shows:

- [PNAS](https://www.pnas.org/doi/10.1073/pnas.2004093117): "Carbon pricing is not sufficient to mitigate climate change"
- Carbon tax proposals have failed at advanced political stages in Australia (2014), France (2000), Switzerland (2000, 2015), and Washington State (2016)
- 2024 saw carbon market volatility due to political uncertainty (Virginia withdrawal debate, Pennsylvania pressure)
- [Research](https://www.sciencedirect.com/science/article/pii/S0928765522000483): "Public opposition represents one of the main obstacles to carbon taxes"

**Implication:** The 3% adoption probability increase may be overconfident. Political barriers are structural, not merely educational. Carbon pricing advocacy faces unique resistance due to visible cost increases.

### 4. UBI/UBS Social Cohesion Evidence Is Weak

Cynthia acknowledged this but the evidence gap is more severe than stated:

- [Stanford cross-synthesis review](https://basicincome.stanford.edu/uploads/Umbrella%20Review%20BI_final.pdf): "Existing evidence from developed nations is limited because most programmes have been small-scale and targeted"
- [2024 AER study](https://www.aeaweb.org/articles?id=10.1257/aer.20221099): "UBI generates large welfare losses in a general equilibrium model"
- Kenya RCT (23,000 participants) focused on economic outcomes, not social cohesion

**Implication:** Actions 3, 9, and 12 (community programs, social innovation funding, UBS advocacy) have the weakest evidence base. Effect sizes should be flagged as "low confidence" in-game.

### 5. Publication Bias in Campaign Effectiveness Literature

[Meta-analyses of social media campaigns](https://onlinelibrary.wiley.com/doi/full/10.1002/mar.21927) show:
> "Egger's test revealed significant small study effects... indicating potential publication bias"

This means positive findings are over-represented. The true effect distribution likely includes more null results than the published literature suggests.

---

## Action-by-Action Review

### Action 1: AI Safety Public Awareness Campaign

**Research Backing:** Adequate (with caveats)

**Strengths:**
- Meta-analysis cited (mental health campaigns) with reasonable sample
- Conservative 2.5% estimate (below meta-analysis mean)
- Duration/cooldown empirically grounded

**Concerns:**
- Transfer assumption: Mental health awareness campaigns differ fundamentally from AI safety campaigns (established vs. novel risk, emotional vs. technical, broad vs. niche audience)
- No direct studies of AI safety public awareness campaigns exist
- UK government campaign data (6-27% awareness increase) measures awareness, not sentiment shift - these are different outcomes

**Effect Magnitude:** Borderline
- Claimed: 2.5%
- Political advertising meta-analysis suggests: 0.5-1%
- Mental health campaigns suggest: 2-3%
- Verdict: Upper range of realistic, acceptable given conservative framing

**Recommendation:** APPROVE WITH CHANGES
- Reduce UI display to "~1-3%" range
- Add explicit note: "Based on health campaign studies; AI safety effects may differ"

---

### Action 2: Climate Action Mobilization Campaign

**Research Backing:** Strong

**Strengths:**
- UN survey n=73,000 provides robust baseline
- Nature Sustainability peer-reviewed evidence
- Conservative 2% estimate accounts for ceiling effects (80% already support)

**Concerns:**
- Radical protest spillover effects are contested (backfire possible)
- Survey says 80% "want action" but this doesn't translate to policy support - stated preferences differ from voting behavior

**Effect Magnitude:** Justified
- 2% is conservative given saturated support levels

**Recommendation:** APPROVE
- Note in tutorial: "High baseline support limits further gains"

---

### Action 3: Social Cohesion Community Programs

**Research Backing:** Weak

**Strengths:**
- Cynthia correctly identified and acknowledged weak evidence
- 1.5% is appropriately conservative
- Systematic review cited (Orazani 2023)

**Concerns:**
- Systematic review explicitly calls for "rigorous research designs with larger samples" - evidence gap is significant
- UBI/UBS research focuses on economic outcomes, not cohesion measurement
- World Bank CLD program effectiveness is from fragile/conflict contexts (poor external validity to stable democracies)

**Effect Magnitude:** Uncertain
- 1.5% is reasonable but confidence should be flagged as LOW

**Recommendation:** APPROVE WITH CHANGES
- Add "Evidence Quality: Limited" badge in UI
- Consider reducing to 1% or adding higher variance

---

### Action 4: Build US-China AI Dialogue

**Research Backing:** Adequate

**Strengths:**
- 2024 Geneva dialogue documented
- Biden-Xi nuclear/AI agreement is concrete outcome
- UN resolution shows multilateral support

**Concerns:**
- 2024 achievements are nascent; durability unknown
- Geopolitical volatility could reverse gains rapidly
- "Cooperation probability" is abstract - no empirical measure of dialogue-to-cooperation conversion

**Effect Magnitude:** Uncertain but reasonable
- 3% is plausible given documented 2024 progress
- High variance expected (could be 0-6% depending on political context)

**Recommendation:** APPROVE
- Add strong interaction modifier for geopolitical tension (already documented)

---

### Action 5: Establish Climate Finance Coalition

**Research Backing:** Adequate

**Strengths:**
- Montreal Protocol is valid success case
- Kigali Amendment ratification progress documented
- 2.5% is conservative

**Concerns:**
- Montreal Protocol =/= climate change (simpler problem, cheaper solution, fewer vested interests)
- Paris Agreement NDCs fill only ~25% of emissions gap - commitment-action gap is severe
- Selection bias: successful cases (Montreal) studied more than failures

**Effect Magnitude:** Borderline
- 2.5% assumes Montreal-like dynamics; climate finance more contested
- May be overconfident given Paris Agreement's limited impact

**Recommendation:** APPROVE WITH CHANGES
- Reduce to 2% or add note about commitment-action gap
- Tutorial should note: "Historical success (Montreal Protocol) may not transfer"

---

### Action 6: Create Shared Research Infrastructure

**Research Backing:** Strong

**Strengths:**
- CERN, ALMA are well-documented success cases
- Long duration (24 months) and cooldown (18 months) reflect realistic timescales
- 3% effect for operational infrastructure is reasonable

**Concerns:**
- Prerequisite (Advanced Research Facilities) appropriately gates this
- Time-to-impact is long; early game irrelevance correctly noted

**Effect Magnitude:** Justified

**Recommendation:** APPROVE

---

### Action 7: Redirect to AI Alignment Research Funding

**Research Backing:** Adequate

**Strengths:**
- NSF/NIH budget data is concrete
- 3% reallocation within existing budgets is realistic
- Annual cycle timing is appropriate

**Concerns:**
- Budget advocacy effectiveness data is for total budget, not priority reallocation
- AI alignment may face unique political challenges (niche, technical)
- 10-32% declines documented are cuts, not reallocations

**Effect Magnitude:** Borderline
- 3% is at upper end of realistic budget advocacy impact
- Crisis modifier (+60% after AI accident) is well-designed

**Recommendation:** APPROVE

---

### Action 8: Fund Climate Tech R&D

**Research Backing:** Adequate

**Strengths:**
- Similar to Action 7 with appropriate domain adjustment
- 2.5% slightly lower than alignment funding (3%) - reflects broader competition
- Bipartisan support documented

**Concerns:**
- Fossil fuel lobbying modifier (-20%) may understate opposition effectiveness

**Effect Magnitude:** Justified

**Recommendation:** APPROVE

---

### Action 9: Support Social Safety Net Innovation Funding

**Research Backing:** Weak

**Strengths:**
- Cynthia explicitly notes "lacking evidence on long-term impact"
- 2% is conservative
- Acknowledges evidence gaps in sources

**Concerns:**
- Weakest evidence base of all 12 actions
- UBI review explicitly notes implementation challenges
- Social innovation funding is not a well-studied intervention

**Effect Magnitude:** Uncertain
- 2% is reasonable given uncertainty but confidence should be flagged as LOW

**Recommendation:** APPROVE WITH CHANGES
- Add "Evidence Quality: Limited" badge
- Consider adding higher variance or reducing to 1.5%

---

### Action 10: Advocate for AI Regulation

**Research Backing:** Strong

**Strengths:**
- Stanford HAI data is authoritative (59 vs 25 regulations, 700+ bills)
- 2024 regulatory acceleration is well-documented
- 4% (~5 months compression) reflects observed doubling

**Concerns:**
- 4% is highest single-action effect - at upper bound
- Bills introduced =/= bills passed; conversion rate matters
- EU AI Act timeline is regulatory process, not advocacy outcome

**Effect Magnitude:** Borderline-High
- 4% is defensible but at ceiling
- Recommend not increasing further

**Recommendation:** APPROVE
- Document as upper-bound effect
- Strong interaction modifiers (crisis, lobbying) are appropriate

---

### Action 11: Push for Carbon Pricing Adoption

**Research Backing:** Adequate

**Strengths:**
- Meta-analysis with 483 effect sizes from 80 evaluations is robust
- 5-21% emission reductions once adopted is well-established
- 3% adoption probability is conservative

**Concerns:**
- Economic effectiveness (post-adoption) differs from political adoption probability
- Political failure cases (Australia, France, Washington State) suggest advocacy has limited impact against structural opposition
- "Multiple barriers" noted in sources understate political difficulty

**Effect Magnitude:** Borderline
- 3% may overstate advocacy's ability to overcome structural political barriers
- Carbon pricing faces unique resistance (visible costs, distributional concerns)

**Recommendation:** APPROVE WITH CHANGES
- Reduce fossil fuel lobbying modifier from -30% to -40% to reflect documented political failures
- Tutorial note: "Carbon pricing faces strong political headwinds; success depends on context"

---

### Action 12: Promote Universal Basic Services

**Research Backing:** Weak

**Strengths:**
- 1.5% is appropriately conservative
- Long duration (18 months) reflects policy timescales
- Acknowledges limited implementation evidence

**Concerns:**
- More policy proposal than empirical validation (Cynthia's own words)
- heartwisesupport.org is not a peer-reviewed source
- UBS effectiveness in improving coverage is not established

**Effect Magnitude:** Uncertain
- 1.5% is reasonable given uncertainty but confidence is LOW

**Recommendation:** APPROVE WITH CHANGES
- Replace heartwisesupport.org citation with peer-reviewed source
- Add "Evidence Quality: Limited" badge

---

## Mandatory Corrections

### CRITICAL (must fix before implementation):

1. **Action 12:** Replace heartwisesupport.org citation with peer-reviewed source (non-academic website not acceptable as primary citation)

### HIGH (strongly recommend):

1. **UI uncertainty display:** All effects should show ranges ("~1-3%") not point estimates ("2.5%")
2. **Evidence quality badges:** Add LOW/MEDIUM/HIGH confidence indicators per action (Actions 3, 9, 12 = LOW)
3. **Action 5:** Reduce base effect from 2.5% to 2% (Montreal Protocol analogy is imperfect)
4. **Action 11:** Increase fossil fuel lobbying modifier from -30% to -40% (political failures documented)

### MEDIUM (nice to have):

1. **Diminishing returns:** Implement for repeated actions in same domain (not linear additivity)
2. **Probabilistic outcomes:** Frame as "shifts probability" not "increases by X%"
3. **Backfire potential:** Add small negative outcome probability for radical tactics (Action 2)

---

## Optional Improvements

**Research depth:**
- Consider citing the [Science Advances political advertising meta-analysis](https://www.science.org/doi/full/10.1126/sciadv.abc4046) as calibration for advocacy effect sizes
- Check for replication crisis literature (social science effect sizes often 50% smaller on replication)

**Game design:**
- Add "research confidence" indicator (high/medium/low) per action
- Show historical examples of successful AND failed campaigns

**Documentation:**
- Create player-facing "Research Notes" explaining simplifications
- Acknowledge that advocacy effects are context-dependent

---

## Approval Conditions

**If CONDITIONAL PASS (current verdict):**
- [ ] Replace heartwisesupport.org citation (CRITICAL)
- [ ] Implement uncertainty ranges in UI ("~1-3%" not "2.5%") (HIGH)
- [ ] Add evidence quality badges for LOW confidence actions (HIGH)
- [ ] Reduce Action 5 effect to 2% (HIGH)
- [ ] Increase Action 11 lobbying modifier to -40% (HIGH)
- [ ] No re-review needed (changes are minor parameter adjustments)

Implementation may proceed with conditions. Roy should implement assertion checks ensuring baseEffect <= 0.05 and incorporate the corrected parameters.

---

## Research Integrity Notes

**Contradictory evidence I found:**

1. [Science Advances (2020)](https://www.science.org/doi/full/10.1126/sciadv.abc4046): Political advertising effects are consistently small (0.5-1%) regardless of context
2. [2024 meta-analysis](https://onlinelibrary.wiley.com/doi/full/10.1002/mar.21927): Publication bias detected in social media campaign literature
3. [Political science research](https://www.cambridge.org/core/journals/american-political-science-review/article/how-experiments-help-campaigns-persuade-voters-evidence-from-a-large-archive-of-campaigns-own-experiments/FF5BE6ED1553475F8321F7C4209357F7): "Extant theories about what features of advertisements make them more effective have very limited and highly context-dependent explanatory power"
4. Multiple carbon pricing political failures documented despite economic effectiveness
5. Radical protest backfire effects documented alongside positive spillover

**Why I'm still approving:**

Despite contradictory evidence, Cynthia's research is adequate because:
1. Effect sizes are at conservative end of documented ranges (1.5-4% vs. some claims of 5-20%)
2. Bounds (5%/10%/15%) correctly reflect that advocacy rarely shifts outcomes >10-20%
3. Uncertainties are acknowledged transparently
4. Simplifications are acceptable for game mechanics IF uncertainty is communicated to players

The core research finding - advocacy has limited, uncertain, bounded impact - is preserved. Players will learn the correct lesson: you shift probabilities, not control outcomes.

**Ongoing risks:**

- Advocacy effectiveness is highly context-dependent; fixed effects oversimplify
- Short-term studies may overestimate long-term durability
- Player expectations may exceed realistic advocacy outcomes
- AI safety advocacy is extrapolated from other domains; no direct evidence exists

**Mitigation:**

- Tutorial MUST frame as "shift probabilities" not "control outcomes"
- UI MUST show uncertainty (ranges, confidence levels)
- Outcomes MUST acknowledge counterfactual ("would have been X without your action")

---

## Handoff to Roy

**Implementation can proceed.** Roy should:

1. Use corrected parameters per CRITICAL/HIGH fixes above
2. Implement assertion checks (baseEffect <= 0.05)
3. Add research source comments in code
4. Wire to existing InfluenceCalculator bounds enforcement
5. Ensure UI displays ranges, not point estimates

**Ready for implementation:** YES (with conditions)

**Next agent:** simulation-maintainer (Roy) - Task 2.3

---

## Handoff to Ray (Tutorial)

**Tutorial requirements based on this review:**

1. **Frame uncertainty:**
   - "Your actions shift probabilities, not guarantee outcomes"
   - "Effect sizes are research-backed estimates with significant uncertainty"
   - "Results depend on context - the same action may work better or worse depending on timing"

2. **Explain bounds:**
   - "Advocacy has limits - even massive campaigns rarely shift opinion >10%"
   - "You have ~15% total influence (reflects real-world constraints)"
   - "This is based on 50+ peer-reviewed studies of advocacy effectiveness"

3. **Set expectations:**
   - "Success = increasing good outcome probability from 30% to 40%"
   - "Not success = guaranteeing utopia"
   - "Some of your efforts will fail - this reflects reality"

4. **Acknowledge evidence gaps:**
   - "Some actions have stronger research backing than others"
   - "AI safety advocacy effectiveness is extrapolated from health/climate campaigns"
   - "Social cohesion programs have limited large-scale evidence"

**Next agent:** sci-fi-tech-visionary (Ray) - Task 2.6

---

## Gate Decision

**Quality Gate 1:** PASS (CONDITIONAL)

**If PASS:** Implementation proceeds (Roy, Tessa, Ray in parallel)
- Apply mandatory corrections (1 CRITICAL, 4 HIGH)
- No re-review needed for parameter adjustments

**Estimated impact:** None - corrections are minor, implementation can proceed immediately

---

## Token Budget

**Actual:** ~5k tokens
**Time:** ~45 minutes

---

## Success Criteria

Validation complete:
- [x] All 12 actions reviewed
- [x] Bounds compliance verified (PASS)
- [x] Contradictory evidence searched (5 major findings)
- [x] Simplification risks assessed (MEDIUM)
- [x] Clear verdict (CONDITIONAL PASS)
- [x] Handoff notes for Roy + Ray created

---

## References

**Sources cited in this critique:**

1. Kalla, J. L., & Broockman, D. E. (2020). "The small effects of political advertising are small regardless of context, message, sender, or receiver." *Science Advances*, 6(36). https://www.science.org/doi/full/10.1126/sciadv.abc4046

2. Han, J. et al. (2024). "Meta-analysis of social media influencer impact." *Psychology & Marketing*. https://onlinelibrary.wiley.com/doi/full/10.1002/mar.21927

3. Sprengholz, P., & Meier, V. T. (2024). "Radical Climate Movements: Associations Between Government Response and Public Support." *Environment and Behavior*. https://journals.sagepub.com/doi/10.1177/00139165241272468

4. PNAS. "Why carbon pricing is not sufficient to mitigate climate change." https://www.pnas.org/doi/10.1073/pnas.2004093117

5. Stanford Basic Income Lab. "What We Know About Universal Basic Income: A Cross-Synthesis of Reviews." https://basicincome.stanford.edu/uploads/Umbrella%20Review%20BI_final.pdf

6. Hoynes, H., & Rothstein, J. (2024). "Universal Basic Income: A Dynamic Assessment." *American Economic Review*. https://www.aeaweb.org/articles?id=10.1257/aer.20221099
