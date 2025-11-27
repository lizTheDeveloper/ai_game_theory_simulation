# Research Verification: HIGH-6, HIGH-7, HIGH-8 Calibration Research

**Date:** 2025-11-27
**Commit:** b15e5a5222975e404d7c077eb5960ef5667f4541
**Verifier:** research-skeptic (Sylvia)
**Status:** PENDING VERIFICATION

---

## Overview

This commit adds three research files supporting hindcast calibration fixes. Each file contains multiple citations that require verification.

**Files Added:**
- `research/temperature_overestimation_HIGH6_research_20251127.md`
- `research/population_underestimation_HIGH7_research_20251127.md`
- `research/biodiversity_collapse_HIGH8_research_20251127.md`

---

## HIGH-6: Temperature Overestimation (+64% error)

**File:** `research/temperature_overestimation_HIGH6_research_20251127.md`

### Citations Requiring Verification

#### 1. IPCC AR6 Climate Sensitivity Ranges
- **Claim:** TCRE range 1.0-2.3°C per 1000 GtC, best estimate 1.65°C
- **Claim:** TCR range 1.0-2.5°C, best estimate ~1.8°C
- **Claim:** ECS range 2.5-4.0°C, best estimate 3.0°C
- **Source:** IPCC AR6 WG1 Chapter 7
- **URL:** https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/
- **Verification needed:**
  - [ ] Paper exists (IPCC AR6 WG1)
  - [ ] TCRE values accurate
  - [ ] TCR values accurate
  - [ ] ECS values accurate

#### 2. Aerosol Forcing Estimate (-1.1 W/m²)
- **Claim:** Total anthropogenic aerosol forcing is -1.1 W/m² (IPCC AR6, 2021)
- **Claim:** Aerosols mask ~30% of GHG warming
- **Source:** IPCC AR6 WG1 Chapter 7
- **Verification needed:**
  - [ ] -1.1 W/m² is the correct IPCC AR6 central estimate
  - [ ] Uncertainty range verified
  - [ ] "30% masking" claim supported

#### 3. Salomons et al. (2024) - ACP
- **Claim:** Multi-model mean adjusted TCR of 1.8 ± 0.3 K
- **Source:** Atmospheric Chemistry and Physics, 24, 8105
- **URL:** https://acp.copernicus.org/articles/24/8105/2024/
- **Verification needed:**
  - [ ] Paper exists
  - [ ] TCR value of 1.8 ± 0.3 K is in paper
  - [ ] Methodology appropriate

#### 4. Quaas et al. (2024) - ESD
- **Claim:** Aerosol pathway crucial for constraining climate sensitivity
- **Source:** Earth System Dynamics, 15, 1435
- **URL:** https://esd.copernicus.org/articles/15/1435/2024/
- **Verification needed:**
  - [ ] Paper exists
  - [ ] Claims match paper content

#### 5. Fiedler et al. (2024) - ACP
- **Claim:** Decomposing aerosol radiative forcing in CMIP6
- **Source:** Atmospheric Chemistry and Physics, 24, 7837
- **URL:** https://acp.copernicus.org/articles/24/7837/2024/
- **Verification needed:**
  - [ ] Paper exists
  - [ ] Relevance to aerosol forcing estimates

#### 6. EGUsphere (2025) Preprint
- **Claim:** Sulfate aerosol persistence as dominant control of cooling bias in CMIP6
- **URL:** https://egusphere.copernicus.org/preprints/2025/egusphere-2025-1059/
- **Verification needed:**
  - [ ] Preprint exists
  - [ ] Not yet peer-reviewed (preprint status noted)

### Key Parameter Recommendations to Verify

| Parameter | Recommended Value | Claimed Source | Verification |
|-----------|------------------|----------------|--------------|
| Aerosol ERF (1990) | -1.1 W/m² | IPCC AR6 | [ ] |
| Aerosol ERF (2024) | -0.8 W/m² | 2024 research | [ ] |
| Climate feedback (λ) | 0.8 K/(W/m²) | IPCC AR6 | [ ] |
| TCRE | 1.65°C / 1000 GtC | IPCC AR6 | [ ] |

---

## HIGH-7: Population Underestimation (-76% error)

**File:** `research/population_underestimation_HIGH7_research_20251127.md`

### Citations Requiring Verification

#### 1. UN World Population Prospects 2024 - Mortality Data
- **Claim:** Global CDR declined 9.3‰ (1990) → 7.76‰ (2024)
- **Source:** UN World Population Prospects 2024
- **URL:** https://population.un.org/wpp/
- **Verification needed:**
  - [ ] UN WPP 2024 database accessible
  - [ ] 1990 CDR = 9.3‰ verified
  - [ ] 2024 CDR = 7.76‰ verified
  - [ ] Trend direction (declining) confirmed

#### 2. UN World Population Prospects 2024 - Fertility Data
- **Claim:** Global TFR declined 3.31 (1990) → 2.25 (2024)
- **Source:** UN World Population Prospects 2024
- **Verification needed:**
  - [ ] 1990 TFR = 3.31 verified
  - [ ] 2024 TFR = 2.25 verified
  - [ ] Decline of 32% over period

#### 3. Our World in Data - Crude Death Rate
- **Source:** https://ourworldindata.org/grapher/crude-death-rate
- **Verification needed:**
  - [ ] Data source accessible
  - [ ] Values consistent with UN WPP

#### 4. World Bank - Death Rate Data
- **Source:** https://data.worldbank.org/indicator/SP.DYN.CDRT.IN
- **Verification needed:**
  - [ ] Data source accessible
  - [ ] Values align with UN WPP

#### 5. Life Expectancy Claims
- **Claim:** Global life expectancy increased from 64.2 years (1990) to ~73.0 years (2024)
- **Source:** UN estimates (implicit)
- **Verification needed:**
  - [ ] 1990 life expectancy value
  - [ ] 2024 life expectancy value
  - [ ] Total increase of 8-9 years

### Key Parameter Recommendations to Verify

| Parameter | Recommended Value | Claimed Source | Verification |
|-----------|------------------|----------------|--------------|
| CDR 1990 | 9.3‰ | UN WPP 2024 | [ ] |
| CDR 2024 | 7.76‰ | UN WPP 2024, OWID | [ ] |
| TFR 1990 | 3.31 | UN WPP 2024 | [ ] |
| TFR 2024 | 2.25 | UN WPP 2024 | [ ] |

---

## HIGH-8: Biodiversity Collapse (-95% error)

**File:** `research/biodiversity_collapse_HIGH8_research_20251127.md`

### Citations Requiring Verification

#### 1. WWF Living Planet Index 2024
- **Claim:** -73% decline in monitored vertebrate populations (1970-2020)
- **Claim:** 5,495 species, 34,836 populations monitored
- **Source:** WWF Living Planet Report 2024
- **URL:** https://livingplanet.panda.org/
- **Verification needed:**
  - [ ] Report exists and accessible
  - [ ] -73% figure accurate
  - [ ] Dataset scope verified (vertebrates only)

#### 2. Our World in Data - LPI Analysis
- **Source:** https://ourworldindata.org/2024-living-planet-index
- **Verification needed:**
  - [ ] Analysis accessible
  - [ ] Methodology explained
  - [ ] Values consistent with WWF source

#### 3. WWF Canada Press Release
- **Claim:** "Catastrophic 73% decline"
- **Source:** https://wwf.ca/media-releases/lpr-2024/
- **Verification needed:**
  - [ ] Press release exists
  - [ ] Quotes accurate

#### 4. Regional Variation Claims
- **Claim:** Latin America & Caribbean: -95% decline (most severe)
- **Claim:** Africa: -76% decline
- **Source:** WWF LPI 2024
- **Verification needed:**
  - [ ] Regional breakdown exists in report
  - [ ] Values accurate

#### 5. 1990-2024 Extrapolation
- **Claim:** Biodiversity index declined from 0.75 (1990) to 0.49 (2024) - normalized to 1970 baseline
- **Claim:** Annual decline rate 1.24%/year
- **Verification needed:**
  - [ ] Calculation methodology sound
  - [ ] Extrapolation beyond 2020 data justified
  - [ ] 1.24%/year rate correctly derived

#### 6. Biodiversity Intactness Index (BII) Research
- **Claim:** BII annual decline rate 0.17-0.23 percentage points/year
- **Source:** Studies from 2001-2012 period (unnamed)
- **Verification needed:**
  - [ ] Source papers identified
  - [ ] BII methodology explained
  - [ ] Values supported by cited research

#### 7. Conservation Effectiveness Claims
- **Claim:** Protected areas expanded from 8.6% to 17.3% of land area (1990-2024)
- **Source:** UNEP-WCMC World Database on Protected Areas
- **Verification needed:**
  - [ ] WDPA data accessible
  - [ ] 1990 coverage percentage
  - [ ] 2024 coverage percentage

#### 8. Species Recovery Examples
- **Claims:** Gray wolf, bald eagle, black rhino, giant panda, humpback whale recovery
- **Verification needed:**
  - [ ] Each claim has supporting source
  - [ ] Population numbers accurate (e.g., gray wolf <1000 to >6000)

#### 9. Deforestation Rate Decline
- **Claim:** Global forest loss declined from ~10-12 Mha/year (1990s) to ~4-5 Mha/year (2020s)
- **Source:** Implied FAO/Global Forest Watch
- **Verification needed:**
  - [ ] Source identified
  - [ ] Values accurate

### Key Parameter Recommendations to Verify

| Parameter | Recommended Value | Claimed Source | Verification |
|-----------|------------------|----------------|--------------|
| Baseline decline rate | 1.24%/year | WWF LPI extrapolation | [ ] |
| Starting biodiversity (1990) | 0.75 | WWF LPI normalized | [ ] |
| Ending biodiversity (2024) | 0.49 | WWF LPI extrapolated | [ ] |

---

## Verification Priority

**HIGH PRIORITY (Implementation-blocking):**
1. IPCC AR6 aerosol forcing (-1.1 W/m²) - required for HIGH-6 fix
2. UN WPP 2024 CDR/TFR values - required for HIGH-7 fix
3. WWF LPI 2024 decline rate (1.24%/year) - required for HIGH-8 fix

**MEDIUM PRIORITY:**
4. Supporting 2024 climate papers (Salomons, Quaas, Fiedler)
5. Life expectancy trajectory claims
6. Protected area expansion statistics

**LOW PRIORITY:**
7. Species recovery anecdotes (illustrative, not implementation-critical)
8. Deforestation rate decline (supporting context)

---

## Verification Process

1. **Sylvia (research-skeptic)** reviews:
   - Citation existence (do papers exist?)
   - Claim accuracy (do papers say what's claimed?)
   - Cherry-picking risk (are contrary findings ignored?)

2. **Result:** Mark each claim as:
   - VERIFIED (paper exists AND supports claim)
   - PARTIALLY VERIFIED (paper exists, claim needs refinement)
   - UNVERIFIED (paper doesn't exist OR doesn't support claim)

3. **Output:** Updated verification file with findings

---

## References to Code

These research documents recommend changes to:
- `src/simulation/engine/phases/AerosolForcingPhase.ts` (new phase)
- `src/simulation/constants/climate.ts` (aerosol parameters)
- `src/simulation/constants/demographics.ts` (CDR/TFR tables)
- `src/simulation/engine/phases/BiodiversityPhase.ts` (extinction rate)
- `src/simulation/engine/phases/BaselineMortalityPhase.ts` (historical mode)

Implementation should NOT proceed until verification is complete.
