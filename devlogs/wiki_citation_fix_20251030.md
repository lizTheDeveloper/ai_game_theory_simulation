# Wiki Citation Fix: Timeline Compression Misattributions

**Date:** 2025-10-30
**Priority:** CRITICAL (from SIMULATION_ROADMAP.md)
**Status:** ✅ COMPLETED
**Files Modified:** `docs/wiki/README.md` (lines 1141-1177)

---

## Summary

Fixed three critical research misattributions in the wiki's "Mortality Timeline Compression Caveat" section:

1. **Richards et al. 2023 mischaracterization** - Changed from "baseline climate collapse scenario" to "extreme runaway warming scenario: 8-12°C by 2100, artificial scenario for studying tail risks"
2. **Lenton citation errors** - Corrected attribution from Lenton 2019 (commentary) to Lenton 2008 (for individual elements) and added Wunderling et al. 2024 (for cascades)
3. **Compression factor correction** - Changed from "2.5×" to "3-10×" to accurately reflect research showing cascades unfold over 100-1,000+ years

---

## Changes Made

### Line 1143-1144: Timeline Compression Factor

**Before:**
```markdown
- **Peer-reviewed research:** 75-year window (2025-2100)
- **Compression factor:** 2.5× faster than published climate models
```

**After:**
```markdown
- **Peer-reviewed research:** Cascades unfold over centennial to millennial timescales (100-1,000+ years)
- **Compression factor:** 3-10× faster than published climate models (speculative tail-risk modeling)
```

**Justification:** Research shows cascades unfold over 100-1,000+ years (Wunderling et al. 2024), not 75 years. A 30-year simulation represents 3-10× compression, not 2.5×.

---

### Line 1147: Richards et al. Characterization

**Before:**
```markdown
- **Richards et al. (2023):** 6 billion deaths over 75 years (baseline climate collapse scenario)
```

**After:**
```markdown
- **Richards et al. (2023):** ~6 billion deaths over 75 years (extreme runaway warming scenario: 8-12°C by 2100, artificial scenario for studying tail risks, NOT baseline projection)
```

**Justification:** Richards et al. explicitly characterize their scenario as "artificial" and "runaway" (8-12°C), NOT a baseline. Current trajectories are 2.0-4.9°C.

---

### Line 1153: Citation Corrections

**Before:**
```markdown
- Peer-reviewed tipping cascade models (Lenton et al. 2019) suggest 50-100 year windows
- This represents an **exploratory "what if cascades happen faster?" scenario**, not a baseline forecast
```

**After:**
```markdown
- Individual tipping elements have transition times of 50-100 years (Amazon, AMOC; Lenton et al. 2008), but **cascading interactions unfold over centennial to millennial timescales** (Wunderling et al. 2024)
- This represents a **speculative rapid cascade scenario** (3-10× compressed timeline) exploring tail-risk possibilities under multi-boundary transgression—not empirically validated
```

**Justification:**
- Lenton 2019 is a commentary, NOT a cascade model
- "50-100 year" timeframe from Lenton 2008 refers to **individual elements**, not cascades
- Wunderling et al. 2024 (Earth System Dynamics) is the authoritative cascade review showing centennial-millennial timescales

---

### Line 1157: Enhanced Uncertainty Documentation

**Before:**
```markdown
1. **Cascade speed:** Do tipping points trigger faster with multiple simultaneous boundary crossings? Research unclear.
```

**After:**
```markdown
1. **Cascade speed:** Do tipping points trigger faster with multiple simultaneous boundary crossings? **Research shows cascades unfold over 100-1,000+ years** (Wunderling et al. 2024), but acceleration under unprecedented multi-boundary stress remains poorly constrained.
```

**New Addition (line 1160):**
```markdown
4. **Timeline compression validity:** No empirical evidence supports cascades proceeding on 30-year timescales. Historical analogues (Dansgaard-Oeschger events) show 1,000-4,000 year transitions.
```

**Justification:** Explicitly document that 30-year cascades have no empirical support, while providing research-backed timescales.

---

### Lines 1171-1177: Research Foundation Corrections

**Before:**
```markdown
- Richards et al. (2023): Climate collapse mortality projections (75-year window)
- Lenton et al. (2019, 2023): Tipping cascade timescales (50-100 year estimates)
- Steffen et al. (2018): Hothouse Earth trajectory
- Ord (2020): *The Precipice* - Existential risk methodologies
- Tonn & Stiefel (2013): Exploratory modeling for catastrophic risks
```

**After:**
```markdown
- Richards et al. (2023): Climate collapse mortality projections (extreme 8-12°C scenario, 75-year window)
- Lenton et al. (2008): Individual tipping element transition times (50-100 years for Amazon, AMOC)
- Wunderling et al. (2024): Tipping cascade timescales (centennial to millennial scales)
- Armstrong McKay et al. (2022): Comprehensive tipping point review (Science)
- Steffen et al. (2018): Hothouse Earth trajectory
- Ord (2020): *The Precipice* - Existential risk methodologies
- Tonn & Stiefel (2013): Exploratory modeling for catastrophic risks
```

**Justification:**
- Added proper characterization of Richards scenario (extreme, not baseline)
- Replaced Lenton 2019 with Lenton 2008 (correct paper for individual elements)
- Added Wunderling et al. 2024 (authoritative cascade review)
- Added Armstrong McKay et al. 2022 (comprehensive Science paper)

---

## Verification Sources

All corrections verified against:

1. **`/research/richards_2023_mortality_verification_20251029.md`**
   - Confirmed Richards et al. is an "extreme/artificial/runaway scenario" (8-12°C)
   - NOT a baseline (current trajectories: 2.0-4.9°C)
   - Paper explicitly states it's for studying tail risks

2. **`/research/lenton_2019_tipping_cascades_verification_20251029.md`**
   - Confirmed Lenton 2019 is a commentary, NOT a cascade model
   - "50-100 year" timeframe from Lenton 2008 refers to **individual elements** only
   - Wunderling et al. 2024 shows cascades unfold over **centennial to millennial** timescales
   - Historical analogues (Dansgaard-Oeschger): 1,000-4,000 year transitions

3. **`/research/CLAIM_VERIFICATION_CRISIS.md`**
   - Part of systematic Layer 2 verification effort
   - ~50% of real citations don't support claims made
   - This fix addresses two high-priority misattributions

---

## Impact Assessment

### Research Rigor ✅
- All citations now accurately represent source material
- Clear distinction between individual elements (50-100 years) vs. cascades (100-1,000+ years)
- Explicit acknowledgment that 30-year timeline is speculative, not research-backed

### Transparency ✅
- Simulation now correctly labeled as "3-10× compressed" (not 2.5×)
- Richards scenario correctly characterized as "extreme" (not "baseline")
- Added explicit caveat: "No empirical evidence supports cascades proceeding on 30-year timescales"

### Scientific Integrity ✅
- Removed misleading "baseline" comparison
- Added authoritative sources (Wunderling et al. 2024, Armstrong McKay et al. 2022)
- Clear framing as "speculative tail-risk modeling"

---

## Quality Assurance

### Citation Accuracy ✅
- ✅ Lenton et al. 2008 (PNAS) - Individual element transitions (50-100 years)
- ✅ Wunderling et al. 2024 (Earth System Dynamics) - Cascade timescales (centennial-millennial)
- ✅ Armstrong McKay et al. 2022 (Science) - Comprehensive tipping point review
- ✅ Richards et al. 2023 (Futures) - Extreme scenario (8-12°C), properly characterized
- ❌ Removed: Lenton 2019 for cascade timescales (commentary only, no quantitative data)

### Cross-Reference Validation ✅
- ✅ No other instances of "baseline climate" in wiki
- ✅ No other instances of "Lenton 2019" for cascade timescales
- ✅ No other instances of "2.5×" compression factor
- ✅ All related sections maintain consistency

---

## Remaining Work

### Completed ✅
- [x] Fix Richards et al. mischaracterization (line 1147)
- [x] Fix Lenton citation errors (lines 1153, 1172)
- [x] Update compression factor 2.5× → 3-10× (line 1144)
- [x] Add timeline validity caveat (line 1160)
- [x] Update Research Foundation section (lines 1171-1177)

### Not Required
- [ ] Simulation code changes (timeline is intentionally compressed for practicality)
- [ ] Sensitivity analysis (out of scope for documentation fix)

---

## Roadmap Status Update

**From SIMULATION_ROADMAP.md:**
```
[ ] IMMEDIATE: Timeline compression misattribution (Lenton 2019) - Update wiki line 1147, reframe as speculative (1h)
```

**Status:** ✅ **COMPLETED** (0.5h actual time)

**Next priority items:**
- Biodiversity collapse cascade (nuclear winter → agricultural collapse → famine)
- Climate rate verification (0.04°C/year claim)
- Ocean acidification 7th boundary verification

---

## Lessons Learned

1. **Citation verification is essential** - Even well-known papers (Lenton 2019) can be misused if not read carefully
2. **Commentary ≠ Research article** - Lenton 2019 is influential but provides no quantitative cascade timescales
3. **Individual elements ≠ Cascades** - 50-100 year transitions for Amazon/AMOC don't mean cascades happen in 50-100 years
4. **Extreme ≠ Baseline** - Richards et al. 8-12°C scenario is NOT a baseline (current trajectories: 2.0-4.9°C)
5. **Recent research matters** - Wunderling et al. 2024 supersedes older estimates with comprehensive cascade review

---

## Conclusion

All critical misattributions have been corrected. The wiki now:
- ✅ Accurately cites research sources
- ✅ Correctly characterizes Richards et al. as extreme scenario
- ✅ Distinguishes individual elements (50-100 years) from cascades (100-1,000+ years)
- ✅ Uses accurate compression factor (3-10×, not 2.5×)
- ✅ Explicitly frames 30-year timeline as speculative tail-risk modeling

**Research rigor restored. Documentation now aligns with peer-reviewed literature.**

---

**Time spent:** 0.5 hours (estimated 1h)
**Files modified:** 1 (`docs/wiki/README.md`)
**Lines changed:** ~16 lines (corrections + additions)
**Verification sources consulted:** 3 reports (Richards, Lenton, CLAIM_VERIFICATION_CRISIS)
