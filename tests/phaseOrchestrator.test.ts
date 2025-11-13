/**
 * PhaseOrchestrator Tests
 *
 * Validates phase dependency validation, circular dependency detection,
 * and explicit validation.
 *
 * CRITICAL-2 FIX (Nov 10, 2025): Explicit validate() method to catch
 * circular dependencies BEFORE first execution.
 */

import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert';
import { PhaseOrchestrator, SimulationPhase, PhaseResult } from '@/simulation/engine/PhaseOrchestrator';
import { GameState } from '@/types/game';

describe('PhaseOrchestrator - Dependency Validation', () => {
  let orchestrator: PhaseOrchestrator;

  beforeEach(() => {
    orchestrator = new PhaseOrchestrator();
  });

  /**
   * Helper: Create a minimal mock phase
   */
  function createMockPhase(
    id: string,
    order: number,
    dependencies?: readonly string[]
  ): SimulationPhase {
    return {
      id,
      name: `Phase ${id}`,
      order,
      dependencies,
      execute(state: GameState): PhaseResult {
        return { events: [] };
      }
    };
  }

  it('should register phase without dependencies successfully', () => {
    const phase = createMockPhase('test-phase', 1.0);

    assert.doesNotThrow(() => {
      orchestrator.registerPhase(phase);
    });

    assert.strictEqual(orchestrator.getPhaseCount(), 1);
  });

  it('should register phases with valid dependencies successfully', () => {
    const phaseA = createMockPhase('phase-a', 1.0);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);
    const phaseC = createMockPhase('phase-c', 3.0, ['phase-b']);

    assert.doesNotThrow(() => {
      orchestrator.registerPhases([phaseA, phaseB, phaseC]);
      orchestrator.validate();
    });

    assert.strictEqual(orchestrator.getPhaseCount(), 3);
  });

  it('should detect circular dependency: A → B → A', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['phase-b']);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);

    orchestrator.registerPhases([phaseA, phaseB]);

    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error',
        message: /CIRCULAR DEPENDENCY DETECTED/
      }
    );
  });

  it('should detect circular dependency: A → B → C → A', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['phase-c']);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);
    const phaseC = createMockPhase('phase-c', 3.0, ['phase-b']);

    orchestrator.registerPhases([phaseA, phaseB, phaseC]);

    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error',
        message: /CIRCULAR DEPENDENCY DETECTED/
      }
    );
  });

  it('should detect self-referential circular dependency: A → A', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['phase-a']);

    orchestrator.registerPhase(phaseA);

    // Note: Self-reference is caught by order validation (order 1 >= 1) before cycle check
    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error'
      }
    );
  });

  it('should detect invalid phase dependency (missing phase)', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['non-existent-phase']);

    orchestrator.registerPhase(phaseA);

    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error',
        message: /INVALID PHASE DEPENDENCY/
      }
    );
  });

  it('should detect order violation (dependency has higher order)', () => {
    const phaseA = createMockPhase('phase-a', 2.0);
    const phaseB = createMockPhase('phase-b', 1.0, ['phase-a']);

    orchestrator.registerPhases([phaseA, phaseB]);

    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error',
        message: /PHASE DEPENDENCY ORDER VIOLATION/
      }
    );
  });

  it('should allow registration of phases before validation', () => {
    // This is the key fix: phases can be registered in any order,
    // validation happens explicitly
    const phaseA = createMockPhase('phase-a', 1.0, ['phase-b']);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);

    assert.doesNotThrow(() => {
      orchestrator.registerPhase(phaseA);
      orchestrator.registerPhase(phaseB);
    });

    // But validation catches the cycle
    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error',
        message: /CIRCULAR DEPENDENCY DETECTED/
      }
    );
  });

  it('should validate on first executeAll() if not called explicitly', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['phase-b']);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);

    orchestrator.registerPhases([phaseA, phaseB]);

    // Don't call validate() explicitly
    // executeAll() should trigger validation and throw
    const mockState = { currentMonth: 1 } as GameState;
    const rng = () => 0.5;

    assert.throws(
      () => orchestrator.executeAll(mockState, rng),
      {
        name: 'Error',
        message: /CIRCULAR DEPENDENCY DETECTED/
      }
    );
  });

  it('should handle complex dependency graph correctly', () => {
    //     A (1.0)
    //    / \
    //   B   C (2.0, 2.5)
    //    \ /
    //     D (3.0)

    const phaseA = createMockPhase('phase-a', 1.0);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);
    const phaseC = createMockPhase('phase-c', 2.5, ['phase-a']);
    const phaseD = createMockPhase('phase-d', 3.0, ['phase-b', 'phase-c']);

    assert.doesNotThrow(() => {
      orchestrator.registerPhases([phaseA, phaseB, phaseC, phaseD]);
      orchestrator.validate();
    });

    assert.strictEqual(orchestrator.getPhaseCount(), 4);
  });

  it('should detect cycle in complex graph: diamond with back edge', () => {
    //     A (1.0) ← D (back edge creates cycle)
    //    / \
    //   B   C (2.0, 2.5)
    //    \ /
    //     D (3.0)

    const phaseA = createMockPhase('phase-a', 1.0, ['phase-d']);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);
    const phaseC = createMockPhase('phase-c', 2.5, ['phase-a']);
    const phaseD = createMockPhase('phase-d', 3.0, ['phase-b', 'phase-c']);

    orchestrator.registerPhases([phaseA, phaseB, phaseC, phaseD]);

    assert.throws(
      () => orchestrator.validate(),
      {
        name: 'Error',
        message: /CIRCULAR DEPENDENCY DETECTED/
      }
    );
  });

  it('should validate multiple times without error if no changes', () => {
    const phaseA = createMockPhase('phase-a', 1.0);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);

    orchestrator.registerPhases([phaseA, phaseB]);

    assert.doesNotThrow(() => {
      orchestrator.validate();
      orchestrator.validate(); // Should not throw
      orchestrator.validate(); // Should not throw
    });
  });
});

describe('PhaseOrchestrator - Error Messages', () => {
  let orchestrator: PhaseOrchestrator;

  beforeEach(() => {
    orchestrator = new PhaseOrchestrator();
  });

  function createMockPhase(
    id: string,
    order: number,
    dependencies?: readonly string[]
  ): SimulationPhase {
    return {
      id,
      name: `Phase ${id}`,
      order,
      dependencies,
      execute(state: GameState): PhaseResult {
        return { events: [] };
      }
    };
  }

  it('should provide clear error message with cycle path', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['phase-b']);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);

    orchestrator.registerPhases([phaseA, phaseB]);

    try {
      orchestrator.validate();
      assert.fail('Expected error to be thrown');
    } catch (error: any) {
      // Verify error message contains cycle path
      assert.match(error.message, /phase-a/);
      assert.match(error.message, /phase-b/);
      assert.match(error.message, /→/); // Arrow showing cycle
      assert.match(error.message, /CIRCULAR DEPENDENCY DETECTED/);
    }
  });

  it('should include phase IDs and order numbers in order violation error', () => {
    const phaseA = createMockPhase('phase-a', 2.0);
    const phaseB = createMockPhase('phase-b', 1.0, ['phase-a']);

    orchestrator.registerPhases([phaseA, phaseB]);

    try {
      orchestrator.validate();
      assert.fail('Expected error to be thrown');
    } catch (error: any) {
      // Verify error message contains order violation details
      assert.match(error.message, /ORDER VIOLATION/i);
      assert.match(error.message, /phase-a/);
      assert.match(error.message, /phase-b/);
      // Check for order numbers (1 and 2)
      assert.match(error.message, /\b1\b/);
      assert.match(error.message, /\b2\b/);
    }
  });

  it('should include missing dependency name in error', () => {
    const phaseA = createMockPhase('phase-a', 1.0, ['missing-phase']);

    orchestrator.registerPhase(phaseA);

    try {
      orchestrator.validate();
      assert.fail('Expected error to be thrown');
    } catch (error: any) {
      assert.match(error.message, /missing-phase/);
      assert.match(error.message, /INVALID PHASE DEPENDENCY/);
    }
  });
});

describe('PhaseOrchestrator - Registration and Execution', () => {
  let orchestrator: PhaseOrchestrator;

  beforeEach(() => {
    orchestrator = new PhaseOrchestrator();
  });

  function createMockPhase(
    id: string,
    order: number,
    dependencies?: readonly string[]
  ): SimulationPhase {
    return {
      id,
      name: `Phase ${id}`,
      order,
      dependencies,
      execute(state: GameState): PhaseResult {
        return { events: [] };
      }
    };
  }

  it('should allow incremental phase registration', () => {
    const phaseA = createMockPhase('phase-a', 1.0);
    const phaseB = createMockPhase('phase-b', 2.0, ['phase-a']);
    const phaseC = createMockPhase('phase-c', 3.0, ['phase-b']);

    // Register one at a time (simulate phased development)
    orchestrator.registerPhase(phaseA);
    assert.strictEqual(orchestrator.getPhaseCount(), 1);

    orchestrator.registerPhase(phaseB);
    assert.strictEqual(orchestrator.getPhaseCount(), 2);

    orchestrator.registerPhase(phaseC);
    assert.strictEqual(orchestrator.getPhaseCount(), 3);

    // Validate after all registered
    assert.doesNotThrow(() => orchestrator.validate());
  });

  it('should allow clearing and re-registering phases', () => {
    const phase1 = createMockPhase('phase-1', 1.0);

    orchestrator.registerPhase(phase1);
    assert.strictEqual(orchestrator.getPhaseCount(), 1);

    orchestrator.clear();
    assert.strictEqual(orchestrator.getPhaseCount(), 0);

    const phase2 = createMockPhase('phase-2', 2.0);
    orchestrator.registerPhase(phase2);
    assert.strictEqual(orchestrator.getPhaseCount(), 1);
  });
});

console.log('✅ PhaseOrchestrator tests complete');
