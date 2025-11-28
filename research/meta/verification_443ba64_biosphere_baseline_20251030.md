# Research Verification: BLOCKER-2 Biosphere Baseline Correction

**Commit:** 443ba644e5d7af169bdd8df85ba818b4dc8d3981
**Date:** October 30, 2025
**Status:** ⚠️ NEEDS VERIFICATION
**Priority:** HIGH (parameter changed by ~62×, affects all simulation runs)

---

## Summary

BLOCKER-2 changed the biosphere integrity baseline from **137× natural extinction rate** to **2.2× natural extinction rate** in `src/simulation/planetaryBoundaries.ts`.

**This is a massive parameter shift** (62× reduction in baseline) that fundamentally changes how the simulation models current biodiversity loss. This requires **TWO-LAYER VERIFICATION**:

1. **Citation Existence:** Does Richardson et al. (2023) exist and is it accessible?
2. **Claim Verification:** Does the paper actually support the 2.2× value for current global extinction rates?

---

## Parameters Changed

### File: `src/simulation/planetaryBoundaries.ts`

#### Change 1: Biosphere Boundary Initialization (Lines 67-72)

**OLD CODE (Pre-BLOCKER-2):**
```typescript
// 2. BIOSPHERE INTEGRITY (Core Boundary) - 100-1000x extinction rate
// Research: IPBES (2024) - Current extinction rate ~137x natural (weighted global)
// Safe threshold: 10 E/MSY (10x natural extinction rate)
// Boundary value: 137 / 10 = 13.7 (normalized, same scale as other boundaries)
boundaries.biosphere_integrity = {
  // ... initialization code
};
```

**NEW CODE (Post-BLOCKER-2):**
```typescript
// 2. BIOSPHERE INTEGRITY (Core Boundary) - Current ~2× safe boundary
// UPDATED (Oct 30, 2025): BLOCKER-2 fix - Richardson et al. (2023)
// Current extinction rate: ~2.2× natural (weighted global, was incorrectly 137× before fix)
// Safe threshold: 10 E/MSY (10× natural extinction rate)
// Boundary value: 2.2 / 1.0 = 2.2 (normalized, NOT 13.7 from old buggy data)
boundaries.biosphere_integrity = {
  // ... initialization code
};
```

**CLAIM TO VERIFY:**
- **Citation:** Richardson et al. (2023)
- **Specific Claim:** "Current extinction rate: ~2.2× natural (weighted global)"
- **Context:** Global weighted average of current species extinction rates
- **Previous Value:** 137× natural extinction rate (attributed to "IPBES (2024)")

**QUESTIONS FOR VERIFICATION:**
1. Does Richardson et al. (2023) exist? What is the full citation?
2. Does this paper provide a **global weighted average** extinction rate?
3. Does the paper cite **2.2× natural** as the current rate?
4. Is this value appropriate for initializing the biosphere boundary baseline?

---

#### Change 2: Biosphere Boundary Update (Lines 548-553)

**OLD CODE:**
```typescript
// Research: IPBES (2024) - 100-1000x natural extinction rate
// Safe threshold: 10x natural rate (10 E/MSY)
// Current baseline: 137x natural rate (weighted across regions)
```

**NEW CODE:**
```typescript
// UPDATED (Oct 30, 2025): BLOCKER-2 fix - Richardson et al. (2023)
// Current baseline: ~2.2× natural rate (weighted across regions, was incorrectly 137× before fix)
// Safe threshold: 10× natural rate (10 E/MSY)
```

**SAME CLAIM as Change 1** - needs same verification.

---

## Impact Analysis

### Quantitative Impact

**Baseline reduction:** 137× → 2.2× = **62× decrease**

**What this changes:**
- Initial biosphere boundary value: 13.7 → 2.2 (within safe zone instead of deep overshoot)
- All downstream calculations that reference this baseline
- Extinction rate trajectories in simulation
- Tipping point thresholds for biodiversity collapse

**Simulation consequences:**
- Scenarios will start **much closer to safe boundaries** than before
- Biodiversity crisis will be **less severe initially**
- Requires **more accumulation** to reach tipping points
- May affect outcome distributions (fewer collapses, more recoveries?)

### Qualitative Impact

**Before fix:** Simulation assumed humanity is currently at **137× natural extinction rate**
**After fix:** Simulation assumes humanity is currently at **2.2× natural extinction rate**

This is the difference between:
- **Old:** We're in an extreme crisis (137× is catastrophic)
- **New:** We're moderately above safe limits (2.2× vs 10× threshold = 22% of safe zone)

---

## Research Verification Tasks

### LAYER 1: Citation Existence

**Task:** Verify Richardson et al. (2023) exists and is accessible

**Required Information:**
- [ ] Full citation (authors, title, journal, DOI)
- [ ] Paper is peer-reviewed
- [ ] Paper is accessible (not a phantom publication)
- [ ] Paper discusses planetary boundaries / biodiversity

**Verification Method:** Academic database search (Google Scholar, PubMed, Web of Science)

---

### LAYER 2: Claim Verification

**Task:** Verify the paper ACTUALLY supports the 2.2× claim

**Required Information:**
- [ ] Quote the specific passage that provides the 2.2× value
- [ ] Confirm it refers to **current global extinction rate** (not a projection, not regional)
- [ ] Confirm it's **weighted global average** (as claimed in code comments)
- [ ] Confirm the baseline is **natural background rate** (not some other comparison)

**CRITICAL:** If the paper does NOT provide 2.2×:
- Mark as **UNVERIFIED**
- Document what the paper actually says
- Identify if value was extrapolated, misinterpreted, or sourced elsewhere

**Verification Method:** Direct reading of Richardson et al. (2023)

---

### LAYER 3: Compare with Previous Citation

**Task:** Investigate the old "IPBES (2024)" citation for 137× value

**Questions:**
- [ ] Was IPBES (2024) real, or was it a placeholder?
- [ ] If real, what did IPBES actually say about extinction rates?
- [ ] Why was 137× used originally?
- [ ] Is there a source conflict between IPBES and Richardson?

**Purpose:** Understand if this is:
- A correction of a previous error (137× was wrong)
- A methodological change (different measurement approach)
- A temporal update (rates improved from 2024 → 2025?)

---

## Expected Deliverables

### From super-alignment-researcher:
1. **Richardson et al. (2023) full citation** with DOI
2. **Relevant excerpts** containing extinction rate data
3. **Context** - what is this paper measuring and how?
4. **Comparison** with IPBES data (if available)

### From research-skeptic:
1. **Claim accuracy assessment:** Does paper support 2.2×? (YES/NO/PARTIAL)
2. **Contradictory evidence:** Do other recent papers cite different values?
3. **Methodological concerns:** Is 2.2× a valid global baseline?
4. **Recommendation:** Should we use 2.2×, or use a different value?

---

## Success Criteria

**VERIFIED:** Richardson et al. (2023) exists, is peer-reviewed, and explicitly states current global extinction rate is ~2.2× natural background rate.

**PARTIAL:** Paper exists but value requires interpretation, extrapolation, or comes with caveats.

**UNVERIFIED:** Paper doesn't support claim, or 2.2× comes from different source.

**REJECTED:** Paper contradicts claim, or better data exists suggesting different value.

---

## Timeline

**Created:** October 30, 2025 (historian)
**Priority:** HIGH (blocking Monte Carlo validation - parameter change too large to proceed without verification)
**Next Step:** Orchestrator assigns to super-alignment-researcher → research-skeptic review

---

## Notes

- This is **NOT a trivial change** - 62× parameter shift affects entire simulation
- Original 137× value attributed to "IPBES (2024)" - but IPBES 2024 report not yet published (as of Oct 2025)
- Commit message says "was incorrectly 137× before fix" - implies old value was a bug/error
- Full BLOCKER-2 fix also requires validating that "20× accumulation no longer occurs"

**Historian assessment:** This warrants full research validation workflow before accepting the parameter change.
