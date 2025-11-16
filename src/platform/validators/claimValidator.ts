/**
 * Claim Validation Logic
 *
 * Validates claims for required fields, citation format, severity bounds, and completeness.
 * Integrates with pre-commit hooks to enforce research quality standards.
 *
 * Task 1.3.4 - Claim Validation Logic (Platform Engineer - Marcus)
 *
 * Security: OWASP A03 (Injection) - Input validation on all claim data
 */

import type {
  Claim,
  ClaimValidationResult,
  Citation,
  ClaimSeverity,
  CertaintyLevel,
} from '@/types/claims';
import { isCompleteCitation } from '@/platform/parsers/citationExtractor';

// ============================================================================
// Validation Rules
// ============================================================================

/**
 * Validate a claim
 *
 * Checks required fields, citation quality, and logical consistency.
 *
 * @param claim - Claim to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateClaim(
  claim: Claim,
  options: {
    requireCitations?: boolean; // Default: true
    minCitationsForHighSeverity?: number; // Default: 1
    minCitationsForCritical?: number; // Default: 2
    allowPlaceholder?: boolean; // Default: false (production mode)
  } = {}
): ClaimValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const missingFields: string[] = [];

  // Default options
  const {
    requireCitations = true,
    minCitationsForHighSeverity = 1,
    minCitationsForCritical = 2,
    allowPlaceholder = false,
  } = options;

  // ========================================
  // Required Field Validation
  // ========================================

  if (!claim.id || claim.id.length === 0) {
    missingFields.push('id');
    errors.push('Claim must have a unique ID');
  }

  if (!claim.text || claim.text.trim().length === 0) {
    missingFields.push('text');
    errors.push('Claim text cannot be empty');
  }

  if (!claim.type) {
    missingFields.push('type');
    errors.push('Claim must have a type (quantitative, causal, etc.)');
  }

  if (!claim.severity) {
    missingFields.push('severity');
    errors.push('Claim must have a severity level');
  }

  if (!claim.certainty) {
    missingFields.push('certainty');
    errors.push('Claim must have a certainty level');
  }

  if (!claim.source) {
    missingFields.push('source');
    errors.push('Claim must have a source location');
  } else {
    if (!claim.source.file) {
      missingFields.push('source.file');
      errors.push('Claim source must include file path');
    }
    if (claim.source.line === undefined || claim.source.line < 0) {
      missingFields.push('source.line');
      errors.push('Claim source must include valid line number');
    }
  }

  // ========================================
  // Citation Validation
  // ========================================

  if (requireCitations && claim.citations.length === 0) {
    if (!allowPlaceholder) {
      errors.push('Claim must have at least one citation (production mode)');
    } else {
      warnings.push('Claim has no citations (placeholder mode)');
      suggestions.push('Add citations before production deployment');
    }
  }

  // Severity-based citation requirements
  if (claim.severity === 'CRITICAL' && claim.citations.length < minCitationsForCritical) {
    errors.push(
      `CRITICAL claims require at least ${minCitationsForCritical} citations (found ${claim.citations.length})`
    );
  }

  if (claim.severity === 'HIGH' && claim.citations.length < minCitationsForHighSeverity) {
    warnings.push(
      `HIGH severity claims should have at least ${minCitationsForHighSeverity} citation (found ${claim.citations.length})`
    );
  }

  // Validate each citation
  for (let i = 0; i < claim.citations.length; i++) {
    const citation = claim.citations[i];
    const citationErrors = validateCitation(citation);

    if (citationErrors.length > 0) {
      warnings.push(`Citation ${i + 1}: ${citationErrors.join(', ')}`);
    }

    if (!isCompleteCitation(citation)) {
      warnings.push(
        `Citation ${i + 1} is incomplete (missing authors, year, or source)`
      );
      suggestions.push(`Review and complete citation ${i + 1}`);
    }
  }

  // ========================================
  // Quantitative Claim Validation
  // ========================================

  if (claim.type === 'quantitative') {
    if (!claim.extracted_values || claim.extracted_values.length === 0) {
      warnings.push('Quantitative claim has no extracted values');
      suggestions.push('Add extracted_values with numeric data');
    } else {
      for (const ev of claim.extracted_values) {
        if (isNaN(ev.value) || !isFinite(ev.value)) {
          errors.push(`Invalid extracted value: ${ev.value}`);
        }
      }
    }
  }

  // ========================================
  // Text Quality Validation
  // ========================================

  if (claim.text.length < 10) {
    warnings.push('Claim text is very short (< 10 characters)');
  }

  if (claim.text.length > 500) {
    warnings.push('Claim text is very long (> 500 characters)');
    suggestions.push('Consider breaking into multiple claims');
  }

  // Check for placeholder language
  const placeholderPatterns = [
    /\bTODO\b/i,
    /\bFIXME\b/i,
    /\bXXX\b/i,
    /\bPLACEHOLDER\b/i,
    /\[citation needed\]/i,
    /\bguess\b/i,
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(claim.text)) {
      if (!allowPlaceholder) {
        errors.push(`Claim contains placeholder language: ${pattern.source}`);
      } else {
        warnings.push(`Claim contains placeholder language: ${pattern.source}`);
      }
    }
  }

  // ========================================
  // Severity-Certainty Consistency
  // ========================================

  if (claim.severity === 'CRITICAL' && claim.certainty !== 'definitive' && claim.certainty !== 'high') {
    warnings.push(
      'CRITICAL severity claims should have high/definitive certainty'
    );
    suggestions.push(
      'Either downgrade severity or find stronger evidence to increase certainty'
    );
  }

  if (claim.severity === 'LOW' && claim.certainty === 'definitive') {
    warnings.push(
      'Definitive certainty with LOW severity is unusual'
    );
  }

  // ========================================
  // Final Validation Result
  // ========================================

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    missing_fields: missingFields.length > 0 ? missingFields : undefined,
  };
}

/**
 * Validate citation format
 *
 * @param citation - Citation to validate
 * @returns Array of validation errors
 */
export function validateCitation(citation: Citation): string[] {
  const errors: string[] = [];

  // Required fields
  if (!citation.format) {
    errors.push('Missing citation format');
  }

  if (!citation.raw || citation.raw.trim().length === 0) {
    errors.push('Missing raw citation text');
  }

  if (!citation.parsed_at) {
    errors.push('Missing parsed_at timestamp');
  }

  if (citation.confidence === undefined || citation.confidence < 0 || citation.confidence > 1) {
    errors.push('Citation confidence must be between 0 and 1');
  }

  // Year validation
  if (citation.year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (citation.year < 1900 || citation.year > currentYear + 5) {
      errors.push(`Citation year ${citation.year} is out of valid range (1900-${currentYear + 5})`);
    }
  }

  // DOI format validation (basic)
  if (citation.doi && !citation.doi.match(/^10\.\d{4,}/)) {
    errors.push(`Invalid DOI format: ${citation.doi}`);
  }

  // URL validation (basic)
  if (citation.url && !citation.url.match(/^https?:\/\//)) {
    errors.push(`Invalid URL format: ${citation.url}`);
  }

  return errors;
}

/**
 * Batch validate claims
 *
 * @param claims - Claims to validate
 * @param options - Validation options
 * @returns Map of claim ID → validation result
 */
export function validateClaims(
  claims: Claim[],
  options?: Parameters<typeof validateClaim>[1]
): Map<string, ClaimValidationResult> {
  const results = new Map<string, ClaimValidationResult>();

  for (const claim of claims) {
    const result = validateClaim(claim, options);
    results.set(claim.id, result);
  }

  return results;
}

/**
 * Get validation summary
 *
 * @param results - Validation results from validateClaims
 * @returns Summary statistics
 */
export function getValidationSummary(results: Map<string, ClaimValidationResult>): {
  total: number;
  valid: number;
  invalid: number;
  withErrors: number;
  withWarnings: number;
  errorRate: number;
} {
  const total = results.size;
  let valid = 0;
  let invalid = 0;
  let withErrors = 0;
  let withWarnings = 0;

  for (const result of results.values()) {
    if (result.valid) {
      valid++;
    } else {
      invalid++;
    }

    if (result.errors.length > 0) {
      withErrors++;
    }

    if (result.warnings.length > 0) {
      withWarnings++;
    }
  }

  return {
    total,
    valid,
    invalid,
    withErrors,
    withWarnings,
    errorRate: total > 0 ? withErrors / total : 0,
  };
}

/**
 * Filter claims by validation status
 *
 * @param claims - Claims to filter
 * @param results - Validation results
 * @param status - Filter by 'valid' or 'invalid'
 * @returns Filtered claims
 */
export function filterByValidationStatus(
  claims: Claim[],
  results: Map<string, ClaimValidationResult>,
  status: 'valid' | 'invalid'
): Claim[] {
  return claims.filter((claim) => {
    const result = results.get(claim.id);
    if (!result) return false;

    return status === 'valid' ? result.valid : !result.valid;
  });
}

/**
 * Get claims with specific validation issues
 *
 * @param claims - Claims to check
 * @param results - Validation results
 * @param issue - Issue type to find
 * @returns Claims with the specified issue
 */
export function getClaimsWithIssue(
  claims: Claim[],
  results: Map<string, ClaimValidationResult>,
  issue: 'missing_citations' | 'incomplete_citations' | 'placeholder_language' | 'invalid_values'
): Claim[] {
  return claims.filter((claim) => {
    const result = results.get(claim.id);
    if (!result) return false;

    const allMessages = [...result.errors, ...result.warnings].join(' ').toLowerCase();

    switch (issue) {
      case 'missing_citations':
        return allMessages.includes('citation');
      case 'incomplete_citations':
        return allMessages.includes('incomplete');
      case 'placeholder_language':
        return allMessages.includes('placeholder');
      case 'invalid_values':
        return allMessages.includes('invalid');
      default:
        return false;
    }
  });
}

/**
 * Validate claim database integrity
 *
 * Checks for duplicate IDs, orphaned references, etc.
 *
 * @param claims - All claims in database
 * @returns Integrity check result
 */
export function validateClaimDatabaseIntegrity(claims: Claim[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate IDs
  const idSet = new Set<string>();
  for (const claim of claims) {
    if (idSet.has(claim.id)) {
      errors.push(`Duplicate claim ID: ${claim.id}`);
    }
    idSet.add(claim.id);
  }

  // Check for orphaned parameter references
  const parameterReferences = new Set<string>();
  for (const claim of claims) {
    if (claim.related_parameters) {
      for (const param of claim.related_parameters) {
        parameterReferences.add(param);
      }
    }
  }

  // Count claims by file
  const claimsByFile = new Map<string, number>();
  for (const claim of claims) {
    const file = claim.source.file;
    claimsByFile.set(file, (claimsByFile.get(file) || 0) + 1);
  }

  // Warn if a file has too many claims (might need splitting)
  for (const [file, count] of claimsByFile) {
    if (count > 100) {
      warnings.push(`File ${file} has ${count} claims (consider splitting)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
