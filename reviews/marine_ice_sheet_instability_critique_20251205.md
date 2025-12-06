# Marine Ice Sheet Instability Research Critique
**Date:** 2025-12-05
**Reviewer:** Sylvia (Research Skeptic)
**Document Reviewed:** `research/marine_ice_sheet_instability_20251205.md` (838 lines)
**Research ID:** M-4 Abrupt Sea Level Rise Modeling

---

## Executive Summary

**VERDICT: CONDITIONAL PASS**

The research is methodologically sound with appropriate source quality, but contains several concerns that require parameter adjustments before implementation proceeds. The document correctly identifies the 2024 MICI downgrade as the dominant finding, but some parameters remain more aggressive than current consensus supports. Key issues:

1. **Population displacement figure (93.5M per meter) lacks rigorous sourcing** - methodology critiques show exposure is not a reliable proxy for migration
2. **Temperature thresholds correctly identified but irreversibility treatment oversimplified** - Greenland research shows overshoot recovery is possible
3. **Abrupt pulse probability (5-20% range) may be too aggressive** - 2024 research suggests <10% even under extreme warming

**Recommendation:** Proceed with implementation after parameter adjustments specified in Section 5.

---

## 1. Source Quality Assessment

### 1.1 Strengths

**Tier 1 sources (high quality, correctly weighted):**
- DeConto & Pollard (2016, 2021) - Foundational, heavily cited
- Morlighem et al. (2024) - Critical MICI reassessment, appropriately emphasized
- Armstrong McKay et al. (2022) - Comprehensive tipping point review in Science

**Strong methodological choice:**
The research correctly centers the 2024 Morlighem findings that challenge MICI for 21st century timescales. This is the right call. Quote from research: "All three independent models show NO further retreat in the 21st century after hypothetical ice shelf collapse."

**Good uncertainty acknowledgment:**
Section 8 ("Uncertainties and Limitations") properly flags the 26x spread in collapse timescales (500-13,000 years) and notes model physics gaps.

### 1.2 Weaknesses

**Coastal impact sources are weaker:**
- Bloomberg (sponsored content, not peer-reviewed)
- Nicholls et al. (2011) is dated for displacement estimates
- The 93.5M figure appears extrapolated from the 187M/2m figure without rigorous methodology validation

**CRITICAL: Population displacement methodology flawed.**
Per PMC review (2021): "Given that exposure to sea level rise is not a reliable proxy indicator for migration, none of these studies rigorously or reliably quantifies the number of people who might be expected to move due to sea level rise."

The research treats exposure = displacement, which overstates certainty.

**Economic damage sources:**
- UK National Oceanographic Centre figure ($14T/year by 2100) lacks primary citation
- Damage functions are acknowledged as highly uncertain (Tier 3 confidence) but parameters treat them as reliable

### 1.3 Contradictory Evidence Not Included

**Missing: Edwards et al. (2019) "Revisiting Antarctic ice loss due to marine ice-cliff instability" (Nature)**
This paper found that MICI-based projections were not reproducible and that ice cliff failure may be self-limiting due to formation of ice melange (jumbled icebergs) that stabilizes remaining cliffs.

**Key quote from 2024 research:** "Breaking ice tends to form a melange, a dense, jumbled slurry of icebergs and sea ice. This frozen slurry can act as a retaining wall, at least temporarily stabilizing the cliffs against collapse."

This stabilizing mechanism is not modeled in the proposed parameters.

**Missing: Expert survey uncertainty ranges**
Horton et al. (2020) expert survey found 0.63-1.32m likely range by 2100 under RCP8.5, with 45% probability of exceeding IPCC upper bound. The research cites this range but doesn't incorporate the expert disagreement spread.

---

## 2. Parameter Critique

### 2.1 Temperature Thresholds

**WAIS: 1.0-1.5C - ACCEPTABLE but uncertain**

The research correctly identifies the Armstrong McKay et al. (2022) range. However, note:
- "High confidence" in tipping element status does NOT mean high confidence in exact threshold
- The 1.0C lower bound is at the pessimistic extreme
- Regional Antarctic warming vs global average warming distinction is sometimes conflated

**Recommendation:** Use 1.25C as median (already proposed), acknowledge that 1.0C is worst-case, not expected case.

**GIS: 0.8-1.5C - QUESTIONABLE lower bound**

The 0.8C figure comes from the worst-case of Robinson et al. (2012) estimate (0.8-3.2C range). The most likely threshold is 1.5C per recent synthesis.

**Contradictory evidence:** The 0.8C threshold produces a "conservative estimate" per the methodology, meaning it intentionally understates the threshold to account for transient overshoot effects. Using it as literal threshold may be double-conservative.

**Recommendation:** Raise GIS_TIPPING_MIN from 0.8C to 1.0C for consistency with WAIS and to avoid triggering GIS before WAIS (which would be historically unprecedented).

### 2.2 Sea Level Rise Rates

**INITIAL_ACCELERATION: 0.002 m/year (2mm/year) - ACCEPTABLE**
Matches current Thwaites observations.

**RAPID_MISI_PHASE: 0.003 m/year (3mm/year) - ACCEPTABLE**
Consistent with modeling, though at higher end of range.

**FULL_DEGLACIATION: 0.001 m/year (1mm/year) - ACCEPTABLE**
Reasonable average over long timescales.

### 2.3 Abrupt Pulse Parameters

**ABRUPT_PULSE_PROBABILITY_BASE: 0.05 (5% per decade) - QUESTIONABLE**

The research states "<10% for 21st century (unless warming >3C)" but then uses 5% per DECADE as base, which compounds to much higher probability over multiple decades.

**Math check:**
- 5% per decade over 8 decades (2025-2100) = 1 - (0.95^8) = 33.7% cumulative probability
- This contradicts the stated "<10% for 21st century"

**Recommendation:** Reduce to 0.02 (2% per decade) for base case, or restructure as per-century probability.

**ABRUPT_PULSE_MAGNITUDE: 1.5m - AGGRESSIVE**

The research states "0.5-3.0 meters (single ice sheet sector collapse)" but uses 1.5m as parameter. This is the midpoint, but abrupt pulses of this magnitude have no observational precedent in Holocene.

Meltwater Pulse 1A (14-18m over 340 years) came from MULTIPLE ice sheets simultaneously and included continental ice sheets no longer present.

**Recommendation:** Use 0.5m as base, allow 1.5m only under extreme warming (>3C) with cascading failures.

### 2.4 Coastal Impact Parameters

**DISPLACED_PER_METER: 93.5 million - POORLY SUPPORTED**

**Problems:**
1. Extrapolated from 187M/2m (Nicholls 2011), assumes linearity
2. Exposure is not migration - many populations will adapt in place
3. CoastalDEM corrections (Kulp & Strauss 2019) changed estimates by 3x
4. Does not account for existing or future coastal defenses

**More rigorous estimate:** Climate Central's CoastalDEM found 190M below projected high tide lines by 2100 under low emissions, 630M under high emissions. But this is EXPOSURE, not DISPLACEMENT.

**Recommendation:**
- Use 40-60M displaced per meter as more defensible estimate (accounts for adaptation, defenses)
- Flag this as HIGHEST UNCERTAINTY parameter in implementation
- Consider modeling adaptation/defense investment as modifier

**INFRASTRUCTURE_DAMAGE_QUADRATIC coefficient: 3.0 - UNVERIFIED**

The quadratic damage function is referenced but coefficient has no cited source. Copenhagen example (4x damage for 2x rise) suggests superlinearity but exact exponent is uncertain.

**Recommendation:** Reduce coefficient to 2.0 (more conservative superlinear scaling) or add explicit uncertainty parameter.

### 2.5 Feedback Parameters

**AMOC_SLOWDOWN_PER_GIS_MELT: 0.15 Sv/m - SPECULATIVE**

AMOC-ice sheet interactions are actively debated. Some research suggests WAIS melt could STABILIZE AMOC (mentioned in research), complicating simple linear relationships.

**Recommendation:** Add bidirectional uncertainty; this interaction is poorly constrained.

---

## 3. Methodological Review

### 3.1 Irreversibility Treatment - CONCERN

**Research states:** "Once crossed, begin irreversible collapse trajectory (even if temperature later decreases)"

**Contradictory evidence:** Bochow et al. (2023, Nature) found that "abrupt melting following temperature overshoot CAN be mitigated if cooling returns below 1.5C" for Greenland. This is actually cited in the research document but not incorporated into the implementation logic!

**Quote from research Section 2.2:** "Recent research (2023) shows that abrupt melting following temperature overshoot CAN be mitigated if cooling returns below 1.5C"

**Problem:** The implementation logic ignores this finding. Once `gisStable = false`, collapse is treated as irreversible regardless of subsequent cooling.

**Recommendation:** Add recovery pathway if cooling occurs within IRREVERSIBILITY_THRESHOLD_YEARS (currently 30 years). Only lock in irreversibility after sustained warming beyond threshold duration.

### 3.2 Regional vs Global Sea Level - ACKNOWLEDGED BUT NOT MODELED

**Research correctly notes:** "WAIS collapse produces sea level rise 20-30% HIGHER than global average in Northern Hemisphere"

**But parameters use:** Global mean only, with vague "apply regional multipliers for coastal impact calculations"

**Recommendation:** Either implement regional multipliers explicitly or document this as simplification with known underestimate of Northern Hemisphere impacts.

### 3.3 Ice Melange Stabilization - NOT MODELED

2024 research identifies ice melange formation as key stabilizing mechanism that challenges MICI. This is not incorporated.

**Recommendation:** Add stabilization probability modifier that reduces abrupt pulse likelihood as cumulative collapse proceeds (representing melange buildup).

### 3.4 Confidence Bands Missing

The research identifies Tier 1/2/3 confidence levels but implementation parameters don't carry forward uncertainty ranges. Every parameter should have associated uncertainty for sensitivity analysis.

---

## 4. Methodological Concerns

### 4.1 Time Scale Mismatch

The simulation runs monthly, but ice sheet dynamics operate on decadal-to-millennial timescales. Monthly probability checks for abrupt events may produce unrealistic clustering.

**Example:** `ABRUPT_PULSE_PROBABILITY_BASE / 120` (per-month probability) creates 120 chances per decade for a supposedly rare event. Stochastic clustering could produce multiple pulses in rapid succession, which has no physical basis.

**Recommendation:** Implement cooldown period after abrupt events (minimum 200 years between pulses per ice sheet sector) or use decade-level event checks rather than monthly.

### 4.2 Cascade Probability Stacking

The proposed logic increases abrupt pulse probability with temperature: `pulseProbability * (temp - 2.0)`. Combined with the existing conditional on `temp > 2.5`, this creates double-counting.

**At 3.0C:**
- Base: 5% per decade
- Multiplier: (3.0 - 2.0) = 1.0 (no change)
- Wait, this is additive, so at 3.0C it's still 5%
- At 4.0C: 5% * 2.0 = 10%

Actually, reviewing the code, this scales linearly with temperature above 2.0C. At 3.0C, probability = 5% * 1.0 = 5%. At 4.0C, probability = 5% * 2.0 = 10%. This is more reasonable than I initially thought, but the 2.5C gate AND the (temp - 2.0) multiplier create discontinuity.

**Recommendation:** Simplify to single smooth function or document the threshold rationale.

### 4.3 Food Security Feedback - AGGRESSIVE

**Proposed code:** `state.foodSecurity.globalYield *= (1 - fraction * 0.5)`

This applies 50% productivity loss on lost agricultural land, which compounds multiplicatively over time. With 23% agricultural land loss possible (high end), this could produce 11.5% yield reduction per year if applied annually.

**This appears to be cumulative not annual, but implementation is ambiguous.**

**Recommendation:** Clarify if this is applied once (stock) or per-step (flow). If per-step, this will produce unrealistic food collapse.

---

## 5. Implementation Recommendations

### 5.1 Required Parameter Adjustments

| Parameter | Research Value | Recommended Value | Rationale |
|-----------|---------------|-------------------|-----------|
| GIS_TIPPING_MIN | 0.8C | 1.0C | 0.8C is worst-case extreme |
| ABRUPT_PULSE_PROBABILITY_BASE | 0.05 | 0.02 | Avoid >10% cumulative by 2100 |
| ABRUPT_PULSE_MAGNITUDE | 1.5m | 0.5m (base) | No Holocene precedent for 1.5m pulses |
| DISPLACED_PER_METER | 93.5M | 50M | Exposure != displacement |
| INFRASTRUCTURE_DAMAGE_QUADRATIC | 3.0 | 2.0 | Unverified coefficient |

### 5.2 Required Implementation Changes

1. **Add GIS recovery pathway:** If cooling below 1.5C within 30 years of threshold crossing, allow reversal of `gisStable = false`

2. **Add abrupt pulse cooldown:** Minimum 200-year gap between events per ice sheet sector

3. **Clarify food security update:** Document as cumulative (stock) not annual (flow)

4. **Add melange stabilization:** Reduce abrupt pulse probability by 20% after each pulse (representing ice debris stabilization)

### 5.3 Sensitivity Analysis Requirements

Before Monte Carlo validation, run sensitivity sweeps on:
- Threshold temperatures (+/- 0.3C)
- Collapse timescales (500-2000 years)
- Abrupt pulse probability (1-5% range)
- Displaced population (30-100M per meter)

Flag any outcomes outside research-supported ranges.

### 5.4 Documentation Updates

Add to wiki:
- Sea level rise regional variation caveat
- MICI mechanism scientific controversy (2016-2024 evolution)
- Exposure vs displacement distinction for coastal impacts

---

## 6. Confidence Assessment

| Component | Confidence | Evidence Strength |
|-----------|-----------|-------------------|
| Temperature thresholds (WAIS) | HIGH | Multiple peer-reviewed sources, consistent ranges |
| Temperature thresholds (GIS) | MEDIUM | Large uncertainty range, 0.8C extreme |
| Sea level rise rates | HIGH | Observational data + modeling consensus |
| Abrupt pulse probability | LOW | Limited observational data, 2024 reassessment |
| Population displacement | LOW | Methodological critiques, exposure != migration |
| Economic damages | LOW | High uncertainty in damage functions |
| AMOC interactions | LOW | Actively debated, possibly bidirectional |
| Food security impacts | MEDIUM | Regional data available, global extrapolation uncertain |

---

## 7. Verdict

**CONDITIONAL PASS**

The research demonstrates thorough engagement with primary literature and correctly identifies the 2024 MICI reassessment as the dominant recent finding. However, several parameters require adjustment to avoid overstating near-term catastrophic risk while still capturing long-term commitment.

**Proceed to implementation with adjustments in Section 5.**

**Quality Gate 1 Status:** PASSED WITH CONDITIONS
**Next Steps:**
1. Implementer (Roy) to incorporate parameter adjustments
2. Skip architecture review for MEDIUM priority unless implementation introduces O(n^2) patterns
3. Monte Carlo validation to verify outcome distributions match research probabilities

---

## Sources Consulted

### Primary Contradictory Evidence
- [Edwards et al. (2019) - Revisiting Antarctic ice loss due to marine ice-cliff instability, Nature](https://www.nature.com/articles/s41586-019-0901-4)
- [Morlighem et al. (2024) - West Antarctic Ice Sheet may not be vulnerable to MICI, Science Advances](https://www.science.org/doi/10.1126/sciadv.ado7794)

### Population Displacement Methodology Critiques
- [PMC Review (2021) - A review of estimating population exposure to sea-level rise and relevance for migration](https://pmc.ncbi.nlm.nih.gov/articles/PMC8208600/)
- [Kulp & Strauss (2019) - CoastalDEM elevation corrections, Nature Communications](https://www.nature.com/articles/s41467-019-12808-z)

### Expert Uncertainty Surveys
- [Horton et al. (2020) - Estimating global mean sea-level rise from expert survey, npj Climate](https://www.nature.com/articles/s41612-020-0121-5)

### Greenland Recovery Evidence
- [Bochow et al. (2023) - Overshooting the critical threshold for Greenland ice sheet, Nature](https://www.nature.com/articles/s41586-023-06503-9)

### Threshold Uncertainty
- [Armstrong McKay et al. (2022) - Exceeding 1.5C could trigger multiple climate tipping points, Science](https://www.science.org/doi/10.1126/science.abn7950)
- [Robinson et al. (2012) - Multistability and critical thresholds of Greenland ice sheet, Nature Climate Change](https://www.nature.com/articles/nclimate1449)

---

**Reviewer:** Sylvia (Research Skeptic)
**Review Duration:** ~1 hour
**Methodology:** Web search for contradictory evidence, parameter verification against primary sources, implementation logic review
