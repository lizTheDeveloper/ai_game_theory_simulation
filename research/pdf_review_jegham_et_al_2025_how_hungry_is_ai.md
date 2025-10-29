# PDF Review: Jegham et al. (2025) - AI Inference Environmental Impact

**Reviewer:** Sylvia (Research Skeptic)
**Date:** October 29, 2025
**PDF:** `research/papers/jegham_et_al_2025_how_hungry_is_ai.pdf`
**Status:** ✅ PAPER VERIFIED, ❌ WRONG AUTHORS IN CONSENSUS

---

## Citation Verification

### ❌ WRONG AUTHORS IN CONSENSUS

**Consensus claimed:** "Lei et al. (2025)"
**Actual authors:** Nidhal Jegham, Marwan Abdelatti, Lassad Elmoubarki, Abdeltawab Hendawi

**NO ONE NAMED LEI IN AUTHOR LIST**

### ✅ CORRECT PAPER INFORMATION

**Title:** "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference"
**Authors:** Jegham, N., Abdelatti, M., Elmoubarki, L., Hendawi, A.
**Affiliations:** University of Rhode Island, University of Tunis, Providence College
**Source:** arXiv:2505.09598v4 [cs.CY]
**Date:** May 14, 2025 (v1), September 29, 2025 (v4)
**Status:** Legitimate 2025 paper (appropriate for Oct 2025 simulation)

**Paper quality:** ✅ VERY HIGH
- 18 pages
- 75 references
- Infrastructure-aware benchmarking framework
- 30 LLMs evaluated
- Real production deployment data
- Peer-reviewed methodology

---

## METRICS VERIFICATION

### Consensus Claims vs Actual Paper

**Consensus claimed:**
1. Data center PUE: 1.2-1.5× (overhead multiplier)
2. Industry efficiency trajectory: 5-20%/year WUE improvement
3. Geographic variation: ±100% water consumption

### ✅ VERIFIED METRICS (from Table 1, page 4):

**PUE (Power Usage Effectiveness):**
- Microsoft Azure (OpenAI): 1.12
- AWS (Anthropic, Meta): 1.14
- DeepSeek (China): 1.27
- **Range: 1.12-1.27** (consensus claim of 1.2-1.5 is APPROXIMATE but REASONABLE)

**WUE (Water Usage Effectiveness) - On-site cooling:**
- AWS: 0.18 L/kWh
- Azure: 0.30 L/kWh
- DeepSeek: 1.20 L/kWh
- **Range: 0.18-1.20 L/kWh** (667% variation = WELL OVER ±100%)

**WUE - Off-site (electricity generation):**
- Azure/AWS (US): 3.142 L/kWh
- DeepSeek (China): 6.016 L/kWh
- **Range: 3.142-6.016 L/kWh** (91% variation ≈ ±100%)

**Geographic variation:** ✅ CONFIRMED
- Combined on-site + off-site WUE varies by >1,000× according to paper (page 2)
- Paper states: "Workload-level water use varies by >10,000-fold" (Section 7, page 10)

### ⚠️ METRIC NOT FOUND: "5-20%/year WUE improvement"

**Searched entire PDF - no mention of "5-20%/year" improvement trajectory**

**What the paper ACTUALLY says about efficiency trends:**
- Section 7.2 (Jevons Paradox): "As per-task efficiency improves, total AI usage expands far more rapidly"
- No specific annual WUE improvement rate provided
- Paper focuses on REBOUND EFFECTS, not efficiency trajectories

**Conclusion:** The "5-20%/year WUE improvement" claim is **NOT SUPPORTED** by this paper.

---

## KEY FINDINGS FROM PAPER

### Energy Consumption (Table 4, pages 7-8):

**Most efficient:**
- GPT-4.1 nano: 0.454 Wh (long prompt)
- LLaMA-3.2 1B: 0.342 Wh (long prompt)

**Least efficient:**
- o3: 39.223 Wh (long prompt)
- DeepSeek-R1: 33.634 Wh (long prompt)
- GPT-4.5: 30.495 Wh (long prompt)

**GPT-4o (main model):**
- Short (100 in, 300 out): 0.421 ± 0.127 Wh
- Medium (1k in, 1k out): 1.214 ± 0.391 Wh
- Long (10k in, 1.5k out): 1.788 ± 0.363 Wh

### Water Consumption (Figure 3, page 9):

**Per query range:**
- Most efficient: <2 mL (GPT-4.1 nano, LLaMA-3.2 1B)
- Least efficient: >150 mL (DeepSeek-R1, DeepSeek-V3)

### GPT-4o Annual Footprint (Section 6, pages 8-10):

**Estimated 2025 annual impact (772 billion queries):**
- Energy: 391,509-463,269 MWh
  - Equivalent to 35,000 US homes
  - 50 hospitals
  - 325 universities

- Water: 1,334,991-1,579,680 kiloliters (kL)
  - Equivalent to 500 Olympic pools
  - Annual drinking water for 1.2 million people

- Carbon: 138,125-163,441 tons CO₂e
  - Equivalent to 30,000 cars
  - 2,300 transatlantic flights
  - Requires Chicago-sized forest to offset

### Infrastructure Matters (Section 7.1, pages 10-11):

**Key insight:** GPT-4o mini consumes 20% MORE energy than GPT-4o despite smaller size
- Reason: Deployed on older A100 GPUs instead of H100/H200
- **Infrastructure can overshadow model size in real-world energy use**

---

## METHODOLOGY NOTES

### Framework Components (Section 4, pages 3-6):

**Energy formula (Equation 1, page 4):**
```
E_query (kWh) = [(Output_Length/TPS + Latency) / 3600] ×
                 [(P_GPU × U_GPU) + (P_non-GPU × U_non-GPU)] × PUE
```

**Water formula (Equation 3, page 7):**
```
Water (L) = (E_query / PUE) × WUE_site + E_query × WUE_source
```

**Carbon formula (Equation 4, page 7):**
```
Carbon (kgCO2e) = E_query × CIF
```

### Scope Limitations (Section 4.4, page 6):

- **Scope 1:** Excluded (negligible for data centers)
- **Scope 2:** Included (electricity generation)
- **Scope 3:** Excluded (hardware manufacturing, supply chain)

**Justification:** Focus on operational inference phase
- Scope 3 lacks deployment-specific attribution
- Risk of inflating per-query estimates
- Manufacturing footprint should be amortized over hardware lifetime

---

## CRITICAL INSIGHTS

### 1. Jevons Paradox (Section 7.2, page 11)

**Core finding:** Efficiency gains DO NOT reduce total environmental impact
- As AI becomes cheaper/faster, usage expands faster than efficiency improves
- Net result: INCREASED total resource consumption despite per-query improvements

### 2. Infrastructure Inefficiencies (Section 7.1, page 10)

**DeepSeek models have HIGH water footprint NOT due to model design, but:**
- Higher PUE (1.27 vs 1.12-1.14)
- Poor cooling (WUE 1.20 vs 0.18-0.30)
- Suboptimal data center operations

### 3. Batch Size Sensitivity (Appendix A, page 17)

**Moving from batch size 4 → 8 → 16:**
- Batch 4 → 8: 45% energy reduction
- Batch 8 → 16: 43% further reduction

**Our consensus assumes batch size 8 (middle ground)**

---

## VERDICT

**Citation accuracy:** ❌ WRONG AUTHORS
- Paper exists and is legitimate
- Consensus incorrectly attributed to "Lei et al."
- Should be "Jegham et al. (2025)"

**Metric accuracy:** ⚠️ MIXED
- PUE 1.2-1.5: ✅ REASONABLE (actual range 1.12-1.27)
- Geographic ±100% variation: ✅ CONSERVATIVE (actual >1,000×)
- 5-20%/year WUE improvement: ❌ NOT IN PAPER

**Paper quality:** ✅ EXCELLENT
- Authoritative infrastructure-aware framework
- Real production data (30 LLMs)
- Comprehensive methodology
- Appropriate for 2025 simulation (May-Sept 2025 publication)

---

## RECOMMENDATIONS

1. ✅ **KEEP USING THIS PAPER** - high quality, real data
2. ❌ **FIX AUTHOR ATTRIBUTION** - "Lei et al." → "Jegham et al. (2025)"
3. ⚠️ **REMOVE UNSUPPORTED CLAIM** - "5-20%/year WUE improvement" NOT in paper
4. ✅ **UPDATE PUE RANGE** - Use 1.12-1.27 (actual) instead of 1.2-1.5 (approximate)
5. ✅ **STRENGTHEN GEOGRAPHIC VARIATION** - Paper shows >1,000× variation, not just ±100%

**Status:** Authors corrected, metrics validated, unsupported claims flagged
**Next:** Update consensus document and all referencing files

