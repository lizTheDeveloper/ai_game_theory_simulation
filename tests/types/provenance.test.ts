/**
 * Unit tests for Provenance Type System
 *
 * Tests type guards, validation, and factory functions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isPlaceholder,
  isInformed,
  isVerified,
  validateProvenance,
  createPlaceholder,
  createInformed,
  createVerified,
  PlaceholderProvenance,
  InformedProvenance,
  VerifiedProvenance,
} from '../../src/types/provenance';

describe('Provenance Type System', () => {
  describe('Type Guards', () => {
    it('isPlaceholder() identifies PLACEHOLDER provenance', () => {
      const prov = createPlaceholder(0.3, 'Temporary value');

      assert.strictEqual(isPlaceholder(prov), true);
      assert.strictEqual(isInformed(prov), false);
      assert.strictEqual(isVerified(prov), false);
    });

    it('isInformed() identifies INFORMED provenance', () => {
      const prov = createInformed(0.6, 'Extrapolated from Jevons paradox');

      assert.strictEqual(isPlaceholder(prov), false);
      assert.strictEqual(isInformed(prov), true);
      assert.strictEqual(isVerified(prov), false);
    });

    it('isVerified() identifies VERIFIED provenance', () => {
      const prov = createVerified(
        '10.1234/test',
        'Author et al. (2024)',
        2.0
      );

      assert.strictEqual(isPlaceholder(prov), false);
      assert.strictEqual(isInformed(prov), false);
      assert.strictEqual(isVerified(prov), true);
    });
  });

  describe('validateProvenance', () => {
    describe('Common validations', () => {
      it('rejects confidence < 0', () => {
        const prov: PlaceholderProvenance = {
          type: 'PLACEHOLDER',
          confidence: -0.1,
          created: new Date().toISOString(),
          needs_validation: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some((e) => e.includes('between 0 and 1')));
      });

      it('rejects confidence > 1', () => {
        const prov: PlaceholderProvenance = {
          type: 'PLACEHOLDER',
          confidence: 1.5,
          created: new Date().toISOString(),
          needs_validation: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some((e) => e.includes('between 0 and 1')));
      });

      it('requires created timestamp', () => {
        const prov: any = {
          type: 'PLACEHOLDER',
          confidence: 0.3,
          needs_validation: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some((e) => e.includes('Created timestamp')));
      });
    });

    describe('PLACEHOLDER validations', () => {
      it('validates correct PLACEHOLDER provenance', () => {
        const prov = createPlaceholder(0.3, 'Temporary value');

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
      });

      it('requires needs_validation: true', () => {
        const prov: any = {
          type: 'PLACEHOLDER',
          confidence: 0.3,
          created: new Date().toISOString(),
          needs_validation: false, // Wrong!
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(
          result.errors.some((e) => e.includes('needs_validation: true'))
        );
      });

      it('warns if confidence too high (>0.5)', () => {
        const prov: PlaceholderProvenance = {
          type: 'PLACEHOLDER',
          confidence: 0.7,
          created: new Date().toISOString(),
          needs_validation: true,
        };

        const result = validateProvenance(prov);

        assert.ok(result.warnings.some((w) => w.includes('should be low')));
      });

      it('suggests upgrading before production', () => {
        const prov = createPlaceholder(0.3);

        const result = validateProvenance(prov);

        assert.ok(
          result.suggestions?.some((s) => s.includes('Upgrade to INFORMED'))
        );
      });
    });

    describe('INFORMED validations', () => {
      it('validates correct INFORMED provenance', () => {
        const prov = createInformed(
          0.6,
          'Extrapolated from Jevons paradox',
          ['Author et al. 2023']
        );

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
      });

      it('warns if missing method and related_sources', () => {
        const prov: InformedProvenance = {
          type: 'INFORMED',
          confidence: 0.6,
          created: new Date().toISOString(),
        };

        const result = validateProvenance(prov);

        assert.ok(
          result.warnings.some((w) => w.includes('method or related_sources'))
        );
      });

      it('suggests upgrading to VERIFIED if confidence high', () => {
        const prov = createInformed(0.8, 'Based on similar research');

        const result = validateProvenance(prov);

        assert.ok(
          result.suggestions?.some((s) => s.includes('upgrading to VERIFIED'))
        );
      });
    });

    describe('VERIFIED validations', () => {
      it('validates correct VERIFIED provenance', () => {
        const prov = createVerified(
          '10.1234/test',
          'Author et al. (2024). Title. Journal.',
          2.0,
          0.95
        );

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
      });

      it('requires DOI', () => {
        const prov: any = {
          type: 'VERIFIED',
          confidence: 0.95,
          created: new Date().toISOString(),
          citation: 'Author et al. (2024)',
          cited_value: 2.0,
          last_validated: new Date().toISOString(),
          drift_monitor: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some((e) => e.includes('must have DOI')));
      });

      it('requires citation', () => {
        const prov: any = {
          type: 'VERIFIED',
          confidence: 0.95,
          created: new Date().toISOString(),
          doi: '10.1234/test',
          cited_value: 2.0,
          last_validated: new Date().toISOString(),
          drift_monitor: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some((e) => e.includes('must have citation')));
      });

      it('requires cited_value', () => {
        const prov: any = {
          type: 'VERIFIED',
          confidence: 0.95,
          created: new Date().toISOString(),
          doi: '10.1234/test',
          citation: 'Author et al. (2024)',
          last_validated: new Date().toISOString(),
          drift_monitor: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some((e) => e.includes('must have cited_value')));
      });

      it('requires last_validated timestamp', () => {
        const prov: any = {
          type: 'VERIFIED',
          confidence: 0.95,
          created: new Date().toISOString(),
          doi: '10.1234/test',
          citation: 'Author et al. (2024)',
          cited_value: 2.0,
          drift_monitor: true,
        };

        const result = validateProvenance(prov);

        assert.strictEqual(result.valid, false);
        assert.ok(
          result.errors.some((e) => e.includes('must have last_validated'))
        );
      });

      it('warns if confidence too low (<0.9)', () => {
        const prov = createVerified(
          '10.1234/test',
          'Author et al. (2024)',
          2.0,
          0.7
        );

        const result = validateProvenance(prov);

        assert.ok(
          result.warnings.some((w) => w.includes('should be high'))
        );
      });
    });
  });

  describe('Factory Functions', () => {
    describe('createPlaceholder', () => {
      it('creates valid PLACEHOLDER provenance', () => {
        const prov = createPlaceholder(0.3, 'Testing placeholder');

        assert.strictEqual(prov.type, 'PLACEHOLDER');
        assert.strictEqual(prov.confidence, 0.3);
        assert.strictEqual(prov.needs_validation, true);
        assert.strictEqual(prov.rationale, 'Testing placeholder');
        assert.ok(prov.created);
      });

      it('defaults to confidence 0.3', () => {
        const prov = createPlaceholder();

        assert.strictEqual(prov.confidence, 0.3);
      });

      it('sets estimation_method to temporary', () => {
        const prov = createPlaceholder();

        assert.strictEqual(prov.estimation_method, 'temporary');
      });
    });

    describe('createInformed', () => {
      it('creates valid INFORMED provenance', () => {
        const prov = createInformed(
          0.6,
          'Extrapolated from research',
          ['Author 2024']
        );

        assert.strictEqual(prov.type, 'INFORMED');
        assert.strictEqual(prov.confidence, 0.6);
        assert.strictEqual(prov.method, 'Extrapolated from research');
        assert.deepStrictEqual(prov.related_sources, ['Author 2024']);
        assert.ok(prov.created);
      });

      it('works without related_sources', () => {
        const prov = createInformed(0.6, 'Industry standard');

        assert.strictEqual(prov.type, 'INFORMED');
        assert.strictEqual(prov.method, 'Industry standard');
        assert.strictEqual(prov.related_sources, undefined);
      });
    });

    describe('createVerified', () => {
      it('creates valid VERIFIED provenance', () => {
        const prov = createVerified(
          '10.1234/test',
          'Author et al. (2024). Title. Journal.',
          2.0,
          0.95
        );

        assert.strictEqual(prov.type, 'VERIFIED');
        assert.strictEqual(prov.confidence, 0.95);
        assert.strictEqual(prov.doi, '10.1234/test');
        assert.strictEqual(prov.citation, 'Author et al. (2024). Title. Journal.');
        assert.strictEqual(prov.cited_value, 2.0);
        assert.strictEqual(prov.drift_monitor, true);
        assert.ok(prov.created);
        assert.ok(prov.last_validated);
      });

      it('defaults to confidence 0.95', () => {
        const prov = createVerified(
          '10.1234/test',
          'Author et al. (2024)',
          2.0
        );

        assert.strictEqual(prov.confidence, 0.95);
      });

      it('enables drift monitoring by default', () => {
        const prov = createVerified(
          '10.1234/test',
          'Author et al. (2024)',
          2.0
        );

        assert.strictEqual(prov.drift_monitor, true);
      });
    });
  });
});
