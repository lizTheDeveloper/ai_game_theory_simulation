# BLOCKING ISSUES: Threshold Lowering Mechanism - Grade D Verification

**Date:** December 7, 2025
**Verification:** research/verification_cf49657_20251207.md
**Implementation:** src/types/tipping-points.ts:517-633
**Status:** ❌ FAILED - BLOCKING PRODUCTION USE

## Executive Summary

The threshold lowering mechanism received Grade D (FAILED) from research verification. **Implementation must be blocked from production Monte Carlo runs until critical issues are fixed.**

**Severity Breakdown:**
- **2 CRITICAL issues** (sign errors, missing stabilizing feedbacks) - MUST FIX
- **3 HIGH issues** (scaling function backwards, parameter magnitude unjustified, timescale mismatch)
- **2 MEDIUM issues** (missing documented interactions, narrow magnitude range)

---

## CRITICAL BLOCKING ISSUES

### 1. AMOC → Amazon Sign Error (CRITICAL)

**Current Implementation (line 604-608):**
```typescript
{
  sourceId: 'amoc',
  targetId: 'amazon',
  thresholdReduction: 0.25, // AMOC collapse disrupts Amazon rainfall
  mechanism: 'Monsoon disruption: AMOC collapse shifts ITCZ southward, reducing Amazon rainfall'
}
```

**Problem:** This assumes AMOC collapse **destabilizes** Amazon. Multiple 2023-2025 papers show the **opposite**.

**Contradictory Evidence:**
1. [Nature Communications 2023](https://www.nature.com/articles/s43247-023-01123-7): "AMOC collapse may **stabilise** eastern Amazonian rainforests"
2. [npj Climate 2025](https://www.nature.com/articles/s41612-025-01248-w): "AMOC weakening... **increased** precipitation over most of the Amazon"
3. [JGR Atmospheres 2025](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025JD044103): Multi-model analysis shows **increased** rainfall in Amazon basin

**Mechanism Complexity:**
- ITCZ shift brings **MORE** rain to southern Amazon, not less
- Northern Amazon may dry while southern Amazon gets wetter
- Net effect on rainforest stability is **stabilizing**, not destabilizing

**Required Action:**
- **Option A:** Remove this interaction entirely
- **Option B:** Reverse sign to stabilizing (but requires different implementation pattern)
- **Option C:** Make regionally heterogeneous (complex, requires research)

**Impact if not fixed:** Simulation will show cascade paths that don't exist (AMOC → Amazon dieback) and miss protective effects. Could produce qualitatively wrong outcomes in 10-30% of Monte Carlo runs.

---

### 2. Missing AMOC → Greenland Stabilizing Feedback (CRITICAL)

**Current Implementation:** Missing entirely

**Evidence:**
[Global Tipping Points Report 2023](https://report-2023.global-tipping-points.org/): "AMOC collapse would cause substantial cooling of the Northern Hemisphere, which could **stabilize** the GrIS"

**Mechanism:**
- AMOC collapse reduces heat transport to North Atlantic
- Northern Hemisphere cooling **slows** Greenland melt
- This is a **stabilizing** interaction (opposite of all currently implemented interactions)

**Required Action:**
Add AMOC → Greenland stabilizing interaction (requires new implementation pattern - current code only models destabilizing threshold reductions)

**Impact if not fixed:** Missing stabilizing feedback creates artificial catastrophization bias. Model will over-predict ice sheet collapse rates and cascade speeds.

---

## HIGH PRIORITY ISSUES

### 3. sqrt(progress) Scaling Function is Backwards (HIGH)

**Current Pattern:** Effects use `sqrt(progress)` to front-load interaction strength (strongest when source element first tips, diminishing over time)

**Problem:** Most tipping interactions are **rate-dependent** and **accumulating**, not front-loaded.

**Physical Evidence:**
1. **Freshwater forcing:** Greenland melt rate **accelerates** over time, cumulative freshwater grows faster
2. **Carbon feedback:** Permafrost carbon release **accelerates** as active layer deepens (surface → deeper layers)
3. **Albedo feedback:** Sea ice loss feedback **compounds** over time

**Research:** [Earth System Dynamics 2024](https://esd.copernicus.org/articles/15/635/2024/) documents "rate-induced tipping cascades" where interaction strength depends on **rate of change**, which typically accelerates.

**Correct Scaling:**
- **Linear** for additive effects (cumulative forcing)
- **Quadratic or sigmoid** for accelerating feedbacks
- **NOT sqrt** (decelerating curve)

**Impact:** Front-loading with sqrt underestimates cascade risk in medium/long-term scenarios. Cascades will appear to "fizzle out" when they should intensify.

---

### 4. Quantitative Magnitudes Not Empirically Validated (HIGH)

**Current Claim (line 520):** "Research-backed threshold lowering effects"

**Reality:** Magnitudes (0.10-0.30°C) are **engineering estimates**, NOT research-backed.

**Verification Findings:**
- Armstrong McKay et al. (2022): Confirms **concept** of network interactions, NOT specific °C values
- Wunderling et al. (2024): Discusses 11-90% reduction in **coupling strength** (network metric), NOT temperature thresholds
- Van Westen et al. (2024): Confirms Greenland → AMOC mechanism, NO quantitative threshold reduction

**The 0.10-0.30°C values:** NOT found in any cited paper. They are reasonable engineering estimates but misrepresented as research-backed.

**The 0.5°C cap (line 529):** Attributed to Wunderling et al. (2024) but **NOT found in paper**. It's a simulation stability safeguard.

**Required Action:**
1. Change comments: "research-backed" → "conservative engineering estimates pending empirical validation"
2. Remove attribution of 0.5°C cap to Wunderling et al.
3. Add sensitivity analysis: test 0.5x and 2.0x scaling to check robustness

---

### 5. Greenland ↔ WAIS Symmetry is Unrealistic (HIGH)

**Current Implementation:**
- Line 621-626: Greenland → WAIS: 0.1°C reduction
- Line 627-632: WAIS → Greenland: 0.1°C reduction (symmetric)

**Problem:** Research shows **fundamentally asymmetric** relationship.

**Evidence:**
[Science Advances 2025](https://www.science.org/doi/10.1126/sciadv.adw3852): "WAIS meltwater input can **increase or decrease** the AMOC resilience to Greenland Ice Sheet meltwater, and can even completely prevent an AMOC collapse."

**Reality:**
- WAIS collapse can **stabilize** AMOC against Greenland melt (opposite of destabilization)
- Interaction sign depends on **rate** and **timing**, not just magnitude
- Symmetric 0.1°C values for opposite directions is physically implausible

---

## MEDIUM PRIORITY ISSUES

### 6. Permafrost Doesn't Have a Global Tipping Threshold (MEDIUM)

**Current Model:** Treats permafrost as a single element with a threshold

**Evidence:**
- [Nature Climate Change 2024](https://www.nature.com/articles/s41558-024-02011-4): "No respite from permafrost-thaw impacts in the **absence of a global tipping point**"
- [Phys.org 2024](https://phys.org/news/2024-05-permafrost-climate-impacts.html): "approximately **quasilinear** decrease in equilibrium permafrost extent at a rate of approximately 3.5 million km² per degree C"

**Implication:** If permafrost thaw is quasilinear at continental scale (no threshold), then "permafrost tipping" lowering other thresholds is conceptually problematic.

**Caveat:** Local abrupt thaw events (ice wedge collapse) DO occur, accounting for ~40% of emissions. But these are stochastic, not threshold-driven at global scale.

---

### 7. 0.10-0.30°C Range is Suspiciously Narrow (MEDIUM)

**Current Range:** 3x span (0.10 to 0.30°C) for all interactions

**Problem:** Unrealistically uniform given diverse physics:
- Direct forcing (Greenland freshwater → AMOC): Should be measurable in real units (Sv of freshwater)
- Indirect forcing (Amazon carbon → permafrost): Goes through global temperature, highly diffuse
- Albedo feedback (Arctic ice → Greenland): Regional, potentially strong

**Comparison:** Wunderling et al. discusses 11-90% reduction in coupling strength (8x range). The 3x range in implementation is suspiciously tight.

**Implication:** Uniform range suggests parameter tuning ("feels right" coherence), not mechanism-specific derivation.

---

## REQUIRED FIXES (Priority Order)

### Must Fix Before Production (CRITICAL):
1. ✅ **Fix or remove AMOC → Amazon interaction** (sign error - destabilizing vs stabilizing)
2. ✅ **Add AMOC → Greenland stabilizing feedback** (documented but missing)

### Should Fix Before Production (HIGH):
3. ⚠️ **Replace sqrt(progress) with linear or sigmoid scaling** (or justify front-loading)
4. ⚠️ **Update documentation** - Remove "research-backed parameters" claim, add "engineering estimates"
5. ⚠️ **Add asymmetry to Greenland ↔ WAIS** interaction

### Recommended (MEDIUM):
6. 📋 **Add sensitivity analysis** - Test 0.5x and 2.0x scaling to check outcome robustness
7. 📋 **Document 0.5°C cap** as "simulation stability safeguard" (not research-backed)
8. 📋 **Add timescale differentiation** - Fast vs slow interactions

---

## ALTERNATIVE APPROACHES

### Threshold Lowering vs. Direct Forcing

**Current Approach:** Models interactions as "threshold lowering" (reducing the temperature at which tipping occurs)

**Alternative:** **Direct forcing** - tipping element X directly pushes element Y toward its basin boundary

**Example:** Instead of "Greenland lowers AMOC threshold by 0.3°C", model as "Greenland melt adds X Sv freshwater to North Atlantic, which directly weakens AMOC by Y%."

**Advantages of direct forcing:**
- Measurable in physical units
- Can be validated against observations
- Captures rate-dependence naturally
- Avoids arbitrary temperature-space conversion

**Disadvantage:** Requires more detailed mechanistic modeling

---

## NEXT STEPS

**Immediate (This Session):**
1. Route to simulation-maintainer agent for CRITICAL fixes (items 1-2)
2. Update verification-queue.md status to "BLOCKED - Awaiting Fixes"

**Follow-Up (Next Session):**
1. Simulation-maintainer implements fixes
2. Re-verification by super-alignment-researcher + research-skeptic
3. If Grade B or higher → Monte Carlo sensitivity analysis (N≥10)
4. If still Grade C or lower → Consider alternative modeling approach

---

## REFERENCES

### Primary Verification
- **Verification Report:** research/verification_cf49657_20251207.md
- **Implementation:** src/types/tipping-points.ts:517-633
- **Commit:** cf49657

### Contradictory Evidence Sources
1. [Nature Communications 2023](https://www.nature.com/articles/s43247-023-01123-7) - AMOC collapse stabilizes Amazon
2. [Science Advances 2025](https://www.science.org/doi/10.1126/sciadv.adw3852) - WAIS meltwater can stabilize AMOC
3. [Nature Climate Change 2024](https://www.nature.com/articles/s41558-024-02011-4) - No global permafrost tipping threshold
4. [Earth System Dynamics 2024](https://esd.copernicus.org/articles/15/635/2024/) - Rate-induced tipping cascades
5. [npj Climate 2025](https://www.nature.com/articles/s41612-025-01248-w) - AMOC increases Amazon precipitation
6. [Global Tipping Points Report 2023](https://report-2023.global-tipping-points.org/) - AMOC → Greenland stabilizing feedback

---

**Status:** BLOCKING - Implementation frozen until fixes applied
**Grade:** D (FAILED)
**Reviewers:** Cynthia (super-alignment-researcher), Sylvia (research-skeptic)
**Date:** December 7, 2025
