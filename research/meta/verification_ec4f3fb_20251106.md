# Research Verification File - Commit ec4f3fb
**Date:** November 6, 2025
**Commit:** ec4f3fb17b3643ebe94f906afa5495139af3c81f
**Author:** Claude Autonomous Worker (researcher)
**Purpose:** Verify research backing for bifurcation integration and mortality stabilizer parameter centralization

## Summary

This commit addresses HIGH-1 and HIGH-2 from `reviews/architecture-post-week4-integration-review_20251106.md`:
1. **Bifurcation-aware state validation** - Prevents false positive crashes when variance amplification exceeds baseline bounds
2. **Mortality stabilizer parameter centralization** - Moves 58 hardcoded parameters to central config with research citations

## Changes Requiring Verification

### 1. Bifurcation Variance Amplification (ClimateImpactCascadePhase.ts)

**Location:** `src/simulation/engine/phases/ClimateImpactCascadePhase.ts:142-245`

**Claims Made:**
1. **Line 42-43 (JSDoc comment):** "Research: Scheffer et al. (2014), Richardson et al. (2023) - critical slowing down"
   - **Claim:** Near tipping points, variance amplification creates extreme variance in climate impacts
   - **Specific assertion:** 1×-10× amplification range is valid for bifurcating systems

2. **Line 156-162 (heat wave intensity):** Base intensity amplified by `varianceAmplification / 5.0`
   - **Claim:** Heat wave intensity near tipping points varies by up to 2× (10/5) from baseline
   - **Needs verification:** Does research support 2× variance in heat wave intensity near climate tipping points?

3. **Line 196-202 (drought intensity):** Same amplification pattern
   - **Claim:** Drought intensity varies by up to 2× near tipping points
   - **Needs verification:** Does research support 2× variance in drought severity near tipping points?

4. **Line 239-245 (ecosystem collapse):** Same amplification pattern
   - **Claim:** Ecosystem collapse intensity varies by up to 2× near tipping points
   - **Needs verification:** Does research support 2× variance in ecosystem collapse rate?

**Verification Needed:**
- [ ] **Scheffer et al. (2014)** - Confirm this paper discusses critical slowing down and variance amplification
  - Does it provide quantitative variance amplification ranges?
  - Does it mention climate impacts specifically?
- [ ] **Richardson et al. (2023)** - Confirm this paper discusses variance in bifurcating systems
  - Does it provide quantitative amplification factors?
  - Is it applicable to climate tipping points?
- [ ] **Amplification factor (÷5)** - Is the 2× maximum variance (10/5) research-backed or arbitrary?

### 2. New Assertion Utility (assertions.ts)

**Location:** `src/simulation/utils/assertions.ts:+26 lines`

**Function:** `capWithBifurcationAwareness(value, max, context)`

**Claims Made:**
- Prevents crashes when bifurcation amplification exceeds baseline bounds
- Example: 40% mortality × 3.0 = 120% → capped to 100%

**Verification Needed:**
- [ ] This is defensive engineering, not a research claim - **NO VERIFICATION NEEDED**

### 3. Mortality Stabilizer Parameters (centralConfig.ts)

**Location:** `src/simulation/config/centralConfig.ts:89-1111`

**58 parameters migrated with research citations. Verification organized by domain:**

#### 3A. Heat Adaptation Parameters

**Claims Made (14 parameters, all citing Ballester et al. 2024):**

1. **Line 476-480 (HEAT_ADAPTATION_PHYSIOLOGICAL_RATE: 0.05):**
   - **Claim:** "5% per month (reaches 20% max in ~4 months)"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Adaptation develops over weeks"
   - **Needs verification:** Does Ballester 2024 provide 5%/month rate? Or is this extrapolated from "weeks"?

2. **Line 486-490 (HEAT_ADAPTATION_BEHAVIORAL_RATE: 0.1):**
   - **Claim:** "10% per month (reaches 30% max in ~3 months)"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Rapid behavioral change"
   - **Needs verification:** Does Ballester 2024 quantify "rapid" as 10%/month?

3. **Line 496-500 (HEAT_ADAPTATION_INFRASTRUCTURAL_RATE: 0.02):**
   - **Claim:** "2% per month (reaches 50% max in ~25 months after 12-month delay)"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Years to build infrastructure"
   - **Needs verification:** Does Ballester 2024 specify 2-3 year timeline for infrastructure?

4. **Line 506-510 (HEAT_ADAPTATION_SOCIAL_RATE: 0.03):**
   - **Claim:** "3% per month (reaches 40% max in ~13 months after 6-month delay)"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Months to years for policy"
   - **Needs verification:** Does Ballester 2024 quantify policy timelines?

5. **Line 516-520 (HEAT_ADAPTATION_PHYSIOLOGICAL_MIN_EXPOSURE: 0.5):**
   - **Claim:** "2 weeks minimum exposure"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Weeks to develop"
   - **Needs verification:** Does Ballester 2024 specify 2-week threshold?

6. **Line 526-530 (HEAT_ADAPTATION_BEHAVIORAL_MIN_EXPOSURE: 0.25):**
   - **Claim:** "~1 week minimum exposure"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Immediate to rapid response"
   - **Needs verification:** Does Ballester 2024 provide 1-week threshold?

7. **Line 536-540 (HEAT_ADAPTATION_INFRASTRUCTURAL_MIN_EXPOSURE: 12):**
   - **Claim:** "1 year before infrastructure investment begins"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Requires sustained crisis"
   - **Needs verification:** Does Ballester 2024 specify 1-year threshold?

8. **Line 546-550 (HEAT_ADAPTATION_SOCIAL_MIN_EXPOSURE: 6):**
   - **Claim:** "6 months before policy adaptation begins"
   - **Citation:** Ballester et al. (2024), Nature Medicine - "Policy response lags"
   - **Needs verification:** Does Ballester 2024 quantify policy lag?

9. **Line 1126-1130 (HEAT_ADAPTATION_PHYSIOLOGICAL_MAX: 0.2):**
   - **Claim:** "20% mortality reduction from physiological adaptation"
   - **Citation:** Ballester et al. (2024), Nature Medicine
   - **Needs verification:** Does Ballester 2024 provide this specific effectiveness value?

10. **Line 1136-1140 (HEAT_ADAPTATION_BEHAVIORAL_MAX: 0.3):**
    - **Claim:** "30% mortality reduction from behavioral adaptation"
    - **Citation:** Ballester et al. (2024), Nature Medicine
    - **Needs verification:** Does Ballister 2024 provide this value?

11. **Line 1146-1150 (HEAT_ADAPTATION_INFRASTRUCTURAL_MAX: 0.5):**
    - **Claim:** "50% mortality reduction from infrastructural adaptation"
    - **Citation:** Ballester et al. (2024), Nature Medicine
    - **Needs verification:** Does Ballester 2024 provide this value?

12. **Line 1156-1160 (HEAT_ADAPTATION_SOCIAL_MAX: 0.4):**
    - **Claim:** "40% mortality reduction from social adaptation"
    - **Citation:** Ballester et al. (2024), Nature Medicine
    - **Needs verification:** Does Ballester 2024 provide this value?

13. **Line 1166-1170 (HEAT_ADAPTATION_TOTAL_MAX: 0.8):**
    - **Claim:** "80% total mortality reduction (empirical maximum observed)"
    - **Citation:** Ballester et al. (2024), Nature Medicine
    - **Needs verification:** Does Ballester 2024 report 80% total reduction as empirical maximum?

14. **Line 725-729 (HEAT_ADAPTATION_INFRASTRUCTURE_GDP_THRESHOLD: 10000):**
    - **Claim:** "$10k+ GDP per capita required for infrastructure investment"
    - **Citation:** Ballester et al. (2024), Nature Medicine - "Wealth-dependent adaptation"
    - **Needs verification:** Does Ballester 2024 specify $10k threshold?

**CRITICAL NOTE on Ballester et al. (2024):**
- This single paper is cited 14 times for heat adaptation parameters
- Many claims are SPECIFIC VALUES (5%/mo, 20%, 30%, etc.)
- **Layer 2 verification ESSENTIAL:** Does the paper actually provide these values, or are they extrapolations?

#### 3B. International Aid Parameters

**Claims Made (8 parameters, all citing Cavalcanti et al. 2025):**

1. **Line 1121 (AID_EFFECTIVENESS_HIGH: 0.295):**
   - **Claim:** "29.5% mortality reduction (midpoint of 15-44% range)"
   - **Citation:** Cavalcanti et al. (2025), The Lancet - "USAID aid effectiveness"
   - **Needs verification:** Does Cavalcanti 2025 provide 15-44% range? Is 29.5% the midpoint they recommend?

2. **Line 1128 (AID_EFFECTIVENESS_MEDIUM: 0.185):**
   - **Claim:** "18.5% mortality reduction (midpoint of 9-28% range)"
   - **Citation:** Cavalcanti et al. (2025), The Lancet
   - **Needs verification:** Does the paper provide 9-28% range for medium effectiveness?

3. **Line 1135 (AID_EFFECTIVENESS_LOW: 0.08):**
   - **Claim:** "8% mortality reduction (midpoint of 6-10% range)"
   - **Citation:** Cavalcanti et al. (2025), The Lancet
   - **Needs verification:** Does the paper provide 6-10% range for low effectiveness?

4. **Line 1142 (AID_EFFECTIVENESS_MAX: 0.44):**
   - **Claim:** "44% mortality reduction (upper bound of observed range)"
   - **Citation:** Cavalcanti et al. (2025), The Lancet
   - **Needs verification:** Is 44% the observed maximum?

5. **Line 675-679 (AID_DONOR_AVAILABILITY_HIGH: 0.8):**
   - **Claim:** "Above 80% availability = high effectiveness"
   - **Citation:** Cavalcanti et al. (2025), The Lancet - "Aid effectiveness tiers"
   - **Needs verification:** Does Cavalcanti 2025 define 80% threshold for high tier?

6. **Line 684-688 (AID_DONOR_AVAILABILITY_MEDIUM: 0.5):**
   - **Claim:** "Above 50% availability = medium effectiveness"
   - **Citation:** Cavalcanti et al. (2025), The Lancet
   - **Needs verification:** Does the paper define 50% threshold?

7. **Line 693-697 (AID_DONOR_AVAILABILITY_LOW: 0.2):**
   - **Claim:** "Above 20% availability = low effectiveness"
   - **Citation:** Cavalcanti et al. (2025), The Lancet
   - **Needs verification:** Does the paper define 20% threshold?

8. **Line 621-625 (DONOR_FATIGUE_PER_CRISIS: 0.25):**
   - **Claim:** "25% fatigue per additional crisis"
   - **Citation:** "Pakistan 2010: 50% of Haiti's aid (2 simultaneous crises)"
   - **Needs verification:**
     - Is Pakistan 2010 data accurate (50% of Haiti aid)?
     - Is 25% per crisis a valid extrapolation (50% for 2nd crisis → 25% linear)?
     - Is there peer-reviewed research on donor fatigue rates?

#### 3C. Migration Parameters

**Claims Made (11 parameters, all citing IOM 2024):**

1. **Line 1176 (MIGRATION_SUCCESS_RATE_BASELINE: 0.85):**
   - **Claim:** "85% successful relocation rate"
   - **Citation:** IOM (2024), World Migration Report - "Climate migration patterns"
   - **Needs verification:** Does IOM 2024 report 85% success rate for climate migration?

2. **Line 1182 (MIGRATION_MORTALITY_BASELINE: 0.001):**
   - **Claim:** "0.1% baseline mortality during migration (<1% observed)"
   - **Citation:** IOM (2024), World Migration Report
   - **Needs verification:** Does IOM 2024 provide <1% mortality rate?

3. **Line 1188 (MIGRATION_MORTALITY_MAX: 0.03):**
   - **Claim:** "3% cap for extreme crisis conditions"
   - **Citation:** IOM (2024), World Migration Report
   - **Needs verification:** Does IOM 2024 specify 3% maximum?

4. **Line 1194 (MIGRATION_RETURN_RATE_BASELINE: 0.85):**
   - **Claim:** "85% return rate within 1 year"
   - **Citation:** IOM (2024), World Migration Report
   - **Needs verification:** Does IOM 2024 report 85% annual return rate?

5. **Line 555-559 (MIGRATION_CRISIS_PENALTY: 0.3):**
   - **Claim:** "30% reduction in success rate at maximum crisis severity"
   - **Citation:** IOM (2024), World Migration Report - "Crisis trapping effects"
   - **Needs verification:** Does IOM 2024 quantify crisis trapping as 30% penalty?

6. **Line 565-569 (MIGRATION_MAX_DISTANCE_PENALTY: 0.4):**
   - **Claim:** "40% reduction for very long journeys (>5000 km)"
   - **Citation:** IOM (2024), World Migration Report - "Distance-mortality relationship"
   - **Needs verification:** Does IOM 2024 provide distance-based mortality curves?

7. **Line 575-579 (MIGRATION_DISTANCE_SCALE: 5000):**
   - **Claim:** "Distance that produces maximum penalty"
   - **Citation:** IOM (2024), World Migration Report - "Average displacement distances"
   - **Needs verification:** Does IOM 2024 specify 5000km as a threshold?

8. **Line 585-589 (MIGRATION_CRISIS_MORTALITY_INCREASE: 0.02):**
   - **Claim:** "Up to 2% additional mortality in extreme crises"
   - **Citation:** IOM (2024), World Migration Report - "Crisis-related mortality"
   - **Needs verification:** Does IOM 2024 provide 2% value?

9. **Line 595-599 (MIGRATION_DISTANCE_MORTALITY_INCREASE: 0.01):**
   - **Claim:** "Up to 1% additional mortality for very long journeys"
   - **Citation:** IOM (2024), World Migration Report
   - **Needs verification:** Does IOM 2024 quantify distance mortality?

10. **Line 605-609 (MIGRATION_RETURN_CRISIS_PENALTY: 0.8):**
    - **Claim:** "80% reduction in return rate at maximum crisis severity"
    - **Citation:** IOM (2024), World Migration Report - "Permanent displacement"
    - **Needs verification:** Does IOM 2024 provide crisis-return relationship?

11. **Line 615-619 (MIGRATION_EVACUATION_FRACTION: 0.3):**
    - **Claim:** "Assume 30% of population can migrate if needed"
    - **Citation:** "[RESEARCH NEEDED] - Fraction of population that can evacuate"
    - **Needs verification:** **UNVERIFIED** - No research backing provided

#### 3D. Emergency Response Parameters

**Claims Made (9 parameters, all citing GAO 2025):**

1. **Line 1199-1203 (EMERGENCY_RESPONSE_BASELINE: 0.30):**
   - **Claim:** "30% mortality reduction (midpoint of 20-40% estimate)"
   - **Citation:** GAO (2025), FEMA data - "Federal emergency response audit"
   - **Note:** "@note WEAK EVIDENCE - estimate, not empirical"
   - **Needs verification:** Does GAO 2025 provide 20-40% range, or is this an estimate?

2. **Line 1209-1213 (EMERGENCY_RESPONSE_MAX: 0.40):**
   - **Claim:** "40% mortality reduction (upper bound estimate)"
   - **Citation:** GAO (2025), FEMA data
   - **Note:** "@note WEAK EVIDENCE - estimate, not empirical"
   - **Needs verification:** Is 40% maximum justified by GAO 2025?

3. **Line 631-635 (EMERGENCY_RESPONSE_WORKFORCE_SCALE: 1.0):**
   - **Claim:** "Linear scaling with workforce availability"
   - **Citation:** GAO (2025), FEMA data - "Workforce availability impact"
   - **Needs verification:** Does GAO 2025 show linear or non-linear scaling?

4. **Line 641-645 (EMERGENCY_RESPONSE_PREPAREDNESS_MIN: 0.5):**
   - **Claim:** "50% minimum effectiveness with zero preparedness"
   - **Citation:** GAO (2025), FEMA data
   - **Needs verification:** Does GAO 2025 provide this baseline?

5. **Line 651-655 (EMERGENCY_RESPONSE_RESOURCE_MIN: 0.3):**
   - **Claim:** "30% minimum effectiveness with zero resources"
   - **Citation:** GAO (2025), FEMA data
   - **Needs verification:** Does GAO 2025 quantify resource impact?

6. **Line 661-665 (EMERGENCY_RESPONSE_COMMUNICATION_MIN: 0.3):**
   - **Claim:** "30% minimum effectiveness without communications"
   - **Citation:** GAO (2025), FEMA data
   - **Needs verification:** Does GAO 2025 address communication infrastructure?

7. **Line 671-675 (EMERGENCY_RESPONSE_OVERWHELM_MIN: 0.2):**
   - **Claim:** "20% minimum effectiveness when overwhelmed"
   - **Citation:** GAO (2025), FEMA data - "Nov 2024 hurricanes: 4% workforce available"
   - **Needs verification:**
     - Does GAO 2025 report Nov 2024 hurricane data?
     - Is 20% minimum extrapolated from 4% workforce scenario?

8. **Line 681-685 (EMERGENCY_RESPONSE_CRISIS_SCALE_PENALTY: 0.8):**
   - **Claim:** "80% reduction at maximum crisis scale"
   - **Citation:** GAO (2025), FEMA data - "Large-scale crisis degradation"
   - **Needs verification:** Does GAO 2025 quantify degradation curves?

9. **Line 747-751 (EMERGENCY_RESPONSE_LOCAL_CRISIS_SCALE: 0.3):**
   - **Claim:** "Local crisis = 0.3 scale (30% of system stressed)"
   - **Citation:** GAO (2025), FEMA data - "Crisis scale classification"
   - **Needs verification:** Does GAO 2025 define local vs global crisis scales?

**CRITICAL NOTE on GAO (2025) / FEMA data:**
- Paper explicitly marked as "WEAK EVIDENCE - estimate, not empirical"
- 9 parameters rely on this single source
- May be government audit report, not peer-reviewed research
- **Layer 2 verification ESSENTIAL:** Is this academic research or policy document?

#### 3E. Major Economy Collapse Parameters

**Claims Made (5 parameters):**

1. **Line 702-706 (MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD: 2.0):**
   - **Claim:** "Below stage 2.0 (middle-income) = collapsed economy"
   - **Citation:** "[RESEARCH NEEDED] - Economic collapse definition"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

2. **Line 712-716 (MAJOR_ECONOMY_POPULATION_THRESHOLD: 300):**
   - **Claim:** "300M+ baseline population = major economy"
   - **Citation:** "[RESEARCH NEEDED] - Major economy definition"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

3. **Line 722-726 (MAJOR_ECONOMY_POPULATION_COLLAPSE_FRACTION: 0.5):**
   - **Claim:** "Below 50% of baseline = population collapse"
   - **Citation:** "Historical population crashes (Black Death: 30-60%)"
   - **Needs verification:**
     - Is Black Death 30-60% data accurate?
     - Is this analogous to modern economic collapse scenarios?
     - Is there peer-reviewed research on collapse thresholds?

4. **Line 732-736 (MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD: 0.5):**
   - **Claim:** ">50% of major economies collapsed = global crisis (aid fails)"
   - **Citation:** "[RESEARCH NEEDED] - Global vs regional crisis definition"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

#### 3F. Cascade Multipliers

**Claims Made (5 parameters):**

1. **Line 913-917 (CASCADE_AID_TO_EMERGENCY_RESPONSE: 0.5):**
   - **Claim:** "50% degradation when aid fails (coordination collapse)"
   - **Citation:** "[RESEARCH NEEDED] - Interdependence of humanitarian systems"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

2. **Line 923-927 (CASCADE_AID_TO_MIGRATION: 0.3):**
   - **Claim:** "30% degradation when aid fails (routes disrupted)"
   - **Citation:** "[RESEARCH NEEDED] - Humanitarian logistics impact"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

3. **Line 933-937 (CASCADE_EMERGENCY_TO_MIGRATION: 0.5):**
   - **Claim:** "50% degradation when emergency response fails"
   - **Citation:** "[RESEARCH NEEDED] - Emergency system collapse impact"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

4. **Line 943-947 (CASCADE_FAILURE_THRESHOLD: 0.3):**
   - **Claim:** "Below 30% functioning = failed mechanism"
   - **Citation:** "[RESEARCH NEEDED] - Functional system thresholds"
   - **Needs verification:** **UNVERIFIED** - No research backing provided

#### 3G. WBT Thresholds (Updated)

**Claims Made (3 parameters):**

1. **Line 92-97 (WET_BULB_EMPIRICAL_LIMIT: 30.5):**
   - **Claim:** "Empirical survivability limit where heat adaptation ceases"
   - **Citation:** Vecellio et al. (2024), Nature - "30.5°C WBT = empirical limit"
   - **Note:** "LOWER than theoretical 35°C - use this for mortality stabilizers"
   - **Needs verification:** Does Vecellio 2024 provide 30.5°C as empirical limit distinct from theoretical?

2. **Line 103-107 (WET_BULB_STRESS_THRESHOLD: 28):**
   - **Claim:** "Heat stress threshold where heat adaptation begins developing"
   - **Citation:** Raymond et al. (2020), Science - "28°C WBT = heat stress begins"
   - **Needs verification:** Does Raymond 2020 specify 28°C as adaptation onset?

3. **Line 91 (WET_BULB_LETHAL_THRESHOLD: 35):**
   - **Updated note:** "THEORETICAL" limit (was "Absolute physiological limit")
   - **Citation:** Raymond et al. (2020)
   - **Needs verification:** No change, but clarified as theoretical vs empirical

## Summary of Verification Needs

### By Priority

**CRITICAL (Must verify before use):**
1. **Ballester et al. (2024)** - 14 heat adaptation parameters
   - Are specific rates (5%/mo, 10%/mo, etc.) in the paper or extrapolated?
   - Are effectiveness values (20%, 30%, 50%, 40%, 80%) empirical or modeled?
2. **Cavalcanti et al. (2025)** - 8 aid effectiveness parameters
   - Are the ranges (15-44%, 9-28%, 6-10%) directly from the paper?
   - Are the tier thresholds (80%, 50%, 20%) defined in the paper?
3. **GAO (2025) / FEMA data** - 9 emergency response parameters
   - Is this peer-reviewed research or government audit?
   - Marked as "WEAK EVIDENCE" - needs alternative sources

**HIGH (Should verify soon):**
4. **IOM (2024)** - 11 migration parameters
   - World Migration Report is typically high-quality, but verify specific values
5. **Scheffer et al. (2014) / Richardson et al. (2023)** - Bifurcation amplification
   - Confirm papers support 1×-10× amplification and climate application

**MEDIUM (Can defer):**
6. **UNVERIFIED parameters** - 8 total with "[RESEARCH NEEDED]" tags
   - Migration evacuation fraction (30%)
   - Major economy collapse thresholds (4 parameters)
   - Cascade multipliers (4 parameters)
7. **Historical analogies** - Black Death comparison for collapse fraction

### Verification Checklist

**Layer 1 - Citation Existence:**
- [ ] Ballester et al. (2024), Nature Medicine - Does this paper exist?
- [ ] Cavalcanti et al. (2025), The Lancet - Does this paper exist?
- [ ] IOM (2024), World Migration Report - Does this report exist?
- [ ] GAO (2025), FEMA data - Does this audit/report exist?
- [ ] Vecellio et al. (2024), Nature - Does this paper exist?
- [ ] Raymond et al. (2020), Science - Does this paper exist?
- [ ] Scheffer et al. (2014) - Does this paper exist?
- [ ] Richardson et al. (2023) - Does this paper exist?

**Layer 2 - CLAIM VERIFICATION (CRITICAL):**

For EACH citation above:
- [ ] Locate specific passage supporting each claim
- [ ] Quote exact text from paper
- [ ] Flag any extrapolations or interpretations
- [ ] Mark claims as VERIFIED or UNVERIFIED

**High-risk areas:**
- Ballester 2024: 14 specific numerical values
- Cavalcanti 2025: Tier thresholds and ranges
- GAO 2025: "WEAK EVIDENCE" tag - may need alternative sources
- "[RESEARCH NEEDED]" tags: 8 unverified parameters

## Files Changed

1. **src/simulation/config/centralConfig.ts** (+414 lines)
   - 58 new parameters across 6 domains
   - All parameters have JSDoc citations
   - 8 parameters explicitly marked "[RESEARCH NEEDED]"

2. **src/simulation/engine/phases/MortalityStabilizersPhase.ts** (refactored)
   - Hardcoded values replaced with config imports
   - Research citations now in central config

3. **src/simulation/engine/phases/ClimateImpactCascadePhase.ts** (+41 lines)
   - Bifurcation variance amplification added
   - 3 impact types (heat, drought, ecosystem) now use amplification

4. **src/simulation/utils/assertions.ts** (+26 lines)
   - New `capWithBifurcationAwareness()` utility
   - No research claims (defensive engineering)

## Next Steps

1. **Orchestrator workflow** (recommended):
   - Research phase: super-alignment-researcher locates and reads all 8 papers
   - Validation phase: research-skeptic performs Layer 2 claim verification
   - Implementation phase: Update parameters or mark as UNVERIFIED if not supported
   - Documentation phase: Update verification file with findings

2. **Priority order**:
   - Start with Ballester 2024 (14 parameters, most critical)
   - Then Cavalcanti 2025 (8 parameters, aid system)
   - Then GAO 2025 (9 parameters, marked WEAK EVIDENCE)
   - Finally IOM 2024, bifurcation papers, WBT papers

3. **Expected outcomes**:
   - Some parameters will be VERIFIED (directly from paper)
   - Some will be EXTRAPOLATED (calculated from paper data)
   - Some will be UNVERIFIED (not in paper, need new research)
   - 8 parameters already marked "[RESEARCH NEEDED]"

---

**STATUS:** Research verification file created, ready for orchestrator workflow
**ESTIMATED EFFORT:** 2-3 days for full Layer 2 verification of 8 papers
**BLOCKING:** No - simulation can run with current values, but research quality uncertain
