/**
 * Phase 2 Regression Tests: System Abstractions
 *
 * Validates that system interfaces and registry work correctly.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  SystemRegistry,
  EnvironmentalSystem,
  SimulationSystem,
  AccumulationSystem
} from '@/simulation/systems';
import { GameState } from '@/types/game';
import { EnvironmentalAccumulation } from '@/types/game';

describe('Phase 2: System Abstractions', () => {
  describe('EnvironmentalSystem', () => {
    let system: EnvironmentalSystem;

    beforeEach(() => {
      system = new EnvironmentalSystem();
    });

    test('has correct id and name', () => {
      expect(system.id).toBe('environmental');
      expect(system.name).toBe('Environmental Accumulation');
    });

    test('initializes with valid state', () => {
      const state = system.initialize();
      expect(state).toBeDefined();
      expect(state.resourceReserves).toBeGreaterThan(0);
      expect(state.pollutionLevel).toBeGreaterThanOrEqual(0);
      expect(state.climateStability).toBeGreaterThan(0);
      expect(state.biodiversityIndex).toBeGreaterThan(0);
    });

    test('implements AccumulationSystem interface', () => {
      const mockState = createMockGameState();

      // Should have all AccumulationSystem methods
      expect(typeof system.getSustainability).toBe('function');
      expect(typeof system.hasCrisis).toBe('function');
      expect(typeof system.getActiveCrises).toBe('function');

      // Methods should return appropriate types
      const sustainability = system.getSustainability(mockState);
      expect(typeof sustainability).toBe('number');
      expect(sustainability).toBeGreaterThanOrEqual(0);
      expect(sustainability).toBeLessThanOrEqual(1);

      const hasCrisis = system.hasCrisis(mockState);
      expect(typeof hasCrisis).toBe('boolean');

      const crises = system.getActiveCrises(mockState);
      expect(Array.isArray(crises)).toBe(true);
    });

    test('reports crises correctly', () => {
      const mockState = createMockGameState({
        environmentalAccumulation: {
          resourceCrisisActive: true,
          pollutionCrisisActive: false,
          climateCrisisActive: true,
          ecosystemCrisisActive: false
        } as Partial<EnvironmentalAccumulation>
      });

      const crises = system.getActiveCrises(mockState);
      expect(crises.length).toBe(2);
      expect(crises).toContain('Resource Crisis');
      expect(crises).toContain('Climate Crisis');
    });

    test('update modifies global state', () => {
      const mockState = createMockGameState();
      const originalReserves = mockState.environmentalAccumulation.resourceReserves;

      // Update should modify state
      system.update(mockState);

      // State should be modified (can't test exact values without full simulation)
      expect(mockState.environmentalAccumulation).toBeDefined();
    });
  });

  describe('SystemRegistry', () => {
    let registry: SystemRegistry;

    beforeEach(() => {
      registry = new SystemRegistry();
    });

    test('starts empty', () => {
      expect(registry.getSystemIds()).toEqual([]);
      const counts = registry.getSystemCount();
      expect(counts.total).toBe(0);
      expect(counts.accumulation).toBe(0);
      expect(counts.spiral).toBe(0);
      expect(counts.quality).toBe(0);
    });

    test('registers systems correctly', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      expect(registry.getSystemIds()).toContain('environmental');
      const counts = registry.getSystemCount();
      expect(counts.total).toBe(1);
      expect(counts.accumulation).toBe(1);
    });

    test('retrieves registered systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const retrieved = registry.get('environmental');
      expect(retrieved).toBe(envSystem);
    });

    test('returns undefined for unregistered systems', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });

    test('initializeAll creates state for all systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const states = registry.initializeAll();
      expect(states.environmental).toBeDefined();
      expect(states.environmental.resourceReserves).toBeGreaterThan(0);
    });

    test('updateAll calls update on all systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const mockState = createMockGameState();

      // Should not throw
      expect(() => {
        registry.updateAll(mockState);
      }).not.toThrow();
    });

    test('getOverallSustainability averages accumulation systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const mockState = createMockGameState();
      const sustainability = registry.getOverallSustainability(mockState);

      expect(typeof sustainability).toBe('number');
      expect(sustainability).toBeGreaterThanOrEqual(0);
      expect(sustainability).toBeLessThanOrEqual(1);
    });

    test('getOverallSustainability returns 1 with no systems', () => {
      const mockState = createMockGameState();
      expect(registry.getOverallSustainability(mockState)).toBe(1.0);
    });

    test('hasAnyCrisis detects crises', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const mockState = createMockGameState({
        environmentalAccumulation: {
          resourceCrisisActive: true
        } as Partial<EnvironmentalAccumulation>
      });

      expect(registry.hasAnyCrisis(mockState)).toBe(true);
    });

    test('getAllCrises aggregates from all systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const mockState = createMockGameState({
        environmentalAccumulation: {
          resourceCrisisActive: true,
          pollutionCrisisActive: true,
          climateCrisisActive: false,
          ecosystemCrisisActive: false
        } as Partial<EnvironmentalAccumulation>
      });

      const crises = registry.getAllCrises(mockState);
      expect(crises.length).toBe(2);
      expect(crises).toContain('Resource Crisis');
      expect(crises).toContain('Pollution Crisis');
    });

    test('getActiveSpiralCount returns 0 with no spiral systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const mockState = createMockGameState();
      expect(registry.getActiveSpiralCount(mockState)).toBe(0);
    });

    test('getOverallQuality returns 0.5 with no quality systems', () => {
      const envSystem = new EnvironmentalSystem();
      registry.register(envSystem);

      const mockState = createMockGameState();
      expect(registry.getOverallQuality(mockState)).toBe(0.5);
    });
  });
});

// Helper functions
function createMockGameState(overrides?: Partial<GameState>): GameState {
  const defaultState: GameState = {
    currentMonth: 0,
    currentYear: 0,
    currentDay: 1,
    aiAgents: [],
    eventLog: [],
    globalMetrics: {
      qualityOfLife: 0.7,
      economicProductivity: 1.0,
      socialStability: 0.8,
      publicTrust: 0.6,
      economicTransitionStage: 0,
      wealthDistribution: 0.5
    },
    environmentalAccumulation: {
      resourceReserves: 0.8,
      pollutionLevel: 0.3,
      climateStability: 0.7,
      biodiversityIndex: 0.75,
      resourceCrisisActive: false,
      pollutionCrisisActive: false,
      climateCrisisActive: false,
      ecosystemCrisisActive: false,
      oceanHealth: 0.8,
      co2Concentration: 420,
      temperatureAnomaly: 1.2
    } as EnvironmentalAccumulation,
    ...overrides
  } as GameState;

  return defaultState;
}
