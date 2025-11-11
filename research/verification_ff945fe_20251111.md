---
commit: ff945feb0910fe46d77c44ef8a79368e241b84a3
date: 2025-11-11
system: unknownUnknowns.ts (Unknown Unknowns / Black Swan Events)
verification_status: PENDING
---

# Research Verification: Vulnerable World Hypothesis & AI Risk (Commit ff945fe)

## Summary

This verification document tracks citations and claims from `research/vulnerable_world_hypothesis_ai_risk_20251111.md` which provides research backing for the Unknown Unknowns system (`src/simulation/unknownUnknowns.ts:45-47`).

**TWO-LAYER VERIFICATION REQUIRED:**
1. **Citation Existence**: Do the papers exist and are they accurately cited?
2. **Claim Verification**: Do the papers ACTUALLY support the specific claims made?

## Citations to Verify

### 1. Bostrom (2019) - Vulnerable World Hypothesis

**Citation:**
> Bostrom, N. (2019). "The Vulnerable World Hypothesis." *Global Policy*, 10(4), 455-476.

**Location:** `research/vulnerable_world_hypothesis_ai_risk_20251111.md:36-38`

**Claims to Verify:**
- [ ] Citation exists (author, year, journal, pages)
- [ ] Core thesis quote is accurate
- [ ] "Urn of invention" metaphor (white/grey/black balls) is from paper
- [ ] Type-1/2a/2b vulnerability definitions are accurate

### 2. Kasirzadeh (2025) - Accumulative AI X-Risk

**Citation:**
> Kasirzadeh, A. (2025). "Two Types of AI Existential Risk: Decisive and Accumulative." *arXiv:2401.07836*.

**Location:** `research/vulnerable_world_hypothesis_ai_risk_20251111.md:74`

**Claims to Verify:**
- [ ] Paper exists on arXiv with this ID
- [ ] Decisive vs. accumulative framework is accurately described
- [ ] 4 accumulation mechanisms (capability-safety gap, premature deployment, interconnected failures, erosion of judgment) are from paper or researcher interpretation
- [ ] Quote attribution is accurate

### 3. Epoch AI (2024) - Compute Scaling

**Citation:**
> Epoch AI (2024). "Training compute of frontier AI models grows by 4-5x per year."

**Location:** `research/vulnerable_world_hypothesis_ai_risk_20251111.md:147`

**Claims to Verify:**
- [ ] Report exists at cited URL
- [ ] 4.5-5.3× per year growth rate (2015-2024) is stated
- [ ] 5-6 months doubling time is explicit or calculated
- [ ] Comparison to Grace et al. (2018) is in report or inferred

### 4. Grace et al. (2018) - AI Forecasts

**Citation:**
> Grace, K., et al. (2018). "When Will AI Exceed Human Performance? Evidence from AI Experts." *JAIR*, 62, 729-754.

**Location:** `research/vulnerable_world_hypothesis_ai_risk_20251111.md:136`

**Claims to Verify:**
- [ ] Paper exists with these details
- [ ] HLMI 50% by 2061 is accurate
- [ ] Survey methodology (352 researchers) is correct

## Quantitative Claims to Verify

| Claim | Source | Assessment |
|-------|--------|------------|
| AI progress 1.5-2× faster | Calculated | ⏳ Verify calculation |
| Governance coord = 0.3 | Researcher judgment | ⚠️ NOT from source |
| Event probabilities (3%, 10%, 2%) | Researcher estimates | ⚠️ NOT from source |
| AI_PROGRESS_MULTIPLIER = 1.5 | Calculated | ⏳ Verify logic |

## Workflow

1. **Research-Skeptic**: Verify citations exist and claims are accurate
2. **Super-Alignment-Researcher**: Provide specific quotes from papers
3. **Priya**: Validate quantitative estimates
4. **Roy**: Review implementation after verification complete

**Priority:** MEDIUM-HIGH
**Estimated Time:** 4-6 hours
