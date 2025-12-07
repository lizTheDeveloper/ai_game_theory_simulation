# Research Verification: Threshold Lowering for Tipping Cascades

**Commit:** cf4965795f49d55c0d4dea54c574187f3984d5e3
**Date:** November 23, 2025
**Files Changed:**
- `src/simulation/engine/phases/ClimateSystemPhase.ts` (114 lines added)
- `src/types/tipping-points.ts` (129 lines added)

---

## Summary

This commit implements a threshold lowering mechanism where triggered tipping elements reduce the effective thresholds of connected elements, creating cascade dynamics. This addresses a gap identified in the mechanism audit (reviews/mechanism_audit_tipping_cascades_20251123.md).

---

## Citations Requiring Verification

### Citation 1: Armstrong McKay et al. (2022) Science

**Location:** `src/types/tipping-points.ts` lines 255-258, ClimateSystemPhase.ts lines 190-200

**Exact Claims Made in Code:**
1. "Network of 16 tipping elements with causal interactions"
2. Tipping elements can influence each other through physical mechanisms

**What to Verify:**
- **Layer 1 (Existence):** Does this paper exist in Science 2022?
- **Layer 2 (Claim Accuracy):**
  - Does the paper describe a network of tipping interactions?
  - Does it provide guidance on interaction strengths between specific elements?
  - Does it support the specific pairings (Arctic → Greenland, Greenland → AMOC, etc.)?

**Current Status:** ✅ VERIFIED (Dec 7, 2025) - Paper exists, 16 elements confirmed, but NO quantitative interaction network

---

### Citation 2: Wunderling et al. (2024) Earth System Dynamics

**Location:** `src/types/tipping-points.ts` lines 258-262, ClimateSystemPhase.ts lines 190-195

**Exact Claims Made in Code:**
1. "combined effect tending to lower temperature thresholds"
2. Magnitude justification: "Direct interactions (e.g., ice sheet -> AMOC): 0.2-0.4 C reduction"
3. Magnitude justification: "Indirect interactions (e.g., Arctic ice -> Amazon): 0.1-0.2 C reduction"

**What to Verify:**
- **Layer 1 (Existence):** Does Wunderling et al. 2024 exist in ESD?
- **Layer 2 (Claim Accuracy):**
  - Does the paper state that tipping cascades lower effective thresholds?
  - Does it provide specific magnitude estimates (0.2-0.4°C for direct, 0.1-0.2°C for indirect)?
  - If not, where do the specific values (0.3°C for Greenland→AMOC, 0.25°C for AMOC→Amazon, etc.) come from?

**Current Status:** ❌ FABRICATED (Dec 7, 2025) - Paper exists, general claim verified, but specific magnitude values DO NOT EXIST

---

### Citation 3: Van Westen et al. (2024) JGR - Freshwater Hosing

**Location:** `src/types/tipping-points.ts` line 295 (implicit via Greenland→AMOC interaction)

**Exact Claims Made in Code:**
1. "Greenland melt provides freshwater that destabilizes AMOC"
2. Threshold reduction of 0.3°C from Greenland to AMOC

**What to Verify:**
- **Layer 1 (Existence):** Does Van Westen et al. 2024 exist in JGR?
- **Layer 2 (Claim Accuracy):**
  - Does the paper quantify how freshwater from Greenland affects AMOC threshold?
  - Does it support a ~0.3°C lowering of effective AMOC threshold?

**Current Status:** ⚠️ MECHANISM VERIFIED, MAGNITUDE UNQUANTIFIED (Dec 7, 2025) - Published in Science Advances (not JGR), mechanism correct, no temperature threshold reduction value

---

## Parameter Values Requiring Justification

### TIPPING_INTERACTIONS Matrix (9 interactions)

| Source | Target | Reduction (°C) | Mechanism | Research Backing |
|--------|--------|----------------|-----------|------------------|
| arctic_ice | permafrost | 0.20 | Arctic amplification | NEEDS VERIFICATION |
| arctic_ice | greenland | 0.15 | Albedo feedback | NEEDS VERIFICATION |
| greenland | amoc | 0.30 | Freshwater influx | Claimed: Van Westen 2024 |
| permafrost | amazon | 0.15 | Carbon feedback | NEEDS VERIFICATION |
| permafrost | greenland | 0.10 | Carbon feedback | NEEDS VERIFICATION |
| amoc | amazon | 0.25 | Monsoon disruption | NEEDS VERIFICATION |
| amazon | permafrost | 0.10 | Carbon feedback | NEEDS VERIFICATION |
| greenland | wais | 0.10 | Sea level feedback | NEEDS VERIFICATION |
| wais | greenland | 0.10 | Climate feedback | NEEDS VERIFICATION |

**Critical Questions:**
1. Are these specific magnitude values (0.10, 0.15, 0.20, 0.25, 0.30°C) from the cited papers?
2. Or are they "reasonable estimates" derived from general principles?
3. The commit claims "conservative estimates used (lower end of ranges)" - where are these ranges documented?

---

## Additional Parameters

### Maximum Threshold Reduction Cap: 0.5°C

**Location:** ClimateSystemPhase.ts line 243

**Claim:** "Conservative estimate from Wunderling et al. (2024)"

**What to Verify:**
- Does Wunderling 2024 provide a maximum threshold reduction estimate?
- If not, is 0.5°C a reasonable engineering constraint or arbitrary cap?

---

### Scaling Function: sqrt(progress)

**Location:** ClimateSystemPhase.ts line 205

**Claim:** Uses sqrt for "front-loading" the effect - most reduction happens early in transition

**What to Verify:**
- Is there research supporting sqrt vs linear vs other scaling functions?
- Or is this a modeling assumption that should be documented as such?

---

## Verification Priority

| Priority | Item | Reason |
|----------|------|--------|
| CRITICAL | Wunderling 2024 threshold lowering magnitudes | Core mechanic values |
| HIGH | Armstrong McKay 2022 network structure | Validates interaction matrix structure |
| HIGH | Van Westen 2024 Greenland-AMOC | Key cascade pathway |
| MEDIUM | sqrt scaling function | Modeling assumption needing documentation |
| MEDIUM | 0.5°C cap value | Conservative constraint justification |

---

## Expected Verification Outcome

If research verification finds:
- **Values are supported:** Document exact paper citations with page/figure numbers
- **Values are reasonable but not explicit:** Document as "derived from [paper] general principles, specific value is modeling assumption"
- **Values are not supported:** Flag for parameter adjustment or uncertainty bounds

---

## Related Research Files

- `research/climate_tipping_points_2024_2025_20251116.md` - May contain relevant tipping cascade research
- `research/amoc_tipping_point_original_sources_20251120.md` - AMOC-specific research
- `reviews/mechanism_audit_tipping_cascades_20251123.md` - Audit that identified this gap

---

## Verification Completed (December 7, 2025)

**GRADE: D+ (Significant Issues Found)**

**Complete verification report:** `research/verification_cf49657_20251207.md`

**Key Findings:**
- ❌ Specific magnitude values (0.10-0.30°C) are FABRICATED (not in cited papers)
- ❌ 0.5°C cap is NOT "from Wunderling 2024" (false attribution)
- ❌ sqrt(progress) scaling has NO research justification
- ✅ General concept of threshold lowering IS supported
- ✅ Interaction pathways (GIS→AMOC, AMOC→Amazon) ARE supported

**Required Actions:**
1. Remove false attributions to Wunderling 2024
2. Document parameters as modeling assumptions
3. Add uncertainty bounds (factor of 2-3x) for Monte Carlo sensitivity
4. Document sqrt scaling as modeling assumption requiring validation

**Next Steps:**
1. ~~Super-alignment-researcher (Cynthia) to verify citations exist and support claims~~ ✅ COMPLETED
2. Research-skeptic (Sylvia) to review claim accuracy and recommend parameter adjustments
3. Simulation-maintainer (Roy) to update code comments with honest documentation
4. Monte Carlo sensitivity analysis with uncertainty bounds
