# Climate Hysteresis and Irreversibility After Tipping Point Crossings

**Research Date:** December 5, 2025
**Researcher:** Cynthia (Super-Alignment Researcher)
**Purpose:** Extract quantitative parameters for M-7 roadmap implementation - climate state reversibility after tipping point crossings

## Executive Summary

Climate hysteresis refers to the phenomenon where Earth systems cannot return to their original state even when forcing (temperature, CO2) is reduced to previous levels. Recent 2024-2025 research reveals **substantial irreversibility** across multiple climate subsystems after crossing critical thresholds, with recovery requiring cooling **far below** the threshold temperature, or in some cases, being impossible on human timescales (centuries to millennia).

**Key Finding for Simulation:** Once tipping points are crossed (AMOC collapse, ice sheet disintegration, Amazon dieback), **reversal requires cooling 0.5-1.5°C BELOW the crossing threshold**, and even then, recovery takes **decades to centuries** for fast systems and is **effectively impossible** (>1000 years) for slow systems like ice sheets and deep ocean warming.

## 1. AMOC (Atlantic Meridional Overturning Circulation)

### Tipping Point Thresholds
- **Collapse threshold:** Freshwater forcing FH ≈ 0.525 Sv (Sverdrup units)
- **Current strength:** ~20 Sv in stable state
- **Hysteresis width:** ~0.4 Sv between collapse point (S1) and recovery point (S2)

### Physical Mechanisms of Hysteresis
- **Freshwater feedback loop:** Melting glaciers → reduced salinity → weaker AMOC → less heat transport north → more ice → more freshwater
- **Sea ice distribution effect:** North Atlantic sea ice distribution prevents recovery even when freshwater forcing is removed
- **Salinity stabilization requirement:** North Atlantic requires gradual salinification over 20+ years before AMOC can restart

### Time Asymmetry (Critical for Simulation)
- **Collapse rate:** Slow weakening over decades, then rapid collapse within ~1 century once threshold crossed
- **Recovery rate:** ~6× FASTER than collapse (counter-intuitive but well-documented)
- **Recovery timeline:** 20+ years of gradual North Atlantic salinification required before restart possible

### Recovery Conditions
- **Threshold asymmetry:** Recovery requires freshwater forcing reduction to ~0.125 Sv (well below collapse threshold of 0.525 Sv)
- **State dependency:** Recovery depends heavily on North Atlantic sea ice state during collapsed regime
- **Noise sensitivity:** Internal climate variability significantly affects both collapse timing and recovery timing

**Simulation Parameters:**
- Collapse threshold: 0.525 Sv freshwater forcing
- Recovery threshold: 0.125 Sv freshwater forcing (hysteresis margin = 0.4 Sv)
- Collapse timescale: 50-100 years after threshold crossing
- Recovery timescale: 20-30 years after conditions met (but 6× faster rate than collapse)

**Sources:**
- [Noise-shaped hysteresis cycles of the AMOC under increasing CO2 forcing](https://pubs.aip.org/aip/cha/article/35/2/023167/3337514)
- [Asymmetry of AMOC Hysteresis in a State‐Of‐The‐Art Global Climate Model](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2023GL106088)
- [Physics of AMOC multistable regime shifts due to freshwater biases in an EMIC](https://esd.copernicus.org/articles/16/1221/2025/)

---

## 2. Greenland Ice Sheet

### Critical Temperature Thresholds
- **Conservative estimate:** +1.7°C to +2.3°C above pre-industrial
- **Recent broader range:** +1.5°C to +3.4°C (higher threshold from latest modeling)
- **Consensus range for simulation:** +2.0°C ± 0.5°C

### Hysteresis Magnitude
- **Recovery requirement:** Temperatures must drop **well below pre-industrial levels** to restore ice sheet to current volume
- **State dependency:** Ice-albedo feedback creates strong positive feedback once melting begins
- **Irreversibility window:** If ice sheet fully melts, recovery requires cooling to pre-industrial minus several degrees

### Temperature Overshoot Studies (2023-2024)
- **Overshoot allowance:** Temporary exceedance of +2°C threshold CAN be reversed if cooling occurs within decades
- **Critical overshoot duration:** Models show reversibility if temperatures return below +1.5°C within 50-100 years
- **Point of no return:** Sustained warming >+2.5°C for >100 years likely commits to full deglaciation (multi-millennial timescale)

### Physical Mechanisms
- **Ice-albedo feedback:** Less ice → lower albedo → more absorption → more melting (positive feedback)
- **Elevation-mass balance feedback:** Surface lowering → warmer air at lower elevation → accelerated melting
- **Ocean thermal forcing:** Warmer ocean currents undercut ice shelves, accelerating calving
- **Topography effects:** Bedrock depression below sea level in central Greenland creates instability

### Recovery Timescales
- **Fast response (overshoot scenario):** 50-100 years if cooling is rapid and sustained
- **Slow response (committed melting):** 1,000-10,000 years for full deglaciation once committed
- **Regrowth after full melt:** 10,000-100,000 years (glacial cycle timescales)

**Simulation Parameters:**
- Tipping threshold: +2.0°C global mean temperature
- Hysteresis margin: -1.0°C to -2.0°C (recovery requires pre-industrial or below)
- Committed melting timescale: 1,000+ years
- Overshoot reversibility window: 50-100 years at <+1.5°C
- Sea level contribution: 7 meters over millennia (irreversible on <1000 year timescale)

**Sources:**
- [Overshooting the critical threshold for the Greenland ice sheet](https://www.nature.com/articles/s41586-023-06503-9)
- [Multistability and critical thresholds of the Greenland ice sheet](https://www.nature.com/articles/nclimate1449)

---

## 3. Amazon Rainforest Dieback

### Temperature and Precipitation Thresholds
- **Temperature threshold:** Local surface air temperature >32.2°C ± 4.8°C triggers dieback
- **Precipitation threshold:** <1,394 mm/year (regional average)
- **Critical precipitation for existence:** <1,000 mm/year (rainforest cannot exist)
- **Abrupt transition range:** <1,800 mm/year (rainforest → savanna transitions possible)

### Global Temperature Context
- **Safe boundary:** +1.5°C global warming (high confidence)
- **Increased risk:** +2.0°C global warming (significant dieback risk)
- **High risk:** +3.0°C+ global warming (widespread dieback likely)

### Alternative Stable States (Hysteresis Evidence)
Four documented alternative states demonstrate hysteresis:
1. **Closed-canopy primary rainforest** (current state, high precipitation regime)
2. **Closed-canopy seasonally dry tropical forest** (intermediate state)
3. **Native savanna state** (low precipitation regime, fire-adapted)
4. **Open-canopy degraded state** (disturbed, low resilience)
5. **Closed-canopy secondary forest** (recovering from disturbance)

### Physical Mechanisms of Irreversibility
- **Precipitation recycling feedback:** Trees → evapotranspiration → regional precipitation → more trees (positive feedback when intact; negative when degraded)
- **Fire regime shift:** Degraded forest → more flammable → more fire → further degradation
- **Soil degradation:** Rainforest soil loses organic matter and nutrients after conversion → cannot support forest regrowth
- **Regional climate modification:** Large-scale forest loss → reduced regional rainfall → prevents forest recovery

### Time Asymmetry
- **Dieback rate:** Decades (accelerating with compounding stressors: drought, fire, deforestation)
- **Recovery rate (if possible):** Centuries to millennia for primary rainforest characteristics
- **Point of no return:** Once regional precipitation falls below critical threshold, recovery impossible without external intervention

### Recovery Conditions
- **Regional precipitation restoration:** Requires >1,800 mm/year for forest to regenerate
- **Fire suppression:** Must prevent fire regime from stabilizing in degraded state
- **Soil recovery:** Centuries-long process for soil organic matter and nutrient restoration
- **Climate cooling:** May not be sufficient if regional precipitation feedback is broken

### 2024 Projections
- **By 2050:** 10-47% of Amazon exposed to "compounding disturbances" (drought, fire, deforestation)
- **Current stress levels:** "Unprecedented" stress in up to 50% of Amazon, approaching tipping point
- **Dieback onset:** Within 21st century under high-emission scenarios

**Simulation Parameters:**
- Global temperature threshold: +1.5°C (safe) to +2.0°C (significant risk)
- Local temperature threshold: 32.2°C ± 4.8°C
- Precipitation threshold: 1,394 mm/year (critical), 1,000 mm/year (existence limit)
- Dieback timescale: 30-50 years after threshold crossing (accelerating)
- Recovery timescale: Effectively impossible if regional precipitation feedback breaks (>1000 years)
- Hysteresis margin: Requires cooling to well below +1.5°C AND cessation of deforestation AND fire suppression

**Sources:**
- [Critical transitions in the Amazon forest system](https://www.nature.com/articles/s41586-023-06970-0)
- [Amazon dieback beyond the 21st century](https://www.nature.com/articles/s43247-025-02606-5)
- [Global Tipping Points Report 2023 - Amazon dieback](https://report-2023.global-tipping-points.org/section2/2-tipping-point-impacts/2-2-assessing-impacts-of-earth-system-tipping-points-on-human-societies/2-2-3-impacts-of-biosphere-tipping-points/2-2-3-1-amazon-dieback/)

---

## 4. Permafrost Carbon Feedback

### Temperature Thresholds for Thaw
- **50% near-surface permafrost affected:** +1.5°C to +2.0°C global warming
- **90% near-surface permafrost affected:** +3.0°C to +5.0°C global warming
- **Prevention potential:** Limiting to +1.5°C (instead of +2.0°C) prevents ~2 million km² of thaw

### Global vs. Local Tipping Point Status
- **Global tipping point:** Unlikely by end of 21st century (gradual process, not abrupt)
- **Local tipping points:** Abrupt collapse events (thermokarst, thermo-erosion) occur at local scale
- **Regional variability:** Different regions thaw at different rates and warming levels (not globally synchronized)

### Irreversibility of Carbon Loss
- **Key finding:** **Carbon loss is irreversible** even if temperatures stabilize or cool
- **Mechanism:** Once organic carbon decomposes to CO2/CH4, it cannot be refrozen or recaptured on human timescales
- **Continuation after stabilization:** Decomposition continues even if global temperatures stabilize (centuries-long process)

### Physical Mechanisms
- **Thermal inertia:** Permafrost takes centuries to equilibrate with surface temperatures
- **Decomposition kinetics:** Thawed organic matter continues decomposing regardless of air temperature
- **Irreversible soil structure changes:** Thermokarst (ground collapse) creates permanent landscape changes
- **Methane release:** Anaerobic decomposition in saturated soils produces CH4 (25× more potent than CO2 over 100 years)

### Feedback Factor and Carbon Budget Impact
- **Feedback factor:** 0.064 to 0.069°C per °C of warming (by 2300)
- **Carbon budget reduction:** Permafrost emissions reduce remaining 1.5°C and 2.0°C budgets by **20-22%**
- **Implication:** Stronger fossil fuel reductions needed to compensate for permafrost emissions

### Recovery Timescales
- **Permafrost re-establishment:** Centuries to millennia after cooling (if cooling occurs)
- **Carbon recapture:** Not possible on <1000 year timescale (decomposed carbon remains in atmosphere)
- **Ecosystem recovery:** High-latitude ecosystems take several centuries to adjust even to +1.5°C stabilization

### Temperature Overshoot Effects
- **Overshoot consequences:** Temperature overshoot leads to additional permafrost carbon emissions that are **not reversible** even if temperatures subsequently decline
- **Legacy effects:** Multi-century to millennial-scale legacy of temperature overshoot on permafrost carbon

**Simulation Parameters:**
- Thaw threshold (50%): +1.5°C to +2.0°C
- Thaw threshold (90%): +3.0°C to +5.0°C
- Carbon release: Gradual over decades to centuries (not abrupt pulse)
- Irreversibility: 100% of released carbon (no recapture on <1000 year timescale)
- Feedback factor: 0.064-0.069°C/°C
- Recovery timescale: Centuries to millennia for permafrost re-establishment; never for carbon recapture
- Hysteresis: No global hysteresis (gradual process), but local thermokarst events are irreversible

**Sources:**
- [Permafrost response and feedback under temperature stabilization and overshoot](https://esd.copernicus.org/articles/16/1809/2025/)
- [Permafrost Thaw Impact on Remaining Carbon Budgets](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2024EF005153)
- [Permafrost vulnerability to climate change](https://iopscience.iop.org/article/10.1088/1748-9326/adfc7e)

---

## 5. Ocean Thermal Inertia and Sea Level Commitment

### Thermal Inertia Timescales
- **Surface ocean equilibration:** Decades (10-50 years)
- **Deep ocean equilibration:** Centuries to millennia (100-1000+ years)
- **Sea level rise from thermal expansion:** Continues for centuries after surface temperature stabilization

### Quantitative Persistence After Emissions Cease
Warming persistence 100 years after emissions stop:
- **N2O:** 71% of peak warming persists
- **HCs (halocarbons):** 41% of peak warming persists
- **CH4:** 13% of peak warming persists
- **CO2:** Nearly 100% persists for 1,000+ years (atmospheric lifetime + ocean inertia)

### Physical Mechanisms of Irreversibility
- **Heat diffusion lag:** Ocean absorbs heat much slower than atmosphere warms → continues uptake for centuries
- **Thermal expansion:** Deep ocean warming causes volumetric expansion → sea level rise
- **Vertical mixing timescale:** Deep ocean circulation takes ~1000 years for full mixing cycle
- **Heat capacity:** Ocean heat capacity >>>>> atmospheric heat capacity (ratio ~1000:1)

### Sea Level Rise Commitment
- **Short-lived GHG contribution:** Even methane (12-year atmospheric lifetime) contributes to thermal expansion for centuries
- **Locked-in rise:** Actions taken today to reduce emissions only prevent additional FUTURE sea level rise
- **Mitigation potential:** Reducing short-lived GHG emissions could prevent centuries of additional sea-level rise
- **Current commitment:** Even achieving net-zero by 2050, sea level rise continues from ocean thermal inertia

### Irreversibility Assessment
- **Atmospheric cooling:** Possible within decades if CO2 is removed and other GHGs reduced
- **Surface ocean cooling:** Possible within decades to century
- **Deep ocean warming:** **Effectively irreversible** on <1000 year timescale
- **Sea level rise (thermal component):** **Effectively irreversible** on <1000 year timescale

**Simulation Parameters:**
- Surface ocean equilibration time: 20-50 years
- Deep ocean equilibration time: 500-1000+ years
- Warming persistence (100 years post-emissions): 71% (N2O), 41% (HCs), 13% (CH4), ~100% (CO2)
- Sea level commitment: Continues for 500+ years after temperature stabilization
- Reversibility: Surface ocean reversible (decades), deep ocean irreversible (<1000 years)
- Hysteresis: Strong hysteresis due to thermal inertia (cooling requires sustained negative forcing for centuries)

**Sources:**
- [Centuries of thermal sea-level rise due to short-lived greenhouse gases](https://www.pnas.org/doi/10.1073/pnas.1612066114)
- [Ocean thermal inertia and climate commitment](https://www.eurekalert.org/news-releases/955442)

---

## 6. Carbon Dioxide Removal (CDR) and Climate Recovery

### Recovery Timescales by Variable
- **Surface temperature:** Decades to stabilize, decades to cool with sustained CDR
- **Precipitation patterns:** Decades to centuries (some evidence of reversibility, some hysteresis)
- **Ocean oxygen (surface):** Decades to centuries for substantial recovery
- **Ocean oxygen (deep):** Centuries to millennia (depth-dependent)
- **Permafrost:** Decades to reverse decline, centuries to halt completely
- **Sea level rise:** Centuries to halt, millennia to reverse

### CDR Storage Duration Requirements
CDR methods categorized by permanence:
- **Decades to centuries:** Afforestation, soil carbon, ocean fertilization (temporary reservoirs)
- **Centuries to millennia:** Biochar, enhanced weathering (semi-permanent)
- **1000+ years:** Geologic storage (dissolved CO2, solid carbonates in deep sediments) - effectively permanent

### Critical 2024 Finding on CDR Durability
- **Insufficient storage (<1000 years):** NOT adequate to neutralize fossil CO2 emissions in net-zero framework
- **Required permanence:** CDR must store carbon for 1000+ years to truly offset fossil emissions
- **Temporary CDR limitations:** Forest-based CDR returns CO2 when trees die or burn

### Net Negative Emissions Scenario
- **Theoretical possibility:** CDR at scale could achieve net negative emissions (Earth absorbing more CO2 than emitting)
- **Cooling rate:** Gradual planetary cooling over many decades to centuries
- **First net-negative in centuries:** Would be first time since pre-industrial era

### Reversibility vs. Irreversibility Summary
**Reversible on human timescales (decades to centuries):**
- Surface temperature (with aggressive CDR)
- Atmospheric CO2 concentration (with massive CDR)
- Surface ocean properties (temperature, pH, oxygen)
- Some precipitation patterns

**Irreversible or very slow recovery (centuries to millennia):**
- Deep ocean warming
- Sea level rise (thermal expansion)
- Ice sheet loss (Greenland, West Antarctica)
- Ecosystem state changes (Amazon dieback, coral reef loss)
- Permafrost carbon release

**Effectively permanent (>10,000 years):**
- Full ice sheet collapse and regrowth
- Complete ecosystem transformation
- Ocean acidification effects on carbonate sediments

**Simulation Parameters:**
- Surface temperature recovery: 30-50 years per 0.5°C cooling (with aggressive CDR)
- Ocean surface recovery: 50-100 years
- Deep ocean recovery: 500-1000+ years (effectively irreversible)
- CDR permanence requirement: 1000+ years for true offsetting
- Net-negative emissions cooling rate: 0.1-0.2°C per decade (maximum plausible CDR scale)
- Reversibility threshold: Some systems reversible if action within 50-100 years; others irreversible once crossed

**Sources:**
- [Degrees of reversibility of ocean deoxygenation](https://iopscience.iop.org/article/10.1088/1748-9326/ade900)
- [Durability of carbon dioxide removal is critical](https://www.nature.com/articles/s43247-024-01808-7)
- [Carbon dioxide removal won't reverse climate change](https://www.nhm.ac.uk/discover/news/2024/october/carbon-dioxide-removal-will-not-reverse-climate-change.html)

---

## 7. Cross-System Summary: Hysteresis Margins and Recovery Requirements

| System | Tipping Threshold | Recovery Threshold | Hysteresis Margin | Recovery Timescale |
|--------|-------------------|-------------------|-------------------|-------------------|
| **AMOC** | 0.525 Sv freshwater | 0.125 Sv freshwater | 0.4 Sv | 20-30 years (after conditions met) |
| **Greenland Ice** | +2.0°C ± 0.5°C | Pre-industrial or below | 1.0-2.0°C | 50-100 years (overshoot) / 1,000+ years (committed) |
| **Amazon Rainforest** | +1.5°C to +2.0°C global | <+1.5°C + stop deforestation | 0.5°C+ | Effectively irreversible if precipitation feedback breaks |
| **Permafrost** | +1.5-2.0°C (50% thaw) | N/A | N/A | Centuries to millennia (carbon loss irreversible) |
| **Deep Ocean** | Follows atmospheric warming | N/A | N/A | 500-1,000+ years (effectively irreversible) |

### Key Simulation Insights

1. **Hysteresis is universal:** ALL major climate subsystems show hysteresis (recovery threshold ≠ tipping threshold)

2. **Asymmetric timescales:** Collapse is often fast (decades), recovery is slow (centuries) or impossible

3. **Temperature overshoot matters:** Brief overshoots (<50-100 years) MAY be reversible for some systems; sustained overshoots commit to irreversible changes

4. **Cooling requirement:** Recovery requires cooling 0.5-2.0°C BELOW tipping threshold, not just returning to it

5. **Fast vs. slow systems:**
   - Fast (decades): Surface temperature, atmospheric composition, AMOC (recovery faster than collapse!)
   - Slow (centuries): Ocean oxygen, permafrost re-establishment, some ecosystems
   - Effectively irreversible (<1000 years): Deep ocean warming, sea level (thermal), ice sheet regrowth, permafrost carbon release

6. **Cascade prevention:** Once multiple tipping points crossed, recovery becomes progressively harder due to interactive feedbacks

---

## 8. Recommended Simulation Implementation (M-7 Roadmap)

### Core Hysteresis Mechanism

```typescript
interface TippingPointHysteresis {
  system: 'AMOC' | 'Greenland' | 'Amazon' | 'Permafrost' | 'DeepOcean';

  // Thresholds
  tippingThreshold: number;        // Temperature/forcing to trigger collapse
  recoveryThreshold: number;       // Temperature/forcing required for recovery
  hysteresisMargin: number;        // Difference (always positive)

  // State
  hasTipped: boolean;              // Has system crossed tipping point?
  tippingMonth: number | null;     // When did tipping occur?

  // Timescales
  collapseTimescale: number;       // Months from tipping to full collapse
  recoveryTimescale: number;       // Months from recovery conditions met to recovery

  // Current progress
  collapseProgress: number;        // 0 to 1 (how far into collapse)
  recoveryProgress: number;        // 0 to 1 (how far into recovery, if conditions met)

  // Irreversibility
  isIrreversible: boolean;         // Some systems (permafrost carbon) never recover
  legacyImpact: number;            // Residual impact even after "recovery"
}
```

### Example Parameters for Each System

**AMOC:**
```typescript
{
  tippingThreshold: 0.525,           // Sv freshwater forcing
  recoveryThreshold: 0.125,          // Sv freshwater forcing
  hysteresisMargin: 0.4,             // Sv
  collapseTimescale: 75 * 12,        // 75 years
  recoveryTimescale: 25 * 12,        // 25 years (faster than collapse!)
  isIrreversible: false,
  legacyImpact: 0.1                  // 10% residual circulation changes
}
```

**Greenland Ice Sheet:**
```typescript
{
  tippingThreshold: 2.0,             // °C above pre-industrial
  recoveryThreshold: 0.0,            // Pre-industrial (or below)
  hysteresisMargin: 2.0,             // °C
  collapseTimescale: 1000 * 12,      // 1000 years (committed melting)
  recoveryTimescale: 100 * 12,       // 100 years IF cooled rapidly
  isIrreversible: false,             // Reversible if fast overshoot
  legacyImpact: 0.3                  // 30% committed sea level rise remains
}
```

**Amazon Rainforest:**
```typescript
{
  tippingThreshold: 1.75,            // °C global (midpoint of 1.5-2.0)
  recoveryThreshold: 1.25,           // °C global + stop deforestation
  hysteresisMargin: 0.5,             // °C
  collapseTimescale: 40 * 12,        // 40 years to full dieback
  recoveryTimescale: Infinity,       // Effectively irreversible (>1000 years)
  isIrreversible: true,              // Once precipitation feedback breaks
  legacyImpact: 1.0                  // 100% loss if tipped (no recovery on human timescales)
}
```

**Permafrost Carbon:**
```typescript
{
  tippingThreshold: 1.75,            // °C global (midpoint of 1.5-2.0 for 50% thaw)
  recoveryThreshold: null,           // No recovery for carbon loss
  hysteresisMargin: Infinity,        // Carbon loss is one-way
  collapseTimescale: 200 * 12,       // 200 years for gradual decomposition
  recoveryTimescale: Infinity,       // Never (carbon stays in atmosphere)
  isIrreversible: true,
  legacyImpact: 1.0                  // 100% of released carbon remains
}
```

**Deep Ocean Warming:**
```typescript
{
  tippingThreshold: null,            // No discrete tipping (gradual accumulation)
  recoveryThreshold: null,           // No recovery on <1000 year timescale
  hysteresisMargin: null,            // Thermal inertia, not hysteresis
  collapseTimescale: 500 * 12,       // 500 years to equilibrate
  recoveryTimescale: 1000 * 12,      // 1000+ years
  isIrreversible: true,              // On human timescales
  legacyImpact: 0.8                  // 80% of warming persists for millennia
}
```

### Simulation Logic

1. **Check tipping:** Each month, check if current forcing exceeds `tippingThreshold`
   - If yes and not already tipped: Set `hasTipped = true`, record `tippingMonth`

2. **Progress collapse:** If `hasTipped`, increment `collapseProgress` by `1/collapseTimescale` each month
   - Apply system-specific impacts proportional to `collapseProgress`

3. **Check recovery conditions:** If `hasTipped` and `collapseProgress > 0`:
   - Check if forcing has dropped below `recoveryThreshold`
   - If yes, begin incrementing `recoveryProgress` by `1/recoveryTimescale` each month

4. **Handle irreversibility:** If `isIrreversible = true`:
   - Never allow `recoveryProgress` to increase
   - Apply `legacyImpact` permanently

5. **Apply hysteresis:** System only recovers when:
   - Forcing < `recoveryThreshold` (NOT just < `tippingThreshold`)
   - Sufficient time has passed (`recoveryTimescale`)
   - System is not irreversible

### Recommended Phase Integration

**Phase:** `ClimateHysteresisPhase.ts` (new phase)
- **Location in pipeline:** After `ClimateSystemPhase`, before impact phases
- **Inputs:** Temperature anomaly, ocean state, land use, permafrost state
- **Outputs:** Tipping point states, hysteresis progress, legacy impacts
- **Interactions:**
  - Feeds into `ClimateImpactPhase` (amplifies impacts if systems tipped)
  - Feeds into `BiodiversityPhase` (Amazon dieback affects species)
  - Feeds into `OceanHealthPhase` (AMOC collapse affects marine ecosystems)

---

## 9. Uncertainties and Limitations

### Model Uncertainty
- **Tipping threshold ranges:** Substantial uncertainty (e.g., Greenland: 1.5-3.4°C)
- **Timescale uncertainty:** Collapse and recovery timescales span wide ranges
- **Interaction effects:** Multi-system tipping cascades poorly understood

### Observational Limitations
- **Historical analogs:** Limited paleoclimate data for some tipping points
- **Detection lag:** May not know tipping point crossed until decades later
- **Regional vs. global:** Local tipping events well-documented; global synchronization unclear

### Research Gaps
- **Recovery pathways:** More research on collapse than recovery (especially AMOC)
- **Overshoot scenarios:** Limited modeling of temperature overshoot reversibility
- **Cascade dynamics:** How multiple tipping points interact remains poorly constrained

### Simulation Simplifications
- **Discrete thresholds:** Reality likely has smooth probability transitions, not hard thresholds
- **Linear timescales:** Actual collapse/recovery may be nonlinear
- **Missing feedbacks:** Some positive/negative feedbacks between systems not captured

---

## 10. Key Citations (Peer-Reviewed, 2023-2025)

### AMOC Hysteresis
1. **Noise-shaped hysteresis cycles of the AMOC under increasing CO2 forcing** (2025)
   *Chaos: An Interdisciplinary Journal of Nonlinear Science*
   DOI: Published by AIP Publishing
   [Link](https://pubs.aip.org/aip/cha/article/35/2/023167/3337514)

2. **Asymmetry of AMOC Hysteresis in a State‐Of‐The‐Art Global Climate Model** (2023)
   Westen et al., *Geophysical Research Letters*
   [Link](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2023GL106088)

3. **Physics of AMOC multistable regime shifts due to freshwater biases in an EMIC** (2025)
   *Earth System Dynamics*, Volume 16, pages 1221+
   [Link](https://esd.copernicus.org/articles/16/1221/2025/)

### Ice Sheet Tipping Points
4. **Overshooting the critical threshold for the Greenland ice sheet** (2023)
   *Nature*, Volume 586
   [Link](https://www.nature.com/articles/s41586-023-06503-9)

5. **Multistability and critical thresholds of the Greenland ice sheet** (2012, still foundational)
   *Nature Climate Change*
   [Link](https://www.nature.com/articles/nclimate1449)

### Amazon Rainforest
6. **Critical transitions in the Amazon forest system** (2023)
   *Nature*, Volume 586
   [Link](https://www.nature.com/articles/s41586-023-06970-0)

7. **Amazon dieback beyond the 21st century under high-emission scenarios** (2025)
   *Communications Earth & Environment*
   [Link](https://www.nature.com/articles/s43247-025-02606-5)

### Permafrost
8. **Permafrost response and feedback under temperature stabilization and overshoot scenarios** (2025)
   *Earth System Dynamics*, Volume 16, pages 1809+
   [Link](https://esd.copernicus.org/articles/16/1809/2025/)

9. **Permafrost Thaw Impact on Remaining Carbon Budgets and Emissions Pathways** (2025)
   Georgievski et al., *Earth's Future*
   [Link](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2024EF005153)

### Ocean Thermal Inertia
10. **Centuries of thermal sea-level rise due to anthropogenic emissions of short-lived greenhouse gases** (2017, still authoritative)
    *PNAS*, Volume 114, pages 657-662
    [Link](https://www.pnas.org/doi/10.1073/pnas.1612066114)

11. **Persistently Elevated High‐Latitude Ocean Temperatures Following Temporary Temperature Overshoots** (2024)
    Lacroix et al., *Earth's Future*
    [Link](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024EF004862)

### CDR and Reversibility
12. **Durability of carbon dioxide removal is critical for Paris climate goals** (2024)
    *Communications Earth & Environment*
    [Link](https://www.nature.com/articles/s43247-024-01808-7)

13. **Degrees of reversibility of ocean deoxygenation in an atmospheric carbon dioxide removal scenario** (2025)
    *Environmental Research Letters*
    [Link](https://iopscience.iop.org/article/10.1088/1748-9326/ade900)

### Planetary Boundaries and Earth System Hysteresis
14. **The long-term impact of transgressing planetary boundaries on biophysical atmosphere–land interactions** (2024)
    Drüke, M., et al., *Earth System Dynamics*, Volume 15, pages 467-483
    DOI: 10.5194/esd-15-467-2024
    [Link](https://esd.copernicus.org/articles/15/467/2024/)

---

## Summary of Key Parameters for M-7 Implementation

**Universal Hysteresis Properties:**
- Recovery threshold ≠ tipping threshold (recovery requires 0.5-2.0°C more cooling)
- Asymmetric timescales (collapse: decades, recovery: decades to centuries or never)
- Legacy impacts persist even after "recovery"

**Fast Systems (decades, potentially reversible):**
- AMOC: 75-year collapse, 25-year recovery (hysteresis = 0.4 Sv)
- Surface ocean: 20-50 year equilibration

**Slow Systems (centuries, limited reversibility):**
- Greenland ice (overshoot): 100-year recovery window if rapid cooling
- Permafrost re-establishment: centuries
- Ocean oxygen recovery: centuries (depth-dependent)

**Irreversible Systems (>1000 years or never):**
- Greenland ice (committed): 1,000+ year melting
- Amazon dieback: effectively permanent (>1000 years)
- Permafrost carbon release: permanent (carbon never recaptured)
- Deep ocean warming: 500-1,000+ years
- Sea level rise (thermal): 500-1,000+ years

**Critical Implementation Note:** Simulation should track both current forcing AND historical peak forcing to determine if systems have crossed tipping points during overshoots. Temperature can decline but systems may still be in committed collapse phase.
