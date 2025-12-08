# M-6: Enhanced Radiation Modeling

**Status:** Research Phase
**Priority:** MEDIUM
**Estimated Complexity:** 3 systems (nuclear winter, health effects, population)

## Problem Statement

Current radiation modeling in nuclear winter scenarios is overly simplistic:
- Single `intensity` value (0-1) without distinction between exposure types
- No tissue-specific sensitivity modeling
- Fixed `monthlyDeathRate` without dose-response curves
- Missing acute vs chronic exposure pathways
- No modeling of radiation sickness progression timeline

This results in unrealistic health outcomes for nuclear winter scenarios.

## Current Implementation

**Files:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/nuclearWinter.ts` (lines 828-905)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/nuclearWinter.ts` (RadiationZone interface)

**Current RadiationZone interface:**
```typescript
export interface RadiationZone {
  country: string;
  hitMonth: number;
  intensity: number;            // [0,1] Single value
  decayRate: number;
  currentLevel: number;
  monthlyDeathRate: number;     // Fixed rate
}
```

**Current mortality calculation:**
```typescript
const radiationMortality = zone.monthlyDeathRate * zone.currentLevel;
```

## Proposed Enhancement

### 1. Distinguish Acute vs Chronic Exposure

**Acute exposure:** High-dose, short-duration (nuclear detonation proximity)
- Dose range: 1-10+ Gy (Gray)
- Timeline: Days to weeks for radiation sickness
- Outcomes: Mortality at >4 Gy without treatment

**Chronic exposure:** Low-dose, long-duration (fallout contamination)
- Dose range: 0.001-0.1 Gy/month
- Timeline: Months to years for cancer risk
- Outcomes: Increased cancer mortality over lifetime

### 2. Tissue Weighting Factors

Implement ICRP (International Commission on Radiological Protection) tissue weighting factors:

| Tissue/Organ | Weighting Factor (wT) | Radiation Sensitivity |
|--------------|----------------------|----------------------|
| Bone marrow | 0.12 | High (hematopoietic) |
| Colon | 0.12 | High (rapidly dividing) |
| Lung | 0.12 | High |
| Stomach | 0.12 | High |
| Breast | 0.12 | Moderate-High |
| Gonads | 0.08 | High (reproductive) |
| Bladder | 0.04 | Moderate |
| Liver | 0.04 | Moderate |
| Thyroid | 0.04 | Moderate (iodine-131) |
| Bone surface | 0.01 | Low |
| Brain | 0.01 | Low |
| Salivary glands | 0.01 | Low |
| Skin | 0.01 | Low |
| Remainder | 0.12 | Averaged |

**Effective Dose (Sv) = Σ (Organ Dose × Tissue Weighting Factor)**

### 3. Dose-Response Curves

**Acute radiation syndrome (ARS):**
- <1 Gy: Minimal symptoms
- 1-2 Gy: Mild radiation sickness (nausea, fatigue)
- 2-4 Gy: Moderate (vomiting, infections, 50% survival)
- 4-6 Gy: Severe (bone marrow failure, 50% mortality)
- 6-8 Gy: Very severe (GI tract damage, 90% mortality)
- >8 Gy: Fatal (CNS damage, near 100% mortality)

**Chronic cancer risk:**
- Linear no-threshold (LNT) model
- ~5% increased cancer risk per Sv lifetime dose
- Latency period: 5-20 years for solid tumors

### 4. Timeline for Radiation Sickness Progression

**Prodromal phase (0-48 hours):**
- Nausea, vomiting, diarrhea
- Severity correlates with dose

**Latent phase (days to weeks):**
- Apparent recovery
- Internal damage progressing

**Manifest illness (weeks to months):**
- Bone marrow suppression (infections, bleeding)
- GI tract damage (severe at >6 Gy)
- CNS damage (>30 Gy, death in hours)

**Recovery or death (weeks to months):**
- Survivors recover slowly over months
- Late effects: cancer, organ damage

## Research Questions

Need peer-reviewed sources (2024-2025 preferred) for:

1. **Tissue weighting factors:** ICRP Publication 103 (2007) or updates
2. **Acute exposure limits:** LD50/60 values with/without medical treatment
3. **Dose-response curves:** Mortality and morbidity by dose level
4. **Radiation sickness timeline:** Progression phases and duration
5. **Chronic cancer risk:** LNT model validation, lifetime risk estimates
6. **Fallout decay rates:** Radioactive isotope composition and half-lives
7. **Medical countermeasures:** Effectiveness of treatments (potassium iodide, colony-stimulating factors)

## Implementation Plan

### Phase 1: Research & Validation (Quality Gate 1)

**Agent:** super-alignment-researcher (Cynthia)
**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/radiation_biology_YYYYMMDD.md`

**Tasks:**
- [ ] Find 2+ peer-reviewed sources on tissue weighting factors
- [ ] Find 2+ sources on acute radiation syndrome dose-response
- [ ] Find 2+ sources on chronic cancer risk from radiation
- [ ] Find 2+ sources on fallout composition and decay rates
- [ ] Extract parameter values with citations
- [ ] Document timeline for radiation sickness progression

**Agent:** research-skeptic (Sylvia)
**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/radiation_biology_critique_YYYYMMDD.md`

**Tasks:**
- [ ] Validate methodology of cited papers
- [ ] Check for contradictory evidence
- [ ] Assess parameter justification
- [ ] Grade research quality (target: B+ or higher)

### Phase 2: Implementation & Testing

**Agent:** simulation-maintainer (Roy)

**Tasks:**
- [ ] Extend RadiationZone interface with acute/chronic fields
- [ ] Implement tissue weighting calculation
- [ ] Implement dose-response curves (mortality + morbidity)
- [ ] Add radiation sickness timeline phases
- [ ] Integrate with nuclear winter health effects
- [ ] Use assertion utilities (no silent fallbacks)
- [ ] Follow emoji conventions for logging
- [ ] Ensure deterministic RNG usage

**Files to modify:**
- `src/types/nuclearWinter.ts` - RadiationZone interface
- `src/simulation/nuclearWinter.ts` - updateRadiationZones function
- Add new: `src/simulation/radiationBiology.ts` - Tissue weighting, dose-response

**Agent:** unit-test-writer

**Tasks:**
- [ ] Test tissue weighting calculations
- [ ] Test dose-response curves
- [ ] Test acute vs chronic pathways
- [ ] Test radiation sickness timeline
- [ ] Test edge cases (zero dose, extreme dose)

**Agent:** integration-test-writer

**Tasks:**
- [ ] Test full nuclear scenario with radiation
- [ ] Test multiple radiation zones
- [ ] Test radiation decay over time
- [ ] Test interaction with population system

### Phase 3: Validation

**Agent:** priya (Monte Carlo validator)

**Tasks:**
- [ ] Run N≥10 simulations with nuclear scenarios
- [ ] Verify deterministic behavior (same seed = same results)
- [ ] Check CV < 0.01%
- [ ] Analyze outcome distributions
- [ ] Report effectiveness metrics

**Agent:** architecture-skeptic

**Tasks:**
- [ ] Review performance (O(n²) checks)
- [ ] Check state propagation
- [ ] Validate no NaN propagation
- [ ] Check for complexity creep
- [ ] Grade: B+ or higher required to proceed

### Phase 4: Documentation & Archival

**Agent:** architect

**Tasks:**
- [ ] Merge delta into OpenSpec simulation spec
- [ ] Create implementation history doc
- [ ] Archive to docs/implementation-history/
- [ ] Update Progress Summary

## Success Criteria

- [ ] Research validation passes (Grade B+ or higher)
- [ ] Implementation complete with unit tests
- [ ] Integration tests passing
- [ ] Monte Carlo validation N≥10 deterministic (CV < 0.01%)
- [ ] Architecture review passes (Grade B+ or higher)
- [ ] Documentation updated
- [ ] Plan archived

## Timeline Estimate

- Research & Validation: 1-2 hours
- Implementation: 2-3 hours
- Testing: 1 hour
- Validation: 1 hour
- Documentation: 0.5 hour

**Total: 5.5-7.5 hours**

## Risk Assessment

**LOW RISK:**
- Isolated feature (nuclear winter system)
- No breaking changes to existing interfaces
- Well-defined research domain (radiation biology)
- Clear testing strategy

**Dependencies:**
- Nuclear winter system (already exists)
- Population mortality system (already exists)
- Assertion utilities (already exists)

## Related Work

- HIGH-7: Conditional Climate Stability Floor (COMPLETE)
- M-5: Threshold Uncertainty Modeling (COMPLETE)
- M-7: Fix Population Assertions (COMPLETE)
