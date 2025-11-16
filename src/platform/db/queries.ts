/**
 * Optimized Database Queries
 *
 * Production-optimized queries with:
 * - Prepared statements (prevents SQL injection + performance)
 * - Proper index usage
 * - Query result caching
 * - Batch operations
 * - N+1 query prevention
 */

import { DatabaseClient } from './client';
import { RedisCache } from '../cache/redisCache';

export interface Parameter {
  id: string;
  name: string;
  value: number;
  cited_value: number | null;
  citation_id: string | null;
  level: number;
  last_updated_at: Date;
}

export interface Citation {
  id: string;
  doi: string | null;
  title: string;
  verified: boolean;
  verification_confidence: number | null;
}

export interface Claim {
  id: string;
  claim_text: string;
  severity: string;
  verified: boolean;
  source_agent: string | null;
  created_at: Date;
}

export interface LSSEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  lss_value: number;
  severity: string;
  resolved: boolean;
  created_at: Date;
}

/**
 * Optimized queries class
 */
export class OptimizedQueries {
  constructor(
    private db: DatabaseClient,
    private cache?: RedisCache
  ) {}

  // ==========================================================================
  // Parameter Queries
  // ==========================================================================

  /**
   * Get parameter by name (with caching)
   */
  async getParameterByName(name: string): Promise<Parameter | null> {
    const cacheKey = `param:${name}`;

    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get<Parameter>(cacheKey);
      if (cached) return cached;
    }

    // Query database
    const result = await this.db.query<Parameter>(
      `SELECT id, name, value, cited_value, citation_id, level, last_updated_at
       FROM parameters
       WHERE name = $1
       LIMIT 1`,
      [name],
      { name: 'get_parameter_by_name' }
    );

    const param = result.rows[0] || null;

    // Cache result
    if (param && this.cache) {
      await this.cache.set(cacheKey, param, 300); // 5 minutes
    }

    return param;
  }

  /**
   * Get parameters with drift (optimized with index)
   */
  async getParametersWithDrift(threshold = 0.2): Promise<Parameter[]> {
    const result = await this.db.query<Parameter>(
      `SELECT p.id, p.name, p.value, p.cited_value, p.citation_id, p.level, p.last_updated_at
       FROM parameters p
       WHERE p.cited_value IS NOT NULL
         AND ABS(p.value - p.cited_value) / NULLIF(p.cited_value, 0) > $1
       ORDER BY ABS(p.value - p.cited_value) / NULLIF(p.cited_value, 0) DESC
       LIMIT 100`,
      [threshold],
      { name: 'get_parameters_with_drift' }
    );

    return result.rows;
  }

  /**
   * Batch upsert parameters (efficient bulk insert)
   */
  async batchUpsertParameters(
    params: Array<{ name: string; value: number; cited_value?: number; level: number }>
  ): Promise<void> {
    if (params.length === 0) return;

    // Build VALUES clause for batch insert
    const values: any[] = [];
    const placeholders: string[] = [];

    params.forEach((param, idx) => {
      const offset = idx * 4;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      values.push(param.name, param.value, param.cited_value || null, param.level);
    });

    await this.db.query(
      `INSERT INTO parameters (name, value, cited_value, level)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (name, source_file) DO UPDATE
       SET value = EXCLUDED.value,
           cited_value = EXCLUDED.cited_value,
           last_updated_at = NOW()`,
      values,
      { name: 'batch_upsert_parameters' }
    );

    // Invalidate cache
    if (this.cache) {
      for (const param of params) {
        await this.cache.delete(`param:${param.name}`);
      }
    }
  }

  // ==========================================================================
  // Citation Queries
  // ==========================================================================

  /**
   * Get citation by DOI (with caching)
   */
  async getCitationByDOI(doi: string): Promise<Citation | null> {
    const cacheKey = `citation:doi:${doi}`;

    if (this.cache) {
      const cached = await this.cache.get<Citation>(cacheKey);
      if (cached) return cached;
    }

    const result = await this.db.query<Citation>(
      `SELECT id, doi, title, verified, verification_confidence
       FROM citations
       WHERE doi = $1
       LIMIT 1`,
      [doi],
      { name: 'get_citation_by_doi' }
    );

    const citation = result.rows[0] || null;

    if (citation && this.cache) {
      await this.cache.set(cacheKey, citation, 3600); // 1 hour
    }

    return citation;
  }

  /**
   * Get unverified citations (optimized with partial index)
   */
  async getUnverifiedCitations(limit = 100): Promise<Citation[]> {
    const result = await this.db.query<Citation>(
      `SELECT id, doi, title, verified, verification_confidence
       FROM citations
       WHERE verified = FALSE
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
      { name: 'get_unverified_citations' }
    );

    return result.rows;
  }

  /**
   * Batch verify citations (efficient update)
   */
  async batchVerifyCitations(
    verifications: Array<{ id: string; verified: boolean; confidence: number }>
  ): Promise<void> {
    if (verifications.length === 0) return;

    // Use UPDATE FROM for batch update
    const ids = verifications.map((v) => v.id);
    const verified = verifications.map((v) => v.verified);
    const confidences = verifications.map((v) => v.confidence);

    await this.db.query(
      `UPDATE citations c
       SET verified = v.verified,
           verification_confidence = v.confidence,
           verified_at = NOW()
       FROM (
         SELECT UNNEST($1::uuid[]) AS id,
                UNNEST($2::boolean[]) AS verified,
                UNNEST($3::numeric[]) AS confidence
       ) AS v
       WHERE c.id = v.id`,
      [ids, verified, confidences],
      { name: 'batch_verify_citations' }
    );
  }

  // ==========================================================================
  // Claim Queries
  // ==========================================================================

  /**
   * Get claims requiring review (optimized with partial index)
   */
  async getClaimsRequiringReview(limit = 50): Promise<Claim[]> {
    const result = await this.db.query<Claim>(
      `SELECT id, claim_text, severity, verified, source_agent, created_at
       FROM claims
       WHERE review_status = 'PENDING'
          OR (verified = FALSE AND severity IN ('CORE_ASSUMPTION', 'ARCHITECTURAL_DECISION'))
       ORDER BY
         CASE severity
           WHEN 'CORE_ASSUMPTION' THEN 1
           WHEN 'ARCHITECTURAL_DECISION' THEN 2
           WHEN 'PARAMETER_JUSTIFICATION' THEN 3
           ELSE 4
         END,
         created_at DESC
       LIMIT $1`,
      [limit],
      { name: 'get_claims_requiring_review' }
    );

    return result.rows;
  }

  /**
   * Search claims by text (uses trigram index)
   */
  async searchClaims(searchText: string, limit = 20): Promise<Claim[]> {
    const result = await this.db.query<Claim>(
      `SELECT id, claim_text, severity, verified, source_agent, created_at,
              similarity(claim_text, $1) AS similarity_score
       FROM claims
       WHERE claim_text % $1  -- Trigram similarity operator
       ORDER BY similarity_score DESC
       LIMIT $2`,
      [searchText, limit],
      { name: 'search_claims' }
    );

    return result.rows;
  }

  // ==========================================================================
  // LSS Event Queries
  // ==========================================================================

  /**
   * Get active LSS alerts (optimized with partial index)
   */
  async getActiveLSSAlerts(severity?: string): Promise<LSSEvent[]> {
    const sql = severity
      ? `SELECT id, event_type, entity_type, entity_id, lss_value, severity, created_at
         FROM lss_events
         WHERE resolved = FALSE AND severity = $1
         ORDER BY
           CASE severity
             WHEN 'CRITICAL' THEN 1
             WHEN 'ERROR' THEN 2
             WHEN 'WARNING' THEN 3
             ELSE 4
           END,
           lss_value DESC,
           created_at DESC
         LIMIT 100`
      : `SELECT id, event_type, entity_type, entity_id, lss_value, severity, created_at
         FROM lss_events
         WHERE resolved = FALSE
         ORDER BY
           CASE severity
             WHEN 'CRITICAL' THEN 1
             WHEN 'ERROR' THEN 2
             WHEN 'WARNING' THEN 3
             ELSE 4
           END,
           lss_value DESC,
           created_at DESC
         LIMIT 100`;

    const result = await this.db.query<LSSEvent>(
      sql,
      severity ? [severity] : [],
      { name: 'get_active_lss_alerts' }
    );

    return result.rows;
  }

  /**
   * Resolve LSS alerts in batch
   */
  async resolveLSSAlerts(ids: string[], resolvedBy: string): Promise<void> {
    await this.db.query(
      `UPDATE lss_events
       SET resolved = TRUE,
           resolved_by = $2,
           resolved_at = NOW()
       WHERE id = ANY($1)`,
      [ids, resolvedBy],
      { name: 'resolve_lss_alerts' }
    );
  }

  // ==========================================================================
  // Analytics Queries
  // ==========================================================================

  /**
   * Get provenance health summary (materialized view candidate)
   */
  async getProvenanceHealthSummary(): Promise<{
    total_parameters: number;
    parameters_with_citation: number;
    parameters_drifted: number;
    avg_drift_ratio: number;
  }> {
    const cacheKey = 'provenance:health:summary';

    if (this.cache) {
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) return cached;
    }

    const result = await this.db.query(
      `SELECT
         COUNT(*) AS total_parameters,
         COUNT(citation_id) AS parameters_with_citation,
         COUNT(*) FILTER (
           WHERE cited_value IS NOT NULL
             AND ABS(value - cited_value) / NULLIF(cited_value, 0) > 0.2
         ) AS parameters_drifted,
         AVG(
           ABS(value - cited_value) / NULLIF(cited_value, 0)
         ) FILTER (WHERE cited_value IS NOT NULL) AS avg_drift_ratio
       FROM parameters`,
      [],
      { name: 'get_provenance_health_summary' }
    );

    const summary = result.rows[0];

    if (this.cache) {
      await this.cache.set(cacheKey, summary, 60); // 1 minute
    }

    return summary;
  }

  /**
   * Get verification metrics
   */
  async getVerificationMetrics(): Promise<{
    total_citations: number;
    verified_citations: number;
    avg_confidence: number;
    pending_verifications: number;
  }> {
    const result = await this.db.query(
      `SELECT
         COUNT(*) AS total_citations,
         COUNT(*) FILTER (WHERE verified = TRUE) AS verified_citations,
         AVG(verification_confidence) FILTER (WHERE verified = TRUE) AS avg_confidence,
         COUNT(*) FILTER (WHERE verified = FALSE) AS pending_verifications
       FROM citations`,
      [],
      { name: 'get_verification_metrics' }
    );

    return result.rows[0];
  }

  // ==========================================================================
  // Query Performance Monitoring
  // ==========================================================================

  /**
   * Get slow queries from pg_stat_statements
   */
  async getSlowQueries(limit = 20): Promise<any[]> {
    const result = await this.db.query(
      `SELECT
         query,
         calls,
         total_exec_time,
         mean_exec_time,
         max_exec_time,
         rows
       FROM pg_stat_statements
       WHERE query NOT LIKE '%pg_stat_statements%'
       ORDER BY mean_exec_time DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Get table sizes
   */
  async getTableSizes(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT
         schemaname,
         tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
         pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
       FROM pg_tables
       WHERE schemaname = 'public'
       ORDER BY size_bytes DESC`
    );

    return result.rows;
  }
}
