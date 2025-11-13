# State Validation Domain Bounds Update

**Date:** November 13, 2025
**Implementation:** Roy (simulation-maintainer)
**Status:** COMPLETE
**Trigger:** Layer 2 verification (research/layer2_verification_state_validation_20251106.md)

## Summary

Updated assertion utility bounds in `src/simulation/utils/assertions.ts` to reflect research-validated values from Layer 2 verification. All changes are now grounded in peer-reviewed research and accommodate extreme scenarios modeled in the 75-year simulation (2025-2100).

## Changes Made

### 1. CO2 Upper Bound: 600 → 1000 ppm

**Previous:** `[280, 600] ppm`
**Updated:** `[280, 1000] ppm`

**Rationale:**
- RCP8.5 (IPCC AR6, SSP5-8.5) projects 900-936 ppm CO2 by 2100
- Previous 600 ppm bound was too restrictive and would cause false positives in high-emission scenarios
- 1000 ppm upper bound accommodates RCP8.5 and model variations

**Research:**
- IPCC AR6, SSP5-8.5: 900 ppm by 2100
- Carbon Brief, PNAS: RCP8.5 defined as 936 ppm by 2100

**Function:** `assertPlanetaryBoundary(value, 'co2', context)`

---

### 2. Ocean pH Bounds: 7.8 "collapse" claim REMOVED

**Previous:** `[7.5, 8.5] pH` with claim of "7.8 ecosystem collapse threshold"
**Updated:** `[7.5, 8.5] pH` with accurate research context

**Rationale:**
- No peer-reviewed support found for specific pH 7.8 "ecosystem collapse threshold"
- Recent research (2024-2025) confirms planetary boundary breached, but no specific threshold
- 7.5 lower bound reflects projected minimum under extreme RCP8.5 scenarios

**Research:**
- NOAA Ocean Acidification Program (2025)
- Scientific American: "Ocean Acidification Threshold Pushes Earth Past Another Planetary Boundary"
- Current pH: 8.04 (down from 8.2 pre-industrial)
- Projected: 7.5-7.9 by 2100 under high emissions

**Function:** `assertPlanetaryBoundary(value, 'oceanPH', context)`

---

### 3. GDP Upper Bound: 200T → 600T

**Previous:** `[0, 200] trillion USD`
**Updated:** `[0, 600] trillion USD`

**Rationale:**
- Simulation runs 75 years (2025-2100)
- 2% annual growth baseline: $114T × (1.02)^75 = ~$510T by 2100
- 600T provides buffer for AI-driven growth scenarios
- Previous 200T bound would be exceeded within 10-15 years

**Research:**
- IMF World Economic Outlook (April 2025): Global GDP = $114 trillion in 2025
- 2% annual growth is conservative baseline (historical average)

**Function:** `assertEconomicMetric(value, 'gdp', context)`

---

### 4. Temperature Delta Bounds: [-20, +10]°C/month - DOCUMENTATION IMPROVED

**Bounds unchanged:** `[-20, +10]°C per month`
**Documentation updated:** Clarified these are generous sanity checks, not physical limits

**Rationale:**
- PETM warming (5-8°C) occurred over 15-20 THOUSAND years, not months
- Nuclear winter cooling (~15°C total) is within bounds
- Real-world monthly deltas typically <1°C
- These bounds are for catching calculation bugs, not modeling physical impossibilities

**Research:**
- PETM: 5-8°C over 15-20 thousand years (not "decades" as previously claimed)
- Xia et al. 2022: ~15°C cooling from nuclear winter

**Function:** `assertTemperatureDelta(delta, context)`

**Note:** Temperature bounds need better justification from rapid climate change literature. Current bounds are generous sanity checks only.

---

### 5. Mortality Rate Bounds: [0, 50%]/month - DOCUMENTATION IMPROVED

**Bounds unchanged:** `[0, 0.5]` (0-50% per month)
**Documentation updated:** Emphasized this is EXTREMELY generous, real-world <5%

**Rationale:**
- Black Death: ~40% over 7 years = ~0.5% monthly average
- Xia et al. 2022: >5 billion deaths (62.5% of 8B) over decades
- 50% monthly bound is for catching calculation bugs (e.g., double-counting)
- Real catastrophic scenarios: typically <5% monthly mortality

**Research:**
- Black Death (1347-1352): 40-60% over 7 years
- Xia et al. 2022: >5 billion deaths from US-Russia nuclear war (food system collapse)

**Function:** `assertMortalityRate(rate, context)`

---

## Testing

Created validation script: `scripts/test_assertion_bounds.ts`

**Test coverage:**
- CO2: Pre-industrial (280 ppm), current (425 ppm), RCP8.5 (936 ppm), upper bound (1000 ppm)
- Ocean pH: Pre-industrial (8.2), current (8.04), extreme (7.5)
- GDP: Current ($114T), projected 2100 ($510T)
- Temperature: Typical (0.5°C), nuclear winter (-15°C)
- Mortality: Black Death avg (0.5%), catastrophic (30%)
- Edge cases: NaN, Infinity

**Results:** All tests pass ✅

---

## Files Modified

1. **src/simulation/utils/assertions.ts** - Updated bounds and JSDoc comments
   - `assertPlanetaryBoundary()`: CO2 upper bound (1000 ppm), ocean pH comment clarification
   - `assertEconomicMetric()`: GDP upper bound (600T)
   - `assertTemperatureDelta()`: Improved documentation with PETM correction
   - `assertMortalityRate()`: Improved documentation with Xia 2022 context

2. **scripts/test_assertion_bounds.ts** - NEW validation test script

3. **devlogs/20251113_state_validation_bounds_update.md** - THIS FILE

---

## Validation

- ✅ Type check: `npx tsc --noEmit` (no errors)
- ✅ Assertion tests: `npx tsx scripts/test_assertion_bounds.ts` (all pass)
- ✅ Research verification: Layer 2 complete (research/layer2_verification_state_validation_20251106.md)

---

## Next Steps

1. **Monte Carlo validation NOT required** - These are bounds validation changes only, no simulation logic modified
2. **Temperature bounds research** - Future task: Find better justification for monthly temperature delta bounds from rapid climate change literature
3. **Documentation sync** - Wiki maintainer should update docs/wiki/ with revised bounds

---

## Research Sources

**CO2 & Climate:**
- IPCC AR6 (2021-2023): SSP5-8.5 scenarios
- Carbon Brief: RCP8.5 pathways
- PNAS: Climate scenario literature

**Ocean Acidification:**
- NOAA Ocean Acidification Program (2025)
- Scientific American (2024-2025): Planetary boundary breach
- European Environment Agency: Ocean chemistry monitoring

**Economics:**
- IMF World Economic Outlook (April 2025)
- World Bank Global Economic Prospects

**Mortality:**
- Xia et al. (2022): "Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection." Nature Food 3, 586–596.
- Historical records: Black Death (1347-1352)

**Paleoclimate:**
- Multiple sources on PETM (Paleocene-Eocene Thermal Maximum, ~55.8 Mya)

---

## Implementation Notes

**Defensive coding philosophy maintained:**
- All calculations use `assertFinite()` to catch NaN/Infinity
- No silent fallbacks (`?? defaultValue`) in calculation code
- Bounds are for catching bugs, not masking them
- When invalid value detected, simulation crashes with full context

**Research simulation rigor:**
- Invalid values indicate bugs to fix at source
- Bounds grounded in peer-reviewed research
- Generous sanity checks (not physical limits)
- Documentation cites specific sources

---

**End of implementation. Fixed. Added explicit research citations. You're welcome.**

*Roy, Nov 13, 2025*
*"After the Oct 24 NaN bug, I trust NOTHING. Every bound now has a citation."*
