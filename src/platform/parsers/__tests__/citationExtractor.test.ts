/**
 * Tests for Citation Extractor
 *
 * Coverage: parseCitation, extractCitations, format-specific parsers
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseCitation,
  extractCitations,
  extractInlineCitations,
  normalizeCitation,
  isCompleteCitation,
  extractAllDOIs,
} from '../citationExtractor';

describe('Citation Extractor', () => {
  describe('APA Format', () => {
    it('should parse complete APA citation', () => {
      const text =
        'Smith, J., & Doe, A. (2023). Climate impacts. Nature, 615(7952), 123-130. https://doi.org/10.1038/s41586-023-05775-9';
      const citation = parseCitation(text);

      assert.ok(citation, 'Should parse citation');
      assert.strictEqual(citation?.format, 'APA');
      assert.strictEqual(citation?.year, 2023);
      assert.strictEqual(citation?.title, 'Climate impacts');
      assert.strictEqual(citation?.venue, 'Nature');
      assert.strictEqual(citation?.volume, '615');
      assert.strictEqual(citation?.issue, '7952');
      assert.strictEqual(citation?.pages, '123-130');
      assert.strictEqual(citation?.doi, '10.1038/s41586-023-05775-9');
    });

    it('should parse APA without DOI', () => {
      const text = 'Johnson, M. (2022). Testing methods. Science, 375, 45-50.';
      const citation = parseCitation(text);

      assert.ok(citation);
      assert.strictEqual(citation?.format, 'APA');
      assert.strictEqual(citation?.year, 2022);
    });
  });

  describe('IEEE Format', () => {
    it('should parse IEEE citation', () => {
      const text =
        '[1] J. Smith and A. Doe, "Climate impacts," Nature, vol. 615, no. 7952, pp. 123-130, 2023, doi: 10.1038/s41586-023-05775-9';
      const citation = parseCitation(text);

      assert.ok(citation);
      assert.strictEqual(citation?.format, 'IEEE');
      assert.strictEqual(citation?.title, 'Climate impacts');
      assert.strictEqual(citation?.year, 2023);
      assert.strictEqual(citation?.doi, '10.1038/s41586-023-05775-9');
    });
  });

  describe('Nature Format', () => {
    it('should parse Nature inline citation', () => {
      const text = 'Smith, J. et al. Climate impacts. Nature 615, 123–130 (2023).';
      const citation = parseCitation(text);

      assert.ok(citation);
      assert.strictEqual(citation?.format, 'Nature');
      assert.strictEqual(citation?.year, 2023);
      assert.strictEqual(citation?.venue, 'Nature');
    });
  });

  describe('Inline Citations', () => {
    it('should extract inline citations from text', () => {
      const text =
        'According to Smith (2023) and Doe et al. (2022), climate change is accelerating.';
      const citations = extractInlineCitations(text);

      assert.strictEqual(citations.length, 2);
      assert.strictEqual(citations[0].year, 2023);
      assert.strictEqual(citations[1].year, 2022);
    });

    it('should handle et al. in inline citations', () => {
      const text = 'Research by Jones et al. (2021) shows this.';
      const citations = extractInlineCitations(text);

      assert.strictEqual(citations.length, 1);
      assert.strictEqual(citations[0].authors?.[0], 'Jones et al.');
    });
  });

  describe('DOI Extraction', () => {
    it('should extract DOI from URL', () => {
      const text = 'https://doi.org/10.1038/s41586-023-05775-9';
      const dois = extractAllDOIs(text);

      assert.strictEqual(dois.length, 1);
      assert.strictEqual(dois[0], '10.1038/s41586-023-05775-9');
    });

    it('should extract DOI from doi: prefix', () => {
      const text = 'doi:10.1234/example.5678';
      const dois = extractAllDOIs(text);

      assert.strictEqual(dois.length, 1);
      assert.strictEqual(dois[0], '10.1234/example.5678');
    });

    it('should extract multiple DOIs', () => {
      const text =
        'First: doi:10.1234/a Second: https://doi.org/10.5678/b';
      const dois = extractAllDOIs(text);

      assert.strictEqual(dois.length, 2);
    });
  });

  describe('Batch Extraction', () => {
    it('should extract multiple citations from text', () => {
      const text = `
Smith, J. (2023). First paper. Nature, 615, 1-10.
Doe, A. (2022). Second paper. Science, 375, 11-20.
      `.trim();

      const result = extractCitations(text);

      assert.strictEqual(result.citations.length, 2);
      assert.strictEqual(result.stats.total, 2);
    });

    it('should collect unparsed lines', () => {
      const text = `
Smith, J. (2023). Valid citation. Nature, 615, 1-10.
This is not a citation.
      `.trim();

      const result = extractCitations(text);

      assert.strictEqual(result.citations.length, 1);
      assert.strictEqual(result.unparsed.length, 1);
      assert.ok(result.unparsed[0].includes('not a citation'));
    });
  });

  describe('Citation Normalization', () => {
    it('should normalize DOI by removing prefix', () => {
      const citation = parseCitation(
        'Smith, J. (2023). Test. Nature, 1, 1. doi:10.1234/test'
      );
      assert.ok(citation);

      const normalized = normalizeCitation(citation!);

      assert.strictEqual(normalized.doi, '10.1234/test');
    });

    it('should trim whitespace in authors', () => {
      const citation = parseCitation(
        'Smith,  J.  (2023). Test. Nature, 1, 1.'
      );
      assert.ok(citation);

      const normalized = normalizeCitation(citation!);

      assert.ok(normalized.authors?.every((a) => a === a.trim()));
    });
  });

  describe('Citation Completeness', () => {
    it('should validate complete citation', () => {
      const citation = parseCitation(
        'Smith, J. (2023). Test. Nature, 615, 1-10. doi:10.1234/test'
      );

      assert.ok(citation);
      assert.ok(isCompleteCitation(citation!));
    });

    it('should reject citation without year', () => {
      const citation = {
        format: 'APA' as const,
        raw: 'Test',
        authors: ['Smith'],
        parsed_at: new Date().toISOString(),
        confidence: 0.8,
        // Missing year
      };

      assert.strictEqual(isCompleteCitation(citation as any), false);
    });

    it('should reject citation without source', () => {
      const citation = {
        format: 'APA' as const,
        raw: 'Test',
        authors: ['Smith'],
        year: 2023,
        parsed_at: new Date().toISOString(),
        confidence: 0.8,
        // Missing doi, url, AND venue
      };

      assert.strictEqual(isCompleteCitation(citation as any), false);
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid input', () => {
      assert.throws(() => {
        extractCitations(null as any);
      }, /non-empty string/);
    });

    it('should throw on oversized input', () => {
      const huge = 'x'.repeat(2_000_000);
      assert.throws(() => {
        extractCitations(huge);
      }, /maximum size/);
    });

    it('should return null for unparseable text', () => {
      const citation = parseCitation('This is random text with no citation structure');
      assert.strictEqual(citation, null);
    });
  });

  describe('Confidence Scoring', () => {
    it('should give high confidence to citations with DOI', () => {
      const text =
        'Smith, J. (2023). Test. Nature, 615, 1-10. doi:10.1234/test';
      const citation = parseCitation(text);

      assert.ok(citation);
      assert.ok(citation!.confidence > 0.8, 'DOI should boost confidence');
    });

    it('should give lower confidence to inline citations', () => {
      const text = 'Smith (2023)';
      const citations = extractInlineCitations(text);

      assert.strictEqual(citations.length, 1);
      assert.ok(citations[0].confidence < 0.8, 'Inline should have lower confidence');
    });
  });

  describe('Statistics', () => {
    it('should calculate extraction statistics', () => {
      const text = `
Smith, J. (2023). Paper 1. Nature, 1, 1. doi:10.1/a
[1] Doe, A., "Paper 2," Science, 2023, doi: 10.2/b
Jones et al. (2022)
      `.trim();

      const result = extractCitations(text);

      assert.strictEqual(result.stats.total, 3);
      assert.ok(result.stats.by_format.APA > 0);
      assert.ok(result.stats.by_format.IEEE > 0);
      assert.strictEqual(result.stats.with_doi, 2);
    });
  });
});
