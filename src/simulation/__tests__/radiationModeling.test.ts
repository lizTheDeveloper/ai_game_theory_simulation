/**
 * Unit tests for M-6 Enhanced Radiation Modeling
 *
 * Tests dose-response curves, tissue weighting, decay kinetics, and cancer risk.
 */

import {
  calculateCurrentDoseRate,
  calculateEffectiveLD50,
  calculateMortalityProbability,
  calculateEffectiveDose,
  calculateLifetimeExcessCancerRisk,
  initializeFalloutComposition,
  distributePopulationIntoCohorts
} from '../radiationModeling';
import type { OrganDoses } from '../../types/nuclearWinter';

describe('Enhanced Radiation Modeling', () => {
  describe('calculateCurrentDoseRate (7-10 decay rule)', () => {
    it('should decay dose rate over time following t^(-1.2)', () => {
      const initialDoseRate = 10.0;  // Gy/hour at t=1h

      // At t=1h, dose rate should be initial
      const rate1h = calculateCurrentDoseRate(initialDoseRate, 1);
      expect(rate1h).toBeCloseTo(10.0, 2);

      // At t=7h, dose rate should be ~10% of initial (7-10 rule)
      const rate7h = calculateCurrentDoseRate(initialDoseRate, 7);
      expect(rate7h).toBeCloseTo(1.0, 1);  // ~10% = 1.0 Gy/hr

      // At t=49h (~2 days), dose rate should be ~1% of initial
      const rate49h = calculateCurrentDoseRate(initialDoseRate, 49);
      expect(rate49h).toBeLessThan(0.2);  // <2% of initial
    });

    it('should handle different decay exponents', () => {
      const initialDoseRate = 10.0;
      const hours = 7;

      // Faster decay (exponent = 1.4)
      const fastDecay = calculateCurrentDoseRate(initialDoseRate, hours, 1.4);

      // Default decay (exponent = 1.2)
      const normalDecay = calculateCurrentDoseRate(initialDoseRate, hours, 1.2);

      // Slower decay (exponent = 1.0)
      const slowDecay = calculateCurrentDoseRate(initialDoseRate, hours, 1.0);

      // Higher exponent = faster decay = lower dose rate
      expect(fastDecay).toBeLessThan(normalDecay);
      expect(normalDecay).toBeLessThan(slowDecay);
    });

    it('should throw on invalid inputs', () => {
      // NaN input
      expect(() => calculateCurrentDoseRate(NaN, 7)).toThrow();

      // Negative hours
      expect(() => calculateCurrentDoseRate(10, -1)).toThrow();

      // Exponent out of range
      expect(() => calculateCurrentDoseRate(10, 7, 2.0)).toThrow();
    });
  });

  describe('calculateEffectiveLD50 (medical care and combined injury)', () => {
    it('should return baseline LD50 with no treatment', () => {
      const ld50 = calculateEffectiveLD50('none', false);
      expect(ld50).toBeCloseTo(3.5, 1);  // Default: 3.5 Gy
    });

    it('should increase LD50 with better medical care', () => {
      const none = calculateEffectiveLD50('none', false);
      const minimal = calculateEffectiveLD50('minimal', false);
      const supportive = calculateEffectiveLD50('supportive', false);
      const intensive = calculateEffectiveLD50('intensive', false);

      // Better care = higher LD50 = better survival
      expect(none).toBeLessThan(minimal);
      expect(minimal).toBeLessThan(supportive);
      expect(supportive).toBeLessThan(intensive);
      expect(intensive).toBeGreaterThan(7.0);  // >7 Gy with transplant
    });

    it('should reduce LD50 with combined injury', () => {
      const radiationOnly = calculateEffectiveLD50('none', false);
      const combined = calculateEffectiveLD50('none', true);

      // Combined injury (burns + trauma) reduces LD50 by 20%
      expect(combined).toBeCloseTo(radiationOnly * 0.8, 1);
    });

    it('should respect research bounds [2.0, 8.0] Gy', () => {
      // All scenarios should stay in plausible range
      const scenarios = [
        ['none', false],
        ['none', true],
        ['minimal', false],
        ['supportive', false],
        ['intensive', false]
      ] as const;

      scenarios.forEach(([care, injury]) => {
        const ld50 = calculateEffectiveLD50(care, injury);
        expect(ld50).toBeGreaterThanOrEqual(2.0);
        expect(ld50).toBeLessThanOrEqual(8.0);
      });
    });
  });

  describe('calculateMortalityProbability (sigmoid dose-response)', () => {
    it('should give ~50% mortality at LD50', () => {
      const ld50 = 3.5;
      const mortalityAtLD50 = calculateMortalityProbability(3.5, ld50);
      expect(mortalityAtLD50).toBeCloseTo(0.5, 1);  // 50% at LD50
    });

    it('should show dose-response curve shape', () => {
      const ld50 = 3.5;

      // Well below LD50: low mortality
      const low = calculateMortalityProbability(1.0, ld50);
      expect(low).toBeLessThan(0.05);  // <5%

      // Slightly below LD50: moderate mortality
      const moderate = calculateMortalityProbability(2.5, ld50);
      expect(moderate).toBeGreaterThan(0.1);
      expect(moderate).toBeLessThan(0.4);

      // At LD50: 50% mortality
      const atLD50 = calculateMortalityProbability(3.5, ld50);
      expect(atLD50).toBeCloseTo(0.5, 1);

      // Above LD50: high mortality
      const high = calculateMortalityProbability(5.0, ld50);
      expect(high).toBeGreaterThan(0.8);  // >80%

      // Well above LD50: near-certain mortality
      const lethal = calculateMortalityProbability(8.0, ld50);
      expect(lethal).toBeGreaterThan(0.99);  // >99%
    });

    it('should return probabilities in [0, 1]', () => {
      const ld50 = 3.5;
      const doses = [0, 0.5, 1.0, 2.0, 3.5, 5.0, 8.0, 15.0];

      doses.forEach(dose => {
        const prob = calculateMortalityProbability(dose, ld50);
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('calculateEffectiveDose (ICRP 103 tissue weighting)', () => {
    it('should weight organ doses correctly', () => {
      // Uniform 1 Gy to all organs
      const uniformDoses: OrganDoses = {
        boneMarrow: 1.0,
        colon: 1.0,
        lung: 1.0,
        stomach: 1.0,
        thyroid: 1.0,
        gonads: 1.0,
        remainderOrgans: 1.0
      };

      const effectiveDose = calculateEffectiveDose(uniformDoses);

      // Effective dose = sum of (organ dose × tissue weighting)
      // wT sum for these organs: 0.12 + 0.12 + 0.12 + 0.12 + 0.04 + 0.08 + 0.12 = 0.72
      expect(effectiveDose).toBeCloseTo(0.72, 2);
    });

    it('should prioritize high-wT organs', () => {
      // High dose to bone marrow (wT = 0.12)
      const boneMarrowDose: OrganDoses = {
        boneMarrow: 5.0,
        colon: 0,
        lung: 0,
        stomach: 0,
        thyroid: 0,
        gonads: 0,
        remainderOrgans: 0
      };

      // Same effective dose via thyroid (wT = 0.04) requires 3x higher dose
      const thyroidDose: OrganDoses = {
        boneMarrow: 0,
        colon: 0,
        lung: 0,
        stomach: 0,
        thyroid: 15.0,
        gonads: 0,
        remainderOrgans: 0
      };

      const boneMarrowEffective = calculateEffectiveDose(boneMarrowDose);
      const thyroidEffective = calculateEffectiveDose(thyroidDose);

      // Bone marrow: 5.0 × 0.12 = 0.6 Sv
      expect(boneMarrowEffective).toBeCloseTo(0.6, 2);

      // Thyroid: 15.0 × 0.04 = 0.6 Sv
      expect(thyroidEffective).toBeCloseTo(0.6, 2);

      // Same effective dose despite different organ doses
      expect(boneMarrowEffective).toBeCloseTo(thyroidEffective, 2);
    });
  });

  describe('calculateLifetimeExcessCancerRisk (BEIR VII with LNT controversy)', () => {
    it('should scale linearly with dose (LNT model)', () => {
      // BEIR VII: 5% mortality per Sv (acute), 2.5% per Sv (chronic with DREF)
      const dose1Sv = calculateLifetimeExcessCancerRisk(1.0, true);
      const dose2Sv = calculateLifetimeExcessCancerRisk(2.0, true);

      // Risk should scale linearly
      expect(dose2Sv).toBeCloseTo(dose1Sv * 2, 2);
    });

    it('should apply DREF for chronic exposure', () => {
      const dose = 1.0;  // 1 Sv

      const acuteRisk = calculateLifetimeExcessCancerRisk(dose, false);
      const chronicRisk = calculateLifetimeExcessCancerRisk(dose, true);

      // Chronic exposure has 2x lower risk (DREF = 2.0)
      expect(chronicRisk).toBeCloseTo(acuteRisk / 2, 2);
    });

    it('should give plausible risk values', () => {
      // 1 Sv chronic exposure
      const risk1Sv = calculateLifetimeExcessCancerRisk(1.0, true);

      // BEIR VII: 5% per Sv acute, 2.5% per Sv chronic
      expect(risk1Sv).toBeCloseTo(0.025, 3);  // 2.5%
    });

    it('should cap risk at 100%', () => {
      // Extremely high dose (100 Sv - impossible but test boundary)
      const extremeRisk = calculateLifetimeExcessCancerRisk(100, true);
      expect(extremeRisk).toBeLessThanOrEqual(1.0);  // Max 100%
    });
  });

  describe('initializeFalloutComposition (radionuclide activities)', () => {
    it('should scale activities with yield', () => {
      const smallYield = initializeFalloutComposition(0.1);  // 100 kT
      const largeYield = initializeFalloutComposition(1.0);  // 1 MT

      // Activities should scale linearly with yield (10x yield = 10x activity)
      expect(largeYield.iodine131Activity).toBeCloseTo(smallYield.iodine131Activity * 10, -14);
      expect(largeYield.cesium137Activity).toBeCloseTo(smallYield.cesium137Activity * 10, -14);
      expect(largeYield.strontium90Activity).toBeCloseTo(smallYield.strontium90Activity * 10, -14);
    });

    it('should initialize with research-backed half-lives', () => {
      const comp = initializeFalloutComposition(1.0);

      // I-131: 8.02 day physical half-life
      // Monthly decay rate: ln(2) / (8.02 / 30) ≈ 2.59/month
      expect(comp.iodine131DecayRate).toBeCloseTo(2.59, 1);

      // Cs-137: 70 day biological half-life (default)
      expect(comp.cesium137BiologicalHalfLife).toBe(70);

      // Sr-90: 18 year biological half-life
      expect(comp.strontium90BiologicalHalfLife).toBe(18 * 365);
    });
  });

  describe('distributePopulationIntoCohorts (dose bands)', () => {
    it('should bin population by dose level', () => {
      const totalPop = 1.0;  // 1 billion
      const doseRate = 5.0;  // 5 Gy/hr (high fallout)
      const hours = 10;

      const cohorts = distributePopulationIntoCohorts(totalPop, doseRate, hours);

      // Total population conserved
      const totalBinned = cohorts.sublethal + cohorts.moderate + cohorts.severe + cohorts.lethal;
      expect(totalBinned).toBeCloseTo(totalPop, 3);

      // Higher dose rate = more in severe/lethal cohorts
      expect(cohorts.lethal).toBeGreaterThan(0);
      expect(cohorts.severe).toBeGreaterThan(0);
    });

    it('should handle low dose scenarios', () => {
      const totalPop = 1.0;
      const lowDoseRate = 0.1;  // 0.1 Gy/hr (moderate fallout)
      const hours = 1;

      const cohorts = distributePopulationIntoCohorts(totalPop, lowDoseRate, hours);

      // Low dose = most in sublethal
      expect(cohorts.sublethal).toBeGreaterThan(cohorts.moderate);
      expect(cohorts.sublethal).toBeGreaterThan(cohorts.severe);
      expect(cohorts.sublethal).toBeGreaterThan(cohorts.lethal);
    });
  });

  describe('Edge cases and assertions', () => {
    it('should reject NaN inputs', () => {
      expect(() => calculateCurrentDoseRate(NaN, 7)).toThrow('NaN');
      expect(() => calculateMortalityProbability(NaN, 3.5)).toThrow('NaN');
      expect(() => calculateLifetimeExcessCancerRisk(NaN, true)).toThrow('NaN');
    });

    it('should reject out-of-range values', () => {
      // Negative dose
      expect(() => calculateMortalityProbability(-1, 3.5)).toThrow();

      // LD50 out of plausible range
      expect(() => calculateMortalityProbability(5, 15)).toThrow();

      // Decay exponent out of research range [1.0, 1.4]
      expect(() => calculateCurrentDoseRate(10, 7, 0.5)).toThrow();
      expect(() => calculateCurrentDoseRate(10, 7, 2.0)).toThrow();
    });

    it('should handle zero populations gracefully', () => {
      const cohorts = distributePopulationIntoCohorts(0, 5.0, 10);
      expect(cohorts.sublethal).toBe(0);
      expect(cohorts.moderate).toBe(0);
      expect(cohorts.severe).toBe(0);
      expect(cohorts.lethal).toBe(0);
    });
  });
});
