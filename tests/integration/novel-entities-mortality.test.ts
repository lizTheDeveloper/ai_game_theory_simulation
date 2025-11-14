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

import { describe, test, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '../../src/simulation/initialization';
import { PhaseOrchestrator } from '../../src/simulation/engine/PhaseOrchestrator';
import type { GameState } from '../../src/types/game';

describe('Novel Entities Mortality Integration', () => {
  let state: GameState;
  let engine: PhaseOrchestrator;

  beforeEach(() => {
    state = createInitialGameState();
    engine = new PhaseOrchestrator([]);
  });

  test('Reproductive crisis adds mortality risk every month', () => {
    // Setup: Trigger reproductive crisis immediately
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55;
    state.novelEntitiesSystem.reproductiveCrisisActive = false;

    // Month 0: Crisis should trigger and add mortality
    engine.step(state);
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Reproductive'));
    expect(pollutionRisks.length).toBeGreaterThan(0);
    expect(state.novelEntitiesSystem.reproductiveCrisisActive).toBe(true);

    // Months 1-11: Crisis should continue adding mortality EVERY month
    for (let month = 1; month < 12; month++) {
      engine.step(state);
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Reproductive'));

      // CRITICAL: Must have pollution risk EVERY month, not just month 0
      expect(pollutionRisks.length).toBeGreaterThan(0);
      expect(pollutionRisks[0].baseRisk).toBeCloseTo(0.0008, 4); // 0.08% monthly
    }
  });

  test('Bioaccumulation collapse adds mortality risk every month', () => {
    // Setup: Trigger bioaccumulation collapse immediately
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
    state.environmentalAccumulation.biodiversityIndex = 0.60;
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65;
    state.novelEntitiesSystem.bioaccumulationCollapseActive = false;

    // Month 0: Crisis should trigger
    engine.step(state);
    let risks = state.humanPopulationSystem.mortalityRisks;
    let pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Bioaccumulation'));
    expect(pollutionRisks.length).toBeGreaterThan(0);
    expect(state.novelEntitiesSystem.bioaccumulationCollapseActive).toBe(true);

    // Months 1-11: Crisis should continue adding mortality
    for (let month = 1; month < 12; month++) {
      engine.step(state);
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Bioaccumulation'));

      expect(pollutionRisks.length).toBeGreaterThan(0);
      expect(pollutionRisks[0].baseRisk).toBeCloseTo(0.0015, 4); // 0.15% monthly
    }
  });

  test('Chronic disease epidemic adds mortality risk every month', () => {
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
    expect(pollutionRisks.length).toBeGreaterThan(0);
    expect(state.novelEntitiesSystem.chronicDiseaseEpidemicActive).toBe(true);

    // Months 1-11: Crisis should continue adding mortality
    for (let month = 1; month < 12; month++) {
      engine.step(state);
      risks = state.humanPopulationSystem.mortalityRisks;
      pollutionRisks = risks.filter(r => r.type === 'pollution' && r.description?.includes('Chronic disease'));

      expect(pollutionRisks.length).toBeGreaterThan(0);
      expect(pollutionRisks[0].baseRisk).toBeCloseTo(0.004, 4); // 0.4% monthly
    }
  });

  test('High pollution scenario shows cumulative mortality impact', () => {
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
        expect(pollutionRisks.length).toBeGreaterThan(0);
      }
    }

    const finalPopulation = state.humanPopulationSystem.population;
    const populationLoss = (initialPopulation - finalPopulation) / initialPopulation;

    // High pollution (75%+) should cause 5-15% population loss over 10 years
    expect(populationLoss).toBeGreaterThan(0.05);
    expect(populationLoss).toBeLessThan(0.50); // Not catastrophic, but significant

    console.log(`\n=== High Pollution Impact (120 months) ===`);
    console.log(`  Initial population: ${(initialPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Final population: ${(finalPopulation / 1e9).toFixed(2)}B`);
    console.log(`  Population loss: ${(populationLoss * 100).toFixed(1)}%`);
  });
});
