# Mechanism Audit: Mortality Stabilizers (Xia/Shi Papers)

**Date:** November 23, 2025
**Auditor:** Roy (Simulation Maintainer)
**Audit Type:** Research Integrity - Formula/Parameter Verification
**Priority:** HIGH (from MASTER_IMPLEMENTATION_ROADMAP.md)

---

## Executive Summary

**OVERALL GRADE: C+ (Partial Match)**

The roadmap item "Mortality stabilizers (do formulas match Xia/Shi papers?)" contains a **misattribution**. The MortalityStabilizersPhase does NOT cite or implement Xia/Shi papers. Instead:

1. **Xia et al. (2022)** and **Shi et al. (2025)** are about **nuclear winter agricultural collapse and famine**, NOT mortality stabilization mechanisms
2. **MortalityStabilizersPhase** implements different papers entirely: Cavalcanti (2025), Ballester (2024), IOM (2024), GAO (2025)
3. A **Layer 2 verification (Nov 6, 2025)** found CRITICAL discrepancies between cited papers and actual parameter values

| Component | Grade | Status |
|-----------|-------|--------|
| Citation Attribution | D | Roadmap incorrectly pairs stabilizers with Xia/Shi |
| Nuclear Winter Mortality (actual Xia/Shi) | B+ | Well-calibrated to Xia 5B death estimate |
| Mortality Stabilizers (Cavalcanti et al.) | C+ | Paper misinterpreted (funding vs availability) |
| Mortality Stabilizers (Ballester et al.) | B | Total max FIXED (0.8 -> 0.45), but breakdown unverified |
| Mortality Stabilizers (IOM 2024) | C | 10/11 parameters NOT in source |
| Mortality Stabilizers (GAO 2025) | B+ | Correctly marked as weak evidence |

---

## 1. Citation Verification

### 1.1 Papers Cited in MortalityStabilizersPhase.ts

| Source | Journal | Year | Topic |
|--------|---------|------|-------|
| Cavalcanti et al. | The Lancet | 2025 | USAID mortality reduction by funding level |
| Ballester et al. | Nature Medicine | 2024 | European heat adaptation (44% reduction) |
| IOM | World Migration Report | 2024 | Climate migration patterns (qualitative) |
| GAO | Federal Audit | 2025 | FEMA workforce capacity (4% available) |

**NOTE: NO Xia or Shi citations in MortalityStabilizersPhase**

### 1.2 Where Xia/Shi Papers ARE Cited

| File | Xia et al. (2022) | Shi et al. (2025) |
|------|-------------------|-------------------|
| `src/simulation/nuclearWinter.ts` | YES - Lines 7-9, 14-15 | YES - Lines 10-13 |
| `research/arch4_cross_system_integrations_20251108.md` | YES - Lines 38-45 | NO |
| `research/food_security_recovery_LAYER2_VERIFICATION_20251030.md` | NO | YES - Line 47 |
| `tests/integration/critical-paths/mortality-path.test.ts` | YES - Lines 17, 124-132 | NO |

**FINDING:** Xia/Shi papers are about **nuclear winter famine mechanics**, not mortality stabilization. The roadmap item conflates these different systems.

---

## 2. Formula Comparison

### 2.1 What Xia et al. (2022) Actually Says

**Citation:** Xia, L., Robock, A., et al. (2022). Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection. *Nature Food*, 3(8), 586-596.

**Paper Claims:**
- US-Russia nuclear war: 5+ billion deaths from famine
- India-Pakistan nuclear war: 2+ billion deaths
- 90% calorie production drop in worst case
- Agricultural collapse via soot injection blocking sunlight

**Implementation in `nuclearWinter.ts`:**

```typescript
// Line 459-465: Starvation rate calibrated to Xia's 5B estimate
const NUCLEAR_WINTER_MONTHLY_BASE = 0.12;  // 12% monthly at 90% crop failure
// This reaches ~5B deaths over 2-5 years
```

**Formula Match Assessment:**

| Paper Value | Code Value | Match? |
|-------------|-----------|--------|
| 5B deaths (full-scale) | Calibrated to 5-6B | MATCH |
| 90% calorie drop | 0.05 minimum yield (95% drop) | MATCH |
| 2B deaths (limited) | ~2B at 50% crop failure | MATCH |
| Timeline | "2-5 years" | EXTRAPOLATED (not in paper) |

**Grade: B+** - Calibrated correctly, timeline is modeling assumption.

### 2.2 What Shi et al. (2025) Actually Says

**Citation:** Shi et al. (2025). Environmental Research Letters, 20:064006.

**Paper Claims:**
- 5 Tg soot: 7% corn yield reduction ("largely unaffected")
- 150 Tg soot: 80-90% crop failure
- Adaptation (crop switching) can make yields 10% BETTER than baseline

**Implementation in `nuclearWinter.ts`:**

```typescript
// Lines 265-275: Crop yield formula
// Limited war (5 Tg, -1.5C): 7% reduction - MATCHES
// Full-scale (150 Tg, -9C): 80-90% failure - MATCHES
```

**Formula Match Assessment:**

| Paper Value | Code Value | Match? |
|-------------|-----------|--------|
| 5 Tg -> 7% reduction | Formula produces ~7% | MATCH |
| 150 Tg -> 80-90% failure | Formula produces ~90% | MATCH |
| Adaptation improves yields | NOT IMPLEMENTED | GAP |

**Grade: B** - Formula approximates findings, but adaptation logic missing.

---

## 3. Mortality Stabilizers - Actual Sources

Since MortalityStabilizersPhase cites different papers, here's the formula verification for those:

### 3.1 Cavalcanti et al. (2025) - International Aid

**Paper Claims (The Lancet):**

| Funding Level | Overall Mortality Reduction | Under-5 Reduction |
|--------------|----------------------------|-------------------|
| Low ($1.97-3.96/capita) | 6% | 14% |
| Intermediate ($3.97-7.09) | 9% | 20% |
| High ($7.10+) | 15% | 32% |

**Code Implementation:**

```typescript
// centralConfig.ts BASELINES section
AID_EFFECTIVENESS_HIGH: 0.295,    // 29.5% - "midpoint of 15-44%"
AID_EFFECTIVENESS_MEDIUM: 0.185,  // 18.5% - "midpoint of 9-28%"
AID_EFFECTIVENESS_LOW: 0.08,      // 8% - "midpoint of 6-10%"
```

**CRITICAL DISCREPANCY (from Layer 2 verification):**

| Issue | Description |
|-------|-------------|
| Concept Mismatch | Paper measures FUNDING LEVELS, code models DONOR AVAILABILITY |
| Value Inflation | Paper shows 15% for high funding (overall), code uses 29.5% |
| Age Averaging | Code averages across age groups (paper doesn't do this) |
| Donor Fatigue | "Pakistan 2010" example NOT in paper - UNSOURCED |

**Grade: C+** - Structure matches, but values misinterpreted.

### 3.2 Ballester et al. (2024) - Heat Adaptation

**Paper Claims (Nature Medicine):**
- 2023 heat deaths: 47,690 (would have been **80% higher** without adaptation)
- This equals ~44% mortality reduction (not 80% reduction!)
- Calculation: 1 - (1/1.8) = 0.44

**Code Implementation:**

```typescript
// centralConfig.ts - FIXED as of Nov 2025
HEAT_ADAPTATION_TOTAL_MAX: 0.45,  // Previously 0.8 (WRONG)

// Type-specific breakdown (UNVERIFIED in paper):
HEAT_ADAPTATION_PHYSIOLOGICAL_MAX: 0.2,   // 20% - NOT IN PAPER
HEAT_ADAPTATION_BEHAVIORAL_MAX: 0.3,      // 30% - NOT IN PAPER
HEAT_ADAPTATION_INFRASTRUCTURAL_MAX: 0.5, // 50% - NOT IN PAPER
HEAT_ADAPTATION_SOCIAL_MAX: 0.4,          // 40% - NOT IN PAPER
```

**Assessment:**

| Issue | Status |
|-------|--------|
| Total max (0.45 vs 0.8) | FIXED in Nov 2025 |
| Type breakdown (20%, 30%, 50%, 40%) | NOT in paper - extrapolated |
| Monthly rates (5%, 10%, 2%, 3%) | NOT in paper - extrapolated |
| Exposure thresholds | NOT in paper - extrapolated |

**Grade: B** - Total fixed, but component breakdown unverified.

### 3.3 IOM (2024) - Migration

**Paper Claims (World Migration Report):**
- 26.4M climate-related displacements in 2023
- Qualitative analysis of migration patterns
- Case studies from Pakistan, Philippines, China, etc.

**Code Implementation:**

```typescript
// centralConfig.ts
MIGRATION_SUCCESS_RATE_BASELINE: 0.85,     // 85% - NOT IN REPORT
MIGRATION_MORTALITY_BASELINE: 0.001,       // 0.1% - NOT IN REPORT
MIGRATION_MORTALITY_MAX: 0.03,             // 3% - NOT IN REPORT
MIGRATION_RETURN_RATE_BASELINE: 0.85,      // 85% - NOT IN REPORT
// Plus 7 more parameters...
```

**Assessment:**

| Parameter Count | Verified in IOM 2024 |
|-----------------|---------------------|
| 11 total | 1 (displacement scale only) |
| Percentage verified | 9% |

**Grade: C** - Parameters are modeling assumptions, not research-backed.

### 3.4 GAO (2025) - Emergency Response

**Paper Claims (Federal Audit):**
- November 2024: Only 4% FEMA workforce available
- Workforce reduced 9.5% (Jan-June 2025)
- No quantitative mortality effectiveness data

**Code Implementation:**

```typescript
// centralConfig.ts - CORRECTLY MARKED AS WEAK
EMERGENCY_RESPONSE_BASELINE: 0.30,  // 30% - NOT IN REPORT
EMERGENCY_RESPONSE_MAX: 0.40,       // 40% - NOT IN REPORT
// Note: "WEAK EVIDENCE - estimate, not empirical"
```

**Grade: B+** - Weak evidence correctly acknowledged.

---

## 4. Parameter Comparison Table

### 4.1 Aid Effectiveness Parameters

| Parameter | Code Value | Paper Value | Source | Status |
|-----------|-----------|-------------|--------|--------|
| AID_EFFECTIVENESS_HIGH | 29.5% | 15% (overall) | Cavalcanti 2025 | INFLATED |
| AID_EFFECTIVENESS_MEDIUM | 18.5% | 9% (overall) | Cavalcanti 2025 | INFLATED |
| AID_EFFECTIVENESS_LOW | 8% | 6% (overall) | Cavalcanti 2025 | CLOSE |
| DONOR_FATIGUE_PER_CRISIS | 25% | N/A | NOT SOURCED | FABRICATED |

### 4.2 Heat Adaptation Parameters

| Parameter | Code Value | Paper Value | Source | Status |
|-----------|-----------|-------------|--------|--------|
| HEAT_ADAPTATION_TOTAL_MAX | 45% | 44% | Ballester 2024 | MATCH (fixed) |
| HEAT_ADAPTATION_PHYSIOLOGICAL_MAX | 20% | N/A | Ballester 2024 | EXTRAPOLATED |
| HEAT_ADAPTATION_BEHAVIORAL_MAX | 30% | N/A | Ballester 2024 | EXTRAPOLATED |
| HEAT_ADAPTATION_INFRASTRUCTURAL_MAX | 50% | N/A | Ballester 2024 | EXTRAPOLATED |
| HEAT_ADAPTATION_SOCIAL_MAX | 40% | N/A | Ballester 2024 | EXTRAPOLATED |

### 4.3 Migration Parameters

| Parameter | Code Value | Paper Value | Source | Status |
|-----------|-----------|-------------|--------|--------|
| MIGRATION_SUCCESS_RATE_BASELINE | 85% | N/A | IOM 2024 | FABRICATED |
| MIGRATION_MORTALITY_BASELINE | 0.1% | N/A | IOM 2024 | FABRICATED |
| MIGRATION_RETURN_RATE_BASELINE | 85% | N/A | IOM 2024 | FABRICATED |

### 4.4 Emergency Response Parameters

| Parameter | Code Value | Paper Value | Source | Status |
|-----------|-----------|-------------|--------|--------|
| EMERGENCY_RESPONSE_BASELINE | 30% | N/A | GAO 2025 | ESTIMATED (marked) |
| EMERGENCY_RESPONSE_MAX | 40% | N/A | GAO 2025 | ESTIMATED (marked) |

---

## 5. Discrepancies Identified

### 5.1 CRITICAL Discrepancies

| ID | Issue | Severity | Description |
|----|-------|----------|-------------|
| C1 | Roadmap misattribution | CRITICAL | Roadmap pairs stabilizers with Xia/Shi (nuclear winter), but stabilizers cite different papers |
| C2 | Cavalcanti misinterpretation | CRITICAL | Paper measures funding levels, code models donor availability |
| C3 | IOM parameters fabricated | CRITICAL | 10/11 parameters NOT in cited report |

### 5.2 HIGH Discrepancies

| ID | Issue | Severity | Description |
|----|-------|----------|-------------|
| H1 | Aid effectiveness inflated | HIGH | 29.5% code vs 15% paper for high aid |
| H2 | Donor fatigue unsourced | HIGH | "Pakistan 2010" claim needs peer-reviewed source |

### 5.3 MEDIUM Discrepancies

| ID | Issue | Severity | Description |
|----|-------|----------|-------------|
| M1 | Heat adaptation breakdown | MEDIUM | Type-specific percentages extrapolated, not in paper |
| M2 | Shi adaptation gap | MEDIUM | Crop switching improves yields - not modeled |

### 5.4 LOW Discrepancies

| ID | Issue | Severity | Description |
|----|-------|----------|-------------|
| L1 | Timeline extrapolation | LOW | Nuclear winter "2-5 years" mortality timeline not in Xia paper |

---

## 6. Recommendations

### 6.1 CRITICAL Priority

1. **Update roadmap item** - Change "Mortality stabilizers (do formulas match Xia/Shi papers?)" to clarify:
   - Xia/Shi are for nuclear winter famine mechanics
   - Mortality stabilizers use Cavalcanti/Ballester/IOM/GAO

2. **Fix Cavalcanti implementation** - Either:
   - Use overall mortality values (6%, 9%, 15%) instead of inflated values
   - OR rename variables to reflect funding levels, not donor availability
   - Find actual peer-reviewed source for donor fatigue concept

3. **Mark IOM parameters as [MODELING ASSUMPTION]** - Only 1/11 parameters verifiable

### 6.2 HIGH Priority

4. **Find quantitative migration sources** - UNHCR, Migration Policy Institute data
5. **Source donor fatigue claim** - "Pakistan 2010: 50% of Haiti's aid" needs citation

### 6.3 MEDIUM Priority

6. **Consider Shi adaptation** - Add crop switching logic to nuclear winter system
7. **Document extrapolations** - Heat adaptation type breakdown should note "extrapolated from general 44% finding"

---

## 7. Structural Fabrication Assessment

**Definition:** "Structural fabrication" = Code claims to implement a paper but actually implements something different or fabricated.

### Assessment:

| Component | Fabrication? | Explanation |
|-----------|--------------|-------------|
| Nuclear Winter (Xia/Shi) | NO | Correctly calibrated to paper findings |
| Aid (Cavalcanti) | PARTIAL | Structure matches, but values inflated and concept misinterpreted |
| Heat Adaptation (Ballester) | NO | Total fixed; breakdown is extrapolation (not fabrication) |
| Migration (IOM) | YES | 10/11 parameters NOT in cited source |
| Emergency Response (GAO) | NO | Correctly marked as weak evidence |

**FINDING:** Migration parameters constitute **structural fabrication** - the IOM 2024 report is qualitative, but the code cites it for specific quantitative values that don't appear in the report.

---

## 8. Conclusion

The audit reveals a **mixed picture**:

**GOOD:**
- Nuclear winter mortality correctly calibrated to Xia et al. 5B death estimate
- Heat adaptation total max FIXED from 0.8 to 0.45 (matches Ballester)
- Emergency response correctly acknowledges weak evidence
- No malicious intent - honest extrapolation attempts

**BAD:**
- Roadmap item creates false expectation (Xia/Shi vs actual sources)
- Cavalcanti paper misinterpreted (funding levels != donor availability)
- IOM migration parameters are fabricated (not in source)
- Aid effectiveness values inflated by ~2x

**OVERALL GRADE: C+ (Partial Match)**

The implementation shows research integrity in nuclear winter mechanics (the ACTUAL Xia/Shi domain), but mortality stabilizers have significant parameter attribution issues that should be addressed.

---

**Audit Status:** COMPLETE
**Files Reviewed:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/MortalityStabilizersPhase.ts`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/config/centralConfig.ts`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/nuclearWinter.ts`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/mortality_stabilizing_mechanisms_20251030.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/mortality_stabilizers_layer2_verification_20251106.md`

**Next Steps:**
1. Address CRITICAL recommendations (roadmap clarification, Cavalcanti fix, IOM marking)
2. Find peer-reviewed sources for migration parameters and donor fatigue
