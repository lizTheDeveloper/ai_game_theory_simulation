/**
 * Unit tests for Marine Ice Sheet Instability (MICI) system
 *
 * Tests:
 * - MICI trigger conditions (temperature, ocean warming, buttressing loss)
 * - Abrupt pulse generation and magnitude
 * - Coastal impact calculations
 * - Integration with existing tipping points (no double-counting)
 * - Determinism (same seed → same results)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { GameState } from '@/types/game';
import { initializeGame } from '@/simulation/initialization';
import {
  checkMICIConditions,
  triggerMICIAbruptMode,
  checkAbruptPulse,
  executeAbruptPulse,
  updateGradualSeaLevelRise,
  updateCoastalImpacts,
  updateMICI
} from '@/simulation/marineIceSheetInstability';
import { createSeededRNG } from '@/simulation/utils/rng';

describe('Marine Ice Sheet Instability', () => {
  let state: GameState;
  let rng: () => number;

  beforeEach(() => {
    state = initializeGame();
    rng = createSeededRNG(12345);
  });

  describe('MICI Trigger Conditions', () => {
    it('should NOT trigger MICI if tipping point not crossed', () => {
      // WAIS not triggered
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = false;

      state.globalMetrics.temperature = 2.0; // Above threshold

      expect(checkMICIConditions(state, 'wais')).toBe(false);
    });

    it('should NOT trigger MICI if temperature too low', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.monthsSinceTrigger = 200;

      state.globalMetrics.temperature = 1.0; // Below 1.25°C threshold

      expect(checkMICIConditions(state, 'wais')).toBe(false);
    });

    it('should NOT trigger MICI if buttressing not yet lost', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.monthsSinceTrigger = 60; // Only 5 years, need 10

      state.globalMetrics.temperature = 2.0;

      expect(checkMICIConditions(state, 'wais')).toBe(false);
    });

    it('should trigger MICI when all conditions met', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.monthsSinceTrigger = 150; // 12.5 years

      state.globalMetrics.temperature = 1.5; // Above 1.25°C

      expect(checkMICIConditions(state, 'wais')).toBe(true);
    });

    it('should NOT trigger MICI if already in abrupt mode', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.monthsSinceTrigger = 150;
      wais.abruptMode = true;

      state.globalMetrics.temperature = 1.5;

      expect(checkMICIConditions(state, 'wais')).toBe(false);
    });
  });

  describe('Abrupt Mode Activation', () => {
    it('should set abruptMode flag and initialize SLR accumulator', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;

      triggerMICIAbruptMode(state, 'wais');

      expect(wais.abruptMode).toBe(true);
      expect(wais.accumulatedAbruptSLR).toBe(0);
    });
  });

  describe('Abrupt Pulse Probability', () => {
    it('should NOT trigger pulse if not in abrupt mode', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = false;

      expect(checkAbruptPulse(state, 'wais', rng)).toBe(false);
    });

    it('should NOT trigger pulse if max contribution reached', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;
      wais.accumulatedAbruptSLR = 3.5; // Max for WAIS

      expect(checkAbruptPulse(state, 'wais', rng)).toBe(false);
    });

    it('should have low probability (<10% per decade base)', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;
      wais.accumulatedAbruptSLR = 0;

      state.globalMetrics.temperature = 2.0; // No extreme warming

      // Run 1000 trials, should trigger ~4 times (0.05 / 120 months * 1000 ≈ 0.4 expected)
      let triggerCount = 0;
      for (let i = 0; i < 1000; i++) {
        const testRng = createSeededRNG(i);
        if (checkAbruptPulse(state, 'wais', testRng)) {
          triggerCount++;
        }
      }

      // Should be roughly 0.4 ± a few (very low probability)
      expect(triggerCount).toBeLessThan(10); // Less than 1% probability
    });
  });

  describe('Abrupt Pulse Execution', () => {
    it('should generate pulse magnitude in 0.5-1.5m range', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;
      wais.accumulatedAbruptSLR = 0;

      executeAbruptPulse(state, 'wais', rng);

      const magnitude = wais.accumulatedAbruptSLR!;
      expect(magnitude).toBeGreaterThanOrEqual(0.5);
      expect(magnitude).toBeLessThanOrEqual(1.5);
    });

    it('should cap pulse at max contribution', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;
      wais.accumulatedAbruptSLR = 3.0; // Already 3m

      executeAbruptPulse(state, 'wais', rng);

      // Should cap at 3.5m max
      expect(wais.accumulatedAbruptSLR).toBeLessThanOrEqual(3.5);
      expect(wais.accumulatedAbruptSLR).toBeGreaterThan(3.0); // Did add something
    });

    it('should update global cumulative SLR', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;

      const initialSLR = state.tippingPointSystem.cumulativeSeaLevelRise;

      executeAbruptPulse(state, 'wais', rng);

      expect(state.tippingPointSystem.cumulativeSeaLevelRise).toBeGreaterThan(initialSLR);
    });

    it('should update coastal impacts after pulse', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;

      executeAbruptPulse(state, 'wais', rng);

      expect(state.tippingPointSystem.coastalPopulationDisplaced).toBeGreaterThan(0);
      expect(state.tippingPointSystem.coastalInfrastructureDamage).toBeGreaterThan(0);
    });
  });

  describe('Gradual Sea Level Rise', () => {
    it('should accumulate gradual SLR from triggered ice sheets', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.monthsSinceTrigger = 60; // 5 years
      wais.progress = 0.1; // 10% progressed

      const initialSLR = state.tippingPointSystem.cumulativeSeaLevelRise;

      updateGradualSeaLevelRise(state);

      expect(state.tippingPointSystem.cumulativeSeaLevelRise).toBeGreaterThan(initialSLR);
    });

    it('should NOT exceed max contribution per ice sheet', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.monthsSinceTrigger = 500000; // Very long time
      wais.progress = 0.99; // Nearly complete
      wais.accumulatedAbruptSLR = 1.0; // Already 1m from pulses

      // Run many updates
      for (let i = 0; i < 10000; i++) {
        updateGradualSeaLevelRise(state);
      }

      // Total shouldn't exceed 3.5m (WAIS max)
      const totalFromWAIS = wais.accumulatedAbruptSLR! + (wais.progress * 3.5);
      expect(totalFromWAIS).toBeLessThanOrEqual(3.5);
    });
  });

  describe('Coastal Impact Calculations', () => {
    it('should calculate displacement in 50-150M per meter range', () => {
      state.tippingPointSystem.cumulativeSeaLevelRise = 1.0;

      updateCoastalImpacts(state, rng);

      const displaced = state.tippingPointSystem.coastalPopulationDisplaced;
      expect(displaced).toBeGreaterThanOrEqual(50);
      expect(displaced).toBeLessThanOrEqual(150);
    });

    it('should scale infrastructure damage quadratically', () => {
      // Test with 1m and 2m SLR
      state.tippingPointSystem.cumulativeSeaLevelRise = 1.0;
      updateCoastalImpacts(state, rng);
      const damage1m = state.tippingPointSystem.coastalInfrastructureDamage;

      state.tippingPointSystem.cumulativeSeaLevelRise = 2.0;
      updateCoastalImpacts(state, rng);
      const damage2m = state.tippingPointSystem.coastalInfrastructureDamage;

      // Quadratic: 2x SLR should be >3x damage (linear=2x, quadratic adds more)
      expect(damage2m / damage1m).toBeGreaterThan(3);
    });

    it('should calculate agricultural land loss', () => {
      state.tippingPointSystem.cumulativeSeaLevelRise = 2.0;

      updateCoastalImpacts(state, rng);

      expect(state.tippingPointSystem.agriculturalLandLost).toBeGreaterThan(0);
    });
  });

  describe('Integration with Existing Tipping Points', () => {
    it('should enhance WAIS element, not duplicate it', () => {
      const waisElements = state.tippingPointSystem.elements.filter(e => e.id === 'wais');
      expect(waisElements).toHaveLength(1); // Only one WAIS element
    });

    it('should track abrupt and gradual contributions separately', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais.triggered = true;
      wais.abruptMode = true;
      wais.monthsSinceTrigger = 100;

      // Execute abrupt pulse
      executeAbruptPulse(state, 'wais', rng);
      const abruptContribution = wais.accumulatedAbruptSLR!;

      // Update gradual rise
      updateGradualSeaLevelRise(state);
      const totalSLR = state.tippingPointSystem.cumulativeSeaLevelRise;

      // Total should be sum of both
      expect(totalSLR).toBeGreaterThan(abruptContribution);
    });
  });

  describe('Determinism', () => {
    it('should produce same results with same seed', () => {
      const wais1 = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais1.triggered = true;
      wais1.abruptMode = true;

      const rng1 = createSeededRNG(99999);
      executeAbruptPulse(state, 'wais', rng1);
      const result1 = wais1.accumulatedAbruptSLR;

      // Reset
      const state2 = initializeGame();
      const wais2 = state2.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      wais2.triggered = true;
      wais2.abruptMode = true;

      const rng2 = createSeededRNG(99999); // Same seed
      executeAbruptPulse(state2, 'wais', rng2);
      const result2 = wais2.accumulatedAbruptSLR;

      expect(result1).toBe(result2);
    });
  });

  describe('Full MICI Update Integration', () => {
    it('should check both WAIS and Greenland', () => {
      const wais = state.tippingPointSystem.elements.find(e => e.id === 'wais')!;
      const greenland = state.tippingPointSystem.elements.find(e => e.id === 'greenland')!;

      wais.triggered = true;
      wais.monthsSinceTrigger = 150;
      greenland.triggered = true;
      greenland.monthsSinceTrigger = 150;

      state.globalMetrics.temperature = 2.0; // Above both thresholds

      updateMICI(state, rng);

      expect(wais.abruptMode).toBe(true);
      expect(greenland.abruptMode).toBe(true);
    });

    it('should require RNG function', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid RNG
        updateMICI(state, null);
      }).toThrow(/RNG required/);
    });
  });
});
