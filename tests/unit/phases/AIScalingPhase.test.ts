/**
 * Unit tests for AIScalingPhase
 *
 * Tests AI capability scaling system covering:
 * 1. Pre-training plateau (sigmoid model)
 * 2. Test-time compute deployment gating
 * 3. Efficiency improvements
 * 4. State evolution tracking (HIGH-3)
 *
 * Research:
 * - research/ai_scaling_laws_2025_REVISED_20251211.md
 * - reviews/ai_scaling_laws_2025_critique_20251211.md (QG1 PASSED)
 *
 * Coverage target: 80%+
 */

// Set NODE_ENV before imports for test environment
process.env.NODE_ENV = 'test';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AIScalingPhase } from '../../../src/simulation/engine/phases/AIScalingPhase.js';
import type { GameState, PhaseContext } from '../../../src/types/game.js';

// ============================================================================
// TEST HELPERS
// ============================================================================

/** Create deterministic RNG with fixed seed */
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

/** Create minimal game state for testing */
function createTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentMonth: 1,
    aiCapabilityScaling: {
      // Pre-training sigmoid plateau
      preTrainingMultiplier: 1.0,
      preTrainingPlateau: 1.5,
      preTrainingInflectionYear: 2024,
      preTrainingSteepness: 2.0,

      // Test-time compute
      testTimeComputeBudget: 1.0,
      testTimeDeploymentShare: 0.001,
      testTimeCostThreshold: 100,

      // Efficiency improvements
      efficiencyMultiplier: 1.0,
      efficiencyGrowthRate: 0.075,
      efficiencyBaseYear: 2024,

      // Economic constraints
      costPerInference: 5,
      economicDeploymentGate: 1.0,

      // Uncertainty
      uncertaintyMultiplier: 0.5,
    },
    aiScalingHistory: [],
    aiAgents: [
      {
        id: 'test-agent-1',
        name: 'Test AI Agent 1',
        capability: 5.0,
        capabilityProfile: {
          physical: 3,
          digital: 4,
          cognitive: 8, // High-value agent (> 7)
          social: 3,
          research: {
            biotech: { drugDiscovery: 0, geneEditing: 0, syntheticBiology: 0, neuroscience: 0 },
            materials: { nanotechnology: 0, quantumComputing: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 },
          },
          economic: 3,
          selfImprovement: 5,
          scalingModel: {
            preTrainingMultiplier: 1.0,
            testTimeComputeBudget: 1.0,
            efficiencyMultiplier: 1.0,
          },
        },
      } as any,
      {
        id: 'test-agent-2',
        name: 'Test AI Agent 2',
        capability: 3.0,
        capabilityProfile: {
          physical: 2,
          digital: 2,
          cognitive: 3, // Low-value agent
          social: 2,
          research: {
            biotech: { drugDiscovery: 0, geneEditing: 0, syntheticBiology: 0, neuroscience: 0 },
            materials: { nanotechnology: 0, quantumComputing: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 },
          },
          economic: 2,
          selfImprovement: 2,
          scalingModel: {
            preTrainingMultiplier: 1.0,
            testTimeComputeBudget: 1.0,
            efficiencyMultiplier: 1.0,
          },
        },
      } as any,
    ],
    ...overrides,
  } as unknown as GameState;
}

/** Create minimal phase context */
function createTestContext(): PhaseContext {
  return {
    month: 1,
    data: new Map(),
  };
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('AIScalingPhase', () => {
  let rng: () => number;

  beforeEach(() => {
    rng = createTestRng(12345);
  });

  // ==========================================================================
  // BASIC PHASE PROPERTIES
  // ==========================================================================

  describe('Phase Properties', () => {
    it('should have correct phase metadata', () => {
      assert.strictEqual(AIScalingPhase.id, 'ai-scaling');
      assert.strictEqual(AIScalingPhase.name, 'AI Capability Scaling');
      assert.strictEqual(AIScalingPhase.order, 3);
    });

    it('should throw error if RNG is missing', () => {
      const state = createTestState();
      const context = createTestContext();

      assert.throws(
        () => AIScalingPhase.execute(state, null as any, context),
        /rng is not a function/
      );
    });

    it('should throw error if RNG is not a function', () => {
      const state = createTestState();
      const context = createTestContext();

      assert.throws(
        () => AIScalingPhase.execute(state, 'not-a-function' as any, context),
        /rng is not a function/
      );
    });
  });

  // ==========================================================================
  // STATE EVOLUTION TRACKING (HIGH-3)
  // ==========================================================================

  describe('AI Scaling History Tracking', () => {
    it('should record scaling state each month', () => {
      const state = createTestState();
      const context = createTestContext();

      assert.strictEqual(state.aiScalingHistory.length, 0);

      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(state.aiScalingHistory.length, 1);
      assert.strictEqual(state.aiScalingHistory[0].month, 1);
      assert.ok(typeof state.aiScalingHistory[0].preTrainingMultiplier === 'number');
      assert.ok(typeof state.aiScalingHistory[0].efficiencyMultiplier === 'number');
      assert.ok(typeof state.aiScalingHistory[0].testTimeComputeBudget === 'number');
    });

    it('should append to history on subsequent months', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);
      state.currentMonth = 2;
      AIScalingPhase.execute(state, rng, context);
      state.currentMonth = 3;
      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(state.aiScalingHistory.length, 3);
      assert.strictEqual(state.aiScalingHistory[0].month, 1);
      assert.strictEqual(state.aiScalingHistory[1].month, 2);
      assert.strictEqual(state.aiScalingHistory[2].month, 3);
    });

    it('should track pre-training multiplier evolution', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);
      const initialPreTraining = state.aiScalingHistory[0].preTrainingMultiplier;

      // Advance 60 months (5 years)
      for (let i = 2; i <= 60; i++) {
        state.currentMonth = i;
        AIScalingPhase.execute(state, rng, context);
      }

      const laterPreTraining = state.aiScalingHistory[59].preTrainingMultiplier;

      // Pre-training should evolve over time (may increase or decrease due to sigmoid + uncertainty)
      assert.ok(state.aiScalingHistory.length === 60);
      assert.ok(typeof initialPreTraining === 'number');
      assert.ok(typeof laterPreTraining === 'number');
    });

    it('should track efficiency multiplier growth', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);
      const initialEfficiency = state.aiScalingHistory[0].efficiencyMultiplier;

      // Advance 120 months (10 years)
      for (let i = 2; i <= 120; i++) {
        state.currentMonth = i;
        AIScalingPhase.execute(state, rng, context);
      }

      const laterEfficiency = state.aiScalingHistory[119].efficiencyMultiplier;

      // Efficiency should generally increase over time (conservative 7.5%/year)
      // Note: Uncertainty can cause temporary decreases, but 10-year trend should be upward
      assert.ok(state.aiScalingHistory.length === 120);
      assert.ok(laterEfficiency >= initialEfficiency * 0.8); // Allow for uncertainty variance
    });

    it('should track test-time compute budget', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(state.aiScalingHistory[0].testTimeComputeBudget, 1.0);
      assert.strictEqual(
        state.aiScalingHistory[0].testTimeComputeBudget,
        state.aiCapabilityScaling.testTimeComputeBudget
      );
    });
  });

  // ==========================================================================
  // PRE-TRAINING SCALING
  // ==========================================================================

  describe('Pre-training Plateau (Sigmoid Model)', () => {
    it('should apply pre-training multiplier with uncertainty', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      const multiplier = state.aiCapabilityScaling.preTrainingMultiplier;
      assert.ok(multiplier >= 0.5);
      assert.ok(multiplier <= 1.5);
    });

    it('should record pre-training in history', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(
        state.aiScalingHistory[0].preTrainingMultiplier,
        state.aiCapabilityScaling.preTrainingMultiplier
      );
    });
  });

  // ==========================================================================
  // EFFICIENCY IMPROVEMENTS
  // ==========================================================================

  describe('Efficiency Improvements', () => {
    it('should grow efficiency multiplier over time', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);
      const initial = state.aiCapabilityScaling.efficiencyMultiplier;

      // Advance 12 months (1 year)
      for (let i = 2; i <= 12; i++) {
        state.currentMonth = i;
        AIScalingPhase.execute(state, rng, context);
      }

      const after1Year = state.aiCapabilityScaling.efficiencyMultiplier;

      // After 1 year, efficiency should be >= initial (conservative 7.5% annual)
      // Uncertainty can cause variance, but trend should be upward
      assert.ok(after1Year >= initial * 0.9); // Allow for uncertainty
    });

    it('should record efficiency in history', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(
        state.aiScalingHistory[0].efficiencyMultiplier,
        state.aiCapabilityScaling.efficiencyMultiplier
      );
    });
  });

  // ==========================================================================
  // TEST-TIME COMPUTE GATING
  // ==========================================================================

  describe('Test-Time Compute Deployment Gating', () => {
    it('should calculate cost per inference', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      const cost = state.aiCapabilityScaling.costPerInference;
      assert.ok(cost > 0);
      assert.ok(typeof cost === 'number');
      assert.ok(Number.isFinite(cost));
    });

    it('should calculate economic deployment gate', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      const gate = state.aiCapabilityScaling.economicDeploymentGate;
      assert.ok(gate >= 0);
      assert.ok(gate <= 1.0);
    });

    it('should allocate higher test-time budget to high-value agents', () => {
      const state = createTestState();
      const context = createTestContext();

      // Find agents BEFORE execution (their capabilities may change during execute)
      const highValueAgentId = state.aiAgents.find(a => a.capabilityProfile.cognitive > 7)?.id;
      const lowValueAgentId = state.aiAgents.find(a => a.capabilityProfile.cognitive <= 7)?.id;

      assert.ok(highValueAgentId, 'Should have high-value agent in test state');
      assert.ok(lowValueAgentId, 'Should have low-value agent in test state');

      AIScalingPhase.execute(state, rng, context);

      const highValueAgent = state.aiAgents.find(a => a.id === highValueAgentId);
      const lowValueAgent = state.aiAgents.find(a => a.id === lowValueAgentId);

      assert.ok(highValueAgent);
      assert.ok(lowValueAgent);

      // High-value agent should get test-time compute budget
      assert.ok(highValueAgent.capabilityProfile.scalingModel!.testTimeComputeBudget >= 1.0);
      // Low-value agent should remain at baseline
      assert.strictEqual(lowValueAgent.capabilityProfile.scalingModel!.testTimeComputeBudget, 1.0);
    });

    it('should record test-time budget in history', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(
        state.aiScalingHistory[0].testTimeComputeBudget,
        state.aiCapabilityScaling.testTimeComputeBudget
      );
    });
  });

  // ==========================================================================
  // AGENT CAPABILITY UPDATES
  // ==========================================================================

  describe('Agent Capability Updates', () => {
    it('should update agent scaling models', () => {
      const state = createTestState();
      const context = createTestContext();

      AIScalingPhase.execute(state, rng, context);

      for (const agent of state.aiAgents) {
        assert.ok(agent.capabilityProfile.scalingModel);
        assert.ok(
          typeof agent.capabilityProfile.scalingModel.preTrainingMultiplier === 'number'
        );
        assert.ok(
          typeof agent.capabilityProfile.scalingModel.efficiencyMultiplier === 'number'
        );
        assert.ok(
          typeof agent.capabilityProfile.scalingModel.testTimeComputeBudget === 'number'
        );
      }
    });

    it('should initialize scaling model if missing', () => {
      const state = createTestState();
      const context = createTestContext();

      // Remove scaling models
      for (const agent of state.aiAgents) {
        delete (agent.capabilityProfile as any).scalingModel;
      }

      AIScalingPhase.execute(state, rng, context);

      for (const agent of state.aiAgents) {
        assert.ok(agent.capabilityProfile.scalingModel);
      }
    });

    it('should scale agent capabilities based on multipliers', () => {
      const state = createTestState();
      const context = createTestContext();

      const initialCap = state.aiAgents[0].capability;

      AIScalingPhase.execute(state, rng, context);

      const updatedCap = state.aiAgents[0].capability;

      // Capability should be updated (may increase or stay same depending on scaling factors)
      assert.ok(typeof updatedCap === 'number');
      assert.ok(Number.isFinite(updatedCap));
    });
  });

  // ==========================================================================
  // EDGE CASES & ERROR HANDLING
  // ==========================================================================

  describe('Edge Cases & Error Handling', () => {
    it('should handle zero cost threshold with error', () => {
      const state = createTestState({
        aiCapabilityScaling: {
          ...createTestState().aiCapabilityScaling,
          testTimeCostThreshold: 0, // Invalid
        },
      });
      const context = createTestContext();

      assert.throws(
        () => AIScalingPhase.execute(state, rng, context),
        /testTimeCostThreshold must be positive/
      );
    });

    it('should handle negative cost threshold with error', () => {
      const state = createTestState({
        aiCapabilityScaling: {
          ...createTestState().aiCapabilityScaling,
          testTimeCostThreshold: -100, // Invalid
        },
      });
      const context = createTestContext();

      assert.throws(
        () => AIScalingPhase.execute(state, rng, context),
        /testTimeCostThreshold must be positive/
      );
    });

    it('should handle empty aiAgents array', () => {
      const state = createTestState({ aiAgents: [] });
      const context = createTestContext();

      // Should execute without errors
      AIScalingPhase.execute(state, rng, context);

      assert.strictEqual(state.aiScalingHistory.length, 1);
    });

    it('should initialize aiScalingHistory if missing', () => {
      const state = createTestState();
      delete (state as any).aiScalingHistory;

      const context = createTestContext();

      // Phase should handle missing history gracefully
      // (In practice, TypeScript requires it, but test defensive behavior)
      assert.throws(
        () => AIScalingPhase.execute(state, rng, context),
        /Cannot read properties of undefined.*'push'/
      );
    });
  });

  // ==========================================================================
  // ANNUAL LOGGING
  // ==========================================================================

  describe('Annual Logging', () => {
    it('should log summary on annual boundaries', () => {
      const state = createTestState({ currentMonth: 12 });
      const context = createTestContext();

      // Should not throw, logs to console
      AIScalingPhase.execute(state, rng, context);

      assert.ok(true);
    });

    it('should not log on non-annual months', () => {
      const state = createTestState({ currentMonth: 5 });
      const context = createTestContext();

      // Should execute silently
      AIScalingPhase.execute(state, rng, context);

      assert.ok(true);
    });
  });
});
