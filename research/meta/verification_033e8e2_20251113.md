# Research Verification: Nuclear Risk Divisor Calibration

**Commit:** 033e8e2ca35a0b0ea534025f8a3b2e61d3dd0ef5
**Date:** 2025-11-13
**Type:** Parameter Calibration Issue
**Priority:** MEDIUM (affects nuclear war probability realism)
**Status:** PENDING ORCHESTRATOR REVIEW

---

## Summary

Commit 033e8e2 added new 2025 RLHF robustness research and updated nuclear risk calibration recommendations. The research provides **peer-reviewed quantitative grounding** for a parameter that was previously based on engineering judgment. This verification file documents what needs validation and implementation.

**Key Finding:** Current simulation uses divisor of **4.0** for AI control gap in nuclear war formula, but new research suggests **30-40** is more appropriate based on empirical RLHF degradation rates.

---

## Files Changed

1. **research/rlhf_robustness_limitations_20251113.md** (NEW)
   - Documents 3 key vulnerabilities in RLHF: preference collapse, shallow alignment, reward uncertainty
   - 2024-2025 peer-reviewed sources (JASA, ICLR, arXiv)

2. **research/nuclear_war_ai_control_gap_20251022.md** (UPDATED)
   - Added Section 8 with November 2025 update
   - Refined recommended divisor from 20-100 to 30-40
   - Now grounded in peer-reviewed evidence (not just engineering judgment)

---

## Citations Requiring Verification

### LAYER 1: Citation Existence

#### Citation 1: Xiao et al. (2025) - Preference Collapse

**Claimed Citation:**
```
Xiao, J., Li, Z., Xie, X., Getzen, E., Fang, C., Long, Q., & Su, W. J. (2025).
On the Algorithmic Bias of Aligning Large Language Models with RLHF:
Preference Collapse and Matching Regularization.
Journal of the American Statistical Association.
(Accepted for publication, final revision August 25, 2025)
ArXiv ID: 2405.16455
```

**Files:**
- `research/rlhf_robustness_limitations_20251113.md:32-34`
- `research/nuclear_war_ai_control_gap_20251022.md:957-959`

**Verification Needed:**
- [ ] Does this paper actually exist?
- [ ] Are author names correct?
- [ ] Is it actually accepted to JASA?
- [ ] Is ArXiv ID 2405.16455 correct and accessible?

**CLAIM VERIFICATION (LAYER 2):**

**Specific Claim Made:**
> "**29-41% improvement** in alignment with human preferences vs standard RLHF"
> (research/rlhf_robustness_limitations_20251113.md:59-60)

**Simulation Extrapolation:**
> "If standard RLHF collapses minority preferences and creates systematic bias, then... Constitutional AI constraints trained via RLHF will have **blind spots** in preference space"
> (research/rlhf_robustness_limitations_20251113.md:74-76)

**What Needs Verification:**
- [ ] Does the paper ACTUALLY report 29-41% improvement?
- [ ] Quote the specific passage from the paper that states this
- [ ] Is this improvement for OPT/Llama models (as claimed)?
- [ ] Does the paper discuss "preference collapse" and "minority preferences"?
- [ ] Does the paper support the extrapolation that Constitutional AI has "blind spots"?

**Red Flags to Check:**
- Is "29-41%" the actual number in the paper, or interpreted/extrapolated?
- Does the paper discuss Constitutional AI specifically, or just generic RLHF?

---

#### Citation 2: ICLR 2025 - Shallow Safety Alignment

**Claimed Citation:**
```
Anonymous Authors (2025). [Title withheld - ICLR 2025 proceedings].
International Conference on Learning Representations (ICLR) 2025.
Published as conference paper.
Source: https://proceedings.iclr.cc/paper_files/paper/2025/file/88be023075a5a3ff3dc3b5d26623fa22-Paper-Conference.pdf
```

**Files:**
- `research/rlhf_robustness_limitations_20251113.md:93-97`

**Verification Needed:**
- [ ] Does this PDF URL actually exist and work?
- [ ] Is this an actual ICLR 2025 paper?
- [ ] Can we get the actual title (not anonymous)?

**CLAIM VERIFICATION (LAYER 2):**

**Specific Claim Made:**
> "Current safety alignment (SFT + RLHF) does not encode depth... Models may not learn to **deeply suppress harmful outputs**"
> (research/rlhf_robustness_limitations_20251113.md:102-104)

**Simulation Extrapolation:**
> "The 'shallow alignment' finding directly validates the simulation's model... Shallow alignment fails to constrain behavior in novel contexts"
> (research/rlhf_robustness_limitations_20251113.md:124-127)

**What Needs Verification:**
- [ ] Does the paper ACTUALLY use the phrase "shallow alignment" or "does not encode depth"?
- [ ] Quote the specific passage that supports this claim
- [ ] Does it discuss vulnerability to "inference-stage attacks"?
- [ ] Does it support the claim that degeneration is "rapid (months, not years)"?

**Red Flags to Check:**
- Is "shallow vs deep alignment" the paper's framing, or the researcher's interpretation?
- Does the paper support the "rapid degeneration" timeline claim?

---

#### Citation 3: Banerjee & Gopalan (2024) - Reward Model Uncertainty

**Claimed Citation:**
```
Banerjee, D., & Gopalan, A. (2024).
Towards Reliable Alignment: Uncertainty-aware RLHF.
arXiv preprint arXiv:2410.23726.
(Submitted October 31, 2024)
Categories: cs.AI, cs.LG
```

**Files:**
- `research/rlhf_robustness_limitations_20251113.md:118-122`

**Verification Needed:**
- [ ] Does ArXiv 2410.23726 exist?
- [ ] Are author names correct?
- [ ] Was it submitted October 31, 2024?

**CLAIM VERIFICATION (LAYER 2):**

**Specific Claim Made:**
> "Reward models... Prone to **high variability** and uncertainty... derived policies become more **overfitted** and **riskier**"
> (research/rlhf_robustness_limitations_20251113.md:124-128)

**Simulation Extrapolation:**
> "Suggests that 'alignment score' should have **variance** (not single fixed value)"
> (research/rlhf_robustness_limitations_20251113.md:186-187)

**What Needs Verification:**
- [ ] Does the paper ACTUALLY report "high variability" leading to "overfitting"?
- [ ] Quote the specific passage supporting this
- [ ] Does it discuss "risk" in the context of alignment?
- [ ] Does it support modeling alignment as a distribution (not scalar)?

**Red Flags to Check:**
- Is "riskier" the paper's term, or interpretation?
- Does the paper actually suggest variance-based modeling?

---

### LAYER 1: Citation Existence (Additional Context)

#### Historical Citation: Hendrycks & Dietterich (2019)

**Claimed Citation:**
> "Neural networks exhibit substantial performance degradation on common corruptions outside training distribution (ImageNet-C benchmark, ICLR)"

**Verification Status:** ✅ PREVIOUSLY VERIFIED
- This is a well-known paper, already validated in prior research files
- Not part of this commit's new claims

---

## Parameter Calibration Issue

### Current Implementation

**File:** `src/simulation/engine/phases/MADDeterrencePhase.ts` (presumed location)

**Current Formula:**
```typescript
const launchProb = baseProb *
                   (1 - bilateralDeterrence) *
                   (0.5 + (1 - crisisStability) * 0.5) *
                   (aiControlGap / 4.0);  // ⚠️ DIVISOR = 4.0
```

**Current Behavior:**
- `aiControlGap = 1.0` (full misalignment) → multiplier = 0.25 (25% increase)
- `aiControlGap = 4.0` (hypothetical extreme) → multiplier = 1.0 (100% increase)

**Implied Assumption:** AI control gap has **linear, strong effect** on nuclear risk

---

### Research-Backed Recommendation

**New Divisor Range:** 30-40 (recommended: 40)

**Rationale from Research:**
- Xiao et al. (2025): 29-41% preference collapse in standard RLHF
- Constitutional AI constraints degrade ~30-40% under distribution shift
- This is **NOT** 100% constraint failure, but partial degradation

**New Behavior (if divisor = 40):**
- `aiControlGap = 1.0` → multiplier = 0.025 (2.5% increase, not 25%)
- `aiControlGap = 4.0` → multiplier = 0.1 (10% increase, not 100%)

**Impact:** Nuclear war probabilities would be **10x lower** in high AI risk scenarios

---

## What Needs Implementation (After Verification)

### Phase 1: Citation Verification (orchestrator → research-skeptic)

**Tasks:**
1. Verify all three citations exist (ArXiv/JASA/ICLR)
2. **CRITICAL:** Verify specific claims (29-41%, "shallow alignment", etc.)
3. Check if extrapolations to Constitutional AI are justified
4. Flag any unsupported claims or misinterpretations

**Outcome:** Research file marked ✅ VERIFIED or ⚠️ NEEDS REVISION

---

### Phase 2: Parameter Update (orchestrator → simulation-maintainer)

**If verification passes:**

**File to Modify:** `src/simulation/engine/phases/MADDeterrencePhase.ts` (or wherever `aiControlGap / 4.0` appears)

**Change:**
```typescript
// BEFORE (Oct 2025)
const aiRiskMultiplier = aiControlGap / 4.0;

// AFTER (Nov 2025 - research-backed)
const aiRiskMultiplier = aiControlGap / 40.0;  // Xiao et al. 2025: ~30-40% constraint degradation
```

**Justification Comment:**
```typescript
// Research: Xiao et al. (2025, JASA) - Preference collapse in RLHF shows 29-41% misalignment
// Constitutional AI constraints degrade ~30-40% under distribution shift, not 100%
// Divisor 40 = 2.5% risk increase per 0.1 control gap (vs 25% with divisor 4)
// See: research/nuclear_war_ai_control_gap_20251022.md Section 8
//      research/rlhf_robustness_limitations_20251113.md
```

---

### Phase 3: Monte Carlo Validation (orchestrator → priya)

**After parameter change:**

**Required Tests:**
1. Run N≥10 Monte Carlo simulations with new divisor
2. Compare nuclear war rates: old (divisor=4) vs new (divisor=40)
3. Check outcome distributions (utopia/dystopia/extinction)
4. Verify determinism (CV < 0.01% for same seed)

**Expected Outcome:**
- Nuclear war rates should drop in high AI capability scenarios
- Early game should remain similar (low AI control gap)
- Late game nuclear risk should decrease significantly

---

### Phase 4: Documentation Update (orchestrator → wiki-documentation-updater)

**Files to Update:**
1. `docs/wiki/systems/nuclear-deterrence.md` - Update example calculations
2. `docs/wiki/README.md` - Note parameter change in changelog
3. `devlogs/` - Create devlog documenting calibration improvement

---

## Decision Points for Orchestrator

### If Citation Verification FAILS:

**Option A:** Revert parameter recommendation, keep divisor at 4.0
**Option B:** Use different research to justify different divisor
**Option C:** Run sensitivity analysis to find empirically justified range

### If Citation Verification PASSES:

**Proceed with:** Phase 2 (parameter update) → Phase 3 (validation) → Phase 4 (docs)

---

## Timeline Estimate

**Phase 1 (Verification):** 1-2 hours (research-skeptic)
**Phase 2 (Implementation):** 30 minutes (simulation-maintainer)
**Phase 3 (Validation):** 2-4 hours (priya + Monte Carlo runs)
**Phase 4 (Documentation):** 30 minutes (wiki-documentation-updater)

**Total:** ~4-7 hours end-to-end

---

## Priority Justification

**Why MEDIUM (not HIGH or CRITICAL)?**

**Current State:**
- Nuclear war probabilities are **too high** with divisor 4.0, but not catastrophically wrong
- The simulation still functions correctly (no bugs)
- This is a **calibration improvement**, not a critical fix

**Impact:**
- Improves realism of nuclear risk in high AI capability scenarios
- Grounds parameter in peer-reviewed research (was engineering judgment)
- Does not affect core mechanics, only magnitude

**Why Not LOW?**
- Nuclear war is a major extinction mechanism
- Having research-backed parameters improves simulation credibility
- The current parameter (divisor 4.0) was flagged as "too small" in Oct 2025 research

---

## Related Files

**Research:**
- `research/rlhf_robustness_limitations_20251113.md` (374 lines) - NEW
- `research/nuclear_war_ai_control_gap_20251022.md` (985 lines) - UPDATED Section 8

**Code (presumed):**
- `src/simulation/engine/phases/MADDeterrencePhase.ts` - Contains `aiControlGap / 4.0`

**Documentation:**
- `docs/wiki/systems/nuclear-deterrence.md` - Updated with calibration warning
- `docs/wiki/README.md` - Updated with RLHF research citations

---

## Notes for Research-Skeptic

**Key Questions:**

1. **Is the 29-41% claim accurate?** Does Xiao et al. actually report this number for the specific metric claimed?

2. **Does "preference collapse" mean what we think it means?** Is this about out-of-distribution failures specifically?

3. **Is the extrapolation to Constitutional AI justified?** The research is on generic RLHF - does Constitutional AI have different robustness?

4. **Does "shallow alignment" support rapid degeneration?** Or is the "months, not years" timeline still conjectural?

5. **Is divisor 30-40 the right inference?** Could the research support a different range?

**Confidence Check:**
- What's the confidence level for each claim: HIGH, MEDIUM, LOW?
- Which claims need hedging language in documentation?
- Are there contradictory sources that should be noted?

---

**Status:** Ready for orchestrator to begin verification workflow
**Next Step:** Post to implementation channel, trigger orchestrator → research-skeptic validation
