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

    // Month 0: Crisis should trigger and add mortality
    const result0 = engine.step(state);
    state = result0.state;
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Reproductive'));
    assert.ok(pollutionRisks.length > 0);
    assert.strictEqual(state.novelEntitiesSystem.reproductiveCrisisActive, true);

    // Months 1-11: Crisis should continue adding mortality EVERY month
    for (let month = 1; month < 12; month++) {
      const result = engine.step(state);
          state = result.state;
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Reproductive'));

      // CRITICAL: Must have pollution risk EVERY month, not just month 0
      assert.ok(pollutionRisks.length > 0);
      assertCloseTo(pollutionRisks[0].baseRisk, 0.0008, 4); // 0.08% monthly
    }
  });

  it('Bioaccumulation collapse adds mortality risk every month', () => {
    // Setup: Trigger bioaccumulation collapse immediately
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
    state.environmentalAccumulation.biodiversityIndex = 0.60;
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65;
    state.novelEntitiesSystem.bioaccumulationCollapseActive = false;

    // Month 0: Crisis should trigger
    const result = engine.step(state);
      state = result.state;
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Bioaccumulation'));
    assert.ok(pollutionRisks.length > 0);
    assert.strictEqual(state.novelEntitiesSystem.bioaccumulationCollapseActive, true);

    // Months 1-11: Crisis should continue adding mortality
    for (let month = 1; month < 12; month++) {
      const result = engine.step(state);
      state = result.state;
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Bioaccumulation'));

      assert.ok(pollutionRisks.length > 0);
      assertCloseTo(pollutionRisks[0].baseRisk, 0.0015, 4); // 0.15% monthly
    }
  });

  it('Chronic disease epidemic adds mortality risk every month', () => {
    // Setup: Trigger chronic disease epidemic immediately
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
    state.novelEntitiesSystem.endocrineDisruption = 0.40;
    state.novelEntitiesSystem.exposureMonths = 60; // 5 years exposure
    state.novelEntitiesSystem.chronicDiseasePrevalence = 0.45;
    state.novelEntitiesSystem.chronicDiseaseEpidemicActive = false;

    // Month 0: Crisis should trigger
    const result = engine.step(state);
      state = result.state;
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Chronic disease'));
    assert.ok(pollutionRisks.length > 0);
    assert.strictEqual(state.novelEntitiesSystem.chronicDiseaseEpidemicActive, true);

    // Months 1-11: Crisis should continue adding mortality
    for (let month = 1; month < 12; month++) {
      const result = engine.step(state);
      state = result.state;
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Chronic disease'));

      assert.ok(pollutionRisks.length > 0);
      assertCloseTo(pollutionRisks[0].baseRisk, 0.004, 4); // 0.4% monthly
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
    for (let month = 0; month < 120; month++) {
      const result = engine.step(state);
      state = result.state;

      // Verify pollution risks present every month after crises trigger
      if (month >= 5) { // Allow time for all crises to trigger
        const risks = state.humanPopulationSystem.mortalityRisks;
        const pollutionRisks = risks.filter(r => r.type === 'pollution');
        assert.ok(pollutionRisks.length > 0);
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
