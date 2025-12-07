# Critical Analysis: AI Governance 2025 Research (Commit ff6ff02)

**Reviewer:** Sylvia (Research Skeptic)
**Date:** 2025-12-07
**Verification Report Under Review:** `research/verification_ff6ff02_20251207.md`
**Verdict:** CONDITIONAL PASS - Significant concerns require mitigation

---

## Executive Summary

The MIRI governance proposals represent **one advocacy organization's vision**, not scientific consensus. While the papers exist and contain substantive proposals, using them as the sole basis for simulation parameters introduces systematic bias toward high-risk narratives and optimistic enforcement assumptions. The simulation should model **multiple governance scenarios** including skeptical perspectives, and compute thresholds should be treated as **highly uncertain parameters** given the lack of scientific justification for specific values.

**Critical Issues:**
1. MIRI is an advocacy organization, not a neutral research institution
2. Catastrophic risk estimates are cherry-picked from high-risk advocates
3. Compute thresholds lack scientific justification - they are arbitrary policy choices
4. Verification mechanisms (on-chip monitoring, satellite surveillance) face significant technical and geopolitical obstacles
5. US-China bilateral cooperation faces fundamental trust deficits making the proposal's core assumption questionable

---

## 1. Source Quality Assessment

### MIRI's Advocacy Position

**Concern Level: HIGH**

MIRI has explicitly shifted from technical research to advocacy and policy work. Per their own [2024 Mission and Strategy Update](https://intelligence.org/2024/01/04/miri-2024-mission-and-strategy-update/), MIRI believes "an extinction-level catastrophe is extremely likely absent international government efforts to suspend frontier AI research."

This is not a neutral position from which to derive simulation parameters. MIRI:
- Is a 501(c)(3) with advocacy objectives, not a peer-reviewed research institution
- Has publicly stated they prioritize urgency over diplomatic credibility
- Works closely with organizations "more free to engage in advocacy work"
- Self-describes as aligned with effective altruism movement's objectives

**Implication for simulation:** Parameters derived from MIRI proposals will systematically bias toward high-risk scenarios and aggressive governance interventions. This is not inherently wrong, but treating these as the simulation's default or only governance model misrepresents the range of expert opinion.

### Preprint Status

**Concern Level: MEDIUM**

Both papers (arXiv:2505.04592 and arXiv:2511.10783) are preprints, not peer-reviewed publications. While arXiv preprints can be valuable, they:
- Have not undergone rigorous peer review for methodological soundness
- May contain unsubstantiated claims that peer review would challenge
- Do not meet the project's stated research standard of "2+ peer-reviewed sources"

**Recommendation:** These papers should be cited as "MIRI policy proposals (Nov 2025)" not as validated research findings. The simulation should note their advocacy origin.

---

## 2. Contradictory Evidence on Risk Estimates

### The "10-38%" Risk Estimates Are Not Consensus

**Concern Level: CRITICAL**

The verification report cites Amodei (10-25%), Bengio (~20%), and the AI survey (38% of researchers cite >10% risk). These represent the **high end** of expert opinion, not the median or consensus.

**Counter-evidence:**

1. **Yann LeCun (Meta Chief AI Scientist):** Has called existential AI concerns ["complete B.S."](https://techcrunch.com/2024/10/12/metas-yann-lecun-says-worries-about-a-i-s-existential-threat-are-complete-b-s/) and argues AGI is "decades away." LeCun contends LLMs are "a dead end" for AGI and that current systems lack basic cat-level capabilities.

2. **AAAI Survey:** A recent survey found that [doubting LLMs can reach AGI is the majority opinion](https://garymarcus.substack.com/p/the-false-glorification-of-yann-lecun) among academic AI researchers, contradicting the narrative that high-risk estimates represent consensus.

3. **AI Survey Misinterpretation:** The verification report notes that 38% means "38% of researchers estimate >10% risk" - the **median** estimate was only 5%. The mean was 9%. Using 38% as the headline figure is misleading.

4. **Skeptic Risk Estimates:** Even [AI risk skeptics cite ~30% catastrophic risk over 1,000 years](https://en.wikipedia.org/wiki/Existential_risk_from_artificial_intelligence) - a dramatically different timeframe than the MIRI proposals' implicit "within decades" framing.

5. **Present vs. Future Concerns:** [2025 research](https://www.sciencedaily.com/releases/2025/04/250423112143.htm) found people are "much more worried about present risks posed by AI than about potential future catastrophes."

**The Bengio Estimate Problem:**

The ~20% Bengio estimate is **conditional** on achieving human-level AI, which he estimates at 50% probability. The unconditional risk is therefore ~10%, not 20%. The verification report notes this but the simulation appears to use the higher figure.

**Recommendation:** Simulation should model a **distribution** of expert risk estimates:
- Low-risk view: 1-5% catastrophic risk (LeCun, skeptics)
- Medium-risk view: 5-15% (survey median, conditional estimates)
- High-risk view: 15-30% (Amodei, unconditional Bengio)

Currently the simulation appears to use only high-risk estimates.

---

## 3. Compute Threshold Critique

### 10^24 FLOP Is Arbitrary, Not Scientific

**Concern Level: HIGH**

The [Institute for Law & AI](https://law-ai.org/the-role-of-compute-thresholds-for-ai-governance/) states explicitly:

> "There is not a clear justification for any of the compute thresholds proposed to date... The choice of 10^25 rather than a number smaller or larger has not been justified. There is no finding in the machine learning literature that suggests that models with this characteristic are particularly likely to have catastrophic risk potential."

The EU Commission has acknowledged that 10^25 FLOP is an ["objective (albeit arbitrary) criterion"](https://www.stibbe.com/publications-and-insights/the-guidelines-for-providers-of-general-purpose-ai-models-are-here-the).

**Fundamental problems with compute thresholds:**

1. **DeepSeek R1 Challenge:** Models like [DeepSeek's R1 achieve comparable performance using significantly less compute](https://www.techpolicy.press/bigger-might-not-be-better-the-limits-of-regulating-ai-through-compute-thresholds/), "undermining the notion that thresholds based on FLOPs can reliably indicate an AI system's potential impact."

2. **Capability vs. Compute Disconnect:** ["The relationship between compute and risk is highly uncertain and rapidly changing"](https://arxiv.org/html/2407.05694v1). Design, purpose, and deployment context determine risks more than raw compute.

3. **Dynamic Evolution:** What requires 10^24 FLOP today may require 10^22 tomorrow through algorithmic improvements. Static thresholds become obsolete.

**Regulatory Variance:**
- EU AI Act: 10^25 FLOP (1 order of magnitude higher than MIRI)
- US EO 14110: 10^26 FLOP (2 orders higher)
- California SB 1047: 10^26 FLOP
- MIRI proposal: 10^24 FLOP (most restrictive)

The simulation should model **threshold uncertainty**, not assume MIRI's specific value is correct.

---

## 4. Verification Mechanism Feasibility

### On-Chip Monitoring

**Concern Level: HIGH**

The technical feasibility is not in question - such mechanisms exist. The **practical and political feasibility** is the problem.

Per [CNAS research](https://www.cnas.org/publications/reports/secure-governable-chips):
- "Mechanisms may be vulnerable to circumvention" by well-resourced adversaries
- "HEMs might take years to be developed and deployed"
- The flexible hardware-enabled guarantees (flexHEG) research aims for "compelling prototypes by end of 2025" - prototypes, not deployment-ready systems

Critical objections from [Data Innovation](https://datainnovation.org/2024/03/u-s-policymakers-should-reject-kill-switches-for-ai/):
- Characterized as "kill switches" that could be unilaterally activated by US government
- "Inflict considerable costs on U.S. chipmakers, making their products less competitive"
- Raise concerns for foreign users about US government control

Geopolitical concerns from [St. Antony's International Review](https://www.stairjournal.com/oped/2024/5/9/the-threat-of-on-chip-ai-hardware-controls):
- "More intrusive options... amplify strain on diplomatic relations"
- "Hinder international cooperation on AI governance"

**The simulation assumes these mechanisms work as designed.** This is optimistic. A realistic model should include:
- Circumvention rates (nation-state adversaries defeating mechanisms)
- Deployment delays (years, not months)
- Competitive disadvantage effects (non-participating nations gain market share)
- Diplomatic blowback (reduces cooperation willingness)

### Satellite Surveillance

**Concern Level: MEDIUM**

Satellite detection of compute facilities is technically feasible for large clusters (power signatures, heat signatures). However:
- Underground or distributed facilities are harder to detect
- False positive rates unknown
- Verification of AI training vs. other HPC workloads is non-trivial

### Whistleblower Programs

**Concern Level: LOW**

These are standard governance mechanisms with established precedents. Reasonable to model, though effectiveness varies widely by country and culture.

---

## 5. US-China Bilateral Cooperation

### The Core Assumption May Be Flawed

**Concern Level: CRITICAL**

The MIRI proposal's central assumption is that the US and China can form a coalition to enforce AI governance. Current evidence is not encouraging.

Per [RAND](https://www.rand.org/pubs/perspectives/PEA4189-1.html):
> "There currently exists a serious trust deficit between the two countries, with mutual suspicion and fear."

Per [TechPolicy.Press](https://www.techpolicy.press/from-competition-to-cooperation-can-uschina-engagement-overcome-geopolitical-barriers-in-ai-governance/):
> "The core values behind governing AI differ: the US promotes self-regulation and voluntary guidelines... while China aims for absolute state control."

Per [Sandia National Laboratories](https://www.sandia.gov/app/uploads/sites/148/2025/04/Challenges-and-Opportunities-for-US-China-Collaboration-on-Artificial-Intelligence-Governance.pdf):
> Significant challenges exist for cooperation, though some limited technical dialogues may be feasible.

**Track record:**
- May 2024 Geneva bilateral meeting: No joint declaration, no actionable plans
- November 2024 Biden-Xi agreement: Only on nuclear weapons AI control (narrow scope)
- Ongoing chip export controls: Actively restricting China's access to advanced AI chips

**The simulation appears to model MIRI's scenario as achievable.** This is highly optimistic. Alternative scenarios to model:
1. **Competitive Governance:** US and allies vs. China separate regimes
2. **Governance Fragmentation:** Multiple incompatible regulatory frameworks
3. **Governance Failure:** No effective international coordination achieved
4. **Limited Cooperation:** Technical safety dialogues without enforcement agreements

---

## 6. Economic Costs and Enforcement Challenges

### Missing from the Analysis

**Concern Level: MEDIUM**

The verification report validates MIRI's claims but does not address:

1. **Economic disruption:** Consolidating all chips above 16 H100-equivalents would affect:
   - Academic research institutions
   - Small AI companies and startups
   - Medical and scientific computing
   - Financial modeling
   - Climate research

2. **Enforcement costs:** The staged consolidation timeline (Day 1 through Year 2) requires:
   - Global inspection regime
   - Real-time monitoring infrastructure
   - Enforcement personnel in every major country
   - Legal frameworks in non-coalition states

3. **Black market emergence:** Historical precedent (nuclear materials, cryptography export controls) suggests that:
   - Prohibition creates black markets
   - Nation-states with resources can circumvent
   - Effectiveness depends on near-universal participation

4. **Innovation costs:** Restricting compute below 10^24 FLOP would prevent:
   - Beneficial AI research
   - Climate modeling requiring large models
   - Drug discovery applications
   - Defensive AI safety research

The simulation should model these negative externalities, not just the intended benefits.

---

## 7. Alternative Governance Scenarios

### Should Be Modeled

The simulation should not treat MIRI's proposal as the default or only governance scenario. Alternatives include:

1. **Entity-Based Regulation:** Per [Carnegie Endowment](https://carnegieendowment.org/research/2025/06/artificial-intelligence-regulation-united-states?lang=en), regulate AI developers based on entity size/capability, not compute thresholds.

2. **Outcomes-Based Regulation:** Focus on AI system impacts rather than training inputs. ["AI regulation must be adaptable and outcomes-based"](https://www.techpolicy.press/bigger-might-not-be-better-the-limits-of-regulating-ai-through-compute-thresholds/).

3. **Dynamic Thresholds:** Per US EO 14110, thresholds should be "updated as needed on a regular basis" not fixed.

4. **Domain-Specific Thresholds:** EO sets 10^23 FLOP for biological sequence models - different domains warrant different thresholds.

5. **No Governance Scenario:** Model what happens if international coordination fails entirely.

6. **Competitive Governance:** Model US-led and China-led separate regulatory regimes with technology competition.

---

## 8. Recommendations

### CRITICAL CHANGES (Must Address)

1. **Add alternative risk estimates:** Include LeCun/skeptic perspectives (1-5% risk), not just high-risk advocates

2. **Model governance uncertainty:** Treat 10^24 FLOP as one scenario among several (10^23 to 10^26 range)

3. **Add US-China cooperation failure mode:** High-probability scenario where bilateral coalition never forms

4. **Add enforcement failure mode:** Circumvention, black markets, non-participation scenarios

### HIGH PRIORITY

5. **Citation clarification:** Label MIRI sources as "advocacy proposals" not "research findings"

6. **Preprint warning:** Note that both papers are unreviewed preprints in all references

7. **Survey stat correction:** Use median (5%) not "38% of researchers" for risk estimates

8. **Add verification mechanism failure rates:** Model circumvention, deployment delays

### MEDIUM PRIORITY

9. **Economic cost modeling:** Include negative externalities of compute restrictions

10. **Alternative governance scenarios:** Entity-based, outcomes-based, fragmented models

11. **Temporal uncertainty:** Model that thresholds become obsolete as algorithms improve

---

## Confidence Assessment

| Concern | Severity | Confidence | Evidence Strength |
|---------|----------|------------|-------------------|
| MIRI advocacy bias | HIGH | HIGH | Direct from MIRI statements |
| Risk estimate cherry-picking | HIGH | HIGH | Survey median vs. cited figures |
| Compute threshold arbitrariness | HIGH | HIGH | Multiple peer-reviewed critiques |
| On-chip monitoring feasibility | HIGH | MEDIUM | Technical feasible, political questionable |
| US-China cooperation | CRITICAL | HIGH | Track record, trust deficit research |
| Economic costs omitted | MEDIUM | MEDIUM | Standard economics, limited AI-specific data |

---

## Final Verdict

**CONDITIONAL PASS**

The research may be used in the simulation IF AND ONLY IF:

1. It is presented as **one governance scenario among several**, not the default
2. Alternative risk estimates from skeptics are included
3. Governance failure modes are modeled with realistic probabilities
4. MIRI's advocacy position is disclosed in documentation
5. Compute thresholds are treated as uncertain parameters, not fixed values
6. US-China cooperation is modeled as difficult-to-achieve, not assumed

**If treated as the sole basis for governance modeling, this research introduces systematic bias that compromises the simulation's research validity.**

---

## Sources

### Risk Estimate Critique
- [LeCun on AI Risk - TechCrunch](https://techcrunch.com/2024/10/12/metas-yann-lecun-says-worries-about-a-i-s-existential-threat-are-complete-b-s/)
- [LeCun on AGI Timeline - Time](https://time.com/6694432/yann-lecun-meta-ai-interview/)
- [Survey Reality Check - Gary Marcus](https://garymarcus.substack.com/p/the-false-glorification-of-yann-lecun)
- [Present vs Future AI Risks - ScienceDaily](https://www.sciencedaily.com/releases/2025/04/250423112143.htm)
- [Wikipedia - Existential Risk from AI](https://en.wikipedia.org/wiki/Existential_risk_from_artificial_intelligence)

### Compute Threshold Critique
- [Institute for Law & AI - Compute Thresholds](https://law-ai.org/the-role-of-compute-thresholds-for-ai-governance/)
- [Limitations of Compute Thresholds - arXiv](https://arxiv.org/html/2407.05694v1)
- [TechPolicy - Bigger Might Not Be Better](https://www.techpolicy.press/bigger-might-not-be-better-the-limits-of-regulating-ai-through-compute-thresholds/)

### On-Chip Monitoring
- [CNAS - Secure Governable Chips](https://www.cnas.org/publications/reports/secure-governable-chips)
- [Data Innovation - Reject Kill Switches](https://datainnovation.org/2024/03/u-s-policymakers-should-reject-kill-switches-for-ai/)
- [St. Antony's - On-Chip Controls Threat](https://www.stairjournal.com/oped/2024/5/9/the-threat-of-on-chip-ai-hardware-controls)

### US-China Cooperation
- [RAND - US-China AI Cooperation Potential](https://www.rand.org/pubs/perspectives/PEA4189-1.html)
- [TechPolicy - US-China Barriers](https://www.techpolicy.press/from-competition-to-cooperation-can-uschina-engagement-overcome-geopolitical-barriers-in-ai-governance/)
- [Sandia - Challenges and Opportunities](https://www.sandia.gov/app/uploads/sites/148/2025/04/Challenges-and-Opportunities-for-US-China-Collaboration-on-Artificial-Intelligence-Governance.pdf)

### MIRI Credibility
- [MIRI 2024 Mission and Strategy](https://intelligence.org/2024/01/04/miri-2024-mission-and-strategy-update/)
- [Wikipedia - MIRI](https://en.wikipedia.org/wiki/Machine_Intelligence_Research_Institute)

### Alternative Governance
- [Carnegie - Entity-Based Regulation](https://carnegieendowment.org/research/2025/06/artificial-intelligence-regulation-united-states?lang=en)

---

**Report prepared by:** Sylvia (Research Skeptic)
**Date:** 2025-12-07
**Review status:** COMPLETE
**Recommended action:** CONDITIONAL PASS with mandatory diversification of governance scenarios
