---
oldest_source: 2024
newest_source: 2025
last_verified: 2025-11-25
verification_status: CURRENT
topic: climate_tipping_points
subtopics:
  - coral_reef_collapse
  - ice_sheet_dynamics
  - amazon_dieback
  - amoc_circulation
  - permafrost_thaw
  - cascading_interactions
simulation_usage: HIGH
  - Planetary boundary modeling
  - Climate cascade thresholds
  - Tipping point probabilities
  - Crisis cascade triggers
confidence: HIGH
  - 160+ scientists, 87 institutions, 23 countries
  - Peer-reviewed in Earth System Dynamics (2025)
  - Stockholm Resilience Centre official release
---

# Global Tipping Points Report 2025: First Tipping Point Crossed

**Research Date:** November 25, 2025
**Researcher:** Autonomous Researcher
**Purpose:** Document the Global Tipping Points Report 2025, released November 2025 for COP30, confirming first climate tipping point crossed
**Status:** CURRENT - Major finding for simulation calibration

---

## Executive Summary

**Major Finding:** The Global Tipping Points Report 2025, authored by 160 scientists from 87 institutions across 23 countries, confirms that **warm-water coral reefs have passed their tipping point** - the first of Earth's climate tipping points to be crossed.

**Key Quantitative Findings:**
- **62% probability** of triggering climate tipping points under current policies (SSP2-4.5)
- **9 of 16 tipping points** have >50% individual triggering probability
- **Coral reef threshold:** Already exceeded at ~1.2C warming (current: ~1.4C)
- **99% of coral reefs** could be lost if warming exceeds 2C
- **Half of all reefs** will face unlivable conditions by 2035
- **Carbon feedback:** +0.22C median additional warming from Amazon/permafrost by 2300

**Critical Context for Simulation:**
1. First tipping point has been crossed - coral reefs are now in collapse phase
2. Ice sheet collapse (WAIS) may be underway with irreversible dynamics
3. Cascading interactions remain "modest" (3 percentage points amplification)
4. Permafrost thawing already in progress as of 2025

---

## 1. Coral Reef Tipping Point (FIRST CROSSED)

### 1.1 Threshold Status

**Thermal Tipping Point:** ~1.2C above pre-industrial
**Current Warming:** ~1.4C (already exceeded)
**Status:** CROSSED - collapse in progress

**Key Statistics:**
- >80% of world's coral reefs experienced worst global bleaching event on record (2023-2025)
- ~25% of all marine species depend on coral reefs
- ~500 million people depend on reefs for food, income, livelihoods
- ~1 billion people total dependent on reef ecosystems

### 1.2 Timeline Projections

| Metric | Timeline | Source |
|--------|----------|--------|
| Half of reefs face unlivable conditions | 2035 | GTP Report 2025 |
| 99% reef loss potential | If >2C warming | GTP Report 2025 |

**Implication:** Even if temperatures stabilize at 1.5C, reefs will likely continue to collapse. This is a committed, irreversible change.

### 1.3 Simulation Parameters

```typescript
// Coral reef tipping point
const CORAL_REEF_THRESHOLD = 1.2; // C above pre-industrial
const CORAL_CURRENT_STATUS = 'CROSSED'; // As of 2025
const CORAL_LOSS_AT_2C = 0.99; // 99% loss probability
const CORAL_HALF_COLLAPSE_YEAR = 2035; // Half face unlivable conditions

// Human dependency
const DIRECT_REEF_DEPENDENTS = 500_000_000; // 500 million
const TOTAL_REEF_DEPENDENTS = 1_000_000_000; // ~1 billion
```

---

## 2. Tipping Point Probabilities Under Current Policies

### 2.1 Aggregate Risk Assessment

**Under SSP2-4.5 (closest to current policies):**

| Metric | Value |
|--------|-------|
| Average triggering probability (all tipping points) | 62% |
| Tipping points with >50% probability | 9 of 16 |
| Under instantaneous triggering assumption | 64% |

### 2.2 Individual Tipping Point Probabilities (SSP2-4.5)

**High Probability (>90%):**
- PFAT (Permafrost abrupt thaw): >90%
- BARI (Barents Sea ice): >90%
- GRIS (Greenland ice sheet): >90%
- REEF (Coral reefs): >90%
- WAIS (West Antarctic ice sheet): >90%

**Moderate Probability (<50%):**
- AMOC (Atlantic circulation): <50%
- PFTP (Permafrost gradual): <50%
- TUND (Tundra): <50%
- AWSI (Arctic winter sea ice): <50%

**Low Probability (<10%):**
- EAIS (East Antarctic ice sheet): <10%

### 2.3 Scenario Comparison

| Scenario | Avg. Triggering Probability |
|----------|----------------------------|
| SSP1-1.9 (1.5C pathway) | ~20-30% |
| SSP1-2.6 (2C pathway) | ~35-40% |
| **SSP2-4.5 (current policies)** | **62%** |
| SSP3-7.0 (regional rivalry) | ~85% |
| SSP5-8.5 (fossil-fuel development) | ~95% |

**Source:** Wunderling et al. (2025), Earth System Dynamics

---

## 3. Ice Sheet Dynamics

### 3.1 Greenland Ice Sheet

**Current Status:**
- 29th consecutive year of net ice loss
- Rainfall recorded at summit (highest point) for first time in 2021
- Ice sheet ~2 miles thick

**Threshold Range:** Variable, but committed at >2C

### 3.2 West Antarctic Ice Sheet (WAIS)

**Current Status:**
- Collapse may already be underway (irreversible)
- Thwaites glacier (Washington-state sized) melting rapidly

**Sea Level Impact:**
| Component | Sea Level Rise |
|-----------|----------------|
| Thwaites glacier collapse | ~2 feet (0.6m) |
| Entire WAIS collapse | ~12 feet (3.7m) |

**Timeline:** Centuries to millennia ("Roman Empire" timeframe)

### 3.3 Simulation Parameters

```typescript
// Ice sheet thresholds
const WAIS_THRESHOLD_RANGE = { min: 1.5, max: 3.0 }; // C
const GRIS_COMMITTED_LOSS_THRESHOLD = 2.0; // C

// Sea level rise potential
const WAIS_SEA_LEVEL_RISE = 3.7; // meters (full collapse)
const THWAITES_SEA_LEVEL_RISE = 0.6; // meters

// Collapse timeline
const ICE_SHEET_COLLAPSE_CENTURIES = { min: 3, max: 10 }; // centuries
```

---

## 4. Carbon Cycle Feedbacks

### 4.1 Amazon-Permafrost Interactions

**Key Finding:** Carbon feedbacks provide "modest" amplification of warming.

**Quantitative Results (SSP2-4.5):**
- Median additional warming from carbon tipping elements: +0.22C by 2300
- Effect is "at least 1 order of magnitude lower" than anthropogenic warming
- Maximum amplification: 3 percentage points to triggering probabilities

### 4.2 Individual Carbon Element Probabilities (SSP2-4.5)

| Element | Triggering Probability |
|---------|----------------------|
| PFAT (Permafrost abrupt thaw) | 98% |
| AMAZ (Amazon dieback) | 53% |
| PFTP (Permafrost gradual) | 37% |

### 4.3 Methane Release

**Permafrost methane:** ~20% of carbon released as CH4 (potent short-term warmer)

---

## 5. Permafrost Status

**Current Status:** Thawing has "already begun" - no longer a future threat

**Key Observations:**
- Active layer deepening observed across Arctic
- Abrupt thaw events (thermokarst) increasing
- Infrastructure impacts in permafrost regions

---

## 6. Temperature Outlook

### 6.1 Current Trajectory

| Metric | Value |
|--------|-------|
| Current warming | ~1.3-1.4C |
| 1.5C exceedance | Within next decade |
| End-of-century under current policies | ~2.5C |

### 6.2 Implications

**1.5C target:** No longer plausible on current trajectory
**Locked-in changes:** Many tipping points committed even if 1.5C achieved

---

## 7. Cascading Risk Assessment

### 7.1 Interaction Dynamics

**Key Finding:** AMOC collapse would be catastrophic multiplier:
- Regulates temperature of Europe and North America
- Stabilizes almost half of other known tipping points
- Could trigger "extreme climate shifts beyond anything our societies have ever seen"

**AMOC Threshold:** Could fail at <2C of global warming

### 7.2 Cascade Potential

**Professor Nico Wunderling:** "There is even a risk of the tipping of one climate system potentially triggering or accelerating the tipping of others. This risk increases significantly once the 1.5°C threshold is exceeded."

---

## 8. Positive Tipping Points

### 8.1 Already Crossed (Good News)

Technologies that have crossed positive tipping points in leading markets:
- Solar PV
- Wind power
- Electric vehicles
- Battery storage
- Heat pumps

**Implication:** Some clean energy transitions are now self-reinforcing and unstoppable.

---

## 9. Simulation Integration

### 9.1 Key Parameters to Update

```typescript
// Update planetary boundary thresholds
const TIPPING_POINT_PROBABILITIES = {
  ssp245: {
    aggregate: 0.62,
    coralReefs: 0.90,
    westAntarctic: 0.90,
    greenland: 0.90,
    permafrost: 0.90,
    amazon: 0.53,
    amoc: 0.40,
  },
  ssp119: { aggregate: 0.25 },
  ssp585: { aggregate: 0.95 },
};

// First tipping point status
const CORAL_REEF_STATUS = {
  tippingPointCrossed: true,
  crossingYear: 2025,
  collapseInProgress: true,
  halfUnlivableYear: 2035,
};

// Carbon feedback modest amplification
const CARBON_FEEDBACK_WARMING = 0.22; // C by 2300
const TIPPING_PROBABILITY_AMPLIFICATION = 0.03; // 3 percentage points
```

### 9.2 Cascade Modeling

Priority cascades to model:
1. Coral reef collapse -> fishery collapse -> food security crisis
2. AMOC weakening -> European agriculture disruption
3. Permafrost thaw -> methane release -> accelerated warming
4. Amazon dieback -> carbon release + regional climate change

---

## 10. Citations

### Peer-Reviewed (2025)

1. **Wunderling, N., et al. (2025).** "High probability of triggering climate tipping points under current policies modestly amplified by Amazon dieback and permafrost thaw." *Earth System Dynamics*, 16, 565-XX.
   - DOI: [Not yet available]
   - URL: https://esd.copernicus.org/articles/16/565/2025/

2. **Lenton, T.M., et al. (2025).** "Global Tipping Points Report 2025." University of Exeter & Stockholm Resilience Centre.
   - URL: https://global-tipping-points.org/
   - 160 scientists, 87 institutions, 23 countries

### Authoritative Sources (2025)

3. **Stockholm Resilience Centre (2025).** "World reaches first climate tipping point - widespread mortality of coral reefs."
   - URL: https://www.stockholmresilience.org/research/research-stories/2025-10-13-world-reaches-first-climate-tipping-point---widespread-mortality-of-coral-reefs.html

4. **NPR (2025).** "3 massive changes you'll see as the climate careens toward tipping points." November 19, 2025.
   - URL: https://www.npr.org/2025/11/19/nx-s1-5593087/climate-tipping-points-cop30-brazil-coral-glaciers-carbon

5. **Climate-ADAPT (2025).** "The Global Tipping Points Report 2025."
   - URL: https://climate-adapt.eea.europa.eu/en/news-archive/the-global-tipping-points-report-2025

---

## Changelog

**2025-11-25:** Initial research compilation. Synthesized Global Tipping Points Report 2025, Wunderling et al. 2025 (Earth System Dynamics), Stockholm Resilience Centre updates, and NPR coverage. Key finding: coral reefs confirmed as first crossed tipping point with 62% aggregate probability under current policies.
