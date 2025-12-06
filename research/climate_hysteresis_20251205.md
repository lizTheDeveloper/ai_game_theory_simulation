# Climate System Hysteresis Research
**Date:** 2025-12-05
**Feature:** M-7 (Climate Hysteresis)
**Researcher:** Orchestrator (Phase 1 - Literature Review)

## Executive Summary

Climate tipping points exhibit strong hysteresis behavior where recovery thresholds are significantly lower than crossing thresholds, creating path-dependent dynamics where history matters. Once crossed, many tipping points require cooling well below the crossing temperature—sometimes below pre-industrial levels—to recover, and some may be irreversible on human timescales.

## Primary Sources

### 1. Garbe et al. (2020) - Antarctic Ice Sheet Hysteresis
**Citation:** Garbe, J., Albrecht, T., Levermann, A., Donges, J. F., & Winkelmann, R. (2020). The hysteresis of the Antarctic Ice Sheet. *Nature*, 585(7826), 538-544.
**DOI:** 10.1038/s41586-020-2727-5

**Key Findings:**
- Antarctic Ice Sheet exhibits multiple temperature thresholds beyond which ice loss is irreversible
- West Antarctica committed to partial collapse at 2°C above pre-industrial levels
- **Hysteresis behavior:** Ice sheet configuration NOT regained even if temperatures reverse to present-day levels
- **Recovery requirement:** West Antarctic Ice Sheet does NOT regrow to modern extent until temperatures are **at least 1°C BELOW pre-industrial levels** (crossing at +2°C, recovery below -1°C = 3°C hysteresis gap)

**Quantitative Parameters:**
- **Up to +2°C:** 1.3m sea level equivalent per degree warming
- **+2°C to +6°C:** 2.4m per degree (sensitivity nearly doubles)
- **+6°C to +9°C:** 10m per degree (loss of 70%+ ice volume triggered)
- **Above +10°C:** Virtually ice-free Antarctica

### 2. Drüke et al. (2024) - Planetary Boundaries & Long-term Commitment
**Citation:** Drüke, M., von Bloh, W., Petri, S., Sakschewski, B., Schaphoff, S., Forkel, M., Pugh, T. A. M., Müller, C., Heinke, J., Thonicke, K., & Lucht, W. (2024). The long-term impact of transgressing planetary boundaries on biophysical atmosphere–land interactions. *Earth System Dynamics*, 15(3), 467-483.
**DOI:** 10.5194/esd-15-467-2024

**Key Findings:**
- **Boreal permafrost:** Carbon emissions peak at 150 Pg C due to thaw—takes centuries to recover
- **Temporal asymmetry:** Almost 30% of total temperature increase develops AFTER 2100 with constant forcings
- **Long-term commitment:** Recovery timescales extend beyond 800 years for soil carbon in boreal regions

**Quantitative Timescales:**
| Component | Response Time |
|-----------|---------------|
| Deforestation effects | Decades (rapid) |
| CO₂ fertilization effects | Centuries (ongoing beyond 2100) |
| Temperature equilibration | 300+ years (ocean heat buffering) |
| Boreal soil carbon loss | Centuries (continues 2100-2770) |
| Vegetation carbon response | 400-600 years to quasi-equilibrium |

### 3. Recent Permafrost Research (2024-2025)
**Citation:** Multiple sources from Earth System Dynamics preprints and Science Advances
**DOI:** See references below

**Key Findings:**
- **Hysteresis timing:** Permafrost area loss peaks 10-30 years AFTER global temperature peaks
- **Partial recovery:** Permafrost area is "nearly reversible" but carbon loss is irreversible on multi-decadal to millennial timescales
- **No single tipping point:** Numerous local/regional thresholds that tip at different times
- **Temperature relationship:** Quasi-linear relation for 1.5-3°C warming range

**Quantitative Parameters:**
- **1.5°C stabilization:** 4.5 million km² permafrost area loss
- **2°C stabilization:** 6.5 million km² permafrost area loss
- **Overshoot scenarios:** 0.3-1.1 million km² additional irreversible loss
- **Hysteresis delay:** 10-30 years lag between temperature peak and permafrost loss peak

### 4. AMOC Hysteresis & Recovery (2024)
**Citation:** Multiple sources including Nature, Science Advances, PNAS
**DOI:** See references below

**Key Findings:**
- **Active debate:** Some models show collapse risk 2025-2095, others show resilience
- **Hysteresis confirmed:** AMOC exhibits bistability through saddle-node bifurcations
- **Recovery uncertainty:** "In the case of AMOC collapse, some models suggest AMOC does not recover within a human timescale"
- **Rate-dependent:** AMOC slows MORE when CO₂ change is FASTER (speed matters, not just magnitude)

**Mechanism:** Southern Ocean upwelling can sustain weakened AMOC but complete collapse may be irreversible

### 5. Global Hysteresis Patterns
**Citations:**
- Widespread irreversible changes: Nature Climate Change (2022)
- Agroecological droughts: Nature Water (2025)

**Key Findings:**
- **Temperature:** 89% of global area experiences irreversible changes
- **Precipitation:** 58% of global area experiences irreversible changes
- **Agricultural droughts:** Mediterranean, northern Central America, southern Africa, southern Australia show irreversible impacts even with equivalent carbon dioxide removal
- **Quantitative definition:** Hysteresis = difference in variable between up and down pathway at identical cumulative carbon emissions

## Parameter Extraction for Simulation

### Recovery vs Crossing Thresholds (Hysteresis Gaps)

| Tipping Element | Crossing Threshold | Recovery Threshold | Hysteresis Gap |
|----------------|-------------------|-------------------|----------------|
| **West Antarctic Ice Sheet** | +2.0°C | -1.0°C (below pre-industrial!) | **3.0°C** |
| **AMOC Collapse** | +1.5-2.0°C | Unknown (possibly irreversible on human timescales) | **Irreversible?** |
| **Permafrost (regional)** | +1.5-3.0°C | Partial recovery with 10-30 year lag | **0.01-0.13°C residual warming** |
| **Rainforest Dieback** | ~50% deforestation | Unknown | **Potentially irreversible** |

### Implementation Parameters

**Hysteresis Model:**
```
If tipping point crossed at temperature T_cross:
  - Recovery only begins when temperature falls below T_recovery
  - T_recovery = T_cross - hysteresis_gap
  - Recovery timescale >> crossing timescale
  - Some elements may never recover (irreversible on human timescales)
```

**Recommended Values:**
- **Ice sheet hysteresis gap:** 2-3°C (use 2.5°C as conservative estimate)
- **AMOC hysteresis:** Treat as irreversible once crossed (recovery time > 1000 years)
- **Permafrost hysteresis lag:** 10-30 years (use 20 years as midpoint)
- **Temperature commitment:** 30% additional warming continues after forcings stabilize (300+ year timescale)

## Mechanism Description

**How Hysteresis Works:**

1. **Positive Feedbacks Accumulate During Warming:**
   - Ice-albedo feedback (darker surfaces absorb more heat)
   - Ocean heat uptake creates thermal inertia
   - Permafrost carbon release adds greenhouse gases
   - Reduced ocean circulation weakens heat transport

2. **These Feedbacks Don't Reverse Symmetrically:**
   - Ice regrowth requires much colder temperatures than melting
   - Deep ocean heat takes centuries to dissipate
   - Carbon cycle has long atmospheric residence times
   - Ecosystem state changes (rainforest → savanna) resist reversal

3. **Path-Dependent Dynamics:**
   - System state depends on HOW you got there, not just current forcing
   - History matters: "virgin" ice sheet ≠ "regrown" ice sheet
   - Multiple stable states possible at same temperature

4. **Time Asymmetry:**
   - Crossing: Fast (decades to century)
   - Recovery: Slow (centuries to millennia) or never
   - Example: 2°C warming in 100 years, but 800+ years to recover soil carbon

## Interaction Map

### Systems Affected by Climate Hysteresis:

**Primary Effects:**
- **Climate System:** Temperature commitment continues for 300+ years after forcings stabilize
- **Tipping Points:** Ice sheets, AMOC, permafrost, rainforests become irreversible
- **Planetary Boundaries:** Climate boundary crossing makes land-use boundary harder to meet

**Secondary Effects:**
- **Sea Level:** Committed multi-meter rise even if warming stops
- **Carbon Cycle:** Permafrost feedback continues for centuries
- **Biodiversity:** Ecosystems can't adapt if climate keeps changing for centuries
- **Agriculture:** Drought patterns remain altered even with carbon removal

**Tertiary Effects:**
- **Quality of Life:** Long-term degradation even if policy improves
- **Migration:** Sea level commitment forces coastal abandonment
- **Economic:** Stranded assets from irreversible changes

## Expected Timeline in Simulation

**Early Game (Months 0-120):**
- Hysteresis not yet visible
- Building toward tipping point crossings
- Focus: Prevent crossing in first place

**Mid Game (Months 120-360):**
- First tipping points crossed (AMOC, permafrost)
- Hysteresis effects become apparent
- Policy challenge: Even aggressive mitigation doesn't reverse damage
- 10-30 year lags mean damage appears AFTER peak warming

**Late Game (Months 360+):**
- Full hysteresis regime
- Multiple tipping points crossed
- Recovery requires temperatures BELOW crossing thresholds
- Some elements (AMOC, West Antarctic) may be irreversible
- Temperature commitment: 30% additional warming continues for centuries
- Challenge: Achieving utopia requires avoiding tipping points entirely OR millennia-scale recovery

## Failure Modes

### Implementation Risks:

1. **Over-pessimism:** Treating all tipping points as equally irreversible when some (permafrost area) show partial recovery
2. **Under-pessimism:** Allowing recovery too easily, missing the core insight that history matters
3. **Timescale mismatch:** Using wrong recovery timescales (decades vs centuries vs millennia)
4. **Single threshold assumption:** Missing that hysteresis creates TWO thresholds (crossing and recovery)
5. **Linear recovery:** Assuming symmetric dynamics when recovery is fundamentally different process

### Calibration Challenges:

1. **Verification:** Hard to validate on human timescales (need paleoclimate proxy)
2. **Model uncertainty:** Wide range of recovery estimates in literature (AMOC: debated)
3. **Emergent behavior:** Hysteresis might create gameplay frustration ("I lowered emissions but nothing improved!")
4. **Balance vs realism:** Temptation to soften hysteresis for "fairness" rather than research accuracy

### Research Gaps:

1. **AMOC recovery threshold:** Poorly constrained, possibly irreversible
2. **Rainforest hysteresis:** Limited quantitative data on recovery thresholds
3. **Interaction effects:** How do multiple hysteresis effects combine?
4. **Tipping cascades:** Do hysteresis effects trigger additional tipping points?

## Monte Carlo Validation Strategy

**Validation Metrics:**
1. **Hysteresis detection:** Compare outcomes for same temperature reached by different paths (fast warming then cooling vs slow warming)
2. **Recovery timescales:** Measure time from temperature peak to metric recovery across runs
3. **Irreversibility check:** Verify that some tipping elements don't recover within simulation timeframe (600 months)
4. **Temperature commitment:** Confirm ~30% additional warming after forcings stabilize

**Expected Distributions:**
- **Low emissions pathways:** Avoid hysteresis regime entirely
- **Overshoot pathways:** Show path-dependence and incomplete recovery
- **High emissions pathways:** Multiple irreversible tipping points crossed

**Success Criteria:**
- Path-dependent outcomes visible in Monte Carlo distributions
- Recovery thresholds empirically lower than crossing thresholds
- Timescale asymmetry: crossing faster than recovery by factor of 10+

## References

### Primary Papers
1. Garbe et al. (2020). The hysteresis of the Antarctic Ice Sheet. *Nature*. https://www.nature.com/articles/s41586-020-2727-5
2. Drüke et al. (2024). The long-term impact of transgressing planetary boundaries. *Earth System Dynamics*. https://esd.copernicus.org/articles/15/467/2024/
3. EGUsphere (2025). Hysteresis and irreversibility in permafrost physical response. https://egusphere.copernicus.org/preprints/2025/egusphere-2025-4088/
4. ESD (2025). Permafrost response and feedback under temperature stabilization. https://esd.copernicus.org/articles/16/1809/2025/

### AMOC Studies
5. Warning of AMOC collapse. *Nature Communications* (2023). https://www.nature.com/articles/s41467-023-39810-w
6. Physics-based early warning signal. *Science Advances* (2024). https://www.science.org/doi/10.1126/sciadv.adk1189
7. Continued Atlantic overturning circulation. *Nature* (2024). https://www.nature.com/articles/s41586-024-08544-0

### Hysteresis Mechanics
8. Hysteresis of Earth system under positive/negative emissions. *Environmental Research Letters* (2020). https://iopscience.iop.org/article/10.1088/1748-9326/abc4af
9. Widespread irreversible changes. *Nature Climate Change* (2022). https://www.nature.com/articles/s41558-022-01452-z
10. Hysteresis of tropical forests. *Nature Communications* (2020). https://www.nature.com/articles/s41467-020-18728-7
11. Agroecological droughts hysteresis. *Nature Water* (2025). https://www.nature.com/articles/s44221-025-00487-8

### Educational Resources
12. Hysteresis For Dummies. *EGU Cryospheric Sciences Blog* (2020). https://blogs.egu.eu/divisions/cr/2020/12/04/hysteresis-for-dummies-why-history-matters/
13. Tipping points explainer. *Carbon Brief*. https://www.carbonbrief.org/explainer-nine-tipping-points-that-could-be-triggered-by-climate-change/

## Zotero Integration

**TODO:** Add papers to Zotero collection with tags:
- `climate-hysteresis`
- `tipping-points`
- `irreversibility`
- `ice-sheets`
- `AMOC`
- `permafrost`

**Status:** Research complete, ready for validation by research-skeptic (Sylvia).
