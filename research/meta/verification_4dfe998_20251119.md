# Research Verification: Nitrogen-Food Coupling Phase 3 Technologies

**Commit:** 4dfe99825d1534c253ec605d0cbf84716260b4d1
**Date:** November 19, 2025
**Verification Type:** Citation existence + Claim verification (TWO-LAYER)
**Files Modified:**
- `src/simulation/techTree/comprehensiveTechTree.ts` (lines 731-762, 764-798)
- `src/simulation/nitrogenFoodCoupling.ts` (lines 281-301)

---

## Purpose

This commit added 2 new nitrogen reduction technologies to the comprehensive tech tree:
1. **Soil Health Restoration** (TIER 2)
2. **Integrated Nutrient Management** (TIER 1)

These technologies make specific claims about nitrogen efficiency improvements (20-40% and 25-45% respectively) that require research backing.

---

## Technologies Requiring Verification

### 1. Soil Health Restoration

**Location:** `src/simulation/techTree/comprehensiveTechTree.ts:731-762`

**Specific Claims Made:**
1. **Nitrogen efficiency improvement: 20-40% range** (code uses 30% middle value)
   - Description: "Cover crops + conservation tillage + organic amendments - 20-40% nitrogen efficiency improvement via soil organic matter"
   - Effect parameter: `nitrogenEfficiency: 0.30` (line 752)

2. **Biogeochemical flows reduction: 15%** (line 753)
   - Claim: "Reduces N runoff via improved soil structure"

3. **Soil health bonus: 20%** (line 754)

4. **Carbon sequestration: 8%** (line 755)
   - Claim: "Co-benefit: soil carbon storage"

**Citations Provided:**
- `research/nitrogen_food_coupling_20251115.md - Soil health restoration section`
- `FAO (2024) - Conservation agriculture and soil organic matter`
- `IPCC AR6 (2022) - Soil health co-benefits for climate and food security`

**Verification Required:**

#### Layer 1 - Citation Existence:
- [ ] Does FAO (2024) publication on conservation agriculture exist?
- [ ] Does IPCC AR6 (2022) discuss soil health co-benefits?
- [ ] Does `research/nitrogen_food_coupling_20251115.md` contain a "Soil health restoration section"?

#### Layer 2 - Claim Verification:
- [ ] Does FAO (2024) **actually support** the 20-40% nitrogen efficiency improvement claim?
  - **Required:** Specific quote from FAO document showing this range
  - **Common issue:** Paper discusses soil health but doesn't provide the 20-40% value
- [ ] Does IPCC AR6 (2022) **actually support** the carbon sequestration co-benefit claim?
  - **Required:** Specific passage linking cover crops to carbon storage
- [ ] Is the 15% biogeochemical flows reduction justified by any citation?
  - **Status:** No specific citation provided for this value
  - **Action needed:** Find research backing or mark as UNVERIFIED

**Note:** Initial check shows `research/nitrogen_food_coupling_20251115.md` does NOT contain a "Soil health restoration section" - this technology was not in the original research file. This is a **NEW** technology added without prior research backing.

---

### 2. Integrated Nutrient Management

**Location:** `src/simulation/techTree/comprehensiveTechTree.ts:764-798`

**Specific Claims Made:**
1. **Nitrogen efficiency improvement: 25-45% range** (code uses 35% middle value)
   - Description: "Site-specific nutrient management + organic/inorganic integration - 25-45% efficiency gains via precision timing and placement"
   - Effect parameter: `nitrogenEfficiency: 0.35` (line 788)

2. **Biogeochemical flows reduction: 20%** (line 789)
   - Claim: "Reduces N runoff via improved synchrony"

3. **Phosphorus efficiency: 25%** (line 790)
   - Claim: "Co-benefit: P management"

4. **Crop yield bonus: 10%** (line 791)
   - Claim: "Improved yields from optimized nutrition"

**Citations Provided:**
- `research/nitrogen_food_coupling_20251115.md - Integrated nutrient management section`
- `Zhang et al. (2021) - Site-specific nutrient management effectiveness, Nature Food`
- `FAO (2024) - Integrated soil fertility management`

**Verification Required:**

#### Layer 1 - Citation Existence:
- [ ] Does Zhang et al. (2021) paper in *Nature Food* exist?
  - **Search for:** "Zhang" + "2021" + "nutrient management" + "Nature Food"
  - **Full citation needed:** Authors, title, volume, pages
- [ ] Does FAO (2024) publication on integrated soil fertility management exist?
- [ ] Does `research/nitrogen_food_coupling_20251115.md` contain an "Integrated nutrient management section"?

#### Layer 2 - Claim Verification:
- [ ] Does Zhang et al. (2021) **actually report** 25-45% efficiency gains?
  - **Required:** Direct quote from paper showing this range
  - **Watch for:** Are these gains from site-specific management alone, or from a broader intervention package?
- [ ] Does Zhang et al. (2021) **actually report** 10% yield improvements?
  - **Required:** Specific data on crop yield changes
- [ ] Is the 25% phosphorus efficiency co-benefit supported?
  - **Status:** No specific citation provided for P efficiency value
  - **Action needed:** Find research backing or mark as UNVERIFIED
- [ ] Is the 20% biogeochemical flows reduction justified?
  - **Status:** General claim about "improved synchrony" but no specific research cited

**Note:** Initial check shows `research/nitrogen_food_coupling_20251115.md` does NOT contain an "Integrated nutrient management section" - this technology was not in the original research file. This is a **NEW** technology added without prior research backing.

---

## Summary of Verification Needs

### CRITICAL Issues:
1. **Both technologies added WITHOUT prior research** - cited sections in `research/nitrogen_food_coupling_20251115.md` do not exist
2. **Key parameter values lack specific citation:**
   - Soil Health: 15% biogeochemical flows reduction (no source)
   - Integrated Nutrient: 25% P efficiency, 20% flows reduction, 10% yield bonus (no specific sources)

### Research Required:
1. **FAO (2024) publications:**
   - Conservation agriculture document
   - Integrated soil fertility management document
   - Extract specific values for N efficiency, C sequestration

2. **Zhang et al. (2021) *Nature Food* paper:**
   - Verify existence (full citation)
   - Extract N efficiency gains (claimed 25-45%)
   - Extract yield improvements (claimed 10%)
   - Check if P management discussed

3. **IPCC AR6 (2022):**
   - Verify soil health co-benefits section
   - Extract carbon sequestration values

### Expected Outcome:
- **Best case:** All citations exist and support claims → VERIFIED
- **Likely case:** Citations exist but values are extrapolated → PARTIAL (need clearer attribution)
- **Concern case:** Citations don't support specific values → UNVERIFIED (need new research or parameter adjustment)

---

## Orchestrator Workflow Entry Point

**Status:** Research verification file created
**Next Phase:** VALIDATION (research-skeptic + super-alignment-researcher review)

**Orchestrator should:**
1. Skip research phase (this file already created by historian)
2. Start at validation phase:
   - super-alignment-researcher: Find and verify citations
   - research-skeptic: Challenge claims, find contradictory evidence
3. Proceed to implementation phase only if validation passes
4. Update parameters if research doesn't support current values

---

## Notes

**Why this matters:** The nitrogen-food coupling system is TIER 2 HIGH priority and directly affects god mode biogeochemical effectiveness (currently 10%, target 30-50%). If these technology parameters are based on unsupported assumptions rather than peer-reviewed research, the effectiveness predictions will be inaccurate.

**Project standards:** "Never tune for 'fun' - only research-backed values" (CLAUDE.md). Every mechanic must have 2+ peer-reviewed sources with parameter justification.

**Context:** These technologies were added as part of Phase 3 completion to wire all 6 nitrogen technologies into the biogeochemical system. The original research file (Nov 15, 2025) covered 4 technologies (precision agriculture, biological N fixation, circular food, ecosystem restoration, monitoring networks, green ammonia). These 2 additional technologies appear to be added without going through the research phase first.
