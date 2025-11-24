# Hindcasting Baseline Data Research (1990-2024)

**Date:** November 24, 2025
**Researcher:** Super-Alignment Researcher (Cynthia)
**Priority:** CRITICAL
**Purpose:** Historical data sources for simulation hindcasting validation

## Executive Summary

This document compiles authoritative historical data sources for validating the simulation by running it from 1990 and comparing predictions against actual 2024 observations. All sources are peer-reviewed or from authoritative international organizations.

**Key Finding:** High-quality timeseries data exists for all major simulation domains (climate, population, economics, governance) from 1990-2024. The hindcasting validation is methodologically feasible.

## 1. Climate Data Sources

### 1.1 Global Temperature Anomaly

**Primary Source:** NASA GISS Surface Temperature Analysis (GISTEMP v4)
- **URL:** https://data.giss.nasa.gov/gistemp/
- **Coverage:** 1880-present (monthly, seasonal, annual means)
- **Baseline:** 1951-1980 mean
- **Format:** TXT and CSV
- **Update Frequency:** Mid-month

**Key 1990-2024 Data Points:**

| Year | Anomaly (C) | Source |
|------|-------------|--------|
| 1990 | +0.45 | NASA GISS |
| 2000 | +0.42 | NASA GISS |
| 2010 | +0.72 | NASA GISS |
| 2020 | +1.02 | NASA GISS |
| 2024 | +1.28 | NASA GISS (record) |

**Trend:** 0.8 ppm/year (1960s) -> 1.6 ppm/year (1980s) -> 1.5 ppm/year (1990s) -> 2.6 ppm/year (2015-2024)

**Secondary Source:** NOAA Global Temperature Index
- Uses 1901-2000 baseline
- Independent analysis, similar conclusions
- https://www.climate.gov/news-features/understanding-climate

### 1.2 Atmospheric CO2 Concentration

**Primary Source:** NOAA Global Monitoring Laboratory - Mauna Loa
- **URL:** https://gml.noaa.gov/ccgg/trends/
- **Coverage:** March 1958-present (longest continuous record)
- **Format:** Annual and monthly CSV
- **Measurement:** Dry air mole fraction (ppm)

**Key 1990-2024 Data Points:**

| Year | CO2 (ppm) | Annual Increase |
|------|-----------|-----------------|
| 1990 | 354.4 | +1.2 |
| 2000 | 369.7 | +1.5 |
| 2010 | 389.9 | +2.4 |
| 2020 | 414.2 | +2.5 |
| 2024 | 424.6 | +3.75 (record) |

**Note:** 2022 volcanic eruption temporarily suspended Mauna Loa measurements. Dec 2022 - July 2023 data from Maunakea Observatories (21 miles north).

**Simulation Implication:** CO2 concentration provides direct validation metric. Model should track CO2 trajectory within 2-3 ppm tolerance.

### 1.3 Sea Level Rise

**Primary Source:** AVISO/CNES Satellite Altimetry
- **URL:** https://www.aviso.altimetry.fr/
- **Coverage:** 1993-present
- **Pre-satellite (1990-1993):** Tide gauge data from PSMSL

**Estimated 1990-2024 Rise:** ~100mm (with acceleration post-2010)

## 2. Population Data

**Primary Source:** UN World Population Prospects 2024 (28th Edition)
- **URL:** https://population.un.org/wpp/
- **Data Portal:** https://population.un.org/dataportal/
- **Coverage:** 237 countries, 1950-present (projections to 2100)
- **Format:** CSV, Excel, API access
- **Resolution:** Annual (previously 5-year, now annual since 2022 revision)

**Key 1990-2024 Data Points:**

| Year | World Population (billions) |
|------|----------------------------|
| 1990 | 5.33 |
| 2000 | 6.15 |
| 2010 | 6.96 |
| 2020 | 7.84 |
| 2024 | 8.12 |

**Fertility Trend:** Global fertility rate fell from 3.31 (1990) to 2.25 (2024) - one child fewer per woman.

**Data Quality:** Based on 1,910 national censuses (1950-2023), vital registration systems, and 3,189 nationally representative surveys.

**Simulation Implication:** Population growth model should track within 2% of observed values.

## 3. Economic Data

### 3.1 Global GDP

**Primary Source:** World Bank Open Data
- **URL:** https://data.worldbank.org/indicator/NY.GDP.MKTP.CD
- **Coverage:** 1960-present
- **Format:** CSV, Excel, API
- **Measure:** Current US$ and constant 2015 US$

**Key 1990-2024 Data Points (Current US$):**

| Year | Global GDP (trillion $) |
|------|------------------------|
| 1990 | ~24 |
| 2000 | ~34 |
| 2010 | ~66 |
| 2020 | ~85 |
| 2024 | ~105 (estimated) |

**Secondary Source:** Our World in Data (processes World Bank data)
- International-$ in 2021 prices
- Includes pre-1990 extension via Maddison Project Database

### 3.2 Income Inequality (Gini Index)

**Primary Source:** World Bank Poverty and Inequality Platform (PIP)
- **URL:** https://data.worldbank.org/indicator/SI.POV.GINI
- **Coverage:** Country-level data, patchy before 2000
- **Global Estimates:** Research papers synthesizing national data

**Key Global Gini Trends:**

| Period | Global Gini | Trend |
|--------|-------------|-------|
| 1990 | ~70 | - |
| 2000 | ~68 | Declining (-0.42%/year) |
| 2010 | ~66 | Declining (China growth effect) |
| 2019 | ~62 | Declined to pre-pandemic low |
| 2020 | ~64 | COVID shock (largest single-year increase since 1990) |
| 2024 | ~63 | Partial recovery |

**Secondary Source:** World Inequality Database (WID)
- **URL:** https://wid.world/data/
- Academic consortium, high-quality wealth/income data

**Simulation Implication:** Model should capture the 1990-2019 decline and 2020 COVID shock.

## 4. Human Development Data

**Primary Source:** UNDP Human Development Index (HDI)
- **URL:** https://hdr.undp.org/data-center/human-development-index
- **Data Portal:** https://hdr.undp.org/data-center
- **Coverage:** 1990-2024, 193 countries
- **Components:** Life expectancy, education (mean + expected years), GNI per capita

**Key 1990-2024 Global HDI Trends:**

| Year | Global HDI | Status |
|------|-----------|--------|
| 1990 | 0.597 | Baseline |
| 2000 | 0.644 | Steady growth |
| 2010 | 0.695 | Steady growth |
| 2019 | 0.737 | Pre-pandemic high |
| 2020 | 0.732 | COVID decline |
| 2021 | 0.732 | Stagnation |
| 2022 | 0.739 | Recovery |
| 2023 | 0.743 | New high |

**Regional Insights:**
- Highest growth since 1990: East Asia & Pacific
- Highest growth since 2000: South Asia
- Largest single-country gains: Mozambique, Niger, Guinea (from low base)

**Important Note:** HDI methodology updated; values recalculated for historical comparisons within each report.

**Simulation Implication:** Map HDI components to QualityOfLife subsystem dimensions.

## 5. Governance/Democracy Data

**Primary Source:** V-Dem (Varieties of Democracy) Project
- **URL:** https://v-dem.net/
- **Version:** V-Dem 14.1 (2024 release)
- **Coverage:** 202 countries, 1789-2024
- **Indicators:** 600+ variables

**Key Indicators for Simulation:**
1. Electoral Democracy Index (v2x_polyarchy): 0-1 scale
2. Liberal Component Index (v2x_liberal): 0-1 scale
3. Egalitarian Component Index (v2x_egalitarian): 0-1 scale

**1990-2024 Global Democracy Trends:**
- 1990: Post-Cold War democratic expansion
- 2000-2010: Consolidation, mixed trends
- 2010-2024: Democratic recession in many regions

**Existing Loader:** `src/data/loaders/vdemLoader.ts` already supports 2024 snapshot; extend for timeseries.

## 6. Validation Methodology

### 6.1 Acceptable Deviation Thresholds

Based on peer-reviewed climate model validation literature:

**Climate Model Confidence Index (CMCI):**
- **Satisfactory:** CMCI <= 0.50 (difference <= 0.5 standard deviation)
- **Poor but acceptable:** 0.50 < CMCI <= 1.00 (difference <= 1 standard deviation)
- **Unacceptable:** CMCI > 1.00

**Source:** Link Springer - "Development and validation of the Climate Model Confidence Index (CMCI)"
https://link.springer.com/article/10.1007/s00704-021-03581-5

**Recommended Metrics:**
1. Normalized Root Mean Square Error (NRMSE)
2. Standard Deviation Ratio
3. Correlation Coefficient (R2)

**Target Values (Ideal Model):**
- Correlation: R = 1.0
- SD Ratio: 1.0
- NRMSE: 0.0

**Realistic Targets for Hindcasting:**
- R2 >= 0.70 for major variables (temperature, CO2, population, GDP)
- NRMSE <= 0.30 for primary metrics
- Systematic bias < 10% for trajectories

### 6.2 RMSE vs MAE Considerations

Per Geoscientific Model Development (2022), neither RMSE nor MAE is universally superior:
- RMSE optimal for normal (Gaussian) error distributions
- MAE optimal for Laplacian error distributions
- Recommendation: Report both, plus mean absolute deviation

**Source:** https://gmd.copernicus.org/articles/15/5481/2022/

### 6.3 Handling Non-Modeled Events

Key historical events that simulation may not capture:
1. **2008 Financial Crisis:** Global recession, GDP drop
2. **2020 COVID-19 Pandemic:** Population mortality spike, GDP drop, inequality increase
3. **Regional conflicts:** Syria, Ukraine, etc.

**Recommendation:**
- Flag deviation spikes coinciding with known events
- Report "adjusted" metrics excluding event years
- Separate analysis: "Does model capture recovery dynamics?"

## 7. 1990 Baseline Initialization Values

### 7.1 Climate State (1990)

| Parameter | 1990 Value | Source |
|-----------|-----------|--------|
| CO2 Concentration | 354.4 ppm | NOAA Mauna Loa |
| Temperature Anomaly | +0.45C | NASA GISS (vs 1951-1980) |
| Temperature vs Pre-industrial | +0.85C | IPCC estimate |
| Sea Level (anomaly) | 0mm (baseline) | AVISO |

### 7.2 Population State (1990)

| Parameter | 1990 Value | Source |
|-----------|-----------|--------|
| Global Population | 5.33 billion | UN WPP 2024 |
| Fertility Rate | 3.31 children/woman | UN WPP 2024 |
| Life Expectancy | 64.0 years (global) | UN WPP 2024 |

### 7.3 Economic State (1990)

| Parameter | 1990 Value | Source |
|-----------|-----------|--------|
| Global GDP | ~$24 trillion (current $) | World Bank |
| Global Gini | ~70 | World Bank PIP |

### 7.4 Human Development State (1990)

| Parameter | 1990 Value | Source |
|-----------|-----------|--------|
| Global HDI | 0.597 | UNDP HDR |
| Mean Years Schooling | ~5.8 years | UNDP HDR |

### 7.5 AI State (1990)

| Parameter | 1990 Value | Rationale |
|-----------|-----------|-----------|
| AI Agents | 0 | No LLM-class AI existed |
| AI Capability Index | 0 | Pre-modern ML era |

**AI Bootstrap Timeline:**
- 1990-2010: No AI agents (classical ML only)
- 2012: AlexNet (deep learning emergence)
- 2017: Transformers paper
- 2018: GPT-1 (first agent-capable model)
- 2020: GPT-3 (first truly capable agent)
- 2022: ChatGPT (public deployment)

**Recommendation:** Dynamically spawn AI agents at historical emergence points:
- 2018: 1 basic agent (GPT-1 equivalent)
- 2020: 2 agents (GPT-3 + variants)
- 2022: 5 agents (ChatGPT explosion)
- 2023-2024: 10+ agents (current landscape)

## 8. Data Quality Assessment

| Domain | Data Quality | Coverage | Gaps |
|--------|-------------|----------|------|
| Climate (Temp) | Excellent | 1880-2024 | None |
| Climate (CO2) | Excellent | 1958-2024 | None |
| Population | Excellent | 1950-2024 | None |
| GDP | Good | 1960-2024 | Minor gaps pre-1990 |
| Gini | Moderate | 1990-2024 | Country gaps, estimation uncertainty |
| HDI | Good | 1990-2024 | Methodology changes |
| Democracy (V-Dem) | Excellent | 1789-2024 | None |

## 9. Implementation Recommendations

### 9.1 Priority Data Loading Order

1. **Phase 1 (Week 1):** Climate + Population (highest quality, most critical)
2. **Phase 2 (Week 1-2):** GDP + HDI (moderate complexity)
3. **Phase 3 (Week 2):** Gini + V-Dem (existing loader extension)

### 9.2 Cache Strategy

- Download complete timeseries once
- Store in `src/data/cache/historical/`
- Format: JSON for fast loading
- Estimated sizes:
  - Climate: ~10KB (annual CO2/temp)
  - Population: ~50KB (country-level annual)
  - Economic: ~100KB (GDP + Gini by country/year)
  - V-Dem: ~500KB (reduced indicator set)

### 9.3 Uncertainty Handling

For parameters with documented uncertainty:
- Store central estimate + low/high bounds
- Sample from distribution in Monte Carlo runs
- Report sensitivity to initial condition uncertainty

## 10. References

### Primary Data Sources

1. NASA GISS. (2024). GISS Surface Temperature Analysis (GISTEMP v4). https://data.giss.nasa.gov/gistemp/

2. NOAA Global Monitoring Laboratory. (2024). Trends in Atmospheric Carbon Dioxide. https://gml.noaa.gov/ccgg/trends/

3. United Nations Population Division. (2024). World Population Prospects 2024. https://population.un.org/wpp/

4. World Bank. (2024). World Development Indicators. https://data.worldbank.org/

5. UNDP. (2024). Human Development Report Data Center. https://hdr.undp.org/data-center

6. V-Dem Institute. (2024). Varieties of Democracy Dataset v14.1. https://v-dem.net/

### Validation Methodology

7. Willmott, C.J., Matsuura, K. (2005). Advantages of the mean absolute error (MAE) over the root mean square error (RMSE). Climate Research, 30, 79-82.

8. Geoscientific Model Development. (2022). Root-mean-square error (RMSE) or mean absolute error (MAE): when to use them or not. https://gmd.copernicus.org/articles/15/5481/2022/

9. IPCC. (2007). Climate Models and Their Evaluation. AR4 WG1 Chapter 8. https://www.ipcc.ch/report/ar4/wg1/climate-models-and-their-evaluation/

10. Springer. (2021). Development and validation of the Climate Model Confidence Index (CMCI). https://link.springer.com/article/10.1007/s00704-021-03581-5

11. Carbon Brief. (2017). Analysis: How well have climate models projected global warming? https://www.carbonbrief.org/analysis-how-well-have-climate-models-projected-global-warming/

---

**Status:** RESEARCH COMPLETE
**Next Step:** Research-skeptic validation (Quality Gate 1)
**Implementation Ready:** Yes - data sources identified, methodology defined
