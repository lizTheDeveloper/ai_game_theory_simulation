/**
 * Tests for Claim Validator
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateClaim,
  validateCitation,
  validateClaims,
  getValidationSummary,
  filterByValidationStatus,
} from '../claimValidator';
import type { Claim, Citation } from '@/types/claims';

const mockCitation: Citation = {
  format: 'APA',
  raw: 'Smith, J. (2023). Test. Nature.',
  authors: ['Smith, J.'],
  year: 2023,
  title: 'Test',
  venue: 'Nature',
  doi: '10.1234/test',
  parsed_at: new Date().toISOString(),
  confidence: 0.9,
};

const mockClaim: Claim = {
  id: 'test-claim-1',
  text: 'Climate change causes 50% increase in extreme weather events.',
  type: 'causal',
  severity: 'HIGH',
  certainty: 'high',
  citations: [mockCitation],
  source: {
    file: 'test.md',
    line: 10,
    section: 'Climate Impacts',
  },
  extracted_values: [{ value: 50, unit: '%', context: '50% increase' }],
  extracted_at: new Date().toISOString(),
};

describe('Claim Validator', () => {
  describe('validateClaim', () => {
    it('should validate complete claim', () => {
      const result = validateClaim(mockClaim);

      assert.ok(result.valid, 'Complete claim should be valid');
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject claim without ID', () => {
      const claim = { ...mockClaim, id: '' };
      const result = validateClaim(claim);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('ID')));
    });

    it('should reject claim without text', () => {
      const claim = { ...mockClaim, text: '' };
      const result = validateClaim(claim);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('text')));
    });

    it('should reject claim without citations in production mode', () => {
      const claim = { ...mockClaim, citations: [] };
      const result = validateClaim(claim, { allowPlaceholder: false });

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('citation')));
    });

    it('should allow uncited claims in placeholder mode', () => {
      const claim = { ...mockClaim, citations: [] };
      const result = validateClaim(claim, { allowPlaceholder: true });

      // Should not be an error, just a warning
      assert.ok(result.warnings.some((w) => w.includes('citations')));
    });

    it('should require multiple citations for CRITICAL claims', () => {
      const claim = { ...mockClaim, severity: 'CRITICAL' as const, citations: [mockCitation] };
      const result = validateClaim(claim, { minCitationsForCritical: 2 });

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('CRITICAL')));
    });

    it('should warn on very short claim text', () => {
      const claim = { ...mockClaim, text: 'Short' };
      const result = validateClaim(claim);

      assert.ok(result.warnings.some((w) => w.includes('short')));
    });

    it('should warn on very long claim text', () => {
      const claim = { ...mockClaim, text: 'x'.repeat(600) };
      const result = validateClaim(claim);

      assert.ok(result.warnings.some((w) => w.includes('long')));
    });

    it('should detect placeholder language', () => {
      const claim = { ...mockClaim, text: 'TODO: fix this claim with real data' };
      const result = validateClaim(claim, { allowPlaceholder: false });

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('placeholder')));
    });

    it('should validate quantitative claims have extracted values', () => {
      const claim = {
        ...mockClaim,
        type: 'quantitative' as const,
        extracted_values: [],
      };
      const result = validateClaim(claim);

      assert.ok(result.warnings.some((w) => w.includes('extracted values')));
    });

    it('should reject invalid extracted values', () => {
      const claim = {
        ...mockClaim,
        type: 'quantitative' as const,
        extracted_values: [{ value: NaN, context: 'test' }],
      };
      const result = validateClaim(claim);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('Invalid')));
    });
  });

  describe('validateCitation', () => {
    it('should validate complete citation', () => {
      const errors = validateCitation(mockCitation);

      assert.strictEqual(errors.length, 0);
    });

    it('should reject citation without format', () => {
      const citation = { ...mockCitation, format: undefined as any };
      const errors = validateCitation(citation);

      assert.ok(errors.some((e) => e.includes('format')));
    });

    it('should reject citation with invalid year', () => {
      const citation = { ...mockCitation, year: 1800 };
      const errors = validateCitation(citation);

      assert.ok(errors.some((e) => e.includes('year')));
    });

    it('should reject future year beyond reasonable threshold', () => {
      const citation = { ...mockCitation, year: 2100 };
      const errors = validateCitation(citation);

      assert.ok(errors.some((e) => e.includes('year')));
    });

    it('should reject invalid DOI format', () => {
      const citation = { ...mockCitation, doi: 'invalid-doi' };
      const errors = validateCitation(citation);

      assert.ok(errors.some((e) => e.includes('DOI')));
    });

    it('should reject invalid URL format', () => {
      const citation = { ...mockCitation, url: 'not-a-url' };
      const errors = validateCitation(citation);

      assert.ok(errors.some((e) => e.includes('URL')));
    });

    it('should reject confidence outside [0,1]', () => {
      const citation = { ...mockCitation, confidence: 1.5 };
      const errors = validateCitation(citation);

      assert.ok(errors.some((e) => e.includes('confidence')));
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple claims', () => {
      const claims = [
        mockClaim,
        { ...mockClaim, id: 'test-claim-2' },
        { ...mockClaim, id: 'test-claim-3' },
      ];

      const results = validateClaims(claims);

      assert.strictEqual(results.size, 3);
      assert.ok(results.get('test-claim-1')?.valid);
      assert.ok(results.get('test-claim-2')?.valid);
      assert.ok(results.get('test-claim-3')?.valid);
    });

    it('should collect validation errors', () => {
      const claims = [
        mockClaim,
        { ...mockClaim, id: '', text: 'Invalid claim' }, // Missing ID
      ];

      const results = validateClaims(claims);

      assert.strictEqual(results.size, 2);
      assert.ok(results.get(mockClaim.id)?.valid);
      assert.strictEqual(results.get('')?.valid, false);
    });
  });

  describe('Validation Summary', () => {
    it('should calculate summary statistics', () => {
      const results = new Map();
      results.set('1', { valid: true, errors: [], warnings: [] });
      results.set('2', { valid: false, errors: ['error'], warnings: [] });
      results.set('3', { valid: true, errors: [], warnings: ['warning'] });

      const summary = getValidationSummary(results);

      assert.strictEqual(summary.total, 3);
      assert.strictEqual(summary.valid, 2);
      assert.strictEqual(summary.invalid, 1);
      assert.strictEqual(summary.withErrors, 1);
      assert.strictEqual(summary.withWarnings, 1);
    });

    it('should calculate error rate', () => {
      const results = new Map();
      results.set('1', { valid: false, errors: ['e'], warnings: [] });
      results.set('2', { valid: false, errors: ['e'], warnings: [] });
      results.set('3', { valid: true, errors: [], warnings: [] });
      results.set('4', { valid: true, errors: [], warnings: [] });

      const summary = getValidationSummary(results);

      assert.strictEqual(summary.errorRate, 0.5); // 2/4
    });
  });

  describe('Filtering', () => {
    it('should filter valid claims', () => {
      const claims = [
        mockClaim,
        { ...mockClaim, id: 'invalid', text: '' }, // Invalid
      ];

      const results = validateClaims(claims);
      const valid = filterByValidationStatus(claims, results, 'valid');

      assert.strictEqual(valid.length, 1);
      assert.strictEqual(valid[0].id, mockClaim.id);
    });

    it('should filter invalid claims', () => {
      const claims = [
        mockClaim,
        { ...mockClaim, id: 'invalid', text: '' }, // Invalid
      ];

      const results = validateClaims(claims);
      const invalid = filterByValidationStatus(claims, results, 'invalid');

      assert.strictEqual(invalid.length, 1);
      assert.strictEqual(invalid[0].id, 'invalid');
    });
  });

  describe('Severity-Certainty Consistency', () => {
    it('should warn on CRITICAL claims with low certainty', () => {
      const claim = {
        ...mockClaim,
        severity: 'CRITICAL' as const,
        certainty: 'low' as const,
      };
      const result = validateClaim(claim);

      assert.ok(result.warnings.some((w) => w.includes('certainty')));
    });

    it('should warn on LOW severity with definitive certainty', () => {
      const claim = {
        ...mockClaim,
        severity: 'LOW' as const,
        certainty: 'definitive' as const,
      };
      const result = validateClaim(claim);

      assert.ok(result.warnings.some((w) => w.includes('unusual')));
    });
  });
});
