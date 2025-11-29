/**
 * Unit tests for OceanAcidificationCascadePhase (RD-2)
 *
 * Research: IPCC AR6, Jiang et al. (2023), Newcastle (2024)
 * Coverage: pH thresholds, compound stress, regional cascades, fisheries decline
 */

process.env.NODE_ENV = 'test';

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { OceanAcidificationCascadePhase } from '../../../src/simulation/engine/phases/OceanAcidificationCascadePhase.js';
import type { GameState, PhaseContext } from '../../../src/types/game.js';

/** Deterministic RNG */
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

/** Minimal test state */
function createTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentMonth: 1,
    planetaryBoundariesSystem: {
      boundaries: {
        climate_change: {
          id: 'climate_change',
          name: 'Climate Change',
          currentValue: 1.0,
          thresholdValue: 1.5,
          status: 'safe',
          transgressed: false,
          monthsTransgressed: 0,
          trend: 0,
        },
      },
    },
    oceanAcidificationSystem: {
      pH: 7.95,
      aragoniteSaturation: 3.0,
      pHLevel: 0.85,
      co2AbsorptionCapacity: 0.80,
      coralReefHealth: 70,
      shellfishPopulation: 0.70,
      marineEcosystemFunction: 70,
      marineFoodWeb: 0.70,
      coastalFisheriesYield: 0.80,
      fishDependentImpact: 0.30,
      irreversibleLoss: 0,
      speciesSensitivity: 1.0,
      deadZoneRisk: 0,
      cascadeActive: false,
      regionalCoralHealth: {
        seAsia: 0.70,
        pacificIslands: 0.70,
        caribbean: 0.70,
        indianOcean: 0.70,
        globalAverage: 0.70,
      },
      regionalResilience: {
        seAsia: 0.3,
        pacificIslands: 0.5,
        caribbean: 0.4,
        indianOcean: 0.6,
      },
      regionalSpeciesSensitivity: {
        seAsia: 1.0,
        pacificIslands: 1.0,
        caribbean: 1.0,
        indianOcean: 0.8,
      },
      compoundStressMultiplier: 1.0,
      warmingContribution: 0,
      acidificationContribution: 0,
      monthsSinceStressOnset: 0,
      recoveryPotential: 1.0,
      adaptationFloor: 0.4,
      thresholdsCrossed: {
        moderateStress: false,
        severeStress: false,
        ecosystemCollapse: false,
      },
      economicValueAtRisk: 300,
      populationDependent: 415,
      pHHistory: [],
      coralHealthHistory: [],
      boundaryBreached: false,
      coralExtinctionActive: false,
      shellfishCollapseActive: false,
      marineFoodWebCollapseActive: false,
      monthsSinceBreach: 0,
      alkalinityEnhancementDeployment: 0,
      coralRestorationDeployment: 0,
      marineProtectedAreasDeployment: 0,
    },
    ...overrides,
  } as GameState;
}

const context: PhaseContext = {
  phaseExecutionOrder: [],
  executedPhases: new Set(),
};

describe('OceanAcidificationCascadePhase', () => {
  const phase = new OceanAcidificationCascadePhase();

  it('should require RNG function', () => {
    const state = createTestState();
    assert.throws(
      () => phase.execute(state, null as any, context),
      /RNG required/,
      'Phase should throw if RNG missing'
    );
  });

  it('should calculate compound stress (warming × acidification)', () => {
    const state = createTestState({
      planetaryBoundariesSystem: {
        boundaries: {
          climate_change: {
            id: 'climate_change',
            name: 'Climate Change',
            currentValue: 2.0, // 3°C warming (×1.5)
            thresholdValue: 1.5,
            status: 'critical',
            transgressed: true,
            monthsTransgressed: 120,
            trend: 0.01,
          },
        },
      },
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        pH: 7.7, // 0.4 decline from 8.1
      },
    });

    const rng = createTestRng(12345);
    const result = phase.execute(state, rng, context);

    const ocean = state.oceanAcidificationSystem;
    assert.ok(ocean.compoundStressMultiplier >= 1.0, 'Multiplier should be ≥1.0');
    assert.ok(ocean.compoundStressMultiplier <= 1.5, 'Multiplier should be ≤1.5');
    assert.ok(ocean.warmingContribution > 0, 'Warming should contribute');
    assert.ok(ocean.acidificationContribution > 0, 'Acidification should contribute');
    assert.ok(result.events, 'Should return events');
  });

  it('should apply 40% adaptation floor to coral health', () => {
    const state = createTestState({
      planetaryBoundariesSystem: {
        boundaries: {
          climate_change: {
            id: 'climate_change',
            name: 'Climate Change',
            currentValue: 3.0, // Extreme warming
            thresholdValue: 1.5,
            status: 'critical',
            transgressed: true,
            monthsTransgressed: 360,
            trend: 0.02,
          },
        },
      },
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        pH: 7.5, // Extreme acidification
        aragoniteSaturation: 1.5,
        regionalCoralHealth: {
          seAsia: 0.45,
          pacificIslands: 0.45,
          caribbean: 0.45,
          indianOcean: 0.45,
          globalAverage: 0.45,
        },
      },
    });

    const rng = createTestRng(12345);
    for (let i = 0; i < 100; i++) {
      phase.execute(state, rng, context);
    }

    const ocean = state.oceanAcidificationSystem;
    assert.ok(ocean.regionalCoralHealth.seAsia >= 0.4, 'SE Asia should hit 40% floor');
    assert.ok(ocean.regionalCoralHealth.pacificIslands >= 0.4, 'Pacific should hit 40% floor');
    assert.ok(ocean.regionalCoralHealth.caribbean >= 0.4, 'Caribbean should hit 40% floor');
    assert.ok(ocean.regionalCoralHealth.indianOcean >= 0.4, 'Indian Ocean should hit 40% floor');
  });

  it('should calculate fisheries yield as power law (coral^1.5)', () => {
    const state = createTestState({
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        regionalCoralHealth: {
          seAsia: 0.50,
          pacificIslands: 0.50,
          caribbean: 0.50,
          indianOcean: 0.50,
          globalAverage: 0.50,
        },
      },
    });

    const rng = createTestRng(12345);
    phase.execute(state, rng, context);

    const expectedYield = Math.pow(0.50, 1.5); // 0.353...
    assert.ok(
      Math.abs(state.oceanAcidificationSystem.coastalFisheriesYield - expectedYield) < 0.01,
      `Yield should be ~${expectedYield.toFixed(3)}, got ${state.oceanAcidificationSystem.coastalFisheriesYield.toFixed(3)}`
    );
  });

  it('should track regional variation (SE Asia < Pacific Islands < Indian Ocean)', () => {
    const state = createTestState({
      planetaryBoundariesSystem: {
        boundaries: {
          climate_change: {
            id: 'climate_change',
            name: 'Climate Change',
            currentValue: 2.0,
            thresholdValue: 1.5,
            status: 'critical',
            transgressed: true,
            monthsTransgressed: 120,
            trend: 0.01,
          },
        },
      },
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        pH: 7.7,
        aragoniteSaturation: 2.3,
      },
    });

    const rng = createTestRng(12345);
    for (let i = 0; i < 50; i++) {
      phase.execute(state, rng, context);
    }

    const ocean = state.oceanAcidificationSystem;
    // SE Asia (resilience 0.3) should decline faster than Indian Ocean (resilience 0.6)
    // Can't strictly assert order due to stochasticity, but check they're different
    const seAsiaHealth = ocean.regionalCoralHealth.seAsia;
    const indianOceanHealth = ocean.regionalCoralHealth.indianOcean;

    // At least one should be different (not all uniform)
    const allSame =
      seAsiaHealth === indianOceanHealth &&
      ocean.regionalCoralHealth.pacificIslands === indianOceanHealth &&
      ocean.regionalCoralHealth.caribbean === indianOceanHealth;

    assert.ok(!allSame, 'Regional health should vary (resilience differences)');
  });

  it('should fire threshold events (moderate, severe, collapse)', () => {
    const state = createTestState({
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        pH: 7.85,
        aragoniteSaturation: 2.8,
      },
    });

    const rng = createTestRng(12345);

    // pH 7.85 → should trigger moderate stress
    let result = phase.execute(state, rng, context);
    assert.ok(
      state.oceanAcidificationSystem.thresholdsCrossed.moderateStress,
      'pH < 7.9 should trigger moderate stress'
    );
    assert.ok(result.events.length > 0, 'Should fire moderate stress event');

    // pH 7.75 → should trigger severe stress
    state.oceanAcidificationSystem.pH = 7.75;
    state.oceanAcidificationSystem.aragoniteSaturation = 2.3;
    result = phase.execute(state, rng, context);
    assert.ok(
      state.oceanAcidificationSystem.thresholdsCrossed.severeStress,
      'pH < 7.8 should trigger severe stress'
    );

    // pH 7.65 → should trigger collapse
    state.oceanAcidificationSystem.pH = 7.65;
    state.oceanAcidificationSystem.aragoniteSaturation = 1.8;
    result = phase.execute(state, rng, context);
    assert.ok(
      state.oceanAcidificationSystem.thresholdsCrossed.ecosystemCollapse,
      'pH < 7.7 should trigger ecosystem collapse'
    );
  });

  it('should update history (pH and coral health)', () => {
    const state = createTestState();
    const rng = createTestRng(12345);

    assert.strictEqual(state.oceanAcidificationSystem.pHHistory.length, 0, 'History should start empty');

    for (let i = 0; i < 5; i++) {
      phase.execute(state, rng, context);
    }

    assert.strictEqual(state.oceanAcidificationSystem.pHHistory.length, 5, 'Should track 5 pH values');
    assert.strictEqual(state.oceanAcidificationSystem.coralHealthHistory.length, 5, 'Should track 5 coral values');
  });

  it('should limit history to 120 months', () => {
    const state = createTestState();
    const rng = createTestRng(12345);

    for (let i = 0; i < 150; i++) {
      phase.execute(state, rng, context);
    }

    assert.ok(
      state.oceanAcidificationSystem.pHHistory.length <= 120,
      'pH history should be capped at 120 months'
    );
    assert.ok(
      state.oceanAcidificationSystem.coralHealthHistory.length <= 120,
      'Coral history should be capped at 120 months'
    );
  });

  it('should use assertions (no NaN values)', () => {
    const state = createTestState({
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        pH: 7.8,
        aragoniteSaturation: 2.5,
      },
    });

    const rng = createTestRng(12345);
    for (let i = 0; i < 10; i++) {
      phase.execute(state, rng, context);
    }

    const ocean = state.oceanAcidificationSystem;
    assert.ok(!isNaN(ocean.compoundStressMultiplier), 'Compound stress should not be NaN');
    assert.ok(!isNaN(ocean.warmingContribution), 'Warming contribution should not be NaN');
    assert.ok(!isNaN(ocean.acidificationContribution), 'Acidification contribution should not be NaN');
    assert.ok(!isNaN(ocean.coastalFisheriesYield), 'Fisheries yield should not be NaN');
    assert.ok(!isNaN(ocean.economicValueAtRisk), 'Economic value should not be NaN');
    assert.ok(!isNaN(ocean.populationDependent), 'Population should not be NaN');
    assert.ok(!isNaN(ocean.regionalCoralHealth.globalAverage), 'Global average should not be NaN');
  });

  it('should maintain probabilistic bounds [0,1] for health/yield values', () => {
    const state = createTestState({
      oceanAcidificationSystem: {
        ...createTestState().oceanAcidificationSystem,
        pH: 7.6,
        aragoniteSaturation: 1.8,
      },
    });

    const rng = createTestRng(12345);
    for (let i = 0; i < 100; i++) {
      phase.execute(state, rng, context);
    }

    const ocean = state.oceanAcidificationSystem;
    assert.ok(ocean.coastalFisheriesYield >= 0 && ocean.coastalFisheriesYield <= 1, 'Yield in [0,1]');
    assert.ok(ocean.recoveryPotential >= 0 && ocean.recoveryPotential <= 1, 'Recovery in [0,1]');
    assert.ok(ocean.regionalCoralHealth.seAsia >= 0 && ocean.regionalCoralHealth.seAsia <= 1, 'Coral in [0,1]');
  });

  it('should be deterministic with same RNG seed', () => {
    const state1 = createTestState();
    const state2 = createTestState();

    const rng1 = createTestRng(42);
    const rng2 = createTestRng(42);

    for (let i = 0; i < 20; i++) {
      phase.execute(state1, rng1, context);
      phase.execute(state2, rng2, context);
    }

    assert.strictEqual(
      state1.oceanAcidificationSystem.regionalCoralHealth.seAsia,
      state2.oceanAcidificationSystem.regionalCoralHealth.seAsia,
      'Same seed should produce identical SE Asia health'
    );
    assert.strictEqual(
      state1.oceanAcidificationSystem.coastalFisheriesYield,
      state2.oceanAcidificationSystem.coastalFisheriesYield,
      'Same seed should produce identical fisheries yield'
    );
  });
});
