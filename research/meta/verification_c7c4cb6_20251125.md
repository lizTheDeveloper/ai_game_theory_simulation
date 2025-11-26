# Research Verification: Regional CDR Scaling (c7c4cb69a)

**Commit:** c7c4cb69a281abf16736db0ddaa49ec8be8816c3
**Date:** Nov 25, 2025
**Feature:** Regional historical death rate (CDR) scaling for hindcast demographic tuning
**Files Changed:** `BaselineMortalityPhase.ts`, `regionalPopulations.ts`

## Summary

This commit adds region-specific crude death rate (CDR) curves to the hindcast demographic model, matching the approach used for birth rates. The goal is to reduce 2010-2020 population overshoot from 10.3% to 4-6%.

## Research Claims Requiring Verification

### 1. UN WPP 2024 Regional CDR Data

**Location:** `src/simulation/engine/phases/BaselineMortalityPhase.ts:340-410`

**Claim:** The following regional CDR values are from UN World Population Prospects 2024 (28th edition, July 2024):

| Region | 1990 | 2000 | 2010 | 2020 | 2025 |
|--------|------|------|------|------|------|
| Sub-Saharan Africa | 15.6 | 13.5 | 10.2 | 8.7 | 8.0 |
| East Asia | 7.0 | 6.8 | 7.1 | 7.6 | 8.0 |
| South Asia | 10.5 | 8.5 | 7.5 | 7.0 | 6.8 |
| Europe | 11.0 | 11.5 | 11.8 | 12.2 | 12.5 |
| North America | 8.8 | 8.4 | 8.0 | 9.5 | 9.0 |
| Latin America | 7.0 | 6.2 | 5.9 | 6.5 | 6.8 |
| Middle East & North Africa | 8.5 | 6.5 | 5.5 | 5.8 | 5.5 |
| Southeast Asia | 9.0 | 7.5 | 6.8 | 7.0 | 7.2 |
| Central Asia | 8.0 | 7.0 | 6.5 | 6.0 | 6.0 |
| Oceania | 7.5 | 7.0 | 6.5 | 6.5 | 6.8 |

**Verification Required:**
1. **Citation existence:** Does UN WPP 2024 (28th edition) exist and is it accessible?
2. **Claim accuracy:** Do the above CDR values match UN WPP 2024 data for each region-year combination?
3. **Regional definitions:** Do UN WPP regional groupings match the simulation's regional definitions?

**Source to verify against:** https://population.un.org/wpp/Download/Standard/Mortality/

### 2. Sub-Saharan Africa Mortality Trajectory

**Location:** `src/simulation/engine/phases/BaselineMortalityPhase.ts:344-348`

**Claim:** "Sub-Saharan Africa: 15.6/1000 (1990) → 8.7/1000 (2020) - rapid decline"

**Additional claims:**
- "High infant/child mortality + disease burden" (1990)
- "HIV/AIDS peak era" (2000)
- "Improved healthcare + ARVs" (2010)

**Verification Required:**
- Is 15.6/1000 accurate for SSA 1990?
- Is the HIV/AIDS attribution for 2000 peak accurate?
- Is 8.7/1000 accurate for 2020?

### 3. Europe Aging Effect

**Location:** `src/simulation/engine/phases/BaselineMortalityPhase.ts:362-368`

**Claim:** "Europe: 11.0/1000 (1990) → 12.2/1000 (2020) - aging populations increase"

**Verification Required:**
- Does Europe CDR actually INCREASE from 1990 to 2020 due to aging?
- Are the specific values accurate?

### 4. East Asia Demographic Transition

**Location:** `src/simulation/engine/phases/BaselineMortalityPhase.ts:349-355`

**Claim:** "East Asia: 7.0/1000 (1990) → 7.6/1000 (2020) - Low baseline (post-demographic transition)"

**Verification Required:**
- Is 7.0/1000 accurate for East Asia 1990?
- Is the "post-demographic transition" characterization accurate for 1990?

### 5. North America COVID-19 + Opioid Impact

**Location:** `src/simulation/engine/phases/BaselineMortalityPhase.ts:369-375`

**Claim:** "2020: 9.5/1000 - COVID-19 + opioid crisis impact"

**Verification Required:**
- Is 9.5/1000 accurate for North America 2020?
- Is the increase from 8.0 (2010) to 9.5 (2020) attributable to COVID+opioids?

## Secondary Claims (Lower Priority)

### 6. World Bank Data Validation

**Location:** `src/simulation/engine/phases/BaselineMortalityPhase.ts:325`

**Claim:** "Regional estimates validated against World Bank data (1990-2023)"

**Verification Required:**
- Were values actually cross-validated with World Bank data?
- Any discrepancies between UN WPP and World Bank?

### 7. Regional Mortality Variation Factor

**Location:** `src/simulation/regionalPopulations.ts:477-480`

**Claim:** "Regional mortality varies by 2x"

**Verification Required:**
- Is 2x an accurate characterization of the variance?
- Actual range appears to be 5.5/1000 (MENA 2010) to 15.6/1000 (SSA 1990) = 2.8x

## Existing Research Context

**Related files:**
- `research/regional_fertility_decline_2010_2020.md` - Prior CBR research (regional birth rates)
- This CDR research should complement that work

## Verification Status

| Claim | Layer 1 (Exists) | Layer 2 (Accuracy) | Status |
|-------|------------------|--------------------| -------|
| UN WPP 2024 exists | UNVERIFIED | UNVERIFIED | PENDING |
| SSA CDR trajectory | UNVERIFIED | UNVERIFIED | PENDING |
| Europe aging effect | UNVERIFIED | UNVERIFIED | PENDING |
| East Asia baseline | UNVERIFIED | UNVERIFIED | PENDING |
| North America COVID | UNVERIFIED | UNVERIFIED | PENDING |
| World Bank cross-val | UNVERIFIED | UNVERIFIED | PENDING |

## Notes for Validator

1. The code states values are "from UN WPP 2024" but the wiki notes "other regions estimated" - clarify which values are directly from UN vs estimated
2. Regional groupings may not align perfectly (e.g., UN may use different boundaries for "East Asia" vs simulation)
3. 2025 values are projections, not historical data
4. The commit message says "Expected impact: Reduce hindcast overshoot from 10.3% → 4-6%" - this should be validated after implementation

## References

- UN World Population Prospects 2024: https://population.un.org/wpp/
- CDR Download: https://population.un.org/wpp/Download/Standard/Mortality/
- World Bank Mortality Data: https://data.worldbank.org/indicator/SP.DYN.CDRT.IN
