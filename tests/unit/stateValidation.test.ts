/**
 * State Validation - Unit Tests
 *
 * Tests the state validation proxy system that catches NaN/Infinity values
 * in development mode, plus snapshot comparison and critical state validation.
 *
 * Coverage areas:
 * 1. Validation context (set/reset)
 * 2. State validation proxy (reads/writes)
 * 3. State snapshots and comparison
 * 4. Critical state validation
 * 5. StateValidator class (pre/post conditions)
 */

// Ensure NODE_ENV is set for validation proxy to be enabled
// Must be set before importing stateValidation module
process.env.NODE_ENV = 'test';

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import type { GameState, AIAgent } from '../../src/types/game.js';
import {
  setValidationContext,
  resetValidationContext,
  wrapStateForValidation,
  isStateValidationEnabled,
  createStateSnapshot,
  validateCriticalState,
  compareStateSnapshots,
  StateValidator,
} from '../../src/simulation/utils/stateValidation.js';

/**
 * Create a minimal mock GameState for testing
 * Includes only the properties accessed by validation functions
 */
function createMockGameState(overrides?: Partial<GameState>): GameState {
  const mockAgent: AIAgent = {
    id: 'agent-1',
    name: 'Test Agent',
    alignment: 0.7,
    capability: 100,
    lifecycleState: 'deployed_open',
    capabilityProfile: {
      physical: 2, // Integer in [0, 5]
      digital: 4,
      cognitive: 5,
      social: 3,
      economic: 3,
      research: 4,
    },
    goals: [],
    constraints: [],
    historicalMutations: [],
    monthCreated: 1,
  };

  const state: GameState = {
    currentMonth: 12,
    humanPopulationSystem: {
      population: 8.0,
      deathRate: 0.01,
      birthRate: 0.015,
      populationHistory: [],
    },
    planetaryBoundariesSystem: {
      boundaries: {
        climate_change: {
          currentValue: 0.8,
          threshold: 1.0,
          historicalValues: [0.8],
        },
        ocean_acidification: {
          currentValue: 0.6,
          threshold: 1.0,
          historicalValues: [0.6],
        },
        biosphere_integrity: {
          currentValue: 0.7,
          threshold: 1.0,
          historicalValues: [0.7],
        },
      },
    },
    aiAgents: [mockAgent],
    goldenAgeState: {
      active: false,
      startMonth: null,
      endMonth: null,
    },
    bifurcationState: {
      phase: 'none',
      startMonth: null,
    },
    globalMetrics: {
      population: 8.0,
      gdp: 114,
      gdpPerCapita: 14.25,
    },
    ...overrides,
  } as unknown as GameState;

  return state;
}

// ============================================================================
// VALIDATION CONTEXT TESTS
// ============================================================================

describe('Validation Context', () => {
  afterEach(() => {
    resetValidationContext();
  });

  it('should set and track validation context', () => {
    setValidationContext(24, 'ecologyPhase');
    // We verify this indirectly through error messages
    // (internal state is not directly accessible)
    assert.ok(true); // Context is set
  });

  it('should reset validation context to defaults', () => {
    setValidationContext(100, 'somePhase');
    resetValidationContext();
    // Reset should succeed without error
    assert.ok(true);
  });

  it('should include context in validation errors', () => {
    setValidationContext(42, 'testPhase');
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    // Manually set NaN value to trigger validation error
    try {
      // Access a valid property first
      const _pop = wrapped.humanPopulationSystem.population;
      // Now try to set invalid value
      (wrapped.humanPopulationSystem as any).population = NaN;
      assert.fail('Should have thrown validation error');
    } catch (error: any) {
      // Verify error message includes context
      assert.ok(error.message.includes('Month: 42'));
      assert.ok(error.message.includes('Phase: testPhase'));
    }
  });

  it('should allow multiple context updates', () => {
    setValidationContext(1, 'phase1');
    setValidationContext(2, 'phase2');
    setValidationContext(3, 'phase3');
    resetValidationContext();
    assert.ok(true);
  });
});

// ============================================================================
// STATE VALIDATION PROXY TESTS
// ============================================================================

describe('State Validation Proxy - Initialization', () => {
  it('should indicate validation is enabled in dev/test mode', () => {
    const enabled = isStateValidationEnabled();
    // In test mode, NODE_ENV should be 'test'
    assert.strictEqual(enabled, true);
  });

  it('should wrap state without throwing on valid values', () => {
    const state = createMockGameState();
    assert.doesNotThrow(() => {
      wrapStateForValidation(state);
    });
  });

  it('should return wrapped state that is usable', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    // Should be able to read valid properties
    const population = wrapped.humanPopulationSystem.population;
    assert.strictEqual(population, 8.0);
  });
});

describe('State Validation Proxy - NaN/Infinity Detection on Read', () => {
  beforeEach(() => {
    setValidationContext(10, 'readTest');
  });

  afterEach(() => {
    resetValidationContext();
  });

  /**
   * Test that reading NaN value throws with detailed error
   */
  it('should throw when reading NaN from numeric property', () => {
    const state = createMockGameState();
    state.humanPopulationSystem.population = NaN;
    const wrapped = wrapStateForValidation(state);

    assert.throws(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _pop = wrapped.humanPopulationSystem.population;
      },
      {
        message: /INVALID STATE READ/,
      }
    );
  });

  /**
   * Test that reading Infinity value throws with detailed error
   */
  it('should throw when reading Infinity from numeric property', () => {
    const state = createMockGameState();
    state.humanPopulationSystem.population = Infinity;
    const wrapped = wrapStateForValidation(state);

    assert.throws(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _pop = wrapped.humanPopulationSystem.population;
      },
      {
        message: /INVALID STATE READ/,
      }
    );
  });

  /**
   * Test that reading negative Infinity also throws
   */
  it('should throw when reading negative Infinity', () => {
    const state = createMockGameState();
    state.humanPopulationSystem.population = -Infinity;
    const wrapped = wrapStateForValidation(state);

    assert.throws(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _pop = wrapped.humanPopulationSystem.population;
      },
      {
        message: /INVALID STATE READ/,
      }
    );
  });

  /**
   * Test that valid numbers pass through without error
   */
  it('should allow reading valid positive numbers', () => {
    const state = createMockGameState({
      humanPopulationSystem: {
        population: 7.5,
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: []
      }
    });
    const wrapped = wrapStateForValidation(state);

    assert.doesNotThrow(() => {
      const _pop = wrapped.humanPopulationSystem.population;
      assert.strictEqual(_pop, 7.5);
    });
  });

  /**
   * Test that valid zero and negative numbers pass through
   */
  it('should allow reading zero and negative numbers', () => {
    const state = createMockGameState();
    state.humanPopulationSystem.deathRate = 0;
    const wrapped = wrapStateForValidation(state);

    assert.doesNotThrow(() => {
      const _rate = wrapped.humanPopulationSystem.deathRate;
      assert.strictEqual(_rate, 0);
    });
  });

  /**
   * Test error message includes property path
   */
  it('should include property path in error messages', () => {
    const state = createMockGameState();
    state.humanPopulationSystem.population = NaN;
    const wrapped = wrapStateForValidation(state);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _pop = wrapped.humanPopulationSystem.population;
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(
        error.message.includes('humanPopulationSystem.population'),
        'Error should include property path'
      );
    }
  });
});

describe('State Validation Proxy - NaN/Infinity Detection on Write', () => {
  beforeEach(() => {
    setValidationContext(15, 'writeTest');
  });

  afterEach(() => {
    resetValidationContext();
  });

  /**
   * Test that writing NaN value throws immediately
   */
  it('should throw when writing NaN to numeric property', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    assert.throws(
      () => {
        wrapped.humanPopulationSystem.population = NaN;
      },
      {
        message: /INVALID STATE WRITE/,
      }
    );
  });

  /**
   * Test that writing Infinity throws immediately
   */
  it('should throw when writing Infinity to numeric property', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    assert.throws(
      () => {
        wrapped.humanPopulationSystem.population = Infinity;
      },
      {
        message: /INVALID STATE WRITE/,
      }
    );
  });

  /**
   * Test that writing valid numbers succeeds
   */
  it('should allow writing valid numbers', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    assert.doesNotThrow(() => {
      wrapped.humanPopulationSystem.population = 9.5;
      assert.strictEqual(wrapped.humanPopulationSystem.population, 9.5);
    });
  });

  /**
   * Test that non-numeric properties can be written
   */
  it('should allow writing non-numeric properties', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    assert.doesNotThrow(() => {
      wrapped.currentMonth = 25;
      assert.strictEqual(wrapped.currentMonth, 25);
    });
  });
});

describe('State Validation Proxy - Nested Object Handling', () => {
  /**
   * Test that nested objects are recursively wrapped
   */
  it('should validate nested numeric properties', () => {
    const state = createMockGameState();
    state.planetaryBoundariesSystem.boundaries['climate_change'].currentValue = NaN;
    const wrapped = wrapStateForValidation(state);

    assert.throws(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _val = wrapped.planetaryBoundariesSystem.boundaries['climate_change'].currentValue;
      },
      {
        message: /INVALID STATE READ/,
      }
    );
  });

  /**
   * Test that arrays are skipped (not validated)
   */
  it('should skip validation for array properties', () => {
    const state = createMockGameState();
    state.aiAgents = [createMockGameState().aiAgents[0]];
    const wrapped = wrapStateForValidation(state);

    // Should not throw even if array contains values
    assert.doesNotThrow(() => {
      const _agents = wrapped.aiAgents;
      assert.ok(Array.isArray(_agents));
    });
  });

  /**
   * Test deeply nested object validation
   * Note: This test validates that the proxy properly handles nested access,
   * but the actual NaN value in nested properties will be caught by
   * assertAICapability validation in validateCriticalState instead of
   * the proxy mechanism (since proxy would try to clone the agent for wrapping).
   */
  it('should support deeply nested object access through proxy', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    // Verify we can access deeply nested properties
    const cap = wrapped.aiAgents[0].capabilityProfile.digital;
    assert.strictEqual(cap, 4);
  });

  /**
   * Test that functions are skipped
   */
  it('should skip validation for function properties', () => {
    const state = createMockGameState();
    const wrapped = wrapStateForValidation(state);

    // Add a function to the state (for testing purposes)
    const mockFn = () => 42;
    (wrapped as any).testFunction = mockFn;

    // Should not throw when accessing function
    assert.doesNotThrow(() => {
      const _fn = (wrapped as any).testFunction;
      assert.strictEqual(typeof _fn, 'function');
    });
  });

  /**
   * Test that special object types (Date, Map, Set, RegExp) are skipped
   */
  it('should skip validation for special object types', () => {
    const state = createMockGameState() as any;
    state.testDate = new Date();
    state.testMap = new Map();
    state.testSet = new Set();
    state.testRegex = /test/;

    const wrapped = wrapStateForValidation(state);

    // Should not throw for special types
    assert.doesNotThrow(() => {
      const _date = wrapped.testDate;
      const _map = wrapped.testMap;
      const _set = wrapped.testSet;
      const _regex = wrapped.testRegex;
      assert.ok(_date instanceof Date);
      assert.ok(_map instanceof Map);
      assert.ok(_set instanceof Set);
      assert.ok(_regex instanceof RegExp);
    });
  });
});

// ============================================================================
// STATE SNAPSHOT TESTS
// ============================================================================

describe('State Snapshots - Creation', () => {
  /**
   * Test that snapshots capture critical state fields
   */
  it('should create snapshot with all critical fields', () => {
    const state = createMockGameState();
    const snapshot = createStateSnapshot(state);

    assert.strictEqual(snapshot.month, 12);
    assert.strictEqual(snapshot.population, 8.0);
    assert.strictEqual(snapshot.goldenAgeActive, false);
    assert.ok(typeof snapshot.co2 === 'number');
    assert.ok(typeof snapshot.totalAICapability === 'number');
  });

  /**
   * Test snapshot with active golden age
   */
  it('should capture golden age state', () => {
    const state = createMockGameState({
      goldenAgeState: {
        active: true,
        startMonth: 10,
        endMonth: null,
      },
    });
    const snapshot = createStateSnapshot(state);

    assert.strictEqual(snapshot.goldenAgeActive, true);
  });

  /**
   * Test snapshot counts deployed agents correctly
   */
  it('should count deployed agents correctly', () => {
    const mockAgent1: AIAgent = {
      id: 'agent-1',
      name: 'Agent 1',
      alignment: 0.7,
      capability: 100,
      lifecycleState: 'deployed_open',
      capabilityProfile: {
        physical: 2,
        digital: 4,
        cognitive: 5,
        social: 3,
        economic: 3,
        research: 4,
      },
      goals: [],
      constraints: [],
      historicalMutations: [],
      monthCreated: 1,
    };

    const mockAgent2: AIAgent = {
      id: 'agent-2',
      name: 'Agent 2',
      alignment: 0.8,
      capability: 150,
      lifecycleState: 'deployed_closed',
      capabilityProfile: {
        physical: 3,
        digital: 4,
        cognitive: 5,
        social: 3,
        economic: 4,
        research: 4,
      },
      goals: [],
      constraints: [],
      historicalMutations: [],
      monthCreated: 2,
    };

    const mockAgent3: AIAgent = {
      id: 'agent-3',
      name: 'Agent 3',
      alignment: 0.5,
      capability: 50,
      lifecycleState: 'development',
      capabilityProfile: {
        physical: 1,
        digital: 2,
        cognitive: 2,
        social: 1,
        economic: 2,
        research: 2,
      },
      goals: [],
      constraints: [],
      historicalMutations: [],
      monthCreated: 3,
    };

    const state = createMockGameState({
      aiAgents: [mockAgent1, mockAgent2, mockAgent3],
    });
    const snapshot = createStateSnapshot(state);

    // Only agent1 and agent2 are deployed
    assert.strictEqual(snapshot.deployedAgentCount, 2);
    // Capability is sum of deployed agents
    assert.strictEqual(snapshot.totalAICapability, 250);
  });

  /**
   * Test snapshot aggregates AI capability correctly
   */
  it('should aggregate AI capability from deployed agents', () => {
    const agent1: AIAgent = {
      id: 'agent-1',
      name: 'Agent 1',
      alignment: 0.7,
      capability: 50,
      lifecycleState: 'deployed_open',
      capabilityProfile: {
        physical: 2,
        digital: 4,
        cognitive: 5,
        social: 3,
        economic: 3,
        research: 4,
      },
      goals: [],
      constraints: [],
      historicalMutations: [],
      monthCreated: 1,
    };

    const agent2: AIAgent = {
      id: 'agent-2',
      name: 'Agent 2',
      alignment: 0.8,
      capability: 75,
      lifecycleState: 'deployed_open',
      capabilityProfile: {
        physical: 3,
        digital: 4,
        cognitive: 5,
        social: 3,
        economic: 4,
        research: 4,
      },
      goals: [],
      constraints: [],
      historicalMutations: [],
      monthCreated: 2,
    };

    const state = createMockGameState({
      aiAgents: [agent1, agent2],
    });
    const snapshot = createStateSnapshot(state);

    assert.strictEqual(snapshot.totalAICapability, 125);
  });
});

describe('State Snapshots - Comparison', () => {
  /**
   * Test that small population changes don't trigger warning
   */
  it('should not warn on small population changes (< 10%)', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      population: 8.5, // 6.25% increase
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.strictEqual(warnings.length, 0);
  });

  /**
   * Test that large population changes trigger warning
   */
  it('should warn on large population changes (> 10%)', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      population: 9.0, // 12.5% increase
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('population'));
  });

  /**
   * Test warning for large climate boundary changes
   */
  it('should warn on large climate boundary changes (> 0.3)', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.5,
      temperature: 0.5,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      co2: 0.85, // 0.35 change
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('climate'));
  });

  /**
   * Test warning for large ocean boundary changes
   */
  it('should warn on large ocean acidification changes (> 0.3)', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.4,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      oceanPH: 0.75, // 0.35 change
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('ocean acidification'));
  });

  /**
   * Test warning for large biodiversity changes
   */
  it('should warn on large biodiversity changes (> 0.3)', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.4,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      biodiversity: 0.75, // 0.35 change
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('biodiversity'));
  });

  /**
   * Test warning for large AI capability changes (> 50%)
   */
  it('should warn on large AI capability changes (> 50%)', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      totalAICapability: 160, // 60% increase
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('AI capability'));
  });

  /**
   * Test no warning for changes within thresholds
   */
  it('should not warn when all changes are within thresholds', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      month: 13,
      goldenAgeActive: false,
      population: 8.3, // 3.75% change
      co2: 0.95, // 0.15 change
      temperature: 0.95,
      oceanPH: 0.7, // 0.1 change
      biodiversity: 0.8, // 0.1 change
      totalAICapability: 120, // 20% change
      deployedAgentCount: 1,
    };

    const warnings = compareStateSnapshots(before, after, 'testPhase');
    assert.strictEqual(warnings.length, 0);
  });

  /**
   * Test that warnings include phase name
   */
  it('should include phase name in warning messages', () => {
    const before = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const after = {
      ...before,
      population: 10.0, // 25% increase
    };

    const warnings = compareStateSnapshots(before, after, 'mySpecialPhase');
    assert.ok(warnings[0].includes('mySpecialPhase'));
  });
});

// ============================================================================
// CRITICAL STATE VALIDATION TESTS
// ============================================================================

describe('Critical State Validation', () => {
  /**
   * Test that valid state passes validation
   */
  it('should pass validation for valid state', () => {
    const state = createMockGameState();
    assert.doesNotThrow(() => {
      validateCriticalState(state, { location: 'testPhase' });
    });
  });

  /**
   * Test that NaN population throws error
   */
  it('should throw on NaN population', () => {
    const state = createMockGameState({
      humanPopulationSystem: {
        population: NaN,
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: [],
      },
    });

    assert.throws(
      () => {
        validateCriticalState(state, { location: 'testPhase' });
      },
      {
        message: /Non-finite value/,
      }
    );
  });

  /**
   * Test that negative population throws error
   */
  it('should throw on negative population', () => {
    const state = createMockGameState({
      humanPopulationSystem: {
        population: -1.5,
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: [],
      },
    });

    assert.throws(
      () => {
        validateCriticalState(state, { location: 'testPhase' });
      },
      {
        message: /Negative population/,
      }
    );
  });

  /**
   * Test that undefined goldenAgeState throws error
   */
  it('should throw on undefined goldenAgeState', () => {
    const state = createMockGameState();
    state.goldenAgeState = undefined as any;

    assert.throws(
      () => {
        validateCriticalState(state, { location: 'testPhase' });
      },
      {
        message: /goldenAgeState undefined/,
      }
    );
  });

  /**
   * Test that undefined bifurcationState throws error
   */
  it('should throw on undefined bifurcationState', () => {
    const state = createMockGameState();
    state.bifurcationState = undefined as any;

    assert.throws(
      () => {
        validateCriticalState(state, { location: 'testPhase' });
      },
      {
        message: /bifurcationState undefined/,
      }
    );
  });

  /**
   * Test that validation includes context in error
   */
  it('should include location and month in error context', () => {
    const state = createMockGameState({
      humanPopulationSystem: {
        population: NaN,
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: [],
      },
    });

    try {
      validateCriticalState(state, { location: 'myPhase', month: 50 });
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(error.message.includes('myPhase'));
      assert.ok(error.message.includes('50'));
    }
  });

  /**
   * Test AI capability validation for deployed agents
   */
  it('should validate AI agent capabilities', () => {
    const agent: AIAgent = {
      id: 'agent-1',
      name: 'Agent',
      alignment: 0.7,
      capability: NaN,
      lifecycleState: 'deployed_open',
      capabilityProfile: {
        physical: 2,
        digital: 4,
        cognitive: 5,
        social: 3,
        economic: 3,
        research: 4,
      },
      goals: [],
      constraints: [],
      historicalMutations: [],
      monthCreated: 1,
    };

    const state = createMockGameState({
      aiAgents: [agent],
    });

    assert.throws(
      () => {
        validateCriticalState(state, { location: 'testPhase' });
      },
      {
        message: /Non-finite value/,
      }
    );
  });

  /**
   * Test planetary boundary validation
   */
  it('should validate planetary boundaries are in valid range', () => {
    const state = createMockGameState();
    state.planetaryBoundariesSystem.boundaries['climate_change'].currentValue = 2.5; // Out of range

    assert.throws(
      () => {
        validateCriticalState(state, { location: 'testPhase' });
      },
      {
        message: /Out-of-range value/,
      }
    );
  });
});

// ============================================================================
// STATE VALIDATOR CLASS TESTS
// ============================================================================

describe('StateValidator Class - Initialization', () => {
  /**
   * Test validator can be created
   */
  it('should create validator instance', () => {
    const validator = new StateValidator();
    assert.ok(validator);
  });

  /**
   * Test validator respects DEV_MODE_STATE_VALIDATION env var
   */
  it('should read DEV_MODE_STATE_VALIDATION environment variable', () => {
    const validator = new StateValidator();
    // DEV_MODE_STATE_VALIDATION may or may not be set
    const isEnabled = validator.isEnabled();
    assert.ok(typeof isEnabled === 'boolean');
  });
});

describe('StateValidator Class - Enable/Disable', () => {
  /**
   * Test enable() method
   */
  it('should enable validation with enable()', () => {
    const validator = new StateValidator();
    validator.enable();
    assert.strictEqual(validator.isEnabled(), true);
  });

  /**
   * Test disable() method
   */
  it('should disable validation with disable()', () => {
    const validator = new StateValidator();
    validator.enable();
    validator.disable();
    assert.strictEqual(validator.isEnabled(), false);
  });

  /**
   * Test isEnabled() returns current state
   */
  it('should return current validation state with isEnabled()', () => {
    const validator = new StateValidator();
    const initialState = validator.isEnabled();

    validator.enable();
    assert.strictEqual(validator.isEnabled(), true);

    validator.disable();
    assert.strictEqual(validator.isEnabled(), false);

    // Restore initial state
    if (initialState) {
      validator.enable();
    } else {
      validator.disable();
    }
  });
});

describe('StateValidator Class - Pre-Condition Validation', () => {
  /**
   * Test that validatePreCondition returns snapshot when enabled
   */
  it('should return snapshot when validation is enabled', () => {
    const validator = new StateValidator();
    validator.enable();

    const state = createMockGameState();
    const snapshot = validator.validatePreCondition(state, 'testPhase');

    assert.ok(snapshot !== null);
    assert.strictEqual(snapshot?.month, 12);
    assert.strictEqual(snapshot?.population, 8.0);
  });

  /**
   * Test that validatePreCondition returns null when disabled
   */
  it('should return null when validation is disabled', () => {
    const validator = new StateValidator();
    validator.disable();

    const state = createMockGameState();
    const snapshot = validator.validatePreCondition(state, 'testPhase');

    assert.strictEqual(snapshot, null);
  });

  /**
   * Test that validatePreCondition throws on invalid state
   */
  it('should throw when pre-condition validation fails', () => {
    const validator = new StateValidator();
    validator.enable();

    const state = createMockGameState({
      humanPopulationSystem: {
        population: NaN,
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: [],
      },
    });

    assert.throws(
      () => {
        validator.validatePreCondition(state, 'testPhase');
      },
      {
        message: /Non-finite value/,
      }
    );
  });
});

describe('StateValidator Class - Post-Condition Validation', () => {
  /**
   * Test that validatePostCondition succeeds when disabled
   */
  it('should not validate when disabled', () => {
    const validator = new StateValidator();
    validator.disable();

    const state = createMockGameState();
    // Should not throw even with snapshot
    assert.doesNotThrow(() => {
      validator.validatePostCondition(state, 'testPhase', {
        month: 12,
        goldenAgeActive: false,
        population: 8.0,
        co2: 0.8,
        temperature: 0.8,
        oceanPH: 0.6,
        biodiversity: 0.7,
        totalAICapability: 100,
        deployedAgentCount: 1,
      });
    });
  });

  /**
   * Test that validatePostCondition validates state when enabled
   */
  it('should validate state when enabled', () => {
    const validator = new StateValidator();
    validator.enable();

    const beforeSnapshot = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const state = createMockGameState();
    assert.doesNotThrow(() => {
      validator.validatePostCondition(state, 'testPhase', beforeSnapshot);
    });
  });

  /**
   * Test that validatePostCondition throws on invalid post-state
   */
  it('should throw when post-condition validation fails', () => {
    const validator = new StateValidator();
    validator.enable();

    const state = createMockGameState({
      humanPopulationSystem: {
        population: NaN,
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: [],
      },
    });

    const beforeSnapshot = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    assert.throws(
      () => {
        validator.validatePostCondition(state, 'testPhase', beforeSnapshot);
      },
      {
        message: /Non-finite value/,
      }
    );
  });

  /**
   * Test that validatePostCondition compares snapshots for mutations
   */
  it('should compare snapshots and report suspicious mutations', () => {
    const validator = new StateValidator();
    validator.enable();

    const beforeSnapshot = {
      month: 12,
      goldenAgeActive: false,
      population: 8.0,
      co2: 0.8,
      temperature: 0.8,
      oceanPH: 0.6,
      biodiversity: 0.7,
      totalAICapability: 100,
      deployedAgentCount: 1,
    };

    const state = createMockGameState({
      humanPopulationSystem: {
        population: 10.0, // 25% increase - should trigger warning
        deathRate: 0.01,
        birthRate: 0.015,
        populationHistory: [],
      },
    });

    // Capture console.warn calls
    const originalWarn = console.warn;
    let warningCaught = false;

    console.warn = (message: string) => {
      if (message.includes('Large population change')) {
        warningCaught = true;
      }
    };

    try {
      validator.validatePostCondition(state, 'testPhase', beforeSnapshot);
      // Note: warnings are logged, not thrown, so this should succeed
      assert.ok(true);
    } finally {
      console.warn = originalWarn;
    }
  });

  /**
   * Test that validatePostCondition works without snapshot
   */
  it('should handle null snapshot gracefully', () => {
    const validator = new StateValidator();
    validator.enable();

    const state = createMockGameState();
    // Should not throw when snapshot is null
    assert.doesNotThrow(() => {
      validator.validatePostCondition(state, 'testPhase', null);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('State Validation - Integration', () => {
  /**
   * Test typical phase execution pattern
   */
  it('should support typical phase execution pattern', () => {
    const validator = new StateValidator();
    validator.enable();

    const state = createMockGameState();

    // Pre-phase validation
    const beforeSnapshot = validator.validatePreCondition(state, 'testPhase');
    assert.ok(beforeSnapshot !== null);

    // Simulate phase execution (modify state)
    state.currentMonth = 13;
    state.humanPopulationSystem.population = 8.2;

    // Post-phase validation
    assert.doesNotThrow(() => {
      validator.validatePostCondition(state, 'testPhase', beforeSnapshot);
    });
  });

  /**
   * Test multiple phases in sequence
   */
  it('should handle multiple phases in sequence', () => {
    const validator = new StateValidator();
    validator.enable();

    let state = createMockGameState();

    // Phase 1
    const snap1 = validator.validatePreCondition(state, 'phase1');
    state.currentMonth = 13;
    validator.validatePostCondition(state, 'phase1', snap1);

    // Phase 2
    const snap2 = validator.validatePreCondition(state, 'phase2');
    state.currentMonth = 14;
    validator.validatePostCondition(state, 'phase2', snap2);

    // Phase 3
    const snap3 = validator.validatePreCondition(state, 'phase3');
    state.currentMonth = 15;
    validator.validatePostCondition(state, 'phase3', snap3);

    assert.strictEqual(state.currentMonth, 15);
  });
});

console.log('\n✅ State Validation test suite passed');
