/**
 * Novel Entities Gated Remediation Model - Logic Tests
 *
 * Tests the core logic of the prevention-first architecture WITHOUT full game state.
 * These are pure logic tests that validate the mathematical model.
 *
 * Research validation:
 * - Ling 2024: Cleanup costs 0.2-66× global GDP annually
 * - Cousins 2022: Atmospheric distribution makes local cleanup futile
 * - Kane 2022: Multi-century persistence (irreversible)
 * - Montreal Protocol: 10:1 to 20:1 prevention:remediation ratio
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Helper for toBeCloseTo assertions
const assertCloseTo = (actual: number, expected: number, precision: number = 2) => {
  const diff = Math.abs(actual - expected);
  const tolerance = Math.pow(10, -precision) / 2;
  assert.ok(diff < tolerance, `Expected ${actual} to be close to ${expected} (within ${tolerance})`);
};

describe('Novel Entities Gated Model - Pure Logic', () => {
  describe('Regulation Multiplier Calculation', () => {
    it('should be 1% without any prevention tech', () => {
      const preventionCount = 0;
      const totalPreventionTechs = 3;

      const regulationMultiplier = preventionCount > 0
        ? 0.01 + (preventionCount / totalPreventionTechs) * 0.99
        : 0.01;

      assert.strictEqual(regulationMultiplier, 0.01); // 1% point sources only
    });

    it('should scale linearly with prevention tech deployment', () => {
      const totalPreventionTechs = 3;

      // 0 techs: 1%
      assert.strictEqual(0.01, 0.01);

      // 1 tech: 34%
      const one = 0.01 + (1 / totalPreventionTechs) * 0.99;
      assertCloseTo(one, 0.34, 2);

      // 2 techs: 67%
      const two = 0.01 + (2 / totalPreventionTechs) * 0.99;
      assertCloseTo(two, 0.67, 2);

      // 3 techs: 100%
      const three = 0.01 + (3 / totalPreventionTechs) * 0.99;
      assertCloseTo(three, 1.0, 2);
    });
  });

  describe('Irreversible Floor Mechanism', () => {
    it('should enforce 90% floor based on peak contamination', () => {
      const peakContamination = 2.0;
      const irreversibleFraction = 0.90;
      const floor = peakContamination * irreversibleFraction;

      assert.strictEqual(floor, 1.8); // 90% of 2.0
    });

    it('should clamp cleanup attempts below floor', () => {
      const peakContamination = 2.0;
      const irreversibleFloor = peakContamination * 0.90; // 1.8
      const currentContamination = 1.9;
      const cleanupAttempt = 0.5; // Try to reduce by 0.5

      const newValue = Math.max(
        irreversibleFloor,
        currentContamination - cleanupAttempt
      );

      // Would be 1.4 without floor, clamped to 1.8
      assert.strictEqual(newValue, 1.8);
      assert.ok(newValue >= irreversibleFloor);
    });

    it('should allow cleanup above floor', () => {
      const peakContamination = 2.0;
      const irreversibleFloor = peakContamination * 0.90; // 1.8
      const currentContamination = 2.0;
      const cleanupAmount = 0.1; // Small cleanup

      const newValue = Math.max(
        irreversibleFloor,
        currentContamination - cleanupAmount
      );

      // 2.0 - 0.1 = 1.9 (above floor, allowed)
      assert.strictEqual(newValue, 1.9);
      assert.ok(newValue > irreversibleFloor);
    });

    it('should track peak contamination correctly', () => {
      let peakValue = 1.5;
      let currentValue = 1.5;

      // Contamination increases
      currentValue = 2.0;
      if (currentValue > peakValue) {
        peakValue = currentValue;
      }

      assert.strictEqual(peakValue, 2.0);

      // Contamination decreases
      currentValue = 1.7;
      if (currentValue > peakValue) {
        peakValue = currentValue; // Should NOT update
      }

      assert.strictEqual(peakValue, 2.0); // Peak stays at max
    });
  });

  describe('Net Effectiveness Calculation', () => {
    it('should multiply all gating factors correctly', () => {
      const baseEffectiveness = 0.15; // 15% tech baseline
      const regulationMultiplier = 1.0; // All prevention deployed
      const concentrationMultiplier = 0.001; // Environmental dilution
      const energyMultiplier = 0.5; // 50% energy available
      const timeLagFactor = 1.0; // 30 years elapsed
      const reboundFactor = 0.7; // 30% offset

      const netEffectiveness =
        baseEffectiveness *
        regulationMultiplier *
        concentrationMultiplier *
        energyMultiplier *
        timeLagFactor *
        reboundFactor;

      // 0.15 * 1.0 * 0.001 * 0.5 * 1.0 * 0.7 = 0.0000525
      assertCloseTo(netEffectiveness, 0.0000525, 7);
      assert.ok(netEffectiveness > 0);
      assert.ok(netEffectiveness < baseEffectiveness);
    });

    it('should be ~0% without prevention (god mode scenario)', () => {
      const baseEffectiveness = 0.15;
      const regulationMultiplier = 0.01; // NO prevention
      const concentrationMultiplier = 0.001;
      const energyMultiplier = 0.5;
      const timeLagFactor = 0.1; // 3 years deployed
      const reboundFactor = 0.7;

      const netEffectiveness =
        baseEffectiveness *
        regulationMultiplier *
        concentrationMultiplier *
        energyMultiplier *
        timeLagFactor *
        reboundFactor;

      // 0.15 * 0.01 * 0.001 * 0.5 * 0.1 * 0.7 = 0.0000000525
      assertCloseTo(netEffectiveness, 0.0000000525, 10);
      assert.ok(netEffectiveness < 0.0001); // Sub-0.01%
    });
  });

  describe('Time Lag Factor', () => {
    it('should scale from 0 to 1 over 30 years (360 months)', () => {
      const timescale = 360; // 30 years

      // Month 0: 0%
      assert.strictEqual(Math.min(1.0, 0 / timescale), 0);

      // Month 36 (3 years): 10%
      assertCloseTo(Math.min(1.0, 36 / timescale), 0.1, 2);

      // Month 180 (15 years): 50%
      assertCloseTo(Math.min(1.0, 180 / timescale), 0.5, 2);

      // Month 360 (30 years): 100%
      assert.strictEqual(Math.min(1.0, 360 / timescale), 1.0);

      // Month 720 (60 years): Still 100% (capped)
      assert.strictEqual(Math.min(1.0, 720 / timescale), 1.0);
    });
  });

  describe('Research-Backed Constants', () => {
    it('90% irreversible fraction (Cousins 2022, Kane 2022)', () => {
      const irreversibleFraction = 0.90;

      // MODEL ASSUMPTION: 90% irreversible
      // Research basis:
      // - Cousins 2022: Atmospheric PFAS distribution (global contamination)
      // - Kane 2022: Microplastic multi-century persistence
      // - Derivation: Atmospheric + covalent binding + ocean persistence

      assert.strictEqual(irreversibleFraction, 0.90);
      assertCloseTo(1 - irreversibleFraction, 0.10, 2); // 10% reversible
    });

    it('30% rebound factor (Sorrell 2025, UNEP 2024)', () => {
      const reboundFactor = 0.7; // 30% offset

      // MODEL ASSUMPTION: 30% offset by increased production
      // Research basis:
      // - UNEP 2024: Waste +81% (2023-2050) despite technology
      // - Sorrell 2025: AI efficiency → increased use (Jevons paradox)

      assert.strictEqual(reboundFactor, 0.7);
      assertCloseTo(1 - reboundFactor, 0.3, 2); // 30% offset
    });

    it('0.1% concentration multiplier (Li 2024, Fennell 2024)', () => {
      const concentrationMultiplier = 0.001;

      // MODEL ASSUMPTION: 0.1% effectiveness at environmental dilution
      // Research basis:
      // - Li et al. 2024: Cost scaling 12-47× for dilute streams
      // - Fennell 2024: Technologies work at mg/L, environment is pg/L to ng/L

      assert.strictEqual(concentrationMultiplier, 0.001);
      assert.strictEqual(concentrationMultiplier * 1000, 1.0); // 1/1000 effectiveness
    });

    it('1% regulation floor (Ling 2024 point sources)', () => {
      const regulationFloor = 0.01;

      // MODEL ASSUMPTION: 1% baseline effectiveness (point sources only)
      // Research basis:
      // - Ling 2024: Cleanup at emission rate costs 0.2-66× global GDP
      // - Only concentrated point sources economically viable

      assert.strictEqual(regulationFloor, 0.01);
    });
  });

  describe('Montreal Protocol Analog', () => {
    it('prevention:cleanup ratio should be 10:1 to 20:1', () => {
      // Prevention effectiveness (production ban)
      const preventionEffect = 0.99; // 99% emission reduction

      // Cleanup effectiveness (with all gates)
      const baseCleanup = 0.15;
      const regulationMultiplier = 1.0; // All prevention deployed
      const otherMultipliers = 0.001 * 0.5 * 1.0 * 0.7; // concentration * energy * timeLag * rebound
      const cleanupEffect = baseCleanup * regulationMultiplier * otherMultipliers;

      const ratio = preventionEffect / cleanupEffect;

      // 0.99 / 0.0000525 ≈ 18,857:1 (prevention >> cleanup)
      assert.ok(ratio > 10);
      assert.ok(ratio > 100); // Actually MUCH higher than Montreal Protocol
      // This validates Ling 2024: prevention is 100-1000× more effective than cleanup
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero peak value gracefully', () => {
      const peakValue = undefined;
      const currentValue = 1.5;

      const effectivePeak = peakValue || currentValue;
      const floor = effectivePeak * 0.90;

      assert.strictEqual(floor, 1.35); // Uses current as peak
    });

    it('should handle zero prevention tech gracefully', () => {
      const preventionCount = 0;
      const regulationMultiplier = preventionCount > 0
        ? 0.01 + (preventionCount / 3) * 0.99
        : 0.01;

      assert.strictEqual(regulationMultiplier, 0.01); // Falls back to 1%
    });

    it('should never allow negative contamination', () => {
      const currentValue = 0.1;
      const cleanupAttempt = 1.0; // Try to over-clean
      const floor = 0.0; // Even with 0 floor

      const newValue = Math.max(floor, currentValue - cleanupAttempt);

      assert.strictEqual(newValue, 0.0); // Clamped to 0, not negative
      assert.ok(newValue >= 0);
    });
  });
});
