# Research Verification: AMOC Tipping Point 2025 Update

**Commit:** 0b5bbc73dcd54cf870c5c8c3c68840482718aedd
**Date:** November 23, 2025
**Source File:** research/amoc_tipping_point_2025_update.md
**Purpose:** Verify citations before proposed AMOC parameter changes are implemented

---

## Overview

This commit adds research documenting 2025 peer-reviewed findings on AMOC collapse timelines. The research proposes future parameter updates to the simulation. **No code changes were made** - this is research-only.

**Before implementing proposed changes, the following citations need verification:**

---

## Citations Requiring Verification

### 1. Drijfhout et al. (2025) - Environmental Research Letters

**Cited as:** DOI: 10.1088/1748-9326/adfa3b

**Claims made:**
| Claim | Location | Verification Needed |
|-------|----------|---------------------|
| "All nine high-emission simulations show AMOC shutdown" | Line 55-56 | Confirm this is the exact finding |
| "Shutdown completion: 50-100 years after tipping point breach" | Line 58 | Quote specific passage |
| "Deep overturning shuts off completely after 2100 in high-emission runs" | Line 59-60 | Confirm timeframe |
| Quote: "The shutdown risk is more serious than many people realize" (Rahmstorf) | Line 62 | Verify this quote appears |

**Verification steps:**
- [ ] Confirm paper exists with this DOI
- [ ] Verify author list includes Drijfhout S. and Rahmstorf S.
- [ ] Confirm multi-model analysis methodology
- [ ] Verify each specific claim against paper text

### 2. van Westen (2025) - JGR Oceans

**Cited as:** DOI: 10.1029/2025JC022651

**Claims made:**
| Claim | Location | Verification Needed |
|-------|----------|---------------------|
| "High-emission tipping range: 2023-2076 (median 2055)" | Line 73 | Quote specific passage with CI |
| "Intermediate-emission tipping range: 2026-2095 (median 2063)" | Line 74 | Quote specific passage with CI |
| "Post-tipping transition: >100 years to reach substantially weaker state" | Line 75 | Confirm exact wording |
| "New indicator: Surface buoyancy flux (Bflux) over 40N-65N Atlantic" | Line 72 | Verify methodology |
| "25 climate models" analyzed | Line 80 | Confirm model count |

**Verification steps:**
- [ ] Confirm paper exists with this DOI
- [ ] Verify van Westen R.M. as lead author
- [ ] Confirm physics-based indicator methodology
- [ ] Verify each specific claim against paper text

### 3. Baker et al. (2025) - Nature

**Cited as:** Published February 26, 2025

**Claims made:**
| Claim | Location | Verification Needed |
|-------|----------|---------------------|
| "Southern Ocean winds drive upwelling that sustains AMOC" | Line 85 | Quote specific mechanism |
| "34 climate models analyzed across extreme scenarios" | Line 86 | Confirm model count |
| "4x CO2 and massive freshwater forcing" scenarios tested | Line 86 | Verify scenario details |
| "AMOC weakens but does not collapse through end of century" | Line 87 | Confirm exact finding |
| Quote: "Unlikely isn't impossible" (van Westen on this study) | Line 89 | Verify attribution |

**Verification steps:**
- [ ] Confirm paper exists in Nature (Feb 2025)
- [ ] Verify Baker J. as lead author
- [ ] Confirm Southern Ocean mechanism is central finding
- [ ] Verify each specific claim against paper text

### 4. van Westen et al. (2024) - Science Advances

**Cited as:** DOI: 10.1126/sciadv.adk1189

**Claims made:**
| Claim | Location | Verification Needed |
|-------|----------|---------------------|
| "Physics-based early warning signal shows AMOC on tipping course" | Line 200 | Verify title/abstract |

**Verification steps:**
- [ ] Confirm paper exists with this DOI
- [ ] Verify continuity with 2025 JGR paper

---

## Proposed Parameter Changes (Pending Verification)

The research proposes these simulation parameter updates:

```typescript
// Current parameters
amoc: {
  transitionMinMonths: 600,  // 50 years
  transitionMaxMonths: 3600, // 300 years
}

// Proposed updates (from research/amoc_tipping_point_2025_update.md lines 115-140)
amoc: {
  tippingMinMonths: 360,   // 30 years ("next few decades" claim)
  tippingMaxMonths: 1080,  // 90 years (median 2055-2063 claim)
  transitionDurationMinMonths: 600,  // 50 years (50-100yr post-tipping claim)
  transitionDurationMaxMonths: 1200, // 100 years (>100 years claim)
  highEmissionTippingProbByMonth: {
    peakProbabilityMonth: 360,        // median 2055 claim
    cumulativeProbabilityBy2100: 0.9, // 90% claim - NEEDS VERIFICATION
  },
  intermediateEmissionTippingProbByMonth: {
    peakProbabilityMonth: 456,        // median 2063 claim
    cumulativeProbabilityBy2100: 0.6, // 60% claim - NEEDS VERIFICATION
  },
}
```

**Critical values requiring paper-level verification:**
1. 50-100 year shutdown timeline (Drijfhout)
2. 2023-2076 tipping window (van Westen)
3. Median 2055 for high emissions (van Westen)
4. >100 year transition time (van Westen)
5. 90%/60% cumulative probabilities (UNCLEAR SOURCE - may be extrapolated)

---

## Verification Priority

**HIGH PRIORITY (Required before implementation):**
1. All three 2025 papers must be confirmed to exist
2. Tipping window claims (2023-2076, median 2055) must be quoted verbatim
3. Transition timeline claims (50-100yr, >100yr) must be quoted verbatim

**MEDIUM PRIORITY (Recommended):**
1. Verify Rahmstorf quote attribution
2. Verify model counts (9, 25, 34)
3. Verify van Westen's comment on Baker paper

**LOW PRIORITY (Good to have):**
1. Cross-reference with Caesar et al. (2021) foundational claims
2. Verify Armstrong McKay (2022) thresholds still align

---

## Outcome

**If verification passes:** Proceed with parameter implementation
**If claims unsupported:** Document discrepancies, adjust parameters to match actual paper findings

---

**Status:** AWAITING VALIDATION
**Assigned to:** research-skeptic (Sylvia)
