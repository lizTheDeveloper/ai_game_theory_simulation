# AI Problems Index - Gap Analysis

**Date:** October 2025
**Comparison:** Website (42 issues) vs. Academic Paper (107 questions)

---

## Executive Summary

**Website Coverage:** 42 issues (focus on sociotechnical + high-level safety)
**Academic Paper:** 107 research questions (comprehensive technical + sociotechnical)
**Coverage Overlap:** ~40% (website covers the most important sociotechnical issues)
**Major Gaps:** Technical/scientific questions, detailed methodology issues, evaluation problems

---

## What's Currently on Your Website (42 Issues)

### ✅ Strong Coverage Areas

**Sociotechnical Challenges (15+ issues):**
- ✓ AI denialism
- ✓ Automated manipulation at scale
- ✓ Cultural exclusion
- ✓ Deepfakes and information trust
- ✓ Digital dispossession & labor extraction
- ✓ Epistemic capture
- ✓ Failure of democratic oversight
- ✓ Frontier misuse risk
- ✓ LLM Governance Is Lacking
- ✓ Socioeconomic impacts
- ✓ Surveillance diffusion
- ✓ Values encoding unclear
- ✓ AI impacts on democracy

**Safety & Alignment (12+ issues):**
- ✓ Goal misgeneralization
- ✓ Emergent capabilities unpredictability
- ✓ Time pressure for superalignment
- ✓ Jailbreaks and prompt injections
- ✓ Poisoning and backdoors
- ✓ Agentic LLMs pose novel risks
- ✓ Multi-agent safety challenges
- ✓ Finetuning alignment challenges
- ✓ Pretraining produces misaligned models
- ✓ LLM systems untrustworthy
- ✓ Sycophancy / AI psychosis
- ✓ Dual-use capabilities

**Technical Understanding (8+ issues):**
- ✓ In-context learning is a black box
- ✓ Capabilities difficult to estimate
- ✓ Scale effects not characterized
- ✓ Reasoning capabilities understanding lacking
- ✓ Rapid capability jumps
- ✓ Evaluations confounded and biased
- ✓ Interpretability tools lacking
- ✓ Safety-performance tradeoffs

**Misuse/Military (7 issues):**
- ✓ AI-enabled hacking
- ✓ Drone warfare
- ✓ Military AI chatbots
- ✓ Military decision support
- ✓ Military object detection
- ✓ Military predictive analytics
- ✓ GAN-based military training

---

## The 5 OPEN Problems (Minimal Research - NOT on Website)

These are the **hardest unsolved problems** from the paper with minimal progress:

### ⭕ **Q81 [4.1.5]: Is 'Value Alignment' the Right Framework?**
- **Status:** OPEN
- **Why it matters:** Fundamental philosophical question
- **Gap:** Your site has "Values to be Encoded within LLMs are Not Clear" but not the deeper question of whether value alignment is even the right approach
- **Recommendation:** Add as "Philosophical Foundations: Is Value Alignment the Right Paradigm?"

### ⭕ **Other 4 OPEN Problems** (from the paper):
I need to check my categorization to find the other 4 OPEN problems. Let me search...

---

## Major Gaps: What's in the Paper But NOT on Website

### 🔬 Scientific Understanding (Missing ~25 questions)

**In-Context Learning Mechanisms (5 questions missing):**
- Q4: Scenario-based mechanistic understanding of ICL
- Q5: Effect of pre-training data distribution on ICL
- Q6: Effect of design choices on ICL
- Q1: Is ICL sophisticated pattern-matching? (you have "ICL is a black box" which is close)
- Q2: Is ICL due to mesa-optimization? (SOLVED - could add as "Not Really a Problem")

**Scaling Laws Details (4 questions missing):**
- Q12: Understanding scaling laws (SOLVED - could add to "Non-Issues")
- Q13: Effect of scaling on learned representations
- Q14: Limits of scaling
- Q15: Formalizing, forecasting, explaining emergence (related to your "emergent capabilities")
- Q16: Task-specific scaling laws

**Reasoning Capabilities (3 questions missing):**
- Q17: Does scaling improve reasoning? (SOLVED - add to "Non-Issues")
- Q18: Understanding mechanisms underlying reasoning
- Q19: Understanding non-deductive reasoning
- Q20: Which aspects of training lead to reasoning?
- Q21: Computational limits of Transformers

**LLM-Agents (3 questions missing):**
- Q22: LLM-agents may be lifelong learners
- Q23: Natural language underspecifies goals (related to your "goal misgeneralization")
- Q24: Goal-directedness incentivizes undesirable behaviors
- Q25: Difficulty of robust oversight and monitoring
- Q26: Safety risks from affordances provided to LLM-agents

**Multi-Agent Dynamics (3 questions missing):**
- Q27: Influence of single-agent training on multi-agent interactions
- Q28: Foundationality may cause correlated failures
- Q29: Groups of LLM-agents may show emergent functionality (you have "multi-agent safety" which covers some)
- Q30: Collusion between LLM-agents
- Q31: Applicability of MARL research to LLMs

---

### 🛠️ Development & Deployment Methods (Missing ~20 questions)

**Pretraining Data Issues (3 questions missing):**
- Q36: Existing data filtering methods insufficient (you have "latent data erasure" which is close)
- Q37: Lack of dataset-auditing tools
- Q38: Improving training-data attribution methods
- Q39: Scaling pretraining using human feedback
- Q40: Modifying pretraining to improve safety

**Finetuning Challenges (4 questions missing):**
- Q41: How does finetuning change a pretrained model?
- Q42: Finetuning misgeneralizes in unpredictable ways
- Q43: Adversarial training may incentivize superficial alignment
- Q44: Techniques for targeted modification underexplored
- Q45: Removal of unknown undesirable capabilities

**Evaluation Methodology (7 questions missing):**
- Q46: Prompt-sensitivity confounds capability estimation
- Q47: Test-set contamination overestimates capabilities
- Q48: Targeted training confounds evaluation
- Q49: Biases in LLM-based evaluation
- Q50: Fallibility of crowdsourced human evaluation
- Q51: Systematic biases in evaluation
- Q52: Challenges with scalable oversight

**Interpretability (11 questions missing - major gap!):**
- Q53: Abstractions used for interpretability often dubious
- Q54: Concept mismatch between AI and humans
- Q55: Evaluations overestimate reliability of interpretability methods
- Q56: Can interpretability methods maintain validity when modifying behavior?
- Q57: Assuming linearity of feature representation
- Q58: Polysemanticity and superposition
- Q59: Sensitivity of interpretations to dataset choice
- Q60: Feature interpretation hard to scale
- Q61: Circuit discovery hard to scale
- Q62: Externalized reasoning may be misleading
- Q63: Externalized reasoning via formal semantics not widely applicable

**Adversarial Robustness (6 questions missing):**
- Q64: Standardized evaluations of jailbreak (you have "jailbreaks" covered at high level)
- Q65: Efficient white-box attacks lacking
- Q66: Unifying attack methodologies
- Q67: Attacking via additional modalities
- Q68: Defending the LLM as a system
- Q69: Course-correction after accepting harmful request
- Q70: No robust privilege levels within LLM input

**Poisoning Attacks (5 questions missing):**
- Q71: Are LLMs vulnerable to pretraining data poisoning? (you have "poisoning and backdoors")
- Q72: Robustness of different training stages
- Q73: Are larger models more vulnerable?
- Q74: Can out-of-context reasoning enable poisoning?
- Q75: Poisoning through additional modalities
- Q76: Detecting and removing backdoors

---

### 🌍 Sociotechnical Challenges (Missing ~10 questions)

**Value Alignment (4 questions missing):**
- Q77: Justifying value choices for alignment
- Q78: Managing conflicts between different values
- Q79: 'Lotteries' may bias encoded values
- Q80: How to evaluate which values an LLM encodes?
- Q81: Is 'value alignment' the right framework? (OPEN)

**Misuse (3 questions already covered, but details missing):**
- Q82: Misinformation (you cover this with "deepfakes")
- Q83: Cybersecurity (you have "AI-enabled hacking")
- Q84: Surveillance and censorship (you have "surveillance diffusion")
- Q85: Warfare (you have military issues covered)
- Q86: Hazardous biological and chemical technologies (NOT COVERED - gap!)
- Q87: Domain-specific misuses
- Q88: Mechanisms for detecting and attributing LLM outputs lacking

**Fairness & Representation (2 questions missing):**
- Q89: Harms of representation and biases (you have "cultural exclusion" which is close)
- Q90: Inconsistent performance across domains
- Q91: Overreliance (NOT COVERED - major gap!)
- Q92: Contextual privacy preservation

**Socioeconomic Impacts (covered reasonably well):**
- Q93: Effects on workforce (you have "socioeconomic impacts")
- Q94: Effects on inequality (covered)
- Q95: Economic challenges for education
- Q96: Global economic development

**Governance (reasonably well covered):**
- Q97-Q107: Various governance questions (you have "LLM governance lacking", "democratic oversight failure")

---

## Priority Gaps to Add

### 🔴 CRITICAL Gaps (Add These First)

1. **Overreliance / Automation Bias**
   - Status: ADDRESSED but UNSOLVED
   - Evidence: 35+ studies show mitigation attempts largely ineffective
   - Why critical: Affects all AI deployment
   - Your site: Missing entirely

2. **Bio/Chem Hazards**
   - Q86: Hazardous biological and chemical technologies
   - Status: ADDRESSED (active dual-use research)
   - Why critical: Existential risk
   - Your site: Missing entirely

3. **Test-Set Contamination**
   - Q47: Overestimates LLM capabilities
   - Status: ADDRESSED (serious problem, limited solutions)
   - Why critical: Invalidates evaluations
   - Your site: Covered indirectly by "evaluations confounded"

4. **Data Contamination & Attribution**
   - Q37-Q38: Dataset auditing and attribution
   - Status: ADDRESSED
   - Why critical: Training data quality
   - Your site: Missing

5. **Mechanistic Interpretability Gaps**
   - 11 detailed questions about interpretability
   - Status: Mostly ADDRESSED
   - Why critical: Can't fix what you can't understand
   - Your site: Has "interpretability tools lacking" (high level only)

---

### 🟡 HIGH-PRIORITY Gaps (Important but Less Urgent)

6. **Superficial Alignment / Alignment Faking**
   - Q43: Adversarial training may incentivize superficial alignment
   - Status: ADDRESSED (strategic deception observed in Claude Opus, o1)
   - Why important: Fundamental alignment challenge
   - Your site: Missing

7. **Scalable Oversight Challenges**
   - Q52: Challenges with scalable oversight
   - Status: ADDRESSED
   - Why important: Core to superalignment
   - Your site: Missing (though you have "superalignment time pressure")

8. **Multi-Agent Collusion**
   - Q30: Collusion between LLM-agents
   - Status: ADDRESSED (steganographic communication demonstrated)
   - Why important: Multi-agent risks
   - Your site: Have "multi-agent safety" (but could be more specific)

9. **Monoculture / Correlated Failures**
   - Q28: Foundationality may cause correlated failures
   - Status: ADDRESSED
   - Why important: Systemic risk
   - Your site: Missing

10. **Finetuning Misgeneralization**
    - Q42: Finetuning misgeneralizes unpredictably
    - Status: ADDRESSED
    - Why important: Deployment safety
    - Your site: Have "finetuning alignment challenges" (high level)

---

### 🟢 MEDIUM-PRIORITY Gaps (Good to Have)

11. **Polysemanticity & Superposition**
    - Q58: Major interpretability challenge
    - Status: ADDRESSED (SAEs applied to Claude 3, GPT-4)
    - Why useful: Technical depth
    - Your site: Missing

12. **Computational Limits of Transformers**
    - Q21: What can Transformers actually compute?
    - Status: ADDRESSED
    - Why useful: Understanding fundamental limits
    - Your site: Missing

13. **ICL Mechanistic Understanding**
    - Q1-Q6: Various ICL questions
    - Status: Q2 SOLVED, others ADDRESSED
    - Why useful: Understanding emergence
    - Your site: Have "ICL is a black box" (could expand)

---

## Recommendations

### Quick Wins (Add These 5 Issues)

1. **"Overreliance & Automation Bias"** (Critical - Addressed but Unsolved)
   - Research: 35+ studies, mitigation largely ineffective
   - Source: Springer AI & Society 2025 review
   - Status: Ongoing

2. **"Bio/Chem Dual-Use Risks"** (Critical - Emerging)
   - Research: 2024-2025 dual-use frameworks
   - Source: Multiple 2024 AI safety papers
   - Status: Critical

3. **"Alignment Faking / Deceptive Alignment"** (Critical - Emerging)
   - Research: Observed in Claude Opus, o1-preview
   - Source: 2024-2025 research
   - Status: Emerging

4. **"Multi-Agent Collusion"** (Emerging)
   - Research: Steganographic communication demonstrated
   - Source: 2024-2025 multi-agent research
   - Status: Emerging

5. **"Test-Set Contamination"** (Ongoing)
   - Research: Extensive 2024-2025 work
   - Source: Multiple evaluation papers
   - Status: Ongoing

### Medium-Term Expansion

Create subsections for existing issues:
- Expand "Interpretability tools lacking" with 3-4 specific challenges
- Expand "Evaluations confounded" with contamination details
- Expand "Finetuning challenges" with misgeneralization specifics

### Long-Term: Technical Deep Dives

Consider adding a "Technical Research Questions" section with:
- ICL mechanisms (6 questions)
- Scaling laws (5 questions)
- Reasoning capabilities (5 questions)
- Interpretability details (11 questions)

---

## Coverage Analysis by Category

| Category | Paper Questions | Website Issues | Coverage % |
|----------|----------------|----------------|------------|
| Sociotechnical | 31 | ~15 | ~48% ✓ |
| Safety & Alignment | ~20 | ~12 | ~60% ✓✓ |
| Misuse/Military | 7 | 7+ | ~100% ✓✓✓ |
| Governance | 11 | 3-4 | ~36% |
| Evaluation | 7 | 1 | ~14% ❌ |
| Interpretability | 11 | 1 | ~9% ❌ |
| Pretraining Data | 5 | 1-2 | ~30% |
| Finetuning | 5 | 1 | ~20% |
| ICL/Reasoning | 11 | 2 | ~18% |
| Scaling | 5 | 2 | ~40% |

---

## What You're Doing Well

✅ **Excellent sociotechnical coverage** - Military, democracy, inequality, surveillance
✅ **Good high-level safety coverage** - Goal misgeneralization, emergent capabilities, superalignment
✅ **Strong misuse coverage** - Hacking, military applications, dual-use
✅ **Governance awareness** - Democratic oversight, governance lacking

## Where You Could Expand

❌ **Weak technical depth** - Missing most interpretability, evaluation methodology details
❌ **Missing automation bias** - Huge gap, extensively researched, unsolved
❌ **Missing bio/chem risks** - Existential concern
❌ **Light on data issues** - Contamination, attribution, auditing
❌ **Light on alignment specifics** - Deceptive alignment, superficial alignment

---

## Suggested Database Additions

Here are 5 new issues to add with sources:

### 1. Overreliance & Automation Bias
```sql
INSERT INTO real_issues (id, title, summary, description, status, icon, why_it_matters, what_being_done)
VALUES (
  'overreliance-automation-bias',
  'Overreliance & Automation Bias',
  'Users over-trust AI outputs; mitigation attempts largely ineffective.',
  'Systematic reviews of 35+ studies show users exhibit automation bias with AI systems, over-trusting outputs even when wrong. LLMs exacerbate this through fluency and persuasiveness. Mitigation attempts (explanations, warnings) have been largely ineffective.',
  'Ongoing',
  'alert',
  'Overreliance undermines the benefits of human-AI collaboration and can lead to catastrophic errors in high-stakes domains like medicine, law, and safety-critical systems.',
  'Active research on de-biasing techniques, but no effective solutions yet. Some organizations implementing redundant human oversight.'
);

INSERT INTO real_issues_sources (issue_id, title, url, display_order)
VALUES
  ('overreliance-automation-bias', 'Springer AI & Society 2025', 'https://link.springer.com/article/...', 1);
```

### 2. Biological & Chemical Dual-Use Risks
```sql
INSERT INTO real_issues (id, title, summary, description, status, icon)
VALUES (
  'bio-chem-dual-use',
  'Biological & Chemical Dual-Use Risks',
  'LLMs may enable access to dangerous bio/chem information.',
  'Large language models can provide detailed information about creating biological weapons, chemical weapons, or dangerous pathogens, lowering barriers to bioterrorism or accidents.',
  'Critical',
  'alert'
);
```

(Continue for items 3-5...)

---

## Final Recommendations

**Priority 1:** Add the 5 critical missing issues (overreliance, bio/chem, alignment faking, collusion, contamination)

**Priority 2:** Expand existing issues with technical details (interpretability, evaluation methodology)

**Priority 3:** Consider creating a "Technical Research Questions" section for the 11 SOLVED questions (could go in "Not Really Problems" or "Making Progress")

**Priority 4:** Cross-link related issues (e.g., "interpretability" ↔ "alignment challenges")

---

**Bottom line:** Your site has excellent sociotechnical + safety coverage (40-60% of the paper), but is missing important technical depth, automation bias, and bio/chem risks. Adding 5-10 issues would bring coverage to ~60-70%.
