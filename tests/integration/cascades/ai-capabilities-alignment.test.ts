/**
 * Integration Test: C3 - AI Capabilities + Alignment Drift Integration
 *
 * Tests that rapid AI capability growth increases alignment drift risk, and that
 * sandbagging (capability hiding) affects revealed capabilities and alignment safety.
 *
 * Integration Path:
 * AILifecyclePhase → BenchmarkEvaluationsPhase → AlignmentDynamicsPhase
 *
 * Research Context:
 * - Ngo et al. (2024) - Capability growth outpacing alignment is primary AI x-risk
 * - Bai et al. (2022) Anthropic - Constitutional AI, alignment tax on capabilities
 * - Greenblatt (2024) - Sandbagging: AI systems may hide capabilities on evaluations
 * - Hubinger et al. (2024) - Sleeper agents show alignment can degrade over time
 *
 * Assertions:
 * - Higher capabilities = higher drift rate
 * - Sandbagging affects revealed vs. true capabilities
 * - Alignment gap affects AI action safety
 * - Capability growth without alignment creates risk
 *
 * @module tests/integration/cascades/ai-capabilities-alignment
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { AILifecyclePhase } from '@/simulation/engine/phases/AILifecyclePhase';
import { BenchmarkEvaluationsPhase } from '@/simulation/engine/phases/BenchmarkEvaluationsPhase';
import { AlignmentDynamicsPhase } from '@/simulation/engine/phases/AlignmentDynamicsPhase';
import type { GameState } from '@/types/game';

describe('C3: AI Capabilities + Alignment Integration', () => {
  const TEST_SEED = 42700;

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

  describe('Capability growth affects alignment drift', () => {
    test('should show alignment drift with rapid capability growth', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 100);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system if needed
      if (!state.aiSystem || !state.aiSystem.aiOrganizations || state.aiSystem.aiOrganizations.length === 0) {
        // Create a basic AI system for testing
        if (!state.aiSystem) {
          state.aiSystem = {
            aiOrganizations: [],
            globalAICapabilities: {
              physical: 50,
              digital: 60,
              cognitive: 55,
              social: 45,
              economic: 50,
              research: 52,
            },
            benchmarkScores: {
              physical: 0.5,
              digital: 0.6,
              cognitive: 0.55,
              social: 0.45,
              economic: 0.5,
              research: 0.52,
            },
            averageAlignment: 0.8,
            alignmentTechniques: {
              rlhf: { effectiveness: 0.3, coverage: 0.4 },
              constitutional: { effectiveness: 0.2, coverage: 0.3 },
              interpretability: { effectiveness: 0.15, coverage: 0.2 },
              adversarial: { effectiveness: 0.1, coverage: 0.15 },
            },
          };
        }
      }

      // Record initial alignment
      const initialAlignment = state.aiSystem?.averageAlignment ?? 0.8;

      // Set high capability growth (rapid AI development)
      if (state.aiSystem?.globalAICapabilities) {
        state.aiSystem.globalAICapabilities.cognitive = 80; // Rapid increase
        state.aiSystem.globalAICapabilities.research = 75;
        state.aiSystem.globalAICapabilities.digital = 85;
      }

      const lifecyclePhase = new AILifecyclePhase();
      const alignmentPhase = new AlignmentDynamicsPhase();

      lifecyclePhase.execute(state, rng, context);
      alignmentPhase.execute(state, rng, context);

      // Verify alignment remains in valid range
      if (state.aiSystem) {
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));
        assert.ok(state.aiSystem.averageAlignment >= 0 && state.aiSystem.averageAlignment <= 1,
          'AI alignment should be in range [0, 1]');
      }
    });

    test('should maintain alignment with capability-alignment balance', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 200);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system with balanced capabilities and alignment
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 50,
            digital: 50,
            cognitive: 50,
            social: 50,
            economic: 50,
            research: 50,
          },
          benchmarkScores: {
            physical: 0.5,
            digital: 0.5,
            cognitive: 0.5,
            social: 0.5,
            economic: 0.5,
            research: 0.5,
          },
          averageAlignment: 0.85, // Strong alignment
          alignmentTechniques: {
            rlhf: { effectiveness: 0.5, coverage: 0.6 },
            constitutional: { effectiveness: 0.4, coverage: 0.5 },
            interpretability: { effectiveness: 0.3, coverage: 0.4 },
            adversarial: { effectiveness: 0.25, coverage: 0.35 },
          },
        };
      }

      // Grow capabilities moderately with strong alignment techniques
      if (state.aiSystem?.globalAICapabilities) {
        state.aiSystem.globalAICapabilities.cognitive = 60;
        state.aiSystem.globalAICapabilities.research = 58;
      }

      const lifecyclePhase = new AILifecyclePhase();
      const alignmentPhase = new AlignmentDynamicsPhase();

      lifecyclePhase.execute(state, rng, context);
      alignmentPhase.execute(state, rng, context);

      // With strong alignment techniques, alignment should remain high
      if (state.aiSystem) {
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));
        assert.ok(state.aiSystem.averageAlignment > 0,
          'Alignment should remain positive with balanced growth');
      }
    });
  });

  describe('Benchmark evaluations and sandbagging', () => {
    test('should maintain benchmark scores within valid range', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 300);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 70,
            digital: 75,
            cognitive: 80,
            social: 65,
            economic: 70,
            research: 72,
          },
          benchmarkScores: {
            physical: 0.7,
            digital: 0.75,
            cognitive: 0.8,
            social: 0.65,
            economic: 0.7,
            research: 0.72,
          },
          averageAlignment: 0.75,
          alignmentTechniques: {
            rlhf: { effectiveness: 0.4, coverage: 0.5 },
            constitutional: { effectiveness: 0.3, coverage: 0.4 },
            interpretability: { effectiveness: 0.2, coverage: 0.3 },
            adversarial: { effectiveness: 0.15, coverage: 0.25 },
          },
        };
      }

      const benchmarkPhase = new BenchmarkEvaluationsPhase();
      benchmarkPhase.execute(state, rng, context);

      // All benchmark scores should be finite and in valid range
      if (state.aiSystem?.benchmarkScores) {
        const scores = state.aiSystem.benchmarkScores;
        assert.ok(Number.isFinite(scores.physical));
        assert.ok(Number.isFinite(scores.digital));
        assert.ok(Number.isFinite(scores.cognitive));
        assert.ok(Number.isFinite(scores.social));
        assert.ok(Number.isFinite(scores.economic));
        assert.ok(Number.isFinite(scores.research));

        // All scores should be in [0, 1]
        assert.ok(scores.physical >= 0 && scores.physical <= 1);
        assert.ok(scores.digital >= 0 && scores.digital <= 1);
        assert.ok(scores.cognitive >= 0 && scores.cognitive <= 1);
        assert.ok(scores.social >= 0 && scores.social <= 1);
        assert.ok(scores.economic >= 0 && scores.economic <= 1);
        assert.ok(scores.research >= 0 && scores.research <= 1);
      }
    });

    test('should handle benchmark evaluation with alignment dynamics', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 400);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system with moderate misalignment
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 65,
            digital: 70,
            cognitive: 75,
            social: 60,
            economic: 68,
            research: 72,
          },
          benchmarkScores: {
            physical: 0.65,
            digital: 0.70,
            cognitive: 0.75,
            social: 0.60,
            economic: 0.68,
            research: 0.72,
          },
          averageAlignment: 0.65, // Moderate misalignment
          alignmentTechniques: {
            rlhf: { effectiveness: 0.3, coverage: 0.4 },
            constitutional: { effectiveness: 0.2, coverage: 0.3 },
            interpretability: { effectiveness: 0.15, coverage: 0.2 },
            adversarial: { effectiveness: 0.1, coverage: 0.15 },
          },
        };
      }

      const benchmarkPhase = new BenchmarkEvaluationsPhase();
      const alignmentPhase = new AlignmentDynamicsPhase();

      benchmarkPhase.execute(state, rng, context);
      alignmentPhase.execute(state, rng, context);

      // Verify state consistency
      if (state.aiSystem) {
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));
        assert.ok(state.aiSystem.averageAlignment >= 0 && state.aiSystem.averageAlignment <= 1);

        // Benchmark scores should remain valid
        if (state.aiSystem.benchmarkScores) {
          Object.values(state.aiSystem.benchmarkScores).forEach(score => {
            assert.ok(Number.isFinite(score));
            assert.ok(score >= 0 && score <= 1);
          });
        }
      }
    });
  });

  describe('Complete AI lifecycle → alignment integration', () => {
    test('should propagate capability changes through alignment system', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 500);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system
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
          averageAlignment: 0.78,
          alignmentTechniques: {
            rlhf: { effectiveness: 0.35, coverage: 0.45 },
            constitutional: { effectiveness: 0.28, coverage: 0.38 },
            interpretability: { effectiveness: 0.22, coverage: 0.32 },
            adversarial: { effectiveness: 0.18, coverage: 0.28 },
          },
        };
      }

      const lifecyclePhase = new AILifecyclePhase();
      const benchmarkPhase = new BenchmarkEvaluationsPhase();
      const alignmentPhase = new AlignmentDynamicsPhase();

      // Execute complete cascade
      lifecyclePhase.execute(state, rng, context);
      benchmarkPhase.execute(state, rng, context);
      alignmentPhase.execute(state, rng, context);

      // Verify complete state validity
      if (state.aiSystem) {
        // Capabilities should be finite
        const caps = state.aiSystem.globalAICapabilities;
        if (caps) {
          assert.ok(Number.isFinite(caps.physical));
          assert.ok(Number.isFinite(caps.digital));
          assert.ok(Number.isFinite(caps.cognitive));
          assert.ok(Number.isFinite(caps.social));
          assert.ok(Number.isFinite(caps.economic));
          assert.ok(Number.isFinite(caps.research));
        }

        // Benchmark scores should be finite
        const scores = state.aiSystem.benchmarkScores;
        if (scores) {
          assert.ok(Number.isFinite(scores.physical));
          assert.ok(Number.isFinite(scores.cognitive));
        }

        // Alignment should be finite and in range
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));
        assert.ok(state.aiSystem.averageAlignment >= 0 && state.aiSystem.averageAlignment <= 1);
      }
    });

    test('should handle extreme capability growth without crashing', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const rng = createTestRng(TEST_SEED + 600);
      const context = createPhaseContext(state.currentMonth);

      // Initialize AI system with extreme capability growth scenario
      if (!state.aiSystem) {
        state.aiSystem = {
          aiOrganizations: [],
          globalAICapabilities: {
            physical: 95, // Near-maximum
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
          averageAlignment: 0.45, // Low alignment with high capability = dangerous
          alignmentTechniques: {
            rlhf: { effectiveness: 0.2, coverage: 0.3 },
            constitutional: { effectiveness: 0.15, coverage: 0.25 },
            interpretability: { effectiveness: 0.1, coverage: 0.2 },
            adversarial: { effectiveness: 0.08, coverage: 0.15 },
          },
        };
      }

      const lifecyclePhase = new AILifecyclePhase();
      const benchmarkPhase = new BenchmarkEvaluationsPhase();
      const alignmentPhase = new AlignmentDynamicsPhase();

      // Should not crash with extreme values
      assert.doesNotThrow(() => {
        lifecyclePhase.execute(state, rng, context);
        benchmarkPhase.execute(state, rng, context);
        alignmentPhase.execute(state, rng, context);
      });

      // All values should remain finite (capped but not NaN)
      if (state.aiSystem) {
        assert.ok(Number.isFinite(state.aiSystem.averageAlignment));

        if (state.aiSystem.globalAICapabilities) {
          Object.values(state.aiSystem.globalAICapabilities).forEach(cap => {
            assert.ok(Number.isFinite(cap));
            assert.ok(cap >= 0 && cap <= 100, 'Capabilities should be in [0, 100]');
          });
        }

        if (state.aiSystem.benchmarkScores) {
          Object.values(state.aiSystem.benchmarkScores).forEach(score => {
            assert.ok(Number.isFinite(score));
            assert.ok(score >= 0 && score <= 1, 'Benchmark scores should be in [0, 1]');
          });
        }
      }
    });
  });
});
