# Mechanism Audit: Mortality Stabilizers vs. Xia/Shi Papers

**Date:** November 23, 2025
**Auditor:** Roy (Simulation Maintainer)
**Audit Type:** Research Integrity - "Structural Fabrication" Check
**Priority:** HIGH

---

## Executive Summary

This audit examines whether the MortalityStabilizersPhase implementation accurately reflects the claimed Xia et al. (2022) and Shi et al. (2025) research citations.

**CRITICAL FINDING:** The MortalityStabilizersPhase does NOT cite Xia/Shi papers directly. Its research backing comes from different sources (Cavalcanti 2025, Ballester 2024, IOM 2024, GAO 2025). However, the nuclear winter system (`nuclearWinter.ts`) DOES cite Xia et al. (2022) extensively for mortality and crop yield mechanics.

**Overall Assessment:**
- **MortalityStabilizersPhase:** Grade **B+** (Well-researched, different sources than expected)
- **Nuclear Winter Mortality (nuclearWinter.ts):** Grade **B** (Xia-calibrated, acknowledged uncertainty)
- **Test Files:** Grade **A** (Correctly reference Xia et al. bounds)

---

## 1. Citations Found

### 1.1 MortalityStabilizersPhase.ts Citations

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/MortalityStabilizersPhase.ts`

| Cited Source | Claim | Line Reference |
|--------------|-------|----------------|
| Cavalcanti et al. (2025), The Lancet | International aid: 15-44% mortality reduction | Lines 17, 257 |
| Ballester et al. (2024), Nature Medicine | Heat adaptation: 40-80% mortality reduction | Lines 18, 148, 322 |
| IOM (2024), World Migration Report | Migration: 85% return rate, <1% mortality | Lines 19, 457-462 |
| GAO (2025) | Emergency response: 20-40% reduction (weak evidence) | Lines 20, 559-561 |

**Note:** NO direct Xia or Shi citations in MortalityStabilizersPhase.

### 1.2 nuclearWinter.ts Citations (Xia/Shi Found Here)

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/nuclearWinter.ts`

| Cited Source | Claim | Line Reference |
|--------------|-------|----------------|
| Xia et al. (2022), Nature Food | Full-scale war: 5 billion deaths from famine | Lines 7-9 |
| Xia et al. (2022) | 90% calorie drop, 5B deaths | Lines 14-15 |
| Penn State (2025) / Shi et al. | 7% corn reduction (5 Tg), 80-90% failure (150 Tg) | Lines 10-13, 267 |
| Robock & Toon (2012) | Soot injection scenarios | Lines 180-186 |
| Coupe et al. (2019) | Temperature anomaly research | Lines 19, 336-339 |

### 1.3 Test File Citations

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/integration/critical-paths/mortality-path.test.ts`

| Cited Source | Claim | Line Reference |
|--------------|-------|----------------|
| Xia et al. (2022) | Nuclear winter mortality 40-75% over decades | Lines 17, 124-132 |
| Cavalcanti et al. (2025) | International aid effectiveness | Line 18 |
| Ballester et al. (2024) | Heat adaptation | Line 19 |
| IOM (2024) | Climate migration patterns | Line 20 |

---

## 2. Paper Claims vs. Implementation

### 2.1 Xia et al. (2022) - Nature Food

**Full Citation:** Xia, L., Robock, A., et al. (2022). Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection. *Nature Food*, 3(8), 586-596.

**Paper Claims (from verification doc):**
- "More than 5 billion could die from a war between the United States and Russia"
- "More than 2 billion could die from nuclear war between India and Pakistan"
- 90% calorie production drop in worst case
- Agricultural collapse via soot injection

**Implementation in `nuclearWinter.ts`:**

```typescript
// Line 459-465: Starvation rate calibration
// CALIBRATED TO XIA ET AL. 2022, NOT HISTORICAL FAMINE RATES
// - 90% crop failure -> 12% monthly mortality (calibrated to reach 5-6B deaths)
const NUCLEAR_WINTER_MONTHLY_BASE = 0.12;  // 12% monthly at 90% crop failure
```

**Assessment:**
| Aspect | Paper | Code | Match? |
|--------|-------|------|--------|
| 5B+ deaths estimate | Yes | Yes (calibrated) | MATCH |
| 90% calorie drop | Yes | Yes (0.05 min yield) | MATCH |
| Agricultural collapse mechanism | Yes | Yes (crop yield formula) | MATCH |
| Specific mortality timeline | NOT in paper | Assumed 2-5 years | EXTRAPOLATED |
| 50-90% mortality range | Extrapolated | 62.5%+ base | REASONABLE |

**Fidelity Grade: B+** - Calibrated to match Xia's 5B deaths, but timeline is modeling assumption.

### 2.2 Shi et al. (2025) - Penn State

**Full Citation:** Shi et al. (2025). Environmental Research Letters, 20:064006.

**Paper Claims:**
- 5 Tg soot: 7% corn yield reduction, "largely unaffected"
- 150 Tg soot: 80-90% crop failure
- WITH adaptation, losses can be 10% BETTER than baseline

**Implementation in `nuclearWinter.ts`:**

```typescript
// Line 265-275: Crop yield calculation
// Penn State 2025: Separate temperature, darkening, precipitation effects
// - Limited war (5 Tg, -1.5C): 7% global corn reduction
// - Full-scale war (150 Tg, -9C): 80-90% crop failure
```

**Assessment:**
| Aspect | Paper | Code | Match? |
|--------|-------|------|--------|
| 5 Tg -> 7% reduction | Yes | Yes (formula matches) | MATCH |
| 150 Tg -> 80-90% failure | Yes | Yes (formula gives ~90%) | MATCH |
| Temperature effects | Yes | Yes (3.5% per C) | APPROXIMATE |
| Darkening effects | Yes | Yes (18% at full blocking) | APPROXIMATE |
| Precipitation effects | Yes | Yes (30% at full drought) | APPROXIMATE |
| Adaptation reducing losses | Yes | NOT implemented in crop calc | GAP |

**Fidelity Grade: B** - Formula approximates paper findings, but adaptation crop switching NOT modeled.

### 2.3 Xia vs Shi "Contradiction" Resolution

**Apparent Contradiction:**
- Xia 2022: US Corn Belt "impossible for 2+ years" (150 Tg scenario)
- Shi 2025: US Corn Belt "largely unaffected" (5 Tg scenario)

**Resolution (documented in roadmap):**
- These are COMPLEMENTARY, not contradictory
- 5 Tg: "Largely unaffected" (Shi) - 7% decline
- 150 Tg: "Impossible" (Xia) - 80-90% decline
- Critical bifurcation between 5-27 Tg

**Implementation:** Code correctly models the spectrum, NOT a single value.

**Fidelity Grade: A** - Contradiction correctly identified as different scenarios, not actual disagreement.

---

## 3. MortalityStabilizersPhase - Non-Xia/Shi Citations

Since MortalityStabilizersPhase doesn't cite Xia/Shi, I audited its actual citations:

### 3.1 Cavalcanti et al. (2025) - International Aid

**Paper Claims:**
- 15% all-age mortality reduction (95% CI 0.78-0.93)
- 32% under-five mortality reduction
- Funding tiers: High ($7.10+) = 15-44% reduction

**Implementation:**

```typescript
// Lines 289-301: Aid effectiveness levels
if (aid.donorAvailability > RATES.AID_DONOR_AVAILABILITY_HIGH) {
  aid.effectivenessLevel = 'high';
  aid.mortalityReduction = BASELINES.AID_EFFECTIVENESS_HIGH * aid.donorAvailability;
}
```

**Assessment:** Implementation matches paper's funding-mortality relationship structure. Specific percentages configurable via centralConfig.

**Fidelity Grade: A** - Directly implements paper's findings.

### 3.2 Ballester et al. (2024) - Heat Adaptation

**Paper Claims:**
- 2023 heat deaths: 47,690 (would have been 80% higher without adaptation)
- Adaptation saved ~37,000 lives in 2023
- Four adaptation types: physiological, behavioral, infrastructural, social

**Implementation:**

```typescript
// Lines 379-425: Four adaptation types with caps
adaptation.physiological = Math.min(BASELINES.HEAT_ADAPTATION_PHYSIOLOGICAL_MAX, ...);
adaptation.behavioral = Math.min(BASELINES.HEAT_ADAPTATION_BEHAVIORAL_MAX, ...);
adaptation.infrastructural = Math.min(BASELINES.HEAT_ADAPTATION_INFRASTRUCTURAL_MAX, ...);
adaptation.social = Math.min(BASELINES.HEAT_ADAPTATION_SOCIAL_MAX, ...);
```

**Assessment:** Implementation matches paper's four-type framework. Combined 80% max matches paper's "80% higher without adaptation" finding.

**Fidelity Grade: A** - Directly implements paper's framework.

### 3.3 IOM (2024) - Migration

**Paper Claims:**
- 85% return rate within 1 year
- <1% mortality during displacement (baseline 0.1%)
- 26.4M climate-related displacements in 2023

**Implementation:**

```typescript
// Lines 515, 534, 545: Migration parameters
let successRate = BASELINES.MIGRATION_SUCCESS_RATE_BASELINE; // 85%
let mortalityRate = BASELINES.MIGRATION_MORTALITY_BASELINE; // 0.1%
let returnRate = BASELINES.MIGRATION_RETURN_RATE_BASELINE; // 85%
```

**Assessment:** Parameters directly match IOM 2024 data.

**Fidelity Grade: A** - Parameters extracted directly from report.

### 3.4 GAO (2025) - Emergency Response

**Paper Claims:**
- November 2024: Only 4% FEMA workforce available
- 25,800 -> 23,350 employees (-9.5% reduction)
- Disasters becoming "costlier and deadlier"

**Implementation:**

```typescript
// Lines 566-570: Acknowledged weak evidence
// WEAK EVIDENCE (acknowledged): 20-40% reduction is estimate, not empirical
```

**Assessment:** Code correctly flags this as weak evidence. Uses 30% baseline (midpoint of 20-40% estimate).

**Fidelity Grade: A-** - Correctly acknowledges weak evidence base.

---

## 4. Identified Discrepancies

### 4.1 Critical Discrepancies

| Issue | Severity | Description | Recommendation |
|-------|----------|-------------|----------------|
| Wet bulb limit inconsistency | MEDIUM | Code claims 30.5C (Vecellio 2024), but some Monte Carlo summaries show 35C | Audit all wet bulb thresholds for consistency |
| Shi adaptation gap | LOW | Shi 2025 shows crop switching can IMPROVE yields; not modeled | Consider adding adaptation logic to crop yield |
| Timeline extrapolation | LOW | "2-5 years" mortality timeline not in Xia paper | Document as modeling assumption |

### 4.2 Structural Fabrication Check

**Definition:** "Structural fabrication" = Code claims to implement a paper but actually implements something different or fabricated.

**Finding:** **NO STRUCTURAL FABRICATION DETECTED**

Evidence:
1. All Xia/Shi citations appear in nuclear winter system where they belong
2. MortalityStabilizers cites DIFFERENT papers (Cavalcanti, Ballester, IOM, GAO) - NOT claiming Xia/Shi implementation
3. Test files correctly cite Xia et al. for mortality bounds (40-75%)
4. Research verification documents (Oct 30, Nov 6) show due diligence in tracking paper origins

---

## 5. Fidelity Grades Summary

| Component | Paper Source | Fidelity Grade | Notes |
|-----------|--------------|----------------|-------|
| Nuclear Winter Mortality | Xia et al. 2022 | **B+** | Calibrated to 5B deaths, timeline extrapolated |
| Nuclear Winter Crop Yield | Shi et al. 2025 | **B** | Formula matches, adaptation gap |
| Xia/Shi Contradiction | Both papers | **A** | Correctly resolved as scenario difference |
| International Aid | Cavalcanti 2025 | **A** | Direct implementation |
| Heat Adaptation | Ballester 2024 | **A** | Direct framework implementation |
| Migration | IOM 2024 | **A** | Parameters match report |
| Emergency Response | GAO 2025 | **A-** | Correctly flags weak evidence |

**Overall Implementation Fidelity: B+ (Good)**

---

## 6. Recommendations

### 6.1 HIGH Priority

1. **Audit wet bulb thresholds:** Ensure 30.5C (Vecellio 2024) is used consistently, not 35C (theoretical)
2. **Update research verification:** Add frontmatter to Xia verification doc noting "PARTIAL VERIFICATION - paywall limited"

### 6.2 MEDIUM Priority

3. **Consider adaptation logic:** Shi 2025 shows crop switching can improve outcomes; consider adding to crop yield calculation
4. **Document timeline assumption:** The "2-5 years" mortality timeline should be explicitly marked as modeling extrapolation, not paper finding

### 6.3 LOW Priority

5. **Harmonize citations:** Consider adding explicit note that MortalityStabilizers phase uses different research base than nuclear winter system

---

## 7. Conclusion

**The implementation demonstrates good research integrity:**

1. Nuclear winter mortality is calibrated to Xia et al. 2022's 5 billion death estimate
2. Crop yield formulas approximate Shi et al. 2025's scenario-specific findings
3. MortalityStabilizers uses appropriate, well-cited sources (NOT fabricating Xia/Shi claims)
4. The apparent Xia/Shi "contradiction" was correctly identified as complementary scenarios
5. Weak evidence (emergency response) is appropriately flagged

**No structural fabrication detected.** The code implements what its citations claim, with reasonable extrapolations documented as modeling assumptions.

---

**Audit Status:** COMPLETE
**Next Steps:** Address HIGH priority recommendations (wet bulb audit, research doc updates)
**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/mechanism_audit_mortality_stabilizers_20251123.md`
