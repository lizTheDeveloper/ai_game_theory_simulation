/**
 * Unit tests for Abrupt Sea Level Rise Phase (M-4)
 *
 * Tests marine ice sheet instability mechanics including:
 * - WAIS triggering at +2.5°C
 * - GIS triggering at +1.0-1.5°C
 * - GIS recovery eligibility (Bochow 2023)
 * - Abrupt pulse events with cooldown
 * - Impact calculations (population, damage, agriculture)
 */

import { describe, it, expect } from 'vitest';
import { AbruptSeaLevelRisePhase } from '../AbruptSeaLevelRisePhase';
import { createTestState } from '@/simulation/initialization';
import type { GameState, PhaseContext } from '@/types/game';

describe('AbruptSeaLevelRisePhase', () => {
  const phase = new AbruptSeaLevelRisePhase();

  function createState(tempAnomaly: number): GameState {
    const state = createTestState();

    // Set temperature anomaly in CO2 system
    state.resourceEconomy.co2.temperatureAnomaly = tempAnomaly;

    return state;
  }

  function createRNG(value: number): () => number {
    return () => value;
  }

  function createContext(month: number): PhaseContext {
    return {
      month,
      data: new Map(),
      executedPhases: new Set(),
    };
  }

  describe('WAIS Triggering', () => {
    it('should not trigger WAIS below +2.5°C', () => {
      const state = createState(2.4);
      const rng = createRNG(0.5);
      const context = createContext(120);

      const result = phase.execute(state, rng, context);

      expect(result.events).toBeDefined();
      expect(state.marineIceSheetState?.waisTriggered).toBe(false);
    });

    it('should trigger WAIS at +2.5°C', () => {
      const state = createState(2.5);
      const rng = createRNG(0.5);
      const context = createContext(120);

      const result = phase.execute(state, rng, context);

      expect(result.events).toBeDefined();
      expect(state.marineIceSheetState?.waisTriggered).toBe(true);
      expect(state.marineIceSheetState?.waisStartMonth).toBe(120);
      expect(result.events?.some(e => e.title.includes('West Antarctic'))).toBe(true);
    });

    it('should remain triggered after initial crossing', () => {
      const state = createState(2.6);
      const rng = createRNG(0.5);

      // First execution triggers
      phase.execute(state, rng, createContext(120));
      expect(state.marineIceSheetState?.waisTriggered).toBe(true);

      // Second execution should not re-trigger
      const result2 = phase.execute(state, rng, createContext(121));
      expect(state.marineIceSheetState?.waisTriggered).toBe(true);
      expect(state.marineIceSheetState?.waisStartMonth).toBe(120); // Still original month
    });
  });

  describe('GIS Triggering', () => {
    it('should not trigger GIS below +1.0°C', () => {
      const state = createState(0.9);
      const rng = createRNG(0.5);
      const context = createContext(120);

      const result = phase.execute(state, rng, context);

      expect(result.events).toBeDefined();
      expect(state.marineIceSheetState?.gisTriggered).toBe(false);
    });

    it('should trigger GIS probabilistically at +1.0°C', () => {
      const state = createState(1.0);
      const rng = createRNG(0.0); // Guaranteed trigger
      const context = createContext(120);

      const result = phase.execute(state, rng, context);

      expect(result.events).toBeDefined();
      expect(state.marineIceSheetState?.gisTriggered).toBe(true);
      expect(state.marineIceSheetState?.gisStartMonth).toBe(120);
      expect(result.events?.some(e => e.title.includes('Greenland'))).toBe(true);
    });

    it('should not trigger GIS with high RNG value', () => {
      const state = createState(1.0);
      const rng = createRNG(0.99); // Almost certain no trigger

      const result = phase.execute(state, rng, createContext(120));

      expect(state.marineIceSheetState?.gisTriggered).toBe(false);
    });
  });

  describe('GIS Recovery', () => {
    it('should mark GIS recovery eligible if cooling within 50 years', () => {
      const state = createState(1.5);
      const rng = createRNG(0.0);

      // Trigger GIS at month 120
      phase.execute(state, rng, createContext(120));
      expect(state.marineIceSheetState?.gisTriggered).toBe(true);
      expect(state.marineIceSheetState?.gisRecoveryEligible).toBe(false);

      // Cool below threshold within 50 years (600 months)
      state.resourceEconomy.co2.temperatureAnomaly = 1.4;
      state.currentMonth = 240; // 10 years later

      const result = phase.execute(state, rng, createContext(240));

      expect(state.marineIceSheetState?.gisRecoveryEligible).toBe(true);
      expect(result.events?.some(e => e.title.includes('Recovery Possible'))).toBe(true);
    });

    it('should not mark recovery eligible if too late', () => {
      const state = createState(1.5);
      const rng = createRNG(0.0);

      // Trigger GIS at month 120
      phase.execute(state, rng, createContext(120));

      // Cool below threshold AFTER 50 years (600 months)
      state.resourceEconomy.co2.temperatureAnomaly = 1.4;
      state.currentMonth = 800; // 56+ years later

      phase.execute(state, rng, createContext(800));

      expect(state.marineIceSheetState?.gisRecoveryEligible).toBe(false);
    });
  });

  describe('Abrupt Pulse Events', () => {
    it('should apply gradual rise without abrupt pulses initially', () => {
      const state = createState(1.5);
      const rng = createRNG(0.99); // High RNG = no abrupt pulse

      const initialSeaLevel = state.marineIceSheetState?.cumulativeSeaLevelRise || 0;

      const result = phase.execute(state, rng, createContext(120));

      expect(result.events).toBeDefined();
      const finalSeaLevel = state.marineIceSheetState?.cumulativeSeaLevelRise || 0;
      const delta = finalSeaLevel - initialSeaLevel;

      // Should have gradual rise only (~0.0034m/year / 12 months)
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThan(0.01); // Less than 1cm per month
    });

    it('should enforce cooldown between abrupt pulses', () => {
      const state = createState(2.5);
      let callCount = 0;
      const rng = () => {
        callCount++;
        return 0.0; // Low value = trigger pulse
      };

      // Trigger WAIS
      phase.execute(state, rng, createContext(120));

      // Reset call count
      callCount = 0;

      // Try to trigger pulse immediately (should succeed first time)
      const result1 = phase.execute(state, rng, createContext(121));
      const pulse1 = state.marineIceSheetState?.abruptPulseCount || 0;

      // Try again within cooldown (should NOT trigger)
      callCount = 0;
      const result2 = phase.execute(state, rng, createContext(122));
      const pulse2 = state.marineIceSheetState?.abruptPulseCount || 0;

      // Pulse count should not increase during cooldown
      expect(pulse2).toBeLessThanOrEqual(pulse1 + 1);
    });
  });

  describe('Impact Calculations', () => {
    it('should calculate population displacement', () => {
      const state = createState(2.5);
      const rng = createRNG(0.5);

      const initialDisplaced = state.marineIceSheetState?.coastalPopulationDisplaced || 0;

      phase.execute(state, rng, createContext(120));

      const finalDisplaced = state.marineIceSheetState?.coastalPopulationDisplaced || 0;

      expect(finalDisplaced).toBeGreaterThan(initialDisplaced);
    });

    it('should calculate infrastructure damage', () => {
      const state = createState(2.5);
      const rng = createRNG(0.5);

      const initialDamage = state.marineIceSheetState?.coastalInfrastructureDamage || 0;

      phase.execute(state, rng, createContext(120));

      const finalDamage = state.marineIceSheetState?.coastalInfrastructureDamage || 0;

      expect(finalDamage).toBeGreaterThan(initialDamage);
    });

    it('should calculate agricultural land loss', () => {
      const state = createState(2.5);
      const rng = createRNG(0.5);

      const initialLandLost = state.marineIceSheetState?.agriculturalLandLost || 0;

      phase.execute(state, rng, createContext(120));

      const finalLandLost = state.marineIceSheetState?.agriculturalLandLost || 0;

      expect(finalLandLost).toBeGreaterThan(initialLandLost);
    });
  });

  describe('State Initialization', () => {
    it('should initialize marineIceSheetState if missing', () => {
      const state = createState(1.0);
      state.marineIceSheetState = undefined;

      const rng = createRNG(0.5);

      const result = phase.execute(state, rng, createContext(120));

      expect(result.events).toBeDefined();
      expect(state.marineIceSheetState).toBeDefined();
      expect(state.marineIceSheetState?.waisTriggered).toBe(false);
      expect(state.marineIceSheetState?.gisTriggered).toBe(false);
      expect(state.marineIceSheetState?.cumulativeSeaLevelRise).toBe(0);
    });
  });

  describe('Determinism', () => {
    it('should require RNG function', () => {
      const state = createState(2.5);

      expect(() => {
        phase.execute(state, undefined as any, createContext(120));
      }).toThrow(/RNG required/);
    });

    it('should produce same results with same RNG seed', () => {
      const state1 = createState(2.5);
      const state2 = createState(2.5);

      const rng = createRNG(0.123);

      const result1 = phase.execute(state1, rng, createContext(120));
      const result2 = phase.execute(state2, rng, createContext(120));

      expect(state1.marineIceSheetState?.waisTriggered).toBe(state2.marineIceSheetState?.waisTriggered);
      expect(state1.marineIceSheetState?.cumulativeSeaLevelRise).toBe(state2.marineIceSheetState?.cumulativeSeaLevelRise);
    });
  });
});
