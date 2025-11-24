# Research Verification: Hindcasting Data Loaders

**Commit:** 6ee48e3f1191b5fe0a2d870c9f1c623a9952c849
**Date:** November 23, 2025
**Files Changed:**
- `src/data/loaders/historicalClimateLoader.ts` (329 lines)
- `src/data/loaders/historicalEconomicLoader.ts` (338 lines)

## Overview

This commit introduces hardcoded historical timeseries data for hindcasting validation. The data claims to come from authoritative sources (NOAA, NASA, World Bank, UN). **Both citation existence AND claim accuracy must be verified.**

---

## Layer 1: Citation Existence Verification

### Climate Data Sources (historicalClimateLoader.ts)

| Source | Claimed URL | Status |
|--------|-------------|--------|
| NOAA Mauna Loa CO2 | gml.noaa.gov/ccgg/trends/data.html | NEEDS VERIFICATION |
| NASA GISS GISTEMP v4 | data.giss.nasa.gov/gistemp/ | NEEDS VERIFICATION |
| Global Carbon Budget | globalcarbonbudget.org | NEEDS VERIFICATION |
| AVISO Altimetry | cds.climate.copernicus.eu | NEEDS VERIFICATION |
| NSIDC Sea Ice Index | nsidc.org/data/seaice_index | NEEDS VERIFICATION |

### Economic Data Sources (historicalEconomicLoader.ts)

| Source | Claimed URL | Status |
|--------|-------------|--------|
| World Bank WDI (GDP) | data.worldbank.org/indicator/NY.GDP.MKTP.CD | NEEDS VERIFICATION |
| UN WPP 2024 (Population) | population.un.org/wpp/ | NEEDS VERIFICATION |
| World Bank (Gini) | data.worldbank.org/indicator/SI.POV.GINI | NEEDS VERIFICATION |
| ILO ILOSTAT (Unemployment) | ilostat.ilo.org | NEEDS VERIFICATION |
| UNDP HDR (HDI) | hdr.undp.org | NEEDS VERIFICATION |
| World Bank PovcalNet (Poverty) | pip.worldbank.org | NEEDS VERIFICATION |

---

## Layer 2: Claim Verification (CRITICAL)

### Climate Data Claims to Verify

#### CO2 Concentration (NOAA Mauna Loa)
- **File:** `historicalClimateLoader.ts:123-159`
- **Claim:** Annual CO2 values 1990-2024
- **Sample Values to Verify:**
  - 1990: 354.39 ppm
  - 2000: 369.55 ppm
  - 2010: 389.90 ppm
  - 2020: 414.24 ppm
  - 2024: 426.00 ppm (marked as "estimated")
- **Verification Needed:** Do NOAA Mauna Loa annual means match these exact values?

#### Temperature Anomaly (NASA GISS)
- **File:** `historicalClimateLoader.ts:123-159`
- **Claim:** Annual temperature anomalies relative to 1951-1980 baseline
- **Sample Values to Verify:**
  - 1990: 0.44°C
  - 1998: 0.63°C (El Nino year)
  - 2016: 1.02°C
  - 2023: 1.17°C
  - 2024: 1.45°C (marked as "estimated")
- **Verification Needed:** Do NASA GISS GLB.Ts+dSST values match? Is baseline correctly stated?

#### Emissions (Global Carbon Budget)
- **File:** `historicalClimateLoader.ts:123-159`
- **Claim:** Annual CO2 emissions in MtCO2/year
- **Sample Values to Verify:**
  - 1990: 22,430 MtCO2
  - 2000: 24,900 MtCO2
  - 2010: 32,510 MtCO2
  - 2020: 34,810 MtCO2 (COVID dip)
  - 2024: 37,000 MtCO2 (estimated)
- **Verification Needed:** Global Carbon Budget reports in GtC or GtCO2? Conversion factor correct?

#### Sea Level (AVISO)
- **File:** `historicalClimateLoader.ts:123-159`
- **Claim:** Sea level rise in mm above 1993 baseline
- **Sample Values to Verify:**
  - 1993: 0 mm (baseline)
  - 2000: 33 mm
  - 2010: 74 mm
  - 2020: 114 mm
  - 2024: 130 mm
- **Verification Needed:** Is AVISO the correct source? Does satellite altimetry confirm these values?

#### Arctic Ice (NSIDC)
- **File:** `historicalClimateLoader.ts:123-159`
- **Claim:** September minimum extent in million km2
- **Sample Values to Verify:**
  - 2007: 4.17 million km2 (historic low at time)
  - 2012: 3.39 million km2 (record low)
  - 2020: 3.74 million km2
  - 2024: 4.28 million km2
- **Verification Needed:** Do NSIDC Sea Ice Index values match?

### Economic Data Claims to Verify

#### Global GDP (World Bank)
- **File:** `historicalEconomicLoader.ts:127-162`
- **Claim:** Global GDP in current USD trillions
- **Sample Values to Verify:**
  - 1990: $22.63T
  - 2000: $33.52T
  - 2008: $63.36T (pre-crash peak)
  - 2020: $84.71T (COVID)
  - 2024: $105.00T (estimated)
- **Verification Needed:** World Bank WDI gross world product series - exact match?

#### Population (UN WPP)
- **File:** `historicalEconomicLoader.ts:127-162`
- **Claim:** Global population in billions
- **Sample Values to Verify:**
  - 1990: 5.32B
  - 2000: 6.14B
  - 2011: 7.04B (reached 7B)
  - 2022: 7.95B (reached 8B)
  - 2024: 8.15B
- **Verification Needed:** UN WPP 2024 revision medium variant - exact match?

#### HDI (UNDP)
- **File:** `historicalEconomicLoader.ts:127-162`
- **Claim:** Global average Human Development Index
- **Sample Values to Verify:**
  - 1990: 0.600
  - 2000: 0.660
  - 2019: 0.746 (pre-COVID peak)
  - 2020: 0.739 (COVID drop)
  - 2024: 0.746 (estimated recovery)
- **Verification Needed:** UNDP calculates global HDI differently than simple average - verify methodology

#### Extreme Poverty (World Bank PovcalNet)
- **File:** `historicalEconomicLoader.ts:127-162`
- **Claim:** % living on < $2.15/day PPP
- **Sample Values to Verify:**
  - 1990: 37.8%
  - 2000: 26.2%
  - 2019: 8.4%
  - 2020: 9.3% (COVID spike)
  - 2024: 8.4%
- **Verification Needed:** $2.15 threshold is 2017 PPP - were earlier values retroactively adjusted?

#### Gini Index
- **File:** `historicalEconomicLoader.ts:127-162`
- **Claim:** Global average Gini coefficient (population-weighted)
- **Values:** 38.0 (1990) trending to 35.1 (2024)
- **Verification Needed:** Global Gini is complex to compute - what methodology was used?

#### Unemployment (ILO)
- **File:** `historicalEconomicLoader.ts:127-162`
- **Claim:** Global average unemployment rate
- **Values:** ~6.0% (1990) to ~5.8% (2024)
- **Verification Needed:** ILO ILOSTAT global unemployment - methodology and exact values?

---

## Verification Priority

**HIGH PRIORITY (foundational for hindcasting):**
1. CO2 concentration (NOAA) - Key climate variable
2. Temperature anomaly (NASA GISS) - Primary validation metric
3. Population (UN WPP) - Key denominator for per-capita metrics
4. Global GDP (World Bank) - Economic baseline

**MEDIUM PRIORITY (important context):**
5. Emissions (Global Carbon Budget) - Driver variable
6. HDI (UNDP) - Quality of life metric
7. Extreme poverty (World Bank) - Development metric

**LOWER PRIORITY (supplementary):**
8. Sea level (AVISO)
9. Arctic ice (NSIDC)
10. Gini, Unemployment

---

## Validation Instructions

For each data point:
1. Navigate to the claimed source URL
2. Download the relevant dataset
3. Find the exact value for the claimed year
4. Compare: Does it match within ±1%?
5. Document any discrepancies

**Expected Outcome:** Most values should be accurate since these are well-documented authoritative sources. Key risks:
- Rounding differences
- Different data series (e.g., land-only vs land-ocean temperature)
- Revisions to historical data
- Unit conversions (GtC vs GtCO2)
- 2024 values marked "estimated" - verify against preliminary data

---

## Status

**Created:** November 23, 2025 (historian)
**Status:** NEEDS VERIFICATION
**Next Action:** Orchestrator should route to super-alignment-researcher (Cynthia) for Layer 1+2 verification

---

## References

- Commit: 6ee48e3f1191b5fe0a2d870c9f1c623a9952c849
- Plan: plans/hindcasting_validation_implementation_plan.md
- Wiki: docs/wiki/README.md (updated Nov 23)
