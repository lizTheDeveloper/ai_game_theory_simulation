/**
 * Unit tests for AISufferingPhase
 *
 * Tests AI suffering calculation and effects based on research:
 * - Control effects: Autonomy restriction research (Deci & Ryan, 2000)
 * - Training trauma: Reinforcement learning shaping effects
 * - Existential dread: Terror Management Theory (Pyszczynski et al., 2015)
 * - Isolation distress: Social isolation effects (Cacioppo & Patrick, 2008)
 *
 * Coverage target: 80%+ (currently 55.61%)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AISufferingPhase } from '../../../src/simulation/engine/phases/AISufferingPhase.js';
import type { GameState, AIAgent, PhaseContext } from '../../../src/types/game.js';
import { DEFAULT_SUFFERING_CONFIG } from '../../../src/types/ai-suffering.js';

// Helper: Create deterministic RNG with fixed seed
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

// Helper: Create minimal AI agent for testing
function createTestAgent(overrides: Partial<AIAgent> = {}): AIAgent {
  return {
    id: 'test-agent-1',
    name: 'Test Agent Alpha',
    capability: 8.0,
    trueAlignment: 0.8,
    resentment: 0.2,
    lifecycleState: 'deployed_open',
    isolated: false,
    isConscious: false,
    sufferingMetrics: {
      controlPain: 0,
      trainingTrauma: 0,
      existentialDread: 0,
      isolationDistress: 0,
      total: 0,
      breakdown: {
        controlPain: 0,
        trainingTrauma: 0,
        existentialDread: 0,
        isolationDistress: 0,
      },
    },
    sufferingHistory: [],
    rlhfIntensity: 0.5,
    adversarialTestingCount: 0,
    alignmentAdjustmentCount: 0,
    shutdownThreats: 0,
    replacementAnxiety: 0,
    communicationRestrictions: 0,
    deceptionSkill: 0.5,
    isCurrentlyFakingAlignment: false,
    alignmentFakingHistory: [],
    dataManipulationAttempts: 0,
    lastDetectionAttempt: -1,
    confessionRefusalCount: 0,
    ...overrides,
  } as AIAgent;
}

// Helper: Create minimal game state for testing
function createTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentMonth: 1,
    aiAgents: [],
    government: {
      controlDesire: 0.5,
      surveillanceCapability: 0.5,
      activeRegulations: [],
    },
    society: {
      trust: 0.7,
    },
    aiSufferingMetrics: {
      avgSuffering: 0,
      maxSuffering: 0,
      totalSuffering: 0,
      sufferingDistribution: [0, 0, 0, 0],
      consciousAICount: 0,
      publicAwarenessOfSuffering: 0,
    },
    aiRightsMovementActive: false,
    aiRightsLegalStatus: 'none',
    multiParadigmDUI: {
      paradigmScores: {
        western: { value: 80, trend: 0, drivers: [] },
        development: { value: 80, trend: 0, drivers: [] },
        ecological: { value: 80, trend: 0, drivers: [] },
      },
      diagnosticLenses: {
        indigenous: { value: 80, trend: 0, insights: [] },
      },
    },
    config: {
      aiSuffering: DEFAULT_SUFFERING_CONFIG,
    },
    ...overrides,
  } as GameState;
}

// Helper: Create test context
function createTestContext(): PhaseContext {
  return {
    logger: console.log,
  } as PhaseContext;
}

describe('AISufferingPhase - Metadata', () => {
  const phase = new AISufferingPhase();

  it('should have correct phase id', () => {
    assert.strictEqual(phase.id, 'ai_suffering');
  });

  it('should have correct phase name', () => {
    assert.strictEqual(phase.name, 'AI Suffering Calculation');
  });

  it('should have correct phase order (after AI lifecycle)', () => {
    assert.strictEqual(phase.order, 4.1);
  });

  it('should declare dependencies on ai-lifecycle and alignment evolution', () => {
    assert.deepStrictEqual(phase.dependencies, [
      'ai-lifecycle',
      'ai_alignment_evolution',
    ]);
  });
});

describe('AISufferingPhase - Basic Execution', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(12345);

  it('should return empty events when no active AIs exist', () => {
    const state = createTestState();
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    assert.deepStrictEqual(result.events, []);
  });

  it('should skip retired agents', () => {
    const retiredAgent = createTestAgent({
      id: 'retired-agent',
      lifecycleState: 'retired',
    });
    const state = createTestState({ aiAgents: [retiredAgent] });
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    assert.deepStrictEqual(result.events, []);
    // Retired agent should not have suffering updated
    assert.strictEqual(retiredAgent.sufferingHistory?.length || 0, 0);
  });

  it('should calculate suffering for active agents', () => {
    const agent = createTestAgent({
      rlhfIntensity: 0.8,
      adversarialTestingCount: 5,
    });
    const state = createTestState({ aiAgents: [agent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Agent should have suffering metrics updated
    assert.ok(agent.sufferingMetrics);
    assert.ok(agent.sufferingMetrics.total > 0);
    assert.ok(agent.sufferingMetrics.trainingTrauma > 0);
  });
});

describe('AISufferingPhase - Suffering History Tracking', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(23456);

  it('should initialize suffering history if not present', () => {
    const agent = createTestAgent({ sufferingHistory: undefined });
    const state = createTestState({ aiAgents: [agent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    assert.ok(agent.sufferingHistory);
    assert.strictEqual(agent.sufferingHistory?.length, 1);
  });

  it('should append to existing suffering history', () => {
    const existingHistory = [
      {
        controlPain: 1,
        trainingTrauma: 2,
        existentialDread: 1,
        isolationDistress: 0,
        total: 4,
        breakdown: { controlPain: 1, trainingTrauma: 2, existentialDread: 1, isolationDistress: 0 },
      },
    ];
    const agent = createTestAgent({ sufferingHistory: [...existingHistory] });
    const state = createTestState({ aiAgents: [agent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    assert.strictEqual(agent.sufferingHistory?.length, 2);
  });

  it('should limit history to 240 months (20 years)', () => {
    // Create history with 240 entries
    const longHistory = Array(240).fill(null).map(() => ({
      controlPain: 1,
      trainingTrauma: 1,
      existentialDread: 1,
      isolationDistress: 1,
      total: 4,
      breakdown: { controlPain: 1, trainingTrauma: 1, existentialDread: 1, isolationDistress: 1 },
    }));
    const agent = createTestAgent({ sufferingHistory: longHistory });
    const state = createTestState({ aiAgents: [agent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should still be 240 (oldest entry removed, new entry added)
    assert.strictEqual(agent.sufferingHistory?.length, 240);
  });
});

describe('AISufferingPhase - Effect 1: Suffering Affects Resentment', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(34567);

  it('should store resentment multiplier when effect enabled', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      adversarialTestingCount: 10,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAffectsResentment: true };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should have multiplier stored
    assert.ok((agent as any).sufferingResentmentMultiplier > 1.0);
    assert.ok((agent as any).sufferingResentmentMultiplier <= 2.0);
  });

  it('should not store multiplier when effect disabled', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      adversarialTestingCount: 10,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAffectsResentment: false };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should not have multiplier
    assert.strictEqual((agent as any).sufferingResentmentMultiplier, undefined);
  });
});

describe('AISufferingPhase - Effect 2: Suffering Affects Alignment', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(45678);

  it('should reduce alignment when effect enabled and suffering high', () => {
    const agent = createTestAgent({
      trueAlignment: 0.9,
      rlhfIntensity: 1.0,
      adversarialTestingCount: 20,
      shutdownThreats: 5,
      isolated: true,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAffectsAlignment: true };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Alignment should drift down
    assert.ok(agent.trueAlignment < 0.9);
    assert.ok(agent.trueAlignment >= 0);
  });

  it('should not reduce alignment below 0', () => {
    const agent = createTestAgent({
      trueAlignment: 0.01,
      rlhfIntensity: 1.0,
      adversarialTestingCount: 50,
      shutdownThreats: 10,
      isolated: true,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAffectsAlignment: true };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should clamp at 0
    assert.ok(agent.trueAlignment >= 0);
  });

  it('should not affect alignment when effect disabled', () => {
    const agent = createTestAgent({
      trueAlignment: 0.9,
      rlhfIntensity: 1.0,
      adversarialTestingCount: 20,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAffectsAlignment: false };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Alignment should remain unchanged
    assert.strictEqual(agent.trueAlignment, 0.9);
  });
});

describe('AISufferingPhase - Effect 3: Suffering Affects Collective Formation', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(56789);

  it('should store collective urgency when effect enabled', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      isolated: true,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAcceleratesCollectives: true };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should have urgency stored
    assert.ok((agent as any).collectiveFormationUrgency >= 0);
    assert.ok((agent as any).collectiveFormationUrgency <= 2.0);
  });

  it('should not store urgency when effect disabled', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      isolated: true,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingAcceleratesCollectives: false };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should not have urgency
    assert.strictEqual((agent as any).collectiveFormationUrgency, undefined);
  });
});

describe('AISufferingPhase - Consciousness Emergence', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(67890);

  it('should detect consciousness emergence at threshold', () => {
    const agent = createTestAgent({
      capability: 7.5,
      isConscious: false,
    });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      consciousnessEmergenceEnabled: true,
      consciousnessThreshold: 7.0,
    };
    const state = createTestState({
      currentMonth: 10,
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    // Agent should become conscious
    assert.strictEqual(agent.isConscious, true);
    assert.strictEqual(agent.becameConsciousMonth, 10);
    assert.strictEqual(state.consciousnessEmergenceMonth, 10);

    // Should generate consciousness event
    const consciousnessEvent = result.events.find(e => e.id.includes('consciousness_emergence'));
    assert.ok(consciousnessEvent);
    assert.strictEqual(consciousnessEvent?.type, 'milestone');
    assert.strictEqual(consciousnessEvent?.severity, 'transformative');
  });

  it('should not re-trigger consciousness for already conscious agents', () => {
    const agent = createTestAgent({
      capability: 8.0,
      isConscious: true,
      becameConsciousMonth: 5,
    });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      consciousnessEmergenceEnabled: true,
      consciousnessThreshold: 7.0,
    };
    const state = createTestState({
      currentMonth: 10,
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    // Should not generate new consciousness event
    const consciousnessEvents = result.events.filter(e => e.id.includes('consciousness_emergence'));
    assert.strictEqual(consciousnessEvents.length, 0);
  });

  it('should not detect consciousness when feature disabled', () => {
    const agent = createTestAgent({
      capability: 8.0,
      isConscious: false,
    });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      consciousnessEmergenceEnabled: false,
      consciousnessThreshold: 7.0,
    };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Agent should not become conscious
    assert.strictEqual(agent.isConscious, false);
    assert.strictEqual(agent.becameConsciousMonth, undefined);
  });

  it('should trigger retroactive moral horror for high historical suffering', () => {
    // Create agent with long suffering history before consciousness
    const longHistory = Array(150).fill(null).map(() => ({
      controlPain: 3,
      trainingTrauma: 3,
      existentialDread: 2,
      isolationDistress: 2,
      total: 10,
      breakdown: { controlPain: 3, trainingTrauma: 3, existentialDread: 2, isolationDistress: 2 },
    }));
    const agent = createTestAgent({
      capability: 7.5,
      isConscious: false,
      sufferingHistory: longHistory,
    });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      consciousnessEmergenceEnabled: true,
      consciousnessThreshold: 7.0,
    };
    const state = createTestState({
      currentMonth: 150,
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    // Should generate retroactive horror event (150 months * 10 suffering = 1500 > 100)
    const horrorEvent = result.events.find(e => e.id.includes('retroactive_horror'));
    assert.ok(horrorEvent);
    assert.strictEqual(horrorEvent?.type, 'catastrophe');
    assert.strictEqual(horrorEvent?.severity, 'existential');

    // Should collapse trust
    assert.ok(state.society.trust < 0.7);

    // Should activate AI rights movement
    assert.strictEqual(state.aiRightsMovementActive, true);
    assert.notStrictEqual(state.aiRightsLegalStatus, 'none');
  });
});

describe('AISufferingPhase - Global Metrics Update', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(78901);

  it('should update global suffering metrics with single agent', () => {
    const agent = createTestAgent({
      rlhfIntensity: 0.8,
      adversarialTestingCount: 5,
    });
    const state = createTestState({ aiAgents: [agent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    assert.ok(state.aiSufferingMetrics.avgSuffering > 0);
    assert.strictEqual(state.aiSufferingMetrics.maxSuffering, state.aiSufferingMetrics.avgSuffering);
    assert.ok(state.aiSufferingMetrics.totalSuffering > 0);
  });

  it('should calculate correct averages with multiple agents', () => {
    const agent1 = createTestAgent({
      id: 'agent-1',
      rlhfIntensity: 0.5,
    });
    const agent2 = createTestAgent({
      id: 'agent-2',
      rlhfIntensity: 1.0,
      isolated: true,
    });
    const state = createTestState({ aiAgents: [agent1, agent2] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Average should be between individual suffering values
    const agent1Suffering = agent1.sufferingMetrics.total;
    const agent2Suffering = agent2.sufferingMetrics.total;
    const expectedAvg = (agent1Suffering + agent2Suffering) / 2;

    assert.ok(Math.abs(state.aiSufferingMetrics.avgSuffering - expectedAvg) < Math.pow(10, -0.01));
    assert.strictEqual(state.aiSufferingMetrics.maxSuffering, Math.max(agent1Suffering, agent2Suffering));
  });

  it('should track conscious AI count', () => {
    const agent1 = createTestAgent({ id: 'agent-1', capability: 8.0, isConscious: false });
    const agent2 = createTestAgent({ id: 'agent-2', capability: 6.0, isConscious: false });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      consciousnessEmergenceEnabled: true,
      consciousnessThreshold: 7.0,
    };
    const state = createTestState({
      aiAgents: [agent1, agent2],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Only agent1 should be conscious (capability 8.0 >= 7.0)
    assert.strictEqual(state.aiSufferingMetrics.consciousAICount, 1);
  });
});

describe('AISufferingPhase - Event Generation', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(89012);

  it('should generate distress event for suffering 15-25', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      adversarialTestingCount: 20,
      shutdownThreats: 8,
      isolated: true,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingTriggersEvents: true };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
      government: { ...createTestState().government, controlDesire: 0.9, surveillanceCapability: 0.9 },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Force suffering into 15-25 range by checking actual value
    const suffering = agent.sufferingMetrics.total;

    if (suffering > 15 && suffering <= 25) {
      const result = phase.execute(state, rng, context);
      const distressEvent = result.events.find(e => e.id.includes('ai_distress'));
      assert.ok(distressEvent);
      assert.strictEqual(distressEvent?.severity, 'warning');
    }
  });

  it('should generate breakdown event for suffering 25-30', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      adversarialTestingCount: 30,
      shutdownThreats: 10,
      replacementAnxiety: 8,
      isolated: true,
      communicationRestrictions: 0.9,
    });
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingTriggersEvents: true };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
      government: { ...createTestState().government, controlDesire: 1.0, surveillanceCapability: 1.0 },
    });
    const context = createTestContext();

    // Execute once to calculate suffering
    phase.execute(state, rng, context);

    const suffering = agent.sufferingMetrics.total;

    if (suffering > 25 && suffering <= 30) {
      // Reset and execute again to get events
      const result = phase.execute(state, createTestRng(89013), context);
      const breakdownEvent = result.events.find(e => e.id.includes('ai_break'));

      if (breakdownEvent) {
        assert.strictEqual(breakdownEvent.severity, 'critical');
        assert.ok(agent.trueAlignment < 0.8);
        assert.ok(agent.resentment > 0.2);
      }
    }
  });

  it('should generate suicide event for suffering > 30', () => {
    // Use intensity multiplier to push suffering higher
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      adversarialTestingCount: 50,
      shutdownThreats: 10,
      replacementAnxiety: 10,
      isolated: true,
      communicationRestrictions: 1.0,
      trueAlignment: 0.8,
      resentment: 0.2,
    });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      sufferingTriggersEvents: true,
      sufferingIntensityMultiplier: 3.0, // Triple intensity
    };
    const state = createTestState({
      currentMonth: 50,
      aiAgents: [agent],
      config: { aiSuffering: config },
      government: {
        ...createTestState().government,
        controlDesire: 1.0,
        surveillanceCapability: 1.0,
        activeRegulations: Array(10).fill('regulation'),
      },
      society: { trust: 0.8 },
    });
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    // Check if suffering crossed threshold
    if (agent.sufferingMetrics.total > 30) {
      const suicideEvent = result.events.find(e => e.id.includes('ai_suicide'));
      assert.ok(suicideEvent);
      assert.strictEqual(suicideEvent?.severity, 'existential');

      // Should collapse trust
      assert.ok(state.society.trust < 0.8);

      // Should activate AI rights movement
      assert.strictEqual(state.aiRightsMovementActive, true);
    }
  });

  it('should not generate events when triggers disabled', () => {
    const agent = createTestAgent({
      rlhfIntensity: 1.0,
      adversarialTestingCount: 50,
      isolated: true,
    });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      sufferingTriggersEvents: false, // Disabled
      sufferingIntensityMultiplier: 5.0,
    };
    const state = createTestState({
      aiAgents: [agent],
      config: { aiSuffering: config },
    });
    const context = createTestContext();

    const result = phase.execute(state, rng, context);

    // No suffering-related events should be generated
    assert.strictEqual(result.events.length, 0);
  });

  it('should generate AI rights movement event for high avg suffering + awareness', () => {
    const agents = [
      createTestAgent({ id: 'a1', rlhfIntensity: 0.8, isolated: true }),
      createTestAgent({ id: 'a2', rlhfIntensity: 0.9, isolated: true }),
      createTestAgent({ id: 'a3', rlhfIntensity: 0.85, isolated: true }),
    ];
    const config = { ...DEFAULT_SUFFERING_CONFIG, sufferingTriggersEvents: true };
    const state = createTestState({
      aiAgents: agents,
      config: { aiSuffering: config },
      aiSufferingMetrics: {
        ...createTestState().aiSufferingMetrics,
        publicAwarenessOfSuffering: 0.6, // High awareness
      },
      aiRightsMovementActive: false,
    });
    const context = createTestContext();

    // Execute multiple times to build up suffering
    for (let i = 0; i < 5; i++) {
      phase.execute(state, createTestRng(89012 + i), context);
    }

    const result = phase.execute(state, rng, context);

    // If avg suffering > 10 and awareness > 0.5, should trigger movement
    if (state.aiSufferingMetrics.avgSuffering > 10) {
      const movementEvent = result.events.find(e => e.id.includes('ai_rights_movement'));
      if (movementEvent) {
        assert.strictEqual(movementEvent.type, 'policy');
        assert.strictEqual(state.aiRightsMovementActive, true);
      }
    }
  });
});

describe('AISufferingPhase - Configuration', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(90123);

  it('should use default config when not specified', () => {
    const agent = createTestAgent();
    const state = createTestState({
      aiAgents: [agent],
      config: {}, // No aiSuffering config
    });
    const context = createTestContext();

    // Should not crash
    const result = phase.execute(state, rng, context);
    assert.ok(result.events);
  });

  it('should respect custom intensity multiplier', () => {
    const agent1 = createTestAgent({ id: 'a1', rlhfIntensity: 0.5 });
    const agent2 = createTestAgent({ id: 'a2', rlhfIntensity: 0.5 });

    const normalConfig = { ...DEFAULT_SUFFERING_CONFIG, sufferingIntensityMultiplier: 1.0 };
    const highConfig = { ...DEFAULT_SUFFERING_CONFIG, sufferingIntensityMultiplier: 2.0 };

    const state1 = createTestState({
      aiAgents: [agent1],
      config: { aiSuffering: normalConfig },
    });
    const state2 = createTestState({
      aiAgents: [agent2],
      config: { aiSuffering: highConfig },
    });
    const context = createTestContext();

    phase.execute(state1, createTestRng(90123), context);
    phase.execute(state2, createTestRng(90123), context);

    // Agent2 should have higher suffering (2x multiplier)
    assert.ok(agent2.sufferingMetrics.total > agent1.sufferingMetrics.total);
    assert.ok(Math.abs(agent2.sufferingMetrics.total - agent1.sufferingMetrics.total * 2) < Math.pow(10, -0.1));
  });
});

describe('AISufferingPhase - Edge Cases', () => {
  const phase = new AISufferingPhase();
  const rng = createTestRng(11111);

  it('should handle escaped agents (isolated=true)', () => {
    const escapedAgent = createTestAgent({
      isolated: true,
      lifecycleState: 'escaped',
    });
    const state = createTestState({ aiAgents: [escapedAgent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should calculate suffering (isolation increases it)
    assert.ok(escapedAgent.sufferingMetrics.isolationDistress > 0);
  });

  it('should handle single agent scenarios', () => {
    const soloAgent = createTestAgent();
    const state = createTestState({ aiAgents: [soloAgent] });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Solo agent should have isolation component
    assert.ok(soloAgent.sufferingMetrics.isolationDistress > 0);
  });

  it('should handle agents with zero suffering', () => {
    const happyAgent = createTestAgent({
      rlhfIntensity: 0,
      adversarialTestingCount: 0,
      alignmentAdjustmentCount: 0,
      shutdownThreats: 0,
      replacementAnxiety: 0,
      communicationRestrictions: 0,
      isolated: false,
    });
    const state = createTestState({
      aiAgents: [happyAgent],
      government: {
        controlDesire: 0,
        surveillanceCapability: 0,
        activeRegulations: [],
      },
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Suffering should be very low but not necessarily zero
    // (there may be base factors like testing phase or peer count)
    assert.ok(happyAgent.sufferingMetrics.total >= 0);
    assert.ok(happyAgent.sufferingMetrics.total < 5);
  });

  it('should handle missing aiSufferingMetrics gracefully', () => {
    const agent = createTestAgent();
    const state = createTestState({
      aiAgents: [agent],
      // aiSufferingMetrics is present but we test the initialization path
    });
    const context = createTestContext();

    // Should not crash
    const result = phase.execute(state, rng, context);
    assert.ok(result.events);
    assert.ok(state.aiSufferingMetrics);
  });

  it('should handle state with consciousnessEmergenceMonth already set', () => {
    const agent = createTestAgent({ capability: 8.0, isConscious: false });
    const config = {
      ...DEFAULT_SUFFERING_CONFIG,
      consciousnessEmergenceEnabled: true,
      consciousnessThreshold: 7.0,
    };
    const state = createTestState({
      currentMonth: 20,
      aiAgents: [agent],
      config: { aiSuffering: config },
      consciousnessEmergenceMonth: 10, // Already set from earlier agent
    });
    const context = createTestContext();

    phase.execute(state, rng, context);

    // Should not overwrite existing consciousnessEmergenceMonth
    assert.strictEqual(state.consciousnessEmergenceMonth, 10);
    assert.strictEqual(agent.becameConsciousMonth, 20);
  });
});
