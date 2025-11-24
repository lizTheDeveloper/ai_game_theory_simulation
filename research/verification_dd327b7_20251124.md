# Research Verification: Hindcast Calibration Phase 1-2

**Commit:** dd327b73ef9a75dc15fe3f29075f27d7b6ec99c8
**Date:** 2025-11-24
**Files Changed:** config.ts, bayesianMortality.ts, resourceDepletion.ts, initialization.ts, resources.ts

## Summary

This commit introduces era-specific mortality multipliers and thermal inertia modeling for hindcast validation. Verification needed for the specific quantitative claims.

---

## Parameters Requiring Verification

### 1. ERA_MORTALITY_MULTIPLIERS

**File:** `src/types/config.ts` (lines 270-294)

**Current Values:**
```typescript
export const ERA_MORTALITY_MULTIPLIERS: Record<number, number> = {
  1990: 0.30,  // 30% of 2025 baseline
  1995: 0.35,
  2000: 0.40,
  2005: 0.50,
  2010: 0.60,
  2015: 0.70,
  2020: 0.85,  // COVID era
  2025: 1.00,  // Calibration baseline
};
```

**Claims Made in Code Comments:**
1. "~50% reduction in age-standardized mortality 1990-2019" (attributed to IHME)
2. Historical eras had lower baseline mortality due to different resilience profiles

**Citations to Verify:**

#### Citation 1: UN World Population Prospects
- **Layer 1 (Existence):** VERIFY - Does UN WPP provide historical mortality trends?
- **Layer 2 (Claim):** VERIFY - Does WPP support the specific 0.30 → 1.00 progression?
- **Specific question:** What is the actual mortality rate change 1990-2025 in WPP data?

#### Citation 2: IHME Global Burden of Disease
- **Layer 1 (Existence):** VERIFY - Is there a specific IHME publication on 50% mortality reduction?
- **Layer 2 (Claim):** VERIFY - Does IHME state "~50% reduction in age-standardized mortality 1990-2019"?
- **Specific question:** What mortality metric? All-cause? Crisis-specific?

**Concerns:**
- The 0.30 multiplier for 1990 implies mortality risk was 70% lower - this seems aggressive
- Need to distinguish between:
  - All-cause mortality decline (gradual, driven by healthcare)
  - Crisis mortality response (may not have same trend)
- The simulation applies this to ALL mortality risks, including future crises that didn't exist in 1990

---

### 2. Thermal Inertia Transition Period

**File:** `src/simulation/initialization.ts` (lines 1391-1393)

**Current Value:**
```typescript
state.resourceEconomy.co2.hindcastTransitionMonths = 24; // 2 years for thermal inertia
```

**Claim:** Ocean thermal inertia requires ~24 months to equilibrate

**Citation to Verify:**
- **Layer 1 (Existence):** NONE CITED - This appears to be an estimate
- **Layer 2 (Claim):** N/A

**Concern:** The 24-month transition is not cited. Ocean thermal inertia actually operates on decadal timescales. Need research backing for this specific value.

---

### 3. Climate Stability Derivation

**File:** `src/simulation/initialization.ts` (lines 1628-1644)

**Formula:**
```typescript
const historicalClimateStability = Math.max(0.05, 1 - pb.climateChange);
```

**Claim:** Climate stability = 1 - climate_change_boundary_value

**Citation to Verify:**
- **Layer 1 (Existence):** NONE CITED - This is a novel derivation
- **Layer 2 (Claim):** N/A

**Concern:** This assumes an inverse linear relationship between planetary boundary exceedance and climate stability. Needs theoretical justification.

---

## Verification Priority

| Parameter | Priority | Reason |
|-----------|----------|--------|
| ERA_MORTALITY_MULTIPLIERS | HIGH | Directly affects population survival across all scenarios |
| Thermal inertia 24-month | MEDIUM | Affects hindcast validation accuracy |
| Climate stability derivation | MEDIUM | Novel formula without citation |

---

## Questions for Research Validation

1. **For ERA_MORTALITY_MULTIPLIERS:**
   - What is the actual global crude death rate trend 1990-2025? (per 1000 population)
   - Does IHME's "50% reduction" refer to age-standardized all-cause mortality?
   - Should crisis mortality (climate, famine) scale the same as baseline mortality?

2. **For Thermal Inertia:**
   - What is the empirical timescale for surface temperature response to radiative forcing changes?
   - Is 24 months reasonable for hindcast purposes, or should it be longer?

3. **For Climate Stability:**
   - Is there literature supporting stability = 1 - boundary_exceedance?
   - Should this be a nonlinear relationship?

---

## Verification Status

- [ ] UN World Population Prospects - existence + claim verification
- [ ] IHME Global Burden of Disease - existence + claim verification (50% figure)
- [ ] Ocean thermal inertia timescales - find supporting literature
- [ ] Climate stability formula - theoretical justification

---

*Created by historian agent for orchestrator research validation workflow*
