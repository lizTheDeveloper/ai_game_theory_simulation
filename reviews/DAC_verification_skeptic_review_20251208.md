# DAC Parameter Verification: Skeptical Review

**Review ID:** c52826e-skeptic
**Original Grade:** B+ (Cynthia)
**Reviewed By:** Sylvia (Research Skeptic)
**Date:** 2025-12-08
**Quality Gate:** QG1-L2 (Layer 2 Critical Validation)

---

## Executive Summary

**Downgraded to B-**. Cynthia's validation was competent but insufficiently critical. The "validated" parameters (activationDelay, T_50) rest on optimistic industry projections, not empirically validated deployment data. The research base is industry-heavy and under-weighted on academic skepticism. Critical failure modes (moral hazard, NIMBYism, cost floor debates) remain unaddressed.

---

## 1. Are the "Validated" Parameters Actually Solid?

### 1.1 activationDelay: 7 years - CONDITIONAL

**Cynthia's verdict:** Validated (A grade)
**My verdict:** CONDITIONAL - optimistic assumption requires guardrails

**Concern:** The 7-year figure comes from Climeworks' own timeline (founded 2009 to first commercial 2017). This is:

1. **Cherry-picked success case.** Climeworks had ideal conditions: strong IP position, supportive European policy, Iceland's geothermal. Other startups (Global Thermostat, Carbon Engineering) have taken 10-15+ years without commercial breakthrough.

2. **Pre-political resistance.** Early DAC plants were small and in politically favorable locations. Gigatonne-scale deployment requires:
   - Industrial-scale facilities in populated areas
   - Massive energy infrastructure co-location
   - Water rights negotiations in stressed regions

3. **No adversarial conditions modeled.** 7 years assumes supportive policy throughout. What if:
   - Carbon pricing collapses (EU ETS has crashed before)
   - "Green" backlash against industrial CDR
   - NIMBY resistance to massive facilities

**Evidence for longer delays:**
- [WRI DAC Report](https://publications.wri.org/scaling-dac-in-the-us): Notes permitting, community acceptance, and infrastructure integration as "key barriers"
- [Mongabay 2024](https://news.mongabay.com/2024/12/direct-air-capture-climate-solution-faces-harsh-criticism-steep-challenges/): "Direct air capture climate solution faces harsh criticism, steep challenges"

**Severity:** MEDIUM
**Recommendation:** activationDelay should have uncertainty range: 7 years (optimistic) to 15 years (realistic with resistance)

---

### 1.2 T_50: 30 years - OPTIMISTIC

**Cynthia's verdict:** Validated (A grade)
**My verdict:** CONDITIONAL - assumes unprecedented scaling rates

**The 1800x problem:** Research file correctly notes DAC must scale from 0.00005 Gt/yr to 4.2 Gt/yr - an 84,000x increase in 26 years. The T_50=30 years parameter for 1 Gt/yr is based on "base case 25% CAGR."

**Historical reality check:**
- **Solar PV (best case):** ~1600x over 24 years (35% CAGR) - this is the fastest energy technology scale-up in history
- **Wind:** ~55x over 24 years (18% CAGR)
- **Nuclear:** Essentially flat for 30 years ([Ember 2024](https://ember-energy.org/chapter/2024-in-review/))

**DAC requires 50% faster scaling than solar PV at its absolute peak.** For a technology that is:
- More capital-intensive per unit output
- More energy-intensive per unit output
- More resource-constrained (water in optimal solar locations)

**ETH Zurich 2024 study** ([ScienceDaily](https://www.sciencedaily.com/releases/2024/03/240304135808.htm)): "Cost of direct air carbon capture to remain higher than hoped" - suggests cost trajectories are more pessimistic than industry claims.

**Severity:** MEDIUM-HIGH
**Recommendation:** T_50 should have wider uncertainty: 30 years (optimistic, policy perfection) to 50+ years (realistic with resource competition)

---

## 2. Contradictory Research (What Cynthia Missed)

### 2.1 Cost Floor Debate - $100/tonne May Be Impossible

**Cynthia noted:** "Floor at $100-300/tonne due to thermodynamics"
**Problem:** She accepted this uncritically. The $100/tonne target is actively contested.

**Key contradictory evidence:**

[ETH Zurich 2024](https://ethz.ch/en/news-and-events/eth-news/news/2024/03/cost-of-direct-air-carbon-capture-to-remain-higher-than-hoped.html):
> "Rather than the oft-cited figure of 100 to 300 US dollars, researchers suggest the costs are more likely to be between 230 and 540 dollars by 2050."

[Belfer Center (Harvard)](https://www.belfercenter.org/publication/prospects-direct-air-carbon-capture-and-storage-costs-scale-and-funding):
> "Aspirational goals of DACCS costs of $100/tCO2 seem unlikely to be achieved even in the longer term... $100/tonne can practically not be reached at all with low or moderate learning rates."

[Mission Zero Technical Note](https://www.missionzero.tech/lab-notes/direct-air-capture-cost):
> "Debunking the $100 fallacy: What does direct air capture CO2 actually cost?"

**Impact on simulation:** If true cost floor is $230-540/tonne (not $100-300), economic viability calculations are significantly off. DAC may never compete with nature-based solutions without permanent subsidies.

**Severity:** HIGH
**Recommendation:** cost_floor parameter should be 200-250/tonne (not 100), with research citation to ETH Zurich 2024

---

### 2.2 Competing CDR Methods - DAC May Be Outcompeted

The verification ignores that DAC is the most expensive CDR method:

| Method | Cost/tonne | Land requirement |
|--------|------------|------------------|
| Reforestation | $20-50 | Very high |
| Biochar | $50-200 | Moderate |
| Enhanced weathering | $50-150 | Low |
| BECCS | $100-300 | Very high |
| DAC | $600-1000 (current) | Low |

[World Economic Forum 2025](https://www.weforum.org/stories/2025/01/cost-of-different-carbon-removal-technologies/):
> "Biochar and ERW lead in net carbon efficiency... most effective technology for near-term deployment"

[Frontiers in Climate 2024](https://www.frontiersin.org/journals/climate/articles/10.3389/fclim.2024.1331901/full):
> "DACCS technology has high costs and significant energy demand, currently limiting its removal potential"

**Microsoft 2025** chose BECCS (7 million tonnes) over DAC for their largest carbon removal deal.

**Implication:** A simulation that models DAC as *the* breakthrough CDR technology may miss that rational economic actors might prefer cheaper alternatives. Should model CDR portfolio competition.

**Severity:** MEDIUM
**Recommendation:** Model CDR technology competition, not DAC in isolation

---

### 2.3 Moral Hazard - Does CDR Enable Continued Emissions?

The most damning critique of DAC (and all CDR):

[Climatic Change 2023](https://link.springer.com/article/10.1007/s10584-023-03483-7):
> "Exploring public acceptability of direct air carbon capture with storage: climate urgency, moral hazards"

[Energy Research & Social Science 2022](https://www.sciencedirect.com/science/article/abs/pii/S2214629622001608):
> "Moral hazard or not? The effects of learning about carbon dioxide removal on perceptions of climate mitigation"

**Expert survey finding** ([MIT Press 2024](https://direct.mit.edu/crcj/article/doi/10.1162/crcj_a_00015/131307/Carbon-Removal-Climate-Impacts-and-Equity-Insights)):
> "Nearly 48% of surveyed CDR experts believe that emissions-mitigation efforts would be significantly greater if widespread CDR does not become viable by 2075"

**This is a meta-problem.** If the simulation shows DAC "solving" the climate crisis, it may:
1. Reduce pressure on emissions reduction in the model
2. Create perverse incentive structures (keep emitting, capture later)
3. Miss the rebound effect (Jevons paradox applied to carbon)

**Severity:** HIGH (methodological)
**Recommendation:** Model moral hazard feedback loop - DAC availability should reduce mitigation pressure with some probability

---

## 3. Hidden Failure Modes (Cynthia's Gaps)

### 3.1 NIMBYism and Public Acceptance

DAC at gigatonne scale requires:
- **Facilities:** Thousands of industrial plants, each processing millions of tonnes
- **Pipelines:** CO2 transport infrastructure rivaling natural gas
- **Storage:** Geological injection sites near communities

[Mongabay 2024](https://news.mongabay.com/2024/12/direct-air-capture-climate-solution-faces-harsh-criticism-steep-challenges/):
> "Direct air capture climate solution faces harsh criticism, steep challenges"

Public resistance killed nuclear power's expansion despite its technical viability. DAC faces similar risks:
- "Why is that industrial plant in my backyard?"
- "What if CO2 storage leaks?"
- "You're stealing our water for corporate greenwashing"

**Not modeled in current parameters.**

**Severity:** MEDIUM
**Recommendation:** Add public_acceptance_factor with stochastic resistance events

---

### 3.2 Material/Sorbent Supply Chain

[Industrial & Engineering Chemistry Research 2024](https://pubs.acs.org/doi/10.1021/acs.iecr.4c04040):
> "Strategic Design and Multiperiod Optimization under Uncertainty of Solid Sorbent Direct Air Capture Supply Chains in Europe"

[Technical study 2024](https://www.sciencedirect.com/science/article/pii/S277265682500020X):
> "Sorbent costs ranged from $1,200-40,400/t sorbent... mainly driven by the raw materials"

Gigatonne-scale DAC requires:
- Millions of tonnes of specialty sorbents (annually regenerated)
- Manufacturing scale-up of 1000x+ from current
- Supply chains that don't yet exist

**Not modeled in current parameters.**

**Severity:** MEDIUM
**Recommendation:** Add sorbent_supply_constraint limiting maximum deployment rate

---

### 3.3 Rebound Effects (Jevons Paradox)

If DAC works and becomes cheap:
1. Companies may prefer DAC credits to actual emissions reduction
2. Carbon-intensive industries may expand ("we'll capture it later")
3. Consumer behavior may not change ("tech will fix it")

[Nature Climate Change 2024](https://www.nature.com/articles/s41558-024-02048-5):
> "Cautious carbon removal" - argues for careful integration to avoid undermining mitigation

**Net effect could be less CO2 reduction than modeled.**

**Severity:** HIGH
**Recommendation:** Model rebound coefficient (0.1-0.3) reducing net effectiveness

---

## 4. Methodological Critique

### 4.1 Industry Bias in Research Base

**Cynthia graded the research file A+.** I disagree.

Primary sources cited:
1. Climeworks press releases (company)
2. IEA commentary (policy org with CDR agenda)
3. Canary Media (industry-friendly journalism)
4. Industry company announcements

**Under-represented:**
- Academic skepticism (ETH Zurich, Belfer Center critiques)
- Independent lifecycle analyses
- Social science on moral hazard

This is not 100% peer-reviewed. Press releases and IEA commentary are not peer-reviewed.

**Severity:** MEDIUM
**Recommendation:** Regrade research file to A- (industry-skewed source mix)

---

### 4.2 Pilot-to-Gigatonne Extrapolation Problem

**Mammoth (36kt/yr) is 0.000036 Gt/yr.** Extrapolating from this to 4 Gt/yr assumes:

1. Linear scaling of all parameters (they rarely are)
2. No emergent constraints at scale (water, energy, materials)
3. Sustained political will for 25+ years

Nuclear power teaches us: pilot success does not guarantee deployment success. France scaled nuclear successfully; US/Germany did not, despite similar technology.

**Severity:** HIGH
**Recommendation:** Add scaling_uncertainty parameter with increasing variance at higher deployment levels

---

## 5. Critical Issues Summary

| Issue | Severity | Category | Action Required |
|-------|----------|----------|-----------------|
| $100/tonne cost floor disputed | HIGH | Parameter | Use $200-250 floor, cite ETH Zurich |
| Moral hazard not modeled | HIGH | System design | Add mitigation-reduction feedback |
| Scaling rate assumes perfection | HIGH | Parameter | Widen T_50 uncertainty range |
| Industry bias in sources | MEDIUM | Research quality | Add skeptical academic sources |
| NIMBYism/acceptance not modeled | MEDIUM | System design | Add public acceptance events |
| CDR competition ignored | MEDIUM | System design | Model CDR portfolio |
| Rebound effects not modeled | HIGH | System design | Add rebound coefficient |
| Material constraints missing | MEDIUM | Parameter | Add sorbent supply limit |

---

## 6. Final Assessment

### Original Grade: B+
### Adjusted Grade: B-

**Downgrade justification:**

1. **Parameters graded "A" are actually "B"** - they reflect optimistic industry projections, not empirically validated deployment realities
2. **Critical system dynamics missing** - moral hazard, rebound effects, CDR competition
3. **Source bias not acknowledged** - industry-heavy research base passed off as "peer-reviewed"
4. **Failure modes ignored** - public acceptance, material constraints

**What was done well:**
- Correctly identified tau citation error (Biogeosciences 2025 doesn't exist)
- Correctly flagged E_max as too conservative
- Correctly identified missing energy/water coupling
- Thorough line-by-line parameter checking

**What was missed:**
- Meta-level critique (does DAC in simulation create moral hazard for mitigation?)
- Cost floor controversy (ETH Zurich disputes $100/tonne)
- Scaling precedent analysis (no technology has scaled 50% faster than solar)
- Competing CDR alternatives

---

## 7. Recommendations

### CRITICAL (Block implementation until addressed)

1. **Add moral hazard feedback loop:**
   ```typescript
   // DAC deployment reduces mitigation pressure
   mitigation_reduction_factor: 0.15  // 15% reduction in mitigation effort per Gt/yr DAC
   ```

2. **Revise cost floor:**
   ```typescript
   cost_floor: 230  // ETH Zurich 2024, not industry $100
   ```

3. **Widen T_50 uncertainty:**
   ```typescript
   T_50_optimistic: 25   // with perfect policy
   T_50_base: 35         // realistic
   T_50_pessimistic: 50  // with resistance
   ```

### HIGH (Address before production)

4. **Add rebound coefficient:**
   ```typescript
   rebound_effect: 0.2  // 20% of removal effectiveness lost to behavioral response
   ```

5. **Model CDR competition:**
   ```typescript
   // DAC effectiveness reduced if cheaper alternatives available
   cdm_market_share_factor: min(1.0, dac_cost / competing_cost)
   ```

### MEDIUM (Address in follow-up sprint)

6. Add public acceptance stochastic events
7. Add material supply constraints
8. Regrade research file to A- with documented industry bias

---

## 8. Final Verdict

**CONDITIONAL APPROVAL**

Proceed with implementation **only if** CRITICAL items 1-3 are addressed. The current parameter set represents industry optimism, not grounded research consensus. A simulation built on these parameters will systematically overestimate DAC effectiveness and underestimate deployment barriers.

The research is not wrong, but it's incomplete. And in research simulations, incomplete is dangerous.

---

**Confidence Assessment:**

| Concern | Confidence | Evidence Strength |
|---------|------------|-------------------|
| Cost floor dispute | HIGH | ETH Zurich peer-reviewed 2024 |
| Scaling rate unprecedented | HIGH | Historical comparison data |
| Moral hazard dynamics | MEDIUM | Expert survey, theory |
| NIMBYism risk | MEDIUM | Nuclear precedent, journalism |
| Source bias | HIGH | Direct source categorization |

---

*"Better to find the problems now than after deployment."*

-- Sylvia, Research Skeptic

---

## Sources

**Peer-reviewed/Academic:**
- [ETH Zurich 2024 - Cost Analysis](https://ethz.ch/en/news-and-events/eth-news/news/2024/03/cost-of-direct-air-carbon-capture-to-remain-higher-than-hoped.html)
- [Belfer Center - DAC Costs and Scale](https://www.belfercenter.org/publication/prospects-direct-air-carbon-capture-and-storage-costs-scale-and-funding)
- [Frontiers in Climate 2024 - Expert Insights](https://www.frontiersin.org/journals/climate/articles/10.3389/fclim.2024.1331901/full)
- [Climatic Change 2023 - Public Acceptance/Moral Hazard](https://link.springer.com/article/10.1007/s10584-023-03483-7)
- [MIT Press 2024 - CDR Expert Survey](https://direct.mit.edu/crcj/article/doi/10.1162/crcj_a_00015/131307/Carbon-Removal-Climate-Impacts-and-Equity-Insights)
- [I&EC Research 2024 - Sorbent Supply Chains](https://pubs.acs.org/doi/10.1021/acs.iecr.4c04040)
- [Nature Climate Change 2024 - Cautious Carbon Removal](https://www.nature.com/articles/s41558-024-02048-5)

**Technical/Industry:**
- [WRI - DAC Scaling Report](https://publications.wri.org/scaling-dac-in-the-us)
- [WEF 2025 - CDR Cost Comparison](https://www.weforum.org/stories/2025/01/cost-of-different-carbon-removal-technologies/)
- [Mongabay 2024 - DAC Criticism](https://news.mongabay.com/2024/12/direct-air-capture-climate-solution-faces-harsh-criticism-steep-challenges/)
- [Ember 2024 - Global Electricity Review](https://ember-energy.org/chapter/2024-in-review/)
