import { test } from 'node:test';
import assert from 'node:assert';
import {
  GovernmentType,
  GOVERNMENT_TYPE_CHARACTERISTICS,
  createStateCapacity,
  Government
} from '../../src/index.js';

test('Government types have correct characteristics', () => {
  const parliamentary = GOVERNMENT_TYPE_CHARACTERISTICS[GovernmentType.PARLIAMENTARY_DEMOCRACY];
  assert.strictEqual(parliamentary.requiresCoalitions, true);
  assert.strictEqual(parliamentary.allowsEarlyElections, true);

  const presidential = GOVERNMENT_TYPE_CHARACTERISTICS[GovernmentType.PRESIDENTIAL_DEMOCRACY];
  assert.strictEqual(presidential.requiresCoalitions, false);
  assert.strictEqual(presidential.allowsEarlyElections, false);

  const authoritarian = GOVERNMENT_TYPE_CHARACTERISTICS[GovernmentType.AUTHORITARIAN_TECHNOCRACY];
  assert.strictEqual(authoritarian.electionCycleMonths, null);
  assert.ok(authoritarian.decisionSpeed > 1.0); // Faster than baseline
});

test('State capacity calculates derived metrics correctly', () => {
  // Singapore (high capacity)
  const singapore = createStateCapacity({
    governmentEffectiveness: 2.36,
    controlOfCorruption: 2.2,
    regulatoryQuality: 2.1
  });

  assert.ok(singapore.derived.policySuccessMultiplier > 1.5); // 71% boost
  assert.ok(singapore.derived.implementationNoise < 0.1); // Low corruption noise
  assert.ok(singapore.derived.aiComprehensionLagMonths < 40); // Fast comprehension

  // Venezuela (low capacity)
  const venezuela = createStateCapacity({
    governmentEffectiveness: -1.68,
    controlOfCorruption: -1.6,
    regulatoryQuality: -2.2
  });

  assert.ok(venezuela.derived.policySuccessMultiplier < 1.0); // Penalty
  assert.ok(venezuela.derived.implementationNoise > 0.3); // High corruption noise
  assert.ok(venezuela.derived.aiComprehensionLagMonths > 60); // Slow comprehension
});

test('Government class works correctly', () => {
  const germany = new Government({
    countryCode: 'DEU',
    countryName: 'Germany',
    type: GovernmentType.PARLIAMENTARY_DEMOCRACY,
    capacity: createStateCapacity({
      governmentEffectiveness: 1.6,
      controlOfCorruption: 1.9,
      regulatoryQuality: 1.7
    }),
    population: 83.2,
    gdpPPP: 4800,
    year: 2024
  });

  assert.strictEqual(germany.countryCode, 'DEU');
  assert.strictEqual(germany.type, GovernmentType.PARLIAMENTARY_DEMOCRACY);
  assert.strictEqual(germany.requiresCoalitions(), true);
  assert.strictEqual(germany.canHoldEarlyElections(), true);
  assert.ok(germany.getPolicySuccessRate() > 1.0);
  assert.ok(germany.getImplementationNoise() < 0.15);
});
