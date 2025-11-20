/**
 * Assertion Utilities - Unit Tests
 *
 * Tests core assertion functions in src/simulation/utils/assertions.ts
 *
 * Philosophy: Research simulation must fail loudly on invalid values
 * rather than silently falling back to defaults.
 *
 * Test coverage:
 * 1. Valid input tests (happy path)
 * 2. Boundary condition tests (min/max values)
 * 3. Error throwing tests (NaN, undefined, out of range)
 * 4. Context message validation
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { initializeGameState } from '../../src/simulation/initialization.js';
import type { GameState } from '../../src/types/game.js';
import {
  assertFinite,
  assertDefined,
  assertInRange,
  assertProbability,
  assertNonEmpty,
  assertEconomicStage,
  assertSurvivalFundamentals,
  assertStateProperty,
  assertShockMagnitude,
  assertResourceAllocation,
  assertPopulationChange,
  assertMortalityRate,
  assertTemperatureDelta,
  assertAICapability,
  assertPlanetaryBoundary,
  capWithBifurcationAwareness,
} from '../../src/simulation/utils/assertions.js';

describe('Assertion Utilities - Core Functions', () => {
  describe('assertFinite', () => {
    it('should accept finite numbers', () => {
      const result = assertFinite(42, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 42);
    });

    it('should accept zero', () => {
      const result = assertFinite(0, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 0);
    });

    it('should accept negative numbers', () => {
      const result = assertFinite(-100, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, -100);
    });

    it('should reject NaN', () => {
      assert.throws(
        () => {
          assertFinite(NaN, {
            location: 'testFunction',
            valueName: 'testValue',
            month: 12,
          });
        },
        {
          message: /Non-finite value in testFunction/,
        }
      );
    });

    it('should reject Infinity', () => {
      assert.throws(
        () => {
          assertFinite(Infinity, {
            location: 'testFunction',
            valueName: 'testValue',
          });
        },
        {
          message: /Non-finite value/,
        }
      );
    });

    it('should include context in error message', () => {
      try {
        assertFinite(NaN, {
          location: 'calculateMetric',
          valueName: 'ecologicalScore',
          month: 24,
          additionalInfo: { inputX: 5, inputY: 10 },
        });
        assert.fail('Should have thrown');
      } catch (error: any) {
        assert.ok(error.message.includes('calculateMetric'));
        assert.ok(error.message.includes('Month: 24'));
      }
    });
  });

  describe('assertDefined', () => {
    it('should accept defined values', () => {
      const result = assertDefined(42, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 42);
    });

    it('should accept zero', () => {
      const result = assertDefined(0, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 0);
    });

    it('should accept false', () => {
      const result = assertDefined(false, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, false);
    });

    it('should reject undefined', () => {
      assert.throws(
        () => {
          assertDefined(undefined, {
            location: 'testFunction',
            valueName: 'testValue',
          });
        },
        {
          message: /Undefined value in testFunction/,
        }
      );
    });

    it('should reject null', () => {
      assert.throws(
        () => {
          assertDefined(null, {
            location: 'testFunction',
            valueName: 'testValue',
          });
        },
        {
          message: /testFunction/,
        }
      );
    });
  });

  describe('assertInRange', () => {
    it('should accept values within range', () => {
      const result = assertInRange(5, 0, 10, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 5);
    });

    it('should accept minimum boundary value', () => {
      const result = assertInRange(0, 0, 10, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 0);
    });

    it('should accept maximum boundary value', () => {
      const result = assertInRange(10, 0, 10, {
        location: 'test',
        valueName: 'testValue',
      });
      assert.strictEqual(result, 10);
    });

    it('should reject values below minimum', () => {
      assert.throws(
        () => {
          assertInRange(-1, 0, 10, {
            location: 'test',
            valueName: 'testValue',
          });
        },
        {
          message: /Out-of-range value/,
        }
      );
    });

    it('should reject values above maximum', () => {
      assert.throws(
        () => {
          assertInRange(11, 0, 10, {
            location: 'test',
            valueName: 'testValue',
          });
        },
        {
          message: /Out-of-range value/,
        }
      );
    });

    it('should include range in error message', () => {
      try {
        assertInRange(15, 0, 10, {
          location: 'test',
          valueName: 'score',
        });
        assert.fail('Should have thrown');
      } catch (error: any) {
        assert.ok(error.message.includes('[0, 10]'));
        assert.ok(error.message.includes('15'));
      }
    });
  });

  describe('assertProbability', () => {
    it('should accept valid probabilities', () => {
      const result = assertProbability(0.5, { location: 'test', valueName: 'p' });
      assert.strictEqual(result, 0.5);
    });

    it('should accept boundary values', () => {
      assert.strictEqual(assertProbability(0, { location: 'test', valueName: 'p' }), 0);
      assert.strictEqual(assertProbability(1, { location: 'test', valueName: 'p' }), 1);
    });

    it('should reject negative values', () => {
      assert.throws(
        () => {
          assertProbability(-0.1, { location: 'test', valueName: 'p' });
        },
        {
          message: /Out-of-range value/,
        }
      );
    });

    it('should reject values > 1', () => {
      assert.throws(
        () => {
          assertProbability(1.1, { location: 'test', valueName: 'p' });
        },
        {
          message: /Out-of-range value/,
        }
      );
    });
  });

  describe('assertNonEmpty', () => {
    it('should accept non-empty arrays', () => {
      const arr = [1, 2, 3];
      const result = assertNonEmpty(arr, {
        location: 'test',
        valueName: 'testArray',
      });
      assert.strictEqual(result, arr);
      assert.strictEqual(result.length, 3);
    });

    it('should reject empty arrays', () => {
      assert.throws(
        () => {
          assertNonEmpty([], {
            location: 'test',
            valueName: 'testArray',
          });
        },
        {
          message: /Empty array/,
        }
      );
    });

    it('should reject undefined', () => {
      assert.throws(
        () => {
          assertNonEmpty(undefined, {
            location: 'test',
            valueName: 'testArray',
          });
        },
        {
          message: /Empty array/,
        }
      );
    });
  });
});

describe('Assertion Utilities - GameState Functions', () => {
  let state: GameState;

  beforeEach(() => {
    state = initializeGameState();
  });

  describe('assertEconomicStage', () => {
    it('should accept valid economic stage', () => {
      const stage = assertEconomicStage(state, 'test');
      assert.ok(stage >= 0 && stage <= 4);
    });

    it('should reject undefined stage', () => {
      if (state.globalMetrics) {
        (state.globalMetrics as any).economicTransitionStage = undefined;
      }

      assert.throws(() => {
        assertEconomicStage(state, 'test');
      });
    });
  });

  describe('assertSurvivalFundamentals', () => {
    it('should accept valid survival fundamentals', () => {
      const fundamentals = {
        foodSecurity: 0.8,
        waterSecurity: 0.9,
        thermalHabitability: 0.95,
        shelterSecurity: 0.85,
      };

      assert.doesNotThrow(() => {
        assertSurvivalFundamentals(fundamentals, 'test');
      });
    });

    it('should reject negative food security', () => {
      const fundamentals = {
        foodSecurity: -0.1,
        waterSecurity: 0.9,
        thermalHabitability: 0.95,
        shelterSecurity: 0.85,
      };

      assert.throws(() => {
        assertSurvivalFundamentals(fundamentals, 'test');
      });
    });
  });

  describe('assertStateProperty', () => {
    it('should accept existing property', () => {
      const value = assertStateProperty(
        state.globalMetrics,
        'economicTransitionStage',
        { location: 'test' }
      );
      assert.strictEqual(typeof value, 'number');
    });

    it('should reject missing property', () => {
      assert.throws(() => {
        assertStateProperty(
          state.globalMetrics,
          'nonExistentProperty',
          { location: 'test' }
        );
      });
    });

    it('should support nested paths', () => {
      const obj = {
        level1: {
          level2: {
            value: 42,
          },
        },
      };

      const value = assertStateProperty(
        obj,
        'level1.level2.value',
        { location: 'test' }
      );
      assert.strictEqual(value, 42);
    });
  });
});

describe('Assertion Utilities - Domain-Specific', () => {
  describe('assertShockMagnitude', () => {
    it('should accept valid shock magnitude', () => {
      const result = assertShockMagnitude(0.3, {
        location: 'test',
        shockType: 'economic',
      });
      assert.strictEqual(result, 0.3);
    });

    it('should reject negative magnitude', () => {
      assert.throws(() => {
        assertShockMagnitude(-0.1, {
          location: 'test',
          shockType: 'economic',
        });
      });
    });
  });

  describe('assertResourceAllocation', () => {
    it('should accept valid allocation', () => {
      const result = assertResourceAllocation(0.25, {
        location: 'test',
        resourceType: 'research',
      });
      assert.strictEqual(result, 0.25);
    });

    it('should reject negative allocation', () => {
      assert.throws(() => {
        assertResourceAllocation(-0.1, {
          location: 'test',
          resourceType: 'research',
        });
      });
    });
  });

  describe('assertPopulationChange', () => {
    it('should accept valid population change', () => {
      const result = assertPopulationChange(0.01, {
        location: 'test',
        month: 10,
      });
      assert.strictEqual(result, 0.01);
    });

    it('should reject extreme positive change', () => {
      assert.throws(() => {
        assertPopulationChange(1.5, {
          location: 'test',
          month: 10,
        });
      });
    });
  });

  describe('assertMortalityRate', () => {
    it('should accept valid mortality rate', () => {
      const result = assertMortalityRate(0.001, {
        location: 'test',
        month: 10,
      });
      assert.strictEqual(result, 0.001);
    });

    it('should reject negative rate', () => {
      assert.throws(() => {
        assertMortalityRate(-0.01, {
          location: 'test',
          month: 10,
        });
      });
    });
  });

  describe('assertTemperatureDelta', () => {
    it('should accept valid temperature delta', () => {
      const result = assertTemperatureDelta(1.5, {
        location: 'test',
        month: 10,
      });
      assert.strictEqual(result, 1.5);
    });

    it('should accept negative delta (cooling)', () => {
      const result = assertTemperatureDelta(-0.5, {
        location: 'test',
        month: 10,
      });
      assert.strictEqual(result, -0.5);
    });

    it('should reject unrealistic positive delta', () => {
      assert.throws(() => {
        assertTemperatureDelta(20, {
          location: 'test',
          month: 10,
        });
      });
    });
  });

  describe('assertAICapability', () => {
    it('should accept valid AI capability', () => {
      const result = assertAICapability(0.5, {
        location: 'test',
        capabilityType: 'physical',
        month: 10,
      });
      assert.strictEqual(result, 0.5);
    });

    it('should accept boundary values', () => {
      assert.strictEqual(
        assertAICapability(0, {
          location: 'test',
          capabilityType: 'cognitive',
          month: 10,
        }),
        0
      );

      assert.strictEqual(
        assertAICapability(1, {
          location: 'test',
          capabilityType: 'cognitive',
          month: 10,
        }),
        1
      );
    });

    it('should reject negative capability', () => {
      assert.throws(() => {
        assertAICapability(-0.1, {
          location: 'test',
          capabilityType: 'research',
          month: 10,
        });
      });
    });
  });

  describe('assertPlanetaryBoundary', () => {
    it('should accept valid boundary value', () => {
      const result = assertPlanetaryBoundary(1.2, 'temperature', {
        location: 'test',
        valueName: 'temperatureAnomaly',
        month: 10,
      });
      assert.strictEqual(result, 1.2);
    });

    it('should accept values < 1 (safe zone)', () => {
      const result = assertPlanetaryBoundary(0.8, 'biodiversity', {
        location: 'test',
        valueName: 'biodiversityIndex',
        month: 10,
      });
      assert.strictEqual(result, 0.8);
    });

    it('should reject negative values', () => {
      assert.throws(() => {
        assertPlanetaryBoundary(-0.5, 'co2', {
          location: 'test',
          valueName: 'atmosphericCO2',
          month: 10,
        });
      });
    });
  });
});

describe('Assertion Utilities - Bifurcation Awareness', () => {
  describe('capWithBifurcationAwareness', () => {
    it('should preserve values below hard cap', () => {
      const result = capWithBifurcationAwareness(
        0.5,
        0.8,
        'testMetric',
        { currentMonth: 10 }
      );
      assert.strictEqual(result, 0.5);
    });

    it('should cap values at hard limit', () => {
      const result = capWithBifurcationAwareness(
        0.9,
        0.8,
        'testMetric',
        { currentMonth: 10 }
      );
      assert.strictEqual(result, 0.8);
    });

    it('should handle zero cap', () => {
      const result = capWithBifurcationAwareness(
        0.5,
        0,
        'testMetric',
        { currentMonth: 10 }
      );
      assert.strictEqual(result, 0);
    });

    it('should handle NaN gracefully', () => {
      assert.throws(() => {
        capWithBifurcationAwareness(
          NaN,
          0.8,
          'testMetric',
          { currentMonth: 10 }
        );
      });
    });
  });
});

describe('Assertion Utilities - Error Message Quality', () => {
  it('should provide actionable error messages', () => {
    try {
      assertFinite(NaN, {
        location: 'calculateEcology',
        valueName: 'ecologicalScore',
        month: 24,
        additionalInfo: { input1: 5, input2: 0 },
      });
      assert.fail('Should have thrown');
    } catch (error: any) {
      // Should contain all context
      assert.ok(error.message.includes('calculateEcology'));
      assert.ok(error.message.includes('ecologicalScore'));
      assert.ok(error.message.includes('Month: 24'));
      assert.ok(error.message.includes('input1'));

      // Should be emoji-prefixed for visibility
      assert.ok(error.message.includes('❌'));
    }
  });

  it('should include stack traces for debugging', () => {
    try {
      assertDefined(undefined, {
        location: 'initialization',
        valueName: 'criticalState',
      });
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(error.stack);
    }
  });
});

console.log('\n✅ Assertion utilities test suite complete');
