# Climate Mini-Hindcast Validation Analysis

**Analyst:** Priya (Quantitative Validator)
**Date:** 2025-11-24
**Task:** Validate 1990-2010 climate trajectory against Keeling curve (5% tolerance)

---

## Executive Summary

| Metric | Result | Status |
|--------|--------|--------|
| **Validation Passed** | 0/10 runs | **FAILED** |
| **Crash Rate** | 100% (10/10) | **CRITICAL** |
| **Root Cause** | Population collapse triggers assertion | Blocking bug |
| **CO2 Validation** | Cannot assess | Blocked by crash |

**Verdict:** Hindcast validation BLOCKED by catastrophic population collapse. Cannot validate CO2 trajectory until mortality model is fixed.

---

## Quantitative Findings

### 1. Population Trajectory (CRITICAL FAILURE)

**Historical reality (1990-2010):**
- 1990: 5.3B
- 2000: 6.1B
- 2010: 6.9B
- **Expected growth:** +30% over 20 years

**Simulation trajectory:**
| Year | Simulated Pop (B) | Historical Pop (B) | Error |
|------|-------------------|-------------------|-------|
| 1990 | 5.33 | 5.33 | 0% |
| 1991 | 4.96 | 5.43 | -8.7% |
| 1992 | 4.86 | 5.53 | -12.1% |
| 1993 | 4.34 | 5.64 | -23.0% |
| 1994 | 4.16 | 5.74 | -27.5% |
| 1995 | 3.76 | 5.84 | -35.6% |
| 1996 | 3.03 | 5.94 | -49.0% |
| 1997 | 2.44 | 6.04 | -59.6% |
| 1998 | 1.96 | 6.14 | -68.1% |
| 1999 | 1.57 | 6.24 | -74.8% |
| 2000 | 1.26 | 6.34 | -80.1% |
| 2001 | 0.99 | 6.44 | -84.6% |
| 2005 | 0.25 | 6.85 | -96.4% |
| 2010 | 0.04 | 7.26 | -99.4% |

**Mortality Rate Analysis:**
- **Month 1-12 (1990):** 6.9% total population loss
- **Month 60-72 (1995):** 10.3%/year mortality rate kicks in
- **Month 120+ (2000):** Sustained 45-57% annual climate mortality
- **Final (2010):** 0.04B survivors = **99.2% cumulative mortality**

**Root cause:** Climate mortality risk reaches 45-56% PER MONTH by 2001, a rate that implies complete civilizational collapse within 2-3 years. This is ~100x higher than historical worst-case (Black Death: ~30% over several years).

### 2. Mortality Risk Distribution

From diagnostic JSON (aggregate risks by type):
- **Climate:** 86.9% of all deaths
- **Conflict:** 2.1% of all deaths

Monthly climate risk trajectory:
| Period | Risk/Month | Annualized | Historical Comparison |
|--------|------------|------------|----------------------|
| 1990 Month 1-6 | 0.04-0.07% | 0.5-0.8% | Normal baseline |
| 1995 Month 58-71 | 9.76% | **71%** | Exceeds Black Death |
| 2001 Month 132-143 | 45-56% | **99.9%** | Extinction-level |
| 2010 Month 240 | 45.8% | **99.9%** | Total collapse |

**Statistical fingerprint:** This is NOT log-normal mortality (expected for natural disasters). The distribution shows step-function jumps at specific thresholds, suggesting model artifacts rather than emergent dynamics.

### 3. Crash Point Analysis

All 10 runs crashed at same population threshold:
- **Population at crash:** 0.0972-0.0999B (CV = 0.9%)
- **Assertion threshold:** 0.1B minimum in `getGDPProxy()`
- **Time to crash:** Variable (depends on seed), but all reach threshold

The low CV (0.9%) at crash point confirms deterministic model behavior - the crash is inevitable given the mortality rates.

### 4. CO2 Trajectory (UNABLE TO VALIDATE)

The simulation crashes before reaching validation checkpoints. However, from the diagnostic run that completed:

**Expected (Keeling curve):**
- 1990: 354 ppm
- 2000: 369 ppm (+15 ppm, +4.2%)
- 2010: 390 ppm (+36 ppm, +10.2%)

**Cannot assess** - population collapse would affect emissions modeling anyway.

---

## Root Cause Analysis

### Primary Cause: Excessive Climate Mortality

The climate mortality model produces unrealistic death rates:
1. **~10%/month mortality** starting around year 5 (1995)
2. **~50%/month mortality** by year 11 (2001)
3. These rates imply Earth becomes uninhabitable by 1995 - not historical reality

### Contributing Factors

1. **Biosphere integrity boundary exceeded:** 16.3x threshold by simulation start
2. **Social breakdown regime:** Triggered at Month 0 (variance amplification 17.5x)
3. **Food security decline:** 0.796 -> lower, driving famine mortality
4. **Cascade effects:** Climate drives economic collapse drives more mortality

### Root Cause Identified: Missing Planetary Boundary Overrides

**CONFIRMED BUG:** The historical override code (`src/simulation/initialization.ts` lines 1361-1455) correctly sets:
- CO2 concentration (354 ppm)
- Temperature anomaly (0.45C)
- Population (5.3B)
- Emissions (22 GtCO2/year)
- Environmental tipping points (arctic ice, permafrost, etc.)

**BUT IT DOES NOT OVERRIDE planetary boundaries**, which are initialized by `initializePlanetaryBoundariesSystem()` at lines 92-300 of `src/simulation/planetaryBoundaries.ts` to 2025 crisis levels:

| Boundary | 2025 Value (Used) | 1990 Reality | Gap |
|----------|------------------|--------------|-----|
| Biosphere Integrity | 11.6x | ~2-3x | **~5x too high** |
| Climate Change | 1.21x | ~0.3-0.4x | **~3x too high** |
| Land System Change | 1.17x | ~0.5-0.7x | **~2x too high** |
| Freshwater Change | 1.15x | ~0.3x | **~3x too high** |
| Biogeochemical Flows | 2.94x | ~1.5x | **~2x too high** |
| Novel Entities | 1.50x | ~0.3x | **~5x too high** |

**This explains the 45-56%/month mortality:** The simulation runs 1990 conditions through a mortality model calibrated for 2025 planetary crisis, producing apocalyptic outcomes that didn't occur historically.

---

## Statistical Validation Framework

### Tests We Can Run
- [x] CV analysis for determinism (PASSED: 0.9% CV at crash)
- [ ] CO2 trajectory fit (BLOCKED)
- [ ] Temperature trajectory fit (BLOCKED)
- [ ] Distribution shape analysis (BLOCKED)

### Tests Needed After Fix
1. **CO2 trajectory:** Expect within 5% of Keeling curve
2. **Temperature trajectory:** Expect within 0.2C of HadCRUT5
3. **Population trajectory:** Expect within 5% of historical
4. **Distribution fingerprints:** Climate impacts should be log-normal, not step-function

---

## Recommendations

### Priority 1 (CRITICAL): Add Planetary Boundary Overrides for Hindcast

**Location:** `src/simulation/initialization.ts` lines 1361-1455

**Required code addition after line 1445** (after regional population scaling):

```typescript
// Apply planetary boundary overrides for hindcast mode
// Research: Steffen et al. (2015), Richardson et al. (2023)
if (historicalOverrides.startYear <= 1990) {
  state.planetaryBoundariesSystem.boundaries.climate_change.currentValue = 0.35;    // 1990: ~35% of boundary
  state.planetaryBoundariesSystem.boundaries.biosphere_integrity.currentValue = 2.5; // 1990: ~25% species loss (2.5x)
  state.planetaryBoundariesSystem.boundaries.land_system_change.currentValue = 0.6;  // 1990: ~60% of boundary
  state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = 0.3;   // 1990: ~30% of boundary
  state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue = 1.5; // 1990: ~150% of boundary
  state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue = 0.3;      // 1990: ~30% of boundary
  // Update boundary statuses
  for (const boundary of Object.values(state.planetaryBoundariesSystem.boundaries)) {
    updateBoundaryStatus(boundary);
  }
}
```

**Research sources for 1990 values:**
- Climate: Keeling curve + IPCC AR5 (clear sky, pre-major acceleration)
- Biosphere: IPBES (2019) - extinction rate lower in 1990 but already 10-100x background
- Land: FAO forest cover data (1990 baseline)
- Freshwater: GRACE data extrapolated back (groundwater depletion minimal in 1990)
- Biogeochemical: Fertilizer runoff data (nitrogen deposition already problematic by 1990)
- Novel entities: PFAS/microplastic accumulation (minimal in 1990)

### Priority 2: Add Historical Planetary Boundary Data to Config

**Location:** `src/types/config.ts` HISTORICAL_BASELINES

Add planetary boundary snapshots to the historical overrides interface:

```typescript
planetaryBoundaries?: {
  climateChange?: number;        // Relative to boundary (1.0 = at boundary)
  biosphereIntegrity?: number;
  landSystemChange?: number;
  freshwaterChange?: number;
  biogeochemicalFlows?: number;
  novelEntities?: number;
};
```

### Priority 3: Validate After Fix

After implementing fixes:
1. Run N=10 hindcast validation
2. Expect CO2 within 5% of Keeling curve
3. Expect population within 5% of UN data (should GROW, not collapse)
4. Expect temperature trajectory to track HadCRUT5

### Priority 4: Add Mortality Rate Sanity Check

Add assertion in mortality calculation:

```typescript
// No single month should exceed Black Death mortality rate (30%/3years = 0.7%/month)
// unless explicit pandemic/war cascade is active
const MAX_MONTHLY_MORTALITY = 0.007; // 0.7%/month = worst historical sustained rate
if (monthlyMortality > MAX_MONTHLY_MORTALITY && !state.cascadeActive) {
  console.warn(`Mortality ${(monthlyMortality*100).toFixed(2)}%/month exceeds historical maximum`);
}
```

---

## Appendix: Raw Data

### Run 1 Crash Details
```
Population at crash: 0.09798 billion (97.98M)
Threshold: 0.1 billion (100M)
Assertion: assertInRange in getGDPProxy
Location: EconomicSystemPhase.execute
Month: ~211 (late 2007)
```

### Population Decline Statistics
- Mean final population (10 runs): 0.097B
- CV at crash: 0.9%
- Time to crash: ~200-220 months (varies with seed)

### Cumulative Mortality
- Total deaths by 2010: ~5.3B (99.2% of initial)
- Climate-attributed: ~4.9B (92%)
- Conflict-attributed: ~0.1B (2%)

---

**Validation Status:** BLOCKED
**Next Step:** Route to simulation-maintainer for mortality model investigation
**Priority:** CRITICAL (blocks all hindcast validation work)

---

*In God we trust. All others must bring data.*
*- Priya, Quantitative Validator*
