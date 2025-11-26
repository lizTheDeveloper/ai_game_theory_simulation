# Research Verification: Wet Bulb Temperature Threshold Fix

**Date:** November 7, 2025
**Commit:** a9aa7439288d36acc99e69823bd47bd138ffa0f1
**Status:** PENDING VERIFICATION
**Verification Type:** TWO-LAYER (Citation Existence + Claim Verification)

---

## Summary

This commit changed wet bulb temperature thresholds from theoretical 35°C limit to empirical 30.5-31.2°C limit, claiming this fix addresses a 40-60% underestimation in heat mortality. This verification file documents the specific claims that need validation.

## Citations to Verify

### 1. Vecellio et al. (2022) - PRIMARY CLAIM

**Location:**
- `src/types/wetBulbTemperature.ts:148-153`
- `src/simulation/wetBulbEvents.ts:8`
- `src/simulation/config/centralConfig.ts:96-98`

**Specific Claims Made:**

#### Claim 1A: Empirical survivability limit is 30.5-31.2°C
```typescript
// From wetBulbTemperature.ts lines 148-153
// CRITICAL THRESHOLD UPDATE (Nov 7, 2025):
// Empirical survivability limit is 30.5°C, NOT 35°C theoretical.
// Vecellio et al. (2022) found people die 4.5°C earlier than theory predicted.

SEVERE_THRESHOLD: 30.5,    // Empirical survivability limit starts (Vecellio et al. 2022)
EXTREME_THRESHOLD: 31.2,   // EXTREME empirical limit - death likely even with some cooling access
                           // Vecellio et al. (2022): 30.5-31.2°C range for young/elderly
```

**Verification Required:**
- [ ] **CITATION EXISTS:** Does Vecellio et al. (2022) exist? Full citation?
- [ ] **CLAIM ACCURACY:** Does the paper report 30.5-31.2°C as empirical limits?
- [ ] **POPULATION SCOPE:** Does it specify "young/elderly" range as claimed?
- [ ] **TRL ACCURACY:** Is TRL 8 (controlled experiments) correct?
- [ ] **QUOTE REQUIRED:** Exact passage from paper supporting 30.5-31.2°C values

#### Claim 1B: 4.5°C gap between theoretical and empirical
```typescript
// From wetBulbTemperature.ts comments
// CRITICAL: Empirical limit is 4.5°C LOWER than theoretical 35°C limit
```

**Verification Required:**
- [ ] **CLAIM ACCURACY:** Does Vecellio et al. explicitly compare to 35°C theoretical?
- [ ] **QUOTE REQUIRED:** Passage supporting "4.5°C lower than theoretical" claim

#### Claim 1C: Journal attribution
```typescript
// From wetBulbEvents.ts:6
// - Vecellio et al. (2022): Empirical thresholds 30.5-31.2°C TW (TRL 8 - controlled experiments)
```

**Full Citation Needed:**
- Journal: [UNKNOWN - verify]
- Volume/Pages: [UNKNOWN - verify]
- DOI: [UNKNOWN - verify]
- Title: [UNKNOWN - verify exact title]

**Guess:** May be "Evaluating the 35°C wet-bulb temperature adaptability threshold for young, healthy subjects" in *Journal of Applied Physiology*?

### 2. Raymond et al. (2020) - SECONDARY CLAIM

**Location:**
- `src/types/wetBulbTemperature.ts:7`
- `src/simulation/config/centralConfig.ts:88`
- `src/simulation/wetBulbEvents.ts:7-8`

**Specific Claims Made:**

#### Claim 2A: 35°C is theoretical, not practical
```typescript
// From centralConfig.ts:85-92
/**
 * Wet bulb temperature threshold for human survival (°C)
 * @research Raymond et al. (2020) - 35°C WBT = 6-hour lethality (THEORETICAL)
 * @value 35 - Absolute physiological limit (THEORETICAL)
 * @deprecated Use WET_BULB_EMPIRICAL_LIMIT instead - 35°C is theoretical, people die at 30.5°C
 * @note Kept for backward compatibility only. DO NOT USE for mortality calculations.
 */
```

**Verification Required:**
- [ ] **CITATION EXISTS:** Confirm Raymond et al. (2020) exists
- [ ] **CLAIM ACCURACY:** Does paper report 35°C as theoretical limit?
- [ ] **CLAIM ACCURACY:** Does it specify "6-hour lethality"?
- [ ] **QUOTE REQUIRED:** Passage supporting "35°C = theoretical" claim

**Full Citation Needed:**
- Journal: [UNKNOWN - verify]
- Volume/Pages: [UNKNOWN - verify]
- DOI: [UNKNOWN - verify]
- Title: [UNKNOWN - verify exact title]

**Guess:** May be "The emergence of heat and humidity too severe for human tolerance" in *Science Advances*?

### 3. Mora et al. (2017) - CONTEXT CITATION

**Location:** `src/simulation/wetBulbEvents.ts:10`

**Claim Made:**
```typescript
// - Mora et al. (2017): Exponential frequency increase with warming (TRL 8 - climate projections)
```

**Verification Required:**
- [ ] **CITATION EXISTS:** Already verified in previous work? (Yes - this is a known citation)
- [ ] **CLAIM ACCURACY:** Does it support "exponential frequency increase" claim?
- [ ] **QUOTE REQUIRED:** If not previously verified, get passage

**Note:** This citation is context only, not the main claim of this commit. Lower priority for verification.

### 4. Historical Heatwave Calibration

**Location:**
- Commit message
- `logs/wet_bulb_fix_complete.md:67-73`
- `src/simulation/wetBulbEvents.ts:248-251`

**Specific Claims Made:**

#### Claim 4A: 2003 European heatwave
```typescript
// - 2003 European heatwave (~28-29°C TW): 70K deaths / 746M = 0.0094% mortality
```

**Verification Required:**
- [ ] **SOURCE NEEDED:** What is the source for "70K deaths"?
- [ ] **WET BULB TEMP:** What is the source for "28-29°C TW"?
- [ ] **POPULATION:** Is 746M correct for exposed population?

#### Claim 4B: 2010 Russian heatwave
```typescript
// - 2010 Russian heatwave (~30-31°C TW): 55K deaths / 143M = 0.038% mortality
```

**Verification Required:**
- [ ] **SOURCE NEEDED:** What is the source for "55K deaths"?
- [ ] **WET BULB TEMP:** What is the source for "30-31°C TW"?
- [ ] **POPULATION:** Is 143M correct?

#### Claim 4C: 2021 Pacific Northwest heatwave
```typescript
// - 2021 Pacific Northwest (~31-32°C TW): 1.5K deaths / 15M = 0.01% mortality
```

**Verification Required:**
- [ ] **SOURCE NEEDED:** What is the source for "1.5K deaths"?
- [ ] **WET BULB TEMP:** What is the source for "31-32°C TW"?
- [ ] **POPULATION:** Is 15M correct?

#### Claim 4D: 2015 India/Pakistan under-reporting
```typescript
// - 2015 India/Pakistan (~32-33°C TW): 3.5K deaths / 1.9B = 0.00018% mortality [ANOMALY - likely under-reported]
```

**Verification Required:**
- [ ] **SOURCE NEEDED:** What is the source for this data?
- [ ] **JUSTIFICATION NEEDED:** What evidence supports "under-reported" claim?

### 5. Mortality Rate Changes

**Location:** `src/simulation/wetBulbEvents.ts:277-308`

**Claims Made:**
```typescript
// Updated `getWetBulbThreshold()` mortality rates:
// - EXTREME (31.2°C): 0.001 → 0.002 (doubled - now 0.2% of exposed)
// - SEVERE (30.5°C): 0.0004 → 0.0015 (3.75× increase)
// - HIGH (29.5°C): 0.0015 → 0.0009 (rebalanced)
// - MODERATE (28°C): 0.0009 → 0.0004 (rebalanced)
```

**Verification Required:**
- [ ] **CALIBRATION JUSTIFICATION:** How were these specific rates derived from historical data?
- [ ] **RESEARCH BACKING:** Are these rates empirically grounded or model-fitted?

**Note:** The commit message states "Mortality calibrated to historical data (40-60% underestimation fixed)" but the specific methodology for deriving these rates needs documentation.

---

## Verification Priority

### CRITICAL (Must verify before merge)
1. ✅ Vecellio et al. (2022) citation existence and 30.5-31.2°C claim
2. ✅ Raymond et al. (2020) citation existence and 35°C theoretical claim

### HIGH (Should verify soon)
3. Historical heatwave data sources (2003 EU, 2010 Russian, 2021 PNW)
4. Methodology for mortality rate calibration

### MEDIUM (Nice to verify)
5. Mora et al. (2017) exponential frequency claim (likely already verified)
6. 2015 India/Pakistan under-reporting justification

---

## Verification Instructions for Research Agents

**For super-alignment-researcher (Cynthia):**
1. Find full citations for Vecellio et al. (2022) and Raymond et al. (2020)
2. Extract exact quotes supporting the specific claims above
3. Find sources for historical heatwave data (deaths, wet bulb temps, populations)
4. Document methodology for deriving mortality rates from historical data

**For research-skeptic (Sylvia):**
1. Check if Vecellio et al. (2022) is being correctly interpreted (not cherry-picked)
2. Verify that 35°C vs 30.5°C comparison is apples-to-apples (same exposure duration, same populations)
3. Look for contradictory evidence (papers that support 35°C as practical limit)
4. Evaluate if historical heatwave data is representative (selection bias?)
5. Challenge the "40-60% underestimation" claim - how was this calculated?

---

## Expected Outcome

**If verification PASSES:**
- Update this file with full citations and quotes
- Mark commit as research-validated
- Update wiki with complete research foundation

**If verification FAILS:**
- Document what claims are not supported
- Propose corrections or rollback
- Update research files with accurate citations

---

## Notes

**Why this verification is critical:**

This commit changes a fundamental parameter (wet bulb survivability limit) by 4.5°C, which has cascading effects throughout the simulation. The claim is that previous implementation underestimated heat mortality by 40-60%. This is a major parameter change that MUST be empirically grounded.

**Red flags to watch for:**
- Are we comparing controlled lab experiments (Vecellio) to field observations (Raymond)? Different exposure durations?
- Are the historical heatwave wet bulb temps calculated or measured?
- Is the "40-60% underestimation" claim justified by the data?
- Are mortality rates fitted to match historical data (circular reasoning) or derived from first principles?

**What "good" looks like:**
- Vecellio et al. paper clearly states empirical limits in 30.5-31.2°C range
- Raymond et al. paper explicitly discusses theoretical vs practical limits
- Historical heatwave data comes from peer-reviewed epidemiological studies
- Mortality rate calibration methodology is documented and defensible
