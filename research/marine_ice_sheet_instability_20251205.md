# Marine Ice Sheet Instability: Abrupt Sea Level Rise

**Research Date:** December 5, 2025
**Purpose:** Parameter extraction for M-4 implementation
**Reviewer:** Pending research-skeptic validation

## Executive Summary

Marine ice sheet instability (MICI) in West Antarctic Ice Sheet (WAIS) and Greenland represents a tail risk for abrupt multi-meter sea level rise events. Recent research (2024-2025) has revised earlier projections downward but confirms the mechanism remains plausible under high-warming scenarios.

## Key Findings

### 1. Marine Ice Sheet Instability Mechanisms

**DeConto & Pollard (2016) - Foundational Study**

- **Citation:** DeConto, R. M., & Pollard, D. (2016). Contribution of Antarctica to past and future sea-level rise. Nature, 531(7742), 591-597.
- **Mechanism:** Coupling of atmospheric warming with hydrofracturing of buttressing ice shelves and structural collapse of marine-terminating ice cliffs
- **Original Projection:** Antarctica could contribute >1m sea level rise by 2100, >15m by 2500 under unabated emissions
- **MICI Threshold:** Ice cliffs taller than 90 meters become unstable and collapse, exposing ever-thicker ice in chain reaction
- **Status:** Described as likely "overestimate" by subsequent research

**2021 Revision (DeConto et al.)**

- **Revised Estimate:** <40cm sea level rise by 2100 under high-emission scenarios (down from >1m)
- **Reason:** Additional factors incorporated into simulations
- **Implication:** Original projections were too aggressive, but mechanism remains valid

**Edwards et al. (2019) - Calibration & Uncertainty**

- **Citation:** Edwards, T. L., Brandon, M. A., Durand, G., Edwards, N. R., Golledge, N. R., Holden, P. B., Nias, I. J., Payne, A. J., Ritz, C., & Wernecke, A. (2019). Revisiting Antarctic ice loss due to marine ice-cliff instability. Nature, 566(7742), 58-64.
- **Method:** Gaussian process emulation of DeConto & Pollard (2016) model
- **Probabilistic Projections (2100):**
  - RCP 2.6: 4% probability of exceeding 0.5m
  - RCP 8.5: 71% probability of exceeding 0.5m (with MICI)
- **Uncertainty:** MICI hypothesis "not well constrained" - confidence requires more observationally constrained models

### 2. Trigger Conditions

**Temperature Thresholds**

- **Irreversible WAIS Loss:** Between 1.5°C and 2.0°C above pre-industrial (applies to both WAIS and Greenland)
- **Source:** Multiple studies via Carbon Brief guest post
- **Implication:** Already in danger zone with current ~1.2-1.3°C warming

**Ocean Warming**

- **Mechanism:** Subsurface ocean warming drives ice shelf basal melt
- **Critical:** Warm water intrusion under ice shelves weakens buttressing
- **Timescale:** Multi-decadal to century-scale process

**Atmospheric CO2**

- **Threshold:** Consistent with 1.5-2.0°C warming threshold
- **Approximate:** ~450-500 ppm CO2 sustained concentrations
- **Current:** ~420 ppm (2024)

### 3. Magnitude of Abrupt Events

**2024-2025 Consensus Projections**

- **Most Likely (2100):** +11cm from Antarctica (modal estimate)
- **MICI Addition:** Tens of centimeters additional (not hundreds)
- **High-End (2100):** Up to 0.5m (50cm) in worst-case scenarios with MICI
- **Long-Term (2300):** Up to 8m possible from Antarctic contribution alone
- **Combined (2100):** Up to 2m from all sources (Antarctica + Greenland + glaciers + thermal expansion) under unabated emissions
- **Combined (2300):** 15m under unabated emissions

**2024 MICI Re-Assessment**

- **Finding:** WAIS may NOT be vulnerable to rapid MICI during 21st century
- **Source:** Science Advances study (August 2024)
- **Specific:** Thwaites Glacier unlikely to rapidly collapse via MICI in 21st century
- **Implication:** Tail risk, not central projection

**Abrupt Event Characteristics**

- **Not "instant":** Multi-decadal unfolding (decades to century)
- **Irreversible:** Once triggered, cannot be stopped on human timescales
- **Non-linear:** Accelerating contribution over time
- **Regional Variation:** WAIS more vulnerable than East Antarctic Ice Sheet (EAIS)

### 4. Timescales

**Trigger to Collapse**

- **Initial Response:** Decades after temperature threshold crossed
- **Full Collapse:** Centuries to millennia
- **Acceleration Phase:** Once begun, rate increases non-linearly
- **21st Century:** Unlikely to see full MICI cascade (per 2024 research)
- **Post-2100:** Risk increases substantially in 22nd-23rd centuries

**Reversibility**

- **Effectively Irreversible:** Ice sheet collapse cannot be reversed on human timescales
- **Tipping Point:** Once crossed, feedback loops sustain collapse even if temperatures decrease
- **Hysteresis:** Requires much colder temperatures to re-grow ice sheets than were needed to melt them

### 5. Cascading Impacts

**Population Displacement**

- **United States:** Up to 13 million displaced from coastal communities (40% of population lives coastal)
- **Bangladesh:** 0.9-2.1 million displaced by 2050
- **East Africa:** 750,000+ displaced 2020-2050
- **Global:** Hundreds of millions at risk by 2100 under high scenarios

**Infrastructure Damage**

- **Affected:** Roads, bridges, sewage systems, power plants
- **Mechanisms:** Flooding, coastal erosion, saltwater intrusion
- **Example:** Hurricane Sandy (2012) - 90,000 buildings, 2M without power, $19B damage in NYC alone
- **Compounding:** Repeated events degrade infrastructure over time

**Economic Costs**

- **Asia (Direct Damages):**
  - 0.47m rise: $167.6B
  - 1.12m rise: $272.3B
  - 1.75m rise: $338.1B
- **Africa (12 Major Cities by 2050):**
  - RCP4.5: $65B cumulative
  - RCP8.5: $86.5-137.5B cumulative
- **Indirect Costs:** Tourism collapse, fisheries disruption, agricultural losses

**Agricultural Impacts**

- **Coastal Farmland Loss:** Saltwater intrusion destroys soil fertility
- **Food Security:** Coastal deltas (major agricultural regions) at highest risk
- **Examples:** Nile Delta, Mekong Delta, Ganges-Brahmaputra Delta

## Parameter Recommendations for Simulation

### Trigger Conditions (for implementation)

```typescript
// Temperature threshold for MICI activation
MICI_TRIGGER_TEMP: 1.75°C above pre-industrial (midpoint of 1.5-2.0°C range)

// Probability function (increases with temperature)
MICI_probability = {
  temp < 1.5°C: 0.001 (background risk)
  temp 1.5-2.0°C: 0.01-0.05 (emerging risk)
  temp 2.0-3.0°C: 0.05-0.20 (moderate risk)
  temp > 3.0°C: 0.20-0.40 (high risk, but capped due to 21st century timing)
}

// Time-dependent modifier (risk increases post-2100)
MICI_time_modifier = {
  pre-2100: 0.5x (early warning phase)
  2100-2200: 1.0x (standard risk)
  post-2200: 2.0x (accelerated risk)
}
```

### Magnitude of Events

```typescript
// Sea level rise per triggered event (meters)
MICI_sea_level_rise = {
  initial_event: 0.1-0.3m (conservative, per decade)
  sustained_collapse: 0.5-1.0m cumulative by 2100 (if triggered early)
  long_term: 3-8m by 2300 (full WAIS contribution)
}

// Unfolding timescale
MICI_duration = {
  onset_to_acceleration: 20-50 years
  acceleration_to_plateau: 50-150 years
  total_collapse: 200-500 years
}
```

### Impact Multipliers

```typescript
// Coastal population displacement per meter of sea level rise
displacement_per_meter = {
  immediate_relocation: 100-200 million people/meter (global)
  multi-decade_adaptation: 50-100 million people/meter (with infrastructure)
}

// Infrastructure damage (% of coastal GDP)
infrastructure_damage_pct = {
  0.5m rise: 2-5% coastal GDP
  1.0m rise: 5-10% coastal GDP
  2.0m rise: 10-20% coastal GDP
}

// Agricultural losses (% of coastal agricultural production)
agricultural_loss_pct = {
  0.5m rise: 5-15% coastal farmland
  1.0m rise: 15-30% coastal farmland
  2.0m rise: 30-50% coastal farmland
}
```

## Uncertainty Ranges

- **Trigger Temperature:** ±0.5°C (1.5-2.0°C range well-supported)
- **21st Century Magnitude:** Factor of 5 uncertainty (10cm to 50cm)
- **22nd Century Magnitude:** Factor of 10 uncertainty (0.5m to 5m)
- **Economic Costs:** Factor of 2-3 uncertainty (regional variation, adaptation)

## Implementation Considerations

### For Simulation Design

1. **Stochastic Trigger:** Use temperature-dependent probability function, not deterministic threshold
2. **Multi-Phase Cascade:** Model onset → acceleration → plateau phases separately
3. **Regional Variation:** WAIS more vulnerable than EAIS; Greenland separate dynamics
4. **Irreversibility:** Once triggered, no mechanism should reverse it
5. **Compounding:** Each additional 0.5m compounds displacement/damage non-linearly

### Timing Considerations

- **Early Game (2025-2050):** Background risk only (<1% per year)
- **Mid Game (2050-2100):** Risk emerges if 2°C+ crossed (1-10% per year depending on temp)
- **Late Game (2100-2200):** Primary risk window (5-20% per year if conditions met)
- **End Game (2200+):** Near-certain if sustained high temperatures

### Integration Points

1. **Climate System Phase:** Temperature tracking, trigger evaluation
2. **Population Phase:** Coastal displacement, migration pressures
3. **Infrastructure Phase:** Damage cascades, adaptation costs
4. **Agriculture Phase:** Coastal farmland losses
5. **Economic Phase:** GDP shocks, reconstruction costs
6. **QoL Phase:** Reduced habitability in coastal regions

## Research Quality Assessment

**Strengths:**
- Foundational papers (DeConto & Pollard 2016, Edwards et al. 2019) highly cited
- 2024-2025 updates provide recent re-assessment
- Multiple independent modeling approaches converge
- Physical mechanisms well-understood (hydrofracturing, cliff instability)

**Weaknesses:**
- MICI mechanism "not well constrained" (Edwards et al. 2019)
- 2024 study suggests 21st century MICI unlikely, but doesn't rule out 22nd century
- Large uncertainty in timing (decades vs centuries)
- Regional models show high variance in projections
- Economic impact estimates vary widely by region and adaptation assumptions

**Confidence Levels:**
- Temperature trigger (1.5-2.0°C): HIGH confidence
- MICI mechanism existence: MEDIUM confidence
- 21st century magnitude: MEDIUM confidence (10-50cm range)
- 22nd-23rd century magnitude: LOW confidence (0.5-8m range)
- Economic/social impacts: MEDIUM confidence (order of magnitude)

## Recommended Reading (Full Citations)

1. DeConto & Pollard (2016) - Nature 531:591-597
2. Edwards et al. (2019) - Nature 566:58-64
3. Bassis et al. (2021) - on MICI critique
4. Science Advances (Aug 2024) - "WAIS may not be vulnerable to MICI during 21st century"
5. IPCC AR6 WG1 Chapter 9 (Sea Level Rise)

## Sources

- [Contribution of Antarctica to past and future sea-level rise - Nature](https://www.nature.com/articles/nature17145)
- [The West Antarctic Ice Sheet may not be vulnerable to marine ice cliff instability during the 21st century - Science Advances](https://www.science.org/doi/10.1126/sciadv.ado7794)
- [Studies shed new light on Antarctica's future contribution to sea level rise - Carbon Brief](https://www.carbonbrief.org/studies-shed-new-light-on-antarcticas-future-contribution-to-sea-level-rise/)
- [Contribution of Antarctica to past and future sea-level rise - PubMed](https://pubmed.ncbi.nlm.nih.gov/27029274/)
- [Antarctica in 2025: Drivers of deep uncertainty in projected ice loss - Science](https://www.science.org/doi/10.1126/science.adt9619)
- [Study Finds Highest Prediction of Sea-Level Rise Unlikely - Dartmouth](https://home.dartmouth.edu/news/2024/08/study-finds-highest-prediction-sea-level-rise-unlikely)
- [How Soon Will the Seas Rise? - Quanta Magazine](https://www.quantamagazine.org/how-soon-will-the-seas-rise-20251020/)
- [Guest post: How close is the West Antarctic ice sheet to a 'tipping point'? - Carbon Brief](https://www.carbonbrief.org/guest-post-how-close-is-the-west-antarctic-ice-sheet-to-a-tipping-point/)
- [Sea level rise is a global threat - World Economic Forum](https://www.weforum.org/stories/2025/03/rising-sea-levels-global-threat/)
- [Impacts of sea level rise and adaptation across Asia and the Pacific - Scientific Reports](https://www.nature.com/articles/s41598-025-11517-6)
- [Migration, land loss and costs to 2100 due to coastal flooding - Frontiers in Marine Science](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2025.1505633/full)
- [Coastal communities face 'catastrophic flooding' from rising sea levels - Al Jazeera](https://www.aljazeera.com/news/2024/9/28/coastal-communities-face-catastrophic-flooding-from-rising-sea-levels)
