# Mechanism Audit: Mortality Systems
**Date:** November 23, 2025
**Auditor:** simulation-maintainer (Roy)
**Priority:** HIGH (Sylvia/Cynthia consensus)

---

## Executive Summary

**VERDICT: CONDITIONAL PASS**

The mortality systems are research-grounded but contain notable structural gaps between citations and implementation:

| Mechanism | Verdict | Issues |
|-----------|---------|--------|
| Nuclear Winter Starvation | PARTIAL MATCH | Calibrated to Xia's total, but monthly rate is derived formula, not from paper |
| Aid Effectiveness | MATCH | Parameters match Cavalcanti et al. (2025) |
| Heat Adaptation | PARTIAL MATCH | 80% max cited incorrectly - actual empirical max is 44% (FIXED in config) |
| Migration | STRUCTURAL FABRICATION | IOM (2024) is qualitative only - quantitative params are extrapolations |

**Key Finding:** Migration mechanism has the weakest foundation - the 85% survival rate and <1% mortality claims are modeling assumptions presented as research-backed parameters. The research document acknowledges this but the code does not clearly flag it.

---

## 1. Nuclear Winter Starvation Rate

### Claimed Source: Xia et al. (2022), Nature Food

**Location:** `src/simulation/nuclearWinter.ts`, lines 378-475

### Implementation:

The `calculateStarvationRate()` function:
1. Takes crop yield (0-1), months since war, and resilient food multiplier
2. Calculates food shortage as `1 - cropYield`
3. Applies ramp-up (0-6 months), peak (6-24 months), and recovery (24+ months) multipliers
4. Uses `NUCLEAR_WINTER_MONTHLY_BASE = 0.12` (12% monthly at 90% crop failure)
5. Formula: `baseRate = shortage * (0.12 / 0.9)` = ~13.3% per 100% shortage

**Code Comment (lines 381-412):**
```
* TIER 3 BRONZE - Modeling assumption (calibrated to Xia et al. 2022)
* CONCEPT SUPPORT: Nuclear winter causes massive famine (Xia et al. 2022, Robock & Toon 2012)
* QUANTIFICATION: Calibrated to Xia's 5-6B deaths, NOT from historical famine rates
* UNCERTAINTY: +/-50%
```

### Paper Says:

From `research/mortality_caps_historical_data_20251027.md` Section 4.1:
- Xia et al. (2022) projects "More than 5 billion could die" in full-scale US-Russia nuclear war (150 Tg soot)
- This is from agricultural collapse over 3-5 years
- Paper provides TOTAL mortality estimate, not monthly rates
- Monthly rate estimation in research doc: "If 5 billion deaths over 3-5 years = 83-139 million/month = 1.0-1.7% per month sustained"

### Verdict: PARTIAL MATCH

**What Matches:**
- The code correctly cites Xia et al. (2022) for the concept
- The 5-6B total death projection is accurately sourced
- The code explicitly acknowledges this is "calibrated to" rather than "from" the paper

**What Doesn't Match:**
- The 10-15% monthly mortality claim in code comments is the DERIVED calibration, not from Xia
- Xia doesn't provide monthly mortality rates - the code reverse-engineers these
- The research document's calculation (1.0-1.7% monthly) differs significantly from code's 12% base
- The 12% monthly rate is actually calibrated to reach Xia's totals over the peak period, not from any paper

**Classification:** This is NOT structural fabrication because:
1. Code clearly marks it as "calibrated to" not "derived from"
2. The TIER 3 BRONZE tag acknowledges modeling assumption
3. The derivation methodology is documented

**Issue:** The comments claim "10-15% monthly mortality" as if from research, but this specific range isn't in Xia. The research document's estimate (1.0-1.7%) is also calibration, not from the paper. The 12% base rate produces realistic 5-6B deaths but should be more clearly labeled as a derived parameter.

### Recommendations:
1. Update comment to clarify: "12% monthly rate derived via reverse-engineering from Xia's 5-6B total, not directly from paper"
2. Consider adding uncertainty range to the base rate parameter

---

## 2. Mortality Stabilizers - Aid Effectiveness

### Claimed Source: Cavalcanti et al. (2025), The Lancet

**Location:** `src/simulation/engine/phases/MortalityStabilizersPhase.ts`, lines 257-309; `src/simulation/config/centralConfig.ts`, lines 1151-1183

### Implementation:

Aid effectiveness levels from centralConfig.ts:
- HIGH (donor availability >80%): 29.5% mortality reduction (midpoint of 15-44%)
- MEDIUM (donor availability >50%): 18.5% mortality reduction (midpoint of 9-28%)
- LOW (donor availability >20%): 8% mortality reduction (midpoint of 6-10%)
- MAX: 44% (upper bound)

### Paper Says:

From `research/mortality_stabilizing_mechanisms_20251030.md` Section 1.1:
- All-age mortality: 15% reduction (RR 0.85, 95% CI 0.78-0.93)
- Under-five mortality: 32% reduction (RR 0.68, 95% CI 0.57-0.80)
- Funding-mortality relationship:
  - Low ($1.97-3.96): 6-10% reduction
  - Intermediate ($3.97-7.09): 9-28% reduction
  - High ($7.10+): 15-44% reduction

### Verdict: MATCH

**What Matches:**
- The 15-44% range for high funding is directly from Cavalcanti
- The 9-28% range for intermediate is directly from Cavalcanti
- The 6-10% range for low funding is directly from Cavalcanti
- The 44% maximum is the empirical upper bound from the study

**Notes:**
- The centralConfig.ts correctly notes that donor availability thresholds (80%, 50%, 20%) are "MODELING ASSUMPTIONS" - Cavalcanti provides effectiveness values, not availability thresholds
- This is properly documented: "Cavalcanti reports MORTALITY REDUCTION from aid funding, NOT donor availability"

**Classification:** No structural fabrication. Parameters match source. Mapping from donor availability to effectiveness tiers is acknowledged as modeling assumption.

---

## 3. Mortality Stabilizers - Heat Adaptation

### Claimed Source: Ballester et al. (2024), Nature Medicine

**Location:** `src/simulation/engine/phases/MortalityStabilizersPhase.ts`, lines 324-454; `src/simulation/config/centralConfig.ts`, lines 1186-1220

### Implementation:

From centralConfig.ts:
- Physiological max: 20%
- Behavioral max: 30%
- Infrastructural max: 50%
- Social max: 40%
- **TOTAL_MAX: 45%** (was 80%, FIXED Nov 2025)

Code comment:
```
* @value 0.45 - 45% total mortality reduction (empirical maximum observed, NOT 80%)
* @note CRITICAL FIX (Nov 2025): Previous value of 0.8 was 82% overestimate.
*       Ballester 2024 shows 44% adaptation effect (0.44), rounded to 0.45 for safety margin.
```

### Paper Says:

From `research/mortality_stabilizing_mechanisms_20251030.md` Section 2.1:
- Ballester et al. (2024): "Would have been 80% higher without adaptation"
- This means adaptation reduced mortality BY a factor that would have been 80% higher, NOT that adaptation reduces mortality by 80%
- The actual finding: 47,690 deaths occurred; without adaptation ~85,000 would have occurred
- This translates to ~44% reduction ((85000-47690)/85000 = 44%)

### Verdict: PARTIAL MATCH (PREVIOUSLY STRUCTURAL FABRICATION, NOW FIXED)

**What Now Matches:**
- The 45% max is close to the empirical 44% from Ballester
- The fix acknowledges the previous error
- Individual adaptation type breakdowns (physiological 20%, behavioral 30%, etc.) are from Vicedo-Cabrera et al. (2022) framework

**Historical Issue (Now Fixed):**
- Previous 80% max was a misreading of "80% higher without adaptation"
- "80% higher" means baseline would be 1.8x current, so reduction = 1 - (1/1.8) = 44%
- This was a significant mathematical error that inflated adaptation effectiveness

**Remaining Issue:**
- The sub-component breakdowns (physiological: 10-20%, behavioral: 20-30%, etc.) are from Vicedo-Cabrera's FRAMEWORK, which provides categorical distinctions, not specific percentages
- The specific percentages appear to be reasonable modeling assumptions within the framework

**Classification:** The main 80%->45% fix addresses the structural fabrication. Sub-component parameters are extrapolations from the framework, appropriately used.

### Recommendations:
1. None critical - the fix is already in place
2. Could add note that sub-component percentages are framework-guided estimates

---

## 4. Mortality Stabilizers - Migration

### Claimed Source: IOM (2024), World Migration Report

**Location:** `src/simulation/engine/phases/MortalityStabilizersPhase.ts`, lines 464-555; `src/simulation/config/centralConfig.ts`, lines 1223-1250

### Implementation:

From centralConfig.ts:
- Success rate baseline: 85%
- Mortality baseline: 0.1% (<1%)
- Mortality max: 3%
- Return rate baseline: 85%

Code comments (e.g., line 1227):
```
* @value 0.85 - 85% successful relocation rate
* @note [MODELING ASSUMPTION] IOM (2024) World Migration Report provides QUALITATIVE
*       analysis of climate migration patterns, NOT quantitative success rates.
*       This value is extrapolated from qualitative findings.
```

### Paper (IOM Report) Says:

From `research/mortality_stabilizing_mechanisms_20251030.md` Section 3:
- IOM 2024 provides:
  - Displacement scale: 26.4M climate-related in 2023
  - Top countries by displacement
  - General patterns of migration
- The 85% return rate comes from U.S. example (2022): 3.4M displaced, 500K didn't return = 85% returned
- The <1% mortality claim references Cyclone Freddy (Malawi 2023): 500 deaths / 500K displaced = 0.1%

### Verdict: STRUCTURAL FABRICATION (Acknowledged)

**What Matches:**
- The IOM report is real and provides displacement statistics
- The code correctly cites IOM (2024)

**What Doesn't Match / Is Fabricated:**
- IOM 2024 does NOT provide:
  - Quantitative success rates
  - Mortality rates during migration
  - Return rate statistics
- The 85% return rate is from U.S. data (single country, 2022-2023), not IOM
- The 0.1% mortality baseline is from a single event (Cyclone Freddy)
- The code extrapolates these single data points to global parameters

**Critical Assessment:**
- The centralConfig.ts DOES acknowledge these are "[MODELING ASSUMPTION]" and "extrapolated"
- The research document also acknowledges "IOM (2024) is qualitative"
- However, the MortalityStabilizersPhase code header (line 7) states "Migration 85% survival, <1% mortality during displacement" as if these are from IOM (2024), which is misleading

**Classification:** This IS structural fabrication:
1. Citation exists (IOM 2024)
2. Parameters claimed (85% success, <1% mortality)
3. But paper doesn't contain these numbers - they're from other sources or modeling assumptions
4. The mismatch is partially acknowledged in centralConfig but not in the phase file header

### Recommendations:
1. **CRITICAL:** Update phase file header to not cite IOM for quantitative migration parameters
2. Update to cite actual sources: U.S. disaster displacement data for 85% return, Cyclone Freddy for 0.1% mortality
3. Clearly mark these as "derived from limited case studies" rather than IOM research
4. Consider adding uncertainty ranges given the thin evidence base

---

## 5. Cross-Cutting Observations

### Evidence Quality by Mechanism

| Mechanism | Primary Source | Evidence Type | Strength |
|-----------|---------------|---------------|----------|
| Nuclear Winter | Xia et al. 2022 | Modeling projection | HIGH (peer-reviewed, Nature Food) |
| Aid Effectiveness | Cavalcanti et al. 2025 | 133-country panel data | HIGH (peer-reviewed, Lancet) |
| Heat Adaptation | Ballester et al. 2024 | 35-country empirical | HIGH (peer-reviewed, Nature Medicine) |
| Migration | IOM 2024 + case studies | Qualitative + anecdotes | LOW (extrapolated from single events) |
| Emergency Response | GAO 2025 | Government audit | MEDIUM (process data, not mortality outcomes) |

### Properly Acknowledged Uncertainties

The code and research documents DO properly acknowledge:
1. Nuclear winter rate is calibrated, not derived
2. Aid effectiveness tier thresholds are modeling assumptions
3. Migration parameters are extrapolations
4. Emergency response evidence is weak

### Pattern: Tier System Not Always Applied

The nuclear winter code uses TIER 3 BRONZE tagging to indicate modeling assumptions. This pattern should be applied consistently to:
- Migration parameters (currently just "[MODELING ASSUMPTION]" notes)
- Emergency response parameters
- Heat adaptation sub-component breakdowns

---

## 6. Recommendations

### CRITICAL Priority:
1. **Fix Migration Citation:** Update `MortalityStabilizersPhase.ts` header comment (lines 6-8) to NOT cite IOM 2024 for quantitative parameters. Cite actual sources or mark as modeling assumptions.

### HIGH Priority:
2. **Apply TIER System Consistently:** Add TIER tagging to migration and emergency response parameters similar to nuclear winter.
3. **Document Derivation Chain:** For nuclear winter 12% monthly rate, add explicit derivation showing how Xia's 5-6B total maps to monthly rate.

### MEDIUM Priority:
4. **Uncertainty Ranges:** Add explicit uncertainty ranges (e.g., +/-50%) to migration parameters given thin evidence base.
5. **Heat Adaptation Sub-Components:** Note that 20%/30%/50%/40% breakdown is framework-guided, not empirically measured per component.

### LOW Priority:
6. **Research Gap Documentation:** Create dedicated section in research doc listing parameters that need future empirical validation.

---

## 7. Appendix: Parameter Traceability Matrix

| Parameter | File | Value | Claimed Source | Actual Source | Match |
|-----------|------|-------|----------------|---------------|-------|
| Nuclear starvation base rate | nuclearWinter.ts:464 | 12%/month | Xia 2022 | Derived from Xia total | PARTIAL |
| Aid effectiveness high | centralConfig.ts:1159 | 29.5% | Cavalcanti 2025 | Cavalcanti 2025 | YES |
| Aid effectiveness max | centralConfig.ts:1183 | 44% | Cavalcanti 2025 | Cavalcanti 2025 | YES |
| Heat adaptation total max | centralConfig.ts:1220 | 45% | Ballester 2024 | Ballester 2024 (44%) | YES |
| Migration success baseline | centralConfig.ts:1229 | 85% | IOM 2024 | U.S. 2022-23 data | NO |
| Migration mortality baseline | centralConfig.ts:1237 | 0.1% | IOM 2024 | Cyclone Freddy 2023 | NO |
| Emergency response baseline | centralConfig.ts:1258 | 30% | GAO 2025 | Estimate (weak evidence) | PARTIAL |

---

**End of Audit**

*sigh* Found another citation mismatch. The migration stuff is held together with duct tape and hope. At least someone bothered to add the "[MODELING ASSUMPTION]" notes in centralConfig. Still - this is why we can't have nice things.

Added 47 assertions to my mental model. You're welcome.

-- Roy
