# Research Verification: Bifurcation Multiplier Calibration

**Commit:** 6b42b7ce673decac441458e3bd22672748bf3962
**Date:** November 13, 2025
**Author:** Claude Autonomous Worker
**Verification Status:** ⚠️ PENDING VALIDATION

## Summary

This commit reduces ALL bifurcation system multipliers by 30% to address mortality overshoot. Previous multipliers caused 87.2% average mortality (vs 43-58% research target = +50% overshoot).

**Critical claim:** The 30% reduction brings mortality back into research-validated range without undermining the bifurcation theory foundation.

## Changes Requiring Verification

### 1. System Multiplier Reductions (ALL -30%)

**File:** `src/simulation/engine/phases/BifurcationLogicPhase.ts` (lines 320-350)

#### Environmental Multiplier: 1.5× → 1.05×

**Location:** `BifurcationLogicPhase.ts:339`

**Existing Citation:**
- Scheffer et al. (2024) - Environmental fold catastrophes

**Specific Claim in Code:**
> "Environmental (1.05×): Fold catastrophe with hysteresis (Scheffer et al. 2024) - REDUCED 30%"

**Verification Needed:**
- **Layer 1 (Citation):** Does Scheffer et al. (2024) exist and is accessible?
- **Layer 2 (Claim):** Does the paper quantify environmental variance amplification near fold catastrophes?
- **Layer 3 (Calibration):** Does the paper support 1.05× multiplier, or is this purely empirical calibration?

**Expected Answer:** The paper likely describes *qualitative* fold catastrophe dynamics but does NOT provide a specific 1.05× multiplier. This is calibration-derived, not directly sourced.

---

#### Social Multiplier: 2.5× → 1.75×

**Location:** `BifurcationLogicPhase.ts:340`

**Existing Citation:**
- Dakos et al. (2012) - Hopf bifurcation with oscillatory dynamics

**Specific Claim in Code:**
> "Social (1.75×): Hopf bifurcation with oscillatory dynamics (Dakos et al. 2012) - REDUCED 30%"

**Verification Needed:**
- **Layer 1 (Citation):** Does Dakos et al. (2012) exist? Full citation?
- **Layer 2 (Claim):** Does the paper discuss variance amplification near Hopf bifurcations?
- **Layer 3 (Calibration):** Does it quantify 1.75× (or 2.5× before reduction)?

**Expected Answer:** Paper likely describes *detection methods* for early warning signals (variance, autocorrelation) but does NOT provide specific multiplier values. This is empirical calibration.

---

#### Economic Multiplier: 2.5× → 1.75×

**Location:** `BifurcationLogicPhase.ts:341`

**Existing Citations:**
- Manda (2010) - Financial crisis cascade effects
- Fed (2016) - 2008 VIX calibration

**Specific Claim in Code:**
> "Economic (1.75×): Cascade amplification - REDUCED 30%"

**Verification Needed:**
- **Layer 1 (Citation):** Do Manda (2010) and Fed (2016) exist? Full citations?
- **Layer 2 (Claim - 2008 VIX):** Wiki states VIX amplification = 4-5× baseline (lines 3837-3840). Does this support 1.75× system multiplier?
- **Layer 3 (Calibration Logic):** How does 4-5× VIX amplification translate to 1.75× bifurcation multiplier?

**Context from Wiki (lines 3837-3840):**
> **Financial Crisis (2008):** VIX amplification = 4-5× baseline (not 40× as initially claimed)
> - Baseline (2007): VIX ≈ 17
> - Peak (Oct-Nov 2008): VIX ≈ 85
> - Amplification: 5× (conservative)

**Critical Question:** If empirical VIX = 5×, why is the system multiplier 1.75× (not 5×)? Is the multiplier applied to *base amplification* (which already scales with 1/√d)?

**Expected Answer:** The system multiplier is NOT the total amplification (that's base × system × cap). The 1.75× multiplier scales the *base formula* result. If base = 3× and system = 1.75×, total ≈ 5× (matching VIX). Need to verify this relationship.

---

#### Governance Multiplier: 2.0× → 1.4×

**Location:** `BifurcationLogicPhase.ts:342`

**Existing Citation:**
- "Regime change literature" (VAGUE - no specific paper)

**Specific Claim in Code:**
> "Governance (1.4×): Feedback loop amplification - REDUCED 30%"

**Verification Needed:**
- **Layer 1 (Citation):** Which papers? This is NOT a proper citation.
- **Layer 2 (Claim):** What research quantifies governance feedback loop amplification?
- **Layer 3 (Justification):** Why 1.4× (or 2.0× before reduction)?

**Status:** ⚠️ **UNVERIFIED** - No specific paper cited. This is either:
1. Extrapolation from general bifurcation theory
2. Empirical calibration
3. Placeholder awaiting proper research

**Action Required:** Find peer-reviewed research on governance regime change variance amplification, OR document as "empirical calibration lacking research foundation."

---

#### Flourishing Multiplier: 2.0× → 1.4×

**Location:** `BifurcationLogicPhase.ts:343`

**Existing Citation:**
- "Innovation theory" (VAGUE - no specific paper)

**Specific Claim in Code:**
> "Flourishing (1.4×): Positive feedback loops - REDUCED 30%"

**Verification Needed:**
- **Layer 1 (Citation):** Which papers? This is NOT a proper citation.
- **Layer 2 (Claim):** What research quantifies positive feedback loops in flourishing/innovation cascades?
- **Layer 3 (Justification):** Why 1.4×?

**Status:** ⚠️ **UNVERIFIED** - No specific paper cited.

**Note from Wiki (line 3771):**
> "Bifurcation Type: Positive feedback loops (rare in current literature)"

This acknowledges the lack of strong research foundation.

**Action Required:** Either find research on innovation cascade amplification, OR document as "theoretical extrapolation from bifurcation principles, calibrated empirically."

---

#### Technology Multiplier: 2.0× → 1.4×

**Location:** `BifurcationLogicPhase.ts:344`

**Existing Citation:**
- "Breakthrough dynamics" (VAGUE - no specific paper)

**Specific Claim in Code:**
> "Technology (1.4×): Innovation cascades - REDUCED 30%"

**Verification Needed:**
- Same as Flourishing - no specific citation.

**Status:** ⚠️ **UNVERIFIED** - No specific paper cited.

---

### 2. Mortality Overshoot Justification

**Claim:** 87.2% mortality was +50% overshoot beyond 43-58% research target.

**File:** Commit message (not in code)

**Verification Needed:**
- **Layer 1:** What research establishes 43-58% as the target mortality range?
- **Layer 2:** Is this from nuclear winter literature? Climate mortality projections? Multi-model ensemble?
- **Layer 3:** Is 30% reduction the correct calibration to reach 43-58% range?

**Expected Source:** Likely from nuclear winter research (Robock et al., Toon et al.) or extreme climate scenarios. Need specific citation.

**Action Required:** Find and cite the research that establishes 43-58% mortality as the expected range for the scenario modeled.

---

### 3. Extinction Classification Logic Change

**File:** `src/simulation/endGame.ts` (lines 260-306)

**Changes:**
- **REMOVED:** 3 extinction lock conditions (misaligned AI tech, AI civil war, human irrelevance)
- **NEW LOGIC:** Extinction ONLY when population < 10K

**Claim in Code Comments:**
> "FIX (Nov 13, 2025): Never lock extinction without population check. Misaligned dominance = dystopia, but extinction requires pop < 10K"

**Verification Needed:**
- **Layer 1 (Research):** What research supports 10K as the extinction threshold?
- **Layer 2 (Minimum Viable Population):** Is this from conservation biology? Human genetic diversity literature?
- **Layer 3 (Logic):** Is it valid that catastrophic tech should cause mortality through crisis mechanics rather than immediate extinction?

**Expected Source:** Minimum viable population (MVP) literature from conservation biology. For humans, MVP estimates range from 500-10,000 depending on assumptions.

**Action Required:** Cite specific MVP research that justifies 10K threshold. Common sources:
- Traill et al. (2007) - "Minimum viable population size: A meta-analysis of 30 years of published estimates"
- Franklin (1980) - Original 50/500 rule
- Contemporary human genetic diversity studies

---

## Verification Priorities

### CRITICAL (Must Verify)

1. **Mortality target range (43-58%)** - What research establishes this?
2. **Extinction threshold (10K)** - Minimum viable population citation
3. **Economic multiplier vs VIX amplification** - Relationship between 1.75× and 5× VIX

### HIGH (Should Verify)

4. **Scheffer et al. (2024)** - Environmental fold catastrophe citation
5. **Dakos et al. (2012)** - Social Hopf bifurcation citation
6. **Manda (2010) + Fed (2016)** - Economic cascade citations

### MEDIUM (Document As Unverified)

7. **Governance multiplier** - "Regime change literature" is not a citation
8. **Flourishing multiplier** - "Innovation theory" is not a citation
9. **Technology multiplier** - "Breakthrough dynamics" is not a citation

---

## Calibration vs Research Distinction

**Key Issue:** Many multipliers are **empirical calibration** (tuned to match observed mortality distributions) rather than **directly sourced from research**.

This is VALID if documented correctly:

✅ **GOOD:**
> "System multipliers calibrated empirically to match mortality range (43-58%) from [SOURCE]. Base formula (1/√d) derived from bifurcation theory (Scheffer et al. 2009). System-specific multipliers are calibration parameters, not direct research values."

❌ **BAD:**
> "Economic: 1.75× (Manda 2010, Fed 2016)" ← Implies the papers provide 1.75×, when they don't.

**Recommendation:** Clearly separate:
1. **Theory** (1/√d formula) ← Bifurcation theory
2. **Empirical anchors** (VIX 5×, Permian-Triassic 100×) ← Research
3. **Calibration** (system multipliers 1.05-1.75×) ← Tuned to match mortality targets

---

## Next Steps for Orchestrator

### VALIDATION Phase (Research Skeptic)

When orchestrator begins, research-skeptic should:

1. **Verify citations exist** (Layer 1)
2. **Check claims match papers** (Layer 2)
3. **Evaluate calibration logic** (Layer 3)

Focus on CRITICAL items first (mortality target, extinction threshold, VIX relationship).

### Expected Timeline

- **Validation:** 2-4 hours (research-skeptic review)
- **Implementation:** Not needed (already implemented)
- **Testing:** Not needed (already validated in commit)
- **Documentation:** Already complete (this file)

---

## Summary Status

| Claim | Citation | Status |
|-------|----------|--------|
| Mortality target 43-58% | ⚠️ UNSPECIFIED | CRITICAL - Need source |
| Extinction threshold 10K | ⚠️ UNSPECIFIED | CRITICAL - Need MVP source |
| Environmental 1.05× | Scheffer 2024 | HIGH - Verify citation |
| Social 1.75× | Dakos 2012 | HIGH - Verify citation |
| Economic 1.75× | Manda 2010, Fed 2016 | HIGH - Verify claim |
| Governance 1.4× | "Regime change literature" | MEDIUM - No citation |
| Flourishing 1.4× | "Innovation theory" | MEDIUM - No citation |
| Technology 1.4× | "Breakthrough dynamics" | MEDIUM - No citation |

---

**Generated:** 2025-11-13
**Commit:** 6b42b7ce673decac441458e3bd22672748bf3962
**Historian:** wiki-documentation-updater agent
