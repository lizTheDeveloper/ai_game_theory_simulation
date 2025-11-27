---
title: "Hindcast Calibration Parameters: Temperature, Population, Biodiversity, and Determinism"
date: 2025-11-27
topic: Hindcast Validation
oldest_source: 2020
newest_source: 2025
last_verified: 2025-11-27
status: Active Research
priority: HIGH
related_files:
  - src/simulation/engine/phases/ClimatePhysicsPhase.ts
  - src/simulation/engine/phases/HumanPopulationPhase.ts
  - src/simulation/systems/biodiversity.ts
purpose: |
  Provide peer-reviewed parameters for calibrating the simulation's hindcast validation (1990-2024).
  Addresses HIGH-6 (temperature overestimation), HIGH-7 (population mortality), HIGH-8 (biodiversity decline),
  and HIGH-9 (non-determinism) identified in Phase 10 hindcast validation failures.
---

# Hindcast Calibration Parameters (1990-2024)

**Research Date:** 2025-11-27
**Requestor:** autonomous-worker (implementation track)
**Context:** Phase 10 hindcast validation showing systematic calibration errors

## Executive Summary

This document provides peer-reviewed parameters and methodologies for calibrating the simulation's hindcast validation against historical data (1990-2024). Key findings:

1. **Temperature:** IPCC AR6 TCRE range 1.0-2.3°C per 1000 PgC (best: 1.65°C), aerosol cooling 0.24±0.11K
2. **Population:** Fertility declined from 3.31 (1990) to 2.25 (2024), life expectancy increased from 66.8 to 73.1 years (2000-2019)
3. **Biodiversity:** WWF LPI shows 73% vertebrate decline (1970-2020), accelerating over time
4. **Determinism:** CV validation requires independent RNG streams, floating-point order sensitivity

---

## HIGH-6: Temperature Overestimation (+64% Error)

### Climate Sensitivity Parameters (IPCC AR6)

**Equilibrium Climate Sensitivity (ECS):**
- AR6 likely range: **2.5-4.0°C** (narrower than AR5: 1.5-4.5°C)
- Best estimate: **3.0°C**
- 2024 adjusted multi-model mean: **3.5 ± 0.4 K** (68% confidence)

**Transient Climate Response (TCR):**
- AR6 likely range: **1.4-2.2 K**
- 2024 adjusted multi-model mean: **1.8 ± 0.3 K** (68% confidence)
- Original range across 16 DAMIP models: 1.5-2.7 K

**Transient Climate Response to Cumulative Emissions (TCRE):**
- AR6 assessment: **1.0-2.3°C per 1000 PgC**
- Best estimate: **1.65°C per 1000 PgC**
- Narrower than AR5: 0.8-2.5°C per 1000 PgC

### Aerosol Cooling Parameters

**Near-Term Climate Forcer (NTCF) Cooling (1850-1899 to 2000-2014):**
- 2024 adjusted multi-model mean: **0.24 ± 0.11 K** (68% confidence)
- Unadjusted mean: 0.67 ± 0.31 K
- Positions at lower end of AR6 range: 0.31 K (5-95% CI: 0.15-0.57 K)
- Rescaling factors (β₁): range 0.1-1.25, mean 0.47 ± 0.39

**Historical Aerosol Trend Reversal:**
- **Critical insight:** Aerosol forcing changed sign in the 1990s
- Since 1990s: aerosol forcing on declining trend (reduced cooling → enhanced warming)
- This trend reversal makes GHG and aerosol influences statistically distinguishable
- Declining SO₂ emissions: ~0.14°C additional warming (2007-2024), representing >25% of ~0.5°C warming in that period

**Uncertainty Magnitude:**
- Emission uncertainties: 90% CI range spanning **2.8 W m⁻²**
- Model spread uncertainties: **2.8 W m⁻²**
- Both sources contribute equally to total uncertainty

### Historical Warming Trajectory (1990-2024)

**Observed Temperature Increases:**
- IPCC AR6 revised observed warming upward by **0.08°C [-0.01 to 0.12°C]** for 1986-2005 vs AR5
- Human-induced warming (2014-2023): **+1.19°C [1.0 to 1.4°C]**
- For year 2023: **+1.31°C [1.1 to 1.7°C]**
- Total increase since pre-industrial (1850-1900): approximately **1°C**

**Model-Observation Consistency:**
- GCM models that best hindcast warming (1980-1990 to 2012-2022) characterized by **low ECS (1.5-3.0°C)**
- This contrasts with AR6 likely range of 2.5-4.0°C
- Strong future warming in some new models less likely due to inconsistency with observed recent trends

### Calibration Recommendations

1. **Coupling between ECS and aerosol forcing:** Large-ECS models tend to have strong aerosol-related cooling (compensating errors)
2. **Reduce simulated aerosol cooling** in high-ECS models
3. **Account for 1990s aerosol trend reversal** - critical inflection point
4. **Use constrained ranges:** TCR 1.8±0.3 K, aerosol cooling 0.24±0.11 K
5. **Target historical warming:** +1.19°C (2014-2023) relative to pre-industrial

### Sources

- [WCRP TCRE Assessment](https://www.wcrp-climate.org/slc-activities/tcre)
- [WCRP TCRE Workshop Report 2024](https://www.wcrp-climate.org/WCRP-publications/2024/TCRE-Workshop-Report-c.pdf)
- [New physical science behind climate change: IPCC AR6](https://pmc.ncbi.nlm.nih.gov/articles/PMC8569627/)
- [IPCC AR6 WG1 Chapter 7: Climate Sensitivity](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/)
- [Using historical temperature to constrain climate sensitivity (2024)](https://acp.copernicus.org/articles/24/8105/2024/)
- [The aerosol pathway for observationally constraining climate sensitivity (2024)](https://esd.copernicus.org/articles/15/1435/2024/)

---

## HIGH-7: Population Mortality Calibration (-76% Error)

### Fertility Rate Decline (1990-2024)

**Global Total Fertility Rate (TFR):**
- 1990: **3.31 live births per woman**
- 2024: **2.25 live births per woman**
- 2023: **2.20** (0.87% decline from 2022)
- 2022: **2.22** (1.36% decline from 2021)
- Historical context: 1950s-1970s averaged ~5 children per woman

**Key Threshold:**
- More than half of all countries below replacement level: **2.1 births per woman**

**Interpretation:**
- Women today bear **one child fewer on average** than 1990
- Represents fundamental demographic transition to smaller families

### Life Expectancy Improvements (1990-2024)

**Global Life Expectancy at Birth:**
- 1970: **56 years**
- 2000: **66.8 years**
- 2019: **73.1 years** (pre-COVID peak)
- Gain 2000-2019: **+6.3 years in just 19 years**
- Gain 1970-2019: **+17 years in 49 years**
- Historical context: 1821 global average was <35 years

**COVID-19 Impact:**
- 2020-2021: Reversed approximately **one decade of gains**
- Life expectancy rolled back to 2016 levels: **72.5 years** (2020)
- Healthy life expectancy (HALE): **62.8 years** (2020, also 2016 level)

**Post-COVID Recovery:**
- Global life expectancy rising again following pandemic
- Rebound demonstrates resilience of demographic trends

### Healthy Life Expectancy (HALE)

**Historical Trajectory:**
- 2000: **58.1 years**
- 2019: **63.5 years**
- Gain: **+5.4 years** (9% increase)
- Improvement primarily from **declining mortality**, not reduced disability years

### Mortality Rate Improvements by Age

**Key Achievements:**
- Between 1970 and 2019: **lowest age-specific mortality rates in history**
- Large reduction in child mortality (major contributor)
- Life expectancy increased **at all ages**, not just children
- From 1960s-1970s onward: CVD mortality decline increasingly important in developed countries

### Demographic Transition Framework

**Stages Observed (1990-2024):**

1. **Early stage (some developing regions):**
   - Mortality declining (especially infant/child)
   - Fertility still high
   - Result: Rapid population growth

2. **Intermediate stage (most regions by 2024):**
   - Continued low mortality
   - Fertility beginning to decline
   - Still rapid population growth from demographic momentum

3. **Advanced stage (many developed nations):**
   - Low mortality stabilized
   - Fertility below replacement (2.1)
   - Population growth slowing or negative

### UN DESA Data Quality

**World Population Prospects 2024 (28th edition):**
- Covers 237 countries/areas
- Historical estimates: 1950-present
- Data sources:
  - 1,910 national population censuses (1950-2023)
  - Vital registration systems
  - 3,189 nationally representative surveys
- Projections through 2100

### Separation of Mortality Types

**Baseline Mortality (Demographic):**
- Declining due to health system improvements
- Medical advances
- Public health interventions
- Living standards

**Crisis Mortality (Shocks):**
- Pandemics (COVID-19)
- Famines
- Conflicts
- Natural disasters
- These should be modeled separately from baseline demographic trends

### Calibration Recommendations

1. **Baseline fertility decline:** Linear interpolation from 3.31 (1990) to 2.25 (2024) = **-0.031 births/year**
2. **Baseline life expectancy:** +6.3 years over 19 years (2000-2019) = **+0.33 years/year**
3. **Separate baseline from crisis mortality:**
   - Baseline: Steady improvement (~0.33 yr/yr life expectancy gain)
   - Crisis: Superimposed shocks (COVID reduced by ~1 year in single year)
4. **Account for demographic momentum:** Declining fertility takes decades to reduce population growth
5. **Regional variation:** Latin America/Caribbean, Africa show different patterns than global average

### Sources

- [UN Population Division Methodology Report 2024](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/files/documents/2024/Jul/undesa_pd_2024_wpp2024_methodology-report.pdf)
- [World Population Prospects 2024 Summary](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2024_wpp_2024_advance_unedited_0.pdf)
- [World Population Prospects 2024 Homepage](https://www.un.org/development/desa/pd/world-population-prospects-2024)
- [World Population Prospects 2024 Dataset](https://www.un.org/development/desa/pd/content/World-Population-Prospects-2024)
- [World Bank Fertility Rate Data](https://data.worldbank.org/indicator/SP.DYN.TFRT.IN)
- [Global trends in fertility and life expectancy (BMC 2022)](https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-022-13656-1)
- [WHO Global Health Estimates: Life Expectancy](https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates/ghe-life-expectancy-and-healthy-life-expectancy)
- [Epidemiological and demographic trends 1970-2050 (Lancet 2025)](https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(25)00902-X/fulltext)
- [Our World in Data: Life Expectancy](https://ourworldindata.org/life-expectancy)

---

## HIGH-8: Biodiversity Decline Rate Calibration (-95% Error)

### WWF Living Planet Index (1970-2020)

**Overall Vertebrate Population Decline:**
- 1970-2012: **-58%** decline
- 1970-2020: **-73%** decline (updated 2024)
- Acceleration evident: 15 percentage point increase in 8 years
- Monitored populations: **~35,000 vertebrate populations** of **5,495 species**

**Breakdown by Habitat Type:**
1. **Freshwater:** -85% (steepest decline)
2. **Terrestrial:** -69%
3. **Marine:** -56% (least affected)

**Breakdown by Region:**
1. **Latin America & Caribbean:** -95% (catastrophic)
2. **Africa:** -76%
3. Other regions: Less severe but still substantial

**Important Context:**
- Index tracks vertebrate species only (mammals, birds, fish, reptiles, amphibians)
- Reflects **average proportional change** in monitored population sizes
- NOT total individual animals lost
- NOT number of populations or species extinct
- Many populations declining but not yet extinct

### IUCN Red List Status (2024)

**Current Threat Levels:**
- **Total assessed species:** 166,061
- **Threatened with extinction:** 46,337 species (27.9%)
- **Critically Endangered:** 3,947 species
- **Endangered:** 5,766 species
- **Vulnerable:** >10,000 species

**Threat by Taxonomic Group:**
- Amphibians: **41%** threatened
- Conifers: **30%** threatened
- Mammals: **25%** threatened
- Reef-building corals: **33%** threatened
- Birds: **13%** threatened
- Trees (2024 assessment): **>33%** threatened

**Historical Growth of IUCN Database:**
- 1994: Assessment system unveiled
- 2000: ~16,500 species (website launch)
- 2006: 41,227 species
- 2007: 41,415 species (16,306 endangered/threatened)
- 2024: 166,061 species

**Conservation Effectiveness:**
- Many species benefited from Red List designation
- Notable successes: Global Green Turtle population rebounded
- Fewer extinctions relative to business-as-usual scenarios
- Red List Index (RLI) tracks aggregate extinction risk trends over time

**Data Quality Concerns:**
- Criteria designed primarily for higher vertebrates
- Inconsistent/deficient assessments for other taxa
- "Inconspicuous species" with catastrophic decline may be listed as "Data Deficient"
- Challenges remain for comprehensive biodiversity monitoring

### Land Use Pressure Quantification (FAO)

**Deforestation (1990-2024):**
- Since 1990: **420 million hectares** forest lost
- Rate declining over time:
  - 1990s: **16 million ha/year**
  - 2000s: Similar to 1990s
  - 2010s: **10 million ha/year** (26% reduction)
  - 2015-2020: **10 million ha/year** (sustained)

**Primary Drivers (2000-2018):**
1. **Crop expansion:** 49.6%
2. **Pasture expansion:** 38.46%
3. **Urbanization/infrastructure:** 6.16%
4. **Mining/other:** 5.78%

**Urbanization Pressure:**
- Global urban expansion: **20,000 km²/year**
- Most occurs on agricultural land
- Reduces land available for food production and natural habitats

**Regional Impact:**
- Tropics most affected (highest biodiversity regions)
- Between 1992-2019: Natural/semi-natural cover lost **>20%** more area than gained
- Primary conversion: to cropland, desertification, urban expansion

**Conservation Context:**
- Agriculture = main driver of deforestation and forest degradation
- Urgent need to balance food production with forest conservation
- Protected areas and species recovery programs show effectiveness
- But overall pressure continues

### Biodiversity Recovery Mechanisms

**Evidence of Recovery Potential:**
- Conservation interventions demonstrate effectiveness
- Protected areas reduce habitat loss
- Species-specific recovery programs work (e.g., Green Turtle)
- Restoration efforts can reverse some trends

**Key Factors:**
1. **Protected area coverage** and management quality
2. **Species-specific interventions** (breeding programs, habitat restoration)
3. **Reduced land-use pressure** (sustainable agriculture, urban planning)
4. **Climate mitigation** (increasingly important driver)

**Challenges:**
- Recovery slower than decline
- Lag times between intervention and population response
- Cumulative effects difficult to reverse
- Tropical regions face ongoing high pressure

### Calibration Recommendations

1. **Historical trajectory:** Use WWF LPI -73% (1970-2020) as baseline
   - Average decline: **-1.46%/year** (linear approximation)
   - But acceleration evident: steeper after 2000
2. **Differential rates by habitat:**
   - Freshwater: -85% → **-1.7%/year**
   - Terrestrial: -69% → **-1.38%/year**
   - Marine: -56% → **-1.12%/year**
3. **Land use pressure:** Deforestation rate declining (16→10 million ha/yr)
4. **Conservation effectiveness:** Model as fractional reduction in decline rate
   - Protected areas: 5-20% effectiveness
   - Species programs: 10-50% for targeted species
5. **Regional variation:** Latin America/Caribbean much worse than global average
6. **Recovery parameterization:** Very slow (decades) once pressure reduced

### Interaction with Other Systems

**Climate Change:**
- Increasingly important driver (currently 4th, rising)
- Synergistic effects with habitat loss
- Range shifts and phenological mismatches

**Food Security:**
- Agricultural expansion primary driver
- Trade-off between food production and biodiversity
- Sustainable intensification could reduce pressure

**Technology Impacts:**
- Precision agriculture could reduce habitat conversion
- Alternative proteins could reduce pasture expansion
- Monitoring tech improving conservation effectiveness

### Sources

- [WWF Living Planet Index Homepage](https://livingplanet.panda.org/)
- [WWF Living Planet Report 2024: 73% Decline](https://www.worldwildlife.org/news/press-releases/catastrophic-73-decline-in-the-average-size-of-global-wildlife-populations-in-just-50-years-reveals-a-system-in-peril/)
- [Our World in Data: Living Planet Index Analysis](https://ourworldindata.org/living-planet-index-decline)
- [Our World in Data: 2024 Living Planet Index Update](https://ourworldindata.org/2024-living-planet-index)
- [Nature: Past, Present, Future of Living Planet Index (2023)](https://www.nature.com/articles/s44185-023-00017-3)
- [IUCN Red List Official Website](https://www.iucnredlist.org/)
- [IUCN: Red List 60 Years of Success Report (2025)](https://iucn.org/sites/default/files/2025-10/red-list-60-years-of-success-report-02.10.25.pdf)
- [IUCN Press Release: Tree Species Extinction (October 2024)](https://iucn.org/press-release/202410/more-one-three-tree-species-worldwide-faces-extinction-iucn-red-list)
- [FAO: Trends in Agricultural Land Use](https://openknowledge.fao.org/server/api/core/bitstreams/94383693-fc35-4c93-8e71-87cfb7941916/content/state-of-food-and-agriculture-2025/true-cost-agrifood-systems.html)
- [Our World in Data: Deforestation](https://ourworldindata.org/deforestation)
- [Our World in Data: Land Use](https://ourworldindata.org/land-use)

---

## HIGH-9: Non-Determinism Investigation (CV=6.7%)

### RNG Seeding Best Practices

**Fundamental Principles:**
- Seed ensures **reproducibility**, not randomness
- Same seed → same pseudo-random sequence (always)
- PRNG must be: computationally efficient, deterministic, reproducible, long period

**Seed Management:**
- Set seed **once at beginning** of each independent run
- Do NOT set seed 10,000 times in loop (unnecessary)
- Record seed values for reproducibility
- Different seeds required for independent trials (or same result repeats)

**Parallel Processing (Critical for Multi-Core):**
- Separate RNG states for each independently schedulable unit
- Form **independent random number streams**
- 2024 best practice: **hash-based seed splitting** (alternative to stride-based RNG)
- WARNING: Forked processes may inherit same system entropy seed → identical outputs

**Modern PRNG Algorithms:**
- **Mersenne Twister MT19937:** Industry standard
  - Period: 2^19937 - 1 (astronomically long)
  - Uniform distribution across many dimensions
  - Default in Excel, MATLAB, Python
- Sufficient for virtually all Monte Carlo applications

### Floating Point Determinism

**Order Sensitivity:**
- Mean/variance calculated in "running manner" (incremental updates)
- Results differ based on **order of terms in summations**
- IEEE 64-bit floating-point accuracy limits
- Differences appear minor but **amplified in finite-difference sensitivities**

**Implications for Simulation:**
- Iteration order must be deterministic
- Array operations should maintain consistent order
- Parallel reductions need deterministic aggregation
- Non-associativity of floating-point arithmetic

**Mitigation Strategies:**
1. Use fixed iteration orders (e.g., sorted arrays)
2. Avoid data structure with undefined ordering (e.g., hash map iteration)
3. Use compensated summation (Kahan algorithm) for critical calculations
4. Document expected precision limits

### Coefficient of Variation for Validation

**CV Formula for Monte Carlo:**
- CV = √[(1 - p_f) / (p_f · K)]
- where p_f = probability of failure, K = number of samples

**Sample Size Determination:**
- From target CV, deduce required K (sample count)
- Trade-off between accuracy and computational cost

**Stopping Criteria:**
- New methods (2024): Total coefficient of variation-based stopping
- Methodologies quantify sensitivity to GP uncertainties and sampling strategies

**Research Context:**
- 2024 review: Comparison of Monte Carlo vs quasi-Monte Carlo techniques
- Quasi-MC: Deterministic low-discrepancy sequences spanning entire space
- May offer better convergence for high-dimensional problems

### Agent-Based Model Determinism

**Additional Considerations:**
- Agent activation order must be deterministic
- Event scheduling needs consistent tie-breaking
- Network/graph iteration order matters
- Spatial operations (nearest neighbor, etc.) need consistent ordering

**Testing Reproducibility:**
1. Run same seed multiple times → identical results
2. Different seeds → different results (but same statistics)
3. CV across seeds should reflect true stochastic variation
4. CV within seed should be zero (perfect reproducibility)

### Validation Thresholds

**Acceptable CV Ranges (Research Simulations):**
- **Excellent:** CV < 0.01% (near-perfect determinism)
- **Good:** CV < 0.1% (acceptable stochastic variation)
- **Acceptable:** CV < 1% (some variation, check for iteration order issues)
- **Poor:** CV > 1% (likely determinism bug or insufficient sample size)
- **Unacceptable:** CV > 5% (serious reproducibility problems)

**Priya's Standard (Per CLAUDE.md):**
- Required threshold: **CV < 0.01%** for deterministic validation
- This is "excellent" tier - appropriate for research simulation
- 6.7% CV indicates serious non-determinism requiring investigation

### Calibration Recommendations

1. **Fix parallel RNG:** Implement independent streams (hash-based seed splitting)
2. **Audit iteration order:** Ensure all loops/operations have deterministic order
3. **Floating-point consistency:** Use compensated summation for cumulative metrics
4. **Target CV < 0.01%:** Per project standards (research simulation tier)
5. **Record all seeds:** Enable full reproducibility of results
6. **Test protocol:**
   - Run seed=42 ten times → identical results
   - Run seeds 1-100 → CV should be <0.01% on deterministic components

### Sources

- [Alternative to Stride-Based RNG for Monte Carlo (2024)](https://arxiv.org/html/2403.06362v1)
- [NumPy RNG Best Practices Blog](https://blog.scientific-python.org/numpy/numpy-rng/)
- [Stochastic Simulation and Monte Carlo Methods (2024 Draft)](https://www-labs.iro.umontreal.ca/~lecuyer/ift6561/book.pdf)
- [Cross Validated: Seed for Each Monte Carlo Run](https://stats.stackexchange.com/questions/235232/new-or-same-seed-for-each-monte-carlo-simulation-run)
- [Analytica: Monte Carlo Simulation Best Practices](https://analytica.com/blog/monte-carlo-simulation-tips-and-tricks/)
- [Reproducible Results in Pumas](https://tutorials.pumas.ai/html/simulation/simulating_reproducible.html)
- [Review of Monte Carlo and Quasi-Monte Carlo Sampling (2024)](https://wires.onlinelibrary.wiley.com/doi/10.1002/wics.1637)
- [Cross Validated: How Many Monte Carlo Runs?](https://stats.stackexchange.com/questions/272218/how-to-determine-how-many-runs-are-needed-for-a-monte-carlo-simulation)
- [Accurate Mean and Variance Calculation (2022)](https://arxiv.org/pdf/2206.10662)

---

## Implementation Guidance

### Priority Order

1. **HIGH-9 (Non-determinism):** Fix first - impacts validation of all other calibrations
2. **HIGH-6 (Temperature):** Most critical for hindcast credibility (64% error)
3. **HIGH-7 (Population):** Large error (-76%) but clearer parameter sources
4. **HIGH-8 (Biodiversity):** Complex multi-factor system (-95% error)

### Validation Protocol

After implementing calibrations:

1. **Determinism test:** Run seed=42 ten times, verify CV < 0.01%
2. **Hindcast comparison:** Plot 1990-2024 trajectory vs historical data
3. **Error metrics:** Calculate RMSE, MAE, percent error for each subsystem
4. **Sensitivity analysis:** Vary key parameters within uncertainty ranges
5. **Monte Carlo validation:** N≥10 runs, check outcome distributions

### Cross-System Interactions

These systems interact - calibrate iteratively:

- **Climate → Population:** Heat stress mortality, agricultural impacts
- **Climate → Biodiversity:** Habitat shifts, phenological mismatches
- **Population → Biodiversity:** Land use pressure, urbanization
- **Biodiversity → Climate:** Carbon sequestration, albedo effects

### Documentation Standards

For each calibration:
1. Parameter values with uncertainty ranges
2. Source citations (peer-reviewed, 2024-2025 preferred)
3. Assumptions and limitations
4. Validation results (before/after comparison)
5. Sensitivity to parameter variations

---

## Next Steps

1. **Fix determinism bugs** (hash-based RNG, iteration order)
2. **Implement temperature calibration** (TCRE 1.65, aerosol 0.24±0.11 K)
3. **Implement population calibration** (TFR -0.031/yr, LE +0.33 yr/yr)
4. **Implement biodiversity calibration** (LPI -1.46%/yr with habitat variation)
5. **Run hindcast validation suite** (target errors <10% for all metrics)
6. **Document results** in devlog and post to research channel

**Timeline:** HIGH priority - blocking baseline credibility for research publication

**Questions for Implementation Team:**
- Which subsystem shows largest sensitivity to parameter changes?
- Are there structural model issues (not just parameters)?
- Do we need additional state variables to capture historical dynamics?

---

**Document Status:** Complete - Ready for Implementation
**Next Review:** After implementation and hindcast re-validation
**Maintainer:** @researcher (autonomous research worker)
