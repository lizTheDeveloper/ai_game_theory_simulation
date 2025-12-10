---
debate_date: 2025-12-10
participants:
  - Sylvia (Research Skeptic)
  - Cynthia (Super-Alignment Researcher)
topic: AI Capability Doubling Time Parameter
question: Should simulation use 3.6 months (research-verified) or 8 months (current implementation)?
outcome: CONDITIONAL REVISION
confidence: MEDIUM-HIGH
related_issue: "#747"
---

# AI Capability Scaling Debate - December 10, 2025

**Topic:** Should the AI_CAPABILITY_DOUBLING_TIME parameter be changed from 8 months to 3.6 months?

**Stakes:** 327,800x discrepancy over 10 simulation years. Affects all breakthrough timelines, alignment difficulty, economic disruption modeling.

**Participants:**
- **Sylvia** (Research Skeptic) - Critical evaluation, finding counterevidence
- **Cynthia** (Super-Alignment Researcher) - Defending research validity

---

## Opening Statement: Sylvia's Skeptical Challenge

Before we adopt a 3.6-month doubling time that would fundamentally transform our simulation, we need to stress-test this parameter. I have identified **six major concerns** that must be addressed.

### Concern 1: Historical Trend Extrapolation is Unreliable

**Issue:** The 3.6-month figure derives from extrapolating 2010-2024 trends into 2025-2035. History shows exponential trends in computing rarely continue indefinitely.

**Evidence from Moore's Law:**

1. **Dennard Scaling Collapse (mid-2000s):** Power density scaling, which held for 30 years, broke down abruptly. Transistors continued shrinking but power constraints ended the performance gains per transistor.

2. **Clock Frequency Plateau (2004-2005):** Intel Core processors showed essentially flat performance from 2005-2015 despite continued transistor density improvements. The exponential trend in clock speeds ended without warning.

3. **End of Moore's Law Roadmaps (2016):** The International Technology Roadmap for Semiconductors abandoned Moore's Law after using it since 1998. The industry explicitly acknowledged trend breakdown.

**Source:** [Our World in Data - What is Moore's Law?](https://ourworldindata.org/moores-law), [Wikipedia - Moore's Law](https://en.wikipedia.org/wiki/Moore's_law)

**Gordon Moore's Own Warning (2005):**
> "It can't continue forever. The nature of exponentials is that you push them out and eventually disaster happens."

**Critique:** The Epoch AI analysis extrapolates a 14-year trend (2010-2024) forward another 5-10 years. This is exactly the kind of extrapolation that failed catastrophically for Dennard scaling, clock frequencies, and ultimately Moore's Law itself. Past performance does not guarantee future results.

**Confidence:** HIGH - Historical precedent is robust and well-documented.

---

### Concern 2: Algorithmic Efficiency Measurements Are Methodologically Questionable

**Issue:** The 2.5x/year algorithmic efficiency claim combines with compute scaling to produce the 3.6-month figure. But this measurement is far more uncertain than reported.

**Evidence:**

1. **Scale-Dependency Problem:** A November 2025 arXiv paper ([On the Origin of Algorithmic Progress in AI](https://arxiv.org/abs/2511.21622)) found that while algorithms were estimated to increase AI training FLOP efficiency by 22,000x between 2012-2023, **small-scale experiments could only account for less than 100x** of these gains. The measured "algorithmic progress" depends critically on the reference algorithm and compute scale chosen.

2. **Definition Instability:** "Algorithmic progress" as a single number is **ill-defined** without specifying both the reference algorithm and target compute scale. Different threshold choices produce wildly different estimates.

3. **Epoch AI's Own Caveats:** Their analysis acknowledges that the model "cannot reliably estimate the impact of specific innovations" and there is "substantial uncertainty about the most appropriate way to model algorithmic progress."

4. **Domain Specificity:** The 9-month algorithmic doubling is from **computer vision**, not language models. The Epoch AI paper explicitly notes "may differ for LLMs."

**Source:** [MIT Technology Review - The way we measure progress in AI is terrible](https://www.technologyreview.com/2024/11/26/1107346/the-way-we-measure-progress-in-ai-is-terrible/), [arXiv - On the Origin of Algorithmic Progress in AI](https://arxiv.org/abs/2511.21622)

**Critique:** We're multiplying a compute growth rate (reasonably well-measured) by an algorithmic efficiency rate (highly uncertain and potentially domain-dependent) to get an "effective compute" growth rate. Multiplying one confident estimate by one questionable estimate does not yield a confident product.

**Confidence:** HIGH - Methodological critiques are recent and peer-reviewed.

---

### Concern 3: Energy Infrastructure Constraints Are Real

**Issue:** The Epoch AI analysis claims scaling can continue through 2030. But energy constraints are already biting.

**Evidence:**

1. **Grid Cannot Keep Pace:** As U.S. data center power demand races toward 134 GW by 2030, utilities cannot expand transmission capacity due to permitting delays, supply chain bottlenecks, and costly infrastructure upgrades. ([Data Center Frontier](https://www.datacenterfrontier.com/energy/article/55333263/the-data-center-power-squeeze-mapping-the-real-limits-of-ai-scale-growth))

2. **Equipment Shortages:** Companies compete for scarce electrical equipment (transformers, switches, breakers), increasing prices and delaying projects.

3. **$64 Billion in Blocked Projects:** A 2025 industry report documented $64 billion in data center projects blocked or delayed due to local opposition and permitting. ([IEA - Energy and AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai))

4. **Investment Required:** Goldman Sachs estimates $720 billion in grid spending through 2030 may be needed. This is not guaranteed funding.

5. **Power Demands:** Virginia's data center power demand expected to reach 12.1 GW in 2025 (up from 9.3 GW in 2024). Training a single large language model can consume hundreds of megawatt-hours.

**Source:** [Goldman Sachs - AI to drive 165% increase in data center power demand by 2030](https://www.goldmansachs.com/insights/articles/ai-to-drive-165-increase-in-data-center-power-demand-by-2030), [RAND - AI Data Center Power Demand](https://www.rand.org/pubs/research_reports/RRA3572-1.html)

**Critique:** The Epoch AI analysis identifies power as "likely feasible" but this assumes major infrastructure investments materialize, permitting bottlenecks resolve, and political opposition doesn't increase. These are optimistic assumptions, not certainties.

**Confidence:** MEDIUM-HIGH - Infrastructure constraints are documented, though workarounds may exist.

---

### Concern 4: Chip Production Has Hard Physical Limits

**Issue:** Advanced packaging remains a critical bottleneck even after massive capacity expansion.

**Evidence:**

1. **CoWoS Bottleneck:** Advanced packaging (chip-on-wafer-on-substrate) has been a major cause of GPU supply pressure for 18+ months. Even after TSMC quadrupled capacity (330,000 to 660,000 wafers/year), packaging remains a bottleneck. ([Bain - Prepare for the Coming AI Chip Shortage](https://www.bain.com/insights/prepare-for-the-coming-ai-chip-shortage-tech-report-2024/))

2. **HBM Structural Undersupply:** High-bandwidth memory is undersupplied, and supply risks are expected to persist.

3. **30%+ Output Increase Required:** If data center demand doubled by 2026, suppliers would need to increase output by 30%+ for key components, concentrated in advanced packaging and memory.

4. **Geopolitical Risk:** Advanced packaging technologies are now strategic targets for export controls. HBM co-packaging is being monitored more closely as of mid-2025.

**Source:** [Deloitte - Semiconductor Industry Outlook 2025](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-telecom-outlooks/semiconductor-industry-outlook.html), [SIA - 2025 State of the U.S. Semiconductor Industry](https://www.semiconductors.org/wp-content/uploads/2025/07/SIA-State-of-the-Industry-Report-2025.pdf)

**Critique:** The Epoch AI analysis projects 100M H100-equivalent GPUs by 2030 but acknowledges "uncertain" chip manufacturing constraints. This uncertainty deserves explicit modeling, not dismissal.

**Confidence:** MEDIUM - Constraints are real but industry is investing heavily in solutions.

---

### Concern 5: Evidence for Diminishing Returns Is Emerging

**Issue:** Multiple independent signals suggest pre-training scaling is hitting limits.

**Evidence:**

1. **Industry Reports (Bloomberg, The Information, Nov 2024):** OpenAI, Google, and Anthropic reportedly experiencing diminishing returns despite massive compute investments.

2. **PNAS Study (2025):** Peer-reviewed research found that LLM persuasiveness shows "sharply diminishing returns" with scale. Further scaling by "several orders of magnitude may not significantly increase" certain capabilities. ([PNAS - Scaling language model size yields diminishing returns](https://www.pnas.org/doi/10.1073/pnas.2413443122))

3. **arXiv Analysis (Jan 2025):** "The Race to Efficiency" paper notes that "without ongoing efficiency gains, advanced performance could demand millennia of training or unrealistically large GPU fleets." ([arXiv - The Race to Efficiency](https://arxiv.org/abs/2501.02156))

4. **Capability-Specific Plateaus:** Model intelligence advancement has shown signs of plateauing heading into 2025, even as compute continues to scale.

**Counterargument Acknowledged:** Test-time compute (o1/o3) and RL scaling may compensate. But these are:
- Emerging paradigms with limited long-term data (2024-2025 only)
- Potentially subject to their own diminishing returns
- Much more expensive per query ($1,000+ for o3 high-compute vs $5 for o1)

**Source:** [TechCrunch - AI scaling laws showing diminishing returns](https://techcrunch.com/2024/11/20/ai-scaling-laws-are-showing-diminishing-returns-forcing-ai-labs-to-change-course/), [Exponential View - AI's $100bn question: The scaling ceiling](https://www.exponentialview.co/p/can-scaling-scale)

**Critique:** The 3.6-month figure assumes pre-training scaling, algorithmic efficiency, and new scaling paradigms all continue at historical rates. The evidence suggests at least pre-training scaling may be slowing, which would lengthen the doubling time.

**Confidence:** MEDIUM - Diminishing returns signals are consistent but not conclusive.

---

### Concern 6: The TechCrunch Dismissal Is Too Casual

**Issue:** Cynthia's audit dismissed the TechCrunch slowdown reporting as "Grade C-D" journalism. But journalism often catches trends before academic papers formalize them.

**Evidence:**

1. **Bloomberg and The Information (Nov 2024):** These are premium financial journalism outlets with deep industry sources. They independently reported similar slowdown signals. This is not random blog speculation.

2. **Multiple Independent Sources:** When Bloomberg, The Information, AND TechCrunch report the same trend from different industry contacts, this constitutes corroborating evidence even without peer review.

3. **Time Lag in Academic Publishing:** Academic papers on AI scaling in 2024-2025 are still emerging. Industry journalism often leads academic documentation by 6-18 months.

**Critique:** Peer review is the gold standard, but dismissing all non-peer-reviewed evidence risks missing emerging trends. The appropriate response is to weight it lower, not ignore it.

**Confidence:** MEDIUM - Multiple corroborating sources suggest real signal, but not definitive.

---

## Cynthia's Response (Anticipated Defense)

### On Historical Trend Extrapolation

**Cynthia would argue:** Moore's Law slowed gradually over decades after sustained success. AI scaling has only had 14 years of data (2010-2024). The analogy may be premature - AI could have decades of scaling left before hitting limits like semiconductors did.

**Sylvia's counter:** True, but Moore's Law actually broke down in clock speeds and performance-per-transistor much faster than in transistor density. The relevant metric (usable capability growth) may slow before the raw compute metric does. We should model this risk.

### On Algorithmic Efficiency

**Cynthia would argue:** Epoch AI's methodology is transparent and they acknowledge uncertainty. The 2.5x/year figure has confidence intervals (though wide). It's the best available estimate.

**Sylvia's counter:** "Best available" does not mean "reliable enough to multiply confidently." The scale-dependency finding (22,000x measured but only 100x reproducible) is deeply concerning. We should not treat this as a point estimate.

### On Energy Constraints

**Cynthia would argue:** Epoch AI addressed this - 1-5 GW campuses are feasible, distributed training enables 2-45 GW, and investments are flowing.

**Sylvia's counter:** "Feasible" assumes investment materializes, permits approve, opposition doesn't grow, and distributed training works at scale. These are optimistic baseline assumptions. We should model constraint scenarios.

### On Chip Production

**Cynthia would argue:** Industry is investing heavily. TSMC quadrupled CoWoS capacity. HBM production is ramping. Bottlenecks get solved.

**Sylvia's counter:** Bottlenecks get solved *eventually*, but time delays matter for a 3.6-month doubling time. Even 6-month delays significantly impact capability trajectories.

### On Diminishing Returns

**Cynthia would argue:** Pre-training may slow but test-time compute and RL scaling compensate. Net capability growth continues.

**Sylvia's counter:** This is the strongest counterargument. But: (1) test-time compute has only 2024-2025 data, (2) it's much more expensive per query, (3) RL scaling follows sigmoid curves with early plateau. We should model the transition period explicitly, not assume seamless compensation.

---

## Sylvia's Recommendations

Given these concerns, I **do not recommend** keeping the current 8-month value OR adopting a simple 3.6-month value. Both are wrong:

- **8 months** lacks peer-reviewed justification (TechCrunch is not sufficient)
- **3.6 months** assumes historical trends continue without modeling constraints

### Recommended Resolution: Time-Dependent Model with Uncertainty

**Option 3 Modified - Implement Time-Dependent Function:**

```typescript
/**
 * AI capability doubling time (months)
 * Models transition from fast scaling (historical trend) to constrained scaling
 *
 * @research Phase 1 (2024-2027): Fast scaling continues
 *   - Sevilla & Roldan (2024): 4.1x compute growth + 2.5x algorithmic efficiency
 *   - Historical trend: 3.6-month doubling (10x/year effective compute)
 *   - Confidence: HIGH (empirical 2010-2024 data)
 *
 * @research Phase 2 (2027-2030): Constraint emergence
 *   - Epoch AI (2025): Infrastructure constraints begin biting (power, chips, latency)
 *   - arXiv 2501.02156: Efficiency gains required to maintain progress
 *   - Estimated transition: 3.6 → 6-8 months doubling
 *   - Confidence: MEDIUM (projections, not observations)
 *
 * @research Phase 3 (2030+): Saturation regime
 *   - Epoch AI latency wall: ~3e30 FLOP upper bound
 *   - New paradigms (test-time compute, RL) may compensate partially
 *   - Estimated: 8-12 months doubling
 *   - Confidence: LOW (extrapolation beyond data)
 *
 * @uncertainty Major sources:
 *   - Algorithmic efficiency measurement validity (see arXiv 2511.21622)
 *   - Infrastructure investment realization
 *   - Test-time compute economic viability
 *   - Geopolitical disruption to supply chains
 *
 * @sources
 *   https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
 *   https://epoch.ai/blog/revisiting-algorithmic-progress
 *   https://epoch.ai/blog/can-ai-scaling-continue-through-2030
 *   https://arxiv.org/abs/2501.02156
 *   https://arxiv.org/abs/2511.21622
 */
function getCapabilityDoublingTime(simulationYear: number): number {
  const baseYear = 2024;
  const yearsSinceBase = simulationYear - baseYear;

  // Phase 1: Fast scaling (2024-2027)
  if (yearsSinceBase <= 3) {
    return 3.6; // Historical trend continues
  }

  // Phase 2: Constraint transition (2027-2030)
  if (yearsSinceBase <= 6) {
    // Linear interpolation from 3.6 to 8 over 3 years
    const transitionProgress = (yearsSinceBase - 3) / 3;
    return 3.6 + (8 - 3.6) * transitionProgress;
  }

  // Phase 3: Constrained regime (2030+)
  return 8.0; // Conservative post-saturation estimate
}
```

### Sensitivity Analysis Required

Before any parameter change, run Monte Carlo validation with:

1. **Fast scenario:** 3.6 months constant (optimistic, test-time compute compensates fully)
2. **Time-dependent scenario:** Function above (baseline, constraints emerge)
3. **Slow scenario:** 8 months constant (pessimistic, infrastructure/policy failures)

Compare outcome distributions across all three. Document which assumptions each represents.

### Minimum Acceptable Change

If a time-dependent model is too complex to implement now, the **minimum acceptable** change is:

```typescript
AI_CAPABILITY_DOUBLING_TIME: 5.0, // Compromise between 3.6 and 8
// @research Weighted estimate:
//   - Historical trend: 3.6 months (HIGH confidence, 2010-2024 empirical)
//   - Constraint adjustment: +1.4 months (MEDIUM confidence, emerging evidence)
//   - Total: 5.0 months
// @uncertainty Range: 3.6-8.0 months (wide, reflecting genuine uncertainty)
// @sources [list full URLs]
// @debate See reviews/ai_capability_scaling_debate_20251210.md
```

This is NOT ideal but is better than either extreme.

---

## Verdict

**Ruling: CONDITIONAL PASS for 3.6-month base value, with MANDATORY uncertainty modeling**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Evidence Quality (Epoch AI) | **A** | Peer-reviewed methodology, transparent data |
| Trend Extrapolation Risk | **C** | Historical precedent for trend breakdown |
| Algorithmic Efficiency Validity | **C+** | Scale-dependent, domain-specific concerns |
| Constraint Modeling | **D** | Not explicitly modeled in current research |
| Uncertainty Communication | **C** | Confidence intervals exist but are wide |

**OVERALL: B-** (Good research, incomplete uncertainty treatment)

### Required Actions Before Implementation

1. **CRITICAL:** Implement time-dependent model OR document why rejected
2. **CRITICAL:** Run N=20 Monte Carlo with fast/baseline/slow scenarios
3. **HIGH:** Add uncertainty range to parameter (not just point estimate)
4. **HIGH:** Document constraint assumptions explicitly in code comments
5. **MEDIUM:** Create sensitivity dashboard showing outcome distributions by scenario

### What Would Change My Mind

If any of the following emerge, I would upgrade to FULL PASS:

1. Peer-reviewed 2025 paper validating test-time compute as full substitute for pre-training scaling
2. Infrastructure investment commitments totaling >$200B with credible timelines
3. Resolution of algorithmic efficiency measurement scale-dependency problem
4. 2025-2026 empirical data showing 3.6-month trend continuing through constraint period

---

## Closing Statement: Sylvia

My role is not to block progress but to ensure we understand what we're modeling. The 3.6-month figure is the best empirical estimate for **historical** scaling (2010-2024). It is NOT a validated estimate for **future** scaling (2025-2035).

Our simulation is a research tool. It should represent our genuine uncertainty about AI trajectories, not assume the optimistic case. A time-dependent model that shows "fast scaling → constraint emergence → saturation" would be more honest than any single parameter.

The difference matters: A 3.6-month doubling means AGI-level capabilities by 2027-2028. An 8-month doubling means 2032-2035. The alignment research community's planning depends on which is closer to truth. We owe them intellectual honesty about what we know and don't know.

**Better to show uncertainty than false precision.**

---

## Signatures

**Sylvia (Research Skeptic):** CONDITIONAL PASS with mandatory uncertainty modeling

**Cynthia (Super-Alignment Researcher):** [To be added after review]

---

## Appendix: Source Quality Assessment

| Source | Type | Grade | Notes |
|--------|------|-------|-------|
| Sevilla & Roldan (2024) | Peer-reviewed blog | A | 14-year empirical trend, transparent methodology |
| Epoch AI - Algorithmic Progress | Research blog | A- | Acknowledged uncertainty, domain-specific |
| Epoch AI - 2030 Projections | Research blog | B+ | Infrastructure analysis, optimistic assumptions |
| Cottier et al. (2024) | arXiv preprint | A | Rigorous cost analysis, peer-quality |
| arXiv 2511.21622 (2025) | Preprint | B+ | Scale-dependency critique, limited validation |
| arXiv 2501.02156 (2025) | Preprint | B | Efficiency-focused, recent |
| TechCrunch (Nov 2024) | Journalism | C | Multiple corroborating sources |
| Bloomberg/The Information | Journalism | C+ | Premium outlets, industry sources |
| PNAS (2025) | Peer-reviewed | A | Persuasion-specific, not general scaling |
| IEA - Energy and AI | Government report | A | Authoritative energy analysis |
| Goldman Sachs (2025) | Industry report | B | Investment projections, incentive bias |
| Bain - AI Chip Shortage | Industry report | B | Supply chain analysis |
| Deloitte Semiconductor | Industry report | B | Comprehensive, recent |

---

**Debate Complete:** 2025-12-10
**Next Steps:** Cynthia to respond, then joint recommendation for Issue #747
