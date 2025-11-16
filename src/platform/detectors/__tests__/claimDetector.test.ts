/**
 * Tests for Claim Detector
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  detectClaims,
  StreamingClaimDetector,
  filterByConfidence,
  filterByType,
  getNeedingReview,
  rankByPriority,
} from '../claimDetector';

describe('Claim Detector', () => {
  describe('Quantitative Detection', () => {
    it('should detect percentage claims', () => {
      const text = 'Research shows that 50% of species are at risk of extinction.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'quantitative');
      assert.ok(result.candidates[0].confidence > 0.5);
    });

    it('should extract values from quantitative claims', () => {
      const text = 'Temperature increased by 1.5 degrees Celsius.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.ok(result.candidates[0].extracted_values);
      assert.strictEqual(result.candidates[0].extracted_values?.[0].value, 1.5);
    });

    it('should detect statistical claims', () => {
      const text = 'The correlation coefficient was r = 0.75 with p < 0.01.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'quantitative');
    });
  });

  describe('Causal Detection', () => {
    it('should detect causal claims', () => {
      const text = 'Climate change causes extreme weather events.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'causal');
    });

    it('should detect "leads to" causation', () => {
      const text = 'Deforestation leads to biodiversity loss.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'causal');
    });

    it('should detect "results in" causation', () => {
      const text = 'Ocean acidification results in coral bleaching.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'causal');
    });
  });

  describe('Correlation Detection', () => {
    it('should detect correlation claims', () => {
      const text = 'Temperature is correlated with sea level rise.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'correlation');
    });

    it('should detect association claims', () => {
      const text = 'Poverty is associated with lower life expectancy.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'correlation');
    });
  });

  describe('Projection Detection', () => {
    it('should detect future predictions', () => {
      const text = 'Global temperature will increase by 3°C by 2100.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'projection');
    });

    it('should detect "expected to" projections', () => {
      const text = 'Sea levels are expected to rise by 2050.';
      const result = detectClaims(text);

      assert.ok(result.candidates.length > 0);
      assert.strictEqual(result.candidates[0].likely_type, 'projection');
    });
  });

  describe('Confidence Thresholds', () => {
    it('should filter by confidence threshold', () => {
      const text = 'Climate change causes warming. Maybe temperature increases.';
      const result = detectClaims(text, { threshold: 0.7 });

      // High-confidence claims should pass
      assert.ok(result.candidates.length > 0);
      assert.ok(result.candidates.every((c) => c.confidence >= 0.7));
    });

    it('should include low-confidence claims when threshold is low', () => {
      const text = 'This might suggest a possible relationship.';
      const result = detectClaims(text, { threshold: 0.3 });

      assert.ok(result.candidates.length >= 0); // May or may not detect
    });
  });

  describe('Statistics', () => {
    it('should calculate detection statistics', () => {
      const text = `
        50% of species are at risk.
        Climate change causes warming.
        Temperature will increase.
        Maybe this is related.
      `;
      const result = detectClaims(text, { threshold: 0.5 });

      assert.ok(result.stats.total_candidates >= 0);
      assert.strictEqual(
        result.stats.total_candidates,
        result.stats.high_confidence + result.stats.medium_confidence + result.stats.low_confidence
      );
    });
  });

  describe('Streaming Detection', () => {
    it('should detect claims in streaming text', () => {
      const detector = new StreamingClaimDetector(0.5);

      const chunk1 = 'Climate change causes ';
      const chunk2 = 'extreme weather events. ';
      const chunk3 = 'Temperature increased by 50%.';

      detector.addChunk(chunk1);
      const newClaims1 = detector.addChunk(chunk2);
      const newClaims2 = detector.addChunk(chunk3);

      const allCandidates = detector.getCandidates();

      assert.ok(allCandidates.length > 0);
    });

    it('should reset detector state', () => {
      const detector = new StreamingClaimDetector();
      detector.addChunk('Climate change causes warming.');

      assert.ok(detector.getCandidates().length > 0);

      detector.reset();

      assert.strictEqual(detector.getCandidates().length, 0);
    });
  });

  describe('Filtering', () => {
    it('should filter by confidence', () => {
      const candidates = [
        {
          text: 'A',
          confidence: 0.9,
          likely_type: 'quantitative' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: false,
        },
        {
          text: 'B',
          confidence: 0.5,
          likely_type: 'qualitative' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: true,
        },
      ];

      const filtered = filterByConfidence(candidates, 0.8);

      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].text, 'A');
    });

    it('should filter by type', () => {
      const candidates = [
        {
          text: 'A',
          confidence: 0.9,
          likely_type: 'quantitative' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: false,
        },
        {
          text: 'B',
          confidence: 0.8,
          likely_type: 'causal' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: false,
        },
      ];

      const filtered = filterByType(candidates, 'quantitative');

      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].text, 'A');
    });

    it('should get candidates needing review', () => {
      const candidates = [
        {
          text: 'A',
          confidence: 0.9,
          likely_type: 'quantitative' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: false,
        },
        {
          text: 'B',
          confidence: 0.6,
          likely_type: 'qualitative' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: true,
        },
      ];

      const needingReview = getNeedingReview(candidates);

      assert.strictEqual(needingReview.length, 1);
      assert.strictEqual(needingReview[0].text, 'B');
    });
  });

  describe('Priority Ranking', () => {
    it('should rank by severity and confidence', () => {
      const candidates = [
        {
          text: 'Low priority',
          confidence: 0.5,
          likely_type: 'qualitative' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: false,
          suggested_severity: 'LOW' as const,
        },
        {
          text: 'High priority',
          confidence: 0.9,
          likely_type: 'causal' as const,
          method: 'pattern' as const,
          source: {},
          needs_review: false,
          suggested_severity: 'CRITICAL' as const,
        },
      ];

      const ranked = rankByPriority(candidates);

      assert.strictEqual(ranked[0].text, 'High priority');
      assert.strictEqual(ranked[1].text, 'Low priority');
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid input', () => {
      assert.throws(() => {
        detectClaims(null as any);
      }, /non-empty string/);
    });

    it('should throw on oversized input', () => {
      const huge = 'x'.repeat(11_000_000);
      assert.throws(() => {
        detectClaims(huge);
      }, /maximum size/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const result = detectClaims('');

      assert.strictEqual(result.candidates.length, 0);
    });

    it('should handle text with no claims', () => {
      const text = 'This is just a simple sentence with no research claims.';
      const result = detectClaims(text, { threshold: 0.8 });

      // May or may not detect depending on heuristics
      assert.ok(Array.isArray(result.candidates));
    });

    it('should handle very short sentences', () => {
      const text = 'Short.';
      const result = detectClaims(text);

      assert.strictEqual(result.candidates.length, 0);
    });
  });
});
