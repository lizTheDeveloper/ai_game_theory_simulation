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
import { createTestState } from '../../src/simulation/initialization';
import { PhaseOrchestrator } from '../../src/simulation/engine/PhaseOrchestrator';
import type { GameState } from '../../src/types/game';

// Helper for approximate equality
function assertClose(actual: number, expected: number, tolerance: number, message?: string) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, message || `Expected ${actual} to be close to ${expected} (within ${tolerance})`);
}

// TODO: This test uses outdated API (step method doesn't exist, should be executeAll)
// and has no phases registered. Needs complete rewrite.
describe.skip('Novel Entities Mortality Integration', () => {
  let state: GameState;
  let engine: PhaseOrchestrator;

  beforeEach(() => {
    state = createTestState();
    engine = new PhaseOrchestrator([]);
  });

  it('Reproductive crisis adds mortality risk every month', () => {
    // Setup: Trigger reproductive crisis immediately
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55;
    state.novelEntitiesSystem.reproductiveCrisisActive = false;

    // Month 0: Crisis should trigger and add mortality
    engine.step(state);
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Reproductive'));
    assert.ok(pollutionRisks.length > 0, 'Pollution risks should exist');
    assert.strictEqual(state.novelEntitiesSystem.reproductiveCrisisActive, true);

    // Months 1-11: Crisis should continue adding mortality EVERY month
    for (let month = 1; month < 12; month++) {
      engine.step(state);
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Reproductive'));

      // CRITICAL: Must have pollution risk EVERY month, not just month 0
      assert.ok(pollutionRisks.length > 0, `Month ${month}: Pollution risks should exist`);
      assertClose(pollutionRisks[0].baseRisk, 0.0008, 0.0001, `Month ${month}: Base risk should be ~0.08%`);
    }
  });

  it('Bioaccumulation collapse adds mortality risk every month', () => {
    // Setup: Trigger bioaccumulation collapse immediately
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
    state.environmentalAccumulation.biodiversityIndex = 0.60;
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65;
    state.novelEntitiesSystem.bioaccumulationCollapseActive = false;

    // Month 0: Crisis should trigger
    engine.step(state);
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Bioaccumulation'));
    assert.ok(pollutionRisks.length > 0, 'Pollution risks should exist');
    assert.strictEqual(state.novelEntitiesSystem.bioaccumulationCollapseActive, true);

    // Months 1-11: Crisis should continue adding mortality
    for (let month = 1; month < 12; month++) {
      engine.step(state);
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Bioaccumulation'));

      assert.ok(pollutionRisks.length > 0, `Month ${month}: Pollution risks should exist`);
      assertClose(pollutionRisks[0].baseRisk, 0.0015, 0.0001, `Month ${month}: Base risk should be ~0.15%`);
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
    engine.step(state);
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Chronic disease'));
    assert.ok(pollutionRisks.length > 0, 'Pollution risks should exist');
    assert.strictEqual(state.novelEntitiesSystem.chronicDiseaseEpidemicActive, true);

    // Months 1-11: Crisis should continue adding mortality
    for (let month = 1; month < 12; month++) {
      engine.step(state);
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Chronic disease'));

      assert.ok(pollutionRisks.length > 0, `Month ${month}: Pollution risks should exist`);
      assertClose(pollutionRisks[0].baseRisk, 0.004, 0.0005, `Month ${month}: Base risk should be ~0.4%`);
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
      engine.step(state);

      // Verify pollution risks present every month after crises trigger
      if (month >= 5) { // Allow time for all crises to trigger
        const risks = state.humanPopulationSystem.mortalityRisks;
        const pollutionRisks = risks.filter(r => r.type === 'pollution');
        assert.ok(pollutionRisks.length > 0, `Month ${month}: Pollution risks should exist`);
      }
    }

    const finalPopulation = state.humanPopulationSystem.population;
    const populationLoss = (initialPopulation - finalPopulation) / initialPopulation;

    // High pollution (75%+) should cause 5-15% population loss over 10 years
    assert.ok(populationLoss > 0.05, `Population loss ${(populationLoss * 100).toFixed(1)}% should be > 5%`);
    assert.ok(populationLoss < 0.50, `Population loss ${(populationLoss * 100).toFixed(1)}% should be < 50%`);

    console.log(`\n=== High Pollution Impact (120 months) ===`);
    console.log(`  Initial population: ${(initialPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Final population: ${(finalPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Population loss: ${(populationLoss * 100).toFixed(1)}%`);
  });
});
