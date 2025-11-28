# Research Verification: Uncertainty Propagation Framework
## Commit 79aea88 (Nov 23, 2025)

**Type:** Citation & Claim Verification Request
**Priority:** MEDIUM (9 new parameters with peer-reviewed citations)
**Status:** NEEDS_VERIFICATION

---

## Summary

Commit 79aea88 implements an Uncertainty Propagation Framework for climate parameters.
This verification request documents the citations and claims that need validation before
the implementation can be considered research-backed.

**Files Changed:**
- `src/simulation/uncertainty/sampleUncertaintyParameters.ts` (new, 325 lines)
- `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts` (modified)
- `src/types/game.ts` (UncertaintyParameters interface added)

---

## Citations Requiring Verification

### Citation #1: IPCC AR6 (2021) - Climate Sensitivity

**Location:** `sampleUncertaintyParameters.ts:44-62`
**Claim:** ECS likely range 2.5-4.0C, very likely range 2.0-5.0C, best estimate 3.0C
**Implementation:** Log-normal distribution, clamped to [2.0, 5.0]C

**Verification Required:**
- [ ] **Citation Existence:** Does IPCC AR6 WG1 Chapter 7 exist and discuss ECS?
- [ ] **Claim Accuracy:** Quote the specific passage stating these ranges
- [ ] **Distribution Shape:** Does AR6 specify log-normal distribution, or is this a modeling choice?

**Source URL:** https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/

---

### Citation #2: IPCC AR6 (2021) - Transient Climate Response

**Location:** `sampleUncertaintyParameters.ts:65-78`
**Claim:** TCR best estimate 1.8C, likely range 1.4-2.2C, very likely 1.2-2.4C

**Verification Required:**
- [ ] **Citation Existence:** Does AR6 Chapter 7 provide TCR ranges?
- [ ] **Claim Accuracy:** Quote the specific passage
- [ ] **Distribution Shape:** AR6 doesn't specify normal distribution - document this is modeling choice

---

### Citation #3: Westen et al. JGR (2024) - AMOC Collapse Threshold

**Location:** `sampleUncertaintyParameters.ts:81-95`, `IrreversibilityTrackingPhase.ts:383`
**Claim:** AMOC collapse threshold 95% CI [2.2, 3.9]C, median 3.0C
**Full Citation (claimed):** Westen et al. JGR Oceans 2024

**Verification Required:**
- [ ] **Citation Existence:** Verify paper exists - "Westen et al. (2024) Journal of Geophysical Research: Oceans"
- [ ] **Author Names:** Confirm first author is "Westen" (or "van Westen"?)
- [ ] **Claim Accuracy:** Does paper state 95% CI [2.2, 3.9]C explicitly?
- [ ] **DOI/Access:** Provide DOI for verification

**Note:** The existing research file `research/uncertainty_propagation_climate_parameters_20251120.md`
cites "DOI: 10.1029/2025JC022651" - but year 2025 in DOI seems suspicious for a 2024 paper.

---

### Citation #4: Nature (2023) - Greenland Ice Sheet Threshold

**Location:** `sampleUncertaintyParameters.ts:98-110`, `IrreversibilityTrackingPhase.ts:122`
**Claim:** Greenland threshold [0.8, 3.2]C

**Verification Required:**
- [ ] **Citation Existence:** Which Nature paper from 2023? Need specific reference
- [ ] **Citation Incomplete:** "Nature (2023)" is insufficient - need author, title, DOI
- [ ] **Claim Accuracy:** Quote the specific passage stating this range

**Critical:** This is a vague citation. Needs full bibliographic details.

---

### Citation #5: Nature Comms E&E (2025) - WAIS Collapse Threshold

**Location:** `sampleUncertaintyParameters.ts:113-124`
**Claim:** WAIS threshold [2.0, 3.0]C

**Verification Required:**
- [ ] **Citation Existence:** Which Nature Communications Earth & Environment paper?
- [ ] **Citation Incomplete:** Need author, title, DOI
- [ ] **Claim Accuracy:** Does paper state [2.0, 3.0]C explicitly?
- [ ] **Year Concern:** "2025" paper in Nov 2025 - verify paper actually published

---

### Citation #6: Frontiers in Public Health (2025) - Amazon Dieback

**Location:** `sampleUncertaintyParameters.ts:127-139`, `IrreversibilityTrackingPhase.ts:508`
**Claim:** Amazon deforestation threshold 20-25%
**DOI (claimed):** 10.3389/fpubh.2025.1653860

**Verification Required:**
- [ ] **Citation Existence:** Verify paper exists at stated DOI
- [ ] **Claim Accuracy:** Does paper state 20-25% deforestation threshold?
- [ ] **Quote Needed:** Provide specific passage supporting this claim

---

### Citation #7: IPCC AR6 (2021) - Coral Reef Threshold

**Location:** `sampleUncertaintyParameters.ts:155-165`
**Claim:** Coral reef threshold 1.0-1.5C

**Verification Required:**
- [ ] **Citation Existence:** Which chapter of AR6 discusses coral reef thresholds?
- [ ] **Claim Accuracy:** Does AR6 state 1.0-1.5C explicitly?
- [ ] **Cross-Reference:** Compare with IPCC Special Report on Ocean (2019)

---

### Citation #8: Nature Climate Change (2022) - Permafrost Carbon

**Location:** `sampleUncertaintyParameters.ts:167-178`, `IrreversibilityTrackingPhase.ts:281`
**Claim:** Permafrost carbon pool 1,460-1,600 Gt C

**Verification Required:**
- [ ] **Citation Existence:** Which Nature Climate Change paper from 2022?
- [ ] **Citation Incomplete:** Need author, title, DOI
- [ ] **Claim Accuracy:** Does paper state this range explicitly?

---

### Citation #9: Bellomo et al. Nature (2025) - AMOC Resilience

**Location:** `research/uncertainty_propagation_climate_parameters_20251120.md:695`
**Claim:** AMOC shows resilience across 34 models, no collapse before +4C
**DOI (claimed):** 10.1038/s41586-024-08544-0

**Verification Required:**
- [ ] **Citation Existence:** Verify paper at stated DOI
- [ ] **Claim Accuracy:** Does paper conclude AMOC won't collapse before +4C?
- [ ] **Tension with #3:** If Bellomo says no collapse before +4C, but Westen says 95% CI includes 2.2C, how do we reconcile?

---

## Claim Verification Summary

| # | Citation | Existence | Claim Verified | Status |
|---|----------|-----------|----------------|--------|
| 1 | IPCC AR6 ECS | Likely | Needs quote | PENDING |
| 2 | IPCC AR6 TCR | Likely | Needs quote | PENDING |
| 3 | Westen JGR 2024 | Unknown | Needs verification | PENDING |
| 4 | Nature 2023 Greenland | INCOMPLETE | Need full citation | CRITICAL |
| 5 | Nature Comms 2025 WAIS | INCOMPLETE | Need full citation | CRITICAL |
| 6 | Frontiers 2025 Amazon | Has DOI | Needs claim check | PENDING |
| 7 | IPCC AR6 Coral | Likely | Needs quote | PENDING |
| 8 | Nature CC 2022 Permafrost | INCOMPLETE | Need full citation | CRITICAL |
| 9 | Bellomo Nature 2025 | Has DOI | Needs claim reconciliation | PENDING |

**CRITICAL Issues:** 3 citations lack full bibliographic details (#4, #5, #8)
**Potential Conflicts:** Bellomo vs Westen on AMOC thresholds needs reconciliation

---

## Recommended Verification Process

1. **Layer 1 - Citation Existence:**
   - Search for each paper via DOI/title
   - Verify author names, publication year, journal
   - Mark phantom citations if paper doesn't exist

2. **Layer 2 - Claim Verification:**
   - Read the actual paper
   - Find the specific passage supporting each claim
   - Document exact quotes with page numbers
   - Flag claims not supported by paper

3. **Layer 3 - Reconciliation:**
   - Address tension between conservative (Bellomo) and aggressive (Westen) AMOC estimates
   - Document how simulation handles conflicting research

---

## Next Steps

1. **Research-skeptic (Sylvia):** Review this verification request
2. **Super-alignment-researcher (Cynthia):** Perform actual verification
3. **Orchestrator:** Queue for validation phase

---

## Code References

```
src/simulation/uncertainty/sampleUncertaintyParameters.ts:44-178
src/simulation/engine/phases/IrreversibilityTrackingPhase.ts:122,281,383,508
src/types/game.ts:796-816
research/uncertainty_propagation_climate_parameters_20251120.md:682-717
```

---

**Created:** 2025-11-23
**Created By:** historian (wiki-documentation-updater)
**Trigger:** Post-commit hook for commit 79aea88
