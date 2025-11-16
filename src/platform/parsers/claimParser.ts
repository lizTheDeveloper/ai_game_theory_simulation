/**
 * Claim Extraction Parser
 *
 * Parses research markdown files to extract claims with citations.
 * Integrates with citation extractor to build structured claim database.
 *
 * Task 1.3.1 - Claim Extraction Parser (Platform Engineer - Marcus)
 *
 * Security: OWASP A03 (Injection) - Input validation on all file paths and content
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import type {
  Claim,
  ClaimExtractionResult,
  ClaimParsingError,
  ClaimType,
  CertaintyLevel,
  ClaimSeverity,
} from '@/types/claims';
import { generateClaimId, inferSeverity } from '@/types/claims';
import { extractCitations, extractInlineCitations } from './citationExtractor';

// ============================================================================
// Claim Detection Patterns
// ============================================================================

/**
 * Quantitative claim patterns
 * Matches: "X% of Y", "X percent", "N units", etc.
 */
const QUANTITATIVE_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*%\s+of\s+([^.,]+)/gi, // "50% of X"
  /(\d+(?:\.\d+)?)\s*percent\s+([^.,]+)/gi, // "50 percent X"
  /(\d+(?:\.\d+)?)\s+(billion|million|thousand|ppm|°C|degrees?|tons?|years?|months?)\s+([^.,]+)/gi,
  /increases?\s+by\s+(\d+(?:\.\d+)?)\s*([^.,]+)/gi, // "increases by 5%"
  /decreases?\s+by\s+(\d+(?:\.\d+)?)\s*([^.,]+)/gi, // "decreases by 3 degrees"
];

/**
 * Causal claim patterns
 * Matches: "X causes Y", "X leads to Y", etc.
 */
const CAUSAL_PATTERNS = [
  /\b(causes?|causing|caused)\s+([^.,]+)/gi,
  /\b(leads?\s+to|leading\s+to|led\s+to)\s+([^.,]+)/gi,
  /\b(results?\s+in|resulting\s+in|resulted\s+in)\s+([^.,]+)/gi,
  /\b(triggers?|triggering|triggered)\s+([^.,]+)/gi,
  /\bdue\s+to\s+([^.,]+)/gi,
];

/**
 * Correlation patterns
 */
const CORRELATION_PATTERNS = [
  /\b(correlates?\s+with|correlated\s+with|correlation\s+between)\s+([^.,]+)/gi,
  /\b(associated\s+with|association\s+between)\s+([^.,]+)/gi,
  /\b(related\s+to|relationship\s+between)\s+([^.,]+)/gi,
];

/**
 * Projection/prediction patterns
 */
const PROJECTION_PATTERNS = [
  /\b(will|shall|expected\s+to|projected\s+to|forecast\s+to)\s+([^.,]+)/gi,
  /\bby\s+(\d{4}),?\s+([^.,]+)/gi, // "by 2050, X will happen"
  /\b(predicts?|predicted|prediction)\s+([^.,]+)/gi,
];

/**
 * Certainty language patterns
 */
const CERTAINTY_PATTERNS = {
  definitive: /\b(is|are|will|causes?|proves?|demonstrates?)\b/gi,
  high: /\b(likely|probable|strong\s+evidence|highly|significant)\b/gi,
  moderate: /\b(suggests?|indicates?|appears?|seems?|tends?\s+to)\b/gi,
  low: /\b(may|might|could|possible|potentially)\b/gi,
  speculative: /\b(possibly|perhaps|conceivably|hypothetically)\b/gi,
};

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extract claims from a research markdown file
 *
 * @param filePath - Path to markdown file
 * @returns Claim extraction result
 */
export function extractClaimsFromFile(filePath: string): ClaimExtractionResult {
  // Input validation (OWASP A03)
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('❌ File path required for claim extraction');
  }

  // Prevent directory traversal attacks
  const normalizedPath = path.normalize(filePath);
  if (normalizedPath.includes('..')) {
    throw new Error('❌ Directory traversal detected in file path');
  }

  if (!existsSync(normalizedPath)) {
    throw new Error(`❌ File not found: ${normalizedPath}`);
  }

  // Read file
  const content = readFileSync(normalizedPath, 'utf-8');

  // Extract claims from content
  return extractClaimsFromMarkdown(content, normalizedPath);
}

/**
 * Extract claims from markdown content
 *
 * @param content - Markdown content
 * @param sourceFile - Source file path
 * @returns Claim extraction result
 */
export function extractClaimsFromMarkdown(
  content: string,
  sourceFile: string
): ClaimExtractionResult {
  const claims: Claim[] = [];
  const errors: ClaimParsingError[] = [];
  const warnings: string[] = [];

  // Parse markdown into sections
  const sections = parseMarkdownSections(content);

  // Process each section
  for (const section of sections) {
    try {
      const sectionClaims = extractClaimsFromSection(section, sourceFile);
      claims.push(...sectionClaims);
    } catch (error: any) {
      errors.push({
        message: `Failed to parse section "${section.heading}": ${error.message}`,
        line: section.startLine,
        severity: 'error',
      });
    }
  }

  // Validate claims
  for (const claim of claims) {
    if (claim.citations.length === 0) {
      warnings.push(`Claim "${claim.text.substring(0, 50)}..." has no citations`);
    }
  }

  // Calculate statistics
  const stats = {
    total_claims: claims.length,
    by_type: countByType(claims),
    by_severity: countBySeverity(claims),
    with_citations: claims.filter((c) => c.citations.length > 0).length,
    without_citations: claims.filter((c) => c.citations.length === 0).length,
  };

  return {
    file: sourceFile,
    claims,
    errors,
    warnings,
    stats,
    extracted_at: new Date().toISOString(),
  };
}

// ============================================================================
// Section Parsing
// ============================================================================

interface MarkdownSection {
  heading: string;
  level: number; // # = 1, ## = 2, etc.
  content: string;
  startLine: number;
}

/**
 * Parse markdown into sections
 */
function parseMarkdownSections(content: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const lines = content.split('\n');

  let currentSection: MarkdownSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      const [, hashes, heading] = headingMatch;
      currentSection = {
        heading: heading.trim(),
        level: hashes.length,
        content: '',
        startLine: i + 1,
      };
    } else if (currentSection) {
      // Add to current section
      currentSection.content += line + '\n';
    }
  }

  // Save final section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

// ============================================================================
// Claim Extraction from Section
// ============================================================================

/**
 * Extract claims from a markdown section
 */
function extractClaimsFromSection(
  section: MarkdownSection,
  sourceFile: string
): Claim[] {
  const claims: Claim[] = [];
  const paragraphs = section.content.split(/\n\n+/).filter((p) => p.trim().length > 0);

  for (const paragraph of paragraphs) {
    const paragraphClaims = extractClaimsFromParagraph(
      paragraph,
      sourceFile,
      section.startLine,
      section.heading
    );
    claims.push(...paragraphClaims);
  }

  return claims;
}

/**
 * Extract claims from a paragraph
 */
function extractClaimsFromParagraph(
  paragraph: string,
  sourceFile: string,
  lineNumber: number,
  sectionHeading?: string
): Claim[] {
  const claims: Claim[] = [];

  // Split into sentences
  const sentences = paragraph.split(/\.\s+/).filter((s) => s.trim().length > 10);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();

    // Classify sentence as claim
    const claimType = classifyClaimType(sentence);
    if (!claimType) continue; // Not a claim

    const certainty = detectCertainty(sentence);
    const severity = inferSeverity(claimType, certainty);

    // Extract citations from sentence
    const citations = extractInlineCitations(sentence);

    // Extract values (for quantitative claims)
    const extractedValues =
      claimType === 'quantitative' ? extractValues(sentence) : undefined;

    // Create claim
    const claim: Claim = {
      id: generateClaimId(sourceFile, lineNumber + i),
      text: sentence,
      type: claimType,
      severity,
      certainty,
      citations,
      source: {
        file: sourceFile,
        line: lineNumber + i,
        section: sectionHeading,
      },
      extracted_values: extractedValues,
      extracted_at: new Date().toISOString(),
      tags: [claimType, severity.toLowerCase()],
    };

    claims.push(claim);
  }

  return claims;
}

// ============================================================================
// Classification & Detection
// ============================================================================

/**
 * Classify claim type from text
 */
function classifyClaimType(text: string): ClaimType | null {
  // Check quantitative patterns first
  for (const pattern of QUANTITATIVE_PATTERNS) {
    if (pattern.test(text)) {
      return 'quantitative';
    }
  }

  // Check causal patterns
  for (const pattern of CAUSAL_PATTERNS) {
    if (pattern.test(text)) {
      return 'causal';
    }
  }

  // Check correlation patterns
  for (const pattern of CORRELATION_PATTERNS) {
    if (pattern.test(text)) {
      return 'correlation';
    }
  }

  // Check projection patterns
  for (const pattern of PROJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return 'projection';
    }
  }

  // Default: if sentence has certain keywords, treat as qualitative
  if (/\b(shows?|demonstrates?|indicates?|suggests?|proves?)\b/gi.test(text)) {
    return 'qualitative';
  }

  return null; // Not a claim
}

/**
 * Detect certainty level from language
 */
function detectCertainty(text: string): CertaintyLevel {
  for (const [level, pattern] of Object.entries(CERTAINTY_PATTERNS)) {
    if (pattern.test(text)) {
      return level as CertaintyLevel;
    }
  }

  return 'moderate'; // Default
}

/**
 * Extract numeric values from text
 */
function extractValues(
  text: string
): Array<{ value: number; unit?: string; context: string }> {
  const values: Array<{ value: number; unit?: string; context: string }> = [];

  // Pattern: number + optional unit
  const valuePattern = /(\d+(?:\.\d+)?)\s*([a-zA-Z%°]+)?/g;
  const matches = text.matchAll(valuePattern);

  for (const match of matches) {
    const [fullMatch, valueStr, unit] = match;
    const value = parseFloat(valueStr);

    if (!isNaN(value)) {
      // Get context (surrounding words)
      const index = text.indexOf(fullMatch);
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + fullMatch.length + 20);
      const context = text.substring(start, end).trim();

      values.push({
        value,
        unit: unit?.trim(),
        context,
      });
    }
  }

  return values;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Count claims by type
 */
function countByType(claims: Claim[]): Record<ClaimType, number> {
  const counts: Record<ClaimType, number> = {
    quantitative: 0,
    qualitative: 0,
    causal: 0,
    correlation: 0,
    projection: 0,
    definition: 0,
    methodology: 0,
  };

  for (const claim of claims) {
    counts[claim.type]++;
  }

  return counts;
}

/**
 * Count claims by severity
 */
function countBySeverity(claims: Claim[]): Record<ClaimSeverity, number> {
  const counts: Record<ClaimSeverity, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const claim of claims) {
    counts[claim.severity]++;
  }

  return counts;
}

/**
 * Find claims by parameter name
 *
 * Searches claim text for parameter references.
 *
 * @param claims - Claims to search
 * @param parameterName - Parameter name to find
 * @returns Claims that reference the parameter
 */
export function findClaimsByParameter(claims: Claim[], parameterName: string): Claim[] {
  const pattern = new RegExp(`\\b${parameterName}\\b`, 'gi');
  return claims.filter((claim) => pattern.test(claim.text));
}

/**
 * Get high-severity claims without citations
 *
 * Identifies claims that need urgent citation.
 *
 * @param claims - Claims to check
 * @returns High/critical severity claims without citations
 */
export function getUncitedHighSeverityClaims(claims: Claim[]): Claim[] {
  return claims.filter(
    (claim) =>
      (claim.severity === 'CRITICAL' || claim.severity === 'HIGH') &&
      claim.citations.length === 0
  );
}
