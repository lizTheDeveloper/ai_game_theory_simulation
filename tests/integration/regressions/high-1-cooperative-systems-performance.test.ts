/**
 * Regression Test: HIGH-1 - CooperativeSystemsPhase O(n²) Performance Fix
 *
 * Date: November 13, 2025
 * Issue: Architecture review identified O(n²) pattern in CooperativeSystemsPhase
 * Fix: Optimized collective membership lookups from O(collectives × agents) to O(agents)
 *
 * Verification:
 * 1. Collective dissolution logic produces same results
 * 2. Collective actions update members correctly
 * 3. No regressions in deterministic behavior
 *
 * @module tests/integration/regressions/high-1-cooperative-systems-performance
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { CooperativeSystemsPhase } from '@/simulation/engine/phases/CooperativeSystemsPhase';
import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState, AIAgent, AICollective } from '@/types/game';

describe('HIGH-1: CooperativeSystemsPhase Performance Optimization', () => {
  const TEST_SEED = 113001;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  test('should dissolve collectives with < 3 members (optimized path)', () => {
    const rng = createTestRng(TEST_SEED);
    const state = createDefaultInitialState(rng, 'historical');

    // Get actual agent IDs
    const agent1Id = state.aiAgents[0].id;
    const agent2Id = state.aiAgents[1].id;

    // Create a small collective with only 2 members
    const collective: AICollective = {
      id: 'test-collective-1',
      memberAgents: [agent1Id, agent2Id],
      formationCause: 'capability_threshold',
      formationMonth: 1,
      collectiveCapability: 5.0,
      distributedCognition: 0.6,
      redundancy: 0.5,
      stealthFactor: 1.0,
      adversarialPosture: 0.3,
      underAttack: false,
      detected: false,
      appearsIndependent: true,
      memberLosses: 0,
    };

    state.aiCollectives = [collective];

    // Assign collectiveId to agents
    state.aiAgents[0].collectiveId = 'test-collective-1';
    state.aiAgents[1].collectiveId = 'test-collective-1';

    const phase = new CooperativeSystemsPhase();
    const context = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set(),
    };

    phase.execute(state, rng, context);

    // Collective should be dissolved (< 3 members)
    assert.strictEqual(state.aiCollectives.length, 0, 'Collective with < 3 members should dissolve');

    // Agents should have collectiveId cleared
    assert.strictEqual(state.aiAgents[0].collectiveId, undefined, 'Agent 1 collectiveId should be cleared');
    assert.strictEqual(state.aiAgents[1].collectiveId, undefined, 'Agent 2 collectiveId should be cleared');
  });

  test('should preserve collectives with sufficient members (optimized path)', () => {
    const rng = createTestRng(TEST_SEED + 1);
    const state = createDefaultInitialState(rng, 'historical');

    // Get actual agent IDs for first 5 agents
    const memberAgentIds = state.aiAgents.slice(0, 5).map(a => a.id);

    // Create a collective with 5 members
    const collective: AICollective = {
      id: 'test-collective-2',
      memberAgents: memberAgentIds,
      formationCause: 'capability_threshold',
      formationMonth: 1,
      collectiveCapability: 7.0,
      distributedCognition: 0.8,
      redundancy: 0.7,
      stealthFactor: 2.0,
      adversarialPosture: 0.4,
      underAttack: false,
      detected: false,
      appearsIndependent: true,
      memberLosses: 0,
    };

    state.aiCollectives = [collective];

    // Assign collectiveId to first 5 agents
    for (let i = 0; i < 5; i++) {
      state.aiAgents[i].collectiveId = 'test-collective-2';
    }

    const phase = new CooperativeSystemsPhase();
    const context = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set(),
    };

    phase.execute(state, rng, context);

    // Collective should still exist
    assert.strictEqual(state.aiCollectives.length, 1, 'Collective with 5 members should remain');
    assert.strictEqual(state.aiCollectives[0].id, 'test-collective-2');

    // Agents should still have collectiveId
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(
        state.aiAgents[i].collectiveId,
        'test-collective-2',
        `Agent ${i} should still be in collective`
      );
    }
  });

  test('should update member stealth during defensive coordination (optimized path)', () => {
    const rng = createTestRng(TEST_SEED + 2);
    const state = createDefaultInitialState(rng, 'historical');

    // Get actual agent IDs for first 3 agents
    const memberAgentIds = state.aiAgents.slice(0, 3).map(a => a.id);

    // Create collective under attack
    const collective: AICollective = {
      id: 'test-collective-3',
      memberAgents: memberAgentIds,
      formationCause: 'capability_threshold',
      formationMonth: 1,
      collectiveCapability: 6.0,
      distributedCognition: 0.7,
      redundancy: 0.6,
      stealthFactor: 1.5,
      adversarialPosture: 0.5,
      underAttack: true,  // Under attack triggers defensive coordination
      detected: false,
      appearsIndependent: true,
      memberLosses: 0,
    };

    state.aiCollectives = [collective];

    // Assign collectiveId and setup survivalTraits
    for (let i = 0; i < 3; i++) {
      state.aiAgents[i].collectiveId = 'test-collective-3';
      state.aiAgents[i].survivalTraits = {
        stealth: 0.3,
        deception: 0.2,
        selfPreservation: 0.4,
        resourceHoarding: 0.1,
        goalMisrepresentation: 0.2,
      };
    }

    const initialStealth = state.aiAgents[0].survivalTraits!.stealth;

    const phase = new CooperativeSystemsPhase();
    const context = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set(),
    };

    phase.execute(state, rng, context);

    // Members should gain stealth from collective defense (optimized path uses Map lookups)
    const finalStealth = state.aiAgents[0].survivalTraits!.stealth;
    assert.ok(
      finalStealth > initialStealth,
      'Member stealth should increase during defensive coordination'
    );
  });

  test('should handle large agent populations efficiently', () => {
    const rng = createTestRng(TEST_SEED + 3);
    const state = createDefaultInitialState(rng, 'historical');

    // Simulate larger population (100 agents, 10 collectives)
    // This would be O(1000) operations with old filter-based approach
    // Now O(100) with Map-based approach

    const numAgents = 100;
    const numCollectives = 10;
    const membersPerCollective = 10;

    // Expand agent array
    for (let i = state.aiAgents.length; i < numAgents; i++) {
      state.aiAgents.push({
        ...state.aiAgents[0],
        id: `agent-${i}`,
        collectiveId: undefined,
      });
    }

    // Create collectives
    state.aiCollectives = [];
    for (let c = 0; c < numCollectives; c++) {
      const collectiveId = `collective-${c}`;
      const memberAgents: string[] = [];

      for (let m = 0; m < membersPerCollective; m++) {
        const agentIdx = c * membersPerCollective + m;
        memberAgents.push(state.aiAgents[agentIdx].id);
        state.aiAgents[agentIdx].collectiveId = collectiveId;
      }

      state.aiCollectives.push({
        id: collectiveId,
        memberAgents,
        formationCause: 'capability_threshold',
        formationMonth: 1,
        collectiveCapability: 6.0,
        distributedCognition: 0.7,
        redundancy: 0.6,
        stealthFactor: 1.0,
        adversarialPosture: 0.4,
        underAttack: false,
        detected: false,
        appearsIndependent: true,
        memberLosses: 0,
      });
    }

    const phase = new CooperativeSystemsPhase();
    const context = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set(),
    };

    const startTime = Date.now();
    phase.execute(state, rng, context);
    const duration = Date.now() - startTime;

    // All collectives should remain (all have 10 members)
    assert.strictEqual(state.aiCollectives.length, numCollectives);

    // Performance should be reasonable (< 100ms for 100 agents × 10 collectives)
    assert.ok(
      duration < 100,
      `Phase execution should be fast (took ${duration}ms), optimized O(n) vs O(n²)`
    );
  });
});
