# Research Verification: Tiered Novel Entities Effectiveness Model

**Commit:** b6ec2b926c48c16507eb5da5fb804510397e99b6
**Date:** 2025-11-13
**System:** Novel Entities remediation effectiveness
**Location:** `src/simulation/techTree/effectsEngine.ts`

---

## Overview

This commit implements a tiered effectiveness model (2-30% range) for Novel Entities remediation, replacing the previous flat 1% minimum. The model is based on research-skeptic Grade B- review that found zero effectiveness too absolutist.

---

## Citations to Verify

### Layer 1: Citation Existence
### Layer 2: Claim Verification (CRITICAL)

---

### Citation 1: Ling et al. (2024) - Cleanup Cost Analysis

**Location:** `src/simulation/techTree/effectsEngine.ts:95`
**Claim in code comments:**
> "Energy requirements: $20-7,000 trillion/year at current emissions (Ling 2024)"

**Verification needed:**
1. **Existence:** Does Ling et al. (2024) paper exist?
2. **Claim accuracy:** Does the paper actually state $20-7,000 trillion/year cost range?
3. **Context:** Is this cost range for PFAS removal at emission rate?
4. **Scope:** What assumptions/conditions apply to this cost estimate?

**Expected source:** *Science of the Total Environment* journal
**Quote needed:** Specific passage stating cost range

---

### Citation 2: Cousins et al. (2022) - 30% Hard Ceiling

**Location:** `src/simulation/techTree/effectsEngine.ts:99`
**Claim in code comments:**
> "Hard ceiling: 30% maximum (thermodynamic constraints - Cousins 2022 dilution/redistribution)"

**Claim in code:**
```typescript
// Hard ceiling: 30% maximum (thermodynamic constraints)
// Research: Dilution reality + atmospheric redistribution (Cousins 2022)
baseEffectivenessMultiplier = Math.min(0.30, baseEffectivenessMultiplier);
```

**Verification needed:**
1. **Existence:** Does Cousins et al. (2022) paper exist?
2. **Claim accuracy:** Does the paper support a 30% effectiveness ceiling?
3. **Mechanism:** Does the paper discuss atmospheric redistribution as constraint?
4. **Quantification:** Where does the specific 30% number come from?

**Expected source:** *Environmental Science & Technology* journal (>1,500 citations)
**Known data from paper:** Tibet rainwater PFOA at 55 pg/L (14× EPA limit)
**Quote needed:** Specific passage supporting 30% ceiling claim

**Critical question:** The 30% ceiling appears to be DERIVED, not directly stated. If so:
- What's the derivation logic?
- Is this a reasonable interpretation of the research?
- Should this be marked as "DERIVED" rather than direct citation?

---

### Citation 3: Singh et al. (2024) - Thermal Destruction Effectiveness

**Location:** `src/simulation/techTree/effectsEngine.ts:97`
**Claim in code comments:**
> "Tech only (no regulation): 2-5% effectiveness (Singh 2024 thermal destruction)"

**Claim in tiered model:**
```typescript
if (regulatoryStrength < 0.2) {
  // Tech only tier: 2-5% (linear interpolation)
  baseEffectivenessMultiplier = 0.02 + (regulatoryStrength / 0.2) * 0.03;
}
```

**Verification needed:**
1. **Existence:** Does Singh et al. (2024) paper exist?
2. **Claim accuracy:** Does the paper state 2-5% effectiveness for thermal destruction?
3. **Context:** Is this effectiveness in absence of regulation?
4. **Scope:** What conditions/assumptions apply?

**Expected source:** Unknown (need to locate)
**Quote needed:** Specific passage stating 2-5% effectiveness range

**Critical question:** Is this a lab-scale effectiveness or scaled deployment projection?

---

### Citation 4: Research-Skeptic Review (Grade B-)

**Location:** `reviews/novel_entities_zero_effectiveness_critique_20251113.md`
**Claim:**
> "The zero-effectiveness finding is directionally correct but overstated."
> "Model as 2-30% effectiveness with strong regulation, not 0%."

**Verification needed:**
1. **Review validity:** Is the critique methodologically sound?
2. **Evidence basis:** Are the 2-30% ranges supported by cited research?
3. **Uncertainty:** What are the confidence bounds on these ranges?

**Status:** Review exists in repo, but recommendations need validation against primary sources.

---

## Tier Boundaries to Verify

### Tier 1: Tech Only (2-5%)
**Claimed basis:** Singh et al. (2024) thermal destruction
**Needs verification:**
- Why 2% minimum (not zero)?
- Why 5% maximum for this tier?
- What defines "tech only" vs "partial regulation"?

### Tier 2: Partial Regulation (5-15%)
**Claimed basis:** Interpolation between tiers
**Needs verification:**
- Is this DERIVED or research-backed?
- Why 20-60% regulatory strength boundary?
- What does "partial regulation" mean empirically?

### Tier 3: Strong Regulation (15-30%)
**Claimed basis:** Research-skeptic recommendation
**Needs verification:**
- Why 15% minimum for strong regulation?
- Is 30% ceiling empirically grounded or theoretical limit?
- What does "strong regulation" (60-100%) mean in practice?

---

## Model Architecture Questions

### Regulatory Strength Calculation
**Location:** `src/simulation/techTree/effectsEngine.ts:140-147`
```typescript
const regulatoryStrength = (
  (pfasBanDeployed ? 0.5 : 0.0) +
  (plasticPhaseoutDeployed ? 0.3 : 0.0) +
  (substitutionDeployed ? 0.2 : 0.0)
);
```

**Verification needed:**
- Why 50%/30%/20% weighting?
- Is this DERIVED or research-backed?
- Should this be marked as model assumption?

### Linear Interpolation Within Tiers
**Location:** `src/simulation/techTree/effectsEngine.ts:151-166`

**Question:** Why linear interpolation?
- Is this empirically grounded or computational convenience?
- Could effectiveness be nonlinear within tiers?
- Should uncertainty be modeled?

---

## Known Issues from Review

### Issue 1: Conflation of "difficult" with "impossible"
Research-skeptic noted document conflates "very difficult/expensive" with "impossible."

**Impact on model:**
- Does 30% ceiling represent impossibility or economic/thermodynamic difficulty?
- Should model include pathway to higher effectiveness with breakthrough tech?

### Issue 2: Static Technology Assumption
Review noted analysis assumes static technology/costs, ignores learning curves.

**Impact on model:**
- Should effectiveness increase over time (learning curve)?
- Is 2-5% baseline realistic for mature tech (2040+)?

### Issue 3: Selective Citation
Review noted document ignores 2024-2025 breakthroughs (BioLargo AEC, LEEF System).

**Impact on model:**
- Are tier ranges too pessimistic?
- Should recent breakthroughs adjust 2% minimum upward?

---

## Research Gaps Identified

1. **No empirical basis for tier boundaries (20%, 60%)**
   - Appears DERIVED, not research-backed
   - Should be marked as model assumption

2. **30% ceiling derivation unclear**
   - Cousins 2022 discusses dilution/redistribution
   - 30% specific number needs direct support or marked DERIVED

3. **Singh 2024 2-5% range needs verification**
   - Is this lab-scale or deployment-scale?
   - Does it account for scale economics?

4. **Weighting scheme (50%/30%/20%) unsupported**
   - No citation for PFAS ban = 50% of regulatory strength
   - Should be marked as expert judgment/model assumption

---

## Verification Checklist

### High Priority (CRITICAL for model validity)
- [ ] Verify Ling et al. 2024 exists and supports $20-7,000T/year claim
- [ ] Verify Cousins et al. 2022 supports 30% ceiling (or mark as DERIVED)
- [ ] Verify Singh et al. 2024 exists and supports 2-5% effectiveness
- [ ] Verify tier boundary logic (20%, 60%) is defensible

### Medium Priority (Model calibration)
- [ ] Verify regulatory weighting (50%/30%/20%) or mark as assumption
- [ ] Verify linear interpolation assumption is reasonable
- [ ] Check if recent breakthroughs (BioLargo, LEEF) should adjust ranges

### Low Priority (Documentation quality)
- [ ] Distinguish direct citations from derived values
- [ ] Add uncertainty bounds to tier ranges
- [ ] Document model assumptions explicitly

---

## Next Steps

1. **Super-alignment-researcher:** Locate and verify all three primary papers
2. **Research-skeptic:** Validate tier boundaries and ceiling derivation
3. **Simulation-maintainer:** Mark derived values vs direct citations in code
4. **Orchestrator:** Coordinate Gate 2 (architecture review) after verification

---

**Status:** PENDING VERIFICATION
**Priority:** HIGH (blocks Gate 3 Monte Carlo validation)
**Estimated effort:** 2-4 hours (paper retrieval + claim verification)
