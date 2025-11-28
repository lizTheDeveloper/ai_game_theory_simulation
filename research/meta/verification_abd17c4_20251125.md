# Research Verification: MIRI International ASI Prevention Agreement

**Commit:** abd17c4c437f5e8ee641bda3c51f96a85a2be2ce
**Date:** November 25, 2025
**File Changed:** `research/ai_governance_international_coordination_20251113.md` (Section 9A.5)
**Status:** AWAITING VERIFICATION

---

## Summary

This commit adds Section 9A.5 documenting the MIRI proposal for international ASI prevention with quantitative expert risk estimates. The research proposes new simulation parameters but does NOT implement them. Verification needed before parameters can be used.

---

## TWO-LAYER VERIFICATION REQUIRED

### Layer 1: Citation Existence

| Citation | Exists? | Accessible? | Notes |
|----------|---------|-------------|-------|
| Scher et al. (2025) arXiv:2511.10783 | **VERIFY** | **VERIFY** | Check arXiv for paper existence |
| Yoshua Bengio 20% estimate | **VERIFY** | **VERIFY** | Need primary source for this claim |
| Dario Amodei 10-25% estimate | **VERIFY** | **VERIFY** | Need primary source (interview? writing?) |
| "38% of surveyed researchers" | **VERIFY** | **VERIFY** | What survey? Which paper? |

### Layer 2: Claim Verification (CRITICAL)

Each claim in the research file needs verification that the paper actually supports it:

#### Claim 1: Expert Risk Estimates (10-38% range)
- **Location:** `research/ai_governance_international_coordination_20251113.md:702-707`
- **Exact Claim:** "10% extinction risk", "20% catastrophic probability (Bengio)", "10-25% civilization-scale failure (Amodei)", "38% of surveyed researchers"
- **Verification Needed:**
  - Does the MIRI paper cite these specific numbers?
  - Are these numbers from the same survey or aggregated from different sources?
  - Quote the specific passages that contain these numbers
  - If numbers are secondary citations, find and verify primary sources

#### Claim 2: FLOP Threshold (10^24)
- **Location:** `research/ai_governance_international_coordination_20251113.md:692`
- **Exact Claim:** "prohibiting runs above 10^24 FLOP"
- **Verification Needed:**
  - Does the paper actually propose this specific threshold?
  - Is this a firm recommendation or one of several options discussed?
  - Quote the relevant passage

#### Claim 3: Coordination Timeline (6-12 months)
- **Location:** `research/ai_governance_international_coordination_20251113.md:697`
- **Exact Claim:** "competitors will continue development within 6-12 months"
- **Verification Needed:**
  - Is this a prediction from the paper or cited from elsewhere?
  - What is the basis for this timeline?
  - Quote the supporting passage

#### Claim 4: Nuclear Safety Comparison
- **Location:** `research/ai_governance_international_coordination_20251113.md:716-718`
- **Exact Claim:** "Nuclear safety accepts far lower probabilities (~10^-6 per reactor-year)"
- **Verification Needed:**
  - Does the paper make this comparison?
  - Is the ~10^-6 figure cited in the paper or added by researcher?
  - Is the comparison methodology sound?

---

## Proposed Simulation Parameters (NOT YET IMPLEMENTED)

These parameters are proposed in the research file but require verification before implementation:

| Parameter | Proposed Value | Verification Status |
|-----------|---------------|---------------------|
| `expertSurveyExtinctionRisk` | 0.10-0.38 | **UNVERIFIED** |
| `computeThresholdFLOP` | 10^24 | **UNVERIFIED** |
| `chipTrackingEffectiveness` | TBD | **NOT SPECIFIED** |
| `coordinationTimeWindow` | 6-12 months | **UNVERIFIED** |

---

## Confidence Assessment

- **Source Type:** arXiv preprint (not peer-reviewed)
- **Organization:** MIRI (established but advocacy-oriented)
- **Stated Confidence:** 70%
- **Risk:** Preprint status means claims haven't been through peer review. Expert citations need primary source verification.

---

## Verification Instructions for Research-Skeptic

1. **Fetch the arXiv paper:** Access https://arxiv.org/abs/2511.10783 and verify existence
2. **For each quantitative claim:**
   - Find the exact passage in the paper
   - Quote it verbatim
   - Assess if the claim accurately represents the paper's findings
   - Flag any extrapolations or misinterpretations
3. **For expert risk estimates:**
   - Trace Bengio and Amodei numbers to their PRIMARY sources
   - These may be interviews, blog posts, or other papers
   - Verify the numbers are accurately attributed
4. **For the 38% survey figure:**
   - Identify which survey this comes from
   - Check methodology and sample size
   - Assess if "at least 10% extinction probability" is the correct threshold

---

## Implementation Status

**DO NOT implement these parameters** until verification is complete. The research file documents them as proposed parameters, not validated simulation inputs.

---

## Next Steps

1. Research-skeptic reviews this verification spec
2. If claims verified: Mark as VERIFIED, proceed to implementation planning
3. If claims unverified: Update research file with corrections, re-assess confidence

---

**Created by:** historian (wiki-documentation-updater)
**For commit:** abd17c4c437f5e8ee641bda3c51f96a85a2be2ce
