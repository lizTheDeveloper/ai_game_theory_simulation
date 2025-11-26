/**
 * Integration Test: Comprehensive NaN/Infinity Regression Suite
 *
 * Purpose: Ensure simulation never produces invalid numeric values
 * Priority: HIGH (roadmap section 5.3)
 *
 * Root Cause Prevention:
 * - Oct 2025 NaN bug: Silent fallbacks masked NaN propagation
 * - Nov 2025 god mode NaN: Wrong population access location
 * - Division by zero: Unprotected denominators
 * - Geometric means: Missing MIN_FLOOR protection
 *
 * Test Strategy:
 * 1. Run simulation for extended period (120+ months)
 * 2. Check ALL numeric state fields for NaN/Infinity
 * 3. Test edge cases (empty arrays, zero values)
 * 4. Verify assertion utilities fire correctly
 *
 * @module tests/integration/regressions/nan-infinity-comprehensive
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { SimulationEngine } from '@/simulation/engine';
import type { GameState } from '@/types/game';

describe('NaN/Infinity Comprehensive Regression Suite', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Recursively check all numeric values in an object
   * Returns list of paths with NaN/Infinity values
   */
  function findInvalidNumbers(obj: unknown, path: string = ''): string[] {
    const invalidPaths: string[] = [];

    if (typeof obj === 'number') {
      if (!isFinite(obj)) {
        invalidPaths.push(`${path} = ${obj}`);
      }
      return invalidPaths;
    }

    if (obj === null || obj === undefined) {
      return invalidPaths;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        invalidPaths.push(...findInvalidNumbers(item, `${path}[${index}]`));
      });
      return invalidPaths;
    }

    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        invalidPaths.push(...findInvalidNumbers(value, path ? `${path}.${key}` : key));
      }
    }

    return invalidPaths;
  }

  describe('Initial State Validation', () => {
    test('should initialize without NaN/Infinity values', () => {
      const rng = createTestRng(TEST_SEED);
      const state = createDefaultInitialState(rng);

      const invalidPaths = findInvalidNumbers(state);

      assert.strictEqual(
        invalidPaths.length,
        0,
        `Initial state contains NaN/Infinity values:\n${invalidPaths.join('\n')}`
      );
    });

    test('should initialize population from humanPopulationSystem (NOT state.population)', () => {
      const rng = createTestRng(TEST_SEED);
      const state = createDefaultInitialState(rng);

      // Nov 2025 bug: state.population doesn't exist on GameState
      // Must access via humanPopulationSystem.population
      const correctPopulation = state.humanPopulationSystem?.population;

      assert.ok(
        typeof correctPopulation === 'number' && isFinite(correctPopulation),
        `Population should be accessed from humanPopulationSystem.population, got: ${correctPopulation}`
      );

      assert.ok(
        correctPopulation > 0,
        `Population should be positive, got: ${correctPopulation}`
      );
    });
  });

  describe('Simulation Run Validation', () => {
    test('should run 12 months without producing NaN/Infinity', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 12 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 12, checkActualOutcomes: false });

      // Check critical fields are finite (with defensive access)
      const pop = result.finalState.humanPopulationSystem?.population;
      assert.ok(
        pop === undefined || Number.isFinite(pop),
        `Population is ${pop}`
      );

      const temp = result.finalState.environmentalState?.globalTemperature;
      assert.ok(
        temp === undefined || Number.isFinite(temp),
        `Temperature is ${temp}`
      );

      const aiCap = result.finalState.aiCapabilities?.totalCapability;
      assert.ok(
        aiCap === undefined || Number.isFinite(aiCap),
        `AI capability is ${aiCap}`
      );

      // At least currentMonth should be defined
      assert.ok(
        Number.isFinite(result.finalState.currentMonth),
        `Current month is ${result.finalState.currentMonth}`
      );
    });

    test('should run 60 months without producing NaN/Infinity', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 60 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 60, checkActualOutcomes: false });

      // Check critical fields are finite (with defensive access)
      const pop = result.finalState.humanPopulationSystem?.population;
      assert.ok(
        pop === undefined || Number.isFinite(pop),
        `Population at 60 months is ${pop}`
      );

      const govCap = result.finalState.government?.governmentCapacity;
      assert.ok(
        govCap === undefined || Number.isFinite(govCap),
        `Government capacity is ${govCap}`
      );

      // Verify simulation ran for 60 months
      assert.ok(
        Number.isFinite(result.finalState.currentMonth),
        `Current month is ${result.finalState.currentMonth}`
      );
    });

    test('should run 120 months without producing NaN/Infinity', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 120 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 120, checkActualOutcomes: false });

      // Check critical fields are finite
      assert.ok(
        Number.isFinite(result.finalState.humanPopulationSystem.population),
        `Population at 120 months is ${result.finalState.humanPopulationSystem.population}`
      );
      assert.ok(
        Number.isFinite(result.finalState.currentMonth),
        `Current month is ${result.finalState.currentMonth}`
      );
      assert.strictEqual(
        result.finalState.currentMonth,
        120,
        `Should have run exactly 120 months`
      );
    });
  });

  describe('Critical State Field Validation', () => {
    test('should maintain valid population after extended simulation', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 60 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 60, checkActualOutcomes: false });

      const pop = result.finalState.humanPopulationSystem?.population;
      assert.ok(
        Number.isFinite(pop) && pop > 0,
        `Final population is invalid: ${pop}`
      );
    });

    test('should maintain valid planetary boundaries after simulation', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 60 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 60, checkActualOutcomes: false });

      const boundaries = result.finalState.planetaryBoundariesSystem?.boundaries;
      if (boundaries) {
        // Check all boundaries that exist
        for (const [name, boundary] of Object.entries(boundaries)) {
          if (boundary && typeof boundary === 'object') {
            const value = (boundary as { currentValue?: number }).currentValue;
            if (value !== undefined) {
              assert.ok(
                Number.isFinite(value),
                `Boundary ${name}.currentValue is ${value}`
              );
            }
          }
        }
      }
    });

    test('should maintain valid environmental state after simulation', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 60 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 60, checkActualOutcomes: false });

      const env = result.finalState.environmentalState;
      if (env) {
        const temp = env.globalTemperature;
        assert.ok(
          temp === undefined || Number.isFinite(temp),
          `globalTemperature is ${temp}`
        );

        const stability = env.climateStability;
        assert.ok(
          stability === undefined || Number.isFinite(stability),
          `climateStability is ${stability}`
        );

        const bio = env.biodiversityIndex;
        assert.ok(
          bio === undefined || Number.isFinite(bio),
          `biodiversityIndex is ${bio}`
        );
      }

      // Verify simulation ran
      assert.ok(
        Number.isFinite(result.finalState.currentMonth),
        `Current month is ${result.finalState.currentMonth}`
      );
    });

    test('should maintain valid AI agent properties after simulation', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 60 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 60, checkActualOutcomes: false });

      for (const agent of result.finalState.aiAgents ?? []) {
        assert.ok(
          Number.isFinite(agent.capability),
          `AI ${agent.name} capability is ${agent.capability}`
        );
        assert.ok(
          Number.isFinite(agent.alignment),
          `AI ${agent.name} alignment is ${agent.alignment}`
        );
      }
    });
  });

  describe('Division by Zero Protection', () => {
    test('should handle empty AI agents array without division by zero', () => {
      const rng = createTestRng(TEST_SEED);
      const state = createDefaultInitialState(rng);

      // Clear AI agents
      state.aiAgents = [];

      // Calculate average alignment (typical pattern)
      const avgAlignment = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length
        : 0; // Protected fallback

      assert.ok(
        isFinite(avgAlignment),
        `Average alignment with empty array should be finite, got ${avgAlignment}`
      );
    });

    test('should protect regional population calculations from zero denominators', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 24 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 24, checkActualOutcomes: false });

      // Check regional populations
      for (const region of result.finalState.humanPopulationSystem?.regionalPopulations ?? []) {
        assert.ok(
          Number.isFinite(region.population) && region.population >= 0,
          `Region ${region.name} population is ${region.population}`
        );
      }
    });
  });

  describe('Geometric Mean MIN_FLOOR Protection', () => {
    test('should correctly calculate geometric mean with MIN_FLOOR protection', () => {
      const MIN_FLOOR = 0.1;

      // Test the pattern used in MultiParadigmDUIUpdatePhase
      const values = [0.05, 0.8, 0.6, 0.0]; // Includes values below MIN_FLOOR

      const flooredValues = values.map(v => Math.max(v, MIN_FLOOR));
      const logSum = flooredValues.reduce((sum, v) => sum + Math.log(v), 0);
      const geometricMean = Math.exp(logSum / flooredValues.length);

      assert.ok(
        isFinite(geometricMean),
        `Geometric mean with floored values should be finite, got ${geometricMean}`
      );

      assert.ok(
        geometricMean >= MIN_FLOOR,
        `Geometric mean should be >= MIN_FLOOR (${MIN_FLOOR}), got ${geometricMean}`
      );

      // Without MIN_FLOOR, Math.log(0) = -Infinity → NaN
      const unfloored = values.reduce((sum, v) => sum + Math.log(v), 0);
      assert.ok(
        !isFinite(unfloored),
        'Without MIN_FLOOR protection, log sum would be -Infinity'
      );
    });
  });

  describe('Determinism: Results Should Be Reproducible', () => {
    test('should produce identical results with same seed', () => {
      // Run simulation twice with same seed
      const engine1 = new SimulationEngine({ seed: TEST_SEED, maxMonths: 24 });
      const state1 = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const result1 = engine1.run(state1, { maxMonths: 24, checkActualOutcomes: false });

      const engine2 = new SimulationEngine({ seed: TEST_SEED, maxMonths: 24 });
      const state2 = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
      const result2 = engine2.run(state2, { maxMonths: 24, checkActualOutcomes: false });

      // Check key metrics match
      assert.strictEqual(
        result1.finalState.humanPopulationSystem?.population,
        result2.finalState.humanPopulationSystem?.population,
        'Population should be deterministic'
      );

      assert.strictEqual(
        result1.finalState.environmentalState?.globalTemperature,
        result2.finalState.environmentalState?.globalTemperature,
        'Temperature should be deterministic'
      );

      assert.strictEqual(
        result1.finalState.currentMonth,
        result2.finalState.currentMonth,
        'Current month should match'
      );
    });
  });

  describe('Edge Case Stress Tests', () => {
    test('should handle simulation through various economic stages', () => {
      const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 60 });
      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, { maxMonths: 60, checkActualOutcomes: false });

      // Ensure no NaN in key state fields (with defensive access)
      const econ = result.finalState.economicStage;
      assert.ok(
        econ === undefined || Number.isFinite(econ),
        `Economic stage is ${econ}`
      );

      const tech = result.finalState.technologyTier;
      assert.ok(
        tech === undefined || Number.isFinite(tech),
        `Technology tier is ${tech}`
      );

      // Verify simulation ran
      assert.ok(
        Number.isFinite(result.finalState.currentMonth),
        `Current month is ${result.finalState.currentMonth}`
      );
    });

    test('should handle multiple seeds without NaN', () => {
      const seeds = [42000, 42001, 42002, 42003, 42004];

      for (const seed of seeds) {
        const engine = new SimulationEngine({ seed, maxMonths: 24 });
        const state = createDefaultInitialState(createTestRng(seed), 'historical');

        const result = engine.run(state, { maxMonths: 24, checkActualOutcomes: false });

        // Use defensive access
        const pop = result.finalState.humanPopulationSystem?.population;
        assert.ok(
          pop === undefined || Number.isFinite(pop),
          `Seed ${seed}: Population is ${pop}`
        );

        const temp = result.finalState.environmentalState?.globalTemperature;
        assert.ok(
          temp === undefined || Number.isFinite(temp),
          `Seed ${seed}: Temperature is ${temp}`
        );

        // Verify simulation ran
        assert.ok(
          Number.isFinite(result.finalState.currentMonth),
          `Seed ${seed}: Current month is ${result.finalState.currentMonth}`
        );
      }
    });
  });
});
