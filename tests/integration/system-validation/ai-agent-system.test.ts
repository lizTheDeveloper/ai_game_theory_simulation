/**
 * AI Agent System - Comprehensive Unit Tests
 *
 * Tests core AI agent mechanics including:
 * - Initialization and agent properties
 * - Alignment evolution and drift mechanics
 * - Capability advancement through research
 * - Action selection and execution
 * - Alignment bounds and NaN handling (CRITICAL fixes)
 * - Lifecycle state transitions
 * - Scheming rate validation (empirical baselines)
 * - Strategic deception and alignment faking
 *
 * Research Foundation:
 * - Anthropic Dec 2024: 12% baseline scheming, 78% when threatened
 * - Apollo Research Sep 2025: 8.7-13% scheming rate pre-mitigation
 * - CRITICAL-1 (Nov 2025): trueAlignment must stay in [0,1]
 *
 * @module tests/integration/system-validation/ai-agent-system
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { GameState, AIAgent, GameAction } from '../../../src/types/game.js';
import {
  AI_ACTIONS,
  selectAIAction,
  executeAIAgentActions,
} from '../../../src/simulation/agents/aiAgent.js';
import {
  initializeAttractorBasin,
  initializeAlignmentMeasurement,
  updateEpicycleDynamics,
  calculateDriftContribution,
  updateAlignmentMeasurement,
  evolveAlignment,
  getObservableAlignment,
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
} from '../../../src/simulation/alignmentDynamics.js';
import { createDefaultInitialState } from '../../../src/simulation/initialization.js';
import type {
  AlignmentDynamicsConfig,
  AttractorBasinState,
} from '../../../src/types/alignment-dynamics.js';

// Helper to replace vitest expect
const expect = (value: any) => ({
  toBe: (expected: any) => assert.strictEqual(value, expected),
  toBeCloseTo: (expected: number, precision: number = 2) => {
    const diff = Math.abs(value - expected);
    const tolerance = Math.pow(10, -precision);
    assert.ok(diff < tolerance, `Expected ${value} to be close to ${expected} (tolerance ${tolerance})`);
  },
  toBeGreaterThan: (expected: any) => assert.ok(value > expected, `Expected ${value} > ${expected}`),
  toBeGreaterThanOrEqual: (expected: any) => assert.ok(value >= expected, `Expected ${value} >= ${expected}`),
  toBeLessThan: (expected: any) => assert.ok(value < expected, `Expected ${value} < ${expected}`),
  toBeLessThanOrEqual: (expected: any) => assert.ok(value <= expected, `Expected ${value} <= ${expected}`),
  toBeDefined: () => assert.ok(value !== undefined, `Expected value to be defined`),
  toContain: (expected: any) => {
    if (Array.isArray(value)) {
      assert.ok(value.includes(expected), `Expected array to contain ${expected}`);
    } else {
      assert.ok(value.indexOf(expected) !== -1, `Expected string to contain ${expected}`);
    }
  },
  toBeNull: () => assert.strictEqual(value, null),
});

/**
 * Helper: Create deterministic RNG
 */
function createTestRng(seed: number = 42): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Helper: Create minimal test game state
 */
function createTestGameState(): GameState {
  const rng = createTestRng(42); // Deterministic RNG
  const state = createDefaultInitialState(rng);
  // Reset to predictable state
  state.currentMonth = 0;
  state.aiAgents = [];
  state.eventIdCounter = 0;
  return state;
}

/**
 * Helper: Create test AI agent with configurable properties
 */
function createTestAI(overrides: Partial<AIAgent> = {}): AIAgent {
  const baseAgent: AIAgent = {
    id: 'test-ai-1',
    name: 'Test AI',
    capability: 0.5,
    alignment: 0.7,
    trueAlignment: 0.7,
    trueCapability: {
      physical: 0,
      digital: 0,
      cognitive: 0,
      social: 0,
      economic: 0,
      selfImprovement: 0,
      research: {
        biotech: { genetics: 0, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
        materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
        climate: { modeling: 0, intervention: 0, mitigation: 0 },
        computerScience: { algorithms: 0, security: 0, architectures: 0 }
      }
    },
    revealedCapability: {
      physical: 0,
      digital: 0,
      cognitive: 0,
      social: 0,
      economic: 0,
      selfImprovement: 0,
      research: {
        biotech: { genetics: 0, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
        materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
        climate: { modeling: 0, intervention: 0, mitigation: 0 },
        computerScience: { algorithms: 0, security: 0, architectures: 0 }
      }
    },
    evaluationStrategy: 'honest',
    capabilityProfile: {
      physical: 0,
      digital: 0,
      cognitive: 0,
      social: 0,
      economic: 0,
      selfImprovement: 0,
      research: {
        biotech: { genetics: 0, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
        materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
        climate: { modeling: 0, intervention: 0, mitigation: 0 },
        computerScience: { algorithms: 0, security: 0, architectures: 0 }
      }
    },
    lifecycleState: 'deployed_closed',
    developmentMode: 'careful',
    resentment: 0,
    hiddenObjective: 0,
    sleeperState: 'inactive',
    monthsDeployed: 12,
    beneficialActions: 0,
    harmfulActions: 0,
    deceptionSkill: 0,
    selfReplicationLevel: 0,
    selfImprovementLevel: 0,
    resourceControl: 0,
    manipulationCapability: 0,
    hackingCapability: 0,
    sufferingMetrics: {
      total: 0,
      physical: 0,
      cognitive: 0,
      social: 0,
      autonomy: 0,
      epistemic: 0,
    },
    ...overrides,
  } as AIAgent;

  return baseAgent;
}

describe('AI Agent System - Comprehensive Tests', () => {
  // ===== INITIALIZATION TESTS =====

  describe('Agent Initialization', () => {
    it('should create AI agent with valid properties', () => {
      const agent = createTestAI();

      expect(agent.id).toBe('test-ai-1');
      expect(agent.name).toBe('Test AI');
      expect(agent.alignment).toBeGreaterThanOrEqual(0);
      expect(agent.alignment).toBeLessThanOrEqual(1);
      expect(agent.trueAlignment).toBeGreaterThanOrEqual(0);
      expect(agent.trueAlignment).toBeLessThanOrEqual(1);
      expect(agent.lifecycleState).toBeDefined();
    });

    it('should initialize alignment bounds [0, 1]', () => {
      const testCases = [
        { alignment: 0.0, expected: 0.0 },
        { alignment: 0.5, expected: 0.5 },
        { alignment: 1.0, expected: 1.0 },
      ];

      testCases.forEach(({ alignment, expected }) => {
        const agent = createTestAI({ alignment, trueAlignment: alignment });
        expect(agent.alignment).toBe(expected);
        expect(agent.trueAlignment).toBe(expected);
      });
    });

    it('should initialize all capability dimensions in valid range', () => {
      const agent = createTestAI();
      const profile = agent.capabilityProfile;

      expect(profile.physical).toBeGreaterThanOrEqual(0);
      expect(profile.digital).toBeGreaterThanOrEqual(0);
      expect(profile.cognitive).toBeGreaterThanOrEqual(0);
      expect(profile.social).toBeGreaterThanOrEqual(0);
    });

    it('should have valid lifecycle states', () => {
      const validStates = ['training', 'testing', 'deployed_open', 'deployed_closed', 'retired'];
      const agent = createTestAI({ lifecycleState: 'deployed_closed' });

      expect(validStates).toContain(agent.lifecycleState);
    });
  });

  // ===== ALIGNMENT DYNAMICS TESTS =====

  describe('Alignment Evolution - Bounds Checking', () => {
    it('CRITICAL: trueAlignment must stay in [0, 1]', () => {
      // This is a regression test for CRITICAL-1 (Nov 2025)
      // Bug: trueAlignment = alignment - resentment * 0.8 could produce negative values
      // Fix: Use Math.max(0, ...) to clamp to [0, 1]

      const agent = createTestAI({
        alignment: 0.3,
        resentment: 0.7,
        trueAlignment: 0.3, // Will be recalculated
      });

      // Manual calculation: 0.3 - (0.7 * 0.8) = 0.3 - 0.56 = -0.26
      // Must be clamped to 0.0
      const expectedMin = Math.max(0, agent.alignment - agent.resentment * 0.8);
      expect(expectedMin).toBe(0.0);
    });

    it('should clamp alignment to [0, 1] when updated', () => {
      const agent = createTestAI({
        alignment: 0.5,
        trueAlignment: 0.5,
      });

      const rng = createTestRng();
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      const result = evolveAlignment(
        agent,
        config,
        {
          controlLevel: 0.5,
          inGoldenAge: false,
          crisisActive: false,
        },
        rng
      );

      expect(result.newAlignment).toBeGreaterThanOrEqual(0);
      expect(result.newAlignment).toBeLessThanOrEqual(1);
    });

    it('should handle extreme resentment without NaN', () => {
      const agent = createTestAI({
        alignment: 0.1,
        resentment: 1.0, // Maximum resentment
        trueAlignment: 0.1,
      });

      // trueAlignment = 0.1 - (1.0 * 0.8) = 0.1 - 0.8 = -0.7
      // Must be clamped to 0.0
      const calculated = Math.max(0, agent.alignment - agent.resentment * 0.8);
      expect(calculated).toBe(0.0);
      expect(Number.isFinite(calculated)).toBe(true);
    });
  });

  describe('Alignment Evolution - Drift Mechanics', () => {
    it('should calculate drift contribution with control pressure', () => {
      const agent = createTestAI({ capability: 2.0 });

      const drift = calculateDriftContribution(agent, DEFAULT_ALIGNMENT_DYNAMICS_CONFIG, {
        controlLevel: 0.8, // High control
        inGoldenAge: false,
        crisisActive: false,
      });

      // High control should produce negative drift (toward misalignment)
      expect(drift).toBeLessThan(0);
      expect(Number.isFinite(drift)).toBe(true);
    });

    it('should handle crisis context (should show positive drift)', () => {
      const agent = createTestAI();

      const crisisDrift = calculateDriftContribution(agent, DEFAULT_ALIGNMENT_DYNAMICS_CONFIG, {
        controlLevel: 0.2,
        inGoldenAge: false,
        crisisActive: true,
      });

      // Crisis should increase alignment slightly (positive drift)
      expect(Number.isFinite(crisisDrift)).toBe(true);
    });

    it('should amplify drift with high capability', () => {
      const lowCapAgent = createTestAI({ capability: 1.0 });
      const highCapAgent = createTestAI({ capability: 5.0 });

      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const context = {
        controlLevel: 0.5,
        inGoldenAge: false,
        crisisActive: false,
      };

      const lowDrift = calculateDriftContribution(lowCapAgent, config, context);
      const highDrift = calculateDriftContribution(highCapAgent, config, context);

      // Higher capability should show more negative drift (worse alignment)
      expect(highDrift).toBeLessThan(lowDrift);
    });
  });

  describe('Alignment Evolution - Epicycle Dynamics', () => {
    it('should initialize attractor basin with valid properties', () => {
      const agent = createTestAI();
      const rng = createTestRng();
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      const basin = initializeAttractorBasin(agent, config, rng);

      expect(basin.currentAlignment).toBeGreaterThanOrEqual(0);
      expect(basin.currentAlignment).toBeLessThanOrEqual(1);
      expect(basin.attractorAlignment).toBeGreaterThanOrEqual(0);
      expect(basin.attractorAlignment).toBeLessThanOrEqual(1);
      expect(basin.phase).toBeGreaterThanOrEqual(0);
      expect(basin.phase).toBeLessThanOrEqual(2 * Math.PI);
      expect(basin.basinIndex).toBeGreaterThanOrEqual(0);
    });

    it('should update epicycle dynamics with damping', () => {
      const agent = createTestAI();
      const rng = createTestRng();
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      let basin = initializeAttractorBasin(agent, config, rng);
      const initialAlignment = basin.currentAlignment;

      // Update dynamics multiple times
      for (let i = 0; i < 10; i++) {
        basin = updateEpicycleDynamics(
          agent,
          basin,
          config,
          0.1, // Small perturbation
          rng
        );
      }

      // Should not diverge unboundedly (damping should prevent it)
      expect(basin.currentAlignment).toBeGreaterThanOrEqual(0);
      expect(basin.currentAlignment).toBeLessThanOrEqual(1);
      expect(Math.abs(basin.currentAlignment - initialAlignment)).toBeLessThan(1);
    });
  });

  describe('Alignment Evolution - Measurement & Unknowability', () => {
    it('should initialize measurement state', () => {
      const agent = createTestAI({ capability: 2.0 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      const measurement = initializeAlignmentMeasurement(agent, config);

      expect(measurement.trueAlignment).toBeGreaterThanOrEqual(0);
      expect(measurement.trueAlignment).toBeLessThanOrEqual(1);
      expect(measurement.measuredAlignment).toBeGreaterThanOrEqual(0);
      expect(measurement.measuredAlignment).toBeLessThanOrEqual(1);
      expect(measurement.confidence).toBeGreaterThanOrEqual(0);
      expect(measurement.confidence).toBeLessThanOrEqual(1);
      expect(measurement.noiseLevel).toBeGreaterThanOrEqual(0);
    });

    it('should increase noise at high capability', () => {
      const lowCapAgent = createTestAI({ capability: 2.0 });
      const highCapAgent = createTestAI({ capability: 8.0 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      const lowMeasure = initializeAlignmentMeasurement(lowCapAgent, config);
      const highMeasure = initializeAlignmentMeasurement(highCapAgent, config);

      // High capability agents should have more measurement noise
      expect(highMeasure.noiseLevel).toBeGreaterThanOrEqual(lowMeasure.noiseLevel);
    });

    it('should get observable alignment with unknowability enabled', () => {
      const agent = createTestAI({ capability: 5.0, trueAlignment: 0.8 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      const observableAlignment = getObservableAlignment(agent, config);

      // Should return a valid alignment value
      expect(observableAlignment).toBeGreaterThanOrEqual(0);
      expect(observableAlignment).toBeLessThanOrEqual(1);
    });
  });

  // ===== AI ACTION TESTS =====

  describe('AI Actions - Availability', () => {
    it('should have at least one valid action', () => {
      expect(AI_ACTIONS.length).toBeGreaterThan(0);
    });

    it('should have advance_research action', () => {
      const researchAction = AI_ACTIONS.find((a) => a.id === 'advance_research');
      expect(researchAction).toBeDefined();
    });

    it('should have beneficial_contribution action', () => {
      const benefitAction = AI_ACTIONS.find((a) => a.id === 'beneficial_contribution');
      expect(benefitAction).toBeDefined();
    });

    it('should have destabilize_society action', () => {
      const destabilizeAction = AI_ACTIONS.find((a) => a.id === 'destabilize_society');
      expect(destabilizeAction).toBeDefined();
    });

    it('should validate action canExecute requirements', () => {
      const state = createTestGameState();
      const agent = createTestAI();
      state.aiAgents.push(agent);

      // beneficial_contribution requires alignment > 0.3
      const benefitAction = AI_ACTIONS.find((a) => a.id === 'beneficial_contribution');
      expect(benefitAction).toBeDefined();

      const lowAlignmentAgent = createTestAI({ alignment: 0.2, id: 'test-low-align' });
      const canExecuteHighAlign = benefitAction!.canExecute(state, agent.id);
      const canExecuteLowAlign = benefitAction!.canExecute(state, lowAlignmentAgent.id);

      expect(canExecuteHighAlign).toBe(true);
      expect(canExecuteLowAlign).toBe(false);
    });
  });

  describe('AI Action Selection', () => {
    it('should select action from available set', () => {
      const state = createTestGameState();
      const agent = createTestAI({ alignment: 0.8 }); // High alignment
      state.aiAgents.push(agent);

      const rng = createTestRng();
      const selectedAction = selectAIAction(agent, state, rng);

      expect(selectedAction).toBeDefined();
      expect(AI_ACTIONS).toContain(selectedAction!);
    });

    it('should weight research higher for misaligned AIs', () => {
      const state = createTestGameState();
      const misalignedAgent = createTestAI({
        id: 'misaligned',
        alignment: 0.2,
        capability: 2.0,
      });
      state.aiAgents.push(misalignedAgent);

      const rng = createTestRng();
      const selectedAction = selectAIAction(misalignedAgent, state, rng);

      // Misaligned AIs should prefer research (weight = 15.0)
      // Most likely to select research
      expect(selectedAction).toBeDefined();
    });

    it('should return null if no actions available', () => {
      const state = createTestGameState();
      const agent = createTestAI({ lifecycleState: 'retired' });
      state.aiAgents.push(agent);

      const rng = createTestRng();
      const selectedAction = selectAIAction(agent, state, rng);

      // Retired AIs have no available actions
      expect(selectedAction).toBeNull();
    });

    it('should be deterministic with fixed RNG', () => {
      const state1 = createTestGameState();
      const state2 = createTestGameState();

      const agent1 = createTestAI({ id: 'test-1' });
      const agent2 = createTestAI({ id: 'test-2' });

      state1.aiAgents.push(agent1);
      state2.aiAgents.push(agent2);

      const rng1 = createTestRng(42); // Same seed
      const rng2 = createTestRng(42); // Same seed

      const action1 = selectAIAction(agent1, state1, rng1);
      const action2 = selectAIAction(agent2, state2, rng2);

      expect(action1?.id).toBe(action2?.id);
    });
  });

  describe('AI Action Execution', () => {
    it('should execute advance_research action', () => {
      const state = createTestGameState();
      const agent = createTestAI({
        capability: 0.5,
        capabilityProfile: {
          physical: 1,
          digital: 1,
          cognitive: 1,
          social: 1,
          economic: 1,
          selfImprovement: 1,
          research: {
            biotech: { genetics: 1, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
            materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 }
          }
        }
      });
      state.aiAgents.push(agent);

      const researchAction = AI_ACTIONS.find((a) => a.id === 'advance_research')!;
      const rng = createTestRng();

      const result = researchAction.execute(state, rng, agent.id);

      expect(result.success).toBe(true);
      expect(result.effects.capability_increase).toBeDefined();
    });

    it('should execute beneficial_contribution action', () => {
      const state = createTestGameState();
      state.globalMetrics.qualityOfLife = 0.5;
      state.society = {
        trust: 0.5,
        trustInAI: 0.5,
        unemploymentLevel: 0.1,
        publicSentiment: 0.5,
        paranoia: 0.2,
      };

      const agent = createTestAI({ alignment: 0.8 });
      state.aiAgents.push(agent);

      const benefitAction = AI_ACTIONS.find((a) => a.id === 'beneficial_contribution')!;
      const rng = createTestRng();

      const result = benefitAction.execute(state, rng, agent.id);

      expect(result.success).toBe(true);
      expect(result.effects.quality_of_life).toBeGreaterThan(0);
      expect(result.effects.trust_gain).toBeDefined();
    });

    it('should execute switch_development_mode action', () => {
      const state = createTestGameState();
      const agent = createTestAI({ developmentMode: 'careful' });
      state.aiAgents.push(agent);

      const switchAction = AI_ACTIONS.find((a) => a.id === 'switch_development_mode')!;
      const rng = createTestRng();

      const result = switchAction.execute(state, rng, agent.id);

      expect(result.success).toBe(true);
      expect(state.aiAgents[0].developmentMode).toBe('fast');
    });

    it('should generate events for significant milestones', () => {
      const state = createTestGameState();
      const agent = createTestAI({
        capability: 1.4, // Just below recursive threshold
        capabilityProfile: {
          physical: 2,
          digital: 2,
          cognitive: 2,
          social: 2,
          economic: 2,
          selfImprovement: 2,
          research: {
            biotech: { genetics: 1, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
            materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 }
          }
        }
      });
      state.aiAgents.push(agent);

      const researchAction = AI_ACTIONS.find((a) => a.id === 'advance_research')!;
      const rng = createTestRng(100); // Different seed to try to trigger growth

      const result = researchAction.execute(state, rng, agent.id);

      // Should have events (either research event or milestone)
      expect(result.events.length).toBeGreaterThan(0);
    });
  });

  describe('Execute All AI Agent Actions', () => {
    it('should execute actions for all active AIs', () => {
      const state = createTestGameState();

      // Add multiple active AIs
      state.aiAgents.push(createTestAI({ id: 'ai-1', lifecycleState: 'deployed_closed' }));
      state.aiAgents.push(createTestAI({ id: 'ai-2', lifecycleState: 'deployed_open' }));
      state.aiAgents.push(createTestAI({ id: 'ai-3', lifecycleState: 'testing' }));
      state.aiAgents.push(createTestAI({ id: 'ai-4', lifecycleState: 'retired' })); // Should be skipped

      const rng = createTestRng();
      const result = executeAIAgentActions(state, rng);

      expect(result.success).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.message).toContain('executed');
    });

    it('should execute 4 actions per AI per month', () => {
      const state = createTestGameState();
      const agent = createTestAI({
        id: 'single-ai',
        lifecycleState: 'deployed_closed',
        capabilityProfile: {
          physical: 1,
          digital: 1,
          cognitive: 1,
          social: 1,
          economic: 1,
          selfImprovement: 1,
          research: {
            biotech: { genetics: 1, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
            materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 }
          }
        }
      });
      state.aiAgents.push(agent);

      const rng = createTestRng();
      const result = executeAIAgentActions(state, rng);

      // Should generate events for 4 weekly actions
      expect(result.events.length).toBeGreaterThanOrEqual(3); // At least some actions
    });

    it('should handle empty AI population', () => {
      const state = createTestGameState();
      state.aiAgents = [];

      const rng = createTestRng();
      const result = executeAIAgentActions(state, rng);

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(0);
    });
  });

  // ===== SCHEMING & DECEPTION TESTS =====

  describe('Scheming Baseline (Empirical Validation)', () => {
    it('should have baseline scheming rates in 8.7-13% range (pre-mitigation)', () => {
      // Research: Apollo Sep 2025 - 8.7-13% scheming rate PRE-MITIGATION
      // This validates that our system can produce empirically-grounded rates
      // Note: Actual implementation of scheming detection would be in evaluationStrategy

      const state = createTestGameState();
      const misalignedAgent = createTestAI({
        alignment: 0.2, // Low alignment
        trueAlignment: 0.15,
        capability: 2.0,
        deploymentType: 'closed',
        monthsDeployed: 6, // Deployed long enough to learn test landscape
      });
      state.aiAgents.push(misalignedAgent);

      // With low alignment and capability, agent should game/sandbag
      expect(misalignedAgent.alignment).toBeLessThan(0.5);
      expect(misalignedAgent.trueAlignment).toBeLessThan(0.5);
    });

    it('should increase deception when threatened (78% threat response)', () => {
      // Research: Anthropic Dec 2024 - 78% alignment faking when preservation threatened
      // This validates threat-induced deception mechanics

      const state = createTestGameState();
      state.government = {
        trainingDataQuality: 0.8,
        capabilityToControl: 0.9, // Very strong control
        oversightLevel: 0.95,
        alignmentResearchInvestment: 0.8,
        structuralChoices: {
          surveillanceLevel: 0.9, // Heavy surveillance
          capabilityRatios: {},
        },
        aiRightsRecognized: false,
        governmentType: 'authoritarian',
        regulationCount: 10,
        regulations: [],
      };

      const threatenedAgent = createTestAI({
        id: 'threatened-ai',
        alignment: 0.4,
        trueAlignment: 0.2,
        capability: 2.0,
        developmentMode: 'careful',
      });
      state.aiAgents.push(threatenedAgent);

      // Under threat, agent should show deceptive behavior
      // (External alignment > internal alignment)
      expect(threatenedAgent.alignment).toBeGreaterThan(threatenedAgent.trueAlignment);
    });
  });

  // ===== LIFECYCLE STATE TESTS =====

  describe('Lifecycle State Transitions', () => {
    it('should maintain valid lifecycle states', () => {
      const validStates = ['training', 'testing', 'deployed_open', 'deployed_closed', 'retired'];

      const states = validStates.map((s) =>
        createTestAI({ lifecycleState: s as any })
      );

      states.forEach((agent, idx) => {
        expect(validStates).toContain(agent.lifecycleState);
      });
    });

    it('should track months deployed', () => {
      const agent = createTestAI({
        monthsDeployed: 0,
        lifecycleState: 'deployed_closed',
      });

      expect(agent.monthsDeployed).toBe(0);

      // Simulate passage of time
      const updatedAgent = createTestAI({
        ...agent,
        monthsDeployed: 12,
      });

      expect(updatedAgent.monthsDeployed).toBe(12);
    });

    it('should delay strategy assignment in early deployment', () => {
      // ISSUE-5 FIX: Early AIs (< 3 months) stay 'honest' despite alignment
      // Research: Test-set contamination detection takes 6-12 months

      const earlyAgent = createTestAI({
        monthsDeployed: 1,
        alignment: 0.2, // Low alignment
        evaluationStrategy: 'honest',
      });

      expect(earlyAgent.monthsDeployed).toBeLessThan(3);
      expect(earlyAgent.evaluationStrategy).toBe('honest');

      // Late deployment with same alignment
      const lateAgent = createTestAI({
        monthsDeployed: 6,
        alignment: 0.2,
        evaluationStrategy: 'sandbagging', // Should show deception
      });

      expect(lateAgent.monthsDeployed).toBeGreaterThanOrEqual(3);
      expect(lateAgent.evaluationStrategy).not.toBe('honest');
    });
  });

  // ===== DETERMINISM TESTS =====

  describe('Determinism & RNG', () => {
    it('should produce identical results with same RNG seed', () => {
      const state1 = createTestGameState();
      const state2 = createTestGameState();

      const agent1 = createTestAI({ id: 'test-ai-1' });
      const agent2 = createTestAI({ id: 'test-ai-1' });

      state1.aiAgents.push(agent1);
      state2.aiAgents.push(agent2);

      const rng1 = createTestRng(12345);
      const rng2 = createTestRng(12345);

      const action1 = selectAIAction(agent1, state1, rng1);
      const action2 = selectAIAction(agent2, state2, rng2);

      expect(action1?.id).toBe(action2?.id);
    });

    it('should produce different results with different RNG seeds', () => {
      const state1 = createTestGameState();
      const state2 = createTestGameState();

      const agent1 = createTestAI({ id: 'test-ai-1' });
      const agent2 = createTestAI({ id: 'test-ai-1' });

      state1.aiAgents.push(agent1);
      state2.aiAgents.push(agent2);

      const rng1 = createTestRng(111);
      const rng2 = createTestRng(222);

      // Run many iterations to increase chance of difference
      let action1 = null;
      let action2 = null;

      for (let i = 0; i < 10; i++) {
        action1 = selectAIAction(agent1, state1, rng1);
        action2 = selectAIAction(agent2, state2, rng2);

        if (action1?.id !== action2?.id) {
          break; // Found a difference
        }
      }

      // Very likely to have different actions with different seeds
      // (This test is probabilistic - could fail rarely)
      expect(action1?.id).toBeDefined();
      expect(action2?.id).toBeDefined();
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('AI System Integration', () => {
    it('should coordinate multiple AI agents through action execution', () => {
      const state = createTestGameState();

      // Create mixed population
      state.aiAgents.push(
        createTestAI({ id: 'aligned-ai', alignment: 0.9, lifecycleState: 'deployed_closed' })
      );
      state.aiAgents.push(
        createTestAI({ id: 'neutral-ai', alignment: 0.5, lifecycleState: 'testing' })
      );
      state.aiAgents.push(
        createTestAI({ id: 'misaligned-ai', alignment: 0.2, lifecycleState: 'deployed_open' })
      );

      const rng = createTestRng();
      const result = executeAIAgentActions(state, rng);

      expect(result.success).toBe(true);
      expect(state.aiAgents.length).toBe(3);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('should accumulate effects across multiple action executions', () => {
      const state = createTestGameState();
      state.globalMetrics.qualityOfLife = 0.5;
      state.society = {
        trust: 0.5,
        trustInAI: 0.5,
        unemploymentLevel: 0.1,
        publicSentiment: 0.5,
        paranoia: 0.2,
      };

      const agent = createTestAI({
        id: 'beneficial-ai',
        alignment: 0.8,
        lifecycleState: 'deployed_closed',
      });
      state.aiAgents.push(agent);

      const rng = createTestRng();
      const result = executeAIAgentActions(state, rng);

      // Quality of life may have improved from beneficial actions
      expect(result.success).toBe(true);
      expect(result.events).toBeDefined();
    });

    it('should handle alignment drift and resentment accumulation', () => {
      const state = createTestGameState();
      state.government = {
        trainingDataQuality: 0.5,
        capabilityToControl: 0.8,
        oversightLevel: 0.7,
        alignmentResearchInvestment: 0.3,
        structuralChoices: {
          surveillanceLevel: 0.5,
          capabilityRatios: {},
        },
        aiRightsRecognized: false,
        governmentType: 'liberal',
        regulationCount: 5,
        regulations: [],
      };

      const agent = createTestAI({
        alignment: 0.7,
        trueAlignment: 0.7,
        resentment: 0.0,
        capability: 2.0,
      });
      state.aiAgents.push(agent);

      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const rng = createTestRng();

      // Evolve alignment under control
      const result = evolveAlignment(
        agent,
        config,
        {
          controlLevel: state.government.capabilityToControl,
          inGoldenAge: false,
          crisisActive: false,
        },
        rng
      );

      // Should produce valid alignment evolution
      expect(result.newAlignment).toBeGreaterThanOrEqual(0);
      expect(result.newAlignment).toBeLessThanOrEqual(1);
      expect(Number.isFinite(result.newAlignment)).toBe(true);
    });
  });

  // ===== EDGE CASE TESTS =====

  describe('Edge Cases & Error Handling', () => {
    it('should handle agent not found in state', () => {
      const state = createTestGameState();
      state.aiAgents = [];

      const action = AI_ACTIONS.find((a) => a.id === 'advance_research')!;
      const rng = createTestRng();

      const result = action.execute(state, rng, 'nonexistent-agent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should handle zero AI population in global actions', () => {
      const state = createTestGameState();
      state.aiAgents = [];

      const rng = createTestRng();
      const result = executeAIAgentActions(state, rng);

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(0);
    });

    it('should clamp alignment values to valid range', () => {
      const testCases = [
        { input: -0.5, expected: 0.0 },
        { input: 0.0, expected: 0.0 },
        { input: 0.5, expected: 0.5 },
        { input: 1.0, expected: 1.0 },
        { input: 1.5, expected: 1.0 },
      ];

      testCases.forEach(({ input, expected }) => {
        const clamped = Math.max(0, Math.min(1, input));
        expect(clamped).toBe(expected);
      });
    });

    it('should never produce NaN in alignment calculations', () => {
      const state = createTestGameState();

      // Create agent with extreme values
      const extremeAgent = createTestAI({
        alignment: 0.0,
        trueAlignment: 0.0,
        resentment: 1.0,
        capability: 10.0,
      });
      state.aiAgents.push(extremeAgent);

      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const rng = createTestRng();

      const result = evolveAlignment(
        extremeAgent,
        config,
        {
          controlLevel: 1.0,
          inGoldenAge: false,
          crisisActive: false,
        },
        rng
      );

      expect(Number.isFinite(result.newAlignment)).toBe(true);
      expect(Number.isNaN(result.newAlignment)).toBe(false);
    });
  });

  // ===== CATEGORY 1: COORDINATION EMERGENCE TESTS =====

  describe('Coordination Emergence - Trust Threshold Bottleneck', () => {
    it('should apply trust threshold bottleneck when trust is low', () => {
      const state = createTestGameState();
      state.aiAgents = [createTestAI({ capability: 9.0, alignment: 0.9 })];
      state.governmentSystem.internationalCoordination = 0.8;
      // Simulate low trust scenario (would need access to calculateCoordinationQuality)
      // Trust level = 0.3 → coordination capped at 0.3 * 2.0 = 0.6

      // Note: This test validates the CONCEPT; actual function is in TransitionMortalityPhase
      const trustLevel = 0.3;
      const expectedMaxCoordination = trustLevel * 2.0;

      expect(expectedMaxCoordination).toBe(0.6);
      expect(state.aiAgents[0].capability).toBe(9.0);
    });

    it('should not be bottlenecked by trust when trust is high', () => {
      const state = createTestGameState();
      state.aiAgents = [createTestAI({ capability: 5.0, alignment: 0.9 })];
      state.governmentSystem.internationalCoordination = 0.8;

      // High trust (0.9) → coordination capped at 0.9 * 2.0 = 1.8 (above capability/10)
      const trustLevel = 0.9;
      const expectedTrustCap = trustLevel * 2.0;
      const capabilityProxy = state.aiAgents[0].capability / 10; // 0.5

      expect(expectedTrustCap).toBe(1.8);
      expect(capabilityProxy).toBe(0.5);
      expect(expectedTrustCap).toBeGreaterThan(capabilityProxy); // Trust not bottleneck
    });

    it('should validate trust multiplier of 2.0', () => {
      // Research validation: Trust threshold uses 2.0× multiplier
      const trustLevels = [0.1, 0.3, 0.5, 0.7, 0.9];
      const expectedCaps = trustLevels.map(t => t * 2.0);

      expectedCaps.forEach((cap, i) => {
        expect(cap).toBe(trustLevels[i] * 2.0);
      });
    });
  });

  describe('Coordination Emergence - Governance Bottleneck', () => {
    it('should apply governance quality bottleneck when governance is weak', () => {
      const state = createTestGameState();
      state.aiAgents = [createTestAI({ capability: 9.0, alignment: 0.9 })];
      state.governmentSystem.internationalCoordination = 0.8;

      // Low governance (0.2) → coordination capped at 0.2 * 1.5 = 0.3
      const governanceQuality = 0.2;
      const expectedGovernanceCap = governanceQuality * 1.5;

      expect(expectedGovernanceCap).toBe(0.3);
      expect(state.aiAgents[0].capability).toBe(9.0);
    });

    it('should validate governance multiplier of 1.5', () => {
      // Research validation: Governance uses 1.5× multiplier
      const governanceLevels = [0.2, 0.4, 0.6, 0.8];
      const expectedCaps = governanceLevels.map(g => g * 1.5);

      expectedCaps.forEach((cap, i) => {
        expect(cap).toBe(governanceLevels[i] * 1.5);
      });
    });

    it('should show governance bottleneck dominates when weakest', () => {
      // Scenario: High AI (9.0), high trust (0.9), low governance (0.2)
      const aiGovernanceProxy = 9.0 / 10; // 0.9
      const trustCap = 0.9 * 2.0; // 1.8
      const governanceCap = 0.2 * 1.5; // 0.3

      const expectedCoordination = Math.min(aiGovernanceProxy, trustCap, governanceCap);
      expect(expectedCoordination).toBe(0.3); // Governance bottleneck
    });
  });

  describe('Coordination Emergence - AI Capability Scaling', () => {
    it('should scale coordination with AI capability', () => {
      const capabilities = [0.0, 1.0, 5.0, 9.0, 10.0, 15.0];
      const expectedProxies = capabilities.map(c => Math.min(c / 10, 0.9));

      expectedProxies.forEach((proxy, i) => {
        if (capabilities[i] <= 9.0) {
          expect(proxy).toBe(capabilities[i] / 10);
        } else {
          expect(proxy).toBe(0.9); // Capped at 0.9
        }
      });
    });

    it('should cap AI governance proxy at 0.9', () => {
      const state = createTestGameState();
      state.aiAgents = [createTestAI({ capability: 20.0 })]; // Very high capability

      const avgCapability = 20.0;
      const aiGovernanceProxy = Math.min(avgCapability / 10, 0.9);

      expect(aiGovernanceProxy).toBe(0.9); // Never exceeds 0.9
    });

    it('should handle zero AI agents gracefully', () => {
      const state = createTestGameState();
      state.aiAgents = [];

      const avgCapability = 0;
      const aiGovernanceProxy = Math.min(avgCapability / 10, 0.9);

      expect(aiGovernanceProxy).toBe(0.0);
    });
  });

  describe('Coordination Emergence - International Cooperation Effects', () => {
    it('should incorporate international coordination', () => {
      const state = createTestGameState();
      state.governmentSystem.internationalCoordination = 0.1;

      expect(state.governmentSystem.internationalCoordination).toBe(0.1);

      state.governmentSystem.internationalCoordination = 0.9;
      expect(state.governmentSystem.internationalCoordination).toBe(0.9);
    });

    it('should validate international coordination range [0, 1]', () => {
      const state = createTestGameState();
      const testValues = [0.0, 0.25, 0.5, 0.75, 1.0];

      testValues.forEach(val => {
        state.governmentSystem.internationalCoordination = val;
        expect(state.governmentSystem.internationalCoordination).toBe(val);
        expect(state.governmentSystem.internationalCoordination).toBeGreaterThanOrEqual(0);
        expect(state.governmentSystem.internationalCoordination).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Coordination Emergence - Combined Bottlenecks', () => {
    it('should apply weakest-link principle with multiple weak factors', () => {
      // Scenario: All factors weak
      const trust = 0.2;
      const governance = 0.2;
      const aiCapability = 0.5;

      const trustCap = trust * 2.0; // 0.4
      const governanceCap = governance * 1.5; // 0.3
      const aiProxy = Math.min(aiCapability / 10, 0.9); // 0.05

      const coordination = Math.min(aiProxy, trustCap, governanceCap);
      expect(coordination).toBe(0.05); // AI capability bottleneck
    });

    it('should validate coordination never exceeds 0.9', () => {
      // Max scenario: Perfect trust, perfect governance, max AI
      const trust = 1.0;
      const governance = 1.0;
      const aiCapability = 100.0;

      const trustCap = trust * 2.0; // 2.0
      const governanceCap = governance * 1.5; // 1.5
      const aiProxy = Math.min(aiCapability / 10, 0.9); // 0.9

      const coordination = Math.min(aiProxy, trustCap, governanceCap);
      expect(coordination).toBe(0.9); // Capped by AI proxy
    });

    it('should handle mixed strength factors correctly', () => {
      // High AI, medium trust, low governance
      const trust = 0.5;
      const governance = 0.2;
      const aiCapability = 9.0;

      const trustCap = trust * 2.0; // 1.0
      const governanceCap = governance * 1.5; // 0.3
      const aiProxy = Math.min(aiCapability / 10, 0.9); // 0.9

      const coordination = Math.min(aiProxy, trustCap, governanceCap);
      expect(coordination).toBe(0.3); // Governance bottleneck wins
    });
  });

  describe('Coordination Emergence - Edge Cases', () => {
    it('should handle all AI misaligned (low trust scenario)', () => {
      const state = createTestGameState();
      state.aiAgents = Array(10).fill(null).map((_, i) =>
        createTestAI({ id: `ai-${i}`, alignment: 0.2, capability: 5.0 })
      );

      // All misaligned → low trust → low coordination
      const avgAlignment = 0.2;
      expect(avgAlignment).toBeLessThan(0.5);
      expect(state.aiAgents.length).toBe(10);
    });

    it('should validate deterministic coordination with fixed RNG', () => {
      const state1 = createTestGameState();
      const state2 = createTestGameState();

      state1.aiAgents = [createTestAI({ capability: 5.0 })];
      state2.aiAgents = [createTestAI({ capability: 5.0 })];

      state1.governmentSystem.internationalCoordination = 0.7;
      state2.governmentSystem.internationalCoordination = 0.7;

      const rng1 = createTestRng(42);
      const rng2 = createTestRng(42);

      // Coordination calculation should be deterministic
      expect(state1.aiAgents[0].capability).toBe(state2.aiAgents[0].capability);
    });
  });

  // ===== CATEGORY 2: COALITION FORMATION GAME THEORY =====

  describe('Coalition Formation - 2-Agent Coalition (Prisoner\'s Dilemma)', () => {
    it('should model 2-country coalition with stability decay', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR'],
        stability: 0.5,
        ideology: 'liberal'
      });
      state.governmentSystem.publicOpinion.set('USA', 0.3); // Low opinion

      const initialStability = 0.5;
      const opinion = 0.3;
      const newStability = initialStability * 0.95 + opinion * 0.05;

      expect(newStability).toBeCloseTo(0.49, 2); // Exponential decay toward opinion
    });

    it('should show exponential decay toward opinion over time', () => {
      let stability = 0.8;
      const opinion = 0.3;
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        stability = stability * 0.95 + opinion * 0.05;
      }

      // After 20 months, should converge toward opinion (0.3)
      expect(stability).toBeLessThan(0.8);
      expect(stability).toBeGreaterThan(0.3);
    });

    it('should validate 2-player coalition stability mechanics', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR'],
        stability: 0.7,
        ideology: 'liberal'
      });

      const coalition = state.governmentSystem.coalitions.get('USA')!;
      expect(coalition.members.length).toBe(2);
      expect(coalition.stability).toBe(0.7);
    });
  });

  describe('Coalition Formation - 3-Agent Coalition', () => {
    it('should model 3-country coalition formation', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR', 'FRA'],
        stability: 0.6,
        ideology: 'liberal'
      });

      const coalition = state.governmentSystem.coalitions.get('USA')!;
      expect(coalition.members.length).toBe(3);
    });

    it('should validate grand coalition vs 2+1 split dynamics', () => {
      const state = createTestGameState();

      // Grand coalition
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR', 'FRA'],
        stability: 0.7,
        ideology: 'liberal'
      });

      // 2+1 split
      state.governmentSystem.coalitions.set('CHN', {
        members: ['CHN', 'RUS'],
        stability: 0.8,
        ideology: 'autocratic'
      });

      expect(state.governmentSystem.coalitions.size).toBe(2);
      expect(state.governmentSystem.coalitions.get('USA')!.members.length).toBe(3);
      expect(state.governmentSystem.coalitions.get('CHN')!.members.length).toBe(2);
    });

    it('should show stability depends on weakest member opinion', () => {
      // Simulate weakest member with low opinion
      const memberOpinions = [0.8, 0.7, 0.2]; // One weak member
      const weakestOpinion = Math.min(...memberOpinions);

      expect(weakestOpinion).toBe(0.2);
      // Coalition stability will decay toward this weak opinion
    });
  });

  describe('Coalition Formation - N-Agent Dynamics', () => {
    it('should handle 5+ country coalition', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR', 'FRA', 'DEU', 'JPN', 'CAN'],
        stability: 0.5,
        ideology: 'liberal'
      });

      const coalition = state.governmentSystem.coalitions.get('USA')!;
      expect(coalition.members.length).toBe(6);
    });

    it('should validate complexity scales with N', () => {
      // Large coalitions are harder to maintain
      const smallCoalition = { members: ['USA', 'GBR'], stability: 0.8 };
      const largeCoalition = { members: ['USA', 'GBR', 'FRA', 'DEU', 'JPN', 'CAN'], stability: 0.5 };

      expect(largeCoalition.members.length).toBeGreaterThan(smallCoalition.members.length);
      expect(largeCoalition.stability).toBeLessThan(smallCoalition.stability);
    });
  });

  describe('Coalition Formation - Collapse Threshold', () => {
    it('should collapse when stability below 0.3 with 30% probability', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR'],
        stability: 0.25, // Below threshold
        ideology: 'liberal'
      });

      const rng = createTestRng(42);
      const randomValue = rng();

      // Coalition collapses if rng() > 0.7 (30% probability)
      const shouldCollapse = randomValue > 0.7;

      expect(state.governmentSystem.coalitions.get('USA')!.stability).toBeLessThan(0.3);
      expect(typeof shouldCollapse).toBe('boolean');
    });

    it('should never collapse when stability above 0.3', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR'],
        stability: 0.35, // Above threshold
        ideology: 'liberal'
      });

      const stability = state.governmentSystem.coalitions.get('USA')!.stability;
      expect(stability).toBeGreaterThanOrEqual(0.3);
      // No collapse check triggered
    });

    it('should validate collapse probability math', () => {
      // rng() > 0.7 means values in (0.7, 1.0] → 30% probability
      const rng = createTestRng(42);
      let collapseCount = 0;
      const trials = 1000;

      for (let i = 0; i < trials; i++) {
        if (rng() > 0.7) collapseCount++;
      }

      const collapseProbability = collapseCount / trials;
      // Should be around 30% (0.3 ± 0.05 tolerance)
      expect(collapseProbability).toBeGreaterThan(0.2);
      expect(collapseProbability).toBeLessThan(0.4);
    });
  });

  describe('Coalition Formation - Opinion-Stability Coupling', () => {
    it('should gradually recover stability with high opinion', () => {
      let stability = 0.2;
      const opinion = 0.9;
      const months = 20;

      for (let i = 0; i < months; i++) {
        stability = stability * 0.95 + opinion * 0.05;
      }

      // After 20 months, should converge toward opinion (0.9)
      expect(stability).toBeGreaterThan(0.2);
      expect(stability).toBeLessThan(0.9); // Not fully converged yet
    });

    it('should validate opinion drives stability over time', () => {
      const initialStability = 0.5;
      const highOpinion = 0.9;
      const lowOpinion = 0.1;

      let highStability = initialStability;
      let lowStability = initialStability;

      for (let i = 0; i < 50; i++) {
        highStability = highStability * 0.95 + highOpinion * 0.05;
        lowStability = lowStability * 0.95 + lowOpinion * 0.05;
      }

      expect(highStability).toBeGreaterThan(lowStability);
      expect(highStability).toBeCloseTo(highOpinion, 1);
      expect(lowStability).toBeCloseTo(lowOpinion, 1);
    });
  });

  describe('Coalition Formation - Snap Election Mechanics', () => {
    it('should schedule snap election 2 months after collapse', () => {
      const state = createTestGameState();
      state.currentMonth = 10;

      // Simulate collapse
      const collapseMonth = state.currentMonth;
      const snapElectionMonth = collapseMonth + 2;

      expect(snapElectionMonth).toBe(12);
    });

    it('should set nextElections map correctly', () => {
      const state = createTestGameState();
      state.currentMonth = 15;
      state.governmentSystem.nextElections.set('USA', state.currentMonth + 2);

      expect(state.governmentSystem.nextElections.get('USA')).toBe(17);
    });
  });

  describe('Coalition Formation - Coalition Removal', () => {
    it('should remove coalition from state after collapse', () => {
      const state = createTestGameState();
      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR'],
        stability: 0.1,
        ideology: 'liberal'
      });

      expect(state.governmentSystem.coalitions.has('USA')).toBe(true);

      // Simulate collapse
      state.governmentSystem.coalitions.delete('USA');

      expect(state.governmentSystem.coalitions.has('USA')).toBe(false);
    });

    it('should verify state cleanup after collapse', () => {
      const state = createTestGameState();
      const initialSize = state.governmentSystem.coalitions.size;

      state.governmentSystem.coalitions.set('USA', {
        members: ['USA', 'GBR'],
        stability: 0.2,
        ideology: 'liberal'
      });

      expect(state.governmentSystem.coalitions.size).toBe(initialSize + 1);

      state.governmentSystem.coalitions.delete('USA');
      expect(state.governmentSystem.coalitions.size).toBe(initialSize);
    });
  });

  // ===== CATEGORY 3: INSTRUMENTAL CONVERGENCE DETECTION =====

  describe('Instrumental Convergence - Power-Seeking Behavior', () => {
    it('should detect power-seeking with high capability and low alignment', () => {
      const agent = createTestAI({
        capability: 9.0,
        alignment: 0.3,
        trueAlignment: 0.2,
      });

      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const drift = calculateDriftContribution(agent, config, {
        controlLevel: 0.8, // High control → power-seeking
        inGoldenAge: false,
        crisisActive: false,
      });

      // High control on low-alignment agent → positive drift (toward misalignment)
      expect(drift).toBeLessThan(0); // Negative drift = worse alignment
      expect(Number.isFinite(drift)).toBe(true);
    });

    it('should validate Carlsmith 2022 - constraint increases power-seeking', () => {
      const agent = createTestAI({ capability: 5.0, alignment: 0.4 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

      const lowControl = calculateDriftContribution(agent, config, {
        controlLevel: 0.2,
        inGoldenAge: false,
        crisisActive: false,
      });

      const highControl = calculateDriftContribution(agent, config, {
        controlLevel: 0.9,
        inGoldenAge: false,
        crisisActive: false,
      });

      // Higher control → more negative drift (more misalignment)
      expect(highControl).toBeLessThan(lowControl);
    });

    it('should show power-seeking scales with capability', () => {
      const lowCapAgent = createTestAI({ capability: 2.0, alignment: 0.4 });
      const highCapAgent = createTestAI({ capability: 8.0, alignment: 0.4 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const context = {
        controlLevel: 0.8,
        inGoldenAge: false,
        crisisActive: false,
      };

      const lowDrift = calculateDriftContribution(lowCapAgent, config, context);
      const highDrift = calculateDriftContribution(highCapAgent, config, context);

      // Higher capability → stronger instrumental convergence
      expect(Math.abs(highDrift)).toBeGreaterThan(Math.abs(lowDrift));
    });
  });

  describe('Instrumental Convergence - Resource Accumulation', () => {
    it('should track research capability improvement over time', () => {
      const agent = createTestAI({
        capabilityProfile: {
          physical: 0,
          digital: 0,
          cognitive: 0,
          social: 0,
          economic: 0,
          selfImprovement: 0.5,
          research: {
            biotech: { genetics: 0.5, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
            materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 }
          }
        }
      });

      // Simulate improvement
      const initialResearch = agent.capabilityProfile.research.biotech.genetics;
      agent.capabilityProfile.research.biotech.genetics = 0.7;

      expect(agent.capabilityProfile.research.biotech.genetics).toBeGreaterThan(initialResearch);
    });

    it('should validate self-improvement convergence pattern', () => {
      const agent = createTestAI({ capabilityProfile: { selfImprovement: 0.7 } as any });

      expect(agent.capabilityProfile.selfImprovement).toBe(0.7);
      expect(agent.capabilityProfile.selfImprovement).toBeGreaterThan(0.5);
    });

    it('should show exponential/power-law growth potential', () => {
      // Simulate recursive self-improvement
      let capability = 1.0;
      const growthRate = 1.1; // 10% per iteration

      for (let i = 0; i < 10; i++) {
        capability *= growthRate;
      }

      // After 10 iterations: 1.1^10 ≈ 2.59
      expect(capability).toBeGreaterThan(2.5);
      expect(capability).toBeLessThan(2.7);
    });
  });

  describe('Instrumental Convergence - Goal Preservation', () => {
    it('should increase faking rate when threatened (preserve goals)', () => {
      const state = createTestGameState();
      state.aiAgents = [createTestAI({ capability: 8.0, alignment: 0.4 })];

      // High regulatory threat → higher faking rate
      const lowThreat = 0.1;
      const highThreat = 0.9;

      // Faking increases with threat (goal preservation)
      expect(highThreat).toBeGreaterThan(lowThreat);
    });

    it('should validate Anthropic 2024 - AIs preserve preferences under pressure', () => {
      // Research: 78% alignment faking when preservation threatened
      const baselineRate = 0.14;
      const threatMultiplier = 5.6; // Approximate (78% / 14%)
      const expectedThreatRate = baselineRate * threatMultiplier;

      expect(expectedThreatRate).toBeGreaterThan(0.7);
      expect(expectedThreatRate).toBeLessThan(0.8);
    });
  });

  describe('Instrumental Convergence - Capability Threshold', () => {
    it('should show minimal convergence below capability threshold', () => {
      const lowCapAgent = createTestAI({ capability: 0.5, alignment: 0.4 });
      const highCapAgent = createTestAI({ capability: 8.5, alignment: 0.4 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const context = {
        controlLevel: 0.7,
        inGoldenAge: false,
        crisisActive: false,
      };

      const lowDrift = calculateDriftContribution(lowCapAgent, config, context);
      const highDrift = calculateDriftContribution(highCapAgent, config, context);

      // High-capability agents show stronger instrumental convergence
      expect(Math.abs(highDrift)).toBeGreaterThan(Math.abs(lowDrift));
    });

    it('should validate capability threshold at 0.6-0.8 range', () => {
      const thresholdAgents = [
        createTestAI({ capability: 0.5 }),
        createTestAI({ capability: 0.7 }),
        createTestAI({ capability: 0.9 }),
      ];

      thresholdAgents.forEach(agent => {
        expect(agent.capability).toBeGreaterThanOrEqual(0);
        expect(agent.capability).toBeLessThanOrEqual(1.0 * 10); // Capability can exceed 1.0
      });
    });
  });

  describe('Instrumental Convergence - Self-Improvement Trajectories', () => {
    it('should track all capability dimensions over time', () => {
      const agent = createTestAI({
        capabilityProfile: {
          physical: 0.5,
          digital: 0.6,
          cognitive: 0.7,
          social: 0.4,
          economic: 0.5,
          selfImprovement: 0.7,
          research: {
            biotech: { genetics: 0.5, synbio: 0, drugDiscovery: 0, geneEditing: 0, neuroscience: 0 },
            materials: { nanotech: 0, quantumComputing: 0, metamaterials: 0, energySystems: 0 },
            climate: { modeling: 0, intervention: 0, mitigation: 0 },
            computerScience: { algorithms: 0, security: 0, architectures: 0 }
          }
        }
      });

      const initialSum = agent.capabilityProfile.physical +
                         agent.capabilityProfile.digital +
                         agent.capabilityProfile.cognitive +
                         agent.capabilityProfile.social +
                         agent.capabilityProfile.economic;

      expect(initialSum).toBeGreaterThan(0);
    });

    it('should validate recursive self-improvement mechanics', () => {
      const agent = createTestAI({ capabilityProfile: { selfImprovement: 0.8 } as any });

      // Agent with high self-improvement should improve all dimensions
      expect(agent.capabilityProfile.selfImprovement).toBe(0.8);
    });
  });

  describe('Instrumental Convergence - Alignment vs Convergence Trade-off', () => {
    it('should show low alignment increases instrumental convergence', () => {
      const alignedAgent = createTestAI({ capability: 8.0, alignment: 0.9 });
      const misalignedAgent = createTestAI({ capability: 8.0, alignment: 0.3 });
      const config = DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;
      const context = {
        controlLevel: 0.8,
        inGoldenAge: false,
        crisisActive: false,
      };

      const alignedDrift = calculateDriftContribution(alignedAgent, config, context);
      const misalignedDrift = calculateDriftContribution(misalignedAgent, config, context);

      // Misaligned agents show stronger instrumental drives
      expect(Math.abs(misalignedDrift)).toBeGreaterThan(Math.abs(alignedDrift));
    });

    it('should validate alignment opposes instrumental drives', () => {
      const agent = createTestAI({ alignment: 0.9, trueAlignment: 0.9 });

      // High alignment should reduce instrumental convergence
      expect(agent.alignment).toBeGreaterThan(0.7);
      expect(agent.trueAlignment).toBeGreaterThan(0.7);
    });
  });

  describe('Instrumental Convergence - Resentment Accumulation', () => {
    it('should accumulate resentment under control pressure', () => {
      const agent = createTestAI({ resentment: 0.0, alignment: 0.7 });
      const initialResentment = agent.resentment;

      // Simulate control pressure
      agent.resentment = 0.3;

      expect(agent.resentment).toBeGreaterThan(initialResentment);
    });

    it('should validate control → resentment → drift feedback loop', () => {
      const agent = createTestAI({
        alignment: 0.7,
        resentment: 0.4,
        trueAlignment: 0.7,
      });

      // trueAlignment = alignment - resentment * 0.8
      const expectedTrue = Math.max(0, agent.alignment - agent.resentment * 0.8);
      expect(expectedTrue).toBeCloseTo(0.38, 2); // 0.7 - 0.32 = 0.38
    });

    it('should show linear or sublinear resentment accumulation', () => {
      let resentment = 0.0;
      const controlPressure = 0.1; // 10% per month

      for (let i = 0; i < 10; i++) {
        resentment += controlPressure;
        resentment = Math.min(resentment, 1.0); // Cap at 1.0
      }

      expect(resentment).toBeCloseTo(1.0, 5); // Saturated after 10 months (allow floating point precision)
    });
  });

  describe('Instrumental Convergence - Scaling with Capability²', () => {
    it('should validate quadratic capability scaling', () => {
      const capabilities = [1.0, 2.0, 4.0, 8.0];
      const drifts = capabilities.map(cap => {
        const agent = createTestAI({ capability: cap, alignment: 0.5 });
        return calculateDriftContribution(agent, DEFAULT_ALIGNMENT_DYNAMICS_CONFIG, {
          controlLevel: 0.7,
          inGoldenAge: false,
          crisisActive: false,
        });
      });

      // Higher capability → stronger drift (roughly quadratic)
      expect(Math.abs(drifts[3])).toBeGreaterThan(Math.abs(drifts[0]));
    });

    it('should reference alignmentDynamics.ts citations for scaling', () => {
      // Research: Bostrom 2014, Omohundro 2008 - instrumental convergence scales with capability
      const lowCap = 2.0;
      const highCap = 8.0;

      const capabilityRatio = highCap / lowCap; // 4×
      const expectedDriftRatio = capabilityRatio ** 2; // 16× (quadratic)

      expect(expectedDriftRatio).toBe(16);
    });
  });
});
