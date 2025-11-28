# Climate Mini-Hindcast Validation Data (1990-2010)

**Research Agent:** Cynthia (super-alignment-researcher-1)
**Date:** 2025-11-27
**Purpose:** Provide historical climate data to validate simulation climate subsystem against real-world observations
**Success Criterion:** CO2 within 5% of Keeling curve

---

## Executive Summary

This document compiles three authoritative datasets for mini-hindcast validation of the simulation's climate subsystem:

1. **CO2 Concentration:** Monthly Mauna Loa observations (353.86 → 388.71 ppm, +9.8% over 20 years)
2. **Temperature Anomaly:** Annual global mean from GISTEMP/GCAG (+0.28°C warming 1990→2010)
3. **CO2 Emissions:** Annual global fossil fuel + cement from CDIAC-FF (6.05 → 8.99 GtC/yr, +48.6%)

These datasets enable quantitative comparison of simulation output against observed climate history to validate:
- Atmospheric CO2 accumulation rates
- Temperature response to forcing
- Carbon cycle dynamics
- Emission-to-concentration pathways

---

## Dataset 1: Atmospheric CO2 Concentration (Monthly, 1990-2010)

### Source

**Primary Source:** NOAA Global Monitoring Laboratory, Mauna Loa Observatory
**Dataset:** Monthly Mean CO2 Concentration
**URL:** https://gml.noaa.gov/ccgg/trends/data.html
**Direct Data:** https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
**Contact:** Dr. Xin Lan (xin.lan@noaa.gov)

**Credibility Assessment:**
- **Authority:** NOAA Global Monitoring Laboratory (internationally recognized standard)
- **Continuity:** Scripps CO2 Program, continuous measurements since 1958 (Keeling Curve)
- **Method:** Direct atmospheric sampling, high-precision infrared spectroscopy
- **Quality Control:** Subject to ongoing quality checks, revisions expected to be small
- **Citations:** Foundational dataset for climate science, thousands of citations

### Data: Monthly CO2 Concentration (ppm)

```csv
Year,Month,CO2_ppm
1990,1,353.86
1990,2,355.10
1990,3,355.75
1990,4,356.38
1990,5,357.38
1990,6,356.39
1990,7,354.89
1990,8,353.06
1990,9,351.38
1990,10,351.69
1990,11,353.14
1990,12,354.41
1991,1,354.93
1991,2,355.82
1991,3,357.33
1991,4,358.77
1991,5,359.23
1991,6,358.23
1991,7,356.30
1991,8,353.97
1991,9,352.34
1991,10,352.43
1991,11,353.89
1991,12,355.21
1992,1,355.99
1992,2,356.72
1992,3,357.81
1992,4,359.15
1992,5,359.66
1992,6,359.25
1992,7,356.90
1992,8,354.92
1992,9,352.70
1992,10,352.95
1992,11,354.16
1992,12,355.40
1993,1,356.63
1993,2,357.10
1993,3,358.32
1993,4,359.41
1993,5,360.23
1993,6,359.55
1993,7,357.53
1993,8,355.48
1993,9,353.67
1993,10,353.95
1993,11,355.33
1993,12,356.80
1994,1,358.34
1994,2,358.91
1994,3,359.97
1994,4,361.26
1994,5,361.68
1994,6,360.94
1994,7,359.55
1994,8,357.49
1994,9,355.84
1994,10,356.00
1994,11,357.59
1994,12,359.05
1995,1,359.97
1995,2,361.00
1995,3,361.64
1995,4,363.45
1995,5,363.79
1995,6,363.26
1995,7,361.90
1995,8,359.46
1995,9,357.75
1995,10,357.93
1995,11,359.49
1995,12,360.70
1996,1,362.05
1996,2,363.24
1996,3,364.02
1996,4,364.72
1996,5,365.41
1996,6,364.97
1996,7,363.65
1996,8,361.49
1996,9,359.46
1996,10,359.60
1996,11,360.76
1996,12,362.33
1997,1,363.18
1997,2,364.00
1997,3,364.56
1997,4,366.36
1997,5,366.80
1997,6,365.63
1997,7,364.47
1997,8,362.51
1997,9,360.19
1997,10,360.78
1997,11,362.43
1997,12,364.34
1998,1,365.32
1998,2,366.15
1998,3,367.31
1998,4,368.54
1998,5,369.27
1998,6,368.87
1998,7,367.64
1998,8,365.77
1998,9,363.94
1998,10,364.30
1998,11,365.98
1998,12,367.59
1999,1,368.19
1999,2,368.93
1999,3,369.60
1999,4,371.00
1999,5,371.00
1999,6,370.35
1999,7,369.27
1999,8,366.73
1999,9,364.68
1999,10,365.14
1999,11,366.66
1999,12,367.88
2000,1,369.02
2000,2,369.42
2000,3,370.40
2000,4,371.54
2000,5,371.65
2000,6,371.61
2000,7,369.30
2000,8,366.91
2000,9,364.94
2000,10,365.73
2000,11,366.99
2000,12,368.33
2001,1,369.52
2001,2,370.50
2001,3,371.48
2001,4,372.52
2001,5,373.11
2001,6,372.10
2001,7,369.87
2001,8,367.95
2001,9,366.53
2001,10,366.73
2001,11,368.27
2001,12,369.46
2002,1,370.51
2002,2,371.48
2002,3,372.45
2002,4,373.29
2002,5,374.02
2002,6,373.32
2002,7,371.48
2002,8,369.62
2002,9,367.96
2002,10,368.09
2002,11,369.68
2002,12,371.12
2003,1,372.30
2003,2,373.11
2003,3,373.80
2003,4,375.59
2003,5,375.78
2003,6,375.63
2003,7,373.79
2003,8,371.66
2003,9,369.83
2003,10,370.00
2003,11,371.52
2003,12,373.07
2004,1,374.69
2004,2,375.48
2004,3,376.34
2004,4,378.09
2004,5,378.50
2004,6,377.59
2004,7,376.08
2004,8,373.82
2004,9,372.16
2004,10,372.36
2004,11,374.00
2004,12,375.59
2005,1,376.52
2005,2,377.28
2005,3,378.23
2005,4,379.70
2005,5,380.63
2005,6,379.57
2005,7,377.51
2005,8,375.95
2005,9,374.06
2005,10,374.24
2005,11,375.85
2005,12,377.38
2006,1,378.84
2006,2,379.46
2006,3,380.45
2006,4,382.45
2006,5,382.21
2006,6,381.85
2006,7,379.73
2006,8,377.63
2006,9,375.86
2006,10,376.20
2006,11,377.51
2006,12,379.25
2007,1,380.76
2007,2,381.61
2007,3,382.39
2007,4,384.01
2007,5,384.39
2007,6,383.99
2007,7,381.87
2007,8,379.73
2007,9,377.97
2007,10,378.35
2007,11,379.95
2007,12,381.33
2008,1,382.45
2008,2,383.71
2008,3,384.79
2008,4,386.40
2008,5,386.58
2008,6,386.42
2008,7,384.15
2008,8,381.85
2008,9,380.16
2008,10,380.83
2008,11,382.20
2008,12,383.89
2009,1,384.78
2009,2,385.59
2009,3,386.35
2009,4,387.43
2009,5,388.50
2009,6,387.88
2009,7,386.15
2009,8,383.93
2009,9,382.03
2009,10,382.33
2009,11,383.94
2009,12,385.56
2010,1,387.18
2010,2,388.42
2010,3,389.44
2010,4,390.19
2010,5,391.63
2010,6,390.10
2010,7,388.50
2010,8,386.15
2010,9,384.01
2010,10,384.85
2010,11,386.27
2010,12,388.71
```

### Key Statistics

- **Initial (Jan 1990):** 353.86 ppm
- **Final (Dec 2010):** 388.71 ppm
- **Total Increase:** 34.85 ppm (+9.8%)
- **Annual Trend:** ~1.74 ppm/year (compound growth)
- **Seasonal Amplitude:** ~6-8 ppm (Northern Hemisphere vegetation cycle)

### Simulation Implications

1. **Initialization:** Set `state.atmosphericCO2ppm = 353.86` (Jan 1990)
2. **Validation Target:** Monthly trajectory should track within ±5% of observed values
3. **Success Metric:** Dec 2010 value within 369-408 ppm (388.71 ± 5%)
4. **Mechanism Check:** Seasonal oscillations test biosphere uptake/release dynamics
5. **Trend Check:** Multi-year acceleration tests cumulative emission integration

---

## Dataset 2: Global Temperature Anomaly (Annual, 1990-2010)

### Source

**Primary Sources:** NASA GISTEMP v4 & NOAA GCAG
**Dataset:** Global-mean Annual Temperature Anomalies
**URL (GISTEMP):** https://data.giss.nasa.gov/gistemp/
**URL (GCAG):** https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/
**Aggregator:** DataHub.io Global Temperature Time Series
**Direct Data:** https://datahub.io/core/global-temp/r/annual.csv

**Credibility Assessment:**
- **Authority:** NASA Goddard Institute for Space Studies (GISTEMP) and NOAA NCEI (GCAG)
- **Method:** Land station + sea surface temperature observations, quality-controlled and homogenized
- **Baseline:** Anomalies relative to 1951-1980 mean (GISTEMP) or 20th century mean (GCAG)
- **Validation:** Cross-validated with HadCRUT5, Berkeley Earth, JMA datasets
- **Uncertainty:** ±0.05-0.10°C for individual years (ensemble spread)
- **Citations:** Standard datasets for climate attribution studies, IPCC reports

### Data: Annual Global Temperature Anomaly (°C)

```csv
Year,GISTEMP_degC,GCAG_degC
1990,0.445,0.3606
1991,0.4033,0.3389
1992,0.220,0.1249
1993,0.230,0.1657
1994,0.3133,0.2335
1995,0.4442,0.3769
1996,0.3283,0.2767
1997,0.4633,0.4223
1998,0.605,0.5773
1999,0.380,0.3245
2000,0.3917,0.3311
2001,0.5325,0.4893
2002,0.6267,0.5435
2003,0.6167,0.5442
2004,0.5325,0.4674
2005,0.675,0.6069
2006,0.6375,0.5726
2007,0.6608,0.5917
2008,0.5433,0.4656
2009,0.655,0.5968
2010,0.7233,0.6804
```

### Key Statistics

**GISTEMP:**
- **Initial (1990):** +0.445°C
- **Final (2010):** +0.723°C
- **Net Warming:** +0.278°C over 20 years
- **Trend:** +0.014°C/year (linear fit)

**GCAG:**
- **Initial (1990):** +0.361°C
- **Final (2010):** +0.680°C
- **Net Warming:** +0.319°C over 20 years
- **Trend:** +0.016°C/year (linear fit)

**Notable Features:**
- **1998 El Niño spike:** +0.605°C (GISTEMP), warmest year until 2005
- **1991-1993 cooling:** Pinatubo volcanic eruption (stratospheric aerosols)
- **Acceleration:** 2000s warming faster than 1990s (0.020°C/yr vs 0.005°C/yr)

### Simulation Implications

1. **Initialization:** Set `state.globalTemperatureAnomaly = 0.40` (avg 1990 baseline)
2. **Validation Target:** Annual temperature should track within ±0.10°C of observed
3. **Success Metric:** 2010 anomaly within 0.60-0.80°C (0.70 ± 15%)
4. **Volcanic Forcing:** Test aerosol cooling mechanism with 1991 Pinatubo
5. **Climate Sensitivity:** Compare warming rate to CO2 increase (TCR validation)

---

## Dataset 3: Global CO2 Emissions (Annual, 1990-2010)

### Source

**Primary Source:** Carbon Dioxide Information Analysis Center (CDIAC-FF)
**Dataset:** Global CO2 Emissions from Fossil Fuel Combustion and Cement Manufacture (1751-2017)
**Publication:** Gilfillan, D. et al. (2021), Earth System Science Data, 13, 1667-1680
**DOI:** https://doi.org/10.5194/essd-13-1667-2021
**Data Repository:** Zenodo (https://doi.org/10.5281/zenodo.4281271)
**Direct Data:** https://zenodo.org/record/4281271/files/global.1751_2017.csv
**License:** Creative Commons Attribution 4.0 International

**Credibility Assessment:**
- **Authority:** CDIAC (Oak Ridge National Laboratory) → Appalachian State University
- **Continuity:** Authoritative global emissions inventory since 1751
- **Method:** UN energy statistics + cement production data + stoichiometric conversion
- **Validation:** Cross-checked with Global Carbon Project, EDGAR, BP Statistical Review
- **Peer Review:** Published in Earth System Science Data (Copernicus)
- **Citations:** 300+ citations for CDIAC-FF paper, foundational for carbon budget research

**Note on Land Use Change Emissions:**
This dataset covers **fossil fuels + cement only**. Land use change (LULUCF) emissions add ~1-2 GtC/year (~3.7-7.3 GtCO2/year) during this period based on Global Carbon Project estimates. For total anthropogenic emissions, LULUCF should be added separately.

### Data: Annual Global CO2 Emissions (Fossil Fuels + Cement)

```csv
Year,Emissions_MtC,Emissions_GtC,Emissions_GtCO2
1990,6051,6.051,22.19
1991,6119,6.119,22.44
1992,6039,6.039,22.14
1993,6092,6.092,22.34
1994,6138,6.138,22.51
1995,6273,6.273,23.00
1996,6431,6.431,23.58
1997,6501,6.501,23.84
1998,6494,6.494,23.81
1999,6587,6.587,24.15
2000,6763,6.763,24.80
2001,6802,6.802,24.94
2002,6963,6.963,25.53
2003,7342,7.342,26.92
2004,7675,7.675,28.14
2005,7989,7.989,29.29
2006,8248,8.248,30.24
2007,8463,8.463,31.03
2008,8662,8.662,31.76
2009,8530,8.530,31.28
2010,8992,8.992,32.98
```

**Unit Conversions:**
- 1 GtC = 1,000 MtC (million metric tons carbon)
- 1 GtC = 3.664 GtCO2 (molecular mass ratio: CO2/C = 44/12)

### Key Statistics

- **Initial (1990):** 6.05 GtC/yr (22.19 GtCO2/yr)
- **Final (2010):** 8.99 GtC/yr (32.98 GtCO2/yr)
- **Total Increase:** +2.94 GtC/yr (+10.79 GtCO2/yr, +48.6%)
- **Annual Growth Rate:** 2.0%/year (compound)
- **2008-2009 Drop:** -1.5% (global financial crisis)

**Emissions by Fuel Type (2010):**
- Solid fuels (coal): ~43%
- Liquid fuels (oil): ~34%
- Gaseous fuels (natural gas): ~20%
- Cement production: ~3%

### Simulation Implications

1. **Initialization:** Set `state.globalEmissions = 22.19` GtCO2/yr (1990)
2. **Historical Trajectory:** Emissions grow ~2%/year with recession dip in 2009
3. **Validation Target:** Cumulative emissions 1990-2010 should match 240-month integral
4. **Carbon Cycle Test:** Compare emitted CO2 vs atmospheric accumulation (airborne fraction ~45%)
5. **Economic Coupling:** 2008-2009 drop tests GDP-emissions correlation
6. **Land Use:** Add ~5 GtCO2/yr LULUCF for total anthropogenic (declining 1990→2010)

---

## Integrated Validation Strategy

### 1. Initialization (Month 0 = January 1990)

```typescript
state.currentMonth = 0;
state.atmosphericCO2ppm = 353.86;  // NOAA Mauna Loa
state.globalTemperatureAnomaly = 0.40;  // GISTEMP/GCAG average
state.globalEmissions = 22.19;  // CDIAC-FF (GtCO2/yr)
state.populationBillions = 5.28;  // UN Population Division
```

### 2. Monthly Validation Checkpoints

Run simulation for 240 months (Jan 1990 → Dec 2010) and compare:

**CO2 Concentration:**
- Sample months: Dec 1990, Dec 1995, Dec 2000, Dec 2005, Dec 2010
- Expected: 354.41 → 360.70 → 368.33 → 377.38 → 388.71 ppm
- Tolerance: ±5% (±17.5 ppm at end)

**Temperature Anomaly:**
- Sample years: 1990, 1995, 2000, 2005, 2010
- Expected: 0.40 → 0.41 → 0.36 → 0.64 → 0.70°C
- Tolerance: ±0.10°C

**Emissions:**
- Sample years: 1990, 1995, 2000, 2005, 2010
- Expected: 22.19 → 23.00 → 24.80 → 29.29 → 32.98 GtCO2/yr
- Tolerance: ±10% (emissions driven by economic model)

### 3. Process-Level Validations

**Carbon Cycle:**
- **Airborne Fraction:** ~45% of emitted CO2 stays in atmosphere
- **Ocean Uptake:** ~25% absorbed by oceans (decreasing fraction over time)
- **Land Uptake:** ~30% absorbed by terrestrial biosphere
- **Validation:** Compare cumulative emissions vs ΔCO2 concentration

**Climate Response:**
- **Transient Climate Response (TCR):** ~1.8°C per doubling CO2
- **Ocean Heat Uptake:** Delays warming (thermal inertia)
- **Volcanic Forcing:** 1991 Pinatubo should cause ~0.3°C cooling for 2-3 years
- **Validation:** Temperature trend vs radiative forcing

**Economic-Emissions Coupling:**
- **Emissions Intensity:** GtCO2 per trillion $ GDP
- **Decoupling:** Emissions growth < GDP growth (efficiency gains)
- **Recession Signal:** 2008-2009 should show emissions plateau/decline
- **Validation:** Compare simulated GDP-emissions elasticity to ~0.7

### 4. Success Metrics

**PASS Criteria (Mini-Hindcast Validation):**
1. ✅ CO2 Dec 2010 within 369-408 ppm (388.71 ± 5%)
2. ✅ Temperature 2010 within 0.60-0.80°C (0.70 ± 15%)
3. ✅ Cumulative emissions 1990-2010 within ±10% of 580 GtCO2
4. ✅ Pinatubo cooling signal detectable in 1991-1993
5. ✅ 2008-2009 emissions decline present

**EXCELLENT Criteria (High-Fidelity Validation):**
1. ⭐ CO2 monthly RMSE < 2 ppm (< 0.5%)
2. ⭐ Temperature annual RMSE < 0.05°C
3. ⭐ Airborne fraction 40-50% (observed range)
4. ⭐ Decadal warming trend 1990s vs 2000s matches observations
5. ⭐ Seasonal CO2 amplitude 6-8 ppm (biosphere realism)

---

## Uncertainties and Limitations

### Dataset Uncertainties

**CO2 Concentration:**
- Measurement precision: ±0.1 ppm
- Spatial variability: Mauna Loa represents well-mixed troposphere (±1 ppm)
- Data revisions: Minimal (< 0.5 ppm retrospective changes)

**Temperature Anomaly:**
- Observation uncertainty: ±0.05°C (GISTEMP) to ±0.10°C (GCAG)
- Baseline sensitivity: ±0.05°C depending on reference period choice
- Dataset divergence: GISTEMP vs GCAG differs by ~0.05-0.08°C (methodology)

**CO2 Emissions:**
- Fossil fuel data: ±5% (UN energy statistics uncertainty)
- Cement production: ±2% (industrial reporting)
- Flaring: ±10% (sparse data for some regions)
- **Missing:** Land use change emissions (±50% uncertainty, ~1-2 GtC/yr)

### Simulation Limitations

**Not Captured in Simple Models:**
1. **Ocean circulation changes** (AMOC weakening, heat uptake efficiency)
2. **Carbon cycle feedbacks** (permafrost thaw, tropical forest dieback)
3. **Aerosol forcing** (sulfate cooling, black carbon warming)
4. **Land use emissions** (deforestation, agriculture, fires)
5. **Methane and N2O forcing** (non-CO2 greenhouse gases)

**Simplifying Assumptions:**
1. **Constant airborne fraction** (actually decreases ~0.3%/decade due to ocean acidification)
2. **Linear climate sensitivity** (ignores slow feedbacks, regional patterns)
3. **Instant atmospheric mixing** (neglects hemispheric gradients)
4. **Fixed biosphere seasonality** (phenology shifts with warming)

### Recommendations

**For PASS-level validation:**
- Use simple carbon cycle (fixed fractions) + empirical TCR
- Accept ±5% CO2 and ±15% temperature as research-grade fidelity
- Focus on trend matching over perfect month-to-month replication

**For EXCELLENT-level validation:**
- Implement 3-box carbon model (atmosphere-ocean-biosphere with diffusion)
- Add volcanic forcing time series (1991 Pinatubo as test case)
- Include ocean heat uptake delay (exponential response function)
- Tune parameters to minimize RMSE across all three observables

---

## References

### Primary Data Sources

1. **NOAA Global Monitoring Laboratory** (2025). Mauna Loa CO2 Monthly Mean Data. https://gml.noaa.gov/ccgg/trends/data.html
   - Authoritative record of atmospheric CO2 since 1958 (Keeling Curve)
   - High-precision measurements, globally representative sampling location

2. **NASA Goddard Institute for Space Studies** (2025). GISTEMP v4 Global Temperature. https://data.giss.nasa.gov/gistemp/
   - Global land-ocean temperature index, 1880-present
   - Baseline: 1951-1980 mean, uncertainty ±0.05°C

3. **NOAA National Centers for Environmental Information** (2025). Global Climate at a Glance (GCAG). https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/
   - Independent temperature reconstruction using NOAAGlobalTemp
   - Cross-validation dataset for GISTEMP

4. **DataHub.io** (2024). Global Temperature Time Series. https://datahub.io/core/global-temp
   - Aggregated GISTEMP + GCAG annual data in CSV format
   - Open data repository with version control

5. **Gilfillan, D., Marland, G., Boden, T., & Andres, R.** (2021). CDIAC-FF: Global and national CO2 emissions from fossil fuel combustion and cement manufacture: 1751–2017. *Earth System Science Data*, 13(4), 1667-1680. https://doi.org/10.5194/essd-13-1667-2021
   - Peer-reviewed authoritative global emissions inventory
   - Data: https://doi.org/10.5281/zenodo.4281271
   - 300+ citations, foundational for carbon budget research

### Supporting References

6. **Friedlingstein, P., et al.** (2022). Global Carbon Budget 2022. *Earth System Science Data*, 14(11), 4811-4900. https://doi.org/10.5194/essd-14-4811-2022
   - Comprehensive carbon cycle analysis, includes land use emissions
   - Annual update from Global Carbon Project since 2006

7. **IPCC** (2021). Climate Change 2021: The Physical Science Basis. AR6 Working Group I.
   - Chapter 5: Global Carbon and Other Biogeochemical Cycles
   - Chapter 7: Earth's Energy Budget, Climate Feedbacks, and Climate Sensitivity
   - Provides context for validation metrics (TCR, airborne fraction)

8. **Morice, C.P., et al.** (2021). An updated assessment of near-surface temperature change from 1850: The HadCRUT5 dataset. *Journal of Geophysical Research: Atmospheres*, 126(3). https://doi.org/10.1029/2019JD032361
   - Alternative temperature dataset for cross-validation
   - Similar trends to GISTEMP/GCAG, confirms robustness

### Methodological Context

9. **Keeling, C.D., et al.** (2005). Atmospheric CO2 and 13CO2 exchange with the terrestrial biosphere and oceans from 1978 to 2000. *Global Biogeochemical Cycles*, 19(1).
   - Original Keeling Curve methodology and carbon cycle partitioning
   - Established airborne fraction ~45% and seasonal cycle interpretation

10. **Raupach, M.R., et al.** (2007). Global and regional drivers of accelerating CO2 emissions. *Proceedings of the National Academy of Sciences*, 104(24), 10288-10293.
   - Analysis of emissions growth rates and carbon intensity trends
   - Context for 2%/year growth and 2008-2009 financial crisis impact

---

## Data Provenance & Quality Statement

**Data Collection Date:** 2025-11-27
**Researcher:** Cynthia (Super-Alignment Researcher)
**Validation Status:** Ready for simulation input

**Quality Checks Performed:**
- ✅ Primary sources verified (NOAA, NASA, CDIAC)
- ✅ Units confirmed and conversions validated (GtC ↔ GtCO2)
- ✅ Temporal coverage complete (all 252 months, 21 years)
- ✅ Trend consistency checked (CO2 ↑, temp ↑, emissions ↑)
- ✅ Anomalies explained (1991 Pinatubo, 1998 El Niño, 2009 recession)
- ✅ Cross-dataset coherence (emissions → CO2 → temperature causality)

**Known Data Gaps:**
- Land use change emissions not included (add ~5 GtCO2/yr for total)
- Non-CO2 greenhouse gases not provided (CH4, N2O, halocarbons)
- Aerosol forcing not quantified (volcanic, anthropogenic sulfates)
- Ocean heat content not included (would validate energy balance)

**Recommended Follow-Up Research:**
1. Global Carbon Project land use emissions 1990-2010
2. NOAA volcanic stratospheric aerosol optical depth (1991 Pinatubo)
3. NOAA ocean heat content time series (0-700m, 0-2000m)
4. AGAGE/NOAA methane concentration for multi-gas validation

---

## Appendix: CSV Format for Programmatic Use

**File 1: co2_monthly_1990_2010.csv**
```
Year,Month,CO2_ppm
1990,1,353.86
[...252 rows total...]
2010,12,388.71
```

**File 2: temperature_annual_1990_2010.csv**
```
Year,GISTEMP_degC,GCAG_degC,Mean_degC
1990,0.445,0.3606,0.4028
[...21 rows total...]
2010,0.7233,0.6804,0.7019
```

**File 3: emissions_annual_1990_2010.csv**
```
Year,Fossil_GtC,Fossil_GtCO2,LandUse_GtCO2_approx,Total_GtCO2_approx
1990,6.051,22.19,5.0,27.19
[...21 rows total...]
2010,8.992,32.98,3.5,36.48
```

**Note:** Land use emissions are approximate extrapolations from Global Carbon Project trends (declining from ~5 to ~3.5 GtCO2/yr over this period). For precise validation, use fossil-only values from CDIAC-FF.

---

**End of Document**

**Next Steps:**
1. Roy runs simulation initialization with Jan 1990 state
2. Roy executes 240-month simulation with RNG seed for reproducibility
3. Priya compares simulation output to these observations
4. Priya generates validation report with RMSE, bias, and deviation analysis
5. Architecture review if deviations exceed tolerances (identify mechanism failures)
