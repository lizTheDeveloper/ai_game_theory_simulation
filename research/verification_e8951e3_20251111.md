# Research Verification: Planetary Boundary Update (Commit e8951e3)

**Date:** 2025-11-11
**Commit:** e8951e3714de78e55668fb0bbf286b664de6f805
**File:** research/planetary_boundary_reversibility_empirical_20251020.md
**Status:** NEEDS VERIFICATION

---

## Overview

This commit adds two new primary sources (2023-2025) to the planetary boundary reversibility research file. The sources make specific quantitative claims about boundary transgression levels and regional impacts. These claims will likely inform future simulation parameters for planetary boundaries.

**Verification Required:**
- **Layer 1 (Citation Existence):** Confirm papers exist and are accessible
- **Layer 2 (Claim Verification):** Verify specific values match what papers actually report

---

## Source 1: Richardson et al. (2023)

### Citation
**Richardson, K., et al. (2023). "Earth beyond six of nine planetary boundaries." *Science Advances*, 9(37), eadh2458. DOI: 10.1126/sciadv.adh2458**

**Location in codebase:** research/planetary_boundary_reversibility_empirical_20251020.md:197-220

### Layer 1: Citation Existence
- [x] Paper exists in *Science Advances* journal ✅
- [x] Authors include Richardson, K. as first author ✅
- [x] DOI resolves correctly: 10.1126/sciadv.adh2458 ✅
- [x] Publication year is 2023 ✅
- [x] Volume 9, Issue 37 ✅

**Status:** ✅ VERIFIED - Paper exists, accessible via PMC10499318

### Layer 2: Claim Verification

#### Claim 1: Six of nine boundaries transgressed
**File claim (line 197):** "Six of Nine Boundaries Transgressed"

**Verification needed:**
- [ ] Does paper explicitly state 6 of 9 boundaries are transgressed?
- [ ] Quote specific passage supporting this claim

#### Claim 2: Climate Change boundary values
**File claims (line 202):**
- CO₂ at 417 ppm (boundary: 350 ppm)
- 19% overshoot

**Verification needed:**
- [ ] Does paper report CO₂ at 417 ppm?
- [ ] Does paper cite 350 ppm as the boundary threshold?
- [ ] Does paper calculate 19% overshoot, or is this derived?
- [ ] Quote specific passage

#### Claim 3: Biosphere Integrity (Genetic) values
**File claims (line 203):**
- >100 E/MSY extinctions (boundary: <10 E/MSY)
- 10× overshoot

**Verification needed:**
- [ ] Does paper report >100 E/MSY (extinctions per million species-years)?
- [ ] Does paper cite <10 E/MSY as boundary threshold?
- [ ] Does paper state 10× overshoot?
- [ ] Quote specific passage

#### Claim 4: Biosphere Integrity (Functional) values
**File claims (line 204):**
- 30% HANPP (boundary: <10%)
- 3× overshoot

**Verification needed:**
- [ ] Does paper report 30% HANPP (Human Appropriation of Net Primary Production)?
- [ ] Does paper cite <10% as boundary threshold?
- [ ] Does paper state 3× overshoot?
- [ ] Quote specific passage

#### Claim 5: Land System Change values
**File claims (line 205):**
- 60% forest cover remaining (boundary: 75%)
- Approaching critical

**Verification needed:**
- [ ] Does paper report 60% forest cover remaining?
- [ ] Does paper cite 75% as boundary threshold?
- [ ] Does paper characterize this as "approaching critical"?
- [ ] Quote specific passage

#### Claim 6: Biogeochemical Flows (Nitrogen) values
**File claims (line 206):**
- 190 Tg N/year (boundary: 62 Tg N/year)
- 3× overshoot

**Verification needed:**
- [ ] Does paper report 190 Tg N/year for nitrogen flows?
- [ ] Does paper cite 62 Tg N/year as boundary threshold?
- [ ] Does paper state 3× overshoot?
- [ ] Quote specific passage

#### Claim 7: Biogeochemical Flows (Phosphorus) values
**File claims (line 207):**
- 22.6 Tg P/year (boundary: 11 Tg P/year)
- 2× overshoot

**Verification needed:**
- [ ] Does paper report 22.6 Tg P/year for phosphorus flows?
- [ ] Does paper cite 11 Tg P/year as boundary threshold?
- [ ] Does paper state 2× overshoot?
- [ ] Quote specific passage

#### Claim 8: Stratospheric Ozone values
**File claims (line 213):**
- 284.6 DU (boundary: 276 DU)
- Recovering post-Montreal Protocol

**Verification needed:**
- [ ] Does paper report 284.6 DU (Dobson Units)?
- [ ] Does paper cite 276 DU as boundary threshold?
- [ ] Does paper characterize as recovering?
- [ ] Quote specific passage

#### Claim 9: Land restoration carbon sink potential
**File claims (line 217-218):** "Richardson et al. note that modeling shows 'respecting land system boundaries could provide substantial carbon sinks,' suggesting that land restoration could contribute to reversing climate boundary transgression through natural carbon sequestration."

**Verification needed:**
- [ ] Does paper include this specific quote about "respecting land system boundaries"?
- [ ] Does paper discuss land restoration as carbon sink contribution?
- [ ] Is the connection to "reversing climate boundary transgression" explicit in paper or inferred?
- [ ] Quote specific passage

---

## Source 2: Findlay et al. (2025)

### Citation
**Findlay, H.S., Feely, R.A., Jiang, L., Pelletier, G., Bednaršek, N. (2025). "Ocean Acidification: Another Planetary Boundary Crossed." *Global Change Biology*, 31(6), e70238. DOI: 10.1111/gcb.70238 [PMID: 40485607]**

**Location in codebase:** research/planetary_boundary_reversibility_empirical_20251020.md:111-136

### Layer 1: Citation Existence
- [x] Paper exists in *Global Change Biology* journal ✅
- [x] Authors match: Findlay, H.S. (first author), Feely, R.A., Jiang, L., Pelletier, G., Bednaršek, N. ✅
- [x] DOI resolves correctly: 10.1111/gcb.70238 ✅
- [x] PMID resolves correctly: 40485607 ✅
- [x] Publication year is 2025 ✅
- [x] Volume 31, Issue 6 ✅

**Status:** ✅ VERIFIED - Paper exists, accessible via PMID 40485607

### Layer 2: Claim Verification

#### Claim 1: Boundary crossed by 2020
**File claims (line 114):**
- Boundary officially crossed by 2020
- >40% of global surface ocean exceeded 20% reduction threshold from pre-industrial aragonite saturation (ΩArag)

**Verification needed:**
- [ ] Does paper state boundary was crossed by 2020?
- [ ] Does paper report >40% of surface ocean exceeded threshold?
- [ ] Does paper define threshold as 20% reduction in aragonite saturation?
- [ ] Quote specific passage

#### Claim 2: Subsurface ocean impact
**File claims (line 115):**
- Up to 60% of subsurface ocean (0-200m depth) crossed the boundary

**Verification needed:**
- [ ] Does paper report 60% figure for subsurface ocean?
- [ ] Does paper define subsurface as 0-200m depth?
- [ ] Is "up to 60%" exact phrasing or summarized?
- [ ] Quote specific passage

#### Claim 3: Regional breakdown values
**File claims (lines 117-120):**
- Arctic Ocean: 26% reduction
- North Pacific: 22% reduction
- Southern Ocean: 22% reduction
- North Atlantic: 20% reduction

**Verification needed:**
- [ ] Does paper provide these exact regional percentages?
- [ ] Are these four regions characterized as "crossed by 2020"?
- [ ] Are these reductions in aragonite saturation (ΩArag)?
- [ ] Quote specific table or figure

#### Claim 4: Arctic surface undersaturation
**File claims (line 121):**
- Arctic surface undersaturation increased fourfold
- 5% pre-industrial → 21% in 2020

**Verification needed:**
- [ ] Does paper report fourfold increase?
- [ ] Does paper provide 5% pre-industrial baseline?
- [ ] Does paper report 21% in 2020?
- [ ] Quote specific passage

#### Claim 5: Habitat loss percentages
**File claims (lines 124-126):**
- Tropical/subtropical coral reefs: 43% reduction in suitable habitat
- Polar pteropods (sea butterflies): Up to 61% habitat loss
- Coastal bivalves (shellfish): 13% reduction in suitable habitat

**Verification needed:**
- [ ] Does paper provide these exact habitat loss percentages?
- [ ] Are these reductions attributed to ocean acidification specifically?
- [ ] Are these observed losses or projected losses?
- [ ] Quote specific passage or table

#### Claim 6: Reversibility mechanisms
**File claims (lines 129-132):**
- Primary reversal mechanism: Atmospheric CO₂ reduction ONLY
- Low emissions scenario (SSP1-2.6): Some ocean areas might remain within limits
- Intermediate/high emissions: 100% of surface ocean projected to cross threshold by 2100
- Timeline: Surface recovery decades, deep ocean centuries

**Verification needed:**
- [ ] Does paper state atmospheric CO₂ reduction is the ONLY reversal mechanism?
- [ ] Does paper discuss SSP1-2.6 scenario outcomes?
- [ ] Does paper project 100% surface ocean transgression by 2100 for high emissions?
- [ ] Does paper provide timeline estimates (decades for surface, centuries for deep)?
- [ ] Quote specific passages

#### Claim 7: Revised boundary proposal
**File claims (lines 134-135):**
- Authors suggest 10% reduction (rather than 20%) as more protective
- This threshold was "surpassed by year 2000 across the entire surface ocean"

**Verification needed:**
- [ ] Does paper propose 10% reduction as revised boundary?
- [ ] Does paper state this was surpassed by 2000?
- [ ] Is the quote "surpassed by year 2000 across the entire surface ocean" exact?
- [ ] Quote specific passage

---

## Simulation Parameter Implications

### Current Simulation State
The simulation currently models planetary boundaries but uses older data. These new sources provide:
1. **Updated transgression levels** (7/9 boundaries vs. 6/9 previously)
2. **Regional granularity** for ocean acidification (4 ocean regions with specific values)
3. **Habitat loss empirics** (43-61% losses already observed, not just projected)
4. **Revised recovery timelines** (surface decades, subsurface centuries)

### Parameters That May Need Updating
If claims are verified, the following simulation parameters should be considered for update:

**From Richardson et al. (2023):**
- `planetaryBoundaries.climate.current` → 417 ppm CO₂
- `planetaryBoundaries.climate.threshold` → 350 ppm
- `planetaryBoundaries.nitrogen.current` → 190 Tg N/year
- `planetaryBoundaries.nitrogen.threshold` → 62 Tg N/year
- `planetaryBoundaries.phosphorus.current` → 22.6 Tg P/year
- `planetaryBoundaries.phosphorus.threshold` → 11 Tg P/year
- `planetaryBoundaries.landSystem.current` → 60% forest cover
- `planetaryBoundaries.landSystem.threshold` → 75% forest cover

**From Findlay et al. (2025):**
- `oceanAcidification.surfaceTransgression` → 40% of surface ocean
- `oceanAcidification.subsurfaceTransgression` → 60% of subsurface (0-200m)
- `oceanAcidification.regionalBreakdown` → {Arctic: 26%, NPacific: 22%, Southern: 22%, NAtlantic: 20%}
- `oceanAcidification.habitatLoss.coralReefs` → 43%
- `oceanAcidification.habitatLoss.pteropods` → 61%
- `oceanAcidification.habitatLoss.bivalves` → 13%
- `oceanAcidification.recoveryTimeline.surface` → "decades" (10-50 years?)
- `oceanAcidification.recoveryTimeline.deepOcean` → "centuries" (100-300 years?)

### Implementation Priority
**MEDIUM** - These are research updates that will inform future parameter tuning but don't require immediate code changes. The current simulation already models planetary boundaries; these provide more accurate baseline values and regional detail.

---

## Verification Workflow

### Step 1: Citation Existence (Quick Check)
**Assigned to:** super-alignment-researcher agent
**Tools:** WebFetch, academic database access
**Output:** Confirm papers exist, authors match, DOIs resolve

### Step 2: Claim Verification (Deep Read)
**Assigned to:** research-skeptic agent
**Tools:** Full paper access, quote extraction
**Output:** For each claim above, either:
- ✅ VERIFIED (with supporting quote)
- ⚠️ PARTIALLY VERIFIED (with explanation)
- ❌ UNVERIFIED (with reason)

### Step 3: Parameter Recommendation
**Assigned to:** simulation-maintainer agent (after verification)
**Input:** Verified claims from Step 2
**Output:** Specific parameter change recommendations for simulation code

---

## Notes

**Research Quality:** Both papers are peer-reviewed in high-impact journals (*Science Advances* IF=11.7, *Global Change Biology* IF=11.6). If verified, these are excellent sources for simulation parameters.

**Urgency:** LOW - This is a literature review update, not a bug fix. Verification can proceed through normal orchestrator workflow without blocking current work.

**Token Efficiency:** This verification file serves as the complete research spec. No additional research phase needed - orchestrator can start at validation phase.
