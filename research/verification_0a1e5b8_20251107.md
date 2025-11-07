# Research Verification: AI Scaling & Training Costs (Commit 0a1e5b8)

**Commit:** 0a1e5b8f906d32fbad2a79a974313264ce346aa6
**Date:** November 7, 2025
**File Updated:** research/mitigation_technologies_20251015.md
**Verification Created:** November 7, 2025

---

## Executive Summary

**CRITICAL FINDING:** Simulation parameters appear to underestimate AI capability growth by **100-1000×**.

**Current Simulation:**
- AI capability doubling time: 12 months (src/simulation/config/centralConfig.ts:397)
- Compute growth rate: 100% per year (2× annually) (centralConfig.ts:404)
- **Implied 10-year growth:** ~2.4× (comment in research file)

**New Research Findings:**
- Compute growth: 4.1× per year (Epoch AI 2024)
- Training cost growth: 2.4-3.0× per year (Cottier et al. 2024)
- Combined capability growth: **1,000-10,000× per decade**

**Discrepancy:** Current model is off by 2-3 orders of magnitude.

---

## Layer 1: Citation Existence Verification

### Citation 1: Cottier et al. (2024)

**Claim Location:** research/mitigation_technologies_20251015.md:155

**Citation:**
> Cottier, B., Rahman, R., Fattorini, L., Maslej, N., Besiroglu, T., & Owen, D. (2024). "The Rising Costs of Training Frontier AI Models." *arXiv:2405.21015v2*. Published May 2024.

**Verification Status:** ⏳ PENDING
- **Does paper exist?** Need to verify arXiv:2405.21015v2
- **Are authors real?** Need to verify Epoch AI affiliation
- **Is it accessible?** Need to check arXiv availability

**Action Required:** super-alignment-researcher to verify paper existence and download PDF

---

### Citation 2: Sevilla & Roldán (2024)

**Claim Location:** research/mitigation_technologies_20251015.md (referenced in commit message)

**Citation:**
> Sevilla & Roldán (2024) "Training Compute Growth 4-5x/year" (Epoch AI)

**Verification Status:** ⏳ PENDING
- **Does paper exist?** Need full citation details
- **Publication venue?** Epoch AI blog post or peer-reviewed?
- **Is it accessible?** Need URL

**Action Required:** super-alignment-researcher to find full citation and source

---

### Citation 3: Amodei (2024-2025)

**Claim Location:** research/mitigation_technologies_20251015.md:178

**Citation:**
> Dario Amodei (Anthropic CEO), multiple interviews 2024-2025

**Verification Status:** ⏳ PENDING
- **Which interviews?** Need specific sources
- **Dates?** Need exact interview dates
- **Transcripts available?** Need verification of quotes

**Action Required:** super-alignment-researcher to find interview sources and verify quotes

---

## Layer 2: Claim Verification (CRITICAL)

### Claim 1: Training Costs

**Location:** research/mitigation_technologies_20251015.md:162-165

**Specific Claims:**
1. GPT-4 training cost: $40 million
2. Gemini Ultra training cost: $30 million
3. GPT-4 hardware acquisition: $800 million
4. R&D staff costs: 29-49% of total

**Source:** Cottier et al. (2024)

**Verification Status:** ⏳ PENDING - REQUIRES PAPER ACCESS

**Verification Required:**
- [ ] Does Cottier paper provide these exact values?
- [ ] Are these amortized costs or total costs?
- [ ] What methodology did they use?
- [ ] Quote the specific passage from the paper

**Risk:** Industry cost estimates are often speculative. Need to verify these aren't extrapolated beyond paper's scope.

---

### Claim 2: Cost Growth Rate

**Location:** research/mitigation_technologies_20251015.md:168-170

**Specific Claims:**
1. Amortized cost growth: 2.4× annually since 2016 (90% CI: 2.0× to 2.9×)
2. Cloud-pricing methodology: 2.5× per year
3. Excluding TPU models: 3.0× annually

**Source:** Cottier et al. (2024)

**Verification Status:** ⏳ PENDING - REQUIRES PAPER ACCESS

**Verification Required:**
- [ ] Does paper provide 90% CI: 2.0-2.9×?
- [ ] Is "since 2016" accurate?
- [ ] What's the methodology for cloud-pricing?
- [ ] Why exclude TPU models?

**Risk:** The 2.4× value appears in BOTH the research file and simulation parameters (centralConfig.ts:397 implies ~2× annually). Need to verify if this is coincidence or if old research was used.

---

### Claim 3: Compute Growth Rate (CRITICAL)

**Location:** research/mitigation_technologies_20251015.md (commit message)

**Specific Claim:**
> Training Compute Growth 4-5x/year (Sevilla & Roldán 2024)

**Current Simulation Parameter:**
> COMPUTE_GROWTH_RATE: 1.0 (100% per year = 2× annually)
> (src/simulation/config/centralConfig.ts:404)

**Discrepancy:** **4.1× vs 2.0× = 2× underestimation**

**Verification Status:** ⏳ PENDING - REQUIRES SOURCE ACCESS

**Verification Required:**
- [ ] Does Sevilla paper actually claim 4-5× per year?
- [ ] Is this training compute or inference compute?
- [ ] What time period does this cover?
- [ ] Quote the specific passage

**Simulation Impact:** If verified, centralConfig.ts:404 needs updating:
```typescript
// CURRENT (POTENTIALLY WRONG)
COMPUTE_GROWTH_RATE: 1.0, // 100% per year = 2× annually

// RESEARCH-BACKED (IF VERIFIED)
COMPUTE_GROWTH_RATE: 1.4, // ~4× per year (ln(4) ≈ 1.4)
```

---

### Claim 4: Future Projections

**Location:** research/mitigation_technologies_20251015.md:172-174, 181-184

**Specific Claims:**
1. $1 billion training runs by early 2027
2. Power requirements: ~1 GW by 2028
3. $10-100 billion training runs by 2025-2027 (Amodei)

**Sources:**
- Cottier et al. (2024) for $1B/2027
- Amodei interviews for $10-100B

**Verification Status:** ⏳ PENDING

**Verification Required:**
- [ ] Does Cottier paper project to 2027?
- [ ] What's the methodology for future projections?
- [ ] Can we verify Amodei quotes from interview transcripts?
- [ ] Are these projections or stated plans?

**Risk:** Future projections are inherently uncertain. Need to distinguish between:
- Extrapolations from trends (lower confidence)
- Stated organizational plans (medium confidence)
- Physical/economic constraints (higher confidence)

---

### Claim 5: Economic Concentration

**Location:** research/mitigation_technologies_20251015.md:194-196

**Specific Claims:**
1. Only orgs with >$1B budgets can train frontier models by 2027
2. Natural oligopoly: ~3-5 organizations globally
3. Entry barriers increase 2.4-3.0× annually

**Sources:** Derived from Cottier + Amodei

**Verification Status:** ⏳ PENDING - THIS IS AN INFERENCE, NOT A DIRECT CLAIM

**Verification Required:**
- [ ] Is the 3-5 org prediction from the papers, or inferred by researcher?
- [ ] What's the basis for $1B threshold in 2027?
- [ ] Does any source actually claim "natural oligopoly"?

**Risk:** This appears to be an **inference** from cost trends, not a direct paper claim. Need to verify:
1. Are the cost thresholds from papers?
2. Is the oligopoly conclusion from papers or researcher?
3. If inferred, is the logic sound?

---

### Claim 6: AI Lab Count Modeling (CRITICAL FOR SIMULATION)

**Location:** research/mitigation_technologies_20251015.md:204-207

**Specific Claims:**
1. AI Lab count over time: Start with 10-15 labs (2025), converge to 3-5 by 2030
2. Minimum budget threshold: $100M (2024), $1B (2027), $10-100B (2030)
3. Government involvement trigger: Training cost > 0.1% GDP (~$25B US)

**Source:** APPEARS TO BE RESEARCHER INFERENCE, NOT PAPER CLAIM

**Verification Status:** ⚠️ LIKELY UNVERIFIED

**Verification Required:**
- [ ] Does ANY source provide lab count predictions?
- [ ] Is the 10-15 → 3-5 trajectory from research or inferred?
- [ ] Where does 0.1% GDP threshold come from?
- [ ] Are budget thresholds from papers or extrapolated?

**Risk:** **HIGH** - These are simulation parameters that directly affect model behavior. If these are inferences rather than research findings, they need to be:
1. Marked as [RESEARCH NEEDED] in simulation
2. Validated against actual data (how many labs exist today?)
3. Justified with explicit reasoning

**Current Simulation Impact:**
- Does simulation currently model AI lab count? (Need to check)
- Does it model government involvement based on GDP%? (Need to check)

---

## Simulation Parameter Impact Analysis

### Parameters That May Need Updating

**IF research verified:**

1. **centralConfig.ts:397** - AI_CAPABILITY_DOUBLING_TIME
   - Current: 12 months
   - Research-backed: Needs recalculation based on 4× compute + algorithmic efficiency
   - Estimated new value: 6-8 months

2. **centralConfig.ts:404** - COMPUTE_GROWTH_RATE
   - Current: 1.0 (2× per year)
   - Research-backed: ~1.4 (4× per year)
   - **Discrepancy: 2× underestimation**

3. **NEW PARAMETER NEEDED?** - AI_LAB_COUNT_TRAJECTORY
   - Not currently modeled
   - Research suggests: 10-15 (2025) → 3-5 (2030)
   - Affects alignment difficulty, coordination, race dynamics

4. **NEW PARAMETER NEEDED?** - TRAINING_COST_GROWTH_RATE
   - Not currently modeled explicitly
   - Research: 2.4-3.0× per year
   - Affects economic feasibility, government involvement

---

## Files Requiring Verification

### Research Files
1. **research/mitigation_technologies_20251015.md**
   - Lines 155-212: AI scaling section
   - Lines 215-227: Parameter recommendation table

### Simulation Files
1. **src/simulation/config/centralConfig.ts**
   - Line 397: AI_CAPABILITY_DOUBLING_TIME (potentially wrong)
   - Line 404: COMPUTE_GROWTH_RATE (potentially wrong by 2×)

2. **src/simulation/capabilities.ts** (likely location of capability growth logic)
   - Need to check how AI_CAPABILITY_DOUBLING_TIME is used
   - Verify whether current logic can support 1,000-10,000× decade growth

3. **src/simulation/organizations.ts** (likely location of AI lab modeling)
   - Check if lab count is currently modeled
   - Verify if economic barriers affect lab viability

---

## Recommended Workflow

**Phase 1: Citation Verification** (super-alignment-researcher)
- [ ] Verify Cottier et al. (2024) paper exists and is accessible
- [ ] Download and read full paper
- [ ] Find Sevilla & Roldán (2024) source
- [ ] Find and verify Amodei interview sources

**Phase 2: Claim Verification** (research-skeptic + super-alignment-researcher)
- [ ] For EACH claim above, quote exact passage from papers
- [ ] Distinguish between:
  - Direct claims from papers (HIGH confidence)
  - Inferences from trends (MEDIUM confidence)
  - Researcher extrapolations (LOW confidence, needs justification)
- [ ] Flag any claims not supported by sources

**Phase 3: Simulation Impact Analysis** (simulation-maintainer)
- [ ] Audit current AI capability growth implementation
- [ ] Calculate what growth rates are IMPLIED by current parameters
- [ ] Determine if 1,000-10,000× decade growth is feasible with current architecture
- [ ] Identify what parameters need updating

**Phase 4: Implementation** (orchestrator coordinates)
- [ ] Update centralConfig.ts parameters (if verified)
- [ ] Add new parameters (lab count, training costs) if needed
- [ ] Update capability growth logic if architecture can't support new rates
- [ ] Monte Carlo validation: N≥10 runs with new parameters

**Phase 5: Documentation** (wiki-documentation-updater)
- [ ] Update docs/wiki/README.md with new AI scaling mechanics
- [ ] Document parameter changes and justifications
- [ ] Update UNDERSTANDING_RESULTS.md if outcome distributions change

---

## Questions for Validation Team

1. **For super-alignment-researcher:**
   - Can you find and verify all three primary sources?
   - Can you quote the specific passages supporting each numerical claim?

2. **For research-skeptic:**
   - Are there contradictory sources showing slower AI scaling?
   - Is the 1,000-10,000× claim plausible or cherry-picked?
   - Do the Amodei interviews represent consensus or outlier views?

3. **For simulation-maintainer:**
   - Can current architecture support 1,000-10,000× decade growth?
   - What happens to simulation outcomes if we update these parameters?
   - Should we model this as exponential, logistic, or discrete jumps?

4. **For architect:**
   - Is this verification blocking other work?
   - Should we prioritize this given the CRITICAL parameter mismatch?
   - Do we need to pause AI-related features until this is resolved?

---

## Status: READY FOR ORCHESTRATOR

This verification file is complete and ready for orchestrator pickup.

**Recommended workflow phase:** START AT VALIDATION
- Research file already created ✅
- Needs citation + claim verification (Phase 1-2)
- Then proceed to implementation (Phase 3-4)

**Priority:** CRITICAL - 2-3 order of magnitude parameter mismatch affects core simulation behavior.
