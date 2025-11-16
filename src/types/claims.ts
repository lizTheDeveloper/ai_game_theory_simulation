/**
 * Claim Schema Definitions
 *
 * Types for the Citation Integrity Platform's claim extraction and validation system.
 * Used to parse research markdown files and track claims with their citations.
 *
 * Task 1.3.2 - Claim Schema Definitions (Platform Engineer - Marcus)
 */

/**
 * Citation format types
 */
export type CitationFormat = 'APA' | 'IEEE' | 'Nature' | 'MLA' | 'Chicago' | 'Inline' | 'Unknown';

/**
 * Claim severity (impact on simulation outcomes)
 */
export type ClaimSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Claim type classification
 */
export type ClaimType =
  | 'quantitative' // Numeric claims (e.g., "50% of X")
  | 'qualitative' // Non-numeric claims (e.g., "climate change causes Y")
  | 'causal' // Cause-effect relationships
  | 'correlation' // Statistical correlations
  | 'projection' // Future predictions
  | 'definition' // Terminology definitions
  | 'methodology'; // Research methods

/**
 * Certainty level from claim language
 */
export type CertaintyLevel =
  | 'definitive' // "is", "will", "causes"
  | 'high' // "likely", "probable"
  | 'moderate' // "suggests", "indicates"
  | 'low' // "may", "might", "could"
  | 'speculative'; // "potentially", "possibly"

/**
 * Citation metadata
 *
 * Represents a parsed citation with normalized fields.
 */
export interface Citation {
  /** Citation format detected */
  format: CitationFormat;

  /** Raw citation text as it appears in the document */
  raw: string;

  /** Authors (parsed if possible) */
  authors?: string[];

  /** Publication year */
  year?: number;

  /** Title of paper/book */
  title?: string;

  /** Journal/Conference/Publisher */
  venue?: string;

  /** DOI (if available) */
  doi?: string;

  /** URL (if available) */
  url?: string;

  /** Page numbers (if applicable) */
  pages?: string;

  /** Volume/Issue (if journal) */
  volume?: string;
  issue?: string;

  /** Zotero item ID (if using Zotero) */
  zotero_id?: string;

  /** When citation was parsed */
  parsed_at: string; // ISO 8601

  /** Parsing confidence (0-1) */
  confidence: number;
}

/**
 * Claim metadata
 *
 * Represents a claim extracted from research documentation.
 */
export interface Claim {
  /** Unique ID for this claim */
  id: string;

  /** The claim text */
  text: string;

  /** Claim type */
  type: ClaimType;

  /** Severity (impact on simulation) */
  severity: ClaimSeverity;

  /** Certainty level (from language analysis) */
  certainty: CertaintyLevel;

  /** Supporting citations */
  citations: Citation[];

  /** Source file where claim was found */
  source: {
    file: string;
    line: number;
    section?: string; // Markdown section heading
  };

  /** Extracted values (for quantitative claims) */
  extracted_values?: {
    value: number;
    unit?: string;
    context: string; // Surrounding text
  }[];

  /** Related simulation parameters */
  related_parameters?: string[];

  /** When claim was extracted */
  extracted_at: string; // ISO 8601

  /** Validation status */
  validation?: {
    verified: boolean;
    verified_at?: string; // ISO 8601
    verified_by?: string; // Agent or human
    notes?: string;
  };

  /** Tags for categorization */
  tags?: string[];
}

/**
 * Claim extraction result
 *
 * Result from parsing a research markdown file.
 */
export interface ClaimExtractionResult {
  /** Source file */
  file: string;

  /** Claims extracted */
  claims: Claim[];

  /** Parsing errors */
  errors: ClaimParsingError[];

  /** Warnings */
  warnings: string[];

  /** Statistics */
  stats: {
    total_claims: number;
    by_type: Record<ClaimType, number>;
    by_severity: Record<ClaimSeverity, number>;
    with_citations: number;
    without_citations: number;
  };

  /** When extraction occurred */
  extracted_at: string; // ISO 8601
}

/**
 * Claim parsing error
 */
export interface ClaimParsingError {
  /** Error message */
  message: string;

  /** Line number where error occurred */
  line?: number;

  /** Problematic text */
  text?: string;

  /** Severity of error */
  severity: 'error' | 'warning';
}

/**
 * Citation extraction result
 */
export interface CitationExtractionResult {
  /** Citations found */
  citations: Citation[];

  /** Text that couldn't be parsed as citations */
  unparsed: string[];

  /** Parsing errors */
  errors: string[];

  /** Statistics */
  stats: {
    total: number;
    by_format: Record<CitationFormat, number>;
    with_doi: number;
    with_url: number;
    avg_confidence: number;
  };
}

/**
 * Claim validation result
 */
export interface ClaimValidationResult {
  /** Is claim valid? */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];

  /** Suggested fixes */
  suggestions?: string[];

  /** Missing required fields */
  missing_fields?: string[];
}

/**
 * Claim detection result
 *
 * Result from detecting claims in streaming text or existing documents.
 */
export interface ClaimDetectionResult {
  /** Candidate claims detected */
  candidates: ClaimCandidate[];

  /** Detection confidence threshold used */
  threshold: number;

  /** Statistics */
  stats: {
    total_candidates: number;
    high_confidence: number; // >= 0.8
    medium_confidence: number; // 0.5-0.8
    low_confidence: number; // < 0.5
  };

  /** When detection occurred */
  detected_at: string; // ISO 8601
}

/**
 * Claim candidate
 *
 * A potential claim detected by heuristics, requiring review.
 */
export interface ClaimCandidate {
  /** Candidate text */
  text: string;

  /** Detection confidence (0-1) */
  confidence: number;

  /** Likely claim type */
  likely_type: ClaimType;

  /** Detection method */
  method: 'pattern' | 'statistical' | 'ml' | 'heuristic';

  /** Pattern(s) that matched */
  patterns?: string[];

  /** Source location */
  source: {
    file?: string;
    line?: number;
    offset?: number; // Character offset for streaming text
  };

  /** Extracted values (if quantitative) */
  extracted_values?: {
    value: number;
    unit?: string;
  }[];

  /** Needs human review? */
  needs_review: boolean;

  /** Suggested severity */
  suggested_severity?: ClaimSeverity;
}

/**
 * Claim drift detection result
 *
 * Result from comparing claimed values to cited sources.
 */
export interface ClaimDriftResult {
  /** Claim ID */
  claim_id: string;

  /** Claimed value */
  claimed_value: number;

  /** Cited value (from source paper) */
  cited_value: number;

  /** Drift magnitude (LSS) */
  drift: number;

  /** Drift level */
  level: 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL';

  /** Human-readable message */
  message: string;

  /** Citation that was checked */
  citation: Citation;

  /** When drift detected */
  detected_at: string; // ISO 8601

  /** Suggested action */
  action: 'none' | 'review' | 'update' | 'alert';
}

/**
 * Claim database schema
 */
export interface ClaimDatabase {
  /** Map of claim ID → claim */
  claims: Map<string, Claim>;

  /** Map of file → claims */
  by_file: Map<string, string[]>; // file → claim IDs

  /** Map of parameter → claims */
  by_parameter: Map<string, string[]>; // parameter name → claim IDs

  /** When database last updated */
  last_updated: string; // ISO 8601

  /** Database schema version */
  schema_version: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if claim is quantitative
 */
export function isQuantitativeClaim(claim: Claim): boolean {
  return claim.type === 'quantitative' && (claim.extracted_values?.length ?? 0) > 0;
}

/**
 * Type guard: Check if claim has citations
 */
export function hasCitations(claim: Claim): boolean {
  return claim.citations.length > 0;
}

/**
 * Type guard: Check if claim is verified
 */
export function isVerifiedClaim(claim: Claim): boolean {
  return claim.validation?.verified ?? false;
}

/**
 * Type guard: Check if citation has DOI
 */
export function hasDOI(citation: Citation): boolean {
  return !!citation.doi && citation.doi.length > 0;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique claim ID
 */
export function generateClaimId(file: string, line: number): string {
  const timestamp = Date.now();
  const fileHash = file.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'unknown';
  return `claim_${fileHash}_${line}_${timestamp}`;
}

/**
 * Determine claim severity from type and certainty
 */
export function inferSeverity(type: ClaimType, certainty: CertaintyLevel): ClaimSeverity {
  // Causal claims are high severity
  if (type === 'causal') {
    return certainty === 'definitive' || certainty === 'high' ? 'CRITICAL' : 'HIGH';
  }

  // Quantitative claims are medium-high severity
  if (type === 'quantitative') {
    return certainty === 'definitive' ? 'HIGH' : 'MEDIUM';
  }

  // Projections depend on certainty
  if (type === 'projection') {
    if (certainty === 'definitive') return 'HIGH';
    if (certainty === 'high') return 'MEDIUM';
    return 'LOW';
  }

  // Definitions and methodology are typically low severity
  if (type === 'definition' || type === 'methodology') {
    return 'LOW';
  }

  // Default: medium
  return 'MEDIUM';
}

/**
 * Calculate claim confidence from citation quality
 */
export function calculateClaimConfidence(citations: Citation[]): number {
  if (citations.length === 0) return 0.1;

  const avgCitationConfidence =
    citations.reduce((sum, c) => sum + c.confidence, 0) / citations.length;

  // Boost confidence if we have DOIs
  const doiBoost = citations.filter(hasDOI).length / citations.length;

  return Math.min(0.95, avgCitationConfidence * (1 + doiBoost * 0.2));
}
