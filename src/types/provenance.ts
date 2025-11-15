/**
 * TypeScript Provenance Type System
 *
 * Defines types for the parameter provenance tracking system based on
 * Nested Learning's multi-level optimization:
 * - PLACEHOLDER (Level 0): Temporary engineering values
 * - INFORMED (Level 1): Research-informed (extrapolated)
 * - VERIFIED (Level 2): Research-verified (peer-reviewed citation)
 *
 * Every simulation parameter must have provenance metadata to track:
 * - Source (research paper, estimation method, or placeholder status)
 * - Confidence (0-1 score)
 * - Sensitivity (impact on outcomes from Monte Carlo)
 * - Validation history (drift monitoring)
 */

/**
 * Provenance level (Nested Learning hierarchy)
 */
export type ProvenanceLevel = 'PLACEHOLDER' | 'INFORMED' | 'VERIFIED';

/**
 * Sensitivity classification from Monte Carlo analysis
 */
export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Core provenance metadata for all parameters
 */
export interface ProvenanceMetadata {
  /** Provenance level (NL hierarchy) */
  type: ProvenanceLevel;

  /** Confidence score (0-1) */
  confidence: number;

  /** When this provenance was created */
  created: string; // ISO 8601 timestamp

  /** Human-readable description of source */
  description?: string;

  /** File and line where parameter is defined */
  location?: {
    file: string;
    line: number;
  };
}

/**
 * PLACEHOLDER provenance (Level 0 - Fast memory)
 *
 * Temporary values used during development before research exists.
 * Must be validated before production deployment.
 */
export interface PlaceholderProvenance extends ProvenanceMetadata {
  type: 'PLACEHOLDER';

  /** Must be validated to INFORMED or VERIFIED */
  needs_validation: true;

  /** Estimation method used */
  estimation_method?: 'guess' | 'industry_standard' | 'ballpark' | 'temporary';

  /** Why this value was chosen */
  rationale?: string;

  /** Target date for validation */
  validation_deadline?: string; // ISO 8601
}

/**
 * INFORMED provenance (Level 1 - Medium memory)
 *
 * Research-informed values extrapolated from related work.
 * Not a direct citation, but grounded in domain knowledge.
 */
export interface InformedProvenance extends ProvenanceMetadata {
  type: 'INFORMED';

  /** Related research (not exact citation) */
  related_sources?: string[];

  /** Extrapolation method */
  method?: string;

  /** Assumptions made in extrapolation */
  assumptions?: string[];

  /** Should be upgraded to VERIFIED if possible */
  upgrade_to_verified?: boolean;
}

/**
 * VERIFIED provenance (Level 2 - Slow memory)
 *
 * Research-verified values with peer-reviewed citations.
 * Gold standard for production parameters.
 */
export interface VerifiedProvenance extends ProvenanceMetadata {
  type: 'VERIFIED';

  /** DOI of source paper */
  doi: string;

  /** Full citation (APA format) */
  citation: string;

  /** Value cited in paper */
  cited_value: number;

  /** Page/section where value found */
  location_in_paper?: string;

  /** When last validated against source */
  last_validated: string; // ISO 8601

  /** Enable drift monitoring */
  drift_monitor: boolean;

  /** LSS threshold for alerts (default: 0.2) */
  drift_threshold?: number;

  /** Zotero item ID (if using Zotero) */
  zotero_id?: string;
}

/**
 * Union type for all provenance types
 */
export type Provenance =
  | PlaceholderProvenance
  | InformedProvenance
  | VerifiedProvenance;

/**
 * Parameter with full provenance metadata
 */
export interface ParameterProvenance {
  /** Parameter name (code identifier) */
  name: string;

  /** Current value */
  value: number;

  /** Units (if applicable) */
  units?: string;

  /** Provenance metadata */
  provenance: Provenance;

  /** Sensitivity from Monte Carlo analysis */
  sensitivity?: {
    level: SensitivityLevel;
    variance: number; // Outcome variance when parameter varied
    last_analyzed: string; // ISO 8601
  };

  /** Validation history */
  history?: ValidationRecord[];
}

/**
 * Validation record for tracking parameter changes
 */
export interface ValidationRecord {
  /** When validation occurred */
  timestamp: string; // ISO 8601

  /** Previous value */
  old_value: number;

  /** New value */
  new_value: number;

  /** Provenance level before/after */
  old_type: ProvenanceLevel;
  new_type: ProvenanceLevel;

  /** Reason for change */
  reason: string;

  /** Who made the change */
  author?: string;
}

/**
 * Provenance database schema
 */
export interface ProvenanceDatabase {
  /** Map of parameter name → provenance */
  parameters: Map<string, ParameterProvenance>;

  /** When database last updated */
  last_updated: string; // ISO 8601

  /** Database schema version */
  schema_version: string;
}

/**
 * Provenance decorator options
 */
export interface ProvenanceDecoratorOptions {
  /** Provenance metadata */
  provenance: Provenance;

  /** Optional tags for categorization */
  tags?: string[];

  /** Optional notes */
  notes?: string;
}

/**
 * Provenance validation result
 */
export interface ProvenanceValidationResult {
  /** Is provenance valid? */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];

  /** Suggested fixes */
  suggestions?: string[];
}

/**
 * Drift detection result
 */
export interface DriftDetectionResult {
  /** Parameter name */
  parameter: string;

  /** Current value */
  current_value: number;

  /** Cited value */
  cited_value: number;

  /** Drift magnitude (LSS) */
  drift: number;

  /** Drift level */
  level: 'NONE' | 'WARNING' | 'ALERT' | 'CRITICAL';

  /** Human-readable message */
  message: string;

  /** When drift detected */
  detected_at: string; // ISO 8601
}

/**
 * Type guard: Check if provenance is PLACEHOLDER
 */
export function isPlaceholder(prov: Provenance): prov is PlaceholderProvenance {
  return prov.type === 'PLACEHOLDER';
}

/**
 * Type guard: Check if provenance is INFORMED
 */
export function isInformed(prov: Provenance): prov is InformedProvenance {
  return prov.type === 'INFORMED';
}

/**
 * Type guard: Check if provenance is VERIFIED
 */
export function isVerified(prov: Provenance): prov is VerifiedProvenance {
  return prov.type === 'VERIFIED';
}

/**
 * Validate provenance metadata
 *
 * @param prov - Provenance to validate
 * @returns Validation result
 */
export function validateProvenance(prov: Provenance): ProvenanceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Common validations
  if (prov.confidence < 0 || prov.confidence > 1) {
    errors.push('Confidence must be between 0 and 1');
  }

  if (!prov.created) {
    errors.push('Created timestamp required');
  }

  // Type-specific validations
  if (isPlaceholder(prov)) {
    if (!prov.needs_validation) {
      errors.push('PLACEHOLDER must have needs_validation: true');
    }

    if (prov.confidence > 0.5) {
      warnings.push('PLACEHOLDER confidence should be low (<0.5)');
    }

    suggestions.push('Upgrade to INFORMED or VERIFIED before production');
  }

  if (isInformed(prov)) {
    if (!prov.method && !prov.related_sources) {
      warnings.push('INFORMED should have method or related_sources');
    }

    if (prov.confidence > 0.7) {
      suggestions.push('Consider upgrading to VERIFIED if citation available');
    }
  }

  if (isVerified(prov)) {
    if (!prov.doi) {
      errors.push('VERIFIED must have DOI');
    }

    if (!prov.citation) {
      errors.push('VERIFIED must have citation');
    }

    if (prov.cited_value === undefined) {
      errors.push('VERIFIED must have cited_value');
    }

    if (!prov.last_validated) {
      errors.push('VERIFIED must have last_validated timestamp');
    }

    if (prov.confidence < 0.9) {
      warnings.push('VERIFIED confidence should be high (≥0.9)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Create a PLACEHOLDER provenance
 */
export function createPlaceholder(
  confidence = 0.3,
  rationale?: string
): PlaceholderProvenance {
  return {
    type: 'PLACEHOLDER',
    confidence,
    created: new Date().toISOString(),
    needs_validation: true,
    estimation_method: 'temporary',
    rationale,
  };
}

/**
 * Create an INFORMED provenance
 */
export function createInformed(
  confidence: number,
  method: string,
  related_sources?: string[]
): InformedProvenance {
  return {
    type: 'INFORMED',
    confidence,
    created: new Date().toISOString(),
    method,
    related_sources,
  };
}

/**
 * Create a VERIFIED provenance
 */
export function createVerified(
  doi: string,
  citation: string,
  cited_value: number,
  confidence = 0.95
): VerifiedProvenance {
  return {
    type: 'VERIFIED',
    confidence,
    created: new Date().toISOString(),
    doi,
    citation,
    cited_value,
    last_validated: new Date().toISOString(),
    drift_monitor: true,
  };
}
