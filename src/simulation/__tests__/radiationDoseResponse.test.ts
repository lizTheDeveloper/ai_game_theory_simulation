/**
 * Unit tests for radiation dose-response calculations
 *
 * M-6: TIER 1.7.5 - Enhanced Radiation Modeling
 *
 * Tests ARS mortality, cancer risk, and latency distribution functions
 */

import { describe, test, expect } from 'vitest';
import {
  calculateARSMortality,
  calculateLatentCancerRisk,
  distributeLatentCancerDeaths,
  calculateEffectiveDose
} from '../radiationDoseResponse';
import { ARS_THRESHOLDS, CANCER_RISK } from '../../types/radiationExposure';

describe('calculateARSMortality', () => {
  test('returns 0% mortality below ARS threshold (0.7 Gy)', () => {
    expect(calculateARSMortality(0.5, false)).toBe(0);
    expect(calculateARSMortality(0.6, false)).toBe(0);
  });

  test('returns 100% mortality above LD100 (10 Gy)', () => {
    expect(calculateARSMortality(10.0, false)).toBe(1.0);
    expect(calculateARSMortality(15.0, false)).toBe(1.0);
  });

  test('returns ~50% mortality at LD50_UNTREATED (3.5 Gy)', () => {
    const mortality = calculateARSMortality(3.5, false);
    expect(mortality).toBeGreaterThan(0.45);
    expect(mortality).toBeLessThan(0.55);
  });

  test('returns ~50% mortality at LD50_TREATED (6.0 Gy) with medical care', () => {
    const mortality = calculateARSMortality(6.0, true);
    expect(mortality).toBeGreaterThan(0.45);
    expect(mortality).toBeLessThan(0.55);
  });

  test('medical care reduces mortality for same dose', () => {
    const dose = 4.0; // Between untreated and treated LD50
    const mortalityUntreated = calculateARSMortality(dose, false);
    const mortalityTreated = calculateARSMortality(dose, true);
    expect(mortalityTreated).toBeLessThan(mortalityUntreated);
  });

  test('returns probability in [0, 1] range', () => {
    for (let dose = 0; dose <= 20; dose += 0.5) {
      const mortality = calculateARSMortality(dose, false);
      expect(mortality).toBeGreaterThanOrEqual(0);
      expect(mortality).toBeLessThanOrEqual(1);
    }
  });

  test('mortality increases monotonically with dose', () => {
    let prevMortality = 0;
    for (let dose = 1.0; dose <= 10.0; dose += 0.5) {
      const mortality = calculateARSMortality(dose, false);
      expect(mortality).toBeGreaterThanOrEqual(prevMortality);
      prevMortality = mortality;
    }
  });
});

describe('calculateLatentCancerRisk', () => {
  test('returns 0% risk for zero dose', () => {
    expect(calculateLatentCancerRisk(0, 0.1, true)).toBe(0);
  });

  test('returns ~2.5% risk per Sievert (fatal cancers)', () => {
    const dose = 1.0; // 1 Sv
    const doseRate = 1.0; // 1 Gy/hour (high dose rate, no DREF)
    const risk = calculateLatentCancerRisk(dose, doseRate, true);
    expect(risk).toBeCloseTo(CANCER_RISK.FATAL_CANCER_PER_SV, 3);
  });

  test('returns ~5% risk per Sievert (total cancers)', () => {
    const dose = 1.0; // 1 Sv
    const doseRate = 1.0; // 1 Gy/hour (high dose rate, no DREF)
    const risk = calculateLatentCancerRisk(dose, doseRate, false);
    expect(risk).toBeCloseTo(CANCER_RISK.TOTAL_CANCER_PER_SV, 3);
  });

  test('applies DREF for low dose rates (< 0.1 Gy/hour)', () => {
    const dose = 1.0; // 1 Sv
    const highDoseRate = 1.0; // 1 Gy/hour
    const lowDoseRate = 0.01; // 0.01 Gy/hour (below DREF threshold)

    const highRateRisk = calculateLatentCancerRisk(dose, highDoseRate, true);
    const lowRateRisk = calculateLatentCancerRisk(dose, lowDoseRate, true);

    // Low dose rate should have ~2x lower risk (DREF = 2.0)
    expect(lowRateRisk).toBeCloseTo(highRateRisk / 2.0, 3);
  });

  test('caps risk at 100%', () => {
    const veryHighDose = 100.0; // 100 Sv (absurdly high)
    const risk = calculateLatentCancerRisk(veryHighDose, 1.0, true);
    expect(risk).toBe(1.0);
  });

  test('returns probability in [0, 1] range', () => {
    for (let dose = 0; dose <= 10; dose += 0.5) {
      const risk = calculateLatentCancerRisk(dose, 0.1, true);
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(1);
    }
  });

  test('risk increases linearly with dose (LNT model)', () => {
    const dose1 = 1.0;
    const dose2 = 2.0;
    const risk1 = calculateLatentCancerRisk(dose1, 1.0, true);
    const risk2 = calculateLatentCancerRisk(dose2, 1.0, true);
    expect(risk2).toBeCloseTo(risk1 * 2.0, 3);
  });
});

describe('distributeLatentCancerDeaths', () => {
  const lifetimeRisk = 0.10; // 10% lifetime cancer risk

  test('returns 0% mortality before latency period (< 2 years)', () => {
    expect(distributeLatentCancerDeaths(lifetimeRisk, 0)).toBe(0);
    expect(distributeLatentCancerDeaths(lifetimeRisk, 12)).toBe(0); // 1 year
    expect(distributeLatentCancerDeaths(lifetimeRisk, 23)).toBe(0); // <2 years
  });

  test('returns 0% mortality after cancers manifested (> 40 years)', () => {
    expect(distributeLatentCancerDeaths(lifetimeRisk, 481)).toBe(0); // 40+ years
    expect(distributeLatentCancerDeaths(lifetimeRisk, 600)).toBe(0);
  });

  test('returns non-zero mortality during latency window (2-40 years)', () => {
    expect(distributeLatentCancerDeaths(lifetimeRisk, 60)).toBeGreaterThan(0); // 5 years
    expect(distributeLatentCancerDeaths(lifetimeRisk, 180)).toBeGreaterThan(0); // 15 years (peak)
    expect(distributeLatentCancerDeaths(lifetimeRisk, 300)).toBeGreaterThan(0); // 25 years
  });

  test('peaks around 15 years post-exposure (180 months)', () => {
    const mortality180 = distributeLatentCancerDeaths(lifetimeRisk, 180);
    const mortality120 = distributeLatentCancerDeaths(lifetimeRisk, 120);
    const mortality240 = distributeLatentCancerDeaths(lifetimeRisk, 240);

    expect(mortality180).toBeGreaterThan(mortality120);
    expect(mortality180).toBeGreaterThan(mortality240);
  });

  test('returns 0 for zero lifetime risk', () => {
    expect(distributeLatentCancerDeaths(0, 180)).toBe(0);
  });

  test('returns finite values (no NaN/Infinity)', () => {
    for (let months = 24; months <= 480; months += 12) {
      const mortality = distributeLatentCancerDeaths(lifetimeRisk, months);
      expect(mortality).toBeFinite();
      expect(mortality).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('calculateEffectiveDose', () => {
  test('returns 0 for empty tissue doses', () => {
    const tissueDoses = new Map<string, number>();
    expect(calculateEffectiveDose(tissueDoses)).toBe(0);
  });

  test('calculates weighted sum using ICRP 103 tissue weights', () => {
    const tissueDoses = new Map<string, number>([
      ['bone-marrow', 1.0],  // wT = 0.12
      ['lung', 1.0],         // wT = 0.12
      ['liver', 1.0],        // wT = 0.04
    ]);

    const effectiveDose = calculateEffectiveDose(tissueDoses);
    expect(effectiveDose).toBeCloseTo(0.12 + 0.12 + 0.04, 5);
  });

  test('whole-body uniform exposure sums to 1.0 effective dose', () => {
    // If all tissues receive 1 Gy, effective dose = 1 Sv (weights sum to 1.0)
    const tissueDoses = new Map<string, number>([
      ['bone-marrow', 1.0],
      ['colon', 1.0],
      ['lung', 1.0],
      ['stomach', 1.0],
      ['breast', 1.0],
      ['remainder', 1.0],
      ['gonads', 1.0],
      ['bladder', 1.0],
      ['esophagus', 1.0],
      ['liver', 1.0],
      ['thyroid', 1.0],
      ['bone-surface', 1.0],
      ['brain', 1.0],
      ['salivary-glands', 1.0],
      ['skin', 1.0],
    ]);

    const effectiveDose = calculateEffectiveDose(tissueDoses);
    expect(effectiveDose).toBeCloseTo(1.0, 3);
  });

  test('ignores unknown tissues with warning', () => {
    const tissueDoses = new Map<string, number>([
      ['lung', 1.0],           // wT = 0.12
      ['unknown-organ', 5.0],  // Not in ICRP 103 (should be ignored)
    ]);

    const effectiveDose = calculateEffectiveDose(tissueDoses);
    expect(effectiveDose).toBeCloseTo(0.12, 5); // Only lung counted
  });

  test('returns finite values (no NaN/Infinity)', () => {
    const tissueDoses = new Map<string, number>([
      ['bone-marrow', 2.5],
      ['lung', 3.0],
      ['liver', 1.5],
    ]);

    const effectiveDose = calculateEffectiveDose(tissueDoses);
    expect(effectiveDose).toBeFinite();
    expect(effectiveDose).toBeGreaterThan(0);
  });
});
