# Research Verification: AI Governance 2025 Proposals

**Commit:** ff6ff02cc21624329871173ac5e25e4953e7cb9a
**Verification Date:** December 7, 2025
**Researcher:** Autonomous Researcher
**Status:** ✅ LAYER 1 VERIFIED, ⚠️ LAYER 2 PARTIAL (PDF extraction issues)

---

## Executive Summary

**Grade: B+ (Good - Papers exist but full quantitative verification incomplete)**

Both 2025 arXiv papers exist and are legitimate, with clear governance frameworks. However, PDF extraction limitations prevented full verification of specific quantitative parameters (compute thresholds, chip specifications, timelines). The papers are preprints (not peer-reviewed), which is appropriate for cutting-edge 2025 governance proposals but means claims haven't undergone formal peer review.

**Recommendation:** CONDITIONAL PASS - Papers are credible sources for near-future governance scenarios. Mark parameters as "based on policy proposals (not empirical data)" in implementation.

---

## Layer 1 Verification: Citation Existence

### ✅ Citation 1: Global Moratorium Framework - VERIFIED

**Source:** arXiv:2505.04592
**Submitted:** May 7, 2025
**Title:** "AI Governance to Avoid Extinction: The Strategic Landscape and Actionable Research Questions"
**Authors:** Peter Barnett, Aaron Scher (Machine Intelligence Research Institute, Technical Governance Team)
**Status:** ✅ PAPER EXISTS AND IS ACCESSIBLE

**Content Overview (from abstract):**
- Discusses coordinated, collectively enforced moratorium on dangerous AI
- Proposes "Halt" - global moratorium lasting potentially decades
- Maintained until robust solutions to technical problems ensure powerful AI won't cause catastrophe
- Addresses human extinction risk as default trajectory

**Sources:**
- [arXiv Abstract](https://arxiv.org/abs/2505.04592)
- [arXiv PDF](https://arxiv.org/pdf/2505.04592)
- [MIRI Official Page](https://intelligence.org/2025/05/01/ai-governance-to-avoid-extinction-the-strategic-landscape-and-actionable-research-questions/)
- [EA Forum Discussion](https://forum.effectivealtruism.org/posts/QJygRSc5mriCQS6XH/ai-governance-to-avoid-extinction-the-strategic-landscape)

---

### ✅ Citation 2: US-China Bilateral Framework - VERIFIED

**Source:** arXiv:2511.10783
**Submitted:** November 2025 (v2: November 17, 2025)
**Title:** "An International Agreement to Prevent the Premature Creation of Artificial Superintelligence"
**Authors:** Scher, Abecassis, Barnett, Abeyta
**Status:** ✅ PAPER EXISTS AND IS ACCESSIBLE

**Content Overview (from abstract):**
- Proposes international agreement to prevent premature ASI development
- Coalition led by United States and China
- Restricts scale of AI training and dangerous AI research
- Operationalizes limits via FLOP thresholds
- Verifies through tracking of AI chips and chip use verification
- Addresses catastrophic risks: misaligned ASI, geopolitical instability, misuse

**Sources:**
- [arXiv Abstract](https://arxiv.org/abs/2511.10783)
- [arXiv PDF](https://www.arxiv.org/pdf/2511.10783)

---

## Layer 2 Verification: Claim Accuracy

### ⚠️ Verification Status: PARTIAL (PDF Extraction Issues)

**Technical Limitation:** Both PDF files encountered extraction issues when attempting to verify specific quantitative claims. The PDFs contain compressed binary streams that did not convert to readable text via web fetch tools. This is a common issue with complex academic PDFs.

**What Was Verified:**
- ✅ Both papers exist at the claimed arXiv identifiers
- ✅ Titles and authors match claimed values
- ✅ Papers are from credible institutions (MIRI Technical Governance Team)
- ✅ General themes align with claimed content (moratorium, compute thresholds, chip tracking)
- ✅ Papers published in appropriate time frame (May and November 2025)

**What Could NOT Be Verified:**
- ❌ Specific compute thresholds (10²⁴ FLOP, 10²³ FLOP)
- ❌ Chip cluster definitions (16 H100-equivalents, $500k, 990 TFLOP/s FP16)
- ❌ Consolidation timeline details (Day 1, Day 10, Day 100, Year 2)
- ❌ Catastrophic risk percentages (10-25% Amodei, 20% Bengio, 38% survey)
- ❌ Verification mechanism specifics
- ❌ 6-phase implementation structure

---

## Claims Requiring Future Verification

When full PDF text becomes accessible, verify these specific claims from research/ai_governance_international_coordination_20251113.md:

### Critical Quantitative Claims

#### Risk Estimates
- Dario Amodei: 10-25% catastrophic risk
- Yoshua Bengio: 20% catastrophic risk
- AI conference survey: 38% of respondents estimate ≥10% extinction risk

#### Compute Thresholds
- Hard training prohibition: 10²⁴ FLOP
- Post-training prohibition: 10²³ FLOP
- Monitored band: 10²²-10²⁴ FLOP

#### Chip Specifications
- Covered Chip Cluster (CCC): >16 H100-equivalents
- CCC cost threshold: ~$500k USD
- H100 equivalent: 990 TFLOP/s FP16

#### Consolidation Timeline
| Phase | Threshold |
|-------|-----------|
| Day 1 | >10,000 H100-eq |
| Day 10 | >1,000 H100-eq |
| Day 100 | >100 H100-eq |
| Year 2 | All CCCs |

#### Verification Mechanisms
1. Hardware tracking (CCC reporting, supply chain, power, satellite)
2. Chip-use verification (inspections, on-chip monitoring)
3. Human intelligence (whistleblowers, stings, black market)
4. Technical oversight (training code, data, checkpoints)

---

## Research Quality Assessment

### Paper Credibility: B+ (High)

**Strengths:**
- ✅ Legitimate arXiv preprints from 2025
- ✅ Authors from credible institution (MIRI - Machine Intelligence Research Institute)
- ✅ Aligns with real-world governance discussions (chip export controls, compute thresholds)
- ✅ Timely (May and November 2025 - cutting edge)
- ✅ Openly accessible for verification
- ✅ Discussed in EA Forum and technical governance communities

**Limitations:**
- ⚠️ Not peer-reviewed (arXiv preprints, not journal publications)
- ⚠️ Policy proposals, not empirical research (no experimental validation)
- ⚠️ Some parameters may be authors' recommendations vs. consensus values
- ⚠️ Risk estimates cite third parties (Amodei, Bengio) - need to verify original sources

**Grade Rationale:**
- A tier requires peer-reviewed journal publication
- B+ appropriate for credible preprints from known institutions on current topics
- For 2025 governance proposals, preprints ARE the cutting edge (no journals yet)

---

## Implementation Recommendations

### Use in Simulation: CONDITIONAL APPROVAL

**Appropriate Uses:**
1. ✅ **Scenario modeling** - "What if global moratorium passed in 2026?"
2. ✅ **Governance pathway exploration** - Compare moratorium vs bilateral vs status quo
3. ✅ **Policy debate representation** - Show range of proposals being discussed
4. ✅ **Near-future forecasting** - Model 2025-2030 governance landscape

**Inappropriate Uses:**
1. ❌ **Empirical validation** - Don't claim "research shows 10²⁴ FLOP threshold works"
2. ❌ **Historical modeling** - These are proposals, not implemented policies
3. ❌ **Certain predictions** - Treat as possible futures, not likely outcomes

### Parameter Documentation

Mark all governance parameters with:
```typescript
// Based on policy proposals (arXiv 2025), not empirical validation
// Sources: Barnett & Scher 2505.04592, Scher et al. 2511.10783
// Status: Proposed frameworks, not implemented policy as of Dec 2025
```

### Uncertainty Handling

Since quantitative values couldn't be verified:
- Add ±30% uncertainty bounds to compute thresholds
- Model chip consolidation timeline with variance (e.g., "Day 10" = 7-14 days)
- Use probability distributions for governance adoption (not binary yes/no)
- Run sensitivity analysis on governance parameter effects

---

## Follow-Up Verification Steps

### Immediate (When PDFs Become Readable):
1. Extract full text from arXiv:2505.04592 and arXiv:2511.10783
2. Verify all quantitative claims with exact quotes
3. Document page numbers and section references
4. Update this verification file with findings

### Short-term (Next 1-3 months):
1. Monitor if papers get published in peer-reviewed venues
2. Check for critiques or responses from governance community
3. Track if any proposals get adopted by governments
4. Update simulation if real-world events validate/invalidate assumptions

### Medium-term (Next 6-12 months):
1. Look for empirical studies on compute threshold effectiveness
2. Monitor actual chip tracking implementation (if any)
3. Assess whether catastrophic risk consensus grows or shrinks
4. Update governance pathways based on real-world developments

---

## Simulation Integration Notes

### Parameters Proposed (from research file)

```typescript
globalMoratoriumProposed: true  // ✅ Supported by 2505.04592
offSwitchInfrastructure: 0.10   // ⚠️ Interpretation of proposal - not quantified
politicalWillForHalt: 0.15       // ⚠️ Subjective estimate - not from papers
usChinaBilateralFramework: false // ✅ Supported - proposed but not adopted
computeThresholdMonitoring: 0.05 // ⚠️ Estimate - papers propose mechanisms
catastrophicRiskConsensus: 0.30  // ⚠️ Needs verification of risk estimates
bilateralCoordinationProbability: 0.20 // ⚠️ Estimate - not from papers
globalEnforcementCapacity: 0.15  // ⚠️ Estimate - not from papers
```

**Status Assessment:**
- ✅ Boolean flags (proposed/not adopted): Well-supported
- ⚠️ Probability values (0.05-0.30): Researcher interpretations needing justification
- ⚠️ Scalar progress metrics: May need sensitivity analysis

**Recommendation:**
- Keep boolean flags as is
- Document probability values as "researcher estimates based on proposal content and expert risk statements"
- Add uncertainty ranges for Monte Carlo sampling
- Run parameter sensitivity to see if exact values matter for outcomes

---

## Grade Summary

**Overall Research Grade: B+**

| Criterion | Grade | Notes |
|-----------|-------|-------|
| Paper Existence | A | Both papers verified, accessible |
| Source Credibility | B+ | MIRI preprints, not peer-reviewed |
| Claim Support | C | PDF extraction blocked quantitative verification |
| Temporal Relevance | A+ | May and November 2025 (cutting edge) |
| Implementation Risk | B | Good for scenarios, not empirical validation |

**Final Recommendation: CONDITIONAL PASS**

- ✅ Use for governance scenario modeling
- ✅ Document as "policy proposals" not "validated parameters"
- ⚠️ Add uncertainty bounds to all quantitative values
- ⚠️ Run sensitivity analysis on governance parameter effects
- ⚠️ Re-verify when full PDF text accessible
- ⚠️ Monitor for peer review or real-world adoption

---

## Metadata

**Verification Method:** Two-layer citation verification
- Layer 1: Paper existence ✅ COMPLETE
- Layer 2: Claim accuracy ⚠️ PARTIAL (PDF extraction issues)

**Papers Reviewed:** 2 (Barnett & Scher 2025, Scher et al. 2025)
**Publication Venue:** arXiv preprints (not peer-reviewed journals)
**Research Currency:** ✅ CURRENT (May and November 2025)

**Related Research Files:**
- `research/meta/verification_ff6ff02_20251120.md` - Original verification request
- `research/ai_governance_international_coordination_20251113.md` - Source research file
- `openspec/specs/research/verification-queue.md` - Active verification queue

**Next Actions:**
1. Attempt alternative PDF extraction methods
2. Contact paper authors if needed for clarification
3. Update verification when full text accessible
4. Monitor for peer-reviewed publication

**Oldest Source:** 2025 (May) - <1 year old ✅ CURRENT
**Newest Source:** 2025 (November) - <1 month old ✅ CURRENT
**Last Verified:** December 7, 2025
