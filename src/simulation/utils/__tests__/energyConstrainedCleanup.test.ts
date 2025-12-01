/**
 * Energy-Constrained Cleanup Tests (Dec 1, 2025)
 *
 * Verifies concentration factor bug fix (Nov 30, 2025):
 * - No effectiveness >100% for any concentration gap
 * - Concentrated waste (gap ≤ 1) achieves full effectiveness
 * - Dilute waste (gap > 1) has reduced effectiveness
 *
 * Research backing: 24 peer-reviewed sources (2024-2025)
 * @see research/cleanup_effectiveness_concentration_scaling_20251201.md
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { applyEnergyConstrainedCleanup } from '../energyConstrainedCleanup';
import type { GameState } from '@/types/game';
import type { TechDefinition } from '@/simulation/techTree/comprehensiveTechTree';
import { mulberry32 } from '../math';

/**
 * Create a deterministic RNG from a string seed
 */
function createDeterministicRng(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return mulberry32(Math.abs(hash) || 1);
}

/**
 * Create minimal mock state
 */
function createMockState(): GameState {
  return {
    currentMonth: 120,
    resourceEconomy: {
      energy: {
        renewableCapacity: 100, // EJ
        totalDemand: 50,        // EJ
      },
    },
  } as GameState;
}

/**
 * Create mock tech with specified minimum concentration
 * @param minConc_ngPerL - Minimum concentration in ng/L
 */
function createMockTech(minConc_ngPerL: number): TechDefinition {
  return {
    id: `test-cleanup-${minConc_ngPerL}ng/L`,
    name: `Test Cleanup (${minConc_ngPerL} ng/L)`,
    tier: 2,
    energyRequirement: {
      kWhPerKg: 20.83, // 75 GJ/ton
    },
    minimumConcentration: {
      ngPerL: minConc_ngPerL,
    },
    effects: {
      novelEntitiesReduction: 0.5,
    },
    deploymentLevel: 1.0,
  } as any as TechDefinition;  // Mock for testing - only includes fields used by cleanup function
}

describe('Energy-Constrained Cleanup (Nov 30 Fix)', () => {
  describe('Regression Test: No >100% Effectiveness', () => {
    test('concentrated waste tech (≥500 mg/L) should never exceed 100% effectiveness', () => {
      const rng = createDeterministicRng('concentrated');
      const state = createMockState();

      // Tech designed for 1000 mg/L (concentrated industrial effluent)
      // Implementation maps this to concentrated waste scenario (1000 mg/L actual)
      const tech = createMockTech(1000 * 1e6);  // 1000 mg/L = 1e9 ng/L

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.ok(result.concentrationFactor <= 1.0,
        `Concentration factor ${result.concentrationFactor} exceeds 100%`);
      assert.ok(Number.isFinite(result.concentrationFactor),
        'Concentration factor should be finite');
    });

    test('groundwater tech (0.1-500 mg/L) should never exceed 100% effectiveness', () => {
      const rng = createDeterministicRng('groundwater');
      const state = createMockState();

      // Tech designed for 50 mg/L (groundwater remediation)
      // Implementation maps this to groundwater scenario (500 ng/L actual)
      const tech = createMockTech(50 * 1e6);  // 50 mg/L = 5e7 ng/L

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.ok(result.concentrationFactor <= 1.0,
        `Concentration factor ${result.concentrationFactor} exceeds 100%`);
    });

    test('surface water tech (<0.1 mg/L) should never exceed 100% effectiveness', () => {
      const rng = createDeterministicRng('surface');
      const state = createMockState();

      // Tech designed for 0.05 mg/L (surface water treatment)
      // Implementation maps this to surface water scenario (100 ng/L actual)
      const tech = createMockTech(0.05 * 1e6);  // 0.05 mg/L = 5e4 ng/L

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.ok(result.concentrationFactor <= 1.0,
        `Concentration factor ${result.concentrationFactor} exceeds 100%`);
    });
  });

  describe('Concentration Factor Behavior', () => {
    test('concentrated waste scenario: gap ≤ 1 → 100% effectiveness', () => {
      const rng = createDeterministicRng('concentrated-full');
      const state = createMockState();

      // Tech at 1000 mg/L maps to concentrated waste (1000 mg/L actual)
      // Gap = 1.0 → should get 100% effectiveness
      const tech = createMockTech(1000 * 1e6);

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.strictEqual(result.concentrationFactor, 1.0,
        'Concentrated waste at design concentration should be 100% effective');
    });

    test('dilute scenarios should have reduced effectiveness', () => {
      const rng = createDeterministicRng('dilute');
      const state = createMockState();

      // Tech at 50 mg/L maps to groundwater (500 ng/L = 0.0005 mg/L actual)
      // Gap = 50 / 0.0005 = 100,000 → should get <100% effectiveness
      const tech = createMockTech(50 * 1e6);

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.ok(result.concentrationFactor < 1.0,
        'Dilute waste should have reduced effectiveness (<100%)');
      assert.ok(result.concentrationFactor > 0,
        'Effectiveness should still be positive');
    });
  });

  describe('Thermodynamic Correctness', () => {
    test('less dilute waste should be easier to clean than more dilute', () => {
      const state = createMockState();

      // Concentrated: 1000 mg/L tech on 1000 mg/L waste (gap=1)
      const techConcentrated = createMockTech(1000 * 1e6);
      const rng1 = createDeterministicRng('thermo-1');
      const result1 = applyEnergyConstrainedCleanup(state, techConcentrated, 1.0, rng1);

      // Dilute: 50 mg/L tech on 0.0005 mg/L waste (gap=100,000)
      const techDilute = createMockTech(50 * 1e6);
      const rng2 = createDeterministicRng('thermo-2');
      const result2 = applyEnergyConstrainedCleanup(state, techDilute, 1.0, rng2);

      assert.ok(result1.concentrationFactor > result2.concentrationFactor,
        'Concentrated cleanup should be more effective than dilute cleanup');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large design concentrations', () => {
      const rng = createDeterministicRng('edge-large');
      const state = createMockState();

      const tech = createMockTech(10000 * 1e6);  // 10,000 mg/L

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.ok(Number.isFinite(result.concentrationFactor),
        'Should produce finite result for large concentrations');
      assert.ok(result.concentrationFactor <= 1.0,
        'Should not exceed 100% for large concentrations');
    });

    test('should handle very small design concentrations', () => {
      const rng = createDeterministicRng('edge-small');
      const state = createMockState();

      const tech = createMockTech(1);  // 1 ng/L (very dilute)

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      assert.ok(Number.isFinite(result.concentrationFactor),
        'Should produce finite result for small concentrations');
      assert.ok(result.concentrationFactor > 0,
        'Should produce positive result for small concentrations');
    });

    test('deterministic with same seed', () => {
      const state = createMockState();
      const tech = createMockTech(1000 * 1e6);

      const rng1 = createDeterministicRng('determinism');
      const result1 = applyEnergyConstrainedCleanup(state, tech, 1.0, rng1);

      const rng2 = createDeterministicRng('determinism');
      const result2 = applyEnergyConstrainedCleanup(state, tech, 1.0, rng2);

      assert.strictEqual(result1.concentrationFactor, result2.concentrationFactor,
        'Results should be identical with same seed');
    });
  });

  describe('Research-Backed Scenarios', () => {
    test('PFAS destruction at industrial source (1000 mg/L)', () => {
      const rng = createDeterministicRng('pfas-industrial');
      const state = createMockState();

      // EPA 2024: PFAS destruction demonstrated at >1000 mg/L
      // Industrial point sources match this concentration
      const tech = createMockTech(1000 * 1e6);

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      // Should achieve full effectiveness (gap ≤ 1)
      assert.strictEqual(result.concentrationFactor, 1.0,
        'PFAS destruction at industrial concentration should be 100% effective');
    });

    test('PFAS cleanup in contaminated groundwater (500 ng/L)', () => {
      const rng = createDeterministicRng('pfas-groundwater');
      const state = createMockState();

      // Fennell 2024: Environmental levels at ng/L scale
      // Tech designed for low mg/L must work on ng/L waste
      const tech = createMockTech(10 * 1e6);  // 10 mg/L design

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      // Gap = 10 mg/L / 0.0005 mg/L = 20,000
      // Effectiveness should be drastically reduced
      assert.ok(result.concentrationFactor < 0.01,
        'Groundwater cleanup should be <1% effective due to dilution');
    });

    test('PFAS in rainwater (55 pg/L Tibetan Plateau)', () => {
      const rng = createDeterministicRng('pfas-rainwater');
      const state = createMockState();

      // Cousins 2022: Even remote rainwater contains PFAS
      // Surface water tech (0.05 mg/L) applied to rainwater scenario
      const tech = createMockTech(0.05 * 1e6);  // 0.05 mg/L = 50,000 ng/L

      const result = applyEnergyConstrainedCleanup(state, tech, 1.0, rng);

      // gap = 50,000 ng/L / 100 ng/L (surface water) = 500
      // sqrt(1/500) ≈ 0.045 (4.5%)
      // Rainwater would be even worse but implementation caps at surface water
      assert.ok(result.concentrationFactor < 0.1,
        'Rainwater cleanup should be <10% effective');
    });
  });
});
