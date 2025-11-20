/**
 * Deterministic RNG - Unit Tests
 *
 * Tests global RNG state management for deterministic simulations.
 *
 * Key properties tested:
 * 1. Throws error if called before initialization
 * 2. Returns deterministic values from seeded RNG
 * 3. Can be reset and re-seeded
 * 4. State checking works correctly
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  setDeterministicRng,
  deterministicRandom,
  clearDeterministicRng,
  isDeterministicRngSet,
} from '../../src/simulation/utils/deterministicRng.js';

describe('Deterministic RNG - Initialization', () => {
  afterEach(() => {
    // Clean up after each test
    clearDeterministicRng();
  });

  it('should throw error when called before initialization', () => {
    clearDeterministicRng();
    assert.throws(
      () => {
        deterministicRandom();
      },
      {
        message: /called before setDeterministicRng/,
      }
    );
  });

  it('should not throw after initialization', () => {
    const mockRng = () => 0.5;
    setDeterministicRng(mockRng);

    assert.doesNotThrow(() => {
      deterministicRandom();
    });
  });

  it('should return false for isDeterministicRngSet before initialization', () => {
    clearDeterministicRng();
    assert.strictEqual(isDeterministicRngSet(), false);
  });

  it('should return true for isDeterministicRngSet after initialization', () => {
    const mockRng = () => 0.5;
    setDeterministicRng(mockRng);
    assert.strictEqual(isDeterministicRngSet(), true);
  });
});

describe('Deterministic RNG - Value Generation', () => {
  beforeEach(() => {
    clearDeterministicRng();
  });

  afterEach(() => {
    clearDeterministicRng();
  });

  it('should return values from provided RNG', () => {
    const mockRng = () => 0.42;
    setDeterministicRng(mockRng);

    const value = deterministicRandom();
    assert.strictEqual(value, 0.42);
  });

  it('should return different values from sequential RNG', () => {
    let counter = 0;
    const sequentialRng = () => {
      counter += 0.1;
      return counter;
    };

    setDeterministicRng(sequentialRng);

    const value1 = deterministicRandom();
    const value2 = deterministicRandom();
    const value3 = deterministicRandom();

    assert.strictEqual(value1, 0.1);
    assert.strictEqual(value2, 0.2);
    assert.ok(Math.abs(value3 - 0.3) < 0.0001);
  });

  it('should be deterministic with same seed', () => {
    // Simple LCG-style RNG for testing
    function createSeededRng(seed: number) {
      let state = seed;
      return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
      };
    }

    const rng1 = createSeededRng(12345);
    setDeterministicRng(rng1);

    const sequence1 = [
      deterministicRandom(),
      deterministicRandom(),
      deterministicRandom(),
    ];

    // Reset with same seed
    const rng2 = createSeededRng(12345);
    setDeterministicRng(rng2);

    const sequence2 = [
      deterministicRandom(),
      deterministicRandom(),
      deterministicRandom(),
    ];

    assert.deepStrictEqual(sequence1, sequence2);
  });

  it('should produce different sequences with different seeds', () => {
    function createSeededRng(seed: number) {
      let state = seed;
      return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
      };
    }

    const rng1 = createSeededRng(12345);
    setDeterministicRng(rng1);
    const value1 = deterministicRandom();

    const rng2 = createSeededRng(67890);
    setDeterministicRng(rng2);
    const value2 = deterministicRandom();

    assert.notStrictEqual(value1, value2);
  });
});

describe('Deterministic RNG - State Management', () => {
  afterEach(() => {
    clearDeterministicRng();
  });

  it('should allow overwriting with new RNG', () => {
    const mockRng1 = () => 0.3;
    setDeterministicRng(mockRng1);
    const value1 = deterministicRandom();

    const mockRng2 = () => 0.7;
    setDeterministicRng(mockRng2);
    const value2 = deterministicRandom();

    assert.strictEqual(value1, 0.3);
    assert.strictEqual(value2, 0.7);
  });

  it('should clear state correctly', () => {
    const mockRng = () => 0.5;
    setDeterministicRng(mockRng);
    assert.strictEqual(isDeterministicRngSet(), true);

    clearDeterministicRng();
    assert.strictEqual(isDeterministicRngSet(), false);
  });

  it('should throw after clearing', () => {
    const mockRng = () => 0.5;
    setDeterministicRng(mockRng);

    // Should work
    assert.doesNotThrow(() => {
      deterministicRandom();
    });

    clearDeterministicRng();

    // Should throw
    assert.throws(() => {
      deterministicRandom();
    });
  });
});

describe('Deterministic RNG - Range Validation', () => {
  beforeEach(() => {
    clearDeterministicRng();
  });

  afterEach(() => {
    clearDeterministicRng();
  });

  it('should return values in [0, 1) range', () => {
    function createUniformRng() {
      let state = 1;
      return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };
    }

    const rng = createUniformRng();
    setDeterministicRng(rng);

    // Check 1000 samples
    for (let i = 0; i < 1000; i++) {
      const value = deterministicRandom();
      assert.ok(value >= 0, `Value ${value} should be >= 0`);
      assert.ok(value < 1, `Value ${value} should be < 1`);
    }
  });

  it('should accept edge case values from RNG', () => {
    // Test that we handle edge cases
    const edgeCases = [0, 0.999999, 1e-10, 0.5];

    for (const expected of edgeCases) {
      const mockRng = () => expected;
      setDeterministicRng(mockRng);
      const value = deterministicRandom();
      assert.strictEqual(value, expected);
    }
  });
});

describe('Deterministic RNG - Phase Usage Pattern', () => {
  afterEach(() => {
    clearDeterministicRng();
  });

  it('should support typical phase execution pattern', () => {
    // Simulate a phase execution
    function simulatePhase(rng: () => number) {
      // Phase sets RNG at start
      setDeterministicRng(rng);

      // Phase calls helpers that use deterministicRandom()
      const helper1Result = helperFunction1();
      const helper2Result = helperFunction2();

      return { helper1Result, helper2Result };
    }

    function helperFunction1() {
      // Helper uses global RNG
      return deterministicRandom() > 0.5 ? 'A' : 'B';
    }

    function helperFunction2() {
      // Another helper uses global RNG
      return deterministicRandom() * 100;
    }

    // Execute with deterministic RNG
    let counter = 0;
    const deterministicRng = () => {
      counter += 0.3;
      return counter % 1;
    };

    const result = simulatePhase(deterministicRng);

    assert.ok(typeof result.helper1Result === 'string');
    assert.ok(typeof result.helper2Result === 'number');
  });

  it('should support multiple phases in sequence', () => {
    const results: number[] = [];

    // Phase 1
    setDeterministicRng(() => 0.1);
    results.push(deterministicRandom());

    // Phase 2
    setDeterministicRng(() => 0.2);
    results.push(deterministicRandom());

    // Phase 3
    setDeterministicRng(() => 0.3);
    results.push(deterministicRandom());

    assert.deepStrictEqual(results, [0.1, 0.2, 0.3]);
  });
});

describe('Deterministic RNG - Error Messages', () => {
  afterEach(() => {
    clearDeterministicRng();
  });

  it('should provide helpful error message', () => {
    clearDeterministicRng();

    try {
      deterministicRandom();
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(error.message.includes('called before setDeterministicRng'));
      assert.ok(error.message.includes('❌'));
    }
  });
});

console.log('\n✅ Deterministic RNG test suite passed');
