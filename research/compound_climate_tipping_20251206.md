# Compound Climate Tipping Points Research

**Date:** 2025-12-06
**Feature:** M-5: Compound Climate Events
**Primary Sources:** Armstrong McKay et al. 2022, Wunderling et al. 2024

## Executive Summary

Climate tipping elements do not operate independently - they interact through complex feedback mechanisms that are predominantly destabilizing. When multiple tipping points are crossed simultaneously or in rapid succession, cascade effects can accelerate climate system degradation beyond what individual tipping events would produce.

**Key Finding for Implementation:** 9 out of 14 assessed tipping element interactions are destabilizing, 2 are stabilizing, and 3 are unclear. Risk of cascades increases strongly above 2°C global warming.

## Primary Research Sources

### 1. Armstrong McKay et al. (2022) - "Exceeding 1.5°C global warming could trigger multiple climate tipping points"

**Citation:** Armstrong McKay, D.I., Staal, A., Abrams, J.F. et al. Exceeding 1.5°C global warming could trigger multiple climate tipping points. Science, 377(6611), eabn7950 (2022).

**Key Findings:**
- Current warming (~1.1°C) already lies within lower uncertainty ranges of some tipping points
- Multiple tipping points may trigger in Paris Agreement range (1.5-2°C)
- 16 potential tipping elements identified (increased from 9)
- **Critical gap:** Interactions between tipping elements "tend to destabilize them" but quantitative assessment lacking

**Relevant Quote:**
> "Tipping elements and their tipping points were treated independently in this assessment, but there are multiple causal interactions between them with risks of triggering cascades among CTPs, some mediated via temperature. The strength and in some cases even the sign of identified interactions is uncertain. Nevertheless, their combined effect tends to lower CTP temperature thresholds."

### 2. Wunderling et al. (2024) - "Climate tipping point interactions and cascades: a review"

**Citation:** Wunderling, N., von der Heydt, A.S., Aksenov, Y. et al. Climate tipping point interactions and cascades: a review. Earth System Dynamics, 15, 41-74 (2024).
**DOI:** https://doi.org/10.5194/esd-15-41-2024

**Key Findings:**
- **9 destabilizing interactions, 2 stabilizing, 3 unclear** (out of 14 assessed pairwise interactions)
- Tipping cascades cannot be ruled out on centennial-millennial timescales at 1.5-2.0°C warming
- **On shorter timescales (decades-centuries), cascades possible above 2.0°C warming**
- Interactions assessed qualitatively by strength: Strong, Moderate, Weak, Unclear

**Interaction Assessment Framework:**
1. Response type (destabilizing vs stabilizing)
2. Response strength (strong/moderate/weak)
3. Level of agreement in literature
4. Level of evidence (IPCC guidelines)

## Specific Tipping Element Interactions

### Destabilizing Interactions

#### 1. Greenland Ice Sheet (GIS) → AMOC
**Mechanism:** Freshwater influx from GIS melt → reduces North Atlantic salinity → weakens AMOC via salt-advection feedback
**Strength:** Strong
**Timescale:** Multi-decadal to centennial
**Quantitative:** AMOC may not recover "within a human timescale" after collapse

#### 2. AMOC → Amazon Rainforest
**Mechanism:** AMOC reduction → altered sea surface temperatures → ITCZ shift → reduced Amazon rainfall → rainforest dieback
**Strength:** Moderate to Strong
**Timescale:** Decadal
**Quantitative:** Rainfall reductions can trigger dieback tipping point

#### 3. Arctic Sea Ice → Permafrost
**Mechanism:** Sea ice loss → increased coastal exposure → accelerated permafrost erosion
**Strength:** Moderate
**Timescale:** Multi-decadal
**Quantitative:** Erosion rates **2-4× higher** with sea ice loss
**Cascade risk:** Carbon releases from permafrost thaw

#### 4. Arctic Sea Ice → AMOC
**Mechanism:** Sea ice melt → warm/fresh anomalies propagate southward → reduce surface density → weaken AMOC
**Strength:** Moderate
**Timescale:** Multi-decadal

#### 5. Arctic Sea Ice → Greenland Ice Sheet
**Mechanism:** Sea ice loss → regional warming → accelerated GIS melt
**Strength:** Moderate
**Quantitative:** **Additional warming of 0.3-0.5°C regionally** over Greenland from sea ice loss

### Stabilizing Interactions (Negative Feedbacks)

#### 1. AMOC → Greenland Ice Sheet
**Mechanism:** AMOC collapse → decreased northward heat transport → Northern Hemisphere cooling → GIS stabilization
**Strength:** Strong
**Implication:** Could allow "safe overshoot" of GIS tipping point (temporary exceedance without collapse)
**Caveat:** Only effective if AMOC collapses before GIS - unlikely given current trajectories

### Critical Interaction Pairs (Highest Coupling)

Based on Wunderling et al. 2024 assessment:

1. **GIS ↔ AMOC** - Bidirectional, opposing effects (GIS destabilizes AMOC, AMOC collapse stabilizes GIS)
2. **AMOC → Amazon** - Unidirectional destabilization
3. **Arctic Sea Ice → Multiple elements** - Hub of cascading destabilization (affects permafrost, GIS, AMOC)
4. **Polar Ice Sheets (GIS + WAIS)** - Most decisive for tipping likelihoods; at 1.5°C, neglecting them alters expected tipped element count by **>2×**

## Acceleration Factors for Simulation

### Regional Warming Amplification
- Arctic sea ice loss: **+0.3 to +0.5°C additional regional warming** over Greenland/permafrost regions

### Erosion Rate Multiplication
- Coastal permafrost with sea ice loss: **2-4× baseline erosion rates**

### Threshold Temperature Lowering
- Armstrong McKay 2022: "Combined effect [of interactions] tends to lower CTP temperature thresholds"
- No specific quantitative multiplier provided, but **qualitative assessment: net destabilizing**

### Proposed Cascade Acceleration Model

Based on synthesis of literature:

**Temperature Regime Dependence:**
- **<1.5°C:** Minimal cascade risk, interactions slow (centennial-millennial timescales)
- **1.5-2.0°C:** Moderate cascade risk, interactions on centennial timescales
- **>2.0°C:** High cascade risk, fast tipping elements (AMOC, Amazon) can cascade on decadal-centennial timescales

**Simultaneous Tipping Threshold:**
- **2 simultaneous tippings:** Moderate acceleration (individual interactions activate)
- **3+ simultaneous tippings:** Strong acceleration (multiple interaction pathways compound)
- **4+ simultaneous tippings:** Severe acceleration (network effects dominate, system-wide destabilization)

**Proposed Acceleration Multipliers (Conservative Estimates):**
Based on qualitative strength assessments and limited quantitative data:

```
cascadeMultiplier = 1.0  // Baseline (0-1 tipping events)

if (simultaneousTippings >= 2) {
  cascadeMultiplier = 1.2  // Moderate acceleration (pairwise interactions)
}

if (simultaneousTippings >= 3) {
  cascadeMultiplier = 1.5  // Strong acceleration (network effects emerge)
}

if (simultaneousTippings >= 4) {
  cascadeMultiplier = 2.0  // Severe acceleration (system-wide cascade)
}

// Apply to climate degradation rate
climateStabilityDecline *= cascadeMultiplier;
```

**Justification:**
- Conservative multipliers (1.2-2.0×) based on qualitative "strong destabilization" assessment
- Literature lacks precise quantitative multipliers, but 2-4× empirical erosion rate provides upper bound
- Regional warming amplification (0.3-0.5°C) suggests ~1.2-1.3× temperature acceleration possible
- Network cascade effects expected to be superlinear (hence 2.0× at 4+ tippings)

## Time Windows for "Simultaneous" Tipping

**Fast Tipping Elements (months to decades):**
- AMOC collapse
- Amazon rainforest dieback
- Arctic summer sea ice loss

**Slow Tipping Elements (centuries to millennia):**
- Greenland Ice Sheet collapse
- West Antarctic Ice Sheet collapse
- Permafrost complete thaw

**Proposed Simulation Window:**
- **Same decade (10 years)** = simultaneous for implementation purposes
- Rationale: Fast tipping elements operate on decadal timescales; slow elements can be "committed" to tipping within a decade even if full transition takes centuries
- This captures "rapid cascade" scenarios (multiple fast elements) while avoiding spurious correlations from slow element interactions

## Implementation Recommendations

### 1. Track Tipping Event History
Maintain rolling window of tipping events in last 10 years (120 months):
```typescript
interface TippingEvent {
  element: 'GIS' | 'WAIS' | 'AMOC' | 'Amazon' | 'Permafrost' | 'ArcticSeaIce';
  month: number;
  committed: boolean;  // Reached commitment point vs full transition
}

state.climateSystem.recentTippingEvents: TippingEvent[] = [];
```

### 2. Count Simultaneous Tippings
```typescript
const window = 120;  // 10 years in months
const recentEvents = state.climateSystem.recentTippingEvents.filter(
  e => state.currentMonth - e.month <= window
);
const simultaneousTippings = recentEvents.length;
```

### 3. Apply Cascade Multiplier
```typescript
let cascadeMultiplier = 1.0;

if (simultaneousTippings >= 2) cascadeMultiplier = 1.2;
if (simultaneousTippings >= 3) cascadeMultiplier = 1.5;
if (simultaneousTippings >= 4) cascadeMultiplier = 2.0;

// Apply to climate stability decline
const baseDecline = calculateBaseClimateDecline(state);
const cascadeDecline = baseDecline * cascadeMultiplier;

state.climateSystem.stability -= cascadeDecline;
```

### 4. Specific Interaction Bonuses
For high-coupling pairs, apply additional localized effects:
```typescript
// If both GIS and AMOC tip within window
if (tippedElements.includes('GIS') && tippedElements.includes('AMOC')) {
  // GIS → AMOC: Accelerate AMOC weakening
  state.oceanHealth.amocStrength *= 0.95;  // Additional 5% weakening
}

// If Arctic sea ice + permafrost tip
if (tippedElements.includes('ArcticSeaIce') && tippedElements.includes('Permafrost')) {
  // 2-4× erosion rate → additional carbon release
  state.carbonCycle.permafrostCarbonRelease *= 2.5;  // Midpoint of 2-4× range
}
```

## Validation Criteria

### Monte Carlo Expected Behaviors

**Baseline (0-1 tipping events):**
- Climate stability declines at base rate
- No acceleration observed

**2 simultaneous tippings:**
- **~20% faster** climate degradation than baseline
- Observed in some but not all runs (stochastic)

**3+ simultaneous tippings:**
- **~50% faster** climate degradation
- Should appear in high-warming scenarios (>2.5°C paths)
- Expect accelerated progression to collapse outcomes

**4+ simultaneous tippings:**
- **~100% faster** (2× base rate) climate degradation
- Rare, only in worst-case trajectories (>3°C, failed mitigation)
- Strong correlation with extinction/collapse outcomes

### Coefficient of Variation (CV) Validation
- Deterministic seed runs: CV < 0.01% (no cascade randomness beyond base RNG)
- Outcome distribution: Expect right-shift toward worse outcomes when cascades active vs disabled
- Sensitivity test: Disabling cascade logic should reduce collapse frequency by 15-30%

## Research Gaps and Uncertainties

### High Uncertainty Items
1. **Quantitative acceleration factors** - Literature provides qualitative assessments ("strong destabilization") but lacks precise multipliers
2. **Threshold counts** - No empirical data on 2 vs 3 vs 4 simultaneous tipping effects
3. **Interaction signs** - 3 out of 14 assessed interactions have "unclear" destabilization/stabilization status
4. **Timescale coupling** - How do fast and slow tipping elements interact across different timescales?

### Conservative Assumptions Made
1. Cascade multipliers (1.2-2.0×) are conservative relative to "strong destabilization" language
2. 10-year window may underestimate slow tipping element interactions
3. Pairwise interaction model ignores higher-order network effects (3+ element interactions)

### Future Research Needed
1. Quantitative tipping cascade models (Armstrong McKay mentions upcoming "TIPMIP" - Tipping Points Model Intercomparison Project)
2. Empirical validation from paleoclimate records (e.g., PETM, last deglaciation)
3. Better understanding of AMOC-GIS stabilizing interaction strength and timing

## Citations for Zotero

**Armstrong McKay et al. (2022):**
- Title: Exceeding 1.5°C global warming could trigger multiple climate tipping points
- Journal: Science
- Volume: 377(6611)
- DOI: 10.1126/science.abn7950
- Date: September 9, 2022

**Wunderling et al. (2024):**
- Title: Climate tipping point interactions and cascades: a review
- Journal: Earth System Dynamics
- Volume: 15
- Pages: 41-74
- DOI: 10.5194/esd-15-41-2024
- Date: January 26, 2024

## Supplementary Sources

1. **Abrams et al. (2023)** - "Committed Global Warming Risks Triggering Multiple Climate Tipping Points" - Earth's Future, 11(6)
2. **Nature Climate Change (2022)** - "Teleconnections among tipping elements in the Earth system" - doi:10.1038/s41558-022-01558-4
3. **Nature Communications (2024)** - "Achieving net zero greenhouse gas emissions critical to limit climate tipping risks" - doi:10.1038/s41467-024-49863-0

---

**Research Quality Assessment:**
- ✅ Peer-reviewed sources (2022-2024)
- ✅ Mechanism descriptions provided
- ⚠️ Limited quantitative parameters (conservative estimates derived)
- ✅ Interaction map identified
- ✅ Uncertainty acknowledged
- ⚠️ Monte Carlo validation needed to calibrate multipliers

**Next Step:** Research-skeptic validation before implementation
