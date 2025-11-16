/**
 * Citation Extraction Utilities
 *
 * Parses citations from various formats (APA, IEEE, Nature, MLA, inline)
 * and normalizes them into structured Citation objects.
 *
 * Task 1.3.3 - Citation Extraction Utilities (Platform Engineer - Marcus)
 *
 * Security: OWASP A03 (Injection) - Input validation on all citation text
 */

import type {
  Citation,
  CitationFormat,
  CitationExtractionResult,
} from '@/types/claims';

// ============================================================================
// Citation Patterns (Regex)
// ============================================================================

/**
 * APA format: Author(s). (Year). Title. Journal, Volume(Issue), Pages. DOI
 * Example: Smith, J., & Doe, A. (2023). Climate impacts. Nature, 615(7952), 123-130. https://doi.org/10.1038/s41586-023-05775-9
 */
const APA_PATTERN =
  /^(.+?)\.\s*\((\d{4})\)\.\s*(.+?)\.\s*(?:(.+?),\s*)?(\d+)?(?:\((\d+)\))?,?\s*(?:pp?\.\s*)?(\d+(?:-\d+)?)?\.\s*(?:(?:https?:\/\/)?(?:doi\.org\/)?(.+)|(.+))$/i;

/**
 * IEEE format: [N] Author(s), "Title," Journal, vol. X, no. Y, pp. Z-W, Year, doi: DOI
 * Example: [1] J. Smith and A. Doe, "Climate impacts," Nature, vol. 615, no. 7952, pp. 123-130, 2023, doi: 10.1038/s41586-023-05775-9
 */
const IEEE_PATTERN =
  /^\[(\d+)\]\s*(.+?),\s*"(.+?),"?\s*(.+?),\s*(?:vol\.\s*(\d+))?(?:,\s*no\.\s*(\d+))?(?:,\s*pp?\.\s*(\d+(?:-\d+)?))?(?:,\s*(\d{4}))?(?:,\s*doi:\s*(.+))?$/i;

/**
 * Nature inline: Author et al. Title. Journal volume, pages (year).
 * Example: Smith, J. et al. Climate impacts. Nature 615, 123–130 (2023).
 */
const NATURE_PATTERN =
  /^(.+?)\.\s*(.+?)\.\s*(.+?)\s+(\d+),\s*(\d+(?:[–-]\d+)?)\s*\((\d{4})\)\.?$/i;

/**
 * DOI pattern
 */
const DOI_PATTERN = /\b(?:doi:\s*|https?:\/\/doi\.org\/)?(10\.\d{4,}\/[^\s]+)/gi;

/**
 * URL pattern
 */
const URL_PATTERN = /https?:\/\/[^\s]+/gi;

/**
 * Inline citation pattern: (Author Year) or (Author et al. Year)
 * Example: (Smith 2023) or (Smith et al. 2023)
 */
const INLINE_PATTERN = /\(([A-Z][a-z]+(?:\s+et\s+al\.)?)\s+(\d{4})\)/g;

/**
 * Year pattern (4 digits)
 */
const YEAR_PATTERN = /\b(19|20)\d{2}\b/g;

// ============================================================================
// Main Extraction Functions
// ============================================================================

/**
 * Extract citations from text
 *
 * Tries multiple formats in order of specificity.
 *
 * @param text - Text containing citations
 * @returns Citation extraction result
 */
export function extractCitations(text: string): CitationExtractionResult {
  // Input validation (OWASP A03)
  if (!text || typeof text !== 'string') {
    throw new Error('❌ Citation extraction requires non-empty string input');
  }

  if (text.length > 1_000_000) {
    throw new Error('❌ Citation text exceeds maximum size (1MB)');
  }

  const citations: Citation[] = [];
  const unparsed: string[] = [];
  const errors: string[] = [];

  // Split text into lines (each line might be a citation)
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    try {
      const citation = parseCitation(line);
      if (citation) {
        citations.push(citation);
      } else {
        unparsed.push(line);
      }
    } catch (error: any) {
      errors.push(`Failed to parse: "${line.substring(0, 100)}..." - ${error.message}`);
      unparsed.push(line);
    }
  }

  // Calculate statistics
  const stats = {
    total: citations.length,
    by_format: countByFormat(citations),
    with_doi: citations.filter((c) => c.doi).length,
    with_url: citations.filter((c) => c.url).length,
    avg_confidence:
      citations.length > 0
        ? citations.reduce((sum, c) => sum + c.confidence, 0) / citations.length
        : 0,
  };

  return {
    citations,
    unparsed,
    errors,
    stats,
  };
}

/**
 * Parse a single citation from text
 *
 * Tries formats in order: IEEE → APA → Nature → Inline
 *
 * @param text - Citation text
 * @returns Parsed citation or null
 */
export function parseCitation(text: string): Citation | null {
  // Try IEEE format first (most structured)
  const ieee = parseIEEE(text);
  if (ieee) return ieee;

  // Try APA format
  const apa = parseAPA(text);
  if (apa) return apa;

  // Try Nature format
  const nature = parseNature(text);
  if (nature) return nature;

  // Try inline format
  const inline = parseInline(text);
  if (inline) return inline;

  // If all else fails, extract DOI/URL if present
  const fallback = parseFallback(text);
  if (fallback) return fallback;

  return null;
}

/**
 * Extract inline citations from text
 *
 * Finds all (Author Year) patterns.
 *
 * @param text - Text with inline citations
 * @returns Array of inline citations
 */
export function extractInlineCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const matches = text.matchAll(INLINE_PATTERN);

  for (const match of matches) {
    const [fullMatch, author, year] = match;
    citations.push({
      format: 'Inline',
      raw: fullMatch,
      authors: [author.replace(/\s+et\s+al\.?/, ' et al.')],
      year: parseInt(year, 10),
      parsed_at: new Date().toISOString(),
      confidence: 0.7, // Lower confidence for inline
    });
  }

  return citations;
}

// ============================================================================
// Format-Specific Parsers
// ============================================================================

/**
 * Parse APA format citation
 */
function parseAPA(text: string): Citation | null {
  const match = text.match(APA_PATTERN);
  if (!match) return null;

  const [, authorsRaw, year, title, venue, volume, issue, pages, doi, url] = match;

  return {
    format: 'APA',
    raw: text,
    authors: parseAuthors(authorsRaw),
    year: parseInt(year, 10),
    title: title.trim(),
    venue: venue?.trim(),
    volume: volume?.trim(),
    issue: issue?.trim(),
    pages: pages?.trim(),
    doi: doi?.trim(),
    url: url?.trim(),
    parsed_at: new Date().toISOString(),
    confidence: calculateConfidence('APA', { doi, url, venue, volume }),
  };
}

/**
 * Parse IEEE format citation
 */
function parseIEEE(text: string): Citation | null {
  const match = text.match(IEEE_PATTERN);
  if (!match) return null;

  const [, refNum, authorsRaw, title, venue, volume, issue, pages, year, doi] = match;

  return {
    format: 'IEEE',
    raw: text,
    authors: parseAuthors(authorsRaw),
    year: year ? parseInt(year, 10) : undefined,
    title: title.trim(),
    venue: venue?.trim(),
    volume: volume?.trim(),
    issue: issue?.trim(),
    pages: pages?.trim(),
    doi: doi?.trim(),
    parsed_at: new Date().toISOString(),
    confidence: calculateConfidence('IEEE', { doi, venue, volume }),
  };
}

/**
 * Parse Nature format citation
 */
function parseNature(text: string): Citation | null {
  const match = text.match(NATURE_PATTERN);
  if (!match) return null;

  const [, authorsRaw, title, venue, volume, pages, year] = match;

  return {
    format: 'Nature',
    raw: text,
    authors: parseAuthors(authorsRaw),
    year: parseInt(year, 10),
    title: title.trim(),
    venue: venue?.trim(),
    volume: volume?.trim(),
    pages: pages?.trim(),
    parsed_at: new Date().toISOString(),
    confidence: calculateConfidence('Nature', { venue, volume }),
  };
}

/**
 * Parse inline citation format
 */
function parseInline(text: string): Citation | null {
  const match = text.match(INLINE_PATTERN);
  if (!match) return null;

  const [fullMatch, author, year] = match;

  return {
    format: 'Inline',
    raw: fullMatch,
    authors: [author.trim()],
    year: parseInt(year, 10),
    parsed_at: new Date().toISOString(),
    confidence: 0.6, // Lower confidence for minimal info
  };
}

/**
 * Parse fallback (extract DOI/URL only)
 */
function parseFallback(text: string): Citation | null {
  const doi = extractDOI(text);
  const url = extractURL(text);
  const year = extractYear(text);

  if (!doi && !url) return null;

  return {
    format: 'Unknown',
    raw: text,
    doi,
    url,
    year,
    parsed_at: new Date().toISOString(),
    confidence: 0.4, // Low confidence - minimal parsing
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse author list from various formats
 *
 * Handles: "Smith, J.", "Smith, J., & Doe, A.", "J. Smith and A. Doe"
 */
function parseAuthors(authorsRaw: string): string[] {
  if (!authorsRaw) return [];

  // Replace " and " and " & " with commas for consistent splitting
  const normalized = authorsRaw.replace(/\s+and\s+/gi, ', ').replace(/\s+&\s+/g, ', ');

  // Split by comma
  const authors = normalized
    .split(',')
    .map((a) => a.trim())
    .filter((a) => a.length > 0 && a !== 'et al.' && a !== 'et al');

  return authors;
}

/**
 * Extract DOI from text
 */
function extractDOI(text: string): string | undefined {
  const match = text.match(DOI_PATTERN);
  if (!match) return undefined;

  // Clean up DOI (remove trailing punctuation)
  let doi = match[1] || match[0];
  doi = doi.replace(/[.,;:)\]]+$/, '');

  return doi;
}

/**
 * Extract URL from text
 */
function extractURL(text: string): string | undefined {
  const match = text.match(URL_PATTERN);
  if (!match) return undefined;

  // Clean up URL
  let url = match[0];
  url = url.replace(/[.,;:)\]]+$/, '');

  return url;
}

/**
 * Extract year from text
 */
function extractYear(text: string): number | undefined {
  const match = text.match(YEAR_PATTERN);
  if (!match) return undefined;

  return parseInt(match[0], 10);
}

/**
 * Calculate parsing confidence based on available fields
 */
function calculateConfidence(
  format: CitationFormat,
  fields: {
    doi?: string;
    url?: string;
    venue?: string;
    volume?: string;
  }
): number {
  let confidence = 0.5; // Base confidence for successful format match

  // DOI boosts confidence significantly
  if (fields.doi) {
    confidence += 0.3;
  }

  // URL provides some boost
  if (fields.url) {
    confidence += 0.1;
  }

  // Venue and volume indicate structured citation
  if (fields.venue) {
    confidence += 0.1;
  }

  if (fields.volume) {
    confidence += 0.05;
  }

  // IEEE and APA are more structured than Nature/Inline
  if (format === 'IEEE' || format === 'APA') {
    confidence += 0.05;
  }

  return Math.min(0.95, confidence);
}

/**
 * Count citations by format
 */
function countByFormat(citations: Citation[]): Record<CitationFormat, number> {
  const counts: Record<CitationFormat, number> = {
    APA: 0,
    IEEE: 0,
    Nature: 0,
    MLA: 0,
    Chicago: 0,
    Inline: 0,
    Unknown: 0,
  };

  for (const citation of citations) {
    counts[citation.format]++;
  }

  return counts;
}

/**
 * Normalize citation to consistent format
 *
 * Converts any parsed citation to a standardized format for storage.
 *
 * @param citation - Citation to normalize
 * @returns Normalized citation
 */
export function normalizeCitation(citation: Citation): Citation {
  return {
    ...citation,
    // Clean up authors
    authors: citation.authors?.map((a) => a.trim()),
    // Clean up DOI (remove prefixes)
    doi: citation.doi?.replace(/^(doi:\s*|https?:\/\/doi\.org\/)/i, ''),
    // Ensure consistent URL format
    url: citation.url?.trim(),
  };
}

/**
 * Validate citation completeness
 *
 * Checks if citation has minimum required fields.
 *
 * @param citation - Citation to validate
 * @returns True if citation is complete enough
 */
export function isCompleteCitation(citation: Citation): boolean {
  // Must have at least authors OR title
  const hasIdentity = (citation.authors && citation.authors.length > 0) || citation.title;

  // Must have year
  const hasYear = citation.year && citation.year > 1900 && citation.year <= new Date().getFullYear() + 5;

  // Must have DOI, URL, or venue
  const hasSource = citation.doi || citation.url || citation.venue;

  return !!(hasIdentity && hasYear && hasSource);
}

/**
 * Extract all DOIs from text
 *
 * Useful for finding DOIs in unstructured text.
 *
 * @param text - Text to search
 * @returns Array of DOI strings
 */
export function extractAllDOIs(text: string): string[] {
  const dois: string[] = [];
  const matches = text.matchAll(DOI_PATTERN);

  for (const match of matches) {
    let doi = match[1] || match[0];
    // Clean up DOI
    doi = doi.replace(/^(doi:\s*|https?:\/\/doi\.org\/)/i, '');
    doi = doi.replace(/[.,;:)\]]+$/, '');
    dois.push(doi);
  }

  return dois;
}
