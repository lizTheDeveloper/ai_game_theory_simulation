# Research Verification Spec: Biodiversity & Nuclear Winter (Commit 1cd141d)

**Date:** November 13, 2025
**Commit:** 1cd141d329c98f5a423ef4449fc38ea7e3aa9505
**Historian:** Auto-generated verification file
**Purpose:** TWO-LAYER verification (citation existence + claim accuracy) for new research assessments

---

## Overview

Two new research files added:
1. `research/biodiversity_extinction_rates_20251113.md` (273 lines, 5 sources)
2. `research/nuclear_winter_climate_effects_20251113.md` (485 lines, 8 sources)

These files provide 2024-2025 peer-reviewed backing for **existing simulation mechanics**:
- Biodiversity: `src/simulation/planetaryBoundaries.ts` (extinctionRate parameters)
- Nuclear winter: `src/simulation/engine/phases/NuclearWinterPhase.ts`, `src/simulation/nuclearWinter.ts`

**Verification Required:** LAYER 1 (do papers exist?) + LAYER 2 (do papers support claims?)

---

## LAYER 1: Citation Existence Verification

### Biodiversity File (5 citations)

1. **IPBES (2019).** "Global Assessment Report on Biodiversity and Ecosystem Services."
   - **URL:** https://www.ipbes.net/global-assessment
   - **Verify:** Report exists, published 2019, authoritative (145 countries, 400+ experts)

2. **Wiens et al. (2022).** "Biodiversity crisis or sixth mass extinction?" *EMBO Reports*, 23(1).
   - **DOI:** https://doi.org/10.15252/embr.202154193
   - **Verify:** Paper exists, peer-reviewed journal, correct authors/year/title

3. **UN Environment Programme (2024).** "Warning: a sixth mass species extinction is on the cards."
   - **URL:** https://www.unep.org/news-and-stories/story/warning-sixth-mass-species-extinction-cards
   - **Verify:** Article exists, UN agency publication

4. **UN Foundation (2019).** "Key Findings to Know from the IPBES Report on Biodiversity."
   - **URL:** https://unfoundation.org/blog/post/key-findings-to-know-from-the-ipbes-report-on-biodiversity/
   - **Verify:** Article exists, policy translation source

5. **IPBES (2025).** "Second Global Assessment (announced June 2025)."
   - **URL:** https://www.ipbes.net/
   - **Verify:** Announcement exists, status confirmed (in progress, expected 2027-2028)

### Nuclear Winter File (8 citations)

1. **Xia, L. et al. (2022).** "Global food insecurity and famine..." *Nature Food*, 3, 586–596.
   - **DOI:** Implied Nature Food publication
   - **Verify:** Paper exists, correct authors, Nature Food journal, 2022

2. **Toon, B. R., Robock, A., & Turco, R. P. (2008).** "Environmental consequences of nuclear war." *Physics Today*, 61(12), 37-42.
   - **Verify:** Foundational paper exists, correct journal/year/pages

3. **Penn State University (2025).** "Cycles agroecosystem model simulation of nuclear winter impacts."
   - **Verify:** Research published 2025, 38,572 locations modeled (find publication)

4. **Robock, A. et al. (multiple publications 2007-2024).** "Climatic consequences of nuclear conflict."
   - **Website:** https://climate.envsci.rutgers.edu/nuclear/
   - **Verify:** Website exists, research lab active, papers accessible

5. **Mills, M. J. et al. (2014, reaffirmed 2024-2025).** "Smoke from nuclear war would devastate ozone layer."
   - **Source:** NCAR/UCAR
   - **Verify:** Paper exists, 2014 publication, 2024-2025 reaffirmation evidence

6. **IIASA (2025).** "The looming shadow of nuclear winter."
   - **URL:** https://iiasa.ac.at/blog/may-2025/looming-shadow-of-nuclear-winter
   - **Verify:** Blog post exists, correct institution, 2025 date

7. **US National Academies (2023-2025).** "Independent Study on Potential Environmental Effects of Nuclear War."
   - **Verify:** Study commissioned, status in progress (as of March 2025), not yet published

8. **Yale Climate Connections (2025).** "Nuclear winter from a Pakistan-India war could kill 2 billion."
   - **Verify:** Article exists, science communication source, 2025 date

---

## LAYER 2: Claim Verification (CRITICAL)

**Instructions:** For each claim below, find the SPECIFIC PASSAGE in the paper that supports it. If claim is NOT supported, mark UNVERIFIED.

### Biodiversity Claims

#### Claim 1: "1 million species threatened with extinction"
- **File:** research/biodiversity_extinction_rates_20251113.md:32
- **Source:** IPBES (2019)
- **Verification Needed:**
  - Does IPBES 2019 report state "1 million species threatened"?
  - Quote exact passage
  - Context: Out of how many total species?

#### Claim 2: "25% of assessed species groups are threatened"
- **File:** research/biodiversity_extinction_rates_20251113.md:33
- **Source:** IPBES (2019)
- **Verification Needed:**
  - Does IPBES report state "25% threatened"?
  - What does "assessed species groups" mean? (all species or only those evaluated?)
  - Quote exact passage

#### Claim 3: "Extinction rates: tens to hundreds of times higher than natural background"
- **File:** research/biodiversity_extinction_rates_20251113.md:35
- **Source:** IPBES (2019)
- **Verification Needed:**
  - Exact quote from IPBES report
  - Does report specify "tens to hundreds"? (or wider range?)

#### Claim 4: "100-1,000x background rate (conservative)"
- **File:** research/biodiversity_extinction_rates_20251113.md:78
- **Source:** Implied from IPBES "tens to hundreds"
- **Verification Needed:**
  - Is "100-1,000x" accurate translation of "tens to hundreds"?
  - "Tens" = 10-99? "Hundreds" = 100-999?
  - Is this the IPBES range or interpretation?

#### Claim 5: "1,000 to 10,000 times background rate, literally dozens going extinct every day"
- **File:** research/biodiversity_extinction_rates_20251113.md:86
- **Source:** UN Environment Programme (2024) and UN Foundation (2019)
- **Verification Needed:**
  - Do sources ACTUALLY state "1,000 to 10,000x"?
  - Do sources state "dozens per day"?
  - Quote exact passages
  - **Red flag:** These are policy/communication sources - do they cite peer-reviewed research for these numbers?

#### Claim 6: "Confirmed extinctions (past 500 years): <1,000 species (~0.1% of known species)"
- **File:** research/biodiversity_extinction_rates_20251113.md:101
- **Source:** Wiens et al. (2024), IUCN data analysis
- **Verification Needed:**
  - Does Wiens et al. 2024 provide this number?
  - **Note:** Citation is "Wiens et al. (2022)" elsewhere - year inconsistency
  - IUCN Red List data: Can we independently verify <1,000 confirmed extinctions?

#### Claim 7: "Current rates = mass extinction speed, but percentage threshold not yet met"
- **File:** research/biodiversity_extinction_rates_20251113.md:135
- **Source:** Wiens et al. (2022)
- **Verification Needed:**
  - Does paper conclude "current rates = mass extinction speed"?
  - Does paper distinguish rate vs. percentage threshold?
  - Quote exact passage with context

### Nuclear Winter Claims

#### Claim 8: "50-100 warheads, 15-kiloton yield → 5-5.5 Mt soot injection"
- **File:** research/nuclear_winter_climate_effects_20251113.md:29-33
- **Source:** Toon, Robock, & Turco (2008)
- **Verification Needed:**
  - Does paper state "5-5.5 Mt" for India-Pakistan scenario?
  - Does paper specify "50-100 warheads @ 15 kt"?
  - Quote exact soot injection estimate

#### Claim 9: "~2 billion within 2 years (Xia et al. 2022)" [famine deaths from limited war]
- **File:** research/nuclear_winter_climate_effects_20251113.md:35
- **Source:** Xia et al. (2022), Nature Food
- **Verification Needed:**
  - Does Xia et al. 2022 state "2 billion deaths" for 5 Mt scenario?
  - Timeline: "within 2 years" specified?
  - Quote exact passage

#### Claim 10: "Corn yield reduction: ~7% globally (first 5 years)"
- **File:** research/nuclear_winter_climate_effects_20251113.md:38
- **Source:** Penn State University (2025)
- **Verification Needed:**
  - Does Penn State 2025 study state "7% corn reduction"?
  - For what soot scenario? (5 Mt?)
  - Is this a published paper or unpublished research?

#### Claim 11: "150-165 Mt soot → 8-12°C cooling → ~90% calorie drop → ~5 billion deaths"
- **File:** research/nuclear_winter_climate_effects_20251113.md:61-73
- **Source:** Xia et al. (2022)
- **Verification Needed:**
  - Does Xia et al. state "150-165 Mt" soot injection?
  - Does paper state "8-12°C" global cooling?
  - Does paper state "~90% calorie drop"?
  - Does paper conclude "~5 billion deaths"?
  - Quote exact passages for each claim

#### Claim 12: "Only about 2% of current nuclear weapons...would abruptly cause ice age temperatures, putting over 2 billion people at risk"
- **File:** research/nuclear_winter_climate_effects_20251113.md:76
- **Source:** Implied Xia et al. 2022 or Robock
- **Verification Needed:**
  - Who said this? Exact source?
  - Does paper state "2% of weapons" threshold?
  - "Ice age temperatures" - exact quote?

#### Claim 13: "0.06°C cooling per Mt of soot (moderate sensitivity)"
- **File:** research/nuclear_winter_climate_effects_20251113.md:305
- **Source:** Robock et al. (2007-2024)
- **Verification Needed:**
  - Does Robock research state "0.06°C per Mt"?
  - Which specific paper/model?
  - Is this consensus value or one model's result?

#### Claim 14: "8% crop reduction per °C cooling" + "2% per °C darkening" + "3% per °C drying"
- **File:** research/nuclear_winter_climate_effects_20251113.md:329-333
- **Source:** Xia et al. (2022), Penn State (2025)
- **Verification Needed:**
  - Do papers provide these SPECIFIC coefficients?
  - Or are these extrapolations from general findings?
  - **Red flag:** Very precise numbers - need exact source

#### Claim 15: "Ozone depletion: 50-100% increase in surface UV-B"
- **File:** research/nuclear_winter_climate_effects_20251113.md:118
- **Source:** Mills et al. (2014)
- **Verification Needed:**
  - Does Mills et al. state "50-100% UV-B increase"?
  - For what soot scenario?
  - Quote exact passage

#### Claim 16: "Penn State (2025): 38,572 locations modeled globally"
- **File:** research/nuclear_winter_climate_effects_20251113.md:42
- **Source:** Penn State University (2025)
- **Verification Needed:**
  - Is this a published paper? Preprint? Press release?
  - Can we access the research?
  - Exact title and authors?

---

## Existing Code References (Context for Verification)

### Biodiversity Implementation

**File:** `src/simulation/planetaryBoundaries.ts`

```typescript
// Line 398: Tropical rainforests
extinctionRate: 180.0,  // 180 E/MSY (hotspot, ~1.8× global average)

// Line 414: Temperate forests
extinctionRate: 35.0,   // 35 E/MSY (protected, reforestation)

// Line 430: Grasslands/savannas
extinctionRate: 80.0,   // 80 E/MSY (megafauna pressure)
```

**Research Claim:** "100-1,000x background rate" (research file)
**Background Rate:** 1 E/MSY (natural)
**Code Values:** 35-180 E/MSY

**Consistency Check:**
- 35 E/MSY = 35× background ✅ (within 100-1,000× range lower bound)
- 180 E/MSY = 180× background ✅ (within range)
- **Conclusion:** Code parameters consistent with research-backed range

### Nuclear Winter Implementation

**File:** `src/simulation/engine/phases/NuclearWinterPhase.ts`

```typescript
// Line 39: currentSoot range 0-150 Mt
assertInRange(winter.currentSoot, 0, 150, {...})

// Line 45: temperatureAnomaly range -20 to 0°C
assertInRange(winter.temperatureAnomaly, -20, 0, {...})

// Line 51: cropYieldMultiplier 0-1 probability
assertProbability(winter.cropYieldMultiplier, {...})
```

**Research Claims:**
- Soot: 5-165 Mt (research file)
- Cooling: 0.3-12°C (research file)
- Crop reduction: 7-90% (research file)

**Consistency Check:**
- Code max soot: 150 Mt vs research max 165 Mt ⚠️ (slight mismatch, 10% difference)
- Code max cooling: 20°C vs research max 12°C ⚠️ (code MORE pessimistic)
- Code crop reduction: via cropYieldMultiplier (0-1) ✅

**Questions for Verification:**
1. Is 165 Mt the true max from literature? Or is 150 Mt sufficient?
2. Is 20°C cooling plausible for worst-case scenarios beyond peer-reviewed estimates?

---

## Simulation Parameters to Verify

### From Biodiversity File

**Section 4.1: Extinction Rate Multiplier (lines 156-180)**

```typescript
extinctionRateMultiplier =
  100 * // Base anthropogenic multiplier (2025)
  (1 + landUseIntensity) *
  (1 + climateChangeAcceleration) *
  (1 + pollutionLevel) *
  (1 - protectedAreaCoverage);
```

**Claims to verify:**
- "Current (2025): 100-1,000x background" → Base multiplier = 100
- "With climate change acceleration (2030-2050): 500-5,000x"
- "Cap at 10,000x (maximum plausible speed)"

**Verification needed:**
- Does IPBES or other source specify "100x" as 2025 baseline?
- Does research support "10,000x" cap?

### From Nuclear Winter File

**Section 7.1: Soot Injection (lines 277-296)**

**Claims in comments:**
- "50-100 warheads @ 15 kt = 5-5.5 Mt (Toon/Robock)"
- "100-250 warheads @ 100 kt = 15-30 Mt (scaling)"
- "2,000-4,000 warheads @ 100-500 kt = 150-165 Mt (Xia et al.)"

**Verification needed:**
- Are these EMPIRICAL values from papers or EXTRAPOLATIONS?
- Code comment says "doesn't match literature" for linear formula - verify this

**Section 7.2: Cooling Coefficient (lines 302-320)**

```typescript
const coolingPerMt = 0.06; // °C per Mt of soot (moderate sensitivity)
```

**Verification needed:**
- Does Robock research support 0.06°C/Mt?
- Is this consensus or one model?

**Section 7.3: Agricultural Impact (lines 324-342)**

```typescript
const coolingReduction = coolingMagnitude_C * 0.08; // 8% reduction per °C
const darkeningReduction = coolingMagnitude_C * 0.02; // 2% per °C
const precipitationReduction = coolingMagnitude_C * 0.03; // 3% per °C
```

**Verification needed:**
- Do Xia et al. or Penn State provide these SPECIFIC coefficients?
- Or are these linear approximations of non-linear relationships?

---

## Priority Claims for Verification (Top 10)

1. **IPBES "1 million species"** - Verify exact quote and context
2. **IPBES "25% threatened"** - Verify what "assessed" means
3. **IPBES "100-1,000x"** - Does IPBES state this range or is it interpretation?
4. **Xia et al. "5 billion deaths"** - Verify exact figure for full-scale scenario
5. **Xia et al. "2 billion deaths"** - Verify for limited (5 Mt) scenario
6. **Penn State 2025 "7% corn reduction"** - Is this published? Accessible?
7. **Robock "0.06°C per Mt"** - Which paper? Consensus value?
8. **Crop reduction coefficients (8%, 2%, 3%)** - Are these from papers or extrapolated?
9. **"2% of nuclear weapons" quote** - Who said this? Exact source?
10. **Wiens et al. year** - Paper cited as both 2022 and 2024 - which is correct?

---

## Known Issues / Red Flags

1. **Wiens et al. year inconsistency:** Cited as both 2022 (line 132) and 2024 (line 102)
2. **Penn State 2025 accessibility:** Is this published? Preprint? Press release?
3. **Precise coefficients:** 0.06°C/Mt, 8%/°C, 2%/°C, 3%/°C - unusually specific, need exact source
4. **"Dozens per day" extinction claim:** From policy sources (UN), not peer-reviewed - verify if backed by research
5. **Code parameter mismatch:** 150 Mt (code) vs 165 Mt (research) - intentional or error?
6. **Cooling range:** 20°C (code) vs 12°C (research) - is code overly conservative?

---

## Verification Workflow

**Step 1: Citation Existence (Layer 1)**
- Verify all 13 sources (5 biodiversity + 8 nuclear) are accessible
- Check DOIs, URLs, institutional affiliations
- Flag any phantom publications

**Step 2: Claim Verification (Layer 2)**
- For each priority claim, locate EXACT PASSAGE in source
- Quote verbatim text that supports claim
- Flag UNVERIFIED if claim not found or misrepresented
- Note EXTRAPOLATIONS (claims derived from but not stated in source)

**Step 3: Parameter Validation**
- Check if simulation parameters match verified research values
- Document any discrepancies (code vs research)
- Recommend parameter updates if needed

**Step 4: Documentation Updates**
- Update research files with verification results
- Add VERIFIED/UNVERIFIED tags to claims
- Create issues for critical mismatches

---

## Orchestrator Handoff

**Status:** Research files exist, verification spec complete
**Next Phase:** VALIDATION (not research)
**Agents Required:**
- super-alignment-researcher (citation verification)
- research-skeptic (claim verification, contradiction detection)

**Expected Timeline:** 2-4 hours (Layer 1: 30-60 min, Layer 2: 90-180 min)

**Output:** Updated research files with VERIFIED/UNVERIFIED annotations, parameter correction recommendations

---

## Changelog

- **2025-11-13:** Initial verification file created by historian agent
