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

## Priority Claims for Verification (Top 10)

### Biodiversity Claims

1. **IPBES "1 million species threatened"** - Verify exact quote and context (biodiversity_extinction_rates:32)
2. **IPBES "25% of assessed species groups threatened"** - Verify what "assessed" means (biodiversity_extinction_rates:33)
3. **IPBES "100-1,000x background extinction rate"** - Does IPBES state this range or is it interpretation? (biodiversity_extinction_rates:78)
4. **Wiens et al. year** - Cited as both 2022 (line 132) and 2024 (line 102) - which is correct?
5. **"Dozens per day" extinction claim** - From UN policy sources, verify if backed by peer-reviewed research (biodiversity_extinction_rates:86)

### Nuclear Winter Claims

6. **Xia et al. "5 billion deaths"** - Verify exact figure for full-scale scenario (nuclear_winter:73)
7. **Xia et al. "2 billion deaths"** - Verify for limited (5 Mt) scenario (nuclear_winter:35)
8. **Penn State 2025 "7% corn reduction"** - Is this published? Accessible? (nuclear_winter:38)
9. **Robock "0.06°C per Mt cooling"** - Which paper? Consensus value? (nuclear_winter:305)
10. **Crop reduction coefficients (8%/°C, 2%/°C, 3%/°C)** - Are these from papers or extrapolated? (nuclear_winter:329-333)

---

## LAYER 1: Citation Existence

### Biodiversity (5 citations)

- [ ] IPBES (2019) Global Assessment - https://www.ipbes.net/global-assessment
- [ ] Wiens et al. (2022) EMBO Reports - DOI: 10.15252/embr.202154193
- [ ] UN Environment (2024) - https://www.unep.org/news-and-stories/story/warning-sixth-mass-species-extinction-cards
- [ ] UN Foundation (2019) - https://unfoundation.org/blog/post/key-findings-to-know-from-the-ipbes-report-on-biodiversity/
- [ ] IPBES (2025) Second Assessment announcement - https://www.ipbes.net/

### Nuclear Winter (8 citations)

- [ ] Xia et al. (2022) Nature Food, 3, 586–596
- [ ] Toon, Robock, & Turco (2008) Physics Today, 61(12), 37-42
- [ ] Penn State (2025) Cycles agroecosystem model - **ACCESSIBILITY QUESTION**
- [ ] Robock (2007-2024) - https://climate.envsci.rutgers.edu/nuclear/
- [ ] Mills et al. (2014) NCAR/UCAR - ozone depletion paper
- [ ] IIASA (2025) - https://iiasa.ac.at/blog/may-2025/looming-shadow-of-nuclear-winter
- [ ] US National Academies (2023-2025) - Study in progress, not yet published
- [ ] Yale Climate Connections (2025) - Science communication article

---

## LAYER 2: Critical Claim Verification

For each priority claim, verification agents must:
1. Locate EXACT PASSAGE in source paper
2. Quote verbatim text supporting claim
3. Mark UNVERIFIED if claim not found or misrepresented
4. Note EXTRAPOLATIONS (claims derived from but not stated in source)

---

## Code Consistency Checks

### Biodiversity Code
- **File:** `src/simulation/planetaryBoundaries.ts`
- **Values:** extinctionRate: 35-180 E/MSY
- **Research:** 100-1,000x background (100-1,000 E/MSY)
- **Consistency:** ✅ Code values within research range

### Nuclear Winter Code
- **File:** `src/simulation/engine/phases/NuclearWinterPhase.ts`
- **Values:** soot 0-150 Mt, cooling -20 to 0°C
- **Research:** soot 5-165 Mt, cooling 0.3-12°C
- **Issues:** 
  - ⚠️ Max soot: 150 vs 165 Mt (10% mismatch)
  - ⚠️ Max cooling: 20°C vs 12°C (code more pessimistic)

---

## Known Red Flags

1. **Penn State 2025 accessibility** - Is this published? Preprint? Press release?
2. **Precise coefficients** - 0.06°C/Mt, 8%/°C unusually specific - need exact source
3. **Wiens year inconsistency** - 2022 vs 2024 citations
4. **Policy source claims** - "Dozens per day" from UN - verify peer-reviewed backing

---

## Orchestrator Handoff

**Status:** Research files exist, verification spec complete, added to SIMULATION_ROADMAP.md queue
**Next Phase:** VALIDATION (super-alignment-researcher + research-skeptic)
**Timeline:** 2-4 hours (Layer 1: 30-60 min, Layer 2: 90-180 min)
**Output:** Updated research files with VERIFIED/UNVERIFIED annotations

---

## Changelog

- **2025-11-13:** Initial verification file created by historian agent
