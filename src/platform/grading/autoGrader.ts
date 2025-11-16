/**
 * Grading Automation Utilities
 *
 * Automatically grades research files based on citation verification, claim validation,
 * and severity classification.
 *
 * Integration points:
 * - Claim validation system (existing)
 * - Citation verification client (MCP)
 * - Severity classification rules
 *
 * Grading rubric (mechanical):
 * ```
 * Base score: 100 points
 *
 * Citation verification rate:
 *   90-100%: A (Excellent)
 *   80-89%:  B (Good)
 *   70-79%:  C (Acceptable)
 *   <70%:    D/F (Unacceptable)
 *
 * Penalty framework:
 *   Fabricated citation: -10 points each
 *   Magnitude error 5-20×: -10 to -15 points each
 *   Citation inflation 2-5×: -5 points per instance
 *   Experimental artifact presented as finding: -15 points
 *   Missing citation (HIGH/CRITICAL claims): -5 points
 *   Placeholder language (production mode): -3 points
 * ```
 *
 * Usage:
 * ```typescript
 * const grader = new AutoGrader({
 *   citationClient: mcpClient,
 *   enableLogging: true
 * });
 *
 * const result = await grader.gradeFile('research/paper_20251115.md', claims);
 * // result = { grade: 75, letter: 'C', breakdown: [...] }
 * ```
 *
 * Task: 2.2.1 (Phase 1 Week 2)
 */

import { assertDefined } from '@/simulation/utils/assertions';
import { CitationClient, VerificationResult } from '../mcp/citationClient';
import { validateClaims, ClaimValidationResult } from '../validators/claimValidator';
import type { Claim } from '@/types/claims';

/**
 * Error severity classification
 */
export type ErrorSeverity =
  | 'CRITICAL' // -15 points (fabrication, experimental artifacts)
  | 'HIGH' // -10 points (magnitude errors 5-20×)
  | 'MEDIUM' // -5 points (citation inflation, missing citations)
  | 'LOW'; // -3 points (placeholder language)

/**
 * Error type
 */
export type ErrorType =
  | 'fabricated_citation'
  | 'magnitude_error'
  | 'citation_inflation'
  | 'experimental_artifact'
  | 'missing_citation'
  | 'placeholder_language'
  | 'incomplete_citation'
  | 'invalid_data';

/**
 * Grading error
 */
export interface GradingError {
  /**
   * Error type
   */
  type: ErrorType;

  /**
   * Error severity
   */
  severity: ErrorSeverity;

  /**
   * Penalty points
   */
  penalty: number;

  /**
   * Error description
   */
  description: string;

  /**
   * Claim ID (if applicable)
   */
  claimId?: string;

  /**
   * Source location
   */
  source?: {
    file: string;
    line: number;
  };
}

/**
 * Grading breakdown
 */
export interface GradingBreakdown {
  /**
   * Total claims
   */
  totalClaims: number;

  /**
   * Verified claims
   */
  verifiedClaims: number;

  /**
   * Verification rate (0-1)
   */
  verificationRate: number;

  /**
   * Detected errors
   */
  errors: GradingError[];

  /**
   * Total penalty points
   */
  totalPenalty: number;

  /**
   * Base score
   */
  baseScore: number;
}

/**
 * Grading result
 */
export interface GradingResult {
  /**
   * Final grade (0-100)
   */
  grade: number;

  /**
   * Letter grade
   */
  letter: 'A' | 'B' | 'C' | 'D' | 'F';

  /**
   * Grading breakdown
   */
  breakdown: GradingBreakdown;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Source file
   */
  file: string;
}

/**
 * Auto-grader configuration
 */
export interface AutoGraderConfig {
  /**
   * Citation verification client
   */
  citationClient: CitationClient;

  /**
   * Severity classification rules
   */
  severityRules?: {
    fabricated: number; // Default: -10
    magnitudeError: { min: number; max: number }; // Default: { min: -10, max: -15 }
    citationInflation: number; // Default: -5
    experimentalArtifact: number; // Default: -15
    missingCitation: number; // Default: -5
    placeholder: number; // Default: -3
  };

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Auto-Grader
 *
 * Automatically grades research files.
 */
export class AutoGrader {
  private config: Required<Omit<AutoGraderConfig, 'citationClient' | 'severityRules'>> & {
    citationClient: CitationClient;
    severityRules: Required<NonNullable<AutoGraderConfig['severityRules']>>;
  };
  private gradingCount: number;

  constructor(config: AutoGraderConfig) {
    assertDefined(config.citationClient, {
      location: 'AutoGrader.constructor',
      valueName: 'config.citationClient',
    });

    this.config = {
      citationClient: config.citationClient,
      severityRules: {
        fabricated: config.severityRules?.fabricated ?? -10,
        magnitudeError: config.severityRules?.magnitudeError ?? {
          min: -10,
          max: -15,
        },
        citationInflation: config.severityRules?.citationInflation ?? -5,
        experimentalArtifact:
          config.severityRules?.experimentalArtifact ?? -15,
        missingCitation: config.severityRules?.missingCitation ?? -5,
        placeholder: config.severityRules?.placeholder ?? -3,
      },
      enableLogging: config.enableLogging ?? false,
    };

    this.gradingCount = 0;
  }

  /**
   * Grade research file
   *
   * @param file - File path
   * @param claims - Claims from file
   * @returns Grading result
   */
  public async gradeFile(
    file: string,
    claims: Claim[]
  ): Promise<GradingResult> {
    assertDefined(file, {
      location: 'AutoGrader.gradeFile',
      valueName: 'file',
    });

    assertDefined(claims, {
      location: 'AutoGrader.gradeFile',
      valueName: 'claims',
    });

    this.gradingCount++;

    if (this.config.enableLogging) {
      console.log(`\n📊 AutoGrader: Grading ${file} (${claims.length} claims)`);
    }

    // Step 1: Validate claims
    const validationResults = validateClaims(claims);

    // Step 2: Verify citations
    const verificationResults = await this.verifyCitations(claims);

    // Step 3: Detect errors
    const errors = this.detectErrors(
      claims,
      validationResults,
      verificationResults
    );

    // Step 4: Calculate grade
    const breakdown = this.calculateBreakdown(claims, errors);
    const grade = Math.max(0, breakdown.baseScore - breakdown.totalPenalty);
    const letter = this.gradeToLetter(grade);

    if (this.config.enableLogging) {
      console.log(`📊 AutoGrader: Final grade: ${grade} (${letter})`);
      console.log(`   Verification rate: ${(breakdown.verificationRate * 100).toFixed(1)}%`);
      console.log(`   Errors detected: ${errors.length}`);
      console.log(`   Total penalty: ${breakdown.totalPenalty} points`);
    }

    return {
      grade,
      letter,
      breakdown,
      timestamp: Date.now(),
      file,
    };
  }

  /**
   * Verify citations for all claims
   *
   * @param claims - Claims to verify
   * @returns Map of claim ID → verification results
   */
  private async verifyCitations(
    claims: Claim[]
  ): Promise<Map<string, VerificationResult[]>> {
    const results = new Map<string, VerificationResult[]>();

    for (const claim of claims) {
      const claimResults: VerificationResult[] = [];

      for (const citation of claim.citations) {
        try {
          const result = await this.config.citationClient.verifyCitation(
            claim.text,
            {
              authors: citation.authors ?? [],
              year: citation.year ?? 0,
              doi: citation.doi,
              title: citation.title,
            }
          );

          claimResults.push(result);
        } catch (error) {
          // Verification failed
          claimResults.push({
            verified: false,
            confidence: 0,
            method: 'not_found',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
          });
        }
      }

      results.set(claim.id, claimResults);
    }

    return results;
  }

  /**
   * Detect grading errors
   *
   * @param claims - Claims
   * @param validationResults - Validation results
   * @param verificationResults - Verification results
   * @returns Array of errors
   */
  private detectErrors(
    claims: Claim[],
    validationResults: Map<string, any>,
    verificationResults: Map<string, VerificationResult[]>
  ): GradingError[] {
    const errors: GradingError[] = [];

    for (const claim of claims) {
      const validation = validationResults.get(claim.id);
      const verification = verificationResults.get(claim.id);

      if (!validation || !verification) {
        continue;
      }

      // Check for fabricated citations (not verified)
      for (let i = 0; i < verification.length; i++) {
        const result = verification[i];

        if (!result.verified && result.confidence < 0.3) {
          errors.push({
            type: 'fabricated_citation',
            severity: 'CRITICAL',
            penalty: this.config.severityRules.fabricated,
            description: `Citation ${i + 1} could not be verified`,
            claimId: claim.id,
            source: claim.source,
          });
        }
      }

      // Check for missing citations (HIGH/CRITICAL claims)
      if (
        (claim.severity === 'HIGH' || claim.severity === 'CRITICAL') &&
        claim.citations.length === 0
      ) {
        errors.push({
          type: 'missing_citation',
          severity: 'MEDIUM',
          penalty: this.config.severityRules.missingCitation,
          description: `${claim.severity} claim missing citations`,
          claimId: claim.id,
          source: claim.source,
        });
      }

      // Check for placeholder language
      const placeholderPatterns = [
        /\bTODO\b/i,
        /\bFIXME\b/i,
        /\bPLACEHOLDER\b/i,
        /\[citation needed\]/i,
      ];

      for (const pattern of placeholderPatterns) {
        if (pattern.test(claim.text)) {
          errors.push({
            type: 'placeholder_language',
            severity: 'LOW',
            penalty: this.config.severityRules.placeholder,
            description: `Placeholder language detected: ${pattern.source}`,
            claimId: claim.id,
            source: claim.source,
          });
        }
      }

      // Check for magnitude errors (if extracted values exist)
      if (claim.extracted_values) {
        for (const extracted of claim.extracted_values) {
          // Simple heuristic: Check if value is suspiciously large/small
          if (
            Math.abs(extracted.value) > 1000000 ||
            (Math.abs(extracted.value) < 0.0001 && extracted.value !== 0)
          ) {
            // Calculate penalty based on magnitude
            const penalty =
              this.config.severityRules.magnitudeError.min +
              ((this.config.severityRules.magnitudeError.max -
                this.config.severityRules.magnitudeError.min) *
                0.5);

            errors.push({
              type: 'magnitude_error',
              severity: 'HIGH',
              penalty: Math.round(penalty),
              description: `Suspicious magnitude: ${extracted.value}`,
              claimId: claim.id,
              source: claim.source,
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Calculate grading breakdown
   *
   * @param claims - Claims
   * @param errors - Detected errors
   * @returns Breakdown
   */
  private calculateBreakdown(
    claims: Claim[],
    errors: GradingError[]
  ): GradingBreakdown {
    const totalClaims = claims.length;
    const verifiedClaims = totalClaims - errors.filter(
      (e) => e.type === 'fabricated_citation'
    ).length;
    const verificationRate =
      totalClaims > 0 ? verifiedClaims / totalClaims : 0;

    const totalPenalty = errors.reduce((sum, error) => sum + error.penalty, 0);
    const baseScore = 100;

    return {
      totalClaims,
      verifiedClaims,
      verificationRate,
      errors,
      totalPenalty: Math.abs(totalPenalty), // Convert to positive
      baseScore,
    };
  }

  /**
   * Convert numeric grade to letter grade
   *
   * @param grade - Numeric grade (0-100)
   * @returns Letter grade
   */
  private gradeToLetter(grade: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate grading report (markdown)
   *
   * @param result - Grading result
   * @returns Markdown report
   */
  public generateReport(result: GradingResult): string {
    const { grade, letter, breakdown, file, timestamp } = result;

    let report = `# Research Grading Report\n\n`;
    report += `**File:** ${file}\n`;
    report += `**Date:** ${new Date(timestamp).toISOString()}\n`;
    report += `**Grade:** ${grade}/100 (${letter})\n\n`;

    report += `## Summary\n\n`;
    report += `- **Total Claims:** ${breakdown.totalClaims}\n`;
    report += `- **Verified Claims:** ${breakdown.verifiedClaims}\n`;
    report += `- **Verification Rate:** ${(breakdown.verificationRate * 100).toFixed(1)}%\n`;
    report += `- **Total Penalty:** ${breakdown.totalPenalty} points\n\n`;

    if (breakdown.errors.length > 0) {
      report += `## Detected Issues\n\n`;

      // Group errors by severity
      const bySeverity = new Map<ErrorSeverity, GradingError[]>();
      for (const error of breakdown.errors) {
        const group = bySeverity.get(error.severity) ?? [];
        group.push(error);
        bySeverity.set(error.severity, group);
      }

      for (const severity of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as ErrorSeverity[]) {
        const errors = bySeverity.get(severity);
        if (!errors || errors.length === 0) continue;

        report += `### ${severity} (${errors.length} issues)\n\n`;

        for (const error of errors) {
          report += `- **${error.type}** (${error.penalty} points): ${error.description}\n`;
          if (error.source) {
            report += `  - Source: ${error.source.file}:${error.source.line}\n`;
          }
        }

        report += `\n`;
      }
    } else {
      report += `## ✅ No issues detected\n\n`;
    }

    return report;
  }

  /**
   * Get grading statistics
   *
   * @returns Stats
   */
  public getStats(): {
    gradingCount: number;
  } {
    return {
      gradingCount: this.gradingCount,
    };
  }
}

/**
 * Create auto-grader
 *
 * @param config - Grader configuration
 * @returns AutoGrader instance
 */
export function createAutoGrader(config: AutoGraderConfig): AutoGrader {
  return new AutoGrader(config);
}
