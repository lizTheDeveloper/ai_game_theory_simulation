# AI Scaling Research Skeptic Review
**Date:** 2025-12-10
**Reviewer:** Sylvia (research-skeptic)
**Issue:** #747 - AI Capability Doubling Time Parameter Mismatch
**Document Reviewed:** research/ai_scaling_slowdown_evidence_20251210.md

---

## Executive Summary

**Overall Grade: B+** (Good research with significant methodological caveats)

The research correctly identifies and corrects the 3.6-month calculation error. The recommendation for a time-dependent model is reasonable. However, there are three substantive concerns:

1. **Conflation of metrics:** Training compute growth is NOT the same as capability growth
2. **Phase transition timing is arbitrary:** The 2025/2028 dates lack peer-reviewed support
3. **Test-time compute is hand-waved:** Major paradigm shift mentioned but not modeled

**Verdict:** CONDITIONAL PASS - Implement with explicit uncertainty labeling and annual recalibration commitments.

---

## Section 1: Mathematical Verification

### 1.1 The 5.9-Month Calculation: CORRECT

**Researcher's claim:** 4.1x/year = 5.9 month doubling time

**Verification:**
```
Doubling time = ln(2) / ln(growth_rate) * 12 months
             = 0.693 / ln(4.1) * 12
             = 0.693 / 1.411 * 12
             = 5.89 months
```

**Alternative calculation (as researcher used):**
```
4.1x/year = 2^(log2(4.1)) = 2^2.036 per year
Doubling time = 12 / 2.036 = 5.89 months
```

**Verdict:** VALIDATED. The 3.6-month figure in the original verification was indeed an error. The corrected 5.9-month figure is mathematically sound.

### 1.2 The Revised Discrepancy Calculation: CORRECT

**Researcher's claim:** Corrected discrepancy is 40x (not 327,800x)

**Verification:**
- 10 years = 120 months
- 5.9-month doubling: 2^(120/5.9) = 2^20.34 = 1,330,000x
- 8-month doubling: 2^(120/8) = 2^15 = 32,768x
- Ratio: 1,330,000 / 32,768 = 40.6x

**Verdict:** VALIDATED. The discrepancy reduction from 327,800x to 40x is correct.

---

## Section 2: Methodological Concerns

### 2.1 CRITICAL: Conflation of Training Compute and Capability

**The research conflates two distinct metrics:**
- Training compute (what Epoch AI measures)
- AI capability (what the simulation models)

**Why this matters:**

Training compute measures FLOPs spent training models. Capability measures what models can DO. These are correlated but not identical.

**Evidence of divergence:**

1. **Algorithmic efficiency gains** mean the same capability requires less compute over time. [Epoch AI](https://epoch.ai/blog/can-ai-scaling-continue-through-2030) reports "each year, we need around six times less training compute to reach the same capability."

2. **Post-training enhancements** (RLHF, fine-tuning, tool use) add capability without increasing training compute.

3. **Benchmark saturation** means compute increases don't translate to proportional capability gains on measured tasks.

**Quantitative impact:**

If algorithmic efficiency improves at 6x/year (Epoch AI estimate), and training compute grows at 4.1x/year, then:
- Net capability growth could be as low as 4.1/6 = 0.68x/year (DECLINE)
- Or as high as 4.1 * 6 = 24.6x/year (if efficiency is additive, not substitutive)

The relationship is unclear because we don't have good capability metrics that span a decade.

**Recommendation:** Add explicit caveat that "capability doubling time" is a proxy extrapolated from compute data. Consider tracking both compute growth and algorithmic efficiency as separate parameters.

**Severity:** SIGNIFICANT

### 2.2 CRITICAL: Phase Transition Dates Are Arbitrary

**The research proposes:**
- Phase 1: 2010-2024 (5.5 month)
- Phase 2: 2025-2027 (8 month)
- Phase 3: 2028+ (10-18 month)

**Where do these dates come from?**

- **2024 cutoff:** Epoch AI data only goes to May 2024. This is a data availability boundary, NOT a demonstrated phase transition.
- **2025 start of slowdown:** Based on Bloomberg/TechCrunch reports of model delays, not demonstrated capability plateau.
- **2028 further slowdown:** Completely arbitrary. No peer-reviewed evidence cited.

**Critical observation:**

Model release delays (Orion, Claude 3.5 Opus, Gemini) could indicate:
1. Technical scaling limits (researcher's interpretation)
2. Strategic timing (competitive positioning)
3. Safety testing requirements
4. Business model shifts (inference vs training)

The research assumes (1) without ruling out (2)-(4).

**Evidence for strategic timing:**
- Anthropic explicitly cited "extensive safety testing" for Opus delay
- OpenAI pivoted to test-time compute (o1/o3) suggesting strategic choice, not hitting wall
- Claude 3.5 Haiku matching original Opus performance suggests algorithmic improvements compensating

**Recommendation:** Label all post-2024 parameters as "speculative scenarios" rather than "phases." Remove specific year boundaries or justify them with peer-reviewed evidence.

**Severity:** SIGNIFICANT

### 2.3 Test-Time Compute: Acknowledged but Not Modeled

**The research notes:**
> "Pre-training compute scaling may be slowing, but test-time compute presents new scaling axis."

**The problem:**

The proposed model continues to use a single "AI_CAPABILITY_DOUBLING_TIME" parameter despite acknowledging this conflates two distinct scaling regimes.

**Evidence for paradigm shift:**

From the research itself:
- o1: 32% on ARC-AGI, ~$5/task
- o3: 88% on ARC-AGI, >$1,000/task
- That's 2.75x capability improvement via 200x inference compute, NOT training compute

This suggests capability growth is decoupling from training compute growth. A model that ignores this structural shift will systematically mis-predict capabilities.

**Recommendation:** Either:
1. Model test-time and training compute separately
2. Create a hybrid "effective capability" metric that accounts for both
3. Explicitly state that the model assumes pre-training scaling dominates

**Severity:** SIGNIFICANT

---

## Section 3: Source Quality Assessment

### 3.1 Strong Sources (A-tier)

**Epoch AI (Sevilla & Roldán 2024):** A+
- 14 years of empirical data
- Transparent methodology
- Widely cited by industry
- Regularly updated database

**Lu (2025) arXiv preprint:** B+
- Sound theoretical framework
- Not yet peer-reviewed
- Provides important efficiency-dependence insight

**ACL 2025 scaling laws paper:** A-
- Peer-reviewed
- Limited to language modeling domain

### 3.2 Weak Sources (B/C-tier)

**Bloomberg (Nov 2024):** B+
- Major outlet but anonymous sources
- Industry interpretation, not measured data
- Could reflect strategic positioning, not technical limits

**TechCrunch (Dec 2024):** B
- Secondary reporting
- Relies on unnamed sources
- Entertainment value may bias toward dramatic narrative

**The Decoder:** B-
- Tech journalism
- CEO quote is strategic, not scientific
- Alternative explanations not ruled out

### 3.3 Missing Sources

**What should have been searched:**

1. **NIST/government reports** on AI capability measurement
2. **MLPerf benchmarks** for standardized capability tracking
3. **Industry earnings calls** for capex projections (forward-looking data)
4. **Competing forecasters** (Metaculus, AI forecasting tournaments)
5. **Frontier model cards** for self-reported capability claims

**Contradictory research not cited:**

1. [OpenAI's position](https://twitter.com/sama/status/1856424515070152948) - Sam Altman's "there is no wall" tweet
2. [Anthropic's scaling optimism](https://www.anthropic.com) - Dario Amodei's continued scaling predictions
3. [Meta's scaling investments](https://ai.meta.com) - Continued multi-billion dollar compute buildout
4. [Epoch AI November 2024 analysis](https://epoch.ai/blog/can-ai-scaling-continue-through-2030) predicting 10,000x growth possible to 2030

---

## Section 4: Contradictory Evidence

### 4.1 Industry Actions vs Industry Words

**Claimed:** Scaling is hitting limits (based on Bloomberg reports)

**Observed:**
- Meta: $30-37B capex planned for 2024 (up from $23B)
- Microsoft: Building 5GW of data center capacity
- OpenAI: $100B Stargate project announced
- Google: Record AI infrastructure investment

If scaling were truly plateauing, rational actors would reduce investment. The opposite is occurring.

**Possible reconciliation:** Labs may be investing in test-time compute infrastructure rather than training compute, consistent with paradigm shift hypothesis.

### 4.2 Ilya Sutskever's Position

The research does not cite [Ilya Sutskever's 2024 statements](https://officechai.com/ai/scaling-could-now-give-diminishing-returns-were-back-to-the-age-of-research-ilya-sutskever/):

> "Is the belief really, 'Oh, it's so big, but if you had 100x more, everything would be so different?' I don't think that's true."

This is from a co-founder of OpenAI and is more authoritative than Bloomberg anonymous sources. Should have been included.

### 4.3 Epoch AI's Own Caveats

From [Epoch AI (2024)](https://epoch.ai/blog/can-ai-scaling-continue-through-2030):

**Constraints identified:**
1. Power (biggest constraint): 6GW needed for 2030 frontier model (30% of all current data centers)
2. Data: Stock depleted between 2026-2032 (80% CI)
3. Latency wall: Sequential operation limits
4. Hardware production: Linear scaling ends in ~3 years

These constraints suggest slowdown is PHYSICAL, not ALGORITHMIC. This is important for modeling because:
- Physical constraints can be overcome with investment (build more data centers)
- Algorithmic constraints suggest fundamental limits

The research does not distinguish between these constraint types.

---

## Section 5: Model Validity Assessment

### 5.1 Does the Time-Dependent Model Make Testable Predictions?

**Implicit predictions:**
1. Capability doubling time increases from 5.9 to 8 months between 2024-2025
2. Further slows to 10-18 months by 2028

**Testability:**
- We can compare against Epoch AI updates (next update expected mid-2025)
- We can compare against benchmark progress (but benchmarks saturate)
- We can compare against economic indicators (AI company valuations, deployment metrics)

**Problem:** No concrete test proposed. What would FALSIFY the slowdown hypothesis?

**Recommendation:** Specify falsification criteria, e.g., "If Epoch AI 2025 data shows >4.5x/year growth, revert to fast scenario."

### 5.2 Are the Uncertainty Bands Appropriate?

**Proposed:**
- Phase 2: 2.0x uncertainty multiplier
- Phase 3: 3.0x uncertainty multiplier

**Assessment:**

The confidence intervals grow appropriately with temporal distance. However, the asymmetry is not captured:
- Upside scenario: Breakthrough in data (synthetic data, multimodal fusion)
- Downside scenario: Physical limits bind earlier than expected

The current bands appear symmetric around the central estimate. Real uncertainty is probably asymmetric (fat downside tail from multiple correlated constraints).

**Recommendation:** Use asymmetric uncertainty bounds, wider on the downside.

---

## Section 6: Recommendations for Implementation

### 6.1 Accept With Modifications

**Accept:**
- Corrected 5.9-month historical figure (validated)
- Time-dependent model concept (reasonable approach)
- Scenario variants (good for sensitivity analysis)

**Modify:**

1. **Rename parameters:**
   - "AI_CAPABILITY_DOUBLING_TIME" -> "AI_COMPUTE_DOUBLING_TIME_PROXY"
   - Add explicit comment: "Capability assumed proportional to compute; see limitations"

2. **Remove specific transition dates:**
   - Replace "2025" with "simulation_year > 14" (relative to start)
   - Or make transition dates user-configurable scenarios

3. **Add test-time compute modifier:**
   - Parameter: "INFERENCE_COMPUTE_SCALING_FACTOR" (default 1.0)
   - Allows modeling o1/o3-style capability gains

4. **Specify recalibration triggers:**
   - Automatic review if Epoch AI publishes new data
   - Flag in simulation if running beyond data coverage period

### 6.2 Document Limitations

Add to simulation documentation:

> **AI Scaling Limitations (Dec 2025)**
>
> The AI capability model uses training compute growth as a proxy for capability growth. This conflation ignores:
> - Algorithmic efficiency improvements (6x/year historically)
> - Test-time compute scaling (o1/o3 paradigm)
> - Benchmark saturation effects
>
> Phase transition dates (2025, 2028) are scenario markers, not empirically validated thresholds. Users should explore multiple scenarios for robust planning.

### 6.3 Future Research Needed

1. **Capability metrics:** Find peer-reviewed capability measures independent of compute
2. **Efficiency tracking:** Quantify algorithmic efficiency gains per year
3. **Test-time modeling:** Integrate inference compute into capability projection
4. **Constraint decomposition:** Model power, data, and hardware limits separately

---

## Section 7: Grade Breakdown

| Category | Grade | Weight | Notes |
|----------|-------|--------|-------|
| Mathematical accuracy | A | 20% | Calculations verified correct |
| Source quality | B+ | 25% | Good primary sources, weak secondary sources |
| Methodological rigor | B- | 25% | Conflates metrics, arbitrary dates |
| Completeness | B | 15% | Test-time compute under-addressed |
| Actionability | A- | 15% | Clear implementation path |

**Weighted Average: B+ (3.2/4.0)**

---

## Section 8: Confidence Assessment

| Concern | Confidence | Evidence Strength |
|---------|------------|-------------------|
| 3.6-month error correction | HIGH | Mathematical proof |
| Historical 5.9-month rate | HIGH | 14 years Epoch data |
| 2024 slowdown signals | MEDIUM | Industry reports only |
| 2025-2027 8-month projection | LOW | Speculative, no peer review |
| 2028+ 10-18 month projection | VERY LOW | No empirical basis |
| Test-time compute paradigm shift | MEDIUM | Early data (o1/o3), not validated |

---

## Verdict: CONDITIONAL PASS

The research provides value by:
1. Correcting an important calculation error
2. Proposing a reasonable flexible model
3. Acknowledging uncertainty appropriately

The research requires caution because:
1. Training compute is not capability
2. Phase transition dates are arbitrary
3. Test-time compute is acknowledged but ignored in modeling

**Implementation should proceed** with:
- Explicit limitation documentation
- Configurable transition thresholds
- Commitment to 6-month recalibration
- Asymmetric uncertainty bounds

**Do not represent this as "settled science."** The post-2024 projections are educated guesses, not empirical extrapolations.

---

## References (Contradictory/Supplementary)

1. [Epoch AI - Can AI Scaling Continue Through 2030](https://epoch.ai/blog/can-ai-scaling-continue-through-2030) - Identifies physical constraints (power, data, latency)
2. [Lu (2025) - The Race to Efficiency](https://arxiv.org/abs/2501.02156) - Efficiency-dependence of scaling
3. [TechCrunch - AI Scaling Laws Diminishing Returns](https://techcrunch.com/2024/11/20/ai-scaling-laws-are-showing-diminishing-returns-forcing-ai-labs-to-change-course/) - Industry reporting
4. [Pearce & Song (2024) - Reconciling Kaplan and Chinchilla](https://arxiv.org/abs/2406.12907) - Scaling law methodology corrections
5. [arXiv - Training Compute Thresholds](https://arxiv.org/html/2405.10799v2) - Compute as imperfect capability proxy
6. [arXiv - Can We Trust AI Benchmarks](https://arxiv.org/html/2502.06559v1) - Benchmark limitations
7. [Foundation Capital - Has AI Scaling Hit a Limit](https://foundationcapital.com/has-ai-scaling-hit-a-limit/) - Industry skepticism summary

---

*Review completed by Sylvia, Research Skeptic*
*"Better to find the problems now than after deployment"*
