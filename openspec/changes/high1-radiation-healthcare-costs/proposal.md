# HIGH-1: Radiation Healthcare Costs Integration

**Status:** Proposed
**Priority:** HIGH
**Effort:** Medium (2-3 days)
**Created:** December 8, 2025

---

## Problem Statement

**Architecture Review Finding (architecture_integration_review_20251208.md):**

The M-6 Enhanced Radiation Modeling calculates detailed medical care levels (`'none' | 'minimal' | 'supportive' | 'intensive'`) and population dose cohorts, but these don't feed into healthcare system costs or economic impacts.

**Missing Integration:**
1. Radiation treatment should draw from healthcare budget
2. Radiation-induced cancer should increase long-term healthcare demand
3. Medical infrastructure collapse from nuclear winter should cascade to other healthcare needs

**Impact:** Without this, economic simulations underestimate nuclear war costs. Healthcare systems don't reflect the burden of treating radiation casualties or long-term cancer care.

---

## Proposed Solution

### 1. Add Radiation Healthcare Demand Tracking

Add new fields to `GameState.healthcareSystem`:

```typescript
interface HealthcareSystem {
  // ... existing fields ...

  // NEW: Radiation healthcare demand (HIGH-1)
  radiationDemand: {
    // Acute Radiation Syndrome (ARS) treatment demand
    arsPatients: {
      moderate: number;    // 1-4 Gy cohort
      severe: number;      // 4-6 Gy cohort
      lethal: number;      // 6-10 Gy cohort
    };

    // Long-term cancer care demand (accumulated)
    lifetimeExcessCancerPatients: number;  // From lifetimeExcessCancerRisk integration

    // Healthcare system stress from radiation
    radiationStressMultiplier: number;  // [1.0 = baseline, >1.0 = stressed]

    // Cost estimates (fraction of healthcare capacity)
    arsCareFraction: number;           // % of capacity for ARS
    cancerCareFraction: number;        // % of capacity for radiation-induced cancer
  };
}
```

### 2. Connect Radiation Modeling to Healthcare System

**Phase Flow:**
1. `NuclearWinterPhase` calculates radiation zones and dose cohorts (existing)
2. `RadiationModelingPhase` applies dose-response curves and medical care (existing)
3. **NEW**: `HealthcareRadiationPhase` updates healthcare demand tracking
4. `HealthcareSystemPhase` adjusts capacity based on radiation demand (modified)

### 3. Economic Impact Integration

**Healthcare costs affect GDP:**
- ARS treatment is resource-intensive (intensive care, blood products, antibiotics)
- Long-term cancer care is sustained burden (chemotherapy, radiation therapy, monitoring)
- Healthcare system stress reduces effectiveness of other treatments

**Implementation:**
- Modify `getGDPProxy()` to account for healthcare burden
- Add healthcare cost multiplier to economic calculations
- Track healthcare infrastructure damage from nuclear winter

### 4. Quality of Life Integration

**Radiation healthcare demand affects QoL health dimension:**
- Healthcare system overload reduces general population health access
- Radiation casualties lower population-wide health metrics
- Medical infrastructure collapse cascades to non-radiation health needs

---

## Research Foundation

### Acute Radiation Syndrome Treatment Costs

**Source:** CDC Emergency Preparedness and Response (2024)
- **Moderate (1-4 Gy):** Supportive care - blood counts, antibiotics, fluids (~$50K-100K per patient)
- **Severe (4-6 Gy):** Intensive care - bone marrow support, transfusions, isolation (~$200K-500K per patient)
- **Lethal (6-10 Gy):** Palliative care only - pain management (~$20K-50K per patient)

**Source:** REMM (Radiation Emergency Medical Management)
- Medical countermeasures: Filgrastim (G-CSF) ~$10K per course
- Hospitalization duration: Moderate 30-60 days, Severe 60-90 days
- Success rate: Moderate 90%, Severe 50%, Lethal <5%

### Cancer Treatment Costs

**Source:** American Cancer Society (2024)
- Average cancer treatment cost: ~$150K per patient (surgery + chemo + radiation)
- Lifetime monitoring: ~$10K-20K per year for survivors
- Radiation-induced cancers manifest over 5-30 years (latency period)

### Healthcare System Capacity

**Source:** WHO Global Health Expenditure Database (2024)
- U.S. healthcare spending: ~$4.3T (2024), ~$13K per capita
- Global healthcare spending: ~$9.0T, ~$1.1K per capita
- Healthcare capacity constraint: ~2-3% surge capacity for mass casualty events

---

## Implementation Plan

### Phase 1: Data Structure (0.5 days)
1. Add `radiationDemand` fields to `HealthcareSystem` interface
2. Initialize in `initializeGameState.ts`
3. Add assertion utilities for validation

### Phase 2: Radiation → Healthcare Bridge (1 day)
1. Create `HealthcareRadiationPhase.ts`
2. Extract patient counts from `RadiationModelingPhase` output
3. Calculate ARS treatment demand (moderate/severe/lethal cohorts)
4. Accumulate lifetime excess cancer patients
5. Calculate healthcare system stress multiplier

### Phase 3: Economic Integration (0.5 days)
1. Modify `getGDPProxy()` to account for healthcare burden
2. Add healthcare cost multiplier (ARS + cancer care)
3. Track infrastructure damage from nuclear winter

### Phase 4: Quality of Life Integration (0.5 days)
1. Modify health QoL calculation to include radiation stress
2. Cascade healthcare overload to general population access
3. Update Multi-Paradigm DUI health indicators

### Phase 5: Testing & Validation (0.5 days)
1. Unit tests for `HealthcareRadiationPhase`
2. Integration tests for full radiation → healthcare → economy flow
3. Monte Carlo validation (N≥10) with nuclear scenarios
4. Verify cost estimates are realistic (compare to CDC/WHO baselines)

---

## Success Criteria

1. **Data Integration:** Radiation dose cohorts properly tracked in healthcare system
2. **Economic Impact:** Nuclear war scenarios show healthcare cost increase (measurable GDP effect)
3. **QoL Impact:** Healthcare overload reduces general population health access
4. **Research-Backed:** All parameters justified from peer-reviewed sources (CDC, REMM, ACS, WHO)
5. **Tests Pass:** All existing tests still pass, new tests cover radiation healthcare integration
6. **Deterministic:** Monte Carlo runs (N≥10) produce identical outputs with same seed

---

## Next Steps

1. **Research Validation (Quality Gate 1):**
   - super-alignment-researcher: Verify CDC/REMM/ACS/WHO cost estimates (2024-2025)
   - research-skeptic: Find contradictory evidence, assess parameter uncertainty

2. **Implementation (orchestrator):**
   - simulation-maintainer: Implement phases following defensive coding patterns
   - unit-test-writer: Create test coverage for new phase
   - integration-test-writer: Test full radiation → healthcare → economy flow

3. **Architecture Review (Quality Gate 2):**
   - architecture-skeptic: Post-implementation review (performance, state propagation)
   - priya: Monte Carlo validation (N≥10, determinism check)

4. **Documentation:**
   - wiki-documentation-updater: Update system documentation
   - architect: Archive to implementation history

---

## Related Work

- **M-6 Enhanced Radiation Modeling** - Provides dose-response curves and medical care levels (COMPLETE)
- **Nuclear Winter System** - Provides radiation zones and dose cohorts (COMPLETE)
- **Healthcare System** - Needs radiation demand integration (THIS PROPOSAL)
- **Economic System** - Needs healthcare cost multiplier (THIS PROPOSAL)

---

## Open Questions

1. **Latency Modeling:** Should we model 5-30 year cancer latency periods, or approximate as immediate burden?
2. **Regional Variation:** Should healthcare costs vary by country (U.S. $13K/capita vs global $1.1K/capita)?
3. **Infrastructure Damage:** How should nuclear winter infrastructure collapse affect healthcare capacity?

---

**Proposal Status:** Ready for Quality Gate 1 (Research Validation)
