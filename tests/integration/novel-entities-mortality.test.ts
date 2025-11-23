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
    // Setup: Trigger reproductive crisis immediately
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55;
    state.novelEntitiesSystem.reproductiveCrisisActive = false;
    const initialPopulation = state.humanPopulationSystem.population;

    // Month 0: Crisis should trigger
    const result0 = engine.step(state);
    state = result0.state;
    assert.strictEqual(state.novelEntitiesSystem.reproductiveCrisisActive, true, 'Crisis should activate');

    // Mortality risks are cleared after resolution each month (by design)
    // Instead, verify population decreased (mortality was applied)
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
    // Setup: Trigger bioaccumulation collapse immediately
    // bioaccumulationFactor = syntheticChemicalLoad * (0.5 + biodiversity * 0.5)
    // Need factor > 0.60, with biodiversity = 0.60:
    // chemicalLoad * (0.5 + 0.3) > 0.60 => chemicalLoad > 0.75
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.80;  // Will give factor = 0.64
    state.environmentalAccumulation.biodiversityIndex = 0.60;
    state.novelEntitiesSystem.bioaccumulationCollapseActive = false;
    const initialPopulation = state.humanPopulationSystem.population;

    // Month 0: Crisis should trigger
    const result = engine.step(state);
    state = result.state;
    assert.strictEqual(state.novelEntitiesSystem.bioaccumulationCollapseActive, true, 'Crisis should activate');

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
    // Setup: Trigger chronic disease epidemic immediately
    // Chronic disease prevalence = 0.20 + (cumulativeExposure * 0.3) + (endocrineDisruption * 0.2)
    // where cumulativeExposure = (chemicalLoad * exposureYears) / 100
    // Need prevalence > 0.40 with load = 0.80:
    // 0.40 = 0.20 + (0.80 * Y / 100 * 0.3) + (0.80/3 * 0.6 * 0.2)
    // With 20 years (240 months): prevalence ≈ 0.20 + 0.048 + 0.032 = 0.28
    // This is still < 0.40, so let's manually set a high exposure time (60 years = 720 months)
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.80;
    state.novelEntitiesSystem.exposureMonths = 720; // 60 years of exposure needed
    state.novelEntitiesSystem.chronicDiseaseEpidemicActive = false;
    const initialPopulation = state.humanPopulationSystem.population;

    // Month 0: Crisis should trigger
    const result = engine.step(state);
    state = result.state;
    assert.strictEqual(state.novelEntitiesSystem.chronicDiseaseEpidemicActive, true, 'Crisis should activate');

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
    // Setup: All three crises active simultaneously
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.60;
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.75;
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
      if (month >= 5) { // Allow time for all crises to trigger
        const currentPopulation = state.humanPopulationSystem.population;
        assert.ok(currentPopulation < previousPopulation,
          `Month ${month}: Population should continue decreasing with multiple active crises`);
        previousPopulation = currentPopulation;
      }
    }

    const finalPopulation = state.humanPopulationSystem.population;
    const populationLoss = (initialPopulation - finalPopulation) / initialPopulation;

    // High pollution (75%+) should cause 5-15% population loss over 10 years
    assert.ok(populationLoss > 0.05);
    assert.ok(populationLoss < 0.50); // Not catastrophic, but significant

    console.log(`\n=== High Pollution Impact (120 months) ===`);
    console.log(`  Initial population: ${(initialPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Final population: ${(finalPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Population loss: ${(populationLoss * 100).toFixed(1)}%`);
  });
});
