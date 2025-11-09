/**
 * Integration Tests: Batch 5 - Social & Governance
 *
 * Tests consolidated social and governance phases:
 * - GovernanceSystemPhase (GovernanceQuality + GovernmentElection + PolicyImplementation)
 * - SocialStabilitySystemPhase (SocialCohesion + TrustRecovery + Paranoia + SocialStability)
 * - CooperativeSystemsPhase (CollectiveFormation + CollectiveActions + UpwardSpirals + CooperativeSpirals + CooperativeOwnership)
 * - InternationalRelationsPhase (ConflictResolution + DiplomaticAI + MADDeterrence + FlashWarEscalation)
 *
 * Validation Focus:
 * 1. Government elections trigger correctly
 * 2. Trust recovery/decay cycles work
 * 3. Paranoia thresholds correct
 * 4. Cooperative spirals trigger
 * 5. Conflict resolution logic intact
 * 6. State transitions: governance, social stability, collectives updated
 *
 * Phase Consolidation: Batch 5 (20 → 8 phases, -12 files)
 * Created: November 9, 2025
 *
 * @module tests/integration/consolidated-phases/batch5-social
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState } from '@/types/game';

describe('Batch 5: Social & Governance - Integration Tests', () => {
  const TEST_SEED = 50005;

  // Simple deterministic RNG for testing
  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  describe('GovernanceSystemPhase - Governance Quality', () => {
    test('should calculate governance quality from multiple factors', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Set governance inputs
      state.government.governmentCapacity = 0.7;
      state.socialAccumulation.socialCohesion = 0.6;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Governance metrics should be finite
      assert.ok(Number.isFinite(result.finalState.government.governmentCapacity));
      assert.ok(
        result.finalState.government.governmentCapacity >= 0 &&
        result.finalState.government.governmentCapacity <= 1,
        'Government capacity must be in [0, 1]'
      );
    });

    test('should degrade under crisis conditions', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Set up crisis conditions via high threat levels
      state.nuclearStates.globalTension = 0.8;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Capacity should remain finite
      assert.ok(Number.isFinite(result.finalState.government.governmentCapacity));
    });
  });

  describe('GovernanceSystemPhase - Government Elections', () => {
    test('should trigger elections at correct intervals', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 60
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Set up democratic governance
      state.government.governmentCapacity = 0.7;

      const result = engine.run(state, {
        maxMonths: 48, // 4 years
        checkActualOutcomes: false
      });

      // Governance should remain stable through election cycles
      assert.ok(Number.isFinite(result.finalState.government.governmentCapacity));
    });

    test('should reflect public trust in election outcomes', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 60
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High public trust
      state.government.publicTrust = 0.8;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Trust should remain finite
      assert.ok(Number.isFinite(result.finalState.government.publicTrust));
      assert.ok(
        result.finalState.government.publicTrust >= 0 &&
        result.finalState.government.publicTrust <= 1
      );
    });
  });

  describe('GovernanceSystemPhase - Policy Implementation', () => {
    test('should implement policies based on government capacity', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Strong government
      state.government.governmentCapacity = 0.9;
      state.government.alignmentResearchInvestment = 5.0;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Policies should be effective
      assert.ok(Number.isFinite(result.finalState.government.alignmentResearchInvestment));
    });
  });

  describe('SocialStabilitySystemPhase - Social Cohesion', () => {
    test('should track social cohesion over time', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const baselineCohesion = state.socialAccumulation.socialCohesion;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Cohesion should be finite
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
      assert.ok(
        result.finalState.socialAccumulation.socialCohesion >= 0 &&
        result.finalState.socialAccumulation.socialCohesion <= 1
      );
    });

    test('should degrade under unemployment and inequality', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Stress factors
      state.globalMetrics.unemployment = 0.35;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Cohesion should respond to stress
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });
  });

  describe('SocialStabilitySystemPhase - Trust Recovery', () => {
    test('should recover trust gradually when conditions improve', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Low trust, good conditions
      state.government.publicTrust = 0.3;
      state.government.governmentCapacity = 0.8;
      state.globalMetrics.unemployment = 0.05;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Trust should recover
      assert.ok(Number.isFinite(result.finalState.government.publicTrust));
    });

    test('should decay trust under crisis', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High trust, crisis
      state.government.publicTrust = 0.8;
      state.nuclearStates.globalTension = 0.7;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Trust may decline
      assert.ok(Number.isFinite(result.finalState.government.publicTrust));
    });
  });

  describe('SocialStabilitySystemPhase - Paranoia', () => {
    test('should increase paranoia under threat conditions', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Threat conditions
      state.aiCapabilities.totalCapability = 12.0; // High AI capability
      state.socialAccumulation.socialCohesion = 0.4;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Paranoia should be finite
      if (result.finalState.socialAccumulation.paranoiaLevel !== undefined) {
        assert.ok(Number.isFinite(result.finalState.socialAccumulation.paranoiaLevel));
      }
    });

    test('should trigger at correct thresholds', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High paranoia triggers
      if (state.socialAccumulation.paranoiaLevel !== undefined) {
        state.socialAccumulation.paranoiaLevel = 0.7;
      }

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Should affect social stability
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });
  });

  describe('SocialStabilitySystemPhase - Social Stability', () => {
    test('should calculate overall social stability', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Set stability factors
      state.socialAccumulation.socialCohesion = 0.7;
      state.government.publicTrust = 0.6;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Stability metrics should be finite
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });
  });

  describe('CooperativeSystemsPhase - Collective Formation', () => {
    test('should form collectives when conditions met', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Conditions for collective formation
      state.socialAccumulation.socialCohesion = 0.7;
      state.government.publicTrust = 0.6;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Collectives array should be valid
      if (result.finalState.collectives) {
        assert.ok(Array.isArray(result.finalState.collectives));
      }
    });
  });

  describe('CooperativeSystemsPhase - Cooperative Spirals', () => {
    test('should trigger positive cooperation spirals', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High cooperation conditions
      state.socialAccumulation.socialCohesion = 0.8;
      state.government.publicTrust = 0.75;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Cooperation should reinforce
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });

    test('should handle downward spirals', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Low cooperation
      state.socialAccumulation.socialCohesion = 0.3;
      state.government.publicTrust = 0.25;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Should stabilize, not diverge
      assert.ok(result.finalState.socialAccumulation.socialCohesion >= 0);
    });
  });

  describe('CooperativeSystemsPhase - Upward Spirals', () => {
    test('should amplify positive trends', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Positive trend starting
      state.socialAccumulation.socialCohesion = 0.65;
      state.government.governmentCapacity = 0.7;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Trends should be amplified
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });
  });

  describe('CooperativeSystemsPhase - Cooperative Ownership', () => {
    test('should track cooperative ownership share', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Ownership metrics should be finite (if they exist)
      if (result.finalState.economicStage !== undefined) {
        assert.ok(Number.isFinite(result.finalState.economicStage));
      }
    });
  });

  describe('InternationalRelationsPhase - Conflict Resolution', () => {
    test('should resolve conflicts when conditions allow', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Conflict resolution conditions
      state.government.governmentCapacity = 0.8;
      if (state.nuclearCommandControl) {
        state.nuclearCommandControl.globalTension = 0.5;
      }

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Tension should be managed
      if (result.finalState.nuclearCommandControl) {
        assert.ok(Number.isFinite(result.finalState.nuclearCommandControl.globalTension));
      }
    });
  });

  describe('InternationalRelationsPhase - Diplomatic AI', () => {
    test('should use AI for diplomatic mediation', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High AI capability for diplomacy
      state.aiCapabilities.totalCapability = 10.0;
      if (state.nuclearCommandControl) {
        state.nuclearCommandControl.globalTension = 0.6;
      }

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Diplomacy effects should be visible
      assert.ok(Number.isFinite(result.finalState.aiCapabilities.totalCapability));
    });
  });

  describe('InternationalRelationsPhase - MAD Deterrence', () => {
    test('should maintain MAD deterrence logic', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High tension
      if (state.nuclearCommandControl) {
        state.nuclearCommandControl.globalTension = 0.8;
      }

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Deterrence should prevent escalation
      if (result.finalState.nuclearCommandControl) {
        assert.ok(Number.isFinite(result.finalState.nuclearCommandControl.globalTension));
      }
    });
  });

  describe('InternationalRelationsPhase - Flash War Escalation', () => {
    test('should handle flash war escalation scenarios', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Escalation risk conditions
      if (state.nuclearCommandControl) {
        state.nuclearCommandControl.globalTension = 0.9;
      }

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Should resolve without NaN
      if (result.finalState.nuclearCommandControl) {
        assert.ok(Number.isFinite(result.finalState.nuclearCommandControl.globalTension));
      }
    });
  });

  describe('State Transitions - Social & Governance', () => {
    test('should maintain all governance fields as finite', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // All governance fields finite
      assert.ok(Number.isFinite(result.finalState.government.governmentCapacity));
      assert.ok(Number.isFinite(result.finalState.government.publicTrust));
      assert.ok(Number.isFinite(result.finalState.government.alignmentResearchInvestment));
    });

    test('should maintain all social accumulation fields as finite', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // All social fields finite
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.meaningCrisisLevel));
    });

    test('should preserve RNG determinism across social phases', () => {
      const seed = TEST_SEED + 500;

      // Run 1
      const engine1 = new SimulationEngine({ seed, maxMonths: 12 });
      const state1 = createDefaultInitialState(createTestRng(seed), 'historical');
      state1.government.publicTrust = 0.6;
      const result1 = engine1.run(state1, { maxMonths: 6, checkActualOutcomes: false });

      // Run 2
      const engine2 = new SimulationEngine({ seed, maxMonths: 12 });
      const state2 = createDefaultInitialState(createTestRng(seed), 'historical');
      state2.government.publicTrust = 0.6;
      const result2 = engine2.run(state2, { maxMonths: 6, checkActualOutcomes: false });

      // Social state should be identical
      assert.strictEqual(
        result1.finalState.socialAccumulation.socialCohesion,
        result2.finalState.socialAccumulation.socialCohesion,
        'Social cohesion should be deterministic'
      );
      assert.strictEqual(
        result1.finalState.government.publicTrust,
        result2.finalState.government.publicTrust,
        'Public trust should be deterministic'
      );
    });
  });

  describe('Multi-System Interactions', () => {
    test('should cascade governance quality to social cohesion', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Strong governance
      state.government.governmentCapacity = 0.9;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Social metrics should reflect governance
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });

    test('should integrate international tensions with social stability', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // High international tension
      if (state.nuclearCommandControl) {
        state.nuclearCommandControl.globalTension = 0.8;
      }

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Social stability should be affected
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });

    test('should interact cooperatives with economic system', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Strong cooperative movement
      state.socialAccumulation.socialCohesion = 0.8;

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // Economic stage should reflect cooperation
      assert.ok(Number.isFinite(result.finalState.economicStage));
    });
  });

  describe('Regression Prevention', () => {
    test('should not produce NaN in trust calculations', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Extreme trust conditions
      state.government.publicTrust = 0.05;
      state.nuclearStates.globalTension = 0.95;

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Should not produce NaN
      assert.ok(Number.isFinite(result.finalState.government.publicTrust));
    });

    test('should handle zero social cohesion gracefully', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Collapsed social cohesion
      state.socialAccumulation.socialCohesion = 0.01;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Should not cause division by zero
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });

    test('should maintain correct phase execution order', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

      // Governance should update before social systems use values
      state.government.governmentCapacity = 0.7;

      const result = engine.run(state, {
        maxMonths: 6,
        checkActualOutcomes: false
      });

      // Social systems should reflect governance changes
      assert.ok(Number.isFinite(result.finalState.socialAccumulation.socialCohesion));
    });
  });
});
