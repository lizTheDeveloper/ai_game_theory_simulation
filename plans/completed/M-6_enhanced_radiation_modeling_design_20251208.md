# M-6: Enhanced Radiation Modeling - Design Document

**Date:** 2025-12-07
**Status:** Design Review Complete
**Priority:** MEDIUM
**Complexity:** Moderate (integrates with existing nuclear winter system)

## Executive Summary

This design extends the existing radiation zone tracking system in `nuclearWinter.ts` to model:
1. **Acute vs chronic exposure** (dose rate effects)
2. **Tissue-specific sensitivity** (ICRP tissue weighting factors)
3. **Dose-response curves** (LNT model for cancer, ARS thresholds for immediate mortality)
4. **Cumulative dose tracking** (lifetime exposure, latent cancer risk)

**Current system:** Simple monthly death rate (`monthlyDeathRate`) with exponential decay (`currentLevel * (1 - decayRate)`)

**Enhanced system:** Dual-track modeling:
- **Acute exposure** → Immediate Acute Radiation Syndrome (ARS) mortality
- **Chronic exposure** → Delayed cancer deaths over decades

## 1. Current System Analysis

### Existing Structure (src/types/nuclearWinter.ts)

```typescript
interface RadiationZone {
  country: string;
  hitMonth: number;
  intensity: number;           // [0,1] Radiation level (1 = severe)
  decayRate: number;           // Monthly decay rate (typically 0.05 = 5%/month)
  currentLevel: number;        // [0,1] Current radiation (decays over time)
  monthlyDeathRate: number;    // Additional deaths per month (0.01 = 1%)
}
```

### Existing Logic (src/simulation/nuclearWinter.ts:830-905)

```typescript
// Decay radiation over time
zone.currentLevel = zone.currentLevel * (1 - zone.decayRate);

// Apply radiation mortality (scales with radiation level)
const radiationMortality = zone.monthlyDeathRate * zone.currentLevel;

// Track deaths
totalRadiationDeaths += countryDeaths;
winter.totalRadiationDeaths += totalRadiationDeaths;
```

### What Works Well

✅ Exponential decay matches physical half-life
✅ Country-specific tracking
✅ Integration with Bayesian mortality system
✅ Defensive coding (NaN protection, extinction detection)
✅ Performance optimization (in-place splice for zone removal)

### What's Missing

❌ No distinction between acute (blast zone) vs chronic (fallout) exposure
❌ No dose-dependent effects (ARS thresholds, cancer risk curves)
❌ No tissue-specific modeling
❌ Monthly death rate is constant, not dose-response based
❌ No cumulative dose tracking (lifetime exposure)
❌ No age/sex effects on cancer risk

## 2. Design Proposal

### 2.1 Enhanced Type Definitions

**File:** `src/types/radiationExposure.ts` (NEW)

```typescript
/**
 * TIER 1.7.5: Enhanced Radiation Modeling
 *
 * Models tissue-specific, dose-dependent radiation exposure:
 * - Acute vs chronic exposure (dose rate effects)
 * - ICRP 103 tissue weighting factors
 * - ARS thresholds for immediate mortality
 * - LNT model for latent cancer risk
 *
 * Research:
 * - ICRP 103 (2007, reaffirmed ICRP 152 2022): Tissue weighting factors
 * - BEIR VII (2006): Cancer risk coefficients
 * - CDC (2024): ARS clinical thresholds
 */

/**
 * ICRP 103 tissue weighting factors (wT)
 * Sum of all weights = 1.00
 */
export const ICRP_103_TISSUE_WEIGHTS: Record<string, number> = {
  // wT = 0.12 each (most radiosensitive)
  'bone-marrow': 0.12,
  'colon': 0.12,
  'lung': 0.12,
  'stomach': 0.12,
  'breast': 0.12,
  'remainder': 0.12,  // 13 organs combined

  // wT = 0.08
  'gonads': 0.08,

  // wT = 0.04 each
  'bladder': 0.04,
  'esophagus': 0.04,
  'liver': 0.04,
  'thyroid': 0.04,

  // wT = 0.01 each
  'bone-surface': 0.01,
  'brain': 0.01,
  'salivary-glands': 0.01,
  'skin': 0.01,
};

/**
 * ARS (Acute Radiation Syndrome) thresholds
 * Source: CDC, ICRP 118
 */
export const ARS_THRESHOLDS = {
  // Minimum for any symptoms
  PRODROMAL_THRESHOLD: 0.3,  // Gy (mild nausea, fatigue)

  // Clinical ARS begins
  ARS_THRESHOLD: 0.7,  // Gy (hematopoietic syndrome possible)

  // Mortality thresholds
  LD10: 2.0,   // Gy (10% mortality, hematopoietic syndrome)
  LD50_UNTREATED: 3.5,  // Gy (50% mortality without medical care)
  LD50_TREATED: 6.0,    // Gy (50% mortality with intensive care)
  LD90: 8.0,   // Gy (90% mortality even with care)
  LD100: 10.0, // Gy (100% mortality, cerebrovascular syndrome)
};

/**
 * Cancer risk coefficients (LNT model)
 * Source: ICRP 103, BEIR VII
 */
export const CANCER_RISK = {
  // Total cancer risk per Sievert
  TOTAL_CANCER_PER_SV: 0.05,      // 5% per Sv (ICRP 103)
  FATAL_CANCER_PER_SV: 0.025,     // 2.5% per Sv (BEIR VII: 50% of cancers fatal)

  // Dose-rate effectiveness factor (DREF)
  // Chronic low-dose exposure has ~2x lower risk than acute
  DREF: 2.0,
  DREF_THRESHOLD: 0.1,  // Gy/hour (below this, apply DREF)
};

/**
 * Radiation exposure tracking per zone
 *
 * Replaces simple monthlyDeathRate with dose-response modeling
 */
export interface RadiationExposure {
  // Zone identification
  country: string;
  hitMonth: number;

  // Acute exposure (immediate, high dose rate)
  acuteExposure: {
    // Initial dose from blast + prompt radiation
    initialDose: number;        // Gy (whole-body equivalent)
    doseRate: number;           // Gy/hour at time of exposure
    timestamp: number;          // Month when acute exposure occurred

    // ARS mortality (calculated once at exposure)
    arsMortalityRate: number;   // [0, 1] Fraction killed by ARS
    arsDeathsApplied: boolean;  // Has ARS mortality been applied?
  };

  // Chronic exposure (ongoing, low dose rate from fallout)
  chronicExposure: {
    // Cumulative dose tracking
    cumulativeDose: number;     // Gy (total lifetime exposure so far)
    monthlyDoseRate: number;    // Gy/month (current fallout exposure)

    // Decay parameters
    decayRate: number;          // Monthly decay (typically 0.05 = 5%/month)
    currentIntensity: number;   // [0,1] Current fallout level (decays over time)

    // Latent cancer risk (calculated monthly)
    lifetimeCancerRisk: number; // [0,1] Probability of radiation-induced cancer
    monthlyCancerDeaths: number; // Deaths per month from latent cancers
  };

  // Tissue-specific doses (optional, for future enhancement)
  tissueDoses?: Map<string, number>;  // Organ → absorbed dose (Gy)
  effectiveDose?: number;             // Weighted sum using ICRP wT factors
}

/**
 * Enhanced nuclear winter state
 * Extends existing NuclearWinterState
 */
export interface EnhancedRadiationTracking {
  // Replace simple radiationZones: RadiationZone[]
  radiationExposures: RadiationExposure[];

  // Separate death tracking
  totalARSDeaths: number;       // Immediate deaths from acute radiation syndrome
  totalCancerDeaths: number;    // Delayed deaths from radiation-induced cancer

  // Total radiation deaths = totalARSDeaths + totalCancerDeaths
  // Replaces existing totalRadiationDeaths
}
```

### 2.2 Dose-Response Functions

**File:** `src/simulation/radiationDoseResponse.ts` (NEW)

```typescript
import { assertFinite, assertProbability, assertInRange } from './utils/assertions';
import { ARS_THRESHOLDS, CANCER_RISK } from '../types/radiationExposure';

/**
 * Calculate ARS mortality from acute whole-body dose
 *
 * Uses sigmoid curve fitted to empirical data:
 * - <0.7 Gy: No ARS (0% mortality)
 * - 2-3.5 Gy: Hematopoietic syndrome (10-50% mortality)
 * - 6-8 Gy: GI + hematopoietic (50-90% mortality)
 * - >10 Gy: Cerebrovascular (100% mortality)
 *
 * @param acuteDose - Whole-body dose in Gray (Gy)
 * @param medicalCare - Is intensive medical care available? (Default: false)
 * @returns Mortality rate [0, 1]
 */
export function calculateARSMortality(
  acuteDose: number,
  medicalCare: boolean = false
): number {
  // Input validation
  const dose = assertFinite(acuteDose, {
    location: 'calculateARSMortality',
    valueName: 'acuteDose',
    additionalInfo: { medicalCare }
  });

  // Below ARS threshold: no mortality
  if (dose < ARS_THRESHOLDS.ARS_THRESHOLD) {
    return 0;
  }

  // Above LD100: certain death
  if (dose >= ARS_THRESHOLDS.LD100) {
    return 1.0;
  }

  // Sigmoid curve: mortality = 1 / (1 + e^(-k*(dose - LD50)))
  // k controls steepness (fitted to empirical data)
  const LD50 = medicalCare ? ARS_THRESHOLDS.LD50_TREATED : ARS_THRESHOLDS.LD50_UNTREATED;
  const k = medicalCare ? 1.5 : 2.0;  // Steeper curve without medical care

  const mortality = 1.0 / (1.0 + Math.exp(-k * (dose - LD50)));

  return assertProbability(mortality, {
    location: 'calculateARSMortality',
    valueName: 'mortality',
    additionalInfo: { dose, LD50, medicalCare }
  });
}

/**
 * Calculate latent cancer risk from cumulative radiation exposure
 *
 * Uses LNT (Linear No-Threshold) model:
 * - Risk = dose × risk_coefficient
 * - DREF applied for chronic low-dose-rate exposure
 *
 * IMPORTANT: This calculates LIFETIME risk, not monthly mortality.
 * Actual cancer deaths distributed over decades (latency period 5-40 years).
 *
 * @param cumulativeDose - Total lifetime dose in Sievert (Sv)
 * @param doseRate - Current dose rate in Gy/hour
 * @param useFatalOnly - Return only fatal cancer risk? (Default: true)
 * @returns Lifetime cancer risk [0, 1]
 */
export function calculateLatentCancerRisk(
  cumulativeDose: number,
  doseRate: number,
  useFatalOnly: boolean = true
): number {
  // Input validation
  const dose = assertFinite(cumulativeDose, {
    location: 'calculateLatentCancerRisk',
    valueName: 'cumulativeDose',
    additionalInfo: { doseRate, useFatalOnly }
  });

  const rate = assertFinite(doseRate, {
    location: 'calculateLatentCancerRisk',
    valueName: 'doseRate',
    additionalInfo: { cumulativeDose, useFatalOnly }
  });

  // No dose, no risk
  if (dose <= 0) return 0;

  // Select risk coefficient
  const riskCoefficient = useFatalOnly
    ? CANCER_RISK.FATAL_CANCER_PER_SV
    : CANCER_RISK.TOTAL_CANCER_PER_SV;

  // Apply DREF for chronic low-dose-rate exposure
  // If dose rate < 0.1 Gy/hour, reduce risk by factor of 2
  let effectiveDose = dose;
  if (rate < CANCER_RISK.DREF_THRESHOLD) {
    effectiveDose = dose / CANCER_RISK.DREF;
  }

  // LNT: linear relationship between dose and risk
  const cancerRisk = effectiveDose * riskCoefficient;

  // Cap at 1.0 (cannot exceed 100% risk)
  return assertProbability(Math.min(cancerRisk, 1.0), {
    location: 'calculateLatentCancerRisk',
    valueName: 'cancerRisk',
    additionalInfo: { dose, effectiveDose, doseRate, riskCoefficient }
  });
}

/**
 * Distribute latent cancer deaths over time
 *
 * Cancers don't appear immediately - there's a latency period.
 * This function converts lifetime cancer risk to monthly mortality rate.
 *
 * Latency distribution (empirical from Hiroshima/Nagasaki survivors):
 * - Leukemia: 2-5 years peak, 5-10 year tail
 * - Solid tumors: 10-20 years peak, 20-40 year tail
 *
 * Simplified model: Assume cancer deaths spread over 30 years (360 months)
 * with Gaussian distribution centered at 15 years post-exposure.
 *
 * @param lifetimeCancerRisk - Total lifetime cancer mortality risk [0,1]
 * @param monthsSinceExposure - Months elapsed since radiation exposure
 * @returns Monthly cancer mortality rate this month [0,1]
 */
export function distributeLatentCancerDeaths(
  lifetimeCancerRisk: number,
  monthsSinceExposure: number
): number {
  // Input validation
  const risk = assertProbability(lifetimeCancerRisk, {
    location: 'distributeLatentCancerDeaths',
    valueName: 'lifetimeCancerRisk',
    additionalInfo: { monthsSinceExposure }
  });

  const monthsElapsed = assertFinite(monthsSinceExposure, {
    location: 'distributeLatentCancerDeaths',
    valueName: 'monthsSinceExposure',
    additionalInfo: { lifetimeCancerRisk }
  });

  // No risk, no deaths
  if (risk <= 0) return 0;

  // Latency period: cancers appear 2-40 years post-exposure
  // Too early: no cancers yet
  if (monthsElapsed < 24) return 0;  // <2 years

  // Too late: most cancers already manifested
  if (monthsElapsed > 480) return 0;  // >40 years

  // Gaussian distribution:
  // - Peak at 180 months (15 years)
  // - Std dev = 120 months (10 years)
  const peak = 180;
  const stdDev = 120;

  const gaussian = Math.exp(-Math.pow(monthsElapsed - peak, 2) / (2 * Math.pow(stdDev, 2)));
  const normalizationFactor = 1.0 / (stdDev * Math.sqrt(2 * Math.PI));

  // Monthly mortality = lifetime risk × Gaussian density × months
  // (Gaussian is normalized so integral over all months ≈ 1)
  const monthlyMortality = risk * gaussian * normalizationFactor * 360;

  return assertFinite(monthlyMortality, {
    location: 'distributeLatentCancerDeaths',
    valueName: 'monthlyMortality',
    month: monthsElapsed,
    additionalInfo: { risk, monthsElapsed, gaussian }
  });
}

/**
 * Calculate effective dose from tissue-specific doses
 *
 * Effective dose = Σ (wT × HT)
 * where wT = tissue weighting factor, HT = equivalent dose to tissue T
 *
 * @param tissueDoses - Map of tissue name → absorbed dose (Gy)
 * @returns Effective dose (Sv)
 */
export function calculateEffectiveDose(
  tissueDoses: Map<string, number>
): number {
  let effectiveDose = 0;

  for (const [tissue, dose] of tissueDoses) {
    const weight = ICRP_103_TISSUE_WEIGHTS[tissue];
    if (weight === undefined) {
      console.warn(`⚠️  Unknown tissue '${tissue}' - skipping in effective dose calculation`);
      continue;
    }

    effectiveDose += weight * dose;
  }

  return assertFinite(effectiveDose, {
    location: 'calculateEffectiveDose',
    valueName: 'effectiveDose',
    additionalInfo: { tissueCount: tissueDoses.size }
  });
}
```

### 2.3 Integration with Nuclear Winter System

**File:** `src/simulation/nuclearWinter.ts` (MODIFIED)

Changes needed:

1. **Import new types and functions:**
```typescript
import { RadiationExposure, ICRP_103_TISSUE_WEIGHTS, ARS_THRESHOLDS, CANCER_RISK } from '../types/radiationExposure';
import {
  calculateARSMortality,
  calculateLatentCancerRisk,
  distributeLatentCancerDeaths
} from './radiationDoseResponse';
```

2. **Modify `NuclearWinterState` interface:**
```typescript
// BEFORE:
radiationZones: RadiationZone[];
totalRadiationDeaths: number;

// AFTER:
radiationExposures: RadiationExposure[];
totalARSDeaths: number;       // NEW: Immediate ARS mortality
totalCancerDeaths: number;    // NEW: Delayed cancer mortality
// Keep totalRadiationDeaths for backward compatibility (= ARS + cancer)
totalRadiationDeaths: number;  // DEPRECATED: Use totalARSDeaths + totalCancerDeaths
```

3. **Modify `triggerNuclearWinter()`:**
```typescript
// When creating radiation zones for hit countries:
winter.radiationExposures.push({
  country,
  hitMonth: state.currentMonth,

  // Acute exposure from blast + prompt radiation
  acuteExposure: {
    initialDose: 4.0,  // Gy (typical for immediate blast zone)
    doseRate: 100.0,   // Gy/hour (very high dose rate)
    timestamp: state.currentMonth,
    arsMortalityRate: calculateARSMortality(4.0, false),  // No medical care post-war
    arsDeathsApplied: false,
  },

  // Chronic exposure from fallout
  chronicExposure: {
    cumulativeDose: 0,  // Accumulates over time
    monthlyDoseRate: 0.05,  // Gy/month initial fallout (decreases over time)
    decayRate: 0.05,    // 5% per month
    currentIntensity: 0.8,  // High initial fallout
    lifetimeCancerRisk: 0,  // Calculated as dose accumulates
    monthlyCancerDeaths: 0,
  },
});
```

4. **Replace `updateRadiationZones()` with `updateRadiationExposures()`:**
```typescript
function updateRadiationExposures(state: GameState, winter: NuclearWinterState): void {
  if (winter.radiationExposures.length === 0) return;

  let totalARSDeaths = 0;
  let totalCancerDeaths = 0;

  winter.radiationExposures.forEach(exposure => {
    const country = state.countryPopulationSystem?.countries[exposure.country];
    if (!country || country.population <= 0.1) return;

    // === 1. ACUTE EXPOSURE (ARS) - Apply once ===
    if (!exposure.acuteExposure.arsDeathsApplied) {
      const arsMortality = exposure.acuteExposure.arsMortalityRate;
      const arsDeaths = (country.population / 1000) * arsMortality;
      totalARSDeaths += arsDeaths;

      // Mark as applied
      exposure.acuteExposure.arsDeathsApplied = true;

      console.log(`   ☢️ 💀 ARS deaths in ${exposure.country}: ${(arsDeaths * 1000).toFixed(1)}M (${(arsMortality * 100).toFixed(0)}% from ${exposure.acuteExposure.initialDose.toFixed(1)} Gy)`);
    }

    // === 2. CHRONIC EXPOSURE (Fallout) - Apply monthly ===
    // Decay fallout intensity
    exposure.chronicExposure.currentIntensity *= (1 - exposure.chronicExposure.decayRate);

    // Accumulate dose
    const monthlyDose = exposure.chronicExposure.monthlyDoseRate * exposure.chronicExposure.currentIntensity;
    exposure.chronicExposure.cumulativeDose += monthlyDose;

    // Calculate lifetime cancer risk (updates as cumulative dose increases)
    const doseRateGyPerHour = exposure.chronicExposure.monthlyDoseRate / 720;  // Convert month to hours
    exposure.chronicExposure.lifetimeCancerRisk = calculateLatentCancerRisk(
      exposure.chronicExposure.cumulativeDose,
      doseRateGyPerHour,
      true  // Fatal cancers only
    );

    // Distribute cancer deaths over time (latency period)
    const monthsSinceExposure = state.currentMonth - exposure.hitMonth;
    const monthlyCancerMortality = distributeLatentCancerDeaths(
      exposure.chronicExposure.lifetimeCancerRisk,
      monthsSinceExposure
    );

    exposure.chronicExposure.monthlyCancerDeaths = monthlyCancerMortality;
    const cancerDeaths = (country.population / 1000) * monthlyCancerMortality;
    totalCancerDeaths += cancerDeaths;

    // Log significant cancer deaths annually
    if (monthsSinceExposure % 12 === 0 && cancerDeaths > 0.001) {
      console.log(`   ☢️ 🦀 Radiation-induced cancer deaths in ${exposure.country}: ${(cancerDeaths * 1000).toFixed(1)}M (cumulative dose: ${exposure.chronicExposure.cumulativeDose.toFixed(2)} Gy)`);
    }
  });

  // === 3. APPLY MORTALITY TO POPULATION ===
  // ARS mortality (if any were triggered this month)
  if (totalARSDeaths > 0) {
    addMortalityRisk(state.humanPopulationSystem, {
      type: 'war',
      baseRisk: totalARSDeaths / (state.humanPopulationSystem.population * 0.30),
      scope: 'REGIONAL',
      exposedFraction: 0.30,
      proximate: 'war',
      root: RootCause.conflict,
      month: state.currentMonth,
      description: 'Acute Radiation Syndrome (ARS)',
      confidence: 'HIGH'
    });
    winter.totalARSDeaths += totalARSDeaths;
  }

  // Cancer mortality (ongoing)
  if (totalCancerDeaths > 0) {
    addMortalityRisk(state.humanPopulationSystem, {
      type: 'war',
      baseRisk: totalCancerDeaths / (state.humanPopulationSystem.population * 0.30),
      scope: 'REGIONAL',
      exposedFraction: 0.30,
      proximate: 'war',
      root: RootCause.conflict,
      month: state.currentMonth,
      description: 'Radiation-induced cancer (latent)',
      confidence: 'HIGH'
    });
    winter.totalCancerDeaths += totalCancerDeaths;
  }

  // Update legacy totalRadiationDeaths for backward compatibility
  winter.totalRadiationDeaths = winter.totalARSDeaths + winter.totalCancerDeaths;

  // === 4. CLEANUP ===
  // Remove exposures with negligible fallout (<1%) AND all ARS applied
  for (let i = winter.radiationExposures.length - 1; i >= 0; i--) {
    const exposure = winter.radiationExposures[i];
    if (exposure.chronicExposure.currentIntensity <= 0.01 &&
        exposure.acuteExposure.arsDeathsApplied) {
      winter.radiationExposures.splice(i, 1);
    }
  }
}
```

## 3. Implementation Parameters

### Initial Dose Estimates by Zone

| Zone | Acute Dose (Gy) | Chronic Rate (Gy/month) | ARS Mortality | Source |
|------|----------------|----------------------|---------------|--------|
| **Blast epicenter** | 10-50 | 1.0 | 100% | Instant death (not modeled, already in blast casualties) |
| **Immediate fallout** | 4-8 | 0.5 | 50-90% | Heavy fallout within 24h |
| **Extended fallout** | 1-3 | 0.1 | 10-50% | Fallout over days/weeks |
| **Regional fallout** | 0.1-0.7 | 0.01 | 0-1% | Dispersed fallout |
| **Global fallout** | 0.001-0.01 | 0.0001 | 0% | Worldwide background increase |

### Decay Parameters

- **Radioactive decay:** 5% per month (half-life ~14 months)
  - Matches fission products (I-131, Cs-137, Sr-90)
  - Simplification: Real fallout has multi-component decay
- **Weathering:** Additional 2% per month (wind, rain wash-out)
- **Combined decay:** 7% per month effective

### Medical Care Assumptions

Post-nuclear-war scenario:
- **No medical care** for ARS treatment (use untreated LD50 = 3.5 Gy)
- Hospitals destroyed, medical supplies exhausted
- Only exception: Countries not directly hit might provide care (future enhancement)

## 4. Monte Carlo Validation Plan

**Required tests (N≥10 runs each):**

### Test 1: ARS Thresholds
```typescript
// Setup: Single country, varying acute doses
testCases = [
  { dose: 0.5, expectedMortality: 0 },      // Below threshold
  { dose: 2.0, expectedMortality: 0.1 },   // LD10
  { dose: 3.5, expectedMortality: 0.5 },   // LD50 (untreated)
  { dose: 8.0, expectedMortality: 0.9 },   // LD90
  { dose: 12.0, expectedMortality: 1.0 },  // Above LD100
];
```

**Expected:** Mortality follows sigmoid curve, matches ARS thresholds ±5%

### Test 2: Chronic Exposure Cancer Risk
```typescript
// Setup: Chronic 0.01 Gy/month for 10 years (1.2 Gy cumulative)
// With DREF=2, effective dose = 0.6 Gy
// Expected cancer risk = 0.6 × 0.025 = 1.5%
```

**Expected:** Lifetime cancer risk ~1.5%, deaths distributed over years 5-30 post-exposure

### Test 3: Nuclear Winter Full-Scale
```typescript
// Setup: 150 Tg war, 30 countries hit
// Acute: 4 Gy average (50% ARS mortality)
// Chronic: 0.05 Gy/month initial, decays over 5 years
```

**Expected:**
- Immediate: 15% of hit countries' population dies from ARS (first month)
- Long-term: Additional 2-5% die from cancer over 20 years
- CV < 0.01% across runs (deterministic)

### Test 4: Dose Decay
```typescript
// Setup: Initial 0.8 intensity, 5% monthly decay
// Month 12: 0.8 × (0.95^12) = 0.43
// Month 24: 0.8 × (0.95^24) = 0.23
```

**Expected:** Exponential decay curve, half-life ~14 months

### Test 5: Latency Distribution
```typescript
// Setup: Fixed 5% lifetime cancer risk
// Track monthly cancer deaths over 480 months
```

**Expected:**
- No deaths months 0-24 (latency period)
- Peak deaths months 120-240 (10-20 years)
- Tail deaths months 240-480 (20-40 years)
- Sum of all monthly deaths ≈ 5% of exposed population

## 5. Future Enhancements (Out of Scope for M-6)

### M-6.1: Tissue-Specific Cancer Types
- Model lung cancer, colon cancer, leukemia separately
- Different latency periods per cancer type
- Tissue-specific dose reconstruction

### M-6.2: Age/Sex Stratification
- BEIR VII age/sex adjustment factors
- Children more radiosensitive than adults
- Sex-specific cancer risks (breast, prostate)

### M-6.3: Radiation Hormesis Sensitivity Analysis
- Implement threshold model (zero risk below threshold)
- Implement hormesis model (low doses beneficial)
- Compare outcomes: LNT vs threshold vs hormesis

### M-6.4: Sub-Lethal Dose Recovery
- Model DNA repair kinetics
- Cumulative sub-lethal exposures
- Chronic exposure saturation effects

## 6. Implementation Checklist

**Phase 1: Core Types (1-2 hours)**
- [ ] Create `src/types/radiationExposure.ts`
- [ ] Define `RadiationExposure` interface
- [ ] Define constants (ICRP_103, ARS_THRESHOLDS, CANCER_RISK)
- [ ] Extend `NuclearWinterState` with new fields

**Phase 2: Dose-Response Functions (2-3 hours)**
- [ ] Create `src/simulation/radiationDoseResponse.ts`
- [ ] Implement `calculateARSMortality()`
- [ ] Implement `calculateLatentCancerRisk()`
- [ ] Implement `distributeLatentCancerDeaths()`
- [ ] Implement `calculateEffectiveDose()` (optional, tissue-specific)
- [ ] Add unit tests for each function

**Phase 3: Integration (2-3 hours)**
- [ ] Modify `src/simulation/nuclearWinter.ts`
- [ ] Update `initializeNuclearWinterState()`
- [ ] Update `triggerNuclearWinter()` to create `RadiationExposure` objects
- [ ] Replace `updateRadiationZones()` with `updateRadiationExposures()`
- [ ] Update logging (☢️ 💀 for ARS, ☢️ 🦀 for cancer)
- [ ] Ensure backward compatibility (legacy `totalRadiationDeaths`)

**Phase 4: Testing (3-4 hours)**
- [ ] Run Monte Carlo validation (Tests 1-5 above)
- [ ] Check determinism (CV < 0.01%)
- [ ] Verify ARS thresholds match research
- [ ] Verify cancer risk matches LNT model
- [ ] Verify latency distribution is realistic
- [ ] Check for NaN/Infinity (defensive coding)

**Phase 5: Documentation (1 hour)**
- [ ] Update wiki with radiation system
- [ ] Document parameters and sources
- [ ] Add examples to devlog
- [ ] Update CLAUDE.md if needed

**Total estimated time:** 9-13 hours

## 7. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **NaN in dose calculations** | MEDIUM | HIGH | Use assertion utilities throughout |
| **Latency distribution too simple** | LOW | MEDIUM | Gaussian approximation is reasonable for population-level |
| **Medical care assumption too pessimistic** | LOW | LOW | Document assumption, allow override in future |
| **DREF application incorrect** | MEDIUM | MEDIUM | Unit test DREF logic carefully |
| **Cancer deaths exceed population** | LOW | HIGH | Cap at population size, add warnings |

### Research Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **LNT model disputed** | HIGH | MEDIUM | Document controversy, plan sensitivity analysis |
| **BEIR VII outdated** | MEDIUM | LOW | Best available source, monitor for BEIR VIII |
| **Age/sex effects missing** | HIGH | LOW | Use population averages (acceptable for v1) |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Break existing nuclear winter** | LOW | CRITICAL | Extensive testing, keep backward compatibility |
| **Performance regression** | LOW | MEDIUM | Profile before/after, optimize if needed |
| **Complexity creep** | MEDIUM | MEDIUM | Keep tissue-specific modeling optional |

## 8. Success Criteria

✅ **Implementation complete when:**
1. Monte Carlo tests pass (N≥10, CV < 0.01%)
2. ARS mortality matches CDC thresholds (±5%)
3. Cancer risk matches BEIR VII LNT model (±10%)
4. Latency distribution peaks at 10-20 years
5. No NaN/Infinity in logs
6. No performance regression (≤5% slowdown)
7. Documentation updated
8. Architecture review passes (no CRITICAL issues)

---

**Design approved:** 2025-12-07
**Ready for implementation:** YES
**Assigned to:** simulation-maintainer (Roy)
**Estimated completion:** 1-2 sessions (9-13 hours)
