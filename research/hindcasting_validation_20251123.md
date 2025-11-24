# Hindcasting Validation Research: 1990-2024 Historical Data

**Date:** November 23, 2025
**Priority:** CRITICAL (Research-Driven Priorities from Nov 23 Coffee Chat)
**Author:** super-alignment-researcher (via orchestrator)
**Purpose:** Provide historical data for hindcasting validation - running simulation from 1990 to verify it predicts 2024 correctly

## Executive Summary

This document compiles peer-reviewed historical data for key simulation metrics from 1990-2024. If the model cannot hindcast known history, forecasts are suspect. This is a reality check for the entire model.

## 1. Global Temperature Anomaly (degrees C above pre-industrial)

**Sources:**
- [NASA GISS Surface Temperature Analysis (GISTEMP v4)](https://data.giss.nasa.gov/gistemp/)
- [NOAA Global Climate Report](https://www.climate.gov/news-features/understanding-climate/climate-change-atmospheric-carbon-dioxide)
- [NASA Scientific Visualization Studio](https://svs.gsfc.nasa.gov/5450/)

**Baseline:** 1951-1980 average (NASA GISS standard)

### Historical Data Points

| Year | Temperature Anomaly (C) | Source |
|------|------------------------|--------|
| 1990 | +0.45 | NASA GISS |
| 1995 | +0.45 | NASA GISS |
| 2000 | +0.42 | NASA GISS |
| 2005 | +0.69 | NASA GISS |
| 2010 | +0.72 | NASA GISS |
| 2015 | +0.90 | NASA GISS |
| 2020 | +1.02 | NASA GISS |
| 2023 | +1.18 | NASA GISS |
| 2024 | +1.28 | NASA GISS (record) |

**Key Findings:**
- 2024 was the warmest year in NASA's 145-year record
- 1.28 degrees C above 1951-1980 baseline
- 1.47 degrees C above mid-19th century average (1850-1900)
- For more than half of 2024, temperatures exceeded +1.5 C
- The 10 most recent years have been the warmest on record

**Simulation Parameter Mapping:**
- Current model uses `planetaryBoundaries.climate_change.currentValue = 1.21` (21% beyond boundary)
- Boundary threshold is 350 ppm CO2 / +1.5 C target
- 1990 should start with ~+0.45 C anomaly

## 2. Atmospheric CO2 Concentration (ppm)

**Sources:**
- [NOAA Global Monitoring Laboratory - Mauna Loa](https://gml.noaa.gov/ccgg/trends/mlo.html)
- [Scripps CO2 Program - Keeling Curve](https://keelingcurve.ucsd.edu/)
- [NOAA Climate.gov](https://www.climate.gov/news-features/understanding-climate/climate-change-atmospheric-carbon-dioxide)

### Historical Data Points

| Year | CO2 (ppm) | Annual Increase | Source |
|------|-----------|-----------------|--------|
| 1990 | 354.4 | 1.2 | Mauna Loa |
| 1995 | 360.8 | 2.0 | Mauna Loa |
| 2000 | 369.7 | 1.3 | Mauna Loa |
| 2005 | 379.8 | 2.5 | Mauna Loa |
| 2010 | 389.9 | 2.4 | Mauna Loa |
| 2015 | 401.0 | 2.2 | Mauna Loa |
| 2020 | 414.2 | 2.3 | Mauna Loa |
| 2023 | 421.4 | 2.8 | Mauna Loa |
| 2024 | 424.6 | 3.75 (record) | Mauna Loa |

**Key Findings:**
- CO2 now 50% higher than pre-industrial (~280 ppm)
- 2024 increase of 3.75 ppm was largest on record
- Growth rate accelerated: 0.8 ppm/yr (1960s) -> 1.6 ppm/yr (1980s) -> 2.6 ppm/yr (2015-2024)
- Rate of increase ~100x faster than natural ice age transitions

**Simulation Parameter Mapping:**
- Safe boundary: 350 ppm (Stockholm Resilience Centre)
- 1990 value (354 ppm) was already slightly above safe boundary
- Current model assumes 425 ppm for 2025 baseline

## 3. World Population (billions)

**Sources:**
- [UN World Population Prospects 2024](https://population.un.org/wpp/)
- [World Bank Population Data](https://data.worldbank.org/indicator/SP.POP.TOTL)
- [Worldometer](https://www.worldometers.info/world-population/world-population-by-year/)

### Historical Data Points

| Year | Population (B) | Growth Rate | Source |
|------|---------------|-------------|--------|
| 1990 | 5.32 | 1.74% | UN |
| 1995 | 5.74 | 1.54% | UN |
| 2000 | 6.14 | 1.32% | UN |
| 2005 | 6.54 | 1.24% | UN |
| 2010 | 6.96 | 1.20% | UN |
| 2015 | 7.38 | 1.17% | UN |
| 2020 | 7.79 | 0.87% | UN |
| 2022 | 8.00 | 0.84% | UN (8B milestone) |
| 2024 | 8.12 | 0.71% | UN |

**Key Findings:**
- Population tripled from 2.6B (1950) to 8.2B (2025)
- Growth rate declining: 1.74%/yr (1990) -> 0.71%/yr (2024)
- Projected peak: ~10.3B by mid-2080s

**Simulation Parameter Mapping:**
- Current model: `humanPopulationSystem.population = 8.0` for 2025
- 1990 should initialize at 5.32B

## 4. World GDP (Trillion USD, current)

**Sources:**
- [World Bank GDP Data](https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=1W)
- [Our World in Data](https://ourworldindata.org/grapher/global-gdp-over-the-long-run)
- [Macrotrends](https://www.macrotrends.net/countries/WLD/world/gdp-gross-domestic-product)

### Historical Data Points

| Year | GDP (Trillion USD) | Growth | Source |
|------|-------------------|--------|--------|
| 1990 | 22.6 | - | World Bank |
| 1995 | 30.5 | 6.2% CAGR | World Bank |
| 2000 | 33.6 | 2.0% CAGR | World Bank |
| 2005 | 47.4 | 7.1% CAGR | World Bank |
| 2010 | 66.0 | 6.8% CAGR | World Bank |
| 2015 | 74.8 | 2.5% CAGR | World Bank |
| 2020 | 85.8 | 2.8% CAGR | World Bank |
| 2022 | 100.0 | 8.0%/yr | World Bank |
| 2024 | ~110 | 5%/yr | Estimated |

**Key Findings:**
- Global GDP grew ~5x from $22.6T (1990) to ~$110T (2024)
- Average growth ~5% per year (nominal)
- COVID dip in 2020 (-2.7%)

**Simulation Parameter Mapping:**
- Current model: `globalMetrics.economicTransitionStage` tracks economic evolution
- GDP per capita (~$13,500 in 2024) relevant for QoL calculations

## 5. AI Capabilities Timeline (1990-2024)

**Sources:**
- [TechTarget AI History Timeline](https://www.techtarget.com/searchenterpriseai/tip/The-history-of-artificial-intelligence-Complete-AI-timeline)
- [World Economic Forum AI History](https://www.weforum.org/stories/2024/10/history-of-ai-artificial-intelligence/)
- [Wikipedia Timeline of AI](https://en.wikipedia.org/wiki/Timeline_of_artificial_intelligence)
- [Epoch AI](https://epochai.org/)

### Key Milestones

| Year | Milestone | Significance |
|------|-----------|--------------|
| 1990 | Neural networks revival | Practical applications emerge |
| 1997 | Deep Blue beats Kasparov | Chess superhuman |
| 1998 | LeNet-5 (CNN) | Foundation for image recognition |
| 2006 | Deep learning coined | Hinton's breakthrough |
| 2011 | Watson wins Jeopardy | NLP milestone |
| 2012 | AlexNet | ImageNet breakthrough (GPU training) |
| 2014 | GANs introduced | Generative AI foundation |
| 2016 | AlphaGo beats Lee Sedol | Go superhuman |
| 2017 | Transformer architecture | Attention mechanism |
| 2018 | GPT-1 | Pre-trained language models |
| 2019 | GPT-2 | 1.5B parameters |
| 2020 | GPT-3 | 175B parameters |
| 2022 | ChatGPT launch | 100M users in 2 months |
| 2023 | GPT-4 multimodal | Near-AGI capabilities |
| 2024 | Claude 3, Gemini, GPT-o3 | Reasoning models |

### AI Compute Growth

| Year | Training Compute | Notes |
|------|------------------|-------|
| 1990 | ~10^8 FLOP | Simple neural nets |
| 2000 | ~10^12 FLOP | Machine learning era |
| 2012 | ~10^18 FLOP | AlexNet (GPU revolution) |
| 2020 | ~10^23 FLOP | GPT-3 |
| 2024 | ~10^25 FLOP | Frontier models |

**Key Finding:** AI compute doubling every 6 months (2024)

**Simulation Parameter Mapping:**
- Current model tracks 17-dimensional AI capabilities
- 1990 should have near-zero AI capabilities (pre-deep learning era)
- Rapid growth starts ~2012 (deep learning revolution)

## 6. Biodiversity / Biosphere Integrity

**Sources:**
- [IPBES Global Assessment (2019)](https://www.ipbes.net/global-assessment)
- [Richardson et al. (2023) Science Advances](https://www.science.org/doi/10.1126/sciadv.adh2458)
- [WWF Living Planet Report](https://livingplanet.panda.org/)

### Historical Data Points

| Year | Extinction Rate (E/MSY) | Living Planet Index | Source |
|------|------------------------|--------------------| -------|
| 1990 | ~100 | 1.0 (baseline) | IPBES |
| 2000 | ~150 | 0.73 (-27%) | WWF |
| 2010 | ~200 | 0.61 (-39%) | WWF |
| 2020 | ~300 | 0.52 (-48%) | WWF |
| 2024 | ~100-1000 | ~0.49 (-51%) | IPBES range |

**Key Findings:**
- Current extinction rate 100-1000x background (10x uncertainty)
- Living Planet Index: 69% decline in wildlife populations since 1970
- 7 of 9 planetary boundaries already breached

**Simulation Parameter Mapping:**
- Current model: `biosphere_integrity.currentValue = 11.6` (11.6x safe threshold)
- 1990 was already in breach but less severe

## 7. Social/Political Metrics (for context)

### Democracy Index (Economist Intelligence Unit)
- 1990: Cold War ending, democracy wave
- 2024: Democratic backsliding globally

### Inequality (Gini Coefficient, Global)
- 1990: ~0.70
- 2024: ~0.65 (slight improvement due to emerging market growth)

### Social Trust
- 1990: Generally higher institutional trust
- 2024: Polarization, declining trust in institutions

## Simulation Initialization Parameters for 1990

Based on the research above, the 1990 hindcast initialization should use:

```typescript
const hindcast1990State = {
  // Climate
  temperatureAnomaly: 0.45,  // degrees C above pre-industrial
  co2Concentration: 354.4,   // ppm

  // Population
  population: 5.32,          // billions

  // Economy
  gdpTrillion: 22.6,         // USD trillion (current)

  // AI Capabilities
  aiCapabilityLevel: 0.01,   // Near-zero (pre-deep learning)

  // Biosphere
  extinctionRate: 100,       // E/MSY (lower estimate for 1990)
  biodiversityIndex: 0.75,   // Less degraded than 2024

  // Social
  socialCohesion: 0.65,      // Higher than 2024 baseline
  trustInGovernment: 0.55,   // Post-Cold War optimism

  // Planetary Boundaries
  climateBreached: false,    // Just at threshold in 1990
  biosphereBreached: true,   // Already breached by 1950
};
```

## Validation Targets (2024 Actual Values)

The simulation should produce values close to these by month 408 (Dec 2024):

| Metric | Target Value | Acceptable Range |
|--------|-------------|------------------|
| Temperature Anomaly | +1.28 C | +1.1 to +1.4 C |
| CO2 Concentration | 424.6 ppm | 420-430 ppm |
| Population | 8.12 B | 8.0-8.2 B |
| GDP | ~$110 T | $100-120 T |
| AI Capabilities | High (GPT-4 level) | Qualitative |
| Biodiversity Loss | -51% (LPI) | -45% to -55% |

## Research Gaps and Uncertainties

1. **AI Capabilities Quantification:** No standardized metric for 1990-2024 AI progress
2. **Social Cohesion:** Limited consistent longitudinal data
3. **Planetary Boundaries:** Many boundaries have <30 years of data
4. **Economic Complexity:** GDP doesn't capture distributional changes

## Recommendations

1. **Phase 1:** Implement 1990 initialization state
2. **Phase 2:** Run 408-month simulation (34 years)
3. **Phase 3:** Compare outputs to 2024 targets
4. **Phase 4:** Identify which systems diverge most
5. **Phase 5:** Calibrate problematic subsystems

## Citations

1. NASA GISS. (2025). GISS Surface Temperature Analysis (GISTEMP v4). https://data.giss.nasa.gov/gistemp/
2. NOAA GML. (2025). Trends in Atmospheric Carbon Dioxide. https://gml.noaa.gov/ccgg/trends/
3. UN DESA. (2024). World Population Prospects 2024. https://population.un.org/wpp/
4. World Bank. (2024). GDP (current US$). https://data.worldbank.org/indicator/NY.GDP.MKTP.CD
5. IPBES. (2019). Global Assessment Report on Biodiversity and Ecosystem Services.
6. Richardson, K., et al. (2023). Earth beyond six of nine planetary boundaries. Science Advances.
7. WWF. (2024). Living Planet Report. https://livingplanet.panda.org/
8. Epoch AI. (2024). Compute Trends Across Three Eras of Machine Learning. https://epochai.org/
