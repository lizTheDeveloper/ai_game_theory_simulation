# Historical Observational Data (1950-2024)

This directory contains historical observational datasets for hindcast validation of the simulation model. All data is from authoritative sources (NASA, NOAA, UN, World Bank, academic institutions).

## Purpose

Enable rigorous validation of simulation outputs against real-world historical trends (1950-2024). The simulation should be able to reproduce observed warming, sea level rise, economic growth, and population dynamics when initialized with 1950 starting conditions.

## Datasets

### 1. Temperature: `temperature_nasa_giss_1950_2024.ts`

**Source:** NASA GISS Surface Temperature Analysis (GISTEMP v4)
**URL:** https://data.giss.nasa.gov/gistemp/
**GitHub Mirror:** https://github.com/datasets/global-temp

**Description:**
- Global surface temperature anomalies (land + ocean)
- Baseline: 1951-1980 mean temperature
- Resolution: Annual
- Coverage: 1950-2024 (75 years)
- Units: Degrees Celsius (°C) above/below baseline

**Methodology:**
- Combines NOAA GHCN v4 (meteorological stations) and ERSST v5 (ocean areas)
- Updated monthly through most recent complete month
- Anomalies calculated as deviations from 1951-1980 climatological mean

**Key Observations:**
- 1950: -0.17°C (cooler than baseline)
- 2024: 1.28°C (warmest year on record)
- Total warming 1950-2024: +1.45°C
- Warming above pre-industrial (1850-1900): ~1.47°C in 2024

**Citation:**
```
GISTEMP Team (2025). GISS Surface Temperature Analysis (GISTEMP), version 4.
NASA Goddard Institute for Space Studies. Dataset accessed December 2025.
https://data.giss.nasa.gov/gistemp/

Lenssen, N. J., et al. (2019). Improvements in the GISTEMP uncertainty model.
Journal of Geophysical Research: Atmospheres, 124(12), 6307-6326.
https://doi.org/10.1029/2019JD030481
```

---

### 2. CO2 Concentration: `co2_keeling_curve_1950_2024.ts`

**Sources:**
- **1950-1957:** Law Dome ice core data (CSIRO/Australian Antarctic Division)
- **1958-2024:** NOAA Mauna Loa Observatory (Keeling Curve)

**URLs:**
- Ice core: https://cdiac.ess-dive.lbl.gov/trends/co2/lawdome.html
- Mauna Loa: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt

**Description:**
- Atmospheric CO2 concentration
- Resolution: Annual mean
- Coverage: 1950-2024 (75 years)
- Units: Parts per million (ppm)

**Methodology:**
- **Ice core:** Air bubbles trapped in Antarctic ice (uncertainty ±1.2 ppm)
- **Mauna Loa:** Direct atmospheric sampling at 3,397m altitude (Mauna Loa Observatory, Hawaii)
- Ice core and direct measurements agree closely during 1958+ overlap period

**Key Observations:**
- 1950: ~310.5 ppm (ice core estimate, stabilized 1940-1955)
- 1958: 315.39 ppm (first Keeling Curve measurement)
- 2024: 424.61 ppm (latest measurement)
- Total increase: 114.11 ppm over 74 years (~1.54 ppm/year average)

**Citation:**
```
Etheridge, D. M., et al. (1996). Natural and anthropogenic changes in atmospheric
CO2 over the last 1000 years from air in Antarctic ice and firn. Journal of
Geophysical Research, 101(D2), 4115-4128. https://doi.org/10.1029/95JD03410

Keeling, C. D., et al. (2001). Exchanges of atmospheric CO2 and 13CO2 with the
terrestrial biosphere and oceans from 1978 to 2000. I. Global aspects.
SIO Reference Series, No. 01-06, Scripps Institution of Oceanography.

NOAA Global Monitoring Laboratory (2025). Trends in Atmospheric Carbon Dioxide.
Dataset accessed December 2025. https://gml.noaa.gov/ccgg/trends/
```

---

### 3. Sea Level: `sea_level_noaa_1950_2024.ts`

**Sources:**
- **1950-2013:** CSIRO Reconstructed Global Mean Sea Level (Church & White 2011, updated 2015)
- **2014-2024:** NOAA Laboratory for Satellite Altimetry

**URLs:**
- CSIRO: https://github.com/datasets/sea-level-rise/blob/master/archive/church_white_gmsl_2011_up/CSIRO_Recons_gmsl_yr_2015.txt
- NOAA: https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/LSA_SLR_timeseries.php

**Description:**
- Global mean sea level change
- Baseline: 1990.5 = 0.0 mm
- Resolution: Annual
- Coverage: 1950-2024 (75 years)
- Units: Millimeters above 1990.5 baseline

**Methodology:**
- **1950-2013:** Tide gauge data reconstructed using Church & White (2011) methodology
- **1993-2024:** Satellite radar altimetry (TOPEX/Poseidon, Jason-1/2/3 series)
- Overlap period (1993-2013) shows good agreement between methods

**Key Observations:**
- 1950: -67.3 mm (67.3 mm below 1990 baseline)
- 1990: 0.0 mm (baseline year)
- 2024: ~105.8 mm above baseline
- Total rise 1950-2024: 173.1 mm (17.3 cm)
- Average rate 1950-2024: 2.34 mm/year
- Accelerating: Recent rate (2013-2022) is 4.62 mm/year

**Citation:**
```
Church, J. A., & White, N. J. (2011). Sea-level rise from the late 19th to the
early 21st century. Surveys in Geophysics, 32(4-5), 585-602.
https://doi.org/10.1007/s10712-011-9119-1

NOAA Laboratory for Satellite Altimetry (2025). Sea Level Rise Data.
NOAA/NESDIS/STAR. Dataset accessed December 2025.
https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/
```

---

### 4. Population: `population_un_wpp_1950_2024.ts`

**Source:** United Nations World Population Prospects 2024 Revision

**URL:** https://population.un.org/wpp/

**Description:**
- Total world population
- Resolution: Annual (mid-year estimates)
- Coverage: 1950-2024 (75 years)
- Units: Billions of people

**Methodology:**
- Historical estimates for 237 countries/areas from 1950 to present
- Based on demographic data (censuses, vital statistics, surveys)
- Includes all countries and territories

**Key Observations:**
- 1950: 2.536 billion (baseline)
- 1974: 4 billion (doubled in 24 years)
- 1987: 5 billion
- 1999: 6 billion
- 2011: 7 billion
- 2022: 8 billion (exceeded in mid-November)
- 2024: 8.123 billion
- Total growth: 3.2x over 74 years
- Peak growth rate: 2.1%/year (1965-1970)
- Current growth rate: 1.1%/year (2015-2020)

**Citation:**
```
United Nations, Department of Economic and Social Affairs, Population Division (2024).
World Population Prospects 2024, Online Edition.
https://population.un.org/wpp/

United Nations (2024). World Population Prospects 2024: Summary of Results.
UN DESA/POP/2024/TR/NO. 8.
```

---

### 5. GDP: `gdp_world_bank_1950_2024.ts`

**Sources:**
- **1950-1989:** Maddison Project Database 2023
- **1990-2024:** World Bank World Development Indicators

**URLs:**
- Maddison: https://www.rug.nl/ggdc/historicaldevelopment/maddison/
- World Bank: https://data.worldbank.org/indicator/NY.GDP.MKTP.PP.CD

**Description:**
- World total GDP (Gross Domestic Product)
- Constant 2021 international dollars (PPP-adjusted)
- Resolution: Annual
- Coverage: 1950-2024 (75 years)
- Units: Trillions of international dollars

**Methodology:**
- **PPP (Purchasing Power Parity):** Adjusts for price level differences across countries
- **Maddison Project:** Historical GDP estimates using consistent methodology across centuries
- **World Bank:** National accounts data aggregated globally
- Data converted to constant 2021 international dollars for comparability

**Key Observations:**
- 1950: $10.2 trillion (post-WWII baseline)
- 1973: $29.9 trillion (end of "Golden Age of Growth")
- 2008: $100.2 trillion (Global Financial Crisis)
- 2020: $145.3 trillion (COVID-19 pandemic recession)
- 2024: $170.5 trillion (estimated)
- Total growth: 16.7x over 74 years
- Average growth rate: ~3.9%/year

**Citation:**
```
Bolt, J., & van Zanden, J. L. (2025). Maddison-style estimates of the evolution
of the world economy: A new 2023 update. Journal of Economic Surveys, 39(1), 5-45.
https://doi.org/10.1111/joes.12618

World Bank (2025). World Development Indicators: GDP, PPP (constant 2021 international $).
Dataset accessed December 2025.
https://data.worldbank.org/indicator/NY.GDP.MKTP.PP.KD

Maddison, A. (2007). Contours of the World Economy, 1–2030 AD: Essays in
Macro-Economic History. Oxford University Press.
```

---

## Usage in Hindcast Validation

These datasets enable quantitative validation of simulation outputs:

### Example Validation Workflow

```typescript
import { ANNUAL_TEMPERATURE_1950_2024 } from '@/data/historical/temperature_nasa_giss_1950_2024';
import { ANNUAL_CO2_1950_2024 } from '@/data/historical/co2_keeling_curve_1950_2024';
import { runSimulation } from '@/simulation/engine/runSimulation';

// Initialize simulation with 1950 conditions
const initialState = {
  currentMonth: 0,
  currentYear: 1950,
  climate: {
    globalTemperatureAnomaly: -0.17, // From observational data
    co2Concentration: 310.5,         // From observational data
  },
  // ... other 1950 initial conditions
};

// Run simulation from 1950 to 2024
const results = runSimulation(initialState, { years: 74, seed: 42 });

// Compare simulation outputs to observations
const validation = {
  temperature: {
    simulated: results.climate.globalTemperatureAnomaly,
    observed: ANNUAL_TEMPERATURE_1950_2024[74].tempAnomaly, // 2024
    error: Math.abs(results.climate.globalTemperatureAnomaly - 1.28),
  },
  co2: {
    simulated: results.climate.co2Concentration,
    observed: ANNUAL_CO2_1950_2024[74].co2Concentration, // 2024
    error: Math.abs(results.climate.co2Concentration - 424.61),
  },
};

// Acceptable error thresholds for research simulation:
// - Temperature: ±0.2°C (within uncertainty bounds)
// - CO2: ±10 ppm (within natural variability)
// - Sea level: ±20 mm (within measurement uncertainty)
// - Population: ±200 million (within demographic uncertainty)
// - GDP: ±10% (within economic uncertainty)
```

### Validation Criteria

**PASS:** Simulation reproduces observed trends within uncertainty bounds
**FAIL:** Systematic bias or divergence exceeding 2σ uncertainty

**Critical metrics:**
1. **Temperature trajectory:** Must show acceleration post-1980
2. **CO2 growth:** Must show exponential increase, not linear
3. **Sea level acceleration:** Must show recent acceleration (post-2000)
4. **Population S-curve:** Must capture demographic transition (growth rate decline)
5. **GDP recessions:** Must capture 2008-2009 and 2020 economic shocks

---

## Data Quality & Limitations

### Temperature (GISTEMP)
- **Uncertainty:** ±0.05°C (1950s), ±0.02°C (2020s)
- **Spatial coverage:** Improves over time (sparse in 1950s, comprehensive today)
- **Ocean data:** Lower resolution before satellite era (pre-1980)

### CO2 (Law Dome + Mauna Loa)
- **Ice core uncertainty:** ±1.2 ppm (1950-1957)
- **Mauna Loa precision:** 0.2 ppm (1958+)
- **Ice core age smoothing:** ~10-year smoothing in older ice

### Sea Level (CSIRO + NOAA)
- **Tide gauge era (1950-1992):** Uncertainty ±5-10 mm
- **Satellite era (1993+):** Uncertainty ±2-3 mm
- **Regional variability:** Global mean masks large regional differences

### Population (UN WPP)
- **Historical estimates:** ±1-2% uncertainty (1950s)
- **Recent data:** ±0.5% uncertainty (2020s)
- **Census quality:** Varies by country and era

### GDP (Maddison + World Bank)
- **Historical uncertainty:** ±10-20% (1950s)
- **Recent data:** ±5% (2020s)
- **PPP conversions:** Substantial uncertainty in cross-country comparisons
- **Informal economy:** Underestimated in some regions

---

## License & Attribution

All datasets are from public domain or open access sources:

- **NASA GISS:** Public domain (U.S. government work)
- **NOAA:** Public domain (U.S. government work)
- **UN Population Division:** Open access under UN terms of use
- **World Bank:** Open data under CC BY 4.0 license
- **Maddison Project:** Open access for research and education

**Please cite original sources when using this data.**

---

## Updates & Maintenance

These datasets should be updated annually:

- **Temperature:** Updated by NASA GISS ~10th of each month
- **CO2:** Updated by NOAA monthly
- **Sea Level:** Updated by NOAA quarterly
- **Population:** Updated by UN biennially
- **GDP:** Updated by World Bank quarterly/annually

**Last comprehensive update:** December 2025

---

## Contact & Issues

For questions about these datasets or to report data quality issues:

1. Check original source documentation (URLs above)
2. Verify data integrity using validation metrics in each .ts file
3. Report discrepancies via GitHub issues

**Validation checksums:**
- Temperature: 1950=-0.17°C, 2024=1.28°C (total warming: 1.45°C)
- CO2: 1950=310.5ppm, 2024=424.61ppm (total increase: 114.11ppm)
- Sea level: 1950=-67.3mm, 2024=105.8mm (total rise: 173.1mm)
- Population: 1950=2.536B, 2024=8.123B (total growth: 3.2x)
- GDP: 1950=$10.2T, 2024=$170.5T (total growth: 16.7x)
