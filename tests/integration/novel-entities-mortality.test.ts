/**
 * Integration test: Novel entities pollution mortality
 *
 * CRITICAL-2 regression test: Verifies that pollution crises add mortality risks
 * EVERY MONTH (not just once when triggered).
 *
 * Bug: Lines 145-173, 187-213, 226-255 in src/simulation/novelEntities.ts
 * Crisis flags prevented re-adding mortality after first trigger.
 *
 * Fix: Separate crisis announcement (one-time) from mortality accumulation (ongoing).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '../../src/simulation/initialization';
import { SimulationEngine } from '../../src/simulation/engine';
import type { GameState } from '../../src/types/game';

// Simple RNG for test initialization
let testSeed = 42;
const testRng = () => {
  testSeed = (testSeed * 1664525 + 1013904223) % (2**32);
  return testSeed / (2**32);
};

// Helper for toBeCloseTo assertions
const assertCloseTo = (actual: number, expected: number, precision: number = 4) => {
  const diff = Math.abs(actual - expected);
  const tolerance = Math.pow(10, -precision) / 2;
  assert.ok(diff < tolerance, `Expected ${actual} to be close to ${expected} (within ${tolerance})`);
};

describe('Novel Entities Mortality Integration', () => {
  let state: GameState;
  let engine: SimulationEngine;

  beforeEach(() => {
    testSeed = 42; // Reset seed for determinism
    state = createDefaultInitialState(testRng);
    engine = new SimulationEngine({ seed: 42, maxMonths: 120 });
  });

  it('Reproductive crisis adds mortality risk every month', () => {
    // Setup: Crisis is ALREADY ACTIVE (we're testing ongoing mortality, not crisis detection)
    // The test's job is to verify mortality is added EVERY month while crisis is active
    state.novelEntitiesSystem.reproductiveCrisisActive = true;
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55; // Past 50% threshold
    const initialPopulation = state.humanPopulationSystem.population;

    // Month 0: First step with crisis active - should add mortality
    const result0 = engine.step(state);
    state = result0.state;

    // Crisis should remain active
    assert.strictEqual(state.novelEntitiesSystem.reproductiveCrisisActive, true, 'Crisis should remain active');

    // Population decreased (mortality was applied)
    const pop0 = state.humanPopulationSystem.population;
    assert.ok(pop0 < initialPopulation, 'Population should decrease after crisis mortality');

    // Months 1-11: Crisis should continue causing deaths EVERY month
    let previousPopulation = pop0;
    for (let month = 1; month < 12; month++) {
      const result = engine.step(state);
      state = result.state;
      const currentPopulation = state.humanPopulationSystem.population;

      // CRITICAL: Population should continue decreasing (ongoing mortality)
      assert.ok(currentPopulation < previousPopulation,
        `Month ${month}: Population should continue decreasing (${currentPopulation.toFixed(3)}B < ${previousPopulation.toFixed(3)}B)`);

      previousPopulation = currentPopulation;
    }
  });

  it('Bioaccumulation collapse adds mortality risk every month', () => {
    // Setup: Crisis is ALREADY ACTIVE (testing ongoing mortality, not crisis detection)
    state.novelEntitiesSystem.bioaccumulationCollapseActive = true;
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.80;
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65; // Above 0.60 threshold
    state.environmentalAccumulation.biodiversityIndex = 0.60;
    const initialPopulation = state.humanPopulationSystem.population;

    // Month 0: Crisis active - should add mortality
    const result = engine.step(state);
    state = result.state;
    assert.strictEqual(state.novelEntitiesSystem.bioaccumulationCollapseActive, true, 'Crisis should remain active');

    const pop0 = state.humanPopulationSystem.population;
    assert.ok(pop0 < initialPopulation, 'Population should decrease after crisis mortality');

    // Months 1-11: Crisis should continue causing deaths
    let previousPopulation = pop0;
    for (let month = 1; month < 12; month++) {
      const result = engine.step(state);
      state = result.state;
      const currentPopulation = state.humanPopulationSystem.population;

      assert.ok(currentPopulation < previousPopulation,
        `Month ${month}: Population should continue decreasing (${currentPopulation.toFixed(3)}B < ${previousPopulation.toFixed(3)}B)`);

      previousPopulation = currentPopulation;
    }
  });

  it('Chronic disease epidemic adds mortality risk every month', () => {
    // Setup: Crisis is ALREADY ACTIVE (testing ongoing mortality, not crisis detection)
    state.novelEntitiesSystem.chronicDiseaseEpidemicActive = true;
    state.novelEntitiesSystem.chronicDiseasePrevalence = 0.45; // Above 0.40 threshold
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.80;
    state.novelEntitiesSystem.exposureMonths = 720; // High exposure
    const initialPopulation = state.humanPopulationSystem.population;

    // Month 0: Crisis active - should add mortality
    const result = engine.step(state);
    state = result.state;
    assert.strictEqual(state.novelEntitiesSystem.chronicDiseaseEpidemicActive, true, 'Crisis should remain active');

    const pop0 = state.humanPopulationSystem.population;
    assert.ok(pop0 < initialPopulation, 'Population should decrease after crisis mortality');

    // Months 1-11: Crisis should continue causing deaths
    let previousPopulation = pop0;
    for (let month = 1; month < 12; month++) {
      const result = engine.step(state);
      state = result.state;
      const currentPopulation = state.humanPopulationSystem.population;

      assert.ok(currentPopulation < previousPopulation,
        `Month ${month}: Population should continue decreasing (${currentPopulation.toFixed(3)}B < ${previousPopulation.toFixed(3)}B)`);

      previousPopulation = currentPopulation;
    }
  });

  it('High pollution scenario shows cumulative mortality impact', () => {
    // Setup: All three crises ALREADY ACTIVE simultaneously
    state.novelEntitiesSystem.reproductiveCrisisActive = true;
    state.novelEntitiesSystem.bioaccumulationCollapseActive = true;
    state.novelEntitiesSystem.chronicDiseaseEpidemicActive = true;
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.60;
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.75;
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65;
    state.novelEntitiesSystem.endocrineDisruption = 0.50;
    state.novelEntitiesSystem.exposureMonths = 120; // 10 years
    state.novelEntitiesSystem.chronicDiseasePrevalence = 0.50;
    state.environmentalAccumulation.biodiversityIndex = 0.50;

    const initialPopulation = state.humanPopulationSystem.population;

    // Run 120 months (10 years)
    let previousPopulation = initialPopulation;
    for (let month = 0; month < 120; month++) {
      const result = engine.step(state);
      state = result.state;

      // Verify population continues decreasing (cumulative mortality)
      if (month >= 5) { // Allow time for mortality to compound
        const currentPopulation = state.humanPopulationSystem.population;
        assert.ok(currentPopulation < previousPopulation,
          `Month ${month}: Population should continue decreasing with multiple active crises`);
        previousPopulation = currentPopulation;
      }
    }

    const finalPopulation = state.humanPopulationSystem.population;
    const populationLoss = (initialPopulation - finalPopulation) / initialPopulation;

    // High pollution (75%+) with 3 active crises causes significant loss over 10 years
    // Multiple simultaneous crises compound - expect 5-70% loss (catastrophic but not extinction)
    assert.ok(populationLoss > 0.05, `Population loss ${(populationLoss * 100).toFixed(1)}% too low`);
    assert.ok(populationLoss < 0.70, `Population loss ${(populationLoss * 100).toFixed(1)}% too high (> 70%)`);

    console.log(`\n=== High Pollution Impact (120 months) ===`);
    console.log(`  Initial population: ${(initialPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Final population: ${(finalPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Population loss: ${(populationLoss * 100).toFixed(1)}%`);
  });
});
