/**
 * Unit tests for @provenance decorator
 *
 * Coverage target: >90%
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  provenance,
  ProvenanceRegistry,
  getRegistry,
  registerProvenance,
  checkCoverage,
  getProvenanceStats,
} from '../provenance';
import {
  createPlaceholder,
  createInformed,
  createVerified,
} from '@/types/provenance';

describe('ProvenanceRegistry', () => {
  let registry: ProvenanceRegistry;

  beforeEach(() => {
    registry = ProvenanceRegistry.getInstance();
    registry.clear();
  });

  it('should be a singleton', () => {
    const instance1 = ProvenanceRegistry.getInstance();
    const instance2 = ProvenanceRegistry.getInstance();
    assert.strictEqual(instance1, instance2);
  });

  it('should register and retrieve parameters', () => {
    const param = {
      name: 'TEST_PARAM',
      value: 100,
      provenance: createPlaceholder(0.3, 'Test parameter'),
    };

    registry.register(param);
    assert.strictEqual(registry.has('TEST_PARAM'), true);
    assert.deepStrictEqual(registry.get('TEST_PARAM'), param);
  });

  it('should get all registered parameters', () => {
    registry.register({
      name: 'PARAM_1',
      value: 10,
      provenance: createPlaceholder(0.3),
    });
    registry.register({
      name: 'PARAM_2',
      value: 20,
      provenance: createPlaceholder(0.3),
    });

    const all = registry.getAll();
    assert.strictEqual(all.length, 2);
  });

  it('should filter by provenance level', () => {
    registry.register({
      name: 'PLACEHOLDER_PARAM',
      value: 10,
      provenance: createPlaceholder(0.3),
    });
    registry.register({
      name: 'VERIFIED_PARAM',
      value: 20,
      provenance: createVerified('10.1234/test', 'Test citation', 20),
    });

    const placeholders = registry.getByLevel('PLACEHOLDER');
    const verified = registry.getByLevel('VERIFIED');

    assert.strictEqual(placeholders.length, 1);
    assert.strictEqual(verified.length, 1);
    assert.strictEqual(placeholders[0].name, 'PLACEHOLDER_PARAM');
    assert.strictEqual(verified[0].name, 'VERIFIED_PARAM');
  });

  it('should get parameters needing validation', () => {
    registry.register({
      name: 'NEEDS_VALIDATION',
      value: 10,
      provenance: createPlaceholder(0.3, 'Needs validation'),
    });
    registry.register({
      name: 'VERIFIED',
      value: 20,
      provenance: createVerified('10.1234/test', 'Test', 20),
    });

    const needsValidation = registry.getNeedsValidation();
    assert.strictEqual(needsValidation.length, 1);
    assert.strictEqual(needsValidation[0].name, 'NEEDS_VALIDATION');
  });

  it('should filter by sensitivity level', () => {
    registry.register({
      name: 'HIGH_SENSITIVITY',
      value: 10,
      provenance: createPlaceholder(0.3),
      sensitivity: {
        level: 'HIGH',
        variance: 0.5,
        last_analyzed: new Date().toISOString(),
      },
    });
    registry.register({
      name: 'LOW_SENSITIVITY',
      value: 20,
      provenance: createPlaceholder(0.3),
      sensitivity: {
        level: 'LOW',
        variance: 0.01,
        last_analyzed: new Date().toISOString(),
      },
    });

    const highSens = registry.getBySensitivity('HIGH');
    assert.strictEqual(highSens.length, 1);
    assert.strictEqual(highSens[0].name, 'HIGH_SENSITIVITY');
  });

  it('should export and import registry', () => {
    registry.register({
      name: 'TEST_PARAM',
      value: 100,
      provenance: createPlaceholder(0.3),
    });

    const exported = registry.export();
    assert.ok('TEST_PARAM' in exported);

    registry.clear();
    assert.strictEqual(registry.count(), 0);

    registry.import(exported);
    assert.strictEqual(registry.count(), 1);
    assert.strictEqual(registry.has('TEST_PARAM'), true);
  });

  it('should count registered parameters', () => {
    assert.strictEqual(registry.count(), 0);

    registry.register({
      name: 'PARAM_1',
      value: 10,
      provenance: createPlaceholder(0.3),
    });
    assert.strictEqual(registry.count(), 1);

    registry.register({
      name: 'PARAM_2',
      value: 20,
      provenance: createPlaceholder(0.3),
    });
    assert.strictEqual(registry.count(), 2);
  });
});

describe('provenance() decorator', () => {
  beforeEach(() => {
    const registry = ProvenanceRegistry.getInstance();
    registry.clear();
  });

  it('should return original value (pass-through)', () => {
    const value = provenance(280, {
      name: 'CO2_BASELINE',
      provenance: createVerified('10.1234/test', 'Test citation', 280),
    });

    assert.strictEqual(value, 280);
  });

  it('should register parameter in global registry', () => {
    provenance(280, {
      name: 'CO2_BASELINE',
      provenance: createVerified('10.1234/test', 'Test citation', 280),
    });

    const registry = getRegistry();
    assert.strictEqual(registry.has('CO2_BASELINE'), true);

    const param = registry.get('CO2_BASELINE');
    assert.strictEqual(param?.value, 280);
    assert.strictEqual(param?.provenance.type, 'VERIFIED');
  });

  it('should support PLACEHOLDER provenance', () => {
    const value = provenance(50, {
      name: 'TEMP_VALUE',
      provenance: createPlaceholder(0.3, 'Temporary value'),
      tags: ['temporary'],
    });

    assert.strictEqual(value, 50);

    const registry = getRegistry();
    const param = registry.get('TEMP_VALUE');
    assert.strictEqual(param?.provenance.type, 'PLACEHOLDER');
    if (param?.provenance.type === 'PLACEHOLDER') {
      assert.strictEqual(param.provenance.needs_validation, true);
    }
  });

  it('should support INFORMED provenance', () => {
    const value = provenance(0.03, {
      name: 'GROWTH_RATE',
      units: 'per year',
      provenance: createInformed(0.7, 'Extrapolated from World Bank data', [
        'https://data.worldbank.org',
      ]),
    });

    assert.strictEqual(value, 0.03);

    const registry = getRegistry();
    const param = registry.get('GROWTH_RATE');
    assert.strictEqual(param?.provenance.type, 'INFORMED');
    assert.strictEqual(param?.units, 'per year');
  });

  it('should validate provenance metadata and throw on errors', () => {
    assert.throws(
      () => {
        provenance(100, {
          name: 'INVALID_PARAM',
          provenance: {
            type: 'VERIFIED',
            confidence: 0.95,
            created: new Date().toISOString(),
            // Missing required fields: doi, citation, cited_value, last_validated
          } as any,
        });
      },
      /PROVENANCE ERROR/
    );
  });

  it('should auto-generate parameter name if not provided', () => {
    const value = provenance(123, {
      provenance: createPlaceholder(0.3),
    });

    assert.strictEqual(value, 123);

    const registry = getRegistry();
    const all = registry.getAll();
    assert.strictEqual(all.length, 1);
    assert.match(all[0].name, /^unnamed_\d+$/);
  });

  it('should preserve units in registry', () => {
    provenance(280, {
      name: 'CO2_BASELINE',
      units: 'ppm',
      provenance: createVerified('10.1234/test', 'Test', 280),
    });

    const registry = getRegistry();
    const param = registry.get('CO2_BASELINE');
    assert.strictEqual(param?.units, 'ppm');
  });

  it('should preserve notes in provenance description', () => {
    provenance(100, {
      name: 'TEST_PARAM',
      provenance: createPlaceholder(0.3),
      notes: 'Custom note about this parameter',
    });

    const registry = getRegistry();
    const param = registry.get('TEST_PARAM');
    assert.strictEqual(param?.provenance.description, 'Custom note about this parameter');
  });
});

describe('registerProvenance() batch registration', () => {
  beforeEach(() => {
    const registry = ProvenanceRegistry.getInstance();
    registry.clear();
  });

  it('should register multiple parameters at once', () => {
    registerProvenance([
      {
        name: 'PARAM_1',
        value: 10,
        provenance: createPlaceholder(0.3),
      },
      {
        name: 'PARAM_2',
        value: 20,
        provenance: createVerified('10.1234/test', 'Test', 20),
      },
    ]);

    const registry = getRegistry();
    assert.strictEqual(registry.count(), 2);
    assert.strictEqual(registry.has('PARAM_1'), true);
    assert.strictEqual(registry.has('PARAM_2'), true);
  });

  it('should validate all parameters and throw on first error', () => {
    assert.throws(
      () => {
        registerProvenance([
          {
            name: 'VALID_PARAM',
            value: 10,
            provenance: createPlaceholder(0.3),
          },
          {
            name: 'INVALID_PARAM',
            value: 20,
            provenance: {
              type: 'VERIFIED',
              confidence: 0.95,
              created: new Date().toISOString(),
              // Missing required fields
            } as any,
          },
        ]);
      },
      /PROVENANCE ERROR/
    );
  });
});

describe('checkCoverage() utility', () => {
  beforeEach(() => {
    const registry = ProvenanceRegistry.getInstance();
    registry.clear();
  });

  it('should return parameters without provenance', () => {
    provenance(10, {
      name: 'REGISTERED_PARAM',
      provenance: createPlaceholder(0.3),
    });

    const missing = checkCoverage([
      'REGISTERED_PARAM',
      'MISSING_PARAM_1',
      'MISSING_PARAM_2',
    ]);

    assert.strictEqual(missing.length, 2);
    assert.ok(missing.includes('MISSING_PARAM_1'));
    assert.ok(missing.includes('MISSING_PARAM_2'));
  });

  it('should return empty array if all parameters covered', () => {
    provenance(10, { name: 'PARAM_1', provenance: createPlaceholder(0.3) });
    provenance(20, { name: 'PARAM_2', provenance: createPlaceholder(0.3) });

    const missing = checkCoverage(['PARAM_1', 'PARAM_2']);
    assert.strictEqual(missing.length, 0);
  });
});

describe('getProvenanceStats() utility', () => {
  beforeEach(() => {
    const registry = ProvenanceRegistry.getInstance();
    registry.clear();
  });

  it('should return correct statistics', () => {
    provenance(10, { name: 'PLACEHOLDER_1', provenance: createPlaceholder(0.3) });
    provenance(20, { name: 'PLACEHOLDER_2', provenance: createPlaceholder(0.3) });
    provenance(30, {
      name: 'INFORMED_1',
      provenance: createInformed(0.7, 'Extrapolated', []),
    });
    provenance(40, {
      name: 'VERIFIED_1',
      provenance: createVerified('10.1234/test', 'Test', 40),
    });

    const stats = getProvenanceStats();

    assert.strictEqual(stats.total, 4);
    assert.strictEqual(stats.placeholder, 2);
    assert.strictEqual(stats.informed, 1);
    assert.strictEqual(stats.verified, 1);
    assert.strictEqual(stats.needsValidation, 2); // Both placeholders need validation
  });

  it('should return zeros for empty registry', () => {
    const stats = getProvenanceStats();

    assert.strictEqual(stats.total, 0);
    assert.strictEqual(stats.placeholder, 0);
    assert.strictEqual(stats.informed, 0);
    assert.strictEqual(stats.verified, 0);
    assert.strictEqual(stats.needsValidation, 0);
  });
});
