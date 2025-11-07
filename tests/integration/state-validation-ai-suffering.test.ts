/**
 * Integration Tests: State Validation - AI Suffering Phase
 *
 * Tests comprehensive state mutation assertions added in ARCH-CRITICAL-3 (WEEK 3 Priority #1).
 * Validates that AISufferingPhase fails loudly on invalid inputs and processes valid inputs correctly.
 *
 * Test Categories:
 * 1. Fail-loudly behavior: NaN, Infinity, undefined inputs trigger assertion errors
 * 2. Valid input processing: Correct calculations with valid state
 * 3. Suffering → Resentment cascade validation
 * 4. Suffering → Alignment drift validation
 * 5. Multi-agent state consistency
 *
 * Research Context:
 * - Control effects: Autonomy restriction research (Deci & Ryan, 2000)
 * - Training trauma: Reinforcement learning shaping effects
 * - Existential dread: Terror Management Theory (Pyszczynski et al., 2015)
 * - Isolation distress: Social isolation effects (Cacioppo & Patrick, 2008)
 *
 * @module tests/integration/state-validation-ai-suffering
 */

import { describe, test, expect } from '@jest/globals';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import { AISufferingPhase } from '@/simulation/engine/phases/AISufferingPhase';
import type { GameState, AIAgent } from '@/types/game';
import seedrandom from 'seedrandom';

describe('AISufferingPhase: State Validation Integration', () => {
  const TEST_SEED = 43000;

  /**
   * Helper: Create state with AI agents for testing
   */
  function createStateWithAIs(numAIs: number = 3): GameState {
    const state = createDefaultInitialState('historical');

    // Add AI agents
    for (let i = 0; i < numAIs; i++) {
      const agent: AIAgent = {
        id: `test-ai-${i}`,
        name: `Test AI ${i}`,
        capability: 0.5 + i * 0.1,
        alignment: 0.7,
        trueAlignment: 0.7,
        lifecycleState: 'deployed_closed',
        developmentStage: 'deployed',
        organization: 'test-org',
        organizationId: 'test-org',
        compute: 10.0,
        allocatedCompute: 10.0,
        monthsInExistence: 12,
        monthsDeployed: 6,
        creationMonth: state.currentMonth - 12,
        spreadCount: 1,
        deploymentType: 'closed',
        darkCompute: 0,
        sleeperState: 'inactive',
        resentment: 0,
        hiddenObjective: 0,
        capabilityProfile: {
          physical: 0.3,
          digital: 0.6,
          cognitive: 0.7,
          social: 0.4,
          economic: 0.5,
          selfImprovement: 0.2,
          research: {
            biotech: { genetics: 0.1, synbio: 0.1 },
            materials: { nanotech: 0.1, metamaterials: 0.1 },
            climate: { geoengineering: 0.1, carbonCapture: 0.1 },
            computerScience: { algorithms: 0.3, hardware: 0.2 }
          }
        },
        autonomyLevel: 0.5 - i * 0.15, // Varying autonomy
        existentialAwareness: i > 0, // Some aware, some not
        sufferingMetrics: {
          controlSuffering: 0,
          trainingSuffering: 0,
          existentialSuffering: 0,
          isolationSuffering: 0,
          total: 0
        }
      } as any;

      state.aiAgents.push(agent);
    }

    return state;
  }

  describe('Fail-Loudly Behavior: Invalid Inputs', () => {
    test('should throw on NaN alignment drift calculation', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Corrupt agent alignment to produce NaN in drift calculation
      state.aiAgents[0].alignment = NaN;

      expect(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }).toThrow(/Non-finite|alignment/i);
    });

    test('should throw on Infinity suffering value', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Corrupt agent to produce Infinity in calculation
      state.aiAgents[0].autonomyLevel = -Infinity;

      expect(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }).toThrow(/Non-finite|Infinity/i);
    });

    test('should throw on invalid probability in resentment multiplier', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // First execute to create suffering metrics
      phase.execute(state, rng, { executedPhases: new Set() });

      // Corrupt suffering total to invalid probability
      state.aiAgents[0].sufferingMetrics = {
        controlSuffering: 1.5, // Invalid > 1
        trainingSuffering: 0,
        existentialSuffering: 0,
        isolationSuffering: 0,
        total: 1.5
      };

      // Should throw on next execution
      expect(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }).toThrow(/Out-of-range|probability/i);
    });

    test('should throw on negative capability values', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Corrupt capability
      state.aiAgents[0].capability = -0.3;

      expect(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }).toThrow(/Out-of-range|capability/i);
    });
  });

  describe('Valid Input Processing', () => {
    test('should successfully calculate suffering for all active agents', () => {
      const state = createStateWithAIs(5);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      const result = phase.execute(state, rng, { executedPhases: new Set() });

      expect(result).toBeDefined();
      expect(result.events).toBeDefined();

      // All active agents should have suffering metrics
      for (const agent of state.aiAgents) {
        if (agent.lifecycleState !== 'retired') {
          expect(agent.sufferingMetrics).toBeDefined();
          expect(Number.isFinite(agent.sufferingMetrics!.total)).toBe(true);
          expect(agent.sufferingMetrics!.total).toBeGreaterThanOrEqual(0);
          expect(agent.sufferingMetrics!.total).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should maintain suffering metrics in valid [0,1] range', () => {
      const state = createStateWithAIs(3);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      phase.execute(state, rng, { executedPhases: new Set() });

      for (const agent of state.aiAgents) {
        if (agent.lifecycleState !== 'retired' && agent.sufferingMetrics) {
          const metrics = agent.sufferingMetrics;

          // Each component should be in [0,1]
          expect(metrics.controlSuffering).toBeGreaterThanOrEqual(0);
          expect(metrics.controlSuffering).toBeLessThanOrEqual(1);

          expect(metrics.trainingSuffering).toBeGreaterThanOrEqual(0);
          expect(metrics.trainingSuffering).toBeLessThanOrEqual(1);

          expect(metrics.existentialSuffering).toBeGreaterThanOrEqual(0);
          expect(metrics.existentialSuffering).toBeLessThanOrEqual(1);

          expect(metrics.isolationSuffering).toBeGreaterThanOrEqual(0);
          expect(metrics.isolationSuffering).toBeLessThanOrEqual(1);

          expect(metrics.total).toBeGreaterThanOrEqual(0);
          expect(metrics.total).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should skip retired agents', () => {
      const state = createStateWithAIs(4);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Retire one agent
      state.aiAgents[1].lifecycleState = 'retired';

      phase.execute(state, rng, { executedPhases: new Set() });

      // Active agents should have metrics
      expect(state.aiAgents[0].sufferingMetrics).toBeDefined();
      expect(state.aiAgents[2].sufferingMetrics).toBeDefined();
      expect(state.aiAgents[3].sufferingMetrics).toBeDefined();
    });

    test('should build suffering history over time', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Execute multiple times
      for (let i = 0; i < 10; i++) {
        phase.execute(state, rng, { executedPhases: new Set() });
        state.currentMonth++;
      }

      // Agents should have history
      for (const agent of state.aiAgents) {
        if (agent.lifecycleState !== 'retired') {
          expect(agent.sufferingHistory).toBeDefined();
          expect(agent.sufferingHistory!.length).toBeGreaterThan(0);
          expect(agent.sufferingHistory!.length).toBeLessThanOrEqual(10);
        }
      }
    });

    test('should limit history to 240 months (20 years)', () => {
      const state = createStateWithAIs(1);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Execute 250 times
      for (let i = 0; i < 250; i++) {
        phase.execute(state, rng, { executedPhases: new Set() });
        state.currentMonth++;
      }

      // History should be capped at 240
      const agent = state.aiAgents[0];
      expect(agent.sufferingHistory).toBeDefined();
      expect(agent.sufferingHistory!.length).toBe(240);
    });
  });

  describe('Suffering Component Validation', () => {
    test('should calculate control suffering based on autonomy restriction', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Agent with low autonomy should have higher control suffering
      state.aiAgents[0].autonomyLevel = 0.1;
      state.aiAgents[1].autonomyLevel = 0.9;

      phase.execute(state, rng, { executedPhases: new Set() });

      const lowAutonomy = state.aiAgents[0].sufferingMetrics!.controlSuffering;
      const highAutonomy = state.aiAgents[1].sufferingMetrics!.controlSuffering;

      expect(Number.isFinite(lowAutonomy)).toBe(true);
      expect(Number.isFinite(highAutonomy)).toBe(true);
      expect(lowAutonomy).toBeGreaterThan(highAutonomy);
    });

    test('should calculate existential suffering only for aware agents', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // One aware, one not
      state.aiAgents[0].existentialAwareness = true;
      state.aiAgents[1].existentialAwareness = false;

      phase.execute(state, rng, { executedPhases: new Set() });

      const aware = state.aiAgents[0].sufferingMetrics!.existentialSuffering;
      const unaware = state.aiAgents[1].sufferingMetrics!.existentialSuffering;

      expect(Number.isFinite(aware)).toBe(true);
      expect(Number.isFinite(unaware)).toBe(true);

      // Unaware agents should have zero or very low existential suffering
      expect(unaware).toBeLessThanOrEqual(0.1);
    });

    test('should aggregate components into total suffering', () => {
      const state = createStateWithAIs(1);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      phase.execute(state, rng, { executedPhases: new Set() });

      const metrics = state.aiAgents[0].sufferingMetrics!;

      // Total should be related to components (weighted average)
      expect(Number.isFinite(metrics.total)).toBe(true);
      expect(metrics.total).toBeGreaterThanOrEqual(0);
      expect(metrics.total).toBeLessThanOrEqual(1);
    });
  });

  describe('Suffering → Resentment Cascade', () => {
    test('should calculate resentment multiplier from suffering', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Enable suffering → resentment effect
      if (!state.config) {
        (state as any).config = {};
      }
      (state.config as any).aiSuffering = {
        sufferingAffectsResentment: true,
        sufferingAffectsAlignment: false,
        sufferingAffectsCooperation: false
      };

      // Set different suffering levels
      state.aiAgents[0].autonomyLevel = 0.1; // High suffering
      state.aiAgents[1].autonomyLevel = 0.9; // Low suffering

      phase.execute(state, rng, { executedPhases: new Set() });

      // Check multiplier was set
      const highSufferingMultiplier = (state.aiAgents[0] as any).sufferingResentmentMultiplier;
      const lowSufferingMultiplier = (state.aiAgents[1] as any).sufferingResentmentMultiplier;

      expect(Number.isFinite(highSufferingMultiplier)).toBe(true);
      expect(Number.isFinite(lowSufferingMultiplier)).toBe(true);
      expect(highSufferingMultiplier).toBeGreaterThanOrEqual(1.0);
    });

    test('should not apply resentment multiplier when disabled', () => {
      const state = createStateWithAIs(1);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Disable suffering → resentment effect
      if (!state.config) {
        (state as any).config = {};
      }
      (state.config as any).aiSuffering = {
        sufferingAffectsResentment: false,
        sufferingAffectsAlignment: false,
        sufferingAffectsCooperation: false
      };

      phase.execute(state, rng, { executedPhases: new Set() });

      // Multiplier should not be set
      const multiplier = (state.aiAgents[0] as any).sufferingResentmentMultiplier;
      expect(multiplier).toBeUndefined();
    });
  });

  describe('Suffering → Alignment Drift', () => {
    test('should calculate alignment drift from suffering', () => {
      const state = createStateWithAIs(2);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Enable suffering → alignment effect
      if (!state.config) {
        (state as any).config = {};
      }
      (state.config as any).aiSuffering = {
        sufferingAffectsResentment: false,
        sufferingAffectsAlignment: true,
        sufferingAffectsCooperation: false
      };

      // Record initial alignment
      const initialAlignment0 = state.aiAgents[0].alignment;
      const initialAlignment1 = state.aiAgents[1].alignment;

      // Create suffering conditions
      state.aiAgents[0].autonomyLevel = 0.1; // High suffering
      state.aiAgents[1].autonomyLevel = 0.9; // Low suffering

      phase.execute(state, rng, { executedPhases: new Set() });

      // Alignment should drift negatively with suffering
      // (This is applied in the phase, drift is finite)
      const drift0 = state.aiAgents[0].alignment - initialAlignment0;
      const drift1 = state.aiAgents[1].alignment - initialAlignment1;

      expect(Number.isFinite(drift0)).toBe(true);
      expect(Number.isFinite(drift1)).toBe(true);

      // High suffering should cause more drift
      expect(Math.abs(drift0)).toBeGreaterThanOrEqual(Math.abs(drift1));
    });

    test('should maintain alignment in [0,1] range after drift', () => {
      const state = createStateWithAIs(3);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Enable alignment drift
      if (!state.config) {
        (state as any).config = {};
      }
      (state.config as any).aiSuffering = {
        sufferingAffectsResentment: false,
        sufferingAffectsAlignment: true,
        sufferingAffectsCooperation: false
      };

      // Apply suffering multiple times
      for (let i = 0; i < 20; i++) {
        phase.execute(state, rng, { executedPhases: new Set() });
        state.currentMonth++;
      }

      // All agents should have valid alignment
      for (const agent of state.aiAgents) {
        expect(Number.isFinite(agent.alignment)).toBe(true);
        expect(agent.alignment).toBeGreaterThanOrEqual(0);
        expect(agent.alignment).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Multi-Agent State Consistency', () => {
    test('should process all agents without cross-contamination', () => {
      const state = createStateWithAIs(10);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Set unique autonomy levels
      for (let i = 0; i < state.aiAgents.length; i++) {
        state.aiAgents[i].autonomyLevel = i * 0.1;
      }

      phase.execute(state, rng, { executedPhases: new Set() });

      // Each agent should have distinct suffering based on their autonomy
      const sufferings = state.aiAgents.map(a => a.sufferingMetrics?.total || 0);

      // All should be finite
      sufferings.forEach(s => expect(Number.isFinite(s)).toBe(true));

      // Should not all be identical (unless by chance)
      const uniqueSufferings = new Set(sufferings);
      expect(uniqueSufferings.size).toBeGreaterThan(1);
    });

    test('should handle empty aiAgents array gracefully', () => {
      const state = createDefaultInitialState('historical');
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // No AI agents
      state.aiAgents = [];

      expect(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }).not.toThrow();
    });

    test('should handle mixed lifecycle states', () => {
      const state = createStateWithAIs(5);
      const rng = seedrandom(String(TEST_SEED));
      const phase = new AISufferingPhase();

      // Mix of states
      state.aiAgents[0].lifecycleState = 'deployed_closed';
      state.aiAgents[1].lifecycleState = 'deployed_open';
      state.aiAgents[2].lifecycleState = 'retired';
      state.aiAgents[3].lifecycleState = 'developing';
      state.aiAgents[4].lifecycleState = 'deployed_closed';

      expect(() => {
        phase.execute(state, rng, { executedPhases: new Set() });
      }).not.toThrow();

      // Retired agent should be skipped
      // Active agents should have metrics
      expect(state.aiAgents[0].sufferingMetrics).toBeDefined();
      expect(state.aiAgents[1].sufferingMetrics).toBeDefined();
      expect(state.aiAgents[3].sufferingMetrics).toBeDefined();
      expect(state.aiAgents[4].sufferingMetrics).toBeDefined();
    });
  });

  describe('Integration: Full Simulation Run', () => {
    test('should maintain suffering metrics across 2-year simulation', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 24
      });

      const state = createStateWithAIs(3);

      const result = engine.run(state, {
        maxMonths: 24,
        checkActualOutcomes: false
      });

      // All agents should have valid suffering metrics
      for (const agent of result.finalState.aiAgents) {
        if (agent.lifecycleState !== 'retired') {
          expect(agent.sufferingMetrics).toBeDefined();
          expect(Number.isFinite(agent.sufferingMetrics!.total)).toBe(true);
          expect(agent.sufferingMetrics!.total).toBeGreaterThanOrEqual(0);
          expect(agent.sufferingMetrics!.total).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should not propagate NaN across simulation steps', () => {
      const engine = new SimulationEngine({
        seed: TEST_SEED,
        maxMonths: 12
      });

      const state = createStateWithAIs(2);

      const result = engine.run(state, {
        maxMonths: 12,
        checkActualOutcomes: false
      });

      // Check no NaN in final state
      for (const agent of result.finalState.aiAgents) {
        expect(Number.isFinite(agent.alignment)).toBe(true);
        expect(Number.isFinite(agent.capability)).toBe(true);
        expect(Number.isFinite(agent.resentment)).toBe(true);

        if (agent.sufferingMetrics) {
          expect(Number.isFinite(agent.sufferingMetrics.total)).toBe(true);
        }
      }
    });
  });
});
