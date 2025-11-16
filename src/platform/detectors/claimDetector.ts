/**
 * Pattern-Based Claim Detection
 *
 * Detects potential claims in text using pattern matching and heuristics.
 * Used for real-time claim detection during document authoring and verification.
 *
 * Task 1.5.1 - Pattern-Based Claim Detection (Platform Engineer - Marcus)
 *
 * Security: OWASP A03 (Injection) - Input validation on all text
 */

import type {
  ClaimDetectionResult,
  ClaimCandidate,
  ClaimType,
  ClaimSeverity,
} from '@/types/claims';
import { inferSeverity } from '@/types/claims';
import { detectCertainty, classifyByHeuristics } from './claimHeuristics';

// ============================================================================
// Detection Patterns
// ============================================================================

/**
 * Quantitative claim patterns with confidence scores
 */
const QUANTITATIVE_PATTERNS = [
  { pattern: /(\d+(?:\.\d+)?)\s*%\s+of\s+([^.,;]+)/gi, confidence: 0.9 },
  { pattern: /(\d+(?:\.\d+)?)\s*percent\s+([^.,;]+)/gi, confidence: 0.9 },
  {
    pattern: /(\d+(?:\.\d+)?)\s+(billion|million|thousand|ppm|°C|degrees?|tons?|years?|months?)\s+([^.,;]+)/gi,
    confidence: 0.85,
  },
  { pattern: /increases?\s+by\s+(\d+(?:\.\d+)?)\s*([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /decreases?\s+by\s+(\d+(?:\.\d+)?)\s*([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /approximately\s+(\d+(?:\.\d+)?)\s*([^.,;]+)/gi, confidence: 0.75 },
  { pattern: /estimated\s+at\s+(\d+(?:\.\d+)?)\s*([^.,;]+)/gi, confidence: 0.75 },
];

/**
 * Causal claim patterns
 */
const CAUSAL_PATTERNS = [
  { pattern: /\b(causes?|causing|caused)\s+([^.,;]+)/gi, confidence: 0.85 },
  { pattern: /\b(leads?\s+to|leading\s+to|led\s+to)\s+([^.,;]+)/gi, confidence: 0.85 },
  { pattern: /\b(results?\s+in|resulting\s+in|resulted\s+in)\s+([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /\b(triggers?|triggering|triggered)\s+([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /\bdue\s+to\s+([^.,;]+)/gi, confidence: 0.75 },
  { pattern: /\bbecause\s+of\s+([^.,;]+)/gi, confidence: 0.7 },
];

/**
 * Correlation patterns
 */
const CORRELATION_PATTERNS = [
  { pattern: /\b(correlates?\s+with|correlated\s+with)\s+([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /\b(associated\s+with|association\s+between)\s+([^.,;]+)/gi, confidence: 0.75 },
  { pattern: /\b(related\s+to|relationship\s+between)\s+([^.,;]+)/gi, confidence: 0.7 },
  { pattern: /\blinked\s+to\s+([^.,;]+)/gi, confidence: 0.7 },
];

/**
 * Projection/prediction patterns
 */
const PROJECTION_PATTERNS = [
  { pattern: /\b(will|shall)\s+([^.,;]+)\s+by\s+(\d{4})/gi, confidence: 0.85 },
  { pattern: /\bexpected\s+to\s+([^.,;]+)\s+by\s+(\d{4})/gi, confidence: 0.8 },
  { pattern: /\bprojected\s+to\s+([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /\bforecast\s+to\s+([^.,;]+)/gi, confidence: 0.8 },
  { pattern: /\bpredicts?\s+([^.,;]+)/gi, confidence: 0.75 },
];

/**
 * Statistical claim patterns
 */
const STATISTICAL_PATTERNS = [
  { pattern: /\bp\s*[<>=]\s*0?\.\d+/gi, confidence: 0.9 }, // p-value
  { pattern: /\b(significant|significance)\b.*\bp\s*[<>=]/gi, confidence: 0.85 },
  { pattern: /\b(mean|median|average)\s+(?:of\s+)?(\d+(?:\.\d+)?)/gi, confidence: 0.8 },
  { pattern: /\bstandard\s+deviation\s+(?:of\s+)?(\d+(?:\.\d+)?)/gi, confidence: 0.8 },
  { pattern: /\b(r\s*=\s*0?\.\d+|correlation\s+coefficient)/gi, confidence: 0.85 },
];

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Detect claim candidates in text
 *
 * @param text - Text to analyze
 * @param options - Detection options
 * @returns Detection result with candidates
 */
export function detectClaims(
  text: string,
  options: {
    threshold?: number; // Minimum confidence threshold (default: 0.5)
    includeContext?: boolean; // Include surrounding context (default: true)
    maxCandidates?: number; // Maximum candidates to return (default: unlimited)
  } = {}
): ClaimDetectionResult {
  // Input validation (OWASP A03)
  if (!text || typeof text !== 'string') {
    throw new Error('❌ Claim detection requires non-empty string input');
  }

  if (text.length > 10_000_000) {
    throw new Error('❌ Text exceeds maximum size for claim detection (10MB)');
  }

  const { threshold = 0.5, includeContext = true, maxCandidates } = options;

  const candidates: ClaimCandidate[] = [];
  const seen = new Set<string>(); // Deduplication

  // Split text into sentences
  const sentences = splitIntoSentences(text);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    // Skip very short sentences
    if (sentence.text.length < 15) continue;

    // Detect claim type and confidence
    const detection = detectClaimInSentence(sentence.text);

    if (detection && detection.confidence >= threshold) {
      // Deduplication
      const key = sentence.text.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);

      // Create candidate
      const candidate: ClaimCandidate = {
        text: sentence.text,
        confidence: detection.confidence,
        likely_type: detection.type,
        method: 'pattern',
        patterns: detection.patterns,
        source: {
          line: sentence.line,
          offset: sentence.offset,
        },
        extracted_values: detection.extractedValues,
        needs_review: detection.confidence < 0.8,
        suggested_severity: detection.suggestedSeverity,
      };

      candidates.push(candidate);

      // Check max candidates limit
      if (maxCandidates && candidates.length >= maxCandidates) {
        break;
      }
    }
  }

  // Sort by confidence (highest first)
  candidates.sort((a, b) => b.confidence - a.confidence);

  // Calculate statistics
  const stats = {
    total_candidates: candidates.length,
    high_confidence: candidates.filter((c) => c.confidence >= 0.8).length,
    medium_confidence: candidates.filter((c) => c.confidence >= 0.5 && c.confidence < 0.8).length,
    low_confidence: candidates.filter((c) => c.confidence < 0.5).length,
  };

  return {
    candidates,
    threshold,
    stats,
    detected_at: new Date().toISOString(),
  };
}

/**
 * Detect claim in a single sentence
 */
function detectClaimInSentence(sentence: string): {
  type: ClaimType;
  confidence: number;
  patterns: string[];
  extractedValues?: Array<{ value: number; unit?: string }>;
  suggestedSeverity?: ClaimSeverity;
} | null {
  const matchedPatterns: string[] = [];
  let maxConfidence = 0;
  let detectedType: ClaimType | null = null;
  const extractedValues: Array<{ value: number; unit?: string }> = [];

  // Check quantitative patterns
  for (const { pattern, confidence } of QUANTITATIVE_PATTERNS) {
    const match = sentence.match(pattern);
    if (match) {
      matchedPatterns.push(pattern.source);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = 'quantitative';
      }

      // Extract values
      const valueMatches = sentence.matchAll(/(\d+(?:\.\d+)?)\s*([a-zA-Z%°]+)?/g);
      for (const vm of valueMatches) {
        const value = parseFloat(vm[1]);
        if (!isNaN(value)) {
          extractedValues.push({ value, unit: vm[2]?.trim() });
        }
      }
    }
  }

  // Check causal patterns
  for (const { pattern, confidence } of CAUSAL_PATTERNS) {
    if (pattern.test(sentence)) {
      matchedPatterns.push(pattern.source);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = 'causal';
      }
    }
  }

  // Check correlation patterns
  for (const { pattern, confidence } of CORRELATION_PATTERNS) {
    if (pattern.test(sentence)) {
      matchedPatterns.push(pattern.source);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = 'correlation';
      }
    }
  }

  // Check projection patterns
  for (const { pattern, confidence } of PROJECTION_PATTERNS) {
    if (pattern.test(sentence)) {
      matchedPatterns.push(pattern.source);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = 'projection';
      }
    }
  }

  // Check statistical patterns
  for (const { pattern, confidence } of STATISTICAL_PATTERNS) {
    if (pattern.test(sentence)) {
      matchedPatterns.push(pattern.source);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = 'quantitative'; // Statistical claims are quantitative
      }
    }
  }

  if (!detectedType) return null;

  // Use heuristics to refine classification
  const heuristicType = classifyByHeuristics(sentence);
  if (heuristicType && matchedPatterns.length === 0) {
    detectedType = heuristicType;
    maxConfidence = 0.6; // Lower confidence for heuristic-only detection
  }

  // Determine severity based on type and certainty
  const certainty = detectCertainty(sentence);
  const suggestedSeverity = inferSeverity(detectedType, certainty);

  return {
    type: detectedType,
    confidence: maxConfidence,
    patterns: matchedPatterns,
    extractedValues: extractedValues.length > 0 ? extractedValues : undefined,
    suggestedSeverity,
  };
}

// ============================================================================
// Sentence Splitting
// ============================================================================

interface Sentence {
  text: string;
  line: number;
  offset: number;
}

/**
 * Split text into sentences with line tracking
 */
function splitIntoSentences(text: string): Sentence[] {
  const sentences: Sentence[] = [];

  // Split by newlines first to track line numbers
  const lines = text.split('\n');

  let offset = 0;
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Split line into sentences (simple approach)
    const sentenceTexts = line.split(/\.\s+/).filter((s) => s.trim().length > 0);

    for (const sentenceText of sentenceTexts) {
      sentences.push({
        text: sentenceText.trim(),
        line: lineNum + 1,
        offset,
      });

      offset += sentenceText.length + 2; // +2 for ". "
    }

    offset += 1; // +1 for newline
  }

  return sentences;
}

// ============================================================================
// Streaming Detection
// ============================================================================

/**
 * Incremental claim detector for streaming text
 *
 * Useful for real-time claim detection during document authoring.
 */
export class StreamingClaimDetector {
  private buffer: string = '';
  private candidates: ClaimCandidate[] = [];
  private threshold: number;
  private offset: number = 0;

  constructor(threshold = 0.5) {
    this.threshold = threshold;
  }

  /**
   * Add text chunk to buffer
   */
  addChunk(chunk: string): ClaimCandidate[] {
    this.buffer += chunk;

    // Process complete sentences
    const newCandidates: ClaimCandidate[] = [];
    const sentences = this.buffer.split(/\.\s+/);

    // Keep last incomplete sentence in buffer
    this.buffer = sentences.pop() || '';

    // Process complete sentences
    for (const sentence of sentences) {
      if (sentence.trim().length < 15) continue;

      const detection = detectClaimInSentence(sentence);
      if (detection && detection.confidence >= this.threshold) {
        const candidate: ClaimCandidate = {
          text: sentence,
          confidence: detection.confidence,
          likely_type: detection.type,
          method: 'pattern',
          patterns: detection.patterns,
          source: {
            offset: this.offset,
          },
          extracted_values: detection.extractedValues,
          needs_review: detection.confidence < 0.8,
          suggested_severity: detection.suggestedSeverity,
        };

        this.candidates.push(candidate);
        newCandidates.push(candidate);
      }

      this.offset += sentence.length + 2; // +2 for ". "
    }

    return newCandidates;
  }

  /**
   * Get all detected candidates
   */
  getCandidates(): ClaimCandidate[] {
    return this.candidates;
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.buffer = '';
    this.candidates = [];
    this.offset = 0;
  }
}

// ============================================================================
// Filtering & Ranking
// ============================================================================

/**
 * Filter candidates by confidence threshold
 */
export function filterByConfidence(
  candidates: ClaimCandidate[],
  minConfidence: number
): ClaimCandidate[] {
  return candidates.filter((c) => c.confidence >= minConfidence);
}

/**
 * Filter candidates by claim type
 */
export function filterByType(
  candidates: ClaimCandidate[],
  type: ClaimType
): ClaimCandidate[] {
  return candidates.filter((c) => c.likely_type === type);
}

/**
 * Get candidates needing human review
 */
export function getNeedingReview(candidates: ClaimCandidate[]): ClaimCandidate[] {
  return candidates.filter((c) => c.needs_review);
}

/**
 * Rank candidates by priority (severity + confidence)
 */
export function rankByPriority(candidates: ClaimCandidate[]): ClaimCandidate[] {
  const severityScores: Record<ClaimSeverity, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...candidates].sort((a, b) => {
    const scoreA =
      (a.suggested_severity ? severityScores[a.suggested_severity] : 0) * a.confidence;
    const scoreB =
      (b.suggested_severity ? severityScores[b.suggested_severity] : 0) * b.confidence;
    return scoreB - scoreA;
  });
}
