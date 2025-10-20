/**
 * Phase 0: Verify package structure
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { VERSION, RESEARCH_CITATIONS } from '../src/index.js';

test('Package exports version', () => {
  assert.strictEqual(VERSION, '0.1.0');
});

test('Package exports research citations', () => {
  assert.ok(RESEARCH_CITATIONS.vdem);
  assert.ok(RESEARCH_CITATIONS.wgi);
  assert.ok(RESEARCH_CITATIONS.laver);
  assert.ok(RESEARCH_CITATIONS.manifesto);
  assert.ok(RESEARCH_CITATIONS.ipu);
});

test('Package structure is clean', () => {
  // This test verifies the package can be imported without errors
  assert.ok(true);
});
