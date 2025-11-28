# Research Verification FAILED: Pre-Industrial Temperature Offset

**Commit:** 3e3f47c62ef8ad44f2e32f2d1e4332c30e5d4c3a
**Verification Date:** 2025-11-28
**Verified by:** Autonomous Researcher
**Status:** ❌ CLAIM FAILED VERIFICATION

---

## Summary

The commit introduces a **0.7°C offset** for converting temperature anomaly from 1850-1900 baseline to pre-industrial (1750) baseline. This claim **FAILED verification** - IPCC AR6 reports only **0.1°C warming** (range: -0.1°C to +0.3°C) between 1750 and 1850-1900.

**Error magnitude:** 700% overestimate (0.7°C claimed vs 0.1°C actual)

---

## Original Claim

**Location:** `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` (lines 110-121)

```typescript
// Convert to pre-industrial (1750) baseline: add 0.7°C
// Research: 1750-1850 warming ~0.7°C (IPCC AR6, historical temperature reconstruction)
state.planetaryBoundariesSystem.boundaries.climate_change.currentValue =
  tempAnomalyVs1850 + 0.7;
```

**Claimed:** Warming between 1750 and 1850-1900 was approximately 0.7°C
**Cited Source:** IPCC AR6 (Sixth Assessment Report)

---

## Verification Results

### Layer 1 - Citation Existence ✅ PASSED

- ✅ IPCC AR6 exists (2021-2023, Working Groups I, II, III)
- ✅ Cross-Chapter Box 1.2 in Chapter 1 discusses pre-industrial baseline definitions
- ✅ Cross-Chapter Box 2.3 in Chapter 2 shows temperature reconstructions

### Layer 2 - Claim Verification ❌ FAILED

**IPCC AR6 Findings (Cross-Chapter Box 1.2, Chapter 1):**

> Global surface temperatures increased by about **0.1°C** (likely range **–0.1°C to +0.3°C**, medium confidence) between the period around 1750 and the 1850–1900 period, with anthropogenic factors responsible for a warming of 0.0°C–0.2°C (likely range, medium confidence).

**Best estimate:** 0.1°C
**Uncertainty range:** -0.1°C to +0.3°C
**Confidence:** Medium

**Anthropogenic contribution:** 0.0°C to 0.2°C
**Confidence:** Medium

**Net anthropogenic forcing (1750 to 1850-1900):**
> There was likely a net anthropogenic forcing of 0.0–0.3 W m⁻² in 1850–1900 relative to 1750 (medium confidence), with radiative forcing from increases in atmospheric greenhouse gas concentrations being partially offset by anthropogenic aerosol emissions and land-use change.

**Net forcing from solar/volcanic:** ±0.1 W m⁻² (smaller than anthropogenic)

---

## Discrepancy Analysis

| Source | Temperature Offset | Error vs IPCC AR6 |
|--------|-------------------|-------------------|
| **Code claim** | **0.7°C** | +0.6°C (+600%) |
| **IPCC AR6 best estimate** | **0.1°C** | Baseline |
| **IPCC AR6 upper bound** | 0.3°C | +0.4°C above best estimate |
| **IPCC AR6 lower bound** | -0.1°C | -0.2°C below best estimate |

**Verdict:** The 0.7°C value is **7× the best estimate** and **2.3× the upper bound** of IPCC AR6's uncertainty range.

---

## Impact Assessment

### Systematic Bias Direction

Using 0.7°C instead of 0.1°C causes the simulation to **systematically underestimate** current warming relative to the 1750 baseline by **0.6°C**.

**Example calculation:**
- Observed temperature anomaly (vs 1850-1900): 1.28°C
- **Incorrect offset (0.7°C):** 1.28 + 0.7 = **1.98°C** vs 1750
- **Correct offset (0.1°C):** 1.28 + 0.1 = **1.38°C** vs 1750
- **Error:** 0.6°C underestimate of warming vs true pre-industrial

### Affected Systems

1. **Planetary Boundaries Phase** (`PlanetaryBoundariesPhase.ts`)
   - Climate change boundary threshold (1.5°C, 2.0°C) evaluated against wrong baseline
   - Boundary status (RED/YELLOW/GREEN) systematically biased toward lower warming

2. **Hindcast Validation** (`scripts/hindcastingValidation.ts`)
   - Temperature comparisons use wrong baseline
   - Validation metrics biased

3. **Climate System Impacts**
   - Tipping point thresholds evaluated against wrong baseline
   - Feedback mechanisms triggered at wrong temperatures

---

## Recommended Fix

### Replace with IPCC AR6 Value

```typescript
// Convert to pre-industrial (1750) baseline: add 0.1°C
// Research: IPCC AR6 Cross-Chapter Box 1.2 - Global surface temperature increased by ~0.1°C
// (likely range -0.1°C to +0.3°C, medium confidence) between 1750 and 1850-1900
// Anthropogenic contribution: 0.0-0.2°C, with natural variability ±0.1°C
const PREINDUSTRIAL_OFFSET = 0.1; // °C, IPCC AR6 best estimate

state.planetaryBoundariesSystem.boundaries.climate_change.currentValue =
  tempAnomalyVs1850 + PREINDUSTRIAL_OFFSET;
```

### Add Uncertainty Parameter (Optional)

For Monte Carlo uncertainty analysis:

```typescript
// IPCC AR6 Cross-Chapter Box 1.2: likely range -0.1°C to +0.3°C
const PREINDUSTRIAL_OFFSET_LOWER = -0.1; // °C
const PREINDUSTRIAL_OFFSET_BEST = 0.1;   // °C
const PREINDUSTRIAL_OFFSET_UPPER = 0.3;  // °C

// Sample from likely range (uniform distribution for simplicity)
const preindustrialOffset = rng() * (PREINDUSTRIAL_OFFSET_UPPER - PREINDUSTRIAL_OFFSET_LOWER)
                           + PREINDUSTRIAL_OFFSET_LOWER;
```

---

## Sources

### Primary Sources (IPCC AR6)

1. **IPCC AR6 Working Group I, Cross-Chapter Box 1.2** (Chapter 1: Framing, Context and Methods)
   [https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-1/](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-1/)

2. **IPCC AR6 Cross-Chapter Box 2.3** (Chapter 2: Changing State of the Climate System)
   [https://www.ipcc.ch/report/ar6/wg1/figures/chapter-2/ccbox-2-3-figure-1/](https://www.ipcc.ch/report/ar6/wg1/figures/chapter-2/ccbox-2-3-figure-1/)

3. **IPCC AR6 Summary for Policymakers**
   [https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/](https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/)

### Supporting Articles

4. **Climate-Lab-Book (2017): Defining 'pre-industrial'**
   [https://www.climate-lab-book.ac.uk/2017/defining-pre-industrial/](https://www.climate-lab-book.ac.uk/2017/defining-pre-industrial/)

5. **Copernicus (2023): The Paris Agreement and uncertainty in the warming from 1850-1900**
   [https://climate.copernicus.eu/GCH2023-Paris-Agreement](https://climate.copernicus.eu/GCH2023-Paris-Agreement)

6. **Carbon Brief (2021): In-depth Q&A on IPCC AR6 climate science**
   [https://www.carbonbrief.org/in-depth-qa-the-ipccs-sixth-assessment-report-on-climate-science/](https://www.carbonbrief.org/in-depth-qa-the-ipccs-sixth-assessment-report-on-climate-science/)

7. **PMC (2021): New physical science behind climate change - IPCC AR6**
   [https://pmc.ncbi.nlm.nih.gov/articles/PMC8569627/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8569627/)

---

## Additional Context

### Why 1850-1900 is Standard

IPCC uses 1850-1900 as the "pre-industrial" reference because:
1. **Observational coverage:** Near-global temperature measurements available from 1850 onward
2. **Early industrial era:** Pre-dates most industrial CO₂ emissions (coal use was limited before ~1880)
3. **Consistency:** Allows comparison across IPCC reports (AR5, AR6, SR1.5)

### Why 1750 Matters

True pre-industrial baseline (1750) is relevant because:
1. **Industrial Revolution:** Steam engine invented ~1760s, marking start of fossil fuel era
2. **CO₂ rise began ~1750:** Atmospheric CO₂ increased from ~280 ppm (1750) to ~285 ppm (1850)
3. **Paris Agreement:** Some interpretations aim for 1.5°C above "pre-industrial" = 1750

**IPCC AR6 Caveat:**
> This assessed change in temperature before 1850–1900 is not included in the AR6 assessment of global warming to date, to ensure consistency with previous IPCC assessment reports, and because of the lower confidence in the estimate.

---

## Next Steps

1. **CRITICAL:** Update `PlanetaryBoundariesPhase.ts` to use 0.1°C offset (not 0.7°C)
2. **HIGH:** Update `reviews/high6_temperature_sync_fix_20251127.md` with correct value
3. **MEDIUM:** Implement uncertainty range (-0.1 to +0.3°C) for Monte Carlo sensitivity
4. **MEDIUM:** Re-run hindcast validation (N≥10) with corrected offset
5. **LOW:** Update wiki climate documentation with correct baseline conversion

---

## Research Quality Assessment

**Grade:** A (Excellent)

**Strengths:**
- Primary source: IPCC AR6 (gold standard)
- Cross-Chapter Box 1.2 explicitly addresses this question
- Uncertainty range provided (medium confidence)
- Consistent with multiple AR6 chapters

**Limitations:**
- Medium confidence (not high confidence) due to limited observational data pre-1850
- Uncertainty range is wide (-0.1 to +0.3°C, 0.4°C span)
- Natural variability (volcanic, solar) not fully separated from anthropogenic signal

**Recommendation:** IMPLEMENT FIX IMMEDIATELY - current value (0.7°C) is outside IPCC AR6 uncertainty range

---

**Status:** ✅ VERIFICATION COMPLETE - ❌ CLAIM FAILED
**Action Required:** simulation-maintainer (Roy) to update parameter from 0.7°C to 0.1°C
**Priority:** HIGH - affects planetary boundary status assessments and hindcast validation
**Date:** 2025-11-28
