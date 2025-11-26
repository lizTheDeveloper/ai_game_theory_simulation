/**
 * Deployment Smoke Test Suite (Roadmap 5.1)
 *
 * Quick tests that verify deployed version isn't broken.
 * Target: <60s total execution time.
 *
 * Tests:
 * 1. Simulation initializes and runs 12 months without crashes
 * 2. All phases execute in correct order
 * 3. No NaN/Infinity in any calculation
 * 4. State serialization/deserialization works
 * 5. Game layer can load simulation state
 *
 * @module tests/deployment/smoke-test
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import { mapGameStateToSnapshot, mapToEventLog, mapToDecisionsList } from '@/components/dashboards/game/stateMappers';

describe('Deployment Smoke Tests', () => {

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Deterministic RNG for testing
   */
  function createTestRng(seed: number = 42): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 2**32;
      return state / 2**32;
    };
  }

  /**
   * Check all numeric values in an object for NaN/Infinity
   */
  function checkForInvalidNumbers(obj: unknown, path: string = ''): string[] {
    const issues: string[] = [];

    if (obj === null || obj === undefined) {
      return issues;
    }

    if (typeof obj === 'number') {
      if (Number.isNaN(obj)) {
        issues.push(`NaN at ${path}`);
      } else if (!Number.isFinite(obj)) {
        issues.push(`Infinity at ${path}`);
      }
      return issues;
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < Math.min(obj.length, 100); i++) { // Limit array checking
        issues.push(...checkForInvalidNumbers(obj[i], `${path}[${i}]`));
      }
      return issues;
    }

    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        // Skip circular reference prone fields
        if (key === 'parent' || key === '_proxy' || key === '_validator') continue;
        issues.push(...checkForInvalidNumbers(value, path ? `${path}.${key}` : key));
      }
    }

    return issues;
  }

  // ============================================================================
  // Test 1: Simulation Initialization
  // ============================================================================

  describe('Simulation Initialization', () => {
    test('should initialize 2024 state without errors', () => {
      const rng = createTestRng(42);

      assert.doesNotThrow(() => {
        const state = initializeHistoricalSimulation(2024, rng, 'baseline');
        assert.ok(state, 'State should be created');
        assert.ok(state.currentMonth >= 0, 'Current month should be set');
      }, 'Should initialize without throwing');
    });

    test('should initialize default state without errors', () => {
      const rng = createTestRng(42);

      assert.doesNotThrow(() => {
        const state = createDefaultInitialState(rng);
        assert.ok(state, 'Default state should be created');
      }, 'Should create default state without throwing');
    });

    test('should have valid population', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      const population = state.humanPopulationSystem.population;
      assert.ok(population > 0, `Population should be positive: ${population}`);
      assert.ok(population < 20, `Population should be reasonable (in billions): ${population}`);
      assert.ok(Number.isFinite(population), `Population should be finite: ${population}`);
    });

    test('should have valid QoL', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      const qol = state.globalMetrics.qualityOfLife;
      assert.ok(qol >= 0 && qol <= 1, `QoL should be in [0,1]: ${qol}`);
      assert.ok(Number.isFinite(qol), `QoL should be finite: ${qol}`);
    });

    test('should have no NaN/Infinity in initial state', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      const issues = checkForInvalidNumbers(state.globalMetrics, 'globalMetrics');
      issues.push(...checkForInvalidNumbers(state.humanPopulationSystem, 'humanPopulationSystem'));
      issues.push(...checkForInvalidNumbers(state.government, 'government'));

      assert.strictEqual(issues.length, 0,
        `Should have no NaN/Infinity in initial state:\n${issues.slice(0, 10).join('\n')}`);
    });
  });

  // ============================================================================
  // Test 2: Simulation Execution (12 months)
  // ============================================================================

  describe('12-Month Simulation Run', () => {
    test('should run 12 months without crashes', async () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const engine = new SimulationEngine({ seed: 42 });

      for (let month = 0; month < 12; month++) {
        assert.doesNotThrow(() => {
          engine.step(state);
        }, `Should not crash at month ${month}`);
      }

      assert.strictEqual(state.currentMonth, 12,
        `Should advance to month 12: ${state.currentMonth}`);
    });

    test('should maintain positive population over 12 months', async () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const engine = new SimulationEngine({ seed: 42 });
      const initialPop = state.humanPopulationSystem.population;

      for (let month = 0; month < 12; month++) {
        engine.step(state);

        const currentPop = state.humanPopulationSystem.population;
        assert.ok(currentPop > 0, `Population should remain positive at month ${month}: ${currentPop}`);
        // Population shouldn't change by more than 50% in 12 months (catastrophic check)
        assert.ok(currentPop > initialPop * 0.5 && currentPop < initialPop * 1.5,
          `Population change should be reasonable at month ${month}: ${currentPop} vs initial ${initialPop}`);
      }
    });

    test('should have no NaN/Infinity after 12 months', async () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const engine = new SimulationEngine({ seed: 42 });

      for (let month = 0; month < 12; month++) {
        engine.step(state);
      }

      const issues = checkForInvalidNumbers(state.globalMetrics, 'globalMetrics');
      issues.push(...checkForInvalidNumbers(state.humanPopulationSystem, 'humanPopulationSystem'));

      assert.strictEqual(issues.length, 0,
        `Should have no NaN/Infinity after 12 months:\n${issues.slice(0, 10).join('\n')}`);
    });
  });

  // ============================================================================
  // Test 3: Phase Execution Order
  // ============================================================================

  describe('Phase Execution Order', () => {
    test('should execute phases in correct order', async () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const orchestrator = new PhaseOrchestrator();

      // Track which phases executed
      const executedPhases = orchestrator.getPhaseOrder();

      // Verify we have phases
      assert.ok(executedPhases.length > 20,
        `Should have >20 phases: ${executedPhases.length}`);

      // Verify phases are ordered
      let lastOrder = -Infinity;
      for (const phase of executedPhases) {
        assert.ok(phase.order >= lastOrder,
          `Phases should be in order: ${phase.name} (${phase.order}) after ${lastOrder}`);
        lastOrder = phase.order;
      }
    });

    test('should have critical phases in correct positions', async () => {
      const orchestrator = new PhaseOrchestrator();
      const phases = orchestrator.getPhaseOrder();

      // Map phase names to their orders
      const phaseMap = new Map(phases.map(p => [p.name, p.order]));

      // TimeAdvancementPhase should be first (order ~0.1)
      const timeAdvOrder = phaseMap.get('TimeAdvancementPhase');
      assert.ok(timeAdvOrder !== undefined && timeAdvOrder < 1,
        `TimeAdvancementPhase should be early: ${timeAdvOrder}`);

      // OutcomeClassificationPhase should be last (order > 9)
      const outcomeOrder = phaseMap.get('OutcomeClassificationPhase');
      assert.ok(outcomeOrder !== undefined && outcomeOrder > 9,
        `OutcomeClassificationPhase should be late: ${outcomeOrder}`);
    });
  });

  // ============================================================================
  // Test 4: State Serialization
  // ============================================================================

  describe('State Serialization', () => {
    test('should serialize state to JSON', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      let jsonString: string;
      assert.doesNotThrow(() => {
        jsonString = JSON.stringify(state);
      }, 'Should serialize without throwing');

      assert.ok(jsonString!.length > 1000,
        `Serialized state should be substantial: ${jsonString!.length} chars`);
    });

    test('should deserialize state from JSON', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      const jsonString = JSON.stringify(state);
      let deserialized: unknown;

      assert.doesNotThrow(() => {
        deserialized = JSON.parse(jsonString);
      }, 'Should deserialize without throwing');

      assert.ok(deserialized, 'Should have deserialized object');
      assert.strictEqual((deserialized as typeof state).currentMonth, state.currentMonth,
        'Deserialized currentMonth should match');
    });

    test('should preserve key fields through serialization', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const orchestrator = new PhaseOrchestrator();

      // Run a few months
      for (let i = 0; i < 3; i++) {
        orchestrator.executeStep(state, rng);
      }

      const jsonString = JSON.stringify(state);
      const deserialized = JSON.parse(jsonString);

      // Check key fields
      assert.strictEqual(deserialized.currentMonth, state.currentMonth,
        'currentMonth should be preserved');
      assert.strictEqual(deserialized.humanPopulationSystem.population,
        state.humanPopulationSystem.population,
        'population should be preserved');
      assert.strictEqual(deserialized.globalMetrics.qualityOfLife,
        state.globalMetrics.qualityOfLife,
        'qualityOfLife should be preserved');
    });
  });

  // ============================================================================
  // Test 5: Game Layer Integration
  // ============================================================================

  describe('Game Layer Integration', () => {
    test('should map state to snapshot', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      let snapshot: ReturnType<typeof mapGameStateToSnapshot>;
      assert.doesNotThrow(() => {
        snapshot = mapGameStateToSnapshot(state);
      }, 'Should map to snapshot without throwing');

      assert.ok(snapshot!, 'Should produce snapshot');
      assert.ok(snapshot!.population > 0, 'Snapshot should have population');
      assert.ok(snapshot!.qolMetrics, 'Snapshot should have QoL metrics');
    });

    test('should map state to event log', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const orchestrator = new PhaseOrchestrator();

      // Run to generate events
      for (let i = 0; i < 3; i++) {
        orchestrator.executeStep(state, rng);
      }

      let events: ReturnType<typeof mapToEventLog>;
      assert.doesNotThrow(() => {
        events = mapToEventLog(state);
      }, 'Should map to event log without throwing');

      assert.ok(Array.isArray(events), 'Should produce event array');
    });

    test('should map state to decisions list', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');

      let decisions: ReturnType<typeof mapToDecisionsList>;
      assert.doesNotThrow(() => {
        decisions = mapToDecisionsList(state);
      }, 'Should map to decisions list without throwing');

      assert.ok(Array.isArray(decisions), 'Should produce decisions array');
    });

    test('should handle full pipeline: init -> run -> map', () => {
      const rng = createTestRng(42);
      const state = initializeHistoricalSimulation(2024, rng, 'baseline');
      const orchestrator = new PhaseOrchestrator();

      // Run 6 months
      for (let i = 0; i < 6; i++) {
        orchestrator.executeStep(state, rng);
      }

      // Map to all game layer formats
      const snapshot = mapGameStateToSnapshot(state);
      const events = mapToEventLog(state);
      const decisions = mapToDecisionsList(state);

      // Verify outputs
      assert.ok(snapshot.population > 0, 'Pipeline should produce valid snapshot');
      assert.ok(Array.isArray(events), 'Pipeline should produce valid events');
      assert.ok(Array.isArray(decisions), 'Pipeline should produce valid decisions');
    });
  });
});
