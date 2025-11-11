---
commit: a9c5a916c9de8d18b44ddf6842276ab15067be8e
date: 2025-11-11
verification_status: PENDING
---

# Research Verification: Planetary Boundaries 2023 Framework Update

## Overview

**Commit:** a9c5a916c (Research Update: Planetary Boundaries 2023 Framework)
**Research File:** `research/planetary_boundaries_2023_update_20251111.md`
**Verification Needed:** TWO-LAYER VERIFICATION (citation existence + claim accuracy)

This verification file documents claims requiring peer-reviewed validation for the Richardson et al. (2023) planetary boundaries framework update.

---

## Layer 1: Citation Existence Verification

### Primary Citation

**Claim:** Richardson et al. (2023) published "Earth beyond six of nine planetary boundaries" in *Science Advances*

**Citation Details:**
- Authors: Richardson, K., Steffen, W., Lucht, W., et al.
- Year: 2023
- Title: "Earth beyond six of nine planetary boundaries"
- Journal: *Science Advances*
- Volume/Issue: 9(37)
- Article ID: eadh2458
- DOI: https://doi.org/10.1126/sciadv.adh2458

**Verification Required:**
- [ ] Does this paper exist in Science Advances?
- [ ] Are the author names, journal, and year accurate?
- [ ] Is the paper accessible (not a phantom publication)?
- [ ] Are there 29 scientists from 8 countries as claimed?

---

## Layer 2: Claim Verification

### Critical Claims Requiring Validation

#### Claim 1: Six of Nine Boundaries Transgressed

**Location:** `research/planetary_boundaries_2023_update_20251111.md:17-22`

**Specific Claim:** "Earth has transgressed **six of nine planetary boundaries**, placing humanity 'well outside of the safe operating space' (Richardson et al., 2023)"

**Current Implementation:** `src/simulation/planetaryBoundaries.ts:76-91` comments state "7 of 9 boundaries breached"

**Verification Required:**
- [ ] Does Richardson et al. (2023) actually state 6 of 9 boundaries transgressed?
- [ ] Quote the exact passage from the paper
- [ ] **DISCREPANCY:** Research doc says 6/9, code says 7/9 - which is correct?
- [ ] Did freshwater or ocean acidification status change between 2015 and 2023?

#### Claim 2: Climate Change Thresholds

**Location:** `research/planetary_boundaries_2023_update_20251111.md:33-39`

**Specific Claims:**
- CO₂ concentration: 417 ppm (safe limit: 350 ppm)
- Radiative forcing: +2.91 W/m² (safe limit: +1.0 W/m²)

**Current Implementation:** `src/simulation/planetaryBoundaries.ts:93-99`
- Code uses: 425 ppm CO₂, currentValue: 1.21

**Verification Required:**
- [ ] Does Richardson et al. (2023) provide these exact values?
- [ ] Quote: What does the paper say about CO₂ levels?
- [ ] Quote: What does the paper say about radiative forcing?
- [ ] **DISCREPANCY:** Research says 417 ppm, code uses 425 ppm - which is correct for 2025?

#### Claim 3: Biosphere Extinction Rate

**Location:** `research/planetary_boundaries_2023_update_20251111.md:42-48`

**Specific Claims:**
- Extinction rate: >100 E/MSY (extinctions per million species-years)
- Safe limit: <10 E/MSY
- Status: "10x beyond safe limits"

**Current Implementation:** `src/simulation/planetaryBoundaries.ts:36-74`
- Code uses log-uniform distribution [100, 1000] E/MSY
- References IPBES (2019) and Richardson et al. (2023)

**Verification Required:**
- [ ] Does Richardson et al. (2023) specify >100 E/MSY?
- [ ] Quote: What extinction rate does the paper give?
- [ ] Is the 10 E/MSY safe limit from Richardson et al. or Stockholm Resilience Centre separately?
- [ ] Does the paper support the 100-1000× range cited in code comments?

#### Claim 4: Functional Biosphere (HANPP) - NEW METRIC

**Location:** `research/planetary_boundaries_2023_update_20251111.md:55-64`

**Specific Claims:**
- Human Appropriation of Net Primary Production (HANPP): 30%
- Safe limit: <10%
- Zone of increasing risk: 10-20%
- Status: "3x beyond safe limits"

**Current Implementation:** NOT YET IMPLEMENTED in `src/simulation/planetaryBoundaries.ts`

**Verification Required:**
- [ ] Does Richardson et al. (2023) introduce HANPP as a new metric?
- [ ] Quote: What does the paper say about HANPP values?
- [ ] Does the paper state 30% current appropriation?
- [ ] Is the 10% safe limit explicitly stated in the paper?
- [ ] Did this replace the Biodiversity Intactness Index (BII) from 2015?

#### Claim 5: Land System Change by Biome

**Location:** `research/planetary_boundaries_2023_update_20251111.md:68-81`

**Specific Claims (table):**
- Global: 60% current vs 75% safe
- Tropical: 37.5-83.9% (varies) vs 85% safe
- Temperate: 34.2-51.2% (varies) vs 50% safe
- Boreal: 56.6-70.3% (varies) vs 85% safe

**Current Implementation:** `docs/wiki/systems/planetary-boundaries.md:172`
- Wiki states "62% forest remaining vs 75% needed"

**Verification Required:**
- [ ] Does Richardson et al. (2023) provide biome-specific thresholds?
- [ ] Quote: What are the exact forest cover percentages by biome?
- [ ] Are these values from Richardson et al. or from other sources?
- [ ] **DISCREPANCY:** Research says 60% global, wiki says 62% - which is correct?

#### Claim 6: Nitrogen Fixation

**Location:** `research/planetary_boundaries_2023_update_20251111.md:86-94`

**Specific Claims:**
- Industrial N fixation: 190 Tg N/year
- Safe limit: 62 Tg N/year
- Zone of increasing risk: 62-82 Tg N/year
- Status: "3x beyond safe limits"

**Current Implementation:** NOT DETAILED in current code (biogeochemical flows combined)

**Verification Required:**
- [ ] Does Richardson et al. (2023) specify 190 Tg N/year?
- [ ] Quote: What nitrogen fixation rate does the paper provide?
- [ ] Are the 62 and 82 Tg N/year boundaries from Richardson et al.?

#### Claim 7: Phosphorus Flows

**Location:** `research/planetary_boundaries_2023_update_20251111.md:96-103`

**Specific Claims:**
- Global P flow to oceans: 22.6 Tg P/year (safe: 11 Tg P/year)
- Regional P application: 17.5 Tg P/year (safe: 6.2 Tg P/year)

**Current Implementation:** `docs/wiki/systems/planetary-boundaries.md:174`
- Wiki states "18.2 Tg P/year vs 6.2 Tg P/year boundary"

**Verification Required:**
- [ ] Does Richardson et al. (2023) provide both global and regional P values?
- [ ] Quote: What are the exact phosphorus flow values in the paper?
- [ ] **DISCREPANCY:** Research says 22.6/17.5, wiki says 18.2 - which is regional vs global?

#### Claim 8: Novel Entities Definition

**Location:** `research/planetary_boundaries_2023_update_20251111.md:107-117`

**Specific Claim:** "Novel entities boundary now restricted to 'truly synthetic substances not present in nature without human activity'"

**Verification Required:**
- [ ] Does Richardson et al. (2023) redefine novel entities?
- [ ] Quote: What does the paper say about the definition change?
- [ ] Is the narrowing from "modified natural substances" to "anthropogenic-only" explicitly stated?

#### Claim 9: Ozone Recovery Timeline

**Location:** `research/planetary_boundaries_2023_update_20251111.md:128-134`

**Specific Claims:**
- O₃ concentration: 284.6 DU
- Safe limit: 276 DU
- Expected recovery: 2066 (Antarctica), 2040 (tropics)

**Current Implementation:** `docs/wiki/systems/planetary-boundaries.md:177`
- Wiki states "285 DU recovering toward 290 DU baseline"

**Verification Required:**
- [ ] Does Richardson et al. (2023) provide 284.6 DU value?
- [ ] Are recovery timelines from Richardson et al. or from WMO/NOAA separately?
- [ ] **DISCREPANCY:** Research says 284.6 DU, wiki says 285 DU - rounding difference?

#### Claim 10: Ocean Acidification Margin

**Location:** `research/planetary_boundaries_2023_update_20251111.md:138-145`

**Specific Claims:**
- Aragonite saturation: ~81% of preindustrial
- Safe limit: ≥80%
- Status: "AT THE MARGIN" (81% vs 80%)

**Current Implementation:** `docs/wiki/systems/planetary-boundaries.md:30`
- Wiki states "Ocean Acidification ⚠️ Beyond Boundary 1.05x 2025 Worsening"

**Verification Required:**
- [ ] Does Richardson et al. (2023) place ocean acidification at 81%?
- [ ] Quote: What does the paper say about aragonite saturation?
- [ ] **CRITICAL DISCREPANCY:** Research says "within safe limits at margin," wiki says "Beyond Boundary" - which is correct?
- [ ] Did ocean acidification cross the boundary between 2023 and 2025?

#### Claim 11: Freshwater Transgression Timing

**Location:** `research/planetary_boundaries_2023_update_20251111.md:162-180`

**Specific Claims:**
- Blue water disturbance: 18.2%
- Green water disturbance: 15.8%
- Status: "IN ZONE OF INCREASING RISK (not yet transgressed)"
- **Transgression occurred 1905-1929** (earlier than recognized)

**Current Implementation:** `docs/wiki/systems/planetary-boundaries.md:27`
- Wiki states "Freshwater Change ⚠️ Beyond Boundary 1.15x 2023 Worsening"

**Verification Required:**
- [ ] Does Richardson et al. (2023) state freshwater is "in risk zone" not "transgressed"?
- [ ] Quote: What does the paper say about freshwater boundary status?
- [ ] Does the paper provide the 1905-1929 transgression timing?
- [ ] **CRITICAL DISCREPANCY:** Research says "in risk zone," wiki says "Beyond Boundary" - which is correct?

#### Claim 12: Comparison to 2015 Framework

**Location:** `research/planetary_boundaries_2023_update_20251111.md:185-196`

**Specific Claim:** "Zero improvement in any previously transgressed boundary except ozone"

**Verification Required:**
- [ ] Does Richardson et al. (2023) include a comparison table to 2015 values?
- [ ] Quote: What does the paper say about trends since 2015?
- [ ] Are the 2015 baseline values provided in the paper?

---

## Simulation Integration Questions

### Implementation Gaps

1. **6 vs 7 boundaries transgressed:**
   - Research doc: 6/9 transgressed
   - Current code: 7/9 breached
   - **Which is correct?** Ocean acidification and freshwater status unclear

2. **Missing HANPP metric:**
   - Research doc introduces HANPP (30% vs 10% safe)
   - Current code uses extinction rate only for biosphere
   - **Should we add HANPP as second biosphere metric?**

3. **CO₂ concentration:**
   - Research doc: 417 ppm (2023)
   - Current code: 425 ppm (2025 projection)
   - **Is 425 ppm reasonable for 2025?**

4. **Freshwater status:**
   - Research doc: "in zone of increasing risk" (not transgressed)
   - Wiki doc: "Beyond Boundary"
   - **Need clarification on transgression vs risk zone**

5. **Ocean acidification status:**
   - Research doc: 81% (just above 80% boundary, within safe limits)
   - Wiki doc: "Beyond Boundary 1.05x"
   - **Did it cross between 2023 and 2025?**

---

## Verification Checklist

### Citation Verification
- [ ] Confirm Richardson et al. (2023) exists in Science Advances
- [ ] Verify author names and institutional affiliations
- [ ] Check DOI link accessibility
- [ ] Confirm 29 authors from 8 countries

### Quantitative Values Verification
- [ ] CO₂: 417 ppm (vs code's 425 ppm)
- [ ] Radiative forcing: +2.91 W/m² (vs code's 1.21x normalized)
- [ ] Extinction rate: >100 E/MSY (vs code's 100-1000 range)
- [ ] HANPP: 30% (NEW METRIC - not in code)
- [ ] Land system: 60% global forest (vs wiki's 62%)
- [ ] Nitrogen: 190 Tg N/year (not detailed in code)
- [ ] Phosphorus: 22.6 global / 17.5 regional Tg P/year (vs wiki's 18.2)
- [ ] Ozone: 284.6 DU (vs wiki's 285 DU)
- [ ] Ocean acidification: 81% (vs wiki's 1.05x)
- [ ] Freshwater: 18.2% blue / 15.8% green (vs wiki's 1.15x)

### Status Classification Verification
- [ ] Climate: TRANSGRESSED (confirmed)
- [ ] Biosphere (genetic): TRANSGRESSED (confirmed)
- [ ] Biosphere (functional/HANPP): TRANSGRESSED (NEW)
- [ ] Land system: TRANSGRESSED (confirmed)
- [ ] Nitrogen: TRANSGRESSED (confirmed)
- [ ] Phosphorus: TRANSGRESSED (confirmed)
- [ ] Novel entities: TRANSGRESSED (confirmed)
- [ ] Ozone: SAFE (confirmed)
- [ ] Aerosols: SAFE (confirmed)
- [ ] **Ocean acidification: MARGIN (research) vs TRANSGRESSED (wiki) - VERIFY**
- [ ] **Freshwater: RISK ZONE (research) vs TRANSGRESSED (wiki) - VERIFY**

### Historical Claims Verification
- [ ] Freshwater transgression: 1905-1929 (earlier than thought)
- [ ] All transgressed boundaries worsened since 2015
- [ ] Ozone only boundary showing improvement

### Methodological Claims Verification
- [ ] HANPP replaces BII for functional biosphere
- [ ] Novel entities definition narrowed to synthetic only
- [ ] Freshwater expanded to include green water (soil moisture)

---

## Expected Validation Outcomes

### If Citations Valid:

**Path A: Richardson et al. (2023) confirms 6/9 transgressed**
- Update code to reflect 6/9 (freshwater and ocean at margin, not transgressed)
- Add HANPP metric for functional biosphere
- Update thresholds to 2023 values
- Clarify boundary vs risk zone distinction

**Path B: Richardson et al. (2023) states 7/9 transgressed**
- Research doc misinterpreted status
- Code is correct
- Clarify which boundaries are at margin vs transgressed

**Path C: Paper ambiguous or status changed 2023→2025**
- Use 2023 values as baseline
- Project 2025 values with documented assumptions
- Mark projection as "estimated" not "verified"

### If Citations Invalid:

- Flag claims as UNVERIFIED
- Search for alternative sources (Stockholm Resilience Centre, IPCC)
- Document uncertainty in code comments
- Consider removing or marking as provisional

---

## Files Requiring Updates

### If Validation Passes:

1. **Core Implementation:**
   - `src/simulation/planetaryBoundaries.ts` (update thresholds, add HANPP)
   - `src/types/planetaryBoundaries.ts` (add HANPP fields)

2. **Documentation:**
   - `docs/wiki/systems/planetary-boundaries.md` (sync with 2023 framework)
   - `docs/wiki/README.md` (update status summary)

3. **Tests:**
   - `tests/integration/state-validation-planetary-boundaries.test.ts` (update expected values)

4. **Configuration:**
   - `src/simulation/config/centralConfig.ts` (update if thresholds changed)

---

## Next Steps

1. **Research Skeptic Review:** Validate Richardson et al. (2023) claims (Layer 1 + Layer 2)
2. **Super-Alignment Researcher:** Extract additional parameters if needed
3. **Simulation Maintainer:** Update implementation if validation passes
4. **Architect:** Update roadmap and close verification issue

---

**Verification File Created:** 2025-11-11
**Verification Status:** PENDING (awaiting research-skeptic review)
**Priority:** MEDIUM (documentation update, not blocking simulation)
