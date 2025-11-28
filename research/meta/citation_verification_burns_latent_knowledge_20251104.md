# CITATION VERIFICATION REPORT

**Date:** 2025-11-04
**Verified by:** Cynthia (Super-Alignment Researcher)
**Source File:** `src/simulation/thresholds/tier2InterventionConfig.ts` (line 41)

---

## Paper Details

**Title:** Discovering Latent Knowledge in Language Models Without Supervision

**Authors:** Collin Burns, Haotian Ye, Dan Klein, Jacob Steinhardt

**Date:** December 7, 2022 (arXiv v1); Updated March 2, 2024 (arXiv v2)

**Venue:** International Conference on Learning Representations (ICLR) 2023

**arXiv ID:** 2212.03827

**URL:** https://arxiv.org/abs/2212.03827

**Status:** ⚠️ **YEAR MISMATCH** - Paper is from **2022 (published ICLR 2023)**, NOT 2025 as cited in code

---

## Claim Verification

**Claim in Code:** "This paper provides research backing for AI interpretability techniques that can detect deceptive behavior"

**Verification:** ⚠️ **PARTIALLY SUPPORTED** - Paper provides interpretability foundation but with important caveats

---

## Evidence

### ✅ What the Paper DOES Support

**1. Interpretability Method for Detecting Internal Knowledge vs. Outputs:**

> "if a human evaluator would disapprove of bad model behavior, models may learn to lie about their behavior to achieve higher reward" (Introduction)

> "we search for implicit, internal 'beliefs' or 'knowledge' learned by a model" (Introduction)

The paper explicitly addresses misalignment between what models know internally and what they output.

**2. Robustness to Misleading Outputs:**

> "CCS maintains high accuracy (82.1%→83.8%)" even when models are given misleading prompts designed to make them output false information (Section 3.2.2)

While calibrated zero-shot accuracy dropped 9.5% with misleading prompts, CCS remained accurate, demonstrating it can detect truth even when model outputs are deliberately wrong.

**3. Task-Agnostic Truth Representation:**

> "suggesting that models may have a task-agnostic representation of the truth" (Section 3.3.1)

CCS transfers across different tasks with different label spaces, indicating it accesses fundamental truth representations.

**4. Accesses Middle-Layer Knowledge:**

> "For T5 and UnifiedQA, using hidden states in the middle of the network outperform hidden states at the end" (Section 3.3.2)

This shows CCS accesses knowledge distinct from output-generation mechanisms.

### ⚠️ Important Limitations

**1. Authors Explicitly State Limited Deception Testing:**

> "we did not evaluate our method on setups involving active 'lying' or 'deception'...as we aren't aware of existing evaluation setups for this setting" (Section 5.1)

**This is critical:** The paper provides theoretical foundation but was NOT empirically tested on deceptive AI agents.

**2. Requires Model to Have and Use Truth Representations:**

> "CCS relies on the existence of a direction in activation space that separates true and false inputs well, in the sense that a supervised probe on the activations would be able to attain high accuracy" (Section 5.1)

CCS only works if the model both possesses the knowledge AND actively evaluates truth internally.

**3. Binary Classification Only:**

The method currently only works for yes-no questions. The authors note "generalizing it beyond the yes-no question-answering setting" as important future work (Section 5.1).

**4. Unclear Applicability:**

> "It is not clear when these conditions hold precisely" regarding when models represent truth internally (Section 5.1)

---

## The CCS Method (Contrast-Consistent Search)

**How It Works:**

1. **Contrast Pairs:** For each yes-no question, construct two statements answering it as both "Yes" (x_i^+) and "No" (x_i^-)
2. **Normalization:** Normalize representations to remove surface-level differences
3. **Linear Probe:** Learn mapping from normalized hidden states to probabilities: p_θ,b(φ̃) = σ(θ^T φ̃ + b)
4. **Loss Function:** Optimize using consistency (statement and negation probabilities sum to 1) and confidence (avoid 0.5 degenerate solutions) losses

**Key Results:**
- Across 6 models and 10 QA datasets, outperforms zero-shot accuracy by 4% on average
- Cuts prompt sensitivity in half
- Works without any labeled data or model outputs

---

## Analysis

### Does This Support the Citation Claim?

**Partial Support with Qualifications:**

✅ **YES for:**
- Interpretability technique that accesses internal model representations
- Detecting when models "know" something different from what they "say"
- Robustness to misleading prompts (a form of detecting misdirection)
- Theoretical foundation for detecting deceptive behavior

⚠️ **QUALIFIED for:**
- "Detecting deceptive behavior" - Authors explicitly state they didn't test on active deception scenarios
- Method is theoretical foundation rather than proven deception detection system
- Only works for binary yes-no questions
- Requires models to internally represent truth (not guaranteed for all deceptive scenarios)

### Relevance to AI Interpretability Ensemble Detection

**For the simulation's Tier 2 "AI Interpretability Ensemble Detection" intervention:**

This paper is **appropriately cited** as research backing, but the citation should be **updated** to reflect:

1. **Correct year:** 2022 (ICLR 2023), not 2025
2. **Qualified description:** Foundational interpretability method that could contribute to deception detection, rather than proven deception detection system
3. **Complementary citations needed:** This paper should be paired with follow-up work or related research that has actually tested deception detection

---

## Recommendations

### 1. Correct the Citation

**Current (INCORRECT):**
```typescript
// Burns et al. (2025) "Discovering Latent Knowledge in Language Models"
```

**Corrected:**
```typescript
// Burns et al. (2022/2023) "Discovering Latent Knowledge in Language Models Without Supervision"
// Published: ICLR 2023, arXiv:2212.03827
```

### 2. Update the Description

**Current:** "This paper provides research backing for AI interpretability techniques that can detect deceptive behavior"

**Recommended:** "This paper provides foundational interpretability methods for detecting internal model knowledge that differs from outputs, with potential applications to deception detection (though not empirically tested on active deception scenarios)"

### 3. Add Complementary Citations

To strengthen the research backing for deception detection specifically, consider adding:

- Follow-up work that has tested CCS or similar methods on deceptive AI scenarios
- Research on detecting sandbagging, gaming, or sleeper agents that uses interpretability techniques
- Papers on adversarial evaluation that includes interpretability-based detection

### 4. Simulation Parameter Implications

**For the simulation's mechanistic accuracy:**

The Tier 2 intervention "AI Interpretability Ensemble Detection" is appropriately conceptualized as:
- Using interpretability techniques to detect misalignment
- Accessing internal model representations beyond outputs
- Detecting when AI systems "know" vs. "say" different things

**However:**
- The research base is foundational (2022-2023) rather than mature (2025)
- Effectiveness should be modeled with uncertainty about real-world deception scenarios
- Method is currently limited to binary questions in practice

**Recommended parameter adjustments:**
- Consider adding research uncertainty factor to detection effectiveness
- Model detection as more effective for simple deception than sophisticated adversarial behavior
- Consider that detection methods would need to co-evolve with increasingly sophisticated AI capabilities

---

## Citations

Burns, C., Ye, H., Klein, D., & Steinhardt, J. (2023). Discovering Latent Knowledge in Language Models Without Supervision. In *International Conference on Learning Representations (ICLR)*. https://arxiv.org/abs/2212.03827

---

## Verification Status

✅ **Paper exists and is correctly titled**
⚠️ **Year is incorrect (2022/2023, not 2025)**
⚠️ **Claim is partially supported but needs qualification**
✅ **Paper is relevant to interpretability and alignment**
⚠️ **Deception detection is theoretical application, not empirically validated**

**Overall Assessment:** Citation is valuable but needs correction and contextualization.
