# Research Skepticism Summary: Two Features Under Review
**Reviewer:** Sylvia (Research Skeptic)
**Date:** 2025-11-01
**Summary:** Critical evaluation of research foundations

## Feature 1: Cooperative AI Ownership

### Confidence: LOW ❌

**Fatal Flaws:**
1. **Primary source unverifiable** - Québec study PDF inaccessible, methodology unknown
2. **Arbitrary "conservative" adjustment** - 1.5x down from 1.77x, why not 1.2x or 1.1x?
3. **Zero AI-specific evidence** - Extrapolating from manufacturing/agriculture to AI with no basis
4. **Platform cooperatives show challenges** - The ONE relevant study (Mannan & Pek 2024) identifies problems, not advantages
5. **Admitted fabrication** - Mondragon "4% vs 10%" claim is unverified/possibly false

**Most Egregious Assumption:**
That worker ownership dynamics from physical goods sectors apply to AI systems. How does owning shares in an AI company translate to the AI itself being "cooperatively aligned"?

**Parameter Problems:**
- Survival multiplier: Could be 1.0x to 2.0x, using 1.5x arbitrarily
- Crisis resilience: +30% based on qualitative study, magnitude invented
- Governance overhead: 20% slower pulled from thin air

**Alternative Explanation:**
Selection bias - people who form cooperatives might be inherently more committed/resourceful, not that cooperative structure causes success.

**Recommendation:** DO NOT IMPLEMENT without finding verifiable sources. If proceeding, use 1.1x multiplier maximum.

---

## Feature 2: Climate Mortality Phase 2

### Confidence: MEDIUM ⚠️

**Legitimate But Flawed:**
1. **Real peer-reviewed foundation** - IPCC AR6, Science Advances, etc.
2. **But massive parameter uncertainty** - Storm frequency -6% to -34% (which is it?)
3. **Cherry-picked regions** - Atlantic basin for scary numbers, ignoring global variation
4. **Nonsensical scaling** - Cat 5 hurricanes don't kill 16x more than Cat 1

**Parameter Range Problems:**
- Storm intensity: 2% to 11% increase (5.5x range!)
- Storm frequency: -6% to -34% decrease (5.7x range!)
- Infrastructure multiplier: "Up to 3x" based on single anecdote (2003 Europe)

**BII Framework Issues:**
- 54,000 species baseline - how established? Sounds precise but likely heavily modeled
- Which species? Equal weight? What about microbiomes?
- Overabundance penalty - who defines "natural" abundance?

**Missing Mechanisms:**
- Why does rapid intensification increase? SST gradients? Wind shear?
- Heat mortality needs lag effects and adaptation, not linear scaling
- Storm deaths from surge height, not exponential category scaling

**Citation Problems:**
Multiple citations appear to be title-matches from Google Scholar, not verified content. "Cell Press (2025)" and "Yale Climate Connections (2025)" are journalism, not peer review.

**Recommendation:** Has legitimate foundation but needs major parameter revision. Use conservative estimates and acknowledge massive uncertainty.

---

## Common Patterns Across Both Features

### Wishful Precision
Both features take vague research and implement precise mechanics:
- Cooperative: "1.5x survival multiplier" from unverifiable source
- Climate: Exact mortality scaling from papers that give 5x parameter ranges

### Extrapolation Chains
- Cooperative: Manufacturing → Platform → AI (each leap unjustified)
- Climate: Regional → Global, Historical → 2100 (assuming linear extrapolation)

### Cherry-Picking
- Cooperative: Québec success stories, ignoring platform cooperative challenges
- Climate: Atlantic basin intensity, ignoring global variation

### Mechanism Gaps
Neither feature adequately explains WHY their parameters should work:
- Why would cooperative governance help AI alignment specifically?
- Why does storm mortality scale exponentially with category?

---

## Meta-Concern: Research Quality Standards

The project claims "research-backed realism" but is implementing:
1. Unverifiable grey literature (Québec study)
2. Arbitrary parameter adjustments (1.5x "conservative")
3. Unjustified extrapolations (manufacturing → AI)
4. False precision (exact multipliers from vague research)

**This is not research-backed modeling. This is speculation with a veneer of academic citations.**

---

## Overall Assessment

**Cooperative Ownership:** NOT DEFENSIBLE - Built on sand
**Climate Mortality:** PARTIALLY DEFENSIBLE - Real foundation, bad implementation

Both features need major revision before implementation. We're not "letting the model show what it shows" - we're encoding our hopes (cooperatives) and fears (climate) with false precision.

The critical issue: **We don't know what we don't know, but we're implementing it anyway with specific multipliers.**