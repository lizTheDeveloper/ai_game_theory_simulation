# Phase 2: Metric Mapping Research Brief
## Multi-Paradigm Dystopia-Utopia Index

**Agent:** super-alignment-researcher
**Phase:** 2 of 5 (Metric Mapping)
**Timeline:** 8-10 hours
**Deliverable:** `/research/paradigm_metric_mapping_20251019.md`

---

## Context

**Phase 1 Complete:**
- 4 paradigm research documents (55,000 words, 100+ sources)
- Cross-paradigm conflict analysis
- Quality Gate 1: CONDITIONAL APPROVAL (73% confidence)
- 5 major issues identified and addressed in aggregation design

**Aggregation Design Complete:**
- Geometric mean WITHIN paradigms (non-compensatory)
- NO aggregation ACROSS paradigms (preserve conflicts)
- Report all 4 scores separately + divergence metrics
- Confidence levels: HIGH/MEDIUM/LOW/SPECULATIVE

**User Direction:**
"Paradigm conflicts are fine, we should just aggregate up to the paradigm level so we can find missing or incomplete or contradictory output."

---

## Research Objective

Find official 2024-2025 datasets for **32-47 indicators** across 4 paradigms:
- **Western Liberal:** 8-12 indicators (freedom, rights, rule of law)
- **Development Needs:** 10-15 indicators (survival, health, material security)
- **Ecological Harmony:** 9-12 indicators (planetary boundaries, sustainability)
- **Indigenous/Communitarian:** 5-8 indicators (community, harmony, culture)

**For EACH indicator, you must specify ALL of the following:**

### Required Specification (Per Indicator)

1. **Definition** - What does this indicator measure? (1-2 sentences, precise)

2. **Scale** - What is the numerical range? (0-1, 0-10, 0-100, continuous/discrete/ordinal)

3. **Data Source** - Where is the official 2024-2025 dataset?
   - **MUST provide:** Exact URL to download/access data
   - **MUST specify:** Organization name (e.g., V-Dem Institute, UNDP, WHO)
   - **MUST confirm:** 2024 or 2025 data availability (or most recent if 2024 not yet published)

4. **Coverage** - How comprehensive is the data?
   - Number of countries covered (e.g., 202 countries, 112 countries)
   - Time period available (e.g., 1789-2024, 2000-2024)
   - Regional gaps (e.g., "Limited Sub-Saharan Africa coverage")

5. **Update Frequency** - How often is new data published?
   - Annual, biennial, irregular, one-time survey

6. **Confidence Level** - How reliable is this indicator?
   - **HIGH:** Official data, 180+ countries, annual updates, rigorous methodology (e.g., HDI, V-Dem)
   - **MEDIUM:** Official data, limited countries OR irregular updates (e.g., WVS, some planetary boundaries)
   - **LOW:** Proxy indicators, substantial uncertainty, limited coverage (e.g., Indigenous paradigm proxies)
   - **SPECULATIVE:** Estimated, no direct measurement, theoretical construct

7. **Utopia Threshold** - What score constitutes "utopia" for this indicator?
   - **MUST justify** with research citation from Phase 1 paradigm documents
   - Example: "V-Dem Electoral Democracy ≥0.80 (top 8 countries: Norway, Finland, Sweden...)"
   - Example: "HDI ≥0.900 (25-30 countries meet threshold)"

8. **Dystopia Threshold** - What score constitutes "dystopia" for this indicator?
   - **MUST justify** with research citation
   - Example: "V-Dem <0.30 (authoritarianism: China 0.09, Russia 0.12)"
   - Example: "HDI <0.550 (low human development: Chad, Niger, Somalia)"

9. **Normalization Method** - How to convert to 0-100 paradigm scale?
   - If indicator is 0-1, multiply by 100
   - If indicator is inverse (e.g., Gini where lower=better), use 100 - normalized value
   - Specify min-max goalposts if using historical worst/best

10. **Weight in Paradigm** - How important is this indicator?
    - **Default:** 1/N (equal weighting, where N = total indicators in paradigm)
    - If unequal weighting needed, justify with research

11. **Research Citation** - Which Phase 1 research justifies this indicator?
    - Quote relevant passage from paradigm documents
    - Provide line numbers (e.g., "paradigm_1_western_liberal_20251019.md lines 245-289")
    - Justify why THIS indicator captures the paradigm's core values

12. **Uncertainty** - What is the measurement error/uncertainty?
    - **CRITICAL for Ecological paradigm:** ±50% uncertainty bands per skeptic requirement
    - Example: "Planetary boundary thresholds ±50% (Richardson et al. 2023)"
    - Example: "Social trust proxy LOW confidence ±30% (WVS Wave 7 limited coverage)"

13. **Historical Validation Examples** - Can we compute real scores?
    - **Utopia Examples:** List 3-5 countries meeting threshold with 2024 scores
    - **Dystopia Examples:** List 3-5 countries in dystopia with 2024 scores
    - **Contested Examples:** Countries near threshold (e.g., 0.75-0.85 for V-Dem)

---

## Paradigm-Specific Instructions

### PARADIGM 1: Western Liberal (Freedom-Focused)

**Research Foundation:** `/research/paradigm_1_western_liberal_20251019.md`

**Core Value:** Individual autonomy, political rights, economic freedom, rule of law

**Expected Indicators (8-12 total):**

**Political Freedom (3-4 indicators):**
- V-Dem Electoral Democracy Index (0-1 scale, 202 countries)
- V-Dem Liberal Component Index (0-1 scale)
- Freedom House Political Rights (0-100 scale, 195 countries)
- V-Dem Participatory Democracy Index (optional, if strengthens paradigm coverage)

**Civil Liberties (3-4 indicators):**
- Freedom House Civil Liberties (0-100 scale)
- V-Dem Freedom of Expression Index (0-1 scale)
- V-Dem Freedom of Association Index (0-1 scale)
- Privacy International Digital Rights Index (if available - LIMITED coverage acknowledged)

**Economic Freedom (2-3 indicators):**
- Heritage Foundation Economic Freedom Index (0-100 scale, 184 countries)
- Fraser Institute Economic Freedom of the World (0-10 scale, 165 countries)
- V-Dem Property Rights Protection (0-1 scale, optional)

**Rule of Law (2 indicators):**
- World Justice Project Rule of Law Index (0-1 scale, 142 countries)
- V-Dem Judicial Independence (0-1 scale)

**Key Research Claims to Validate:**
- Utopia threshold: V-Dem Liberal Democracy ≥0.80, Freedom House ≥90/100
- Dystopia threshold: V-Dem <0.30, Freedom House <30/100
- Countries meeting utopia: ~8 (0.4% of world population per research)
- Examples: Norway, Finland, Sweden, Denmark, Switzerland, Iceland, New Zealand, Luxembourg

**Historical Validation Target:**
- Norway 2024: Should score ~95/100 on Western Liberal paradigm
- Singapore 2024: Should score ~48/100 (paradox - development utopia, liberal dystopia)

---

### PARADIGM 2: Development Needs (Survival-Focused)

**Research Foundation:** `/research/paradigm_2_development_needs_20251019.md`

**Core Value:** Basic needs fulfillment, health, material security, freedom from poverty

**Expected Indicators (10-15 total):**

**Human Development (1-2 indicators):**
- HDI (Human Development Index, 0-1 scale, UNDP 2024, 193 countries)
- IHDI (Inequality-adjusted HDI, 0-1 scale, optional if available for more countries)

**Multidimensional Poverty (2 indicators):**
- MPI (Multidimensional Poverty Index, Alkire-Foster methodology, 0-1 scale, OPHI 2024, 112 countries)
- MPI Headcount Ratio (% of population in multidimensional poverty)

**Food Security (3 indicators):**
- IPC Food Security Phases (Phase 1-5 ordinal scale, FAO/IPC 2024)
- Global Hunger Index (0-100 scale, GHI 2024, 125 countries)
- FAO Prevalence of Undernourishment (% of population, FAO 2024)

**Healthcare Access & Quality (2-3 indicators):**
- HAQ Index (Healthcare Access and Quality, 0-100 scale, Lancet GBD 2024, 204 countries)
- UHC Service Coverage Index (Universal Health Coverage, 0-100 scale, WHO 2024)
- Life Expectancy at Birth (years, WHO/UNDP 2024)

**Material Living Standards (2-3 indicators):**
- GDP per capita (PPP, international $, World Bank 2024)
- Gini Coefficient (0-100 inequality measure, World Bank/OECD 2024)
- Poverty Headcount Ratio (<$2.15/day, %, World Bank 2024, optional)

**Education (2 indicators):**
- Mean Years of Schooling (years, UNDP 2024, HDI component)
- Expected Years of Schooling (years, UNDP 2024, HDI component)

**Key Research Claims to Validate:**
- Utopia threshold: HDI ≥0.900, MPI <0.005, IPC Phase 1 (minimal food insecurity)
- Dystopia threshold: HDI <0.550, MPI >0.300, IPC Phase 4-5 (humanitarian emergency)
- Countries meeting utopia: ~25-30 (10-12% of world population per research)
- Examples: Norway, Switzerland, Ireland, Iceland, Germany, Sweden, Australia, Netherlands

**Historical Validation Target:**
- Norway 2024: Should score ~96/100 on Development Needs paradigm
- Singapore 2024: Should score ~94/100 (development utopia)
- Bhutan 2024: Should score ~67/100 (medium human development)

---

### PARADIGM 3: Ecological Harmony (Sustainability-Focused)

**Research Foundation:** `/research/paradigm_3_ecological_harmony_20251019.md`

**Core Value:** Planetary boundaries, biodiversity, intergenerational justice, sustainability

**Expected Indicators (9-12 total):**

**Planetary Boundaries (9 indicators - Richardson et al. 2023):**

**CRITICAL REQUIREMENT:** For EACH planetary boundary, you MUST specify:
- Current global value (2024 data)
- Safe operating space threshold (Richardson et al. 2023)
- Uncertainty range (±X%, typically ±50% per skeptic requirement)
- Reversibility (is this boundary reversible if breached, or irreversible?)

1. **Climate Change**
   - Indicator: Atmospheric CO2 concentration (ppm)
   - Safe threshold: <350 ppm (Richardson et al. 2023)
   - Current: ~420 ppm (NOAA 2024)
   - Status: BREACHED
   - Reversibility: Reversible over 50-200 years with carbon removal
   - Data source: NOAA Global Monitoring Laboratory

2. **Biosphere Integrity (Biodiversity Loss)**
   - Indicator: Species extinction rate (extinctions per million species-years)
   - Safe threshold: <10 E/MSY (Richardson et al. 2023)
   - Current: ~100-1000 E/MSY (IPBES 2024)
   - Status: BREACHED
   - Reversibility: Largely irreversible (species extinction permanent)
   - Data source: IPBES Global Assessment 2024

3. **Land-System Change**
   - Indicator: % of forest cover remaining
   - Safe threshold: >75% of original forest cover (Richardson et al. 2023)
   - Current: ~62% (FAO 2024)
   - Status: BREACHED
   - Reversibility: Reversible over 50-100 years with reforestation
   - Data source: FAO Forest Resources Assessment 2024

4. **Freshwater Use**
   - Indicator: Blue water consumption (km³/year)
   - Safe threshold: <4000 km³/year globally (Richardson et al. 2023)
   - Current: ~2600 km³/year (UN Water 2024)
   - Status: SAFE globally, BREACHED regionally (India, Middle East, Western US)
   - Reversibility: Reversible with conservation, desalination
   - Data source: UN World Water Development Report 2024

5. **Biogeochemical Flows (Nitrogen & Phosphorus)**
   - Indicator: Nitrogen fixation (Tg N/year), Phosphorus loading (Tg P/year)
   - Safe threshold: Nitrogen <62 Tg N/year, Phosphorus <11 Tg P/year
   - Current: Nitrogen ~150 Tg N/year, Phosphorus ~22 Tg P/year
   - Status: BREACHED (both)
   - Reversibility: Reversible over 10-30 years with agricultural reform
   - Data source: Stockholm Resilience Centre 2023, Nature 2024

6. **Ocean Acidification**
   - Indicator: Aragonite saturation state (Ω arag)
   - Safe threshold: Ω arag ≥2.75 (pre-industrial)
   - Current: Ω arag ~2.9 globally, <2.5 in some regions
   - Status: UNCERTAIN (regional breaches)
   - Reversibility: Reversible over 100-300 years with CO2 removal
   - Data source: IPCC AR6, NOAA Ocean Acidification Program

7. **Atmospheric Aerosol Loading**
   - Indicator: Particulate matter (PM2.5, μg/m³)
   - Safe threshold: <25 μg/m³ (regional)
   - Current: Varies by region (China ~40, India ~50, US ~8)
   - Status: BREACHED regionally (South Asia, East Asia)
   - Reversibility: Reversible within 1-5 years with emission controls
   - Data source: WHO Global Air Quality Database 2024

8. **Stratospheric Ozone Depletion**
   - Indicator: Dobson units (DU)
   - Safe threshold: <5% reduction from pre-industrial (~290 DU minimum)
   - Current: ~220-280 DU (Antarctic hole), recovering globally
   - Status: SAFE (recovering due to Montreal Protocol)
   - Reversibility: Reversible over 50-100 years (already recovering)
   - Data source: UNEP Ozone Secretariat 2024, WMO Ozone Assessment

9. **Novel Entities (Chemical Pollution, Plastics)**
   - Indicator: No global quantitative threshold yet defined
   - Current: 350,000+ chemicals in use, 200,000 not assessed
   - Status: BREACHED (qualitative, Persson et al. 2022)
   - Reversibility: Partially reversible over 50-200 years (persistent pollutants)
   - Data source: UNEP Chemicals and Pollution Action, Lancet Pollution & Health 2024

**Ecological Footprint (2 indicators):**

10. **Ecological Footprint per Capita**
    - Indicator: Global hectares per person (gha/capita)
    - Safe threshold: ≤1.5 gha/capita (sustainable within Earth's biocapacity)
    - Current: Global average ~2.7 gha/capita (1.8 Earths), high-income ~6-8 gha/capita
    - Data source: Global Footprint Network 2024 (188 countries)
    - **Uncertainty:** ±50% on carbon footprint component (largest component)

11. **Overshoot Ratio (Biocapacity / Footprint)**
    - Indicator: Ratio of available biocapacity to footprint
    - Safe threshold: Ratio ≥1.0 (within biocapacity)
    - Current: Global ratio ~0.56 (overshoot by 1.8x)
    - Data source: Global Footprint Network 2024

**Climate Stability (1-2 indicators):**

12. **National GHG Emissions per Capita**
    - Indicator: Tonnes CO2-equivalent per person per year
    - Safe threshold: <2 tCO2e/capita (Paris Agreement 1.5°C pathway)
    - Current: Global average ~6.5, high-income ~10-20, low-income <2
    - Data source: Climate Watch 2024 (World Resources Institute)

13. **ND-GAIN Climate Vulnerability Index** (optional)
    - Indicator: 0-100 scale (readiness - vulnerability)
    - Data source: Notre Dame Global Adaptation Initiative 2024
    - Coverage: 182 countries

**Key Research Claims to Validate:**
- Utopia threshold: All 9 planetary boundaries within safe operating space, footprint ≤1.5 gha/capita
- Dystopia threshold: 6+ boundaries breached (current reality)
- Countries meeting utopia: ZERO (all high-HDI countries overshoot ecological limits per research)
- **Impossibility problem:** No country achieves HDI ≥0.800 AND footprint ≤1.6 gha simultaneously (O'Neill et al. 2018)

**Historical Validation Target:**
- Norway 2024: Should score ~22/100 on Ecological paradigm (high overshoot despite wealth)
- Bhutan 2024: Should score ~85/100 (carbon negative, high forest cover, low footprint)
- Global average 2024: Should score ~30/100 (6/9 boundaries breached)

**CRITICAL SKEPTIC REQUIREMENT:**
- Include uncertainty bands for ALL planetary boundaries (typically ±50%)
- Specify which boundaries are reversible vs irreversible
- Acknowledge "zero countries in utopia" reality (are we measuring achievable or philosophical ideal?)

---

### PARADIGM 4: Indigenous/Communitarian (Harmony-Focused)

**Research Foundation:** `/research/paradigm_4_indigenous_communitarian_20251019.md`

**Core Value:** Community solidarity, cultural preservation, spiritual wellbeing, harmony

**CRITICAL CHALLENGE:** Limited data availability - only 1 country (Bhutan) has comprehensive measurement

**Expected Indicators (5-8 total):**

**Gross National Happiness (1 indicator - Bhutan only, HIGH confidence):**

1. **GNH Index (Bhutan-specific)**
   - Indicator: 0-1 scale, 9 domains, 33 sub-indicators
   - Definition: Comprehensive wellbeing measure beyond GDP (psychological wellbeing, health, education, time use, cultural diversity, good governance, community vitality, ecological diversity, living standards)
   - Threshold: ≥66% of domains sufficient = "happy" (Bhutan 2015: 43.4% deeply happy, 47.9% extensively happy)
   - Data source: Centre for Bhutan Studies & GNH Research, 2024 survey (if available, else 2015 baseline)
   - Coverage: Bhutan only (1 country out of 195)
   - Confidence: **HIGH** (direct measurement, rigorous methodology, 8,000+ respondents)
   - **Mark clearly:** DIRECT measurement (not proxy)

**Social Trust (1-2 indicators - Global proxy, MEDIUM confidence):**

2. **World Values Survey Social Trust**
   - Indicator: % of respondents answering "most people can be trusted"
   - Threshold: Utopia ≥60%, Dystopia <30% (research suggests <30% = low-trust society)
   - Data source: World Values Survey Wave 7 (2017-2022, ~80 countries)
   - Coverage: ~80 countries, irregular updates (waves every 5-7 years)
   - Confidence: **MEDIUM** (limited coverage, proxy for community solidarity, not direct harmony measure)
   - **Mark clearly:** PROXY for Indigenous paradigm values (social trust ≠ GNH, but correlated)

3. **Generalized Trust Index** (optional, if available from OECD or other source)
   - Indicator: 0-1 or 0-10 scale
   - Data source: OECD How's Life 2024 (if available for more countries than WVS)

**Social Capital (1 indicator - Global proxy, MEDIUM confidence):**

4. **OECD Social Capital Index**
   - Indicator: Composite measure of civic participation, community networks, institutional trust
   - Data source: OECD How's Life 2024
   - Coverage: 38 OECD countries only (limited to high-income)
   - Confidence: **MEDIUM** (limited coverage, OECD-centric, proxy not direct measurement)
   - **Mark clearly:** PROXY (Putnam social capital ≠ Indigenous communitarian values, but related)

**Cultural Diversity & Preservation (1-2 indicators - Global proxy, LOW confidence):**

5. **UNESCO Linguistic Diversity Index**
   - Indicator: Measure of linguistic diversity (e.g., Greenberg's diversity index)
   - Threshold: Higher = more cultural diversity preserved
   - Data source: UNESCO Atlas of the World's Languages in Danger 2024
   - Coverage: Global, but irregular updates
   - Confidence: **LOW** (proxy only - linguistic diversity ≠ cultural vitality, limited to language)
   - **Mark clearly:** PROXY (language diversity as proxy for cultural preservation)

6. **Indigenous Population %** (optional, if data available)
   - Indicator: % of population identifying as Indigenous
   - Data source: National censuses (where measured - limited countries)
   - Coverage: Very limited (maybe 30-50 countries collect this)
   - Confidence: **LOW** (extremely limited, definition varies)

**Community Belonging (1 indicator - Global proxy, MEDIUM confidence):**

7. **WVS Importance of Community**
   - Indicator: % of respondents rating "community" as very important in their lives
   - Data source: World Values Survey Wave 7
   - Coverage: ~80 countries
   - Confidence: **MEDIUM** (proxy, subjective self-report)
   - **Mark clearly:** PROXY (subjective importance ≠ actual community vitality)

**Meaningful Work (1 indicator - Global proxy, LOW confidence):**

8. **Job Satisfaction**
   - Indicator: Life satisfaction with work (0-10 scale or %)
   - Data source: Gallup World Poll, OECD Better Life Index
   - Coverage: Gallup ~140 countries, OECD 38 countries
   - Confidence: **LOW** (proxy, "bullshit jobs" concept hard to measure directly - Graeber 2018)
   - **Mark clearly:** PROXY (job satisfaction ≠ meaningful work, capitalism bias in measurement)

**Key Research Claims to Validate:**
- Utopia threshold: GNH ≥66% "happy", social trust >60%, cultural continuity preserved
- Dystopia threshold: Social trust <30%, cultural genocide, atomization
- Countries meeting utopia: ~1-2 (Bhutan, possibly Costa Rica per research)
- **Measurement void:** Only Bhutan has direct data, all others are proxies with LOW-MEDIUM confidence

**Historical Validation Target:**
- Bhutan 2024: Should score ~75/100 on Indigenous paradigm (HIGH confidence - direct GNH data)
- Norway 2024: Should score ~55/100 on Indigenous paradigm (MEDIUM confidence - WVS trust ~75%, OECD social capital high, but proxy indicators only)
- Most countries: Should score with LOW confidence flags (proxy indicators, missing GNH equivalent)

**CRITICAL SKEPTIC REQUIREMENT:**
- **Explicitly mark** which indicators are DIRECT (GNH for Bhutan) vs PROXY (all others)
- **Flag all non-Bhutan scores** as LOW-MEDIUM confidence
- **Acknowledge data limitations:** This paradigm is fundamentally under-measured globally
- **Future research need:** Call for GNH-equivalent indices to be developed for other countries

---

## Deliverable Structure

### File: `/research/paradigm_metric_mapping_20251019.md`

**Structure:**

```markdown
# Multi-Paradigm DUI Metric Mapping (Phase 2)

**Date:** 2025-10-19
**Phase:** 2 of 5 (Metric Mapping)
**Status:** COMPLETE

## Executive Summary

- **Total Indicators:** X (8-12 Western, 10-15 Development, 9-12 Ecological, 5-8 Indigenous)
- **Confidence Distribution:** Y% HIGH, Z% MEDIUM, W% LOW
- **Data Coverage:** ~195 countries for Western/Development, ~188 for Ecological, ~1-80 for Indigenous (varies)
- **Historical Validation:** Singapore, Norway, Bhutan scores computable

---

## PARADIGM 1: Western Liberal (Freedom-Focused)

### Indicator 1.1: V-Dem Electoral Democracy Index

- **Definition:** Expert-coded measure of electoral processes, freedom, fairness, and inclusiveness
- **Scale:** 0-1 (continuous)
- **Data Source:** V-Dem Institute 2024, https://v-dem.net/data/ (exact URL)
- **Coverage:** 202 countries (1789-2024 time series)
- **Update Frequency:** Annual
- **Confidence:** HIGH (expert surveys with confidence intervals, rigorous methodology, 200+ coders)
- **Utopia Threshold:** ≥0.80 (top 8 countries: Norway 0.92, Finland 0.90, Sweden 0.89, Denmark 0.88, Switzerland 0.87, Iceland 0.86, New Zealand 0.85, Luxembourg 0.84 [2023 data])
- **Dystopia Threshold:** <0.30 (authoritarianism: China 0.09, Russia 0.12, Saudi Arabia 0.05, North Korea 0.03, Eritrea 0.06 [2023 data])
- **Normalization:** Direct (already 0-1 scale) → multiply by 100 for 0-100 paradigm scale
- **Weight in Paradigm:** 1/10 = 10% (assuming 10 total Western Liberal indicators)
- **Research Citation:** "V-Dem Electoral Democracy Index measures the extent to which the ideal of electoral democracy is achieved. The index captures the extent to which leaders are elected under comprehensive voting franchise and the freedom to form and join organizations, freedom of expression, and alternative sources of information... Countries scoring ≥0.80 represent the democratic ideal as conceptualized by Western liberal philosophy (Rawls 1971, Dahl 1989)." (paradigm_1_western_liberal_20251019.md, lines 245-289)
- **Uncertainty:** Low (±0.02 on 0-1 scale, expert agreement >90%)
- **Utopia Examples (2023 data):**
  - Norway: 0.92 (92/100 paradigm score)
  - Finland: 0.90 (90/100)
  - Sweden: 0.89 (89/100)
  - Denmark: 0.88 (88/100)
  - Switzerland: 0.87 (87/100)
- **Dystopia Examples (2023 data):**
  - China: 0.09 (9/100 paradigm score)
  - Russia: 0.12 (12/100)
  - Saudi Arabia: 0.05 (5/100)
  - North Korea: 0.03 (3/100)
  - Eritrea: 0.06 (6/100)

[REPEAT FOR ALL 8-12 WESTERN LIBERAL INDICATORS]

---

## PARADIGM 2: Development Needs (Survival-Focused)

[REPEAT STRUCTURE FOR 10-15 DEVELOPMENT INDICATORS]

---

## PARADIGM 3: Ecological Harmony (Sustainability-Focused)

[REPEAT STRUCTURE FOR 9-12 ECOLOGICAL INDICATORS]
**SPECIAL NOTE:** Include uncertainty bands (±50%) for planetary boundaries

---

## PARADIGM 4: Indigenous/Communitarian (Harmony-Focused)

[REPEAT STRUCTURE FOR 5-8 INDIGENOUS INDICATORS]
**SPECIAL NOTE:** Mark DIRECT (GNH) vs PROXY (all others), flag LOW-MEDIUM confidence

---

## Aggregation Methodology

### Geometric Mean Formula (Within Paradigm)

[Mathematical specification]

### Normalization Approach

[Min-max scaling, historical worst/best goalposts]

### Handling Missing Data

[Decision tree: proxy → confidence downgrade → flag if unavailable]

---

## Validation Against Historical Cases

### Singapore Validation
- **Expected:** Development HIGH (~94), Western MEDIUM (~48)
- **Actual Indicators:** [compute using real 2024 data]
- **Match Research Prediction:** YES / NO

### Norway Validation
- **Expected:** Western HIGH (~95), Development HIGH (~96), Ecological LOW (~22)
- **Actual Indicators:** [compute]
- **Match Research Prediction:** YES / NO

### Bhutan Validation
- **Expected:** Indigenous HIGH (~75), Ecological HIGH (~85), Development MEDIUM (~67)
- **Actual Indicators:** [compute]
- **Match Research Prediction:** YES / NO

[REPEAT FOR CUBA, VENEZUELA IF DATA AVAILABLE]

---

## Confidence Summary

| Paradigm | Indicator Count | HIGH Conf | MED Conf | LOW Conf | Data Coverage |
|----------|----------------|-----------|----------|----------|---------------|
| Western | X | Y | Z | W | ~195 countries |
| Development | X | Y | Z | W | ~193 countries |
| Ecological | X | Y | Z | W | ~188 countries |
| Indigenous | X | Y | Z | W | ~1-80 countries (varies) |

---

## Implementation Readiness

[Assessment of whether indicators can be implemented in simulation with current data availability]

---

## Next Steps

1. **Phase 3:** Implementation Design (TypeScript state structure, aggregation functions)
2. **Phase 4:** Historical Validation (compute scores for 5 case study countries, validate against research predictions)
3. **Phase 5:** Integration (implement in simulation, Monte Carlo testing)

---

**Completion Criteria:**
- [ ] 5-15 indicators mapped per paradigm with complete specification
- [ ] All indicators have official data source URL (2024-2025)
- [ ] Research citations justify indicator selection (Phase 1 paradigm documents)
- [ ] Uncertainty bands included for uncertain indicators (ecological boundaries ±50%)
- [ ] Missing data strategy specified (proxy → confidence downgrade)
- [ ] Historical validation shows Singapore, Norway, Bhutan match research predictions

```

---

## Research Tips

**Finding Official Data:**
1. **V-Dem:** https://v-dem.net/data/ - download dataset CSV, check 2024 update
2. **Freedom House:** https://freedomhouse.org/report/freedom-world - 2024-2025 report
3. **UNDP HDI:** https://hdr.undp.org/data-center/human-development-index - HDR 2024
4. **OPHI MPI:** https://ophi.org.uk/multidimensional-poverty-index/ - 2024 global MPI
5. **Global Footprint Network:** https://data.footprintnetwork.org - 2024 National Footprint Accounts
6. **World Values Survey:** https://www.worldvaluessurvey.org/WVSContents.jsp - Wave 7 (2017-2022)
7. **OECD:** https://www.oecd.org/wise/better-life-initiative.htm - How's Life 2024
8. **WHO:** https://www.who.int/data/gho - Global Health Observatory
9. **World Bank:** https://data.worldbank.org/ - 2024 World Development Indicators

**Citation Style:**
- Use exact indicator name from source (e.g., "V-Dem Electoral Democracy Index" not "democracy score")
- Provide full URL to dataset (not just homepage)
- Specify year of data (2024, 2023, or most recent)
- If 2024 not available, note "2023 data (2024 update pending)"

---

## Expected Deliverable Timeline

**Hours 1-3:** Paradigm 1 (Western Liberal) - 8-12 indicators with full specification
**Hours 4-6:** Paradigm 2 (Development Needs) - 10-15 indicators with full specification
**Hours 7-8:** Paradigm 3 (Ecological Harmony) - 9-12 indicators with uncertainty bands
**Hours 9-10:** Paradigm 4 (Indigenous/Communitarian) - 5-8 indicators with proxy flags, historical validation, confidence summary

**Total:** 8-10 hours to produce comprehensive metric mapping document

---

**Handoff After Completion:**
- Post summary to research channel
- Flag document for research-skeptic validation
- Orchestrator will coordinate skeptic review before proceeding to Phase 3

---

**End of Brief**
