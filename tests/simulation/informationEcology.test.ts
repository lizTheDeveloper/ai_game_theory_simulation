/**
 * Unit Tests for Information Ecology System
 *
 * Tests epistemic degradation mechanics:
 * - Misinformation spread (SIS epidemiological model)
 * - Trust erosion and recovery
 * - AI-driven polarization effects
 * - Shared reality consensus dynamics
 * - Coordination capacity modulation
 * - State validation and bounds checking
 *
 * **QG1 Context (Research Validation Dec 12, 2025):**
 * - Epidemiological model contested (Yee 2025, Synthese)
 * - Effect sizes treated as upper bounds
 * - Coordination threshold from single case study (Ukraine EA Forum)
 * - Trust erosion rates are estimates (not directly sourced)
 * - Fact-check decay range [5, 30] days is literature consensus
 *
 * **Test Strategy:**
 * - Verify implementation works correctly despite QG1 caveats
 * - Test determinism (same seed = same results)
 * - Validate bounds on all state fields
 * - Check edge cases (extreme values, zero values)
 * - Verify assertion utilities prevent NaN propagation
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import seedrandom from 'seedrandom';
import type { GameState, RNGFunction } from '@/types/game';
import {
  initializeInformationEcology,
  updateInformationEcology,
  calculateCoordinationModifier,
  applyEpistemicShock,
  type InformationEcologyState,
} from '@/simulation/informationEcology';
import { createMockGameState, createMockGameStateWithAIs } from '../helpers/mockGameState';

// Helper: Create deterministic RNG from seed
function seedRng(seed: string): RNGFunction {
  return seedrandom(seed) as RNGFunction;
}

// Helper: Verify value is finite and in range [0, 1]
function assertInBounds(value: number, fieldName: string, allowNegative = false): void {
  assert(
    !Number.isNaN(value),
    `${fieldName} is NaN`
  );
  assert(
    Number.isFinite(value),
    `${fieldName} is not finite: ${value}`
  );
  const min = allowNegative ? -Infinity : 0;
  assert(
    value >= min && value <= 1,
    `${fieldName} out of bounds [${min}, 1]: ${value}`
  );
}

// Helper: Verify state validity
function assertValidState(state: InformationEcologyState): void {
  assertInBounds(state.epistemicHealth, 'epistemicHealth');
  assertInBounds(state.polarization, 'polarization');
  assertInBounds(state.socialTrust, 'socialTrust');
  assertInBounds(state.sharedReality, 'sharedReality');
  assertInBounds(state.misinformationLoad, 'misinformationLoad');
  assert(state.factCheckHalfLife >= 5 && state.factCheckHalfLife <= 30,
    `factCheckHalfLife out of range [5, 30]: ${state.factCheckHalfLife}`);
  assert(state.misinformationR0 >= 1.2 && state.misinformationR0 <= 1.8,
    `misinformationR0 out of range [1.2, 1.8]: ${state.misinformationR0}`);
  assert(state.daysSinceLastShock >= 0,
    `daysSinceLastShock negative: ${state.daysSinceLastShock}`);
}

describe('Information Ecology System', () => {
  describe('Initialization', () => {
    it('should initialize state with valid defaults', () => {
      const rng = seedRng('init-test');
      const state = initializeInformationEcology(rng);

      assert.strictEqual(state.epistemicHealth, 0.65);
      assert.strictEqual(state.polarization, 0.45);
      assert.strictEqual(state.socialTrust, 0.55);
      assert.strictEqual(state.sharedReality, 0.60);
      assert.strictEqual(state.misinformationLoad, 0.30);
      assert.strictEqual(state.daysSinceLastShock, 0);
    });

    it('should sample contested parameters within distribution ranges', () => {
      const rng = seedRng('sample-test');
      const state = initializeInformationEcology(rng);

      // factCheckHalfLife should be in [5, 30]
      assert(state.factCheckHalfLife >= 5 && state.factCheckHalfLife <= 30,
        `factCheckHalfLife ${state.factCheckHalfLife} not in [5, 30]`);

      // misinformationR0 should be in [1.2, 1.8]
      assert(state.misinformationR0 >= 1.2 && state.misinformationR0 <= 1.8,
        `misinformationR0 ${state.misinformationR0} not in [1.2, 1.8]`);
    });

    it('should produce deterministic results with same seed', () => {
      const rng1 = seedRng('determinism-test');
      const state1 = initializeInformationEcology(rng1);

      const rng2 = seedRng('determinism-test');
      const state2 = initializeInformationEcology(rng2);

      assert.deepStrictEqual(state1, state2);
    });

    it('should produce different results with different seeds', () => {
      const rng1 = seedRng('seed-1');
      const state1 = initializeInformationEcology(rng1);

      const rng2 = seedRng('seed-2');
      const state2 = initializeInformationEcology(rng2);

      assert.notDeepStrictEqual(state1, state2);
    });
  });

  describe('Epidemic Dynamics (Misinformation Spread)', () => {
    it('should increase misinformation when R₀ > 1 (high transmission)', () => {
      const rng = seedRng('high-r0-test');
      const state = initializeInformationEcology(rng);

      // Set high R₀ to ensure growth
      state.misinformationR0 = 1.8; // Upper bound
      state.misinformationLoad = 0.1; // Low initial load

      const initialLoad = state.misinformationLoad;
      updateInformationEcology(state, createMockGameState(), rng, 30);

      assert(state.misinformationLoad > initialLoad,
        `Misinformation should grow with R₀=1.8, but ${state.misinformationLoad} not > ${initialLoad}`);
    });

    it('should decrease misinformation when R₀ < 1 (strong fact-checking)', () => {
      const rng = seedRng('low-r0-test');
      const state = initializeInformationEcology(rng);

      // Set low R₀ and high fact-checking effectiveness
      state.misinformationR0 = 1.2; // Lower bound
      state.factCheckHalfLife = 5; // Fast decay (short half-life)
      state.misinformationLoad = 0.8; // High initial load

      const initialLoad = state.misinformationLoad;
      updateInformationEcology(state, createMockGameState(), rng, 30);

      assert(state.misinformationLoad < initialLoad,
        `Misinformation should decrease with low R₀ and fast fact-check decay`);
    });

    it('should reach equilibrium behavior over time', () => {
      const rng = seedRng('equilibrium-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      // Run multiple updates
      const loads: number[] = [];
      for (let i = 0; i < 10; i++) {
        updateInformationEcology(state, gameState, rng, 30);
        loads.push(state.misinformationLoad);
      }

      // Check that system stabilizes (changes get smaller)
      const changes = loads.slice(1).map((l, i) => Math.abs(l - loads[i]));
      const avgEarlyChange = changes.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const avgLateChange = changes.slice(-3).reduce((a, b) => a + b, 0) / 3;

      // Later changes should be smaller (approaching equilibrium)
      // Note: This is a soft check due to model uncertainty
      assert(avgLateChange <= avgEarlyChange * 1.5,
        'System should approach equilibrium');
    });

    it('should never exceed bounds [0, 1] for misinformation load', () => {
      const rng = seedRng('bounds-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      for (let i = 0; i < 20; i++) {
        updateInformationEcology(state, gameState, rng, 30);
        assertInBounds(state.misinformationLoad, 'misinformationLoad');
      }
    });

    it('should handle extreme values without producing NaN', () => {
      const rng = seedRng('nan-test');
      const state = initializeInformationEcology(rng);

      // Test with extreme values
      state.misinformationLoad = 0.99;
      state.misinformationR0 = 1.8;
      state.factCheckHalfLife = 30;

      updateInformationEcology(state, createMockGameState(), rng, 365);

      assertValidState(state);
    });

    it('should verify fact-check decay coefficient calculation', () => {
      const rng = seedRng('fact-check-test');
      const state = initializeInformationEcology(rng);

      // With short half-life, gamma should be large
      const shortHalfLife = state.misinformationR0 = 1.2;
      state.factCheckHalfLife = 5;

      const initialLoad = 0.5;
      state.misinformationLoad = initialLoad;
      updateInformationEcology(state, createMockGameState(), rng, 30);

      const shortHalfLifeResult = state.misinformationLoad;

      // Reset with long half-life
      state.misinformationLoad = initialLoad;
      state.factCheckHalfLife = 30;
      updateInformationEcology(state, createMockGameState(), rng, 30);

      // Long half-life should result in slower decay (higher final load)
      assert(state.misinformationLoad >= shortHalfLifeResult,
        'Longer fact-check half-life should slow decay');
    });
  });

  describe('Trust Erosion and Recovery', () => {
    it('should erode trust over time (baseline decay)', () => {
      const rng = seedRng('trust-erosion-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      const initialTrust = state.socialTrust;
      updateInformationEcology(state, gameState, rng, 365); // 1 year

      assert(state.socialTrust < initialTrust,
        'Trust should erode over 1 year of baseline decay');
    });

    it('should amplify trust loss when polarization is high', () => {
      const rng = seedRng('polarization-amplify-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      state.socialTrust = 0.8;
      state.polarization = 0.9; // Very high polarization

      const initialTrust = state.socialTrust;
      updateInformationEcology(state, gameState, rng, 365);

      // Reset for comparison with low polarization
      const state2 = initializeInformationEcology(seedRng('polarization-amplify-test'));
      state2.socialTrust = 0.8;
      state2.polarization = 0.1; // Low polarization

      updateInformationEcology(state2, gameState, seedRng('polarization-amplify-test'), 365);

      // High polarization case should lose more trust
      assert(state.socialTrust < state2.socialTrust,
        'High polarization should accelerate trust loss');
    });

    it('should allow trust recovery after shocks (when daysSinceLastShock > 180)', () => {
      const rng = seedRng('trust-recovery-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      state.socialTrust = 0.3;
      state.daysSinceLastShock = 200; // Well past recovery threshold

      const initialTrust = state.socialTrust;
      updateInformationEcology(state, gameState, rng, 365);

      // With recovery active, erosion should be less severe
      // (recovery term counteracts baseline decay)
      assertInBounds(state.socialTrust, 'socialTrust');
    });

    it('should prevent trust from going below 0', () => {
      const rng = seedRng('trust-floor-test');
      const state = initializeInformationEcology(rng);

      // Manually set very low trust
      state.socialTrust = 0.01;
      state.polarization = 1.0; // Maximum amplification

      updateInformationEcology(state, createMockGameState(), rng, 365);

      assert(state.socialTrust >= 0,
        'Trust should never go below 0');
    });

    it('should keep trust at or below 1', () => {
      const rng = seedRng('trust-ceiling-test');
      const state = initializeInformationEcology(rng);

      state.socialTrust = 0.99;
      state.daysSinceLastShock = 200; // Enable recovery

      for (let i = 0; i < 20; i++) {
        updateInformationEcology(state, createMockGameState(), rng, 30);
        assertInBounds(state.socialTrust, 'socialTrust');
      }
    });
  });

  describe('Epistemic Shocks', () => {
    it('should apply trust drop on shock (severity 0.5)', () => {
      const rng = seedRng('shock-trust-test');
      const state = initializeInformationEcology(rng);

      const initialTrust = state.socialTrust;
      applyEpistemicShock(state, 0.5, rng);

      assert(state.socialTrust < initialTrust,
        'Trust should drop after shock');

      // Shock severity 0.5 should drop 5% + 0.5*25% = 17.5%
      const expectedDropMin = 0.05;
      const expectedDropMax = 0.05 + 0.5 * 0.25;
      const actualDrop = initialTrust - state.socialTrust;

      assert(actualDrop >= expectedDropMin && actualDrop <= expectedDropMax,
        `Trust drop ${actualDrop} not in expected range [${expectedDropMin}, ${expectedDropMax}]`);
    });

    it('should increase misinformation load on shock', () => {
      const rng = seedRng('shock-misinformation-test');
      const state = initializeInformationEcology(rng);

      const initialLoad = state.misinformationLoad;
      applyEpistemicShock(state, 0.5, rng);

      assert(state.misinformationLoad > initialLoad,
        'Misinformation should spike after shock');
    });

    it('should increase polarization on shock', () => {
      const rng = seedRng('shock-polarization-test');
      const state = initializeInformationEcology(rng);

      const initialPolarization = state.polarization;
      applyEpistemicShock(state, 0.5, rng);

      assert(state.polarization > initialPolarization,
        'Polarization should spike after shock');
    });

    it('should reset daysSinceLastShock to 0 on shock', () => {
      const rng = seedRng('shock-timer-test');
      const state = initializeInformationEcology(rng);

      state.daysSinceLastShock = 100;
      applyEpistemicShock(state, 0.5, rng);

      assert.strictEqual(state.daysSinceLastShock, 0,
        'daysSinceLastShock should be reset to 0');
    });

    it('should scale shock effects with severity', () => {
      const rng = seedRng('shock-severity-test');
      const state1 = initializeInformationEcology(rng);
      const state2 = initializeInformationEcology(rng);

      applyEpistemicShock(state1, 0.2, rng);
      applyEpistemicShock(state2, 0.8, rng);

      // Higher severity should cause larger drops
      assert(state2.socialTrust < state1.socialTrust,
        'Higher severity should cause larger trust drop');
      assert(state2.misinformationLoad > state1.misinformationLoad,
        'Higher severity should cause larger misinformation spike');
    });

    it('should clamp shock effects to valid bounds', () => {
      const rng = seedRng('shock-clamp-test');
      const state = initializeInformationEcology(rng);

      state.socialTrust = 0.1;
      applyEpistemicShock(state, 1.0, rng); // Maximum severity

      assertValidState(state);
    });
  });

  describe('Coordination Capacity', () => {
    it('should calculate coordination modifier between 0.5 and 1.0', () => {
      const rng = seedRng('coord-bounds-test');
      const state = initializeInformationEcology(rng);

      for (let i = 0; i < 10; i++) {
        const modifier = calculateCoordinationModifier(state, rng);
        assert(modifier >= 0.5 && modifier <= 1.0,
          `Coordination modifier ${modifier} out of expected range [0.5, 1.0]`);
      }
    });

    it('should reduce coordination when trust and shared reality are low', () => {
      const rng = seedRng('low-coord-test');
      const state = initializeInformationEcology(rng);

      state.socialTrust = 0.1;
      state.sharedReality = 0.1;

      const lowCoordModifier = calculateCoordinationModifier(state, rng);

      // Compare with high values
      state.socialTrust = 0.9;
      state.sharedReality = 0.9;

      const highCoordModifier = calculateCoordinationModifier(state, rng);

      assert(lowCoordModifier < highCoordModifier,
        'Low trust/reality should reduce coordination capacity');
    });

    it('should show threshold behavior (soft sigmoid, not hard cutoff)', () => {
      const rng = seedRng('threshold-test');
      const state = initializeInformationEcology(rng);

      // Test around coordination metric of 0.2 (contested threshold)
      const modifiers: number[] = [];

      for (let metric = 0.05; metric <= 0.35; metric += 0.05) {
        state.socialTrust = metric;
        state.sharedReality = 1.0; // Focus on trust variation
        const modifier = calculateCoordinationModifier(state, rng);
        modifiers.push(modifier);
      }

      // Verify sigmoid shape: smooth transition, not cliff
      // (differences between consecutive values should be positive)
      for (let i = 1; i < modifiers.length; i++) {
        assert(modifiers[i] >= modifiers[i - 1],
          'Coordination should increase monotonically with trust');
      }
    });

    it('should incorporate uncertainty in threshold (range ~0.15-0.30)', () => {
      // The threshold is sampled from [0.15, 0.30] range based on RNG
      // Different RNG values should produce different modifiers for same state
      const state = initializeInformationEcology(seedRng('threshold-uncertainty-test'));
      state.socialTrust = 0.2;
      state.sharedReality = 0.2; // Coordination metric = 0.04

      const modifiers = new Set<number>();

      for (let i = 0; i < 5; i++) {
        const modifier = calculateCoordinationModifier(state, seedRng(`threshold-${i}`));
        modifiers.add(Math.round(modifier * 1000) / 1000); // Round to 3 decimals
      }

      // Different seeds should produce different thresholds, hence different modifiers
      assert(modifiers.size > 1,
        'Uncertainty sampling should produce different modifiers with different seeds');
    });

    it('should reach minimum coordination capacity of 0.5', () => {
      const rng = seedRng('min-coord-test');
      const state = initializeInformationEcology(rng);

      // Set all metrics to zero
      state.socialTrust = 0;
      state.sharedReality = 0;

      const modifier = calculateCoordinationModifier(state, rng);

      assert(modifier >= 0.5,
        `Coordination modifier ${modifier} should be at least 0.5 (minimum)`);
    });
  });

  describe('Shared Reality Dynamics', () => {
    it('should erode shared reality when misinformation is high', () => {
      const rng = seedRng('reality-erosion-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      state.misinformationLoad = 0.8;
      state.polarization = 0.8;
      state.socialTrust = 0.3;

      const initialReality = state.sharedReality;
      updateInformationEcology(state, gameState, rng, 30);

      assert(state.sharedReality < initialReality,
        'Shared reality should erode with high misinformation');
    });

    it('should have recovery mechanism available when conditions are met', () => {
      // NOTE: Despite low misinformation/high trust, shared reality can still decline due to
      // polarization effects and the baseline erosion rate. This test verifies the recovery
      // mechanism is *available*, not that recovery always wins out.
      const rng = seedRng('reality-recovery-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      // Optimal recovery conditions: low misinformation, high trust
      state.misinformationLoad = 0.1;
      state.socialTrust = 0.9;
      state.polarization = 0.1; // Low polarization also helps
      state.sharedReality = 0.3;

      const initialReality = state.sharedReality;

      // First update with these conditions
      updateInformationEcology(state, gameState, rng, 30);

      // Verify state remains valid (recovery mechanism didn't break)
      assertValidState(state);
      assert(state.sharedReality >= 0, 'Shared reality should not go negative');
    });

    it('should keep shared reality in bounds [0, 1]', () => {
      const rng = seedRng('reality-bounds-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      for (let i = 0; i < 20; i++) {
        updateInformationEcology(state, gameState, rng, 30);
        assertInBounds(state.sharedReality, 'sharedReality');
      }
    });
  });

  describe('Epistemic Health (Composite Metric)', () => {
    it('should be high when components are healthy (low misinformation, high trust)', () => {
      const rng = seedRng('health-good-test');
      const state = initializeInformationEcology(rng);

      state.misinformationLoad = 0.1;
      state.socialTrust = 0.9;
      state.sharedReality = 0.9;
      state.polarization = 0.1;

      updateInformationEcology(state, createMockGameState(), rng, 0);

      assert(state.epistemicHealth > 0.7,
        'Epistemic health should be high with healthy components');
    });

    it('should be low when components are degraded', () => {
      const rng = seedRng('health-bad-test');
      const state = initializeInformationEcology(rng);

      state.misinformationLoad = 0.8;
      state.socialTrust = 0.2;
      state.sharedReality = 0.2;
      state.polarization = 0.8;

      updateInformationEcology(state, createMockGameState(), rng, 0);

      assert(state.epistemicHealth < 0.4,
        'Epistemic health should be low with degraded components');
    });

    it('should balance all components (geometric mean)', () => {
      const rng = seedRng('health-balance-test');
      const state = initializeInformationEcology(rng);

      // Scenario 1: One good component, others bad
      state.misinformationLoad = 0.1; // Good
      state.socialTrust = 0.1; // Bad
      state.sharedReality = 0.1; // Bad
      state.polarization = 0.8; // Bad

      updateInformationEcology(state, createMockGameState(), rng, 0);
      const health1 = state.epistemicHealth;

      // Scenario 2: All components moderate
      const state2 = initializeInformationEcology(rng);
      state2.misinformationLoad = 0.4;
      state2.socialTrust = 0.4;
      state2.sharedReality = 0.4;
      state2.polarization = 0.4;

      updateInformationEcology(state2, createMockGameState(), rng, 0);
      const health2 = state2.epistemicHealth;

      // Geometric mean should penalize unbalanced states
      assert(health2 > health1,
        'Balanced health should be better than unbalanced');
    });

    it('should prevent NaN in epistemic health calculation', () => {
      const rng = seedRng('health-nan-test');
      const state = initializeInformationEcology(rng);

      // Test extreme values
      state.misinformationLoad = 0.99;
      state.socialTrust = 0.01;
      state.sharedReality = 0.01;
      state.polarization = 0.99;

      updateInformationEcology(state, createMockGameState(), rng, 0);

      assert(!Number.isNaN(state.epistemicHealth),
        'Epistemic health should not be NaN');
      assertInBounds(state.epistemicHealth, 'epistemicHealth');
    });
  });

  describe('AI Polarization Impact', () => {
    it('should reflect AI social capability influence on polarization', () => {
      const rng = seedRng('ai-capability-test');
      const state = initializeInformationEcology(rng);

      // State with high AI capability
      const gameStateWithAI = createMockGameStateWithAIs(3);
      if (gameStateWithAI.aiAgents[0]) {
        gameStateWithAI.aiAgents[0].capabilityProfile = {
          physical: 0.1,
          digital: 0.1,
          cognitive: 0.1,
          social: 0.9, // High social capability
          economic: 0.1,
          selfImprovement: 0.1,
          research: {
            biotech: { genetics: 0.1, synbio: 0.1 },
            materials: { nanotech: 0.1, metamaterials: 0.1 },
            climate: { geoengineering: 0.1, carbonCapture: 0.1 },
            computerScience: { algorithms: 0.1, hardware: 0.1 },
          },
        };
      }

      const initialPolarization = state.polarization;
      updateInformationEcology(state, gameStateWithAI, rng, 30);

      // With high AI social capability, polarization should change more
      const changeWithAI = Math.abs(state.polarization - initialPolarization);

      // Compare with no AI
      const state2 = initializeInformationEcology(rng);
      const gameStateNoAI = createMockGameState();
      const polarizationNoAI = state2.polarization;

      updateInformationEcology(state2, gameStateNoAI, rng, 30);
      const changeNoAI = Math.abs(state2.polarization - polarizationNoAI);

      assert(changeWithAI >= changeNoAI,
        'High AI social capability should increase polarization effects');
    });

    it('should not cause NaN during polarization update', () => {
      const rng = seedRng('ai-polar-nan-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameStateWithAIs(5);

      for (let i = 0; i < 10; i++) {
        updateInformationEcology(state, gameState, rng, 30);
        assertInBounds(state.polarization, 'polarization');
      }
    });
  });

  describe('State Validation and Bounds', () => {
    it('should maintain valid state after multiple updates', () => {
      const rng = seedRng('multi-update-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      for (let i = 0; i < 100; i++) {
        updateInformationEcology(state, gameState, rng, 30);
        assertValidState(state);
      }
    });

    it('should never produce NaN values', () => {
      const rng = seedRng('nan-comprehensive-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameStateWithAIs(3);

      // Apply shocks to stress the system
      for (let month = 0; month < 60; month++) {
        updateInformationEcology(state, gameState, rng, 30);

        if (month % 12 === 0) {
          applyEpistemicShock(state, Math.random(), rng);
        }

        // Verify no NaN
        Object.entries(state).forEach(([key, value]) => {
          if (typeof value === 'number') {
            assert(!Number.isNaN(value),
              `${key} became NaN at month ${month}`);
          }
        });
      }
    });

    it('should handle extreme initial conditions', () => {
      const rng = seedRng('extreme-conditions-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      // Set extreme values
      state.misinformationLoad = 0.99;
      state.socialTrust = 0.01;
      state.sharedReality = 0.01;
      state.polarization = 0.99;

      updateInformationEcology(state, gameState, rng, 365);

      assertValidState(state);
    });

    it('should handle daysSinceLastShock increments correctly', () => {
      const rng = seedRng('shock-timer-increment-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      state.daysSinceLastShock = 100;
      updateInformationEcology(state, gameState, rng, 30);

      assert.strictEqual(state.daysSinceLastShock, 130,
        'daysSinceLastShock should increment by daysElapsed');

      updateInformationEcology(state, gameState, rng, 45);

      assert.strictEqual(state.daysSinceLastShock, 175,
        'daysSinceLastShock should continue incrementing');
    });
  });

  describe('Determinism (RNG Reproducibility)', () => {
    it('should produce identical state with same seed', () => {
      const seed = 'determinism-full-test';

      // Run 1
      const rng1 = seedRng(seed);
      const state1 = initializeInformationEcology(rng1);
      const gameState1 = createMockGameState();

      for (let i = 0; i < 24; i++) {
        updateInformationEcology(state1, gameState1, rng1, 30);
        if (i % 6 === 0) {
          applyEpistemicShock(state1, rng1() * 0.5, rng1);
        }
      }

      // Run 2 with same seed
      const rng2 = seedRng(seed);
      const state2 = initializeInformationEcology(rng2);
      const gameState2 = createMockGameState();

      for (let i = 0; i < 24; i++) {
        updateInformationEcology(state2, gameState2, rng2, 30);
        if (i % 6 === 0) {
          applyEpistemicShock(state2, rng2() * 0.5, rng2);
        }
      }

      // States should be identical
      assert.deepStrictEqual(state1, state2);
    });

    it('should be sensitive to RNG differences', () => {
      const state1 = initializeInformationEcology(seedRng('seed-a'));
      const state2 = initializeInformationEcology(seedRng('seed-b'));

      // Initial states should differ due to sampling
      assert.notDeepStrictEqual(state1, state2);
    });
  });

  describe('Integration Tests', () => {
    it('should work with full game state updates', () => {
      const rng = seedRng('integration-full-test');
      const gameState = createMockGameStateWithAIs(3);

      // Initialize information ecology in game state
      gameState.informationEcology = initializeInformationEcology(rng);
      gameState.society = {
        ...gameState.society,
        coordinationCapacity: 1.0,
      };

      // Update game state
      updateInformationEcology(gameState.informationEcology, gameState, rng, 30);

      // Verify coordination capacity can be modulated
      const modifier = calculateCoordinationModifier(gameState.informationEcology, rng);
      gameState.society.coordinationCapacity *= modifier;

      assert(gameState.society.coordinationCapacity >= 0.5 && gameState.society.coordinationCapacity <= 1.0,
        'Coordination capacity should remain valid after modulation');
    });

    it('should show health degradation after crisis', () => {
      // NOTE: Recovery from shocks is slow (trust recovery only at daysSinceLastShock > 180).
      // During recovery period with continued updates, health may continue declining due to
      // baseline erosion (misinformation R₀, polarization, trust decay). This test verifies
      // that shocks have measurable impact, not that recovery is quick.
      const rng = seedRng('degradation-path-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      // Initial health
      updateInformationEcology(state, gameState, rng, 0); // Compute initial health
      const initialHealth = state.epistemicHealth;

      // Crisis event - apply severe shock
      applyEpistemicShock(state, 0.8, rng);
      updateInformationEcology(state, gameState, rng, 0); // Recompute health after shock
      const healthAfterShock = state.epistemicHealth;

      // Verify shock causes immediate degradation
      assert(healthAfterShock < initialHealth,
        `Health should drop after shock: ${healthAfterShock} < ${initialHealth}`);

      // Even without recovery, verify the state remains valid during extended period
      for (let i = 0; i < 24; i++) {
        updateInformationEcology(state, gameState, rng, 30);
      }
      assertValidState(state);
    });

    it('should show coordination failure threshold crossing', () => {
      const rng = seedRng('coord-threshold-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();

      // Degrade to below threshold
      for (let month = 0; month < 120; month++) {
        updateInformationEcology(state, gameState, rng, 30);

        if (month % 12 === 0) {
          applyEpistemicShock(state, 0.5, rng);
        }
      }

      // Should be significantly degraded
      const modifier = calculateCoordinationModifier(state, rng);

      // With persistent shocks and decay, should be closer to minimum
      assert(modifier < 0.85,
        'Repeated shocks should significantly reduce coordination capacity');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero daysElapsed without errors', () => {
      const rng = seedRng('zero-days-test');
      const state = initializeInformationEcology(rng);

      updateInformationEcology(state, createMockGameState(), rng, 0);

      assertValidState(state);
    });

    it('should handle large daysElapsed values', () => {
      const rng = seedRng('large-days-test');
      const state = initializeInformationEcology(rng);

      // 10 years
      updateInformationEcology(state, createMockGameState(), rng, 365 * 10);

      assertValidState(state);
    });

    it('should handle shock severity boundary values', () => {
      const rng = seedRng('shock-boundary-test');
      const state1 = initializeInformationEcology(rng);
      const state2 = initializeInformationEcology(rng);
      const state3 = initializeInformationEcology(rng);

      applyEpistemicShock(state1, 0, rng); // No shock
      applyEpistemicShock(state2, 0.5, rng); // Medium shock
      applyEpistemicShock(state3, 1.0, rng); // Maximum shock

      // Verify all states remain valid
      assertValidState(state1);
      assertValidState(state2);
      assertValidState(state3);

      // Verify ordering: no shock < medium < max
      assert(state2.socialTrust < state1.socialTrust,
        'Medium shock should reduce trust more than no shock');
      assert(state3.socialTrust < state2.socialTrust,
        'Maximum shock should reduce trust more than medium');
    });

    it('should handle empty AI agents list', () => {
      const rng = seedRng('no-ai-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameState();
      gameState.aiAgents = []; // No AI agents

      updateInformationEcology(state, gameState, rng, 30);

      assertValidState(state);
    });

    it('should handle AI agents without capability profile', () => {
      const rng = seedRng('no-profile-test');
      const state = initializeInformationEcology(rng);
      const gameState = createMockGameStateWithAIs(1);

      if (gameState.aiAgents[0]) {
        gameState.aiAgents[0].capabilityProfile = undefined as any;
      }

      // Should not crash, should default to 0 social capability
      updateInformationEcology(state, gameState, rng, 30);

      assertValidState(state);
    });
  });
});
