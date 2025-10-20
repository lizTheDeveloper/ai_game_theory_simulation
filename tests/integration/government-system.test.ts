/**
 * Integration Tests: Government System
 *
 * Tests integration of government-agents package with simulation
 *
 * @module tests/integration/government-system
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '../../src/simulation/initialization';
import { initializeGovernmentSystem } from '../../src/simulation/government/initialization';

test('Government system initializes with 30 countries', () => {
  const govSystem = initializeGovernmentSystem(() => Math.random());

  assert.strictEqual(govSystem.governments.size, 30, 'Should have 30 governments');
  assert.ok(govSystem.governments.has('USA'), 'Should include USA');
  assert.ok(govSystem.governments.has('CHN'), 'Should include CHN');
  assert.ok(govSystem.governments.has('DEU'), 'Should include DEU');
  assert.ok(govSystem.governments.has('GBR'), 'Should include GBR');
  assert.ok(govSystem.governments.has('JPN'), 'Should include JPN');

  console.log('✓ Government system initialized with 30 countries');
});

test('Government system integrates with GameState', () => {
  const state = createDefaultInitialState('historical');

  assert.ok(state.governmentSystem, 'GameState should have government system');
  assert.strictEqual(state.governmentSystem.governments.size, 30, 'Should have 30 governments');
  assert.strictEqual(state.governmentSystem.activePolicies.length, 0, 'Should start with no active policies');
  assert.strictEqual(state.governmentSystem.treaties.length, 0, 'Should start with no treaties');
  assert.strictEqual(state.governmentSystem.totalPoliciesEnacted, 0, 'Should start with 0 policies enacted');

  console.log('✓ Government system integrated with GameState');
});

test('Government system has public opinion initialized', () => {
  const govSystem = initializeGovernmentSystem(() => Math.random());

  assert.strictEqual(govSystem.publicOpinion.size, 30, 'Should have opinion for all 30 countries');

  // Check opinion is in valid range [0, 1]
  for (const [code, opinion] of govSystem.publicOpinion) {
    assert.ok(opinion >= 0 && opinion <= 1, `Opinion for ${code} should be in [0,1] range`);
  }

  console.log('✓ Public opinion initialized for all countries');
});

test('Government system has election schedule initialized', () => {
  const govSystem = initializeGovernmentSystem(() => Math.random());

  assert.strictEqual(govSystem.nextElections.size, 30, 'Should have elections scheduled for all 30 countries');

  // Check elections are scheduled in future
  for (const [code, electionMonth] of govSystem.nextElections) {
    assert.ok(electionMonth > 0, `Election for ${code} should be scheduled in future`);
    assert.ok(electionMonth < 100, `Election for ${code} should be within reasonable timeframe`);
  }

  console.log('✓ Elections scheduled for all countries');
});

test('Government system has AI comprehension lag initialized', () => {
  const govSystem = initializeGovernmentSystem(() => Math.random());

  assert.strictEqual(govSystem.comprehensionLag.size, 30, 'Should have comprehension lag for all 30 countries');

  // Check lag is in reasonable range (3-24 months based on capacity)
  for (const [code, lag] of govSystem.comprehensionLag) {
    assert.ok(lag >= 0 && lag <= 30, `Comprehension lag for ${code} should be in [0,30] month range`);
  }

  console.log('✓ AI comprehension lag initialized for all countries');
});

test('Government system has international coordination metric', () => {
  const govSystem = initializeGovernmentSystem(() => Math.random());

  assert.ok(typeof govSystem.internationalCoordination === 'number', 'Should have coordination metric');
  assert.ok(
    govSystem.internationalCoordination >= 0 && govSystem.internationalCoordination <= 1,
    'Coordination should be in [0,1] range'
  );

  console.log('✓ International coordination initialized');
});
