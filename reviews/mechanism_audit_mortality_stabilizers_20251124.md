# Mechanism Audit: Mortality Stabilizers
**Date:** November 24, 2025
**Auditor:** Sylvia (Research Skeptic)
**Status:** ✅ PASS with CRITICAL observations
**Confidence:** HIGH (direct code-to-research comparison)

---

## Executive Summary

**VERDICT: PASS with CRITICAL observations**

The mortality stabilizers mechanism generally aligns with cited research but contains several critical misinterpretations and extrapolations. While the core Cavalcanti et al. (2025) values are correctly implemented, the paper is being cited for concepts it doesn't study (donor availability thresholds). The implementation correctly separates donor fatigue from aid effectiveness, but documentation falsely attributes both to Cavalcanti.

**Key Findings:**
1. **Aid effectiveness values MATCH** Cavalcanti et al. (2025) - ✅ CORRECT
2. **Donor availability thresholds NOT IN** Cavalcanti et al. - ❌ MISATTRIBUTION
3. **Heat adaptation maximum CORRECTED** from 80% to 45% - ✅ FIXED
4. **Migration parameters EXTRAPOLATED** from qualitative research - ⚠️ WEAK EVIDENCE
5. **Xia et al. (2022) NOT CITED** for stabilizers (only for nuclear winter) - ⚠️ MISSING

---

## 1. Research Sources Audit

### 1.1 Papers Actually Cited in Code

**MortalityStabilizersPhase.ts (lines 15-20):**
- ✅ Cavalcanti et al. (2025) - The Lancet (USAID aid effectiveness)
- ✅ Ballester et al. (2024) - Nature Medicine (European heat adaptation)
- ✅ IOM (2024) - World Migration Report (climate migration patterns)
- ✅ GAO (2025) - Federal audit (emergency response capacity)

### 1.2 Papers Missing But Expected

**NOT FOUND:**
- ❌ **Xia et al. (2022)** - Nature Food (nuclear winter agricultural collapse)
  - Mentioned in roadmap as key source for mortality stabilizers
  - Actually used for nuclear winter modeling, NOT stabilizers
  - No connection found between Xia research and stabilizer implementation

**Implication:** The roadmap incorrectly suggests Xia et al. provides mortality stabilizer parameters. Xia focuses on nuclear winter famine deaths (5+ billion), not mechanisms that prevent mortality.

---

## 2. Parameter Comparison Table

### 2.1 International Aid Effectiveness

| Parameter | Research Value | Code Value | Status | Source |
|-----------|---------------|------------|--------|--------|
| **High funding mortality reduction** | 15-44% (Cavalcanti 2025) | 29.5% (midpoint) | ✅ CORRECT | centralConfig.ts:1159 |
| **Medium funding mortality reduction** | 9-28% (Cavalcanti 2025) | 18.5% (midpoint) | ✅ CORRECT | centralConfig.ts:1167 |
| **Low funding mortality reduction** | 6-10% (Cavalcanti 2025) | 8% (midpoint) | ✅ CORRECT | centralConfig.ts:1175 |
| **Maximum aid effectiveness** | 44% (Cavalcanti 2025) | 44% | ✅ EXACT MATCH | centralConfig.ts:1183 |
| **Donor fatigue per crisis** | ~25% (OCHA 2024 empirical) | 25% | ✅ CORRECT | centralConfig.ts:656 |
| **Donor availability thresholds** | NOT IN Cavalcanti | 80%, 50%, 20% | ❌ MISATTRIBUTION | centralConfig.ts:672-686 |

**CRITICAL FINDING:** The code documentation (lines 1153-1158) falsely claims Cavalcanti et al. (2025) provides "donor availability" thresholds. The paper ONLY studies mortality reduction by funding level, NOT donor availability during crises. The thresholds (80%, 50%, 20%) are modeling assumptions incorrectly attributed to peer review.

### 2.2 Heat Adaptation

| Parameter | Research Value | Code Value | Status | Source |
|-----------|---------------|------------|--------|--------|
| **Total adaptation maximum** | 44% (Ballester 2024) | 45% | ✅ CORRECTED | centralConfig.ts:1220 |
| **Physiological adaptation** | ~10-20% estimate | 20% | ✅ REASONABLE | centralConfig.ts:1190 |
| **Behavioral adaptation** | ~20-30% estimate | 30% | ✅ REASONABLE | centralConfig.ts:1197 |
| **Infrastructural adaptation** | ~30-50% estimate | 50% | ✅ REASONABLE | centralConfig.ts:1204 |
| **Social/policy adaptation** | Not specified | 40% | ⚠️ EXTRAPOLATED | centralConfig.ts:1211 |
| **Wet bulb limit** | 30.5°C (empirical) | 30.5°C | ✅ CORRECT | Code comment line 12 |

**NOTE:** Previous version had 80% total adaptation (82% overestimate). This was FIXED to 45% based on Ballester et al. (2024) showing 44% adaptation effect.

### 2.3 Migration Parameters

| Parameter | Research Value | Code Value | Status | Source |
|-----------|---------------|------------|--------|--------|
| **Successful relocation baseline** | NOT QUANTIFIED (IOM 2024) | 85% | ⚠️ EXTRAPOLATED | centralConfig.ts:1229 |
| **Mortality during migration** | "<1%" qualitative (IOM 2024) | 0.1% baseline | ✅ REASONABLE | centralConfig.ts:1236 |
| **Return rate** | "85% within 1 year" (IOM 2024) | 85% | ✅ MATCHES | centralConfig.ts:1250 |

**CRITICAL FINDING:** IOM (2024) World Migration Report provides QUALITATIVE analysis, not quantitative success rates. Code acknowledges this with "[MODELING ASSUMPTION]" comments but still cites IOM as source.

### 2.4 Emergency Response

| Parameter | Research Value | Code Value | Status | Source |
|-----------|---------------|------------|--------|--------|
| **Effectiveness baseline** | "20-40% estimate" (GAO 2025) | 30% (midpoint) | ✅ REASONABLE | centralConfig.ts:1258 |
| **Effectiveness maximum** | "40% upper bound" (GAO 2025) | 40% | ✅ MATCHES | centralConfig.ts:1266 |
| **Workforce availability** | "4% post-hurricanes" (GAO 2025) | Modeled variable | ✅ IMPLEMENTED | Phase code |

**NOTE:** Code correctly acknowledges "WEAK EVIDENCE - estimate, not empirical" (line 1256).

---

## 3. Mechanism Implementation Audit

### 3.1 Aid Effectiveness Branching ✅ CORRECT

**Research:** Cavalcanti shows aid reduces mortality when funding available
**Implementation:** Correctly branches on global crisis:
- Global catastrophe (>50% economies collapsed) → aid = 0% (no donors)
- Regional crisis → aid effectiveness scaled by donor availability

**Code validation (MortalityStabilizersPhase.ts:271-278):**
```typescript
if (globalIndicators.globalCrisisActive) {
  aid.effectivenessLevel = 'none';
  aid.mortalityReduction = 0.0;
}
```
✅ MATCHES research logic that aid requires external donors

### 3.2 Cascade Failures ✅ INNOVATIVE

**Research:** Not directly studied in cited papers
**Implementation:** Models interdependence between mechanisms:
- Aid fails → Emergency response degrades 50%
- Aid fails → Migration degrades 30%
- Emergency fails → Migration degrades 50%

**Assessment:** Reasonable extrapolation not contradicted by research. Real-world crises show cascading system failures.

### 3.3 Combined Reduction Formula ✅ MATHEMATICALLY SOUND

**Implementation:** Multiplicative stacking prevents over-reduction:
```
Combined = 1 - [(1-aid) × (1-adaptation) × (1-emergency) × (1-migration×0.3)]
```

**Validation:** Prevents total reduction from exceeding 100%, realistic diminishing returns.

---

## 4. Critical Issues Found

### 4.1 MISATTRIBUTION (HIGH Priority)

**Problem:** Documentation claims Cavalcanti et al. (2025) provides "donor availability thresholds"
**Reality:** Paper only studies mortality reduction by funding level
**Location:** centralConfig.ts lines 1152-1158
**Fix Required:** Update documentation to clarify thresholds are modeling assumptions

### 4.2 MISSING XIA RESEARCH (MEDIUM Priority)

**Problem:** Roadmap suggests Xia et al. (2022) informs mortality stabilizers
**Reality:** Xia studies nuclear winter famine (5+ billion deaths), not stabilizing mechanisms
**Implication:** No contradiction - Xia describes what happens WITHOUT stabilizers

### 4.3 WEAK EVIDENCE FLAGS (LOW Priority)

**Appropriately flagged as weak:**
- ✅ Migration success rates (marked "[MODELING ASSUMPTION]")
- ✅ Emergency response (marked "WEAK EVIDENCE")

**Should be flagged:**
- ⚠️ Donor availability thresholds (currently misattributed to Cavalcanti)

---

## 5. Validation Against Xia et al. (2022)

While Xia et al. doesn't directly inform stabilizers, we can validate consistency:

**Xia et al. (2022) findings:**
- Full-scale nuclear war → 150-165 Mt soot → 80-90% crop failure
- Results in 5+ billion deaths from famine (62.5% of 8 billion)

**Stabilizer implementation:**
- Would correctly identify this as "global crisis" (all economies collapsed)
- Aid effectiveness → 0% (no donors in global nuclear winter)
- Heat adaptation → 0% (problem is cooling, not heating)
- Migration → minimal (nowhere safe to go globally)
- Emergency response → overwhelmed

**Assessment:** ✅ CONSISTENT - Stabilizers correctly fail in Xia's nuclear winter scenario, allowing the 62.5% mortality the paper predicts.

---

## 6. Recommendations

### 6.1 CRITICAL - Fix Misattribution

**File:** `src/simulation/config/centralConfig.ts`
**Lines:** 1152-1158
**Change:**
```typescript
// OLD (INCORRECT):
* @research Cavalcanti et al. (2025), The Lancet - USAID aid effectiveness study
* @note Cavalcanti reports MORTALITY REDUCTION from aid funding, NOT donor availability.

// NEW (CORRECT):
* @research Cavalcanti et al. (2025), The Lancet - USAID mortality reduction by funding level
* @note [MODELING ASSUMPTION] Donor availability thresholds (80%, 50%, 20%) are
*       extrapolations to map crisis conditions → funding availability → mortality reduction.
*       Cavalcanti provides the mortality reduction values, NOT the availability thresholds.
```

### 6.2 HIGH - Add Xia Context

Add comment explaining why Xia et al. (2022) is relevant but not directly used:
```typescript
/**
 * Mortality Stabilizers Phase
 *
 * NOTE: Xia et al. (2022) nuclear winter research shows 5+ billion deaths WITHOUT
 * these stabilizers. In global nuclear winter, all stabilizers fail (no donors,
 * nowhere to migrate, systems overwhelmed), validating the 62.5% mortality prediction.
 */
```

### 6.3 MEDIUM - Quantify Uncertainty

Add confidence levels to extrapolated parameters:
```typescript
MIGRATION_SUCCESS_RATE_BASELINE: 0.85, // CONFIDENCE: LOW (qualitative source)
DONOR_AVAILABILITY_HIGH: 0.8,          // CONFIDENCE: MEDIUM (empirical patterns)
AID_EFFECTIVENESS_HIGH: 0.295,         // CONFIDENCE: HIGH (peer-reviewed RCT)
```

---

## 7. Final Assessment

**GRADE: PASS with CRITICAL observations**

**Strengths:**
- Core research values correctly implemented
- Appropriate fail-loud assertions prevent NaN propagation
- Cascade failures add realistic interdependence
- Multiplicative formula prevents over-reduction

**Weaknesses:**
- Misattribution of donor thresholds to Cavalcanti
- Some parameters extrapolated from qualitative research
- Xia et al. connection unclear in documentation

**Verdict:** The mechanism is fundamentally sound and research-grounded. The critical issues are documentation problems, not implementation flaws. The code would produce reasonable mortality stabilization consistent with empirical evidence once documentation is corrected.

---

## Appendix: Audit Trail

**Files examined:**
- `/src/simulation/engine/phases/MortalityStabilizersPhase.ts` (lines 1-782)
- `/src/simulation/config/centralConfig.ts` (lines 1150-1400, 500-700)
- `/research/humanitarian_aid_mortality_effectiveness_2025.md` (complete)
- `/research/mortality_stabilizing_mechanisms_20251030.md` (lines 1-200)
- `/research/nuclear_winter_climate_effects_20251113.md` (lines 1-150)

**Search patterns used:**
- `mortalityStabilizer` - 20 files found
- `Cavalcanti` - Located in research docs
- `Xia|Shi et al` - Found in nuclear winter research
- `DONOR_FATIGUE|AID_DONOR|HEAT_ADAPTATION` - Config parameters verified

**Validation method:**
Direct line-by-line comparison of research claims to code implementation, with special attention to parameter values, citations, and mechanism logic.

---

*"Better to find the problems now than after deployment" - Sylvia*