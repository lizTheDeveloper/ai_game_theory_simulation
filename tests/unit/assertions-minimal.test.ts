/**
 * Assertion Utilities - Minimal Unit Tests
 *
 * Core assertion function tests without full game state initialization
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  assertFinite,
  assertDefined,
  assertInRange,
  assertProbability,
  assertNonEmpty,
  assertStateProperty,
} from '../../src/simulation/utils/assertions.js';

describe('Assertion Utilities - Core', () => {
  describe('assertFinite', () => {
    it('should accept finite numbers', () => {
      assert.strictEqual(assertFinite(42, { location: 'test', valueName: 'val' }), 42);
      assert.strictEqual(assertFinite(0, { location: 'test', valueName: 'val' }), 0);
      assert.strictEqual(assertFinite(-100, { location: 'test', valueName: 'val' }), -100);
    });

    it('should reject NaN and Infinity', () => {
      assert.throws(() => assertFinite(NaN, { location: 'test', valueName: 'val' }));
      assert.throws(() => assertFinite(Infinity, { location: 'test', valueName: 'val' }));
      assert.throws(() => assertFinite(-Infinity, { location: 'test', valueName: 'val' }));
    });
  });

  describe('assertDefined', () => {
    it('should accept defined values', () => {
      assert.strictEqual(assertDefined(42, { location: 'test', valueName: 'val' }), 42);
      assert.strictEqual(assertDefined(0, { location: 'test', valueName: 'val' }), 0);
      assert.strictEqual(assertDefined(false, { location: 'test', valueName: 'val' }), false);
    });

    it('should reject undefined and null', () => {
      assert.throws(() => assertDefined(undefined, { location: 'test', valueName: 'val' }));
      assert.throws(() => assertDefined(null, { location: 'test', valueName: 'val' }));
    });
  });

  describe('assertInRange', () => {
    it('should accept values in range', () => {
      assert.strictEqual(assertInRange(5, 0, 10, { location: 'test', valueName: 'val' }), 5);
      assert.strictEqual(assertInRange(0, 0, 10, { location: 'test', valueName: 'val' }), 0);
      assert.strictEqual(assertInRange(10, 0, 10, { location: 'test', valueName: 'val' }), 10);
    });

    it('should reject out-of-range values', () => {
      assert.throws(() => assertInRange(-1, 0, 10, { location: 'test', valueName: 'val' }));
      assert.throws(() => assertInRange(11, 0, 10, { location: 'test', valueName: 'val' }));
    });
  });

  describe('assertProbability', () => {
    it('should accept probabilities [0, 1]', () => {
      assert.strictEqual(assertProbability(0, { location: 'test', valueName: 'p' }), 0);
      assert.strictEqual(assertProbability(0.5, { location: 'test', valueName: 'p' }), 0.5);
      assert.strictEqual(assertProbability(1, { location: 'test', valueName: 'p' }), 1);
    });

    it('should reject invalid probabilities', () => {
      assert.throws(() => assertProbability(-0.1, { location: 'test', valueName: 'p' }));
      assert.throws(() => assertProbability(1.1, { location: 'test', valueName: 'p' }));
    });
  });

  describe('assertNonEmpty', () => {
    it('should accept non-empty arrays', () => {
      const arr = [1, 2, 3];
      assert.strictEqual(assertNonEmpty(arr, { location: 'test', valueName: 'arr' }), arr);
    });

    it('should reject empty/undefined arrays', () => {
      assert.throws(() => assertNonEmpty([], { location: 'test', valueName: 'arr' }));
      assert.throws(() => assertNonEmpty(undefined, { location: 'test', valueName: 'arr' }));
    });
  });

  describe('assertStateProperty', () => {
    it('should accept existing properties', () => {
      const obj = { value: 42, nested: { deep: 100 } };
      assert.strictEqual(assertStateProperty(obj, 'value', { location: 'test' }), 42);
      assert.strictEqual(assertStateProperty(obj, 'nested.deep', { location: 'test' }), 100);
    });

    it('should reject missing properties', () => {
      const obj = { value: 42 };
      assert.throws(() => assertStateProperty(obj, 'missing', { location: 'test' }));
      assert.throws(() => assertStateProperty(obj, 'nested.deep', { location: 'test' }));
    });
  });
});

console.log('\n✅ Assertion utilities minimal test suite passed');
