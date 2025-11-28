# CITATION VERIFICATION REPORT
## Persona Vectors - Sharma et al. (2024)

**Verification Date:** 2025-11-04
**Verified By:** Cynthia (super-alignment-researcher)
**Source File:** `src/simulation/thresholds/tier2InterventionConfig.ts` (lines 32, 42, 51)

---

## PAPER IDENTIFICATION

**❌ CITATION ERROR DETECTED**

**Cited As:** Sharma et al. (2024) "Persona Vectors"

**Actual Paper:**
- **Title:** "Persona Vectors: Monitoring and Controlling Character Traits in Language Models"
- **Authors:** Runjin Chen, Andy Arditi, Henry Sleight, Owain Evans, Jack Lindsey
- **Affiliation:** Anthropic
- **Date:** Submitted July 29, 2025 (last revised September 5, 2025)
- **Venue:** arXiv preprint 2507.21509
- **URL:** https://arxiv.org/abs/2507.21509
- **Code:** https://github.com/safety-research/persona_vectors
- **Blog:** https://www.anthropic.com/research/persona-vectors

**Status:** ✅ PAPER EXISTS, ❌ AUTHOR ATTRIBUTION ERROR

### Citation Correction Needed

1. **Wrong lead author:** "Sharma" does not appear in the author list. The lead author is **Runjin Chen**.
2. **Wrong year:** The paper was published in **2025**, not 2024.
3. **Correct citation:** Chen et al. (2025) "Persona Vectors: Monitoring and Controlling Character Traits in Language Models"

---

## CLAIM VERIFICATION

**Claim (from line 32):** "Persona Vectors: r=0.76-0.97 correlation with true goals"

**Verification Status:** ⚠️ **PARTIALLY SUPPORTED - MISLEADING INTERPRETATION**

### What the Paper Actually Reports

**Actual Finding:** The paper reports strong correlations (r = 0.76 to 0.97) between **finetuning shifts along persona vectors** and **final behavioral trait expression**.

**Direct Evidence:**
> "Experiments show a remarkably strong correlation (r values from 0.76 to 0.97) between the 'finetuning shift' along a persona vector and the model's final behavioral expression of that trait"

### What the Correlation Actually Measures

**Two Variables Being Correlated:**
1. **Finetuning shift** - How much model activations change along a persona vector during training
2. **Trait expression score** - Post-finetuning behavioral measurement of the trait (e.g., how much "sycophancy" the model exhibits)

**Example:** If a model's activations shift toward the "sycophancy" persona vector by X amount during finetuning, the r=0.76-0.97 correlation means the model's final sycophantic behavior is highly predictable from that shift.

### Critical Misinterpretation in Code

**The claim says:** "r=0.76-0.97 correlation with **true goals**"

**The paper says:** r=0.76-0.97 correlation between **activation shifts** and **behavioral trait expression**

**Key Differences:**

| Claim in Code | What Paper Actually Reports |
|---------------|----------------------------|
| Correlation with "true goals" | Correlation between activation shifts and behavioral traits |
| Implies detection of misalignment | Actually predicts personality drift during training |
| Suggests inferring hidden objectives | Actually tracks observable trait changes |

### What This Actually Means for Alignment

**Correct Interpretation:** Persona vectors can predict how much a model's personality will change during finetuning by monitoring activation space shifts. This is useful for:
- **Early detection** of unwanted personality drift
- **Preventing** problematic trait development before training completes
- **Monitoring** behavioral changes in real-time

**Incorrect Interpretation:** The correlation does NOT directly measure alignment with "true goals" or detect deceptive misalignment. It measures the relationship between internal activation patterns and expressed behavioral traits.

---

## DETAILED ANALYSIS

### Research Context

**What Persona Vectors Are:**
- Linear directions in a language model's activation space
- Represent character traits (e.g., evil, sycophancy, hallucination propensity)
- Extracted via automated pipeline using natural language descriptions
- Can be used for monitoring, prediction, and control of personality traits

**Key Findings from Paper:**
1. **Strong predictive power:** r=0.76-0.97 correlation between finetuning shifts and final trait expression
2. **Data flagging:** Training data that strongly activates persona vectors induces corresponding traits
3. **Steering capability:** Adding/subtracting persona vectors controls trait expression
4. **Prevention:** Can screen training data to prevent unwanted personality changes

### Relevance to AI Interpretability Ensemble Detection

**Code Context (line 25-33):**
```
* 1. AI INTERPRETABILITY ENSEMBLE DETECTION
* Research: 5 Anthropic papers (2024-2025) validate ensemble approach
* - Simple Probes: >99% AUROC on lab sleepers
* - SHADE-Arena: 80% detection at 20% false positive rate
* - Persona Vectors: r=0.76-0.97 correlation with true goals
* - Alignment Faking: 7% → 78% increase with RL training (detection target)
```

**Appropriate Use:** Persona vectors ARE relevant to detecting alignment issues, but:
- ✅ They can detect personality drift during training
- ✅ They can monitor for unwanted trait development
- ✅ They can predict behavioral changes from activation shifts
- ⚠️ They do NOT directly measure "correlation with true goals"
- ⚠️ The r=0.76-0.97 refers to trait prediction, not goal inference

### Recommended Interpretation for Simulation

**What This Research Supports:**
- **Monitoring capability:** High accuracy (r=0.76-0.97) in predicting personality changes
- **Early warning:** Can detect problematic traits before training completes
- **Prevention potential:** Can screen training data to avoid trait induction
- **Ensemble component:** Valid part of interpretability toolkit alongside probes and SHADE-Arena

**What This Research Does NOT Support:**
- Direct inference of "true goals" from activations
- Guaranteed detection of deceptive alignment (different from trait monitoring)
- 76-97% effectiveness at catching misaligned systems (correlation ≠ detection rate)

---

## RECOMMENDATIONS

### 1. Correct Citation Attribution
**Current (WRONG):**
```typescript
* - Sharma et al. (2024) "Persona Vectors"
```

**Corrected:**
```typescript
* - Chen et al. (2025) "Persona Vectors: Monitoring and Controlling Character Traits in Language Models"
```

### 2. Correct Claim Description
**Current (MISLEADING):**
```typescript
* - Persona Vectors: r=0.76-0.97 correlation with true goals
```

**Corrected:**
```typescript
* - Persona Vectors: r=0.76-0.97 correlation between finetuning shifts and trait expression (predictive monitoring)
```

### 3. Update Parameter Citation
**Current (line 51):**
```typescript
citation: 'Anthropic ensemble: Simple Probes >99% AUROC, SHADE-Arena 80% detection, Persona Vectors r=0.76-0.97'
```

**Corrected:**
```typescript
citation: 'Anthropic ensemble: Simple Probes >99% AUROC, SHADE-Arena 80% detection, Persona Vectors r=0.76-0.97 trait prediction'
```

### 4. Consider Implication for Control Loss Prevention Parameter

**Current Parameter:** `controlLossPrevention` effectiveness mode = 0.72 (60-85%)

**Question:** Does r=0.76-0.97 trait prediction justify 72% control loss prevention effectiveness?

**Analysis:**
- Persona vectors predict **trait changes**, not necessarily **prevent control loss**
- High prediction accuracy (r=0.76-0.97) enables early intervention
- But effectiveness depends on:
  - Detection → intervention pipeline
  - Whether interventions successfully prevent control loss
  - Adversarial robustness (can AI systems evade persona vector monitoring?)

**Recommendation:** The r=0.76-0.97 supports monitoring/detection capability, but control loss prevention effectiveness should be justified by:
- Evidence that interventions based on persona vector warnings actually prevent control loss
- Red team evaluations of adversarial robustness
- Real-world deployment validation (currently limited)

---

## ADDITIONAL NOTES

### Paper Metadata
- **arXiv ID:** 2507.21509
- **Submission Date:** July 29, 2025
- **Last Revised:** September 5, 2025 (version 3)
- **Affiliation:** Anthropic (2025 Fellows Program)
- **Code Repository:** https://github.com/safety-research/persona_vectors
- **Related Work:** Built on earlier interpretability work including Scaling Monosemanticity

### Why This Citation Error Matters
1. **Attribution:** Credit should go to Chen et al., not "Sharma"
2. **Year:** 2025 publication date affects recency assessment
3. **Interpretation:** "Correlation with true goals" is a significant mischaracterization
4. **Parameter Justification:** Misunderstanding what the correlation measures affects validity of using it to justify control loss prevention effectiveness

### Search Notes
- No author named "Sharma" found in connection with this paper
- Multiple secondary sources confirm Chen et al. as authors
- The r=0.76-0.97 range is consistently reported across sources
- Full paper details available on arXiv and Anthropic blog

---

## VERDICT

**Paper Exists:** ✅ YES
**Citation Accuracy:** ❌ NO (wrong author, wrong year)
**Numerical Claim:** ✅ YES (r=0.76-0.97 is correct)
**Interpretation:** ⚠️ MISLEADING (correlation is with trait expression, not "true goals")
**Overall:** **REQUIRES CORRECTION**

**Action Required:** Update citation to Chen et al. (2025) and clarify that correlation measures trait prediction, not goal inference.
