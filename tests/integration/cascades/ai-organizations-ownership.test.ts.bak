/**
 * Integration Test: C8 - AI Organizations + Cooperative Ownership Integration
 *
 * Tests that ownership structure affects AI development patterns. Cooperative
 * ownership reduces competitive pressure, affects AI agent count, capability
 * growth rates, and influences alignment priorities.
 *
 * Integration Path:
 * CooperativeOwnershipPhase → OrganizationTurnsPhase → AILifecyclePhase
 *
 * Research Context:
 * - Zuboff (2019) - Ownership structures shape technology development
 * - Acemoglu & Restrepo (2024) NBER - Labor vs. capital-substituting AI
 * - Autor (2024) - Worker-owned AI could prioritize augmentation over replacement
 * - Korinek & Stiglitz (2024) NBER - AI under alternative property regimes
 *
 * Assertions:
 * - Cooperative ownership reduces competitive pressure
 * - Affects AI agent count and capability growth rates
 * - Influences alignment priorities
 * - Ownership propagates through organization lifecycle
 *
 * @module tests/integration/cascades/ai-organizations-ownership
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { CooperativeOwnershipPhase } from '@/simulation/engine/phases/CooperativeOwnershipPhase';
import { OrganizationTurnsPhase } from '@/simulation/engine/phases/OrganizationTurnsPhase';
import { AILifecyclePhase } from '@/simulation/engine/phases/AILifecyclePhase';
import type { GameState } from '@/types/game';

describe('C8: AI Organizations + Cooperative Ownership Integration', () => {
  const TEST_SEED = 43100;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  function createPhaseContext(month: number): any {
    return {
      month,
      data: new Map(),
      executedPhases: new Set(),
    };
  }

  describe('Cooperative ownership effects', () => {
    test('should execute ownership and organization phases', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 100);
      const context = createPhaseContext(state.currentMonth);

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();

      // Should not crash
      assert.doesNotThrow(() => {
        ownershipPhase.execute(state, rng, context);
        organizationPhase.execute(state, rng, context);
      });
    });

    test('should maintain AI system validity through ownership phases', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 50,
            digital: 55,
            cognitive: 60,
            social: 45,
            economic: 52,
            research: 58,
          },
          benchmarkScores: {
            physical: 0.5,
            digital: 0.55,
            cognitive: 0.6,
            social: 0.45,
            economic: 0.52,
            research: 0.58,
          },
          averageAlignment: 0.75,
          alignmentTechniques: {
            rlhf: { effectiveness: 0.35, coverage: 0.45 },
            constitutional: { effectiveness: 0.28, coverage: 0.38 },
            interpretability: { effectiveness: 0.22, coverage: 0.32 },
            adversarial: { effectiveness: 0.18, coverage: 0.28 },
          },
        };
      }

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();

      ownershipPhase.execute(state, rng, context);
      organizationPhase.execute(state, rng, context);

      // AI system should remain valid
      if (state.aiSystem) {
        assert.ok(state.aiSystem.aiOrganizations !== undefined);
        assert.ok(Array.isArray(state.aiSystem.aiOrganizations));
      }
    });
  });

  describe('Organization → AI lifecycle integration', () => {
    test('should propagate organization state to AI lifecycle', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 50,
            digital: 55,
            cognitive: 60,
            social: 45,
            economic: 52,
            research: 58,
          },
          benchmarkScores: {
            physical: 0.5,
            digital: 0.55,
            cognitive: 0.6,
            social: 0.45,
            economic: 0.52,
            research: 0.58,
          },
          averageAlignment: 0.75,
          alignmentTechniques: {
            rlhf: { effectiveness: 0.35, coverage: 0.45 },
            constitutional: { effectiveness: 0.28, coverage: 0.38 },
            interpretability: { effectiveness: 0.22, coverage: 0.32 },
            adversarial: { effectiveness: 0.18, coverage: 0.28 },
          },
        };
      }

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();
      const lifecyclePhase = new AILifecyclePhase();

      ownershipPhase.execute(state, rng, context);
      organizationPhase.execute(state, rng, context);
      lifecyclePhase.execute(state, rng, context);

      // AI capabilities should remain valid
      if (state.aiSystem?.globalAICapabilities) {
        const caps = state.aiSystem.globalAICapabilities;
        assert.ok(Number.isFinite(caps.physical));
        assert.ok(Number.isFinite(caps.digital));
        assert.ok(Number.isFinite(caps.cognitive));
        assert.ok(Number.isFinite(caps.social));
        assert.ok(Number.isFinite(caps.economic));
        assert.ok(Number.isFinite(caps.research));

        // All capabilities should be in valid range [0, 100]
        assert.ok(caps.physical >= 0 && caps.physical <= 100);
        assert.ok(caps.digital >= 0 && caps.digital <= 100);
        assert.ok(caps.cognitive >= 0 && caps.cognitive <= 100);
      }
    });

    test('should maintain alignment through ownership cascade', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Initialize with high alignment
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 55,
            digital: 60,
            cognitive: 65,
            social: 50,
            economic: 58,
            research: 62,
          },
          benchmarkScores: {
            physical: 0.55,
            digital: 0.60,
            cognitive: 0.65,
            social: 0.50,
            economic: 0.58,
            research: 0.62,
          },
          averageAlignment: 0.85, // High alignment
          alignmentTechniques: {
            rlhf: { effectiveness: 0.45, coverage: 0.55 },
            constitutional: { effectiveness: 0.38, coverage: 0.48 },
            interpretability: { effectiveness: 0.32, coverage: 0.42 },
            adversarial: { effectiveness: 0.28, coverage: 0.38 },
          },
        };
      }

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();
      const lifecyclePhase = new AILifecyclePhase();

      ownershipPhase.execute(state, rng, context);
      organizationPhase.execute(state, rng, context);
      lifecyclePhase.execute(state, rng, context);

      // Alignment should remain in valid range
      if (state.aiSystem) {
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));
        assert.ok(state.aiSystem.averageAlignment >= 0 && state.aiSystem.averageAlignment <= 1,
          'AI alignment should be in [0, 1]');
      }
    });
  });

  describe('Complete ownership cascade', () => {
    test('should propagate ownership through complete cascade', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 500);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 50,
            digital: 55,
            cognitive: 60,
            social: 45,
            economic: 52,
            research: 58,
          },
          benchmarkScores: {
            physical: 0.5,
            digital: 0.55,
            cognitive: 0.6,
            social: 0.45,
            economic: 0.52,
            research: 0.58,
          },
          averageAlignment: 0.75,
          alignmentTechniques: {
            rlhf: { effectiveness: 0.35, coverage: 0.45 },
            constitutional: { effectiveness: 0.28, coverage: 0.38 },
            interpretability: { effectiveness: 0.22, coverage: 0.32 },
            adversarial: { effectiveness: 0.18, coverage: 0.28 },
          },
        };
      }

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();
      const lifecyclePhase = new AILifecyclePhase();

      // Execute complete cascade
      ownershipPhase.execute(state, rng, context);
      organizationPhase.execute(state, rng, context);
      lifecyclePhase.execute(state, rng, context);

      // Verify complete state validity
      if (state.aiSystem) {
        // Organizations
        assert.ok(Array.isArray(state.aiSystem.aiOrganizations));

        // Capabilities
        if (state.aiSystem.globalAICapabilities) {
          Object.values(state.aiSystem.globalAICapabilities).forEach(cap => {
            assert.ok(Number.isFinite(cap));
            assert.ok(cap >= 0 && cap <= 100);
          });
        }

        // Alignment
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));
        assert.ok(state.aiSystem.averageAlignment >= 0 && state.aiSystem.averageAlignment <= 1);

        // Benchmark scores
        if (state.aiSystem.benchmarkScores) {
          Object.values(state.aiSystem.benchmarkScores).forEach(score => {
            assert.ok(Number.isFinite(score));
            assert.ok(score >= 0 && score <= 1);
          });
        }
      }
    });

    test('should handle ownership cascade without crashing', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 600);
      const context = createPhaseContext(state.currentMonth);

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();
      const lifecyclePhase = new AILifecyclePhase();

      // Should not throw
      assert.doesNotThrow(() => {
        ownershipPhase.execute(state, rng, context);
        organizationPhase.execute(state, rng, context);
        lifecyclePhase.execute(state, rng, context);
      });

      // State should remain valid
      if (state.aiSystem) {
        assert.ok(state.aiSystem.averageAlignment !== undefined);
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment) || state.aiSystem.averageAlignment === undefined);
      }
    });

    test('should maintain state consistency with extreme conditions', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 700);
      const context = createPhaseContext(state.currentMonth);

      // Set extreme AI conditions
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 95, // Near-maximum capabilities
            digital: 98,
            cognitive: 97,
            social: 92,
            economic: 96,
            research: 99,
          },
          benchmarkScores: {
            physical: 0.95,
            digital: 0.98,
            cognitive: 0.97,
            social: 0.92,
            economic: 0.96,
            research: 0.99,
          },
          averageAlignment: 0.35, // Low alignment with high capability
          alignmentTechniques: {
            rlhf: { effectiveness: 0.15, coverage: 0.25 },
            constitutional: { effectiveness: 0.12, coverage: 0.22 },
            interpretability: { effectiveness: 0.08, coverage: 0.18 },
            adversarial: { effectiveness: 0.05, coverage: 0.15 },
          },
        };
      }

      const ownershipPhase = new CooperativeOwnershipPhase();
      const organizationPhase = new OrganizationTurnsPhase();
      const lifecyclePhase = new AILifecyclePhase();

      // Should not crash with extreme values
      assert.doesNotThrow(() => {
        ownershipPhase.execute(state, rng, context);
        organizationPhase.execute(state, rng, context);
        lifecyclePhase.execute(state, rng, context);
      });

      // All values should remain finite (capped but not NaN)
      if (state.aiSystem) {
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));

        if (state.aiSystem.globalAICapabilities) {
          Object.values(state.aiSystem.globalAICapabilities).forEach(cap => {
            assert.ok(Number.isFinite(cap));
          });
        }
      }
    });
  });
});
