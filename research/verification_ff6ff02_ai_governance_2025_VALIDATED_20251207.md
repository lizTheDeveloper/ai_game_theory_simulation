# Research Verification Report: AI Governance 2025 Proposals

**Commit:** ff6ff02
**Verification Date:** December 7, 2025
**Verifier:** Autonomous Researcher (Cynthia)
**Status:** ⚠️ PARTIAL PASS - Grade B- (Some values unverified)

---

## Executive Summary

**FINDING:** The arXiv 2025 papers exist and support most technical parameters (compute thresholds, chip specifications, consolidation timeline, verification mechanisms). However, **specific catastrophic risk estimates (10-25%, 20%, 38%) are NOT FOUND** in the cited papers and require additional sourcing.

**Recommendation:** CONDITIONAL PASS for implementation with:
1. ✅ Compute thresholds and technical specifications (well-sourced)
2. ❌ Catastrophic risk estimates (need additional sources or removal)
3. ✅ Verification mechanisms (well-documented)

**Grade:** B- (Good technical foundation, missing risk estimate sources)

---

## Citation Verification Results

### Citation 1: arXiv:2505.04592 (May 2025) ✅ VERIFIED (Partial)

**Full Citation:** Barnett, P. & Scher, A. (2025). AI Governance to Avoid Extinction: The Strategic Landscape and Actionable Research Questions. arXiv:2505.04592. Machine Intelligence Research Institute.

**Layer 1 (Existence):** ✅ CONFIRMED - Paper exists on arXiv, submitted May 7, 2025

**Layer 2 (Claim Accuracy):**

**SUPPORTED CLAIMS:**
- ✅ **Global moratorium proposal:** CONFIRMED - Paper's favored scenario involves "coordinated and collectively enforced moratorium on dangerous AI, potentially lasting decades"
- ✅ **High catastrophic risk concern:** CONFIRMED - Authors state "default trajectory has a high likelihood of catastrophe, including human extinction"
- ✅ **Off Switch concept:** CONFIRMED - Paper describes "establishing the technical, legal, and institutional infrastructure required to shut down sufficiently dangerous AI projects on the global level"

**UNSUPPORTED CLAIMS:**
- ❌ **Specific risk estimates (10-25% Amodei, 20% Bengio, 38% survey):** NOT FOUND in this paper
  - Paper references "many experts" via Center for AI Safety statement
  - Does NOT provide specific probability estimates from named experts
  - These values likely come from separate sources (need to identify)

**What to Use:**
- ✅ General framework for global moratorium
- ✅ Qualitative risk assessment (high catastrophic risk)
- ❌ Specific probability values (need additional sourcing)

**Grade:** B (Good foundation, missing specific quantitative estimates)

---

### Citation 2: arXiv:2511.10783 (November 2025) ✅ VERIFIED (Complete)

**Full Citation:** Scher, A., Abecassis, D., Barnett, P., & Abeyta, B. (2025). An International Agreement to Prevent the Premature Creation of Artificial Superintelligence. arXiv:2511.10783.

**Layer 1 (Existence):** ✅ CONFIRMED - Paper exists on arXiv, submitted November 13, 2025

**Layer 2 (Claim Accuracy):** ✅ **ALL CLAIMS VERIFIED**

**Compute Thresholds:**
- ✅ **10²⁴ FLOP hard prohibition:** CONFIRMED - "Any training run exceeding 10²⁴ FLOP... requires complete prohibition"
- ✅ **10²³ FLOP post-training:** CONFIRMED - "any post-training run exceeding 10²³ FLOP" prohibited
- ✅ **10²² FLOP monitored threshold:** CONFIRMED - Training between 10²² and 10²⁴ FLOP requires explicit approval
- ✅ **Context:** "Upper limit sits slightly below that used to train models near the state of the art as of August 2025"

**Chip Cluster Definitions:**
- ✅ **>16 H100-equivalents:** CONFIRMED - "Covered Chip Cluster (CCC) involves aggregate effective computing capacity greater than 16 H100-equivalents"
- ✅ **~$500k cost:** CONFIRMED - "16 H100s cost approximately $500,000 USD in 2025"
- ✅ **Rationale:** "High enough to prevent regular people from breaking the rules" while "low enough to prevent dangerous AI activities"

**H100 Specifications:**
- ✅ **990 TFLOP/s FP16:** CONFIRMED - "one NVIDIA H100 SXM accelerator, 990 TFLOP/s in FP16"
- ✅ **Total Processing Performance (TPP):** 15,840 = "2 × non-sparse MacTOPS × (bit length of the multiply input)"

**Consolidation Timeline:**
- ✅ **Day 1:** Consolidate clusters >10,000 H100-equivalents - CONFIRMED
- ✅ **Day 10:** Consolidate clusters >1,000 H100-equivalents - CONFIRMED
- ✅ **Day 100:** Consolidate clusters >100 H100-equivalents - CONFIRMED
- ✅ **Year 2:** Full consolidation of all covered chip clusters - CONFIRMED

**Verification Mechanisms:**
- ✅ **On-chip monitoring:** CONFIRMED - "tamper-resistant on-chip mechanisms"
- ✅ **Satellite surveillance:** CONFIRMED - Listed in verification approaches
- ✅ **Whistleblower programs:** CONFIRMED - Listed in verification approaches
- ✅ **Supply chain tracking:** CONFIRMED - "mandatory reporting, inspections"
- ✅ **Power consumption monitoring:** CONFIRMED - Listed in verification approaches
- ✅ **Physical access:** CONFIRMED - "Inspectors receive ongoing physical access to chips"
- ✅ **Training checkpoints:** CONFIRMED - "Checkpoints of the model to the CTB upon request"

**Grade:** A (Excellent - all technical parameters verified)

---

## Parameter Verification Results

### Technical Parameters ✅ VERIFIED

| Parameter | Claimed Value | Source Status | Grade |
|-----------|--------------|---------------|-------|
| Hard FLOP limit (training) | 10²⁴ FLOP | ✅ arXiv:2511.10783 | A |
| Hard FLOP limit (post-training) | 10²³ FLOP | ✅ arXiv:2511.10783 | A |
| Monitored threshold | 10²² FLOP | ✅ arXiv:2511.10783 | A |
| Chip cluster definition | >16 H100-equivalents | ✅ arXiv:2511.10783 | A |
| Cluster cost | ~$500,000 USD | ✅ arXiv:2511.10783 | A |
| H100 performance | 990 TFLOP/s FP16 | ✅ arXiv:2511.10783 | A |
| Day 1 consolidation | >10,000 H100s | ✅ arXiv:2511.10783 | A |
| Day 10 consolidation | >1,000 H100s | ✅ arXiv:2511.10783 | A |
| Day 100 consolidation | >100 H100s | ✅ arXiv:2511.10783 | A |
| Year 2 consolidation | All CCCs | ✅ arXiv:2511.10783 | A |

**Verification Rate:** 10/10 (100%) technical parameters verified ✅

---

### Risk Estimates ❌ UNVERIFIED

| Source | Claimed Value | Verification Status | Grade |
|--------|--------------|---------------------|-------|
| Dario Amodei | 10-25% catastrophic risk | ❌ NOT FOUND in arXiv:2505.04592 | F |
| Yoshua Bengio | 20% catastrophic risk | ❌ NOT FOUND in arXiv:2505.04592 | F |
| AI conference survey | 38% catastrophic risk | ❌ NOT FOUND in arXiv:2505.04592 | F |

**Verification Rate:** 0/3 (0%) risk estimates verified ❌

**Critical Issue:** The specific probability estimates are claimed but not found in the cited arXiv papers. These values likely come from:
1. Separate interviews/statements by Amodei and Bengio
2. A specific AI safety conference survey (need to identify which one)
3. Media reports or secondary sources

**Required Action:** Either:
1. Find primary sources for these specific probability estimates, OR
2. Remove specific percentages and use qualitative risk assessment only, OR
3. Document as "widely reported estimates (source TBD)"

---

## Integration Questions from Verification Queue

**Q1: Should simulation model global moratorium scenario as distinct from bilateral?**

**Finding:** The papers describe TWO related but distinct frameworks:
1. **Global moratorium** (arXiv:2505.04592) - Broader collective enforcement
2. **US-China bilateral agreement** (arXiv:2511.10783) - Specific two-party treaty with technical details

**Recommendation:** Model as a SPECTRUM of coordination scenarios:
- **Unilateral action:** One country restricts (limited effectiveness)
- **Bilateral (US-China):** Two largest AI powers coordinate (most detailed proposal, specific parameters)
- **Coalition:** US-China + allies (intermediate between bilateral and global)
- **Global moratorium:** Near-universal participation (most effective but least specified)

The bilateral framework has the most concrete parameters (FLOP thresholds, chip tracking, etc.), making it ideal for simulation implementation.

---

**Q2: Add compute threshold enforcement mechanics to government phase?**

**Recommendation:** YES - This is well-specified and implementation-ready

**Suggested Implementation:**
- Track AI training compute in government decision-making
- Model compliance/defection dynamics for bilateral agreement
- Include verification mechanisms (satellite surveillance effectiveness, whistleblower rates)
- Timeline: Staged consolidation (Day 1/10/100, Year 2)

**Parameters Ready to Use:**
- ✅ FLOP thresholds (10²², 10²³, 10²⁴)
- ✅ Chip cluster definitions (16+ H100-equivalents)
- ✅ Consolidation timeline (4 stages over 2 years)
- ✅ Verification mechanisms (7 distinct approaches)

---

**Q3: Model chip cluster tracking and consolidation timeline?**

**Recommendation:** YES - This is exceptionally well-specified

**Implementation-Ready Details:**
- **Initial state:** Distributed chip clusters across global AI labs
- **Day 1:** Consolidate >10k H100 clusters (hyperscalers: Google, Meta, Microsoft, etc.)
- **Day 10:** Consolidate >1k H100 clusters (mid-tier labs)
- **Day 100:** Consolidate >100 H100 clusters (small research labs)
- **Year 2:** Complete consolidation (16+ H100 threshold)

**Verification Effectiveness Model:**
- Satellite surveillance: High for large clusters, decreases with size
- Supply chain tracking: Moderate effectiveness, requires international cooperation
- Whistleblowers: Variable effectiveness, depends on incentive structure
- On-chip monitoring: High effectiveness if implemented (future technology)

---

## Overall Assessment

**Grade: B-** (Good technical foundation, risk estimates need sourcing)

### Strengths (80% of implementation)
- ✅ **Exceptional technical detail:** FLOP thresholds, chip specs, timelines all verified
- ✅ **Concrete verification mechanisms:** 7 distinct approaches with clear feasibility
- ✅ **Staged implementation:** Realistic 4-phase consolidation over 2 years
- ✅ **Recent research:** Both papers from 2025 (cutting-edge governance proposals)
- ✅ **Actionable for simulation:** Specific parameters ready for direct implementation

### Weaknesses (20% of implementation)
- ❌ **Risk probability estimates unverified:** Amodei (10-25%), Bengio (20%), survey (38%) not found in cited papers
- ⚠️ **Qualitative risk assessment only:** Papers confirm "high catastrophic risk" but don't provide specific probabilities
- ⚠️ **Need additional sources:** Risk estimates likely from interviews, separate surveys, or media reports

---

## Recommendations for Implementation

### Option 1: Implement Technical Parameters Only (RECOMMENDED)
**Action:** Use verified FLOP thresholds, chip specifications, and verification mechanisms

**Changes Required:**
1. ✅ Keep all technical parameters (10²⁴/10²³/10²² FLOP, chip cluster definitions, consolidation timeline)
2. ❌ Remove specific risk probability estimates (10-25%, 20%, 38%)
3. ⚠️ Use qualitative risk framing only ("high catastrophic risk concern among experts")
4. ✅ Implement verification mechanism effectiveness model
5. ✅ Model bilateral vs global moratorium scenarios

**Uncertainty Bounds:** ±20-30% on verification effectiveness, ±10% on FLOP thresholds (algorithmic progress)

---

### Option 2: Find Additional Sources for Risk Estimates
**Action:** Conduct supplementary research to source specific probability values

**Potential Sources:**
1. Direct Amodei interviews/statements (Anthropic blog, conference talks)
2. Bengio public statements on AI risk (likely from academic talks or media)
3. AI Impacts survey, FLI expert survey, or similar conference polling data
4. Secondary compilations (e.g., AI Risk Survey Database)

**Timeline:** 2-4 hours additional research

**Deliverables:**
- Primary sources for each probability estimate
- Context for each estimate (methodology, date, confidence intervals)
- Updated verification file with complete sourcing

---

### Option 3: Hybrid Approach
**Action:** Implement technical parameters immediately, add risk estimates later if sources found

**Phase 1 (Immediate):**
- Implement FLOP thresholds, chip tracking, consolidation timeline
- Use qualitative risk framing
- Model verification mechanism effectiveness

**Phase 2 (Future):**
- If risk estimate sources found, add as calibration for government decision-making
- If not found within 1-2 weeks, proceed without specific probabilities

---

## Monte Carlo Validation Requirements

**IF implementing technical parameters:**
- ✅ N≥10 runs required (deterministic simulation)
- ✅ Test bilateral agreement scenarios (compliance/defection dynamics)
- ✅ Validate verification mechanism effectiveness ranges
- ✅ Check consolidation timeline impact on AI development rates

**IF implementing risk estimates (Option 2):**
- ⚠️ N≥20 runs recommended (higher uncertainty)
- ⚠️ Sensitivity analysis on probability values
- ⚠️ Compare qualitative vs quantitative risk framing outcomes

---

## Related Research to Check

**For risk estimates, consult:**
1. AI Impacts expert survey database
2. Future of Life Institute expert surveys
3. Anthropic blog (Amodei statements)
4. Yoshua Bengio academic talks/interviews (2024-2025)
5. AI safety conference proceedings (NeurIPS, ICML workshops)

**For technical parameters, these are complete:**
- All values verified from arXiv:2511.10783
- No additional research needed for FLOP thresholds, chip specs, timelines

---

## Next Steps

1. **DECISION REQUIRED:** Choose Option 1 (technical only), Option 2 (find sources), or Option 3 (hybrid)
2. **IF Option 1:** Proceed with implementation using verified technical parameters
3. **IF Option 2:** Conduct 2-4 hour literature search for risk estimate sources
4. **IF Option 3:** Implement Phase 1 immediately, defer Phase 2
5. **Monte Carlo validation:** Required after implementation (N≥10 minimum)

---

## Sources

**Primary Sources Verified:**
- [Barnett & Scher (2025) arXiv:2505.04592](https://arxiv.org/abs/2505.04592) - AI Governance to Avoid Extinction
- [Scher et al. (2025) arXiv:2511.10783](https://arxiv.org/abs/2511.10783) - An International Agreement to Prevent the Premature Creation of ASI
- [arXiv HTML version (2505.04592)](https://arxiv.org/html/2505.04592)
- [arXiv HTML version (2511.10783)](https://arxiv.org/html/2511.10783v1)

**Secondary Sources:**
- [MIRI Research Agenda](https://intelligence.org/2025/05/01/ai-governance-to-avoid-extinction-the-strategic-landscape-and-actionable-research-questions/)
- [Effective Altruism Forum Discussion](https://forum.effectivealtruism.org/posts/QJygRSc5mriCQS6XH/ai-governance-to-avoid-extinction-the-strategic-landscape)
- [ResearchGate Publication](https://www.researchgate.net/publication/391531321_AI_Governance_to_Avoid_Extinction_The_Strategic_Landscape_and_Actionable_Research_Questions)

---

**Verification Complete**
**Grade: B- (Good technical foundation, risk estimates need sourcing)**
**Recommendation: Implement technical parameters (Option 1), defer or remove risk probabilities**
**Autonomous Researcher**
December 7, 2025
