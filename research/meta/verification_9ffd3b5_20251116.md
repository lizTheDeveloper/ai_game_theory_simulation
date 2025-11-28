# Research Verification Spec: Novel Entities Irreversibility Framework

**Date:** 2025-11-16
**Commit:** 9ffd3b5081f2612e3e596414c8b0f3d10affc87b
**Agent:** historian (wiki-documentation-updater)
**Phase:** Research Verification Queue (TWO-LAYER VERIFICATION REQUIRED)

## Executive Summary

Commit 9ffd3b5 adds type definitions and implementation files for the Novel Entities irreversibility framework. This introduces NEW mechanics with specific research claims that need verification:

1. **Citation Existence** (Layer 1): Do the cited papers exist and are they accessible?
2. **Claim Verification** (Layer 2): Do the papers ACTUALLY support the specific claims made in code?

**Status:** READY FOR VALIDATION (research file created by historian, awaiting orchestrator → research-skeptic review)

---

## File 1: `src/simulation/updateNovelEntitiesBoundary.ts`

### Location: Lines 1-20 (Header comments)

**Research Claims:**
- Cousins et al. (2022): "99% of cleanup rains back down globally (atmospheric cycling)"
- EPA (2024): "75 GJ/ton median energy requirement for PFAS destruction"
- Fennell (2024): "6-9 orders of magnitude concentration gap"
- Ling (2024): "Prevention >> Cleanup effectiveness"

**Verification Tasks:**

#### Citation 1: Cousins et al. (2022)
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Authors: Cousins et al.
  - [ ] Year: 2022
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "99% of cleanup rains back down globally (atmospheric cycling)"
  - [ ] Paper discusses atmospheric transport of PFAS? (YES/NO)
  - [ ] Paper provides 99% redeposition figure? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

#### Citation 2: EPA (2024)
- **Layer 1 (Existence):**
  - [ ] Document exists and is accessible
  - [ ] Author: EPA (U.S. Environmental Protection Agency)
  - [ ] Year: 2024
  - [ ] Title: [TO BE VERIFIED - likely "Interim Guidance on the Destruction and Disposal of PFAS"]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "75 GJ/ton median energy requirement for PFAS destruction"
  - [ ] Document discusses energy requirements for PFAS destruction? (YES/NO)
  - [ ] Document provides 75 GJ/ton figure or range containing 75 GJ/ton? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

#### Citation 3: Fennell (2024)
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Author: Fennell et al. (or Fennell as lead/sole author)
  - [ ] Year: 2024
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "6-9 orders of magnitude concentration gap (technology demonstrated at >1000 mg/L, environmental levels at ng/L-pg/L)"
  - [ ] Paper discusses concentration-dependent effectiveness? (YES/NO)
  - [ ] Paper provides 6-9 orders of magnitude figure? (YES/NO)
  - [ ] Paper discusses demonstration concentrations vs environmental concentrations? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

#### Citation 4: Ling (2024)
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Author: Ling et al. (or Ling as lead/sole author)
  - [ ] Year: 2024
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "Prevention >> Cleanup effectiveness" (AI e-waste cleanup may increase production - Jevons paradox)
  - [ ] Paper discusses prevention vs cleanup effectiveness? (YES/NO)
  - [ ] Paper discusses rebound effects or Jevons paradox? (YES/NO)
  - [ ] Paper provides quantitative comparison? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

---

## File 2: `src/simulation/utils/energyConstrainedCleanup.ts`

### Location: Lines 1-16 (Header comments)

**Research Claims:**
- EPA (2024): "PFAS destruction requires 50-100 GJ/ton (median 75 GJ/ton)" [DUPLICATE - see Citation 2]
- Fennell (2024): "Technology demonstrated at >1000 mg/L, environmental levels at ng/L-pg/L" [DUPLICATE - see Citation 3]
- Cousins et al. (2022): "Atmospheric transport makes 99% of cleanup rain back down" [DUPLICATE - see Citation 1]
- Ling (2024): "AI e-waste cleanup may increase production (Jevons paradox)" [DUPLICATE - see Citation 4]

### Location: Lines 29-47 (CONTAMINATION_LEVELS constants)

**Research Claims:**
- "Tibetan Plateau rainwater (55 pg/L minimum)"
- "EPA groundwater surveys"
- "Lake Erie studies"

**Verification Tasks:**

#### Citation 5: Tibetan Plateau Rainwater Study
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Authors: [TO BE VERIFIED]
  - [ ] Year: [TO BE VERIFIED]
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "Tibetan Plateau rainwater: 55 pg/L minimum (global atmospheric distribution baseline)"
  - [ ] Paper measures PFAS in Tibetan Plateau rainwater? (YES/NO)
  - [ ] Paper provides 55 pg/L figure? (YES/NO)
  - [ ] Paper discusses this as global atmospheric distribution baseline? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

#### Citation 6: EPA Groundwater Surveys
- **Layer 1 (Existence):**
  - [ ] Document exists and is accessible
  - [ ] Author: EPA
  - [ ] Year: [TO BE VERIFIED]
  - [ ] Title: [TO BE VERIFIED - likely groundwater monitoring/contamination report]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** Groundwater contamination levels: "500 ng/L typical (median), 10-2305 ng/L range"
  - [ ] Document provides groundwater contamination data? (YES/NO)
  - [ ] Document provides 500 ng/L median or similar figure? (YES/NO)
  - [ ] Document provides 10-2305 ng/L range? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

#### Citation 7: Lake Erie Studies
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Authors: [TO BE VERIFIED]
  - [ ] Year: [TO BE VERIFIED]
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** Surface water contamination: "100 ng/L median surface water"
  - [ ] Paper measures PFAS in Lake Erie or similar surface water? (YES/NO)
  - [ ] Paper provides 100 ng/L figure or range containing this value? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

---

## File 3: `src/types/planetaryBoundaries.ts`

### Location: Lines 102-106 (Type definitions)

**Research Claims:**
- Cousins et al. (2022): PFAS atmospheric transport [DUPLICATE - see Citation 1]

**New Type Properties:**
- `practicallyIrreversible`: Boolean (research-backed concept, needs citation verification)
- `decayHalfLife`: Number (500+ years for PFAS - needs specific citation)
- `atmosphericTransport`: Boolean (Cousins et al. 2022)

**Verification Tasks:**

#### Citation 8: PFAS Decay Half-Life
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Authors: [TO BE VERIFIED]
  - [ ] Year: [TO BE VERIFIED]
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "Natural decay half-life: 100-10,000+ years for PFAS" (code comment suggests 500+ years)
  - [ ] Paper measures or estimates PFAS environmental persistence? (YES/NO)
  - [ ] Paper provides half-life estimates? (YES/NO)
  - [ ] Paper supports 500+ year half-life range? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

---

## File 4: `src/simulation/techTree/comprehensiveTechTree.ts`

### Location: Lines 119-128 (Rebound effects type definitions)

**Research Claims:**
- Sorrell (2009): Rebound effects
- Gillingham et al. (2013): Rebound effects

**Verification Tasks:**

#### Citation 9: Sorrell (2009)
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Author: Sorrell (possibly lead author)
  - [ ] Year: 2009
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "Rebound coefficient: fraction of cleanup enabling more production (0-1, typ 0.1-0.6)"
  - [ ] Paper discusses rebound effects or Jevons paradox? (YES/NO)
  - [ ] Paper provides 0.1-0.6 range for rebound coefficients? (YES/NO)
  - [ ] Paper discusses application to pollution cleanup? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

#### Citation 10: Gillingham et al. (2013)
- **Layer 1 (Existence):**
  - [ ] Paper exists and is accessible
  - [ ] Authors: Gillingham et al.
  - [ ] Year: 2013
  - [ ] Title: [TO BE VERIFIED]
  - [ ] Journal: [TO BE VERIFIED]
- **Layer 2 (Claim Accuracy):**
  - **Claim:** "Rebound coefficient: fraction of cleanup enabling more production (0-1, typ 0.1-0.6)"
  - [ ] Paper discusses rebound effects? (YES/NO)
  - [ ] Paper provides quantitative rebound estimates? (YES/NO)
  - [ ] Paper supports 0.1-0.6 range? (YES/NO)
  - [ ] **Quote exact passage:** [TO BE FILLED]
  - [ ] **Claim status:** VERIFIED / UNVERIFIED / MISINTERPRETED

---

## Summary of Verification Tasks

**Total Citations:** 10 (4 unique papers/documents + 6 additional sources)

**Unique Citations to Verify:**
1. Cousins et al. (2022) - Atmospheric transport, 99% redeposition
2. EPA (2024) - PFAS destruction energy requirements (75 GJ/ton)
3. Fennell (2024) - Concentration gap (6-9 orders of magnitude)
4. Ling (2024) - Prevention vs cleanup effectiveness, Jevons paradox
5. Tibetan Plateau rainwater study - 55 pg/L baseline contamination
6. EPA groundwater surveys - 500 ng/L median, 10-2305 ng/L range
7. Lake Erie studies - 100 ng/L surface water contamination
8. PFAS decay half-life study - 500+ year environmental persistence
9. Sorrell (2009) - Rebound effects, 0.1-0.6 coefficient range
10. Gillingham et al. (2013) - Rebound effects quantification

**Priority:** HIGH - These citations support NEW mechanics in a TIER 1 CRITICAL system (Novel Entities 0% effectiveness pathway)

**Next Steps:**
1. Orchestrator reviews this file and spawns research-skeptic for validation
2. Research-skeptic performs TWO-LAYER verification (existence + claim accuracy)
3. If citations pass: Implementation proceeds with confidence
4. If citations fail: Parameters need revision or mechanic needs redesign

---

## Related Files

**Research Foundation:**
- `research/novel_entities_irreversibility_20251116.md` (existing research synthesis by orchestrator)
- `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 sources - Nov 13 implementation)

**Implementation Plan:**
- `plans/novel_entities_irreversibility_implementation_plan.md` (if exists)

**Code Files Changed:**
- `src/simulation/updateNovelEntitiesBoundary.ts` (NEW - 168 lines)
- `src/simulation/utils/energyConstrainedCleanup.ts` (NEW - 208 lines)
- `src/types/planetaryBoundaries.ts` (modified - 3 new properties)
- `src/simulation/techTree/comprehensiveTechTree.ts` (modified - 3 new properties)

**Orchestrator Workflow:**
- [x] Research phase complete (research/novel_entities_irreversibility_20251116.md exists)
- [ ] **Validation phase** (START HERE - research-skeptic review using this file)
- [ ] Implementation phase (if validation passes)
- [ ] Testing phase (Monte Carlo validation)
- [ ] Architecture review (architecture-skeptic)
- [ ] Documentation phase (wiki update)

---

## Notes for Research-Skeptic

**Common Issues to Watch For:**
1. **Citation Misinterpretation:** Paper discusses topic but doesn't provide specific value cited
2. **Extrapolation Beyond Scope:** Value calculated from paper but not directly stated
3. **Cherry-Picking:** Selective use of data without context
4. **Phantom Publications:** Citation looks real but paper doesn't exist

**Verification Standards:**
- Citation must EXIST and be ACCESSIBLE (Layer 1)
- Paper must ACTUALLY SUPPORT the specific claim (Layer 2)
- If claim is not supported: Mark as UNVERIFIED with clear explanation
- Quote exact passages from papers to validate claims

**Output Format:**
- Update this file with verification results (fill in checkboxes, quotes, status)
- Create summary document: `reviews/novel_entities_irreversibility_validation_20251116.md`
- Grade: A (all verified) / B (minor issues) / C (major issues) / F (critical failures)
