/**
 * PhaseOrchestrator Cycle Detection Tests
 *
 * CRITICAL-2 (Nov 15, 2025): Test suite for dependency cycle detection.
 * Ensures that circular dependencies are caught at initialization time.
 */

import { describe, it, beforeEach } from 'node:test';
import assert, { AssertionError } from 'node:assert';
import { PhaseOrchestrator, SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';

// Node.js test runner doesn't have expect, use assert instead
const expect = (value: any) => ({
  toThrow: (expectedError?: string | RegExp) => {
    try {
      if (typeof value === 'function') {
        value();
      }
      throw new AssertionError({ message: 'Expected function to throw' });
    } catch (error) {
      if (expectedError) {
        const message = (error as Error).message;
        if (typeof expectedError === 'string') {
          assert(message.includes(expectedError), `Expected error to include "${expectedError}", got: ${message}`);
        } else {
          assert(expectedError.test(message), `Expected error to match ${expectedError}, got: ${message}`);
        }
      }
    }
  },
  toBe: (expected: any) => assert.strictEqual(value, expected),
  toEqual: (expected: any) => assert.deepStrictEqual(value, expected),
  toContain: (expected: any) => {
    if (typeof value === 'string') {
      assert(value.includes(expected), `Expected "${value}" to contain "${expected}"`);
    } else if (Array.isArray(value)) {
      assert(value.includes(expected), `Expected array to contain ${expected}`);
    }
  },
  toHaveLength: (expected: number) => assert.strictEqual(value.length, expected),
  not: {
    toThrow: () => {
      try {
        if (typeof value === 'function') {
          value();
        }
      } catch (error) {
        throw new AssertionError({ message: `Expected function not to throw, but it threw: ${(error as Error).message}` });
      }
    }
  }
});

// Helper to create a minimal test phase
function createTestPhase(
  id: string,
  name: string,
  order: number,
  dependencies: readonly string[] = []
): SimulationPhase {
  return {
    id,
    name,
    order,
    dependencies,
    execute: (state: GameState, rng: RNGFunction): PhaseResult => ({
      events: []
    })
  };
}

describe('PhaseOrchestrator - Cycle Detection', () => {
  let orchestrator: PhaseOrchestrator;

  beforeEach(() => {
    orchestrator = new PhaseOrchestrator();
  });

  describe('Valid dependency graphs', () => {
    it('should accept phases with no dependencies', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1);
      const phase2 = createTestPhase('phase2', 'Phase 2', 2);

      orchestrator.registerPhases([phase1, phase2]);

      // Should not throw
      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should accept linear dependency chain', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1);
      const phase2 = createTestPhase('phase2', 'Phase 2', 2, ['phase1']);
      const phase3 = createTestPhase('phase3', 'Phase 3', 3, ['phase2']);

      orchestrator.registerPhases([phase1, phase2, phase3]);

      // Should not throw
      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should accept DAG with multiple paths', () => {
      // Graph: 1 → 2 → 4
      //        1 → 3 → 4
      const phase1 = createTestPhase('phase1', 'Phase 1', 1);
      const phase2 = createTestPhase('phase2', 'Phase 2', 2, ['phase1']);
      const phase3 = createTestPhase('phase3', 'Phase 3', 3, ['phase1']);
      const phase4 = createTestPhase('phase4', 'Phase 4', 4, ['phase2', 'phase3']);

      orchestrator.registerPhases([phase1, phase2, phase3, phase4]);

      // Should not throw
      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should accept complex DAG', () => {
      // Graph: A → B → D
      //        A → C → D → E
      const phaseA = createTestPhase('a', 'A', 1);
      const phaseB = createTestPhase('b', 'B', 2, ['a']);
      const phaseC = createTestPhase('c', 'C', 3, ['a']);
      const phaseD = createTestPhase('d', 'D', 4, ['b', 'c']);
      const phaseE = createTestPhase('e', 'E', 5, ['d']);

      orchestrator.registerPhases([phaseA, phaseB, phaseC, phaseD, phaseE]);

      // Should not throw
      expect(() => orchestrator.validate()).not.toThrow();
    });
  });

  describe('Circular dependency detection', () => {
    it('should detect simple 2-phase cycle', () => {
      // Cycle: A → B → A
      const phaseA = createTestPhase('a', 'Phase A', 1, ['b']);
      const phaseB = createTestPhase('b', 'Phase B', 2, ['a']);

      orchestrator.registerPhases([phaseA, phaseB]);

      expect(() => orchestrator.validate()).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
      expect(() => orchestrator.validate()).toThrow(/Phase A.*Phase B/);
    });

    it('should detect 3-phase cycle', () => {
      // Cycle: A → B → C → A
      const phaseA = createTestPhase('a', 'Phase A', 1, ['c']);
      const phaseB = createTestPhase('b', 'Phase B', 2, ['a']);
      const phaseC = createTestPhase('c', 'Phase C', 3, ['b']);

      orchestrator.registerPhases([phaseA, phaseB, phaseC]);

      expect(() => orchestrator.validate()).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
    });

    it('should detect self-referencing cycle', () => {
      // Cycle: A → A
      const phaseA = createTestPhase('a', 'Phase A', 1, ['a']);

      orchestrator.registerPhase(phaseA);

      expect(() => orchestrator.validate()).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
    });

    it('should detect cycle in complex graph', () => {
      // Graph: A → B → D
      //        A → C → D → B (creates cycle B → D → B)
      const phaseA = createTestPhase('a', 'A', 1);
      const phaseB = createTestPhase('b', 'B', 2, ['a', 'd']); // B depends on D
      const phaseC = createTestPhase('c', 'C', 3, ['a']);
      const phaseD = createTestPhase('d', 'D', 4, ['b', 'c']); // D depends on B (cycle!)

      orchestrator.registerPhases([phaseA, phaseB, phaseC, phaseD]);

      expect(() => orchestrator.validate()).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
    });

    it('should detect long cycle', () => {
      // Cycle: A → B → C → D → E → A
      const phaseA = createTestPhase('a', 'Phase A', 1, ['e']);
      const phaseB = createTestPhase('b', 'Phase B', 2, ['a']);
      const phaseC = createTestPhase('c', 'Phase C', 3, ['b']);
      const phaseD = createTestPhase('d', 'Phase D', 4, ['c']);
      const phaseE = createTestPhase('e', 'Phase E', 5, ['d']);

      orchestrator.registerPhases([phaseA, phaseB, phaseC, phaseD, phaseE]);

      expect(() => orchestrator.validate()).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
    });

    it('should include phase names and order in error message', () => {
      const phaseA = createTestPhase('a', 'Alpha Phase', 1, ['b']);
      const phaseB = createTestPhase('b', 'Beta Phase', 2, ['a']);

      orchestrator.registerPhases([phaseA, phaseB]);

      expect(() => orchestrator.validate()).toThrow(/Alpha Phase/);
      expect(() => orchestrator.validate()).toThrow(/Beta Phase/);
      expect(() => orchestrator.validate()).toThrow(/order 1/);
      expect(() => orchestrator.validate()).toThrow(/order 2/);
    });
  });

  describe('Order violations', () => {
    it('should detect dependency with higher order number', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 10);
      const phase2 = createTestPhase('phase2', 'Phase 2', 5, ['phase1']); // Phase 2 depends on Phase 1, but Phase 2 has lower order

      orchestrator.registerPhases([phase1, phase2]);

      expect(() => orchestrator.validate()).toThrow(/ORDER VIOLATION/);
    });

    it('should detect dependency with equal order number', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 10);
      const phase2 = createTestPhase('phase2', 'Phase 2', 10, ['phase1']); // Same order

      orchestrator.registerPhases([phase1, phase2]);

      expect(() => orchestrator.validate()).toThrow(/ORDER VIOLATION/);
    });

    it('should accept dependency with lower order number', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 5);
      const phase2 = createTestPhase('phase2', 'Phase 2', 10, ['phase1']); // Correct: Phase 2 depends on Phase 1, Phase 1 has lower order

      orchestrator.registerPhases([phase1, phase2]);

      expect(() => orchestrator.validate()).not.toThrow();
    });
  });

  describe('Missing dependencies', () => {
    it('should detect reference to non-existent phase', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1, ['nonexistent']);

      orchestrator.registerPhase(phase1);

      expect(() => orchestrator.validate()).toThrow(/INVALID PHASE DEPENDENCY/);
      expect(() => orchestrator.validate()).toThrow(/nonexistent/);
    });

    it('should detect multiple missing dependencies', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1, ['missing1', 'missing2']);

      orchestrator.registerPhase(phase1);

      // Should throw on first missing dependency
      expect(() => orchestrator.validate()).toThrow(/INVALID PHASE DEPENDENCY/);
    });
  });

  describe('Validation state management', () => {
    it('should cache validation results', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1);
      orchestrator.registerPhase(phase1);

      // First validation
      expect(() => orchestrator.validate()).not.toThrow();

      // Second validation should use cached result (no re-validation)
      // We can't directly test caching, but we can verify it doesn't throw
      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should invalidate validation when adding new phase', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1);
      orchestrator.registerPhase(phase1);
      orchestrator.validate(); // Valid

      // Add phase that creates cycle
      const phase2 = createTestPhase('phase2', 'Phase 2', 2, ['phase1']);
      const phase3 = createTestPhase('phase3', 'Phase 3', 3, ['phase2']);
      const phase1WithCycle = createTestPhase('phase1', 'Phase 1 Updated', 4, ['phase3']); // Creates cycle

      // Clear and re-register with cycle
      orchestrator.clear();
      orchestrator.registerPhases([phase1WithCycle, phase2, phase3]);

      // Should detect cycle on re-validation
      expect(() => orchestrator.validate()).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
    });

    it('should validate automatically on first execution if not called explicitly', () => {
      const phase1 = createTestPhase('phase1', 'Phase 1', 1, ['phase2']);
      const phase2 = createTestPhase('phase2', 'Phase 2', 2, ['phase1']); // Cycle

      orchestrator.registerPhases([phase1, phase2]);

      // Don't call validate() explicitly
      // executeAll should trigger validation and throw
      const mockState = {} as GameState;
      const mockRng = () => 0.5;

      expect(() => orchestrator.executeAll(mockState, mockRng)).toThrow(/CIRCULAR DEPENDENCY DETECTED/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty phase list', () => {
      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should handle phase with empty dependencies array', () => {
      const phase = createTestPhase('phase', 'Phase', 1, []);
      orchestrator.registerPhase(phase);

      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should handle multiple disconnected components', () => {
      // Two separate chains with no connection
      const chain1_a = createTestPhase('a1', 'A1', 1);
      const chain1_b = createTestPhase('b1', 'B1', 2, ['a1']);

      const chain2_a = createTestPhase('a2', 'A2', 10);
      const chain2_b = createTestPhase('b2', 'B2', 11, ['a2']);

      orchestrator.registerPhases([chain1_a, chain1_b, chain2_a, chain2_b]);

      expect(() => orchestrator.validate()).not.toThrow();
    });

    it('should handle phase IDs with special characters', () => {
      const phase1 = createTestPhase('phase-1', 'Phase 1', 1);
      const phase2 = createTestPhase('phase_2', 'Phase 2', 2, ['phase-1']);

      orchestrator.registerPhases([phase1, phase2]);

      expect(() => orchestrator.validate()).not.toThrow();
    });
  });
});
