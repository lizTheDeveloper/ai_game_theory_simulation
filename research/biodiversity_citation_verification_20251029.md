# Biodiversity Citation Verification: IPBES 2024 Claim

**Date:** October 29, 2025
**Researcher:** super-alignment-researcher-1
**Status:** ❌ CITATION ERROR DETECTED

## Wiki Claim Under Review

**Location:** `docs/wiki/README.md`, line 111
**Claim:** "Biodiversity: 70% → 35% (IPBES 2024: 50-70% loss since 1970)"

## Verification Results

### ❌ FINDING: Citation Error - No Such IPBES 2024 Report

**The claim "IPBES 2024: 50-70% loss since 1970" is INCORRECT for multiple reasons:**

1. **IPBES 2024 does not contain biodiversity loss statistics**
   - IPBES released two reports in December 2024 (Transformative Change Assessment and Nexus Assessment)
   - Neither report provides new biodiversity baseline statistics
   - Both reference earlier assessments for biodiversity trends

2. **No "50-70%" statistic exists in IPBES reports**
   - Comprehensive search of IPBES Global Assessment (2019) found no such range
   - The "50-70%" figure does not appear in IPBES literature

3. **The statistic likely conflates multiple sources:**
   - **Living Planet Report 2022 (WWF):** 69% decline in wildlife populations 1970-2018
   - **Living Planet Report 2024 (WWF):** 73% decline in wildlife populations 1970-2020
   - **IPBES 2019:** 20% decline in average abundance of native species in habitats (mostly since 1900)

## Correct Primary Sources

### 1. WWF Living Planet Index 2022 & 2024 (Most Relevant to Wiki Claim)

**Citation:**
- WWF (2022). *Living Planet Report 2022 – Building a nature-positive society.* Almond, R.E.A., Grooten, M., Juffe Bignoli, D. & Petersen, T. (Eds). WWF, Gland, Switzerland.
- WWF (2024). *Living Planet Report 2024 – A System in Peril.* Almond, R.E.A., Grooten, M., Petersen, T. (Eds). WWF, Gland, Switzerland.

**Statistics:**
- **2022 Report:** 69% average decline in monitored vertebrate wildlife populations between 1970 and 2018
- **2024 Report:** 73% average decline across 35,000 vertebrate populations from 1970 to 2020
- **Data basis:** Living Planet Index tracks 5,495 species (mammals, birds, reptiles, amphibians, fish)

**URL:** https://www.worldwildlife.org/publications/2024-living-planet-report

**Critical Context - What This Metric Actually Means:**

⚠️ **The Living Planet Index is widely misunderstood.** It does NOT mean:
- 69-73% of species went extinct
- 69-73% of individual animals died
- 69-73% of biodiversity lost

**What it DOES mean:**
- Average population size across tracked populations declined 69-73%
- A population that went from 1,000 individuals to 270 individuals = 73% decline
- Across whole dataset: 50% of populations declining, 43% increasing, 7% stable

**Methodological Issues (Nature Communications 2024):**
- Mathematical biases in LPI calculation overestimate declines
- Disproportionate weighting of declining vs. increasing populations
- Regional variation: Latin America 95% decline vs. Europe 35% decline

**Source:** Leung et al. (2024). "Mathematical biases in the calculation of the Living Planet Index lead to overestimation of vertebrate population decline." *Nature Communications* 15, 4552. https://doi.org/10.1038/s41467-024-49070-x

### 2. IPBES Global Assessment 2019 (Official UN Biodiversity Report)

**Citation:**
IPBES (2019). *Global assessment report on biodiversity and ecosystem services of the Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services.* E. S. Brondizio, J. Settele, S. Díaz, and H. T. Ngo (editors). IPBES secretariat, Bonn, Germany. 1148 pages.

**DOI:** https://doi.org/10.5281/zenodo.3831673

**Key Statistics (with exact quotes):**

1. **Native species abundance:**
   - "The average abundance of native species in most major land-based habitats has fallen by **at least 20%**, mostly since 1900"

2. **Wild mammal biomass:**
   - "The total biomass of wild mammals has decreased by **82%**"
   - "Humans and their farm animals now make up **96%** of all mammalian biomass on Earth"

3. **Habitat alteration:**
   - "**75%** of the terrestrial environment has been 'severely altered' to date by human actions"
   - "Marine environments **66%** altered"

4. **Wetlands:**
   - "Already **85%** of the world's wetlands have been lost"

5. **Species extinction risk:**
   - "Out of 8 million species, **1 million are threatened with extinction**"
   - "Including **40%** of amphibians, almost **1/3** of reef-building corals, more than **1/3** of marine mammals, and **10%** of all insects"

6. **Invasive species (the only IPBES "70%" figure related to 1970 baseline):**
   - "The numbers of invasive alien species per country have risen by about **70% since 1970**"

**Release Date:** May 6, 2019 (7th IPBES Plenary, Paris)

**URL:** https://www.ipbes.net/global-assessment

### 3. IPBES 2024 Reports (Transformative Change & Nexus)

**Citations:**
- IPBES (2024). *Thematic Assessment Report on the Underlying Causes of Biodiversity Loss and the Determinants of Transformative Change and Options for Achieving the 2050 Vision for Biodiversity.* IPBES secretariat, Bonn, Germany.
- IPBES (2024). *Thematic Assessment of the Interlinkages among Biodiversity, Water, Food and Health (Nexus Assessment).* IPBES secretariat, Bonn, Germany.

**Release Date:** December 18, 2024 (11th IPBES Plenary, Windhoek, Namibia)

**Content:** Focus on transformative change strategies and interconnected crises, NOT new biodiversity baseline statistics

**URL:** https://www.ipbes.net/transformative-change-assessment

## Recommended Citation Corrections

### Option 1: Use Living Planet Index (Most Direct Match)

**Current Wiki Line 111:**
```
- ✅ Biodiversity: 70% → **35%** (IPBES 2024: 50-70% loss since 1970)
```

**CORRECTED:**
```
- ✅ Biodiversity: 70% → **35%** (Living Planet Index 2024: 73% wildlife population decline 1970-2020; note: population size metric, not species loss)
```

**Full citation for research folder:**
WWF (2024). *Living Planet Report 2024 – A System in Peril.* Living Planet Index shows 73% average decline across 35,000 monitored vertebrate populations from 1970 to 2020. This represents population size changes, not biodiversity loss per se. https://www.worldwildlife.org/publications/2024-living-planet-report

### Option 2: Use IPBES 2019 (More Conservative, Official UN)

**CORRECTED:**
```
- ✅ Biodiversity: 70% → **35%** (IPBES 2019: 20% decline in native species abundance; 82% decline in wild mammal biomass; 75% terrestrial habitat alteration)
```

**Full citation:**
IPBES (2019). *Global Assessment Report on Biodiversity and Ecosystem Services.* Reports 20% decline in average abundance of native species in most major land-based habitats (mostly since 1900), 82% decline in wild mammal biomass, and 75% terrestrial habitat alteration. https://doi.org/10.5281/zenodo.3831673

### Option 3: Combine Both (Most Comprehensive)

**CORRECTED:**
```
- ✅ Biodiversity: 70% → **35%** (WWF Living Planet Index 2024: 73% wildlife population decline 1970-2020; IPBES 2019: 20% native species abundance decline, 82% wild mammal biomass loss)
```

## Simulation Parameter Justification

**Question:** Does the simulation's 35% biodiversity baseline for 2025 make sense?

**Analysis:**

1. **If using Living Planet Index (73% decline):**
   - Starting from 100% in 1970 → 27% remaining in 2020
   - Projection to 2025: ~23-25% (continued decline trajectory)
   - **Wiki's 35% is TOO OPTIMISTIC by this metric**

2. **If using IPBES native species abundance (20% decline):**
   - Starting from 100% in 1900 → 80% remaining in 2019
   - This is a different metric (species abundance in habitats, not population sizes)
   - **Wiki's 35% is TOO PESSIMISTIC by this metric**

3. **Context-dependent interpretation:**
   - The "biodiversity" parameter in the simulation appears to be a composite metric
   - Different biodiversity metrics give radically different baselines
   - Need clarification: What does "biodiversity %" represent in the simulation?
     - Wildlife population sizes? (LPI = ~27%)
     - Species abundance in habitats? (IPBES = ~80%)
     - Ecosystem health? (IPBES = 25% terrestrial remaining natural)
     - Genetic diversity? (No single metric available)

## Recommendations

### 1. IMMEDIATE: Fix Citation Error

Replace "IPBES 2024: 50-70% loss since 1970" with accurate citation (see Options 1-3 above)

### 2. CLARIFY: Define "Biodiversity" Metric

Add to simulation documentation:
- What does the biodiversity % represent?
- Which real-world metric is it intended to model?
- How do the different baselines affect simulation behavior?

### 3. RESEARCH: Validate 35% Baseline

**Further research needed:**
- Review what composite biodiversity metrics exist (e.g., Biodiversity Intactness Index)
- Check if 35% represents a synthesis of multiple metrics
- Validate against expected 2025 trajectories from source data

### 4. METHODOLOGY: Improve Citation Rigor

**For future parameter development:**
- Always link to DOI or permanent URL
- Include exact page numbers or section references
- Distinguish between direct measurements and composite indices
- Note methodological limitations of each source

## Additional Context: Why This Matters

**Impact on Simulation Credibility:**
1. **Incorrect citations undermine research rigor:** The project's value proposition is "research-backed realism" - citation errors violate this core principle
2. **Parameter accuracy affects model behavior:** A 35% vs. 27% vs. 80% starting point changes trajectory calculations
3. **Transparency requirement:** Monte Carlo validation requires traceable parameter provenance

**Common Citation Pitfalls in Environmental Research:**
- Confusing WWF Living Planet Report with IPBES reports (both are biodiversity assessments)
- Using report year instead of data year (e.g., "IPBES 2024" when data is from 2019)
- Citing approximate ranges not in original source ("50-70%" fabricated)
- Misunderstanding what LPI measures (population trends ≠ biodiversity loss)

## Conclusion

**Verdict: ❌ CITATION ERROR - CORRECTION REQUIRED**

The claim "IPBES 2024: 50-70% loss since 1970" is factually incorrect:
- No IPBES 2024 report contains biodiversity loss statistics
- No "50-70%" range appears in any IPBES report
- The statistic likely conflates Living Planet Index (69-73%) with IPBES authorship

**Correct source:** WWF Living Planet Index 2024 (73% wildlife population decline 1970-2020) or IPBES 2019 Global Assessment (20% native species abundance decline, 82% wild mammal biomass loss)

**Action Required:** Update wiki citation to accurate source and clarify what "biodiversity %" represents in simulation

---

## Full Bibliography

**Primary Sources:**

1. WWF (2024). *Living Planet Report 2024 – A System in Peril.* Almond, R.E.A., Grooten, M., Petersen, T. (Eds). WWF, Gland, Switzerland. Available at: https://www.worldwildlife.org/publications/2024-living-planet-report

2. WWF (2022). *Living Planet Report 2022 – Building a nature-positive society.* Almond, R.E.A., Grooten, M., Juffe Bignoli, D. & Petersen, T. (Eds). WWF, Gland, Switzerland.

3. IPBES (2019). *Global assessment report on biodiversity and ecosystem services of the Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services.* E. S. Brondizio, J. Settele, S. Díaz, and H. T. Ngo (editors). IPBES secretariat, Bonn, Germany. 1148 pages. https://doi.org/10.5281/zenodo.3831673

4. IPBES (2024). *Thematic Assessment Report on the Underlying Causes of Biodiversity Loss and the Determinants of Transformative Change and Options for Achieving the 2050 Vision for Biodiversity.* IPBES secretariat, Bonn, Germany. Available at: https://www.ipbes.net/transformative-change-assessment

**Methodological Critique:**

5. Leung, B., Kramer, A.M., Bouchard, C. et al. (2024). Mathematical biases in the calculation of the Living Planet Index lead to overestimation of vertebrate population decline. *Nature Communications* 15, 4552. https://doi.org/10.1038/s41467-024-49070-x

**Data Analysis:**

6. Ritchie, H. & Roser, M. (2024). "The 2024 Living Planet Index reports a 73% average decline in wildlife populations — what's changed since the last report?" *Our World in Data*. Available at: https://ourworldindata.org/2024-living-planet-index

7. Ritchie, H. & Roser, M. (2022). "Living Planet Index: what does it really mean?" *Our World in Data*. Available at: https://ourworldindata.org/living-planet-index-decline
