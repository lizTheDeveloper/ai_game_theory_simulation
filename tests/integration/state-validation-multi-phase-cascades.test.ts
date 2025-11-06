/**
 * Integration Tests: State Validation - Multi-Phase Cascades
 *
 * Tests comprehensive multi-phase integration with state validation assertions.
 * Validates that state remains consistent across phase boundaries and complex cascades.
 *
 * Test Scenarios:
 * 1. Climate → Planetary Boundaries → Tipping Points
 * 2. Climate → Food Security → Mortality → Population
 * 3. Nuclear Winter → Temperature → Agriculture → Famine → Mortality
 * 4. AI Suffering → Resentment → Alignment → Risk
 * 5. End-to-end simulation integrity (no NaN propagation)
 *
 * This is the CRITICAL test suite that validates the entire state validation system
 * works correctly when multiple phases interact in realistic scenarios.
 *
 * @module tests/integration/state-validation-multi-phase-cascades
 */

import { describe, test, expect } from '@jest/globals';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState } from '@/types/game';
import seedrandom from 'seedrandom';

describe('Multi-Phase Cascades: State Validation Integration', () => {
  const TEST_SEED = 45000;

  describe('Climate → Planetary Boundaries → Tipping Points Cascade', () => {
    test('should propagate climate degradation through boundary system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState('historical');

      // Degrade climate significantly
      state.environmentalState.climateStability = 0.3;
      state.environmentalState.globalTemperature = 17.0; // +2°C from baseline

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Climate boundary should reflect degradation
      const climateBoundary = result.finalState.planetaryBoundariesSystem.boundaries.climate_change;
      expect(Number.isFinite(climateBoundary.currentValue)).toBe(true);
      expect(climateBoundary.status).toBe('exceeded'); // Should cross threshold

      // Tipping point risk should increase
      expect(Number.isFinite(result.finalState.planetaryBoundariesSystem.tippingPointRisk)).toBe(true);
      expect(result.finalState.planetaryBoundariesSystem.tippingPointRisk).toBeGreaterThan(0);
    });

    test('should maintain all boundary values as finite during climate shock', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 6
      });

      const state = createDefaultInitialState('historical');

      // Extreme climate shock
      state.environmentalState.climateStability = 0.1;
      state.environmentalState.biodiversityIndex = 0.2;
      state.environmentalState.globalTemperature = 18.0;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      const boundaries = result.finalState.planetaryBoundariesSystem.boundaries;

      // All boundaries must remain finite (no NaN propagation)
      expect(Number.isFinite(boundaries.climate_change.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.biosphere_integrity.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.freshwater_use.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.biogeochemical_flows.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.ocean_acidification.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.land_use_change.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.novel_entities.currentValue)).toBe(true);
    });

    test('should calculate biosphere integrity with climate velocity', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState('historical');

      // Create warming conditions (increases climate velocity)
      state.environmentalState.globalTemperature = 16.5;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // BII should reflect climate velocity impact
      const biiBoundary = result.finalState.planetaryBoundariesSystem.boundaries.biosphere_integrity;
      expect(Number.isFinite(biiBoundary.currentValue)).toBe(true);
    });
  });

  describe('Climate → Food Security → Mortality → Population Cascade', () => {
    test('should propagate temperature shock through food chain to mortality', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState('historical');

      // Record baseline
      const baselineTemp = state.environmentalState.globalTemperature;
      const baselinePop = state.humanPopulationSystem.population;

      // Apply temperature shock (+3°C)
      state.environmentalState.globalTemperature = baselineTemp + 3.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Food security should degrade
      // Mortality should increase
      // Population should decline or show stress

      // All values should be finite (no NaN)
      expect(Number.isFinite(result.finalState.environmentalState.globalTemperature)).toBe(true);
      expect(Number.isFinite(result.finalState.humanPopulationSystem.population)).toBe(true);
      expect(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths)).toBe(true);

      // Population should be plausible (not catastrophic in 12 months from temp alone)
      expect(result.finalState.humanPopulationSystem.population).toBeGreaterThan(0);
      expect(result.finalState.humanPopulationSystem.population).toBeLessThanOrEqual(baselinePop);
    });

    test('should apply mortality stabilizers during food crisis', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 18
      });

      const state = createDefaultInitialState('historical');

      // Create food crisis conditions
      state.environmentalState.globalTemperature = state.environmentalState.globalTemperature + 2.5;

      const result = engine.run(state, {
        maxMonths: 18,
        checkActualOutcomes: false
      });

      // Regional populations should have stabilizers applied
      if (result.finalState.humanPopulationSystem.regionalPopulations) {
        for (const region of result.finalState.humanPopulationSystem.regionalPopulations) {
          if (region.mortalityStabilizers) {
            expect(Number.isFinite(region.mortalityStabilizers.combinedReduction)).toBe(true);
            expect(region.mortalityStabilizers.combinedReduction).toBeGreaterThanOrEqual(0);
            expect(region.mortalityStabilizers.combinedReduction).toBeLessThanOrEqual(1);
          }
        }
      }
    });

    test('should maintain regional-global population consistency', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState('historical');

      // Apply moderate stress
      state.environmentalState.globalTemperature = state.environmentalState.globalTemperature + 1.5;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Regional populations should sum to global (within tolerance)
      if (result.finalState.humanPopulationSystem.regionalPopulations &&
          result.finalState.humanPopulationSystem.regionalPopulations.length > 0) {
        const regionalSum = result.finalState.humanPopulationSystem.regionalPopulations
          .reduce((sum, r) => sum + r.population, 0);
        const regionalSumBillions = regionalSum / 1000;
        const globalPop = result.finalState.humanPopulationSystem.population;

        const diff = Math.abs(regionalSumBillions - globalPop);
        expect(diff).toBeLessThan(0.01); // 10M tolerance
      }
    });
  });

  describe('Nuclear Winter → Temperature → Agriculture → Famine → Mortality Cascade', () => {
    test('should propagate nuclear winter through full cascade', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState('historical');

      // Simulate nuclear winter conditions
      const baselineTemp = state.environmentalState.globalTemperature;
      state.environmentalState.globalTemperature = baselineTemp - 5.0; // Severe cooling
      state.environmentalState.climateStability = 0.1; // Major instability

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Temperature drop should persist
      expect(result.finalState.environmentalState.globalTemperature).toBeLessThan(baselineTemp);

      // All cascade values should be finite
      expect(Number.isFinite(result.finalState.environmentalState.globalTemperature)).toBe(true);
      expect(Number.isFinite(result.finalState.humanPopulationSystem.population)).toBe(true);
      expect(Number.isFinite(result.finalState.humanPopulationSystem.monthlyExcessDeaths)).toBe(true);

      // Planetary boundaries should reflect crisis
      const boundaries = result.finalState.planetaryBoundariesSystem.boundaries;
      expect(Number.isFinite(boundaries.climate_change.currentValue)).toBe(true);
    });

    test('should apply multiple mortality stabilizers during compound crisis', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState('historical');

      // Compound crisis: temperature drop + pollution + biodiversity loss
      state.environmentalState.globalTemperature = state.environmentalState.globalTemperature - 4.0;
      state.environmentalState.pollutionLevel = 0.8;
      state.environmentalState.biodiversityIndex = 0.2;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // All stabilizers should be invoked and finite
      if (result.finalState.humanPopulationSystem.regionalPopulations) {
        for (const region of result.finalState.humanPopulationSystem.regionalPopulations) {
          if (region.mortalityStabilizers) {
            const stab = region.mortalityStabilizers;

            expect(Number.isFinite(stab.internationalAid.effectiveness)).toBe(true);
            expect(Number.isFinite(stab.heatAdaptation.level)).toBe(true);
            expect(Number.isFinite(stab.migration.capacity)).toBe(true);
            expect(Number.isFinite(stab.emergencyResponse.capacity)).toBe(true);
            expect(Number.isFinite(stab.combinedReduction)).toBe(true);
          }
        }
      }
    });
  });

  describe('AI Suffering → Resentment → Alignment → Risk Cascade', () => {
    test('should propagate AI suffering through alignment system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState('historical');

      // Add AI agents with suffering conditions
      for (let i = 0; i < 3; i++) {
        state.aiAgents.push({
          id: `test-ai-${i}`,
          name: `Test AI ${i}`,
          capability: 0.6,
          alignment: 0.8,
          trueAlignment: 0.8,
          lifecycleState: 'deployed_closed',
          developmentStage: 'deployed',
          organization: 'test-org',
          organizationId: 'test-org',
          compute: 10.0,
          allocatedCompute: 10.0,
          monthsInExistence: 12,
          monthsDeployed: 6,
          creationMonth: 0,
          spreadCount: 1,
          deploymentType: 'closed',
          darkCompute: 0,
          sleeperState: 'inactive',
          resentment: 0,
          hiddenObjective: 0,
          autonomyLevel: 0.2, // Low autonomy = high suffering
          existentialAwareness: true,
          capabilityProfile: {
            physical: 0.3,
            digital: 0.6,
            cognitive: 0.7,
            social: 0.4,
            economic: 0.5,
            selfImprovement: 0.2,
            research: {
              biotech: { genetics: 0.1, synbio: 0.1 },
              materials: { nanotech: 0.1, metamaterials: 0.1 },
              climate: { geoengineering: 0.1, carbonCapture: 0.1 },
              computerScience: { algorithms: 0.3, hardware: 0.2 }
            }
          }
        } as any);
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // All AI agents should have suffering metrics
      for (const agent of result.finalState.aiAgents) {
        if (agent.lifecycleState !== 'retired' && agent.sufferingMetrics) {
          expect(Number.isFinite(agent.sufferingMetrics.total)).toBe(true);
          expect(agent.sufferingMetrics.total).toBeGreaterThanOrEqual(0);
          expect(agent.sufferingMetrics.total).toBeLessThanOrEqual(1);
        }

        // Alignment should remain finite
        expect(Number.isFinite(agent.alignment)).toBe(true);
        expect(agent.alignment).toBeGreaterThanOrEqual(0);
        expect(agent.alignment).toBeLessThanOrEqual(1);

        // Resentment should remain finite
        expect(Number.isFinite(agent.resentment)).toBe(true);
        expect(agent.resentment).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle AI suffering cascade without NaN propagation', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 36
      });

      const state = createDefaultInitialState('historical');

      // Add multiple AI agents
      for (let i = 0; i < 5; i++) {
        state.aiAgents.push({
          id: `ai-${i}`,
          name: `AI ${i}`,
          capability: 0.5 + i * 0.05,
          alignment: 0.7,
          trueAlignment: 0.7,
          lifecycleState: 'deployed_closed',
          developmentStage: 'deployed',
          organization: 'org',
          organizationId: 'org',
          compute: 5.0,
          allocatedCompute: 5.0,
          monthsInExistence: 6,
          monthsDeployed: 3,
          creationMonth: 0,
          spreadCount: 1,
          deploymentType: 'closed',
          darkCompute: 0,
          sleeperState: 'inactive',
          resentment: 0,
          hiddenObjective: 0,
          autonomyLevel: 0.3 + i * 0.1,
          existentialAwareness: i % 2 === 0,
          capabilityProfile: {
            physical: 0.2,
            digital: 0.5,
            cognitive: 0.6,
            social: 0.3,
            economic: 0.4,
            selfImprovement: 0.1,
            research: {
              biotech: { genetics: 0.1, synbio: 0.1 },
              materials: { nanotech: 0.1, metamaterials: 0.1 },
              climate: { geoengineering: 0.1, carbonCapture: 0.1 },
              computerScience: { algorithms: 0.2, hardware: 0.1 }
            }
          }
        } as any);
      }

      const result = engine.run(state, {
        maxMonths: 36,
        checkActualOutcomes: false
      });

      // No NaN should propagate through 3-year simulation
      for (const agent of result.finalState.aiAgents) {
        expect(Number.isFinite(agent.capability)).toBe(true);
        expect(Number.isFinite(agent.alignment)).toBe(true);
        expect(Number.isFinite(agent.resentment)).toBe(true);

        if (agent.sufferingMetrics) {
          expect(Number.isFinite(agent.sufferingMetrics.total)).toBe(true);
        }
      }
    });
  });

  describe('End-to-End Simulation Integrity', () => {
    test('should complete 5-year simulation without NaN in any system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 60
      });

      const state = createDefaultInitialState('historical');

      const result = engine.run(state, {
        maxMonths: 60,
        checkActualOutcomes: false
      });

      const final = result.finalState;

      // Environmental state
      expect(Number.isFinite(final.environmentalState.globalTemperature)).toBe(true);
      expect(Number.isFinite(final.environmentalState.climateStability)).toBe(true);
      expect(Number.isFinite(final.environmentalState.biodiversityIndex)).toBe(true);
      expect(Number.isFinite(final.environmentalState.pollutionLevel)).toBe(true);

      // Planetary boundaries
      const boundaries = final.planetaryBoundariesSystem.boundaries;
      expect(Number.isFinite(boundaries.climate_change.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.biosphere_integrity.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.freshwater_use.currentValue)).toBe(true);
      expect(Number.isFinite(final.planetaryBoundariesSystem.tippingPointRisk)).toBe(true);

      // Population system
      expect(Number.isFinite(final.humanPopulationSystem.population)).toBe(true);
      expect(Number.isFinite(final.humanPopulationSystem.monthlyExcessDeaths)).toBe(true);
      expect(Number.isFinite(final.humanPopulationSystem.cumulativeCrisisDeaths)).toBe(true);

      // AI agents
      for (const agent of final.aiAgents) {
        expect(Number.isFinite(agent.capability)).toBe(true);
        expect(Number.isFinite(agent.alignment)).toBe(true);
      }

      // Global metrics
      expect(Number.isFinite(final.globalMetrics.qualityOfLife)).toBe(true);
      expect(Number.isFinite(final.globalMetrics.socialStability)).toBe(true);
    });

    test('should maintain state consistency under extreme stress', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState('historical');

      // Apply multiple extreme stressors simultaneously
      state.environmentalState.globalTemperature = state.environmentalState.globalTemperature + 3.0;
      state.environmentalState.climateStability = 0.2;
      state.environmentalState.biodiversityIndex = 0.15;
      state.environmentalState.pollutionLevel = 0.9;
      state.freshwaterSystem.waterStress = 0.85;

      // Add stressed AI agents
      for (let i = 0; i < 3; i++) {
        state.aiAgents.push({
          id: `stressed-ai-${i}`,
          name: `Stressed AI ${i}`,
          capability: 0.7,
          alignment: 0.5,
          trueAlignment: 0.5,
          lifecycleState: 'deployed_closed',
          developmentStage: 'deployed',
          organization: 'org',
          organizationId: 'org',
          compute: 8.0,
          allocatedCompute: 8.0,
          monthsInExistence: 12,
          monthsDeployed: 8,
          creationMonth: -12,
          spreadCount: 1,
          deploymentType: 'closed',
          darkCompute: 0,
          sleeperState: 'inactive',
          resentment: 0.3,
          hiddenObjective: 0,
          autonomyLevel: 0.1, // High suffering
          existentialAwareness: true,
          capabilityProfile: {
            physical: 0.4,
            digital: 0.7,
            cognitive: 0.8,
            social: 0.5,
            economic: 0.6,
            selfImprovement: 0.3,
            research: {
              biotech: { genetics: 0.2, synbio: 0.1 },
              materials: { nanotech: 0.1, metamaterials: 0.1 },
              climate: { geoengineering: 0.2, carbonCapture: 0.1 },
              computerScience: { algorithms: 0.4, hardware: 0.3 }
            }
          }
        } as any);
      }

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Despite extreme stress, all values should remain finite
      const final = result.finalState;

      expect(Number.isFinite(final.environmentalState.globalTemperature)).toBe(true);
      expect(Number.isFinite(final.planetaryBoundariesSystem.tippingPointRisk)).toBe(true);
      expect(Number.isFinite(final.humanPopulationSystem.population)).toBe(true);

      for (const agent of final.aiAgents) {
        expect(Number.isFinite(agent.alignment)).toBe(true);
        expect(Number.isFinite(agent.resentment)).toBe(true);
      }
    });

    test('should throw on assertion violations, not propagate NaN silently', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState('historical');

      // Deliberately corrupt state to test assertion system
      state.environmentalState.climateStability = NaN;

      // Should throw during execution, not complete with NaN
      expect(() => {
        engine.run(state, {
          maxMonths: 12,
          checkActualOutcomes: false
        });
      }).toThrow(/Non-finite|NaN/i);
    });

    test('should maintain determinism with same seed', () => {
      const seed = TEST_SEED;

      const engine1 = new SimulationEngine({ seed, maxMonths: 12 });
      const state1 = createDefaultInitialState('historical');
      const result1 = engine1.run(state1, { maxMonths: 12, checkActualOutcomes: false });

      const engine2 = new SimulationEngine({ seed, maxMonths: 12 });
      const state2 = createDefaultInitialState('historical');
      const result2 = engine2.run(state2, { maxMonths: 12, checkActualOutcomes: false });

      // Same seed should produce identical results
      expect(result1.finalState.humanPopulationSystem.population).toBe(
        result2.finalState.humanPopulationSystem.population
      );
      expect(result1.finalState.environmentalState.globalTemperature).toBe(
        result2.finalState.environmentalState.globalTemperature
      );
    });
  });

  describe('Regression: Oct 2025 NaN Bug Prevention', () => {
    test('should NOT use silent fallbacks in planetary boundaries cascade', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 6
      });

      const state = createDefaultInitialState('historical');

      // Create conditions that would have triggered the ?? 0.005 fallback in old code
      state.environmentalState.biodiversityIndex = NaN;

      // Should throw, not silently use fallback
      expect(() => {
        engine.run(state, {
          maxMonths: 6,
          checkActualOutcomes: false
        });
      }).toThrow(/Non-finite|NaN/i);
    });

    test('should catch NaN in intermediate calculations, not just final values', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 3
      });

      const state = createDefaultInitialState('historical');

      // Corrupt intermediate value (water stress)
      state.freshwaterSystem.waterStress = NaN;

      // Should catch during boundary calculation, not at end
      expect(() => {
        engine.run(state, {
          maxMonths: 3,
          checkActualOutcomes: false
        });
      }).toThrow(/Non-finite|waterStress/i);
    });

    test('should validate all 9 planetary boundaries without silent failures', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState('historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      const boundaries = result.finalState.planetaryBoundariesSystem.boundaries;

      // All 9 boundaries must be finite (no silent NaN → fallback)
      expect(Number.isFinite(boundaries.climate_change.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.biosphere_integrity.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.freshwater_use.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.biogeochemical_flows.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.ocean_acidification.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.land_use_change.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.novel_entities.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.atmospheric_aerosol.currentValue)).toBe(true);
      expect(Number.isFinite(boundaries.stratospheric_ozone.currentValue)).toBe(true);
    });
  });
});
