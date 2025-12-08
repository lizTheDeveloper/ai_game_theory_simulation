/**
 * Radiation Dose-Response Calculations
 *
 * Implements research-backed dose-response curves for:
 * - Acute Radiation Syndrome (ARS) mortality
 * - Latent cancer risk (LNT model)
 * - Tissue-weighted effective dose (ICRP 103)
 *
 * @see research/radiation_modeling_20251207.md
 * @see plans/M-6_enhanced_radiation_modeling_design.md
 */

import { assertFinite, assertProbability } from './utils/assertions';
import {
  ARS_THRESHOLDS,
  CANCER_RISK,
  ICRP_103_TISSUE_WEIGHTS
} from '../types/radiationExposure';

/**
 * Calculate ARS mortality from acute whole-body dose
 *
 * Uses sigmoid curve fitted to empirical data:
 * - <0.7 Gy: No ARS (0% mortality)
 * - 2-3.5 Gy: Hematopoietic syndrome (10-50% mortality)
 * - 6-8 Gy: GI + hematopoietic (50-90% mortality)
 * - >10 Gy: Cerebrovascular (100% mortality)
 *
 * Research: CDC Radiation Emergencies (2024), ICRP 118
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
 * Research: ICRP 103 (2007), BEIR VII (2006)
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
 * Research: BEIR VII (2006), Hiroshima/Nagasaki Life Span Study
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
 * Research: ICRP Publication 103 (2007), Table A.4.2
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
