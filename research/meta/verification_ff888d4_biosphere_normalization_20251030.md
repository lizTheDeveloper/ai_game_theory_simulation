# Research Verification: Biosphere Normalization Fix (Commit ff888d4)

**Date:** October 30, 2025
**Commit:** ff888d460b2cfbc3fbecf00dd3120f9087d46b37
**System:** Planetary Boundaries - Biosphere Integrity
**Priority:** HIGH - Critical calibration fix affecting environmental realism

---

## Executive Summary

This commit fixes a critical unit mismatch bug where biosphere integrity values were 460-484× over threshold (vs 1.21× for climate). The fix normalizes biosphere to a safe threshold of 10 E/MSY (extinctions per million species-years).

**Research verification status:** ⚠️ **CITATION ISSUES DETECTED**

---

## Citations Requiring Verification

### 🚨 PRIORITY 1: IPBES 2024 Claims (LIKELY INCORRECT)

**Location:** `src/simulation/planetaryBoundaries.ts:68`

**Claim in code:**
```typescript
// Research: IPBES (2024) - Current extinction rate ~137x natural (weighted global)
```

**Location:** `devlogs/planetary_boundary_biosphere_calibration_fix_20251030.md:76`

**Claim in devlog:**
```
- IPBES (2024): Background extinction rate = 0.1 E/MSY
- Safe threshold (Stockholm Resilience Centre): 10 E/MSY (100× background)
- Current global average: 137 E/MSY (1,370× background, 13.7× safe threshold)
```

**Verification needed:**

#### Layer 1 - Citation Existence:
- ✅ IPBES exists as organization
- ❌ **PROBLEM:** "IPBES 2024" is ambiguous and likely INCORRECT

**Known IPBES 2024 reports:**
1. IPBES Transformative Change Assessment (December 2024)
2. IPBES Nexus Assessment (December 2024)

**Neither report provides new extinction rate statistics.** Both reference IPBES 2019 Global Assessment for biodiversity baselines.

#### Layer 2 - Claim Verification:

**SPECIFIC CLAIMS TO VERIFY:**

1. **"Current extinction rate ~137x natural"**
   - Does ANY IPBES report state this specific value?
   - IPBES 2019 states: "100-1000x natural extinction rate"
   - Where does "137x" come from? Is this a weighted average calculated from IPBES data?
   - If calculated: What methodology? What weighting?

2. **"Background extinction rate = 0.1 E/MSY"**
   - Does IPBES 2019/2024 state this value?
   - Is this from another source (De Vos et al. 2015, Pimm et al. 2014)?
   - Context: Different papers use different background rates (0.1-1.0 E/MSY)

3. **"Safe threshold: 10 E/MSY"**
   - IPBES does NOT set "safe thresholds" - that's Stockholm Resilience Centre
   - Is "10 E/MSY per IPBES" claim accurate?
   - Or should it be "Stockholm Resilience Centre (Richardson et al. 2023)"?

**LIKELY CORRECT ATTRIBUTION:**

Based on `research/biodiversity_citation_verification_20251029.md`, the correct citation is probably:

- **IPBES (2019)** Global Assessment (not 2024)
- **Stockholm Resilience Centre (Richardson et al. 2023)** for safe threshold (10 E/MSY)
- **Background rate:** Likely De Vos et al. (2015) or Pimm et al. (2014)

---

### 🟡 PRIORITY 2: Richardson et al. (2023) - "Earth beyond six of nine boundaries"

**Location:** Commit message, devlog line 162

**Claim:**
```
- Richardson et al. (2023): "Earth beyond six of nine boundaries"
```

**Verification needed:**

#### Layer 1 - Citation Existence:
- ✅ Paper exists: Richardson, K., et al. (2023). "Earth beyond six of nine planetary boundaries." *Science Advances*, 9(37), eadh2458.
- ✅ DOI: https://doi.org/10.1126/sciadv.adh2458
- ✅ Available via `research/papers/richardson_et_al_2023.pdf` (already downloaded per PDF_MANIFEST.md)

**Status:** Citation EXISTS and is ACCESSIBLE ✅

#### Layer 2 - Claim Verification:

**SPECIFIC CLAIMS TO VERIFY:**

1. **"Earth beyond six of nine boundaries"**
   - Does Richardson et al. (2023) state exactly 6 boundaries breached?
   - **NOTE:** Commit message and docs claim "7 of 9 boundaries breached" (2025 status)
   - Is there a discrepancy? Did ocean acidification breach happen AFTER Richardson 2023?

2. **Safe threshold for biosphere: 10 E/MSY**
   - Does Richardson et al. (2023) specify this threshold?
   - Quote the exact passage

3. **Current biosphere value: 13.7x over threshold**
   - Does Richardson provide this specific value?
   - Or is this calculated from their data?

**ACTION REQUIRED:**
- Open `research/papers/richardson_et_al_2023.pdf` (if exists)
- Search for "10 E/MSY", "extinction", "biosphere"
- Extract exact quotes supporting the claims

---

### 🟡 PRIORITY 3: Stockholm Resilience Centre - Safe Threshold (10 E/MSY)

**Location:** `src/simulation/planetaryBoundaries.ts:547`, commit message

**Claim:**
```
- Stockholm Resilience Centre: Safe threshold 10 E/MSY
```

**Verification needed:**

#### Layer 1 - Citation Existence:
- ✅ Stockholm Resilience Centre exists
- ❓ **INCOMPLETE:** Which publication/report?
- Likely: Steffen et al. (2015) or Richardson et al. (2023)

#### Layer 2 - Claim Verification:

**SPECIFIC CLAIMS TO VERIFY:**

1. **"Safe threshold 10 E/MSY"**
   - Which Stockholm Resilience Centre publication states this?
   - Is it Steffen et al. (2015) "Planetary boundaries: Guiding human development on a changing planet"?
   - Or Richardson et al. (2023)?
   - Quote the exact passage

**Likely source:**
- Steffen, W., et al. (2015). "Planetary boundaries: Guiding human development on a changing planet." *Science*, 347(6223), 1259855.

**ACTION REQUIRED:**
- Identify the specific publication
- Verify the 10 E/MSY threshold is stated (not calculated/inferred)
- Extract exact quote

---

### 🟢 PRIORITY 4: Exogenous Shock Polarity Fix (Low Priority)

**Location:** `src/simulation/engine/phases/ExogenousShockPhase.ts:145, 274`

**Change:** Nuclear war/asteroid impacts now INCREASE extinction rate (not decrease)

**Research justification:** Self-evident (mass extinctions worsen biosphere)

**Verification needed:** ✅ NONE - Logic fix, not research-backed parameter

---

## Parameters Requiring Verification

### Parameter 1: Current Extinction Rate (137 E/MSY)

**Location:** `src/simulation/planetaryBoundaries.ts:68`

**Current value in code:** 137 E/MSY (137× natural rate)

**Claimed source:** "IPBES (2024)"

**Verification questions:**
1. What is the ACTUAL source for 137 E/MSY?
2. Is this value from:
   - Direct IPBES statement?
   - Calculated weighted average from IPBES regional data?
   - Another source entirely?
3. What is the methodology for "weighted global" average?
4. Does this value represent:
   - Median extinction rate?
   - Mean extinction rate?
   - Conservative estimate from 100-1000x range?

**Expected finding:**
- IPBES 2019 states: "100-1000x natural extinction rate"
- 137x is within this range but NOT explicitly stated by IPBES
- Likely calculated from other data or conservative estimate

**Correct attribution needed:**
- If calculated: Document methodology
- If from another source: Cite that source
- If conservative estimate: State as such

---

### Parameter 2: Background Extinction Rate (0.1 E/MSY)

**Location:** `devlogs/planetary_boundary_biosphere_calibration_fix_20251030.md:76`

**Current value in code:** Implicit (used to calculate 137x multiplier)

**Claimed source:** "IPBES (2024)"

**Verification questions:**
1. Does IPBES state 0.1 E/MSY as background rate?
2. Or is this from:
   - De Vos et al. (2015)? "Estimating the normal background rate of species extinction"
   - Pimm et al. (2014)? "The biodiversity of species and their rates of extinction"

**Known background rate sources:**
- De Vos et al. (2015): 0.1 E/MSY (conservative, based on fossil record)
- Pimm et al. (2014): 1.0 E/MSY (higher estimate)
- Barnosky et al. (2011): 0.1-1.0 E/MSY (range)

**Context:** Background rate estimates vary by methodology:
- Fossil record: 0.1 E/MSY (long timescale)
- Modern observations: 1.0 E/MSY (shorter timescale)

**Correct attribution needed:**
- Identify which paper provides 0.1 E/MSY
- Acknowledge methodological choice (fossil record vs. modern)

---

### Parameter 3: Safe Threshold (10 E/MSY)

**Location:** `src/simulation/planetaryBoundaries.ts:69, 547`

**Current value in code:** 10.0 (SAFE_EXTINCTION_RATE constant)

**Claimed source:** "IPBES" and "Stockholm Resilience Centre"

**Verification questions:**
1. Which publication sets 10 E/MSY as safe threshold?
2. Is it:
   - Steffen et al. (2015)? "Planetary boundaries: Guiding human development"
   - Richardson et al. (2023)? "Earth beyond six of nine"
3. What is the rationale for 10× background (not 5× or 20×)?

**Expected finding:**
- Stockholm Resilience Centre (Steffen et al. 2015 or Richardson et al. 2023)
- Based on Holocene variability and ecosystem resilience estimates
- 10× chosen as precautionary threshold

**Correct attribution needed:**
- Cite specific Stockholm Resilience Centre publication
- Quote exact passage defining 10 E/MSY threshold

---

### Parameter 4: Nuclear War Extinction Impact (+0.6)

**Location:** `src/simulation/engine/phases/ExogenousShockPhase.ts:145`

**Current value in code:** +0.6 (increases biosphere_integrity by 0.6)

**Interpretation:** Nuclear war increases extinction rate by 6 E/MSY (0.6 × 10 safe threshold)

**Claimed source:** None provided in commit

**Verification questions:**
1. What research backs +0.6 extinction impact from nuclear war?
2. Is this:
   - Nuclear winter agricultural collapse → habitat loss?
   - Direct radiation effects on ecosystems?
   - Combined effects?
3. What timescale (immediate vs. decades)?

**Expected finding:**
- No specific research cited (parameter needs backing)
- Likely rough estimate based on nuclear winter severity

**Research needed:**
- Nuclear winter → agricultural collapse → habitat conversion
- Radiation effects on ecosystems (Chernobyl, Fukushima studies)
- Historical extinction pulses (asteroid impacts as analog)

---

### Parameter 5: Asteroid Impact Extinction Impact (+impactSize * 0.5)

**Location:** `src/simulation/engine/phases/ExogenousShockPhase.ts:274`

**Current value in code:** +impactSize * 0.5 (increases biosphere by 50% of impact size)

**Claimed source:** None provided in commit

**Verification questions:**
1. What research backs this scaling factor?
2. Is this based on:
   - K-Pg extinction event (66 million years ago, 75% species loss)?
   - Impact modeling studies?
   - Empirical extinction-impact size relationships?

**Expected finding:**
- No specific research cited (parameter needs backing)
- Likely rough scaling based on historical extinction events

**Research needed:**
- Alvarez et al. (1980): K-Pg impact extinction
- Schulte et al. (2010): K-Pg impact hypothesis synthesis
- Impact mechanics → extinction probability models

---

## Validation Results to Verify

**Claim in commit message:**
```
Validation:
- Before: biosphere = 197.19 (19,619% over threshold)
- After: biosphere = 16.78 (1,578% over threshold)
- 92% reduction, matches IPBES research (Earth 13.7x over safe threshold)
```

**Verification questions:**

1. **"matches IPBES research (Earth 13.7x over safe threshold)"**
   - Does IPBES state "13.7x over safe threshold"?
   - Or is this calculated from:
     - 137 E/MSY current rate ÷ 10 E/MSY safe threshold = 13.7x?
   - If calculated: Is the calculation methodology correct?

2. **Validation methodology**
   - What Monte Carlo runs were used for validation?
   - Are before/after values from same seed/run?
   - How many runs validate this fix?

---

## Code Locations Requiring Research Citations

### File: `src/simulation/planetaryBoundaries.ts`

**Line 68:** Comment claims "IPBES (2024) - Current extinction rate ~137x natural"
- ⚠️ Needs verification (IPBES 2024 likely incorrect attribution)

**Line 69:** Comment claims "Safe threshold: 10 E/MSY (10x natural extinction rate)"
- ⚠️ Needs specific Stockholm Resilience Centre citation

**Line 547:** Comment claims "Safe threshold: 10x natural rate (10 E/MSY)"
- ⚠️ Needs research backing (Stockholm Resilience Centre?)

**Line 548:** Comment claims "Current baseline: 137x natural rate (weighted across regions)"
- ⚠️ Needs methodology documentation or source citation

---

### File: `src/simulation/engine/phases/ExogenousShockPhase.ts`

**Line 145:** Nuclear war extinction impact (+0.6)
- ⚠️ Needs research backing for parameter value

**Line 274:** Asteroid impact extinction impact (+impactSize * 0.5)
- ⚠️ Needs research backing for scaling factor

---

### File: `devlogs/planetary_boundary_biosphere_calibration_fix_20251030.md`

**Line 76:** "IPBES (2024): Background extinction rate = 0.1 E/MSY"
- ⚠️ Needs verification (likely incorrect attribution to IPBES 2024)

**Line 77:** "Safe threshold (Stockholm Resilience Centre): 10 E/MSY (100× background)"
- ⚠️ Needs specific publication citation

**Line 78:** "Current global average: 137 E/MSY (1,370× background, 13.7× safe threshold)"
- ⚠️ Needs source for 137 E/MSY value

**Line 162:** "Richardson et al. (2023): 'Earth beyond six of nine boundaries'"
- ✅ Citation exists, needs claim verification (6 vs 7 boundaries)

**Line 167:** "IPBES (2024): Global Assessment Report on Biodiversity"
- ❌ **ERROR:** IPBES Global Assessment was released in **2019**, not 2024

**Line 168:** "Current extinction 100-1000x background, conservative: 137× weighted average"
- ⚠️ Needs documentation of "weighted average" methodology

---

## Summary of Citation Issues

### Critical Issues (Must Fix):

1. **"IPBES (2024)" attribution is LIKELY INCORRECT**
   - IPBES 2024 reports (Transformative Change, Nexus) do not provide extinction rate statistics
   - Should probably be "IPBES (2019) Global Assessment"
   - Multiple instances in code and devlog

2. **"137x natural extinction rate" source unclear**
   - Not explicitly stated in IPBES 2019 (which says "100-1000x")
   - If calculated: Needs methodology documentation
   - If from another source: Needs proper citation

3. **Background extinction rate (0.1 E/MSY) source unclear**
   - Likely De Vos et al. (2015) or Pimm et al. (2014)
   - Should not be attributed to IPBES without verification

### Medium Priority Issues:

4. **"10 E/MSY safe threshold" needs specific Stockholm Resilience Centre citation**
   - Likely Steffen et al. (2015) or Richardson et al. (2023)
   - Needs exact quote from paper

5. **Richardson et al. (2023) claims need verification**
   - "6 vs 7 boundaries breached" discrepancy
   - Paper exists and is accessible, needs quote extraction

### Low Priority Issues:

6. **Nuclear war/asteroid extinction impacts lack research backing**
   - Parameters (+0.6, +impactSize * 0.5) are rough estimates
   - Could benefit from research citations but not critical for bug fix

---

## Recommended Actions

### Immediate (Before Implementation):

1. **Correct IPBES 2024 → IPBES 2019** in all locations
2. **Add specific citation for 10 E/MSY threshold** (Stockholm Resilience Centre publication)
3. **Document 137 E/MSY source or methodology**
   - If calculated from IPBES data: Show calculation
   - If from another source: Cite it
   - If conservative estimate: State as such

### Short-term (Research Validation):

4. **Verify Richardson et al. (2023) claims** by reading the paper
   - Extract exact quotes for safe threshold
   - Clarify 6 vs 7 boundaries breached

5. **Verify background extinction rate source** (De Vos 2015? Pimm 2014?)

### Long-term (Parameter Refinement):

6. **Add research backing for nuclear/asteroid extinction impacts**
   - Not critical for this bug fix
   - Can be deferred to parameter refinement phase

---

## Files Changed in Commit

1. **`src/simulation/planetaryBoundaries.ts`** (Lines 68-84, 547-556)
   - Biosphere initialization normalized to 13.7 (was 10.0)
   - Added SAFE_EXTINCTION_RATE = 10.0 constant
   - Normalization logic: totalExtinctionRate / SAFE_EXTINCTION_RATE

2. **`src/simulation/engine/phases/ExogenousShockPhase.ts`** (Lines 145, 274)
   - Nuclear war: Changed `-0.6` to `+0.6` (correct polarity)
   - Asteroid impact: Changed `-impactSize * 0.5` to `+impactSize * 0.5` (correct polarity)

3. **`devlogs/planetary_boundary_biosphere_calibration_fix_20251030.md`** (New file, 252 lines)
   - Detailed bug analysis
   - Research citations (need verification)
   - Validation results

---

## Validation Checklist

- [ ] **Layer 1 - Citation Existence**
  - [ ] Verify IPBES 2024 vs 2019 attribution
  - [ ] Identify Stockholm Resilience Centre publication for 10 E/MSY
  - [ ] Verify Richardson et al. (2023) accessibility

- [ ] **Layer 2 - Claim Verification**
  - [ ] Extract exact IPBES quote for extinction rates
  - [ ] Extract exact quote for safe threshold (10 E/MSY)
  - [ ] Verify Richardson et al. (2023) statements
  - [ ] Document 137 E/MSY source/methodology
  - [ ] Identify background extinction rate source

- [ ] **Parameter Justification**
  - [ ] Document calculation: 137 / 10 = 13.7
  - [ ] Justify nuclear war extinction impact (+0.6)
  - [ ] Justify asteroid extinction scaling (+impactSize * 0.5)

- [ ] **Code Updates**
  - [ ] Fix IPBES 2024 → IPBES 2019 in code comments
  - [ ] Add specific Stockholm Resilience Centre citation
  - [ ] Add methodology note for 137 E/MSY calculation

---

**Status:** ⚠️ READY FOR VALIDATION PHASE (orchestrator workflow)

**Next Steps:**
1. Post to implementation channel (historian)
2. Orchestrator begins at VALIDATION phase (skip research phase - this file exists)
3. research-skeptic reviews citations and claims
4. Address citation issues before documentation finalization

---

**Generated:** October 30, 2025
**Historian:** wiki-documentation-updater agent
