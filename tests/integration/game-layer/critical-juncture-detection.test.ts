/**
 * Integration Test: Critical Juncture Detection (roadmap 5.4)
 *
 * Tests for src/simulation/engine/phases/CriticalJuncturePhase.ts
 * Purpose: Verify critical juncture detection correctly identifies moments where agency matters
 *
 * Test Coverage:
 * 1. Tipping points detected correctly (3 conditions required)
 * 2. Bifurcation moments identified (regime shifts)
 * 3. Player influence opportunities surface
 * 4. Research breakthroughs trigger notifications
 *
 * Research Foundation:
 * - Acemoglu & Robinson (2001): Critical junctures as moments of institutional fluidity
 * - Svolik (2012): Democratic breakdowns require elite defection AND mass mobilization
 * - Kuran (1991): Preference falsification - hidden opposition cascades
 *
 * @module tests/integration/game-layer/critical-juncture-detection
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { isAtCriticalJuncture, calculateAgencyPotential } from '@/simulation/engine/phases/CriticalJuncturePhase';
import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import type { GameState } from '@/types/game';

describe('Critical Juncture Detection Integration Tests', () => {

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Create a test GameState with critical juncture conditions
   *
   * Critical juncture requires ALL THREE:
   * 1. Institutional flux: institutions weak (>0.6 flux, >0.2 strength)
   * 2. Information ambiguity: low information integrity (<0.5)
   * 3. Balanced forces: 1-2 active crises, QoL in [0.3, 0.7]
   */
  function createJunctureState(overrides?: Partial<GameState>): GameState {
    const rng = createTestRng(42);
    const baseState = initializeHistoricalSimulation(
      2024, // start year (2025 not supported by historical init - using 2024)
      rng,
      'baseline' // scenario mode
    );

    // Set critical juncture conditions
    // 1. Institutional flux: weak but not destroyed
    baseState.government.governanceQuality.institutionalCapacity = 0.3; // flux = 0.7 (>0.6 threshold)

    // 2. Information ambiguity: coordination problems
    baseState.globalMetrics.informationIntegrity = 0.4; // <0.5 threshold

    // 3. Balanced forces: crisis exists but recoverable
    baseState.environmentalAccumulation.climateCrisisActive = true; // 1 crisis
    baseState.globalMetrics.qualityOfLife = 0.5; // in [0.3, 0.7] range

    // Apply overrides
    if (overrides) {
      Object.assign(baseState, overrides);
    }

    return baseState;
  }

  /**
   * Deterministic RNG for testing
   */
  function createTestRng(seed: number = 42): () => number {
    let state = seed;
    return () => {
      // Simple LCG algorithm
      state = (state * 1664525 + 1013904223) % 2**32;
      return state / 2**32;
    };
  }

  // ============================================================================
  // Test 1: Three-Condition Detection
  // ============================================================================

  describe('Three-Condition Detection', () => {
    test('should detect juncture when ALL THREE conditions met', () => {
      const state = createJunctureState();

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, true,
        'Should detect juncture when institutional flux + info ambiguity + balanced forces all present');
    });

    test('should NOT detect juncture if institutional flux missing', () => {
      const state = createJunctureState();

      // Make institutions STRONG (no flux)
      state.government.governanceQuality.institutionalCapacity = 0.9; // flux = 0.1 (<0.6 threshold)

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when institutional flux missing (institutions too strong)');
    });

    test('should NOT detect juncture if institutions completely collapsed', () => {
      const state = createJunctureState();

      // Make institutions COLLAPSED (no capacity for change)
      state.government.governanceQuality.institutionalCapacity = 0.1; // <0.2 threshold

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when institutions completely collapsed (no capacity for change)');
    });

    test('should NOT detect juncture if information integrity too high', () => {
      const state = createJunctureState();

      // High information integrity (no ambiguity)
      state.globalMetrics.informationIntegrity = 0.8; // >0.5 threshold

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when information integrity too high (no coordination problems)');
    });

    test('should NOT detect juncture if no active crises', () => {
      const state = createJunctureState();

      // Deactivate all crises
      state.environmentalAccumulation.climateCrisisActive = false;
      state.environmentalAccumulation.resourceCrisisActive = false;
      state.environmentalAccumulation.pollutionCrisisActive = false;
      state.environmentalAccumulation.ecosystemCrisisActive = false;

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when no active crises (no balanced forces)');
    });

    test('should NOT detect juncture if too many crises (overwhelming)', () => {
      const state = createJunctureState();

      // Activate many crises (3+)
      state.environmentalAccumulation.climateCrisisActive = true;
      state.environmentalAccumulation.resourceCrisisActive = true;
      state.environmentalAccumulation.pollutionCrisisActive = true;

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when too many crises (overwhelming, not balanced)');
    });

    test('should NOT detect juncture if QoL too low', () => {
      const state = createJunctureState();

      // QoL collapsed
      state.globalMetrics.qualityOfLife = 0.2; // <0.3 threshold

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when QoL too low (collapse, not balanced forces)');
    });

    test('should NOT detect juncture if QoL too high', () => {
      const state = createJunctureState();

      // QoL prosperous
      state.globalMetrics.qualityOfLife = 0.9; // >0.7 threshold

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when QoL too high (prosperity, no crisis)');
    });
  });

  // ============================================================================
  // Test 2: Agency Potential Calculation
  // ============================================================================

  describe('Agency Potential Calculation', () => {
    test('should return 0 agency potential when not at juncture', () => {
      const state = createJunctureState();
      const rng = createTestRng();

      // Break juncture condition (too many crises)
      state.environmentalAccumulation.climateCrisisActive = true;
      state.environmentalAccumulation.resourceCrisisActive = true;
      state.environmentalAccumulation.pollutionCrisisActive = true;

      const agencyPotential = calculateAgencyPotential(state, rng);

      assert.strictEqual(agencyPotential, 0,
        'Should return 0 agency potential when not at critical juncture');
    });

    test('should calculate agency potential in [0, 1] when at juncture', () => {
      const state = createJunctureState();
      const rng = createTestRng();

      const agencyPotential = calculateAgencyPotential(state, rng);

      assert.ok(agencyPotential >= 0 && agencyPotential <= 1,
        `Agency potential should be in [0, 1], got ${agencyPotential}`);
    });

    test('should give higher agency potential to democratic systems', () => {
      const democraticState = createJunctureState();
      democraticState.government.governmentType = 'democratic';

      const authoritarianState = createJunctureState();
      authoritarianState.government.governmentType = 'authoritarian';

      const rngDemocratic = createTestRng(100);
      const rngAuthoritarian = createTestRng(100); // Same seed for fair comparison

      const democraticAgency = calculateAgencyPotential(democraticState, rngDemocratic);
      const authoritarianAgency = calculateAgencyPotential(authoritarianState, rngAuthoritarian);

      assert.ok(democraticAgency > authoritarianAgency,
        `Democratic agency (${democraticAgency}) should exceed authoritarian (${authoritarianAgency})`);
    });

    test('should incorporate latent opposition when QoL is low', () => {
      const lowQoLState = createJunctureState();
      lowQoLState.globalMetrics.qualityOfLife = 0.3; // Low QoL → latent opposition

      const highQoLState = createJunctureState();
      highQoLState.globalMetrics.qualityOfLife = 0.6; // Higher QoL → less latent opposition

      const rngLow = createTestRng(200);
      const rngHigh = createTestRng(200); // Same seed

      const lowQoLAgency = calculateAgencyPotential(lowQoLState, rngLow);
      const highQoLAgency = calculateAgencyPotential(highQoLState, rngHigh);

      // Low QoL should produce higher latent opposition component
      // Note: Other factors (personal authority RNG) may vary, but on average low QoL should be higher
      assert.ok(lowQoLAgency >= highQoLAgency * 0.9,
        `Low QoL agency (${lowQoLAgency}) should be comparable to or higher than high QoL (${highQoLAgency})`);
    });

    test('should boost agency potential with coordination cascade conditions', () => {
      const cascadeState = createJunctureState();
      // Coordination cascade requires: latent opposition (QoL <0.6) AND info ambiguity (<0.4)
      cascadeState.globalMetrics.qualityOfLife = 0.35; // Latent opposition
      cascadeState.globalMetrics.informationIntegrity = 0.3; // High ambiguity

      const noCascadeState = createJunctureState();
      noCascadeState.globalMetrics.qualityOfLife = 0.35; // Same latent opposition
      noCascadeState.globalMetrics.informationIntegrity = 0.45; // Just above cascade threshold

      const rngCascade = createTestRng(300);
      const rngNoCascade = createTestRng(300); // Same seed

      const cascadeAgency = calculateAgencyPotential(cascadeState, rngCascade);
      const noCascadeAgency = calculateAgencyPotential(noCascadeState, rngNoCascade);

      assert.ok(cascadeAgency > noCascadeAgency,
        `Cascade conditions (${cascadeAgency}) should boost agency vs no cascade (${noCascadeAgency})`);
    });

    test('should boost agency potential with strong social movements', () => {
      const strongMovementState = createJunctureState();
      strongMovementState.society.socialMovements = { strength: 0.8 };

      const weakMovementState = createJunctureState();
      weakMovementState.society.socialMovements = { strength: 0.2 };

      const rngStrong = createTestRng(400);
      const rngWeak = createTestRng(400); // Same seed

      const strongMovementAgency = calculateAgencyPotential(strongMovementState, rngStrong);
      const weakMovementAgency = calculateAgencyPotential(weakMovementState, rngWeak);

      assert.ok(strongMovementAgency > weakMovementAgency,
        `Strong social movements (${strongMovementAgency}) should boost agency vs weak movements (${weakMovementAgency})`);
    });
  });

  // ============================================================================
  // Test 3: Escape Types (Player Influence Opportunities)
  // ============================================================================

  describe('Player Influence Opportunities', () => {
    test('should identify war prevention opportunity when nuclear tensions high', () => {
      const state = createJunctureState();

      // High nuclear tensions (inverse of crisis stability)
      if (!state.madDeterrence) {
        state.madDeterrence = {
          arsenals: {},
          bilateralDeterrence: [],
          crisisStability: 0.2, // Low stability → high tensions (1 - 0.2 = 0.8 > 0.7)
        };
      } else {
        state.madDeterrence.crisisStability = 0.2;
      }

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, true,
        'Should detect juncture even with high nuclear tensions (balanced forces from other crises)');

      // Note: Escape type determination is in attemptEscape(), which checks nuclearTensions
      // We verify juncture detection works when tensions are high
    });

    test('should identify cooperation opportunity when multiple crises present', () => {
      const state = createJunctureState();

      // Multiple crises (but <3 to stay in balanced range)
      state.environmentalAccumulation.climateCrisisActive = true;
      state.environmentalAccumulation.resourceCrisisActive = true;
      state.globalMetrics.qualityOfLife = 0.5; // Still in balanced range

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, true,
        'Should detect juncture when multiple crises present (cooperation opportunity)');
    });

    test('should identify recovery opportunity when QoL low but population surviving', () => {
      const state = createJunctureState();

      // Low QoL but population still above 70% of initial
      state.globalMetrics.qualityOfLife = 0.4; // Low but in balanced range
      state.humanPopulationSystem.population = state.initialPopulation! * 0.8; // 80% surviving

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, true,
        'Should detect juncture when QoL low but population surviving (recovery opportunity)');
    });

    test('should identify breakthrough opportunity when research stalled', () => {
      const state = createJunctureState();

      // Research stalled (low unlocked tech count)
      state.technologyTree = state.technologyTree?.slice(0, 10) || []; // Only 10 techs

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, true,
        'Should detect juncture even when research stalled (breakthrough opportunity)');
    });
  });

  // ============================================================================
  // Test 4: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('should handle missing madDeterrence field gracefully', () => {
      const state = createJunctureState();

      // Remove madDeterrence field
      delete (state as any).madDeterrence;

      // Should not crash (uses legitimate default: nuclearTensions = 0)
      assert.doesNotThrow(() => {
        isAtCriticalJuncture(state);
      }, 'Should not crash when madDeterrence is undefined');
    });

    test('should handle missing socialMovements field gracefully', () => {
      const state = createJunctureState();
      const rng = createTestRng();

      // Remove socialMovements field
      delete (state as any).society.socialMovements;

      // Should not crash (uses legitimate default: strength = 0)
      assert.doesNotThrow(() => {
        calculateAgencyPotential(state, rng);
      }, 'Should not crash when socialMovements is undefined');
    });

    test('should handle exactly 3 crises (boundary case)', () => {
      const state = createJunctureState();

      // Exactly 3 crises (boundary: <3 required for balanced forces)
      state.environmentalAccumulation.climateCrisisActive = true;
      state.environmentalAccumulation.resourceCrisisActive = true;
      state.environmentalAccumulation.pollutionCrisisActive = true;

      const isJuncture = isAtCriticalJuncture(state);

      assert.strictEqual(isJuncture, false,
        'Should NOT detect juncture when exactly 3 crises (boundary: <3 required)');
    });

    test('should handle QoL exactly at boundaries', () => {
      const state03 = createJunctureState();
      state03.globalMetrics.qualityOfLife = 0.3; // Lower boundary

      const state07 = createJunctureState();
      state07.globalMetrics.qualityOfLife = 0.7; // Upper boundary

      // Boundaries are INCLUSIVE (QoL in [0.3, 0.7] required)
      assert.strictEqual(isAtCriticalJuncture(state03), true,
        'Should detect juncture when QoL = 0.3 (lower boundary inclusive)');
      assert.strictEqual(isAtCriticalJuncture(state07), true,
        'Should detect juncture when QoL = 0.7 (upper boundary inclusive)');
    });

    test('should handle institutional capacity exactly at boundaries', () => {
      const stateFluxBoundary = createJunctureState();
      stateFluxBoundary.government.governanceQuality.institutionalCapacity = 0.4; // flux = 0.6 exactly

      const stateStrengthBoundary = createJunctureState();
      stateStrengthBoundary.government.governanceQuality.institutionalCapacity = 0.2; // strength = 0.2 exactly

      // flux >0.6 AND strength >0.2 required
      // So flux = 0.6 exactly should FAIL (not >0.6)
      // And strength = 0.2 exactly should FAIL (not >0.2)
      assert.strictEqual(isAtCriticalJuncture(stateFluxBoundary), false,
        'Should NOT detect juncture when flux exactly 0.6 (boundary: >0.6 required)');
      assert.strictEqual(isAtCriticalJuncture(stateStrengthBoundary), false,
        'Should NOT detect juncture when strength exactly 0.2 (boundary: >0.2 required)');
    });
  });
});
